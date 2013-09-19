/**
 * 
 */
Ext.define('Tutti.touch.overrides.data.Store', {
	override: 'Ext.data.Store',
	
	afterCommit: function(record, modifiedFieldNames, modified) {
		var oldId = modified[record.getIdProperty()];
		
		if (oldId && oldId !== record.getId()) {
			var data = this.data;
			var filtered = data.filtered;
			
			data.filtered = false;
			this.callParent(arguments);
			data.filtered = filtered;
		}
		else {
			this.callParent(arguments);
		}
	},
	
	afterEdit: function(record, modifiedFieldNames, modified) {
		var oldId = modified[record.getIdProperty()];
		
		if (oldId && oldId !== record.getId()) {
			var data = this.data;
			var filtered = data.filtered;
			
			data.filtered = false;
			this.callParent(arguments);
			data.filtered = filtered;
		}
		else {
			this.callParent(arguments);
		}
	},
	
	sync: function(options) {
		options = options || {};
		
		var me = this,
			operations = {},
			toCreate = me.getNewRecords(),
			toUpdate = me.getUpdatedRecords(),
			toDestroy = me.getRemovedRecords(),
			needsSync = false;

		if (toCreate.length > 0) {
			operations.create = toCreate;
			needsSync = true;
		}

		if (toUpdate.length > 0) {
			operations.update = toUpdate;
			needsSync = true;
		}

		if (toDestroy.length > 0) {
			operations.destroy = toDestroy;
			needsSync = true;
		}

		if (needsSync && me.fireEvent('beforesync', this, operations) !== false) {
			me.getProxy().batch({
				operations: operations,
				listeners: me.getBatchListeners(),
				callback: options.callback,
				scope: options.scope
			});
		}

		return {
			added: toCreate,
			updated: toUpdate,
			removed: toDestroy
		};
	}
})
