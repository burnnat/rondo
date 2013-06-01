/**
 * 
 */
Ext.define('Tutti.touch.ScoreBlock', {
	extend: 'Tutti.touch.Block',
	xtype: 'scoreblock',
	
	config: {
		autoPaint: false,
		index: null,
		formatter: null
	},
	
	repaint: function() {
		this.items.clear();
		
		this.items.addAll(
			this.getFormatter().drawBlock(
				this.getIndex(),
				this.getContext()
			)
		);
		
		this.callParent();
	},
	
	onTap: function(tickable) {
		this.getFormatter().setSelected(
			tickable && !tickable.getSelected()
				? tickable
				: null
		);
		
		this.clear();
		this.repaint();
	}
});