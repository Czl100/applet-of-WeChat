#**OpenCV环境配置**
  
##一、Windows下配置OpenCV

     本地测试环境为Win7_64、OpenCV3.0.0、 visual studio 2013
>1.   下载OpenCV 地址：[OpenCV官网](https://opencv.org/releases.html").
选择适合本机的OpenCV版本下载，此处选择Windows 3.0.0版本
>2.   将OpenCV/build/X64/vc12/bin文件夹下opencv_world300.dll、opencv_world300d.dll拷贝到工作路径，这里X64代表64位系统，VC12代表visual studio2013，300代表OpenCV的版本为3.0.0，其中带**d.dll表示Debug模式，没有带d的表示release模式


	visual studio2013项目配置

*    添加头文件：新建项目，进入项目属性，选择C/C++-->附加包含目录，将OpenCV/build/	   	 	 include文件路径添加到附加包含目录
*    添加库文件：在属性页面，选择VC++目录--->库目录,将OpenCV/build/X64/vc12/lib文件路径	 添加到附加库目录中
*    在属性页面选择链接器-->输入-->输入-->附加依赖项添加	 	opencv_ts300d.lib;opencv_world300d.lib;
*	在属性页面，选择调试--->环境，将OpenCV/build/X64/vc12/bin文件目录添加到环	境"path=xx\bin"
*	完成配置

----------------------------------------------------------------------
  
##二、Linux下配置OpenCV

centos7.0下配置OpenCV
>
>官网下载Linux下的OpenCV，并解压；先安装依赖文件gcc,g++

	yum install gcc gcc-c++  
	yum install cmake
				
>   安装OpenCV依赖项

	yum install gtk2-devel  
	yum install libdc1394-devel  
	yum install libv4l-devel  
	yum install gstreamer-plugins-base-devel 


进入OpenCV的解压目录，编译OpenCV


* 添加库路径（创建opencv.conf文件）

	将OpenCV的库文件路径添加到系统配置文件etc/ld.so.conf.d/中
    输入命令：vi /etc/ld.so.conf.d/opencv.conf
    输入/usr/local/opencv/lib，并保存退出


>   配置环境变量：

   	export PKG_CONFIG_PATH=$PKG_CONFIG_PATH:/usr/local/lib/pkgconfig/
	sudo echo '/usr/local/lib' 
	/etc/ld.so.conf.d/opencv.conf
	sudo ldconfig

>编译安装：

    cmake-->make-->make install


>   查看opencv是否安装成功

    输入命令：pkg-config --cflags opencv
	pkg-config --modversion opencv　　　 
>   先写测试程序test.cpp,编译运行测试程序

--------------------------------- 