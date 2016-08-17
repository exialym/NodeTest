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
var args;



var server = http.createServer(function (req, res) {   
	//http://localhost:1337/index/index/papapa/hahaha?h=1&n=2
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
	var module; 
	try {        
		module = require('./controllers/' + controller);   
	} catch (ex) {     
		res.writeHead(500);     
	 	res.end('no such controller');      
		return;   
	}   
	var method = module[action];   
	if (method) {     
		method.apply(null, [req, res].concat(args));   
	} else {     
		res.writeHead(500);     
	 	res.end('no such controller');
	 	return;   
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

//RESTful
var routes = {'all': []}; 
var app = {}; 
app.use = function (path, action) {   
	routes.all.push([pathRegexp(path), action]); 
};  
['get', 'put', 'delete', 'post'].forEach(function (method) {   
	routes[method] = [];   
	app[method] = function (path, action) {     
		routes[method].push([pathRegexp(path), action]);   
	}; 
}); 
// 加用户 
app.post('/user/:username', addUser); 
app.delete('/user/:username', removeUser); 
app.put('/user/:username', updateUser); 
app.get('/user/:username', getUser); 
function (req, res) {   
	var pathname = url.parse(req.url).pathname;   
	// 将请求方法为小写   
	var method = req.method.toLowerCase();   
	if (routes.hasOwnPerperty(method)) {     
		// 据请求方法分发     
		if (match(pathname, routes[method])) {       
			return;     
		} else {       
			// 如路径有配不成功试all()处理       
			if (match(pathname, routes.all)) {         
				return;       
			}     
		}   
	} else {     
		// 接all()处理     
		if (match(pathname, routes.all)) {       
			return;     
		} 
	}   
	// 处理404请求   
	handle404(req, res); 
}