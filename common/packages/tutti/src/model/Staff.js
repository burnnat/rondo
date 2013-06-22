/**
 * 
 */
Ext.define('Tutti.model.Staff', {
	extend: 'Ext.data.Model',
	
	config: {
		identifier: 'uuid',
		
		proxy: {
			type: 'syncstorage',
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
}
//<debug>
,function() {
	if (Tutti.offline) {
		this.prototype.initConfig({
			proxy: {
				type: 'localstorage',
				id: 'offline-staves'
			}
		});
	}
}
//</debug>
);