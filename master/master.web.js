var cluster = require('cluster');
var http = require('http');
var express = require('express');
var config = require('../config/config.master.json');
var log  = require('../libs/log.js').log;
var stats = require('./master.stats.js').stats;

let web_server = function () {

    var app = express();

    var MasterLogger = function (req, res, next) {
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        if(config.log.info) log({type:'INFO',wid:null,msg:'web system admin: htmlver:' + req.httpVersion 
	        + ' server:' + req.headers['host']
	        + ' user-agent:"'  +req.headers['user-agent'] + '"'
	        + ' method:'  +req.method 
	        + ' url:' + req.url 
	        + ' RemoteIP:' + ip});
        next();
    };

    app.use(MasterLogger);

    app.get('/', function(req, res) {
	stats.start()
	var current_time =Date.now()
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	// замена шаблона на EJS парсер
	var out_html='<table style="width:100%"> <tr><th>Workers ID</th><th>Workers PID</th><th>Uptime server</th><th>NodeJS ver.</th><th>uptime workers</th></tr>';
	for(var k in cluster.workers) {
    	    out_html = out_html + '<tr><td>' + cluster.workers[k].id + 
		'</td><td>' + cluster.workers[k].process.pid + 
		'</td><td>' + process.uptime() + 
		'</td><td>' +  process.version + 
		'</td><td>' + Math.floor( ( (current_time - cluster.workers[k].uptime ) / 1000 ) % 60 ) + 
		'</td><td>' + JSON.stringify(cluster.workers[k].stats);
		'</td></tr>';
	}
	out_html = out_html + '</table>';
	if(config.server.sleep) sleep_rnd(5000000);
	stats.stop(); 
	out_html = out_html + "Render pages <"+ stats.rs +"> ms. min:" + stats.min_render + " avg:" + stats.avg_render + " max:" + stats.max_render + " i:" + stats.i_render + " all:" + stats.all_render + " ";
        res.end(out_html);
    });

    const http_server = http.createServer(app)

    http_server.listen(
      config.server.port,
      config.server.ip,
      () => {
	    log({type:'INFO',msg:'Server Master UP  ip : ' + config.server.iport +':' + config.server.port + ' PID:'+process.pid });
	}
    );

}

module.exports = { web: web_server } ;
