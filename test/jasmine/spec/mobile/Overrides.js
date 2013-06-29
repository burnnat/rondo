Ext.require([
	'Ext.data.Store',
	'TouchOverrides.data.Store'
]);

describe("Touch Overrides", function() {
	
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