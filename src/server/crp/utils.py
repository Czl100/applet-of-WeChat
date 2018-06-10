import crp.sessionPool
import urllib.parse
import urllib.request
import json
import random
import threading
from werkzeug.contrib.cache import SimpleCache
from functools import wraps
from flask import request, Response
from threading import Lock
from crp.exception import CrpException, MissArgumentException, MissSessionIdException, NotExistsSessionException, AlgorithmProcessException


sp = crp.sessionPool.SessionPool()      # 创建会话池

# 解决反义字符问题
def unescape(s):
    from html.parser import HTMLParser
    return HTMLParser().unescape(s) if s!=None else None

# 请求参数包装
class RequestArg:
    def __init__(self, key, default=None, excep=None, allow_empty_string=True):
        self.__key__ = key
        self.__excep__ = excep
        self.__default__ = default
        self.__allow_empty_string__ = allow_empty_string
        
    def key(self):
        return self.__key__

    def __val__(self, mapper):
        v = mapper.get(self.__key__, None)
        if ((not self.__allow_empty_string__) and
                isinstance(v, str) and 
                (not v.strip())):
            v = None
        if v == None:
            if self.__excep__ == None:
                v = self.__default__
            else:
                raise MissArgumentException(str(self.__excep__))
        if isinstance(v, str) :
            v = unescape(v)
        return v

class GetArg(RequestArg):
    def val(self, request):
        return self.__val__(request.args)

class PostArg(RequestArg):
    def val(self, request):
        return self.__val__(request.form)

class FileArg(RequestArg):
    def val(self, request):
        return self.__val__(request.files)

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

# 线程安全的递增生成器函数
max_num = 2147483647
def inc_num_genfun(init_num, maxn): 
    lock = threading.Lock()
    while True:
        yield init_num
        # 避免多线程读写竞争
        lock.acquire()
        init_num+=1
        if init_num > maxn:
            init_num = 0
        lock.release()

# 递增的imgnum, 用于信息隐藏。imgid=md5(imgnum)
inc_imgnum_gen = inc_num_genfun(random.randint(0, max_num), max_num)

# 线程安全的唯一ID生成器函数
def unique_id_genfun():
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

# 设备ID唯一生成器
unique_did_gen = unique_id_genfun()

# 适配微信的分辨率
def fit_wx_resolution(imgpath):
    from skimage import io, transform
    img=io.imread(imgpath)
    height = img.shape[0]
    width = img.shape[1]
    if height<width:
        newheight = 1080
        newwidth = int(1080/height * width)
    elif height>width:
        newwidth = 1080
        newheight = int(1080/width * height)
    else:
        newwidth = 1080
        newheight = 1080
    img = transform.resize(img, (newheight, newwidth))
    io.imsave(imgpath,img)

def gen_phone_resolution(imgpath, outimgpath):
    from skimage import io, transform
    img=io.imread(imgpath)
    height = img.shape[0]
    width = img.shape[1]
    if height<width:
        newwidth = 64
        newheight = int(64/width * height)
    elif height>width:
        newheight = 64
        newwidth = int(64/height * width)
    else:
        newheight=64
        newwidth=64
    img = transform.resize(img, (newheight, newwidth))
    io.imsave(outimgpath,img)

# 水印嵌入进程
def wm_embed(app, inp_img, out_img, imgnum, isdel=True):
    import subprocess
    import os
    import platform
    wm_exe = app.config['WATERMARK_WIN'] if "Windows" in platform.platform() else app.config['WATERMARK_LINUX']
    wm_key = app.config['WATERMARK_KEY']
    cmd = "{0} {1} {2} {3} {4}".format(wm_exe, inp_img, wm_key, imgnum, out_img)
    p = subprocess.Popen([wm_exe, inp_img, wm_key, str(imgnum), out_img], shell=False, stdout=subprocess.PIPE)
    p.wait()
    if isdel:
        os.remove(inp_img)
    if p.returncode:
        raise AlgorithmProcessException()

# 水印提取进程
def wm_extract(app, inp_img, isdel=True):
    import subprocess
    import os
    import platform
    wm_exe = app.config['WATERMARK_WIN'] if "Windows" in platform.platform() else app.config['WATERMARK_LINUX']
    wm_key = app.config['WATERMARK_KEY']
    p = subprocess.Popen(args=[wm_exe, inp_img, wm_key], shell=False, stdout=subprocess.PIPE)
    p.wait()
    if isdel:
        os.remove(inp_img)
    if p.returncode:
        raise AlgorithmProcessException()
    extret = p.stdout.readline().strip().decode("utf-8")
    return extret

ip_times = {}
# 该装饰器用于请求预处理和后处理，包括记录请求事件，异常记录等
def request_around(app, request, args=None, requestlog=False, exceptlog=True, hasSessionId=False):
    if args == None:
        args = ()
    def innerWrapper(f):
        @wraps(f)
        def deractor(*ks, **kws):
            # 预处理(请求记录, sessionId测试)
            global ip_times
            ip = request.remote_addr
            ip_times[ip] = ip_times.get(ip, 0) + 1
            if requestlog:    
                view = request.url
                app.logger.info("[请求]{0} --- {1}".format(ip, view))
            try:
                rt = {"errcode":1}
                # sessionId的存在测试
                if hasSessionId:
                    sessionId = request.args.get("sessionId", None) or request.form.get("sessionId", None)
                    if sessionId == None:
                        raise MissSessionIdException()
                    elif sp.session(sessionId) == None:
                        raise NotExistsSessionException()
                    kws["sessionId"] = sessionId
                    app.logger.error("request---sessionId:{0}".format(sessionId))
                    app.logger.error("request---wxId:{0}".format(sp.wxid(sessionId)))
                # 装载kw
                for arg in args:
                    k = arg.key()
                    v = arg.val(request)
                    kws[k] = v
                # 视图函数处理
                rt = f(*ks, **kws)
            # 后处理(异常日志记录, 返回值JSON化)
                if not isinstance(rt, dict):
                    raise Exception("视图函数正在尝试返回非字典类型数据")
                rt["errcode"]=0
            except CrpException as e:
                # crp应用层面异常
                rt["errmsg"]=str(e)
                rt["errcode"]=e.errcode()
            except Exception as e:
                # 服务器其他异常
                rt["errmsg"]=str(e)
                rt["errcode"]=1
            if rt["errcode"] and exceptlog:
                app.logger.error("【异常】{0}".format(rt["errmsg"]))
            return Response(json.dumps(rt), mimetype='application/json')
        return deractor
    return innerWrapper
