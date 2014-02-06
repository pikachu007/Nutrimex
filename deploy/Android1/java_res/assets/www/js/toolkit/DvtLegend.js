/**
 * Legend component.  This class should never be instantiated directly.  Use the
 * newInstance function instead.
 * @class
 * @constructor
 * @extends {DvtContainer}
 * @export
 */
var DvtLegend = function() {}

DvtObj.createSubclass(DvtLegend, DvtContainer, "DvtLegend");

/**
 * Returns a new instance of DvtLegend.
 * @param {DvtContext} context The rendering context.
 * @param {string} callback The function that should be called to dispatch component events.
 * @param {object} callbackObj The optional object instance on which the callback function is defined.
 * @param {object} options The object containing options specifications for this component.
 * @return {DvtAxis}
 * @export
 */
DvtLegend.newInstance = function(context, callback, callbackObj, options) {
  var legend = new DvtLegend();
  legend.Init(context, callback, callbackObj, options);
  return legend;
}

/**
 * Initializes the component.
 * @param {DvtContext} context The rendering context.
 * @param {string} callback The function that should be called to dispatch component events.
 * @param {object} callbackObj The optional object instance on which the callback function is defined.
 * @param {object} options The object containing options specifications for this component.
 * @protected
 */
DvtLegend.prototype.Init = function(context, callback, callbackObj, options) {
  DvtLegend.superclass.Init.call(this, context);
  this._callback = callback;
  this._callbackObj = callbackObj;
  this.setOptions(options);
  this.setId("legend" + 1000 + Math.floor(Math.random()*10000));
  
  // Create the event handler and add event listeners
  this._eventHandler = new DvtLegendEventManager(this);
  this._eventHandler.addListeners(this);

  var chart = callbackObj;
  
  // Series focus enabled only when a data cursor is enabled
  if (chart && chart.__isDataCursorEnabled())
    this._eventHandler.setSeriesFocusHandler(new DvtChartSeriesFocusHandler(chart, this));
  if (this.__getOptions().rolloverBehavior == "dim")
    this._eventHandler.setSeriesRolloverHandler(new DvtLegendSeriesRolloverHandler(chart, this._eventHandler, this));
  /** 
   * The array of logical objects for this legend.
   * @private 
   */
  this._peers = [];
  /** 
   * The array of scrollable legend sections for this legend.
   * @private 
   */
  this._scrollableSections = [];
}

/**
 * Specifies the non-data options for this component.
 * @param {object} options The object containing options specifications for this component.
 * @export
 */
DvtLegend.prototype.setOptions = function(options) {
  // Combine the user options with the defaults and store
  this.Options = DvtLegendDefaults.calcOptions(options);
}

/**
 * Returns the preferred dimensions for this component given the maximum available space.
 * @param {object} data The object containing data for this component.
 * @param {Number} maxWidth The maximum width available.
 * @param {Number} maxHeight The maximum height available.
 * @return {object} The preferred dimensions for the object.
 */
DvtLegend.prototype.getPreferredSize = function(data, maxWidth, maxHeight) {
  // Set the layout flag to indicate this is a layout pass only
  this.Options['isLayout'] = true;

  // Ask the legend to render its contents in the max space and find the space used. 
  this.Data = DvtJSONUtils.clone(data);
  var availSpace = new DvtRectangle(0, 0, maxWidth, maxHeight);
  DvtLegendRenderer.render(this, availSpace);
  var width = availSpace.w;
  var height = availSpace.h;
  
  // Also add the outer gaps around the contents 
  width += 2*DvtLegendDefaults.getGapSize(this.Options, this.Options['layout']['outerGapWidth']);
  height += 2*DvtLegendDefaults.getGapSize(this.Options, this.Options['layout']['outerGapHeight']);
  
  // Clear the rendered contents and reset state
  this.Options['isLayout'] = false;
  
  // Return the space used
  return {'width': width, 'height': height};
}

/**
 * Renders the component with the specified data.  If no data is supplied to a component
 * that has already been rendered, the component will be rerendered to the specified size.
 * @param {object} data The object containing data for this component.
 * @param {number} width The width of the component.
 * @param {number} height The height of the component.
 * @export
 */
DvtLegend.prototype.render = function(data, width, height) 
{  
  // Store the data object. Clone to avoid modifying the provided object.
  this.Data = DvtJSONUtils.clone(data);
  
  // Clear any contents rendered previously
  this.removeChildren();
  
  // Render the legend
  var availSpace = new DvtRectangle(0, 0, width, height);
  DvtLegendRenderer.render(this, availSpace);
  
  // Queue a render with the context
  this.getContext().queueRender();
}

/**
 * Processes the specified event.  
 * @param {object} event
 * @param {object} source The component that is the source of the event, if available.
 * @export
 */
DvtLegend.prototype.processEvent = function(event, source) {
  var type = event.getType();
  if(type == DvtCategoryRolloverEvent.TYPE_OVER || type == DvtCategoryRolloverEvent.TYPE_OUT) {
    if(this.Options.rolloverBehavior == "dim") 
      DvtCategoryRolloverHandler.processEvent(event, this.__getObjects());
      // For scrollable legend interactivty
      for (var i = 0; i < this._scrollableSections.length; i++)
        this._scrollableSections[i].processCategoryRollover(event);
  }
  
  // Dispatch the event to the callback if it originated within this component.
  if(this === source) {
    this.__dispatchEvent(event);
  }
};

/**
 * Dispatches the event to the callback function.
 * @param {object} event The event to be dispatched.
 */
DvtLegend.prototype.__dispatchEvent = function(event) {
  DvtEventDispatcher.dispatchEvent(this._callback, this._callbackObj, this, event);
};

/**
 * Returns the data object for the component.
 * @return {object} The object containing data for this component.
 */
DvtLegend.prototype.__getData = function() {
  return this.Data ? this.Data : {};
}

/**
 * Returns the evaluated options object, which contains the user specifications
 * merged with the defaults.
 * @return {object} The options object.
 */
DvtLegend.prototype.__getOptions = function() {
  return this.Options;
}

/**
 * Returns the DvtEventManager for this component.
 * @return {DvtEventManager}
 */
DvtLegend.prototype.__getEventManager = function() {
  return this._eventHandler;
}

/**
 * Registers the object peer with the legend.  The peer must be registered to participate
 * in interactivity.
 * @param {DvtLegendObjPeer} peer
 */
DvtLegend.prototype.__registerObject = function(peer) {
  this._peers.push(peer);
}

/**
 * Returns the peers for all objects within the legend.
 * @return {array}
 */
DvtLegend.prototype.__getObjects = function() {
  return this._peers;
}

/**
 * Registers a scrollable legend section the legend. Used for interactivity.
 * @param {DvtScrollableLegend} section
 */
DvtLegend.prototype.__registerScrollableSection = function(section) {
  this._scrollableSections.push(section);
}

/**
 * Default values and utility functions for legend versioning.
 * @class
 */
var DvtLegendDefaults = new Object();

DvtObj.createSubclass(DvtLegendDefaults, DvtObj, "DvtLegendDefaults");

/**
 * Defaults for version 1.
 */ 
