//<debug>
Ext.Loader.setConfig({
	enabled: true,
	disableCaching: false
});
//</debug>

Ext.Loader.setPath({
	'Ext': '/common/touch/src',
	'Ext.ux': '/common/packages/tutti-touch/ux',
	'Tutti': '/common/packages/tutti/src',
	'Tutti.overrides': '/common/packages/tutti/overrides',
	'Tutti.score': '/common/packages/tutti-touch/src/score',
	'Tutti.touch': '/common/packages/tutti-touch/src/touch',
	'Tutti.touch.overrides': '/common/packages/tutti-touch/overrides',
	'Rondo': '/mobile/app'
});

Ext.application({
	name: 'Rondo',
	
	requires: [
		'Ext.Component',
		'Ext.MessageBox',
		'Ext.NavigationView',
		
		'Tutti.overrides.data.StoreManager',
		'Tutti.touch.overrides.data.Store',
		'Tutti.touch.overrides.log.Logger',
		'Tutti.touch.overrides.navigation.Bar',
		
		'Rondo.User',
		'Rondo.login.Toggler'
	],
	
	views: [
		'Sketches'
	],
	
	controllers: [
		'Login',
		'Sketches',
		'Score'
	],
	
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
		//<debug>
		Ext.Logger.setMinPriority('info');
		//</debug>
		
		// Destroy the #appLoadingIndicator element
		Ext.fly('appLoadingIndicator').destroy();
		
		Rondo.User.login();
		
		// Initialize the main view
		Ext.Viewport.add(
			new Ext.NavigationView({
				items: [
					new Rondo.view.Sketches()
				],
				navigationBar: { 
					items: {
						xtype: 'logintoggler',
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
