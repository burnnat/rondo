var app = require('../lib/app.js');
var assert = require('assert');
var mustache = require('mustache');
var path = require('path');
var pretty = require('pretty-data').pd;
var q = require('q');
var qfs = require('q-io/fs');
var xml = require('node-xml');

var parser = function(handler, error) {
	var p = new xml.SaxParser(function(cb) {
		cb.onDTD(function(root, pubId, sysId) {
			handler({
				type: 'dtd',
				root: root,
				pubId: pubId,
				sysId: sysId
			});
		});
		
		cb.onStartDocument(function() {
			handler({ type: 'startdoc' });
		});
		
		cb.onEndDocument(function() {
			handler({ type: 'enddoc' });
		});
		
		cb.onStartElementNS(function(el, attrs, prefix, uri, namespaces) {
			handler({
				type: 'start',
				el: el,
				attrs: attrs,
				prefix: prefix,
				uri: uri,
				namespaces: namespaces
			});
		});
		
		cb.onEndElementNS(function(el, prefix, uri) {
			handler({
				type: 'end',
				el: el,
				prefix: prefix,
				uri: uri
			});
		});
		
		cb.onCharacters(function(text) {
			var trimmed = text.trim();
			
			// Ignore pure whitespace
			if (trimmed.length > 0) {
				handler({
					type: 'text',
					text: trimmed
				});
			}
		});
		
		cb.onCdata(function(cdata) {
			handler({
				type: 'cdata',
				data: cdata
			});
		});
	});
	
	p.parse = function(data) {
		var deferred = q.defer();
		
		this.setErrorHandler({
			onError: function(message) {
				deferred.reject(new Error(message));
			}
		});
		
		this.parseString(data);
		
		// If already rejected, this does nothing (as we want).
		deferred.resolve();
		
		return deferred.promise;
	};
	
	return p;
};

var make = function(type, data) {
	var deferred = q.defer();
	
	app.post('/api/' + type)
		.send(data)
		.set('Accept', 'application/json')
		.expect('Content-Type', /json/)
		.expect(
			200,
			function(err, res) {
				if (err) {
					deferred.reject(err);
				}
				else {
					deferred.resolve(res.body.records.id);
				}
			}
		);
	
	return deferred.promise;
};

var testExport = function(name) {
	describe('for ' + name + ' data', function() {
		var items = {};
		
		before(function(done) {
			qfs.read(path.resolve(__dirname, '../res/' + name + '.json'))
				.then(JSON.parse)
				.then(function(json) {
					var inject = function(type, fn) {
						var data = json[type];
						
						if (data) {
							return (
								q.all(
									data.map(function(item) {
										fn(item);
										return make(type, item);
									})
								)
								.then(function(ids) {
									items[type] = ids;
								})
							);
						}
					};
					
					return (
						make('sketches', json.data)
							.then(function(id) {
								items.sketch = id;
							})
							.then(function() {
								return inject(
									'parts',
									function(part) {
										part.sketch_id = items.sketch;
									}
								);
							})
							.then(function() {
								return inject(
									'staves',
									function(staff) {
										staff.part_id = items.parts[staff.part_id];
									}
								);
							})
							.then(function() {
								return inject(
									'measures',
									function(measure) {
										measure.sketch_id = items.sketch;
									}
								);
							})
							.then(function() {
								return inject(
									'voices',
									function(voice) {
										voice.measure_id = items.measures[voice.measure_id];
										voice.staff_id = items.measures[voice.staff_id];
									}
								);
							})
					);
				})
				.nodeify(done)
		});
		
		it('responds with correct XML', function(done) {
			app.get('/api/sketches/' + items.sketch + '/export')
				.set('Accept', 'application/xml')
				.expect('Content-Type', /xml/)
				.expect(200)
				.end(function(err, res) {
					var actualRaw = res.text;
					var expectedRaw;
					
					var expected = [];
					
					var expectedParser = parser(function(event) {
						expected.push(event);
					});
					
					var actualParser = parser(function(event) {
						assert.deepEqual(event, expected.shift());
					});
					
					qfs.read(path.resolve(__dirname, '../res/' + name + '.xml'))
						.then(function(template) {
							expectedRaw = mustache.render(template, items);
							return expectedParser.parse(expectedRaw);
						})
						.then(function() {
							return actualParser.parse(actualRaw);
						})
						.then(function() {
							assert.equal(expected.length, 0);
						})
						.fail(function(err) {
							var text = err.message;
							
							text += '\n\n';
							
							text += 'Expected:\n';
							text += pretty.xml(expectedRaw);
							
							text += '\n\n';
							
							text += 'Actual:\n';
							text += pretty.xml(actualRaw);
							
							throw new Error(text);
						})
						.nodeify(done);
				});
		});
	});
};

describe('Sketch exports', function() {
	var id;
	
	before(function(done) {
		app.reset()
			.then(function() {
				return app.login();
			})
			.nodeify(done);
	});
	
	testExport('empty');
	testExport('single');
})