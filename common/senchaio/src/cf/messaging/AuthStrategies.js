/**
 * @private
 *
 */
Ext.define('Ext.cf.messaging.AuthStrategies', {
    requires: [
        'Ext.cf.util.UuidGenerator',
        'Ext.cf.util.Md5'
    ],

    statics: {

        /**
         * @private
         * common oauth2 strategy
         *
         * @param {Object} provider
         * @param {Object} group
         * @param {Object} params
         * @param {Function} callback
         * @param {Object} scope
         *
         */
        oauth2: function (provider, group, params, callback, scope) {

            var fn = function (result) {
                if (result.status == "success" && result.value._bucket && result.value._bucket == "Users") {
                    callback.call(scope, result.value, result.sid);
                } else {
                    callback.call(scope, null, null, result.error);
                }
            };


            params.groupId = group.getId();
            params.provider = provider;

            Ext.io.Io.getMessagingProxy(function (messaging) {
                messaging.getService(
                    { name: "GroupManager" },
                    function (groupManager, err) {
                        if (groupManager) {
                            groupManager.loginUser(fn, params);
                        } else {
                            callback.call(scope, null, null, err);
                        }
                    },
                    this
                );
            }, this);
        },

        strategies: {
            /**
             * Digest strategy
             *
             * @param {Object} group
             * @param {Object} params
             * @param {Function} callback
             * @param {Object} scope
             *
             */
            'senchaio': function (group, params, callback, scope) {
                var parameters = {
                    email: params.email,
                    password: params.password,
                    groupId: group.getId(),
                    provider: "senchaio"
                };

                Ext.io.Io.getMessagingProxy(function (messaging) {
                    messaging.getService(
                        {name: "GroupManager"},
                        function (groupManager, err) {
                            if (groupManager) {
                                groupManager.loginUser(function (result) {
                                    if (result.status == "success" && result.value._bucket && result.value._bucket == "Users") {
                                        callback.call(scope, result.value, result.sid);
                                    } else {
                                        callback.call(scope, null, null, result.error);
                                    }
                                }, parameters);
                            } else {
                                callback.call(scope, null, null, err);
                            }
                        },
                        this
                    );
                }, this);
            },


            /**
             * Facebook
             *
             * @param {Object} group
             * @param {Object} params
             * @param {Function} callback
             * @param {Object} scope
             *
             */
            facebook: function (group, params, callback, scope) {
                Ext.cf.messaging.AuthStrategies.oauth2("facebook", group, params, callback, scope);
            },

            /**
             * Github
             *
             * @param {Object} group
             * @param {Object} params
             * @param {Function} callback
             * @param {Object} scope
             *
             */
            github: function (group, params, callback, scope) {
                Ext.cf.messaging.AuthStrategies.oauth2("github", group, params, callback, scope);
            },

            /**
             * Google
             *
             * @param {Object} group
             * @param {Object} params
             * @param {Function} callback
             * @param {Object} scope
             *
             */
            google: function (group, params, callback, scope) {
                Ext.cf.messaging.AuthStrategies.oauth2("google", group, params, callback, scope);
            },

            /**
             * Twitter
             *
             * @param {Object} group
             * @param {Object} params
             * @param {Function} callback
             * @param {Object} scope
             *
             */
            twitter: function (group, params, callback, scope) {

                var fn = function (result) {
                    if (result.status == "success" && result.value._bucket && result.value._bucket == "Users") {
                        callback.call(scope, result.value, result.sid);
                    } else if (result.status == "authToken") {
                        callback.call(scope, null, result.sid, null);
                    } else {
                        callback.call(scope, null, null, result.error);
                    }
                };

                params.groupId = group.getId();
                params.provider = "twitter";

                Ext.io.Io.getMessagingProxy(function (messaging) {
                    messaging.getService(
                        { name: "GroupManager" },
                        function (groupManager, err) {
                            if (groupManager) {
                                groupManager.loginUser(fn, params);
                            } else {
                                callback.call(scope, null, null, err);
                            }
                        },
                        this
                    );
                }, this);
            }

        }
    }
});
