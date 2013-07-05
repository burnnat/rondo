/**
 * 
 */
Ext.define('Tutti.touch.score.Cursor', {
	extend: 'Tutti.touch.BlockItem',
	
	mixins: {
		observable: 'Ext.mixin.Observable'
	},
	
	isCursor: true,
	
	precedence: 5,
	selectable: true,
	
	config: {
		active: false,
		position: 0
	},
	
	constructor: function(staff) {
		this.staff = staff;
	},
	
	draw: function(context) {
		if (!this.getActive()) {
			return;
		}
		
		this.saveContext(context, ['lineWidth', 'lineCap', 'strokeStyle']);
		
		var box = this.getBoundingBox();
		var cursorX = this.getPosition();
		
		context.lineWidth = 2;
		context.lineCap = 'round';
		context.strokeStyle = 'magenta';
		
		context.beginPath();
		
		var tip = 4;
		
		var topY = box.y + tip + 1;
		var bottomY = box.y + box.h - tip - 1;
		
		context.moveTo(cursorX - tip, topY - tip);
		context.lineTo(cursorX, topY);
		context.lineTo(cursorX + tip, topY - tip);
		
		context.moveTo(cursorX, topY);
		context.lineTo(cursorX, bottomY);
		
		context.moveTo(cursorX - tip, bottomY + tip);
		context.lineTo(cursorX, bottomY);
		context.lineTo(cursorX + tip, bottomY + tip);
		
		context.stroke();
		
		this.restoreContext(context);
	},
	
	getBoundingBox: function() {
		var staff = this.staff;
		
		return {
			x: staff.getX(),
			y: staff.getY(),
			w: staff.getWidth(),
			h: staff.getTotalHeight()
		}
	},
	
	applyPosition: function(x) {
		var parent = this.parent;
		
		if (!parent) {
			return;
		}
		
		return parent.convertPoint(x).x;
	},
	
	updatePosition: function() {
		// if the cursor is already active, we need to redraw
		// if not, we are currently hidden and all is well
		if (this.getActive()) {
			this.fireEvent('refresh', { repaint: true });
		}
	},
	
	updateActive: function() {
		this.fireEvent('refresh', { repaint: true });
	}
});