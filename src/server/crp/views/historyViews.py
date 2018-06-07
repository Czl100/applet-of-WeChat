# coding=utf-8

from crp.utils import sp, request_around, GetArg
from crp.models import ImgHistory
from flask import request
from sqlalchemy import desc
from crp.services import imgHistoryServices

def bind_routes(app):
    @app.route("/query-history")
    @request_around(app, request, hasSessionId=True, args=(
        GetArg("page", default=1),   # 默认取第一页
    ))
    @app.limiter.limit("20 per minute")
    def history(sessionId, page):
        wxid = sp.wxid(sessionId)
        page = int(page)
        perpage = int(app.config["PERPAGE_SIZE"])

        # 数据库提取出该页数据
        totalpage, itemspage = imgHistoryServices.query_history_page(app, wxid=wxid, page=page, perpage=perpage)

        return {"pages":totalpage, "list":itemspage}