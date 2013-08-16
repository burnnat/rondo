/**
 * 
 */
Ext.define('Rondo.login.Toggler', {
	extend: 'Ext.Button',
	xtype: 'logintoggler',
	
	config: {
		authenticated: false
	},
	
	initialize: function() {
		Rondo.app.on({
			login: function() {
				this.setAuthenticated(true);
			},
			logout: function() {
				this.setAuthenticated(false);
			},
			scope: this
		});
		
		this.callParent();
	},
	
	updateAuthenticated: function(authenticated) {
		this.setText(authenticated ? 'Logout' : 'Login');
	}
});