/* ------------------------------------------------------ */
/*
 * This file includes the utility methods for the dvtm module
 */
/* ------------------------------------------------------ */

DvtObj = function () {};
DvtObj["owner"] = window;
dvtm = {};

dvtm.canvasRendererLoaded = false;

// ------ jQuery Mobile Renderer ------ //
(function ()
{
  dvtm.AMX_NAMESPACE = 'http://xmlns.oracle.com/adf/mf/amx';
  dvtm.DVTM_NAMESPACE = 'http://xmlns.oracle.com/adf/mf/amx/dvt';

  dvtm.DEFAULT_CHART_WIDTH = 300;
  dvtm.DEFAULT_CHART_HEIGHT = 200;

  dvtm.DEFAULT_COMPONENT_SIZES = {
    'sparkChart' :
    {
      'width' : 300,
      'height' : 100
    },
    'ledGauge' :
    {
      'width' : 100,
      'height' : 80
    },
    'dialGauge' :
    {
      'width' : 150,
      'height' : 150
    },
    'statusMeterGauge' :
    {
      'width' : 300,
      'height' : 40
    },
    'ratingGauge' :
    {
      'width' : 160,
      'height' : 30,
      'max-height' : 50
    }
  }
  
  dvtm.COMPONENT_INSTANCE = '_jsComponentInstance';

  dvtm.LOADED_RB = {};
  
  dvtm.RESIZE_CALLBACKS = [];
  
  /**
   * register callback that will be notified on window change event
   * 
   * @param id unique identificator of this callback
   * @param callback callback immediately executed on window resize event - function has parameter event and should 
   *   return context which will be passed into postCallback (e.g. function (event){return {'contextinfo' : 'success'};})
   * @param postResizeCallback callback which is called when all callbacks are executed - function has one parameter and
   *   no return value. This parameter represents return value of function callback (e.g. function(context){}).
   *  
   * @author Tomas 'Jerry' Samek
   */
  dvtm.addResizeCallback = function(id, callback, postResizeCallback)
  {
    // register global window resize event listener only once
    if(!dvtm['__resizeHandlerRegistered'])
    {
      dvtm._registerResizeHandler();
      dvtm['__resizeHandlerRegistered'] = true;
    }

    // remove all other listeners under this id
    dvtm.removeResizeCallback(id);
    
    // add objects that represents resize handler
    dvtm.RESIZE_CALLBACKS.push({
      'id' : id,
      'callback' : function(event)
        {
          if(callback)
          {
            var result = callback(event);
            if(result)
            {
              return result;
            }
          }
          return {};
        },
      'postCallback' : function(context)
        {
          if(postResizeCallback)
          {
            postResizeCallback(context);
          }
        }
    });
  }

  /**
   * removes callback by specified id
   * @param id id of resize callback
   * 
   * @author Tomas 'Jerry' Samek
   */
  dvtm.removeResizeCallback = function(id)
  {
    var tempArray = [];
    var callbacks = dvtm._getResizeCallbacks();
    for(var i = 0; i < callbacks.length; i++)
    {
      if(callbacks[i]['id'] != id)
      {
        tempArray.push(callbacks[i]);
      }
    }
    dvtm.RESIZE_CALLBACKS = tempArray;
  }

  /**
   * @return array of resize handlers
   * 
   * @author Tomas 'Jerry' Samek
   */
  dvtm._getResizeCallbacks = function() 
  {
    return dvtm.RESIZE_CALLBACKS;
  }

  /**
   * registeres new window resize listener which notifies all our resize handlers
   * 
   * @author Tomas 'Jerry' Samek
   */
  dvtm._registerResizeHandler = function()
  {
    window.addEventListener('resize', function (event)
    {
      var callbacks = dvtm._getResizeCallbacks();
      var postCallbacks = [];
      // notify all handlers about window resize event and save their return context
      for(var i = 0; i < callbacks.length; i++)
      { 
        try
        {
          var returnContext = callbacks[i]['callback'](event);
          postCallbacks.push(callbacks[i]);
          // if there is no context then create new empty one
          if(!returnContext)
          {
            returnContext = {};
          }
          // add information about event
          returnContext['event'] = event;
          postCallbacks.push(returnContext);
        }
        catch(exception)
        {
          adf.mf.log.Framework.logp(adf.mf.log.level.SEVERE, 
              "dvtm.component", "resize.callback", "Exception: " + exception.message);
        }
      }
      // notify all postCallbacks with context from previous callbacks
      for(var j = 0; j < postCallbacks.length; j = j + 2)
      {
        try
        {
          postCallbacks[j]['postCallback'](postCallbacks[j + 1]);
        }
        catch(exception)
        {
          adf.mf.log.Framework.logp(adf.mf.log.level.SEVERE,
              "dvtm.component", "resize.postCallback", "Exception: " + exception.message);
        }
      }
    });
  }

  /**
   * Load DVT bundles based on user locale
   * @param url base url of Resource Bundle
   * @param loadCheck optional check if Bundle was properly loaded
   */
  dvtm.loadDvtResources = function (url, loadCheck)
  {
    if(typeof dvtm.LOADED_RB[url] !== "undefined")
    {
      // resource is already loaded or function tried to load this resource but failed
      return;
    }

    var _locale = adf.mf.locale.getUserLanguage();
    var localeList = adf.mf.locale.generateLocaleList(_locale, true);

    var callback = function (locale)
    {
      // store some information about state of loaded js
      dvtm.LOADED_RB[url] = (locale === null);
    }
    // function creates real path to js bundle
    var resourceBundleUrlConstructor = function (locale)
    {
      if (locale.indexOf("en") == 0)
      {
        return url + ".js";
      }
      return url + "_" + adf.mf.locale.getJavaLanguage(locale) + ".js";
    }

    var resourceBundleLoaded = function ()
    {
      // we have to leave additional check on caller funcion since Resource bundles are different in nature
      // and we don't know what kind of changes these bundles are doing.
      if (loadCheck)
      {
        return loadCheck();
      }
      // when there is no aditional check then js load success itself is resolved as complete success.
      return true;
    }

    dvtm._loadJavaScriptByLocale(localeList, resourceBundleUrlConstructor, resourceBundleLoaded, callback);
  }

  /**
   * Function looks for first Resource Bundle that is loadable and satisfies predicate function.
   * @param localeList list of possible locales
   * @param contructor function that contructs complete url by locale and bundle base url
   * @param predicate tells if Resource Bundle is loaded successfully
   * @param callback function which will be notified after this method is complete
   *
   */
  dvtm._loadJavaScriptByLocale = function (localeList, constructor, predicate, callback)
  {
    // clone the array before calling the load method since it will actually
    // modify the array as it searches    
    var clonedList = $.merge([], localeList);
    dvtm._loadJavaScriptByLocaleImpl(clonedList, constructor, predicate, callback);
  }

  /**
   * Function looks recursively for the first Resource Bundle that is loadable and satisfies predicate function.
   * @param localeList list of possible locales
   * @param contructor function that contructs complete url by locale and bundle base url
   * @param predicate tells if Resource Bundle is loaded successfully
   * @param callback function which will be notified after this method is complete
   *
   * function will notify callback wih null argument if no B is loaded in other case it will notify
   * callback function with locale of loaded bundle as a parameter.
   */
  dvtm._loadJavaScriptByLocaleImpl = function (localeList, constructor, predicate, callback)
  {
    if (localeList.length == 0)
    {
      callback(null);
      return;
    }
    var locale = localeList.pop();
    var url = constructor(locale);

    var dfd = amx.includeJs(url);
    if (dfd.isResolved() && predicate(locale))
    {
      callback(locale);
    }
    else 
    {
      dvtm._loadJavaScriptByLocaleImpl(localeList, constructor, predicate, callback);
    }
  }

  /**
   * Determinies if SVG rendering is available. Assuming it's true for all target platforms
   * except Android 2.x which supports canvas rendering only.
   */
  dvtm.isSvgAvailable = function ()
  {
    var agentId = DvtAgent.getAgent().getName();
    //console.log("AgentId: " + agentId);
    return (agentId.indexOf('android 2') < 0);
  }

  /**
   * Loads the canvas rendering support
   */
  dvtm.loadCanvasToolkitJs = function ()
  {
    if (!dvtm.canvasRendererLoaded)
    {
      var url = "js/toolkit/DvtCanvasToolkit.js";
      var dfd = amx.includeJs(url);
      dvtm.canvasRendererLoaded = dfd.isResolved();
    }
  }
  
  /**
   * sets up legends's outer div element
   */
  dvtm.setupLegendDiv = function (amxNode, contentDiv)
  {
    var $legendDiv = $('<div class="dvtm-legend" style="display:none;"><\/div>');
    contentDiv.append($legendDiv);
    
    var $legendTitleDiv = $('<div class="dvtm-legendTitle" style="display:none;"><\/div>');
    contentDiv.append($legendTitleDiv);
    
    var $legendSectionTitleDiv = $('<div class="dvtm-legendSectionTitle" style="display:none;"><\/div>');
    contentDiv.append($legendSectionTitleDiv);
        }
          
  /**
   * Sets properties of a legend.
   *
   * The following properties are supported:
   *   rendered        - tag attribute
   *   backgroundColor - style template
   *   borderColor     - style template
   *   position        - tag attribute
   *   scrolling       - tag attribute
   *   textStyle       - style template
   *   titleHalign     - tag attribute
   *   titleStyle      - style template
   *   title           - tag attribute
   */
  dvtm.setLegendProperties = function (amxNode, legendNode)
  {
    var options = amxNode["_optionsObj"];
    var data = amxNode["_dataObj"];
    var attr;

    // bug 16064023: legend position none should be replaced with rendered attribute
    // legend rendered - true, false 
    attr = legendNode.getAttribute('rendered');
    if (attr !== undefined && attr !== options['legend']['rendered'])
    {
      options['legend']['rendered'] = attr;
      dvtm.setOptionsDirty(amxNode, true);
    }    

    // legend position - auto, start, end, bottom, top, none
    attr = legendNode.getAttribute('position');
    if (attr !== undefined && attr !== options['legend']['position'])
    {
      if (attr === 'none' && !amx.isValueFalse(legendNode.getAttribute('rendered'))) 
      {
        options['legend']['rendered'] = false;
      }
      else 
      {
        options['legend']['position'] = attr;
      }
      dvtm.setOptionsDirty(amxNode, true);
    }

    // legend scrolling - off, on, asNeeded
    attr = legendNode.getAttribute('scrolling');
    if (attr !== undefined && attr !== options['legend']['scrolling'])
    {
      options['legend']['scrolling'] = attr;
      dvtm.setOptionsDirty(amxNode, true);
    }

    // legend title alignment - start, end, center
    attr = legendNode.getAttribute('titleHalign');
    if (attr !== undefined && attr !== options['legend']['titleHalign'])
    {
      options['legend']['titleHalign'] = attr;
      dvtm.setOptionsDirty(amxNode, true);
    }

    // legend section title alignment - start, end, center
    attr = legendNode.getAttribute('sectionTitleHalign');
    if (attr !== undefined && attr !== options['legend']['sectionTitleHalign'])
    {
      options['legend']['sectionTitleHalign'] = attr;
      dvtm.setOptionsDirty(amxNode, true);
    }

    // legend title
    attr = legendNode.getAttribute('title');
    if (attr)
    {
      data['legend']['title'] = attr;
    }
    // legend referenceObjectTitle
    attr = legendNode.getAttribute('referenceObjectTitle');
    if (attr)
    {
      data['legend']['referenceObjectTitle'] = attr;
    }
  }

  /**
   * returns the component width
   * 
   * @author Tomas 'Jerry' Samek
   */
  dvtm.getComponentWidth = function ($node, amxNode)
  {
    var width = $node.get(0).getAttribute('_computedwidth');
    if(!width || width < 1) 
    {
      width = $node.width();
    }

    if (width < 1)
    {
      // width not set or too small, try using parent width instead
      width = $node.parent().width();
    }
    // If the element width is non-zero, assume it has been set via css or derived
    // from document. Otherwise, return the default width for the chart type.
    var dimensions = dvtm.DEFAULT_COMPONENT_SIZES[amxNode.getTag().getName()];
    if(dimensions)
    {
      if (width < 1)
      {
        width = dimensions['width'];
      }
      else if (dimensions['max-width'] && width > dimensions['max-width'])
      {
        width = dimensions['max-width'];
      }
    }
    else if(width < 1)
    {
      width = dvtm.DEFAULT_CHART_WIDTH;
    }
    // store the node's width
    $node.get(0).setAttribute('_computedwidth', width);
    return width;
  }

  /**
   * returns the component height
   * 
   * @author Tomas 'Jerry' Samek
   */
  dvtm.getComponentHeight = function ($node, amxNode)
  {
    var simpleNode = $node.get(0);
    // try to read already computed height 
    var height = + simpleNode.getAttribute('_computedheight');
    if(!height || height < 1)
    {
      // height set in fixed units for example px
      height = + simpleNode.getAttribute('_userheight');
      if(!height)
      {
        height = 0;
      }
    }

    if (height < 1)
    {
      // height not set or too small, try using parent height instead
      var parentHeight = $node.parent().height();
      var nodePercentage = + simpleNode.getAttribute('_relativeheight');
      var totalPercentage = nodePercentage;
      
      var sibblingsAndMe = $node.parent().children();
      var myId = simpleNode['id']; 
      // subtracts all siblings with fixed width and tries to determin weight of
      // current component by its percentage height
      for(var i = 0; i < sibblingsAndMe.length; i++)
      {
        if(myId !== sibblingsAndMe[i]['id'])
        {
          var $sibbling = $(sibblingsAndMe[i]);
          // relative height in scope of all other components
          var sibblingRelHeight = sibblingsAndMe[i].getAttribute('_relativeheight');
          if($sibbling.height() < 1 || sibblingRelHeight)
          {
            var sibblingNodePercentage = + sibblingRelHeight;
            if(!sibblingNodePercentage || sibblingNodePercentage <= 0)
            {
              sibblingNodePercentage = + dvtm._parseStyleSize(sibblingsAndMe[i].style.height, true);
            }
            // add relative height of sibbling to total relative height
            totalPercentage = totalPercentage + sibblingNodePercentage;
            parentHeight = parentHeight + $sibbling.height();
          }
          // substract sibblings height and also its padding, border and margin
          parentHeight = parentHeight - $sibbling.outerHeight(true);
        }
      }
      // height is portion of the available parent height without fixed height components divided by weight
      // of this component in scope of all present components with relative height.
      height = parentHeight * (nodePercentage / totalPercentage);
    }
    // If the element height is non-zero, assume it has been set via css or derived
    // from document. Otherwise, return the default height for the chart type.
    var dimensions = dvtm.DEFAULT_COMPONENT_SIZES[amxNode.getTag().getName()];
    if(dimensions)
    {
      if (height < 1)
      {
        height = dimensions['height'];
      }
      else if(dimensions['max-height'] && height > dimensions['max-height'])
      {
        // constrain component max height
        height = dimensions['max-height'];
      }
    }
    if(height < 1)
    {
      height = dvtm.DEFAULT_CHART_HEIGHT;
    }
    // adjust and store the node's height
    simpleNode.setAttribute('_computedheight', height);
    $node.height(height);

    return height;
  }

  dvtm._parseStyleSize = function(strSize, percent)
  {
    if(strSize)
    {
      var index = strSize.indexOf(percent ? '%' : 'px');
      if(index > -1)
      {
        strSize = strSize.substring(0, index);
        var value = parseInt(strSize);
        if(value > 0)
        {
          return value;
        }
      }
    }
    return percent ? 100 : 0;
  }
  
  dvtm._getComputedStyle = function (node)
  {
    return window.getComputedStyle(node, null);
  }

  /**
   * build css style string
   */
  dvtm.buildCssStyleString = function (div)
  {
    var style = {};
    var styleString = "";
    var divStyle = dvtm._getComputedStyle(div);

    if (divStyle['font-family'])
    {
      style['fontFamily'] = divStyle['font-family'];
      styleString += "font-family: " + style['fontFamily'] + ";";
    }
    if (divStyle['font-size'])
    {
      style['fontSize'] = divStyle['font-size'];
      styleString += "font-size: " + style['fontSize'] + ";";
    }
    if (divStyle['font-weight'])
    {
      style['fontWeight'] = divStyle['font-weight'];
      styleString += "font-weight: " + style['fontWeight'] + ";";
    }
    if (divStyle['color'])
    {
      style['color'] = divStyle['color'];
      styleString += "color: " + style['color'] + ";";
    }
    if (divStyle['font-style'])
    {
      style['fontStyle'] = divStyle['font-style'];
      styleString += "font-style: " + style['fontStyle'] + ";";
    }
    // TODO more css properties to be added
    return styleString;
  }

  /**
   * Initialize all dvtm components.
   * 
   * @param $node root jquery node of this component
   * @param amxNode amxNode of this component
   * @param renderCallback function which will be notified about render request. This function has to have 
   *   parameters $node and amxNode (e.g. function($node, amxNode){}).
   * 
   * @author Tomas 'Jerry' Samek
   */
  dvtm.initDvtmComponent = function($node, amxNode, renderCallback)
  {
    var simpleNode = $node.get(0);
    var userHeight = dvtm._parseStyleSize(simpleNode.style.height);
    var userWidth = dvtm._parseStyleSize(simpleNode.style.width);
    // determin if height of this component if fixed or relative
    // we don't have to care about width since it's computed by webview itself properly
    if(userHeight > 0)
    {
      simpleNode.setAttribute('_userheight', userHeight);
    }
    else
    {
      var nodePercentage = dvtm._parseStyleSize(simpleNode.style.height, true);
      simpleNode.setAttribute('_relativeheight', nodePercentage);
    }
    $node.height(0);
    // register the resize handler in case we need to resize the chart later
    // listener should be registered only when at least one dimension is relative
    if(userWidth == 0 || userHeight == 0)
    {
      // resize called by parent containers
      $node.resize(amxNode, function (event)
        {
          // reset all computed value at first
          $node.get(0).removeAttribute('_computedheight');
          $node.get(0).removeAttribute('_computedwidth');
          // reset height of dom node
          $node.height(0);

          adf.mf.log.Framework.logp(adf.mf.log.level.INFO, "dvtm.component", "resize", "Re-rendering component due to a node resize event.");
          // call render callback to rerender component
          renderCallback($node, amxNode);
        });
      // resize callback called called when global window resize event occures
      var resizeCallback = function (event)
      {
        // reset all computed value at first
        var oldHeight = simpleNode.getAttribute('_computedheight');
        var oldWidth = simpleNode.getAttribute('_computedwidth');
        
        simpleNode.removeAttribute('_computedheight');
        simpleNode.removeAttribute('_computedwidth');
        // reset height of dom node
        $node.height(0);
        // return old values as a context
        return {'oldwidth' : oldWidth, 'oldheight' : oldHeight};
      };
      // callback called after all previsou resizeCallbacks are called
      var postResizeCallback = function(context)
      {
        // obtain infromation about new and old dimensions
        var newHeight = dvtm.getComponentHeight($node, amxNode);
        var oldHeight = context['oldheight'];

        var newWidth = dvtm.getComponentWidth($node, amxNode);
        var oldWidth = context['oldwidth'];
        // if dimensions are different then rerender component
        if(newHeight != oldHeight || newWidth != oldWidth)
        {
          adf.mf.log.Framework.logp(adf.mf.log.level.INFO, "dvtm.component", "postResizeCallback", "Re-rendering component due to a window resize event.");
          renderCallback($node, amxNode);
        }
      };
      // add previous callbacks 
      dvtm.addResizeCallback(amxNode.getId(), resizeCallback, postResizeCallback);
    }
  }

  /**
   * sets legend style properties based on CSS
   */
  dvtm.setCssBasedLegendProperties = function (node, amxNode)
  {
    var options = amxNode["_optionsObj"];
    var id = amxNode.getId();

    // escape colons in id
    id = id.replace(/\:/g, "\\:");

    // legend styles
    var legendDiv = node.querySelector(".dvtm-legend");
    var legendDivStyle = dvtm._getComputedStyle(legendDiv);
    if (legendDivStyle['background-color'])
      options['legend']['backgroundColor'] = legendDivStyle['background-color'];
    // By default the border color is black and 0px. Need to confirm that border width is not 0px before using the color. 
    if (legendDivStyle['border-top-width'] != '0px')
    {
      if (legendDivStyle['border-top-color'])// need to use specific border part, e.g. 'top'
        options['legend']['borderColor'] = legendDivStyle['border-top-color'];
    }
    var legendStyleString = this.buildCssStyleString(legendDiv);
    options['legend']['textStyle'] = legendStyleString;

    // legend title style
    var legendTitleDiv = node.querySelector(".dvtm-legendTitle");
    var legendTitleStyleString = this.buildCssStyleString(legendTitleDiv);
    options['legend']['titleStyle'] = legendTitleStyleString;

    // legend section title style
    var legendSectionTitleDiv = node.querySelector(".dvtm-legendSectionTitle");
    var legendSectionTitleStyleString = this.buildCssStyleString(legendSectionTitleDiv);
    options['legend']['sectionTitleStyle'] = legendSectionTitleStyleString;
  }

  /**
   * parses the attributeGroups node attributes and
   * updates the internal attributeGroups map
   *
   * attributeGroups has the following attributes
   *
   *   id    - optional (?)
   *   type  - list of marker attributes affected by the attributeGroup
   *           (attribute names separated by spaces)
   *   value - a key to group items by
   *
   * returns a reference to the   newly created or existing attribute group
   *
   */
  dvtm.processAttributeGroup = function (amxNode, marker, attrGroupsNode, index)
  {
    var attrGroups = amxNode["_attributeGroups"];

    // assuming attrGroup can have id, type and value attributes
    var id;

    if (attrGroupsNode.isAttributeDefined('id'))
    {
      id = attrGroupsNode.getAttribute('id');
    }
    else 
    {
      // if no id exists, we'll create one internally
      id = "__" + index;
    }

    // find the attr group by id,
    // if the attr group with this id doesn't exist yet, create it
    var g = 0;
    for (g = 0;g < attrGroups.length;g++)
    {
      if (attrGroups[g]['id'] === id)
        break;
    }

    var attrGrp;
    if (g >= attrGroups.length)
    {
      attrGrp = 
      {
        'id' : id, 'type' : attrGroupsNode.getAttribute('type'), 'items' : []
      };
      attrGroups.push(attrGrp);
    }
    else 
      attrGrp = attrGroups[g];

    // add new value, if unique
    var items = attrGrp['items'];
    var k = 0;
    for (k = 0;k < items.length;k++)
    {
      if (items[k]['value'] === attrGroupsNode.getAttribute('value'))
        break;// value exists, exit here
    }
    // new value, add it
    if (k >= items.length)
    {
      var item = 
      {
        'value' : attrGroupsNode.getAttribute('value')
      };
      // if this attributeGroup has a label, add it
      if (attrGroupsNode.isAttributeDefined('label') != undefined)
        item['label'] = attrGroupsNode.getAttribute('label');

      attrGrp['items'].push(item);
    }
    // add this attrGroupInfo to the current marker
    marker['attrGroups'].push(
    {
      'attrGroup' : attrGrp, 'valueIndex' : k
    });
  }

  /**
   * processes the legend node if present.
   */
  dvtm.processLegendNode = function (amxNode, legendNode)
  {
    dvtm.setLegendProperties(amxNode, legendNode);

    var children = legendNode.getChildren();
    for (var i = 0;i < children.length;i++)
    {
      if (children[i].getTag().getName() === 'legendSection')
      {
        dvtm.processLegendSection(amxNode, children[i]);
      }
    }
  }

  // TODO: legendSection processing has changed
  /**
   * processes the legendSection node
   */
  dvtm.processLegendSection = function (amxNode, legendSectionNode)
  {
    var data = amxNode["_dataObj"];
    var attrGroups = amxNode["_attributeGroups"];
    var agid;
    var ag;

    if (legendSectionNode.isAttributeDefined('source'))
    {
      agid = legendSectionNode.getAttribute('source');
      // find the corresponding attributeGroups info
      var g;
      for (g = 0;g < attrGroups.length;g++)
      {
        if (attrGroups[g]['id'] === agid)
        {
          ag = attrGroups[g];
          break;
        }
      }
      // if the group could not be found by id, nothing to do here
      if (g >= attrGroups.length)
      {
        return;
      }

      // attribute group found, copy the info into the section legend
      var section = 
      {
        'title' : legendSectionNode.getAttribute('title'), 'items' : []
      };
      for (var i = 0;i < ag['items'].length;i++)
      {
        var color = dvtm.getAttributeFromGroup(amxNode, "color", ag, i);
        var markerShape = dvtm.getAttributeFromGroup(amxNode, "shape", ag, i);
        // at the moment category and label are the same thing
        // TODO: text?
        //var item = {category: ag['items'][i]['value']};
        var item = 
        {
          'id' : ag['items'][i]['value']
        };

        // attributeGroup has an optional 'label' attribute, if missing use 'category' as label
        if (ag['items'][i]['label'] != undefined)
          item.text = ag['items'][i]['label'];
        else 
        //item.text = item.category;
          item.text = item['id'];

        if (color)
        {
          item['color'] = color;
        }
        if (markerShape)
        {
          item['markerShape'] = markerShape;
        }
        section['items'].push(item);
      }

      // add new legend section to the dataObject
      if (data['legend']["sections"] == undefined)
      {
        data['legend']["sections"] = [];
      }
      data['legend']['sections'].push(section);
    }
  }

  /**
   * @param amxNode object that holds styleDefaults on its options object
   * @param type type of attribute group that is requested
   * @param attrGroup attribute group itself
   * @param valueIndex index of requested default value from attribute group
   *
   * @return default value for attribute group on valueIndex position or null if type is not supported
   */
  dvtm.getAttributeFromGroup = function(amxNode, type, attrGroup, valueIndex) {

    // if the group provides the required type, resolve it
    if (attrGroup['type'].indexOf(type) >= 0)
    {
      var attrType;
 
      switch (type)
      {
        case 'shape':
          attrType = 'shapes';
          break;
        case 'color':
          attrType = 'colors';
          break;
        default:
          attrType = null;
      }

      if(attrType && amxNode['_optionsObj'] && amxNode['_optionsObj']['styleDefaults'])
      {
        var defaults = amxNode['_optionsObj']['styleDefaults'][attrType];          
        if(defaults != undefined && valueIndex > -1 && defaults.length > 0) 
        {            
          return defaults[valueIndex % defaults.length];
      }
    }
    }

    return null;
  }

  /**
   * Indicates whether the chart represented by the amxNode is a sparkChart
   */
  dvtm.isSparkChart = function (amxNode)
  {
    if (amxNode.getTag().getName() === 'sparkChart')
      return true;
    else 
      return false;
  }

  /**
   * Indicates whether the chart represented by the amxNode is a gauge
   */
  dvtm.isGauge = function (amxNode)
  {
    var tagName = amxNode.getTag().getName();
    if ((tagName === 'ledGauge') || (tagName === 'statusMeterGauge') || (tagName === 'dialGauge') || (tagName === 'ratingGauge'))
      return true;
    else 
      return false;
  }
  
  dvtm.isDialGauge = function (amxNode)
  {
    var tagName = amxNode.getTag().getName();
    if (tagName === 'dialGauge')
      return true;
    else 
      return false;
  }
  
  dvtm.isStatusMeterGauge = function (amxNode)
  {
    var tagName = amxNode.getTag().getName();
    if (tagName === 'statusMeterGauge')
      return true;
    else 
      return false;
  }

  dvtm.isRatingGauge = function (amxNode)
  {
    var tagName = amxNode.getTag().getName();
    if (tagName === 'ratingGauge')
      return true;
    else 
      return false;
  }
  
  /**
   * dumps a JavaScript object
   */
  dvtm.dumpObj = function (obj, name, indent, depth)
  { 
    if (indent === undefined)
    {
      indent = "";
    }
    if (depth === undefined)
      {
      depth = 0;
    }
    if (depth > 5)
        {
      return indent + name + ": <max dump depth exceeded!>\n";
        }
    if (typeof obj == "object")
        {
      var child = null;
      var output = indent + name + ": {\n";
      indent += "    ";
      for (var item in obj)
      {
        try 
        {
          child = obj[item];
        }
        catch (e)
        {
          child = "<unable to evaluate>";
        }
        if (typeof child == "object")
        {
          output += dvtm.dumpObj(child, item, indent, depth + 1);
        }
        else
        {
          if (typeof child == "string")
          {
            child = "\"" + child + "\"";
        }
          else if (child == null)
          {
            child = "<null>";
      }
          output += indent + item + ": " + child + "\n";
    }  
      }
      return output + indent + "}\n";
    }
    else 
    {
      return obj;
    }  
  }

  /**
   * Sets the flag indicating that the options object has been modified
   */
  dvtm.setOptionsDirty = function (amxNode, dirty)
  {
    amxNode["_optionsDirty"] = dirty;
  }

  /**
   * Indicates whether the options object has been modified
   */
  dvtm.isOptionsDirty = function (amxNode)
  {
    return amxNode["_optionsDirty"];
  }

  /**
   * Renderer for pointDataLayer and areaDataLayer
   */
  dvtm.dataLayerRenderer = 
  {
    'createChildrenNodes' : function (amxNode)
    {
      return dvtm.createDataLayerChildrenNodes(amxNode);
    },
    'visitChildren' : function (amxNode, visitContext, callback)
    {
      return dvtm.visitDataLayerChildrenNodes(amxNode, visitContext, callback);
    },
    'updateChildren' : function (amxNode, attributeChanges)
    {
      return dvtm.updateDataLayerChildrenNodes(amxNode, attributeChanges);
    },
    'isFlattenable' : function (amxNode)
    {
      return true;
    }
  }

  /**
   * Create a data layer's children AMX nodes
   */
  dvtm.createDataLayerChildrenNodes = function (amxNode)
  {
    // create a cache of rowKeys to be removed in case of model update
    amxNode['_currentRowKeys'] = [];

    var dataItems = amxNode.getAttribute("value");
    if (dataItems === undefined)
    {      
      if(amxNode.isAttributeDefined("value")) {
        // Mark it so the framework knows that the children nodes cannot be
        // created until the collection model has been loaded
        amxNode.setState(adf.mf.api.amx.AmxNodeStates["INITIAL"]);
        return true;
      }
      // value attribute is not defined and we are in no collection mode
      // expect that childTags has attributes set independently on collection
      var children = amxNode.getTag().getChildren();
      for (var i = 0; i < children.length; i++)
      {
        var childAmxNode = children[i].buildAmxNode(amxNode);   
        amxNode['_currentRowKeys'].push("" + (i + 1)); 
        amxNode.addChild(childAmxNode);
      }    
      amxNode.setState(adf.mf.api.amx.AmxNodeStates["ABLE_TO_RENDER"]);
      return true;
    }
    else if (dataItems == null)
    {
      // No items, nothing to do
      return true;
    }
    var varName = amxNode.getAttribute('var');
    var iter = adf.mf.api.amx.createIterator(dataItems);
    
    // copied from amx:listView - on refresh the component need to initiate
    // loading of rows not available in the cache
    if (iter.getTotalCount() > iter.getAvailableCount())
    {
      adf.mf.api.amx.showLoadingIndicator();
      //var currIndex = dataItems.getCurrentIndex();
      adf.mf.api.amx.bulkLoadProviders(dataItems, 0,  -1, function ()
      {
        try 
        {
          // Call the framework to have the new children nodes constructed.
          adf.mf.internal.amx.markNodeForUpdate(amxNode, { "value" : true });
        }
        finally 
        {
          adf.mf.api.amx.hideLoadingIndicator();
        }
      },
      function ()
      {
        adf.mf.api.adf.logInfoResource("AMXInfoMessageBundle", adf.mf.log.level.SEVERE, "createChildrenNodes", "MSG_ITERATOR_FIRST_NEXT_ERROR", req, resp);
        adf.mf.api.amx.hideLoadingIndicator();
      });

      amxNode.setState(adf.mf.api.amx.AmxNodeStates["INITIAL"]);
      return true;
    }
    
    while (iter.hasNext())
    {
      var item = iter.next();
      amxNode['_currentRowKeys'].push(iter.getRowKey());
      adf.mf.el.addVariable(varName, item);
      amxNode.createStampedChildren(iter.getRowKey(), null);
      adf.mf.el.removeVariable(varName);
    }

    amxNode.setState(adf.mf.api.amx.AmxNodeStates["ABLE_TO_RENDER"]);
    return true;
  }

  /**
   * Visits a data layer's children nodes
   */
  dvtm.visitDataLayerChildrenNodes = function (amxNode, visitContext, callback)
  {
    var dataItems = amxNode.getAttribute("value");
    if(dataItems === undefined && !amxNode.isAttributeDefined("value")) 
    {
      // visit child nodes in no collection mode since there is no value specified      
      var children = amxNode.getChildren();
      for (var i = 0;i < children.length;i++)
      {
        children[i].visit(visitContext, callback);
      }
      return true;
    }
    
    var iter = adf.mf.api.amx.createIterator(dataItems);
    var variableName = amxNode.getAttribute("var");

    while (iter.hasNext())
    {
      var item = iter.next();
      adf.mf.el.addVariable(variableName, item);
      try 
      {
        if (amxNode.visitStampedChildren(iter.getRowKey(), null, null, visitContext, callback))
          return true;
      }
      finally 
      {
        adf.mf.el.removeVariable(variableName);
      }
    }
    return false;
  }

  /**
   * Update a data layer's children nodes
   */
  dvtm.updateDataLayerChildrenNodes = function (amxNode, attributeChanges)
  {
    if (attributeChanges.hasChanged("value"))
    {
      // remove the old stamped children
      var children;
      var i, j;
      var iter;

      // create the new stamped children hierarchy
      var dataItems = amxNode.getAttribute("value");
      if (dataItems)
      {
        iter = adf.mf.api.amx.createIterator(dataItems);

        // copied from amx:listView - on refresh the component need to initiate
        // loading of rows not available in the cache
        if (iter.getTotalCount() > iter.getAvailableCount())
        {
          adf.mf.api.amx.showLoadingIndicator();
          //var currIndex = dataItems.getCurrentIndex();
          adf.mf.api.amx.bulkLoadProviders(dataItems, 0,  -1, function ()
          {
            try 
            {
              // Call the framework to have the new children nodes constructed.
              adf.mf.internal.amx.markNodeForUpdate(amxNode, { "value" : true });
            }
            finally 
            {
              adf.mf.api.amx.hideLoadingIndicator();
            }
          },
          function ()
          {
            adf.mf.api.adf.logInfoResource("AMXInfoMessageBundle", adf.mf.log.level.SEVERE, "updateChildrenNodes", "MSG_ITERATOR_FIRST_NEXT_ERROR", req, resp);
            adf.mf.api.amx.hideLoadingIndicator();
          });
          return adf.mf.api.amx.AmxNodeChangeResult["RERENDER"];
        }
      }
      
      if (amxNode["_currentRowKeys"] != undefined)
      {
        for (i = 0;i < amxNode["_currentRowKeys"].length;i++)
        {
          children = amxNode.getChildren(null, amxNode["_currentRowKeys"][i]);
          for (j = children.length - 1; j >= 0; j--) 
          {
            amxNode.removeChild(children[j]);  
          }          
        }
      }

      amxNode["_currentRowKeys"] = [];

      if (dataItems)
      {
        var varName = amxNode.getAttribute("var");
        iter = adf.mf.api.amx.createIterator(dataItems);
        while (iter.hasNext())
        {
          var item = iter.next();
          amxNode['_currentRowKeys'].push(iter.getRowKey());
          adf.mf.el.addVariable(varName, item);
          amxNode.createStampedChildren(iter.getRowKey(), null);
          adf.mf.el.removeVariable(varName);
        }
      }
    }
    return adf.mf.api.amx.AmxNodeChangeResult["RERENDER"];
  }

  /**
   * Finds the data layer node under the current amxNode by 'id'
   *
   * @param amxNode  parent amxNode
   * @param id  data layer node id
   * @return amxNode of the data layer node or null if not found
   */
  dvtm.findDataLayerNodeById = function (amxNode, id)
  {
    var children = amxNode.getChildren();
    var iter = adf.mf.api.amx.createIterator(children);
    var child;

    while (iter.hasNext())
    {
      child = iter.next();
      if (child.getId() == id)
        return child;
    }

    // nothing found at this level, go deeper
    iter = adf.mf.api.amx.createIterator(children);
    while (iter.hasNext())
    {
      child = iter.next();
      var result = dvtm.findDataLayerNodeById(child, id);
      if (result)
        return result;
    }
    // nothing found, return null
    return null;

  }

  /**
   * Finds the data layer id under the current amxNode's data object by layer 'index'
   *
   * @param amxNode  parent amxNode
   * @param dataLayerIdx  data layer node index
   * @return id of the data layer or null if not found
   */
  dvtm.findDataLayerIdByIndex = function (amxNode, dataLayerIdx)
  {
    if (amxNode != null && dataLayerIdx != null)
    {
      var data = amxNode["_dataObj"];
      var layers = data['dataLayers'];
      if (layers)
      {
        for (var i = 0;i < layers.length;i++)
        {
          var layer = layers[i];
          if (layer.idx == dataLayerIdx)
          {
            return layer.id;
          }
        }
      }
    }
    // nothing found, return null
    return null;
  }

  /**
   * checks if the node passed as the first parameter is the ancestor of the
   * node
   *
   * @param ancestorNode  the presumed ancestorNode
   * @param node  a presumed descendant of the ancestorNode
   * @return 'true' if node is a descendant of the ancestorNode
   *
   */
  dvtm.isAncestor = function (ancestorNode, node)
  {
    var parentNode = node.parentNode;

    while (parentNode)
    {
      if (parentNode == ancestorNode)
        return true;

      parentNode = parentNode.parentNode;
    }
    return false;
  }
  
  /**
   * Parses the string attribute that can have value 0.0-1.0 or 0.0%-100.0% and 
   * returns float 0.0-1.0, in case of any error 1.0  
   *
   * parameters
   *
   *   attribute - string that can be 0.0-1.0 or 0.0%-100.0%
   *
   * returns a float 0.0-1.0, in case of any error 1.0
   *
   */
  dvtm.processPercetageAttribute = function(attribute) 
  {
    // result, default value
    var fl = 1.0;
    // is attribute percentage
    var percentage = false;
    var attributeLength;
  
    if (attribute !== undefined && attribute !== null)
    {  
      // trim attribute
      attribute = attribute.replace(/(^\s*)|(\s*$)/g, '');
      // number of characteres of attribute
      attributeLength = attribute.length - 1;
      
      // is the attribute percentage
      if (attribute.charAt(attributeLength) === '%') 
      {
        // set flag
        percentage = true;
        // remove percentage character
        attribute = attribute.substr(0, attributeLength);
      }
    
      // try to parse float value from first part of attribute without '%'
      fl = parseFloat(attribute);
      
      // is parsed number valid?
      if (!isNaN(fl)) 
      {
        // convert percent to number
        if (percentage) fl /= 100.0;
        // check if number is 0.0-1.0
        if (fl < 0.0 || fl > 1.0) fl = 1.0;
      }
      else 
        // any error
        fl = 1.0;
    } 
    
    return fl;
  }
  
   /**
   * @param map
   * @param key 
   * @param defaultValue - optional
   * 
   * @return value from map for given key, defaultValue when there is no value for key in map. 
   *    If not specified, defaultValue is 'undefined';
   */
  dvtm.getValueByKeyWithDefault = function(map, key, defaultValue)
  {
    var value = undefined;
    if(map && key)
    {
      value = map[key];
    }
    if (value === undefined)
    {
      value = defaultValue;
    }
    return value;
  }

  dvtm.exception = {};
  
  /*
   * Represents any of the DVT flavored exceptions
   */
  dvtm.exception.DvtmException = function (message)
  {
    this.name = 'DvtmException';
    this.message = (message || "");
  };
  dvtm.exception.DvtmException.prototype = new Error();

  /*
   * Represents an exception when a node cannot be rendered due to missing data.
   */
  dvtm.exception.NodeNotReadyToRenderException = function (message)
  {
    this.name = 'NodeNotReadyToRenderException';
    this.message = (message || "Node not ready to render");
  };
  dvtm.exception.NodeNotReadyToRenderException.prototype = new Error();

})();
(function ()
{
  dvtm.DefaultChartStyle = 
  {
    // common chart properties
    'chart' : 
    {
      // text to be displayed, if no data is provided
      'emptyText' : null, 
      // animation effect when the data changes
      'animationOnDataChange' : "none", 
      // animation effect when the chart is displayed
      'animationOnDisplay' : "none", 
      // time axis type - disabled / enabled / mixedFrequency
      'timeAxisType' : "disabled"
    },

    // chart title separator properties
    'titleSeparator' : 
    {
      // separator upper color
      'upperColor' : "#74779A", 
      // separator lower color
      'lowerColor' : "#FFFFFF", 
      // should display title separator
      'rendered' : false
    },

    // chart legend properties
    'legend' : 
    {
      // legend position none / auto / start / end / top / bottom
      'position' : "auto"
    },

    // default style values
    'styleDefaults' : 
    {
      // default color palette
      'colors' : ["#003366", "#CC3300", "#666699", "#006666", "#FF9900", "#993366", "#99CC33", "#624390", "#669933", "#FFCC33", "#006699", "#EBEA79"], 
      // default marker shapes
      'shapes' : ['circle', 'square', 'plus', 'diamond', 'triangleUp', 'triangleDown', 'human'], 
      // series effect
      'seriesEffect' : "gradient", 
      // animation duration in ms
      'animationDuration' : 1000, 
      // animation indicators - all / none
      'animationIndicators' : "all", 
      // animation up color
      'animationUpColor' : "#0099FF", 
      // animation down color
      'animationDownColor' : "#FF3300", 
      // default line width (for line chart)
      'lineWidth' : 3, 
      // default line style (for line chart) - solid / dotted / dashed
      'lineStyle' : "solid", 
      // should markers be displayed (in line and area charts)
      'markerDisplayed' : false, 
      // default marker color
      'markerColor' : null, 
      // default marker shape
      'markerShape' : "auto", 
      // default marker size
      'markerSize' : 8, 
      // pie feeler color (pie chart only)
      'pieFeelerColor' : "#BAC5D6", 
      // slice label position and text type (pie chart only)
      'sliceLabel' : 
      {
        'position' : "outside", 'textType' : "percent"
      }
    }

  };

  dvtm.DEFAULT_AREA_DATA = 
  {
    'groups' : ["Group A", "Group B", "Group C", "Group D"], 
    'series' : [
        {name : "Series 1", data : [74, 42, 70, 46]},
        {name : "Series 2", data : [50, 58, 46, 54]},
        {name : "Series 3", data : [34, 22, 30, 32]},
        {name : "Series 4", data : [18, 6, 14, 22]}
    ]
  };

  dvtm.DEFAULT_BAR_DATA = 
  {
    'groups' : ["Group A", "Group B"], 
    'series' : [
        {name : "Series 1", data : [42, 34]},
        {name : "Series 2", data : [55, 30]},
        {name : "Series 3", data : [36, 50]},
        {name : "Series 4", data : [22, 46]},
        {name : "Series 5", data : [22, 46]}
    ]
  };

  dvtm.DEFAULT_LINE_DATA = 
  {
    'groups' : ["Group A", "Group B", "Group C", "Group D", "Group E"], 
    'series' : [
        {name : "Series 1", data : [74, 62, 70, 76, 66]},
        {name : "Series 2", data : [50, 38, 46, 54, 42]},
        {name : "Series 3", data : [34, 22, 30, 32, 26]},
        {name : "Series 4", data : [18, 6, 14, 22, 10]},
        {name : "Series 5", data : [3, 2, 3, 3, 2]}
    ]
  };

  dvtm.DEFAULT_BUBBLE_DATA = 
  {
    'groups' : ["Group A", "Group B", "Group C"], 
    'series' : [
        {name : "Series 1", data : [{x : 15, y : 25, z : 5},{x : 25, y : 30, z : 12},{x : 25, y : 45, z : 12}]},
        {name : "Series 2", data : [{x : 15, y : 15, z : 8},{x : 20, y : 35, z : 14},{x : 40, y : 55, z : 35}]},
        {name : "Series 3", data : [{x : 10, y : 10, z : 8},{x : 18, y : 55, z : 10},{x : 40, y : 50, z : 18}]},
        {name : "Series 4", data : [{x : 8, y : 20, z : 6},{x : 11, y : 30, z : 8},{x : 30, y : 40, z : 15}]}
    ]
  };

  dvtm.DEFAULT_SCATTER_DATA = 
  {
    'groups' : ["Group A", "Group B", "Group C"], 
    'series' : [
        {name : "Series 1", data : [{x : 15, y : 15},{x : 25, y : 43},{x : 25, y : 25}]},
        {name : "Series 2", data : [{x : 25, y : 15},{x : 55, y : 45},{x : 57, y : 47}]},
        {name : "Series 3", data : [{x : 17, y : 36},{x : 32, y : 52},{x : 26, y : 28}]},
        {name : "Series 4", data : [{x : 38, y : 22},{x : 43, y : 43},{x : 58, y : 36}]}
    ]
  };

  dvtm.DEFAULT_PIE_DATA = 
  {
    'groups' : [""], 
    'series' : [
        {id : "Series 1", name : "Series 1", data : [42]},
        {id : "Series 2", name : "Series 2", data : [55]},
        {id : "Series 3", name : "Series 3", data : [36]},
        {id : "Series 4", name : "Series 4", data : [22]},
        {id : "Series 5", name : "Series 5", data : [22]}
    ]
  };

  dvtm.DEFAULT_SPARK_DATA = [20, 25, 15, 10, 18, 15, 20, 15, 25, 30, 20, 18, 25, 28, 30];

  dvtm.DEFAULT_SPARK_OPTIONS = 
  {
    'type' : "line", 'color' : "#00FF00"
  };

  dvtm.DEFAULT_COMBO_DATA = dvtm.DEFAULT_BAR_DATA;

})();
/* ------------------------------------------------------ */
/*
 * This file includes the common tag processing methods for
 * the dvtm tag renderers.
 */
