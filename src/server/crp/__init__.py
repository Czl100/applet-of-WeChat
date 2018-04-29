from flask import Flask
from wrapper import returnWrapper

# 创建服务器
app = Flask(__name__)

# URL映射
@app.route("/")
@app.route("/index")
def index():
    return {"name":"lsj"}