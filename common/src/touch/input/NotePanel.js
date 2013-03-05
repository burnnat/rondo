/**
 * 
 */
Ext.define('Tutti.touch.input.NotePanel', {
	extend: 'Ext.Panel',
	
	requires: ['Ext.SegmentedButton'],
	
	durations: ['16', '8', 'q', 'h', 'w'],
	
	icons: {
		'16': 'note-sixteenth',
		'8': 'note-eighth',
		'q': 'note-quarter',
		'h': 'note-half',
		'w': 'note-whole'
	},
	
	config: {
		duration: 'q'
	},
	
	initialize: function() {
		this.callParent();
		
		this.add([
			this.initDurationBar(),
			{
				xtype: 'button',
				ui: 'confirm',
				text: 'Add',
				margin: 10,
				handler: this.onCreate,
				scope: this
			}
		]);
		
	},
	
	applyDuration: function(duration) {
		if (Ext.isString(duration)) {
			return Vex.Flow.parseNoteDurationString(duration);
		}
		
		return duration;
	},
	
	updateDuration: function(duration) {
		if (this.durationBtn) {
			this.durationBtn.setPressedButtons([duration.duration]);
		}
		
		if (this.dotBtn) {
			this.dotBtn.setPressedButtons(duration.dots > 0 ? [0] : []);
		}
	},
	
	getDurationString: function() {
		var duration = this.getDuration();
		return duration.duration + Ext.String.repeat('d', duration.dots);
	},
	
	initDurationBar: function() {
		var durations = [];
		var icons = this.icons;
		var active = this.getDuration().duration;
		
		Ext.Array.forEach(
			this.durations,
			function(val) {
				durations.push({
					itemId: val,
					iconCls: icons[val],
					iconMask: true,
					pressed: val === active
				});
			}
		);
		
		this.durationBtn = new Ext.SegmentedButton({
			items: durations,
			listeners: {
				toggle: this.onDurationToggle,
				scope: this
			}
		});
		
		this.dotBtn = new Ext.SegmentedButton({
			allowMultiple: true,
			items: { text: '&middot;' },
			listeners: {
				toggle: this.onDotToggle,
				scope: this
			}
		})
		
		return {
			xtype: 'toolbar',
			items: [
				this.durationBtn,
				{
					xtype: 'spacer',
					width: 5
				},
				this.dotBtn
			]
		};
	},
	
	onDurationToggle: function(seg, button, pressed) {
		if (pressed) {
			this.getDuration().duration = button.getItemId();
		}
	},
	
	onDotToggle: function(seg, button, pressed) {
		this.getDuration().dots = pressed ? 1 : 0;
	},
	
	onCreate: function() {
		this.hide();
		this.fireEvent('create', this.getDurationString());
	}
});
