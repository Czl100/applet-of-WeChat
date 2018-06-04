#ifndef _TRANSF_H
#define _TRANSF_H
#include<opencv2/opencv.hpp>

#ifdef DYNAMICLIBRARY_EXPORTS
#define CALC_API __declspec(dllexport)
#else
#define CALC_API __declspec(dllimport)
#endif

void DWT(IplImage *pImage, int nLayer);
void IDWT(IplImage *pImage, int nLayer);
int mydwt(cv::Mat& _src, int _nlayer);
int myidwt(cv::Mat& _src, int _nlayer);

void embed(const std::string& infile, const std::string& outfile, unsigned int Key, long long watersrc, int lengthOfId=64, int strengthEmbed=10, int layTransf=1);
void embedAlgorithm(cv::Mat& _src, const int water, const int& t);

void extract(const std::string& infile, int key,long long& value);
void _extract(cv::Mat& src, std::vector<int>& waterDst, const unsigned int Key, const int& layTransf, int lengthOfId);
const int extractAlgorithm(const cv::Mat& _src);

const int mysgn(float& data);
const double mymean(const cv::Mat& mdata);

#endif