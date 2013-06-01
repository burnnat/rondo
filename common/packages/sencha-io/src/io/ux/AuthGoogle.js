/**
* Default Google login panel.  Ext.io.Controller will automatically display this panel if the application is configured to use Google as its login type. 
*
*/
if (!Ext.getVersion('extjs')) {
    Ext.define("Ext.io.ux.AuthGoogle", {
        extend: 'Ext.Container',
        requires: ["Ext.TitleBar","Ext.form.Panel", "Ext.form.FieldSet", "Ext.field.Password", "Ext.field.Email"],




   /**
     * @event loginUser
     * Fired when the user has entered their auth credentials.
     * {Ext.io.Controller} listens for this event and will attempt to login 
     * the user with the passed credentials. 
     * @param {Object} auth Key/values given by the user to authenticate with.
     */

    /**
      * @event cancel
      * Fired when the user doesn't want to login.
      * {Ext.io.Controller} listens for this event and will 
      * close the login pannel.
      */


        /**
        * @private
        * config
        */
        config: {
            fullscreen: true,
           
            control: {
                "button[action=cancellogin]": {
                    tap: "hideLogin"
                }
            },
            items: [
                {
                    docked: 'top',
                    xtype: 'titlebar',
                    title: 'Login',
                    items: [
                    {
                        text: "cancel",
                        action: "cancellogin"
                    }
                    ]
                },
                {
                  xtype: "panel",
                  html: "To use this application please sign in with your Google account.",
                  padding: "10",
                  align: "center"
                },
                {
                  xtype: "button",
                  text: "Login with Google",
                  disabled: true,
                  width: "80%",
                  action: "googlelogin",
                  ui: 'action',
                  margin: "10",
                  align: "center"
                }
            ]
        },
        
        /**
        * Login button tapped
        */
        loginButtonTapped: function(button) {
          console.log("argum", arguments);
          button.setDisabled(true);    
          this.setMasked({
                    xtype: 'loadmask',
                    message: 'Loading Google',
                    indicator: true
          });
          this.config.controller.saveCurrentPath();
          document.location.href=this.redirectUrl;
        },


        /**
        * Initialize
        */
        initialize: function() {
            var googleConf = this.config.group.getData().auth.google;

            
            var googleConfAppId = googleConf.appId;

            this.redirectUrl = "https://accounts.google.com/o/oauth2/auth?" + Ext.Object.toQueryString({
                redirect_uri: window.location.protocol + "//" + window.location.host + window.location.pathname,
                client_id: googleConfAppId,
                response_type: 'code',
                type: "web_server",
                scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
                bustCache: new Date().getTime()
            });
            var button = this.query("button[action=googlelogin]")[0];
            
            if(button) {
              button.on({
                tap:  this.loginButtonTapped,
                scope: this
              });
              button.setDisabled(false);
            } else {
              console.error("Could not find a button[action=googlelogin] in the AuthGoogle view.  User won't be able to login.");
            }
            
        },


        /**
        * Reset the form to its default state.
        */
        resetForm: function() {
        //NA
        },


        /**
        * {Ext.io.Controller} will call this method when login fails.
        */
        showLoginErrors: function() {
            //NA //Ext.Msg.alert('Login Error', 'Invalid username or passsword', Ext.emptyFn);
        },


        /**
        * @private
        */
        hideLogin: function() {
            this.fireEvent("cancel");
        }


    });
}