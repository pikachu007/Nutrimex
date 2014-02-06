/* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. */
/* -------------------------------------------------------- */
/* ------------------- base-adfel.js ---------------------- */
/* -------------------------------------------------------- */

// ===========================================================================
// ======= Any touching of this file must have architectural approval. =======
// ===========================================================================

// Perform the base namespace definitions:
if (!window.adf) window.adf = {};
adf.mf                     = adf.mf                     || {};
adf.mf.environment         = adf.mf.environment         || {};
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

// Create a default session key
window.adf_mf_sessionKey = 0;

// ======= Resource File Utilities =======
(function()
{
  adf.mf.api.resourceFile = {};

  /**
   * Internal function for loading JS files
   * @param {String} resourceName the resource to load
   * @param {Boolean} async whether the request should be asynchronous
   * @param {Function} successCB the JS could be parsed
   * @param {Function} errorCB the JS could not be parsed
   * @param {Function} filterCB the optional filter function that can change the response text before it is used
   */
  adf.mf.api.resourceFile.loadJsFile = function(resourceName, async, successCB, errorCB, filterCB)
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
      adf.mf.api.resourceFile._loadFileWithAjax(
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
  adf.mf.api.resourceFile.loadJsonFile = function(resourceName, async, successCB, errorCB)
  {
    // Load the json:
    adf.mf.api.resourceFile._loadFileWithAjax(
      resourceName,
      async,
      function(responseText)
      {
        if ((responseText != null) && (responseText.length > 0))
        {
          if (JSON)
          {
            try
            {
              var result = JSON.parse(responseText);
              successCB(result);
            }
            catch (problem)
            {
              errorCB("JSON failure: " + problem);
            }
          }
          else
          {
            errorCB("Browser is unable to parse the JSON text because it does not support JSON.parse()");
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
   * @param {Boolean} async whether the loading should be asynchronous
   * @param {Function} successCB the JSON could be parsed
   * @param {Function} errorCB the JSON could not be parsed
   */
  adf.mf.api.resourceFile._loadFileWithAjax = function(resourceName, async, successCB, errorCB)
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
})();

// ======= URL Loading and Locale setting =======
(function()
{
  // Define the URL loading functions (e.g. getting query string parameters):

  /**
   * Official mechanism for accessing the query string portion of the page's URL.
   * @return {String} the non-null (though possibly empty string) query string of the page
   */
  adf.mf.api.getQueryString = function()
  {
    // NOTE:
    // This uses AdfmfCallback.getQueryString() when document.location.search is empty to work around Android 3.0+ WebView.loadUrl bugs.

    // Known query parameters:
    //  _________ PARAM _________  _____ FILE _____  ________________________________ MEANING ________________________________
    //  amx_dtfolderpath           amx-core.js       Unknown; some kind of path modifier for file and/or featureRoot
    //  amx_dtmode                 adfc-mobile.js    Whether displaying in a design time preview pane (TODO remove this one?)
    //  amx_dtmode                 base-core.js      Whether displaying in a design time preview pane
    //  appStartTime               AdfPerfTiming.js  Unknown
    //  dir                        base-core.js      User reading direction for the documentElement (rendering/skinning)
    //  featureRoot                adfc-mobile.js    Unknown; some kind of "feature root"
    //  file                       adfc-mobile.js    Unknown; some kind of "entry point document path"
    //  lang                       base-core.js      User language for the documentElement (rendering/skinning)
    //  useBruceWay                amx-core.js       Unsupported way to toggle internal client state storage mechanisms
    //  webviewStartTime           AdfPerfTiming.js  Unknown
    //
    // Note mock data is triggered by (typeof adf.pg === "undefined" aka adf.mf.device.integration.js not being loaded)
    // but would be nice if it were triggered otherwise.

    if (document.location.search && document.location.search != "")
    {
      // non-null & non-empty:
      return document.location.search;
    }

    if (window['AdfmfCallback'] != null)
    {
      var callbackResult = window.AdfmfCallback.getQueryString();
      if (callbackResult != null)
      {
        // non-null:
        return callbackResult;
      }
    }

    // just return the value of the search variable:
    var result = document.location.search;
    if (result == null)
      return ""; // non-null
    return result; // possibly blank
  }

  /**
   * Extract a parameter value from the query string.
   * @param {String} queryString the non-null query string portion of the page's URL
   * @param {String} paramName the name of the parameter to access
   * @param {String} defaultWhenNullOrBlank an optional unescaped value to return if the value is null or blank
   * @return {String} the unescaped (possibly null) corresponding value for the specified parameter
   */
  adf.mf.api.getQueryStringParamValue = function(queryString, paramName, defaultWhenNullOrBlank)
  {
    var result = null;
    if ((queryString != null) && (paramName != null))
    {
      // Find out where the parameter value begins within the queryString.
      var startIndex = queryString.indexOf("?" + paramName + "=");
      if (startIndex < 0) // not found
      {
        startIndex = queryString.indexOf("&" + paramName + "=");
      }

      if (startIndex >= 0) // param is possibly present
      {
        // Find out where the parameter and value end within the queryString.
        var endIndex = queryString.indexOf('&', startIndex + 1);
        if (endIndex < 0) // no ending
        {
          endIndex = queryString.length;
        }

        // Get the substring.
        var value = queryString.substring(startIndex, endIndex);

        // Find the equals sign.
        var start2 = value.indexOf('=');
        if ((start2 >= 0) && (start2 < value.length))
        {
          result = value.substring(start2 + 1);
          if (result.length == 0)
          {
            result = null;
          }
        }
      }
    }

    if (result != null)
      result = unescape(result);

    if (result == null || result == "")
    {
      if (defaultWhenNullOrBlank !== undefined)
      {
        // a default was provided so use it:
        return defaultWhenNullOrBlank;
      }
    }

    // Might be null, might be blank, might be a real value:
    return result;
  };

  /**
   * Set up the lang and dir on the document.
   */
  adf.mf.internal.locale.init = function()
  {
    if (adf.mf.internal.locale.initStarted)
      return; // prevent re-entry
    adf.mf.internal.locale.initStarted = true;

    // Apply the HTML[dir], HTML[lang], and document.dir based on some defaults or via the query string.
    var theLang = null;

    // Come up with a browser-based or hard-coded default for "lang":
    if (theLang == undefined)
    {
      try
      {
        // Internet Explorer way:
        theLang = window.navigator.userLanaguage;
      }
      catch(e)
      {
        // do nothing; we will try other mechanisms
      }
    }
    if (theLang == undefined)
    {
      try
      {
        // Standard way:
        theLang = window.navigator.language;
      }
      catch(e)
      {
        // do nothing; we will try other mechanisms
      }
    }
    if (theLang == undefined)
    {
      // default to "en":
      theLang = "en";
    }

    // Come up with a browser-based or hard-coded default for "dir":
    var theDir = document.dir; // generally this is empty, not undefined or null
    if (theDir == "")
      theDir = "ltr"; // default to LTR

    // The container might override the default lang and dir so we need to use them if provided:
    var queryString = adf.mf.api.getQueryString();
    var theLang = adf.mf.api.getQueryStringParamValue(queryString, "lang", theLang);
    var theDir = adf.mf.api.getQueryStringParamValue(queryString, "dir", theDir);

    // Set the properties that the rest of the framework will use (e.g. via skinning or JavaScript access)
    document.documentElement.setAttribute("lang", theLang);
    document.documentElement.setAttribute("dir", theDir);
    document.dir = theDir;
  }
})();

// ======= Locale Utilities =======
(function()
{
  adf.mf.internal.locale.splitLocale = function(locale)
  {
    var ret   = [null,null,null];
    var start = 0;
    var end   = locale.indexOf("_");

    if (end != -1)
    {
      ret[0] = locale.substring(start, end);
    }
    else
    {
      ret[0] = locale;
      return ret;
    }
    start = ++end;
    end   = locale.indexOf("_", start);
    if (end != -1)
    {
      ret[1] = locale.substring(start, end);
    }
    else
    {
      ret[1] = locale.substring(start);
      return ret;
    }

    start  = ++end;
    ret[2] = locale.substring(start);

    return ret;
  };

  adf.mf.locale.getUserLanguage = function()
  {
    var lang = document.documentElement.getAttribute("lang");
    if (lang == null)
    {
      alert("Illegal use of language API prior to \"showpagecomplete\" event.");
    }
    return lang;
  };

  adf.mf.locale.getJavaLanguage = function(/* String */ javascriptLang)
  {
    // default to the user language if no language is passed in
    if (javascriptLang == null)
    {
      javascriptLang = getUserLanguage();
    }

    // look for first dash, the territory appears after the dash
    var territoryIndex = javascriptLang.indexOf("-", 0);

    // no dash found, so the name is just a language;
    if (territoryIndex == -1)
      return javascriptLang;

    var inLength = javascriptLang.length;
    var javaLang = javascriptLang.substring(0, territoryIndex);

    javaLang += "_";

    territoryIndex++;

    var variantIndex = javascriptLang.indexOf("-", territoryIndex);

    if (variantIndex == -1)
    {
      // we have no variant
      variantIndex = inLength;
    }

    var territoryString = javascriptLang.substring(territoryIndex,
        variantIndex);

    javaLang += territoryString.toUpperCase();

    // we have a variant, so add it
    if (variantIndex != inLength)
    {
      javaLang += "_";
      javaLang += javascriptLang.substring(variantIndex + 1, inLength);
    }

    return javaLang;
  };

  adf.mf.locale.generateLocaleList = function(locale, useVariant)
  {
    var localeJava  = adf.mf.locale.getJavaLanguage(locale); // will convert "-" to "_"
    var localeArray = adf.mf.internal.locale.splitLocale(localeJava);
    var language    = localeArray[0];
    var country     = localeArray[1];
    var variant     = localeArray[2];
    var localeList  = [];

    if (locale.indexOf("en") != 0)
    {
      localeList.push("en-US");
    }

    if (language != null)
    {
      localeList.push(language);

      if (country != null)
      {
        localeList.push(language+"-"+country);

        if (variant != null && useVariant)
        {
          localeList.push(language+"-"+country+"-"+variant);
        }
      }
    }
    return localeList;
  };
})();

// ======= Resource Utilities =======
(function()
{
  // define the names of the 2 known message bundles here
  adf.mf.resource.ADFErrorBundleName = "ADFErrorBundle";
  adf.mf.resource.ADFInfoBundleName  = "ADFInfoBundle";

  /**
   * PUBLIC FUNCTION used to load the message bundles.
   *
   * @param {string} baseUrl - path to the resource bundle
   * @param {string} loadMessageBundleCallback - name of the callback method to load the message bundles
   * @return {void}
   */
  adf.mf.resource.loadADFMessageBundles = function(baseUrl, localeList)
  {
    adf.mf.resource.loadMessageBundle(adf.mf.resource.ADFInfoBundleName, baseUrl,  localeList.slice(0));
    adf.mf.resource.loadMessageBundle(adf.mf.resource.ADFErrorBundleName, baseUrl, localeList.slice(0));
    adf.mf.resource.adfMessageBundlesLoaded = true;
  };

  /**
   * loadMessageBundle is used to load all the locale message bundles declared in the locales
   * from the given base location and base name.
   *
   * @param bundleName is the name of the bundle (i.e. "ADFErrorBundle")
   * @param baseUrl    is the base location for the bundle
   * @param locales    is the list of locales to load
   **/
  adf.mf.resource.loadMessageBundle = function(bundleName, baseUrl, locales)
  {
    var locales = locales || [adf.mf.locale.getUserLanguage()];

    var callback = function(locale)
    {
      if (locale === null)
      {
        if (adf.mf.log.Framework.isLoggable(adf.mf.log.level.WARNING))
        {
          /* NOTE: can not use a resource string since it might not be loaded. */
          adf.mf.log.Framework.logp(adf.mf.log.level.WARNING, "adf.mf.resource",
            "loadMessageBundle", "Failed to load " + bundleName);
        }
      }
      else
      {
        if (adf.mf.log.Framework.isLoggable(adf.mf.log.level.INFO))
        {
          /* NOTE: can not use a resource string since it might not be loaded. */
          adf.mf.log.Framework.logp(adf.mf.log.level.INFO, "adf.mf.resource",
            "loadMessageBundle", "Loaded message bundle " + bundleName + " for locale " + locale);
        }
      }
    };

    var isMessageBundleLoaded = function(locale)
    {
      return (adf.mf.resource[bundleName] !== undefined);
    };

    adf.mf.internal.resource.loadGenericMessageBundle(bundleName, baseUrl, locales, isMessageBundleLoaded, callback);
  };

  /**
   * PUBLIC FUNCTION used to grab a string from a message resource bundle
   *
   * @param {string} bundleName - name of the message bundle to look into
   * @param {string} key - the key to look for in order to grab the message
   */
  adf.mf.resource.getInfoString = function(bundleName, key)
  {
    var args = Array.prototype.slice.call(arguments, 2);
    return adf.mf.internal.resource.getResourceStringImpl(bundleName, key, args);
  };

  /**
   * PUBLIC FUNCTION used to grab the ID of an error message in a resource bundle
   *
   * @param {string} bundleName - name of the message bundle to look into
   * @param {string} key - the key to look for in order to grab the message
   */
  adf.mf.resource.getErrorId = function(bundleName, key)
  {
    return adf.mf.internal.resource.getResourceStringImpl(bundleName, key + "__ID");
  };

  /**
   * PUBLIC FUNCTION used to grab the CAUSE of an error message in a resource bundle
   *
   * @param {string} bundleName - name of the message bundle to look into
   * @param {string} key - the key to look for in order to grab the message
   */
  adf.mf.resource.getErrorCause = function(bundleName, key)
  {
    var args = Array.prototype.slice.call(arguments, 2);
    return adf.mf.internal.resource.getResourceStringImpl(bundleName, key + "_CAUSE", args);
  };

  /**
   * PUBLIC FUNCTION used to grab the ACTION of an error message in a resource bundle
   *
   * @param {string} bundleName - name of the message bundle to look into
   * @param {string} key - the key to look for in order to grab the message
   */
  adf.mf.resource.getErrorAction = function(bundleName, key)
  {
    var args = Array.prototype.slice.call(arguments, 2);
    return adf.mf.internal.resource.getResourceStringImpl(bundleName, key + "_ACTION", args);
  };

  /* internal functions */

  adf.mf.internal.resource.loadJavaScript = function(url, success, failure)
  {
    var filterFunction = function(responseText)
    {
      // Permit debugging of the source (currently only works in firebug, google chrome and webkit nightly).
      // Also note that using a filter function to load the JS file requires the file doesn't use any implicit
      // window variables/functions (it is good practice anyhow to avoid implicit code).
      responseText += "\n//@ sourceURL=" + url;

      // Fixes for ambiguous script files:

      // a.) Convert var LocaleSymbols to window.var LocaleSymbols
      responseText = responseText.replace(/var LocaleSymbols/, "window.LocaleSymbols");

      // b.) Convert TrMessageFactory._TRANSLATIONS= to window.TrMessageFactory._TRANSLATIONS=
      responseText = responseText.replace(/TrMessageFactory\.\_TRANSLATIONS\=/, "window.TrMessageFactory._TRANSLATIONS=");

      return responseText;
    };
    adf.mf.api.resourceFile.loadJsFile(
      url,
      false,
      success,
      failure,
      filterFunction);
  };

  adf.mf.internal.resource.loadJavaScriptByLocale = function(locales, getURLFunction, predicate, callback)
  {
    if (locales.length == 0)
    {
      callback(null);
      return;
    }
    var locale  = locales.pop();
    var url     = getURLFunction(locale);
    var failure = function()
    {
      // for this low-level method, always send in the english string
      if (adf.mf.log.Framework.isLoggable(adf.mf.log.level.WARNING))
      {
        var droot = document.location.pathname;
        var root  = droot.substring(0, droot.lastIndexOf('/'));
        adf.mf.log.Framework.logp(adf.mf.log.level.WARNING,
            "adf.mf.internal.resource", "loadJavaScriptByLocale", "Failed to load " + url + " from " + root);
      }
      /* hmm this locale did not work, recurse and see if the next one works */
      adf.mf.internal.resource.loadJavaScriptByLocale(locales, getURLFunction, predicate, callback);
    };
    var success = function()
    {
      if (predicate(locale))
      {
        // for this low-level method, always send in the english string
        if (adf.mf.log.Framework.isLoggable(adf.mf.log.level.INFO))
        {
          adf.mf.log.Framework.logp(adf.mf.log.level.INFO,
              "adf.mf.internal.resource", "loadJavaScriptByLocale", "Loaded " + url);
        }
        callback(locale);
      }
      else
      {
        failure();
      }
    };

    if(adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINER))
    {
      adf.mf.log.Framework.logp(adf.mf.log.level.FINER,
                                "adf.mf.internal.resource", "loadJavaScriptByLocale",
                                "url: " + url + " locales: " + adf.mf.internal.log.getStringifedIfNeeded(locales));
    }
    adf.mf.internal.resource.loadJavaScript(url, success, failure);
  };

  /**
   * loadGenericMessageBundle is used to load all the locale message bundles declared in the locales
   * from the given base location and base name.
   *
   * @param bundleName is the name of the bundle (i.e. "ADFErrorBundle")
   * @param baseUrl    is the base location for the bundle
   * @param locales    is the list of locales to load
   */
  adf.mf.internal.resource.loadGenericMessageBundle = function(bundleName, baseUrl, locales, isMessageBundleLoaded, callback)
  {
    var getMessageBundleUrl = function(locale)
    {
      var url = baseUrl + "/resource/" + bundleName;
      if (locale.indexOf("en") == 0)
      {
        return url + ".js";
      }
      return url + "_" + adf.mf.locale.getJavaLanguage(locale) + ".js";
    };
    adf.mf.internal.resource.loadJavaScriptByLocale(locales, getMessageBundleUrl, isMessageBundleLoaded, callback);
  };

  /**
   * PRIVATE FUNCTION used to grab a string from a resource bundle.
   *
   * @param {string} level - the level of the log message; for example: WARNING, SEVERE
   * @param {string} methodName - the name of the method where we're logging the message from
   * @param {string} bundleName - name of the message bundle to look into
   * @param {string} key - the key to look for in order to grab the message
   * @param {string} args - extra arguments passed in; for example an exception name, or another parameter
   */
  adf.mf.internal.resource.logResourceImpl = function(level, methodName, bundleName, key, args)
  {
    if (adf.mf.log.Framework.isLoggable(level))
    {
      adf.mf.log.Framework.logp(level, "adf", methodName,
          adf.mf.internal.resource.getResourceStringImpl(bundleName, key, args));
    }
  };

  /**
   * PRIVATE FUNCTION used to grab a string from a resource bundle. Start looking in the bundle that most
   * specifically matches the locale, and subsequently look in more general bundles, until the key is
   * found, or there are no more bundles to check.  For a bundle name of "AMXInfoBundle", with locale of
   * "zh_TW", the names of the bundles checked, in order, would be: "AMXInfoBundle_zh_TW",
   * "AMXInfoBundle_zh", "AMXInfoBundle".
   *
   * @param {string} bundleName - name of the base message bundle to use
   * @param {string} key - the key to look for in order to grab the message
   * @param {string} args - extra arguments passed in; for example an exception name, or another parameter
   */
  adf.mf.internal.resource.getResourceStringImpl = function(bundleName, key, args)
  {
    var errorMsg;
    
    // should get back something of the form "fr" or "zh_TW"
    var javaLanguage = adf.mf.locale.getJavaLanguage(adf.mf.locale.getUserLanguage());
    
    // create an array containing the default bundle name and each language part (i.e. ["AMXInfoBundle", "zh", "TW"])
    var bundleNamePartsArray = javaLanguage.split("_");
    bundleNamePartsArray.unshift(bundleName);
    
    // Iterate over bundles, from most specific locale to default, returning first message occurrence found. For
    // a bundle name of "AMXInfoBundle", with locale of "zh_TW", the names of the bundles checked, in order, would
    // be: "AMXInfoBundle_zh_TW", "AMXInfoBundle_zh", "AMXInfoBundle".
    for (var i = bundleNamePartsArray.length; i > 0; i--)
    {
      var localizedBundleName = bundleNamePartsArray.slice(0, i).join("_");
      
      var bundleObj = adf.mf.resource[localizedBundleName];
      if ((bundleObj !== undefined) && (bundleObj !== null))
      {
        var msg = bundleObj[key];
        if ((msg !== undefined) && (msg !== null))
        {
          var argArray = [msg];
          return adf.mf.log.format.apply(this, argArray.concat(args));
        }
        else if (i == 1) // no message key found in any variation of bundle name
        {
          errorMsg = "Unable to find message key " + key + " for bundle " + bundleName;
        }
      }
      else if (i == 1) // neither default bundle found, nor bundle variations containing message key
      {
        errorMsg = "Unable to find message bundle " + bundleName;
      }
    }

    if (!adf.mf.resource.adfMessageBundlesLoaded)
    {
      // It is too soon to access the message bundle.

      // For this low-level method, always send in the english string
      if (adf.mf.log.Framework.isLoggable(adf.mf.log.level.FINE))
      {
        adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "adf", "getResourceStringImpl", errorMsg);
      }

      // Return the key with args just in case this too-soon issue masks a
      // more severe problem.
      if (args == null)
        args = "";
      var returnValue = bundleName + "[" + key + "](" + args + ")";

      // Let's default to English for a very small subset of resource strings:
      if ("AMXInfoBundle[MSG_LOADING]()" == returnValue)
        returnValue = "Loading";
      else if ("ADFInfoBundle" == bundleName)
      {
        if ("LBL_INFO_DISPLAY_STR" == key)
          returnValue = "Info";
        else if ("LBL_CONFIRMATION_DISPLAY_STR" == key)
          returnValue = "Confirmation";
        else if ("LBL_WARNING_DISPLAY_STR" == key)
          returnValue = "Warning";
        else if ("LBL_ERROR_DISPLAY_STR" == key)
          returnValue = "Error";
        else if ("LBL_FATAL_DISPLAY_STR" == key)
          returnValue = "Fatal";
        else if ("LBL_OK_DISPLAY_STR" == key)
          returnValue = "OK";
      }

      return returnValue;
    }
 
    // For this low-level method, always send in the english string
    if (adf.mf.log.Framework.isLoggable(adf.mf.log.level.SEVERE))
    {
      adf.mf.log.Framework.logp(adf.mf.log.level.SEVERE, "adf", "getResourceStringImpl", errorMsg);
    }

    return null;
  };
})();

// ======= Log Utilities =======
(function()
{
  //idea taken from http://stackoverflow.com/questions/1038746/equivalent-of-string-format-in-jquery
  adf.mf.log.format = function(str, args)
  {
    args = Array.prototype.slice.call(arguments, 1);
    return str.replace(/\{(\d+)\}/g, function(m, n) { return args[n]; });
  };

  //matching the format used by iOS native logging
  adf.mf.log.formatDate = function(d)
  {
    function pad(n,c) { var s=""+n; while (s.length<c) s="0"+s; return s; }
    return d.getFullYear()+"-"+pad(d.getMonth()+1,2)+"-"+pad(d.getDate(),2)+" "+
      pad(d.getHours(),2)+":"+pad(d.getMinutes(),2)+":"+pad(d.getSeconds(),2)+"."+pad(d.getMilliseconds(),3);
  };

  /**
   * PUBLIC FUNCTION used to log a message abd throw an error; behind the covers, it grabs a the localized
   * string message from the resource bundle as well.
   *
   * @param {string} bundleName - name of the message bundle to look into
   * @param {string} methodName - the name of the method where we're logging the message from
   * @param {string} key - the key to look for in order to grab the message
   */
  adf.mf.log.logAndThrowErrorResource = function(bundleName, methodName, key)
  {
    var args = Array.prototype.slice.call(arguments, 3);
    var msg  = adf.mf.internal.resource.getResourceStringImpl(bundleName, key, args);

    if (adf.mf.log.Framework.isLoggable(adf.mf.log.level.SEVERE))
    {
      adf.mf.log.Framework.logp(adf.mf.log.level.SEVERE, "adf", methodName, msg);
    }

    throw adf.mf.resource.getErrorId(key) + ": " + msg;
  };

  /**
   * PUBLIC FUNCTION used to log a message; behind the covers, it grabs a the localized
   * string message from the resource bundle as well.
   *
   * @param {string} level - the level of the log message; for example: WARNING, SEVERE
   * @param {string} methodName - the name of the method where we're logging the message from
   * @param {string} bundleName - name of the message bundle to look into
   * @param {string} key - the key to look for in order to grab the message
   */
  adf.mf.log.logInfoResource = function(bundleName, level, methodName, key)
  {
    var args = Array.prototype.slice.call(arguments, 4);
    adf.mf.internal.resource.logResourceImpl(level, methodName, bundleName, key, args);
  };

  adf.mf.internal.log.getStringifedIfNeeded = function(message)
  {
    if (typeof message == "object" &&
        adf.mf.util != null &&
        adf.mf.util.stringify != null)
    {
      return adf.mf.util.stringify(message);
    }
    return message;
  };

  /*
  The levels in descending order are:
      SEVERE (highest value)
      WARNING
      INFO
      CONFIG
      FINE
      FINER
      FINEST
      ALL (lowest value)
   */
  adf.mf.internal.log.level = function(name, value)
  {
    this.name  = name;
    this.value = value;

    this.toString = function()
    {
      return this.name;
    };
  };

  adf.mf.log.level = adf.mf.log.level || {
    'SEVERE'             : new adf.mf.internal.log.level('SEVERE', 1000),
    'WARNING'            : new adf.mf.internal.log.level('WARNING', 900),
    'INFO'               : new adf.mf.internal.log.level('INFO', 800),
    'CONFIG'             : new adf.mf.internal.log.level('CONFIG', 700),
    'FINE'               : new adf.mf.internal.log.level('FINE', 500),
    'FINER'              : new adf.mf.internal.log.level('FINER', 400),
    'FINEST'             : new adf.mf.internal.log.level('FINEST', 300),
    'ALL'                : new adf.mf.internal.log.level('ALL', Number.MIN_VALUE)
  };

  adf.mf.log.compilePattern = function(toCompile)
  {
    toCompile = toCompile.replace('%LOGGER%', "{0}");
    toCompile = toCompile.replace('%LEVEL%', "{1}");
    toCompile = toCompile.replace('%TIME%', "{2}");
    toCompile = toCompile.replace('%CLASS%', "{3}");
    toCompile = toCompile.replace('%METHOD%', "{4}");
    toCompile = toCompile.replace('%MESSAGE%', "{5}");
    return toCompile;
  };

  adf.mf.log.logger = function(name)
  {
    this.name    = name;
    this.level   = adf.mf.log.level.SEVERE;
    this.pattern = adf.mf.log.compilePattern('[%LEVEL% - %LOGGER% - %CLASS% - %METHOD%] %MESSAGE%');

    this.init = function(level, pattern)
    {
      this.level = level;
      if (pattern) this.pattern = adf.mf.log.compilePattern(pattern);
    };

    this.isLoggable = function(level)
    {
      return level.value >= this.level.value;
    };

    this.toString = function()
    {
      return this.name;
    };

    this.logp = function(level, klass, method, message)
    {
      if (this.isLoggable(level) == false)
      {
        return;
      }

      var timestamp = adf.mf.log.formatDate(new Date());
      var logMessage = adf.mf.log.format(this.pattern, this.name, level.name, timestamp, klass, method, message);
      console.log(logMessage);
    };
  };

  // Initialize the loggers:
  adf.mf.log.Framework   = adf.mf.log.Framework   || new adf.mf.log.logger('oracle.adfmf.framework');
  adf.mf.log.Application = adf.mf.log.Application || new adf.mf.log.logger('oracle.adfmf.application');
})();
/* Copyright (c) 2011, 2013, Oracle and/or its affiliates. All rights reserved. */
/* ------------------------------------------------------- */
/* ------------------- base-core.js ---------------------- */
/* ------------------------------------------------------- */

// ===========================================================================
// ======= Any touching of this file must have architectural approval. =======
// ===========================================================================

// ======= queueShowPageComplete =======
/**
 * Internal function for queueing the "showpagecomplete" event.
 */
adf.mf.internal.api.queueShowPageComplete = function()
{
  // Make sure we invoke this at most once:
  if (!adf.mf.internal.api._showPageCompleteQueued)
  {
    adf.mf.internal.api._showPageCompleteQueued = true;
    var evt = document.createEvent('Events');
    evt.initEvent("showpagecomplete", false, false, {});
    evt.view = window;
    evt.altKey = false;
    evt.ctrlKey = false;
    evt.shiftKey = false;
    evt.metaKey = false;
    evt.keyCode = 0;
    evt.charCode = 'a';
    var eventTarget = document;
    eventTarget.dispatchEvent(evt);
  }
};

/**
 * Utility invoked from the native framework when memory is identified as being low.
 * @param {Boolean} visible whether this page's WebView is shown (currently unused)
 */
adf.mf.internal.handleLowMemory = function(visible)
{
  // Add a marker class onto the body so that expensive styles like 3D transformations or
  // elastic/momentum scrolling can be turned off.
  document.body.className += " adfmf-low-memory";
};

/**
 * In case adf.mf.internal.handleWebViewDisplay is invoked with visible=false
 * while the page is loading or busy, we need to keep attempting to hide it
 * or else the page might eat up memory unnecessarily.
 */
adf.mf.internal._handleWebViewDisplayHideLater = function()
{
  adf.mf.internal.handleWebViewDisplay(false);
};

/**
 * Utility invoked from the native framework that either frees up memory for invisible WebViews or
 * prepares a WebView for being displayed.
 * @param {Boolean} visible whether this page's WebView is about to be shown or has just been hidden
 */
adf.mf.internal.handleWebViewDisplay = function(visible)
{
  if (adf.mf.internal._handleWebViewDisplayTimer != null)
  {
    // If we had a visble=false timer, we need to cancel it:
    window.clearTimeout(adf.mf.internal._handleWebViewDisplayTimer);
    adf.mf.internal._handleWebViewDisplayTimer = null;
  }

  // Toggle the display of the body so the browser can clean up unused resources.
  if (visible)
  {
    document.body.style.display = "block";
  }
  else
  {
    // Hide the WebView only if the page has loaded and is idle.
    var finishedLoading =
      adf.mf.internal.api && adf.mf.internal.api._showPageCompleteQueued;
    var busy =
      adf.mf.internal.amx && adf.mf.internal.amx._showLoadingCalls != 0;
    if (finishedLoading && !busy)
    {
      // It is safe to hide the page to free up memory:
      document.body.style.display = "none";
    }
    else
    {
      // It is not safe now, so try again later:
      adf.mf.internal._handleWebViewDisplayTimer =
        window.setTimeout(adf.mf.internal._handleWebViewDisplayHideLater, 4000);
    }
  }
};

// ======= onBaseLoad =======
function onBaseLoad()
{
  // Perform the base initialization (called from body "load" function):
  var lastResortLogger = function(message)
  {
    // Let the native logger get it:
    console.log(message);

    // This is so catastrophic, let the user see it:
    var div = document.createElement("div");
    div.style.WebkitUserSelect = "text";
    div.appendChild(document.createTextNode(message));
    var errorBox = document.getElementById("BaseLoadErrorBox");
    if (errorBox == null)
    {
      errorBox = document.createElement("div");
      errorBox.id = "BaseLoadErrorBox";
      var errorBoxStyle = errorBox.style;
      errorBoxStyle.zIndex = "10001";
      errorBoxStyle.position = "absolute";
      errorBoxStyle.top = "20px";
      errorBoxStyle.bottom = "20px";
      errorBoxStyle.left = "20px";
      errorBoxStyle.right = "20px";
      errorBoxStyle.padding = "10px";
      errorBoxStyle.overflow = "auto";
      errorBoxStyle.opacity = "0.9";
      errorBoxStyle.backgroundColor = "white";
      errorBoxStyle.color = "black";
      errorBoxStyle.WebkitOverflowScrolling = "touch";
      document.body.appendChild(errorBox);
    }
    errorBox.appendChild(div);
  };
  adf.mf.internal.log.lastResortLogger = lastResortLogger;

  // Future nice-to-have:
  // Optionally disable perf timings in mock/hosted modes using some mechanism other than commenting
  // out the following line from adf.el.js:
  // adf.mf.log.Performance.logp(adf.mf.log.level.FINE, "AdfPerfTimingConsoleLogger", "perfTimings", logString);

  // TODO (future) instead of using window.adf._bootstrapMode, use a query string to specify the location of the profile.json file (see adf.login.html (login), bootstrap_automation.html (automate), fixup_bootstrap.py (dev), build-hosted.sh (hosted), and DVT's hosted CompGallery script)
  // Load the environment profile json file:
  var devMode = null;
  var profile;
  var profileJsonFile = "js/profile-html.json";
  window.adf_base_success_log = [];
  if (window.adf._bootstrapMode)
  {
    // Override the location of the profile.json file if applicable:
    window.adf_base_success_log.push("adf._bootstrapMode: " + window.adf._bootstrapMode);
    if (window.adf._bootstrapMode == "amx")
    {
      profileJsonFile = "js/profile.json";
    }
    else if (window.adf._bootstrapMode == "dev")
    {
      // Running in a browser using raw development artifacts:
      profileJsonFile = "../Base/js/json/profile-dev.json";
      devMode = "dev";
    }
    else if (window.adf._bootstrapMode == "hosted")
    {
      // Running in a browser using built artifacts:
      profileJsonFile = "js/profile-hosted.json";
      devMode = "hosted";
    }
    else if (window.adf._bootstrapMode == "eltest")
    {
      // Running in a browser using built artifacts:
      profileJsonFile = "../../Base/js/json/profile-eltest.json";
    }
    else if (window.adf._bootstrapMode == "automate")
    {
      // Running in a WebView but using built artifacts:
      profileJsonFile = "../../../../../www/js/profile-automate.json";
      devMode = "automate";
    }
    else if (window.adf._bootstrapMode == "login")
    {
      // Running in a WebView but using built artifacts:
      profileJsonFile = "js/profile-login.json";
    }
    else if (window.adf._bootstrapMode == "html")
    {
      profileJsonFile = "js/profile-html.json";
    }
    else
    {
      lastResortLogger("Error: unexpected window.adf._bootstrapMode: " + window.adf._bootstrapMode);
    }
  }
  var wwwPath = "";
  if (window.adf.wwwPath)
  {
    wwwPath = window.adf.wwwPath;
  }
  else
  {
    adf.wwwPath = "";
  }
  profileJsonFile = wwwPath + profileJsonFile;
  if (window.baseDebug) 
  {
    alert("Profile JSON File: " + profileJsonFile);
  }
  adf.mf.api.resourceFile.loadJsonFile(
    profileJsonFile,
    false,
    function(data)
    {
      if (window.baseDebug) 
      {
        alert("Successfully loaded the resources JSON file: " + profileJsonFile);
      }
      window.adf_base_success_log.push("Successfully loaded the resources JSON file: " + profileJsonFile);
      profile = data;
    },
    function(message)
    {
      if (window.baseDebug) 
      {
        alert("Unable to load the resources JSON file: " + profileJsonFile + "\nmessage: " + message);
      }
      lastResortLogger("Unable to load the resources JSON file: " + profileJsonFile + "; " + message);
    });
  if (profile == null)
  {
    // Must have a profile to set up the page
    lastResortLogger("Error: a profile is required to set up the base page");
    return;
  }

  // See if we're running in DT mode:
  var queryString = adf.mf.api.getQueryString();
  profile.dtMode = ("true" == adf.mf.api.getQueryStringParamValue(queryString, "amx_dtmode"));
  window.adf_base_success_log.push("dtMode: " + profile.dtMode);

  // Make the profile available for others to access:
  adf.mf.environment.profile = profile;

  if (profile.locale)
  {
    // Load the locale framework
    _loadJsResourceWithSourceUrl(wwwPath + profile.locale);
  }

  // Set the locale and reading direction:
  adf.mf.internal.locale.init();

  // Load the CSS resources from the profile:
  var cssResources = profile.cssResources;
  if (cssResources != null)
  {
    for (var i=0, length=cssResources.length; i<length; ++i)
    {
      var cssResource = cssResources[i];

      // We need to use a <link> tag so that the URLs in the CSS are preserved. If we were to
      // attempt to use a <style> tag and inject the content from the CSS file into the page, the
      // relative URLs would no longer work.
      var link = document.createElement("link");
      link.setAttribute("rel", "stylesheet");
      link.setAttribute("type", "text/css");
      link.setAttribute("href", wwwPath + cssResource);
      document.head.appendChild(link);
    }
  }

  if (profile.dtMode)
  {
    // Add a marker class so that DT-specific styles can be used.
    // Note that we can't use element.classList and have to use element.className
    // because the preview panel uses a much older version of WebKit.
    document.documentElement.className += " amx-dtmode";
  }

  // If "generateBaseHtml" is true, generate the 3 base DIVs:
  if (profile.generateBaseHtml)
  {
    var bodyPage = document.createElement("div");
    bodyPage.id = "bodyPage";
    document.body.appendChild(bodyPage);

    var header = document.createElement("div");
    header.setAttribute("data-role", "header");
    bodyPage.appendChild(header);

    // Add the loading indicator:
    var loading = document.createElement("div");
    loading.id = "amx-loading";
    loading.className = "amx-loading showing";
    document.body.appendChild(loading);

    // Add the WAI-ARIA live region for loading messages:
    var loadingMessage = document.createElement("div");
    loadingMessage.id = "amx-loading-live-region";
    loadingMessage.setAttribute("aria-atomic", "true");
    loadingMessage.setAttribute("aria-live", "assertive");
    loadingMessage.setAttribute("aria-relevant", "additions");
    var msgLoading = adf.mf.resource.getInfoString("AMXInfoBundle", "MSG_LOADING");
    if (msgLoading == null)
      msgLoading = "Loading";
    loadingMessage.textContent = msgLoading;
    var msgStyle = loadingMessage.style;
    msgStyle.width = "0px";
    msgStyle.height = "0px";
    msgStyle.overflow = "hidden";
    document.body.appendChild(loadingMessage);
  }

  // Load the JS resources from the profile:
  var jsResources = profile.jsResources;
  if (jsResources != null)
  {
    for (var i=0, length=jsResources.length; i<length; ++i)
    {
      var jsResource = jsResources[i];
      if (profile.dtMode && "js/adf.mf.device.integration.js" == jsResource)
      {
        // This file is not available in DT preview so skip it:
        continue;
      }
      else if (profile.dtMode && "js/cordova-2.2.0.js" == jsResource)
      {
        // This file is not available in DT preview so skip it:
        continue;
      }
      else
      {
        if (window.baseDebug)
        {
          alert("Profile JS Resource: " + wwwPath + jsResource);
        }
        _loadJsResourceWithSourceUrl(wwwPath + jsResource);
      }
    }
  }

  // If we are generating the base HTML and if we are not in design time or hosted modes, then
  // add a style class marker for the release/debug mode that is added to base-controller.js via
  // JSCompileTask.java and configurable via GeneralProperties.build.xml so that when a customer is
  // running their app in debug mode, they can easily see which mode they are using since debug mode
  // will be much slower than release mode:
  if (profile.generateBaseHtml && !profile.dtMode && devMode != "hosted")
  {
    var bodyPage = document.getElementById("bodyPage");
    if (bodyPage == null)
    {
      lastResortLogger("Failed to locate bodyPage");
    }
    else
    {
      if (adf.mf.internal.BUILD_CONFIGURATION == "release") // TODO skip for adf.mf.environment.profile.dtMode
      {
        bodyPage.className = "amx-release";
      }
      else // debug
      {
        bodyPage.className = "amx-debug";
      }
    }
  }

  if (devMode) // "dev" or "hosted"
  {
    // TODO (future) remove this and amx-core.js uses once amx.log goes away.
    amx.config.debug.enable = true; // TODO (future) if we keep it around, rename to "adf.mf.environment.profile.debug" instead
  }

  // Determine whether we are in mock data mode or not (requires the JS from the profile to be loaded first):
  adf.mf.environment.profile.mockData = (typeof adf.pg === "undefined");
  window.adf_base_success_log.push("mockData: " + profile.mockData);

  if (adf.mf.environment.profile.delayShowComplete) // this is an AMX page
  {
    // Add listener for "deviceready" if applicable:
    if (adf.mf.environment.profile.mockData)
    {
      adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "base", "onBaseLoad", window.adf_base_success_log.join("\n"));

      // Mock mode so just show the page immediately:
      adf.mf.internal.api.showFirstAmxPage();
    }
    else
    {
      // Device mode so wait for deviceready:
      adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "base", "onBaseLoad", "adding deviceready listener");
      adf.mf.internal.perf.perfTimings(false, false, true, "waiting for PG device ready event");
      document.addEventListener("deviceready", onBaseDeviceReady, false);
      adf.mf.internal.baseShowPageReady = true;
      _showFirstAmxPageIfReady();
    }

    // Note: amx-core calls adf.mf.internal.api.queueShowPageComplete when it hides the loading indicator for the first time
  }
  else // this is a non-AMX page (e.g. adf.login.html)
  {
    adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "base", "onBaseLoad", window.adf_base_success_log.join("\n"));
    document.addEventListener("deviceready", onBaseDeviceReady, false);
    adf.mf.internal.baseShowPageReady = true;
    _showFirstAmxPageIfReady();
  }
}

// ======= _loadJsResourceWithSourceUrl =======
function _loadJsResourceWithSourceUrl(jsResource)
{
  var filterFunction = null;
  filterFunction = function(responseText)
  {
    // Permit debugging of the source (currently only works in firebug, google chrome and webkit nightly).
    // Also note that using a filter function to load the JS file requires the file doesn't use any implicit
    // window variables/functions (it is good practice anyhow to avoid implicit code).
    responseText += "\n//@ sourceURL=" + jsResource;
    return responseText;
  };

  adf.mf.api.resourceFile.loadJsFile(
    jsResource,
    false,
    function()
    {
      if (window.baseDebug) 
      {
        alert("Successfully loaded JavaScript " + jsResource);
      }
      window.adf_base_success_log.push("Successfully loaded JavaScript " + jsResource);
    },
    function(message)
    {
      if (window.baseDebug) 
      {
        alert("Failed to load JS file: " + jsResource);
      }
      adf.mf.internal.log.lastResortLogger("Failed to load JS file: " + jsResource + ", " + message);
    },
    filterFunction);
}

// ======= onBaseDeviceReady =======
function onBaseDeviceReady()
{
  adf.mf.internal.baseDeviceReady = true;
  _showFirstAmxPageIfReady();
}

// ======= _showFirstAmxPageIfReady =======
function _showFirstAmxPageIfReady()
{
  // Only proceed if both the "deviceready" event occurred and
  // onBaseLoad has reached the point where we are ready to proceed:
  if (!adf.mf.internal.baseDeviceReady || !adf.mf.internal.baseShowPageReady)
    return; // not ready yet

  adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "base", "_showFirstAmxPageIfReady", window.adf_base_success_log.join("\n"));

  // Cordova has been initialized and is ready to roll:
  if (!adf.mf.environment.profile.dtMode)
  {
    if (window.Cordova)
    {
      if ((Cordova.sessionKey == 0) && (adf_mf_sessionKey != 0))
      {
        Cordova.sessionKey = adf_mf_sessionKey;
      }
      if (Cordova.sessionKey == 0)
      {
        var msg = "Cordova SessionKey is not initialized";
        adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "base", "_showFirstAmxPageIfReady", msg);
        adfc.internal.LogUtil.showAlert(msg);
      }
    }
  }
  adf.mf.internal.perf.perfTimings(false, false, true, "PG deviceready event received");
  adf.mf.log.Framework.logp(adf.mf.log.level.FINE, "base", "_showFirstAmxPageIfReady", "deviceready event received");

  if (adf.mf.environment.profile.delayShowComplete) // this is an AMX page
  {
    adf.mf.internal.api.showFirstAmxPage();
  }
  else // this is an HTML page
  {
    // We are done with showing the initial HTML for the page:
    adf.mf.internal.api.queueShowPageComplete();
  }
}

window.addEventListener("load", onBaseLoad, false);
