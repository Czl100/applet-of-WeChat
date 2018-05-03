# coding=utf-8

# 配置文件对象的属性名必须大写，否则无法导入

class __BaseConfig__:
    APPID = "wx41264935c14d52e7"
    APPSECRET = "f5b979faaaa9a2b389ed10e6458b741d"
    CODE_TO_WXID_URL = "https://api.weixin.qq.com/sns/jscode2session"
    STATIC_DIR = "static/"
    IMG_DIR = "static/img/"
    TMP_DIR = "static/tmp/"
    
class __DevConfig__(__BaseConfig__):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = "mysql+pymysql://root:@localhost:3306/crp"
    DEV_LOCAL_HOST = "http://localhost:5000"
    
class __ProduceConfig__(__BaseConfig__):
    pass

devConfig = __DevConfig__()
produceConfig = __ProduceConfig__()