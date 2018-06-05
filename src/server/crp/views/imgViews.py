# coding=utf-8

from crp.untils import sp, urlget, md5, unescape, request_around, inc_imgnum_gen, PostArg, FileArg, fit_wx_resolution
from crp.services import imgHistoryServices
from crp.exception import CrpException
from flask import request

# 模仿数据隐藏
def data_hide(inpImgPath, outImgPath, imgnum, isdel=True):
    import shutil
    import os

    shutil.copyfile(inpImgPath, outImgPath)
    if isdel:
        os.remove(inpImgPath)
    return True

# 模仿数据提取
def data_extract(inpImgPath, isdel=True):
    import os
    if isdel:
        os.remove(inpImgPath)
    return 0

def data_extract2(inpImgPath, isdel=True):
    import os
    if isdel:
        os.remove(inpImgPath)
    return 1

def bind_routes(app):
    import time

    # 图像绑定视图函数
    @app.route("/img-bind", methods=["POST"])
    @request_around(app, request, hasSessionId=True, args=(
        FileArg("img", excep="缺少图像文件"),
        PostArg("imgtitle", default=None),
    ))
    def img_bind(sessionId, img, imgtitle):
        imgnum = next(inc_imgnum_gen)
        imgid = md5(str(imgnum))

        timeStamp = str(int(time.time()*1000000))                   # 转化为微秒级时间戳, 用作文件命名
        inpImgPath = app.config["TMP_DIR"]+timeStamp+".jpeg"        # 原始图片路径
        outImgPath = app.config["IMG_DIR"]+timeStamp+".jpeg"        # 载迷图像输出路径
        img.save(inpImgPath)                                        # 将图像保存
        fit_wx_resolution(inpImgPath)                               # 修改输入图像的分辨率
        # 提取图像id，查看id是否已经存在
        # maybeImgId = dataExtract(inpImgPath, isdel=False)

        # 先插入历史记录
        imgHistoryServices.insert_notfinish_img_history(app, sessionId=sessionId, imgid=imgid, path=outImgPath, imgtitle=imgtitle, imgtype=0)

        # 信息隐藏 生成载密图像
        data_hide(inpImgPath, outImgPath, imgnum)         # 调用C++信息隐藏处理

        # 更新数据库finish字段
        imgHistoryServices.update_finish_img_history(app, imgid=imgid)
        return {}

    # 作者溯源视图函数
    @app.route("/query-author", methods=["POST"])
    @request_around(app, request, hasSessionId=True, args=(
        FileArg("img", excep="缺少图像文件"),
    ))
    def query_author(sessionId, img):
        import time
        timeStamp = str(int(time.time()*1000000))                   # 转化为微秒级时间戳, 用作文件命名
        inpImgPath = app.config["TMP_DIR"]+timeStamp+".jpeg"        # 原始图片路径
        img.save(inpImgPath)                                        # 将图像保存

        # 提取图像id
        imgnum = data_extract(inpImgPath)
        imgid = md5(str(imgnum))
        imgid = "de0112fcac8a94819bd6edcad7a070df"
        # 查询库
        exists, imgtitle = imgHistoryServices.query_img_author(app, imgid=imgid)
        if exists : 
            return {"exists":exists, "imgtitle":imgtitle, "imgid":imgid}
        else :
            return {"exists":exists}

    @app.route("/ih", methods=["POST"])
    @request_around(app, request, hasSessionId=True, args=(
        FileArg("img", excep="缺少图像文件"),
        PostArg("key", excep="密钥不能为空"),
        PostArg("secret", excep="秘密信息不能为空"),
        PostArg("imgtitle", default=None),
    ))
    def info_hide(sessionId, img, key, secret, imgtitle):
        imgnum = next(inc_imgnum_gen)
        imgid = md5(str(imgnum))
        timeStamp = str(int(time.time()*1000000))                   # 转化为微秒级时间戳, 用作文件命名
        inpImgPath = app.config["TMP_DIR"]+timeStamp+".jpeg"        # 原始图片路径
        outImgPath = app.config["IMG_DIR"]+timeStamp+".jpeg"        # 载迷图像输出路径
        img.save(inpImgPath)                                        # 将图像保存
        fit_wx_resolution(inpImgPath)                               # 修改输入图像的分辨率
        # 提取图像id，查看id是否已经存在
        # maybeImgId = dataExtract(inpImgPath, isdel=False)
        
         # 先插入历史记录
        imgHistoryServices.insert_notfinish_img_history(app, sessionId=sessionId, path=outImgPath, imgid=imgid, imgtitle=imgtitle, imgtype=1, secret=secret, key=key)

         # 信息隐藏 生成载密图像
        data_hide(inpImgPath, outImgPath, imgid)         # 调用C++信息隐藏处理

        imgHistoryServices.update_finish_img_history(app, imgid)

        return {}

    @app.route("/ix", methods=["post"])
    @request_around(app, request, hasSessionId=True, args=(
        FileArg("img", excep="缺少图像文件"),
        PostArg("key", excep="密钥不能为空"),
    ))
    def info_extract(sessionId, img, key):
        timeStamp = str(int(time.time()*1000000))                   # 转化为微秒级时间戳, 用作文件命名
        inpImgPath = app.config["TMP_DIR"]+timeStamp+".jpeg"        # 原始图片路径
        img.save(inpImgPath)    

        # 提取图像id
        imgnum = data_extract2(inpImgPath)
        imgid = md5(str(imgnum))
        imgid = "1c4bd3d31306688c1b12a62769f750b0"
        secret = imgHistoryServices.query_img_secret(app, imgid, key)
        return {'secret':secret}