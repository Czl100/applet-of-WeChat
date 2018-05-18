# coding=utf-8

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
    #os.chdir(os.path.dirname(__file__))
    print (os.path.dirname(__file__))
    os.chdir(os.path.dirname(__file__))
    print("===============next===========")
    
    # 创建服务器
    app = Flask(__name__)
    
    # 导入配置文件对象
    app.config.from_object(config)

    # 初始化数据库
    db = create_engine(app.config['SQLALCHEMY_DATABASE_URI'], encoding='utf-8', convert_unicode=True)
    crp.models.Base.metadata.create_all(db)
    app.dbEngine = db
    app.sessionMaker = sessionmaker(bind=db)

    # URL绑定
    crp.views.bind_routes(app)

    # 日志系统
    import logging
    file_handler = logging.FileHandler('../crp.log', encoding='UTF-8')
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s: %(message)s ''[in %(pathname)s:%(lineno)d]'))
    app.logger.addHandler(file_handler)

    return app