/********高阶函数使得回调函数等更方便使用，从而为异步编程提供了支持****/
var toString = Object.prototype.toString;   
var isString = function (obj) {   
	return toString.call(obj) == '[object String]'; 
}; 
var isFunction = function (obj) {   
	return toString.call(obj) == '[object Function]'; 
};
var a={

};
console.log(toString.call(a));
var points = [40, 100, 1, 5, 25, 10]; 
points.sort(function(a, b) 
{   
	return a - b; 
}); // [ 1, 5, 10, 25, 40, 100 ] 
var isType = function (type) {   
	return function (obj) {     
		return toString.call(obj) == '[object ' + type + ']';   
	}; 
};  
var isString = isType('String'); 
var isFunction = isType('Function'); 
console.log(isFunction(a));
// var async = function (callback) {   
// 	process.nextTick(function() {     
// 		var results = something;     
// 		if (error) {       
// 			return callback(error);     
// 		}     
// 		callback(null, results);   
// 	}); 
// }; 

/*********************************************************************事件发布/订阅模式******************/
//使用Node自带的events模块
var emitter = require('events'); 
var myEmitter = new emitter();
myEmitter.on("event1", (message1,message2) => {   
	console.log(message1);   
	console.log(message2);   
}); // 发布 
myEmitter.emit('event1', "I am message1!", "I am message2!");

//继承EventEmitter模块，使得自己的类也可以发布事件
var util = require('util');
function Stream() {   
	emitter.EventEmitter.call(this); 
} 
util.inherits(Stream, emitter.EventEmitter); 
var myStream = new Stream();
myStream.on("event1", (message) => {   
	console.log(message);     
}); // 发布 
myStream.emit('event1', "I am stream!");
//新的继承的写法
// const EventEmitter = require('events');
// class MyEmitter extends EventEmitter {}
// const myEmitter = new MyEmitter();
// myEmitter.on('event', () => {
//   console.log('an event occurred!');
// });
// myEmitter.emit('event');

//利用事件队列解决雪崩问题
// var proxy = new events.EventEmitter(); 
// var status = "ready"; 
// var select = function (callback) {   
// 	proxy.once("selected", callback);   
// 	if (status === "ready") {     
// 		status = "pending";     
// 		db.select("SQL", function (results) {       
// 			proxy.emit("selected", results);       
// 			status = "ready";     
// 		});   
// 	} 
// }; 

//多异步之间的协作方案 
// var after = function (times, callback) {   
// 	var count = 0, results = {};   
// 	return function (key, value) {     
// 		results[key] = value;     
// 		count++;     
// 		if (count === times) {       
// 			callback(results);     
// 		}   
// 	}; 
// };  
// var done = after(3, render); 
// var emitter = new events.Emitter(); 
// emitter.on("done", done); 
// emitter.on("done", other);  
// fs.readFile(template_path, "utf8", function (err, template) {   
// 	emitter.emit("done", "template", template); 
// }); 
// db.query(sql, function (err, data) {   
// 	emitter.emit("done", "data", data); 
// }); 
// l10n.get(function (err, resources) {   
// 	emitter.emit("done", "resources", resources); 
// });


/*********************************************************************Promise/Deferred模式******************/
//使用event来模拟
//首先promise继承event,我们将在promise里完成事件的订阅和发布
//这里定义了3个方法，done，fail和它们的组合then
//done和fail都使用once来绑定事件，保证其只执行一次
//新定义的这三个方法完成了事件的订阅，并且都返回了自己以完成链式调用
var Promise = function () {   
	emitter.EventEmitter.call(this);
}; 
util.inherits(Promise, emitter.EventEmitter);  
Promise.prototype.then = function (fulfilledHandler, errorHandler, progressHandler) {   
	if (typeof fulfilledHandler === 'function') {       
		this.once('success', fulfilledHandler);   
	}   
	if (typeof errorHandler === 'function') {   
		this.once('error', errorHandler);   
	}   
	if (typeof progressHandler === 'function') {     
		this.on('progress', progressHandler);   
	}   
	return this; 
};
Promise.prototype.done = function (fulfilledHandler) {   
	if (typeof fulfilledHandler === 'function') {       
		this.once('success', fulfilledHandler);   
	}   
	return this; 
};
Promise.prototype.fail = function (errorHandler) {   
	if (typeof errorHandler === 'function') {   
		this.once('error', errorHandler);   
	}   
	return this; 
};
//deferred这个对象是触发事件状态转变的地方
var Deferred = function () {   
	this.state = 'unfulfilled';  
	this.promise = new Promise(); 
};  
Deferred.prototype.resolve = function (obj) {   
	this.state = 'fulfilled';   
	this.promise.emit('success', obj); 
};  
Deferred.prototype.reject = function (err) {   
	this.state = 'failed';   
	this.promise.emit('error', err); 
};  
Deferred.prototype.progress = function (data) {   
	this.promise.emit('progress', data); 
}; 
Deferred.prototype.all = function (promises) { 
	var count = promises.length;   
	var that = this;   
	var results = [];   
	promises.forEach(function (promise, i) {     
		promise.then(function (data) {       
			count--;       
			results[i] = data;       
			if (count === 0) {         
				that.resolve(results);       
			}     
		}, function (err) {       
			that.reject(err);     
		});   
	});   
	return this.promise; 
};

