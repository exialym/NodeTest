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
