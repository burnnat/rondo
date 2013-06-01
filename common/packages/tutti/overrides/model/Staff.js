Ext.define('Tutti.overrides.model.Staff', {
	override: 'Tutti.model.Staff',
	
	config: Tutti.offline
		? {
			proxy: {
				type: 'localstorage',
				id: 'staves'
			}
		}
		: undefined
});