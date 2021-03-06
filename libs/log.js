var dateFormat = require('./date.js').dateFormat;

let log = function (msg) {
        let wid=null;	
<<<<<<< Updated upstream
	if(msg.wid!=null) wid='worker:'+msg.wid;
        else wid='master';
	console.log('[' + msg.type + '] [' + wid + '] ' + msg.msg );
=======
    if(msg.wid!=null) wid='worker:'+msg.wid;
        else wid='master';
    console.log('[' + msg.type + '] [' + wid + '] ' + msg.msg );
>>>>>>> Stashed changes
    }


let log_worker = function (cluster) {

    const config = require('../config/config.worker.logger.json');
    var fs  = require('fs');

    var ws = fs.createWriteStream('./logs/worker.id'+cluster.worker.id+'.log', { 
        'flags'   : 'a+',
        'encoding': 'utf8',
        'mode'    : 0666,
    });

    process.stdout.wr = process.stdout.write;
    process.stdout.er = process.stderr.write;
    
    process.stdout.write = function(mes, c) {
<<<<<<< Updated upstream
	var ts_hms = Date.now();
        var tms = dateFormat ( new Date(ts_hms), "%Y-%m-%d %H:%M:%S", false);
	if(config.file) ws.write('[' + ts_hms + '] [' + tms + '] ' + mes);
=======
    var ts_hms = Date.now();
        var tms = dateFormat ( new Date(ts_hms), "%Y-%m-%d %H:%M:%S", false);
    if(config.file) ws.write('[' + ts_hms + '] [' + tms + '] ' + mes);
>>>>>>> Stashed changes
        if(config.cli) process.stdout.wr('[' + ts_hms+'] ['+tms+'] ' + mes, c)   
    };
 
    process.stderr.write = function(mes, c) {
<<<<<<< Updated upstream
	if(config.file) ws.write(mes);
=======
    if(config.file) ws.write(mes);
>>>>>>> Stashed changes
        if(config.cli) process.stdout.er(mes, c)   
    };
}

let log_master = function (cluster) {

    var config = require('../config/config.master.logger.json');
    var fs  = require('fs');

    var ws = fs.createWriteStream('./logs/master.log', { 
        'flags'   : 'a+',
        'encoding': 'utf8',
        'mode'    : 0666,
    });
 
    process.stdout.wr = process.stdout.write;
    process.stdout.er = process.stderr.write;
    
    process.stdout.write = function(mes, c) {
<<<<<<< Updated upstream
	var ts_hms = Date.now();
        var tms = dateFormat ( new Date(ts_hms), "%Y-%m-%d %H:%M:%S", false);
	if(config.file) ws.write('[' + tms + '] [' + ts_hms + '] ' + mes);
=======
    var ts_hms = Date.now();
        var tms = dateFormat ( new Date(ts_hms), "%Y-%m-%d %H:%M:%S", false);
    if(config.file) ws.write('[' + tms + '] [' + ts_hms + '] ' + mes);
>>>>>>> Stashed changes
        if(config.cli) process.stdout.wr('[' + ts_hms + '] [' + tms + '] ' + mes, c)   
    };
 
    process.stderr.write = function(mes, c) {
        if(config.file) ws.write(mes);
<<<<<<< Updated upstream
	if(config.cli) process.stdout.er(mes, c)   
=======
    if(config.cli) process.stdout.er(mes, c)   
>>>>>>> Stashed changes
    };
}

module.exports = { log_worker: log_worker, log_master: log_master , log: log};
