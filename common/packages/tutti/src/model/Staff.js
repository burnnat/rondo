/**
 * 
 */
Ext.define('Tutti.model.Staff', {
	extend: 'Ext.data.Model',
	
	requires: [
		'Tutti.proxy.Sync'
	],
	
	config: {
		identifier: 'uuid',
		
		proxy: {
			type: 'sync',
			id: 'staves'
		},
		
		fields: [
			{
				name: 'clef',
				type: 'string'
			}
		]
	}
});