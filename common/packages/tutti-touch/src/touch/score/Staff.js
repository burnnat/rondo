/**
 * 
 */
Ext.define('Tutti.touch.score.Staff', {
	extend: 'Tutti.touch.BlockItem',
	
	mixins: {
		observable: 'Ext.mixin.Observable'
	},
	
	isStaff: true,
	
	precedence: 5,
	selectable: true,
	
	config: {
		part: null,
		data: null,
		
		width: 0,
		
		clef: null,
		key: null,
		time: null,
		
		active: false,
		cursor: 0
	},
	
	constructor: function() {
		var primitive = this.primitive = new Vex.Flow.Stave(0, 0, 0);
		
		// Hide default barlines - we'll draw our own at the part level.
		primitive.modifiers[0].barline = Vex.Flow.Barline.type.NONE;
		primitive.modifiers[1].barline = Vex.Flow.Barline.type.NONE;
		
		this.callParent(arguments);
		
		if (!this.getClef()) {
			this.primitive.clef = this.getData().get('clef');
		}
	},
	
	updateWidth: function(width) {
		this.primitive.setWidth(width);
	},
	
	updateClef: function(clef, previous) {
		if (!clef) {
			return;
		}
		
		var primitive = this.primitive;
		
		if (!previous) {
			primitive.addClef(clef);
			return;
		}
		
		var clefType = Vex.Flow.Clef.types[clef];
		var clefInstance;
		
		Ext.Array.each(
			primitive.modifiers,
			function(modifier) {
				if (modifier instanceof Vex.Flow.Clef) {
					clefInstance = modifier;
					return false;
				}
			}
		);
		
		if (!clefInstance) {
			return;
		}
		
		Ext.Array.each(
			primitive.glyphs,
			function(glyph) {
				if (glyph.code == clefInstance.clef.code && glyph.point == clefInstance.clef.point) {
					glyph.code = clefType.code;
					glyph.point = clefType.point;
					glyph.reset();
					
					clefInstance.placeGlyphOnLine(glyph, primitive, clefType.line);
					
					return false;
				}
			}
		);
		
		clefInstance.clef = clefType;
	},
	
	updateKey: function(key) {
		if (key) {
			this.primitive.addKeySignature(key);
		}
	},
	
	updateTime: function(time) {
		if (time) {
			this.primitive.addTimeSignature(time);
		}
	},
	
	draw: function(context) {
		var primitive = this.primitive;
		
		primitive.setContext(context);
		primitive.draw(context);
		
		this.saveContext(context, ['lineWidth', 'lineCap', 'strokeStyle']);
		
		if (this.getActive()) {
			var box = this.getBoundingBox();
			var cursorX = this.getCursor();
			
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
		}
		
		this.restoreContext(context);
	},
	
	getBoundingBox: function() {
		var primitive = this.primitive;
		
		return {
			x: primitive.x,
			y: primitive.y,
			w: primitive.width,
			h: this.getTotalHeight()
		}
	},
	
	setLayout: function(x, y) {
		var primitive = this.primitive;
		
		// Consider wrapping this into a staff.setX() method?
		primitive.x = x;
		primitive.glyph_start_x = x + 5;
		
		var noteStart = primitive.glyph_start_x;
		
		Ext.Array.forEach(
			primitive.glyphs,
			function(glyph) {
				noteStart += glyph.getMetrics().width;
			}
		);
		
		primitive.setNoteStartX(noteStart);
		primitive.setY(y);
	},
	
	getX: function() {
		return this.primitive.getX();
	},
	
	getWidth: function() {
		return this.primitive.width;
	},
	
	getStaffTop: function() {
		return this.primitive.getYForLine(0);
	},
	
	getStaffBottom: function() {
		var primitive = this.primitive;
		return primitive.getYForLine(primitive.getNumLines() - 1);
	},
	
	getTotalHeight: function() {
		var options = this.primitive.options;
		
		return options.spacing_between_lines_px * (
			options.space_above_staff_ln +
			options.num_lines - 1 + // subtract one to get number of spaces
			options.space_below_staff_ln
		);
	},
	
	updateStaff: function(store, record, newIndex, oldIndex, fieldNames, fieldValues) {
		if (!this.getShowSignatures()) {
			return;
		}
		
		var staff = this.getStaff(record);
		
		if (Ext.Array.contains(fieldNames, 'clef')) {
			var clefType = Vex.Flow.Clef.types[record.get('clef')];
			var clef;
			
			Ext.Array.each(
				staff.modifiers,
				function(modifier) {
					if (modifier instanceof Vex.Flow.Clef) {
						clef = modifier;
						return false;
					}
				}
			);
			
			if (!clef) {
				return;
			}
			
			Ext.Array.each(
				staff.glyphs,
				function(glyph) {
					if (glyph.code == clef.clef.code && glyph.point == clef.clef.point) {
						glyph.code = clefType.code;
						glyph.point = clefType.point;
						glyph.reset();
						clef.placeGlyphOnLine(glyph, staff, clefType.line);
						
						return false;
					}
				}
			);
			
			clef.clef = clefType;
			
			this.getBlock().refresh({
				repaint: true
			});
		}
	},
	
	applyCursor: function(x) {
		var parent = this.parent;
		
		return parent
			? parent.convertPoint(x).x
			: 0;
	},
	
	updateCursor: function() {
		// if the staff is already active, we need to redraw the cursor
		// if not, the cursor is currently hidden and all is well
		if (this.getActive()) {
			this.fireEvent('refresh', { repaint: true });
		}
	},
	
	updateActive: function() {
		this.fireEvent('refresh', { repaint: true });
	}
});