var cluster = require('cluster');
var logger  = require('../libs/log.js').log_worker;
var log  = require('../libs/log.js').log;
var config = require('../config/config.worker.json');
var sleep_rnd = require('../libs/utils.js').sleep_rnd;
var express = require('express');
var stats = require('./worker.stats.js').stats;
var webworker = require('./worker.web.js').webworker;

let worker = function () {

    logger(cluster);
    if(config.log.info) log({type:'INFO',wid:cluster.worker.id,msg:"start worker ..."});
    if(config.log.debug) log({type:'DEBUG',wid:cluster.worker.id,msg:'[system Diag] process.env:'+ JSON.stringify(process.env)+ 'process.pid:'+ JSON.stringify(process.pid)+
						    'process.platform:'+ JSON.stringify(process.platform)+ 'process.versions:'+ JSON.stringify(process.versions)+
						    'process.version'+ JSON.stringify(process.version)+ 'process.config:' + JSON.stringify(process.config)});

    process.on('message', function(msg) {
	// переписать вывод как и send через []
	if(config.log.debug) log({type:'DEBUG',wid:cluster.worker.id,msg:'[resived] msg:' + JSON.stringify(msg)});
	if(typeof msg === 'object') {
	    if(msg.cmd == 'ping' && msg.m==false) {	
		if(config.log.debug) log({type:'DEBUG',wid:cluster.worker.id,msg:'[system DIAG]' + JSON.stringify(process.memoryUsage())});
		if(config.log.debug) log({type:'DEBUG',wid:cluster.worker.id,msg:'[send] [cmd:"pong"]  [c.w.id:' + cluster.worker.id + '] [my:pid:' + process.pid + '] [wid:' + msg.wid  + '] [pid:' + msg.pid + '] [cid:' + msg.cid + ']'});
		process.send({ cmd: msg.cmd, msg: 'pong', m: true, pid: msg.pid , cid: msg.cid, wid: msg.wid});
	    } else if(msg.cmd == 'stats' && msg.m==false) {
		var memory_stats = process.memoryUsage();
	        if(config.log.debug) log({type:'DEBUG',wid:cluster.worker.id,msg:'[send] [cmd:"stats"] [c.w.id:' + cluster.worker.id + '] [my:pid:' + process.pid + '] [wid:' + msg.wid  + '] pid:' + msg.pid + '] [cid:' + msg.cid + '] msg:' + JSON.stringify({load:{min:stats.min_render,avg:stats.avg_render,max:stats.max_render,i:stats.i_render,all: stats.all_render}, memory: memory_stats}) });
		process.send({ cmd: msg.cmd, m: true, pid: msg.pid , cid: msg.cid, wid: msg.wid, 
				msg: { 
					load: {min: stats.min_render, avg: stats.avg_render, max: stats.max_render, i: stats.i_render , all: stats.all_render } , 
					memory: process.memoryUsage() 
				    }
			    });
	    }
	} else {	
    	    process.send('[worker:' + cluster.worker.id + '] worker'+cluster.worker.id+' received!');
	}
    });
    webworker();
}

module.exports = worker;