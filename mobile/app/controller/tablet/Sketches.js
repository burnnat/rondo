/**
 * 
 */
Ext.define('Rondo.controller.tablet.Sketches', {
	extend: 'Rondo.controller.Sketches',
	
	onAddEditor: function(editor) {
		editor.setModal(true);
		editor.setCentered(true);
		editor.setWidth(500);
		
		Ext.Viewport.add(editor);
	},
	
	onCreateSketch: function() {
		this.callParent(arguments);
		this.getEditor().show();
	},
	
	onCancelSketch: function() {
		this.getEditor().hide();
	}
});