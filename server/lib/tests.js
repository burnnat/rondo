var util = require('util');
var fs = require('fs');
var glob = require('glob');
var mustache = require('mustache');
var url = require('url');
var path = require('path');
var escape = require('escape-regexp');

var base = '.';
var tests = {};

var config = JSON.parse(
	fs.readFileSync(
		'test/tests.json',
		'utf8'
	)
);

for (framework in config) {
	var test = config[framework];
	var testBase = path.normalize(path.join(base, test.path));
	
	tests[framework] = {
		path: testBase,
		page: path.normalize(path.join(testBase, test.page)),
		pattern: path.normalize(path.join(testBase, test.pattern)),
		specs: {}
	}
}

module.exports = {
	
	base: base,
	tests: tests,
	
	extract: function(string, pattern) {
		var segment = "[^" + escape(path.sep) + "]+";
		
		return path.normalize(string).match(
			new RegExp(
				"^" + 
				util.format(
					escape(pattern)
						.replace(
							/\\\*(\\\*(\\\\|\\\/)?)?/g,
							function(all, inclusive) {
								return inclusive ? ".*" : segment
							}
						),
					"(" + segment + ")"
				)
			)
		)[1];
	},
	
	/**
	 * 
	 */
	getWatch: function(grunt) {
		var me = this;
		var config = {};
		
		for (framework in this.tests) {
			config[framework] = {
				files: [
					util.format(this.tests[framework].pattern, '*')
				],
				options: {
					event: ['added', 'deleted']
				}
			}
		}
		
		grunt.event.on(
			'watch',
			function(action, filepath, target) {
				if (target) {
					me.reload(
						target,
						me.extract(filepath, me.tests[target].pattern)
					);
				}
			}
		);
		
		return config;
	},
	
	reload: function(framework, name) {
		var test = this.tests[framework];
		
		var specs = glob.sync(
				util.format(test.pattern, name)
			).map(
				function(filepath) {
					return { path: '/' + filepath };
				}
			);
		
		if (specs.length > 0) {
			specs[specs.length-1].last = true;
		}
		
		test.specs[name] = specs;
	},
	
	/**
	 * 
	 */
	getMiddleware: function(production) {
		var me = this;
		var middleware = [];
		
		for (framework in this.tests) {
			var test = this.tests[framework];
			
			glob.sync(util.format(test.page, '*'))
				.forEach(function(filepath) {
					middleware.push(
						me.makeMiddleware(
							framework,
							me.extract(filepath, test.page),
							production
						)
					)
				});
		}
		
		return middleware;
	},
	
	makeMiddleware: function(framework, name, production) {
		var me = this;
		var test = me.tests[framework];
		var testlet = util.format(test.page, name);
		
		this.reload(framework, name);
		
		return function(req, res, next) {
			var filepath = path.normalize(
				path.join(
					me.base,
					url.parse(req.url).pathname
				)
			);
			
			if (filepath !== testlet) {
				return next();
			}
			
			fs.readFile(
				testlet,
				'utf8',
				function(err, template) {
					if (err) {
						next(err);
					}
					
					res.end(
						mustache.render(
							template,
							{
								production: production,
								specs: test.specs[name]
							}
						)
					);
				}
			);
		};
	}
};