from werkzeug.contrib.cache import SimpleCache
import threading
import hashlib

class SessionPool:
    cache = SimpleCache()            # 建立session缓存
    lock = threading.Lock()
    __sessionNumber__ = 0           # 服务器建立以来session的总个数(已经不存在的session+仍然存在的session)
    md5 = hashlib.md5()             # md5生成器

    def __init__(self):
        pass

    # 生成新的session会话所需要的sessionId，并为该会话绑定wxid
    def newSession(self, wxid):
        self.lock.acquire()
        self.__sessionNumber__+=1
        self.lock.release()
        self.md5.update(str(self.__sessionNumber__).encode("utf-8"))
        sessionId = self.md5.hexdigest()
        self.cache.set(sessionId, {"wxid":wxid})        # 为该会话创建字典
        return sessionId

    def get(self, sessionId, key):
        dic=self.cache.get(sessionId)
        return dic.get(key)

    def put(self, sessionId, key, val):
        dic=self.cache.get(sessionId)
        dic[key]=val