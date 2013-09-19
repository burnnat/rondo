/**
 * 
 */
Ext.define('Tutti.association.Local', {
	
	constructor: function() {
		var store = Ext.getStore(this.getPrimaryStore());
		
		if (store) {
			this.registerKeyListener(store);
		}
		else {
			Ext.data.StoreManager.on('register', this.onStoreRegister, this);
		}
		
	},
	
	getPrimaryStore: Ext.emptyFn,
	getForeignStore: Ext.emptyFn,
	
	onStoreRegister: function(stores) {
		var storeId = this.getPrimaryStore();
		
		stores.forEach(
			function(store) {
				if (store.getStoreId() === storeId) {
					this.registerKeyListener(store);
					Ext.data.StoreManager.un('register', this.onStoreRegister, this);
				}
			},
			this
		);
	},
	
	registerKeyListener: function(store) {
		store.on(
			'updaterecord',
			function(store, record, newIndex, oldIndex, modifiedFields, modifiedValues) {
				var key = this.getPrimaryKey();
				
				if (Ext.Array.contains(modifiedFields, key)) {
					this.updateReferences(record, this.getForeignKey(), record.get(key), modifiedValues[key]);
				}
			},
			this
		);
	},
	
	updateReferences: function(record, foreignKey, value, oldValue) {
		Ext.getStore(this.getForeignStore())
			.each(function(reference) {
				if (reference.get(foreignKey) === oldValue) {
					reference.set(foreignKey, value);
				}
			});
	},
	
	updateField: function(model, name, oldName, config) {
		var fields = model.getFields(),
			field = fields.get(name);
		
		if (!field) {
			field = new Ext.data.Field(
				Ext.apply(
					{ name: name },
					config
				)
			);
			fields.add(field);
			fields.isDirty = true;
		}
		
		if (oldName) {
			field = fields.get(oldName);
			if (field) {
				fields.remove(field);
				fields.isDirty = true;
			}
		}
	},
	
	convertPrimary: function(value, record) {
		// Auto-generate an identifier if none is given.
		return Ext.isEmpty(value)
			? record.getIdentifier().generate(record)
			: value;
	}
})