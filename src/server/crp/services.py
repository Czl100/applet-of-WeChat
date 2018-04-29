import crp.sessionPool
import urllib.parse
import urllib.request

sp = crp.sessionPool.SessionPool()      # 创建会话池

# 简化的get请求
def urlget(url, kvs=None):
    urlkvs = urllib.parse.urlencode(kvs)
    urlinstance = url+"?"+urlkvs if kvs else url
    print(urlinstance)
    respstr = urllib.request.urlopen(urlinstance, timeout=2).read().decode('utf-8')
    return respstr
