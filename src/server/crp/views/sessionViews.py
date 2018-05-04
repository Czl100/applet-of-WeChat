from crp.services import sp, urlget, userWrapper
from flask import request
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm.exc import MultipleResultsFound, NoResultFound
from crp.models import User
import json
import datetime

# 给初始app绑定路由，包括蓝图
def bindRoutes(app):
    # 会话建立
    @app.route("/sessionBuild/<code>")
    @userWrapper()
    def sessionBuild(code):
        url = app.config['CODE_TO_WXID_URL']
        # 获得wxid
        respstr = urlget(url, {
            "appid":app.config['APPID'],
            "secret":app.config['APPSECRET'],
            "js_code":code,
            "grant_type":"authorization_code"
        })
        respobj = json.loads(respstr)
        print(respobj)
        if(respobj.get("errcode", None)):
            raise Exception("校验code失败，errcode:"+str(respobj.get("errcode", None)))
        
        # wxid首次登陆则将用户添加至数据库
        wxid = respobj["openid"]
        db = app.dbEngine
        dbsession = sessionmaker(bind=db)()
        try : 
            user = dbsession.query(User).filter(User.wxid==wxid).one()
        except NoResultFound as e:
            newUser = User(wxid=wxid, unread_notify_number=0, create_date=datetime.datetime.today())
            dbsession.add(newUser)
        finally:
            dbsession.commit()
        
        # 建立sessionId并和wxid绑定
        sessionId = sp.newSession(wxid)
        return {"sessionId":sessionId}

    # 会话销毁
    @app.route("/sessionDestroy")
    @userWrapper(haveSessionId=True)
    def sessionDestroy(sessionId):
        sp.delSession(sessionId)
        return {}

