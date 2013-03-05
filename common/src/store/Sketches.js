/**
 * 
 */
Ext.define('Tutti.store.Sketches', {
	extend: 'Ext.data.Store',
	
	requires: ['Tutti.model.Sketch'],
	
	config: {
		storeId: 'sketches',
		model: 'Tutti.model.Sketch',
		
		autoLoad: true,
		
		sorters: [{
			property: 'title',
			direction: 'ASC'
		}]
	}
});