var cluster = require('cluster');
var http = require('http');
var log  = require('../libs/log.js').log;
var sleep_rnd = require('../libs/utils.js').sleep_rnd;
var config = require('../config/config.worker.json');
var stats = require('./worker.stats.js').stats;
var express = require('express');

let webworker = function () {
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

module.exports = {webworker: webworker };