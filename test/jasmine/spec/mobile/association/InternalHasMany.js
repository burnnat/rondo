Ext.require([
	'Ext.data.Model',
	'Ext.data.proxy.WebStorage',
	'Tutti.association.InternalHasMany'
]);

describe("Tutti.association.InternalHasMany", function() {
	var ProxyClass, FruitClass, DessertClass, storage;
	
	prep(function() {
		storage = {
			data: {},
			
			getItem: function(key) {
				return this.data[key];
			},
			
			setItem: function(key, value) {
				this.data[key] = value;
			},
			
			removeItem: function(key) {
				delete this.data[key];
			}
		};
		
		ProxyClass = Ext.define(classname('Dessert'), {
			extend: 'Ext.data.proxy.WebStorage',
			
			read: function() {
				// Don't retrieve any cached records.
				this.cache = {};
				
				this.callParent(arguments);
			},
			
			getStorageObject: function() {
				return storage;
			}
		});
		
		DessertClass = Ext.define(classname('Dessert'), {
			extend: 'Ext.data.Model',
			
			config: {
				fields: ['id', 'name'],
				useCache: false
			}
		});
		
		FruitClass = Ext.define(classname('Fruit'), {
			extend: 'Ext.data.Model',
			
			config: {
				proxy: new ProxyClass(),
				useCache: false,
				
				fields: ['id', 'name', 'color'],
				
				associations: [
					{
						type: 'internalhasmany',
						model: Ext.getClassName(DessertClass),
						name: 'desserts'
					}
				]
			}
		});
	});
	
	beforeEach(function() {
		storage.data = {};
	});
	
	it("should read associated data", function() {
		var apple = new FruitClass({
			id: 'apple',
			name: 'Apple',
			color: 'red'
		});
		
		apple.desserts().add(
			{ id: 'apple-pie', name: 'Apple Pie' },
			{ id: 'apple-crisp', name: 'Apple Crisp' }
		);
		
		apple.save();
		
		
		// For WebStorage proxies, loading is performed synchronously
		// so we don't need to worry about waiting for this callback.
		var record;
		FruitClass.load(
			apple.getId(),
			{
				callback: function(loaded) {
					record = loaded;
				}
			}
		);
		
		expect(record === apple).toEqual(false);
		expect(record.getData()).toEqual(apple.getData());
		
		var recordDesserts = record.desserts();
		var appleDesserts = apple.desserts();
		
		expect(recordDesserts.getCount()).toEqual(appleDesserts.getCount());
		
		appleDesserts.each(function(appleDessert, index) {
			var recordDessert = recordDesserts.getAt(index);
			
			expect(recordDessert === appleDessert).toEqual(false);
			expect(recordDessert.getData()).toEqual(appleDessert.getData());
		});
	});
});
