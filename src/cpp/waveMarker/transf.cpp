#include"transf.h"
#include<opencv2/opencv.hpp>	//��������OpenCVͷ�ļ�
#include<vector>
using namespace std;
using namespace cv;

// --��ά��ɢС���任����ͨ������ͼ��
void DWT(IplImage *pImage, int nLayer)
{
	// ִ������
	if (pImage)
	{
		if (pImage->nChannels == 1 &&
			pImage->depth == IPL_DEPTH_32F &&
			((pImage->width >> nLayer) << nLayer) == pImage->width &&
			((pImage->height >> nLayer) << nLayer) == pImage->height)
		{
			int     i, x, y, n;
			float   fValue = 0;
			float   fRadius = sqrt(2.0f);
			int     nWidth = pImage->width;
			int     nHeight = pImage->height;
			int     nHalfW = nWidth / 2;
			int     nHalfH = nHeight / 2;
			float **pData = new float*[pImage->height];
			float  *pRow = new float[pImage->width];
			float  *pColumn = new float[pImage->height];
			for (i = 0; i < pImage->height; i++)
			{
				pData[i] = (float*)(pImage->imageData + pImage->widthStep * i);
			}
			// ���С���任
			for (n = 0; n < nLayer; n++, nWidth /= 2, nHeight /= 2, nHalfW /= 2, nHalfH /= 2)
			{
				// ˮƽ�任
				for (y = 0; y < nHeight; y++)
				{
					// ��ż����
					memcpy(pRow, pData[y], sizeof(float)* nWidth);
					for (i = 0; i < nHalfW; i++)
					{
						x = i * 2;
						pData[y][i] = pRow[x];
						pData[y][nHalfW + i] = pRow[x + 1];
					}
					// ����С���任
					for (i = 0; i < nHalfW - 1; i++)
					{
						fValue = (pData[y][i] + pData[y][i + 1]) / 2;
						pData[y][nHalfW + i] -= fValue;
					}
					fValue = (pData[y][nHalfW - 1] + pData[y][nHalfW - 2]) / 2;
					pData[y][nWidth - 1] -= fValue;
					fValue = (pData[y][nHalfW] + pData[y][nHalfW + 1]) / 4;
					pData[y][0] += fValue;
					for (i = 1; i < nHalfW; i++)
					{
						fValue = (pData[y][nHalfW + i] + pData[y][nHalfW + i - 1]) / 4;
						pData[y][i] += fValue;
					}
					// Ƶ��ϵ��
					for (i = 0; i < nHalfW; i++)
					{
						pData[y][i] *= fRadius;
						pData[y][nHalfW + i] /= fRadius;
					}
				}
				// ��ֱ�任
				for (x = 0; x < nWidth; x++)
				{
					// ��ż����
					for (i = 0; i < nHalfH; i++)
					{
						y = i * 2;
						pColumn[i] = pData[y][x];
						pColumn[nHalfH + i] = pData[y + 1][x];
					}
					for (i = 0; i < nHeight; i++)
					{
						pData[i][x] = pColumn[i];
					}
					// ����С���任
					for (i = 0; i < nHalfH - 1; i++)
					{
						fValue = (pData[i][x] + pData[i + 1][x]) / 2;
						pData[nHalfH + i][x] -= fValue;
					}
					fValue = (pData[nHalfH - 1][x] + pData[nHalfH - 2][x]) / 2;
					pData[nHeight - 1][x] -= fValue;
					fValue = (pData[nHalfH][x] + pData[nHalfH + 1][x]) / 4;
					pData[0][x] += fValue;
					for (i = 1; i < nHalfH; i++)
					{
						fValue = (pData[nHalfH + i][x] + pData[nHalfH + i - 1][x]) / 4;
						pData[i][x] += fValue;
					}
					// Ƶ��ϵ��
					for (i = 0; i < nHalfH; i++)
					{
						pData[i][x] *= fRadius;
						pData[nHalfH + i][x] /= fRadius;
					}
				}
			}
			delete[] pData;
			delete[] pRow;
			delete[] pColumn;
		}
	}
}

