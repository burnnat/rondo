/**
 * 
 */
Ext.define('Tutti.sync.Manager', {
	singleton: true,
	
	uses: ['Tutti.proxy.Sync'],
	
	/**
	 * @protected
	 * @property
	 * 
	 * A key-value mapping from model names to their associated store IDs.
	 */
	stores: {},
	
	/**
	 * @protected
	 * @property
	 * 
	 * A key-value mapping of store IDs to an array of prerequisite store IDs, such
	 * that all stores in the value array must be synced prior to the key store.
	 * 
	 * For example:
	 *     {
	 *         // B and C must be synced prior to A
	 *         "A": ["B", "C"],
	 *         // D must be synced prior to B
	 *         "B": ["D"]
	 *     }
	 */
	prereqs: {},
	
	/**
	 * @protected
	 * @property
	 * 
	 * A key-value mapping of parent model names to an array of dependent models,
	 * such that any stores for the parent model must by synced prior to any of
	 * the children in the array.
	 * 
	 * For example:
	 *     {
	 *         // A must be synced prior to B and C
	 *         "A": ["B", "C"],
	 *         // B must be synced prior to D
	 *         "B": ["D"]
	 *     }
	 */
	dependencies: {},
	
	/**
	 * @protected
	 * @property
	 * 
	 * A map in the same format as #prereqs tracking the currently outstanding
	 * prerequisites for syncing each store. If no sync session is currently
	 * underway, the value of `session` will be `null`.
	 */
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
		var session = this.session;
		
		Ext.Object.each(
			session,
			function(storeId, prereqs) {
				if (prereqs.length === 0) {
					delete session[storeId];
					
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