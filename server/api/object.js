var _ = require("lodash");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

module.exports = {
	init: function(app, object) {
		var me = this;
		var name = object.name;
		var fields = object.fields;
		
		var Model = this.createModel(object.model, fields);
		
		app.get('/api/' + name, function(req, res) {
			return Model.find(
				{
					owner: req.user._id
				},
				function(err, records) {
					return err
						? me.failure(res, err)
						: me.success(res, fields, { records: records });
				}
			);
		});
		
		app.post('/api/' + name, function(req, res) {
			var record = new Model(
				_.assign(
					me.getData(fields, req.body),
					{
						owner: req.user._id
					}
				)
			);
			
			return record.save(function(err) {
				return err
					? me.failure(res, err)
					: me.success(res, fields, { records: record });
			});
		});
		
		app.get('/api/' + name + '/:id', function(req, res) {
			return Model.findById(req.params.id, function(err, record) {
				return err
					? me.failure(res, err)
					: me.success(res, fields, { records: record });
			});
		});
		
		app.put('/api/' + name + '/:id', function(req, res) {
			return Model.findById(req.params.id, function(err, record) {
				me.updateData(fields, record, req.body);
				
				return record.save(function(err) {
					return err
						? me.failure(res, err)
						: me.success(res, fields, { records: record });
				});
			});
		});
		
		app['delete']('/api/' + name + '/:id', function(req, res) {
			return Model.findById(req.params.id, function(err, record) {
				me.updateData(fields, record, req.body);
				
				return record.remove(function(err) {
					return err
						? me.failure(res, err)
						: me.success(res, fields);
				});
			});
		});
		
		object.reset = function(callback) {
			Model.remove({}, callback);
		};
	},
	
	createModel: function(name, fields) {
		fields = _.clone(fields);
		
		fields.owner = {
			type: Schema.Types.ObjectId,
			required: true
		};
		
		return mongoose.model(name, new Schema(fields));
	},
	
	updateData: function(fields, record, updates) {
		_.assign(
			record,
			_.pick(
				updates,
				_.keys(fields)
			)
		);
	},
	
	getData: function(fields, record) {
		if (_.isArray(record)) {
			return record.map(
				_.partial(this.getData, fields),
				this
			);
		}
		
		var data = _.pick(record, _.keys(fields));
		
		if (record._id) {
			data.id = record._id;
		}
		
		delete data.owner;
		
		return data;
	},
	
	success: function(res, fields, data) {
		data = data || {};
		data.success = true;
		
		if (data.records) {
			data.records = this.getData(fields, data.records);
		}
		
		return res.send(data);
	},
	
	failure: function(res, err) {
		console.error(err);
		return res.send(400, { success: false });
	}
};