// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 

/*---------------------------------------------------------------------*/
/*   DvtCanvasImplFactory                                              */
/*---------------------------------------------------------------------*/
/**
  * A factory class for Canvas to create object implementations.
  * @extends  DvtHtmlImplFactory
  * @class DvtCanvasImplFactory  A factory class to create Canvas implementation objects.
  * @constructor  Creates Canvas inplementation objects.
  */
var DvtCanvasImplFactory = function(context) {
  this.Init(context) ;
};

DvtObj.createSubclass(DvtCanvasImplFactory, DvtHtmlImplFactory, "DvtCanvasImplFactory");

/*---------------------------------------------------------------------*/
/*     Base implementations                                            */
/*---------------------------------------------------------------------*/

/**
 *  Returns a new DvtStage implementation object.
 */
DvtCanvasImplFactory.prototype.newStage = function(root, id) {
  return  new DvtCanvasStage(this.GetContext(), root, id) ;
};


/**
 * Returns a new DvtContainer implementation.
 * @param {String} id  Optional ID for the object (see also {@link DvtDisplayable#setId}) 
 * @override
 * @type DvtContainer
 */
DvtCanvasImplFactory.prototype.newContainer = function (id) {
  return new DvtCanvasContainer(this.GetContext(), id, 'g');
};


/**
  *  Returns a new DvtCanvasArc implementation object for an arc of a circle or ellipse.
  *  @param {number} cx  The center x position.
  *  @param {number} cy  The center y position.
  *  @param {number} rx  The horizontal radius of the ellipse/circle.
  *  @param {number} ry  The vertical radius of the ellipse/circle.
  *  @param {number} sa  The starting angle in degrees (following the normal anti-clockwise is positive convention).
  *  @param {number} ae  The angle extent in degrees (following the normal anti-clockwise is positive convention).
  *  @param {String} clos  An optional closure type for the arc. Closures are "OPEN" (the default), "SEGMENT", and "CHORD".
  *  @param {String} id  Optional ID for the shape (see {@link  DvtDisplayable#setId}).
  *  @returns {DvtCanvasArc}  A new {@link DvtArc} object.
 *   @override
 */
DvtCanvasImplFactory.prototype.newArc = function (cx, cy, rx, ry, sa, ae, clos, id) {
  return new DvtCanvasArc(this.GetContext(), cx, cy, rx, ry, sa, ae, clos, id);
};


/**
  *  Creates a new DvtCanvasCircle implementation for a circle.
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
  *  @returns {DvtCanvasCircle} A new DvtCanvasCircle object.
  *  @override
 */
DvtCanvasImplFactory.prototype.newCircle = function (cx, cy, r, id) {
  return  new DvtCanvasCircle(this.GetContext(), cx, cy, r, id);
};

/**
 *  Returns a new DvtCanvasImage implementation object for a displayable image.
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
 *  @returns  {@link DvtImage}  A new DvtCanvasImage object.
 *  @override
 */
DvtCanvasImplFactory.prototype.newImage = function (imgSrc, x, y, w, h, id) {
  return new DvtCanvasImage(this.GetContext(), imgSrc, x, y, w, h, id);
};

/**
  *  Creates a new DvtCanvasLine implementation object which for a displayable line
  *  segment drawn from (x1, y1) to (x2, y2).
  *  @param {number} x1  An x end position of the line.
  *  @param {number} y1  The associated y end point (for x1).
  *  @param {number} x2  The other x end point.
  *  @param {number} y2  The associated y end point (for x2).
  *  @param {String} id  Optional ID for the shape (see {@link  DvtDisplayable#setId}).
  *  <p>Example:<br><br><code>
  *  var line = factory.newLine(10, 10, 100, 150);</code><br>
  *  @returns  {DvtCanvasLine}  A new DvtCanvasLine object.
  *  @override
  */
DvtCanvasImplFactory.prototype.newLine = function (x1, y1, x2, y2, id) {
  return  new DvtCanvasLine(this.GetContext(), x1, y1, x2, y2, id);
};


/**
 *  Returns a new DvtCanvasMarker implementation object for a graph or legend marker.
 *  @param {number} type The type of the marker (see {@link DvtMarker}).
 *  @param {String} id  Optional ID for the shape (see {@link  DvtDisplayable#setId}).
 *  @param {String} etype  Optional element type for the shape (see {@link  DvtMarker}).
 *  <p>
 *  Example:<br><br><code>
 *  var rect = factory.newMarker(type, 'myRect') ;<br>
 *  </code>
 *  @returns {DvtCanvasMarker}  A new DvtCanvasMarker object.
 *  @override
 */
DvtCanvasImplFactory.prototype.newMarker = function (type, id, etype) {
    return  new DvtCanvasMarker(this.GetContext(), type, id, etype);
};


/**
  *  Returns a new DvtCanvasOval implementation object which for a displayable ellipse.
  *  @param {number} cx  The center x position.
  *  @param {number} cy  The center y position.
  *  @param {number} rx  The horizontal radius of the ellipse.
  *  @param {number} ry  The vertical radius of the ellipse.
  *  @param {String} id  Optional ID for the shape (see {@link  DvtDisplayable#setId}).
  *  @returns  {DvtCanvasOval}  A new DvtCanvasOval object.
 * @override
 */
DvtCanvasImplFactory.prototype.newOval = function (cx, cy, rx, ry, id) {
  return  new DvtCanvasOval(this.GetContext(), cx, cy, rx, ry, id);
};

/**
  * Returns a new DvtCanvasPath implementation object for a displayable shape
  * defined by SVG path commands.
  * @param {Object} cmds  Optional string of SVG path commands (see comment for
  *                       {@link DvtPath#setCmds}), or an array containing
  *                       consecutive command and coordinate entries (see comment
  *                       for {@link DvtPath#setCommands}).
  * @param {String} id  Optional ID for the shape (see {@link  DvtDisplayable#setId}).
  * @returns {DvtCanvasPath}  A new DvtCanvasPath object.
  * @override
 */
DvtCanvasImplFactory.prototype.newPath = function (cmds, id) {
  return  new DvtCanvasPath(this.GetContext(), cmds, id);
};

/**
 * Returns a new DvtCanvasPolygon implementation object for a displayable shape composed of 
 * connected multi-line segments.
 * @param {array} ar  An array of consecutive x,y coordinate pairs.
 * @param {String} id  Optional ID for the shape (see {@link  DvtDisplayable#setId}).
 * @returns {DvtCanvasPolygon}  A new DvtCanvasPolygon object.
 * @override
 */
DvtCanvasImplFactory.prototype.newPolygon = function (arPoints, id) {
  return  new DvtCanvasPolygon(this.GetContext(), arPoints, id);
};


/**
 *  Returns a new DvtCanvasPolyline object for a line composed of multiple line segments.
 *  @param {array} ar  An array of consecutive x,y coordinate pairs.
 *  @param {String} id  Optional ID for the shape (see {@link  DvtDisplayable#setId}).
 *  @return {DvtCanvasPolyline}  A new  DvtCanvasPolyline object.
 *  @override
 */
DvtCanvasImplFactory.prototype.newPolyline = function (ar, id) {
  return  new DvtCanvasPolyline(this.GetContext(), ar, id);
};

/**
 *  Returns a new DvtCanvasRect implementation object for a displayable rectangle.
 *  @param {number} x  The x position of the top left corner of the rectangle.
 *  @param {number} y  The y position of the top left corner of the rectangle.
 *  @param {number} w  The width of the rectangle.
 *  @param {number} h  The height of the rectangle.
 *  @param {String} id  Optional ID for the shape (see {@link  DvtDisplayable#setId}).
 *  <p>
 *  Example:<br><br><code>
 *  var rect = factory.newRect(10, 10, 100, 150, 'myRect') ;<br>
 *  </code>
 *  @returns {DvtCanvasRect} A new DvtCanvasRect object.
 *  @override
 */
DvtCanvasImplFactory.prototype.newRect = function (x, y, w, h, id) {
  return  new DvtCanvasRect(this.GetContext(), x, y, w, h, id);
};

/**
 * Returns a new DvtCanvasText implementation object for displayable text.
 * @param {String} id  Optional ID for the shape (see {@link  DvtDisplayable#setId}).
 * @returns {DvtCanvasText}  A new DvtCanvasText object.
 * @override
 */
DvtCanvasImplFactory.prototype.newText = function (textStr, x, y, id) {
  return  new DvtCanvasText(this.GetContext(), textStr, x, y, id);
};

/**
  *  Object initializer.
  *  @protected
  */
DvtCanvasImplFactory.prototype.Init = function(context)
{
   DvtCanvasImplFactory.superclass.Init.call(this, context) ;
};

/**
 * Returns a new DvtCanvasTextArea implementation object for displayable text.
 * @param x {number} x the x position
 * @param y {number} y the y position
 * @param {String} id  Optional ID for the shape (see {@link  DvtDisplayable#setId}).
 * @returns {DvtCanvasTextArea}   A new DvtCanvasTextArea object.
 * @override
 */
DvtCanvasImplFactory.prototype.newTextArea = function (x, y, id) {
  return new DvtCanvasTextArea(this.GetContext(), x, y, id);
};


/**
 * Returns a new DvtCanvasTextFormatted implementation object for displayable text.
 * @param {String} id  Optional ID for the shape (see {@link  DvtDisplayable#setId}).
 * @returns {DvtCanvasTextFormatted}  A new DvtCanvasTextFormatted object.
 * @type DvtTextFormatted
 * @override
 */
DvtCanvasImplFactory.prototype.newTextFormatted = function (x, y, id) {
  return  new DvtCanvasTextFormatted(x, y, id);
};

/**
 * Obtain imageLoader singleton
 * @override
 */
DvtCanvasImplFactory.prototype.getImageLoader = function () {
  return DvtCanvasImageLoader;
};

/**
 * @override
 */
DvtCanvasImplFactory.prototype.getDocumentUtils = function () {
  return DvtCanvasDocumentUtils;
};

// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*---------------------------------------------------------------------*/
/*   DvtCanvasJsExt         Canvas implementation of DvtJsExt          */
/*---------------------------------------------------------------------*/


//  Placeholder - revist if/when callbacks are used.


/**
  *  Provides a gateway for access to ADF functionality for Canvas. 
  *  @class DvtCanvasJsExt
  *  @extends DvtJsExt
  *  @constructor
  */
var  DvtCanvasJsExt = function()
{
};

DvtObj.createSubclass(DvtCanvasJsExt, DvtJsExt, "DvtCanvasJsExt");



/*---------------------------------------------------------------------*/
/*                                 ADF                                 */
/*---------------------------------------------------------------------*/
/**  
  *  Sets a PPR property value.
  *  @param {String}  id  An id to be substituted in the function call.
  *  @param {String)  prop a property such as {@link DvtJsExt#PPR_ATTRIB_HSS}
  *  @param {String}  value  the property value.
  */
DvtCanvasJsExt.prototype.sendPPRProperty = function(id, prop, value)
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
DvtCanvasJsExt.prototype.sendPPR  = function(id)
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
DvtCanvasJsExt.prototype.sendPPRNonBlocking = function(id)
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
DvtCanvasJsExt.prototype.callJs = function(js)
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
DvtCanvasJsExt.prototype.callJsWithParam = function(js, param)
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
DvtCanvasJsExt.prototype.getLogLevel = function()
{
    return  adf_dvt_fpGetLogLevel() ;
};


/**
  *   Forwards a message to the ADF logger.
  *   @param  {String} msg the message to be logged.
  *   @param  {number} level the log level of the messsage.  If omitted
  *                          a value of {DvtJsExt#LOG_INFO} is assumed.
  */
DvtCanvasJsExt.prototype.log = function(msg, level)
{
    adf_dvt_fpLogger(msg, (level === undefined? DvtJsExt.LOG_INFO : level)) ;
};


/**
  *   Forwards a message string to ADF DVT.
  *   @param  {String} msg the message to be sent.
  */
DvtCanvasJsExt.prototype.msg = function(msg)
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

DvtCanvasJsExt.prototype.perf = function(s, type)
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
DvtCanvasJsExt.prototype.requestRefresh = function()
{
    adf_dvt_fpRefresh() ;
};



DvtCanvasJsExt.prototype.dispatchEvent = function(callback, callbackObj, component, event) {
  DvtEventDispatcher.dispatchEvent(callback, callbackObj, component, event);
};









// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*---------------------------------------------------------------------*/
/*  DvtCanvasDisplayable     Canvas implementation of DvtDisplayable   */
/*---------------------------------------------------------------------*/
/**
  *  Canvas implementation of base displayable object DvtDisplayable.
  *  @extends DvtObj
  *  @class DvtCanvasDisplayable is the Canvas implementation base class for all displayable
  *  objects (derived from {@link DvtCanvasDisplayable}).
  *  Must be superclassed  - do not use directly - all derivatives of DvtCanvasDisplayable
  *  should be created via a specific platform factory implementation.
  *  @constructor  
  *  @param {String} id    The object ID (if undefined or null, '?' is used.
  */
var   DvtCanvasDisplayable = function(context, id)
{
  this._Init(context, id) ; 
};


DvtObj.createSubclass(DvtCanvasDisplayable, DvtObj, "DvtCanvasDisplayable") ;

/**
 * Array of SVG attributes that should be transferred to the outer element.
 * @private
 */

//DvtSvgDisplayable._ATTRS_TRANSFERABLE_TO_OUTER = [/*'filter',*/ 'clip-path']


/*---------------------------------------------------------------------*/
/*   applyDrawAttrs()       Apply stroke, fill, shadow, etc, to this   */
/*                          displayable's canvas context.              */
/*---------------------------------------------------------------------*/
/**
  *   Applies stroke, fill, shadow, etc, to this displayable's canvas context.
  */
DvtCanvasDisplayable.prototype.applyDrawAttrs = function()
{
   return  DvtCanvasDrawUtils.applyDrawAttrs(this._ctx, this) ;
};


/*---------------------------------------------------------------------*/
/*   _Init()                                                           */
/*---------------------------------------------------------------------*/
/**
  *  Object initializer.
  *  @protected
  */
DvtCanvasDisplayable.prototype._Init = function(context, id)
{
  if (id) {
    this._id = id ;
  }
  this._Parent        = null ;
  this._elem          =  context._root ;
  this._ctx           = this._elem.getContext("2d") ;   // the canvas context
  this._bVisible      = true;
  this._filter        = null;
  this._pixelHinting  = false ;
  this._cursor        = null;
  this._bMouseEnabled = true;
  this._alpha         = 1;
  this._matrix        = null;
} ;


/*---------------------------------------------------------------------*/
/*    getCtx()                                                         */
/*---------------------------------------------------------------------*/
/**
  *  Returns the Canvas 2D drawing context on which this displayable object is rendered.
  *  See also {@link DvtCanvasDisplayable#getElem}.
  *  @returns {context}  the Canvas 2D drawing context on which this displayable object is rendered.
  */
DvtCanvasDisplayable.prototype.getCtx = function()
{
   return  this._ctx ;
} ;


/*---------------------------------------------------------------------*/
/*    getElem()         Return the Canvas element for this object      */
/*---------------------------------------------------------------------*/
/**
  *  Returns the Canvas DOM element on which this displayable object is rendered.
  *  See also {@link DvtCanvasDisplayable#getCtx}.
  *  @returns {Canvas}  the Canvas DOM element on which this displayable object is rendered.
  */
DvtCanvasDisplayable.prototype.getElem = function()
{
   return  this._elem ;
} ;

/**
 * Returns the outermost Canvas DOM element of this displayable.  This should be used when
 * removing this displayable from the DOM.
 * @return {DvtCanvasDisplayable}
 */
/*
DvtSvgDisplayable.prototype.getOuterElem = function() {
  return this._outerElem ? this._outerElem : this.getElem();
}
*/

/*---------------------------------------------------------------------*/
/*   get/setId()                                                       */
/*---------------------------------------------------------------------*/
/**
  *   @returns {String}  the id of this shape.
  */
DvtCanvasDisplayable.prototype.getId = function()
{
   return this._id ;
} ;
/**
  *   Sets the id of this shape.
  *   @param {String} id  The id for the shape.
  */
DvtCanvasDisplayable.prototype.setId = function(id)
{
   if (this._id !== id) {
     if (id && id.length === 0) {
       id = null ;
     }
     this._id = id ;
   }

} ;


/*---------------------------------------------------------------------*/
/*   getObj()/setObj     Get/Set the controlling (js) object for this  */
/*                       implementation object.                        */
/*---------------------------------------------------------------------*/
/**
  *  @returns {Object}  the controlling (js) object.
  */
DvtCanvasDisplayable.prototype.getObj = function()
{
   return this._obj ;
} ;

DvtCanvasDisplayable.prototype.setObj = function(obj)
{
   this._obj = obj ;
} ;

/*---------------------------------------------------------------------*/
/*   get/setParent()                                                   */
/*---------------------------------------------------------------------*/
/**
  *  @returns {Object} the (js) parent of this shape.
  */
DvtCanvasDisplayable.prototype.getParent = function()
{
   return this._obj.getParent() ;
} ;

/**
  *  Sets the (js) parent of this shape.
  *  @param {Object} parent
  */
DvtCanvasDisplayable.prototype.setParent = function(parent)
{
   this._obj.setParent(parent) ;
} ;


/*---------------------------------------------------------------------*/
/*   get/setPixelHinting()                                             */
/*---------------------------------------------------------------------*/
/**
 *  @returns {boolean} the current pixel hinting state.
 */

DvtCanvasDisplayable.prototype.getPixelHinting = function () {
  return this._pixelHinting;
};


/**
 * Enables/disables pixel hinting.
 * @param {boolean}  bHint  true if pixel hinting should be interpreted/applied by the
 * implementation platform.
 */
DvtCanvasDisplayable.prototype.setPixelHinting = function (bHint) {
  this._pixelHinting = bHint ;
/*
  if (bHint) {
    this._elem.setAttributeNS(null, 'shape-rendering', 'crispEdges') ;
  }
  else {
    this._elem.removeAttributeNS(null, 'shape-rendering') ;
  }
*/
};


/*---------------------------------------------------------------------*/
/*   get/setVisible()                                                  */
/*---------------------------------------------------------------------*/
/**
  *  Gets the visibility of this object.
  *  @returns {boolean}  True if the object is visible, else false.
  */
DvtCanvasDisplayable.prototype.getVisible = function()
{
   return this._bVisible ;
};

/**
  *  Enables/disables the visibility of this object.
  *  @param {boolean}  bVis  True if the object is to be visible, else false if
  *  it is to be hidden.
  */
DvtCanvasDisplayable.prototype.setVisible = function(bVis)
{
   if (this._bVisible !== bVis) {
     this._bVisible = bVis ;
   }

};


/**
 * Convert a point from local coords to stage coords.
 * @param {DvtPoint}  point  point in local coords
 * @type DvtPoint
 */
DvtCanvasDisplayable.prototype.localToStage = function(point)
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

   return  point ;
};


/**
 * Convert a point from stage coords to local coords.
 * @param {DvtPoint}  point  point in stage coords
 * @type DvtPoint
 */
DvtCanvasDisplayable.prototype.stageToLocal = function(point)
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






/*---------------------------------------------------------------------*/
/*   setClipPath()                                                     */
/*---------------------------------------------------------------------*/
/**
 *  Sets a clipping region for this object.
 *  @param {DvtClipPath}  cp  the DvtClipPath object specifying the clipping region.
 */

DvtCanvasDisplayable.prototype.setClipPath = function(cp)
{
   this._clipRegion = cp ;

/*
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
*/
};


