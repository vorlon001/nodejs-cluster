var cluster = require('cluster');
var http = require('http');
var logger  = require('../libs/log.js').log_worker;
var log  = require('../libs/log.js').log;
var config = require('../config/config.worker.json');
var sleep_rnd = require('../libs/utils.js').sleep_rnd;
var express = require('express');

let worker = function () {

    logger(cluster);

    var stats = { a:null, b:null, rs:null, min_render:0, max_render:0, avg_render:0, i_render:0, all_render:0, start: function () { this.a = Date.now()}, stop: function()  { this.b = Date.now();  this.rs = this.b - this.a; this.all_render=this.all_render+this.rs; this.i_render++; if(this.min_render == 0) this. min_render = this.rs; else if (this.rs<this.min_render) this.min_render = this.rs; if(this.rs > this.max_render) this.max_render = this.rs; this.avg_render=Math.floor(this.all_render / this.i_render);} };
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

    var app = express();

    var WorkerLogger = function (req, res, next) {
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        if(config.log.info)
	    log({type:'INFO',wid:cluster.worker.id, msg:  
    		  ' PID:' + cluster.worker.process.pid
                + ' request htmlver:' + req.httpVersion 
		+ ' server:' + req.headers['host']
		+ ' user-agent:"'  +req.headers['user-agent'] + '"'
	    	+ ' method:'  +req.method 
		+ ' url:' + req.url 
	        + ' RemoteIP:' + ip});
        next();
    };

    app.use(WorkerLogger);

    app.get('/', function(req, res) {

	var a = Date.now();
        stats.start();
        if(config.server.sleep) sleep_rnd(5000000);
	stats.stop();
        // замена шаблонизатора на EJS
	var out_html = "Render pages <"+ stats.rs +"> ms. min:" + stats.min_render + " avg:" + stats.avg_render + " max:" + stats.max_render + " i:" + stats.i_render + " all:" + stats.all_render + " ";

        res.send('worker'+cluster.worker.id+',PID:'+process.pid+'<br>'+out_html);
    });

    const http_server = http.createServer(app)

    http_server.listen(
      config.server.port,
      config.server.ip,
      () => {
	    log({type:'INFO',msg:'Server UP  ip : ' + config.server.iport +':' + config.server.port +' worker'+cluster.worker.id+',PID:'+process.pid });
	}
    );

}

module.exports = worker;