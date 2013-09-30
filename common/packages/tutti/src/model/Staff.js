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
			id: 'staves',
			remoteProxy: {
				type: 'rest',
				url: '/api/staves',
				reader: {
					type: 'json',
					rootProperty: 'records'
				}
			}
		},
		
		fields: [
			{
				name: 'clef',
				type: 'string'
			}
		]
	}
});