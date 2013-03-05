/**
 * 
 */
Ext.define('Rondo.key.Field', {
	extend: 'Ext.field.Text',
	xtype: 'keyfield',
	
	requires: [
		'Rondo.key.Picker'
	],
	
	/**
	 * @event change
	 * Fires when a date is selected
	 * @param {Rondo.key.Field} this
	 * @param {String} newKey The new key
	 * @param {String} oldKey The old key
	 */
	
	config: {
		ui: 'select',
		
		/**
		 * @cfg {Object/Rondo.key.Picker} picker
		 * An object that is used when creating the internal {@link Rondo.key.Picker} component or a direct instance of {@link Rondo.key.Picker}.
		 * @accessor
		 */
		picker: true,
		
		/**
		 * @cfg {Boolean}
		 * @hide
		 * @accessor
		 */
		clearIcon: false,
		
		/**
		 * @cfg {Object/String} value
		 * @accessor
		 */
		value: 'C',
		
		/**
		 * @cfg {Boolean} destroyPickerOnHide
		 * Whether or not to destroy the picker widget on hide. This save memory if it's not used frequently,
		 * but increase delay time on the next show due to re-instantiation.
		 * @accessor
		 */
		destroyPickerOnHide: false,
		
		/**
		 * @cfg {Object}
		 * @hide
		 */
		component: {
			useMask: true
		}
	},

	initialize: function() {
		var me = this,
			component = me.getComponent();
		
		me.callParent();
		
		component.on({
			scope: me,
			masktap: 'onMaskTap'
		});
		
		if (Ext.os.is.Android2) {
			component.input.dom.disabled = true;
		}
	},
	
	syncEmptyCls: Ext.emptyFn,
	
	applyValue: function(value) {
		if (!Ext.isString(value)) {
			return null;
		}
		
		return value;
	},
	
	updateValue: function(newValue, oldValue) {
		var me	 = this,
			picker = me._picker;
		
		if (picker && picker.isPicker) {
			picker.setValue(newValue);
		}
		
		// Input elements don't recognize HTML entities.
		me.getComponent().setValue(
			newValue !== null
				? Ext.String.htmlDecode(Tutti.Theory.formatKey(newValue))
				: ''
		);
		
		if (newValue !== oldValue) {
			me.fireEvent('change', me, newValue, oldValue);
		}
	},
	
	/**
	 * Returns the {@link Date} value of this field.
	 * If you wanted a formated date
	 * @return {Date} The date selected
	 */
	getValue: function() {
		if (this._picker && Ext.isFunction(this._picker) && this._picker instanceof Ext.picker.Date) {
			return this._picker.getValue();
		}
		
		return this._value;
	},

//	/**
//	 * Returns the value of the field formatted using the specified format. If it is not specified, it will default to
//	 * {@link #dateFormat} and then {@link Ext.util.Format#defaultDateFormat}.
//	 * @param {String} format The format to be returned.
//	 * @return {String} The formatted date.
//	 */
//	getFormattedValue: function(format) {
//		var value = this.getValue();
//		return (Ext.isDate(value)) ? Ext.Date.format(value, format || this.getDateFormat() || Ext.util.Format.defaultDateFormat) : value;
//	},
	
	applyPicker: function(picker, pickerInstance) {
		if (pickerInstance && pickerInstance.isPicker) {
			picker = pickerInstance.setConfig(picker);
		}
		
		return picker;
	},
	
	getPicker: function() {
		var picker = this._picker,
			value = this.getValue();
		
		if (picker && !picker.isPicker) {
			picker = Ext.factory(picker, Rondo.key.Picker);
			if (value != null) {
				picker.setValue(value);
			}
		}
		
		picker.on({
			scope: this,
			change: 'onPickerChange',
			hide  : 'onPickerHide'
		});
		
		this._picker = picker;
		
		return picker;
	},

	/**
	 * @private
	 * Listener to the tap event of the mask element. Shows the internal DatePicker component when the button has been tapped.
	 */
	onMaskTap: function() {
		if (this.getDisabled()) {
			return false;
		}
		
		this.onFocus();
		
		return false;
	},
	
	/**
	 * Called when the picker changes its value.
	 * @param {Ext.picker.Date} picker The date picker.
	 * @param {Object} value The new value from the date picker.
	 * @private
	 */
	onPickerChange: function(picker, value) {
		var me = this,
			oldValue = me.getValue();
		
		me.setValue(value);
		me.fireEvent('select', me, value);
		me.onChange(me, value, oldValue);
	},
	
	/**
	 * Override this or change event will be fired twice. change event is fired in updateValue
	 * for this field. TOUCH-2861
	 */
	onChange: Ext.emptyFn,
	
	/**
	 * Destroys the picker when it is hidden, if
	 * {@link Ext.field.DatePicker#destroyPickerOnHide destroyPickerOnHide} is set to `true`.
	 * @private
	 */
	onPickerHide: function() {
		var me	 = this,
			picker = me.getPicker();
		
		if (me.getDestroyPickerOnHide() && picker) {
			picker.destroy();
			me._picker = me.getInitialConfig().picker || true;
		}
	},
	
	reset: function() {
		this.setValue(this.originalValue);
	},
	
	onFocus: function(e) {
		var component = this.getComponent();
		this.fireEvent('focus', this, e);
		
		if (Ext.os.is.Android4) {
			component.input.dom.focus();
		}
		component.input.dom.blur();
		
		if (this.getReadOnly()) {
			return false;
		}
		
		this.isFocused = true;
		
		this.getPicker().show();
	}
});
