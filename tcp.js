var net = require('net');  
var server = net.createServer(function (socket) {   // 的接   
	socket.on('data', function (data) {     
		socket.write("hello");   
	});  
	socket.on('end', function () {     
		console.log('disconnection');   
	});   
	socket.write("深入浅出Node.js：\n"); 
});  
server.listen(8124, function () {   
	console.log('server bound'); 
});