DvtLegendDefaults.VERSION_1 = {
  'position': null,
  'backgroundColor': null, 
  'borderColor': null,
  'textStyle': "font-size: 11px; color: #333333;", 
  'titleStyle': "font-size: 12px; color: #003d5b;", 
  'titleHalign': "start",
  'hideAndShowBehavior': "none",
  'rolloverBehavior': "none",
  'scrolling': "off",
  
  //*********** Internal Attributes *************************************************//
  'layout': {
    // Gap ratio is multiplied against all gap sizes
    'gapRatio': 1.0,
    'outerGapWidth': 3, 'outerGapHeight': 3, // Used by Treemap for legend creation
    'titleGap': 3,
    'markerSize': 10, 'markerGap': 5,
    'rowGap': 0, 'columnGap': 8,
    'sectionGap': 6
  },
  
  'isLayout': false // true if rendering for layout purposes
};

/**
 * Combines the user options with the defaults for the specified version.  Returns the
 * combined options object.  This object will contain internal attribute values and
 * should be accessed in internal code only.
 * @param {object} userOptions The object containing options specifications for this component.
 * @return {object} The combined options object.
 */
DvtLegendDefaults.calcOptions = function(userOptions) {
  var defaults = DvtLegendDefaults._getDefaults(userOptions);
  
  // Use defaults if no overrides specified
  if(!userOptions)
    return defaults;
  else // Merge the options object with the defaults
    return DvtJSONUtils.merge(userOptions, defaults);
}

/**
 * Returns the default options object for the specified version of the component.
 * @param {object} userOptions The object containing options specifications for this component.
 * @private
 */
DvtLegendDefaults._getDefaults = function(userOptions) {
  // Note: Version checking will eventually get added here
  // Note: Future defaults objects are deltas on top of previous objects
  return DvtJSONUtils.clone(DvtLegendDefaults.VERSION_1);
}

/**
 * Scales down gap sizes based on the size of the component.
 * @param {object} options The object containing options specifications for this component.
 * @param {Number} defaultSize The default gap size.
 * @return {Number} 
 */
DvtLegendDefaults.getGapSize = function(options, defaultSize) {
  return Math.ceil(defaultSize * options['layout']['gapRatio']);
}
/**
 * Event Manager for DvtLegend.
 * @param {DvtLegend} legend
 * @class
 * @extends DvtEventManager
 * @constructor
 */
var DvtLegendEventManager = function(legend) {
  this.Init(legend.getContext(), legend.processEvent, legend);
  this._legend = legend;
  this.SeriesFocusHandler = null;
  this.SeriesRolloverHandler = null;
};

DvtObj.createSubclass(DvtLegendEventManager, DvtEventManager, "DvtLegendEventManager");
    
DvtLegendEventManager.prototype.setSeriesFocusHandler = function(handler) {
  this.SeriesFocusHandler = handler;
}

DvtLegendEventManager.prototype.setSeriesRolloverHandler = function(handler) {
  this.SeriesRolloverHandler = handler;
}    

/**
 * @override
 */
DvtLegendEventManager.prototype.OnClick = function(event) {
  DvtLegendEventManager.superclass.OnClick.call(this, event);
  
  var obj = this.GetLogicalObject(event.target);
  if(!obj)
    return;
  var pos = this._context.getRelativePosition(event.pageX, event.pageY);
  if (this.SeriesFocusHandler)
    this.SeriesFocusHandler.processSeriesFocus(pos, obj);
  var handled = this._handleHideShow(obj);
  if (handled) {
      event.stopPropagation(); 
  }
}    
    
/**
 * @override
 */
DvtLegendEventManager.prototype.OnMouseOver = function(event) {
  DvtLegendEventManager.superclass.OnMouseOver.call(this, event);
  
  var obj = this.GetLogicalObject(event.target);
  if(!obj)
    return;

  var rolloverHandled = false;
  // Category Rollover Support
  if(this.SeriesRolloverHandler) {
    this.SeriesRolloverHandler.processMouseOver(obj);
    rolloverHandled = this.SeriesRolloverHandler.isRolloverHandled();
  }
  if (rolloverHandled) {
      event.stopPropagation(); 
  }
}

/**
 * @override
 */
DvtLegendEventManager.prototype.OnMouseOut = function(event) {
  DvtLegendEventManager.superclass.OnMouseOut.call(this, event);
  
  var obj = this.GetLogicalObject(event.target);
  if(!obj)
    return;

  var rolloverHandled = false;
  // Category Rollover Support
  if(this.SeriesRolloverHandler) {
    this.SeriesRolloverHandler.processMouseOut(obj);
    rolloverHandled = this.SeriesRolloverHandler.isRolloverHandled();
  }
  if (rolloverHandled) {
      event.stopPropagation(); 
  }
}

DvtLegendEventManager.prototype.HandleTouchClickInternal = function(evt) {
    var touch = evt.touch;
    var targetObj = evt.targetObj;
    var touchEvent = evt.touchEvent;
    var obj = this.GetLogicalObject(targetObj);
    if (!obj) {
        return;
    }

    // bug 13810791: if hideAndShow is enabled, it takes precedence over series highlighting
    var handled = this._handleHideShow(obj);
    if (handled && touchEvent) {
        touchEvent.preventDefault();
    }
    else {
      var pos = this._context.getRelativePosition(touch.pageX, touch.pageY);
      if (this.SeriesFocusHandler) {
        this.SeriesFocusHandler.processSeriesFocus(pos, obj);
      }
    }
}

DvtLegendEventManager.prototype._handleHideShow = function(obj) {
  
  // Category Hide and Show Support
  if(this._legend.__getOptions().hideAndShowBehavior != "none") {
    var hideShowEvent = DvtLegendEventManager._processHideAndShow(this._legend, obj);
    if(hideShowEvent) {
      this.FireEvent(hideShowEvent, this._legend);
      return true;
    }
  }
  return false;
}

/**
 * Processes and returns a hide and show event on the specified legend item.
 * @param {DvtLegend} legend The owning legend instance.
 * @param {DvtLegendObjPeer} obj The legend item that was clicked.
 * @return {DvtHideShowCategoryEvent} The event that was fired.
 */
DvtLegendEventManager._processHideAndShow = function(legend, obj) {
  var categories = obj.getCategories ? obj.getCategories() : null;
  if(!categories || categories.length <= 0) 
    return null;
    
  // Update the legend markers
  var displayables = obj.getDisplayables();
  for(var i=0; i<displayables.length; i++) {
    var displayable = displayables[i];
    if(displayable instanceof DvtMarker) // setHollow is a toggle
      displayable.setHollow(obj.getColor()); 
  }
  
  // Update the state and create the event
  var id = categories[0];
  var dataItem = obj.getData();
  var visibility = dataItem.visibility;
  if(visibility == "hidden") { // Currently hidden, show
    dataItem.visibility = "visible";
    return new DvtHideShowCategoryEvent(DvtHideShowCategoryEvent.TYPE_SHOW, id);
  }
  else { // Currently visible, hide
    dataItem.visibility = "hidden";
    return new DvtHideShowCategoryEvent(DvtHideShowCategoryEvent.TYPE_HIDE, id);
  }
}


DvtLegendEventManager.prototype.HandleTouchHoverStartInternal = function(event) {
    var targetObj = event.targetObj;
    var dlo = this.GetLogicalObject(targetObj);
    
    if(this.SeriesRolloverHandler) 
      this.SeriesRolloverHandler.processMouseOver(dlo);

}

