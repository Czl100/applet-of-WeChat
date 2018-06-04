# coding=utf-8

from crp.untils import sp, urlget, unescape, request_around, PostArg, GetArg
from crp.services import imgHistoryServices, invitesServices, userServices
from crp.exception import CrpException
from flask import request

def bind_routes(app):
    @app.route("/invite", methods=['post'])
    @request_around(app, request, hasSessionId=True, args=(
        PostArg("content", default=""),
        PostArg("imgid", excep="缺少imgid参数"),
        PostArg("nick", default=""),
    ))
    def invite(sessionId, imgid, content, nick):
        inviterId = sp.wxid(sessionId)

        if len(content) >= 140:
            raise CrpException("邀请内容的长度应小于140, 您输入的字符串长度为:"+str(len(content)))

        if not nick.strip():
            nick = None

        # 根据imgid查询受邀人
        authorId, imgtitle, imgurl = imgHistoryServices.query_img_info(app, imgid=imgid)
        # 邀请信息入库
        invitesServices.add_invite(app, \
            imgtitle=imgtitle, imgurl=imgurl, nick=nick, inviterId=inviterId, authorId=authorId, content=content)
        return {}

    @app.route("/query-invites")
    @request_around(app, request, hasSessionId=True, args=(
        GetArg("page", default="1"),
    ))
    def query_invites(sessionId, page):
        print(page)
        wxid=sp.wxid(sessionId)
        page = int(page)     # 默认为查询第一页
        perpage = int(app.config["PERPAGE_SIZE"])

        # 从库中读取出邀请信息
        totalpage, invitesList = invitesServices.query_invites_page(app, authorId=wxid, perpage=perpage, page=page)
        return {"pages":totalpage, "list":invitesList}

    @app.route("/query-unread-number")
    @request_around(app, request, hasSessionId=True)
    def query_unread(sessionId):
        wxid = sp.wxid(sessionId)
        unreadnum = invitesServices.invite_unread_number(app, wxid=wxid)
        return {"number":unreadnum}

    @app.route("/read-invite", methods=['post'])
    @request_around(app, request, hasSessionId=True, args=(
        PostArg("inviteId", excep="缺少参数inviteId"),
    ))
    def read_invite(sessionId, inviteId):
        wxid = sp.wxid(sessionId)
        invitesServices.invite_have_read(app, wxid=wxid, inviteId=inviteId)
        return {}

    @app.route("/read-all-invites", methods=['post'])
    @request_around(app, request, hasSessionId=True)
    def read_all_invites(sessionId):
        wxid = sp.wxid(sessionId)
        invitesServices.invite_all_read(app, wxid=wxid)
        return {}