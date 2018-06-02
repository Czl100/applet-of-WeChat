#ifndef _OPENCV_H_
#include<opencv2/opencv.hpp>
#define _OPENCV_H_
#endif

#ifndef _TRANSF_H
#define _TRANSF_H

void DWT(IplImage *pImage, int nLayer);
void IDWT(IplImage *pImage, int nLayer);
int mydwt(cv::Mat& _src, int _nlayer);
int myidwt(cv::Mat& _src, int _nlayer);

#endif