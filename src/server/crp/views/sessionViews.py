# coding=utf-8

from crp.untils import sp, urlget, crpview, request_around
from crp.services import userServices
from flask import request
import json

# 给初始app绑定路由，包括蓝图
def bind_routes(app):
    # 会话建立
    @app.route("/sessionBuild/<code>")
    @crpview()
    @request_around(app, request, requestlog=True)
    def session_build(code):
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
        
        # wxid首次登陆则将用户添加至数据库
        wxid = respobj["openid"]
        userServices.login(app, wxid)
        
        # 建立sessionId并和wxid绑定
        sessionId = sp.newSession(wxid)
        return {"sessionId":sessionId}

    # 会话销毁
    @app.route("/sessionDestroy")
    @crpview(hasSessionId=True)
    def session_destroy(sessionId):
        sp.delSession(sessionId)
        return {}

