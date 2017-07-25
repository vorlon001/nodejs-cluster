var cluster = require('cluster');

// добавить в воркер статистику за 10 или 50 реквестов, так как среднее за все время неверный показатель мониторинга
// add restapi - system web in json for munin


if (cluster.isMaster) {
    var master = require('./master/master.js');
    master();
} else if (cluster.isWorker) {
    var worker = require('./worker/worker.js');
    worker(cluster);
}
