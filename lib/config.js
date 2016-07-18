'use strict';

module.exports = {
	// 数据库连接地址
	mongourl : 'mongodb://127.0.0.1:27017/usertest',
	
	// redis密码
	redisauth : 'dilili',
	
	// 数据集合
	usercollection : 'user',
	
	// session有效期，2小时
	session_expire: 60 * 1000 * 60 * 2
};