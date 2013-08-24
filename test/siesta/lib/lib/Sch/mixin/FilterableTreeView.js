/*

Siesta 2.0.1
Copyright(c) 2009-2013 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
// !XXX when adding new methods to this mixing need to also update the 
// `setupLockableTree` method in the Sch.mixin.Lockable
Ext.define("Sch.mixin.FilterableTreeView", {
    
    initTreeFiltering : function () {
        var doInit  = function () {
            var treeStore       = this.up('tablepanel').store;
            
            this.mon(treeStore, 'nodestore-datachange-start', this.onFilterChangeStart, this);
            this.mon(treeStore, 'nodestore-datachange-end', this.onFilterChangeEnd, this);
            
            this.mon(treeStore, 'filter-clear', this.onFilterCleared, this);
            this.mon(treeStore, 'filter-set', this.onFilterSet, this);
            
            this.mon(treeStore, 'forcedrefresh', this.onForcedRefresh, this)
        };
        
        if (this.rendered)
            doInit.call(this);
        else
            this.on('beforerender', doInit, this, { single : true });
    },
    
    
    onForcedRefresh : function () {
        this.focusRow       = function () {}
        
        this.refresh()
        
        delete this.focusRow
    },
    
    
    onFilterChangeStart : function () {
        Ext.suspendLayouts();
    },
    
    
    onFilterChangeEnd : function () {
        Ext.resumeLayouts(true);
    },
    
    
    onFilterCleared : function () {
        delete this.toggle;
        
        var el          = this.getEl();
        
        if (el) el.removeCls('sch-tree-filtered');
    },
    
    
    onFilterSet : function () {
        this.toggle     = function () {};
        
        var el          = this.getEl();
        
        if (el) el.addCls('sch-tree-filtered');
    }
});