/**
 * 
 */
Ext.define('Tutti.touch.input.NotePanel', {
	extend: 'Ext.Panel',
	
	requires: ['Tutti.touch.ToggleButton'],
	
	durations: ['16', '8', 'q', 'h', 'w'],
	
	noteIcons: {
		'16': 'note-sixteenth',
		'8': 'note-eighth',
		'q': 'note-quarter',
		'h': 'note-half',
		'w': 'note-whole'
	},
	
	restIcons: {
		'16': 'rest-sixteenth',
		'8': 'rest-eighth',
		'q': 'rest-quarter',
		'h': 'rest-half',
		'w': 'rest-whole'
	},
	
	config: {
		create: false,
		rests: false,
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
	
	initDurationBar: function() {
		var isRests = this.getRests();
		var durations = [];
		
		var icons = isRests
			? this.restIcons
			: this.noteIcons;
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
		
		this.durationBtn = new Tutti.touch.ToggleButton({
			items: durations,
			listeners: {
				toggletap: this.onDurationToggle,
				scope: this
			}
		});
		
		this.dotBtn = new Tutti.touch.ToggleButton({
			allowMultiple: true,
			items: { text: '&middot;' },
			listeners: {
				toggletap: this.onDotToggle,
				scope: this
			}
		});
		
		this.tieBtn = new Tutti.touch.ToggleButton({
			allowMultiple: true,
			items: {
				iconCls: 'tie',
				padding: 0
			},
			listeners: {
				toggletap: this.onTieToggle,
				scope: this
			},
			hidden: isRests
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
	
	updateRests: function(rests) {
		var icons = rests
			? this.restIcons
			: this.noteIcons;
		
		var durations = this.durationBtn;
		
		if (durations) {
			Ext.Object.each(
				icons,
				function(id, cls) {
					durations.getComponent(id).setIconCls(cls);
				}
			);
		}
		
		var tieBtn = this.tieBtn;
		
		if (tieBtn) {
			tieBtn.setHidden(rests);
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
		this.fireEvent('save', this);
	},
	
	onDelete: function() {
		this.hide();
		this.fireEvent('delete');
	}
});
