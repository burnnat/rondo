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
		primaryKey: 'localId'
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
	},
	
	updateForeignKey: function(foreignKey, oldForeignKey) {
		this.updateField(
			this.getAssociatedModel(),
			foreignKey,
			oldForeignKey,
			{
				convert: function(value, record) {
					// Only set the foreign key if it hasn't already been set.
					return record.get(foreignKey) || value;
				}
			}
		);
	}
});