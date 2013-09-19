/**
 * 
 */
Ext.define('Tutti.association.LocalHasMany', {
	extend: 'Ext.data.association.HasMany',
	
	mixins: {
		local: 'Tutti.association.Local'
	},
	
	alias: 'association.localhasmany',
	
	requires: ['Tutti.proxy.Store'],
	
	config: {
		autoLoad: true,
//		autoSync: true,
		primaryKey: 'id'
	},
	
	constructor: function() {
		this.callParent(arguments);
		this.mixins.local.constructor.apply(this, arguments);
	},
	
	getPrimaryStore: function() {
		return Ext.util.Inflector.pluralize(this.getOwnerName().toLowerCase());
	},
	
	getForeignStore: function() {
		return this.getName();
	},
	
	updateReferences: function(record, foreignKey, value) {
		this.mixins.local.updateReferences.apply(this, arguments);
		
		var store = record[this.getStoreName()];
		
		if (store) {
			store.filter({
				property: foreignKey,
				value: value,
				exactMatch: true
			});
		}
	},
	
	onAddRecords: function(store, records) {
		var ln = records.length,
			id = store.boundTo.get(this.getPrimaryKey()),
			i, record;
		
		for (i = 0; i < ln; i++) {
			record = records[i];
			record.set(this.getForeignKey(), id);
		}
		this.updateInverseInstances(store.boundTo);
	},
	
	applyStore: function(storeConfig) {
		var me = this;
		
		storeConfig = Ext.apply(
			{},
			storeConfig,
			{
//				remoteFilter: false
				proxy: {
					type: 'store',
					storeName: this.getName()
				}
			}
		);
		
		return me.callParent([storeConfig]);
	},
	
	updatePrimaryKey: function(primaryKey, oldPrimaryKey) {
		this.updateField(
			this.getOwnerModel(),
			primaryKey,
			oldPrimaryKey,
			{
				convert: this.convertPrimary
			}
		);
	}
});