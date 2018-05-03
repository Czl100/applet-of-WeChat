# coding=utf-8

from crp.services import sp, urlget, userWrapper, uniqueImgIdGen, md5
from flask import request,url_for
import json
import shutil

# 模仿数据隐藏处理
def dataHide(inpImgPath, outImgPath, imgId):
    shutil.copyfile(inpImgPath, outImgPath)
    return True

def bindRoutes(app):
    # 图像绑定视图函数
    @app.route("/img-bind", methods=["POST"])
    @userWrapper()
    def imgBind():
        # 处理图像
        imgId = next(uniqueImgIdGen)    # 获取该次操作的图像ID
        imgIdMD5 = md5(imgId)           # id的md5，主要是为了避免客户端窥探imgId
        imgFile = request.files['img']  # 图像文件
        inpImgPath = app.config["TMP_DIR"]+imgIdMD5+".jpeg"        # 原始图片路径
        outImgPath = app.config["IMG_DIR"]+imgIdMD5+".jpeg"        # 载迷图像输出路径
        imgFile.save(inpImgPath)                        # 将图像保存
        dataHide(inpImgPath, outImgPath, imgId)         # 调用C++信息隐藏处理
        imgUrl = app.config["DEV_LOCAL_HOST"]+"/static/img/"+imgIdMD5+".jpeg"
        # 插入新的绑定至数据库
        # sessionId = request.args.get("sessionId", None)
        # sp.get(sessionId, "wxid")
        return {"img":imgUrl, "msg":"it's test, and the img not contain watermarking of imgId"}

    # 作者溯源视图函数
    @app.route("/author-query", methods=["POST"])
    @userWrapper()
    def authorQuer():
        raise Exception("not support the interface, now")
        return {}