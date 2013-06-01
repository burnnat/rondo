/**
 * 
 */
Ext.define('Tutti.store.Parts', {
	extend: 'Ext.data.Store',
	
	requires: ['Tutti.model.Part'],
	
	config: {
		storeId: 'parts',
		model: 'Tutti.model.Part',
		
		autoLoad: true
	}
});