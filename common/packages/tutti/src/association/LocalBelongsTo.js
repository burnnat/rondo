/**
 * 
 */
Ext.define('Tutti.association.LocalBelongsTo', {
	extend: 'Ext.data.association.BelongsTo',
	
	mixins: {
		local: 'Tutti.association.Local'
	},
	
	alias: 'association.localbelongsto',
	
	config: {
		primaryKey: 'id',
		lookupStore: null
	},
	
	constructor: function() {
		this.callParent(arguments);
		this.mixins.local.constructor.apply(this, arguments);
		this.setType('belongsto');
	},
	
	getPrimaryStore: function() {
		return this.getLookupStore();
	},
	
	getForeignStore: function() {
		return Ext.util.Inflector.pluralize(this.getOwnerName().toLowerCase());
	},
	
	updatePrimaryKey: function(primaryKey, oldPrimaryKey) {
		this.updateField(
			this.getAssociatedModel(),
			primaryKey,
			oldPrimaryKey,
			{
				convert: this.convertPrimary
			}
		);
	},
	
	createSetter: function() {
		var orig = this.callParent(arguments);
		var primaryKey = this.getPrimaryKey();
		
		return function(value, options, scope) {
			// Use the primary key rather than getId()
			if (value && value.isModel) {
				value = value.get(primaryKey);
			}
			
			return orig.call(this, value, options, scope);
		};
	},
	
	createGetter: function() {
		var me = this;
		var lookupStore = me.getLookupStore();
		var primaryKey = me.getPrimaryKey();
		var foreignKey = me.getForeignKey();
		var instanceName = me.getInstanceName();
		
		return function(options, scope) {
			options = options || {};
			scope = scope || model;
			
			var model = this;
			var foreignKeyId = model.get(foreignKey);
			var instance = model[instanceName];
			
			if (options.reload === true || instance === undefined) {
				var store = Ext.getStore(lookupStore);
				
				if (!store.isLoaded()) {
					store.load({
						callback: function(records, operation, success) {
							instance = model[instanceName] = store.findRecord(primaryKey, foreignKeyId);
							var args = [instance, operation];
							
							if (success) {
								Ext.callback(options.success, scope, args);
							}
							else {
								Ext.callback(options.failure, scope, args);
							}
							
							Ext.callback(options, scope, args);
							Ext.callback(options.callback, scope, args);
						}
					});
					return instance;
				}
				else {
					instance = model[instanceName] = store.findRecord(primaryKey, foreignKeyId);
				}
			}
			
			if (instance !== undefined) {
				var args = [instance];
				
				Ext.callback(options, scope, args);
				Ext.callback(options.success, scope, args);
				Ext.callback(options.callback, scope, args);
			}
			
			return instance;
		};
	}
});