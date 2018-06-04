#include<iostream>
#include"transf.h"
using namespace std;
int main(){

	const std::string infile = "lena.jpg";
	const std::string outfile = "outfile.jpg";
	unsigned int Key=392142;
	long long watersrc = 9348314;
	//embed(infile, outfile,Key , watersrc);

	long long value = 0;
	extract(outfile, Key, value);
	std::cout << "sucess:" << value << std::endl;
	std::cin.get();
}