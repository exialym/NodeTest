var cp = require('child_process'); 
cp.spawn('node', ['./worker.js']); 
cp.exec('node ./worker.js', function (err, stdout, stderr) {   
	console.log("exec:"+stdout); 
	console.log(err); 
}); 
//使用execFile直接执行JS文件要在文件前加上#!/usr/bin/env node 
// cp.execFile('./worker.js', function (err, stdout, stderr) {   
// 	console.log("execFile:"+stdout); 
// }); 
cp.fork('./worker.js'); 

var n = cp.fork('./sub.js');  
n.on('message', function (m) {   
	console.log('PARENT got message:', m); 
});  
n.send({hello: 'world'}); 