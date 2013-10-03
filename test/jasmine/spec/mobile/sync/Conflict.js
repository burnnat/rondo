Ext.require([
	'Ext.data.Model',
	'Tutti.sync.Conflict'
]);

describe("Tutti.sync.Conflict", function() {
	var ModelClass, ProxyClass;
	var proxy, store;
	
	prep(function() {
		ModelClass = Ext.define(classname('Model'), {
			extend: 'Ext.data.Model',
			
			config: {
				fields: ['id', 'fruit', 'dessert']
			}
		});
		
		ProxyClass = Ext.define(classname('Proxy'), {
			extend: 'Ext.data.proxy.Proxy',
			
			reset: function() {
				Ext.apply(this, {
					created: [],
					updated: [],
					destroyed: []
				});
			},
			
			create: function(operation, callback, scope) {
				this.created = operation.getRecords();
				Ext.callback(callback, scope, [operation]);
			},
			
			update: function(operation, callback, scope) {
				this.updated = operation.getRecords();
				Ext.callback(callback, scope, [operation]);
			},
			
			destroy: function(operation, callback, scope) {
				this.destroyed = operation.getRecords();
				Ext.callback(callback, scope, [operation]);
			}
		});
		
		proxy = new ProxyClass({
			model: ModelClass
		});
		
		store = new Ext.data.Store({
			model: ModelClass
		});
	});
	
	beforeEach(function() {
		store.removeAll();
		proxy.reset();
	});
	
	it("should allow local creation", function() {
		var data = {
			id: 1,
			fruit: 'apple',
			dessert: 'pie'
		};
		
		var conflict = new Tutti.sync.Conflict({
			local: null,
			remote: new ModelClass(data),
			proxy: proxy,
			store: store
		});
		
		conflict.useRemote();
		
		expect(store.getCount()).toEqual(1);
		expect(store.first().getData()).toEqual(data);
		
		expect(proxy.created.length).toEqual(0);
		expect(proxy.updated.length).toEqual(0);
		expect(proxy.destroyed.length).toEqual(0);
	});
	
	it("should allow local updates", function() {
		var data = {
			id: 1,
			fruit: 'apple',
			dessert: 'pie'
		};
		
		var local = store.add(data);
		
		var conflict = new Tutti.sync.Conflict({
			local: local[0],
			remote: new ModelClass(
				Ext.apply(data, { dessert: 'crisp' })
			),
			proxy: proxy,
			store: store
		});
		
		conflict.useRemote();
		
		expect(store.getCount()).toEqual(1);
		expect(store.first().get('dessert')).toEqual('crisp');
		
		expect(proxy.created.length).toEqual(0);
		expect(proxy.updated.length).toEqual(0);
		expect(proxy.destroyed.length).toEqual(0);
	});
	
	it("should allow local removal", function() {
		var local = store.add({
			id: 1,
			fruit: 'apple',
			dessert: 'pie'
		});
		
		var conflict = new Tutti.sync.Conflict({
			local: local[0],
			remote: null,
			proxy: proxy,
			store: store
		});
		
		conflict.useRemote();
		
		expect(store.getCount()).toEqual(0);
		
		expect(proxy.created.length).toEqual(0);
		expect(proxy.updated.length).toEqual(0);
		expect(proxy.destroyed.length).toEqual(0);
	});
	
	it("should allow remote creation", function() {
		var data = {
			id: 1,
			fruit: 'apple',
			dessert: 'pie'
		};
		
		var local = store.add(data);
		
		var conflict = new Tutti.sync.Conflict({
			local: local[0],
			remote: null,
			proxy: proxy,
			store: store
		});
		
		conflict.useLocal();
		
		expect(store.getCount()).toEqual(1);
		
		expect(proxy.created.length).toEqual(1);
		expect(proxy.updated.length).toEqual(0);
		expect(proxy.destroyed.length).toEqual(0);
		
		expect(proxy.created[0].getData()).toEqual(data);
	});
	
	it("should allow remote updates", function() {
		var data = {
			id: 1,
			fruit: 'apple',
			dessert: 'pie'
		};
		
		var local = store.add(data);
		
		var conflict = new Tutti.sync.Conflict({
			local: local[0],
			remote: new ModelClass(
				Ext.apply(data, { dessert: 'crisp' })
			),
			proxy: proxy,
			store: store
		});
		
		conflict.useLocal();
		
		expect(store.getCount()).toEqual(1);
		
		expect(proxy.created.length).toEqual(0);
		expect(proxy.updated.length).toEqual(1);
		expect(proxy.destroyed.length).toEqual(0);
		
		expect(proxy.updated[0].getData()).toEqual(data);
	});
	
	it("should allow remote removal", function() {
		var data = {
			id: 1,
			fruit: 'apple',
			dessert: 'pie'
		};
		
		var conflict = new Tutti.sync.Conflict({
			local: null,
			remote: new ModelClass(data),
			proxy: proxy,
			store: store
		});
		
		conflict.useLocal();
		
		expect(store.getCount()).toEqual(0);
		
		expect(proxy.created.length).toEqual(0);
		expect(proxy.updated.length).toEqual(0);
		expect(proxy.destroyed.length).toEqual(1);
		
		expect(proxy.destroyed[0].getId()).toEqual(data.id);
	});
});
