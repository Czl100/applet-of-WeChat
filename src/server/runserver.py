# coding=utf-8

import crp
import configs

# 创建http-app
app = crp.create_app(configs.devConfig)

if __name__ == '__main__':
    # simple_server
    app.run()
