var prep, prepareAll;

(function() {
	var preps = [];
	
	prep = function(callback) {
		preps.push(callback);
	}
	
	prepareAll = function() {
		Ext.Array.forEach(
			preps,
			function(callback) {
				callback();
			}
		);
	}
})();