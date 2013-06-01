/**
* Default Github login panel.  Ext.io.Controller will automatically display this panel if the application is configured to use Github as its login type. 
*
*/
if (!Ext.getVersion('extjs')) {
    Ext.define("Ext.io.ux.AuthGithub", {
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
                  html: "To use this application please sign in with your Github account.",
                  padding: "10",
                  align: "center"
                },
                {
                  xtype: "button",
                  text: "Login with Github",
                  disabled: true,
                  width: "80%",
                  action: "githublogin",
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
                    message: 'Loading Github',
                    indicator: true
          });
          this.config.controller.saveCurrentPath();
          document.location.href=this.redirectUrl;
        },


        /**
        * Initialize
        */
        initialize: function() {
            var githubConf = this.config.group.getData().auth.github;

            
            var githubConfAppId = githubConf.appId;

            this.redirectUrl = "https://github.com/login/oauth/authorize?" + Ext.Object.toQueryString({
                redirect_uri: window.location.protocol + "//" + window.location.host + window.location.pathname,
                client_id: githubConfAppId,
                bustCache: new Date().getTime()
            });
            
            var button = this.query("button[action=githublogin]")[0];
            
            if(button) {
              button.on({
                tap:  this.loginButtonTapped,
                scope: this
              });
              button.setDisabled(false);
            } else {
              console.error("Could not find a button[action=githublogin] in the AuthGithub view.  User won't be able to login.");
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