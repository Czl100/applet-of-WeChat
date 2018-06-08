# coding=utf-8

from crp.utils import sp, urlget, request_around, ip_times
from crp.views import sessionViews, imgViews, messagesViews, historyViews
from flask import request
import json

def bind_routes(app):
    @app.route("/")
    @app.route("/index")
    @request_around(app, request, requestlog=True)
    @app.limiter.limit("20 per minute")
    def index():
        return {"msg":"server running..."}

    @app.route("/debug-sessions")
    @request_around(app, request, requestlog=True)
    def debug_session():
        sessionId = request.args.get("sessionId", None)
        session = sp.session(sessionId)
        return {
            "session_number":sp.session_number(),
            "session":session}

    @app.route("/debug-requests")
    @request_around(app, request, requestlog=True)
    def debug_requests():
        return ip_times

    # @app.errorhandler(404)
    # @userWrapper()
    # def pageNotFound(error):
    #     raise Exception("page not found!")
    #     return {}

    # 绑定会话处理视图函数
    sessionViews.bind_routes(app)

    # 绑定图像处理相关视图函数
    imgViews.bind_routes(app)

    # 绑定历史查询视图函数
    historyViews.bind_routes(app)

    # 绑定邀请提醒视图函数
    messagesViews.bind_routes(app)