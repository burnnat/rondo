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
		
		this.formatter.drawBlock(
			this.getIndex(),
			this.getContext()
		);
	}
});