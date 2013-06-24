var prep, prepareAll;

(function() {
	//<debug>
	Ext.Loader.setConfig({
		enabled: true
	});
	
	Ext.namespace('Tutti').offline = true;
	//</debug>
	
	Ext.Loader.setPath({
		'Ext': '/common/touch/src',
		'Ext.io': '/common/packages/sencha-io/src/io',
		'Ext.cf': '/common/packages/sencha-io/src/cf',
		'Ext.ux': '/common/packages/tutti-touch/ux',
		'Tutti': '/common/packages/tutti/src',
		'Tutti.score': '/common/packages/tutti-touch/src/score',
		'Tutti.touch': '/common/packages/tutti-touch/src/touch',
		'Rondo': '/mobile/app'
	});
	
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