/*

Siesta 2.0.3
Copyright(c) 2009-2013 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Ext.define('Siesta.Harness.Browser.UI.MouseVisualizer', {

    cursorEl                    : null,

    onEventSimulatedListener    : null,
    onTestFinishedListener      : null,
    
    harness                     : null,
    
    currentTest                 : null,
    currentContainer            : null,
    
    hideTimer                   : null,
    supportsTransitions         : null,

    clickEvents                 : {
        click       : 0,
        dblclick    : 0,
        touchstart  : 0,
        touchend    : 0,
        mousedown   : 0,
        contextmenu : 0
    },

    constructor : function (config) {
        config      = config || {}
        
        Ext.apply(this, config)
        this.supportsTransitions = (Ext.supports && Ext.supports.Transitions) || (Ext.feature && Ext.feature.has.CssTransitions);

        delete this.harness
        
        this.setHarness(config.harness)
    },
    
    
    getCursorEl : function () {
        if (this.cursorEl) return this.cursorEl
        
        if (!this.currentContainer) throw "Need container for cursor"
        
        return this.cursorEl = Ext.fly(this.currentContainer).createChild({
            tag     : 'div',
            cls     : 'ghost-cursor'
        })
    },
    
    
    setHarness : function (harness) {
        if (this.harness) {
            this.harness.un('testframeshow', this.onTestFrameShow, this);
            this.harness.un('testframehide', this.onTestFrameHide, this);
        }
        
        this.harness    = harness
    
        if (harness) {
            harness.on('testframeshow', this.onTestFrameShow, this);
            harness.on('testframehide', this.onTestFrameHide, this);
        }
    },

    
    resetListeners : function () {
        if (this.onEventSimulatedListener)  {
            this.onEventSimulatedListener.remove()
            this.onEventSimulatedListener = null
        }
        
        if (this.onTestFinishedListener)    {
            this.onTestFinishedListener.remove()
            this.onTestFinishedListener = null
        }
    },
    
    
    onTestFrameShow : function (event) {
        var test                            = event.source
        
        // do not react on re-positions of the same running test 
        if (test == this.currentTest) return
        
        this.currentTest    = test
        
        this.resetListeners()
        this.hideCursor()
        
        if (this.harness.canShowCursorForTest(test)) {
            clearTimeout(this.hideTimer)
            this.hideTimer                  = null
            
            this.currentContainer           = test.scopeProvider.wrapper
            
            this.onEventSimulatedListener   = test.on('eventsimulated', this.onEventSimulated, this);
            this.onTestFinishedListener     = test.on('testfinalize', this.onTestFinished, this);
        }
    },

    
    onTestFrameHide : function (event) {
        this.resetListeners()
        this.hideCursor()
        
        this.currentTest    = null
    },
    
    
    hideCursor : function () {
        if (this.currentContainer) {
            try {
                Ext.fly(this.cursorEl).remove()
            } catch (e) {
                // catch potential exceptions for example
                // if iframe of test has been already removed
            }
            
            try {
                Ext.select('.ghost-cursor-click-indicator', false, this.currentContainer).remove()
            } catch (e) {
                // catch potential exceptions for example
                // if iframe of test has been already removed
            }
        }
        
        this.cursorEl               = null
        this.currentContainer       = null
    },
    

    onTestFinished : function (event, test) {
        var me          = this;
        var cursorEl    = me.cursorEl
        
        this.resetListeners()
        
        if (cursorEl) 
            me.hideTimer = setTimeout(function() {
                // ExtJS branch
                if (cursorEl.fadeOut) {
                    cursorEl.fadeOut({ duration : 2000, callback : function () {
                        me.hideCursor()
                    } });
                } else {
                    // ST branch
                    me.hideCursor()
                }
            }, 2000);
    },

    
    onEventSimulated : function (event, test, el, type, evt) {
        if (type.match(/touch|mouse|click|contextmenu/) && Ext.isNumber(evt.clientX) && Ext.isNumber(evt.clientY)) {
            // this should never happen, but still happens sometimes
            if (!this.currentContainer) return
            
            var x               = test.currentPosition[0],
                y               = test.currentPosition[1];
                
            this.updateGhostCursor(type, x, y);

            if (this.supportsTransitions && type in this.clickEvents) {
                this.showClickIndicator(type, x, y);
            }
        }
    },

    // This method shows a fading circle at the position of click/dblclick/mousedown/contextmenu
    showClickIndicator : function(type, x, y) {
        var clickCircle = Ext.fly(this.currentContainer).createChild({
            cls     : 'ghost-cursor-click-indicator ' ,
            style   : 'left:' + x + 'px;top:' + y + 'px'
        });

        // need to a delay to make it work in FF
        setTimeout(function() {
            clickCircle.addCls('ghost-cursor-click-indicator-big');
        }, 5);
    },

    
    // This method updates the ghost cursor position and appearance
    updateGhostCursor: function (type, x, y) {
        var cursorEl        = this.getCursorEl(),
            translate3d     = 'translate3d(' + (x - 5) + 'px, ' + y + 'px, 0px)';
        
        cursorEl.setStyle({
            '-webkit-transform' : translate3d,
            '-moz-transform'    : translate3d,
            '-o-transform'      : translate3d,
            'transform'         : translate3d
        })
        
        switch(type) {
            case 'touchstart':
            case 'mousedown':
                cursorEl.addCls('ghost-cursor-press');
            break;

            case 'dblclick':
                cursorEl.addCls('ghost-cursor-press');
                Ext.Function.defer(cursorEl.removeCls, 40, cursorEl, ['ghost-cursor-press']);
            break;

            case 'touchend':
            case 'mouseup':
            case 'click':
                cursorEl.removeCls('ghost-cursor-press');
            break;
        
            case 'contextmenu' :
            break;
        }
    }
});
