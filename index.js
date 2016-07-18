'use strict';

var http = require('http');
var assert = require('assert');
var url = require('url');
var querystring = require('querystring');
var mongo = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var redis = require('redis');
var crypto = require('crypto');
var config = require('./lib/config.js');

var server = http.createServer();

// API
var API_registry = require('./lib/registry.js');
var API_login = require('./lib/login.js');

server.on('error', function(err){
	console.log(err);
}).on('request', function(req, res){
	var request_url = url.parse(req.url).pathname;
	
	if(/^\/registry$/.test(request_url)){
		// 注册帐号
		
		API_registry.call(null, req, res);
	}else if(/^\/login$/.test(request_url)){
		// 登录账号
		
		
	}
});