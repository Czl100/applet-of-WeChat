# coding=utf-8

from crp.untils import sp, urlget, request_around, unique_did_gen, GetArg
from crp.services import userServices
from crp.exception import CrpException
from flask import request
import json

# 给初始app绑定路由，包括蓝图
def bind_routes(app):
    # 服务器生成新的设备id
    @app.route("/did")
    @request_around(app, request)
    def did_gen():
        return {"did":next(unique_did_gen)}

    # 会话建立
    @app.route("/session-build")
    @request_around(app, request, args=(
        GetArg("code", excep="缺少code参数"),
        GetArg("did", excep="缺少设备id参数(did)"),
    ))
    def session_build(code, did):
        url = app.config['CODE_TO_WXID_URL']
        # 获得wxid
        respstr = urlget(url, {
            "appid":app.config['APPID'],
            "secret":app.config['APPSECRET'],
            "js_code":code,
            "grant_type":"authorization_code"
        })
        respobj = json.loads(respstr)
        if(respobj.get("errcode", None)):
            raise CrpException("校验code失败，errcode:"+str(respobj.get("errcode", None)))
        
        # wxid首次登陆则将用户添加至数据库
        wxid = respobj["openid"]
        userServices.login(app, wxid)
        
        # 建立sessionId并和wxid绑定
        sessionId = sp.newSession(wxid, did)
        return {"sessionId":sessionId}

    # 会话销毁
    @app.route("/session-destroy")
    @request_around(app, request, hasSessionId=True)
    def session_destroy(sessionId):
        sp.delSession(sessionId)
        return {}

