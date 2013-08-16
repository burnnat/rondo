/**
 * 
 */
Ext.define('Rondo.controller.Login', {
	extend: 'Ext.app.Controller',
	
	requires: [
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
			this.getApplication().fireEvent('logout');
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
		if (button.getType() == 'google') {
			// do google login
		}
		else if (button.getType() == 'facebook') {
			// do facebook login
		}
		else if (button.getType() == 'windows') {
			// do windows live login
		}
		
		// just hook directly until the login backend is in place
		this.onLoginComplete();
	},
	
	onLoginCancel: function() {
		this.closeLoginPanel();
	},
	
	onLoginComplete: function() {
		this.closeLoginPanel();
		this.getApplication().fireEvent('login');
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