DvtLegendEventManager.prototype.HandleTouchHoverEndInternal = function(event) {
    var targetObj = event.targetObj;     
    var dlo = this.GetLogicalObject(targetObj);
    
    if(this.SeriesRolloverHandler) 
      this.SeriesRolloverHandler.processMouseOut(dlo);    
    
}

DvtLegendEventManager.prototype.HandleTouchHoverOverInternal = function(event) {
    var targetObj = event.targetObj;     
    var dlo = this.GetLogicalObject(targetObj);
    
    if(this.SeriesRolloverHandler) {
      this.SeriesRolloverHandler.processMouseOver(dlo);
    }
}

DvtLegendEventManager.prototype.HandleTouchHoverOutInternal = function(event) {
    var targetObj = event.targetObj;     
    var dlo = this.GetLogicalObject(targetObj);
    
    if(this.SeriesRolloverHandler) 
      this.SeriesRolloverHandler.processMouseOut(dlo);

}
/**
 * Logical object for legend data object displayables.
 * @param {DvtLegend} legend The owning legend instance.
 * @param {array} displayables The array of associated DvtDisplayables.
 * @param {string} id The id of the legend item.
 * @param {string} tooltip The tooltip of the legend item.
 * @class
 * @constructor
 * @implements {DvtLogicalObject}
 * @implements {DvtCategoricalObject}
 */
var DvtLegendObjPeer = function(legend, displayables, id, tooltip) {
  this.Init(legend, displayables, id, tooltip);
}

DvtObj.createSubclass(DvtLegendObjPeer, DvtObj, "DvtLegendObjPeer");

/**
 * @param {DvtLegend} legend The owning legend instance.
 * @param {array} displayables The array of associated DvtDisplayables.
 * @param {object} item The definition of the legend item.
 * @param {string} tooltip The tooltip of the legend item.
 */
DvtLegendObjPeer.prototype.Init = function(legend, displayables, item, tooltip) {
  this._legend = legend;
  this._displayables = displayables;
  this._item = item;
  this._id = item.id;
  this._tooltip = tooltip;
}

/**
 * Creates a data item to identify the specified displayable and registers it with the legend.
 * @param {array} displayables The displayables to associate.
 * @param {DvtLegend} legend The owning legend instance.
 * @param {object} item The definition of the legend item.
 * @param {string} tooltip The tooltip of the legend item.
 * @return {DvtLegendObjPeer}
 */
DvtLegendObjPeer.associate = function(displayables, legend, item, tooltip) {
  // Item must have displayables and an id to be interactive.
  if(!displayables || !item)
    return null;
    
  // Create the logical object. 
  var identObj;
  if (!item.id) {
    identObj = new DvtSimpleObjPeer(tooltip);
  } else {
    identObj = new DvtLegendObjPeer(legend, displayables, item, tooltip);
  
    // Register with the legend
    legend.__registerObject(identObj);
  }
  // Finally associate using the event manager  
  for(var i=0; i<displayables.length; i++) 
    legend.__getEventManager().associate(displayables[i], identObj);
    
  return identObj;
}

/**
 * Returns the data object defining this legend item.
 * @return {object} The data object defining this legend item.
 */
DvtLegendObjPeer.prototype.getData = function() {
  return this._item;
}

/**
 * Returns the primary data color for this legend item.
 * @return {string} The color string.
 */
DvtLegendObjPeer.prototype.getColor = function () { 
  return this._item.color;
}

//---------------------------------------------------------------------//
// Rollover and Hide/Show Support: DvtLogicalObject impl               //
//---------------------------------------------------------------------//

/**
 * @override
 */
DvtLegendObjPeer.prototype.getDisplayables = function () {
  return this._displayables;
}

//---------------------------------------------------------------------//
// Rollover and Hide/Show Support: DvtCategoricalObject impl           //
//---------------------------------------------------------------------//

/**
 * @override
 */
DvtLegendObjPeer.prototype.getCategories = function (category) {
  return [this._id];
};

/**
 * @override
 */
DvtLegendObjPeer.prototype.getTooltip = function(target) {
  return this._tooltip;
};
/**
 * Renderer for DvtLegend.
 * @class
 */
var DvtLegendRenderer = new Object();

DvtObj.createSubclass(DvtLegendRenderer, DvtObj, "DvtLegendRenderer");

DvtLegendRenderer._LINE_WIDTH = 3;
DvtLegendRenderer._LINE_MARKER_SIZE = 7;
DvtLegendRenderer._DEFAULT_ITEM_WIDTH = 10;

/**
 * Renders the legend and updates the available space.
 * @param {DvtLegend} legend The legend being rendered.
 * @param {DvtRectangle} availSpace The available space.
 */
DvtLegendRenderer.render = function (legend, availSpace) {
  var options = legend.__getOptions();

  if (!options['isLayout']) {
    var gapWidth = DvtLegendDefaults.getGapSize(options, options['layout']['outerGapWidth']);
    var gapHeight = DvtLegendDefaults.getGapSize(options, options['layout']['outerGapHeight']);
    // gaps are already added to availSpace so can't just do 0 checks to see if there is space to render anything
    if (availSpace.w === 2 * gapWidth)
      return;
    DvtLegendRenderer._renderBackground(legend, availSpace);
    availSpace.x += gapWidth;
    availSpace.y += gapHeight;
    availSpace.w -= 2 * gapWidth;
    availSpace.h -= 2 * gapHeight;
  }

  var isHoriz = (options['orientation'] == "vertical" ? false : true);

  var titleDim = DvtLegendRenderer._renderTitle(legend, legend.__getData().title, availSpace, false);
  availSpace.y += titleDim.height;
  availSpace.h -= titleDim.height;
  // Row heights are same across all section so just calc once for all sections
  var rowHeight = DvtLegendRenderer._getRowHeight(legend);

  if (!isHoriz) {
    var bScrollable = options['scrolling'] == "asNeeded";
    DvtLegendRenderer._renderVerticalSections(legend, availSpace, rowHeight, titleDim.width, bScrollable);
  }
  else {
    DvtLegendRenderer._renderHorizontalSections(legend, availSpace, rowHeight);
  }

  availSpace.w = Math.max(availSpace.w, titleDim.width);
  availSpace.h += titleDim.height;
}

/**
 * Renders the legend background/border colors and updates the available space.
 * @param {DvtLegend} legend The legend being rendered.
 * @param {DvtRectangle} availSpace The available space.
 * @private
 */
DvtLegendRenderer._renderBackground = function (legend, availSpace) {
  var options = legend.__getOptions();

  var rect;
  if (options['backgroundColor']) {
    rect = (rect ? rect : new DvtRect(legend.getContext(), availSpace.x, availSpace.y, availSpace.w, availSpace.h));
    rect.setFill(new DvtSolidFill(options['backgroundColor']));
  }

  if (options['borderColor']) {
    rect = (rect ? rect : new DvtRect(legend.getContext(), availSpace.x, availSpace.y, availSpace.w, availSpace.h));
    rect.setStroke(new DvtSolidStroke(options['borderColor']));
    rect.setPixelHinting(true);
  }

  if (rect)
    legend.addChild(rect);
}

/**
 * Renders the legend title and updates the available space.
 * @param {DvtLegend} legend The legend being rendered.
 * @param {string} titleStr
 * @param {DvtRectangle} availSpace The available space.
 * @return {object} The width and height that a title takes up.
 */
