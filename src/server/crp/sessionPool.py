from werkzeug.contrib.cache import SimpleCache
import threading
import hashlib

class SessionPool:
    __cache__ = SimpleCache()           # 建立session缓存
    __wx2sessionId__ = SimpleCache()    # 建立wxid到sessionId的映射
    __lock__ = threading.Lock()
    __sessionNumber__ = 0           # 服务器建立以来session的总个数(已经不存在的session+仍然存在的session)
    __md5__ = hashlib.md5()             # md5生成器

    def __init__(self):
        pass

    # 生成新的session会话所需要的sessionId，并为该会话绑定wxid
    def newSession(self, wxid):
        # 避免1个微信用户建立多个会话
        if self.__wx2sessionId__.get(wxid):
            raise Exception("您已登陆，请退出先前的登陆")
        self.__lock__.acquire()
        self.__sessionNumber__+=1
        self.__lock__.release()

        self.__md5__.update(str(self.__sessionNumber__).encode("utf-8"))
        sessionId = self.__md5__.hexdigest()
        self.__cache__.set(sessionId, {"__wxid__":wxid})        # 为该会话创建字典
        self.__wx2sessionId__.set(wxid, sessionId)
        return sessionId
    
    # 删除指定的会话
    def delSession(self, sessionId):
        self.__lock__.acquire()
        try:
            dic = self.__cache__.get(sessionId)
            self.__cache__.delete(sessionId)
            self.__wx2sessionId__.delete(dic["__wxid__"])
        finally:
            self.__lock__.release()

    def getSessionData(self, sessionId):
        dic = None
        try:
            dic = self.__cache__.get(sessionId)
        finally:
            return dic

    def wxid(self, sessionId):
        return self.get(sessionId, "__wxid__")

    def get(self, sessionId, key):
        dic=self.__cache__.get(sessionId)
        return dic.get(key)

    def put(self, sessionId, key, val):
        dic=self.__cache__.get(sessionId)
        dic[key]=val