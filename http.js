var http = require('http'); 
var server = http.createServer(function (req, res) {  
	console.log(req.method);
	console.log(req.url);
	console.log(req.httpVersion); 
	console.log(req.headers);
	var buffers=[];
	req.on('data',function(truck){
		buffers.push(truck);
		console.log('receiving data');
	}).on('end',function(){
		var buffer = Buffer.concat(buffers);
		console.log('received');
		console.log(buffer);
		res.writeHead(200, {'Content-Type': 'text/plain'});   
		res.end('Hello World\n'); 
	})
	
}).listen(1337, '127.0.0.1'); 
console.log('Server running at http://127.0.0.1:1337/'); 