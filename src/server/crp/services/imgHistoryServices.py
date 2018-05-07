# coding=utf-8

from crp.models import ImgHistory
from crp.untils import sp
from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy import desc
import datetime

# 插入一条未处理完成的
def notFinishImgHistory(app, sessionId, imgid):
    dbsession = app.sessionMaker()
    wxid = sp.wxid(sessionId)
    newHistory = ImgHistory(imgid=imgid, wxid=wxid, datetime=datetime.datetime.today())
    dbsession.add(newHistory)
    dbsession.commit()

# 当图像处理完成，更新该记录为已处理
def updateFinishImgHistory(app, imgid, outImgPath):
    dbsession = app.sessionMaker()
    tmpHistory = dbsession.query(ImgHistory).filter_by(imgid=imgid).first()  
    tmpHistory.path = outImgPath
    tmpHistory.finish = True
    dbsession.commit()

# 查询imgid所对应的作者, 正确返回则找到匹配作者
def queryImgAuthor(app, imgid):
    dbsession=app.sessionMaker()
    title=None
    try:
        # one，查找不到抛出异常. first，查找不到不会抛出异常
        item = dbsession.query(ImgHistory).filter_by(imgid=imgid).one()
        title = item.title
    except NoResultFound:
        raise Exception("未能找到匹配作者")
    finally:
        dbsession.commit()      # 提交事务，避免死锁
    return title

# 查询指定指定微信用户，指定页面的历史记录
def queryHistoryPage(app, wxid, page, perpage):
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

    return totalpage, itemList

# 查询imgid的图片相关信息，包括作者id，图片url，图片标题
def queryImgInfo(app, imgid):
    dbsession = app.sessionMaker()
    try:
        item = dbsession.query(ImgHistory).filter_by(imgid=imgid).one()
        authorId = item.wxid
        imgurl = app.config['ENABLE_HOST']+item.path
        imgtitle = item.title
    except NoResultFound:
        raise Exception("没有查询到imgid所对应的作者")
    finally:
        dbsession.commit()
    return authorId, imgtitle, imgurl