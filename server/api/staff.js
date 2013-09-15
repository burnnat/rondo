var Schema = require("mongoose").Schema;

module.exports = {
	name: 'staves',
	model: 'Staff',
	
	fields: {
		clef: String,
		part_id: {
			type: Schema.Types.ObjectId,
			required: true
		}
	}
};