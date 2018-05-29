# coding=utf-8

from crp.models import ImgHistory
from crp.untils import sp
from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy import desc
import datetime

# 插入一条未处理完成的
def insert_notfinish_img_history(app, sessionId, imgid, imgtype, path, secret=None, key=None, imgtitle=None):
    dbsession = app.sessionMaker()
    wxid = sp.wxid(sessionId)
    kws = {
        "imgid":imgid,
        "wxid":wxid,
        "imgtitle":imgtitle,
        "imgtype":imgtype,
        "path":path,
        "secret":secret,
        "key":key,
        "datetime":datetime.datetime.today()
    }
    newHistory = ImgHistory(**kws)
    dbsession.add(newHistory)
    dbsession.commit()

# 当图像处理完成，更新该记录为已处理
def update_finish_img_history(app, imgid):
    dbsession = app.sessionMaker()
    tmpHistory = dbsession.query(ImgHistory).filter_by(imgid=imgid).first()
    tmpHistory.finish = True
    dbsession.commit()

# 查询imgid所对应的作者, 正确返回则找到匹配作者
def query_img_author(app, imgid):
    dbsession=app.sessionMaker()
    exist=False
    imgtitle=None
    try:
        # one，查找不到抛出异常. first，查找不到不会抛出异常    
        item = dbsession.query(ImgHistory).filter_by(imgid=imgid).first()
        exist = True if item else False
        imgtitle = item.imgtitle if exist else imgtitle
    finally:
        dbsession.commit()      # 提交事务，避免死锁
    return exist, imgtitle

def query_img_secret(app, imgid, key):
    dbsession = app.sessionMaker()
    secret = None
    try:
        item = dbsession.query(ImgHistory).filter_by(imgid=imgid).first()
        if not item:
            raise Exception("该图像没有隐藏数据")
        if item.key != key:
            raise Exception("密码错误")
        secret = item.secret
    finally:
        dbsession.commit()
    return secret

# 查询指定指定微信用户，指定页面的历史记录
def query_history_page(app, wxid, page, perpage):
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
            "imgtitle":item.imgtitle,
            "datetime":str(item.datetime),
            "finish":str(item.finish)
        }
        itemList.append(dicitem)

    return totalpage, itemList

# 查询imgid的图片相关信息，包括作者id，图片url，图片标题
def query_img_info(app, imgid):
    dbsession = app.sessionMaker()
    try:
        item = dbsession.query(ImgHistory).filter_by(imgid=imgid).one()
        authorId = item.wxid
        imgurl = app.config['ENABLE_HOST']+item.path
        imgtitle = item.imgtitle
    except NoResultFound:
        raise Exception("没有查询到imgid所对应的作者")
    finally:
        dbsession.commit()
    return authorId, imgtitle, imgurl