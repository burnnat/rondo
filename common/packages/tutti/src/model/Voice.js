/**
 * 
 */
Ext.define('Tutti.model.Voice', {
	extend: 'Ext.data.Model',
	
	requires: [
		'Tutti.association.LocalBelongsTo',
		'Tutti.model.Staff'
	],
	
	config: {
		identifier: 'uuid',
		
		proxy: {
			type: 'syncstorage',
			id: 'voices',
			owner: 'user',
			access: 'private'
		},
		
		fields: [
			{
				name: 'notes',
				type: 'string',
				convert: function(value) {
					if (!Ext.isString(value)) {
						return Ext.encode(Ext.Array.from(value));
					}
					
					return value;
				}
			}
		],
		
		associations: [
			{
				type: 'localbelongsto',
				model: 'Tutti.model.Staff',
				lookupStore: 'staves'
			}
		]
	},
	
	getNoteData: function() {
		return Ext.decode(this.get('notes'));
	}
}
//<debug>
,function() {
	if (Tutti.offline) {
		this.prototype.initConfig({
			proxy: {
				type: 'localstorage'
			}
		});
	}
}
//</debug>
);