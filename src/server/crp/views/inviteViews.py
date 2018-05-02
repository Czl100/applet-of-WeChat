# coding=utf-8

from crp.services import sp, urlget, userWrapper
from flask import request
import json

def bindRoutes(app):
    @app.route("/invite", methods=['get', 'post'])
    @userWrapper(sessionIdCheck=True)
    def invite():
        raise Exception("not support the interface, now")
        return {}