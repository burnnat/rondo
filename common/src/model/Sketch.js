/**
 * 
 */
Ext.define('Tutti.model.Sketch', {
	extend: 'Ext.data.Model',
	
	requires: [
		'Tutti.association.LocalHasMany',
		'Tutti.model.Measure',
		'Tutti.model.Part'
	],
	
	config: {
		identifier: 'uuid',
		
		proxy: {
			type: Tutti.offline ? 'localstorage' : 'syncstorage',
			id: 'sketches',
			owner: 'user',
			access: 'private'
		},
		
		fields: [
			{
				name: 'title',
				type: 'string'
			}
		],
		
		associations: [
			{
				type: 'localhasmany',
				model: 'Tutti.model.Part'
			},
			{
				type: 'localhasmany',
				model: 'Tutti.model.Measure'
			}
		]
	}
});