var Schema = require("mongoose").Schema;

module.exports = {
	name: 'staves',
	model: 'Staff',
	
	fields: {
		clef: {
			type: String,
			enum: [
				'treble',
				'bass',
				'tenor',
				'alto',
				'percussion'
			]
		},
		part_id: {
			type: Schema.Types.ObjectId,
			required: true
		}
	}
};