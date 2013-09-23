/**
 * 
 */
Ext.define('Tutti.store.SyncManager', {
	singleton: true,
	
	uses: ['Tutti.proxy.Sync'],
	
	stores: {},
	prereqs: {},
	dependencies: {},
	
	session: null,
	
	/**
	 * 
	 */
	reset: function() {
		Ext.apply(this, {
			stores: {},
			prereqs: {},
			dependencies: {},
			session: null
		});
	},
	
	/**
	 * @param {Ext.data.Store/Ext.data.Store[]} store
	 */
	register: function(store) {
		if (Ext.isArray(store)) {
			Ext.Array.forEach(store, this.register, this);
			return;
		}
		
		var storeId = store.getStoreId();
		var model = store.getModel();
		var modelName = model.getName();
		
		//<feature logger>
		if (!(store.getProxy() instanceof Tutti.proxy.Sync)) {
			Ext.Logger.warn("Store '" + storeId + "' is not configured to use a sync proxy");
		}
		//</feature>
		
		model.getAssociations().each(
			function(association) {
				var associatedName = association.getAssociatedModel().getName();
				
				if (association.getType().toLowerCase() == 'belongsto') {
					this.addDependency(associatedName, modelName);
				}
				else {
					this.addDependency(modelName, associatedName);
				}
			},
			this
		);
		
		this.stores[modelName] = storeId;
		this.prereqs[storeId] = [];
		
		Ext.Object.each(
			this.dependencies,
			function(parent, children) {
				if (parent === modelName) {
					Ext.Array.forEach(
						children,
						function(child) {
							this.addPrereq(modelName, child);
						},
						this
					);
				}
				else if (Ext.Array.contains(children, modelName)) {
					this.addPrereq(parent, modelName);
				}
			},
			this
		);
	},
	
	/**
	 * @protected
	 * 
	 * Adds a dependency such that the stores for the `parent` model
	 * must be synced prior to any stores for the `child` model.
	 * 
	 * @param {String} parent
	 * @param {String} child
	 */
	addDependency: function(parent, child) {
		var deps =  this.dependencies;
		var parentDeps = deps[parent];
		
		if (!parentDeps) {
			parentDeps = deps[parent] = [];
		}
		
		Ext.Array.include(parentDeps, child);
	},
	
	/**
	 * @protected
	 * 
	 * @param {String} parent
	 * @param {String} child
	 */
	addPrereq: function(parent, child) {
		var parentStore = this.stores[parent];
		var childStore = this.stores[child];
		
		if (parentStore && childStore) {
			Ext.Array.include(this.prereqs[childStore], parentStore);
		}
	},
	
	/**
	 * 
	 */
	syncAll: function() {
		if (this.session) {
			return;
		}
		
		this.session = Ext.clone(this.prereqs);
		this.syncNext();
	},
	
	/**
	 * @protected
	 */
	syncNext: function() {
		var me = this;
		
		Ext.Object.each(
			this.session,
			function(storeId, prereqs) {
				if (prereqs.length === 0) {
					var store = Ext.getStore(storeId);
					
					store.getProxy()
						.sync(
							store,
							me.onSyncComplete,
							me
						);
				}
			}
		);
	},
	
	/**
	 * @protected
	 * 
	 * @param {Tutti.proxy.Sync} proxy
	 * @param {Ext.data.Store} store
	 */
	onSyncComplete: function(proxy, store) {
		var storeId = store.getStoreId();
		var session = this.session;
		
		delete session[storeId];
		var empty = true;
		
		Ext.Object.each(
			session,
			function(store, prereqs) {
				empty = false;
				Ext.Array.remove(prereqs, storeId);
			}
		);
		
		if (empty) {
			this.session = null;
		}
		else {
			this.syncNext();
		}
	}
});