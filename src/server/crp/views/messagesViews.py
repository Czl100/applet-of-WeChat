# coding=utf-8

from crp.utils import sp, urlget, unescape, request_around, PostArg, GetArg
from crp.services import imgHistoryServices, messagesServices, userServices
from crp.exception import CrpException
from flask import request

def bind_routes(app):
    @app.route("/send-message", methods=['post'])
    @request_around(app, request, hasSessionId=True, args=(
        PostArg("content", default=""),
        PostArg("imgid", excep="缺少imgid参数"),
        PostArg("nick", default=""),
    ))
    @app.limiter.limit("20 per minute")
    def send_message(sessionId, imgid, content, nick):
        senderId = sp.wxid(sessionId)

        if len(content) >= 140:
            raise CrpException("邀请内容的长度应小于140, 您输入的字符串长度为:"+str(len(content)))

        if not nick.strip():
            nick = None

        # 根据imgid查询受邀人
        authorId, imgtitle, imgurl = imgHistoryServices.query_img_info(app, imgid=imgid)
        # 邀请信息入库
        messagesServices.add_message(app, \
            imgtitle=imgtitle, imgurl=imgurl, nick=nick, senderId=senderId, authorId=authorId, content=content)
        return {}

    @app.route("/query-messages")
    @request_around(app, request, hasSessionId=True, args=(
        GetArg("page", default="1"),
    ))
    @app.limiter.limit("20 per minute")
    def query_messages(sessionId, page):
        print(page)
        wxid=sp.wxid(sessionId)
        page = int(page)     # 默认为查询第一页
        perpage = int(app.config["PERPAGE_SIZE"])

        # 从库中读取出邀请信息
        totalpage, messageList = messagesServices.query_messages_page(app, authorId=wxid, perpage=perpage, page=page)
        return {"pages":totalpage, "list":messageList}

    @app.route("/query-unread-number")
    @request_around(app, request, hasSessionId=True)
    @app.limiter.limit("20 per minute")
    def query_unread(sessionId):
        wxid = sp.wxid(sessionId)
        unreadnum = messagesServices.message_unread_number(app, wxid=wxid)
        return {"number":unreadnum}

    @app.route("/read-message", methods=['post'])
    @request_around(app, request, hasSessionId=True, args=(
        PostArg("messageId", excep="缺少参数messageId"),
    ))
    @app.limiter.limit("20 per minute")
    def read_message(sessionId, messageId):
        wxid = sp.wxid(sessionId)
        messagesServices.message_have_read(app, wxid=wxid, messageId=messageId)
        return {}

    @app.route("/read-all-messages", methods=['post'])
    @request_around(app, request, hasSessionId=True)
    @app.limiter.limit("20 per minute")
    def read_all_messages(sessionId):
        wxid = sp.wxid(sessionId)
        messagesServices.messages_all_read(app, wxid=wxid)
        return {}