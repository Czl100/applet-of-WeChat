# coding=utf-8

from crp.utils import sp, urlget, md5, unescape, request_around, inc_imgnum_gen, PostArg, FileArg, fit_wx_resolution, wm_embed, wm_extract, gen_phone_resolution
from crp.services import imgHistoryServices
from crp.exception import CrpException, DuplicateEmbedException
from flask import request
import time

def img_emb(app, sessionId, img, imgtitle, imgtype=0, key=None, secret=None):
    imgnum = next(inc_imgnum_gen)
    imgid = md5(str(imgnum))

    timeStamp = str(int(time.time()*1000000))                       # 转化为微秒级时间戳, 用作文件命名
    inpImgPath = app.config["TMP_DIR"]+timeStamp+".jpeg"            # 原始图片路径
    outImgPath = app.config["IMG_DIR"]+timeStamp+".jpeg"            # 含水印图像输出路径
    smallImgPath = app.config["IMG_DIR"]+timeStamp+"_small.jpeg"    # 含水印图像降分辨率
    img.save(inpImgPath)                                            # 将图像保存

    # 适配微信变更分辨率问题
    fit_wx_resolution(inpImgPath)
    # 提取图像id，查看id是否已经存在
    maybe_imgid = md5(str(wm_extract(app, inpImgPath, isdel=False)))
    if imgHistoryServices.query_imgid_exists(app, maybe_imgid) :
        raise DuplicateEmbedException()
    # 信息隐藏 生成载密图像
    success=True
    try:
        wm_embed(app, inpImgPath, outImgPath, imgnum)
    except Exception:
        # 失败暂不入库
        # success=False 
        raise CrpException("图片处理发生异常")

    # 入库
    kws = {
        "success":success, 
        "sessionId":sessionId,
        "path":outImgPath,
        "imgid":imgid,
        "imgnum":imgnum,
        "imgtitle":imgtitle,
        "imgtype":imgtype,
        "secret":secret,
        "key":key        
    }
    imgHistoryServices.insert_finish_img_history(app, **kws)
    # 生成小分辨率含密图
    gen_phone_resolution(outImgPath, smallImgPath)
    imgurl = app.config['ENABLE_HOST']+outImgPath
    return {"img":imgurl}

def imgid_ext(app, img):
    timeStamp = str(int(time.time()*1000000))                   # 转化为微秒级时间戳, 用作文件命名
    inpImgPath = app.config["TMP_DIR"]+timeStamp+".jpeg"        # 原始图片路径
    img.save(inpImgPath)                                        # 将图像保存

    # 提取图像id
    imgnum = wm_extract(app, inpImgPath)
    print("ext-imgnum:", imgnum)
    imgid = md5(str(imgnum))
    return imgid

def bind_routes(app):

    # 图像绑定视图函数
    @app.route("/img-bind", methods=["POST"])
    @request_around(app, request, hasSessionId=True, args=(
        FileArg("img", excep="缺少图像文件"),
        PostArg("imgtitle", default=None),
    ))
    @app.limiter.limit("20 per minute")
    def img_bind(sessionId, img, imgtitle):
        return img_emb(app, sessionId, img=img, imgtitle=imgtitle)

    # 作者溯源视图函数
    @app.route("/query-author", methods=["POST"])
    @request_around(app, request, hasSessionId=True, args=(
        FileArg("img", excep="缺少图像文件"),
    ))
    @app.limiter.limit("20 per minute")
    def query_author(sessionId, img):
        imgid = imgid_ext(app, img)

        # 查询库
        exists, imgtitle = imgHistoryServices.query_img_author(app, imgid=imgid)
        if exists : 
            return {"exists":exists, "imgtitle":imgtitle, "imgid":imgid}
        else :
            return {"exists":exists}

    @app.route("/ih", methods=["POST"])
    @request_around(app, request, hasSessionId=True, args=(
        FileArg("img", excep="缺少图像文件"),
        PostArg("key", default=""),
        PostArg("secret", excep="秘密信息不能为空", allow_empty_string=False),
        PostArg("imgtitle", default=None),
    ))
    @app.limiter.limit("20 per minute")
    def info_hide(sessionId, img, key, secret, imgtitle):
        return img_emb(app, sessionId=sessionId, img=img, imgtitle=imgtitle, imgtype=1, key=key, secret=secret)

    @app.route("/ix", methods=["post"])
    @request_around(app, request, hasSessionId=True, args=(
        FileArg("img", excep="缺少图像文件"),
        PostArg("key", default=""),
    ))
    @app.limiter.limit("20 per minute")
    def info_extract(sessionId, img, key):
        imgid = imgid_ext(app, img)
        secret = imgHistoryServices.query_img_secret(app, imgid, key)
        return {'secret':secret}