// --��ά��ɢС���ָ�����ͨ������ͼ��
void IDWT(IplImage *pImage, int nLayer)
{
	// ִ������
	if (pImage)
	{
		if (pImage->nChannels == 1 &&
			pImage->depth == IPL_DEPTH_32F &&
			((pImage->width >> nLayer) << nLayer) == pImage->width &&
			((pImage->height >> nLayer) << nLayer) == pImage->height)
		{
			int     i, x, y, n;
			float   fValue = 0;
			float   fRadius = sqrt(2.0f);
			int     nWidth = pImage->width >> (nLayer - 1);
			int     nHeight = pImage->height >> (nLayer - 1);
			int     nHalfW = nWidth / 2;
			int     nHalfH = nHeight / 2;
			float **pData = new float*[pImage->height];
			float  *pRow = new float[pImage->width];
			float  *pColumn = new float[pImage->height];
			for (i = 0; i < pImage->height; i++)
			{
				pData[i] = (float*)(pImage->imageData + pImage->widthStep * i);
			}
			// ���С���ָ�
			for (n = 0; n < nLayer; n++, nWidth *= 2, nHeight *= 2, nHalfW *= 2, nHalfH *= 2)
			{
				// ��ֱ�ָ�
				for (x = 0; x < nWidth; x++)
				{
					// Ƶ��ϵ��
					for (i = 0; i < nHalfH; i++)
					{
						pData[i][x] /= fRadius;
						pData[nHalfH + i][x] *= fRadius;
					}
					// ����С���ָ�
					fValue = (pData[nHalfH][x] + pData[nHalfH + 1][x]) / 4;
					pData[0][x] -= fValue;
					for (i = 1; i < nHalfH; i++)
					{
						fValue = (pData[nHalfH + i][x] + pData[nHalfH + i - 1][x]) / 4;
						pData[i][x] -= fValue;
					}
					for (i = 0; i < nHalfH - 1; i++)
					{
						fValue = (pData[i][x] + pData[i + 1][x]) / 2;
						pData[nHalfH + i][x] += fValue;
					}
					fValue = (pData[nHalfH - 1][x] + pData[nHalfH - 2][x]) / 2;
					pData[nHeight - 1][x] += fValue;
					// ��ż�ϲ�
					for (i = 0; i < nHalfH; i++)
					{
						y = i * 2;
						pColumn[y] = pData[i][x];
						pColumn[y + 1] = pData[nHalfH + i][x];
					}
					for (i = 0; i < nHeight; i++)
					{
						pData[i][x] = pColumn[i];
					}
				}
				// ˮƽ�ָ�
				for (y = 0; y < nHeight; y++)
				{
					// Ƶ��ϵ��
					for (i = 0; i < nHalfW; i++)
					{
						pData[y][i] /= fRadius;
						pData[y][nHalfW + i] *= fRadius;
					}
					// ����С���ָ�
					fValue = (pData[y][nHalfW] + pData[y][nHalfW + 1]) / 4;
					pData[y][0] -= fValue;
					for (i = 1; i < nHalfW; i++)
					{
						fValue = (pData[y][nHalfW + i] + pData[y][nHalfW + i - 1]) / 4;
						pData[y][i] -= fValue;
					}
					for (i = 0; i < nHalfW - 1; i++)
					{
						fValue = (pData[y][i] + pData[y][i + 1]) / 2;
						pData[y][nHalfW + i] += fValue;
					}
					fValue = (pData[y][nHalfW - 1] + pData[y][nHalfW - 2]) / 2;
					pData[y][nWidth - 1] += fValue;
					// ��ż�ϲ�
					for (i = 0; i < nHalfW; i++)
					{
						x = i * 2;
						pRow[x] = pData[y][i];
						pRow[x + 1] = pData[y][nHalfW + i];
					}
					memcpy(pData[y], pRow, sizeof(float)* nWidth);
				}
			}
			delete[] pData;
			delete[] pRow;
			delete[] pColumn;
		}
	}
}

//--������Bͨ�����ݣ��任����
int mydwt(cv::Mat& _src,int _nlayer)
{	
	int nLayer = _nlayer;		
	IplImage *pSrc = (IplImage *)&IplImage(_src);	

	//--����С��ͼ���С
	CvSize size = cvGetSize(pSrc);
	if ((pSrc->width >> nLayer) << nLayer != pSrc->width)
	{
		size.width = ((pSrc->width >> nLayer) + 1) << nLayer;
	}
	if ((pSrc->height >> nLayer) << nLayer != pSrc->height)
	{
		size.height = ((pSrc->height >> nLayer) + 1) << nLayer;
	}
	// ����С��ͼ��
	IplImage *pWavelet = cvCreateImage(size, IPL_DEPTH_32F, pSrc->nChannels);
	if (pWavelet)
	{
		// С��ͼ��ֵ
		cvSetImageROI(pWavelet, cvRect(0, 0, pSrc->width, pSrc->height));
		cvConvertScale(pSrc, pWavelet, 1, -128);
		cvResetImageROI(pWavelet);
		// ��ɫͼ��С���任
		IplImage *buf = cvCreateImage(cvGetSize(pWavelet), IPL_DEPTH_32F, 1);
		if (buf)
		{
			for (int i = 1; i <= pWavelet->nChannels; i++)
			{
				cvSetImageCOI(pWavelet, i);
				cvCopy(pWavelet, buf, NULL);
				// ��ά��ɢС���任
				DWT(buf, nLayer);
				// ��ά��ɢС���ָ�
				//IDWT(buf, nLayer);
				cvCopy(buf, pWavelet, NULL);
			}
			cvSetImageCOI(pWavelet, 0);
			cvReleaseImage(&buf);
		}
		// С���任ͼ��
		cvSetImageROI(pWavelet, cvRect(0, 0, pSrc->width, pSrc->height));
		cvConvertScale(pWavelet, pSrc, 1, 128);		
		cvResetImageROI(pWavelet);					

		/*cvNamedWindow("pWavelet", WINDOW_NORMAL);
		cvShowImage("pWavelet", pSrc);*/
		cvReleaseImage(&pWavelet);
	}
	//cvReleaseImage(&pSrc);
	return 0;
}