var when = function (func) {
	var defrred = new Deferred();
	func(defrred);
	return defrred.promise;
};
var after = function(promises) {
	var defrred = new Deferred();
	return defrred.all(promises);
}
function eat(dfd) {
	console.log('give me apple or beef');
	var tasks = function(){
		if (food=='apple') {
			console.log('you give me apple');
			dfd.reject();
		} 
		if (food=='beef') {
			console.log('you give me beef');
			dfd.resolve();
		}
	};
	setTimeout(tasks,5000);
	
}
function drink(dfd) {
	console.log('give me water or coffee');
	var tasks = function(){
		if (drinking=='water') {
			console.log('you give me water');
			dfd.reject();
		} 
		if (drinking=='coffee') {
			console.log('you give me coffee');
			dfd.resolve();
		}
	};
	setTimeout(tasks,6000);
	
}
var food = 'beef';
var drinking = 'coffee';
when(eat)
	.done(function(){ console.log('I eat beef'); })
	.fail(function(){ console.log('I throw apple'); });
after([when(eat),when(drink)])
	.done(function(){ console.log('I eat all'); })
	.fail(function(){ console.log('I don\'t like one of those'); })
/*********************************************************************流程控制库******************/
//异步的串行
var async = require("async");
var fs = require("fs");
async.series([function (callback) {  
		console.log("reading 1");   
		fs.readFile('file1.txt', 'utf-8', callback); 
	}, function (callback) {     
		//fs.readFile('file2.txt', 'utf-8', callback);   
		console.log("reading 2");
		callback("2222222","33333");
	}], function (err, results) {   
		// results => [file1.txt, file2.txt] 
		console.log("results:"+results);
	}); 
//异步的并行
async.parallel([   function (callback) {     
		fs.readFile('file1.txt', 'utf-8', callback);   
	},   
	function (callback) {     
		fs.readFile('file2.txt', 'utf-8', callback);   
	} ], 
	function (err, results) {   // results => [file1.txt, file2.txt] 
		console.log("results:"+results);
	});
//异步调用的依赖处理
async.waterfall([   function (callback) {     
		//file1.txt里下一个文件的地址
		fs.readFile('file1.txt', 'utf-8', function (err, content) { callback(err, content); });   
	},  function (arg1, callback) {     // arg1 => file2.txt     
		fs.readFile(arg1, 'utf-8', function (err, content) { callback(err, content); }); 
	}], function (err, result) {    
		// result => file2.txt 
		console.log("results:"+result);
	});

var deps = {   
	readConfig: function (callback) {     
		console.log("// read config file");     
		console.log(callback);
	},   
	connectMongoDB: ['readConfig', function (callback) {     
		console.log("// connect to mongodb");     
		console.log(callback);  
	}],   
	connectRedis: ['readConfig', function (callback) {     
		console.log("// connect to redis  ");   
		//callback();
	}],  
	complieAsserts: function (callback) {     
		console.log("// complie asserts");     
		//callback();   
	},   
	uploadAsserts: ['complieAsserts', function (callback) {     
		console.log("// upload to assert");    
		//callback();   
	}],   
	startup: ['connectMongoDB', 'connectRedis', 'uploadAsserts', function (callback) {     
		console.log("// startup ");  
	}] 
};
async.auto(deps); 
//异步并发控制
async.parallelLimit([   function (callback) {     
		fs.readFile('file1.txt', 'utf-8', callback);   
	},   function (callback) {     
		fs.readFile('file2.txt', 'utf-8', callback);   
	} ], 1, function (err, results) {   
		console.log("resultsLimit:"+results);
	});