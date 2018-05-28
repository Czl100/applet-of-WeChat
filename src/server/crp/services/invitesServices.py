# coding=utf-8

from crp.models import Invites, User
from sqlalchemy import desc
import datetime
import math

# 添加一条邀请，邀请中需要包含图像相关信息
def add_invite(app, imgtitle, imgurl, nick, inviterId, authorId, content):
    dbsession = app.sessionMaker()
    oneInvite = Invites(imgurl=imgurl, imgtitle=imgtitle, inviterNick=nick, inviterId=inviterId, authorId=authorId, content=content, datetime=datetime.datetime.today())
    try:
        dbsession.add(oneInvite)        # 邀请入库
    finally:
        dbsession.commit()

# 查询邀请页
def query_invites_page(app, authorId, perpage, page):
    dbsession = app.sessionMaker()
    try:
        allItems = dbsession.query(Invites).filter_by(authorId=authorId).order_by(desc(Invites.unread)).order_by(desc(Invites.datetime)).all()
    finally:
        dbsession.commit()

    # 提取出该页数据
    totalpage = math.ceil(len(allItems)/perpage)
    startIdx = perpage*(page-1)
    endIdx = startIdx+perpage if startIdx+perpage<=len(allItems) else len(allItems)
    items = allItems[startIdx:endIdx]

    # 转化成字典形式
    itemList = []
    for item in items:
        dicitem = {
            "inviteId":item.id,
            "unread": item.unread,
            "inviter":item.inviterNick,
            "img":item.imgurl,
            "imgtitle":item.imgtitle,
            "content":item.content,
            "datetime":str(item.datetime)
        }
        itemList.append(dicitem)
    return totalpage, itemList

def invite_unread_number(app, wxid):
    dbsession = app.sessionMaker()
    try:
        count = dbsession.query(Invites).filter_by(authorId=wxid).filter_by(unread=1).count()
    finally:
        dbsession.commit()
    return count

def invite_have_read(app, wxid, inviteId):
    dbsession = app.sessionMaker()
    try:
        inviteItem = dbsession.query(Invites).filter_by(id=inviteId).first()
        if not inviteItem:
            raise Exception("not exists the inviteId")
        inviteItem.unread=0
    finally:
        dbsession.commit()

def invite_all_read(app, wxid):
    dbsession = app.sessionMaker()
    try:
        inviteList = dbsession.query(Invites).filter_by(authorId=wxid).filter_by(unread=1).all()
        for item in inviteList:
            item.unread = 0
    finally:
        dbsession.commit()
        