DvtLegendRenderer._renderTitle = function (legend, titleStr, availSpace, isSectionTitle) {
  var options = legend.__getOptions();

  if (!titleStr)
    return {'width' : 0, 'height' : 0};

  // Create the title object and add to legend  
  var title = new DvtText(legend.getContext(), titleStr, availSpace.x, availSpace.y);
  title.setCSSStyle(new DvtCSSStyle(isSectionTitle ? options['sectionTitleStyle'] : options['titleStyle']));
  var fullText = title.getTextString();
  title = title.truncateToSpace(legend, availSpace.w, availSpace.h);

  if (title) {
    // Add tooltip if text is truncated
    if (fullText.length > title.getTextString().length)
      legend.__getEventManager().associate(title, new DvtSimpleObjPeer(fullText));
    legend.addChild(title);

    // Position the title based on text size and legend position 
    var titleDims = title.getDimensions();
    var gap = DvtLegendDefaults.getGapSize(options, options['layout']['titleGap']);

    if (!options['isLayout']) {
      DvtLayoutUtils.alignTextStart(title);
      DvtLayoutUtils.align(availSpace, isSectionTitle ? options['sectionTitleHalign'] : options['titleHalign'], title, titleDims.w);
    }
    else {
      legend.removeChild(title);
    }

    var titleHeight = titleDims.h + gap;
    return {'width' : Math.min(titleDims.w, availSpace.w), 'height' : titleHeight};
  }
  else {
    return {'width' : 0, 'height' : 0};
  }
}

DvtLegendRenderer._getLegendSections = function (section, sections) {
  var nestedSections = section['sections'];
  sections.push(section);
  if (nestedSections) {
    for (var i = 0;i < nestedSections.length;i++)
      DvtLegendRenderer._getLegendSections(nestedSections[i], sections);
  }
}

/**
 * Renders a vertical legend.
 * @param {DvtLegend} legend The legend being rendered.
 * @param {DvtRectangle} availSpace The available space.
 * @param {number} rowHeight The height of a legend row.
 * @private
 */
DvtLegendRenderer._renderVerticalSections = function (legend, availSpace, rowHeight, titleWidth, bScrollable) {
  var data = legend.__getData();
  var options = legend.__getOptions();

  var sectionSpace = DvtLegendRenderer._calcSectionSpaces(legend, availSpace, rowHeight, bScrollable);

  var legendX = availSpace.x;

  var legendSections = [];
  for (var i = 0;i < data['sections'].length;i++)
    DvtLegendRenderer._getLegendSections(data['sections'][i], legendSections);
  var numSections = legendSections.length;

  var sectionGap = DvtLegendDefaults.getGapSize(options, options['layout']['sectionGap']);

  var legendSpace = new DvtRectangle(availSpace.x, availSpace.y, Math.max(availSpace.w, titleWidth), availSpace.h);
  for (i = 0;i < legendSections.length;i++) {
    legendSpace.h = sectionSpace[i];
    DvtLegendRenderer._renderSection(legend, legendSections[i], i, legendSpace, rowHeight, bScrollable);
    legendSpace.x = legendX;
    if (i != numSections - 1 && legendSections[i]['items']) {
      legendSpace.h -= sectionGap;
      legendSpace.y += sectionGap;
    }
  }
}

/**
 * Renders a horizontal legend.
 * @param {DvtLegend} legend The legend being rendered.
 * @param {DvtRectangle} availSpace The available space.
 * @param {number} rowHeight The height of a legend row.
 * @private
 */
DvtLegendRenderer._renderHorizontalSections = function (legend, availSpace, rowHeight) {
  var data = legend.__getData();
  var options = legend.__getOptions();

  var legendHeight = 0;
  var legendWidth = 0;
  var legendY = availSpace.y;

  var legendSections = [];
  for (var i = 0;i < data['sections'].length;i++)
    DvtLegendRenderer._getLegendSections(data['sections'][i], legendSections);
  var numSections = legendSections.length;

  var totalItems = 0;
  for (var j = 0;j < legendSections.length;j++) {
    if (legendSections[j]['items'])
      totalItems += legendSections[j]['items'].length;
  }

  var sectionGap = DvtLegendDefaults.getGapSize(options, options['layout']['sectionGap']);
  var maxWidth = availSpace.w - sectionGap * (numSections - 1);
  var maxHeight = availSpace.h;

  // Pass in a percentage of max height/width based on proportion that legend section items account for
  if (data['sections']) {
    var nestedSectionCounter = 0;
    var outerSectionTitleHeight = 0;
    for (var i = 0;i < numSections;i++) {
      availSpace.h = maxHeight;
      var sectionItems = legendSections[i]['items'];
      if (sectionItems) {
        if (nestedSectionCounter > 0) {
          availSpace.y += outerSectionTitleHeight;
          availSpace.h -= outerSectionTitleHeight;
        }
        availSpace.w = Math.round((sectionItems.length / totalItems) * maxWidth);
        DvtLegendRenderer._renderSection(legend, legendSections[i], i, availSpace, rowHeight, false);
        if (nestedSectionCounter > 0) {
          availSpace.h += outerSectionTitleHeight;
          nestedSectionCounter--;
        }
        legendHeight = Math.max(availSpace.h, legendHeight);
        legendWidth += availSpace.w;
        if (i != numSections - 1) {
          legendWidth += sectionGap;
        }
        availSpace.x = legendWidth;
      }
      else {
        nestedSectionCounter = legendSections[i]['sections'].length;
        DvtLegendRenderer._renderSection(legend, legendSections[i], i, availSpace, rowHeight, false);
        outerSectionTitleHeight = availSpace.h;
      }
      availSpace.y = legendY;
    }
  }

  availSpace.w = legendWidth;
  availSpace.h = legendHeight
}

/**
 * Renders the specified section and updates the available space.
 * @param {DvtLegend} legend The legend being rendered.
 * @param {object} section The data for the section to render.
 * @param {number} sectionIndex The index of the section being rendered.
 * @param {DvtRectangle} availSpace The available space.
 * @param {number} rowHeight The height of a legend row.
 * @param {boolean} bScrollable True if scrolling is allowed.
 * @private
 */
