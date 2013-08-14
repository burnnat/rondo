/**
 * 
 */
Ext.define('Tutti.model.Staff', {
	extend: 'Ext.data.Model',
	
	config: {
		identifier: 'uuid',
		
		proxy: {
			type: 'localstorage',
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