/* ------------------------------------------------------ */
(function ()
{
  /**
   * Common DVT chart type handler object
   */
  dvtm.CommonChart = function (chartType)
  {
    this._chartType = chartType;
  }

  /**
   * AMX 'createChildrenNodes' callback handler
   */
  dvtm.CommonChart.prototype.createChildrenNodes = function (amxNode)
  {
    return dvtm.createChartChildrenNodes(amxNode);
  }

  /**
   * AMX 'visitChildren' callback handler
   */
  dvtm.CommonChart.prototype.visitChildren = function (amxNode, visitContext, callback)
  {
    return dvtm.visitChartChildrenNodes(amxNode, visitContext, callback);
  }

  /**
   * AMX 'create' callback handler
   */
  dvtm.CommonChart.prototype.create = function (amxNode)
  {
    return dvtm.createCommonChart(amxNode, this._chartType);
  }

  /**
   * AMX 'init' callback handler
   */
  dvtm.CommonChart.prototype.init = function ($node, amxNode)
  {
    dvtm.initChartDomNode($node, amxNode);
  }

  /**
   * AMX 'postDisplay' callback handler
   */
  dvtm.CommonChart.prototype.postDisplay = function ($node, amxNode)
  {
    dvtm.renderChart($node, amxNode);
  }

  /**
   * AMX 'updateChildren' callback handler
   */
  dvtm.CommonChart.prototype.updateChildren = function (amxNode, attributeChanges)
  {
    return dvtm.updateChildrenNodes(amxNode, attributeChanges);
  }

  /**
   * AMX 'refresh' callback handler
   */
  dvtm.CommonChart.prototype.refresh = function (amxNode, attributeChanges)
  {
    return dvtm.refreshChart(amxNode, attributeChanges);
  }

  dvtm.CommonChart.prototype.destroy = function($node, amxNode)
  {
    dvtm.destroyChartDomNode($node, amxNode);
  }

  // register DVT chart type handlers
  amx.registerRenderers("dvtm", 
  {
    'areaChart' : new dvtm.CommonChart('area'),
    'barChart' : new dvtm.CommonChart('bar'),
    'bubbleChart' : new dvtm.CommonChart('bubble'),
    'comboChart' : new dvtm.CommonChart('combo'),
    'horizontalBarChart' : new dvtm.CommonChart('horizontalBar'),
    'lineChart' : new dvtm.CommonChart('line'),
    'pieChart' : new dvtm.CommonChart('pie'),
    'scatterChart' : new dvtm.CommonChart('scatter')
  });

  /**
   * Creates chart's children AMX nodes
   */
  dvtm.createChartChildrenNodes = function (amxNode)
  {
    // create a cache of rowKeys to be removed in case of model update      
    amxNode['_currentRowKeys'] = [];

    // we want to skip the value validation if we are in dt mode
    if (!amx.dtmode)
    {
      amxNode.setState(adf.mf.api.amx.AmxNodeStates["INITIAL"]);

      // see if the chart is bound to a collection
      if (!amxNode.isAttributeDefined('value'))
      {
        return true;
      }

      var dataItems = amxNode.getAttribute('value');

      if (dataItems === undefined || dataItems === null)
      {
        // no items, nothing to do
        return true;
      }

      var varName = amxNode.getAttribute('var');
      var iter = adf.mf.api.amx.createIterator(dataItems);

      // copied from amx:listView - on refresh the component need to initiate
      // loading of rows not available in the cache
      if (iter.getTotalCount() > iter.getAvailableCount())
      {
        adf.mf.api.amx.showLoadingIndicator();
        //var currIndex = dataItems.getCurrentIndex();
        adf.mf.api.amx.bulkLoadProviders(dataItems, 0,  - 1, function ()
        {
          try 
          {
            // Call the framework to have the new children nodes constructed.
            adf.mf.internal.amx.markNodeForUpdate(amxNode, 
            {
              "value" : true
            });
          }
          finally 
          {
            adf.mf.api.amx.hideLoadingIndicator();
          }
        },
        function ()
        {
          adf.mf.api.adf.logInfoResource("AMXInfoMessageBundle", adf.mf.log.level.SEVERE, "createChildrenNodes", "MSG_ITERATOR_FIRST_NEXT_ERROR", req, resp);
          adf.mf.api.amx.hideLoadingIndicator();
        });

        amxNode.setState(adf.mf.api.amx.AmxNodeStates["INITIAL"]);
        return true;
      }

      var facets = ['dataStamp', 'seriesStamp'];

      while (iter.hasNext())
      {
        var item = iter.next();
        amxNode['_currentRowKeys'].push(iter.getRowKey());
        adf.mf.el.addVariable(varName, item);
        amxNode.createStampedChildren(iter.getRowKey(), facets);
        adf.mf.el.removeVariable(varName);
      }
    }

    // assume multiple instances of each tag, but process only the first
    var legendTags = amxNode.getTag().getChildren(dvtm.DVTM_NAMESPACE, 'legend');
    if (legendTags.length > 0)
    {
      var legendNode = legendTags[0].buildAmxNode(amxNode);
      amxNode.addChild(legendNode);
    }

    if (dvtm.isPieChart(amxNode))
    {
      var pieValueFormatTags = amxNode.getTag().getChildren(dvtm.DVTM_NAMESPACE, 'pieValueFormat');
      if (pieValueFormatTags.length > 0)
      {
        var pieValueFormatNode = pieValueFormatTags[0].buildAmxNode(amxNode);
        amxNode.addChild(pieValueFormatNode);
      }
      var sliceLabelTags = amxNode.getTag().getChildren(dvtm.DVTM_NAMESPACE, 'sliceLabel');
      if (sliceLabelTags.length > 0)
      {
        var sliceLabelNode = sliceLabelTags[0].buildAmxNode(amxNode);
        amxNode.addChild(sliceLabelNode);
      }
    }
    else 
    {
      var xAxisTags = amxNode.getTag().getChildren(dvtm.DVTM_NAMESPACE, 'xAxis');
      if (xAxisTags.length > 0)
      {
        var xAxisNode = xAxisTags[0].buildAmxNode(amxNode);
        amxNode.addChild(xAxisNode);
      }
      var yAxisTags = amxNode.getTag().getChildren(dvtm.DVTM_NAMESPACE, 'yAxis');
      if (yAxisTags.length > 0)
      {
        var yAxisNode = yAxisTags[0].buildAmxNode(amxNode);
        amxNode.addChild(yAxisNode);
      }
      var y2AxisTags = amxNode.getTag().getChildren(dvtm.DVTM_NAMESPACE, 'y2Axis');
      if (y2AxisTags.length > 0)
      {
        var y2AxisNode = y2AxisTags[0].buildAmxNode(amxNode);
        amxNode.addChild(y2AxisNode);
      }
      var xFormatTags = amxNode.getTag().getChildren(dvtm.DVTM_NAMESPACE, 'xFormat');
      if (xFormatTags.length > 0)
      {
        var xFormatNode = xFormatTags[0].buildAmxNode(amxNode);
        amxNode.addChild(xFormatNode);
      }
      var yFormatTags = amxNode.getTag().getChildren(dvtm.DVTM_NAMESPACE, 'yFormat');
      if (yFormatTags.length > 0)
      {
        var yFormatNode = yFormatTags[0].buildAmxNode(amxNode);
        amxNode.addChild(yFormatNode);
      }
      var y2FormatTags = amxNode.getTag().getChildren(dvtm.DVTM_NAMESPACE, 'y2Format');
      if (y2FormatTags.length > 0)
      {
        var y2FormatNode = y2FormatTags[0].buildAmxNode(amxNode);
        amxNode.addChild(y2FormatNode);
      }
      var zFormatTags = amxNode.getTag().getChildren(dvtm.DVTM_NAMESPACE, 'zFormat');
      if (zFormatTags.length > 0)
      {
        var zFormatNode = zFormatTags[0].buildAmxNode(amxNode);
        amxNode.addChild(zFormatNode);
      }
    }

    amxNode.setState(adf.mf.api.amx.AmxNodeStates["ABLE_TO_RENDER"]);
    return true;
  }

  /**
   * Visits chart's children nodes
   */
  dvtm.visitChartChildrenNodes = function (amxNode, visitContext, callback)
  {
    var children = amxNode.getChildren();
    for (var i = 0;i < children.length;i++)
    {
      children[i].visit(visitContext, callback);
    }

    var dataItems = amxNode.getAttribute('value');

    if (dataItems === undefined)
    {
      return amxNode.visitStampedChildren(null, null, null, visitContext, callback);
    }

    var facets = ['dataStamp', 'seriesStamp'];

    var varName = amxNode.getAttribute('var');
    var iter = adf.mf.api.amx.createIterator(dataItems);

    while (iter.hasNext())
    {
      var item = iter.next();
      adf.mf.el.addVariable(varName, item);
      try 
      {
        if (amxNode.visitStampedChildren(iter.getRowKey(), facets, null, visitContext, callback))
        {
          return true;
        }
      }
      finally 
      {
        adf.mf.el.removeVariable(varName);
      }
    }
    return false;
  }

  dvtm.updateChildrenNodes = function (amxNode, attributeChanges)
  {
    // if inlineStyle has changed we need to recreate chart instance
    if (attributeChanges.hasChanged('inlineStyle'))
    {
      return adf.mf.api.amx.AmxNodeChangeResult['REPLACE'];
    }
    // if 'value' changed, need to rebuild the nodes hierarchy
    if (attributeChanges.hasChanged('value'))
    {
      // remove the old stamped children
      var children, child;
      var i, j;
      var iter;

      var dataItems = amxNode.getAttribute('value');

      if (dataItems === undefined || dataItems === null)
      {
        return adf.mf.api.amx.AmxNodeChangeResult['REPLACE'];
      }

      iter = adf.mf.api.amx.createIterator(dataItems);

      // copied from amx:listView - on refresh the component needs to initiate
      // loading of rows not available in the cache
      if (iter.getTotalCount() > iter.getAvailableCount())
      {
        adf.mf.api.amx.showLoadingIndicator();
        //var currIndex = dataItems.getCurrentIndex();
        adf.mf.api.amx.bulkLoadProviders(dataItems, 0,  -1, function ()
        {
          try 
          {
            // Call the framework to have the new children nodes constructed.
            adf.mf.internal.amx.markNodeForUpdate(amxNode, 
            {
              "value" : true
            });
          }
          finally 
          {
            adf.mf.api.amx.hideLoadingIndicator();
          }
        },
        function ()
        {
          adf.mf.api.adf.logInfoResource("AMXInfoMessageBundle", adf.mf.log.level.SEVERE, "updateChildren", "MSG_ITERATOR_FIRST_NEXT_ERROR", req, resp);
          adf.mf.api.amx.hideLoadingIndicator();
        });

        // cannot rebuild the structure yet, wating for dataa
        amxNode['_waitingForData'] = true;
        return adf.mf.api.amx.AmxNodeChangeResult['REFRESH'];
      }

      if (amxNode['_currentRowKeys'] != undefined)
      {
        for (i = 0; i < amxNode['_currentRowKeys'].length; i++)
        {
          children = amxNode.getChildren('dataStamp', amxNode['_currentRowKeys'][i]);
          for (j = children.length - 1; j >= 0; j--) 
          {
            amxNode.removeChild(children[j]);  
          }          
          children = amxNode.getChildren('seriesStamp', amxNode['_currentRowKeys'][i]);
          for (j = children.length - 1; j >= 0; j--) 
          {
            amxNode.removeChild(children[j]);  
          }          
        }
      }
      // clear the old rowKeys
      amxNode['_currentRowKeys'] = [];
      var facets = ['dataStamp', 'seriesStamp'];

      // create the new stamped children hierarchy
      dataItems = amxNode.getAttribute('value');
      if (dataItems)
      {
        var varName = amxNode.getAttribute('var');
        iter = adf.mf.api.amx.createIterator(dataItems);
        while (iter.hasNext())
        {
          var item = iter.next();
          amxNode['_currentRowKeys'].push(iter.getRowKey());
          adf.mf.el.addVariable(varName, item);
          amxNode.createStampedChildren(iter.getRowKey(), facets);
          adf.mf.el.removeVariable(varName);
        }
      }
    }

    return adf.mf.api.amx.AmxNodeChangeResult['REFRESH'];
  }

  /**
   * Common chart 'create' handler
   *
   * @param amxNode  current amxNode
   * @param chartType  type of chart to be created
   * @return  parent element/node representing the chart
   */
  dvtm.createCommonChart = function (amxNode, chartType)
  {
    dvtm.initChartAmxNode(amxNode);
    dvtm.setChartType(amxNode, chartType);
    dvtm.setCommonChartProperties(amxNode);

    var $content = dvtm.setupChartDiv(amxNode);

    // if no 'value' and stamps defined, assume the data was
    // set using the 'data' attribute and exit
    if (!amx.dtmode && !amxNode.isAttributeDefined('value'))
    {
      return $content;
    }

    try 
    {
      if (dvtm.isPieChart(amxNode))
      {
        dvtm.processPieChildTags(amxNode);
      }
      else 
      {
        dvtm.processChildTags(amxNode);
      }
    }
    catch (ex)
    {
      $content['_readyToRender'] = false;
      
      if (ex instanceof dvtm.exception.NodeNotReadyToRenderException)
      {
        adf.mf.log.Framework.logp(adf.mf.log.level.INFO, "dvtm.chart", "createCommonChart", ex);
      } else 
      {
        adf.mf.log.Framework.logp(adf.mf.log.level.SEVERE, "dvtm.chart", "createCommonChart", "Exception: " + ex.message);
      }
    }
    return $content;
  }

  /**
   * re-renders the chart. Supposed to be called from the 'refresh' callback.
   *
   * @param amxNode current amxNode to be refreshed
   * @param attributeChanges changed attributes
   */
  dvtm.refreshChart = function (amxNode, attributeChanges)
  {
    // if data fetch was previously requested, do not refresh yet
    if (amxNode['_waitingForData'] !== undefined && amxNode['_waitingForData'])
    {
      amxNode['_waitingForData'] = false;
      return;
    }

    var $node = $(document.getElementById(amxNode.getId()));

    $node['_readyToRender'] = true;
    
    dvtm.initChartAmxNodeForRefresh(amxNode, attributeChanges);
    dvtm.setCommonChartProperties(amxNode);

    try 
    {
      if (dvtm.isPieChart(amxNode))
      {
        dvtm.processPieChildTags(amxNode);
      }
      else if (dvtm.isSparkChart(amxNode))
      {
        dvtm.processSparkChildTags(amxNode);
      }
      else 
      {
        dvtm.processChildTags(amxNode);
      }
      // now re-render the chart
      dvtm.renderChart($node, amxNode);
    }
    catch (ex)
    {
      $node['_readyToRender'] = false;

      if (ex instanceof dvtm.exception.NodeNotReadyToRenderException)
      {
        adf.mf.log.Framework.logp(adf.mf.log.level.INFO, "dvtm.chart", "refreshChart", ex);
      } else 
      {
        adf.mf.log.Framework.logp(adf.mf.log.level.SEVERE, "dvtm.chart", "refreshChart", "Exception: " + ex.message);
      }
    }
  }

  /**
   * processes the node representing the axis tag
   *
   * @param amxNode  the current amxNode
   * @param axisNode amxNode representing the axis tag
   * @param axisId   the axis name (xAxis, yAxis, or y2Axis)
   */
  dvtm.processAxisNode = function (amxNode, axisNode, axisId)
  {
    var children = axisNode.getChildren();
    var tickLabelDone = false, axisLineDone = false;
    var majorTickDone = false, minorTickDone = false;

    dvtm.setAxisProperties(amxNode, axisNode, axisId);

    for (var i = 0;i < children.length;i++)
    {
      switch (children[i].getTag().getName())
      {

        case 'referenceObject':
          dvtm.processReferenceObj(amxNode, children[i], axisId);
          break;

        case 'tickLabel':
          if (!tickLabelDone)
          {
            dvtm.processTickLabel(amxNode, children[i], axisId);
            tickLabelDone = true;
          }
          break;

        case 'axisLine':
          if (!axisLineDone)
          {
            dvtm.processAxisLine(amxNode, children[i], axisId);
            axisLineDone = true;
          }
          break;

        case 'majorTick':
          if (!majorTickDone)
          {
            dvtm.processTick(amxNode, children[i], axisId, true);
            majorTickDone = true;
          }
          break;

        case 'minorTick':
          if (!minorTickDone)
          {
            dvtm.processTick(amxNode, children[i], axisId, false);
            minorTickDone = true;
          }
          break;

        default :
          break;
      }
    }
  }

  /**
   * processes the format tag
   *
   * @param amxNode  the current amxNode
   * @param formatNode  amxNode representing the format tag
   * @param formatId   where to apply the format (xFormat, yFormat, y2Format, zFormat)
   */
  dvtm.processFormatNode = function (amxNode, formatNode, formatId)
  {
    var formatOptions;

    switch (formatId)
    {
      case 'xFormat':
        formatOptions = amxNode["_optionsObj"]['styleDefaults']['x1Format'];
        break;
      case 'yFormat':
        formatOptions = amxNode["_optionsObj"]['styleDefaults']['y1Format'];
        break;
      case 'y2Format':
        formatOptions = amxNode["_optionsObj"]['styleDefaults']['y2Format'];
        break;
      case 'zFormat':
        formatOptions = amxNode["_optionsObj"]['styleDefaults']['zFormat'];
        break;
      default :
        return;
    }

    // TODO: review the converter code, may not work like this in the new impl
    var converter = formatNode.getConverter();
    if (converter)
      formatOptions['converter'] = converter;
  }

  /**
   * processSimpleChildTags processes non-data child tags such as legend, axes and formats
   */
  dvtm.processSimpleChildTags = function (amxNode)
  {
    var legendDone = false;
    var xAxisDone = false, yAxisDone = false, y2AxisDone = false;
    var xFormatDone = false, yFormatDone = false, y2FormatDone = false, zFormatDone = false;

    var children = amxNode.getChildren();

    for (var i = 0;i < children.length;i++)
    {
      switch (children[i].getTag().getName())
      {
        case 'legend':
          if (!legendDone)
          {
            dvtm.processLegendNode(amxNode, children[i]);
            legendDone = true;
          }
          break;
        case 'xAxis':
          if (!xAxisDone)
          {
            dvtm.processAxisNode(amxNode, children[i], 'xAxis');
            xAxisDone = true;
          }
          break;
        case 'yAxis':
          if (!yAxisDone)
          {
            dvtm.processAxisNode(amxNode, children[i], 'yAxis');
            yAxisDone = true;
          }
          break;
        case 'y2Axis':
          if (!y2AxisDone)
          {
            dvtm.processAxisNode(amxNode, children[i], 'y2Axis');
            y2AxisDone = true;
          }
          break;
        case 'xFormat':
          if (!xFormatDone)
          {
            dvtm.processFormatNode(amxNode, children[i], 'xFormat');
            xFormatDone = true;
          }
          break;
        case 'yFormat':
          if (!yFormatDone)
          {
            dvtm.processFormatNode(amxNode, children[i], 'yFormat');
            yFormatDone = true;
          }
          break;
        case 'y2Format':
          if (!y2FormatDone)
          {
            dvtm.processFormatNode(amxNode, children[i], 'y2Format');
            y2FormatDone = true;
          }
          break;
        case 'zFormat':
          if (!zFormatDone)
          {
            dvtm.processFormatNode(amxNode, children[i], 'zFormat');
            zFormatDone = true;
          }
          break;
        default :
          break;
      }
    }
  }

  /**
   * processes the dataStamp facet
   */
  dvtm.processDataStamp = function (amxNode)
  {
    var varName = amxNode.getAttribute('var');// need to use this since var is reserved
    var value = amxNode.getAttribute('value');

    var dataStampTag = amxNode.getTag().getChildFacetTag('dataStamp');

    // no data stamp, nothing to do
    if (!dataStampTag)
    {
      return;
    }

    var iter = adf.mf.api.amx.createIterator(value);
    while (iter.hasNext())
    {
      var stamp = iter.next();
      adf.mf.el.addVariable(varName, stamp);

      var chartDataItemNodes = amxNode.getChildren('dataStamp', iter.getRowKey());

      var iter2 = adf.mf.api.amx.createIterator(chartDataItemNodes);
      while (iter2.hasNext())
      {
        var markerNode = iter2.next();
        
        if (markerNode.isAttributeDefined('rendered') && amx.isValueFalse(markerNode.getAttribute('rendered')))
          continue;         // skip unrendered nodes
        // if the node includes unresolved attributes, no point to proceed
        if (!markerNode.isRendered()) 
        {
          throw new dvtm.exception.NodeNotReadyToRenderException;
        }

        // process marker attributes
        var marker = dvtm.processMarker(amxNode, markerNode, stamp);

        if (marker != null)
        {
          var attributeGroupsNodes = markerNode.getChildren();
          var index = 0;
          var iter3 = adf.mf.api.amx.createIterator(attributeGroupsNodes);
          while (iter3.hasNext())
          {
            var attrGroupsNode = iter3.next();
            
            if (attrGroupsNode.isAttributeDefined('rendered') && amx.isValueFalse(attrGroupsNode.getAttribute('rendered')))
              continue;         // skip unrendered nodes
              
            if (!attrGroupsNode.isRendered())
            {
              throw new dvtm.exception.NodeNotReadyToRenderException;
            }
            dvtm.processAttributeGroup(amxNode, marker, attrGroupsNode, index);
            index++;
          }
        }
      }
      adf.mf.el.removeVariable(varName);
    }
  }

  /*
     * processes the seriesStamp facet
     */
  dvtm.processSeriesStamp = function (amxNode)
  {
    var varName = amxNode.getAttribute("var");
    var value = amxNode.getAttribute("value");
    var chartType = dvtm.getChartType(amxNode);

    if ((chartType === 'area' || chartType === 'bar' || chartType === 'combo' || chartType === 'horizontalBar' || chartType === 'line') && amxNode.getTag().getChildFacetTag('seriesStamp') && (varName !== undefined))
    {

      var iter = adf.mf.api.amx.createIterator(value);

      while (iter.hasNext())
      {
        var seriesStamp = iter.next();

        adf.mf.el.addVariable(varName, seriesStamp);

        var seriesStyleNodes = amxNode.getChildren('seriesStamp', iter.getRowKey());
        var iter2 = adf.mf.api.amx.createIterator(seriesStyleNodes);

        while (iter2.hasNext())
        {
          var seriesStyleNode = iter2.next();
          // make sure we really have a seriesStyle node, ignore other node types
          if (seriesStyleNode.getTag().getName() === 'seriesStyle')
          {
            if (seriesStyleNode.isAttributeDefined('rendered') && amx.isValueFalse(seriesStyleNode.getAttribute('rendered')))
              continue;
            if (!seriesStyleNode.isRendered()) 
            {
              throw new dvtm.exception.NodeNotReadyToRenderException;
            }
            dvtm.processSeriesStyle(amxNode, seriesStyleNode);
          }
        }
        adf.mf.el.removeVariable(varName);
      }
    }
  }

  /**
   * processes the chart's child tags
   */
  dvtm.processChildTags = function (amxNode)
  {
    var chartType = dvtm.getChartType(amxNode);
    var data = amxNode["_dataObj"];

    // in DT mode, just set the static data, process legend, axis,
    // and format tags and return
    if (amx.dtmode)
    {

      switch (chartType)
      {
        case 'area':
          data['groups'] = dvtm.DEFAULT_AREA_DATA['groups'];
          data['series'] = dvtm.DEFAULT_AREA_DATA['series'];
          break;
        case 'bar':
          data['groups'] = dvtm.DEFAULT_BAR_DATA['groups'];
          data['series'] = dvtm.DEFAULT_BAR_DATA['series'];
          break;
        case 'bubble':
          data['groups'] = dvtm.DEFAULT_BUBBLE_DATA['groups'];
          data['series'] = dvtm.DEFAULT_BUBBLE_DATA['series'];
          break;
        case 'combo':
          data['groups'] = dvtm.DEFAULT_COMBO_DATA['groups'];
          data['series'] = dvtm.DEFAULT_COMBO_DATA['series'];
          break;
        case 'horizontalBar':
          data['groups'] = dvtm.DEFAULT_BAR_DATA['groups'];
          data['series'] = dvtm.DEFAULT_BAR_DATA['series'];
          break;
        case 'line':
          data['groups'] = dvtm.DEFAULT_LINE_DATA['groups'];
          data['series'] = dvtm.DEFAULT_LINE_DATA['series'];
          break;
        case 'scatter':
          data['groups'] = dvtm.DEFAULT_SCATTER_DATA['groups'];
          data['series'] = dvtm.DEFAULT_SCATTER_DATA['series'];
          break;
        default :
        // no DT support for other chart types
          break;
      }

      dvtm.processSimpleChildTags(amxNode);
    }
    else 
    {
      // RT mode only
      adf.mf.internal.perf.start("dvtm.processChildTags", amxNode.getTag().getName());

      if (!amxNode['_refreshing'] || amxNode['_attributeChanges'].hasChanged('value'))
      {
        dvtm.processDataStamp(amxNode);
        dvtm.applyMarkersToModel(amxNode);

        dvtm.processSeriesStamp(amxNode);
      }
      dvtm.processSimpleChildTags(amxNode);

      adf.mf.internal.perf.stop("dvtm.processChildTags", amxNode.getTag().getName());
    }
  }

  /**
   * Processes pieChart child tags
   */
  dvtm.processPieChildTags = function (amxNode)
  {
    var options = amxNode["_optionsObj"];
    var data = amxNode["_dataObj"];
    var value = amxNode.getAttribute('value');
    var varName = amxNode.getAttribute('var');
    var attr;

    // resolve pieChart specific properties here
    attr = amxNode.getAttribute('threeDEffect');
    if (attr !== undefined && attr !== options['styleDefaults']['threeDEffect'])
    {
      options['styleDefaults']['threeDEffect'] = attr;
      dvtm.setOptionsDirty(amxNode, true);
    }
    
    attr = amxNode.getAttribute('otherThreshold');
    if (attr !== undefined && attr !== options['chart']['otherThreshold']) {
      options['chart']['otherThreshold'] = dvtm.processPercetageAttribute(attr);
      dvtm.setOptionsDirty(amxNode, true);
    }

    attr = amxNode.getAttribute('otherColor');
    if (attr !== undefined && attr !== options['styleDefaults']['otherColor']) {
      options['styleDefaults']['otherColor'] = attr;
      dvtm.setOptionsDirty(amxNode, true);
    }
    
    attr = amxNode.getAttribute('sorting');
    if (attr !== undefined && attr !== options['chart']['sorting']) {
      options['chart']['sorting'] = attr;
      dvtm.setOptionsDirty(amxNode, true);
    }        

    var children = amxNode.getChildren();
    var sliceLabelDone = false, pieValueFormatDone = false, legendDone = false;

    for (var i = 0;i < children.length;i++)
    {

      switch (children[i].getTag().getName())
      {
        case 'sliceLabel':
          if (!sliceLabelDone)
          {
            dvtm.processSliceLabel(amxNode, children[i]);
            sliceLabelDone = true;
          }
          break;
        case 'pieValueFormat':
          if (!pieValueFormatDone)
          {
            dvtm.processPieValueFormat(amxNode, children[i]);
            pieValueFormatDone = true;
          }
          break;
        case 'legend':
          if (!legendDone)
          {
            dvtm.processLegendNode(amxNode, children[i]);
            legendDone = true;
          }
          break;
        default :
          break;
      }
    }

    if (amx.dtmode)
    {
      // in DT mode, do not try to resolve data item values,
      // just set the default static data and return
      data['groups'] = dvtm.DEFAULT_PIE_DATA['groups'];
      data['series'] = dvtm.DEFAULT_PIE_DATA['series'];

      return;
    }

    if (value == undefined)
    {
      return;
    }

    var dataStampTag = amxNode.getTag().getChildFacetTag('dataStamp');

    // no data stamp, nothing to do
    if (!dataStampTag)
    {
      return;
    }

    adf.mf.internal.perf.start("dvtm.processPieChildTags", amxNode.getTag().getName());

    if (!amxNode['_refreshing'] || amxNode['_attributeChanges'].hasChanged('value'))
    {
      // currently, pie chart has no real groups, set one empty group
      data['groups'].push("");

      var iter = adf.mf.api.amx.createIterator(value);
      while (iter.hasNext())
      {
        var stamp = iter.next();
        adf.mf.el.addVariable(varName, stamp);

        var pieDataItemNodes = amxNode.getChildren('dataStamp', iter.getRowKey());

        var iter2 = adf.mf.api.amx.createIterator(pieDataItemNodes);
        while (iter2.hasNext())
        {
          var pieDataItemNode = iter2.next();

          if (pieDataItemNode.isAttributeDefined('rendered') && amx.isValueFalse(pieDataItemNode.getAttribute('rendered')))
            continue;         // skip unrendered nodes
            
          // if the node includes unresolved attributes, no point to proceed
          if (!pieDataItemNode.isRendered()) 
          {
            throw new dvtm.exception.NodeNotReadyToRenderException;
          }
          
          var sliceId;
          if (pieDataItemNode.isAttributeDefined('sliceId'))
          {
            sliceId = pieDataItemNode.getAttribute('sliceId');
          }
          else 
          {
            sliceId = pieDataItemNode.getAttribute('label');
          }

          var val = pieDataItemNode.getAttribute('value');
          var action;

          if (pieDataItemNode.isAttributeDefined('action'))
          {
            action = pieDataItemNode.getAttribute('action');
          }
          else 
          {
            var actionTags;
            var firesAction = false;
            // should fire action, if there are any 'setPropertyListener' or 'showPopupBehavior' child tags  
            actionTags = pieDataItemNode.getTag().findTags(dvtm.AMX_NAMESPACE, 'setPropertyListener');
            if (actionTags.length > 0)
              firesAction = true;
            else 
            {
              actionTags = pieDataItemNode.getTag().findTags(dvtm.AMX_NAMESPACE, 'showPopupBehavior');
              if (actionTags.length > 0)
                firesAction = true;
            }
            if (firesAction)
            {
              // need to set 'action' to some value to make the event fire
              action = stamp.rowKey();
            }
          }
          var dataItem = {};
          
          dataItem['y'] =  + val;
          
          if (action != undefined)
          {
            dataItem['action'] = action;
          }

          dataItem['id'] = pieDataItemNode.getId();

          var slice = 
          {
            'id' : sliceId, 'name' : pieDataItemNode.getAttribute('label'), 'data' : [dataItem]
          };

          if (pieDataItemNode.isAttributeDefined('explode'))
          {
            slice['pieSliceExplode'] = pieDataItemNode.getAttribute('explode');
          }
          if (pieDataItemNode.isAttributeDefined('color'))
          {
            slice['color'] = pieDataItemNode.getAttribute('color');
          }
          dvtm.addSeriesItem(amxNode, slice);

          // add rowKey to the cache for data selection callbacks
          var rowKeyCache = amxNode['_rowKeyCache'];
          rowKeyCache[dataItem['id']] = stamp.rowKey();
        }
        //make sure to clean the variable
        adf.mf.el.removeVariable(varName);
      }
    }

    adf.mf.internal.perf.stop("dvtm.processPieChildTags", amxNode.getTag().getName());
  }

  /**
   *  Instead of parsing value renderer preparse dummy data for spark graph.
   */
  dvtm.processSparkDummyData = function (amxNode)
  {
    if (amxNode["_dataObj"]['items'] == undefined)
    {
      amxNode["_dataObj"]['items'] = [];
    }

    // if color is not set than renderer sets default graph type.
    // Renderer also ignores el expressions.
    if (amxNode['_optionsObj']['type'] == undefined || amxNode['_optionsObj']['type'].indexOf("#{") == 0)
    {
      amxNode['_optionsObj']['type'] = dvtm.DEFAULT_SPARK_OPTIONS['type'];
    }

    // if color is not set than renderer sets default color.
    // Renderer also ignores el expressions.
    if (amxNode['_optionsObj']['color'] == undefined || amxNode['_optionsObj']['color'].indexOf("#{") == 0)
    {
      amxNode['_optionsObj']['color'] = dvtm.DEFAULT_SPARK_OPTIONS['color'];
    }

    // renderer prepares data for graph based with default marker setting.
    var items = amxNode["_dataObj"]['items'];

    var iter = adf.mf.api.amx.createIterator(dvtm.DEFAULT_SPARK_DATA);

    while (iter.hasNext())
    {
      var item = 
      {
      };

      item['markerDisplayed'] = false;
      item['rendered'] = true;
      item['value'] = iter.next();

      items.push(item);
    }
  }

  /**
   * Processes sparkChart child tags
   */
  dvtm.processSparkChildTags = function (amxNode)
  {
    var varName = amxNode.getAttribute('var');// need to use this since var is reserved
    var value = amxNode.getAttribute('value');
    var iter;

    adf.mf.internal.perf.start("dvtm.processSparkChildTags", amxNode.getTag().getName());

    var children = amxNode.getChildren();
    iter = adf.mf.api.amx.createIterator(children);

    while (iter.hasNext())
    {
      var child = iter.next();
      // ignore all children except referenceObjects
      if (child.getTag().getName() === 'referenceObject')
      {
        dvtm.processReferenceObj(amxNode, child, 'spark');
      }
    }

    if (!amxNode['_refreshing'] || amxNode['_attributeChanges'].hasChanged('value'))
    {
      // if no 'value' and stamps defined, assume the data was
      // set using the 'data' attribute and exit
      if (!amxNode.isAttributeDefined('value'))
      {
        return;
      }

      var dataStampTag = amxNode.getTag().getChildFacetTag('dataStamp');

      // no data stamp, nothing to do
      if (!dataStampTag)
      {
        return;
      }

      iter = adf.mf.api.amx.createIterator(value);
      while (iter.hasNext())
      {
        var stamp = iter.next();
        adf.mf.el.addVariable(varName, stamp);

        var sparkDataItemNodes = amxNode.getChildren('dataStamp', iter.getRowKey());

        var iter2 = adf.mf.api.amx.createIterator(sparkDataItemNodes);
        while (iter2.hasNext())
        {
          var sparkItemNode = iter2.next();

          if (sparkItemNode.isAttributeDefined('rendered') && amx.isValueFalse(sparkItemNode.getAttribute('rendered')))
            continue;         // skip unrendered nodes
            
          // if the node includes unresolved attributes, no point to proceed
          if (!sparkItemNode.isRendered()) 
          {
            throw new dvtm.exception.NodeNotReadyToRenderException;
          }          
          dvtm.processSparkDataItem(amxNode, sparkItemNode);
        }
        adf.mf.el.removeVariable(varName);
      }
    }

    adf.mf.internal.perf.stop("dvtm.processSparkChildTags", amxNode.getTag().getName());
  }

  /**
   * Loads chart/gauge resource bundles by locale
   */
  dvtm.loadChartResourceBundles = function ()
  {
    if (!amx.dtmode)
    {
      var resourceBundleLoadCheck = function ()
      {
        return typeof DvtChartBundle_RB !== "undefined";
      }
      dvtm.loadDvtResources("js/toolkit/resource/DvtChartBundle", resourceBundleLoadCheck);
    }
  }

  /**
   * Initializes the chart amxNode with the default dataObject and optionsObject.
   * Should be called as the first thing in tag:create.
   */
  dvtm.initChartAmxNode = function (amxNode)
  {
    amxNode["_optionsObj"] = 
    {
      'chart' : {},
      'titleSeparator' : 
      {
        'rendered' : false
      },
      'title' : {},
      'subtitle' : {},
      'footnote' : {},
      'legend' : {},
      'xAxis' : 
      {
        'tickLabel' : {},
        'axisLine' : {}
      },
      'yAxis' : 
      {
        'tickLabel' : {},
        'axisLine' : {}
      },
      'y2Axis' : 
      {
        'tickLabel' : {},
        'axisLine' : {}
      },
      'styleDefaults' : 
      {
        'sliceLabel' : {},
        'x1Format' : {},
        'y1Format' : {},
        'y2Format' : {},
        'zFormat' : {}
      }
    };

    // if the data attribute is defined, use it to initialize the data object
    if (amxNode.isAttributeDefined('data'))
    {
      amxNode["_dataObj"] = amxNode.getAttribute('data');
    }
    else 
    {
      if (dvtm.isSparkChart(amxNode))
      {
        amxNode["_dataObj"] = 
        {
          'items' : [], 'referenceObjects' : []
        };
      }
      else 
      {
        amxNode["_dataObj"] = 
        {
          'series' : [], 'groups' : [], 'legend' : 
          {
          }
        };
      }
    }

    amxNode[dvtm.COMPONENT_INSTANCE] = null;
    amxNode["_attributeGroups"] = [];
    amxNode["_markers"] = [];
    amxNode['_rowKeyCache'] = {};
    amxNode['_stylesResolved'] = false;

    // load required resources
    dvtm.loadCanvasToolkitJs();
    dvtm.loadChartResourceBundles();
  }

  /**
   * Initializes the chart amxNode on refresh by copying the old amxNode properties.
   * Should be called from tag:refresh.
   */
  dvtm.initChartAmxNodeForRefresh = function (amxNode, attributeChanges)
  {
    // make a note that this is a refresh phase
    amxNode['_refreshing'] = true;
    amxNode['_attributeChanges'] = attributeChanges;

    // clear the 'dirty' flag on the options object
    dvtm.setOptionsDirty(amxNode, false);

    if (attributeChanges.hasChanged('value'))
    {
      // if 'value' changed, the dataObject must be recreated from scratch
      if (dvtm.isSparkChart(amxNode))
      {
        amxNode["_dataObj"] = 
        {
          'items' : [], 'referenceObjects' : []
        };
      }
      else 
      {
        amxNode["_dataObj"] = 
        {
          'series' : [], 'groups' : [], 'legend' : {}
        };
      }

      amxNode["_attributeGroups"] = [];
      amxNode["_markers"] = [];
      amxNode['_rowKeyCache'] = {};
      
      var selection = amxNode['_selection'];
      if (selection !== undefined && selection !== null)
      {
        amxNode['_dataObj']['selection'] = selection;
    }

  }
  }

  /**
    * Initializes the DOM node corresponding to the chart's 'div'.
    * Should be called as the first thing in tag:init.
    */
  dvtm.initChartDomNode = function($node, amxNode)
  {
    dvtm.initDvtmComponent($node, amxNode, function($componentNode, componentAmxNode){
      var width = dvtm.getComponentWidth($componentNode, componentAmxNode);
      var height = dvtm.getComponentHeight($componentNode, componentAmxNode);
      
      componentAmxNode[dvtm.COMPONENT_INSTANCE].render(null, width, height); 
    });

    // gauges support behaviors on tap action
    if (dvtm.isGauge(amxNode))
    {
      $node.tap(function ()
      {
        if (amx.acceptEvent())
        {
          var event = new amx.ActionEvent();
          amx.processAmxEvent($node, "action", undefined, undefined, event);
        }
      });
    }
  }

  /**
   * unregister all DOM node's listeners
   */
  dvtm.destroyChartDomNode = function ($node, amxNode)
  {
    dvtm.removeResizeCallback(amxNode.getId());
  }

  /**
   * sets up chart's outer div element
   */
  dvtm.setupChartDiv = function (amxNode)
  {
    var idAttr = '';
    var id = amxNode.getId();

    if (id !== undefined)
    {
      idAttr = 'id="' + id + '"';
    }

    // this is the default chart div with 100% width/height
    var $content = $('<div ' + idAttr + ' style="width: 100%; height: 100%;"><\/div>');

    // set a private flag to indicate whether the node can be populated with contents
    // should an exception occur during data processing, this flag will be set to false
    $content['_readyToRender'] = true;

    // append markup div's to be able to resolve styles later in tag:init
    if (!dvtm.isGauge(amxNode) && !dvtm.isSparkChart(amxNode))
    {

      var $titleDiv = $('<div class="dvtm-chartTitle" style="display:none;"><\/div>');
      $content.append($titleDiv);

      var $subtitleDiv = $('<div class="dvtm-chartSubtitle" style="display:none;"><\/div>');
      $content.append($subtitleDiv);

      var $footnoteDiv = $('<div class="dvtm-chartFootnote" style="display:none;"><\/div>');
      $content.append($footnoteDiv);

      var $titleSeparatorDiv = $('<div class="dvtm-chartTitleSeparator" style="display:none;"><\/div>');
      $content.append($titleSeparatorDiv);
    }

    dvtm.setupLegendDiv(amxNode, $content);

    if (!dvtm.isGauge(amxNode) && !dvtm.isSparkChart(amxNode))
    {
      var $xAxisTitleDiv = $('<div class="dvtm-chartXAxisTitle" style="display:none;"><\/div>');
      $content.append($xAxisTitleDiv);

      var $yAxisTitleDiv = $('<div class="dvtm-chartYAxisTitle" style="display:none;"><\/div>');
      $content.append($yAxisTitleDiv);

      var $y2AxisTitleDiv = $('<div class="dvtm-chartY2AxisTitle" style="display:none;"><\/div>');
      $content.append($y2AxisTitleDiv);

      var $xAxisTickLabelDiv = $('<div class="dvtm-chartXAxisTickLabel" style="display:none;"><\/div>');
      $content.append($xAxisTickLabelDiv);

      var $yAxisTickLabelDiv = $('<div class="dvtm-chartYAxisTickLabel" style="display:none;"><\/div>');
      $content.append($yAxisTickLabelDiv);

      var $y2AxisTickLabelDiv = $('<div class="dvtm-chartY2AxisTickLabel" style="display:none;"><\/div>');
      $content.append($y2AxisTickLabelDiv);

      var $pieLabelDiv = $('<div class="dvtm-chartPieLabel" style="display:none;"><\/div>');
      $content.append($pieLabelDiv);

      var $sliceLabelDiv = $('<div class="dvtm-chartSliceLabel" style="display:none;"><\/div>');
      $content.append($sliceLabelDiv);
    }

    if (dvtm.isGauge(amxNode))
    {
      var metricClasses = "dvtm-gaugeMetricLabel";
      var tickClasses = "dvtm-gaugeTickLabel";
      if (amxNode.getTag().getName() === 'dialGauge' && amxNode.isAttributeDefined('background'))
      {
        metricClasses += " dvtm-dialGauge-background-" + amxNode.getAttribute('background');
        tickClasses += " dvtm-dialGauge-background-" + amxNode.getAttribute('background');
      }
      var $gaugeMetricLabelDiv = $('<div class="' + metricClasses + '" style="display:none;"><\/div>');
      $content.append($gaugeMetricLabelDiv);
      
      var $gaugeTickLabelDiv = $('<div class="' + tickClasses + '" style="display:none;"><\/div>');
      $content.append($gaugeTickLabelDiv);
      
      var $plotAreaDiv = $('<div class="dvtm-gaugePlotArea" style="display:none;"><\/div>');
      $content.append($plotAreaDiv);    
      
      if (dvtm.isRatingGauge(amxNode))
      {
        var $ratingGaugeSelectedDiv = $('<div class="dvtm-ratingGaugeSelected" style="display:none;"><\/div>');
        var $ratingGaugeUnselectedDiv = $('<div class="dvtm-ratingGaugeUnselected" style="display:none;"><\/div>');
        var $ratingGaugeHoverDiv = $('<div class="dvtm-ratingGaugeHover" style="display:none;"><\/div>');
        var $ratingGaugeChangedDiv = $('<div class="dvtm-ratingGaugeChanged" style="display:none;"><\/div>');
        
        $content.append($ratingGaugeSelectedDiv);
        $content.append($ratingGaugeUnselectedDiv);
        $content.append($ratingGaugeHoverDiv);
        $content.append($ratingGaugeChangedDiv);
      }
    }

    return $content;
  }

  /**
   * returns the chart type
   */
  dvtm.getChartType = function (amxNode)
  {
    var options = amxNode["_optionsObj"];
    return options['chart']['type'];
  }

  /**
   * sets the chart type property on the options object
   */
  dvtm.setChartType = function (amxNode, type)
  {
    var options = amxNode["_optionsObj"];

    if (options['chart'] == undefined)
    {
      options['chart'] = {};
    }
    if (options['chart']['type'] !== type)
    {
      options['chart']['type'] = type;
      dvtm.setOptionsDirty(amxNode, true);
    }
  }

  dvtm._getAttributeValue = function (element, attrName)
  {
    return element['attributes'][attrName] !== undefined ? element['attributes'][attrName]['value'] : undefined;
  }

  /**
   * sets common chart properties found on the amxNode
   */
  dvtm.setCommonChartProperties = function (amxNode)
  {
    var options = amxNode["_optionsObj"];
    var data = amxNode["_dataObj"];
    var refreshing = amxNode["_refreshing"];

    // first, apply JSON style properties
    // don't bother setting the style defaults on refresh though
    if (!refreshing)
    {
      var styleJSON;

      if (window['CustomChartStyle'] != undefined)
      {
        styleJSON = DvtJSONUtils.merge(window['CustomChartStyle'], dvtm.DefaultChartStyle);
      }
      else 
      {
        styleJSON = dvtm.DefaultChartStyle;
      }

      // if we got here, assume the options object *will* be modified
      dvtm.setOptionsDirty(amxNode, true);

      // the 'optionsObject' is a result of the default and custom style
      amxNode['_optionsObj'] = DvtJSONUtils.merge(styleJSON, options);
      options = amxNode['_optionsObj'];
    }

    var attr;

    attr = amxNode.getAttribute('title');
    if (attr)
      data['title'] = attr;

    attr = amxNode.getAttribute('titleHalign');
    if (attr !== undefined && attr !== options['title']['hAlign'])
    {
      options['title']['hAlign'] = attr;
      dvtm.setOptionsDirty(amxNode, true);
    }

    attr = amxNode.getAttribute('subtitle');
    if (attr)
      data['subtitle'] = attr;

    attr = amxNode.getAttribute('footnote');
    if (attr)
      data['footnote'] = attr;

    attr = amxNode.getAttribute('footnoteHalign');
    if (attr !== undefined && attr !== options['footnote']['hAlign'])
    {
      options['footnote']['hAlign'] = attr;
      dvtm.setOptionsDirty(amxNode, true);
    }

    attr = amxNode.getAttribute('timeAxisType');
    if (attr)
      data['timeAxisType'] = attr;

    attr = amxNode.getAttribute('shortDesc');
    if (attr)
      data['shortDesc'] = attr;

    attr = amxNode.getAttribute('animationOnDisplay');
    if ((attr != undefined) && (attr !== options['chart']['animationOnDisplay']))
    {
      if (dvtm.isSparkChart(amxNode))
        options['animationOnDisplay'] = attr;
      else
        options['chart']['animationOnDisplay'] = attr;
      dvtm.setOptionsDirty(amxNode, true);
    }

    attr = amxNode.getAttribute('animationOnDataChange');
    if ((attr != undefined) && (attr !== options['chart']['animationOnDataChange']))
    {
      if (dvtm.isSparkChart(amxNode))
        options['animationOnDataChange'] = attr;
      else
        options['chart']['animationOnDataChange'] = attr;
      dvtm.setOptionsDirty(amxNode, true);
    }

    if (amxNode.isAttributeDefined('animationDuration'))
    {
      attr = amxNode.getAttribute('animationDuration') * 1;
      if (attr !== options['styleDefaults']['animationDuration'])
      {
        options['styleDefaults']['animationDuration'] = attr;
        dvtm.setOptionsDirty(amxNode, true);
      }
    }

    attr = amxNode.getAttribute('animationIndicators');
    if ((attr != undefined) && (attr !== options['styleDefaults']['animationIndicators']))
    {
      options['styleDefaults']['animationIndicators'] = attr;
      dvtm.setOptionsDirty(amxNode, true);
    }

    attr = amxNode.getAttribute('animationDownColor');
    if ((attr != undefined) && (attr !== options['styleDefaults']['animationDownColor']))
    {
      options['styleDefaults']['animationDownColor'] = attr;
      dvtm.setOptionsDirty(amxNode, true);
    }

    attr = amxNode.getAttribute('animationUpColor');
    if ((attr != undefined) && (attr !== options['styleDefaults']['animationUpColor']))
    {
      options['styleDefaults']['animationUpColor'] = attr;
      dvtm.setOptionsDirty(amxNode, true);
    }

    if (amx.dtmode)
    {
      // bug 13810977: in DT mode, disable interactive behavior
      options['chart']['dataSelection'] = 'none';
      options['chart']['hideAndShowBehavior'] = 'none';
      options['chart']['rolloverBehavior'] = 'none';
      options['chart']['dataCursor'] = 'off';
    }
    else 
    {
      attr = amxNode.getAttribute('dataSelection');
      if (attr !== undefined && attr !== options['chart']['dataSelection'])
      {
        options['chart']['dataSelection'] = attr;
        dvtm.setOptionsDirty(amxNode, true);
      }

      attr = amxNode.getAttribute('hideAndShowBehavior');
      if (attr !== undefined && attr !== options['chart']['hideAndShowBehavior'])
      {
        options['chart']['hideAndShowBehavior'] = attr;
        dvtm.setOptionsDirty(amxNode, true);
      }

      attr = amxNode.getAttribute('rolloverBehavior');
      if (attr !== undefined && attr !== options['chart']['rolloverBehavior'])
      {
        options['chart']['rolloverBehavior'] = attr;
        dvtm.setOptionsDirty(amxNode, true);
      }

      attr = amxNode.getAttribute('dataCursor');
      if (attr !== undefined && attr !== options['chart']['dataCursor'])
      {
        options['chart']['dataCursor'] = attr;
        dvtm.setOptionsDirty(amxNode, true);
      }

      attr = amxNode.getAttribute('dataCursorBehavior');
      if (attr !== undefined && attr !== options['chart']['dataCursorBehavior'])
      {
        options['chart']['dataCursorBehavior'] = attr;
        dvtm.setOptionsDirty(amxNode, true);
      }
    }

    attr = amxNode.getAttribute('stack');
    if (attr !== undefined && attr !== options['chart']['stack'])
    {
      options['chart']['stack'] = attr;
      dvtm.setOptionsDirty(amxNode, true);
    }

    attr = amxNode.getAttribute('emptyText');
    if (attr !== undefined && attr !== options['chart']['emptyText'])
    {
      if (dvtm.isSparkChart(amxNode))
        options['emptyText'] = attr;
      else
        options['chart']['emptyText'] = attr;
      dvtm.setOptionsDirty(amxNode, true);
    }

    if (amxNode.getTag().getName() === 'sparkChart')
    {
      attr = amxNode.getAttribute('type');
      if (attr !== undefined && attr !== options['type'])
      {
        options['type'] = attr;
        dvtm.setOptionsDirty(amxNode, true);
      }
      attr = amxNode.getAttribute('color');
      if (attr !== undefined && attr !== options['color'])
      {
        options['color'] = attr;
        dvtm.setOptionsDirty(amxNode, true);
      }
      attr = amxNode.getAttribute('firstColor');
      if (attr !== undefined && attr !== options['firstColor'])
      {
        options['firstColor'] = attr;
        dvtm.setOptionsDirty(amxNode, true);
      }
      attr = amxNode.getAttribute('lastColor');
      if (attr !== undefined && attr !== options['lastColor'])
      {
        options['lastColor'] = attr;
        dvtm.setOptionsDirty(amxNode, true);
      }
      attr = amxNode.getAttribute('highColor');
      if (attr !== undefined && attr !== options['highColor'])
      {
        options['highColor'] = attr;
        dvtm.setOptionsDirty(amxNode, true);
      }
      attr = amxNode.getAttribute('lowColor');
      if (attr !== undefined && attr !== options['lowColor'])
      {
        options['lowColor'] = attr;
        dvtm.setOptionsDirty(amxNode, true);
      }
    }
  }

  /**
   * adds a name/data pair to the series.  The item must be of type
   * { name: X, 'data': Y }.
   */
  dvtm.addSeriesItem = function (amxNode, item)
  {
    amxNode["_dataObj"]['series'].push(item);
  }

  /**
   * sets style properties based on CSS
   */
  dvtm.setCssBasedProperties = function (node, amxNode)
  {
    var nodeStyle = dvtm._getComputedStyle(node);
    var options = amxNode["_optionsObj"];
    var id = amxNode.getId();

    // escape colons in id
    id = id.replace(/\:/g, "\\:");

    // if we get here, assume the options object *will* be modified
    dvtm.setOptionsDirty(amxNode, true);

    // chart background color
    var bgColor = nodeStyle['background-color'];
    if (bgColor) 
    {
      var propertyName = dvtm.isStatusMeterGauge(amxNode) ? 'color' : 'backgroundColor';
      if(!options['plotArea'])
        options['plotArea'] = {};
      options['plotArea'][propertyName] = bgColor;
    }

    if (dvtm.isGauge(amxNode))
    {
      // gauge border color, unless already specified via attribute
      if (options['borderColor'] === undefined)
      {
        var borderColor = nodeStyle['border-bottom-color'];
        if (borderColor)
        {  
          options['borderColor'] = borderColor;          
        }
      }
      // gauge color, unless already specified via attribute
      if (options['color'] === undefined)
      {
        var gaugeColor = nodeStyle['color'];
        if (gaugeColor)
          options['color'] = gaugeColor;
      }
    }
  
    if(dvtm.isStatusMeterGauge(amxNode)) {
      var plotAreaDiv = node.querySelector(".dvtm-gaugePlotArea");
      var plotAreaDivStyle = dvtm._getComputedStyle(plotAreaDiv); 
     
      var plotAreaDivBorderColor = plotAreaDivStyle['border-bottom-color'];      
      if (plotAreaDivBorderColor)
        options['plotArea']['borderColor'] = plotAreaDivBorderColor;
        
      var plotAreaDivBackgroundColor = plotAreaDivStyle['background-color'];      
      if (plotAreaDivBackgroundColor)
        options['plotArea']['color'] = plotAreaDivBackgroundColor;
    }

    if (!dvtm.isGauge(amxNode) && !dvtm.isSparkChart(amxNode))
    {
      // title style
      var titleDiv = node.querySelector(".dvtm-chartTitle");
      var titleStyleString = this.buildCssStyleString(titleDiv);
      options['title']['style'] = titleStyleString;

      // subtitle style
      var subtitleDiv = node.querySelector(".dvtm-chartSubtitle");
      var subtitleStyleString = this.buildCssStyleString(subtitleDiv);
      options['subtitle']['style'] = subtitleStyleString;

      // footnote style
      var footnoteDiv = node.querySelector(".dvtm-chartFootnote");
      var footnoteStyleString = this.buildCssStyleString(footnoteDiv);
      options['footnote']['style'] = footnoteStyleString;

      // title separator styles
      var titleSeparatorDiv = node.querySelector(".dvtm-chartTitleSeparator");
      var titleSeparatorDivStyle = dvtm._getComputedStyle(titleSeparatorDiv);

      if (titleSeparatorDivStyle['visibility'])
        options['titleSeparator']['rendered'] = (titleSeparatorDivStyle['visibility']);
      if (titleSeparatorDivStyle['border-top-color'])
        options['titleSeparator']['upperColor'] = titleSeparatorDivStyle['border-top-color'];
      if (titleSeparatorDivStyle['border-bottom-color'])
        options['titleSeparator']['lowerColor'] = titleSeparatorDivStyle['border-bottom-color'];
    }

    // set legend styles
    dvtm.setCssBasedLegendProperties(node, amxNode);

    if (!dvtm.isGauge(amxNode) && !dvtm.isSparkChart(amxNode))
    {
      // xAxis styles
      var xAxisTitleDiv = node.querySelector(".dvtm-chartXAxisTitle");
      var xAxisTitleStyleString = this.buildCssStyleString(xAxisTitleDiv);
      options['xAxis']['titleStyle'] = xAxisTitleStyleString;

      var xAxisTickLabelDiv = node.querySelector(".dvtm-chartXAxisTickLabel");
      options['xAxis']['tickLabel']['style'] = dvtm._mergeOptionsAndDivStyle(xAxisTickLabelDiv, options['xAxis']['tickLabel']['_labelStyle']);

      // yAxis styles
      var yAxisTitleDiv = node.querySelector(".dvtm-chartYAxisTitle");
      var yAxisTitleStyleString = this.buildCssStyleString(yAxisTitleDiv);
      options['yAxis']['titleStyle'] = yAxisTitleStyleString;

      var yAxisTickLabelDiv = node.querySelector(".dvtm-chartYAxisTickLabel");
      options['yAxis']['tickLabel']['style'] = dvtm._mergeOptionsAndDivStyle(yAxisTickLabelDiv, options['yAxis']['tickLabel']['_labelStyle']);

      // y2Axis styles
      var y2AxisTitleDiv = node.querySelector(".dvtm-chartY2AxisTitle");
      var y2AxisTitleStyleString = this.buildCssStyleString(y2AxisTitleDiv);
      options['y2Axis']['titleStyle'] = y2AxisTitleStyleString;

      var y2AxisTickLabelDiv = node.querySelector(".dvtm-chartY2AxisTickLabel");    
      options['y2Axis']['tickLabel']['style'] = dvtm._mergeOptionsAndDivStyle(y2AxisTickLabelDiv, options['y2Axis']['tickLabel']['_labelStyle']);

      // pieLabel style
      var pieLabelDiv = node.querySelector(".dvtm-chartPieLabel");
      var pieLabelStyleString = this.buildCssStyleString(pieLabelDiv);
      options['styleDefaults']['pieLabelStyle'] = pieLabelStyleString;

      // sliceLabel style
      var sliceLabelDiv = node.querySelector(".dvtm-chartSliceLabel");
      var sliceLabelStyleString = this.buildCssStyleString(sliceLabelDiv);
      options['styleDefaults']['sliceLabel']['style'] = sliceLabelStyleString;
    }

    if (dvtm.isGauge(amxNode))
    {
      // gaugeMetricLabel style
      var gaugeMetricLabelDiv = node.querySelector(".dvtm-gaugeMetricLabel");
      options['metricLabel']['labelStyle'] = dvtm._mergeOptionsAndDivStyle(gaugeMetricLabelDiv, options['metricLabel']['_labelStyle']);
       
      if (dvtm.isDialGauge(amxNode))
      {
        // gaugeTickLabel style
        var gaugeTickLabelDiv = node.querySelector(".dvtm-gaugeTickLabel");
        options['tickLabel']['labelStyle'] = dvtm._mergeOptionsAndDivStyle(gaugeTickLabelDiv, options['tickLabel']['_labelStyle']);
      }
      
      if (dvtm.isRatingGauge(amxNode)) 
      {
        var ratingGaugeSelectedDiv = node.querySelector('.dvtm-ratingGaugeSelected');
        var ratingGaugeUnselectedDiv = node.querySelector('.dvtm-ratingGaugeUnselected');
        var ratingGaugeHoverDiv = node.querySelector('.dvtm-ratingGaugeHover');
        var ratingGaugeChangedDiv = node.querySelector('.dvtm-ratingGaugeChanged');

        var style = dvtm._getComputedStyle(ratingGaugeSelectedDiv);
        if (style['border-top-color'] !== undefined) {
          options['selected']['borderColor'] = style['border-top-color'];
        }
        if (style['color'] !== undefined) 
        {
          options['selected']['color'] = style['color'];
        }

        style = dvtm._getComputedStyle(ratingGaugeUnselectedDiv);
        if (style['border-top-color'] !== undefined) {
          options['unselected']['borderColor'] = style['border-top-color'];
        }
        if (style['color'] !== undefined) 
        {
          options['unselected']['color'] = style['color'];
        }
        
        style = dvtm._getComputedStyle(ratingGaugeHoverDiv);
        if (style['border-top-color'] !== undefined) {
          options['hover']['borderColor'] = style['border-top-color'];
        }
        if (style['color'] !== undefined) 
        {
          options['hover']['color'] = style['color'];
        }

        style = dvtm._getComputedStyle(ratingGaugeChangedDiv);
        if (style['border-top-color'] !== undefined) {
          options['changed']['borderColor'] = style['border-top-color'];
        }
        if (style['color'] !== undefined) 
        {
          options['changed']['color'] = style['color'];
        }
      }
    }

    amxNode['_stylesResolved'] = true;
  }
  
  /**
   * Merges style on div with css text in optionsStyle.
   * 
   * @param cssDiv element with style class or with some default style
   * @param optionsStyle extending CSS text style
   * @return merged CSS text style
   */
  dvtm._mergeOptionsAndDivStyle = function(cssDiv, optionsStyle)
  {     
    if(!cssDiv) 
    {
      return optionsStyle;  
    }
    
    var oldStyle;
    if(optionsStyle) 
    {
      oldStyle = cssDiv.getAttribute("style");
      cssDiv.setAttribute("style", oldStyle + ";" + optionsStyle);
    }      
    var styleString = this.buildCssStyleString(cssDiv);
    if(oldStyle)
    {
      cssDiv.setAttribute("style", oldStyle);
    }
    return styleString;
  }

  /**
   * returns svg/canvas stage id based in the node id and rendering method
   */
  dvtm.getChartStageId = function (amxNode)
  {
    var id = "";
    if (dvtm.isSvgAvailable())
    {
      id = (amxNode.getId()) ? amxNode.getId() + '_svg' : 'chart_svg';
    }
    else 
    {
      id = (amxNode.getId()) ? amxNode.getId() + '_canvas' : 'chart_canvas';
    }
    return id;
  }

  /**
   * renders the chart SVG and appends it to the parent node
   */
  dvtm.renderChart = function ($node, amxNode)
  {
    // if an exception was encountered during data processing, do not even try to render
    if ($node['_readyToRender'] === false)
    {
      return;
    }

    var $dummy = null;
    var $renderDiv = null;
    var stageId = dvtm.getChartStageId(amxNode);
    var stageIdEsc = stageId.replace(/\:/g, "\\:");

    adf.mf.internal.perf.start("dvtm.renderChart", amxNode.getTag().getName());

    // use Canvas rendering, if SVG is not available (Android 2.x)
    var bUseCanvas = !dvtm.isSvgAvailable();

    try 
    {
      if (!dvtm.isAncestor(document.body, $node.get(0)))
      {
        adf.mf.log.Framework.logp(adf.mf.log.level.INFO, "dvtm.chart", "renderChart", "Rendering chart on a disconnected DOM node.");

        // create a dummy node under document.body to layout the chart properly
        $dummy = $node.clone();
        $dummy.attr('id', $node.attr('id') + '_temp');
        $dummy.css('position', 'absolute');
        $dummy.css('left', '-1000px');
        $dummy.css('top', '-1000px');
        $('body').append($dummy);
        $renderDiv = $dummy;
      }
      else 
      {
        $renderDiv = $node;
      }

      var options = amxNode["_optionsObj"];
      var data = amxNode["_dataObj"];
      var refreshing = amxNode["_refreshing"];
      var componentInstance = amxNode[dvtm.COMPONENT_INSTANCE];

      if ($dummy || !amxNode['_stylesResolved'])
      {
        dvtm.setCssBasedProperties($renderDiv.get(0), amxNode);
      }

      // first, get the width and height from style
      var width = dvtm.getComponentWidth($renderDiv, amxNode);
      var height = dvtm.getComponentHeight($renderDiv, amxNode);

      var context;

      // on refresh, if the options object is dirty or if we are using canvas element,
      // delete the old nodes content and recreate the chart        
      if (bUseCanvas)
      {
        $renderDiv.find('canvas').remove();
      }

      // if not refreshing, or if the options object is dirty, or we're missing
      // the previous chart object, create the document and context
      if (!bUseCanvas && dvtm.isOptionsDirty(amxNode) && componentInstance) 
      {
        componentInstance.setOptions(options);
      } 
      else if (bUseCanvas || dvtm.isOptionsDirty(amxNode) || !componentInstance)
      {       
        if (!bUseCanvas)
        {
          // Remove old SVG Element
          $renderDiv.find('svg').remove();
          // Create the SVG Element
          var svg = DvtSvgUtils.createSvgDocument(stageId);
          // append the svg node to the parent
          $renderDiv.append(svg);
          // Create the component and pass in the rendering context
          context = new DvtSvgContext(svg);
        }
        else 
        {
          // create the Canvas element
          var canvas = DvtCanvasUtils.createCanvasDocument(width, height, stageId);
          // append the canvas node to the parent
          $renderDiv.append(canvas);
          // create the component and pass in the rendering context
          context = new DvtCanvasContext(canvas);
        }

        var selectionCallbackObj = 
        {
          // 'selectionListener': amxNode.getAttribute('selectionListener'),
          'callback' : function (event, component)
          {
            var rowKeyCache = amxNode['_rowKeyCache'];
            var rowKey;

            if (event.getType() === 'selection')
            {
              // selectionChange event support
              var selection = event.getSelection();
              if (selection !== undefined)
              {
                var selectedRowKeys = [];
                var i;

                for (i = 0;i < selection.length;i++)
                {
                  rowKey = null;
                    var objId = selection[i].getId();
                    if (rowKeyCache[objId] !== undefined)
                    {
                      rowKey = rowKeyCache[objId];
                    }
                  if (rowKey !== null)
                  {
                    selectedRowKeys.push(rowKey);
                  }
                }
                var se = new amx.SelectionEvent(selectedRowKeys, selectedRowKeys);
                amx.processAmxEvent($node, 'selection', undefined, undefined, se);

                var _selection = [];
                if (selection !== undefined && selection !== null)
                {
                    for (var i = 0; i < selection.length; i++) 
                    {
                        var eventSelectionObject = selection[i];

                        var selectionObject = {};
                        selectionObject['id'] = eventSelectionObject.getId();
                        selectionObject['group'] = eventSelectionObject.getGroup();
                        selectionObject['series'] = eventSelectionObject.getSeries();

                        _selection.push(selectionObject);
              }
            }
                
                amxNode["_selection"] = _selection;
              }
            }
            else if (event.getType() === 'dvtAct')
            {
              // action event support
                var actionEvent = event.getClientId();// is of type DvtActionEvent
                var itemId = actionEvent.getId();
                if (rowKeyCache[itemId] !== undefined)
                {
                  rowKey = rowKeyCache[itemId];
                }
              if (rowKey !== undefined)
              {
                // get data item's amxNode (assume the rowKey to be unique)
                var item = amxNode.getChildren('dataStamp', rowKey)[0];
                if (item !== undefined && item != null)
                {
                  // fire ActionEvent and then process the 'action' attribute
                  var ae = new amx.ActionEvent();
                  amx.processAmxEvent(item, 'action', undefined, undefined, ae).always(function ()
                  {
                    var action = item.getTag().getAttribute('action');
                    if (action != null)
                    {
                      adf.mf.api.amx.doNavigation(action);
                    }
                  });
                }
              }
            }
          }
        }

        var valueChangeCallbackObj = 
        {
          'callback' : function (event, component)
          {
            var newValue = event.getNewValue();
            // fire the valueChange event if the value has changed
            if (newValue !== event.getOldValue())
            {
              var vce = new amx.ValueChangeEvent(event.getOldValue(), event.getNewValue());
              amx.processAmxEvent($node, "valueChange", "value", newValue, vce);
            }
          }
        }

        if (dvtm.isSparkChart(amxNode))
        {
          componentInstance = DvtSparkChart.newInstance(context, null, null, options);
        }
        else if (amxNode.getTag().getName() === "ledGauge")
        {
          componentInstance = DvtLedGauge.newInstance(context, null, null, options);
        }
        else if (amxNode.getTag().getName() === "statusMeterGauge")
        {
          componentInstance = DvtStatusMeterGauge.newInstance(context, valueChangeCallbackObj.callback, valueChangeCallbackObj, options);
        }
        else if (amxNode.getTag().getName() === "dialGauge")
        {
          componentInstance = DvtDialGauge.newInstance(context, valueChangeCallbackObj.callback, valueChangeCallbackObj, options);
        }
        else if (dvtm.isRatingGauge(amxNode))
        {
          componentInstance = DvtRatingGauge.newInstance(context, valueChangeCallbackObj.callback, valueChangeCallbackObj, options);
        }
        else 
        {
          if (selectionCallbackObj)
          {
            componentInstance = DvtChart.newInstance(context, selectionCallbackObj.callback, selectionCallbackObj, options);
          }
          else 
          {
            componentInstance = DvtChart.newInstance(context, null, null, options);
          }
        }
        context.getStage().addChild(componentInstance);

        // store the component instance for later use
        amxNode[dvtm.COMPONENT_INSTANCE] = componentInstance;
        // chart instance created, reset the dirty flag
        dvtm.setOptionsDirty(amxNode, false);
      }

      // and finally render the chart
      componentInstance.render(data, width, height);

      // if we were rendering to a dummy node, re-attach the content to the real node and remove the dummy
      if ($dummy)
      {
        var child = $dummy.find('svg[id=' + stageIdEsc + ']').detach();
        $node.prepend(child);
        $dummy.remove();
      }
    }
    catch (ex)
    {
      // $content['_readyToRender'] = false;
      adf.mf.log.Framework.logp(adf.mf.log.level.SEVERE, "dvtm.chart", "renderChart", "Exception: " + ex.message);

      // clean up... remove the dummy node, if we created one
      if ($dummy)
      {
        $dummy.remove();
      }
      // remove the rendered content, if it exists, it's broken anyway
      if (bUseCanvas)
        $node.find('canvas').remove();
      else 
        $node.find('svg').remove();
    }
    finally 
    {
      adf.mf.internal.perf.stop("dvtm.renderChart", amxNode.getTag().getName());
    }
  }

  /**
   * sets the graph axis properties
   */
  dvtm.setAxisProperties = function (amxNode, axisNode, axisId)
  {
    var axisOptions;
    var axisData;
    var attr;

    switch (axisId)
    {
      case 'xAxis':
        axisOptions = amxNode["_optionsObj"]['xAxis'];
        axisData = amxNode["_dataObj"]['xAxis'] = {};
        break;
      case 'yAxis':
        axisOptions = amxNode["_optionsObj"]['yAxis'];
        axisData = amxNode["_dataObj"]['yAxis'] = {};
        break;
      case 'y2Axis':
        axisOptions = amxNode["_optionsObj"]['y2Axis'];
        axisData = amxNode["_dataObj"]['y2Axis'] = {};
        break;
      default :
      // unsupported axis type!
        return;
    }

    attr = axisNode.getAttribute('title');
    if (attr != undefined)
    {
      axisData['title'] = attr;
    }
    attr = axisNode.getAttribute('axisMinValue');
    if (attr !== axisOptions['minValue'])
    {
      axisOptions['minValue'] =  + attr;
      dvtm.setOptionsDirty(amxNode, true);
    }
    attr = axisNode.getAttribute('axisMaxValue');
    if (attr !== axisOptions['maxValue'])
    {
      axisOptions['maxValue'] =  + attr;
      dvtm.setOptionsDirty(amxNode, true);
    }
    attr = axisNode.getAttribute('majorIncrement');
    if (attr !== axisOptions['majorIncrement'])
    {
      axisOptions['majorIncrement'] =  + attr;
      dvtm.setOptionsDirty(amxNode, true);
    }
    attr = axisNode.getAttribute('minorIncrement');
    if (attr !== axisOptions['minorIncrement'])
    {
      axisOptions['minorIncrement'] =  + attr;
      dvtm.setOptionsDirty(amxNode, true);
    }
    attr = axisNode.getAttribute('scaledFromBaseline');
    if (attr !== axisOptions['scaledFromBaseline'])
    {
      axisOptions['scaledFromBaseline'] = attr;
      dvtm.setOptionsDirty(amxNode, true);
    }
    if (axisId === 'xAxis')
    {
      attr = axisNode.getAttribute('timeRangeMode');
      if (attr !== axisOptions['timeRangeMode'])
      {
        axisOptions['timeRangeMode'] = attr;
        dvtm.setOptionsDirty(amxNode, true);
      }
    }
    if (axisId === 'y2Axis')
    {
      var alignTickMarks = axisOptions['alignTickMarks'];
      if (axisNode.isAttributeDefined('alignTickMarks'))
      {
        if (amx.isValueFalse(axisNode.getAttribute('alignTickMarks')))
        {
          alignTickMarks = false;
        }
        else 
        {
          alignTickMarks = true;
        }
      }
      if (alignTickMarks !== axisOptions['alignTickMarks'])
      {
        axisOptions['alignTickMarks'] = alignTickMarks;
        dvtm.setOptionsDirty(amxNode, true);
      }
    }
  }

  /**
   * parses the referenceObject node attributes
   *
   * referenceObject has the following attributes
   *
   *   text       - String: tooltip and legend text for this reference object
   *   type       - String: line, area
   *   location   - String: front, back
   *   color      - String(Color): support CSS color values
   *   lineWidth  - Number
   *   lineStyle  - String
   *   lineValue  - Number
   *   lowValue   - Number
   *   highValue  - Number
   *   shortDesc   - String: custom tooltip for this reference object
   *   displayInLegend  - String: on/off - legend item should be added for this ref obj
   *
   */
  dvtm.processReferenceObj = function (amxNode, referenceObjNode, ref)
  {
    var referenceObjects = [];
    var refObj = {};
    var dataObj;
    var attr;

    switch (ref)
    {
      case 'xAxis':
        dataObj = amxNode["_dataObj"]['xAxis'];
        break;
      case 'yAxis':
        dataObj = amxNode["_dataObj"]['yAxis'];
        break;
      case 'y2Axis':
        dataObj = amxNode["_dataObj"]['y2Axis'];
        break;
      case 'statusMeterGauge':
      case 'spark':
        dataObj = amxNode["_dataObj"];
        break;      
      default :
      // unsupported axis type!
        return;
    }
    if (dataObj)
    {
      if (dataObj['referenceObjects'] == undefined)
      {
        dataObj['referenceObjects'] = [];
      }
      referenceObjects = dataObj['referenceObjects'];
    }

    attr = referenceObjNode.getAttribute('text');
    if (attr)
    {
      refObj['text'] = attr;
    }
    attr = referenceObjNode.getAttribute('type');
    if (attr)
    {
      refObj['type'] = attr;
    }
    attr = referenceObjNode.getAttribute('location');
    if (attr)
    {
      refObj['location'] = attr;
    }
    attr = referenceObjNode.getAttribute('color');
    if (attr)
    {
      refObj['color'] = attr;
    }
    attr = referenceObjNode.getAttribute('lineWidth');
    if (attr)
    {
      refObj['lineWidth'] =  + attr;
    }
    attr = referenceObjNode.getAttribute('lineStyle');
    if (attr)
    {
      refObj['lineStyle'] = attr;
    }
    attr = referenceObjNode.getAttribute('lineValue');
    if (attr)
    {
      refObj['lineValue'] =  + attr;            
    }
    attr = referenceObjNode.getAttribute('value');
    if (attr)
    {    
      refObj['value'] =  + attr;            
    }
    attr = referenceObjNode.getAttribute('lowValue');
    if (attr)
    {
      refObj['lowValue'] =  + attr;
    }
    attr = referenceObjNode.getAttribute('highValue');
    if (attr)
    {
      refObj['highValue'] =  + attr;
    }
    attr = referenceObjNode.getAttribute('shortDesc');
    if (attr)
    {
      refObj['tooltip'] = attr;
    }
    attr = referenceObjNode.getAttribute('displayInLegend');
    if (attr)
    {
      refObj['displayInLegend'] = attr;
    }

    referenceObjects.push(refObj);
  }

  /** parses sliceLabel node attributes
   *  sliceLabel has the following attributes:
   *
   *  position        - String: none, inside, outside
   *  style           - String: accepts font related CSS attributes
   *  textType        - String: text, value, percent, textAndPercent
   *  scaling         - String: auto, none, thousand, million, billion, trillion, quadrillion
   *  autoPrecision   - String: on (default), off
   *  converter       - Object: numberConverter
   *
   */
  dvtm.processSliceLabel = function (amxNode, sliceLabelNode)
  {
    var sliceLabel = amxNode["_optionsObj"]['styleDefaults']['sliceLabel'];
    var attr;

    attr = sliceLabelNode.getAttribute('position');
    if (attr)
      sliceLabel['position'] = attr;

    attr = sliceLabelNode.getAttribute('textType');
    if (attr)
      sliceLabel['textType'] = attr;

    attr = sliceLabelNode.getAttribute('scaling');
    if (attr)
      sliceLabel['scaling'] = attr;

    attr = sliceLabelNode.getAttribute('autoPrecision');
    if (attr)
      sliceLabel['autoPrecision'] = attr;

    attr = sliceLabelNode.getConverter();
    if (attr)
      sliceLabel['converter'] = attr;
  }

  /** parses pieValueFormat node attributes
   *  pieValueFormat has the following attributes:
   *
   *  converter      - Object: numberConverter
   *
   */
  dvtm.processPieValueFormat = function (amxNode, pieValueFormatNode)
  {
    var pieValueFormat = amxNode['_optionsObj']['styleDefaults']['pieValueFormat'];

    if (pieValueFormat == undefined)
    {
      pieValueFormat = amxNode['_optionsObj']['styleDefaults']['pieValueFormat'] = 
      {
      };
    }

    var converter = pieValueFormatNode.getConverter();
    if (converter)
      pieValueFormat['converter'] = converter;
  }

  /** parses tickLabel node attributes
   *
   *  tickLabel has the following attributes:
   *
   *  autoPrecision     - String: on, off
   *  rendered          - Boolean: true if the tickLabel should be rendered
   *  scaling           - String: auto, none, thousand, million, billion, trillion, quadrillion
   *  style             - String: font related CSS attributes
   *  converter         - Object: numberConverter or dateTimeConverter
   *
   */
  dvtm.processTickLabel = function (amxNode, labelNode, axisId)
  {
    var labelOptions;
    var attr;
    var parameterName = 'tickLabel';
    
    switch (axisId)
    {
      case 'xAxis':
        labelOptions = amxNode["_optionsObj"]['xAxis'];
        break;
      case 'yAxis':
        labelOptions = amxNode["_optionsObj"]['yAxis'];
        break;
      case 'y2Axis':
        labelOptions = amxNode["_optionsObj"]['y2Axis'];
        break;
      case 'metric':
        parameterName = 'metricLabel';
        labelOptions = amxNode["_optionsObj"];
        break;
      case 'scale':
        labelOptions = amxNode["_optionsObj"];
        break;
      default :
      // unsupported axis type!
        return;
    }
    if (labelOptions)
    {
      if (labelOptions[parameterName] == undefined)
      {
        labelOptions[parameterName] = {};
      }
    }
    attr = labelNode.getAttribute('autoPrecision');
    if (attr !== undefined && attr !== labelOptions[parameterName]['autoPrecision'])
    {
      labelOptions[parameterName]['autoPrecision'] = attr;
      dvtm.setOptionsDirty(amxNode, true);
    }
    attr = labelNode.getAttribute('rendered');
    if (attr !== undefined && attr !== labelOptions[parameterName]['rendered'])
    {
      labelOptions[parameterName]['rendered'] = amx.isValueTrue(attr);
      dvtm.setOptionsDirty(amxNode, true);
    }
    else if (attr === undefined)
    {
      labelOptions[parameterName]['rendered'] = true;
    }
    attr = labelNode.getAttribute('scaling');
    if (attr && attr !== labelOptions[parameterName]['scaling'])
    {
      labelOptions[parameterName]['scaling'] = attr;
      dvtm.setOptionsDirty(amxNode, true);
    }
    attr = labelNode.getAttribute('labelStyle');
    if ((attr && attr !== labelOptions[parameterName]['_labelStyle']) || (!attr && labelOptions[parameterName]['_labelStyle'])) 
    {
      labelOptions[parameterName]['_labelStyle'] = attr;
      dvtm.setOptionsDirty(amxNode, true);
      amxNode['_stylesResolved'] = false;
    } 
    if (axisId == 'xAxis') 
    {
      attr = labelNode.getAttribute('rotation');
    	if (attr !== undefined && attr !== labelOptions[parameterName]['rotation']) 
        {
 	  labelOptions[parameterName]['rotation'] = attr;
          dvtm.setOptionsDirty(amxNode, true);
    	}
    }   
    // if amx:convertNumber or amx:convertDateTime is used as a child tag of the tickLabel,
    // then the labelNode would have a converter object
    // we pass that converter to js chart API
    // TODO: check this
    attr = labelNode.getConverter();
    if (attr)
    {
      labelOptions[parameterName]['converter'] = attr;
    }
  }

  /**
   * parses axisLine node attributes
   *
   * axisLine has the following attributes:
   *
   * lineColor      - String(Color): support CSS color values
   * lineWidth      - Number: e.g. 1
   * rendered       - Boolean: true if the axisLine should be rendered
   *
   */
  dvtm.processAxisLine = function (amxNode, axisLineNode, axisId)
  {
    var axisOptions;
    var attr;

    switch (axisId)
    {
      case 'xAxis':
        axisOptions = amxNode["_optionsObj"]['xAxis'];
        break;
      case 'yAxis':
        axisOptions = amxNode["_optionsObj"]['yAxis'];
        break;
      case 'y2Axis':
        axisOptions = amxNode["_optionsObj"]['y2Axis'];
        break;
      default :
      // unsupported axis type!
        return;
    }
    if (axisOptions)
    {
      if (axisOptions['axisLine'] == undefined)
      {
        axisOptions['axisLine'] = 
        {
        };
      }

    }

    attr = axisLineNode.getAttribute('lineColor');
    if (attr !== undefined && attr !== axisOptions['axisLine']['lineColor'])
    {
      axisOptions['axisLine']['lineColor'] = attr;
      dvtm.setOptionsDirty(amxNode, true);
    }
    attr = axisLineNode.getAttribute('lineWidth');
    if (attr !== undefined && attr !== axisOptions['axisLine']['lineWidth'])
    {
      axisOptions['axisLine']['lineWidth'] =  + attr;
      dvtm.setOptionsDirty(amxNode, true);
    }
    attr = axisLineNode.getAttribute('rendered');
    if (attr !== undefined && attr !== axisOptions['axisLine']['rendered'])
    {
      axisOptions['axisLine']['rendered'] = (amx.isValueTrue(attr)) ? true : false;
      dvtm.setOptionsDirty(amxNode, true);
    }
  }

  /**
   * processes major/minorTick node attributes
   *
   * tick has the following attributes:
   *
   * lineColor      - String(Color): support CSS color values
   * lineWidth      - Number: e.g. 1
   * rendered       - Boolean: true if the tick should be rendered
   *                  default true for major, false for minor ticks
   */
  dvtm.processTick = function (amxNode, tickNode, axisId, isMajorTick)
  {
    var axisOptions;
    var tickOptions;
    var attr;

    switch (axisId)
    {
      case 'xAxis':
        axisOptions = amxNode["_optionsObj"]['xAxis'];
        break;
      case 'yAxis':
        axisOptions = amxNode["_optionsObj"]['yAxis'];
        break;
      case 'y2Axis':
        axisOptions = amxNode["_optionsObj"]['y2Axis'];
        break;
      default :
      // unsupported axis type!
        return;
    }
    if (axisOptions)
    {
      if (isMajorTick)
      {
        if (axisOptions['majorTick'] === undefined)
        {
          axisOptions['majorTick'] = 
          {
          };
        }
        tickOptions = axisOptions['majorTick'];
      }
      else 
      {
        if (axisOptions['minorTick'] === undefined)
        {
          axisOptions['minorTick'] = 
          {
          };
        }
        tickOptions = axisOptions['minorTick'];
      }
    }

    attr = tickNode.getAttribute('lineColor');
    if (attr !== undefined && attr !== tickOptions['lineColor'])
    {
      tickOptions['lineColor'] = attr;
      dvtm.setOptionsDirty(amxNode, true);
    }
    attr = tickNode.getAttribute('lineWidth');
    if (attr !== undefined && attr !== tickOptions['lineWidth'])
    {
      tickOptions['lineWidth'] =  + attr;
      dvtm.setOptionsDirty(amxNode, true);
    }
    attr = tickNode.getAttribute('rendered');
    if (attr !== undefined && attr !== tickOptions['rendered'])
    {
      tickOptions['rendered'] = amx.isValueTrue(attr) ? true : false;
      dvtm.setOptionsDirty(amxNode, true);
    }
  }

  /**
   * parses marker attributes (and potential attribute groups and
   * stores the internal marker representation in the following format
   *
   * marker : {
   *     seriesId,      // optional
   *     groupId,       // optional
   *     series,        // optional
   *     group,         // optional
   *     label,         // optional
   *     x,             // required
   *     y,             // required
   *     z,             // required for bubble chart
   *     markerSize,    // optional, marker size (does not apply to bubble)
   *     borderColor,   // optional
   *     color,         // optional, may come from attribute groups
   *     markerShape,         // optional, may come from attribute groups
   *     shortDesc,     // optional tooltip
   *     value,         // data item value for area/bar/line charts
   *     markerDisplayed  // optional, true by default
   *     attrGroups     // optional, array of attribute group references
   *
   *
   */
  dvtm.processMarker = function (amxNode, markerNode, dataStamp)
  {
    var attr, attr2;

    // first check if this data item should be rendered at all
    attr = markerNode.getAttribute('rendered');
    if (attr != undefined)
    {
      if (amx.isValueFalse(attr))
        return null;
    }

    var marker = 
    {
      'attrGroups' : []
    };

    attr = markerNode.getAttribute('groupId');
    if (attr != undefined)
    {
      marker['groupId'] = attr;
    }

    attr = markerNode.getAttribute('group');
    if (attr != undefined)
    {
      // if this is a regular time axis, then groups should be ISO 8601 encoded dates
      attr2 = amxNode.getAttribute('timeAxisType');
      if (attr2 && attr2 === 'enabled')
      {
        marker['group'] = dvtm._convertDate(attr);
      }
      else 
      {
        // otherwise, it's just a regular group label
        marker['group'] = attr;
      }
    }

    attr = markerNode.getAttribute('seriesId');
    attr2 = markerNode.getAttribute('series');
    if (attr != undefined)
    {
      marker['seriesId'] = attr;
    }
    else if (attr2 != undefined)
    {
      marker['seriesId'] = attr2;
    }

    if (attr2 != undefined)
    {
      marker['series'] = attr2;
    }
    else 
    {
      // need at least one anonymous series, if no series name/id is defined
      marker['series'] = "";
      if (marker['seriesId'] == undefined)
      {
        marker['seriesId'] = "_1";
      }
    }

    marker['_rowKey'] = dataStamp.rowKey();

    marker['id'] = markerNode.getId();

    attr = markerNode.getAttribute('x');
    if (attr != undefined)
    {
      // if this is a mixed frequency time axis, then 'x' value should be an ISO 8601 encoded date
      attr2 = amxNode.getAttribute('timeAxisType');
      if (attr2 && attr2 === 'mixedFrequency')
      {
        marker['x'] = dvtm._convertDate(attr);
      }
      else 
      {
        // otherwise, x is just a regular numeric value
        marker['x'] =  + attr;
      }
    }
    attr = markerNode.getAttribute('y');
    if (attr != undefined)
    {
      marker['y'] =  + attr;
    }
    attr = markerNode.getAttribute('z');
    if (attr != undefined)
    {
      marker['z'] =  + attr;
    }
    attr = markerNode.getAttribute('markerSize');
    if (attr != undefined)
    {
      marker['markerSize'] =  + attr;
    }
    attr = markerNode.getAttribute('value');
    if (attr != undefined)
    {
      marker['value'] =  + attr;
    }
    attr = markerNode.getAttribute('borderColor');
    if (attr)
    {
      marker['borderColor'] = attr;
    }
    attr = markerNode.getAttribute('color');
    if (attr)
    {
      marker['color'] = attr;
    }
    attr = markerNode.getAttribute('markerShape');
    if (attr)
    {
      marker.shape = attr;
    }
    attr = markerNode.getAttribute('shortDesc');
    if (attr)
    {
      marker['shortDesc'] = attr;
    }
    attr = markerNode.getAttribute('markerDisplayed');
    if (attr != undefined)
    {
      marker['markerDisplayed'] = attr;
    }
    attr = markerNode.getAttribute('action');
    if (attr != undefined)
    {
      marker['action'] = attr;
    }
    else 
    {
      var actionTags;
      var firesAction = false;
      // should fire action, if there are any 'setPropertyListener' or 'showPopupBehavior' child tags  
      actionTags = markerNode.getTag().findTags(dvtm.AMX_NAMESPACE, 'setPropertyListener');
      if (actionTags.length > 0)
        firesAction = true;
      else 
      {
        actionTags = markerNode.getTag().findTags(dvtm.AMX_NAMESPACE, 'showPopupBehavior');
        if (actionTags.length > 0)
          firesAction = true;
      }
      if (firesAction)
      {
        // need to set 'action' to some value to make the event fire
        marker['action'] = marker['_rowKey'];
      }
    }

    // add the marker to the internal list
    amxNode["_markers"].push(marker);

    return marker;
  }

  /**
   * applies resolved markers to the API model
   */
  dvtm.applyMarkersToModel = function (amxNode)
  {
    var markers = amxNode["_markers"];
    var rowKeyCache = amxNode['_rowKeyCache'];
    var chartType = dvtm.getChartType(amxNode);

    var i;
    var g;
    var ser;
    var color, shape;
    var groups = amxNode["_dataObj"]['groups'];
    var groupIndex;

    // populate an array of unique groups
    for (i = 0;i < markers.length;i++)
    {
      if (markers[i]['groupId'] !== undefined)
      {
        dvtm.addGroup(amxNode, markers[i]['groupId'], markers[i]['group']);
      }
      else 
      {
        dvtm.addGroup(amxNode, null, markers[i]['group']);
      }
    }

    // populate series with marker info
    for (i = 0;i < markers.length;i++)
    {
      var marker = markers[i];
      ser = dvtm.getSeriesByIdAndName(amxNode, marker['seriesId'], marker['series']);

      if (chartType !== 'bubble' && chartType !== 'scatter')
      {
        groupIndex = dvtm.getGroupIndexByIdOrName(amxNode, marker['groupId'], marker['group']);
      }
      
      var dataItem = {};

      if (marker['x'] != undefined)
      {
        dataItem['x'] = marker['x'];
      }
      if (marker['y'] != undefined)
      {
        dataItem['y'] = marker['y'];
      }
      else if (marker['value'] != undefined)
      {
        dataItem['y'] = marker['value'];
      }

      if (marker['z'] != undefined)
      {
        // bubble chart z value
        dataItem['z'] = marker['z'];
      }
      if (marker['markerSize'] != undefined)
      {
        dataItem['markerSize'] = marker['markerSize'];
      }

      if (marker['shortDesc'] != undefined)
      {
        dataItem['tooltip'] = marker['shortDesc'];
      }
      if (marker['borderColor'] != undefined)
      {
        dataItem['borderColor'] = marker['borderColor'];
      }

      // resolve attributes set via attributeGroups first
      if (marker['attrGroups'].length > 0)
      {
        for (g = 0;g < marker['attrGroups'].length;g++)
        {

          var aGroup = marker['attrGroups'][g]['attrGroup'];
          var valueIndex = marker['attrGroups'][g]['valueIndex'];

          // resolve color
          color = dvtm.getAttributeFromGroup(amxNode, "color", aGroup, valueIndex);
          if (color != null)
          {
            dataItem['color'] = color;
          }

          // resolve shapes
          shape = dvtm.getAttributeFromGroup(amxNode, "shape", aGroup, valueIndex);
          if (shape != null)
          {
            dataItem['markerShape'] = shape;
          }

          // for bubble and scatter charts, populate the categories array
          if (chartType === 'bubble' || chartType === 'scatter')
          {
            if (dataItem['categories'] == undefined)
            {
              dataItem['categories'] = [];
            }

            dataItem['categories'].push(aGroup['items'][valueIndex]['value']);
          }

        }
      }

      // proceed with color and shape attributes set on marker tag
      if (marker['color'] != undefined)
      {
        dataItem['color'] = marker['color'];
      }
      if (marker['markerShape'] != undefined)
      {
        dataItem['markerShape'] = marker['markerShape'];
      }
      if (marker['markerDisplayed'] != undefined)
      {
        dataItem['markerDisplayed'] = (amx.isValueTrue(marker['markerDisplayed'])) ? true : false;
      }
      if (marker['id'] != undefined)
      {
        dataItem['id'] = marker['id'];
      }
      if (marker['action'] != undefined)
      {
        dataItem['action'] = marker['action'];
      }
      // add rowKey to the cache for data selection callbacks
      rowKeyCache[marker['id']] = marker['_rowKey'];

      // store the data item to the options series object
      if (chartType === 'bubble' || chartType === 'scatter')
      {
        ser['data'].push(dataItem);
      }
      else 
      {
        ser['data'][groupIndex] = dataItem;
      }
    }
  }

  /**
   * returns a reference to the series object.  First tries to find
   * the existing series by its id. If not found, creates a new series
   * object with the name and empty data array.
   */
  dvtm.getSeriesByIdAndName = function (amxNode, id, name)
  {
    var chartType = dvtm.getChartType(amxNode);
    var series = amxNode["_dataObj"]['series'];
    var groups = amxNode["_dataObj"]['groups'];
    var data = [];
    var s;
    var ser;

    // find existing series or create a new one
    for (s = 0;s < series.length;s++)
    {
      if (series[s]['id'] === id)
        break;
    }
    if (s < series.length)
    {
      ser = series[s];
    }
    else 
    {
      // for bubble and scatter charts, disable the series legend
      if (chartType === 'bubble' || chartType === 'scatter')
      {
        ser = { 'id' : id, 'name' : name, 'displayInLegend' : 'off', 'data' : [] };
      }
      else
      // for BLA charts initialize the data with 'null' for each group
      {
        for (var i = 0; i < groups.length; i++)
          data.push(null);
        ser = { 'id' : id, 'name' : name, 'displayInLegend' : 'on', 'data' : data };
      }
      series.push(ser);
    }
    return ser;
  }

  /**
   * returns a index of the group in the groups array.  First tries to find
   * the group by its id. If not found, looks for the group by the name
   */
  dvtm.getGroupIndexByIdOrName = function (amxNode, id, name)
  {
    var groups = amxNode["_dataObj"]['groups'];
    var g;

    if (id)
    {
      for (g = 0; g < groups.length; g++)
      {
        if (groups[g]['id'] === id)
          return g;
      }
    }
    else
    {
      for (g = 0; g < groups.length; g++)
      {
        if (groups[g] === name)
          return g;
      }
    }
    // not found, something's wrong, return null
    return null;
  }

  /**
   *  adds a new group to the groups array
   *
   *  if groupId exists, the group is identified by groupId, and a new groups
   *  item is created as: {'id': groupId, name: group}
   *  if groupId is missing, the group is identified by the 'group' parameter
   *  and the groups item is a plain string
   */
  dvtm.addGroup = function (amxNode, groupId, group)
  {
    var groups = amxNode["_dataObj"]['groups'];
    var g = 0;

    for (g = 0;g < groups.length;g++)
    {
      if (groupId)
      {
        if (groups[g]['id'] === groupId)
          return;
      }
      else 
      {
        if (groups[g] === group)
          return;
      }
    }
    if (g >= groups.length)
    {
      if (groupId)
      {
        groups.push(
        {
          'id' : groupId, 'name' : group
        });
      }
      else if (group !== undefined)
      {
        groups.push(group);
      }
    }
  }

  /**
   *
   */
  dvtm.processSeriesStyle = function (amxNode, seriesStyleNode)
  {
    var series = amxNode["_dataObj"]['series'];

    // seriesStyle can be matched on seriesId or series, seriesId takes precedence, if present
    var seriesId;
    if (seriesStyleNode.isAttributeDefined('seriesId'))
    {
      seriesId = seriesStyleNode.getAttribute('seriesId');
    }
    else if (seriesStyleNode.isAttributeDefined('series'))
    {
      seriesId = seriesStyleNode.getAttribute('series');
    }
    else 
    {
      // no id to match this seriesStyle on, exit
      return;
    }

    // find the series item to be updated
    var ser;
    var s = 0;
    for (s = 0;s < series.length;s++)
    {
      if (seriesId === series[s]['id'])
        break;
    }

    if (s < series.length)
    {
      ser = series[s];
    }
    else 
    {
      // series not found by name, something's wrong
      return;
    }

    // do not apply the style, if 'rendered' is defined and evaluates to false
    if (seriesStyleNode.isAttributeDefined('rendered'))
    {
      if (amx.isValueFalse(seriesStyleNode.getAttribute('rendered')))
        return;
    }

    // set the series type for combo chart
    if (seriesStyleNode.isAttributeDefined('type'))
    {
      ser['type'] = seriesStyleNode.getAttribute('type');
    }
    else
    {
      ser['type'] = 'line';
    }

    // set common series properties
    if (seriesStyleNode.isAttributeDefined('color'))
    {
      ser['color'] = seriesStyleNode.getAttribute('color');
    }
    if (seriesStyleNode.isAttributeDefined('borderColor'))
    {
      ser['borderColor'] = seriesStyleNode.getAttribute('borderColor');
    }
    if (seriesStyleNode.isAttributeDefined('markerDisplayed'))
    {
      if (seriesStyleNode.getAttribute('markerDisplayed') === "true" || seriesStyleNode.getAttribute('markerDisplayed') === "on")
        ser['markerDisplayed'] = true;
      else 
        ser['markerDisplayed'] = false;
    }
    if (seriesStyleNode.isAttributeDefined('markerShape'))
    {
      ser['markerShape'] = seriesStyleNode.getAttribute('markerShape');
    }
    if (seriesStyleNode.isAttributeDefined('markerColor'))
    {
      ser['markerColor'] = seriesStyleNode.getAttribute('markerColor');
    }
    if (seriesStyleNode.isAttributeDefined('markerSize'))
    {
      ser['markerSize'] =  + seriesStyleNode.getAttribute('markerSize');
    }
    if (seriesStyleNode.isAttributeDefined('lineWidth'))
    {
      ser['lineWidth'] =  + seriesStyleNode.getAttribute('lineWidth');
    }
    if (seriesStyleNode.isAttributeDefined('lineStyle'))
    {
      ser['lineStyle'] = seriesStyleNode.getAttribute('lineStyle');
    }
    if (seriesStyleNode.isAttributeDefined('assignedToY2'))
    {
      ser.assignedToY2 = seriesStyleNode.getAttribute('assignedToY2');
    }
  }

  /**
   * parses the sparkDataItem node attributes
   *
   * sparkDataItem has the following attributes
   *
   *   color            - String(Color): support CSS color values
   *   date             - Number: ms since 1970/1/1
   *   floatValue       - Number: the float value
   *   markerDisplayed  - Boolean: should marker display
   *   rendered         - Boolean: should spark data item render
   *   value            - Number: the spark data item value
   *
   */
  dvtm.processSparkDataItem = function (amxNode, sparkItemNode)
  {
    var data = amxNode["_dataObj"];
    var item = {};
    var attr;

    if (data['items'] == undefined)
    {
      data['items'] = [];
    }

    attr = sparkItemNode.getAttribute('color');
    if (attr)
    {
      item['color'] = attr;
    }
    attr = sparkItemNode.getAttribute('date');
    if (attr)
    {
      item.date = attr;
      data['timeAxisType'] = 'enabled';
    }
    attr = sparkItemNode.getAttribute('floatValue');
    if (attr !== undefined)
    {
      item['floatValue'] = attr;
    }
    attr = sparkItemNode.getAttribute('markerDisplayed');
    if (sparkItemNode.isAttributeDefined('markerDisplayed'))
    {
      item['markerDisplayed'] = (amx.isValueTrue(sparkItemNode.getAttribute('markerDisplayed'))) ? true : false;
    }
    if (sparkItemNode.isAttributeDefined('rendered'))
    {
      item['rendered'] = (amx.isValueTrue(sparkItemNode.getAttribute('rendered'))) ? true : false;
    }
    attr = sparkItemNode.getAttribute('value');
    if (attr !== undefined)
    {
      item['value'] = attr;
    }

    data['items'].push(item);
  }

  /**
   * parses the threshold node attributes
   *
   * threshold has the following attributes
   *
   *   borderColor - String(Color): support CSS color values
   *   color       - String(Color): support CSS color values
   *   text        - String: the threshold text
   *   value       - Number: the breakpoint of the range
   *
   */
  dvtm.processThreshold = function (amxNode, thresholdNode)
  {
    var data = amxNode["_dataObj"];
    var threshold = {};
    var attr;

    if (data['thresholds'] == undefined)
    {
      data['thresholds'] = [];
    }

    attr = thresholdNode.getAttribute('borderColor');
    if (attr)
      threshold['borderColor'] = attr;
    attr = thresholdNode.getAttribute('color');
    if (attr)
      threshold['color'] = attr;
    attr = thresholdNode.getAttribute('text');
    if (attr)
      threshold['text'] = attr;
    attr = thresholdNode.getAttribute('maxValue');
    if (attr)
      threshold['maxValue'] =  + attr;

    data['thresholds'].push(threshold);

  }

  /**
   * Indicates whether the chart represented by the amxNode is a pieChart
   */
  dvtm.isPieChart = function (amxNode)
  {
    if (amxNode.getTag().getName() === 'pieChart')
      return true;
    else 
      return false;
  }

  /**
   * Converts an ISO 8601 encoded date string to a timestamp
   *
   * @param dateStr a string containing a date/time (supposedly in ISO 8601 format)
   * @return a converted date as a timestamp, or the original date string, if the conversion failed
   */
  dvtm._convertDate = function (dateStr)
  {
    var date = new Date(dateStr);

    if (!isNaN(date))
    {
      return date.getTime();
    }
    else 
    {
      return dateStr;
    }
  }
})();
(function() {

  dvtm.DefaultGaugeStyle = 
  {
    // default animation duration in milliseconds
    'animationDuration': 1000,
    // default animation effect on data change
    'animationOnDataChange': "none",
    // default animation effect on gauge display
    'animationOnDisplay': "none",
    // default visual effect
    'visualEffects': "auto"
  };

  // location of dial gauge resources
  dvtm.DIAL_GAUGE_IMAGE_PATH = 'css/images/chart/gauge/';
  
  dvtm.DEFAULT_DIAL_GAUGE_PROPERTIES = 
  {
    'background' : 'circleAntique',
    'indicator' : 'needleAntique'
  };
  
  dvtm.DEFAULT_DIAL_GAUGE_BACKGROUND_INDICATOR_MAPS = 
  {
    'indicatorToBackground':
    {
      'needleAntique' : 'circleAntique',
      'needleLight' : 'circleLight',
      'needleDark' : 'circleDark'
    },
    
    'backgroundToIndicator' : 
    {
      'rectangleAntique' : 'needleAntique',
      'rectangleAntiqueCustom' : 'needleAntique',
      'domeAntique' : 'needleAntique',
      'domeAntiqueCustom' : 'needleAntique',
      'circleAntique' : 'needleAntique',
      'circleAntiqueCustom' : 'needleAntique',
      
      'rectangleLight' : 'needleLight',
      'rectangleLightCustom' : 'needleLight',
      'domeLight' : 'needleLight',
      'domeLightCustom' : 'needleLight',
      'circleLight' : 'needleLight',
      'circleLightCustom' : 'needleLight',
      
      'rectangleDark' : 'needleDark',
      'rectangleDarkCustom' : 'needleDark',
      'domeDark' : 'needleDark',
      'domeDarkCustom' : 'needleDark',
      'circleDark' : 'needleDark',
      'circleDarkCustom' : 'needleDark'
    }
  };
    
  dvtm.DefaultDialGaugeStyle = 
  {
    'backgrounds' : 
    {
      "rectangleAntique" : 
      {
        "anchorX" : 100.5,
        "anchorY" : 95.8,
        "startAngle" : 207.6,
        "angleExtent" : 235,
        "indicatorLength" : 1.05,
        "images" : [
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"antique/bg-rectangle-200x200-bidi.png",
          "width" : 200,
          "height" : 168,
          "bidi" : true
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"antique/bg-rectangle-200x200.png",
          "width" : 200,
          "height" : 168
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"antique/bg-rectangle-400x400-bidi.png",
          "width" : 400,
          "height" : 335,
          "bidi" : true
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"antique/bg-rectangle-400x400.png",
          "width" : 400,
          "height" : 335
        } ],
        "metricLabelBounds" :
        {
          "x" : 79,
          "y" : 125,
          "width" : 42,
          "height" : 40
        }
      },
      
      "rectangleAntiqueCustom" : 
      {
        "anchorX" : 100.5,
        "anchorY" : 95.8,
        "startAngle" : 207.6,
        "angleExtent" : 235,
        "indicatorLength" : 1.05,
        "radius": 65,
        "majorTickCount": 6,
        "images" : [
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"antique/bg-rectangle-200x200-noLabels.png",
          "width" : 200,
          "height" : 168,
          "bidi" : true
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"antique/bg-rectangle-200x200-noLabels.png",
          "width" : 200,
          "height" : 168
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"antique/bg-rectangle-400x400-noLabels.png",
          "width" : 400,
          "height" : 335,
          "bidi" : true
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"antique/bg-rectangle-400x400-noLabels.png",
          "width" : 400,
          "height" : 335
        } ],
        "metricLabelBounds" :
        {
          "x" : 79,
          "y" : 125,
          "width" : 42,
          "height" : 40
        }
      },      
      
      "domeAntique" : 
      {
        "anchorX" : 99.3,
        "anchorY" : 95.8,
        "startAngle" : 195.5,
        "angleExtent" : 210.8,
        "indicatorLength" : 0.98,
        "images" : [
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"antique/bg-dome-200x200-bidi.png",
          "width" : 200,
          "height" : 176,
          "bidi" : true
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"antique/bg-dome-200x200.png",
          "width" : 200,
          "height" : 176
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"antique/bg-dome-400x400-bidi.png",
          "width" : 400,
          "height" : 352,
          "bidi" : true
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"antique/bg-dome-400x400.png",
          "width" : 400,
          "height" : 352
        } ],
        "metricLabelBounds" :
        {
          "x" : 81,
          "y" : 135,
          "width" : 38,
          "height" : 35
        }
      },

      "domeAntiqueCustom" : 
      {
        "anchorX" : 99.3,
        "anchorY" : 95.8,
        "startAngle" : 195.5,
        "angleExtent" : 210.8,
        "indicatorLength" : 0.98,
        "radius": 65,
        "majorTickCount": 6,
        "images" : [
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"antique/bg-dome-200x200-noLabels.png",
          "width" : 200,
          "height" : 176,
          "bidi" : true
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"antique/bg-dome-200x200-noLabels.png",
          "width" : 200,
          "height" : 176
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"antique/bg-dome-400x400-noLabels.png",
          "width" : 400,
          "height" : 352,
          "bidi" : true
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"antique/bg-dome-400x400-noLabels.png",
          "width" : 400,
          "height" : 352
        } ],
        "metricLabelBounds" :
        {
          "x" : 81,
          "y" : 135,
          "width" : 38,
          "height" : 35
        }
      },
      
      "circleAntique" : 
      {
        "anchorX" : 100,
        "anchorY" : 100,
        "startAngle" : 220.5,
        "angleExtent" : 261.1,
        "indicatorLength" : 0.85,
        "images" : [
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"antique/bg-circle-200x200-bidi.png",
          "width" : 200,
          "height" : 200,
          "bidi" : true
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"antique/bg-circle-200x200.png",
          "width" : 200,
          "height" : 200
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"antique/bg-circle-400x400-bidi.png",
          "width" : 400,
          "height" : 400,
          "bidi" : true
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"antique/bg-circle-400x400.png",
          "width" : 400,
          "height" : 400
        } ],
        "metricLabelBounds" :
        {
          "x" : 77,
          "y" : 133,
          "width" : 46,
          "height" : 34
        }
      },
    
     "circleAntiqueCustom" : 
      {
        "anchorX" : 100,
        "anchorY" : 100,
        "startAngle" : 220.5,
        "angleExtent" : 261.1,
        "indicatorLength" : 0.85,
        "radius": 63,
        "majorTickCount": 6,
        "images" : [
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"antique/bg-circle-200x200-noLabels.png",
          "width" : 200,
          "height" : 200,
          "bidi" : true
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"antique/bg-circle-200x200-noLabels.png",
          "width" : 200,
          "height" : 200
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"antique/bg-circle-400x400-noLabels.png",
          "width" : 400,
          "height" : 400,
          "bidi" : true
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"antique/bg-circle-400x400-noLabels.png",
          "width" : 400,
          "height" : 400
        } ],
        "metricLabelBounds" :
        {
          "x" : 77,
          "y" : 133,
          "width" : 46,
          "height" : 34
        }
      },

      "rectangleLight" : 
      {
        "anchorX" : 100,
        "anchorY" : 91.445,
        "startAngle" : 211,
        "angleExtent" : 242,
        "indicatorLength" : 1.1,
        "images" : [
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"light/bg-rectangle-200x200-bidi.png",
          "width" : 200,
          "height" : 154,
          "bidi" : true
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"light/bg-rectangle-200x200.png",
          "width" : 200,
          "height" : 154
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"light/bg-rectangle-400x400-bidi.png",
          "width" : 400,
          "height" : 307,
          "bidi" : true
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"light/bg-rectangle-400x400.png",
          "width" : 400,
          "height" : 307
        } ],
        "metricLabelBounds" :
        {
          "x" : 78,
          "y" : 75,
          "width" : 44,
          "height" : 38
        }
      },
      
      "rectangleLightCustom" : 
      {
        "anchorX" : 100,
        "anchorY" : 91.445,
        "startAngle" : 211,
        "angleExtent" : 242,
        "indicatorLength" : 1.1,
        "radius": 60.5,
        "majorTickCount": 6,
        "images" : [
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"light/bg-rectangle-200x200-noLabels.png",
          "width" : 200,
          "height" : 154,
          "bidi" : true
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"light/bg-rectangle-200x200-noLabels.png",
          "width" : 200,
          "height" : 154
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"light/bg-rectangle-400x400-noLabels.png",
          "width" : 400,
          "height" : 307,
          "bidi" : true
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"light/bg-rectangle-400x400-noLabels.png",
          "width" : 400,
          "height" : 307
        } ],
        "metricLabelBounds" :
        {
          "x" : 78,
          "y" : 75,
          "width" : 44,
          "height" : 38
        }
      },
      
      "domeLight" : 
      {
        "anchorX" : 100.2,
        "anchorY" : 89,
        "startAngle" : 201,
        "angleExtent" : 222,
        "indicatorLength" : 1.23,
        "images" : [
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"light/bg-dome-200x200-bidi.png",
          "width" : 200,
          "height" : 138,
          "bidi" : true
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"light/bg-dome-200x200.png",
          "width" : 200,
          "height" : 138
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"light/bg-dome-400x400-bidi.png",
          "width" : 400,
          "height" : 276,
          "bidi" : true
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"light/bg-dome-400x400.png",
          "width" : 400,
          "height" : 276
        } ],
        "metricLabelBounds" :
        {
          "x" : 80,
          "y" : 70,
          "width" : 41,
          "height" : 39
        }
      },
      
      "domeLightCustom" : 
      {
        "anchorX" : 100.2,
        "anchorY" : 89,
        "startAngle" : 201,
        "angleExtent" : 222,
        "indicatorLength" : 1.23,
        "radius": 57,
        "majorTickCount": 6,
        "images" : [
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"light/bg-dome-200x200-noLabels.png",
          "width" : 200,
          "height" : 138,
          "bidi" : true
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"light/bg-dome-200x200-noLabels.png",
          "width" : 200,
          "height" : 138
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"light/bg-dome-400x400-noLabels.png",
          "width" : 400,
          "height" : 276,
          "bidi" : true
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"light/bg-dome-400x400-noLabels.png",
          "width" : 400,
          "height" : 276
        } ],
        "metricLabelBounds" :
        {
          "x" : 80,
          "y" : 70,
          "width" : 41,
          "height" : 39
        }
      },

      "circleLight" : 
      {
        "anchorX" : 100,
        "anchorY" : 100,
        "startAngle" : 220.5,
        "angleExtent" : 261.1,
        "indicatorLength" : 0.82,
        "images" : [
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"light/bg-circle-200x200-bidi.png",
          "width" : 200,
          "height" : 200,
          "bidi" : true
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"light/bg-circle-200x200.png",
          "width" : 200,
          "height" : 200
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"light/bg-circle-400x400-bidi.png",
          "width" : 400,
          "height" : 400,
          "bidi" : true
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"light/bg-circle-400x400.png",
          "width" : 400,
          "height" : 400
        } ],
        "metricLabelBounds" :
        {
          "x" : 76,
          "y" : 82,
          "width" : 48,
          "height" : 40
        }
      },

      "circleLightCustom" : 
      {
        "anchorX" : 100,
        "anchorY" : 100,
        "startAngle" : 220.5,
        "angleExtent" : 261.1,
        "indicatorLength" : 0.82,
        "radius": 60,
        "majorTickCount": 6,
        "images" : [
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"light/bg-circle-200x200-noLabels.png",
          "width" : 200,
          "height" : 200,
          "bidi" : true
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"light/bg-circle-200x200-noLabels.png",
          "width" : 200,
          "height" : 200
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"light/bg-circle-400x400-noLabels.png",
          "width" : 400,
          "height" : 400,
          "bidi" : true
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"light/bg-circle-400x400-noLabels.png",
          "width" : 400,
          "height" : 400
        } ],
        "metricLabelBounds" :
        {
          "x" : 76,
          "y" : 82,
          "width" : 48,
          "height" : 40
        }
      },
      
      "circleDark" : 
      {
        "anchorX" : 100,
        "anchorY" : 100,
        "startAngle" : 220.5,
        "angleExtent" : 261.5,
        "indicatorLength" : 0.82,
        "images" : [
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"dark/bg-circle-200x200-bidi.png",
          "width" : 200,
          "height" : 200,
          "bidi" : true
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"dark/bg-circle-200x200.png",
          "width" : 200,
          "height" : 200
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"dark/bg-circle-400x400-bidi.png",
          "width" : 400,
          "height" : 400,
          "bidi" : true
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"dark/bg-circle-400x400.png",
          "width" : 400,
          "height" : 400
        } ],
        "metricLabelBounds" :
        {
          "x" : 76,
          "y" : 82,
          "width" : 48,
          "height" : 40
        }
      },
  
      "circleDarkCustom" : 
      {
        "anchorX" : 100,
        "anchorY" : 100,
        "startAngle" : 220.5,
        "angleExtent" : 261.5,
        "indicatorLength" : 0.82,
        "radius": 63,
        "majorTickCount": 6,
        "images" : [
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"dark/bg-circle-200x200-noLabels.png",
          "width" : 200,
          "height" : 200,
          "bidi" : true
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"dark/bg-circle-200x200-noLabels.png",
          "width" : 200,
          "height" : 200
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"dark/bg-circle-400x400-noLabels.png",
          "width" : 400,
          "height" : 400,
          "bidi" : true
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"dark/bg-circle-400x400-noLabels.png",
          "width" : 400,
          "height" : 400
        } ],
        "metricLabelBounds" :
        {
          "x" : 76,
          "y" : 82,
          "width" : 48,
          "height" : 40
        }
      },

      "rectangleDark" : 
      {
        "anchorX" : 100.2,
        "anchorY" : 99.5,
        "startAngle" : 201,
        "angleExtent" : 222,
        "indicatorLength" : 1.1,
        "images" : [
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"dark/bg-rectangle-200x200-bidi.png",
          "width" : 200,
          "height" : 154,
          "bidi" : true
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"dark/bg-rectangle-200x200.png",
          "width" : 200,
          "height" : 154
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"dark/bg-rectangle-400x400-bidi.png",
          "width" : 400,
          "height" : 307,
          "bidi" : true
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"dark/bg-rectangle-400x400.png",
          "width" : 400,
          "height" : 307
        } ],
        "metricLabelBounds" :
        {
          "x" : 80,
          "y" : 83,
          "width" : 41,
          "height" : 36
        }
      },
      
      "rectangleDarkCustom" : 
      {
        "anchorX" : 100.2,
        "anchorY" : 99.5,
        "startAngle" : 201,
        "angleExtent" : 222,
        "indicatorLength" : 1.1,
        "radius": 65,
        "majorTickCount": 6,
        "images" : [
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"dark/bg-rectangle-200x200-noLabels.png",
          "width" : 200,
          "height" : 154,
          "bidi" : true
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"dark/bg-rectangle-200x200-noLabels.png",
          "width" : 200,
          "height" : 154
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"dark/bg-rectangle-400x400-noLabels.png",
          "width" : 400,
          "height" : 307,
          "bidi" : true
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"dark/bg-rectangle-400x400-noLabels.png",
          "width" : 400,
          "height" : 307
        } ],
        "metricLabelBounds" :
        {
          "x" : 80,
          "y" : 83,
          "width" : 41,
          "height" : 36
        }
      },

      "domeDark" : 
      {
        "anchorX" : 100.2,
        "anchorY" : 89,
        "startAngle" : 201,
        "angleExtent" : 222,
        "indicatorLength" : 1.23,
        "images" : [
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"dark/bg-dome-200x200-bidi.png",
          "width" : 200,
          "height" : 138,
          "bidi" : true
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"dark/bg-dome-200x200.png",
          "width" : 200,
          "height" : 138
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"dark/bg-dome-400x400-bidi.png",
          "width" : 400,
          "height" : 276,
          "bidi" : true
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"dark/bg-dome-400x400.png",
          "width" : 400,
          "height" : 276
        } ],
        "metricLabelBounds" :
        {
          "x" : 80,
          "y" : 73,
          "width" : 41,
          "height" : 36
        }
      },
      
      "domeDarkCustom" : 
      {
        "anchorX" : 100.2,
        "anchorY" : 89,
        "startAngle" : 201,
        "angleExtent" : 222,
        "indicatorLength" : 1.23,
        "radius": 57,
        "majorTickCount": 6,
        "images" : [
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"dark/bg-dome-200x200-noLabels.png",
          "width" : 200,
          "height" : 138,
          "bidi" : true
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"dark/bg-dome-200x200-noLabels.png",
          "width" : 200,
          "height" : 138
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"dark/bg-dome-400x400-noLabels.png",
          "width" : 400,
          "height" : 276,
          "bidi" : true
        },
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"dark/bg-dome-400x400-noLabels.png",
          "width" : 400,
          "height" : 276
        } ],
        "metricLabelBounds" :
        {
          "x" : 80,
          "y" : 73,
          "width" : 41,
          "height" : 36
        }
      }
    },

    'indicators' : 
    {
      "needleAntique" : 
      {
        "anchorX" : 42,
        "anchorY" : 510,
        "images" : [
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"antique/needle-1600x1600.png",
          "width" : 81,
          "height" : 734
        } ]
      },

      "needleLight" : 
      {
        "anchorX" : 227,
        "anchorY" : 425,
        "images" : [
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"light/needle-1600x1600.png",
          "width" : 454,
          "height" : 652
        } ]
      },

      "needleDark" : {
        "anchorX" : 227,
        "anchorY" : 425,
        "images" : [
        {
          "source" : dvtm.DIAL_GAUGE_IMAGE_PATH+"dark/needle-1600x1600.png",
          "width" : 454,
          "height" : 652
        } ]
      }
    }
  }
  
})();

