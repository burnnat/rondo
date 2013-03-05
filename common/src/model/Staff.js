/**
 * 
 */
Ext.define('Tutti.model.Staff', {
	extend: 'Ext.data.Model',
	
	config: {
		identifier: 'uuid',
		
		proxy: {
			type: Tutti.offline ? 'localstorage' : 'syncstorage',
			id: 'staves',
			owner: 'user',
			access: 'private'
		},
		
		fields: [
			{
				name: 'clef',
				type: 'string'
			}
		]
	}
});