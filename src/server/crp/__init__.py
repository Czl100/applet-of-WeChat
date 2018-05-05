# coding=utf-8

from crp.views import bindRoutes
from flask import Flask
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import pymysql
import crp.models
import crp.views
import sys
import os


def create_app(config):
    
    # 偏函
    import functools
    global open
    open = functools.partial(open, encoding='utf-8')

    #重置工作目录
    os.chdir(os.path.dirname(__file__))
    
    # 创建服务器
    app = Flask(__name__)
    
    # 导入配置文件对象
    app.config.from_object(config)

    # 初始化数据库
    db = create_engine(app.config['SQLALCHEMY_DATABASE_URI'])
    crp.models.Base.metadata.create_all(db)
    app.dbEngine = db
    app.sessionMaker = sessionmaker(bind=db)

    # URL绑定
    crp.views.bindRoutes(app)

    return app