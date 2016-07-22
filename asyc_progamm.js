var events = require('events'); 
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
var emitter = new events.emitter(); 
emitter.on("event1", function (message) {   
	console.log(message);   
}); // 发布 
emitter.emit('event1', "I am message!");