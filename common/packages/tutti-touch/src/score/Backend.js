/**
 * 
 */
Ext.define('Tutti.score.Backend', {
	
	requires: ['Vex.Flow.Document'],
	uses: ['Vex.Flow.Measure'],
	
	statics: {
		appearsValid: function(data) {
			return !!data.isModel;
		}
	},
	
	parse: function(data) {
		this.measures = data.measures();
		this.parts = data.parts();
	},
	
	isValid: function() {
		return !!this.measures && !!this.parts;
	},
	
	getNumberOfMeasures: function() {
		return this.measures.getCount();
	},
	
	getMeasure: function(index) {
		var measure = this.measures.getAt(index);
		
		var time = measure.getResolvedTime();
		var key = measure.getResolvedKey();
		
		var measureData = {
			attributes: {},
			time: time,
			parts: []
		};
		
		var getPartVoices = this.getPartVoices;
		
		this.parts.each(function(part) {
			var partData = {
				options: { key: key },
				time: time,
				staves: [],
				voices: [],
				getVoices: getPartVoices
			};
			
			var staves = part.staves();
			
			staves.each(function(staff) {
				partData.staves.push(staff.get('clef'));
			});
			
			measure.voices().each(function(voice) {
				var staff = voice.getStaff();
				var staffIndex = staves.findBy(function(candidate) {
					return candidate === staff;
				});
				
				if (staffIndex >= 0) {
					partData.voices.push({
						time: Ext.apply(
							{ soft: true },
							time
						),
						stave: staffIndex,
						notes: voice.getNoteData(),
						id: voice.getId()
					});
				}
			});
			
			measureData.parts.push(partData);
		});
		
		return new Vex.Flow.Measure(measureData);
	},
	
	/**
	 * @private
	 */
	getPartVoices: function() {
		// this == part object
		var options = this.options;
		
		return Ext.Array.map(
			this.voices,
			function(voice) {
				// inject custom ID property to created voice
				return Ext.apply(
					new Vex.Flow.Measure.Voice(
						Vex.Merge(Vex.Merge({}, options), voice)
					),
					{ id: voice.id }
				);
			}
		);
	},
	
	getStaveConnectors: function() {
		var connectors = [];
		
		this.parts.each(function(part, index) {
			var group = part.get('group');
			
			if (group) {
				connectors.push({
					type: group,
					parts: [index],
					system_start: true
				});
			}
		});
		
		return connectors;
	}
	
}, function() {
	Vex.Flow.Document.backends.push(this);
});