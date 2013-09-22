/**
 * 
 */
Ext.define('Tutti.model.Voice', {
	extend: 'Ext.data.Model',
	
	requires: [
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
			id: 'voices'
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