//--myIDWT
int myidwt(cv::Mat& _src, int _nlayer)
{
	int nLayer = _nlayer;
	IplImage *pSrc = (IplImage *)&IplImage(_src);

	//--����С��ͼ���С
	CvSize size = cvGetSize(pSrc);
	if ((pSrc->width >> nLayer) << nLayer != pSrc->width)
	{
		size.width = ((pSrc->width >> nLayer) + 1) << nLayer;
	}
	if ((pSrc->height >> nLayer) << nLayer != pSrc->height)
	{
		size.height = ((pSrc->height >> nLayer) + 1) << nLayer;
	}
	// ����С��ͼ��
	IplImage *pWavelet = cvCreateImage(size, IPL_DEPTH_32F, pSrc->nChannels);
	if (pWavelet)
	{
		// С��ͼ��ֵ
		cvSetImageROI(pWavelet, cvRect(0, 0, pSrc->width, pSrc->height));
		cvConvertScale(pSrc, pWavelet, 1, -128);
		cvResetImageROI(pWavelet);
		// ��ɫͼ��С���任
		IplImage *buf = cvCreateImage(cvGetSize(pWavelet), IPL_DEPTH_32F, 1);
		if (buf)
		{
			for (int i = 1; i <= pWavelet->nChannels; i++)
			{
				cvSetImageCOI(pWavelet, i);
				cvCopy(pWavelet, buf, NULL);
				// ��ά��ɢС���任
				//DWT(buf, nLayer);
				// ��ά��ɢС���ָ�
				IDWT(buf, nLayer);
				cvCopy(buf, pWavelet, NULL);
			}
			cvSetImageCOI(pWavelet, 0);
			cvReleaseImage(&buf);
		}
		// С���任ͼ��
		cvSetImageROI(pWavelet, cvRect(0, 0, pSrc->width, pSrc->height));
		cvConvertScale(pWavelet, pSrc, 1, 128);
		cvResetImageROI(pWavelet);					// ���д����е���࣬���������������õı��ϰ��

		/*cvNamedWindow("pWavelet", WINDOW_NORMAL);
		cvShowImage("pWavelet", pSrc);*/
		cvReleaseImage(&pWavelet);
	}
	//cvReleaseImage(&pSrc);
	return 0;
}

