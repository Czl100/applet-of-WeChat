# coding=utf-8

from crp.services import sp, urlget, userWrapper
from flask import request
import json

def bindRoutes(app):
    # 图像绑定视图函数
    @app.route("/img-bind", methods=["POST"])
    @userWrapper()
    def imgBind():
        raise Exception("not support the interface, now")
        return {}

    # 作者溯源视图函数
    @app.route("/author-query", methods=["POST"])
    @userWrapper()
    def authorQuer():
        raise Exception("not support the interface, now")
        return {}