DvtLegendRenderer._renderSection = function (legend, section, sectionIndex, availSpace, rowHeight, bScrollable) {
  // Section must exist to be rendered
  if (!section)
    return;

  var options = legend.__getOptions();

  // Cache useful fields
  var context = legend.getContext();
  var initAvailY = availSpace.y;
  var markerSize = options['layout']['markerSize'];
  var markerGap = DvtLegendDefaults.getGapSize(options, options['layout']['markerGap']);
  var rowGap = DvtLegendDefaults.getGapSize(options, options['layout']['rowGap']);
  var colGap = DvtLegendDefaults.getGapSize(options, options['layout']['columnGap']);

  // Determine legend section title
  var titleDim = DvtLegendRenderer._renderTitle(legend, section['title'], availSpace, true);
  availSpace.y += titleDim.height;

  // See if this is a section group which contains more legend sections
  if (!section['items']) {
    availSpace.h = titleDim.height;
  }
  else {
    availSpace.h -= titleDim.height;
    //Title should always be on its own row
    initAvailY += titleDim.height;

    // Determine needed cols and rows
    var legendInfo = DvtLegendRenderer._calcSectionSpace(legend, availSpace, rowHeight, section['items'], bScrollable);
    var numCols = legendInfo['numCols'];
    var numRows = legendInfo['numRows'];
    var colWidth = legendInfo['width'];

    // Update availSpace with space required for regular or scrollable legend
    var legendHeight = numRows * (rowHeight + rowGap) - rowGap;
    availSpace.h = Math.min(availSpace.h, legendHeight) + titleDim.height;
    availSpace.w = (colWidth * numCols) + (colGap * (numCols - 1));
    
    // No need to render during layout pass
    if(options['isLayout']) {
      // TODO clean up this code, the current layout routine relies on availSpace, which is incredibly hard to follow and unmaintainable.
      if(numRows == 1) {
        var totalWidth = 0;
        for (var i = 0;i < section['items'].length;i++) {
          var item = section['items'][i];
          var itemTextWidth = Math.ceil(DvtLegendRenderer._getTextWidth(legend, item.text));
          totalWidth += itemTextWidth + markerSize + markerGap + colGap;
        }
        availSpace.w = totalWidth - colGap;
      }
      
      return;
    }
    
    // Don't render if not enough space
    if (numRows == 0 || numCols == 0)
      return;

    // If rendering, check to see if scrolling is allowed. If it is, create a DvtScrollableLegend if needed
    // We currently only support scrolling for vertical legends.
    var scrollableLegend = null;
    var handle = null;
    var fullLegendHeight = numRows * (rowHeight + rowGap) - rowGap + titleDim.height;
    var numItems = section['items'].length;
    var bUseScrollableLegend = options['orientation'] === "vertical" && bScrollable && fullLegendHeight > availSpace.h;
    if (bUseScrollableLegend) {
      handle = DvtLegendRenderer._createHandle(legend, context, availSpace, sectionIndex);
      scrollableLegend = DvtLegendRenderer._createScrollableLegend(legend, context, availSpace, handle, fullLegendHeight, numItems);
      legend.__registerScrollableSection(scrollableLegend);
    }

    // For text truncation
    var textSpace = colWidth - markerSize - markerGap;

    // For BIDI
    var isBIDI = DvtStyleUtils.isLocaleR2L();

    // Render the items one by one
    var currRow = 0;
    var currCol = 1;

    //for sections with 1 row
    if(numRows == 1) {
      
      // Calculate the unused space if all space was assigned equally
      var extraTextSpace = 0;
      for (var i = 0;i < numItems;i++) {
        var item = section['items'][i];
        var itemTextWidth = Math.ceil(DvtLegendRenderer._getTextWidth(legend, item.text));
        if (itemTextWidth < textSpace)
          extraTextSpace += textSpace - itemTextWidth;
      }

      for (var i = 0;i < numItems;i++) {
        var item = section['items'][i];

        var markerX;
        var textX;
        if (isBIDI) {
          markerX = availSpace.w - markerSize;
          textX = availSpace.w - markerSize - markerGap;
        }
        else {
          markerX = availSpace.x;
          textX = availSpace.x + markerSize + markerGap;
        }
        
        // Create legend marker
        var shape = item.shape;
        var marker = DvtLegendRenderer._createLegendMarker(context, markerX, availSpace.y, rowHeight, markerSize, item)

        // Create legend text
        var label = item.text;
        var itemTextWidth = Math.ceil(DvtLegendRenderer._getTextWidth(legend, item.text));
        var text = null;
        if (label) {
          if (itemTextWidth < textSpace) {
            text = DvtLegendRenderer._createLegendText(legend, context, availSpace, textSpace, label, options['textStyle']);
          }
          else {
            text = DvtLegendRenderer._createLegendText(legend, context, availSpace, textSpace + extraTextSpace, label, options['textStyle']);
            if (text != null) {
              itemTextWidth = Math.ceil(DvtLegendRenderer._getTextWidth(legend, text.getTextString()));
              extraTextSpace -= (textSpace-itemTextWidth);
            }

          }
          if (text != null)
            itemTextWidth = Math.ceil(DvtLegendRenderer._getTextWidth(legend, text.getTextString()));
          else {
            itemTextWidth = 0;
          }
          if (text) {
            text.setX(textX);
            text.setY(availSpace.y + rowHeight / 2);
            if (isBIDI)
              DvtLayoutUtils.alignTextEnd(text);
            else
              DvtLayoutUtils.alignTextStart(text);
          }
        }

        // Add legend items to legend
        legend.addChild(marker);
        if (text)
          legend.addChild(text);

        // Associate for interactivity. Scrollable legend doesn't handle eventing.
        var obj;
        if (text)
          obj = DvtLegendObjPeer.associate([marker, text], legend, item, text.isTruncated() ? label : null);
        else 
          obj = DvtLegendObjPeer.associate([marker], legend, item, label);

        // Legend item visibility support
        if (item.visibility == "hidden" && obj)
          marker.setHollow(obj.getColor());

        // Update coordiantes for next row  
        availSpace.y += (rowHeight + rowGap);
        currRow++;

        colWidth = itemTextWidth + markerSize;

        if (currRow === numRows && currCol !== numCols) {
          availSpace.y = initAvailY;
          if (isBIDI)
            availSpace.w -= (colWidth + colGap);
          else 
            availSpace.x += colWidth + colGap;
          currRow = 0;
          currCol++;
        }
      }

    }
    else {
      // iterate through items
      for (var i = 0;i < numItems;i++) {
        var item = section['items'][i];

        var markerX;
        var textX;
        if (isBIDI) {
          markerX = availSpace.w - markerSize;
          textX = availSpace.w - markerSize - markerGap;

        }
        else {
          markerX = availSpace.x;
          textX = availSpace.x + markerSize + markerGap;

        }
        // Create legend marker
        var shape = item.shape;
        var marker = DvtLegendRenderer._createLegendMarker(context, markerX, availSpace.y, rowHeight, markerSize, item)

        // Create legend text
        var label = item.text;
        var text = null;
        if (label) {
          text = DvtLegendRenderer._createLegendText(legend, context, availSpace, textSpace, label, options['textStyle']);

          if (text) {
            text.setX(textX);
            text.setY(availSpace.y + rowHeight / 2);
            if (isBIDI)
              DvtLayoutUtils.alignTextEnd(text);
            else
              DvtLayoutUtils.alignTextStart(text);
          }
        }

        // Add legend items to legend
        if (scrollableLegend) {
          handle.addChild(marker);
          if (text)
            handle.addChild(text);
        }
        else {
          legend.addChild(marker);
          if (text)
            legend.addChild(text);
        }

        // Associate for interactivity. Scrollable legend doesn't handle eventing.
        var obj;
        if (text)
          obj = DvtLegendObjPeer.associate([marker, text], legend, item, text.isTruncated() ? label : null);
        else 
          obj = DvtLegendObjPeer.associate([marker], legend, item, label);

        // For scrollable legend interactivity
        if (scrollableLegend && obj instanceof DvtLegendObjPeer)
          scrollableLegend.__registerObject(obj);

        // Legend item visibility support
        if (item.visibility == "hidden" && obj)
          marker.setHollow(obj.getColor());

        // Update coordiantes for next row  
        availSpace.y += (rowHeight + rowGap);
        currRow++;
        if (currRow === numRows && currCol !== numCols) {
          availSpace.y = initAvailY;
          if (isBIDI)
            availSpace.w -= (colWidth + colGap);
          else 
            availSpace.x += colWidth + colGap;
          currRow = 0;
          currCol++;
        }
      }
    }

  }
}

