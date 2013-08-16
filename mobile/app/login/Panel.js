/**
 * 
 */
Ext.define('Rondo.login.Panel', {
	extend: 'Ext.Container',
	xtype: 'loginpanel',
	
	requires: [
		'Rondo.login.Button'
	],
	
	config: {
		layout: {
			type: 'vbox',
			align: 'center'
		},
		
		defaultType: 'loginbutton',
		
		defaults: {
			margin: 5
		}
	},
	
	initialize: function() {
		this.add([
			{
				xtype: 'titlebar',
				docked: 'top',
				margin: '0 0 5',
				title: 'Login',
				items: [
					{
						align: 'left',
						text: 'Cancel'
					}
				]
			},
			{
				xtype: 'component',
				html: 'Choose a login provider:'
			},
			{ type: 'google' },
			{ type: 'facebook' },
			{ type: 'twitter' },
			{ type: 'windows' }
		]);
		
		this.callParent();
	}
});