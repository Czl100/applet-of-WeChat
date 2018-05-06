# coding=utf-8

from crp.services import sp, urlget, userWrapper
from crp.models import ImgHistory, Invites, User
from flask import request
from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy import desc
import json
import datetime

def bindRoutes(app):
    @app.route("/invite", methods=['post'])
    @userWrapper(hasSessionId=True)
    def invite(sessionId):
        inviterId = sp.wxid(sessionId)
        content = request.form.get("content", "")
        if len(content) >= 140:
            raise Exception("邀请内容的长度应小于140, 您输入的字符串长度为:"+str(len(content)))
            
        imgid = request.form.get("imgid", None)
        if imgid == None:
            raise Exception("缺少imgid参数")

        nick = request.form.get("nick", None)
        if not nick.strip():
            nick = None

        # 查库, imgid-->authorId
        dbsession = app.sessionMaker()
        try:
            item = dbsession.query(ImgHistory).filter_by(imgid=imgid).one()
            authorId = item.wxid
            imgurl = app.config['ENABLE_HOST']+item.path
            imgtitle = item.title
        except NoResultFound as e:
            raise Exception("没有查询到imgid所对应的作者")
        finally:
            dbsession.commit()
        
        # 邀请信息入库
        dbsession = app.sessionMaker()
        oneInvite = Invites(imgurl=imgurl, imgtitle=imgtitle, inviterNick=nick, inviterId=inviterId, authorId=authorId, content=content, datetime=datetime.datetime.today())
        try:
            dbsession.add(oneInvite)        # 邀请入库
            author = dbsession.query(User).filter_by(wxid=authorId).one()   # 未读信息递增
            author.unreadNum+=1
        finally:
            dbsession.commit()
        
        return {}

    @app.route("/invite-query")
    @userWrapper(hasSessionId=True)
    def inviteQuery(sessionId):
        wxid=sp.wxid(sessionId)
        page = request.args.get("page", None)
        if page==None:
            raise Exception("lack page")
        page = int(page)
        perpage = int(app.config["PERPAGE_SIZE"])

        # 从库中读取出邀请信息
        dbsession = app.sessionMaker()
        try:
            allItems = dbsession.query(Invites).filter_by(authorId=wxid).order_by(Invites.unread).order_by(desc(Invites.datetime)).all()
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
        return {"pages":totalpage, "list":itemList}