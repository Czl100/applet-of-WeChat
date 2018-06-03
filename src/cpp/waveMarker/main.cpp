#include <opencv2/opencv.hpp>
#include <opencv2/core/eigen.hpp>

#include <iostream>
#include<vector>
#include<cmath>
#include"transf.h"

using namespace std;
using namespace cv;

const int mysgn(float& data);
const double mymean(const cv::Mat& mdata);

const int extractAlgorithm(const Mat& _src);
void extract(cv::Mat& src, std::vector<int>& waterDst, const unsigned int Key, const int& layTransf, int lengthOfId);
void embedAlgorithm(Mat& _src, const int water, const int& t);		//Ƕ��ˮӡ
void embed(const string& infile, const std::string& outfile, unsigned int Key, long long watersrc, int lengthOfId, int strengthEmbed, int layTransf);

void test2(){
	float data[4] = {23.3,-4121,298,900};
	Mat _m(2,2,CV_32F,data);				//����ͬһ��ַ
	_m.at<float>(0, 0) = 3.1;
	cout << _m << endl;	
}

void test(){
	Mat src = imread("peppers.bmp");
	
	namedWindow("src", WINDOW_NORMAL);
	imshow("src", src);
	waitKey(0);
	//----------------------------
	IplImage *pSrc = cvLoadImage("test.jpg");
	cvNamedWindow("src", WINDOW_NORMAL);
	cvShowImage("src", pSrc);
	waitKey(0);
	//*/
	float valuecol[] = { 1,1,3 };
	float valuerow[] = { 2,3,3 };
	cv::Ptr<CvMat> Q = cvCreateMatHeader(3, 1, CV_32FC1);
	cvInitMatHeader(Q, 3, 1, CV_32FC1, valuecol);
	cv::Ptr<CvMat> R = cvCreateMatHeader(3, 3, CV_32FC1);
	cvInitMatHeader(R, 1, 3, CV_32FC1, valuerow);
	
	cv::Ptr<CvMat> dst = cvCreateMat(3, 3, CV_32FC1);	
	
	Mat temp(Q->rows, Q->cols, CV_32F, Q->data.fl);
	cout << temp << endl;
	Mat temp1(R->rows, R->cols, CV_32F, R->data.fl);
	cout << temp1 << endl;
	Mat temp2(dst->rows, dst->cols, CV_32F, dst->data.fl);
	temp2 = temp*temp1;
	cout << temp2 << endl;
}

void funcT(const string& infile,int key){
	cv::Mat src_t = imread(infile, CV_LOAD_IMAGE_ANYDEPTH | CV_LOAD_IMAGE_ANYCOLOR);	//src.type()==CV_8UC3
	if (src_t.empty())		throw;
	std::vector<int> waterDst(64);	
	std::vector<int>::iterator ptr = waterDst.end();
	long long valueId = 0;

	int i = waterDst.size()-1;
	extract(src_t, waterDst,key,1,64);

	//������תʮ���ƣ�waterDst��λ����ǵ�λ����
	for (; i >= 0; i--, ptr--){
		if (waterDst[i] == 0)	continue;
		valueId =  waterDst[i] * pow(2, i) + valueId;
	}
}

int main(){
	const std::string infile = "lena.jpg";
	const std::string outfile = "2222.jpg";
	int key = 13312;
	int Q = 10;			//Ƕ��ǿ��

	long long valueId = 121542;
	//embed(infile,outfile,key,valueId,64,10,1);
	funcT(outfile, key-1);
	//vector<int> data(4);
	//data.pop_back();
	//data.insert();
}

