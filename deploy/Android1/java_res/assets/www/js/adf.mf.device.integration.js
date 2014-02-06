/*
 *
 * ADF Mobile v1.1 (iOS and Android)
 * 
 * http://www.oracle.com/technetwork/developer-tools/adf/overview/adf-mobile-096323.html
 * 
 * Copyright (c) 2011 Oracle.
 * All rights reserved. 
 * 
 */

try
{
    /* Helper code to resolve anonymous callback functions,

    If the function callback can be resolved by name it is returned unaltered.
    If the function is defined in an unknown scope and can't be resolved, an internal reference to the function is added to the internal map.

    Callbacks added to the map are one time use only, they will be deleted once called.  

    example 1:
    function myCallback(){};
    fString = GetFunctionName(myCallback);
    - result, the function is defined in the global scope, and will be returned as is because it can be resolved by name.

    example 2:
    fString = GetFunctionName(function(){};);
    - result, the function is defined in place, so it will be returned unchanged.

    example 3:
    function myMethod()
    {
        var funk = function(){};
        fString = GetFunctionName(funk);
    }
    - result, the function CANNOT be resolved by name, so an internal reference wrapper is created and returned.
    */
   window._anomFunkMap = window._anomFunkMap || {};
   window._anomFunkMapNextId = window._anomFunkMapNextId || 0;

   window.anomToNameFunk = window.anomToNameFunk || function(fun)
   {
      var funkId = "f" + _anomFunkMapNextId++;
      var funk = function()
      {
         fun.apply(this,arguments);
         _anomFunkMap[funkId] = null;
         delete _anomFunkMap[funkId];
      }
      _anomFunkMap[funkId] = funk;

      return "_anomFunkMap." + funkId;
   };

   window.GetFunctionName = window.GetFunctionName || function(fn)
   {
      if (typeof fn === "function") {
         var name= fn.name;
         if (!name) {
            var m = fn.toString().match(/^\s*function\s+([^\s\(]+)/);
            name= m && m[1];
         }
         if (name && (window[name] === fn)) {
            return name;
         } else {
            return anomToNameFunk(fn);
         } 
      }else {
         return null;
      }
   };

   // Page level API 'namespace' objects - 'window' is the same as
   // using 'var adf;'...
   window.adf = window.adf || {};
   window.adf.mf = window.adf.mf || {};
   window.adf.mf.internal = window.adf.mf.internal || {};
   window.adf.mf.internal.di = window.adf.mf.internal.di || {};
   window.adf.mf.internal.di.api = window.adf.mf.internal.di.api || {};
   window.getAdfmfApiRoot = function()
   {
      return adf.mf.internal.di.api;
   }
   // Location for all the adf.pg functions is container.internal.device.integration
   window.container = window.container || {};
   window.container.internal = window.container.internal || {};
   window.container.internal.device = window.container.internal.device || {};
   window.container.internal.device.integration = window.container.internal.device.integration || {};
   window.containerInternalRoot = window.containerInternalRoot || function()
   {
      return container.internal.device.integration;
   }
   window.containerInternalRootDescription = window.containerInternalRootDescription || function()
   {
      return "container.internal.device.integration";
   }
   containerInternalRoot().getAdfmfPhoneGap = containerInternalRoot().getAdfmfPhoneGap || function ()
   {
      if(typeof(Cordova) == 'undefined')
      {
         alert("Cordova is undefined.");
         return null;
      }
      return Cordova;
   }

   /**
    * The 'adf.pg' varable is used to denote that we are running on a phonegap device and
    *        the user interface layer should act appropriately.
    */
   window.adf.pg = "RUNNING ON A PHONEGAP DEVICE";

   /**
    * Gets the AMX Includes specified for this feature.
    */
   containerInternalRoot().getAmxIncludeList = function(successCB, failureCB)
   {
      var cordovaRequest = new CordovaRequest({params:[]},
                                              function(request, result){ successCB(result) },
                                              failureCB);
      cordovaRequest.setPlugin("ADFMobileShell");
      cordovaRequest.setMethod("getAmxIncludeList");
      cordovaRequest.execute();
   };

   /**
    * Represents the API for interacting with features in the ADF Mobile Container.
    */
   window.ADFMobileFeatures = function()
   {
      this.inProgress = false;
      this.records = new Array();
      this.hideNavigationBar_errorCallback = null;
      this.showNavigationBar_errorCallback = null;
      this.registerActivationHandler_errorCallback = null;
   };

   /**
    * The method to register a function as a handler for activation notices.
    */
   ADFMobileFeatures.prototype.registerActivationHandler = function(scb, ecb) 
   {
      // this is necessary until we fully move ADFMobileFeatures.m to use the passed-in ecb value
      this.registerActivationHandler_errorCallback = null;
      var bErrCallback = (ecb == undefined || ecb == null) ? false : true;
      if (bErrCallback) 
      {
         this.registerActivationHandler_errorCallback = ecb;
      }

      // console.log("creating registerActivationHandler request");
      var cordovaRequest = new CordovaRequest({params:[window.GetFunctionName(scb)]}, function(){/* Don't Care about success. */}, ecb);
      cordovaRequest.setPlugin("ADFMobileFeatures");
      cordovaRequest.setMethod("registerActivationHandler");
      cordovaRequest.execute();
   };

   /**
    * Represents the API for interacting with features in the ADF Mobile Security.
    */
   window.ADFMobileSecurity = function()
   {
   };

   /**
    * The method to authenticate user
    */
   ADFMobileSecurity.prototype.featureLogin = function(username, password, tenantname) 
   {
      var cordovaRequest = new CordovaRequest({params:[username, password, tenantname]}, 
                                              function(){adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "device.integration", "success",
                                                         "featureLogin successful");},
                                              function(){adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "device.integration", "failure",
                                                         "featureLogin failed");});
      cordovaRequest.setPlugin("ADFMobileSecurity");
      cordovaRequest.setMethod("login");
      cordovaRequest.execute();
   };

   /**
    * The method to get initial data for login 
    */
   ADFMobileSecurity.prototype.getLoginViewInitData = function(success, failed)
   {  
      var cordovaRequest = new CordovaRequest({params:[window.GetFunctionName(success)]}, 
    		  								  success,
                                              failed);
      cordovaRequest.setPlugin("ADFMobileSecurity");
      cordovaRequest.setMethod("getLoginViewInitData");
      cordovaRequest.execute();
   };

   /**
    * Represents the API for interacting with the CVM in the ADF Mobile Native Framework.
    */
   window.ADFMobileJava = function()
   {
      this.inProgress = false;
      this.invokeJava_resultsCallback = null;
      this.invokeJava_errorCallback = null;
   };

   /**
    * The method to send a message into the VMChannel
    */
   ADFMobileJava.prototype.invoke = function(passedInMT, request, successCB, errorCB)
   {
      try
      {
         // console.log("creating ADFMobileJava.prototype.invoke request");
         var cordovaRequest = new CordovaRequest(request, successCB, errorCB);
         cordovaRequest.execute();
      }
      catch(e)
      {
         var msg = ("Error in ADFMobileJava.prototype.invoke - error=" + adf.mf.util.stringify(e) + " for request = " + adf.mf.util.stringify(request));

         alert(msg);

         adf.mf.log.Framework.logp(adf.mf.log.level.SEVERE, "device.integration", "invoke",
               ("Error creating nd executing CordovaRequest error = " + msg));
      }
   };

   /**
    * OutstandingRequestList is the implementation for the collection of request currently being processed.
    **/
   OutstandingRequestList = function()
   {
      this.queue      = {};
      this.nextId     = 500;
      this.size       = 0;

      /* return a unique request id */
      this.getUniqueRequestId = function()
      {
         return "CR-" + (++this.nextId);;
      };

      /* echo the outstanding request queue */
      this.showQueue = function()
      {
         try {
            var buf = " ";
            var cnt = 0;

            for(property in this.queue) {
               if((property !== undefined) && (property !== null)) {
                  if((typeof this.queue[property]) != 'function')
                  {
                     buf += ("\"" + property + ":" + this.queue[property].requestId + ":" + this.queue[property].timestamp + "\" ");
                     cnt++;
                  }
               }
            }
            return (" queue:"+cnt+"= [" + buf + "]");
         }
         catch(e)
         {
            return ("--error--");
         }
      };

      /* get (but do not remove) the request associated with the given id */
      this.getRequest = function(/* String */ id)
      {
         return this.queue[id];
      };

      /* insert a new request into the queue */
      this.insert = function(/* CordovaRequest */ cr)
      {
         this.size++;
         this.queue[cr.requestId] = cr;
         // console.log("OutstandingRequestList: insert: request=" + cr.requestId + "/" + cr.timestamp + " -- " + this.showQueue() + " scb="+cr.scb.length);
      };

      /* remove the associated request from the queue */
      this.remove = function(/* String */ id)
      {
         var cr = this.queue[id];

         if(cr === undefined) {
            adf.mf.log.Framework.logp(adf.mf.log.level.SEVERE, "device.integration", "remove",
                  ("Error remvoving CordovaRequest: ERROR in Outstanding Request List ["+id+"] is not found."));
         }
         else {
            if(cr.requestId != id) {
               adf.mf.log.Framework.logp(adf.mf.log.level.SEVERE, "device.integration", "remove",
                     ("Error remvoving CordovaRequest: ERROR in Outstanding Request List queue[" + id + "]/" + cr.timestamp + " is not " + cr.requestId));
            }
            delete this.queue[id];
            // console.log("OutstandingRequestList: remove: id=" + id + " request="+cr.requestId + this.showQueue() + " scb="+cr.scb.length);
         }

         return cr;
      };

      return this;
   };
   adf.mf.internal.processingRequestQueue = new OutstandingRequestList();


   /* Generate the associated success callback to be invoked by Corodova */
   containerInternalRoot().cordovaSuccessCallback = function(/* String */ id)
   {
      var body = "";

      body += "try{ ";
      body += "  var req = adf.mf.internal.processingRequestQueue.remove('" + id + "'); ";
      body += "  if((req != undefined) && (req != null))";
      body += "  {";
      body += "    adf.mf.log.Framework.logp(adf.mf.log.level.FINER, 'adf.mf.device.integration', 'cordovaSuccessCallback', 'Cordova Response Success Callback' + req.requestId);";
      // body += "    console.log('SUCCESS (id / req): " + id + " / ' + req.requestId );";
      body += "    req.success(r);";
      body += "  }else{";
      body += "    adf.mf.log.Framework.logp(adf.mf.log.level.SEVERE, 'adf.mf.device.integration', 'cordovaSuccessCallback', 'Cordova Success Response Handler Error: Request Id (" + id + ") was not found.');";
      body += "  }";
      body += "}catch(e){";
      body += "  adf.mf.log.Framework.logp(adf.mf.log.level.SEVERE, 'adf.mf.device.integration', 'cordovaSuccessCallback', 'Cordova Success Response Handler Error: Request Id (" + id + ") error=' + e);";
      body += "  alert('Cordova Response Success Handler Error:' + e);";
      body += "}";

      return new Function('r', body);
   };

   /* Generate the associated failure callback to be invoked by Corodova */
   containerInternalRoot().cordovaFailureCallback = function(/* String */ id)
   {
      var body = "";

      body += "try{ ";
      body += "  var req = adf.mf.internal.processingRequestQueue.remove('" + id + "'); ";
      body += "  if((req != undefined) && (req != null))";
      body += "  {";
      body += "    adf.mf.log.Framework.logp(adf.mf.log.level.FINER, 'adf.mf.device.integration', 'cordovaFailureCallback', 'Cordova Response Failure Callback' + req.requestId);";
      // body += "    console.log('FAILURE (id / req): " + id + " / ' + req.requestId + ' r=' + adf.mf.util.stringify(r));";
      body += "    req.failure(r);";
      body += "  }else{";
      body += "    adf.mf.log.Framework.logp(adf.mf.log.level.SEVERE, 'adf.mf.device.integration', 'cordovaSuccessCallback', 'Cordova Failure Response Handler Error: Request Id (" + id + ") was not found.');";
      body += "  }";
      body += "}catch(e){";
      body += "  adf.mf.log.Framework.logp(adf.mf.log.level.SEVERE, 'adf.mf.device.integration', 'cordovaFailureCallback', 'Cordova Failure Response Handler Error: Request Id (" + id + ") error=' + e);";
      body += "  alert('Cordova Response Failure Handler Error:' + e);";
      body += "}";

      return new Function('r', body);
   };

   /* Request object used to hold the pending Cordova request that is out being processed */
   CordovaRequest = function(request, success, failed)
   {
      try
      {
         this.timestamp      = "T" + ((new Date()).getTime() % 600000);
         this.requestId      = adf.mf.internal.processingRequestQueue.getUniqueRequestId();
         this.scb            = adf.mf.internal.util.is_array(success)? success : [success];
         this.fcb            = adf.mf.internal.util.is_array(failed)?  failed  : [failed ];
         this.plugin         = "ADFMobileShell";
         this.methodName     = "invokeJavaMethod";
         this.request        = request;

         /**
          * set the plugin name 
          * @param  name 
          **/
         /* void */
         this.setPlugin      = function(name)
         {
            this.plugin      = name;
         };

         /**
          * set the method name 
          * @param  name 
          **/
         /* void */
         this.setMethod      = function(name)
         {
            this.methodName  = name;
         };

         /* internal success callback for this request */
         this.success = function(result)
         {
            try
            {
               if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINER)) 
               {
                  adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "device.integration", "success",
                        "Inside the success callback for request " + this.requestId);
               }

               for(var i = 0; i < this.scb.length; ++i)
               {
                  try
                  {
                     // console.log("START: device.integration.success - request = " + this.requestId + " success callback " + i + " with result = " + result);
                     // adf.mf.internal.perf.start("device.integration.success", "request = " + this.requestId + " success callback " + i);
                     this.scb[i](this.request, result);
                     // adf.mf.internal.perf.stop("device.integration.success", "request = " + this.requestId + " success callback " + i);
                     // console.log("END: device.integration.success - request = " + this.requestId + " success callback " + i);
                  }
                  catch(sce)
                  {
                     adf.mf.log.Framework.logp(adf.mf.log.level.WARNING, "device.integration", "success",
                           ("Error executing Cordova request " + this.requestId + 
                                 " success callback " + i + " or " + this.scb[i] + 
                                 " request: " + adf.mf.util.stringify(this.request) +
                                 " result: " + adf.mf.util.stringify(result)) +
                                 " error: " + adf.mf.util.stringify(sce));
                     try
                     {
                        // adf.mf.internal.perf.start("device.integration.success", "request = " + this.requestId + " failure callback " + i);
                        this.fcb[i](this.request, sce);
                        // adf.mf.internal.perf.stop("device.integration.success", "request = " + this.requestId + " failure callback " + i);
                     }
                     catch(fatalError)
                     {
                        adf.mf.log.Framework.logp(adf.mf.log.level.SEVERE, "device.integration", "success",
                              ("Error executing Cordova request " + this.requestId + " failed callback " + i + "   error = " + fatalError));
                     }
                  }
               }
            }
            catch(se)
            {
               adf.mf.log.Framework.logp(adf.mf.log.level.SEVERE, "device.integration", "success",
                     ("Error executing cordovaSuccess callback - " + se));
            }
         }        

         /* internal failure callback for this request */
         this.failure = function(result)
         {
            try
            {
               if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE)) 
               {
                  adf.mf.log.Framework.logp(adf.mf.log.level.FINER, "device.integration", "failure",
                        ("Inside the failure callback for request " + this.requestId));
               }

               for(var i = 0; i < this.fcb.length; ++i)
               {
                  try
                  {
                     // console.log("START: device.integration.failure - request = " + this.requestId + " failure callback " + i + " with result = " + result);
                     // adf.mf.internal.perf.start("device.integration.failure", "request = " + this.requestId + " failure callback " + i);
                     this.fcb[i](this.request, result);
                     // adf.mf.internal.perf.stop("device.integration.failure", "request = " + this.requestId + " failure callback " + i);
                  }
                  catch(fce)
                  {
                     /* nothing we can do */
                     adf.mf.log.Framework.logp(adf.mf.log.level.WARNING, "device.integration", "failure",
                           ("Error executing Cordova request " + this.requestId + 
                                 " failure callback " + i + " or " + this.scb[i] + 
                                 " request: " + adf.mf.util.stringify(this.request) +
                                 " result: " + adf.mf.util.stringify(result)) +
                                 " error: " + adf.mf.util.stringify(fce));
                }
               }
            }
            catch(fe)
            {
               adf.mf.log.Framework.logp(adf.mf.log.level.SEVERE, "device.integration", "failure",
                     ("Error executing cordovaFailure callback - " + fe));
            }
         }   
         this.fail = this.failure;


         this.execute = function()
         {
            try
            {
               if(typeof(Cordova) == "undefined")
               {
                  alert("Cordova has not been properly included.  Aborting Cordova call.");
                  this.cordovaFailure();
                  return;
               }

               adf.mf.internal.processingRequestQueue.insert(this);
               adf.mf.internal.processingRequestQueue.insert(this);

              Cordova.exec(containerInternalRoot().cordovaSuccessCallback(this.requestId), 
                     containerInternalRoot().cordovaFailureCallback(this.requestId), 
                     this.plugin, this.methodName, [this.request]);              
            }
            catch(e)
            {
               // console.log("Cordova Request post-exec with exception for " + this.requestId);
               adf.mf.log.Framework.logp(adf.mf.log.level.SEVERE, "device.integration", "execute",
                     ("Error executing Cordova request " + this.requestId + " with error = " + adf.mf.util.stringify(e)));

               for(var i = 0; i < this.fcb.length; ++i)
               {
                  try
                  {
                     this.fcb[i](this.request, e);
                  }
                  catch(fe)
                  {
                     /* nothing we can do */
                     adf.mf.log.Framework.logp(adf.mf.log.level.SEVERE, "device.integration", "execute",
                           ("Error executing Cordova request " + this.requestId + " failed callback " + i));
                  }
               }
            }
         }

         if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINER)) 
         {
            adf.mf.log.Framework.logp(adf.mf.log.level.FINER, "device.integration", "constructor",
                  ("Cordova Request " + this.requestId + " has been created. " + adf.mf.util.stringify(this.request)));
         }
         return this;
      }
      catch(ex)
      {
         adf.mf.log.Framework.logp(adf.mf.log.level.SEVERE, "device.integration", "execute",
               ("Error creating Cordova Request error = " + adf.mf.util.stringify(ex)));
      }
   };

   /**
    * Add the Features service to the ADFMobile
    */
   containerInternalRoot().Features = new ADFMobileFeatures();
   adf.mf.Features                  = containerInternalRoot().Features;

   /**
    * Add the vmchannel (formerly Java) service to the ADFMobile
    */
   containerInternalRoot().vmchannel = new ADFMobileJava();

   /**
    * Add the AdfMobileSecurity service to ADFMobile
    */
   containerInternalRoot().Security = new ADFMobileSecurity();
}
catch(e)
{
   console.log("**************************************************");
   console.log("***** ERROR: adf.mf.device.integration.js buildout error: " + e);
}

