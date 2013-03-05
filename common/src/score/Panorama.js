/**
 * 
 */
Ext.define('Tutti.score.Panorama', {
	extend: 'Vex.Flow.DocumentFormatter',
	requires: [
		'Vex.Flow.Beam',
		'Tutti.touch.ScoreBlock'
	],
	
	standardHeight: null,
	standardWidth: 400,
	
	getStartMeasure: function() {
		return this.document.getMeasure(0);
	},
	
	getBlock: function(index) {
		if (index >= this.document.getNumberOfMeasures()) {
			return null;
		}
		
		if (index in this.blockDimensions) {
			return this.blockDimensions[index];
		}
		
		if (this.standardHeight == null) {
			this.standardHeight = 0;
			
			// Update modifiers for first measure
			Ext.Array.forEach(
				this.getStartMeasure().getStaves(),
				function(staff, staffIndex) {
					if (Ext.isString(staff.clef) && !staff.getModifier('clef')) {
						staff.addModifier({
							type: 'clef',
							clef: staff.clef,
							automatic: true
						});
					}
					
					if (Ext.isString(staff.key) && !staff.getModifier('key')) {
						staff.addModifier({
							type: 'key',
							key: staff.key,
							automatic: true
						});
					}
					
					// Time signature on first measure of piece only
					if (!staff.getModifier('time')) {
						if (Ext.isString(staff.time_signature)) {
							staff.addModifier({type: 'time', time: staff.time_signature,automatic:true});
						}
						else if (Ext.isObject(staff.time) && !staff.time.soft) {
							staff.addModifier(
								Ext.apply(
									{
										type: 'time',
										automatic: true
									},
									staff.time
								)
							);
						}
					}
					
					var options = this.getStave(0, staffIndex).options;
					
					this.standardHeight += options.spacing_between_lines_px * (
						options.space_above_staff_ln +
						options.num_lines - 1 + // subtract one to get number of spaces
						options.space_below_staff_ln
					);
				},
				this
			);
		}
		
		this.measuresInBlock[index] = [index];
		
		return [this.standardWidth + (index == 0 ? 100 : 0), this.standardHeight];
	},
	
	getStaveX: function(measure) {
		if (measure == 0) {
			if (!Ext.isDefined(this.startX)) {
				var hasBraces = Ext.Array.some(
					this.getStartMeasure().getParts(),
					function(part) {
						return part.showsBrace();
					}
				);
				
				this.startX = hasBraces ? 15 : 0;
			}
			
			return this.startX;
		}
		else {
			return 0;
		}
	},
	
	getStaveY: function(measure, staff) {
		if (staff == 0) {
			return 0;
		}
		else {
			var higherStave = this.getStave(measure, staff - 1);
			return higherStave.y + higherStave.getHeight();
		}
	},
	
	getStaveWidth: function(measure) {
		return this.getBlock(measure)[0];
	},
	
	draw: function(parent, options) {
		this.parent = parent;
		var items = this.parent.getItems();
		
		var index = 0;
		var dimensions = null;
		
		while (dimensions = this.getBlock(index)) {
			if (index >= items.getCount()) {
				this.parent.add({
					xtype: 'scoreblock',
					formatter: this,
					index: index,
					blockWidth: dimensions[0],
					blockHeight: dimensions[1]
				});
			}
			
			this.drawBlock(index);
			
			index++;
		}
	},
	
	drawBlock: function(index, context) {
		var block = this.parent.getAt(index);
		
		if (!context) {
			context = block.getContext();
		}
		
		this.callParent([index, context]);
	},
	
	drawPart: function() {
		var items = this.callParent(arguments);
		
		
	},
	
	getVexflowVoice: function() {
		console.log(arguments);
		
		var result = this.callParent(arguments);
		
		// Auto-beam each measure.
		Array.prototype.push.apply(
			result[1],
			Vex.Flow.Beam.applyAndGetBeams(result[0])
		);
		
		return result;
	},
	
	getWidth: function() {
		var index = 0;
		var dimensions = null;
		var width = 0;
		
		while (dimensions = this.getBlock(index)) {
			width += dimensions[0];
			index++;
		}
		
		return width;
	}
});