void embed(const string& infile, const std::string& outfile, unsigned int Key, long long watersrc, int lengthOfId, int strengthEmbed, int layTransf){
	cv::Mat src = imread(infile, CV_LOAD_IMAGE_ANYDEPTH | CV_LOAD_IMAGE_ANYCOLOR);	//src.type()==CV_8UC3		
	if (src.empty())		throw;

	std::vector<cv::Mat> BGR;
	split(src, BGR);							//�����Ƿ񿽱�	
	Mat& srcB = BGR[0];							//channel==1;srcB���ݰ������У���������Ϊuchar,srcB.type()==CV_8U		

	cv::Mat srcBfloat;
	srcB.convertTo(srcBfloat, CV_32FC1);		//����	
	namedWindow("src0", WINDOW_NORMAL);
	imshow("src0", src);
	//--С���任
	mydwt(srcBfloat, layTransf);				//��srcͼ����DWT��û�п���,�õ�ϵ�����������𣿣���
	//cout << "srcB1:\n" << srcB << endl;

	//--��ȡROI,û�п���
	CvSize sizeLL;
	sizeLL.height = srcBfloat.rows >> layTransf;
	sizeLL.width = srcBfloat.cols >> layTransf;
	Rect rectLL(0, 0, sizeLL.width, sizeLL.height);
	Mat srcLL(srcBfloat, rectLL);		//minValue=-144,maxValue=**;��������

	//--��������2*4����ͼ��	
	int _W = 4, _H = 2;
	int lengthOfwater = 0;	
	int i = 0, j = 0;	 			
	int numBlock=floor(srcLL.rows / _H) * floor(srcLL.cols / _W);	//��Ƕˮӡ�ĳ���

	//ˮӡ��ֵ������Ƶ		
	int spread = floor(numBlock / lengthOfId);						//��Ƶ����
	std::vector<int> waterSpread(spread*lengthOfId,-1);			//��ʼ��Ϊ5
	uchar waterTem = 0;
	int count = 0;
	int countWrite = spread;
	int subIndex = 0;
	srand((Key*2000000)%4294967200);
	subIndex =rand() % (spread*lengthOfId);	
	while (count<lengthOfId){							//����ÿһ���鶼Ƕ
		count++;
		if (watersrc == 0)	waterTem = 0;
		else waterTem   = watersrc & 0x0000000000000001;
		for (;countWrite>0; countWrite--){						
			while ((subIndex >= spread*lengthOfId) || subIndex<0 || (waterSpread[subIndex] != -1)){
				subIndex++;
				if ( subIndex>=spread*lengthOfId )	subIndex = 0;
			}
			waterSpread[subIndex++] = waterTem;
		}
		countWrite = spread;
		if(watersrc>=0)	watersrc = watersrc >> 1;
		else watersrc = 0;
	}

	//--ˮƽ����
	std::vector<int>::iterator waterP = waterSpread.begin();	

	for (j = 0; j <= srcLL.rows-_H; j += _H){
		for (i = 0; i <= srcLL.cols - _W && waterP != waterSpread.end(); i += _W){
			Rect _rectQR(i, j, _W, _H);
			Mat _srcSub(srcLL, _rectQR);							//����
			embedAlgorithm(_srcSub, *(waterP++), strengthEmbed);	//Ƕ��
			lengthOfwater++;
		}
	}

	//--srcBfloat���任IDWT
	/*IplImage *psrcB = (IplImage *)&IplImage(srcBfloat);			//����
	IDWT(psrcB, layTransf);*/
	myidwt(srcBfloat, layTransf);

	//-ת��ΪCV_8UC3���ϲ�ͨ��
	double minRange = 0, maxRange = 0;
	minMaxIdx(srcBfloat, &minRange, &maxRange);
	//srcBfloat.convertTo(srcB, CV_8UC1, 255.0 / (maxRange - minRange), -(minRange*255.0)/(maxRange-minRange));
	srcBfloat.convertTo(srcB, CV_8UC1);
	minMaxIdx(srcB, &minRange, &maxRange);
	namedWindow("srcBfloat", WINDOW_NORMAL);
	imshow("srcBfloat", srcB);

	merge(BGR, src);
	namedWindow("dst", WINDOW_NORMAL);
	imshow("dst", src);

	imwrite(outfile, src);

	//waitKey();
	//return;
}

//--��ȡ--������Mat���͵�RGB
void extract(cv::Mat& src, std::vector<int>& waterDst, const unsigned int Key, const int& layTransf, int lengthOfId)
{
	std::vector<cv::Mat> BGR;
	split(src, BGR);									//�����Ƿ񿽱�	
	Mat& srcB = BGR[0];									//channel==1;srcB���ݰ������У���������Ϊuchar	
	
	cv::Mat srcBfloat;
	srcB.convertTo(srcBfloat, CV_32FC1);				//����	
	double minRange = 0, maxRange = 0;
	minMaxIdx(srcBfloat, &minRange, &maxRange);

	//--С���任	
	mydwt(srcBfloat, layTransf);						//��srcͼ����DWT��û�п���,�õ�ϵ�����������𣿣���	

	//--��ȡROI,û�п���
	CvSize sizeLL;
	sizeLL.height = srcBfloat.rows >> layTransf;
	sizeLL.width = srcBfloat.cols >> layTransf;
	Rect rectLL(0, 0, sizeLL.width, sizeLL.height);
	Mat srcLL(srcBfloat, rectLL);
		
	//--��������2*4����ͼ��
	int _W = 4, _H = 2;
	CvSize subWinSize(_W, _H);
	int i = 0, j = 0, waterTem = 0;
	int lengthOfwater = 0;			//��ˮӡ�Ŀ�ĸ���	
	std::vector<int> waterAll;	
	int waterIndex = 0;

	//--ˮƽ����,��ȡ
	for (j = 0; j <= srcLL.rows - subWinSize.height; j += _H){
		for (i = 0; i <= srcLL.cols - subWinSize.width; i += _W){
			Rect _rectQR(i, j, subWinSize.width, subWinSize.height);
			Mat _srcSub(srcLL, _rectQR);							//����
			waterTem=extractAlgorithm(_srcSub);						//��ȡ
			waterAll.push_back( waterTem);
			lengthOfwater++;
		}
	}

	//--�ָ�˳����Ƶ����
	int numBlock = floor(srcLL.rows / _H) * floor(srcLL.cols / _W);	//��Ƕˮӡ�ĳ���
	int spread = floor(numBlock / lengthOfId);
	waterIndex = 0;
	int numOf0 = 0, numOf1 = 0;
	int numWaterGet = 0;											//��ȡ������ˮӡ����
	int subIndex = -1;
	srand((Key * 2000000) % 4294967200);
	subIndex = rand() % (spread*lengthOfId);
	for (i = 0; i < lengthOfwater; i++){		
		while (waterAll[subIndex] == -1 || subIndex>=spread*lengthOfId || subIndex<0){		
			subIndex++;
			if (subIndex>=spread*lengthOfId)
				subIndex = 0;
		}		
		if (waterAll[subIndex]==0)			numOf0++;
		else if (waterAll[subIndex]==1) 	numOf1++;
		else  throw;
		waterAll[subIndex] = -1;
		if ( (i+1)%spread==0 ){
			if (numOf0 >= numOf1)	waterDst[waterIndex++] = 0;
			else					waterDst[waterIndex++] = 1;
			numOf0 = 0; numOf1 = 0; numWaterGet++;
		}
		if (numWaterGet == lengthOfId)	break;
	}
}

