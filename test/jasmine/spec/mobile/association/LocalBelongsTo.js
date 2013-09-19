Ext.require([
	'Ext.data.Model',
	'Ext.data.Store',
	'Tutti.association.LocalBelongsTo'
]);

describe("Tutti.association.LocalBelongsTo", function() {
	var FruitClass, DessertClass, fruits, desserts;
	
	var makeClassName = function(name) {
		return 'Test.' + Ext.id(null, 'run') + '.' + name;
	}
	
	beforeEach(function() {
		FruitClass = Ext.define(makeClassName('Fruit'), {
			extend: 'Ext.data.Model',
			
			config: {
				fields: ['id', 'name', 'color']
			}
		});
		
		DessertClass = Ext.define(makeClassName('Dessert'), {
			extend: 'Ext.data.Model',
			
			config: {
				fields: ['id', 'name'],
				
				associations: [
					{
						type: 'localbelongsto',
						model: Ext.getClassName(FruitClass),
						lookupStore: 'fruits'
					}
				]
			}
		});
		
		fruits = new Ext.data.Store({
			storeId: 'fruits',
			model: FruitClass,
			data: [
				{ id: 'apple', name: 'Apple', color: 'red' },
				{ id: 'banana', name: 'Banana', color: 'yellow' },
				{ id: 'cherry', name: 'Cherry', color: 'red' }
			]
		});
		
		desserts = new Ext.data.Store({
			storeId: 'desserts',
			model: DessertClass,
			data: [
				{ id: 'apple-pie', name: 'Apple Pie', fruit_id: 'apple' },
				{ id: 'banana-pudding', name: 'Banana Pudding', fruit_id: 'banana' },
				{ id: 'apple-crisp', name: 'Apple Crisp', fruit_id: 'apple' }
			]
		});
	});
	
	afterEach(function() {
		fruits.destroy();
		desserts.destroy();
	});
	
	var associate = function(dessert, fruit) {
		expect(desserts.getById(dessert).getFruit().getId()).toEqual(fruit);
	};
	
	it("should read associated data", function() {
		associate('apple-pie', 'apple');
		associate('apple-crisp', 'apple');
		associate('banana-pudding', 'banana');
	});
	
	it("should allow modified IDs", function() {
		var apple = fruits.getById('apple');
		
		apple.setId('cran-grapple');
		
		associate('apple-pie', 'cran-grapple');
		associate('apple-crisp', 'cran-grapple');
		associate('banana-pudding', 'banana');
	});
});
