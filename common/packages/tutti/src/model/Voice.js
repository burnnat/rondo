/**
 * 
 */
Ext.define('Tutti.model.Voice', {
	extend: 'Ext.data.Model',
	
	requires: [
		'Tutti.association.LocalBelongsTo',
		'Tutti.model.Staff'
	],
	
	uses: [
		'Tutti.model.Note'
	],
	
	config: {
		identifier: 'uuid',
		
		proxy: {
			type: 'syncstorage',
			id: 'voices',
			owner: 'user',
			access: 'private'
		},
		
		fields: [
			{
				name: 'notes',
				type: 'string',
				convert: function(value) {
					if (!Ext.isString(value)) {
						return Ext.encode(Ext.Array.from(value));
					}
					
					return value;
				}
			}
		],
		
		associations: [
			{
				type: 'localbelongsto',
				model: 'Tutti.model.Staff',
				lookupStore: 'staves'
			}
		]
	},
	
	/**
	 * @return {Ext.data.Store}
	 */
	notes: function() {
		var store = this.noteStore;
		
		if (!store) {
			store = this.noteStore = new Ext.data.Store({
				model: 'Tutti.model.Note',
				data: Ext.decode(this.get('notes')),
				listeners: {
					addrecords: this.updateNotes,
					removerecords: this.updateNotes,
					updaterecord: this.updateNotes,
					scope: this
				}
			});
		}
		
		return store;
	},
	
	/**
	 * @private
	 */
	updateNotes: function() {
		var range = [];
		
		this.notes().each(
			function(note) {
				range.push(note.getData());
			}
		);
		
		this.set('notes', range);
	}
}
//<debug>
,function() {
	if (Tutti.offline) {
		this.prototype.initConfig({
			proxy: {
				type: 'localstorage',
				id: 'offline-voices'
			}
		});
	}
}
//</debug>
);