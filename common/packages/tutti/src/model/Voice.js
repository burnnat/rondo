/**
 * 
 */
Ext.define('Tutti.model.Voice', {
	extend: 'Ext.data.Model',
	
	requires: [
		'Ext.data.proxy.Rest',
		'Tutti.association.LocalBelongsTo',
		'Tutti.association.InternalHasMany',
		'Tutti.model.Staff',
		'Tutti.model.Note',
		'Tutti.proxy.Sync'
	],
	
	uses: [
		'Tutti.model.Note'
	],
	
	config: {
		identifier: 'uuid',
		
		proxy: {
			type: 'sync',
			id: 'voices',
			remoteProxy: {
				type: 'rest',
				url: '/api/voices',
				reader: {
					type: 'json',
					rootProperty: 'records'
				}
			}
		},
		
		associations: [
			{
				type: 'localbelongsto',
				model: 'Tutti.model.Staff',
				lookupStore: 'staves'
			},
			{
				type: 'internalhasmany',
				model: 'Tutti.model.Note'
			}
		]
	}
});