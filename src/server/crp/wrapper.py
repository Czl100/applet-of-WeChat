from functools import wraps
import json

def returnWrapper(f):
    @wraps(f)
    def deractor(*args, **kw):
        rt = {"fg":True}
        try:
            diction=f(*args, **kw)
            if not isinstance(diction, dict):
                raise Exception("视图函数正在尝试返回非字典类型数据")
            for k,v in diction.items():
                rt[k] = v
        except Exception as e:
            rt["fg"]=False
            rt["msg"]=str(e)
        return json.dumps(rt)
    return deractor