// GUID generator (okay not actually GUID compliant but whatever)
// http://stackoverflow.com/a/105074
exports.guidGen = function() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
    };
        
	let id = '';
	for (let i = 0; i < 4; i++)
		id += s4();
	return id;
}


// http://stackoverflow.com/a/1527820
exports.randomRangeInt = function(min, max) {
	return Math.floor(((max - min + 1) * Math.random()) + min);
};

exports.argsString = function(args, char = " ") {
    return Array.prototype.join.call(args, char);
};