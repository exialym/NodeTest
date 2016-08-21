var http = require('http'); 
var url = require("url");
var fs = require("fs");
var crypto = require('crypto');
var formidable = require('formidable'); 
var mime = require('mime'); 
var pathUtil = require('path'); 


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
function querystring(req, res, next) {   
	req.query = url.parse(req.url, true).query;
	//varreq.aaa.aaa;
	console.log("处理查询条件");   
	next(); 
}
// cookie解析中间件 
function cookie(req, res, next) {   
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
}
 function staticFile(req, res, next) {   
 	var pathname = url.parse(req.url).pathname; 
 	console.log("pathname:"+pathname); 
 	fs.readFile(path.join(ROOT, pathname), function (err, file) {     
 		if (err) {       
 			return next(err);     
 		}     
 		res.writeHead(200);     
 		res.end(file);   
 	}); 
 	next(); 
 };
//错误处理中间件1
function errorProsseser1(err, req, res, next){
	res.write('error1');
	next(); 
}
//错误处理中间件2
function errorProsseser2(err, req, res, next){
	res.write('error2');
	res.end();
	next(); 
}
//RESTful路由
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

//中间件尾触发调度函数
var handle = function (req, res, stack) {  
	var quene = stack.filter(function (middleware) {     
		return middleware.length !== 4;   
	});
	var errorQuene = stack.filter(function (middleware) {     
		return middleware.length === 4;   
	});
	var next = function (err) {     
		// 从stack数组中出中间件执行    
		if (err) {       
			return handle500(err, req, res, errorQuene);     
		} 
		console.log(quene);
		var middleware = quene.shift();  
		console.log(middleware);
		if (middleware) {       
			// 传入next()函数自使中间件能执行结递    
			try {         
				middleware(req, res, next);       
			} catch (ex) { 
				console.log('catch error');        
				next(ex);       
			}     
		}   
	};  
	// 启动执行   
	next(); 
}; 
//错误处理中间件调度函数
var handle500 = function (err, req, res, stack) {   
	// 异常处理中间件   
	console.log(stack);
	console.log(err);
	var next = function () {     
	// 从stack数组中出中间件执行     
		var middleware = stack.shift();     
		if (middleware) {       
		// 传递异常对象       
			middleware(err, req, res, next);     
		}   
	};  
	// 启动执行   
	next(); 
}; 

var escape = function (html) {   
	return String(html)
		.replace(/&(?!\w+;)/g, '&amp;')     
		.replace(/</g, '&lt;')     
		.replace(/>/g, '&gt;')     
		.replace(/"/g, '&quot;')     
		.replace(/'/g, '&#039;'); 
};
// var complie = function (str) {   // 模板是换的   
// 	var tpl = str.replace(/<%=([\s\S]+?)%>/g, function (match, code) {      
// 		return "' +  escape(" + code + ");";   
// 	});  
// 	tpl = "tpl = '" + tpl + "";   
// 	tpl = 'var tpl = "";\nwith (obj) {' + tpl + '}\nreturn tpl;'; 
// 	return new Function('obj','escape', tpl); 
// }; 
var complie = function (str) {
	var tpl = str.replace(/\n/g, '\\n') // 将换行符 换 
		.replace(/<%=([\s\S]+?)%>/g, function (match, code) {
			// 转义
			return "' + escape(" + code + ");+'"; 
		})
		.replace(/<%([\s\S]+?)%>/g, function (match, code) {
			return "';\n" + code + "\ntpl += '"; 
		})
		.replace(/\'\n/g, '\'')
		.replace(/\n\'/gm, '\'');
	tpl = "tpl = '" + tpl + "';";
	// 转换空行 3 
	tpl = tpl.replace(/''/g, '\'\\n\'');
	tpl = 'var tpl = "";\nwith (obj || {}) {\n' + tpl + '\n}\nreturn tpl;';
	return new Function('obj', 'escape', tpl);
};
var render = function (complied, data) {   
	return complied(data,escape); 
};
// 路由绑定
app.post('/user/:username', addUser); 
app.delete('/user/:username', removeUser); 
app.put('/user/:username', updateUser); 
app.use(querystring);
app.use('/static/name.:ext',staticFile);
app.use(errorProsseser1);
app.use(errorProsseser2);
app.get('/user/:username/:ID', cookie , getUser);
app.get('/games/:username', getGames); 
app.get('/download',download);

function download(req,res){
	res.sendfile = function (filepath) {   
		fs.stat(filepath, function(err, stat) {     
			var stream = fs.createReadStream(filepath); // 设置内容     
			res.setHeader('Content-Type', mime.lookup(filepath));     // 设置长     
			res.setHeader('Content-Length', stat.size);     // 设置为附件     
			res.setHeader('Content-Disposition',' attachment; filename="' + pathUtil.basename(filepath) + '"');     
			res.writeHead(200);  
			//由于res也是个可读可写流，这里我们直接使用pipe方法。
			//这个方法监听stream的data事件和end事件，分别会调用res的write方法和end方法   
			stream.pipe(res);   
		}); 
	};
	res.sendfile('test.js');
}
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
var cache = {};
function getGames(req, res){
	res.render = function (view, data) {   
		if (!cache[view]) {
       var text;
       try {
				text = fs.readFileSync(view, 'utf-8'); 
			} catch (e) {
				res.writeHead(500, {'Content-Type': 'text/html'}); 
				res.end('模板文件错误');
				return;
			}
			cache[view] = complie(text,escape);
		}
		var complied = cache[view];
		res.writeHead(200, {'Content-Type': 'text/html'});
		var html = render(complied, data);   
		res.end(html);  
	}; 
	//res.render('home.html',{username: req.params.username});
	res.render('/Users/exialym/Desktop/Git/NodeTest/Webapp_RESTful/home.html',{items: [{name: 'Lion'}, {name: 'Rabbit'}]});
}


var server = http.createServer(function (req, res) {   
	//http://localhost:1337/user/exialym/123?haha=456&nono=789
	//http://localhost:1337/user/ahaha/777
	var pathname = url.parse(req.url).pathname;   
	// 将请求方法为小写   
	var method = req.method.toLowerCase(); 
	//匹配路由  
	var match = function (pathname, routes) {   
		var stacks = []; 

		for (var i = 0; i < routes.length; i++) {     
			var route = routes[i];     // 正则配  
			console.log(pathname);
			var reg = route.path.regexp; 
			console.log(reg);     
			var keys = route.path.keys;    
			if (reg.toString()==='/^\\/$/') {
				stacks = stacks.concat(route.stack);
			}
			var matched = reg.exec(pathname);
			console.log(matched);
			if (matched) {       // 具体       
				var params = {};       
				for (var j = 0, l = keys.length; j < l; j++) {         
					var value = matched[j + 1];         
					if (value) {           
						params[keys[j]] = value;         
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
		res.redirect = function (url) {   
			res.setHeader('Location', url);   
			res.writeHead(302);   
			res.end('Redirect to ' + url); 
		};  
		res.redirect('www.baidu.com');
	} 
	
}).listen(1337); 
console.log('Server running at http://localhost:1337/'); 


 










