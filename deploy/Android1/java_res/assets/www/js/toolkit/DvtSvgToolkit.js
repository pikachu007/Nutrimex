// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/**
 * Document APIs.
 * @class DvtSvgDocumentUtils
 */
var DvtSvgDocumentUtils = function(){};

DvtObj.createSubclass(DvtSvgDocumentUtils, DvtDocumentUtils, "DvtSvgDocumentUtils");

// TODO JSDoc
// Return displayable
DvtSvgDocumentUtils.elementFromPoint = function(posX, posY) {
  var domObj = DvtAgent.getAgent().elementFromPagePoint(posX, posY);
  while (domObj) {
    if (domObj._obj) {
        return domObj._obj.getObj();
    }
    domObj = domObj.parentNode;
  }
  return null;
};

/**
 * Wrapper for the elementFromPoint function that takes in a touchEvent 
 * passing in different coordinates for chrome on android because the document.elementFromPpoint function requires the 
 * screen coordinates not the page coordinates like other browsers. ref bug 14032366
 * @param touchEvent the touch being passed in to evaluate the element it corresponds to
 * @return displayable the dom object the touch event corresponds to
 */
DvtSvgDocumentUtils.elementFromTouch = function(touchEvent) {
  if (DvtAgent.getAgent().isChrome())
    return this.elementFromPoint(touchEvent.screenX, touchEvent.screenY);
  else
    return this.elementFromPoint(touchEvent.clientX, touchEvent.clientY);
};

// TODO JSDoc
// Return coordinates relative to stage
DvtSvgDocumentUtils.getStageRelativePosition = function(stage, x, y) {
  var svgPos = DvtSvgDocumentUtils.getStageAbsolutePosition(stage);
  var xPos = x - svgPos.x;
  var yPos = y - svgPos.y;
  return new DvtPoint(xPos, yPos);
}

/**
 * Return coordinates relative to the page
 * @param {DvtStage} stage
 * @param {Number} x
 * @param {Number} y
 */
DvtSvgDocumentUtils.getPageRelativePosition = function(stage, x, y)
{
  var svgPos = DvtSvgDocumentUtils.getStageAbsolutePosition(stage);
  var xPos = x + svgPos.x;
  var yPos = y + svgPos.y;
  return new DvtPoint(xPos, yPos);
}

// TODO JSDoc
// Return absolute coordinates of stage
DvtSvgDocumentUtils.getStageAbsolutePosition = function(stage) {
  var svgRoot = stage.getImpl().getSVGRoot();

  var referenceElem = svgRoot;
  // If ADf, always use parent node
  if (window && window.AdfAgent) {
      referenceElem = svgRoot.parentNode;
  } else {
      // Otherwise require element to be the first child      
      if (svgRoot.parentNode && svgRoot.parentNode.firstChild == svgRoot) {
          referenceElem = svgRoot.parentNode;
      }
  }
  var svgPos = DvtAgent.getAgent().getElementPosition(referenceElem);
  var x = parseInt(svgPos.x);
  var y = parseInt(svgPos.y);
  // BUG #12805233: Firefox 5 returns incorrect element position for svg with clipped content.
  // As a result, adjustment needs to be made for the extent it extends outside the bounds
  // Unfortunately, this can't be cached because clipped items are often moving
  /*
  var isFirefox = DvtAgent.getAgent().getPlatform() === DvtAgent.GECKO_PLATFORM;
  if (isFirefox) {
      var stageDim = stage.getDimensions();
      if (stageDim.x != 0)
        x += -stageDim.x;
      if (stageDim.y != 0)
        y += -stageDim.y;
  }
  */
  return new DvtPoint(x, y);
}

/**
 * Returns true if SVG filters are supported.
 * @return {boolean}
 */
DvtSvgDocumentUtils.isFilterSupported = function(stage) {
  // Filters not supported in IE, Safari < 6, Android
  var agent = DvtAgent.getAgent();
  var platform = agent.getPlatform();
  return platform != DvtAgent.IE_PLATFORM && 
         !(agent.isSafari() && agent.getVersion() < 536) &&
         !(agent.isTouchDevice() && !agent.isSafari());
}

DvtSvgDocumentUtils.isStrokeTimeoutRequired = function() {
    return DvtAgent.getAgent().isChrome();
}

/*
 * Whether or not events in SVG are received on regions that are visually clipped such that they are not visible
 */
DvtSvgDocumentUtils.isEventAvailableOutsideClip = function() {
    return DvtAgent.getAgent().isSafari();
}

/*
 * Bug #12805402: In Firefox 4, horizontal/vertical polylines must be bent by 0.01 pixes to show up when fitlers are used
 */
DvtSvgDocumentUtils.isFilterStraightLineAdjustmentNeeded = function() {
    return DvtAgent.getAgent().isGecko();
}

/**
 * Works around bug 12622757, where updating objects whose ancestors have filters
 * does not work in the recent Webkit versions.
 * @param svgDomElement The SVG DOM element ancestor that contains the offending filter.
 */
DvtSvgDocumentUtils.fixWebkitFilters = function(svgDomElement) {
  if(svgDomElement && DvtAgent.getAgent().isWebkit()) {
    DvtSvgDocumentUtils._fixFilter(svgDomElement);
  }
}

/**
 * Works around bug 12622757, where updating objects whose ancestors have filters
 * does not work in the recent Webkit versions.
 * @param displayable The displayable that contains the offending filter.
 */
DvtSvgDocumentUtils.fixWebkitFiltersForDisplayable = function(displayable) {
  if(displayable && DvtAgent.getAgent().isWebkit()) {
    var elem = displayable.getImpl().getElem();
    if (elem) {
        var parent = elem.parentNode;
        // Ping all ancestors with filters
        while(parent) {
            if (!parent.getAttributeNS)
                break;
            var filter = parent.getAttributeNS(null, 'filter');
            if (filter) {
                DvtSvgDocumentUtils._fixFilter(parent);
            }
            parent = parent.parentNode;
        }
    }
  }
}

DvtSvgDocumentUtils._fixFilter = function(svgDomElement) {
    // Ping the ancestor to force a repaint.  This is basically a noop.
    svgDomElement.setAttributeNS(null, 'transform', svgDomElement.getAttributeNS(null, 'transform'));
}

/**
 * Cancel a DOM event.
 * 
 * @param {object}  e  event object to cancel
 */
DvtSvgDocumentUtils.cancelDomEvent = function(e)
{
  //if (!e)
  //{
  //  e = window.event;
  //}
  if (e)
  {
    if (e.stopPropagation)
      e.stopPropagation();
    if (e.preventDefault)
      e.preventDefault();
    e.cancelBubble = true;
    e.cancel = true;
    e.returnValue = false;
  }
}

/**
 * DvtSvgImageLoader.loadImage("pic.png", function(image) {
 *   alert(image.width);
 *   alert(image.height);
 * });
 * 
 */

/*
 * DvtSvgImageLoader
 */
var DvtSvgImageLoader = { _cache: {} };

DvtObj.createSubclass(DvtSvgImageLoader, DvtObj, "DvtSvgImageLoader");

/**
 * Copied from AdfIEAgent and AdfAgent
 * Adds an event listener that fires in the non-Capture phases for the specified
 * eventType.  There is no ordering guaranteee, nor is there a guarantee
 * regarding the number of times that an event listener will be called if
 * it is added to the same element multiple times.
 */
DvtSvgImageLoader.addBubbleEventListener = function(element, type, listener) 
{
  if (window.addEventListener) {
    element.addEventListener(type, listener, false);
    return true;
  } 
  // Internet Explorer
  else if (window.attachEvent) {
    element.attachEvent("on" + type, listener);
    return true;
  }
  else {
    return false;
  }
};


/**
 * @this {DvtSvgImageLoader}
 * Load an image.
 * 
 * @param src URL of the image to load
 * @param onComplete function to call when the image is loaded
 * 
 * @return image if image is already loaded
 *         otherwise null
 */
DvtSvgImageLoader.loadImage = function(src, onComplete) {
  //first look for a cached copy of the image
  var entry = this._cache[src];

  //if cached image found, use it
  if (entry) {
    // if image is loading, add listener to queue
    if (entry._image) {
      DvtSvgImageLoader._addListenerToQueue(entry._listeners, onComplete);
    }
    // if image is loaded, call onComplete function
    else {
      if (onComplete) {
        onComplete(entry);
      }
      // no handler, just return image width and height
      return entry;
    }
  }
  //if cached image not found, load the new image
  else {
    this.loadNewImage(src, onComplete);
  }
  return null;
};

/**
 * @this {DvtSvgImageLoader}
 * Load a new image.
 * 
 * @param src URL of the image to load
 * @param onComplete function to call when the image is loaded 
 */
DvtSvgImageLoader.loadNewImage = function(src, onComplete) {

  // create img element
  var image = document.createElement('img');

  // add a new entry to the image cached
  // depending on the state, entry value contains different attributes
  // when image is loading, entry contains image element and listeners
  // when image is loaded, entry contains image width and height
  var newEntry = {
    _listeners:[], 
    _image: image
  };
  if (onComplete) {
//    newEntry._listeners.push(onComplete);
    DvtSvgImageLoader._addListenerToQueue(newEntry._listeners, onComplete);
  }

  this._cache[src] = newEntry;

  DvtSvgImageLoader.addBubbleEventListener(image, 'load', function(e) {
      // copy width and height to entry and delete image element
      newEntry.width = image.width;
      newEntry.height = image.height;
      delete newEntry._image;

      // notify all listeners image loaded and delete all listeners
      var i;
      var len = newEntry._listeners.length;
      for (i = 0; i < len; i++) {
        // if there is a listener
        if (newEntry._listeners[i]) {
        newEntry._listeners[i](newEntry);
        }
      }
      delete newEntry._listeners;
    });

  image.src = src;

};


// add a listener to the queue only if it doesn't already exist
DvtSvgImageLoader._addListenerToQueue = function(queue, listener) {
  if (listener) {
    for (var i = 0; i < queue.length; i++) {
      if (queue[i] === listener)
        return;
    }
    queue.push(listener);
  }
};


/**
 * @constructor
 * Wrapper class providing access to SVG Events.
 * @extends DvtObj
 * @class DvtSvgBaseEvent
 * <p>The supported fields are:
 * <ul>
 * <li>target</li>
 * <li>type</li>
 * </ul>
 * <p>
 */
var DvtSvgBaseEvent = function(event) {
  this.Init(event);
}

DvtObj.createSubclass(DvtSvgBaseEvent, DvtObj, "DvtSvgBaseEvent");

/**
 * @protected
 * @param {MouseEvent} the DOM Mouse Event
 */
DvtSvgBaseEvent.prototype.Init = function(event) {
  // Save the event
  this._event = event;
  this._isPropagationStopped = false;

  // Find the DvtObj corresponding to the event target
  this.target = DvtSvgBaseEvent.FindDisplayable(event.target);

  this.type = event.type;
}

// TODO JSDoc
DvtSvgBaseEvent.prototype.getNativeEvent = function() {
  return this._event;
}

DvtSvgBaseEvent.prototype.preventDefault = function() {
    this._event.preventDefault();
} 

DvtSvgBaseEvent.prototype.stopPropagation = function() {
    if (this._event.stopPropagation)
      this._event.stopPropagation();
    this._event.cancelBubble = true;
    this._event.cancel = true;
    this._event.returnValue = false;
    this._isPropagationStopped = true;
} 

DvtSvgBaseEvent.prototype.isPropagationStopped = function() {
  return this._isPropagationStopped;
} 

/**
 * Given an SVG DOM target, returns the corresponding DvtDisplayable.
 * @return {DvtDisplayable} The corresponding displayable, if any.
 */
DvtSvgBaseEvent.FindDisplayable = function(target) {
  while(target) {
    // If this object has a displayable, return it
    if(target._obj && target._obj.getObj && target._obj.getObj())
      return target._obj.getObj();
    else // Otherwise look at the parent
      target = target.parentNode;
  }
  
  // Displayable not found, return null
  return null;
}
var DvtSvgEventFactory = new Object();

DvtObj.createSubclass(DvtSvgEventFactory, DvtObj, "DvtSvgEventFactory");

// Note: this doesn't need to live in the factory because it will always be called
// by impl specific code looking to wrap the event.
// TODO JSDoc
DvtSvgEventFactory.newEvent = function(nativeEvent, context) {
  // TODO detect the event type and perform wrapping as needed
  var eventType = nativeEvent.type;
  if (eventType == "touchstart" || eventType == "touchmove" || eventType == "touchend" || eventType == "touchcancel") {
      return new DvtSvgTouchEvent(nativeEvent, context);
  } 
  else if(eventType == "keydown" || eventType == "keyup") {
      return new DvtSvgKeyboardEvent(nativeEvent);
  }  
  else {
      // TODO check for type
      //BUG FIX 14187937: if the native event is the same as the last one, return the stored logical event,
      //otherwise create a new logical event and store the pair of events
      if (context._nativeEvent != nativeEvent) {
        context._nativeEvent = nativeEvent;
        context._logicalEvent = new DvtSvgMouseEvent(nativeEvent);
      }
      return context._logicalEvent;
  }
};

/**
 * Returns a DvtSvgMouseEvent that wraps the given keyboard event.  The given stageX and stageY coordinates are used to
 * compute the DvtSvgMouseEvent's pageX and pageY fields
 * 
 * @param {DvtKeyboardEvent} keyboardEvent
 * @param {DvtContext} context
 * @param {String} eventType
 * @param {DvtStage} stage
 * @param {Number} stageX
 * @param {Number} stageY
 * @return {DvtSvgMouseEvent}
 */
DvtSvgEventFactory.generateMouseEventFromKeyboardEvent = function(keyboardEvent, context, eventType, stage, stageX, stageY)
{
  var nativeEvent = null;
  
  if (document.createEvent) 
  {
    nativeEvent = document.createEvent("MouseEvents");
    
    var pageCoord = DvtSvgDocumentUtils.getPageRelativePosition(stage, stageX, stageY);
    
    nativeEvent.initMouseEvent(eventType, true, true, window, 1, pageCoord.x, pageCoord.y, pageCoord.x, pageCoord.y,
                         keyboardEvent.ctrlKey, keyboardEvent.altKey, keyboardEvent.shiftKey, keyboardEvent.metaKey,
                         0, null);
  }    
  
  if(nativeEvent)
  {
    var mouseEvent = DvtSvgEventFactory.newEvent(nativeEvent, context);
    mouseEvent.target = keyboardEvent.target;
    return mouseEvent;
  }
  else
    return null;
}
/**
 * @constructor
 * Wrapper class providing access to SVG Keyboard Events.
 * @extends DvtKeyboardEvent
 * @class DvtSvgKeyboardEvent
 * <p>The supported fields are:
 * <ul>
 * <li>altKey</li>
 * <li>ctrlKey</li>
 * <li>shiftKey</li>
 * <li>charCode</li>
 * <li>keyCode</li>
 * </ul>
 * <p>
 */
// TODO: add support for a source and target fields
var DvtSvgKeyboardEvent = function(event) {
  this.Init(event);
}

DvtObj.createSubclass(DvtSvgKeyboardEvent, DvtKeyboardEvent, "DvtSvgKeyboardEvent");


/**
 * @protected
 * @param {KeyboardEvent} the DOM Keyboard Event
 */
DvtSvgKeyboardEvent.prototype.Init = function(event) {
  DvtSvgKeyboardEvent.superclass.Init.call( this, 
                                            event.type, 
                                            event.bubbles,
                                            event.cancelable,
                                            event.view,
                                            event.charCode,
                                            event.keyCode,
                                            event.keyLocation,
                                            event.ctrlKey,
                                            event.altKey,
                                            event.shiftKey,
                                            event.repeat,
                                            event.locale );
                                            
  // TODO - what about event.target?                                            
  this._event = event;
}

/**
 * @override
 */
DvtSvgKeyboardEvent.prototype.getNativeEvent = function()
{
  return this._event;
}

/**
 * @override
 */
DvtSvgKeyboardEvent.prototype.preventDefault = function() {
    this._event.preventDefault();
} 

/**
 * @override
 */
DvtSvgKeyboardEvent.prototype.stopPropagation = function() {
    if (this._event.stopPropagation)
      this._event.stopPropagation();
    this._event.cancelBubble = true;
    this._event.cancel = true;
    this._event.returnValue = false;
} 

/**
 * @constructor
 * Wrapper class providing access to SVG Mouse Events.
 * @extends DvtSvgBaseEvent
 * @class DvtSvgMouseEvent
 * <p>The supported fields are:
 * <ul>
 * <li>ctrlKey</li>
 * <li>relatedTarget</li>
 * <li>target</li>
 * <li>type</li>
 * </ul>
 * <p>
 */
var DvtSvgMouseEvent = function(event) {
  this.Init(event);
}

DvtObj.createSubclass(DvtSvgMouseEvent, DvtSvgBaseEvent, "DvtSvgMouseEvent");

/**
 * @protected
 * @param {MouseEvent} the DOM Mouse Event
 */
DvtSvgMouseEvent.prototype.Init = function(event) {

  DvtSvgMouseEvent.superclass.Init.call(this, event);
  
  // Find the DvtObj corresponding to the event target
  if(event.relatedTarget != null)
    this.relatedTarget = DvtSvgBaseEvent.FindDisplayable(event.relatedTarget);  
  
  // Copy the remaining information
  this.button = event.button;
  this.ctrlKey = event.ctrlKey || event.metaKey;
  this.shiftKey = event.shiftKey;
  this.pageX = event.pageX;
  this.pageY = event.pageY;

  if (event.wheelDelta)
  {
    this.wheelDelta = event.wheelDelta / 40;
  }
  else
  {
    this.wheelDelta = event.detail;
  }
}
/**
 * @constructor
 * Wrapper class providing access to SVG Touch Events.
 * @extends DvtSvgBaseEvent
 * @class DvtSvgTouchEvent
 * <p>The supported fields are:
 * <ul>
 * <li>touches</li>
 * <li>targetTouches</li>
 * <li>changedTouches</li>
 * <li>target</li>
 * <li>type</li>
 * </ul>
 * <p>
 */
var DvtSvgTouchEvent = function(event, context) {
  this.Init(event, context);
}

DvtObj.createSubclass(DvtSvgTouchEvent, DvtSvgBaseEvent, "DvtSvgTouchEvent");

/**
 * @protected
 * @param {TouchEvent} the DOM Touch Event
 */
DvtSvgTouchEvent.prototype.Init = function(event, context) {

  DvtSvgTouchEvent.superclass.Init.call(this, event);
  // Convert touchcancel to touchend
  if (event.type == "touchcancel") {
      this.type = "touchend";
  }
  this._nativeTouches = event.touches;
  this._nativeTargetTouches = event.targetTouches;
  this._nativeChangedTouches = event.changedTouches;
  this.touches = DvtSvgTouchEvent.createTouchArray(event.touches);
  this.targetTouches = DvtSvgTouchEvent.createTouchArray(event.targetTouches);
  this.changedTouches = DvtSvgTouchEvent.createTouchArray(event.changedTouches);
  this._context = context;
}

DvtSvgTouchEvent.prototype.blockTouchHold = function() {
  this._event._touchHoldBlocked = true;
}

DvtSvgTouchEvent.prototype.isInitialTouch = function() {
   return (this.touches.length - this.changedTouches.length) == 0;
}

DvtSvgTouchEvent.prototype.isTouchHoldBlocked = function() {
  return (this._event._touchHoldBlocked) ? true : false;
}

DvtSvgTouchEvent.createTouchArray = function(nativeTouchArray) {
  var touches = new Array();
  for (var i=0; i<nativeTouchArray.length; i++) {
      var nativeTouch = nativeTouchArray[i];
      var touch = new DvtTouch(nativeTouch);
      touches.push(touch);
  }
  return touches;
}

DvtSvgTouchEvent.prototype.stopPropagation = function() {
    DvtSvgTouchEvent.superclass.stopPropagation.call(this);
    this._context.getTouchManager().postEventBubble(this);
}
// Used for rendering SVG content in to an HTML div wrapper
/**
 * @constructor
 */
var DvtHtmlRichTooltipManager = function(domElementId) {
    this.Init(domElementId);
};

DvtObj.createSubclass(DvtHtmlRichTooltipManager, DvtHtmlTooltipManager, "DvtHtmlRichTooltipManager");

DvtHtmlRichTooltipManager.prototype.Init = function(domElementId) 
{
  this._storedContexts = new Object();
  DvtHtmlRichTooltipManager.superclass.Init.call(this, domElementId);
}

DvtHtmlRichTooltipManager.prototype.InitContent = function(tooltip) {
      var svg = DvtSvgUtils.createSvgDocument("DvtCustomTooltip");
      // For an svg custom tooltip, the context is the new svg context for the svg document overlay.
      var context = new DvtSvgContext(svg, 'tooltipStage');
      this._storedContexts[this._domElementId] = context;
      tooltip.innerHTML = "";
      tooltip.appendChild(svg);
}

DvtHtmlRichTooltipManager.prototype.GetStoredContext = function() {
    return this._storedContexts[this._domElementId];
}

DvtHtmlRichTooltipManager.prototype.showRichElement = function(x, y, renderable, useOffset)
{
    this.showRichElementAtPosition(x, y, renderable, useOffset, false, DvtHtmlTooltipManager.UNSTYLED_POPUP_CLASS);
};

DvtHtmlRichTooltipManager.prototype.showRichElementAtPosition = function(x, y, renderable, useOffset, noEvents, popupClass) {

    var tooltip = this.getTooltipElem();
    
    DvtHtmlTooltipManager.PrepElement(tooltip, popupClass);
    
    var context = this.GetStoredContext();
    if (context){
      var stage = context.getStage();
      stage.removeChildren();
      var rootDisplayable = renderable.getRootDisplayable();
      stage.addChild(rootDisplayable);
      
      if (renderable && renderable.Render) {
          renderable.Render();
      }
      
      var svg = stage.getImpl().getSVGRoot();
      svg.setAttributeNS(null, "width", renderable.getDisplayWidth());
      svg.setAttributeNS(null, "height", renderable.getDisplayHeight());
      
      this.PostElement(tooltip, x, y, noEvents, useOffset);
    }
}

DvtHtmlRichTooltipManager.prototype.hideTooltip = function()
{
    DvtHtmlRichTooltipManager.superclass.hideTooltip.call(this);
    var context = this.GetStoredContext();
    if (context) {
        var stage = context.getStage();
        stage.removeChildren();
    }
}

// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 

/*---------------------------------------------------------------------*/
/*   DvtSvgImplFactory                                                 */
/*---------------------------------------------------------------------*/
/**
  * A factory class for SVG to create object implementations.
  * @extends  DvtHtmlImplFactory
  * @class DvtSvgImplFactory  A factory class to create SVG implementation objects.
  * @constructor  Creates SVG inplementation objects.
  */
var DvtSvgImplFactory = function(context) {
  this.Init(context) ;
};

DvtObj.createSubclass(DvtSvgImplFactory, DvtHtmlImplFactory, "DvtSvgImplFactory");

/*---------------------------------------------------------------------*/
/*     Base implementations                                            */
/*---------------------------------------------------------------------*/

/**
 *  Returns a new SVG <defs> element
 *  @private  
 */
DvtSvgImplFactory.prototype.newDefs = function() {
  return  DvtSvgShapeUtils.createElement('defs') ;
};

/**
 *  Returns a new DvtStage implementation object.
 */
DvtSvgImplFactory.prototype.newStage = function(root, id) {
  return  new DvtSvgStage(root, id) ;
};


/**
 * Returns a new DvtSvgContainer implementation.
 * @param {String} id  Optional ID for the object (see also {@link DvtDisplayable#setId}) 
 * @override
 * @type DvtContainer
 */
DvtSvgImplFactory.prototype.newContainer = function (id) {
  return new DvtSvgContainer(id, 'g');
};

/**
  *  Returns a new DvtSvgArc implementation object for an arc of a circle or ellipse.
  *  @param {number} cx  The center x position.
  *  @param {number} cy  The center y position.
  *  @param {number} rx  The horizontal radius of the ellipse/circle.
  *  @param {number} ry  The vertical radius of the ellipse/circle.
  *  @param {number} sa  The starting angle in degrees (following the normal anti-clockwise is positive convention).
  *  @param {number} ae  The angle extent in degrees (following the normal anti-clockwise is positive convention).
  *  @param {String} clos  An optional closure type for the arc. Closures are "OPEN" (the default), "SEGMENT", and "CHORD".
  *  @param {String} id  Optional ID for the shape (see {@link  DvtDisplayable#setId}).
  *  @returns {DvtSvgArc}  A new {@link DvtArc} object.
 *   @override
 */
DvtSvgImplFactory.prototype.newArc = function (cx, cy, rx, ry, sa, ae, clos, id) {
  return new DvtSvgArc(cx, cy, rx, ry, sa, ae, clos, id);
};


/**
  *  Creates a new DvtSvgCircle implementation for a circle.
  *  @param {number} cx  The center x position.
  *  @param {number} cy  The center y position.
  *  @param {number} r   The radius of the circle.
  *  @param {String} id  Optional ID for the object (see also {@link DvtDisplayable#setId}) 
  *  <p>
  *  <b>Example:</b><br><br> The following code creates a red circle of radius 100
  *  and line width 5, centered at (10,10).
  *  <br><br><code>
  *  var circle = factory.newCircle(10, 10, 100, 'myCircle') ;<br>
  *  circle.setStroke(new DvtStroke("red", 5)) ;<br>
  *  </code><br>
  *  @returns {DvtSvgCircle} A new DvtSvgCircle object.
  *  @override
 */
DvtSvgImplFactory.prototype.newCircle = function (cx, cy, r, id) {
  return  new DvtSvgCircle(cx, cy, r, id);
};

/**
 *  Returns a new DvtSvgImage implementation object for a displayable image.
 *  @param {String} imgSrc  The image URL.
 *  @param {number} x  The x position of the top left corner of the image.
 *  @param {number} y  The y position of the top left corner of the image.
 *  @param {number} w  The width of the image (optional).
 *  @param {number} h  The height of the image (optional).
 *  @param {String} id  Optional ID for the shape (see {@link  DvtDisplayable#setId}).
 *  <p>
 *  Example:<br><br><code>
 *  var img = factory.newImage('pic.png', 10, 10, 100, 150, 'myImg') ;<br>
 *  </code>
 *  @returns  {@link DvtImage}  A new DvtSvgImage object.
 *  @override
 */
DvtSvgImplFactory.prototype.newImage = function (imgSrc, x, y, w, h, id) {
  return new DvtSvgImage(imgSrc, x, y, w, h, id);
};

/**
  *  Creates a new DvtSvgLine implementation object which for a displayable line
  *  segment drawn from (x1, y1) to (x2, y2).
  *  @param {number} x1  An x end position of the line.
  *  @param {number} y1  The associated y end point (for x1).
  *  @param {number} x2  The other x end point.
  *  @param {number} y2  The associated y end point (for x2).
  *  @param {String} id  Optional ID for the shape (see {@link  DvtDisplayable#setId}).
  *  <p>Example:<br><br><code>
  *  var line = factory.newLine(10, 10, 100, 150);</code><br>
  *  @returns  {DvtSvgLine}  A new DvtSvgLine object.
  *  @override
  */
DvtSvgImplFactory.prototype.newLine = function (x1, y1, x2, y2, id) {
  return  new DvtSvgLine(x1, y1, x2, y2, id);
};


/**
 *  Returns a new DvtSvgMarker implementation object for a graph or legend marker.
 *  @param {number} type The type of the marker (see {@link DvtMarker}).
 *  @param {String} id  Optional ID for the shape (see {@link  DvtDisplayable#setId}).
 *  @param {String} etype  Optional element type for the shape (see {@link  DvtMarker}).
 *  <p>
 *  Example:<br><br><code>
 *  var rect = factory.newMarker(type, 'myRect') ;<br>
 *  </code>
 *  @returns {DvtSvgMarker}  A new DvtSvgMarker object.
 *  @override
 */
DvtSvgImplFactory.prototype.newMarker = function (type, id, etype) {
    return  new DvtSvgMarker(type, id, etype);
};


/**
  *  Returns a new DvtSvgOval implementation object which for a displayable ellipse.
  *  @param {number} cx  The center x position.
  *  @param {number} cy  The center y position.
  *  @param {number} rx  The horizontal radius of the ellipse.
  *  @param {number} ry  The vertical radius of the ellipse.
  *  @param {String} id  Optional ID for the shape (see {@link  DvtDisplayable#setId}).
  *  @returns  {DvtSvgOval}  A new DvtSvgOval object.
 * @override
 */
DvtSvgImplFactory.prototype.newOval = function (cx, cy, rx, ry, id) {
  return  new DvtSvgOval(cx, cy, rx, ry, id);
};

/**
  * Returns a new DvtSvgPath implementation object for a displayable shape
  * defined by SVG path commands.
  * @param {Object} cmds  Optional string of SVG path commands (see comment for
  *                       {@link DvtPath#setCmds}), or an array containing
  *                       consecutive command and coordinate entries (see comment
  *                       for {@link DvtPath#setCommands}).
  * @param {String} id  Optional ID for the shape (see {@link  DvtDisplayable#setId}).
  * @returns {DvtSvgPath}  A new DvtSvgPath object.
  * @override
 */
DvtSvgImplFactory.prototype.newPath = function (cmds, id) {
  return  new DvtSvgPath(cmds, id);
};

/**
 * Returns a new DvtSvgPolygon implementation object for a displayable shape composed of 
 * connected multi-line segments.
 * @param {array} ar  An array of consecutive x,y coordinate pairs.
 * @param {String} id  Optional ID for the shape (see {@link  DvtDisplayable#setId}).
 * @returns {DvtSvgPolygon}  A new DvtSvgPolygon object.
 * @override
 */
DvtSvgImplFactory.prototype.newPolygon = function (arPoints, id) {
  return  new DvtSvgPolygon(arPoints, id);
};


/**
 *  Returns a new DvtSvgPolyline object for a line composed of multiple line segments.
 *  @param {array} ar  An array of consecutive x,y coordinate pairs.
 *  @param {String} id  Optional ID for the shape (see {@link  DvtDisplayable#setId}).
 *  @return {DvtSvgPolyline}  A new  DvtSvgPolyline object.
 *  @override
 */
DvtSvgImplFactory.prototype.newPolyline = function (ar, id) {
  return  new DvtSvgPolyline(ar, id);
};

/**
 *  Returns a new DvtSvgRect implementation object for a displayable rectangle.
 *  @param {number} x  The x position of the top left corner of the rectangle.
 *  @param {number} y  The y position of the top left corner of the rectangle.
 *  @param {number} w  The width of the rectangle.
 *  @param {number} h  The height of the rectangle.
 *  @param {String} id  Optional ID for the shape (see {@link  DvtDisplayable#setId}).
 *  <p>
 *  Example:<br><br><code>
 *  var rect = factory.newRect(10, 10, 100, 150, 'myRect') ;<br>
 *  </code>
 *  @returns {DvtSvgRect} A new DvtSvgRect object.
 *  @override
 */
DvtSvgImplFactory.prototype.newRect = function (x, y, w, h, id) {
  return  new DvtSvgRect(x, y, w, h, id);
};

/**
 * Returns a new DvtSvgText implementation object for displayable text.
 * @param {String} id  Optional ID for the shape (see {@link  DvtDisplayable#setId}).
 * @returns {DvtSvgText}  A new DvtSvgText object.
 * @override
 */
DvtSvgImplFactory.prototype.newText = function (textStr, x, y, id) {
  return  new DvtSvgText(textStr, x, y, id);
};

/**
  *  Object initializer.
  *  @protected
  */
DvtSvgImplFactory.prototype.Init = function(context)
{
   DvtSvgImplFactory.superclass.Init.call(this, context) ;
};

/**
 * Returns a new DvtSvgTextArea implementation object for displayable text.
 * @param x {number} x the x position
 * @param y {number} y the y position
 * @param {String} id  Optional ID for the shape (see {@link  DvtDisplayable#setId}).
 * @returns {DvtSvgTextArea}   A new DvtSvgTextArea object.
 * @override
 */
DvtSvgImplFactory.prototype.newTextArea = function (x, y, id) {
  return new DvtSvgTextArea(x, y, id);
};


/**
 * Returns a new DvtSvgTextFormatted implementation object for displayable text.
 * @param {String} id  Optional ID for the shape (see {@link  DvtDisplayable#setId}).
 * @returns {DvtSvgTextFormatted}  A new DvtSvgTextFormatted object.
 * @type DvtTextFormatted
 * @override
 */
DvtSvgImplFactory.prototype.newTextFormatted = function (x, y, id) {
  return  new DvtSvgTextFormatted(x, y, id);
};

/**
 * Obtain imageLoader singleton
 * @override
 */
DvtSvgImplFactory.prototype.getImageLoader = function () {
  return DvtSvgImageLoader;
};

/**
 * @override
 */
DvtSvgImplFactory.prototype.getDocumentUtils = function () {
  return DvtSvgDocumentUtils;
};

// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*---------------------------------------------------------------------*/
/*   DvtSvgJsExt            SVG implementation of DvtJsExt             */
/*---------------------------------------------------------------------*/


//  Placeholder - revist if/when callbacks are used.


/**
  *  Provides a gateway for access to ADF functionality for SVG. 
  *  @class DvtSvgJsExt
  *  @extends DvtJsExt
  *  @constructor
  */
var  DvtSvgJsExt = function()
{
};

DvtObj.createSubclass(DvtSvgJsExt, DvtJsExt, "DvtSvgJsExt");



/*---------------------------------------------------------------------*/
/*                                 ADF                                 */
/*---------------------------------------------------------------------*/
/**  
  *  Sets a PPR property value.
  *  @param {String}  id  An id to be substituted in the function call.
  *  @param {String)  prop a property such as {@link DvtJsExt#PPR_ATTRIB_HSS}
  *  @param {String}  value  the property value.
  */
DvtSvgJsExt.prototype.sendPPRProperty = function(id, prop, value)
{
/*
    var fun = DvtJsExt.JS_FP_SET_PPR_PROPERTY.replace("X-ID-X", id);
    fun = fun.replace("X-ID-X", id);
    var js  = fun + "('" + prop + "','" + value + "')";
    eval(js) ;
*/

  try {
         AdfPage.PAGE.findComponent(id).getPeer().setDVTPPRAttribute(prop,value) ;
  }
  catch (err) {} 
};


/**
  *   @param {String} id
  */
DvtSvgJsExt.prototype.sendPPR  = function(id)
{
/*
    var js  =  DvtJsExt.JS_FP_SEND.replace("X-ID-X", id) ;
    js = js.replace("X-ID-X", id) ;
    eval(js) ;
*/

  try {
    AdfPage.PAGE.findComponent(id).getPeer().sendToServerPPR({source:id}) ;
  }
  catch (err) {} 
};

/**
  *   @param {String} id
  */
DvtSvgJsExt.prototype.sendPPRNonBlocking = function(id)
{
/*
    var js  =  DvtJsExt.JS_FP_SEND_PPR_NON_BLOCKING.replace("X-ID-X", id) ;
    js = js.replace("X-ID-X", id) ;
    eval(js) ;
*/

  try {
        AdfPage.PAGE.findComponent(id).getPeer().sendToServerPPR3({source:id}) ;
  }
  catch (err) {} 
};



