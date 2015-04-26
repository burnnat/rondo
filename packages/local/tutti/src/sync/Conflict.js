/**
 * 
 */
Ext.define('Tutti.sync.Conflict', {
	
	config: {
		/**
		 * @cfg {Ext.data.proxy.Proxy}
		 */
		proxy: null,
		
		/**
		 * @cfg {Ext.data.Store}
		 */
		store: null,
		
		/**
		 * @cfg {Ext.data.Model}
		 */
		local: null,
		
		/**
		 * @cfg {Ext.data.Model}
		 */
		remote: null
	},
	
	constructor: function(config) {
		this.initConfig(config);
	},
	
	useRemote: function() {
		var remote = this.getRemote();
		var local = this.getLocal();
		var store = this.getStore();
		
		if (remote == null) {
			store.remove(local);
		}
		else if (local == null) {
			store.add(remote);
		}
		else {
			local.set(remote.getData());
		}
	},
	
	useLocal: function() {
		var remote = this.getRemote();
		var local = this.getLocal();
		var proxy = this.getProxy();
		
		if (remote == null) {
			proxy.create(
				new Ext.data.Operation({
					action: 'create',
					records: [local],
					model: proxy.getModel()
				})
			);
		}
		else if (local == null) {
			proxy.destroy(
				new Ext.data.Operation({
					action: 'destroy',
					records: [remote],
					model: proxy.getModel()
				})
			);
		}
		else {
			proxy.update(
				new Ext.data.Operation({
					action: 'update',
					records: [local],
					model: proxy.getModel()
				})
			);
		}
	}
});