/**
 * 
 */
Ext.define('Tutti.store.Measures', {
	extend: 'Ext.data.Store',
	
	requires: ['Tutti.model.Measure'],
	
	config: {
		storeId: 'measures',
		model: 'Tutti.model.Measure',
		
		autoSync: true
	}
});