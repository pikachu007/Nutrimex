// Copyright (c) 2008, 2013, Oracle and/or its affiliates. 
// All rights reserved. 

/**
 * Abstract Base Class for Gauge component.
 * @class
 * @constructor
 * @extends {DvtContainer}
 * @export
 */
var DvtGauge = function() {}

DvtObj.createSubclass(DvtGauge, DvtContainer, "DvtGauge");

/** @private **/
DvtGauge._DEFAULT_MIN_VALUE = 0;

/** @private **/
DvtGauge._DEFAULT_MAX_VALUE = 100;

/**
 * Initializes the component.
 * @param {DvtContext} context The rendering context.
 * @param {string} callback The function that should be called to dispatch component events.
 * @param {object} callbackObj The optional object instance on which the callback function is defined.
 * @param {object} options The object containing options specifications for this component.
 * @protected
 */
DvtGauge.prototype.Init = function(context, callback, callbackObj, options) {
  DvtGauge.superclass.Init.call(this, context);
  this._callback = callback;
  this._callbackObj = callbackObj;
  this.setOptions(options);
  
  // Create the resource bundle
  this.Bundle = new DvtGaugeBundle();
  
  // Create the event handler and add event listeners
  this._eventHandler = new DvtGaugeEventManager(this);
  this._eventHandler.addListeners(this);
  
  // Make sure the object has an id for clipRect naming
  this.setId("gauge" + 1000 + Math.floor(Math.random()*10000));
  
  // Create an editing overlay to prevent touch conflicts
  this._editingOverlay = new DvtRect(context, 0, 0);
  this._editingOverlay.setFill(new DvtSolidFill("#000000", 0.001));
  this.addChild(this._editingOverlay);
  
  /** @private **/
  this._bEditing = false;
  
  /** @private **/
  this._oldValue = null;
}

/**
 * Specifies the non-data options for this component.
 * @param {object} options The object containing options specifications for this component.
 * @export
 */
DvtGauge.prototype.setOptions = function(options) {
  this.Options = options; // subclasses should override to combine with the defaults.
  
  // Disable animation for canvas and xml
  if (this.getContext() instanceof DvtXmlContext || this.getContext() instanceof DvtCanvasContext) {
    this.Options['animationOnDisplay']    = 'none';
    this.Options['animationOnDataChange'] = 'none';
  }
}

/**
 * Renders the component with the specified data.  If no data is supplied to a component
 * that has already been rendered, the component will be rerendered to the specified size.
 * @param {object} data The object containing data for this component.
 * @param {number} width The width of the component.
 * @param {number} height The height of the component.
 * @export
 */
DvtGauge.prototype.render = function(data, width, height) 
{  
  // Update if new data has been provided. Clone to avoid modifying the provided object.
  this.Data = data ? DvtJSONUtils.clone(data) : this.Data; 
  if(!this.Data)
    this.Data = {};
    
  // Set default min value if not defined
  if(isNaN(this.Data["minValue"]))
    this.Data["minValue"] = DvtGauge._DEFAULT_MIN_VALUE;
    
  // Set default max value if not defined
  if(isNaN(this.Data["maxValue"]))
    this.Data["maxValue"] = DvtGauge._DEFAULT_MAX_VALUE;
  
  // Update the store width and height if provided
  if(!isNaN(width) && !isNaN(height)) {
    this.Width = width;
    this.Height = height;
  }

  // Order Thresholds
  if(this.Data['thresholds']){
    var thresholds = this.Data['thresholds'];	
    this.Data['thresholds'] = thresholds.sort(DvtGauge._thresholdComparator);
  }
  
  var oldShapes = this.__shapes;
  this.__shapes = [];
  
  // Render the gauge.  Add the container at index 0 to avoid interfering with the editable overlay.
  var container = new DvtContainer(this.getContext());
  this.addChildAt(container, 0);
  this.Render(container, this.Width, this.Height);
  
  this._setAnimation(container, data, oldShapes, this.Width, this.Height);
  
  // Set the size of the editing overlay if editable and touch device
  if(this.Options['readOnly'] === false && DvtAgent.getAgent().isTouchDevice()) {
    this._editingOverlay.setWidth(this.Width);
    this._editingOverlay.setHeight(this.Height);
  }
  else {
    this._editingOverlay.setWidth(0);
    this._editingOverlay.setHeight(0);
  }
  
  // WAI-ARIA
  container.setAriaRole('img');
  var tooltip = this.Data['shortDesc'] ? this.Data['shortDesc'] : this.Data['tooltip'];
  container.setAriaProperty('label', tooltip);
  
  // Queue a render with the context
  this.getContext().queueRender();
}

/**
 * Renders the component at the specified size.
 * @param {DvtContainer} container The container to render within.
 * @param {number} width The width of the component.
 * @param {number} height The height of the component.
 */
DvtGauge.prototype.Render = function(container, width, height) 
{  
  // subclasses should override
}

/**
 * Checks animation settings for the gauge and creates and plays animation on display
 * or animation on data change.
 * @param {DvtContainer} container The container to render within.
 * @param {object} data The object containing data for this component.
 * @param {Array} oldShapes The array of DvtShapes that can be animated
 * @param {number} width The width of the component.
 * @param {number} height The height of the component.
 */
DvtGauge.prototype._setAnimation = function(container, data, oldShapes, width, height) {
  // Stop any animation in progress before starting new animation
  if(this._animation)
    this._animation.stop();
  
  var bBlackBoxUpdate = false;
  var animationOnDataChange = this._bEditing ? "none" : this.Options.animationOnDataChange;
  var animationOnDisplay = this._bEditing ? "none" : this.Options.animationOnDisplay;
  var animationDuration = this.Options.animationDuration/1000;
  
  if (!animationOnDisplay && !animationOnDataChange)
    return;
  
  var bounds = new DvtRectangle(0, 0, width, height);
  var context = this.getContext();
  
  if(!this._container && animationOnDisplay !== "none") { // animationOnDisplay
    this._animation = DvtBlackBoxAnimationHandler.getInAnimation(context, animationOnDisplay, container, bounds, animationDuration);
    if(!this._animation) 
      this._animation = this.CreateAnimationOnDisplay(this.__shapes, animationOnDisplay, animationDuration);
  }
  else if (this._container && animationOnDataChange != "none" && data) { // animationOnDataChange
    this._animation = DvtBlackBoxAnimationHandler.getCombinedAnimation(context, animationOnDataChange, 
                                                                      this._container, container, bounds, animationDuration);   
    if (this._animation)
      bBlackBoxUpdate = true;
    else
      this._animation = this.CreateAnimationOnDataChange(oldShapes, this.__shapes, animationOnDisplay, animationDuration);
  }
  
  if(!bBlackBoxUpdate)
    this.removeChild(this._container);
  
  if(this._animation) {  
    this._animation.play();  
    this._animation.setOnEnd(this._onAnimationEnd, this);
  }
  
  if(bBlackBoxUpdate)
    this._oldContainer = this._container;
  
  this._container = container;
}

/**
  * Creates a DvtPlayable that performs animation upon inital gauge display.
  * @param {Array} objs The array of DvtShapes to animate to.
  * @param {string} animationType The animation type.
  * @param {number} animationDuration The duration of the animation in seconds.
  * @return {DvtPlayable}
  * @protected
  */
DvtGauge.prototype.CreateAnimationOnDisplay = function(objs, animationType, animationDuration) {
  // subclasses may implement
  return null;
}

/**
  * Creates a DvtPlayable that performs animation for a gauge update.
  * @param {Array} oldObjs The array of DvtShapes to animate from.
  * @param {Array} newObjs The array of DvtShapes to animate to.
  * @param {string} animationType The animation type.
  * @param {number} animationDuration The duration of the animation in seconds.
  * @return {DvtPlayable}
  * @protected
  */
DvtGauge.prototype.CreateAnimationOnDataChange = function(oldObjs, newObjs, animationType, animationDuration) {
  var animatedObjs = [];
  for (var i=0; i<oldObjs.length; i++) {
    var oldObj = oldObjs[i];
    var newObj = newObjs[i];
    var startState = oldObj.getAnimationParams();
    var endState = newObj.getAnimationParams();
    
    newObj.setAnimationParams(startState);
    var animation = new DvtCustomAnimation(this.getContext(), newObj, animationDuration);
    animation.getAnimator().addProp(DvtAnimator.TYPE_NUMBER_ARRAY, newObj, newObj.getAnimationParams, newObj.setAnimationParams, endState);
    animatedObjs.push(animation);
  }
  return new DvtParallelPlayable(this.getContext(), animatedObjs);
}

/**
 * Returns the value at the specified coordinates.  Subclasses must override to support editing behavior.
 * @param {number} x The x coordinate of the value change.
 * @param {number} y The y coordinate of the value change.
 */
DvtGauge.prototype.GetValueAt = function(x, y) {
  return null;
}

/**
 * Cleans up the old container used by black box updates.
 * @private
 */
DvtGauge.prototype._onAnimationEnd = function() {
  if(this._oldContainer) {
    this.removeChild(this._oldContainer);
    this._oldContainer = null;
  }
  
  // Reset the animation reference
  this._animation = null;
}

/**
 * Dispatches the event to the callback function.
 * @param {object} event The event to be dispatched.
 */
DvtGauge.prototype.__dispatchEvent = function(event) {
  DvtEventDispatcher.dispatchEvent(this._callback, this._callbackObj, this, event);
};

/**
 * Returns the resource bundle for this component.
 * @return {DvtGaugeBundle}
 */
DvtGauge.prototype.__getBundle = function() {
  return this.Bundle;
}

/**
 * Returns the data object for the component.
 * @return {object} The object containing data for this component.
 */
DvtGauge.prototype.__getData = function() {
  return this.Data ? this.Data : {};
}

/**
 * Returns the evaluated options object, which contains the user specifications
 * merged with the defaults.
 * @return {object} The options object.
 */
DvtGauge.prototype.__getOptions = function() {
  return this.Options;
}

/**
 * Returns the DvtEventManager for this component.
 * @return {DvtEventManager}
 */
DvtGauge.prototype.__getEventManager = function() {
  return this._eventHandler;
}

/**
 * Handles the start of a value change update driven by a touch or mouse gesture at the specified coordinates.
 * @param {number} x The x coordinate of the value change.
 * @param {number} y The y coordinate of the value change.
 */
DvtGauge.prototype.__processValueChangeStart = function(x, y) {
  this._bEditing = true;
  this._oldValue = this.Data['value'];
  this.__processValueChangeMove(x, y);
}

/**
 * Handles the continuation of a value change update driven by a touch or mouse gesture at the specified coordinates.
 * @param {number} x The x coordinate of the value change.
 * @param {number} y The y coordinate of the value change.
 */
DvtGauge.prototype.__processValueChangeMove = function(x, y) {
  // Update the data value and re-render
  this.Data['value'] = this.GetValueAt(x, y);
  this.render();
}

/**
 * Handles the end of a value change update driven by a touch or mouse gesture at the specified coordinates.
 * @param {number} x The x coordinate of the value change.
 * @param {number} y The y coordinate of the value change.
 */
DvtGauge.prototype.__processValueChangeEnd = function(x, y) {  
  // Render again in case a move was skipped
  this.__processValueChangeMove(x, y);

  // Fire the event and reset
  this.__dispatchEvent(new DvtValueChangeEvent(this._oldValue, this.Data['value']));
  this._bEditing = false;
  this._oldValue = null;
}

/**	
* Comparison function	
* @param {object} a threshold object.	
* @param {object} b threshold object.	
* @private	
*/	
DvtGauge._thresholdComparator= function(a, b) {	
  if(a['maxValue'] && b['maxValue'])	
    return Math.abs(a['maxValue']) - Math.abs(b['maxValue']);	
  else	
    return a['maxValue']? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;	
}
/**
 * Resource bundle for DvtGauge.
 * @class
 * @constructor
 * @extends {DvtBundle}
 */
var DvtGaugeBundle = function() {}

DvtObj.createSubclass(DvtGaugeBundle, DvtBundle, "DvtGaugeBundle");

DvtGaugeBundle.prototype.EMPTY_TEXT = "No data to display";
DvtGaugeBundle.prototype.SCALING_SUFFIX_THOUSAND = "K";
DvtGaugeBundle.prototype.SCALING_SUFFIX_MILLION = "M";
DvtGaugeBundle.prototype.SCALING_SUFFIX_BILLION = "B";
DvtGaugeBundle.prototype.SCALING_SUFFIX_TRILLION = "T";
DvtGaugeBundle.prototype.SCALING_SUFFIX_QUADRILLION = "Q";
/**
 * Default values and utility functions for component versioning.
 * @class
 */
var DvtGaugeDefaults = new Object();

DvtObj.createSubclass(DvtGaugeDefaults, DvtObj, "DvtGaugeDefaults");

/**
 * Defaults for version 1.
 */ 
DvtGaugeDefaults.VERSION_1 = {
  'color': "#313842", 'borderColor': null, 'visualEffects': "auto", 'emptyText': null,
  'animationOnDataChange': "none", 'animationOnDisplay': "none", 'animationDuration': 1000,
  'readOnly': 'true',
  'metricLabel': {'autoPrecision': "on", 'rendered': false, 'labelStyle': "font-size: 13px; color: #333333;", 'scaling': 'none'},
  
  // Internal layout constants
  '__layout': {'outerGap': 1, 'labelGap': 3}
};

/**
 * Returns the default options object for the specified version of the component.
 * @param {object} userOptions The object containing options specifications for this component.
 * @return {object} The default options object for the component.
 */
DvtGaugeDefaults.getDefaults = function(userOptions) {
  // Note: Version checking will eventually get added here
  // Note: Future defaults objects are deltas on top of previous objects
  return DvtJSONUtils.clone(DvtGaugeDefaults.VERSION_1);
};
/**
 * Style related utility functions for gauge components.
 * @class
 */
var DvtGaugeDataUtils = new Object();

DvtObj.createSubclass(DvtGaugeDataUtils, DvtObj, "DvtGaugeDataUtils");

/**
 * Returns true if the specified chart has data.
 * @param {DvtGauge} gauge
 * @return {boolean}
 */
DvtGaugeDataUtils.hasData = function(gauge) {
  var data = gauge.__getData();
  
  // Check that there is a data object with a valid value
  if(!data || isNaN(data['value']) || data['value'] === null)
    return false;
  else
    return true;
}

/**
 * Returns the index of the threshold corresponding to the gauge value.
 * @param {DvtGauge}
 * @return {number} The index of the threshold definition or null if none is available.
 */
DvtGaugeDataUtils.getValueThresholdIndex = function(gauge) {
  var data = gauge.__getData();
  var value = data['value'];
  var thresholds = data ? data['thresholds'] : null;
  
  // Return -1 if no thresholds exist
  if(!thresholds)
    return -1;
  
  // Loop through and find the threshold
  for(var i=0; i<thresholds.length; i++) {
    if(value <= thresholds[i]['maxValue'])
      return i;
  }

  // None found, but thresholds exist, this means the last threshold
  return thresholds.length-1;
}

/**
 * Returns the specified threshold.
 * @param {DvtGauge}
 * @param {number} index The index of the threshold.
 * @return {object} The threshold definition or null if none is available.
 */
