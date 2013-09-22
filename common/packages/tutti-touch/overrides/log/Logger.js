(function() {
	var makeOverride = function(priority) {
		return function(message, callerId) {
			if (typeof callerId == 'number') {
				callerId += 1;
			}
			
			if (!callerId) {
				callerId = 1;
			}
			
			this.log(message, priority, callerId);
		}
	};
	
	/**
	 * 
	 */
	Ext.define('Tutti.touch.overrides.log.Logger', {
		override: 'Ext.log.Logger',
		
		verbose: makeOverride('verbose'),
		info: makeOverride('info'),
		deprecate: makeOverride('deprecate'),
		warn: makeOverride('warn'),
		error: makeOverride('error')
	});
})();