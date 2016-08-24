// master.js 
var fork = require('child_process').fork; 
var cpus = require('os').cpus();  
var server = require('net').createServer(); 
server.listen(1337);  
var workers = {}; 
var limit = 20; 
// 时间单位 
var during = 60000; 
var restart = []; 
var isTooFrequently = function () {   
	// 记录重启时间   
	var time = Date.now();   
	var length = restart.push(time);   
	if (length > limit) {     
		// 取出10录     
		restart = restart.slice(limit * -1);   
	}   // 重启前10重启间的时间间   
	return restart.length >= limit && restart[restart.length - 1] - restart[0] < during; 
}; 
var createWorker = function () {   
	// 检查是否过   
	if (isTooFrequently()) {     
	// 发giveup事件不重启     
		process.emit('giveup');     
		return;   
	 } 
	var worker = fork(__dirname + '/auto_reboot-worker.js');   
	//子进程发出自杀信号时重新启动新的进程  
	worker.on('message', function (message) {     
		if (message.act === 'suicide') {   
			console.log(worker.pid+'suicide')    
			createWorker();     
		}   
	}); 
	worker.on('exit', function () {     
		console.log('Worker ' + worker.pid + ' exited.');     
		delete workers[worker.pid];     
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
process.on('giveup', function () {   
	console.log('something bad happen');
});