DvtGaugeDataUtils.getThreshold = function(gauge, index) {
  var data = gauge.__getData();
  var thresholds = data ? data['thresholds'] : null;

  if(thresholds && index >= 0 && index < thresholds.length)
    return thresholds[index];
  else
    return null;
}

/**
 * Returns the specified referenceObject.
 * @param {DvtGauge}
 * @param {number} index The index of the referenceObject.
 * @return {object} The referenceObject definition or null if none is available.
 */
DvtGaugeDataUtils.getReferenceObject = function(gauge, index) {
  var data = gauge.__getData();
  var referenceObjects = data ? data['referenceObjects'] : null;

  if(referenceObjects && index >= 0 && index < referenceObjects.length)
    return referenceObjects[index];
  else
    return null;
}

/**
 * Event Manager for DvtGauge.
 * @param {DvtGauge} gauge
 * @class
 * @extends DvtEventManager
 * @constructor
 */
var DvtGaugeEventManager = function(gauge) {
  this.Init(gauge.getContext(), gauge.__dispatchEvent, gauge);
  this._gauge = gauge;
  this._bEditing = false;
};

DvtObj.createSubclass(DvtGaugeEventManager, DvtEventManager, "DvtGaugeEventManager");

/**
 * @override
 */
DvtGaugeEventManager.prototype.OnMouseDown = function(event) {
  // Set the editing flag so moves are tracked
  if(this._gauge.__getOptions()['readOnly'] === false) {
    this._bEditing = true;
    this.hideTooltip();
    var coords = this.getContext().getRelativePosition(event.pageX, event.pageY);
    this._gauge.__processValueChangeStart(coords.x, coords.y);
  }
  else // Don't call super if editing, just handle it in this subclass
    DvtGaugeEventManager.superclass.OnMouseDown.call(this, event);
}

/**
 * @override
 */
DvtGaugeEventManager.prototype.OnMouseUp = function(event) {  
  // Reset the editing flag
  if(this._bEditing) {
    this._bEditing = false;
    var coords = this.getContext().getRelativePosition(event.pageX, event.pageY);
    this._gauge.__processValueChangeEnd(coords.x, coords.y);
  }
  else // Don't call super if editing, just handle it in this subclass
    DvtGaugeEventManager.superclass.OnMouseUp.call(this, event);
}

/**
 * @override
 */
DvtGaugeEventManager.prototype.OnMouseMove = function(event) {
  // Only process move events when editing
  if(this._bEditing) {
    var coords = this.getContext().getRelativePosition(event.pageX, event.pageY);
    this._gauge.__processValueChangeMove(coords.x, coords.y);
  }
  if (this.IsShowingTooltipWhileEditing() || !this._bEditing)
    DvtGaugeEventManager.superclass.OnMouseMove.call(this, event);
}

/**
 * Controls whether the tooltip shows up on hover/mousemove
 * @return {boolean}
 */
DvtGaugeEventManager.prototype.IsShowingTooltipWhileEditing = function(){
  return false;
}

/**
 * @override
 */
DvtGaugeEventManager.prototype.PreEventBubble = function(event) {
  if ('touchstart' === event.type && this._gauge.__getOptions()['readOnly'] === false) {
    // Set the editing flag so moves are tracked
    this._bEditing = true;
    var coords = this.getContext().getRelativePosition(event.touches[0].pageX, event.touches[0].pageY);
    this._gauge.__processValueChangeStart(coords.x, coords.y);
    
    // Prevent default action from occuring
    event.preventDefault();
  }
  else if ('touchmove' === event.type && this._bEditing) {
    var coords = this.getContext().getRelativePosition(event.touches[0].pageX, event.touches[0].pageY);
    this._gauge.__processValueChangeMove(coords.x, coords.y);
    
    // Prevent default action from occuring
    event.preventDefault();
  }
  else if ('touchend' === event.type && this._bEditing) {
    this._bEditing = false;
    var coords = this.getContext().getRelativePosition(event.changedTouches[0].pageX, event.changedTouches[0].pageY);
    this._gauge.__processValueChangeEnd(coords.x, coords.y);
    
    // Prevent default action from occuring
    event.preventDefault();    
  }
  else { // Don't call super if editing, just handle it in this subclass
    DvtGaugeEventManager.superclass.PreEventBubble.call(this, event);
  } 
}
/**
 * Style related utility functions for gauge components.
 * @class
 */
var DvtGaugeStyleUtils = new Object();

DvtObj.createSubclass(DvtGaugeStyleUtils, DvtObj, "DvtGaugeStyleUtils");

/** @private */
DvtGaugeStyleUtils._THRESHOLD_COLOR_RAMP = ["#D62800", "#FFCF21", "#84AE31"];

/**
 * Returns the color, taking into account the thresholds if specified.
 * @param {DvtGauge} gauge
 * @return {string} The color of the gauge.
 */
DvtGaugeStyleUtils.getColor = function(gauge) {
  // Options Object
  var options = gauge.__getOptions();
  
  // Thresholds
  var thresholdIndex = DvtGaugeDataUtils.getValueThresholdIndex(gauge);
  var threshold = DvtGaugeDataUtils.getThreshold(gauge, thresholdIndex);
  if(threshold && (!(gauge instanceof DvtStatusMeterGauge)|| 
  ((gauge instanceof DvtStatusMeterGauge) && options['thresholdDisplay']=="onIndicator"))) {
    return  DvtGaugeStyleUtils.getThresholdColor(threshold, thresholdIndex);
  }
 
  return options['color'];  
}

/**
 * Returns the border color, taking into account the thresholds if specified.
 * @param {DvtGauge} gauge
 * @return {string} The border color of the gauge.
 */
DvtGaugeStyleUtils.getBorderColor = function(gauge) {
  // Options Object
  var options = gauge.__getOptions();
    
  // Thresholds
  var thresholdIndex = DvtGaugeDataUtils.getValueThresholdIndex(gauge);
  var threshold = DvtGaugeDataUtils.getThreshold(gauge, thresholdIndex);
    
  if( threshold && threshold['borderColor'] && 
  (!(gauge instanceof DvtStatusMeterGauge) ||
  (gauge instanceof DvtStatusMeterGauge) && (options['thresholdDisplay']=="onIndicator")))
    return threshold['borderColor'];
  
  return options['borderColor'];  
}

/**
 * Returns the color, taking into account the thresholds if specified.
 * @param {DvtGauge} gauge
 * @return {string} The color of the gauge.
 */
DvtGaugeStyleUtils.getPlotAreaColor = function(gauge) {
  // Options Object
  var options = gauge.__getOptions();
  
  // Thresholds
  var thresholdIndex = DvtGaugeDataUtils.getValueThresholdIndex(gauge);
  var threshold = DvtGaugeDataUtils.getThreshold(gauge, thresholdIndex);
  if(threshold && (!(gauge instanceof DvtStatusMeterGauge)|| ((gauge instanceof DvtStatusMeterGauge) && options['thresholdDisplay']!="onIndicator"))) {
    return DvtGaugeStyleUtils.getThresholdColor(threshold, thresholdIndex);
  }
  

  return options['plotArea']['color'];  
}

/**
 * Returns the defined threshold color or gets it from the threshold color ramp
 * @param {object} threshold
 * @param {number} thresholdIndex
 * @return {string} The Threshold color of the gauge.
 */
DvtGaugeStyleUtils.getThresholdColor = function(threshold, thresholdIndex) {
  if(threshold['color'])
    return threshold['color'];
  else if(thresholdIndex < DvtGaugeStyleUtils._THRESHOLD_COLOR_RAMP.length)
    return DvtGaugeStyleUtils._THRESHOLD_COLOR_RAMP[thresholdIndex];
}
/**
 * Renderer for DvtGauge.
 * @class
 */
var DvtGaugeRenderer = new Object();

DvtObj.createSubclass(DvtGaugeRenderer, DvtObj, "DvtGaugeRenderer");

/** @private */
DvtGaugeRenderer._EMPTY_TEXT_GAP_WIDTH = 2;
DvtGaugeRenderer._EMPTY_TEXT_GAP_HEIGHT = 1;

/**
 * Renders the empty text for the component. 
 * @param {DvtGauge} gauge The gauge being rendered.
 * @param {DvtContainer} container The container to render into.
 * @param {DvtRectangle} availSpace The available space.
 */
DvtGaugeRenderer.renderEmptyText = function(gauge, container, availSpace) {
  // Get the empty text string
  var options = gauge.__getOptions();
  var emptyTextStr = options['emptyText'];
  if(!emptyTextStr) 
    emptyTextStr = gauge.__getBundle().getRBString(DvtGaugeBundle.EMPTY_TEXT, null, 'DvtChartBundle.EMPTY_TEXT');
  
  // Calculate the alignment point and available space
  var x = availSpace.x + availSpace.w/2;
  var y = availSpace.y + availSpace.h/2;
  var width = availSpace.w - 2*DvtGaugeRenderer._EMPTY_TEXT_GAP_WIDTH;
  var height = availSpace.h - 2*DvtGaugeRenderer._EMPTY_TEXT_GAP_HEIGHT;

  // Create and position the label
  var label = new DvtText(gauge.getContext(), emptyTextStr, x, y);
  label.setCSSStyle(new DvtCSSStyle(options['metricLabel']['labelStyle']));
  label.alignMiddle();
  label.alignCenter();
  
  // Truncate if needed, null is returned if the label doesn't fit
  label = label.truncateToSpace(container, width, height);
  if(label) {
    // Show tooltip for truncated text
    if(label.getTextString() != emptyTextStr)
      gauge.__getEventManager().associate(label, new DvtSimpleObjPeer(emptyTextStr));
      
    // Add to display list
    container.addChild(label);  
  }
};

/**
 * Formats gauge label.
 * @param {float} value The value to render into.
 * @param {Object} gauge The gauge.
 * 
 */
DvtGaugeRenderer.formatLabelValue = function(value, gauge) {
    var options = gauge.__getOptions();
    
    var converter = null;
    if(options['metricLabel']['rendered'] && options['metricLabel']['converter']) 
        converter = options['metricLabel']['converter'];
        
    var scaling = null;
    if(options['metricLabel']['rendered'] && options['metricLabel']['scaling']) 
        scaling = options['metricLabel']['scaling'];
        
    var autoPrecision = options['metricLabel']['autoPrecision']? options['metricLabel']['autoPrecision'] : 'on';
    return DvtGaugeRenderer._formatLabelValue(value, gauge, converter, scaling, autoPrecision);
}

/**
 * Formats dial gauge tick labels.
 * @param {float} value The value to render into.
 * @param {Object} gauge The gauge.
 * 
 */
DvtGaugeRenderer.formatTickLabelValue = function(value, gauge) {
    var options = gauge.__getOptions();
    
    var converter = null;
    if(options['tickLabel']['rendered'] && options['tickLabel']['converter']) 
        converter = options['tickLabel']['converter'];
    
    var scaling = null;
    if(options['tickLabel']['rendered'] && options['tickLabel']['scaling']) 
        scaling = options['tickLabel']['scaling'];
        
    var autoPrecision = options['tickLabel']['autoPrecision']? options['tickLabel']['autoPrecision'] : 'on';
    return DvtGaugeRenderer._formatLabelValue(value, gauge, converter, scaling, autoPrecision);
}

/**
 * Formats gauge label.
 * @param {float} value The value to render into.
 * @param {Object} gauge The gauge.
 * 
 */
DvtGaugeRenderer._formatLabelValue = function(value, gauge, converter, scaling, autoPrecision) {
    var data = gauge.__getData();
    
    if (converter && converter.getAsString && converter.getAsObject)
        return converter.getAsString(value);

    else if (scaling) 
    {
        var minValue = data['minValue'];
        var maxValue = data['maxValue'];
        
        var difference = maxValue - minValue;
        var divider = difference < 1000 ? 100 : 1000;
        var increment = null;
        if(!isNaN(difference)) 
            increment = difference / divider;       
        
        // when scaling is set then init formatter
        var formatter = new DvtLinearScaleAxisValueFormatter(gauge.__getBundle(), minValue, maxValue, increment, scaling, 'on');
        
        return formatter.format(value);
    } 
    else 
        return value;   
}

/**
 * Renders the label into the specified area.
 * @param {DvtGauge} gauge The gauge being rendered.
 * @param {DvtContainer} container The container to render into.
 * @param {DvtRectangle} bounds The available bounds for rendering.
 * @param {color} color Label color
 */
DvtGaugeRenderer.renderLabel = function(gauge, container, bounds, color) {
  var data = gauge.__getData();
  var options = gauge.__getOptions();

  // Create and position the label
  if(options['metricLabel']['rendered']) {
    var value = DvtGaugeRenderer.formatLabelValue(data['value'], gauge);
    var labelString = String(value);
    var labelWidth = bounds.w;
    var labelHeight = bounds.h;

    // Create the label and align
    var label = new DvtText(gauge.getContext(), labelString, bounds.x + bounds.w/2, bounds.y + bounds.h/2);
    label.setCSSStyle(new DvtCSSStyle(options['metricLabel']['labelStyle']));
    label.alignCenter();
    label.alignMiddle();
    
    // Truncate if needed, null is returned if the label doesn't fit
    label = label.truncateToSpace(container, labelWidth, labelHeight); 
    
    // Set color
    color == null? color = "black" : color;
    label.setFill(new DvtSolidFill(color));
    
    if(label) {
      // Show tooltip for truncated text
      if(label.getTextString() != labelString)
        gauge.__getEventManager().associate(label, new DvtSimpleObjPeer(labelString));
        
      // Add to display list
      container.addChild(label);
    }
  }
}
// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 

/**
 * LED Gauge component.  This class should never be instantiated directly.  Use the
 * newInstance function instead.
 * @class
 * @constructor
 * @extends {DvtGauge}
 * @export
 */
var DvtLedGauge = function() {}

DvtObj.createSubclass(DvtLedGauge, DvtGauge, "DvtLedGauge");

/**
 * Returns a new instance of DvtLedGauge.
 * @param {DvtContext} context The rendering context.
 * @param {string} callback The function that should be called to dispatch component events.
 * @param {object} callbackObj The optional object instance on which the callback function is defined.
 * @param {object} options The object containing options specifications for this component.
 * @return {DvtLedGauge}
 * @export
 */
DvtLedGauge.newInstance = function(context, callback, callbackObj, options) {
  var gauge = new DvtLedGauge();
  gauge.Init(context, callback, callbackObj, options);
  return gauge;
}

/**
 * @override
 * @export
 */
DvtLedGauge.prototype.setOptions = function(options) {
  // Combine the user options with the defaults and store
  DvtLedGauge.superclass.setOptions.call(this, DvtLedGaugeDefaults.calcOptions(options));
  
  // animationOnDisplay="auto" will do "zoom"
  if(this.Options['animationOnDisplay'] == "auto")
    this.Options['animationOnDisplay'] = "zoom";
    
  // animationOnDataChange="auto" will do "alphaFade"
  if(this.Options['animationOnDataChange'] == "auto")
    this.Options['animationOnDataChange'] = "alphaFade";
  
  // readOnly="false" is not supported
  this.Options['readOnly'] = true;
}

/**
 * @override
 */
