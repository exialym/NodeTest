var http = require('http'); 
var agent = new http.Agent({   
	maxSockets: 10 
}); 
var options = {   
	hostname: '127.0.0.1',   
	port: 1337,   
	path: '/',   
	method: 'GET',   
	agent: agent 
}; 
var req = http.request(options, function(res) {   
	console.log('STATUS: ' + res.statusCode);   
	console.log('HEADERS: ' + JSON.stringify(res.headers));   
	res.setEncoding('utf8');   
	res.on('data', function (chunk) {     
		console.log(chunk);   
	}); 
});  
console.log(agent.requests);
req.end();
console.log(agent.requests);
