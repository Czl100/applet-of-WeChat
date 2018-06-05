# Python服务器工程

## 环境配置
在本地测试的时候，应配置所需要的环境：
* Python3.4

## 依赖包安装
在环境配置好后，还需要将Python所需要的依赖包进行安装
```
pip install Flask                   # Flask-WEB框架
pip install pymysql                 # Python3的mysql包
pip install flask-sqlalchemy        # 数据库ORM框架
pip install numpy                   # python数值计算扩展, 图像库需要 
pip install scipy                   # python科学计算扩展, 图像库需要
pip install scikit_image            # 图像库，用于缩放
```
若是安装包查询失败，请使用阿里镜像: `pip install <you-need> -i http://mirrors.aliyun.com/pypi/simple`

## 异常
每一个http请求均代表了一个服务/业务，当业务在服务器上无法完成时，便会抛出异常。例如输入的参数不满足条件时，业务是无法继续处理下去的，则会抛出异常。服务器异常通常是由于请求中的参数有问题，进而导致的，服务器异常种类：
* LackParamException
    http请求中缺乏某些参数。
* ErrorParamException
    http请求中的的参数有错误。
* Exception
    其他错误。