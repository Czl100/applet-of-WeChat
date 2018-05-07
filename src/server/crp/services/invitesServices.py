# coding=utf-8

from crp.models import Invites, User
from sqlalchemy import desc
import datetime

# 添加一条邀请，邀请中需要包含图像相关信息
def addInvite(app, imgtitle, imgurl, nick, inviterId, authorId, content):
    dbsession = app.sessionMaker()
    oneInvite = Invites(imgurl=imgurl, imgtitle=imgtitle, inviterNick=nick, inviterId=inviterId, authorId=authorId, content=content, datetime=datetime.datetime.today())
    try:
        dbsession.add(oneInvite)        # 邀请入库
        author = dbsession.query(User).filter_by(wxid=authorId).one()   # 未读信息递增
        author.unreadNum+=1
    finally:
        dbsession.commit()

# 查询邀请页
def queryInvitesPage(app, authorId, perpage, page):
    dbsession = app.sessionMaker()
    try:
        allItems = dbsession.query(Invites).filter_by(authorId=authorId).order_by(Invites.unread).order_by(desc(Invites.datetime)).all()
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
            "inviter":item.inviterNick,
            "img":item.imgurl,
            "title":item.imgtitle,
            "content":item.content
        }
        itemList.append(dicitem)
    return totalpage, itemList
