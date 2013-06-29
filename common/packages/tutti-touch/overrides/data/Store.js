/**
 * 
 */
Ext.define('TouchOverrides.data.Store', {
	override: 'Ext.data.Store',
	
	afterCommit: function(record, modifiedFieldNames, modified) {
		var oldId = modified[record.getIdProperty()];
		
		if (oldId && oldId !== record.getId()) {
			var filters = this.getFilters();
			this.clearFilter(true);
			
			this.callParent(arguments);
			
			this.setFilters(filters);
		}
		else {
			this.callParent(arguments);
		}
	},
	
	afterEdit: function(record, modifiedFieldNames, modified) {
		var oldId = modified[record.getIdProperty()];
		
		if (oldId && oldId !== record.getId()) {
			var filters = this.getFilters();
			this.clearFilter(true);
			
			this.callParent(arguments);
			
			this.setFilters(filters);
		}
		else {
			this.callParent(arguments);
		}
	}
})
