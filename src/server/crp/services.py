import crp.sessionPool
import urllib.parse
import urllib.request
from functools import wraps
import json


sp = crp.sessionPool.SessionPool()      # 创建会话池

# 简化的get请求
def urlget(url, kvs=None):
    urlkvs = urllib.parse.urlencode(kvs)
    urlinstance = url+"?"+urlkvs if kvs else url
    print(urlinstance)
    respstr = urllib.request.urlopen(urlinstance, timeout=2).read().decode('utf-8')
    return respstr

# 视图函数返回装饰
# 被该装饰器修饰的视图函数成功时返回dict，并在其中添加fg=True的kv。失败则fg=False，并添加错误信息到msg字段
def returnWrapper(f):
    @wraps(f)
    def deractor(*args, **kw):
        rt = {}
        try:
            rt=f(*args, **kw)
            if not isinstance(diction, dict):
                raise Exception("视图函数正在尝试返回非字典类型数据")
            rt["fg"]=True
        except Exception as e:
            rt["fg"]=False
            rt["msg"]=str(e)
        return json.dumps(rt)
    return deractor