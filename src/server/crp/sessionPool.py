from werkzeug.contrib.cache import SimpleCache
from crp.exception import DeviceConflictException
import threading
import hashlib
import time
try:
    import cPickle as pickle
except ImportError:  # pragma: no cover
    import pickle

class CrpCache(SimpleCache):
    def __init__(self, threshold=500, default_timeout=300):
        super().__init__(threshold=threshold, default_timeout=default_timeout)

    # 默认参数为SimpleCache的实现
    def set(self, key, value, timeout=None, refresh=True, addexpires=False):
        expires = self._normalize_timeout(timeout)
        if not refresh:
            # 如果没有该key，代表需要新添加，则采用原实现所采用的expires
            expires, _ = self._cache.get(key, (expires, None))
        self._prune()
        if addexpires:
            value["__expires__"] = expires
            value["__normalize_expires__"] = time.asctime(time.localtime(expires))
        self._cache[key] = (expires, pickle.dumps(value, pickle.HIGHEST_PROTOCOL))
        return True

class SessionPool:
    # 建立session缓存
    __cache__ = CrpCache(default_timeout=3600)
    # 建立wxid到sessionId和did的映射
    __wx2ids__ = CrpCache(default_timeout=3600)
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

    # 生成新的session会话所需要的sessionId，并为该会话绑定wxid
    def new_session(self, wxid, did):
        locker = self.__lock__
        cache = self.__cache__
        wx2ids = self.__wx2ids__
        # 该微信用户存在活跃会话
        print(wxid)
        if wx2ids.get(wxid):
            print("wxid:{}, is active.".format(wxid))
            # 对应设备存在活跃会话
            # if wx2ids.get(wxid).get("did") == did:
            #     sessionId = wx2ids.get(wxid).get("sessionId")
            #     # 刷新超时时间
            #     cache.set(sessionId, cache.get(sessionId), addexpires=True)
            #     wx2ids.set(wxid, wx2ids.get(wxid))
            #     return sessionId
            # else:
            #     raise DeviceConflictException()
            sessionId = wx2ids.get(wxid).get("sessionId")
            dic = cache.get(sessionId)
            dic["did"]=did
            cache.set(sessionId, dic, addexpires=True)
            wx2ids.set(wxid, wx2ids.get(wxid))
            return sessionId
        locker.acquire()
        try:
            self.__sessionNumber__+=1
            self.__md5__.update(str(self.__sessionNumber__).encode("utf-8"))
            sessionId = self.__md5__.hexdigest()
            cache.set(sessionId, {"__wxid__":wxid, "__did__":did}, addexpires=True)        # 为该会话创建字典
            wx2ids.set(wxid, {"sessionId":sessionId, "did":did})
        finally:
            locker.release()
        return sessionId
    
    def keep_session(self, sessionId):
        cache = self.__cache__
        wx2ids = self.__wx2ids__
        wxid = self.wxid(sessionId)
        
        # 刷新超时时间
        cache.set(sessionId, cache.get(sessionId), addexpires=True)
        wx2ids.set(wxid, wx2ids.get(wxid))

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
            # 不刷新过期时间
            self.__cache__.set(sessionId, dic, refresh=False, addexpires=True)
            return True