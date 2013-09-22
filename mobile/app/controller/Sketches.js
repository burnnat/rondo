/**
 * 
 */
Ext.define('Rondo.controller.Sketches', {
	extend: 'Ext.app.Controller',
	
	requires: [
		'Tutti.store.SyncManager'
	],
	
	uses: [
		'Rondo.view.sketch.Viewer',
		'Rondo.view.sketch.Editor'
	],
	
	config: {
		stores: [
			'Tutti.store.Sketches',
			'Tutti.store.Parts',
			'Tutti.store.Staves',
			'Tutti.store.Measures',
			'Tutti.store.Voices'
		],
		
		control: {
			list: {
				itemtap: 'onViewSketch'
			},
			add: {
				tap: 'onCreateSketch'
			},
			'sketches button[iconCls="trash"]': {
				tap: 'onDelete'
			},
			'sketches button[iconCls="refresh"]': {
				tap: 'onRefresh'
			},
			editor: {
				save: 'onSaveSketch'
			}
		},
		
		refs: {
			main: 'navigationview',
			list: 'sketches list',
			add: 'sketches button[iconCls="add"]',
			editor: {
				selector: 'sketcheditor',
				xtype: 'sketcheditor',
				autoCreate: true,
				modal: true,
				hideOnMaskTap: false,
				centered: true,
				width: 500,
				scrollable: null
			}
		}
	},
	
	init: function() {
		Rondo.User.on({
			login: this.onLogin,
			logout: this.onLogout,
			scope: this
		});
		
		Tutti.store.SyncManager.register(this.getApplication().getStores());
		
		this.eachStore(
			function(store) {
				store.load();
			}
		);
	},
	
	eachStore: function(fn) {
		Ext.Array.forEach(
			this.getApplication().getStores(),
			function(store) {
				fn.call(this, store);
			}
		);
	},
	
	onLogin: function() {
		Tutti.store.SyncManager.syncAll();
	},
	
	onLogout: function() {
		this.eachStore(
			function(store) {
				
			}
		);
	},
	
	onDelete: function() {
		this.eachStore(
			function(store) {
				store.remove(store.getRange());
				store.sync();
			}
		)
	},
	
	onRefresh: function() {
		this.eachStore(
			function(store) {
				var storeId = store.getStoreId();
				var isVoice = storeId == 'voices';
				
				console.log(store.getStoreId() + ': ' + store.getCount())
				
				var data = [];
				
				store.each(function(item) {
					data.push(item.getData(isVoice));
				});
			}
		)
	},
	
	onCreateSketch: function() {
		var editor = this.getEditor();
		editor.setRecord(new Tutti.model.Sketch());
		
		if (!editor.getParent()) {
			Ext.Viewport.add(editor);
		}
		
		editor.show();
	},
	
	onSaveSketch: function(sketch) {
		var store = Ext.getStore('sketches');
		
		store.add(sketch);
		store.sync();
		/*
		var coordinator = new Tutti.Coordinator({
			callback: function() {
				Ext.getStore('voices').sync();
			},
			taskCount: 2
		});
		
		store.add(sketch);
		store.sync({
			callback: function() {
				Ext.getStore('parts').sync({
					callback: function() {
						Ext.getStore('staves').sync({
							callback: coordinator.getTask()
						});
					}
				});
				
				Ext.getStore('measures').sync({
					callback: coordinator.getTask()
				});
			}
		});
		*/
	},
	
	onViewSketch: function(list, index, target, sketch) {
		this.getMain().push({
			xtype: 'sketchviewer',
			title: sketch.get('title'),
			sketch: sketch
		});
	}
});