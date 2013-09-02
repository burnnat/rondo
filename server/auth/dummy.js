var util = require('util');
var passport = require('passport');

var DummyStrategy = function(options, verify) {
	this.name = 'dummy';
	this._verify = verify;
};

util.inherits(DummyStrategy, passport.Strategy);

DummyStrategy.prototype.authenticate = function(req, options) {
	var me = this;
	
	this._verify(
		function(err, user, info) {
			if (err) {
				return me.error(err);
			}
			
			if (!user) {
				return me.fail(info);
			}
			
			me.success(user, info);
		}
	);
};

module.exports = {
	name: 'dummy',
	
	init: function(options) {
		return {
			name: this.name,
			strategy: DummyStrategy,
			simple: true,
			
			getIdentifier: function() {
				return 'test-user';
			},
			
			getProfile: function() {
				return {};
			}
		};
	}
};