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
void embedAlgorithm(Mat& _src, const int water, const int& t);		//嵌入水印
void embed(const string& infile, const std::string& outfile, unsigned int Key, long long watersrc, int lengthOfId, int strengthEmbed, int layTransf);

void test2(){
	float data[4] = {23.3,-4121,298,900};
	Mat _m(2,2,CV_32F,data);				//共享同一地址
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

	//二进制转十进制，waterDst低位存的是低位数据
	for (; i >= 0; i--, ptr--){
		if (waterDst[i] == 0)	continue;
		valueId =  waterDst[i] * pow(2, i) + valueId;
	}
}

int main(){
	const std::string infile = "lena.jpg";
	const std::string outfile = "2222.jpg";
	int key = 13312;
	int Q = 10;			//嵌入强度

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
	split(src, BGR);							//数据是否拷贝	
	Mat& srcB = BGR[0];							//channel==1;srcB数据按行排列，数据类型为uchar,srcB.type()==CV_8U		

	cv::Mat srcBfloat;
	srcB.convertTo(srcBfloat, CV_32FC1);		//拷贝	
	namedWindow("src0", WINDOW_NORMAL);
	imshow("src0", src);
	//--小波变换
	mydwt(srcBfloat, layTransf);				//在src图上做DWT，没有拷贝,得到系数都是正数吗？？？
	//cout << "srcB1:\n" << srcB << endl;

	//--提取ROI,没有拷贝
	CvSize sizeLL;
	sizeLL.height = srcBfloat.rows >> layTransf;
	sizeLL.width = srcBfloat.cols >> layTransf;
	Rect rectLL(0, 0, sizeLL.width, sizeLL.height);
	Mat srcLL(srcBfloat, rectLL);		//minValue=-144,maxValue=**;考虑正负

	//--滑动窗口2*4遍历图像	
	int _W = 4, _H = 2;
	int lengthOfwater = 0;	
	int i = 0, j = 0;	 			
	int numBlock=floor(srcLL.rows / _H) * floor(srcLL.cols / _W);	//可嵌水印的长度

	//水印二值化、扩频		
	int spread = floor(numBlock / lengthOfId);						//扩频倍数
	std::vector<int> waterSpread(spread*lengthOfId,-1);			//初始化为5
	uchar waterTem = 0;
	int count = 0;
	int countWrite = spread;
	int subIndex = 0;
	srand((Key*2000000)%4294967200);
	subIndex =rand() % (spread*lengthOfId);	
	while (count<lengthOfId){							//不是每一个块都嵌
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

	//--水平滑动
	std::vector<int>::iterator waterP = waterSpread.begin();	

	for (j = 0; j <= srcLL.rows-_H; j += _H){
		for (i = 0; i <= srcLL.cols - _W && waterP != waterSpread.end(); i += _W){
			Rect _rectQR(i, j, _W, _H);
			Mat _srcSub(srcLL, _rectQR);							//引用
			embedAlgorithm(_srcSub, *(waterP++), strengthEmbed);	//嵌入
			lengthOfwater++;
		}
	}

	//--srcBfloat反变换IDWT
	/*IplImage *psrcB = (IplImage *)&IplImage(srcBfloat);			//引用
	IDWT(psrcB, layTransf);*/
	myidwt(srcBfloat, layTransf);

	//-转换为CV_8UC3、合并通道
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

//--提取--参数：Mat类型的RGB
void extract(cv::Mat& src, std::vector<int>& waterDst, const unsigned int Key, const int& layTransf, int lengthOfId)
{
	std::vector<cv::Mat> BGR;
	split(src, BGR);									//数据是否拷贝	
	Mat& srcB = BGR[0];									//channel==1;srcB数据按行排列，数据类型为uchar	
	
	cv::Mat srcBfloat;
	srcB.convertTo(srcBfloat, CV_32FC1);				//拷贝	
	double minRange = 0, maxRange = 0;
	minMaxIdx(srcBfloat, &minRange, &maxRange);

	//--小波变换	
	mydwt(srcBfloat, layTransf);						//在src图上做DWT，没有拷贝,得到系数都是正数吗？？？	

	//--提取ROI,没有拷贝
	CvSize sizeLL;
	sizeLL.height = srcBfloat.rows >> layTransf;
	sizeLL.width = srcBfloat.cols >> layTransf;
	Rect rectLL(0, 0, sizeLL.width, sizeLL.height);
	Mat srcLL(srcBfloat, rectLL);
		
	//--滑动窗口2*4遍历图像
	int _W = 4, _H = 2;
	CvSize subWinSize(_W, _H);
	int i = 0, j = 0, waterTem = 0;
	int lengthOfwater = 0;			//含水印的块的个数	
	std::vector<int> waterAll;	
	int waterIndex = 0;

	//--水平滑动,提取
	for (j = 0; j <= srcLL.rows - subWinSize.height; j += _H){
		for (i = 0; i <= srcLL.cols - subWinSize.width; i += _W){
			Rect _rectQR(i, j, subWinSize.width, subWinSize.height);
			Mat _srcSub(srcLL, _rectQR);							//引用
			waterTem=extractAlgorithm(_srcSub);						//提取
			waterAll.push_back( waterTem);
			lengthOfwater++;
		}
	}

	//--恢复顺序、扩频处理
	int numBlock = floor(srcLL.rows / _H) * floor(srcLL.cols / _W);	//可嵌水印的长度
	int spread = floor(numBlock / lengthOfId);
	waterIndex = 0;
	int numOf0 = 0, numOf1 = 0;
	int numWaterGet = 0;											//提取出来的水印个数
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

//4*2的块
void embedAlgorithm(Mat& _src,const int water,const int& t){	
	//--再分成2*2块		
	//Mat dataA(_src, rectA);	
	Mat dataA(_src, Range(0,2),Range(0,2));			//dataA的地址与_src相同，dataB不同
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
		//--修改dataA
		if (dataA.isContinuous()){
			rows = 1;
			cols = dataA.cols*dataA.rows*dataA.channels();
		}		
		for (int i = 0; i < rows; i++){
			float* pSrc = dataA.ptr<float>(i);		//类型？？？
			for (int j = 0; j < cols; j++){				
				*(pSrc + j) = ( abs(*(pSrc+j)) + (m-m1+t)) * mysgn(*(pSrc+j));
			}
		}
		//--修改dataB
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
		//--修改dataA
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
		//--修改dataB
		if (dataB.isContinuous()){
			rows = 1;
			cols = dataB.cols*dataB.rows*dataB.channels();
		}
		for (int i = 0; i < rows; i++){
			float* pSrc = dataB.ptr<float>(i);	//uchar* ???数据损失
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
	Mat dataA(_src, Range(0, 2), Range(0, 2));			//dataA的地址与_src相同，dataB不同
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

//计算绝对值均值
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