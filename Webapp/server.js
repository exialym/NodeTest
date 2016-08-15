var http = require('http'); 
var url = require("url");
var fs = require("fs");
var querystring = require('querystring');
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
	if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {     
		req.body = querystring.parse(req.rawBody);  
	}
	console.log(req.body);
}
var server = http.createServer(function (req, res) {   
	console.log(req.url);
	var hasBody = function(req) {   
		return 'transfer-encoding' in req.headers || 'content-length' in req.headers; 
	}; 
	if (hasBody(req)) {     
		var buffers = [];     
		req.on('data', function (chunk) {       
			buffers.push(chunk);     
		});     
		req.on('end', function () {       
			req.rawBody = Buffer.concat(buffers).toString();       
			handle(req, res);     
		});   
	} else {     
		handle(req, res);   
	} 
	
}).listen(1337); 
console.log('Server running at http://localhost:1337/'); 
function handle(req,res) {
	var pathname = url.parse(req.url).pathname;   
	var paths = pathname.split('/');   
	var controller = paths[1] || 'index';   
	var action = paths[2] || 'index';   
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


//缓存控制
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