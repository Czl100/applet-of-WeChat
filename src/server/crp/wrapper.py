from functools import wraps

def returnWrapper(f):
    @wraps(f)
    def deractor(*args, **kw):
        rt = {}
        try:
            diction=f(args, kw)
            if not isinstance(diction, dict):
                raise Exception("视图函数正在尝试返回非字典类型数据")
            for k,v in diction.items():
                rt[k] = v
        except e as Exception:
            rt["fg"]=False
            rt["msg"]=str(e)
    return deractor