/*---------------------------------------------------------------------*/
/*                    External Javascript invocation                   */
/*---------------------------------------------------------------------*/

/**
  *   Performs the specified Javascript.
  *   @returns {unknown} the result, if any, of the Javascript execution.
  */
DvtSvgJsExt.prototype.callJs = function(js)
{
   //console.log("'" + js + "'") ;

   return eval(js) ;
};

/**
  *   Performs the specified Javascript.
  *   @param {String} js the js function to call
  *   @param {unknown} param the param to pass to the function
  *   @returns {unknown} the result, if any, of Javascript.
  */
DvtSvgJsExt.prototype.callJsWithParam = function(js, param)
{
  var func = eval(js);
  return func(param);
};


/*---------------------------------------------------------------------*/
/*                            Logging                                  */
/*---------------------------------------------------------------------*/

/**
  *   Returns the current ADF log level.
  *   @returns {number} the current ADF log level (such as {DvtJsExt#LOG_WARNING}).
  */
DvtSvgJsExt.prototype.getLogLevel = function()
{
    return  adf_dvt_fpGetLogLevel() ;
};


/**
  *   Forwards a message to the ADF logger.
  *   @param  {String} msg the message to be logged.
  *   @param  {number} level the log level of the messsage.  If omitted
  *                          a value of {DvtJsExt#LOG_INFO} is assumed.
  */
DvtSvgJsExt.prototype.log = function(msg, level)
{
    adf_dvt_fpLogger(msg, (level === undefined? DvtJsExt.LOG_INFO : level)) ;
};


/**
  *   Forwards a message string to ADF DVT.
  *   @param  {String} msg the message to be sent.
  */
DvtSvgJsExt.prototype.msg = function(msg)
{
    adf_dvt_fpMsg(msg) ;
};



/*---------------------------------------------------------------------*/
/*                           Performance                               */
/*---------------------------------------------------------------------*/

/**
  *   Forwards a performance message.
  *   @param  {String} msg the performance message to be sent.
  *   @param  {number} type  the performance type (such as {DvtJsExt#PERF_TIMING}).
  */

DvtSvgJsExt.prototype.perf = function(s, type)
{
    adf_dvt_fpPerfLogger('' + type + s) ;     // Due to original issues with args in
                                              // Flash the type is currently sent at
                                              // the start of the string.
};



/*---------------------------------------------------------------------*/
/*                            Miscellaneous                            */
/*---------------------------------------------------------------------*/

/**
  *        TDO - JRM  is this still needed ?
  */
DvtSvgJsExt.prototype.requestRefresh = function()
{
    adf_dvt_fpRefresh() ;
};


DvtSvgJsExt.prototype.dispatchEvent = function(callback, callbackObj, component, event) {
  DvtEventDispatcher.dispatchEvent(callback, callbackObj, component, event);
}

// Copyright (c) 2011, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/**
 * @constructor
 */
var DvtSvgFilterContext = function()
{
  this.Init();
};

DvtObj.createSubclass(DvtSvgFilterContext, DvtObj, "DvtSvgFilterContext");

DvtSvgFilterContext.prototype.Init = function()
{
  this._regionPctRect = new DvtRectangle(-10, -10, 120, 120);
  this._counter = 0;
  this._resultIdsUnder = [];
  this._resultIdsOver = [];
};

DvtSvgFilterContext.prototype.getRegionPctRect = function()
{
  return this._regionPctRect;
};

DvtSvgFilterContext.prototype.getResultIdsUnder = function()
{
  return this._resultIdsUnder;
};

DvtSvgFilterContext.prototype.getResultIdsOver = function()
{
  return this._resultIdsOver;
};

DvtSvgFilterContext.prototype.createResultId = function(id)
{
  if (!id)
  {
    id = "filtRes";
  }
  return (id + (this._counter++));
};
// Copyright (c) 2011, 2012, Oracle and/or its affiliates. 
// All rights reserved. 

/**
  *   Static SVG filter routines.
  *   @class DvtSvgFilterUtils 
  *   @constructor
  */
var  DvtSvgFilterUtils = function()
{} ;

DvtObj.createSubclass(DvtSvgFilterUtils, DvtObj, "DvtSvgFilterUtils");

DvtSvgFilterUtils._counter = 0;

DvtSvgFilterUtils.createFilter = function(effects, svgDisplayable)
{
  var filt = DvtSvgShapeUtils.createElement('filter', DvtSvgFilterUtils.CreateFilterId());
  var filtContext = new DvtSvgFilterContext();
  for (var i = 0; i < effects.length; i++)
  {
    var effect = effects[i];
    if (effect)
    {
      DvtSvgFilterUtils.CreateFilterPrimitives(filt, effect, svgDisplayable, filtContext);
    }
  }
  
  // BUG #12805402: When bounding box of svg element has zero height or width, userSpaceOnUse must be used
  // Otherwise, the element will disappear
  var userSpaceOnUse = false;
  if (svgDisplayable) {
      var boundsRect = svgDisplayable.getElem().getBBox();
      if (boundsRect) {
          var width = boundsRect.width;
          var height = boundsRect.height;
          if (height == 0 || width == 0) {
            var stroke;
            //if displayable is not a shape, for example a container, then it doesn't have a stroke
            if (svgDisplayable.getStroke) {
              stroke = svgDisplayable.getStroke();
            }
            var adjustWidth = 10;
            if (stroke) {
                adjustWidth = stroke.getWidth();
            }
            var x = boundsRect.x;
            var y = boundsRect.y;
    
            // Firefox 4 requires the line to be bend slightly when feColorMatrix is used
            if (DvtSvgDocumentUtils.isFilterStraightLineAdjustmentNeeded()) {
                if (svgDisplayable instanceof DvtSvgPolyline) {
                   var points = DvtArrayUtils.copy(svgDisplayable.getPoints());
                   if (width == 0) {
                       points[0] = points[0]+0.01;
                   }
                   if (height == 0) {
                       points[1] = points[1]+0.01;
                   }
        
                   var bentPoints = DvtSvgShapeUtils.convertPointsArray(points);
                   svgDisplayable.getElem().setAttributeNS(null, 'points', bentPoints) ;
                }
            }
    
            if (height == 0) {
                height = 2*adjustWidth;
                y -= adjustWidth;
            }
            if (width == 0) {
                width = 2*adjustWidth;
                x -= adjustWidth;
            }
    
            filt.setAttributeNS(null,'x', x) ;
            filt.setAttributeNS(null,'y', y) ;
            filt.setAttributeNS(null,'width', width) ;
            filt.setAttributeNS(null,'height', height) ;
            filt.setAttributeNS(null,'filterUnits', 'userSpaceOnUse') ;
            userSpaceOnUse = true;
          }
      }
  }
  if (!userSpaceOnUse) {
      if (filtContext.getRegionPctRect().x != -10 && filtContext.getRegionPctRect().x != "Infinity" && filtContext.getRegionPctRect().x != "-Infinity")
      {
        filt.setAttributeNS(null,'x', filtContext.getRegionPctRect().x + '%') ;
      }
      if (filtContext.getRegionPctRect().y != -10 && filtContext.getRegionPctRect().y != "Infinity" && filtContext.getRegionPctRect().y != "-Infinity")
      {
        filt.setAttributeNS(null,'y', filtContext.getRegionPctRect().y + '%') ;
      }
      if (filtContext.getRegionPctRect().w != 120 && filtContext.getRegionPctRect().w != "Infinity" && filtContext.getRegionPctRect().w != "-Infinity")
      {
        filt.setAttributeNS(null,'width', filtContext.getRegionPctRect().w + '%') ;
      }
      if (filtContext.getRegionPctRect().h != 120 && filtContext.getRegionPctRect().h != "Infinity" && filtContext.getRegionPctRect().h != "-Infinity")
      {
        filt.setAttributeNS(null,'height', filtContext.getRegionPctRect().h + '%') ;
      }
        
  }

  
  var numResultsUnder = filtContext.getResultIdsUnder().length;
  var numResultsOver = filtContext.getResultIdsOver().length;
  var elemMN;
  var j;
  
  var elemM  = DvtSvgShapeUtils.createElement('feMerge') ;
  if (numResultsUnder > 0)
  {
    for (j = 0; j < numResultsUnder; j++)
    {
      elemMN = DvtSvgShapeUtils.createElement('feMergeNode') ;
      elemMN.setAttributeNS(null,'in', filtContext.getResultIdsUnder()[j]) ;
      elemM.appendChild(elemMN) ;
    }
  }
  elemMN = DvtSvgShapeUtils.createElement('feMergeNode') ;
  elemMN.setAttributeNS(null,'in', 'SourceGraphic') ;
  elemM.appendChild(elemMN) ;
  if (numResultsOver > 0)
  {
    for (j = 0; j < numResultsOver; j++)
    {
      elemMN = DvtSvgShapeUtils.createElement('feMergeNode') ;
      elemMN.setAttributeNS(null,'in', filtContext.getResultIdsOver()[j]) ;
      elemM.appendChild(elemMN) ;
    }
  }
  filt.appendChild(elemM) ;
  
  return filt;
};

DvtSvgFilterUtils.CreateFilterPrimitives = function(filter, effect, svgDisplayable, filtContext)
{
  if (effect instanceof DvtShadow)
  {
    DvtSvgShadowUtils.createFilterPrimitives(filter, effect, svgDisplayable, filtContext);
  }
  else if (effect instanceof DvtGlow)
  {
    DvtSvgGlowUtils.createFilterPrimitives(filter, effect, svgDisplayable, filtContext);
  }
  else if (effect instanceof DvtBevel)
  {
    DvtSvgBevelUtils.createFilterPrimitives(filter, effect, svgDisplayable, filtContext);
  }
  
  return null;
};

DvtSvgFilterUtils.CreateFilterId = function()
{
  return ("filt" + (DvtSvgFilterUtils._counter++));
};

// Copyright (c) 2011, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*---------------------------------------------------------------------------*/
/*   DvtSvgBevelUtils    A static class for SVG bevel effect property        */
/*                      manipulation.                                        */
/*---------------------------------------------------------------------------*/
/**
  *   DvtSvgBevelUtils    A static class for SVG bevel effect property manipulation.
  *   @class DvtSvgBevelUtils 
  *   @constructor
  */
var  DvtSvgBevelUtils = function()
{} ;

DvtObj.createSubclass(DvtSvgBevelUtils, DvtObj, "DvtSvgBevelUtils");

/**
  *  Static method to create an SVG filter element and apply bevel properties to it.
  *  @param {Dvtbevel}  bevel  Dvtbevel object
  *  @param {DvtSvgDisplayable}  svgDisplayable  display object to apply bevel to
  *  @returns an SVG  &lt;filter&gt; element
  */
DvtSvgBevelUtils.createFilter = function(bevel, svgDisplayable)
{
   //  The following outer bevel filter is created:
   
   
   //   The following inner bevel filter is created:
   
   
   var filt = DvtSvgBevelUtils.CreateFilterElem(bevel);
   var filtContext = new DvtSvgFilterContext();
   
   DvtSvgBevelUtils.createFilterPrimitives(filt, bevel, svgDisplayable, filtContext);
   
  var elemM  = DvtSvgShapeUtils.createElement('feMerge') ;
  var elemMN;
  if (filtContext.getResultIdsUnder().length > 0)
  {
    elemMN = DvtSvgShapeUtils.createElement('feMergeNode') ;
    elemMN.setAttributeNS(null,'in', filtContext.getResultIdsUnder()[0]) ;
    elemM.appendChild(elemMN) ;
  }
  elemMN = DvtSvgShapeUtils.createElement('feMergeNode') ;
  elemMN.setAttributeNS(null,'in', 'SourceGraphic') ;
  elemM.appendChild(elemMN) ;
  if (filtContext.getResultIdsOver().length > 0)
  {
    elemMN = DvtSvgShapeUtils.createElement('feMergeNode') ;
    elemMN.setAttributeNS(null,'in', filtContext.getResultIdsOver()[0]) ;
    elemM.appendChild(elemMN) ;
  }
  filt.appendChild(elemM) ;
  
  if (filtContext.getRegionPctRect().x != -10)
  {
    filt.setAttributeNS(null,'x', filtContext.getRegionPctRect().x + '%') ;
  }
  if (filtContext.getRegionPctRect().y != -10)
  {
    filt.setAttributeNS(null,'y', filtContext.getRegionPctRect().y + '%') ;
  }
  if (filtContext.getRegionPctRect().w != 120)
  {
    filt.setAttributeNS(null,'width', filtContext.getRegionPctRect().w + '%') ;
  }
  if (filtContext.getRegionPctRect().h != 120)
  {
    filt.setAttributeNS(null,'height', filtContext.getRegionPctRect().h + '%') ;
  }
   
   return filt;
};

DvtSvgBevelUtils.createFilterPrimitives = function(filt, effect, svgDisplayable, filtContext)
{
  if (effect._type === DvtBevel.TYPE_INNER)
  {
    var boundsRect = svgDisplayable.getDimensions(svgDisplayable.getParent());
    DvtSvgBevelUtils.CreateInnerFilterPrimitives2(filt, effect, filtContext, boundsRect);
  }
  else if (effect._type === DvtBevel.TYPE_OUTER)
  {
    //TODO
  }
  else if (effect._type === DvtBevel.TYPE_FULL)
  {
    //TODO
  }
};

/**
  * @protected
  */
DvtSvgBevelUtils.CreateFilterElem = function(bevel)
{
  var filt = DvtSvgShapeUtils.createElement('filter', bevel._Id) ;
  return filt;
};

/**
  * @protected
  */
/*DvtSvgBevelUtils.CreateInnerFilterPrimitives = function(filt, bevel, filtContext)
{
  //var distance = bevel._distance;
  var angle = bevel._angle;
  var hilightRed   = DvtColorUtils.getRed(bevel._hilightRgba) ;
  var hilightGreen = DvtColorUtils.getGreen(bevel._hilightRgba) ;
  var hilightBlue  = DvtColorUtils.getBlue(bevel._hilightRgba) ;
  var hilightAlpha = DvtColorUtils.getAlpha(bevel._hilightRgba) ;
  //var hilightRgb = DvtColorUtils.makeRGB(hilightRed, hilightGreen, hilightBlue);
  var shadowRed   = DvtColorUtils.getRed(bevel._shadowRgba) ;
  var shadowGreen = DvtColorUtils.getGreen(bevel._shadowRgba) ;
  var shadowBlue  = DvtColorUtils.getBlue(bevel._shadowRgba) ;
  var shadowAlpha = DvtColorUtils.getAlpha(bevel._shadowRgba) ;
  //var shadowRgb = DvtColorUtils.makeRGB(shadowRed, shadowGreen, shadowBlue);
  //var strength = bevel._strength;
  var blurX = bevel._blurX;
  var blurY = bevel._blurY;
  
  //create bump map for specular lighting
  var elemGB = DvtSvgShapeUtils.createElement('feGaussianBlur') ;
  elemGB.setAttributeNS(null, 'in', 'SourceAlpha') ;
  elemGB.setAttributeNS(null, 'stdDeviation', blurX + " " + blurY) ;
  var elemGBResult = filtContext.createResultId('blur');
  elemGB.setAttributeNS(null, 'result', elemGBResult) ;
  
  //specular highlight
  var elemSL = DvtSvgShapeUtils.createElement('feSpecularLighting') ;
  elemSL.setAttributeNS(null, 'in', elemGBResult) ;
  elemSL.setAttributeNS(null, 'surfaceScale', 5) ;
  elemSL.setAttributeNS(null, 'specularConstant', 1) ;//.85);
  elemSL.setAttributeNS(null, 'specularExponent', 20) ;
  //use pure white, and later convert to specified color
  elemSL.setAttributeNS(null, 'lighting-color', '#ffffff');//hilightRgb) ;
  var elemSLResult = filtContext.createResultId('specLight');
  elemSL.setAttributeNS(null, 'result', elemSLResult) ;
  
  var elemDL = DvtSvgShapeUtils.createElement('feDistantLight') ;
  elemDL.setAttributeNS(null, 'azimuth', -angle) ;
  //elemDL.setAttributeNS(null, 'elevation', 0) ;
  
  //only keep part of specular highlight within original shape
  var elemC1 = DvtSvgShapeUtils.createElement('feComposite') ;
  elemC1.setAttributeNS(null, 'operator', 'in') ;
  elemC1.setAttributeNS(null, 'in', elemSLResult) ;
  elemC1.setAttributeNS(null, 'in2', 'SourceAlpha') ;
  var elemC1Result = filtContext.createResultId('comp');
  elemC1.setAttributeNS(null, 'result', elemC1Result) ;

  //convert white specular hilight to correct color
  var elemCM = DvtSvgShapeUtils.createElement('feColorMatrix') ;
  elemCM.setAttributeNS(null,'in', elemC1Result) ;
  elemCM.setAttributeNS(null,'type', 'matrix') ;
  elemCM.setAttributeNS(null,'values', (hilightRed/255) + ' 0 0 0 0 ' +
                                       '0 ' + (hilightGreen/255) + ' 0 0 0 ' +
                                       '0 0 ' + (hilightBlue/255) + ' 0 0 ' +
                                       //'0 0 0 ' + hilightAlpha + ' 0') ;
                                       '0 0 0 1 0') ;
  var elemCMResult = filtContext.createResultId('colMat');
  elemCM.setAttributeNS(null, 'result', elemCMResult) ;
  
  //specular shadow
  var elemSL2 = DvtSvgShapeUtils.createElement('feSpecularLighting') ;
  elemSL2.setAttributeNS(null, 'in', elemGBResult) ;
  elemSL2.setAttributeNS(null, 'surfaceScale', 5) ;
  elemSL2.setAttributeNS(null, 'specularConstant', 1) ;//.85);
  elemSL2.setAttributeNS(null, 'specularExponent', 20) ;
  //use pure white, and later convert to specified color
  elemSL2.setAttributeNS(null, 'lighting-color', '#ffffff');//shadowRgb) ;
  var elemSL2Result = filtContext.createResultId('specLight');
  elemSL2.setAttributeNS(null, 'result', elemSL2Result) ;
  
  var elemDL2 = DvtSvgShapeUtils.createElement('feDistantLight') ;
  elemDL2.setAttributeNS(null, 'azimuth', -(angle + 180)) ;
  //elemDL2.setAttributeNS(null, 'elevation', 0) ;
  
  //only keep part of specular shadow within original shape
  var elemC2 = DvtSvgShapeUtils.createElement('feComposite') ;
  elemC2.setAttributeNS(null, 'operator', 'in') ;
  elemC2.setAttributeNS(null, 'in', elemSL2Result) ;
  elemC2.setAttributeNS(null, 'in2', 'SourceAlpha') ;
  var elemC2Result = filtContext.createResultId('comp');
  elemC2.setAttributeNS(null, 'result', elemC2Result) ;

  //convert white specular hilight to correct color
  var elemCM2 = DvtSvgShapeUtils.createElement('feColorMatrix') ;
  elemCM2.setAttributeNS(null,'in', elemC2Result) ;
  elemCM2.setAttributeNS(null,'type', 'matrix') ;
  elemCM2.setAttributeNS(null,'values', (shadowRed/255) + ' 0 0 0 0 ' +
                                        '0 ' + (shadowGreen/255) + ' 0 0 0 ' +
                                        '0 0 ' + (shadowBlue/255) + ' 0 0 ' +
                                        //'0 0 0 ' + shadowAlpha + ' 0') ;
                                        '0 0 0 1 0') ;
  var elemCM2Result = filtContext.createResultId('colMat');
  elemCM2.setAttributeNS(null, 'result', elemCM2Result) ;
  
  filtContext.getResultIdsOver().push(elemCMResult);
  filtContext.getResultIdsOver().push(elemCM2Result);
  
  filt.appendChild(elemGB) ;
  filt.appendChild(elemSL) ;
  elemSL.appendChild(elemDL) ;
  filt.appendChild(elemC1) ;
  filt.appendChild(elemCM);
  filt.appendChild(elemSL2) ;
  elemSL2.appendChild(elemDL2) ;
  filt.appendChild(elemC2) ;
  filt.appendChild(elemCM2);
};*/

/**
  * @protected
  */
DvtSvgBevelUtils.CreateInnerFilterPrimitives2 = function(filt, bevel, filtContext, boundsRect)
{
  var distance = bevel._distance;
  var angle = bevel._angle;
  var hilightRed   = DvtColorUtils.getRed(bevel._hilightRgba) ;
  var hilightGreen = DvtColorUtils.getGreen(bevel._hilightRgba) ;
  var hilightBlue  = DvtColorUtils.getBlue(bevel._hilightRgba) ;
  var hilightAlpha = DvtColorUtils.getAlpha(bevel._hilightRgba) ;
  var hilightRgb = DvtColorUtils.makeRGB(hilightRed, hilightGreen, hilightBlue);
  var shadowRed   = DvtColorUtils.getRed(bevel._shadowRgba) ;
  var shadowGreen = DvtColorUtils.getGreen(bevel._shadowRgba) ;
  var shadowBlue  = DvtColorUtils.getBlue(bevel._shadowRgba) ;
  var shadowAlpha = DvtColorUtils.getAlpha(bevel._shadowRgba) ;
  var shadowRgb = DvtColorUtils.makeRGB(shadowRed, shadowGreen, shadowBlue);
  //var strength = bevel._strength;
  var blurX = bevel._blurX * .5;
  var blurY = bevel._blurY * .5;
  
  //if we have a boundsRect, increase the size of the filter so
  //that the temporary outer glow has room to display outside the shape
  if (boundsRect)
  {
    var xRatio = (2 * blurX / boundsRect.w) * 100;
    var yRatio = (2 * blurY / boundsRect.h) * 100;
    if (filtContext.getRegionPctRect().x > -xRatio)
    {
      filtContext.getRegionPctRect().x = -xRatio;
    }
    if (filtContext.getRegionPctRect().y > -yRatio)
    {
      filtContext.getRegionPctRect().y = -yRatio;
    }
    if (filtContext.getRegionPctRect().w < (100 + 2 * xRatio))
    {
      filtContext.getRegionPctRect().w = (100 + 2 * xRatio);
    }
    if (filtContext.getRegionPctRect().h < (100 + 2 * yRatio))
    {
      filtContext.getRegionPctRect().h = (100 + 2 * yRatio);
    }
  }
  
  //create an outer glow on the shape
  var elemGB  = DvtSvgShapeUtils.createElement('feGaussianBlur') ;
  elemGB.setAttributeNS(null,'in', 'SourceAlpha') ;
  elemGB.setAttributeNS(null,'stdDeviation', blurX + " " + blurY) ;
  var elemGBResult = filtContext.createResultId('blur');
  elemGB.setAttributeNS(null,'result', elemGBResult) ;
  
  //shift the outer glow to expose some of the original shape along
  //the edge we want to hilight
  var angleRads = angle * Math.PI / 180;
  var dx = distance * Math.cos(angleRads);
  var dy = distance * Math.sin(angleRads);
  var elemO = DvtSvgShapeUtils.createElement('feOffset') ;
  elemO.setAttributeNS(null,'dx', dx) ;
  elemO.setAttributeNS(null,'dy', dy) ;
  elemO.setAttributeNS(null,'in', elemGBResult) ;
  var elemOResult = filtContext.createResultId('offset');
  elemO.setAttributeNS(null,'result', elemOResult) ;
  
  //create a flood of the hilight color
  var elemF1 = DvtSvgShapeUtils.createElement('feFlood') ;
  elemF1.setAttributeNS(null,'in', 'SourceAlpha') ;
  elemF1.setAttributeNS(null,'flood-opacity', hilightAlpha / 3) ;
  elemF1.setAttributeNS(null,'flood-color', hilightRgb) ;
  var elemF1Result = filtContext.createResultId('flood');
  elemF1.setAttributeNS(null,'result', elemF1Result) ;
  
  //keep the part of the flood outside the shifted glow
  var elemC1 = DvtSvgShapeUtils.createElement('feComposite') ;
  elemC1.setAttributeNS(null,'operator', 'out') ;
  elemC1.setAttributeNS(null,'in', elemF1Result) ;
  elemC1.setAttributeNS(null,'in2', elemOResult) ;
  var elemC1Result = filtContext.createResultId('comp');
  elemC1.setAttributeNS(null,'result', elemC1Result) ;
  
  //keep the part inside the original shape
  var elemC2 = DvtSvgShapeUtils.createElement('feComposite') ;
  elemC2.setAttributeNS(null, 'operator', 'in');
  elemC2.setAttributeNS(null,'in', elemC1Result) ;
  elemC2.setAttributeNS(null,'in2', 'SourceGraphic') ;
  var elemC2Result = filtContext.createResultId('comp');
  elemC2.setAttributeNS(null,'result', elemC2Result) ;
  
  //shift the outer glow to expose some of the original shape along
  //the edge we want to shadow
  var elemO2 = DvtSvgShapeUtils.createElement('feOffset') ;
  elemO2.setAttributeNS(null,'dx', -dx) ;
  elemO2.setAttributeNS(null,'dy', -dy) ;
  elemO2.setAttributeNS(null,'in', elemGBResult) ;
  var elemO2Result = filtContext.createResultId('offset');
  elemO2.setAttributeNS(null,'result', elemO2Result) ;
  
  //create a flood of the shadow color
  var elemF2 = DvtSvgShapeUtils.createElement('feFlood') ;
  elemF2.setAttributeNS(null,'in', 'SourceAlpha') ;
  elemF2.setAttributeNS(null,'flood-opacity', shadowAlpha * 2) ;
  elemF2.setAttributeNS(null,'flood-color', shadowRgb) ;
  var elemF2Result = filtContext.createResultId('flood');
  elemF2.setAttributeNS(null,'result', elemF2Result) ;
  
  //keep the part of the flood outside the shifted glow
  var elemC3 = DvtSvgShapeUtils.createElement('feComposite') ;
  elemC3.setAttributeNS(null,'operator', 'out') ;
  elemC3.setAttributeNS(null,'in', elemF2Result) ;
  elemC3.setAttributeNS(null,'in2', elemO2Result) ;
  var elemC3Result = filtContext.createResultId('comp');
  elemC3.setAttributeNS(null,'result', elemC3Result) ;
  
  //keep the part inside the original shape
  var elemC4 = DvtSvgShapeUtils.createElement('feComposite') ;
  elemC4.setAttributeNS(null, 'operator', 'in');
  elemC4.setAttributeNS(null,'in', elemC3Result) ;
  elemC4.setAttributeNS(null,'in2', 'SourceGraphic') ;
  var elemC4Result = filtContext.createResultId('comp');
  elemC4.setAttributeNS(null,'result', elemC4Result) ;
  
  filtContext.getResultIdsOver().push(elemC2Result);
  filtContext.getResultIdsOver().push(elemC4Result);

  filt.appendChild(elemGB) ;
  filt.appendChild(elemO) ;
  filt.appendChild(elemF1) ;
  filt.appendChild(elemC1) ;
  filt.appendChild(elemC2) ;
  filt.appendChild(elemO2) ;
  filt.appendChild(elemF2) ;
  filt.appendChild(elemC3) ;
  filt.appendChild(elemC4) ;
};

// Copyright (c) 2011, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*---------------------------------------------------------------------------*/
/*   DvtSvgGlowUtils    A static class for SVG glow effect property          */
/*                      manipulation.                                        */
/*---------------------------------------------------------------------------*/
/**
  *   DvtSvgGlowUtils    A static class for SVG glow effect property manipulation.
  *   @class DvtSvgGlowUtils 
  *   @constructor
  */
var  DvtSvgGlowUtils = function()
{} ;

DvtObj.createSubclass(DvtSvgGlowUtils, DvtObj, "DvtSvgGlowUtils");

/**
  *  Static method to create an SVG filter element and apply glow properties to it.
  *  @param {DvtGlow}  glow  DvtGlow object
  *  @param {DvtSvgDisplayable}  svgDisplayable  display object to apply glow to
  *  @returns an SVG  &lt;filter&gt; element
  */
DvtSvgGlowUtils.createFilter = function(glow, svgDisplayable)
{
   //  The following outer glow filter is created:

   //   <filter id="dg1">
   //     <feColorMatrix type="matrix" values="0 0 0 red 0
   //                                          0 0 0 green 0
   //                                          0 0 0 blue 0
   //                                          0 0 0 alpha 0"/>
   //     <feGaussianBlur stdDeviation="6 6" result="blur1"/>
   //     <feMerge>
   //       <feMergeNode in="blur1"/>
   //       <feMergeNode in="SourceGraphic"/>
   //     </feMerge>
   //   </filter>
   
   
   //   The following inner glow filter is created:
   
   //   <filter id="dg1">
   //     <feGaussianBlur stdDeviation="3" result="blur1"/>
   //     <feComposite operator="in" in="SourceGraphic" in2="blur1" result="comp1"/>
   //     <feComposite operator="in" in2="comp1" result="comp2"/>
   //     <feFlood in="comp2" flood-opacity="1" flood-color="rgb(255,255,255)" result="flood1"/>
   //     <feBlend mode="normal" in="comp2" in2="flood1" result="blend1"/>
   //     <feComposite operator="in" in="blend1" in2="SourceGraphic" result="comp3"/>
   //   </filter>
   
   var filt = DvtSvgGlowUtils.CreateFilterElem(glow);
   var filtContext = new DvtSvgFilterContext();
   
   DvtSvgGlowUtils.createFilterPrimitives(filt, glow, svgDisplayable, filtContext);
   
  var elemM  = DvtSvgShapeUtils.createElement('feMerge') ;
  var elemMN;
  if (filtContext.getResultIdsUnder().length > 0)
  {
    elemMN = DvtSvgShapeUtils.createElement('feMergeNode') ;
    elemMN.setAttributeNS(null,'in', filtContext.getResultIdsUnder()[0]) ;
    elemM.appendChild(elemMN) ;
  }
  elemMN = DvtSvgShapeUtils.createElement('feMergeNode') ;
  elemMN.setAttributeNS(null,'in', 'SourceGraphic') ;
  elemM.appendChild(elemMN) ;
  if (filtContext.getResultIdsOver().length > 0)
  {
    elemMN = DvtSvgShapeUtils.createElement('feMergeNode') ;
    elemMN.setAttributeNS(null,'in', filtContext.getResultIdsOver()[0]) ;
    elemM.appendChild(elemMN) ;
  }
  filt.appendChild(elemM) ;
   
   if (filtContext.getRegionPctRect().x != -10)
  {
    filt.setAttributeNS(null,'x', filtContext.getRegionPctRect().x + '%') ;
  }
  if (filtContext.getRegionPctRect().y != -10)
  {
    filt.setAttributeNS(null,'y', filtContext.getRegionPctRect().y + '%') ;
  }
  if (filtContext.getRegionPctRect().w != 120)
  {
    filt.setAttributeNS(null,'width', filtContext.getRegionPctRect().w + '%') ;
  }
  if (filtContext.getRegionPctRect().h != 120)
  {
    filt.setAttributeNS(null,'height', filtContext.getRegionPctRect().h + '%') ;
  }
   
   return filt;
};

DvtSvgGlowUtils.createFilterPrimitives = function(filt, effect, svgDisplayable, filtContext)
{
  if (effect._bInner)
  {
    DvtSvgGlowUtils.CreateInnerFilterPrimitives2(filt, effect, filtContext);
  }
  else
  {
    var boundsRect = svgDisplayable.getDimensions(svgDisplayable.getParent());
    DvtSvgGlowUtils.CreateOuterFilterPrimitives(filt, effect, filtContext, boundsRect);
  }
};

/**
  * @protected
  */
DvtSvgGlowUtils.CreateFilterElem = function(glow)
{
  var filt = DvtSvgShapeUtils.createElement('filter', glow._Id) ;
  return filt;
};

/**
  * @protected
  */
DvtSvgGlowUtils.CreateOuterFilterPrimitives = function(filt, glow, filtContext, boundsRect)
{
  var rgba  = glow._rgba ;
  var red   = DvtColorUtils.getRed(rgba)/255 ;
  var green = DvtColorUtils.getGreen(rgba)/255 ;
  var blue  = DvtColorUtils.getBlue(rgba)/255 ;
  var alpha = DvtColorUtils.getAlpha(rgba) ;
  var strength = glow._strength;
  //adjust blur values so that SVG behaves more like Flash
  var blurX = glow._blurX / 3;
  var blurY = glow._blurY / 3;

  //if we have a boundsRect, increase the size of the filter so
  //that the glow has room to display outside the shape
  if (boundsRect)
  {
    var xRatio = (2 * blurX / boundsRect.w) * 100;
    var yRatio = (2 * blurY / boundsRect.h) * 100;
    if (filtContext.getRegionPctRect().x > -xRatio)
    {
      filtContext.getRegionPctRect().x = -xRatio;
    }
    if (filtContext.getRegionPctRect().y > -yRatio)
    {
      filtContext.getRegionPctRect().y = -yRatio;
    }
    if (filtContext.getRegionPctRect().w < (100 + 2 * xRatio))
    {
      filtContext.getRegionPctRect().w = (100 + 2 * xRatio);
    }
    if (filtContext.getRegionPctRect().h < (100 + 2 * yRatio))
    {
      filtContext.getRegionPctRect().h = (100 + 2 * yRatio);
    }
  }

  var elemCM  = DvtSvgShapeUtils.createElement('feColorMatrix') ;
  elemCM.setAttributeNS(null,'in', 'SourceGraphic') ;
  elemCM.setAttributeNS(null,'type', 'matrix') ;
  elemCM.setAttributeNS(null,'values', '0 0 0 ' + red   + ' 0 ' +
                                       '0 0 0 ' + green + ' 0 ' +
                                       '0 0 0 ' + blue  + ' 0 ' +
                                       '0 0 0 ' + alpha + ' 0') ;
  
  var elemGB  = DvtSvgShapeUtils.createElement('feGaussianBlur') ;
  elemGB.setAttributeNS(null,'stdDeviation', blurX + " " + blurY) ;
  var elemGBResult = filtContext.createResultId('blur');
  elemGB.setAttributeNS(null,'result', elemGBResult) ;
  
  //attempt to use the glow strength as multiplier for alpha
  //value in blur filter
  var elemCT;
  var elemCTResult;
  if (strength != 1) {
    //BUG FIX 14394122: use feComponentTransfer instead of feColorMatrix,
    //because Chrome has issues rendering the color matrix
    elemCT = DvtSvgShapeUtils.createElement('feComponentTransfer');
    elemCT.setAttributeNS(null,'in', elemGBResult) ;
    elemCTResult = filtContext.createResultId('compTran');
    elemCT.setAttributeNS(null,'result', elemCTResult) ;
    
    var elemFA = DvtSvgShapeUtils.createElement('feFuncA');
    elemFA.setAttributeNS(null,'type', 'linear') ;
    elemFA.setAttributeNS(null,'slope', "" + strength) ;
    elemCT.appendChild(elemFA);
  }
  
  if (elemCTResult) {
    filtContext.getResultIdsUnder().push(elemCTResult);
  }
  else {
    filtContext.getResultIdsUnder().push(elemGBResult);
  }

  filt.appendChild(elemCM) ;
  filt.appendChild(elemGB) ;
  if (elemCT) {
    filt.appendChild(elemCT) ;
  }
};

