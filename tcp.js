var net = require('net');  
var server = net.createServer(function (socket) {   // 的接   
	socket.on('data', function (data) {     
		socket.write("hello");   
		socket.write(data);   
	});  
	socket.on('end', function () {     
		console.log('disconnection');   
	});   
	
	socket.write("深入浅出Node.js：\n"); 
});  
server.on('connection',function(){
	console.log("有一个客户端");
})
server.listen(8124, function () {   
	console.log('server bound'); 
});

var echoServer = net.createServer(function (socket) {   
	socket.write('Echo server\r\n');   
	socket.pipe(socket); 
});  
echoServer.listen(1337, function () {   
	console.log('echoServer bound'); 
});