# coding=utf-8

from crp.models import ImgHistory
from crp.utils import sp
from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy import desc
from crp.exception import NotPassException, NotExistsInvisibleWatermarkException, NotExistImgidException
import datetime
import copy

# 插入一条未处理完成的
def insert_notfinish_img_history(app, sessionId, imgid, imgtype, path, secret=None, key=None, imgtitle=None):
    dbsession = app.sessionMaker()
    try:
        wxid = sp.wxid(sessionId)
        kws = {
            "imgid":imgid,
            "wxid":wxid,
            "imgtitle":imgtitle,
            "imgtype":imgtype,
            "path":path,
            "secret":secret,
            "key":key,
            "datetime":datetime.datetime.today()
        }
        newHistory = ImgHistory(**kws)
        dbsession.add(newHistory)
        dbsession.commit()
    except Exception as e:
        dbsession.rollback()
        raise e
    finally:
        dbsession.close()

def insert_finish_img_history(app, sessionId, imgid, imgnum, imgtype, path, secret=None, key=None, imgtitle=None, success=True):
    dbsession = app.sessionMaker()
    try:
        wxid = sp.wxid(sessionId)
        kws = {
            "imgid":imgid,
            "imgnum":imgnum,
            "wxid":wxid,
            "imgtitle":imgtitle,
            "imgtype":imgtype,
            "path":path,
            "secret":secret,
            "key":key,
            "datetime":datetime.datetime.today(),
            "finish": 1 if success else 2
        }
        newHistory = ImgHistory(**kws)
        dbsession.add(newHistory)
        dbsession.commit()
    except Exception as e:
        dbsession.rollback()
        raise e
    finally:
        dbsession.close()

# 当图像处理完成，更新该记录为已处理
def update_finish_img_history(app, imgid, success=True):
    dbsession = app.sessionMaker()
    try:
        tmpHistory = dbsession.query(ImgHistory).filter_by(imgid=imgid).first()
        tmpHistory.finish = 1 if success else 2
        dbsession.commit()
    except Exception as e:
        dbsession.rollback()
        raise e
    finally:
        dbsession.close()

# 查询imgid所对应的作者, 正确返回则找到匹配作者
def query_img_author(app, imgid):
    dbsession=app.sessionMaker()
    exist=False
    imgtitle=None
    try:
        # one，查找不到抛出异常. first，查找不到不会抛出异常    
        item = dbsession.query(ImgHistory).filter_by(imgid=imgid, imgtype=0).first()
        exist = True if item else False
        imgtitle = item.imgtitle if exist else imgtitle
        dbsession.commit()      # 提交事务，避免死锁
    except Exception as e:
        dbsession.rollback()
        raise e
    finally:
        dbsession.close()
    return exist, imgtitle

def query_img_secret(app, imgid, key):
    dbsession = app.sessionMaker()
    secret = None
    try:
        item = dbsession.query(ImgHistory).filter_by(imgid=imgid, imgtype=1).first()
        if not item:
            raise NotExistsInvisibleWatermarkException()
        if item.key != key:
            raise NotPassException()
        secret = item.secret
        dbsession.commit()
    except Exception as e:
        dbsession.rollback()
        raise e
    finally:
        dbsession.close()
    return secret

def query_imgid_exists(app, imgid):
    dbsession = app.sessionMaker()
    exists=False
    try:
        # one，查找不到抛出异常. first，查找不到不会抛出异常    
        item = dbsession.query(ImgHistory).filter_by(imgid=imgid).first()
        exists = True if item else False
        dbsession.commit()
    except Exception as e:
        dbsession.rollback()
        raise e
    finally:
        dbsession.close()
    return exists

# 查询指定指定微信用户，指定页面的历史记录
def query_history_page(app, wxid, page, perpage):
    # 数据库提取出该用户的所有图像
    dbsession = app.sessionMaker()
    try:
        db_allItems = dbsession.query(ImgHistory).filter_by(wxid=wxid).order_by(ImgHistory.finish).order_by(desc(ImgHistory.datetime)).all()
        allItems = copy.deepcopy(db_allItems)
        dbsession.commit()
    except Exception as e:
        dbsession.rollback()
        raise e
    finally:
        dbsession.close()

    # 提取出该页数据
    totalpage = int(len(allItems)/perpage) + 1
    startIdx = perpage*(page-1)
    endIdx = startIdx+perpage if startIdx+perpage<=len(allItems) else len(allItems)
    items = allItems[startIdx:endIdx]

    # 转化成字典形式
    itemList = []
    for item in items:
        smallpath = item.path.split(".jpeg")[0]+"_small.jpeg"
        dicitem = {
            "img":app.config['ENABLE_HOST']+item.path,
            "img_small":app.config['ENABLE_HOST']+smallpath,
            "imgtitle":item.imgtitle,
            "imgtype":item.imgtype,
            "datetime":str(item.datetime),
            "finish":str(item.finish)
        }
        itemList.append(dicitem)

    return totalpage, itemList

# 查询imgid的图片相关信息，包括作者id，图片url，图片标题
def query_img_info(app, imgid):
    dbsession = app.sessionMaker()
    try:
        item = dbsession.query(ImgHistory).filter_by(imgid=imgid).one()
        authorId = item.wxid
        imgurl = app.config['ENABLE_HOST']+item.path
        imgtitle = item.imgtitle
        dbsession.commit()
    except NoResultFound:
        dbsession.rollback()
        raise NotExistImgidException(imgid)
    finally:
        dbsession.close()
        
    return authorId, imgtitle, imgurl