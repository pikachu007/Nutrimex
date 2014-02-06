/* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. */
/* ------------------------------------------------------ */
/* ------------------- amx-resource.js ------------------ */
/* ------------------------------------------------------ */

// base-adfel.js defines all of the other namespaces
if (!window.adf) window.adf = {};
adf.mf              = adf.mf              || {};
adf.mf.api          = adf.mf.api          || {};
adf.mf.api.amx      = adf.mf.api.amx      || {};
adf.mf.internal     = adf.mf.internal     || {};
adf.mf.internal.amx = adf.mf.internal.amx || {};
adf.mf.resource     = adf.mf.resource     || {};
window.amx = {}; /* deprecated */

// --------- Config Initialization --------- //
(function($)
{
  // define the names of the 2 known message bundles here
  adf.mf.resource.AMXErrorBundleName = "AMXErrorBundle";
  adf.mf.resource.AMXInfoBundleName  = "AMXInfoBundle";
})(jQuery);
// --------- /Config Initialization --------- //

// --------- Utilities --------- //
(function()
{
  function loadTrinidadLocaleElements(baseUrl, localeList, callback)
  {
    var getLocaleElementsUrl = function(locale)
    {
      return baseUrl + "/resource/LocaleElements" + "_" + adf.mf.locale.getJavaLanguage(locale) + ".js";
    };
    var isLocaleElementsLoaded = function(locale)
    {
      var suffix = "_" + adf.mf.locale.getJavaLanguage(locale);
      if (typeof window["LocaleSymbols" + suffix] !== "undefined")
      {
        return true;
      }
      return false;
    };

    adf.mf.api.amx.loadJavaScriptByLocale(localeList, getLocaleElementsUrl, isLocaleElementsLoaded, callback);
  }

  function loadTrinidadMessageBundle(baseUrl, localeList, callback)
  {
    var getMessageBundleUrl = function(locale)
    {
      var url = baseUrl + "/resource/MessageBundle";
      if (locale.indexOf("en") == 0)
      {
        return url + ".js";
      }
      return url + "_" + adf.mf.locale.getJavaLanguage(locale) + ".js";
    };
    var isMessageBundleLoaded = function(locale)
    {
      return typeof TrMessageFactory._TRANSLATIONS !== "undefined";
    };
    adf.mf.api.amx.loadJavaScriptByLocale(localeList, getMessageBundleUrl, isMessageBundleLoaded, callback);
  }

  function loadOtherMessageBundles(baseUrl, localeList)
  {
    /* first load the ADF message bundles */
    adf.mf.resource.loadADFMessageBundles(baseUrl, localeList.slice(0));

    /* now load the AMX message bundles */
    adf.mf.resource.loadMessageBundle(adf.mf.resource.AMXErrorBundleName, baseUrl, localeList.slice(0));
    adf.mf.resource.loadMessageBundle(adf.mf.resource.AMXInfoBundleName,  baseUrl, localeList.slice(0));
  }

  // --------- /Private helper methods --------- //

  // --------- Public methods --------- //

  adf.mf.api.amx.loadJavaScriptByLocale = function(localeList, constructor, predicate, callback)
  {
    // clone the array before calling the load method since it will actually
    // modify the array as it searches
    var clonedList = $.merge([], localeList);
    adf.mf.internal.resource.loadJavaScriptByLocale(clonedList, constructor, predicate, callback);
  };

  adf.mf.api.amx.loadTrinidadResources = function(baseUrl) /* used by base-controller.js */
  {
    // before doing anything, we need to register the error handler
    adf.mf.api.addErrorHandler(adf.mf.internal.amx.errorHandlerImpl);

    // Bootstrap the Trinidad locale globals
    _df2DYS = null;

    // Return global variable _locale if it is non-null; otherwise return the browser language
    _locale = adf.mf.locale.getUserLanguage();

    var localeList           = adf.mf.locale.generateLocaleList(_locale, true);
    var localeListNoVariants = adf.mf.locale.generateLocaleList(_locale, false);

    loadTrinidadLocaleElements(baseUrl, localeList, function(locale)
    {
      if (locale === null)
      {
        // for this low-level method, always send in the english string
        if (adf.mf.log.Framework.isLoggable(adf.mf.log.level.WARNING))
        {
          adf.mf.log.Framework.logp(adf.mf.log.level.WARNING, "amx", "loadTrinidadResources", "Failed to load LocaleElements");
        }
      }
      else
      {
        // Reassign global locale (necessary since Trinidad does not fallback to en-US).
        _locale = locale;
        loadTrinidadMessageBundle(baseUrl, localeListNoVariants, function(locale)
        {
          if (locale === null)
          {
            // for this low-level method, always send in the english string
            if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.WARNING))
            {
              adf.mf.log.Framework.logp(adf.mf.log.level.WARNING, "amx", "loadTrinidadResources", "Failed to load MessageBundle");
            }
          }
        });
      }
    });

    // load any other message bundles that the js system depends on
    loadOtherMessageBundles(baseUrl, localeListNoVariants);
  };
  // --------- /Public methods --------- //

}) ();
//--------- /Utilities --------- //
/* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. */
/* ------------------------------------------------------ */
/* ------------------- amx-core.js ---------------------- */
/* ------------------------------------------------------ */

// --------- Config Initialization --------- //
(function($)
{
  amx.dtmode = false; // TODO deprecated, use adf.mf.environment.profile.dtMode instead
  // this boolean value will be set directly via the Selenium scripts
  amx.testmode = amx.testmode || false;
  amx.failsafeinvoked = false;

  // GREGOR
  amx.CALL_IDX = 1;

  if (adf.mf.environment.profile.dtMode)
  {
    amx.dtmode = adf.mf.environment.profile.dtMode;
  }

  // Add agent marker classes:
  adf.mf.internal.amx.agent = {type:"iOS"};
  var userAgent = (""+navigator.userAgent).toLowerCase();
  if (userAgent.match(/android/i))
  {
    if (userAgent.match(/chrome\//i))
    {
      adf.mf.internal.amx.agent = {"type":"Android","subtype":"Chrome"};
      document.documentElement.className += " amx-android-chrome";
    }
    else
    {
      adf.mf.internal.amx.agent = {"type":"Android","subtype":"Generic"};
      document.documentElement.className += " amx-android-generic";
    }
  }
  else
  {
    document.documentElement.className += " amx-ios";
  }

  /**
   * Internal cache of the isTransitionAfterRender result.
   */
  adf.mf.internal.amx.transitionAfterRender = null;

  /**
   * WARNING - This function and property are not supported and will be removed
   *           without any notice.
   * Internal flag that specifies whether we should render before transitioning or
   * display an empty placeholder for immediate transitioning.
   * @param {Boolean} isFirstPage whether this is the initial page render
   * @return true for rendering before or false for immediate transitioning
   */
  adf.mf.internal.amx.isTransitionAfterRender = function(isFirstPage)
  {
    // See if an unsupported override was specified as an adf-property in the adf-config.xml file.
    var transitionAfterRender = adf.mf.internal.amx.transitionAfterRender;
    if (transitionAfterRender == null)
    {
      var transitionAfterRender = true;

      // Get the value from the adf-config.xml object (might not be defined):
      var amxTransitionMode =
        adf.mf.el.getLocalValue("#{applicationScope.configuration.amxTransitionMode}");

      if ("placeholder" == amxTransitionMode)
        transitionAfterRender = false; // fast but ugly
      else
        transitionAfterRender = true; // pretty but slow

      if (isFirstPage)
      {
        // Unfortunately, applicationScope.configuration is not made available automatically
        // so we have to kick off an extra request for it so that the next time this method
        // gets called, we will know what the value is.
        // (Just before the first adf.mf.api.setContext call, we kicked off a request so
        // it will be available by the time we transition.)
        // Also, since we don't know what it is yet, we won't save off a cached result yet.
      }
      else
      {
        // Save it off so we don't have to continuously re-evaluate it.
        adf.mf.internal.amx.transitionAfterRender = transitionAfterRender;
      }
    }
    return transitionAfterRender;
  };

  amx.config =
  {
    debug:
    {
      enable: false,
      onScreen: false
    }
  };

  // TODO this and any of its uses need to be removed
  amx.log = {};

  amx.log.debug = function(text)
  {
    if (amx.config.debug.enable)
    {
      if (amx.config.debug.onScreen && !amx.$amxDebug)
      {
        amx.$amxDebug = $("<div id='amxDebug'></div>").appendTo("body");
      }
      if (amx.$amxDebug)
      {
        amx.$amxDebug.prepend(text + "<br />");
      }
      else
      {
        console.log(text);
      }
    }
  }

  amx.log.error = function(text)
  {
    text = "AMX-ERROR: " + text;
    if (amx.config.debug.onScreen && !amx.$amxDebug)
    {
      amx.$amxDebug = $("<div id='amxDebug'></div>").appendTo("body");
    }
    if (amx.$amxDebug)
    {
      amx.$amxDebug.prepend(text + "<br />");
    }
    console.log(text);
  }


  amx.log.warn = function(text)
  {
    text = "AMX-WARN: " + text;
    if (amx.$amxDebug)
    {
      amx.$amxDebug.prepend(text + "<br />");
    }
    if (console.log)
    {
      console.log(text);
    }
  }

})(jQuery);
// --------- /Config Initialization --------- //
/**
 * A counter for the numnber of calls made to showLoading indicator. This is required because there are several starting
 * points that can occur for long operations. The issue is that they can overlap so you are calling the start more then
 * once. The solution to this problem is to keep a count of the number of calls to start and increment this value. There
 * will be a corresponding number if calls to hide and when we get to zero we will do hiding.
 * @type {integer}
 */
adf.mf.internal.amx._showLoadingCalls = 0;
/**
 * Internal function called to bring up the loading indicator.
 */
adf.mf.internal.amx._showLoadingIndicator = function()
{
  var $div = $("#amx-loading");
  $div.removeClass("hidden");     // get rid of the display:none
  $div.addClass("beforeShowing"); // now at display:block but with opacity:0
  $div.removeClass("beforeShowing"); // get rid of opacity:0
  $div.addClass("showing");          // animate to opacity:1

  // Let WAI-ARIA users know the page is loading
  var loadingLiveRegion = document.getElementById("amx-loading-live-region");
  if (loadingLiveRegion != null)
  {
    var msgLoading = adf.mf.resource.getInfoString("AMXInfoBundle", "MSG_LOADING");
    if (msgLoading == null) // will be null if too soon (e.g. initial page load)
      msgLoading = "Loading";
    loadingLiveRegion.textContent = msgLoading;
  }
};
/**
 * Internal function to setup for showing the busy indicator. This will set a timer to actually launch the busy
 * indicator. This is set on a timer to allow us to cancel this and not show any busy indicator if the action being
 * performed is less then 250ms.
 */
adf.mf.api.amx.showLoadingIndicator = function()
{
  // If this is the first call to showing the Loading/Busy Indicator and we are not starting of the feature
  // then we have to set the timer to show the loading/busy indicator.
  if (adf.mf.internal.amx._showLoadingCalls == 0 && adf.mf.internal.amx._loadingIndicatorNotFirstTime == true)
  {
    adf.mf.internal.amx._showLoadingIndicator();
    // Need a failsafe timer that will gurentee that the loading indicator is removed. For now this will be set to
    // 10 seconds.
    adf.mf.internal.amx._failSafeTimer = window.setTimeout(adf.mf.internal.amx.killLoadingIndicator, 10000);
    // Set the number of calls to 1
    adf.mf.internal.amx._showLoadingCalls = 1;
  }
  else
  {
    // This is not the first call so we need to just increase the number of calls. This is neeeded as we will decrement
    // this value and when we hit zero then we will remove the loading/busy indicator.
    adf.mf.internal.amx._showLoadingCalls = adf.mf.internal.amx._showLoadingCalls + 1;
  }
};
/**
 * To ensure that the loading/busy indicator for some unknown reason is removed we have a failsafe timer that will
 * ensure that this is removed. This is required because the user will be unable to interact with the page as loading/
 * busy indicator is blocking all input.
 */
adf.mf.internal.amx.killLoadingIndicator = function()
{
  // Since the failsafe had to kick in we need to clear the timer and also delete the old timer.
  // Clear the timer so it is not called again.
  window.clearTimeout(adf.mf.internal.amx._failSafeTimer);
  // Need to delete the old timer
  delete adf.mf.internal.amx._failSafeTimer;
  // Need to reset the calls to 0
  adf.mf.internal.amx._showLoadingCalls = 0;
  // Transition the loading/busy indicator off.
  var $div = $("#amx-loading");
  $div.one("webkitTransitionEnd",
    function()
    {
      $div.removeClass("hiding"); // no longer animating
      $div.addClass("hidden");    // set display:none

      // Blank out the loading WAI-ARIA live region so that you won't hear the text when not loading
      var loadingLiveRegion = document.getElementById("amx-loading-live-region");
      if (loadingLiveRegion != null)
      {
        loadingLiveRegion.textContent = "";
      }

      // We are done with showing the initial HTML for the page:
      adf.mf.internal.api.queueShowPageComplete();
    });
  $div.removeClass("showing");  // get rid of opacity:1
  $div.addClass("hiding");      // animate to opacity:0

  // if we are in test mode, then set the failsafe invoked flag
  if (amx.testmode)
  {
    amx.failsafeinvoked = true;
  }
};
/**
 * This function will decreemnt the showing calls attribute and when it goes to zero will start the process for hiding
 * the loading/busy indicator.
 */
adf.mf.api.amx.hideLoadingIndicator = function()
{
  if (adf.mf.internal.amx._showLoadingCalls == 0)
    return;
  adf.mf.internal.amx._showLoadingCalls = adf.mf.internal.amx._showLoadingCalls - 1;
  if (adf.mf.internal.amx._showLoadingCalls == 0)
  {
    var $div = $("#amx-loading");
    $div.removeClass("showing"); // get rid of opacity:1
    $div.addClass("hiding");     // animate to opacity:0
    $div.removeClass("hiding");  // no longer animating
    $div.addClass("hidden");     // set display:none
    // Clear the failsafe timer so it is not called.
    window.clearTimeout(adf.mf.internal.amx._failSafeTimer);
    // Need to delete the old failsafe timer
    delete adf.mf.internal.amx._failSafeTimer;

    // Blank out the loading WAI-ARIA live region so that you won't hear the text when not loading
    var loadingLiveRegion = document.getElementById("amx-loading-live-region");
    if (loadingLiveRegion != null)
    {
      loadingLiveRegion.textContent = "";
    }
  }
};

/**
 * This is a special case for clearing the loading/busy indicator. On the initial load of the feature we set the style
 * on the DIV to show the loading indicator. This means there will be no call to hiding and instead call this function.
 * Unfortunalty this function will get called multiple times based on where this call had to put. This means we need
 * to make sure this is only called the once and we rely on the attribute being set for this.
 */
adf.mf.api.amx.hideLoadingIndicatorOnlyIfFirstTime = function()
{
  // If this is the first time this function is called then we will hide the loading/busy indicator.
  if (adf.mf.internal.amx._loadingIndicatorNotFirstTime == null)
  {
    // Based on the path taken to all this function there may have been other calls to showing. We need to ensure that
    // the counter has been set back to zero.
    adf.mf.internal.amx._showLoadingCalls = 0;
    adf.mf.internal.amx._loadingIndicatorNotFirstTime = true;
    var $div = $("#amx-loading");
    $div.one("webkitTransitionEnd",
      function()
      {
        $div.removeClass("hiding"); // no longer animating
        $div.addClass("hidden");    // set display:none

        // We are done with showing the initial HTML for the page:
        adf.mf.internal.api.queueShowPageComplete();
      });
    $div.removeClass("showing");    // get rid of opacity:1
    $div.addClass("hiding");        // animate to opacity:0
  }
  else
  {
    adf.mf.api.amx.hideLoadingIndicator();
  }
};

/**
 * bulk load a set of providers so they cached and accessibly locally.
 *
 * @param tni is the tree node iterator to load the provider from
 * @param startingPoint to load from, typically 0 but recursive calls will change those to be page/set boundary markers
 * @param numberOfRows to load up to the number of providers in the collection. Represents the total number of rows, not relative to the starting point
 * @param success the callback(s) to invoke when all the providers have been loaded
 * @param failed the callback(s) to invoke on error
 */
adf.mf.api.amx.bulkLoadProviders = function(tni, startingPoint, numberOfRows, success, failed)
{
  var scb         = success;
  var fcb         = failed;

  // Get the number of cached rows after the starting point
  var cachedRows  = tni.getCachedRowCount(startingPoint);
  // Get the total number of rows in the collection model (not just cached)
  var maxRows     = tni.treeNodeBindings.keys.length;
  // Get the desired number of rows that should be cached (from 0, aka total)
  var desiredRowCount = ((numberOfRows == -1) || (maxRows < numberOfRows))? maxRows : numberOfRows;
  if (cachedRows + startingPoint < desiredRowCount)
  {
    // fetch more data - note this will call nextSet and then recurse to fetch any remaining rows if need be
    var newIndex = startingPoint + cachedRows;
    if (newIndex < 0) newIndex = 0;
    tni.setCurrentIndex(newIndex);
    tni.nextSet(function() { adf.mf.api.amx.bulkLoadProviders(tni, newIndex, desiredRowCount, success, failed); }, fcb);
  }
  else
  {
    // we have the data already cached
    try
    {
      scb(null, null);
    }
    catch(fe)
    {
      fcb(fe, null);
    }
  }
};
// --------- On Ready --------- //
$(function()
{

  amx.$bodyPage = $("#bodyPage");
  var $body = $("body");

  //NOTE: The body of this function was removed to allow use of native scrolling in iOS 5.0 by the use of the
  //CSS "-webkit-overflow-scrolling: touch" on the amx-scrollable class, but the binding itself remains because
  //removing it causes AMX-processed touch events to fail altogether.
  $body.bind("touchmove", function (event) {});
});
// --------- /On Ready --------- //

// ------ amx UI ------ //
(function()
{

  // experimental
  amx.uiFlush = function()
  {
    amx.UIFlushVal = -1 * amx.UIFlushVal;
    amx.$UIFlush.html(amx.UIFlushVal);
    amx.$UIFlush.css("width", 30 + amx.UIFlushVal + "px");
  };

  // this tell if the app is transitioning something (event should be frozen when doing so)
  amx.transitioning = false;

  amx.acceptEvent = function()
  {
    return !amx.transitioning && !adf.mf.environment.profile.dtMode;
  };

  amx.getCurrentPageName = function()
  {
    return $(".amx-view-container.current").attr("data-pagename");
  };

  amx.hooks = {};
  // ------ Public API ------ //
  var isFirstPage = true;
  var initDfd;

  //  Let the navigation handler manage view history and the MfContextInstance.
  adf.mf.internal.useNavHandlerViewHistory = true;

  /**
   * Fetches the AMX volatile state for the specified AMX node ID that was previously stored.
   * Renderers would call this to retrieve old state in create(), refresh(), or postDisplay().
   * @param {String} amxNodeId the amxNode.id that uniquely identifies the stored data
   * @return {Object} undefined or the volatile state data that was previously stored since the last navigation
   */
  adf.mf.api.amx.getVolatileState = function(amxNodeId)
  {
    var stateValue = adf.mf.internal.amx._getVolatileStateMap();
    if (amxNodeId == null)
    {
      throw new Error("Volatile state access requires an amxNodeId but was given: " + amxNodeId);
    }
    else if (stateValue == null)
    {
      throw new Error("Volatile state access failed to establish a place for storage: " + stateValue);
    }
    else
    {
      var payloadJsonObject = stateValue[amxNodeId];
      return payloadJsonObject;
    }
  };

  /**
   * Stores/replaces the AMX volatile state for the specified AMX node ID.
   * Preferrably, renderers would call this whenever a volatile state change happens (e.g. result of
   * selecting an item in a listView.
   * @param {String} amxNodeId the amxNode.id that uniquely identifies the stored data
   * @param {Object} payloadJsonObject the volatile state data to store until navigation
   */
  adf.mf.api.amx.setVolatileState = function(amxNodeId, payloadJsonObject)
  {
    var stateValue = adf.mf.internal.amx._getVolatileStateMap();
    if (amxNodeId == null)
    {
      throw new Error("Volatile state access requires an amxNodeId but was given: " + amxNodeId);
    }
    else if (stateValue == null)
    {
      throw new Error("Volatile state access failed to establish a place for storage: " + stateValue);
    }
    else
    {
      stateValue[amxNodeId] = payloadJsonObject;
    }
  };

  adf.mf.internal.amx._getVolatileStateMap = function()
  {
    if (adf.mf.environment.profile.dtMode && adf.mf.internal.amx._volatileStateMap == null)
    {
      // This is needed because the controller will not call setMfContextInstance in DT mode:
      adf.mf.internal.amx._volatileStateMap = {};
    }
    return adf.mf.internal.amx._volatileStateMap;
  };

  /**
   * Fetches the AMX client state for the specified AMX node ID that was previously stored.
   * Renderers would call this to retrieve old state in create(), refresh(), or postDisplay().
   * @param {String} amxNodeId the amxNode.id that uniquely identifies the stored data
   * @return {Object} undefined or the client state data that was previously stored in this view instance
   */
  adf.mf.api.amx.getClientState = function(amxNodeId)
  {
    var stateValue = adf.mf.internal.amx._getClientStateMap();
    if (amxNodeId == null)
    {
      throw new Error("Client state access requires an amxNodeId but was given: " + amxNodeId);
    }
    else if (stateValue == null)
    {
      throw new Error("Client state access failed to establish a place for storage: " + stateValue);
    }
    else
    {
      var payloadJsonObject = stateValue[amxNodeId];
      return payloadJsonObject;
    }
  };

  /**
   * Stores/replaces the AMX client state for the specified AMX node ID.
   * Preferrably, renderers would call this whenever a state change happens (e.g. result of
   * spinning the carousel.
   * However, it is not always feasible to detect when a state change happens so you may need
   * to update the state for your component just before the view is going to be
   * discarded.  There are 2 possible scenarios that you will need to account for:
   * - Renderer refresh() (for navigating to the same view again)
   * - Renderer preDestroy() (for navigating to a new view and navigating to "__back" at a later time)
   * @param {String} amxNodeId the amxNode.id that uniquely identifies the stored data
   * @param {Object} payloadJsonObject the client state data to store for the lifetime of this view instance
   */
  adf.mf.api.amx.setClientState = function(amxNodeId, payloadJsonObject)
  {
    var stateValue = adf.mf.internal.amx._getClientStateMap();
    if (amxNodeId == null)
    {
      throw new Error("Client state access requires an amxNodeId but was given: " + amxNodeId);
    }
    else if (stateValue == null)
    {
      throw new Error("Client state access failed to establish a place for storage: " + stateValue);
    }
    else
    {
      stateValue[amxNodeId] = payloadJsonObject;
    }
  };

  /**
   * Using true for the following flag results in "oracle.adfmf.framework - adf.mf.el - setValue] Since the
   * java is not available we will skip the remote write." failure messages when attempting to navigate.
   */
  adf.mf.internal.amx._useBruceApproach = (adf.mf.api.getQueryStringParamValue(adf.mf.api.getQueryString(), "useBruceWay") == "true");

  adf.mf.internal.amx._getClientStateMap = function()
  {
    var stateValue;
    if (adf.mf.internal.amx._useBruceApproach)
    {
      var stateName = "#{bindings.amxInternalClientState}";
      if ((stateValue = adf.mf.el.getLocalValue(stateName)) === undefined)
      {
        stateValue = {};
        var getFailed  = function(req, message)
        {
          throw new Error("Client state access failed: " + message);
        };
        adf.mf.el.setLocalValue({"name":stateName, "value":stateValue}, function(){}, getFailed);
      }
    }
    else // don't use Bruce's way
    {
      if (adf.mf.environment.profile.dtMode && adf.mf.internal.amx._nonBruceClientStateMap == null)
      {
        // This is needed because the controller will not call setMfContextInstance in DT mode:
        adf.mf.internal.amx._nonBruceClientStateMap = {};
      }
      stateValue = adf.mf.internal.amx._nonBruceClientStateMap;
    }

    return stateValue;
  };

  /**
   * Establish (or re-establish) the mfContext instance for the page that the user will now be interacting with.
   * Used by the controller's navigation handler during tansition to a new view.
   * @param viewHistoryItem  the view history stack entry associtated with the current view.
   * @param brandNewInstance is this a new view instance or an existing one (e.g. a back navigation)?
   * @export
   */
  adf.mf.internal.amx.setMfContextInstance = function(viewHistoryItem, brandNewInstance)
  {
    // Prepare the client state map (the bucket that survives navigation):
    if (adf.mf.internal.amx._useBruceApproach)
    {
      var pageDef    = viewHistoryItem.amxPage;
      var instanceId = viewHistoryItem.itemId;
      var resetState = false; // per Bruce, use false here (may in the future consider how brandNewInstance plays into it)
      var reSync     = false; // per Bruce, use false here (may in the future consider how brandNewInstance plays into it)
      var setFailed  = function(req, message)
      {
        throw new Error("Navigation failed: (mfContext set) " + message);
      };
      adf.mf.api.setContextInstance(pageDef, instanceId, resetState, reSync, function(){}, setFailed);
    }
    else // don't use Bruce's way
    {
      if (viewHistoryItem._nonBruceClientStateMap == null)
      {
        viewHistoryItem._nonBruceClientStateMap = {};
      }
      adf.mf.internal.amx._nonBruceClientStateMap = viewHistoryItem._nonBruceClientStateMap;
    }

    // Prepare a fresh volatile state map (the bucket that resets at navigation):
    adf.mf.internal.amx._volatileStateMap = {};
  };

  /**
   * Remove the mfContext instance for the page that the user will now be leaving.
   * Used by the controller's navigation handler during tansition to a new view.
   * @param viewHistoryItem  the view history stack entry associtated with the view to be removed.
   * @export
   */
  adf.mf.internal.amx.removeMfContextInstance = function(viewHistoryItem)
  {
    // Purge the client state map (the bucket that survives navigation) since this instance will never be used again:
    if (adf.mf.internal.amx._useBruceApproach)
    {
      var pageDef      = viewHistoryItem.amxPage;
      var instanceId   = viewHistoryItem.itemId;
      var removeFailed = function(req, message)
      {
        throw new Error("Navigation failed: (mfContext removal) " + message);
      };
      adf.mf.api.removeContextInstance(pageDef, instanceId, function(){}, removeFailed);
    }
    else // don't use Bruce's way
    {
      adf.mf.internal.amx._nonBruceClientStateMap = null;
    }
  };

  /**
   * @deprecated
   */
  amx.doNavigation = function(outcome)
  {
    adf.mf.log.logInfoResource("AMXInfoBundle", adf.mf.log.level.WARNING, "doNavigation", "MSG_DEPRECATED", "amx.doNavigation", "adf.mf.api.amx.doNavigation");
    adf.mf.api.amx.doNavigation.apply(this, arguments);
  };

  adf.mf.api.amx.doNavigation = function(outcome)
  {
    adf.mf.internal.perf.start("amx.doNavigation", outcome.toString() );
    adf.mf.api.amx.showLoadingIndicator();

    var dfd = $.Deferred();
    dfd.fail(
      function()
      {
        adf.mf.internal.perf.stop("amx.doNavigation", outcome.toString());
      });

    // this method will return an empty array if the outcome is null
    // or if the outcome string does not contain any el expressions
    var els = amx.getElsFromString(outcome);
    if (els.length == 0)
    {
      // no el expressions detected, just pass outcome as-is
      dfd.resolve(outcome);
    }
    else
    {
      var invokeCallback = function(req,res)
      {
        dfd.resolve(res);
      };
      try
      {
        // Assume that this is a method expression that returns a String.
        // Also, we do not care if it is a success or failure - any exception passed back
        // will be converted properly below via the amx.getObjectValue call.
        adf.mf.el.invoke(outcome,[],"java.lang.String",[], invokeCallback, invokeCallback);
      }
      catch(e)
      {
        // just invoke the callback
        invokeCallback(outcome, e);
      }
    }

    dfd.done(function(outcome)
    {
      var navRequest = {};
      navRequest.currentViewId = adf.mf.internal.controller.ViewHistory.peek().viewId;
      // be sure to convert from any json type structures to something
      // usable by javascript
      navRequest.outcome = amx.getObjectValue(outcome);

      var navSuccess = function(req, result)
      {
        var transitionType = result.getTransitionType();
        var amxPage = result.getVdlDocumentPath();
        var isBack = result.isBackNavigation();

        // We did not find a target for navigation, so exit early. This is a valid case
        // and Faces behaves similarly. It allows developers to return "null" or an invalid
        // target and stay on the same page. If we do not exit here, the bindings will be
        // cleared and not re-initialized
        if (amxPage == null)
        {
          adf.mf.api.amx.hideLoadingIndicator();
          adf.mf.internal.perf.stop("amx.doNavigation", outcome.toString() );
          return;
        }

        // before attempting to navigate, make sure all popups are closed
        // NOTE: amx-popup is lazily loaded, so we must check for the existence
        // of the function before calling it
        if (adf.mf.internal.amx.closePopups)
        {
          adf.mf.internal.amx.closePopups();
        }

        // Before we strip off the IDs, call the destroy methods on any AMX nodes
        var $current = amx.$bodyPage.children(".current");
        adf.mf.internal.amx.processDestroy($current);

        // Strip off any ID attributes on the old page's elements. This will prevent any issues
        // with getElementById finding elements on the old page instead of the new page.
        if ($current.length > 0)
        {
          var treeWalker = document.createTreeWalker($current.get(0),
            NodeFilter.SHOW_ELEMENT,
            // TODO: check that the webkit in Android and iOS implements the filter
            // correctly (an object with the acceptNode function).
            {
              "acceptNode": function(node)
              {
                return (node.hasAttribute("id")) ?
                  NodeFilter.FILTER_ACCEPT :
                  NodeFilter.FILTER_SKIP;
              }
            },
            false);

          while (treeWalker.nextNode())
          {
            treeWalker.currentNode.removeAttribute("id");
          }
        }

        adf.mf.internal.perf.stop("amx.doNavigation", outcome.toString() );

        if (adf.mf.internal.amx.isTransitionAfterRender(false)) // render before transitioning
        {
          adf.mf.api.amx.displayAmxPage(amxPage).done(function($page)
          {
            adf.mf.internal.perf.start("amx.transitionPage", amxPage);

            try
            {
              var $new = $page;
              // for now, doing the without the transition

              //TODO: Needs to put all the transition in a amx.fx component (allow to register custom fx)
              var transitionHandler = amx.getTransitionHandler(transitionType);
              if (transitionHandler)
              {
                amx.transitioning = true;
                transitionHandler($current, $new, isBack)
                  .always(
                    function()
                    {
                      amx.transitioning = false;
                      adf.mf.api.amx.hideLoadingIndicator();
                      adf.mf.internal.perf.stop("amx.transitionPage", "with transition");
                    });
              }
              else
              {
                adf.mf.log.logInfoResource("AMXInfoBundle", adf.mf.log.level.WARNING, "doNavigation", "MSG_NOT_TRANSITIONING");
                amx.transitioning = true;
                // we just show it.
                $current.removeClass("current").addClass("old");
                $new.removeClass("new").addClass("current");
                adf.mf.internal.amx.processDestroy($current);
                $current.remove();
                amx.transitioning = false;
                adf.mf.api.amx.hideLoadingIndicator();
                adf.mf.internal.perf.stop("amx.transitionPage", "no transition");
              }
            }
            catch (e)
            {
              // Ensure the performance "start" is stopped when an error has been thrown
              adf.mf.internal.perf.stop("amx.transitionPage", "error: " + e.message);
              throw e;
            }
          });
        }
        else // use placeholder transitioning
        {
          // Transition to blank immediately, don't wait for the new page to be present:
          amx.transitioning = true;
          amx._stillTransitioningAway = true;
          amx._stillDisplayingAmxPage = true;
          var viewContainerElement = adf.mf.internal.amx._createViewContainerElement();
          var $new = $(viewContainerElement);
          //TODO: Needs to put all the transition in a amx.fx component (allow to register custom fx)
          var transitionHandler = amx.getTransitionHandler(transitionType);
          if (transitionHandler)
          {
            transitionHandler($current, $new, isBack).done(function()
            {
              amx._stillTransitioningAway = false;
              amx.transitioning = (amx._stillDisplayingAmxPage || amx._transitioningAway);
            });
          }
          else
          {
            adf.mf.log.logInfoResource("AMXInfoBundle", adf.mf.log.level.WARNING, "doNavigation", "MSG_NOT_TRANSITIONING");
            amx._stillTransitioningAway = false;
            // we just show it.
            $current.removeClass("current").addClass("old");
            $new.removeClass("new").addClass("current");
            adf.mf.internal.amx.processDestroy($current);
            $current.remove();
          }

          adf.mf.api.amx.displayAmxPage(amxPage).done(function($page)
          {
            amx._stillDisplayingAmxPage = false;
            amx.transitioning = (amx._stillDisplayingAmxPage || amx._stillTransitioningAway);
            adf.mf.api.amx.hideLoadingIndicator();
          });
        }
      };
      var navFailed = function(req, message)
      {
        adf.mf.api.amx.hideLoadingIndicator();
        adf.mf.internal.perf.stop("amx.doNavigation", "Navigation failed: " + message);
        throw new Error("Navigation failed: " + message);
      };
      // Give renderers a chance to save off anything they want to preserve (e.g. scroll positions):
      var $current = amx.$bodyPage.children(".current");
      adf.mf.internal.amx.processPreDestroy($current);

      adfc.NavigationHandler.handleNavigation(navRequest, navSuccess, navFailed);
    });
  };

  var initQueue = [];
  var postDisplayQueue = [];

  /**
   * Remove a DOM node for an AMX node. Calls any pre-destroy and destroy methods
   * on the type handlers for nodes removed as a result of this call and then removes
   * the HTML from the page.
   * @param  {Node} domNode the HTML DOM node to remove. Must be a root DOM node for an
   *         AMX node.
   * @return {boolean} true if the node is a DOM node that represents an AMX node and
   *         was removed.
   */
  adf.mf.internal.amx.removeAmxDomNode = function(domNode)
  {
    var $node = $(domNode);
    var amxNode = $node.data("amxNode");
    if (amxNode != null)
    {
      adf.mf.internal.amx.processPreDestroy($node);
      adf.mf.internal.amx.processDestroy($node);
      $node.remove();
      return true;
    }

    return false;
  };

  adf.mf.internal.amx.processPreDestroy = function($parent)
  {
    // First, see if the $parent has a preDestroy
    var $jq = ($parent.is(".amx-has-predestroy")) ? $parent : $();

    // Add any descendents to the list
    $jq = $jq.add($parent.find(".amx-has-predestroy"));

    $jq.each(function()
    {
      var $node = $(this);
      var amxNode = $node.data("amxNode");
      var nodeTypeHandler = amxNode.getTypeHandler();
      if (nodeTypeHandler && nodeTypeHandler.preDestroy)
      {
        /**
         * Renderer function so you can be notified just before the current view is destroyed;
         * when about to navigate to a new view.
         * @param $node the root JQuery node associated with this renderer
         * @param amxNode the AMX component object associated with this renderer
         */
        nodeTypeHandler.preDestroy($node, amxNode);
      }
    });
  };

  adf.mf.internal.amx.processDestroy = function($parent)
  {
    // First, see if the $parent has a destroy
    var $jq = ($parent.is(".amx-has-destroy")) ? $parent : $();

    // Add any descendents to the list
    $jq = $jq.add($parent.find(".amx-has-destroy"));

    $jq.each(function()
    {
      var $node = $(this);
      var amxNode = $node.data("amxNode");
      var nodeTypeHandler = amxNode.getTypeHandler();
      if (nodeTypeHandler && nodeTypeHandler.destroy)
      {
        nodeTypeHandler.destroy($node, amxNode);
      }
    });
  }

  amx.processAndCleanInitQueue = function()
  {
    if (initQueue.length > 0)
    {
      var isFinestLoggingEnabled = adf.mf.log.Performance.isLoggable(adf.mf.log.level.FINEST);
      $.each(initQueue,function(i,$nodeOrDomNodeToInit)
      {
        var amxNode;
        if ($nodeOrDomNodeToInit.jquery)
        {
          amxNode = $nodeOrDomNodeToInit.data("amxNode");
        }
        else
        {
          amxNode = $($nodeOrDomNodeToInit).data("amxNode");
        }

        if (amxNode != null)
        {
          var nodeTypeHandler = amxNode.getTypeHandler();
          if (nodeTypeHandler != null && nodeTypeHandler.init != null)
          {
            if (isFinestLoggingEnabled)
            {
              adf.mf.internal.perf.trace(
                "amx.processAndCleanInitQueue",
                "Invoking the init method on the type handler for node " +
                amxNode.getId());
            }
            nodeTypeHandler.init($nodeOrDomNodeToInit, amxNode);
          }
          else
          {
            adf.mf.log.logInfoResource("AMXInfoBundle", adf.mf.log.level.WARNING,
              "processAndCleanInitQueue", "MSG_CANT_INIT_NODE", $nodeOrDomNodeToInit);
          }
        }
      });

      // cleanup the initQueue
      delete initQueue;
      initQueue = [];
    }
  };

  amx.processAndCleanPostDisplayQueue = function()
  {
    if (postDisplayQueue.length > 0)
    {
      var isFinestLoggingEnabled = adf.mf.log.Performance.isLoggable(adf.mf.log.level.FINEST);
      $.each(postDisplayQueue,function(i,$nodeOrDomNodeToPostDisplay)
      {
        var amxNode;
        if ($nodeOrDomNodeToPostDisplay.jquery)
        {
          amxNode = $nodeOrDomNodeToPostDisplay.data("amxNode");
        }
        else
        {
          amxNode = $($nodeOrDomNodeToPostDisplay).data("amxNode");
        }

        if (amxNode != null)
        {
          var nodeTypeHandler = amxNode.getTypeHandler();
          if (nodeTypeHandler != null && nodeTypeHandler.postDisplay != null)
          {
            if (isFinestLoggingEnabled)
            {
              adf.mf.internal.perf.trace(
                "amx.processAndCleanPostDisplayQueue",
                "Invoking the postDisplay method on the type handler for node " +
                amxNode.getId());
            }
            nodeTypeHandler.postDisplay($nodeOrDomNodeToPostDisplay, amxNode);
          }
          else
          {
            adf.mf.log.logInfoResource("AMXInfoBundle", adf.mf.log.level.WARNING,
              "processAndCleanPostDisplayQueue", "MSG_CANT_POSTDISPLAY_NODE", $nodeOrDomNodeToPostDisplay);
          }
        }
      });

      // cleanup the initQueue
      delete postDisplayQueue;
      postDisplayQueue = [];
    }
  };

  amx.queueForInit = function($nodeOrDomNode)
  {
    initQueue.push($nodeOrDomNode);
  };

  amx.queueForPostDisplay = function($nodeOrDomNode)
  {
    postDisplayQueue.push($nodeOrDomNode);
  }

  // flag that set who should process the queues
  amx.mustProcessQueues = true;

  /**
   * Create and insert a new view container element (no content yet).
   * @return {HTMLElement} the newly-created view container element
   */
  adf.mf.internal.amx._createViewContainerElement = function()
  {
    var viewContainerElement = document.createElement("div");
    viewContainerElement.className = "amx-view-container new";
    // TODO consider injecting placeholder DOM here so it isn't completely blank
    amx.$bodyPage.get(0).appendChild(viewContainerElement);
    return viewContainerElement;
  }

  /**
   * Processes all the bundles on the page
   * @private
   * @param {adf.mf.api.amx.AmxTag} amxTag the root tag of the page
   * @return {Object} promise object that is resolved once all bundles have been loaded
   */
  function loadBundles(amxTag)
  {
    // --- loadBundles --- //
    var bundles = amxTag.findTags(
      "http://xmlns.oracle.com/adf/mf/amx",
      "loadBundle");

    return amx.serialResolve(bundles,
      function(loadBundle)
      {
        if (!adf.mf.environment.profile.dtMode)
        {
          var basename = loadBundle.getAttribute("basename");
          var variable = loadBundle.getAttribute("var");

          return amx.loadBundle(basename, variable);
        }
      });
  }

  /**
   * Load and display an AMX page.
   * @param {Object} amxPageName the name of the page to load
   * @return {Object} promise object that is resolved once the page has been rendered. Currently
   *         resolved with the jQuery object for the view container element
   */
  adf.mf.api.amx.displayAmxPage = function(amxPageName) /* used by base-controller.js */
  {
    adf.mf.api.amx.showLoadingIndicator();
    var dfd = $.Deferred();

    displayAmxPageImpl(amxPageName, dfd);

    return dfd.promise();
  }

  function displayAmxPageImpl(amxPageName, dfd)
  {
    // Ensure that we can enter the critical section
    if (adf.mf.internal.amx._isInsideCriticalSection())
    {
      adf.mf.internal.amx._queueCriticalSectionFunction(
        displayAmxPageImpl,
        this,
        amxPageName,
        dfd);
      return;
    }

    // Prevent any data change events from processing while the page is loading and the
    // node hierarchy is being built
    adf.mf.internal.amx._enterCriticalSection();

    adf.mf.api.addBatchDataChangeListener(adf.mf.internal.amx._handleBatchDataChangeListener);

    adf.mf.internal.perf.start("amx.GetPagetInitContext", amxPageName);
    //we get the page
    var dfdAmxPageTag = getAmxTagForPage(amxPageName); // This must be a DFD because it is an AJAX call.

    var dfdData = initData(amxPageName); // initializes the context

    // clear the bindings
    amx.clearBindings();

    // set to false so that every sub renders does not process the queues
    amx.mustProcessQueues = false;

    // When amxPage, initData, and initUI resolve, we continue:
    $.when(dfdAmxPageTag, dfdData, initUI())
      .fail(
        function()
        {
          // TODO: print error
          adf.mf.internal.amx._leaveCriticalSection();
          adf.mf.api.amx.hideLoadingIndicator();
        })
      .done(
        function(amxPageTag, dataSuccess)
        {
          // Load the message bundles before evaluating any EL
          adf.mf.internal.perf.start("amx.loadBundles", amxPageTag);
          var bundleDfd = loadBundles(amxPageTag);
          bundleDfd
            .fail(
              function()
              {
                adf.mf.internal.perf.stop("amx.loadBundles", amxPageTag);
                adf.mf.internal.perf.stop("amx.GetPagetInitContext", amxPageName);
              })
            .done(
              function()
              {
                adf.mf.internal.perf.stop("amx.loadBundles", amxPageTag);
                // Build the AMX node tree once the tags have been loaded
                var dfdBuildNodes = buildAmxNodeTree(amxPageName, amxPageTag);

                // Resume any queued critical section requests
                adf.mf.internal.amx._leaveCriticalSection();

                // Wait for the EL to arrive so that we may render the page
                dfdBuildNodes
                  .fail(
                    function()
                    {
                      adf.mf.internal.perf.stop("amx.GetPagetInitContext", amxPageName);
                    })
                  .done(
                    function(amxPageNode)
                    {
                      //debugPrintAmxNodeTree(amxPageNode);

                      // We render the page
                      adf.mf.internal.perf.stop("amx.GetPagetInitContext", amxPageName);
                      adf.mf.internal.perf.start("amx.render", amxPageNode);
                      var $pageContent;
                      try
                      {
                        $pageContent = amxPageNode.renderNode();
                      }
                      finally
                      {
                        adf.mf.internal.perf.stop("amx.render", amxPageName);
                      }

                      adf.mf.internal.perf.start("amx.render.done", amxPageName);
                      try
                      {
                        var $viewContainer;
                        if (adf.mf.internal.amx.isTransitionAfterRender(isFirstPage)) // render before transitioning
                        {
                          // TODO: remove jQ code and stop using string concatination with HTML
                          $viewContainer = $("<div data-pageName='" + amxPageName +
                          "' class='amx-view-container'></div>");
                          $viewContainer.addClass("new");

                          amx.$bodyPage.append($viewContainer); // TODO: remove jQ

                          //make sure the class are consistent
                          $viewContainer.removeClass("old").addClass("new");
                        }
                        else // use placeholder transitioning
                        {
                          var viewContainerElement;
                          if (isFirstPage)
                          {
                            // Since we are not doing a navigation, we have to create the element ourselves:
                            viewContainerElement = adf.mf.internal.amx._createViewContainerElement();
                          }
                          else
                          {
                            // The element was already created in the doNavigation code (where it might kick off a
                            // transition animation) so just get it and use it:
                            var viewContainerElements = document.getElementsByClassName("amx-view-container");
                            viewContainerElement = viewContainerElements[viewContainerElements.length - 1];
                          }
                          $viewContainer = $(viewContainerElement);

                          viewContainerElement.setAttribute("data-pageName", amxPageName);
                        }

                        $viewContainer.empty().append($pageContent);

                        //TODO: needs to move this refresh above
                        // We process and clean the initQueue
                        amx.processAndCleanInitQueue();

                        //If it is the first page, we handler the display
                        if (isFirstPage)
                        {
                          $viewContainer.removeClass("new").addClass("current");
                          isFirstPage = false;
                        }

                        amx.processAndCleanPostDisplayQueue();

                        // reset to true
                        amx.mustProcessQueues = true;
                        dfd.resolve($viewContainer);
                      }
                      finally
                      {
                        adf.mf.internal.perf.stop("amx.render.done", amxPageName);
                        adf.mf.api.amx.hideLoadingIndicatorOnlyIfFirstTime();
                      }
                   });
              });
        });
  }

  // ------ resource loading ------ //
  var loadedJavaScriptResources = {};
  var loadedCssResources = {};
  var loadingCssLinks = [];
  var cssLoadingCheckInterval = null;
  var cssLoadingWaitStarted = 0;
  var cssLastCheckSheetCount = 0;

  /**
   * Internal function for loading JS files
   * @param {String} resourceName the resource to load
   * @param {Boolean} async whether the request should be asynchronous
   * @param {Function} successCB the JSON could be parsed
   * @param {Function} errorCB the JSON could not be parsed
   * @param {Function} filterCB the optional filter function that can change the response text before it is used
   */
  adf.mf.internal.amx._loadJsFile = function(resourceName, async, successCB, errorCB, filterCB)
  {
    if (filterCB == null)
    {
      // Can let the page load it without filtering:
      var head = document.getElementsByTagName("head")[0];
      var script = document.createElement("script");
      script.type = "text/javascript";
      script.src = resourceName;
      script.async = async;
      script.onload = successCB;
      script.onerror = errorCB;
      head.appendChild(script);
    }
    else
    {
      // Must filter the response text:
      adf.mf.internal.amx._loadFileWithAjax(
        resourceName,
        async,
        function(responseText)
        {
          if ((responseText != null) && (responseText.length > 0))
          {
            // Filter it:
            var result = filterCB(responseText);

            // Execute it:
            try
            {
              (new Function(result))();
              successCB();
            }
            catch (problem)
            {
              console.log(resourceName);
              console.log(problem);
              errorCB(problem);
            }
          }
          else
          {
            errorCB("Empty response");
          }
        },
        errorCB);
    }
  };

  /**
   * Internal function for loading JSON files
   * @param {String} resourceName the resource to load
   * @param {Boolean} async whether the request should be asynchronous
   * @param {Function} successCB the JSON could be parsed
   * @param {Function} errorCB the JSON could not be parsed
   */
  adf.mf.internal.amx._loadJsonFile = function(resourceName, async, successCB, errorCB)
  {
    // Load the json:
    adf.mf.internal.amx._loadFileWithAjax(
      resourceName,
      async,
      function(responseText)
      {
        if ((responseText != null) && (responseText.length > 0))
        {
          var result = jQuery.parseJSON(responseText);
          successCB(result);
        }
        else
        {
          errorCB("Empty response");
        }

      },
      errorCB);
  };

  /**
   * Internal function for loading XML files
   * @param {String} resourceName the resource to load
   * @param {Boolean} async whether the request should be asynchronous
   * @param {Function} successCB the JSON could be parsed
   * @param {Function} errorCB the JSON could not be parsed
   */
  adf.mf.internal.amx._loadXmlFile = function(resourceName, async, successCB, errorCB)
  {
    //  Load the XML:
    adf.mf.internal.amx._loadFileWithAjax(
      resourceName,
      async,
      function(responseText)
      {
        if ((responseText != null) && (responseText.length > 0))
        {
          var parser = new DOMParser();
          var amxPage = parser.parseFromString(responseText, "text/xml");
          var firstTag = null;
          var possibleFirstTag = amxPage.firstChild;
          while (firstTag == null && possibleFirstTag != null)
          {
            if (possibleFirstTag.nodeType == 1) // an element
              firstTag = possibleFirstTag;
            else
              possibleFirstTag = possibleFirstTag.nextSibling;
          }
          if (firstTag != null)
          {
            var amxPageTag = new adf.mf.api.amx.AmxTag(null, firstTag);
            adf.mf.internal.amx._preProcessTagTree(amxPageTag);
            successCB(amxPageTag);
          }
          else
          {
            errorCB("No root view tag found");
          }
        }
        else
        {
          errorCB("Empty response");
        }
      },
      errorCB);
  };

  /**
   * Internal function for loading files over an AJAX get.
   * @param {String} resourceName the resource to load
   * @param {Function} successCB the JSON could be parsed
   * @param {Function} errorCB the JSON could not be parsed
   */
  adf.mf.internal.amx._loadFileWithAjax = function(resourceName, async, successCB, errorCB)
  {
    var request = new XMLHttpRequest();

    if (async)
    {
      request.onreadystatechange = function()
      {
        if (request.readyState == 4)
        {
          successCB(request.responseText);
          return;
        }
      }
    }

    request.open("GET", resourceName, async);
    request.send(null);

    if (!async)
    {
      if (request.readyState == 4)
      {
        successCB(request.responseText);
        return;
      }

      errorCB("No response");
    }
  };

  /**
   * Function to load a JavaScript file
   * @param {String} src the URI to the JavaScript file
   * @return {Object} jQuery deferred object that is resolved once the script has been loaded.
   */
  amx.includeJs = function(src)
  {
    if (loadedJavaScriptResources[src])
    {
      return $.Deferred().resolve();
    }

    var dfd = $.Deferred();
    // Use an XHR to retrieve the JavaScript. Usage of an XHR allows us to be notified
    // of when the script has been loaded, or has failed to load to be able to correctly
    // invoke the correct method on the deferred jQuery object.

    adf.mf.internal.amx._loadJsFile(
      src,
      false,
      function()
      {
        // TODO this either needs to be removed or needs to be promoted to a formal debug message; do not use amx.log
        amx.log.debug("Successfully loaded JavaScript "+src);
        dfd.resolve();
      },
      function()
      {
        adf.mf.api.adf.logInfoResource(
          "AMXInfoBundle",
          adf.mf.log.level.SEVERE,
          "amx.includeJs",
          "MSG_FAILED_TO_LOAD",
          src);
        dfd.reject();
      },
      function(responseText)
      {
        // Permit debugging of the source (currently only works in firebug, google chrome
        // and webkit nightly):
        responseText += "\n//@ sourceURL="+src;
        return responseText;
      });

    // TODO this either needs to be removed or needs to be promoted to a formal debug message; do not use amx.log
    amx.log.debug("Sent request for JS script source: " + src);
    loadedJavaScriptResources[src] = true;

    return dfd;
  }

  /**
   * Function that checks for the completion of loading CSS files
   * (polls from a callback from a window interval)
   */
  function waitTillCssLoaded()
  {
    var styleSheets = document.styleSheets;
    var numStyleSheets = styleSheets.length;

    // Don't bother checking if the count has not changed from the last poll
    if (cssLastCheckSheetCount == numStyleSheets)
    {
      return;
    }
    cssLastCheckSheetCount = numStyleSheets;
    // Loop through all the nodes that we are still waiting to finish loading
    for (var i = 0; i < loadingCssLinks.length; ++i)
    {
      var obj = loadingCssLinks[i];
      var nonLoadedNode = obj["node"];

      for (var j = 0; j < numStyleSheets; ++j)
      {
        var linkNode = styleSheets[j].ownerNode;
        // See if this style sheet is for the node we are waiting to be loaded.
        if (nonLoadedNode == linkNode)
        {
          // When the style sheet appears in the styleSheets collection,
          // it has finished loading
          var dfd = obj["deferred"];
          dfd.resolve(linkNode);

          // Remove the item from the array
          loadingCssLinks.splice(i--, 1);
          // TODO this either needs to be removed or needs to be promoted to a formal debug message; do not use amx.log
          amx.log.debug("CSS resource loaded: " + obj["path"]);

          if (loadingCssLinks.length == 0)
          {
            // We are not waiting on any more nodes
            window.clearInterval(cssLoadingCheckInterval);
            cssLoadingCheckInterval = null;
            return;
          }

          break;
        }
      }
    }

    var timeWaiting = new Date().getMilliseconds() - cssLoadingWaitStarted;
    // Since the code is not notified of CSS files that failed to load, only way for a maximum
    // of 5 seconds for all CSS files to load and then throw an error
    if (timeWaiting >= 5000)
    {
      for (var index = 0, size = loadingCssLinks.length; i < size; ++i)
      {
        var obj = loadingCssLinks[index];
        // Notify the listener that the resource failed to load
        obj["deferred"].reject();
        adf.mf.log.logInfoResource("AMXInfoBundle", adf.mf.log.level.SEVERE,
          "amx.includeCss",
          "MSG_FAILED_TO_LOAD", obj["path"]);
      }
      loadingCssLinks = [];
      window.clearInterval(cssLoadingCheckInterval);
      cssLoadingCheckInterval = null;
    }
  };

  /**
   * Function to load a CSS file
   * @param {String} path the URI to the CSS file
   * @return {Object} jQuery deferred object that is resolved once the style sheet has been loaded.
   */
  amx.includeCss = function(path)
  {
    if (loadedCssResources[path])
    {
      // Return a deferred object already resolved to indicate that the source
      // has already been loaded
      return $.Deferred().resolve();
    }

    // Currently, the only supported means in WebKit browsers to determine if a style sheet has
    // finished loading is to check for the style sheet to appear in the document.styleSheets
    // collection. There are no events that are associated with the loading, so polling this
    // collection is the only means, at the moment, to determine this information.
    //
    // We need to use a <link> tag so that the URLs in the CSS are preserved. If we were to
    // attempt to use a <style> tag and inject the content from the CSS file into the page, the
    // relative URLs would no longer work.

    // First add the
    var node = $("<link rel='stylesheet' type='text/css' />")
      .attr("href", path)
      .appendTo(document.head).get(0);

    // TODO this either needs to be removed or needs to be promoted to a formal debug message; do not use amx.log
    amx.log.debug("Added CSS resource: " + path);
    loadedCssResources[path] = true;

    var loadedDfd = $.Deferred();

    // Store an object with the deferred object to be able to notify when loaded,
    // and the node to check to see when the loading has completed.
    loadingCssLinks.push(
      {
        "path": path,
        "node": node,
        "deferred": loadedDfd
      });

    // See if a timer has already been started, if not start one to poll the document.styleSheets
    // collection
    if (cssLoadingCheckInterval == null)
    {
      // Use a 10ms timeout. These resources are local to the device, so it should not take long
      // for them to be loaded.
      cssLoadingCheckInterval = window.setInterval(waitTillCssLoaded, 10);
    }

    // Set or reset when we started to wait for the CSS to load. This leaves a maximum wait time
    // of 5 seconds from the last CSS file added.
    cssLoadingWaitStarted = new Date().getMilliseconds();

    // Return the deferred object so that the caller may be notified once the CSS file has been
    // completely loaded
    return loadedDfd;
  };
  // ------ /resource loading ------ //

  // TODO: add more comments to the iterator implementation classes below
  /**
   * Iterator object to support iterating over a JavaScript items array with hasNext and next methods
   */
  function ArrayIterator(items)
  {
    this._items = items;
    this._index = -1;
    this._length = items.length;
  }
  ArrayIterator.prototype = {
    next: function()
    {
      return this.hasNext() ?
        this._items[++this._index] : undefined;
    },

    hasNext: function()
    {
      return this._index + 1 < this._length;
    },

    isTreeNodeIterator: function()
    {
      return false;
    },

    getAvailableCount: function()
    {
      return this._length;
    },

    getTotalCount: function()
    {
      return this._length;
    },

    getRowKey: function()
    {
      if (this._index == -1)
      {
        return null;
      }

      var currentItem = this._items[this._index];
      return currentItem == null ? null :
        typeof currentItem["rowKey"] === "function" ?
          currentItem.rowKey() : this._index;
    },

    /**
     * Sets the index to the value specified. Note that calling next will cause
     * the item after this index to be returned. Therefore, calling the function
     * with -1 will cause the next item to load to be the first item (index 0).
     */
    setCurrentIndex: function(index)
    {
      this._index = index;
    },

    /**
     * Sets the current item by the row key
     * @param {string} rowKey the row key
     * @return {boolean} true if the rowKey was found, false otherwise
     */
    setCurrentRowKey: function(rowKey)
    {
      this._index = -1;
      while (this.hasNext())
      {
        this.next();
        if (this.getRowKey() == rowKey)
        {
          return true;
        }
      }

      return false;
    }
  };

  /**
   * Iterator object to use with TreeNodeIterator with hasNext and next methods
   */
  function TreeNodeIteratorWrapper(items)
  {
    this._first = true;
    this._items = items;
  }
  TreeNodeIteratorWrapper.prototype = {
    next: function()
    {
      if (this._first)
      {
        this._first = false;
        return this._items.localFirst();
      }

      return this._items.localNext();
    },

    hasNext: function()
    {
      if (this._first)
      {
        return this._items.localFirst() !== undefined;
      }
      return this._items.hasNext() && this._items.getCachedRowCount(this._items.index + 1) > 0;
    },

    isTreeNodeIterator: function()
    {
      return true;
    },

    getAvailableCount: function()
    {
      return this._items.getCachedRowCount(0);
    },

    getTotalCount: function()
    {
      return this._items.treeNodeBindings.keys.length;
    },

    getRowKey: function()
    {
      if (this._first)
      {
        return null;
      }

      return this._items.getCurrentKey();
    },

    /**
     * Sets the index to the value specified. Note that calling next will cause
     * the item after this index to be returned. Therefore, calling the function
     * with -1 will cause the next item to load to be the first item (index 0).
     */
    setCurrentIndex: function(index)
    {
      this._items.setCurrentIndex(index);
      this._first = index == -1;
    },

    /**
     * Sets the current item by the row key
     * @param {string} rowKey the row key
     * @return {boolean} true if the rowKey was found, false otherwise
     */
    setCurrentRowKey: function(rowKey)
    {
      this._first = false;
      return this._items.setCurrentRowKey(rowKey);
    }
  };

  /**
   * Create an iterator that will support either a JavaScript array of objects or iterator over a
   * tree node iterator (collection model).
   * @param {array || TreeNodeIterator} the items to iterate over
   * @return {Object} iterator object with next, hasNext isTreeNodeIterator functions.
   *         next will return undefined when no more objects are available.
   */
  adf.mf.api.amx.createIterator = function(items)
  {
    if (items[".type"] === "TreeNodeIterator")
    {
      return new TreeNodeIteratorWrapper(items);
    }
    else
    {
      return new ArrayIterator(items);
    }
  };

  /**
   * Convenient method to sequentialy resolve each item of an array. If the itemResolver method returns a deferred, it will wait until resolved before processing the next element.
   * If the itemResolver returns the direct value, it will to the next item;
   * @param {array || TreeNodeIterator} items is the array or the TreeNodeIterator to iterate threw
   * @param {function} itemResolver(item) function that will resolve the item. Can return the value or a deferred that will resolve with the value
   * @return {Deferred} Deferred that will resolve with the array of values returned by the item resolver
   */
  amx.serialResolve = function(items,itemResolver)
  {
    var _type;

    try
    {
      if (adf.mf.log.Performance.isLoggable(adf.mf.log.level.FINEST))
      {
        adf.mf.internal.perf.trace("amx.serialResolve", "items is of type: " + items.constructor.name + " or " + items[".type"]);
      }
      _type = items.constructor.name || items[".type"];
    }
    catch (te)
    {
      /* ignore */
    }

    if (_type === "TreeNodeIterator")
    {
      return amx.iteratorResolve(items, itemResolver);
    }
    else
    {
      var dfd = $.Deferred();
      var results = [];
      var i = 0;

      function resolveAndNext()
      {
        if (i < items.length)
        {
          var item = items[i];
          var itemResolverResult = itemResolver(item, i);

          // if it is a promise (but not a jquery object, which is also a promise), then, pipe it
          if (typeof itemResolverResult !== "undefined" && itemResolverResult !== null && $.isFunction(itemResolverResult.promise) && !itemResolverResult.jquery)
          {
            itemResolverResult.done(function (result)
            {
              results.push(result);
              i += 1;
              resolveAndNext();
            })
            .fail(function (result)
            {
              adf.mf.log.logInfoResource("AMXInfoBundle", adf.mf.log.level.SEVERE, "resolveAndNext", "MSG_SERIAL_RESOLVE_DEFERRED_REJECTED", i);
              dfd.reject();
            });
          }
          else
          {
            // if it is a normal object or a jqueryObject, then, just push the value and move to the next
            results.push(itemResolverResult);
            i += 1;
            resolveAndNext();
          }
        }
        else
        {
          // once we run out
          dfd.resolve(results);
        }
      }
      resolveAndNext();
      return dfd.promise();
    }
  };
  /**
   * Determine if parameter is a finite number
   * @param {Object} n is the object to check
   */
  adf.mf.internal.amx.isFiniteNumber = function (n)
  {
    return !isNaN(parseFloat(n)) && isFinite(n);
  };

  /**
   * Iterates over items provided by elNodeIterator and executes itemResolver for each item.  The number of iterations can be
   * limited by providing maxIterations.  If the itemResolver method returns a deferred, it will wait until resolved before processing the next element.
   * If the itemResolver returns the direct value, it will do the next item.
   * @param {TreeNodeIterator} elNodeIterator is the iterator to iterate over
   * @param {function} itemResolver(item) function that will resolve the item. Can return the value or a deferred that will resolve with the value
   * @param {Object} maxIterations specifies the maximum number of iterations to perform
   */
  amx.iteratorResolve = function(elNodeIterator,itemResolver,maxIterations)
  {
    var dfd = $.Deferred();
    var results = [];
    var methodNext = "first";
    var rowCount = 0;
    var _maxIterations = Infinity;
    if (maxIterations)
    {
      _maxIterations = maxIterations;
    }

    function resolveNext()
    {
      if (elNodeIterator.hasNext() && rowCount < _maxIterations)
      {
        elNodeIterator[methodNext](function(a,b)
        {
          methodNext = "next";
          var item = b[0].value;

          //FIXME: for now, turn this off for debugging
          var itemResolverResult = itemResolver(item,elNodeIterator.getCurrentIndex());

          // if it is a promise (but not a jquery object, which is also a promise), then, pipe it
          if (typeof itemResolverResult !== "undefined" && itemResolverResult !== null && $.isFunction(itemResolverResult.promise) && !itemResolverResult.jquery)
          {
            itemResolverResult.done(function(result)
            {
              results.push(result);
              ++rowCount;
              resolveNext();
            });
          }
          else
          {
            // if it is a normal object or a jqueryObject, then, just push the value and move to the next
            results.push(itemResolverResult);
            ++rowCount;
            resolveNext();
          }
        }, function(a,b)
        {
          adf.mf.log.logInfoResource("AMXInfoBundle", adf.mf.log.level.SEVERE, "resolveNext", "MSG_ITERATOR_FIRST_NEXT_ERROR", a, b);
        });
      }
      else
      {
        dfd.resolve(results);
      }
    }
    resolveNext();

    return dfd.promise();
  };

  /*TreeNodeIterator
k: id
k: treeNodeBindings
k: index
k: currentKey
k: createRow
k: first
k: getCurrentIndex
k: getCurrentKey
k: getCurrentRow
k: hasNext
k: hasPrevious
k: last
k: next
k: nextSet
k: previous
k: previousSet
k: refresh
k: setCurrentIndex
k: fetch
k: getKeys
k: removeCurrentRow
k: setCurrentRowWithKey
k: fetchSet
k: fetchProviderByKey
k: updateKeys
   */

  // ------ /Public API ------ //

  function initUI()
  {
    if (initDfd)
    {
      return initDfd;
    }
    else
    {
      initDfd = $.Deferred();
      // adf.mf.environment.profile.mockData=true for the DT as well as the RT test harness mode. The DT
      // requires that featureLevelIncludes.jso be in the feature root, NOT relative
      // to the directory of the AMX
      if (adf.mf.environment.profile.mockData)
      {
        adf.mf.internal.amx._loadJsonFile(
          adfc.Util.addFeatureRootPrefix("featureLevelIncludes.jso"),
          true,
          function(data)
          {
            loadIncludes(data);
            initDfd.resolve();
          },
          function()
          {
            // do nothing, no config.
            initDfd.resolve();
          });
      }
      else
      {
        container.internal.device.integration.getAmxIncludeList(function(includes)
        {
          loadIncludes(includes);
          initDfd.resolve();
        }, function(er)
        {
          adf.mf.log.logInfoResource("AMXInfoBundle", adf.mf.log.level.SEVERE, "initUI", "MSG_AMX_INCLUDE_FAILED", er);
          initDfd.resolve();
        });
      }
      return initDfd;
    }
  }

  function loadIncludes(includes)
  {
    if (includes)
    {
      $.each(includes, function(idx, include)
      {
        var file = include.file;
        if (!amx.hasProtocol(file))
        {
          file = adfc.Util.addFeatureRootPrefix(include.file);
        }
        if (include.type == "StyleSheet")
        {
          amx.includeCss(file);
        }
        else if (include.type == "JavaScript")
        {
          amx.includeJs(file);
        }
      });
    }
  }

  function initData(amxPageName)
  {
    return mockInitData(amxPageName)
  }

  var initDataDone = false;

  function mockInitData(pagename)
  {
    var mockInitDataDfd = $.Deferred();
    // if the data has not been initialized, and we are not in the Oracle Shell (ADFMobile undefined), then, we load the model.jso
    //TODO: need to add condition for :  typeof ADFMobile === "undefined" & and !forceInitDataMock
    if (!initDataDone && adf.mf.environment.profile.mockData)
    {
      // before we do anything, make sure all of the el gets set up by trying to retrieve the application scope
      // this will allow any data in model.jso that isn't bindings related to not get over-written
      adf.mf.el.getLocalValue("#{applicationScope}");
      pagename = pagename || "nopage";
      // adf.mf.environment.profile.mockData=true for the DT as well as the RT test harness mode. The DT
      // requires that model.jso be in the feature root, NOT relative
      // to the directory of the AMX
      adf.mf.internal.amx._loadJsonFile(
        adfc.Util.addFeatureRootPrefix("model.jso"),
        true,
        function(data)
        {
          if (data)
          {
            //model = data;
            //adf.mf.el.addVariable("bindings", data);
            $.each(data,function(key,value)
            {
              adf.mf.el.addVariable(key, value);
            });

            adf.mf.el.addVariable("applicationScope", {});
            adf.mf.el.addVariable("pageFlowScope", {});
            initDataDone = true;
            adf.mf.log.logInfoResource("AMXInfoBundle", adf.mf.log.level.INFO, "mockInitData", "MSG_AMX_MODEL_JSO_LOADED");
            mockInitDataDfd.resolve();
          }
          else
          {
            adf.mf.log.logInfoResource("AMXInfoBundle", adf.mf.log.level.INFO, "mockInitData", "MSG_NO_MODEL_JSO_FOUND");
            adf.mf.environment.profile.mockData = false;
            mockInitDataDfd.resolve();
          }
        },
        function()
        {
          adf.mf.log.logInfoResource("AMXInfoBundle", adf.mf.log.level.INFO, "mockInitData", "MSG_NO_MODEL_JSO_FOUND");
          adf.mf.environment.profile.mockData = false;
          mockInitDataDfd.resolve();
        });
    }
    else
    {
      mockInitDataDfd.resolve();
    }

    // adf.mf.internal.perf.stop("amx.mockInitData");

    //return mockInitDataDfd.pipe(initContext(pagename));
    return mockInitDataDfd.pipe(function()
    {
      return initContext(pagename);
    });
  }

  function initContext(amxPageName)
  {
    var dfd = $.Deferred();
    if (!adf.mf.environment.profile.mockData)
    {
      // Per Bruce instruction, first, we setContext "" to reset
// TODO temporarily added due to unit test failures:
      adf.mf.internal.perf.start("initContext: Blank Page", amxPageName);

      adf.mf.api.setContext(
        "",
        function()
        {
          // then, we setContext with the pageName
          adf.mf.internal.perf.stop("initContext: Blank Page", amxPageName);
          adf.mf.internal.perf.start("initContext: New Page", amxPageName);

          // Prime the EL values for the a variable that will be used in
          // adf.mf.internal.amx.isTransitionAfterRender:
          amx.getElValue("#{applicationScope.configuration.amxTransitionMode}", true);

          adf.mf.api.setContext(
            amxPageName,
            function()
            {
              adf.mf.internal.perf.stop("initContext: New Page", amxPageName);
              dfd.resolve();
            },
            function(ex)
            {
              adf.mf.log.logInfoResource("AMXInfoBundle", adf.mf.log.level.WARNING, "initContext", "MSG_SET_CONTEXT_FAILED", amxPageName, ex);
              adf.mf.internal.perf.stop("initContext: New Page", amxPageName);
              dfd.resolve();
           });
        },
        function(ex)
        {
          adf.mf.log.logInfoResource("AMXInfoBundle", adf.mf.log.level.SEVERE, "initContext", "MSG_SET_CONTEXT_EMPTY_STRING_FAILED", ex);
          adf.mf.internal.perf.stop("initContext: Blank Page", amxPageName);
          dfd.resolve();
        });
    }
    else
    {
      dfd.resolve();
    }
    return dfd.promise();
  }

  // pageStructAndDef data by pageName
  var amxPages = {};

  // data by pageName
  var amxData = {};

  /**
   * Load a new instance of the amxPage JSON structure.
   * Returns a Deferred that will resolve with the amxPage JSON Structure. <br />
   *
   * @param {Object} amxPageName
   */
  function loadAmxPage(amxPageName)
  {
    var dfd = $.Deferred();

    var pageFullPath = adfc.Util.addFeatureRootPrefix(amxPageName);

    adf.mf.internal.amx._loadXmlFile(
      pageFullPath,
      true,
      function(data)
      {
        dfd.resolve(data);
      },
      function()
      {
        dfd.reject("Unable to load the XML file: " + pageFullPath);
      });

    return dfd.promise();
  }

  /**
   * Return a Deferred object that will get resolved with the amxPage root tag.
   * This will first try to get it from the cache, or load it if needed.
   *
   * @param {Object} amxPageName
   */
  function getAmxTagForPage(amxPageName)
  {
    var dfd = $.Deferred();

    // Note that we are caching the tag hierarchy per page. If there is ever a problem with the
    // retained AMX tag hierarchies taking up too much RAM, then we should remove the cache and
    // regenerate the tags from the XML each time.
    var amxPageTag = amxPages[amxPageName];

    if (amxPageTag)
    {
      dfd.resolve(amxPageTag);
    }
    else
    {
      var loaderDfd = loadAmxPage(amxPageName);

      loaderDfd.done(function(amxPageTag)
      {
        amxPages[amxPageName] = amxPageTag;
        dfd.resolve(amxPageTag);
      }).fail(function()
      {
        // forward the failure argument to the dfd
        var args = Array.prototype.slice.call(arguments);
        dfd.reject.apply(dfd, args);
      });
    }

    return dfd.promise();
  }

  var transitionDic = {};

  amx.registerTransitionHandler = function(name,func)
  {
    transitionDic[name] = func;
  }

  amx.getTransitionHandler = function(name)
  {
    return transitionDic[name];
  }

  /**
   * Get the AmxNode root node for the currently loaded page.
   *
   * @return {adf.mf.api.amx.AmxNode|null} the amx node or null if the
   *         page is not loaded.
   */
  adf.mf.api.amx.getPageRootNode = function()
  {
    return amxPageRootNode;
  }

  /**
   * Object used by the functions in markNodeForUpdate to pass the state
   * of the changes between the functions.
   * @private
   */
  function AmxNodeChangesResults()
  {
    this._affectedNodeIds = {};
    this._affectedNodes = [];

    this._nodesToRecreate = [];

    this._descendentChanges = {};
    this._ancestorNodes = [];

    this._attributeChanges = {};

    this._changeResult = {};

    this._initialStates = {};
  }

  AmxNodeChangesResults.prototype =
  {
    /**
     * Get the array of AMX nodes that have been changed and need to
     * be visited during the application of render changes.
     * @return {Array.<adf.mf.api.amx.AmxNode>} array of AMX nodes to visit
     */
    getAffectedNodes: function()
    {
      return this._affectedNodes;
    },

    /**
     * Get the result of the updateChildren function for an affected AMX node.
     * @param {int} amxNodeId the ID of the AMX node
     * @return {int|null} the result or null. One of the adf.mf.api.amx.AmxNodeChangeResult
     *         constants
     */
    getChangeResult: function(amxNodeId)
    {
      return this._changeResult[amxNodeId];
    },

    /**
     * Get the change result for a given AMX node ID
     * @param {int} amxNodeId the ID of the AMX node
     * @return {adf.mf.api.amx.AmxAttributeChange|null} the attribute change object or null
     *         if the node was not affected
     */
    getAttributeChanges: function(amxNodeId)
    {
      return this._attributeChanges[amxNodeId];
    },

    /**
     * Get the AMX nodes that need to be re-created
     * @return {Array.<adf.mf.api.amx.AmxNode>} array of AMX nodes to re-create
     */
    getAmxNodesToRecreate: function()
    {
      return this._nodesToRecreate;
    },

    /**
     * Get the AMX nodes that have been queued to see if they can handle changes to descendents
     * @return {Array.<adf.mf.api.amx.AmxNode>} array of AMX ancestor nodes
     */
    getAmxNodesForDescendentChanges: function()
    {
      return this._ancestorNodes;
    },

    /**
     * Get the AMX descedent changes for a given ancestor AMX node ID
     * @param {int} amxNodeId the ID of the ancestor AMX node
     * @return {adf.mf.api.amx.AmxDescendentChanges|null} the changes object or null if the node
     *         has no descendent changes.
     */
    getDescendentChanges: function(amxNodeId)
    {
      return this._descendentChanges[amxNodeId];
    },

    /**
     * Notifies this object that a node has been recreated
     * @param {adf.mf.api.amx.AmxNode} oldAmxNode node that was re-created
     * @param {adf.mf.api.amx.AmxNode} newAmxNode re-created node
     */
    amxNodeRecreated: function(oldAmxNode, newAmxNode)
    {
      var index = this._affectedNodes.indexOf(oldAmxNode);
      if (index != -1)
      {
        this._affectedNodes[index] = newAmxNode;
      }

      var wasRendered = (oldAmxNode.isRendered() &&
        document.getElementById(oldAmxNode.getId()) != null);

      if (wasRendered)
      {
        // If the node was rendered, and still is, we will just swap the root DOM
        // in place
        var id = newAmxNode.getId();
        if (newAmxNode.isRendered())
        {
          this._changeResult[id] = adf.mf.api.amx.AmxNodeChangeResult["RERENDER"];
        }
        else
        {
          // Otherwise we need to mark the parent to be re-rendered
          var initialState = this._initialStates[id];
          var attributeChanges = this._attributeChanges[id];
          var renderedAmxNode = newAmxNode.__getClosestRenderedNode(true);

          this._markNodeAffected(renderedAmxNode);
          this._queueCallToAncestor(newAmxNode, initialState, attributeChanges, renderedAmxNode);
        }
      }
    },

    /**
     * Called after calling the ancestor nodes getDescendentChangeAction function to see how
     * a change should be handled.
     * @param {adf.mf.api.amx.AmxNode} amxNode the ancestor AMX node.
     * @param {int} descendentChangeResult the value returned from getDescendentChangeAction
     */
    setDescendentChangesResult: function(
      amxNode,
      descendentChangeResult)
    {
      var amxNodeId = amxNode.getId();
      var currentResult = this._changeResult[amxNodeId];

      // If the node is not already marked for another change or if the
      // descendent changes require a more invasive change, then store the result
      // from asking about the descendent refresh changes
      if (currentResult == null || descendentChangeResult > currentResult)
      {
        this._changeResult[amxNodeId] = descendentChangeResult;

        if (descendentChangeResult != adf.mf.api.amx.AmxNodeChangeResult["NONE"])
        {
          this._markNodeAffected(amxNode);
        }
      }
    },

    /**
     * During the application of changes, adds a change result to this object.
     * @param {adf.mf.api.amx.AmxNode} amxNode the affected AMX node
     * @param {int} initialState one of the AMX node state constants representing the node
     *        state before the attributes and children were updated
     * @param {adf.mf.api.amx.AmxAttributeChange} attributeChanges the attribute changes
     *        object for the AMX node
     * @param {int} changeResult the change result returned from updateChildren
     */
    addChangeResult: function(
      amxNode,
      initialState,
      attributeChanges,
      changeResult)
    {
      // Get the closest ancestor rendered AMX node
      var renderedAmxNode = amxNode.__getClosestRenderedNode(true);

      var id = amxNode.getId();

      this._initialStates[id] = initialState;
      this._attributeChanges[id] = attributeChanges;

      // See if this is a recreate result
      if (changeResult == adf.mf.api.amx.AmxNodeChangeResult["REPLACE"])
      {
        this._nodesToRecreate.push(amxNode);
      }

      if (renderedAmxNode == null)
      {
        // The rendered AMX node will be null if the page has not rendered yet, in that case
        // the change result does not matter
        return;
      }

      // Mark the rendered AMX node as one to visit later if the change result is not NONE
      if (changeResult != adf.mf.api.amx.AmxNodeChangeResult["NONE"])
      {
        this._markNodeAffected(renderedAmxNode);
      }

      if (renderedAmxNode === amxNode)
      {
        // Honor the change result if the affected node is currently rendered
        this._changeResult[id] = changeResult;
      }
      else
      {
        // Allow the rendered ancestor to be notified of the change
        this._queueCallToAncestor(amxNode, initialState, attributeChanges, renderedAmxNode);
      }
    },

    _markNodeAffected: function(amxNode)
    {
      var id = amxNode.getId();
      if (this._affectedNodeIds[id] !== true)
      {
        this._affectedNodeIds[id] = true;
        this._affectedNodes.push(amxNode);
      }
    },

    _queueCallToAncestor: function(
      amxNode,
      initialState,
      attributeChanges,
      renderedAmxNode)
    {
      var renderedId = renderedAmxNode.getId();

      // If the rendered AMX node is not the changed AMX node, then we need
      // to ask the rendered node if it wishes to perform a refresh instead
      // of being rerendered
      var changes = this._descendentChanges[renderedId];

      // See if this parent has already been added as one to be called
      if (changes == null)
      {
        // Create a new changes object to be used later
        changes = new adf.mf.api.amx.AmxDescendentChanges();
        this._descendentChanges[renderedId] = changes;
        this._ancestorNodes.push(renderedAmxNode);
      }

      // Add the child's attribute changes and other state to the changes object
      // so that the parent can decide if it can refresh based on the results
      changes.__addAmxNode(
        amxNode,
        initialState,
        attributeChanges);

      // Note that we do not actually call the parent at this point, that is done
      // in a later pass
    }
  };

  /**
   * Called by markNodeForUpdate to update the atributes and initialize any new nodes created
   * as a result.
   * @param {adf.mf.api.amx.AmxNode} rootNode the root AMX node of the page
   * @param {adf.mf.internal.amx.AmxNodeUpdateArguments} args the information passed to the
   *        mark node for update function
   * @private
   */
  function applyUpdatesToAmxNodeHierarchy(
    rootNode,
    args)
  {
    var isFinestLoggingEnabled = adf.mf.log.Performance.isLoggable(adf.mf.log.level.FINEST);
    var visitContext = new adf.mf.api.amx.VisitContext({ "amxNodes": args.getAffectedNodes() });
    var changes = new AmxNodeChangesResults();

    rootNode.visit(
      visitContext,
      function (
        visitContext,
        amxNode)
      {
        var nodeId = amxNode.getId();
        var affectedAttributes = args.getAffectedAttributes(nodeId);

        // Get the attributes that have changed for this node
        if (isFinestLoggingEnabled)
        {
          adf.mf.internal.perf.trace(
            "applyUpdatesToAmxNodeHierarchy",
            "Found node to apply updates. ID: " + nodeId);
        }

        var nodeWasRendered = amxNode.isRendered() &&
          document.getElementById(nodeId) != null;

        var initialState = amxNode.getState();

        // Notify the node of the changed attributes
        var collectionChanges = args.getCollectionChanges(nodeId);
        var attributeChanges = amxNode.updateAttributes(affectedAttributes, collectionChanges);

        var state = amxNode.getState();
        if (isFinestLoggingEnabled)
        {
          adf.mf.internal.perf.trace(
            "applyUpdatesToAmxNodeHierarchy",
            "Node attributes have been applied. New node state: " + state);
        }

        if (state == adf.mf.api.amx.AmxNodeStates["UNRENDERED"])
        {
          // Allow the rendered ancestor node to be notified of the change
          changes.addChangeResult(amxNode, initialState, attributeChanges,
            adf.mf.api.amx.AmxNodeChangeResult[nodeWasRendered ? "RERENDER" : "NONE"]);

          // Do not attempt to apply changes to nodes if a parent is not rendered.
          // The node should have removed all the children at this point, so this
          // function does not need to perform that logic.
          return adf.mf.api.amx.VisitResult["REJECT"];
        }

        var skipInitialization = false;
        var skipBuild;
        var changeResult;

        // Do not create or update the children of nodes in the initial state
        if (state != adf.mf.api.amx.AmxNodeStates["INITIAL"])
        {
          if (isFinestLoggingEnabled)
          {
            adf.mf.internal.perf.trace(
              "applyUpdatesToAmxNodeHierarchy",
              "Updating the children of the node");
          }

          // Update the children of the node only if the node is not in the
          // initial state. If it is, then the _buildVisitCallback below
          // will initialize the children
          changeResult = amxNode.updateChildren(attributeChanges);

          // Pick up any changes to the node's state as a result of the updateChildren
          // call.
          state = amxNode.getState();

          // Skip the initialization of the node and descendents if the updateChildren
          // call has caused the state of the node to go back to the initial state.
          // This means that the node's type handler changed the state back to initial
          // as a result of not being able to successfully create its children.
          skipBuild = (state == adf.mf.api.amx.AmxNodeStates["INITIAL"]);

          if (isFinestLoggingEnabled)
          {
            adf.mf.internal.perf.trace(
              "applyUpdatesToAmxNodeHierarchy",
              "New node state: " + state +
              ". Should the build visit callback be skipped: " + skipBuild +
              ". Update children method returned: " + changeResult);
          }
        }
        else
        {
          changeResult = adf.mf.api.amx.AmxNodeChangeResult["RERENDER"];
          skipBuild = false;
        }

        // Record the change result
        changes.addChangeResult(amxNode, initialState, attributeChanges, changeResult);

        // See if the node has requested to be recreated
        var resultIsRecreate = changeResult == adf.mf.api.amx.AmxNodeChangeResult["REPLACE"];
        if (resultIsRecreate)
        {
          skipBuild = true;
        }

        // Process the children tree under the node to initialize any newly
        // created nodes (does nothing if they are all already rendered or in the
        // unrendered state) as long as the node was able to create its children.
        if (skipBuild == false)
        {
          amxNode.visit(
            new adf.mf.api.amx.VisitContext(),
            adf.mf.internal.amx._buildVisitCallback);

          // Pick up any changes to the state as a result of initialization
          state = amxNode.getState();

          if (isFinestLoggingEnabled)
          {
            adf.mf.internal.perf.trace(
              "applyUpdatesToAmxNodeHierarchy",
              "Node state after invoking the build visit callback: " +
              state);
          }
        }

        // Do not progress down the hierarchies of nodes that are in the initial state,
        // or are not rendered or if the change result is to replace (recreate) the node
        if (resultIsRecreate ||
          state == adf.mf.api.amx.AmxNodeStates["INITIAL"] ||
          state == adf.mf.api.amx.AmxNodeStates["UNRENDERED"])
        {
          return adf.mf.api.amx.VisitResult["REJECT"];
        }
        else
        {
          return adf.mf.api.amx.VisitResult["ACCEPT"];
        }
      });

    return changes;
  }

  /**
   * Called by markNodeForUpdate to recreate any AMX nodes and their descendants.
   * @private
   */
  function recreateRequestedAmxNodes(
    rootNode,
    changeResults)
  {
    var isFinestLoggingEnabled = adf.mf.log.Performance.isLoggable(adf.mf.log.level.FINEST);

    // For each node, we actually only want the parent node in context. Therefore, go through the
    // array and collect all of the parent nodes.
    var childNodesByParentId = {};
    var affectedNodeParents = [];
    var amxNode;
    var parentId;

    var amxNodes = changeResults.getAmxNodesToRecreate();

    for (var i = 0, size = amxNodes.length; i < size; ++i)
    {
      amxNode = amxNodes[i];
      if (isFinestLoggingEnabled)
      {
        adf.mf.internal.perf.trace(
          "recreateRequestedAmxNodes",
          "Will attempt to recreate node with ID " + amxNode.getId());
      }

      var parent = amxNode.getParent();
      parentId = parent.getId();
      var children = childNodesByParentId[parentId];
      if (children == null)
      {
        children = [ amxNode ];
        childNodesByParentId[parentId] = children;
        affectedNodeParents.push(parent);
      }
      else
      {
        children.push(amxNode);
      }
    }

    // Now visit each parent
    rootNode.visit(
      new adf.mf.api.amx.VisitContext({ "amxNodes": affectedNodeParents }),
      function(
        visitContext,
        parentAmxNode)
      {
        var parentId = parentAmxNode.getId();
        var children = childNodesByParentId[parentId];

        // Loop through each child node that has changes
        for (var i = 0, size = children.length; i < size; ++i)
        {
          var amxNode = children[i];
          if (isFinestLoggingEnabled)
          {
            adf.mf.internal.perf.trace(
              "recreateRequestedAmxNodes",
              "Re-creating node " + amxNode.getId());
          }

          var tag = amxNode.getTag();
          var stampKey = amxNode.getStampKey();
          var newAmxNode = tag.buildAmxNode(parentAmxNode, stampKey);

          // Replace the child
          if (parentAmxNode.replaceChild(amxNode, newAmxNode))
          {
            // Initialize the new node and create its children
            newAmxNode.visit(
              new adf.mf.api.amx.VisitContext(),
              adf.mf.internal.amx._buildVisitCallback);

            // Replace the node in the change results object
            changeResults.amxNodeRecreated(amxNode, newAmxNode);
          }
          else
          {
            // TODO: log warning
          }
        }

        // Return accept since we are visiting the parent of the node to replace and not the node
        // itself.
        return adf.mf.api.amx.VisitResult["ACCEPT"];
      });
  }

  /**
   * Called by markNodeForUpdate to see if ancestor AMX nodes wish to handle changes to non-rendered
   * descendent AMX nodes.
   * @private
   */
  function processDescendentChanges(
    rootNode,
    changeResults)
  {
    var amxNodes = changeResults.getAmxNodesForDescendentChanges();
    var visitContext = new adf.mf.api.amx.VisitContext({ "amxNodes": amxNodes });

    rootNode.visit(
      visitContext,
      function (
        visitContext,
        amxNode)
      {
        var id = amxNode.getId();
        var descendentChanges = changeResults.getDescendentChanges(id);
        var descendentChangeAction = amxNode.__getDescendentChangeAction(descendentChanges);

        // We do not support a value of REPLACE for child refresh changes
        if (descendentChangeAction == adf.mf.api.amx.AmxNodeChangeResult["REPLACE"])
        {
          // TODO: log error
          descendentChangeAction = adf.mf.api.amx.AmxNodeChangeResult["RERENDER"];
        }

        changeResults.setDescendentChangesResult(amxNode, descendentChangeAction);

        return adf.mf.api.amx.VisitResult["ACCEPT"];
      });
  }

  /**
   * Called by markNodeForUpdate to re-render any nodes and invoke and refresh methods
   * as appropriate.
   * @private
   */
  function applyRenderChanges(
    rootNode,
    changeResults)
  {
    var isFinestLoggingEnabled = adf.mf.log.Performance.isLoggable(adf.mf.log.level.FINEST);
    var affectedNodes = changeResults.getAffectedNodes();
    var visitContext = new adf.mf.api.amx.VisitContext({ "amxNodes": affectedNodes });

    rootNode.visit(
      visitContext,
      function (
        visitContext,
        amxNode)
      {
        var id = amxNode.getId();
        var affectedAttributes;
        var changeResult = changeResults.getChangeResult(id);

        if (isFinestLoggingEnabled)
        {
          adf.mf.internal.perf.trace(
            "applyRenderChanges",
            "Found node to apply render changes. ID: " + id +
            ". Change result: " + changeResult);
        }

        switch (changeResult)
        {
          case adf.mf.api.amx.AmxNodeChangeResult["REFRESH"]:
            var attributeChanges = changeResults.getAttributeChanges(id);
            var descendentChanges = changeResults.getDescendentChanges(id);

            // Don't pass null as the attribute changes, but instead pass an empty object
            // so that it is easier to work with
            if (attributeChanges == null)
            {
              attributeChanges = new adf.mf.api.amx.AmxAttributeChange();
            }

            amxNode.refresh(attributeChanges, descendentChanges);
            break;

          case adf.mf.api.amx.AmxNodeChangeResult["RERENDER"]:
            amxNode.rerenderNode();
            break;
        }

        if (isFinestLoggingEnabled)
        {
          adf.mf.internal.perf.trace(
            "applyRenderChanges",
            "Completed the processing of the changes for node " + id);
        }

        return adf.mf.api.amx.VisitResult["ACCEPT"];
      });
  }

  /**
   * Internal object for the arguments to the markNodeForUpdate function
   */
  function AmxNodeUpdateArguments()
  {
    this._amxNodes = [];
    this._affectedAttributes = {};
    this._collectionChanges = {};
  }

  adf.mf.internal.amx.AmxNodeUpdateArguments = AmxNodeUpdateArguments;

  AmxNodeUpdateArguments.prototype =
  {
    /**
     * Get an array of affected AMX nodes
     * @return {Array.<adf.mf.api.amx.AmxNode>} array of nodes
     */
    getAffectedNodes: function()
    {
      return this._amxNodes;
    },

    /**
     * Get an object representing the affected attributes for a given AMX node ID
     * @param {string} amxNodeId the AMX node ID
     * @return {Object<string, boolean>} an object with the changed
     *         attributes as keys and "true" as the value.
     */
    getAffectedAttributes: function(amxNodeId)
    {
      return this._affectedAttributes[amxNodeId];
    },

    /**
     * Get the collection changes for a given AMX node and property
     * @param {string} amxNodeId the AMX node ID
     * @return {Object<string, adf.mf.api.amx.AmxCollectionChange>|undefined} an object with the
     *         attributes as keys and the collection change objects for the values. May
     *         be undefined if there are no changes for a given node
     */
    getCollectionChanges: function(amxNodeId)
    {
      return this._collectionChanges[amxNodeId];
    },

    /**
     * Mark an attribute of an AMX node as affected
     * @param {adf.mf.api.amx.AmxNode} amxNode the affected node
     * @param {string} attributeName the name of the affected attribute
     */
    setAffectedAttribute: function(amxNode, attributeName)
    {
      var amxNodeId = amxNode.getId();
      var affected = this._affectedAttributes[amxNodeId];
      if (affected == null)
      {
        affected = {};
        this._amxNodes.push(amxNode);
        this._affectedAttributes[amxNodeId] = affected;
      }

      affected[attributeName] = true;
    },

    /**
     * Set the collection changes for a given AMX node's attribute
     * @param {string} amxNodeId the AMX node ID
     * @param {string} attributeName the name of the attribute that the collection had changes
     * @param {adf.mf.api.amx.AmxCollectionChange} collectionChanges the changes for the collection
     */
    setCollectionChanges: function(amxNodeId, attributeName, collectionChanges)
    {
      var obj = this._collectionChanges[amxNodeId];
      if (obj == null)
      {
        obj = {};
        this._collectionChanges[amxNodeId] = obj;
      }

      obj[attributeName] = collectionChanges;
    }
  };

  /**
   * Function for type handlers to notify the framework of a state change
   * to a node that requires the AMX node hierarchy to be updated
   * at that node and below. If a custom createChildrenNodes method exists on the
   * type handlers, it will be called again for these nodes. This will allow nodes
   * that stamp their children to add new stamps due to a user change.
   * The refresh method will be called on the node with the provided properties
   * if the node is ready to render. If the node is not ready to render, the framework
   * will wait for any EL to be resolved and the refresh method will be called once
   * all the data is available.
   *
   * @param {adf.mf.internal.amx.AmxNodeUpdateArguments} args the change arguments
   */
  adf.mf.internal.amx.markNodeForUpdate = function(
    args)
  {
    // See if the function was called with the deprecated API
    if (!(args instanceof adf.mf.internal.amx.AmxNodeUpdateArguments))
    {
      adf.mf.log.logInfoResource("AMXInfoBundle", adf.mf.log.level.SEVERE,
        "adf.mf.internal.amx.markNodeForUpdate", "MSG_DEPRECATED",
        "Passing nodes and objects as arguments",
        "Pass one adf.mf.internal.amx.AmxNodeUpdateArguments object");

      // Use a temporary variable until we are done reading from arguments
      var convertedArgs = new adf.mf.internal.amx.AmxNodeUpdateArguments();

      for (var arg = 0, argc = arguments.length; arg < argc; arg += 2)
      {
        amxNode = arguments[arg];
        affectedAttributes = arguments[arg + 1];

        for (var attrName in affectedAttributes)
        {
          convertedArgs.setAffectedAttribute(amxNode, attrName);
        }
      }

      // Now update the args variable
      args = convertedArgs;
    }

    // Ensure that we can enter the critical section
    if (adf.mf.internal.amx._isInsideCriticalSection())
    {
      adf.mf.internal.amx._queueCriticalSectionFunction(
        adf.mf.internal.amx.markNodeForUpdate,
        this,
        args);
      return;
    }

    // Prevent any data change events or other critical sections until this method is done
    adf.mf.internal.amx._enterCriticalSection();

    try
    {
      // Call the internal function which assumes that we are already in a critical section
      return adf.mf.internal.amx._markNodeForUpdateImpl(args);
    }
    finally
    {
      adf.mf.internal.amx._leaveCriticalSection();
    }
  }

  adf.mf.internal.amx._markNodeForUpdateImpl = function(
    args)
  {
    var isFinestLoggingEnabled = adf.mf.log.Performance.isLoggable(adf.mf.log.level.FINEST);

    // Begin tracking EL cache misses in a batch
    adf.mf.el.startGetValueBatchRequest();

    var rootNode = adf.mf.api.amx.getPageRootNode();
    try
    {
      // First, ensure the nodes are sorted
      var amxNodes = args.getAffectedNodes();
      if (amxNodes.length > 1)
      {
        adf.mf.api.amx.AmxNode.__sortNodesByDepth(amxNodes);
      }

      // Make a first pass at the nodes. In this pass we are only applying attribute
      // changes and initializing the AMX node hierarchy, no rendering should be done
      // at this point.
      var changeResults = applyUpdatesToAmxNodeHierarchy(rootNode, args);

      // See if any nodes are marked to be re-created
      if (changeResults.getAmxNodesToRecreate().length > 0)
      {
        // Make a second pass to recreate any AMX nodes marked for recreation by
        // the type handler
        recreateRequestedAmxNodes(rootNode, changeResults);

        amxNodes = changeResults.getAffectedNodes();
        // Ensure the nodes are still in the correct hierarchical order
        if (amxNodes.length > 1)
        {
          adf.mf.api.amx.AmxNode.__sortNodesByDepth(amxNodes);
        }
      }

      // Now process any ancestor nodes that are re-rendered to handle changes
      // to descendent AMX nodes
      processDescendentChanges(
        rootNode,
        changeResults);

      // Only perform re-rendering if the page has been rendered
      var performRenderUpdates = adf.mf.internal.amx._pageBuildDeferred == null;

      if (performRenderUpdates)
      {
        applyRenderChanges(
          rootNode,
          changeResults);
      }
    }
    catch(e)
    {
      adf.mf.internal.amx.errorHandlerImpl(null, e);
    }
    finally
    {
      try
      {
        // Flush the batch so that any missed EL are sent for loading
        adf.mf.el.flushGetValueBatchRequest();
      }
      catch(e)
      {
        adf.mf.internal.amx.errorHandlerImpl(null, e);
      }
    }
  };

  var amxPageRootNode = null;
  adf.mf.internal.amx._buildVisitCallback = function (
    visitContext,
    node)
  {
    var state = node.getState();

    if (state == adf.mf.api.amx.AmxNodeStates["UNRENDERED"])
    {
      // If the node is unrendered, nothing more needs to be done
      return adf.mf.api.amx.VisitResult["REJECT"];
    }

    if (state != adf.mf.api.amx.AmxNodeStates["INITIAL"])
    {
      // Only initialize nodes in the initial state. All other states
      // are updated by the data change framework
      return adf.mf.api.amx.VisitResult["ACCEPT"];
    }

    // Initialize the node. This will populate the attributes,
    // both static and EL driven and also create the children
    node.init();

    // Check to see the new state of the node
    switch (node.getState())
    {
      case adf.mf.api.amx.AmxNodeStates["INITIAL"]:
        // Store on the context that a cache miss occurred:
        visitContext._allNodesReadyToRender = false;

        // Do not process the children of a node in the initial state:
        return adf.mf.api.amx.VisitResult["REJECT"];

      case adf.mf.api.amx.AmxNodeStates["UNRENDERED"]:
        // Do not process the children of unrendered nodes:
        return adf.mf.api.amx.VisitResult["REJECT"];

      case adf.mf.api.amx.AmxNodeStates["WAITING_ON_EL_EVALUATION"]:
        // Store on the context that a cache miss occurred:
        visitContext._allNodesReadyToRender = false;

        // Process the children (type handlers must set the node's state
        // to initial to stop children creation and processing):
        return adf.mf.api.amx.VisitResult["ACCEPT"];

      default:
        return adf.mf.api.amx.VisitResult["ACCEPT"];
    }
  };

  adf.mf.internal.amx._pageBuildDeferred = null;
  /**
   * Builds the AMX node hierarchy.
   *
   * @private
   * @param {string} amxPageName the name of the page that is being loaded.
   * @param {adf.mf.api.amx.AmxTag} rootTag the root AMX tag of the page
   * @return {Object} promise object resolved with the root AMX node once the page
   *         is ready to render.
   */
  function buildAmxNodeTree(
    amxPageName,
    rootTag)
  {
    var deferred = $.Deferred();

    adf.mf.internal.perf.start("amx.buildAmxNodeTree", rootTag);
    try
    {
      // Store off the deferred object so that we can use it during the first data
      // change event
      adf.mf.internal.amx._pageBuildDeferred = deferred;

      var visitContext = new adf.mf.api.amx.VisitContext();
      visitContext._allNodesReadyToRender = true;

      if (amxPageName == null)
      {
        var viewHistory = adf.mf.internal.controller.ViewHistory.peek();
        amxPageName = viewHistory["amxPage"];
      }

      if (rootTag == null)
      {
        rootTag = amxPages[amxPageName];
      }

      amxPageRootNode = rootTag.buildAmxNode(null, null);

      adf.mf.el.startGetValueBatchRequest(); // prevent chatty getValue calls
      amxPageRootNode.visit(
        visitContext,
        adf.mf.internal.amx._buildVisitCallback);
    }
    catch(e)
    {
      adf.mf.internal.amx.errorHandlerImpl(null, e);
    }
    finally
    {
      adf.mf.internal.perf.stop("amx.buildAmxNodeTree", rootTag);
    }
    try
    {
      adf.mf.el.flushGetValueBatchRequest(); // done preventing chatty getValue calls
    }
    catch(e)
    {
      adf.mf.internal.amx.errorHandlerImpl(null, e);
    }

    if (visitContext._allNodesReadyToRender)
    {
      // If there were no cache misses, then do not wait for a data change event
      // and render immediately
      adf.mf.internal.amx._pageBuildDeferred = null;
      deferred.resolve(amxPageRootNode);
    }

    // Do not resolve the deferred if the node tree has not yet been rendered.
    // We will wait for the first data change event that delivers the first batch
    // of EL values to the cache to render the page.
    return deferred.promise();
  }

  function debugPrintAmxTagTree(tag, prefix)
  {
    if (prefix == null)
    {
      prefix = "";
    }

    var str = prefix + "<" + tag._prefixedName;
    var attr = tag.getAttributes();
    for (var name in attr)
    {
      str += " " + name + "=\"" + attr[name] + "\""
    }

    var children = tag.getChildren();
    if (children.length == 0)
    {
      str += "/>";
      console.log(str);
      return;
    }

    str += ">";
    console.log(str);
    for (var i = 0, size = children.length; i < size; ++i)
    {
      var childTag = children[i];
      debugPrintAmxTagTree(childTag, prefix + "  ");
    }

    console.log(prefix + "</" + tag._prefixedName + ">");
  }

  function debugPrintAmxNodeTree(rootNode)
  {
    rootNode.visit(
      new adf.mf.api.amx.VisitContext(),
      function(
        visitContext,
        node)
      {
        var prefix = "";
        for (var p = node.getParent(); p != null; p = p.getParent())
        {
          prefix += "  ";
        }
        var str = "AmxNode(" + node.getId() +"): ";
        var attrNames = node.getDefinedAttributeNames();
        for (var i in attrNames)
        {
          str += (attrNames[i] + ":" + node.getAttribute(attrNames[i])) + " ";
        }
        console.log(prefix + str);

        return adf.mf.api.amx.VisitResult["ACCEPT"];
      });
  }

})();

// --------- Rendering Logic --------- //
(function()
{
  var rendererDic = {};

  /**
   * Singleton object for maintaining a stack of prefixes for IDs on HTML elements inside of
   * iterating AMX nodes.
   */
  var iterationIdStack =
  {
    _prefix: "",
    _lengthStack: [],
    // Valid ID characters are everything that NMTOKEN allows from XML minus ":" since we are using
    // colons as separators. See http://www.w3.org/TR/2000/WD-xml-2e-20000814#NT-Nmtoken
    // For now just check a sub-set of NMTOKEN as the list is quite lengthy of allowed unicode
    // characters.
    _invalidCharsRe: /[^\w\.\-]/g,

    /**
     * Get the current prefix.
     * @return {String} a non-null string to use as a prefix for node IDs
     */
    getCurrentPrefix: function()
    {
      return this._prefix;
    },

    /**
     * Push an iterator prefix onto the stack.
     * @param {String} baseId the ID of the iterating AMX node to use as the base of the ID prefix
     *                 for the iterator's children nodes.
     * @param {Object} iterationKey the object to convert to a string to uniquely identify items
     *                 in the iterator.
     */
    pushIterator: function(baseId, iterationKey)
    {
      // Save off the old prefix length so that we know the length to truncate to during the
      // pop call.
      var oldLength = this._prefix.length;
      this._lengthStack.push(oldLength);

      // Create the new prefix
      var newPrefix = baseId + ":" + this._escapeIterationKey(iterationKey);

      this._prefix += newPrefix + ":";
    },

    /**
     * Pop the prefix back to the value before the current iteration.
     */
    popIterator: function()
    {
      var newLength = this._lengthStack.pop();
      if (newLength > 0)
      {
        this._prefix = this._prefix.substr(0, newLength);
      }
      else
      {
        this._prefix = "";
      }
    },

    /**
     * Escape an iteration key for usage in an HTML ID attribute.
     * @param {Object} iterationKey the key for the current iteration
     * @return {String} an ID-safe string that may be used to identify the current iteration
     */
    _escapeIterationKey: function(iterationKey)
    {
      // Note that we may want to consider using an ID token cache to improve memory usage
      // so that smaller strings are used. The disadvantage is that the token generation would
      // have to be repeatable so that the node state would be correctly re-applied. For now,
      // we just wish to ensure there are no invalid characters
      if (iterationKey == null)
      {
        adf.mf.log.logInfoResource("AMXInfoBundle", adf.mf.log.level.SEVERE, "_escapeIterationKey",
          "MSG_INVALID_ITERATION_KEY", iterationKey);
        return "null";
      }
      var strVal = iterationKey.toString();
      // Replace any non-ID friendly values with a sequence of characters unlikely to appear in the
      // value. This assumes that most characters
      // of the iterationKey will be valid and therefore produce a unique key. Using a token
      // cache would address this if this assumption becomes an issue.
      return strVal.replace(this._invalidCharsRe, "._.");
    },

    /**
     * Determine if there is an iteration container.  Searches the prefix for ":" and returns true
     * if the character is found.
     * @return {Boolean} true if an iteration container has been set; false otherwise.
     */
    hasTopIterationContainer: function()
    {
      if (this._prefix.indexOf(":") > -1)
      {
        return true;
      }
      return false;
    },

    /**
     * Returns ID of top-most iteration container.  Finds first occurence of ":" in prefix and returns
     * substring leading up to it.
     * @return {String} ID of top-most iteration container
     */
    getTopIterationContainer: function()
    {
      if (this._prefix.indexOf(":") > -1)
      {
        return this._prefix.substr(0,this._prefix.indexOf(":"));
      }
      return "";
    }
  };

  // ------ resource loading ------ //
  var resourcesData;
  // Load the resources.json file that contains the mapping of the resources
  // needed for AMX nodes:
  adf.mf.internal.amx._loadJsonFile(
    adf.wwwPath + "js/amx-resources.json",
    false,
    function(data)
    {
      // TODO this either needs to be removed or needs to be promoted to a formal debug message; do not use amx.log
      amx.log.debug("Successfully loaded the resources JSON file.");
      resourcesData = data;
    },
    function()
    {
      // TODO this needs to be promoted to a formal error; do not use amx.log
      amx.log.error("Unable to load the resources JSON file.");
    });

  /**
   * Called from loadResourcesForTag to load resources for a given namespace object and tag name.
   * @param {Object} nsObj resources object for a namespace from the JSON object.
   * @param {String} tagName the local AMX node name or "*" for resources global to the namespace.
   * @param {Array} dfds array of deferred objects to collect.
   */
  function processTagNsResources(nsObj, tagName, dfds)
  {
    var tagObj = nsObj[tagName];
    if (tagObj == null)
    {
      return;
    }
    var js = tagObj["js"];
    var css = tagObj["css"];
    var index, size;

    if (js != null)
    {
      // Load any required javascript files:
      if (Array.isArray(js))
      {
        for (index = 0, size = js.length; index < size; ++index)
        {
          dfds.push(amx.includeJs(js[index]));
        }
      }
      else
      {
        dfds.push(amx.includeJs(js));
      }
    }

    if (css != null)
    {
      // Load any required style sheet files:
      if (Array.isArray(css))
      {
        for (index = 0, size = css.length; index < size; ++index)
        {
          dfds.push(amx.includeCss(css[index]));
        }
      }
      else
      {
        dfds.push(amx.includeCss(css));
      }
    }
  }

  /**
   * Function to load any JavaScript or CSS file dependencies for an AMX tag.
   * @param {adf.mf.api.amx.AmxTag} tag the AMX tag.
   * @param {Array} dfds array of jQuery deferred objects to append to for any resources to be
   *                loaded to allow the calling function to determine when all the resources
   *                have been loaded.
   */
  function loadResourcesForTag(tag, dfds)
  {
    // The first level of objects are keyed by the namespace URI of the XML node:
    var ns = tag.getNamespace();
    var nsObj = resourcesData[ns];
    if (nsObj != null)
    {
      // Load any resources for all tags in this namespace:
      processTagNsResources(nsObj, "*", dfds);

      // Second level are keyed by the tag's local name:
      processTagNsResources(nsObj, tag.getName(), dfds);
    }

    // Process all the children tags
    var children = tag.getChildren();
    for (var index = 0, size = children.length; index < size; ++index)
    {
      var childTag = children[index];
      loadResourcesForTag(childTag, dfds);
    }
  }
  // ------ /resource loading ------ //

  // ------ API for Renderers ------ //
  amx.registerRenderers = function(namespace,renderers)
  {
    $.each(renderers,function(key,val)
    {
      var id = (namespace)?(namespace + ":"):"";
      id += key;
      rendererDic[id] = val;
    });
  };

  /**
   * Notify the framework that an iteration node is being processed. Should be called by iterating
   * renderers for each stamp.
   * @param {String} amxNodeId the ID of the iterating AMX node to use as the base of the ID prefix
   *                 for the iterator's children nodes.
   * @param {Object} iterationKey the object to convert to a string to uniquely identify items
   *                 in the iterator.
   */
  amx.beginIterationContainer = function(amxNodeId, iterationKey)
  {
    iterationIdStack.pushIterator(amxNodeId, iterationKey);
  };

  /**
   * Notify the framework that an iteration node has finished being processed. Should be called by
   * iterating renderers after each stamp. Must correspond to a call to beginIterationContainer.
   */
  amx.endIterationContainer = function()
  {
    iterationIdStack.popIterator();
  };

  /**
   * @deprecated
   */
  amx.renderSubNodes = function(amxNode)
  {
    adf.mf.log.logInfoResource("AMXInfoBundle", adf.mf.log.level.SEVERE,
      "renderSubNodes", "MSG_DEPRECATED", "amx.renderSubNodes", "adf.mf.api.amx.renderSubNodes");
    return adf.mf.api.amx.renderSubNodes.apply(this, arguments);
  };

  /**
   * Render the subNodes of an amxNode
   * @param {AMXNode} amxNode The direct parent of the subNodes to be rendered (this cannot be an XMLNode)
   * @return a jQuery collection of nodes that you can add to some parent node
   */
  adf.mf.api.amx.renderSubNodes = function(amxNode)
  {
    adf.mf.log.logInfoResource("AMXInfoBundle", adf.mf.log.level.SEVERE,
      "renderSubNodes", "MSG_DEPRECATED", "adf.mf.api.amx.renderSubNodes", "node.renderSubNodes");

    return amxNode.renderSubNodes();
  }

  amx.nonUITags = {"amx:facet":true,"amx:setPropertyListener":true,"amx:actionListener":true,"amx:loadBundle":true,"amx:convertNumber":true,"amx:convertDateTime":true,"amx:validationBehavior":true,"amx:showPopupBehavior":true,"amx:closePopupBehavior":true};

  amx.isUITag = function(tagName)
  {
    var isUITag = true;

    isUITag = isUITag && (tagName.indexOf("Listener") === -1);

    isUITag = isUITag && !amx.nonUITags[tagName];

    return isUITag;
  }

  /**
   * @deprecated
   */
  amx.renderNode = function(node)
  {
    adf.mf.log.logInfoResource("AMXInfoBundle", adf.mf.log.level.SEVERE, "renderNode", "MSG_DEPRECATED", "amx.renderNode", "adf.mf.api.amx.renderNode");
    return adf.mf.api.amx.renderNode.apply(this, arguments);
  };

  /**
   * Render a amxNode or the xmlNode. If it is an xmlNode, then, it will be processed before rendering it.
   * @param {xmlNode or AMXNode} The node for a given element. Can be the process AMXNode or the XMLNode.
   * @return the rendered jQuery node or null if nothing rendered
   */
  adf.mf.api.amx.renderNode = function(node)
  {
    adf.mf.log.logInfoResource("AMXInfoBundle",
      adf.mf.log.level.SEVERE, "renderNode", "MSG_DEPRECATED", "amx.renderNode", "node.renderNode");
    return node.renderNode();
  }

  // --------- Critical section --------- //
  var criticalSectionQueue = [];
  var criticalSectionActive = false;
  var uiChangesBlockedCounter = 0;

  /**
   * Specify that code is entering a critical section of the AMX framework that effects
   * event delivery and data change events. Any code that causes changes to the AMX node
   * hierarchy or is affected by node hierarchy changes should be using this code to
   * prevent multiple code blocks from making changes.
   */
  adf.mf.internal.amx._enterCriticalSection = function()
  {
    if (criticalSectionActive)
    {
      throw new Error("Illegal attempt to access the critical section");
    }

    if (adf.mf.log.Performance.isLoggable(adf.mf.log.level.FINEST))
    {
      adf.mf.internal.perf.trace("adf.mf.internal.amx._enterCriticalSection",
        "Entering critical section");
    }

    criticalSectionActive = true;
  }

  /**
   * Called once a code is leaving the critical section of the code.
   */
  adf.mf.internal.amx._leaveCriticalSection = function()
  {
    var isFinestLoggingEnabled = adf.mf.log.Performance.isLoggable(adf.mf.log.level.FINEST);
    if (isFinestLoggingEnabled)
    {
      adf.mf.internal.perf.trace("adf.mf.internal.amx._leaveCriticalSection",
        "Leaving critical section");
    }

    criticalSectionActive = false;
    if (criticalSectionQueue.length == 0 || uiChangesBlockedCounter > 0)
    {
      if (isFinestLoggingEnabled)
      {
        adf.mf.internal.perf.trace("adf.mf.internal.amx._leaveCriticalSection",
          "Not processing queue. criticalSectionQueue.length: " + criticalSectionQueue.length +
          ". uiChangesBlockedCounter: " + uiChangesBlockedCounter);
      }
      return;
    }

    if (isFinestLoggingEnabled)
    {
      adf.mf.internal.perf.trace("adf.mf.internal.amx._leaveCriticalSection",
        "Processing the critical section queue");
    }

    var data = criticalSectionQueue.shift();

    var func = data["func"];
    var params = data["params"];
    var thisObj = data["thisObj"];
    func.apply(thisObj, params);
  }

  /**
   * Checks if any code is currently inside of the critical section.
   */
  adf.mf.internal.amx._isInsideCriticalSection = function()
  {
    return criticalSectionActive || uiChangesBlockedCounter > 0;
  }

  /**
   * Allows code that needs to use the critical section to queue a callback
   * when the critical section is free. This functionality is akin to the Java synchronized
   * block.
   * @param {Function} func the function to invoke
   * @param {Object} thisObject the object to use as "this" when invoking the function.
   * @param {...Object} var_args parameters to pass to the function.
   */
  adf.mf.internal.amx._queueCriticalSectionFunction = function(
    func,
    thisObject
    /* ... arguments */)
  {
    if (adf.mf.internal.amx._isInsideCriticalSection() == false)
    {
      throw new Error("Attempt to queue critical section code when not inside a critical section");
    }

    if (adf.mf.log.Performance.isLoggable(adf.mf.log.level.FINEST))
    {
      adf.mf.internal.perf.trace("adf.mf.internal.amx._queueCriticalSectionFunction",
        "Critical section function being queued");
    }

    var params = Array.prototype.slice.call(arguments, 2);
    criticalSectionQueue.push({ "func": func, "thisObj": thisObject, "params": params });
  }

  /**
   * Internal function for usage by type handlers to be able to pause changes to the UI.
   * Typical use case is to prevent updates to the AMX hierarchy and DOM nodes during
   * an animation. This prevents the DOM from being replaced while another task, like animation
   * is under way.
   */
  adf.mf.internal.amx.pauseUIChanges = function()
  {
    ++uiChangesBlockedCounter;
    if (adf.mf.log.Performance.isLoggable(adf.mf.log.level.FINEST))
    {
      adf.mf.internal.perf.trace("adf.mf.internal.amx.pauseUIChanges",
        "Counter: " + uiChangesBlockedCounter);
    }
  };

  /**
   * Internal function for usage by type handlers to be able to resume changes to the UI.
   * See adf.mf.internal.amx.pauseUIChanges.
   */
  adf.mf.internal.amx.resumeUIChanges = function()
  {
    if (--uiChangesBlockedCounter < 0)
    {
      uiChangesBlockedCounter = 0;
    }

    if (adf.mf.log.Performance.isLoggable(adf.mf.log.level.FINEST))
    {
      adf.mf.internal.perf.trace("adf.mf.internal.amx.resumeUIChanges",
        "Counter: " + uiChangesBlockedCounter);
    }

    if (uiChangesBlockedCounter == 0)
    {
      adf.mf.internal.amx._leaveCriticalSection();
    }
  };
  // --------- /Critical section --------- //

  // --------- Data Change Logic --------- //
  var queuedBatchDataChanges = [];
  var queuedCollectionModelChanges = {};

  /**
   * Process the data change queue once the critical section is available.
   * @private
   */
  function processBatchDataChangeQueue()
  {
    // Ensure that there are queued changes
    if (queuedBatchDataChanges.length == 0)
    {
      return;
    }

    var q = queuedBatchDataChanges;
    var cmc = queuedCollectionModelChanges;

    queuedBatchDataChanges = [];
    queuedCollectionModelChanges = {};

    // Process the changes
    adf.mf.internal.amx._handleBatchDataChangeListener(q, cmc);
  }

  /**
   * Queue batch data changes and schedule the callback to the processBatchDataChangeQueue.
   * @param {Array.<string>} dependencyArray the array of EL to queue.
   * @param {Object} collectionModelChanges collection model changes
   */
  function queueBatchDataChange(dependencyArray, collectionModelChanges)
  {
    var initialLength = queuedBatchDataChanges.length;
    for (var i = 0, size = dependencyArray.length; i < size; ++i)
    {
      var el = dependencyArray[i];
      // Ensure the EL is only added once
      if (queuedBatchDataChanges.indexOf(el) < 0)
      {
        queuedBatchDataChanges.push(el);
      }

      if (collectionModelChanges != null)
      {
        var collectionChanges = collectionModelChanges[el];
        if (collectionChanges != null)
        {
          var currentCollectionModelChanges = queuedCollectionModelChanges[el];
          if (currentCollectionModelChanges != null)
          {
            // If a value is already present, we cannot merge the changes, so ensure that
            // itemized is false.
            queuedCollectionModelChanges[el] = { "itemized": false };
          }
          else
          {
            queuedCollectionModelChanges[el] = collectionChanges;
          }
        }
      }
    }

    // If the queue was empty, queue the callback to the process function
    // to handle the queued changes once the critical section is available
    if (initialLength == 0)
    {
      adf.mf.internal.amx._queueCriticalSectionFunction(
        processBatchDataChangeQueue,
        this);
    }
  }

  // On Android 4.0.x releases, we have noticed that the UI will not always repaint after the DOM
  // has been changed in a data change listener. As a result, we need to check the user agent
  // to see if this is an Android 4.0 device.
  var requiresUiInValidation = false;
  if (adf.mf.internal.amx.agent["type"] == "Android")
  {
    // Example user agent string we want to match:
    // Mozilla/5.0 (Linux; U; Android 4.0.3; ko-kr; LG-L160L Build/IML74K) AppleWebkit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30
    var ua = navigator.userAgent;
    if (/Android 4\.0(\.\d+)?;/.test(ua))
    {
      requiresUiInValidation = true;
    }
  }

  /**
   * Callback used to handle batch data changes.
   * @param {Array} dependencyArray an Array of EL expression dependency strings that have changed
   *        (not full expressions)
   * @see adf.mf.api.addBatchDataChangeListener
   */
  adf.mf.internal.amx._handleBatchDataChangeListener = function(
    dependencyArray,
    collectionModelChanges)
  {
    if (dependencyArray != null)
    {
//      adf.mf.internal.perf.start("adf.mf.internal.amx._handleBatchDataChangeListener",
//        dependencyArray);
      // If there is no root node, then we are getting a data change during navigation, or during
      // the building of the tree. Since we have not yet built the node hierarchy, we do not need
      // to process the change at this time.
      var rootAmxNode = adf.mf.api.amx.getPageRootNode();
      if (rootAmxNode == null)
      {
//        adf.mf.internal.perf.stop("adf.mf.internal.amx._handleBatchDataChangeListener",
//          dependencyArray);
        return;
      }

      // See if the critical section is available
      if (adf.mf.internal.amx._isInsideCriticalSection())
      {
        queueBatchDataChange(dependencyArray, collectionModelChanges);
//        adf.mf.internal.perf.stop("adf.mf.internal.amx._handleBatchDataChangeListener",
//          dependencyArray);
        return;
      }

      adf.mf.internal.amx._enterCriticalSection();
      adf.mf.internal.perf.start("adf.mf.internal.amx._handleBatchDataChangeListener",
                                 dependencyArray);
      try
      {
        var isFinestLoggingEnabled = adf.mf.log.Performance.isLoggable(adf.mf.log.level.FINEST);

        if (isFinestLoggingEnabled)
        {
          adf.mf.internal.perf.trace("adf.mf.internal.amx._handleBatchDataChangeListener",
            adf.mf.util.stringify(dependencyArray));
        }

        var markNodeForUpdateArgs = new adf.mf.internal.amx.AmxNodeUpdateArguments();
        var hasCollectionModelChanges = collectionModelChanges != null;
        var collectionChangesElMap = null;
        if (hasCollectionModelChanges)
        {
          collectionChangesElMap = {};
          for (var el in collectionModelChanges)
          {
            var data = collectionModelChanges[el];
            collectionChangesElMap[el] = new adf.mf.api.amx.AmxCollectionChange(data);
          }
        }

        for (var i = 0, size = dependencyArray.length; i < size; ++i)
        {
          var el = dependencyArray[i];
          var nodes = AmxNode.__getNodesDependentOnElToken(el);
          for (var n = 0, nodeSize = nodes.length; n < nodeSize; ++n)
          {
            var node = nodes[n];
            var nodeId = node.getId();

            if (isFinestLoggingEnabled)
            {
              adf.mf.internal.perf.trace("adf.mf.internal.amx._handleBatchDataChangeListener",
                "Node affected by change to EL #{" + el + "}: "+ nodeId);
            }

            var attrNames = node.getTag().getAttributesForElDependency(el);
            for (var a = 0, asize = attrNames.length; a < asize; ++a)
            {
              var attrName = attrNames[a];
              if (isFinestLoggingEnabled)
              {
                adf.mf.internal.perf.trace("adf.mf.internal.amx._handleBatchDataChangeListener",
                  "Affected attribute: " + attrName);
              }

              markNodeForUpdateArgs.setAffectedAttribute(node, attrName);

              if (hasCollectionModelChanges)
              {
                var collectionChange = collectionChangesElMap[el];
                if (collectionChange != null)
                {
                  markNodeForUpdateArgs.setCollectionChanges(nodeId, attrName, collectionChange);
                }
              }
            }

            var convTag = node.__getConverterTag();
            if (convTag != null)
            {
              var attrNames = convTag.getAttributesForElDependency(el);
              for (a = 0, asize = attrNames.length; a < asize; ++a)
              {
                var attrName = attrNames[a];
                if (isFinestLoggingEnabled)
                {
                  adf.mf.internal.perf.trace(
                    "adf.mf.internal.amx._handleBatchDataChangeListener",
                    "Affected attribute of the converter: "+ attrName);
                }

                markNodeForUpdateArgs.setAffectedAttribute(node, "converter_" + attrName);
              }
            }
          }
        }

        var affectedNodeCount = markNodeForUpdateArgs.getAffectedNodes().length;
        if (affectedNodeCount > 0)
        {
          if (isFinestLoggingEnabled)
          {
            adf.mf.internal.perf.trace("adf.mf.internal.amx._handleBatchDataChangeListener",
              affectedNodeCount + " nodes have been affected by the data changes");
          }

          // Call the internal mark node for update function which does not check for being in
          // the critical section since we are already in the critical section
          adf.mf.internal.amx._markNodeForUpdateImpl(markNodeForUpdateArgs);

          // If we have updated at least one node (the EL was not one that
          // we are not listening for) and the page has not yet been rendered,
          // then go ahead and resolve the page build DFD so the render may
          // take place once the update has completed
          if (adf.mf.internal.amx._pageBuildDeferred != null)
          {
            var dfd = adf.mf.internal.amx._pageBuildDeferred;
            adf.mf.internal.amx._pageBuildDeferred = null;
            dfd.resolve(rootAmxNode);
          }

          // On Android, there is a bug in the web view that changes from the data change events may
          // not be redrawn. So, invoke a callback to invalidate the WebView, forcing the repainting of
          // the WebView. Bug seen in at least the 4.0.3 Android version of the WebView
          if (requiresUiInValidation && window["AdfmfCallback"] != null)
          {
            window.AdfmfCallback.invalidateUi();
          }
        }
      }
      catch (ex)
      {
        adf.mf.log.logInfoResource("AMXInfoBundle", adf.mf.log.level.SEVERE,
          "renderNode", "MSG_BATCH_DATA_CHANGE_FAILED", ex);
      }
      finally
      {
        adf.mf.internal.amx._leaveCriticalSection();
        adf.mf.internal.perf.stop("adf.mf.internal.amx._handleBatchDataChangeListener",
          dependencyArray);
      }
    }
  };

  amx.clearBindings = function()
  {
    AmxNode.__clearBindings();
  }

  // Helper method
  // return an array
  amx.getElsFromString = function(elString)
  {
    var result = [];

    if (elString != null)
    {
      var regEx = /[#,$]{.*?}/g;
      var m = regEx.exec(elString);
      while (m != null)
      {
        if (result.indexOf(m[0]) < 0)
        {
          result.push(m[0]);
        }
        m = regEx.exec(elString);
      }
    }

    return result;
  }
  // --------- /Data Change Logic --------- //

  amx.ValueChangeEvent = ValueChangeEvent;
  function ValueChangeEvent(oldValue, newValue)
  {
    this.oldValue = oldValue;
    this.newValue = newValue;
    this[".type"] = "oracle.adfmf.amx.event.ValueChangeEvent";
  }

  amx.SelectionEvent = SelectionEvent;
  function SelectionEvent(oldRowKey, selectedRowKeys)
  {
    this.oldRowKey = oldRowKey;
    this.selectedRowKeys = selectedRowKeys;
    this[".type"] = "oracle.adfmf.amx.event.SelectionEvent";
  }

  amx.ActionEvent = ActionEvent;
  function ActionEvent()
  {
    this[".type"] = "oracle.adfmf.amx.event.ActionEvent";
  }

  adf.mf.internal.amx.MoveEvent = function MoveEvent(rowKeyMoved, rowKeyInsertedBefore)
  {
    this[".type"] = "oracle.adfmf.amx.event.MoveEvent";
    this.rowKeyMoved = rowKeyMoved;
    this.rowKeyInsertedBefore = rowKeyInsertedBefore;
  };


  /**
   * Process an AMX Event. Change the value if attributeValueName is defined, process the appropriate
   * setPropertyListener and actionListener sub tags and then process the [amxEventType]Listener attribute.
   * @param  {adf.mf.api.amx.AmxNode} amxNode The node to process the event on. Temporarily supports a
   *         DOM node wrapped in a jQuery object, but this usage of the API is deprecated.
   * @param  {String} amxEventType String that represents the event type that triggered the call.
   * @param  {String} attributeValueName The name of the attribute whose value will be changed.
   * @param  {String} newValue The new value to be applied to the attribute sent in.
   * @param  {Object} amxEvent Not sure what this is.
   * @return {Object} promise object that is resolved once the event has been processed.
   */
  amx.processAmxEvent = function(
    amxNode,
    amxEventType,
    attributeValueName,
    newValue,
    amxEvent)
  {
    adf.mf.log.logInfoResource("AMXInfoBundle", adf.mf.log.level.WARNING, "processAmxEvent",
      "MSG_DEPRECATED", "amx.processAmxEvent", "adf.mf.api.amx.processAmxEvent");
    return adf.mf.api.amx.processAmxEvent(amxNode, amxEventType,
      attributeValueName, newValue, amxEvent);
  };

  //adf.mf.internal.amx._useBatchProcessing = false;

   /**
   * Process an AMX Event. Change the value if attributeValueName is defined, process the appropriate
   * setPropertyListener and actionListener sub tags and then process the [amxEventType]Listener attribute.
   * @param  {adf.mf.api.amx.AmxNode} amxNode The node to process the event on. Temporarily supports a
   *         DOM node wrapped in a jQuery object, but this usage of the API is deprecated.
   * @param  {String} amxEventType String that represents the event type that triggered the call.
   * @param  {String} attributeValueName The name of the attribute whose value will be changed.
   * @param  {String} newValue The new value to be applied to the attribute sent in.
   * @param  {Object} amxEvent Not sure what this is.
   * @return {Object} promise object that is resolved once the event has been processed.
   */
   adf.mf.api.amx.processAmxEvent = function(
    amxNode,
    amxEventType,
    attributeValueName,
    newValue,
    amxEvent)
  {
    // Need a wrapper DFD incase we are in design time and we will resolve this either in the else or end of phase 4.
    var dfd = $.Deferred();

    if (adf.mf.api.amx.getPageRootNode() == null)
    {
      // Do not process any events after the page has been unloaded.
      // This may happen if an event kicks off a navigation and other events are still being delivered.
      dfd.reject();
    }
    else
    {
      var funcType = adf.mf.internal.amx.processAmxEventImplSerial;
      if (adf.mf.environment.profile.useBatchProcessing && !adf.mf.environment.profile.mockData)
      {
        funcType = adf.mf.internal.amx.processAmxEventImplBatch;
      }

      if (adf.mf.internal.amx._isInsideCriticalSection())
      {
        adf.mf.internal.amx._queueCriticalSectionFunction(
          funcType,
          this,
          amxNode,
          amxEventType,
          attributeValueName,
          newValue,
          amxEvent,
          dfd);
      }
      else
      {
        funcType(amxNode, amxEventType, attributeValueName, newValue, amxEvent, dfd);
      }
    }
    return dfd.promise();

  };

  adf.mf.internal.amx.processAmxEventImplBatch = function(
    amxNode,
    amxEventType,
    attributeValueName,
    newValue,
    amxEvent,
    dfd)
  {
    // Perform a visit to the node to put it back into context
    // TODO: find a way to get context free EL for listener tags so that we do not need to re-establish context
    var rootNode = adf.mf.api.amx.getPageRootNode();
    if (rootNode == null)
    {
      // Do not process any events after the page has been unloaded.
      // This may happen if an event kicks off a navigation and other events are still being delivered.
      dfd.reject();
      return;
      }
    // Prevent any data change events from processing while the event is being processed.
    // This is necessary to stop the AMX node hierarchy from being modified as we are
    // processing the child tags and nodes of the target node. If we remove the target,
    // we are no longer able to setup context of the node using visiting.
    adf.mf.internal.amx._enterCriticalSection();
    adf.mf.internal.perf.start("adf.mf.internal.amx.processAmxEventImplBatch", amxEventType);

    // Register a callback when the processAmxEvent completes so that we can stop
    // blocking the data change events and process the data change event queue.
    dfd.always(function()
      {
        adf.mf.internal.amx._leaveCriticalSection();
      });

    // Check if the deprecated API is in use (passing the AMX node as a jQuery object with the
    // root DOM element)
    if (amxNode != null && amxNode.jquery)
    {
      adf.mf.log.logInfoResource("AMXInfoBundle", adf.mf.log.level.WARNING,
        "processAmxEventImplBatch", "MSG_DEPRECATED", "adf.mf.api.processAmxEvent with a jQuery parameter",
        "adf.mf.api.amx.processAmxEvent with an adf.mf.api.amx.AmxNode as the first parameter");
      amxNode = amxNode.data("amxNode");
    }

    // Show the loading indicator as this could take some time to process.
    adf.mf.api.amx.showLoadingIndicator();

    // We need to use visit pattern to set up the context for this node the event is attached to.
    var nodeFound = rootNode.visit(
      new adf.mf.api.amx.VisitContext({ "amxNodes": [ amxNode ] }),
      function (visitContext, amxNode)
      {
        // This function is only called when the node has been found and the context setup.
        var tag = amxNode.getTag();
        var $validationGroup;
        var popupActions = [];
        if (!adf.mf.environment.profile.dtMode)
        {
          // Start the batch request. This is to prevent us from doing all the set property and action event one at a time and
          // instead process all all the children at once we queue up all the EL that needs to be proccessed in order. Once
          // completed the flush will process all the EL in one round trip.
          adf.mf.util.startBatchRequest();

          adf.mf.internal.pushNonBlockingCall();
          // detect if we might need to refresh the validation message area
          if (amxEventType === "valueChange" &&
            attributeValueName === amxNode.getAttribute("__attrToValidate"))
          {
            // First find the closest rendered node for validation group purposes
            var domNode = null;
            var renderedAmxNode = amxNode.__getClosestRenderedNode();
            if (renderedAmxNode != null)
            {
              domNode = document.getElementById(renderedAmxNode.getId());
            }

            // TODO: stop depending on jQuery for the validation group processing
            var $amxNode = $(domNode);

            // we need to retrieve this here because calling setElValue will cause this $amxNode to potentially
            // be swapped out with a new one if the control doesn't support the refresh method
            $validationGroup = $amxNode.closest(".amx-validationGroup");
          }
          // If this is a value change event then we need to convert the new value first before we continue to process.
          if (amxNode.getConverter() && amxEventType === "valueChange" && attributeValueName === "value")
          {
            newValue = amxNode.getConverter().getAsObject(newValue);
          }

          // Phase 1) Set the new value on the attribute. We need to first fetch the current value of the attribute (this
          //          has to be an EL Expression so we assume it is and let the setELValue figure out where it really needs
          //          to go. For our part we just get the value for this attribute that get returned and assume it is an
          //          EL expression for this attribute. This is  different from the rich client. First we
          //          know what the type (EL Expression or literal) and set the value immediatly if this is a literal. Once
          //          the "value" has been fetched for this attribute then the assumed EL expression and send off in another
          //          request for to be updated with the new value.

          // Make sure we have an attribute value name we are looking to update.
          if (attributeValueName)
          {
            // Need to change this into a none DFD call as we are in batch mode here.
            amxNode.setAttribute(attributeValueName, newValue);
          }

          // Phase 2) Process the setPropertyListeners and actionListeners of this node passed in. Since any component
          //          can have other types of components we are going to be looking for specific component types. We
          //          need to create a childrenDfd to make sure we can wait on this before we go to the next phase.
          // Get all the child components from the amx node.
          var children = tag.getChildren();
          // Loop over all the children
          // Looking for one of four specific AMX tags here.
          //   1) amx:setPropertyListener
          //   2) amx:actionListener
          //   3) amx:showPopupBehavior
          //   4) amx:closePopupBehavior
          for (var i=0, length = children.length; i < length; i++)
          {
            var subTag = children[i];
            // Get the attribute type. If none is specified assume an action attribute.
            // TODO: Not sure thie assumption is correct as it assumes a type when none existis. I would expect a type
            //       would always be specified but because you are looking at AMX XML nodes we only see what is defined.
            var attrType;
            if (subTag.getAttribute("type") != null)
            {
              attrType = adf.mf.internal._getEventTypeResolvedForBidi(subTag.getAttribute("type"));
            }
            else
            {
              // use default type
              attrType = "action";
            }

            if (subTag.getPrefixedName() === "amx:setPropertyListener" && attrType === amxEventType)
            {
              var setPropertyListener = subTag;
              // Get the from expression
              var fromEl = setPropertyListener.getAttribute("from");
              
              if (fromEl != undefined) {
                var fromElAlias;
                var toEl
                // Bug 16945366: This is a hack that we need to support nested collection. In amx-list on the iterator
                // it is creating a map of EL for used in the iterator. This is used to replace tokens to 
                // be able to get EL that is resolvable. The issue is list views and other components are not being 
                // to use toekn replacement. This will be done in main but to get this patch out and reduce risk
                // we are only doing this on iterators (which are the only things that can be nested at this time).
                if (visitContext._map != undefined) {
                  // Iterator uses this path due to nesting ability.
                  fromElAlias = adf.mf.internal.util.tokenSubsitution(fromEl,visitContext._map);
                  toEl        = adf.mf.internal.util.tokenSubsitution(setPropertyListener.getAttribute("to"),
                                                                      visitContext._map);
                } else {
                  // List view uses the old way.
                  fromElAlias = adf.mf.util.getContextFreeExpression(fromEl);
                  toEl        = adf.mf.util.getContextFreeExpression(setPropertyListener.getAttribute("to"));
                }
                // Get a context free EL expression for the "to" so that we do not need to perform another visit
                // to set the value.
                
                // Set the value without trying to resolve the "from" value.
                var setObject = {
                  "name": toEl,
                  "value": fromElAlias
                }
                setObject[adf.mf.internal.api.constants["VALUE_REF_PROPERTY"]] = true; // "from" is just a reference alias
                amx.setElValue(setObject);
              }
            }
            else if (subTag.getPrefixedName() === "amx:actionListener")
            {
              // Process the action listener tag if there is an amxEventType passed matches the attribute type.
              if (attrType == amxEventType)
              {
                // Create the arrays of paramaters and and paramater types.
                var params     = [];
                var paramTypes = [];
                if (amxEvent)
                {
                  params.push(amxEvent);
                  paramTypes.push(amxEvent[".type"]);
                }

                var actionListenerDfd = null;
                // Invoke the action event. This returns a promise DFD.
                amx.invokeEl(subTag.getAttribute("binding"), params, null, paramTypes);
              }
            }
            else if (subTag.getPrefixedName() === "amx:showPopupBehavior")
            {
              // Process the show popup behavior tag if there is an amxEventType passed in matches the attribute type.
              if (attrType === amxEventType)
              {
                popupActions.push({"type": "show", "node": amxNode, "tag": subTag});
              }
            }
            else if (subTag.getPrefixedName() === "amx:closePopupBehavior")
            {
              // Process the close popup behavior tag if there is an amxEventType passed in matches the attribute type.
              if (attrType === amxEventType)
              {
                popupActions.push({"type": "close", "node": amxNode, "tag": subTag});
              }
            }
          }
          // Start of Phase 3.
          // Process the listener if there is an amxEvent passed in and we have a listenr attribute on the compoenent.
          if (amxEvent)
          {
            var attParams     = [];
            var attParamTypes = [];
            attParams.push(amxEvent);
            attParamTypes.push(amxEvent[".type"]);

            var el = tag.getAttribute(amxEventType + "Listener");
            amx.invokeEl(el, attParams, null, attParamTypes);
          }
          var scb = function()
          {
            // Have a call back from all the events being proccessed. Now need to go over the popup stack and
            // process them
            for (var j=0, len = popupActions.length; j < len; j++)
            {
              amxNode = popupActions[j]["node"];
              subTag = popupActions[j]["tag"];
              var type = popupActions[j]["type"];
              // we want to show the popup
              rootNode.visit(new adf.mf.api.amx.VisitContext({ "amxNodes": [ amxNode ] }),
                function (visitContext, amxNode)
                {
                  // Invoke the show popup behavior. This returns a promise DFD to the calling function.
                  if (type == "show")
                  {
                    amx.processShowPopupBehavior(amxNode, subTag);
                  }
                  else
                  {
                    amx.processClosePopupBehavior(amxNode, subTag);
                  }
                  return adf.mf.api.amx.VisitResult["COMPLETE"];
                });
            }
            // Phase 4) Required Validations process the required validators. First we will wait for the previous phase to
            //          complete.
            // detect if we need to refresh the validation message area
            if ($validationGroup !== undefined && amx.isValueTrue(amxNode.getAttribute("required")))
            {
              // Due to the fact that we have been called back both by the setAttribute deferred
              // object as well as the serialResolve being used to iterate the children, we have
              // lost the context of the amxNode. Use a visit to re-obtain the context so that
              // iterating EL expressions may be correctly evaluated.
              rootNode.visit(
                new adf.mf.api.amx.VisitContext({ "amxNodes": [ amxNode ] }),
                function (visitContext, amxNode)
                {
                  // this is a required value, so refresh the messages for this group
                  // let the validation context know that this group has been modified
                  // this method is defined in amx-validation.js
                  amx.requiredControlValueChanged($validationGroup);
                  return adf.mf.api.amx.VisitResult["COMPLETE"];
                });
            }

// adf.mf.internal.perf.stop("adf.mf.internal.amx.processAmxEventImplBatch", amxEventType);
            // resolve the root dfd
            dfd.resolve();
            adf.mf.api.amx.hideLoadingIndicator();
            adf.mf.internal.popNonBlockingCall();
          };
          var fcb = function()
          {
            // resolve the root dfd
            dfd.resolve();
            adf.mf.api.amx.hideLoadingIndicator();
            adf.mf.internal.popNonBlockingCall();
            // TODO: Need to do something here. Not sure what
          };

          // Done processing all the events in batch mode. Time to send them over to the java side to be processed
          adf.mf.internal.perf.stop("adf.mf.internal.amx.processAmxEventImplBatch", amxEventType);
          adf.mf.util.flushBatchRequest(false, [scb], [fcb]);
        }
        else
        {
          // if adf.mf.environment.profile.dtMode, just resolve the deferred
          dfd.resolve();
          adf.mf.api.amx.hideLoadingIndicator();
          adf.mf.internal.perf.stop("adf.mf.internal.amx.processAmxEventImplBatch", amxEventType);
        }

        return adf.mf.api.amx.VisitResult["COMPLETE"];
      });

    if (nodeFound == false)
    {
      // This may happen if an AMX event is processed after a navigation takes place. If so,
      // then just resolve the DFD and hide the loading indicator
      dfd.resolve();
      adf.mf.api.amx.hideLoadingIndicator();
      adf.mf.internal.perf.stop("adf.mf.internal.amx.processAmxEventImplBatch", amxEventType);
    }
  };

  adf.mf.internal.amx.processAmxEventImplSerial = function(
    amxNode,
    amxEventType,
    attributeValueName,
    newValue,
    amxEvent,
    dfd)
  {
    // Perform a visit to the node to put it back into context
    // TODO: find a way to get context free EL for listener tags so that we do not need to re-establish context
    var rootNode = adf.mf.api.amx.getPageRootNode();
    if (rootNode == null)
    {
      // Do not process any events after the page has been unloaded.
      // This may happen if an event kicks off a navigation and other events are still being delivered.
      dfd.reject();
      return;
    }
    // Prevent any data change events from processing while the event is being processed.
    // This is necessary to stop the AMX node hierarchy from being modified as we are
    // processing the child tags and nodes of the target node. If we remove the target,
    // we are no longer able to setup context of the node using visiting.
    adf.mf.internal.amx._enterCriticalSection();
    adf.mf.internal.perf.start("adf.mf.internal.amx.processAmxEventImplSerial", amxEventType);

    // Register a callback when the processAmxEvent completes so that we can stop
    // blocking the data change events and process the data change event queue.
    dfd.always(
      function()
      {
        adf.mf.internal.amx._leaveCriticalSection();
      });

    // Check if the deprecated API is in use (passing the AMX node as a jQuery object with the
    // root DOM element)
    if (amxNode != null && amxNode.jquery)
    {
      adf.mf.log.logInfoResource("AMXInfoBundle", adf.mf.log.level.WARNING,
        "processAmxEventImplSerial", "MSG_DEPRECATED", "adf.mf.internal.amx.processAmxEvent with a jQuery parameter",
        "adf.mf.api.amx.processAmxEvent with an adf.mf.api.amx.AmxNode as the first parameter");
      amxNode = amxNode.data("amxNode");
    }
    // Show the loading indicator as this could take some time to process.
    adf.mf.api.amx.showLoadingIndicator();
    // We need to use visit pattern to set up the context for this node the event is attached to.
    var nodeFound = rootNode.visit(
      new adf.mf.api.amx.VisitContext({ "amxNodes": [ amxNode ] }),
      function (visitContext, amxNode)
      {
        var tag = amxNode.getTag();
        var $validationGroup;
        if (!adf.mf.environment.profile.dtMode)
        {
          adf.mf.internal.pushNonBlockingCall();
          // detect if we might need to refresh the validation message area
          if (amxEventType === "valueChange" &&
            attributeValueName === amxNode.getAttribute("__attrToValidate"))
          {
            // First find the closest rendered node for validation group purposes
            var domNode = null;
            var renderedAmxNode = amxNode.__getClosestRenderedNode();
            if (renderedAmxNode != null)
            {
              domNode = document.getElementById(renderedAmxNode.getId());
            }

            // TODO: stop depending on jQuery for the validation group processing
            var $amxNode = $(domNode);

            // we need to retrieve this here because calling setElValue will cause this $amxNode to potentially
            // be swapped out with a new one if the control doesn't support the refresh method
            $validationGroup = $amxNode.closest(".amx-validationGroup");
          }
          // If this is a value change event then we need to convert the new value first before we continue to process.
          if (amxNode.getConverter() && amxEventType === "valueChange" && attributeValueName === "value")
          {
            newValue = amxNode.getConverter().getAsObject(newValue);
          }

          // Phase 1) Set the new value on the attribute. We need to first fetch the current value of the attribute (this
          //          has to be an EL Expression so we assume it is and let the setELValue figure out where it really needs
          //          to go. For our part we just get the value for this attribute that get returned and assume it is an
          //          EL expression for this attribute. This is  different from the rich client. First we
          //          know what the type (EL Expression or literal) and set the value immediatly if this is a literal. Once
          //          the "value" has been fetched for this attribute then the assumed EL expression and send off in another
          //          request for to be updated with the new value.
          // TODO: I do not know what this means for input values as they are most likly never EL bound. Another question
          //       is what does this mean for disclosure state. In the rich client EL driven disclosure state is only driven
          //       the first time it is evaluated and from then on it is controlled by the component (or the developer) who
          //       set the value in JS.

          // Need a new DFD to represent when the set has completed. Since this can go to Java that means this operation
          // may happen asynchronously and we need to wait for it to finish. This will be initialized later but we need this
          // defined here for scoping purposes as this is used below in the $.when.
          var setValueDfd;
          // Make sure we have an attribute value name we are looking to update.
          if (attributeValueName)
          {
            setValueDfd = amxNode.setAttribute(attributeValueName, newValue);
          }

          // Wiat for Phase 1 to complete.
          // Note: when setValueDfd is undefined, then, the $.when will resolve immediately (which is what we want).
          // Other wise we will continue to wait until the set value has completed.
          var childrenDfd;
          $.when(setValueDfd).fail(function()
          {
            // bug 16371894: setValueDfd failed so we abort further processing and reject childrenDfd
            adf.mf.log.logInfoResource("AMXInfoBundle", adf.mf.log.level.SEVERE, "adf.mf.internal.amx.processAmxEventImplSerial", "MSG_PROCESS_AMX_EVENT_SET_VALUE_REJECTED", newValue);
            childrenDfd = $.Deferred();
            childrenDfd.reject();
          })
          .done(function()
          {
            // Phase 2) Process the setPropertyListeners and actionListeners of this node passed in. Since any component
            //          can have other types of components we are going to be looking for specific component types. We
            //          need to create a childrenDfd to make sure we can wait on this before we go to the next phase.
            // Get all the child components from the amx node.
            var children = tag.getChildren();
            //  Need a new DFD variable as proccessing the child components action, set property, show popup, close popu
            //  behaviors may require calls into the Java engine and this will always be done Asynchronously.
            if (children.length > 0)
            {
              // Restore the child variables if this is an iterator or stamped component. This is required in order to
              // process the specific children in the same and have thier attribute EL or values.
              // Call serialResolve on the chidlren and pass it the anonyos function to be applied to all the children.
              // The returned DFD will  be used to make sure to wait on it before perfriming the next phase.
              // TODO: Break this our into its own function. This shoudl be a simple case statement that calls the specific
              //       function for the type of component.
              childrenDfd = amx.serialResolve(children, function(subTag, i)
              {
                // Get the attribute type. If none is specified assume an action attribute.
                // TODO: Not sure thie assumption is correct as it assumes a type when none existis. I would expect a type
                //       would alwats be specified but because you are looking at AMX XML nodes we only see what is defined.
                var attrType;
                if (subTag.getAttribute("type") != null)
                {
                  attrType = adf.mf.internal._getEventTypeResolvedForBidi(subTag.getAttribute("type"));
                }
                else
                {
                  // use default type
                  attrType = "action";
                }
                // Looking for one of four specific AMX tags here.
                //   1) amx:setPropertyListener
                //   2) amx:actionListener
                //   3) amx:showPopupBehavior
                //   4) amx:closePopupBehavior
                // TODO: this code could explode as more behaviors are added. This needs to be broken out into a core
                //       behavior class that is subclassed by the specific behaviors. and then just call the function on the
                //       behavior. Maybe this should be an interface that we look for and then execute the function if it is
                //       defined.
                if (subTag.getPrefixedName() === "amx:setPropertyListener" && attrType === amxEventType)
                {
                  var setPropertyListener = subTag;
                  var propDfd = $.Deferred(); // Need a new deffered as set propert listener has to phases. One to retrieve
                                              // the data "from" and one to set the "to".

                  // Due to the fact that we have been called back both by the setAttribute deferred
                  // object as well as the serialResolve being used to iterate the children, we have
                  // lost the context of the amxNode. Use a visit to re-obtain the context so that
                  // iterating EL expressions may be correctly evaluated.
                  var nestedVisitNodeFound = rootNode.visit(
                    new adf.mf.api.amx.VisitContext({ "amxNodes": [ amxNode ] }),
                    function (visitContext, amxNode)
                    {
                      // Get the from expression
                      var fromEl = setPropertyListener.getAttribute("from");
                      // Get a context free EL expression for the "to" so that we do not need to perform another visit
                      // to set the value.
                      var toEl = adf.mf.util.getContextFreeExpression(setPropertyListener.getAttribute("to"));

                      // Get the value and when it has been retieved the always function will be invoked and this is where
                      // we will set the value we just retrieved.
                      amx.getElValue(fromEl).always(
                        function(request, response)
                        {
                          // Have the new value now set it based on the EL binding for the element.
                          amx.setElValue(
                            {
                              "name": toEl,
                              "value": response[0].value
                            })
                            .always(
                              function()
                              {
                                propDfd.resolve();
                              });
                        });

                      return adf.mf.api.amx.VisitResult["COMPLETE"];
                    });

                  if (nestedVisitNodeFound == false)
                  {
                    // Resolve the DFD if the node could no longer be found
                    propDfd.resolve();
                  }

                  // Return the the the promise DFD to the calling function (This is within the amx.serialResolve. It needs
                  // this as it will wait for this to finish before going to the next child in the hiearchy.
                  return propDfd.promise();
                }
                else if (subTag.getPrefixedName() === "amx:actionListener")
                {
                  // Process the action listener tag if there is an amxEventType passed matches the attribute type.
                  if (attrType == amxEventType)
                  {
                    // Create the arrays of paramaters and and paramater types.
                    var params     = [];
                    var paramTypes = [];
                    if (amxEvent)
                    {
                      params.push(amxEvent);
                      paramTypes.push(amxEvent[".type"]);
                    }

                    var actionListenerDfd = null;

                    // Due to the fact that we have been called back both by the setAttribute deferred
                    // object as well as the serialResolve being used to iterate the children, we have
                    // lost the context of the amxNode. Use a visit to re-obtain the context so that
                    // iterating EL expressions may be correctly evaluated.
                    rootNode.visit(
                      new adf.mf.api.amx.VisitContext({ "amxNodes": [ amxNode ] }),
                      function (visitContext, amxNode)
                      {
                        // Invoke the action event. This returns a promise DFD.
                        actionListenerDfd = amx.invokeEl(subTag.getAttribute("binding"), params, null, paramTypes);
                        return adf.mf.api.amx.VisitResult["COMPLETE"];
                      });

                    return actionListenerDfd == null ? null : actionListenerDfd.promise();
                  }
                  else
                  {
                    // returning null. This allows any calling function to resolve immediatly.
                    return null;
                  }
                }
                else if (subTag.getPrefixedName() === "amx:showPopupBehavior")
                {
                  // Process the show popup behavior tag if there is an amxEventType passed in matches the attribute type.
                  if (attrType === amxEventType)
                  {
                    var showPopupDfd = null;

                    // Due to the fact that we have been called back both by the setAttribute deferred
                    // object as well as the serialResolve being used to iterate the children, we have
                    // lost the context of the amxNode. Use a visit to re-obtain the context so that
                    // iterating EL expressions may be correctly evaluated.
                    rootNode.visit(
                      new adf.mf.api.amx.VisitContext({ "amxNodes": [ amxNode ] }),
                      function (visitContext, amxNode)
                      {
                        // Invoke the show popup behavior. This returns a promise DFD to the calling function.
                        showPopupDfd = amx.processShowPopupBehavior(amxNode, subTag);
                        return adf.mf.api.amx.VisitResult["COMPLETE"];
                      });

                    return showPopupDfd == null ? null : showPopupDfd.promise();
                  }
                  else
                  {
                    // returning null. This allows any calling function to resolve immediatly.
                    return null;
                  }
                }
                else if (subTag.getPrefixedName() === "amx:closePopupBehavior")
                {
                  // Process the close popup behavior tag if there is an amxEventType passed in matches the attribute type.
                  if (attrType === amxEventType)
                  {
                    var closePopupDfd = null;

                    // Due to the fact that we have been called back both by the setAttribute deferred
                    // object as well as the serialResolve being used to iterate the children, we have
                    // lost the context of the amxNode. Use a visit to re-obtain the context so that
                    // iterating EL expressions may be correctly evaluated.
                    rootNode.visit(
                      new adf.mf.api.amx.VisitContext({ "amxNodes": [ amxNode ] }),
                      function (visitContext, amxNode)
                      {
                        // Invoke the close popup behavior. This returns a promise DFD to the
                        // calling function.
                        closePopupDfd = amx.processClosePopupBehavior(amxNode, subTag);
                        return adf.mf.api.amx.VisitResult["COMPLETE"];
                      });

                    return closePopupDfd == null ? null : closePopupDfd.promise();
                  }
                  else
                  {
                    // returning null. This allows any calling function to resolve immediatly.
                    return null;
                  }
                }
                else
                {
                  // returning null if there are no match to any tag (this is the catch all). This allows any calling
                  // function to resolve immediatly.
                  return null;
                }
              });
            }
            else
            {
              // There are no children so we need to create an empty DFD and reolve it. This is because we will be waiting
              // on this before going to the next phase.
              childrenDfd = $.Deferred();
              childrenDfd.resolve();
            }
          });

          // Phase 3) process the listeners. First we will wait for the previous phase to finish before we continue on.

          // Need to create another DFD for the listeners. This is required to be able to wait for the this phase to
          // complete.
          var listenerDfd = $.Deferred();
          // Wait for phase 2 to complete.
          $.when(childrenDfd).fail(function()
          {
            // bug 16371894: childrenDfd was rejected so we abort further processing and reject listenerDfd
            adf.mf.log.logInfoResource("AMXInfoBundle", adf.mf.log.level.SEVERE, "adf.mf.internal.amx.processAmxEventImplSerial", "MSG_PROCESS_AMX_EVENT_CHILDREN_REJECTED");
            listenerDfd.reject();
          })
          .done(function()
          {
            // Start of Phase 3.
            // Process the istener if there is an amxEvent passed in.
            if (amxEvent)
            {
              var params     = [];
              var paramTypes = [];
              params.push(amxEvent);
              paramTypes.push(amxEvent[".type"]);

              // Due to the fact that we have been called back both by the setAttribute deferred
              // object as well as the serialResolve being used to iterate the children, we have
              // lost the context of the amxNode. Use a visit to re-obtain the context so that
              // iterating EL expressions may be correctly evaluated.
              var nestedVisitNodeFound = rootNode.visit(
                new adf.mf.api.amx.VisitContext({ "amxNodes": [ amxNode ] }),
                function (visitContext, amxNode)
                {
                  var el = tag.getAttribute(amxEventType + "Listener");
                  amx.invokeEl(el, params, null, paramTypes)
                    .always(
                      function()
                      {
                        listenerDfd.resolve();
                      });
                  return adf.mf.api.amx.VisitResult["COMPLETE"];
                });

              if (nestedVisitNodeFound == false)
              {
                // Resolve the DFD if the node could no longer be found
                listenerDfd.resolve();
              }
            }
            else
            {
              listenerDfd.resolve();
            }
          });

          // Phase 4) Required Validations process the required validators. First we will wait for the previous phase to
          //          complete.
          $.when(listenerDfd).fail(function()
          {
            // bug 16371894: listenerDfd failed so skip validation.  We are done at this point so reject dfd and clean up
            adf.mf.log.logInfoResource("AMXInfoBundle", adf.mf.log.level.SEVERE, "adf.mf.internal.amx.processAmxEventImplSerial", "MSG_PROCESS_AMX_EVENT_LISTENERS_REJECTED");
            adf.mf.internal.perf.stop("adf.mf.internal.amx.processAmxEventImpSerial", amxEventType);
            adf.mf.api.amx.hideLoadingIndicator();
            adf.mf.internal.popNonBlockingCall();
            // reject the root dfd
            dfd.reject();
          })
          .done(
            function()
            {
              // detect if we need to refresh the validation message area
              if ($validationGroup !== undefined && amx.isValueTrue(amxNode.getAttribute("required")))
              {
                // Due to the fact that we have been called back both by the setAttribute deferred
                // object as well as the serialResolve being used to iterate the children, we have
                // lost the context of the amxNode. Use a visit to re-obtain the context so that
                // iterating EL expressions may be correctly evaluated.
                rootNode.visit(
                  new adf.mf.api.amx.VisitContext({ "amxNodes": [ amxNode ] }),
                  function (visitContext, amxNode)
                  {
                    // this is a required value, so refresh the messages for this group
                    // let the validation context know that this group has been modified
                    // this method is defined in amx-validation.js
                    amx.requiredControlValueChanged($validationGroup);
                    return adf.mf.api.amx.VisitResult["COMPLETE"];
                  });
              }

              adf.mf.internal.perf.stop("adf.mf.internal.amx.processAmxEventImpSerial", amxEventType);
              // resolve the root dfd
              dfd.resolve();
              adf.mf.api.amx.hideLoadingIndicator();
              adf.mf.internal.popNonBlockingCall();
            });
        }
        else
        {
          // if adf.mf.environment.profile.dtMode, just resolve the deferred
          dfd.resolve();
          adf.mf.api.amx.hideLoadingIndicator();
          adf.mf.internal.perf.stop("adf.mf.internal.amx.processAmxEventImplSerial", amxEventType);
        }

        return adf.mf.api.amx.VisitResult["COMPLETE"];
      });

    if (nodeFound == false)
    {
      // This may happen if an AMX event is processed after a navigation takes place. If so,
      // then just resolve the DFD and hide the loading indicator
      dfd.resolve();
      adf.mf.api.amx.hideLoadingIndicator();
      adf.mf.internal.perf.stop("adf.mf.internal.amx.processAmxEventImplSerial", amxEventType);
    }
  };

  /**
   * Internal function to convert bidi types so both bidi and non-bidi equivalents are handled
   * with the same event.
   * @param {String} rawEventType the application developer-specified event type
   * @return {String} the resolved direction-explicit event type
   */
  adf.mf.internal._getEventTypeResolvedForBidi = function(rawEventType)
  {
    var resolvedEventType = rawEventType;
    if (resolvedEventType == "swipeStart")
    {
      if (document.documentElement.dir == "rtl")
        resolvedEventType = "swipeRight";
      else
        resolvedEventType = "swipeLeft";
    }
    else if (resolvedEventType == "swipeEnd")
    {
      if (document.documentElement.dir == "rtl")
        resolvedEventType = "swipeLeft";
      else
        resolvedEventType = "swipeRight";
    }
    return resolvedEventType;
  }

  /**
   * adf.mf.el.getValue wrapper using the $.Deferred for asynchronous
   * .done(request,response)  - response is an array of the values in the
   *                            same order as the el values passed in
   * .fail(request,exception) - never invoked
   * @param {boolean=} ignoreErrors if true, causes EL errors to be ignored.
   *                   use sparingly for pre-loading data into the client side
   *                   EL cache. Primary goal is to ignore loop based variables
   *                   during pre-fetching of data while not stamping.
   */
  amx.getElValue = function (singleOrArrayOfEls, ignoreErrors)
  {
    var dfd = $.Deferred();
    if (!adf.mf.environment.profile.dtMode)
    {
      var arrayOfEls = (adf.mf.internal.util.is_array(singleOrArrayOfEls))? singleOrArrayOfEls : [singleOrArrayOfEls];

      adf.mf.internal.perf.start("amx.getElValue", ("getting " + arrayOfEls.length + " entries"));

      // this function will help convert the response from a call to adf.mf.el.getValue
      // to an array of objects that is exactly the length of the request el.
      // This handles full failure, full success, and partial success situations
      var makeResponseArray = function(partialResponses)
      {
        // in a full failure case, the partialResponses will be undefined
        if (partialResponses === undefined)
        {
          partialResponses = [];
        }

        var partialResponseIndex = 0;

        var resultArray = [];

        for (var i = 0; i < arrayOfEls.length; ++i)
        {
          var currentEl = arrayOfEls[i];
          var val;
          // we are guaranteed that any successes will be in the order of the request/ However,
          // we are not guaranteed that the length of the response array is the length of the request
          // array, so we keep state to know which partial response index we are on and we will use
          // that value instead of making the slightly more costly call of getLocalValue
          var isException = true;
          if (partialResponseIndex < partialResponses.length && partialResponses[partialResponseIndex].name == currentEl)
          {
            var nvp = partialResponses[partialResponseIndex];
            if (nvp !== null && nvp[adf.mf.internal.api.constants.EXCEPTION_FLAG_PROPERTY] === undefined)
            {
              isException = false;
              val = nvp.value;
              // we found a match, so incremement the partial response index for when we loop back around
              ++partialResponseIndex;
            }
          }

          if (isException)
          {
            try
            {
              // we don't have any data for what this el is, so call getLocalValue and use what is cached
              val = adf.mf.el.getLocalValue(currentEl);
            }
            catch(innerEx)
            {
              // if this throws an exception, then do nothing, since val will be undefined
              // and we will set it to null in the check below
              ;
            }
          }

          // make sure we never return an "undefined" value - make sure it is just a json null struct
          if (val === undefined)
          {
            val = {".null" : true};
          }
          resultArray.push({name: currentEl, value: val});
        }

        return resultArray;
      };

      var successFunc = function(request,response)
      {
        var resultArray;
        try
        {
          resultArray = makeResponseArray(response);
        }
        finally
        {
          adf.mf.internal.perf.stop("amx.getElValue", "success");
        }

        dfd.resolve(request,resultArray);
      };

      var failureFunc = function(request,exception)
      {
        var resultArray;
        try
        {
          adf.mf.log.logInfoResource("AMXInfoBundle", adf.mf.log.level.SEVERE, "getElValue", "MSG_GETVALUE_FAILED", request, exception);
          resultArray = makeResponseArray();
        }
        finally
        {
          adf.mf.internal.perf.stop("amx.getElValue", "failed");
        }
        dfd.resolve(request,resultArray);
      };

      try
      {
        adf.mf.el.getValue(arrayOfEls, successFunc, failureFunc, ignoreErrors);
      }
      catch (ex)
      {
        adf.mf.log.logInfoResource("AMXInfoBundle", adf.mf.log.level.SEVERE, "getElValue", "MSG_GETVALUE_EXCEPTION", arrayOfEls, ex);
        // call the failure function to handle resolving the Deferred object
        failureFunc(arrayOfEls, ex);
      }
    }
    else
    {
      // if adf.mf.environment.profile.dtMode then, return the result
      var response = [{value:singleOrArrayOfEls}];
      dfd.resolve(singleOrArrayOfEls,response);
    }

    return dfd.promise();
  }

  /**
   * adf.mf.el.setValue wrapper using the $.Deferred for asynchronous
   */
  amx.setElValue = function(nameValues)
  {
    var dfd = $.Deferred();
    if (!adf.mf.environment.profile.dtMode)
    {
      adf.mf.internal.perf.start("amx.setElValue", ("setting: " + nameValues));
      try
      {
        adf.mf.el.setValue(nameValues,
          function(request, response)
          {
            dfd.resolve(request,response);
            adf.mf.internal.perf.stop("amx.setElValue", ("success: " + request));
          },
          function(request, exception)
          {
            adf.mf.log.logInfoResource("AMXInfoBundle", adf.mf.log.level.SEVERE, "setElValue",
              "MSG_SETVALUE_FAILED", nameValues, exception);
            dfd.reject(request,exception);
            adf.mf.internal.perf.stop("amx.setElValue", ("Failure " + request));
          });
      }
      catch (ex)
      {
        try
        {
          adf.mf.log.logInfoResource("AMXInfoBundle", adf.mf.log.level.SEVERE, "setElValue",
            "MSG_SETVALUE_EXCEPTION", nameValues.name, ex);
          dfd.resolve();
        }
        finally
        {
          adf.mf.internal.perf.stop("amx.setElValue", ("Exception " + ex));
        }
      }
    }
    else
    {
      // if adf.mf.environment.profile.dtMode, just resolve
      dfd.resolve();
    }

    return dfd.promise();
  }

  amx.loadBundle = function(basename,variable)
  {
    var dfd = $.Deferred();
    if (!adf.mf.environment.profile.mockData)
    {
      try
      {
        adf.mf.el.addVariable(variable, {});  /* kilgore: add a placeholder for the resources to be loaded into */
        adf.mf.api.invokeMethod('oracle.adfmf.framework.api.Model', 'loadBundle',basename,variable,function()
        {
          dfd.resolve();
        },function(req,ex)
        {
          adf.mf.log.logInfoResource("AMXInfoBundle", adf.mf.log.level.SEVERE, "loadBundle", "MSG_LOADBUNDLE_FAILED", basename, variable, ex);
          dfd.resolve();
        });
      }
      catch (ex)
      {
        adf.mf.log.logInfoResource("AMXInfoBundle", adf.mf.log.level.SEVERE, "loadBundle", "MSG_LOADBUNDLE_EXCEPTION", basename, variable, ex);
      }

      return dfd.promise();
    }
    else
    {
      adf.mf.log.logInfoResource("AMXInfoBundle", adf.mf.log.level.WARNING, "loadBundle", "MSG_LOADBUNDLE_SKIPPED", basename, variable);
      return;
    }
  }

  /**
   * adf.mf.el.invoke wrapper using the $.Deferred for asynchronous
   */
  amx.invokeEl = function(expression, params, returnType, types)
  {
    var dfd = $.Deferred();
    try
    {
      if (expression && !adf.mf.environment.profile.dtMode)
      {
        if (!adf.mf.environment.profile.mockData)
        {
          //TODO: needs to inject correct params, and handle return type
          adf.mf.el.invoke(expression,params,"void",types,function(req,res)
          {
            dfd.resolve(res);
          },function(req,exp)
          {
            dfd.reject(exp);
          });
        }
        else
        {
          adf.mf.log.logInfoResource("AMXInfoBundle", adf.mf.log.level.INFO, "invokeEl", "MSG_AMX_DO_NOT_CALL_ADFMF_EL_INVOKE", expression);
          dfd.resolve();
        }
      }
      else
      {
        dfd.resolve();
      }
    }
    catch (ex)
    {
      adf.mf.log.logInfoResource("AMXInfoBundle", adf.mf.log.level.SEVERE, "invokeEl", "MSG_INVOKEEL_EXCEPTION", expression, ex);
      dfd.resolve();
    }
    return dfd.promise();
  }

  /**
   * Take the varName and varValue and store it for this $amxNode.
   */
  amx.storeVariable = function($amxNode,varName,varValue)
  {
    var amxVar = $amxNode.data("amxVar");
    $amxNode.addClass("amxVar");
    if (!amxVar)
    {
      amxVar = {};
      $amxNode.data("amxVar",amxVar);
    }
    amxVar.name = varName;
    amxVar.value = varValue;
  }

  //FIXME: remove this (for backward compability with the dvt team)
  amx.storeVarNameValue = amx.storeVariable;

  /**
   * Restore iterator stamp variables for use during listener invocation.
   * May be used by component authors to reset the EL context during a callback.
   * @return a non-null (but possibly empty) array of amxVar data objects that were restored
   * @see cleanVariables
   * @deprecated use adf.mf.internal.amx.restoreContext instead
   */
  amx.restoreVariables = function($amxNode)
  {
    adf.mf.log.logInfoResource("AMXInfoBundle", adf.mf.log.level.SEVERE,
      "restoreVariables", "MSG_DEPRECATED", "amx.restoreVariables",
      "adf.mf.internal.amx.restoreContext (now non-jQuery parameter)");

    if ($amxNode.length == 1)
    {
      return adf.mf.internal.amx.restoreContext($amxNode.get(0));
    }
    else
    {
      var results = [];
      var nodes = $amxNode.get();
      for (var i = 0, size = nodes.length; i < size; ++i)
      {
        results = results.concat(adf.mf.internal.amx.restoreContext(nodes[i]));
      }
      return results;
    }
  };

  /**
   * Use to restore rendering context of a node post-rendering.
   * May be used by component authors to reset the EL context during a callback.
   * @param {DOMNode} domNode the HTML DOM node to restore the context of.
   * @return a non-null (but possibly empty) array of amxVar data objects that were restored
   * @see cleanVariables
   */
  adf.mf.internal.amx.restoreContext = function(domNode)
  {
    // TODO: consider allowing the type handlers for the DOM nodes
    // to have hooks for restoring the context instead of hard-coding
    // this to only support AMX variables that were introduced during
    // rendering.
    var amxVars = getAmxVars($(domNode));
    for (var i = 0, size = amxVars.length; i < size; ++i)
    {
      var amxVar = amxVars[i];
      adf.mf.el.addVariable(amxVar.name, amxVar.value);
    }
    return amxVars;
  };

  /**
   * @deprecated use adf.mf.internal.amx.tearDownContext instead
   */
  amx.cleanVariables = function(varsToClean)
  {
    adf.mf.log.logInfoResource("AMXInfoBundle", adf.mf.log.level.SEVERE,
      "cleanVariables", "MSG_DEPRECATED", "amx.cleanVariables",
      "adf.mf.internal.amx.tearDownContext");

    adf.mf.internal.amx.tearDownContext(varsToClean);
  };

  /**
   * Tear down the context setup by adf.mf.internal.amx.restoreContext.
   * @param {Object} contextResult the value returned from adf.mf.internal.amx.restoreContext
   * @see adf.mf.internal.amx.restoreContext
   */
  adf.mf.internal.amx.tearDownContext = function(contextResult)
  {
    for (var i = 0, size = contextResult.length; i < size; ++i)
    {
      adf.mf.el.removeVariable(contextResult[i].name);
    }
  };

  /**
   * Return true if the value is boolean "false" or string "false"
   * if undefined, return false
   */
  amx.isValueFalse = function(value)
  {
    if (typeof value !== "undefined")
    {
      if (value === false || value === "false" || value === 0 || value === "0")
      {
        return true;
      }
      else
      {
        return false;
      }
    }
    else
    {
      return false;
    }
  }

  /**
   * Return true if the value is boolean true or string "true"
   * If undefine return false
   */
  amx.isValueTrue = function(value)
  {
    if (typeof value !== "undefined")
    {
      if (value === true || value === "true" || value === 1 || value === "1")
      {
        return true;
      }
      else
      {
        return false;
      }
    }
    else
    {
      return false;
    }
  }

  /**
   * Return the list of var object {name:..,value:..} starting from this $node up to the root document.
   */
  function getAmxVars($node)
  {
    var amxVars = [];
    if ($node.is(".amxVar"))
    {
      amxVars.push($node.data("amxVar"));
    }
    $node.parents(".amxVar").each(function()
    {
      var $parent = $(this);
      amxVars.push($parent.data("amxVar"));
    });
    return amxVars;
  }
  // ------ API for Renderers ------ //

  // return true if this attribute/value needs to be EL resolved
  acceptAttributeForElProcessing.noProcessAttributes =
  {
    valueChangeListener:true,
    from:true,
    to:true,
    selectionChangeListener:true,
    actionListener:true,
    action:true,
    binding:true
  };

  function acceptAttributeForElProcessing(attrName,attrValue)
  {
    var accept = (!acceptAttributeForElProcessing.noProcessAttributes[attrName] && attrValue.indexOf("#{") > -1);
    accept = accept && (attrName.indexOf("Listener") === -1);
    return accept;
  }

  /**
   * Function called for each time a page has been loaded. Walks the entire tag tree and
   * performs any necessary initialization.
   * @param {adf.mf.api.amx.AmxTag} rootTag the root AMX tag of the page
   * @return {Object} Deferred object that is resolved once the processing has been
   *         completed.
   */
  adf.mf.internal.amx._preProcessTagTree = function(rootTag)
  {
    var dfdArray = [];

    loadResourcesForTag(rootTag, dfdArray);
    return $.when.apply($, dfdArray);
  }

  function processCssLinks(amxNode)
  {
    cssNodes = [];

    // We build the list of cssNodes
    $.each(amxNode.nodes,function(idx,node)
    {
      if (node.tagName === "amx:CSSInclude")
      {
        cssNodes.push(node);
      }
    });

    // We add them to the <head /> document
    // TODO: needs to check if the css was already added
    // TODO: probably needs to try to return a dfd that will resolve when the css is loaded.
    $.each(cssNodes,function(idx,cssNode)
    {
      amx.includeCss(cssNode.file);
    });
  }

  amx.getNodeTypeHandler = getNodeTypeHandler;
  function getNodeTypeHandler(amxNode)
  {
    adf.mf.log.logInfoResource("AMXInfoBundle",
      adf.mf.log.level.SEVERE, "getNodeTypeHandler", "MSG_DEPRECATED", "amx.getNodeTypeHandler",
      "Use getTypeHandler on the AmxTag or AmxNode instead");

    return amxNode.getTypeHandler();
  }

  // ------ Node enums ------ //
  adf.mf.api.amx.AmxNodeStates = {
    /** Initial state. The node has been created but not populated */
    "INITIAL": 0,
    /** EL based attributes needed for rendering have not been fully loaded yet */
    "WAITING_ON_EL_EVALUATION": 1,
    /** EL attributes have been loaded, the node has not yet been rendered */
    "ABLE_TO_RENDER": 2,
    /**
     * The EL is not fully loaded but the node has partially rendered itself (reserved for future
     * use)
     */
    "PARTIALLY_RENDERED": 3,
    /** The node has been fully rendered */
    "RENDERED": 4,
    /** The node is not to be rendered */
    "UNRENDERED": 5
  };

  adf.mf.api.amx.AmxNodeChangeResult = {
    /**
     * Allows a type handler that is rendered to take no action in response to an attribute change
     * on a non-rendered descendent AMX node.
     */
    "NONE": 0,

    /**
     * The type handler is able to handle the change to AMX node and its children AMX nodes and
     * will be able to update DOM in response to a change after a call to the refresh method.
     */
    "REFRESH": 1,

    /**
     * The type handler is able to handle the change to the AMX node and its children AMX nodes,
     * but the HTML should only be recreated, there is no need to modify the node hierarchy. The
     * refresh method will not be called on the type handler.
     */
    "RERENDER": 2,

    /**
     * The type handler cannot handle the change. The HTML as well as the
     * node hierarchy should be recreated. This value may only be returned from the updateChildren
     * method on a type handler and cannot be returned from the getDescendentChangeAction method.
     */
    "REPLACE": 3
  };
  // ------ /Node enums ------ //

  // ------ Visit ------ //
  /**
   * Constant values for visit results
   */
  adf.mf.api.amx.VisitResult = {
    /** Continue visiting the children of the current node. */
    "ACCEPT": 0,
    /** Skip the children of the current node but continue visiting. */
    "REJECT": 1,
    /** Stop visiting */
    "COMPLETE": 2
  };

  /**
   * A visit context object to direct tree visitation.
   * <p>
   * Parameter properties:
   * <dl>
   *   <dt>amxNodes</dt>
   *   <dd>An array of AMX nodes to visit</dd>
   * </dl>
   * @param {{amxNodes: Array.<adf.mf.api.amx.AmxNode>}} params An object
   *        containing key/value pairs to populate the visit context.
   */
  function VisitContext(params)
  {
    this._walk = null;
    this._visit = null;

    if (params != null)
    {
      var nodes = params["amxNodes"];
      if (nodes != null)
      {
        this._visit = nodes;
        this._walk = [];
        for (var i = 0, size = nodes.length; i < size; ++i)
        {
          for (var n = nodes[i]; n != null; n = n.getParent())
          {
            if (this._walk.indexOf(n) >= 0)
            {
              break;
            }

            this._walk.push(n);
          }
        }
      }
    }
  }

  adf.mf.api.amx.VisitContext = VisitContext;

  VisitContext.prototype = {
    /**
     * Get if all nodes should be visited.
     * @return {boolean} true if all nodes should be visited
     */
    isVisitAll: function()
    {
      return this._visit == null;
    },

    /**
     * Get the nodes that should be walked during visitation. This list does not necessarily
     * include the nodes that should be visited (callback invoked).
     * @return {Array.<adf.mf.api.amx.AmxNode>} array of nodes that should be walked.
     */
    getNodesToWalk: function()
    {
      return this._walk;
    },

    /**
     * Get the list of nodes to visit.
     * @return {Array.<adf.mf.api.amx.AmxNode>} array of nodes that should be visited.
     */
    getNodesToVisit: function()
    {
      return this._visit;
    },

    /**
     * Convenience function to determine what child AMX nodes, including facets, if any,
     * should be walked of the given parent AMX node. Allows for type handlers to optimize how to
     * walk the children if not all are being walked.
     *
     * @param {adf.mf.api.amx.AmxNode} parentNode the parent node
     * @return {Array.<adf.mf.api.amx.AmxNode>|null} array of the children to walk, may be empty.
     *         returns null if all the children should be visited (isVisitAll is true)
     */
    getChildrenToWalk: function(parentNode)
    {
      if (this._walk == null)
      {
        return null;
      }

      return this._walk.filter(
        function(node, index, array)
        {
          return node.getParent() == node;
        });
    }
  };
  // ------ /Visit ------ //

  // ------ AMX Tag ------ //
  /**
   * AMX tag object. JS object representation of the AMX node definition from the AMX page.
   * Constructor should only be by the framework.
   * @param {adf.mf.api.amx.AmxTag|null} parentTag the parent tag or null for the root.
   * @param {Node} xmlNode the XML DOM node from the AMX page
   * @param {Array.<number>} nextAutoGeneratedId an array with a single integer (to be able
   *        to change the value) for tags without IDs, the next auto-generated
   *        one to use.
   */
  function AmxTag(
    parentTag,
    xmlNode,
    nextAutoGeneratedId)
  {
    // TODO assert that xmlNode != null and xmlNode.nodeType == 1
    this._parent = parentTag;
    this._ns = xmlNode.namespaceURI;
    this._prefixedName = xmlNode.tagName;
    this._name = xmlNode.localName;
    this._textContent = "";
    this._elTokens = null;
    this._attributeElDependencies = null;
    this._attr = {};

    var attrs = xmlNode.attributes;
    var i, size;
    var idFound = false;

    for (i = 0, size = attrs.length; i < size; ++i)
    {
      var a = attrs[i];
      this._attr[a.name] = a.value;
      if (idFound == false && a.name == "id")
      {
        idFound = true;
      }
    }

    if (!idFound)
    {
      // Assign a unique ID to the tag
      if (nextAutoGeneratedId == null)
      {
        nextAutoGeneratedId = [ 0 ];
      }
      this._attr["id"] = "_auto" + (nextAutoGeneratedId[0]++);
    }

    this._children = [];
    var children = xmlNode.childNodes;
    for (i = 0, size = children.length; i < size; ++i)
    {
      var child = children[i];

      switch (child.nodeType)
      {
        case 1: // element
          var tag = new adf.mf.api.amx.AmxTag(this, child, nextAutoGeneratedId);
          this._children.push(tag);
          break;
        case 3: // text node
        case 4: // CDATA node
          if (this._textContent == null)
          {
            // First text or CDATA node encountered:
            this._textContent = child.textContent;
          }
          else
          {
            // Subsequent text or CDATA nodes:
            this._textContent += child.textContent;
          }
          break;
      }
    }
  }
  adf.mf.api.amx.AmxTag = AmxTag;

  AmxTag.prototype = {
    /**
     * Get the XML namespace URI for the tag.
     * @return {string} the namespace URI
     */
    getNamespace: function()
    {
      return this._ns
    },

    /**
     * Return the tag name including the prefix. This is the full XML name.
     * @return {string} the tag name with the prefix
     */
    getPrefixedName: function()
    {
      return this._prefixedName;
    },

    /**
     * Get the tag name. This is the local XML tag name without the prefix.
     * @return {string} the tag name
     */
    getName: function()
    {
      return this._name;
    },

    /**
     * Get the parent tag.
     * @return {adf.mf.api.amx.AmxTag|null} the parent tag or null for the top level
     *         tag.
     */
    getParent: function()
    {
      return this._parent;
    },

    /**
     * Returns the text content of the tag.
     * @return {string} the text content, or an empty string.
     */
    getTextContent: function()
    {
      return this._textContent;
    },

    /**
     * Recursively search the tag hierarchy for tags with the given
     * namespace and tag name. Returns the current tag if a match as well.
     *
     * @param {string} namespace the namespace of the children to retrieve.
     * @param {string} tagName the name of the tags to return.
     * @return {Array.<adf.mf.api.amx.AmxTag>} array of all the matching tags.
     */
    findTags: function(
      namespace,
      tagName)
    {
      var tags = [];
      if (this.getNamespace() == namespace && tagName == this.getName())
      {
        tags.push(this);
      }

      for (var i = 0, size = this._children.length; i < size; ++i)
      {
        var child = this._children[i];
        var result = child.findTags(namespace, tagName);
        if (result.length > 0)
        {
          tags = tags.concat(result);
        }
      }

      return tags;
    },

    /**
     * Get the children of the tag. Provides for optional filtering of the children
     * namespaces and tag names.
     * @param {string|null} namespace the namespace to filter the children by. If
     *        null all the children will be returned.
     * @param {string|null} tagName the name of the tag to filter the children by.
     *        Only considered if the namespace parameter is non-null. If null, the
     *        children will not be filtered by tag name.
     * @return {Array.<adf.mf.api.amx.AmxTag>} array of all the matching children tags.
     */
    getChildren: function(
      namespace,
      tagName)
    {
      var result = [];
      for (var i = 0, size = this._children.length; i < size; ++i)
      {
        var child = this._children[i];
        if ((namespace == null || namespace == child.getNamespace()) &&
          (tagName == null || tagName == child.getName()))
        {
          result.push(child);
        }
      }

      return result;
    },

    /**
     * Convenience function to get all of the children facet tags. Meant to assist
     * the creation of the AMX node process.
     * @return {Array.<adf.mf.api.amx.AmxTag>} array of all the facet tags.
     */
    getChildrenFacetTags: function()
    {
      return this.getChildren("http://xmlns.oracle.com/adf/mf/amx", "facet");
    },

    /**
     * Convenience function to get the facet tag with the given name. Meant to assist
     * the code if the presence of a facet changes the behavior of a type handler.
     * @param {string} name the name of the facet to find.
     * @return {adf.mf.api.amx.AmxTag|null} the child facet tag or null if none has been
     *         provided with the given name.
     */
    getChildFacetTag: function(name)
    {
      var facetTags = this.getChildren("http://xmlns.oracle.com/adf/mf/amx", "facet");
      for (var i = 0, size = facetTags.length; i < size; ++i)
      {
        var tag = facetTags[i];
        if (tag.getAttribute("name") == name)
        {
          return tag;
        }
      }

      return null;
    },

    /**
     * Convenience function to get all children tags that are UI tags. Meant to assist
     * the creation of the AMX node process. Does not return any facet tags.
     * @return {Array.<adf.mf.api.amx.AmxTag>} array of all the children UI tags.
     */
    getChildrenUITags: function()
    {
      var children = this.getChildren();
      var result = children.filter(
        function(tag, index, array)
        {
          return tag.isUITag();
        });

      return result;
    },

    /**
     * Get all of the defined attribute names for the tag.
     * @return {Array.<string>} all of the attribute names for the attributes that were
     *         specified on the tag.
     */
    getAttributeNames: function()
    {
      var names = [];
      for (var name in this._attr)
      {
        names.push(name);
      }

      return names;
    },

    /**
     * Get if the given attribute is bound to an EL expression.
     * @param {string} name the name of the attribute to check.
     * @return {boolean} true if there is EL in the attribute value or false if the value
     *         is static or if the attribute was not defined.
     */
    isAttributeElBound: function(name)
    {
      var val = this.getAttribute(name);
      return val != null && val.indexOf("#{") >= 0;
    },

    /**
     * Get the attribute value (may be an EL string) for the attribute of the given name.
     * @param {string} name the name of the attribute
     * @return {string|undefined} the attribute value or undefined if the attribute was not specified.
     *         Returns the expression string for EL attributes.
     */
    getAttribute: function(name)
    {
      return this._attr[name];
    },

    /**
     * Get a k/v pair map of the attributes and their values.
     * @return {Object<string, value>} map of name to value pairs.
     */
    getAttributes: function()
    {
      return this._attr;
    },

    /**
     * Get a list of all EL dependencies for this tag (where
     * EL has been used in the attributes).
     * @return {Array.<string>} array of EL dependencies
     */
    getElDependencies: function()
    {
      if (this._elTokens == null)
      {
        this._elTokens = [];
        this._attributeElDependencies = [];
        var attr = this.getAttributes();
        for (var attrName in attr)
        {
          var attrVal = attr[attrName];
          if (this.isAttributeElBound(attrName) &&
            acceptAttributeForElProcessing(attrName, attrVal))
          {
            var parsedEl = adf.mf.internal.el.parser.parse(attrVal);
            var dependencies = parsedEl.dependencies();
            for (var i = 0, size = dependencies.length; i < size; ++i)
            {
              var dependency = dependencies[i];
              var attrDependencies = this._attributeElDependencies[dependency];
              if (attrDependencies == null)
              {
                this._attributeElDependencies[dependency] = [ attrName ];
              }
              else
              {
                attrDependencies.push(attrName);
              }
              // Avoid duplicates:
              if (this._elTokens.indexOf(dependency) == -1)
              {
                this._elTokens.push(dependency);
              }
            }
          }
        }
      }

      return this._elTokens;
    },

    /**
     * Get the names of the attributes that are affected by a change
     * to the given EL dependency.
     * @return {Array.<string>} array of attribute names.
     */
    getAttributesForElDependency: function(dependency)
    {
      var attrs = this._attributeElDependencies[dependency];
      return attrs == null ? [] : attrs;
    },

    /**
     * Get if the node is a UI tag with a type handler and renders content.
     * @return {boolean} true if a UI tag
     */
    isUITag: function()
    {
      return amx.isUITag(this._prefixedName);
    },

    /**
     * Get the tags for the children of this facet and the name of the facet if this tag
     * is a facet tag. Convenience function for building the AMX node tree.
     * @return {{name:string, children:Array<adf.mf.api.amx.AmxTag>}|null} an object with the
     *         name of the facet and the children tags of the facet. Returns null if the tag
     *         is not an amx:facet tag.
     */
    getFacet: function()
    {
      if (this._prefixedName == "amx:facet")
      {
        var children = this.getChildren();
        var facetName = this.getAttribute("name");

        return { "name": facetName, "children": children };
      }

      return null;
    },

    /**
     * Create a new instance of an AMX node for this tag given the stamp ID. If the tag
     * is a facet tag, the tag will create the node for the child tag. This function does
     * not initialize the node.
     *
     * @param {adf.mf.api.amx.AmxNode|null} parentNode the parent AMX node or null if the
     *        tag/node is the root
     * @param {Object|null} key the stamp key to identify the node with the given key. May
     *        be null for non-iterating parent tags.
     * @return {adf.mf.api.amx.AmxNode|null} an un-initialized AMX node object or null
     *         for non-UI tags
     */
    buildAmxNode: function(
      parentNode,
      key)
    {
      if (!this.isUITag())
      {
        // Currently do nothing for other non-UI tags, but we should consider adding
        // behaviors and other types of tags in the future to remove the hard-coded nature
        // of processing tags like amx:setPropertyListener
        return null;
      }

      return new adf.mf.api.amx.AmxNode(parentNode, this, key);
    },

    /**
     * Get the type handler for this tag.
     * @return {Object} the type handler
     */
    getTypeHandler: function()
    {
      if (this._typeHandler === undefined)
      {
        var typeHandler = null;
        // Until the renderers can be fixed to use namespaces rather than prefixes, use
        // the node prefix to look up the type handler.
        if (this._prefixedName)
        {
          typeHandler = rendererDic[this._prefixedName];
          // If it is a function, then, it is actually the "create" of the NodeTypeHandler
          if (typeHandler && $.isFunction(typeHandler))
          {
            typeHandler =
            {
              create: typeHandler
            };
          }
        }

        this._typeHandler = typeHandler;
      }

      return this._typeHandler;
    }
  };
  // ------ /AMX Tag ------ //

  // ------ AMX Node ------ //
  /**
   * AMX node definition. The AMX node constructor is private and only the framework
   * may create new node objects.
   * (parameters TBD)
   */
  function AmxNode(
    parentNode,
    tag,
    key)
  {
    this._tag = tag;
    this._parent = parentNode;
    this._children = {};
    this._facets = {};
    this._attr = {};
    this._modifiableEl = {};
    this._key = key === undefined ? null : key;
    this._state = adf.mf.api.amx.AmxNodeStates["INITIAL"];
    this._childrenCreated = false;
    this._id = null;
    this._converterTag = null;
    this._converter = null;
  }
  adf.mf.api.amx.AmxNode = AmxNode;

  var nodeToElMap = {};
  AmxNode.prototype = {
    /**
     * Get the unique identifier for this node. This is used as the ID on the root HTML element
     * rendered by this node.
     */
    getId: function()
    {
      return this._id;
    },

    /**
     * Get the AMX tag that created this node.
     * @return {adf.mf.api.amx.AmxTag} the tag that created the node
     */
    getTag: function()
    {
      return this._tag;
    },

    /**
     * Get the type handler for this node.
     * @return {Object} the type handler
     */
    getTypeHandler: function()
    {
      return this.getTag().getTypeHandler();
    },

    /**
     * Get the converter, if set, for this node.
     */
    getConverter: function()
    {
      return this._converter;
    },

    /**
     * Set the converter for this node.
     */
    setConverter: function(converter)
    {
      this._converter = converter;
    },

    /**
     * For an attribute, create and store an EL expression that may be used to set EL values
     * into the model. The value is context insensitive and may be used to set a value at any
     * time. Common use is to set a value based on user interaction. May be called by type
     * handlers.
     *
     * @param {string} name the name of the attribute
     * @return {string|null} the modifyable EL. Also stored on the node. Returns null if the
     *         attribute in question is not bound to an EL value.
     */
    storeModifyableEl: function(name)
    {
      var tag = this.getTag();
      if (tag.isAttributeElBound(name))
      {
        var el = tag.getAttribute(name);
        el = adf.mf.util.getContextFreeExpression(el);
        this._modifiableEl[name] = el;
        return el;
      }
      else
      {
        return null;
      }
    },

    /**
     * Initializes the node, performing any EL evaluation and any other pre-render logic.
     * Called by the framework. It is expected for the state to be WAITING_ON_EL_EVALUATION,
     * ABLE_TO_RENDER or UNRENDERED after invoking this function. This function also creates
     * the children AMX nodes once the status is WAITING_ON_EL_EVALUATION, but does not
     * initialize them.
     */
    init: function()
    {
      var state = this.getState();
      var tag = this.getTag();

      var attr = tag.getAttributes();
      var name;

      // First handle the static attributes
      for (name in attr)
      {
        if (tag.isAttributeElBound(name))
        {
          continue;
        }

        // If we have already processed this attribute in a previous call,
        // do not processes the EL again for expansion or processing static values
        if (this._attr[name] !== undefined)
        {
          continue;
        }

        var val = attr[name];
        if (val != null)
        {
          if (name == "rendered")
          {
            // Convert rendered to a boolean
            val = amx.isValueTrue(val);
          }
          this._attr[name] = val;
        }
      }

      // Create a unique ID that is based on the stamped key, if present.
      this._createUniqueId();

      // TODO: although no types currently need to customize how attributes
      // are loaded, we really need a method to allow the type handlers to
      // control what attributes are processed and how they are processed.
      // Due to time constraints and the desire to make sure the API is solid,
      // it is not being added at this time.

      // Hookup changes for EL changes to the attributes:
      this._postProcessForDataChangeNotification(tag);

      // First process the rendered attribute, if we haven't already
      var rendered = this.getAttribute("rendered");
      if (rendered === undefined && tag.isAttributeElBound("rendered"))
      {
        var renderedAttrValue = tag.getAttribute("rendered");
        var rendered = adf.mf.environment.profile.dtMode ? true : adf.mf.el.getLocalValue(renderedAttrValue);
        if (rendered === undefined)
        {
          // Ensure the state is still INITIAL so that the building
          // of the node hierarchy does not continue
          this.setState(adf.mf.api.amx.AmxNodeStates["INITIAL"]);
          return;
        }
        else
        {
          rendered = amx.isValueTrue(rendered);
          // Store the value on the node
          this.setAttributeResolvedValue("rendered", rendered);
          if (!rendered)
          {
            // Update the state
            this.setState(adf.mf.api.amx.AmxNodeStates["UNRENDERED"]);
            return;
          }
        }
      }

      // Now, look for a converter tag
      this._processConverterTag();

      var allElLoaded = true;
      var collectionModelMiss = false;
      for (name in attr)
      {
        if (name == "rendered")
        {
          continue;
        }

        var result = this._processAttribute(name);

        allElLoaded = allElLoaded && result["cacheMiss"] == false;
        collectionModelMiss = collectionModelMiss || result["collectionModelMiss"];
      }

      // Update the state to reflect if all the EL is available
      if (collectionModelMiss)
      {
        this.setState(adf.mf.api.amx.AmxNodeStates["INITIAL"]);
      }
      else
      {
        this.setState(allElLoaded ?
          adf.mf.api.amx.AmxNodeStates["ABLE_TO_RENDER"] :
          adf.mf.api.amx.AmxNodeStates["WAITING_ON_EL_EVALUATION"]);
      }

      state = this.getState();
      if (state == adf.mf.api.amx.AmxNodeStates["WAITING_ON_EL_EVALUATION"] ||
        state == adf.mf.api.amx.AmxNodeStates["ABLE_TO_RENDER"])
      {
        // Once all the necessary EL has been loaded, create the children nodes,
        // but do not initialize them
        this._createChildren();

        state = this.getState();
        if (state == adf.mf.api.amx.AmxNodeStates["WAITING_ON_EL_EVALUATION"] ||
          state == adf.mf.api.amx.AmxNodeStates["ABLE_TO_RENDER"])
        {
          if (this._processConverter())
          {
            this._convertValue();
          }
        }
      }
    },

    /**
     * Get the stamp key for the AMX node. The stamp key identifies AMX nodes that are produced inside of
     * iterating containers. This is provided by the parent node. An example tag that uses stamp keys is
     * the amx:iterator tag.
     * @return {object|null} the key or null if the node was not stamped
     */
    getStampKey: function()
    {
      return this._key;
    },

    /**
     * Get a list of the attribute names that have been defined for this node.
     * @return {Array.<string>} array of the attribute names
     */
    getDefinedAttributeNames: function()
    {
      var names = [];
      for (var name in this._attr)
      {
        names.push(name);
      }
      return names;
    },

    /**
     * Gets an attribute value for the attribute of the given name.
     * @param {string} name the name of the attribute
     * @return {Object|null|undefined} returns the value (may be null) or
     *         undefined if the attribute is not set or is not yet loaded.
     */
    getAttribute: function(name)
    {
      var val = this._attr[name];
      return val === undefined ? undefined :
        amx.getObjectValue(val);
    },

    /**
     * Used by the type handler or the framework to store the attribute value for an attribute onto
     * the node. This function does not update the model.
     * @param {string} name the name of the attribute
     * @param {object} value the value of the attribute
     */
    setAttributeResolvedValue: function(name, value)
    {
      this._attr[name] = value;
    },

    /**
     * For use by type handlers to set the value of an attribute on the model. This value will be sent
     * to the Java side to update the EL value. The value on the AMX node will not be updated by this
     * call, it is expected that a data change event will result to update the AMX node.
     * @param {string} name the name of the attribute
     * @param {object} value the new value of the attribute
     * @return {Object} a promise object resolved once the value has been set
     */
    setAttribute: function(name, value)
    {
      var deferred = $.Deferred();

      var el = this._modifiableEl[name];

      if (el == null)
      {
        var tag = this.getTag();

        // If the EL is null, then this will not work if the node is
        // not in context. Try to set the EL using the raw EL from the tag
        //
        // First, ensure the attribute is EL bound
        if (tag.isAttributeElBound(name))
        {
          el = this.getTag().getAttribute(name);
        }
      }

      this.setAttributeResolvedValue(name, value);

      if (el == null)
      {
        // If this attribute was not EL based, just resolve the DFD
        deferred.resolve();
      }
      else
      {
        var oldValue = this.getAttribute(name);
        amx.setElValue(
          {
            "name": el,
            "value": value
          })
          .done(
            function()
            {
              deferred.resolve();
            })
          .fail(
            function()
            {
              this.setAttributeResolvedValue(name, oldValue);
            });
      }

      return deferred.promise();
    },

    /**
     * Check if the attribute has been specified.
     * @param {string} name the name of the attribute
     * @return {boolean} true if the attribute was defined by the user
     */
    isAttributeDefined: function(name)
    {
      return this._tag.getAttribute(name) !== undefined;
    },

    /**
     * Get the parent AMX node.
     * @return {adf.mf.api.amx.AmxNode|null} the parent node or null for the top level
     *         node.
     */
    getParent: function()
    {
      return this._parent;
    },

    /**
     * Adds a child AMX node to this node. Should only be called by the framework or the type handler.
     * @param {adf.mf.api.amx.AmxNode} child the child to add
     * @param {string|null} facetName the name of the facet or null if the child does not belong in a
     *        facet.
     */
    addChild: function(child, facetName)
    {
      var key = child.getStampKey();
      var children;
      if (facetName == null)
      {
        children = this._children[key];
        if (children == null)
        {
          this._children[key] = children = [];
        }
      }
      else
      {
        var facets = this._facets[key];
        if (facets == null)
        {
          facets = this._facets[key] = {};
        }
        children = facets[facetName];
        if (children == null)
        {
          facets[facetName] = children = [];
        }
      }

      children.push(child);
    },

    /**
     * Remove a child node from this node. Note that the AMX node will be removed from the hierarchy,
     * but not the DOM for that node. It is up to the caller to remove the DOM. This is to allow
     * type handlers to handle animation and other transitions when DOM is replaced.
     *
     * @param {adf.mf.api.amx.AmxNode} amxNode the node to remove
     * @return {boolean} true if the node was found and removed.
     */
    removeChild: function(amxNode)
    {
      var key = amxNode.getStampKey();
      var nodeId = amxNode.getId();
      var result = this._findChildIndexAndFacetName(key, nodeId);
      if (result == null)
      {
        return false;
      }

      amxNode._removeFromDataChangeNotification();

      var facetName = result["facetName"];
      var childrenArray = null;
      var index = result["index"];

      if (facetName == null)
      {
        childrenArray = this._children[key];
      }
      else
      {
        childrenArray = this._facets[key][facetName];
      }

      // Splice updates the array in place
      childrenArray.splice(index, 1);

      return true;
    },

    /**
     * Replace a child node with a new node.
     * @param {adf.mf.api.amx.AmxNode} oldNode the node to replace
     * @param {adf.mf.api.amx.AmxNode} newNode the replacement node
     * @return {boolean} true if the old node was found and replaced.
     */
    replaceChild: function(
      oldNode,
      newNode)
    {
      var key = oldNode.getStampKey();
      var nodeId = oldNode.getId();
      var result = this._findChildIndexAndFacetName(key, nodeId);
      if (result == null)
      {
        return false;
      }

      oldNode._removeFromDataChangeNotification();

      var facetName = result["facetName"];
      if (facetName == null)
      {
        this._children[key][result["index"]] = newNode;
      }
      else
      {
        var facetChildren = this._facets[key][facetName];
        facetChildren[result["index"]] = newNode;
      }

      return true;
    },

    /**
     * Get the children AMX nodes.
     * @param {string|null|undefined} facetName the name of the facet to retrieve the children
     *        or null to get the non-facet children.
     * @param {Object|null|undefined} key An optional key to specify for stamping. If provided, it will retrieve
     *        the children AMX nodes for a given stamping key.
     * @return {Array.<adf.mf.api.amx.AmxNode>} an array of the children AMX nodes. Returns an empty array
     *         if no children exist or if there are no children for the given stamp key.
     */
    getChildren: function(facetName, key)
    {
      if (key === undefined)
      {
        key = null;
      }

      var children;
      if (facetName == null)
      {
        children = this._children[key];
      }
      else
      {
        var facets = this._facets[key];
        if (facets == null)
        {
          return [];
        }

        children = facets[facetName];
      }

      return children == null ? [] : children;
    },

    /**
     * Get all of the facets of the AMX node.
     * @param {Object|null|undefined} key An optional key to specify for stamping. If provided, it will retrieve
     *        the facet AMX nodes for a given stamping key.
     * @return {Object.<string, Array.<adf.mf.api.amx.AmxNode>>} map of facets defined for the node
     */
    getFacets: function(key)
    {
      if (key === undefined)
      {
        key = null;
      }

      var facets = this._facets[key];
      return facets == null ? {} : facets;
    },

    /**
     * Perform a tree visitation starting from this node.
     * @param {adf.mf.api.amx.VisitContext} context the visit context
     * @param {Function} callback the callback function to invoke when visiting. Should accept
     *        the context and the node as arguments
     * @return {boolean} true if the visitation is complete and should not continue.
     */
    visit: function(
      context,
      callback)
    {
      var th = this.getTypeHandler();
      if (this._implementsFunction(th, "visit"))
      {
        return th.visit(context, callback);
      }

      if (context.isVisitAll() || context.getNodesToVisit().indexOf(this) >= 0)
      {
        var result = callback(context, this);
        switch (result)
        {
          case adf.mf.api.amx.VisitResult["ACCEPT"]:
            return this.visitChildren(context, callback);

          case adf.mf.api.amx.VisitResult["REJECT"]:
            return false;

          case adf.mf.api.amx.VisitResult["COMPLETE"]:
          default:
            return true;
        }
      }

      return this.visitChildren(context, callback);
    },

    /**
     * Perform a tree visitation of the children of the node.
     * @param {adf.mf.api.amx.VisitContext} context the visit context
     * @param {Function} callback the callback function to invoke when visiting. Should accept
     *        the context and the node as arguments
     * @return {boolean} true if the visitation is complete and should not continue.
     */
    visitChildren: function(
      context,
      callback)
    {
      var th = this.getTypeHandler();
      if (this._implementsFunction(th, "visitChildren"))
      {
        return th.visitChildren(this, context, callback);
      }

      return this.visitStampedChildren(null, null, null,
        context, callback);
    },

    /**
     * Convenience function for type handlers that stamp their children to
     * visit the children AMX nodes from inside of a custom visitChildren
     * function.
     *
     * @param {object} key the stamp key of the children to visit.
     * @param {Array.<string>|null} facetNamesToInclude list of facet names to visit.
     *        If empty the facets will not be processed for this
     *        stamp. If null, all the facets will be processed. To visit the children of
     *        non-facets, include null in the array.
     * @param {function|null} filterCallback an optional function to filter the children
     *        to visit. The function will be invoked with this node,
     *        the stamp key, and the child node.
     *        Function must return a boolean. If true, the tag will be used to create
     *        children, if false the tag will not be processed.
     * @param {adf.mf.api.amx.VisitContext} context the visit context
     * @param {Function} callback the callback function to invoke when visiting. Should accept
     *        the context and the node as arguments
     * @return {boolean} true if the visitation is complete and should not continue.
     */
    visitStampedChildren: function(
      key,
      facetNamesToInclude,
      filterCallback,
      visitContext,
      visitCallback)
    {
      var visitAll = visitContext.isVisitAll();
      var nodesToWalk = visitContext.getNodesToWalk();

      var facetNames;
      if (facetNamesToInclude == null)
      {
        facetNames = [];
        var facets = this.getFacets();
        for (var name in facets)
        {
          facetNames.push(name);
        }
        facetNames.push(null);
      }
      else
      {
        facetNames = facetNamesToInclude;
      }

      for (var f = 0, numFacets = facetNames.length; f < numFacets; ++f)
      {
        var facetName = facetNames[f];
        var children = this.getChildren(facetName, key);
        // Loop through all the children, note if the facet name is null
        // then we are visiting the direct (non-facet) children.
        for (var i = 0, size = children.length; i < size; ++i)
        {
          var child = children[i];
          // See if we are visiting all or if the node is one to be visited
          if (visitAll || nodesToWalk.indexOf(child) >= 0)
          {
            // If there is a filter function, call it to see if this node
            // should be visited
            if (filterCallback == null ||
              filterCallback(this, key, child))
            {
              if (child.visit(visitContext, visitCallback))
              {
                return true;
              }
            }
          }
        }
      }

      return false;
    },

    /**
     * Get the rendered children of the AMX node.
     * @param {string|null} facetName the name of the facet to retrieve the rendered children for or null
     *        to get the rendered children outside of the facets.
     * @param {Object|null} key An optional key to specify for stamping. If provided, it will retrieve
     *        the children AMX nodes for a given stamping key.
     * @return {Array.<adf.mf.api.amx.AmxNode>} the children that should be rendered for the given
     *         stamp key. This function will flatten any flattenable components and will not return
     *         any non-rendered nodes.
     */
    getRenderedChildren: function(facetName, key)
    {
      var result = [];
      var children = this.getChildren(facetName, key);
      for (var i = 0, size = children.length; i < size; ++i)
      {
        var vc = new adf.mf.api.amx.VisitContext();
        var child = children[i];

        child.visit(vc,
          function (context, node)
          {
            switch (node.getState())
            {
              case adf.mf.api.amx.AmxNodeStates["ABLE_TO_RENDER"]:
              case adf.mf.api.amx.AmxNodeStates["RENDERED"]:
              case adf.mf.api.amx.AmxNodeStates["PARTIALLY_RENDERED"]:
                break;
              default:
                return adf.mf.api.amx.VisitResult["REJECT"];
            }

            // Skip over any flattened nodes. Note that this means that the type handler
            // will never be called for preDestroy and destroy as those functions are currently
            // based on DOM nodes, not AMX nodes.
            if (node.isFlattenable())
            {
              return adf.mf.api.amx.VisitResult["ACCEPT"];
            }

            result.push(node);
            return adf.mf.api.amx.VisitResult["REJECT"];
          });
      }

      return result;
    },

    /**
     * Get if the node is flattenable. A flattened node produces no HTML but instead adds behavior
     * around the rendering of a node.
     * @return {boolean} true if the node is flattenable
     */
    isFlattenable: function()
    {
      var th = this.getTypeHandler();
      return this._implementsFunction(th, "isFlattenable") && th.isFlattenable(this);
    },

    /**
     * Get the current state of the node.
     * @return {int} the current state, as a constant value from adf.mf.api.amx.AmxNodeStates.
     */
    getState: function()
    {
      return this._state;
    },

    /**
     * Moves the state of the node. Should only be called by the framework or the node's type handler.
     * @param {int} state the new state of the node
     */
    setState: function(state)
    {
      this._state = state;
    },

    /**
     * Render the node.
     * @return {Object|null} an HTML element or node or null if there is no type handler for this node.
     *         Actually this is returning a JQuery object, needs to be converted to a DOM node.
     */
    renderNode: function()
    {
      var domNode = null;
      var $node = null;

      var mustProcessQueues = false;
      if (amx.mustProcessQueues)
      {
        mustProcessQueues = true;
        // turn it off so that the child calls does not process it.
        amx.mustProcessQueues = false;
      }

      // facet are not rendered as they should be handled by the parent
      var tag = this.getTag();
      if (tag.isUITag())
      {
        // if there are a "rendered" property set to false, then, we do not render
        if (this.getAttribute("rendered") === false)
        {
          // $node will be null
        }
        else
        {
          var nodeTypeHandler = this.getTypeHandler();

          // if renderer found
          if (this._implementsFunction(nodeTypeHandler, "create"))
          {
            var id = this.getId();
            if (adf.mf.log.Performance.isLoggable(adf.mf.log.level.FINEST))
            {
              adf.mf.internal.perf.trace("adf.mf.api.amx.AmxNode.renderNode",
                "Rendering node " + id);
            }

            var createResult = nodeTypeHandler.create(this, id);
            var useOldRenderingMode = false;

            // render node (could be the $node itself or a deferred that will
            // be resolved with the $node)
            try
            {
              if (createResult.jquery)
              {
                domNode = createResult.get(0);
                $node = createResult;
                useOldRenderingMode = true;
              }
              else
              {
                domNode = createResult;
                $node = $(createResult);
              }

              domNode.setAttribute("id", id);
            }
            catch (ex)
            {
              adf.mf.log.logInfoResource("AMXInfoBundle",
                adf.mf.log.level.SEVERE, "renderNode", "MSG_CREATE_FAILED",
                this.getTag().getPrefixedName(), ex);
              return null;
            }

            try
            {
              // Add node to init and post display queues
              if (this._implementsFunction(nodeTypeHandler, "init"))
              {
                amx.queueForInit(useOldRenderingMode ? $node : domNode);
              }
              if (this._implementsFunction(nodeTypeHandler, "postDisplay"))
              {
                amx.queueForPostDisplay(useOldRenderingMode ? $node : domNode);
              }

              $node.data("amxNode", this);
              // add the amx classes
              $node.addClass("amx-node " + tag.getPrefixedName().replace(":", "-"));

              // add the eventual inlineStyle
              var inlineStyle = this.getAttribute("inlineStyle");
              if (inlineStyle)
              {
                if (adf.mf.environment.profile.dtMode)
                {
                  // if adf.mf.environment.profile.dtMode, remove el
                  inlineStyle = inlineStyle.replace(/#\{(.*?)\}/ig, ' ');
                }
                var existingStyle = domNode.getAttribute("style");
                if (existingStyle == null)
                  domNode.setAttribute("style", inlineStyle);
                else
                  domNode.setAttribute("style", existingStyle + ";" + inlineStyle);
              }
              var styleClass = this.getAttribute("styleClass");
              if (styleClass)
              {
                if (adf.mf.environment.profile.dtMode)
                {
                  // if adf.mf.environment.profile.dtMode, remove el
                  styleClass = styleClass.replace(/#\{(.*?)\}/ig, ' ');
                }
                $node.addClass(styleClass); // TODO make non-jQuery
              }

              if (amx.isValueTrue(this.getAttribute("readOnly")))
              {
                $node.addClass("amx-readOnly"); // TODO make non-jQuery
              }
              if (amx.isValueTrue(this.getAttribute("disabled")))
              {
                $node.addClass("amx-disabled"); // TODO make non-jQuery
              }
              if ($.isFunction(nodeTypeHandler.destroy))
              {
                $node.addClass("amx-has-destroy"); // TODO make non-jQuery
              }
              if ($.isFunction(nodeTypeHandler.preDestroy))
              {
                $node.addClass("amx-has-predestroy");
              }

              if (mustProcessQueues)
              {
                //TODO: need to do the deferred way for both.
                amx.processAndCleanInitQueue();
                amx.processAndCleanPostDisplayQueue();
                amx.mustProcessQueues = true;
              }
            }
            catch (ex)
            {
              adf.mf.log.logInfoResource("AMXInfoBundle",
                adf.mf.log.level.SEVERE, "renderNode", "MSG_CREATE_FAILED",
                this.getTag().getPrefixedName(), ex);
            }
          }
          else
          {
            adf.mf.log.logInfoResource("AMXInfoBundle",
              adf.mf.log.level.WARNING, "renderNode", "MSG_NO_RENDERER",
              this.getTag().getPrefixedName());
          }
        }
      }

      // adf.mf.internal.perf.stop("adf.mf.api.amx.renderNode",
      //   amxNode.id, "Func ID " + loc_call_idx);

      this.setState(adf.mf.api.amx.AmxNodeStates["RENDERED"]);
      return $node; // TODO make non-jQuery
    },

    /**
     * Renders the sub-nodes of this node.
     * @param {string|null} facetName the name of the facet to render the children for or null
     *        to render the non-facet children.
     * @return {Object} jQuery object containing all of the renderer HTML nodes
     */
    renderSubNodes: function(facetName, key)
    {
      var mustProcessQueues = false;
      if (amx.mustProcessQueues)
      {
        mustProcessQueues = true;
        // turn it off so that the child calls does not process it.
        amx.mustProcessQueues = false;
      }

      var $subNodes = $();
      var children = this.getRenderedChildren(facetName, key);
      for (var i = 0, size = children.length; i < size; ++i)
      {
        var childNode = children[i];
        var $subNode = childNode.renderNode();
        if ($subNode)
        {
          $subNodes = $subNodes.add($subNode);
        }
      }

      if (mustProcessQueues)
      {
        //TODO: need to do the deferred way for both.
        amx.processAndCleanInitQueue();
        amx.processAndCleanPostDisplayQueue();
        amx.mustProcessQueues = true;
      }

      return $subNodes;
    },

    rerenderNode: function()
    {
      var oldDomNode = document.getElementById(this.getId());
      if (oldDomNode == null)
      {
        var amxNode = this.getParent().__getClosestRenderedNode();
        if (amxNode != null)
        {
          amxNode.rerenderNode();
        }
        return;
      }

      var isFinestLoggingEnabled = adf.mf.log.Performance.isLoggable(adf.mf.log.level.FINEST);
      if (isFinestLoggingEnabled)
      {
        adf.mf.internal.perf.trace(
          "adf.mf.api.amx.AmxNode.rerenderNode",
          "Re-rendering node " + this.getId());
      }

      // we make sure that amx.mustProcessQueues is off so that no sub calls (i.e. renderNode) process the queues
      amx.mustProcessQueues = false;

      var newNode = this.renderNode();
      if (newNode != null && newNode.jquery != null)
      {
        newNode = newNode.get(0);
      }

      oldDomNode.parentNode.insertBefore(newNode, oldDomNode);
      adf.mf.internal.amx.removeAmxDomNode(oldDomNode);

      // we process and clean the Queues
      // Note: Today init and postDisplay are called at the same time. For optimization, init should be called before the node is visible to the user.
      //       In the case of a recreatenode might be hard to have the init before the UI is display to the user (also, the value might be minimum)
      amx.processAndCleanInitQueue();
      amx.processAndCleanPostDisplayQueue();
      // we turn back on the amx.mustProcessQueues
      amx.mustProcessQueues = true;
    },

    /**
     * Checks the state of the node to see if the node should be rendered.
     * The node is considered to be renderable if it is in the ABLE_TO_RENDER,
     * RENDERED or PARTIALLY_RENDERED state.
     *
     * @return {boolean} true if the node should be rendered.
     */
    isRendered: function()
    {
      switch (this.getState())
      {
        case adf.mf.api.amx.AmxNodeStates["ABLE_TO_RENDER"]:
        case adf.mf.api.amx.AmxNodeStates["RENDERED"]:
        case adf.mf.api.amx.AmxNodeStates["PARTIALLY_RENDERED"]:
          return true;
        default:
          return false;
      }
    },

    /**
     * Called to refresh the HTML of a node. This method is called after the updateChildren
     * method and should be implemented by type handlers that wish to update their DOM in
     * response to a change.
     * @param {adf.mf.api.amx.AmxAttributeChange} attributeChanges the changed attributes
     * @param {adf.mf.api.amx.AmxDescendentChanges|null} descendentChanges the changes for any
     *        descendent nodes that need to be refreshed.
     */
    refresh: function(attributeChanges, descendentChanges)
    {
      var th = this.getTypeHandler();
      if (this._implementsFunction(th, "refresh"))
      {
        th.refresh(this, attributeChanges, descendentChanges);
      }
    },

    /**
     * Applies any attribute changes. Usually called as a result of the data change
     * framework.
     *
     * @param {Object<string, boolean>} affectedAttributes object with keys of the
     *        attribute names that have changed and a value of true.
     * @param {Object<string, adf.mf.api.amx.AmxCollectionChange} collectionChanges the change
     *        details for collection attributes that have changed
     * @return {adf.mf.api.amx.AmxAttributeChange} returns the changed properties and their old
     *         values.
     */
    updateAttributes: function(affectedAttributes, collectionChanges)
    {
      // First, update the attributes that have changed
      var tag = this.getTag();
      var changes = new adf.mf.api.amx.AmxAttributeChange();
      var oldValue;
      var newValue;
      var cacheMiss = false;
      var collectionModelMiss = false;

      // See if one of the affected Attributes is the rendered attribute
      if (affectedAttributes["rendered"])
      {
        var oldValue = this.getAttribute("rendered");
        var newValue = adf.mf.environment.profile.dtMode ? true : adf.mf.el.getLocalValue(tag.getAttribute("rendered"));

        if (newValue === undefined)
        {
          // The new value is not in the EL cache
          this.setState(adf.mf.api.amx.AmxNodeStates["INITIAL"]);
          this.setAttributeResolvedValue("rendered", newValue);
          changes.__addChangedAttribute("rendered", oldValue);
          return changes;
        }

        // Ensure a boolean type
        newValue = amx.isValueTrue(newValue);
        if (oldValue != newValue)
        {
          // Update the value on the node
          this.setAttributeResolvedValue("rendered", newValue);
          changes.__addChangedAttribute("rendered", oldValue, null);

          if (!newValue)
          {
            // The node is no longer rendered. Remove any children and any other
            // properties that do not need to be kept anymore
            this._removeChildrenFromDataChangeNotification();
            this._facets = {};
            this._children = {};
            this._modifiableEl = {};
            this._childrenCreated = false;
            this._converter = null;

            // Update the state
            this.setState(adf.mf.api.amx.AmxNodeStates["UNRENDERED"]);

            // Don't process any more attribute changes on unrendered nodes.
            return changes;
          }

          // The node was not rendered but now is. Allow the rest of the attributes
          // to be process. First, change the state to INITIAL so that the children
          // may be built
          this.setState(adf.mf.api.amx.AmxNodeStates["INITIAL"]);

          // Return the old values to the caller
          return changes;
        }
      }

      // If the node is not rendered, then do not process any other attributes
      if (this.getState() == adf.mf.api.amx.AmxNodeStates["UNRENDERED"])
      {
        return changes;
      }

      var converterAttrRe = /^converter_/;

      // At this point, the rendered attribute has not changed, just process the changed
      // attributes
      var converterAffected = false;
      for (var attrName in affectedAttributes)
      {
        if (attrName == "rendered")
        {
          continue;
        }

        if (converterAttrRe.test(attrName))
        {
          converterAffected = true;
          continue;
        }

        var oldValue = this.getAttribute(attrName);
        var result = this._processAttribute(attrName);

        cacheMiss = cacheMiss || result["cacheMiss"];
        collectionModelMiss = collectionModelMiss || result["collectionModelMiss"];

        var newValue = this.getAttribute(attrName);
        var collectionChange = collectionChanges == null ? null : collectionChanges[attrName];
        changes.__addChangedAttribute(attrName, oldValue, collectionChange);
      }

      if (converterAffected && this._converterTag != null)
      {
        var hasConverter = this.getConverter() != null;

        // Force the re-creation of the converter, if necessary
        this._converter = null;

        if (this._processConverter())
        {
          var oldValue = this.getAttribute("value");
          // If the value was not changed in this update and the converter was set
          // before, then we need a clean copy of the value
          if (hasConverter && affectedAttributes["value"] != true && !adf.mf.environment.profile.dtMode)
          {
            var valueEl = tag.getAttribute("value");
            this.setAttributeResolvedValue("value", adf.mf.el.getLocalValue(valueEl));
          }

          this._convertValue();
          changes.__addChangedAttribute("value", oldValue, null);
        }
      }
      else if (affectedAttributes["value"])
      {
        this._convertValue();
      }

      // Update the state to reflect if all the EL is available
      if (collectionModelMiss)
      {
        // Remove the children and the facets so that they will be recreated
        this._facets = {};
        this._children = {};
        this._childrenCreated = false;
        this.setState(adf.mf.api.amx.AmxNodeStates["INITIAL"]);
      }
      else if (cacheMiss && this.isRendered())
      {
        // Update the state, if necessary, to reflect that the node does not have all
        // the required attributes.
        this.setState(adf.mf.api.amx.AmxNodeStates["WAITING_ON_EL_EVALUATION"]);
      }

      if (cacheMiss == false)
      {
        // See if all the attributes that are EL bound are now resolved. If so, then the state should be moved to
        // ABLE_TO_RENDER.
        // TODO: should probably have a hook that allows the type handler to intervene here.
        var attrNames = tag.getAttributeNames();
        for (var i = 0, size = attrNames.length; i < size; ++i)
        {
          var name = attrNames[i];
          if (tag.isAttributeElBound(name) &&
            acceptAttributeForElProcessing(name, tag.getAttribute(name)))
          {
            if (this.getAttribute(name) === undefined)
            {
              cacheMiss = true;
              break;
            }
          }
        }

        if (cacheMiss == false)
        {
          // At this point, all attributes that are EL bound have cache values. Update the state
          this.setState(adf.mf.api.amx.AmxNodeStates["ABLE_TO_RENDER"]);
        }
      }

      return changes;
    },

    /**
     * Process any necessary updates to the children AMX nodes during an attribute
     * change. This is called after the updateAttributes function and before the refresh
     * function. Type handlers may implement a function updateChildren with the amx node and
     * the old attribute values as the parameters. The implementation of the function should
     * remove any old children and create and add any new children to the AMX node. The
     * framework will initialize the children and call the refresh function on the nodes
     * once they are ready to render.
     * @param {adf.mf.api.amx.AmxAttributeChange} attributeChanges the changed attributes
     * @return {number} one of the adf.mf.api.amx.AmxNodeChangeResult constants.
     */
    updateChildren: function(attributeChanges)
    {
      // See if the node ever created children
      if (this._childrenCreated)
      {
        var th = this.getTypeHandler();
        if (this._implementsFunction(th, "updateChildren"))
        {
          return th.updateChildren(this, attributeChanges);
        }

        return adf.mf.api.amx.AmxNodeChangeResult["RERENDER"];
      }
      else
      {
        // The node never created its children, so use the _createChildren
        // method instead of the updateChildren
        state = this.getState();
        if (state == adf.mf.api.amx.AmxNodeStates["WAITING_ON_EL_EVALUATION"] ||
          state == adf.mf.api.amx.AmxNodeStates["ABLE_TO_RENDER"])
        {
          this._createChildren();
        }
        return adf.mf.api.amx.AmxNodeChangeResult["RERENDER"];
      }
    },

    /**
     * Convenience function for type handlers that stamp their children to
     * create the children AMX nodes from inside of a custom createChildrenNodes
     * function. It will create children for any UI tags.
     *
     * @param {object} key the stamp key to use
     * @param {Array.<string>|null} facetNamesToInclude list of facet names to create
     *        children for. If empty the facets will not be processed for this
     *        stamp. If null, all the facets will be processed. Include a null value
     *        inside the array to create children for non-facet tags.
     * @param {function|null} filterCallback an optional function to filter the children
     *        to create the children for. The function will be invoked with the node,
     *        the stamp key, the child tag and the facet name (or null for non-facets).
     *        Function must return a boolean. If true, the tag will be used to create
     *        children, if false the tag will not be processed.
     */
    createStampedChildren: function(
      key,
      facetNamesToInclude,
      filterCallback)
    {
      var tag = this.getTag();
      var node, i, size;

      // First create the AMX nodes for the facets
      if (facetNamesToInclude == null || facetNamesToInclude.length > 0)
      {
        var facetTags = tag.getChildrenFacetTags();
        for (i = 0, size = facetTags.length; i < size; ++i)
        {
          var facetData = facetTags[i].getFacet();
          var facetName = facetData["name"];

          if (facetNamesToInclude != null &&
            facetNamesToInclude.length > 0 &&
            facetNamesToInclude.indexOf(facetName) == -1)
          {
            continue;
          }

          var facetTagChildren = facetData["children"];

          for (var j = 0, facetChildrenSize = facetTagChildren.length;
            j < facetChildrenSize; ++j)
          {
            var facetTag = facetTagChildren[j];
            if (!facetTag.isUITag())
            {
              continue;
            }

            if (filterCallback == null ||
              filterCallback(this, key, facetTag, facetName))
            {
              node = facetTag.buildAmxNode(this, key);
              this.addChild(node, facetName);
            }
          }
        }
      }

      // Create the nodes for the children
      if (facetNamesToInclude == null ||
        facetNamesToInclude.indexOf(null) >= 0)
      {
        var childrenUiTags = tag.getChildrenUITags();
        for (i = 0, size = childrenUiTags.length; i < size; ++i)
        {
          var childTag = childrenUiTags[i];

          if (filterCallback == null ||
            filterCallback(this, key, childTag, null))
          {
            node = childTag.buildAmxNode(this, key);
            this.addChild(node);
          }
        }
      }
    },

    __getConverterTag: function()
    {
      return this._converterTag;
    },

    /**
     * Returns the node closest to the this node, which may
     * be the current node, that is rendered and returns it.
     * @param {Boolean|null} checkAbleToRenderNodes if true nodes in the ABLE_TO_RENDER state
     *        will be checked if rendered. This is useful during the data change event processing
     *        where a node's state may have been altered
     * @return {adf.mf.api.amx.AmxNode|null} the closest rendered node or null if no
     *         nodes are rendered.
     */
    __getClosestRenderedNode: function(checkAbleToRenderNodes)
    {
      var isFinestLoggingEnabled = adf.mf.log.Performance.isLoggable(adf.mf.log.level.FINEST);

      var targetNodeId;
      if (isFinestLoggingEnabled)
      {
        targetNodeId = this.getId();
      }

      for (var amxTargetNode = this; amxTargetNode != null;
        amxTargetNode = amxTargetNode.getParent())
      {
        var state = amxTargetNode.getState();
        switch (state)
        {
          case adf.mf.api.amx.AmxNodeStates["PARTIALLY_RENDERED"]:
          case adf.mf.api.amx.AmxNodeStates["RENDERED"]:
          case adf.mf.api.amx.AmxNodeStates["ABLE_TO_RENDER"]:
            // If in the ABLE_TO_RENDER, only use if checkAbleToRenderNodes is true
            if (checkAbleToRenderNodes !== true &&
              state == adf.mf.api.amx.AmxNodeStates["ABLE_TO_RENDER"])
            {
              continue;
            }

            // Verify that the DOM node still exists (state is consistent)
            if (document.getElementById(amxTargetNode.getId()) != null)
            {
              if (isFinestLoggingEnabled)
              {
                adf.mf.internal.perf.trace(
                  "adf.mf.api.amx.AmxNode.__getClosestRenderedNode",
                  "Closest rendered ancestor node of node " + targetNodeId +
                  " was found to be " + amxTargetNode.getId());
              }
              return amxTargetNode;
            }
            break;
        }
      }

      if (isFinestLoggingEnabled)
      {
        adf.mf.internal.perf.trace(
          "adf.mf.api.amx.AmxNode.__getClosestRenderedNode",
          "No rendered ancestor node could be found for node " + targetNodeId);
      }

      return null;
    },

    __getDescendentChangeAction: function(changes)
    {
      var th = this.getTypeHandler();
      // Delegate to the type handler if the custom function has been provided
      if (this._implementsFunction(th, "getDescendentChangeAction"))
      {
        return th.getDescendentChangeAction(this, changes);
      }

      // If a custom handler function has not been provided, the default behavior is
      // to re-render the closest rendered ancestor AMX node if any of the children
      // have had their rendered state changed.
      var changedAmxNodes = changes.getAffectedNodes();
      for (var i = 0, size = changedAmxNodes.length; i < size; ++i)
      {
        var descendentAmxNode = changedAmxNodes[i];
        var oldState = changes.getPreviousNodeState(descendentAmxNode);
        var rendered = descendentAmxNode.isRendered();
        var wasRendered = (
            oldState == adf.mf.api.amx.AmxNodeStates["ABLE_TO_RENDER"] ||
            oldState == adf.mf.api.amx.AmxNodeStates["PARTIALLY_RENDERED"] ||
            oldState == adf.mf.api.amx.AmxNodeStates["RENDERED"]
          ) && document.getElementById(descendentAmxNode.getId()) != null;

        if ((rendered == false && wasRendered) ||
         (rendered && wasRendered == false))
        {
          // The descendent AMX node's rendered state has changed.
          // We need to re-render the ancestor to reflect the change in the UI
          // since the ancestor is not configured to handle the change itself
          return adf.mf.api.amx.AmxNodeChangeResult["RERENDER"];
        }
      }

      // If none of the changes result in a rendered state change, by default
      // we do not need to take any action.
      return adf.mf.api.amx.AmxNodeChangeResult["NONE"];
    },

    _processAttribute: function(attrName)
    {
      var returnObject = {
        "cacheMiss": false,
        "collectionModelMiss": false
      };

      var tag = this.getTag();
      if (!tag.isAttributeElBound(attrName))
      {
        return returnObject;
      }

      var el = tag.getAttribute(attrName);

      if (adf.mf.environment.profile.dtMode)
      {
        this.setAttributeResolvedValue(attrName, el);
        return returnObject;
      }

      // TODO: move the acceptAttributeForElProcessing into the AmxNode class
      // instead of a global function
      //
      if (!acceptAttributeForElProcessing(attrName, el))
      {
        return returnObject;
      }

      var value = adf.mf.el.getLocalValue(el);
      if (value === undefined)
      {
        // Record that at least one EL was not available so that we update
        // the state appropriately
        returnObject["cacheMiss"] = true;

        if (attrName == "value" && tag.getAttribute("var") != null)
        {
          returnObject["collectionModelMiss"] = true;
        }
      }
      else
      {
        // Temporary hack for backwards compatibility is needed here. The old code, when getting
        // a collection model, would first look up the collection model via EL but then use the
        // javascript iterator as the returned attribute value. As a result, we first need to
        // get the collection model (ensuring the value is not an array), and only if that is
        // not undefined, get the iterator and store that.
        if (attrName == "value" && tag.getAttribute("var") != null &&
          !Array.isArray(value))
        {
          // If this code is reached, then the value variable is the collection model, but we
          // need the JavaScript iterator for the type handlers. Temporarily "hack" the code so that
          // we now get the iterator from EL
          var iteratorEl = el.substring(0, el.length - 1) + ".iterator}";
          value = adf.mf.el.getLocalValue(iteratorEl);
          if (value === undefined)
          {
            returnObject["collectionModelMiss"] = true;
          }
        }

        // Store on the node
        this.setAttributeResolvedValue(attrName, value);
      }
      return returnObject;
    },

    _createChildren: function()
    {
      // By default only create the children once
      if (this._childrenCreated)
      {
        return;
      }
      this._childrenCreated = true;

      var th = this.getTypeHandler();
      // Delegate to the type handler if the custom function has been provided
      if (this._implementsFunction(th, "createChildrenNodes"))
      {
        var handled = th.createChildrenNodes(this);
        if (this.getState() == adf.mf.api.amx.AmxNodeStates["INITIAL"])
        {
          // If the type handler moves the state to INITIAL, call the createChildrenNodes
          // again.
          this._childrenCreated = false;
          return;
        }

        if (handled)
        {
          return;
        }
      }

      // Create the non-facet children (non-stamped)
      this.createStampedChildren(null, null, null);

      // Current hard-code any converter behavior. Really need to consider a
      // behavior object API
      var tag = this.getTag();
      var tags = tag.getChildren("http://xmlns.oracle.com/adf/mf/amx");
      for (var i = 0, size = tags.length; i < size; ++i)
      {
        // Force any EL in the child behavior tags to be loaded into the cache
        // since they do not handle lazily loaded EL
        var tag = tags[i];
        if (tag.getName() == "closePopupBehavior")
        {
          this._preLoadTagAttributes(tag, "popupId");
          break;
        }

        if (tag.getName() == "showPopupBehavior")
        {
          this._preLoadTagAttributes(tag, "align", "alignId", "popupId");
          break;
        }
      }
    },

    _processConverterTag: function()
    {
      var tags = this.getTag().getChildren("http://xmlns.oracle.com/adf/mf/amx");
      for (var i = 0, size = tags.length; i < size; ++i)
      {
        var tag = tags[i];
        var tagName = tag.getName();
        if (tagName == "convertNumber" || tagName == "convertDateTime")
        {
          this._converterTag = tag;

          // Now associate the EL of the converter with this node for data change events
          this._postProcessForDataChangeNotification(tag);
          break;
        }
      }
    },

    _processConverter: function()
    {
      if (this._converter != null || this._converterTag == null || adf.mf.environment.profile.dtMode == true)
      {
        return;
      }

      var convTag = this._converterTag;
      var convTagName = convTag.getName();
      var dirty = false;

      if (convTagName == "convertNumber")
      {
        if (amx.createNumberConverter)
        {
          var cacheMiss = this._preLoadTagAttributes(convTag, "currencyCode", "currencySymbol",
            "groupingUsed", "integerOnly", "maxFractionDigits", "maxIntegerDigits",
            "minFractionDigits", "minIntegerDigits", "type");
          if (cacheMiss == false)
          {
            this.setConverter(amx.createNumberConverter(convTag));
            dirty = true;
          }
          else
          {
            this.setState(adf.mf.api.amx.AmxNodeStates["WAITING_ON_EL_EVALUATION"]);
          }
        }
      }
      else if (convTagName == "convertDateTime")
      {
        if (amx.createDateTimeConverter)
        {
          var cacheMiss = this._preLoadTagAttributes(convTag, "dateStyle", "pattern",
            "timeStyle", "type");
          if (cacheMiss == false)
          {
            this.setConverter(amx.createDateTimeConverter(convTag));
            dirty = true;
          }
          else
          {
            this.setState(adf.mf.api.amx.AmxNodeStates["WAITING_ON_EL_EVALUATION"]);
          }
        }
      }

      return dirty;
    },

    _convertValue: function()
    {
      if (this._converter != null)
      {
        this.setAttributeResolvedValue("value",
          this._converter.getAsString(this.getAttribute("value")));
      }
    },

    _preLoadTagAttributes: function(tag, isConverter)
    {
      if (adf.mf.environment.profile.dtMode)
      {
        return false;
      }

      var cacheMiss = false;
      for (var i = 2, size = arguments.length; i < size; ++i)
      {
        var attr = arguments[i];
        if (tag.isAttributeElBound(attr))
        {
          var value = adf.mf.el.getLocalValue(tag.getAttribute(attr));
          cacheMiss = cacheMiss || value === undefined;
        }
      }

      return cacheMiss;
    },

    _implementsFunction: function(obj, name)
    {
      return obj != null && typeof obj[name] === "function";
    },

    _createUniqueId: function()
    {
      // ID will never be null as one is set during the pre-processing of the XML
      var id = this.getAttribute("id");
      var parent = this.getParent();

      if (parent == null)
      {
        this._id = id;
      }
      else
      {
        var parentId = parent.getId();
        var stampKey = this.getStampKey();

        if (stampKey == null)
        {
          // Find the portion af the parent with a colon in the ID
          var idx = parentId == null ? -1 : parentId.lastIndexOf(":");
          if (idx == -1)
          {
            // The parent is not "namespaced"
            this._id = id;
          }
          else
          {
            // Get the parent's "namespace" from the ID and use that as this node's prefix
            var prefix = parentId.substring(0, idx + 1);
            this._id = prefix + id;
          }
        }
        else
        {
          var re = /[^\w\.\-]/g;
          var strVal = stampKey.toString();
          // Replace any non-ID friendly values with a sequence of characters unlikely to appear in the
          // value. This assumes that most characters
          // of the iterationKey will be valid and will therefore produce a unique key. Using a token
          // cache would address this if this assumption becomes an issue. If we end up with duplicate
          // IDs due to escaping, we'll have to create a token cache approach.
          strVal = strVal.replace(re, "._.");

          this._id = parentId + ":" + strVal + ":" + id;
        }
      }
    },

    _findChildIndex: function(
      stampKey,
      nodeId,
      facetName)
    {
      var children = this.getChildren(facetName, stampKey);

      for (var i = 0, size = children.length; i < size; ++i)
      {
        var node = children[i];
        if (node.getId() == nodeId)
        {
          return i;
        }
      }

      return -1;
    },

    _findChildIndexAndFacetName: function(
      stampKey,
      nodeId)
    {
      var foundFacetName = null;
      // First search for the child in the children
      var index = this._findChildIndex(stampKey, nodeId, null);
      if (index == -1)
      {
        // If it was not found as a child, look for it as a facet child
        var facets = this.getFacets(stampKey);
        for (var facetName in facets)
        {
          index = this._findChildIndex(stampKey, nodeId, facetName);
          if (index >= 0)
          {
            foundFacetName = facetName;
            break;
          }
        }
      }

      return index == -1 ? null :
        {
          "index": index,
          "facetName": foundFacetName
        };
    },

    _removeChildrenFromDataChangeNotification: function()
    {
      var i, size, children;

      for (var stampKey in this._children)
      {
        children = this._children[stampKey];
        for (i = 0, size = children.length; i < size; ++i)
        {
          children[i]._removeFromDataChangeNotification();
        }
      }

      for (var stampKey in this._facets)
      {
        var facets = this._facets[stampKey];
        for (var facetName in facets)
        {
          children = facets[facetName];
          for (i = 0, size = children.length; i < size; ++i)
          {
            children[i]._removeFromDataChangeNotification();
          }
        }
      }
    },

    _removeFromDataChangeNotification: function()
    {
      // Remove this node from notifications
      var elDependencies = this.getTag().getElDependencies();
      for (var i = 0, size = elDependencies.length; i < size; ++i)
      {
        var elDependency = elDependencies[i];
        var nodes = nodeToElMap[elDependency];
        if (nodes != null)
        {
          var index = nodes.indexOf(this);
          if (index >= 0)
          {
            nodes.splice(index, 1);
          }
        }
      }

      this._removeChildrenFromDataChangeNotification();
    },

    /**
     * Function to handle any necessary code to properly notify the node of changes from the model.
     */
    _postProcessForDataChangeNotification: function(tag)
    {
      var elDependencies = tag.getElDependencies();
      for (var i = 0, size = elDependencies.length; i < size; ++i)
      {
        var elDependency = elDependencies[i];
        var nodes = nodeToElMap[elDependency];
        if (nodes == null)
        {
          nodes = [ this ];
          nodeToElMap[elDependency] = nodes;
        }
        else
        {
          if (nodes.indexOf(this) == -1)
          {
            nodes.push(this);
          }
        }
      }
    }
  };

  /**
   * Sort nodes of in an array so that parents appear first
   * and descendents later.
   */
  AmxNode.__sortNodesByDepth = function(nodes)
  {
    function getNodeDepth(node)
    {
      var depth = 0;
      for (var n = node; n != null; n = n.getParent())
      {
        ++depth;
      }

      return depth;
    }

    function nodeCompare(n1, n2)
    {
      if (n1 == n2)
      {
        return 0;
      }

      var n1p = n1.getParent();
      var n2p = n2.getParent();

      if (n1p == n2p)
      {
        // If in the same parent, first compare the stamp keys
        var s1 = n1.getStampKey();
        var s2 = n2.getStampKey();

        if (s1 == s2)
        {
          // The nodes are in the same parent with the same stamp key,
          // return the order of the nodes in the children array
          var n1data = n1p._findChildIndexAndFacetName(s1, n1.getId());
          var n2data = n2p._findChildIndexAndFacetName(s2, n2.getId());

          var n1f = n1data["facetName"];
          var n2f = n2data["facetName"];


          if (n1f == n2f)
          {
            // They have the same facet (may be null), so just compare the
            // indexes
            return n1data["index"] - n2data["index"] < 0 ? -1 : 1;
          }
          else
          {
            if (n1f == null)
            {
              return 1;
            }
            else if (n2f == null)
            {
              return -1;
            }

            return n1f < n2f ? -1 : 1;
          }
        }
        else // The stamp keys are not the same
        {
          // Use a string comparisson of the keys
          return (("" + s1) < ("" + s2)) ? -1 : 1;
        }
      }
      else // The parents are not the same
      {
        var d1 = getNodeDepth(n1);
        var d2 = getNodeDepth(n2);

        var tmp1 = n1;
        var tmp2 = n2;
        var origD1 = d1;
        var origD2 = d2;

        // Ensure that they are the same depth
        if (d1 != d2)
        {
          while (d1 > d2)
          {
            tmp1 = tmp1.getParent();
            --d1;
          }

          while (d2 > d1)
          {
            tmp2 = tmp2.getParent();
            --d2;
          }

          if (tmp1 == tmp2)
          {
            // The nodes are the same, return the one that was more shallow
            return origD1 < origD2 ? -1 : 1;
          }

          if (tmp1.getParent() == tmp2.getParent())
          {
            // If they have the same parent at this level, then recursively
            // use this function
            return nodeCompare(tmp1, tmp2);
          }
        }

        // At this point, we have nodes at the same depth, but the parents are not the same.
        // We need to walk up the parent hierarchy until we find nodes that share the same parent.
        for (var depth = d1; depth > 0; --depth)
        {
          var tmp1p = tmp1.getParent();
          var tmp2p = tmp2.getParent();

          if (tmp1p == tmp2p)
          {
            // We found the parents that are the same, use a recursive call
            return nodeCompare(tmp1, tmp2);
          }

          // Keep looking up the ancestory chain
          tmp1 = tmp1p;
          tmp2 = tmp2p;
        }

        // We should not have reached here as there is only one root node. This would only
        // happen if the nodes are from different hierarchies, which is not valid.
        // Throw an error so that we know it failed.
        throw new Error("Failed to sort the nodes in nodeCompare");
      }
    }

    nodes.sort(nodeCompare);
  };

  AmxNode.__getNodesDependentOnElToken = function(token)
  {
    var nodes = nodeToElMap[token];
    return nodes == null ? [] : nodes;
  }

  AmxNode.__clearBindings = function()
  {
    nodeToElMap = {}
  }
  // ------ /AMX Node ------ //

  // ------ AMX Collection change ------ //
  function AmxCollectionChange(data)
  {
    this._itemized = data["itemized"];

    if (this._itemized)
    {
      this._created = [];
      this._deleted = [];
      this._updated = [];
      this._dirtied = [];

      var i;
      var size;
      var key;

      var created = data["created"];
      if (created != null)
      {
        for (i = 0, size = created.length; i < size; ++i)
        {
          var obj = created[i];
          this._created.push(obj["key"]);
          // Note: In a future version we may need to pull more information off of the "obj"
        }
      }

      var updated = data["updated"];
      if (updated != null)
      {
        for (i = 0, size = updated.length; i < size; ++i)
        {
          this._updated.push(updated[i]);
        }
      }

      var deleted = data["deleted"];
      if (deleted != null)
      {
        for (i = 0, size = deleted.length; i < size; ++i)
        {
          this._deleted.push(deleted[i]);
        }
      var dirtied = data["dirtied"];
      if (dirtied != null)
      {
        for (i = 0, size = dirtied.length; i < size; ++i)
        {
          this._dirtied.push(dirtied[i]);
        }
      }
      }
    }
  }

  adf.mf.api.amx.AmxCollectionChange = AmxCollectionChange;

  AmxCollectionChange.prototype =
  {
    /**
     * Return if the change to the collection may be itemized
     * @return {boolean} true if the change may be itemized
     */
    isItemized: function()
    {
      return this._itemized;
    },

    /**
     * Get an array of the keys that were created.
     * @return {Array.<string>|null} created keys or null if the change cannot be itemized
     */
    getCreatedKeys: function()
    {
      return this._itemized ? this._created : null;
    },

    /**
     * Get an array of the keys that were removed.
     * @return {Array.<string>|null} the array of keys or null if the change cannot be itemized
     */
    getDeletedKeys: function()
    {
      return this._itemized ? this._deleted : null;
    },

    /**
     * Get an array of the keys that were updated.
     * @return {Array.<string>|null} the array of keys or null if the change cannot be itemized
     */
    getUpdatedKeys: function()
    {
      return this._itemized ? this._updated : null;
    },
    /**
     * Get an array of the keys that were dirtied.
     * @return {Array.<string>|null} the array of keys or null if the change cannot be itemized
     */
    getDirtiedKeys: function()
    {
      return this._itemized ? this._dirtied : null;
    }
  };
  // ------ /AMX Collection change ------ //


  // ------ AMX Attribute change ------ //
  /**
   * Object to allow type handlers to determine the changes that have been made during a data change
   * event.
   */
  function AmxAttributeChange()
  {
    this._changedAttributes = {};
    this._oldValues = {};
    this._length = 0;
    this._collectionChanges = {};
  }
  adf.mf.api.amx.AmxAttributeChange = AmxAttributeChange;

  AmxAttributeChange.prototype =
  {
    /**
     * Get the names of the attributes that have been affected during the current change.
     * @return {Array.<string>} array of the attribute names
     */
    getChangedAttributeNames: function()
    {
      return Object.keys(this._changedAttributes);
    },

    /**
     * Check if the attribute change is a collection change
     * @param {string} name the attribute name
     * @return {boolean} true if the change is a collection change
     */
    isCollectionChange: function(name)
    {
      return this._collectionChanges[name] != null;
    },

    /**
     * Get the collection model change information for an attribute
     * @param {string} name the attribute name
     * @return {adf.mf.api.amx.AmxCollectionChange|null} the change object if available
     */
    getCollectionChange: function(name)
    {
      var change = this._collectionChanges[name];
      return change == null ? null : change;
    },

    /**
     * Get the value of the attribute before the change was made
     * @param {string} name the attribute name
     */
    getOldValue: function(name)
    {
      return this._oldValues[name];
    },

    /**
     * Check if the attribute with the given name has changed.
     * @param {string} name the attribute name
     */
    hasChanged: function(name)
    {
      return this._changedAttributes[name] == true;
    },

    /**
     * Get the number of attribute changes
     */
    getSize: function()
    {
      return this._length;
    },

    /**
     * Mark an attribute as having been changed
     * @param {string} name the attribute name
     * @param {object} oldValue the attribute's old value
     * @param {adf.mf.api.amx.AmxCollectionChange|undefined} collectionChanges the collection model
     *        change information if applicable
     */
    __addChangedAttribute: function(name, oldValue, collectionChanges)
    {
      if (this.hasChanged(name) == false)
      {
        ++this._length;
        this._changedAttributes[name] = true;
      }
      this._oldValues[name] = oldValue;

      if (collectionChanges != null)
      {
        this._collectionChanges[name] = collectionChanges;
      }
    }
  };
  // ------ /AMX Attribute change ------ //

  // ------ AMX children changes ------ //
  function AmxDescendentChanges()
  {
    this._amxNodes = [];
    this._amxNodeChanges = {};
    this._previousStates = {};
  }

  adf.mf.api.amx.AmxDescendentChanges = AmxDescendentChanges;

  AmxDescendentChanges.prototype =
  {
    /**
     * Get the un-rendered changed descendent AMX nodes.
     * @return {Array.<adf.mf.api.amx.AmxNode>} array of AMX nodes that have changed
     */
    getAffectedNodes: function()
    {
      return this._amxNodes;
    },

    /**
     * Get the changes for a given AMX node.
     * @param {adf.mf.api.amx.AmxNode} amxNode the descendent AMX node that was changed
     * @return {adf.mf.api.amx.AmxAttributeChange} the changes that were made to the descendent node
     */
    getChanges: function(amxNode)
    {
      var id = amxNode.getId();
      return this._amxNodeChanges[id];
    },

    /**
     * Get the state of the descendent node before the changes were applied.
     * @param {adf.mf.api.amx.AmxNode} amxNode the descendent AMX node that was changed
     * @return {int} one of the adf.mf.api.amx.AmxNodeStates constant values
     */
    getPreviousNodeState: function(amxNode)
    {
      var id = amxNode.getId();
      return this._previousStates[id];
    },

    __addAmxNode: function(
      amxNode,
      previousState,
      attributeChanges)
    {
      var id = amxNode.getId();
      this._amxNodes.push(amxNode);
      this._previousStates[id] = previousState;
      this._amxNodeChanges[id] = attributeChanges;
    }
  };
  // ------ /AMX children changes ------ //

})();
// ------ /amx UI ------ //

// --------- amx UA --------- //
(function()
{
  var _hasTouch = null;

  amx.hasTouch = function()
  {
    if (_hasTouch === null)
    {
      _hasTouch = isEventSupported("touchstart");
    }
    return _hasTouch;
  }

  var isEventSupported = (function()
  {
    var TAGNAMES =
    {
      'select' : 'input',
      'change' : 'input',
      'submit' : 'form',
      'reset' : 'form',
      'error' : 'img',
      'load' : 'img',
      'abort' : 'img'
    };

    function isEventSupported(eventName)
    {
      var el = document.createElement(TAGNAMES[eventName] || 'div');
      eventName = 'on' + eventName;
      var isSupported = (eventName in el);
      if (!isSupported)
      {
        el.setAttribute(eventName, 'return;');
        isSupported = typeof el[eventName] == 'function';
      }
      el = null;
      return isSupported;
    }
    return isEventSupported;
  })();
})();
// --------- /amx UA --------- //

// --------- Utilities --------- //
(function()
{
  // Private array of chars to use
  var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

  amx.uuid = function(len)
  {
    len = len || 10;
    var chars = CHARS, uuid = [];
    var radix = chars.length;

    for (var i = 0; i < len; i++)
      uuid[i] = chars[0 | Math.random()*radix];

    return uuid.join('');
  }

  amx.arrayRemove = function(a, from, to)
  {
    var rest = a.slice((to || from) + 1 || a.length);
    a.length = from < 0 ? a.length + from : from;
    return a.push.apply(a, rest);
  }

  amx.registerInputValue = function(amxNode, attrName)
  {
    // create the field that will hold the attribute name to be validated
    if (amxNode.getAttribute("__attrToValidate") === undefined)
    {
      amxNode.setAttributeResolvedValue("__attrToValidate", attrName);
    }

    amxNode.storeModifyableEl(attrName);
  }

  /**
   * Rendrer would call this function to change the style of showRequired attribute
   * @param {Object} amxNode This is the amxNode object
   * @param {Object} field This object is returned from createField method and must have a "fieldRoot" property
   * @see See also the definition of amx.createField method inside amx-commonTags.js
   */
  adf.mf.api.amx.applyRequiredMarker = function(amxNode, field)
  {
    if (amx.isValueTrue(amxNode.getAttribute("showRequired")) || amx.isValueTrue(amxNode.getAttribute("required")))
    {
      adf.mf.internal.amx.addCSSClassName(field.fieldRoot, "required");
    }
  };

  // safely return the value, handling json null objects,
  // undefined objects, and null objects by returning null
  amx.getObjectValue = function(value)
  {
    if (value == null)
    {
      return null;
    }
    if (typeof value === "undefined")
    {
      return null;
    }

    if (typeof value[".null"] !== "undefined")
    {
      adf.mf.log.logInfoResource("AMXInfoBundle", adf.mf.log.level.INFO, "getObjectValue", "MSG_UNHANDLED_NULL");
      if (value[".null"] == true)
      {
        return null;
      }
    }
    return value;
  }

  /**
   * Get the value as a string. Null or undefined objects will
   * be returned as an empty string.
   * @param {Object} value the value
   * @return {String} the value as a string.
   */
  amx.getTextValue = function(value)
  {
    value = amx.getObjectValue(value);
    if (value == null)
    {
      return "";
    }

    // Ensure the value is a string
    return "" + value;
  }

  // Gets the amx_dtfolderpath if it is on the URL
  amx.getDtFolderPath = function()
  {
    var queryString = adf.mf.api.getQueryString();
    var amx_dtfolderpath = adf.mf.api.getQueryStringParamValue(queryString, "amx_dtfolderpath", null);
    return amx_dtfolderpath;
  }

  // Builds a string that is the relative path to
  // the folder containing the amx page we are currently
  // viewing.
  amx.currentPageContainingFolder = function()
  {
    try
    {
      // Check for DT folder path
      var amx_dtfolderpath = amx.getDtFolderPath();
      if(amx_dtfolderpath !== null)
      {
        return amx_dtfolderpath;
      }
      // Get current amx filename
      var amxPage = adf.mf.internal.controller.ViewHistory.peek().amxPage;
      // Break up the filename so we can get the length
      // of just the filename.
      var parts = amxPage.split("/");
      // Add the feature root prefix to the filename
      var amxPageFullPath = adfc.Util.addFeatureRootPrefix(amxPage);
    }
    catch (ex)
    {
      adf.mf.log.logInfoResource("AMXInfoBundle", adf.mf.log.level.SEVERE, "currentPageContainingFolder", "MSG_CURRENT_PAGE_FOLDER_FAILED", ex);
      return "";
    }
    // Strip off the filename
    return amxPageFullPath.substr(0,
      amxPageFullPath.length - parts[parts.length - 1].length);
  }

  // Determines if the tartget string has a protocol
  amx.hasProtocol = function(url)
  {
    return /^(:?\w+:)/.test(url);
  }

  // Builds the relative path based to the specified
  // resource assuming it is relative to the current
  // amx page.  If there is a protocol on the resource
  // then it is assumed to be an absolute path and
  // left unmodified
  amx.buildRelativePath = function(url)
  {
    if(amx.hasProtocol(url))
    {
      return url;
    }

    url = url.replace("\\", "/");
    if(url.charAt(0) == "/")
    {
        // Check for DT folder path
        var amx_dtfolderpath = amx.getDtFolderPath();
        if (amx_dtfolderpath !== null)
        {
            var publicHtmlString = 'public_html/';
            var publicHtmlIndex    = amx_dtfolderpath.indexOf(publicHtmlString);

            return (amx_dtfolderpath.substring(0, publicHtmlIndex + publicHtmlString.length)) + url.substring(1);
        }
        else
        {
            return adfc.Util.addFeatureRootPrefix(url.substring(1));
        }
    }

    return amx.currentPageContainingFolder() + url;
  }

  /**
   * Adds a CSS className to the dom node if it doesn't already exist in the classNames list and
   * returns <code>true</code> if the class name was added.
   * @param {HTMLElement} domElement DOM Element to add style class name to
   * @param {String:null} className Name of style class to add
   * @return {Boolean} <code>true</code> if the style class was added
   */
  adf.mf.internal.amx.addCSSClassName = function(domElement, className) // TODO move into some "domutils" class
  {
    // TODO AdfAssert.assertDomElement(domElement);
    var added = false;

    if (className != null)
    {
      // TODO AdfAssert.assertString(className);

      var currentClassName = domElement.className;

      // get the current location of the className to add in the classNames list
      var classNameIndex = adf.mf.internal.amx.getCSSClassNameIndex(currentClassName, className);

      // the className doesn't exist so add it
      if (classNameIndex == -1)
      {
        var newClassName = (currentClassName)
                                 ? className + " " + currentClassName
                                 : className;

        domElement.className = newClassName;

        added = true;
      }
    }

    return added;
  };

  /**
   * Removes a CSS className to the dom node if it existd in the classNames list and
   * returns <code>true</code> if the class name was removed.
   * @param {HTMLElement} domElement DOM Element to remove style class name from
   * @param {String:null} className Name of style class to remove
   * @return {Boolean} <code>true</code> if the style class was removed
   */
  adf.mf.internal.amx.removeCSSClassName = function(domElement, className) // TODO move into some "domutils" class
  {
    // TODO AdfAssert.assertDomElement(domElement);

    var removed = false;

    if (className != null)
    {
      var currentClassName = domElement.className;

      var classNameIndex = adf.mf.internal.amx.getCSSClassNameIndex(currentClassName, className);

      // only need to do work if CSS class name is present
      if (classNameIndex != -1)
      {
        var classNameEndIndex = classNameIndex + className.length;

        // the new classNames string is the string before our className and leading whitespace plus
        // the string after our className and trailing whitespace
        var beforeString = (classNameIndex == 0)
                             ? null
                             : currentClassName.substring(0, classNameIndex);
        var afterString =  (classNameEndIndex == currentClassName.length)
                             ? null
                             : currentClassName.substring(classNameEndIndex + 1); // skip space

        var newClassName;

        if (beforeString == null)
        {
          if (afterString == null)
          {
            newClassName = "";
          }
          else
          {
            newClassName = afterString;
          }
        }
        else
        {
          if (afterString == null)
          {
            newClassName = beforeString;
          }
          else
          {
            newClassName = beforeString + afterString;
          }
        }

        domElement.className = newClassName;

        removed = true;
      }
    }

    return removed;
  };

  /**
   * Convenient function to add or removes a CSS className from the dom node.
   * @param {Boolean} add boolean value if we should do an add of a CSS className
   * @param {HTMLElement} domElement DOM Element to remove style class name from
   * @param {String} className the CSS className which should be added or removed
   * @return {Boolean} <code>true</code> if the element's style class list changed
   */
  adf.mf.internal.amx.addOrRemoveCSSClassName = function(
    add,
    domElement,
    className) // TODO move into some "domutils" class
  {
    var func = (add)
                 ? adf.mf.internal.amx.addCSSClassName
                 : adf.mf.internal.amx.removeCSSClassName;

    return func(domElement, className);
  };

  /**
   * Returns the index at which <code>className</code> appears within <code>currentClassName</code>
   * with either a space or the beginning or end of <code>currentClassName</code> on either side.
   * This function optimizes the runtime speed by not creating objects in most cases and assuming
   * 1) It is OK to only check for spaces as whitespace characters
   * 2) It is rare for the searched className to be a substring of another className, therefore
   *    if we get a hit on indexOf, we have almost certainly found our className
   * 3) It is even rarer for the searched className to be a substring of more than one className,
   *    therefore, repeating the search from the end of the string should almost always either return
   *    our className or the original search hit from indexOf
   * @param {String} currentClassName Space-separated class name string to search
   * @param {String} className String to search for within currentClassName
   * @return {Number} index of className in currentClassName, or -1 if it doesn't exist
   */
  adf.mf.internal.amx.getCSSClassNameIndex = function(currentClassName, className) // TODO move into some "domutils" class
  {
    // if no current class
    if (!currentClassName)
      return -1;
    else
    {
      // if the strings are equivalent, then the start index is the beginning of the string
      if (className === currentClassName)
        return 0;
      else
      {
        var classNameLength = className.length;
        var currentClassNameLength = currentClassName.length;

        // check if our substring exists in the string at all
        var nameIndex = currentClassName.indexOf(className);

        // if our substring exists then our class exists if either:
        // 1) It is at the beginning of the classNames String and has a following space
        // 2) It is at the end of the classNames String and has a leading space
        // 3) It has a space on either side
        if (nameIndex >= 0)
        {
          var hasStart = (nameIndex == 0) || (currentClassName.charAt(nameIndex - 1) == " ");
          var endIndex = nameIndex + classNameLength;
          var hasEnd = (endIndex == currentClassNameLength) || (currentClassName.charAt(endIndex) == " ");

          //one of the three condition above has been met so our string is in the parent string
          if (hasStart && hasEnd)
            return nameIndex;
          else
          {
            // our substring exists in the parent string but didn't meet the above conditions,  Were
            // going to be lazy and retest, searchig for our substring from the back of the classNames
            // string
            var lastNameIndex = currentClassName.lastIndexOf(className);

            // if we got the same index as the search from the beginning then we aren't in here
            if (lastNameIndex != nameIndex)
            {
              // recheck the three match cases
              hasStart = currentClassName.charAt(lastNameIndex - 1);
              endIndex = lastNameIndex + classNameLength;
              hasEnd =  (endIndex == currentClassNameLength) || (currentClassName.charAt(endIndex) == " ");

              if (hasStart && hasEnd)
                return lastNameIndex;
              else
              {
                // this should only happen if the searched for className is a substring of more
                // than one className in the classNames list, so it is OK for this to be slow.  We
                // also know at this point that we definitely didn't get a match at either the very
                // beginning or very end of the classNames string, so we can safely append spaces
                // at either end
                return currentClassName.indexOf(" " + className + " ");
              }
            }
          }
        }

        // no match
        return -1;
      }
    }
  };

  /**
   * Returns the element's right side in Window coordinates.
   * @param {HTMLElement} domElement the DOM Element to look at
   * @return {Number} the element's right side position in Window coordinates
   */
  adf.mf.internal.amx.getElementRight = function(domElement) // TODO move into some "agent" class
  {
    var documentElementOffsetWidth = document.documentElement.offsetWidth;
    var domElementOffsetWidth = domElement.offsetWidth;
    var domElementLeft = adf.mf.internal.amx.getElementLeft(domElement);
    var domElementRight = documentElementOffsetWidth - domElementLeft - domElementOffsetWidth;
    return domElementRight;
  };

  /**
   * Returns the element's left side in Window coordinates.
   * @param {HTMLElement} domElement the DOM Element to look at
   * @return {Number} the element's left side position in Window coordinates
   */
  adf.mf.internal.amx.getElementLeft = function(domElement) // TODO move into some "agent" class
  {
    if (navigator.userAgent.toLowerCase().indexOf("applewebkit") != -1)
      return adf.mf.internal.amx._webkitGetElementLeft(domElement);
    return adf.mf.internal.amx._baseGetElementLeft(domElement);
  };

  adf.mf.internal.amx._baseGetElementLeft = function(element) // TODO move into some "agent" class
  {
    // TODO AmxRcfAssert.assertDomNode(element);

    var bodyElement = element.ownerDocument.body;
    var currParent  = element.offsetParent;
    var currLeft    = element.offsetLeft;

    while (currParent)
    {
      element = currParent;
      currLeft += element.offsetLeft;

      if (element != bodyElement)
        currLeft -= element.scrollLeft;

      currParent = currParent.offsetParent;
    }

    return currLeft;
  };

  adf.mf.internal.amx._webkitGetElementLeft = function(element) // TODO move into some "agent" class
  {
    // TODO AmxRcfAssert.assertDomElement(element);

    // getBoundingClientRect was added in safari 4, webkit version 533
    // just look for the API versus the version
    if (!element.getBoundingClientRect)
      return this._baseGetElementLeft(element);

    var boundingRect = element.getBoundingClientRect();
    var elemLeft = boundingRect.left;
    var docElement = element.ownerDocument.documentElement;

    // adjust for the document scroll positions and window borders
    elemLeft -= (docElement.clientLeft - adf.mf.internal.amx.getBrowserViewportScrollLeft());
    return elemLeft;
  };

  /**
   * Returns the element's top side in Window coordinates.
   * @param {HTMLElement} domElement the DOM Element to look at
   * @return {Number} the element's top side position in Window coordinates
   */
  adf.mf.internal.amx.getElementTop = function(domElement) // TODO move into some "agent" class
  {
    if (navigator.userAgent.toLowerCase().indexOf("applewebkit") != -1)
      return adf.mf.internal.amx._webkitGetElementTop(domElement);
    return adf.mf.internal.amx._baseGetElementTop(domElement);
  };

  adf.mf.internal.amx._baseGetElementTop = function(element) // TODO move into some "agent" class
  {
    // TODO AmxRcfAssert.assertDomNode(element);

    var bodyElement = element.ownerDocument.body;
    var currParent  = element.offsetParent;
    var currTop     = element.offsetTop;

    //In safari/opera position absolute incorrectly account for body offsetTop
    if (adf.mf.internal.amx.getComputedStyle(element).position == "absolute")
    {
      currTop -= bodyElement.offsetTop;
    }

    while (currParent)
    {
      element = currParent;
      currTop += element.offsetTop;

      if (element != bodyElement)
        currTop -= element.scrollTop;

      currParent = currParent.offsetParent;
    }

    return currTop;
  };

  adf.mf.internal.amx._webkitGetElementTop = function(element) // TODO move into some "agent" class
  {
    // TODO AmxRcfAssert.assertDomElement(element);

    // getBoundingClientRect was added in safari 4, webkit version 533
    // just look for the API versus the version
    if (!element.getBoundingClientRect)
      return adf.mf.internal.amx._baseGetElementTop(element);

    var boundingRect = element.getBoundingClientRect();
    var elemTop = boundingRect.top;
    var docElement = element.ownerDocument.documentElement;

    // adjust for the document scroll positions and window borders
    elemTop -= (docElement.clientTop - adf.mf.internal.amx.getBrowserViewportScrollTop());
    return elemTop;
  };

  /**
   * @return {Number} returns the starting position on the canvas of the viewport
   */
  adf.mf.internal.amx.getBrowserViewportScrollLeft = function() // TODO move into some "agent" class
  {
    if (navigator.userAgent.toLowerCase().indexOf("applewebkit") != -1)
      return this._webkitGetBrowserViewportScrollLeft();
    return this._baseGetBrowserViewportScrollLeft();
  };

  adf.mf.internal.amx._baseGetBrowserViewportScrollLeft = function() // TODO move into some "agent" class
  {
    return document.documentElement.scrollLeft;
  };

  adf.mf.internal.amx._webkitGetBrowserViewportScrollLeft = function() // TODO move into some "agent" class
  {
    return document.body.scrollLeft;
  };

  /**
   * @return {Number} returns the top position on the canvas the viewport begins
   */
  adf.mf.internal.amx.getBrowserViewportScrollTop = function() // TODO use adf.mf.internal.amx.getBrowserViewportScrollTop
  {
    if (navigator.userAgent.toLowerCase().indexOf("applewebkit") != -1)
      return this._webkitGetBrowserViewportScrollTop();
    return this._baseGetBrowserViewportScrollTop();
  };

  adf.mf.internal.amx._baseGetBrowserViewportScrollTop = function() // TODO move into some "agent" class
  {
    return document.documentElement.scrollTop;
  };

  adf.mf.internal.amx._webkitGetBrowserViewportScrollTop = function() // TODO move into some "agent" class
  {
    return document.body.scrollTop;
  };

  /**
   * Tries to return the current style, taking into account the inline styles and style sheets.
   * @param {HTMLElement} element the element in question
   * @return {Object} the style computed style object
   */
  adf.mf.internal.amx.getComputedStyle = function(element) // TODO move into some "agent" class
  {
    return element.ownerDocument.defaultView.getComputedStyle(element, null);
  };

  /**
   * Checks to see if the "ancestorNode" is a ancestor of "node" or if they are the same.
   * Called from our test code
   * @export
   * @param {Node} ancestorNode the potential ancestor or possibly same node as the descendant
   * @param {Node} node the potential descendant or same node as the ancestor
   * @return whether the ancestorNode is an ancestor of the node or they are the same nodes
   */
  adf.mf.internal.amx.isAncestorOrSelf = function(ancestorNode, node)
  {
    return (node == ancestorNode) ? true : AmxRcfDomUtils.isAncestor(ancestorNode, node);
  };

  /**
   * Checks to see if the "ancestorNode" is a ancestor of "node".
   * @param {Node} ancestorNode the potential ancestor
   * @param {Node} node the potential descendant
   * @return whether the ancestorNode is an ancestor of the node
   */
  adf.mf.internal.amx.isAncestor = function(ancestorNode, node)
  {
    if (node == null)
      return false;
    var parentNode = node.parentNode;
    while (parentNode)
    {
      if (parentNode == ancestorNode)
        return true;
      parentNode = parentNode.parentNode;
    }
    return false;
  };

  /**
   * Temporary solution for getting non-primitive element data.
   * @param {HTMLElement} domElement the DOM element the data is associated with
   * @param {String} key the data key
   * @return {Object} the non-primitive data
   */
  adf.mf.internal.amx._getNonPrimitiveElementData = function(domElement, key)
  {
    return $(domElement).data(key);
  };

  /**
   * Temporary solution for setting non-primitive element data.
   * @param {HTMLElement} domElement the DOM element the data is associated with
   * @param {String} key the data key
   * @param {Object} nonPrimitiveData the non-primitive data
   */
  adf.mf.internal.amx._setNonPrimitiveElementData = function(domElement, key, nonPrimitiveData)
  {
    $(domElement).data(key, nonPrimitiveData);
  };

  /**
   * Adds padding to a number string.  Does nothing if number is longer than paddingLength.
   * @param {number} number to be padded
   * @param {number} paddingLength specifies length to which to pad
   * @return {String} padded number at least paddingLength long
   */
  adf.mf.internal.amx.addPadding = function(number, paddingLength)
  {
    var padded = "" + number;
    for (var i = padded.length; i < paddingLength; ++i)
    {
      padded = "0" + padded;
    }
    return padded;
  }

  /**
   * Extracts time portion from date object and returns it as "HH:mm:ss"
   * @param {Date} dateObject
   * @return {String} returns time as "HH:mm:ss"
   */
  adf.mf.internal.amx.extractTimeFromDateObject = function(dateObject)
  {
    var time = adf.mf.internal.amx.addPadding(dateObject.getHours(), 2) + ":" +
      adf.mf.internal.amx.addPadding(dateObject.getMinutes(), 2) + ":" +
      adf.mf.internal.amx.addPadding(dateObject.getSeconds(), 2) + "." +
      adf.mf.internal.amx.addPadding(dateObject.getMilliseconds(), 3);
    return time;
  }

  /**
   * Extracts date portion from date object and returns it as "yyyy-MM-dd"
   * @param {Date} dateObject
   * @return {String} returns date as "yyyy-MM-dd"
   */
  adf.mf.internal.amx.extractDateFromDateObject = function(dateObject)
  {
    var time = adf.mf.internal.amx.addPadding(dateObject.getFullYear(), 4) + "-" +
      adf.mf.internal.amx.addPadding(dateObject.getMonth() + 1, 2) + "-" +
      adf.mf.internal.amx.addPadding(dateObject.getDate(), 2);
    return time;
  }

  /**
   * Updates time portion of date object with given time.
   * @param {Date} dateObject is the Date to be updated
   * @param {String} time is a string with this format: "hh:mm"
   */
  adf.mf.internal.amx.updateTime = function(dateObject, time)
  {
    if (time != null && typeof time !== "undefined" && time.length > 4)
    {
      var h = time.substring(0,2);
      var m = time.substring(3,5);
      dateObject.setHours(h);
      dateObject.setMinutes(m);
    }
  }

  /**
   * Updates date portion of date object with given date.
   * @param {Date} dateObject is the Date to be updated
   * @param {String} date is a string with this format: "yyyy-MM-dd".  The year must be at least 4 characters but can be longer
   */
  adf.mf.internal.amx.updateDate = function(dateObject, date)
  {
    if (date != null && typeof date !== "undefined" && date.length > 9)
    {
      var i = date.indexOf("-");
      if (i > 3)
      {
        var year = date.substring(0, i);
        var j = date.indexOf("-", i+1);
        if (j > -1)
        {
          var month = date.substring(i+1, j) - 1;
          var day = date.substring(j+1, date.length);
          dateObject.setYear(year);
          dateObject.setMonth(month);
          dateObject.setDate(day);
        }
      }
    }
  }

  adf.mf.internal.NONBLOCKING_CALL_COUNTER = 0;
  adf.mf.internal.pushNonBlockingCall = function()
  {
    ++adf.mf.internal.NONBLOCKING_CALL_COUNTER;
  };

  adf.mf.internal.popNonBlockingCall = function()
  {
    --adf.mf.internal.NONBLOCKING_CALL_COUNTER;
  };

  adf.mf.internal.getUnresolvedCallDepth = function()
  {
    return adf.mf.internal.NONBLOCKING_CALL_COUNTER;
  };
}) ();
/* Copyright (c) 2011, 2013, Oracle and/or its affiliates. All rights reserved. */
/* ------------------------------------------------------ */
/* --------------------- amx-event.js ------------------- */
/* ------------------------------------------------------ */

(function()
{
  var _currentFocusDomNode = null;

  /**
   * Internal method to bind to the focus method and be notified when another control gains focus
   */
  adf.mf.internal.amx.registerFocus = function($nodeOrDomNode, callback)
  {
    // Temporary shim until jQuery is completely removed:
    var domNode;
    if ($nodeOrDomNode.jquery)
    {
      domNode = $nodeOrDomNode.get(0);
    }
    else
    {
      domNode = $nodeOrDomNode;
    }

    $(domNode).bind(
      "focus",
      function(event)
      {
        // register this node in order to receive events when another control is tapped
        _currentFocusDomNode = domNode;
        if (callback)
        {
          callback(event);
        }
      });
  };

  /**
   * Internal method to bind to the blur method and be notified when another control gains focus
   */
  adf.mf.internal.amx.registerBlur = function($nodeOrDomNode, callback)
  {
    // Temporary shim until jQuery is completely removed:
    var domNode;
    if ($nodeOrDomNode.jquery)
    {
      domNode = $nodeOrDomNode.get(0);
    }
    else
    {
      domNode = $nodeOrDomNode;
    }

    $(domNode).blur(
      function(event)
      {
        // unregister this node - no more need to receive events when another control is tapped
        if (_currentFocusDomNode == domNode)
        {
          _currentFocusDomNode = null;
        }
        if (callback)
        {
          callback(event);
        }
      });
  };

  // this method calls blur on the currentFocus node
  // in order to give it a chance to saved its internal changes
  function blurCurrentNode()
  {
    if (_currentFocusDomNode != null)
    {
      $(_currentFocusDomNode).blur();
    }
  }

  var tapPendingIds = {};

  function cancelPendingTap()
  {
    tapPendingIds = {};
  }

  // --------- Tap Event --------- //
  var mouseTapEvents =
  {
    start: "mousedown",
    end: "mouseup"
  };

  var touchTapEvents =
  {
    start: "touchstart",
    end: "touchend"
  };

  $.fn.tap = function(arg0, arg1)
  {
    var tapEvents = (amx.hasTouch()) ? touchTapEvents : mouseTapEvents;

    var callback = arg1 || arg0;
    var delegate = (arg1) ? arg0 : null;

    return this.each(function()
    {
      var $this = $(this);

      var tapId = null;

      // tap start
      $this.on(tapEvents.start,delegate,function(event)
      {
        // if there is a node that registered its focus, then
        // the first thing to do is blur that focus here
        blurCurrentNode();
        tapId = amx.uuid();
        tapPendingIds[tapId] = true;
      });

      // tap end
      $this.on(tapEvents.end,delegate,function(event)
      {
        if (tapPendingIds[tapId])
        {
          adf.mf.api.amx.showLoadingIndicator();
          callback.call(this,event);
          adf.mf.api.amx.hideLoadingIndicator();
          delete tapPendingIds[tapId];
        }
      });
    });
  };
  // --------- /Tap Event --------- //

  // --------- Tap Hold --------- //
  var tapHoldPendingIds = {};

  function cancelPendingTapHold()
  {
    tapHoldPendingIds = {};
  }

  var holdThreshold = 800;
  $.fn.tapHold = function(arg0, arg1)
  {
    var tapEvents = (amx.hasTouch()) ? touchTapEvents : mouseTapEvents;

    var callback = arg1 || arg0;
    var delegate = (arg1) ? arg0 : null;

    return this.each(function()
    {
      var $this = $(this);

      var tapId = null;

      // tap start
      $this.on(tapEvents.start,delegate,function(event)
      {
        var tapped = this;
        var $tapped = $(this);
        tapId = amx.uuid();
        tapHoldPendingIds[tapId] = new Date().getTime();

        setTimeout(function()
        {
          // Note: here we double check if the time is greater than the threshold. This is useful since sometime timeout
          //       is not really reliable.
          if (tapHoldPendingIds[tapId] > 0)
          {
            var timeOffset = new Date().getTime() - tapHoldPendingIds[tapId];
            if (timeOffset >= holdThreshold)
            {
              var result = callback.call(tapped,event);

              // if the handler consume the tapHold, remove it from the tapPendingIds so that it does not count like a tap
              if (result === "consumeTapHold")
              {
                // Android requires that we preventDefault, otherwise native select/edit text mode can be triggered
                // This code does also fixes softKeyboard show/hide bug and let's user select/edit text for inputText component
                var agent = adf.mf.internal.amx.agent;
                if (agent["type"] == "Android")
                {
                  event.preventDefault();
                }
                cancelPendingTap();
                cancelPendingTapHold();
                cancelPendingDrag();
              }
            }
            delete tapHoldPendingIds[tapId];
          }

        },holdThreshold);
      });

      // tapHold end (remove the tapPendingIs)
      $this.on(tapEvents.end,delegate,function(event)
      {
        if (tapHoldPendingIds[tapId])
        {
          delete tapHoldPendingIds[tapId];
        }
      });
    });
  };
  // --------- /Tap Hold --------- //

  // --------- Drag Event --------- //
  var dragPendingIds = {};

  function cancelPendingDrag()
  {
    dragPendingIds = {};
  }

  var DRAGSTART="dragstart",DRAGDRAG="drag",DRAGEND="dragend";

  var defaultOptions =
  {
    threshold: 5
  };

  /**
   * Options optional method implementation:
   */
  var mouseDragEvents =
  {
    start: "mousedown",
    drag: "mousemove",
    end: "mouseup"
  };

  var touchDragEvents =
  {
    start: "touchstart",
    drag: "touchmove",
    end: "touchend"
  };

  $.fn.drag = function(delegate, opts)
  {
    var hasTouch = amx.hasTouch();
    var options = opts || delegate;
    var delegate = (opts) ? delegate : null;

    options = $.extend({}, defaultOptions, options);

    var dragEvents = (hasTouch) ? touchDragEvents : mouseDragEvents;

    return this.each(
      function()
      {
        var $this = $(this);
        if (delegate == null)
        {
          (options.start) ? $this.bind(DRAGSTART,options.start) : null;
          (options.drag) ? $this.bind(DRAGDRAG,options.drag) : null;
          (options.end) ? $this.bind(DRAGEND,options.end) : null;

          $this.bind(dragEvents.start,
            function(e)
            {
              handleDragEvent.call(this,e,options);
            });
        }
        else
        {
          (options.start) ? $this.delegate(delegate,DRAGSTART,options.start) : null;
          (options.drag) ? $this.delegate(delegate,DRAGDRAG,options.drag) : null;
          (options.end) ? $this.delegate(delegate,DRAGEND,options.end) : null;

          $this.delegate(delegate, dragEvents.start,
            function(e)
            {
              handleDragEvent.call(this, e, options);
            });
        }
      });

    // Handler the event
    // "this" of this function will be the element
    function handleDragEvent(e, options)
    {
      var $elem = $(this);

      var $document = $(document);
      var id = "_" + amx.uuid();

      dragPendingIds[id] = true;

      var dragStarted = false;
      var startEvent = e;
      var startPagePos = eventPagePosition(startEvent);

      // create the $helper if it is a draggable event.
      var $helper;

      // so far, we prevent the default, otherwise, we see some text select which can be of a distracting
      // since we create "meta events" we consume this one
      // e.preventDefault();
      // e.stopPropagation();

      // drag
      $document.bind(dragEvents.drag + "." + id,
        function(e)
        {
          // Android 4.0 (ONLY!) requires that we preventDefault whereas on 2.3 and 4.1 we use native:
          var agent = adf.mf.internal.amx.agent;
          var userAgent = (""+navigator.userAgent).toLowerCase();
          if (agent["type"] == "Android" &&
              agent["subtype"] == "Generic" &&
              userAgent.indexOf("android 4.0") != -1)
          {
            // Do not use this for any release other than 4.0 (not 2.3 nor 4.1):
            e.originalEvent.preventDefault();
          }

          // if the drag has not started, check if we need to start it
          if (!dragStarted && dragPendingIds[id])
          {
            var currentPagePos = eventPagePosition(e);
            var offsetX = (startPagePos.pageX - currentPagePos.pageX);
            var offsetY = (startPagePos.pageY - currentPagePos.pageY);

            // if the diff > threshold, then, we start the drag
            if (Math.abs(offsetX) > options.threshold || Math.abs(offsetY) > options.threshold)
            {
              dragStarted = true;

              // we cancel any pending tap event
              cancelPendingTap();
              cancelPendingTapHold();

              //create the bDragCtx
              $elem.data("dragCtx",{});

              var dragStartExtra = buildDragExtra(startEvent, $elem, DRAGSTART, startPagePos, currentPagePos);
              $elem.trigger(DRAGSTART,[dragStartExtra]);
            }
          }

          if (dragStarted && dragPendingIds[id])
          {
            // making sure they they are canceled
            cancelPendingTap();
            cancelPendingTapHold();

            var dragExtra = buildDragExtra(e, $elem, DRAGDRAG);

            var overElem;
            if (options.draggable === true)
            {
              overElem = findOverElement($helper, dragExtra);
              dragExtra.overElement = overElem;
            }

            $elem.trigger(DRAGDRAG,[dragExtra]);

            // since we create "meta events" we consume this event if the meta event was consumed
            if (dragExtra.preventDefault)
              e.preventDefault();
            if (dragExtra.stopPropagation)
              e.stopPropagation();
          }
        });

      // drag end
      $document.bind(dragEvents.end + "." + id,
        function(e)
        {
          if (dragStarted && dragPendingIds[id])
          {
            var extra = buildDragExtra(e, $elem, DRAGEND);
            $elem.trigger(DRAGEND,[extra]);

            // delete the dragContext
            $elem.data("dragCtx",null);

            // since we create "meta events" we consume this event if the meta event was consumed
            if (extra.preventDefault)
              e.preventDefault();
            if (extra.stopPropagation)
            e.stopPropagation();
          }

          // unbind the document event
          $(document).unbind(dragEvents.drag + "." + id);
          $(document).unbind(dragEvents.end + "." + id);
          delete dragPendingIds[id];
        });
    } // /function handleDragEvent(..)
  }; // /$.fn.drag(..)

  /**
   * Build the extra event info for the drag event.
   * @param {Object} startPagePos optional argument with pageX and pageY properties
   * @param {Object} currentPagePos optional argument with pageX and pageY properties
   */
  function buildDragExtra(event, $elem, dragType, startPagePos, currentPagePos)
  {
    fixTouchEvent(event);
    var hasTouch = amx.hasTouch();
    var extra = {
      "eventSource": event,
      "pageX": event.pageX,
      "pageY": event.pageY,
      "preventDefault" : false,
      "stopPropagation" : false
    };

    var oe = event.originalEvent;
    if (hasTouch)
    {
      extra.touches = oe.touches;
    }

    var dragCtx = $elem.data("dragCtx");
    if (dragCtx)
    {
      if (dragType === DRAGSTART)
      {
        dragCtx.startPageX = extra.startPageX = extra.pageX;
        dragCtx.startPageY = extra.startPageY = extra.pageY;

        dragCtx.lastPageX = dragCtx.startPageX = extra.startPageX;
        dragCtx.lastPageY = dragCtx.startPageY = extra.startPageY;
      }
      else if (dragType === DRAGEND)
      {
        // because, on iOS, the touchEnd event does not have the .touches[0].pageX
        extra.pageX = dragCtx.lastPageX;
        extra.pageY = dragCtx.lastPageY;
      }

      if (startPagePos != null && dragCtx.originalAngle == null)
      {
        // Calculate, using the start page event location, the angle that the user moved their
        // finger. Allows callers to determine the directionality that the user intends to scroll.
        diffX = currentPagePos.pageX - startPagePos.pageX;
        diffY = startPagePos.pageY - currentPagePos.pageY; // Y direction is reversed;

        // Determine the angle
        // angle = arctan(opposite/adjacent) (converted from radians to degrees)
        // Note that this computation uses 0 degrees as east, 90 is north.
        // Angles to the south and west are negative (-90 is south)
        dragCtx.originalAngle = Math.round(Math.atan2(diffY, diffX) * 180 / Math.PI);
      }

      extra.originalAngle = dragCtx.originalAngle;
      extra.startPageX = dragCtx.startPageX;
      extra.startPageY = dragCtx.startPageY;
      extra.deltaPageX = extra.pageX - dragCtx.lastPageX;
      extra.deltaPageY = extra.pageY - dragCtx.lastPageY;

      dragCtx.lastPageX = extra.pageX;
      dragCtx.lastPageY = extra.pageY;
    }
    else
    {
      adf.mf.log.logInfoResource("AMXInfoBundle", adf.mf.log.level.WARNING, "buildDragExtra", "MSG_DRAG_CTX_NULL");
    }

    return extra;
  }

  function eventPagePosition(e)
  {
    var pageX, pageY;
    if (e.originalEvent && e.originalEvent.touches)
    {
      pageX = e.originalEvent.touches[0].pageX;
      pageY = e.originalEvent.touches[0].pageY;
    }
    else
    {
      pageX = e.pageX;
      pageY = e.pageY;
    }

    return {
      "pageX": pageX,
      "pageY": pageY
    };
  }

  function fixTouchEvent(e)
  {
    if (amx.hasTouch())
    {
      var oe = e.originalEvent;

      if (oe.touches.length > 0)
      {
        e.pageX = oe.touches[0].pageX;
        e.pageY = oe.touches[0].pageY;
      }
    }
    return e;
  }
  // --------- /Drag Event --------- //

  // -------- Swipe Event --------- //

  var swipeThreshold = 5;
  /**
   * jQuery extension for swipe gesture.
   * Can be call with (delegate,handler) or (handler)
   *
   * @param delegate {string} a jQuery delegate/selector string
   * @param handler {function} will be call with (event,swipeExtra).
   *
   * swipeExtra has the following properties:
   *     swipeExtra.swipeType {string}: swipeLeft, swipeRight, swipeUp, swipeDown
   *
   * if the Handler return "false" it means it has consumed the event and it should not be bubbling (should prevent drag or such)
   */
  $.fn.swipe = function(arg0, arg1)
  {
    var tapEvents = (amx.hasTouch()) ? touchTapEvents : mouseTapEvents;

    var handler = arg1 || arg0;
    var delegate = (arg1) ? arg0 : null;

    return this.each(function()
    {
      var $this = $(this);

      $this.drag(delegate,
      {
        start: function(event,dragExtra)
        {
        },

        drag: function(event,dragExtra)
        {
          var $node = $(this);

          var swipeExtra = buildSwipeExtra($node,event,dragExtra);
          if (swipeExtra)
          {
            var result = handler.call(this,event,swipeExtra);
            if (result === "consumeSwipe")
            {
              cancelPendingDrag();
              $node.data("swipeDone",null);
            }
          }
        },

        end: function(event,dragExtra)
        {
          var $node = $(this);
          $node.data("swipeDone",null);
        },

        threshold: 5
      });
    });
  };

  /**
   * Determine if it is a swipe event, and if yes, build the swipeExtra
   */
  function buildSwipeExtra($node,event,dragExtra)
  {
    var swipeExtra = null;

    var swipeDone = $node.data("swipeDone");

    if (swipeDone !== true && dragExtra)
    {
      var offsetX = (dragExtra.pageX - dragExtra.startPageX);
      var offsetY = (dragExtra.pageY - dragExtra.startPageY);
      var absOffsetX = Math.abs(offsetX);
      var absOffsetY = Math.abs(offsetY);
      if (absOffsetX >= absOffsetY && absOffsetX > swipeThreshold)
      {
        // Only consider it a drag if the angle of the drag is within 30 degrees of due horizontal
        var angle = Math.abs(dragExtra.originalAngle);
        if (angle <= 30 || angle >= 150)
        {
          swipeExtra = {};
          swipeExtra.swipeType = (offsetX > -1)?"swipeRight":"swipeLeft";
          $node.data("swipeDone",true);
        }
      }
      else if (absOffsetY >= absOffsetX && absOffsetY > swipeThreshold)
      {
        // Only consider it a drag if the angle of the drag is within 30 degrees of due vertical
        var angle = Math.abs(dragExtra.originalAngle);
        if (angle >= 60 && angle <= 120)
        {
          swipeExtra = {};
          swipeExtra.swipeType = (offsetY > -1)?"swipeDown":"swipeUp";
          $node.data("swipeDone",true);
        }
      }
    }

    return swipeExtra;
  }
  // -------- /Swipe Event --------- //

})();

// --------- /events --------- //

// --------- Event Enabler --------- //
(function()
{
  /**
   * Enable the swipe event and wire the listeners for a given $node or the item delegate of this $node.
   * Note: delegate is optional, if not defined, $node will be directly bound.
   */
  amx.enableSwipe = function($node, delegate)
  {
    // handle the swipe
    $node.swipe(delegate, function(event, swipeExtra)
    {
      var $item = $(this);
      var amxNode = $item.data("amxNode");
      var tag = amxNode.getTag();
      var swipeType = swipeExtra.swipeType;

      // check that we have at least one action with this type
      var childrenTags = tag.getChildren();
      for (var i=0, size=childrenTags.length; i<size; ++i)
      {
        var childTag = childrenTags[i];
        var childType = childTag.getAttribute("type");

        // The event processing doesn't know about start/end so use left/right if applicable:
        if (childType == "swipeStart")
        {
          if (document.documentElement.dir == "rtl")
            childType = "swipeRight";
          else
            childType = "swipeLeft";
        }
        else if (childType == "swipeEnd")
        {
          if (document.documentElement.dir == "rtl")
            childType = "swipeLeft";
          else
            childType = "swipeRight";
        }

        if (childType == swipeType)
        {
          var event = new amx.ActionEvent();
          adf.mf.api.amx.processAmxEvent(amxNode, swipeType, undefined, undefined, event);
          return "consumeSwipe";
        }
      }
    });
  };

  amx.enableTapHold = function($node, delegate)
  {
    $node.tapHold(delegate, function(event)
    {
      var $item = $(this);
      var amxNode = $item.data("amxNode");
      var tag = amxNode.getTag();

      // check that we have at least one action with this type
      var childrenTags = tag.getChildren();
      for (var i=0, size=childrenTags.length; i<size; ++i)
      {
        var childTag = childrenTags[i];
        if (childTag.getAttribute("type") == "tapHold")
        {
          var event = new amx.ActionEvent();
          adf.mf.api.amx.processAmxEvent(amxNode, "tapHold", undefined, undefined, event);
          return "consumeTapHold";
        }
      }
    });
  };

})();
/* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. */
/* ------------------------------------------------------ */
/* ------------------- amx-validation.js ---------------------- */
/* ------------------------------------------------------ */

// ------ amx validations ------ //
(function()
{
  var ERROR_UPPER_STR = "ERROR";
  var WARNING_UPPER_STR = "WARNING";

  var INFO_STR = "info";
  var CONFIRMATION_STR = "confirmation";
  var WARNING_STR = "warning";
  var ERROR_STR = "error";
  var FATAL_STR = "fatal";

  // initialize display strings with fallback values - too early to load from resource bundle
  var INFO_DISPLAY_STR = "Info";
  var CONFIRMATION_DISPLAY_STR = "Confirmation";
  var WARNING_DISPLAY_STR = "Warning";
  var ERROR_DISPLAY_STR = "Error";
  var FATAL_DISPLAY_STR = "Fatal";

  var INFO_VAL = 4;
  var CONFIRMATION_VAL = 3;
  var WARNING_VAL = 2;
  var ERROR_VAL = 1;
  var FATAL_VAL = 0;

  // these maps are used to convert to and from severity string/int values
  var __severityStringToInt = {};
  __severityStringToInt[INFO_STR] = INFO_VAL;
  __severityStringToInt[CONFIRMATION_STR] = CONFIRMATION_VAL;
  __severityStringToInt[WARNING_STR] = WARNING_VAL;
  __severityStringToInt[ERROR_STR] = ERROR_VAL;
  __severityStringToInt[FATAL_STR] = FATAL_VAL;

  var __severityIntToDisplayString = {};
  __severityIntToDisplayString[INFO_VAL] = INFO_DISPLAY_STR;
  __severityIntToDisplayString[CONFIRMATION_VAL] = CONFIRMATION_DISPLAY_STR;
  __severityIntToDisplayString[WARNING_VAL] = WARNING_DISPLAY_STR;
  __severityIntToDisplayString[ERROR_VAL] = ERROR_DISPLAY_STR;
  __severityIntToDisplayString[FATAL_VAL] = FATAL_DISPLAY_STR;
  
  // This map is used to provide the associated resource bundle key. These ADFInfoBundle keys
  // are special cased in getResourceStringImpl(), and will always return a displayable value.
  var __severityDisplayStringBundleKey = {};
  __severityDisplayStringBundleKey[INFO_DISPLAY_STR] = "LBL_INFO_DISPLAY_STR";
  __severityDisplayStringBundleKey[CONFIRMATION_DISPLAY_STR] = "LBL_CONFIRMATION_DISPLAY_STR";
  __severityDisplayStringBundleKey[WARNING_DISPLAY_STR] = "LBL_WARNING_DISPLAY_STR";
  __severityDisplayStringBundleKey[ERROR_DISPLAY_STR] = "LBL_ERROR_DISPLAY_STR";
  __severityDisplayStringBundleKey[FATAL_DISPLAY_STR] = "LBL_FATAL_DISPLAY_STR";

  amx.validationsUnsetListEl = "#{validationScope.unsetList}";
  amx.validationsInvalidListExpr = "validationScope.invalidList";
  amx.validationsInvalidListEl = "#{" + amx.validationsInvalidListExpr + "}";
  amx.validationsValidListEl = "#{validationScope.validList}";

  // this keeps track of the groups that have been validated
  // so that we know if we should be showing the required failures
  // or not
  var __validatedGroups = {};

  // this keeps track of whether or not we are currently validating group[s]
  var __isValidating = false;

  var validationExName = "oracle.adfmf.framework.exception.ValidationException";
  var batchValidationExName = "oracle.adfmf.framework.exception.BatchValidationException";

  // TODO finish the migration from "amx.*" to "adf.mf.api.amx.*" and "adf.mf.internal.amx.*"
  var amxRenderers =
  {

    validationGroup : function(amxNode)
    {
      var rootElement = document.createElement("div");
      $(rootElement).append(amxNode.renderSubNodes()); // TODO make non-jq
      return rootElement;
    }
  }; // /var amxRenderers

  // data change handler for when the validationList changes
  function validationsDataChangeHandler(el)
  {
    updateValidationMessages();
  }

  /**
   * This method will go through all of the items in validationData and extract
   * the current validation exceptions for the group id and add them to the
   * error message box.
   * @param validationData the data that contains all of the validation info
   * @param groupId the current group id
  */
  function updateValidationMessagesByGroupId(validationData, groupId)
  {
      var groupValidationData = validationData[groupId];
      if (groupValidationData === undefined)
      {
        return;
      }

      var groupInvalid = groupValidationData.invalid;
      for (item in groupInvalid)
      {
        var nvp = groupInvalid[item];

        var arrayList = groupInvalid[item];
        for(var index in arrayList)
        {
          var nvp = arrayList[index];
        // textNode = this.addText(groupValidationData, textNode, nvp.name, nvp.value);
          adf.mf.api.amx.addMessage(nvp.name.toLowerCase(), nvp.value, null, null);
        }
      }

      // check for required failures
      var groupRequired = groupValidationData.required;
      for (item in groupRequired)
      {
        var text = groupRequired[item];
      // textNode = this.addText(groupValidationData, textNode, ERROR_STR, text);
        adf.mf.api.amx.addMessage(ERROR_STR, text, null, null);
      }
  }

  /**
   * This method builds up the validation data given an array
   * of group ids to check. If any validation errors are present,
   * then they will be added to the error message box
   * @param groupsToCheck  the array of groups to check for validation errors
  */
  function updateValidationMessages(groupsToCheck)
  {
    if (amx.isValidating())
    {
      return;
    }

    // get all of the groups and all of the messages
    var validationGroupElements = document.getElementsByClassName("amx-validationGroup");

    if (validationGroupElements.length == 0)
    {
      // do nothing
      return;
    }

    amx.buildValidationData(validationGroupElements).always(function(validationData)
    {
      // now show the message box
      if (groupsToCheck !== undefined && groupsToCheck != null && groupsToCheck.length > 0)
      {
        for (var i = 0; i < groupsToCheck.length; ++i)
        {
          var groupId = groupsToCheck[i];

          var groupValidationData = validationData[groupId];
          if (groupValidationData === undefined)
          {
            // no validation data present
            continue;
          }

          updateValidationMessagesByGroupId(validationData, groupId);
        }
      }
    });
  }

  function getCurrentPageGroup(id)
  {
    var thisPage = adf.mf.internal.controller.ViewHistory.peek().viewId;
    if (__validatedGroups[thisPage] === undefined)
    {
      __validatedGroups[thisPage] = {};
    }

    return __validatedGroups[thisPage];
  }

  function setGroupValidated(id)
  {
    var pageGroups = getCurrentPageGroup(id);
    pageGroups[id] = true;
  }

  function isGroupValidated(id)
  {
    var pageGroups = getCurrentPageGroup(id);
    return pageGroups[id] === true;
  }


  // detect if the xmlNode is rendered, visible, and shown on the screen
  amx.isNodeRendered = function(amxNode)
  {
    if (!amxNode.isRendered())
    {
      return false;
    }

    // TODO: this has no place in a global function:
    if (amxNode.getTag().getPrefixedName() == "amx:popup")
    {
      if (amxNode.getAttribute("_renderPopup"))
      {
        return true;
      }

        return false;
      }

    var attr = amxNode.getAttribute("visible");
    if(typeof attr !== "undefined")
    {
      if(amx.isValueFalse(attr))
      {
        return false;
      }
    }

    return true;
  };

  function setValidationWatchData(groupId, amxNode, watchData, addRequired)
  {
    var attributeValue = amxNode.getAttribute("__attrToValidate");
    if (attributeValue === undefined)
    {
      return;
    }

    var tag = amxNode.getTag();
    var attributeValueEl = tag.getAttribute(attributeValue);

    var els = amx.getElsFromString(attributeValueEl);
    if (els.length > 0)
    {
      if (watchData.el[attributeValueEl] === undefined)
      {
        watchData.el[attributeValueEl] = [];
      }

      if(watchData.el[attributeValueEl].indexOf(groupId) < 0)
      {
        watchData.el[attributeValueEl].push(groupId);
      }
    }

    // now check to see if this is required
    if (amx.isValueTrue(amxNode.getAttribute("required")) == false)
    {
      return;
    }

    var nodeValue = amxNode.getAttribute(attributeValue);
    // if the returned value is an array, then we will validate the length
    if (nodeValue instanceof Array)
    {
      if (nodeValue.length > 0)
      {
        return;
      }
    }
    else if (amx.getTextValue(nodeValue) !== "")
    {
      return;
    }

    if (addRequired == false)
    {
      // this group has not been validated yet, so disregard
      return;
    }

    var key;
    var prefixedName = tag.getPrefixedName();
    if (prefixedName == "amx:selectOneChoice" || prefixedName == "amx:selectManyChoice")
    {
      key = "MSG_MAKE_A_SELECTION";
    }
    else
    {
      key = "MSG_ENTER_A_VALUE";
    }

    var msg = adf.mf.resource.getInfoString("AMXInfoBundle", key);
    var label = amxNode.getAttribute("label");
    if (label == null)
    {
      label = "";
    }
    var text = label + ": " + msg;

    if (watchData.required[groupId] === undefined)
    {
      watchData.required[groupId] = [];
    }

    watchData.required[groupId].push(text);
  }

  // add to the passed in list an el expressions that this node
  // and this node's descendants are watching
  function buildValidationWatchData(groupId, domElement, watchData, addRequired)
  {
    var watchArrayDfd = $.Deferred();

    var childNodes = domElement.childNodes;

    if (childNodes && childNodes.length > 0)
    {
      var childDfdArray = [];
      // for each node
      for (var i = 0; i < childNodes.length; ++i)
      {
        var childNode = childNodes[i];

        // only check for node info if this is an amx-node
        // if not, just assume this is a container for actual amx-nodes
        if (adf.mf.internal.amx.getCSSClassNameIndex(childNode.className, "amx-node") != -1)
        {
          var amxNode = adf.mf.internal.amx._getNonPrimitiveElementData(childNode, "amxNode");
          if (amxNode === undefined)
          {
            continue;
          }

          if(amx.isNodeRendered(amxNode) == false)
          {
            continue;
          }

          setValidationWatchData(groupId, amxNode, watchData, addRequired)
        }

        var childDfd = buildValidationWatchData(groupId, childNode, watchData, addRequired);
        childDfdArray.push(childDfd);
      }
      $.when.apply($, childDfdArray)
        .done(function()
        {
           watchArrayDfd.resolve();
        });
    }
    else
    {
      watchArrayDfd.resolve();
    }

    return watchArrayDfd.promise();
  }

  // build a list of all the el expressions that this group/array of groups are watching
  function buildValidationGroupWatchData(groupElements, isValidating)
  {
    var groupWatchArrayDfd = $.Deferred();
    var dfd = [];
    var watchData = {
      el: {},
      required: {}
    };

    for (var i = 0; i < groupElements.length; ++i)
    {
      var groupElement = groupElements[i];
      if (groupElement.length != null)
      {
        groupElement = groupElement[0];
      }
      var addRequired;
      var id = adf.mf.internal.amx._getNonPrimitiveElementData(groupElement, "amxNode").getId();
      if (isValidating == true)
      {
        // add this to the list so that buildElWatchArray will return any required
        // failures for this group
        setGroupValidated(id);
        addRequired = true;
      }
      else
      {
        addRequired = isGroupValidated(id);
      }

      dfd.push(buildValidationWatchData(id, groupElement, watchData, addRequired));
    }

    $.when(dfd).done(function()
    {
      groupWatchArrayDfd.resolve(watchData);
    });
    return groupWatchArrayDfd.promise();
  }

  function getValidationDataForGroup(validationData, groupId, watchData)
  {
    if(validationData[groupId] === undefined)
    {
      validationData[groupId] = {
        invalid: [],
        required: []
      };
    }

    return validationData[groupId];
  }

  function buildValidationDataInternal(groupElements, isValidating, validationWatchData)
  {
    var groupDfd = $.Deferred();
    if (groupElements.length == 0)
    {
      // nothing to do here, so just resolve it
      groupDfd.resolve();
      return groupDfd.promise();
    }
    amx.getElValue(amx.validationsInvalidListEl).done(function(request, response)
    {
      var invalidList = response[0].value;
      var elWatchDfd = $.Deferred();
      if(validationWatchData == null)
      {
        buildValidationGroupWatchData(groupElements, isValidating).always(function(watchData)
        {
          validationWatchData = watchData;
          elWatchDfd.resolve();
        });
      }
      else
      {
        elWatchDfd.resolve();
      }

      elWatchDfd.always(function()
      {
        var hasError = false;
        var hasWarning = false;
        var validationData = {};

        for(var item in validationWatchData.required)
        {
          if(validationWatchData.required.hasOwnProperty(item))
          {
            hasError = true;

            var groupValidationData = getValidationDataForGroup(validationData, item, validationWatchData);
            // add all of these to the required list
            groupValidationData.required = validationWatchData.required[item];
          }
        }

        // iterate through the invalid el expressions and determine if
        // the expression is in the list of el expressions that are
        // defined in descendants of the validationGroup tag
        for(var item in invalidList)
        {
          if(invalidList.hasOwnProperty(item))
          {
            var elInfo = validationWatchData.el[item];
            if(elInfo === undefined)
            {
              // not in the list
              continue;
            }

            var arrayList = invalidList[item];
            if (hasError == false)
            {
              for(var index in arrayList)
              {
                var nvp = arrayList[index];
                if (nvp.name == ERROR_UPPER_STR)
                {
                  hasError = true;
                  break;
                }

                if (nvp.name == WARNING_UPPER_STR)
                {
                  hasWarning = true;
                }
              }
            }

            for (var group in elInfo)
            {
              var groupId = elInfo[group];
              var groupValidationData = getValidationDataForGroup(validationData, groupId, validationWatchData);
              groupValidationData.invalid.push(arrayList);
            }
          }
        }

        if (hasError)
        {
          // let the caller know that navigation should fail
          groupDfd.reject(validationData);
          return;
        }

        // succeeded, but with possible warnings, so send in the data array
        groupDfd.resolve(validationData);
      });
    }).fail(function(request, response)
    {
      // failed to retrieve the invalid list - allow navigation to proceed
      groupDfd.resolve();
    });

    return groupDfd.promise();
  }

  amx.buildValidationData = function(elementArray)
  {
    return buildValidationDataInternal(elementArray, false, null);
  };

  function getGroupsById(domElement)
  {
    var popupElement = _getClosestAncestorByClassName(domElement, "amx-popup");
    var validationGroupElements;
    if (popupElement != null)
    {
      // we are inside a popup, so we need to get a list of all of the groups in this popup
      validationGroupElements = popupElement.getElementsByClassName("amx-validationGroup");
    }
    else
    {
      validationGroupElements = document.getElementsByClassName("amx-validationGroup");
    }

    var groupsById = {};
    for (var i = 0; i < validationGroupElements.length; ++i)
    {
      var groupElement = validationGroupElements[i];
      var amxNode = adf.mf.internal.amx._getNonPrimitiveElementData(groupElement, "amxNode");
      var id = amxNode.getId();
      groupsById[id] = groupElement;
    }

    return groupsById;
  }

  // get the list of all of the groups that this control validates against
  function getValidationGroupList(domElement)
  {
    var groupsListDfd = $.Deferred();
    var amxNode = adf.mf.internal.amx._getNonPrimitiveElementData(domElement, "amxNode");
    var tag = amxNode.getTag();
    var children = tag.getChildren("http://xmlns.oracle.com/adf/mf/amx", "validationBehavior");
    var len = children.length;
    var groups = [];

    if (len > 0)
    {
      var groupIdArray = [];
      var propDfds = [];

      for (var i = 0; i < len; ++i)
      {
        var subTag = children[i];

        var disabledEl = subTag.getAttribute("disabled");
        if (disabledEl != null)
        {
          var propDfd = $.Deferred();
          amx.getElValue(disabledEl)
            .done(
              function(request, response)
              {
            var resp = response[0];
            if (amx.isValueTrue(resp.value))
            {
              return;
            }
            var groupId = subTag.getAttribute("group");
            if(groupIdArray.indexOf(groupId) < 0)
            {
              groupIdArray.push(groupId);
            }
              })
            .always(
              function()
              {
            propDfd.resolve();
          });

          propDfds.push(propDfd);
        }
        else
        {
          var groupId = subTag.getAttribute("group");
          if(groupIdArray.indexOf(groupId) < 0)
          {
            groupIdArray.push(groupId);
          }
        }
      }

      $.when.apply($, propDfds)
        .done(
          function()
          {
            var groupsById = getGroupsById(domElement);
            for(var i = 0; i < groupIdArray.length; ++i)
            {
              var group = groupsById[groupIdArray[i]];
              if (typeof group !== "undefined")
              {
                groups.push(group);
              }
            }

            groupsListDfd.resolve(groups);
          });
    }
    else
    {
      groupsListDfd.resolve(groups);
    }

    return groupsListDfd.promise();
  }

  amx.requiredControlValueChanged = function(validationGroup$nodeOrDomNode)
  {
    // Temporary shim until jQuery is completely removed:
    var validationGroup;
    if (validationGroup$nodeOrDomNode.jquery)
      validationGroup = validationGroup$nodeOrDomNode.get(0);
    else
      validationGroup = validationGroup$nodeOrDomNode;

    if (amx.isValidating())
    {
      return;
    }

    // mark this group as validated
    var amxNode = adf.mf.internal.amx._getNonPrimitiveElementData(validationGroup, "amxNode");
    if (amxNode)
    {
      setGroupValidated(amxNode.getId());
      updateValidationMessages();
    }
  };

  function validateBegin()
  {
    __isValidating = true;
  }

  function validateEnd(groupElements, validationData)
  {
    __isValidating = false;

    if (groupElements === undefined || groupElements.length == 0)
    {
      // no groups were validated, exit early
      return;
    }

    var groupsToCheck = [];

    if (validationData !== undefined)
    {
      // if the validationData is not undefined, then there was a failure
      // go through and create a list of the groups that may need a message box
      for (groupId in validationData)
      {
        if(validationData.hasOwnProperty(groupId) == false)
        {
          continue;
        }

        groupsToCheck.push(groupId);
      }
    }

    updateValidationMessages(groupsToCheck);
  }

  amx.isValidating = function()
  {
    return __isValidating;
  };

  function validateInternal(domElement)
  {
    var validateDfd = $.Deferred();
    // attempt to retrieve the ancestor group
    var amxNode = adf.mf.internal.amx._getNonPrimitiveElementData(domElement, "amxNode");

    getValidationGroupList(domElement).always(function(groupElements)
    {
      // we now have the list of groups that we need to validate, so go
      // through them all and verify every el expressions is in the valid state
      if (groupElements.length == 0)
      {
        // everything is valid since there are no groups
        validateDfd.resolve(groupElements);
        return;
      }

      // make sure all of the unset values are validated
      amx.getElValue(amx.validationsUnsetListEl).done(function(request, response)
      {
        var unsetList = response[0].value;
        // set this to null so that we only build up the node list when we want to
        // figure out if an item is valid or not
        var validationWatchData = null;
        var elToResolve = [];
        var unsetDfd = $.Deferred();
        if(unsetList.length > 0)
        {
          buildValidationGroupWatchData(groupElements, true).done(function(watchData)
          {
            validationWatchData = watchData;
            for(var i = 0; i < unsetList.length; ++i)
            {
              var item = unsetList[i];
              if(validationWatchData.el[item] === undefined)
              {
                // not in the list
                continue;
              }

              elToResolve.push(item);
            }

            if(elToResolve.length > 0)
            {
              amx.getElValue(elToResolve).done(function(request, response)
              {
                // all the el expressions are resolved, so create an
                // array of values to set
                var setList = [];
                // we might have more responses than just our requests, so make sure we handle that here
                for(var i = 0; i < response.length; ++i)
                {
                  var item = response[i];
                  if(elToResolve.indexOf(item.name) < 0)
                  {
                    // not part of what we requested
                    continue;
                  }

                  setList.push({name:item.name, value:amx.getObjectValue(item.value)});
                }
                amx.setElValue(setList).done(function(request, response)
                {
                  // success (but with possible failures), just continue
                  // and check the invalid list later
                  unsetDfd.resolve();
                }).fail(function(request, response)
                {
                  // failure, just continue and check the invalid list later
                  unsetDfd.resolve();
                });
              }).fail(function(request, response)
              {
                // failure, just continue and check the invalid list later
                unsetDfd.resolve();
              });
            }
            else
            {
              unsetDfd.resolve();
            }
          }).fail(function()
          {
            unsetDfd.resolve();
          });
        }
        else
        {
          unsetDfd.resolve();
        }

        unsetDfd.done(function()
        {
          buildValidationDataInternal(groupElements, true, validationWatchData).done(function(validationData)
          {
            // we can navigate (may have warnings)
            validateDfd.resolve(groupElements, validationData);
          }).fail(function(validationData)
          {
            // we can NOT navigate
            validateDfd.reject(groupElements, validationData);
          });
        });
      }).fail(function(request, response)
      {
        // failed to retrieve the unset list - allow navigation to proceed
        validateDfd.resolve(groupElements);
      });
    });

    return validateDfd.promise();
  }

  amx.validate = function($nodeOrDomNode)
  {
    // Temporary shim until jQuery is completely removed:
    var domElement;
    if ($nodeOrDomNode.jquery)
      domElement = $nodeOrDomNode.get(0);
    else
      domElement = $nodeOrDomNode;

    adf.mf.internal.perf.start("amx.validate", ""+domElement);

    var validateDfd = $.Deferred();

    validateBegin();
    validateInternal(domElement).done(
      function(groupElements, validationData)
      {
        validateEnd(groupElements);
      validateDfd.resolve();
      adf.mf.internal.perf.stop("amx.validate", "done");
      }
      ).fail(
      function(groupElements, validationData)
      {
        validateEnd(groupElements, validationData);
      validateDfd.reject();
      adf.mf.internal.perf.stop("amx.validate", "failed");
    });

    return validateDfd.promise();
  };

  // add this renderer
  amx.registerRenderers("amx",amxRenderers);

  $(function() // TODO make non-jq
  {
    // register the data change handler
	  adf.mf.api.addDataChangeListeners(amx.validationsInvalidListEl,validationsDataChangeHandler);
  });

  //--------- ErrorHandler ---------//
  // taken from Trinidad.Core.js
  /**
   * Return true if the object or any of its prototypes'
   * are an instance of the specified object type.
   * @param {Object} obj the object instance
   * @param {Object} type the constructor function
   */
  function _instanceof(obj, type)
  {
    if (type == (void 0))
      return false;

    if (obj == (void 0))
      return false;

    while (typeof(obj) == "object")
    {
      if (obj.constructor == type)
        return true;

      // walk up the prototype hierarchy
      obj = obj.prototype;
    }

    return false;
  }

  /**
   * The is the home for all error handling. This gets registered as an error handler
   * in adf.mf.api.amx.loadTrinidadResources (amx-resource.js) and will extract the
   * relevant error information and call adf.mf.api.amx.addMessage
   *
   * @param request the channel request, can be null if this is called manually
   * @param response a JS Error instance, a TrConverterException or TrValidatorException instance,
   *                 or an exception in JSON form
  */
  adf.mf.internal.amx.errorHandlerImpl = function(request, response)
  {
    // detect if this is a known Trinidad error class
    if (_instanceof(response, window["TrConverterException"]) || _instanceof(response, window["TrValidatorException"]))
    {
      var facesMsg = response.getFacesMessage();
      var severity = facesMsg.getSeverity();
      var severityStr = ERROR_STR;
      if (severity == TrFacesMessage.SEVERITY_INFO)
      {
        severityStr = "info";
      }
      else if (severity == TrFacesMessage.SEVERITY_WARN)
      {
        severityStr = "warning";
      }
      else if (severity == TrFacesMessage.SEVERITY_ERROR)
      {
        severityStr = ERROR_STR;
      }
      else // if (severity == TrFacesMessage.SEVERITY_FATAL)
      {
        severityStr = "fatal";
      }
      adf.mf.api.amx.addMessage(severityStr, facesMsg.getDetail(), null, null);
      return;
    }

    // detect if this is a known js error class
    if (_instanceof(response, Error))
    {
      adf.mf.api.amx.addMessage(ERROR_STR, response.message, null, null);
      return;
    }

    // assume this is an exception from the channel
    var exceptionClassName = response[adf.mf.internal.api.constants.TYPE_PROPERTY];
    var isBatchValidation = (exceptionClassName == batchValidationExName);
    // check to see if we are in the process of validating all of the
    // el expressions contained in this group. We will go back and add
    // of the validation messages from the validationContext, so don't
    // add any that fire right now
    if (amx.isValidating())
    {
      if (isBatchValidation || exceptionClassName == validationExName)
      {
        return;
      }
    }

    if (isBatchValidation)
    {
      // loop through the the batch exceptions and add them one by one
      var batch = response.batch;
      if (batch !== undefined && batch != null)
      {
        for (var i = 0; i < batch.length; ++i)
        {
          addMessageFromException(batch[i]);
        }
      }
      return;
    }

    addMessageFromException(response);
  };

  function addMessageFromException(ex)
  {
    var msg = ex.message;
    var severity = ex.severity;
//    if (severity === undefined){
//      severity = "fatal";
//    }
    adf.mf.api.amx.addMessage(severity.toLowerCase(), msg, null, null);
  }

  /**
   * Adds a message to the message box (and shows it if it isn't already showing.
   * @param {String} severity the severity of the message (e.g. "fatal", "error", "warning", "confirmation", "info")
   * @param {String} summary the short title of the message (e.g. exception message)
   * @param {String} detail null or the optional long detail of the message (e.g. stack trace)
   * @param {String} clientId null or the optional client ID that uniquely identify which component instance the message should be associated with
   */
  adf.mf.api.amx.addMessage = function (severity, summary, detail, componentClientId)
  {
    messageBoxCreate().addItem(severity, summary, detail);
  };

  function severityStringToInt(severity)
  {
    var val = __severityStringToInt[severity];
    if (val == null)
    {
      val = ERROR_VAL;
    }

    return val;
  }

  function severityIntToDisplayString(severity)
  {
    var val = __severityIntToDisplayString[severity];
    if (val == null)
    {
      val = ERROR_DISPLAY_STR;
    }

    return val;
  }

  //--------- ErrorHandler ---------//

  /**
   * Get the child elements that have the specified class names.
   * @param {HTMLElement} parentElement the element whose children will be traversed
   * @param {Array<String>} classNames the class names to search for
   * @param {Boolean:true} searchInChildOrder whether to start looking at the first child then second, etc.
   * @return {Array} an array of found elements whose entries match the specified classNames order
   */
  function _getChildrenByClassNames(parentElement, classNames, searchInChildOrder)
  {
    var childNodes = parentElement.childNodes;
    var childNodeCount = childNodes.length;
    var classNameCount = classNames.length;
    var foundChildren = [];
    var foundCount = 0;
    if (searchInChildOrder === false) // start with the last index
    {
      for (var i=childNodeCount-1; i>=0 && foundCount<classNameCount; --i)
      {
        var child = childNodes[i];
        for (var j=0; j<classNameCount; ++j)
        {
          if (adf.mf.internal.amx.getCSSClassNameIndex(child.className, classNames[j]) != -1)
          {
            foundChildren[j] = child;
            ++foundCount;
            break; // done with this specific child
          }
        }
      }
    }
    else // start with the first index:
    {
      for (var i=0; i<childNodeCount && foundCount<classNameCount; ++i)
      {
        var child = childNodes[i];
        for (var j=0; j<classNameCount; ++j)
        {
          if (adf.mf.internal.amx.getCSSClassNameIndex(child.className, classNames[j]) != -1)
          {
            foundChildren[j] = child;
            ++foundCount;
            break; // done with this specific child
          }
        }
      }
    }
    return foundChildren;
  }

  /**
   * Get the nearest ancestor element that has the specified class name (could be the specified element too).
   * @param {HTMLElement} startingElement the element (inclusive) to find the closest ancestor with the given className
   * @param {String} className the class name to search for
   * @return {HTMLElement} the found ancestor element whose or null if not found
   */
  function _getClosestAncestorByClassName(startingElement, className)
  {
    if (startingElement == null)
      return null;
    else if (startingElement.className == className)
      return startingElement;
    else
      return _getClosestAncestorByClassName(startingElement.parentNode, className);
  }

  //--------- MessageBox ---------//
  function MessageBox()
  {
  }

 /**
   * Creates or returns the header object as the first entry in the content.
  */
  MessageBox.prototype.getHeader = function ()
  {
    var headerClassName = "amx-messages-header";
    // ake sure that the first item in the content is not a header
    var firstNode = this.contentElement.firstChild;
    var headerNode;
    if (firstNode == null ||
        adf.mf.internal.amx.getCSSClassNameIndex(firstNode.className, headerClassName) == -1)
    {
      headerNode = document.createElement("div");
      headerNode.className = headerClassName;
      this.contentElement.parentNode.insertBefore(headerNode, this.contentElement);
    }
    else
    {
      headerNode = firstNode;
    }
    return headerNode;
  };

  /**
   * This updates the messagebox label if the type of message
   * is more severe than the current label severity
   * ("error" takes precedence over "warning")
   * @param type the severity of the message (e.g. "fatal", "error", "warning", "confirmation", "info")
  */
  MessageBox.prototype.setHeaderLabel = function (type)
  {
    var typeValue = severityStringToInt(type);

    if (this.headerValue == null || typeValue < this.headerValue)
    {
      this.headerValue = typeValue;
    }
    else
    {
      return;
    }

    var newHeader = severityIntToDisplayString(this.headerValue);
    var headerNode = this.getHeader();
    // remove the current message, if it exists
    headerNode.innerHTML = "";
    // now add the message label
    var labelNode = document.createElement("div");
    labelNode.className = "amx-messages-header-text";
    labelNode.textContent = adf.mf.resource.getInfoString(adf.mf.resource.ADFInfoBundleName, __severityDisplayStringBundleKey[newHeader]);
    labelNode.setAttribute("role", "heading");
    headerNode.appendChild(labelNode);
  };

  /**
   * This adds the passed in data to the current message box
   * Note: if the type of message is more severe than the current
   * label severity, it will be replace
   * ("error" takes precedence over "warning")
   * @param type the severity of the message (e.g. "fatal", "error", "warning", "confirmation", "info")
   * @param summary the error summary message
   * @param detail any extra detail to be shown to the user, or null
  */
  MessageBox.prototype.addItem = function (type, summary, detail)
  {
    this.setHeaderLabel(type);
    // for now, type can only be warning or error since we don't have graphics
    // for the other ones. So error will be "error" and "fatal" and all else
    // will be warnings
    var typeValue = severityStringToInt(type);
    var errorClass;
    if (typeValue > ERROR_VAL)
    {
      errorClass = WARNING_STR;
    }
    else
    {
      errorClass = ERROR_STR;
    }
    var itemNode = document.createElement("div");
    itemNode.className = "amx-messages-item";
    itemNode.setAttribute("role", "listitem");
    var textItem1 = document.createElement("div");
    textItem1.className = "amx-messages-text amx-messages-text-" + errorClass + " amx-messages-" + errorClass;
    textItem1.textContent = summary;
    if (detail !== undefined && detail != null && detail != "")
    {
      textItem1.appendChild(document.createElement("br"));
      textItem1.appendChild(document.createTextNode(detail));
    }
    var prevMessagesItem = _getChildrenByClassNames(this.contentElement, ["amx-messages-item"], false)[0];
    var prevTextItem = null;
    if (prevMessagesItem != null)
      prevTextItem = _getChildrenByClassNames(prevMessagesItem, ["amx-messages-text"], false)[0];
    if (prevTextItem == null)
    {
      adf.mf.internal.amx.addCSSClassName(textItem1, "amx-messages-first");
    }
    else
    {
      adf.mf.internal.amx.removeCSSClassName(prevTextItem, "amx-messages-last");
    }
    // this is the last item
    adf.mf.internal.amx.addCSSClassName(textItem1, "amx-messages-last");
    itemNode.appendChild(textItem1);
    var icon = document.createElement("div");
    icon.className = "amx-messages-icon amx-messages-icon-" + errorClass;
    itemNode.appendChild(icon);
    this.contentElement.appendChild(itemNode);

    // now center the whole msg box vertically
    var messageBoxElement = this.messageBoxElement;
    var messageBoxComputedStyle = adf.mf.internal.amx.getComputedStyle(messageBoxElement);
    var messageBoxMarginTop = messageBoxComputedStyle.marginTop;
    var messageBoxMarginBottom = messageBoxComputedStyle.marginBottom;
    var messageBoxOuterHeight =
      messageBoxElement.offsetHeight +
      parseInt(messageBoxMarginTop, 10) +
      parseInt(messageBoxMarginBottom, 10);
    var bodyPage = document.getElementById("bodyPage");
    var firstViewContainer = _getChildrenByClassNames(bodyPage, ["amx-view-container"])[0];
    var viewElement = _getChildrenByClassNames(firstViewContainer, ["amx-view"])[0];
    var viewHeight = viewElement.offsetHeight;
    var newTop;
    if (messageBoxOuterHeight < viewHeight)
    {
      newTop = (viewHeight - messageBoxOuterHeight)/2;
    }
    else
    {
      newTop = 0;
    }

    messageBoxElement.style.top = newTop + "px";
  };

  /**
   * Adds the footer than contains the OK button
  */
  MessageBox.prototype.addFooter = function(messageBoxContainer)
  {
    var footerNode = document.createElement("div");
    footerNode.className = "amx-messages-footer";
    var btnNode = document.createElement("div");
    btnNode.className = "amx-messages-btn amx-commandButton";
    // Adding WAI-ARIA Attribute for the message box commandButton role attribute
    btnNode.setAttribute("role", "button");
    var buttonLabel = document.createElement("div");
    buttonLabel.className = "amx-messages-btn-label amx-commandButton-label";
    
    // ADFInfoBundle[LBL_OK_DISPLAY_STR] is special cased in getResourceStringImpl(), and will always return a displayable value
    buttonLabel.textContent = adf.mf.resource.getInfoString(adf.mf.resource.ADFInfoBundleName, "LBL_OK_DISPLAY_STR");
    
    btnNode.appendChild(buttonLabel);
    footerNode.appendChild(btnNode);
    var mousedown = "mousedown";
    var mouseup = "mouseup";
    if (amx.hasTouch())
    {
      mousedown = "touchstart";
      mouseup = "touchend";
    }
    var $btnNode = $(btnNode); // TODO make non-jq
    $btnNode.bind(mousedown, function ()
    {
      $btnNode.addClass("amx-selected");
    });
    $btnNode.bind(mouseup, function ()
    {
      $btnNode.removeClass("amx-selected");
    });
    $btnNode.bind("mouseout", function ()
    {
      $btnNode.removeClass("amx-selected");
    });

    messageBoxContainer.appendChild(footerNode);
  };

  /**
   * Creates the basic structure of this message box class
  */
  MessageBox.prototype.create = function ()
  {
    var bodyPage = document.getElementById("bodyPage");
    var messageBoxElement = document.createElement("div");
    // make sure this responds to dragging for scrolling purposes
    messageBoxElement.className = "messageBox amx-scrollable";
    var messageBoxScreen = document.createElement("div");
    messageBoxScreen.className = "transparentScreen messageBoxScreen";
    bodyPage.appendChild(messageBoxScreen);
    bodyPage.appendChild(messageBoxElement);
    adf.mf.internal.amx._setNonPrimitiveElementData(messageBoxElement, "messageBox", this);
    var messageBoxObject = this;
    this.e = messageBoxElement;
    this.screen = messageBoxScreen;
    messageBoxElement.style.display = "none";
    var messageBoxContainer = document.createElement("div");
    messageBoxContainer.className = "messageBoxContainer";
    // Adding WAI-ARIA Attribute for role the message container div 
    messageBoxContainer.setAttribute("role", "alertdialog");
    messageBoxElement.appendChild(messageBoxContainer);
    var messageBoxContent = document.createElement("div");
    messageBoxContent.className = "messageBoxContent";
    messageBoxContent.setAttribute("role", "list");
    messageBoxContainer.appendChild(messageBoxContent);
    this.contentElement = messageBoxContent;
    this.messageBoxElement = messageBoxElement;
    // create the header placeholder
    this.getHeader();
    this.addFooter(messageBoxContainer);

    /*$(messageBoxScreen).tap(function()
    {
        // this is always modal for now
        // messageBox.hide();
    });*/

    $(messageBoxElement).tap(".messageBoxContainer .amx-messages-btn", function(event)
    {
      // Eat the event since this button is handling it:
      event.preventDefault();
      event.stopPropagation();

      // Delay the DOM removal so that the event eating doesn't fail to trigger a focus
      // on some input component behind this popup (we don't want the input's keyboard to appear):
      setTimeout(function()
      {
        messageBoxObject.hide();
      },
      0);
    });

    return messageBoxElement;
  };

  /**
   * Shows the message box to the user
  */
  MessageBox.prototype.show = function ()
  {
    var messageBoxElement = this.e;
    var messageBoxScreen = this.screen;

    messageBoxScreen.style.display = "";
    messageBoxElement.style.display = "";

    // All view containers are now hidden from screen readers (we can't just
    // look for the first one because an error could occur while transitioning):
    var foundViewContainers = document.getElementsByClassName("amx-view-container");
    for (var i=0, elementCount=foundViewContainers.length; i<elementCount; i++)
    {
      foundViewContainers[i].setAttribute("aria-hidden", "true"); // Note: toggling this doesn't work on iOS 5 but does in iOS 6
    }
  };

  /**
   * Hides the message box from the user
  */
  MessageBox.prototype.hide = function ()
  {
    var messageBoxElement = this.e;
    var messageBoxScreen = this.screen;

    var messageBoxContent = this.contentElement;
    messageBoxContent.innerHTML = "";

    $(messageBoxElement).remove();
    $(messageBoxScreen).remove();

    // All view containers are no longer hidden from screen readers (we can't just
    // look for the first one because an error could occur while transitioning):
    var foundViewContainers = document.getElementsByClassName("amx-view-container");
    for (var i=0, elementCount=foundViewContainers.length; i<elementCount; i++)
    {
      foundViewContainers[i].setAttribute("aria-hidden", "false"); // Note: toggling this doesn't work on iOS 5 but does in iOS 6
    }
  };

  function messageBoxCreate()
  {
    var messageBoxElement = null;
    var messageBoxObject = null;
    var bodyPage = document.getElementById("bodyPage");
    var foundMessageBoxElements = document.getElementsByClassName("messageBox");
    if (foundMessageBoxElements.length > 0)
    {
      messageBoxElement = foundMessageBoxElements[0];
      messageBoxObject = adf.mf.internal.amx._getNonPrimitiveElementData(messageBoxElement, "messageBox");
    }
    else
    {
      messageBoxObject = new MessageBox();
      messageBoxElement = messageBoxObject.create();
    }
    messageBoxObject.show();
    return messageBoxObject;
  };
  //--------- /MessageBox ---------//
})();
