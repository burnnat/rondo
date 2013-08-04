/**
 * 
 */
Ext.define('Test.mock.Connector', {
	extend: 'Test.BlockItem',
	
	mixins: {
		active: 'Tutti.touch.Activatable'
	},
	
	isConnector: true,
	
	draw: function(context) {
		context.beginPath();
		
		context.moveTo(0, 0);
		context.lineTo(0, this.parent.getBlockHeight());
		
		context.stroke();
	}
});