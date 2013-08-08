var args = process.argv.splice(2);

if (args.length > 0) {
	process.env.NODE_ENV = args[0];
}

var express = require("express");

var app = express();
var env = app.get('env');

if (env == 'production') {
	console.log('Loading production files...');
	
	app.use(express.logger());
	app.use(express.static('build'));
	
	app.get('/', function(req, res) {
		res.redirect('/mobile/');
	});
}
else if (env == 'development') {
	console.log('Loading development files...');
	
	var tests = require('./lib/tests.js');
	
	tests.getMiddleware()
		.forEach(function(middleware) {
			app.use(middleware);
		});
	
	[
		'common',
		'desktop',
		'mobile',
		'test'
	].forEach(function(dir) {
		app.use('/' + dir, express.static(dir))
	});
}
else {
	console.error('Unknown environment type: ' + env);
	return;
}

var port = process.env.PORT || 5000;

app.listen(port, function() {
	console.log("Listening on port " + port);
});