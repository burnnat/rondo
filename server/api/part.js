var Schema = require("mongoose").Schema;

module.exports = {
	name: 'parts',
	model: 'Part',
	
	fields: {
		name: String,
		group: String,
		sketch_id: {
			type: Schema.Types.ObjectId,
			required: true
		}
	}
};