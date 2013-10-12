/**
 * 
 */
Ext.define('Rondo.controller.phone.Sketches', {
	extend: 'Rondo.controller.Sketches',
	
	onCreateSketch: function() {
		Ext.Viewport.setActiveItem(this.getEditor());
	},
	
	onCancelSketch: function() {
		Ext.Viewport.setActiveItem(this.getMain());
	}
});