#cpp
information hiding
    
    
centos7下部分配置：cd etc/ld.so.conf
    添加：/local/opencv-3.0.0/lib
    centos中文件内容
    usr/local/bin       opencv_annotation;opencv_createsamples;opencv_traincascade(均是安装生成的)
    usr/local/include   opencv;opencv2
    usr/local/lib       各种.so文件
    usr/local/lib64     空
    usr/local/share     applications文件夹；info文件夹；man文件夹；OpenCV文件夹
    usr/local/src       空
    usr/local           main.cpp 原图，生成图像，生成exe文件    

    usr/local/opencv3.0.0
    OpenCV-3.0.0
        bin：    各种执行文件，包含usr/local下面的3个文件(同waterMarker)
        include:  opencv;opencv2  
        lib:       .so文件 