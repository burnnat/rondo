/**
 * 
 */
Ext.define('Rondo.profile.Tablet', {
	extend: 'Ext.app.Profile',
	
	config: {
		name: 'Tablet',
		controllers: ['Sketches']
	},
	
	isActive: function() {
		return !Ext.os.is('Phone');
	}
});