/*---------------------------------------------------------------------*/
/*   Render()                                                          */
/*---------------------------------------------------------------------*/

DvtCanvasDisplayable.prototype.Render = function()
{
  this.BeginRender();
  this.RenderSelf();
  this.RenderChildren();
  this.EndRender();
};


DvtCanvasDisplayable.prototype.BeginRender = function()
{
  var ctx  = this._ctx ;

  if (this instanceof DvtCanvasStage) {
    var canvas = this.getElem() ;
    canvas.width = canvas.width ;    // clear the canvas
  }

  ctx.save();
  
  this.PrepareContext();

};

DvtCanvasDisplayable.prototype.PrepareContext = function()
{
  var ctx  = this._ctx ;

  ctx.globalAlpha = this.getAlpha();

   if (this._clipRegion) {
     DvtCanvasDrawUtils.applyClipRegion(ctx, this._clipRegion) ;
   }

  //  Canvas          DvtMatrix       canvas transform(a,b,c,d,e,f)
  // [a  c  e]      [a  b  e/tx]
  // [b  d  f]      [c  d  f/ty]
  // [0  0  1]      [0  0   1  ]

  if (this._matrix) {
    ctx.transform(this._matrix.getA(), this._matrix.getC(),  this._matrix.getB(),
                  this._matrix.getD(), this._matrix.getTx(), this._matrix.getTy());
  }
};

DvtCanvasDisplayable.prototype.EndRender = function()
{
  this._ctx.restore();
};


DvtCanvasDisplayable.prototype.RenderSelf = function()
{
};

DvtCanvasDisplayable.prototype.RenderChildren = function()
{
};


/**
 * Returns true if any of the specified attribute names are present on the element.
 * @param {object} elem  The Canvas DOM element.
 * @param {array} attrNames The array of attribute names to look for.
 * @protected
  */
/*
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
*/

/**
 * Transfer relevant attributes from the original SVG DOM element to the new SVG DOM element.
 * @param {object} fromElem  The SVG DOM element.
 * @param {object} toElem  The new SVG DOM element.
 * @param {array} attrNames The array of attribute names to transfer.
 * @protected
  */
DvtCanvasDisplayable.TransferAttributes = function(fromElem, toElem, attrNames)
{
/*
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
      }
    }
  }
*/
};

/**
 * Creates an outer group element to workaround issues with filters and clip paths.
 * @private
 */
/*
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
    this._outerElem.appendChild(this.getElem());
  }
  
  // Transfer attributes from the old outermost SVG element to the new outer element
  DvtSvgDisplayable.TransferAttributes(this.getElem(), this._outerElem, DvtSvgDisplayable._ATTRS_TRANSFERABLE_TO_OUTER)
}
*/


/*---------------------------------------------------------------------*/
/*   Event Handling Support                                            */
/*---------------------------------------------------------------------*/

/**
 * Adds an event listener.
 * @param {String} type the event type
 * @param {String} useCapture whether the listener operates in the capture phase
 */

DvtCanvasDisplayable.prototype.addListener = function(type, useCapture) {

/*
  var listener = this._getListener(useCapture);
  // on keyboard events, add the listener to the context, since SVG doesn't support
  // keystrokes. the context, in turn, will add the listener to the wrapping div
  if(type == "keyup" || type == "keydown")
  {
    if(this.getObj())
    {
      var context = this.getObj().getContext();
      context.addListener(type, useCapture);
    }
  }
  else 
  {
    this.getElem().addEventListener(type, listener, useCapture);
  }
*/

};


/**
 * Removes an event listener.
 * @param {string} type the event type
 * @param {function} listener the function to call
 * @param {String} useCapture whether the listener operates in the capture phase
 */

DvtCanvasDisplayable.prototype.removeListener = function(type, useCapture) {
/*
  var listener = this._getListener(useCapture);
  this.getElem().removeEventListener(type, listener, useCapture);
*/
};


// TODO JSdoc
/*
DvtSvgDisplayable.prototype._getListener = function(useCapture) {
  if(useCapture)
    return this._captureListener;
  else
    return this._bubbleListener;
}
*/
/**
 * The event listener that is called by the implementation object's bubble phase listeners.
 * This function will wrap the event and delegate to the real event listeners.  
 * @param {object} event the DOM event object
 * @this {object} the platform object actively processing the event object with an event listener
 * @private
 */
/*
DvtSvgDisplayable.prototype._bubbleListener = function(event) {
  var svgObj = this._obj;
  if(svgObj != null) {
    var dvtEvent = DvtSvgEventFactory.newEvent(event, svgObj.getObj().getContext());
    svgObj.getObj().FireListener(dvtEvent, false);
  }
}
*/
/**
 * The event listener that is called by the implementation object's capture phase listeners.
 * This function will wrap the event and delegate to the real event listeners.  
 * @param {object} event the DOM event object
 * @this {object} the platform object actively processing the event object with an event listener
 * @private
 */
/*
DvtSvgDisplayable.prototype._captureListener = function(event) {
  var svgObj = this._obj;
  if(svgObj != null) {
    var dvtEvent = DvtSvgEventFactory.newEvent(event, svgObj.getObj().getContext());
    svgObj.getObj().FireListener(dvtEvent, true);
  }
}
*/

/*-------------------------------------------------------------------------*/
/*   CSS Style Support                                                     */
/*-------------------------------------------------------------------------*/

/**
 * @returns {DvtCssStyle} the DvtCSSStyle of this object.
 */ 
DvtCanvasDisplayable.prototype.getCSSStyle = function()
{
  return this._cssStyle;
}

/**
 * Sets the DvtCSSStyle of this object.
 * @param {DvtCssStyle} style The DvtCSSStyle of this object.
 */
DvtCanvasDisplayable.prototype.setCSSStyle = function(style)
{
  this._cssStyle = style;
}


/**
 * Sets the cursor on this object.
 * @param {String} cursor type
 */

DvtCanvasDisplayable.prototype.setCursor = function(cursorType)
{
  this._cursor = cursorType;
/*
  if (cursorType)
  {
    this.getElem().setAttributeNS(null, "cursor", cursorType);
  }
  else
  {
    this.getElem().removeAttributeNS(null, "cursor");
  }
*/
};


/**
 * Gets the cursor used on this object.
 * @type {String}
 */

DvtCanvasDisplayable.prototype.getCursor = function()
{
  return this._cursor;
};


/**
 * Sets whether mouse events are enabled on this object.
 * @param {boolean} whether mouse events are enabled
 */

DvtCanvasDisplayable.prototype.setMouseEnabled = function(bEnabled)
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
//  this.getElem().setAttributeNS(null, "pointer-events", val);
};


/**
 * Gets whether mouse events are enabled on this object.
 * @type {boolean}
 */

DvtCanvasDisplayable.prototype.isMouseEnabled = function()
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
DvtCanvasDisplayable.prototype.getAlpha = function()
{
   return this._alpha;
};

/**
  *  Sets the alpha.
  *  @param {number} alpha  A value between 0 (invisible) and 1 (opaque).
  *  @returns nothing
  */
DvtCanvasDisplayable.prototype.setAlpha = function(alpha)
{
   //when animating alpha, small values are turned into strings like
   //"3.145e-8", which SVG incorrectly clamps to 1, so just cut off
   //small values here and make them 0
   if (alpha < 0.00001)
     alpha = 0;
   
   if (alpha !== this._alpha)
   {
     this._alpha = alpha;
//     this.getElem().setAttributeNS(null,'opacity', this._alpha) ;
   }
};



/**
  *   Set the matrix object to use to transform this container.
  *   @param {DvtMatrix} mat  The matrix object to apply.
  */

DvtCanvasDisplayable.prototype.setMatrix = function(mat)
{
  if (mat !== this._matrix)
  {
    this._matrix = mat ;

/*
    // Create an outer elem if needed
    if(!this._outerElem && DvtSvgDisplayable.HasAttributes(this.getElem(), DvtSvgDisplayable._ATTRS_TRANSFERABLE_TO_OUTER)) 
      this._createOuterGroupElem();

    //apply the new matrix if it's non-null
    if (mat)
    {
      var sMat = 'matrix(' + mat.getA() + ',' + mat.getC() + ',' + mat.getB() + ',' + mat.getD() + ',' + mat.getTx() + ',' + mat.getTy() + ')';
      
      //set the transform attribute on the outer SVG element of this shape
      this.getElem().setAttributeNS(null,'transform', sMat) ;
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
      }
      //NOTE: this is commented out for now because it causes strange rendering
      //artifacts when scaling to a small value
      var vectorEffectAttr;// = this.getElem().getAttributeNS(null,'vector-effect');
      if (vectorEffectAttr)
      {
        this.getElem().removeAttributeNS(null, 'vector-effect');
      }
    }
*/

  }
};


DvtCanvasDisplayable.prototype.applyDrawEffects = function(effects)
{
  var effect ;
  var len = effects.length ;
  for (var i = 0; i < len; i++) {
     effect = effects[i] ;
     if (effect instanceof DvtShadow) {
       this._shadow = effect ;
     }
  }

/*
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
  if (effects)
  {
    //Bug 12394679: Repaint bug in Firefox requires us to force a repaint after removing filter
    //At worst we will create n empty filters where n=# markers
    this._filter = DvtSvgFilterUtils.createFilter(effects, this);
    this.getObj().getContext().appendDefs(this._filter);
    var filterId = this._filter.getAttributeNS(null, 'id');
    this.getOuterElem().setAttributeNS(null, 'filter', 'url(#' + filterId + ')');
  }
*/  
};


/**
 * Convert a point from stage coords to local coords.
 * @param {DvtPoint}  point  point in stage coords
 * @type DvtPoint
 */
/*
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
*/

/**
 * Convert a point from local coords to stage coords.
 * @param {DvtPoint}  point  point in local coords
 * @type DvtPoint
 */
/*
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
*/




/*
 * Creates a copy of the svg content, wrapped by a new container
 */
/*
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
*/

// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*---------------------------------------------------------------------*/
/*  DvtCanvasContainer        Canvas implementation of DvtContainer    */
/*---------------------------------------------------------------------*/
/**  Canvas implementation of DvtContainer.
  *  @extends DvtCanvasDisplayable
  *  @class DvtCanvasContainer
  *  @constructor  
  *  @param {String} id   An optional id for this object.
  *  @param {String} type  The Canvas DOM element type.
  */ 
var   DvtCanvasContainer = function(context, id)
{
  this._Init(context, id) ; 
};

DvtObj.createSubclass(DvtCanvasContainer, DvtCanvasDisplayable, "DvtCanvasContainer") ;


/**
  * @protected
  * Array of Canvas attributes that should be transferred from the shape
  * tag to the group when this shape becomes a group (when children
  * are added to it).
  */
/*
DvtCanvasContainer.AttributesTransferableToGroup = ['transform', 'vector-effect', 'opacity', 'style', 'visibility', 'pointer-events', 'clip-path'];
*/


/*---------------------------------------------------------------------*/
/*   addChild()           Add a child to this container                */
/*---------------------------------------------------------------------*/
/**
  *   Adds the specifed object as a child of this container.  The object is
  *   added to the end of the child list.
  *   @param {DvtCanvasDisplayable} obj The object to be added.
  */
DvtCanvasContainer.prototype.addChild = function(obj)
{
  if (! this._children) {
    this._children = [];
  }
  this._children.push(obj);
} ;

/**
  *   Adds the specified object as a child of this container at the specified index. Returns
  *   immediately if the index position doesn't already exist in the child list.  If a currently
  *   occupied index is specified, the current child at that position and all subsequent children
  *   are moved one position higher in the list.
  *   @param {DvtCanvasDisplayable} obj The object to be added.
  *   @param {number} index The index at which to add this object
  */
DvtCanvasContainer.prototype.addChildAt = function(obj, index)
{
  if (! this._children)  {
    this._children = [];
  }
  if (index >= 0 && index <= this._children.length)  {
    this._children.splice(index, 0, obj);
  }

};


/**
 * Returns an array of Canvas attributes that should be transferred from the shape
 * tag to the group when this shape becomes a group (when children are added to it).
 * @return {array}
 */
/*
DvtCanvasContainer.prototype.GetAttributesTransferableToGroup = function() {
  return DvtCanvasContainer.AttributesTransferableToGroup;
}
*/

/*---------------------------------------------------------------------*/
/*   addChildAfter()                                                   */
/*---------------------------------------------------------------------*/
/**
  *   Adds the specifed object as a child of this container after a specific
  *   object in the child list.
  *   @param {Object} obj  The object to be added.
  *   @param {Object} objAfter  The object after which the new child is to be added.
  */
DvtCanvasContainer.prototype.addChildAfter = function(obj, objAfter)
{
     // To Do  JRM
} ;


/*---------------------------------------------------------------------*/
/*  addChildBefore()                                                   */
/*---------------------------------------------------------------------*/
/**
  *   Adds the specifed object as a child of this container before a
  *   specific bject in the child list.
  *   @param {Object} obj  The object to be added.
  *   @param {Object} objBefore  The object before which the new child is
  *   to be added.
  */
DvtCanvasContainer.prototype.addChildBefore = function(obj, objBefore)
{
     // To Do JRM
} ;


DvtCanvasContainer.prototype._findChild = function(obj)
{
   var  idx = -1 ;

   if (this._children) {
      var len = this._children.length ;
      for (var i = 0; i < len; i++) {            // find the obj
         if (this._children[i] === obj) {
           idx = i ;
           break ;
         }
      }
   }

   return idx ;
} ;


/**
  *  Returns the dimensions of this container.  That is, the union of this and all descendents
  *                          (optionally transformed - see arg <i>targCoordSpace}).
  *  @param {DvtDisplayable} targCoordSpace an optional displayable object.  If specified, and the
  *                          the subject of this method has a matrix and its parent is
  *                          the same as that specified by <i>targCoordSpace</i>, the
  *                          matrix transform is applied to the returned dimensions.
  *  @returns {DvtRectangle} the dimensions of this container (the union of this and all descendents).
  */
DvtCanvasContainer.prototype.getDimensions = function(targCoordSpace)
{
  return DvtObjDimUtils.getDimensions(this, targCoordSpace) ;
};


//BUG FIX 13842194:
/**
  *  Returns the dimensions of this container, including stroke width.  That is, the union of this and all descendents
  *                          (optionally transformed - see arg <i>targCoordSpace}).
  *  @param {DvtDisplayable} targCoordSpace an optional displayable object.  If specified, and the
  *                          the subject of this method has a matrix and its parent is
  *                          the same as that specified by <i>targCoordSpace</i>, the
  *                          matrix transform is applied to the returned dimensions.
  *  @returns {DvtRectangle} the dimensions of this container (the union of this and all descendents).
  */
DvtCanvasContainer.prototype.getDimensionsWithStroke = function(targCoordSpace)
{
  return DvtObjDimUtils.getDimensionsWithStroke(this, targCoordSpace) ;
};


/**
  * @override
  */
DvtCanvasContainer.prototype.getElem = function()
{
  return this._elem ;
} ;

/*---------------------------------------------------------------------*/
/*   _Init()                                                           */
/*---------------------------------------------------------------------*/
/**
  *  Object initializer.
  *  @protected
  */
DvtCanvasContainer.prototype._Init = function(context, id)
{
  // Check if this is a standard non-shape container, or a shape "container".

  // Note for the canvas implementation, elementary objects may not be nested,
  // e.g. a rect containing another rect.  The container itself provides/maintains
  // the necessary list of children, but the children are all rendered on the same
  // canvas. Thus some operations  on the container might require the operations
  // to be propagated to the children.

  this._bShapeContainer = (this instanceof DvtCanvasShape) ; // if shape "container"

  DvtCanvasContainer.superclass._Init.call(this, context, id) ;

} ;


/**
  *   Returns true if this is a shape container - that is, it is a derivative of DvtShape.
  *   @returns {boolean} true if this container is a DvtShape.
  */
DvtCanvasContainer.prototype.isShapeContainer = function()
{
  return this._bShapeContainer ;
};


/*---------------------------------------------------------------------*/
/*    removeChild()                                                    */
/*---------------------------------------------------------------------*/
/**
  *   Removes the specified child object from this container.
  *   @param {DvtCanvasDisplayable} obj The object to be removed.
  */
DvtCanvasContainer.prototype.removeChild = function(obj)
{
  if (this._children)  {
    var index = this._findChild(obj);
    if (index >= 0 && index < this._children.length)  {
      this._children.splice(index, 1);
    }
  }
} ;


/**
  *   Renders this displayable.
  */
DvtCanvasContainer.prototype.RenderSelf = function()
{
  DvtCanvasContainer.superclass.RenderSelf.call(this) ;

  if (! this._bShapeContainer) {       // basic container might have
    this.applyDrawAttrs() ;            // a shadow (e.g. 2D pie)
  }
};


/*---------------------------------------------------------------------*/
/*   RenderChildren()                                                  */
/*---------------------------------------------------------------------*/
/**
  *   Render all children of this container.
  */
DvtCanvasContainer.prototype.RenderChildren = function()
{
  var child ;
  var len ;
  if (this._children)  {
    len = this._children.length ;
    for (var i = 0; i < len; i++)  {
      child = this._children[i];
      child.Render() ;
    }
  }
};


/*---------------------------------------------------------------------*/
/*    swap()                                                           */
/*---------------------------------------------------------------------*/

//  In progress  TDO  JRM

/**
  *    Exchanges the positions of two objects in this container..
  */ 
DvtCanvasContainer.prototype.swap = function(obj1, obj2)
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
 * @protected
 */
DvtCanvasContainer.prototype.CreateChildGroupElem = function(rmChildren)
{

/*
  //  This is a shape "container".
  //  If no previous children, will create a group DOM element for the this
  //  (parent) object and add the new child to the child group DOM element.
  //  else will add the object directly to the shape group container element.

  if (! this._childGroupElem && this.getObj().getNumChildren() === 0) {
    var childGroupId = this._id ? this._id + '_g' : null;
    this._childGroupElem  = new DvtContainer(this.getObj().getContext(), childGroupId) ;
   
    //  Remove this's DOM element from the parent, and append to child group DOM element.
    var  parent = this.getParent() ;
    if (parent) {
//    elemParent = parent.getImpl().getElem() ;
      parent.addChild(this._childGroupElem, this.getObj()) ; 
    }
    if (! rmChildren)
      this._childGroupElem.addChild(this.getObj()) ;   // add shape to new group
        
    //transfer attributes from the old outermost Canvas element to the
    //new outer group element
    DvtCanvasDisplayable.TransferAttributes(this._elem, this._childGroupElem, this.GetAttributesTransferableToGroup());

    //Note need to copy _obj reference to the new group element so that events can be propagated.
//    if (this.getObj()) {
//      this._childGroupElem._obj = this.getObj() ;
//    }
  }
  else if (rmChildren) {
    this.getObj().removeChildren();
  }


this._childGroupElem.addChild(
*/

};

/**
 * Adds a hyperlink to this object, remove the old hyperlink if exists.
 * This method adds a <g> and a <a> tags around this object. <g><a><this element></a></g>
 * @param {DvtObj} linkObj contains destination (url) and targetFrame
 */
DvtCanvasContainer.prototype.setHyperlink = function(linkObj) {
}

// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*---------------------------------------------------------------------*/
/* DvtCanvasStage()   Contains all objects associated with a specific  */
/*                    Canvas root.                                     */
/*---------------------------------------------------------------------*/
/**
 * @constructor
  *  Canvas implementation of DvtStage, representing the highest level container
  *  under the &lt;Canvas&gt; DOM element.
  *  @extends DvtCanvasContainer
  *  @class DvtCanvasStage
  */
