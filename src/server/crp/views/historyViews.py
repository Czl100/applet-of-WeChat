# coding=utf-8

from crp.untils import userWrapper, sp
from crp.models import ImgHistory
from flask import request
from sqlalchemy import desc
from crp.services import imgHistoryServices

def bindRoutes(app):
    @app.route("/query-history")
    @userWrapper(hasSessionId=True)
    def history(sessionId):
        page = request.args.get("page", 1)          # 默认取第一页
        wxid = sp.wxid(sessionId)
        page = int(page)
        perpage = int(app.config["PERPAGE_SIZE"])

        # 数据库提取出该页数据
        totalpage, itemspage = imgHistoryServices.queryHistoryPage(app, wxid=wxid, page=page, perpage=perpage)

        return {"pages":totalpage, "list":itemspage}