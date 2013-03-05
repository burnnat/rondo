/**
 * 
 */
Ext.define('Rondo.key.Picker', {
	extend: 'Ext.picker.Picker',
	xtype: 'keypicker',
	
	/**
	 * @event change
	 * Fired when the value of this picker has changed and the done button is pressed.
	 * @param {Rondo.key.Picker} this This Picker
	 * @param {String} value The key value
	 */
	
	config: {
		/**
		 * @cfg {String} monthText
		 * The label to show for the month column.
		 * @accessor
		 */
		tonicText: 'Tonic',
		
		/**
		 * @cfg {String} dayText
		 * The label to show for the day column.
		 * @accessor
		 */
		modeText: 'Mode',
		
		/**
		 * @cfg {Array} slotOrder
		 * An array of strings that specifies the order of the slots.
		 * @accessor
		 */
		slotOrder: ['tonic', 'mode']
		
		/**
		 * @cfg {Object/Date} value
		 * Default value for the field and the internal {@link Ext.picker.Date} component. Accepts an object of 'year',
		 * 'month' and 'day' values, all of which should be numbers, or a {@link Date}.
		 *
		 * Examples:
		 *
		 * - `{year: 1989, day: 1, month: 5}` = 1st May 1989
		 * - `new Date()` = current date
		 * @accessor
		 */
		
		/**
		 * @cfg {Array} slots
		 * @hide
		 * @accessor
		 */
	},
	
	setValue: function(value, animated) {
		if (Ext.isString(value)) {
			var parts = Tutti.Theory.getKeyParts(value);
			
			value = {
				tonic: parts.root + (parts.accidental || ''),
				mode: parts.type
			};
		}
		
		this.callParent([value, animated]);
	},
	
	getValue: function(useDom) {
		var values = {};
		
		this.getItems().each(
			function(item) {
				if (item instanceof Ext.picker.Slot) {
					values[item.getName()] = item.getValue(useDom);
				}
			}
		);
		
		// valid key signature strings are picky - note names capitalized, and major is empty string
		return Ext.String.capitalize(values.tonic) + (values.mode !== 'M' ? values.mode : '');
	},

	/**
	 * Updates the monthText configuration
	 */
	updateTonicText: function(newMonthText, oldMonthText) {
		var innerItems = this.getInnerItems,
			ln = innerItems.length,
			item, i;

		//loop through each of the current items and set the title on the correct slice
		if (this.initialized) {
			for (i = 0; i < ln; i++) {
				item = innerItems[i];

				if ((typeof item.title == "string" && item.title == oldMonthText) || (item.title.html == oldMonthText)) {
					item.setTitle(newMonthText);
				}
			}
		}
	},

	/**
	 * Updates the {@link #dayText} configuration.
	 */
	updateModeText: function(newDayText, oldDayText) {
		var innerItems = this.getInnerItems,
			ln = innerItems.length,
			item, i;

		//loop through each of the current items and set the title on the correct slice
		if (this.initialized) {
			for (i = 0; i < ln; i++) {
				item = innerItems[i];

				if ((typeof item.title == "string" && item.title == oldDayText) || (item.title.html == oldDayText)) {
					item.setTitle(newDayText);
				}
			}
		}
	},

	// @private
	constructor: function() {
		this.callParent(arguments);
		
		this.setSlots(
			Ext.Array.map(
				this.getSlotOrder(),
				this.createSlot,
				this
			)
		);
	},
	
	/**
	 * @private
	 */
	createSlot: function(name) {
		switch (name) {
			case 'tonic':
				var data = Ext.Array.map(
					Ext.Array.slice(
						Tutti.Theory.FIFTHS,
						Tutti.Theory.NUM_SCALE + 1, // from Cb
						-Tutti.Theory.NUM_SCALE - 2 // to A#
					),
					function(note) {
						return {
							text: Tutti.Theory.formatNote(note),
							value: note
						};
					}
				);
				
				return {
					name: name,
					align: 'center',
					data: data,
					title: this.getTonicText(),
					flex: 1
				};
			case 'mode':
				return {
					name: name,
					align: 'center',
					data: [
						{
							text: 'Major',
							value: 'M'
						},
						{
							text: 'Minor',
							value: 'm'
						}
					],
					title: this.getModeText(),
					flex: 4
				};
		}
	}
});
