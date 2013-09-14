/*

Siesta 2.0.3
Copyright(c) 2009-2013 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Role('Siesta.Test.Sub', {
    
    has : {
        isExclusive         : false,
        parent              : { required : true }
    },
    
    
    methods : {
        
        getExceptionCatcher : function () {
            return this.parent.getExceptionCatcher()
        },
        
        
        getTestErrorClass : function () {
            return this.parent.getTestErrorClass()
        },
        
        
        getStartTestAnchor : function () {
            return this.parent.getStartTestAnchor()
        }
    }
        
})
//eof Siesta.Test
