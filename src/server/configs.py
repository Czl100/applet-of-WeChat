# coding=utf-8

# 配置文件对象的属性名必须大写，否则无法导入

class __BaseConfig__:
    APPID = "wx41264935c14d52e7"
    APPSECRET = "f5b979faaaa9a2b389ed10e6458b741d"
    CODE_TO_WXID_URL = "https://api.weixin.qq.com/sns/jscode2session"
    STATIC_DIR = "static/"
    IMG_DIR = "static/img/"
    TMP_DIR = "static/tmp/"
    MAX_CONTENT_LENGTH = 200 * 1024 * 1024
    PERPAGE_SIZE = 10
    WATERMARK_KEY = "12345"
    WATERMARK_EXE = "../wm/main.exe"        # 因为当前工作路径为crp

class __DevConfig__(__BaseConfig__):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = "mysql+pymysql://root:HELLOworld0@111.230.92.161:3306/crp_dev?charset=utf8"
    ENABLE_HOST = "http://localhost:5000/"
    
class __ProduceConfig__(__BaseConfig__):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = "mysql+pymysql://root:HELLOworld0@111.230.92.161:3306/crp?charset=utf8"
    ENABLE_HOST = "https://crp.shakeel.cn/"

devConfig = __DevConfig__()
produceConfig = __ProduceConfig__()