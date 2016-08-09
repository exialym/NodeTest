var str = "balalalal"; 
var buf = new Buffer(str, 'utf-8'); 
console.log(buf); 
var buf1 = new Buffer(100); 
console.log(buf1.length); // => 100
buf1[0] = -2;
console.log(buf1[0]); //254
buf1[0] = 257;
console.log(buf1[0]); //1
buf1[0] = 1.69;
console.log(buf1[0]); //1

//解决Buffer拼接的问题
// var chunks = []; 
// var size = 0; 
// res.on('data', function (chunk) {   
// 	chunks.push(chunk);   
// 	size += chunk.length; 
// }); 
// res.on('end', function () { 
// 	var buf = Buffer.concat(chunks, size);   
// 	var str = iconv.decode(buf, 'utf8');   
// 	console.log(str); 
// }); 

//buffer与性能
//这里注释掉的这句话，预先将一个字符串转换为了Buffer
//这会有效的减少CPU的重复使用，节省服务器的资源。
//如果进行AB测试的话你会发现读取速率和每秒查询次数均有提高
var http = require('http'); 
var helloworld = ""; 
for (var i = 0; i < 1024 * 10; i++) {   
	helloworld += "a"; 
}  
// helloworld = new Buffer(helloworld);  
http.createServer(function (req, res) {   
	res.writeHead(200);   
	res.end(helloworld); 
}).listen(8001);