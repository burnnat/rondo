/**
 * 
 */
Ext.define('Tutti.proxy.Sync', {
	extend: 'Ext.data.proxy.LocalStorage',
	alias: 'proxy.sync',
	
	requires: [
		'Ext.data.proxy.Rest'
	],
	
	config: {
		remote: false
	},
	
	constructor: function() {
		this.callParent(arguments);
		
		this.remoteProxy = new Ext.data.proxy.Rest({
			url: '/api/' + this.getId(),
			reader: {
				type: 'json',
				rootProperty: 'records'
			}
		});
		
		Ext.Array.forEach(
			[
				'batch',
				'create',
				'destroy',
				'read',
				'update'
			],
			function(method) {
				var orig = this[method];
				
				this[method] = function() {
					var args = arguments;
					
					if (this.getRemote()) {
						return this.remoteProxy[method].apply(this.remoteProxy, args);
					}
					else {
						return orig.apply(this, args);
					}
				};
			},
			this
		);
	},
	
	updateModel: function(model) {
		this.callParent(arguments);
		
		if (this.getRemote()) {
			this.remoteProxy.setModel(model);
		}
	},
	
	updateReader: function(reader) {
		this.callParent(arguments);
		
		if (this.getRemote()) {
			this.remoteProxy.setReader(reader);
		}
	},
	
	updateWriter: function(writer) {
		this.callParent(arguments);
		
		if (this.getRemote()) {
			this.remoteProxy.setWriter(writer);
		}
	},
	
	/**
	 * @param {Ext.data.Store} store
	 * @param {Function} callback
	 * @param {Object} [scope]
	 */
	sync: function(store, callback, scope) {
		var id = store.getStoreId();
		
		//<feature logger>
		Ext.Logger.info("Syncing store '" + id + "' with server");
		//</feature>
		
		// TODO: implement the actual sync logic
		
		//<feature logger>
		Ext.Logger.info("Sync complete for store '" + id + "'");
		//</feature>
		
		Ext.callback(callback, scope, [this, store]);
	}
});