# 配置文件对象的属性名必须大写，否则无法导入

class __BaseConfig__:
    APPID = "wx41264935c14d52e7"
    APPSECRET = "f5b979faaaa9a2b389ed10e6458b741d"

class __DevConfig__(__BaseConfig__):
    DEBUG = True
    DB_HOST = "localhost"
    DB_USER = "ROOT"
    DB_PASSWORD = "HELLOworld0"

class __ProduceConfig__(__BaseConfig__):
    pass

devConfig = __DevConfig__()
produceConfig = __ProduceConfig__()