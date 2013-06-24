var fs = require('fs');
var glob = require('glob');
var mustache = require('mustache');
var url = require('url');
var path = require('path');

var testpath = 'test/jasmine/';
var specpath = 'spec/';

module.exports = {
	init: function(base) {
		this.base = base;
		this.testbase = path.normalize(path.join(base, testpath));
		this.specbase = path.normalize(path.join(this.testbase, specpath));
	},
	
	specs: {},
	
	reload: function(name) {
		var specs = glob.sync(specpath + name + '/**/*.js', { cwd: this.testbase });
		
		this.specs[name] =  specs.map(function(filepath) {
			return { path: filepath };
		});
	},
	
	jasmine: function(name) {
		var me = this;
		this.reload(name);
		
		return function(req, res, next) {
			var testlet = path.join(me.testbase, name + '.html');
			
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
				'utf-8',
				function(err, template) {
					if (err) {
						next(err);
					}
					
					res.end(
						mustache.render(template, { specs: me.specs[name] })
					);
				}
			);
		};
	}
};