/**
 * 
 */
Ext.define('Tutti.model.Part', {
	extend: 'Ext.data.Model',
	
	requires: [
		'Tutti.association.LocalHasMany',
		'Tutti.model.Staff',
		'Tutti.proxy.RestSync'
	],
	
	config: {
		identifier: 'uuid',
		
		proxy: {
			type: 'restsync',
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