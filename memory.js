 /********************************进程的内存占用******************************/
 var showMem = function () {   
 	var mem = process.memoryUsage();   
 	var format = function (bytes) {     
 		return (bytes / 1024 / 1024).toFixed(2) + ' MB';   
 	};   
 	console.log(
 		'Process: heapTotal ' 
 		+ format(mem.heapTotal) 
 		+ ' heapUsed ' 
 		+ format(mem.heapUsed) 
 		+ ' rss ' 
 		+ format(mem.rss));   
 	console.log('-----------------------------------------------------------'); 
 };
var useMem = function () {   
	var size = 20 * 1024 * 1024;   
	var arr = new Array(size);   
	for (var i = 0; i < size; i++) {     
		arr[i] = 0;   
	}   
	return arr; 
};  
var total = [];  
for (var j = 0; j < 3; j++) {   
	showMem();   
	total.push(useMem()); 
} 
showMem();
/*******************************系统的内存占用******************************/
var os = require("os");
console.log(os.totalmem());
console.log(os.freemem());

var useMem = function () {   
	var size = 200 * 1024 * 1024;   
	var buffer = new Buffer(size);   
	for (var i = 0; i < size; i++) {     
		buffer[i] = 0;   
	}   
	return buffer; 
};
for (var j = 0; j < 3; j++) {   
	showMem();   
	total.push(useMem()); 
} 
showMem();
/*******************************大内存文件操作使用stream不会受内存限制******************************/
var fs = require("fs");
var reader = fs.createReadStream('in.txt'); 
var writer = fs.createWriteStream('out.txt'); 
reader.on('data', function (chunk) {   
	writer.write(chunk); 
	console.log(chunk);
}); 
reader.on('end', function () {  
	writer.end(); 
}); 