/**
 * Axis component.  This class should never be instantiated directly.  Use the
 * newInstance function instead.
 * @class
 * @constructor
 * @extends {DvtContainer}
 * @export
 */
var DvtAxis = function() {}

DvtObj.createSubclass(DvtAxis, DvtContainer, "DvtAxis");

/**
 * Returns a new instance of DvtAxis.
 * @param {DvtContext} context The rendering context.
 * @param {string} callback The function that should be called to dispatch component events.
 * @param {object} callbackObj The optional object instance on which the callback function is defined.
 * @param {object} options The object containing options specifications for this component.
 * @return {DvtAxis}
 * @export
 */
DvtAxis.newInstance = function(context, callback, callbackObj, options) {
  var axis = new DvtAxis();
  axis.Init(context, callback, callbackObj, options);
  return axis;
}

/**
 * Initializes the component.
 * @param {DvtContext} context The rendering context.
 * @param {string} callback The function that should be called to dispatch component events.
 * @param {object} callbackObj The optional object instance on which the callback function is defined.
 * @param {object} options The object containing options specifications for this component.
 * @protected
 */
DvtAxis.prototype.Init = function(context, callback, callbackObj, options) {
  // Note: The callback is not used for now, but we ask for it for extensibility reasons
  DvtAxis.superclass.Init.call(this, context);
  this.setOptions(options);
  
  // Create the event handler and add event listeners
  this._eventHandler = new DvtEventManager(context);
  this._eventHandler.addListeners(this);
}

/**
 * Specifies the non-data options for this component.
 * @param {object} options The object containing options specifications for this component.
 * @protected
 * @export
 */
DvtAxis.prototype.setOptions = function(options) {
  // Combine the user options with the defaults and store
  this.Options = DvtAxisDefaults.calcOptions(options);
}

/**
 * Returns the preferred dimensions for this component given the maximum available space.
 * @param {object} data The object containing data for this component.
 * @param {Number} maxWidth The maximum width available.
 * @param {Number} maxHeight The maximum height available.
 * @return {object} The preferred dimensions for the object.
 */
DvtAxis.prototype.getPreferredSize = function(data, maxWidth, maxHeight) {
  // Set the layout flag to indicate this is a layout pass only
  this.Options['isLayout'] = true;

  // Ask the axis to render its context in the max space and find the space used
  this.render(data, maxWidth, maxHeight);
  var dims = this.getDimensions();
  var width = dims.w;
  var height = dims.h;
  
  // Clear the rendered contents and reset state
  this.Options['isLayout'] = false;
  this.removeChildren();
  
  // Return the height needed.  Reserve the full space along the edge of the axis.
  var position = this.Options.position;
  if(position == "top" || position == "bottom") {
    return {'width': maxWidth, 'height': Math.min(dims.h, maxHeight)};
  } else {
    // In Chrome, when getDimensioins is called on DvtAxis the width will sometimes be less the widest text element
    // that is a child of it. When we actually render text labels can get dropped or truncated incorrectly. Work around 
    // is to add 10% to the width calculated. To see this, do not add 10% to the dims.w and render a default bar graph
    // in Chrome 13.0.782.215
    var extraWidth = Math.max(1, dims.w * .1);
    return {'width': Math.min(dims.w + extraWidth, maxWidth), 'height': maxHeight};
  }
}

/**
 * Renders the component at the specified size.
 * @param {object} data The object containing data for this component.
 * @param {number} width The width of the component.
 * @param {number} height The height of the component.
 * @param {x} optional x position of the component.
 * @param {y} optional y position of the component.
 * @export
 */
DvtAxis.prototype.render = function(data, width, height, x, y) 
{  
  this.Width = width;
  this.Height = height;
  
  // Store the data object. Clone to avoid modifying the provided object.
  this.Data = DvtJSONUtils.clone(data);
  
  // Clear any contents rendered previously  
  this.removeChildren();
  
  // Set default values to undefined properties.
  if(!x){
   x = 0;
  }      
  
  if(!y){
   y = 0;
  } 
  
  // Render the axis
  var availSpace = new DvtRectangle(x, y, width, height);
  DvtAxisRenderer.render(this, availSpace);
  
  // Queue a render with the context
  this.getContext().queueRender();
}

/**
 * Returns the data object for the component.
 * @return {object} The object containing data for this component.
 */
DvtAxis.prototype.__getData = function() {
  return this.Data ? this.Data : {};
}

/**
 * Returns the evaluated options object, which contains the user specifications
 * merged with the defaults.
 * @return {object} The options object.
 */
DvtAxis.prototype.__getOptions = function() {
  return this.Options;
}

/**
 * Returns the DvtEventManager for this component.
 * @return {DvtEventManager}
 */
DvtAxis.prototype.__getEventManager = function() {
  return this._eventHandler;
}

/**
 * Returns the axisInfo for the axis
 * @return {DvtAxisInfo} the axisInfo
 */
 DvtAxis.prototype.__getInfo = function() {
   return this.Info;
 }

/**
 * Sets the object containing calculated axis information and support
 * for creating drawables.
 * @param {DvtAxisInfo} axisInfo
 */
DvtAxis.prototype.__setInfo = function(axisInfo) {
  this.Info = axisInfo;
}

/**
 * Abstact formatter for an axis label value.
 *
 * @param {object} bundle translations bundle
 * @constructor
 */
var DvtAbstractAxisValueFormatter = function (bundle) {
  this._bundle = bundle;
}

DvtObj.createSubclass(DvtAbstractAxisValueFormatter, DvtObj, "DvtAbstractAxisValueFormatter");

/**
 * Abstract method which purpose is to format given numeric value.
 * @param {number} value value to be formatted
 * @return {string} formatted value as string
 */
DvtAbstractAxisValueFormatter.prototype.format = function (value) {
}

/**
 * Returns currently used bundle
 * @protected
 * @return {object} currently used bundle
 */
DvtAbstractAxisValueFormatter.prototype.GetBundle = function () {
  return this._bundle;
}
/**
 * Default values and utility functions for axis versioning.
 * @class
 */
var DvtAxisDefaults = new Object();

DvtObj.createSubclass(DvtAxisDefaults, DvtObj, "DvtAxisDefaults");

/**
 * Defaults for version 1.
 */ 
