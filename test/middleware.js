var fs = require('fs');
var glob = require('glob');
var mustache = require('mustache');
var url = require('url');
var path = require('path');

var testpath = 'test/jasmine/';

module.exports = {
	init: function(base) {
		this.base = base;
		this.testbase = path.normalize(path.join(base, testpath));
	},
	
	jasmine: function(name) {
		var base = this.base;
		var testlet = path.join(this.testbase, name + '.html');
		
		var specs = glob.sync('spec/' + name + '/**/*.js', { cwd: this.testbase });
		var data = {
			specs: specs.map(function(filepath) {
				return { path: filepath };
			})
		};
		
		return function(req, res, next) {
			var filepath = path.normalize(
				path.join(
					base,
					url.parse(req.url).pathname
				)
			);
			
			if (filepath !== testlet) {
				return next();
			}
			
			fs.readFile(
				testlet,
				'utf-8',
				function(err, template) {
					if (err) {
						next(err);
					}
					
					res.end(
						mustache.render(template, data)
					);
				}
			);
		};
	}
};