/**
 * 
 */
Ext.define('Tutti.association.InternalHasMany', {
	extend: 'Ext.data.association.HasMany',
	alias: 'association.internalhasmany',
	
	uses: [
		'Tutti.association.InternalField'
	],
	
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
					addrecords: this.onAddRecords,
					removerecords: this.onRemoveRecords,
					updaterecord: this.onUpdateRecord,
					scope: this
				}
			}
		);
		
		return this.callParent([storeConfig]);
	},
	
	onAddRecords: function(store) {
		this.callParent(arguments);
		store.boundTo.setDirty();
	},
	
	onRemoveRecords: function(store) {
		this.callParent(arguments);
		store.boundTo.setDirty();
	},
	
	onUpdateRecord: function(store) {
		store.boundTo.setDirty();
	},
	
	read: function(record) {
		this.callParent(arguments);
		record.set(this.getAssociationKey(), undefined);
	}
});