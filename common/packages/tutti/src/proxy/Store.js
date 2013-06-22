/**
 * 
 */
Ext.define('Tutti.proxy.Store', {
	extend: 'Ext.data.proxy.Client',
	alias: 'proxy.store',
	
	config: {
		storeName: null
	},
	
	getStore: function() {
		if (!this.store) {
			this.store = Ext.getStore(this.getStoreName());
		}
		
		return this.store;
	},
	
	create: function(operation, callback, scope) {
		var store = this.getStore();
		
		store.add(operation.getRecords());
		store.sync();
		
		Ext.callback(callback, scope || this, [operation]);
	},
	
	update: function(operation, callback, scope) {
		var store = this.getStore();
		
		store.sync();
		
		Ext.callback(callback, scope || this, [operation]);
	},
	
	destroy: function(operation, callback, scope) {
		var store = this.getStore();
		
		store.remove(operation.getRecords());
		store.sync();
		
		Ext.callback(callback, scope || this, [operation]);
	},
	
	read: function(operation, callback, scope) {
		var store = this.getStore();
		
		var filters = Ext.Array.map(
			operation.getFilters(),
			function(filter) {
				return filter.getFilterFn();
			}
		);
		
		var matches = store.queryBy(function(record) {
			return Ext.Array.every(
				filters,
				function(filter) {
					return filter(record);
				}
			);
		});
		
		var results = new Ext.data.ResultSet({
			total: store.getTotalCount(),
			count: matches.getCount(),
			records: matches.getRange(),
			success: true
		});
		
		operation.setResultSet(results);
		operation.setCompleted();
		operation.setSuccessful();
		
		Ext.callback(callback, scope || this, [operation]);
	},
	
	clear: function() {
		var store = this.getStore();
		
		store.removeAll();
		store.sync();
	}
})