var http = require('http'); 
var url = require("url");
var fs = require("fs");
var querystring = require('querystring');
var crypto = require('crypto');
var formidable = require('formidable'); 
//用来解析MIME类型
var mime = function (req) {   
	var str = req.headers['content-type'] || '';   
	return str.split(';')[0]; 
};
//控制器们
exports.index = function (req, res, foo, bar) {   
	var query = url.parse(req.url, true).query; 
	console.log(query);
	fs.readFile('home.html', 'utf-8', function(err,data){
		res.writeHead(200);
		console.log(err);   
		res.write(data);
		res.end("Rabbit&Lion"+foo+bar); 
	}); 
	
}; 
exports.upload = function(req, res){
	
	if (mime(req) === 'application/x-www-form-urlencoded') {     
		req.body = querystring.parse(req.rawBody);  
	} else if (mime(req) === 'application/json') {     
		try {       
			req.body = JSON.parse(req.rawBody);     
		} catch (e) {       // 异常内容响应Bad request   
		    res.writeHead(400);       
		    res.end('Invalid JSON');       
		    return;     
		}   
	} 
	console.log(req.body);
}
exports.upload_file = function(req, res){
	//处理上传文件，这部分不能放在req的end事件里，那时就已经读不到了。
	if (mime(req) === 'multipart/form-data') { 
		var form = new formidable.IncomingForm(); 
		form.uploadDir = "../Webapp"; 
		form.keepExtensions = true;
		form.parse(req, function(err, fields, files) {         
			req.body = fields;         
			req.files = files; 
			console.log(err);
			console.log(files);
			console.log(fields);
			res.end();
		});
	}
}