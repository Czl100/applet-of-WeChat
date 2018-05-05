import crp.sessionPool
import urllib.parse
import urllib.request
from functools import wraps
from flask import request
import json


sp = crp.sessionPool.SessionPool()      # 创建会话池

# 简化的get请求
def urlget(url, kvs=None):
    urlkvs = urllib.parse.urlencode(kvs)
    urlinstance = url+"?"+urlkvs if kvs else url
    print(urlinstance)
    respstr = urllib.request.urlopen(urlinstance, timeout=2).read().decode('utf-8')
    return respstr

# md5
def md5(s):
    import hashlib
    hasher = hashlib.md5()
    hasher.update(s.encode("utf-8"))
    return hasher.hexdigest()

# 唯一ID生成器函数
def uniqueIdGenFun():
    import random
    import threading
    
    uniqueNumber = random.random()
    lock = threading.Lock()
    while True:
        yield md5(str(uniqueNumber))
        uniqueNumber+=1

# 图像ID唯一生成器
uniqueImgIdGen = uniqueIdGenFun()

# 视图函数返回装饰
# 被该装饰器修饰的视图函数成功时返回dict，并在其中添加fg=True的kv。失败则fg=False，并添加错误信息到msg字段
def userWrapper(hasSessionId=False):
    def innerWrapper(f):
        @wraps(f)
        def deractor(*args, **kw):
            rt = {}
            try:
                # sessionId的存在测试
                if hasSessionId:
                    sessionId = request.args.get("sessionId", None) or request.form.get("sessionId", None)
                    if sessionId == None:
                        raise Exception("args need sessionId")
                    elif sp.getSessionData(sessionId) == None:
                        raise Exception("session not exists")
                    kw["sessionId"] = sessionId
                # 视图函数处理
                rt=f(*args, **kw)
                if not isinstance(rt, dict):
                    raise Exception("视图函数正在尝试返回非字典类型数据")
                rt["fg"]=True
            except Exception as e:
                rt["fg"]=False
                rt["msg"]=str(e)
            return json.dumps(rt)
        return deractor
    return innerWrapper