# coding=utf-8

from crp.services import sp, urlget, userWrapper, uniqueImgIdGen, md5
from flask import request,url_for
import json
import time


# 模仿数据隐藏
def dataHide(inpImgPath, outImgPath, imgId, isdel=True):
    import shutil
    import os

    shutil.copyfile(inpImgPath, outImgPath)
    if isdel:
        os.remove(inpImgPath)
    return True

# 模仿数据提取
def dataExtract(inpImgPath, isdel=True):
    import os
    if isdel:
        os.remove(inpImgPath)
    return "123"

def bindRoutes(app):
    # 图像绑定视图函数
    @app.route("/img-bind", methods=["POST"])
    @userWrapper(hasSessionId=True)
    def imgBind(sessionId):
        # 处理图像
        imgId = next(uniqueImgIdGen)                    # 获取该次操作的图像ID
        timeStamp = str(int(time.time()*1000000))       # 转化为微秒级时间戳, 用作文件命名
        imgFile = request.files['img']                  # 图像文件
        inpImgPath = app.config["TMP_DIR"]+timeStamp+".jpeg"        # 原始图片路径
        outImgPath = app.config["IMG_DIR"]+timeStamp+".jpeg"        # 载迷图像输出路径
        imgFile.save(inpImgPath)                                    # 将图像保存
        # 提取图像id，查看id是否已经存在
        maybeImgId = dataExtract(inpImgPath, isdel=False)

        # 信息隐藏 生成载密图像
        dataHide(inpImgPath, outImgPath, imgId)         # 调用C++信息隐藏处理
        imgUrl = app.config["DEV_LOCAL_HOST"]+"/static/img/"+timeStamp+".jpeg"
        # 插入新的绑定至数据库
        # sessionId = request.args.get("sessionId", None)
        # sp.get(sessionId, "wxid")
        return {"img":imgUrl, "msg":"it's test, and the img not contain watermarking of imgId"}

    # 作者溯源视图函数
    @app.route("/author-query", methods=["POST"])
    @userWrapper(hasSessionId=True)
    def authorQuer(sessionId):
        imgFile = request.files['img']      # 图像文件
        timeStamp = time.time()*1000000     # 转化为微秒级时间戳, 用作文件命名
        inpImgPath = app.config["TMP_DIR"]+timeStamp+".jpeg"        # 原始图片路径
        imgFile.save(inpImgPath)                                    # 将图像保存
        imgId = dataExtract(inpImgPath)
        raise Exception("not support the interface, now")
        return {}