DvtLedGauge.prototype.Render = function(container, width, height) 
{  
  DvtLedGaugeRenderer.render(this, container, width, height);
}
/**
 * Default values and utility functions for component versioning.
 * @class
 */
var DvtLedGaugeDefaults = new Object();

DvtObj.createSubclass(DvtLedGaugeDefaults, DvtObj, "DvtLedGaugeDefaults");

/**
 * Defaults for version 1.
 */ 
DvtLedGaugeDefaults.VERSION_1 = {
  'type': "circle",
  'metricLabel': {'labelStyle': "font-size: 13px;"}
};

/**
 * Combines the user options with the defaults for the specified version.  Returns the
 * combined options object.  This object will contain internal attribute values and
 * should be accessed in internal code only.
 * @param {object} userOptions The object containing options specifications for this component.
 * @return {object} The combined options object.
 */
DvtLedGaugeDefaults.calcOptions = function(userOptions) {
  var defaults = DvtLedGaugeDefaults._getDefaults(userOptions);

  // Use defaults if no overrides specified
  if(!userOptions)
    return defaults;
  else // Merge the options object with the defaults
    return DvtJSONUtils.merge(userOptions, defaults);
}

/**
 * Returns the default options object for the specified version of the component.
 * @param {object} userOptions The object containing options specifications for this component.
 * @return {object} The default options object for the component.
 * @private
 */
DvtLedGaugeDefaults._getDefaults = function(userOptions) {
  // Note: Version checking will eventually get added here
  // Note: Future defaults objects are deltas on top of previous objects
  
  // The base class defaults are combined with the defaults from this class
  var baseDefaults = DvtGaugeDefaults.getDefaults(userOptions);
  var defaults = DvtJSONUtils.clone(DvtLedGaugeDefaults.VERSION_1)
  return DvtJSONUtils.merge(defaults, baseDefaults);
}
/**
 * Renderer for DvtLedGauge.
 * @class
 */
var DvtLedGaugeRenderer = new Object();

DvtObj.createSubclass(DvtLedGaugeRenderer, DvtObj, "DvtLedGaugeRenderer");

/** @private **/
DvtLedGaugeRenderer.__RECTANGLE_CORNER_RADIUS = 1/6;

/** @private **/
DvtLedGaugeRenderer._SHAPE_TRIANGLE_CMDS = DvtPathUtils.moveTo(8.00, 86.60) +
                                           DvtPathUtils.quadTo(0, 86.60, 3.46, 78.60) +
                                           DvtPathUtils.lineTo(46.00, 6.93) +
                                           DvtPathUtils.quadTo(50.00, 0, 54.00, 6.93) +
                                           DvtPathUtils.lineTo(96.54, 78.60) + 
                                           DvtPathUtils.quadTo(100, 86.60, 92.00, 86.60) + 
                                           DvtPathUtils.closePath();
                                           
/** @private **/
DvtLedGaugeRenderer._SHAPE_TRIANGLE_INNER_CMDS = DvtPathUtils.moveTo(0, 86.60) +
                                           DvtPathUtils.lineTo(50.00, 0) +
                                           DvtPathUtils.lineTo(100, 86.60) + 
                                           DvtPathUtils.closePath();

/** @private **/ 
DvtLedGaugeRenderer._SHAPE_STAR_CMDS = "M26.72,48.82L28.094,20.746L45.594,42.738L72.714,35.382L57.2,58.812L72.59,82.328L45.504,74.816L27.894,96.722L26.666,68.652L.398,58.688Z";   

/** @private **/
DvtLedGaugeRenderer._SHAPE_ARROW_CMDS = DvtPathUtils.moveTo(50,95) + 
                                        DvtPathUtils.lineTo(71,95) + 
                                        DvtPathUtils.quadTo(74.414,94.414,75,91) + 
                                        DvtPathUtils.lineTo(75,60) + 
                                        DvtPathUtils.lineTo(92,60) + 
                                        DvtPathUtils.quadTo(98.5,59.1,95,54) + 
                                        DvtPathUtils.lineTo(52,12) + 
                                        DvtPathUtils.quadTo(50,11,48,12) + 
                                        DvtPathUtils.lineTo(5,54) + 
                                        DvtPathUtils.quadTo(1.5,59.1,8,60) +
                                        DvtPathUtils.lineTo(25,60) + 
                                        DvtPathUtils.lineTo(25,91) + 
                                        DvtPathUtils.quadTo(25.586,94.414,29,95) + 
                                        DvtPathUtils.closePath();
                                        
/** @private **/
DvtLedGaugeRenderer._SHAPE_ARROW_INNER_CMDS = DvtPathUtils.moveTo(75,98) + 
                                        DvtPathUtils.lineTo(75,58) + 
                                        DvtPathUtils.lineTo(97.5,58) + 
                                        DvtPathUtils.lineTo(50,11) + 
                                        DvtPathUtils.lineTo(2.5,58) +
                                        DvtPathUtils.lineTo(25,58) + 
                                        DvtPathUtils.lineTo(25,98) + 
                                        DvtPathUtils.closePath();

/**
 * Renders the gauge in the specified area.
 * @param {DvtLedGauge} gauge The gauge being rendered.
 * @param {DvtContainer} container The container to render into.
 * @param {number} width The width of the component.
 * @param {number} height The height of the component.
 */
DvtLedGaugeRenderer.render = function(gauge, container, width, height) {
  if(DvtGaugeDataUtils.hasData(gauge)) {
    // Allocate the outer gap for the component
    var options = gauge.__getOptions();
    var data = gauge.__getData();
    var outerGap = options['__layout']['outerGap'];
    var size = data && (data.size >= 0 || data.size < 1) ? Math.sqrt(data.size) : 1;    
    var bounds = new DvtRectangle(outerGap + ((width - 2 * outerGap) * (1 - size) / 2), 
    outerGap + ((height - 2 * outerGap) * (1 - size) / 2), 
    (width - 2*outerGap) * size, (height - 2*outerGap)* size);
    
    // Render the LED shape first
    DvtLedGaugeRenderer._renderShape(gauge, container, bounds);
    
    // Render the visual effects
    DvtLedGaugeRenderer._renderVisualEffects(gauge, container, bounds);
    
    // Render the label on top of the LED
    var labelColor = DvtGaugeStyleUtils.getColor(gauge);
    var r = DvtColorUtils.getRed(labelColor);
    var g = DvtColorUtils.getGreen(labelColor);
    var b = DvtColorUtils.getBlue(labelColor);
    var yiq = (r*299 + g*587 + b*114)/1000;
    labelColor = (yiq >= 128) ? "#000000" : "#FFFFFF";
    
    DvtGaugeRenderer.renderLabel(gauge, container, DvtLedGaugeRenderer._getLabelBounds(gauge, container, bounds), labelColor);
  }
  else // Render the empty text
    DvtGaugeRenderer.renderEmptyText(gauge, container, new DvtRectangle(0, 0, width, height));
}

/**
 * Renders the led shape into the specified area.
 * @param {DvtLedGauge} gauge The gauge being rendered.
 * @param {DvtContainer} container The container to render into.
 * @param {DvtRectangle} bounds The available bounds for rendering.
 */
DvtLedGaugeRenderer._renderShape = function(gauge, container, bounds) {
  var context = gauge.getContext();
  var data = gauge.__getData();
  var options = gauge.__getOptions();
  
  // Find the styles
  var type = options['type'];
  var color = DvtGaugeStyleUtils.getColor(gauge);
  var borderColor = DvtGaugeStyleUtils.getBorderColor(gauge);
  
  // Calculate the center and radius for convenience
  var cx = bounds.x + bounds.w/2;
  var cy = bounds.y + bounds.h/2;
  var r = Math.min(bounds.w, bounds.h)/2;
  
  // Render the LED shape
  var shape;
  if(type == "rectangle") {
    shape = new DvtRect(context, bounds.x, bounds.y, bounds.w, bounds.h);
  }
  else if(type == "diamond") {
    shape = new DvtPolygon(context, [cx - r, cy, cx, cy - r, cx + r, cy, cx, cy + r]);
  }
  else if(type == "triangle") {
    shape = new DvtPath(context, DvtLedGaugeRenderer._SHAPE_TRIANGLE_CMDS);
  }
  else if(type == "star") {
    shape = new DvtPath(context, DvtLedGaugeRenderer._SHAPE_STAR_CMDS);
  }
  else if(type == "arrow") {
    shape = new DvtPath(context, DvtLedGaugeRenderer._SHAPE_ARROW_CMDS);
  }
  else { // circle
    shape = new DvtCircle(context, cx, cy, r);
  }
  
  // Apply the style properties
  shape.setFill(new DvtSolidFill(color));
  if(borderColor)
    shape.setStroke(new DvtSolidStroke(borderColor));
    
  // Tooltip Support
  if(data.tooltip)
    gauge.__getEventManager().associate(shape, new DvtSimpleObjPeer(null, data.tooltip, color));
    
  // Scale and rotate the shape if needed
  shape = DvtLedGaugeRenderer._scaleAndRotate(gauge, container, shape, bounds);  
  
  // Add the shape to the container
  container.addChild(shape);
}

/**
 * Scales and rotates the shape into the specified bounds.
 * @param {DvtLedGauge} gauge The gauge being rendered.
 * @param {DvtContainer} container The container to render into.
 * @param {DvtDisplayable} shape The shape for the gauge.
 * @param {DvtRectangle} bounds The bounds of the shape.
 * @return {DvtDisplayable} The scaled shape
 * @private
 */
DvtLedGaugeRenderer._scaleAndRotate = function(gauge, container, shape, bounds) {
  var data = gauge.__getData();
  var options = gauge.__getOptions();
  
  // Return the existing shape if already fitted
  var type = options['type'];
  if(!(type == "triangle" || type == "arrow"|| type == "star"))
    return shape;
    
  // Add containers for the tranforms, add to display list to calc dimensions
  var translateGroup = new DvtContainer(gauge.getContext());
  var scaleGroup = new DvtContainer(gauge.getContext());
  container.addChild(translateGroup);
  translateGroup.addChild(scaleGroup);
  scaleGroup.addChild(shape);
  
  // Rotate the shape, non-90 degree rotation values are ignored
  var rotation = data && (data.rotation % 90 == 0) ? data['rotation'] : 0;
  var rotationMatrix = new DvtMatrix(gauge.getContext());
  rotationMatrix.rotate(Math.PI * (90 - rotation)/180);
  shape.setMatrix(rotationMatrix);

  // Scale the shape so that it's fitted within the bounds
  var dims = scaleGroup.getDimensions();
  var sx = bounds.w/dims.w;
  var sy = bounds.h/dims.h;
  var s = Math.min(sx, sy);
  var scaleMatrix = new DvtMatrix(gauge.getContext());
  scaleMatrix.scale(s, s);
  scaleGroup.setMatrix(scaleMatrix);
  
  // Translate the shape so that it's centered within the bounds
  var groupDims = translateGroup.getDimensions();
  var tx = (bounds.x + bounds.w/2) - (groupDims.x + groupDims.w/2);
  var ty = (bounds.y + bounds.h/2) - (groupDims.y + groupDims.h/2);
  
  var matrix = new DvtMatrix(gauge.getContext());
  matrix.translate(tx, ty);
  translateGroup.setMatrix(matrix);
  
  // Remove the shape
  container.removeChild(translateGroup);
  
  // Adjust the border of the shape to account for the scale transformation.
  var stroke = shape.getStroke();
  if(stroke) {
    stroke = stroke.clone();
    stroke.setWidth(stroke.getWidth()/s);
    shape.setStroke(stroke);
  }
  
  // Return the group with its transform
  return translateGroup;
}

/**
 * Renders the visual effects for the shape into the specified area.
 * @param {DvtLedGauge} gauge The gauge being rendered.
 * @param {DvtContainer} container The container to render into.
 * @param {DvtRectangle} bounds The bounds of the shape.
 * @private
 */
DvtLedGaugeRenderer._renderVisualEffects = function(gauge, container, bounds) {
  var options = gauge.__getOptions();
  var type = options['type'];
  
  if(options.visualEffects == "none")
    return;

  // Render the visual effects
  if(type == "rectangle") 
    DvtLedGaugeRenderer._renderOverlayRectangle(gauge, container, bounds);
  else if(type == "diamond") 
    DvtLedGaugeRenderer._renderOverlayDiamond(gauge, container, bounds);
  else if(type == "triangle") 
    DvtLedGaugeRenderer._renderOverlayTriangle(gauge, container, bounds);
  else if(type == "star") 
    DvtLedGaugeRenderer._renderOverlayStar(gauge, container, bounds);
  else if(type == "arrow") 
    DvtLedGaugeRenderer._renderOverlayArrow(gauge, container, bounds);
  else // circle
    DvtLedGaugeRenderer._renderOverlayCircle(gauge, container, bounds);
}

/**
 * Renders the visual effects for the rectangle LED into the specified area.
 * @param {DvtLedGauge} gauge The gauge being rendered.
 * @param {DvtContainer} container The container to render into.
 * @param {DvtRectangle} bounds The bounds of the shape.
 */
DvtLedGaugeRenderer._renderOverlayRectangle = function(gauge, container, bounds) {
  // Overlay Shape
  var dx = bounds.w * 0.05;
  var dy = bounds.h * 0.05;
  var overlayBounds = new DvtRectangle(bounds.x + dx, bounds.y + dy, bounds.w - 2*dx, bounds.h - 2*dy);
  var overlay = new DvtRect(gauge.getContext(), overlayBounds.x, overlayBounds.y, overlayBounds.w, overlayBounds.h);
  overlay.setMouseEnabled(false);
  container.addChild(overlay);
  
  // Gradient
  var arColors = ["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"];
  var arAlphas = [0.75, 0.5, 0.15, 0, 0.2, 0.4, 0.2];
  var arStops = [0, 0.05, 0.4, 0.6, 0.8, 0.9, 1.0];
  var gradient = new DvtLinearGradientFill(270, arColors, arAlphas, arStops);
  overlay.setFill(gradient);
}

/**
 * Renders the visual effects for the diamond LED into the specified area.
 * @param {DvtLedGauge} gauge The gauge being rendered.
 * @param {DvtContainer} container The container to render into.
 * @param {DvtRectangle} bounds The bounds of the shape.
 */
DvtLedGaugeRenderer._renderOverlayDiamond = function(gauge, container, bounds) {
  // Overlay Shape
  var dx = bounds.w * 0.05;
  var dy = bounds.h * 0.05;
  var overlayBounds = new DvtRectangle(bounds.x + dx, bounds.y + dy, bounds.w - 2*dx, bounds.h - 2*dy);
  var cx = overlayBounds.x + overlayBounds.w/2;
  var cy = overlayBounds.y + overlayBounds.h/2;
  var r = Math.min(overlayBounds.w, overlayBounds.h)/2;
  var overlay = new DvtPolygon(gauge.getContext(), [cx - r, cy, cx, cy - r, cx + r, cy, cx, cy + r])
  overlay.setMouseEnabled(false);
  container.addChild(overlay);
  
  // Gradient
  var arColors = ["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"];
  var arAlphas = [0.75, 0.5, 0.15, 0, 0.2, 0.4, 0.2];
  var arStops = [0, 0.05, 0.4, 0.6, 0.8, 0.9, 1.0];
  var gradient = new DvtLinearGradientFill(270, arColors, arAlphas, arStops);
  overlay.setFill(gradient);
}

