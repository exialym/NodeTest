var http = require('http'); 
var a = Math.round((1 + Math.random()) * 1000);
var message;
var server = http.createServer(function (req, res) {   
	console.log("3::"+message);
	res.writeHead(200, {'Content-Type': 'text/plain'});   
	res.end('handled by child, pid is ' + process.pid + '\n'+a); 
});  
process.on('message', function (m, tcp) {   
	//if (m === 'server') {   
		message = m; 
		console.log("1::"+message);
		tcp.on('connection', function (socket) { 
			console.log("2::"+message);
			server.emit('connection', socket); 
			tcp.close();    
		});   
		tcp.on('close',function(){
			console.log(message+'close');
		});
	//} 
});