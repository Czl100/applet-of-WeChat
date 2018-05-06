# coding=utf-8

from crp.services import userWrapper, sp
from crp.models import ImgHistory
from flask import request
from sqlalchemy import desc

def bindRoutes(app):
    @app.route("/history")
    @userWrapper(hasSessionId=True)
    def history(sessionId):
        page = request.args.get("page", None)
        if page==None:
            raise Exception("lack page")
        page = int(page)
        wxid = sp.wxid(sessionId)
        perpage = int(app.config["PERPAGE_SIZE"])

        # 数据库提取出该用户的所有图像
        dbsession = app.sessionMaker()
        try:
            allItems = dbsession.query(ImgHistory).filter_by(wxid=wxid).order_by(ImgHistory.finish).order_by(desc(ImgHistory.datetime)).all()
        finally:
            dbsession.commit()

        # 提取出该页数据
        totalpage = int(len(allItems)/perpage) + 1
        startIdx = perpage*(page-1)
        endIdx = startIdx+perpage if startIdx+perpage<=len(allItems) else len(allItems)
        items = allItems[startIdx:endIdx]

        # 转化成字典形式
        itemList = []
        for item in items:
            dicitem = {
                "img":app.config['ENABLE_HOST']+item.path,
                "title":item.title,
                "date":str(item.datetime),
                "finish":str(item.finish)
            }
            itemList.append(dicitem)
        return {"pages":totalpage, "list":itemList}