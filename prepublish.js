var fs = require('fs');

var src = 'node_modules/grunt-sauce-driver/reporters/siesta.js';
var dest = 'test/siesta/reporter.js';

fs.exists(src, function(exists) {
	if (!exists) {
		return;
	}
	
	var input = fs.createReadStream(src);
	
	input.on("error", function(err) {
		console.error(err);
	});
	
	var output = fs.createWriteStream(dest);
	
	output.on("error", function(err) {
		done(err);
	});
	
	input.pipe(output);
});