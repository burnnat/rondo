/**
 * 
 */
Ext.define('Tutti.association.Local', {
	
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