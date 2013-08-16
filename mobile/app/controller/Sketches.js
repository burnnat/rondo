/**
 * 
 */
Ext.define('Rondo.controller.Sketches', {
	extend: 'Ext.app.Controller',
	
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
		this.getApplication().on({
			login: this.onLogin,
			logout: this.onLogout,
			scope: this
		});
	},
	
	eachStore: function(fn) {
		Ext.Array.forEach(
			[
				'sketches',
				'parts',
				'staves',
				'measures',
				'voices'
			],
			function(name) {
				fn.call(this, Ext.getStore(name));
			}
		);
	},
	
	onLogin: function() {
		this.eachStore(
			function(store) {
//				store.setAutoSync(true);
				store.sync();
			}
		);
	},
	
	onLogout: function() {
		this.eachStore(
			function(store) {
//				store.setAutoSync(false);
//				store.getProxy().clear();
				store.load();
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
				console.log(store.getStoreId() + ': ' + store.getCount())
				
				var localIds = [];
				
				store.each(function(item) {
					localIds.push(item.get('localId'));
				});
				
				console.log('[' + localIds.join(', ') + ']');
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
	},
	
	onViewSketch: function(list, index, target, sketch) {
		this.getMain().push({
			xtype: 'sketchviewer',
			title: sketch.get('title'),
			sketch: sketch
		});
	}
});