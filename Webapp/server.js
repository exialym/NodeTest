var http = require('http'); 
var url = require("url");
var fs = require("fs");
var querystring = require('querystring');
var crypto = require('crypto');
var formidable = require('formidable'); 


var pathname;   
var paths;   
var controller;   
var action;   
//控制器们
var handles = {};
handles.index = {}; 
handles.index.index = function (req, res, foo, bar) {   
	//http://localhost:1337/index/index/papapa/hahaha?h=1&n=2
	var query = url.parse(req.url, true).query; 
	console.log(query);
	fs.readFile('home.html', 'utf-8', function(err,data){
		res.writeHead(200);
		console.log(err);   
		res.write(data);
		res.end("Rabbit&Lion"+foo+bar); 
	}); 
	
}; 
handles.index.upload = function(req, res){
	
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
handles.index.upload_file = function(req, res){
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


var server = http.createServer(function (req, res) {   
	console.log(req.url);
	pathname = url.parse(req.url).pathname;   
	paths = pathname.split('/');   
	controller = paths[1] || 'index';   
	action = paths[2] || 'index';   
	var hasBody = function(req) {   
		return 'transfer-encoding' in req.headers || 'content-length' in req.headers; 
	}; 
	if (hasBody(req)) {     
		if (action==='upload_file') {
			handle(req, res);
		} else {
			var buffers = [];     
			req.on('data', function (chunk) {       
				buffers.push(chunk);     
			});     
			req.on('end', function () {       
				req.rawBody = Buffer.concat(buffers).toString();       
				handle(req, res);     
			});
		}
	} else {     
		handle(req, res);   
	} 
	
}).listen(1337); 
console.log('Server running at http://localhost:1337/'); 


 
function handle(req,res) {
	
	var args = paths.slice(3);   
	var cookies = parseCookie(req.headers.cookies);
	//console.log('cookies:'+cookies);
	if (handles[controller] && handles[controller][action]) {     
		handles[controller][action].apply(null, [req, res].concat(args));   
	} else {     
		res.writeHead(500);     
		res.end('no such controller');   
	}
	switch (req.method) {   
		case 'POST':     
			update(req, res);     
			break;   
		case 'DELETE':     
			remove(req, res);     
			break;   
		case 'PUT':     
			create(req, res);     
			break;   
		case 'GET':   
		default:     
			get(req, res);   
	} 
}

function update(req, res){

}
function remove(req, res){
	
}
function create(req, res){
	
}
function get(req, res){
	
}
//用来解析cookie
var parseCookie = function (cookie) {   
	var cookies = {};   
	if (!cookie) {     
		return cookies;   
	} 
	var list = cookie.split(';');   
	for (var i = 0; i < list.length; i++) {     
		var pair = list[i].split('=');     
		cookies[pair[0].trim()] = pair[1];   
	}   
	return cookies; 
};
//用来解析MIME类型
var mime = function (req) {   
	var str = req.headers['content-type'] || '';   
	return str.split(';')[0]; 
};

//缓存控制If-Modified-Since
// var catchControl = function (req, res) {   
// 	fs.stat(filename, function (err, stat) {     
// 		var lastModified = stat.mtime.toUTCString();     
// 		if (lastModified === req.headers['if-modified-since']) {       
// 			res.writeHead(304, "Not Modified");       
// 			res.end();     
// 		} else {       
// 			fs.readFile(filename, function(err, file) {         
// 				var lastModified = stat.mtime.toUTCString();         
// 				res.setHeader("Last-Modified", lastModified);         
// 				res.writeHead(200, "Ok");         
// 				res.end(file);       
// 			});     
// 		} 
// 	});
// }

//缓存控制ETag
// var getHash = function (str) {   
// 	var shasum = crypto.createHash('sha1');   
// 	return shasum.update(str).digest('base64'); 
// };
// var ETag = function (req, res) {   
// 	fs.readFile(filename, function(err, file) {     
// 		var hash = getHash(file);     
// 		var noneMatch = req.headers['if-none-match'];     
// 		if (hash === noneMatch) {       
// 			res.writeHead(304, "Not Modified");       
// 			res.end();     
// 		} else {       
// 			res.setHeader("ETag", hash);       
// 			res.writeHead(200, "Ok");       
// 			res.end(file);     
// 		}   
// 	}); 
// }; 