let stats = { 
    a:null, 
    b:null, 
    rs:null, 
    min_render:0, 
    max_render:0, 
    avg_render:0, 
    i_render:0, 
    all_render:0, 
    start: function () { 
	this.a = Date.now()
	}, 
    stop: function()  { 
	this.b = Date.now();  
	this.rs = this.b - this.a; 
	this.all_render=this.all_render+this.rs; 
	this.i_render++; 
	if(this.min_render == 0) this. min_render = this.rs; 
	else if (this.rs<this.min_render) this.min_render = this.rs; 
	if(this.rs > this.max_render) this.max_render = this.rs; 
	this.avg_render=Math.floor(this.all_render / this.i_render);
	} 
    };

module.exports = {stats: stats};