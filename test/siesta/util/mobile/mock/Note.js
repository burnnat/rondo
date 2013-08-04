/**
 * 
 */
Ext.define('Test.mock.Note', {
	extend: 'Test.BlockItem',
	
	selectable: false,
	
	config: {
		color: 'gray',
		width: null,
		height: null
	},
	
	constructor: function(config) {
		this.initConfig(config);
	},
	
	getBoundingBox: function() {
		var bounds = this.callParent();
		
		bounds.x = bounds.x - bounds.w / 2;
		
		return bounds;
	},
	
	getHeadWidth: function() {
		return this.getWidth() / 2;
	}
});