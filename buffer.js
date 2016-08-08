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
var chunks = []; 
var size = 0; 
res.on('data', function (chunk) {   
	chunks.push(chunk);   
	size += chunk.length; 
}); 
res.on('end', function () { 
	var buf = Buffer.concat(chunks, size);   
	var str = iconv.decode(buf, 'utf8');   
	console.log(str); 
}); 