import json
from flask import Flask
from crp.wrapper import returnWrapper

# 创建服务器
app = Flask(__name__)

# URL映射
@app.route("/")
@returnWrapper
def index():
    return {"msg":"服务器运行中..."}

@app.route("/sessionBuild/<code>", methods=['POST', 'GET'])
@returnWrapper
def sessionBuild(code):
    return {"code":code}
    