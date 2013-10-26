/**
 * 
 */
Ext.define('Tutti.touch.ToggleButton', {
	extend: 'Ext.SegmentedButton',
	
	onButtonRelease: function(button) {
		this.callParent(arguments);
		
		if (!this.getDisabled() && !button.getDisabled()) {
			this.fireEvent(
				'toggletap',
				this,
				button,
				this.isPressed(button)
			);
		}
	}
});
