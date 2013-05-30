/**
 * @private
 *
 */
Ext.define('Ext.cf.naming.LocalStore', {
    /**
    * Get item
    *
    * @param {String/Number} key
    *
    */
    getItem: function(key) {
        var store= window.localStorage;
        if (store) {
            var value = store.getItem(key);
            if(value === "null") {
                return null;
            } else if(value === "undefined") {
                return undefined;
            } else {
                return value;
            }
        }
    },

    /**
    * Set item
    *
    * @param {String/Number} key
    * @param {String/Number} value
    *
    */
    setItem: function(key,value) {
        var store= window.localStorage;
        if (store) {
            store.setItem(key,value);
        }
    },

    /**
    * Remove item
    *
    * @param {String/Number} key
    *
    */
    removeItem: function(key) {
        var store= window.localStorage;
        if (store) {
            store.removeItem(key);
        }
    },

    listKeys: function(prefix){
        var keys = [];
        for(var i =0, l = localStorage.length; i < l; i++) {
            var key = localStorage.key(i);
            if(key.indexOf(prefix) === 0) {
                keys.push(key);
            }
        }
        return keys;
    },
    
    removeAllKeyPrefixes: function(prefix){
        var keys = this.listKeys(prefix);
        var store= window.localStorage;
        for(var i =0, l = keys.length; i < l; i++) {
            store.removeItem(keys[i]);
        }
        return keys;
    }
});
