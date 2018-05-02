from crp.services import sp, urlget, userWrapper
from flask import request
import json

# 给初始app绑定路由，包括蓝图
def bindRoutes(app):
    # 会话建立
    @app.route("/sessionBuild/<code>")
    @userWrapper()
    def sessionBuild(code):
        url = app.config['CODE_TO_WXID_URL']
        # 获得wxid
        respstr = urlget(url, {
            "appid":app.config['APPID'],
            "secret":app.config['APPSECRET'],
            "js_code":code,
            "grant_type":"authorization_code"
        })
        respobj = json.loads(respstr)
        print(respobj)
        if(respobj.get("errcode", None)):
            raise Exception("校验code失败，errcode:"+str(respobj.get("errcode", None)))
        
        # 建立sessionId并和wxid绑定
        wxid = respobj["openid"]
        sessionId = sp.newSession(wxid)
        return {"sessionId":sessionId}

    # 会话销毁
    @app.route("/sessionDestroy")
    @userWrapper(sessionIdCheck=True)
    def sessionDestroy():
        sessionId = request.args.get("sessionId", None)
        if sessionId:
            sp.delSession(sessionId)
        return {}

