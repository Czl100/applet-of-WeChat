#include <opencv2/opencv.hpp>
#include <iostream>
#include<vector>
#include<cmath>
#include"transf.h"

using namespace std;
using namespace cv;

int main(int argc, char *argv[]){		
	std::string infile = argv[1];	
	int key = atol(argv[2]);
	long long waterId = 0;	
	std::string outfile;	

	if (argc == 5){
		waterId = atol(argv[3]);
		outfile = argv[4];
		embed(infile, outfile, key, waterId);		
		return 0;
	}
	else if (argc == 3){
		unsigned long long value = extract(infile, key);
		std::cout << value;
		return 0;
	}
	else{		
		return -1;
	}
}