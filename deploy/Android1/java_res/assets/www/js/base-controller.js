/* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. */
/* ------------------------------------------------------------- */
/* ------------------- base-controller.js ---------------------- */
/* ------------------------------------------------------------- */

// ===========================================================================
// ======= Any touching of this file must have architectural approval. =======
// ===========================================================================

// Let the controller know about the feature root (since adfc-mobile.js re-initializes it to false):
//adf.FEATURE_ROOT = 

// Let the controller know about the DT mode (since adfc-mobile.js re-initializes it to false):
adf.AMX_DTMODE = adf.mf.environment.profile.dtMode;

// Initialize the Trinidad library.
if (!adf.mf.environment.profile.dtMode)
{
  // TODO should this be skipped for mock mode too?
  adf.mf.internal.perf.perfTimings(false, false, true, "Loading trinidad lib");
  if (adf.mf.environment.profile.messageBundleBaseUrl != null)
    adf.mf.api.amx.loadTrinidadResources(adf.mf.environment.profile.messageBundleBaseUrl); // defined in amx-resource.js
  else
    adf.mf.api.amx.loadTrinidadResources("js"); // defined in amx-resource.js
}

// PRIVATE FUNCTION USED ONLY BY THIS FILE
function getFeatureRoot()
{
  var queryString = adf.mf.api.getQueryString();
  var featureRoot = adfc.internal.UrlUtil.getFeatureRoot(queryString);
  adf.FEATURE_ROOT = featureRoot; // this variable is used by adfc-mobile.js
  if (featureRoot == null)
  {
    adfc.internal.LogUtil.fine("no feature root specified");
  }
  else
  {
    adfc.internal.LogUtil.fine("using feature root of: " + featureRoot);
  }
}

// PRIVATE FUNCTION USED ONLY BY THIS FILE
function getEntryPointDocumentPath()
{
  var queryString = adf.mf.api.getQueryString();
  var path = adfc.internal.UrlUtil.getEntryPointDocumentPath(queryString);
  if (path == null)
  {
    var msg = adfc.internal.MsgUtil.getLocalizedText(adfc.internal.MsgUtil.NO_FEATURE_ENTRY_POINT);
    adfc.internal.LogUtil.showAlert(adf.mf.internal.log.getStringifedIfNeeded(msg));
    throw new Error(msg);
  }
  return path;
}

// PRIVATE FUNCTION USED ONLY BY base-core.js
adf.mf.internal.api.showFirstAmxPage = function()
{
  adfc.internal.LogUtil.fine("BEGIN: showFirstAmxPage()");
  $(document).ready(function() // similar to body's "load" event but also waits for images to load; TODO make non-jQuery but is this really needed; do we really need to wait for images to load?
  {
    adf.mf.internal.perf.perfTimings(false, false, true, "document ready event received");
    adfc.internal.LogUtil.fine("document.ready event received");

    // Get the feature root from the URL if there's one there.
    getFeatureRoot();

    var AdfcContextInitSuccess = function()
    {
       adf.mf.internal.perf.perfTimings(false, false, true, "END: initialize AdfcContext");

       // Get the entry point document.
       var entryDocPath = getEntryPointDocumentPath();
       adfc.internal.LogUtil.fine("entryDocPath=" + entryDocPath);

       // Get the initial view to display.
       var request = {};
       request.entryPoint = entryDocPath;
       var navigationSuccess = function(req, response)
       {
         adf.mf.internal.perf.perfTimings(false, false, true, "END: determine first viewId");
         if (response.isNewViewId())
         {
           var amxPage = response.getVdlDocumentPath();
           var displayAmxDone = function()
           {
             adf.mf.internal.perf.perfTimings(false, false, true, "END: display first AMX page");
           };
           adfc.internal.LogUtil.fine("displaying initial view, page=" + amxPage);
           adf.mf.internal.perf.perfTimings(false, false, true, "BEGIN: display firxt AMX page");
           adf.mf.api.amx.displayAmxPage(amxPage).done(displayAmxDone);
         }
         else
         {
           var msg = "failed to determine initial view to display";
           adfc.internal.LogUtil.showAlert(adf.mf.internal.log.getStringifedIfNeeded(msg));
           throw new Error(msg);
         }
       };

       var navigationFailed = function (req, message)
       {
         adfc.internal.LogUtil.showAlert(adf.mf.internal.log.getStringifedIfNeeded(message));
         throw new Error(message);
       };

       if (!adf.mf.environment.profile.dtMode)
       {
         adf.mf.internal.perf.perfTimings(false, false, true, "BEGIN: determine first viewId");
         adfc.NavigationHandler.getInitialViewId(request, navigationSuccess, navigationFailed);
       }
       else
       {
         // AMX DT mode.
         var navResponse = new adfc.NavigationResult(true, false, entryDocPath, entryDocPath, "", false);
         navigationSuccess(request, navResponse);
       }
    }; // End AdfcContextInitSuccess() callback function

    var AdfcContextInitFailed = function(message)
    {
      adfc.internal.LogUtil.showAlert("Failed to initialize the AdfcContext: " + adf.mf.internal.log.getStringifedIfNeeded(message));
    }

    // Load the bootstrap metadata.
    try
    {
      if (!adf.mf.environment.profile.dtMode)
      {
        // Not design-time mode.
        adfc.internal.LogUtil.fine("initializing the AdfcContext ...");
        adf.mf.internal.perf.perfTimings(false, false, true, "BEGIN: initialize AdfcContext");
        adfc.internal.AdfcContext.initialize(AdfcContextInitSuccess, AdfcContextInitFailed);
      }
      else
      {
        // We're running in design-time mode.
        AdfcContextInitSuccess();
      }
    }
    catch (exp)
    {
      adfc.internal.LogUtil.showAlert(adf.mf.internal.log.getStringifedIfNeeded(exp.message));
      throw exp;
    }
  }); // End of anon ready callback function
} // End of showFirstAmxPage() function.