/**
 * Renders the legend sections and updates the available space.
 * @param {DvtLegend} legend The legend being rendered.
 * @param {DvtRectangle} availSpace The available space.
 * @param {number} rowHeight The height of a legend row.
 * @param {boolean} bScrollable True if scrolling is allowed.
 */
DvtLegendRenderer._calcSectionSpaces = function (legend, availSpace, rowHeight, bScrollable) {
  var data = legend.__getData();
  var options = legend.__getOptions();

  var isLayout = options['isLayout'];
  legend.Options['isLayout'] = true;

  var legendHeight = 0;
  var legendWidth = 0;
  var legendX = availSpace.x;
  var legendY = availSpace.y;

  var legendSections = [];
  for (var i = 0;i < data['sections'].length;i++)
    DvtLegendRenderer._getLegendSections(data['sections'][i], legendSections);
  var numSections = legendSections.length;

  var sectionGap = DvtLegendDefaults.getGapSize(options, options['layout']['sectionGap']);
  var maxHeight = availSpace.h - sectionGap * (numSections - 1);
  var maxWidth = availSpace.w;

  var arSectionSpace = [];
  // Give each section max legend space and determine the space needed
  for (var i = 0;i < numSections;i++) {
    availSpace.h = maxHeight;
    availSpace.w = maxWidth;
    DvtLegendRenderer._renderSection(legend, legendSections[i], i, availSpace, rowHeight, bScrollable);
    arSectionSpace[i] = availSpace.h;
  }

  // Give each section equal space and determine leftover/needed space
  arSectionSpaceNeeded = [];
  numShortSections = 0;
  extraSpace = 0;
  var equalSpace = maxHeight / numSections;
  for (i = 0;i < numSections;i++) {
    var spaceNeeded = arSectionSpace[i] - equalSpace;
    if (spaceNeeded <= 0) {
      arSectionSpaceNeeded[i] = 0;
      extraSpace -= spaceNeeded;// Keep track of unused space
    }
    else {
      arSectionSpace[i] = equalSpace;
      arSectionSpaceNeeded[i] = spaceNeeded;
      numShortSections++;
    }
  }

  // If there is unused space, distribute evenly across all sections that need it until there is no more
  while (extraSpace > 0 && numShortSections > 0) {
    var splitSpace = extraSpace / numShortSections;

    for (i = 0;i < numSections;i++) {
      if (arSectionSpaceNeeded[i] > 0) {
        spaceNeeded = arSectionSpaceNeeded[i] - splitSpace;
        if (spaceNeeded <= 0) {
          arSectionSpace[i] += arSectionSpaceNeeded[i];// Filled space needs, update
          arSectionSpaceNeeded[i] = 0;
          extraSpace = extraSpace - (splitSpace + spaceNeeded);// Keep track of unused space
          numShortSections--;// Decrement sections that still need space
        }
        else {
          arSectionSpace[i] += splitSpace;
          extraSpace -= splitSpace;
          arSectionSpaceNeeded[i] = spaceNeeded;
        }
      }
    }
  }

  // Pre render again in new allocated space
  availSpace.x = legendX;
  availSpace.y = legendY;
  availSpace.w = maxWidth;
  for (i = 0;i < numSections;i++) {
    availSpace.h = arSectionSpace[i];
    DvtLegendRenderer._renderSection(legend, legendSections[i], i, availSpace, rowHeight, bScrollable);
    availSpace.x = legendX;
    legendWidth = Math.max(availSpace.w, legendWidth);
    legendHeight += availSpace.h;
    if (i != numSections - 1) {
      availSpace.y = availSpace.h + legendY + sectionGap;
      legendHeight += sectionGap;
    }
  }

  availSpace.w = legendWidth;
  availSpace.h = legendHeight;
  availSpace.x = legendX;
  availSpace.y = legendY;
  legend.Options['isLayout'] = isLayout;

  return arSectionSpace;
}

/**
 * Returns the space required for a legend section.
 * @param {DvtLegend} legend The legend being rendered.
 * @param {DvtRectangle} availSpace The available space.
 * @param {number} rowHeight The height of a legend row.
 * @param {object} items The legend items to be rendered.
 * @param {boolean} bScrollable True if scrolling is allowed.
 * @return {object} Map containing width, rows and columns in the legend.
 * @private
 */
DvtLegendRenderer._calcSectionSpace = function (legend, availSpace, rowHeight, items, bScrollable) {
  var options = legend.__getOptions();

  // Use widest text since using # of chars can be wrong for unicode
  var textWidth = 0;
  for (var i = 0;i < items.length;i++) {
    var item = items[i];
    var tempWidth = DvtLegendRenderer._getTextWidth(legend, item.text);
    if (tempWidth > textWidth) {
      textWidth = tempWidth;
    }
  }

  // Row variables
  var markerSize = options['layout']['markerSize'];
  var markerGap = DvtLegendDefaults.getGapSize(options, options['layout']['markerGap']);
  var rowGap = DvtLegendDefaults.getGapSize(options, options['layout']['rowGap']);
  var colGap = DvtLegendDefaults.getGapSize(options, options['layout']['columnGap']);

  var numRows;
  var colWidth;
  var numCols;
  var fullColWidth = (options['isLayout'] ? Math.round(markerSize + markerGap + textWidth) : availSpace.w);

  var isHoriz = (options['orientation'] == "vertical" ? false : true);
  if (isHoriz) {
    // For horizontal layouts, try to go all the way across using fullColWidth, if not enough space, 
    // maximize depth and then determine cols to reduce text truncation
    var fullNumCols = Math.floor(availSpace.w / fullColWidth);
    numCols = Math.min(fullNumCols, items.length);
    numRows = Math.ceil((((fullColWidth + colGap) * items.length) - colGap) / availSpace.w);
    if ((numRows * (rowHeight + rowGap)) - rowGap > availSpace.h) {
      numRows = Math.floor((availSpace.h + rowGap) / (rowHeight + rowGap));
      numCols = Math.ceil(items.length / numRows);
    }
  }
  else {
    // For scrollable legends, don't wrap legend items into more than one column
    if (bScrollable) {
      numCols = 1;
      numRows = items.length;
    }
    else {
      // For vertical layouts use full depth and then increase cols as necessary
      numRows = Math.min(Math.floor((availSpace.h + rowGap) / (rowHeight + rowGap)), items.length);
      numCols = Math.ceil(items.length / numRows);
    }
  }
  var maxColWidth = Math.floor((availSpace.w - (colGap * (numCols - 1))) / numCols);
  colWidth = Math.min(fullColWidth, maxColWidth);

  if (colWidth < markerSize)
    return {'width' : 0, 'height' : 0, 'numCols' : 0, 'numRows' : 0};

  return {'width' : colWidth, 'numCols' : numCols, 'numRows' : numRows};
}

/**
 * Returns the height of a single item in the legend.
 * @param {DvtLegend} legend The legend being rendered.
 * @return {number} The height of a legend item.
 */
DvtLegendRenderer._getRowHeight = function (legend) {
  var options = legend.__getOptions();

  // Figure out the legend item height
  var text = new DvtText(legend.getContext(), "Test");
  text.setCSSStyle(new DvtCSSStyle(options['textStyle']));
  text.alignCenter();
  legend.addChild(text);
  var dims = text.getDimensions();
  legend.removeChild(text);
  return Math.ceil(Math.max(dims.h, options['layout']['markerSize']));
}

