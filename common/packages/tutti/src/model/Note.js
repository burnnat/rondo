/**
 * 
 */
Ext.define('Tutti.model.Note', {
	extend: 'Ext.data.Model',
	
	config: {
		identifier: 'uuid',
		
		fields: [
			{
				name: 'pitches',
				type: 'string',
				convert: function(value) {
					if (!Ext.isString(value)) {
						return Ext.encode(Ext.Array.from(value));
					}
					
					return value;
				}
			},
			{
				name: 'duration',
				type: 'string'
			}
		]
	},
	
	getPitchData: function() {
		return Ext.decode(this.get('pitches'));
	}
});