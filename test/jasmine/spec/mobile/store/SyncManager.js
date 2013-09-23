Ext.require([
	'Ext.data.association.HasOne',
	'Ext.data.association.HasMany',
	'Ext.data.association.BelongsTo',
	'Ext.data.Model',
	'Ext.data.Store',
	'Tutti.proxy.Sync',
	'Tutti.store.SyncManager'
]);

describe("Tutti.store.SyncManager", function() {
	var Proxy, RootModel, HasOneModel, HasManyModel, BelongsToModel;
	var syncOrder = [];
	
	prep(function() {
		Proxy = Ext.define(classname('Proxy'), {
			extend: 'Tutti.proxy.Sync',
			
			sync: function(store, callback, scope) {
				syncOrder.push(store.getStoreId());
				Ext.callback(callback, scope, [this, store]);
			}
		});
		
		/**
		 *    Associations Dependency Diagram
		 *    ===============================
		 * 
		 *      +-------+ RootModel +------+
		 *      |             +            |
		 *      |             |            |
		 *      v             |            v
		 * HasManyModel <-----|----+ BelongsToModel
		 *      +             |             
		 *      |             |             
		 *      |             v             
		 *      +------> HasOneModel        
		 */
		
		HasOneModel = Ext.define(classname('HasOneModel'), {
			extend: 'Ext.data.Model',
			
			config: {
				fields: ['id'],
				proxy: new Proxy()
			}
		});
		
		HasManyModel = Ext.define(classname('HasManyModel'), {
			extend: 'Ext.data.Model',
			
			config: {
				fields: ['id'],
				proxy: new Proxy(),
				
				associations: [
					{
						type: 'hasone',
						model: Ext.getClassName(HasOneModel)
					}
				]
			}
		});
		
		RootModel = Ext.define(classname('Model'), {
			extend: 'Ext.data.Model',
			
			config: {
				fields: ['id'],
				proxy: new Proxy(),
				
				associations: [
					{
						type: 'hasone',
						model: Ext.getClassName(HasOneModel)
					},
					{
						type: 'hasmany',
						model: Ext.getClassName(HasManyModel)
					}
				]
			}
		});
		
		BelongsToModel = Ext.define(classname('BelongsToModel'), {
			extend: 'Ext.data.Model',
			
			config: {
				fields: ['id'],
				proxy: new Proxy(),
				
				associations: [
					{
						type: 'belongsto',
						model: Ext.getClassName(RootModel)
					},
					{
						type: 'hasmany',
						model: Ext.getClassName(HasManyModel)
					}
				]
			}
		});
		
		new Ext.data.Store({
			storeId: 'hasone',
			model: HasOneModel
		});
		
		new Ext.data.Store({
			storeId: 'hasmany',
			model: HasManyModel
		});
		
		new Ext.data.Store({
			storeId: 'root',
			model: RootModel
		});
		
		new Ext.data.Store({
			storeId: 'belongsto',
			model: BelongsToModel
		});
	});
	
	beforeEach(function() {
		Tutti.store.SyncManager.reset();
		syncOrder = [];
	});
	
	it("should handle hasOne assocations", function() {
		Tutti.store.SyncManager.register([
			Ext.getStore('hasone'),
			Ext.getStore('root')
		]);
		
		Tutti.store.SyncManager.syncAll();
		
		expect(syncOrder).toEqual(['root', 'hasone']);
	});
	
	it("should handle hasMany assocations", function() {
		Tutti.store.SyncManager.register([
			Ext.getStore('root'),
			Ext.getStore('hasmany')
		]);
		
		Tutti.store.SyncManager.syncAll();
		
		expect(syncOrder).toEqual(['root', 'hasmany']);
	});
	
	it("should handle belongsTo assocations", function() {
		Tutti.store.SyncManager.register([
			Ext.getStore('belongsto'),
			Ext.getStore('root')
		]);
		
		Tutti.store.SyncManager.syncAll();
		
		expect(syncOrder).toEqual(['root', 'belongsto']);
	});
	
	it("should handle nested assocations", function() {
		Tutti.store.SyncManager.register([
			Ext.getStore('belongsto'),
			Ext.getStore('hasmany'),
			Ext.getStore('hasone'),
			Ext.getStore('root')
		]);
		
		Tutti.store.SyncManager.syncAll();
		
		expect(syncOrder).toEqual([
			'root',
			'belongsto',
			'hasmany',
			'hasone'
		]);
	});
});
