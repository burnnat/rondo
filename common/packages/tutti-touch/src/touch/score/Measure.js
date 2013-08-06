/**
 * 
 */
Ext.define('Tutti.touch.score.Measure', {
	extend: 'Tutti.touch.Block',
	
	mixins: {
		refresh: 'Tutti.touch.Refreshable'
	},
	
	uses: [
		'Tutti.touch.score.PartLink',
		'Tutti.touch.score.VoiceLink'
	],
	
	config: {
		data: null,
		parts: null,
		
		systemStart: false,
		systemEnd: false
	},
	
	constructor: function() {
		this.callParent(arguments);
		
		this.performRefresh({
			layout: true,
			format: true
		});
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
					measure: me,
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
		
		if (first && parts.getCount() > 0) {
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
		
		var measureData = this.getData();
		
		this.timeObject = Ext.apply(
			{ resolution: Vex.Flow.RESOLUTION },
			measureData.getResolvedTime()
		);
		
		measureData.voices().each(this.addVoice, this);
		
		measureData.voices().on({
			addrecords: this.addVoices,
			removerecords: this.removeVoices,
			scope: this
		});
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
	
	addVoice: function(voiceData, index) {
		this.voices.insert(
			index,
			voiceData.getId(),
			new Tutti.touch.score.VoiceLink({
				measure: this,
				data: voiceData,
				time: this.timeObject
			})
		);
	},
	
	removeVoice: function(voiceData) {
		this.voices.removeAtKey(voiceData.getId());
	},
	
	addVoices: function(store, records) {
		Ext.Array.forEach(
			records,
			function(voice) {
				this.addVoice(voice, store.indexOf(voice));
			},
			this
		);
	},
	
	removeVoices: function(store, records) {
		Ext.Array.forEach(records, this.removeVoice, this);
	},
	
	performRefresh: function(stages) {
		if (stages.resize) {
			this.setBlockWidth(stages.values.width);
		}
		
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
				
				var staff = this.parts.first().getFirstStaff().primitive;
				
				new Vex.Flow.Formatter()
					.joinVoices(
						primitives,
						{ align_rests: true }
					)
					.format(
						primitives,
						staff.getNoteEndX() - staff.getNoteStartX() - 10
					);
				
				voices.each(function(voice) {
					voice.afterLayout();
				});
			}
		}
		
		if (stages.repaint) {
			this.clear();
			this.repaint();
		}
	},
	
	getKeySignature: function() {
		return this.getData().get('key');
	},
	
	getTimeSignature: function() {
		return this.getData().get('time');
	},
	
	getSystemHeight: function() {
		return this.height;
	},
	
	/**
	 * @param {Tutti.touch.BlockItem} item
	 * @param {Ext.event.Event} event
	 */
	onTouchStart: function(item, event) {
		var x = event.pageX;
		var bounds = this.canvasEl.getPageBox();
		
		var siblings = this.getParent().getItems();
		var index = siblings.indexOf(this);
		
		var target, display;
		
		if (x > bounds.right - 10) {
			target = this;
			
			if (index < siblings.getCount() - 1) {
				display = siblings.getAt(index + 1);
			}
			else {
				display = this;
			}
		}
		else if (x < bounds.left + 10) {
			if (index > 0) {
				target = siblings.getAt(index - 1);
				display = this;
			}
		}
		
		if (target) {
			this.resizeStart = {
				x: x,
				target: target,
				display: display,
				width: target.getBlockWidth(),
				initial: true
			};
		}
	},
	
	/**
	 * @param {Tutti.touch.BlockItem} item
	 * @param {Ext.event.Event} event
	 */
	onTouchMove: function(item, event) {
		var resize = this.resizeStart;
		
		if (resize != null) {
			event.stopPropagation();
			
			var target = resize.target;
			
			if (resize.initial) {
				var display = resize.display;
				var end = (display === target);
				
				display.items.each(function(item) {
				if (end ? item.isBarline : item.isConnector) {
						item.setActive(true);
					}
				});
				
				delete resize.initial;
			}
			
			target.refresh({
				values: {
					width: Math.max(resize.width + (event.pageX - resize.x) / this.getScale(), 0)
				},
				
				resize: true,
				layout: true,
				format: true,
				repaint: true
			});
		}
	},
	
	/**
	 * 
	 */
	onTouchEnd: function() {
		var resize = this.resizeStart;
		
		if (resize && !resize.initial) {
			var display = resize.display;
			var end = (display === resize.target);
			
			display.items.each(function(item) {
				if (end ? item.isBarline : item.isConnector) {
					item.setActive(false);
				}
			});
		}
		
		this.resizeStart = null;
	},
	
	/**
	 * @param {Tutti.touch.BlockItem} item
	 * @param {Ext.event.Event} event
	 */
	onTap: function(item, event) {
		this.fireEvent('blocktap', item, event);
		event.stopEvent();
	}
});