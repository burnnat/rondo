/**
 * 
 */
Ext.define('Tutti.store.Staves', {
	extend: 'Ext.data.Store',
	
	requires: ['Tutti.model.Staff'],
	
	config: {
		storeId: 'staves',
		model: 'Tutti.model.Staff',
		
		autoSync: true
	}
});