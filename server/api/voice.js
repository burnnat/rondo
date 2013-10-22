var _ = require("lodash");
var Schema = require("mongoose").Schema;

var pitchMatcher = /^[A-Ga-g](n|bb?|##?)?\d+$/;

var Note = new Schema(
	{
		pitches: {
			type: [String],
			required: true,
			validate: function(array) {
				return _.isArray(array) &&
					_.every(
						array,
						function(pitch) {
							return pitchMatcher.test(pitch);
						}
					);
			}
		},
		ties: {
			type: [Boolean],
			required: false
		},
		duration: {
			type: String,
			required: true,
			match: /^([whq1248]|16|32|64)d*[nrhms]?$/
		}
	},
	{
		_id: false
	}
);

module.exports = {
	name: 'voices',
	model: 'Voice',
	
	fields: {
		staff_id: {
			type: Schema.Types.ObjectId,
			required: true
		},
		notes: {
			type: [Note],
			'default': []
		}
	}
};