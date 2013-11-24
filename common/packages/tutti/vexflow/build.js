var _ = require('lodash');
var async = require('async');

var os = require('os');
var fs = require('fs');
var path = require('path');
var glob = require('glob');
var mkdirp = require('mkdirp');
var esprima = require('esprima');

var through = require('through');
var combine = require('combined-stream');

var srcDir = process.argv[2];
var destDir = process.argv[3];

var defined = {};
var fileData = {};

/**
 * Executes visitor on the object and its children (recursively).
 * The visitor function may return an array of children to visit.
 * 
 * @param {Object} node
 * @param {Function} visitor
 */
var traverse = function(node, visitor) {
	var next = visitor(node);
	
	if (!next) {
		var key, child;
		next = [];
		
		for (key in node) {
			if (node.hasOwnProperty(key)) {
				child = node[key];
				if (typeof child === 'object' && child !== null) {
					next.push(child);
				}
			}
		}
	}
	
	next.forEach(
		function(child) {
			traverse(child, visitor);
		}
	);
};

/**
 * Parses a VexFlow class name from the given MemberExpression node.
 * If "strict" is enabled, the expression must reference the class
 * itself, not one of its members.
 * 
 * @param {Object} node
 * @param {Boolean} [strict]
 * 
 * @return {String}
 */
var getVexClass = function(node, strict) {
	var valid = true;
	var segments = [];
	
	traverse(
		node,
		function(child) {
			if (valid && child.type === 'Identifier') {
				var name = child.name;
				
				// Class names are capitalized, but not entirely caps.
				if (/[A-Z]/.test(name[0]) && !/^[A-Z]+$/.test(name)) {
					segments.push(child.name);
				}
				else {
					valid = false;
				}
			}
		}
	);
	
	if (strict && !valid) {
		return null;
	}
	
	if (segments.length > 0 && segments[0] === 'Vex') {
		return segments.join('.');
	}
	
	return null;
};

/**
 * Parses referenced and defined classes from a given piece of javascript.
 * 
 * @param {String} content
 * @param {Object} defs
 * @param {Object} refs
 */
var parseClasses = function(file, content) {
	var data = fileData[file];
	var ast = esprima.parse(content, { tolerant: true, loc: true, range: true });
	
	traverse(
		ast,
		function(node) {
			if (node.type === 'AssignmentExpression') {
				var left = node.left;
				var right = node.right;
				
				if (left.type === 'MemberExpression') {
					var name = getVexClass(left, true);
					
					if (name) {
						defined[name] = true;
						data.defs[name] = true;
						
						if (/^Vex\.Flow\./.test(name)) {
							data.refs['Vex.Flow'] = true;
						}
						else if (/^Vex\./.test(name)) {
							data.refs['Vex'] = true;
						}
					}
					
					return [node.right];
				}
			}
			else if (node.type === 'MemberExpression') {
				var name = getVexClass(node);
				
				if (name) {
					data.refs[name] = true;
				}
				
				return [];
			}
			else if (node.type === 'FunctionDeclaration') {
				var name = getVexClass(node.id, true);
				
				if (name) {
					defined[name] = true;
					data.defs[name] = true;
				}
			}
		}
	);
};

/**
 * Writes content for the given file, including headers for defined 
 * and required classes ahead of the original file content.
 * 
 * @param {String} file
 * @param {Object} defs
 * @param {Object} refs
 */
var writeWithHeader = function(file, callback) {
	var data = fileData[file];
	
	var combined = combine.create();
	
	// Setup header stream
	var header = through().pause();
	var eol = os.EOL;
	
	_.each(
		_.sortBy(
			_.filter(
				_.keys(data.refs),
				function(name) {
					return _.has(defined, name) && !_.has(data.defs, name);
				}
			)
		),
		function(name) {
			header.queue('//@require ' + name + eol);
		}
	);
	
	_.each(
		_.sortBy(_.keys(data.defs)),
		function(name) {
			header.queue('//@define ' + name + eol);
		}
	);
	
	header.end(eol);
	
	combined.append(header);
	
	// Setup source content stream
	var src = path.join(srcDir, file);
	var input = fs.createReadStream(src);
	
	input.on('error', function(err) {
		console.error('Error reading file: ' + src);
		console.error(err);
	});
	
	combined.append(input);
	
	// Setup output stream
	var dest = path.join(destDir, file);
	mkdirp.sync(path.dirname(dest));
	
	var output = fs.createWriteStream(dest);
	
	output.on('error', function(err) {
		console.error('Error writing file: ' + dest);
		console.error(err);
	});
	
	combined.pipe(output);
	
	// Begin writing
	header.resume();
};

glob(
	srcDir + '/!(header).js',
	function(error, files) {
		// Manually specify the font file we want in the build.
		files.push(path.join(srcDir, 'fonts/vexflow_font.js'));
		
		async.series([
			function(callback) {
				async.each(
					files,
					function(src, next) {
						var file = path.relative(srcDir, src);
						
						try {
							fs.readFile(
								src,
								'utf-8',
								function(err, data) {
									if (err) {
										console.error('Error reading file: ' + file);
										console.error(err);
									}
									
									console.log('Processing file: ' + file);
									
									fileData[file] = {
										defs: {},
										refs: {}
									};
									
									parseClasses(file, data);
									next();
								}
							);
						}
						catch (e) {
							console.error(e);
						}
					},
					callback
				);
			},
			function(callback) {
				console.log('Writing data...');
				
				async.each(
					files,
					function(src, next) {
						writeWithHeader(path.relative(srcDir, src), next);
					},
					callback
				);
			}
		]);
	}
);