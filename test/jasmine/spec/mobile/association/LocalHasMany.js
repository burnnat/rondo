Ext.require([
	'Ext.data.Model',
	'Ext.data.Store',
	'Tutti.association.LocalHasMany'
]);

describe("Tutti.association.LocalHasMany", function() {
	var FruitClass, DessertClass, fruits, desserts;
	
	beforeEach(function() {
		DessertClass = Ext.define(classname('Dessert'), {
			extend: 'Ext.data.Model',
			
			config: {
				fields: ['id', 'name']
			}
		});
		
		FruitClass = Ext.define(classname('Fruit'), {
			extend: 'Ext.data.Model',
			
			config: {
				fields: ['id', 'name', 'color'],
				
				associations: [
					{
						type: 'localhasmany',
						model: Ext.getClassName(DessertClass),
						name: 'desserts'
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
	
	afterEach(function() {
		fruits.destroy();
		desserts.destroy();
	});
	
	it("should read associated data", function() {
		var matched = fruits.getById('apple').desserts();
		
		expect(matched.getCount()).toEqual(2);
		expect(matched.getById('apple-pie')).not.toBeNull();
		expect(matched.getById('apple-crisp')).not.toBeNull();
		
		matched = fruits.getById('banana').desserts();
		
		expect(matched.getCount()).toEqual(1);
		expect(matched.first().getId()).toBe('banana-pudding');
		
		expect(fruits.getById('cherry').desserts().getCount()).toEqual(0);
	});
	
	it("should allow modified IDs", function() {
		var apple = fruits.getById('apple');
		
		apple.setId('cran-grapple');
		
		var matched = apple.desserts();
		
		expect(matched.getCount()).toEqual(2);
		expect(matched.getById('apple-pie')).not.toBeNull();
		expect(matched.getById('apple-crisp')).not.toBeNull();
	});
});
