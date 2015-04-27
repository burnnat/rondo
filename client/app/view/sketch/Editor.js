/**
 * 
 */
Ext.define('Rondo.view.sketch.Editor', {
	extend: 'Ext.form.Panel',
	xtype: 'sketcheditor',
	
	uses: [
		'Ext.Button',
		'Ext.MessageBox',
		'Ext.Toolbar',
		'Ext.field.Text',
		'Ext.field.Select',
		'Rondo.key.Field'
	],
	
	config: {
		items: [
			{
				docked: 'top',
				xtype: 'toolbar',
				title: 'New Sketch'
			},
			{
				xtype: 'textfield',
				name: 'title',
				label: 'Title',
				itemId: 'title'
			},
			{
				xtype: 'selectfield',
				itemId: 'staffType',
				label: 'Staff',
				options: [
					{ text: 'Grand', value: 'grand' },
					{ text: 'Treble', value: 'treble' },
					{ text: 'Bass', value: 'bass' }
				]
			},
			{
				xtype: 'keyfield',
				itemId: 'keySig',
				label: 'Key Signature'
			},
			{
				docked: 'bottom',
				xtype: 'toolbar',
				itemId: 'bbar'
			}
		]
	},
	
	initialize: function() {
		this.callParent();
		
		this.getComponent('bbar').add([
			{
				text: 'Cancel',
				handler: this.onCancel,
				scope: this
			},
			{ xtype: 'spacer' },
			{
				text: 'Create',
				ui: 'action',
				handler: this.onCreate,
				scope: this
			}
		]);
		
		this.getComponent('title').on({
			keypress: 'onKeyPress',
			scope: this
		});
	},
	
	onCancel: function() {
		this.fireEvent('cancel', this);
	},
	
	onCreate: function() {
		var sketch = this.getRecord();
		
		sketch.set(this.getValues());
		
		var errors = sketch.validate();
		
		if (!errors.isValid()) {
			Ext.Msg.alert('Error', errors.first().getMessage());
		}
		else {
			var part = new Tutti.model.Part();
			var type = this.getComponent('staffType').getValue();
			
			if (type == 'grand') {
				part.set('group', 'brace');
				part.staves().add(
					{ clef: 'treble' },
					{ clef: 'bass' }
				);
			}
			else {
				part.staves().add({
					clef: type
				});
			}
			
			part.staves().sync();
			
			sketch.parts().add(part);
			sketch.parts().sync();
			
			var measures = sketch.measures().add(
				{
					key: this.getComponent('keySig').getValue(),
					time: '4/4'
				},
				{},
				{},
				{},
				{}
			);
			
			Ext.Array.forEach(
				measures,
				function(measure) {
					var voices = measure.voices();
					
					part.staves().each(function(staff) {
						voice = new Tutti.model.Voice();
						voice.setStaff(staff);
						voices.add(voice);
					});
					
					voices.sync();
				}
			);
			
			sketch.measures().sync();
			
			this.fireEvent('save', this, sketch);
		}
	},
	
	setRecord: function() {
		this.getComponent('staffType').reset();
		this.getComponent('keySig').reset();
		
		this.callParent(arguments);
	},
	
	onKeyPress: function(e) {
		if (e.browserEvent.keyCode == 13) {
			// Block enter key from reloading the page
			e.stopEvent();
		}
	}
});
