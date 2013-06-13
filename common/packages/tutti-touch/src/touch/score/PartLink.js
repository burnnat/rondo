/**
 * 
 */
Ext.define('Tutti.touch.score.PartLink', {
	
	uses: ['Tutti.touch.score.Barline'],
	
	statics: {
		groupTypes: {
			'single': Vex.Flow.StaveConnector.type.SINGLE,
			'double': Vex.Flow.StaveConnector.type.DOUBLE,
			'brace': Vex.Flow.StaveConnector.type.BRACE,
			'bracket': Vex.Flow.StaveConnector.type.BRACKET
		}
	},
	
	config: {
		block: null,
		data: null,
		showSignatures: false,
		showEndBarline: false
	},
	
	/**
	 * @param {Tutti.model.Voice} data
	 */
	constructor: function(config) {
		this.initConfig(config);
		
		var staves = this.staves = new Ext.util.MixedCollection();
		
		var data = this.getData()
		var store = data.staves();
		
		store.on({
			addrecords: this.addStaves,
			removerecords: this.removeStaves,
			updaterecord: this.updateStaff,
			scope: this
		});
		
		store.each(this.addStaff, this);
		
		// Add barlines through parts
		this.barline = this.addConnector('single');
		
		// Add closing barline if needed
		if (this.getShowEndBarline()) {
			this.getBlock().items.add(
				new Tutti.touch.score.Barline({
					topStaff: staves.first(),
					bottomStaff: staves.last()
				})
			);
		}
		
		// Only add group connectors on system start
		if (this.getShowSignatures()) {
			var group = data.get('group');
			
			if (group) {
				this.group = this.addConnector(group);
			}
		}
	},
	
	addStaff: function(staff, index) {
		var block = this.getBlock();
		var primitive = new Vex.Flow.Stave(0, 0, block.getBlockWidth());
		
		// Hide default barlines - we'll draw our own.
		primitive.modifiers[0].barline = Vex.Flow.Barline.type.NONE;
		primitive.modifiers[1].barline = Vex.Flow.Barline.type.NONE;
		
		if (this.getShowSignatures()) {
			primitive.addClef(staff.get('clef'));
			primitive.addKeySignature(block.getKeySignature());
			primitive.addTimeSignature(block.getTimeSignature());
		}
		
		block.items.add(primitive);
		
		this.staves.insert(
			index,
			staff.getId(),
			primitive
		);
	},
	
	removeStaff: function(staff) {
		var primitive = this.staves.removeAtKey(staff.getId());
		this.getBlock().items.remove(primitive);
	},
	
	getStaff: function(staffData) {
		return this.staves.getByKey(staffData.getId());
	},
	
	getFirstStaff: function() {
		return this.staves.first();
	},
	
	getLastStaff: function() {
		return this.staves.last();
	},
	
	addConnector: function(type) {
		var staves = this.staves;
		
		return this.getBlock()
			.items.add(
				new Vex.Flow.StaveConnector(
					staves.first(),
					staves.last()
				)
				.setType(this.statics().groupTypes[type])
			);
	},
	
	updateLayout: function(x, y) {
		this.staves.each(
			function(staff) {
				// Consider wrapping this into a staff.setX() method?
				staff.x = x;
				staff.glyph_start_x = x + 5;
				
				var noteStart = staff.glyph_start_x;
				
				Ext.Array.forEach(
					staff.glyphs,
					function(glyph) {
						noteStart += glyph.getMetrics().width;
					}
				);
				
				staff.setNoteStartX(noteStart);
				
				staff.setY(y);
				
				var options = staff.options;
				
				y += options.spacing_between_lines_px * (
					options.space_above_staff_ln +
					options.num_lines - 1 + // subtract one to get number of spaces
					options.space_below_staff_ln
				);
			}
		);
		
		return y;
	},
	
	hasGroup: function() {
		return !!this.group;
	},
	
	addStaves: function(store, records) {
		Ext.Array.forEach(
			records,
			function(staff) {
				this.addStaff(staff, store.indexOf(staff));
			},
			this
		);
	},
	
	removeStaves: function(store, records) {
		Ext.Array.forEach(records, this.removeStaff, this);
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
	
	updatePart: function(store, record, newIndex, oldIndex, fieldNames, fieldValues) {
		if (!this.getShowSignatures()) {
			return;
		}
		
		if (Ext.Array.contains(fieldNames, 'group')) {
			var type = record.get('group');
			
			if (type) {
				if (this.group) {
					this.group.setType(this.groupTypes[type]);
				}
				else {
					this.group = this.addConnector(type);
				}
			}
			else if (this.group) {
				this.getBlock().items.remove(this.group);
				this.group = null;
			}
			
			this.getBlock().refresh({
				layout: true,
				repaint: true
			});
		}
	}
});