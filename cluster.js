var cluster = require('cluster');


if (cluster.isMaster) {
    var master = require('./master/master.js');
    master();
} else if (cluster.isWorker) {
    var worker = require('./worker/worker.js');
    worker(cluster);
}
