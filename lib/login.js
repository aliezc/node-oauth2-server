'use strict';

var mongo = require('mongodb').MongoClient;
var config = require('./config.js');
var redis = require('redis');
var http = require('http');
var assert = require('assert');
var utils = require('./util.js');

module.exports = function(req, res){
	var buf = new Buffer('');
	req.on('data', function(chunk){
		buf = Buffer.concat([buf, chunk]);
	}).on('end', function(){
		// 接收数据完毕
		var request_data = querystring.parse(buf.toString());
		
		// 必须存在用户和密码字段
		if(!request_data.username){
			res.writeHead(200, {"content-type": "text/plain"});
			res.end(JSON.stringify({
				result: 10001,
				message: "未指定用户名"
			}));
			return;
		}
		
		if(!request_data.password){
			res.writeHead(200, {"content-type": "text/plain"});
			res.end(JSON.stringify({
				result: 10002,
				message: "未指定密码"
			}));
			return;
		}
		
		// 用户名
		var username = request_data.username.trim();
		
		// 密码
		var password = crypto.createHash('sha1').update(request_data.password).digest('hex');
		
		// 连接数据库
		mongo.connect(config.mongourl, function(err, db){
			assert.equal(null, err);
			
			var user = db.collection(config.usercollection);
			user.find({username: username}).count(function(err, cnt){
				assert.equal(null, err);
				
				if(cnt == 0){
					// 用户不存在
					res.writeHead(200, {"content-type": "text/plain"});
					res.end(JSON.stringify({
						result: 10004,
						message: "用户不存在"
					}));
					
					// 关闭数据库连接
					db.close();
					return;
				}else{
					// 用户存在，对比密码
					user.find({username: username}).limit(1).toArray(function(err, arr){
						assert.equal(null, err);
						
						if(arr[0]){
							if(arr[0].password == password){
								// 密码正确
								
								var user_data = arr[0];
								
								utils.generateLoginInfo(user_data._id, function(login_info){
									if(login_info.result == 0){
										// 生成成功
										
									}else{
										// 生成失败
									}
								});
							}else{
								// 密码错误
								res.writeHead(200, {"content-type": "text/plain"});
								res.end(JSON.stringify({
									result: 10005,
									message: "密码错误"
								}));
							}
						}
						
						// 关闭数据库连接
						db.close();
						return;
					});
				}
			});
		});
	});
}