/**
 * 
 */
Ext.define('Tutti.score.Panorama', {
	extend: 'Vex.Flow.DocumentFormatter',
	requires: [
		'Vex.Flow.Beam',
		'Tutti.touch.ScoreBlock',
		'Tutti.touch.Tickable'
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
	
	setSelected: function(tickable) {
		this.selectedVoice = tickable && tickable.getVoiceId();
		this.selectedTickable = tickable && tickable.getTickIndex();
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
			
			this.parent.getAt(index).repaint();
			
			index++;
		}
	},
	
	drawBlock: function(index, context) {
		var objects = [];
		this.mappedObjects = objects;
		
		this.callParent([index, context]);
		
		delete this.mappedObjects;
		return objects;
	},
	
	drawPart: function(part, vfStaves, context) {
		var staves = part.getStaves();
		var voices = part.getVoices();
		
		Ext.Array.forEach(
			vfStaves,
			function(stave) {
				stave.setContext(context).draw();
			}
		);
		
		var allVfObjects = [];
		var vfVoices = [];
		var lyricVoices = [];
		
		var selectedVoice = this.selectedVoice;
		var selectedTickable = this.selectedTickable;
		
		Ext.Array.forEach(
			voices,
			function(voice) {
				var voiceId = voice.id;
				
				var result = this.getVexflowVoice(voice, vfStaves);
				Array.prototype.push.apply(allVfObjects, result[1]);
				
				var vfVoice = result[0];
				
				Ext.Array.forEach(
					vfVoice.tickables,
					function(tickable, index) {
						this.mappedObjects.push(
							new Tutti.touch.Tickable({
								voiceId: voiceId,
								tickIndex: index,
								delegate: tickable,
								staff: vfVoice.stave,
								selected: voiceId === selectedVoice && index === selectedTickable
							})
						);
					},
					this
				);
				
				vfVoices.push(vfVoice);
				
				var lyricVoice = result[2];
				
				if (lyricVoice) {
					Ext.Array.forEach(
						vfVoice.tickables,
						function(tickable) {
							tickable.setStave(vfVoice.stave);
						}
					);
					
					vfVoices.push(lyricVoice);
					lyricVoices.push(lyricVoice);
				}
			},
			this
		);
		
		if (vfVoices.length == 0) {
			// If the part has no voices, just return.
			return;
		}
		
		new Vex.Flow.Formatter()
			.joinVoices(vfVoices)
			.format(
				vfVoices,
				vfStaves[0].getNoteEndX() - vfStaves[0].getNoteStartX() - 10
			);
		
		Ext.Array.forEach(
			lyricVoices,
			function(vfVoice) {
				vfVoice.draw(context, vfVoice.stave);
			}
		);
		
		Ext.Array.forEach(
			allVfObjects,
			function(obj) {
				obj.setContext(context).draw();
			}
		);
	},
	
	getVexflowVoice: function() {
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