'use strict';

var mongo = require('mongodb').MongoClient;
var config = require('./config.js');
var redis = require('redis');
var http = require('http');
var assert = require('assert');

// 注册新用户
module.exports = function(req, res){
	assert(req instanceof http.IncommingMessage);
	assert(res instanceof http.ServerResponse);
	
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
				
				if(cnt > 0){
					// 用户已存在
					res.writeHead(200, {"content-type": "text/plain"});
					res.end(JSON.stringify({
						result: 10003,
						message: "用户已存在"
					}));
					
					// 关闭数据库连接
					db.close();
					return;
				}else{
					// 用户不存在，插入数据
					user.insertOne({
						username: username,
						password: password
					}, function(err, result){
						assert.equal(null, err);
						
						if(result.insertCount == 1){
							// 插入成功
							res.writeHead(200, {"content-type": "text/plain"});
							res.end(JSON.stringify({
								result: 0,
								message: "注册成功"
							}));
						}else{
							// 插入失败
							res.writeHead(200, {"content-type": "text/plain"});
							res.end(JSON.stringify({
								result: 0,
								message: "注册失败"
							}));
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