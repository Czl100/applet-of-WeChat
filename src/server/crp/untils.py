import crp.sessionPool
import urllib.parse
import urllib.request
import json
from werkzeug.contrib.cache import SimpleCache
from functools import wraps
from flask import request
from threading import Lock  


sp = crp.sessionPool.SessionPool()      # 创建会话池

# 解决反义字符问题
def unescape(s):
    from html.parser import HTMLParser
    return HTMLParser().unescape(s)

# 提取对象中的特定属性转换为字典数据
def obj2map(obj, mapper):
    map = {}
    for onemap in mapper:
        objattr = onemap[0]
        if hasattr(obj, objattr):
            val = getattr(obj, objattr)
            mapattr = onemap[1]
            map[mapattr] = val
    return map

# 简化的get请求
def urlget(url, kvs=None):
    urlkvs = urllib.parse.urlencode(kvs)
    urlinstance = url+"?"+urlkvs if kvs else url
    respstr = urllib.request.urlopen(urlinstance, timeout=2).read().decode('utf-8')
    return respstr

# md5
def md5(s):
    import hashlib
    hasher = hashlib.md5()
    hasher.update(s.encode("utf-8"))
    return hasher.hexdigest()

# 唯一ID生成器函数
def unique_id_genfun():
    import random
    import threading
    
    uniqueNumber = random.random()
    lock = threading.Lock()
    while True:
        yield md5(str(uniqueNumber))
        # 避免多线程读写竞争
        lock.acquire()
        uniqueNumber+=1
        lock.release()

# 图像ID唯一生成器
unique_imgid_gen = unique_id_genfun()

# 视图函数返回装饰
# 被该装饰器修饰的视图函数成功时返回dict，并在其中添加fg=True的kv。失败则fg=False，并添加错误信息到msg字段
def crpview(hasSessionId=False):
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

# 该装饰器用于请求预处理和后处理，包括记录请求事件，限流，异常记录等
def request_around(app, request, requestlog=None, exceptlog=True, limit=True):
    def innerWrapper(f):
        @wraps(f)
        def deractor(*args, **kw):
            # 预处理
            if requestlog:
                ip = request.remote_addr
                view = request.url
                app.logger.debug("[请求]{0} --- {1}".format(ip, view))
            if limit:
                pass
            # 请求处理
            try:
                r = f(*args, **kw)
                return r
            # 后处理
            except Exception as e:
                if exceptlog:
                    app.logger.error("【异常】{0}".format(str(e)))
                raise e
        return deractor
    return innerWrapper