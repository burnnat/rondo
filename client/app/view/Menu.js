/**
 * 
 */
Ext.define('Rondo.view.Menu', {
	extend: 'Ext.Menu',
	
	requires: ['Rondo.login.Toggler'],
	
	config: {
		page: 'list',
		
		authenticated: false,
		
		items: [
			{
				xtype: 'container',
				itemId: 'list',
				items: [
					{
						xtype: 'button',
						text: 'Sync',
						iconCls: 'refresh',
						requireAuth: true
					}
				]
			},
			{
				xtype: 'container',
				itemId: 'sketch',
				items: [
					{
						xtype: 'button',
						text: 'Edit',
						iconCls: 'compose'
					},
					{
						xtype: 'button',
						text: 'Export',
						iconCls: 'download',
						requireAuth: true
					},
					{
						xtype: 'button',
						text: 'Delete',
						iconCls: 'delete'
					}
				]
			},
			{
				xtype: 'logintoggler'
			}
		]
	},
	
	updatePage: function(page) {
		Ext.Array.forEach(
			['list', 'sketch'],
			function(item) {
				this.getComponent(item).setHidden(item !== page);
			},
			this
		);
	},
	
	updateAuthenticated: function(authenticated) {
		Ext.Array.forEach(
			this.query('[requireAuth=true]'),
			function(button) {
				button.setHidden(!authenticated);
			}
		);
	}
});