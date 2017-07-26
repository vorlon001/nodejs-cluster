var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var uuidv4 = require('../libs/uuid.js').v4;
var logger  = require('../libs/log.js').log_master;
var log  = require('../libs/log.js').log;
var sleep_rnd = require('../libs/utils.js').sleep_rnd;
var init = require('./master.event.js');
var config = require('../config/config.master.json');
var run_web = require('./master.web.js').web;
var stats = require('./master.stats.js').stats;

let server = function () {
    logger(cluster);
    if(config.log.info) log({type:'INFO',wid:null,msg:'start master ... and will running ' + numCPUs + ' workers'});
    if(config.log.debug) log({type:'DEBUG',wid:null,msg:'[system Diag] process.env:' + JSON.stringify(process.env) + 'process.pid:' + JSON.stringify(process.pid) +
			    'process.platform:' + JSON.stringify(process.platform) + 'process.versions:' + JSON.stringify(process.versions) +
			    'process.version' + JSON.stringify(process.version) + 'process.config:' + JSON.stringify(process.config)});

    init.fork(cluster,numCPUs);
    init.event(cluster);

    function eachWorker(callback) {
        for (var id in cluster.workers) {
            callback(cluster.workers[id]);
        }
    }
    run_web();

    setInterval(function() {
        eachWorker(function (worker) {
    	    var uuid = uuidv4();
    	    if(config.log.debug) log({type:'DEBUG',wid:null,msg:'[send]  [cmd: stats][ pid:' + worker.process.pid + '] [wid: ' + worker.id + '] [cid:' + uuid + ']'});
    	    worker.send({ m: false, pid: worker.process.pid,  cmd: 'stats', wid: worker.id , cid: uuid });
	});
    }, config.server.stats );

   setTimeout(function () {
        eachWorker(function (worker) {
            worker.send('[master] ' + 'send message to worker' + worker.id);
        });
    }, config.server.start_ping_worker);
    init.messager(cluster);


}

module.exports = server;