/**
 * Renders the visual effects for the triangle LED into the specified area.
 * @param {DvtLedGauge} gauge The gauge being rendered.
 * @param {DvtContainer} container The container to render into.
 * @param {DvtRectangle} bounds The bounds of the shape.
 */
DvtLedGaugeRenderer._renderOverlayTriangle = function(gauge, container, bounds) {
  // Overlay Shape
  var dx = bounds.w * 0.05;
  var dy = bounds.h * 0.05;
  var overlayBounds = new DvtRectangle(bounds.x + dx, bounds.y + dy, bounds.w - 2*dx, bounds.h - 2*dy);
  var overlay = new DvtPath(gauge.getContext(), DvtLedGaugeRenderer._SHAPE_TRIANGLE_INNER_CMDS);
  
  // Calculate the gradient params
  var data = gauge.__getData();
  var rotation = data && (data.rotation % 90 == 0) ? data.rotation : 0;
  var gradientRotation = 360 - rotation;
  var arColors = ["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"];
  var arAlphas = [0.3, 0.55, 0.0, 0.25, 0.1];
  var arStops = [0, 0.05, 0.4, 0.9, 1.0];
  var gradient = new DvtLinearGradientFill(gradientRotation, arColors, arAlphas, arStops);
  overlay.setFill(gradient);
  
  // Add to display list
  overlay = DvtLedGaugeRenderer._scaleAndRotate(gauge, container, overlay, overlayBounds);  
  overlay.setMouseEnabled(false);
  container.addChild(overlay);
}

/**
 * Renders the visual effects for the arrow LED into the specified area.
 * @param {DvtLedGauge} gauge The gauge being rendered.
 * @param {DvtContainer} container The container to render into.
 * @param {DvtRectangle} bounds The bounds of the shape.
 */
DvtLedGaugeRenderer._renderOverlayArrow = function(gauge, container, bounds) {
  // Overlay Shape
  var dx = bounds.w * 0.05;
  var dy = bounds.h * 0.05;
  var overlayBounds = new DvtRectangle(bounds.x + dx, bounds.y + dy, bounds.w - 2*dx, bounds.h - 2*dy);
  var overlay = new DvtPath(gauge.getContext(), DvtLedGaugeRenderer._SHAPE_ARROW_INNER_CMDS);
  
  // Calculate the gradient params
  var data = gauge.__getData();
  var rotation = data && (data.rotation % 90 == 0) ? data.rotation : 0;
  var gradientRotation = 360 - rotation;
  var arColors = ["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"];
  var arAlphas = [0.3, 0.55, 0.0, 0.25, 0.1];
  var arStops = [0, 0.05, 0.4, 0.9, 1.0];
  var gradient = new DvtLinearGradientFill(gradientRotation, arColors, arAlphas, arStops);
  overlay.setFill(gradient);
  
  // Add to display list
  overlay = DvtLedGaugeRenderer._scaleAndRotate(gauge, container, overlay, overlayBounds);  
  overlay.setMouseEnabled(false);
  container.addChild(overlay);
}
/**
 * Renders the visual effects for the star LED into the specified area.
 * @param {DvtLedGauge} gauge The gauge being rendered.
 * @param {DvtContainer} container The container to render into.
 * @param {DvtRectangle} bounds The bounds of the shape.
 */
DvtLedGaugeRenderer._renderOverlayStar = function(gauge, container, bounds) {
  // Overlay Shape
  var dx = bounds.w * 0.05;
  var dy = bounds.h * 0.05;
  var overlayBounds = new DvtRectangle(bounds.x + dx, bounds.y + dy, bounds.w - 2*dx, bounds.h - 2*dy);
  var overlay = new DvtPath(gauge.getContext(), DvtLedGaugeRenderer._SHAPE_STAR_CMDS);
  
  // Calculate the gradient params
  var data = gauge.__getData();
  var rotation = data && (data.rotation % 90 == 0) ? data.rotation : 0;
  var gradientRotation = 360 - rotation;
  var color = DvtGaugeStyleUtils.getColor(gauge);	
  var arColors = [DvtColorUtils.getDarker(color, .9), color, DvtColorUtils.getBrighter(color, .7)];
  var arAlphas = [1, 1, 1];
  var arStops = [0.10, 0.40, 0.80];
  var gradient = new DvtLinearGradientFill(gradientRotation, arColors, arAlphas, arStops);
  overlay.setFill(gradient);
  
  // Add to display list
  overlay = DvtLedGaugeRenderer._scaleAndRotate(gauge, container, overlay, overlayBounds);  
  overlay.setMouseEnabled(false);
  container.addChild(overlay);
}
/**
 * Renders the visual effects for the circle LED into the specified area.
 * @param {DvtLedGauge} gauge The gauge being rendered.
 * @param {DvtContainer} container The container to render into.
 * @param {DvtRectangle} bounds The bounds of the shape.
 */
DvtLedGaugeRenderer._renderOverlayCircle = function(gauge, container, bounds) {
  // The circle uses two overlays.
  var dx = bounds.w * 0.05;
  var dy = bounds.h * 0.05;
  var gradientBounds = new DvtRectangle(bounds.x + dx, bounds.y + dy, bounds.w - 2*dx, bounds.h - 2*dy);

  //********************* First Overlay: "Overlay" ************************/
 
  // Shape
  var cx = gradientBounds.x + gradientBounds.w/2;
  var cy = gradientBounds.y + gradientBounds.h/2;
  var radius = Math.min(gradientBounds.w, gradientBounds.h)/2;
  var overlay = new DvtCircle(gauge.getContext(), cx, cy, radius);
  overlay.setMouseEnabled(false);
  container.addChild(overlay);
  
  // Gradient
  var arColors = ["#FFFFFF", "#FFFFFF", "#FFFFFF"];
  var arAlphas = [0, 0.25, 0.5];
  var arStops = [0.15, 0.7, 0.95];
  var gradientCx = cx;
  var gradientCy = cy - radius * 0.6; // per UX
  var gradientRadius = radius * 1.5;
  var gradient = new DvtRadialGradientFill(arColors, arAlphas, arStops, gradientCx, gradientCy, gradientRadius,
                                                                                    [gradientBounds.x, gradientBounds.y,
                                                                                     gradientBounds.w, gradientBounds.h]);
  overlay.setFill(gradient);
  
  //********************* Second Overlay: "Highlight" ************************/
  
  // Shape
  var rx = radius * 0.6; // per UX
  var ry = radius * 0.4; // per UX
  cy = cy - 0.3*ry; // per UX
  var highlight = new DvtOval(gauge.getContext(), cx, cy-ry, rx, ry);
  highlight.setMouseEnabled(false);
  container.addChild(highlight);
  
  // Gradient
  var highlightColors = ["#FFFFFF", "#FFFFFF", "#FFFFFF"];
  var highlightAlphas = [0, 0.2, 0.5];
  var highlightStops = [0.6, 0.8, 1.0];
  var highlightCx = cx;
  var highlightCy = cy;
  var highlightRadius = rx;
  var highlightGradient = new DvtRadialGradientFill(highlightColors, highlightAlphas, highlightStops, highlightCx, highlightCy, highlightRadius,
                                                                                    [gradientBounds.x, gradientBounds.y,
                                                                                     gradientBounds.w, gradientBounds.h]);
  highlight.setFill(highlightGradient);
}

/**
 * Find correct label bounds
 * @param {DvtLedGauge} gauge The gauge being rendered.
 * @param {DvtContainer} container The container to render into.
 * @param {DvtRectangle} bounds The bounds of the shape.
 * @return {DvtRectangle} Bounds for the label
 * @private
 */
DvtLedGaugeRenderer._getLabelBounds = function(gauge, container, bounds) {

  var options = gauge.__getOptions();
  var type = options['type'];
  var data = gauge.__getData();
  var rotation = data && (data['rotation'] % 90 == 0) ? data['rotation'] : 0;
  var minDim = Math.min(bounds.w, bounds.h); 
  var newX = bounds.x;
  var newY = bounds.y;
  var newWidth = bounds.w;
  var newHeight = bounds.h;
  if(type == "triangle") {
    if(rotation == 0) {
      newX -= minDim * .12;
      newWidth -= minDim * .24;
    }
    else if(rotation == 90) {
      newY += minDim * .15;
      newHeight -= minDim * .3;
    }
    else if(rotation == 180) {
      newX += minDim * .12;
      newWidth -= minDim * .24;
    }
    else if(rotation == 270) {
      newY -= minDim * .15;
      newHeight -= minDim * .3;
    }
  }
  else if(type == "arrow") {
    if(rotation == 0) {
      newX -= minDim * .14;
      newWidth -= .72;
    }
    else if(rotation == 180) {
      newX += minDim * .14;
      newWidth -= minDim * .28;
    }
  }
  else if(type == "star") {
    newY += minDim * .06 ;
    newHeight -= minDim * .12;
  }
  return new DvtRectangle(newX, newY, bounds.w, bounds.h)
}
// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 

/**
 * Status Meter Gauge component.  This class should never be instantiated directly.  Use the
 * newInstance function instead.
 * @class
 * @constructor
 * @extends {DvtGauge}
 * @export
 */
var DvtStatusMeterGauge = function() {}

DvtObj.createSubclass(DvtStatusMeterGauge, DvtGauge, "DvtStatusMeterGauge");

/**
 * Returns a new instance of DvtStatusMeterGauge.
 * @param {DvtContext} context The rendering context.
 * @param {string} callback The function that should be called to dispatch component events.
 * @param {object} callbackObj The optional object instance on which the callback function is defined.
 * @param {object} options The object containing options specifications for this component.
 * @return {DvtStatusMeterGauge}
 * @export
 */
DvtStatusMeterGauge.newInstance = function(context, callback, callbackObj, options) {
  var gauge = new DvtStatusMeterGauge();
  gauge.Init(context, callback, callbackObj, options);
  return gauge;
}

/**
 * @override
 */
DvtStatusMeterGauge.prototype.Init = function(context, callback, callbackObj, options) {
  DvtStatusMeterGauge.superclass.Init.call(this, context, callback, callbackObj, options);
  
  /**
   * The axis info of the chart. This will be set during render time and is used for editing support.
   * @type {DvtAxisInfo}
   */
  this.__axisInfo = null;
}

/**
 * @override
 * @export
 */
DvtStatusMeterGauge.prototype.setOptions = function(options) {
  // Combine the user options with the defaults and store
  DvtStatusMeterGauge.superclass.setOptions.call(this, DvtStatusMeterGaugeDefaults.calcOptions(options));
}

/**
 * @override
 */
DvtStatusMeterGauge.prototype.Render = function(container, width, height) 
{  
  DvtStatusMeterGaugeRenderer.render(this, container, width, height);
}

/**
 * @override
 */
DvtStatusMeterGauge.prototype.CreateAnimationOnDisplay = function(objs, animationType, animationDuration) {
  var animatedObjs = [];
  for (var i=0; i<objs.length; i++) {
    var obj = objs[i];
    var endState = obj.getAnimationParams();
    obj.setAnimationParams([endState[0], endState[0], endState[2], endState[3]]);
    var animation = new DvtCustomAnimation(this.getContext(), obj, animationDuration);
    animation.getAnimator().addProp(DvtAnimator.TYPE_NUMBER_ARRAY, obj, obj.getAnimationParams, obj.setAnimationParams, endState);
    animation.getAnimator().setEasing(function(progress) {return DvtEasing.backOut(progress, 0.7);});
    animatedObjs.push(animation);
  }
  return new DvtParallelPlayable(this.getContext(), animatedObjs);
}

/**
 * @override
 */
DvtStatusMeterGauge.prototype.GetValueAt = function(x, y) {
  return this.__axisInfo.getBoundedValueAt(x);
}
/**
 * Default values and utility functions for component versioning.
 * @class
 */
var DvtStatusMeterGaugeDefaults = new Object();

DvtObj.createSubclass(DvtStatusMeterGaugeDefaults, DvtObj, "DvtStatusMeterGaugeDefaults");

/**
 * Defaults for version 1.
 */ 
DvtStatusMeterGaugeDefaults.VERSION_1 = {
  'color': "#313842",
  
    //Plot Area
  'plotArea' : {'color':"#AAAAAA", 'borderColor': "#C6C6C6", 'rendered': "auto"},
  
  'thresholdDisplay': "onIndicator",
  
  'indicatorSize':1
};

/**
 * Combines the user options with the defaults for the specified version.  Returns the
 * combined options object.  This object will contain internal attribute values and
 * should be accessed in internal code only.
 * @param {object} userOptions The object containing options specifications for this component.
 * @return {object} The combined options object.
 */
DvtStatusMeterGaugeDefaults.calcOptions = function(userOptions) {
  var defaults = DvtStatusMeterGaugeDefaults._getDefaults(userOptions);

  // Use defaults if no overrides specified
  if(!userOptions)
    return defaults;
  else // Merge the options object with the defaults
    return DvtJSONUtils.merge(userOptions, defaults);
}

/**
 * Returns the default options object for the specified version of the component.
 * @param {object} userOptions The object containing options specifications for this component.
 * @return {object} The default options object for the component.
 * @private
 */
DvtStatusMeterGaugeDefaults._getDefaults = function(userOptions) {
  // Note: Version checking will eventually get added here
  // Note: Future defaults objects are deltas on top of previous objects
  
  // The base class defaults are combined with the defaults from this class
  var baseDefaults = DvtGaugeDefaults.getDefaults(userOptions);
  var defaults = DvtJSONUtils.clone(DvtStatusMeterGaugeDefaults.VERSION_1)
  return DvtJSONUtils.merge(defaults, baseDefaults);
}
/**
 * Renderer for DvtStatusMeterGauge.
 * @class
 */
var DvtStatusMeterGaugeRenderer = new Object();

DvtObj.createSubclass(DvtStatusMeterGaugeRenderer, DvtObj, "DvtStatusMeterGaugeRenderer");

/**
 * Renders the gauge in the specified area.
 * @param {DvtStatusMeterGauge} gauge The gauge being rendered.
 * @param {DvtContainer} container The container to render into.
 * @param {number} width The width of the component.
 * @param {number} height The height of the component.
 */
DvtStatusMeterGaugeRenderer.render = function(gauge, container, width, height) {
  if(DvtGaugeDataUtils.hasData(gauge)) {
    // Allocate the outer gap for the component
    var options = gauge.__getOptions();
    var outerGap = options['__layout']['outerGap'];
    var bounds = new DvtRectangle(outerGap, outerGap, width - 2*outerGap, height - 2*outerGap);
    
    // Render the label first to allocate space
    DvtStatusMeterGaugeRenderer._renderLabel(gauge, container, bounds);
    
    // Render the bar
    DvtStatusMeterGaugeRenderer._renderShape(gauge, container, bounds);
  }
  else // Render the empty text
    DvtGaugeRenderer.renderEmptyText(gauge, container, new DvtRectangle(0, 0, width, height));
}

