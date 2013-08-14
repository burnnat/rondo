/**
 * 
 */
Ext.define('Tutti.model.Measure', {
	extend: 'Ext.data.Model',
	
	requires: [
		'Tutti.association.LocalHasMany',
		'Tutti.model.Voice'
	],
	
	config: {
		identifier: 'uuid',
		
		proxy: {
			type: 'localstorage',
			id: 'measures'
		},
		
		fields: [
			{
				name: 'key',
				type: 'string'
			},
			{
				name: 'time',
				type: 'string',
				convert: function(value) {
					if (Ext.isObject(value)) {
						value = value.num_beats + '/' + value.beat_value;
					}
					
					return value;
				}
			}
		],
		
		associations: [
			{
				type: 'localhasmany',
				model: 'Tutti.model.Voice'
			},
			{
				type: 'localbelongsto',
				model: 'Tutti.model.Sketch',
				lookupStore: 'sketches'
			}
		]
	},
	
	getTimeObject: function() {
		var time = this.get('time');
		
		if (!time) {
			return null;
		}
		
		var split = time.split('/');
		
		return {
			num_beats: split[0],
			beat_value: split[1]
		};
	},
	
	findPrecedingMeasure: function(field, record) {
		var measures = this.getSketch().measures();
		var index = measures.indexOf(this);
		var current = null;
		var value = null;
		
		while (index >= 0) {
			current = measures.getAt(index--);
			value = current.get(field);
			
			if (!!value) {
				return record ? current : value;
			}
		}
		
		return null;
	},
	
	getResolvedTime: function() {
		return this.findPrecedingMeasure('time', true).getTimeObject();
	},
	
	getResolvedKey: function() {
		return this.findPrecedingMeasure('key');
	}
});