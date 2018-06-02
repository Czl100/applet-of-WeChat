#include <Eigen/Dense>  
#include <Eigen/SparseQR>
#include <Eigen/Core>

#include <opencv2/opencv.hpp>
#include <opencv2/core/eigen.hpp>

//#include<core_c.h>
//#include<cxcore.h>
//#include<cv.h>
//#include<highgui.h>

#include <iostream>
#include<vector>
#include<cmath>
#include"transf.h"

using namespace std;
using namespace cv;

const int mysgn(float& data);
const double mymean(const cv::Mat& mdata);
void embedAlgorithm(Mat& _src, const int& water, const int& t);		//Ƕ��ˮӡ
const int extractAlgorithm(const Mat& _src);
void extract(cv::Mat& src, std::vector<int>& waterDst, const int& layTransf);
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

//--cvMul
int main()
{	
	//test2();		
	int layTransf = 1;
	cv::Mat src = imread("lena.jpg", CV_LOAD_IMAGE_ANYDEPTH | CV_LOAD_IMAGE_ANYCOLOR);	//src.type()==CV_8UC3				
	std::vector<cv::Mat> BGR;
	split(src,  BGR);							//�����Ƿ񿽱�	
	Mat& srcB = BGR[0];							//channel==1;srcB���ݰ������У���������Ϊuchar,srcB.type()==CV_8U		

	cv::Mat srcBfloat;
	srcB.convertTo(srcBfloat, CV_32FC1);		//����	
	namedWindow("src0", WINDOW_NORMAL);
	imshow("src0", src);
	//--С���任
	//cout << "srcB0:\n" << srcB << endl;
	mydwt(srcBfloat, layTransf);		//��srcͼ����DWT��û�п���,�õ�ϵ�����������𣿣���
	//cout << "srcB1:\n" << srcB << endl;

	//--��ȡROI,û�п���
	CvSize sizeLL;	
	sizeLL.height = srcBfloat.rows >> layTransf;
	sizeLL.width = srcBfloat.cols >> layTransf;
	Rect rectLL(0, 0, sizeLL.width, sizeLL.height);	
	Mat srcLL(srcBfloat, rectLL);		//minValue=-144,maxValue=**;��������

	//--��������2*4����ͼ��
	unsigned char* _ptr = nullptr;
	int _W = 4, _H = 2;
	int lengthOfwater = 0;
	CvSize subWinSize(_W,_H);
	int i = 0, j = 0;
	//--ˮƽ����
	for (j = 0; j <= srcLL.rows - subWinSize.height; j += _H){	
		for (i = 0; i <= srcLL.cols - subWinSize.width; i += _W){
			Rect _rectQR(i, j, subWinSize.width, subWinSize.height);
			Mat _srcSub(srcLL, _rectQR);							//����
			embedAlgorithm(_srcSub,1, 10);							//Ƕ��
			lengthOfwater++;
		}
	}
	//cout << "srcLL:\n" << srcLL << endl;							//���޸�srcLL
	//cout << "srcBfloat:\n" << srcBfloat << endl;					//���޸�srcBfloat

	//--srcBfloat���任IDWT
	/*IplImage *psrcB = (IplImage *)&IplImage(srcBfloat);				//����
	IDWT(psrcB, layTransf);*/
	myidwt(srcBfloat, layTransf);
	
	//-ת��ΪCV_8UC3���ϲ�ͨ��
	double minRange = 0, maxRange = 0;	
	minMaxIdx(srcBfloat, &minRange, &maxRange);	
	srcBfloat.convertTo(srcB, CV_8UC1, 255.0 / (maxRange - minRange), -(minRange*255.0)/(maxRange-minRange));
	/*namedWindow("srcBfloat", WINDOW_NORMAL);
	imshow("srcBfloat", srcB);
	waitKey();*/

	merge(BGR,src);	
	namedWindow("dst", WINDOW_NORMAL);
	imshow("dst", src);
	//waitKey();

	//imwrite("ImageR.jpg",src);
	
	std::vector<int> waterDst(64);
	extract(src, waterDst, layTransf);

	//---cvResetImageROI( (IplImage *)&IplImage(srcBfloat) );
	//namedWindow("imageROI",WINDOW_NORMAL);
	//imshow("imageROI", imageROI);
	waitKey();
	return 0;
}

//--��ȡ--
void extract(cv::Mat& src, std::vector<int>& waterDst, const int& layTransf)
{
	std::vector<cv::Mat> BGR;
	split(src, BGR);							//�����Ƿ񿽱�	
	Mat& srcB = BGR[0];							//channel==1;srcB���ݰ������У���������Ϊuchar	
	
	cv::Mat srcBfloat;
	srcB.convertTo(srcBfloat, CV_32FC1);		//����
	//--С���任	
	mydwt(srcBfloat, layTransf);						//��srcͼ����DWT��û�п���,�õ�ϵ�����������𣿣���
	//cout << "srcB1:\n" << srcB << endl;

	//--��ȡROI,û�п���
	CvSize sizeLL;
	sizeLL.height = srcBfloat.rows >> layTransf;
	sizeLL.width = srcBfloat.cols >> layTransf;
	Rect rectLL(0, 0, sizeLL.width, sizeLL.height);
	Mat srcLL(srcBfloat, rectLL);
	//cout << "srcLL:\n" << srcLL << endl;
	//--��������2*4����ͼ��
	unsigned char* _ptr = nullptr;
	int _W = 4, _H = 2;
	CvSize subWinSize(_W, _H);
	int i = 0, j = 0, waterTem = 0;
	int lengthOfwater = 0;			//��ˮӡ�Ŀ�ĸ���	
	std::vector<uchar> waterAll;
	int spread = 0;
	int waterIndex = 0;
	//--ˮƽ����
	for (j = 0; j <= srcLL.rows - subWinSize.height; j += _H){
		for (i = 0; i <= srcLL.cols - subWinSize.width; i += _W){
			Rect _rectQR(i, j, subWinSize.width, subWinSize.height);
			Mat _srcSub(srcLL, _rectQR);							//����
			waterTem=extractAlgorithm(_srcSub);						//��ȡ
			waterAll.push_back( waterTem);
			lengthOfwater++;
		}
	}

	//--��Ƶ����
	spread = floor(lengthOfwater / 64);								//Ƕ��64bit
	waterIndex = 0;
	int numOf0 = 0, numOf1 = 0;
	for (i = 0; i < lengthOfwater; i++){
		if (waterAll[i] == 0)	numOf0++;
		else	numOf1++;
		if ( (i+1)%spread==0 ){
			if (numOf0 >= numOf1)	waterDst[waterIndex++] = 0;
			else	waterDst[waterIndex++] = 1;
			numOf0 = 0; numOf1 = 0;
		}
	}
}

//4*2�Ŀ�
void embedAlgorithm(Mat& _src,const int& water,const int& t){	
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
	int rows = dataA.rows;
	int cols = dataA.cols;
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