var http = require('http'); 
var url = require("url");
var fs = require("fs");
var querystring = require('querystring');
var crypto = require('crypto');
var formidable = require('formidable'); 


var pathRegexp = function(path) {   
	var keys = [];  
	path = path
		//.concat(strict ? '' : '/?')     
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
app.get('/user/:username/:ID', getUser);
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
	res.end('getUser:'+req.params.username);
}
function getGames(req, res){
	res.end('getGames');
}

var server = http.createServer(function (req, res) {   
	var pathname = url.parse(req.url).pathname;   
	// 将请求方法为小写   
	var method = req.method.toLowerCase();   
	var match = function (pathname, routes) {   
		for (var i = 0; i < routes.length; i++) {     
			var route = routes[i];     // 正则配     
			var reg = route[0].regexp;     
			var keys = route[0].keys;     
			var matched = reg.exec(pathname);
			console.log(pathname);
			console.log(matched);  
			console.log(keys);
			console.log(reg);
			if (matched) {       // 具体       
				var params = {};       
				for (var i = 0, l = keys.length; i < l; i++) {         
					var value = matched[i + 1];         
					if (value) {           
						params[keys[i]] = value;         
					}       
				}       
				req.params = params;  
	      		var action = route[1];       
	      		action(req, res);       
	      		return true;     
	      	}   
	    }  
	    return false; 
	};
	if (routes.hasOwnProperty(method)) {     
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
	res.writeHead(404);     
	res.end('no such controller');
}).listen(1337); 
console.log('Server running at http://localhost:1337/'); 


 










