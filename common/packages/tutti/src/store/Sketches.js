/**
 * 
 */
Ext.define('Tutti.store.Sketches', {
	extend: 'Ext.data.Store',
	
	requires: ['Tutti.model.Sketch'],
	
	config: {
		storeId: 'sketches',
		model: 'Tutti.model.Sketch',
		
		autoSync: true,
		
		sorters: [{
			property: 'title',
			direction: 'ASC'
		}]
	}
});