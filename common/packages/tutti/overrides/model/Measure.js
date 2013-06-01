Ext.define('Tutti.overrides.model.Measure', {
	override: 'Tutti.model.Measure',
	
	config: Tutti.offline
		? {
			proxy: {
				type: 'localstorage',
				id: 'measures'
			}
		}
		: undefined
});