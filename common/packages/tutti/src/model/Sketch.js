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
			type: 'localstorage',
			id: 'sketches'
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