/**
  * @protected
  */
/*DvtSvgGlowUtils.CreateInnerFilterPrimitives = function(filt, glow, filtContext)
{
  var red   = DvtColorUtils.getRed(glow._rgba) ;
  var green = DvtColorUtils.getGreen(glow._rgba) ;
  var blue  = DvtColorUtils.getBlue(glow._rgba) ;
  var alpha = DvtColorUtils.getAlpha(glow._rgba) ;
  var rgb = DvtColorUtils.makeRGB(red, green, blue);
  
  //filtContext.getRegionPctRect().x = 0;
  //filtContext.getRegionPctRect().y = 0;
  //filtContext.getRegionPctRect().width = 100;
  //filtContext.getRegionPctRect().height = 100;
  
  var elemGB  = DvtSvgShapeUtils.createElement('feGaussianBlur') ;
  elemGB.setAttributeNS(null,'in', 'SourceGraphic') ;
  elemGB.setAttributeNS(null,'stdDeviation', glow._blurX + " " + glow._blurY) ;
  var elemGBResult = filtContext.createResultId('blur');
  elemGB.setAttributeNS(null,'result', elemGBResult) ;
  
  var elemC1  = DvtSvgShapeUtils.createElement('feComposite') ;
  elemC1.setAttributeNS(null,'operator', 'in') ;
  elemC1.setAttributeNS(null,'in', 'SourceGraphic') ;
  elemC1.setAttributeNS(null,'in2', elemGBResult) ;
  //if we add elemC2 below back in, then change the result
  //of this feComposite back to 'comp1'
  var elemC1Result = filtContext.createResultId('comp');
  //elemC1.setAttributeNS(null,'result', elemC1Result) ;
  var elemC2Result = filtContext.createResultId('comp');
  elemC1.setAttributeNS(null,'result', elemC2Result) ;
  
  //can add this filter back in in order to strengthen the effect
  //(that's what it appears to do...)
  //var elemC2  = DvtSvgShapeUtils.createElement('feComposite') ;
  //elemC2.setAttributeNS(null,'operator', 'in') ;
  //elemC2.setAttributeNS(null,'in2', elemC1Result) ;
  //elemC2.setAttributeNS(null,'result', elemC2Result) ;
  
  var elemF1  = DvtSvgShapeUtils.createElement('feFlood') ;
  elemF1.setAttributeNS(null,'in', elemC2Result) ;
  elemF1.setAttributeNS(null,'flood-opacity', alpha) ;
  elemF1.setAttributeNS(null,'flood-color', rgb) ;
  var elemF1Result = filtContext.createResultId('flood');
  elemF1.setAttributeNS(null,'result', elemF1Result) ;
  
  var elemB1  = DvtSvgShapeUtils.createElement('feBlend') ;
  elemB1.setAttributeNS(null,'mode', 'normal') ;
  elemB1.setAttributeNS(null,'in', elemC2Result) ;
  elemB1.setAttributeNS(null,'in2', elemF1Result) ;
  var elemB1Result = filtContext.createResultId('blend');
  elemB1.setAttributeNS(null,'result', elemB1Result) ;
  
  var elemC3  = DvtSvgShapeUtils.createElement('feComposite') ;
  elemC3.setAttributeNS(null,'operator', 'in') ;
  elemC3.setAttributeNS(null,'in', elemB1Result) ;
  elemC3.setAttributeNS(null,'in2', 'SourceGraphic') ;
  //var elemC3Result = filtContext.createResultId('comp');
  //elemC3.setAttributeNS(null,'result', elemC3Result) ;
  
  filt.appendChild(elemGB) ;
  filt.appendChild(elemC1) ;
  //filt.appendChild(elemC2) ;
  filt.appendChild(elemF1) ;
  filt.appendChild(elemB1) ;
  filt.appendChild(elemC3) ;
};*/

/**
  * @protected
  */
DvtSvgGlowUtils.CreateInnerFilterPrimitives2 = function(filt, glow, filtContext)
{
  var red   = DvtColorUtils.getRed(glow._rgba) ;
  var green = DvtColorUtils.getGreen(glow._rgba) ;
  var blue  = DvtColorUtils.getBlue(glow._rgba) ;
  var alpha = DvtColorUtils.getAlpha(glow._rgba) ;
  var rgb = DvtColorUtils.makeRGB(red, green, blue);
  var strength = glow._strength;
  //adjust blur values so that SVG behaves more like Flash
  //NOTE: changed to factor of 2 for graph selection, because 
  //then the two inner glows use blurs of 1 and 2 instead of 
  //0.5 and 1 (SVG appears to treat 0.5 and 1 the same)
  var blurX = glow._blurX / 2;//4;
  var blurY = glow._blurY / 2;//4;
  
  var elemF1  = DvtSvgShapeUtils.createElement('feFlood') ;
  elemF1.setAttributeNS(null,'in', 'SourceGraphic') ;
  elemF1.setAttributeNS(null,'flood-opacity', alpha) ;
  elemF1.setAttributeNS(null,'flood-color', rgb) ;
  var elemF1Result = filtContext.createResultId('flood');
  elemF1.setAttributeNS(null,'result', elemF1Result) ;
  
  var elemC1  = DvtSvgShapeUtils.createElement('feComposite') ;
  elemC1.setAttributeNS(null,'operator', 'out') ;
  elemC1.setAttributeNS(null,'in', elemF1Result) ;
  elemC1.setAttributeNS(null,'in2', 'SourceGraphic') ;
  var elemC1Result = filtContext.createResultId('comp');
  elemC1.setAttributeNS(null,'result', elemC1Result) ;
  
  var elemGB  = DvtSvgShapeUtils.createElement('feGaussianBlur') ;
  elemGB.setAttributeNS(null,'in', elemC1Result) ;
  elemGB.setAttributeNS(null,'stdDeviation', blurX + " " + blurY) ;
  var elemGBResult = filtContext.createResultId('blur');
  elemGB.setAttributeNS(null,'result', elemGBResult) ;
  
  //attempt to use the glow strength as multiplier for alpha
  //value in blur filter
  var elemCT;
  var elemCTResult;
  if (strength != 1) {
    //BUG FIX 14394122: use feComponentTransfer instead of feColorMatrix,
    //because Chrome has issues rendering the color matrix
    elemCT = DvtSvgShapeUtils.createElement('feComponentTransfer');
    elemCT.setAttributeNS(null,'in', elemGBResult) ;
    elemCTResult = filtContext.createResultId('compTran');
    elemCT.setAttributeNS(null,'result', elemCTResult) ;
    
    var elemFA = DvtSvgShapeUtils.createElement('feFuncA');
    elemFA.setAttributeNS(null,'type', 'linear') ;
    elemFA.setAttributeNS(null,'slope', "" + strength) ;
    elemCT.appendChild(elemFA);
  }
  
  var elemC2  = DvtSvgShapeUtils.createElement('feComposite') ;
  //elemC2.setAttributeNS(null,'operator', 'atop') ;
  elemC2.setAttributeNS(null, 'operator', 'in');
  if (elemCTResult) {
    elemC2.setAttributeNS(null,'in', elemCTResult) ;
  }
  else {
    elemC2.setAttributeNS(null,'in', elemGBResult) ;
  }
  elemC2.setAttributeNS(null,'in2', 'SourceGraphic') ;
  var elemC2Result = filtContext.createResultId('comp');
  elemC2.setAttributeNS(null,'result', elemC2Result) ;
  
  filtContext.getResultIdsOver().push(elemC2Result);
  
  //if elemC2 above uses operator='in' instead of 'atop', 
  //then can do one of these afterwards to get same result:
  //var elemM  = DvtSvgShapeUtils.createElement('feMerge') ;
  //var elemMN1 = DvtSvgShapeUtils.createElement('feMergeNode') ;
  //elemMN1.setAttributeNS(null,'in', 'SourceGraphic') ;
  //var elemMN2 = DvtSvgShapeUtils.createElement('feMergeNode') ;
  //elemMN2.setAttributeNS(null,'in', elemC2Result) ;
  //OR
  //var elemC3  = DvtSvgShapeUtils.createElement('feComposite') ;
  //elemC3.setAttributeNS(null,'operator', 'atop') ;
  //elemC3.setAttributeNS(null,'in', elemC2Result) ;
  //elemC3.setAttributeNS(null,'in2', 'SourceGraphic') ;
  
  filt.appendChild(elemF1) ;
  filt.appendChild(elemC1) ;
  filt.appendChild(elemGB) ;
  if (elemCT) {
    filt.appendChild(elemCT);
  }
  filt.appendChild(elemC2) ;
  
  //filt.appendChild(elemM) ;
  //elemM.appendChild(elemMN1) ;
  //elemM.appendChild(elemMN2) ;
  //OR
  //filt.appendChild(elemC3) ;
};

// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*---------------------------------------------------------------------------*/
/*    DvtSvgGradientUtils    A static class for SVG gradient property manip- */
/*                           ulation.                                        */
/*---------------------------------------------------------------------------*/
/**
  *   DvtSvgGradientUtils    A static class for SVG gradient property manipulation.
  *   @class DvtSvgGradientUtils 
  *   @constructor
  */
var  DvtSvgGradientUtils = function()
{} ;

DvtObj.createSubclass(DvtSvgGradientUtils, DvtObj, "DvtSvgGradientUtils");

/**
  *  Static method to create an SVG element and apply gradient properties to it.
  *  @param {Object}  Either a DvtGradientFill or DvtGradientStroke derivative to apply.
  */
DvtSvgGradientUtils.createElem = function(grad, id)
{
   var bLinear = ((grad instanceof DvtLinearGradientFill) || (grad instanceof DvtLinearGradientStroke));
   var elemGrad = DvtSvgShapeUtils.createElement((bLinear? 'linearGradient' : 'radialGradient'), id) ;

   var i ;
   var arColors = grad.getColors() ;
   var arAlphas = grad.getAlphas() ;
   var arStops  = grad.getStops() ;
   var arBounds = grad.getBounds() ;
   var len      = arColors.length ;

   for (i = 0; i < len; i++) {
      var elem = DvtSvgShapeUtils.createElement('stop') ;
      elem.setAttributeNS(null, 'offset', '' + (arStops[i] * 100) + '%') ;
      var color = arColors[i];
      if (color) {
        var alpha = arAlphas[i];
        // Workaround for Safari where versions < 5.1 show rgba values as black
        var agent = DvtAgent.getAgent();
        if (agent.isSafari() && color.indexOf("rgba") !==  - 1) {
          elem.setAttributeNS(null, 'stop-color', DvtColorUtils.getRGB(color));
          // Use alpa in rgba value as a multiplier to the alpha set on the object as this is what svg does.
          if (alpha != null)
            elem.setAttributeNS(null, 'stop-opacity', DvtColorUtils.getAlpha(color) * alpha);
          else 
            elem.setAttributeNS(null, 'stop-opacity', DvtColorUtils.getAlpha(color));
        }
        else {
          elem.setAttributeNS(null, 'stop-color', color);
          if (alpha != null)
            elem.setAttributeNS(null, 'stop-opacity', alpha);
        }
      }
      elemGrad.appendChild(elem) ;
   }

   //  If no gradient bounding box specified, will use the object's boundary box.

   var bUseObjBBox = (! arBounds ||
                    ((arBounds[0]==0) && (arBounds[1]==0) && (arBounds[2]==0) && (arBounds[3]==0)) );

   //  The angle of rotation for SVG is clockwise, so must convert from the standard
   //  anti-clockwise convention used by the middle-tier xml. Rotation is
   //  at the mid-point of the bounding box.

   if (bLinear) {
     var  angle = grad.getAngle() ;

     var  x1 = '0%' ;
     var  y1 = '0%' ;
     var  x2 = '100%' ;
     var  y2 = '0%' ;

     var setGradientVector = true;
      
     if (bUseObjBBox) {

       // Set gradient vector for gradientUnits = "objectBoundingBox"
       // (the default value for gradientUnits).

       if (angle === 45) {
         y1 = '100%' ;
         x2 = '100%' ;
       }
       else if (angle === 90) {
         y1 = '100%' ;
         x2 = '0%' ;
       }
       else if (angle === 135) {
         x1 = '100%' ;
         x2 = '0%' ;
         y2 = '100%' ;
       }
       else if (angle === 270) {
         x2 = '0%' ;
         y2 = '100%' ;
       }
       else if (angle !== 0) {
         angle = -angle ;
         elemGrad.setAttributeNS(null, 'gradientTransform', 'rotate(' + angle + ' ' + '.5 .5)' ) ;
         setGradientVector = false;  // no need to change the default gradient vector, since we are rotating the 
                                     // gradient via gradientTransform
       }
     } 
     else  {

      //  Apply specified bounding box

      // use gradientUnits = "userSpaceOnUse"; for when we want to account for bounding box
      // first rotate the gradient by the specified angle
      // then scale this gradient to the width and bounds specifed in arBounds
      // then translate the gradient
      // note that if the width and height of the gradient are not equal, then the actual angle of the
      // gradient is different from the specified angle argument
      // However, this is the same behavior as how Flash processes the bounding box argument
      // Finally, note that in SVG, the order of transform operations is right to left

      elemGrad.setAttributeNS(null, 'gradientUnits', 'userSpaceOnUse') ;

      // set gradient vector to span the middle of the unit square
      x1 = '0';
      y1 = '0.5';
      x2 = '1';
      y2 = '0.5';

      var scaleX     = arBounds[2];
      var scaleY     = arBounds[3];
      var translateX = arBounds[0];
      var translateY = arBounds[1];
        
      angle = -angle;
      var rotateTransformStr = 'rotate(' + angle + ' ' + '.5 .5)'
      var scaleTransformStr = 'scale('+ scaleX + ' ' + scaleY + ')';
      var translateTransformStr = 'translate(' + translateX + ' ' + translateY + ')';
      var boundingBoxTransformStr = scaleTransformStr + ' ' + rotateTransformStr;
      
      if (translateX != 0 || translateY != 0) {
        boundingBoxTransformStr = translateTransformStr + ' ' + boundingBoxTransformStr;
      } 
        
      // in the case of a bounding box, to set up the gradient, we need both gradientTransform and
      // a gradient vector centered in the unit square

      elemGrad.setAttributeNS(null, 'gradientTransform', boundingBoxTransformStr ) ;
     }

     if(setGradientVector)   {
       elemGrad.setAttributeNS(null, 'x1', x1) ;
       elemGrad.setAttributeNS(null, 'y1', y1) ;
       elemGrad.setAttributeNS(null, 'x2', x2) ;
       elemGrad.setAttributeNS(null, 'y2', y2) ;
     }
   }
   else {    //  Radial gradient

     if (! bUseObjBBox) {

       elemGrad.setAttributeNS(null, 'gradientUnits', 'userSpaceOnUse') ;

       elemGrad.setAttributeNS(null, 'cx', grad.getCx()) ;
       elemGrad.setAttributeNS(null, 'cy', grad.getCy()) ;
       elemGrad.setAttributeNS(null, 'fx', grad.getCx()) ;
       elemGrad.setAttributeNS(null, 'fy', grad.getCy()) ;
       elemGrad.setAttributeNS(null, 'r',  grad.getRadius()) ;
    }
   }
   return elemGrad ;
};

// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*---------------------------------------------------------------------------*/
/*    DvtSvgImageFillUtils    A static class for SVG image fill property     */
/*                           manipulation.                                   */
/*---------------------------------------------------------------------------*/
/**
  *   A static class for SVG image fill property manipulation.
  *   @class DvtSvgImageFillUtils
  *   @constructor
  */
var  DvtSvgImageFillUtils = function()
{} ;

DvtObj.createSubclass(DvtSvgImageFillUtils, DvtObj, "DvtSvgImageFillUtils");

/**
  *  Static method to create an SVG element and apply image fill properties 
  *  to it.
  *  @param {DvtImageFill}
  */
DvtSvgImageFillUtils.createElem = function(imageFill, id)
{
   /* Example:
      <defs>
        <pattern id="img1" patternUnits="userSpaceOnUse" width="20" height="20" >
          <image xlink:href="400.png" x="0" y="0"  width="20" height="20" />
        </pattern>
      </defs>

      <rect x="0" y="0" height="100" width="100" fill="url(#img1)"/>
   */

   var elemPat = DvtSvgShapeUtils.createElement("pattern", id) ;
   var elemImg  = DvtSvgShapeUtils.createElement("image", id);

   var src = imageFill.getSrc() ;
   var bound = imageFill.getBound() ;
   var repeat = imageFill.getRepeat();

   if (bound) {
      elemPat.setAttributeNS(null, 'x', bound.x);
      elemPat.setAttributeNS(null, 'y', bound.y);

      elemImg.setAttributeNS(null, "x", bound.x);
      elemImg.setAttributeNS(null, "y", bound.y);

      elemPat.setAttributeNS(null, 'width', bound.w);
      elemPat.setAttributeNS(null, 'height', bound.h);

      elemImg.setAttributeNS(null, "width", bound.w);
      elemImg.setAttributeNS(null, "height", bound.h);
      elemPat.setAttributeNS(null, "patternUnits", "userSpaceOnUse");

      /*
      // tile the background image
      if (! repeat || repeat != "no-repeat") {
      }
      // stretch out the background image
      else {
        elemPat.setAttributeNS(null, "patternUnits", "objectBoundingBox");
        elemPat.setAttributeNS(null, 'width', "100%");
        elemPat.setAttributeNS(null, 'height', "100%");
      }
      */

      if (src) {
         elemImg.setAttributeNS(DvtSvgImage.XLINK_NS, 'xlink:href', src) ;
      }
   }

   elemPat.appendChild(elemImg) ;

   return elemPat ;
};

// Copyright (c) 2011, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*---------------------------------------------------------------------------*/
/*    DvtSvgPatternFillUtils    A static class for SVG pattern fill property */
/*                              manipulation.                                */
/*---------------------------------------------------------------------------*/
/**
  *   A static class for creating SVG pattern fills.
  *   @class DvtSvgPatternFillUtils
  *   @constructor
  */
var  DvtSvgPatternFillUtils = function()
{} ;

DvtObj.createSubclass(DvtSvgPatternFillUtils, DvtObj, "DvtSvgPatternFillUtils");

/**   @private @final @type String  */
DvtSvgPatternFillUtils._SM_WIDTH       = 8 ;
/**   @private @final @type String  */
DvtSvgPatternFillUtils._SM_HEIGHT      = 8 ;
/**   @private @final @type String  */
DvtSvgPatternFillUtils._LG_WIDTH       = 16 ;
/**   @private @final @type String  */
DvtSvgPatternFillUtils._LG_HEIGHT      = 16 ;

/**
  *  Static method to create an SVG pattern element.
  *  @param {DvtPatternFill}  patternFill  pattern fill object
  *  @param {string}  id  pattern identifier
  */
DvtSvgPatternFillUtils.createElem = function(patternFill, id)
{
  var elemPat = DvtSvgShapeUtils.createElement("pattern", id) ;

  var pattern = patternFill.getPattern();
  var bSmall = DvtSvgPatternFillUtils.IsSmallPattern(pattern);
  var ww;
  var hh;
  if (bSmall)
  {
    ww = DvtSvgPatternFillUtils._SM_WIDTH ;
    hh = DvtSvgPatternFillUtils._SM_HEIGHT ;
  }
  else
  {
    ww = DvtSvgPatternFillUtils._LG_WIDTH ;
    hh = DvtSvgPatternFillUtils._LG_HEIGHT ;
  }

  elemPat.setAttributeNS(null, "x", 0);
  elemPat.setAttributeNS(null, "y", 0);
  elemPat.setAttributeNS(null, "width", ww);
  elemPat.setAttributeNS(null, "height", hh);
  elemPat.setAttributeNS(null, "patternUnits", "userSpaceOnUse");
  var mat = patternFill.getMatrix();
  if (mat) {
    var sMat = 'matrix(' + mat.getA() + ',' + mat.getC() + ',' + mat.getB() + ',' + mat.getD() + ',' + mat.getTx() + ',' + mat.getTy() + ')';
    elemPat.setAttributeNS(null, "patternTransform", sMat);
  }
  
  DvtSvgPatternFillUtils.CreatePatternElems(patternFill, elemPat);

  return elemPat ;
};

/**
  * Determine if the pattern is large or small.
  * 
  * @param {string}  pattern  constant representing the pattern
  * @protected
  */
DvtSvgPatternFillUtils.IsSmallPattern = function(pattern)
{
  return (pattern.charAt(0) === 's');
};

/**
  * Determine if the pattern is large or small.
  * 
  * @param {DvtPatternFill}  patternFill  pattern fill object
  * @param {object}  parentElem  parent pattern DOM element
  * @protected
  */
DvtSvgPatternFillUtils.CreatePatternElems = function(patternFill, parentElem)
{
  var rightX ;
  var bottomY ;
  var w ;
  var h ;
  var halfW ;  
  var halfH ; 
  var elem ;

  var pattern = patternFill.getPattern();
  var sColor = patternFill.getColor();
  var color = DvtColorUtils.getRGB(sColor);
  var alpha = DvtColorUtils.getAlpha(sColor);
  var sBackgroundColor = patternFill.getBackgroundColor();
  var backgroundColor = DvtColorUtils.getRGB(sBackgroundColor);
  var backgroundAlpha = DvtColorUtils.getAlpha(sBackgroundColor);
  
  var bSmall = DvtSvgPatternFillUtils.IsSmallPattern(pattern);
  if (bSmall)
  {
    rightX  = DvtSvgPatternFillUtils._SM_WIDTH  ;
    bottomY = DvtSvgPatternFillUtils._SM_HEIGHT  ;
    w       = DvtSvgPatternFillUtils._SM_WIDTH ;
    h       = DvtSvgPatternFillUtils._SM_HEIGHT ;
  }
  else
  {
    rightX  = DvtSvgPatternFillUtils._LG_WIDTH  ;
    bottomY = DvtSvgPatternFillUtils._LG_HEIGHT  ;
    w       = DvtSvgPatternFillUtils._LG_WIDTH ;
    h       = DvtSvgPatternFillUtils._LG_HEIGHT ;
  }
  
  //if a background color is specified, then fill a rect with that color
  //before drawing the pattern elements on top of it
  if (backgroundColor && (backgroundAlpha > 0))
  {
    elem = DvtSvgShapeUtils.createElement("rect");
    
    elem.setAttributeNS(null, "stroke", backgroundColor);
    elem.setAttributeNS(null, "stroke-opacity", backgroundAlpha);
    elem.setAttributeNS(null, "stroke-width", 1);
    elem.setAttributeNS(null, "fill", backgroundColor);
    elem.setAttributeNS(null, "fill-opacity", backgroundAlpha);
    
    elem.setAttributeNS(null, "x", 0);
    elem.setAttributeNS(null, "y", 0);
    elem.setAttributeNS(null, "width", rightX);
    elem.setAttributeNS(null, "height", bottomY);
    
    parentElem.appendChild(elem);
  }

  if (pattern === DvtPatternFill.SM_DIAG_UP_LT || 
      pattern === DvtPatternFill.LG_DIAG_UP_LT)
  {
    halfW = w/2;
    halfH = h/2;
    
    //BUG FIX #12568117: instead of line from corner to corner,
    //which has chunks missing at the tile meeting points, draw
    //two lines connecting centers of edges of tiles;
    //use path instead of two lines because it's more compact (uses one
    //DOM element instead of two)
    elem = DvtSvgShapeUtils.createElement("path");

//  g.lineStyle((bSmall? 1 : 2), color) ;
    elem.setAttributeNS(null, "stroke", color);
    elem.setAttributeNS(null, "stroke-opacity", alpha);
    elem.setAttributeNS(null, "stroke-width", 1);
    //BUG FIX #12568117: use square linecap so that there are no chunks
    //missing in lines where adjacent tiles connect
    elem.setAttributeNS(null, "stroke-linecap", "square");
    
    elem.setAttributeNS(null, "d", "M" + halfW + ",0" + 
                                   "L" + rightX + "," + halfH + 
                                   "M0," + halfH + 
                                   "L" + halfW + "," + bottomY);
    
    parentElem.appendChild(elem);
  }
  else if (pattern === DvtPatternFill.SM_DIAG_UP_RT || 
           pattern === DvtPatternFill.LG_DIAG_UP_RT)
  {
    halfW = w/2;
    halfH = h/2;
    
    //BUG FIX #12568117: instead of line from corner to corner,
    //which has chunks missing at the tile meeting points, render
    //two lines connecting centers of edges of tiles;
    //use path instead of two lines because it's more compact (uses one
    //DOM element instead of two)
    elem = DvtSvgShapeUtils.createElement("path");

//  g.lineStyle((bSmall? 1 : 2), color) ;
    elem.setAttributeNS(null, "stroke", color);
    elem.setAttributeNS(null, "stroke-opacity", alpha);
    elem.setAttributeNS(null, "stroke-width", 1);
    //BUG FIX #12568117: use square linecap so that there are no chunks
    //missing in lines where adjacent tiles connect
    elem.setAttributeNS(null, "stroke-linecap", "square");
    
    elem.setAttributeNS(null, "d", "M0," + halfH + 
                                   "L" + halfW + ",0" + 
                                   "M" + halfW + "," + bottomY + 
                                   "L" + rightX + "," + halfH);
    
    parentElem.appendChild(elem);
  }
  else if (pattern === DvtPatternFill.SM_CROSSHATCH || 
           pattern === DvtPatternFill.LG_CROSSHATCH)
  {
    //use path instead of two lines because it's more compact (uses one
    //DOM element instead of two)
    elem = DvtSvgShapeUtils.createElement("path");

//  g.lineStyle((bSmall? 1 : 2), color) ;
    elem.setAttributeNS(null, "stroke", color);
    elem.setAttributeNS(null, "stroke-opacity", alpha);
    elem.setAttributeNS(null, "stroke-width", 1);
    
    elem.setAttributeNS(null, "d", "M0,0" + 
                                   "L" + rightX + "," + bottomY + 
                                   "M" + rightX + ",0" + 
                                   "L0," + bottomY);
    
    parentElem.appendChild(elem);
  }
  else if (pattern === DvtPatternFill.SM_CHECK || 
           pattern === DvtPatternFill.LG_CHECK)
  {
    halfW = w/2 ;  
    halfH = h/2 ;  
    
    //use path instead of two rects because it's more compact (uses one
    //DOM element instead of two)
    elem = DvtSvgShapeUtils.createElement("path");
    
    elem.setAttributeNS(null, "stroke", color);
    elem.setAttributeNS(null, "stroke-opacity", alpha);
    elem.setAttributeNS(null, "stroke-width", 1);
    elem.setAttributeNS(null, "fill", color);
    elem.setAttributeNS(null, "fill-opacity", alpha);
    
    elem.setAttributeNS(null, "d", "M" + halfW + ",0" + 
                                   "L" + w + ",0" + 
                                   "L" + w + "," + halfH + 
                                   "L" + halfW + "," + halfH + "Z" + 
                                   "M0," + halfH + 
                                   "L" + halfW + "," + halfH + 
                                   "L" + halfW + "," + h + 
                                   "L0," + h + "Z");
    
    parentElem.appendChild(elem);
  }
  else if (pattern === DvtPatternFill.SM_TRIANGLE_CHECK || 
           pattern === DvtPatternFill.LG_TRIANGLE_CHECK)
  {
    elem = DvtSvgShapeUtils.createElement("polygon");
    
    elem.setAttributeNS(null, "stroke", color);
    elem.setAttributeNS(null, "stroke-opacity", alpha);
    elem.setAttributeNS(null, "stroke-width", 1);
    elem.setAttributeNS(null, "fill", color);
    elem.setAttributeNS(null, "fill-opacity", alpha);
    
    elem.setAttributeNS(null, "points", "0," + bottomY + " " + 
                                        rightX + ",0 " + 
                                        rightX + "," + bottomY);
    
    parentElem.appendChild(elem);
  }
  else if (pattern === DvtPatternFill.SM_DIAMOND_CHECK || 
           pattern === DvtPatternFill.LG_DIAMOND_CHECK)
  {
    halfW = w/2 ;  
    halfH = h/2 ;  
    
    elem = DvtSvgShapeUtils.createElement("polygon");
    
    elem.setAttributeNS(null, "stroke", color);
    elem.setAttributeNS(null, "stroke-opacity", alpha);
    elem.setAttributeNS(null, "stroke-width", 1);
    elem.setAttributeNS(null, "fill", color);
    elem.setAttributeNS(null, "fill-opacity", alpha);
    
    elem.setAttributeNS(null, "points", "0," + halfH + " " + 
                                        halfW + ",0 " + 
                                        rightX + "," + halfW + " " + 
                                        halfW + "," + bottomY);
    
    parentElem.appendChild(elem);
  }
};

// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*---------------------------------------------------------------------------*/
/*   DvtSvgShadowUtils    A static class for SVG drop shadow property manip- */
/*                        ulation.                                           */
/*---------------------------------------------------------------------------*/
/**
  *  A static class for SVG drop shadow property manipulation.
  *  @class DvtSvgShadowUtils
  *  @constructor
  */
var  DvtSvgShadowUtils = function()
{} ;

DvtObj.createSubclass(DvtSvgShadowUtils, DvtObj, "DvtSvgShadowUtils");

/**
 * @private
 * @final
 */
DvtSvgShadowUtils.RADS_PER_DEGREE = (Math.PI / 180);


/**
  *  Static method to create an SVG filter element and apply shadow properties to it.
  *  @param {DvtShadow}
  *  @returns {DOM_Element}  An SVG  &lt;filter&gt; element
  */
DvtSvgShadowUtils.createFilter = function(shadow, displayable)
{
   //  The following filter is created:

   //   <filter id="ds1">
   //     <feColorMatrix type="matrix" values="0 0 0 red 0
   //                                          0 0 0 green 0
   //                                          0 0 0 blue 0
   //                                          0 0 0 alpha 0">
   //     </feColorMatrix>
   //     <feGaussianBlur stdDeviation="5.166666666666666" result="blur1"></feGaussianBlur>
   //     <feOffset dx="5.75" dy="5.75" in="blur1" result="offset"></feOffset>
   //     <feMerge>
   //       <feMergeNode in="offset"></feMergeNode>
   //       <feMergeNode in="SourceGraphic"></feMergeNode>
   //     </feMerge>
   //   </filter>

   var filt ;

   if (! shadow.isLocked()) {
     var filtContext = new DvtSvgFilterContext();
     filt = DvtSvgShapeUtils.createElement('filter', shadow._Id) ;
     DvtSvgShadowUtils.createFilterPrimitives(filt, shadow, displayable, filtContext);
     
     var elemM  = DvtSvgShapeUtils.createElement('feMerge') ;
     var elemMN1 = DvtSvgShapeUtils.createElement('feMergeNode') ;
     elemMN1.setAttributeNS(null,'in', filtContext.getResultIdsUnder()[0]) ;
     var elemMN2 = DvtSvgShapeUtils.createElement('feMergeNode') ;
     elemMN2.setAttributeNS(null,'in', 'SourceGraphic') ;
     
     filt.appendChild(elemM) ;
     elemM.appendChild(elemMN1) ;
     elemM.appendChild(elemMN2) ;
   }
   
   return filt;
};

DvtSvgShadowUtils.createFilterPrimitives = function(filt, shadow, svgDisplayable, filtContext)
{
   //BUG FIX #12407873: create inner shadow if necessary
   if (shadow._bInner)
   {
     DvtSvgShadowUtils.CreateInnerFilterPrimitives(filt, shadow, svgDisplayable, filtContext);
   }
   else
   {
     DvtSvgShadowUtils.CreateOuterFilterPrimitives(filt, shadow, svgDisplayable, filtContext);
   }
};

/**
 * @protected
 */
DvtSvgShadowUtils.CreateOuterFilterPrimitives = function(filt, shadow, svgDisplayable, filtContext)
{
   //if (! shadow.isLocked()) {

     var rgba  = shadow._rgba ;
     var red   = DvtColorUtils.getRed(rgba)/255 ;
     var green = DvtColorUtils.getGreen(rgba)/255 ;
     var blue  = DvtColorUtils.getBlue(rgba)/255 ;
     var alpha = DvtColorUtils.getAlpha(rgba) ;
     var strength = shadow._strength;
     
     var origBlurX = shadow._blurX;
     var origBlurY = shadow._blurY;
     //adjust blur values so that SVG behaves more like Flash
     //BUG FIX #12661565: only calculate blur if blur is not set to 0
     var blurX = 0;
     var blurY = 0;
     if (shadow._blurX > 0)
     {
       blurX = Math.max(shadow._blurX / 3, 1);
     }
     if (shadow._blurY > 0)
     {
       blurY = Math.max(shadow._blurY / 3, 1);
     }
     var distance = shadow._distance;
     var angleDegs = shadow._angle;
     
     var angleRads = angleDegs * DvtSvgShadowUtils.RADS_PER_DEGREE;
     var dx = Math.cos(angleRads) * distance;
     var dy = Math.sin(angleRads) * distance;

     //BUG FIX #12427741: 
     //if we have a boundsRect, increase the size of the filter so
     //that the shadow has room to display outside the shape
     var boundsRect = svgDisplayable.getDimensions(svgDisplayable.getParent());
     if (boundsRect)
     {
       //try to optimize based on how much of the shadow falls
       //on each side of the bounding box
       var absDistance = Math.abs(distance);
       //use two times the blur by default, because using it directly
       //still clips the shadow
       var padLeft = 2 * origBlurX;
       var padRight = 2 * origBlurX;
       var padTop = 2 * origBlurY;
       var padBottom = 2 * origBlurY;
       if (distance > 0)
       {
         padLeft -= absDistance;
         padTop -= absDistance;
         padRight += absDistance;
         padBottom += absDistance;
       }
       else if (distance < 0)
       {
         padLeft += absDistance;
         padTop += absDistance;
         padRight -= absDistance;
         padBottom -= absDistance;
       }
       if (padLeft < 0)
       {
         padLeft = 0;
       }
       if (padTop < 0)
       {
         padTop = 0;
       }
       if (padRight < 0)
       {
         padRight = 0;
       }
       if (padBottom < 0)
       {
         padBottom = 0;
       }
       var ratioLeft = (padLeft / boundsRect.w) * 100;
       var ratioRight = (padRight / boundsRect.w) * 100;
       var ratioTop = (padTop / boundsRect.h) * 100;
       var ratioBottom = (padBottom / boundsRect.h) * 100;
       if (filtContext.getRegionPctRect().x > -ratioLeft)
       {
         filtContext.getRegionPctRect().x = -ratioLeft;
       }
       if (filtContext.getRegionPctRect().y > -ratioTop)
       {
         filtContext.getRegionPctRect().y = -ratioTop;
       }
       if (filtContext.getRegionPctRect().w < (100 + ratioLeft + ratioRight))
       {
         filtContext.getRegionPctRect().w = (100 + ratioLeft + ratioRight);
       }
       if (filtContext.getRegionPctRect().h < (100 + ratioTop + ratioBottom))
       {
         filtContext.getRegionPctRect().h = (100 + ratioTop + ratioBottom);
       }
     }
     // The bounding box does not take into accoutn stroke-width. Need to adjust for DvtLine objects
     if (svgDisplayable instanceof DvtSvgPolyline) {
         var strokeWidth = svgDisplayable.getStroke().getWidth();
         // If stroke is wider than 1 pixel, adjust y coordinate and height of shadow bounding box
         if (strokeWidth > 1) {
             filtContext.getRegionPctRect().h = filtContext.getRegionPctRect().h + strokeWidth;
             filtContext.getRegionPctRect().y = filtContext.getRegionPctRect().y - strokeWidth;
         }
     }

     var elemCM  = DvtSvgShapeUtils.createElement('feColorMatrix') ;
     elemCM.setAttributeNS(null,'in', 'SourceGraphic') ;
     elemCM.setAttributeNS(null,'type', 'matrix') ;
     elemCM.setAttributeNS(null,'values', '0 0 0 ' + red   + ' 0 ' +
                                          '0 0 0 ' + green + ' 0 ' +
                                          '0 0 0 ' + blue  + ' 0 ' +
                                          '0 0 0 ' + alpha*strength + ' 0') ;
     //var elemCMResult = filtContext.createResultId('colorMatrix');
     //elemCM.setAttributeNS(null,'result', elemCMResult) ;

     var elemGB  = DvtSvgShapeUtils.createElement('feGaussianBlur') ;
     //include both numbers for stdDev when necessary
     var stdDev = blurX;
     if (blurX !== blurY)
     {
       stdDev += " " + blurY;
     }
     elemGB.setAttributeNS(null,'stdDeviation', stdDev) ;
     var elemGBResult = filtContext.createResultId('blur');
     elemGB.setAttributeNS(null,'result', elemGBResult) ;

     var elemO  = DvtSvgShapeUtils.createElement('feOffset') ;
     elemO.setAttributeNS(null,'dx', dx) ;
     elemO.setAttributeNS(null,'dy', dy) ;
     elemO.setAttributeNS(null,'in', elemGBResult) ;
     var elemOResult = filtContext.createResultId('offset');
     elemO.setAttributeNS(null,'result', elemOResult) ;
     
     filtContext.getResultIdsUnder().push(elemOResult);

     filt.appendChild(elemCM) ;
     filt.appendChild(elemGB) ;
     filt.appendChild(elemO) ;


// TDO <feMorphology operator="erode" in="blurred" radius="3" result="eroded"/>
   //}
};

