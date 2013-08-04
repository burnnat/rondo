/**
 * 
 */
Ext.define('Test.mock.Barline', {
	extend: 'Test.BlockItem',
	
	mixins: {
		active: 'Tutti.touch.Activatable'
	},
	
	isBarline: true,
	
	draw: function(context) {
		var x = this.parent.getBlockWidth() - 1;
		var height = this.parent.getBlockHeight();
		
		context.fillRect(x - 5, 0, 1, height);
		context.fillRect(x - 2, 0, 3, height);
	}
});