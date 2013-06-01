Ext.define('Tutti.overrides.model.Sketch', {
	override: 'Tutti.model.Sketch',
	
	config: Tutti.offline
		? {
			proxy: {
				type: 'localstorage',
				id: 'sketches'
			}
		}
		: undefined
});