/**
 * @protected
 */
DvtSvgShadowUtils.CreateInnerFilterPrimitives = function(filt, shadow, svgDisplayable, filtContext)
{
   var rgba  = shadow._rgba ;
   var red   = DvtColorUtils.getRed(rgba)/255 ;
   var green = DvtColorUtils.getGreen(rgba)/255 ;
   var blue  = DvtColorUtils.getBlue(rgba)/255 ;
   var rgb   = DvtColorUtils.makeRGB(red, green, blue);
   var alpha = DvtColorUtils.getAlpha(rgba) ;
   
   var origBlurX = shadow._blurX;
   var origBlurY = shadow._blurY;
   //adjust blur values so that SVG behaves more like Flash
   var blurX = Math.max(shadow._blurX / 2, 1);
   var blurY = Math.max(shadow._blurY / 2, 1);
   var distance = shadow._distance;
   var angleDegs = shadow._angle;
   var strength = shadow._strength;
   
   var angleRads = angleDegs * DvtSvgShadowUtils.RADS_PER_DEGREE;
   var dx = Math.cos(angleRads) * distance;
   var dy = Math.sin(angleRads) * distance;
  
   var elemF1  = DvtSvgShapeUtils.createElement('feFlood') ;
   elemF1.setAttributeNS(null,'in', 'SourceGraphic') ;
   elemF1.setAttributeNS(null,'flood-opacity', alpha) ;
   elemF1.setAttributeNS(null,'flood-color', rgb) ;
   var elemF1Result = filtContext.createResultId('flood');
   elemF1.setAttributeNS(null,'result', elemF1Result) ;
   
   var elemC1  = DvtSvgShapeUtils.createElement('feComposite') ;
   elemC1.setAttributeNS(null,'operator', 'out') ;
   elemC1.setAttributeNS(null,'in', elemF1Result) ;
   elemC1.setAttributeNS(null,'in2', 'SourceGraphic') ;
   //var elemC1Result = filtContext.createResultId('comp');
   //elemC1.setAttributeNS(null,'result', elemC1Result) ;

/*
   var elemCM  = DvtSvgShapeUtils.createElement('feColorMatrix') ;
   elemCM.setAttributeNS(null,'in', 'SourceGraphic') ;
   elemCM.setAttributeNS(null,'type', 'matrix') ;
   elemCM.setAttributeNS(null,'values', '0 0 0 ' + red   + ' 0 ' +
                                        '0 0 0 ' + green + ' 0 ' +
                                        '0 0 0 ' + blue  + ' 0 ' +
                                        '0 0 0 ' + alpha + ' 0') ;
   //var elemCMResult = filtContext.createResultId('colorMatrix');
   //elemCM.setAttributeNS(null,'result', elemCMResult) ;
*/

   var elemGB  = DvtSvgShapeUtils.createElement('feGaussianBlur') ;
   //include both numbers for stdDev when necessary
   var stdDev = blurX;
   if (blurX !== blurY)
   {
     stdDev += " " + blurY;
   }
   elemGB.setAttributeNS(null,'stdDeviation', stdDev) ;
   var elemGBResult = filtContext.createResultId('blur');
   elemGB.setAttributeNS(null,'result', elemGBResult) ;
   
   //attempt to use the shadow strength as multiplier for alpha
   //value in blur filter
   var elemCM2  = DvtSvgShapeUtils.createElement('feColorMatrix') ;
   elemCM2.setAttributeNS(null,'in', elemGBResult) ;
   elemCM2.setAttributeNS(null,'type', 'matrix') ;
   elemCM2.setAttributeNS(null,'values', '1 0 0 0 0 ' +
                                        '0 1 0 0 0 ' +
                                        '0 0 1 0 0 ' +
                                        '0 0 0 ' + strength + ' 0') ;
   var elemCM2Result = filtContext.createResultId('colMat');
   elemCM2.setAttributeNS(null,'result', elemCM2Result) ;

   var elemO  = DvtSvgShapeUtils.createElement('feOffset') ;
   elemO.setAttributeNS(null,'dx', dx) ;
   elemO.setAttributeNS(null,'dy', dy) ;
   elemO.setAttributeNS(null,'in', elemCM2Result) ;
   var elemOResult = filtContext.createResultId('offset');
   elemO.setAttributeNS(null,'result', elemOResult) ;
   
   var elemC2  = DvtSvgShapeUtils.createElement('feComposite') ;
   elemC2.setAttributeNS(null,'operator', 'in') ;
   elemC2.setAttributeNS(null,'in', elemOResult) ;
   elemC2.setAttributeNS(null,'in2', 'SourceGraphic') ;
   var elemC2Result = filtContext.createResultId('comp');
   elemC2.setAttributeNS(null,'result', elemC2Result) ;
   
   filtContext.getResultIdsOver().push(elemC2Result);

   filt.appendChild(elemF1) ;
   filt.appendChild(elemC1) ;
   //filt.appendChild(elemCM) ;
   filt.appendChild(elemGB) ;
   filt.appendChild(elemCM2) ;
   filt.appendChild(elemO) ;
   filt.appendChild(elemC2) ;
};

// Copyright (c) 2008, 2013, Oracle and/or its affiliates. 
// All rights reserved. 
/*---------------------------------------------------------------------*/
/*  DvtSvgDisplayable      Svg implementation of DvtDisplayable        */
/*---------------------------------------------------------------------*/
/**
  *  SVG implementation of base displayable object DvtDisplayable.
  *  @extends DvtObj
  *  @class DvtSvgDisplayable is the SVG implementation base class for all displayable
  *  objects (derived from {@link DvtSvgDisplayable}).
  *  Must be superclassed  - do not use directly - all derivatives of DvtSvgDisplayable
  *  should be created via a specific platform factory implementation.
  *  @constructor  
  *  @param {String} id    The object ID (if undefined or null, '?' is used.
  *  @param {String} type  The SVG DOM element type.
  */
var   DvtSvgDisplayable = function(id, type)
{
  this._Init(id) ; 
};


DvtObj.createSubclass(DvtSvgDisplayable, DvtObj, "DvtSvgDisplayable") ;

/**
 * Array of SVG attributes that should be transferred to the outer element.
 * @private
 */
DvtSvgDisplayable._ATTRS_TRANSFERABLE_TO_OUTER = [/*'filter',*/ 'clip-path']

/**
 * A mapping between event types and the string needed to create a new event for dispatch
 * @private
 */
DvtSvgDisplayable._CREATE_EVENT_TYPE_MAP = {click:"click",
                                            mouseover:"mouseover",
                                            mouseout:"mouseout",
                                            mousemove:"mousemove",
                                            keydown:"keydown",
                                            keyup:"keyup"
                                           };

/*---------------------------------------------------------------------*/
/*   _Init()                                                           */
/*---------------------------------------------------------------------*/
/**
  *  Object initializer.
  *  @protected
  */
DvtSvgDisplayable.prototype._Init = function(id, type)
{
  if (id) {
    this._id = id ;
  }
  this._Parent  = null ;
  this._elem  = DvtSvgShapeUtils.createElement(type, this._id) ;
  this._elem._obj = this;    //  pointer back to this object
  
  this._bVisible      = true;
  this._filter        = null;
  this._pixelHinting  = false ;
  this._cursor        = null;
  this._bMouseEnabled = true;
  this._alpha         = 1;
  this._matrix        = null;
  
  this._bubbleClosure = null;
  this._captureClosure = null;
} ;




/*---------------------------------------------------------------------*/
/*    getElem()         Return the SVG element for this object         */
/*---------------------------------------------------------------------*/
/**
  *  Returns the SVG DOM element representing this displayable object.
  *  @returns {DOM_element}  An SVG DOM element representing this displayable object.
  */
DvtSvgDisplayable.prototype.getElem = function()
{
   return  this._elem ;
} ;

/**
 * Returns the outermost SVG DOM element of this displayable.  This should be used when
 * removing this displayable from the DOM.
 * @return {DvtSvgDisplayable}
 */
DvtSvgDisplayable.prototype.getOuterElem = function() {
  return this._outerElem ? this._outerElem : this.getElem();
}

/*---------------------------------------------------------------------*/
/*   get/setId()                                                       */
/*---------------------------------------------------------------------*/
/**
  *   @returns {String}  the id of this shape.
  */
DvtSvgDisplayable.prototype.getId = function()
{
   return this._id ;
} ;
/**
  *   Sets the id of this shape.
  *   @param {String} id  The id for the shape.
  */
DvtSvgDisplayable.prototype.setId = function(id)
{
   if (this._id !== id) {
     if (id && id.length === 0) {
       id = null ;
     }
     this._id = id ;
     this._elem.setAttributeNS(null, 'id', id) ;
   }
} ;


/*---------------------------------------------------------------------*/
/*   getObj()/setObj     Get/Set the controlling (js) object for this  */
/*                       implementation object.                        */
/*---------------------------------------------------------------------*/
/**
  *  @returns {Object}  the controlling (js) object.
  */
DvtSvgDisplayable.prototype.getObj = function()
{
   return this._obj ;
} ;

DvtSvgDisplayable.prototype.setObj = function(obj)
{
   this._obj = obj ;
} ;

/*---------------------------------------------------------------------*/
/*   get/setParent()                                                   */
/*---------------------------------------------------------------------*/
/**
  *  @returns {Object} the (js) parent of this shape.
  */
DvtSvgDisplayable.prototype.getParent = function()
{
   return this._obj.getParent() ;
} ;

/**
  *  Sets the (js) parent of this shape.
  *  @param {Object} parent
  */
DvtSvgDisplayable.prototype.setParent = function(parent)
{
   this._obj.setParent(parent) ;
} ;


/*---------------------------------------------------------------------*/
/*   get/setPixelHinting()                                             */
/*---------------------------------------------------------------------*/
/**
 *  @returns {boolean} the current pixel hinting state.
 */
DvtSvgDisplayable.prototype.getPixelHinting = function () {
  return this._pixelHinting;
};

/**
 * Enables/disables pixel hinting.
 * @param {boolean}  bHint  true if pixel hinting should be interpreted/applied by the
 * implementation platform.
 */
DvtSvgDisplayable.prototype.setPixelHinting = function (bHint) {
  this._pixelHinting = bHint ;
  if (bHint) {
    this._elem.setAttributeNS(null, 'shape-rendering', 'crispEdges') ;
  }
  else {
    this._elem.removeAttributeNS(null, 'shape-rendering') ;
  }
};

/*---------------------------------------------------------------------*/
/*   get/setVisible()                                                  */
/*---------------------------------------------------------------------*/
/**
  *  Gets the visibility of this object.
  *  @returns {boolean}  True if the object is visible, else false.
  */
DvtSvgDisplayable.prototype.getVisible = function()
{
   return this._bVisible ;
};

/**
  *  Enables/disables the visibility of this object.
  *  @param {boolean}  bVis  True if the object is to be visible, else false if
  *  it is to be hidden.
  */
DvtSvgDisplayable.prototype.setVisible = function(bVis)
{
   if (this._bVisible !== bVis) {
     this._bVisible = bVis ;
     if (this instanceof DvtSvgMarker)
      this._elem.setAttributeNS(null, 'visibility', bVis? 'visible' : 'hidden') ;
     else
      this.getElem().setAttributeNS(null, 'visibility', bVis? 'visible' : 'hidden') ;
   }

};


/*---------------------------------------------------------------------*/
/*   setClipPath()                                                     */
/*---------------------------------------------------------------------*/
/**
 *  Sets a clipping region for this object.
 *  @param {DvtClipPath}  cp  the DvtClipPath object specifying the clipping region.
 */
DvtSvgDisplayable.prototype.setClipPath = function(cp) {
  // Bug 14764452 - PANELCARDS NOT CLIPPING IN DIAGRAM
  // if cp is null, clear the clip-path property, 
  // ideally the clipPath should also be removed from the global defs
  // if it's not used.
  if (! cp) {
    this.getOuterElem().setAttributeNS(null, 'clip-path', null);
    return;
  }

  // Create an outer group if there is a matrix defined, since SVG applies transforms before clip paths.
  if(!this._outerElem && this._matrix)
    this._createOuterGroupElem();

  var id = cp.getId() ;
  if (id) {     // essential to have an id to reference
    var context  = this.getObj().getContext() ;

    if (DvtSvgShapeUtils.addClipPath(cp, context))  {    // add to global defs
      // Set the clip path on the outer element of the shape
      this.getOuterElem().setAttributeNS(null, 'clip-path', 'url(#' + id + ')');
    }
  }    
};

DvtSvgDisplayable.prototype.addClipPath = function(cp, context) {
    return DvtSvgShapeUtils.addClipPath(cp, context);
}

/**
 * Returns the bounds of the displayable relative to its coordinate space.
 * @return {DvtRectangle} The bounds of the displayable relative to its coordinate space.
 */
DvtSvgDisplayable.prototype.getDimensions = function() {
  try {
     var bbox = this.getElem().getBBox();
  } catch(e) {
     return null;
  }
  //don't return bbox directly because we don't want calling code
  //to depend on platform-specific API, so instead turn it into 
  //a DvtRectangle
  return new DvtRectangle(bbox.x, bbox.y, bbox.width, bbox.height);
};

//BUG FIX 13842194:
/**
 * Returns the bounds of the displayable relative to its coordinate space,
 * including its stroke width.
 * @return {DvtRectangle} The bounds of the displayable relative to its coordinate space, including its stroke width.
 */
DvtSvgDisplayable.prototype.getDimensionsWithStroke = function() {
  return this.GetDimensionsWithStroke();
};

//BUG FIX 13842194:
DvtSvgDisplayable.prototype.GetDimensionsWithStroke = function(targetCoordinateSpace) {
  //get dims for the shape elem, and change coord space if necessary
  var dims = this.GetElemDimensionsWithStroke();
  if (!targetCoordinateSpace || targetCoordinateSpace === this.getObj())
    return dims;
  else { // Calculate the bounds relative to the target space
    return this.getObj().ConvertCoordSpaceRect(dims, targetCoordinateSpace);
  }
};

//BUG FIX 13842194:
DvtSvgDisplayable.prototype.GetElemDimensionsWithStroke = function() {
  var bbox = null;
  try {
    //always use this._elem, which should point to a concrete shape element
    bbox = this._elem.getBBox();
  } catch(e) {
    return null;
  }
  //don't return bbox directly because we don't want calling code
  //to depend on platform-specific API, so instead turn it into 
  //a DvtRectangle
  return new DvtRectangle(bbox.x, bbox.y, bbox.width, bbox.height);
};

/**
 * Returns true if any of the specified attribute names are present on the element.
 * @param {object} elem  The SVG DOM element.
 * @param {array} attrNames The array of attribute names to look for.
 * @protected
  */
DvtSvgDisplayable.HasAttributes = function(elem, attrNames) {
  if (attrNames)
  {
    var numAttrs = attrNames.length;
    for (var i = 0; i < numAttrs; i++)
    {
      if(elem.getAttributeNS(null, attrNames[i]))
        return true;
    }
  }
  return false;
}

/**
 * Transfer relevant attributes from the original SVG DOM element to the new SVG DOM element.
 * @param {object} fromElem  The SVG DOM element.
 * @param {object} toElem  The new SVG DOM element.
 * @param {array} attrNames The array of attribute names to transfer.
 * @protected
  */
DvtSvgDisplayable.TransferAttributes = function(fromElem, toElem, attrNames)
{
  if (attrNames)
  {
    var attrName;
    var attrValue;
    var numAttrs = attrNames.length;
    for (var i = 0; i < numAttrs; i++)
    {
      attrName = attrNames[i];
      attrValue = fromElem.getAttributeNS(null, attrName);
      if (attrValue)
      {
        fromElem.removeAttributeNS(null, attrName);
        toElem.setAttributeNS(null, attrName, attrValue);
        if (DvtAgent.getAgent().getPlatform() == DvtAgent.IE_PLATFORM) { // bug 14605036, prev removeAttributeNS()
          fromElem.setAttributeNS(null, attrName, null);                 // fails for IE9 (9.0.8112.16421)
        }
      }
    }
  }
};

/**
 * Creates an outer group element to workaround issues with filters and clip paths.
 * @private
 */
DvtSvgDisplayable.prototype._createOuterGroupElem = function()
{
  if(this._outerElem) 
    return;
    
  var outerId = this._id ? this._id + '_outer' : null;  
  this._outerElem = DvtSvgShapeUtils.createElement('g', outerId);
    
  // Reparent the DOM elements
  var parent = this.getParent();
  if(parent) {
    var parentElem = parent.getImpl().getElem();
    parentElem.replaceChild(this._outerElem, this.getElem());
  }
  this._outerElem.appendChild(this.getElem());
  
  // Transfer attributes from the old outermost SVG element to the new outer element
  DvtSvgDisplayable.TransferAttributes(this.getElem(), this._outerElem, DvtSvgDisplayable._ATTRS_TRANSFERABLE_TO_OUTER)
}

/*---------------------------------------------------------------------*/
/*   Event Handling Support                                            */
/*---------------------------------------------------------------------*/

/**
 * Adds an event listener.
 * @param {String} type the event type
 * @param {String} useCapture whether the listener operates in the capture phase
 */
DvtSvgDisplayable.prototype.addListener = function(type, useCapture) {
  var listener = this._getListener(useCapture);
  // on keyboard events, add the listener to the component's wrapping div, since SVG 
  // DOM elements don't support keystrokes. 
  if(type == "keyup" || type == "keydown")
  {
    if(this.getObj())
    {
      var context = this.getObj().getContext();
      var stage = context.getStage();
      var wrappingDiv = stage.getImpl().getSVGRoot().parentNode;
      // allow support for multiple displayables to receive keyboard events
      // TODO: replace this with a singular compound event manager that
      //       will dispatch keyboard events to individual event managers
      if(!wrappingDiv._obj)
      {
        wrappingDiv._obj = []
      }
      if(DvtArrayUtils.indexOf(wrappingDiv._obj, this) == -1)
      {
        wrappingDiv._obj.push(this);
      }
      listener = DvtHtmlKeyboardListenerUtils.getListener(useCapture);
      wrappingDiv.addEventListener(type, listener, useCapture);
    }
  }
  else 
  {
    this.AddElemListener(type, listener, useCapture);
  }
}

DvtSvgDisplayable.prototype.AddElemListener = function(type, listener, useCapture) {
  this.getElem().addEventListener(type, listener, useCapture);
  if (type == "touchend") {
      this.getElem().addEventListener("touchcancel", listener, useCapture);
  }
};

/**
 * Removes an event listener.
 * @param {string} type the event type
 * @param {function} listener the function to call
 * @param {String} useCapture whether the listener operates in the capture phase
 */
DvtSvgDisplayable.prototype.removeListener = function(type, useCapture) {
  var listener = this._getListener(useCapture);
  this.getElem().removeEventListener(type, listener, useCapture);
}

// TODO JSdoc
DvtSvgDisplayable.prototype._getListener = function(useCapture) {
  var thisRef = this;
  if(useCapture) {
    if (!this._captureClosure) {
      this._captureClosure = function (event) {
        thisRef._captureListener(event);
      };
    }
    return this._captureClosure;
  }
  else {
    if (!this._bubbleClosure) {
      this._bubbleClosure = function (event) {
        thisRef._bubbleListener(event);
      };
    }
    return this._bubbleClosure;
  }
}

/**
 * The event listener that is called by the implementation object's bubble phase listeners.
 * This function will wrap the event and delegate to the real event listeners.  
 * @param {object} event the DOM event object
 * @this {object} the platform object actively processing the event object with an event listener
 * @private
 */
DvtSvgDisplayable.prototype._bubbleListener = function(event) {
  if (DvtAgent.getAgent().getPlatform() == DvtAgent.IE_PLATFORM) {
      // Moving an object in the dom for IE causes mouse over events to fire if the moved item is under the mouse
      // Ensure mouse over is not repeatedly called in such a case
      if (event.type == "mouseover") {
          if (this._bubbleHoverItem) {
              if (this._bubbleHoverItem == event.target) {
                  // Prevent infinite loop
                  return;
              } else {
                  // Fire mouse out first
                  var dvtEvent = DvtSvgEventFactory.newEvent(event, this.getObj().getContext());
                  dvtEvent.type = "mouseout";
                  dvtEvent.relatedTarget = dvtEvent.target;
                  dvtEvent.target = DvtSvgBaseEvent.FindDisplayable(this._bubbleHoverItem);
                  this.getObj().FireListener(dvtEvent, false);
              }
          }
          this._bubbleHoverItem = event.target;
      } else if (event.type == "mouseout") {
          this._bubbleHoverItem = null;
      }
  }

  var dvtEvent = DvtSvgEventFactory.newEvent(event, this.getObj().getContext());
  this.getObj().FireListener(dvtEvent, false);
}

/**
 * The event listener that is called by the implementation object's capture phase listeners.
 * This function will wrap the event and delegate to the real event listeners.  
 * @param {object} event the DOM event object
 * @this {object} the platform object actively processing the event object with an event listener
 * @private
 */
DvtSvgDisplayable.prototype._captureListener = function(event) {
  if (DvtAgent.getAgent().getPlatform() == DvtAgent.IE_PLATFORM) {
      // Moving an object in the dom for IE causes mouse over events to fire if the moved item is under the mouse
      // Ensure mouse over is not repeatedly called in such a case
      if (event.type == "mouseover") {
          if (this._captureHoverItem) {
              if (this._captureHoverItem == event.target) {
                  // Prevent infinite loop
                  return;
              } else {
                  // Fire mouse out first
                  var dvtEvent = DvtSvgEventFactory.newEvent(event, this.getObj().getContext());
                  dvtEvent.type = "mouseout";
                  dvtEvent.relatedTarget = dvtEvent.target;
                  dvtEvent.target = DvtSvgBaseEvent.FindDisplayable(this._captureHoverItem);
                  this.getObj().FireListener(dvtEvent, true);
              }
          }
          this._captureHoverItem = event.target;
      } else if (event.type == "mouseout") {
          this._captureHoverItem = null;
      }
  }
  var dvtEvent = DvtSvgEventFactory.newEvent(event, this.getObj().getContext());
  this.getObj().FireListener(dvtEvent, true);
}


/*-------------------------------------------------------------------------*/
/*   CSS Style Support                                                     */
/*-------------------------------------------------------------------------*/

/**
 * @returns {DvtCssStyle} the DvtCSSStyle of this object.
 */ 
DvtSvgDisplayable.prototype.getCSSStyle = function()
{
  return this._cssStyle;
}

/**
 * Sets the DvtCSSStyle of this object.
 * @param {DvtCssStyle} style The DvtCSSStyle of this object.
 */
DvtSvgDisplayable.prototype.setCSSStyle = function(style)
{
  this._cssStyle = style;
}


/**
 * Sets the cursor on this object.
 * @param {String} cursor type
 */
DvtSvgDisplayable.prototype.setCursor = function(cursorType)
{
  this._cursor = cursorType;
  if (cursorType)
  {
    this.getElem().setAttributeNS(null, "cursor", cursorType);
  }
  else
  {
    this.getElem().removeAttributeNS(null, "cursor");
  }
};


/**
 * Gets the cursor used on this object.
 * @type {String}
 */
DvtSvgDisplayable.prototype.getCursor = function()
{
  return this._cursor;
};


/**
 * Sets whether mouse events are enabled on this object.
 * @param {boolean} whether mouse events are enabled
 */
DvtSvgDisplayable.prototype.setMouseEnabled = function(bEnabled)
{
  this._bMouseEnabled = bEnabled;
  var val;
  if (bEnabled)
  {
    val = "visiblePainted";
  }
  else
  {
    val = "none";
  }
  this.getElem().setAttributeNS(null, "pointer-events", val);
};
    

/**
 * Gets whether mouse events are enabled on this object.
 * @type {boolean}
 */
DvtSvgDisplayable.prototype.isMouseEnabled = function()
{
  return this._bMouseEnabled;
};


/*---------------------------------------------------------------------*/
/*   get/setAlpha()                                                    */
/*---------------------------------------------------------------------*/
/**
  *  Returns the alpha channel value.
  *  @type number  
  *  @returns A value between 0 (invisible) and 1 (opaque).
  */
DvtSvgDisplayable.prototype.getAlpha = function()
{
   return this._alpha;
};

/**
  *  Sets the alpha.
  *  @param {number} alpha  A value between 0 (invisible) and 1 (opaque).
  *  @returns nothing
  */
DvtSvgDisplayable.prototype.setAlpha = function(alpha)
{
   //when animating alpha, small values are turned into strings like
   //"3.145e-8", which SVG incorrectly clamps to 1, so just cut off
   //small values here and make them 0
   if (alpha < 0.00001)
     alpha = 0;
   
   if (alpha !== this._alpha)
   {
     this._alpha = alpha;
     this.getElem().setAttributeNS(null,'opacity', this._alpha) ;
   }
};



/**
  *   Set the matrix object to use to transform this container.
  *   @param {DvtMatrix} mat  The matrix object to apply.
  */
DvtSvgDisplayable.prototype.setMatrix = function(mat)
{
  if (mat !== this._matrix)
  {
    // Create an outer elem if needed
    if(!this._outerElem && DvtSvgDisplayable.HasAttributes(this.getElem(), DvtSvgDisplayable._ATTRS_TRANSFERABLE_TO_OUTER)) 
      this._createOuterGroupElem();
  
    this._matrix = mat ;
    //apply the new matrix if it's non-null
    if (mat)
    {
      var sMat = 'matrix(' + mat.getA() + ',' + mat.getC() + ',' + mat.getB() + ',' + mat.getD() + ',' + mat.getTx() + ',' + mat.getTy() + ')';
      
      //set the transform attribute on the outer SVG element of this shape
      this.SetElemMatrix(sMat);
      //set the vector-effect attribute to prevent the stroke-width
      //from scaling with the transform
      //NOTE: this is commented out for now because it causes strange rendering
      //artifacts when scaling to a small value
      //this.getElem().setAttributeNS(null,'vector-effect', 'non-scaling-stroke') ;
    }
    //if clearing the existing matrix by setting a null or undefined mat,
    //then remove the existing attribute from the DOM
    else
    {
      var transformAttr = this.getElem().getAttributeNS(null,'transform');
      if (transformAttr)
      {
        this.getElem().removeAttributeNS(null, 'transform');
        if (DvtAgent.getAgent().getPlatform() == DvtAgent.IE_PLATFORM) { // bug 14617946, prev removeAttributeNS()
          this.getElem().setAttributeNS(null, 'transform', null);        // fails for IE9 (9.0.8112.16421)
        }

      }
      //NOTE: this is commented out for now because it causes strange rendering
      //artifacts when scaling to a small value
      var vectorEffectAttr;// = this.getElem().getAttributeNS(null,'vector-effect');
      if (vectorEffectAttr)
      {
        this.getElem().removeAttributeNS(null, 'vector-effect');
      }
    }
  }
};


DvtSvgDisplayable.prototype.SetElemMatrix = function(sMat) {
  this.getElem().setAttributeNS(null,'transform', sMat) ;
};


DvtSvgDisplayable.prototype.applyDrawEffects = function(effects)
{
  // Create an outer group if there is a matrix defined, since SVG applies transforms before filters.
  if(!this._outerElem && this._matrix)
    this._createOuterGroupElem();

  //remove current filter
  if (this._filter)
  {
    this.getObj().getContext().removeDefs(this._filter);
    this._filter = null;
    this.getOuterElem().removeAttributeNS(null, 'filter');
  }
  
  //add new filter if necessary
  if (effects && effects.length > 0)
  {
    //Bug 12394679: Repaint bug in Firefox requires us to force a repaint after removing filter
    //At worst we will create n empty filters where n=# markers
    this._filter = DvtSvgFilterUtils.createFilter(effects, this);
    if (this._filter) {
        this.getObj().getContext().appendDefs(this._filter);
        var filterId = this._filter.getAttributeNS(null, 'id');
        this.getOuterElem().setAttributeNS(null, 'filter', 'url(#' + filterId + ')');
    }
  }
  
};


/**
 * Sets the WAI-ARIA role.
 * @param {String} role The role attribute value.
 */
DvtSvgDisplayable.prototype.setAriaRole = function(role) {
  if (role)
    this.getElem().setAttributeNS(null, 'role', role);
  else
    this.getElem().removeAttributeNS(null, 'role');
}

/**
 * Sets the WAI-ARIA property/state.
 * @param {String} property The property/state attribute name. The prefix "aria-" should be skipped.
 * @param {String} value The property/state attribute value.
 */
DvtSvgDisplayable.prototype.setAriaProperty = function(property, value) {
  if (value)
    this.getElem().setAttributeNS(null, 'aria-' + property, value);
  else
    this.getElem().removeAttributeNS(null, 'aria-' + property);
}


/**
 * Convert a point from stage coords to local coords.
 * @param {DvtPoint}  point  point in stage coords
 * @type DvtPoint
 */
DvtSvgDisplayable.prototype.stageToLocal = function(point)
{
   var displayable = this.getObj();
   var pathToStage = displayable.getPathToStage();
   var mat;
   var retPoint = point;
   for (var i = pathToStage.length - 1; i >= 0; i--)
   {
      displayable = pathToStage[i];
      mat = displayable.getMatrix().clone();
      mat.invert();
      retPoint = mat.transformPoint(retPoint);
   }
   return retPoint;
};

/**
 * Convert a point from local coords to stage coords.
 * @param {DvtPoint}  point  point in local coords
 * @type DvtPoint
 */
DvtSvgDisplayable.prototype.localToStage = function(point)
{
   var displayable = this.getObj();
   var pathToStage = displayable.getPathToStage();
   var mat;
   var retPoint = point;
   for (var i = 0; i < pathToStage.length; i++)
   {
      displayable = pathToStage[i];
      mat = displayable.getMatrix();
      retPoint = mat.transformPoint(retPoint);
   }
   return retPoint;
};

/*
 * Creates a copy of the svg content, wrapped by a new container
 */
DvtSvgDisplayable.prototype.createCopy = function() 
{
   var clonedSvg = this.getElem().cloneNode(true);
   var clonedContainer = new DvtContainer(this.getObj().getContext(), "clonedContainer");
   clonedContainer.getImpl().getElem().appendChild(clonedSvg);
   this._disableEvents(clonedSvg);
   return clonedContainer;
}

DvtSvgDisplayable.prototype._disableEvents = function(svgElem) 
{
   var child = svgElem.firstChild;
    //loop over all children
    while (child != null) {
        if (child.setAttributeNS) {
            child.setAttributeNS(null, "pointer-events", "none");
            child.setAttributeNS(null, "id", null);
        }
        this._disableEvents(child);
        child = child.nextSibling;
    }
}

/**
 * Dispatch event
 * @param {String} eventType
 * @param {String} params An optional parameter to specify other parameters for the event
 */
DvtSvgDisplayable.prototype.dispatchDisplayableEvent = function(eventType, params) 
{
    var createEventType = DvtSvgDisplayable._CREATE_EVENT_TYPE_MAP[eventType];
    var context;
    if ("click" == createEventType ||
        "mouseover" == createEventType ||
        "mouseout" == createEventType ||
        "mousemove" == createEventType) {
        if (document.createEvent) {
            context = this.getObj().getContext();
            var dim = this.getObj().getDimensions();
            var elementPosition = this.getObj().localToStage(new DvtPoint(dim.x, dim.y));
            var absoluteStagePos = context.getStageAbsolutePosition();
            var absoluteElementPosition = new DvtPoint(absoluteStagePos.x + elementPosition.x, absoluteStagePos.y + elementPosition.y);
            var event = document.createEvent("MouseEvents");
            event.initMouseEvent(createEventType, true, true, window, 1, absoluteElementPosition.x, absoluteElementPosition.y, absoluteElementPosition.x, absoluteElementPosition.y, false, false, false, false, 0, null);
            this.getElem().dispatchEvent(event);
        }
    }
    else if ("keydown" == createEventType ||
             "keyup" == createEventType) {
      if (document.createEvent) {
        var keyboardEvent = document.createEvent("KeyboardEvent");
        var keycode = parseInt(params);
        
        if(this._ctrlKeyPressed === undefined)
          this._ctrlKeyPressed = false;

        if(this._shiftKeyPressed === undefined)
          this._shiftKeyPressed = false;
        
        if(keycode == DvtKeyboardEvent.CONTROL) {
          if(this._ctrlKeyPressed && createEventType == "keyup")
            this._ctrlKeyPressed = false;
          else if(!this._ctrlKeyPressed && createEventType == "keydown")
            this._ctrlKeyPressed = true;
        } 
        else if(keycode == DvtKeyboardEvent.SHIFT) {
          if(this._shiftKeyPressed && createEventType == "keyup")
            this._shiftKeyPressed = false;
          else if(!this._shiftKeyPressed && createEventType == "keydown")
            this._shiftKeyPressed = true;
        }
          
        
        if (typeof(keyboardEvent.initKeyboardEvent) != 'undefined') {
          keyboardEvent.initKeyboardEvent(createEventType, true, true, window, this._ctrlKeyPressed, false, this._shiftKeyPressed, false, keycode, keycode);
        } else {
          keyboardEvent.initKeyEvent(createEventType, true, true, window, this._ctrlKeyPressed, false, false, this._shiftKeyPressed, keycode, keycode);
        }        
      
        /*      
        ideally, we would just create the native keyboard event and disptach it to the wrapping div, but we
        can't for two reasons
        1. when the keyboardEvent is initialized above, the initKeyboardEvent method used by Webkit doesn't initialize
           the event with the right keycode; it is always 0.  This is a known bug tracked in Chromium and at Webkit
           see http://code.google.com/p/chromium/issues/detail?id=27048 (Chromium) and
           https://bugs.webkit.org/show_bug.cgi?id=16735 (Webkit)
        2. since the native event doesn't work, I tried dispatching a DvtSvgKeyboardEvent to the wrapping div.
           however, this generates a DOM EventException of type UNSPECIFIED_EVENT_TYPE_ERR, even though the
           type of the DvtSvgKeyboardEvent was specified.
        
        So, instead, we will directly call the bubble listener that we attach to the wrapping div 
        */
        
        var svgKeyboardEvent = DvtSvgEventFactory.newEvent(keyboardEvent);
        svgKeyboardEvent.keyCode = keycode;
        svgKeyboardEvent.ctrlKey = this._ctrlKeyPressed;
        svgKeyboardEvent.shiftKey = this._shiftKeyPressed;
      
        if(this.getObj()) {
          context = this.getObj().getContext();
          var stage = context.getStage();
          var wrappingDiv = stage.getImpl().getSVGRoot().parentNode;
          DvtHtmlKeyboardListenerUtils._bubbleListener.call(wrappingDiv, svgKeyboardEvent);
        }
      }
    }
}

// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*---------------------------------------------------------------------*/
/*  DvtSvgContainer         SVG implementation of DvtContainer         */
/*---------------------------------------------------------------------*/
/**  SVG implementation of DvtContainer.
  *  @extends DvtSvgDisplayable
  *  @class DvtSvgContainer
  *  @constructor  
  *  @param {String} id   An optional id for this object.
  *  @param {String} type  The SVG DOM element type.
  */ 
var   DvtSvgContainer = function(id, type)
{
  this._Init(id, type) ; 
};

DvtObj.createSubclass(DvtSvgContainer, DvtSvgDisplayable, "DvtSvgContainer") ;

/**
  * @protected
  * Array of SVG attributes that should be transferred from the shape
  * tag to the group when this shape becomes a group (when children
  * are added to it).
  */
DvtSvgContainer.AttributesTransferableToGroup = ['transform', 'opacity', 'style', 'visibility', 'pointer-events', 'clip-path'];


/*---------------------------------------------------------------------*/
/*   addChild()           Add a child to this container                */
/*---------------------------------------------------------------------*/
/**
  *   Adds the specifed object as a child of this container.  The object is
  *   added to the end of the child list.
  *   @param {DvtSvgDisplayable} obj The object to be added.
  */
DvtSvgContainer.prototype.addChild = function(obj)
{

  if (this._bShapeContainer) {
    //  This is a shape "container".
    //  If no previous children, will create a group DOM element for the this
    //  (parent) object and add the new child to the child group DOM element.
    //  else will add the object directly to the shape group container element.

    this.CreateChildGroupElem(false);
  }

  //  Bug 15865017 - GET RID OF DVTGOLINK AND IMPLS
  //  if there is an anchor elem <a> for this container
  //  append child to the <a> element 
  //  otherwise append child directly to this container group element

  var containerElem = this.getContainerElem();
  containerElem.appendChild(obj.getOuterElem());

} ;

/**
  *   Adds the specified object as a child of this container at the specified index. Returns
  *   immediately if the index position doesn't already exist in the child list.  If a currently
  *   occupied index is specified, the current child at that position and all subsequent children
  *   are moved one position higher in the list.
  *   @param {DvtSvgDisplayable} obj The object to be added.
  *   @param {number} index The index at which to add this object
  */
DvtSvgContainer.prototype.addChildAt = function(obj, index)
{
  var idx = index;

  if (this._bShapeContainer) {
    //  This is a shape "container".
    //  If no previous children, will create a group DOM element for the this
    //  (parent) object and add the new child to the child group DOM element.
    //  else will add the object directly to the shape group container element.
    this.CreateChildGroupElem(false);

    //need to increment the index to account for the shape dom element,
    //which should be the first child of the childGroupElem
    idx++;
  }

  //  Bug 15865017 - GET RID OF DVTGOLINK AND IMPLS
  //  if there is an anchor elem <a> for this container
  //  append child to the <a> element 
  //  otherwise append child directly to this container group element

  var containerElem = this.getContainerElem();
  containerElem.appendChild(obj.getOuterElem());

  var existingNode = containerElem.childNodes[idx];
  // BUG #12661320: IE9 cannot handle a value of undefined in insertBefore.  Set to null in such a case. 
  if (!existingNode)
    existingNode = null;
  containerElem.insertBefore(obj.getOuterElem(), existingNode);
}

/**
 * Returns an rray of SVG attributes that should be transferred from the shape
 * tag to the group when this shape becomes a group (when children are added to it).
 * @return {array}
 */
DvtSvgContainer.prototype.GetAttributesTransferableToGroup = function() {
  return DvtSvgContainer.AttributesTransferableToGroup;
}

/*---------------------------------------------------------------------*/
/*   addChildAfter()                                                   */
/*---------------------------------------------------------------------*/
/**
  *   Adds the specifed object as a child of this container after a specific
  *   object in the child list.
  *   @param {Object} obj  The object to be added.
  *   @param {Object} objAfter  The object after which the new child is to be added.
  */
DvtSvgContainer.prototype.addChildAfter = function(obj, objAfter)
{
     // To Do  JRM
} ;


/*---------------------------------------------------------------------*/
/*  addChildBefore()                                                   */
/*---------------------------------------------------------------------*/
/**
  *   Adds the specifed object as a child of this container before a specific
  *   object in the child list.
  *   @param {Object} obj  The object to be added.
  *   @param {Object} objBefore  The object before which the new child is
  *   to be added.
  */
DvtSvgContainer.prototype.addChildBefore = function(obj, objBefore)
{
     // To Do JRM
} ;




/**
  * @override
  */
DvtSvgContainer.prototype.getElem = function()
{
  return (this._childGroupElem? this._childGroupElem : this._elem) ;
} ;

/*---------------------------------------------------------------------*/
/*   _Init()                                                           */
/*---------------------------------------------------------------------*/
/**
  *  Object initializer.
  *  @protected
  */
DvtSvgContainer.prototype._Init = function(id, type)
{
  // For the SVG implementation, we need to know whether this is a standard
  // non-shape container, or a shape "container".  Since elementary objects
  // may not be nested, e.g. a rect containing another rect, an artificial 
  // group must be constructed to group the parent and the children.  That
  // is they actually become grouped siblings.


  this._bShapeContainer = (this instanceof DvtSvgShape) ;  // if shape "container"

  DvtSvgContainer.superclass._Init.call(this, id, type) ;

  this._childGroupElem  = null ;       // child surround group
} ;


/*---------------------------------------------------------------------*/
/*    removeChild()                                                    */
/*---------------------------------------------------------------------*/
/**
  *   Removes the specified child object from this container.
  *   @param {DvtSvgDisplayable} obj The object to be removed.
  */
DvtSvgContainer.prototype.removeChild = function(obj)
{
   var elemObj  = obj.getOuterElem() ;  // obj's outer DOM element
   var parent   = obj.getParent() ;     // get parent object (the container
                                        // or the shape group container)
   if (elemObj && parent) {
     // Bug 15865017 - GET RID OF DVTGOLINK AND IMPLS
     var elem = this.getContainerElem();
     elem.removeChild(elemObj) ;
   }

   //  If no more children, can remove the added group for child containership,
   //  and reparent the containing shape directly back to its parent in the
   //  position that the added child group container occupied.

   // Bug 15865017 - GET RID OF DVTGOLINK AND IMPLS
   // don't remove the childGroupElem because we need it to hold the anchor
   if (! this._anchorElem && this._bShapeContainer && this.getObj().getNumChildren() === 1) {
     var  childGroupElem       = this._childGroupElem ;
     var  childGroupElemParent = (childGroupElem? childGroupElem.parentNode : null);
     
     if (childGroupElemParent) {
      DvtSvgDisplayable.TransferAttributes(childGroupElem, this._elem, this.GetAttributesTransferableToGroup());     
       childGroupElemParent.replaceChild(this._elem, childGroupElem) ;
       this._childGroupElem = null ;
     }
   }
} ;



/*---------------------------------------------------------------------*/
/*    swap()                                                           */
/*---------------------------------------------------------------------*/

//  In progress  TDO  JRM

/**
  *    Exchanges the positions of two objects in this container..
  */ 
DvtSvgContainer.prototype.swap = function(obj1, obj2)
{
   //  Update the DOM

   var elem1     = obj1.getElem() ;      // obj's DOM element
   var elem2     = objw.getElem() ;
   var parent    = obj1.getParent() ;    // get parent object (the container
                                         // or the shape group container)
   var elem2Next = elem2.nextSibling;

   if (parent && elem1 && elem2) {
     parent.replaceChild(elem1, elem2) ;
     parent.insertBefore(elem1, elem2Next) ;

     // Update the array

     var idx1 = obj1.getIndex() ;
     var idx2 = obj2.getIndex() ;

     this._arList[idx1] = obj2 ;
     this._arList[idx2] = obj1 ;
   }
};

/**
 * Create a group element for adding children.
 * @param {boolean} rmChildren True if all children should be removed
 * @param {boolean} forced True always create a child group element for shape container
 * @protected
 */
DvtSvgContainer.prototype.CreateChildGroupElem = function(rmChildren, forced)
{
  //  This is a shape "container".
  //  If no previous children, will create a group DOM element for the this
  //  (parent) object and add the new child to the child group DOM element.
  //  else will add the object directly to the shape group container element.

  if (! this._childGroupElem && (forced || this.getObj().getNumChildren() === 0)) {
    var childGroupId = this._id ? this._id + '_g' : null;
    this._childGroupElem  = DvtSvgShapeUtils.createElement('g', childGroupId) ;
   
    //  Remove this's DOM element from the parent, and append to child group DOM element.
    var  parent = this.getParent() ;
    var  elemParent ;
    if (parent) {
      elemParent = parent.getImpl().getElem() ;
      elemParent.replaceChild(this._childGroupElem, this._elem) ; 
    }
    if (! rmChildren)
      this._childGroupElem.appendChild(this._elem) ;   // add shape to new group
        
    //transfer attributes from the old outermost SVG element to the
    //new outer group element
    DvtSvgDisplayable.TransferAttributes(this._elem, this._childGroupElem, this.GetAttributesTransferableToGroup());


    //Note need to copy _obj reference to the new group element so that events can be propagated.
    if (this._elem._obj) {
      this._childGroupElem._obj = this._elem._obj;
    }
  }
  else if (rmChildren) {
    this.getObj().removeChildren();
  }

};


//BUG FIX #13641836: setting display='none' causes getDimensions() to 
//throw error in Firefox just like if the element is not on the DOM,
//which in turn breaks several animations
//(leaving this code here, but commented out, as a reference, because
//it was added to fix bug 13511206 in AMX graph)
/**
  *  Enables/disables the visibility of this object.
  *  @param {boolean}  bVis  True if the object is to be visible, else false if
  *  it is to be hidden.
  */
/*DvtSvgContainer.prototype.setVisible = function(bVis)
{
  if (this._bVisible !== bVis) {
      if (this instanceof DvtSvgMarker)
        this._elem.setAttributeNS(null, 'display', bVis? 'inline' : 'none') ;
      else
        this.getElem().setAttributeNS(null, 'display', bVis? 'inline' : 'none') ;
  }
  DvtSvgContainer.superclass.setVisible.call(this, bVis) ;
};*/


//BUG FIX 13842194:
/**
 * @override
 */
DvtSvgContainer.prototype.getDimensionsWithStroke = function() {
  //a pure container has no shape of its own, so calculate the
  //dims for all child shapes in the subtree rooted at this container
  
  //build an initial array of all direct children of this container
  var ar = [];
  var numChildren = this.getObj().getNumChildren();
  for (var i = 0; i < numChildren; i++) {
    ar.push(this.getObj().getChildAt(i));
  }
  
  //loop over the array of children until it's empty
  var totalDims = null;
  while (ar.length > 0) {
    //remove the first object from the array
    var child = ar.shift();
    //get dims in coordinate space of this container, because we're 
    //processing whole subtree of children under this container
    var dims = child.getImpl().GetDimensionsWithStroke(this.getObj());
    if (dims) {
      if (!totalDims) {
        totalDims = dims;
      }
      else {
        totalDims = totalDims.getUnion(dims);
      }
    }
    
    //add any children of current object to end of array
    numChildren = child.getNumChildren();
    for (var i = 0; i < numChildren; i++) {
      ar.push(child.getChildAt(i));
    }
  }
  return totalDims;
};

//BUG FIX 13842194:
DvtSvgContainer.prototype.GetDimensionsWithStroke = function(targetCoordinateSpace) {
  //pure container doesn't have its own dimensions
  return null;
};


/**
 * Adds a hyperlink to this object, remove the old hyperlink if exists.
 * This method adds a <g> and a <a> tags around this object. <g><a><this element></a></g>
 * @param {DvtObj} linkObj contains destination (url) and targetFrame
 */
DvtSvgContainer.prototype.setHyperlink = function(linkObj) 
{
  var destination;
  var frame;

  if (linkObj) {
    destination = linkObj["destination"];
    frame = linkObj["targetFrame"];
  }

  var gElem = this.getElem();
  var aElem;
  var elem = this._elem;

  //if an "a" element already exists, 
  if (this._anchorElem) {
    aElem = this._anchorElem;

    // replace destination and targetFrame
    if (destination) {
      aElem.setAttributeNS(DvtSvgImage.XLINK_NS, 'xlink:href', destination);
      if (frame) {
        aElem.setAttributeNS(null,'target', frame);
      }
      else {
        aElem.removeAttributeNS(null,'target');
      }
    }

    // no destination, remove "a" element
    else {
      if (gElem && aElem.parentNode == gElem) {
        gElem.removeChild(aElem);
        DvtSvgContainer._reparentChildren(gElem, aElem);
      }
      this.setCursor("default");
      this._anchorElem = null;
    }
  }

  // create an "a" element
  else {
    aElem = DvtSvgShapeUtils.createElement('a');
    if (destination)
      aElem.setAttributeNS(DvtSvgImage.XLINK_NS, 'xlink:href', destination);

    if (frame)
      aElem.setAttributeNS(null,'target', frame);

    // need to wrap around shape element (<a><text></a>) with a <g> to avoid
    // dom element replacement error.
    // Bug 15865017 - GET RID OF DVTGOLINK AND IMPLS
    if (this._bShapeContainer) {
      this.CreateChildGroupElem(false, true);
    }

    gElem = this.getElem();    
    DvtSvgContainer._reparentChildren(aElem, gElem);

    gElem.appendChild(aElem);

    this.setCursor(DvtSelectionEffectUtils.getSelectingCursor());
    this._anchorElem = aElem;
  }
};

/*
 * move children from source to target element
 */
DvtSvgContainer._reparentChildren = function(target, source) {
  var childNodes = source.childNodes;

  if (childNodes) {
    var node;
    var lastNode;

    for (var i = childNodes.length - 1; i >= 0; i--) {
      node = childNodes[i];
      if (lastNode) {
        target.insertBefore(node, lastNode);
      }
      else {
        target.appendChild(node);
      }
      lastNode = node;
    }
  }
}

/**
 * Returns the anchor element if exists.
 */
DvtSvgContainer.prototype.getContainerElem = function() {
  return this._anchorElem ? this._anchorElem : this.getElem();
}



// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*---------------------------------------------------------------------*/
/* DvtSvgStage()   Contains all objects associated with a specific SVG */
/*                 Root.                                               */
/*---------------------------------------------------------------------*/
/**
 * @constructor
  *  SVG implementation of DvtStage, representing the highest level container
  *  under the &lt;svg&gt; DOM element.
  *  @extends DvtSvgContainer
  *  @class DvtSvgStage
  */
var   DvtSvgStage = function(svgRoot, id)
{
  this._Init(svgRoot, id) ; 
};

DvtObj.createSubclass(DvtSvgStage, DvtSvgContainer, "DvtSvgStage") ;


/*---------------------------------------------------------------------*/
/*  appendDefs()   Append element(s) to the application global <defs>  */
/*                 element.                                            */
/*---------------------------------------------------------------------*/

DvtSvgStage.prototype.appendDefs = function(elem)
{
  this._elemDefs.appendChild(elem) ;
} ;


/*---------------------------------------------------------------------*/
/*   getDefs()        get the application global <defs> DOM element    */
/*---------------------------------------------------------------------*/

DvtSvgStage.prototype.getDefs = function()
{
   return this._elemDefs ;
} ;



/*---------------------------------------------------------------------*/
/*   getSVGRoot()          Returns the SVG root DOM element            */
/*---------------------------------------------------------------------*/

DvtSvgStage.prototype.getSVGRoot = function()
{
   return this._SVGRoot ;
} ;



/*---------------------------------------------------------------------*/
/*   _Init()                                                           */
/*---------------------------------------------------------------------*/
/** @private */
DvtSvgStage.prototype._Init = function(svgRoot, id)
{
  DvtSvgStage.superclass._Init.call(this, id, 'g') ;

  this._SVGRoot   = svgRoot ;   // containing SVG DOM element
  this._bAppended = true ;

  this._obj = null ;            // the controlling Dvt... object
  
  //to disable ability to select text, bug 13453406
  this.disableSelection(this._elem); 
} ;

DvtSvgStage.prototype.disableSelection = function(target){
    target.onselectstart=function(){return false};
    target.onselect=function(){return false};
};

// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 

/*---------------------------------------------------------------------*/
/*   DvtSvgShapeUtils          Static Shape Utility Functions          */
/*---------------------------------------------------------------------*/

/**
 *   Static Shape Utility Functions
 *   @class DvtSvgShapeUtils
 *   @constructor
 */
var  DvtSvgShapeUtils = function()
{} ;

DvtObj.createSubclass(DvtSvgShapeUtils, DvtObj, "DvtSvgShapeUtils");

DvtSvgShapeUtils._uniqueSeed = 0 ;  // for unique Id creation
DvtSvgShapeUtils._Stage      = null ;


/*---------------------------------------------------------------------*/
/*   addClipPath()                                                     */
/*---------------------------------------------------------------------*/
/**
 *  Adds a clipping region to the global defs element.
 *  @param {DvtClipPath}  cp  the DvtClipPath object specifying the clipping region(s).
 *  @returns {boolean}    true if the clipping paths was successfully added, else false.
 */
DvtSvgShapeUtils.addClipPath = function(cp, context) {

  var bRet = false ;

  var id = cp.getId() ;
  if (! id) {
    return  bRet;    // essential to have an id to reference
  }

  var elemDefs = context.getDefs() ; 
  if (! elemDefs) {
    return bRet;
  }

  // Check if clipping path for this id is already defined.

  var elemClip     = null ;
  var defsChildren = elemDefs.childNodes ;
  var len          = defsChildren.length ;

  for (var i = 0; i < len; i++) {
     var el = defsChildren.item(i) ;
     if (el.id === id) {
       elemClip = el ;
      break ;
    }
  }
  
  //BUG FIX 12613719: Check if this clipping path instance has 
  //already been stored on the context
  var bExists = context.hasClipPath(id, cp);
  
  if (bExists) {
    bRet = true ;   // already exists.
  }
  else {
    //BUG FIX 12613719: if the clipping path instance wasn't already stored, 
    //then remove any old clipping path elem with the same id from the defs
    if (elemClip)
    {
      context.removeDefs(elemClip);
    }
    
    elemClip  = DvtSvgShapeUtils.createElement('clipPath', id) ;
    context.appendDefs(elemClip) ;
    //BUG FIX 12613719: store the clipping path instance on the context
    context.storeClipPath(id, cp);

    var regions = cp.getRegions() ;

    for (var i = 0; i < regions.length; i++) {
       var region = regions[i] ;

       if (region) {
         var  elem = null ;
         
         if (region.type === DvtClipPath.RECT) {
            elem = DvtSvgShapeUtils.createElement('rect', id) ;
            elem.setAttributeNS(null, 'x',      region.x) ;
            elem.setAttributeNS(null, 'y',      region.y) ;
            elem.setAttributeNS(null, 'width',  region.w) ;
            elem.setAttributeNS(null, 'height', region.h) ;
            if (region.rx)
              elem.setAttributeNS(null, 'rx', region.rx) ;
            if (region.ry)
              elem.setAttributeNS(null, 'ry', region.ry) ;
         }
         else if (region.type === DvtClipPath.PATH) {
            elem = DvtSvgShapeUtils.createElement('path', id) ;
            elem.setAttributeNS(null, 'd', region.d) ;
         }
         else if (region.type === DvtClipPath.POLYGON) {
            elem = DvtSvgShapeUtils.createElement('polygon', id) ;
            elem.setAttributeNS(null, 'points', region.points) ;
         }
         else if (region.type === DvtClipPath.ELLIPSE) {
            elem = DvtSvgShapeUtils.createElement('ellipse', id) ;
            elem.setAttributeNS(null,'cx', region.cx) ;
            elem.setAttributeNS(null,'cy', region.cy) ;
            elem.setAttributeNS(null,'rx', region.rx) ;
            elem.setAttributeNS(null,'ry', region.ry) ;
         }
         else if (region.type === DvtClipPath.CIRCLE) {
            elem = DvtSvgShapeUtils.createElement('circle', id) ;
            elem.setAttributeNS(null,'cx', region.cx) ;
            elem.setAttributeNS(null,'cy', region.cy) ;
            elem.setAttributeNS(null,'r', region.r) ;
         }

         if (elem) {
           elemClip.appendChild(elem) ;
         }
         
         bRet = true;
       }

    }
  }

  return bRet ;
};


/*---------------------------------------------------------------------*/
/*   createElement()        Create an SVG DOM element                  */
/*---------------------------------------------------------------------*/
/**
  *  Creates an SVG DOM element.  
  * @param {String} name 
  * @param {String} id  Optional ID to be applied to the created DOM element.
  * @type DOM_Element
  * @base DvtSvgShapeUtils
  */
DvtSvgShapeUtils.createElement = function(name, id)
{
   var elem = document.createElementNS(DvtSvgUtils.SVG_NS, name) ;

   if (id) {
     elem.setAttributeNS(null,'id', id) ;
   }
     
   return elem ;
} ;



/*---------------------------------------------------------------------*/
/*   getUniqueId()              Returns a unique ID string             */
/*---------------------------------------------------------------------*/
/**
 *  Creates a unique ID string
 * @param {String} sPrefix  Optional string used as a prefix for the generated ID. If 
 *                          omitted, the ID generated will be prefixed with '$'.
 * @returns {String}        A unique ID string
 */
DvtSvgShapeUtils.getUniqueId = function(sPrefix)
{
   return  (sPrefix? sPrefix : '$') + DvtSvgShapeUtils._uniqueSeed++ ;
} ;

/**
 * Converts an array of x,y coordinate pairs into an SVG style string.
 * @param {array} arPoints the array of points
 * @returns {Array}  the string usable by SVG polygons and polylines
 */
DvtSvgShapeUtils.convertPointsArray = function(arPoints) {
  var len = arPoints.length ;   // convert to svg space separated list
  var s = '' ;

  for (var i = 0; i < len; i++) {
    if (i > 0) {
      s += ' ' ;
    }
    s += arPoints[i] ;
  }
  return s;
}






// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*---------------------------------------------------------------------*/
/*   DvtSvgShape            Abstract base class for all shapes         */
/*---------------------------------------------------------------------*/
/**
 * A base class for shapes implemented via SVG.  Implements common DvtShape
 * drawing support for properties such as such as stroke and fill types and colors.
 * DvtSvgShape is intended to be subclassed.
 * @extends DvtSvgContainer
 * @class DvtSvgShape
 * @constructor
 * @param {string} id   An id for the object.
 * @param {string} type The SVG DOM element type - e.g. 'circle', 'rect', etc.
 */
var DvtSvgShape = function (id, type) {
  this._Init(id, type);
};

//  Allow shapes to become 'containers' themselves.  Note: this does not
//  provide a true parent/child relationship since this not available in SVG.
DvtObj.createSubclass(DvtSvgShape, DvtSvgContainer, "DvtSvgShape");




/*---------------------------------------------------------------------*/
/*  _Init()                                                            */
/*---------------------------------------------------------------------*/
/** @private */
DvtSvgShape.prototype._Init = function (id, type) {
  DvtSvgShape.superclass._Init.call(this, id, type);

  //  Base shape properties
  this._stroke = null;
  this._fill = null;
  this._origFill = null;
  this._origStroke = null;
  this._bHollow = false;

  // Since setFill() may never be called, will set a default no 'fill'
  this._elem.setAttributeNS(null, 'fill', 'none');
};

/*---------------------------------------------------------------------*/
/*   get/setFill()                                                     */
/*---------------------------------------------------------------------*/
/**
 *  Returns the fill object (derivative of {@link DvtFill}) applied to this shape.
 * @type DvtFill
 */
DvtSvgShape.prototype.getFill = function () {
  return this._fill;
};

/**
 *  Sets the fill properties on this shape from the supplied fill object (a
 *  derivative of {@link DvtFill}).
 *  @param {DvtFill}  obj  A fill object. If null is specified, a transparent
 *  fill results.
 */
DvtSvgShape.prototype.setFill = function (obj) {
  
  this._manageDefinitions(this._fill, obj);

  if (!obj) {
    this._elem.setAttributeNS(null, 'fill', 'none');
    this._elem.removeAttributeNS(null, 'fill-opacity');
    this._fill = null;
    return;
  }
  else {
    if (this._fill === obj) {
      return;
    }
  }
  this._fill = obj;

  // gradient
  if (obj instanceof DvtGradientFill) {
    this._setSpecFill(obj, DvtSvgGradientUtils);
  }

  // background image
  else if (obj instanceof DvtImageFill) {
    this._setSpecFill(obj, DvtSvgImageFillUtils);
  }

  // pattern
  else if (obj instanceof DvtPatternFill) {
    this._setSpecFill(obj, DvtSvgPatternFillUtils);
  }

  //  Basic fill
  else {
    var color = obj.getColor();
    if (color) {
      var alpha = obj.getAlpha();
      // Workaround for Safari where versions < 5.1 draw rgba values as black
      var agent = DvtAgent.getAgent();
      if (agent.isSafari() && color.indexOf("rgba") !==  - 1) {
        this._elem.setAttributeNS(null, 'fill', DvtColorUtils.getRGB(color));
        // Use alpa in rgba value as a multiplier to the alpha set on the object as this is what svg does.
        if (alpha != null)
          this._elem.setAttributeNS(null, 'fill-opacity', DvtColorUtils.getAlpha(color) * alpha);
        else 
          this._elem.setAttributeNS(null, 'fill-opacity', DvtColorUtils.getAlpha(color));
      }
      else {
        this._elem.setAttributeNS(null, 'fill', color);
        if (alpha != null)
          this._elem.setAttributeNS(null, 'fill-opacity', alpha);
      }
    }
  }
};

DvtSvgShape.prototype._setSpecFill = function (obj, func) {
  var id;
  if (!obj.isLocked()) {
    id = obj.getId();
    if (!id) {
      if (obj instanceof DvtPatternFill) {
        id = DvtSvgShapeUtils.getUniqueId("pat");// no id - create unique internal id
      }
      else {
        id = DvtSvgShapeUtils.getUniqueId('Gr');// no id - create unique internal id
      }
      obj.setId(id);
    }
  }
  else {
    id = obj.getId();
  }
  if (!obj._defPresent) {
    var elem = obj._defElem;
    if (!elem)
        elem = func.createElem(obj, id);// create SVG DOM elem
    obj._defElem = elem;
    this.getObj().getContext().appendDefs(elem);
    obj._defPresent = true;
  }
  
  this._elem.setAttributeNS(null, 'fill', 'url(#' + id + ')');
  this._elem.setAttributeNS(null, 'fill-opacity', '1');
};

/*---------------------------------------------------------------------*/
/*   get/setStroke()                                                   */
/*---------------------------------------------------------------------*/
/**
 *  Returns the stroke object (derivative of {@link DvtStroke}) applied to this shape.
 * @type DvtStroke
 */
DvtSvgShape.prototype.getStroke = function () {
  return this._stroke;
};

/**
 *  Sets the stroke properties on this shape from the supplied stroke object.
 *  If the stroke object is null, any existing stroke is removed.
 *  @param {DvtStroke}  obj  A stroke object.
 */
DvtSvgShape.prototype.setStroke = function (obj) {

  this._manageDefinitions(this._stroke, obj);
  
  this._stroke = obj;

  if (!obj) {
    this._elem.removeAttributeNS(null, 'stroke');
    this._elem.removeAttributeNS(null, 'stroke-opacity');
    this._elem.removeAttributeNS(null, 'stroke-width');
    this._elem.removeAttributeNS(null, 'stroke-dasharray');
    this._elem.removeAttributeNS(null, 'stroke-linejoin');
    this._elem.removeAttributeNS(null, 'stroke-linecap');
    this._elem.removeAttributeNS(null, 'stroke-miterlimit');
    return;
  }

  //  Stroke color/alpha
  // gradient
  if (obj instanceof DvtGradientStroke) {
    this._setSpecStroke(obj, DvtSvgGradientUtils);
  }
  else {
    var color = obj.getColor();
    if (color) {
      var alpha = obj.getAlpha();
      // Workaround for Safari where versions < 5.1 draw rgba values as black
      var agent = DvtAgent.getAgent();
      if (agent.isSafari() && color.indexOf("rgba") !==  - 1) {
        this._elem.setAttributeNS(null, 'stroke', DvtColorUtils.getRGB(color));
        // Use alpa in rgba value as a multiplier to the alpha set on the object as this is what svg does.
        if (alpha != null)
          this._elem.setAttributeNS(null, 'stroke-opacity', DvtColorUtils.getAlpha(color) * alpha);
        else 
          this._elem.setAttributeNS(null, 'stroke-opacity', DvtColorUtils.getAlpha(color));
      }
      else {
        this._elem.setAttributeNS(null, 'stroke', color);
        if (alpha != null)
          this._elem.setAttributeNS(null, 'stroke-opacity', alpha);
      }
    }
  }

  //  Stroke width
  this._elem.setAttributeNS(null, 'stroke-width', obj.getWidth());

  //  Stroke type/style
  var st = obj.getType();
  if (st !== DvtStroke.SOLID) {
    this._elem.setAttributeNS(null, 'stroke-dasharray', obj.getDash());
  }
  else {
    this._elem.removeAttributeNS(null, 'stroke-dasharray');
  }

  //  Line-joining attribute
  attrib = obj.getLineJoin();
  if (attrib) {
    this._elem.setAttributeNS(null, 'stroke-linejoin', attrib);
  }

  //  Line-ending attribute
  attrib = obj.getLineEnd();
  if (attrib) {
    this._elem.setAttributeNS(null, 'stroke-linecap', attrib);
  }

  //  miter limit attribute
  attrib = obj.getMiterLimit();
  if (attrib) {
    this._elem.setAttributeNS(null, 'stroke-miterlimit', attrib);
  }
};

/**
 * Private helper function to create gradient, add it to def section of the SVG DOM,
 * and set the stroke to point to the gradient def
 * @private
 */
DvtSvgShape.prototype._setSpecStroke = function (obj, func) {
  var id;
  if (!obj.isLocked()) {
    id = obj.getId();
    if (!id) {
      id = DvtSvgShapeUtils.getUniqueId('Gr');// no id - create unique internal id
      obj.setId(id);
    }
  }
  else {
    id = obj.getId();
  }
  
  if (!obj._defPresent) {
      var elem = obj._defElem;
      if (!elem)
          elem = func.createElem(obj, id);// create SVG DOM elem
      obj._defElem = elem;
      this.getObj().getContext().appendDefs(elem);
      obj._defPresent = true;
  }


  this._elem.setAttributeNS(null, 'stroke', 'url(#' + id + ')');
  var alpha = obj.getAlpha();
  if (alpha != null) {
    this._elem.setAttributeNS(null, 'stroke-opacity', alpha);
  }
};

/**  Changes the shape to an outline shape format.  Used for legends
 *  markers that represent a hidden state for the associated series risers.
 *  @param {String} fc Border color for hollow shape in format of #aarrggbb
 *  @param {number} strokeWidth Stroke width used for shapes that were transofrmed (optional)
 */
DvtSvgShape.prototype.setHollow = function (fc, strokeWidth) {
  if (!this._bHollow) {
    // Save original fill and stroke to restore 
    this._origFill = this._fill;
    this._origStroke = this._stroke;
    // Set hollow shape fill and stroke based on shape fill
    var hollowFill = new DvtSolidFill('#ffffff', 0.001);
    var hollowStroke;
    if (fc) {
      hollowStroke = new DvtSolidStroke(DvtColorUtils.getRGB(fc), DvtColorUtils.getAlpha(fc), strokeWidth);
    }
    else {
      hollowStroke = new DvtSolidStroke(this._fill.getColor(), this._fill.getAlpha(), strokeWidth);
    }
    this.setFill(hollowFill);
    this.setStroke(hollowStroke);
    this._bHollow = true;
  }
  else {
    this.setFill(this._origFill);
    this.setStroke(this._origStroke);
    this._bHollow = false;
  }
};

/**  Returns whether a shape is hollow.
 *  @returns {boolean} True if the shape is hollow
 */
DvtSvgShape.prototype.isHollow = function () {
  return this._bHollow;
}

/*
 * Manage the gradient/filter definitions for svg by keeping a reference count and removing unreferenced defs
 */
DvtSvgShape.prototype._manageDefinitions = function(oldObj, newObj) {
  // If a new obj is specified, adjust reference counts and remove def if 0 references
  if (oldObj != newObj) {
    // Decrease count on existing obj
    if (oldObj) {
        oldObj._referenceCount--;
        if (oldObj._referenceCount == 0) {
            if (oldObj._defElem) {
                this.getObj().getContext().removeDefs(oldObj._defElem);
                oldObj._defPresent = false;
            }
        }

    }
    if (newObj) {
        if (!newObj._referenceCount)
            newObj._referenceCount = 0;
        newObj._referenceCount++;
    }
  }
}

//BUG FIX 13842194:
/**
 * @override
 */
DvtSvgShape.prototype.getDimensionsWithStroke = function() {
  //get the dims for this shape by itself
  var dims = this.GetElemDimensionsWithStroke();
  //get the dims for any children of this container
  var containerDims = DvtSvgShape.superclass.getDimensionsWithStroke.call(this);
  //create union of shape and container dims
  if (dims && containerDims) {
    dims = dims.getUnion(containerDims);
  }
  else if (containerDims) {
    dims = containerDims;
  }
  
  return dims;
};

