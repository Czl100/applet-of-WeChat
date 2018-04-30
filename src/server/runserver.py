import crp
import configs

if __name__ == '__main__':
    # 导入配置文件对象
    crp.app.config.from_object(configs.devConfig)

    # http服务开启
    crp.app.run()
