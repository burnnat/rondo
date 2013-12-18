var _ = require("lodash");
var winston = require("winston");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ConfigModel = mongoose.model(
	'Config',
	new Schema({
		name: String,
		revision: {
			type: Number,
			"default": 0
		}
	})
);

module.exports = {
	init: function(app, object) {
		var me = this;
		var name = object.name;
		
		ConfigModel.update(
			{ name: name },
			{
				name: name,
				$setOnInsert: { revision: 0 }
			},
			{ upsert: true },
			function(err) {
				if (err) {
					winston.error(err);
				}
			}
		);
		
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
			
			return me.nextRevision(name, record, function(err) {
				if (err) {
					return me.failure(res, err);
				}
				
				winston.debug('Creating %s for owner %s', name, req.user._id, record);
				
				return record.save(function(err) {
					return err
						? me.failure(res, err)
						: me.success(res, fields, { records: record });
				});
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
				if (err) {
					return me.failure(res, err);
				}
				else {
					return me.nextRevision(name, record, function(err) {
						if (err) {
							return me.failure(res, err);
						}
						
						me.updateData(fields, record, req.body);
						
						winston.debug('Updating %s for owner %s', name, req.user._id, record);
						
						return record.save(function(err) {
							return err
								? me.failure(res, err)
								: me.success(res, fields, { records: record });
						});
					});
				}
			});
		});
		
		app['delete']('/api/' + name + '/:id', function(req, res) {
			return Model.findById(req.params.id, function(err, record) {
				if (err) {
					return me.failure(res, err);
				}
				
				winston.debug('Deleting %s for owner %s with id: %s', name, req.user._id, req.params.id);
				
				return record.remove(function(err) {
					return err
						? me.failure(res, err)
						: me.success(res, fields);
				});
			});
		});
		
		if (object['export']) {
			app.get('/api/' + name + '/:id/export', function(req, res) {
				return Model.findById(req.params.id, function(err, record) {
					if (err) {
						return me.failure(res, err);
					}
					
					winston.debug('Exporting %s for owner %s with id: %s', name, req.user._id, req.params.id);
					
					return object['export'](res, record);
				});
			});
		}
		
		object.reset = function(callback) {
			ConfigModel.findOneAndUpdate(
				{ name: name },
				{ revision: 0 },
				function(err) {
					if (err) {
						winston.error(err);
					}
					
					Model.remove({}, callback);
				}
			);
		};
	},
	
	createModel: function(name, fields) {
		return mongoose.model(
			name,
			new Schema(
				_.assign(
					_.clone(fields),
					{
						owner: {
							type: Schema.Types.ObjectId,
							required: true
						},
						
						revision: Number
					}
				)
			)
		);
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
	
	nextRevision: function(name, record, callback) {
		return record.validate(function(err) {
			if (err) {
				callback(err, null);
			}
			else {
				ConfigModel.findOneAndUpdate(
					{ name: name },
					{ $inc: { revision: 1 } },
					{
						select: 'revision',
						'new': true
					},
					function(err, result) {
						record.revision = result.revision;
						callback(err, record);
					}
				);
			}
		});
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
		data.revision = record.revision;
		
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
		if (err.name == 'ValidationError') {
			winston.debug(err.message);
			
			_.each(err.errors, function(detail) {
				winston.debug(detail.message);
			});
		}
		else {
			winston.error(err);
		}
		
		return res.send(400, { success: false });
	}
};