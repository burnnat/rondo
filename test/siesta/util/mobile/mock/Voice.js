/**
 * 
 */
Ext.define('Test.mock.Voice', {
	
	requires: ['Test.mock.Note'],
	
	config: {
		block: null,
		increment: null,
		noteWidth: null
	},
	
	constructor: function(config) {
		this.initConfig(config);
		
		var block = this.getBlock();
		
		var width = block.getBlockWidth();
		var height = block.getBlockHeight();
		
		var increment = this.getIncrement();
		var noteWidth = this.getNoteWidth();
		
		var notes = [];
		var note;
		
		for (var i = increment; i < width; i += increment) {
			note = new Test.mock.Note({
				x: i,
				width: noteWidth,
				height: height
			});
			
			notes.push(note);
			block.items.add(note);
		}
		
		this.notes = notes;
	},
	
	getNote: function(index) {
		return this.notes[index];
	},
	
	findInsertionPoint: function(x) {
		var increment = this.getIncrement();
		
		return Ext.Number.snap(
			x,
			increment,
			increment,
			this.getBlock().getBlockWidth() - increment
		) / increment;
	}
});