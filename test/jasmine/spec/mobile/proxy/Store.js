Ext.require([
	'Ext.data.Model',
	'Ext.data.Store',
	'Tutti.proxy.Store'
]);

describe("Tutti.proxy.Store", function() {
	var store, parent;
	var parentId = 'parent';
	
	prep(function() {
		Ext.define('Test.Model', {
			extend: 'Ext.data.Model',
			
			config: {
				fields: ['id', 'fruit', 'dessert']
			}
		});
		
		parent = new Ext.data.Store({
			storeId: parentId,
			model: Test.Model,
			data: [
				{ fruit: 'apple', dessert: 'pie' },
				{ fruit: 'peach', dessert: 'cobbler' },
				{ fruit: 'apple', dessert: 'cobbler' },
				{ fruit: 'banana', dessert: 'pudding' },
				{ fruit: 'cherry', dessert: 'pie' }
			]
		});
	});
	
	beforeEach(function() {
		store = new Ext.data.Store({
			proxy: {
				type: 'store',
				storeName: parentId
			}
		});
	});
	
	it("should read store data", function() {
		store.load();
		
		expect(store.getCount()).toEqual(parent.getCount());
		
		parent.each(function(record) {
			expect(store.getById(record.getId())).not.toBeNull();
		});
	});
	
	it("should read filtered data", function() {
		store.filter('dessert', 'pie');
		store.load();
		
		expect(store.getCount()).toEqual(2);
		
		parent.each(function(record) {
			var found = store.getById(record.getId());
			
			if (record.get('dessert') === 'pie') {
				expect(found).not.toBeNull();
			}
			else {
				expect(found).toBeNull();
			}
		});
	});
});
