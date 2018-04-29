from crp.views import bindRoutes
from flask import Flask
from crp.wrapper import returnWrapper

# 创建服务器
app = Flask(__name__)

# URL绑定
bindRoutes(app)