/* ------------------------------------------------------ */
/*
 * This file includes the DVT gauge type handlers
 */
/* ------------------------------------------------------ */

// dial gauge background/indicator image caches
dvtm.dialGaugeStyles = {};
dvtm.dialGaugeStylesLoaded = false;

// ------ jQuery Mobile Renderer ------ //
(function ()
{
  /**
   * Common gauge object
   */
  dvtm.CommonGauge = function ()
  {
  }

  /**
   * AMX 'create' callback handler
   */
  dvtm.CommonGauge.prototype.create = function (amxNode)
  {
    dvtm.initGaugeAmxNode(amxNode);
    dvtm.setCommonGaugeProperties(amxNode);

    if (amxNode.getTag().getName() === 'dialGauge')
    {
      dvtm.setDialGaugeProperties(amxNode);
    }

    if (amxNode.getTag().getName() === 'statusMeterGauge')
    {
      dvtm.setStatusMeterGaugeProperties(amxNode);   
    }

    if (amxNode.getTag().getName() === 'ratingGauge')
    {
      dvtm.setRatingGaugeProperties(amxNode);   
    }
    
    if (amxNode.getTag().getName() !== 'ratingGauge')
    {
      // rating gauge has no child tags
      dvtm.processGaugeChildTags(amxNode);
    }
    
    return dvtm.setupChartDiv(amxNode);
  }

  /**
   * AMX 'init' callback handler
   */
  dvtm.CommonGauge.prototype.init = function ($node, amxNode)
  {
    dvtm.initChartDomNode($node, amxNode);
  }

  /**
   * AMX 'postDisplay' callback handler
   */
  dvtm.CommonGauge.prototype.postDisplay = function ($node, amxNode)
  {
    dvtm.renderChart($node, amxNode);
  }

  /**
   * AMX 'updateChildren' callback handler
   */
  dvtm.CommonGauge.prototype.updateChildren = function (amxNode, attributeChanges)
  {
    // always refresh on any value change
    return adf.mf.api.amx.AmxNodeChangeResult['REFRESH'];
  }

  /**
   * AMX 'refresh' callback handler
   */
  dvtm.CommonGauge.prototype.refresh = function (amxNode, attributeChanges)
  {
    var $node = $(document.getElementById(amxNode.getId()));

    dvtm.initGaugeAmxNodeForRefresh(amxNode, attributeChanges);
    dvtm.setCommonGaugeProperties(amxNode);

    if (amxNode.getTag().getName() === 'dialGauge')
    {
      dvtm.setDialGaugeProperties(amxNode);
    }

    if (amxNode.getTag().getName() === 'statusMeterGauge')
    {
      dvtm.setStatusMeterGaugeProperties(amxNode);
    }

    if (amxNode.getTag().getName() === 'ratingGauge')
    {
      dvtm.setRatingGaugeProperties(amxNode);
    }
    else {
      dvtm.processGaugeChildTags(amxNode);
    }
    dvtm.renderChart($node, amxNode);
  }

  dvtm.CommonGauge.prototype.destroy = function($node, amxNode)
  {
    dvtm.destroyChartDomNode($node, amxNode);
  }
  // register gauge renderers with the 'dvtm' namespace  
  amx.registerRenderers("dvtm", 
  {
    'ledGauge' : new dvtm.CommonGauge(),
    'statusMeterGauge' : new dvtm.CommonGauge(),
    'dialGauge' : new dvtm.CommonGauge(),
    'ratingGauge' : new dvtm.CommonGauge()
  });

  /**
   * Process gauge child tags
   */
  dvtm.processGaugeChildTags = function (amxNode)
  {
    var options = amxNode["_optionsObj"];

    // get all children of the gauge tag
    var children = amxNode.getChildren();
    var iter = adf.mf.api.amx.createIterator(children);
    var gaugeLabelFormatDone = false;

    // and process them one by one
    while (iter.hasNext())
    {
      var child = iter.next();

      switch (child.getTag().getName())
      {
        case 'referenceLine':
          dvtm.processReferenceObj(amxNode, child, 'statusMeterGauge');
          break;
        case 'threshold':
          dvtm.processThreshold(amxNode, child);
          break;
        case 'tickLabel':
          dvtm.processTickLabel(amxNode, child, 'scale');
          break;
        case 'metricLabel':
          dvtm.processTickLabel(amxNode, child, 'metric');
          break;
        case 'gaugeLabelFormat':
          // @deprecated case
          if (!gaugeLabelFormatDone)
          {
            if (!options['metricLabel'])
            {
              options['metricLabel'] = {};
            }

            var converter = child.getConverter();
            if (converter)
            {
              options['metricLabel']['converter'] = converter;
              dvtm.setOptionsDirty(amxNode, true);
            }

            if (child.isAttributeDefined('scaling'))
            {
              var attr = child.getAttribute('scaling');
              if (attr !== options['metricLabel']['scaling'])
              {
                options['metricLabel']['scaling'] = attr;
                dvtm.setOptionsDirty(amxNode, true);
              }
            }

            gaugeLabelFormatDone = true;
          }
          break;
        default :
          break;
      }
    }
  }
  
  /**
   * Initializes the gauge amxNode with the default dataObject and optionsObject.
   * Should be called as the first thing in tag:create.
   */
  dvtm.initGaugeAmxNode = function (amxNode)
  {
    amxNode["_optionsObj"] = 
    {
      'legend' : {},
      'metricLabel' : {
        'rendered' : false,
        'scaling' : 'auto'
      }
    }

    amxNode["_dataObj"] = {};
    
    if (dvtm.isDialGauge(amxNode)) 
    {
      amxNode['_optionsObj']['tickLabel'] = 
      {
        'rendered' : true,
        'scaling' : 'auto'
      };
    }
    
    if (dvtm.isRatingGauge(amxNode)) 
    {
      amxNode['_optionsObj']['selected'] = {};
      amxNode['_optionsObj']['unselected'] = {};
      amxNode['_optionsObj']['hover'] = {};
      amxNode['_optionsObj']['changed'] = {};
    }
    
    if(dvtm.isStatusMeterGauge(amxNode))
    {
      amxNode["_optionsObj"]['indicatorSize'] = 1;
      amxNode["_optionsObj"]['thresholdDisplay'] = 'onIndicator';
      amxNode["_optionsObj"]['plotArea'] = 
      {
        'rendered' : 'auto'
      };      
    }
    
    amxNode[dvtm.COMPONENT_INSTANCE] = null;
    
    // load required resources
    dvtm.loadCanvasToolkitJs();
    dvtm.loadChartResourceBundles();
  }

  /**
   * Initializes the gauge amxNode on refresh by copying the old amxNode properties.
   * Should be called from tag:refresh.
   */
  dvtm.initGaugeAmxNodeForRefresh = function (amxNode, attributeChanges)
  {
    // make a note that this is a refresh phase
    amxNode['_refreshing'] = true;
    amxNode['_attributeChanges'] = attributeChanges;

    // clear the 'dirty' flag on the options object
    dvtm.setOptionsDirty(amxNode, false);

    // data object will be recreated from scratch
    amxNode["_dataObj"] = {};    
  }

  dvtm._createDialGaugeImage = function (imageElem)
  {
    var image = {};
    image['source'] = dvtm._getAttributeValue(imageElem, 'source');
    image['width'] = parseFloat(dvtm._getAttributeValue(imageElem, 'width'));
    image['height'] = parseFloat(dvtm._getAttributeValue(imageElem, 'height'));
    var bidi = dvtm._getAttributeValue(imageElem, 'bidi');
    if (bidi)
    {
      image['bidi'] = (bidi.trim().toLowerCase() == 'true' ? true : false);
    }
    return image;
  }

  dvtm.setDialGaugeProperties = function (amxNode)
  {
    var options = amxNode["_optionsObj"];
    var refreshing = amxNode["_refreshing"];
    
    if (amxNode.getTag().getName() === "dialGauge")
    {
      // if style template exists, load predefined backgrounds/indicators
      if (!refreshing && !dvtm.dialGaugeStylesResolved)
      {
        dvtm.dialGaugeStylesResolved = true;
  
        dvtm.dialGaugeStyles['backgrounds'] = dvtm.DefaultDialGaugeStyle['backgrounds'];
        dvtm.dialGaugeStyles['indicators'] = dvtm.DefaultDialGaugeStyle['indicators'];
  
        // if CustomDialGaugeStyle is defined, merge it with the default style
        if (window['CustomDialGaugeStyle'] != undefined)
        {
          var item, imgs, imgIndx;
          if (window['CustomDialGaugeStyle']['backgrounds'] != undefined)
          {
            for (item in window['CustomDialGaugeStyle']['backgrounds'])
            {
              dvtm.dialGaugeStyles['backgrounds'][item] = window['CustomDialGaugeStyle']['backgrounds'][item];
              imgs = dvtm.dialGaugeStyles['backgrounds'][item]["images"];
              for (imgIndx = 0;imgIndx < imgs.length;imgIndx++)
              {
                imgs[imgIndx]["source"] = amx.buildRelativePath(imgs[imgIndx]["source"]);
              }
            }
          }
          if (window['CustomDialGaugeStyle']['indicators'] != undefined)
          {
            for (item in window['CustomDialGaugeStyle']['indicators'])
            {
              dvtm.dialGaugeStyles['indicators'][item] = window['CustomDialGaugeStyle']['indicators'][item];
              imgs = dvtm.dialGaugeStyles['indicators'][item]["images"];
              for (imgIndx = 0;imgIndx < imgs.length;imgIndx++)
              {
                imgs[imgIndx]["source"] = amx.buildRelativePath(imgs[imgIndx]["source"]);
              }
            }
          }
        }
      }

      var dialGaugeBackground = amxNode.getAttribute('background');
      var dialGaugeIndicator = amxNode.getAttribute('indicator');
     
      if (!dialGaugeBackground || dvtm.dialGaugeStyles['backgrounds'][dialGaugeBackground] === undefined)
      {
        var b2iMap = dvtm.DEFAULT_DIAL_GAUGE_BACKGROUND_INDICATOR_MAPS['indicatorToBackground'];
        var defaultDialGaugeBackground = dvtm.DEFAULT_DIAL_GAUGE_PROPERTIES['background'];
        dialGaugeBackground = dvtm.getValueByKeyWithDefault(b2iMap, dialGaugeIndicator, defaultDialGaugeBackground);
      }
      
      if (!dialGaugeIndicator || dvtm.dialGaugeStyles['indicators'][dialGaugeIndicator] === undefined)
      {
        var i2bMap = dvtm.DEFAULT_DIAL_GAUGE_BACKGROUND_INDICATOR_MAPS['backgroundToIndicator'];
        var defaultDialGaugeIndicator = dvtm.DEFAULT_DIAL_GAUGE_PROPERTIES['indicator'];
        dialGaugeIndicator = dvtm.getValueByKeyWithDefault(i2bMap, dialGaugeBackground, defaultDialGaugeIndicator);
      }
             
      options['background'] = dvtm.dialGaugeStyles['backgrounds'][dialGaugeBackground];          
      options['indicator'] = dvtm.dialGaugeStyles['indicators'][dialGaugeIndicator];  
    }
  }
 
  dvtm.setStatusMeterGaugeProperties = function (amxNode) {
    if (amxNode.getTag().getName() === "statusMeterGauge")
    {
      var options = amxNode["_optionsObj"];
      if (amxNode.isAttributeDefined('indicatorSize')) 
      {
        var indicatorSize = amxNode.getAttribute('indicatorSize');      
        indicatorSize =  dvtm.processPercetageAttribute(indicatorSize);       
        if (indicatorSize !== options['indicatorSize'])
        {
          options['indicatorSize'] = indicatorSize;
          dvtm.setOptionsDirty(amxNode, true);
        }
      }
     
      if (amxNode.isAttributeDefined('plotArea'))
      {
        var plotArea = amxNode.getAttribute('plotArea');
        if (plotArea !== options['plotArea']['rendered'])
        {
          options['plotArea']['rendered'] = plotArea;
          dvtm.setOptionsDirty(amxNode, true);
        }
      }  
     
      if (amxNode.isAttributeDefined('thresholdDisplay'))
      {
        var thresholdDisplay = amxNode.getAttribute('thresholdDisplay');
        if (thresholdDisplay && thresholdDisplay !== options['thresholdDisplay'])
        {
          options['thresholdDisplay'] = thresholdDisplay;
          dvtm.setOptionsDirty(amxNode, true);
        }
      }           
    }
  }

  /**
   * processes ratingGauge properties
   * 
   * @param amxNode amxNode associated with this ratingGauge component
   * @return html div element representing this ratingGauge component
   */
  dvtm.setRatingGaugeProperties = function (amxNode) 
  {
    var DEFAULT_VALUE = 3;
    var DEFAULT_MIN_VALUE = 0;
    var DEFAULT_MAX_VALUE = 5;
    var DEFAULT_SHAPE = 'star';
  
    var options = amxNode["_optionsObj"];
    var data = amxNode["_dataObj"];
    var refreshing = amxNode["_refreshing"];
    var attr;

    // first, apply JSON style properties
    if (!refreshing)
    {
      // if we got here, assume the options object *will* be modified
      dvtm.setOptionsDirty(amxNode, true);

      var styleJSON;

      if (window['CustomGaugeStyle'] != undefined)
      {
        styleJSON = DvtJSONUtils.merge(window['CustomGaugeStyle'], dvtm.DefaultGaugeStyle);
      }
      else 
      {
        styleJSON = dvtm.DefaultGaugeStyle;
      }

      // the 'optionsObject' is a result of the default and custom style
      amxNode['_optionsObj'] = DvtJSONUtils.merge(styleJSON, options);
      options = amxNode['_optionsObj'];
    }

    attr = amxNode.getAttribute('emptyText');
    if (attr !== undefined && attr !== options['emptyText'])
    {
      options['emptyText'] = attr;
      dvtm.setOptionsDirty(amxNode, true);
    }

    attr = amxNode.getAttribute('value');
    if (attr !== undefined && !isNaN( + attr))
    {
      data['value'] =  +attr;
    }
    // use default value in DT mode
    else if (amx.dtmode) 
    {
      data['value'] = DEFAULT_VALUE;
    }

    attr = amxNode.getAttribute('minValue');
    if (attr !== undefined && !isNaN( + attr))
    {
      data['minValue'] =  +attr;
    }
    else 
    {
      data['minValue'] = DEFAULT_MIN_VALUE;
    }

    attr = amxNode.getAttribute('maxValue');
    if (attr !== undefined && !isNaN( + attr))
    {
      data['maxValue'] =  +attr;
    }
    else 
    {
      data['maxValue'] = DEFAULT_MAX_VALUE;
    }

    var shape = DEFAULT_SHAPE;
    var unselectedShape;
    
    if (amxNode.isAttributeDefined('shape')) 
    {
      shape = amxNode.getAttribute('shape');
      options['selected']['shape'] = shape;
      // make the 'changed' and 'hover' states follow the selected shape
      options['changed']['shape'] = shape;
      options['hover']['shape'] = shape;
    }
  
    if (amxNode.isAttributeDefined('unselectedShape'))
    {
      unselectedShape = amxNode.getAttribute('unselectedShape');
      // if 'auto', follow the selected shape
      if (unselectedShape === 'auto')
        options['unselected']['shape'] = shape;
      else
        options['unselected']['shape'] = unselectedShape;
    }
    else 
    {
      options['unselected']['shape'] = shape;
    }

    if (amxNode.isAttributeDefined('inputIncrement'))
    {
      options['inputIncrement'] = amxNode.getAttribute('inputIncrement');
    }

    var readOnly = false;
    if (amxNode.isAttributeDefined('readOnly'))
    {
      if (amx.isValueTrue(amxNode.getAttribute('readOnly')))
      {
        readOnly = true;
      }
    }
    if (readOnly !== options['readOnly'])
    {
      options['readOnly'] = readOnly;
      dvtm.setOptionsDirty(amxNode, true);
    }
    
    var changed = false;
    if (amxNode.isAttributeDefined('changed'))
    {
      if (amx.isValueTrue(amxNode.getAttribute('changed')))
      {
        changed = true;
      }
    }
    data['changed'] = changed;
    
    if (amxNode.isAttributeDefined('shortDesc'))
    {
      data['tooltip'] = amxNode.getAttribute('shortDesc');
    }
  }
  
  /**
   * sets common gauge properties found on the amxNode
   */
  dvtm.setCommonGaugeProperties = function (amxNode)
  {
    var DEFAULT_MIN_VALUE = 0;
    var DEFAULT_MAX_VALUE = 100;
    var DEFAULT_VALUE = 65;
    var DEFAULT_COLOR = '#33CC33';
    var DEFAULT_BORDER_COLOR = null;

    var options = amxNode["_optionsObj"];
    var data = amxNode["_dataObj"];
    var refreshing = amxNode["_refreshing"];
    var attr;

    // first, apply JSON style properties
    if (!refreshing)
    {

      // if we got here, assume the options object *will* be modified
      dvtm.setOptionsDirty(amxNode, true);

      var styleJSON;

      if (window['CustomGaugeStyle'] != undefined)
      {
        styleJSON = DvtJSONUtils.merge(window['CustomGaugeStyle'], dvtm.DefaultGaugeStyle);
      }
      else 
      {
        styleJSON = dvtm.DefaultGaugeStyle;
      }

      // the 'optionsObject' is a result of the default and custom style
      amxNode['_optionsObj'] = DvtJSONUtils.merge(styleJSON, options);
      options = amxNode['_optionsObj'];
    }

    // now set the attribute values (may overridevalues set in the skin)
    if (amxNode.isAttributeDefined('animationDuration'))
    {
      attr = amxNode.getAttribute('animationDuration') * 1;
      if (attr !== options['animationDuration'])
      {
        options['animationDuration'] = attr;
        dvtm.setOptionsDirty(amxNode, true);
      }
    }
    attr = amxNode.getAttribute('animationOnDisplay');
    if (attr && (attr !== options['animationOnDisplay']))
    {
      options['animationOnDisplay'] = attr;
      dvtm.setOptionsDirty(amxNode, true);
    }
    attr = amxNode.getAttribute('animationOnDataChange');
    if (attr && (attr !== options['animationOnDataChange']))
    {
      options['animationOnDataChange'] = attr;
      dvtm.setOptionsDirty(amxNode, true);
    }
    attr = amxNode.getAttribute('labelDisplay');
    if (attr !== undefined && (attr === 'on') !== options['metricLabel']['rendered'])
    {
      options['metricLabel']['rendered'] = (attr === 'on');
      dvtm.setOptionsDirty(amxNode, true);
    }
    attr = amxNode.getAttribute('emptyText');
    if (attr !== undefined && attr !== options['emptyText'])
    {
      options['emptyText'] = attr;
      dvtm.setOptionsDirty(amxNode, true);
    }
    attr = amxNode.getAttribute('type');
    if (attr !== undefined && attr !== options['type'])
    {
      options['type'] = attr;
      dvtm.setOptionsDirty(amxNode, true);
    }
    attr = amxNode.getAttribute('visualEffects');
    if (attr !== undefined && attr !== options['visualEffects'])
    {
      options['visualEffects'] = attr;
      dvtm.setOptionsDirty(amxNode, true);
    }

    attr = amxNode.getAttribute('value');
    if (attr !== undefined && !isNaN( + attr))
    {
      data['value'] =  + attr;
    }
    else 
    {
      data['value'] = DEFAULT_VALUE;
    }
    attr = amxNode.getAttribute('minValue');
    if (attr !== undefined && !isNaN( + attr))
    {
      data['minValue'] =  + attr;
    }
    else 
    {
      data['minValue'] = DEFAULT_MIN_VALUE;
    }
    attr = amxNode.getAttribute('maxValue');
    if (attr !== undefined && !isNaN( + attr))
    {
      data['maxValue'] =  + attr;
    }
    else 
    {
      data['maxValue'] = DEFAULT_MAX_VALUE;
    }

    if (amxNode.getTag().getName('tagName') === 'ledGauge') {                 
      attr = amxNode.getAttribute('size');
      if (attr !== undefined) {
        data['size'] = dvtm.processPercetageAttribute(attr);
      }
    }

    attr = amxNode.getAttribute('borderColor');
    if (!refreshing && (attr == undefined))
    {
      options['borderColor'] = DEFAULT_BORDER_COLOR;
    }
    else if (attr && (attr !== options['borderColor']))
    {
      options['borderColor'] = attr;
      dvtm.setOptionsDirty(amxNode, true);
    }

    attr = amxNode.getAttribute('color');
    if (!refreshing && (attr == undefined))
    {
      options['color'] = DEFAULT_COLOR;
    }
    else if ((attr !== undefined) && (attr !== options['color']))
    {
      options['color'] = attr;
      dvtm.setOptionsDirty(amxNode, true);
    }

    var readOnly = true;
    if (amxNode.isAttributeDefined('readOnly'))
    {
      if (amx.isValueFalse(amxNode.getAttribute('readOnly')))
      {
        readOnly = false;
      }
    }
    if (readOnly !== options['readOnly'])
    {
      options['readOnly'] = readOnly;
      dvtm.setOptionsDirty(amxNode, true);
    }

    if (amxNode.isAttributeDefined('shortDesc'))
    {
      data['tooltip'] = amxNode.getAttribute('shortDesc');
    }

    if (amxNode.isAttributeDefined('rotation'))
    {
      data['rotation'] = amxNode.getAttribute('rotation');
    }
  }

})();
/* ------------------------------------------------------ */
/*
 * This file includes the dvtm:geographicMap tag processor
 */
