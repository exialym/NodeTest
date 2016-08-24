// master.js 
var fork = require('child_process').fork; 
var cpus = require('os').cpus();  
var server = require('net').createServer(); 
server.listen(1337);  
var workers = {}; 
var createWorker = function () {   
	var worker = fork(__dirname + '/auto_reboot-worker.js');   
	//子进程退出时重新启动新的进程  
	worker.on('exit', function () {     
		console.log('Worker ' + worker.pid + ' exited.');     
		delete workers[worker.pid];     
		createWorker();   
	});   
	// 句柄转发   
	worker.send('server', server);   
	workers[worker.pid] = worker;   
	console.log('Create worker. pid: ' + worker.pid); 
};  
for (var i = 0; i < cpus.length; i++) {   
	createWorker(); 
}  
// 进程自出时有工作进程出 
process.on('exit', function () {   
	for (var pid in workers) {     
		workers[pid].kill();   
	} 
});