var   DvtCanvasStage = function(context, canvasRoot, id)
{
  this._Init(context, canvasRoot, id) ; 
};

DvtObj.createSubclass(DvtCanvasStage, DvtCanvasContainer, "DvtCanvasStage") ;


/*---------------------------------------------------------------------*/
/*   getCanvasRoot()          Returns the Canvas root DOM element      */
/*---------------------------------------------------------------------*/
/**
  *   Returns the associated Canvas element.
  *   @returns {Canvas} returns the associated Canvas element.
  */
DvtCanvasStage.prototype.getCanvasRoot = function()
{
   return this._canvasRoot ;
} ;



/*---------------------------------------------------------------------*/
/*   _Init()                                                           */
/*---------------------------------------------------------------------*/
/** @private */
DvtCanvasStage.prototype._Init = function(context, canvasRoot, id)
{
  this._canvasRoot  = canvasRoot ;   // Canvas DOM element
  this._bAppended   = true ;
  this._obj         = null ;         // the controlling Dvt... object

  DvtCanvasStage.superclass._Init.call(this, context, id, 'stage') ;
} ;



/*---------------------------------------------------------------------*/
/*   render()                                                          */
/*---------------------------------------------------------------------*/

DvtCanvasStage.prototype.render = function()
{
   this.Render() ;
} ;

// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*---------------------------------------------------------------------*/
/*   DvtCanvasShape       Abstract base class for all shapes           */
/*---------------------------------------------------------------------*/
/**
 * A base class for shapes implemented via Canvas.  Implements common DvtShape
 * drawing support for properties such as such as stroke and fill types and colors.
 * DvtCanvasShape is intended to be subclassed.
 * @extends DvtCanvasContainer
 * @class DvtCanvasShape
 * @constructor
 * @param {string} id   An id for the object.
 * @param {string} type The Canvas DOM element type - e.g. 'circle', 'rect', etc.
 */
var DvtCanvasShape = function (id) {
  this._Init(id);
};

//  Allow shapes to become 'containers' themselves.  Note: this does not
//  provide a true parent/child relationship since this not available in Canvas.
DvtObj.createSubclass(DvtCanvasShape, DvtCanvasContainer, "DvtCanvasShape");




/*---------------------------------------------------------------------*/
/*  _Init()                                                            */
/*---------------------------------------------------------------------*/
/** @private */
DvtCanvasShape.prototype._Init = function (context, id) {
  DvtCanvasShape.superclass._Init.call(this, context, id);

  //  Base shape properties
  this._stroke     = null;
  this._fill       = null;
  this._origFill   = null;
  this._origStroke = null;
  this._bHollow    = false;

  // Since setFill() may never be called, will set a default no 'fill'
//  this._elem.setAttributeNS(null, 'fill', 'none');
};

/*---------------------------------------------------------------------*/
/*   get/setFill()                                                     */
/*---------------------------------------------------------------------*/
/**
 *  Returns the fill object (derivative of {@link DvtFill}) applied to this shape.
 * @type DvtFill
 */
DvtCanvasShape.prototype.getFill = function () {
  return this._fill;
};

/**
 *  Sets the fill properties on this shape from the supplied fill object (a
 *  derivative of {@link DvtFill}).
 *  @param {DvtFill}  obj  A fill object. If null is specified, a transparent
 *  fill results.
 */

DvtCanvasShape.prototype.setFill = function (obj) {
  if (! obj) {
    this._fill = null;
  }
  else if (this._fill !== obj) {
    if ((obj instanceof DvtLinearGradientFill) && (! obj.getBounds())) {
      var bbox = DvtObjDimUtils.getDimensionsSelf(this) ;
      var arBounds = [bbox.x, bbox.y, bbox.w, bbox.h] ;

      obj = new DvtLinearGradientFill(obj.getAngle(), obj.getColors(), obj.getAlphas(), obj.getStops(), arBounds);
    }
    else if (obj instanceof DvtRadialGradientFill) {
    } 
    this._fill = obj;
  }
return ;


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
/*
    var color = obj.getColor();
    if (color) {
      var alpha = obj.getAlpha();
      // Workaround for Safari where versions < 5.1 render rgba values as black
      var agent = DvtAgent.getAgent();
      if (agent.isSafari() && color.indexOf("rgba") >= 0) {
        this._elem.setAttributeNS(null, 'fill', DvtColorUtils.getRGB(color));
        // Use alpha in rgba value as a multiplier to the alpha set on the object as this is what svg does.
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
*/
  }
};


/*
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
*/

/*---------------------------------------------------------------------*/
/*   get/setStroke()                                                   */
/*---------------------------------------------------------------------*/
/**
 *  Returns the stroke object (derivative of {@link DvtStroke}) applied to this shape.
 * @type DvtStroke
 */
DvtCanvasShape.prototype.getStroke = function () {
  return this._stroke;
};

/**
 *  Sets the stroke properties on this shape from the supplied stroke object.
 *  If the stroke object is null, any existing stroke is removed.
 *  @param {DvtStroke}  obj  A stroke object.
 */

