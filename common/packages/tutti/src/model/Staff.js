/**
 * 
 */
Ext.define('Tutti.model.Staff', {
	extend: 'Ext.data.Model',
	
	requires: [
		'Tutti.proxy.RestSync'
	],
	
	config: {
		identifier: 'uuid',
		
		proxy: {
			type: 'restsync',
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