/**
 * 
 */
Ext.define('Rondo.login.Button', {
	extend: 'Ext.Component',
	xtype: 'loginbutton',
	
	template: [
		{
			tag: 'button',
			cls: 'zocial',
			reference: 'buttonEl'
		}
	],
	
	names: {
		facebook: 'Facebook',
		google: 'Google',
		twitter: 'Twitter',
		windows: 'Windows Live'
	},
	
	config: {
		type: null
	},
	
	initialize: function() {
		this.buttonEl.on({
			tap: 'onTap',
			scope: this
		});
	},
	
	updateType: function(type, oldType) {
		this.buttonEl.replaceCls(oldType, type);
		this.buttonEl.setHtml(Ext.htmlEncode('Sign in with ' + this.names[type]));
	},
	
	onTap: function(e) {
		this.fireEvent('tap', this, e);
	}
});