/**
 * Returns the width of a text object in the legend with legend CSS styles applied.
 * @param {DvtLegend} legend The legend being rendered.
 * @param {string} label The text to be rendered.
 * @return {number} The width of the text object.
 */
DvtLegendRenderer._getTextWidth = function (legend, label) {
  var options = legend.__getOptions();

  // Figure out the legend item height
  var text = new DvtText(legend.getContext(), label);
  var stage = legend.getContext().getStage();
  text.setCSSStyle(new DvtCSSStyle(options['textStyle']));
  stage.addChild(text);
  var dims = text.getDimensions();
  stage.removeChild(text);
  return dims.w;
}

/**
 * Creates a legend item.
 * @param {DvtLegend} legend The legend being rendered.
 * @param {DvtContext} context The context in which to create the legend item.
 * @param {DvtRectangle} availSpace The available space.
 * @param {number} textSpace The width allowed for text.
 * @param {String} label The content of the text object.
 * @param {String} style The CSS style string to apply to the text object.
 * @return {DvtText}
 * @private
 */
DvtLegendRenderer._createLegendText = function (legend, context, availSpace, textSpace, label, style) {
  // Draw the legend text. Approximate trunction bc truncateToSpace is expensive
  var text = new DvtText(context, label);
  text.alignCenter();
  text.setCSSStyle(new DvtCSSStyle(style));
  text = text.truncateToSpace(legend, textSpace, availSpace.h);
  return text;
}

/**
 * Creates a legend item.
 * @param {DvtContext} context The context in which to create the legend item.
 * @param {number} x The x coordinate of the legend marker.
 * @param {number} y The y coordinate of the legend marker.
 * @param {number} rowHeight The height of the legend item.
 * @param {number} markerSize The size of the legend item
 * @param {object} item The data for the legend item.
 * @return {DvtShape}
 * @private
 */
DvtLegendRenderer._createLegendMarker = function (context, x, y, rowHeight, markerSize, item) {
  var shape = item.shape;
  var marker;
  if (shape == "line") {
    marker = DvtLegendRenderer._createLine(context, x, y, rowHeight, item);
  }
  else if (shape == "lineWithMarker") {
    marker = DvtLegendRenderer._createLine(context, x, y, rowHeight, item);
    marker.addChild(DvtLegendRenderer._createMarker(context, x, y, rowHeight, DvtLegendRenderer._LINE_MARKER_SIZE, item));
  }
  else {
    marker = DvtLegendRenderer._createMarker(context, x, y, rowHeight, markerSize, item)
  }
  return marker;
}

/**
 * Creates a marker item.
 * @param {DvtContext} context The context in which to create the legend item.
 * @param {number} x The x coordinate of the legend marker.
 * @param {number} y The y coordinate of the legend marker.
 * @param {number} rowHeight The height of the legend item.
 * @param {number} itemSize The size of the legend item
 * @param {object} item The data for the legend item.
 * @return {DvtMarker}
 * @private
 */
DvtLegendRenderer._createMarker = function (context, x, y, rowHeight, itemSize, item) {
  // Find the style values
  var itemShape = item.markerShape ? item.markerShape : item.shape;
  if (!itemShape)
    itemShape = "square";

  var itemColor = item.markerColor ? item.markerColor : item.color;
  if (!itemColor)
    itemColor = "#999999";

  var itemPattern = item.pattern;

  // Create the marker
  var markerShape = DvtMarker.convertShapeString(itemShape);
  var markerY = y + (rowHeight - itemSize) / 2;
  var markerX = (item.shape == "lineWithMarker" ? x + (DvtLegendRenderer._DEFAULT_ITEM_WIDTH - itemSize) / 2 : x);
  var legendMarker = new DvtMarker(context, markerShape, markerX, markerY, itemSize, itemSize);

  if (itemPattern)
    legendMarker.setFill(new DvtPatternFill(itemPattern, itemColor, "#FFFFFF"));
  else 
    legendMarker.setFill(new DvtSolidFill(itemColor));

  if (item.borderColor)
    legendMarker.setStroke(new DvtSolidStroke(item.borderColor));

  return legendMarker;
}

/**
 * Creates a line item.
 * @param {DvtContext} context The context in which to create the legend item.
 * @param {number} x The x coordinate of the legend marker.
 * @param {number} y The y coordinate of the legend marker.
 * @param {number} rowHeight The height of the legend item.
 * @param {object} item The data for the legend item.
 * @return {DvtLine}
 * @private
 */
DvtLegendRenderer._createLine = function (context, x, y, rowHeight, item) {
  var textY = y + rowHeight / 2;
  var legendMarker = new DvtLine(context, x, textY, x + DvtLegendRenderer._DEFAULT_ITEM_WIDTH, textY);
  var style = item.lineStyle;
  var stroke = new DvtSolidStroke(item.color, 1, DvtLegendRenderer._LINE_WIDTH);
  stroke.setType(DvtStroke.convertTypeString(style))
  legendMarker.setStroke(stroke);
  return legendMarker;
}

/**
 * Creates a handle for a scrollable legend.
 * @param {DvtLegned} legend The legend being rendered
 * @param {DvtContext} context The context in which to create the legend item.
 * @param {DvtRectangle} availSpace The available space.
 * @param {String} id The handle id.
 * @return {DvtHandle}
 * @private
 */
DvtLegendRenderer._createHandle = function (legend, context, availSpace, id) {
  var boundRect = [availSpace.x, availSpace.y, availSpace.x + availSpace.w, availSpace.y + availSpace.h];
  var clipRect = new DvtRectangle(availSpace.x, availSpace.y, availSpace.w, availSpace.h);
  var clipId = legend.getId() + "_" + id;
  var handle = new DvtHandle(context, "legendHandler", boundRect, clipRect, clipId);
  legend.addChild(handle);
  return handle;
}

/**
 * Creates a scrollable legend and registers it with the parent legend container.
 * @param {DvtLegned} legend The legend being rendered.
 * @param {DvtContext} context The context in which to create the legend item.
 * @param {DvtRectangle} availSpace The available space.
 * @param {DvtHandle} handle The legend handle to associate with.
 * @param {number} legendHeight The height of all the legend items.
 * @param {number} numItems The number of legend rows.
 * @return {DvtScrollableLegend}
 * @private
 */
DvtLegendRenderer._createScrollableLegend = function (legend, context, availSpace, handle, legendHeight, numItems) {
  var scrollableLegend = new DvtScrollableLegend(context, availSpace.x, availSpace.y, availSpace.w, availSpace.h, legendHeight, handle, numItems);
  legend.addChild(scrollableLegend);
  handle.render();// rendering must occur after scrollabe legend has created and set the clip path on the handle
  return scrollableLegend;
}
/**
 * Legend rendering utilities for attribute groups components.
 * @class
 */
var DvtLegendAttrGroupsRenderer = function() {}

DvtObj.createSubclass(DvtLegendAttrGroupsRenderer, DvtObj, "DvtLegendAttrGroupsRenderer");