/**
 * Renders the led shape into the specified area.
 * @param {DvtLedGauge} gauge The gauge being rendered.
 * @param {DvtContainer} container The container to render into.
 * @param {DvtRectangle} bounds The available bounds for rendering.
 */
DvtStatusMeterGaugeRenderer._renderShape = function(gauge, container, bounds) {
  var data = gauge.__getData();
  var options = gauge.__getOptions();
  var isBIDI = DvtStyleUtils.isLocaleR2L();
  // Create an axis info to find the coords of values.
  var axisOptions = {'layout': {}};
  axisOptions['layout']['gapRatio'] = 0;
  axisOptions['timeAxisType'] = "disabled";
  axisOptions['position'] = "bottom";
  axisOptions['minValue'] = data['minValue'];
  axisOptions['maxValue'] = data['maxValue'];

  var axisData = {};
  axisData['minDataValue'] = data['minValue'];
  axisData['maxDataValue'] = data['maxValue'];

  var axisInfo = DvtAxisInfo.newInstance(axisData, axisOptions, bounds);

  // Store the axisInfo on the gauge for editing support
  gauge.__axisInfo = axisInfo;

  // First calculate the baseline coordinate.
  var baseline = 0;
  if(data['maxValue'] < 0)
    baseline = data['maxValue'];
  else if(data['minValue'] > 0)
    baseline = data['minValue'];

  var baselineCoord = axisInfo.getCoordAt(baseline);
  // Calculate the endCoord.  Adjust to keep within the axis.
  var endCoord = axisInfo.getUnboundedCoordAt(data['value']);
  endCoord = Math.max(bounds.x, Math.min(bounds.x + bounds.w, endCoord));
  var plotAreaEnd = 0;
  
  if(data['minValue'] < 0 && data['value'] < 0)
    plotAreaEnd = axisInfo.getUnboundedCoordAt(data['minValue']);
  else 
    plotAreaEnd = axisInfo.getUnboundedCoordAt(data['maxValue']);
  plotAreaEnd = Math.max(bounds.x, Math.min(bounds.x + bounds.w, plotAreaEnd));
  
  var plotY1 = bounds.y;
  var plotY2 = bounds.y + bounds.h;
  
  var indicatorY1 = bounds.y + (1 - options['indicatorSize']) / 2 * bounds.h;
  var indicatorY2 = bounds.y + bounds.h * (1 - (1 - options['indicatorSize']) / 2);
  
  var roundCorners = true;
  var bRender = true;
  if(endCoord == baselineCoord)
    bRender = false;// don't draw an empty bar
  // Create plotArea
  var borderColor = DvtGaugeStyleUtils.getBorderColor(gauge);
  var plotAreaBorderColor=options['plotArea']['borderColor'];
  var thresholds = data ? data['thresholds'] : null;
  
  // Case for plot area with all thresholds displayed
  if(thresholds && options['plotArea']['rendered']!="off" && options['thresholdDisplay'] == "all") {
    for(var i = thresholds.length - 1;i >= 0;i--) {
      var currentThresholdIndex=i;
      var plotArea = DvtStatusMeterGaugeRenderer._createShape(gauge.getContext(), baselineCoord, plotAreaEnd, plotY1, plotY2, roundCorners);
      //Assign unique clip path id
      var cp = new DvtClipPath("pacp" + gauge.getId() + i);
      // For each threshold clip everything above the particular threshold maximum from the plot area shape
      if(currentThresholdIndex == thresholds.length - 1)
        cp.addRect(0, 0, bounds.w + 2, plotY2 - plotY1 + 2, 0, 0);
      else
      {
        if(isBIDI)
          cp.addRect(0, 0, (data['maxValue']-thresholds[thresholds.length - 2 - currentThresholdIndex]['maxValue']) * 1 / (Math.abs(baseline - data['maxValue'])) * bounds.w, plotY2 - plotY1 + 2, 0, 0);
        else
          cp.addRect(0, 0, (thresholds[currentThresholdIndex]['maxValue']) * 1 / (Math.abs(baseline - data['maxValue'])) * bounds.w, plotY2 - plotY1 + 2, 0, 0);
      }
      plotArea.setClipPath(cp);

      // Color threshold with defined color, or use the color ramp if possible
      if(isBIDI)
        currentTresholdIndex=thresholds.length - 1-i;
      plotArea.setFill(new DvtSolidFill(DvtGaugeStyleUtils.getThresholdColor(thresholds[currentThresholdIndex],currentThresholdIndex)));
      plotArea.setStroke(new DvtSolidStroke(plotAreaBorderColor));
      DvtStatusMeterGaugeRenderer._renderPlotAreaVisualEffects(gauge, container, plotArea, DvtGaugeStyleUtils.getThresholdColor(thresholds[currentThresholdIndex],currentThresholdIndex));
    }
  }
  else if(!(options['plotArea']['rendered']=="off") && 
  !((options['plotArea']['rendered']=="auto") && (options['thresholdDisplay'] == "onIndicator")) &&
  options['thresholdDisplay'] != "all") {
    var plotArea = DvtStatusMeterGaugeRenderer._createShape(gauge.getContext(),  axisInfo.getUnboundedCoordAt(data['minValue']),  axisInfo.getUnboundedCoordAt(data['maxValue']), plotY1, plotY2, roundCorners);
    var plotAreaColor = DvtGaugeStyleUtils.getPlotAreaColor(gauge);
    plotArea.setFill(new DvtSolidFill(plotAreaColor));
    plotArea.setStroke(new DvtSolidStroke(plotAreaBorderColor));
    DvtStatusMeterGaugeRenderer._renderPlotAreaVisualEffects(gauge, container, plotArea, plotAreaColor);
  }

  // Create the shapes    
  if(options['plotArea']['rendered']!="off" &&
  !((options['plotArea']['rendered']=="auto") && (options['thresholdDisplay'] == "onIndicator"))) 
    baselineCoord=axisInfo.getUnboundedCoordAt(data['minValue']);
  var shape = DvtStatusMeterGaugeRenderer._createShape(gauge.getContext(), baselineCoord, endCoord, indicatorY1, indicatorY2, true);
  gauge.__shapes.push(shape);
  
  // Apply style properties
  var color = DvtGaugeStyleUtils.getColor(gauge);
  shape.setFill(new DvtSolidFill(color));
  if(borderColor)
    shape.setStroke(new DvtSolidStroke(borderColor));

  // Add the shape  
  if(bRender)
    container.addChild(shape);
  
  // Render the visual effects
  var overlay = DvtStatusMeterGaugeRenderer._createShape(gauge.getContext(), baselineCoord, endCoord, indicatorY1, indicatorY2, true);
  DvtStatusMeterGaugeRenderer._renderVisualEffects(gauge, container, overlay, bRender);

  // Render referenceObjects
  var referenceObjects = data ? data['referenceObjects'] : null; 
  if(referenceObjects)
  {
    for(var i=0; i<referenceObjects.length; i++) {
      var color = referenceObjects[i]['color'] ? referenceObjects[i]['color'] : "black";
      var value = referenceObjects[i]['value'];
      var indicatorHeight = options['indicatorSize'];
      var referenceLineHeight = ((1 - indicatorHeight) / 2 +indicatorHeight)* bounds.h
      var referenceLine = new DvtRect(gauge.getContext(), axisInfo.getUnboundedCoordAt(value)-1, bounds.y+((1 - indicatorHeight) / 4) * bounds.h, 2, referenceLineHeight);
      referenceLine.setFill(new DvtSolidFill(color)); 
      container.addChild(referenceLine);
      
      // Shadowing effect
      var shadowRGBA = DvtColorUtils.makeRGBA(0,0,0,0.8);
      var shadow = new DvtShadow(shadowRGBA, 0.75, 3, 3, 50, 1, 2, false, false , false);
      container.addChild(referenceLine);
      referenceLine.addDrawEffect(shadow);
    }
  } 
  
  // Tooltip and Editable Support: Draw a shape containing the entire axis area
  var axisArea = new DvtRect(gauge.getContext(), bounds.x, bounds.y, bounds.w, bounds.h);
  axisArea.setFill(new DvtSolidFill("#000000", 0.001)); // set to invisible
  container.addChild(axisArea);
  
  var tooltip = data['shortDesc'] ? data['shortDesc'] : data['tooltip'];
  if(tooltip || gauge.__getOptions()['readOnly'] === false)
    gauge.__getEventManager().associate(axisArea, new DvtSimpleObjPeer(null, tooltip, color));
}

/**
 * Creates and returns the shape for the statusmeter.
 * @param {DvtContext} context
 * @param {number} baselineCoord
 * @param {number} endCoord
 * @param {number} y1
 * @param {number} y2
 * @param {Boolean} roundCorners
 * @return {DvtShape}
 */
DvtStatusMeterGaugeRenderer._createShape = function(context, baselineCoord, endCoord, y1, y2, roundCorners) {
  return new DvtStatusMeterGaugeIndicator(context, baselineCoord, endCoord, y1, y2, roundCorners);
}

/**
 * Renders the visual effects for the shape into the specified area.
 * @param {DvtLedGauge} gauge The gauge being rendered.
 * @param {DvtContainer} container The container to render into.
 * @param {DvtShape} shape The shape to use for the visual effects.
 * @param {boolean} bRender True if the shape should be rendered at this time.
 */
DvtStatusMeterGaugeRenderer._renderVisualEffects = function(gauge, container, shape, bRender) {
  var options = gauge.__getOptions();
  
  if(options['visualEffects'] == "none")
    return;

  // Overlay Shape
  shape.setMouseEnabled(false);
  if(bRender)
    container.addChild(shape);
  
  // Gradient
  var arColors = ["#FFFFFF", "#FFFFFF", "#FFFFFF"];
  var arAlphas = [0.5, 0.3125, 0];
  var arStops = [0, 0.3, 1.0];
  var gradient = new DvtLinearGradientFill(270, arColors, arAlphas, arStops);
  shape.setFill(gradient);
  gauge.__shapes.push(shape);
}

/**
 * Renders the visual effects for the plot area.
 * @param {DvtLedGauge} gauge The gauge being rendered.
 * @param {DvtContainer} container The container to render into.
 * @param {DvtShape} shape The plot area.
 */
DvtStatusMeterGaugeRenderer._renderPlotAreaVisualEffects = function(gauge, container, shape, color) {
  shape.setMouseEnabled(false);
  container.addChild(shape);
  
  // Gradient
  var arColors = [DvtColorUtils.getDarker(color, .9), color, DvtColorUtils.getBrighter(color, .7)];
  var arAlphas = [1, 1, 1];
  var arStops = [0, 0.04, 0.73];
  var gradient = new DvtLinearGradientFill(270, arColors, arAlphas, arStops);
  shape.setFill(gradient);
}

/**
 * Renders the label into the specified area.  Updates the bounds after rendering to reserve space
 * for the labels.
 * @param {DvtLedGauge} gauge The gauge being rendered.
 * @param {DvtContainer} container The container to render into.
 * @param {DvtRectangle} bounds The available bounds for rendering.
 */
DvtStatusMeterGaugeRenderer._renderLabel = function(gauge, container, bounds) {
  var data = gauge.__getData();
  var options = gauge.__getOptions();
  var isBIDI = DvtStyleUtils.isLocaleR2L();

  // Allocate space for the label
  if(options['metricLabel']['rendered']) 
  {
    var labelGap = options['__layout']['labelGap'];
    var minLabelDims;
    var maxLabelDims;
    var alignCoord; // the alignment point for the label
  
    // Allocate space to the right for positive values and any values with plotArea
    if(data['maxValue'] > 0|| options['plotArea']['rendered']!="off"||
    !((options['plotArea']['rendered']=="auto") && (options['thresholdDisplay'] == "onIndicator"))) {
      var bound=data['maxValue'] > 0 ? data['maxValue'] :data['minValue'];  
      var maxValue = DvtGaugeRenderer.formatLabelValue(bound, gauge);
      var maxLabel = new DvtText(gauge.getContext(), maxValue);
      maxLabel.setCSSStyle(new DvtCSSStyle(options['metricLabel']['labelStyle']));
      container.addChild(maxLabel);
      maxLabelDims = maxLabel.getDimensions();
      container.removeChild(maxLabel);
      
      // Align the label
        alignCoord = isBIDI ? bounds.x + maxLabelDims.w: bounds.x + bounds.w;
        labelSpace = maxLabelDims.w;
      
      // Update the allocated space
      if(isBIDI) { // Allocate to the left
        bounds.x += (maxLabelDims.w + labelGap);
        bounds.w -= (maxLabelDims.w + labelGap);
      }
      else // Allocate to the right
        bounds.w -= (maxLabelDims.w + labelGap);
    } 
    
    // Allocate space to the left for negative values
    if(data['minValue'] < 0 && !options['plotArea']['rendered']) {
      var minValue = DvtGaugeRenderer.formatLabelValue(data['minValue'], gauge);
      var minLabel = new DvtText(gauge.getContext(), minValue);
      minLabel.setCSSStyle(new DvtCSSStyle(options['metricLabel']['labelStyle']));
      container.addChild(minLabel);
      minLabelDims = minLabel.getDimensions();
      container.removeChild(minLabel);
      
      // Align the label
      if(data['value'] < 0 || data['maxValue'] <= 0) {
        alignCoord = isBIDI ? bounds.x + bounds.w: bounds.x + minLabelDims.w;
        labelSpace = minLabelDims.w; 
      }
      
      // Update the allocated space
      if(isBIDI)  // Allocate to the right
        bounds.w -= (minLabelDims.w + labelGap);
      else { // Allocate to the left
        bounds.x += (minLabelDims.w + labelGap);
        bounds.w -= (minLabelDims.w + labelGap);
      }
    }
    
    // Create and position the text
    var value = DvtGaugeRenderer.formatLabelValue(data['value'], gauge);
    var labelString = String(value);
    var label = new DvtText(gauge.getContext(), labelString, alignCoord, bounds.y + bounds.h/2);
    label.setCSSStyle(new DvtCSSStyle(options['metricLabel']['labelStyle']));
    label.alignCenter();
    
    // Align the text to the end
    var agent = DvtAgent.getAgent();
    if (agent.isGecko() || !DvtStyleUtils.isLocaleR2L())
      label.alignEnd();
    else 
      label.alignStart();

    
    // Truncate if needed, null is returned if the label doesn't fit
    label = label.truncateToSpace(container, labelSpace, bounds.h);
    if(label) {
      // Show tooltip for truncated text
      if(label.getTextString() != labelString)
        gauge.__getEventManager().associate(label, new DvtSimpleObjPeer(labelString));
        
      // Add to display list
      container.addChild(label);
    }
  }
}

// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 

/**
 * Indicator for DvtStatusMeterGauge.
 * @class
 * @constructor
 * @extends {DvtRect}
 */
 DvtStatusMeterGaugeIndicator = function(context, baselineCoord, endCoord, y1, y2, roundCorners) {
  this.Init(context, baselineCoord, endCoord, y1, y2, roundCorners);
}

DvtObj.createSubclass(DvtStatusMeterGaugeIndicator, DvtRect, "DvtStatusMeterGaugeIndicator");

/** @private **/
DvtStatusMeterGaugeIndicator._CORNER_RADIUS_SIZE = 0.25;  // factor of the height
DvtStatusMeterGaugeIndicator._MIN_CORNER_RADIUS = 2.5;


