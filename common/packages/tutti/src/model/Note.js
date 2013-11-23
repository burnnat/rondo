/**
 * 
 */
Ext.define('Tutti.model.Note', {
	extend: 'Ext.data.Model',
	
	config: {
		identifier: 'uuid',
		
		fields: [
			{
				name: 'id',
				persist: false
			},
			{
				name: 'pitches',
				type: 'auto'
			},
			{
				name: 'ties',
				type: 'auto'
			},
			{
				name: 'duration',
				type: 'string'
			},
			{
				name: 'rest',
				type: 'boolean',
				defaultValue: false
			}
		]
	}
});