//BUG FIX 13842194:
DvtSvgShape.prototype.GetDimensionsWithStroke = function(targetCoordinateSpace) {
  //get the dims for this shape by itself
  var dims = this.GetElemDimensionsWithStroke();
  if (!targetCoordinateSpace || targetCoordinateSpace === this.getObj())
    return dims;
  else { // Calculate the bounds relative to the target space
    return this.getObj().ConvertCoordSpaceRect(dims, targetCoordinateSpace);
  }
};

//BUG FIX 13842194:
DvtSvgShape.prototype.GetElemDimensionsWithStroke = function() {
  //get the dims for this shape by itself
  var dims = DvtSvgShape.superclass.GetElemDimensionsWithStroke.call(this);
  //assume that stroke touches every edge of bounding box, so push out
  //every edge by half the stroke width
  var stroke = this.getStroke();
  if (dims && stroke) {
    var sw = stroke.getWidth();
    if (sw) {
      var halfSw = .5 * sw;
      dims.x -= halfSw;
      dims.y -= halfSw;
      dims.w += sw;
      dims.h += sw;
    }
  }
  return dims;
};
// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*---------------------------------------------------------------------*/
/*    DvtSvgArc                 Svg implementation of arc              */
/*---------------------------------------------------------------------*/
/**
  *  Creates an arc (a portion of an ellipse or circle) implemented by SVG.
  *  @extends DvtSvgShape
  *  @class  DvtSvgArc  Creates an arc (a portion of an ellipse or circle)
  *  implemented by SVG.  Do not create directly, use DvtArc.
  *  <p>
  *  Example:<br><br><code>
  *  //  Create an arc from an ellipse centered at (50,50) with radii 100 and<br>
  *  // 200, and starting at angle 40, for an extent of 75.<br><br>
  *  var  arc = new DvtArc(context,50,50,100,200,40, 75);<br><br>
  *  //  Create an arc from a circle centered at (50,50) with radii 100<br>
  *  //  starting at angle 40, for an extent of 75.<br><br>
  *  var  arc = new DvtArc(context,50,50,100,40,75);<br>
  *  </code>
  *  @constructor  
  *  @param {number} cx  The center x position.
  *  @param {number} cy  The center y position.
  *  @param {number} rx  The horizontal radius of the ellipse.
  *  @param {number} ry  The vertical radius of the ellipse. (use the same value as
  *                      the horizontal radius if a circular arc.)
  *  @param {number} sa  The starting angle in degrees (following the normal anti-clockwise is positive convention).
  *  @param {number} ae  The angle extent in degrees (following the normal anti-clockwise is positive convention).
  *  @param {String} clos  An optional closure type for the arc. Closure types are {@link DvtArc#OPEN} (the default),
  *                        {@link DvtArc#CHORD} and {@link DvtArc#PIE}.
  *   @param {String} id  Optional ID for the shape (see {@link  DvtDisplayable#setId}).
  */
var  DvtSvgArc = function(cx, cy, rx, ry, sa, ae, clos, id)
{
   this._Init(cx, cy, rx, ry, sa, ae, clos, id) ;
};

DvtObj.createSubclass(DvtSvgArc, DvtSvgShape, "DvtSvgArc") ;



/*---------------------------------------------------------------------*/
/*  _AddClosure()                                                      */
/*---------------------------------------------------------------------*/
/** @private */
DvtSvgArc.prototype._addClosure = function(p)
{
  if (this._ct === DvtArc.CHORD) {
    p += ' z' ;
  }
  else if (this._ct === DvtArc.PIE) {
    p += ' L ' + this._cx + ',' + this._cy + ' z' ;
  }
  else if (this._ct === DvtArc.OPEN) {
    this.setFill(null) ;
  }

  return p ;
} ;



/*---------------------------------------------------------------------*/
/*  _createArc()                                                       */
/*---------------------------------------------------------------------*/
/**
  *   @private
  */
DvtSvgArc.prototype._createArc = function()
{
   if (this._bInInit) {       // don't need to do this until end of Init()
     return ;
   }

   var sa = (this._sa * DvtMath.RADS_PER_DEGREE);
   var ae = (this._ae * DvtMath.RADS_PER_DEGREE);

   var x1 = this._cx + (this._rx * Math.cos(sa)) ;        // get arc
   var y1 = this._cy - (this._ry * Math.sin(sa)) ;        // end points
   var x2 = this._cx + (this._rx * Math.cos(sa + ae)) ;
   var y2 = this._cy - (this._ry * Math.sin(sa + ae)) ;

   var nLargeArc  =  (Math.abs(this._ae) > 180)? '1' : '0' ;
   var nSweepFlag =  (this._ae > 0)? '0' : '1' ;     // 0 == svg +ve angle

   var path = "M " +  x1 + " " + y1 + " A " + this._rx + "," + this._ry + " " + "0" + " " +
              nLargeArc + "," + nSweepFlag + " " + x2 + "," + y2 ;   
   path = this._addClosure(path) ;

   this._elem.setAttributeNS(null, 'd', path) ;
   if (this._stroke !== null) {
     this.setStroke(this._stroke) ;
   }
} ;






/*---------------------------------------------------------------------*/
/*   getAngleExtent()                                                  */
/*---------------------------------------------------------------------*/
/**
  *  Returns the angle subtended by the arc.
  *  @returns {number}  The angle subtended by the arc (following the normal anti-clockwise
  *  is positive convention).
  */
DvtSvgArc.prototype.getAngleExtent = function()
{
   return this._ae ;
} ;
/**
  *  Returns the angle subtended by the arc.
  *  @returns {number}  The angle subtended by the arc.
  *  is positive convention).
  */
DvtSvgArc.prototype.setAngleExtent = function(ae)
{
   ae = ((ae === null || isNaN(ae)) ? 0 : ae);
   if (this._ae !== ae) {

     //  From https://developer.mozilla.org/en/SVG/Tutorial/Paths
     //  "Complete circles and ellipses are actually the one object paths have trouble drawing.
     //  Because the start and end points for any path going around a circle are the same, there
     //  are an infinite number of circles that could be chosen, and the actual path is undefined.
     //  It's possible to approximate them by making the start and end points of your path slightly askew"

     if (ae === 360) {               // bug 12723079
       ae = 359.99 ;                 // cannnot use any precision higher than this!
     }

     this._ae = ae;
     this._createArc() ;
   }
} ;


/*---------------------------------------------------------------------*/
/*   getAngleStart()                                                   */
/*---------------------------------------------------------------------*/
/**
  *  Returns the start angle for an arc.
  *  @returns {number}  The starting angle (following the normal anti-clockwise
  *  is positive convention).
  */
DvtSvgArc.prototype.getAngleStart = function()
{
   return this._sa ;
} ;

/**
  *  Sets the start angle of the arc.
  *  @param {number}  The starting angle (following the normal anti-clockwise
  *  is positive convention).
  */
DvtSvgArc.prototype.setAngleStart = function(sa)
{
   sa = ((sa === null || isNaN(sa)) ? 0 : sa);
   if (this._sa !== sa) {
     this._sa = sa;
     this._createArc() ;
   }
} ;



/*---------------------------------------------------------------------*/
/*   get/setClosure()                                                  */
/*---------------------------------------------------------------------*/
/**
  *    Returns the closure type of the arc.
  *    @type String
  *    @returns The closure type,  such as {@link DvtArc#OPEN}
  */
DvtSvgArc.prototype.getClosure = function()
{
   return this._ct ;
} ;

/**
  *  Sets the closure type of the arc.
  *  @param {String} ct   The closure type,  such as {@link DvtArc#OPEN}
  */
DvtSvgArc.prototype.setClosure = function(ct)
{
   if (ct !== this._ct) {
     this._ct  = ct ;
     this._createArc() ;
   }

} ;



/*---------------------------------------------------------------------*/
/*  _Init()                                                            */
/*---------------------------------------------------------------------*/
/** @private */

DvtSvgArc.prototype._Init = function(cx, cy, rx, ry, sa, ae, clos, id)
{
   DvtSvgArc.superclass._Init.call(this, id, 'path') ;

   this._sa = 0 ;
   this._ae = 0 ;

   ry = ((ry === null || isNaN(ry)) ? rx : ry);

   this._bInInit = true ;         // performance - avoid multiple createArc()'s
   this.setCx(cx);
   this.setCy(cy);
   this.setRx(rx);
   this.setRy(ry);
   this.setAngleStart(sa);
   this.setAngleExtent(ae);
   this.setClosure(clos ? clos : DvtArc.OPEN);
   this._bInInit = false ;        // finally allow createArc to work.

   this._createArc() ;

} ;


/*---------------------------------------------------------------------*/
/*   setArc()         Convenience method                               */
/*---------------------------------------------------------------------*/
/**
  *  Defines the position and extent of the arc.
  *  @param {number} sa  The starting angle in degrees (following the normal
  *  anti-clockwise is positive convention).
  *  @param {number} ae  The angle extent in degrees (following the normal
  *  anti-clockwise is positive convention).
  */
DvtSvgArc.prototype.setArc = function(sa, ae)
{
   this.setAngleStart(sa) ;
   this.setAngleExtentStart(ae) ;
} ;


/*---------------------------------------------------------------------*/
/*   get/setCx()                                                       */
/*---------------------------------------------------------------------*/
/**
  *  Returns the x coordinate of the center.
  *  @type number
  */
DvtSvgArc.prototype.getCx = function()
{
   return  this._cx ;
} ;
/**
  *  Sets the x coordinate of the center.
  *  @param {number} cx  The center x position.
  */
DvtSvgArc.prototype.setCx = function(cx)
{
   if (cx !== this._cx) {
     this._cx  = cx ;
     this._elem.setAttributeNS(null,'cx', cx) ;
   }
} ;


/*---------------------------------------------------------------------*/
/*   get/setCy()                                                       */
/*---------------------------------------------------------------------*/
/**
  *  Returns the y coordinate of the center.
  *  @type number
  */
DvtSvgArc.prototype.getCy = function()
{
   return  this._cy ;
} ;

/**
  *  Sets the y coordinate of the center.
  *  @param {number} cy  The center y position.
  *
  */
DvtSvgArc.prototype.setCy = function(cy)
{
   if (cy !== this._cy) {
     this._cy  = cy ;
     this._elem.setAttributeNS(null,'cy', cy) ;
   }
} ;


/*---------------------------------------------------------------------*/
/*   get/setRx()                                                       */
/*---------------------------------------------------------------------*/
/**
  *  Returns the horizontal radius of the ellipse.
  *  @type number
  */
DvtSvgArc.prototype.getRx = function()
{
   return this._rx ;
} ;

/**
  *  Sets the horizontal radii of the ellipse.
  *  @param {number} rx  The horizontal radius of the ellipse.
  */
DvtSvgArc.prototype.setRx = function(rx)
{
   if (rx !== this._rx) {
     this._rx  = rx ;
     this._elem.setAttributeNS(null, 'rx', this._rx) ;
   }
} ;


/*---------------------------------------------------------------------*/
/*   get/setRy()                                                       */
/*---------------------------------------------------------------------*/
/**
  *  Returns the vertical radius of the ellipse.
  *  @type number
  */
DvtSvgArc.prototype.getRy = function()
{
   return this._ry ;
} ;

/**
  *  Sets the vertical radius of the ellipse.
  *  @param {number} ry  The vertical radius of the ellipse.
  */
DvtSvgArc.prototype.setRy = function(ry)
{
   if (ry !== this._ry) {
     this._ry  = ry ;
     this._elem.setAttributeNS(null, 'ry', this._ry) ;
   }
} ;



// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*-------------------------------------------------------------------------*/
/*   DvtSvgCircle         SVG Implementation of base circular shape        */
/*-------------------------------------------------------------------------*/
/**
  *  Creates a circular displayable shape - SVG implementation of DvtCircle.
  *  @extends DvtSvgShape
  *  @class DvtSvgCircle is an SVG implementation of DvtCircle and displays
  *  a circle.  Note:  this class should not be used directly, use DvtCircle.
  *  <p>
  *  <b>Example:</b><br><br> <code>
  *  var circle = new DvtCircle(context,10, 10, 100, 'myCircle') ;<br>
  *  circle.setStroke(new DvtStroke("red", 5)) ;<br>
  *</code>
  *
  *   @constructor  
  *   @param {number} cx  The center x position.
  *   @param {number} cy  The center y position.
  *   @param {number} r   The radius of the circle.
  *   @param {String} id  Optional ID for the shape (see {@link  DvtDisplayable#setId}).
  */
var   DvtSvgCircle = function(cx, cy, r, id)
{
   this._Init(cx, cy, r, id) ;
};

DvtObj.createSubclass(DvtSvgCircle, DvtSvgShape, "DvtSvgCircle") ;



/*-------------------------------------------------------------------------*/
/*  Init()                                                                 */
/*-------------------------------------------------------------------------*/
/** @private */
DvtSvgCircle.prototype._Init = function(cx, cy, r, id, type)
{
   DvtSvgCircle.superclass._Init.call(this, id, (type ? type : 'circle')) ;

   this.setCx(cx);
   this.setCy(cy);
   this.setRadius(r);
} ;



/*-------------------------------------------------------------------------*/
/*   get/setCx()                                                           */
/*-------------------------------------------------------------------------*/

DvtSvgCircle.prototype.getCx = function()
{
   return  this._cx ;
} ;
/**
  *  Sets the x coordinate of the center.
  *  @param {number} cx  The center x position.
  */

DvtSvgCircle.prototype.setCx = function(cx)
{
   if (cx !== this._cx) {
     this._cx  = cx ;
     this._elem.setAttributeNS(null,'cx', cx) ;
   }
} ;


/*-------------------------------------------------------------------------*/
/*   get/setCy()                                                           */
/*-------------------------------------------------------------------------*/
/**
  *  Returns the y coordinate of the center.
  *  @type number
  */
DvtSvgCircle.prototype.getCy = function()
{
   return  this._cy ;
} ;

/**
  *  Sets the y coordinate of the center.
  *  @param {number} cy  The center y position.
  *
  */
DvtSvgCircle.prototype.setCy = function(cy)
{
   if (cy !== this._cy) {
     this._cy  = cy ;
     this._elem.setAttributeNS(null,'cy', cy) ;
   }
} ;

/*-------------------------------------------------------------------------*/
/*   setRadius()                                                           */
/*-------------------------------------------------------------------------*/
/**
  *  Gets the radius  of the circle.
  *  @type {Number}  The radius of the circle.
  */
DvtSvgCircle.prototype.getRadius = function()
{
   return  this._r ;
} ;

/**
  *  Sets the radius  of the circle.
  *  @param {number} r   The radius of the circle.
  */
DvtSvgCircle.prototype.setRadius = function(r)
{
  if(r !== this._r) {
    this._r  = r ;
    this._elem.setAttributeNS(null,'r', r) ;
  }
} ;


// Copyright (c) 2011, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*-------------------------------------------------------------------------*/
/*    DvtSvgImage           Svg implementation for base shape DvtImage        */
/*-------------------------------------------------------------------------*/
/**
  *   Svg implementation for DvtImage.
  *   @constructor  
  *   Maybe specified as individual values or using a DvtImage object.
  *
  *   e.g. Image = new DvtImage(context,'pic'png', 10, 10, 50, 100);  or
  *
  *        Image = new DvtImage(context, myImage);   where myImage = new DvtImage(context,'pic.png', 10, 10, 50, 100);
  *
  */
var  DvtSvgImage = function(src, x, y, w, h, id)
{
  this._Init(src, x, y, w, h, id) ;
}

DvtObj.createSubclass(DvtSvgImage, DvtSvgShape, "DvtSvgImage");



DvtSvgImage.XLINK_NS = "http://www.w3.org/1999/xlink";


/*-------------------------------------------------------------------------*/
/*  Init()                                                                 */
/*-------------------------------------------------------------------------*/

DvtSvgImage.prototype._Init = function(src, x, y, w, h, id)
{
   DvtSvgImage.superclass._Init.call(this, id, 'image') ;
   this._elem.setAttributeNS(null, 'fill', '#FFFFFF');
   this._elem.setAttributeNS(null, 'fill-opacity', '0');   
   this.setImage(src, x, y, w, h);
} ;



/*-------------------------------------------------------------------------*/
/*   get/setHeight()                                                       */
/*-------------------------------------------------------------------------*/
/**
  *  Returns the height of the rectangle.
  *  @type number
  */
DvtSvgImage.prototype.getHeight = function()
{
   return  this._h ;
} ;

/**
  *  Sets the height of the image.
  *  @param {number} h  The height of the image.
  *  @returns nothing
  */
DvtSvgImage.prototype.setHeight= function(h)
{
   if (h !== this._h) {
     this._h  = h ;
     this._elem.setAttributeNS(null,'height', this._h) ;
   }
} ;



/*-------------------------------------------------------------------------*/
/*   get/setPos(x,y)                                                       */
/*-------------------------------------------------------------------------*/

DvtSvgImage.prototype.getPos = function()
{
   return new DvtPoint(this._x, this._y) ;
};

DvtSvgImage.prototype.setPos= function(x,y)
{
   this.setX(x) ;
   this.setY(y) ;
};



/*-------------------------------------------------------------------------*/
/*   get/setX()                                                            */
/*-------------------------------------------------------------------------*/

DvtSvgImage.prototype.getX = function()
{
   return this._x ;
} ;

DvtSvgImage.prototype.setX = function(x)
{
   if (x !== this._x) {
     this._x  = x ;
     this._elem.setAttributeNS(null,'x', this._x) ;
   }
} ;

/*-------------------------------------------------------------------------*/
/*   get/setY()                                                            */
/*-------------------------------------------------------------------------*/

DvtSvgImage.prototype.getY = function()
{
   return this._y ;
} ;
DvtSvgImage.prototype.setY = function(y)
{
   if (y !== this._y) {
     this._y  = y ;
     this._elem.setAttributeNS(null,'y', this._y) ;
   }
} ;


/*-------------------------------------------------------------------------*/
/*   get/setWidth()                                                        */
/*-------------------------------------------------------------------------*/

DvtSvgImage.prototype.getWidth = function()
{
   return this._w ;
} ;

/**
  *  Sets the width of the image.
  *  @param {number} w  The width of the image.
  *  @returns nothing
  */
DvtSvgImage.prototype.setWidth = function(w)
{
   if (w !== this._w) {
     this._w  = w ;
     this._elem.setAttributeNS(null,'width', this._w) ;
   }
} ;

/*-------------------------------------------------------------------------*/
/*   get/setSrc()                                                          */
/*-------------------------------------------------------------------------*/
/**
  *  Returns the src of the image.
  *  @returns (String) the src of the image.
  */
DvtSvgImage.prototype.getSrc = function()
{
  return this._src;
} ;

/**
  *  Sets the src of the image.
  *  @param {number} src  The src of the image.
  *  @returns nothing
  */
DvtSvgImage.prototype.setSrc = function(src)
{
   if (src !== this._src) {
     this._src  = src ;

     //TODO: 
     // this._elem.setAttributeNS("xlink", 'href', this._src) ;
     this._elem.setAttributeNS(DvtSvgImage.XLINK_NS, 'xlink:href', this._src) ;
   }
} ;


/*-------------------------------------------------------------------------*/
/*   setImage()                                                            */
/*-------------------------------------------------------------------------*/
/**
  *     Sets the position and size and src of the image
  *     Maybe specified as individual values or using a DvtImage object.
  *
  *   e.g. Image = factory.newImage('pic'png', 10, 10, 50, 100);  or
  *
  *        Image = factory.newImage(myImage);   where myImage = new DvtImage('pic.png', 10, 10, 50, 100);
  */
DvtSvgImage.prototype.setImage = function(src,x,y,w,h)
{
   if (x instanceof DvtImage) {
     this.setSrc(src.src);
     this.setPos(src.x, src.y) ;
     this.setWidth(src.w) ;
     this.setHeight(src.h) ;
   }
   else {
     this.setSrc(src);
     this.setPos(x,y) ;
     this.setWidth(w) ;
     this.setHeight(h) ;
   }

   //TODO: set preserveAspectRatio="none" for now
   this._elem.setAttributeNS(null, 'preserveAspectRatio', 'none') ;
} ;


/**
 * @override
 */
DvtSvgImage.prototype.getDimensions = function() {
  var bbox = this.getElem().getBBox();

  if (bbox.width && bbox.height) {
    return new DvtRectangle(bbox.x, bbox.y, bbox.width, bbox.height);
  }
  else {
    return new DvtRectangle(bbox.x, bbox.y, this.getWidth(), this.getHeight());
  }

};


/**
  *  Loads the image and sets the image size if it was loaded
  *  Returns the dimension of the image if it was loaded
  */
DvtSvgImage.prototype.loadImage = function() {
  if (this._src) {
    var imageSize = DvtSvgImageLoader.loadImage(this._src);
    if (imageSize) {
      this.setWidth(imageSize.width);
      this.setHeight(imageSize.height);
      return this.getDimensions();
    }
  }
  return null;
}


// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*---------------------------------------------------------------------*/
/*   DvtSvgLine          SVG Implementation of DvtLine                 */
/*---------------------------------------------------------------------*/
/**
  *   Creates an SVG implementation of a line segment drawn from (x1, y1) to (x2, y2).
  *   An object of this class must not created directly, use {@link DvtLine}.
  *   @extends DvtSvgShape
  *   @class DvtSvgLine
  *   @constructor  
  *   @param {number} x1  An x end-position of the line.
  *   @param {number} y1  The associated y end-point (for x1).
  *   @param {number} x2  The other end-point's x coordinate.
  *   @param {number} y2  The y coordinate associated with x2.
  *   @param {String} id  Optional ID for the shape (see {@link  DvtDisplayable#setId}).
  */
var DvtSvgLine = function(x1, y1, x2, y2, id)
{
   this._Init(x1, y1, x2, y2, id) ;
};

DvtObj.createSubclass(DvtSvgLine, DvtSvgShape, "DvtSvgLine") ;


/*---------------------------------------------------------------------*/
/*   _Init()                                                           */
/*---------------------------------------------------------------------*/
/**   @private  */
DvtSvgLine.prototype._Init = function(x1, y1, x2, y2, id)
{
   DvtSvgLine.superclass._Init.call(this, id, 'line') ;

   this._elem.setAttributeNS(null, 'fill', 'none') ;
   this.setX1(x1);
   this.setY1(y1);
   this.setX2(x2);
   this.setY2(y2);
   this._bHollow = false;
} ;

/*---------------------------------------------------------------------*/
/*   get/setX1()                                                       */
/*---------------------------------------------------------------------*/

DvtSvgLine.prototype.getX1 = function()
{
   return this._x1 ;
} ;

DvtSvgLine.prototype.setX1 = function(x1)
{
   if (x1 !== this._x1) {
     this._x1  = x1 ;
     this._elem.setAttributeNS(null,'x1', this._x1) ;
   }
} ;

/*---------------------------------------------------------------------*/
/*   get/setY1()                                                       */
/*---------------------------------------------------------------------*/

DvtSvgLine.prototype.getY1 = function()
{
   return this._y1 ;
} ;

DvtSvgLine.prototype.setY1 = function(y1)
{
   if (y1 !== this._y1) {
     this._y1  = y1 ;
     this._elem.setAttributeNS(null,'y1', this._y1) ;
   }
} ;

/*---------------------------------------------------------------------*/
/*   get/setX2()                                                       */
/*---------------------------------------------------------------------*/

DvtSvgLine.prototype.getX2 = function()
{
   return this._x2 ;
} ;

DvtSvgLine.prototype.setX2 = function(x2)
{
   if (x2 !== this._x2) {
     this._x2  = x2 ;
     this._elem.setAttributeNS(null,'x2', this._x2) ;
   }
} ;

/*---------------------------------------------------------------------*/
/*   get/setY2()                                                       */
/*---------------------------------------------------------------------*/

DvtSvgLine.prototype.getY2 = function()
{
   return this._y2 ;
} ;

DvtSvgLine.prototype.setY2 = function(y2)
{
   if (y2 !== this._y2) {
     this._y2  = y2 ;
     this._elem.setAttributeNS(null,'y2', this._y2) ;
   }
} ;

/**  Changes the shape to an outline shape format.  Used for legend
  *  markers that represent a hidden state for the associated series risers.
  *                            reinstates the pevious state.
  *  @override
  */
DvtSvgLine.prototype.setHollow = function()
{
    var  parentElem = this._elem.parentNode ;

    if (!this._bHollow) {
        this._origElem   = this._elem;
        var hollowMarker; 
        var width  = this.getX2() - this.getX1() ;   // Legend lines are always horizontal, so take width as height
        var height = width ;
        var startY = this.getY1() - width/2 ;
        var stroke = this.getStroke();
        
        hollowMarker = DvtSvgShapeUtils.createElement('rect');
        hollowMarker.setAttributeNS(null,'x', this.getX1()) ;
        hollowMarker.setAttributeNS(null,'y', startY) ;
        hollowMarker.setAttributeNS(null,'width', this.getX2() - this.getX1()) ;
        hollowMarker.setAttributeNS(null,'height', height) ;
        var color = stroke.getColor();
        if (color) {
          var alpha = stroke.getAlpha();
          // Workaround for Safari where versions < 5.1 draw rgba values as black
          var agent = DvtAgent.getAgent();
          if (agent.isSafari() && color.indexOf("rgba") !==  - 1) {
            hollowMarker.setAttributeNS(null, 'stroke', DvtColorUtils.getRGB(color));
            // Use alpa in rgba value as a multiplier to the alpha set on the object as this is what svg does.
            if (alpha != null)
              hollowMarker.setAttributeNS(null, 'stroke-opacity', DvtColorUtils.getAlpha(color) * alpha);
            else 
              hollowMarker.setAttributeNS(null, 'stroke-opacity', DvtColorUtils.getAlpha(color));
          }
          else {
            hollowMarker.setAttributeNS(null, 'stroke', color);
            if (alpha != null)
              hollowMarker.setAttributeNS(null, 'stroke-opacity', alpha);
          }
        }
        hollowMarker.setAttributeNS(null,'fill', '#ffffff') ;
        hollowMarker.setAttributeNS(null,'fill-opacity', '0.001') ;    // need this or hit detection fails on center
        hollowMarker.setAttributeNS(null, 'shape-rendering', 'crispEdges') ;
        hollowMarker._obj = this;       // replace the elem's _obj backpointer 
        
        parentElem.replaceChild(hollowMarker, this._elem) ;
        this._elem = hollowMarker ;
        this._elem.setAttributeNS(null,'opacity', this._alpha);
        this._bHollow = true;
    }
    else if (this._origElem) {
        parentElem.replaceChild(this._origElem, this._elem) ;
        this._origElem.setAttributeNS(null,'opacity', this._alpha);
        this._elem = this._origElem ;
        this._origElem   = null ;
        this._bHollow = false;
    }
} ;  

/**  Returns whether a shape is hollow.
  *  @returns {boolean} True if the shape is hollow
  *  @override
  */
DvtSvgShape.prototype.isHollow = function() {
    return this._bHollow;
}

// TODO JSDoc
// Must be connected for this to work
DvtSvgLine.prototype.getDimensions = function(targetCoordinateSpace) {
  var bounds = DvtSvgLine.superclass.getDimensions.call(this, targetCoordinateSpace);
  // BUG #12806130: Vertical/horizontal lines in svg are ignored when group containers wrap them
  if (this._childGroupElem && this._elem) {
      var groupBox = this._childGroupElem.getBBox();
      // Empty bounding box is an indication of only vertical/horizontal lines present in this group
      // In this case, use the original line itself to get the bounds as an approximation
      if (groupBox.x == 0 && groupBox.y == 0 && groupBox.width == 0 && groupBox.height == 0) {
         var lineBounds = this._elem.getBBox();
         bounds = new DvtRectangle(lineBounds.x, lineBounds.y, lineBounds.width, lineBounds.height);
      }
  }
  return bounds;
};
// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*--------------------------------------------------------------------*/
/*   DvtSvgMarker         SVG implementation of a DvtMarker           */
/*--------------------------------------------------------------------*/
/**
  *   An SVG implementation of DvtMarker
  *   @class An SVG implementation of DvtMarker. Do not create directly, use DvtMarker.
  *   var  marker = new DvtMarker(context, DvtMarker.CIRCLE, 50, 50, 10, 10) ;<br></code>
  *   @extends DvtSvgShape
  *   @constructor    Returns a DvtSvgMarker instance.
  *   @param {number} type  The marker type (such as {@link DvtMarker#CIRCLE}).
  *   @type  DvtSvgMarker
  */
var  DvtSvgMarker = function(type, id, etype)
{
  this._Init(type, id, etype) ; 
}  ;

DvtObj.createSubclass(DvtSvgMarker, DvtSvgShape, "DvtSvgMarker") ;

// The reference coords and sizes that the shapes will be initialized to.
DvtSvgMarker._REFERENCE_X = 0;
DvtSvgMarker._REFERENCE_Y = 0;
DvtSvgMarker._REFERENCE_W = 10;
DvtSvgMarker._REFERENCE_H = 10;

DvtSvgMarker.MARKER_CIRCLE_ELEM_NAME = "circle";
DvtSvgMarker.MARKER_ELLIPSE_ELEM_NAME = "ellipse";
DvtSvgMarker.MARKER_LINE_ELEM_NAME = "line";
DvtSvgMarker.MARKER_PATH_ELEM_NAME = "path";
DvtSvgMarker.MARKER_POLYGON_ELEM_NAME = "polygon";
DvtSvgMarker.MARKER_POLYLINE_ELEM_NAME = "polyline";
DvtSvgMarker.MARKER_RECT_ELEM_NAME = "rect";


/**
  *   @private
  */ 
DvtSvgMarker.prototype._Init = function(type, id, etype)
{
   var elemType;
   if (etype) {
     elemType = etype;
   }
   else {
     elemType = (type === DvtMarker.CIRCLE? 'ellipse' :
                (type === DvtMarker.SQUARE? 'rect' :
                (type === DvtMarker.ROUNDED_RECTANGLE? 'rect' :
                (type === DvtMarker.TRIANGLE_UP? 'polygon' :
                (type === DvtMarker.TRIANGLE_DOWN? 'polygon' :
                (type === DvtMarker.DIAMOND? 'polygon' :
                (type === DvtMarker.PLUS? 'polygon' :
                (type === DvtMarker.HUMAN? 'path' :
                (type === DvtMarker.IMAGE? (DvtAgent.getAgent().isWebkit() ? 'image' : 'g') : 'rect'))))))))) ;
   }         
   DvtSvgMarker.superclass._Init.call(this, id, elemType);
   
   // Store the type
   this._type = type;
   
   //Store reference to underlay
   this._underlay = null;
   
   //default scale of the marker used to force it to the reference size
   this._defaultScale = 1;
};

/**
 * Sets the position and size of the marker.
 * @param {number} x The top left x-coordinate of the marker's bounding rectangle.
 * @param {number} y The top left y-coordinate of the marker's bounding rectangle.
 * @param {number} w The width of the marker's bounding rectangle.
 * @param {number} h The height of the marker's bounding rectangle.
 * @param {DvtMarkerDef} markerDef
 */
DvtSvgMarker.prototype.setBounds = function(x, y, w, h, markerDef) {   
   // Initialize the shape to the reference coords
   if(!this._shapeInitialized)
     this._initShape(this._type, markerDef, x, y, w, h);  
}

/**
 * Initializes the shape to the specified coordinates.
 * @private
 */
DvtSvgMarker.prototype._initShape = function (type, markerDef, x, y, w, h) {
  // Only need to do this once
  this._shapeInitialized = true;

  // Save info for underlay positioning
  this._x = x;
  this._y = y;
  this._w = w;
  this._h = h;

  var multiPathRoot;
  if (type === DvtMarker.CUSTOM || type === DvtMarker.HUMAN) {
    // Calculate the scale factor to get to the right size
    var dim = DvtDisplayableUtils._getDimForced(this.getObj().getContext(),
                                                markerDef);
    var maxDim = Math.max(dim.w, dim.h);

    var sx = 1;
    var sy = 1;

    // Calculate the transform to get to the right position
    if (type === DvtMarker.CUSTOM) {
      sx = w/(this.getObj().getMaintainAspect() ? maxDim : dim.w);
      sy = h/(this.getObj().getMaintainAspect() ? maxDim : dim.h);
      var dx = x + (-dim.x * sx) + (w - (dim.w * sx))/2;
      var dy = y + (-dim.y * sy) + (h - (dim.h * sy))/2;
      multiPathRoot = this._setCustomMarker(markerDef, dx, dy, sx, sy);
    }
    else if (type === DvtMarker.HUMAN) {
      sx = w/maxDim;
      sy = h/maxDim;
      var dx = x + (-dim.x * sx) + (w - (dim.w * sx))/2;
      var dy = y + (-dim.y * sy) + (h - (dim.h * sy))/2;
      this._setCmds(DvtPathUtils.transformPath(DvtMarkerDef.HUMAN_CMDS, dx, dy, sx, sy));
    }
    var scale = (dim.h === maxDim) ? (h/maxDim) : (w/maxDim);
    //save the default scale used to force the marker to the reference size
    //because we may need it later for inversely scaling the selection stroke
    this._defaultScale = scale;    
  }
  else if (type === DvtMarker.IMAGE) {
    this._setSrc(this.getObj().GetMarkerImage(DvtMarker.IMAGE_SOURCE));
    this._setX(x);
    this._setY(y);
    this._setWidth(w);
    this._setHeight(h);
    this._elem.setAttributeNS(null,'preserveAspectRatio', 'none') ;
  }
  else if (type === DvtMarker.SQUARE) {
    this._setX(x);
    this._setY(y);
    this._setWidth(w);
    this._setHeight(h);
  }
  else if (type === DvtMarker.ROUNDED_RECTANGLE) {
    this._setX(x);
    this._setY(y);
    this._setWidth(w);
    this._setHeight(h);
    var rx = 6;
    var ry = 6;
    if (w/4 < rx || h/4 < ry) {
      rx = Math.min(w, h)/4;
      ry = rx;
    }
    this._setRX(rx);
    this._setRY(ry);
  }
  else if (type === DvtMarker.CIRCLE) {
    this._setCx(x + w/2);
    this._setCy(y + h/2);
    this._setRX(w/2);
    this._setRY(h/2);
  }
  else {
    var ar = [];
    var halfWidth = w / 2;
    var halfHeight = h / 2;
   
    if (type === DvtMarker.TRIANGLE_UP) {
      ar.push(x);
      ar.push(y + h);
      ar.push(x + w);
      ar.push(y + h);
      ar.push(x + halfWidth);
      ar.push(y);
      this._setPolygon(ar);
    }
    else if (type === DvtMarker.TRIANGLE_DOWN) {
      ar.push(x);
      ar.push(y);
      ar.push(x + w);
      ar.push(y);
      ar.push(x + halfWidth);
      ar.push(y + h);
      this._setPolygon(ar);
    }
    else if (type === DvtMarker.DIAMOND) {
      ar.push(x + halfWidth);
      ar.push(y);
      ar.push(x + w);
      ar.push(y + halfHeight);
      ar.push(x + halfWidth);
      ar.push(y + h);
      ar.push(x);
      ar.push(y + halfHeight);
      this._setPolygon(ar);
    }
    else if (type === DvtMarker.PLUS) {
      var wThird = w / 3;
      var wTwoThird = 2 * wThird;
      var hThird = h / 3;
      var hTwoThird = 2 * hThird;

      ar.push(x + wThird);
      ar.push(y);
      ar.push(x + wTwoThird);
      ar.push(y);
      ar.push(x + wTwoThird);
      ar.push(y + hThird);
      ar.push(x + w);
      ar.push(y + hThird);
      ar.push(x + w);
      ar.push(y + hTwoThird);
      ar.push(x + wTwoThird);
      ar.push(y + hTwoThird);
      ar.push(x + wTwoThird);
      ar.push(y + h);
      ar.push(x + wThird);
      ar.push(y + h);
      ar.push(x + wThird);
      ar.push(y + hTwoThird);
      ar.push(x);
      ar.push(y + hTwoThird);
      ar.push(x);
      ar.push(y + hThird);
      ar.push(x + wThird);
      ar.push(y + hThird);
      ar.push(x + wThird);
      ar.push(y);
      this._setPolygon(ar);
    }
  }
}

