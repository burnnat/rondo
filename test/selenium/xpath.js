module.exports = {
	start: function(selectors) {
		return "//*[" + selectors + "]";
	},
	
	down: function(selectors) {
		return "/*[" + selectors + "]";
	},
	
	following: function(selectors) {
		return "/following::*[" + selectors + "]";
	},
	
	cls: function(cls) {
		return "contains(concat(' ', normalize-space(@class), ' '), ' " + cls + " ')";
	},
	
	text: function(text) {
		return "text()='" + text + "'";
	},
	
	button: function() {
		return this.start(this.cls('x-button'));
	},
	
	buttonText: function(text) {
		return this.button()
			+ this.down(this.text(text));
	},
	
	buttonIcon: function(icon) {
		return this.button()
			+ this.down(this.cls('x-button-icon') + ' and ' + this.cls(icon));
	},
	
	title: function(text) {
		return this.start(this.cls('x-title'))
			+ this.down(this.text(text));
	},
	
	textField: function(label) {
		return this.start(this.cls('x-form-label'))
			+ this.down(this.text(label))
			+ this.following(this.cls('x-input-text'));
	},
	
	listItem: function(text) {
		return this.start(this.cls('x-list-item'))
			+ this.down(this.text(text));
	}
};