/* ------------------------------------------------------ */

// ------ jQuery Mobile Renderer ------ //
(function () 
{
  /**
   * - first param is the namespace.
   * - second param is a js object where each property name matches the tag name to be rendered
   */
  amx.registerRenderers("dvtm", 
  {
    'geographicMap' :  
    {
      'create' : function (amxNode) 
      {
        var $content = dvtm.setupGeographicMapDiv(amxNode);
        
        try 
        {
          dvtm.initGeographicMapAmxNode(amxNode);
          dvtm.setGeographicMapProperties(amxNode);
          dvtm.processGeographicMapChildTags(amxNode);
        } catch (ex) 
        {
          $content["_readyToRender"] = false;
          
          if (ex instanceof dvtm.exception.NodeNotReadyToRenderException){
            adf.mf.log.Framework.logp(adf.mf.log.level.INFO, "dvtm.geographicMap", "create", ex);
          } else {
            adf.mf.log.Framework.logp(adf.mf.log.level.SEVERE, "dvtm.geographicMap", "create", "Exception: " + ex.message);
          }
        }
        return $content;
      },
      
      'init' : function ($node, amxNode) 
      {
        dvtm.initGeographicMapDomNode($node, amxNode);
        dvtm.setCssBasedGeographicMapProperties($node, amxNode);
      },
      
      'postDisplay' : function ($node, amxNode) 
      {
        if ($node["_readyToRender"] === true) 
        {
          try {
            dvtm.renderGeographicMap($node, amxNode);
          }
          catch (ex) {
            adf.mf.log.Framework.logp(adf.mf.log.level.SEVERE, 
              "dvtm.geographicMap", "postDisplay", "Exception: " + ex.message);
          }
        }
      },
      
      'refresh' : function (amxNode, attributeChanges) 
      {
        var $node = $(document.getElementById(amxNode.getId()));
        dvtm.initGeographicMapAmxNodeForRefresh(amxNode, attributeChanges);
        
        try 
        {
          dvtm.setGeographicMapProperties(amxNode);
          dvtm.processGeographicMapChildTags(amxNode);
          dvtm.renderGeographicMap($node, amxNode);
        }
        catch (ex) {
          adf.mf.log.Framework.logp(adf.mf.log.level.SEVERE, 
            "dvtm.geographicMap", "refresh", "Exception: " + ex.message);
        }
      },

      'destroy' : function($node, amxNode)
      {
        dvtm.removeResizeCallback(amxNode.getId());
      }
    },
    
    'pointDataLayer' : dvtm.dataLayerRenderer
  });
    
  /**
   * load javascript
   */
   dvtm.loadJS = function (url, success, failure) 
   {
     var head = document.getElementsByTagName("head")[0];
     var script = document.createElement("script");
     script.type = "text/javascript";
     script.src = url;
     script.async = false;
     script.onload = success;
     script.onerror = failure;
     head.appendChild(script);
   }
  
  /**
   * get the mapId
   */
   dvtm.getMapId = function (amxNode) 
   {
     var mapId = '';
     if (amxNode.getId()) 
     {
         mapId = amxNode.getId();
     } else 
     {
         mapId = "map_canvas";
     }
     return mapId;
   }
  
  /**
   * sets up geographic map's outer div element
   */
  dvtm.setupGeographicMapDiv = function (amxNode) 
  {
    var idAttr = '';
    var mapId = dvtm.getMapId(amxNode);
    idAttr = 'id="' + mapId + '"';
    
    // this is the default geographic map div with 100% width/height
    var $content = $('<div ' + idAttr + ' style="width: 100%; height: 100%;"><\/div>');

    // set a private flag to indicate whether the node can be populated with contents
    // should an exception occur during data processing, this flag will be set to false
    $content['_readyToRender'] = true;
      
    return $content;
  }
  
  /**
   * Initializes the geographicMap amxNode with the default dataObject and optionsObject.
   * Should be called as the first thing in tag:create.
   */
  dvtm.initGeographicMapAmxNode = function(amxNode) 
  {
    amxNode["_optionsObj"] = {'mapOptions': {}};

    // if the data attribute is defined, use it to initialize the data object
    if (amxNode.isAttributeDefined('data'))
        amxNode["_dataObj"] = amxNode.getAttribute('data');
    else
        amxNode["_dataObj"] = {'dataLayers': []};

    // clear the component instance object
    amxNode[dvtm.COMPONENT_INSTANCE] = null;
    
    if (amxNode['_selectionListenerCache'] == undefined)
      amxNode['_selectionListenerCache'] = {};
  }

  /*
   * Initializes the DOM node corresponding to the geographic map's 'div'.
   * Should be called as the first thing in tag:init.
   */
  dvtm.initGeographicMapDomNode = function($node, amxNode) 
  {
    dvtm.initDvtmComponent($node, amxNode, dvtm.renderGeographicMap);

    $node.tap(function() 
    {
      if (amx.acceptEvent()) 
      {
        var event = new amx.ActionEvent();
        amx.processAmxEvent($node, "action", undefined, undefined, event);
      }
    });
  }

  /**
   * Initializes the geographic map amxNode on refresh by copying the old amxNode properties.
  * Should be called from tag:refresh.
  */
  dvtm.initGeographicMapAmxNodeForRefresh = function(amxNode, attributeChanges) 
  {
      // make a note that this is a refresh phase
      amxNode['_refreshing'] = true;
      amxNode['_attributeChanges'] = attributeChanges;

      // clear the 'dirty' flag on the options object
      dvtm.setOptionsDirty(amxNode, false);

      // dataObject will be recreated from scratch
      amxNode["_dataObj"] = {'dataLayers': []};

  }
  
  /**
   * Sets the geographic map properties found on the amxNode
   */
  dvtm.setGeographicMapProperties = function(amxNode) 
  {
    var options = amxNode["_optionsObj"];
    var refreshing = amxNode["_refreshing"];
    var attr;

    // if style template exists, apply its properties first
    // don't bother setting the style defaults on refresh though
    if (!refreshing) 
    {
    //TODO
    }

    attr = amxNode.getAttribute('mapType');
    if (attr) {
      options['mapOptions']['mapType'] = attr;
      dvtm.setOptionsDirty(amxNode, true);
    }
    attr = amxNode.getAttribute('centerX');
    if (attr) {
      options['mapOptions']['centerX'] = attr;
      dvtm.setOptionsDirty(amxNode, true);
    }
    attr = amxNode.getAttribute('centerY');
    if (attr) {
      options['mapOptions']['centerY'] = attr;
      dvtm.setOptionsDirty(amxNode, true);
    }
    attr = amxNode.getAttribute('zoomLevel');
    if (attr) {
      options['mapOptions']['zoomLevel'] = attr;
      dvtm.setOptionsDirty(amxNode, true);
    }
    attr = amxNode.getAttribute('initialZooming');
    if (attr) {
      options['mapOptions']['initialZooming'] = attr;
      dvtm.setOptionsDirty(amxNode, true);
    }
    attr = amxNode.getAttribute('animationOnDisplay');
    if (attr) {
      options['mapOptions']['animationOnDisplay'] = attr;
      dvtm.setOptionsDirty(amxNode, true);
    }
    attr = amxNode.getAttribute('shortDesc');
    if (attr) {
      options['mapOptions']['shortDesc'] = attr;
      dvtm.setOptionsDirty(amxNode, true);
    }
  }
  
  /**
   * Sets the geographic map properties found on the amxNode
   * @throws NodeNotReadyToRenderException exception thrown in case that the model is not ready
   */
  dvtm.processGeographicMapChildTags = function(amxNode) 
  { 
    dvtm.processGeographicMapPointDataLayerTags(amxNode, amxNode, true);        
  }
  
  /**
   * Process the point data layer tag
   * @throws NodeNotReadyToRenderException exception thrown in case that the model is not ready
   */
  dvtm.processGeographicMapPointDataLayerTags = function(amxNode, node, setMapProp) 
  {
    var data = amxNode["_dataObj"];

    var children = node.getChildren();
    var iter = adf.mf.api.amx.createIterator(children);

    while (iter.hasNext()) 
    {
      var pointDataLayerNode = iter.next();
      
      if (pointDataLayerNode.isAttributeDefined('rendered') && amx.isValueFalse(pointDataLayerNode.getAttribute('rendered')))
        continue;
      
      // accept only dvtm:pointDataLayer nodes
      if (pointDataLayerNode.getTag().getName() !== 'pointDataLayer') 
      {
        continue;
      }
      
      // if the model is not ready don't render the map
      if (!pointDataLayerNode.isRendered()) 
      {
        throw new dvtm.exception.NodeNotReadyToRenderException;
      }

      var dataLayer = {};
      var attr;
      
      var idx = iter.getRowKey();
      dataLayer['idx'] = idx;
      
      attr = pointDataLayerNode.getAttribute('id');
      if (attr)
        dataLayer['id'] = attr;

      attr = pointDataLayerNode.getAttribute('animationOnDuration');
      if (attr)
        dataLayer['animationOnDuration'] = attr;

      attr = pointDataLayerNode.getAttribute('animationOnDataChange');
      if (attr)
        dataLayer['animationOnDataChange'] = attr;

      attr = pointDataLayerNode.getAttribute('selectedRowKeys');
      if (attr)
        dataLayer['selectedRowKeys'] = attr;

      attr = pointDataLayerNode.getAttribute('dataSelection');
      if (attr)
        dataLayer['dataSelection'] = attr;
        
      attr = pointDataLayerNode.getTag().getAttribute('selectionListener');
      if (attr) {
        var selectionListenerCache = amxNode['_selectionListenerCache'];
        if (selectionListenerCache[idx] == undefined) {
          selectionListenerCache[idx] = attr;
        }
      }

      attr = pointDataLayerNode.getAttribute('emptyText');
      if (attr)
        dataLayer['emptyText'] = attr;

      dvtm.processGeographicMapPointLocationTag(amxNode, dataLayer, pointDataLayerNode);

      data['dataLayers'].push(dataLayer);
    }
  }

  dvtm.processGeographicMapPointLocationTag = function(amxNode, dataLayer, pointDataLayerNode) 
  {
    dataLayer['data'] = [];
    var varName = pointDataLayerNode.getAttribute('var');
    var value = pointDataLayerNode.getAttribute('value');
     
    if(value)
    {
      // collection is available so iterate through data and process each pointLocation
      var iter = adf.mf.api.amx.createIterator(value);
      while (iter.hasNext()) 
      {
        var stamp = iter.next();
        var children = pointDataLayerNode.getChildren(null, iter.getRowKey());
        // set context variable for child tag processing
        adf.mf.el.addVariable(varName, stamp);
        // iteration through all child elements
        var iter2 = adf.mf.api.amx.createIterator(children);
        while (iter2.hasNext()) 
        {
          var pointLocNode = iter2.next();
          var rowKey = stamp.rowKey();
           // process each location node
          dvtm._processGeographicMapPointLocation(amxNode, dataLayer, pointLocNode, rowKey);
        }        
        adf.mf.el.removeVariable(varName);
      } 
    }
    else
    {
      // collection does not exist so iterate only through child tags
      // and resolve them without var context variable
      var tagChildren = pointDataLayerNode.getChildren();
      var childTagIterator = adf.mf.api.amx.createIterator(tagChildren);
      
      while (childTagIterator.hasNext()) 
      {
        var tagPointLocNode = childTagIterator.next();
        var tagRowKey = "" + (childTagIterator.getRowKey() + 1);
         // process each location node
        dvtm._processGeographicMapPointLocation(amxNode, dataLayer, tagPointLocNode, tagRowKey);
      }
    }
  }
  
  dvtm._processGeographicMapPointLocation = function(amxNode, dataLayer, pointLocNode, rowKey)
  {
    // accept dvtm:pointLocation only
    if (pointLocNode.getTag().getName() !== 'pointLocation')
    {
      return;
    }
    
    if (pointLocNode.isAttributeDefined('rendered') && amx.isValueFalse(pointLocNode.getAttribute('rendered')))
    {
      return;
    }
    
    var data = {};
    
    if (pointLocNode.isAttributeDefined('type'))
    {
      data['type'] = pointLocNode.getAttribute('type');
    }
    if (pointLocNode.isAttributeDefined('pointX') && pointLocNode.isAttributeDefined('pointY')) 
    {
      data['x'] = pointLocNode.getAttribute('pointX');
      data['y'] = pointLocNode.getAttribute('pointY');
    }
    else if (pointLocNode.isAttributeDefined('address')) 
    {
      data['address'] = pointLocNode.getAttribute('address');
    }
    
    if (pointLocNode.isAttributeDefined('id'))
    {
      data['id'] = pointLocNode.getAttribute('id');
    }
    
    var markerNodes = pointLocNode.getChildren();

    if (markerNodes.length > 0 && markerNodes[0].getTag().getName() === 'marker') 
    {
      data['_rowKey'] = rowKey;
      dvtm.processGeographicMapDataItem(amxNode, data, markerNodes[0]);
    }
    
    dataLayer['data'].push(data);
  }
  
  dvtm.processGeographicMapDataItem = function(amxNode, data, dataNode) 
  { 
    // First check if this data item should be rendered at all
    if (dataNode.isAttributeDefined('rendered') && amx.isValueFalse(dataNode.getAttribute('rendered')))
      return;

    if (dataNode.isAttributeDefined('source'))
      data['source'] = amx.buildRelativePath(dataNode.getAttribute('source'));
    
    if (dataNode.isAttributeDefined('sourceHover'))
      data['sourceHover'] = amx.buildRelativePath(dataNode.getAttribute('sourceHover'));
      
    if (dataNode.isAttributeDefined('sourceSelected'))
      data['sourceSelected'] = amx.buildRelativePath(dataNode.getAttribute('sourceSelected'));
      
    if (dataNode.isAttributeDefined('sourceHoverSelected'))
      data['sourceHoverSelected'] = amx.buildRelativePath(dataNode.getAttribute('sourceHoverSelected'));
    
    if (dataNode.isAttributeDefined('shortDesc'))
      data['shortDesc'] = dataNode.getAttribute('shortDesc');

    data['clientId'] = dataNode.getId();

    if (dataNode.isAttributeDefined('action')) 
    {
      data['action'] = dataNode.getAttribute('action');
    }
    else {
      var firesAction = false;
      var actionTags;
      // should fire action, if there are any 'setPropertyListener' or 'showPopupBehavior' child tags  
      actionTags = dataNode.getTag().findTags(dvtm.AMX_NAMESPACE, 'setPropertyListener');
      if (actionTags.length > 0)
        firesAction = true;
      else {
        actionTags = dataNode.getTag().findTags(dvtm.AMX_NAMESPACE, 'showPopupBehavior');
        if (actionTags.length > 0)
          firesAction = true;
      }
      if (firesAction) {
        data['action'] = data['_rowKey'];
      }
    }    
  }


  // constants used in map API loading
  dvtm.apiCheckPeriodInMs = 250;
  // Wait for 10 seconds at maximum (then an interval is cleared)
  dvtm.apiCheckMaxTimeInMs = 10000;
  dvtm.apiCheckCountMax = Math.round(dvtm.apiCheckMaxTimeInMs / dvtm.apiCheckPeriodInMs);
  dvtm.apiCheckCount = 0;

  // DVT geographic map rendering context for the renderMap callback
  dvtm.geoMapContext = 
  {
    'amxNode' : null,
    'mapCavas' : null,
    'width' : 0,
    'height' : 0,
    'timer' : null
  };

  // a global callback for the geographic map rendering
  window.renderMap = function () 
  {
    // retrieve the context
    var amxNode = dvtm.geoMapContext['amxNode'];
    var data = amxNode['_dataObj'];
    var mapCanvas = dvtm.geoMapContext['mapCanvas'];
    var width = dvtm.geoMapContext['width'];
    var height = dvtm.geoMapContext['height'];
    var timer = dvtm.geoMapContext['timer'];
    var componentInstance = amxNode[dvtm.COMPONENT_INSTANCE];
  
    try 
    {
      if (window._isGeoMapApiSuccessfullyLoaded(componentInstance.getMapProvider()))
      {
        // API has been successfully loaded. Clear interval if needed and render the map.
        if (timer)
        {
          clearTimeout(timer);
          dvtm.geoMapContext['timer'] = null;
        }
        componentInstance.render(mapCanvas, data, width, height);
      } 
      else 
      {
        if (!timer)
        {
          /*
           Timer has not been initialized -> we know for sure that API has been loaded and that it hasn't 
           been loaded successfully unfortunatelly
          */
          adf.mf.log.Framework.logp(adf.mf.log.level.SEVERE, "dvtm.geographicMap", "renderGeographicMap", "Failed to load Map API!");
        } 
        else 
        {
          // Timer has been set up to periodically check if the API is ready and it is not ready
          // Increment API check counter or clear interval if api check count has exceeded the max count
          if (dvtm.apiCheckCount >= dvtm.apiCheckCountMax)
          {
            if (timer)
            {
              dvtm.geoMapContext['timer'] = null;
            }
          } 
          else 
          {
            dvtm.apiCheckCount++;
            dvtm.geoMapContext['timer'] = setTimeout(renderMap, dvtm.apiCheckPeriodInMs);
          }
        }
      }
    } catch(e) 
    {
      if (timer) 
      {
        clearTimeout(timer);
        dvtm.geoMapContext['timer'] = null;
      }
      throw e;
    }
  };
          
  /**
   * renders the geographic map and appends it to the parent node
   */
  dvtm.renderGeographicMap = function ($node, amxNode) 
  {
    var options = amxNode["_optionsObj"];
    var componentInstance = amxNode[dvtm.COMPONENT_INSTANCE];

    // first, get the width and height from style
    var width = dvtm.getComponentWidth($node, amxNode);
    var height = dvtm.getComponentHeight($node, amxNode);

    // on refresh, if the options object is empty, delete the old nodes content and recreate the component
    if (dvtm.isOptionsDirty(amxNode)) 
    {
      $node.empty();
    }

    // if the options object is dirty, or we're missing
    // the previous component object, create the document and context
    if (dvtm.isOptionsDirty(amxNode) || !componentInstance) 
    {
      var mapCallbackObj = {'callback': function(event, component) 
      {
          // fire the selectionChange event
          var type = event.getType();
          if (type == DvtSelectionEvent.TYPE) 
          {
            var selectedRowKeys = [];
            var selection = event.getSelection();
            var dataLayerIdx = event.getParamValue('dataLayerIdx');
            
            for (var i = 0; i < selection.length; i++) 
            {
              var rowKey = null;
              if (selection[i]['rowKey'])
                rowKey = selection[i]['rowKey'];
              if (rowKey != null)
                selectedRowKeys.push(rowKey);
            }
            var se = new amx.SelectionEvent(selectedRowKeys, selectedRowKeys);
            amx.processAmxEvent($node, 'selection', undefined, undefined, se).always(function() 
            {
              var params = [];
              var paramTypes = [];
              params.push(se);
              paramTypes.push(se[".type"]);
              
              var el = amxNode['_selectionListenerCache'][dataLayerIdx];
              if (el)
                amx.invokeEl(el, params, null, paramTypes);
            });
          } 
          else if (type == DvtMapActionEvent.TYPE) 
          {
            var clientId = event.getClientId();
            if (!clientId)
              return;
            var dataLayerId = dvtm.findDataLayerIdByIndex(amxNode, event.getParamValue('dataLayerIdx'));
            if (!dataLayerId)
              return;
            var dataLayerNode = dvtm.findDataLayerNodeById(amxNode, dataLayerId);
            if (dataLayerNode) 
            {            
              var locationNode;   
              if(dataLayerNode.getAttribute("value")) 
              {
                locationNode = dataLayerNode.getChildren(null, event.getRowKey())[0];
              } 
              else
              {
                locationNode = dataLayerNode.getChildren()[parseInt(event.getRowKey()) - 1];
              } 
              if (locationNode) 
              {
                var itemNode = null;
                var items = locationNode.getChildren();
                for (var j = 0; j < items.length; j++) 
                {
                  if (items[j].getId() === clientId) 
                  {
                    itemNode = items[j];
                    break;
                  }
                }
                if (itemNode) 
                {
                  // marker node found, fire event and handle action
                  var ae = new amx.ActionEvent();
                  amx.processAmxEvent(itemNode, 'action', undefined, undefined, ae).always(function() 
                  {
                    var action = itemNode.getTag().getAttribute('action');
                    if (action != null) 
                    {
                      adf.mf.api.amx.doNavigation(action);
                    }
                  });
                }
              }
            }
          }
        }
      };
      
      componentInstance = DvtGeographicMap.newInstance(mapCallbackObj.callback, mapCallbackObj, options);
      amxNode[dvtm.COMPONENT_INSTANCE] = componentInstance;
    } 
    
    dvtm.setOptionsDirty(amxNode, false);
    var mapCanvas = $node[0];
    //get the config keys from applicationScope
    var mapProviderEl = "#{applicationScope.configuration.mapProvider}";
    var geoMapKeyEl = "#{applicationScope.configuration.geoMapKey}";
    var geoMapClientIdEl = "#{applicationScope.configuration.geoMapClientId}";
    var mapViewerUrlEl = "#{applicationScope.configuration.mapViewerUrl}";
    var baseMapEl = "#{applicationScope.configuration.baseMap}";
    // key to detect if accessibility mode is on
    var accessibilityEnabledEl = "#{applicationScope.configuration.accessibilityEnabled}";
    var mapProvider = null;
    var geoMapKey = null;
    var geoMapClientId = null;
    var mapViewerUrl = null;
    var baseMap = null;
    var accessibilityEnabled = false;
    var mapConfig = new Array (mapProviderEl, geoMapKeyEl, geoMapClientIdEl, mapViewerUrlEl, baseMapEl);
    
    dvtm.geoMapContext['amxNode'] = amxNode;
    dvtm.geoMapContext['width'] = width;
    dvtm.geoMapContext['height'] = height;
    dvtm.geoMapContext['mapCanvas'] = mapCanvas;
    
    var mapConfigCallback = function (request, response) 
    {
      if (response && response.length > 0) 
      {
        for (var i = 0; i < response.length; i++) 
        {
          var name = response[i].name;
          var resolvedValue = response[i].value;
          if (typeof resolvedValue == 'string' || resolvedValue instanceof String) 
          {
            switch (name) 
            {
              case mapProviderEl:
                mapProvider = resolvedValue;
                break;
              case geoMapKeyEl:
                geoMapKey = resolvedValue;
                break;
              case geoMapClientIdEl:
                geoMapClientId = resolvedValue;
                break;
              case mapViewerUrlEl:
                mapViewerUrl = resolvedValue;
                break;
              case baseMapEl:
                baseMap = resolvedValue;
                break;
              default:
                break;
            }
          } 
          else if (typeof resolvedValue == 'boolean' && name == accessibilityEnabledEl ) 
          {
            accessibilityEnabled = resolvedValue;
          }
        }
      }
    
      
      if (mapProvider && (mapProvider.toLowerCase() == "googlemaps" || mapProvider.toLowerCase() == "oraclemaps"))
        mapProvider = mapProvider.toLowerCase();
      else 
        mapProvider = "googlemaps";
      
      var url;
      componentInstance.setMapProvider(mapProvider);
      
      if (accessibilityEnabled)
      {
        componentInstance.setScreenReaderMode(accessibilityEnabled);
      }
      
      // Bug 14522345
      window._isGeoMapApiSuccessfullyLoaded = function(providerUsed)
      {
        if(providerUsed == "googlemaps") 
        {
          return (typeof google === 'object' && typeof google.maps === 'object' && typeof google.maps.LatLng !== 'undefined');
        } else if(providerUsed == "oraclemaps") 
        {
          return (typeof MVSdoGeometry !== 'undefined');
        } else 
        {
          return true;
        }
      };
      
      
      var failure = function () 
      {
        adf.mf.log.Framework.logp(adf.mf.log.level.SEVERE, "dvtm.geographicMap", "renderGeographicMap", "Failed to load Map API!");
        dvtm.mapAPILoaded = false;
        $(this).remove();
        renderReloadPage();
      };
      
      var clearLoadPage = function()
      {
        $node.children(".dvtm-geographicMap-loadPage").each(function() {
          $(this).remove();
        });
      }
      
      var renderLoadingPage = function()
      {
        clearLoadPage();
        
        var loadDiv = document.createElement("div");
        adf.mf.internal.amx.addCSSClassName(loadDiv, "dvtm-geographicMap-loadPage");
      
        var innerDiv = document.createElement("div");
      
        var label = document.createElement("div");
        label.appendChild(document.createTextNode(adf.mf.resource.getInfoString("AMXInfoBundle","dvtm_geographicMap_LOADING_API")));
        innerDiv.appendChild(label);
        
        loadDiv.appendChild(innerDiv);
        
        $node.append(loadDiv);
      }

      var renderReloadPage = function()
      {
        clearLoadPage();
         
        var reloadDiv = document.createElement("div");
        adf.mf.internal.amx.addCSSClassName(reloadDiv, "dvtm-geographicMap-loadPage");
      
        var innerDiv = document.createElement("div");
      
        var label = document.createElement("div");
        label.appendChild(document.createTextNode(adf.mf.resource.getInfoString("AMXInfoBundle","dvtm_geographicMap_FAILED_LOAD_API")));
        innerDiv.appendChild(label);

        var button = document.createElement("div");
        button.setAttribute("tabindex", "0");
        label = document.createElement("label");
        adf.mf.internal.amx.addCSSClassName(label, "amx-commandButton-label");
        label.appendChild(document.createTextNode(adf.mf.resource.getInfoString("AMXInfoBundle","dvtm_geographicMap_RELOAD_BUTTON_LABEL")));
        button.appendChild(label);

        // Adding WAI-ARIA Attribute to the markup for the role attribute
        button.setAttribute("role", "button");
        adf.mf.internal.amx.addCSSClassName(button, "amx-node");
        adf.mf.internal.amx.addCSSClassName(button, "amx-commandButton");
        $(button).tap(function(){
          dvtm.renderGeographicMap($node, amxNode); 
        });
        innerDiv.appendChild(button);
      
        reloadDiv.appendChild(innerDiv);
      
        $node.append(reloadDiv);
        
      };
      
      var checkAccessAndLoadMapApi = function(mapApiUrl, providerUsed) {
        renderLoadingPage();
        
        var request = new XMLHttpRequest();
        request.onreadystatechange = function (evt) {
        if (request.readyState == 4) {
          if(request.status == 200) {
            //success
            var load = false;
            if(providerUsed == "googlemaps") 
            {
              load = request.responseText.indexOf("google.maps") != -1;
            } 
            else if(providerUsed == "oraclemaps") 
            {
              load = request.responseText.indexOf("MVSdoGeometry") != -1;
            } 
            else 
            {
              load = true;
            }
            
            if(load)
            {
              loadMapApi(mapApiUrl);
            }
            else
            {
              renderReloadPage();
            }
          } else {
            //error
            renderReloadPage();
          }
        }  
      }
      request.open('GET', mapApiUrl, true);
      request.send();
      };

      var loadMapApi = function (mapApiUrl) 
      {
        if (!dvtm.mapAPILoaded) 
        {
          /*
           API loading hasn't been started yet. Start loading the API asynchronously and call renderMap 
           callback when it is finished (or failure callback in case of failure).
           */
          dvtm.mapAPILoaded = true;
          if (mapProvider == "googlemaps")
            dvtm.loadJS(mapApiUrl, null, failure);
          else if (mapProvider == "oraclemaps")
            dvtm.loadJS(mapApiUrl, renderMap, failure);
        } 
        else 
        {
          /* 
           API loading has been already started (but can be in the middle). Set interval to periodically check
           if the map can be rendered (and then do the rendering).
           */
          if (dvtm.geoMapContext['timer']) 
          {
            clearTimeout(dvtm.geoMapContext['timer']);
          }
          dvtm.geoMapContext['timer'] = setTimeout(renderMap, dvtm.apiCheckPeriodInMs);
        }
      };
      
      if (mapProvider == "oraclemaps") 
      {
        if (mapViewerUrl == null)
              mapViewerUrl = "http://elocation.oracle.com/mapviewer";
            if (baseMap == null)
              baseMap = "ELOCATION_MERCATOR.WORLD_MAP";
            
            componentInstance.setMapViewerUrl(mapViewerUrl);
            componentInstance.setBaseMap(baseMap); 
            url = mapViewerUrl + "/fsmc/jslib/oraclemaps.js";
            checkAccessAndLoadMapApi(url, mapProvider);
      } else if (mapProvider == "googlemaps") 
      {
        var mapApiBaseUrl = "http://maps.googleapis.com/maps/api/js?sensor=false&callback=renderMap";
        if (geoMapKey)
          url = mapApiBaseUrl + "&key=" + geoMapKey;
        else if (geoMapClientId)
          url = mapApiBaseUrl + "&client=" + geoMapClientId;
        else 
          url = mapApiBaseUrl;
        checkAccessAndLoadMapApi(url, mapProvider);	  
      }
    }
    if (adf.mf.internal.isJavaAvailable())
      adf.mf.el.getValue(mapConfig, mapConfigCallback, mapConfigCallback);
    else
      mapConfigCallback(null, null);
  }
  
  /**
   * sets style properties based on CSS
   */
  dvtm.setCssBasedGeographicMapProperties = function($node, amxNode) 
  {
    var options = amxNode["_optionsObj"];

    // if we get here, assume the options objec *will* be modified
    dvtm.setOptionsDirty(amxNode, true);
    
    // component background color
    var bgColor = $node['css']('background-color');
    if (bgColor) 
        options['background-color'] = {'background-color': bgColor};    
  }
})();
/* ------------------------------------------------------ */
/*
 * This file includes the dvtm:sparkChart tag processor
 */
