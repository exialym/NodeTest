var http = require('http'); 
var url = require("url");
var fs = require("fs");
var querystring = require('querystring');
var crypto = require('crypto');
var formidable = require('formidable'); 


var pathRegexp = function(path) {  

	var keys = [];  
	path = path
		//.concat('/?')     
		.replace(/\/\(/g, '(?:/')     
		.replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?(\*)?/g, function(_, slash, format, key, capture, optional, star){       
			// 将配的存       
  			keys.push(key);       
  			slash = slash || '';       
  			return ''         
  				+ (optional ? '' : slash)         
  				+ '(?:'         
  				+ (optional ? slash : '')         
  				+ (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')'         
  				+ (optional || '')         
  				+ (star ? '(/*)?' : '');     
  		})     
  		.replace(/([\/.])/g, '\\$1')    
  		.replace(/\*/g, '(.*)');  

  	return {     
  		keys: keys,     
  		regexp: new RegExp('^' + path + '$')   
  	}; 
}


// querystring解析中间件 
var querystring = function (req, res, next) {   
	req.query = url.parse(req.url, true).query;
	console.log("处理查询条件");   
	next(); 
}; 
// cookie解析中间件 
var cookie = function (req, res, next) {   
	var cookie = req.headers.cookie;   
	var cookies = {};   
	if (cookie) {     
		var list = cookie.split(';');     
		for (var i = 0; i < list.length; i++) {       
			var pair = list[i].split('=');       
			cookies[pair[0].trim()] = pair[1];     
		}   
	}  
	req.cookies = cookies;  
	console.log("处理Cookie");   
	next(); 
}; 


//RESTful
var routes = {'all': []}; 
var app = {}; 
app.use = function (path) {   
	var handle;   
	if (typeof path === 'string') {     
		handle = {           
			path: pathRegexp(path),            
			stack: Array.prototype.slice.call(arguments, 1)     
		};   
	} else {     
		handle = {    
			path: pathRegexp('/'),    
			stack: Array.prototype.slice.call(arguments, 0)     
		};   
	}   
	routes.all.push(handle); 
};  
['get', 'put', 'delete', 'post'].forEach(function (method) {   
	routes[method] = [];   
	app[method] = function (path) {     
		var handle;   
		if (typeof path === 'string') {     
			handle = {           
				path: pathRegexp(path),            
				stack: Array.prototype.slice.call(arguments, 1)     
			};   
		} else {     
			handle = {    
				path: pathRegexp('/'),    
				stack: Array.prototype.slice.call(arguments, 0)     
			};   
		}   
		routes[method].push(handle);   
	}; 
}); 

var handle = function (req, res, stack) {  
	var quene = stack.slice(0);
	var next = function () {     
		// 从stack数组中出中间件执行    
		var middleware = quene.shift();  
		if (middleware) {       
			// 传入next()函数自使中间件能执行结递    
			middleware(req, res, next);     
		}   
	};  
	// 启动执行   
	next(); 
}; 

// 加用户 
app.post('/user/:username', addUser); 
app.delete('/user/:username', removeUser); 
app.put('/user/:username', updateUser); 
app.use(querystring);
app.get('/user/:username/:ID', cookie , getUser);
app.get('/games/:username', getGames); 

function addUser(req, res){
	res.end('addUser');
}
function removeUser(req, res){
	res.end('removeUser');
}
function updateUser(req, res){
	res.end('updateUser');
}
function getUser(req, res){
	res.write('getUser:'+req.params.username);
	res.write('\nID:'+req.params.ID);
	res.write('\nquery:'+req.query.haha);
	res.end('\nCookie:'+req.cookies);
}
function getGames(req, res){
	res.write('getGames:'+req.params.username);
	res.write('\nquery:'+req.query.haha);
	res.end('\nCookie:'+req.cookies);
}

var server = http.createServer(function (req, res) {   
	//http://localhost:1337/user/exialym/123?haha=456&nono=789
	//http://localhost:1337/user/ahaha/777
	var pathname = url.parse(req.url).pathname;   
	// 将请求方法为小写   
	var method = req.method.toLowerCase();   
	var match = function (pathname, routes) {   
		var stacks = []; 
		for (var i = 0; i < routes.length; i++) {     
			var route = routes[i];     // 正则配     
			var reg = route.path.regexp;     
			var keys = route.path.keys;    
			console.log(reg);
			console.log(pathname);
			if (reg.toString()==='/^\\/$/') {
				stacks = stacks.concat(route.stack);
			}
			var matched = reg.exec(pathname);
			console.log(matched);
			if (matched) {       // 具体       
				var params = {};       
				for (var i = 0, l = keys.length; i < l; i++) {         
					var value = matched[i + 1];         
					if (value) {           
						params[keys[i]] = value;         
					}       
				}       
				req.params = params;       
	      		stacks = stacks.concat(route.stack);      
	      	}   
	    }  
	    return stacks; 
	};
	var stacks = match(pathname, routes.all); 
	if (routes.hasOwnProperty(method)) {     
		stacks = stacks.concat(match(pathname, routes[method])); 
	} 
	if (stacks.length) {     
		handle(req, res, stacks);   
	} else {     
		// 处理404请求   
		res.writeHead(404);     
		res.end('no such controller'); 
	} 
	
}).listen(1337); 
console.log('Server running at http://localhost:1337/'); 


 










