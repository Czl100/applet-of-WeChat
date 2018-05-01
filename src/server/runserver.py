# coding=utf-8

import crp
import configs

if __name__ == '__main__':
    # 创建http-app
    app = crp.create_app(configs.devConfig)
    
    # http服务开启
    app.run()
