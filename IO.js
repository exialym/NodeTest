process.nextTick(function () {   
	console.log('nextTick执行1'); 
}); 
process.nextTick(function () {
	console.log('nextTick执行2'); 
}); 
setImmediate(function () {   
	console.log('setImmediate执行1');   
	process.nextTick(function () {     
		console.log('势入');   
	}); 
}); 
setImmediate(function () {   
	console.log('setImmediate执行2'); 
}); 
console.log('正常执行'); 