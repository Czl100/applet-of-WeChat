from werkzeug.contrib.cache import SimpleCache
from crp.exception import DeviceConflictException
import threading
import hashlib

class SessionPool:
    # 建立session缓存
    __cache__ = SimpleCache(default_timeout=600)
    # 建立wxid到sessionId和did的映射
    __wx2ids__ = SimpleCache()
    # 服务器建立以来session的总个数(已经不存在的session+仍然存在的session)
    __sessionNumber__ = 0
    # md5生成器
    __md5__ = hashlib.md5()
    # 线程安全的独占锁
    __lock__ = threading.Lock()

    def __init__(self):
        pass

    def session_number(self):
        return self.__sessionNumber__

    def expires(self, sessionId=None):
        import time
        cache = self.__cache__
        if sessionId:
            expires, _ = cache._cache.get(sessionId, (None, None))
            return time.asctime(time.localtime(expires)) if expires else None
        else:
            expires_mapper = {}
            for k, v in cache._cache.items() :
                if cache.get(k):
                    expires_mapper[k]=time.asctime(time.localtime(v[0]))
            return expires_mapper

    # 生成新的session会话所需要的sessionId，并为该会话绑定wxid
    def new_session(self, wxid, did):
        locker = self.__lock__
        cache = self.__cache__
        wx2ids = self.__wx2ids__

        # 该微信用户存在活跃会话
        if wx2ids.get(wxid):
            # 对应设备存在活跃会话
            if wx2ids.get(wxid).get("did") == did:
                sessionId = wx2ids.get(wxid).get("sessionId")
                # 刷新超时时间
                cache.set(sessionId, cache.get(sessionId))
                return sessionId
            else:
                raise DeviceConflictException()
        locker.acquire()
        self.__sessionNumber__+=1
        locker.release()
        print("sessionNumber:", self.__sessionNumber__)
        self.__md5__.update(str(self.__sessionNumber__).encode("utf-8"))
        sessionId = self.__md5__.hexdigest()
        cache.set(sessionId, {"__wxid__":wxid, "__did__":did})        # 为该会话创建字典
        wx2ids.set(wxid, {"sessionId":sessionId, "did":did})
        return sessionId
    
    # 删除指定的会话
    def del_session(self, sessionId):
        self.__lock__.acquire()
        try:
            dic = self.__cache__.get(sessionId)
            self.__cache__.delete(sessionId)
            self.__wx2ids__.delete(dic["__wxid__"])
        finally:
            self.__lock__.release()

    def session(self, sessionId=None):
        cache = self.__cache__
        if sessionId:
            return cache.get(sessionId)
        else:
            sessions_mapper = {}
            for k in cache._cache.keys() :
                if cache.get(k):
                    sessions_mapper[k]=cache.get(k)
            return sessions_mapper

    def wxid(self, sessionId):
        return self.get(sessionId, "__wxid__")

    def get(self, sessionId, key):
        dic=self.__cache__.get(sessionId)
        return dic.get(key) if dic else None

    def put(self, sessionId, key, val):
        dic=self.__cache__.get(sessionId)
        if dic:
            dic[key]=val
            return True