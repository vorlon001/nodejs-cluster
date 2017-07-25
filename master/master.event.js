
var config = require('../config/config.master.json');
var log  = require('../libs/log.js').log;

let fork = function(cluster,numCPUs) {
    for (var i = 0; i < numCPUs; i++) {
        var wk = cluster.fork();
        wk.uptime=Date.now();
    wk.stats =  { min: 0, avg: 0, max: 0, i: 0 };
        wk.send('[master] ' + 'hi worker' + wk.id);
    }
}

let event = function (cluster) {

    cluster.on('fork', function (worker) {
        if(config.log.debug) log({type:'DEBUG',wid:null,msg:'[system Diag] fork: worker' + worker.id});
    });

    cluster.on('online', function (worker) {
        if(config.log.debug) log({type:'DEBUG',wid:null,msg:'[system Diag] online: worker' + worker.id});
    });

    cluster.on('listening', function (worker, address) {
        if(config.log.debug)  log({type:'DEBUG',wid:null,msg:'[system Diag] listening: worker:' + worker.id + ',pid:' + worker.process.pid + ', Address:' + address.address + ":" + address.port});
    });

    cluster.on('disconnect', function (worker) {
        if(config.log.debug)  log({type:'DEBUG',wid:null,msg:'[system Diag] disconnect: worker' + worker.id});
	var wk = cluster.fork();
	wk.uptime=Date.now();
	wk.stats =  { min: 0, avg: 0, max: 0, i: 0 };
        wk.send('[master] ' + 'create new worker' + wk.id);
    });

    cluster.on('exit', function (worker, code, signal) {
        if(config.log.debug) log({type:'DEBUG',wid:null,msg:'[system Diag] exit worker:' + worker.id + ' died'});
	if (signal) {
	    if(config.log.debug) log({type:'DEBUG',wid:null,msg:'[system Diag] worker:' + worker.id + ' was killed by signal: ' + signal });
	} else if (code !== 0) {
	    if(config.log.debug) log({type:'DEBUG',wid:null,msg:'[system Diag] worker:' + worker.id + ' exited with error code: ' + code });
	} else {
	    if(config.log.info) log({type:'INFO',wid:null,msg:'[system Diag] worker success!'});
	}
    });

}

let messager = function (cluster) {
    for(id in cluster.workers) {
	if(config.log.info) log({type:'DEBUG',wid:null,msg:'[system Diag] add master:event:message for worker:',id});
    	    cluster.workers[id].on('message', function(msg) {
    	    if(typeof msg === 'object') {
		if(msg.m == true && msg.cmd == 'ping') { 
		    if(config.log.debug) log({type:'DEBUG',wid:null,msg:'[answer] [cmd:ping]  [wid:' + msg.wid + '] [pid:' + msg.pid + '] [cid:' + msg.cid + '] msg:' + msg.msg });
		} else 	if(msg.m == true && msg.cmd == 'stats') {  
		    if(config.log.debug) log({type:'DEBUG',wid:null,msg:'[answer] [cmd:stats] [wid:' + msg.wid + '] [pid:' + msg.pid + '] [cid:' + msg.cid + '] msg:' + JSON.stringify(msg.msg)}); 
			cluster.workers[msg.wid].stats=msg.msg; 
		    }
    	    } else {
		if(config.log.debug) log({type:'DEBUG',wid:null,msg:'[answer] msg:' + msg});
    	    }
        });
    }
}
 
module.exports = { event: event, messager: messager, fork: fork};
