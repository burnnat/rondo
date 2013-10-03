/**
 * 
 */
Ext.define('Tutti.proxy.RestSync', {
	extend: 'Tutti.proxy.Sync',
	alias: 'proxy.restsync',
	
	requires: [
		'Tutti.proxy.Rest'
	],
	
	config: {
		id: null
	},
	
	updateId: function(id) {
		this.setRemoteProxy(
			new Tutti.proxy.Rest({
				url: '/api/' + id,
				reader: {
					type: 'json',
					rootProperty: 'records'
				}
			})
		);
	}
});