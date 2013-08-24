/*

Siesta 2.0.1
Copyright(c) 2009-2013 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
/**

@class Siesta.Test.Action.Type
@extends Siesta.Test.Action
@mixin Siesta.Test.Action.Role.HasTarget

This action will {@link Siesta.Test.Browser#type type} provided {@link #text} in the provided {@link #target}. 
Target can be a DOM element or, in case you are using the Siesta.Test.ExtJS class - an instance of Ext.Component (field component for example). 

This action can be included in the `t.chain` call with "type" shortcut. **Note**, that unlike the other actions, in the compact
form "type" property contains the text to type, not the target of action.

    t.chain(
        {
            action      : 'type',
            target      : someDOMElement,
            text        : 'Some text'
        },
        // or 
        {
            // NOTE: "type" contains text to type, not the action target as in other actions
            type        : 'Some text',
            target      : someDOMElement
        }        
    )


*/
Class('Siesta.Test.Action.Type', {
    
    isa         : Siesta.Test.Action,
    
    does        : Siesta.Test.Action.Role.HasTarget,
        
    has : {
        requiredTestMethod  : 'type',
        
        /**
         * @cfg {String} text
         * 
         * The text to type into the target
         */
        text                : '',

        /**
         * @cfg {Object} options
         *
         * Any options that will be used when simulating the event. For information about possible
         * config options, please see: https://developer.mozilla.org/en-US/docs/DOM/event.initMouseEvent
         */
        options             : null
    },

    
    methods : {
        
        process : function () {
            // By default use the current focused element as target
            this.target = this.target || this.test.activeElement();

            // additional "getTarget" to allow functions as "target" value
            this.test.type(this.getTarget(), this.text, this.next, null, this.options);
        }
    }
});


Siesta.Test.ActionRegistry().registerAction('type', Siesta.Test.Action.Type)