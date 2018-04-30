# 配置文件对象的属性名必须大写，否则无法导入

class BaseConfig:
    APPID = "wx41264935c14d52e7"
    APPSECRET = "f5b979faaaa9a2b389ed10e6458b741d"

class DevConfig(BaseConfig):
    DEBUG = True

class ProduceConfig(BaseConfig):
    pass

devConfig = DevConfig()
produceConfig = ProduceConfig()

configs={
    "devConfig" : devConfig,
    "produceConfig" : produceConfig,

    "defaultConfig" : devConfig
}