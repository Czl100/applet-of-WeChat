# coding=utf-8

class CrpException(Exception):
    __errcode__ = 1000

    def __init__(self, value):
        super().__init__(value)
    
    def errcode(self):
        return self.__errcode__

# 参数中缺少sessionId的异常
class MissSessionIdException(CrpException):
    __errcode__ = 1001
    __value__ = "缺少sessionId参数"
    def __init__(self):
        super().__init__(self.__value__)

class NotExistsSessionException(CrpException):
    __errcode__ = 1002
    __value__ = "未登录，会话不存在，请登录后操作"
    def __init__(self):
        super().__init__(self.__value__)

# 请求中缺少参数的异常
class MissArgumentException(CrpException):
    __errcode__ = 1003

# 会话建立时设备冲突异常
class DeviceConflictException(CrpException):
    __errcode__ = 1004
    __value__ = "您已在其他设备上登陆，无法再次登录"
    def __init__(self):
        super().__init__(self.__value__)

# 嵌入/提取算法进程异常
class AlgorithmProcessException(CrpException):
    __errcode__ = 1005
    __value__ = "算法进程错误"
    def __init__(self):
        super().__init__(self.__value__)

# 重复嵌入异常
class DuplicateEmbedException(CrpException):
    __errcode__ = 1006
    __value__ = "该图像已嵌入过水印"
    def __init__(self):
        super().__init__(self.__value__)

# 字符串长度异常
class TooLoogContentException(CrpException):
    __errcode__ = 1007
    __value__ = "长度不应大于{0}, 您输入的字符串长度为{1}"
    def __init__(self, maxlen, length):
        super().__init__(self.__value__.format(maxlen, length))

# 微信临时凭证验证失败
class VerifyCodeException(CrpException):
    __errcode__ = 1008
    __value__ = "校验code失败. 错误码:{0}, 错误信息:{1}"
    def __init__(self, errcode, errmsg):
        super().__init__(self.__value__.format(errcode, errmsg))

# 不可见水印提取密码错误异常
class NotPassException(CrpException):
    __errcode__ = 1009
    __value__ = "密码错误"
    def __init__(self):
        super().__init__(self.__value__)

# 图像中不存在不可见水印异常
class NotExistsInvisibleWatermarkException(CrpException):
    __errcode__ = 1010
    __value__ = "图像不存在不可见水印"
    def __init__(self):
        super().__init__(self.__value__)

# 发送邀请时找不到imgid异常
class NotExistImgidException(CrpException):
    __errcode__ = 1010
    __value__ = "消息无法发送给不存在的imgid:{0}"
    def __init__(self, imgid):
        super().__init__(self.__value__.format(imgid))

# 设置消息为已读时，找不到消息id
class NotExistMessageidException(CrpException):
    __errcode__ = 1010
    __value__ = "找不到messageId:{0}"
    def __init__(self, messageId):
        super().__init__(self.__value__.format(messageId))