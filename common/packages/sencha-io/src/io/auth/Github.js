/**
 * @private
 * github authentication method.
 */
Ext.define('Ext.io.auth.Github', {
    extend: 'Ext.io.auth.Base',

    config: {
        loginView: "Ext.io.ux.AuthGithub",

        authButtonConfig: {
            authType: "github",
            text: "Github"
        },
        oauthUrl: "",

        initComplete: false
    },

    constructor: function (config) {
        this.initConfig(config);
    },


    /**
     * @private
     */
    init: function (group, callback, scope) {
        if (this.getInitComplete()) {
            callback.call(scope);
        }

        var args = {
            groupId: group.getId(),
            provider: "github",
            callbackPath: this.getCallbackPath()
        };

        var fn = Ext.bind(function (result) {
            this.setOauthUrl(result.returnuri);
            this.setInitComplete(true);
            callback.call(scope);
        }, this);

        Ext.io.Io.getMessagingProxy(function (messaging) {
            messaging.getService({
                name: "GroupManager"
            },

            function (groupManager, err) {
                if (groupManager) {
                    groupManager.loginUser(fn, args);
                } else {
                    callback.call(scope, err);
                }
            },
            this);
        }, this);

    },

    getCallbackPath: function () {
        return document.location.href;
    },


    checkAuth: function (group, callback, scope) {
        var opts = Ext.Object.fromQueryString(document.location.search);
        var code = opts["code"];
        if (code) {
            callback.call(scope, true, {
                provider: "github",
                callbackPath: this.getCallbackPath(),
                query: {
                    code: code
                }
            });
        } else {
            callback.call(scope, false, {});
        }
    },


    onAuth: function (auth, callback, scope) {
        this.restorePreviousPath();
        callback.call(scope, auth);
    },

    logout: function (callback, scope) {
        callback.call(scope, true, {});
    }
});
