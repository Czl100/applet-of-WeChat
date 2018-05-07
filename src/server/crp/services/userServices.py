# coding=utf-8

from crp.models import User

from sqlalchemy.orm.exc import NoResultFound
import datetime

# 微信用户首次登录将会入库，主要是记录未读信息个数，便于查询未读信息个数
def login(app, wxid):
    dbsession = app.sessionMaker()
    try : 
        dbsession.query(User).filter(User.wxid==wxid).one()
    except NoResultFound:
        # 未找到该用户，该用户首次登陆，入库。
        newUser = User(wxid=wxid, datetime=datetime.datetime.today())
        dbsession.add(newUser)
    finally:
        dbsession.commit()

def queryUnreadNumber(app, wxid):
    dbsession = app.sessionMaker()
    try:
        user = dbsession.query(User).filter(User.wxid==wxid).one()
    except NoResultFound:
        raise Exception("未找到指定用户")
    finally:
        dbsession.commit()
    return user.unreadNum