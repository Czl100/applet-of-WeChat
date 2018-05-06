# coding=utf-8

from crp.services import sp, urlget, userWrapper
from crp.models import ImgHistory, Invites, User
from flask import request
from sqlalchemy.orm.exc import NoResultFound
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

        # 查库, imgid-->authorId
        dbsession = app.sessionMaker()
        try:
            item = dbsession.query(ImgHistory).filter_by(imgid=imgid).one()
            authorId = item.wxid
        except NoResultFound as e:
            raise Exception("没有查询到imgid所对应的作者")
        finally:
            dbsession.commit()
        
        # 邀请信息入库
        dbsession = app.sessionMaker()
        oneInvite = Invites(inviterId=inviterId, authorId=authorId, content=content, datetime=datetime.datetime.today())
        try:
            dbsession.add(oneInvite)        # 邀请入库
            author = dbsession.query(User).filter_by(wxid=authorId).one()   # 未读信息递增
            author.unread_notify_number+=1
        finally:
            dbsession.commit()
        
        return {}