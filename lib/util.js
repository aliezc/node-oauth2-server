'use strict';

var assert = require('assert');
var mongo = require('mongodb').MongoClient;
var config = require('./config.js');
var crypto = require('crypto');

module.exports = {
	// 生成登录信息
	generateLoginInfo : function(id, cb){
		assert.equal('string', typeof id);
		assert.equal('function', typeof cb);
		
		// 连接数据库
		mongo.connect(config.mongourl, function(err, db){
			assert.equal(null, err);
			
			// 随机数
			var random_num = Math.floor(Math.random() * 9000) + 1000;
			
			var user = db.collection(config.usercollection);
			user.find({"_id": id}).toArray(function(err, arr){
				assert.equal(null, err);
				
				if(arr.length == 0){
					// 用户不存在
					cb.call(null, {
						result: 10004,
						message: "用户不存在"
					});
					
					// 关闭数据库连接
					db.close();
					return;
				}else{
					// 获取用户信息
					var user = arr[0].username;
					var pass = arr[0].password;
					
					var aes = crypto.createCipher('aes-128-cbc', new Buffer(pass));
					
					// 时间戳，授权有效期2小时
					var timestamp = Date.now().toString();
					
					// 特征
					var src = user + timestamp + random_num.toString();
					
					aes.update(src, 'utf8');
					var session_key = aes.final('base64');
					
					var result = {
						result: 0,
						sessionid: session_key,
						sessiontime: timestamp
					};
					
					// 更新授权信息
					cb.call(null, result);
				}
			});
		});
	}
}