# coding=utf-8

from crp.services import sp, urlget, userWrapper
from crp.views import sessionViews, imgViews, inviteViews, historyViews
from flask import request
import json

def bindRoutes(app):
    @app.route("/")
    @app.route("/index")
    @app.route("/debug")
    @userWrapper()
    def index():
        sessionId = request.args.get("sessionId", None)
        session = str(sp.getSessionData(sessionId)) if sessionId else "None"
        return {"msg":"server running...", "session":session}

    # 绑定会话处理视图函数
    sessionViews.bindRoutes(app)

    # 绑定图像处理相关视图函数
    imgViews.bindRoutes(app)

    # 绑定历史查询视图函数
    historyViews.bindRoutes(app)

    # 绑定邀请提醒视图函数
    inviteViews.bindRoutes(app)