/**
  *  Returns the default scale of the marker used to force it to the 
  *  reference size.
  *  @type number
  */
DvtSvgMarker.prototype.getDefaultScale = function()
{
   return this._defaultScale;
};

/**
  *  Returns the type of the marker (such as {@link DvtMarker#CIRCLE}.
  *  @type number
  */
DvtSvgMarker.prototype.getType = function()
{
   return  this._type ;
} ;

/**
 * @private
 */
DvtSvgMarker.prototype._setCx = function(cx)
{
  this._elem.setAttributeNS(null,'cx', cx) ;
} ;

/**
 * @private
 */
DvtSvgMarker.prototype._setCy = function(cy)
{
  this._elem.setAttributeNS(null,'cy', cy) ;
} ;

/**
 * @private
 */
DvtSvgMarker.prototype._setX = function(x)
{
  this._elem.setAttributeNS(null,'x', x) ;
} ;

/**
 * @private
 */
DvtSvgMarker.prototype._setY = function(y)
{
  this._elem.setAttributeNS(null,'y', y) ;
} ;

/**
 * @private
 */
DvtSvgMarker.prototype._setWidth = function(w)
{
  this._elem.setAttributeNS(null,'width', w) ;
} ;

/**
 * @private
  */
DvtSvgMarker.prototype._setHeight = function(h)
{
  this._elem.setAttributeNS(null,'height', h) ;
} ;

/**
 * @private
  */
DvtSvgMarker.prototype._setRadius = function(r)
{
   this._elem.setAttributeNS(null,'r', r) ;
} ;

/**
 *   @private
 */
DvtSvgMarker.prototype._setPolygon = function(ar)
{
   var sPoints = DvtSvgShapeUtils.convertPointsArray(ar);
   this._elem.setAttributeNS(null, 'points', sPoints) ;
} ;

/**
 *   @private
 */
DvtSvgMarker.prototype._setCmds = function(cmds)
{
   if (cmds !== this._cmds) {
     this._cmds  = cmds ;
     this._elem.setAttributeNS(null, 'd', cmds) ;
   }
} ;

DvtSvgMarker.prototype._setSrc = function(src)
{
  this._elem.setAttributeNS(DvtSvgImage.XLINK_NS, 'xlink:href', src);
}
/**
 * @override
 */
DvtSvgMarker.prototype.GetAttributesTransferableToGroup = function() {
  // Don't transfer the 'transform' attr, since it affects the clip path for custom markers.
  var attrNames = DvtSvgContainer.AttributesTransferableToGroup.slice(0);
  var transformIndex = DvtArrayUtils.indexOf(attrNames, 'transform');
  attrNames.splice(transformIndex, 1);
  var visibilityIndex = DvtArrayUtils.indexOf(attrNames, 'visibility');
  attrNames.splice(visibilityIndex, 1);
  return attrNames;
}

/**
 * @override
 */
DvtSvgMarker.prototype.setMatrix = function(mat) {
  DvtSvgMarker.superclass.setMatrix.call(this, mat);

  // Fix for bug 12622757
  DvtSvgDocumentUtils.fixWebkitFilters(this.getOuterElem());
}

/**
 * @override
 */
DvtSvgMarker.prototype.setAlpha = function(alpha) {
  DvtSvgMarker.superclass.setAlpha.call(this, alpha);

  // Fix for bug 12622757
  DvtSvgDocumentUtils.fixWebkitFilters(this.getOuterElem());
}

/**
 * @override
 */
DvtSvgMarker.prototype.setFill = function(obj) { 
  DvtSvgMarker.superclass.setFill.call(this, obj);

  // Fix for bug 12622757
  DvtSvgDocumentUtils.fixWebkitFilters(this.getOuterElem());
}

/**
 * @override
 */
DvtSvgMarker.prototype.setStroke = function(obj) {
  DvtSvgMarker.superclass.setStroke.call(this, obj);

  // Fix for bug 12622757
  DvtSvgDocumentUtils.fixWebkitFilters(this.getOuterElem());
}

/**
 * Sets the position and size of the underlay for all but human markers
 * @private
 */
DvtSvgMarker.prototype._positionUnderlay = function(x, y, w, h)
{
    //Underlays cannot be custom, plus, or human shapes
    var type = this._underlay.getType();
    var radius = Math.max(w, h)/2;
    var pad;
    var ar = [];
    // Padding for triangles
    var triBottomPad = radius*.4;
    var triTipPad = + 1.6*radius;

    if (type === DvtMarker.SQUARE) {
        pad = radius*.5;
        this._underlay._setX(x - pad);
        this._underlay._setY(y - pad);
        this._underlay._setWidth(2*(radius + pad));
        this._underlay._setHeight(2*(radius + pad));
    }
    else if (type === DvtMarker.CIRCLE) {
        pad = radius*.7;
        this._underlay._setCx(x + w/2);
        this._underlay._setCy(y + h/2);
        this._underlay._setRX(radius + pad);
        this._underlay._setRY(radius + pad);
    }
    else if (type === DvtMarker.TRIANGLE_UP) {  
      pad = radius * 1.3;
      ar.push(x - pad);
      ar.push(y + 2*radius + triBottomPad);
      ar.push(x + radius);
      ar.push(y - triTipPad);
      ar.push(x + 2*radius + pad);
      ar.push(y + 2*radius + triBottomPad);
      this._underlay._setPolygon(ar);
    }
    else if (type === DvtMarker.TRIANGLE_DOWN) {
      pad = radius * 1.3;
      ar.push(x - pad);
      ar.push(y - triBottomPad);
      ar.push(x + 2*radius + pad);
      ar.push(y - triBottomPad);
      ar.push(x + radius);
      ar.push(y + 2*radius + triTipPad);
      this._underlay._setPolygon(ar);
    }
    else if (type === DvtMarker.DIAMOND) {
      pad = radius * 1.1;
      ar.push(x - pad);
      ar.push(y + radius);
      ar.push(x + radius);
      ar.push(y - pad);
      ar.push(x + 2*radius + pad);
      ar.push(y + radius);
      ar.push(x + radius);
      ar.push(y + 2*radius + pad);
      this._underlay._setPolygon(ar);
    }
}

/**
 * Sets the position and size of the underlay for human markers
 * @private
 */
DvtSvgMarker.prototype._positionHumanUnderlay = function(x, y, w, h)
{
    //Underlays cannot be custom, plus, or human shapes
    var type = this._underlay.getType();
    var radius = Math.max(w, h)/2;
    var pad;
    var ar = [];
    // Padding for triangles
    var triBottomPad = radius*.2;
    var triTipPad = + 0.65*radius;

    if (type === DvtMarker.SQUARE) {
        pad = radius*.15;
        this._underlay._setX(x - pad);
        this._underlay._setY(y - pad);
        this._underlay._setWidth(2*(radius + pad));
        this._underlay._setHeight(2*(radius + pad));
    }
    else if (type === DvtMarker.CIRCLE) {
        pad = radius*.2;
        this._underlay._setCx(x + w/2);
        this._underlay._setCy(y + h/2);
        this._underlay._setRX(radius + pad);
        this._underlay._setRY(radius + pad);
    }
    else if (type === DvtMarker.TRIANGLE_UP) {  
      pad = radius * 0.5;
      ar.push(x - pad);
      ar.push(y + 2*radius + triBottomPad);
      ar.push(x + radius);
      ar.push(y - triTipPad);
      ar.push(x + 2*radius + pad);
      ar.push(y + 2*radius + triBottomPad);
      this._underlay._setPolygon(ar);
    }
    else if (type === DvtMarker.TRIANGLE_DOWN) {
      pad = radius * 0.5;
      ar.push(x - pad);
      ar.push(y - triBottomPad);
      ar.push(x + 2*radius + pad);
      ar.push(y - triBottomPad);
      ar.push(x + radius);
      ar.push(y + 2*radius + triTipPad);
      this._underlay._setPolygon(ar);
    }
    else if (type === DvtMarker.DIAMOND) {
      pad = radius * 0.4;
      ar.push(x - pad);
      ar.push(y + radius);
      ar.push(x + radius);
      ar.push(y - pad);
      ar.push(x + 2*radius + pad);
      ar.push(y + radius);
      ar.push(x + radius);
      ar.push(y + 2*radius + pad);
      this._underlay._setPolygon(ar);
    }
}

/**  Sets the underlay for markers
 *  @param {string} ut underlay type
 *  @param {string} uc fill color of the underlay
 *  @param {number} ua fill alpha of the underlay
 */
DvtSvgMarker.prototype.setUnderlay = function(ut, uc, ua)
{
    var context = this.getObj().getContext();
    this._underlay = context.getImplFactory().newMarker(ut);
    this._underlay.setFill(new DvtSolidFill(uc, ua));
    this._underlay.setObj(this.getObj());
    if (this.getType() === DvtMarker.HUMAN) {
        this._positionHumanUnderlay(this._x, this._y, 
                                    this._w, this._h);
    } else {
        this._positionUnderlay(this._x, this._y, 
                               this._w, this._h);
    }
    
    // add the underlay to the group elem explicitly because behavior of addChildAt might change
    this.CreateChildGroupElem(false);    
    var existingNode = this._childGroupElem.childNodes[0];
    // BUG #12661320: IE9 cannot handle a value of undefined in insertBefore.  Set to null in such a case. 
    if (!existingNode)
      existingNode = null;
    this._childGroupElem.insertBefore(this._underlay.getOuterElem(), existingNode);
}


/*---------------------------------------------------------------------*/
/*   getUnderlay()                                                     */
/*---------------------------------------------------------------------*/
/**  Gets the underlay for markers
 */
DvtSvgMarker.prototype.getUnderlay = function() 
{
  return this._underlay;
}

/**
 * Sets whether mouse events are enabled on this object.
 * @param {boolean} whether mouse events are enabled
 */
DvtSvgMarker.prototype.setMouseEnabled = function(bEnabled)
{
  DvtSvgMarker.superclass.setMouseEnabled.call(this, bEnabled);
  if (this._childGroupElem) {
      var val;
      if (bEnabled)
      {
        val = "visiblePainted";
      }
      else
      {
        val = "none";
      }
      this._childGroupElem.setAttributeNS(null, "pointer-events", val);
  }
};

/**  Changes the shape to an outline shape format.  Used for legend
  *  markers that represent a hidden state for the associated series risers.
  *  @param {String} color Border color for hollow shape in format of #aarrggbb
  *  @param {number} strokeWidth Stroke width used for shapes that were transofrmed (optional)
  *  @override
  */
DvtSvgMarker.prototype.setHollow = function(color, strokeWidth)
{
    DvtSvgMarker.superclass.setHollow.call(this, color, strokeWidth);
};


DvtSvgMarker.prototype._setCustomMarker = function(markerDef, x, y, sx, sy)
{
  if (this._isMultiPaths()) {
    var root = this._cloneMultiPaths(markerDef, x, y, sx, sy);
    this.getObj().addChild(root);

    // return container of multi paths
    return root;
  }
  else {
    this._setSingleShape(markerDef, x, y, sx, sy);
    return null;
  }
} ;


DvtSvgMarker.prototype._setSingleShape = function(markerDef, x, y, sx, sy)
{
  var defImpl = markerDef.getImpl();
  var type = defImpl.getElem().nodeName;

  if (type == DvtSvgMarker.MARKER_PATH_ELEM_NAME) {
    this._setCmds(DvtPathUtils.transformPath(defImpl._sCmds, x, y, sx, sy));
  }
  /*
  else if (type == DvtSvgMarker.MARKER_CIRCLE_ELEM_NAME ||
           type == DvtSvgMarker.MARKER_ELLIPSE_ELEM_NAME) {
    this._setCx(markerDef.getCx());
    this._setCy(markerDef.getCy());
    this._setRadius(markerDef.getRadius());
  }

  else if (type == DvtSvgMarker.MARKER_LINE_ELEM_NAME) {
    this._setX1(defImpl.getX1());
    this._setX2(defImpl.getX2());
    this._setY1(defImpl.getY1());
    this._setY2(defImpl.getY2());
  }
  else if (type == DvtSvgMarker.MARKER_POLYGON_ELEM_NAME) {
    this._setPoints(defImpl._sPoints);
  }
  else if (type == DvtSvgMarker.MARKER_POLYLINE_ELEM_NAME) {
    this._setPoints(defImpl._sPoints);
  }
  else if (type == DvtSvgMarker.MARKER_RECT_TYPE_ELEM_NAME) {
    this._setX(markerDef.getX());
    this._setY(markerDef.getY());
    this._setWidth(markerDef.getWidth());
    this._setHeight(markerDef.getHeight());
  }
  */

  var fill = defImpl.getFill();
  if (fill) {
    this.setFill(fill);
  }
  var alpha = defImpl.getAlpha();
  if (alpha) {
    this.setAlpha(alpha);
  }
  var stroke = defImpl.getStroke();
  if (stroke) {
    var scaledStroke = stroke.clone();
    scaledStroke.setWidth(Math.min(sx, sy) * scaledStroke.getWidth());
    this.setStroke(scaledStroke);
  }
} ;


/**
 *   @private
 */
DvtSvgMarker.prototype._setPoints = function(points)
{
   if (points !== this._points) {
     this._points  = points ;
     this._elem.setAttributeNS(null, 'points', points);
   }
} ;

/**
 * @private
 */
DvtSvgMarker.prototype._setX1 = function(x1)
{
  this._elem.setAttributeNS(null,'x1', x1) ;
} ;

/**
 * @private
 */
DvtSvgMarker.prototype._setY1 = function(y1)
{
  this._elem.setAttributeNS(null,'y1', y1) ;
} ;

/**
 * @private
 */
DvtSvgMarker.prototype._setX2 = function(x2)
{
  this._elem.setAttributeNS(null,'x2', x2) ;
} ;

/**
 * @private
 */
DvtSvgMarker.prototype._setY2 = function(y2)
{
  this._elem.setAttributeNS(null,'y2', y2) ;
} ;

/**
 * @private
 */
DvtSvgMarker.prototype._setRX = function(rx)
{
  this._elem.setAttributeNS(null,'rx', rx) ;
} ;

/**
 * @private
 */
DvtSvgMarker.prototype._setRY = function(ry)
{
  this._elem.setAttributeNS(null,'ry', ry) ;
} ;


/**
 * @private
 */
DvtSvgMarker.prototype._cloneMultiPaths = function(markerDef, x, y, sx, sy) {
  var context = this.getObj().getContext();
  var root = new DvtContainer(context, markerDef.getId() + "_x");

  var childCnt = markerDef.getNumChildren();
  var childDef;
  var child;
  for (var i = 0; i < childCnt; i++) {
    childDef = markerDef.getChildAt(i);
    child = new DvtPath(context, DvtPathUtils.transformPath(childDef.getCmds(), x, y, sx, sy), childDef.getId());

    if (childDef.getFill()) {
      child.setFill(childDef.getFill());
    }
    if (childDef.getAlpha()) {
      child.setAlpha(childDef.getAlpha());
    }
    if (childDef.getStroke()) {
      var scaledStroke = childDef.getStroke().clone();
      scaledStroke.setWidth(Math.min(sx, sy) * scaledStroke.getWidth());
      child.setStroke(scaledStroke);
    }
    root.addChild(child);
  }

  return root;
}

/**
 * @override
 */
DvtSvgMarker.prototype.addChild = function(obj) {
  // if this marker has multi paths, don't add an additonal childGroupElem
  if (this._isMultiPaths()) {
    this._elem.appendChild(obj.getOuterElem()) ;
  }
  else {
    DvtSvgMarker.superclass.addChild.call(this, obj);
  }
};


DvtSvgMarker.prototype._isMultiPaths = function() {
  return (this.getElem().nodeName == "g" && this.getType() != DvtMarker.IMAGE);
};

DvtSvgMarker.prototype.UpdateMarkerImage = function() {
  if (this.getObj().isHoverEffectShown()) {
    if (this.getObj().isSelected())
      this._setSrc(this.getObj().GetMarkerImage(DvtMarker.IMAGE_SOURCE_HOVER_SELECTED));
    else
      this._setSrc(this.getObj().GetMarkerImage(DvtMarker.IMAGE_SOURCE_HOVER));
  } else {
     if (this.getObj().isSelected())
      this._setSrc(this.getObj().GetMarkerImage(DvtMarker.IMAGE_SOURCE_SELECTED));
    else
      this._setSrc(this.getObj().GetMarkerImage(DvtMarker.IMAGE_SOURCE));
  }
};


DvtSvgMarker.prototype._setDimensions = function(image) {
  if (image && image.width && image.height) {
    this._image.setAttributeNS(null,'width', image.width);
    this._image.setAttributeNS(null,'height', image.height);
    var scaleX = this.getObj().getScaledWidth()/image.width;
    var scaleY = this.getObj().getScaledHeight()/image.height;
    this._image.setAttributeNS(null, 'x', this._x/scaleX);
    this._image.setAttributeNS(null, 'y', this._y/scaleY);
    var mat = new DvtMatrix();
    mat.scale(scaleX, scaleY);
    this._image.setAttributeNS(null,'transform', 'matrix(' + mat.getA() + ',' + mat.getC() + ',' + mat.getB() + ',' + 
                              mat.getD() + ',' + mat.getTx() + ',' + mat.getTy() + ')');
  }
}

/**
 * @override
 */
DvtSvgMarker.prototype.getDimensions = function() {
  // Added in order to prevent getDimensions returning null or a 0 width and height while waiting for an image load
  if (this._type == DvtMarker.IMAGE && !DvtAgent.getAgent().isWebkit()) {
    var w = this.getObj().getScaledWidth();
    var h = this.getObj().getScaledHeight()
    return new DvtRectangle(this._x, this._y, w, h);
  } else {
    return DvtSvgMarker.superclass.getDimensions.call(this);
  }
}

/**
 * @override
 */
DvtSvgMarker.prototype.GetElemDimensionsWithStroke = function() {
  if (this._type == DvtMarker.IMAGE && !DvtAgent.getAgent().isWebkit())
    return this.getDimensions(); // images don't have borders
  else
    return DvtSvgMarker.superclass.GetElemDimensionsWithStroke.call(this);
}

// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*-------------------------------------------------------------------------*/
/*    DvtSvgOval       Svg implementation of base elliptical shape         */
/*-------------------------------------------------------------------------*/
/**
  *   Creates an elliptical shape implemented by SVG.
  *   @extends DvtSvgCircle
  *   @class  DvtSvgOval Creates an elliptical shape implemented by SVG. Do not create directly
  *   - use {@link DvtOval}.
  *   <p>
  *   Example:<br><br><code>
  *   var Oval = new DvtOval(context, 50, 50, 20, 40) ;<br>
  *   </code>
  *   @constructor  
  *   @param {number} cx  The center x position.
  *   @param {number} cy  The center y position.
  *   @param {number} rx  The horizontal radius of the ellipse.
  *   @param {number} ry  The vertical radius of the ellipse.
  *   @param {String} id  Optional ID for the shape (see {@link  DvtDisplayable#setId}).
  */
var  DvtSvgOval = function(cx, cy, rx, ry, id)
{
   this._Init(cx, cy, rx, ry, id) ;
};

DvtObj.createSubclass(DvtSvgOval, DvtSvgCircle, "DvtSvgOval") ;



/*-------------------------------------------------------------------------*/
/*  _Init()                                                                */
/*-------------------------------------------------------------------------*/
/** @private */

DvtSvgOval.prototype._Init = function(cx, cy, rx, ry, id)
{
   DvtSvgOval.superclass._Init.call(this, cx, cy, rx, id, 'ellipse') ;

   this.setRx(rx);
   this.setRy(ry);
   this.setRadius(null) ;
} ;


/*-------------------------------------------------------------------------*/
/*   get/setRx()                                                           */
/*-------------------------------------------------------------------------*/
/**
  *  Returns the horizontal radius of the ellipse.
  *  @type number
  */
DvtSvgOval.prototype.getRx = function()
{
   return this._rx ;
} ;

/**
  *  Sets the horizontal radii of the ellipse.
  *  @param {number} rx  The horizontal radius of the ellipse.
  */
DvtSvgOval.prototype.setRx = function(rx)
{
   if (rx !== this._rx) {
     this._rx  = rx ;
     this._elem.setAttributeNS(null, 'rx', this._rx) ;
   }
} ;


/*-------------------------------------------------------------------------*/
/*   get/setRy()                                                           */
/*-------------------------------------------------------------------------*/
/**
  *  Returns the vertical radius of the ellipse.
  *  @type number
  */
DvtSvgOval.prototype.getRy = function()
{
   return this._ry ;
} ;

/**
  *  Sets the vertical radius of the ellipse.
  *  @param {number} ry  The vertical radius of the ellipse.
  */
DvtSvgOval.prototype.setRy = function(ry)
{
   if (ry !== this._ry) {
     this._ry  = ry ;
     this._elem.setAttributeNS(null, 'ry', this._ry) ;
   }
} ;


// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*-------------------------------------------------------------------------*/
/*   DvtSvgPath               SVG implementation of DvtPath                */
/*-------------------------------------------------------------------------*/
/**
  *   Creates a shape using SVG path commands implemented for SVG.
  *   @extends DvtSvgShape
  *   @class DvtSvgPath  Creates a shape using SVG path commands implemented for
  *   SVG.  Do not create directly, use {@link DvtPath}.
  *   <p>Example:<br><br><code>
  *   var  path = new DvtPath(context, mycmds) ;<br>
  *   </code>
  *   @constructor  
  *   @param {Object} cmds  Optional string of SVG path command (see comment for
  *                         {@link DvtPath#setCmds}),
  *                         or an array containing consecutive command and coordinate
  *                          entries (see comment for {@link DvtPath#setCommands}).
  *   @param {String} id  Optional ID for the shape (see {@link  DvtDisplayable#setId}).
  */
var  DvtSvgPath = function(cmds, id)
{
   this._Init(cmds, id) ;
};

DvtObj.createSubclass(DvtSvgPath, DvtSvgShape, "DvtSvgPath") ;






/*-------------------------------------------------------------------------*/
/*   Init()                                                                */
/*-------------------------------------------------------------------------*/
/** @private */
DvtSvgPath.prototype._Init = function(cmds, id)
{
   DvtSvgPath.superclass._Init.call(this, id, 'path') ;

   if (DvtArrayUtils.isArray(cmds)) {
     this.setCmds(DvtPathUtils.getPathString(cmds)) ;
   }
   else {
     this.setCmds(cmds) ;
   }
} ;


/*-------------------------------------------------------------------------*/
/*    get/setCmds()                                                        */
/*-------------------------------------------------------------------------*/
/**
  *  Gets the path from a string of SVG commands in SVG "d" attribute format.
  *  @param {String} cmds A string containing the SVG commands sequences.
  */
DvtSvgPath.prototype.getCmds = function()
{
   return this._sCmds ;
} ;
/**
  *  Sets the path from a string of SVG commands in SVG "d" attribute format.
  *  @param {String} cmds A string containing the SVG commands sequences.
  */
DvtSvgPath.prototype.setCmds = function(cmds)
{
   this._sCmds  = cmds ;
   if (cmds) {
     this._elem.setAttributeNS(null,'d', cmds) ;
   }
} ;

/**
 * @override
 */
DvtSvgPath.prototype.setMatrix = function(mat) {
  DvtSvgPath.superclass.setMatrix.call(this, mat);

  // Fix for bug 12622757
  DvtSvgDocumentUtils.fixWebkitFilters(this.getOuterElem());
}

/**
 * @override
 */
DvtSvgPath.prototype.setAlpha = function(alpha) {
  DvtSvgPath.superclass.setAlpha.call(this, alpha);

  // Fix for bug 12622757
  DvtSvgDocumentUtils.fixWebkitFilters(this.getOuterElem());
}

/**
 * @override
 */
DvtSvgPath.prototype.setFill = function(obj) { 
  DvtSvgPath.superclass.setFill.call(this, obj);

  // Fix for bug 12622757
  DvtSvgDocumentUtils.fixWebkitFilters(this.getOuterElem());
}

/**
 * @override
 */
DvtSvgPath.prototype.setStroke = function(obj) {
  DvtSvgPath.superclass.setStroke.call(this, obj);

  // Fix for bug 12622757
  DvtSvgDocumentUtils.fixWebkitFilters(this.getOuterElem());
}


// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*-------------------------------------------------------------------------*/
/*   DvtSvgPolygon         SVG Implementation of Base Polygon shape        */
/*-------------------------------------------------------------------------*/
/**
  *   Creates a polygon from an array of (x,y) coordinates.
  *   SVG implementation for DvtPolygon which creates a shape of connected line segments.
  *   @extends DvtSvgShape
  *   @class DvtSvgPolygon
  *   @constructor  
  *   @param {Array} arPoints  An array of x, y pairs of coordinates.
  *   @param {String} id  Optional ID for the shape (see {@link  DvtDisplayable#setId}).
  */
var  DvtSvgPolygon = function(arPoints, id)
{
   this._Init(arPoints, id) ;
};

DvtObj.createSubclass(DvtSvgPolygon, DvtSvgShape, "DvtSvgPolygon") ;





/*-------------------------------------------------------------------------*/
/*   _Init()                                                               */
/*-------------------------------------------------------------------------*/
/** @private */
DvtSvgPolygon.prototype._Init = function(arPoints, id)
{
   DvtSvgPolygon.superclass._Init.call(this, id, 'polygon') ;

   this.setPoints(arPoints) ;

} ;

/*-------------------------------------------------------------------------*/
/*   get/setPoints()            Gets/Sets the polygon points               */
/*-------------------------------------------------------------------------*/

DvtSvgPolygon.prototype.getPoints = function()
{
   return  this._arPoints ;
} ;

/**
  *   Sets the polygon points from an array of x,y coordinate pairs.
  *   @param {Array} arPoints  An array of x, y pairs of coordinates.
  */
DvtSvgPolygon.prototype.setPoints = function(arPoints)
{
   this._arPoints = arPoints ;
   this._sPoints = DvtSvgShapeUtils.convertPointsArray(arPoints);
   this._elem.setAttributeNS(null, 'points', this._sPoints) ;
} ;
// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*--------------------------------------------------------------------*/
/*   DvtSvgPolyline         SVG Implementation of DvtPolyline         */
/*--------------------------------------------------------------------*/
/**
  *   Svg implementation for DvtPolyline which creates a series of joined
  *   lines whose points are specified by an array of x,y pairs).
  *   @extends DvtSvgShape
  *   @class DvtSvgPolyline
  *   @constructor  
  *   @param {Array} arPoints  An array of point coordinates.
  *   @param {String} id  Optional ID for the shape (see {@link  DvtDisplayable#setId}).
  *   <p>
  *   Example:<br><br><code
  *   var points = [10,20,40,34,59,128, . . .] ;<br>
  *   var polyline = new DvtPolyline(context, points);<br>
  *    </code>
  */
var DvtSvgPolyline = function(arPoints, id)
{
   this._Init(arPoints, id) ;
};

DvtObj.createSubclass(DvtSvgPolyline, DvtSvgShape, "DvtSvgPolyline") ;





/*--------------------------------------------------------------------*/
/*   _Init()                                                          */
/*--------------------------------------------------------------------*/

DvtSvgPolyline.prototype._Init = function(arPoints, id)
{
   DvtSvgPolyline.superclass._Init.call(this, id, 'polyline') ;

   this._elem.setAttributeNS(null, 'fill', 'none') ;
   this.setPoints(arPoints) ;

} ;


/*-------------------------------------------------------------------------*/
/*   get/setPoints()            Gets/Sets the polygon points               */
/*-------------------------------------------------------------------------*/

DvtSvgPolyline.prototype.getPoints = function()
{
   return  this._arPoints ;
} ;

/**
  *   Sets the polyline points from an array of x,y coordinate pairs.
  *   @param {Array} arPoints  An array of x, y pairs of coordinates.
  */
DvtSvgPolyline.prototype.setPoints = function(arPoints)
{
   this._arPoints = arPoints ;
   this._sPoints = DvtSvgShapeUtils.convertPointsArray(arPoints);
   this._elem.setAttributeNS(null, 'points', this._sPoints) ;
} ;
// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*---------------------------------------------------------------------*/
/*    DvtSvgRect          Svg implementation for base shape DvtRect    */
/*---------------------------------------------------------------------*/
/**
  *   Svg implementation for DvtRect.
  *   @extends DvtSvgShape
  *   @class DvtSvgRect
  *   @constructor  
  *   May be specified as individual values or using a DvtRectangle object.
  *   <p>
  *   Example:<br><br><code>
  *   rect = new DvtRect(context, 10, 10, 50, 100) ; &nbsp; @nbsp;  or<br>
  *
  *   rect = new DvtRect(context, myRect) ;  &nbsp; &nbsp;  where myRect = new DvtRectangle(10, 10, 50, 100);<br>
  *   </code>
  */
var  DvtSvgRect = function(x, y, w, h, id)
{
   this._Init(x, y, w, h, id) ;
};

DvtObj.createSubclass(DvtSvgRect, DvtSvgShape, "DvtSvgRect") ;

DvtSvgRect._cssAttrs = 
[
  "background-color",
  "border-color",
  "border-width"
];

/*---------------------------------------------------------------------*/
/*  Init()                                                             */
/*---------------------------------------------------------------------*/
/** @private */
DvtSvgRect.prototype._Init = function(x, y, w, h, id)
{
   DvtSvgRect.superclass._Init.call(this, id, 'rect') ;

   this.setX(x);
   this.setY(y);
   this.setWidth(w);
   this.setHeight(h);
} ;

/*---------------------------------------------------------------------*/
/*   get/setX()                                                        */
/*---------------------------------------------------------------------*/

DvtSvgRect.prototype.getX = function()
{
   return this._x ;
} ;
DvtSvgRect.prototype.setX = function(x)
{
   if (x !== this._x) {
     this._x  = x ;
     this._elem.setAttributeNS(null,'x', this._x) ;
   }
} ;


/*---------------------------------------------------------------------*/
/*   get/setY()                                                        */
/*---------------------------------------------------------------------*/

DvtSvgRect.prototype.getY = function()
{
   return this._y ;
} ;
DvtSvgRect.prototype.setY = function(y)
{
   if (y !== this._y) {
     this._y  = y ;
     this._elem.setAttributeNS(null,'y', this._y) ;
   }
} ;


/*---------------------------------------------------------------------*/
/*   get/setWidth()                                                    */
/*---------------------------------------------------------------------*/

DvtSvgRect.prototype.getWidth = function()
{
   return this._w ;
} ;

/**
  *  Sets the width of the rectangle.
  *  @param {number} w  The width of the rectangle.
  */
DvtSvgRect.prototype.setWidth = function(w)
{
   if (w !== this._w) {
     this._w  = w ;
     this._elem.setAttributeNS(null,'width', this._w) ;
   }
} ;

/*---------------------------------------------------------------------*/
/*   get/setHeight()                                                   */
/*---------------------------------------------------------------------*/
/**
  *  Returns the height of the rectangle.
  *  @type number
  */
DvtSvgRect.prototype.getHeight = function()
{
   return  this._h ;
} ;

/**
  *  Sets the height of the rectangle.
  *  @param {number} h  The height of the rectangle.
  */
DvtSvgRect.prototype.setHeight = function(h)
{
   if (h !== this._h) {
     this._h  = h ;
     this._elem.setAttributeNS(null,'height', this._h) ;
   }
} ;

/*---------------------------------------------------------------------*/
/*   get/setRx()                                                       */
/*---------------------------------------------------------------------*/

DvtSvgRect.prototype.getRx = function()
{
   return this._rx ;
} ;
DvtSvgRect.prototype.setRx = function(rx)
{
   if (rx !== this._rx) {
     this._rx  = rx ;
     this._elem.setAttributeNS(null,'rx', this._rx) ;
   }
} ;

/*---------------------------------------------------------------------*/
/*   get/setRy()                                                       */
/*---------------------------------------------------------------------*/

DvtSvgRect.prototype.getRy = function()
{
   return this._ry ;
} ;
DvtSvgRect.prototype.setRy = function(ry)
{
   if (ry !== this._ry) {
     this._ry  = ry ;
     this._elem.setAttributeNS(null,'ry', this._ry) ;
   }
} ;

/**
 * Sets the DvtCSSStyle of this object.
 * @param {DvtCssStyle} style The DvtCSSStyle of this object.
 */
DvtSvgRect.prototype.setCSSStyle = function(style)
{
  DvtSvgRect.superclass.setCSSStyle.call(this, style);
  
  //calling this results in fill="none" being removed
  //on rects that don't apply a css style, which
  //results in them being filled black
  //DvtSvgRect._removeDefaultAttributes(this._elem);
  
  var elem = this._elem;
  if (style)
  {
    var val = style["background-color"];
    if (val) {
      elem.setAttributeNS(null, "fill", val);
    }
    val = style["border-color"];
    if (val) {
      elem.setAttributeNS(null, "stroke", val);
    }
    val = style["border-width"];
    if (val) {
      elem.setAttributeNS(null, "stroke-width", val);
    }

    //bug 13826956 - border-radius css property not supported when used inside <dvt:node>
    val = style["border-radius"];
    if (val) {
      var radArr = DvtStringUtils.trim(val).split(" ");
      if (radArr.length > 0 && radArr[0]) {
        this.setRx(radArr[0]);
      }
      if (radArr.length > 1 && radArr[1]) {
        this.setRy(radArr[1]);
      }
    }
  }
  else
  {
    this._elem.removeAttributeNS(null, "style");
  }
};

DvtSvgRect._removeDefaultAttributes = function(elem)
{
  elem.removeAttributeNS(null,"fill");
  elem.removeAttributeNS(null,"stroke");
  elem.removeAttributeNS(null,"stroke-width");
};

// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*-------------------------------------------------------------------------*/
/*   DvtSvgText        SVG implementation of text "shape"                  */
/*-------------------------------------------------------------------------*/
/**
 * Creates an instance of DvtSvgText.
 * @class DvtSvgText
 * @extends DvtSvgShape
 * @constructor
 * @param textStr {string} the text string
 * @param x {number} x the x position
 * @param y {number} y the y position
 * @param {String} id  Optional ID for the shape (see {@link  DvtDisplayable#setId}).
 */
var  DvtSvgText = function(textStr, x, y, id)
{
  this._Init(textStr, x, y, id) ;
};