DvtAxisDefaults.VERSION_1 = {
  'position': null,
  'minValue': null, 'maxValue': null, 'majorIncrement': null, 'minorIncrement': null,
  'scaledFromBaseline': "on",
  'timeRangeMode': "explicit",
  'titleStyle': "font-size: 11px; color: #737373;", 
  'tickLabel': {'style': "font-size: 11px; color: #333333;", 'rotation': "auto", 'rendered': true},
  'majorTick': {'lineColor': "rgba(138,141,172,0.4)", 'lineWidth': 1, 'rendered': null},
  'minorTick': {'lineColor': "rgba(138,141,172,0.20)", 'lineWidth': 1, 'rendered': false},
  'axisLine': {'lineColor': "#8A8DAC", 'lineWidth': 1, 'rendered': true},
  
  // For group axis, an optional offset expressed as a factor of the group size.
  'startGroupOffset': 0, 'endGroupOffset': 0,
  
  //*********** Internal Attributes *************************************************//
  'layout': {
    // Gap ratio is multiplied against all gap sizes
    'gapRatio': 1.0,
    'titleGap': 9,
    'verticalAxisGap': 2,
    'horizontalAxisGap': 2
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
DvtAxisDefaults.calcOptions = function(userOptions) {
  var defaults = DvtAxisDefaults._getDefaults(userOptions);
  
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
DvtAxisDefaults._getDefaults = function(userOptions) {
  // Note: Version checking will eventually get added here
  // Note: Future defaults objects are deltas on top of previous objects
  return DvtJSONUtils.clone(DvtAxisDefaults.VERSION_1);
}

/**
 * Scales down gap sizes based on the size of the component.
 * @param {object} options The object containing options specifications for this component.
 * @param {Number} defaultSize The default gap size.
 * @return {Number} 
 */
DvtAxisDefaults.getGapSize = function(options, defaultSize) {
  return Math.ceil(defaultSize * options['layout']['gapRatio']);
}
/**
 * Renderer for DvtAxis.
 * @class
 */
var DvtAxisRenderer = new Object();

DvtObj.createSubclass(DvtAxisRenderer, DvtObj, "DvtAxisRenderer");

/**
 * Renders the axis and updates the available space.
 * @param {DvtAxis} axis The axis being rendered.
 * @param {DvtRectangle} availSpace The available space.
 */
DvtAxisRenderer.render = function(axis, availSpace) {
  // Calculate the axis extents and increments
  var axisInfo = DvtAxisInfo.newInstance(axis.__getData(), axis.__getOptions(), availSpace);
  axis.__setInfo(axisInfo);
  
  // Render the title
  DvtAxisRenderer._renderTitle(axis, axisInfo, availSpace);
  
  // Render the tick labels
  DvtAxisRenderer._renderLabels(axis, axisInfo, availSpace);
}

/**
 * Renders the axis title and updates the available space.
 * @param {DvtAxis} axis The axis being rendered.
 * @param {DvtAxisInfo} axisInfo The axis model.
 * @param {DvtRectangle} availSpace The available space.
 * @private
 */
DvtAxisRenderer._renderTitle = function(axis, axisInfo, availSpace) {
  var data = axis.__getData();
  var options = axis.__getOptions();  
  
  if(!data.title)
    return;
    
  // Create the title object and add to axis
  var position = options.position;
  
  // In layout mode, treat "bottom" as "top" for space calculation
  if(options['isLayout'] && position == "bottom")
    position = "top";
    
  var title;
  if (position == "top" || position == "bottom")
    title = DvtChartTextUtils.createText(axis.__getEventManager(), axis, data.title, options['titleStyle'], 0, 0, availSpace.w, availSpace.h);
  else 
    title = DvtChartTextUtils.createText(axis.__getEventManager(), axis, data.title, options['titleStyle'], 0, 0, availSpace.h, availSpace.w);
 
  if (title) {
    // Position the title based on text size and axis position 
    var titleDims = title.getDimensions();
    var gap = DvtAxisDefaults.getGapSize(options, options['layout']['titleGap']);
    
    // Position the label and update the space
    if(position == "top") {
      title.setX(availSpace.x + availSpace.w/2 - titleDims.w/2); 
      title.setY(availSpace.y);
      availSpace.y += (titleDims.h + gap);
      availSpace.h -= (titleDims.h + gap);
    }
    else if(position == "bottom") {
      title.setX(availSpace.x + availSpace.w/2 - titleDims.w/2); 
      title.setY(availSpace.y + availSpace.h - titleDims.h);
      availSpace.h -= (titleDims.h + gap);
    }
    else if(position == "left") {
      title.setRotation(3*Math.PI/2);
      title.setTranslateX(availSpace.x);
      title.setTranslateY(availSpace.y + availSpace.h/2 + titleDims.w/2);
      availSpace.x += (titleDims.h + gap);
      availSpace.w -= (titleDims.h + gap);
    }
    else if(position == "right") {
      title.setRotation(Math.PI/2);
      title.setTranslateX(availSpace.x + availSpace.w);
      title.setTranslateY(availSpace.y + availSpace.h/2 - titleDims.w/2);
      availSpace.w -= (titleDims.h + gap);
    }
    DvtLayoutUtils.alignTextStart(title);
  }
}

/**
 * Renders the tick labels and updates the available space.
 * @param {DvtAxis} axis The axis being rendered.
 * @param {DvtAxisInfo} axisInfo The axis model.
 * @param {DvtRectangle} availSpace The available space.
 * @private
 */
DvtAxisRenderer._renderLabels = function(axis, axisInfo, availSpace) {
  var options = axis.__getOptions();
  if(options['tickLabel']['rendered']) {
    // Axis labels are positioned based on the position of the axis.  In layout
    // mode, the labels will be positioned as close to the title as possible to
    // calculate the actual space used.
    var position = options.position;
    if(position == "top" || position == "bottom") 
      DvtAxisRenderer._renderLabelsHoriz(axis, axisInfo, availSpace);
    else 
      DvtAxisRenderer._renderLabelsVert(axis, axisInfo, availSpace);
  }
}

/**
 * Renders tick labels for a horizontal axis and updates the available space.
 * @param {DvtAxis} axis The axis being rendered.
 * @param {DvtAxisInfo} axisInfo The axis model.
 * @param {DvtRectangle} availSpace The available space.
 * @private
 */
DvtAxisRenderer._renderLabelsHoriz = function(axis, axisInfo, availSpace) {
  // Position and add the axis labels.  
  var labels = axisInfo.getLabels(axis.getContext());
  var isLayout = axis.__getOptions()['isLayout'];
  var maxLv1Height = 0;
  
  // For BIDI
  var isBIDI = DvtStyleUtils.isLocaleR2L();
  
  for(var i=0; i<labels.length; i++) {
    var label = labels[i];
    if (label == null)
      continue;
    
    if (axisInfo.isLabelRotated()) {
      //truncate if necesssary
      var textBefore = label.getTextString();
      label = (isLayout ? label : label.truncateToSpace(axis, availSpace.h, availSpace.w)); //swap h and w
      if (!label)
        continue;
      var textAfter = label.getTextString();
      if (textAfter.length < textBefore.length)
        axis.__getEventManager().associate(label, new DvtSimpleObjPeer(textBefore));
      //position and add the axis labels
      if (isBIDI)
        DvtLayoutUtils.alignTextStart(label);
      else
        DvtLayoutUtils.alignTextEnd(label);
      label.setTranslateY(availSpace.y);
    } else {
      label.alignTop();
      label.setY(availSpace.y);
    }
    
    axis.addChild(label);
    maxLv1Height = Math.max(maxLv1Height, label.getDimensions().h);
  }
  
  // Render the nested labels (level 2).
  var lv2Labels = axisInfo.getLabels(axis.getContext(), 1);
  var offset = 0;
  
  if (lv2Labels != null) {
    for(i=0; i<lv2Labels.length; i++) {
      label = lv2Labels[i];
      if (label == null) 
        continue;
      
      // align with level 1 label
      if (labels[i] != null)
        offset = labels[i].getDimensions().w / 2;
      if (isBIDI) {
        label.setX(label.getX() + offset);
      } else {
        label.setX(label.getX() - offset);
      }
      
      label.alignTop();
      label.setY(availSpace.y + maxLv1Height);
      axis.addChild(label);
    }
  }
}

/**
 * Renders tick labels for a vertical axis and updates the available space.
 * @param {DvtAxis} axis The axis being rendered.
 * @param {DvtAxisInfo} axisInfo The axis model.
 * @param {DvtRectangle} availSpace The available space.
 * @private
 */
DvtAxisRenderer._renderLabelsVert = function(axis, axisInfo, availSpace) {
  var options = axis.__getOptions();
  var isLayout = options['isLayout'];
  var position = options['position'];
  
  // All vertical axis labels are aligned to the end, unless in layout mode
  var labelX = availSpace.x + availSpace.w;
  if(isLayout && position == "left")
    labelX = availSpace.x;
    
  var formatLabelVert = function(label) {
    var textBefore = label.getTextString();
    label = (isLayout ? label : label.truncateToSpace(axis, availSpace.w, availSpace.h));
    if (!label)
      return;
    var textAfter = label.getTextString();
    if (textAfter.length < textBefore.length)
      axis.__getEventManager().associate(label, new DvtSimpleObjPeer(textBefore));
    label.setX(labelX);
    DvtLayoutUtils.alignTextEnd(label);
    axis.addChild(label);
  
    if(isLayout && position == "left")
      label.alignStart();
  }
  
  // Position and add the axis labels (level 1).  
  var labels = axisInfo.getLabels(axis.getContext());
  for(var i=0; i<labels.length; i++) {
    var label = labels[i];
    if (label != null)
      formatLabelVert(label);
  }
  
  // Render the nested labels (level 2).
  var lv2Labels = axisInfo.getLabels(axis.getContext(), 1);
  if (lv2Labels != null) {  
    for(i=0; i<lv2Labels.length; i++) {
      label = lv2Labels[i];
      if (label != null)
        formatLabelVert(label);
    }
  }
}
/**
 * Calculated axis information and drawable creation.  This class should
 * not be instantiated directly.
 * @class
 * @constructor
 * @extends {DvtObj}
 */
var DvtAxisInfo = function() {}

DvtObj.createSubclass(DvtAxisInfo, DvtObj, "DvtAxisInfo");

/**
 * Creates an appropriate instance of DvtAxisInfo with the specified parameters.
 * @param {object} data The object containing data for this component.
 * @param {object} options The object containing options specifications for this component.
 * @param {DvtRectangle} availSpace The available space.
 * @return {DvtAxisInfo}
 */
DvtAxisInfo.newInstance = function(data, options, availSpace) {
  if(data['timeAxisType'] && data['timeAxisType'] != "disabled")
    return new DvtTimeAxisInfo(data, options, availSpace);
  else if(isNaN(data['minDataValue']) && isNaN(data['maxDataValue']))
    return new DvtGroupAxisInfo(data, options, availSpace);
  else
    return new DvtDataAxisInfo(data, options, availSpace);
}

/**
 * Calculates and stores the axis information.
 * @param {object} data The object containing data for this component.
 * @param {object} options The object containing options specifications for this component.
 * @param {DvtRectangle} availSpace The available space.
 * @protected
 */
DvtAxisInfo.prototype.Init = function(data, options, availSpace) {
  // Figure out the start and end coordinate of the axis
  this.Position = options.position;
  if(this.Position == "top" || this.Position == "bottom") {
    this.StartCoord = availSpace.x;
    this.EndCoord = availSpace.x + availSpace.w;
  }
  else {
    this.StartCoord = availSpace.y;
    this.EndCoord = availSpace.y + availSpace.h;
  }
  
  // Store the data and options
  this.Data = data;
  
  this.Options = options;
}

/**
 * Returns the options settings for the axis.
 * @return {object} The options for the axis.
 */
DvtAxisInfo.prototype.getOptions = function() {
  return this.Options;
}

/**
 * Returns an array containing the tick labels for this axis.
 * @param {DvtContext} context
 * @param {Number} levelIdx The level index (optional). 0 indicates the first level, 1 the second, etc. If skipped, 0 (the first level) is assumed.
 * @return {Array} The Array of DvtText objects.
 */
DvtAxisInfo.prototype.getLabels = function(context, levelIdx) {
  return null; // subclasses should override
}

/**
 * Returns the axis line for this axis.
 * @param {DvtContext} context
 * @return {DvtLine} The axis line.
 */
DvtAxisInfo.prototype.getAxisLine = function(context) {
  return null; // subclasses should override
}

/**
 * Returns an array containing the grid lines for this axis.  Objects
 * are returned in the desired z-order.
 * @param {DvtContext} context
 * @return {Array} The Array of DvtLine objects.
 */
DvtAxisInfo.prototype.getGridLines = function(context) {
  return []; // subclasses should override
}

/**
 * Returns the value for the specified coordinate along the axis.  Returns null
 * if the coordinate is not within the axis.
 * @param {number} coord The coordinate along the axis.
 * @return {object} The value at that coordinate.
 */
DvtAxisInfo.prototype.getValueAt = function(coord) {
  return null; // subclasses should override
}

/**
 * Returns the coordinate for the specified value.  Returns null if the value is
 * not within the axis.
 * @param {object} value The value to locate.
 * @return {number} The coordinate for the value.
 */
DvtAxisInfo.prototype.getCoordAt = function(value) {
  return null; // subclasses should override
}

/**
 * Returns the value for the specified coordinate along the axis.  If a coordinate
 * is not within the axis, returns the value of the closest coordinate within the axis.
 * @param {number} coord The coordinate along the axis.
 * @return {object} The value at that coordinate.
 */
DvtAxisInfo.prototype.getBoundedValueAt = function(coord) {
  return null; // subclasses should override
}

/**
 * Returns the coordinate for the specified value along the axis.  If a value
 * is not within the axis, returns the coordinate of the closest value within the axis.
 * @param {object} value The value to locate.
 * @return {number} The coordinate for the value.
 */
DvtAxisInfo.prototype.getBoundedCoordAt = function(value) {
  return null; // subclasses should override
}

/**
 * Returns the coordinate for the specified value.
 * @param {object} value The value to locate.
 * @return {number} The coordinate for the value.
 */
DvtAxisInfo.prototype.getUnboundedCoordAt = function(value) {
  return null; // subclasses should override
}

/**
 * Returns the baseline coordinate for the axis, if applicable.
 * @return {number} The baseline coordinate for the axis.
 */
DvtAxisInfo.prototype.getBaselineCoord = function() {
  return null;
}

/**
 * Returns if the labels of the horizontal axis are rotated by 90 degrees.
 * @return {boolean} Whether the labels are rotated.
 */
DvtAxisInfo.prototype.isLabelRotated = function() {
  return false;
}

/**
 * Creates a DvtText instance for the specified text label.
 * @param {DvtContext} context
 * @param {string} label The label string.
 * @param {number} coord The coordinate for the text.
 * @return {DvtText} 
 * @protected
 */
DvtAxisInfo.prototype.CreateLabel = function(context, label, coord) {
  var text = new DvtText(context, label, coord, coord);
  text.setCSSStyle(new DvtCSSStyle(this.Options['tickLabel']['style']));
  text.alignCenter();
  text.alignMiddle();
  return text;
}

/**
 * Creates a DvtLine instance with the specified stroke and coordinate.
 * @param {DvtContext} context
 * @param {DvtSolidStroke} stroke The stroke for the grid line.
 * @param {number} coord The coordinate for the grid line.
 * @return {DvtText} 
 * @protected
 */
DvtAxisInfo.prototype.CreateGridLine = function(context, stroke, coord) {
  var line = new DvtLine(context, coord, coord, coord, coord);
  line.setStroke(stroke);
  line.setPixelHinting(true);
  line.setMouseEnabled(false);
  return line;
}

/**
 * Checks all the labels for the axis and returns whether they overlap.
 * @param {Array} labelDims An array of DvtRectangle objects that describe the x, y, height, width of the axis labels.
 * @param {number} skippedLabels The number of labels to skip. If skippedLabels is 1 then every other label will be skipped.
 * @return {boolean} True if any labels overlap.
 * @protected
 */
DvtAxisInfo.prototype.IsOverlapping = function(labelDims, skippedLabels) {
  // If there are no labels, return
  if(!labelDims || labelDims.length <= 0)
    return false;

  var isVert = (this.Position == "left" || this.Position == "right");
  var gap = (isVert ? this.Options['layout']['verticalAxisGap'] : this.Options['layout']['horizontalAxisGap']);
  var isBIDI = DvtStyleUtils.isLocaleR2L();
  
  if (labelDims[0] == null)
    return false;
  
  var pointA1, pointA2, pointB1, pointB2;
  if (isVert) {
    pointA1 = labelDims[0].y;
    pointA2 = labelDims[0].y + labelDims[0].h;
  } else {
    pointA1 = labelDims[0].x;
    pointA2 = labelDims[0].x + labelDims[0].w;
  }

  for (var j=skippedLabels+1; j<labelDims.length; j+= skippedLabels+1) {
    if (labelDims[j] == null)
      continue;
    
    if (isVert) {
      pointB1 = labelDims[j].y;
      pointB2 = labelDims[j].y + labelDims[j].h;
      
      // Broken apart for clarity, next label may be above or below
      if(pointB1 >= pointA1 && pointB1 - gap < pointA2) // next label below
        return true;
      else if(pointB1 < pointA1 && pointB2 + gap > pointA1) // next label above
        return true;
    } 
    else {
      pointB1 = labelDims[j].x;
      pointB2 = labelDims[j].x + labelDims[j].w;
      
      // Broken apart for clarity, next label is on the right for non-BIDI, left for BIDI
      if(!isBIDI && (pointB1 - gap < pointA2))
        return true;
      else if(isBIDI && (pointB2 + gap > pointA1))
        return true;
    }
    
    // Otherwise start evaluating from label j
    pointA1 = pointB1 + gap;
    pointA2 = pointB2 - gap;
  }
  return false;
}

/**
 * Checks the labels for the axis and skips them as necessary.
 * @param {Array} labels An array of DvtText labels for the axis.
 * @param {Array} labelDims An array of DvtRectangle objects that describe the x, y, height, width of the axis labels.
 * @return {Array} The array of DvtText labels for the axis.
 * @protected
 */
DvtAxisInfo.prototype.SkipLabels = function(labels, labelDims) {
  var skippedLabels = 0;
  var bOverlaps = this.IsOverlapping(labelDims, skippedLabels);
  while (bOverlaps) {
    skippedLabels++;
    bOverlaps = this.IsOverlapping(labelDims, skippedLabels);
  }
  
  if (skippedLabels > 0) {
    var renderedLabels = [];
    for (var j=0; j<labels.length; j+= skippedLabels+1) {
      renderedLabels.push(labels[j]);
    }
    return renderedLabels;
  } else {
    return labels
  }
}

/**
 * Returns an array of DvtRectangle objects that describe the x, y, height, width of the axis labels.
 * @param {Array} labels An array of DvtText labels for the axis.
 * @return {Array} An array of DvtRectangle objects
 * @protected
 */
DvtAxisInfo.prototype.GetLabelDims = function(labels, container) {
  var labelDims = [];
  
  // Get the text dimensions
  for(var i=0; i<labels.length; i++) {
    var text = labels[i];
    if (text == null) {
      labelDims.push(null);
    } else {
      container.addChild(text);
      var dims = text.getDimensions(container);
      container.removeChild(text);
      labelDims.push(dims);
    }
  }
  
  return labelDims;
}

/**
 * Returns the number of major tick counts for the axis.
 * @return {number} The number of major tick counts.
 */
DvtAxisInfo.prototype.getMajorTickCount = function() {
   return null; // subclasses that allow major gridlines should implement
}

/**
 * Sets the number of major tick counts for the axis.
 * @param {number} count The number of major tick counts.
 */
DvtAxisInfo.prototype.setMajorTickCount = function(count) {
  // subclasses that allow major gridlines should implement
}

/**
 * Returns the number of minor tick counts for the axis.
 * @return {number} The number of minor tick counts.
 */
DvtAxisInfo.prototype.getMinorTickCount = function() {
   return null; // subclasses that allow minor gridlines should implement
}

/**
 * Sets the number of minor tick counts for the axis.
 * @param {number} count The number of minor tick counts.
 */
DvtAxisInfo.prototype.setMinorTickCount = function(count) {
  // subclasses that allow minor gridlines should implement
}

/**
 * Returns the major increment for the axis.
 * @return {number} The major increment.
 */
DvtAxisInfo.prototype.getMajorIncrement = function() {
   return null; // subclasses that allow major gridlines should implement
}

/**
 * Returns the minor increment for the axis.
 * @return {number} The minor increment.
 */
DvtAxisInfo.prototype.getMinorIncrement = function() {
   return null; // subclasses that allow minor gridlines should implement
}

/**
 * Calculated axis information and drawable creation for a data axis.
 * @param {object} data The object containing data for this component.
 * @param {object} options The object containing options specifications for this component.
 * @param {DvtRectangle} availSpace The available space.
 * @class
 * @constructor
 * @extends {DvtAxisInfo}
 */
var DvtDataAxisInfo = function(data, options, availSpace) {
  this.Init(data, options, availSpace);
}

DvtObj.createSubclass(DvtDataAxisInfo, DvtAxisInfo, "DvtDataAxisInfo");

DvtDataAxisInfo._MAX_NUMBER_OF_GRIDS_AUTO = 10;
DvtDataAxisInfo._MINOR_TICK_COUNT = 2;

/**
 * @override
 */
DvtDataAxisInfo.prototype.Init = function(data, options, availSpace) {
  DvtDataAxisInfo.superclass.Init.call(this, data, options, availSpace);

  // Figure out the coords for the min/max values
  if(this.Position == "top" || this.Position == "bottom") {
    // Axis is horizontal, so flip for BIDI if needed
    if(DvtStyleUtils.isLocaleR2L()) {
      this._minCoord = this.EndCoord;
      this._maxCoord = this.StartCoord;
    }
    else {
      this._minCoord = this.StartCoord;
      this._maxCoord = this.EndCoord;
    }
  }
  else {
    this._minCoord = this.EndCoord;
    this._maxCoord = this.StartCoord;
  }

  this._minValue = options['minValue'];
  this._maxValue = options['maxValue'];
  this._majorIncrement = options['majorIncrement'];
  this._minorIncrement = options['minorIncrement'];
  this._converter = null;
  if (options['tickLabel'] !== undefined) {
    this._converter = options['tickLabel']['converter'];
  }
  this._calcAxisExtents(data['minDataValue'], data['maxDataValue']);
}

/**
 * @override
 */
DvtDataAxisInfo.prototype.getLabels = function(context, levelIdx) {
  if (levelIdx && levelIdx > 0) // data axis has only one level
    return null;
    
  var labels = [];
  var labelDims = [];
  var container = context.getStage();
  
  // when scaling is set then init formatter
  if(this.Options.tickLabel && this.Options.tickLabel.scaling){
    this._axisValueFormatter = new DvtLinearScaleAxisValueFormatter(new DvtChartBundle(), this._minValue, this._maxValue, this._majorIncrement, this.Options.tickLabel.scaling, this.Options.tickLabel.autoPrecision);
  }
  
  // Iterate on an integer to reduce rounding error.  We use <= since the first
  // tick is not counted in the tick count.
  for(var i=0; i<=this._majorTickCount; i++) {
    var value = i*this._majorIncrement + this._minValue;
    var label = this._formatValue(value);
    var coord = this.getCoordAt(value);
    var text = this.CreateLabel(context, label, coord);
    labels.push(text);
  }
  
  labelDims = this.GetLabelDims(labels, container);
  return this.SkipLabels(labels, labelDims);
}

/**
 * @override
 */
DvtDataAxisInfo.prototype.getAxisLine = function(context) {
  var axisLineOptions = this.Options['axisLine'];
  if(axisLineOptions['rendered']) {
    // TODO hzhang Check Axis Line behavior for negative/mixed axes.
    var axisLineStroke = new DvtSolidStroke(axisLineOptions['lineColor'], 1, axisLineOptions['lineWidth']);
    return this.CreateGridLine(context, axisLineStroke, 10);
  }
  else 
    return null;
}

/**
 * @override
 */
DvtDataAxisInfo.prototype.getGridLines = function(context) {
  var gridlines = [];
  
  // Major and Minor Ticks
  var coord, line;
  var majorTickOptions = this.Options['majorTick'];
  var majorTickStroke = new DvtSolidStroke(majorTickOptions['lineColor'], 1, majorTickOptions['lineWidth']);
  var minorTickOptions = this.Options['minorTick'];
  var minorTickStroke = new DvtSolidStroke(minorTickOptions['lineColor'], 1, minorTickOptions['lineWidth']);
  
  // Iterate on an integer to reduce rounding error.  We use <= since the first
  // tick is not counted in the tick count.
  for(var i=0; i<=this._majorTickCount; i++) {
    var value = i*this._majorIncrement + this._minValue;
    
    // Minor Ticks
    if(minorTickOptions['rendered']) {
      for (var j=1; j<this._minorTickCount; j++) {
        var minorValue = value+(j*this._minorIncrement);
        if(minorValue > this._maxValue)
          break;
        
        coord = this.getCoordAt(minorValue);
        line = this.CreateGridLine(context, minorTickStroke, coord);
        gridlines.push(line);
      }  
    }
  
    // Major Ticks
    if(majorTickOptions['rendered'] !== false) {
      coord = this.getCoordAt(value);
      line = this.CreateGridLine(context, majorTickStroke, coord);
      gridlines.push(line);
    }
  }
  
  return gridlines;
}

/**
 * @override
 */
DvtDataAxisInfo.prototype.getValueAt = function(coord) {
  // Return null if the coord is outside of the axis
  if(coord < this._minCoord || coord > this._maxCoord)
    return null;
  
  // Otherwise find the value
  var ratio = (coord - this._minCoord)/(this._maxCoord - this._minCoord);
  return this._minValue + (ratio * (this._maxValue - this._minValue));
}

/**
 * @override
 */
DvtDataAxisInfo.prototype.getCoordAt = function(value) {
  // Return null if the value is outside of the axis
  if(value < this._minValue || value > this._maxValue)
    return null;

  return this.getUnboundedCoordAt(value);
}

/**
 * @override
 */
DvtDataAxisInfo.prototype.getBoundedValueAt = function(coord) {
  if(coord < this._minCoord)
    coord = this._minCoord;
  else if(coord > this._maxCoord)
    coord = this._maxCoord;

  return this.getValueAt(coord);
}

/**
 * @override
 */
DvtDataAxisInfo.prototype.getBoundedCoordAt = function(value) {
  if(value < this._minValue)
    value = this._minValue;
  else if(value > this._maxValue)
    value = this._maxValue;

  return this.getUnboundedCoordAt(value);
}

// TODO impl getUnboundedValueAt

/**
 * @override
 */
DvtDataAxisInfo.prototype.getUnboundedCoordAt = function(value) {
  var ratio = (value - this._minValue)/(this._maxValue - this._minValue);
  return this._minCoord + (ratio * (this._maxCoord - this._minCoord));
}

/**
 * @override
 */
DvtDataAxisInfo.prototype.getBaselineCoord = function() {
  // First find the value of the baseline
  var baseline = 0;
  if(this._maxValue < 0)
    baseline = this._maxValue;
  else if(this._minValue > 0)
    baseline = this._minValue;
    
  // Return its coordinate
  return this.getCoordAt(baseline);
}

/**
 * @private
 */
DvtDataAxisInfo.prototype._formatValue = function(value) {

  if (this._converter && this._converter.getAsString && this._converter.getAsObject) {
    return this._converter.getAsString(value);
  } else if (this._axisValueFormatter) {
    return this._axisValueFormatter.format(value);   
  } else {
    // set the # of decimals of the value to the # of decimals of the major increment
    var t = Math.log(this._majorIncrement) / Math.log(10);
    var decimals = Math.max(Math.ceil(-t), 0);
    return value.toFixed(decimals);
  }
}

/**
 * Determines the number of major and minor tick counts and increments for the axis if values were not given.
 * The default minor tick count is 2.
 * @param {number} scaleUnit The scale unit of the axis.
 * @private
 */
DvtDataAxisInfo.prototype._calcMajorMinorIncr = function(scaleUnit) {
  this._majorIncrement = this._majorIncrement ? this._majorIncrement : scaleUnit;
  this._majorTickCount = (this._maxValue - this._minValue)/this._majorIncrement;
  if (this._minorIncrement != null && this._majorIncrement/this._minorIncrement >= 2) {
    this._minorTickCount = this._majorIncrement/this._minorIncrement;
  } else {
    this._minorTickCount = DvtDataAxisInfo._MINOR_TICK_COUNT;
    this._minorIncrement = this._majorIncrement/this._minorTickCount;
  }
}

/**
 * Determines the axis extents based on given start and end value
 * or calculated from the min and max data values of the chart.
 * @param {number} minDataValue The minimum data value of the chart.
 * @param {number} maxDataValue The maximum data value of the chart.
 * @private
 */
DvtDataAxisInfo.prototype._calcAxisExtents = function(minDataValue, maxDataValue) {
  var maxValueToExtend = maxDataValue;
  
  // Include 0 in the axis if we're scaling from the baseline
  if(this.Options['scaledFromBaseline'] == "on") {
    minDataValue = Math.min(0, minDataValue);
    maxDataValue = Math.max(0, maxDataValue);
  }
  
  var scaleUnit = this._calcAxisScale((this._minValue !== null && !isNaN(this._minValue) ? this._minValue : minDataValue), 
                                      (this._maxValue !== null && !isNaN(this._maxValue) ? this._maxValue : maxDataValue));
                                      
  if(this._maxValue == null && this._minValue == null) {
    this._minValue = Math.floor(minDataValue/scaleUnit) * scaleUnit;
    while (this._minValue > minDataValue) 
      this._minValue -= scaleUnit;
    
    this._maxValue = this._minValue;
    while (this._maxValue <= maxValueToExtend || this._maxValue < 0)
      this._maxValue += scaleUnit;
  }
  else if (this._minValue == null) {
    this._minValue = this._maxValue;
    while (this._minValue > minDataValue) 
      this._minValue -= scaleUnit;
  } 
  else if (this._maxValue == null) {
    this._maxValue = this._minValue;
    while (this._maxValue <= maxValueToExtend || this._maxValue < 0)
      this._maxValue += scaleUnit;
  }
  
  if (isNaN(this._maxValue) && isNaN(this._minValue)) {
    this._maxValue = 100;
    this._minValue = 0;
    scaleUnit = (this._maxValue - this._minValue) / DvtDataAxisInfo._MAX_NUMBER_OF_GRIDS_AUTO;
  }
  
  // Calculate major and minor gridlines
  this._calcMajorMinorIncr(scaleUnit);
}

/**
 * Determines the scale unit of the axis based on a given start and end axis extent.
 * @param {number} min The start data value for the axis.
 * @param {number} max The end data value for the axis.
 * @return {number} The scale unit of the axis.
 * @private
 */
DvtDataAxisInfo.prototype._calcAxisScale = function(min, max) {
	var spread =  max - min;
	var t = Math.log(spread)/Math.log(10);
	var testVal = 0;
	
	if (t - Math.round(t) == 0)
		testVal = Math.pow(10,t - 2);
	else 
		testVal = Math.pow(10, Math.floor(t) - 1);
		
	var first2Digits = Math.round(spread/testVal);
	
	// Aesthetically choose a scaling factor limiting to a max number of steps 
	var scaleFactor = 1;
	if (first2Digits >= 10 && first2Digits <= 14)
		scaleFactor = 2;
	else if (first2Digits >= 15 && first2Digits <= 19)
		scaleFactor = 3;
	else if (first2Digits >= 20 && first2Digits <= 24)
		scaleFactor = 4;
	else if (first2Digits >= 25 && first2Digits <= 45)
		scaleFactor = 5;
	else if (first2Digits >= 46 && first2Digits <= 80)
		scaleFactor = 10;
	else if (first2Digits >= 81 && first2Digits <= 99)
		scaleFactor = 15; 
	else if (first2Digits == 100)
		scaleFactor = 20;
	else if (first2Digits > 100) {
		// Limit large scale to MAX_NUMBER_OF_GRIDS for step 
		if (testVal > 0)
			scaleFactor = Math.round(spread / DvtDataAxisInfo._MAX_NUMBER_OF_GRIDS_AUTO / testVal);
		else
			scaleFactor = Math.round(spread / DvtDataAxisInfo._MAX_NUMBER_OF_GRIDS_AUTO / 64);
	}
	
	//Adjust based on length of axis
	var scaleUnit;
	var axisLengthRel = (this.EndCoord-this.StartCoord)/100;
	if (axisLengthRel < 1.0) {
		var temp = scaleFactor;
		temp /= axisLengthRel;
		
		while (temp >= 20.0) {
			temp /= 10;
			testVal *= 10;
		}
		
		if (temp < 20.0 && temp > 10.0)
			scaleFactor = 20;
		else if (temp > 5.0)
			scaleFactor = 10;
		else if (temp > 4.0)
			scaleFactor = 5;
		else if (temp > 2.0)
			scaleFactor = 4;
		else
			scaleFactor = 2;
	}
	scaleUnit = scaleFactor * testVal;
	
	return scaleUnit;
}

/**
 * @override
 */
DvtDataAxisInfo.prototype.getMajorTickCount = function() {
   return this._majorTickCount;
}

/**
 * @override
 */
DvtDataAxisInfo.prototype.setMajorTickCount = function(count) {
  this._majorTickCount = count;
  this._majorIncrement = (this._maxValue - this._minValue)/this._majorTickCount;
}

/**
 * @override
 */
DvtDataAxisInfo.prototype.getMinorTickCount = function() {
   return this._minorTickCount;
}

/**
 * @override
 */
DvtDataAxisInfo.prototype.setMinorTickCount = function(count) {
   this._minorTickCount = count;
   this._minorIncrement = this._majorIncrement/this._minorTickCount;
}

/**
 * @override
 */
DvtDataAxisInfo.prototype.getMajorIncrement = function() {
   return this._majorIncrement;
}

/**
 * @override
 */
DvtDataAxisInfo.prototype.getMinorIncrement = function() {
   return this._minorIncrement;
}

/**
 * Calculated axis information and drawable creation for a group axis.
 * @param {object} data The object containing data for this component.
 * @param {object} options The object containing options specifications for this component.
 * @param {DvtRectangle} availSpace The available space.
 * @class
 * @constructor
 * @extends {DvtAxisInfo}
 */
var DvtGroupAxisInfo = function(data, options, availSpace) {
  this.Init(data, options, availSpace);
}

DvtObj.createSubclass(DvtGroupAxisInfo, DvtAxisInfo, "DvtGroupAxisInfo");

/**
 * @override
 */
DvtGroupAxisInfo.prototype.Init = function(data, options, availSpace) {
  DvtGroupAxisInfo.superclass.Init.call(this, data, options, availSpace);

  // Flip horizontal axes for BIDI
  if((this.Position == "top" || this.Position == "bottom") && DvtStyleUtils.isLocaleR2L()) {
    var temp = this.StartCoord;
    this.StartCoord = this.EndCoord;
    this.EndCoord = temp;
  }

  // Cache the groups
  this._groups = data['groups'];
  
  // Calculate the increment and add offsets if specified
  var endOffset = (options['endGroupOffset'] > 0) ? Number(options['endGroupOffset']) : 0;
  this._startOffset = (options['startGroupOffset'] > 0) ? Number(options['startGroupOffset']) : 0;
  this._incr = (this.EndCoord - this.StartCoord)/(this._startOffset + endOffset + this._groups.length - 1);
  
  this._isLabelRotated = false;
}

/**
 * Rotates the labels of the horizontal axis by 90 degrees.
 * @param {Array} labels An array of DvtText labels for the axis.
 * @return {Array} The array of DvtText labels for the axis.
 * @private
 */
DvtGroupAxisInfo.prototype._rotateLabels = function(labels) {
  var text;
  var x;  
  var isBIDI = DvtStyleUtils.isLocaleR2L();
  
  this._isLabelRotated = true;
  
  for(var i=0; i<labels.length; i++) {
    text = labels[i];
    x = text.getX();
    text.setX(0);
    text.setY(0);
    if (isBIDI) {
      text.setRotation(Math.PI/2);
    } else {
      text.setRotation(3*Math.PI/2);
    }  
    text.setTranslateX(x);
  }
}

/**
 * @override
 */
DvtGroupAxisInfo.prototype.isLabelRotated = function() {
  return this._isLabelRotated;
}


/**
 * @override
 */
DvtGroupAxisInfo.prototype.getLabels = function(context, levelIdx) {
  if (levelIdx && levelIdx > 0) // group axis has only one level
    return null;
    
  var labels = [];
  var labelDims = [];
  var container = context.getStage();
  
  // Iterate and create the labels
  var numLabels = this._groups.length;
  for(var i=0; i<numLabels; i++) {
    // Get the label from the group
    var label = this._groups[i];
    if(label && label.name)
      label = label.name;
    
    // Create and position the label
    var coord = this.getCoordAt(i);
    var text = this.CreateLabel(context, label, coord);
    labels.push(text);
  }
  
  labelDims = this.GetLabelDims(labels, container);
  
  if (this.Position == "top" || this.Position == "bottom") {
    if (this.Options.tickLabel.rotation == "auto" && this.IsOverlapping(labelDims, 0)) { //BIDI
      this._rotateLabels(labels);
      labelDims = this.GetLabelDims(labels, container);
    }
  }
  
  return this.SkipLabels(labels, labelDims);
}

/**
 * @override
 */
DvtGroupAxisInfo.prototype.getAxisLine = function(context) {
  var axisLineOptions = this.Options['axisLine'];
  if(axisLineOptions['rendered']) {
    // Create and return the axis line
    var axisLineStroke = new DvtSolidStroke(axisLineOptions['lineColor'], 1, axisLineOptions['lineWidth']);
    return this.CreateGridLine(context, axisLineStroke);
  }
  else
    return null;
}

/**
 * @override
 */
DvtGroupAxisInfo.prototype.getGridLines = function(context) {
  var gridlines = [];
  
  // Major Ticks
  var coord, line;
  var majorTickOptions = this.Options['majorTick'];
  var majorTickStroke = new DvtSolidStroke(majorTickOptions['lineColor'], 1, majorTickOptions['lineWidth']);
  if(majorTickOptions['rendered'] === true) {
    var numGroups = this._groups.length;
    for(var i=0; i<numGroups; i++) {
      coord = this.getCoordAt(i);
      line = this.CreateGridLine(context, majorTickStroke, coord);
      gridlines.push(line);
    }
  }
  
  return gridlines;
}

/**
 * Returns the index for the closest group along the axis.  Returns null if the coordinate
 * is not within the axis.
 * @param {number} coord The coordinate along the axis.
 * @return {number} The index of the closest group.
 */
DvtGroupAxisInfo.prototype.getValueAt = function(coord) {
  var relCoord = coord - this.StartCoord - this._incr*this._startOffset;
  var numIncrements = relCoord/this._incr;
  return Math.round(numIncrements);
}

/**
 * Returns the coordinate for the specified group.
 * @param {object} index The index of the requested group.
 * @return {number} The coordinate for the group.
 */
DvtGroupAxisInfo.prototype.getCoordAt = function(value) {
  if(value < 0)
    return null;
  else
    return this.StartCoord + (this._incr * (this._startOffset + value));
}

/**
 * Returns the index for the closest group along the axis.
 * @param {number} coord The coordinate along the axis.
 * @return {number} The index of the closest group.
 */
DvtGroupAxisInfo.prototype.getBoundedValueAt = function(coord) {
  return null; // TODO Implement
}

/**
 * Returns the coordinate for the specified group.
 * @param {object} index The index of the requested group.
 * @return {number} The coordinate for the group.
 */
DvtGroupAxisInfo.prototype.getBoundedCoordAt = function(value) {
  return null; // TODO Implement
}

/**
 * Returns the coordinate for the specified group.
 * @param {object} index The index of the requested group.
 * @return {number} The coordinate for the group.
 */
DvtGroupAxisInfo.prototype.getUnboundedCoordAt = function(value) {
  return null; // TODO Implement
}
/**
 * Formatter for an axis with a linear scale.
 * Following cases can occur:
 * 1. scaling is set to none:
 *    No scaling is used in this case.
 * 2. scaling is set to auto, null or undefined:
 *    Scaling is computed. The nearest (less or equal) known scale is used. Regarding fraction part, if autoPrecision equals "on" then the count of significant decimal places 
 *    is based on tickStep otherwise fraction part is not formatted.
 * 3. otherwise
 *    Defined scaling is used. 
 *    Examples (autoPrecision = "on"): 
 *    minValue = 0, maxValue=10000, tickStep=1000, scale="thousand" -> formatted axis values: 0K , ..., 10K
 *    minValue = 0, maxValue=100, tickStep=10, scale="thousand" -> formatted axis values: 0.00K, 0.01K, ..., 0.10K
 *
 * @param {object} bundle translations bundle
 * @param {number} minValue the minimum value on the axis
 * @param {number} maxValue the maximum value on the axis
 * @param {number} tickStep the tick step between values on the axis
 * @param {string} scale the scale of values on the axis; if null or undefined then auto scaling is used.
 * @param {string} autoPrecision "on" if auto precision should be applied otherwise "off"; if null or undefined then auto precision is applied.
 * @constructor
 */
var DvtLinearScaleAxisValueFormatter = function (bundle, minValue, maxValue, tickStep, scale, autoPrecision) {
  DvtAbstractAxisValueFormatter.call(this, bundle);
  this.Init(minValue, maxValue, tickStep, scale, autoPrecision);
};

DvtObj.createSubclass(DvtLinearScaleAxisValueFormatter, DvtAbstractAxisValueFormatter, "DvtLinearScaleAxisValueFormatter");

/**
 * Allowed scales that can be used as formatter scale param values
 */
DvtLinearScaleAxisValueFormatter.SCALE_NONE = "none";
DvtLinearScaleAxisValueFormatter.SCALE_AUTO = "auto";
DvtLinearScaleAxisValueFormatter.SCALE_THOUSAND = "thousand";
DvtLinearScaleAxisValueFormatter.SCALE_MILLION = "million";
DvtLinearScaleAxisValueFormatter.SCALE_BILLION = "billion";
DvtLinearScaleAxisValueFormatter.SCALE_TRILLION = "trillion";
DvtLinearScaleAxisValueFormatter.SCALE_QUADRILLION = "quadrillion";

/**
 * The scaling factor difference between successive scale values
 */
DvtLinearScaleAxisValueFormatter.SCALING_FACTOR_DIFFERENCE = 3;

/**
 * Initializes the instance.
 */
DvtLinearScaleAxisValueFormatter.prototype.Init = function (minValue, maxValue, tickStep, scale, autoPrecision) {
  // array of successive scale values
  this._scales = {
  };
  // array of scale values ordered by scale factor asc
  this._scalesOrder = [];
  // mapping of scale factors to corresponding scale objects
  this._factorToScaleMapping = {
  };

  this.InitScales();
  this.InitFormatter(minValue, maxValue, tickStep, scale, autoPrecision)
};

/**
 * Initializes scale objects.
 * @protected
 *
 */
DvtLinearScaleAxisValueFormatter.prototype.InitScales = function () {
  /**
   * Creates scale object and refreshes formatter properties using it.
   * @param {string} scaleName one of allowed scale names (e.g. DvtLinearScaleAxisValueFormatter.SCALE_THOUSAND)
   * @param {number} scaleFactor scale factor of corresponding scale, i.e. 'x' such that 10^x represents corresponding scale (e.g. for scale DvtLinearScaleAxisValueFormatter.SCALE_THOUSAND x = 3)
   * @param {string} scaleBundleSuffix translation key which value (translated) represents given scale (e.g. for DvtLinearScaleAxisValueFormatter.SCALE_THOUSAND an translated english suffix is 'K')
   */
  var createScale = function (scaleName, scaleFactor, scaleBundleSuffix) {
    var suffix;
    if (this.GetBundle()) {
      if (scaleBundleSuffix) {
        // when bundle and bundle suffix is defined then init suffix
            suffix = this.GetBundle().getRBString(this.GetBundle()[scaleBundleSuffix], null, "DvtChartBundle." + scaleBundleSuffix);
      }
    }

    var scale = {
      scaleFactor : scaleFactor, localizedSuffix : suffix
    }

    // update private properties
    this._scales[scaleName] = scale;
    this._scalesOrder.push(scale);
    this._factorToScaleMapping[scaleFactor] = scale;
  };

  var diff = DvtLinearScaleAxisValueFormatter.SCALING_FACTOR_DIFFERENCE;

  createScale.call(this, DvtLinearScaleAxisValueFormatter.SCALE_NONE, 0 * diff);
  createScale.call(this, DvtLinearScaleAxisValueFormatter.SCALE_THOUSAND, 1 * diff, "SCALING_SUFFIX_THOUSAND");
  createScale.call(this, DvtLinearScaleAxisValueFormatter.SCALE_MILLION, 2 * diff, "SCALING_SUFFIX_MILLION");
  createScale.call(this, DvtLinearScaleAxisValueFormatter.SCALE_BILLION, 3 * diff, "SCALING_SUFFIX_BILLION");
  createScale.call(this, DvtLinearScaleAxisValueFormatter.SCALE_TRILLION, 4 * diff, "SCALING_SUFFIX_TRILLION");
  createScale.call(this, DvtLinearScaleAxisValueFormatter.SCALE_QUADRILLION, 5 * diff, "SCALING_SUFFIX_QUADRILLION");

  // sort _scalesOrder array
  this._scalesOrder.sort(function (scale1, scale2) {
    if (scale1.scaleFactor < scale2.scaleFactor) {
      return  - 1;
    }
    else if (scale1.scaleFactor > scale2.scaleFactor) {
      return 1;
    }
    else {
      return 0;
    }
  });
};

/**
 * Initializes properties used for values formatting (e.g. scale factor that should be applied etc.).
 *
 * @param {number} minValue the minimum value on the axis
 * @param {number} maxValue the maximum value on the axis
 * @param {number} tickStep the tick step between values on the axis
 * @param {string} scale the scale of values on the axis
 * @param {boolean} autoPrecision true if auto precision should be applied otherwise false
 * @protected
 *
 */
DvtLinearScaleAxisValueFormatter.prototype.InitFormatter = function (minValue, maxValue, tickStep, scale, autoPrecision) {
  var findScale = false, decimalPlaces, scaleFactor, useAutoPrecision = false;

  // if autoPrecision doesn't equal "off" (i.e. is "on", null, undefined) then auto precision should be used.
  if(!(autoPrecision === "off")){
    useAutoPrecision = true;
  } 
  // try to use scale given by "scale" param and if no scale factor is found find appropriate scale
  scaleFactor = this._getScaleFactor(scale);
  if ((typeof scaleFactor) !== "number") {
    findScale = true;
  }

  // base a default scale factor calculation on the order of
  // magnitude (power of ten) of the maximum absolute value on the axis
  if (findScale) {
    // get the axis endpoint with the largest absolute value,
    // and find its base 10 exponent
    var absMax = Math.max(Math.abs(minValue), Math.abs(maxValue));

    var power = this._getPowerOfTen(absMax);
    scaleFactor = this._findNearestLEScaleFactor(power);
  }

  if(useAutoPrecision === true){
    // get the number of decimal places in the number by subtracting
    // the order of magnitude of the tick step from the order of magnitude
    // of the scale factor
    // (e.g.: scale to K, tick step of 50 -> 2 decimal places)
    var tickStepPowerOfTen = this._getPowerOfTen(tickStep);
    decimalPlaces = scaleFactor - tickStepPowerOfTen;
    decimalPlaces = (decimalPlaces >= 0) ? decimalPlaces : 0;
  }

  // init private properties with computed values
  this._useAutoPrecision = useAutoPrecision;
  this._scaleFactor = scaleFactor;
  this._decimalPlaces = decimalPlaces;
};

/**
 * Finds a scale factor 'x' such that x <= value (e.g. if value equals 4 then returned scale factor equals 3)
 * @param {number} value value representing an order of magnitude
 * @return {number} a scale factor 'x' such that x <= value
 * @private
 */
DvtLinearScaleAxisValueFormatter.prototype._findNearestLEScaleFactor = function (value) {
  var scaleFactor = 0;

  if (value <= this._scalesOrder[0].scaleFactor) {
    // if the number is less than 10, don't scale
    scaleFactor = this._scalesOrder[0].scaleFactor;
  }
  else if (value >= this._scalesOrder[this._scalesOrder.length - 1].scaleFactor) {
    // if the data is greater than or equal to 10 quadrillion, scale to quadrillions
    scaleFactor = this._scalesOrder[this._scalesOrder.length - 1].scaleFactor;
  }
  else {
    // else find the nearest scaleFactor such that scaleFactor <= value
    var end = this._scalesOrder.length - 1;
    for (var i = end;i >= 0;i--) {
      if (this._scalesOrder[i].scaleFactor <= value) {
        scaleFactor = this._scalesOrder[i].scaleFactor;
        break;
      }
    }
  }
  return scaleFactor;
};

/**
 * Returns scale factor of scale given by scale name.
 * @return scale factor of scale given by scale name
 * @private
 */
DvtLinearScaleAxisValueFormatter.prototype._getScaleFactor = function (scaleName) {
  var scaleFactor, scale = this._scales[scaleName];
  if (scale) {
    scaleFactor = scale.scaleFactor;
  }
  return scaleFactor;
};

/**
 * Formats given value using previously computed scale factor and decimal digits count. In case that parsed value equals NaN an unformatted value is returned.
 * @override
 * @param {object} value to be formatted.
 * @return {string} formatted value as string
 */
DvtLinearScaleAxisValueFormatter.prototype.format = function (value) {
  var parsed = parseFloat(value),
  i;
  if (!isNaN(parsed)) {
    var prefix;
    var suffix;
    if (this._scaleFactor > 0) {
      for (i = 0;i < this._scaleFactor;i++) {
        parsed /= 10;
      }
      suffix = this._factorToScaleMapping[this._scaleFactor].localizedSuffix;
    }
    if (this._useAutoPrecision) {
      parsed = parseFloat(new Number(parsed).toFixed(this._decimalPlaces));
      parsed = this._formatFraction(parsed);
    }

    if (typeof suffix === "string") {
      parsed += suffix;
    }
    return parsed;
  }
  else {
    return value;
  }
};

/**
 * Formats fraction part of given value (adds zeroes if needed).
 * @param {number} number to be formatted
 * @return {string} number with fraction part formatted as string
 * @private
 */
DvtLinearScaleAxisValueFormatter.prototype._formatFraction = function (value) {
  var formatted = "" + value;
  if (this._decimalPlaces > 0) {
    if (formatted.indexOf(".") ==  - 1) {
      formatted += ".";
    }
    var existingPlacesCount = formatted.substring(formatted.indexOf(".") + 1).length;

    while (existingPlacesCount < this._decimalPlaces) {
      formatted += "0";
      existingPlacesCount++;
    }
  }
  return formatted;
};

/**
 * Fro given value it returns its order of magnitude.
 * @param {number} value for which order of magnitude should be found
 * @return {number} order of magnitude for given value
 * @private
 */
DvtLinearScaleAxisValueFormatter.prototype._getPowerOfTen = function (value) {
  // more comprehensive and easier than working with value returned by Math.log(value)/Math.log(10)
  value = (value >= 0) ? value :  - value;
  var power = 0;

  // Check for degenerate and zero values
  if (value < 1E-15) {
    return 0;
  }
  else if (value == Number.POSITIVE_INFINITY) {
    return Number.MAX_VALUE;
  }

  if (value >= 10) {
    // e.g. for 1000 the power should be 3
    while (value >= 10) {
      power += 1;
      value /= 10;
    }
  }
  else if (value < 1) {
    while (value < 1) {
      power -= 1;
      value *= 10;
    }
  }
  return power;
};
/**
 * Calculated axis information and drawable creation for a time axis.
 * @param {object} data The object containing data for this component.
 * @param {object} options The object containing options specifications for this component.
 * @param {DvtRectangle} availSpace The available space.
 * @class
 * @constructor
 * @extends {DvtAxisInfo}
 */
var DvtTimeAxisInfo = function(data, options, availSpace) {
  this.Init(data, options, availSpace);
}

DvtObj.createSubclass(DvtTimeAxisInfo, DvtAxisInfo, "DvtTimeAxisInfo");

// ------------------------
// Constants
//
DvtTimeAxisInfo.TIME_SECOND      = 1000;
DvtTimeAxisInfo.TIME_MINUTE      = 60 * DvtTimeAxisInfo.TIME_SECOND;
DvtTimeAxisInfo.TIME_HOUR        = 60 * DvtTimeAxisInfo.TIME_MINUTE;
DvtTimeAxisInfo.TIME_DAY         = 24 * DvtTimeAxisInfo.TIME_HOUR;
DvtTimeAxisInfo.TIME_MONTH_MIN   = 28 * DvtTimeAxisInfo.TIME_DAY; // minimum # of days in a month
DvtTimeAxisInfo.TIME_MONTH       = (365/12) * DvtTimeAxisInfo.TIME_DAY;  // approx.
DvtTimeAxisInfo.TIME_YEAR        = 365 * DvtTimeAxisInfo.TIME_DAY;

DvtTimeAxisInfo.INTERVAL_MILLISECONDS = 0;
DvtTimeAxisInfo.INTERVAL_SECONDS      = 1;
DvtTimeAxisInfo.INTERVAL_MINUTE       = 2;
DvtTimeAxisInfo.INTERVAL_HOUR         = 3;
DvtTimeAxisInfo.INTERVAL_DAY          = 4;
DvtTimeAxisInfo.INTERVAL_MONTH        = 5;
DvtTimeAxisInfo.INTERVAL_YEAR         = 6;

DvtTimeAxisInfo.AM_INDEX                 = 12;
DvtTimeAxisInfo.PM_INDEX                 = 13;
DvtTimeAxisInfo.AMPM_BEFORE_INDEX        = 14;
DvtTimeAxisInfo.DMY_ORDER_INDEX          = 15;
DvtTimeAxisInfo.YEAR_TRAILING_CHAR_INDEX = 16;
DvtTimeAxisInfo.DAY_TRAILING_CHAR_INDEX  = 17;

/**
 * @override
 */
DvtTimeAxisInfo.prototype.Init = function(data, options, availSpace) {
  DvtTimeAxisInfo.superclass.Init.call(this, data, options, availSpace);

  var startGroupOffset = isNaN(options["startGroupOffset"]) ? 0 : options["startGroupOffset"];
  var endGroupOffset = isNaN(options["endGroupOffset"]) ? 0 : options["endGroupOffset"];
 
  // Flip horizontal axes for BIDI
  // Figure out the coords for the min/max values
  if(this.Position == "top" || this.Position == "bottom") {
    // Axis is horizontal, so flip for BIDI if needed
    if(DvtStyleUtils.isLocaleR2L()) {
      this._minCoord = this.EndCoord - endGroupOffset;
      this._maxCoord = this.StartCoord + startGroupOffset;
    }
    else {
      this._minCoord = this.StartCoord + startGroupOffset;
      this._maxCoord = this.EndCoord - endGroupOffset;
    }
  }
  else {
    this._minCoord = this.EndCoord - endGroupOffset;
    this._maxCoord = this.StartCoord + startGroupOffset;
  }
  this._minValue = data['minDataValue'];
  this._maxValue = data['maxDataValue'];

  this._converter = null;
  if (options['tickLabel'] !== undefined) {
    this._converter = options['tickLabel']['converter'];
  }
  
  this._groups = data['groups'];
  this._numGroups = data['groups'].length;
  
  this._timeZoneOffset = 0;
  this._timeRange = this._maxValue - this._minValue;
  this._averageInterval = this._numGroups > 0 ? this._timeRange / (this._numGroups - 1) : 0;
  
  this._level1Labels = null;
  this._level2Labels = null;
}

/**
 * Formats the label given an axis value (used for generating tooltips).
 * @param {Number} axisValue The axis value (in milliseconds)
 * @return {String} A formatted axis label
 */
DvtTimeAxisInfo.prototype.formatLabel = function(axisValue) {
    var date = new Date(axisValue + this._timeZoneOffset); 
    var twoLabels = this._formatAxisLabel(date, null);
    if (twoLabels[1] != null)
      return twoLabels[0] + " " + twoLabels[1];
    else
      return twoLabels[0];
}

/**
 * Formats the level 1 and level 2 axis labels
 * @param {Date} date The current date
 * @param {Date} prevDate The date of the previous set of labels
 * @return {Array} An array [level1Label, level2Label]
 * @private
 */
DvtTimeAxisInfo.prototype._formatAxisLabel = function(date, prevDate) {
    var label1 = null; // level 1 label
    var label2 = null; // level 2 label
    
    // If dateTimeFormatter is used, use it
    if (this._converter && this._converter.getAsString && this._converter.getAsObject) {
        label1 = this._converter.getAsString(date);
    }
    
    else if(this._averageInterval >= DvtTimeAxisInfo.TIME_YEAR) {
        label1 = this._formatDate(date, false, false, true); // Year
    }
    
    else if (this._timeRange >= DvtTimeAxisInfo.TIME_YEAR || this._averageInterval >= DvtTimeAxisInfo.TIME_MONTH_MIN) {
        if (prevDate == null || prevDate.getMonth() != date.getMonth())
          label1 = this._formatDate(date, false, true, false); // Month
        
        if (prevDate == null || prevDate.getYear() != date.getYear())
          label2 = this._formatDate(date, false, false, true); // Year
    }
    
    else if (this._timeRange >= DvtTimeAxisInfo.TIME_MONTH_MIN || this._averageInterval >= DvtTimeAxisInfo.TIME_DAY) {
        if (prevDate == null || prevDate.getDate() != date.getDate())
          label1 = this._formatDate(date, true, false, false); // Day
        
        if (prevDate == null || prevDate.getYear() != date.getYear())
          label2 = this._formatDate(date, false, true, true); // Year, Month
        else if (prevDate.getMonth() != date.getMonth())
          label2 = this._formatDate(date, false, true, false); // Month
    }
    
    else if (this._timeRange >= DvtTimeAxisInfo.TIME_HOUR || this._averageInterval >= DvtTimeAxisInfo.TIME_MINUTE) {
        if (prevDate == null || (prevDate.getHours() != date.getHours() || prevDate.getMinutes() != date.getMinutes()))
          label1 = this._formatTime(date, false);  // HH:MM
        
        if (prevDate == null || prevDate.getMonth() != date.getMonth())
          label2 = this._formatDate(date, true, true, false); // Month, Day
        else if (prevDate.getDate() != date.getDate()) {
          if (this.Position == 'left' || this.Position == 'right')
            label2 = this._formatDate(date, true, true, false); // Month, Day
          else
            label2 = this._formatDate(date, true, false , false); // Day
        }
    }
    
    else {
        if (prevDate == null || prevDate.getSeconds() != date.getSeconds())
          label1 = this._formatTime(date, true); // HH:MM:SS
        
        if (prevDate == null || prevDate.getMonth() != date.getMonth())
          label2 = this._formatDate(date, true, true, false); // Month, Day
        else if (prevDate.getDate() != date.getDate()) {
          if (this.Position == 'left' || this.Position == 'right')
            label2 = this._formatDate(date, true, true, false); // Month, Day
          else
            label2 = this._formatDate(date, true, false , false); // Day
        }
    }
    
    return [label1, label2];
}


/**
 * Returns the date as a DMY string
 * @param {Date} date The date
 * @param {boolean} showDay Whether the day is shown
 * @param {boolean} showMonth Whether the month is shown
 * @param {boolean} showYear Whether the year is shown
 * @return {string} The formatted string
 * @private
 */
DvtTimeAxisInfo.prototype._formatDate = function(date, showDay, showMonth, showYear) { 
    var yearStr = date.getFullYear();
    var monthStr;
    if(this._timeAxisResources && this._timeAxisResources.length >= 12)
        monthStr = this._timeAxisResources[date.getMonth()];
    else 
        monthStr = date.toString().split(" ")[1]; // date.toString() returns "Day Mon Date HH:MM:SS TZD YYYY"
    var dayStr = date.getDate();
    
    // Add the day and year trailing characters if needed
    if(this._timeAxisResources && this._timeAxisResources.length > DvtTimeAxisInfo.DAY_TRAILING_CHAR_INDEX) {
        var yearChar = this._timeAxisResources[DvtTimeAxisInfo.YEAR_TRAILING_CHAR_INDEX];
        var dayChar = this._timeAxisResources[DvtTimeAxisInfo.DAY_TRAILING_CHAR_INDEX];
        // These will be "" if not needed
        yearStr += yearChar;
        dayStr += dayChar; 
    }

    // Process the DMY Order
    var dmyOrder = "DMY";
    if(this._timeAxisResources && this._timeAxisResources.length > DvtTimeAxisInfo.DMY_ORDER_INDEX) {
        dmyOrder = this._timeAxisResources[DvtTimeAxisInfo.DMY_ORDER_INDEX];
    }
    
    var dateStr = "";
    
    for (var i = 0; i < dmyOrder.length; i++) {
        if (showDay && dmyOrder[i] == 'D') {
            dateStr += dayStr + " ";
        } else if (showMonth && dmyOrder[i] == 'M') {
            dateStr += monthStr  + " ";
        } else if (showYear && dmyOrder[i] == 'Y') {
            dateStr += yearStr  + " ";
        }
    }
    
    return dateStr.length > 0 ? dateStr.slice(0, dateStr.length-1) : dateStr;
}


/**
 * Returns the date as an HH:MM:SS string
 * @param {Date} date The date
 * @param {boolean} showSecond Whether the second is shown
 * @return {string} The formatted string
 * @private
 */
DvtTimeAxisInfo.prototype._formatTime = function(date, showSecond) {
    var hours = date.getHours();
    var mins = date.getMinutes();
    var secs = date.getSeconds();

    var am = "";
    var pm = "";
    var ampmBefore = false;

    if (this._timeAxisResources != null && this._timeAxisResources > DvtTimeAxisInfo.AMPM_BEFORE_INDEX) {
        am = this._timeAxisResources[DvtTimeAxis.AM_INDEX];
        pm = this._timeAxisResources[DvtTimeAxis.PM_INDEX];
        ampmBefore = this._timeAxisResources[DvtTimeAxisInfo.AMPM_BEFORE_INDEX] == "t";
    }

    var b12HFormat = (am != "" && pm != "");
    var ampm;

    if (b12HFormat) {
        ampm = pm;
        if (hours > 12) {
            hours -= 12;
            ampm = pm;
        }
        else if (hours == 0) {
            ampm = am;
            hours = 12;
        }
        else if (hours < 12) {
            ampm = am;
        }
    }

    var timeLabel = this._doubleDigit(hours) + ":" + this._doubleDigit(mins);
    
    if (showSecond) {
        timeLabel += ":" + this._doubleDigit(secs);
    }
    
    if (b12HFormat) {
        if (ampmBefore)
            return ampm + " " + timeLabel;
        else
            return timeLabel + " " + ampm;
    }
    else {
        return timeLabel;
    }
}

/**
 * Creates a double-digit number string for the HH:MM:SS format
 * @param {Number} num A number less than 100
 * @return {String} A double-digit number string
 * @private
 */
DvtTimeAxisInfo.prototype._doubleDigit = function(num) {
    if (num < 10) {
        return "0" + num;
    }
    return "" + num;
}

/**
 * Generates the level 1 and level 2 tick labels
 * @param {DvtContext} context
 * @private
 */
DvtTimeAxisInfo.prototype._generateLabels = function(context) {
  var labels1 = [];
  var labels2 = [];
  var prevDate = null;
  var c1 = 0; // number of level 1 labels
  var c2 = 0; // number of level 2 labels
  var container = context.getStage();
  var isBIDI = DvtStyleUtils.isLocaleR2L();
  var isVert = (this.Position == "left" || this.Position == "right");
  
  // Iterate on an integer to reduce rounding error.  We use <= since the first
  // tick is not counted in the tick count.
  for (var i = 0; i < this._numGroups; i++) {
    var time = this._groups[i];
    if (isNaN(time))
      time = this._minValue + i * this._averageInterval;
      
    var date = new Date(time + this._timeZoneOffset);
    var coord = this.getCoordAt(time);
    var twoLabels = this._formatAxisLabel(date, prevDate);
    
    //level 1 label
    var label1 = twoLabels[0];
    if (label1 != null) {
      labels1.push(this.CreateLabel(context, label1, coord));
    } else {
      labels1.push(null);
    }
    
    //level 2 label
    var label2 = twoLabels[1];
    if (label2 != null) {
      var text = this.CreateLabel(context, label2, coord);
      if (!isVert) //set alignment now in order to determine if the labels will overlap
        isBIDI ? text.alignEnd() : text.alignStart();
      labels2.push(text);
    } else {
      labels2.push(null);
    }
    
    prevDate = date;
  }
  
  c1 = this._skipLabelsGreedy(labels1, this.GetLabelDims(labels1, container));
  c2 = this._skipLabelsGreedy(labels2, this.GetLabelDims(labels2, container));
  
  if (c1 <= 1.5*c2) { // too few level 1 labels
    labels1 = labels2;
    labels2 = null;
  }
  
  else if (c2 < 2) { // too few level 2 labels
    labels2 = null;
  }
  
  if (isVert && labels2 != null)
    this._skipVertLabels(labels1, labels2, container);
  
  this._level1Labels = labels1;
  this._level2Labels = labels2;
}


/**
 * Determines if rectangle A (bounded by pointA1 and pointA2) and rectangle B (bounded by pointB1 and B2) overlap.
 * All the points should lie in one dimension.
 * @param {Number} pointA1
 * @param {Number} pointA2
 * @param {Number} pointB1
 * @param {Number} pointB2
 * @param {Number} gap The minimum gap between the two rectangles
 * @return {Boolean} whether rectangle A and B overlap
 * @private
 */
DvtTimeAxisInfo._isOverlapping = function(pointA1, pointA2, pointB1, pointB2, gap) {
  if(pointB1 >= pointA1 && pointB1 - gap < pointA2)
    return true;
  else if(pointB1 < pointA1 && pointB2 + gap > pointA1)
    return true;
  return false;
}

/**
 * Skip labels greedily. Delete all labels that overlap with the last rendered label.
 * @param {Array} labels An array of DvtText labels for the axis. This array will be modified by the method.
 * @param {Array} labelDims An array of DvtRectangle objects that describe the x, y, height, width of the axis labels.
 * @return {Number} The number of remaining labels after skipping.
 * @private
 */
DvtTimeAxisInfo.prototype._skipLabelsGreedy = function(labels, labelDims) {
  // If there are no labels, return
  if(!labelDims || labelDims.length <= 0)
    return false;

  var isVert = (this.Position == "left" || this.Position == "right");
  var gap = (isVert ? this.Options['layout']['verticalAxisGap'] : this.Options['layout']['horizontalAxisGap']);
  
  var count = 0; // the number of non-null labels 
  var pointA1, pointA2, pointB1, pointB2;
  
  if (labelDims[0] == null) {
    return count;
  } else {
    if (isVert) {
      pointA1 = labelDims[0].y;
      pointA2 = labelDims[0].y + labelDims[0].h;
    } else {
      pointA1 = labelDims[0].x;
      pointA2 = labelDims[0].x + labelDims[0].w;
    }
    count++;
  }

  for (var j=1; j<labelDims.length; j++) {
    if (labelDims[j] == null)
      continue;
    
    if (isVert) {
      pointB1 = labelDims[j].y;
      pointB2 = labelDims[j].y + labelDims[j].h;
      
      if (DvtTimeAxisInfo._isOverlapping(pointA1, pointA2, pointB1, pointB2, gap))
        labels[j] = null;
    } 
    else {
      pointB1 = labelDims[j].x;
      pointB2 = labelDims[j].x + labelDims[j].w;
      
      if (DvtTimeAxisInfo._isOverlapping(pointA1, pointA2, pointB1, pointB2, gap))
        labels[j] = null;
    }
    
    if (labels[j] != null) {
      // start evaluating from label j
      pointA1 = pointB1 + gap;
      pointA2 = pointB2 - gap;
      count++;
    }
  }
  
  return count;
}


/**
 * Format the alignments of the vertical axis labels and skip them accordingly so that level1 and level2 don't overlap.
 * @param {Array} labels1 An array of level 1 DvtText labels for the axis. This array will be modified by the method.
 * @param {Array} labels2 An array of level 2 DvtText labels for the axis. This array will be modified by the method.
 * @param {DvtContainer} container
 * @private
 */
DvtTimeAxisInfo.prototype._skipVertLabels = function(labels1, labels2, container) {
  // returns the dimensions of the label
  var getDims = function(label) {
    container.addChild(label);
    var dims = label.getDimensions(container);
    container.removeChild(label);
    return dims;
  }
  
  var gap = this.Options['layout']['verticalAxisGap'];
  
  // returns if two rectangles (dimsA and dimsB) overlap vertically
  var isOverlapping = function(dimsA, dimsB) {
    return DvtTimeAxisInfo._isOverlapping(dimsA.y, dimsA.y + dimsA.h, dimsB.y, dimsB.y + dimsB.h, gap);
  }
  
  var lastDims = null;
  var overlapping = false;
  
  // attempt to render both level 1 and level 2 and see if they fit on the axis
  for (var i = 0; i < labels1.length; i++) {
    if (labels1[i] && labels2[i]) {
      labels1[i].alignBottom();
      labels2[i].alignTop();
      if (lastDims && isOverlapping(lastDims, getDims(labels1[i]))) {
        overlapping = true;
        break;
      } else {
        lastDims = getDims(labels2[i]);
      }
    } else if (labels1[i] || labels2[i]) {
      var label = labels1[i] ? labels1[i] : labels2[i];
      if (lastDims && isOverlapping(lastDims, getDims(label))) {
        overlapping = true;
        break;
      } else {
        lastDims = getDims(label);
      }
    }
  }
  
  if (!overlapping)
    return; // if both levels fit, we're done
  
  var lastLv1Idx = null;
  var lastLv1Dims = null;
  var lastLv2Dims = null;
  var dims;
  
  // if they don't fit:
  // - for points that have level 2 labels, don't generate the level 1 (one level nesting)
  // - skip all level 1 labels that overlaps with level 2 labels
  for (i = 0; i < labels1.length; i++) {
    if (labels2[i]) { // if level 2 exists
      labels1[i] = null; // delete level 1
      labels2[i].alignCenter();
      dims = getDims(labels2[i]);
      if (lastLv1Dims && isOverlapping(lastLv1Dims, dims)) {
        labels1[lastLv1Idx] = null;
      }
      lastLv2Dims = dims;
    } else if (labels1[i]) { // if level 1 exists but not level 2
      dims = getDims(labels1[i]);
      if (lastLv2Dims && isOverlapping(lastLv2Dims, dims)) {
        labels1[i] = null;
      } else {
        lastLv1Dims = dims;
        lastLv1Idx = i;
      }
    }
  }
}


/**
 * @override
 */
DvtTimeAxisInfo.prototype.getLabels = function(context, levelIdx) {
  if (levelIdx && levelIdx > 1) // time axis has no more than two levels
    return null;

  if (!this._level1Labels)
    this._generateLabels(context);
  
  if (levelIdx == 1) {
    return this._level2Labels;
  }
  
  return this._level1Labels;
}


/**
 * @override
 */
DvtTimeAxisInfo.prototype.getAxisLine = function(context) {
  var axisLineOptions = this.Options['axisLine'];
  if(axisLineOptions['rendered']) {
    // TODO hzhang Check Axis Line behavior for negative/mixed axes.
    var axisLineStroke = new DvtSolidStroke(axisLineOptions['lineColor'], 1, axisLineOptions['lineWidth']);
    return this.CreateGridLine(context, axisLineStroke, 10);
  }
  else 
    return null;
}

/**
 * @override
 */
DvtTimeAxisInfo.prototype.getGridLines = function(context) {
  var gridlines = [];
  
  // Major Ticks
  var coord, line;
  var majorTickOptions = this.Options['majorTick'];
  var majorTickStroke = new DvtSolidStroke(majorTickOptions['lineColor'], 1, majorTickOptions['lineWidth']);
  if(majorTickOptions['rendered'] === true) {
    for(var i=0; i<this._numGroups; i++) {
      coord = this.getCoordAt(i);
      line = this.CreateGridLine(context, majorTickStroke, coord);
      gridlines.push(line);
    }
  }
  
  return gridlines;
}

/**
 * @override
 */
DvtTimeAxisInfo.prototype.getValueAt = function(coord) {
  // Return null if the coord is outside of the axis
  if(coord < this._minCoord || coord > this._maxCoord)
    return null;
  
  // Otherwise find the value
  var ratio = (coord - this._minCoord)/(this._maxCoord - this._minCoord);
  return this._minValue + (ratio * (this._maxValue - this._minValue));
}

/**
 * @override
 */
DvtTimeAxisInfo.prototype.getCoordAt = function(value) {
  // Return null if the value is outside of the axis
  if(value < this._minValue || value > this._maxValue)
    return null;

  return this.getUnboundedCoordAt(value);
}

/**
 * @override
 */
DvtTimeAxisInfo.prototype.getBoundedValueAt = function(coord) {
  if(coord < this._minCoord)
    coord = this._minCoord;
  else if(coord > this._maxCoord)
    coord = this._maxCoord;

  return this.getValueAt(coord);
}

/**
 * @override
 */
DvtTimeAxisInfo.prototype.getBoundedCoordAt = function(value) {
  if(value < this._minValue)
    value = this._minValue;
  else if(value > this._maxValue)
    value = this._maxValue;

  return this.getUnboundedCoordAt(value);
}

/**
 * @override
 */
DvtTimeAxisInfo.prototype.getUnboundedCoordAt = function(value) {
  var ratio = (value - this._minValue)/(this._maxValue - this._minValue);
  return this._minCoord + (ratio * (this._maxCoord - this._minCoord));
}

/**
 * Gets the width of a group (for rendering bar chart)
 * @return {Number} the width of a group 
 */
DvtTimeAxisInfo.prototype.getGroupWidth = function() {
  return Math.abs(this.getCoordAt(this._minValue + this._averageInterval) - this.getCoordAt(this._minValue));
}