/**
 * Initializes the component.
 * @param {DvtContext} context The rendering context
 * @param {number} baselineCoord
 * @param {number} endCoord
 * @param {number} y1
 * @param {number} y2
 * @param {Boolean} roundCorners
 * @protected
 */
DvtStatusMeterGaugeIndicator.prototype.Init = function(context, baselineCoord, endCoord, y1, y2, roundCorners) {
  DvtStatusMeterGaugeIndicator.superclass.Init.call(this, context);
  
  // Set the coordinates of the shape based on the params
  this.setCoords(baselineCoord, endCoord, y1, y2, roundCorners);
}

/**
 * Specifies the coordinates for the indicator.
 * @param {number} baselineCoord
 * @param {number} endCoord
 * @param {number} y1
 * @param {number} y2
 * @param {Boolean} roundCorners
 */
DvtStatusMeterGaugeIndicator.prototype.setCoords = function(baselineCoord, endCoord, y1, y2, roundCorners) {
  // Store these params
  this._baselineCoord = baselineCoord;
  this._endCoord = endCoord;
  this._y1 = y1;
  this._y2 = y2;

  // Convert into rectangle coordinates and set
  var x = Math.min(baselineCoord, endCoord);
  var y = y1;
  var width = Math.abs(baselineCoord - endCoord);
  var height = y2 - y1;
  this.setRect(x, y, width, height);
  
  // Apply rounded corners
  if(roundCorners){
    var radius = height * DvtStatusMeterGaugeIndicator._CORNER_RADIUS_SIZE;
    if(radius >= DvtStatusMeterGaugeIndicator._MIN_CORNER_RADIUS)
      this.setCornerRadius(radius, radius);
  }
}

/**
 * Animation support.
 * @return {array}
 */
DvtStatusMeterGaugeIndicator.prototype.getAnimationParams = function() {
  return [this._baselineCoord, this._endCoord, this._y1, this._y2];
}

/**
 * Animation support.
 * @param {array} params
 */
DvtStatusMeterGaugeIndicator.prototype.setAnimationParams = function(params) {
  if(params && params.length == 4) 
    this.setCoords(params[0], params[1], params[2], params[3]);
}
// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 

/**
 * Dial Gauge component.  This class should never be instantiated directly.  Use the
 * newInstance function instead.
 * @class
 * @constructor
 * @extends {DvtGauge}
 * @export
 */
var DvtDialGauge = function() {}

DvtObj.createSubclass(DvtDialGauge, DvtGauge, "DvtDialGauge");

/**
 * Returns a new instance of DvtDialGauge.
 * @param {DvtContext} context The rendering context.
 * @param {string} callback The function that should be called to dispatch component events.
 * @param {object} callbackObj The optional object instance on which the callback function is defined.
 * @param {object} options The object containing options specifications for this component.
 * @return {DvtDialGauge}
 * @export
 */
DvtDialGauge.newInstance = function(context, callback, callbackObj, options) {
  var gauge = new DvtDialGauge();
  gauge.Init(context, callback, callbackObj, options);
  return gauge;
}

/**
 * @override
 */
DvtDialGauge.prototype.Init = function(context, callback, callbackObj, options) {
  DvtDialGauge.superclass.Init.call(this, context, callback, callbackObj, options);
  
  /**
   * The anchor point of the indicator on the gauge. This will be set during render time and is used for editing support.
   * @type {DvtPoint}
   */
  this.__anchorPt = null;
}

/**
 * @override
 * @export
 */
DvtDialGauge.prototype.setOptions = function(options) {
  // Combine the user options with the defaults and store
  DvtDialGauge.superclass.setOptions.call(this, DvtDialGaugeDefaults.calcOptions(options));
}

/**
 * @override
 */
DvtDialGauge.prototype.Render = function(container, width, height) 
{  
  DvtDialGaugeRenderer.render(this, container, width, height);
}

/**
 * @override
 */
DvtDialGauge.prototype.CreateAnimationOnDisplay = function(objs, animationType, animationDuration) {
  // The only object in objs will be a DvtDialGaugeIndicator
  var animatedObjs = [];
  for (var i=0; i<objs.length; i++) {
    var obj = objs[i];
    var endState = obj.getAnimationParams();
    
    // Set the initial state, which is the start angle
    var startAngle = DvtDialGaugeRenderer.__getStartAngle(this)
    obj.setAngle(startAngle);
    
    // Create the animation
    var animation = new DvtCustomAnimation(this.getContext(), obj, animationDuration);
    animation.getAnimator().addProp(DvtAnimator.TYPE_NUMBER_ARRAY, obj, obj.getAnimationParams, obj.setAnimationParams, endState);
    animation.getAnimator().setEasing(function(progress) {return DvtEasing.backOut(progress, 0.7);});
    animatedObjs.push(animation);
  }
  return new DvtParallelPlayable(this.getContext(), animatedObjs);
}

/**
 * @override
 */
DvtDialGauge.prototype.GetValueAt = function(x, y) {
  var angleRads = Math.atan2(y - this.__anchorPt.y, x - this.__anchorPt.x); 
  var angle = DvtMath.radsToDegrees(angleRads);
  if(angle <= 0) // adjust to (0, 360]
    angle += 360;
  
  // Calculate the start angle and extent
  var isBidi = DvtStyleUtils.isLocaleR2L();
  var backgroundOptions = this.Options['background'];
  var startAngle = isBidi ? 180+backgroundOptions['startAngle'] : 360-backgroundOptions['startAngle'];
  var angleExtent = backgroundOptions['angleExtent'];  
  var endAngle = startAngle + angleExtent;
  
  // Adjust for BIDI
  if(isBidi) {
    endAngle = startAngle;
    startAngle = startAngle - angleExtent;
    while(startAngle < 0) {
      startAngle += 360;
      endAngle += 360;
    }
  }
  
  // Normalize the angles.  At this point: 
  // start angle is between [0, 360)
  // input angle is between (0, 360]
  // end angle is between (0 and 720)
  if(angle + 360 >= startAngle && angle + 360 <= endAngle) {
    // Angle is between the start and endAngle, where angle and endAngle > 360
    angle += 360;
  }
  else if(!(angle >= startAngle && angle <= endAngle)) 
  {
    // Input angle is not between the start and end
    if(angle > endAngle)
      angle = (startAngle + 360 - angle < angle - endAngle) ? startAngle : endAngle;
    else 
      angle = (startAngle - angle < angle + 360 - endAngle) ? startAngle : endAngle;
  }
 
  // Calculate and adjust ratio to keep in bounds
  var ratio = (angle - startAngle)/angleExtent;
  if(isBidi) // flip for BIDI, since we flipped the start and end
    ratio = 1 - ratio;
  
  var minValue = this.Data['minValue'];
  var maxValue = this.Data['maxValue'];
  var value = (ratio * (maxValue-minValue)) + minValue;
  return value;
}
/**
 * Default values and utility functions for component versioning.
 * @class
 */
var DvtDialGaugeDefaults = new Object();

DvtObj.createSubclass(DvtDialGaugeDefaults, DvtObj, "DvtDialGaugeDefaults");

/**
 * Defaults for version 1.
 */ 
DvtDialGaugeDefaults.VERSION_1 = {
  background: {'startAngle': 180, 'angleExtent': 180, 'indicatorLength': 0.7},
  indicator: {}
};

/**
 * Combines the user options with the defaults for the specified version.  Returns the
 * combined options object.  This object will contain internal attribute values and
 * should be accessed in internal code only.
 * @param {object} userOptions The object containing options specifications for this component.
 * @return {object} The combined options object.
 */
DvtDialGaugeDefaults.calcOptions = function(userOptions) {
  var defaults = DvtDialGaugeDefaults._getDefaults(userOptions);

  // Use defaults if no overrides specified
  if(!userOptions)
    return defaults;
  else // Merge the options object with the defaults
    return DvtJSONUtils.merge(userOptions, defaults);
}

/**
 * Returns the default options object for the specified version of the component.
 * @param {object} userOptions The object containing options specifications for this component.
 * @return {object} The default options object for the component.
 * @private
 */
DvtDialGaugeDefaults._getDefaults = function(userOptions) {
  // Note: Version checking will eventually get added here
  // Note: Future defaults objects are deltas on top of previous objects
  
  // The base class defaults are combined with the defaults from this class
  var baseDefaults = DvtGaugeDefaults.getDefaults(userOptions);
  var defaults = DvtJSONUtils.clone(DvtDialGaugeDefaults.VERSION_1)
  return DvtJSONUtils.merge(defaults, baseDefaults);
}
/**
 * Renderer for DvtDialGauge.
 * @class
 */
var DvtDialGaugeRenderer = new Object();

DvtObj.createSubclass(DvtDialGaugeRenderer, DvtObj, "DvtDialGaugeRenderer");

/**
 * Renders the gauge in the specified area.
 * @param {DvtDialGauge} gauge The gauge being rendered.
 * @param {DvtContainer} container The container to render into.
 * @param {number} width The width of the component.
 * @param {number} height The height of the component.
 */
DvtDialGaugeRenderer.render = function(gauge, container, width, height) {
  if(DvtGaugeDataUtils.hasData(gauge)) {
    // Create the bounds.  No outer gap is allocated to retain image fidelity.
    var bounds = new DvtRectangle(0, 0, width, height);

    // Render the bar
    DvtDialGaugeRenderer._renderShape(gauge, container, bounds);

    // Render the label
    DvtDialGaugeRenderer._renderLabel(gauge, container, bounds);
  }
  else // Render the empty text
    DvtGaugeRenderer.renderEmptyText(gauge, container, new DvtRectangle(0, 0, width, height));
}

/**
 * Renders the led shape into the specified area.
 * @param {DvtDialGauge} gauge The gauge being rendered.
 * @param {DvtContainer} container The container to render into.
 * @param {DvtRectangle} bounds The available bounds for rendering.
 */
DvtDialGaugeRenderer._renderShape = function(gauge, container, bounds) {
  var data = gauge.__getData();
  var options = gauge.__getOptions();
  
  // Create the background
  var background = DvtDialGaugeRenderer._createBackground(gauge, bounds);
  container.addChild(background);
  
  //Add Tick Labels if needed
  if(options['background']['majorTickCount'] && options['background']['radius'])
    DvtDialGaugeRenderer._renderTickLabels(gauge, container, bounds);
  
  // Create the indicator
  var indicator = DvtDialGaugeRenderer._createIndicator(gauge, bounds);
  
  // Create containers to separate the transforms so they can be adjusted later
  var translateContainer = new DvtContainer(gauge.getContext());
  var rotateContainer = new DvtDialGaugeIndicator(gauge.getContext());
  container.addChild(translateContainer);
  translateContainer.addChild(rotateContainer);
  rotateContainer.addChild(indicator);
  
  // Calculate the anchor points and the rotation
  var indicatorBounds = indicator.getDimensions();
  var angleRads = DvtDialGaugeRenderer._getRotation(gauge, data['value']);
  var backgroundAnchor = DvtDialGaugeRenderer._getBackgroundAnchorPoint(gauge, bounds);
  var indicatorAnchor = DvtDialGaugeRenderer._getIndicatorAnchorPoint(gauge, bounds, indicatorBounds);
  var scale = DvtDialGaugeRenderer._getIndicatorScaleFactor(gauge, bounds, indicatorBounds);
  
  // Apply the transformations to correctly position the indicator
  // 1. Translate the indicator so that the anchor point is at the origin
  var mat = new DvtMatrix(gauge.getContext());
  mat.translate(-indicatorAnchor.x, -indicatorAnchor.y);
  mat.scale(scale, scale);
  indicator.setMatrix(mat);
  
  // 2. Rotate the indicator
  rotateContainer.setAngle(angleRads);
  
  // 3. Translate to the anchor point on the background 
  mat = new DvtMatrix(gauge.getContext());
  mat.translate(backgroundAnchor.x, backgroundAnchor.y);
  translateContainer.setMatrix(mat);
  
  // Add the DvtDialGaugeIndicator for rotation support
  gauge.__shapes.push(rotateContainer);
    
  // Tooltip Support
  var tooltip = data['shortDesc'] ? data['shortDesc'] : data['tooltip'];
  if(tooltip || gauge.__getOptions()['readOnly'] === false)
    gauge.__getEventManager().associate(container, new DvtSimpleObjPeer(null, tooltip));
    
  // Store the axisInfo on the gauge for editing support
  gauge.__anchorPt = backgroundAnchor;
}

/**
 * Creates and returns the background.
 * @param {DvtDialGauge} gauge The gauge being rendered.
 * @param {DvtRectangle} bounds The available bounds for rendering.
 * @retun {DvtDisplayable}
 */
DvtDialGaugeRenderer._createBackground = function(gauge, bounds) {
  var backgroundOptions = gauge.__getOptions()['background'];
  var isBidi = DvtStyleUtils.isLocaleR2L();
  
  // Calculate the required resolution needed.  This check isn't ideal, but it's close enough for now.
  var isTouchDevice = DvtAgent.getAgent().isTouchDevice();
  var widthRes = isTouchDevice ? 2*bounds.w : bounds.w;
  var heightRes = isTouchDevice ? 2*bounds.h : bounds.h;
  
  // Use the images from the list provided
  var images = backgroundOptions['images'];
  if(images && images.length > 0) {
    var i;
    var refWidth;
    var refHeight;
  
    // Filter the list to images matching the locale type (bidi or not)
    var locImages = [];
    for(i=0; i<images.length; i++) {
      if(isBidi && images[i]['bidi'] === true) 
        locImages.push(images[i]);
      else if(!isBidi && images[i]['bidi'] !== true)
        locImages.push(images[i]);
    }
    images = locImages.length > 0 ? locImages : images; // Use all images if none match the bidi flag
    
    // Iterate and use the first image with enough detail
    for(i=0; i<images.length; i++) {
      var image = images[i];
      var source = image['source'];
      var width = image['width'];
      var height = image['height'];
      var isSvg = (source && source.search(".svg") > -1);
      
      // Store the size of the first image as the reference size
      if(i == 0) {
        refWidth = width;
        refHeight = height;
      }
      
      // Use the image if it's SVG, a PNG whose size > resolution, or the last image provided.
      if(isSvg || (width >= widthRes && height >= heightRes) || i == images.length-1) {
        var shape = new DvtImage(gauge.getContext(), source, 0, 0, width, height); 
        
        // Scale and translate to center
        var matrix = new DvtMatrix(gauge.getContext());
        var scale = Math.min(bounds.w/width, bounds.h/height);
        var tx = (bounds.w - scale*width)/2;
        var ty = (bounds.h - scale*height)/2;
        matrix.scale(scale, scale);
        matrix.translate(tx, ty);
        shape.setMatrix(matrix);
        // Scale radius of tick labels based on reference image size
        var radiusScale=Math.min(bounds.w/refWidth, bounds.h/refHeight);
        backgroundOptions['_radius'] = backgroundOptions['radius'] * radiusScale;     
      
        // Create an image loader to set the width and height of the image after loads.  This is 
        // needed to correctly load svg images in webkit.
        if(isSvg && DvtAgent.getAgent().isWebkit()) {
          var imageDims = DvtImageLoader.loadImage(gauge.getContext(), source, DvtObj.createCallback(shape, shape.__setDimensions));
          if(imageDims) 
            shape.__setDimensions(imageDims);
        }
        
        // Adjust the bounds for the space used
        bounds.x += tx;
        bounds.y += ty;
        bounds.w = scale * width;
        bounds.h = scale * height;
        
        // Adjust the anchor for the bounds
        if(!isNaN(backgroundOptions['anchorX']) && !isNaN(backgroundOptions['anchorY'])) {
          // Store in private fields to avoid modifying the app provided copies
          backgroundOptions['_anchorX'] = isBidi ? bounds.x + bounds.w - bounds.w * backgroundOptions['anchorX']/refWidth : bounds.x + bounds.w * backgroundOptions['anchorX']/refWidth;
          backgroundOptions['_anchorY'] = bounds.y + bounds.h * backgroundOptions['anchorY']/refHeight;
        }
        
        // Adjust the metric label bounds
        if(backgroundOptions['metricLabelBounds']) {
          var metLblBounds = {};
          metLblBounds['width'] = bounds.w * backgroundOptions['metricLabelBounds']['width']/refWidth;
          metLblBounds['height'] = bounds.h * backgroundOptions['metricLabelBounds']['height']/refHeight;
          metLblBounds['y'] = bounds.y + bounds.h * backgroundOptions['metricLabelBounds']['y']/refHeight;
          if(isBidi)
            metLblBounds['x'] = bounds.x + bounds.w - bounds.w * backgroundOptions['metricLabelBounds']['x']/refWidth - metLblBounds['width'];
          else
            metLblBounds['x'] = bounds.x + bounds.w * backgroundOptions['metricLabelBounds']['x']/refWidth;
            
          backgroundOptions['_metricLabelBounds'] = metLblBounds;
          
          // Helper for integration of new custom gauges, comment out when not using
          /*var metBounds = new DvtRect(gauge.getContext(), metLblBounds['x'], metLblBounds['y'], metLblBounds['width'], metLblBounds['height']);
          metBounds.setFill(new DvtSolidFill("#0000FF", 0.3));
          gauge.addChild(metBounds);*/
        }
        
        return shape;
      }
    }
  }
  return null;
}