/* ------------------------------------------------------ */

// ------ jQuery Mobile Renderer ------ //
(function ()
{
  /**
   * - first param is the namespace.
   * - second param is a js object where each property name matches the tag name to be rendered
   */
  amx.registerRenderers("dvtm", 
  {
    'sparkChart' : 
    {
      'createChildrenNodes' : function (amxNode)
      {

        var iter, item;

        // create a cache of rowKeys to be removed in case of model update              
        amxNode['_currentRowKeys'] = [];
        // we want to skip the value validation if we are in dt mode
        if (!amx.dtmode)
        {
          amxNode.setState(adf.mf.api.amx.AmxNodeStates["INITIAL"]);

          // see if the chart is bound to a collection
          if (!amxNode.isAttributeDefined('value'))
          {
            return true;
          }

          var dataItems = amxNode.getAttribute('value');

          if (dataItems === undefined || dataItems == null)
          {
            // no data items, nothing to do
            return true;
          }

          var varName = amxNode.getAttribute('var');
          iter = adf.mf.api.amx.createIterator(dataItems);

          // copied from amx:listView - on refresh the component need to initiate
          // loading of rows not available in the cache
          if (iter.getTotalCount() > iter.getAvailableCount())
          {
            adf.mf.api.amx.showLoadingIndicator();
            //var currIndex = dataItems.getCurrentIndex();
            adf.mf.api.amx.bulkLoadProviders(dataItems, 0,  - 1, function ()
            {
              try 
              {
                // Call the framework to have the new children nodes constructed.
                adf.mf.internal.amx.markNodeForUpdate(amxNode, 
                {
                  "value" : true
                });
              }
              finally 
              {
                adf.mf.api.amx.hideLoadingIndicator();
              }
            },
            function ()
            {
              adf.mf.api.adf.logInfoResource("AMXInfoMessageBundle", adf.mf.log.level.SEVERE, "createChildrenNodes", "MSG_ITERATOR_FIRST_NEXT_ERROR", req, resp);
              adf.mf.api.amx.hideLoadingIndicator();
            });

            amxNode.setState(adf.mf.api.amx.AmxNodeStates["INITIAL"]);
            return true;
          }

          while (iter.hasNext())
          {
            item = iter.next();
            amxNode['_currentRowKeys'].push(iter.getRowKey());
            adf.mf.el.addVariable(varName, item);
            amxNode.createStampedChildren(iter.getRowKey(), ['dataStamp']);
            adf.mf.el.removeVariable(varName);
          }
        }
        var referenceObjectTags = amxNode.getTag().getChildren(dvtm.DVTM_NAMESPACE, 'referenceObject');

        iter = adf.mf.api.amx.createIterator(referenceObjectTags);
        while (iter.hasNext())
        {
          item = iter.next();
          var referenceObjectNode = item.buildAmxNode(amxNode);
          amxNode.addChild(referenceObjectNode);
        }

        amxNode.setState(adf.mf.api.amx.AmxNodeStates["ABLE_TO_RENDER"]);
        return true;
      },
      
      'visitChildren' : function (amxNode, visitContext, callback)
      {

        var children = amxNode.getChildren();
        for (var i = 0;i < children.length;i++)
        {
          children[i].visit(visitContext, callback);
        }

        var dataItems = amxNode.getAttribute('value');

        if (dataItems === undefined)
        {
          return amxNode.visitStampedChildren(null, null, null, visitContext, callback);
        }

        var varName = amxNode.getAttribute('var');
        var iter = adf.mf.api.amx.createIterator(dataItems);

        while (iter.hasNext())
        {
          var item = iter.next();
          adf.mf.el.addVariable(varName, item);
          try 
          {
            if (amxNode.visitStampedChildren(iter.getRowKey(), ['dataStamp'], null, visitContext, callback))
            {
              return true;
            }
          }
          finally 
          {
            adf.mf.el.removeVariable(varName);
          }
        }
        return false;
      },
      
      'create' : function (amxNode)
      {
        dvtm.initChartAmxNode(amxNode);
        dvtm.setCommonChartProperties(amxNode);

        var $content = dvtm.setupChartDiv(amxNode);

        try 
        {
          // if renderer detects design time mode than it skips standard 
          // child processing and only generates dummy data for graph.         
          if (amx.dtmode)
          {
            dvtm.processSparkDummyData(amxNode);
          }
          else 
          {
            dvtm.processSparkChildTags(amxNode);
          }
        }
        catch (ex)
        {
          $content['_readyToRender'] = false;
          adf.mf.log.Framework.logp(adf.mf.log.level.SEVERE, "dvtm.sparkChart", "create", "Exception: " + ex.message);
        }

        return $content;
      },
      
      'init' : function ($node, amxNode)
      {
        dvtm.initChartDomNode($node, amxNode);
      },
      
      'postDisplay' : function ($node, amxNode)
      {
        dvtm.renderChart($node, amxNode);
      },
      
      'updateChildren' : function (amxNode, attributeChanges)
      {
        return dvtm.updateChildrenNodes(amxNode, attributeChanges);
      },
      
      'refresh' : function (amxNode, attributeChanges)
      {
        return dvtm.refreshChart(amxNode, attributeChanges);
      },
      
      'destroy' : function($node, amxNode)
      {
        dvtm.destroyChartDomNode($node, amxNode);
      }
    }
  });
})();
(function() {

  dvtm.DefaultThematicMapStyle = 
  {
    // selected area properties
    'areaSelected': 
    {
      // selected area border color
      'borderColor': "#000000",
      // selected area border width
      'borderWidth': '1.5px'
    },

    // area properties on mouse hover
    'areaHover': 
    {
      // area border color on hover
      'borderColor': "#FFFFFF",
      // area border width on hover
      'borderWidth': '2.0px'
    },
    
    // marker properties
    'marker': 
    {
      // separator upper color
      'scaleX': 1.0,
      // separator lower color
      'scaleY': 1.0,
      // should display title separator
      'type': 'circle'
    },

    // thematic map legend properties
    'legend': 
    {
      // legend position none / auto / start / end / top / bottom
      'position': "auto"
    },
    
    // default style values
    'styleDefaults': {
      // default color palette
      'colors': ["#003366", "#CC3300", "#666699", "#006666", "#FF9900", "#993366", "#99CC33", "#624390", "#669933",
                 "#FFCC33", "#006699", "#EBEA79"],               
      // default marker shapes
      'shapes' : [ 'circle', 'square', 'plus', 'diamond', 'triangleUp', 'triangleDown', 'human']
    }
  };
  
  /**
   * contains information about top layer for each basemap
   */
  dvtm.THEMATICMAP_DEFAULT_TOP_LAYER_MAPPING = 
  {
    'world' : 'continents', 
    'worldRegions' : 'regions', 
    'usa' : 'country', 
    'africa' : 'continent', 
    'asia' : 'continent', 
    'australia' : 'continent', 
    'europe' : 'continent', 
    'northAmerica' : 'continent', 
    'southAmerica' : 'continent', 
    'apac' : 'region', 
    'emea' : 'region', 
    'latinAmerica' : 'region', 
    'usaAndCanada' : 'region'
  };

})();
/* ------------------------------------------------------ */
/*
 * This file includes the dvtm:thematicMap tag processor
 */
