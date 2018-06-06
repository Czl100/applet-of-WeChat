# coding=utf-8

import crp
import configs
from crp.untils import wm_embed, wm_extract

# 创建http-app
app = crp.create_app(configs.devConfig)
#app = crp.create_app(configs.produceConfig)

if __name__ == '__main__':
    #simple_server
    app.run(host='0.0.0.0')