if (process.argv[1] === __filename) {
	var args = process.argv.splice(2);
	
	if (args.length > 0) {
		process.env.NODE_ENV = args[0];
	}
}

var fs = require("fs");
var express = require("express");
var mongoose = require("mongoose");
var winston = require("winston");

// Remove default transport so we can replace it with our own.
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
	level: 'info',
	colorize: true
});

var app = express();
var env = app.get('env');

winston.info('Loading server for environment: ' + env);

var locals = {};

if (env != 'production') {
	var propFile = 'local.properties';
	
	if (fs.existsSync(propFile)) {
		locals = require('properties-parser').read(propFile);
	}
}

var options = {
	logFile: 'rondo.log',
	
	port: process.env.PORT || 8080,
	secret: process.env.APP_SECRET || 'insecure',
	appDomain: locals['app.domain'] || process.env.APP_DOMAIN,
	
	facebookID: locals['facebook.id'] || process.env.FACEBOOK_ID,
	facebookSecret: locals['facebook.secret'] || process.env.FACEBOOK_SECRET,
	
	databaseURL: process.env.MONGOHQ_URL || 'localhost',
	databaseRetry: 5,
	databaseMaxAttempts: 10
};

if (!options.appDomain) {
	options.appDomain = 'http://localhost:' + options.port;
}

if (env == 'production') {
	winston.add(winston.transports.File, {
		filename: options.logFile,
		level: 'verbose',
		timestamp: true
	});
	
	if (options.secret == 'insecure') {
		winston.warn('Warning: using insecure salt on production server');
	}
}

app.use(express.cookieParser());
app.use(express.json());
app.use(express.session({ secret: options.secret }));

var auth = require("./auth");
auth.init(app, options);

var api = require("./api");
api.init(app, options);

if (env == 'production') {
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
		? {
			'mobile': 'build/mobile/production',
			'test': 'test'
		}
		: {
			'common': 'common',
			'desktop': 'desktop',
			'mobile': 'mobile',
			'test': 'test'
		};
	
	for (var key in dirs) {
		app.use('/' + key, express.static(dirs[key]));
	}
}
else {
	winston.error('Unknown environment type: %s', env);
	return false;
}

winston.info("Connecting to database at: %s", options.databaseURL);

var attempts = 0;

var connectWithRetry = function() {
	attempts++;
	
	return mongoose.connect(options.databaseURL, function(err) {
		if (err) {
			if (attempts <= options.databaseMaxAttempts) {
				winston.warn("Database connection failed, retrying in %d seconds", options.databaseRetry);
			}
			
			if (attempts == options.databaseMaxAttempts) {
				winston.warn("Maximum connection attempts (%d) reached, hush mode activated", options.databaseMaxAttempts);
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

db.on('error', function(err) {
	winston.error("Database connection error: %s", err);
});

db.once('open', function() {
	winston.info("Database connection opened");
});

app.listen(options.port, function() {
	winston.info("Listening on port %d using host: %s", options.port, options.appDomain);
});

