/**
 * 
 */
Ext.define('Rondo.login.Toggler', {
	extend: 'Ext.Button',
	xtype: 'logintoggler',
	
	requires: ['Rondo.User'],
	
	config: {
		authenticated: false
	},
	
	initialize: function() {
		Rondo.User.on({
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