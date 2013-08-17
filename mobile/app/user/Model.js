/**
 * 
 */
Ext.define('Rondo.user.Model', {
	extend: 'Ext.data.Model',
	
	requires: ['Rondo.user.Proxy'],
	
	config: {
		proxy: 'user',
		
		fields: [
			{
				name: 'authenticated',
				type: 'boolean'
			}
		]
	}
});