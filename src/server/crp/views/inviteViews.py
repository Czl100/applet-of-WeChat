# coding=utf-8

from crp.untils import sp, urlget, crpview, unescape
from crp.services import imgHistoryServices, invitesServices, userServices
from flask import request

def bind_routes(app):
    @app.route("/invite", methods=['post'])
    @crpview(hasSessionId=True)
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
        authorId, imgtitle, imgurl = imgHistoryServices.query_img_info(app, imgid=imgid)
        
        # 邀请信息入库
        invitesServices.add_invite(app, \
            imgtitle=imgtitle, imgurl=imgurl, nick=nick, inviterId=inviterId, authorId=authorId, content=content)
        
        return {}

    @app.route("/query-invites")
    @crpview(hasSessionId=True)
    def query_invites(sessionId):
        wxid=sp.wxid(sessionId)
        page = int(request.args.get("page", 1))     # 默认为查询第一页
        perpage = int(app.config["PERPAGE_SIZE"])

        # 从库中读取出邀请信息
        totalpage, invitesList = invitesServices.query_invites_page(app, authorId=wxid, perpage=perpage, page=page)
        return {"pages":totalpage, "list":invitesList}

    @app.route("/query-unread-number")
    @crpview(hasSessionId=True)
    def query_unread(sessionId):
        wxid = sp.wxid(sessionId)
        unreadnum = invitesServices.invite_unread_number(app, wxid=wxid)
        return {"number":unreadnum}

    @app.route("/read-invite")
    @crpview(hasSessionId=True)
    def read_invite(sessionId):
        wxid = sp.wxid(sessionId)
        inviteId = request.args.get("inviteId", None)
        if not inviteId:
            raise Exception("缺少参数-inviteId")
        invitesServices.invite_have_read(app, wxid=wxid, inviteId=inviteId)
        return {}

    @app.route("/read-all-invites")
    @crpview(hasSessionId=True)
    def read_all_invites(sessionId):
        wxid = sp.wxid(sessionId)
        invitesServices.invite_all_read(app, wxid=wxid)
        return {}