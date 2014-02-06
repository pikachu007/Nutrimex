var adf                    = window.adf                 || {};
adf.mf                     = adf.mf                     || {};
adf.mf.api                 = adf.mf.api                 || {};
adf.mf.el                  = adf.mf.el                  || {};
adf.mf.locale              = adf.mf.locale              || {};
adf.mf.log                 = adf.mf.log                 || {};
adf.mf.resource            = adf.mf.resource            || {};
adf.mf.util                = adf.mf.util                || {};

adf.mf.internal            = adf.mf.internal            || {};
adf.mf.internal.api        = adf.mf.internal.api        || {};
adf.mf.internal.el         = adf.mf.internal.el         || {};
adf.mf.internal.el.parser  = adf.mf.internal.el.parser  || {};
adf.mf.internal.locale     = adf.mf.internal.locale     || {};
adf.mf.internal.log        = adf.mf.internal.log        || {};
adf.mf.internal.mb         = adf.mf.internal.mb         || {};
adf.mf.internal.perf       = adf.mf.internal.perf       || {};
adf.mf.internal.perf.story = adf.mf.internal.perf.story || {};
adf.mf.internal.resource   = adf.mf.internal.resource   || {};
adf.mf.internal.util       = adf.mf.internal.util       || {};


/* Settings for this page */
var LoginManagerSettings = LoginManagerSettings || {};

LoginManagerSettings.loginBtnId            = 'div#loginButton';
LoginManagerSettings.loginBtn_pressedClass = "amx-commandButton-pressed";
LoginManagerSettings.showRememberMe        = false;

