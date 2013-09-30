Ext.require([
	'Ext.data.identifier.Uuid',
	'Ext.data.Model',
	'Ext.data.Store',
	'Tutti.proxy.Sync'
]);

describe("Tutti.proxy.Sync", function() {
	var ModelClass, ProxyClass;
	var remote;
	var revisionKey = 'version';
	
	prep(function() {
		ProxyClass = Ext.define(classname('Proxy'), {
			extend: 'Ext.data.proxy.Proxy',
			
			read: function(operation, callback, scope) {
				this.operation = operation;
				this.params = operation.getParams();
				this.callback = callback;
				this.scope = scope;
			},
			
			respond: function(response) {
				var operation = this.operation;
				var resultSet = this.getReader().process(response);
				
				if (operation.process(operation.getAction(), resultSet, null, response) === false) {
					this.fireEvent('exception', this, response, operation);
				}
				
				Ext.callback(this.callback, this.scope, [operation]);
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
		
		remote = new ProxyClass();
		
		ModelClass = Ext.define(classname('Model'), {
			extend: 'Ext.data.Model',
			
			config: {
				identifier: 'uuid',
				fields: ['id', 'fruit', 'dessert'],
				
				proxy: {
					type: 'sync',
					revisionKey: revisionKey,
					remoteProxy: remote,
					remote: true
				},
				
				useCache: false
			}
		});
	});
	
	it("should add revision field to models", function() {
		expect(ModelClass.getFields().get(revisionKey)).not.toBeNull();
	});
	
	describe("when requesting latest revisions", function() {
		var store, proxy, spy;
		
		beforeEach(function() {
			store = new Ext.data.Store({
				model: ModelClass,
				autoSync: true
			});
			
			proxy = store.getProxy();
			
			spy = jasmine.createSpy('syncCallback');
		});
		
		it("should handle empty stores", function() {
			proxy.sync(store, spy);
			
			expect(spy).not.toHaveBeenCalled();
			expect(remote.params[revisionKey]).toEqual(null);
			
			remote.respond([]);
			
			expect(spy).toHaveBeenCalled();
		});
		
		it("should handle unversioned stores", function() {
			store.add(
				{
					fruit: 'apple',
					dessert: 'tart'
				},
				{
					fruit: 'banana',
					dessert: 'pudding'
				}
			);
			
			proxy.sync(store, spy);
			
			expect(spy).not.toHaveBeenCalled();
			expect(remote.params[revisionKey]).toEqual(null);
			
			remote.respond([]);
			
			expect(spy).toHaveBeenCalled();
		});
		
		it("should handle versioned stores", function() {
			store.add(
				{
					fruit: 'cherry',
					dessert: 'pie',
					version: 12
				},
				{
					fruit: 'pineapple',
					dessert: 'upside-down cake',
					version: 8
				}
			);
			
			proxy.sync(store, spy);
			
			expect(spy).not.toHaveBeenCalled();
			expect(remote.params[revisionKey]).toEqual(12);
			
			remote.respond([]);
			
			expect(spy).toHaveBeenCalled();
		});
		
		it("should handle mixed stores", function() {
			store.add(
				{
					fruit: 'rasperry',
					dessert: 'ice cream',
					version: 1
				},
				{
					fruit: 'lemon',
					dessert: 'cookies',
					version: 27
				},
				{
					fruit: 'peach',
					dessert: 'smoothie',
					version: null
				}
			);
			
			proxy.sync(store, spy);
			
			expect(spy).not.toHaveBeenCalled();
			expect(remote.params[revisionKey]).toEqual(27);
			
			remote.respond([]);
			
			expect(spy).toHaveBeenCalled();
		});
	});
	
	describe("when parsing sync data", function() {
		var store, proxy, original;
		
		beforeEach(function() {
			store = new Ext.data.Store({
				model: ModelClass,
				
				data: [
					{
						fruit: 'apple',
						dessert: 'tart',
						version: 5
					},
					{
						fruit: 'banana',
						dessert: 'pudding',
						version: 4
					},
					{
						fruit: 'cherry',
						dessert: 'pie',
						version: 3
					}
				],
				
				autoSync: true
			});
			
			original = Ext.Array.map(
				store.getRange(),
				function(record) {
					return record.getData();
				}
			);
			
			proxy = store.getProxy();
			
			Ext.apply(remote, {
				created: [],
				updated: [],
				destroyed: []
			})
		});
		
		it("should handle local creation", function() {
			store.add({
				fruit: 'pineapple',
				dessert: 'upside-down cake'
			});
			
			proxy.sync(store);
			remote.respond(original);
			
			expect(remote.created.length).toEqual(1);
			expect(remote.updated.length).toEqual(0);
			expect(remote.destroyed.length).toEqual(0);
			
			var data = remote.created[0].getData();
			
			expect(data.fruit).toEqual('pineapple');
			expect(data.dessert).toEqual('upside-down cake');
		});
		
		it("should handle local updates", function() {
			store.first().set('dessert', 'crisp');
			
			proxy.sync(store);
			remote.respond(original);
			
			expect(remote.created.length).toEqual(0);
			expect(remote.updated.length).toEqual(1);
			expect(remote.destroyed.length).toEqual(0);
			
			var data = remote.updated[0].getData();
			
			expect(data.id).toEqual(original[0].id);
			expect(data.dessert).toEqual('crisp');
		});
		
		it("should handle local removal", function() {
			store.removeAt(2);
			
			proxy.sync(store);
			remote.respond(original);
			
			expect(remote.created.length).toEqual(0);
			expect(remote.updated.length).toEqual(0);
			expect(remote.destroyed.length).toEqual(1);
			
			var data = remote.destroyed[0].getData();
			
			expect(data.id).toEqual(original[2].id);
		});
	})
});