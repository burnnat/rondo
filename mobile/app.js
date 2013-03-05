//<debug>
Ext.Loader.setConfig({
	enabled: true,
	disableCaching: false
});

Ext.namespace('Tutti').offline = true;

Ext.Loader.setPath({
	'Ext': '../common/touch/src',
	'Ext.io': '../common/senchaio/src/io',
	'Ext.cf': '../common/senchaio/src/cf',
	'Ext.ux': '../common/ux',
	'Tutti': '../common/src',
	'Rondo': 'app'
});
//</debug>

Ext.application({
	name: 'Rondo',
	
	requires: [
		'Ext.MessageBox',
		'Ext.NavigationView',
		'Ext.io.ux.AuthButton'
	],
	
	views: [
		'Sketches'
	],
	
	controllers: [
		'Ext.io.Controller',
		'Sketches',
		'Score'
	],
	
	io: {
		appId: "681c6bef-6a59-42ee-8f88-594b57ffecf6"
	},
	
	icon: {
		'57': 'resources/icons/Icon.png',
		'72': 'resources/icons/Icon~ipad.png',
		'114': 'resources/icons/Icon@2x.png',
		'144': 'resources/icons/Icon~ipad@2x.png'
	},
	
	isIconPrecomposed: true,
	
	startupImage: {
		'320x460': 'resources/startup/320x460.jpg',
		'640x920': 'resources/startup/640x920.png',
		'768x1004': 'resources/startup/768x1004.png',
		'748x1024': 'resources/startup/748x1024.png',
		'1536x2008': 'resources/startup/1536x2008.png',
		'1496x2048': 'resources/startup/1496x2048.png'
	},
	
	launch: function() {
		// Destroy the #appLoadingIndicator element
		Ext.fly('appLoadingIndicator').destroy();
		
		// Initialize the main view
		Ext.Viewport.add(
			new Ext.NavigationView({
				items: [
					new Rondo.view.Sketches()
				],
				navigationBar: { 
					items: {
						xtype: 'sioAuthButton',
						align: 'right'
					}
				}
			})
		);
	},
	
	onUpdated: function() {
		Ext.Msg.confirm(
			"Application Update",
			"This application has just successfully been updated to the latest version. Reload now?",
			function(buttonId) {
				if (buttonId === 'yes') {
					window.location.reload();
				}
			}
		);
	}
});
