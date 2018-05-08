# crp
版权护卫

* [接口文档](接口文档.md)
* [数据库设计](数据库设计.md)
* [微信小程序项目](src/wxp/readme.md)
* [Python服务器项目](src/server/readme.md)
* [C++信息隐藏项目](src/cpp/readme.md)

CREATE TABLE `invites`(
   `id` INT UNSIGNED AUTO_INCREMENT,
   `imgtitle` VARCHAR(100) NOT NULL,
   PRIMARY KEY ( `id` )
)CHARSET=utf8;