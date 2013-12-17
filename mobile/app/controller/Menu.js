/**
 * 
 */
Ext.define('Rondo.controller.Menu', {
	extend: 'Ext.app.Controller',
	
	config: {
		control: {
			'navigationview': {
				activeitemchange: 'onNavigate'
			},
			
			'menu button': {
				tap: 'onButtonTap'
			}
		},
		
		refs: {
			menu: 'menu'
		}
	},
	
	init: function() {
		Rondo.User.on({
			login: this.onLogin,
			logout: this.onLogout,
			scope: this
		});
	},
	
	onLogin: function() {
		this.getMenu().setAuthenticated(true);
	},
	
	onLogout: function() {
		this.getMenu().setAuthenticated(false);
	},
	
	onButtonTap: function(button) {
		Ext.Viewport.hideAllMenus();
	},
	
	onNavigate: function(parent, item) {
		this.getMenu().setPage(
			item.isXType('sketchviewer')
				? 'sketch'
				: 'list'
		);
	}
});