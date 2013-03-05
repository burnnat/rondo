/**
 * 
 */
Ext.define('Tutti.store.Voices', {
	extend: 'Ext.data.Store',
	
	requires: ['Tutti.model.Voice'],
	
	config: {
		storeId: 'voices',
		model: 'Tutti.model.Voice',
		
		autoLoad: true
	}
});