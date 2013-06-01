Ext.define('Tutti.overrides.model.Part', {
	override: 'Tutti.model.Part',
	
	config: Tutti.offline
		? {
			proxy: {
				type: 'localstorage',
				id: 'parts'
			}
		}
		: undefined
});