/**
 * 
 */
Ext.define('Tutti.association.InternalHasMany', {
	extend: 'Ext.data.association.HasMany',
	alias: 'association.internalhasmany',
	
	requires: [
		'Tutti.association.InternalField'
	],
	
	constructor: function() {
		this.callParent(arguments);
		this.setType('hasmany');
	},
	
	updateForeignKey: function(foreignKey) {
		this.callParent(arguments);
		
		this.getAssociatedModel()
			.getFields()
			.get(foreignKey)
			.setPersist(false);
	},
	
	updateAssociationKey: function(key, oldKey) {
		var fields = this.getOwnerModel().getFields();
		var field = fields.get(key);
		
		if (!field) {
			field = new Tutti.association.InternalField({
				name: key,
				association: this
			});
			fields.add(field);
			fields.isDirty = true;
		}
		
		if (oldKey) {
			field = fields.get(oldKey);
			
			if (field) {
				fields.remove(field);
				fields.isDirty = true;
			}
		}
	},
	
	applyStore: function(storeConfig) {
		storeConfig = Ext.apply(
			{},
			storeConfig,
			{
				listeners: {
					addrecords: this.onStoreChange,
					removerecords: this.onStoreChange,
					updaterecord: this.onStoreChange,
					scope: this
				}
			}
		);
		
		return this.callParent([storeConfig]);
	},
	
	onStoreChange: function(store) {
		var record = store.boundTo;
		
		record.setDirty();
		record.notifyStores('afterEdit', [this.getAssociationKey()], {})
	},
	
	read: function(record) {
		this.callParent(arguments);
		record.set(this.getAssociationKey(), undefined);
	}
});