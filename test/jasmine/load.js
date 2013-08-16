(function() {
	Ext.Loader.setConfig({
		enabled: true,
		disableCaching: false
	});
	
	Ext.Loader.setPath({
		'Ext': '/common/touch/src',
		'Ext.ux': '/common/packages/tutti-touch/ux',
		'TouchOverrides': '/common/packages/tutti-touch/overrides',
		'Tutti': '/common/packages/tutti/src',
		'Tutti.score': '/common/packages/tutti-touch/src/score',
		'Tutti.touch': '/common/packages/tutti-touch/src/touch',
		'Rondo': '/mobile/app'
	});
})();