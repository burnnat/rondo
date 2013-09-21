/**
 * 
 */
Ext.define('Tutti.association.InternalField', {
	extend: 'Ext.data.Field',
	
	config: {
		association: null
	},
	
	constructor: function() {
		this.callParent(arguments);
		
		this.setEncode(
			Ext.bind(this.encode, this)
		);
	},
	
	encode: function(value, record) {
		var data = [];
		
		record[this.getAssociation().getStoreName()].each(function(child) {
			var item = {};
			
			child.fields.each(function(field) {
				if (field.getPersist()) {
					name = field.getName();
					item[name] = child.get(name);
				}
			});
			
			data.push(item);
		});
		
		return data;
	}
});