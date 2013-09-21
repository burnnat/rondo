/**
 * 
 */
Ext.define('Tutti.writer.Association', {
	extend: 'Ext.data.writer.Json',
	alias: 'writer.association',
	
	getRecordData: function(record, skip) {
		var data = this.callParent(arguments);
		
		record.associations.each(
			function(association) {
				if (association == skip) {
					return;
				}
				
				var subdata;
				var foreignKey = association.getForeignKey();
				var inverse = association.getInverseAssociation();
				
				if (association.getType().toLowerCase() == 'hasmany') {
					subdata = [];
					
					record[association.getStoreName()].each(
						function(subrecord) {
							var item = this.getRecordData(subrecord, inverse);
							delete item[foreignKey];
							
							subdata.push(item);
						},
						this
					);
				}
				else {
					subdata = this.getRecordData(record[association.getInstanceName()], inverse);
					delete data[foreignKey];
				}
				
				data[association.getAssociationKey()] = subdata;
			},
			this
		);
		
		return data;
	}
});