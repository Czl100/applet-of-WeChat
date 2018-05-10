# coding=utf-8

from crp.untils import sp, urlget, userWrapper, unescape
from crp.services import imgHistoryServices, invitesServices, userServices
from flask import request

def bindRoutes(app):
    @app.route("/invite", methods=['post'])
    @userWrapper(hasSessionId=True)
    def invite(sessionId):
        inviterId = sp.wxid(sessionId)
        content = unescape(request.form.get("content", ""))
        if len(content) >= 140:
            raise Exception("邀请内容的长度应小于140, 您输入的字符串长度为:"+str(len(content)))
            
        imgid = request.form.get("imgid", None)
        if imgid == None:
            raise Exception("缺少imgid参数")

        nick = request.form.get("nick", None)
        if not nick.strip():
            nick = None
        else:
            nick = unescape(nick)

        # 根据imgid查询受邀人
        authorId, imgtitle, imgurl = imgHistoryServices.queryImgInfo(app, imgid=imgid)
        
        # 邀请信息入库
        invitesServices.addInvite(app, \
            imgtitle=imgtitle, imgurl=imgurl, nick=nick, inviterId=inviterId, authorId=authorId, content=content)
        
        return {}

    @app.route("/query-invites")
    @userWrapper(hasSessionId=True)
    def inviteQuery(sessionId):
        wxid=sp.wxid(sessionId)
        page = int(request.args.get("page", 1))     # 默认为查询第一页
        perpage = int(app.config["PERPAGE_SIZE"])

        # 从库中读取出邀请信息
        totalpage, invitesList = invitesServices.queryInvitesPage(app, authorId=wxid, perpage=perpage, page=page)
        return {"pages":totalpage, "list":invitesList}

    @app.route("/query-unread-number")
    @userWrapper(hasSessionId=True)
    def unreadNum(sessionId):
        wxid = sp.wxid(sessionId)
        unreadnum = invitesServices.inviteUnreadNumber(app, wxid=wxid)
        return {"number":unreadnum}

    @app.route("/read-invite")
    @userWrapper(hasSessionId=True)
    def readInvite(sessionId):
        wxid = sp.wxid(sessionId)
        inviteId = request.args.get("inviteId", None)
        if not inviteId:
            raise Exception("缺少参数-inviteId")
        invitesServices.inviteHaveRead(app, wxid=wxid, inviteId=inviteId)
        return {}

    @app.route("/read-all-invites")
    @userWrapper(hasSessionId=True)
    def readAllInvites(sessionId):
        wxid = sp.wxid(sessionId)
        invitesServices.inviteAllRead(app, wxid=wxid)
        return {}