var prep, prepareAll, classname;

(function() {
	var preps = [];
	
	prep = function(callback) {
		preps.push(callback);
	};
	
	prepareAll = function() {
		Ext.Array.forEach(
			preps,
			function(callback) {
				callback();
			}
		);
	};
	
	classname = function(name) {
		return 'Test.' + Ext.id(null, 'run') + '.' + name;
	};
})();