(function() {
	Ext.Loader.setConfig({
		enabled: true,
		disableCaching: false
	});
	
	Ext.Loader.setPath({
		'Ext': '/common/touch/src',
		'Ext.ux': '/common/packages/tutti-touch/ux',
		'Tutti': '/common/packages/tutti/src',
		'Tutti.overrides': '/common/packages/tutti/overrides',
		'Tutti.score': '/common/packages/tutti-touch/src/score',
		'Tutti.touch': '/common/packages/tutti-touch/src/touch',
		'Tutti.touch.overrides': '/common/packages/tutti-touch/overrides',
		'Rondo': '/mobile/app'
	});
})();