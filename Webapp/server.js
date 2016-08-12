var http = require('http'); 
var url = require("url");

var handles = {};
handles.index = {}; 
handles.index.index = function (req, res, foo, bar) {   
	//http://localhost:1337/index/index/papapa/hahaha?h=1&n=2
	var query = url.parse(req.url, true).query; 
	console.log(query);
	res.writeHead(200);   
	res.end("Rabbit&Lion"+foo+bar); 
}; 
var server = http.createServer(function (req, res) {   
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
}).listen(1337); 
console.log('Server running at http://localhost:1337/'); 

function update(req, res){

}
function remove(req, res){
	
}
function create(req, res){
	
}
function get(req, res){
	var pathname = url.parse(req.url).pathname;   
	var paths = pathname.split('/');   
	var controller = paths[1] || 'index';   
	var action = paths[2] || 'index';   
	var args = paths.slice(3);   
	var cookies = parseCookie(req.headers.cookies);
	console.log('cookies:'+cookies);
	if (handles[controller] && handles[controller][action]) {     
		handles[controller][action].apply(null, [req, res].concat(args));   
	} else {     
		res.writeHead(500);     
		res.end('no such controller');   
	}
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