/* ------------------------------------------------------ */

// ------ jQuery Mobile Renderer ------ //
(function () {

  /**
   * - first param is the namespace.
   * - second param is a js object where each property name matches the tag name to be rendered
   */
  var loadedCustomBasemaps = {}; 
  
  amx.registerRenderers("dvtm", 
  {
    'thematicMap' :  
    {
      'create' : function (amxNode) 
      {
        var $content = dvtm.setupThematicMapDiv(amxNode);
        try {
          dvtm.initThematicMapAmxNode(amxNode);
          if (!amx.dtmode) 
          {        
            dvtm.setThematicMapProperties(amxNode);
            dvtm.processThematicMapChildren(amxNode);
          } else 
          {
            dvtm.prepareThematicMapDTMode(amxNode);         
          }
        } catch (ex) 
        {
          $content["_readyToRender"] = false;
          if (ex instanceof dvtm.exception.NodeNotReadyToRenderException)
          {
            adf.mf.log.Framework.logp(adf.mf.log.level.INFO, "dvtm.thematicMap", "create", ex);
          } else 
          {
            adf.mf.log.Framework.logp(adf.mf.log.level.SEVERE, 
              "dvtm.thematicMap", "create", "Exception: " + ex.message);
          }
        }
        return $content;
      },
      
      'init' : function ($node, amxNode) 
      {
        dvtm.initThematicMapDomNode($node, amxNode);
      },
      
      'postDisplay' : function ($node, amxNode) 
      {
        if ($node["_readyToRender"] === true) 
        {
          dvtm.renderThematicMap($node, amxNode);
        }
      },
      
      'refresh' : function (amxNode, attributeChanges) 
      {
        var $node = $(document.getElementById(amxNode.getId())); 
        dvtm.initThematicMapAmxNodeForRefresh(amxNode, attributeChanges);
        
        try 
        {
          dvtm.setThematicMapProperties(amxNode);
          dvtm.processThematicMapChildren(amxNode);
          dvtm.renderThematicMap($node, amxNode);
        }
        catch (ex) 
        {
          adf.mf.log.Framework.logp(adf.mf.log.level.SEVERE, 
              "dvtm.thematicMap", "refresh", "Exception: " + ex.message);
        }
      },

      'destroy' : function($node, amxNode)
      {
        dvtm.removeResizeCallback(amxNode.getId());
      }
    },
    
    'pointDataLayer' : dvtm.dataLayerRenderer,
    
    'areaDataLayer' : dvtm.dataLayerRenderer
  });
  
  /**
   * sets up thematic map's outer div element
   */
  dvtm.setupThematicMapDiv = function (amxNode) 
  {
    var idAttr = '';
    var id = amxNode.getId();
  
    if (id != undefined) {
      idAttr = 'id="' + id + '"';
    }
    // this is the default thematic map div with 100% width/height
    var $content = $('<div ' + idAttr + ' style="width: 100%; height: 100%;"><\/div>');
    
    // set a private flag to indicate whether the node can be populated with contents
    // should an exception occur during data processing, this flag will be set to false
    $content['_readyToRender'] = true;
    
    dvtm.setupLegendDiv(amxNode, $content);
    
    var $areaDiv = $('<div class="dvtm-area" style="display:none;"><\/div>');
    $content.append($areaDiv);
    
    var $areaLayerDiv = $('<div class="dvtm-areaLayer" style="display:none;"><\/div>');
    $content.append($areaLayerDiv);
    
    var $markerDiv = $('<div class="dvtm-marker" style="display:none;"><\/div>');
    $content.append($markerDiv);

    return $content;
  }
  
  /**
   * Initializes the thematicMap amxNode with the default dataObject and optionsObject.
   * Should be called as the first thing in tag:create.
   */
  dvtm.initThematicMapAmxNode = function(amxNode) 
  {
    // do not overwrite existing properties
    if (amxNode["_optionsObj"] == undefined) 
    {
      amxNode["_optionsObj"] = 
      {
        'animationDuration': 1000,
        'animationOnDisplay': 'none',
        'animationOnMapChange': 'none',
        'basemap': {},
        'zooming': 'none',
        'panning': 'none',
        'initialZooming': 'none',
        'tooltipDisplay': 'auto',
        'areaLayers': [],
        'layers': [],
        'areaLayerStyle': {},
        'areaStyles': {'area':{}, 'selected':{}, 'hover':{}},
        'markerStyle': {},
        'legend': {}
      };
    }

    // if the data attribute is defined, use it to initialize the data object
    if (amxNode.isAttributeDefined('data'))
      amxNode["_dataObj"] = amxNode.getAttribute('data');
    else
      amxNode["_dataObj"] = {'dataLayers': [], 'legend' : {}};

    // clear the component instance object
    amxNode[dvtm.COMPONENT_INSTANCE] = null;

    amxNode["_attributeGroups"] = [];
    amxNode['_stylesResolved'] = false;

    if (amxNode['_selectionListenerCache'] == undefined)
      amxNode['_selectionListenerCache'] = {};

    dvtm.loadCanvasToolkitJs();     
  }
  
  /**
   * Loads thematicMap base map layers and resources
   */
  dvtm.loadMapLayerAndResource = function(basemap, layer) 
  {
    var basemapName = basemap.charAt(0).toUpperCase() + basemap.slice(1);
    var layerName = layer.charAt(0).toUpperCase() + layer.slice(1);
    
    var baseMapLayer = "DvtBaseMap" + basemapName + layerName + ".js";
    amx.includeJs("js/thematicMap/basemaps/" + baseMapLayer);
    
    var locale = adf.mf.locale.getUserLanguage();
    // Do not load resource bundle if language is english because it is included in the base map by default 
    if (locale.indexOf("en") === -1) 
    {
      var bundleName = basemapName + layerName + "Bundle";
      dvtm.loadDvtResources("js/thematicMap/resource/" + bundleName);
    }      
  }
  
  /*
   * Initializes the DOM node corresponding to the thematic map's 'div'.
   * Should be called as the first thing in tag:init.
   */
  dvtm.initThematicMapDomNode = function($node, amxNode) 
  {
    dvtm.initDvtmComponent($node, amxNode, dvtm.renderThematicMap);
  }

  /**
   * Initializes the thematic map amxNode on refresh by copying the old amxNode properties.
  * Should be called from tag:refresh.
  */
  dvtm.initThematicMapAmxNodeForRefresh = function(amxNode, attributeChanges) 
  {
    // make a note that this is a refresh phase
    amxNode['_refreshing'] = true;
    amxNode['_attributeChanges'] = attributeChanges;

    // clear the 'dirty' flag on the options object
    dvtm.setOptionsDirty(newAmxNode, false);
    
    // dataObject will be recreated from scratch
    if (attributeChanges.hasChanged('value')) 
    {
      amxNode["_dataObj"] = {'dataLayers': []};

      amxNode["_attributeGroups"] = [];
      amxNode['_rowKeyCache'] = {};
    }
  }
  
  dvtm._getCustomBaseMapMetadata = function (src) 
  {
    if (loadedCustomBasemaps[src])
      return loadedCustomBasemaps[src];

    var request = new XMLHttpRequest();
    request.open("GET", src, false);
    request.send();
  
    if (request.readyState == 4 && XMLSerializer) 
    {
      var parser = new DOMParser();
      var metadataNode = parser.parseFromString(request.responseText, "text/xml");
      var layerNodes = metadataNode.getElementsByTagName('layer');
      for (var i = 0; i < layerNodes.length; i++) 
      {
        var imageNodes = layerNodes[i].getElementsByTagName('image');
        for (var j = 0; j< imageNodes.length; j++) 
        {
          var source = imageNodes[j].getAttribute('source');
          var relativePath = amx.buildRelativePath(source);
          imageNodes[j].setAttribute('source', relativePath);
        }
      }
      
      var serializer = new XMLSerializer();
      var serialized = serializer.serializeToString(metadataNode);
      loadedCustomBasemaps[src] = serialized;     
      return serialized;
    }
    
    return null;
  }
  
  /**
   * Sets the thematic map properties found on the amxNode
   */
  dvtm.setThematicMapProperties = function(amxNode) 
  {
    var options = amxNode["_optionsObj"];
    var refreshing = amxNode["_refreshing"];
    var styleJSON;

    // First apply JSON style properties. Do not set style defaults on refresh
    if (!refreshing) {
      if (window['CustomThematicMapStyle'] != undefined)
        styleJSON = DvtJSONUtils.merge(window['CustomThematicMapStyle'], dvtm.DefaultThematicMapStyle);
      else
        styleJSON = dvtm.DefaultThematicMapStyle;

      // set options dirty because at a minimum basemap will be set
      dvtm.setOptionsDirty(amxNode, true);
      // the 'optionsObject' is a result of the default and custom style
      amxNode['_optionsObj'] = DvtJSONUtils.merge(styleJSON, options);
      options = amxNode['_optionsObj'];
    }
    
    // marker styling
    if (styleJSON['marker']['type'])
      options['markerStyle']['type'] = styleJSON['marker']['type'];
    if (styleJSON['marker']['scaleX'] != undefined)
       options['markerStyle']['scaleX'] = styleJSON['marker']['scaleX'];
    if (styleJSON['marker']['scaleY'] != undefined)
       options['markerStyle']['scaleY'] = styleJSON['marker']['scaleY'];
    
    // selected area styling
    var selectStyle = '';
    if (styleJSON['areaSelected']['borderColor'])
      selectStyle = selectStyle + "border-color:" +  styleJSON['areaSelected']['borderColor'] + ';';
    if (styleJSON['areaSelected']['borderWidth'])
      selectStyle = selectStyle + "border-width:" + styleJSON['areaSelected']['borderWidth'] + ';';
    options['selectStyle'] = selectStyle;
    
    // hover area styling
    var hoverStyle = '';
    if (styleJSON['areaHover']['borderColor'])
      hoverStyle = hoverStyle + "border-color:" +  styleJSON['areaHover']['borderColor'] + ';';
    if (styleJSON['areaHover']['borderWidth'])
      hoverStyle = hoverStyle + "border-width:" + styleJSON['areaHover']['borderWidth'] + ';';
    options['hoverStyle'] = hoverStyle;
    
    if (amxNode.isAttributeDefined('animationDuration'))
      options['animationDuration'] = amxNode.getAttribute('animationDuration');
      
    if (amxNode.isAttributeDefined('animationOnDisplay'))
      options['animationOnDisplay'] = amxNode.getAttribute('animationOnDisplay');
      
    if (amxNode.isAttributeDefined('animationOnMapChange'))
      options['animationOnMapChange'] = amxNode.getAttribute('animationOnMapChange');
      
    if (amxNode.isAttributeDefined('initialZooming'))
      options['initialZooming'] = amxNode.getAttribute('initialZooming');

    if (amxNode.isAttributeDefined('initialZooming'))
      options['initialZooming'] = amxNode.getAttribute('initialZooming');

    if (amxNode.isAttributeDefined('zooming'))
      options['zooming'] = amxNode.getAttribute('zooming');

    if (amxNode.isAttributeDefined('panning'))
      options['panning'] = amxNode.getAttribute('panning');
      
    if (amxNode.isAttributeDefined('source')) {
      options['source'] = amx.buildRelativePath(amxNode.getAttribute('source'));
      options['customBasemap'] = dvtm._getCustomBaseMapMetadata(options['source']);
    }
      
    if (amxNode.isAttributeDefined('basemap'))
      options['basemap'] = amxNode.getAttribute('basemap');

    if (amxNode.isAttributeDefined('tooltipDisplay'))
      options['tooltipDisplay'] = amxNode.getAttribute('tooltipDisplay');
  }
  
  /**
   * Sets the thematic map properties found on the amxNode for DT mode
   */
  dvtm.prepareThematicMapDTMode = function(amxNode) 
  {
    var options = amxNode["_optionsObj"];         
    // we need to find proper basemap layer combination
    var searchResult = dvtm._findDTModeBaseMapAndLayer(amxNode);
    
    if(searchResult["basemap"] == null || searchResult["layer"] == null) 
    {  
      options['basemap'] = "world";
      dvtm._createDTModeAreaLayer(options, "continents");
    } else 
    {
      options['basemap'] = searchResult["basemap"];     
      dvtm._createDTModeAreaLayer(options, searchResult["layer"]);
    }  
  }
   
  /**
   * function returns basemap/layer combination by given attributes.
   */
  dvtm._findDTModeBaseMapAndLayer = function(amxNode) 
  {
    var basemap = null;
    var layer = null;
    
    if (amxNode.isAttributeDefined('basemap') && !amxNode.isAttributeDefined('source')) 
    {
      basemap = dvtm._nullIfEl(amxNode.getAttribute('basemap'));
      // When basemap is null we can skip all area layer childs since we have to
      // create fake values in any case.
      if(basemap != null) {      
        var children = amxNode.getChildren();
        for (var i=0;i<children.length;i++) 
        {
          // We just want to render just first area layer where we can determine layer value
          // and don't need to go through all area layers
          if (children[i].getTag().getName() == 'areaLayer') 
          {
            layer = dvtm._nullIfEl(children[i].getAttribute('layer'));
            if(layer != null) 
            {
              break;
            }
          }
        }
        // in case we don't find proper layer we try to determin layer by basemap
        if(layer == null) 
        {
          layer = dvtm._getDTModeTopLayer(basemap);
        }
      }
    } 
    return { "basemap": basemap, "layer": layer };
  }
  
  /**
   * function determines default top layer for given basemap.
   */
  dvtm._getDTModeTopLayer = function(baseMap)
  {  
    var topLayer = dvtm.THEMATICMAP_DEFAULT_TOP_LAYER_MAPPING[baseMap];
    if(topLayer) 
    {
       return topLayer;
    }
    return null;    
  }
  
  /**
   * functions check if value is EL expression. If so then it returns
   * null value.
   */
  dvtm._nullIfEl = function(value)
  {
    if(!value || value == null || value.indexOf("#{") > -1) 
    {
      return null;
    }
    return value;
  }
  
  /**
   * Prepares layer from user input in dt mode.
   */
  dvtm._createDTModeAreaLayer = function (options, layerName) 
  {     
    if (!options['layers'])
      options['layers'] = [];
    var layer = {};
    layer['type'] = "area";    
    layer['layer'] = layerName;
    // load resource and base map layer 
    dvtm.loadMapLayerAndResource(options['basemap'], layer['layer']); 
    options['layers'].push(layer);
  }
  
  /**
   * Sets the thematic map properties found on the amxNode.
   * @throws NodeNotReadyToRenderException exception thrown in case that the model is not ready
   */
  dvtm.processThematicMapChildren = function(amxNode) 
  { 
    adf.mf.internal.perf.start("dvtm.processThematicMapChildren", amxNode.getTag().getName());
    var children = amxNode.getChildren();
    if (!amxNode['_refreshing'] || amxNode['_attributeChanges'].hasChanged('value')) 
    {
      for (var i = 0; i < children.length; i++) 
      {
        switch (children[i].getTag().getName()) 
        {
          case 'legend':
            dvtm.processLegendNode(amxNode, children[i]);
            break;
          case 'areaLayer':
            dvtm.processAreaLayerNode(amxNode, children[i]);
            break;
          case 'pointDataLayer':
            var loadCityLayer = dvtm.processPointDataLayerNode(amxNode, amxNode, children[i], children[i], true);
            // load resource and base map layer 
            if (!amxNode["_optionsObj"]['source'] && loadCityLayer)
              dvtm.loadMapLayerAndResource(amxNode["_optionsObj"]['basemap'], 'cities');
            break;
          default:
            break;
        }
      }
    }  
    adf.mf.internal.perf.stop("dvtm.processThematicMapChildren", amxNode.getTag().getName());
  }

  /**
   * @throws NodeNotReadyToRenderException exception thrown in case that the model is not ready
   */ 
  dvtm.processAreaLayerNode = function(amxNode, areaLayerNode) 
  {
    if (areaLayerNode.isAttributeDefined('rendered') && amx.isValueFalse(areaLayerNode.getAttribute('rendered')))
      return;
    dvtm.setThematicMapLayerProperties('area', amxNode, areaLayerNode);
    var children = areaLayerNode.getChildren();
    for (var i = 0; i < children.length; i++) 
    {
      switch (children[i].getTag().getName()) 
      {
        case 'areaDataLayer':
          dvtm.processAreaDataLayerNode(amxNode, areaLayerNode, children[i]);
          break;
        case 'pointDataLayer':
          var loadCityLayer = dvtm.processPointDataLayerNode(amxNode, areaLayerNode, children[i], false);
          // load resource and base map layer 
          if (!amxNode["_optionsObj"]['source'] && loadCityLayer)
            dvtm.loadMapLayerAndResource(amxNode["_optionsObj"]['basemap'], 'cities');
          break;
        default:
          break;
      }
    }
  }
  
  /**
   * @throws NodeNotReadyToRenderException exception thrown in case that the model is not ready
   */
  dvtm.processAreaDataLayerNode = function(amxNode, areaLayerNode, areaDataLayerNode) 
  {
    if (areaDataLayerNode.isAttributeDefined('rendered') && amx.isValueFalse(areaDataLayerNode.getAttribute('rendered')))
      return;
      
    if (!areaDataLayerNode.isRendered()) 
    {
      throw new dvtm.exception.NodeNotReadyToRenderException;
    }
    var data = amxNode["_dataObj"];
    var dataLayer = {};
    dataLayer['associatedLayer'] = areaLayerNode.getAttribute('layer');
    
    if (areaDataLayerNode.getId() != undefined)
      dataLayer['id'] = areaDataLayerNode.getId();
      
    if (areaDataLayerNode.isAttributeDefined('animationDuration'))
      dataLayer['animationDuration'] = areaDataLayerNode.getAttribute('animationDuration');
    
    if (areaDataLayerNode.isAttributeDefined('animationOnDataChange'))
      dataLayer['animationOnDataChange'] = areaDataLayerNode.getAttribute('animationOnDataChange');
      
    if (areaDataLayerNode.isAttributeDefined('disclosedRowKey'))
      dataLayer['disclosedRowKey'] = areaDataLayerNode.getAttribute('disclosedRowKey');
      
    if (areaDataLayerNode.isAttributeDefined('isolatedRowKey'))
      dataLayer['isolatedRowKey'] = areaDataLayerNode.getAttribute('isolatedRowKey');
      
    if (areaDataLayerNode.isAttributeDefined('selectedRowKeys'))
      dataLayer['selectedRowKeys'] = areaDataLayerNode.getAttribute('selectedRowKeys');
      
    if (areaDataLayerNode.isAttributeDefined('dataSelection'))
      dataLayer['dataSelection'] = areaDataLayerNode.getAttribute('dataSelection');
      
    if (areaDataLayerNode.getTag().getAttribute('selectionListener')) 
    {
      var selectionListenerCache = amxNode['_selectionListenerCache'];
      if (selectionListenerCache[areaDataLayerNode.getId()] == undefined) {
        selectionListenerCache[areaDataLayerNode.getId()] = areaDataLayerNode.getTag().getAttribute('selectionListener');
      }
    }
      
    if (areaDataLayerNode.isAttributeDefined('emptyText'))
      dataLayer['emptyText'] = areaDataLayerNode.getAttribute('emptyText');
    
    // process stamped children
    var varName = areaDataLayerNode.getAttribute("var");
    dataLayer['data'] = [];
    // amxNode.value is the array of "stamps"
    var value = areaDataLayerNode.getAttribute('value');
    if(value)
    {
      // collection is available so iterate through data and process each areaLocation
      var iter = adf.mf.api.amx.createIterator(value);
      while (iter.hasNext()) 
      {
        var stamp = iter.next();
        var children = areaDataLayerNode.getChildren(null, iter.getRowKey()); 
        // set context variable for child tag processing
        adf.mf.el.addVariable(varName, stamp);
        // iteration through all child elements
        var iter2 = adf.mf.api.amx.createIterator(children);       
        while (iter2.hasNext()) {
          var areaLocNode = iter2.next();
          var rowKey = stamp.rowKey();
          // process each location node
          dvtm.processAreaLocation(amxNode, dataLayer, areaLocNode, rowKey);
        }
        // remove context variable
        adf.mf.el.removeVariable(varName);
      }
    } 
    else
    {   
      // collection does not exist so iterate only through child tags
      // and resolve them without var context variable
      var tagChildren = areaDataLayerNode.getChildren(); 
      var tagIterator = adf.mf.api.amx.createIterator(tagChildren);
      while (tagIterator.hasNext()) {
        var tagAreaLocNode = tagIterator.next();
        var tagAreaRowKey = "" + (tagIterator.getRowKey() + 1);
        // process each location node
        dvtm.processAreaLocation(amxNode, dataLayer, tagAreaLocNode, tagAreaRowKey);
      }
    }
    data['dataLayers'].push(dataLayer);
  }
  
  dvtm.processAreaLocation = function(amxNode, dataLayer, areaLocNode, rowKey)
  {
    if (areaLocNode.getTag().getName() != 'areaLocation')
      return;
    
    if (!areaLocNode.isAttributeDefined('rendered') || amx.isValueTrue(areaLocNode.getAttribute('rendered'))) 
    {
      var areaLocChildren = areaLocNode.getChildren();
      for (var i=0; i<areaLocChildren.length; i++) {
        var childData = {};
        childData['location'] = areaLocNode.getAttribute('name');
        childData['type'] = areaLocChildren[i].getTag().getName()
        childData['_rowKey'] = rowKey;
        dvtm.processThematicMapDataItem(amxNode, childData, areaLocChildren[i]);
        dataLayer['data'].push(childData);
      }
    }
  }
  /**
   * @throws NodeNotReadyToRenderException exception thrown in case that the model is not ready
   */
  dvtm.processPointDataLayerNode = function(amxNode, node, pointDataLayerNode, setMapProp) 
  {
    var loadCityLayer = false;
    if (pointDataLayerNode.isAttributeDefined('rendered') && amx.isValueFalse(pointDataLayerNode.getAttribute('rendered')))
      return loadCityLayer;
      
    if (!pointDataLayerNode.isRendered()) 
    {
      throw new dvtm.exception.NodeNotReadyToRenderException;
    }
    var data = amxNode["_dataObj"];

    if (setMapProp)
      dvtm.setThematicMapLayerProperties('point', amxNode, pointDataLayerNode);
    
    var dataLayer = {};
    if (node.isAttributeDefined('layer'))
      dataLayer['associatedLayer'] = node.getAttribute('layer');
    
    if (pointDataLayerNode.getId() != undefined)
      dataLayer['id'] = pointDataLayerNode.getId();
      
    if (!setMapProp)
      dataLayer['associatedWith'] = pointDataLayerNode.getAttribute('layer');
      
    if (pointDataLayerNode.isAttributeDefined('animationDuration'))
      dataLayer['animationDuration'] = pointDataLayerNode.getAttribute('animationDuration');
    
    if (pointDataLayerNode.isAttributeDefined('animationOnDataChange'))
      dataLayer['animationOnDataChange'] = pointDataLayerNode.getAttribute('animationOnDataChange');
      
    if (pointDataLayerNode.isAttributeDefined('selectedRowKeys'))
      dataLayer['selectedRowKeys'] = pointDataLayerNode.getAttribute('selectedRowKeys');
      
    if (pointDataLayerNode.isAttributeDefined('dataSelection'))
      dataLayer['dataSelection'] = pointDataLayerNode.getAttribute('dataSelection');
    
    if (pointDataLayerNode.getTag().getAttribute('selectionListener')) 
    {
      var selectionListenerCache = amxNode['_selectionListenerCache'];
      if (selectionListenerCache[pointDataLayerNode.getId()] == undefined) 
      {
        selectionListenerCache[pointDataLayerNode.getId()] = pointDataLayerNode.getTag().getAttribute('selectionListener');
      }
    }
      
    if (pointDataLayerNode.isAttributeDefined('emptyText'))
      dataLayer['emptyText'] = pointDataLayerNode.getAttribute('emptyText');
    
    // process stamped children
    var varName = pointDataLayerNode.getAttribute("var");
    dataLayer['data'] = [];
    // amxNode.value is the array of "stamps"
    var value = pointDataLayerNode.getAttribute('value');
    if(value)
    {
      // collection is available so iterate through data and process each pointLocation
      var iter = adf.mf.api.amx.createIterator(value);
      while (iter.hasNext()) {
        var stamp = iter.next();
        var children = pointDataLayerNode.getChildren(null, iter.getRowKey());
        // set context variable for child tag processing
        adf.mf.el.addVariable(varName, stamp);
        // iteration through all child elements
        var iter2 = adf.mf.api.amx.createIterator(children);
        while (iter2.hasNext()) {
          var pointLocNode = iter2.next();
          var rowKey = stamp.rowKey();
          // process each location node
          loadCityLayer = dvtm._processPointLocationNode(amxNode, dataLayer, pointLocNode, rowKey, loadCityLayer)
        }
        // remove context variable
        adf.mf.el.removeVariable(varName);
      }
    } 
    else
    {
      // collection does not exist so iterate only through child tags
      // and resolve them without var context variable
      var tagChildren = pointDataLayerNode.getChildren(); 
      var tagChildrenIterator = adf.mf.api.amx.createIterator(tagChildren);
      
      while (tagChildrenIterator.hasNext()) {
        var tagPointLocNode = tagChildrenIterator.next();
        var tagChildrenRowKey = "" + (tagChildrenIterator.getRowKey() + 1);
        // process each location node
        loadCityLayer = dvtm._processPointLocationNode(amxNode, dataLayer, tagPointLocNode, tagChildrenRowKey, loadCityLayer)
      }
    }
    data['dataLayers'].push(dataLayer);
    return loadCityLayer;
  }
  
  dvtm._processPointLocationNode = function(amxNode, dataLayer, pointLocNode, rowKey, loadCityLayer)
  {
    if (pointLocNode.getTag().getName() != 'pointLocation')
      return loadCityLayer;
          
    if (!pointLocNode.isAttributeDefined('rendered') || amx.isValueTrue(pointLocNode.getAttribute('rendered'))) 
    { 
      var markerNodes = pointLocNode.getChildren();
      if (markerNodes.length > 0) {
        var markerData = {};
        if (pointLocNode.isAttributeDefined('pointName')) 
        {
          loadCityLayer = true;
          markerData['location'] = pointLocNode.getAttribute('pointName');
        } 
        else if (pointLocNode.isAttributeDefined('pointX') && pointLocNode.isAttributeDefined('pointY')) 
        {
          markerData['x'] = pointLocNode.getAttribute('pointX');
          markerData['y'] = pointLocNode.getAttribute('pointY');
        }
        markerData['type'] = 'marker';
        markerData['_rowKey'] = rowKey;
        dvtm.processThematicMapDataItem(amxNode, markerData, markerNodes[0]);
        dataLayer['data'].push(markerData);
      }
    }
    return loadCityLayer;
  }

  dvtm.processThematicMapDataItem = function(amxNode, data, dataNode) 
  {
    var options = amxNode["_optionsObj"];
  
    //First check if this data item should be rendered at all
    if (dataNode.isAttributeDefined('rendered') && amx.isValueFalse(dataNode.getAttribute('rendered')))
      return null;
      
    // process attribute groups, if any
    data['attrGroups'] = [];
    var attributeGroupsNodes = dataNode.getChildren();
    var index = 0;
    var iter = adf.mf.api.amx.createIterator(attributeGroupsNodes);
    while (iter.hasNext()) {
      var attributeGroupsNode = iter.next();
      dvtm.processAttributeGroup(amxNode, data, attributeGroupsNode, index);
      index++;
    }
    // resolve attributes set via attributeGroups first
    if (data['attrGroups'].length > 0) {
      for (var g = 0; g < data['attrGroups'].length; g++) 
      {
        var aGroup = data['attrGroups'][g]['attrGroup'];
        var valueIndex = data['attrGroups'][g]['valueIndex'];

        // resolve color
        var color = dvtm.getAttributeFromGroup(amxNode, "color", aGroup, valueIndex);
        if (color != null)
            data['color'] = color;

        // resolve shapes
        var shape = dvtm.getAttributeFromGroup(amxNode, "shape", aGroup, valueIndex);
        if (shape != null)
          data['shape'] = shape;
            
        // populate the categories array
        if (data['categories'] == undefined)
            data['categories'] = [];
        data['categories'].push(aGroup['items'][valueIndex]['value']);

      }
    }
    
    if (dataNode.isAttributeDefined('source'))
      data['source'] = amx.buildRelativePath(dataNode.getAttribute('source'));
    
    if (dataNode.isAttributeDefined('sourceHover'))
      data['sourceHover'] = amx.buildRelativePath(dataNode.getAttribute('sourceHover'));
      
    if (dataNode.isAttributeDefined('sourceSelected'))
      data['sourceSelected'] = amx.buildRelativePath(dataNode.getAttribute('sourceSelected'));
      
    if (dataNode.isAttributeDefined('sourceHoverSelected'))
      data['sourceHoverSelected'] = amx.buildRelativePath(dataNode.getAttribute('sourceHoverSelected'));
    
    if (dataNode.isAttributeDefined('fillColor'))
      data['color'] = dataNode.getAttribute('fillColor');
    
    if (dataNode.isAttributeDefined('fillPattern'))
      data['fillPattern'] = dataNode.getAttribute('fillPattern');
    
    if (dataNode.isAttributeDefined('gradientEffect'))
      data['gradientEffect'] = dataNode.getAttribute('gradientEffect');
    
    if (dataNode.isAttributeDefined('opacity'))
      data['opacity'] = dataNode.getAttribute('opacity');
    
    if (dataNode.isAttributeDefined('labelDisplay'))
      data['labelDisplay'] = dataNode.getAttribute('labelDisplay');
    
    if (dataNode.isAttributeDefined('labelStyle'))
      data['labelStyle'] = dataNode.getAttribute('labelStyle');
    
    if (dataNode.isAttributeDefined('shortDesc'))
      data['shortDesc'] = dataNode.getAttribute('shortDesc');
    
    if (dataNode.isAttributeDefined('value'))
      data['label'] = dataNode.getAttribute('value');
    
    if (dataNode.isAttributeDefined('labelPosition'))
      data['labelPosition'] = dataNode.getAttribute('labelPosition');
    
    if (dataNode.isAttributeDefined('width'))
      data['width'] = dataNode.getAttribute('width');
   
    if (dataNode.isAttributeDefined('height'))
      data['height'] = dataNode.getAttribute('height');
      
    if (dataNode.isAttributeDefined('scaleX'))
      data['scaleX'] = dataNode.getAttribute('scaleX');
    else if (data['type'] == 'marker' &&  !dataNode.isAttributeDefined('scaleX'))
      data['scaleX'] = options['markerStyle']['scaleX'];
    
    if (dataNode.isAttributeDefined('scaleY'))
      data['scaleY'] = dataNode.getAttribute('scaleY');
    else if (data['type'] == 'marker' &&  !dataNode.isAttributeDefined('scaleY'))
      data['scaleY'] = options['markerStyle']['scaleY'];
    
    if (!data['shape']) {
      if (dataNode.isAttributeDefined('shape'))
        data['shape'] = dataNode.getAttribute('shape');
      else if (data['type'] == 'marker' &&  !dataNode.isAttributeDefined('shape'))
        data['shape'] = options['markerStyle']['type'];
    }
    
    data['clientId'] = dataNode.getId();
    
    if (dataNode.isAttributeDefined('action')) 
    {
      data['action'] = dataNode.getAttribute('action');
    }
    else 
    {
      var firesAction = false;
      var actionTags;
      // should fire action, if there are any 'setPropertyListener' or 'showPopupBehavior' child tags  
      actionTags = dataNode.getTag().findTags(dvtm.AMX_NAMESPACE, 'setPropertyListener');
      if (actionTags.length > 0)
        firesAction = true;
      else 
      {
        actionTags = dataNode.getTag().findTags(dvtm.AMX_NAMESPACE, 'showPopupBehavior');
        if (actionTags.length > 0)
          firesAction = true;
      }
      if (firesAction) 
      {
        // need to set 'action' to some value to make the event fire
        data['action'] = data['_rowKey'];
      }
    }    
  }
         
  /**
   * Sets the thematic map properties found on the amxNode
   */
  dvtm.setThematicMapLayerProperties = function(type, amxNode, layerNode) 
  {
    var options = amxNode["_optionsObj"];
    if (!options['layers'])
      options['layers'] = [];
    var layer = {'labelDisplay': 'auto', 'labelType': 'short'};
    dvtm.setOptionsDirty(amxNode, true);
    
    if (layerNode.isAttributeDefined('layer')) 
    {
      layer['layer'] = layerNode.getAttribute('layer');
      // load resource and base map layer 
      if (!options['source'])
        dvtm.loadMapLayerAndResource(options['basemap'], layer['layer']);
    } else 
    {
      layer['layer'] = 'cities';
      layer['type'] = 'point';
      return;
    }
    
    if (type)
      layer['type'] = type;
    if (layerNode.isAttributeDefined('areaLabelDisplay'))
      layer['labelDisplay'] = layerNode.getAttribute('areaLabelDisplay');
      
    if (layerNode.isAttributeDefined('labelStyle'))
      layer['labelStyle'] = layerNode.getAttribute('labelStyle');

    if (layerNode.isAttributeDefined('labelType'))
      layer['labelType'] = layerNode.getAttribute('labelType');

    if (layerNode.isAttributeDefined('animationDuration'))
      layer['animationDuration'] = layerNode.getAttribute('animationDuration');
      
    if (layerNode.isAttributeDefined('animationOnLayerChange'))
      layer['animationOnLayerChange'] = layerNode.getAttribute('animationOnLayerChange');
      
    options['layers'].push(layer);
  }

  /**
   * returns svg/canvas stage id based in the node id and rendering method
   */
  dvtm.getThematicMapStageId = function(amxNode) 
  {
    var id = "";
    if (dvtm.isSvgAvailable()) 
    {
      id = (amxNode.getId()) ? amxNode.getId() + '_svg' : 'tmap_svg';
    }
    else 
    {
      id = (amxNode.getId()) ? amxNode.getId() + '_canvas' : 'tmap_canvas';
    }
    return id;
  }

  /**
   * renders the thematic map SVG and appends it to the parent node
   */
  dvtm.renderThematicMap = function ($node, amxNode) 
  {
    var $dummy = null;
    var $renderDiv = null;
    var stageId = dvtm.getThematicMapStageId(amxNode);
    var stageIdEsc = stageId.replace(/\:/g, "\\:");

    adf.mf.internal.perf.start("dvtm.renderThematicMap", amxNode.getTag().getName());

    // use Canvas rendering, if SVG is not available (Android 2.x)
    var bUseCanvas = !dvtm.isSvgAvailable();

    try {
      if (!dvtm.isAncestor(document.body, $node.get(0))) 
      {
        adf.mf.log.Framework.logp(adf.mf.log.level.INFO, 
            "dvtm.thematicMap", "renderThematicMap", "Rendering thematicMap on a disconnected DOM node.");

        // create a dummy node under document.body to layout the chart properly
        $dummy = $node.clone();
        $dummy.attr('id', $node.attr('id') + '_temp');
        $dummy.css('position', 'absolute');
        $dummy.css('left', '-1000px');
        $dummy.css('top', '-1000px');
        $('body').append($dummy);
        $renderDiv = $dummy;
      }
      else 
      {
        $renderDiv = $node;        
      }

      var options = amxNode["_optionsObj"];
      var data = amxNode["_dataObj"];
      var refreshing = amxNode["_refreshing"];
      var componentInstance = amxNode[dvtm.COMPONENT_INSTANCE];

      if (!amxNode['_stylesResolved']) 
      {
        dvtm.setCssBasedThematicMapProperties($renderDiv.get(0), amxNode);
      }

      // first, get the width and height from style
      var width = dvtm.getComponentWidth($renderDiv, amxNode);
      var height = dvtm.getComponentHeight($renderDiv, amxNode);

      var context;

      // on refresh, if the options object is dirty, delete the old nodes content and recreate the component
      if (bUseCanvas) 
      {
        $renderDiv.find('canvas').remove();
      }
      else if (refreshing && dvtm.isOptionsDirty(amxNode)) 
      {
        $renderDiv.find('svg').remove();
      }

      // if not refreshing, or if the options object is dirty,  or if we are using canvas element,
      // or we're missing the previous component object, create the document and context
      if (dvtm.isOptionsDirty(amxNode) || !componentInstance) 
      {
        if (!bUseCanvas) 
        {
          // Create the SVG Element
          var svg = DvtSvgUtils.createSvgDocument(stageId);
          // append the svg node to the parent
          $renderDiv.append(svg);
          // Create the component and pass in the rendering context
          context = new DvtSvgContext(svg);
        }
        else 
        {
          // create the Canvas element
          var canvas = DvtCanvasUtils.createCanvasDocument(width, height, stageId);
          // append the canvas node to the parent
          $renderDiv.append(canvas);
          // create the component and pass in the rendering context
          context = new DvtCanvasContext(canvas);
        }

        var mapCallbackObj = 
        {
          'callback': function(event, component) 
          {
            // fire the selectionChange event
            var type = event.getType();
            if (type == DvtSelectionEvent.TYPE) 
            {
              var se = new amx.SelectionEvent(null, event.getSelection());
              amx.processAmxEvent($node, 'selection', undefined, undefined, se).always(function() 
              {
                var el = amxNode['_selectionListenerCache'][event.getParamValue('clientId')];
                if (el)
                  amx.invokeEl(el, [se], null, [se[".type"]]);
              });
            }
            else if (type == DvtMapActionEvent.TYPE) 
            {
              // find data layer node by id (passed as 'clientId' param value)
              var dataLayerNode = dvtm.findDataLayerNodeById(amxNode, event.getParamValue('clientId'));
              if (dataLayerNode) 
              {
                var locationNode;   
                if(dataLayerNode.getAttribute("value")) 
                {
                  locationNode = dataLayerNode.getChildren(null, event.getRowKey())[0];
                } 
                else
                {
                  locationNode = dataLayerNode.getChildren()[parseInt(event.getRowKey()) - 1];
                }  
                if (locationNode) 
                {
                  var clientId = event.getClientId();     // clientId of the firing item
                  if (clientId) 
                  {
                    var itemNode = null;
                    var items = locationNode.getChildren();
                    for (var j = 0; j < items.length; j++) 
                    {
                      if (items[j].getId() === clientId) 
                      {
                        itemNode = items[j];
                        break;
                      }
                    }
                    if (itemNode) 
                    {
                      // area/marker node found, fire event and handle the 'action' attribute
                      var ae = new amx.ActionEvent();
                      amx.processAmxEvent(itemNode, 'action', undefined, undefined, ae).always(function() 
                      {
                        var action = itemNode.getTag().getAttribute('action');
                        if (action != null) 
                        {
                          adf.mf.api.amx.doNavigation(action);
                        }
                      });
                    }
                  }
                }
              }
            }
          }};

        //TODO selectionListener
        if (amxNode.isAttributeDefined('selectionListener'))
          mapCallbackObj['selectionListener'] = amxNode.getAttribute('selectionListener');

        componentInstance = DvtAmxThematicMap.newInstance(context, mapCallbackObj.callback, mapCallbackObj, options);

        context.getStage().addChild(componentInstance);

        amxNode[dvtm.COMPONENT_INSTANCE] = componentInstance;

        // thematicMap instance created, reset the dirty flag
        dvtm.setOptionsDirty(amxNode, false);
      }

      componentInstance.setId(stageId);
      componentInstance.render(data, width, height);

      // if we were rendering to a dummy node, re-attach the content to the real node and remove the dummy
      if ($dummy) 
      {
        var child = $dummy.find('svg[id=' + stageIdEsc + ']').detach();
        $node.prepend(child);
        $dummy.remove();
      }
    }
    catch (ex) 
    {
      adf.mf.log.Framework.logp(adf.mf.log.level.SEVERE, 
        "dvtm.thematicMap", "renderThematicMap", "Exception: " + ex.message);

      // clean up... remove the dummy node, if we created one
      if ($dummy) 
      {
        $dummy.remove();
      }
      // remove the rendered content, if it exists, it's broken anyway
      if (bUseCanvas)
        $node.find('canvas').remove();
      else
        $node.find('svg').remove();
    }
    finally 
    {
      adf.mf.internal.perf.stop("dvtm.renderThematicMap", amxNode.getTag().getName());
    }
  }
  
  /**
   * sets style properties based on CSS
   */
  dvtm.setCssBasedThematicMapProperties = function(node, amxNode) 
  {
    var options = amxNode["_optionsObj"];
    var id = amxNode.getId();
        
    // escape colons in id
    id = id.replace(/\:/g, "\\:");

    var nodeStyle = dvtm._getComputedStyle(node);
    // if we get here, assume the options objec *will* be modified
    dvtm.setOptionsDirty(amxNode, true);
    
    // component background color
    var bgColor = nodeStyle['background-color'];
    if (bgColor) 
        options['background-color'] = {'background-color': bgColor};
    
    // areaLayer style
    var areaLayerDiv = node.querySelector(".dvtm-areaLayer");
    var areaLayerDivStyle = dvtm._getComputedStyle(areaLayerDiv);
    
    var arealayerStyleString = this.buildCssStyleString(areaLayerDiv);
    
    if (areaLayerDivStyle['border-bottom-color']) 
      arealayerStyleString += "border-color: " + areaLayerDivStyle['border-bottom-color'] + ";";
    if (areaLayerDivStyle['border-bottom-width'])
      arealayerStyleString += "border-width: " + areaLayerDivStyle['border-bottom-width'] + ";";
    if (areaLayerDivStyle['background-color'])
       arealayerStyleString += "background-color: " + areaLayerDivStyle['background-color'] + ";";   
    options['areaLayerStyle'] = arealayerStyleString;
    
    // area style
    var areaDiv = node.querySelector(".dvtm-area");    
    var areaDivStyle = dvtm._getComputedStyle(areaDiv);
      
    if (areaDivStyle['border-bottom-color'])
      options['areaStyles']['area']['border-color'] = areaDivStyle['border-bottom-color'];
    if (areaDivStyle['border-bottom-width'])
      options['areaStyles']['area']['border-width'] = areaDivStyle['border-bottom-width'];
    
    // marker style
    var markerDiv = node.querySelector(".dvtm-marker");
    var markerDivStyle = dvtm._getComputedStyle(markerDiv);
     
    if (markerDivStyle['background-color'])
      options['markerStyle']['background-color'] = markerDivStyle['background-color'];
    if (markerDivStyle['opacity']) 
      options['markerStyle']['opacity'] = markerDivStyle['opacity'];
    var textStyleString = this.buildCssStyleString(markerDiv);
    options['markerStyle']['textStyle'] = textStyleString;
    
    dvtm.setCssBasedLegendProperties(node, amxNode);
    
    amxNode['_stylesResolved'] = true;
  }
})();
