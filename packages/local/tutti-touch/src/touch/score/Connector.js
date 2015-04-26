/**
 * 
 */
Ext.define('Tutti.touch.score.Connector', {
	extend: 'Tutti.touch.BlockItem',
	
	mixins: {
		active: 'Tutti.touch.Activatable'
	},
	
	isConnector: true,
	
	config: {
		topStaff: null,
		bottomStaff: null,
		type: null
	},
	
	constructor: function() {
		this.callParent(arguments);
		
		this.primitive = new Vex.Flow.StaveConnector(
			this.getTopStaff().primitive,
			this.getBottomStaff().primitive
		);
		
		var type = this.getType();
		
		if (type) {
			this.primitive.setType(type);
		}
	},
	
	draw: function(context) {
		var primitive = this.primitive;
		
		primitive.setContext(context);
		primitive.draw(context);
	}
});