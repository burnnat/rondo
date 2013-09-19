Ext.require([
	'Ext.data.Store',
	'Tutti.overrides.data.StoreManager',
	'Tutti.touch.overrides.data.Store'
]);

describe("Touch Overrides", function() {
	describe("Ext.data.StoreManager", function() {
		it("should fire registered event", function() {
			var storeId = 'test';
			var fired = false;
			
			Ext.data.StoreManager.on(
				'register',
				function(stores) {
					fired = true;
					expect(stores.length).toEqual(1);
					expect(stores[0].getStoreId()).toEqual(storeId);
				},
				null,
				{ single: true }
			);
			
			store = new Ext.data.Store({
				storeId: storeId,
				fields: []
			});
			
			expect(fired).toEqual(true);
		});
	})
	
	describe("Ext.data.Store", function() {
		var store, record;
		
		beforeEach(function() {
			store = new Ext.data.Store({
				fields: ['id', 'fruit', 'dessert']
			});
			
			store.add({ id: 1, fruit: 'apple', dessert: 'pie' });
			store.add({ id: 2, fruit: 'banana', dessert: 'pie' });
			store.add({ id: 3, fruit: 'apple', dessert: 'cobbler' });
			store.add({ id: 4, fruit: 'peach', dessert: 'cobbler' });
			
			record = store.getById(3);
		});
		
		it("should allow edited IDs on filtered stores", function() {
			expect(store.getCount()).toEqual(4);
			
			store.filter('fruit', 'apple');
			expect(store.getCount()).toEqual(2);
			
			record.setId(5);
			expect(store.getCount()).toEqual(2);
		});
		
		it("should allow committed IDs on filtered stores", function() {
			expect(store.getCount()).toEqual(4);
			
			store.filter('fruit', 'apple');
			expect(store.getCount()).toEqual(2);
			
			record.beginEdit();
			record.setId(5);
			record.commit();
			
			expect(store.getCount()).toEqual(2);
		});
	})
	
});