# coding=utf-8

from crp.untils import sp, urlget, crpview, unique_imgid_gen, md5, unescape, request_around
from crp.services import imgHistoryServices
from flask import request

# 模仿数据隐藏
def data_hide(inpImgPath, outImgPath, imgId, isdel=True):
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
    return "806490856ee2f580da779d1ba8619da1"

def bind_routes(app):
    import time

    # 图像绑定视图函数
    @app.route("/img-bind", methods=["POST"])
    @crpview(hasSessionId=True)
    @request_around(app, request, requestlog=True)
    def img_bind(sessionId):
        # 处理图像
        imgFile = request.files.get('img', None)                    # 图像文件
        if not imgFile:
            raise Exception("lack img file")
        imgtitle = unescape(request.form.get("imgtitle", None))     # 图像对外标题
        imgtitle = imgtitle if imgtitle else None
        imgid = next(unique_imgid_gen)                              # 获取该次操作的图像ID
        timeStamp = str(int(time.time()*1000000))                   # 转化为微秒级时间戳, 用作文件命名
        inpImgPath = app.config["TMP_DIR"]+timeStamp+".jpeg"        # 原始图片路径
        outImgPath = app.config["IMG_DIR"]+timeStamp+".jpeg"        # 载迷图像输出路径
        imgFile.save(inpImgPath)                                    # 将图像保存
        # 提取图像id，查看id是否已经存在
        # maybeImgId = dataExtract(inpImgPath, isdel=False)

        # 先插入历史记录
        imgHistoryServices.insert_notfinish_img_history(app, sessionId=sessionId, imgid=imgid, imgtitle=imgtitle)

        # 信息隐藏 生成载密图像
        data_hide(inpImgPath, outImgPath, imgid)         # 调用C++信息隐藏处理

        # 更新数据库finish字段
        imgHistoryServices.update_finish_img_history(app, imgid=imgid, outImgPath=outImgPath)
        return {}

    # 作者溯源视图函数
    @app.route("/query-author", methods=["POST"])
    @crpview(hasSessionId=True)
    @request_around(app, request, requestlog=True)
    def query_author(sessionId):
        import time

        imgFile = request.files.get('img', None)                    # 图像文件
        if not imgFile:
            raise Exception("lack img file")
        timeStamp = str(int(time.time()*1000000))                   # 转化为微秒级时间戳, 用作文件命名
        inpImgPath = app.config["TMP_DIR"]+timeStamp+".jpeg"        # 原始图片路径
        imgFile.save(inpImgPath)                                    # 将图像保存

        # 提取图像id
        imgid = data_extract(inpImgPath)

        # 查询库
        exists, imgtitle = imgHistoryServices.query_img_author(app, imgid=imgid)

        if exists : 
            return {"exists":exists, "imgtitle":imgtitle, "imgid":imgid}
        else :
            return {"exists":exists}

    @app.route("/ih", methods=["POST"])
    @crpview(hasSessionId=True)
    @request_around(app, request, requestlog=True)
    def info_hide(sessionId):
        print('================= start =================')
        key = request.form.get("key", None)
        print('===1===')
        secret = request.form.get("secret", None)
        print('===2===')
        imgFile = request.files.get('img', None)                    # 图像文件
        if not imgFile:
            raise Exception("lack img file")
        print('===3===')
        print('================= over =================')
        raise Exception("not support the interface")
        return {}

    @app.route("/ix", methods=["POST"])
    @crpview(hasSessionId=True)
    @request_around(app, request, requestlog=True)
    def info_extract(sessionId):
        raise Exception("not support the interface")
        return {}