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
pip install Flask-Limiter           # 安装flask限流插件
```
若是安装包查询失败，请使用阿里镜像: `pip install <you-need> -i http://mirrors.aliyun.com/pypi/simple`

## 异常
每一个HTTP/HTTPS请求均代表了一个服务/业务，当业务在服务器上无法完成时，便会抛出异常。例如输入的参数不满足条件时，业务是无法继续处理下去的，则会抛出异常。在接口调用后，将会返回JSON结果，JSON结果中的`errcode`字段将会提示业务处理的状况：
|errcode|异常类|异常描述|
|:-|:-|:-|
|0|-|业务处理成功，非异常|
|1|Exception|在crp平台预期外的异常|
|1000|CrpException|Crp平台预期内的异常|
|1001|MissSessionIdException|请求中缺少sessionId参数|
|1002|MissSessionIdException|请求中的sessionId所对应的会话不存在|
|1003|MissArgumentException|请求中缺少必需的参数|
|1004|DeviceConflictException|会话建立时设备冲突异常。具有活跃会话的微信用户，采用不同的did重新建立会话导致的异常|
|1005|AlgorithmProcessException|嵌入/提取算法进程运行异常|
|1006|DuplicateEmbedException|图片注册/不可见水印嵌入所采用的图像已经在平台中嵌入了imgid水印|
|1007|TooLoogContentException|内容长度过长的异常|
|1008|VerifyCodeException|微信小程序建立会话时，采用的临时凭证code有问题导致的异常|
|1009|NotPassException|不可见水印提取时密码错误导致的异常|
|1010|NotExistsInvisibleWatermarkException|不可见水印提取时选择了一个不含水印的图像所导致的异常|
|1011|NotExistImgidException|发送邀请时，找不到imgid导致的异常|
|1012|NotExistMessageidException|设置消息为已读时，找不到消息id导致的异常|