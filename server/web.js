var args = process.argv.splice(2);

if (args.length > 0) {
	process.env.NODE_ENV = args[0];
}

var express = require("express");
var mongoose = require("mongoose");

var app = express();
var env = app.get('env');

console.log('Loading server for environment: ' + env);

app.use(express.bodyParser());

if (env == 'production') {
	app.use(express.logger());
	app.use(express.static('build'));
}
else if (env == 'development' || env == 'staging') {
	var isStaging = env == 'staging';
	
	var tests = require('./lib/tests.js');
	
	tests.getMiddleware(isStaging)
		.forEach(function(middleware) {
			app.use(middleware);
		});
	
	var dirs = isStaging
		? [
			'build',
			'test'
		]
		: [
			'common',
			'desktop',
			'mobile',
			'test'
		];
	
	dirs.forEach(function(dir) {
		app.use('/' + dir, express.static(dir))
	});
}
else {
	console.error('Unknown environment type');
	return false;
}

mongoose.connect(process.env.MONGOHQ_URL);
var db = mongoose.connection;

app.get('/', function(req, res) {
	res.redirect('/mobile/');
});

var api = require("./api");
api.init(app);

if (env == 'development') {
	app.use(express.errorHandler());
}

db.on('error', console.error.bind(console, 'database connection error:'));
db.once('open', function() {
	var port = process.env.PORT || 5000;
	
	app.listen(port, function() {
		console.log("Listening on port " + port);
	});
});

