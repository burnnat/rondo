/*

Siesta 2.0.1
Copyright(c) 2009-2013 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Ext.define('Siesta.Harness.Browser.UI.ResultPanel', {
    extend : 'Ext.Panel',
    alias  : 'widget.resultpanel',

//    requires        : [
//        'Siesta.Harness.Browser.UI.AssertionGrid',
//        'Siesta.Harness.Browser.UI.DomContainer'
//    ],

    slots : true,

    test          : null,
    testListeners : null,

    maintainViewportSize : true,

    viewDOM      : false,
    canManageDOM : true,

    isStandalone : false,
    showToolbar  : true,
    title        : '&nbsp;',
    style        : 'background:transparent',
    bodyStyle    : 'background:transparent',
    minWidth     : 100,
    layout       : 'border',

    sourceButton     : null,
    filterButton     : null,
    inspectionButton        : null,

    initComponent : function () {
        var me = this;

        this.addEvents('viewdomchange');

        Ext.apply(this, {
            cls : 'tr-container',

            items : [
                // a card container
                {
                    region     : 'center',
                    slot       : 'cardContainer',
                    xtype      : 'container',
                    layout     : {
                        type           : 'card',
                        deferredRender : true
                    },
                    activeItem : 0,
                    minWidth   : 100,

                    items : [
                        // grid with assertion
                        {
                            xtype : 'assertiongrid',
                            slot  : 'grid',

                            isStandalone : this.isStandalone,
                            listeners    : {
                                itemdblclick : this.onAssertionDoubleClick,
                                scope        : this
                            },

                            tbar : {
                                cls         : 'resultpanel-toolbar',
                                padding     : '10 0',
                                defaults    : {
                                    cls         : 'light-button',
                                    tooltipType : 'title',
                                    scope       : this,
                                    margin      : '0 5'
                                },
                                items       : !this.showToolbar ? null : [
                                    {
                                        text    : 'Re-run test',
                                        height  : 28,
                                        margin  : '0 5 0 10',
                                        cls     : 'green-button',
                                        handler : this.onRerun,
                                        style   : 'font-size:1.2em'
                                    },
                                    '->',
                                    this.sourceButton = new Ext.Button({
                                        tooltip      : 'View source',
                                        action       : 'view-source',
                                        iconCls      : 'icon-file',
                                        tooltipType  : 'title',
                                        enableToggle : true,
                                        pressed      : false,
                                        disabled     : true,
                                        handler      : function (btn) {
                                            if (btn.pressed) {
                                                this.showSource();
                                            }
                                        }
                                    }),
                                    {
                                        tooltip : 'Toggle DOM visible',
                                        iconCls : 'icon-screen',
                                        handler : function (btn) {
                                            this.setViewDOM(!this.viewDOM);
                                        }
                                    },

                                    this.filterButton = new Ext.Button({
                                        tooltip     : 'Show only failed',
                                        iconCls     : 'icon-bug',
                                        tooltipType : 'title',

                                        enableToggle : true,
                                        handler      : this.onAssertionFilterClick
                                    }),
                                    this.inspectionButton = new Ext.Button({
                                        iconCls      : 'icon-search',
                                        tooltip      : 'Toggle Ext Dom Inspector',
                                        tooltipType  : 'title',
                                        handler      : this.toggleInspectionMode,
                                        enableToggle : true
                                    })
                                ]
                            }
                        },
                        // eof grid with assertion
                        {
                            xtype      : 'panel',
                            slot       : 'source',
                            autoScroll : true,
                            cls        : 'test-source-ct',
                            __filled__ : false,
                            listeners  : {
                                render : function() {
                                    var button = new Ext.Button({
                                        renderTo        : this.el,
                                        floating        : true,
                                        width           : 80,
                                        style           : 'left:auto !important;right:20px !important;top:5px !important;',
                                        text            : 'Close',
                                        handler         : function (btn) {
                                            me.hideSource();
                                        }
                                    })
                                    
                                    // w/o this button is centered in FF
                                    if (Ext.isGecko) setTimeout(function () {
                                        if (!button.destroyed) button.el.setStyle({
                                            left        : 'auto',
                                            right       : '20px',
                                            top         : '5px'
                                        })
                                    }, 0)
                                }
                            }
                        }
                    ]
                },
                {
                    xtype  : 'domcontainer',
                    region : 'east',

                    split : true,

                    bodyStyle : 'text-align : center',

                    slot     : 'domContainer',
                    stateful : true,             // Turn off for recursive siesta demo

                    id    : this.id + '-domContainer',
                    width : '50%',
                    cls   : 'siesta-domcontainer',

                    collapsed : !this.viewDOM
                }
            ]
        })

        this.callParent()

        this.slots.domContainer.on({
            expand   : this.onDomContainerExpand,
            collapse : this.onDomContainerCollapse,

            startinspection : function () {
                this.inspectionButton.toggle(true);
            },
            stopinspection  : function () {
                this.inspectionButton.toggle(false);
            },

            scope : this
        });


    },

    
    // This method makes sure that the min width of the card panel is respected when
    // the width of this class changes (after resizing Test TreePanel).
    ensureLayout  : function () {
        var availableWidth = this.getWidth();
        var cardPanel = this.slots.cardContainer;
        var domContainer = this.slots.domContainer;
        var domContainerWidth = domContainer.getWidth();
        var minimumForCard = cardPanel.minWidth + 20; // Some splitter space

        if (availableWidth - domContainerWidth < minimumForCard) {
            domContainer.setWidth(Math.max(0, availableWidth - minimumForCard));
        }
    },


    showSource : function (lineNbr) {
        var slots = this.slots
        var cardContainer = slots.cardContainer
        var sourceCt = slots.source
        var test = this.test

        // Do this first since rendering is deferred
        cardContainer.layout.setActiveItem(sourceCt);

        var sourceCtEl = sourceCt.el

        this.sourceButton && this.sourceButton.toggle(true);

        if (test && !sourceCt.__filled__) {
            sourceCt.__filled__ = true;

            sourceCt.update(
                Ext.String.format('<pre class="brush: javascript;">{0}</pre>', test.getSource())
            );

            SyntaxHighlighter.highlight(sourceCtEl);
        }

        sourceCtEl.select('.highlighted').removeCls('highlighted');

        if (arguments.length === 0) {
            // Highlight all failed rows
            Ext.each(test.getFailedAssertions(), function (assertion) {
                if (assertion.sourceLine != null) sourceCtEl.select('.line.number' + assertion.sourceLine).addCls('highlighted');
            });
        }
        else {
            // Highlight just a single row (user double clicked a failed row)
            sourceCtEl.select('.line.number' + parseInt(lineNbr, 10)).addCls('highlighted');
        }

        if (arguments.length && lineNbr != null) {
            var el = sourceCtEl.down('.highlighted');
            el && el.scrollIntoView(sourceCtEl);
        }
    },


    hideSource : function (btn) {
        var slots = this.slots
        var cardContainer = slots.cardContainer

        cardContainer.layout.setActiveItem(slots.grid);
        this.sourceButton && this.sourceButton.toggle(false);
    },


    setViewDOM : function (value) {
        var domContainer = this.slots.domContainer

        if (value)
            domContainer.expand(false)
        else
            domContainer.collapse(Ext.Component.DIRECTION_RIGHT, false)
    },


    onDomContainerCollapse : function () {
        this.viewDOM = false;
        this.fireEvent('viewdomchange', this, false);
    },


    onDomContainerExpand : function () {
        this.viewDOM = true;
        this.fireEvent('viewdomchange', this, true);
    },


    onRerun : function () {
        this.fireEvent('rerun', this);
    },


    showTest : function (test, assertionsStore) {
        this.slots.source.__filled__ = false;

        this.filterButton && this.filterButton.toggle(false)
        this.hideSource();

        this.sourceButton && this.sourceButton.enable()

        this.test = test

        var url = test.url

        Ext.suspendLayouts();

        this.slots.grid.showTest(test, assertionsStore)
        this.slots.domContainer.showTest(test, assertionsStore)

        // This triggers an unnecessary layout recalc
        this.setTitle(url);

        Ext.resumeLayouts();
    },


    onAssertionFilterClick : function (btn) {
        var assertionsStore = this.slots.grid.store;

        // need this check for cases when users clicks on the button
        // before running any test - in this case assertion grid will have an empty Ext.data.TreeStore instance
        if (!assertionsStore.filterTreeBy) return

        if (btn.pressed) {
            assertionsStore.filterTreeBy(function (resultRecord) {
                var result = resultRecord.getResult()

                // this covers the cases when "result" is a summary record, diagnostic record, etc
                return !result.passed
            })
        } else {
            assertionsStore.clearTreeFilter()
        }
    },


    alignIFrame : function () {
        this.slots.domContainer.alignIFrame()
    },


    hideIFrame : function () {
        this.slots.domContainer.hideIFrame()
    },


    clear : function () {
        this.slots.grid.clear()
    },


    onAssertionDoubleClick : function (view, record) {
        var result = record.getResult()

        if ((result instanceof Siesta.Result.Assertion) && !result.isPassed(true)) {
            this.showSource(result.sourceLine);
        }
    },

    toggleInspectionMode : function (btn) {
        this.slots.domContainer.toggleInspectionMode(btn.pressed);
    }
});

// To avoid the DOM container splitter getting stuck
Ext.dd.DragTracker.override({
    tolerance : 0
});