var http = require('http'); 
var selfModule = require('E:\\Git\\NodeTest\\selfModule.js');
var timeout = require('E:\\Git\\NodeTest\\timeout.js');
console.log('done!');
http.createServer(function (req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Hello World\n');
}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');
console.log(selfModule.add(13,3));