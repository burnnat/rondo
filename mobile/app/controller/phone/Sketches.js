/**
 * 
 */
Ext.define('Rondo.controller.phone.Sketches', {
	extend: 'Rondo.controller.Sketches',
	
	onCreateSketch: function() {
		this.callParent(arguments);
		Ext.Viewport.setActiveItem(this.getEditor());
	},
	
	onCancelSketch: function() {
		Ext.Viewport.setActiveItem(this.getMain());
	}
});