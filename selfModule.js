(function (name, definition) {   
	// 检测上文环境是否为AMDCMD   
	var hasDefine = typeof define === 'function',     
	// 检查上文环境是否为Node     
	hasExports = typeof module !== 'undefined' && module.exports;  
	if (hasDefine) {    
	 	// AMD环境CMD环境     
		define(definition);   
	} else if (hasExports) {     
		// 定义为通用Node模块     
		module.exports = definition();   
	} else {     
		// 将模块的执行结果挂在window变量中，在浏览器中this指向window对象     
		this[name] = definition();   
	} 
})('math', function () {   
	var interface = {};
	interface.add=function () {   
		var sum = 0,   
		i = 0,     
		args = arguments,     
		l = args.length;   
		while (i < l) { 
			sum += args[i++]; 
		  }   
		return sum; 
	};
	return interface; 
}); 
