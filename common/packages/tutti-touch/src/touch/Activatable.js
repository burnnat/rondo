/**
 * 
 */
Ext.define('Tutti.touch.Activatable', {
	extend: 'Ext.mixin.Observable',
	
	mixinConfig: {
		beforeHooks: {
			beforeDraw: 'draw'
		},
		
		hooks: {
			afterDraw: 'draw'
		}
	},
	
	config: {
		active: false,
		activeColor: 'magenta'
	},
	
	beforeDraw: function(context) {
		this.saveContext(context, ['fillStyle', 'strokeStyle']);
		
		if (this.getActive()) {
			var color = this.getActiveColor();
			context.fillStyle = color;
			context.strokeStyle = color;
		}
	},
	
	afterDraw: function(context) {
		this.restoreContext(context);
	},
	
	updateActive: function() {
		this.fireEvent('refresh', { repaint: true });
	}
});