/**
 * Creates and returns the indicator.
 * @param {DvtDialGauge} gauge The gauge being rendered.
 * @param {DvtRectangle} bounds The available bounds for rendering.
 * @return {DvtDisplayable}
 */
DvtDialGaugeRenderer._createIndicator = function(gauge, bounds) {
  var indicatorOptions = gauge.__getOptions()['indicator'];
  var indicatorLength = DvtDialGaugeRenderer._getIndicatorLength(gauge, bounds);
  
  // Calculate the required resolution needed.  This check isn't ideal, but it's close enough for now.
  var heightRes = DvtAgent.getAgent().isTouchDevice() ? 2*indicatorLength : indicatorLength;
  
  // Iterate and use the first image with enough detail
  var refWidth;
  var refHeight;
  var images = indicatorOptions['images'];
  if(images && images.length > 0) {
    for(var i=0; i<images.length; i++) {
      var image = images[i];
      var source = image['source'];
      var width = image['width'];
      var height = image['height'];
      var isSvg = (source && source.search(".svg") > -1);
      
      // Store the size of the first image as the reference size
      if(i == 0) {
        refWidth = width;
        refHeight = height;
      }
      
      // Use the image if it's SVG, a PNG whose height > indicatorLength, or the last image provided.
      if(isSvg || height >= heightRes || i == images.length-1) {
        var shape = new DvtImage(gauge.getContext(), source, 0, 0, width, height);
        
        // Create an image loader to set the width and height of the image after loads.  This is 
        // needed to correctly load svg images in webkit.
        if(isSvg && DvtAgent.getAgent().isWebkit()) {
          var imageDims = DvtImageLoader.loadImage(gauge.getContext(), source, DvtObj.createCallback(shape, shape.__setDimensions));
          if(imageDims) {
            // Once the image is initially loaded, ping it with the given size.  This is needed to get the
            // browser to correctly render the SVG.  The returned size from imageDims may not be correct
            // for SVG, so use the specified size instead.
            shape.setWidth(width);
            shape.setHeight(height);
          }
        }
       
        // Adjust the anchor for the image used
        if(!isNaN(indicatorOptions['anchorX']) && !isNaN(indicatorOptions['anchorY'])) {
          // Store in private fields to avoid modifying the app provided copies
          indicatorOptions['_anchorX'] = indicatorOptions['anchorX'] * width/refWidth;
          indicatorOptions['_anchorY'] = indicatorOptions['anchorY'] * height/refHeight;
        }
      
        // Return the image
        return shape;
      }
    }
  }
  return null;
}

/**
 * Returns the rotation angle for the start angle in radians.
 * @param {DvtDialGauge} gauge The gauge being rendered.
 * @return {Number}
 */
DvtDialGaugeRenderer.__getStartAngle = function(gauge) {
  var backgroundOptions = gauge.__getOptions()['background'];
  var isBidi = DvtStyleUtils.isLocaleR2L();
  var startAngle = isBidi ? 180-backgroundOptions['startAngle'] : backgroundOptions['startAngle'];
  return Math.PI * (90 - startAngle)/180;
}

/**
 * Returns the rotation angle of the indicator in radians.
 * @param {DvtDialGauge} gauge The gauge being rendered.
 * @param {Number} value The value to be rotated to
 * @return {Number}
 */
DvtDialGaugeRenderer._getRotation = function(gauge, value) {
  var data = gauge.__getData();
  var backgroundOptions = gauge.__getOptions()['background'];
  
  // Calculate the value as a ratio between the min and max
  var minValue = data['minValue'];
  var maxValue = data['maxValue'];
  value = Math.max(Math.min(value, maxValue), minValue);
  var ratio = (value - minValue)/(maxValue - minValue);
  
  // Calculate the start angle and extent
  var isBidi = DvtStyleUtils.isLocaleR2L();
  var startAngle = isBidi ? 180-backgroundOptions['startAngle'] : backgroundOptions['startAngle'];
  var angleExtent = isBidi ? -backgroundOptions['angleExtent'] : backgroundOptions['angleExtent'];
  
  // Convert to angles and return in radians
  var angleDegrees = startAngle - (ratio * angleExtent);
  return Math.PI * (90 - angleDegrees)/180;
}

/**
 * Returns the anchor point for the indicator on the background relative to the rendering bounds.
 * @param {DvtDialGauge} gauge The gauge being rendered.
 * @param {DvtRectangle} bounds The available bounds for rendering.
 * @return {DvtPoint}
 */
DvtDialGaugeRenderer._getBackgroundAnchorPoint = function(gauge, bounds) {
  var backgroundOptions = gauge.__getOptions()['background'];
  var anchorX = backgroundOptions['_anchorX'];
  var anchorY = backgroundOptions['_anchorY'];
  
  if(!isNaN(anchorX) && !isNaN(anchorY)) // private fields are calculated earlier and already scaled
    return new DvtPoint(anchorX, anchorY);
  else // default to center
    return new DvtPoint(bounds.x + bounds.w/2, bounds.y + bounds.h/2);
}

/**
 * Returns the length of the indicator.
 * @param {DvtDialGauge} gauge The gauge being rendered.
 * @param {DvtRectangle} bounds The available bounds for rendering.
 * @return {Number} The length of the indicator.
 */
DvtDialGaugeRenderer._getIndicatorLength = function(gauge, bounds) {
  var radius = Math.min(bounds.w, bounds.h)/2;
  return gauge.__getOptions()['background']['indicatorLength'] * radius;
}

/**
 * Returns the anchor point of the indicator relative to the indicator image.
 * @param {DvtDialGauge} gauge The gauge being rendered.
 * @param {DvtRectangle} bounds The available bounds for rendering.
 * @param {DvtRectangle} indicatorBounds The bounds for the indicator.
 * @return {DvtPoint}
 */
DvtDialGaugeRenderer._getIndicatorAnchorPoint = function(gauge, bounds, indicatorBounds) {
  var indicatorOptions = gauge.__getOptions()['indicator'];
  var anchorX = indicatorOptions['_anchorX'];
  var anchorY = indicatorOptions['_anchorY']; 
  
  if(!isNaN(anchorX) && !isNaN(anchorY)) 
    return new DvtPoint(anchorX, anchorY); // already adjusted for image size
  else // default to center of the bottom edge
    return new DvtPoint(indicatorBounds.x + indicatorBounds.w/2, indicatorBounds.y + indicatorBounds.h);
}

/**
 * Returns the scaling transform value for the indicator.
 * @param {DvtDialGauge} gauge The gauge being rendered.
 * @param {DvtRectangle} bounds The available bounds for rendering.
 * @param {DvtRectangle} indicatorBounds The bounds for the indicator.
 * @return {Number}
 */
DvtDialGaugeRenderer._getIndicatorScaleFactor = function(gauge, bounds, indicatorBounds) {
  var indicatorLength = DvtDialGaugeRenderer._getIndicatorLength(gauge, bounds);
  return indicatorLength/indicatorBounds.h;
}

/**
 * Renders the label into the specified area.
 * @param {DvtLedGauge} gauge The gauge being rendered.
 * @param {DvtContainer} container The container to render into.
 * @param {DvtRectangle} bounds The available bounds for rendering.
 */
DvtDialGaugeRenderer._renderLabel = function(gauge, container, bounds) {
  var data = gauge.__getData();
  var options = gauge.__getOptions();

  // Create and position the label
  if(options['metricLabel']['rendered']) {
    var value = DvtGaugeRenderer.formatLabelValue(data['value'], gauge);
    var labelString = String(value);
    var cx = bounds.x + bounds.w/2;
    var cy = bounds.y + bounds.h/2;
    var labelWidth = bounds.w;
    var labelHeight = bounds.h;
    
    // Use the metricLabelBounds if specified
    var metricLabelBounds = options['background']['_metricLabelBounds'];
    if(metricLabelBounds) {
      cx = metricLabelBounds['x'] + metricLabelBounds['width']/2;
      cy = metricLabelBounds['y'] + metricLabelBounds['height']/2;
      labelWidth = metricLabelBounds['width'];
      labelHeight = metricLabelBounds['height'];
    }
    
    // Create the label and align
    var label = new DvtText(gauge.getContext(), labelString, cx, cy);
    label.setCSSStyle(new DvtCSSStyle(options['metricLabel']['labelStyle']));
    label.alignCenter();
    label.alignMiddle();
    
    // Truncate if needed, null is returned if the label doesn't fit
    label = label.truncateToSpace(container, labelWidth, labelHeight); 
    if(label) {
      // Show tooltip for truncated text
      if(label.getTextString() != labelString)
        gauge.__getEventManager().associate(label, new DvtSimpleObjPeer(labelString));
        
      // Add to display list
      container.addChild(label);
    }
  }
}

/**
 * Renders the tick labels into the specified area.
 * @param {DvtLedGauge} gauge The gauge being rendered.
 * @param {DvtContainer} container The container to render into.
 * @param {DvtRectangle} bounds The available bounds for rendering.
 * @private
 */
DvtDialGaugeRenderer._renderTickLabels = function(gauge, container, bounds) {
  var data = gauge.__getData();
  var options = gauge.__getOptions();
  var isBidi = DvtStyleUtils.isLocaleR2L();
  // Create and position the label
  if(options['background']['radius'] && options['background']['majorTickCount']) {
    var radius = options['background']['_radius'];
    var minValue = data['minValue'];
    var maxValue = data['maxValue'];
    var majorTickCount=options['background']['majorTickCount'];
    for(var x = 0;x < majorTickCount;x++)
    {
      var labelValue = minValue + Math.abs(maxValue - minValue) * x  / (majorTickCount - 1);
      if(isBidi)
        labelValue = minValue + Math.abs(maxValue - minValue) * (majorTickCount - 1 - x)  / (majorTickCount-1);
        
      var labelString = DvtGaugeRenderer.formatTickLabelValue(labelValue, gauge); 
      var angleRads = DvtDialGaugeRenderer._getRotation(gauge, labelValue);
      var anchor=DvtDialGaugeRenderer._getBackgroundAnchorPoint(gauge, bounds)
      
      var cx = anchor.x + radius * Math.cos(angleRads -  Math.PI/2);
      var cy = anchor.y + radius * Math.sin(angleRads -  Math.PI/2) ;
      
      var labelWidth = bounds.w;
      var labelHeight = bounds.h;

      // Create the label and align
      var label = new DvtText(gauge.getContext(), labelString, cx, cy);
      label.setCSSStyle(new DvtCSSStyle(options['tickLabel']['labelStyle']));
      label.alignCenter();
      label.alignMiddle();
      
      // Truncate if needed, null is returned if the label doesn't fit
      label = label.truncateToSpace(container, labelWidth, labelHeight); 
      if(label) {
        // Show tooltip for truncated text
        if(label.getTextString() != labelString)
          gauge.__getEventManager().associate(label, new DvtSimpleObjPeer(labelString));
          
        // Add to display list
        container.addChild(label);
      }
    }
  }
}
// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 

/**
 * Indicator for DvtDialGauge.
 * @class
 * @constructor
 * @extends {DvtContainer}
 */
var DvtDialGaugeIndicator = function(context) {
  this.Init(context);
}

DvtObj.createSubclass(DvtDialGaugeIndicator, DvtContainer, "DvtDialGaugeIndicator");

/**
 * Specifies the angle for the indicator.
 * @param {number} angleRads The angle of the indicator in radians.
 */
DvtDialGaugeIndicator.prototype.setAngle = function(angleRads) {
  // Use a matrix to prevent the angles from being cumulative
  var mat = new DvtMatrix(this.getContext());
  mat.rotate(angleRads);
  this.setMatrix(mat);
  
  // Store the param
  this._angleRads = angleRads;
}

/**
 * Animation support.
 * @return {array}
 */
DvtDialGaugeIndicator.prototype.getAnimationParams = function() {
  return [this._angleRads];
}

/**
 * Animation support.
 * @param {array} params
 */
DvtDialGaugeIndicator.prototype.setAnimationParams = function(params) {
  if(params && params.length == 1) 
    this.setAngle(params[0]);
}
// Copyright (c) 2008, 2013, Oracle and/or its affiliates. 
// All rights reserved. 

/**
 * Rating Gauge component.  This class should never be instantiated directly.  Use the
 * newInstance function instead.
 * @class
 * @constructor
 * @extends {DvtGauge}
 * @export
 */
var DvtRatingGauge = function() {}

DvtObj.createSubclass(DvtRatingGauge, DvtGauge, "DvtRatingGauge");

/** @private **/
DvtRatingGauge._DEFAULT_MAX_VALUE = 5;
DvtRatingGauge._DEFAULT_MIN_VALUE = 0;

/**
 * Returns a new instance of DvtRatingGauge.
 * @param {DvtContext} context The rendering context.
 * @param {string} callback The function that should be called to dispatch component events.
 * @param {object} callbackObj The optional object instance on which the callback function is defined.
 * @param {object} options The object containing options specifications for this component.
 * @return {DvtRatingGauge}
 * @export
 */