try
{
   /*
    * Used to display an Oracle specific error message.
    */
   function displayOracleErrorMessage(msg, title)
   {
	  adf.mf.login.hideBusy();
      alert(msg);
   };
   
   /*
    * Used to notify us that an alert dialog was opened.  We assume this is an
    * error message from the ACS so we dismiss the busy indicator.
    */
   function onADFMobileNativeDialogDisplayed()
   {
	   adf.mf.login.hideBusy();
   };

   /*
    *  LoginButton - the constructor for the login button - this object will
    *  handle events for the login button.
    */
   function LoginButton(myParent)
   {
      try
      {
         this.parent = myParent;
         
         this.$node = function()
         {
            var $loginButton = $(this.parent._loginBtnId);
            if($loginButton == null)
            {
               alert(adf.mf.resource.getInfoString("AMXInfoBundle", "MSG_LOGINBUTTON_MISSING"));
               return;
            }
            return $loginButton;
         };
         
         this.ontouchstart = function(event)
         {
            event.preventDefault();
            
            this.$node().addClass(this.parent._loginBtnId_pressedClass);
         };
         
         this.ontouchmove = function(event)
         {
            event.preventDefault();
            
            var $loginButton = this.$node();
            
            if (this.parent.testHit($loginButton, this.parent.getActiveTouch(event) ) )
            {
               $loginButton.addClass(this.parent._loginBtnId_pressedClass);
            }
            else
            {
               $loginButton.removeClass(this.parent._loginBtnId_pressedClass);
            }
         };
         
         this.ontouchend = function(event)
         {
            event.preventDefault();
            
            var $loginButton = this.$node();
            
            adf.mf.login.onLogin();
            $loginButton.removeClass(this.parent._loginBtnId_pressedClass);
         };
         
         this.init = function()
         {
            var $loginButton = this.$node();
            $loginButton.bind('touchmove',  function(e){adf.mf.login.loginButton.ontouchmove(e.originalEvent);});
            $loginButton.bind('touchend',   function(e){adf.mf.login.loginButton.ontouchend(e.originalEvent);});
            $loginButton.bind('touchstart', function(e){adf.mf.login.loginButton.ontouchstart(e.originalEvent);});
         };
      }
      catch(e)
      {
         alert(adf.mf.resource.getInfoString("AMXInfoBundle", "MSG_LOGINBUTTON_CTOR_FAILED", e));
      }
   }/* end of LoginButton */
   

   /**
    * LoginManager - constructor that creates an object that is used to
    *   manage the state of the login page.
    */
   function LoginManager()
   {
      /* Loging Properties */
      this._loginBtnId              = LoginManagerSettings.loginBtnId;
      this._loginBtnId_pressedClass = LoginManagerSettings.loginBtn_pressedClass;
      this._showRememberMe          = LoginManagerSettings.showRememberMe;
      this._rememberMe              = false;
      this._isMTAware               = false;

      /* 
       * Set the multi-tenant aware flag.
       */
      this.setMTAware = function(newValue)
      {
         this._isMTAware = newValue;
      };

      /*
       * These functions allow you to show and hide the remember me feature.
       */
      this.showRememberMe = function()
      {
         this._showRememberMe = true;
         this.updateRememberMe();
      };
      this.hideRememberMe = function()
      {
         this._showRememberMe = false;
         this.updateRememberMe();
      };

      /*
       * These functions allow you to set and get the current
       * value of the remember me setting.  By default we do
       * not remember.  This could be read from a setting at
       * some point.
       */
      this.getRememberMe = function()
      {
         return this._rememberMe;
      };
      this.setRememberMe = function(newValue)
      {
         this._rememberMe = newValue;
      };
      this.toggleRememberMe = function()
      {
         var rm = this.getRememberMe();
         this.setRememberMe(!rm);
         this.updateRememberMe();
      };
      this.updateRememberMe = function()
      {
         if(this._showRememberMe)
         {
            $("#rememberMePanel").show();
            if (this.getRememberMe())
            {
               $("#rememberMe").addClass("on").removeClass("off");;
            }
            else
            {
               $("#rememberMe").addClass("off").removeClass("on");;
            }
         }
         else
         {
            $("#rememberMePanel").hide();
         }
      };
      
      /* 
       * @return the user name
       */
      this.getUserName = function()
      {
         return $('#username').val();
      };
      
      /*
       * @return the user password
       */
      this.getPassword = function()
      {
         return $('#password').val();
      };
      
      /*
       * (PRIVATE) Perform the actual login process.
       */
      this._login = function()
      {
         try
         {
            var username   = this.getUserName();
            var password   = adf.mf.util.obfuscate(this.getPassword());
            var rememberMe = this.getRememberMe();
            
            if((username != undefined) && (password != undefined) && (username != "") && (password != ""))
            {
               if((typeof adf != "undefined") && (typeof adf.mf.api.invokeSecurityMethod != "undefined"))
               {
                  adf.mf.api.invokeSecurityMethod("login", username, password, "");
               }
               else
               {
            	  adf.mf.login.hideBusy();
                  alert(adf.mf.resource.getInfoString("AMXInfoBundle", "MSG_LOGINAPI_MISSING"));
               }
            }
            else
            {
               adf.mf.login.hideBusy();
               alert(adf.mf.resource.getInfoString("AMXInfoBundle", "MSG_USERNAME_PASSWORD_MISSING"));
            }
         }
         catch(e)
         {
        	adf.mf.login.hideBusy();
            alert(adf.mf.resource.getInfoString("AMXInfoBundle", "MSG_LOGIN_FAILED", e.description));
         }
      };
      
      /*
       * Hide the login busy cursor
       */
      this.hideBusy = function()
      {
//         var $div = $("#amx-loading");
         
//         $div.removeClass("showing");    // get rid of opacity:1
//         $div.addClass("hiding");        // animate to opacity:0
         
//         $div.removeClass("hiding");     // no longer animating
//         $div.addClass("hidden");        // set display:none
      };
      
      /*
       * Show the login busy cursor
       */
      this.showBusy = function()
      {
//         var $div = $("#amx-loading");
         
//         $div.removeClass("hidden");        // get rid of the display:none
//         $div.addClass("beforeShowing");    // now at display:block but with opacity:0
         
//         $div.removeClass("beforeShowing"); // get rid of opacity:0
//         $div.addClass("showing");          // animate to opacity:1
      };
      
      /*
       * (PUBLIC) Function to perform the login
       */
      this.onLogin = function()
      {
         try
         {
        	adf.mf.login.showBusy();
            setTimeout("adf.mf.login._login();",5); // Then perform the login
         }
         catch(e)
         {
            alert(adf.mf.resource.getInfoString("AMXInfoBundle", "MSG_ONLOGIN_FAILED", e.description));
            adf.mf.login.hideBusy();
         }
      };
      
      /*
       * Set the focus on the user name field.
       */
      this.focusUsername = function(event)
      {
         document.getElementById("username").focus();
      };
      
      /*
       * Set the focus on the user password field.
       */
      this.focusPassword = function(event)
      {
         document.getElementById("password").focus();
      };
      
      /*
       * Touch event handlers
       */
      this.touchStart = function(event)
      {
         $("#password").blur(); // dismiss keyboard
      };
      this.touchEnd = function(event)
      {
         //event.preventDefault();
      };
      this.touchMove = function(event)
      {
         event.preventDefault();
      };
      this.touchCancel = function(event)
      {
         //event.preventDefault();
      };
      
      /*
       * Initialization process
       */
      this.init = function (success, failure)
      {
         this.loginButton.init();
         this.updateRememberMe();
         $("#username").blur();
         adf.mf.api.invokeSecurityMethod("getLoginViewInitData", null, null, null, 
   			  function(request, response)
   			  {
   		  	     var initData = response[0];
   		  	     adf.mf.api.login.initialSettings = initData;		 
   		   		 success(request, response);
   	  		  },
   	  		  function(request, response)
 			  {
 		  	     failure(request, response);
 	  		  });
      };
      
      this.getActiveTouch = function(event)
      {
         if(event.touches && event.touches.length>0)
         {
            return event.touches[0];
         }
         else if(event.changedTouches && event.changedTouches.length>0)
         {
            return event.changedTouches[0];
         }
         return null;
      };
      
      this.testHit = function($node,touch)
      {
         if(touch === null)
         {
            return false;
         }
         if($node === null)
         {
            return false;
         }
         
         var x        = touch.clientX;
         var y        = touch.clientY;
         var t        = $node.position().top;
         var l        = $node.position().left;
         var w        = $node.width();
         var h        = $node.height();
         var isInNode = false;
         
         if((x<(l+w)) && (x>l))
         {
            if((y<(t+h)) && (y>t))
            {
               isInNode = true;
            }
         }
         if(isInNode)
         {
            return true;
         }
         return false;
      };
      
      try
      {
         this.loginButton = new LoginButton(this);
      }
      catch(e)
      {
         alert(adf.mf.resource.getInfoString("AMXInfoBundle", "MSG_NEW_LOGINBUTTON_FAILED", e));
      }
   }; /* end of the LoginManager definition */
   adf.mf.login = new LoginManager();
   
   /**
    * LoginAPI - constructor that creates an object that is used to
    *   manage the PUBLIC API methods pertaining to login page.
    */
   function LoginAPI()
   {
      /* Login API Properties */
      this.initialSettings = null;
      
      /*
       * (PUBLIC) Function to check if application login or otherwise
       */
      this.isAppLevelLogin = function()
      {
    	  return (this.initialSettings != null)? this.initialSettings.isAppLevelLogin : false;
      };
           
      /*
       * (PUBLIC) Function to get feature name
       */
      this.getFeatureName = function()
      {
    	  return (this.initialSettings != null)? this.initialSettings.featureName : "";
      };
      
      /*
       * (PUBLIC) Function to get application name
       */
      this.getApplicationName = function()
      {    
    	  return (this.initialSettings != null)? this.initialSettings.applicationName : "";
      };
      
      /*
       * (PUBLIC) Function to get current username
       */
      this.getCurrentUsername = function()
      {     
    	  return (this.initialSettings != null)? this.initialSettings.currentUsername : "";
      };
      
      /*
       * (PUBLIC) Function to get connection name
       */
      this.getConnectionName= function()
      {      
    	  return (this.initialSettings != null)? this.initialSettings.connectionName : "";
      };      
   }; /* end of the Login API definition */
   
   //Create a single LoginAPI object.
   adf.mf.api.login = new LoginAPI();
   console.log("adf.mf.api.login has now been configured.");
}
catch(e)
{
   alert(adf.mf.resource.getInfoString("AMXInfoBundle", "MSG_ERROR_IN_SCRIPT", loadStage, e.description));
}