/**
 *
 */
Ext.define('Rondo.controller.Sketches', {
	extend: 'Ext.app.Controller',

	requires: [
		'Ext.util.DelayedTask',
		'Tutti.sync.Manager'
	],

	uses: [
		'Rondo.view.sketch.Viewer',
		'Rondo.view.sketch.Editor'
	],

	config: {
		// Auto-sync every two minutes
		syncInterval: 2 * 60 * 1000,

		// Sync one second after local modifications
		writeDelay: 1000,

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
			'menu button[iconCls="refresh"]': {
				tap: 'onRefresh'
			},
			editor: {
				cancel: 'onCancelSketch',
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
				hideOnMaskTap: false,
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

		Tutti.sync.Manager.register(
			Ext.Array.map(
				this.getStores(),
				function(name) {
					return this.getStore(name);
				},
				this
			)
		);

		this.syncTask = new Ext.util.DelayedTask(
			this.performSync,
			this
		);

		this.eachStore(
			function(store) {
				store.on('write', this.onStoreWrite, this);
				store.load();
			}
		);
	},

	eachStore: function(fn) {
		Ext.Array.forEach(
			this.getApplication().getStores(),
			function(store) {
				fn.call(this, store);
			},
			this
		);
	},

	performSync: function() {
		if (!Rondo.User.authenticated) {
			return;
		}

		Tutti.sync.Manager.syncAll(
			function() {
				this.syncTask.delay(
					this.getSyncInterval()
				);
			},
			this
		);
	},

	onStoreWrite: function() {
		this.syncTask.delay(
			this.getWriteDelay()
		);
	},

	onLogin: function() {
		this.syncTask.delay(0);
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
		this.syncTask.delay(0);

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
			this.onAddEditor(editor);
		}
	},

	onAddEditor: Ext.emptyFn,

	onCancelSketch: Ext.emptyFn,

	onSaveSketch: function(editor, sketch) {
		var store = Ext.getStore('sketches');

		store.add(sketch);
		store.sync();

		this.onCancelSketch(editor);
	},

	onViewSketch: function(list, index, target, sketch) {
		this.getMain().push({
			xtype: 'sketchviewer',
			title: sketch.get('title'),
			sketch: sketch
		});
	}
});