DvtRatingGauge.newInstance = function(context, callback, callbackObj, options) {
  var gauge = new DvtRatingGauge();
  gauge.Init(context, callback, callbackObj, options);
    
  // Create the event handler and add event listeners
  gauge._eventHandler = new DvtRatingGaugeEventManager(gauge);
  gauge._eventHandler.addListeners(gauge);
  
  return gauge;
}

/**
 * @override
 * @export
 */
DvtRatingGauge.prototype.setOptions = function(options) {
  // Combine the user options with the defaults and store
  DvtRatingGauge.superclass.setOptions.call(this, DvtRatingGaugeDefaults.calcOptions(options));
  
}
/**
 * @override
 */
DvtRatingGauge.prototype.render = function(data, width, height) 
{
  // Update if new data has been provided. Clone to avoid modifying the provided object.
  this.Data = data ? DvtJSONUtils.clone(data) : this.Data; 
  if(!this.Data)
    this.Data = {};
    
  // Set default max value if not defined
  if(isNaN(this.Data["maxValue"]))
    this.Data["maxValue"] = DvtRatingGauge._DEFAULT_MAX_VALUE;
  if(isNaN(this.Data["minValue"]))
    this.Data["minValue"] = DvtRatingGauge._DEFAULT_MIN_VALUE;
    
  DvtRatingGauge.superclass.render.call(this, this.Data, width, height);
}

/**
 * @override
 */
DvtRatingGauge.prototype.Render = function(container, width, height) 
{
  var outerGap = this.Options['__layout']['outerGap'];
  var maxValue = this.Data['maxValue'];
  this._size = Math.min(height - 2*outerGap, (width - 2*outerGap)/maxValue);
  this._bounds = new DvtRectangle((this.Width-this._size*maxValue)/2.0, outerGap, this._size*maxValue, this.Height - 2*outerGap);
  // Counter to create different valued cliprects
  this._counter = 0;

  DvtRatingGaugeRenderer.render(this, container, width, height);
}

/**
 * @override
 */
DvtRatingGauge.prototype.GetValueAt = function(x,y){
    
  if (DvtGaugeDataUtils.hasData(this)){
    x = Math.max(Math.min(x, this._bounds.x + this._bounds.w), this._bounds.x);
  
    var incr = this.Options['inputIncrement'];
    // calculating the val depends on locale, but the rounding doesn't
    var val = 0;
    if (!DvtStyleUtils.isLocaleR2L())
      val = Math.max((x-this._bounds.x)/this._size, this.Data["minValue"]);
    else
      val = Math.max((this._bounds.x + this._bounds.w - x)/this._size, this.Data["minValue"]);
      
    if (val < 0.25)
      return 0;
    else if (incr == "half")
      return Math.ceil(val*2)/2.0;
    else
      return Math.ceil(val);
    
  }
  return null;
}

/**
 * Handles the start of a hover event due to mouse over at the specified coordinates.
 * @param {number} x The x coordinate of the value change.
 * @param {number} y The y coordinate of the value change.
 */
DvtRatingGauge.prototype.__processHoverStart = function(x, y) {
  this.__updateClipRects(this.GetValueAt(x, y), "hover");
}

/**
 * Handles the end of a hover event due to mouse out at the specified coordinates.
 * @param {number} x The x coordinate of the value change.
 * @param {number} y The y coordinate of the value change.
 */
 DvtRatingGauge.prototype.__processHoverEnd = function(x, y) {
  this.__updateClipRects(this.Data['value'], "render");
}

/**
 * @override
 */
DvtRatingGauge.prototype.__processValueChangeStart = function(x, y) {
  this.__processHoverStart(x, y);
}

/**
 * @override
 */
DvtRatingGauge.prototype.__processValueChangeMove = function(x, y) {
  this.__updateClipRects(this.GetValueAt(x, y), "hover");
}

/**
 * @override
 */
DvtRatingGauge.prototype.__processValueChangeEnd = function(x, y) {  
  // Render again because a click was registerd
  var oldValue = this.Data['value'];
  this.Data['value'] = this.GetValueAt(x, y);
  this.Data['changed'] = true;
  this.render();

  // Fire the event
  this.__dispatchEvent(new DvtValueChangeEvent(oldValue, this.Data['value']));
}

/**
 * Updates the cliprects used in the rating gauge for hover and the different states.
 * @param {number} value The point at which the clips rects are drawn.
 * @param {string} proc The process being done- "hover" or "render"
 * @param {DvtContainer} container The container that holds this gauge- allowing us to access the three subcontainers with selected/changed, unselected, and hover shapes.
 */
DvtRatingGauge.prototype.__updateClipRects = function(value, proc, container){
  if(!DvtGaugeDataUtils.hasData(this)) 
    return;
    
  if (!container)
    container = this._container;
  
  var isBIDI = DvtStyleUtils.isLocaleR2L();
  
  // which  to show and which to hide based on whether we're hovering or not
  value = Math.max(Math.min(value, this.Data['maxValue']), 0);  //clipping the data value 
  var a = 0;
  var b = value*this._size;
  var c = value*this._size;
  if (proc == "render"){
    a = value*this._size;
    b = 0;
  }
    
  if (!isBIDI){
    // Set the clip rect size.
    var unselContainer = container.getChildAt(0);
    var unselClip = new DvtClipPath("unsel" + this.getId() + this._counter);
    unselClip.addRect(this._bounds.x+c, this._bounds.y, this._bounds.w-c, this._bounds.h);
    unselContainer.setClipPath(unselClip);
      
    var selContainer = container.getChildAt(1);
    var selClip = new DvtClipPath("sel" + this.getId() + this._counter);
    selClip.addRect(this._bounds.x, this._bounds.y,  a, this._bounds.h);
    selContainer.setClipPath(selClip);
      
    var hoverContainer = container.getChildAt(2);
    var hoverClip = new DvtClipPath("hover" + this.getId() + this._counter);
    hoverClip.addRect(this._bounds.x, this._bounds.y, b, this._bounds.h);
    hoverContainer.setClipPath(hoverClip);
  } else {
    // Set the clip rect size.
    var unselContainer = container.getChildAt(0);
    var unselClip = new DvtClipPath("unsel" + this.getId() + this._counter);
    unselClip.addRect(this._bounds.x, this._bounds.y, this._bounds.w-c, this._bounds.h);
    unselContainer.setClipPath(unselClip);
      
    var selContainer = container.getChildAt(1);
    var selClip = new DvtClipPath("sel" + this.getId() + this._counter);
    selClip.addRect(this._bounds.x+this._bounds.w-c, this._bounds.y,  a, this._bounds.h);
    selContainer.setClipPath(selClip);
      
    var hoverContainer = container.getChildAt(2);
    var hoverClip = new DvtClipPath("hover" + this.getId() + this._counter);
    hoverClip.addRect(this._bounds.x+this._bounds.w-c, this._bounds.y, b, this._bounds.h);
    hoverContainer.setClipPath(hoverClip);
  }
    
  // So we just toggle between two clip paths for every container. 
  this._counter = (this._counter + 1) % 2;
}

/**
 * Default values and utility functions for component versioning.
 * @class
 */
var DvtRatingGaugeDefaults = new Object();

DvtObj.createSubclass(DvtRatingGaugeDefaults, DvtObj, "DvtRatingGaugeDefaults");

/**
 * Defaults for version 1.
 */ 
DvtRatingGaugeDefaults.VERSION_1 = {
'unselected': {'shape': "star", 'color': "#F2F2F2", 'borderColor': "#B6B6B6"},
'selected': {'shape': "star", 'color': "#F8C15A", 'borderColor': "#F5A700"},
'hover': {'shape': "star", 'color': "#66A7DA", 'borderColor': "#4A86C5"},
'changed': {'shape': "star", 'color': "#F8C15A", 'borderColor': "#959595"}
};

/**
 * Combines the user options with the defaults for the specified version.  Returns the
 * combined options object.  This object will contain internal attribute values and
 * should be accessed in internal code only.
 * @param {object} userOptions The object containing options specifications for this component.
 * @return {object} The combined options object.
 */
DvtRatingGaugeDefaults.calcOptions = function(userOptions) {
  var defaults = DvtRatingGaugeDefaults._getDefaults(userOptions);

  // Use defaults if no overrides specified
  if(!userOptions)
    return defaults;
  else // Merge the options object with the defaults
    return DvtJSONUtils.merge(userOptions, defaults);
}

/**
 * Returns the default options object for the specified version of the component.
 * @param {object} userOptions The object containing options specifications for this component.
 * @return {object} The default options object for the component.
 * @private
 */
DvtRatingGaugeDefaults._getDefaults = function(userOptions) {
  // Note: Version checking will eventually get added here
  // Note: Future defaults objects are deltas on top of previous objects
  
  // The base class defaults are combined with the defaults from this class
  var baseDefaults = DvtGaugeDefaults.getDefaults(userOptions);
  var defaults = DvtJSONUtils.clone(DvtRatingGaugeDefaults.VERSION_1)
  return DvtJSONUtils.merge(defaults, baseDefaults);
}
/**
 * Event Manager for DvtRatingGauge.
 * @param {DvtGauge} gauge
 * @class
 * @extends DvtEventManager
 * @constructor
 */
var DvtRatingGaugeEventManager = function(gauge) {
  this.Init(gauge.getContext(), gauge.__dispatchEvent, gauge);
  this._gauge = gauge;
  this._bEditing = false;
};

DvtObj.createSubclass(DvtRatingGaugeEventManager, DvtGaugeEventManager, "DvtRatingGaugeEventManager");

/**
 * @override
 */
DvtRatingGaugeEventManager.prototype.OnMouseOver = function(event) {
  // Only editable gauges
  if(this._gauge.__getOptions()['readOnly'] === false) {
    var coords = this.getContext().getRelativePosition(event.pageX, event.pageY);
    this._gauge.__processHoverStart(coords.x, coords.y);
    this._bEditing = true; //this is to continue using the OnMouseMove function as defined 
  }
  
  // Need to call the superclass here to support tooltips during hover. 
  DvtGaugeEventManager.superclass.OnMouseOver.call(this, event);
}

/**
 * @override
 */
DvtRatingGaugeEventManager.prototype.OnMouseOut = function(event) {
  // Only editable gauges
  if(this._gauge.__getOptions()['readOnly'] === false) {
    var coords = this.getContext().getRelativePosition(event.pageX, event.pageY);
    this._gauge.__processHoverEnd(coords.x, coords.y);
  }
  // To dismiss the tooltip if it's showing.
  DvtGaugeEventManager.superclass.OnMouseOut.call(this, event);
}

/**
 * @override
 */
DvtRatingGaugeEventManager.prototype.IsShowingTooltipWhileEditing = function(){
  return true;
}
/**
 * Renderer for DvtRatingGauge.
 * @class
 */
var DvtRatingGaugeRenderer = new Object();

DvtObj.createSubclass(DvtRatingGaugeRenderer, DvtObj, "DvtRatingGaugeRenderer");

/**
 * Renders the gauge in the specified area.
 * @param {DvtRatingGauge} gauge The gauge being rendered.
 * @param {DvtContainer} container The container to render into.
 * @param {number} width The width of the component.
 * @param {number} height The height of the component.
 */
DvtRatingGaugeRenderer.render = function(gauge, container, width, height) {
  if(DvtGaugeDataUtils.hasData(gauge)) {
    // Allocate the bounds for rendering the component
    var options = gauge.__getOptions();
    var data = gauge.__getData();
    var outerGap = options['__layout']['outerGap'];
    var maxValue = data['maxValue'];
    var size = Math.min(height - 2*outerGap, (width - 2*outerGap)/maxValue);
    var bounds = new DvtRectangle((width-size*maxValue)/2.0, outerGap, size*maxValue, height - 2*outerGap);
    
    // Create the options and data objects for the LED gauges
    var unselectedOpts = {'type': options['unselected']['shape'], 'color': options['unselected']['color'], 
                            'borderColor': options['unselected']['borderColor'], 'visualEffects': options['visualEffects']};
    var selectedOpts = {'type': options['selected']['shape'], 'color': options['selected']['color'], 
                            'borderColor': options['selected']['borderColor'], 'visualEffects': options['visualEffects']};
    var changedOpts = {'type': options['changed']['shape'], 'color': options['changed']['color'], 
                            'borderColor': options['changed']['borderColor'], 'visualEffects': options['visualEffects']};
    var hoverOpts = {'type': options['hover']['shape'], 'color': options['hover']['color'], 
                            'borderColor': options['hover']['borderColor'], 'visualEffects': options['visualEffects']};
    var ledData = {'value': 0};
    var unselectedData = {'value': 0};
    if (options['unselected']['shape'] == "dot") {
      unselectedOpts['type'] = "circle";
      unselectedOpts['visualEffects'] = "none";
      unselectedData['size'] = 0.05;
    }
    
    // Create containers for clipping.
    var unselContainer = new DvtContainer(gauge.getContext());
    container.addChild(unselContainer);
    var selContainer = new DvtContainer(gauge.getContext());
    container.addChild(selContainer);
    var hoverContainer = new DvtContainer(gauge.getContext());
    container.addChild(hoverContainer);

    gauge.__updateClipRects(data['value'], "render", container);
    
    for (var i = 0;i < maxValue;i++) {
      // The unselected shapes
      if (options['unselected']['shape']!= 'none'){
        var unselectedLED = DvtLedGauge.newInstance(gauge.getContext(), null, null, unselectedOpts);
        unselContainer.addChild(unselectedLED);
        unselectedLED.setTranslateX(bounds.x + i*size);
        unselectedLED.setTranslateY(bounds.y);
        unselectedLED.render(unselectedData, size, size);
      }
      
      // The selected/changed shapes use the same container and cliprect
      if (data['changed']){
          var changedLED = DvtLedGauge.newInstance(gauge.getContext(), null, null, changedOpts);
          selContainer.addChild(changedLED);
          changedLED.setTranslateX(bounds.x + i*size);
          changedLED.setTranslateY(bounds.y);
          changedLED.render(ledData, size, size);
      }
      else{    
          var selectedLED = DvtLedGauge.newInstance(gauge.getContext(), null, null, selectedOpts);
          selContainer.addChild(selectedLED);
          selectedLED.setTranslateX(bounds.x + i*size);
          selectedLED.setTranslateY(bounds.y);
          selectedLED.render(ledData, size, size);
      }
      // The hover shapes
      var hoverLED = DvtLedGauge.newInstance(gauge.getContext(), null, null, hoverOpts);
      hoverContainer.addChild(hoverLED);
      hoverLED.setTranslateX(bounds.x + i*size);
      hoverLED.setTranslateY(bounds.y);
      hoverLED.render(ledData, size, size);
        
    }
    
    // Overlay rectangle to catch mosue clicks
    var overlayRect = new DvtRect(gauge.getContext(), bounds.x, bounds.y, bounds.w, bounds.h); 
    overlayRect.setFill(new DvtSolidFill("#000000", 0.001));
    container.addChild(overlayRect);
    
    // Tooltip Support
    if(data['tooltip'])
      gauge.__getEventManager().associate(overlayRect, new DvtSimpleObjPeer(null, data['tooltip']));
  }
  else // Render the empty text
    DvtGaugeRenderer.renderEmptyText(gauge, container, new DvtRectangle(0, 0, width, height));
}


