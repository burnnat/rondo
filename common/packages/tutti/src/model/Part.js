/**
 * 
 */
Ext.define('Tutti.model.Part', {
	extend: 'Ext.data.Model',
	
	requires: [
		'Tutti.association.LocalHasMany',
		'Tutti.model.Staff'
	],
	
	config: {
		identifier: 'uuid',
		
		proxy: {
			type: 'localstorage',
			id: 'parts'
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