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
		revisionKey: 'revision',
		remoteProxy: null,
		remote: false
	},
	
	applyRemoteProxy: function(proxy, currentProxy) {
		return Ext.factory(proxy, Ext.data.Proxy, currentProxy, 'proxy');
	},

	updateRemoteProxy: function(proxy, oldProxy) {
		if (proxy && !proxy.getModel()) {
			proxy.setModel(this.getModel());
		}
	},
	
	updateModel: function(model) {
		this.callParent(arguments);
		
		var key = this.getRevisionKey();
		var fields = model.getFields();
		var field = fields.get(key);
		
		if (!field) {
			field = new Ext.data.Field({
				name: key,
				type: 'integer',
				useNull: true,
				defaultValue: null
			});
			
			fields.add(field);
			fields.isDirty = true;
		}
		
		var remote = this.getRemoteProxy();
		
		if (remote) {
			remote.setModel(model);
		}
	},
	
	create: function(operation) {
		var removed = this.getRemoved();
		var modified = false;
		
		Ext.Array.forEach(
			operation.getRecords(),
			function(record) {
				var id = record.getId();
				var index = Ext.Array.indexOf(removed, id);
				
				if (index > -1) {
					modified = true;
					Ext.Array.splice(removed, index, 1);
				}
			}
		);
		
		if (modified) {
			this.setRemoved(removed);
		}
		
		this.callParent(arguments);
	},
	
	update: function(operation) {
		var revisionKey = this.getRevisionKey();
		
		Ext.Array.forEach(
			operation.getRecords(),
			function(record) {
				if (record.isModified(revisionKey)) {
					return;
				}
				
				record.beginEdit();
				record.set(revisionKey, null);
				record.endEdit(true);
			}
		);
		
		this.callParent(arguments);
	},
	
	destroy: function(operation) {
		var removed = this.getRemoved();
		
		Ext.Array.forEach(
			operation.getRecords(),
			function(record) {
				removed.push(record.getId());
			}
		);
		
		this.setRemoved(removed);
		
		this.callParent(arguments);
	},
	
	/**
	 * @private
	 * 
	 * @return {String}
	 */
	getRemovedKey: function() {
		return this.getId() + '-removed';
	},
	
	/**
	 * @private
	 * 
	 * @return {Number[]}
	 */
	getRemoved: function() {
		var ids	= (this.getStorageObject().getItem(this.getRemovedKey()) || "").split(",");
		
		if (ids.length == 1 && ids[0] === "") {
			ids = [];
		}
		
		return ids;
	},

	/**
	 * @private
	 * 
	 * @param {Number[]} ids
	 */
	setRemoved: function(ids) {
		var obj = this.getStorageObject();
		var str = ids.join(",");
		var key = this.getRemovedKey();
		
		obj.removeItem(key);
		
		if (!Ext.isEmpty(str)) {
			obj.setItem(key, str);
		}
	},
	
	/**
	 * @param {Ext.data.Store} store
	 * @param {Function} callback
	 * @param {Object} [scope]
	 */
	sync: function(store, callback, scope) {
		if (!this.getRemote()) {
			Ext.callback(callback, scope, [this, store]);
			return;
		}
		
		//<feature logger>
		Ext.Logger.info("Syncing store '" + store.getStoreId() + "' with server");
		//</feature>
		
		var revisionKey = this.getRevisionKey();
		var params = {};
		
		params[revisionKey] = store.max(revisionKey);
		
		var operation = new Ext.data.Operation({
			action: 'read',
			model: this.getModel(),
			params: params
		});
		
		this.getRemoteProxy().read(
			operation,
			this.createSyncCallback(store, callback, scope)
		);
	},
	
	/**
	 * @private
	 * 
	 * @param {Ext.data.Store} store
	 * @param {Function} callback
	 * @param {Object} scope
	 * 
	 * @return {Function}
	 */
	createSyncCallback: function(store, callback, scope) {
		var me = this;
		
		return function(operation) {
			me.processSyncResponse(operation, store, callback, scope);
		};
	},
	
	/**
	 * @private
	 * 
	 * @param {Ext.data.Operation} operation
	 * @param {Ext.data.Store} store
	 * @param {Function} callback
	 * @param {Object} scope
	 */
	processSyncResponse: function(operation, store, callback, scope) {
		var revisionKey = this.getRevisionKey();
		var maxRevision = operation.getParams()[revisionKey] || 0;
		var removed = this.getRemoved();
		
		var existing = {};
		var conflicts = [];
		
		var changes = {
			create: [],
			update: [],
			destroy: []
		};
		
		Ext.Array.forEach(
			operation.getRecords(),
			function(remote) {
				var id = remote.getId();
				var local = store.getById(id);
				
				if (local) {
					existing[id] = true;
					
					var localRevision = local.get(revisionKey);
					var remoteRevision = remote.get(revisionKey);
					
					if (localRevision == null) {
						if (remoteRevision > maxRevision) {
							// conflicting changes
							conflicts.push({
								local: local,
								remote: remote
							});
						}
						else {
							changes.update.push(local);
						}
					}
					else if (remoteRevision > localRevision) {
						local.set(remote.getData());
					}
				}
				else {
					if (Ext.Array.contains(removed, id)) {
						changes.destroy.push(remote);
					}
					else {
						store.add(remote);
						existing[id] = true;
					}
				}
			}
		);
		
		store.each(function(record) {
			if (!existing[record.getId()]) {
				if (record.get(revisionKey) == null) {
					changes.create.push(record);
				}
				else {
					store.remove(record);
				}
			}
		});
		
		//<feature logger>
		if (conflicts.length > 0) {
			Ext.Logger.warn("Sync conflict detected", conflicts);
		}
		//</feature>
		
		if (changes.create.length > 0 || changes.update.length > 0 || changes.destroy.length > 0) {
			this.getRemoteProxy().batch({
				operations: changes,
				listeners: {
					complete: Ext.bind(
						this.onBatchSyncComplete,
						this,
						[store, callback, scope],
						0
					),
					exception: this.onBatchSyncException,
					scope: this
				}
			});
		}
		else {
			this.onBatchSyncComplete(store, callback, scope);
		}
	},
	
	/**
	 * @private
	 * 
	 * @param {Ext.data.Store} store
	 * @param {Function} callback
	 * @param {Object} scope
	 * @param {Ext.data.Batch} batch
	 */
	onBatchSyncComplete: function(store, callback, scope, batch) {
		//<feature logger>
		Ext.Logger.info("Sync complete for store '" + store.getStoreId() + "'");
		//</feature>
		
		Ext.callback(callback, scope, [this, store]);
	},
	
	/**
	 * @private
	 * 
	 * @param {Ext.data.Batch} batch
	 */
	onBatchSyncException: function(batch) {
		// TODO: Add an event for failed batch operations?
		// Just restart the batch on the next operation for now.
		batch.start();
	}
});