void embed(const std::string& infile, const std::string& outfile, unsigned int Key,unsigned long long watersrc, int lengthOfId, int strengthEmbed, int layTransf){
	cv::Mat src = imread(infile, CV_LOAD_IMAGE_ANYDEPTH | CV_LOAD_IMAGE_ANYCOLOR);	//src.type()==CV_8UC3		
	if (src.empty())		throw;

	std::vector<cv::Mat> BGR;
	split(src, BGR);							//�����Ƿ񿽱�	
	Mat& srcB = BGR[0];							//channel==1;srcB���ݰ������У���������Ϊuchar,srcB.type()==CV_8U		

	cv::Mat srcBfloat;
	srcB.convertTo(srcBfloat, CV_32FC1);		//����	
	//--С���任
	mydwt(srcBfloat, layTransf);				//��srcͼ����DWT��û�п���,�õ�ϵ�����������𣿣���	

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
	int numBlock = floor(srcLL.rows / _H) * floor(srcLL.cols / _W);	//��Ƕˮӡ�ĳ���

	//ˮӡ��ֵ������Ƶ		
	int spread = floor(numBlock / lengthOfId);						//��Ƶ����
	std::vector<int> waterSpread(spread*lengthOfId, -1);			//��ʼ��Ϊ5
	uchar waterTem = 0;
	int count = 0;
	int countWrite = spread;
	int subIndex = 0;
	srand((Key * 2000000) % 4294967200);
	subIndex = rand() % (spread*lengthOfId);
	while (count<lengthOfId){							//����ÿһ���鶼Ƕ
		count++;
		if (watersrc == 0)	waterTem = 0;
		else waterTem = watersrc & 0x0000000000000001;
		for (; countWrite>0; countWrite--){
			while ((subIndex >= spread*lengthOfId) || subIndex<0 || (waterSpread[subIndex] != -1)){
				subIndex++;
				if (subIndex >= spread*lengthOfId)	subIndex = 0;
			}
			waterSpread[subIndex++] = waterTem;
		}
		countWrite = spread;
		if (watersrc >= 0)	watersrc = watersrc >> 1;
		else watersrc = 0;
	}

	//--ˮƽ����
	std::vector<int>::iterator waterP = waterSpread.begin();

	for (j = 0; j <= srcLL.rows - _H; j += _H){
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

	merge(BGR, src);	
	imwrite(outfile, src);
}

int embedAlgorithm(cv::Mat& _src, const int water, const int& t){
	//--�ٷֳ�2*2��		
	//Mat dataA(_src, rectA);	
	Mat dataA(_src, Range(0, 2), Range(0, 2));			//dataA�ĵ�ַ��_src��ͬ��dataB��ͬ
	Mat dataB(_src, Range(0, 2), Range(2, 4));
	int rows = dataA.rows;
	int cols = dataA.cols;

	double m1 = mymean(dataA);
	double m2 = mymean(dataB);
	double m = (m1 + m2) / 2;

	if (water == 1){			//(m1>= m2)
		if (m1 >= m2){
			return 0;
		}
		//--�޸�dataA
		if (dataA.isContinuous()){
			rows = 1;
			cols = dataA.cols*dataA.rows*dataA.channels();
		}
		for (int i = 0; i < rows; i++){
			float* pSrc = dataA.ptr<float>(i);		//���ͣ�����
			for (int j = 0; j < cols; j++){
				*(pSrc + j) = (abs(*(pSrc + j)) + (m - m1 + t)) * mysgn(*(pSrc + j));
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
			return 0;
		}
		//--�޸�dataA
		if (dataA.isContinuous()){
			rows = 1;
			cols = dataA.cols*dataA.rows*dataA.channels();
		}
		for (int i = 0; i < rows; i++){
			float* pSrc = dataA.ptr<float>(i);
			for (int j = 0; j < cols; j++){
				*(pSrc + j) = (abs(*(pSrc + j)) - (m1 - m + t)) * mysgn(*(pSrc + j));
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
	else	return -1;

	return 0;
}

unsigned long long extract(const std::string& infile, int key){
	unsigned long long value = 0;
	cv::Mat src_t = imread(infile, CV_LOAD_IMAGE_ANYDEPTH | CV_LOAD_IMAGE_ANYCOLOR);	//src.type()==CV_8UC3
	if (src_t.empty())		throw;
	std::vector<int> waterDst(64);
	std::vector<int>::iterator ptr = waterDst.end();	
	int i = waterDst.size() - 1;
	_extract(src_t, waterDst, key, 1, 64);

	//������תʮ���ƣ�waterDst��λ����ǵ�λ����
	for (; i >= 0; i--, ptr--){
		if (waterDst[i] == 0)	continue;
		value = waterDst[i] * pow(2, i) + value;
	}
	return value;
}

const int extractAlgorithm(const cv::Mat& _src)
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

//--��ȡ--������Mat���͵�RGB
void _extract(cv::Mat& src, std::vector<int>& waterDst, const unsigned int Key, const int& layTransf, int lengthOfId)
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
			waterTem = extractAlgorithm(_srcSub);						//��ȡ
			waterAll.push_back(waterTem);
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
		while (waterAll[subIndex] == -1 || subIndex >= spread*lengthOfId || subIndex<0){
			subIndex++;
			if (subIndex >= spread*lengthOfId)
				subIndex = 0;
		}
		if (waterAll[subIndex] == 0)			numOf0++;
		else if (waterAll[subIndex] == 1) 	numOf1++;
		else  throw;
		waterAll[subIndex] = -1;
		if ((i + 1) % spread == 0){
			if (numOf0 >= numOf1)	waterDst[waterIndex++] = 0;
			else					waterDst[waterIndex++] = 1;
			numOf0 = 0; numOf1 = 0; numWaterGet++;
		}
		if (numWaterGet == lengthOfId)	break;
	}
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
	for (i = 0; i < mdata.rows; i++){
		const float* pSrc = mdata.ptr<float>(i);
		for (j = 0; j < mdata.cols; j++){
			if (*(pSrc + j) < 0)	sum += (abs(*(pSrc + j)));
			else	 sum += (*(pSrc + j));
		}
	}
	float mymean = sum / (mdata.rows*mdata.cols);
	return mymean;
}