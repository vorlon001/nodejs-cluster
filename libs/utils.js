
let sleep_rnd = function (t) {
    var stop = new Date().getTime();
    while(new Date().getTime() < stop + Math.floor(Math.random() * (t - 10)) + 10) {
	    ;
    }
}
module.exports = { sleep_rnd: sleep_rnd };
