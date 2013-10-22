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
		create: false,
		duration: 'q',
		tied: false
	},
	
	initialize: function() {
		this.callParent();
		
		var isCreate = this.getCreate();
		
		this.add([
			this.initDurationBar(),
			{
				xtype: 'button',
				ui: 'confirm',
				text: isCreate ? 'Add' : 'Update',
				margin: 10,
				handler: this.onSave,
				scope: this
			},
			{
				xtype: 'button',
				ui: 'decline',
				text: 'Delete',
				hidden: isCreate,
				margin: 10,
				handler: this.onDelete,
				scope: this
			}
		]);
		
	},
	
	updateCreate: function(create) {
		var saveButton = this.down('button[ui="confirm"]');
		
		if (saveButton) {
			saveButton.setText(create ? 'Add' : 'Update');
		}
		
		var deleteButton = this.down('button[ui="decline"]');
		
		if (deleteButton) {
			deleteButton.setHidden(create);
		}
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
	
	updateTied: function(tied) {
		if (this.tieBtn) {
			this.tieBtn.setPressedButtons(tied ? [0] : []);
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
		});
		
		this.tieBtn = new Ext.SegmentedButton({
			allowMultiple: true,
			items: {
				iconCls: 'tie',
				padding: 0
			},
			listeners: {
				toggle: this.onTieToggle,
				scope: this
			}
		});
		
		return {
			xtype: 'toolbar',
			items: [
				this.durationBtn,
				{
					xtype: 'spacer',
					width: 5
				},
				this.dotBtn,
				{
					xtype: 'spacer',
					width: 5
				},
				this.tieBtn
			]
		};
	},
	
	onDurationToggle: function(seg, button, pressed) {
		if (pressed) {
			this.setDuration(button.getItemId());
			this.setTied(false);
		}
	},
	
	onDotToggle: function(seg, button, pressed) {
		this.getDuration().dots = pressed ? 1 : 0;
	},
	
	onTieToggle: function(seg, button, pressed) {
		this.setTied(pressed);
	},
	
	onSave: function() {
		this.hide();
		this.fireEvent('save', this.getDurationString(), this.getTied());
	},
	
	onDelete: function() {
		this.hide();
		this.fireEvent('delete');
	}
});
