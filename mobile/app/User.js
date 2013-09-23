/**
 * 
 */
Ext.define('Rondo.User', {
	mixins: ['Ext.mixin.Observable'],
	singleton: true,
	
	requires: ['Rondo.user.Model'],
	
	authenticated: false,
	
	login: function(provider, callback, scope) {
		Rondo.user.Model.load(
			{ login: provider },
			{
				success: this.onUserLoad,
				callback: function(user) {
					Ext.callback(callback, scope, [provider, user]);
				},
				scope: this
			}
		);
	},
	
	loginExternal: function(provider) {
		window.location.href = '/auth/' + provider;
	},
	
	logout: function(callback, scope) {
		Rondo.user.Model.load(
			{ logout: true },
			{
				success: this.onUserLoad,
				callback: function(user) {
					Ext.callback(callback, scope, [user]);
				},
				scope: this
			}
		);
	},
	
	onUserLoad: function(user) {
		this.record = user;
		var authenticated = user.get('authenticated');
		
		if (authenticated != this.authenticated) {
			//<debug>
			Ext.Logger.info('User logged ' + (authenticated ? 'in' : 'out'));
			//</debug>
			
			this.authenticated = authenticated;
			this.fireEvent(authenticated ? 'login' : 'logout', user);
		}
	}
})