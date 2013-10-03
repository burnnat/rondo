/**
 * 
 */
Ext.define('Tutti.model.Part', {
	extend: 'Ext.data.Model',
	
	requires: [
		'Ext.data.proxy.Rest',
		'Tutti.association.LocalHasMany',
		'Tutti.model.Staff',
		'Tutti.proxy.Sync'
	],
	
	config: {
		identifier: 'uuid',
		
		proxy: {
			type: 'sync',
			id: 'parts',
			remoteProxy: {
				type: 'rest',
				url: '/api/parts',
				reader: {
					type: 'json',
					rootProperty: 'records'
				}
			}
		},
		
		fields: [
			{
				name: 'name',
				type: 'string'
			},
			{
				name: 'group',
				type: 'string'
			}
		],
		
		associations: [
			{
				type: 'localhasmany',
				model: 'Tutti.model.Staff',
				name: 'staves'
			}
		]
	}
});