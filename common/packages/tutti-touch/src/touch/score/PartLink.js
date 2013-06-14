/**
 * 
 */
Ext.define('Tutti.touch.score.PartLink', {
	
	uses: [
		'Tutti.touch.score.Barline',
		'Tutti.touch.score.Staff'
	],
	
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
	
	addStaff: function(staffData, index) {
		var block = this.getBlock();
		
		var staffConfig = {
			data: staffData,
			width: block.getBlockWidth()
		};
		
		if (this.getShowSignatures()) {
			Ext.apply(staffConfig, {
				clef: staffData.get('clef'),
				key: block.getKeySignature(),
				time: block.getTimeSignature()
			});
		}
		
		var staff = new Tutti.touch.score.Staff(staffConfig)
		
		block.items.add(staff);
		
		this.staves.insert(
			index,
			staffData.getId(),
			staff
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
					staves.first().primitive,
					staves.last().primitive
				)
				.setType(this.statics().groupTypes[type])
			);
	},
	
	updateLayout: function(x, y, width) {
		this.staves.each(
			function(staff) {
				staff.setLayout(x, y);
				staff.setWidth(width);
				
				y += staff.getTotalHeight();
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
			staff.setClef(record.get('clef'));
			
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
					this.group.setType(this.statics().groupTypes[type]);
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