var cp = require('child_process'); 
var child1 = cp.fork('./jubing-child.js'); 
var child2 = cp.fork('./jubing-child.js'); 
console.log(child2===child1);
// Open up the server object and send the handle 
var server = require('net').createServer(); 
server.listen(1337, function () {   
	child1.send('server1', server);   
	child2.send('server2', server);   // 关   
	server.close(); 
}); 