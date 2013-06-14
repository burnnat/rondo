/**
 * 
 */
Ext.define('Tutti.touch.score.Measure', {
	extend: 'Tutti.touch.Block',
	
	uses: [
		'Tutti.touch.score.PartLink',
		'Tutti.touch.score.VoiceLink'
	],
	
	config: {
		measure: null,
		parts: null,
		
		systemStart: false,
		systemEnd: false
	},
	
	initItems: function(items) {
		var parts = this.parts = new Ext.util.MixedCollection();
		
		var me = this;
		var first = me.getSystemStart();
		var last = me.getSystemEnd();
		
		this.getParts().each(function(partData) {
			parts.add(
				partData.getId(),
				new Tutti.touch.score.PartLink({
					block: me,
					data: partData,
					showSignatures: first,
					showEndBarline: last
				})
			);
		});
		
		this.getParts().on({
			updaterecord: function(store, record) {
				var part = parts.getByKey(record.getId());
				part.updatePart.apply(part, arguments);
			},
			scope: this
		});
		
		if (first) {
			// Add initial connector at system start
			items.add(
				new Vex.Flow.StaveConnector(
					parts.first().getFirstStaff().primitive,
					parts.last().getLastStaff().primitive
				)
				.setType(
					Vex.Flow.StaveConnector.type.SINGLE
				)
			);
		}
		
		var voices = this.voices = new Ext.util.MixedCollection();
		
		var measure = this.getMeasure();
		
		var timeObject = Ext.apply(
			{ resolution: Vex.Flow.RESOLUTION },
			measure.getTimeObject()
		);
		
		measure.voices().each(function(voiceData) {
			voices.add(
				voiceData.getId(),
				new Tutti.touch.score.VoiceLink({
					block: me,
					data: voiceData,
					time: timeObject
				})
			);
		});
		
		this.refresh({
			layout: true,
			format: true
		});
	},
	
	onItemAdd: function(index, item) {
		this.callParent(arguments);
		
		if (item.isObservable) {
			item.on('refresh', this.refresh, this);
		}
	},
	
	onItemRemove: function(item) {
		this.callParent(arguments);
		
		if (item.isObservable) {
			item.un('refresh', this.refresh, this);
		}
	},
	
	getStaff: function(staffData) {
		var staff = null;
		
		this.parts.each(function(part) {
			var match = part.getStaff(staffData);
			
			if (match) {
				staff = match;
				return false;
			}
		});
		
		return staff;
	},
	
	refresh: function(stages) {
		if (stages.layout) {
			var parts = this.parts;
			
			var grouped = parts.findBy(
				function(part) {
					return part.hasGroup();
				}
			);
			
			var x = grouped != null ? 15 : 0;
			var y = 0;
			var width = this.getBlockWidth() - x;
			
			parts.each(
				function(part) {
					y = part.updateLayout(x, y, width);
				}
			);
			
			this.height = y;
		}
		
		if (stages.format) {
			var voices = this.voices;
			
			if (voices.getCount() > 0) {
				voices.each(function(voice) {
					voice.updateLayout();
				});
				
				var primitives = Ext.Array.map(
					voices.getRange(),
					function(voice) {
						return voice.voice;
					}
				);
				
				var staff = this.parts.first().getFirstStaff();
				
				new Vex.Flow.Formatter()
					.joinVoices(
						primitives,
						{ align_rests: true }
					)
					.format(
						primitives,
						staff.getNoteEndX() - staff.getNoteStartX() - 10
					);
			}
		}
		
		if (stages.repaint) {
			this.clear();
			this.repaint();
		}
	},
	
	getKeySignature: function() {
		return this.getMeasure().get('key');
	},
	
	getTimeSignature: function() {
		return this.getMeasure().get('time');
	},
	
	getSystemHeight: function() {
		return this.height;
	},
	
	onTap: function(item) {
		this.fireEvent('blocktap', item);
	}
});