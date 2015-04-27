/**
 *
 */
Ext.define('Rondo.view.main.Main', {
    extend: 'Ext.navigation.View',

    require: [
        'Ext.Button',
        'Ext.Viewport',
        
        'Rondo.view.Menu',
        'Rondo.view.Sketches'
    ],

    items: [
        {
            xtype: 'sketches'
        }
    ],

    navigationBar: {
        items: {
            xtype: 'button',
            iconCls: 'list',
            align: 'right',
            handler: function() {
                Ext.Viewport.toggleMenu('right');
            }
        }
    },

    initialize: function() {
        Ext.Viewport.setMenu(
            new Rondo.view.Menu(),
            { side: 'right' }
        );
    }
});
