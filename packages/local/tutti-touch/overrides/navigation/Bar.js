/**
 * 
 */
Ext.define('Tutti.touch.overrides.navigation.Bar', {
	override: 'Ext.navigation.Bar',
	
	doChangeView: function(view, hasPrevious, reverse) {
		var me = this,
			leftBox = me.leftBox,
			leftBoxElement = leftBox.element,
			titleComponent = me.titleComponent,
			titleElement = titleComponent.element,
			backButton = me.getBackButton(),
			titleText = me.getTitleText(),
			backButtonText = me.getBackButtonText(),
			animation = me.getAnimation() && view.getLayout().getAnimation(),
			animated = animation && animation.isAnimation && view.isPainted(),
			properties, leftGhost, titleGhost, leftProps, titleProps;

		if (animated) {
			leftGhost = me.createProxy(leftBox.element);
			leftBoxElement.setStyle('opacity', '0');
			backButton.setText(backButtonText);
			backButton[hasPrevious ? 'show' : 'hide']();

			titleGhost = me.createProxy(titleComponent.element.getParent());
			titleElement.setStyle('opacity', '0');
			me.setTitle(titleText);

			properties = me.measureView(leftGhost, titleGhost, reverse);
			leftProps = properties.left;
			titleProps = properties.title;

			me.isAnimating = true;
			me.animate(leftBoxElement, leftProps.element);
			me.animate(titleElement, titleProps.element, function() {
				titleElement.setLeft(properties.titleLeft);
				me.isAnimating = false;
				me.refreshTitlePosition();
			});

			if (Ext.browser.is.AndroidStock2 && !this.getAndroid2Transforms()) {
				leftGhost.ghost.destroy();
				titleGhost.ghost.destroy();
			}
			else {
				// MODIFIED: destroy each element after its own animation, not together
				me.animate(leftGhost.ghost, leftProps.ghost, function() {
					leftGhost.ghost.destroy();
				});
				me.animate(titleGhost.ghost, titleProps.ghost, function() {
					titleGhost.ghost.destroy();
				});
			}
		}
		else {
			if (hasPrevious) {
				backButton.setText(backButtonText);
				backButton.show();
			}
			else {
				backButton.hide();
			}
			me.setTitle(titleText);
		}
	}
})
