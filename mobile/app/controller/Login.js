/**
 * 
 */
Ext.define('Rondo.controller.Login', {
	extend: 'Ext.app.Controller',
	
	requires: [
		'Rondo.User',
		'Rondo.login.Panel'
	],
	
	config: {
		control: {
			'loginpanel button[text="Cancel"]': {
				tap: 'onLoginCancel'
			},
			'logintoggler': {
				tap: 'onLoginToggle'
			},
			'loginbutton': {
				tap: 'onLoginStart'
			}
		}
	},
	
	onLoginToggle: function(button) {
		if (button.getAuthenticated()) {
			Rondo.User.logout();
		}
		else {
			this.returnTo = Ext.Viewport.getActiveItem();
			var panel = this.loginPanel = new Rondo.login.Panel();
			
			Ext.Viewport.add(panel);
			Ext.Viewport.animateActiveItem(
				panel,
				{
					type: 'cover',
					direction: 'down'
				}
			);
		}
	},
	
	onLoginStart: function(button) {
		Ext.Viewport.setMasked({
			xtype: 'loadmask',
			message: 'Logging in...'
		});
		
		Rondo.User.login(
			button.getType(),
			this.onLoginComplete,
			this
		);
	},
	
	onLoginCancel: function() {
		this.closeLoginPanel();
	},
	
	onLoginComplete: function(provider) {
		Ext.Viewport.setMasked(false);
		
		if (Rondo.User.authenticated) {
			this.closeLoginPanel();
		}
		else {
			Rondo.User.loginExternal(provider);
		}
	},
	
	closeLoginPanel: function() {
		Ext.Viewport.animateActiveItem(
			this.returnTo,
			{
				type: 'reveal',
				direction: 'up',
				listeners: {
					animationend: function() {
						this.loginPanel.destroy();
						
						delete this.returnTo;
						delete this.loginPanel;
					},
					scope: this
				}
			}
		);
	}
});