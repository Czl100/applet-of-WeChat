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
void embedAlgorithm(Mat& _src, const int& water, const int& t);		//嵌入水印
const int extractAlgorithm(const Mat& _src);
void extract(cv::Mat& src, std::vector<int>& waterDst, const int& layTransf);
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

//--cvMul
int main()
{	
	//test2();		
	int layTransf = 1;
	cv::Mat src = imread("lena.jpg", CV_LOAD_IMAGE_ANYDEPTH | CV_LOAD_IMAGE_ANYCOLOR);	//src.type()==CV_8UC3				
	std::vector<cv::Mat> BGR;
	split(src,  BGR);							//数据是否拷贝	
	Mat& srcB = BGR[0];							//channel==1;srcB数据按行排列，数据类型为uchar,srcB.type()==CV_8U		

	cv::Mat srcBfloat;
	srcB.convertTo(srcBfloat, CV_32FC1);		//拷贝	
	namedWindow("src0", WINDOW_NORMAL);
	imshow("src0", src);
	//--小波变换
	//cout << "srcB0:\n" << srcB << endl;
	mydwt(srcBfloat, layTransf);		//在src图上做DWT，没有拷贝,得到系数都是正数吗？？？
	//cout << "srcB1:\n" << srcB << endl;

	//--提取ROI,没有拷贝
	CvSize sizeLL;	
	sizeLL.height = srcBfloat.rows >> layTransf;
	sizeLL.width = srcBfloat.cols >> layTransf;
	Rect rectLL(0, 0, sizeLL.width, sizeLL.height);	
	Mat srcLL(srcBfloat, rectLL);		//minValue=-144,maxValue=**;考虑正负

	//--滑动窗口2*4遍历图像
	unsigned char* _ptr = nullptr;
	int _W = 4, _H = 2;
	int lengthOfwater = 0;
	CvSize subWinSize(_W,_H);
	int i = 0, j = 0;
	//--水平滑动
	for (j = 0; j <= srcLL.rows - subWinSize.height; j += _H){	
		for (i = 0; i <= srcLL.cols - subWinSize.width; i += _W){
			Rect _rectQR(i, j, subWinSize.width, subWinSize.height);
			Mat _srcSub(srcLL, _rectQR);							//引用
			embedAlgorithm(_srcSub,1, 10);							//嵌入
			lengthOfwater++;
		}
	}
	//cout << "srcLL:\n" << srcLL << endl;							//已修改srcLL
	//cout << "srcBfloat:\n" << srcBfloat << endl;					//已修改srcBfloat

	//--srcBfloat反变换IDWT
	/*IplImage *psrcB = (IplImage *)&IplImage(srcBfloat);				//引用
	IDWT(psrcB, layTransf);*/
	myidwt(srcBfloat, layTransf);
	
	//-转换为CV_8UC3、合并通道
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

//--提取--
void extract(cv::Mat& src, std::vector<int>& waterDst, const int& layTransf)
{
	std::vector<cv::Mat> BGR;
	split(src, BGR);							//数据是否拷贝	
	Mat& srcB = BGR[0];							//channel==1;srcB数据按行排列，数据类型为uchar	
	
	cv::Mat srcBfloat;
	srcB.convertTo(srcBfloat, CV_32FC1);		//拷贝
	//--小波变换	
	mydwt(srcBfloat, layTransf);						//在src图上做DWT，没有拷贝,得到系数都是正数吗？？？
	//cout << "srcB1:\n" << srcB << endl;

	//--提取ROI,没有拷贝
	CvSize sizeLL;
	sizeLL.height = srcBfloat.rows >> layTransf;
	sizeLL.width = srcBfloat.cols >> layTransf;
	Rect rectLL(0, 0, sizeLL.width, sizeLL.height);
	Mat srcLL(srcBfloat, rectLL);
	//cout << "srcLL:\n" << srcLL << endl;
	//--滑动窗口2*4遍历图像
	unsigned char* _ptr = nullptr;
	int _W = 4, _H = 2;
	CvSize subWinSize(_W, _H);
	int i = 0, j = 0, waterTem = 0;
	int lengthOfwater = 0;			//含水印的块的个数	
	std::vector<uchar> waterAll;
	int spread = 0;
	int waterIndex = 0;
	//--水平滑动
	for (j = 0; j <= srcLL.rows - subWinSize.height; j += _H){
		for (i = 0; i <= srcLL.cols - subWinSize.width; i += _W){
			Rect _rectQR(i, j, subWinSize.width, subWinSize.height);
			Mat _srcSub(srcLL, _rectQR);							//引用
			waterTem=extractAlgorithm(_srcSub);						//提取
			waterAll.push_back( waterTem);
			lengthOfwater++;
		}
	}

	//--扩频处理
	spread = floor(lengthOfwater / 64);								//嵌入64bit
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

//4*2的块
void embedAlgorithm(Mat& _src,const int& water,const int& t){	
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