//4*2�Ŀ�
void embedAlgorithm(Mat& _src,const int water,const int& t){	
	//--�ٷֳ�2*2��		
	//Mat dataA(_src, rectA);	
	Mat dataA(_src, Range(0,2),Range(0,2));			//dataA�ĵ�ַ��_src��ͬ��dataB��ͬ
	Mat dataB(_src, Range(0, 2), Range(2, 4));
	int rows = dataA.rows;
	int cols = dataA.cols;

	double m1 = mymean(dataA);
	double m2 = mymean(dataB);
	double m = (m1+m2) / 2;
	
	if (water==1){			//(m1>= m2)
		if (m1>= m2){
			return;
		}
		//--�޸�dataA
		if (dataA.isContinuous()){
			rows = 1;
			cols = dataA.cols*dataA.rows*dataA.channels();
		}		
		for (int i = 0; i < rows; i++){
			float* pSrc = dataA.ptr<float>(i);		//���ͣ�����
			for (int j = 0; j < cols; j++){				
				*(pSrc + j) = ( abs(*(pSrc+j)) + (m-m1+t)) * mysgn(*(pSrc+j));
			}
		}
		//--�޸�dataB
		if (dataB.isContinuous()){
			rows = 1;
			cols = dataB.cols*dataB.rows*dataB.channels();
		}		
		for (int i = 0; i < rows; i++){
			float* pSrc = dataB.ptr<float>(i);
			for (int j = 0; j < cols; j++){				
				*(pSrc + j) = (abs(*(pSrc + j)) - (m2 - m + t)) * mysgn(*(pSrc + j));
			}
		}
	}
	else if (water == 0){			//m1<m2
		if (m1 < m2){
			return;
		}
		//--�޸�dataA
		if (dataA.isContinuous()){
			rows = 1;
			cols = dataA.cols*dataA.rows*dataA.channels();
		}
		for (int i = 0; i < rows; i++){
			float* pSrc = dataA.ptr<float>(i);
			for (int j = 0; j < cols; j++){				
				*(pSrc+j) = (abs(*(pSrc + j)) - (m1 - m + t)) * mysgn(*(pSrc + j));
			}
		}
		//--�޸�dataB
		if (dataB.isContinuous()){
			rows = 1;
			cols = dataB.cols*dataB.rows*dataB.channels();
		}
		for (int i = 0; i < rows; i++){
			float* pSrc = dataB.ptr<float>(i);	//uchar* ???������ʧ
			for (int j = 0; j < cols; j++){
				*(pSrc + j) = (abs(*(pSrc + j)) + (m - m2 + t)) *mysgn(*(pSrc + j));
			}
		}
	}
	else{
		std::cout << "water is not 0 or 1\n";
		return;
	}
}

const int extractAlgorithm(const Mat& _src)
{
	Mat dataA(_src, Range(0, 2), Range(0, 2));			//dataA�ĵ�ַ��_src��ͬ��dataB��ͬ
	Mat dataB(_src, Range(0, 2), Range(2, 4));

	int water = 0;
	double m1 = mymean(dataA);
	double m2 = mymean(dataB);

	if (m1 >= m2)			//water == 1
		water = 1;	
	else
		water = 0;
	return water;
}

const int mysgn(float& data){
	if (data >= 0)	return 1;
	else return -1;
}

//�������ֵ��ֵ
const double mymean(const cv::Mat& mdata){
	int i = 0, j = 0;
	float sum = 0;
	/*if (mdata.isContinuous()){
		rows = 1;
		cols = dataA.cols*dataA.rows*dataA.channels();
	}*/
	for ( i = 0; i < mdata.rows; i++){
		const float* pSrc = mdata.ptr<float>(i);
		for (j = 0; j < mdata.cols; j++){
			if (*(pSrc + j) < 0)	sum += (  abs(*(pSrc + j))  );
			else	 sum += (   *(pSrc + j) );
		}
	}
	float mymean = sum / (mdata.rows*mdata.cols);
	return mymean;
}