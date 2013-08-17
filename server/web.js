var args = process.argv.splice(2);

if (args.length > 0) {
	process.env.NODE_ENV = args[0];
}

var express = require("express");
var mongoose = require("mongoose");

var options = {
	port: process.env.PORT || 8080,
	secret: process.env.APP_SECRET || 'insecure',
	appDomain: process.env.APP_DOMAIN,
	databaseURL: process.env.MONGOHQ_URL || 'localhost',
	databaseRetry: 5,
	databaseMaxAttempts: 10
};

if (!options.appDomain) {
	options.appDomain = 'http://localhost:' + options.port;
}

var app = express();
var env = app.get('env');

console.log('Loading server for environment: ' + env);

app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({ secret: options.secret }));

var auth = require("./auth");
auth.init(app, options);

var api = require("./api");
api.init(app, options);

if (env == 'production') {
	if (options.secret == 'insecure') {
		console.warn('Warning: using insecure salt on production server');
	}
	
	app.use(express.logger());
	app.use(express.static('build'));
}
else if (env == 'development' || env == 'staging') {
	options.databaseRetry = 2;
	
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

console.log("Connecting to database at: " + options.databaseURL);

var attempts = 0;

var connectWithRetry = function() {
	attempts++;
	
	return mongoose.connect(options.databaseURL, function(err) {
		if (err) {
			if (attempts <= options.databaseMaxAttempts) {
				console.error("Database connection failed, retrying in " + options.databaseRetry + " seconds");
			}
			
			if (attempts == options.databaseMaxAttempts) {
				console.log("Maximum connection attempts (" + options.databaseMaxAttempts + ") reached, hush mode activated");
			}
			
			setTimeout(connectWithRetry, options.databaseRetry * 1000);
		}
	});
};
connectWithRetry();

var db = mongoose.connection;

app.get('/', function(req, res) {
	res.redirect('/mobile/');
});

if (env == 'development') {
	app.use(express.errorHandler());
}

db.on('error', console.error.bind(console, 'Database connection error:'));
db.once('open', function() {
	console.log("Database connection opened");
});

app.listen(options.port, function() {
	console.log("Listening on port " + options.port);
});