DvtCanvasShape.prototype.setStroke = function (obj) {
  this._stroke = obj;
return ;                         // temp

  //  Stroke color/alpha
  // gradient
  if (obj instanceof DvtGradientStroke) {
    this._setSpecStroke(obj, DvtSvgGradientUtils);
  }
  else {
    var color = obj.getColor();
    if (color) {
      var alpha = obj.getAlpha();
      // Workaround for Safari where versions < 5.1 render rgba values as black
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
/*
DvtSvgShape.prototype._setSpecStroke = function (obj, func) {
  var id;
  if (!obj.isLocked()) {
    id = obj.getId();
    if (!id) {
      id = DvtSvgShapeUtils.getUniqueId('Gr');// no id - create unique internal id
      obj.setId(id);
    }

    var elem = func.createElem(obj, id);// create SVG DOM elem
    this.getObj().getContext().appendDefs(elem);
  }
  else {
    id = obj.getId();
  }

  this._elem.setAttributeNS(null, 'stroke', 'url(#' + id + ')');
  var alpha = obj.getAlpha();
  if (alpha != null) {
    this._elem.setAttributeNS(null, 'stroke-opacity', alpha);
  }
};
*/

/**  Changes the shape to an outline shape format.  Used for legends
 *  markers that represent a hidden state for the associated series risers.
 *  @param {String} fc Border color for hollow shape in format of #aarrggbb
 *  @param {number} strokeWidth Stroke width used for shapes that were transofrmed (optional)
 */
/*
DvtSvgShape.prototype.setHollow = function (fc, strokeWidth)
{
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
*/

/**  Returns whether a shape is hollow.
 *  @returns {boolean} True if the shape is hollow
 */
DvtCanvasShape.prototype.isHollow = function () {
  return this._bHollow;
}

// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*---------------------------------------------------------------------*/
/*    DvtCanvasArc        Canvas implementation for DvtArc             */
/*---------------------------------------------------------------------*/
/**
  *  Creates an arc (a portion of an ellipse or circle) implemented by Canvas.
  *  @extends DvtCanvasShape
  *  @class  DvtCanvasArc  Creates an arc (a portion of an ellipse or circle)
  *  implemented by Canvas.  Do not create directly, use DvtArc.
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
var  DvtCanvasArc = function(context, cx, cy, rx, ry, sa, ae, clos, id)
{
   this._Init(context, cx, cy, rx, ry, sa, ae, clos, id) ;
};

DvtObj.createSubclass(DvtCanvasArc, DvtCanvasShape, "DvtCanvasArc") ;



/*---------------------------------------------------------------------*/
/*  _AddClosure()                                                      */
/*---------------------------------------------------------------------*/
/** @private */
DvtCanvasArc.prototype._addClosure = function(p)
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
DvtCanvasArc.prototype._createArc = function()
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
   var nSweepFlag =  (this._ae > 0)? '0' : '1' ;     // 0 == Canvas +ve angle

   var path = "M " +  x1 + " " + y1 + " A " + this._rx + "," + this._ry + " " + "0" + " " +
              nLargeArc + "," + nSweepFlag + " " + x2 + "," + y2 ;   
   path = this._addClosure(path) ;

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
DvtCanvasArc.prototype.getAngleExtent = function()
{
   return this._ae ;
} ;
/**
  *  Returns the angle subtended by the arc.
  *  @returns {number}  The angle subtended by the arc.
  *  is positive convention).
  */
DvtCanvasArc.prototype.setAngleExtent = function(ae)
{
   ae = ((ae === null || isNaN(ae)) ? 0 : ae);
   if (this._ae !== ae) {

     //  From https://developer.mozilla.org/en/Canvas/Tutorial/Paths
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
DvtCanvasArc.prototype.getAngleStart = function()
{
   return this._sa ;
} ;

/**
  *  Sets the start angle of the arc.
  *  @param {number}  The starting angle (following the normal anti-clockwise
  *  is positive convention).
  */
DvtCanvasArc.prototype.setAngleStart = function(sa)
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
DvtCanvasArc.prototype.getClosure = function()
{
   return this._ct ;
} ;

/**
  *  Sets the closure type of the arc.
  *  @param {String} ct   The closure type,  such as {@link DvtArc#OPEN}
  */
DvtCanvasArc.prototype.setClosure = function(ct)
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

DvtCanvasArc.prototype._Init = function(context, cx, cy, rx, ry, sa, ae, clos, id)
{
   DvtCanvasArc.superclass._Init.call(this, context, id, 'path') ;

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
DvtCanvasArc.prototype.setArc = function(sa, ae)
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
DvtCanvasArc.prototype.getCx = function()
{
   return  this._cx ;
} ;
/**
  *  Sets the x coordinate of the center.
  *  @param {number} cx  The center x position.
  */
DvtCanvasArc.prototype.setCx = function(cx)
{
   if (cx !== this._cx) {
     this._cx  = cx ;
   }
} ;


/*---------------------------------------------------------------------*/
/*   get/setCy()                                                       */
/*---------------------------------------------------------------------*/
/**
  *  Returns the y coordinate of the center.
  *  @type number
  */
DvtCanvasArc.prototype.getCy = function()
{
   return  this._cy ;
} ;

/**
  *  Sets the y coordinate of the center.
  *  @param {number} cy  The center y position.
  *
  */
DvtCanvasArc.prototype.setCy = function(cy)
{
   if (cy !== this._cy) {
     this._cy  = cy ;
   }
} ;


/*---------------------------------------------------------------------*/
/*   get/setRx()                                                       */
/*---------------------------------------------------------------------*/
/**
  *  Returns the horizontal radius of the ellipse.
  *  @type number
  */
DvtCanvasArc.prototype.getRx = function()
{
   return this._rx ;
} ;

/**
  *  Sets the horizontal radii of the ellipse.
  *  @param {number} rx  The horizontal radius of the ellipse.
  */
DvtCanvasArc.prototype.setRx = function(rx)
{
   if (rx !== this._rx) {
     this._rx  = rx ;
   }
} ;


/*---------------------------------------------------------------------*/
/*   get/setRy()                                                       */
/*---------------------------------------------------------------------*/
/**
  *  Returns the vertical radius of the ellipse.
  *  @type number
  */
DvtCanvasArc.prototype.getRy = function()
{
   return this._ry ;
} ;

/**
  *  Sets the vertical radius of the ellipse.
  *  @param {number} ry  The vertical radius of the ellipse.
  */
DvtCanvasArc.prototype.setRy = function(ry)
{
   if (ry !== this._ry) {
     this._ry  = ry ;
   }
} ;


/*---------------------------------------------------------------------*/
/*   renderSelf()     Override of DvtCanvasDisplayable.renderSelf()    */
/*---------------------------------------------------------------------*/

DvtCanvasArc.prototype.RenderSelf = function()
{
   DvtCanvasArc.superclass.RenderSelf.call(this) ;

   var ctx  = this.getCtx() ;
   ctx.save() ;

   var action = this.applyDrawAttrs() ;            // apply base stroke, fill, shadow, etc
   if (action !== DvtCanvasDrawUtils.NOACTION) {

     ctx.beginPath() ;

     var  r  = this._rx?  this._rx : this._r ;

     DvtCanvasDrawUtils.drawArc(ctx, this._cx, this._cy, r, this._ry, this._sa, this._ae, this._ct) ;

     if (action & DvtCanvasDrawUtils.FILL)
       ctx.fill() ;
     if (action & DvtCanvasDrawUtils.STROKE)
       ctx.stroke() ;
     ctx.closePath() ;
   }

   ctx.restore() ;
};

// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*---------------------------------------------------------------------*/
/*   DvtCanvasCircle    Canvas Implementation of base circular shape   */
/*---------------------------------------------------------------------*/
/**
  *  Creates a circular displayable shape - Canvas implementation of DvtCircle.
  *  @extends DvtCanvasShape
  *  @class DvtCanvasCircle is an Canvas implementation of DvtCircle and displays
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
var   DvtCanvasCircle = function(context, cx, cy, r, id)
{
   this._Init(context, cx, cy, r, id) ;
};

DvtObj.createSubclass(DvtCanvasCircle, DvtCanvasShape, "DvtCanvasCircle") ;


/*---------------------------------------------------------------------*/
/*  Init()                                                             */
/*---------------------------------------------------------------------*/
/** @private */
DvtCanvasCircle.prototype._Init = function(context, cx, cy, r, id, type)
{
   DvtCanvasCircle.superclass._Init.call(this, context, id, (type ? type : 'circle')) ;

   this.setCx(cx);
   this.setCy(cy);
   this.setRadius(r);
} ;



/*---------------------------------------------------------------------*/
/*   get/setCx()                                                       */
/*---------------------------------------------------------------------*/

DvtCanvasCircle.prototype.getCx = function()
{
   return  this._cx ;
} ;
/**
  *  Sets the x coordinate of the center.
  *  @param {number} cx  The center x position.
  */

DvtCanvasCircle.prototype.setCx = function(cx)
{
   if (cx !== this._cx) {
     this._cx  = cx ;
   }
};


/*---------------------------------------------------------------------*/
/*   get/setCy()                                                       */
/*---------------------------------------------------------------------*/
/**
  *  Returns the y coordinate of the center.
  *  @type number
  */
DvtCanvasCircle.prototype.getCy = function()
{
   return  this._cy ;
};

/**
  *  Sets the y coordinate of the center.
  *  @param {number} cy  The center y position.
  *
  */
DvtCanvasCircle.prototype.setCy = function(cy)
{
   if (cy !== this._cy) {
     this._cy  = cy ;
   }
};

/*---------------------------------------------------------------------*/
/*   setRadius()                                                       */
/*---------------------------------------------------------------------*/
/**
  *  Gets the radius  of the circle.
  *  @type {Number}  The radius of the circle.
  */
DvtCanvasCircle.prototype.getRadius = function()
{
   return  this._r ;
};

/**
  *  Sets the radius  of the circle.
  *  @param {number} r   The radius of the circle.
  */
DvtCanvasCircle.prototype.setRadius = function(r)
{
  if(r !== this._r) {
    this._r  = r ;
  }
};


/*---------------------------------------------------------------------*/
/*    renderSelf()      Override of DvtCanvasDisplayable.renderSelf()  */
/*---------------------------------------------------------------------*/

DvtCanvasCircle.prototype.RenderSelf = function()
{
   DvtCanvasCircle.superclass.RenderSelf.call(this) ;

   var ctx  = this.getCtx() ;
   ctx.save() ;

   var action = this.applyDrawAttrs() ;            // apply base stroke, fill, shadow, etc
   if (action !== DvtCanvasDrawUtils.NOACTION) {

     ctx.beginPath() ;

     var  r  = this._rx?  this._rx : this._r ;

     DvtCanvasDrawUtils.drawEllipse(ctx, this._cx, this._cy, r, this._ry) ;

     if (action & DvtCanvasDrawUtils.FILL)
       ctx.fill() ;
     if (action & DvtCanvasDrawUtils.STROKE)
       ctx.stroke() ;
     ctx.closePath() ;
   }

   ctx.restore() ;
};
// Copyright (c) 2011, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*---------------------------------------------------------------------*/
/*    DvtCanvasImage     Canvas implementation for base shape DvtImage */
/*---------------------------------------------------------------------*/
/**
  *   Canvas implementation for DvtImage.
  *   @constructor  
  *   Maybe specified as individual values or using a DvtImage object.
  *
  *   e.g. Image = new DvtImage(context,'pic'png', 10, 10, 50, 100);  or
  *
  *        Image = new DvtImage(context, myImage);   where myImage = new DvtImage(context,'pic.png', 10, 10, 50, 100);
  *
  */
var  DvtCanvasImage = function(context, src, x, y, w, h, id)
{
  this._Init(context, src, x, y, w, h, id) ;
}

DvtObj.createSubclass(DvtCanvasImage, DvtCanvasShape, "DvtCanvasImage");



DvtCanvasImage.XLINK_NS = "http://www.w3.org/1999/xlink";


/*---------------------------------------------------------------------*/
/*  Init()                                                             */
/*---------------------------------------------------------------------*/

DvtCanvasImage.prototype._Init = function(context, src, x, y, w, h, id)
{
   DvtCanvasImage.superclass._Init.call(this, context, id, 'image') ;
   this.setImage(src, x, y, w, h);
} ;



/*---------------------------------------------------------------------*/
/*   get/setHeight()                                                   */
/*---------------------------------------------------------------------*/
/**
  *  Returns the height of the rectangle.
  *  @type number
  */
DvtCanvasImage.prototype.getHeight = function()
{
   return  this._h ;
};

/**
  *  Sets the height of the image.
  *  @param {number} h  The height of the image.
  *  @returns nothing
  */
DvtCanvasImage.prototype.setHeight= function(h)
{
   if (h !== this._h) {
     this._h  = h ;
   }
};



/*---------------------------------------------------------------------*/
/*   get/setPos(x,y)                                                   */
/*---------------------------------------------------------------------*/

DvtCanvasImage.prototype.getPos = function()
{
   return new DvtPoint(this._x, this._y) ;
};

DvtCanvasImage.prototype.setPos= function(x,y)
{
   this.setX(x) ;
   this.setY(y) ;
};


/*---------------------------------------------------------------------*/
/*   get/setX()                                                        */
/*---------------------------------------------------------------------*/

DvtCanvasImage.prototype.getX = function()
{
   return this._x ;
} ;

DvtCanvasImage.prototype.setX = function(x)
{
   if (x !== this._x) {
     this._x  = x ;
   }
};

/*---------------------------------------------------------------------*/
/*   get/setY()                                                        */
/*---------------------------------------------------------------------*/

DvtCanvasImage.prototype.getY = function()
{
   return this._y ;
} ;
DvtCanvasImage.prototype.setY = function(y)
{
   if (y !== this._y) {
     this._y  = y ;
   }
};


/*---------------------------------------------------------------------*/
/*   get/setWidth()                                                    */
/*---------------------------------------------------------------------*/

DvtCanvasImage.prototype.getWidth = function()
{
   return this._w ;
} ;

/**
  *  Sets the width of the image.
  *  @param {number} w  The width of the image.
  *  @returns nothing
  */
DvtCanvasImage.prototype.setWidth = function(w)
{
   if (w !== this._w) {
     this._w  = w ;
   }
};


DvtCanvasImage.prototype._imgLoaded  = function(ev)
{
   var imgCanvas = this._DvtObj ;
   this._DvtObj  = null ;
   imgCanvas._imgLoading.removeEventListener('load', this._imgLoaded, false) ;
   imgCanvas._img = imgCanvas._imgLoading ;
   imgCanvas._imgLoading = null ;
   imgCanvas.getObj().getContext().decAsyncLoadCount() ;
};


/*---------------------------------------------------------------------*/
/*   renderSelf()      Override of DvtCanvasDisplayable.render         */
/*---------------------------------------------------------------------*/

DvtCanvasImage.prototype.RenderSelf = function()
{
  DvtCanvasImage.superclass.RenderSelf.call(this) ;

  var ctx  = this.getCtx() ;

  if (this._img) {
    ctx.drawImage(this._img, this._x, this._y, this._w, this._h) ;
  }
  else if (! this._imgLoading) {
    this._imgLoading = new Image() ;
    this._imgLoading.src = this._src ;
    this._imgLoading._DvtObj = this ;
    this._imgLoading.addEventListener('load', this._imgLoaded, false)   ;

    this.getObj().getContext().incAsyncLoadCount() ;
  }
};



/*---------------------------------------------------------------------*/
/*   get/setSrc()                                                      */
/*---------------------------------------------------------------------*/
/**
  *  Returns the src of the image.
  *  @returns (String) the src of the image.
  */
DvtCanvasImage.prototype.getSrc = function()
{
  return this._src;
} ;

/**
  *  Sets the src of the image.
  *  @param {number} src  The src of the image.
  *  @returns nothing
  */
DvtCanvasImage.prototype.setSrc = function(src)
{
   if (src !== this._src) {
     this._src  = src ;

     //TODO: 
     // this._elem.setAttributeNS("xlink", 'href', this._src) ;
//   this._elem.setAttributeNS(DvtCanvasImage.XLINK_NS, 'xlink:href', this._src) ;
   }
};


/*---------------------------------------------------------------------*/
/*   setImage()                                                        */
/*---------------------------------------------------------------------*/
/**
  *     Sets the position and size and src of the image
  *     Maybe specified as individual values or using a DvtImage object.
  *
  *   e.g. Image = factory.newImage('pic'png', 10, 10, 50, 100);  or
  *
  *        Image = factory.newImage(myImage);   where myImage = new DvtImage('pic.png', 10, 10, 50, 100);
  */
DvtCanvasImage.prototype.setImage = function(src,x,y,w,h)
{
   if (src instanceof DvtImage) {
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
   //this._elem.setAttributeNS(null, 'preserveAspectRatio', 'none') ;
};


/**
  *  Loads the image and sets the image size if it was loaded
  *  Returns the dimension of the image if it was loaded
  */
DvtCanvasImage.prototype.loadImage = function() {
  if (this._src) {
    var imageSize = DvtCanvasImageLoader.loadImage(this._src);
    if (imageSize) {
      this.setWidth(imageSize.width);
      this.setHeight(imageSize.height);
      return this.getDimensions();
    }
  }
  return null;
};


// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*---------------------------------------------------------------------*/
/*   DvtCanvasLine          Canvas Implementation of DvtLine           */
/*---------------------------------------------------------------------*/
/**
  *   Creates an Canvas implementation of a line segment drawn from (x1, y1) to (x2, y2).
  *   An object of this class must not created directly, use {@link DvtLine}.
  *   @extends DvtCanvasShape
  *   @class DvtCanvasLine
  *   @constructor  
  *   @param {number} x1  An x end-position of the line.
  *   @param {number} y1  The associated y end-point (for x1).
  *   @param {number} x2  The other end-point's x coordinate.
  *   @param {number} y2  The y coordinate associated with x2.
  *   @param {String} id  Optional ID for the shape (see {@link  DvtDisplayable#setId}).
  */
var DvtCanvasLine = function(context, x1, y1, x2, y2, id)
{
   this._Init(context, x1, y1, x2, y2, id) ;
};

DvtObj.createSubclass(DvtCanvasLine, DvtCanvasShape, "DvtCanvasLine") ;



/*---------------------------------------------------------------------*/
/*   _Init()                                                           */
/*---------------------------------------------------------------------*/
/**   @private  */
DvtCanvasLine.prototype._Init = function(context, x1, y1, x2, y2, id)
{
   DvtCanvasLine.superclass._Init.call(this, context, id, 'line') ;

   this.setX1(x1);
   this.setY1(y1);
   this.setX2(x2);
   this.setY2(y2);
   this._bHollow = false;
} ;

/*---------------------------------------------------------------------*/
/*   get/setX1()                                                       */
/*---------------------------------------------------------------------*/

DvtCanvasLine.prototype.getX1 = function()
{
   return this._x1 ;
} ;

DvtCanvasLine.prototype.setX1 = function(x1)
{
   if (x1 !== this._x1) {
     this._x1  = x1 ;
   }
} ;

/*---------------------------------------------------------------------*/
/*   get/setY1()                                                       */
/*---------------------------------------------------------------------*/

DvtCanvasLine.prototype.getY1 = function()
{
   return this._y1 ;
} ;

DvtCanvasLine.prototype.setY1 = function(y1)
{
   if (y1 !== this._y1) {
     this._y1  = y1 ;
   }
} ;

/*---------------------------------------------------------------------*/
/*   get/setX2()                                                       */
/*---------------------------------------------------------------------*/

DvtCanvasLine.prototype.getX2 = function()
{
   return this._x2 ;
} ;

DvtCanvasLine.prototype.setX2 = function(x2)
{
   if (x2 !== this._x2) {
     this._x2  = x2 ;
   }
} ;

/*---------------------------------------------------------------------*/
/*   get/setY2()                                                       */
/*---------------------------------------------------------------------*/

DvtCanvasLine.prototype.getY2 = function()
{
   return this._y2 ;
} ;

DvtCanvasLine.prototype.setY2 = function(y2)
{
   if (y2 !== this._y2) {
     this._y2  = y2 ;
   }
} ;

/**  Changes the shape to an outline shape format.  Used for legend
  *  markers that represent a hidden state for the associated series risers.
  *                            reinstates the pevious state.
  *  @override
  */
DvtCanvasLine.prototype.setHollow = function()
{
    var  parentElem = this._elem.parentNode ;

    if (!this._bHollow) {
        this._origElem   = this._elem;
        var hollowMarker; 
        var width  = this.getX2() - this.getX1() ;   // Legend lines are always horizontal, so take width as height
        var height = width ;
        var startY = this.getY1() - width/2 ;
        var stroke = this.getStroke();
        
        hollowMarker = DvtCanvasShapeUtils.createElement('rect');
        hollowMarker.setAttributeNS(null,'x', this.getX1()) ;
        hollowMarker.setAttributeNS(null,'y', startY) ;
        hollowMarker.setAttributeNS(null,'width', this.getX2() - this.getX1()) ;
        hollowMarker.setAttributeNS(null,'height', height) ;
        var color = stroke.getColor();
        if (color) {
          var alpha = stroke.getAlpha();
          // Workaround for Safari where versions < 5.1 render rgba values as black
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
DvtCanvasShape.prototype.isHollow = function() {
    return this._bHollow;
}


/*---------------------------------------------------------------------*/
/*    render()        Override of DvtCanvasDisplayable.render()        */
/*---------------------------------------------------------------------*/
/**
  *   Renders this displayable.
  */
DvtCanvasLine.prototype.RenderSelf = function()
{
   DvtCanvasLine.superclass.RenderSelf.call(this) ;

   var ctx    = this.getCtx() ;
   var stroke = this.getStroke() ;
   var arGaps ;

   if (stroke) {
     ctx.save() ;
     ctx.beginPath() ;

     DvtCanvasDrawUtils.applyStroke(ctx, stroke) ;

     var xPos    = this._x1 ;
     var yPos    = this._y1 ;  
     var bVert   = ((yPos !== this._y2) && (xPos === this._x2)) ;
     var bHoriz  = ((xPos !== this._x2) && (yPos === this._y2)) ;
     var bAngled = (! (bVert && bHoriz)) ;
     var xFactor = 0 ;
     var yFactor = 0 ;

     if (bVert) {                        // adjust the perpendicular
       xFactor = 0.5 ;
     }                                   // or
     else if (bHoriz) {
       yFactor = 0.5 ;                   // horizontal factor
     }
     xPos += xFactor ;
     yPos += yFactor ;

     arGaps = stroke.getDash() ;
     if (arGaps) {
       DvtCanvasDrawUtils.drawDashedLine(ctx, xPos, yPos, this._x2, this._y2, arGaps) ;
     }
     else  {
       ctx.moveTo(xPos, yPos) ;
       ctx.lineTo((xFactor + this._x2), (yFactor + this._y2)) ;
     }

     ctx.stroke() ;
     ctx.restore() ;
   }
};

// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*--------------------------------------------------------------------*/
/*   DvtCanvasMarker         Canvas implementation of a DvtMarker     */
/*--------------------------------------------------------------------*/
/**
  *   An Canvas implementation of DvtMarker
  *   @class An Canvas implementation of DvtMarker. Do not create directly, use DvtMarker.
  *   var  marker = new DvtMarker(context, DvtMarker.CIRCLE, 50, 50, 10, 10) ;<br></code>
  *   @extends DvtCanvasShape
  *   @constructor    Returns a DvtCanvasMarker instance.
  *   @param {number} type  The marker type (such as {@link DvtMarker#CIRCLE}).
  *   @type  DvtCanvasMarker
  */
var  DvtCanvasMarker = function(context, type, id, etype)
{
  this._Init(context, type, id, etype) ; 
}  ;

DvtObj.createSubclass(DvtCanvasMarker, DvtCanvasShape, "DvtCanvasMarker") ;

/**
  *   @private
  */ 
DvtCanvasMarker.prototype._Init = function(context, type, id, etype)
{

   DvtCanvasMarker.superclass._Init.call(this, context, id);
   
   this._type         = type;
   this._underlay     = null;
   this._defaultScale = 1; //default scale of the marker used to force it to the reference size
};

/**
  *  Returns the bounds of the object supplied by setBounds().
  *  @returns {DvtRectangle} the bounds of the object supplied by setBounds().
  */
DvtCanvasMarker.prototype.getBounds = function()
{
   return this._dims ;
};

/**
 * Sets the position and size of the marker.
 * @param {number} x The top left x-coordinate of the marker's bounding rectangle.
 * @param {number} y The top left y-coordinate of the marker's bounding rectangle.
 * @param {number} w The width of the marker's bounding rectangle.
 * @param {number} h The height of the marker's bounding rectangle.
 * @param {DvtMarkerDef} markerDef
 */
DvtCanvasMarker.prototype.setBounds = function(x, y, w, h, markerDef)
{   
   // Initialize the shape to the reference coords
   if (! this._shapeInitialized)
   {
     this._initShape(this._type, markerDef, x, y, w, h) ;
   }
};


/**
 * Initializes the shape to the specified coordinates.
 * @private
 */
DvtCanvasMarker.prototype._initShape = function (type, markerDef, x, y, w, h) {
  
  this._shapeInitialized = true;       // note init done, only need to do it once

  var multiPathRoot;
  if (type === DvtMarker.CUSTOM || type === DvtMarker.HUMAN)
  {
    // Calc the scale factor to get the right size.

    var dim    = DvtDisplayableUtils._getDimForced(this.getObj().getContext(), markerDef);
    var maxDim = Math.max(dim.w, dim.h);
    var sx     = 1; 
    var sy     = 1; 
    var dx, dy ;

    // Calculate the transform to get to the right position

    if (type === DvtMarker.CUSTOM) {
      sx = w/this.getObj().getMaintainAspect()?  maxDim : dim.w ;
      sy = h/this.getObj().getMaintainAspect()?  maxDim : dim.h ;
      dx = x + (-dim.x * sx) + (w - (dim.w * sx))/2;
      dy = y + (-dim.y * sy) + (h - (dim.h * sy))/2;
//    multiPathRoot = this._setCustomMarker(markerDef, dx, dy, sx, sy);
    }
    else if (type === DvtMarker.HUMAN) 
    {
       sx = w/maxDim ;
       sy = h/maxDim ;
       dx = x + (-dim.x * sx) + (w - (dim.w * sx))/2;
       dy = y + (-dim.y * sy) + (h - (dim.h * sy))/2;
       this._setCmds(DvtPathUtils.transformPath(DvtMarkerDef.HUMAN_CMDS, dx, dy, sx, sy)) ;
       this._dims = DvtPathUtils.getDimensions(this._aCmds)
    }
  }
  else
  {
     if (type === DvtMarker.IMAGE) {
       this._setSrc(this.getObj().GetMarkerImage(DvtMarker.IMAGE_SOURCE));
       this._setX(x);
       this._setY(y);
       this._setWidth(w);
       this._setHeight(h);
     }
     else if (type === DvtMarker.SQUARE) {
       this._setX(x);
       this._setY(y);
       this._setWidth(w);
       this._setHeight(h);
     }
     else if (type === DvtMarker.CIRCLE) {
       this._setCx(x + w/2);
       this._setCy(y + h/2);
       this._setRadius(w/2);
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
       this._setRx(rx);
       this._setRy(ry);
     }
     else {
       var ar = [];
       var halfWidth = w / 2;
   
       if (type === DvtMarker.TRIANGLE_UP) {
         ar.push(x);
         ar.push(y + w);
         ar.push(x + w);
         ar.push(y + w);
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
         ar.push(y + w);
         this._setPolygon(ar);
       }
       else if (type === DvtMarker.DIAMOND) {
         ar.push(x + halfWidth);
         ar.push(y);
         ar.push(x + w);
         ar.push(y + halfWidth);
         ar.push(x + halfWidth);
         ar.push(y + w);
         ar.push(x);
         ar.push(y + halfWidth);
         this._setPolygon(ar);
       }
       else if (type === DvtMarker.PLUS) {
         var nThird = w / 3;
         var nTwoThird = 2 * nThird;

         ar.push(x + nThird);
         ar.push(y);
         ar.push(x + nTwoThird);
         ar.push(y);
         ar.push(x + nTwoThird);
         ar.push(y + nThird);
         ar.push(x + w);
         ar.push(y + nThird);
         ar.push(x + w);
         ar.push(y + nTwoThird);
         ar.push(x + nTwoThird);
         ar.push(y + nTwoThird);
         ar.push(x + nTwoThird);
         ar.push(y + w);
         ar.push(x + nThird);
         ar.push(y + w);
         ar.push(x + nThird);
         ar.push(y + nTwoThird);
         ar.push(x);
         ar.push(y + nTwoThird);
         ar.push(x);
         ar.push(y + nThird);
         ar.push(x + nThird);
         ar.push(y + nThird);
         ar.push(x + nThird);
         ar.push(y);
         this._setPolygon(ar);
       }
   }

   this._dims = new DvtRectangle(x,y,w,h) ;

  }
};

/**
  *  Returns the default scale of the marker used to force it to the 
  *  reference size.
  *  @type number
  */
DvtCanvasMarker.prototype.getDefaultScale = function()
{
   return this._defaultScale;
};


DvtCanvasMarker.prototype.getCx = function()
{
   return this._cx ;
};

DvtCanvasMarker.prototype.getCy = function()
{
   return this._cy ;
};

DvtCanvasMarker.prototype.getCmds = function()
{
   return this._aCmds ;
};

DvtCanvasMarker.prototype.getPoints = function()
{
   return this._arPoints ;
};

DvtCanvasMarker.prototype.getRadius = function()
{
   return this._r ;
};

DvtCanvasMarker.prototype.getRect = function()
{
   return new DvtRectangle(this._x, this._y, this._w, this._h) ;
};


/**
  *  Returns the type of the marker (such as {@link DvtMarker#CIRCLE}.
  *  @type number
  */
DvtCanvasMarker.prototype.getType = function()
{
   return  this._type ;
} ;



/*---------------------------------------------------------------------*/
/*    RenderSelf()      Override of DvtCanvasDisplayable.renderSelf()  */
/*---------------------------------------------------------------------*/

DvtCanvasMarker.prototype.RenderSelf = function()
{
  DvtCanvasMarker.superclass.RenderSelf.call(this) ;

  var ctx = this.getCtx() ;
  ctx.save() ;

  var action = this.applyDrawAttrs() ;            // apply base stroke, fill, shadow, etc
  if (action !== DvtCanvasDrawUtils.NOACTION) {

    ctx.beginPath() ;

    if (this._type === DvtMarker.SQUARE) {
      DvtCanvasDrawUtils.drawRect(ctx, this._x, this._y, this._w, this._h) ;
    }
    else if (this._type === DvtMarker.ROUNDED_RECTANGLE) {
      DvtCanvasDrawUtils.drawRect(ctx, this._x, this._y, this._w, this._h, this._rx, this._ry) ;
    }
    else if (this._type === DvtMarker.CIRCLE) {
      DvtCanvasDrawUtils.drawEllipse(ctx, this._cx, this._cy, this._r) ;
    }
    else if (this._type === DvtMarker.TRIANGLE_UP    ||
             this._type === DvtMarker.TRIANGLE_DOWN  ||
             this._type === DvtMarker.DIAMOND        ||       
             this._type === DvtMarker.PLUS) {
      DvtCanvasDrawUtils.drawPolygon(ctx, this._arPoints) ;
    }
    else if (this._type === DvtMarker.HUMAN) {
      DvtCanvasDrawUtils.drawPath(ctx, this._aCmds) ;
    }
    else if (this._type === DvtMarker.IMAGE) {
      ctx.drawImage(this._src, this._x, this._y, this._w, this._h);
    }
    else if (this._type === DvtMarker.CUSTOM) {
      console.log('Custom Marker - to do') ;
    }
    else {
      console.log('Unknown Marker (type = ' + this._type + ' ???') ;
    }

    ctx.closePath() ;
    if (action & DvtCanvasDrawUtils.FILL)
      ctx.fill() ;
    if (action & DvtCanvasDrawUtils.STROKE)
      ctx.stroke() ;

  }
  ctx.restore() ;

};


/**
 * @private
 */
DvtCanvasMarker.prototype._setCx = function(cx)
{
   this._cx = cx ;
} ;

/**
 * @private
 */
DvtCanvasMarker.prototype._setCy = function(cy)
{
   this._cy = cy ;
} ;

/**
 * @private
 */
DvtCanvasMarker.prototype._setX = function(x)
{
   this._x = x ;
} ;

/**
 * @private
 */
DvtCanvasMarker.prototype._setY = function(y)
{
   this._y = y ;
} ;

/**
 * @private
 */
DvtCanvasMarker.prototype._setWidth = function(w)
{
  this._w = w ;
} ;

/**
 * @private
  */
DvtCanvasMarker.prototype._setHeight = function(h)
{
  this._h = h ;
} ;

/**
 * @private
  */
DvtCanvasMarker.prototype._setRadius = function(r)
{
   this._r = r ;
} ;


/**
 *   @private
 */
DvtCanvasMarker.prototype._setRx = function(rx)
{
   if (rx !== this._rx) {
     this._rx  = rx ;
   }
} ;

/**
 *   @private
 */
DvtCanvasMarker.prototype._setRy = function(ry)
{
   if (ry !== this._ry) {
     this._ry  = ry ;
   }
} ;


/**
 *   @private
 */
DvtCanvasMarker.prototype._setPolygon = function(ar)
{
   this._arPoints = ar ;
} ;

/**
 *   @private

DvtSvgMarker.prototype._setHref = function(id)
{
   var href = "#" + id;
   if (href !== this._href) {
     this._href  = href ;
     this._elem.setAttributeNS(DvtSvgImage.XLINK_NS, 'xlink:href', href) ;
   }
} ;
 */

/**
 *   @private
 */
DvtCanvasMarker.prototype._setCmds = function(cmds)
{
   if (cmds !== this._cmds) {
     this._cmds  = cmds ;
     this._aCmds = DvtPathUtils.createPathArray(cmds) ;
   }
} ;


/**
 * @override
 */
/*
DvtSvgMarker.prototype.GetAttributesTransferableToGroup = function() {
  // Don't transfer the 'transform' attr, since it affects the clip path for custom markers.
  var attrNames = DvtSvgContainer.AttributesTransferableToGroup.slice(0);
  var transformIndex = DvtArrayUtils.indexOf(attrNames, 'transform');
  attrNames.splice(transformIndex, 1);
  return attrNames;
}
*/
/**
 * @override
 */

DvtCanvasMarker.prototype.setMatrix = function(mat) {
  DvtCanvasMarker.superclass.setMatrix.call(this, mat);

  // Fix for bug 12622757
/*
  DvtSvgDocumentUtils.fixWebkitFilters(this.getOuterElem());
*/
}

/**
 * @override
 */
DvtCanvasMarker.prototype.setAlpha = function(alpha) {
  DvtCanvasMarker.superclass.setAlpha.call(this, alpha);

/*
  // Fix for bug 12622757
  DvtSvgDocumentUtils.fixWebkitFilters(this.getOuterElem());
*/
}

/**
 * @override
 */
DvtCanvasMarker.prototype.setFill = function(obj) { 
  DvtCanvasMarker.superclass.setFill.call(this, obj);

/*
  // Fix for bug 12622757
  DvtSvgDocumentUtils.fixWebkitFilters(this.getOuterElem());
*/
}

/**
 * @override
 */
DvtCanvasMarker.prototype.setStroke = function(obj) {
  DvtCanvasMarker.superclass.setStroke.call(this, obj);
/*

  // Fix for bug 12622757
  DvtSvgDocumentUtils.fixWebkitFilters(this.getOuterElem());
*/
}

/**
 * Sets the position and size of the underlay for all but human markers
 * @private
 */
/*
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
        this._underlay._setRadius(radius + pad);
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
*/

/**
 * Sets the position and size of the underlay for human markers
 * @private
 */
/*
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
        this._underlay._setRadius(radius + pad);
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
*/

/**  Sets the underlay for markers
 *  @param {string} ut underlay type
 *  @param {string} uc fill color of the underlay
 *  @param {number} ua fill alpha of the underlay
 */
/*
DvtSvgMarker.prototype.setUnderlay = function(ut, uc, ua)
{
    var context = this.getObj().getContext();
    this._underlay = context.getImplFactory().newMarker(ut);
    this._underlay.setFill(new DvtSolidFill(uc, ua));
    this._underlay.setObj(this.getObj());
    if (this.getType() === DvtMarker.HUMAN) {
        this._positionHumanUnderlay(DvtSvgMarker._REFERENCE_X, DvtSvgMarker._REFERENCE_Y, 
                                DvtSvgMarker._REFERENCE_W, DvtSvgMarker._REFERENCE_H);
    } else {
        this._positionUnderlay(DvtSvgMarker._REFERENCE_X, DvtSvgMarker._REFERENCE_Y, 
                                DvtSvgMarker._REFERENCE_W, DvtSvgMarker._REFERENCE_H);
    }
    this.addChildAt(this._underlay, 0) ;
}
*/

/*---------------------------------------------------------------------*/
/*   getUnderlay()                                                     */
/*---------------------------------------------------------------------*/
/**  Gets the underlay for markers
 */
DvtCanvasMarker.prototype.getUnderlay = function() 
{
  return this._underlay;
}

/**
 * Sets whether mouse events are enabled on this object.
 * @param {boolean} whether mouse events are enabled
 */
DvtCanvasMarker.prototype.setMouseEnabled = function(bEnabled)
{
  DvtCanvasMarker.superclass.setMouseEnabled.call(this, bEnabled);
/*

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

*/
};

/**  Changes the shape to an outline shape format.  Used for legend
  *  markers that represent a hidden state for the associated series risers.
  *  @param {String} color Border color for hollow shape in format of #aarrggbb
  *  @param {number} strokeWidth Stroke width used for shapes that were transofrmed (optional)
  *  @override
  */
DvtCanvasMarker.prototype.setHollow = function(color, strokeWidth)
{
    DvtCanvasMarker.superclass.setHollow.call(this, color, strokeWidth);
};

/*
DvtSvgMarker.prototype._setCustomMarker = function(markerDef, x, y, w, h)
{
  var defImpl = markerDef.getImpl();
  var type = defImpl.getElem().nodeName;

  if (type == DvtCanvasMarker.MARKER_CIRCLE_ELEM_NAME ||
      type == DvtCanvasMarker.MARKER_ELLIPSE_ELEM_NAME) {
    this._setCx(markerDef.getCx());
    this._setCy(markerDef.getCy());
    this._setRadius(markerDef.getRadius());
  }

  else if (type == DvtCanvasMarker.MARKER_LINE_ELEM_NAME) {
    this._setX1(defImpl.getX1());
    this._setX2(defImpl.getX2());
    this._setY1(defImpl.getY1());
    this._setY2(defImpl.getY2());
  }
  else if (type == DvtCanvasMarker.MARKER_PATH_ELEM_NAME) {
    this._setCmds(defImpl._sCmds);
  }
  else if (type == DvtCanvasMarker.MARKER_POLYGON_ELEM_NAME) {
    this._setPoints(defImpl._sPoints);
  }
  else if (type == DvtCanvasMarker.MARKER_POLYLINE_ELEM_NAME) {
    this._setPoints(defImpl._sPoints);
  }
  else if (type == DvtCanvasMarker.MARKER_RECT_TYPE_ELEM_NAME) {
    this._setX(markerDef.getX());
    this._setY(markerDef.getY());
    this._setWidth(markerDef.getWidth());
    this._setHeight(markerDef.getHeight());
  }

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
    this.setStroke(stroke);
  }

} ;
*/

/**
 *   @private
 */
DvtCanvasMarker.prototype._setPoints = function(points)
{
   if (points !== this._points) {
     this._points  = points ;
   }
} ;

/**
 * @private
 */
DvtCanvasMarker.prototype._setX1 = function(x1)
{
   this._x1 = x1 ;
} ;

/**
 * @private
 */
DvtCanvasMarker.prototype._setY1 = function(y1)
{
   this._y1 = y1 ;
} ;

/**
 * @private
 */
DvtCanvasMarker.prototype._setX2 = function(x2)
{
   this._x2 = x2 ;
} ;

/**
 * @private
 */
DvtCanvasMarker.prototype._setY2 = function(y2)
{
   this._y2 = y2 ;
} ;



DvtCanvasMarker.prototype._isMultiPaths = function() {
//  return (this.getElem().nodeName == "g");     // JRM ToDo
return false;                                    // temp  

} ;

/**
 * @param {string} The image uri to set for the current marker state
 */
DvtCanvasMarker.prototype._setSrc = function(src) {
  if (src !== this._src)
    this._src = src;
};

DvtCanvasMarker.prototype.UpdateMarkerImage = function() {
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
// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*-------------------------------------------------------------------------*/
/*    DvtCanvasOval       Canvas implementation of base elliptical shape   */
/*-------------------------------------------------------------------------*/
/**
  *   Creates an elliptical shape implemented by Canvas.
  *   @extends DvtCanvasCircle
  *   @class  DvtCanvasOval Creates an elliptical shape implemented by Canvas. Do not create directly
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
var  DvtCanvasOval = function(cx, cy, rx, ry, id)
{
   this._Init(cx, cy, rx, ry, id) ;
};

DvtObj.createSubclass(DvtCanvasOval, DvtCanvasCircle, "DvtCanvasOval") ;



/*-------------------------------------------------------------------------*/
/*  _Init()                                                                */
/*-------------------------------------------------------------------------*/
/** @private */

DvtCanvasOval.prototype._Init = function(context, cx, cy, rx, ry, id)
{
   DvtCanvasOval.superclass._Init.call(this, context, cx, cy, rx, id, 'ellipse') ;

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
DvtCanvasOval.prototype.getRx = function()
{
   return this._rx ;
} ;

/**
  *  Sets the horizontal radii of the ellipse.
  *  @param {number} rx  The horizontal radius of the ellipse.
  */
DvtCanvasOval.prototype.setRx = function(rx)
{
   if (rx !== this._rx) {
     this._rx  = rx ;
   }
} ;


/*-------------------------------------------------------------------------*/
/*   get/setRy()                                                           */
/*-------------------------------------------------------------------------*/
/**
  *  Returns the vertical radius of the ellipse.
  *  @type number
  */
DvtCanvasOval.prototype.getRy = function()
{
   return this._ry ;
} ;

/**
  *  Sets the vertical radius of the ellipse.
  *  @param {number} ry  The vertical radius of the ellipse.
  */
DvtCanvasOval.prototype.setRy = function(ry)
{
   if (ry !== this._ry) {
     this._ry  = ry ;
   }
} ;


// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*---------------------------------------------------------------------*/
/*   DvtCanvasPath         Canvas implementation of DvtPath            */
/*---------------------------------------------------------------------*/
/**
  *   Creates a shape using SVG path commands implemented for Canvas.
  *   @extends DvtCanvasShape
  *   @class DvtCanvasPath  Creates a shape using Canvas path commands implemented for
  *   Canvas.  Do not create directly, use {@link DvtPath}.
  *   <p>Example:<br><br><code>
  *   var  path = new DvtPath(context, mycmds) ;<br>
  *   </code>
  *   @constructor  
  *   @param {Object} cmds  Optional string of SVG path commands (see comment for
  *                         {@link DvtPath#setCmds}),
  *                         or an array containing consecutive command and coordinate
  *                          entries (see comment for {@link DvtPath#setCommands}).
  *   @param {String} id  Optional ID for the shape (see {@link  DvtDisplayable#setId}).
  */
var  DvtCanvasPath = function(context, cmds, id)
{
   this._Init(context, cmds, id) ;
};

DvtObj.createSubclass(DvtCanvasPath, DvtCanvasShape, "DvtCanvasPath") ;

/*---------------------------------------------------------------------*/
/*   Init()                                                            */
/*---------------------------------------------------------------------*/
/** @private */
DvtCanvasPath.prototype._Init = function(context, cmds, id)
{
   DvtCanvasPath.superclass._Init.call(this, context, id, 'path') ;

   if (DvtArrayUtils.isArray(cmds)) {
     this.setCmds(DvtPathUtils.getPathString(cmds)) ;
   }
   else {
     this.setCmds(cmds) ;
   }
} ;


/*---------------------------------------------------------------------*/
/*    renderSelf()      Override of DvtCanvasDisplayable.renderSelf()  */
/*---------------------------------------------------------------------*/

DvtCanvasPath.prototype.RenderSelf = function()
{
  DvtCanvasPath.superclass.RenderSelf.call(this) ;

  var ctx    = this.getCtx() ;
  ctx.save() ;

  var action = this.applyDrawAttrs() ;            // apply base stroke, fill, shadow, etc
  if (action !== DvtCanvasDrawUtils.NOACTION) {

    ctx.beginPath() ;

    DvtCanvasDrawUtils.drawPath(ctx, this._aCmds) ;

    ctx.closePath() ;
    if (action & DvtCanvasDrawUtils.FILL) {
      ctx.fill() ;
    }
    if (action & DvtCanvasDrawUtils.STROKE) {
      if (this._shadow && (action & DvtCanvasDrawUtils.FILL)) {   // if we filled,
        ctx.shadowOffsetX  = 0;                                   // then turn off
        ctx.shadowOffsetY  = 0;                                   // the shadow
        ctx.shadowColor    = 'rgba(0,0,0,0)' ;                    // before stroking.
        ctx.shadowBlur     = 0 ;
      }
      ctx.stroke() ;
    }
  }

  ctx.restore() ;

};


/*---------------------------------------------------------------------*/
/*    get/setCmds()                                                    */
/*---------------------------------------------------------------------*/
/**
  *  Gets the path from a string of SVG commands in SVG "d" attribute format.
  *  @type {String} cmds A string containing the SVG command sequences.
  */
DvtCanvasPath.prototype.getCmds = function()
{
   return  DvtPathUtils.getPathString (this._aCmds) ;
} ;


/**
  *  Sets the path from a string of Canvas commands in SVG "d" attribute format.
  *  @param {String} cmds  A string containing the SVG command sequences.
  */
DvtCanvasPath.prototype.setCmds = function(sCmds)
{
   var ar = null ;

   if (sCmds)
     ar = DvtPathUtils.createPathArray(sCmds) ;    //  Unpack into an array of commands and coords.
   this._aCmds = ar ; 
} ;


/*---------------------------------------------------------------------*/
/*   get/setCommands()                                                 */
/*---------------------------------------------------------------------*/
/**
  *  Gets the array of consecutive SVG path command sequences supplied by
  *  the last setCommands().
  *  @type Array  An array of commands and coordinates.
  */
DvtCanvasPath.prototype.getCommands = function()
{
   var ar = this._aCmds ;
   if (! ar)  {
     if (this._sCmds) {
       ar = DvtPathUtils.createPathArray(this._sCmds) ;
       this._aCmds = ar ;
     } 
   }

  return ar ;
} ;

/**
  *  Sets the path from an array of consecutive SVG path
  *  command sequences. See also {@link DvtPath#setCmds}.
  *  @param {Array} ar  An array of commands and coordinates.
  */
DvtCanvasPath.prototype.setCommands = function(ar)
{
   this._aCmds = ar ;
   this._sCmds = this.getCmds() ;  
} ;



/**
 * @override
 */
DvtCanvasPath.prototype.setMatrix = function(mat) {
  DvtCanvasPath.superclass.setMatrix.call(this, mat);

  // Fix for bug 12622757
//  DvtSvgDocumentUtils.fixWebkitFilters(this.getOuterElem());
}

/**
 * @override
 */
DvtCanvasPath.prototype.setAlpha = function(alpha) {
  DvtCanvasPath.superclass.setAlpha.call(this, alpha);

  // Fix for bug 12622757
//  DvtSvgDocumentUtils.fixWebkitFilters(this.getOuterElem());
};

/**
 * @override
 */
DvtCanvasPath.prototype.setFill = function(obj) { 
  DvtCanvasPath.superclass.setFill.call(this, obj);

  // Fix for bug 12622757
//  DvtSvgDocumentUtils.fixWebkitFilters(this.getOuterElem());
};

/**
 * @override
 */
DvtCanvasPath.prototype.setStroke = function(obj) {
  DvtCanvasPath.superclass.setStroke.call(this, obj);

  // Fix for bug 12622757
//  DvtSvgDocumentUtils.fixWebkitFilters(this.getOuterElem());
};


// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*---------------------------------------------------------------------*/
/*   DvtCanvasPolygon    Canvas Implementation of Base Polygon shape   */
/*---------------------------------------------------------------------*/
/**
  *  Creates a polygon from an array of (x,y) coordinates.
  *  Canvas implementation for DvtPolygon which creates a shape of connected line segments.
  *  @extends DvtCanvasShape
  *  @class DvtCanvasPolygon
  *  @constructor  
  *  @param {Array} arPoints  An array of x, y pairs of coordinates.
  *  @param {String} id  Optional ID for the shape (see {@link  DvtDisplayable#setId}).
  */
var  DvtCanvasPolygon = function(context, arPoints, id)
{
   this._Init(context, arPoints, id) ;
};

DvtObj.createSubclass(DvtCanvasPolygon, DvtCanvasShape, "DvtCanvasPolygon") ;



/*---------------------------------------------------------------------*/
/*   _Init()                                                           */
/*---------------------------------------------------------------------*/
/** @private */
DvtCanvasPolygon.prototype._Init = function(context, arPoints, id)
{
   DvtCanvasPolygon.superclass._Init.call(this, context, id, 'polygon') ;

   this.setPoints(arPoints) ;
} ;


/*---------------------------------------------------------------------*/
/*   get/setPoints()            Gets/Sets the polygon points           */
/*---------------------------------------------------------------------*/

DvtCanvasPolygon.prototype.getPoints = function()
{
   return  this._arPoints ;
} ;

/**
  *   Sets the polygon points from an array of x,y coordinate pairs.
  *   @param {Array} arPoints  An array of x, y pairs of coordinates.
  */
DvtCanvasPolygon.prototype.setPoints = function(arPoints)
{
   this._arPoints = arPoints ;
} ;


/*---------------------------------------------------------------------*/
/*    renderSelf()     Override of DvtCanvasDisplayable.renderSelf()   */
/*---------------------------------------------------------------------*/

DvtCanvasPolygon.prototype.RenderSelf = function()
{
   DvtCanvasPolygon.superclass.RenderSelf.call(this) ;

   if (this._arPoints && this._arPoints.length  <= 2) {
     return ;
   }

   var ctx = this.getCtx() ;
   ctx.save() ;

   var action = this.applyDrawAttrs() ;   // apply base stroke, fill, shadow, etc
   if (action !== DvtCanvasDrawUtils.NOACTION) {

     ctx.beginPath() ;

     var stroke = this.getStroke() ;
     var arGaps = stroke? stroke.getDash() : null ;

     DvtCanvasDrawUtils.drawPolygon(ctx, this._arPoints, arGaps) ;

     ctx.closePath() ;

     if (action & DvtCanvasDrawUtils.FILL)
       ctx.fill() ;
     if (action & DvtCanvasDrawUtils.STROKE)
       ctx.stroke() ;
   }

   ctx.restore() ;
};
// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*--------------------------------------------------------------------*/
/*   DvtCanvasPolyline       Canvas Implementation of DvtPolyline     */
/*--------------------------------------------------------------------*/
/**
  * Canvas implementation for DvtPolyline which creates a series of joined
  * lines whose points are specified by an array of x,y pairs).
  * @extends DvtCanvasShape
  * @class DvtCanvasPolyline
  * @constructor  
  * @param {Array} arPoints  An array of point coordinates.
  * @param {String} id  Optional ID for the shape (see {@link  DvtDisplayable#setId}).
  * <p>
  * Example:<br><br><code
  * var points = [10,20,40,34,59,128, . . .] ;<br>
  * var polyline = new DvtPolyline(context, points);<br>
  *  </code>
  */
var DvtCanvasPolyline = function(context, arPoints, id)
{
   this._Init(context, arPoints, id) ;
};

DvtObj.createSubclass(DvtCanvasPolyline, DvtCanvasShape, "DvtCanvasPolyline") ;



/*--------------------------------------------------------------------*/
/*   _Init()                                                          */
/*--------------------------------------------------------------------*/

DvtCanvasPolyline.prototype._Init = function(context, arPoints, id)
{
   DvtCanvasPolyline.superclass._Init.call(this, context, id, 'polyline') ;

   this.setPoints(arPoints) ;

} ;


/*--------------------------------------------------------------------*/
/*   get/setPoints()            Gets/Sets the polygon points          */
/*--------------------------------------------------------------------*/

DvtCanvasPolyline.prototype.getPoints = function()
{
   return  this._arPoints ;
} ;


/*--------------------------------------------------------------------*/
/*    render()                                                        */
/*--------------------------------------------------------------------*/

/**
  *   Sets the polyline points from an array of x,y coordinate pairs.
  *   @param {Array} arPoints  An array of x, y pairs of coordinates.
  */
DvtCanvasPolyline.prototype.setPoints = function(arPoints)
{
   this._arPoints = arPoints ;
} ;


/*--------------------------------------------------------------------*/
/*   renderSelf()    Override of DvtCanvasDisplayable.renderSelf()    */
/*--------------------------------------------------------------------*/

DvtCanvasPolyline.prototype.RenderSelf = function()
{
   DvtCanvasPolyline.superclass.RenderSelf.call(this) ;

   if (! this._arPoints) { 
     return ;
   }
   var len = this._arPoints.length ;
   if (len <= 2) { 
     return ;
   }

   var ctx = this.getCtx() ;
   ctx.save() ;

   var action = this.applyDrawAttrs() ;   // apply base stroke, fill, shadow, etc
   if (action !== DvtCanvasDrawUtils.NOACTION) {

     var stroke = this.getStroke() ;
     var arGaps = stroke.getDash() ;
     ctx.beginPath() ;

     if (arGaps) {
       len-= 2 ;
       for (var i = 0; i < len; i += 2)  {
         DvtCanvasDrawUtils.drawDashedLine(ctx, this._arPoints[i],   this._arPoints[i+1],
                                                this._arPoints[i+2], this._arPoints[i+3], arGaps) ;
       }
     }
     else {
       ctx.moveTo(this._arPoints[0], this._arPoints[1]) ;
       for (var i = 2; i < len; i += 2) {
          ctx.lineTo(this._arPoints[i], this._arPoints[i+1]) ;
       }
     }

     if (action & DvtCanvasDrawUtils.FILL)
       ctx.fill() ;
     if (action & DvtCanvasDrawUtils.STROKE)
       ctx.stroke() ;
     ctx.closePath() ;
   }

   ctx.restore() ;
};

// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*---------------------------------------------------------------------*/
/*    DvtCanvasRect     Canvas implementation for base shape DvtRect   */
/*---------------------------------------------------------------------*/
/**
  *   Canvas implementation for DvtRect.
  *   @extends DvtCanvasShape
  *   @class DvtCanvasRect
  *   @constructor  
  *   May be specified as individual values or using a DvtRectangle object.
  *   <p>
  *   Example:<br><br><code>
  *   rect = new DvtRect(context, 10, 10, 50, 100) ; &nbsp; @nbsp;  or<br>
  *
  *   rect = new DvtRect(context, myRect) ;  &nbsp; &nbsp;  where myRect = new DvtRectangle(10, 10, 50, 100);<br>
  *   </code>
  */
var  DvtCanvasRect = function(context, x, y, w, h, id)
{
   this._Init(context, x, y, w, h, id) ;
};

DvtObj.createSubclass(DvtCanvasRect, DvtCanvasShape, "DvtCanvasRect") ;

DvtCanvasRect._cssAttrs = [ "background-color", "border-color", "border-width"];



/*---------------------------------------------------------------------*/
/*  Init()                                                             */
/*---------------------------------------------------------------------*/
/** @private */
DvtCanvasRect.prototype._Init = function(context, x, y, w, h, id)
{
   DvtCanvasRect.superclass._Init.call(this, context, id, 'rect') ;

   this.setX(x);
   this.setY(y);
   this.setWidth(w);
   this.setHeight(h);
} ;

/*---------------------------------------------------------------------*/
/*   get/setX()                                                        */
/*---------------------------------------------------------------------*/

DvtCanvasRect.prototype.getX = function()
{
   return this._x ;
} ;
DvtCanvasRect.prototype.setX = function(x)
{
   if (x !== this._x) {
     this._x  = x ;
   }
} ;


/*---------------------------------------------------------------------*/
/*   get/setY()                                                        */
/*---------------------------------------------------------------------*/

DvtCanvasRect.prototype.getY = function()
{
   return this._y ;
} ;
DvtCanvasRect.prototype.setY = function(y)
{
   if (y !== this._y) {
     this._y  = y ;
   }
} ;


/*---------------------------------------------------------------------*/
/*   get/setWidth()                                                    */
/*---------------------------------------------------------------------*/

DvtCanvasRect.prototype.getWidth = function()
{
   return this._w ;
} ;

/**
  *  Sets the width of the rectangle.
  *  @param {number} w  The width of the rectangle.
  */
DvtCanvasRect.prototype.setWidth = function(w)
{
   if (w !== this._w) {
     this._w  = w ;
   }
} ;

/*---------------------------------------------------------------------*/
/*   get/setHeight()                                                   */
/*---------------------------------------------------------------------*/
/**
  *  Returns the height of the rectangle.
  *  @type number
  */
DvtCanvasRect.prototype.getHeight = function()
{
   return  this._h ;
} ;

/**
  *  Sets the height of the rectangle.
  *  @param {number} h  The height of the rectangle.
  */
DvtCanvasRect.prototype.setHeight = function(h)
{
   if (h !== this._h) {
     this._h  = h ;
   }
} ;

/*---------------------------------------------------------------------*/
/*   get/setRx()                                                       */
/*---------------------------------------------------------------------*/

DvtCanvasRect.prototype.getRx = function()
{
   return this._rx ;
} ;
DvtCanvasRect.prototype.setRx = function(rx)
{
   if (rx !== this._rx) {
     this._rx  = rx ;
   }
} ;

/*---------------------------------------------------------------------*/
/*   get/setRy()                                                       */
/*---------------------------------------------------------------------*/

DvtCanvasRect.prototype.getRy = function()
{
   return this._ry ;
} ;
DvtCanvasRect.prototype.setRy = function(ry)
{
   if (ry !== this._ry) {
     this._ry  = ry ;
   }
} ;

/**
 * Sets the DvtCSSStyle of this object.
 * @param {DvtCssStyle} style The DvtCSSStyle of this object.
 */
DvtCanvasRect.prototype.setCSSStyle = function(style)
{
  DvtCanvasRect.superclass.setCSSStyle.call(this, style);
  
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
  }
  else
  {
    this._elem.removeAttributeNS(null, "style");
  }
};

DvtCanvasRect._removeDefaultAttributes = function(elem)
{
//  elem.removeAttributeNS(null,"fill");
//  elem.removeAttributeNS(null,"stroke");
//  elem.removeAttributeNS(null,"stroke-width");
};


/*---------------------------------------------------------------------*/
/*   renderself()     Override of DvtCanvasDisplayable.renderSelf()    */
/*---------------------------------------------------------------------*/

DvtCanvasRect.prototype.RenderSelf = function()
{
   DvtCanvasRect.superclass.RenderSelf.call(this) ;

   var ctx    = this.getCtx() ;
   var stroke = this.getStroke() ;
   var aGaps  = stroke? stroke.getDash() : null ;

   ctx.save() ;

   var action = this.applyDrawAttrs() ;   // apply base stroke, fill, shadow, etc

   if (action !== DvtCanvasDrawUtils.NOACTION) {

     ctx.beginPath() ;
     DvtCanvasDrawUtils.drawRect(ctx, this._x, this._y, this._w, this._h, this._rx, this._ry, aGaps) ;
     ctx.closePath() ;

     if (this._rx)
     {
        if (action & DvtCanvasDrawUtils.FILL)       // see DvtCanvasDrawUtils.drawRect 
          ctx.fill() ;                              // re- antialiasing.
     }
     if (action & DvtCanvasDrawUtils.STROKE)
       ctx.stroke() ;
   }

   ctx.restore() ;
};

// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*---------------------------------------------------------------------*/
/*   DvtCanvasText         Canvas implementation of text "shape"       */
/*---------------------------------------------------------------------*/
/**
 * Creates an instance of DvtCanvasText.
 * @class DvtCanvasText
 * @extends DvtCanvasShape
 * @constructor
 * @param textStr {string} the text string
 * @param x {number} x the x position
 * @param y {number} y the y position
 * @param {String} id  Optional ID for the shape (see {@link  DvtDisplayable#setId}).
 */
var  DvtCanvasText = function(context, textStr, x, y, id)
{
  this._Init(context, textStr, x, y, id) ;
};

DvtObj.createSubclass(DvtCanvasText, DvtCanvasShape, "DvtCanvasText") ;


/**
 * Initializes this instance of DvtText.
 * @param textStr {string} the text string
 * @param x {number} x the x position
 * @param y {number} y the y position
 * @param id {string} the id for this object
 */
DvtCanvasText.prototype._Init = function(context, textStr, x, y, id)
{
  DvtCanvasText.superclass._Init.call(this, context, id, 'text') ;
  
  this.setTextString(textStr);
  this.setX(x);
  this.setY(y);
  this._angle = 0 ;
  this.setFontFamily('tahoma, sans-serif') ;

  this.setCursor("default"); 
} ;

/**
 * Returns the text string for this text object.
 * @return {string} the text string
 */ 
DvtCanvasText.prototype.getTextString = function() {

  return this._text ;
} ;

/**
 * Sets the text string for this text object.
 * @param {string} textStr the text string
 */
DvtCanvasText.prototype.setTextString = function(textStr)
{
  this._text = '' + textStr ;     // amx can send a raw float
} ;


/**
 * Returns the text angle in degrees. See also {@link DvtCanvasText#setRotatePoint}.
 * @returns {number} the text angle indegrees. Positive angle rotate counter-clockwise.
 */
DvtCanvasText.prototype.getAngle = function()
{
   return  this._angle ;
}; 


/**
 * Sets the text angle. See also {@link DvtCanvasText#setRotatePoint}.
 * @param {number} a the angle in degrees. Positive angle rotate counter-clockwise.
 */
DvtCanvasText.prototype.setAngle = function(a)
{
   a = (a % 360) ;
   if (a > 0) {
     a  = 360 - a ;
   }

   if (this._angle !== a) {
     this._angle = a ;
   }
}; 


/**
 * Gets the rotation point for angled text (see {@link DvtCanvasText#setAngle}).
 * @returns {DvtPoint} the coordinates of the point of rotation for angle text.
 */
DvtCanvasText.prototype.getRotatePoint = function()
{
   var pt ;
   if (this._cx) {
     pt = new DvtPoint(this._cx, this._cy) ;
   }
   return pt ;
}; 


/**
 * Sets the rotation point for angle text (see {@link DvtCanvasText#setAngle}).
 * @param {number} cx the rotation point x-coordinate.
 * @param {number} cy the rotation point y-coordinate.
 */
DvtCanvasText.prototype.setRotatePoint = function(cx, cy)
{
  this._cx = cx ;
  this._cy = cy ;
}; 


/**
 * Gets the x position for this text object.
 * @returns {number}  the x position
 */
DvtCanvasText.prototype.getX = function()
{
  return  this._x ;
};

/**
 * Sets the x position for this text object.
 * @param {number} x the x position
 */
DvtCanvasText.prototype.setX = function(x)
{
  if (x !== this._x) {
    this._x  = x ;
  }
}; 

/**
 * Gets the y position for this text object.
 * @returns {number}  the y position
 */
DvtCanvasText.prototype.getY = function()
{
  return  this._y ;
};
/**
 * Sets the y position for this text object.
 * @param {number} y the y position
 */
DvtCanvasText.prototype.setY = function(y)
{
  if (y !== this._y) {
    this._y  = y ;
  }
};


DvtCanvasText.prototype.getAnchor = function()
{
   return this._anchor ;
};
DvtCanvasText.prototype.getBaseline = function()
{
   return this._baseline ;
};


/**
 * Gets the font family.
 * @returns {string} the font family.
 */
DvtCanvasText.prototype.getFontFamily = function()
{
  return this._fontFamily ;
};

/**
 * Sets the font family.
 * @param {fontFamily} fontFamily the font family.
 */
DvtCanvasText.prototype.setFontFamily = function(fontFamily)
{
  var style = this.getCSSStyle() ;
  if (style) {
    style.setFontFamily(fontFamily) ;
  }
  this._fontFamily = fontFamily;
};


/**
 * Sets the font size.
 * @param {number} fontSize the font size
 */
DvtCanvasText.prototype.setFontSize = function(fontSize)
{
  this._fontSize = fontSize ;
  var style = this.getCSSStyle() ;
  if (style) {
    style.setFontSize(fontSize) ;
  } 
};

// TODO JSDOC Not sure how to expose these, so this is temporary
DvtCanvasText.prototype.alignStart = function() {
  this._anchor = 'start';
};

// TODO JSDOC Not sure how to expose these, so this is temporary
DvtCanvasText.prototype.alignMiddle = function() {
  this._anchor = 'center';
};

// TODO JSDOC Not sure how to expose these, so this is temporary
DvtCanvasText.prototype.alignEnd = function() {
  this._anchor = 'right';
};

// TODO JSDOC Not sure how to expose these, so this is temporary
DvtCanvasText.prototype.alignTop = function() {
  this._baseLine = 'top';
};

// TODO JSDOC Not sure how to expose these, so this is temporary
DvtCanvasText.prototype.alignCenter = function() {
  this._baseLine = 'middle';
};

// TODO JSDOC Not sure how to expose these, so this is temporary
DvtCanvasText.prototype.alignBottom = function() {
//  this._baseLine = 'bottom';
  this._baseLine = 'alphabetic';
};

// TODO JSDOC Not sure how to expose these, so this is temporary
DvtCanvasText.prototype.alignBaseline = function() {
  this._baseLine = undefined ;
};

/**
 * Sets the text string for this text object.
 * @param {string} text the text string
 */
DvtCanvasText.prototype.setText = function(text) {
  this._text = '' + text ;   // amx can send raw floats

/*
  // Update the text node if it is already created
  var textNode = this.getElem().firstChild;
  if(textNode !== null) {
    textNode.nodeValue = text;
  }
  else { // Otherwise create it
    textNode = document.createTextNode(text);
    this.getElem().appendChild(textNode);
  }
*/
};

/**
 * @return the text string for this text object.
 */
DvtCanvasText.prototype.getText = function() {
  return this._text ;
//  var textNode = this.getElem().firstChild;
//  if(textNode) {
//    return textNode.nodeValue;
//  }
};

/**
 * Sets the DvtCSSStyle of this object.
 * @param {DvtCssStyle} style The DvtCSSStyle of this object.
 */
DvtCanvasText.prototype.setCSSStyle = function(style)
{
  DvtCanvasText.superclass.setCSSStyle.call(this, style);

  if (style) {
    if (style.color) {
      this.setFill(new DvtSolidFill(style.color)) ;
    }
    val = style["font-family"];
    if (val) {
      this._fontFamily =  val;
    }
    else if (this._fontFamily) {
      style.setCSSStyle("font-family", this._fontFamily) ;
    }
    val = style["font-size"];
    if (val) {
      this._fontSize = val ;
    }
    val = style["font-style"];
    if (val) {
      this._fontStyle = val ;
    }
    val = style["font-weight"];
    if (val) {
      this._fontWeight = val ;
    }
    val = style["text-align"];
    if (val) {
      this._textAlign = val ;
    }
    val = style["text-decoration"];
    if (val) {
      this._text_decoration = val ;
    }
    color = style.color;
  }
};


//  Edit mode functions not applicable to Canvas
DvtCanvasText.prototype.getEditMode    = function() { return null ;};
DvtCanvasText.prototype.setEditMode    = function() {};
DvtCanvasText.prototype.getEditWdith   = function() { return 0;};
DvtCanvasText.prototype.setEditWidth   = function() {};
DvtCanvasText.prototype.setEditTooltip = function() {};

/**
 * @private
 * Remove the default font attributes that are set in the constructor
 * Used the font attributes in the DvtCSSStyle instead
 * @param {DvtCssStyle} style The DvtCSSStyle of this object.
 */
/*
DvtSvgText.prototype._removeDefaultFontAttributes = function(elem)
{
  elem.removeAttributeNS(null,"font-family");
  elem.removeAttributeNS(null,"fill");
};
*/

/*
DvtSvgText.prototype._createTSpan = function(text) {
  var tspan  = DvtSvgShapeUtils.createElement('tspan', undefined);
  this.getElem().appendChild(tspan);

  var baseline = this.getElem().getAttributeNS(null,'dominant-baseline');
  if (baseline)
      tspan.setAttributeNS(null,"dominant-baseline",baseline);
  var anchor = this.getElem().getAttributeNS(null,'text-anchor');
  if (anchor)
      tspan.setAttributeNS(null,"text-anchor",anchor);
  
  // add text node
  DvtSvgText._addTextNode(tspan, text);
  return tspan;
};
*/

/*
DvtSvgText.prototype._createTextNode = function(text) {
  DvtSvgText._addTextNode(this.getElem(), text);
};
*/
/*
DvtSvgText._addTextNode = function(elem, text) {
  var textNode = document.createTextNode(text);
  elem.appendChild(textNode);
};
*/


/*---------------------------------------------------------------------*/
/*   renderSelf()     Override of DvtCanvasDisplayable.renderSelf()    */
/*---------------------------------------------------------------------*/

DvtCanvasText.prototype.RenderSelf = function()
{
   DvtCanvasText.superclass.RenderSelf.call(this) ;

   var ctx  = this.getCtx() ;
   ctx.save() ;

   var action = this.applyDrawAttrs() ;   // apply base stroke, fill, shadow, etc
//   if (action !== DvtCanvasDrawUtils.NOACTION) {
     ctx.beginPath() ;

     DvtCanvasDrawUtils.drawText(ctx, this._text, this._x, this._y, this._angle, this._cx, this._cy,
                                 this._fontFamily, this._fontSize,  this._fontStyle,
                                 this._fontWeight, this._baseLine, this._anchor) ;
     ctx.closePath() ;

     if (action & DvtCanvasDrawUtils.FILL)
       ctx.fill() ;
     if (action & DvtCanvasDrawUtils.STROKE)
       ctx.stroke() ;
//   }

   ctx.restore() ;
};
// Copyright (c) 2011, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*-------------------------------------------------------------------------*/
/*   DvtCanvasTextArea      Canvas implementation of textArea "shape"      */
/*-------------------------------------------------------------------------*/


//  PLACEHOLDER - not usable yet.


/**
 * @constructor
  * Creates an instance of DvtCanvasTextArea.
  * @extends DvtCanvasShape
  * @class DvtCanvasTextArea
  * @param {String} id  Optional ID for the shape (see {@link  DvtDisplayable#setId}).
 */
var DvtCanvasTextArea = function(context, x, y, id) {

  this._Init.call(this, context, x, y, id) ;  

};

DvtObj.createSubclass(DvtCanvasTextArea, DvtCanvasText, "DvtCanvasTextArea") ;


/**
 * Initializes this instance of DvtTextArea.
 * @param text {string} the text string
 * @param x {number} x the x position
 * @param y {number} y the y position
 * @param id {string} the id for this object
 */
DvtCanvasTextArea.prototype._Init = function(context, x, y, id) {

  //remove this if graph is ok with the text alignment changes
  if (x === undefined && y === undefined) {
    x = 0;
    y = 0;
    this._notGraph = true;
  }

  DvtCanvasTextArea.superclass._Init.call(this, context, "", x, y, id) ;  
  
  // the adjustment to the amount of space between lines
  this._leading = 0;
};


/**
 * Sets the text string for this textArea object.
 * @param {array} single line text or multiline text
 */
DvtCanvasTextArea.prototype.setText = function(multilines) {

  var singleLine;
  var lines = 1 ;

  if (DvtArrayUtils.isArray(multilines)) {
    lines = multilines.length ;
    if (lines == 1)
      singleLine = multilines[0];
  }
  else {
    singleLine = multilines;
  }

  // clear the old text
  var obj = this.getObj();

  if (obj.getNumChildren() === 0 && singleLine) {
      DvtCanvasTextArea.superclass.setText.call(this, singleLine) ;
  }
  else {
      var i ;
      var style ;
      var fill ;
      var x, y ;
      var h ;

      for (i = 0; i < lines; i++) {
        if (i === 0) {
          DvtCanvasTextArea.superclass.setText.call(this, multilines[0]) ;
          style = obj.getCSSStyle() ;
          fill  = obj.getFill() ;
          x     = obj.getX() ;
          y     = obj.getY() ;
          h     = obj.getDimensions().h ;
        }
        else {
         y += h ;
         var text = new DvtText(obj.getContext(), multilines[i], x, y) ;
         text.setCSSStyle(style) ;
         text.setFill(fill) ;

         obj.addChild(text) ;
        }



      }

/*

    // create a child group node
    var x = elem.getAttributeNS(null,'x');
    var y = parseFloat(elem.getAttributeNS(null,'y'));

    if (singleLine) {
      this._addLine(obj, singleLine, x, y);
    }
    else {
      // apply text-align on multi-line text 
      var textAlign = this._getTextAlign();
      if (textAlign == "end") {
        x = obj._getMaxTextWidth();
      }
      else if (textAlign == "middle") {
        x += obj._getMaxTextWidth() / 2;
      }
      y = 0;
      for (var i = 0; i < multilines.length; i++) {
        if (DvtStyleUtils.isLocaleR2L() || textAlign) {
          this._addTextLine(obj, multilines[i], x, y*i, textAlign);
        }
        //peformance: don't getDimensions for each line
        else {
          this._addLine(obj, multilines[i], x, y);
        }
        if (i == 0) {
          y = obj._getMaxTextHeight();
          if (! y) {
            y = this.getDimensions().h;
          }
        }
      }
    }
  }
*/


/*
    // create a child group node
    var x = elem.getAttributeNS(null,'x');
    var y = parseFloat(elem.getAttributeNS(null,'y'));

    if (singleLine) {
      this._addLine(obj, singleLine, x, y);
    }
    else {
      y = 0;
      for (var i = 0; i < multilines.length; i++) {
        //peformance: don't getDimensions for each line
        this._addLine(obj, multilines[i], x, y);
        if (i == 0) {
          y = obj._getMaxTextHeight();
          if (! y) {
            y = this.getDimensions().h;
          }
        }
      }
    }
*/
  }
};


/**
 * Gets the text string for this textArea object.
 * @param {string} text the text string
 */
DvtCanvasTextArea.prototype.getText = function() {
  var obj = this.getObj();
  var nkids = obj.getNumChildren();

  if (nkids == 0) {
    return DvtCanvasTextArea.superclass.getText.call(this);
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
DvtCanvasTextArea.prototype.getLeading = function() {
  return this._leading;
};

/**
 * Sets the amount of vertical space, in pixels, between lines
 * @param {number} leading amount of vertical space, in pixels, between lines
 */
DvtCanvasTextArea.prototype.setLeading = function(leading) {
  this._leading = leading;
};

// add a text line
DvtCanvasTextArea.prototype._addLine = function(obj, newLineText, x, dy) {
  var newText = this._createTSpan(newLineText);
  newText.setAttributeNS(null,'x', x);
  newText.setAttributeNS(null,'dy', dy + this.getLeading());

  // peformance: dont getDimensions for each line
//   return this.getDimensions().h;
};



// add a text line
DvtCanvasTextArea.prototype._addTextLine = function(obj, newLineText, x, dy, textAlign) {
  var newText = new DvtSvgText(newLineText, x, dy, null);
  var textNode = this.getElem().firstChild;
  
  if (textNode == null){
      textNode = this.getElem();
  }
  var attr = textNode.getAttributeNS(null,'dominant-baseline');
  if (attr)
      newText.getElem().setAttributeNS(null,"dominant-baseline",attr);

  attr = textAlign ? textAlign : textNode.getAttributeNS(null,'text-anchor');
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
  attr = textNode.getAttributeNS(null,'unicode-bidi');
  if (attr && DvtStyleUtils.isLocaleR2L())
    newText.getElem().setAttributeNS(null,"unicode-bidi", attr);

  this.addChild(newText);
}

// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*---------------------------------------------------------------------*/
/*    DvtCanvasDrawUtils      Miscellaneous static routines for draw   */
/*                            related operations on a Canvas context.  */
/*---------------------------------------------------------------------*/

/**
  *  Miscellaneous static routines for draw related operations on a Canvas 2d context.
  */
var DvtCanvasDrawUtils = {};

DvtObj.createSubclass(DvtCanvasDrawUtils, DvtObj, "DvtCanvasDrawUtils");

/**
  *  Resulting action codes for {@link DvtCanvasDrawUtils#applyDrawAttrs}.
  */ 
DvtCanvasDrawUtils.NOACTION  = 0 ;      // nothing was applied to the canvas context
DvtCanvasDrawUtils.FILL      = 1 ;      // the canvas context had fill attributes applied
DvtCanvasDrawUtils.STROKE    = 2 ;      // the canvas context had stroke attributes applied.


/**
  *  Applies a clipping rectangle to the canvas context.
  *  @param {context}     ctx   a canvas context.
  *  @param {DvtClipPath} clip  the clipping region object.
  */ 
DvtCanvasDrawUtils.applyClipRegion = function(ctx, clip)
{
   //  Note: Canvas only supports rectangles

   var  regions = clip._regions ;
   var  region ;

   if (regions) {
     if (! DvtArrayUtils.isArray(regions)) {
       region = regions ;
     }
     else {
       var len    = regions.length ;
       var region ;
       for (var i = 0; i < len; i++) {
          region = regions[i] ;
          if (region.type === DvtClipPath.RECT) {
            break ;                                    // stop on first rectangle
          }
       }
     }

     if (region && region.type === DvtClipPath.RECT) {
       ctx.rect(region.x, region.y, region.w, region.h) ;
       ctx.clip() ;
     }
   }

};

/**
  *  Applies drawing attributes such as stroke, fill, shadow, etc to a Canvas context.
  *  @param {context} ctx a canvas context.
  *  @param {DvtCanvasDisplayable} obj  the implementation object whose drawing attributes are to be used.
  *  @returns {number}  the resulting action taken (e.g. {@link DvtCanvasDrawUtils#FILL}).
  */ 
DvtCanvasDrawUtils.applyDrawAttrs = function(ctx, obj)
{
   var fill ;
   var stroke ;
   var action = DvtCanvasDrawUtils.NOACTION ;

   if (obj.getFill) {
     fill  = obj.getFill() ;
   }
   if (obj.getStroke) {
     stroke = obj.getStroke() ;
   }

   if (fill || stroke) {
     action = DvtCanvasDrawUtils.applyFill(ctx, fill, obj) | DvtCanvasDrawUtils.applyStroke(ctx, stroke) ;
   }

   if (obj._shadow)  {
     var shad           = obj._shadow ;
     ctx.shadowOffsetX  = shad._distance * 0.7;   
     ctx.shadowOffsetY  = shad._distance * 0.7;   
     ctx.shadowBlur     = shad._blurX * 1.2;          // not using blurY
     ctx.shadowColor    = shad._rgba ;
   }

   return action ;
};


/*---------------------------------------------------------------------*/
/*   _applyFill()                                                      */
/*---------------------------------------------------------------------*/
/**
  *   @param {DvtCanvasDisplayable}  optional displayable implementation.
  */
DvtCanvasDrawUtils.applyFill = function(ctx, fill, obj)
{
   if (! fill) {
     ctx.fillStyle = 'rgba(0,0,0,0)' ;
     return DvtCanvasDrawUtils.NOACTION ;
   }   

   if (fill instanceof DvtSolidFill) {
     var  fc, fa ;

     fc = fill.getColor() ;
     if (fc === 'none') {
       ctx.fillStyle = 'rgba(0,0,0,0)' ;    // set zero alpha so shape draws can recognize no fill       
       return DvtCanvasDrawUtils.NOACTION ;
     }
     fa = fill.getAlpha() ;

     var colorAlpha = DvtColorUtils.getAlpha(fc) ;
     if (fa !== colorAlpha) {
       if (! DvtColorUtils.isColor(fc, false)) {        // if a defined color such as 'yellow"
         fc = DvtColorUtils.getColorFromName(fc) ;      // convert to #rrggbb.
       }
       fc = DvtColorUtils.setAlpha(fc, fa * colorAlpha) ;
     }
     ctx.fillStyle = fc ;
   }
   else if (fill instanceof DvtGradientFill) {
     DvtCanvasDrawUtils._applyGradientFill(ctx, fill, obj) ;
   }
   else {
     ctx.fillStyle = 'rgba(0,0,0,0)' ;
   }

   return DvtCanvasDrawUtils.FILL ;
};



/*---------------------------------------------------------------------*/
/*   _applyStroke()                                                    */
/*---------------------------------------------------------------------*/

DvtCanvasDrawUtils.applyStroke = function(ctx, stroke)
{
   var action = DvtCanvasDrawUtils.NOACTION

   if (stroke instanceof DvtSolidStroke) {
     ctx.lineWidth   = stroke.getWidth() ;

     var fc         = stroke.getColor() ;
     var fa         = stroke.getAlpha() ;
     var colorAlpha = DvtColorUtils.getAlpha(fc) ;
     if (fa !== colorAlpha) {
       if (! DvtColorUtils.isColor(fc, false)) {        // if a defined color such as 'yellow"
         fc = DvtColorUtils.getColorFromName(fc) ;      // convert to #rrggbb.
       }
       fc = DvtColorUtils.setAlpha(fc, fa * colorAlpha) ;
     }
     ctx.strokeStyle = fc ;

     var attrib = stroke.getLineEnd() ;
     if (! attrib) {
       attrib = DvtStroke.SQUARE ;
     }
     ctx.lineEnd = attrib ;

     attrib = stroke.getLineJoin() ;
     if (attrib) {
       if (attrib === DvtStroke.SQUARE) {      // canvas doesn't support square joins
         attrib = null ;
       }
       if (attrib) {
         ctx.lineJoin = attrib ;
       }
     }
     action = DvtCanvasDrawUtils.STROKE ;
   }

   return action ;
};


/*---------------------------------------------------------------------*/
/*   _applyGradientFill()                                              */
/*---------------------------------------------------------------------*/

DvtCanvasDrawUtils._applyGradientFill = function(ctx, fill, obj)
{
   var grad ;
   var arColors  = fill.getColors() ;
   var arAlphas  = fill.getAlphas() ;
   var arStops   = fill.getStops() ;
   var arBounds  = fill.getBounds() ;
   var w         = arBounds? arBounds[2] : 0 ;
   var h         = arBounds? arBounds[3] : 0 ;

   if (fill instanceof DvtLinearGradientFill) {

      angle  = (Math.floor(fill.getAngle() + 360)) % 360 ;   // get integer +ve angle in domain 0 <= angle <= 360.
      if ((angle % 90) === 0) {
        if (angle === 0) {           // left to right
          grad  = ctx.createLinearGradient(arBounds[0], arBounds[1], arBounds[0] + w, arBounds[1]) ;
        }
        else if (angle == 90) {     // up
          grad  = ctx.createLinearGradient(arBounds[0], arBounds[1] + h, arBounds[0], arBounds[1]) ;
        }
        else if (angle === 180) {   // right to left
          grad  = ctx.createLinearGradient(arBounds[0] + w, arBounds[1], arBounds[0], arBounds[1]) ;
        }
        else if (angle === 270) {   // down
          grad  = ctx.createLinearGradient(arBounds[0], arBounds[1], arBounds[0], arBounds[1] + h) ;
        }
      }
      else {

        //  Angle not a multiple of 90 degrees.  Need to compute the line segment giving
        //  direction and gradient coverage.

        var q1 = (angle < 90) ;                     // Convert 3rd and 4th quadrant angles to first 
        var q2 = (angle > 90  && angle < 180) ;     // or second quadrant angle for easier calcs.
        var q3 = (angle > 180 && angle < 270) ;     // Will swap the direction of the line segment
        var q4 = (angle > 270 && angle < 360) ;     // end-points to get correct direction.

        if (q3 || q4) {
          angle -= 180 ;
        }

        //  Switch to standard cartesian coords with bottomleft of bounding
        //  rect at the orgin (and upwards for incrementing y) for simpler calculations.

        var w    = arBounds[2] ;      // bottom left of bbox is (0,0), top right is (w,h)
        var h    = arBounds[3] ;
        var tan  = Math.tan(angle * DvtMath.RADS_PER_DEGREE) ;

        //  Compute the (x,y) intersection of the angle line and its normal that passes
        //  through the top left or right corner. 
        //
        //  1st quadrant angle             2nd quadrant angle
        //
        //  x  =  w - htan(angle)          x  =  htan(angle) + wtan^2(angle)
        //        -----------------              -----------------
        //        1 + tan^2(angle)                1 + tan^2(angle)
        //
        //  y  =  xtan(angle)              y  =  (x-w)tan(angle)

        var x ;      // intersection in
        var y ;      // cartesian coords. 

        if (q1 || q3) {
          x = (w + (h * tan))/(1 + (tan * tan)) ;
          y = (x * tan) ;
        }
        else {
          x = ((h * tan) + (w * tan * tan)) / (1 + (tan * tan)) ;
          y = (tan * (x - w)) ;
        }

        //  Convert (x,y) intersection back to canvas coords.

        x += arBounds[0] ;
        y = arBounds[1] + h - y ;

        if (q1)
          grad  = ctx.createLinearGradient(arBounds[0], arBounds[1] + h, x, y) ;
        else if (q3)
          grad  = ctx.createLinearGradient(x, y, arBounds[0], arBounds[1] +h) ;
        else if (q2)
          grad  = ctx.createLinearGradient(arBounds[0] + w, arBounds[1] + h, x, y) ;
        else if (q4)
          grad  = ctx.createLinearGradient(x, y, arBounds[0] + w, arBounds[1] + h) ;
     }
   }
   else if (fill instanceof DvtRadialGradientFill) {

     if (fill.getCx()) {
       grad = ctx.createRadialGradient(fill.getCx(), fill.getCy(), 0,
                                       fill.getCx(), fill.getCy(), fill.getRadius()) ;
     }
     else {

       //  AMX can send a radial gradient that has no cx, cy, or radius!

       var bbox ;
       if ((! arBounds) || (arBounds && arBounds[2] === 0 && arBounds[3] === 0)) {
           bbox = obj.getDimensions() ;
       }
       else {
         bbox = new DvtRectangle(arBounds[0], arBounds[1], arBounds[2], arBounds[3]) ;
       }
       var w = bbox.w ;
       var h = bbox.h ;
       var r = Math.max(w, h)/2 ;
       w = w/2 ;
       h = h/2 ;
       grad = ctx.createRadialGradient(bbox.x + w, bbox.y + h, 0,
                                       bbox.x + w, bbox.y + h, r) ;
     }
   }

   //  Finally apply the stops colors and alphas.

   if (grad) {
     var len = arStops.length ;

     for (var i = 0; i < len; i++) {
       grad.addColorStop(arStops[i], DvtColorUtils.setAlpha(arColors[i], arAlphas[i])) ;
     }
     ctx.fillStyle = grad ;
   }
};



DvtCanvasDrawUtils.drawDashedLine = function(ctx, x1, y1, x2, y2, arGaps)
{
   arGaps = arGaps.split(',') ;
   DvtArrayUtils.toFloat(arGaps) ;

   var gaplen  = arGaps.length;
   var dx      = x2 - x1 ;
   var dy      = y2 - y1 ;
   var slope   = dy/dx ;
   var lenleft = Math.sqrt( dx*dx + dy*dy );
   var i       = 0
   var bLineTo = true;

   ctx.moveTo(x1, y1);
   while (lenleft >= 0.1) {

     var dashlen = arGaps[i % gaplen];

     if (dashlen > lenleft) {
       dashlen = lenleft;
     }

     var xStep = Math.sqrt( dashlen * dashlen / (1 + slope *slope) );
     x1 += xStep
     y1 += slope*xStep;
     if (bLineTo)
       ctx.lineTo(x1, y1) ;
     else
       ctx.moveTo(x1, y1) ;

     lenleft -= dashlen;
     bLineTo = ! bLineTo;
     i++ ;
   }
};


/*---------------------------------------------------------------------*/
/*   drawArc()                                                         */
/*---------------------------------------------------------------------*/

DvtCanvasDrawUtils.drawArc = function(ctx, cx, cy, rx, ry, angStart, angExtent, closure)
{
   var ctxPushed = false ;

   ry = (ry === null || isNaN(ry)) ? 0 : ry;            //  If elliptical, scale the y axis of the circle
   if (rx !== ry) {
     ctx.save()
     ctxPushed = true ;

     var  scaleY = (ry/rx);
     ctx.scale(1, scaleY);
     cy = (cy / scaleY) ;
   }

   angStart  = - angStart ;                   // +ve canvas angles
   angExtent = - angExtent ;                  // go clockwise
   angStart  *= DvtMath.RADS_PER_DEGREE ;
   angExtent *= DvtMath.RADS_PER_DEGREE ;

   ctx.arc(cx, cy, rx, angStart, angStart + angExtent, ((angStart + angExtent) < angStart)) ;

   if (closure) {
     if (closure === DvtArc.CHORD) {
     }
     else if (closure === DvtArc.PIE) {
       ctx.lineTo(cx, cy) ;                    // closePath will add the other pie line
     }
   }

  if (ctxPushed) {
    ctx.restore() ;          // pop the state
  }

};


/*---------------------------------------------------------------------*/
/*  drawEllipse()                                                      */
/*---------------------------------------------------------------------*/

DvtCanvasDrawUtils.drawEllipse = function(ctx, cx, cy, rx, ry)
{
   var ctxPushed = false ;

   ry = (ry === null || isNaN(ry)) ? 0 : ry;            //  If elliptical, scale the y axis of the circle
   if (ry > 0) {
     ctx.save()
     ctxPushed = true ;

     var  scaleY = (ry/rx);
     ctx.scale(1, scaleY);
     cy = (cy / scaleY) ;
   }

   ctx.arc(cx, cy, rx, 0, Math.PI * 2, false) ;

   if (ctxPushed) {
     ctx.restore() ;          // pop the state
   }
};



DvtCanvasDrawUtils.continueLine = function (ctx, x1, y1, x2, y2, aGaps)
{
   var xPos    = x1 ;
   var yPos    = y1 ;  
   var bVert   = ((yPos !== y2) && (xPos === x2)) ;
   var bHoriz  = ((xPos !== x2) && (yPos === y2)) ;
   var bAngled = (! (bVert && bHoriz)) ;
   var xFactor = 0 ;
   var yFactor = 0 ;

   if (bVert) {                        // adjust the perpendicular
     xFactor = 0.5 ;
   }                                   // or
   else if (bHoriz) {
     yFactor = 0.5 ;                   // horizontal factor
   }
   xPos += xFactor ;
   yPos += yFactor ;

   if (aGaps) {
      DvtCanvasDrawUtils.drawDashedLine(ctx, x1, y1, x2, y2, aGaps) ;
   }
   else  {
     ctx.lineTo((xFactor + x2), (yFactor + y2)) ;
   }
};



/*---------------------------------------------------------------------*/
/*  drawLine()                                                         */
/*---------------------------------------------------------------------*/

DvtCanvasDrawUtils.drawLine = function (ctx, x1, y1, x2, y2, aGaps)
{
   var xPos    = x1 ;
   var yPos    = y1 ;  
   var bVert   = ((yPos !== y2) && (xPos === x2)) ;
   var bHoriz  = ((xPos !== x2) && (yPos === y2)) ;
   var bAngled = (! (bVert && bHoriz)) ;
   var xFactor = 0 ;
   var yFactor = 0 ;

   if (bVert) {                        // adjust the perpendicular
     xFactor = 0.5 ;
   }                                   // or
   else if (bHoriz) {
     yFactor = 0.5 ;                   // horizontal factor
   }
   xPos += xFactor ;
   yPos += yFactor ;

   if (aGaps) {
      DvtCanvasDrawUtils.drawDashedLine(ctx, x1, y1, x2, y2, aGaps) ;
   }
   else  {
     ctx.moveTo(xPos, yPos) ;
     ctx.lineTo((xFactor + x2), (yFactor + y2)) ;
   }
};



/*---------------------------------------------------------------------*/
/*  drawPath()                                                         */
/*---------------------------------------------------------------------*/

DvtCanvasDrawUtils.drawPath = function(ctx, aCmds)
{
  var  len = aCmds.length ;
  var  c ;
  var  xSubPath, ySubPath ;
  var  bFirst = true ;
  var  bMultiMove  = false ;     // for move with multiple coords
  var  bRel ;                    // true if relative command
  var  x, y, x2, y2, x3, y3 ;

  for (var i = 0; i < len;  i++)  {
     bRel = false ;

     c = aCmds[i] ;

     switch (c)
     {
        case 'm' :  bRel = true ;
        case 'M' :  do {
                      x = aCmds[i +1] ;
                      y = aCmds[i +2] ;

                      if (bFirst) {        // note if first is 'm', it is treated as absolute.
                        bFirst = false ;
                      }
                      else if (bRel) {
                        x += xSubPath ;
                        y += ySubPath ;
                      }
                      if (bMultiMove)
                        ctx.lineTo(x, y) ;  // 2nd and subsequent moveTo's are treated as lineTo's
                      else {
                        ctx.moveTo(x, y) ;
                        bMultiMove = true ;
                      }
                      xSubPath = x ;
                      ySubPath = y ;
                      i += 2 ;
                    } while (! isNaN(aCmds[i +1])) ;
                    bMultiMove = false ;                   
                    break ;

        case 'c' :  bRel = true ;
        case 'C' :  do {
                      x  = aCmds[i +1] ;
                      y  = aCmds[i +2] ;
                      x2 = aCmds[i +3] ;
                      y2 = aCmds[i +4] ;
                      x3 = aCmds[i +5] ;
                      y3 = aCmds[i +6] ;

                      if (bRel) {
                        x  += xSubPath ;
                        y  += ySubPath ;
                        x2 += xSubPath ;
                        y2 += ySubPath ;
                        x3 += xSubPath ;
                        y3 += ySubPath ;
                      }
                      ctx.bezierCurveTo(x, y, x2, y2, x3, y3) ;
                      xSubPath = x3 ;
                      ySubPath = y3 ;
                      i += 6 ;
                    } while (! isNaN(aCmds[i +1])) ;
                    break ;

        case 'q' :  bRel = true ;
        case 'Q' :  do {
                      x  = aCmds[i +1] ;
                      y  = aCmds[i +2] ;
                      x2 = aCmds[i +3] ;
                      y2 = aCmds[i +4] ;
                      if (bRel) {
                        x  += xSubPath ;
                        y  += ySubPath ;
                        x2 += xSubPath ;
                        y2 += ySubPath ;
                      }
                      ctx.quadraticCurveTo(x, y, x2, y2) ;
                      xSubPath = x2 ;
                      ySubPath = y2 ;
                      i += 4 ;
                    } while (! isNaN(aCmds[i +1])) ;
                    break ;

        case 'l' :  bRel = true ;
        case 'L' :
                    do {
                      x = aCmds[i +1] ;
                      y = aCmds[i +2] ;
                      if (bRel) {
                        x += xSubPath ;
                        y += ySubPath ;
                      }
                      ctx.lineTo(x, y) ;
                      xSubPath = x ;
                      ySubPath = y ;
                      i += 2 ;
                    } while (! isNaN(aCmds[i +1])) ;
                    break ;

        case 'h' :  bRel = true ;
        case 'H' :  do {
                      x = aCmds[i + 1] ;
                      if (bRel) {
                        x += xSubPath ;
                      }
                      ctx.lineTo(x, ySubPath) ;
                      xSubPath = x ;
                      i += 1 ;
                    } while (! isNaN(aCmds[i +1])) ;
                    break ;

        case 'v' :  bRel = true ;
        case 'V' :  do {
                      y = aCmds[i + 1] ;
                      if (bRel) {
                        y += ySubPath ;
                      }
                      ctx.lineTo(xSubPath, y) ;
                      ySubPath = y ;
                      i += 1 ;
                    } while (! isNaN(aCmds[i +1])) ;
                    break 


        case 'z' :
        case 'Z' :  ctx.lineTo(xSubPath, ySubPath) ;
                    break ;
        default :   console.log("Unknown path cmd=" + c + "  i=" + i) ;
                    break ;
     }
  }

};


/*---------------------------------------------------------------------*/
/*  drawPolygon()                                                      */
/*---------------------------------------------------------------------*/

DvtCanvasDrawUtils.drawPolygon = function(ctx, aPts, aGaps)
{
   var len = aPts.length;
   ctx.moveTo(aPts[0], aPts[1]) ;
   for (var i = 2; i < len; i += 2)  {

     ctx.lineTo(aPts[i], aPts[i+1]) ;
   }

   //  Ensure polygon is closed.
   i = len - 2 ;
   if (! ((aPts[0] === aPts[i]) && (aPts[1] === aPts[i+1]))) {
     ctx.lineTo(aPts[i], aPts[i + 1], aPts[0], aPts[1]) ;
   } 

/*
   var len = aPts.length -2;
   for (var i = 0; i < len; i += 2)  {

     DvtCanvasDrawUtils.drawLine(ctx, aPts[i], aPts[i+1], aPts[i+2], aPts[i+3], aGaps) ;
   }

   //  Ensure polygon is closed.
   i = len ;
   if (! ((aPts[0] === aPts[i]) && (aPts[1] === aPts[i+1]))) {

     DvtCanvasDrawUtils.drawLine(ctx, aPts[i], aPts[i+1], aPts[0], aPts[1], aGaps) ;
   } 
*/

};


/*---------------------------------------------------------------------*/
/*  drawPolyline()                                                     */
/*---------------------------------------------------------------------*/

DvtCanvasDrawUtils.drawPolyline = function (ctx, aPts, aGaps)
{
   if (! aPts) {
     return ;
   }
   var len = aPts.length ;
   if (len <= 2) { 
     return ;
   }

   for (var i = 2; i < len; i += 2)
   {
      DvtCanvasDrawUtils.drawLine(ctx, aPts[i], aPts[i+1], aPts[i+2], aPts[i+3], arGaps) ;
   }

};



/*---------------------------------------------------------------------*/
/*  drawRect()                                                         */
/*---------------------------------------------------------------------*/

DvtCanvasDrawUtils.drawRect = function(ctx, x, y, w, h, rx, ry, aGaps)
{
   rx = (rx === null || isNaN(rx)) ? 0 : rx;            // check for rounded corners
   ry = (ry === null || isNaN(ry)) ? 0 : ry;
   rx = Math.max(rx, ry) ;   // currently don't support elliptical.

   if (rx === 0) {           // non-rounded corners

     ctx.moveTo(x + 1 + 0.5,  y +0.5) ;
     ctx.lineTo(x + w + 0.5,  y + 0.5) ;         // top
     ctx.lineTo(x + w + 0.5,  y + h + 0.5) ;     // right
     ctx.lineTo(x + 0.5,      y + h + 0.5) ;     // bottom
     ctx.lineTo(x + 0.5,      y + 0.5) ;         // left
     ctx.lineTo(x +1 + 0.5,   y + 0.5) ;         // final join-up.

     var fill = true ;
     if (typeof ctx.fillStyle === 'string') {
       var fa = DvtColorUtils.getAlpha(ctx.fillStyle) ;
       fill = (fa > 0) ; 
     }
     if (fill)  {
       ctx.fillRect(x, y, w, h) ;      // this appears to turn off anti-aliasing
     }                                 // giving a sharper look and same appearance as SVG.

   }
   else {
     DvtCanvasDrawUtils.drawRoundRect(ctx, x, y, w, h, rx, aGaps) ;
   }
} ;


/*---------------------------------------------------------------------*/
/*  drawRoundRect()                                                    */
/*---------------------------------------------------------------------*/

DvtCanvasDrawUtils.drawRoundRect = function(ctx, x, y, w, h, radius, aGaps)
{
   ctx.moveTo(x, y + radius);
   ctx.lineTo(x, y + h - radius);
   ctx.quadraticCurveTo(x, y + h, x + radius, y + h);
   ctx.lineTo(x + w - radius, y + h);
   ctx.quadraticCurveTo(x + w, y + h, x + w, y + h - radius);
   ctx.lineTo(x + w, y + radius);
   ctx.quadraticCurveTo(x + w, y, x + w - radius, y);
   ctx.lineTo(x + radius, y);
   ctx.quadraticCurveTo(x, y, x, y + radius);

};


/*---------------------------------------------------------------------*/
/*  drawText()                                                         */
/*---------------------------------------------------------------------*/

DvtCanvasDrawUtils.drawText = function(ctx, text, x, y, angle, cx, cy,
                                       fontFamily, fontSize, fontStyle, fontWeight, baseline, anchor)
{
   x        = (x === null || isNaN(x)) ? 0 : x;   // amx doesn't send x,y sometimes
   y        = (y === null || isNaN(y)) ? 0 : y;   // (if text is transformed)
   fontSize = fontSize ? fontSize : '11' ;        // amx doesn't sent font size sometimes

   var px     = ((fontSize && fontSize.indexOf) && fontSize.indexOf('px') > 0)? '' : 'px';
   ctx.font   = (fontStyle? (fontStyle + ' ') : '') + 
                (fontWeight?(fontWeight + ' ') : '') + 
                fontSize + px + ' ' + fontFamily ;

   baseline = baseline ? baseline : 'alphabetic' ;
   ctx.textBaseline = baseline ;
   if (anchor) {
     ctx.textAlign = anchor ;
   }

   if (angle !== 0) {
     ctx.translate(cx, cy) ;
     ctx.rotate(angle * Math.PI / 180);
     ctx.translate(- cx, - cy) ;
   }

   ctx.fillText(text, x, y) ;
};

// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*---------------------------------------------------------------------*/
/*  DvtCanvasTextUtils()          Canvas Utilities for Text            */
/*---------------------------------------------------------------------*/

/**
  *  Static Canvas Utilities for Text 
  *  @class DvtCanvasTextUtils
  *  @constructor
  */

var DvtCanvasTextUtils = {};

DvtObj.createSubclass(DvtCanvasTextUtils, DvtObj, "DvtCanvasTextUtils");

//DvtSvgTextUtils.TRUNCATION_INCR = 1;       // Increment in chars to truncate by
//DvtSvgTextUtils.TRUNCATION_MIN_LENGTH = 1; // Minimum length of truncated text


/**
  *  Returns the width and height of the specified text string
  *  @param {Canvas} 
  */
DvtCanvasTextUtils.measureText = function(text, fontFamily, fontSize, fontStyle, fontWeight)
{
    //  Warning - this is a heuristic.  For canvas it is currently tough to be
    //  completely accurate.

    fontSize = fontSize? fontSize : 11 ;       // fontsize is sometimes not given (see comment in DvtCanvasDrawUtils.drawText())
    var ctx = DvtCanvasUtils.createCanvasDocument(400, 400).getContext("2d") ;

    var px = '' ;
    if (fontSize && fontSize.indexOf)
      px = (fontSize.indexOf('px') > 0)? '' : 'px';

    ctx.font = (fontStyle? (fontStyle + ' ') : '') + 
               (fontWeight?(fontWeight + ' ') : '') + 
                fontSize + px + ' ' + fontFamily ;
    var tm ;
    var width ;
    var height ;

    tm = ctx.measureText(text) ;
    width  = tm.width ;
    tm = ctx.measureText('e') ;           // heuristic !
    height = 2 * tm.width ;
    height++ ;            // hate this, but seems to give closest results to svg!

    //console.log("MT " + width + "," + height + " \"" + text + "\" " + fontFamily + " " +
    //            fontSize + " " + fontStyle + " " + fontWeight) ;

    return new DvtRectangle(0, 0, width, height) ;
};


/**
 * Truncates the given text element to fit within the available space.  Returns
 * null if the text node can't fit.
 * @param {DOM element} parent the parent on the SVG DOM.  This element will only be used 
 *                             temporarily for calculating the bounds of the text.
 * @param {DOM element}textObj the text element to be truncated
 * @param {number} availWidth the available width
 * @param {number} availHeight the available height
 * @return the text element, truncated to fit in the given space.  
 * @base DvtSvgUtils
 */
/*
DvtSvgTextUtils.truncateToSpace = function(parent, textObj, availWidth, availHeight) {
  // Temporarily add the child so that metrics may be obtained
  parent.appendChild(textObj);
  
  // Hide the text if it won't fit
  var bbox = textObj.getBBox();
  var width = bbox.width;
  var height = bbox.height;
  
  // If not enough height, return null
  if(height >= availHeight) {
    parent.removeChild(textObj);
    return null;
  }
  
  // If not enough width, attempt to truncate
  var textStr = DvtSvgTextUtils._getInitialTruncation(DvtSvgTextUtils.getTextString(textObj));
  while(width >= availWidth && textStr.length >= DvtSvgTextUtils.TRUNCATION_MIN_LENGTH) {
    // Update the text element and recalc size
    DvtSvgTextUtils.updateText(textObj, textStr + "...");
    width = textObj.getBBox().width;
    
    // Truncate 1 chars at a time
    textStr = textStr.substring(0, textStr.length - DvtSvgTextUtils.TRUNCATION_INCR);
  }
  
  // Remove the child since metrics are calc'ed
  parent.removeChild(textObj);
  
  if(width >= availWidth) {
    return null; // not enough space, don't return a text element
  }
  else {
    return textObj;
  }
} ;
*/

/**
 * Truncates the given text element to fit within the available space.  Returns
 * null if the text node can't fit.
 * @param parent the parent on the SVG DOM.  This element will only be used 
 *               temporarily for calculating the bounds of the text.
 * @param textObj the text element to be truncated
 * @param callback the callback function that takes a bbox and returns true if the text fits
 * @param cbArgs the arguments to pass the callback, after the bbox
 * @return the text element, truncated to fit in the given space.  
 */
/*
DvtSvgTextUtils.truncateToCallback = function(parent, textObj, callback, cbArgs) {
  // Temporarily add the child so that metrics may be obtained
  parent.appendChild(textObj);
  
  // If the text doesn't fit, attempt to truncate
  var bbox = textObj.getBBox();
  var textStr = DvtSvgTextUtils._getInitialTruncation(DvtSvgTextUtils.getTextString(textObj));
  while(!callback(bbox, cbArgs) && textStr.length >= DvtSvgTextUtils.TRUNCATION_MIN_LENGTH) {
    // Update the text element and recalc size
    DvtSvgTextUtils.updateText(textObj, textStr + "...");
    bbox = textObj.getBBox();
    
    // Truncate 1 chars at a time
    textStr = textStr.substring(0, textStr.length - DvtSvgTextUtils.TRUNCATION_INCR);
  }
  
  // Remove the child since metrics are calc'ed
  parent.removeChild(textObj);
  
  if(!callback(bbox, cbArgs)) {
    return null; // not enough space, don't return a text element
  }
  else {
    return textObj;
  }
};
*/

/**
 * Helper function that returns the initial truncation for the given string.
 */
/*
DvtSvgTextUtils._getInitialTruncation = function(textStr) {
  var newLength = Math.max(1, textStr.length - 3); // Keep at least 1 char
  return textStr.substring(0, newLength); 
};
*/

// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/**
 * Document APIs.
 * @class DvtCanvasDocumentUtils
 */
var DvtCanvasDocumentUtils = function(){};

DvtObj.createSubclass(DvtCanvasDocumentUtils, DvtDocumentUtils, "DvtCanvasDocumentUtils");

// TODO JSDoc
// Return displayable
/*
DvtSvgDocumentUtils.elementFromPoint = function(posX, posY) {
  var domObj = DvtAgent.getAgent().elementFromPagePoint(posX, posY);
  if (domObj && domObj._obj) {
    return domObj._obj.getObj();
  }
  return null;
};
*/
// TODO JSDoc
// Return coordinates relative to stage
/*
DvtSvgDocumentUtils.getStageRelativePosition = function(stage, x, y) {
  var svgPos = DvtSvgDocumentUtils.getStageAbsolutePosition(stage);
  var xPos = x - svgPos.x;
  var yPos = y - svgPos.y;
  return new DvtPoint(xPos, yPos);
}
*/

// TODO JSDoc
// Return absolute coordinates of stage
//DvtSvgDocumentUtils.getStageAbsolutePosition = function(stage) {
//  var svgRoot = stage.getImpl().getSVGRoot();
//
//  var referenceElem = svgRoot;
//  // If ADf, always use parent node
//  if (window && window.AdfAgent) {
//      referenceElem = svgRoot.parentNode;
//  } else {
//      // Otherwise require element to be the first child      
//      if (svgRoot.parentNode && svgRoot.parentNode.firstChild == svgRoot) {
//          referenceElem = svgRoot.parentNode;
//      }
//  }
//  var svgPos = DvtAgent.getAgent().getElementPosition(referenceElem);
//  var x = parseInt(svgPos.x);
//  var y = parseInt(svgPos.y);
//  // BUG #12805233: Firefox 5 returns incorrect element position for svg with clipped content.
//  // As a result, adjustment needs to be made for the extent it extends outside the bounds
//  // Unfortunately, this can't be cached because clipped items are often moving
//  /*
//  var isFirefox = DvtAgent.getAgent().getPlatform() === DvtAgent.GECKO_PLATFORM;
//  if (isFirefox) {
//      var stageDim = stage.getDimensions();
//      if (stageDim.x != 0)
//        x += -stageDim.x;
//      if (stageDim.y != 0)
//        y += -stageDim.y;
//  }
//  */
//  return new DvtPoint(x, y);
//}








// TODO JSDoc
// Return whether or not filters are supported
DvtCanvasDocumentUtils.isFilterSupported = function(stage) {
    var agent = DvtAgent.getAgent();
    var platform = agent.getPlatform();
    var chrome = agent.getName().indexOf("chrome/")!=-1
    return !(platform === DvtAgent.IE_PLATFORM || (platform === DvtAgent.WEBKIT_PLATFORM && !chrome));
}

DvtCanvasDocumentUtils.isStrokeTimeoutRequired = function() {
    return DvtAgent.getAgent().isChrome();
}


/*
 * Whether or not events in SVG are received on regions that are visually clipped such that they are not visible
 */
/*
DvtSvgDocumentUtils.isEventAvailableOutsideClip = function() {
    return DvtAgent.getAgent().isSafari();
}
*/
/**
 * Works around bug 12622757, where updating objects whose ancestors have filters
 * does not work in the recent Webkit versions.
 * @param svgDomElement The SVG DOM element ancestor that contains the offending filter.
 */
/*
DvtSvgDocumentUtils.fixWebkitFilters = function(svgDomElement) {
  if(svgDomElement && DvtAgent.getAgent().isWebkit()) {
    DvtSvgDocumentUtils._fixFilter(svgDomElement);
  }
}
*/

/**
 * Works around bug 12622757, where updating objects whose ancestors have filters
 * does not work in the recent Webkit versions.
 * @param displayable The displayable that contains the offending filter.
 */
/*
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
*/

/*
DvtSvgDocumentUtils._fixFilter = function(svgDomElement) {
    // Ping the ancestor to force a repaint.  This is basically a noop.
    svgDomElement.setAttributeNS(null, 'transform', svgDomElement.getAttributeNS(null, 'transform'));
}
*/

/**
 * Cancel a DOM event.
 * 
 * @param {object}  e  event object to cancel
 */
/*
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
*/