DvtLegendAttrGroupsRenderer._LEGEND_MAX_HEIGHT = 0.4; 
DvtLegendAttrGroupsRenderer._CONTINUOUS_GROUP_GAP = 1; // gap between continuous item and rest of component
DvtLegendAttrGroupsRenderer._CONTINUOUS_ITEM_WIDTH = 60; 
DvtLegendAttrGroupsRenderer._CONTINUOUS_ITEM_HEIGHT = 15;
DvtLegendAttrGroupsRenderer._CONTINUOUS_ITEM_GAP = 5; 
DvtLegendAttrGroupsRenderer._LABEL_SIZE = 11;
DvtLegendAttrGroupsRenderer._LABEL_COLOR = "#636363";
DvtLegendAttrGroupsRenderer._LABEL_VALUE_COLOR = "#333333";

/**
 * Performs layout and rendering for an attribute groups object.
 * @param {DvtContext} context
 * @param {DvtEventManager} eventManager
 * @param {DvtContainer} container The legend container.
 * @param {number} availWidth The available horizontal space.
 * @param {number} availHeight The available vertical space.
 * @param {DvtAttrGroups} attrGroups An attribute groups describing the colors.
 * @return {DvtDisplayable} The rendered contents.
 */
DvtLegendAttrGroupsRenderer.renderAttrGroups = function(context, eventManager, container, availWidth, availHeight, attrGroups, styles) {  
  var colorContainer = null;
  if (attrGroups) {
	  if(attrGroups instanceof DvtContinuousAttrGroups) 
	    colorContainer = DvtLegendAttrGroupsRenderer._renderAttrGroupsContinuous(context, eventManager, container, availWidth, availHeight, attrGroups, styles);
	  else if(attrGroups instanceof DvtDiscreteAttrGroups) 
	    colorContainer = DvtLegendAttrGroupsRenderer._renderAttrGroupsDiscrete(context, eventManager, container, availWidth, availHeight, attrGroups, styles); 
  }
  return colorContainer;
}

/**
 * Performs layout and rendering for continuous attribute groups.
 * @param {DvtContext} context
 * @param {DvtEventManager} eventManager
 * @param {DvtContainer} container The legend container.
 * @param {number} availWidth The available horizontal space.
 * @param {number} availHeight The available vertical space.
 * @param {DvtAttrGroups} attrGroups An attribute groups describing the colors.
 * @return {DvtDisplayable} The rendered contents.
 */
DvtLegendAttrGroupsRenderer._renderAttrGroupsContinuous = function(context, eventManager, container, availWidth, availHeight, attrGroups, styles) { 
  // Create a container for this item
  var isBIDI = DvtStyleUtils.isLocaleR2L();
  var labelY = DvtLegendAttrGroupsRenderer._CONTINUOUS_ITEM_HEIGHT/2 + DvtLegendAttrGroupsRenderer._CONTINUOUS_GROUP_GAP;
  var colorContainer = new DvtContainer(context);
  container.addChild(colorContainer);
  
  // Min Label
  var minLabelStr = attrGroups.getMinLabel();
  var minLabel = new DvtText(context, minLabelStr, 0, labelY);
  minLabel.setCSSStyle(styles.labelStyle);
  DvtLayoutUtils.alignTextStart(minLabel);
  minLabel.alignCenter();
  colorContainer.addChild(minLabel);
  
  // Gradient
  var gradientRect = new DvtRect(context, 0, DvtLegendAttrGroupsRenderer._CONTINUOUS_GROUP_GAP, DvtLegendAttrGroupsRenderer._CONTINUOUS_ITEM_WIDTH, DvtLegendAttrGroupsRenderer._CONTINUOUS_ITEM_HEIGHT); 
  var ramp = isBIDI ? attrGroups.getRamp().slice().reverse() : attrGroups.getRamp();
  gradientRect.setFill(new DvtLinearGradientFill(0, ramp));
  gradientRect.setStroke(new DvtSolidStroke("#000000"));
  colorContainer.addChild(gradientRect);
  var gradientWidth = DvtLegendAttrGroupsRenderer._CONTINUOUS_ITEM_WIDTH + DvtLegendAttrGroupsRenderer._CONTINUOUS_ITEM_GAP;
  
  // Max Label
  var maxLabelStr = attrGroups.getMaxLabel();
  var maxLabel = new DvtText(context, maxLabelStr, 0, labelY);
  maxLabel.setCSSStyle(styles.labelStyle);
  DvtLayoutUtils.alignTextStart(maxLabel);
  maxLabel.alignCenter();
  colorContainer.addChild(maxLabel);
  
  // Position the labels and the rectangle
  if(isBIDI) {
    // BIDI
    var maxLabelWidth = maxLabel.getDimensions().w + DvtLegendAttrGroupsRenderer._CONTINUOUS_ITEM_GAP;
    gradientRect.setTranslateX(maxLabelWidth);
    minLabel.setX(maxLabelWidth + gradientWidth);
  }
  else {
    // Non-BIDI
    var minLabelWidth = minLabel.getDimensions().w + DvtLegendAttrGroupsRenderer._CONTINUOUS_ITEM_GAP
    gradientRect.setTranslateX(minLabelWidth);
    maxLabel.setX(minLabelWidth + gradientWidth);
  }
  
  // Add a tooltip to the gradient rectangle
  var tooltip = minLabelStr + " - " + maxLabelStr;
  eventManager.associate(gradientRect, new DvtSimpleObjPeer(tooltip));
  
  // If there isn't enough space for all the content, drop the labels
  if(colorContainer.getDimensions().w > availWidth) {
    colorContainer.removeChild(minLabel);
    colorContainer.removeChild(maxLabel);
    gradientRect.setTranslateX(0);
  }
  
  // Return the contents
  return colorContainer;
}

/**
 * Performs layout and rendering for discrete attribute groups.
 * @param {DvtContext} context
 * @param {DvtEventManager} eventManager
 * @param {DvtContainer} container The legend container.
 * @param {number} availWidth The available horizontal space.
 * @param {number} availHeight The available vertical space.
 * @param {DvtAttrGroups} attrGroups An attribute groups describing the colors.
 * @return {DvtDisplayable} The rendered contents.
 */
DvtLegendAttrGroupsRenderer._renderAttrGroupsDiscrete = function(context, eventManager, container, availWidth, availHeight, attrGroups, styles) {  
  // Iterate through the attribute group mappings to build up the legend items array.
  var items = [];
  var mappings = attrGroups.getMappingsArray();
  for(var i=0; i<mappings.length; i++) {
    var mapping = mappings[i];
    items.push({'text': mapping.groupLabel, 'color': mapping.params.color, 'pattern': mapping.params.pattern, 'borderColor': "#000000"});
  }
  
  // Create the legend data object and legend
  var dataObj = {'sections': [{'items': items}]};
  var component = DvtLegend.newInstance(context, null, null, {layout: {outerGapWidth: 0, outerGapHeight: 0}, textStyle: styles.labelStyle.toString()});
  container.addChild(component);
  
  // Layout the legend and get the preferred size
  var maxLegendHeight = availHeight * DvtLegendAttrGroupsRenderer._LEGEND_MAX_HEIGHT;
  var preferredDims = component.getPreferredSize(dataObj, availWidth, maxLegendHeight);
  component.render(dataObj, availWidth, preferredDims.height);
  
  // Add a transparent background for the legend so that calling getDimensions on it
  // will return the full size with the gaps.
  var actualDims = component.getDimensions();
  var rect = new DvtRect(context, 0, 0, actualDims.w, preferredDims.height);
  rect.setFill(new DvtSolidFill("#FFFFFF", 0.01));
  component.addChildAt(rect, 0);
  
  // Return the contents
  return component;
}

