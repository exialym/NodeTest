var http = require('http'); 
var a = Math.round((1 + Math.random()) * 1000);
var server = http.createServer(function (req, res) {   
	res.writeHead(200, {'Content-Type': 'text/plain'});   
	res.end('handled by child, pid is ' + process.pid + '\n'+a); 
});  
process.on('message', function (m, tcp) {   
	if (m === 'server') {     
		tcp.on('connection', function (socket) {       
			server.emit('connection', socket);     
		});   
	} 
});