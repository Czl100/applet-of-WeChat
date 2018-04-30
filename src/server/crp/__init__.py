from crp.views import bindRoutes
from flask import Flask

# 创建服务器
app = Flask(__name__)

# URL绑定
bindRoutes(app)