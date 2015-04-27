/**
 * 
 */
Ext.define('Rondo.profile.Phone', {
	extend: 'Ext.app.Profile',
	
	config: {
		name: 'Phone',
		controllers: ['Sketches']
	},
	
	isActive: function() {
		return Ext.os.is('Phone');
	}
});