var http = require('http');
var config = require('../config/config.master.json');
var log  = require('../libs/log.js').log;

let web_server = function (cluster,stats) {
    http.createServer(function (req, res) {
	stats.start()
        res.writeHead(200, {"content-type": "text/html"});
	var current_time =Date.now()
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	if(config.log.info) log({type:'INFO',wid:null,msg:'web system admin: htmlver:' + req.httpVersion 
			    + ' server:' + req.headers['host']
			    + ' user-agent:"'  +req.headers['user-agent'] + '"'
			    + ' method:'  +req.method 
			    + ' url:' + req.url 
			    + ' RemoteIP:' + ip});
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
    }).listen(
		config.server.port,
		config.server.ip,  
		() => { 
			console.log('WebServer Master-Panel ip : ' + config.server.ip);
			console.log('WebServer Master-Panel port : ' + config.server.port)
			console.log('WebServer Master is up!')
		})
}

module.exports = { web: web_server } ;
