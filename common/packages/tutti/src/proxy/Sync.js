/**
 * 
 */
Ext.define('Tutti.proxy.Sync', {
	extend: 'Ext.data.proxy.LocalStorage',
	alias: 'proxy.sync',
	
	requires: [
		'Tutti.sync.Conflict'
	],
	
	config: {
		revisionKey: 'revision',
		remoteProxy: null,
		remote: true
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
		
		model.setUseCache(false);
		
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
		this.updateTracking(
			this.getCreatedKey(),
			this.getRemovedKey(),
			operation.getRecords()
		);
		
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
		this.updateTracking(
			this.getRemovedKey(),
			this.getCreatedKey(),
			operation.getRecords()
		);
		
		this.callParent(arguments);
	},
	
	updateTracking: function(addKey, removeKey, records) {
		var add = this.getTracking(addKey);
		var remove = this.getTracking(removeKey);
		
		Ext.Array.forEach(
			records,
			function(record) {
				var id = record.getId();
				
				Ext.Array.include(add, id);
				Ext.Array.remove(remove, id);
			}
		);
		
		this.setTracking(addKey, add);
		this.setTracking(removeKey, remove);
	},
	
	/**
	 * @private
	 * 
	 * @return {String}
	 */
	getMaxRevisionKey: function() {
		return this.getId() + '-revision';
	},
	
	/**
	 * @private
	 * 
	 * @return {String}
	 */
	getCreatedKey: function() {
		return this.getId() + '-created';
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
	 * @return {Number}
	 */
	getMaxRevision: function() {
		var revision = parseInt(
			this.getStorageObject()
				.getItem(this.getMaxRevisionKey())
		);
		
		return isNaN(revision) ? null : revision;
	},
	
	/**
	 * @private
	 * 
	 * @param {Number} revision
	 */
	setMaxRevision: function(revision) {
		var obj = this.getStorageObject();
		var key = this.getMaxRevisionKey();
		
		obj.removeItem(key);
		
		if (revision != null) {
			obj.setItem(key, revision);
		}
	},
	
	/**
	 * @private
	 * 
	 * @param {String} key
	 * 
	 * @return {Number[]}
	 */
	getTracking: function(key) {
		var ids	= (this.getStorageObject().getItem(key) || "").split(",");
		
		if (ids.length == 1 && ids[0] === "") {
			ids = [];
		}
		
		return ids;
	},

	/**
	 * @private
	 * 
	 * @param {String} key
	 * @param {Number[]} ids
	 */
	setTracking: function(key, ids) {
		var obj = this.getStorageObject();
		var str = ids.join(",");
		
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
		
		var maxRevision = Math.max(this.getMaxRevision(), store.max(revisionKey) || null);
		
		// In the event that we deleted the record with the highest revision, it's
		// possible for the stored revision to be greater than the store maximum.
		params[revisionKey] = isNaN(maxRevision) ? 0 : maxRevision;
		
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
		var remoteProxy = this.getRemoteProxy();
		
		var created = this.getTracking(this.getCreatedKey());
		var removed = this.getTracking(this.getRemovedKey());
		
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
				var remoteRevision = remote.get(revisionKey);
				
				var local = store.getById(id);
				
				if (local) {
					existing[id] = true;
					
					var localRevision = local.get(revisionKey);
					
					if (localRevision == null) {
						if (remoteRevision > maxRevision) {
							conflicts.push(
								new Tutti.sync.Conflict({
									local: local,
									remote: remote,
									store: store,
									proxy: remoteProxy
								})
							);
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
						if (remoteRevision > maxRevision) {
							conflicts.push(
								new Tutti.sync.Conflict({
									local: null,
									remote: remote,
									store: store,
									proxy: remoteProxy
								})
							);
						}
						else {
							changes.destroy.push(remote);
						}
					}
					else {
						store.add(remote);
						existing[id] = true;
					}
				}
			}
		);
		
		store.each(function(record) {
			var id = record.getId();
			
			if (!existing[id]) {
				if (record.get(revisionKey) == null) {
					if (Ext.Array.contains(created, id)) {
						changes.create.push(record);
					}
					else {
						conflicts.push(
							new Tutti.sync.Conflict({
								local: record,
								remote: null,
								store: store,
								proxy: remoteProxy
							})
						);
					}
				}
				else {
					store.remove(record);
				}
			}
		});
		
		if (conflicts.length > 0) {
			//<feature logger>
			Ext.Logger.warn("Sync conflict detected", conflicts);
			//</feature>
			
			this.fireEvent('conflict', this, store, conflicts);
		}
		
		if (changes.create.length > 0 || changes.update.length > 0 || changes.destroy.length > 0) {
			//<feature logger>
			Ext.Logger.info(
				"Persisting local changes for store '" + store.getStoreId() + "': "
					+ changes.create.length + " creations, "
					+ changes.update.length + " updates, "
					+ changes.destroy.length + " deletions"
			);
			//</feature>
			
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
		
		var revisionKey = this.getRevisionKey();
		
		this.setTracking(this.getCreatedKey(), []);
		this.setTracking(this.getRemovedKey(), []);
		
		this.clear();
		
		var ids = [];
		var maxRevision = null;
		
		store.each(
			function(record) {
				this.setRecord(record);
				ids.push(record.getId());
				
				var revision = record.get(revisionKey);
				
				if (revision > maxRevision) {
					maxRevision = revision;
				}
			},
			this
		);
		
		this.setIds(ids);
		this.setMaxRevision(maxRevision);
		
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