DvtObj.createSubclass(DvtSvgText, DvtSvgShape, "DvtSvgText") ;


/**
 * Initializes this instance of DvtText.
 * @param textStr {string} the text string
 * @param x {number} x the x position
 * @param y {number} y the y position
 * @param id {string} the id for this object
 */
DvtSvgText.prototype._Init = function(textStr, x, y, id)
{
  DvtSvgText.superclass._Init.call(this, id, 'text') ;
  
  this.setTextString(textStr);
  this.setX(x);
  this.setY(y);
  
  // TODO this should be defined elsewhere
  // cursor is needed for chrome, but should be dependent on interactivity
  this.getElem().setAttributeNS(null,"font-family", "tahoma, sans-serif");
  this.getElem().setAttributeNS(null,"fill", "rgb(0,0,0)"); 
  this.setCursor("default"); 
  
  // fix for bug 14528150 (the chrome case) and 14297988 (the ie case)
  if (DvtStyleUtils.isLocaleR2L()){
    var agent = DvtAgent.getAgent() ;
    if (agent.getPlatform() === DvtAgent.IE_PLATFORM)
      this.setTextString("\u202B"+textStr);
    else if (agent.isChrome())
      this.alignEnd();
    else
      this.getElem().setAttributeNS(null,"unicode-bidi", "embed");
  }
 
  //Bug 13879007 - NODE RENDERED INCORRECTLY IN IE9
  this._baseline = null;

  //  For edit mode 
  this._bEditMode   = false ;
  this._foElem      = null ;    // <fo> elem
  this._editPxWidth ;
  this._editElem    = null ;    // <textarea> elem
  this._editBorder  = false ;
  this._editTooltip = null ;
} ;

/**
 * Returns the text string for this text object.
 * @return {string} the text string
 */ 
DvtSvgText.prototype.getTextString = function() {
  var txt ;
  if (this._bEditMode && this._editElem) {      // if in edit mode
     txt = this._editElem.value ;
  }
  else {
    var textNode = this.getElem().firstChild;
    if (textNode) {
      txt = textNode.nodeValue;
    }
  }
  return txt ;
} ;

/**
 * Sets the text string for this text object.
 * @param {string} textStr the text string
 */
DvtSvgText.prototype.setTextString = function(textStr)
{
  // Update the text node if it is already created
  var textNode = this.getElem().firstChild;
  if(textNode !== null) {
    textNode.nodeValue = textStr;
  }
  else { // Otherwise create it
    textNode = document.createTextNode(textStr);
    this.getElem().appendChild(textNode);
  }

  if (this._editElem) {             // if an edit element, change its text also.
    this._editElem.value = textStr ;
  }

} ;


/**
 * Sets the text angle. See also {@link DvtSvgText#setRotatePoint}.
 * @param {number} a the angle in degrees. Positive angles rotate counter-clockwise.
 */
DvtSvgText.prototype.setAngle = function(a)
{
   this._angle = (a % 360) ;

   if (this._angle > 0) {
     this._angle = 360 - this._angle ;    // for svg, positive angles rotate clockwise
   }

   if (this._angle != 0) {
     if (this._cx && this._cy) {
       this.getElem().setAttributeNS(null,'transform', "rotate(" + this._angle + " " + 
                                           this._cx + "," + this._cy + ")") ;
     }
   }
   else {
     this.getElem().removeAttributeNS(null, 'transform');
     if (DvtAgent.getAgent().getPlatform() == DvtAgent.IE_PLATFORM) { // bug 14622256, prev removeAttributeNS()
       this.getElem().setAttributeNS(null, 'transform', null);        // fails for IE9 (9.0.8112.16421)
     }
   }
}; 


/**
 * Sets the rotation point for angled text (see {@link DvtSvgText#setAngle}).
 * @param {number} cx the rotation point x-coordinate.
 * @param {number} cy the rotation point y-coordinate.
 */
DvtSvgText.prototype.setRotatePoint = function(cx, cy)
{
  this._cx = cx ;
  this._cy = cy ;
  if (this._angle) {
    this.getElem().setAttributeNS(null,'transform', "rotate(" + this._angle + " " + cx + "," + cy + ")") ;
  }
}; 


/**
 * Gets the x position for this text object.
 * @returns {number}  the x position
 */
DvtSvgText.prototype.getX = function()
{
  return  this._x ;
};

/**
 * Sets the x position for this text object.
 * @param {number} x the x position
 */
DvtSvgText.prototype.setX = function(x)
{
  if (x !== this._x) {
    this._x  = x ;
    this.getElem().setAttributeNS(null,'x', x);
  }
}; 

/**
 * Gets the y position for this text object.
 * @returns {number}  the y position
 */
DvtSvgText.prototype.getY = function()
{
  return  this._y ;
};
/**
 * Sets the y position for this text object.
 * @param {number} y the y position
 */
DvtSvgText.prototype.setY = function(y)
{
  if (y !== this._y) {
    this._y  = y ;
    this.getElem().setAttributeNS(null,'y', y);
  }
};

/**
 * Sets the font size.
 * @param {number} fontSize the font size
 */
DvtSvgText.prototype.setFontSize = function(fontSize)
{
  this.getElem().setAttributeNS(null,'font-size', fontSize);

  //Bug 13879007 - NODE RENDERED INCORRECTLY IN IE9
  this._setMatrix(this.getMatrix(), fontSize);
};

// TODO JSDOC Not sure how to expose these, so this is temporary
DvtSvgText.prototype.alignStart = function() {
  this.getElem().setAttributeNS(null,"text-anchor","start");
}

// TODO JSDOC Not sure how to expose these, so this is temporary
DvtSvgText.prototype.alignMiddle = function() {
  this.getElem().setAttributeNS(null,"text-anchor","middle");
}

// TODO JSDOC Not sure how to expose these, so this is temporary
DvtSvgText.prototype.alignEnd = function() {
  this.getElem().setAttributeNS(null,"text-anchor","end");
}

// TODO JSDOC Not sure how to expose these, so this is temporary
DvtSvgText.prototype.alignTop = function() {
  //Bug 13879007 - NODE RENDERED INCORRECTLY IN IE9
  if (DvtAgent.getAgent().getPlatform() == DvtAgent.IE_PLATFORM) {
    //+ font-size
    this._baseline = 1;
    this._setMatrix(this.getMatrix(), null);
  }

  this.getElem().setAttributeNS(null,"dominant-baseline","text-before-edge");

};

// TODO JSDOC Not sure how to expose these, so this is temporary
DvtSvgText.prototype.alignCenter = function() {
  //Bug 13879007 - NODE RENDERED INCORRECTLY IN IE9
  if (DvtAgent.getAgent().getPlatform() == DvtAgent.IE_PLATFORM) {
    //+ 1/3 font-size
    this._baseline = 1/3;
    this._setMatrix(this.getMatrix(), null);
  }
  this.getElem().setAttributeNS(null,"dominant-baseline","middle");
};

// TODO JSDOC Not sure how to expose these, so this is temporary
DvtSvgText.prototype.alignBottom = function() {
  //Bug 13879007 - NODE RENDERED INCORRECTLY IN IE9
  if (DvtAgent.getAgent().getPlatform() == DvtAgent.IE_PLATFORM) {
    //+ 1/3 font-size
    this._baseline = 1/3;
    this._setMatrix(this.getMatrix(), null);
  }
  this.getElem().setAttributeNS(null,"dominant-baseline","text-after-edge");
};

// TODO JSDOC Not sure how to expose these, so this is temporary
DvtSvgText.prototype.alignBaseline = function() {
  //Bug 13879007 - NODE RENDERED INCORRECTLY IN IE9
  if (DvtAgent.getAgent().getPlatform() == DvtAgent.IE_PLATFORM) {
    this._baseline = 0;
    this._setMatrix(this.getMatrix(), null);
  }
  this.getElem().removeAttributeNS(null,"dominant-baseline");
};

/**
 * Sets the text string for this text object.
 * @param {string} text the text string
 */
DvtSvgText.prototype.setText = function(text) {
  // Update the text node if it is already created
  var textNode = this.getElem().firstChild;
  if(textNode !== null) {
    textNode.nodeValue = text;
  }
  else { // Otherwise create it
    textNode = document.createTextNode(text);
    this.getElem().appendChild(textNode);
  }

  if (this._bEditMode) {             // if in edit mode, also change the textarea
    this._editElem.value = text ;
    //touch the parent elem of the textarea to force it to repaint in webkit
    DvtSvgDocumentUtils.fixWebkitFilters(this._foElem);
  }
};

/**
 * @return the text string for this text object.
 */
DvtSvgText.prototype.getText = function() {
  if (this._bEditMode) {
    return this._editElem.value;
  }
  
  var textNode = this.getElem().firstChild;
  if(textNode) {
    return textNode.nodeValue;
  }
};

/**
 * Sets the DvtCSSStyle of this object.
 * @param {DvtCSSStyle} style The DvtCSSStyle of this object.
 */
DvtSvgText.prototype.setCSSStyle = function(style)
{
  DvtSvgText.superclass.setCSSStyle.call(this, style);
  var elem = this.getOuterElem();

  if (style) {
    //NOTE: svg does not recognize css "color" attribute, use "fill" instead
    var val = style.color;
    if(val)
      elem.setAttributeNS(null, "fill", val);
  
    val = style["font-family"];
    if (val) {
      elem.setAttributeNS(null, "font-family", val);
    }
    val = style["font-size"];
    if (val) {
      elem.setAttributeNS(null, "font-size", val);

      //Bug 13879007 - NODE RENDERED INCORRECTLY IN IE9
      this._setMatrix(this.getMatrix(), val);
    }
    val = style["font-style"];
    if (val) {
      elem.setAttributeNS(null, "font-style", val);
    }
    val = style["font-weight"];
    if (val) {
      elem.setAttributeNS(null, "font-weight", val);
    }

    //NOTE: svg does not recognize css "text-align" attribute, 
    //call alignMiddle, alignStart, alignEnd... if needed.
    //For multi line text, text-align is handled in DvtSvgTextArea

    val = style["text-decoration"];
    if (val) {
      elem.setAttributeNS(null, "text-decoration", val);
    }

    val = style["cursor"];
    if (val) {
      elem.setAttributeNS(null, "cursor", val);
    }

    color = style.color;
  }
};


/**
 * Returns true if this text object is in editMode, else false.
 * @type boolean
 */
DvtSvgText.prototype.getEditMode = function()
{
    return this._bEditMode ;
};


/**
 * Sets the edit mode of this text object.
 * @param bEditMode {boolean} true if the text is to be editable, else false.
 *                            The mode may be changed at any time.
 */
DvtSvgText.prototype.setEditMode = function(bEditMode)
{
    if (this._bEditMode == bEditMode)
      return ;
 
    var obj        =  this.getObj() ;
    var parentImpl =  obj.getParent()._impl ;
    var textElem   =  this.getElem() ;
    var input ;                                   // textArea elem

    if ((! bEditMode) && this._foElem)
    {                                             // change from edit to non-edit mode
       this.setTextString(this._editElem.value) ;

       parentImpl._elem.removeChild(this._foElem) ;
       parentImpl._elem.appendChild(textElem) ;

       if (this._bEventListener) {
         input = this._editElem ;
         input.removeEventListener("keypress",  DvtSvgText._editFilter, false);
         input.removeEventListener("textInput", DvtSvgText._editFilter, false);
         input.removeEventListener("textinput", DvtSvgText._editFilter, false);
         this._bEventListener = false ;
       }
    }
    else                                       // change to editMode
    {
      if (! this._foElem) {                    // first time check
        input = this._buildFO(obj, textElem) ; // build foreign object and textArea
      }

      parentImpl.getElem().removeChild(textElem) ;
      parentImpl.getElem().appendChild(this._foElem) ;

      input = this._editElem ;
      if (input.addEventListener) {
        input.addEventListener("keypress",  DvtSvgText._editFilter, false);   // legacy event handler, works everywhere
        input.addEventListener("textInput", DvtSvgText._editFilter, false);   // Safari and Chrome
        input.addEventListener("textinput", DvtSvgText._editFilter, false);   // DOM Level 3 Events draft
        this._bEventListener = true ;
      }
    }
    this._bEditMode = bEditMode ;

};


/**
  *   Returns the horizontal pixel width of the edit field set by {@link DvtSvgText#setEditWidth}.
  *    @type {number} the horizontal pixel width of the edit field.
  */
DvtSvgText.prototype.getEditWidth = function(pxWidth)
{
  return this._editPxWidth ;
};


/**
  *    Defines the horizontal pixel width to contain the edit field.  This should be
  *    set before applying setEditMode(true).  If not specified,a size based on the
  *    number of characters in the DvtText is used.
  *    @param pxWidth {number} the horizontal pixel width to contain the edit field.
  */
DvtSvgText.prototype.setEditWidth = function(pxWidth)
{
  this._editPxWidth = pxWidth ;
};

DvtSvgText.prototype.setEditTooltip = function(sTip)
{
  this._editTooltip = sTip ;
};


/*
DvtSvgText.prototype.getEditBorder = function(bShow)
{
  return this._editBorder ;
};


DvtSvgText.prototype.setEditBorder = function(bShow)
{
  this._editBorder = bShow ;
  if (this._editElem)
    this._editElem.setAttribute("style", "border: " + bShow? ";" : "none;") ;
    this._editElem.setAttribute("style", "border-width: " + bShow? "1;" : "none;") ;
};
*/




DvtSvgText._editFilter = function(event)
{
   var  e    = event || window.event ;
   var  targ = e.target || e.srcElement ;
   var  text ;

   if (e.type == "textinput" || e.type == "textInput")
   {   //  for future filtering use
   }
   else
   {
      var  code = e.charCode || e.keyCode ;
      if ( code < 32)                           // ascii ctl char?
      {
         if (code == 13) {                       // filter out CR
           if (e.preventDefault)
             e.preventDefault() ;
         }
      }
   }
};

DvtSvgText.prototype.selectEditText = function() {
  if (this._editElem) {
    this._editElem.select();
  }
};

DvtSvgText.prototype.focusEditText = function() {
  if (this._editElem) {
    this._editElem.focus();
  }
};


/**
 * @private
 * Remove the default font attributes that are set in the constructor
 * Used the font attributes in the DvtCSSStyle instead
 * @param {DvtCssStyle} style The DvtCSSStyle of this object.
 */
DvtSvgText.prototype._removeDefaultFontAttributes = function(elem)
{
  elem.removeAttributeNS(null,"font-family");
  elem.removeAttributeNS(null,"fill");
};


DvtSvgText.prototype._createTSpan = function(text, parentElem) {
  var tspan  = DvtSvgShapeUtils.createElement('tspan', undefined);
  if (parentElem) {
    parentElem.appendChild(tspan);
  }
  else {
    this.getElem().appendChild(tspan);
  }

  var baseline = this.getElem().getAttributeNS(null,'dominant-baseline');
  if (baseline)
      tspan.setAttributeNS(null,"dominant-baseline",baseline);
  var anchor = this.getElem().getAttributeNS(null,'text-anchor');
  if (anchor)
      tspan.setAttributeNS(null,"text-anchor",anchor);
  
  // add text node
  if (text) {
    this._addTextNode(tspan, text);
  }
  return tspan;
};


DvtSvgText.prototype._createTextNode = function(text) {
  this._addTextNode(this.getElem(), text);
};

DvtSvgText.prototype._addTextNode = function(elem, text) {
  var textNode = document.createTextNode(text);
  if (elem) {
    elem.appendChild(textNode);
  }
  else {
    this.getElem().appendChild(textNode);
  }
};


DvtSvgText.prototype._adjustTextBidi = function(){
    var bbox = this.getDimensions();
}

//Bug 13879007 - NODE RENDERED INCORRECTLY IN IE9
DvtSvgText.prototype._adjustBaseline = function(fontSize) {

  //if not in IE, no adjustment required
  var dy = 0;
  if (this._baseline != null) {
    //default fontSize to 11px
    if (! fontSize) {
      fontSize = this.getElem().getAttributeNS(null,'font-size');
      if (! fontSize) {
        fontSize = this.getOuterElem().getAttributeNS(null,'font-size');
        if (! fontSize)
          fontSize = "11";
      }
    }
    dy = this._baseline * parseFloat(fontSize);
  }
  return dy;
};

DvtSvgText.prototype._setMatrix = function(mat, fontSize) {
  if (this._baseline != null && this.getObj()) {
    if (! mat) {
      mat = new DvtMatrix(this.getObj().getContext());
    }
    var nmat = new DvtMatrix(this.getObj().getContext(), null, null, null, null, null, 
                             this._adjustBaseline(fontSize));
    nmat.concat(mat);
    mat = nmat;
  }
  DvtSvgText.superclass.setMatrix.call(this, mat);
}

DvtSvgText.prototype.getMatrix = function() {
  return this.getObj() ? this.getObj().getMatrix() : null;
}


/**
  *  @override
  */
DvtSvgText.prototype.setMatrix = function(mat) {
  this._setMatrix(mat, null);
}

/**
  *  @override
  */
DvtSvgText.prototype.getDimensions = function() {
  var bbox = DvtSvgText.superclass.getDimensions.call(this);
  
  //Bug 13879007 - NODE RENDERED INCORRECTLY IN IE9
  if (bbox)
    bbox.y += this._adjustBaseline(null);

  return bbox;
};


/**
  *    Create a <textArea> element and wrap in a <foreignObject>
  */
DvtSvgText.prototype._buildFO = function(obj, textElem)
{
   var fo       = DvtSvgShapeUtils.createElement("foreignObject") ;
   this._foElem = fo ;
   this._foElem._obj = this;

   var input  = document.createElement("textArea") ;
   this._editElem = input ;
   this._editElem._obj = this;

   var bbox   = obj.getDimensions() ;
   var txt    = this.getText() ;
   var css    = obj.getCSSStyle() ;
   var cssSize ;
   var cssFamily ;
   var cols   = 0 ;       // textArea cols

   if (! css) {
     cssSize   = textElem.getAttributeNS(null, "font-size") || "11" ;
     cssFamily = textElem.getAttributeNS(null, "font-family")
     css       = "font-family:" + cssFamily + ";" + " font-size: " + cssSize + "px;" ;
   }

   if (this.getX() || this.getX() == 0) {
     fo.setAttributeNS(null, "x", this.getX()) ;
   }
   if (this.getY() || this.getY() == 0) {
     fo.setAttributeNS(null, "y", this.getY()) ;
   }

   if (this._editPxWidth) {                            // pixel width is expected!
      // Figure out text char width to get approximate cols
      var t = new DvtText(obj.getContext(), "M");
      t.setCSSStyle(css);
      t.alignCenter();
      obj.getParent().addChild(t);
      var dims = t.getDimensions();
      obj.getParent().removeChild(t);
      cols = (this._editPxWidth/dims.w) ;
   }
   else {                                              // no pixel width!
      if (bbox.w == 0) {                               // just use some default value so
        bbox.w = 10 ;                                  // that its at least visible.
      }
      this._editPxWidth = bbox.w * 2 ;
      cols = 2 ;
   }

   fo.setAttributeNS(null, "width", this._editPxWidth) ; // width/height of fo are required
   cols = Math.floor(cols * 1.5) ;                       // heuristic for cols
   //console.log("cols=" + cols) ;

   fo.setAttributeNS(null, "height", bbox.h ) ;
   input.setAttribute("rows", "1") ;
   input.setAttribute("cols",  cols) ;           // cols determines edit box width
   if (txt) {
     input.value = txt ;
   }
   else {
     input.value = "";
   }
   
   fo.appendChild(input) ;

   if (this._editTooltip) {
     input.setAttribute("title", this._editTooltip) ;
   }

   css += " color:" + textElem.getAttributeNS(null, "fill") + ";" ;
   css += " overflow-x: hidden;" ;      
   css += " border: none; border-width: 0px; margin: 0px; resize: none; outline: none;" ; 
   css += " dominant-baseline:" + textElem.getAttributeNS(null, "dominant-baseline") + ";" ;

// css += " line-height: 1;" ; 
   css += " top: 0px; left: 0px;" ;
   css += " vertical-align: baseline; outline-offset: 0px;" ; 
   var padding = 2;
   if (DvtAgent.getAgent().isRightToLeft()) {
     css += " text-align: right; padding: 0px " + padding + "px 0px 0px;" ;
   }
   else {
     css += " text-align: left; padding: 0px 0px 0px " + padding + "px;" ;
   }
   input.setAttribute("style", css) ;

   var agent = DvtAgent.getAgent() ;
   if (agent.isChrome() || agent.isSafari()) {
     input.setAttribute("wrap", "off") ;
   }

   return input ;
} ;

DvtSvgText.prototype.AddElemListener = function(type, listener, useCapture) {
  if (this.getEditMode() && this._editElem) {
    this._editElem.addEventListener(type, listener, useCapture);
    if (type == "touchend") {
        this._editElem.addEventListener("touchcancel", listener, useCapture);
    }
  }
  
  DvtSvgText.superclass.AddElemListener.call(this, type, listener, useCapture);
};


DvtSvgText.prototype.SetElemMatrix = function(sMat) {
  if (this.getEditMode() && this._foElem) {
    this._foElem.setAttributeNS(null,'transform', sMat) ;
  }
  DvtSvgText.superclass.SetElemMatrix.call(this, sMat);
};

/*DvtSvgText.prototype.getElem = function() {
  if (this.getEditMode() && this._foElem) {
    return this._foElem;
  }
  return DvtSvgText.superclass.getElem.call(this) ;
};*/

// Copyright (c) 2011, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*-------------------------------------------------------------------------*/
/*   DvtSvgTextArea        SVG implementation of textArea "shape"          */
/*-------------------------------------------------------------------------*/
/**
 * @constructor
 * Creates an instance of DvtSvgTextArea.
 * @extends DvtSvgShape
 * @class DvtSvgTextArea
 * @param {String} id  Optional ID for the shape (see {@link  DvtDisplayable#setId}).
 */
var DvtSvgTextArea = function(x, y, id) {
  this._Init(x, y, id) ;
};

DvtObj.createSubclass(DvtSvgTextArea, DvtSvgText, "DvtSvgTextArea") ;


/**
 * Initializes this instance of DvtTextArea.
 * @param text {string} the text string
 * @param x {number} x the x position
 * @param y {number} y the y position
 * @param id {string} the id for this object
 */
DvtSvgTextArea.prototype._Init = function(x, y, id) {
  //remove this if graph is ok with the text alignment changes
  if (x === undefined && y === undefined) {
    x = 0;
    y = 0;
    this._notGraph = true;
  }

  DvtSvgTextArea.superclass._Init.call(this, "", x, y, id) ;  
  
  // the adjustment to the amount of space between lines
  this._leading = 0;
}


/**
 * Sets the text string for this textArea object.
 * @param {array} single line text or multiline text
 * @param {array} dimList Optional dimensions of multilines
 */
DvtSvgTextArea.prototype.setText = function(multilines, dimList) {
  var singleLine;
  if (DvtArrayUtils.isArray(multilines)) {
    if (multilines.length == 1)
      singleLine = multilines[0];
  }
  else {
    singleLine = multilines;
  }

  // clear the old text
  var obj = this.getObj();
  var elem = this.getElem();

  // keep the old dominant-baseline
  var dbl;
  if (elem.nodeName == "g") {
    var childNodes = elem.childNodes;
    if (childNodes && childNodes.length > 0 && childNodes[0].nodeName == "text") {
      dbl = childNodes[0].getAttributeNS(null,'dominant-baseline');
    }
  }

  DvtDomXmlNode._removeTextNodes(elem);

  if (obj.getNumChildren() === 0 && singleLine) {
    // Update the text node if it is already created
    var textNode = this.getElem().firstChild;
    if(textNode) {
      textNode.nodeValue = singleLine;
    }
    // Otherwise create it
    else {
      this._createTextNode(singleLine);
    }
  }
  else {
    var oldx = parseFloat(elem.getAttributeNS(null,'x'));
    var oldy = parseFloat(elem.getAttributeNS(null,'y'));

    if (singleLine) {
      this._addLine(obj, singleLine, oldx, oldy);
    }
    else {
      var x = 0;
      var hh = 0;
      var dim;
      var maxDim = new DvtRectangle(oldx, oldy, obj._getMaxTextWidth(), obj._getMaxTextHeight());
      var textAlign = this._getTextAlign();

      for (var i = 0; i < multilines.length; i++) {
        dim = (dimList && dimList[i]) ? dimList[i] : maxDim;

        if (textAlign == "end") {
          x = oldx + obj._getMaxTextWidth() - dim.w;
        }
        else if (textAlign == "middle") {
          x = oldx + (obj._getMaxTextWidth() - dim.w)/ 2;
        }

        this._addTextLine(obj, multilines[i], x, hh, dbl);

        hh += dim.h;
      }

      //Bug 13542241 - treemap node content sometimes doesn't respect bold
      var g = this.getOuterElem();
      if (g.nodeName && g.nodeName == "g" && g !== elem) {
        //remove the old element
        g.removeChild(elem);

        //apply css styles on the group element
        var style = this.getCSSStyle();
        if (style) {
          this.setCSSStyle(style);
        }
      }
    }
  }
}


/**
 * Gets the text string for this textArea object.
 * @param {string} text the text string
 */
DvtSvgTextArea.prototype.getText = function() {
  var obj = this.getObj();
  var nkids = obj.getNumChildren();

  if (nkids == 0) {
    return DvtSvgTextArea.superclass.getText.call(this);
  }
  else {
    var child;
    var text = "";
    for (var i = 0; i < nkids; i++) {
      child = obj.getChildAt(i);
      text += child.getText();
    }
  }
  return text;
}


/**
 * Returns the amount of vertical space, in pixels, between lines
 * @return {number} the amount of vertical space (called leading) between lines
 */
DvtSvgTextArea.prototype.getLeading = function() {
  return this._leading;
};

/**
 * Sets the amount of vertical space, in pixels, between lines
 * @param {number} leading amount of vertical space, in pixels, between lines
 */
DvtSvgTextArea.prototype.setLeading = function(leading) {
  this._leading = leading;
};

// add a text line
DvtSvgTextArea.prototype._addLine = function(obj, newLineText, x, dy) {
  var newText = this._createTSpan(newLineText);
  newText.setAttributeNS(null,'x', x);
  newText.setAttributeNS(null,'dy', dy + this.getLeading());

  // peformance: dont getDimensions for each line
//   return this.getDimensions().h;
}

// add a text line
DvtSvgTextArea.prototype._addTextLine = function(obj, newLineText, x, y, dbl) {
  var newText = new DvtSvgText(newLineText, x, y, null);
  var textNode = this.getElem().firstChild;
  
  if (textNode == null){
      textNode = this.getElem();
  }
  var attr = textNode.getAttributeNS(null,'dominant-baseline');
  if (attr) {
      newText.getElem().setAttributeNS(null,"dominant-baseline",attr);
  }
  else if (dbl) {
      newText.getElem().setAttributeNS(null,"dominant-baseline",dbl);
  }

  attr = textNode.getAttributeNS(null,'text-anchor');
  if (attr)
      newText.getElem().setAttributeNS(null,"text-anchor",attr);
  attr = textNode.getAttributeNS(null,'font-family');
  if (attr)
      newText.getElem().setAttributeNS(null,"font-family",attr);
  attr = textNode.getAttributeNS(null,'font-size');
  if (attr)
      newText.getElem().setAttributeNS(null,"font-size",attr);
  attr = textNode.getAttributeNS(null,'fill');
  if (attr)
      newText.getElem().setAttributeNS(null,"fill",attr);
 attr = textNode.getAttributeNS(null,'cursor');
  if (attr)
      newText.getElem().setAttributeNS(null,"cursor",attr);

  if (DvtStyleUtils.isLocaleR2L()) {
    attr = textNode.getAttributeNS(null,'unicode-bidi');
    if (attr)
      newText.getElem().setAttributeNS(null,"unicode-bidi", attr);
  }
  this.addChild(newText);
}


DvtSvgTextArea.prototype._getTextAlign = function() {
  var val;

  //remove the test if graph is ok with the text alignment changes
  if (this._notGraph) {
    var style = this.getCSSStyle();

    // text alignment
    val = style["text-align"];
    if (val == "left") {
      val = "start";
    }
    else if (val == "right")
      val = "end";
    else if (val == "center")
      val = "middle";

    else if (DvtStyleUtils.isLocaleR2L()) {
      val = "end";
    }
  }
  return val;
}


/**
 * @override
 */
DvtSvgTextArea.prototype.setCursor = function (cursorType) {
  DvtSvgTextArea.superclass.setCursor.call(this, cursorType);

  var elem = this.getElem();
  if (elem != null) {
    for (var i = 0;i < elem.childElementCount;i++) {
      var child = elem.childNodes[i];
      child.setAttributeNS(null, "cursor", cursorType);
    }
  }
}
// Copyright (c) 2011, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*---------------------------------------------------------------------*/
/*   DvtSvgTextFormatted     SVG implementation of textArea "shape"    */
/*---------------------------------------------------------------------*/
/**
 * @constructor
 * Creates an instance of DvtSvgTextFormatted.
 * @extends DvtSvgShape
 * @class DvtSvgTextFormatted
 * @param {String} id  Optional ID for the shape (see {@link  DvtDisplayable#setId}).
 */
var DvtSvgTextFormatted = function(x, y, id) {
  this._Init(x, y, id) ;
};

DvtObj.createSubclass(DvtSvgTextFormatted, DvtSvgText, "DvtSvgTextFormatted") ;


DvtSvgTextFormatted.BOLD = "b";
DvtSvgTextFormatted.BREAK = "br";
DvtSvgTextFormatted.ITALIC = "i";
DvtSvgTextFormatted.LIST_ITEM = "li";
DvtSvgTextFormatted.ORDERED_LIST = "ol";
DvtSvgTextFormatted.PARAGRAPH = "p";
DvtSvgTextFormatted.UNORDERED_LIST = "ul";


/**
 * Initializes this instance of DvtTextFormatted.
 * @param text {string} the text string
 * @param x {number} x the x position
 * @param y {number} y the y position
 * @param id {string} the id for this object
 */
DvtSvgTextFormatted.prototype._Init = function(x, y, id) {
  DvtSvgTextFormatted.superclass._Init.call(this, "", x, y, id) ;
};


/**
 * Sets the text string for this textArea object.
 * @param {array} single line text or multiline text
 */
DvtSvgTextFormatted.prototype.setText = function(text) {
  // parse the formatted text
  var obj = this.getObj();
  var parser = new DvtXmlParser(obj.getContext());

  // wrap around the text with a tag to make the dom parser happy
  var newText = "<root>" + text + "</root>";
  var node = parser.parse(newText);

  if (node) {
    //disable vertical indentation until something is rendered, so
    //that we don't render empty lines at the top
    this._bEnableVertIndent = false;
    this._parseChildren(node, null, 0, false, false);
  }

};

DvtSvgTextFormatted.prototype._parseChildren = function(node, currTspan, nestedListLevel, bFirstListItem, bListItem) {
  var childNodes = node.getAllChildNodes();
  var childCnt = childNodes.length;

  var bPrevP = false;
  for (var i = 0; i < childCnt; i++) {
    var child = childNodes[i];
    if (child) {
      var childName = child.getName();
      
      //if <p>, then need to shift all subsequent siblings
      //by additional amount at end of paragraph
      if (bPrevP && 
          childName !== DvtSvgTextFormatted.PARAGRAPH &&
          childName !== DvtSvgTextFormatted.ORDERED_LIST &&
          childName !== DvtSvgTextFormatted.UNORDERED_LIST) {
        var pTspan = this._handleMarkup(DvtSvgTextFormatted.PARAGRAPH, currTspan);
        currTspan = pTspan;
      }
      bPrevP = false;
      
      // text node
      if (childName === '#text') {
        var strText = child.getNodeValue();
        if (bListItem) {
          strText = "- " + strText;
        }
        this._addTextNode(currTspan, strText);
        //enable vertical indentation now that we've rendered something
        this._bEnableVertIndent = true;
      }
      // element
      else {
        var tspan = this._handleMarkup(childName, currTspan, nestedListLevel, bFirstListItem);
        
        var childNestedListLevel = nestedListLevel;
        var childBFirstListItem = false;
        if (childName === DvtSvgTextFormatted.ORDERED_LIST ||
            childName === DvtSvgTextFormatted.UNORDERED_LIST) {
          if (childNestedListLevel == 0) {
            childBFirstListItem = true;
          }
          childNestedListLevel++;
        }
        
        this._parseChildren(child, tspan, childNestedListLevel, childBFirstListItem, (childName === DvtSvgTextFormatted.LIST_ITEM));
        
        //if <br>, then need to shift all subsequent siblings
        if (childName === DvtSvgTextFormatted.BREAK) {
          currTspan = tspan;
        }
        //if <p>, then need to shift all subsequent siblings
        //by additional amount at end of paragraph
        if (childName === DvtSvgTextFormatted.PARAGRAPH ||
            ((childName === DvtSvgTextFormatted.ORDERED_LIST ||
              childName === DvtSvgTextFormatted.UNORDERED_LIST) &&
             nestedListLevel < 1)) {
          bPrevP = true;
        }
        //if processed the first <li>, then toggle the flag to false
        if (childName === DvtSvgTextFormatted.LIST_ITEM) {
          bFirstListItem = false;
        }
      }
    } //end if (child)
  } //end for (var i = 0; i < childCnt; i++)
};


// handle html markup
DvtSvgTextFormatted.prototype._handleMarkup = function(nodeName, currTspan, nestedListLevel, bFirstListItem) {
  // create tspan
  var tspan  = this._createTSpan(null, currTspan);

  // element
  if (nodeName === DvtSvgTextFormatted.BOLD) {
    tspan.setAttributeNS(null, 'font-weight', 'bold');
  }
  else if (nodeName === DvtSvgTextFormatted.ITALIC) {
    tspan.setAttributeNS(null, 'font-style', 'italic');
  }
  else if (nodeName === DvtSvgTextFormatted.BREAK) {
    tspan.setAttributeNS(null, 'x', '0');
    tspan.setAttributeNS(null, 'dy', '1em');
  }
  else if (nodeName === DvtSvgTextFormatted.PARAGRAPH) {
    if (this._bEnableVertIndent) {
      tspan.setAttributeNS(null, 'x', '0');
      tspan.setAttributeNS(null, 'dy', '2em');
    }
    //enable vertical indentation now that we've rendered something
    this._bEnableVertIndent = true;
  }
  else if (nodeName === DvtSvgTextFormatted.ORDERED_LIST ||
           nodeName === DvtSvgTextFormatted.UNORDERED_LIST) {
  }
  else if (nodeName === DvtSvgTextFormatted.LIST_ITEM) {
    tspan.setAttributeNS(null, 'x', (nestedListLevel) +'em');
    if (this._bEnableVertIndent) {
      if (bFirstListItem) {
        tspan.setAttributeNS(null, 'dy', '2em');
      }
      else {
        tspan.setAttributeNS(null, 'dy', '1em');
      }
    }
    //enable vertical indentation now that we've rendered something
    this._bEnableVertIndent = true;
  }
//     tspan.setAttributeNS(null, 'text-decoration', 'underline');
  
  return tspan;
};



