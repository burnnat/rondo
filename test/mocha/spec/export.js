var app = require('../lib/app.js');
var assert = require('assert');
var path = require('path');
var q = require('q');
var fs = require('q-io/fs');
var xml = require('node-xml');

var parser = function(handler) {
	return new xml.SaxParser(function(cb) {
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
		var sketch;
		
		before(function(done) {
			fs.read(path.resolve(__dirname, '../res/' + name + '.json'))
				.then(JSON.parse)
				.then(function(json) {
					return (
						make('sketches', json.data)
							.then(function(id) {
								sketch = id;
							})
							.then(function() {
								return q.all(
									json.parts.map(function(part) {
										part.sketch_id = sketch;
										return make('parts', part);
									})
								);
							})
							.then(function() {
								return q.all(
									json.measures.map(function(measure) {
										measure.sketch_id = sketch;
										return make('measures', measure);
									})
								);
							})
					);
				})
				.nodeify(done)
		});
		
		it('responds with correct XML', function(done) {
			app.get('/api/sketches/' + sketch + '/export')
				.set('Accept', 'application/xml')
				.expect('Content-Type', /xml/)
				.expect(200)
				.end(function(err, res) {
					var expected = [];
					
					var expectedParser = parser(function(event) {
						expected.push(event);
					});
					
					var actualParser = parser(function(event) {
						assert.deepEqual(event, expected.shift());
					});
					
					fs.read(path.resolve(__dirname, '../res/' + name + '.xml'))
						.then(function(data) {
							expectedParser.parseString(data);
						})
						.then(function() {
							actualParser.parseString(res.text);
						})
						.nodeify(done);
				});
		})
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
})