#include <opencv2/opencv.hpp>
//#include <opencv2/core/eigen.hpp>
#include <iostream>
#include<vector>
#include<cmath>
#include"transf.h"

using namespace std;
using namespace cv;

int main(){
	const std::string infile = "test.jpg";
	const std::string outfile = "outfile.jpg";
	int key = 133192;
	int Q = 10;			//«∂»Î«ø∂»

	//long long valueId = 1215442;
	//embed(infile,outfile,key,valueId);
	long long valueId = 0;
	extract(outfile, key,valueId);

	return 0;
}