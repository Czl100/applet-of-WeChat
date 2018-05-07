# coding=utf-8

from crp.models import User

from sqlalchemy.orm.exc import NoResultFound
import datetime

def login(app, wxid):
    dbsession = app.sessionMaker()
    try : 
        user = dbsession.query(User).filter(User.wxid==wxid).one()
    except NoResultFound:
        # 未找到该用户，该用户首次登陆，入库。
        newUser = User(wxid=wxid, datetime=datetime.datetime.today())
        dbsession.add(newUser)
    finally:
        dbsession.commit()

