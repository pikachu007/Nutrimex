// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 

/*---------------------------------------------------------------------*/
/*   DvtPieChart                                                       */
/*---------------------------------------------------------------------*/

/*
 * Call chain:
 * 
 * The DvtGraphParser calls DvtPieChart.setPieInfo and DvtPieChart.setPosition
 * to set general pie properties and DvtPieChart.addSliceInfo to set individual 
 * slice properties when it parses the graph xml. 
 * 
 * Then, DvtPieChart.init gets called to create each logical DvtPieSlice object. Setting up the slice's size, location,
 * fill, label, label layout and the creation of the physical shapes are NOT done at this step.
 * 
 * DvtPieChart.render then gets called to 
 * 
 * 1. create and layout the physical pie surface objects and physical labels
 * 2. order the slices for rendering
 * 3. layout the slice labels and feelers
 * 4. render the actual slices (add them to this DvtPieChart)
 * 5. render the slice labels and feelers.
 */

/**
 * Creates an instance of DvtPieChart
 * @param {DvtContext} context The platform dependent context object (such as {@link DvtSvgContext}).
 * @param {DvtEventManager} eventManager The event manager that will process events for this pie.
 * @param {function} callback A function that responds to events
 * @param {object} callbackObj The optional object instance that the callback function is defined on.
 *  @class DvtPieChart
 *  @extends DvtContainer
 *  @constructor
 */ 
var DvtPieChart = function(context, eventManager, callback, callbackObj)
{
   this.Init(context, eventManager, callback, callbackObj) ;
}; 



// constants for label placement
/** final @type number */
DvtPieChart.LABEL_POS_UNSPEC            = -1 ;
/** final @type number */
DvtPieChart.LABEL_POS_NONE              = 0 ;
/** final @type number */
DvtPieChart.LABEL_POS_INSIDE            = 1 ;
/** final @type number */
DvtPieChart.LABEL_POS_OUTSIDE           = 2 ;
/** final @type number */
DvtPieChart.LABEL_POS_OUTSIDE_FEELERS   = 3 ;

// constants for label content
/** final @type number */
DvtPieChart.LABEL_TYPE_UNSPEC           = -1 ;
/** final @type number */
DvtPieChart.LABEL_TYPE_PERCENT          = 0 ;
/** final @type number */
DvtPieChart.LABEL_TYPE_VALUE            = 1 ;
/** final @type number */
DvtPieChart.LABEL_TYPE_TEXT             = 2 ;
/** final @type number */
DvtPieChart.LABEL_TYPE_TEXT_PERCENT     = 3 ;
/** final @type number */
DvtPieChart.LABEL_TYPE_TEXT_VALUE       = 4 ;
/** final @type number */
DvtPieChart.LABEL_TYPE_CUSTOM           = 5 ;

// constants for pie explode/unite

/** final @type number */
DvtPieChart.EXPLODE         = 0;
/** final @type number */
DvtPieChart.UNITE           = 1;

DvtObj.createSubclass(DvtPieChart, DvtContainer, "DvtPieChart");

/*----------------------------------------------------------------------*/
/* Init()                                                               */
/*----------------------------------------------------------------------*/
/**
 * Object initializer
 * @protected
 * 
 * @param {DvtContext} context
 * @param {DvtEventManager} eventManager The event manager that will process events for this pie.
 * @param {function} callback A function that responds to events
 * @param {object} callbackObj The optional object instance that the callback function is defined on.
 */
DvtPieChart.prototype.Init = function(context, eventManager, callback, callbackObj)
{
   DvtPieChart.superclass.Init.call(this, context) ;
   
   this._eventManager = eventManager;
   
   this._anchorOffset = 90 ;
   
   this._depth         = 0 ;  
   
   this._xRadius      = 0 ;
   this._yRadius      = 0 ;
   this._center       = new DvtPoint(0,0);

   this._pieInfo      = null;// an instance of DvtPieInfo

   this._frame        = new DvtRectangle(0,0,0,0); // Pie frame

   this._bAutoExplode = false ; // whether or not interactive slice behavior is enabled

   this._slices       = new Array(); // array of DvtPieSlice objects; stored in the order
                                     // in which they are parsed from the xml
  
   this._maxExplodePixels = 0;  // max explode value amongst all slices
  
   this._is3D = false;

   // a DvtContainer where we add parts of the pie and feeler lines
   // any special filters (currently, drop shadow effect for 2D pies)
   // affecting the pie are added to this container  
   this._shapesContainer = new DvtContainer(context); 
  
   // Support for changing z-order for selection
   this._numFrontObjs = 0;
   this._numSelectedObjsInFront = 0;
  
   this._animationDuration = 1; // in seconds, for explosion
   
   this._maxSliceIndex = -1;
};

/**
 * Returns the DvtEventManager for this component.
 * @return {DvtEventManager}
 */
DvtPieChart.prototype.__getEventManager = function() {
  return this._eventManager;
}

/**
 * Sets the position of the pie, and its pie frame
 * 
 * @param {DvtPoint} center The center of the pie
 * @param {number} radiusX The x-radius of the pie
 * @param {number} radiusY The y-radius of the pie
 * @param {DvtRectangle} pieFrame The region allocated to the pie and its labels
 */
 DvtPieChart.prototype.setPosition = function(center, radiusX, radiusY, pieFrame)
 {
   this._center = center;
   this._xRadius = radiusX;
   this._yRadius = radiusY;
   // Bug fix 12853989; make our own copy of the pie frame
   var frame = new DvtRectangle(pieFrame.x, pieFrame.y, pieFrame.w, pieFrame.h);
   this._frame = frame;
 }
 
/**
 * Processes an event that has been dispatched from a container or peer.
 * @param {object} event
 */
DvtPieChart.prototype.processEvent = function(event) {
  var type = event.getType();
  if(type == DvtHideShowCategoryEvent.TYPE_HIDE || type == DvtHideShowCategoryEvent.TYPE_SHOW) 
    DvtHideShowCategoryHandler.processEvent(event, this._slices);
  else if(type == DvtCategoryRolloverEvent.TYPE_OVER || type == DvtCategoryRolloverEvent.TYPE_OUT)
    DvtCategoryRolloverHandler.processEvent(event, this._slices);
};

/**
 * Returns the array of showPopupBehaviors for the object.
 * @return {array} The array of applicable DvtShowPopupBehaviors
 */
DvtPieChart.prototype.__getShowPopupBehaviors = function() {
  return null; // subclasses can override to provide popup support
} 

// TODO JSDOC
DvtPieChart.prototype.render = function()
{   
  var shadow;
  if(!this.contains(this._shapesContainer))    
  {
    if(!this._shapesContainer)
    {
      this._shapesContainer = new DvtContainer(this.getContext());
    }
    this.addChild(this._shapesContainer);
    
    if(!this._is3D && this._pieInfo.hasVisualEffects())
    {
      var shadowRGBA = DvtColorUtils.makeRGBA(78,87,101,0.45);

      shadow =  new DvtShadow(shadowRGBA, 
                              4, // distance
                              7, // blurX
                              7, // blurY
                              54, // angle of the shadow
                              2, // strength or the imprint/spread
                              3, // quality
                              false, // inner shadow
                              false, // knockout effect
                              false // hide object
                              );
    }
  }
  
  // Set each slice's angle start and angle extent
  // The order in which these slices are rendered is determined in the later call to orderSlicesForRendering
  DvtPieChart._layoutSlices(this._slices, this._anchorOffset);    
    
  // create the physical surface objects and labels
  var len = this._slices.length;
  for(var i=0; i<len; i++) {
    var slice = this._slices[i];
    slice.preRender(); 
  }    
    
  // we order the slices for rendering, such that
  // the "front-most" slice, the one closest to the user
  // is redered last.  each slice is then responsible
  // for properly ordering each of its surfaces before 
  // the surfaces are rendered.
  var zOrderedSlices = DvtPieChart._orderSlicesForRendering(this._slices);
  
  DvtPieChart._layoutLabelsAndFeelers(this);
   
  // now that everything has been laid out, tell the slices to 
  // render their surfaces 
  len = zOrderedSlices.length;
  for(var i=0; i<len; i++) {
    var slice = zOrderedSlices[i];
    slice.render(); 
  }  
  
  // then go back a second time and render the labels and feelers
  // we need this second pass because in the case of inside labels,
  // we want the labels rendered after all pie tops have been rendered
  len = zOrderedSlices.length;
  for(var i=0; i<len; i++) {
    var slice = zOrderedSlices[i];
    slice.renderLabelAndFeeler(); 
  }  
  
  // Bug fix 12958165: Don't render shadows in Chrome SVG
  if(!(DvtAgent.getAgent().isWebkit() && this.getContext() instanceof DvtSvgContext)) {
    //BUG FIX #12427741: apply shadow after rendering slices because
    //shadow effect may depend on bounding box
    if (shadow) {
      this._shapesContainer.addDrawEffect(shadow);
    }
  }
  
  // perform initial animation if necessary
  if(this._pieInfo.isInitFx() && !this._bInitFxDone){
      this._doInitFx();
      this._bInitFxDone = true;
  }
  
  // perform initial selection and explosion if necessary
  len = zOrderedSlices.length;
  for(var i=0; i<len; i++) {
    var slice = zOrderedSlices[i];
    if (slice._selected) slice.setSelected(true);
    slice.explodeSlice(slice.getExplode());
  }  
  
};




/**
 * Adds a DvtSliceInfo object to the pie chart. Hook used by DvtGraphParser to add parsed slice info to the DvtPieChart
 * @param {DvtSliceInfo}  sliceInfo The DvtSliceInfo object to add to the pie
 * @return {DvtPieSlice} The slice that was added.
 */
DvtPieChart.prototype.addSliceInfo = function(sliceInfo)
{
  // Keep track of the max exploded pixels
  var explodePixels = sliceInfo.getExplode();
  if(explodePixels > this._maxExplodePixels) 
    this._maxExplodePixels = explodePixels;
  
  //Keep track of the max slice index
  var index = sliceInfo.getIndex();
  if(index > this._maxSliceIndex)
    this._maxSliceIndex = index;
  
  // Create the DvtPieSlice object for this sliceInfo and add it to this pie
  var slice = this.CreateSlice(this, sliceInfo);
  this._slices.push(slice);
  return slice;
};


/**
 * @return {number} The highest index of the slices
 * This is not equal to the number of slices because the index may skip if there's a slice with zero value.
 */
DvtPieChart.prototype.getMaxSliceIndex = function() {
    return this._maxSliceIndex;
}


/**
 * Computes the total value of the pie
 * 
 * @param {DvtPieChart} pieChart 
 * @return {number} The total value of all pie slices
 * 
 */
DvtPieChart.__computeTotal = function(pieChart)
{
  var total = 0;
  var slices = pieChart._slices;
  
  for (var i = 0; i < slices.length; i++) 
  {
    var sliceValue = slices[i].getSliceInfo().getValue();
    if(sliceValue >= 0) // Ignore negative slice values
      total += sliceValue;
  }

  return total;
}

/**
 * Computes the maximum explode pixels of all slices in the pie
 * 
 * @param {Array} aSliceInfo An array of DvtSliceInfo objects
 * @return {number} The maximum explode value of all the slices
 * 
 * @private
 */
DvtPieChart._computeMaxExplodePixels = function(aSliceInfo)
{
  var len = aSliceInfo.length ;

  var maxExplodePixels = 0;
  for (var i = 0; i < len; i++) {
    var sliceInfo = aSliceInfo[i] ;
    var explodePixels = sliceInfo.getExplode();
    
    if(explodePixels > maxExplodePixels) 
    {
      maxExplodePixels = explodePixels;
    }
  }
  
  return maxExplodePixels;
}

/**
 * Creates a new DvtPieSlice with the specified params.
 * @param {DvtPieChart} pie
 * @param {DvtSliceInfo} sliceInfo
 */
DvtPieChart.prototype.CreateSlice = function(pie, sliceInfo) {
  return new DvtPieSlice(pie, sliceInfo);
}

// ported over from PieChart.as

/**
 * Sets the location of each slice in the pie. That is, each slice in the input slices array has its angle start and
 * angle extent set.  Label layout is not handled in this method.
 * 
 * @param {Array} slices An array of DvtPieSlice objects
 * @param {number} anchorOffset The initial rotation offset for the pie, measured in degrees with 0 being the standard
 *                              0 from which trigonometric angles are measured. Thus, 90 means the first pie slice is 
 *                              at the 12 o'clock position
 * 
 * @private 
 */
DvtPieChart._layoutSlices = function(slices, anchorOffset)
{
  var i;
  var slice;
  var angle;
  
  var arc = 0 ;

  var nSlices = (slices ) ? slices.length : 0 ;

  if (anchorOffset > 360)
    anchorOffset -= 360 ;

  if (anchorOffset < 0)
    anchorOffset += 360 ;
  
  var percentage = 0;
  var dataTotal = 0;
  if(nSlices > 0)
  {
    dataTotal = DvtPieChart.__computeTotal(slices[0].getPieChart());
  }
              
  for (i = 0; i < nSlices; i++)
  {
    slice = slices[i] ;

    value = slice.getSliceInfo().getValue();
    percentage = (dataTotal==0) ? 0 : ((Math.abs(value) / dataTotal) * 100) ;
  
    arc   = percentage * 3.60 ;    // 3.60 = 360.0 / 100.0 - percentage of a 360 degree circle
    angle = anchorOffset - arc ;

    if (angle < 0)
      angle += 360 ;

    slice.setAngleStart(angle) ;
    slice.setAngleExtent(arc) ;

    anchorOffset = slice.getAngleStart() ;    // update anchor position for next slice
  }
  
}



/**
 * Sort slices by walking slices in a clockwise and then counterclockwise fashion,
 * processing the bottom-most slice last.  Each slice is responsible for sorting its
 * own surfaces so that they get rendered in the proper order.
 *
 * @param {Array} slices The array of DvtPieSlices to order
 * @return {Array} A z-ordered array of DvtPieSlices
 * 
 * @private
 */
DvtPieChart._orderSlicesForRendering = function(slices)
{
  var zOrderedSlices = []; 
  var i ;
  var nSlices = (slices) ? slices.length : 0 ;
  var slice ;

  var rotateIdx = -1;
  var angleStart;
  var angleExtent;
  var sliceSpanEnd;
  
  // the amount of the slice, in degrees, by which the slice that spans the 12 o'clock position spans 
  // counterclockwise from 12 o'clock (i.e., how much of the slice is "before noon")
  var sliceSpanBeforeNoon;
  
  // if we have any sort of pie rotation, then we need to rotate a copy of the _slices array
  // so that the first entry in the array is at 12 o'clock, or spans 12 o'clock position
  // to do this, we just check the angle start and angle extent of each slice. The first element in
  // the array would be that angle whose start + extent = 90 or whose start < 90 and 
  // start + extent > 90.

  // find the index of the slice that spans the 12 o'clock position
  for(i=0; i<nSlices; i++)
  {
    slice = slices[i];
    angleStart = slice.getAngleStart();
    angleExtent = slice.getAngleExtent();
    sliceSpanEnd = angleStart + angleExtent;

    if (sliceSpanEnd > 360)
      sliceSpanEnd -= 360 ;

    if (sliceSpanEnd < 0)
      sliceSpanEnd += 360 ;    
    
    
    if((sliceSpanEnd == 90) ||
       ((angleStart < 90) && (sliceSpanEnd > 90)) )
    {
      rotateIdx = i;
      sliceSpanBeforeNoon = sliceSpanEnd - 90;
      break;
    }
  }

  // now create an array in which the slices are ordered clockwise from the 12 o'clock position
  var rotatedSlices = [];
  for(i=rotateIdx; i<nSlices; i++)
  {
    rotatedSlices.push(slices[i]);
  }
  for(i=0; i<rotateIdx; i++)
  {
    rotatedSlices.push(slices[i]);
  }

  //total accumulated angle of slice so far
  var accumAngle = 0;

  // the bottom-most slice index, whose extent either spans the two bottom
  // quadrants across the 270 degree mark (the "6 o'clock" position), 
  // or is tangent to the 270 degree mark
  var lastSliceIndexToProcess = 0;

  //
  // process slices clockwise, starting at the top, series 0
  //    
  var accumAngleThreshold = 180+sliceSpanBeforeNoon;
  for ( i = 0; i < nSlices; i++ )
  {
    slice = rotatedSlices[i];

    if (slice)
    {
      // if this slice makes the accumAngle exceed 180 degrees, 
      // then save it for processing later because this is the
      // bottom-most slice (it crosses the 6 o'clock mark), 
      // which means it should be in front in the z-order
      if (accumAngle + slice.getAngleExtent() > accumAngleThreshold)
      {
        lastSliceIndexToProcess = i;
        break;
      }
                  
      // add this slice to the rendering queue for slices
      zOrderedSlices.push(slice);
                  
      //add the current slice extent to the accumulated total
      accumAngle += slice.getAngleExtent();
    }
  }
          
  for ( i = nSlices - 1; i >= lastSliceIndexToProcess; i-- )
  {
    slice = rotatedSlices[i];
    if (slice)
    {
      zOrderedSlices.push(slice);
    }
  }
  
  return zOrderedSlices;
}


/**
 * Returns a boolean indicating if the DvtPieChart is a 3D pie
 * 
 * @return {boolean} true If the pie is to be rendered as a 3D pie
 */
DvtPieChart.prototype.is3D = function()
{
  return this._is3D;
}


/**
 * Sets whether this DvtPieChart is a 3D pie or not
 * 
 * @param {boolean} is3D true if this is a 3D pie, false if not
 */
DvtPieChart.prototype.set3D = function(is3D)
{
  this._is3D = is3D;
}

/**
 * Determine the maximum distance a pie slice can be exploded from the pie
 * 
 * @return {number} The maximum distance a pie slice can be exploded from the pie
 */
DvtPieChart.prototype.__calcMaxExplodeDistance = function()
{
  var pieWidth = this._frame.w ;   
  var pieHeight = this._frame.h ;   
  var minDiameter = Math.min(pieWidth, pieHeight) ;
  var minDiameterConversionConstant = 0.047; // constant originally used in Flash impl
  var maxExplodeDistance = minDiameter * minDiameterConversionConstant ; 
  var explodeMax = maxExplodeDistance ;
  if (explodeMax < 0)
    explodeMax = 0 ;
    
  return explodeMax ; 
}



/**
 * Explode all pie slices
 */
DvtPieChart.prototype.explodeAll = function()
{
  this.animateExplode(0, -1) ;    // explode all
}
    

/**
 * Unite all pie slices
 */
DvtPieChart.prototype.uniteAll = function()
{
  this.animateExplode(1, -1) ;    // unite/implode all
}


/**
 * returns true if the chart/pie has all its slices exploded
 */
DvtPieChart.prototype.isPieAllExploded = function() 
{
  var allExploded = true;
  var slice;
  var i;
  var length = this._slices.length;
  
  for (i = 0; i < length; i++) 
  {
    slice = this._slices[i];
    if (slice.getExplode() == 0) 
    {
      allExploded = false;
      break;
    }
  }
  
  return allExploded;
}


/**
 * returns true if the chart/pie has all its slices united (imploded, not exploded)
 */
DvtPieChart.prototype.isPieAllUnited = function() 
{
  var allUnited = true;
  var slice;
  var i;
  var length = this._slices.length;
  
  for (i = 0; i < length; i++) 
  {
    slice = this._slices[i];
    if (slice.getExplode() > 0) 
    {
      allUnited = false;
      break;
    }
  }
  
  return allUnited;
}


/**
 * Convenience function to explode a single slice by slice id
 * 
 * @param {number} op Either DvtPieChart.EXPLODE or DvtPieChart.UNITE    
 * @param {String} sliceId 
 */
DvtPieChart.prototype.animateSingleSliceExplode = function(op, sliceId) 
{
  // find the seriedIdx corresponding to this sliceId
  
  var i;
  var slice;
  var length = this._slices.length;
  var seriesIdx = -1;

  for(i = 0; i < length; i++)
  {
    slice = slices[i];
    sliceInfo = slice.getSliceInfo();
    if(sliceInfo.getId() == sliceId)
    {
      seriesIdx = i;
      break;
    }
  }
  
  if(seriesIdx > -1)
    this.animateExplode(op, seriesIdx);
}
 
DvtPieChart.prototype.getAnimationDuration = function() {
  return this._animationDuration;
}

 
/**
 * Animate the explode/unite for a single slice, or for all slices
 * 
 * @param {number} op Either DvtPieChart.EXPLODE or DvtPieChart.UNITE    
 * @param {number} seriesIdx Either -1 for all slices, or the specific slice 
 */
DvtPieChart.prototype.animateExplode = function(op, seriesIdx) 
{          
  var length = this._slices.length;
  var slice;
  var i;
      
  // Animate the explode
  
  this._animationDuration = 2;
  
  // The defualt animation duration is 2 seconds. However, due to bug 12622757, we need 
  // to shorten the animation duration in order to get smooth slice animation without jitter.
  // Bug 12622757 is specific to Google Chrome, and it requires us to poke the DOM element 
  // that contains a filter in order to show animation of children of that DOM element.
  // However, due to bug 12715889, just poking the DOM also causes jitter in the
  // slice animation.  To get rid of the jitter, we round the amount of the translation we
  // apply to the pie slice and we also shorten the duration of the animation to visually
  // smooth out the effect of the rounding
  // Bug fix 12715889
  if(this.getContext() instanceof DvtSvgContext && DvtAgent.getAgent().isWebkit())
  {
    this._animationDuration = 1;
  }
  
  var animator = new DvtAnimator(this.getContext(), this._animationDuration);

  var exEnd   = 0 ;

  var extent = this.__calcMaxExplodeDistance() ; // bug fix 8394428
  
  exEnd   = (op==DvtPieChart.EXPLODE) ? extent : 0 ;
  
  if(seriesIdx == -1) 
  {
    var arPoints = [];
    for(i=0; i< length; i++)
    {
      arPoints[i] = exEnd;
    }
    // have the animator animate all slices
    animator.addProp(DvtAnimator.TYPE_NUMBER_ARRAY, this, this._getSliceExplodes, this._setSliceExplodes, arPoints);
  }
  else if(this._pieInfo.isSliceInteractive() && seriesIdx >= 0 && seriesIdx < length)
  {
    slice = this._slices[seriesIdx];

    // animate just one slice
    animator.addProp(DvtAnimator.TYPE_NUMBER, slice, 
      slice.getExplode,
      slice.explodeSlice, 
      exEnd);
  }

  animator.play();  
}


/**
 * Perform initial fade-in effects of labels
 */
DvtPieChart.prototype._doInitFx = function(){
    
    var ar = [];
    
    var len = this._slices.length;
    for(var i=0; i<len; i++){
        var label = this._slices[i].getSliceLabel();
        ar[i] = label;
        
        if(label)
          label.setAlpha(0);
    }
    
    var anim = new DvtAnimFadeIn(this._context, ar, this.getPieInfo().getAnimationDuration());
    anim.play();
}

/** Labeling management **/

// based on processOutsideLabels in PieChart.as
// this method replaces processOutsideLabels in the actionscript

/**
 * Layout the pie labels and feelers by delegating to DvtSliceLabelLayout
 * 
 * @param {DvtPieChart} pie The pie whose labels we are going to layout
 * 
 * @private
 */
DvtPieChart._layoutLabelsAndFeelers = function(pie)
{
  var slices = pie._slices;

  if (slices && slices.length > 0)
  {
    var layout = new DvtSliceLabelLayout(pie);
    layout.layoutLabelsAndFeelers();
  }
  
}


/** end labeling code **/





/** Getters and setters **/



/**
 * @param {number} offset initial rotation
 */
DvtPieChart.prototype.setAnchorOffset = function(offset)
{
  this._anchorOffset = offset;
}

/**
 * @return {DvtPoint} The center of this pie chart
 */
DvtPieChart.prototype.getCenter = function()
{
  return this._center;
}


// no-op method; only here because the parser assumes every object has a setFill method
// we don't need it because the pie gets it from its chart object - this._Dlo.getChart()
// TODO - glook: remove when we make pie stand alone
DvtPieChart.prototype.setFill = function(fillType)
{
  return;
}


/**
 * @return {DvtRectangle} This DvtPieChart's pie frame
 */
DvtPieChart.prototype.__getFrame = function()
{
  return this._frame;
}


/**
 * @return {number} the maximum explode distance of all slices
 */
DvtPieChart.prototype.__getMaxExplodePixels = function()
{
  return this._maxExplodePixels;
}


/**
 * @return {DvtPieInfo} Non-positional pie attributes passed from the middle tier
 */
DvtPieChart.prototype.getPieInfo = function()
{
  return this._pieInfo;
}

/**
 * @param {DvtPieInfo} pieInfo Non-positional pie attributes passed from the middle tier
 */
DvtPieChart.prototype.setPieInfo = function(pieInfo)
{
  this._pieInfo = pieInfo;
}

/**
 * @return {number} the length of the pie chart's x-radius
 */
DvtPieChart.prototype.getRadiusX = function()
{
  return this._xRadius;
}


/**
 * Return the slice color for the given series
 * 
 * @param {Number} seriesIdx
 * @return {String}
 */
DvtPieChart.prototype.getSliceColor = function(seriesIdx)
{
  var slice = this._slices[seriesIdx];
  
  if(slice)
    return slice.getSliceInfo().getFillColor();
  else
    return null;
}


/**
 * Return the top surface displayable belonging to the slice with the given seriesIdx.
 * Internal API used for Automation purposes.
 * 
 * @param {Number} seriesIdx
 * @return {DvtDisplayable}
 * @private
 */
DvtPieChart.prototype._getSliceDisplayable = function(seriesIdx)
{
  if(seriesIdx >= 0 && seriesIdx < this._slices.length)
  {
    var topSurface = this._slices[seriesIdx].getTopSurface();
    if(topSurface && topSurface.length > 0)
      return topSurface[0];
  }
  
  return null;
}

/**
 * Dispatch the given event type on the pie slice with the given series index
 * Internal API used for Automation purposes
 * 
 * @param {String} eventType
 * @param {Number} sliceIdx
 */
DvtPieChart.prototype.__dispatchTestEvent = function(eventType, sliceIdx)
{
  var displayable = this._getSliceDisplayable(sliceIdx);
  displayable.dispatchDisplayableEvent(eventType);
}

/**
 * Return the slice label text for the given series
 * 
 * @param {Number} seriesIdx
 * @return {String} Slice label
 */
DvtPieChart.prototype.getSliceText = function(seriesIdx)
{
  var slice = this._slices[seriesIdx];
 
  if(slice) 
  {
    var sliceLabel = slice.getSliceLabel();
    if(sliceLabel)
      return sliceLabel.getTextString();
  }
  
  return null;
}

/**
 * Return the slice tooltip for the given series
 * 
 * @param {Number} seriesidx
 * @return {String} Slice tooltip
 */
DvtPieChart.prototype.getSliceTooltip = function(seriesIdx)
{
  var slice = this._slices[seriesIdx];
  
  if(slice)
  {
    var tooltip = slice.getSliceInfo().getTooltip();
    if(tooltip)
      return DvtGraphParser.convertLineBreaks(tooltip);    
  }

  return null;
}
 

/**
 * @return {DvtContainer} The DvtContainer where we add pie shapes and feeler lines to
 */
DvtPieChart.prototype.__getShapesContainer = function()
{
  return this._shapesContainer;
}

/**
 * @return {number} the length of the pie chart's y-radius
 */
DvtPieChart.prototype.getRadiusY = function()
{
  return this._yRadius;
}


/**
 * @return {Array} An array containing the DvtPieSlice objects in this pie chart
 */
DvtPieChart.prototype.__getSlices = function()
{
  return this._slices;
}

//---------------------------------------------------------------------//
// Animation Support                                                   //
//---------------------------------------------------------------------//

/**
 * Creates the update animation for this object.
 * @param {DvtDataAnimationHandler} handler The animation handler, which can be used to chain animations.
 * @param {DvtPieChart} oldPie The old pie state to animate from.
 */
DvtPieChart.prototype.animateUpdate = function(handler, oldPie) {
  // Create a new handler for the slices.  This handler is created to provide
  // access to the new chart for deleted objects, and to isolate the playables
  // for the pie animation from the other playables in the handler.
  var sliceHandler = new DvtDataAnimationHandler(this.getContext(), this);
  
  // Construct the animation to update slice values for the children
  sliceHandler.constructAnimation(oldPie.__getSlices(), this.__getSlices());
  var sliceAnim = sliceHandler.getAnimation();
  
  // Construct the animation to render the pie using the updated values
  var renderAnim = new DvtCustomAnimation(this.getContext(), this, this.getPieInfo().getAnimationDuration());
  renderAnim.getAnimator().addProp(DvtAnimator.TYPE_NUMBER_ARRAY, this, this._getAnimationParams, this._setAnimationParams, this._getAnimationParams());
  
  // Combine and add to the chart handler
  var anim = new DvtParallelPlayable(this.getContext(), sliceAnim, renderAnim);
    
  handler.add(anim, 0);
}

/**
 * Creates the insert animation for this object.
 * @param {DvtDataAnimationHandler} handler The animation handler, which can be used to chain animations.
 */
DvtPieChart.prototype.animateInsert = function(handler) {
  // This should never get called, since animation is only supported for a single pie
}

/**
 * Creates the delete animation for this object.
 * @param {DvtDataAnimationHandler} handler The animation handler, which can be used to chain animations.
 * @param {DvtContainer} container The container where deletes should be moved for animation.
 */
DvtPieChart.prototype.animateDelete = function(handler, container) {
  // This should never get called, since animation is only supported for a single pie
}

/**
 * @private
 */
DvtPieChart.prototype._getAnimationParams = function() {
  return [1];
}

/**
 * Called by the animation loop with a dummy parameter to force the chart to re-render.
 * @private
 */
DvtPieChart.prototype._setAnimationParams = function(params) {
  
  // First delete the current contents
  this.removeChildren();

  if (this._shapesContainer)
      this._shapesContainer.destroy();
  
  // Clear references to the removed displayables
  this._shapesContainer = null;
  
  // Then render the new ones
  this.render();
}

//---------------------------------------------------------------------//
// End Animation Support                                               //
//---------------------------------------------------------------------//

/**
 * Pseudo-method used for animation (see animateExplode)
 * 
 * @return {Array} An array containing the explode values for each slice in the pie chart
 * @private
 */
DvtPieChart.prototype._getSliceExplodes = function()
{
  var explodeValues = [];
  var len = this._slices.length;
  for(var i=0; i<len; i++)
  {
    explodeValues[i] = this._slices[i].getSliceInfo().getExplode();
  }

  return explodeValues;
}

/**
 * Pseudo-method used for animation (see animateExplode)
 * 
 * @param {Array} newExplodeValues An array of numbers corresponding to the explode values for each slice
 * @private 
 */
DvtPieChart.prototype._setSliceExplodes = function(newExplodeValues)
{
  // check if the new explode value is different from the old, and if so, update   
  var len = this._slices.length;
  for(var i=0; i<len; i++)
  {
    var slice = this._slices[i];
    var newExplodeVal = newExplodeValues[i];
      
    if(slice.getSliceInfo().getExplode() != newExplodeVal)
    {
      slice.explodeSlice(newExplodeVal);
      
      // Find the maximum explosion, used to layout labels
      if(newExplodeVal > this._maxExplodePixels) {
        this._maxExplodePixels = newExplodeVal;
      }
    }
  }  
}



/**
 * @return {number} The pie chart's depth
 */
DvtPieChart.prototype.getDepth = function()
{
  return this._depth;
}

/**
 * @param {number} depth The pie chart's depth
 */
DvtPieChart.prototype.setDepth = function(depth)
{
  this._depth = depth;
}

//---------------------------------------------------------------------//
// Ordering Support: ZOrderManager impl                                //
//---------------------------------------------------------------------//

/**
 * @override
 */
DvtPieChart.prototype.bringToFrontOfSelection = function(slice)
{
  var par = slice.getPieChart()._shapesContainer;
  if (par)
  {
    var parentChildCount = par.getNumChildren();
    if (parentChildCount - this._numFrontObjs > 1)
    {
      // Only change z-order for top surface
      par.removeChild(slice._topSurface[0]);
      var newIndex = parentChildCount - this._numFrontObjs - 1;
      par.addChildAt(slice._topSurface[0], newIndex);
    }
  }
};

/**
 * @override
 */
DvtPieChart.prototype.pushToBackOfSelection = function(slice)
{
  var len = this._slices.length;
  var counter = 0;
  for (i=0; i<len; i++) {
      if (this._slices[i].isSelected())
      counter ++;
  }
  this._numSelectedObjsInFront = counter;
  //move the object to the first z-index before the selected objects
  var par = slice.getPieChart()._shapesContainer;
  if (par)
  {
    var parentChildCount = par.getNumChildren();
    var newIndex = parentChildCount - this._numFrontObjs - 1 - this._numSelectedObjsInFront;
    if (newIndex >= 0)
    {
      par.removeChild(slice._topSurface[0]);
      par.addChildAt(slice._topSurface[0], newIndex);
    }
  }
};

/**
 * @override
 */
DvtPieChart.prototype.setNumFrontObjs = function(num)
{
  this._numFrontObjs = num;
};


// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*---------------------------------------------------------------------*/
/* Class DvtPieInfo       Pie information from the parser              */
/*---------------------------------------------------------------------*/

/**
 * Property bag to hold non-positional pie attributes passed to the client from the middle tier
 * 
 * @constructor
 */
 
var DvtPieInfo = function()
{
   this._init() ;
}; 

DvtObj.createSubclass(DvtPieInfo, DvtObj, "DvtPieInfo");

/**
 * Private helper function to initialize the pie info's private fields
 * 
 * @private 
 */
DvtPieInfo.prototype._init = function()
{
   this._labelPosition = DvtPieChart.LABEL_POS_UNSPEC ;
   this._labelType     = DvtPieChart.LABEL_TYPE_UNSPEC ;
   this._feelerColor   = "#000000" ;

   this._style     = null; // DvtCSSStyle
   this._converter = null;
   
   this._arSliceLabels = null;
   this._labelVF = null; // DvtValueFormat
   
   this._isSliceInteractive = false; // boolean indicating whether or not interactive slice behavior is enabled
  
   this._fillType = DvtFill.NONE; // represents the series effect; one of DvtFill.COLOR, DvtFill.GRADIENT, 
                                  // DvtFill.IMAGE, DvtFill.NONE, or DvtFill.PATTERN 
   this._hasVisualEffects = true; // boolean flag for visual effects                            
                                  
   this._id = null; // String
   this._isInitFx = false; // boolean indicating whether initial display animation is on
};


/**
 * Returns a boolean indicating if animation on display has been enabled
 * 
 * @return {boolean} true if animation on display has been enabled, false otherwise
 */
DvtPieInfo.prototype.isInitFx = function(){
    return this._isInitFx;
}

/**
 * Enables animation on display
 * 
 * @param {boolean} enable
 */
DvtPieInfo.prototype.setInitFx = function(initfx){
    this._isInitFx = initfx;
}

/**
 * Returns the feeler color
 * 
 * @return {String}
 */
DvtPieInfo.prototype.getFeelerColor = function()
{
  return this._feelerColor;
}

/**
 * Sets the feeler color
 * 
 * @param {String} color
 */
DvtPieInfo.prototype.setFeelerColor = function(color)
{
  this._feelerColor = color;
}


/**
 * Returns the fill type (series effect) applied to this pie chart
 * 
 * @return {number} One of DvtFill.COLOR, DvtFill.GRADIENT, DvtFill.IMAGE, DvtFill.NONE, or DvtFill.PATTERN 
 */
DvtPieInfo.prototype.getFillType = function()
{
  return this._fillType;
}

/**
 * Sets the fill type (series effect)
 * 
 * @param {number} fillType One of DvtFill.COLOR, DvtFill.GRADIENT, DvtFill.IMAGE, DvtFill.NONE, or DvtFill.PATTERN 
 */
DvtPieInfo.prototype.setFillType = function(fillType)
{
  this._fillType = fillType;
}

/**
 * Returns the CSS style font attributes
 * 
 * @return {DvtCSSStyle}
 */
DvtPieInfo.prototype.getCSSStyle = function()
{
  return this._style;
}

/**
 * Sets the CSS style font attributes
 * 
 * @param {DvtCSSStyle} style
 */
DvtPieInfo.prototype.setCSSStyle = function(style)
{
  this._style = style;
}


/**
 * Returns the id for this pie.
 * 
 * @return {String}
 */
DvtPieInfo.prototype.getId = function()
{
  return this._id;
}

/**
 * Sets the id for this pie.
 * 
 * @param {String} id
 */
DvtPieInfo.prototype.setId = function(id)
{
  this._id = id;
}

/**
 * Returns the location of the labels
 * 
 * @return {number} One of DvtPieChart.LABEL_POS_UNSPEC, DvtPieChart.LABEL_POS_NONE, DvtPieChart.LABEL_POS_INSIDE,
 *                  DvtPieChart.LABEL_POS_OUTSIDE, or DvtPieChart.LABEL_POS_OUTSIDE_FEELERS
 */
DvtPieInfo.prototype.getLabelPosition = function()
{
  return this._labelPosition;
}
 
/**
 * Sets the location of the labels
 * 
 * @param {number} One of DvtPieChart.LABEL_POS_UNSPEC, DvtPieChart.LABEL_POS_NONE, DvtPieChart.LABEL_POS_INSIDE,
 *                 DvtPieChart.LABEL_POS_OUTSIDE, or DvtPieChart.LABEL_POS_OUTSIDE_FEELERS
 */
DvtPieInfo.prototype.setLabelPosition = function(pos)
{
  this._labelPosition = pos;
}


/**
 * Returns the slice labels
 * 
 * @return {Array} An array of strings listing the slice labels
 */
DvtPieInfo.prototype.getLabels = function()
{
  return this._arSliceLabels;
}

/**
 * Sets the slice labels
 * 
 * @param {Array} labels An array of strings listing the slice labels 
 */
DvtPieInfo.prototype.setLabels = function(labels)
{
  this._arSliceLabels = labels;
}



/**
 * Returns the type of label contents
 * 
 * @return {number} One of DvtPieChart.LABEL_TYPE_UNSPEC, DvtPieChart.LABEL_TYPE_PERCENT, DvtPieChart.LABEL_TYPE_VALUE,
 *                  DvtPieChart.LABEL_TYPE_TEXT, DvtPieChart.LABEL_TYPE_TEXT_PERCENT, 
 *                  DvtPieChart.LABEL_TYPE_TEXT_VALUE, or DvtPieChart.LABEL_TYPE_CUSTOM   
 */
DvtPieInfo.prototype.getLabelType = function()
{
  return this._labelType;
}

/**
 * Sets the type of label contents
 * 
 * @param {number} One of DvtPieChart.LABEL_TYPE_UNSPEC, DvtPieChart.LABEL_TYPE_PERCENT, DvtPieChart.LABEL_TYPE_VALUE,
 *                 DvtPieChart.LABEL_TYPE_TEXT, DvtPieChart.LABEL_TYPE_TEXT_PERCENT, 
 *                 DvtPieChart.LABEL_TYPE_TEXT_VALUE, or DvtPieChart.LABEL_TYPE_CUSTOM   
 */
DvtPieInfo.prototype.setLabelType = function(type)
{
  this._labelType = type;
}

/**
 * Returns the converter for the label
 * 
 * @return {object} the converter for the label
 */
 DvtPieInfo.prototype.getConverter = function() 
 {
     return this._converter;
 }
 
 /**
  * Sets the converter for the label
  * 
  * @param {object} the converter for the label
  */
  DvtPieInfo.prototype.setConverter = function(converter) 
  {
    this._converter = converter;
  }


/**
 * Returns a boolean indicating if interactiveSliceBehavior has been enabled
 * 
 * @return {boolean} true if interactive slice behavior has been enabled, false otherwise
 */
DvtPieInfo.prototype.isSliceInteractive = function()
{
  return this._isSliceInteractive;
}

/**
 * Enables interactive slice behavior
 * 
 * @param {boolean} enable
 */
DvtPieInfo.prototype.setSliceInteractive = function(enable)
{
  this._isSliceInteractive = enable;
}

/**
 * Returns the DvtValueFormat object for this DvtPieChart
 * 
 * @return {DvtValueFormat}
 */
DvtPieInfo.prototype.getValueFormat = function()
{
  return this._labelVF
}

/**
 * Sets the DvtValueFormat object for this DvtPieChart
 * 
 * @param {DvtValueFormat} format
 */
DvtPieInfo.prototype.setValueFormat = function(format)
{  
   this._labelVF = format;
}

/**
 * Returns a boolean indicating if visual effects are enabled on this pie (visualEffects=AUTO)
 * 
 * return {boolean} true if visualEffects is set to AUTO, false if visualEffects is set to NONE
 */
 DvtPieInfo.prototype.hasVisualEffects = function()
 {
   return this._hasVisualEffects;
 }
 
 /**
  * Sets the visual effects on this pie chart
  * 
  * @param {boolean} hasVisualEffects
  */
  DvtPieInfo.prototype.setVisualEffects = function(hasVisualEffects)
  {
    this._hasVisualEffects = hasVisualEffects;
  }
  
  /**
   * Returns the animation duration for this pie.
   * @return {number}
   */
  DvtPieInfo.prototype.getAnimationDuration = function() {
    return this._duration;
  }
  
  /**
   * Specifies the animation duration for this pie.
   * @param {number} duration
   */
  DvtPieInfo.prototype.setAnimationDuration = function(duration) {
    this._duration = duration;
  }
  
// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*---------------------------------------------------------------------*/
/*   DvtPieRenderUtils                                                 */
/*---------------------------------------------------------------------*/
/**
  *   @class DvtPieRendeurUtils
  *   @constructor
  */
var DvtPieRenderUtils = function()
{};

DvtObj.createSubclass(DvtPieRenderUtils, DvtObj, "DvtPieRenderUtils");

/** @final  @type String  */
DvtPieRenderUtils.TWOD    = "2D";
/** @final  @type String  */
DvtPieRenderUtils.THREED  = "3D";
/** @final  @type String  */
DvtPieRenderUtils.CRUST   = "CRUST";
/** @final  @type String  */
DvtPieRenderUtils.SIDE    = "SIDE";
/** @final  @type String  */
DvtPieRenderUtils.OVERLAY = "OVERLAY";
/** @final  @type String  */
DvtPieRenderUtils.BORDER  = "BORDER";


/**
* Returns a <code>Point</code> object representing a point at a given 
* angle at a distance specified by the rx and ry radius from the center cx, cy.
* 
* Function reflects input angle over the y-axis.  It then scales the 
* cosine and sine of this angle by rx and ry, and then translates
* the cosine and sine values by cx and cy.  The reflected, scaled, and
* translated angle's cosine and sine values are then returned
*
* @param {number} angle A <code>Number</code> representing the desired angle in degrees.
* @param {number} cx    A <code>Number</code> indicating the center horizontal position.
* @param {number} cy    A <code>Number</code> indicating the center vertical position.
* @param {number} rx    A <code>Number</code> indicating the horizontal radius.
* @param {number} ry    A <code>Number</code> indicating the vertical radius.
*
* @return A point object with the calculated x and y fields.
*/  
    
// original code taken from com.oracle.dvt.shape.draw.utils.RenderUtils
// function originally called rotatePoint -- but that was a serious misnomer

DvtPieRenderUtils.reflectAngleOverYAxis = function(angle, cx, cy, rx, ry)
{
  var pt = {x:0, y:0};
     
  var radian = DvtMath.degreesToRads(360 - angle) ;
  var cosine    = Math.cos( radian ) ;
  var sine      = Math.sin( radian ) ;
     
  pt.x = cx + (cosine * rx) ;
  pt.y = cy + (sine * ry) ;
     
  return pt;    
}


 
/**
  *   Utility function to convert a hexValue to base 10.
  *   @private
  */
// utility function to convert a hexValue to base 10
DvtPieRenderUtils._hexToDecimal = function(hexValue)
{
  return parseInt(hexValue,16);
}

/**
  *   Utility function to compute the ratio of hexValue (specified in hex) to the
  *   maxValue, (also specified in hex)
  *   @private
  */
DvtPieRenderUtils._hexToRatio = function(input, max)
{
  var inputValueAsDecimal = DvtPieRenderUtils._hexToDecimal(input);
  var maxValueAsDecimal = DvtPieRenderUtils._hexToDecimal(max);
  return inputValueAsDecimal/maxValueAsDecimal;
}
 
// ported over from PieUtils
/**
 * Returns an array of colors (with no alphas) for use in creating a gradient, based on a base color and where the gradient
 * will be applied
 * 
 * @param {String} baseColor
 * @param {String} style Either DvtPieRenderUtils.TWOD, DvtPieRenderUtils.THREED, DvtPieRenderUtils.CRUST, 
 *                          DvtPieRenderUtils.SIDE, DvtPieRenderUtils.OVERLAY, or DvtPieRenderUtils.BORDER  
 * 
 * @return {Array}
 */
DvtPieRenderUtils.getGradientColors = function(baseColor, style) 
{
  var arColors ;
         
  if (style == DvtPieRenderUtils.TWOD)
  {
    arColors = [];
    arColors[0] = DvtColorUtils.getRGB(DvtColorUtils.getPastel(baseColor, 0.1));
    arColors[1] = arColors[0] ;
    arColors[2] = DvtColorUtils.getRGB(DvtColorUtils.getDarker(baseColor, 0.9));
  }
  else if (style == DvtPieRenderUtils.BORDER)
  {
    // baseColor ignored
    arColors = [];
    arColors[0] = DvtColorUtils.makeRGB(255,255,255);
    arColors[1] = DvtColorUtils.makeRGB(0,0,0);
    arColors[2] = DvtColorUtils.makeRGB(0,0,0);
  }
  else if (style == DvtPieRenderUtils.OVERLAY)
  {
    // baseColor ignored
    arColors = [];
    arColors[0] = DvtColorUtils.makeRGB(255,255,255);
    arColors[1] = DvtColorUtils.makeRGB(255,255,255);
    arColors[2] = DvtColorUtils.makeRGB(DvtPieRenderUtils._hexToDecimal("6c"),
                                          DvtPieRenderUtils._hexToDecimal("76"),
                                          DvtPieRenderUtils._hexToDecimal("80"));
  }
  else
  {
    var c  = DvtColorUtils.getRGB(DvtColorUtils.getDarker(baseColor, 0.88));
    var c1 = DvtColorUtils.getRGB(DvtColorUtils.getPastel(baseColor, .05));
    var c2 = DvtColorUtils.getRGB(DvtColorUtils.getPastel(baseColor, .15));
    var c3 = DvtColorUtils.getRGB(DvtColorUtils.getPastel(baseColor, .35));

    if (style == DvtPieRenderUtils.CRUST)
    {
      // in the Perspective Java code, it looks like additional color (up front) is added.
      // check this with the newest download - look at XML spec!
             
      arColors = [];

      arColors[0] = c;
      arColors[1] = c2;
      arColors[2] = c3; 
      arColors[3] = c;
    }
    else if (style == "SIDE")
    {
      arColors = [];
             
      arColors[0] = c;
      arColors[1] = c3; 
    }
    else if (style == "3D")
    {
      arColors = [];
             
      arColors[0] = c3;
      arColors[1] = c2;
      arColors[2] = c;
      arColors[3] = c1; 
      arColors[4] = c3;
    }
  }
         
  return arColors ;
}


// ported over from PieUtils
/**
 * Returns an array of alphas for use in creating a gradient, based on an initial alpha value and where the gradient
 * will be applied
 * 
 * @param {number} baseAlpha
 * @param {String} style Either DvtPieRenderUtils.TWOD, DvtPieRenderUtils.THREED, DvtPieRenderUtils.CRUST, 
 *                          DvtPieRenderUtils.SIDE, DvtPieRenderUtils.OVERLAY, or DvtPieRenderUtils.BORDER  
 * 
 * @return {Array}
 */
DvtPieRenderUtils.getGradientAlphas = function(baseAlpha, style) 
{
  var alpha = (baseAlpha == null || isNaN(baseAlpha) || baseAlpha == 0) ? 1.0 : baseAlpha ;
  var arAlphas ;

  if (style == DvtPieRenderUtils.TWOD)
  {
    arAlphas = []
    arAlphas[0] = alpha ;
    arAlphas[1] = alpha ;
    arAlphas[2] = alpha ;
  }
  else if (style == DvtPieRenderUtils.BORDER)
  {
    arAlphas = [];
    arAlphas[0] = (alpha / (0xFF / 0xA0)) ;
    arAlphas[1] = (alpha / (0xFF / 0x30)) ;
    arAlphas[2] = (alpha / (0xFF / 0x60)) ;
  }
  else if (style == DvtPieRenderUtils.OVERLAY)
  {
    arAlphas = [];
    arAlphas[0] = (alpha / (0xFF / 0x64)) ;
    arAlphas[1] = (alpha / (0xFF / 0x50)) ;
    arAlphas[2] = 0.0 ;
  }
  else if (style == DvtPieRenderUtils.THREED)
  {
    arAlphas = [];
    arAlphas[0] = alpha ;
    arAlphas[1] = alpha ;
    arAlphas[2] = alpha ;
    arAlphas[3] = alpha ;
    arAlphas[4] = alpha ;
  }
  else if (style == DvtPieRenderUtils.CRUST)
  {
    arAlphas = [];
    arAlphas[0] = alpha ;
    arAlphas[1] = alpha ;
    arAlphas[2] = alpha ;
    arAlphas[3] = alpha ;
  }
  else if (style == DvtPieRenderUtils.SIDE)
  {
    arAlphas = [];
    arAlphas[0] = alpha ;
    arAlphas[1] = alpha ;
  }

  return arAlphas ;
}

// ported over from PieUtils
/**
 * Returns an array of stops for use in creating a gradient, based on where the gradient will be applied
 * 
 * @param {String} style Either DvtPieRenderUtils.TWOD, DvtPieRenderUtils.THREED, DvtPieRenderUtils.CRUST, 
 *                          DvtPieRenderUtils.SIDE, DvtPieRenderUtils.OVERLAY, or DvtPieRenderUtils.BORDER  
 * 
 * @return {Array}
 */
DvtPieRenderUtils.getGradientRatios = function(style) 
{
  var arRatios;

  if (style == DvtPieRenderUtils.TWOD)
  {
    arRatios = [];
    arRatios[0] = 0.2;
    arRatios[1] = 0.5;
    arRatios[2] = 1.0;
  }
  else if (style == DvtPieRenderUtils.BORDER)
  {
    arRatios = [];
    arRatios[0] = 0.0;
    arRatios[1] = 0.5;  
    arRatios[2] = 1.0;
  }
  else if (style == DvtPieRenderUtils.OVERLAY)
  {
    arRatios = [];
    arRatios[0] = 0.0;
    arRatios[1] = 0.18;
    arRatios[2] = 1.0;
  }
  else if (style == DvtPieRenderUtils.THREED)
  {
    arRatios = [];
    arRatios[0] = 0.0;
    arRatios[1] = 0.29;
    arRatios[2] = 0.55;
    arRatios[3] = 0.84;
    arRatios[4] = 1.0;
  }
  else if (style == DvtPieRenderUtils.CRUST)
  {
    // see comment under "CRUST" in getGradientColors()
    //arRatios = [ (0.0 * 255), (0.14 * 255), (0.43 * 255), (0.91 * 255), (1.0 * 255) ] ;
    arRatios = [];
    arRatios[0] = 0.0;
    arRatios[1] = 0.43;
    arRatios[2] = 0.91;
    arRatios[3] = 1.0;
  }
  else if (style == DvtPieRenderUtils.SIDE)
  {
    arRatios = [];
    arRatios[0] = 0.0;
    arRatios[1] = 1.0;
  }

  return arRatios ;
}

// Copyright (c) 2008, 2013, Oracle and/or its affiliates. 
// All rights reserved. 

/*---------------------------------------------------------------------*/
/*   DvtPieSlice                                                       */
/*---------------------------------------------------------------------*/

/*
 * Call chain:
 * 
 * DvtPieChart creates each logical DvtPieSlice object.  The physical surface objects are 
 * then created in DvtPieChart.render, by calling DvtPieSlice.preRender()
 * 
 * In DvtPieSlice.preRender() we
 * 
 * 1. setup the gradient used for this DvtPieSlice
 * 2. create the physical objects representing each surface
 * 
 * The labels are then created and laid out by DvtSliceLabelLayout.layoutLabelsAndFeelers.
 * 
 * After the label layout is complete, DvtPieChart then calls
 * 
 * 1. render() to render the pie slice itself
 * 2. renderLabelAndFeeler() to render the pie label and feeler (if necessary)
 * 
 */


/**
 * Creates an instance of DvtPieSlice
 * 
 * @param {DvtPieChart} pieChart A reference to the DvtPieChart that contains this slice
 * @param {DvtSliceInfo} sliceInfo Slice parameters sent down from the middle tier
 * @class DvtPieSlice
 * @constructor
 * @implements {DvtLogicalObject}
 * @implements {DvtCategoricalObject}
 * @implements {DvtSelectable}
 * @implements {DvtTooltipSource}
 * @implements {DvtPopupSource}
 * @implements {DvtContextMenuSource}
 */ 
var DvtPieSlice = function(pieChart, sliceInfo)
{
  this.Init(pieChart, sliceInfo);
}

DvtObj.createSubclass(DvtPieSlice, DvtObj, "DvtPieSlice");

/**
 * Object initializer
 * 
 * @param {DvtPieChart} pieChart A reference to the DvtPieChart that contains this slice
 * @param {DvtSliceInfo} sliceInfo Slice parameters sent down from the middle tier
 * @private 
 */
DvtPieSlice.prototype.Init = function(pieChart, sliceInfo)
{
   this._pieChart = pieChart;
   this._sliceInfo = sliceInfo;   
   
   this._angleStart = 0;
   this._angleExtent = 0;
   
   this._topSurface = null; // an array of DvtShapes representing the top of the slice
   this._leftSurface = null;  // an array of DvtShapes representing the left side of the slice 
                              // ("left" as seen from the tip of the slice)
   this._rightSurface = null; // an array of DvtShapes representing the right side of the slice 
                              // ("right" as seen from the tip of the slice)
   this._crustSurface = null; // an array of DvtShapes representing the crust of the slice                              
   
   this._explodeOffsetX = 0;
   this._explodeOffsetY = 0;
   
   this._sliceLabel = null;
   this._sliceLabelPosition = null;
   this._sliceLabelString = null;
   
   this._hasFeeler = false;
   this._feelerRad = null;          // the section of the feeler closest to the pie
   this._feelerHoriz = null;        // the section of the feeler closest to the label
   
   this._outsideFeelerStart = null; // a point class with x and y fields. This represents the point on the pie 
                                    // from which the feeler originates in the unexploded state
   this._outsideFeelerMid = null;   // a point class with x and y fields. This represents the point on the pie 
                                    // from which the feeler bends                           
   this._outsideFeelerEnd = null;   // a point class with x and y fields. This represents the point not on the pie 
                                    // at which the feeler ends
   
   this._selected = false;
   this._selecting = false;
   
   this._radiusX = this._pieChart.getRadiusX();
   this._radiusY = this._pieChart.getRadiusY();
};

/**
 * Returns the owning DvtPieChart object.
 * @return {DvtPieChart}
 */
DvtPieSlice.prototype.getPieChart = function() {
  return this._pieChart;
}
 
/**
 * Render the pie slice only; rendering of label and feeler
 * occurs in DvtPieSlice.renderLabelAndFeelers
 */
DvtPieSlice.prototype.render = function()
{
  var sortedSurfaces = DvtPieSlice._sortPieSurfaces(this._topSurface, 
                                                    this._leftSurface, this._rightSurface, this._crustSurface,
                                                    this._angleStart, this._angleExtent);
  var len = sortedSurfaces.length;
  for(var i=0; i <len; i++)
  {
    var shapeArray = sortedSurfaces[i];
    // shapeArray is an array of DvtShapes representing the given surface. 
    // Iterate through this array and add each shape to the pieChart
    shapeCount = shapeArray.length;
    for(var j=0; j<shapeCount; j++)
    {
      var shapesContainer = this._pieChart.__getShapesContainer();
      shapesContainer.addChild(shapeArray[j]);
      if(shapeArray[j].render) // render is only defined on certain shape subclasses
        shapeArray[j].render();
    }
  }
    
};


/**
 * Render the pie slice's label and feeler (if necessary)
 */
DvtPieSlice.prototype.renderLabelAndFeeler = function()
{
  // assume that all layout and text truncation has already been done
  // so in theory, we just need to call addChild with the feeler and label
  var sliceLabel = this._sliceLabel;
  if(sliceLabel) 
  { 
    this._pieChart.addChild(this._sliceLabel);
    
    // Associate the shapes with the slice for use during event handling
    DvtPieSlice._associate(this, [this._sliceLabel]);
    
    if(this._pieChart.getPieInfo().getLabelPosition() == DvtPieChart.LABEL_POS_OUTSIDE_FEELERS)
    {
      this._renderOutsideFeeler();
    }
  }
  
}

DvtPieSlice.prototype._feelerFromPts = function(pt1, pt2) {
  var context = this._pieChart.getContext();
  var feeler = new DvtLine(context, pt1.x, pt1.y, pt2.x, pt2.y);
  
  var color = this._pieChart.getPieInfo().getFeelerColor();
  var stroke = new DvtSolidStroke(color);  
  feeler.setStroke(stroke);
  
  if (!this._pieChart.contains(feeler)) {
    //add the feeler in the z-order just below this slice so the
    //slice will overlap it
    var shapesContainer = this._pieChart.__getShapesContainer();
    var sliceTopIndex = shapesContainer.getChildIndex(this._topSurface[0]);
    shapesContainer.addChildAt(feeler, sliceTopIndex);
  }
  
  return feeler;
}


/**
 * Render a feeler outside the slice.
 * @private
 */
DvtPieSlice.prototype._renderOutsideFeeler = function()
{
  if (!this._hasFeeler) {
    return;
  }
  
  var feelerRad = this._feelerFromPts(this._outsideFeelerStart, this._outsideFeelerMid);
  var feelerHoriz = this._feelerFromPts(this._outsideFeelerMid, this._outsideFeelerEnd);
    
  // Store a reference to it so that we can remove
  this._feelerRad = feelerRad;
  this._feelerHoriz = feelerHoriz;
}



// ported over from PieSlice.as
/**
 * Creates the gradients and physical shapes for the pie surfaces. Z-Ordering of the shapes
 * and layout and creation of the pie label is done elsewhere.
 */
DvtPieSlice.prototype.preRender = function()
{
    // adjust center for exploded slice
    this.explodeSlice(this._sliceInfo.getExplode()) ;
    this._createSurfaces();
};

// ported over from PieSlice.as
/**
 * Create all the physical shapes representing the surfaces for this DvtPieSlice.
 * 
 * @private
 */
DvtPieSlice.prototype._createSurfaces = function()
{   

    var ft = this._pieChart.getPieInfo().getFillType();
    var topFill; //fill for top of pie
    var lateralFill; //fill for sides of pie
    
    if ( ft == DvtFill.GRADIENT) {
        var style ;
        var arColors ;
        var arAlphas ;
        var arRatios ;
        var grAngle = 0 ;  // ?????
                     
        style = (! this._pieChart.is3D()) ? "2D" : "3D" ;
        
        arColors = DvtPieRenderUtils.getGradientColors(this._sliceInfo.getFillColor(), style) ;
        arAlphas = DvtPieRenderUtils.getGradientAlphas(this._sliceInfo.getFillAlpha(), style) ;
        arRatios = DvtPieRenderUtils.getGradientRatios(style) ;
        
        grAngle = 297 ;    // ?????  <--- mystery constant ported over from PieSlice.as
        
//        grAngle = 360 - grAngle ;        // HTML5 Toolkit rotates from 0 clockwise so
                                         // convert to anticlockwise convention
                                         
        var arBounds = [Math.floor(this._pieChart.getCenter().x - this._pieChart.getRadiusX()), 
                        Math.floor(this._pieChart.getCenter().y - this._pieChart.getRadiusY()),
                        Math.ceil(2 * this._pieChart.getRadiusX()), Math.ceil(2 * this._pieChart.getRadiusY()) ];
        
        topFill = new DvtLinearGradientFill(grAngle, arColors, arAlphas, arRatios, arBounds) ;
    } else if (ft == DvtFill.PATTERN) {
        topFill = new DvtPatternFill(this._sliceInfo.getFillPattern(), this._sliceInfo.getFillColor())

    } else {
        topFill = new DvtSolidFill(this._sliceInfo.getFillColor(), this._sliceInfo.getFillAlpha());
        lateralFill = new DvtSolidFill(DvtColorUtils.getRGB(DvtColorUtils.getDarker(this._sliceInfo.getFillColor(), 0.60)), 
        this._sliceInfo.getFillAlpha());
    }
    
    this._topSurface = DvtPieSlice.createTopSurface(this, topFill);  

    // validate 3D effect
    if (this._pieChart.is3D() && (this._pieChart.getDepth() > 0 || this._pieChart.getRadiusX() != this._pieChart.getRadiusY()))
    {
        //
        // break up large arcs - arcs greater than a quadrant (> 90)
        // taken from bglazer: new rendering technique to create 3 separate surfaces for crust, 
        // left, and right edges
        // don't need to create surfaces in correct z-order because all surfaces
        // will be sorted in render, when we call DvtPieSlice._sortPieSurfaces
    
        var sideFill = lateralFill;
        var crustFill = lateralFill;
        
        if ( ft == DvtFill.GRADIENT || ft == DvtFill.PATTERN)
        {
          crustFill = DvtPieSlice._generateLateralGradientFill(this, DvtPieRenderUtils.CRUST); 
          sideFill = DvtPieSlice._generateLateralGradientFill(this, DvtPieRenderUtils.SIDE); 
        }
        
        this._leftSurface  = DvtPieSlice.createLeftSide(this, sideFill);
        this._rightSurface = DvtPieSlice.createRightSide(this, sideFill);
        this._crustSurface = DvtPieSlice.createCrust(this, crustFill);
    } // end 3D pie check
}



// This logic is ported over from PieChart.sortSliversBySlice, and pushed
// from the PieChart to the PieSlice
/**
 * Sorts this DvtPieSlice's surfaces by z-order
 * 
 * @param {Array} topSurface An array of DvtShapes representing the top of this DvtPieSlice
 * @param {Array} leftSurface An array of DvtShapes representing the left side of this DvtPieSlice (as seen from
                  the tip of the slice)
 * @param {Array} rightSurface An array of DvtShapes representing the right side of this DvtPieSlice (as seen from
                  the tip of the slice)
 * @param {Array} crustSurface An array of DvtShapes representing the crust of this DvtPieSlice
 * @param {number} angleStart The starting position of this pie slice
 * @param {number} angleExtent The angular size of this pie slice
 * 
 * @return {Array} A sorted array of arrays (two-dimensional array) of DvtShape objects for this slice to render.
 * @private
 */
DvtPieSlice._sortPieSurfaces = function(topSurface, leftSurface, rightSurface, crustSurface, angleStart, angleExtent)
{
  var sortedSurfaces = [];
  
  if(leftSurface && rightSurface && crustSurface) 
  {  
    // ported from PieChart.sortSliversBySlice
    // NOTE that instead of relying on the order in which the surfaces were 
    // originally created, we just get them from associative array by name    
    
    // the last slice to render, 
    // or if a slice starts at 270 degrees/6 o'clock (Fix for BUG 12577691)
    if(angleStart <= 270 && (angleStart + angleExtent > 270))
    {
      //we're in the bottom-most slice, so add surfaces in back-to-front z-order:
      //left edge, right edge, crust
      
      sortedSurfaces.push(leftSurface);
      sortedSurfaces.push(rightSurface);
      sortedSurfaces.push(crustSurface);
    }
  
    // right-side of the pie
    else if(angleStart > 270 || (angleStart + angleExtent <= 90))
    {
      //we're in the right side of the pie, so add surfaces in back-to-front z-order:
      //left edge, crust, right edge

      sortedSurfaces.push(leftSurface) ;
      sortedSurfaces.push(crustSurface) ;
      sortedSurfaces.push(rightSurface) ;      
    }
  
    else 
    {
      //we're in the left side of the pie, so add surfaces in back-to-front z-order:
      //right edge, crust, left edge
      
      sortedSurfaces.push(rightSurface) ;
      sortedSurfaces.push(crustSurface) ;
      sortedSurfaces.push(leftSurface) ;  
    }
  
  }
  
  // top is rendered last
  sortedSurfaces.push(topSurface);
  
  return sortedSurfaces;
}


/**
 * Returns true if (x-y1) and (x-y2) have different signs
 */
DvtPieSlice.oppositeDirection = function(x, y1, y2) {
  var positive1 = (x - y1) > 0;
  var positive2 = (x - y2) > 0;
  return positive1 != positive2;
}


/**
 * Explodes the DvtPieSlice and feeler line by the given explode amount from the center of the pie.
 * 
 * @param {number} explode Amount by which to explode this DvtPieSlice out. 0 means slice is not exploded.
 */
DvtPieSlice.prototype.explodeSlice = function(explode)
{
  this._sliceInfo.setExplode(explode) ;

  if (explode != 0)
  {
    var arc   = this._angleExtent ;
    var angle = this._angleStart ;
    var fAngle = angle + ( arc / 2 ) ;
    var radian = (360 - fAngle) * DvtMath.RADS_PER_DEGREE ;
            

    var tilt   = this._pieChart.getRadiusY() / this._pieChart.getRadiusX() ; 

    // bug fix 8394428
    var explodeOffset      = this._sliceInfo.getExplode() ;
    var maxExplodeDistance = this._pieChart.__calcMaxExplodeDistance() ;
                
    if (maxExplodeDistance < explodeOffset)
      explodeOffset = maxExplodeDistance ; 
                
    this._explodeOffsetX = ((Math.cos(radian) * explodeOffset));
    this._explodeOffsetY = ((Math.sin(radian) * tilt * explodeOffset));
    
    // To work around bug 12715831, in the 2D pie case, we need to poke the 
    // DOM element that contains the shadow filter that is applied to the pie slices.
    // However, due to bug 12715889, just poking the DOM also causes jitter in the
    // slice animation.  To get rid of the jitter, we round the amount of the translation we
    // apply to the pie slice and we also shorten the duration of the animation to visually smooth
    // out the result of the rounding.
    // Bug fix 12715889
    if(this._pieChart.getContext() instanceof DvtSvgContext && DvtAgent.getAgent().isWebkit())
    {
      this._explodeOffsetX = Math.round(this._explodeOffsetX);
      this._explodeOffsetY = Math.round(this._explodeOffsetY);
    }
  }
  else
  {
    this._explodeOffsetX = 0 ;
    this._explodeOffsetY = 0 ;    
  }
  
  // now update each surface
   
  if(this._topSurface)
  {
    DvtPieSlice._translateShapes(this._topSurface, this._explodeOffsetX, this._explodeOffsetY);
  }
  
  if(this._rightSurface)
  {
    DvtPieSlice._translateShapes(this._rightSurface, this._explodeOffsetX, this._explodeOffsetY);  
  }
  
  if(this._leftSurface)
  {
    DvtPieSlice._translateShapes(this._leftSurface, this._explodeOffsetX, this._explodeOffsetY);  
  }  

  if(this._crustSurface)
  {
    DvtPieSlice._translateShapes(this._crustSurface, this._explodeOffsetX, this._explodeOffsetY);  
  }  

  // update the feeler line
  if(this._hasFeeler) {
    // get current starting x and y, and then update the feeler line only
    var oldStartX = this._outsideFeelerStart.x;
    var oldStartY = this._outsideFeelerStart.y;
    
    var newStartX = oldStartX + this._explodeOffsetX;
    var newStartY = oldStartY + this._explodeOffsetY;
    
    this._feelerRad.setX1(newStartX);
    this._feelerRad.setY1(newStartY);
    
    var oldMidX = this._outsideFeelerMid.x;
    var oldMidY = this._outsideFeelerMid.y;
    
    //The midpoint of the feeler has to be updated if the new radial feeler is pointing towards an opposite direction;
    //otherwise, the feeler will go through the slice.
    //The easy solution is to set the x/y of the midPt to be the same as startPt.
    
    if (DvtPieSlice.oppositeDirection(oldMidX, oldStartX, newStartX)) {
      this._feelerRad.setX2(newStartX);
      this._feelerHoriz.setX1(newStartX);
    } else {
      this._feelerRad.setX2(oldMidX);
      this._feelerHoriz.setX1(oldMidX); 
    }
    
    if (DvtPieSlice.oppositeDirection(oldMidY, oldStartY, newStartY)) {
      this._feelerRad.setY2(newStartY);
      this._feelerHoriz.setY1(newStartY);
    } else {
      this._feelerRad.setY2(oldMidY);
      this._feelerHoriz.setY1(oldMidY); 
    }
    
  } else if(this._sliceLabel) {
    //update the label position
    this._translateLabel(this._sliceLabel, this._explodeOffsetX, this._explodeOffsetY);
  }
  
  // workaround for bug 12622757; slice explode doesn't get animated in the 
  // 2D pie case unless we poke the SVG DOM element that contains the shadow filter
  // Bug fix 12715831
  this.fixSVGFilter();
  
}

/**
 * Workaround for SVG filter problems
 */
 DvtPieSlice.prototype.fixSVGFilter = function() 
 {
   if(this._pieChart.getContext() instanceof DvtSvgContext)
   {
     var svgElem = this._pieChart.__getShapesContainer().getImpl().getElem();
     DvtSvgDocumentUtils.fixWebkitFilters(svgElem);
   }   
 }


/**
 * Translates slice label by the delta x and delta y
 * 
 * @param {DvtTextArea} slice label to translate
 * @param {number} tx 
 * @param {number} ty
 * 
 * @private
 */
DvtPieSlice.prototype._translateLabel = function(sliceLabel, tx, ty)
{
  if(!sliceLabel)
    return;
    
  sliceLabel.setTranslateX(this._sliceLabelPosition.x + tx);
  sliceLabel.setTranslateY(this._sliceLabelPosition.y + ty);
}


/**
 * Translates each element in an array of shapes by the same delta x and delta y
 * 
 * @param {Array} shapes An array of DvtShape objects to translate
 * @param {number} tx 
 * @param {number} ty
 * 
 * @private
 */
DvtPieSlice._translateShapes = function(shapes, tx, ty)
{
  if(!shapes)
    return;
    
  var len = shapes.length;

  for(var i=0; i<len; i++)
  {
    var shape = shapes[i];
    shape.setTranslateX(tx);
    shape.setTranslateY(ty);
  }

}



/** Labeling code; most of the real work is done in DvtSliceLabelLayout **/

/**
 * Returns the untruncated label text for a given pie slice
 *
 * @param {DvtPieSlice} slice
 * @return {String} The full, untruncated label string, or null if the slice's pie chart
                    is configured to not display labels
 */
DvtPieSlice.generateSliceLabelString = function(slice)
{ 
  var pieChart = slice.getPieChart();

  if (pieChart.getPieInfo().getLabelPosition() == DvtPieChart.LABEL_POS_NONE)
  {
    return null;
  }

  var pieChartLabelType = pieChart.getPieInfo().getLabelType();
  if (pieChartLabelType == DvtPieChart.LABEL_TYPE_CUSTOM) // bug 9011108 (ER)
  {
    var customText = slice.getSliceInfo().getText();
    return (customText) ? customText : "?" ;
  }

  var spercent = "" ;
  var svalue   = "" ;
  var stext    = "" ;
  var s        = "" ;

  var converter = pieChart.getPieInfo().getConverter();
  var formatter = pieChart.getPieInfo().getValueFormat();
  var value = slice.getSliceInfo().getValue();
                
  // BUG fix 7349510 - PSLVF attribute
  //

  var percentage = 0;
  var dataTotal = DvtPieChart.__computeTotal(pieChart);
    
  percentage = (dataTotal==0) ? 0 : ((Math.abs(value) / dataTotal) * 100) ;
  
  if (converter && converter.getAsString && converter.getAsObject) 
  {
    // if converter is set, we delegate the formatting to the converter
    spercent = converter.getAsString(percentage / 100);    
  } else {
    // if no converter is found, we do default formatting
    try 
    {
      spercent = formatter.getFormattedValue(percentage / 100);
    }
    catch (vf1Error) // TODO glook (from hugh) cleanup this catch.  Catches like this hide errors, and this code should not be necessary.
    {
      // warning: US decimal point only

      s = percentage.toString() ;

      if (s.length > 5)
      {
        s = s.slice(0, 5) ;
      }
      else
      {
        if (s.indexOf(".", 0) < 0 && s.length < 4)
          s += "." ;
                        
        while (s.length < 5) 
          s += "0";
      }
      s += "%" ;
      spercent = s ; 
    }
  }

  // get data value
  if (! isNaN(value))
  {
    if (converter && converter.getAsString && converter.getAsObject) 
    {
      // if converter is set, we delegate the formatting to the converter
      svalue = converter.getAsString(value); 
    } else {
      // if no converter is found, we do default formatting
      // BUG fix 7349510 -  - PSLVF attribute
      try
      {
        svalue = formatter.getFormattedValue(value) ;
      }
      catch (vf2Error) // TODO glook (from hugh) cleanup this catch.  Catches like this hide errors, and this code should not be necessary.
      {
        // warning: US decimal point only

        svalue = value.toString() ;
                        
        if(formatter)
        {
          svalue = formatter.getFormattedValue( value ) ;
        }
      
        formatter = null ;
      }
    }
  }
                
  
  // Bug 13098740 set text to what was parsed from data xml
  var parsedText = slice.getSliceInfo().getText();
  if (parsedText)
    stext  = parsedText ;
  
  if (pieChartLabelType == DvtPieChart.LABEL_TYPE_PERCENT ||
      pieChartLabelType == DvtPieChart.LABEL_TYPE_UNSPEC)
  {
    return spercent ;
  }
  else if (pieChartLabelType == DvtPieChart.LABEL_TYPE_VALUE)
  {
    return svalue ;
  }
  else if (pieChartLabelType == DvtPieChart.LABEL_TYPE_TEXT)
  {
    return stext ;
  }
  else if (pieChartLabelType == DvtPieChart.LABEL_TYPE_TEXT_PERCENT)
  {
    return stext + ", " + spercent ;
  }
  else if (pieChartLabelType == DvtPieChart.LABEL_TYPE_TEXT_VALUE) // bug 8445625
  {
    return stext + ", " + svalue ;
  }
  else 
  {
    return null;
  }
}


/** End labeling code **/



/** Getters and setters **/


/**
 * @return {number} The size of this pie slice's angle
 */
DvtPieSlice.prototype.getAngleExtent = function()
{
  return this._angleExtent;
}

/**
 * @param {number} extent The size of this pie slice's angle
 */
DvtPieSlice.prototype.setAngleExtent = function(extent)
{
  this._angleExtent = extent;
}

/**
 * @return {number} The starting angle location of this pie slice
 */
DvtPieSlice.prototype.getAngleStart = function()
{
  return this._angleStart;
}

/**
 * @param {number} start The starting angle location of this pie slice
 */
DvtPieSlice.prototype.setAngleStart = function(start)
{
  this._angleStart = start;
}

/**
 * @return {number} A convenience method to access this slice's explode amount
 */
DvtPieSlice.prototype.getExplode = function()
{
  // when we pass in methods to the animator to animate the pie slice on explode, the methods
  // have to be defined on the pie slice
  return this._sliceInfo.getExplode();
}


/**
 * @return {number} The x-offset for this pie slice. Zero if the slice is not exploded.
 */
DvtPieSlice.prototype.__getExplodeOffsetX = function()
{
  return this._explodeOffsetX;
}

/**
 * @return {number} The y-offset for this pie slice. Zero if the slice is not exploded.
 */
DvtPieSlice.prototype.__getExplodeOffsetY = function()
{
  return this._explodeOffsetY;
}



/**
  * Set the points for a feeler outside the slice.
  * 
  * @param {object} startPt The starting point of the feeler, located on the pie slice. Point has an x and y field
  * @param {object} midPt The mid point of the feeler, located between the slice and the label. Point has an x and y field
  * @param {object} endPt The ending point of the feeler, located on the pie label. Point has an x and y field
  */
DvtPieSlice.prototype.setOutsideFeelerPoints = function(startPt, midPt, endPt)
{
  this._outsideFeelerStart = startPt;
  this._outsideFeelerMid = midPt;
  this._outsideFeelerEnd = endPt;
  this._hasFeeler = true;
}


/**
  * Set the slice without feeler.
  */
DvtPieSlice.prototype.setNoOutsideFeeler = function()
{
  this._outsideFeelerStart = null;
  this._outsideFeelerMid = null;
  this._outsideFeelerEnd = null;
  this._hasFeeler = false;
}


/**
 * Returns a DvtSliceInfo object which contains all the slice properties that come down from the middle tier
 * 
 * @return {DvtSliceInfo} 
 */
DvtPieSlice.prototype.getSliceInfo = function()
{
  return this._sliceInfo;
}

/**
 * Sets this slice's DvtSliceInfo object containing all of this slice's properties sent from the middle tier
 * 
 * @param {DvtSliceInfo} sliceInfo
 */
DvtPieSlice.prototype.setSliceInfo = function(sliceInfo)
{
  this._sliceInfo = sliceInfo;
}


/**
 * @return {DvtTextArea} The label for this slice
 */
DvtPieSlice.prototype.getSliceLabel = function()
{
  return this._sliceLabel;
}

/**
 * @param {DvtTextArea} sliceLabel
 */
DvtPieSlice.prototype.setSliceLabel = function(sliceLabel)
{
  this._sliceLabel = sliceLabel;
  
  // need to store the initial position in order to animate the label during explosion
  if (sliceLabel) {
    this._sliceLabelPosition = {x: sliceLabel.getTranslateX(), y: sliceLabel.getTranslateY()};
  }
}

/**
 * @return {String} Untruncated slice label if slice label is truncated.
 */
DvtPieSlice.prototype.getSliceLabelString = function() {
    return this._sliceLabelString;
}

/**
 * @param {String} labelStr Untruncated slice label if slice label is truncated.
 */
DvtPieSlice.prototype.setSliceLabelString = function(labelStr) {
    this._sliceLabelString = labelStr;
}


/**
 * @return {Array} The top surface displayables of this Pie Slice
 */
DvtPieSlice.prototype.getTopSurface = function()
{
  return this._topSurface;
}

/**
 * @return {String} The series id
 */
DvtPieSlice.prototype.getId = function(){
    return this._sliceInfo.getId();
}

//---------------------------------------------------------------------//
// Animation Support                                                   //
//---------------------------------------------------------------------//

DvtPieSlice.prototype.GetAnimationParams = function(){
    return [this.getSliceInfo().getValue(), this._radiusX, this._radiusY];  
}

DvtPieSlice.prototype.SetAnimationParams = function(params){
  this.getSliceInfo().setValue(params[0]);
  this._radiusX = params[1];
  this._radiusY = params[2];
}

/**
 * Creates the update animation for this object.
 * @param {DvtDataAnimationHandler} handler The animation handler, which can be used to chain animations.
 * @param {DvtPieSlice} oldSlice The old pie state to animate from.
 */
DvtPieSlice.prototype.animateUpdate = function(handler, oldSlice){
  var startState = oldSlice.GetAnimationParams();
  var endState = this.GetAnimationParams();

  if(!DvtArrayUtils.equals(startState, endState)) {
    // Create the animation
    var anim = new DvtCustomAnimation(this._pieChart.getContext(), this, this.getPieChart().getPieInfo().getAnimationDuration());
    anim.getAnimator().addProp(DvtAnimator.TYPE_NUMBER_ARRAY, this, this.GetAnimationParams, this.SetAnimationParams, endState);
    handler.add(anim, 0);
    
    // Initialize to the start state
    this.SetAnimationParams(startState);
  }
}

/**
 * Creates the insert animation for this object.
 * @param {DvtDataAnimationHandler} handler The animation handler, which can be used to chain animations.
 */
DvtPieSlice.prototype.animateInsert = function(handler){
  // Create the animation
  var anim = new DvtCustomAnimation(this._pieChart.getContext(), this, this.getPieChart().getPieInfo().getAnimationDuration());
  anim.getAnimator().addProp(DvtAnimator.TYPE_NUMBER_ARRAY, this, this.GetAnimationParams, this.SetAnimationParams, this.GetAnimationParams());
  handler.add(anim, 0);
  
  // Initialize to the start state
  this.SetAnimationParams([0, 0, 0]);
}

/**
 * Creates the delete animation for this object.
 * @param {DvtDataAnimationHandler} handler The animation handler, which can be used to chain animations.
 * @param {DvtPieChart} container The new container where the pie slice should be moved for animation.
 */
DvtPieSlice.prototype.animateDelete = function(handler, container) {
  // Reparent the slice to the new pie by moving the slice info
  var slice = container.addSliceInfo(this.getSliceInfo());
  var newSlices = container.__getSlices();
  newSlices.splice(newSlices.length-1, 1); // remove the slice so that it can be added in the right spot
  
  // We need to reorder the new slice so that it's in the right relative order
  var oldSlices = this.getPieChart().__getSlices();
  var oldIndex = DvtArrayUtils.indexOf(oldSlices, this);
  var prevIndex = oldIndex - 1;
  
  // Add the new slice in the right spot
  if(prevIndex >= 0) {
    var prevId = oldSlices[prevIndex].getId();
    // Find the location of the previous slice
    for(var i=0; i<newSlices.length; i++) {
      if(newSlices[i].getId() === prevId) {
        newSlices.splice(i+1, 0, slice);
        break;
      }
    }
  }
  else
    newSlices.splice(0, 0, slice);

  // Create the animation to delete the slice
  var anim = new DvtCustomAnimation(container.getContext(), this, this.getPieChart().getPieInfo().getAnimationDuration());
  anim.getAnimator().addProp(DvtAnimator.TYPE_NUMBER_ARRAY, slice, slice.GetAnimationParams, slice.SetAnimationParams, [0, 0, 0]);
  
  // Set the onEnd listener so that the slice can be deleted
  anim.setOnEnd(slice._removeDeletedSlice, slice);
  
  // Finally add the animation
  handler.add(anim, 0);
}

/**
 * Removes a deleted slice from the owning pie chart.  A re-render must be performed for the
 * results to be visible.
 */
DvtPieSlice.prototype._removeDeletedSlice = function() {
  var slices = this.getPieChart().__getSlices();
  var index = DvtArrayUtils.indexOf(slices, this);
  
  if(index >= 0)
    slices.splice(index, 1);
}

/**
 * Return the action string for the data item, if any exists.
 * @returns {string} the action outcome for the data item.
 */
DvtPieSlice.prototype.getAction = function()
{
  return this.getSliceInfo().getAction();
}

//---------------------------------------------------------------------//
// DvtLogicalObject impl                                               //
//---------------------------------------------------------------------//

/**
 * @override
 */
DvtPieSlice.prototype.getDisplayables = function() {
  var ret = new Array();
  
  if(this._topSurface)
    ret = ret.concat(this._topSurface);
    
  if(this._leftSurface)
    ret = ret.concat(this._leftSurface);
    
  if(this._rightSurface)
    ret = ret.concat(this._rightSurface);
    
  if(this._crustSurface)
    ret = ret.concat(this._crustSurface);
  
  if(this._sliceLabel)
    ret.push(this._sliceLabel);
    
  if(this._feelerRad)
    ret.push(this._feelerRad);
    
  if(this._feelerHoriz)
    ret.push(this._feelerHoriz);
    
  return ret;
}

//---------------------------------------------------------------------//
// Selection Support: DvtSelectable impl                               //
//---------------------------------------------------------------------//
/**
 * @return return the physical shape
 */
 DvtPieSlice.prototype.getPhysicalShape = function(obj) {
  obj.setDataColor(this.getSliceInfo().getFillColor());
  obj.setZorder(false);
  obj.setSelectedShadow(false);
  obj.setCursor(DvtSelectionEffectUtils.getSelectingCursor());
  return obj;
 }
/**
 * @override
 */ 
DvtPieSlice.prototype.isSelectable = function() {
  // Only called by the selection manager when selection is enabled
  return true; 
};

/**
 * @override
 */ 
DvtPieSlice.prototype.isSelected = function()
{
  return this._selected;
};

/**
 * @override
 */ 
DvtPieSlice.prototype.setSelected = function(bSelected) 
{
  this._selected = bSelected;
  if (this._selected) {
    this._pieChart.bringToFrontOfSelection(this);
  } else if (!this._selecting) {
    this._pieChart.pushToBackOfSelection(this);
  }
  var shapeArr = this.getDisplayables();
  for (i=0; i<shapeArr.length; i++) 
  {
    if (shapeArr[i].setSelected)
    {
      var shape = this.getPhysicalShape(shapeArr[i]);
      shape.setSelected(bSelected);
    }
  }
  this.fixSVGFilter();
};

/**
 * @override
 */ 
DvtPieSlice.prototype.showHoverEffect = function()
{
  this._selecting = true;
  this._pieChart.bringToFrontOfSelection(this);
  var shapeArr = this.getDisplayables();
  for (i=0; i<shapeArr.length; i++) 
  {
    if (shapeArr[i].showHoverEffect)
    {
      var shape = this.getPhysicalShape(shapeArr[i]);
      shape.showHoverEffect();
    }
  }
  this.fixSVGFilter();
};

/**
 * @override
 */ 
DvtPieSlice.prototype.hideHoverEffect = function()
{
  this._selecting = false;
  if (!this._selected) {
    this._pieChart.pushToBackOfSelection(this);
  }
  var shapeArr = this.getDisplayables();
  for (i=0; i<shapeArr.length; i++) 
  {
    if (shapeArr[i].hideHoverEffect)
    {
      var shape = this.getPhysicalShape(shapeArr[i]);
      shape.hideHoverEffect();
    }
  }
  this.fixSVGFilter();
};

//---------------------------------------------------------------------//
// Tooltip Support: DvtTooltipSource impl                              //
//---------------------------------------------------------------------//

/**
 * @override
 */
DvtPieSlice.prototype.getDatatip = function(target, x, y) {
    if (target == this._sliceLabel) {
        if (this._sliceLabel && this._sliceLabel.isTruncated())
            return this.getSliceLabelString();
    }
    return this.getSliceInfo().getTooltip();
};

/**
 * @override
 */
DvtPieSlice.prototype.getDatatipColor = function() {
  return this.getSliceInfo().getFillColor(); 
};

//---------------------------------------------------------------------//
// Popup Support: DvtPopupSource impl                                  //
//---------------------------------------------------------------------//

/**
 * @override
 */ 
DvtPieSlice.prototype.getShowPopupBehaviors = function()
{
  return this._pieChart.__getShowPopupBehaviors();
};

//---------------------------------------------------------------------//
// Context Menu Support: DvtContextMenuSource impl                     //
//---------------------------------------------------------------------//

/**
 * @override
 */ 
DvtPieSlice.prototype.getContextMenuId = function() {
  return this.getSliceInfo().getContextMenuId();
};

//---------------------------------------------------------------------//
// Rollover and Hide/Show Support: DvtCategoricalObject impl           //
//---------------------------------------------------------------------//

/**
 * @override
 */
DvtPieSlice.prototype.getCategories = function() {
  return [this.getSliceInfo().getId().getSeries()];
};

// Copyright (c) 2008, 2013, Oracle and/or its affiliates. 
// All rights reserved. 

/*---------------------------------------------------------------------*/
/* A partitioning of the DvtPieSlice code. Static methods associated   */ 
/* with generating pie slice surfaces live in this file                */
/*---------------------------------------------------------------------*/

/*
 * Static methods for generating the physical shapes that make up the different pieces of a DvtPieSlice
 */



// surface types

DvtPieSlice.SURFACE_CRUST = 0;
DvtPieSlice.SURFACE_LEFT = 1;   
DvtPieSlice.SURFACE_RIGHT = 2;
DvtPieSlice.SURFACE_TOP = 3;


/*****************************************************/
/* Publicly exposed static methods                   */
/*****************************************************/

/**
 * @this {DvtPieSlice}
 * Returns an array of DvtShape objects representing the top of a pie slice
 * 
 * @param {DvtFill} fill The fill for the top
 * @param {DvtPieSlice} slice The slice to generate the top for
 * @return {Array} An array of DvtShape objects representing the top of this pie slice
 */
DvtPieSlice.createTopSurface = function(slice, fill) 
{
  var pieChart = slice.getPieChart();
  var  context = pieChart.getContext() ;

  var sliceInfo = slice._sliceInfo;

  var pieCenter = pieChart.getCenter();

  // Bug fix 12419047
  var sliceClosureType = DvtArc.PIE;

  if(slice.getAngleExtent() == 360)
  {
    sliceClosureType = DvtArc.OPEN;
  }


  var wedge = new DvtSelectableArc(context, pieCenter.x, pieCenter.y, slice._radiusX, slice._radiusY, 
                                  slice.getAngleStart(), slice.getAngleExtent(), sliceClosureType);
  wedge.setDataColor(sliceInfo.getFillColor());
  wedge.setZOrderManager(this._Chart);
 
  wedge.setTranslateX(slice.__getExplodeOffsetX());
  wedge.setTranslateY(slice.__getExplodeOffsetY());
  wedge.setFill(fill);
  if (sliceInfo.getStrokeColor()) {
      wedge.setStroke(new DvtSolidStroke(sliceInfo.getStrokeColor(), sliceInfo.getStrokeAlpha()));
  }
  
  // WAI-ARIA
  wedge.setAriaRole('img');
  var ariaLabel = slice.getSliceInfo().getTooltip();
  wedge.setAriaProperty('label', ariaLabel);
  
  var shapes = [wedge];
  
  if( !slice.getSliceInfo().getStrokeColor() &&
      pieChart.getPieInfo().hasVisualEffects() && pieChart.is3D() && pieChart.getDepth() > 0 &&
      pieChart.getPieInfo().getFillType() == DvtFill.GRADIENT &&
      (  slice.getAngleStart() >= 180 || 
         (slice.getAngleStart() + slice.getAngleExtent()) >= 180 || 
         slice.getAngleExtent() == 360)  )   // Bug fix 12419047; slice.getAngleExtent() == 360 means we only have one slice
        
  {
    // create arc for the pie border with border gradient and add arc to shapes array
    var edge = DvtPieSlice._createGradientPieBorder(slice, fill);
    edge.setTranslateX(slice.__getExplodeOffsetX());
    edge.setTranslateY(slice.__getExplodeOffsetY());
    shapes.push(edge);
  }  
  
  // Associate the shapes with the slice for use during event handling
  DvtPieSlice._associate(slice, shapes);

  return shapes;  
}

/**
 * Returns an array of DvtShape objects representing the crust of a pie slice
 * 
 * @param {DvtFill} fill The fill for the crust
 * @param {DvtPieSlice} slice The slice to generate the crust for
 * @return {Array} An array of DvtShape objects representing the crust of this pie slice
 */
DvtPieSlice.createCrust = function(slice, fill) 
{
  return DvtPieSlice._createLateralSurface(slice, DvtPieSlice.SURFACE_CRUST, fill);
}

/**
 * Returns an array of DvtShape objects representing the right side of a pie slice (as viewed from the tip
 * of the pie slice)
 * 
 * @param {DvtFill} fill The fill for the side surface
 * @param {DvtPieSlice} slice The slice to generate the right side for
 * @return {Array} An array of DvtShape objects representing the right side of this pie slice
 */
DvtPieSlice.createRightSide = function(slice, fill) 
{
  return DvtPieSlice._createLateralSurface(slice, DvtPieSlice.SURFACE_RIGHT, fill);
}

/**
 * Returns an array of DvtShape objects representing the left side of a pie slice (as viewed from the tip
 * of the pie slice)
 *
 * @param {DvtFill} fill The fill for the side surface
 * @param {DvtPieSlice} slice The slice to generate the left side for
 * @return {Array} An array of DvtShape objects representing the left side of this pie slice
 */
DvtPieSlice.createLeftSide = function(slice, fill) 
{
  return DvtPieSlice._createLateralSurface(slice, DvtPieSlice.SURFACE_LEFT, fill);    

}

/*****************************************************/
/* Private methods                                   */
/*****************************************************/

/**
 * Associates the specified displayables with the specified slice.
 * @param {DvtPieSlice} slice The owning slice.
 * @param {array} displayables The displayables to associate.
 */
DvtPieSlice._associate = function(slice, displayables) {
  if(!displayables)
    return;
    
  for(var i=0; i<displayables.length; i++) 
    slice._pieChart.__getEventManager().associate(displayables[i], slice);
}



/**
 * Private helper method to generate the gradient border for a pie slice
 * @param {DvtPieSlice} slice
 * @param {DvtGradientFill} topFill
 * @return {DvtArc} The gradient border to apply on top of the pie slice at the edge
 * @private
 */
DvtPieSlice._createGradientPieBorder = function(slice, topFill)
{
  var sliceInfo = slice.getSliceInfo();

  // first create the gradient to apply
  var style    = DvtPieRenderUtils.BORDER ;
  var arColors = DvtPieRenderUtils.getGradientColors(null, style) ; // base color ignored for border gradient
  var arAlphas = DvtPieRenderUtils.getGradientAlphas(sliceInfo.getStrokeAlpha(), style) ;
  var arRatios = DvtPieRenderUtils.getGradientRatios(style) ;

  var arBounds = topFill.getBounds();

  grAngle = 120 ;    // constant used in Flash impl originally 120
//  grAngle = 360 - grAngle ;        // Html5 toolkit rotates from 0 clockwise so
                                   // convert to anticlockwise convention

  var gradBorder = new DvtLinearGradientStroke(grAngle, arColors, arAlphas, arRatios, arBounds);
  gradBorder.setWidth(1);
  
  // now create the arc for the border
  
  // only show border on the front-top-edge (180-360 degrees)
  var sliceAngleStart = slice.getAngleStart();
  var sliceAngleExtent = slice.getAngleExtent();
               
  var diff = (sliceAngleStart < 180) ? 180 - sliceAngleStart : 0 ;
  var angStart = (diff > 0) ? 180 : sliceAngleStart ;
  var angExtent = sliceAngleExtent - diff; 

  if (angStart + angExtent > 360)
    angExtent = 360 - angStart ;


  var pieChart = slice.getPieChart();
  var pieCenter = pieChart.getCenter();

  var edge = new DvtArc(pieChart.getContext(), pieCenter.x, pieCenter.y, pieChart.getRadiusX(), pieChart.getRadiusY(), 
    angStart, angExtent, DvtArc.OPEN);      
                
  edge.setStroke(gradBorder);
  
  return edge;
}

/**
 * Private method that generates any lateral (non-top) pie surface
 * 
 * @param {DvtFill} fill The fill for the lateral surface
 * @param {DvtPieSlice} slice
 * @param {number} pathType One of DvtPieSlice.SURFACE_CRUST,
 *                          DvtPieSlice.SURFACE_LEFT, or DvtPieSlice.SURFACE_RIGHT   
 * 
 * @return {Array} An array of DvtShape objects representing this lateral surface
 * 
 * @private
 */
 // replaces PieSlice._draw 
DvtPieSlice._createLateralSurface = function(slice, pathType, fill)
{
  // handle the case where we are animating a slice insert
  // initially, this slice will have 0 extent. in this case
  // don't generate any surface
  if(slice.getAngleExtent() == 0) 
  {
    return [];  
  }

  var talpha = slice.getSliceInfo().getFillAlpha();
  var shapes = [];
  
  if (talpha > 0) 
  {
    
    if(pathType == DvtPieSlice.SURFACE_LEFT || pathType == DvtPieSlice.SURFACE_RIGHT )
    {
      shapes.push(DvtPieSlice._generateLateralShape(slice, pathType, null, fill));
    }
    else if(pathType == DvtPieSlice.SURFACE_CRUST)
    {
      var pathCommands = DvtPieSlice._createCrustPathCommands(slice);
  
      var len = pathCommands.length;
      for(var i = 0; i < len; i++)
      {
        shapes.push(DvtPieSlice._generateLateralShape(slice, pathType, pathCommands[i], fill));
      }

    }
  }
  
  // Associate the shapes with the slice for use during event handling
  DvtPieSlice._associate(slice, shapes);
  
  return shapes;
}


/**
 * Create the gradient fill used for lateral surfaces
 * 
 * @param {DvtPieSlice} slice
 * @param {String} style One of DvtPieRenderUtils.CRUST or DvtPieRenderUtils.SIDE    
 * 
 * @return {DvtLinearGradientFill}
 * 
 * @private
 */
DvtPieSlice._generateLateralGradientFill = function(slice, style) 
{
  var yOffset = 0 ;
  var color = slice.getSliceInfo().getFillColor()
  var talpha = slice.getSliceInfo().getFillAlpha();
  var pieChart = slice.getPieChart();
                  
  if (style == DvtPieRenderUtils.CRUST)
  {
    yOffset = pieChart.getDepth();
  }
 
  var arColors = DvtPieRenderUtils.getGradientColors(color, style) ;
  var arAlphas = DvtPieRenderUtils.getGradientAlphas(talpha, style) ;
  var arRatios = DvtPieRenderUtils.getGradientRatios(style) ;
                  
  var angle   = 0 ; 

  var arBounds = [Math.floor(pieChart.getCenter().x - pieChart.getRadiusX()), 
                  Math.floor(pieChart.getCenter().y - pieChart.getRadiusY()) + yOffset,
                  Math.ceil(2 * pieChart.getRadiusX()), Math.ceil(2 * pieChart.getRadiusY()) ];

  
  
  var grad = new DvtLinearGradientFill(angle, arColors, arAlphas, arRatios, arBounds);
  
  return grad;

}


/**
 * Private method that generates an array of DvtShape objects for different lateral pie surfaces
 * 
 * @param {DvtPieSlice} slice 
 * @param {number} pathType One of DvtPieSlice.SURFACE_CRUST,
 *                          DvtPieSlice.SURFACE_LEFT, or DvtPieSlice.SURFACE_RIGHT   
 * @param {String} pathCommand  A string of SVG commands in SVG "d" attribute format. Used when pathType is 
 *                              DvtPieSlice.SURFACE_CRUST. Can be set to null otherwise
 * @param {DvtFill} fill The fill to apply to the shapes
 * 
 * @return {DvtShape} A right or left pie surface, or a piece of a crust, as described in pathCommands
 * 
 * @private
 */
DvtPieSlice._generateLateralShape = function(slice, pathType, pathCommand, fill)
{
  var  context = slice.getPieChart().getContext() ;
  var  sliceInfo = slice.getSliceInfo() ;
  
  // left side points and right side points
  if (pathType == DvtPieSlice.SURFACE_LEFT || pathType == DvtPieSlice.SURFACE_RIGHT)  
  {
    var points = [];
    var pointArray;
    
    var pt;
    
    var angle = slice.getAngleStart();
    var arc = slice.getAngleExtent();
    var pie = slice.getPieChart();
    var xCenter = pie.getCenter().x;
    var yCenter = pie.getCenter().y;
    var xRadius = slice._radiusX;
    var yRadius = slice._radiusY;
    var depth = pie.getDepth();
    
    if(pathType == DvtPieSlice.SURFACE_LEFT) {
      pt = DvtPieRenderUtils.reflectAngleOverYAxis(angle + arc, xCenter, yCenter, xRadius, yRadius) ;
    }
    else {
      pt = DvtPieRenderUtils.reflectAngleOverYAxis(angle, xCenter, yCenter, xRadius, yRadius) ;
    }
    
    pointArray = DvtPieSlice._generateInnerPoints(xCenter, yCenter, pt.x, pt.y, depth) ;
    
    points = DvtPieSlice._pointArrayHelper(points, pointArray[0]);
    var len = pointArray.length;
    for(var i=1; i<len; i++) {
      points = DvtPieSlice._pointArrayHelper(points, pointArray[i]);
    }
    
    var polygon = new DvtSelectablePolygon(context, points);      
    polygon.setDataColor(sliceInfo.getFillColor());
    polygon.setZOrderManager(pie);
     
    polygon.setTranslateX(slice.__getExplodeOffsetX());
    polygon.setTranslateY(slice.__getExplodeOffsetY());
   
    polygon.setFill(fill); 
    if (sliceInfo.getStrokeColor()) {
        polygon.setStroke(new DvtSolidStroke(sliceInfo.getStrokeColor(), sliceInfo.getStrokeAlpha()));
    }
    
    return polygon;
  }
  else // draw piece of pie crust
  {
    if (pathCommand)
    {      
      var path = new DvtSelectablePath(context, null);
      path.setDataColor(sliceInfo.getFillColor());
      path.setZOrderManager(pie);
      path.setCmds(pathCommand);
      
      path.setTranslateX(slice.__getExplodeOffsetX());
      path.setTranslateY(slice.__getExplodeOffsetY());

      path.setFill(fill);
      if (sliceInfo.getStrokeColor()) {
        path.setStroke(new DvtSolidStroke(sliceInfo.getStrokeColor(), sliceInfo.getStrokeAlpha()));
      }
      
      return path;
    }
  }
  
  return null;
}





/**
 * Returns an array of path commands describing how to draw a pie crust
 * 
 * @param {DvtPieSlice} slice
 * 
 * @return {Array} An array of strings of SVG commands in SVG "d" attribute format.
 *                 e.g., [ [command1 x1, y1, ..., commandi xn, yn, ...], [commandj xs, ys, ...] ]
 * 
 * @private
 */
DvtPieSlice._createCrustPathCommands = function(slice)
{
  var angle = slice.getAngleStart();
  var arc = slice.getAngleExtent();
  var angleEnd = angle + arc ;
  var pie = slice.getPieChart();
  var xCenter = pie.getCenter().x;
  var yCenter = pie.getCenter().y;
  var xRadius = slice._radiusX;
  var yRadius = slice._radiusY;
  var depth = pie.getDepth();

  var arOuterPath = [] ;
            
  //bglazer: new rendering technique renders crust as a single sliver
    
  //if slice crosses 0 degrees (right horizontal x-axis), we need to break crust
  //into 2 pieces joined at the crossing point so that the right side of the 
  //slice appears to be a solid 3D wall
  //if slice crosses 180 degrees (left horizontal x-axis), we need to break crust
  //into 2 pieces joined at the crossing point so that the left side of the 
  //slice appears to be a solid 3D wall
  if (angle < 180.0 && angleEnd > 360.0)
  {
    //need to break this slice into 3 pieces because it crosses on
    //both left and right sides
    arOuterPath.push( DvtPieSlice._makeOuterPath(xCenter, yCenter, angle, 180.0 - angle, xRadius, yRadius, depth) );
    arOuterPath.push( DvtPieSlice._makeOuterPath(xCenter, yCenter, 180.0, 180.0, xRadius, yRadius, depth) );
    arOuterPath.push( DvtPieSlice._makeOuterPath(xCenter, yCenter, 360.0, angleEnd - 360.0, xRadius, yRadius, depth) );
    }
  else if (angleEnd > 360.0)
  {
    arOuterPath.push( DvtPieSlice._makeOuterPath(xCenter, yCenter, angle, 360.0 - angle, xRadius, yRadius, depth) );
    arOuterPath.push( DvtPieSlice._makeOuterPath(xCenter, yCenter, 360.0, angleEnd - 360.0, xRadius, yRadius, depth) );
  }
  else if (angle < 180.0 && angleEnd > 180.0)
  {
    arOuterPath.push( DvtPieSlice._makeOuterPath(xCenter, yCenter, angle, 180.0 - angle, xRadius, yRadius, depth) );
    arOuterPath.push( DvtPieSlice._makeOuterPath(xCenter, yCenter, 180.0, angleEnd - 180.0, xRadius, yRadius, depth) );
    }
  else
    arOuterPath.push( DvtPieSlice._makeOuterPath(xCenter, yCenter, angle, arc, xRadius, yRadius, depth) ) ;
      
  return arOuterPath;
}




/**
* Returns an <code>Array</code> representing a pie slice's outer crust drawn as a Path.
*
* <p>This was originally used to create 3D pie "outer" crusts.</p>
*
* @param {number} cx    A <code>Number</code> representing the starting horizontal location usually the "center" of the pie.
* @param {number} cy    A <code>Number</code> representing the starting vertical location usually the "center" of the pie.
* @param {number} xpos  A <code>Number</code> representing the 'outer' horizontal location of the pie slice.
* @param {number} ypos  A <code>Number</code> representing the 'outer' vertical location of the pie slice.
* @param {number} depth A <code>Number</code> describing the height/depth of the pie slice.
*
* @returns {String}  A string of SVG commands in SVG "d" attribute format.  Represents part of a crust.
* 
* @private
*/ 

// TODO - glook: replace quadratic curves (Q) with cubic (C)
DvtPieSlice._makeOuterPath = function(cx, cy, sAngle, sArc, rx, ry, depth)
{
  var svgCommands = [];                     
  var svgCommandsReverse = [];
                    
  var pt = {x:0, y:0};

  var startAngle = DvtMath.degreesToRads(sAngle) ;
  var arc = DvtMath.degreesToRads(sArc) ;
  var segs ;
  var segAngle ;
  var theta ;       
  var angle ;
  var angleMid ;
  var ctrlX ;
  var ctrlY ;
  var ax ;
  var ay ;
  var bx ;
  var by ;
  var i ;
  var lastX ;
  var lastY ;

  pt = DvtPieRenderUtils.reflectAngleOverYAxis(sAngle, cx, cy, rx, ry) ;    // top anchor point
      
  // move to "top" rim/edge
  svgCommands.push( DvtPathUtils.moveTo(pt.x, pt.y) );
  
  segs     = Math.ceil(Math.abs(arc) / DvtMath.QUARTER_PI) ;  // draw arc in 45 degree segments
  
  segAngle = arc/segs ;
  theta    = -segAngle ;
  angle    = -startAngle ;

  angleMid = angle - (theta/2);

  ax = pt.x;
  ay = pt.y;

  lastX = ax ;
  lastY = ay ;
        
  var optRxTheta2 = (rx / Math.cos(theta/2)) ;
  var optRyTheta2 = (ry / Math.cos(theta/2)) ;
  
  for (i = 0; i < segs; i++)
  {
    angle    += theta ;                // compute this seg's ending angle
    angleMid = angle - (theta/2) ;
  
    bx    = cx + Math.cos(angle) * rx ;   // compute seg's ending x, y
    by    = cy + Math.sin(angle) * ry ;   // (the anchor points)
  
    ctrlX = cx + Math.cos(angleMid) * optRxTheta2 ; // quad beziers
    ctrlY = cy + Math.sin(angleMid) * optRyTheta2 ; // anchor points
    
    svgCommands.push( DvtPathUtils.quadTo(ctrlX, ctrlY, bx, by) );

    svgCommandsReverse.push( DvtPathUtils.quadTo(ctrlX, ctrlY+depth, lastX, lastY+depth) );
      
    lastX = bx ;
    lastY = by ;
  }

  // line to "bottom" rim/edge
  svgCommands.push( DvtPathUtils.lineTo(bx, by+depth) );
  
  // reverse the loop
  if (svgCommandsReverse.length > 0)
  {
    var n = svgCommandsReverse.length ;
    for (var i = 0; i < n; i++)
    {
      var str = svgCommandsReverse.pop();
      svgCommands.push( str );
    }
  }

  // line to "top" rim/edge
  svgCommands.push( DvtPathUtils.lineTo(pt.x, pt.y) );
          
  svgCommandsReverse = null;

  // now concatenate all the commands together in one String  
  var concatenatedSvgCommands = "";
  var len = svgCommands.length;
  for(var i=0; i<len; i++)
  {
    concatenatedSvgCommands += svgCommands[i] + " ";
  }
  
  return concatenatedSvgCommands;
}




/**
 * Private function to generate the points for the left or right pie surface
 * 
 * @param {number} cx The x-coordinate of the center of the pie slice
 * @param {number} cy The y-coordinate of the center of the pie slice
 * @param {number} x The x-coordinate of the top, outside (left or right) edge of the pie slice
 * @param {number} y The y-coordinate of the top, outside (left or right) edge of the pie slice
 * @param {number} tilt Pie tilt
 * @param {number} side Either DvtPieSlice.SURFACE_LEFT or DvtPieSlice.SURFACE_RIGHT
 * 
 * @return {Array} An array of points that are the coordinates for the left or right surface of a pie slice
 * 
 * @private
 */
DvtPieSlice._generateInnerPoints = function(cx, cy, xpos, ypos, tilt)
{
  var point1 = {x:cx, y:cy};
  var point2 = {x:xpos, y:ypos} ;
  var point3 = {x:xpos, y:ypos + tilt };
  var point4 = {x:cx, y:cy + tilt} ;
  
  var pointArray = [point1, point2, point3, point4];
  
  return pointArray;

}


/**
 * Private helper function to add the x and y coordinates of a point to an array of point coordinates
 * 
 * @param {Array} points The array to insert the point x and y coordinates into
 * @param {object} point An object with an x and y field.  The x and y values will be pushed into the points array
 * 
 * @return {Array} An array with the x and y coordinates appended to it
 */
DvtPieSlice._pointArrayHelper = function(points, point)
{
  if(!points)
    points = [];
    
  points.push(point.x);
  points.push(point.y);
  return points;
}



// Copyright (c) 2008, 2013, Oracle and/or its affiliates. 
// All rights reserved. 
/*---------------------------------------------------------------------*/
/* Class DvtSliceInfo       Slice information from the parser          */
/*---------------------------------------------------------------------*/

/**
 * Property bag to hold slice information passed to the pie from the middle tier
 * 
 * @constructor
 */
var DvtSliceInfo = function()
{
   this.Init() ;
}; 

DvtObj.createSubclass(DvtSliceInfo, DvtObj, "DvtSliceInfo");

/**
 * Private helper function to initialize the slice info's private fields
 * 
 * @protected 
 */
DvtSliceInfo.prototype.Init = function()
{
   this._explode      = 0 ;
   
   this._id           = null ;      // String
   this._index        = null ;      // int
   
   this._fillColor     = null ;     // String
   this._fillAlpha    = null ;
   this._fp           = null ;      // String for fill pattern
   this._strokeColor  = null ;
   this._strokeAlpha  = null ;
   this._value        = null ;
   this._tooltip      = null ;     // tooltip string
   this._contextMenuId = null;
   
   this._text = null; // custom marker text returned by CustomMarkerTextCallback. 
                      // if not found, then pie specific series label.
                      // if that is not found, then the series label.
                      // if that is not found, then the series id
  
   this._action = null;
};


/**
 * Returns the slice text from the parsed xml.  This text is the custom marker text 
 * from a CustomMarkerTextCallback.  If not found, then returns the pie specific 
 * series label for the specified series index.  If not found, returns the series label, 
 * or if not found the series ID is returned.
 * 
 * @return {String}
 */
DvtSliceInfo.prototype.getText = function()
{
  return this._text;
}

/**
 * Sets the slice text from the parsed xml.  This text is the custom marker text 
 * from a CustomMarkerTextCallback.  If not found, then the pie specific 
 * series label.  If not found, then the series label, or if not found then series ID 
 * 
 * @param {String} text
 */
DvtSliceInfo.prototype.setText = function(text)
{
  this._text = text;
}

/**
 * Returns the explode value for this pie slice, as sent from the middle tier
 * 
 * @return {number}
 */
DvtSliceInfo.prototype.getExplode = function()
{
  return this._explode;
}

/**
 * Sets the explode value for this pie slice, as sent from the middle tier
 * 
 * @param {number} explode
 */
DvtSliceInfo.prototype.setExplode = function(explode)
{
  this._explode = explode;
}


/**
 * Returns the opacity of this pie slice
 * 
 * @return {number}
 */
DvtSliceInfo.prototype.getFillAlpha = function()
{
  return this._fillAlpha;
}

/**
 * Sets the opacity of this pie slice
 * 
 * @param {number} clr
 */
DvtSliceInfo.prototype.setFillAlpha = function(alpha)
{
  this._fillAlpha = alpha ;
}


/**
 * Returns the color of this pie slice, represented as a String
 * 
 * @return {String}
 */
DvtSliceInfo.prototype.getFillColor = function()
{
  return this._fillColor;      // String
}

/**
 * Sets the color of this pie slice
 * 
 * @param {String} clr
 */
DvtSliceInfo.prototype.setFillColor = function(clr)
{
  this._fillColor = clr ;      // String
}


/**
 * Returns the name of the fill pattern for this pie slice
 * 
 * @return {string} 
 */
DvtSliceInfo.prototype.getFillPattern = function()
{
  return this._fp;
}

/**
 * Sets the name of the fill pattern for this pie slice
 * 
 * @param {string} fillPattern 
 */
DvtSliceInfo.prototype.setFillPattern = function(fillPattern)
{
  this._fp = fillPattern;
}



/**
 * Returns the series id object
 * 
 * @return {Object}
 */
DvtSliceInfo.prototype.getId = function()
{
  return this._id;
}


/**
 * Sets the index of this pie slice
 * 
 * @param {int} index
 */
DvtSliceInfo.prototype.setIndex = function(index)
{
  this._index = index;
}


/**
 * Returns the index
 * 
 * @return {int}
 */
DvtSliceInfo.prototype.getIndex = function()
{
  return this._index;
}


/**
 * Sets the series id object associated with this pie slice
 * 
 * @param {Object} series
 */
DvtSliceInfo.prototype.setId = function(series)
{
  this._id = series;
}

/**
 * Returns the opacity of this pie slice border
 * 
 * @return {number}
 */
DvtSliceInfo.prototype.getStrokeAlpha = function()
{
  return this._strokeAlpha;
}

/**
 * Sets the opacity of this pie slice border
 * 
 * @param {number} clr
 */
DvtSliceInfo.prototype.setStrokeAlpha = function(alpha)
{
  this._strokeAlpha = alpha ;
}


/**
 * Returns the color of this pie slice border
 * 
 * @return {String}
 */
DvtSliceInfo.prototype.getStrokeColor = function()
{
  return this._strokeFill;      // String
}

/**
 * Sets the color of this pie slice border
 * 
 * @param {String} clr
 */
DvtSliceInfo.prototype.setStrokeColor = function(clr)
{
  this._strokeFill = clr ;      // String
}


/**
 * Returns the tooltip string associated with this slice
 * 
 * @return {String}
 */
DvtSliceInfo.prototype.getTooltip = function()
{
  return this._tooltip;
}

/**
 * Sets the tooltip string associated with this slice
 * 
 * @param {String} tooltip
 */
DvtSliceInfo.prototype.setTooltip = function(tooltip)
{
  this._tooltip = tooltip;
}


/**
 * Returns the context menu id for this slice.
 * @return {String}
 */
DvtSliceInfo.prototype.getContextMenuId = function()
{
  return this._contextMenuId;
}

/**
 * Specifies the context menu id for this slice.
 * @param {String} id
 */
DvtSliceInfo.prototype.setContextMenuId = function(id)
{
  this._contextMenuId = id;
}

/**
 * Returns the numeric data value associated with this slice
 * 
 * @return {number}
 */
DvtSliceInfo.prototype.getValue = function()
{
  return this._value;
}

/**
 * Sets the numeric data value associated with this slice
 * 
 * @param {number} val
 */
DvtSliceInfo.prototype.setValue = function(val)
{
  this._value = val;
}

/**
 * Return the action string for the data item, if any exists.
 * @return {string} the action outcome for the data item.
 */
DvtSliceInfo.prototype.getAction = function()
{
  return this._action
}

/**
 * Specifies the action string for the data item, if any exists.
 * @param {string} action the action outcome for the data item.
 */
DvtSliceInfo.prototype.setAction = function(action)
{
  this._action = action;
}
// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*---------------------------------------------------------------------*/
/* Class DvtSliceLabelInfo       Slice label information               */
/*---------------------------------------------------------------------*/

/** A property bag used to pass around information used for label placement
 * 
 * @constructor
 */
var DvtSliceLabelInfo = function()
{
   this._init() ;
}; 

DvtObj.createSubclass(DvtSliceLabelInfo, DvtObj, "DvtSliceLabelInfo");

/**
 * Private initializer
 * @private
 */
DvtSliceLabelInfo.prototype._init = function()
{
  this._sliceLabel = null ; // instance of DvtTextArea
  this._slice = null ;      // DvtSlice we will associate _sliceLabel with, if we can fit the label
  this._angle = -1;
  
  // this._position is the normalized midpoint angle, where 0 degrees is at 12 o'clock
  //    and angular measures are degrees away from 12 o'clock (so 90 degrees
  //    can be either at 3 o'clock or 9 o'clock on the unit circle)
  this._position = -1 ;
  this._width = -1;
  this._height = -1;
  this._x = -1;
  this._y = -1;
        
  this._initialNumLines = -1 ;
  
  this._hasFeeler = false;
  
  this._maxY = -1;
  this._minY = -1;
};

/**
 * @return {number} Angle of the text in this slice label
 */
DvtSliceLabelInfo.prototype.getAngle = function()
{
  return this._angle;
}

/**
 * @param {number} angle Sets the angle of the text in this slice label
 */
DvtSliceLabelInfo.prototype.setAngle = function(angle)
{
  this._angle = angle;
}


/**
 * @return {number} The height of this slice label
 */
DvtSliceLabelInfo.prototype.getHeight = function()
{
  return this._height;
}

/**
 * @param {number} height The height of this slice label
 */
DvtSliceLabelInfo.prototype.setHeight = function(height)
{
  this._height = height;
}


/**
 * @return {number} 
 */
DvtSliceLabelInfo.prototype.getInitialNumLines = function()
{
  return this._initialNumLines;
}

/**
 * @param {number} numLines
 */
DvtSliceLabelInfo.prototype.setInitialNumLines = function(numLines)
{
  this._initialNumLines = numLines;
}


/**
 * @return {number} The maximum Y position of this slice label
 */
DvtSliceLabelInfo.prototype.getMaxY = function()
{
  return this._maxY;
}

/**
 * @param {number} The maximum Y position of this slice label
 */
DvtSliceLabelInfo.prototype.setMaxY = function(maxY)
{
  this._maxY = maxY;
}


/**
 * @return {number} The minimum Y position of this slice label
 */
DvtSliceLabelInfo.prototype.getMinY = function()
{
  return this._minY;
}

/**
 * @param {number} The minimum Y position of this slice label
 */
DvtSliceLabelInfo.prototype.setMinY = function(minY)
{
  this._minY = minY;
}

/**
 * bound the value of y within minY and maxY
 * assumes that maxY > minY
 * @param {number} a y value
 */
DvtSliceLabelInfo.prototype.boundY = function(y) {
  y = Math.max(y, this._minY);
  y = Math.min(y, this._maxY);
  return y;
}


/**
 * @return {boolean}
 */
DvtSliceLabelInfo.prototype.hasFeeler = function()
{
  return this._hasFeeler;
}

/**
 * @param {boolean}
 */
DvtSliceLabelInfo.prototype.setHasFeeler = function(hasFeeler)
{
  this._hasFeeler = hasFeeler;
}


/**
 * Returns the normalized midpoint angle, where 0 degrees is at 12 o'clock
 * and angular measures are degrees away from 12 o'clock (so 90 degrees
 * can be either at 3 o'clock or 9 o'clock on the unit circle)
 * 
 * @return {number}
 */
DvtSliceLabelInfo.prototype.getPosition = function()
{
  return this._position;
}

/**
 * Sets the normalized midpoint angle, where 0 degrees is at 12 o'clock
 * and angular measures are degrees away from 12 o'clock (so 90 degrees
 * can be either at 3 o'clock or 9 o'clock on the unit circle)
 * 
 * @param {number} position
 */
DvtSliceLabelInfo.prototype.setPosition = function(position)
{
  this._position = position;
}


/**
 * The slice that we want to associate the label with
 * 
 * @return {DvtPieSlice}
 */
DvtSliceLabelInfo.prototype.getSlice = function()
{
  return this._slice;
}

/**
 * @param {DvtPieSlice} slice
 */
DvtSliceLabelInfo.prototype.setSlice = function(slice)
{
  this._slice = slice;
}


/**
 * The DvtTextArea associated with this SliceLabelInfo
 * 
 * @return {DvtTextArea}
 */
DvtSliceLabelInfo.prototype.getSliceLabel = function()
{
  return this._sliceLabel;
}

/**
 * Sets the DvtTextArea this label info will layout
 * 
 * @param {DvtTextArea} label
 */
DvtSliceLabelInfo.prototype.setSliceLabel = function(label)
{
  this._sliceLabel = label;
}

/**
 * @return {number} The width of this label
 */
DvtSliceLabelInfo.prototype.getWidth = function()
{
  return this._width;
}

/**
 * @param {number} width
 */
DvtSliceLabelInfo.prototype.setWidth = function(width)
{
  this._width = width;
}

/**
 * @return {number} The x-coordinate of the reference point for this label
 */
DvtSliceLabelInfo.prototype.getX = function()
{
  return this._x;
}

/**
 * @param {number} x
 */
DvtSliceLabelInfo.prototype.setX = function(x)
{
  this._x = x;
}

/**
 * @return {number} The y-coordinate of hte reference point for this label
 */
DvtSliceLabelInfo.prototype.getY = function()
{
  return this._y;
}

/**
 * @param {number} y
 */
DvtSliceLabelInfo.prototype.setY = function(y)
{
  this._y = y;
}

// Copyright (c) 2008, 2013, Oracle and/or its affiliates. 
// All rights reserved. 

/*---------------------------------------------------------------------*/
/*   DvtSliceLabelLayout                                               */
/*---------------------------------------------------------------------*/

/**
 * Class that creates pie slice labels and lays these labels out for a given pie chart
 * 
 * @constructor
 * @param {DvtPieChart} pieChart
 */
var DvtSliceLabelLayout = function(pieChart)
{
  this._init(pieChart);
}

DvtObj.createSubclass(DvtSliceLabelLayout, DvtObj, "DvtSliceLabelLayout");

// used for setting up font metrics
DvtSliceLabelLayout._FONT_METRIC_CHAR = "M";
DvtSliceLabelLayout._FEELER_MINLENGTH  = 9 ;
DvtSliceLabelLayout._ISA_FULL_RATIO = 0.9;

DvtSliceLabelLayout._FEELER_RIGHT_SPECIAL_ANGLE = 351 ;   // special angle to readjust feelers
DvtSliceLabelLayout._FEELER_LEFT_SPECIAL_ANGLE  = 189 ;

DvtSliceLabelLayout._MAX_LINES_PER_LABEL = 3;

DvtSliceLabelLayout._COLLISION_MARGIN = 1 ; 

DvtSliceLabelLayout._LEFT_SIDE_LABELS = 1 ; 
DvtSliceLabelLayout._RIGHT_SIDE_LABELS = 2 ; 

DvtSliceLabelLayout._LABEL_LEADING = -1.8 ;  // space between lines

// BUGFIX 12403570
// when calculating angles, we sometimes lose accuracy due to rounding, so introduce this tolerance
DvtSliceLabelLayout._ROUNDING_TOLERANCE = 0.0001;

//constants for column layout
DvtSliceLabelLayout._FEELER_RAD_MINSIZE = 0.1;      // ratio to the pie diameter
DvtSliceLabelLayout._FEELER_HORIZ_MINSIZE = 0.1;     // ratio to the pie diameter
DvtSliceLabelLayout._LABEL_TO_FEELER_OFFSET = 0.7;   // ratio to the label height
DvtSliceLabelLayout._LABEL_TO_FEELER_DISTANCE = 3;   // in pixels

DvtSliceLabelLayout._NO_COLLISION = 0;
DvtSliceLabelLayout._HALF_COLLISION = 1;
DvtSliceLabelLayout._ALL_COLLISION = 2;


/**
 * Private intialization method
 * 
 * @param {DvtPieChart} pieChart The pie chart to perform label layout on.
 * 
 * @private
 */
DvtSliceLabelLayout.prototype._init = function(pieChart)
{
  this._pieChart = pieChart;

  // ISA spacing parameters (ISA = ideal space available)
  this._isaTop ;
  this._isaBottom ;
  this._isaLeft ;
  this._isaRight ;
  this._isaHeight ;
  this._isaXRadius ;
  this._isaYRadius ;

  this._avgHeightFont = -1;
}   

/**
 * Public entry point called by DvtPieChart to layout the pie chart's labels and feelers.
 */
DvtSliceLabelLayout.prototype.layoutLabelsAndFeelers = function()
{
  var labelPosition = this._pieChart.getPieInfo().getLabelPosition();
  if(labelPosition == DvtPieChart.LABEL_POS_NONE) 
  {
    return;  
  }  
  else if(labelPosition == DvtPieChart.LABEL_POS_INSIDE) 
  {
    this._layoutInsideLabels();      
  }

  else 
  {
    this._layoutOutsideLabelsAndFeelers();  
  }
}

/**
 * 
 * Lays out labels that appear within the pie slices.
 * 
 * @private 
 */
DvtSliceLabelLayout.prototype._layoutInsideLabels = function() 
{
  if(this._pieChart == null)
    return;

  slices = this._pieChart.__getSlices();
  var n = slices.length ;
  
  if (n > 0)
  {    
    for (i = 0; i < n; i++) 
    {
      var slice = slices[i];
      var midPt;
      var midAngle = slice.getAngleStart() + (slice.getAngleExtent() / 2);
      var posX = 0;
      var posY = 0;
      
      var sliceLabel = DvtSliceLabelLayout._createLabel(slice);

      // The flash Graph tries to center the label manually.
      // With the toolkit, we can just set the alignment on the label
      // to center, middle
      
      var offset = 0.66;  // Constant originally used in flash impl

      midPt = DvtPieRenderUtils.reflectAngleOverYAxis(midAngle, 
            this._pieChart.getCenter().x, this._pieChart.getCenter().y, 
            this._pieChart.getRadiusX() * offset, this._pieChart.getRadiusY() * offset);


      posX = midPt.x ;
      posY = midPt.y ;

      sliceLabel.setTranslateX(posX);
      sliceLabel.setTranslateY(posY);
      sliceLabel.alignCenter();
      sliceLabel.alignMiddle();
      
      slice.setSliceLabel(sliceLabel);
    }
  }
}


/**
 * 
 * Lays out labels (and feelers if necessary) that appear outside the pie slices
 * 
 * @private
 */
DvtSliceLabelLayout.prototype._layoutOutsideLabelsAndFeelers = function()
{

  if(this._pieChart == null)
    return;

  var leftLabels = [];
  var rightLabels = [] ;
 
  var slice ;
  var i ;

  var txtArea; // an instance of DvtTextArea 

  // get first label for some text metrics        
  var slices = this._pieChart.__getSlices();
  slice   = slices[0] ;
  txtArea = DvtSliceLabelLayout._createLabel(slice) ;
  
  txtArea.setText(DvtSliceLabelLayout._FONT_METRIC_CHAR) ;
  
  var tempPt = DvtSliceLabelLayout._getTextDimension(this._pieChart, txtArea, -1, -1, -1);
  
  this._avgHeightFont = tempPt.y;
  
  // The magic numbers below, 0.75 and 0.6, we also used in the original Flash impl
  var feelerSpacing = this._avgHeightFont * 0.75 + 0.6 * this._pieChart.__getMaxExplodePixels() ;
              
  if (feelerSpacing < DvtSliceLabelLayout._FEELER_MINLENGTH)
  {
    feelerSpacing = DvtSliceLabelLayout._FEELER_MINLENGTH ;
  }
            
  // setup an ISA - Ideal Space Available
  this._isaXRadius = this._pieChart.getRadiusX();// + feelerSpacing ;
  this._isaYRadius = this._pieChart.getRadiusY();// + feelerSpacing ; 
            
  var pieFrame = this._pieChart.__getFrame();
            
  this._isaLeft    = pieFrame.x ;
  this._isaRight   = pieFrame.x + pieFrame.w ;
  this._isaTop     = pieFrame.y ;
  this._isaBottom  = pieFrame.y + pieFrame.h ;
  
  this._isaHeight   = this._isaBottom - this._isaTop ;  
            
  // -----------------------------------------------------------
  // Build arrays of Left side and Right side Labels
  //
  // When computing the positioning of the labels, we consider 
  // angles to be measured from the 12 o'clock position, 
  // i.e., 12 o'clock is 0 degrees.
  // Angular measurements then range from 0 to 180.  
  // A value of 90 degrees can then be either at the
  // 3 o'clock position or at the 9 o'clock position
  // -----------------------------------------------------------

  this._originalLabels = [];
  var alabels = this._generateInitialLayout();

  leftLabels  = alabels[0] ;
  rightLabels = alabels[1] ;

  // -----------------------------------------------------------
  // Evaluate initial label layout from generateInitialLayout
  // -----------------------------------------------------------
  
  var leftColl = this._refineInitialLayout(leftLabels, DvtSliceLabelLayout._LEFT_SIDE_LABELS);
  var rightColl = this._refineInitialLayout(rightLabels, DvtSliceLabelLayout._RIGHT_SIDE_LABELS);
  if (leftColl == DvtSliceLabelLayout._HALF_COLLISION && rightColl != DvtSliceLabelLayout._NO_COLLISION) {
    this._columnLabels(leftLabels, true, true, true); 
  }
  if (leftColl != DvtSliceLabelLayout._NO_COLLISION && rightColl == DvtSliceLabelLayout._HALF_COLLISION) {
    this._columnLabels(rightLabels, false, true, true);
  }
  
  //
  // Left Side Labels ----------------------------------
  //
  this._setLabelsAndFeelers(leftLabels, DvtSliceLabelLayout._LEFT_SIDE_LABELS) ;
                  
  for (i = 0; i < leftLabels.length; i++)
    leftLabels[i] = null ;
                    
  leftLabels = null ;
    

  //
  // Right Side Labels ---------------------------------
  //          
  this._setLabelsAndFeelers(rightLabels, DvtSliceLabelLayout._RIGHT_SIDE_LABELS) ;

  for (i = 0;i < rightLabels.length;i++)
    rightLabels[i] = null;

  rightLabels = null;              

  // clean up
  alabels[0] = null;
  alabels[1] = null;
  alabels = null;
  
}



/**
 * Create a label for the given pie slice. Label positioning is done elsewhere
 * @param {DvtPieSlice} slice
 * @return {DvtTextArea}
 * @private
 */
DvtSliceLabelLayout._createLabel = function(slice)
{
  var pieChart = slice.getPieChart();
  
  if (pieChart.getPieInfo().getLabelPosition() == DvtPieChart.LABEL_POS_NONE)
  {
    return null;
  }

  var  context = pieChart.getContext() ;

  var sliceLabel = new DvtTextArea(context, 0, 0) ;     // In Flash, the fix for bug 7593102 was to create another
                                                        // label class to maintain truncated label state. We don't
                                                        // need that in html 5
  
  //setting the dominant baseline to top yields different results in Firefox vs Chrome
  //so for the moment, align to the baseline
  sliceLabel.alignBaseline(); 
  sliceLabel.setWordWrap(true);
  sliceLabel.setAngle(0) ;
  
  var style = pieChart.getPieInfo().getCSSStyle();
  DvtSliceLabelLayout._setFontPropsOnLabel(style, sliceLabel);

  var labelStr = DvtPieSlice.generateSliceLabelString(slice);
  sliceLabel.setText(labelStr);
  slice.setSliceLabelString(labelStr);
  
  return sliceLabel;
}



/**
 * Helper function to set DvtCSSStyle on slice label, given a DvtFont object
 * 
 * @param {DvtCSSStyle} style The CSS style to set the slice label text
 * @param {DvtTextArea} sliceLabel The slice label to set font properties on
 * @private 
 */
DvtSliceLabelLayout._setFontPropsOnLabel = function(style, sliceLabel)
{
  if(sliceLabel == null || style == null)
    return;
  
  sliceLabel.setCSSStyle(style);
}


/**
 * 
 * Called after initial naive layout is generated to resolve label collisions
 * 
 * @param {Array} labelInfoArray An array of DvtSliceLabelInfo objects
 * @param {number} side Either DvtSliceLabelLayout._LEFT_SIDE_LABELS or DvtSliceLabelLayout._RIGHT_SIDE_LABELS
 * @private 
 */
DvtSliceLabelLayout.prototype._refineInitialLayout = function(labelInfoArray, side)
{

  if (labelInfoArray && labelInfoArray.length > 0)
  {
    var lastY = this._isaTop ; //think again!!
    var collisionTop = false;
    var collisionCentral = false;
    var collisionBottom = false;
    var labelBottom = 0 ;
    
    var labelInfo;
    
    var bottomQuarter = false;
    var prevBottomQuarter = bottomQuarter;
    var collide = false;
    var isLeftSideLabels = (side == DvtSliceLabelLayout._LEFT_SIDE_LABELS);
    
    for (var i = 0; i < labelInfoArray.length; i++)
    {
      labelInfo = labelInfoArray[i];
      
      prevBottomQuarter = bottomQuarter;
      if (labelInfo.getPosition() > 90) {
          bottomQuarter = true;
      }

      labelBottom = labelInfo.getY() + labelInfo.getHeight() ;
      
      collide = (lastY - labelInfo.getY()) > DvtSliceLabelLayout._COLLISION_MARGIN;
  
      if (collide) {
        if (!bottomQuarter) {
          collisionTop = true;
        } else if (bottomQuarter && !prevBottomQuarter) {
          collisionCentral = true;
        } else {
          collisionBottom = true;
        }
      }
                          
      if (labelBottom > lastY) {
        lastY = labelBottom ;
      }         
    }
  
    if ((collisionTop && collisionBottom) || collisionCentral) {
      this._columnLabels(labelInfoArray, isLeftSideLabels, true, true);
      return DvtSliceLabelLayout._ALL_COLLISION;
    } else if (collisionTop) {
      this._columnLabels(labelInfoArray, isLeftSideLabels, true, false); //top only
      return DvtSliceLabelLayout._HALF_COLLISION;
    } else if (collisionBottom) {
      this._columnLabels(labelInfoArray, isLeftSideLabels, false, true); //bottom only
      return DvtSliceLabelLayout._HALF_COLLISION;
    } else {
      return DvtSliceLabelLayout._NO_COLLISION;
    }
  }
}



// ported over from PieChart.as, renderLabelsAndFeelers
/**
 * 
 * Sets the location of the DvtTextArea objects as specified in the DvtSliceLabelInfo objects in alabels.
 * When this method returns, the DvtPieChart labels corresponding to the DvtSliceLabelInfo objects in alabels 
 * will have their layout positions set, and will be ready to render
 * 
 * @param {Array} alabels An array of DvtSliceLabelInfo objects. 
 * @private 
 */
DvtSliceLabelLayout.prototype._setLabelsAndFeelers = function(alabels, side)
{
  if (alabels == null || alabels.length <= 0)
    return;
    
  var i ;
  var slice; // instance of DvtPieSlice
  var sliceLabel; // instance of DvtTextArea
  var labelInfo; // instance of DvtSliceLabelInfo 
 
  var isLeftSide = (side == DvtSliceLabelLayout._LEFT_SIDE_LABELS) ;
  var tilt = this._pieChart.getDepth() ;
  var cy ;

  var labelInfoY = -1;;
  var labelInfoX = -1;
  var labelInfoHeight = -1;
  
  for (i = 0; i < alabels.length; i++)
  {
    labelInfo = alabels[i];
    slice = labelInfo.getSlice();
    sliceLabel = labelInfo.getSliceLabel();
    tilt = DvtSliceLabelLayout._adjustForDepth(labelInfo.getAngle(), this._pieChart.getDepth());

    labelInfoX = labelInfo.getX();
    labelInfoY = labelInfo.getY();
    labelInfoHeight = labelInfo.getHeight();
    labelInfoWidth = labelInfo.getWidth();
    
    cy = labelInfoY;// + tilt ;
    
  // Now, adjust for the fact that all the flash logic computed the upper left-hand corner of
  // the textfield's bounding box, and not the baseline 
  // Adjust for this by shifting to the baseline by adding the avgFontHeight
    cy += this._avgHeightFont;    
//    sliceLabel.alignTop(); // browser impl different, so unreliable for DvtTextArea
    sliceLabel.setTranslateY(cy);
    sliceLabel.setTranslateX(labelInfoX);
    
    if (DvtStyleUtils.isLocaleR2L() && isLeftSide){
        if (DvtAgent.getAgent().isWebkit() && !DvtAgent.getAgent().isTouchDevice())
        sliceLabel.alignStart();
      else
        sliceLabel.alignEnd();
    }
    // perform 'logical' clipping ourselves
          
    if ((labelInfoY < this._isaTop) || 
        (labelInfoY + labelInfoHeight) > this._isaBottom) {
      slice.setSliceLabel(null);
    } else {
      slice.setSliceLabel(sliceLabel);
    }
                        
    // Bug fix 8358713 - don't show feelers if the label is 'clipped' (invisible)                                  
    if (labelInfo.hasFeeler() && slice.getSliceLabel()) {
      // setup the feeler line (let it clip if needed)      
      DvtSliceLabelLayout._calculateFeeler(labelInfo, slice, isLeftSide) ;
    } else {
      slice.setNoOutsideFeeler();
    }
  }
}


// replaces PieChart.drawFeeler
/**
 * 
 * Sets the feeler line that extends from the pie to the targetPt on the given slice. This method computes where
 * on the pie the feeler line should start, and then the start point and targetPt are set on the input slice.
 * 
 * @param {object} targetPt An object with x and y fields describing where the feeler point should extend to.
 * @param {DvtPieSlice} slice A DvtPieSlice object
 * @private
 */
DvtSliceLabelLayout._calculateFeeler = function(labelInfo, slice, isLeft)
{
  var pieChart = slice.getPieChart();
  
  var targetX = labelInfo.getX();
  var targetY = labelInfo.getY() + labelInfo.getHeight()*DvtSliceLabelLayout._LABEL_TO_FEELER_OFFSET;
  var minHorizLength = DvtSliceLabelLayout._FEELER_HORIZ_MINSIZE * pieChart.getRadiusX();
  
  var midX;
  if (isLeft) {
    targetX += DvtSliceLabelLayout._LABEL_TO_FEELER_DISTANCE;
    midX = targetX + minHorizLength;
  } else {
    targetX -= DvtSliceLabelLayout._LABEL_TO_FEELER_DISTANCE;
    midX = targetX - minHorizLength;
  }

  if (pieChart.getPieInfo().getLabelPosition() == DvtPieChart.LABEL_POS_OUTSIDE_FEELERS)
  {
    var startPt = {x:0, y:0};
    var midPt = {x: midX, y: targetY};
    var endPt = {x: targetX, y: targetY};
    
    var ma  = labelInfo.getAngle();
    var tilt = DvtSliceLabelLayout._adjustForDepth(ma, pieChart.getDepth()) ;
                  
    startPt = DvtPieRenderUtils.reflectAngleOverYAxis(ma, 
                                                      pieChart.getCenter().x, 
                                                      pieChart.getCenter().y + tilt, 
                                                      pieChart.getRadiusX(), 
                                                      pieChart.getRadiusY()) ;
    
    // make set the first section of the feeler radial if possible 
    var pa = DvtMath.degreesToRads(labelInfo.getPosition());
    var radFeelerAngle = Math.abs(Math.atan2(midPt.x-startPt.x, startPt.y-midPt.y));
    var horizOffset = (startPt.y-midPt.y) * Math.tan(pa);// * pieChart.getRadiusX() / pieChart.getRadiusY();
    if ((pa > Math.PI/2 && radFeelerAngle > Math.PI/2 && radFeelerAngle < pa) || 
        (pa < Math.PI/2 && radFeelerAngle < Math.PI/2 && radFeelerAngle > pa)) {
      if (isLeft) {
        midPt.x = startPt.x - horizOffset;
      } else {
        midPt.x = startPt.x + horizOffset;
      }
    }
    
    //bglazer: store outside feeler points on slice
    //and let slice draw the feeler so that we can 
    //easily redraw it when selecting
    slice.setOutsideFeelerPoints(startPt, midPt, endPt);
  }
}

/**

 * Generates the offset of a label feeler to account for the depth of a 3d pie.
 * 
 * @param {number} ma The angle on the unit circle from which the leaderline should originate from
 * @param {number} depth The pie chart's depth
 * 
 * @return {number} The offset for the feeler line
 * @private
 */
DvtSliceLabelLayout._adjustForDepth = function(ma, pieDepth)
{
  var depth      = 0 ;
  var leftMidHi  = 189;
  var rightMidHi = 351;

  if (ma > leftMidHi && ma < rightMidHi) {
    depth = pieDepth ;
  }

  return depth ;            
}




/**
 *  Finds the label corresponding to the most horizontal slice
 *  
 *  @param {Array} alabels An array of DvtSliceLabelInfo objects
 *  @private
 */
DvtSliceLabelLayout.prototype._getMiddleLabel = function(alabels) {
  bestAngle = 91;
  bestIndex = -1
  for (var i=0; i<alabels.length; i++) {
      pa = alabels[i].getPosition();
      if (Math.abs(pa-90) < bestAngle) {
        bestAngle = Math.abs(pa-90);
        bestIndex = i
      }
  }
  return bestIndex;
}


/**
 * 
 * @private
 */
DvtSliceLabelLayout.prototype._setOptimalLabelPosition = function(labelInfo, vertX, isLeft) {
  //set optimal X
  labelInfo.setX(vertX);
  this._truncateSliceLabel(labelInfo.getSlice(), labelInfo, vertX, isLeft);
  
  //set optimal Y
//  var a = this._pieChart.getRadiusX() * (1 + DvtSliceLabelLayout._FEELER_RAD_MINSIZE);
  var b = this._pieChart.getRadiusY() * (1 + DvtSliceLabelLayout._FEELER_RAD_MINSIZE);
  var angleInRad = DvtMath.degreesToRads(labelInfo.getPosition());
//  var heightFromCenter = a*b*Math.cos(angleInRad) / 
//      Math.sqrt(Math.pow(a*Math.cos(angleInRad), 2) + Math.pow(b*Math.sin(angleInRad), 2)); //ellipse equation 
  var heightFromCenter = b * Math.cos(angleInRad);
  var tilt = DvtSliceLabelLayout._adjustForDepth(labelInfo.getAngle(), this._pieChart.getDepth());
  var optimalY = this._pieChart.getCenter().y - heightFromCenter - 
            labelInfo.getHeight()*DvtSliceLabelLayout._LABEL_TO_FEELER_OFFSET + tilt;
  labelInfo.setY(labelInfo.boundY(optimalY));
}


/**
 *  Adjusts the label locations by positioning the labels vertically in a column
 *  
 *  @param {Array} alabels An array of DvtSliceLabelInfo objects
 *  @param {boolean} isLeft Boolean indicating if these labels are on the left side of the pie
 *  @private
 */
DvtSliceLabelLayout.prototype._columnLabels = function(alabels, isLeft, isTop, isBottom) {
  
  var minY = this._isaTop;
  var maxY = this._isaBottom;
  var i;
  var labelInfo;
  
  //determine the position where the column will be aligned
  var vertX = this._pieChart.getCenter().x;
  var minFeelerDist = this._pieChart.getRadiusX() * 
        (1 + DvtSliceLabelLayout._FEELER_RAD_MINSIZE + DvtSliceLabelLayout._FEELER_HORIZ_MINSIZE);
  //var labelWidth;
  if (isLeft) {
    vertX -= minFeelerDist;
    //labelWidth = vertX - this._isaLeft;
  } else {
    vertX += minFeelerDist;
    //labelWidth = this.isaRight - vertX;
  }
  
  //set the minimum heights that ensures as many labels as possible are displayed
  for (i = 0; i < alabels.length; i++) {
    alabels[i].setMinY(minY);
    minY += alabels[i].getHeight();
  }
  
  //set the maximum heights that ensures as many labels as possible are displayed
  for (i = alabels.length-1; i >= 0; i--) {
    maxY -= alabels[i].getHeight();
    alabels[i].setMaxY(maxY);
  }
  
  if (alabels[0].getMinY() >= alabels[0].getMaxY()) { // not all labels will fit on the screen
    for (i = 0; i < alabels.length; i++) {            // fit as many as possible
      labelInfo = alabels[i];
      labelInfo.setX(vertX);
      this._truncateSliceLabel(labelInfo.getSlice(), labelInfo, vertX, isLeft);
      labelInfo.setY((labelInfo.getMinY() + labelInfo.getMaxY()) / 2);
      labelInfo.setHasFeeler(true);
    }
    return;
  }

  var startIndex = this._getMiddleLabel(alabels);
  var startLabel = alabels[startIndex];
  var isStartAtTop = startLabel.getPosition() <= 90;
  
  //if the column is only partial but there are too many labels, then set the whole side as column
  if (isTop && !isBottom) {
    if (startLabel.getMinY() > this._pieChart.getCenter().y) {
      isBottom = true;
    }
  }
  if (isBottom && !isTop) {
    if (startLabel.getMaxY() < this._pieChart.getCenter().y) {
      isTop = true;
    }
  }
  
  //position the start label at the column if the angle is suitable
  if ((isTop && isStartAtTop) || (isBottom && !isStartAtTop)) {
    this._setOptimalLabelPosition(startLabel, vertX, isLeft);
    startLabel.setHasFeeler(true);
  }
  
  var highestY = startLabel.getY();
  var lowestY = startLabel.getY() + startLabel.getHeight();
  
  var optimalY;
  var labelHeight;
  
  if (isTop) { //labels above the start label
    for (i = startIndex - 1; i >= 0; i--) {
      labelInfo = alabels[i];
      labelHeight = labelInfo.getHeight();
      this._setOptimalLabelPosition(labelInfo, vertX, isLeft);
      labelInfo.setHasFeeler(true);
      
      //avoid collision with the label below
      optimalY = labelInfo.getY();
      if (optimalY + labelHeight < highestY) {
        highestY = optimalY;
      } else {
        highestY -= labelHeight;
      }
      labelInfo.setY(highestY);
    }
  }
  
  if (isBottom) { //labels below the start label
    for (i = startIndex + 1; i < alabels.length; i++) {
      labelInfo = alabels[i];
      labelHeight = labelInfo.getHeight();
      this._setOptimalLabelPosition(labelInfo, vertX, isLeft);
      labelInfo.setHasFeeler(true);
      
      //avoid collision with the label above
      optimalY = labelInfo.getY();
      if (optimalY > lowestY) {
        lowestY = optimalY + labelHeight;
      } else {
        lowestY += labelHeight;
      }
      labelInfo.setY(lowestY - labelHeight);
    }
  }
}


/**
 * 
 * Truncates the label for the last time after the final X position is calculated
 * 
 * @param {DvtPieSlice} slice
 * @param {DvtSliceLabelInfo} labelInfo
 * @param {number} xpos
 * @param {boolean} isLeft Boolean indicating whether or not this slice is on the left side of the pie
 * 
 * @return {boolean} True if the height is modified after truncation, false otherwise
 * @private  
 */
 
DvtSliceLabelLayout.prototype._truncateSliceLabel = function(slice, labelInfo, xpos, isLeft)
{
  var textArea = labelInfo.getSliceLabel() ;
  var style = textArea.getCSSStyle() ;
  var maxLabelWidth = 0 ;
  var tmDimPt ;

  // before setting the DvtTextArea, make sure it is added to the DOM
  // necessary because the DvtTextArea will try to wrap, and to do that, 
  // it needs to get the elements dimensions, which it can only do if it's
  // added to the DOM

  var numChildren = this._pieChart.getNumChildren();  
  var removeTextArea = false;
  if (!this._pieChart.contains(textArea))
  {
    this._pieChart.addChild(textArea);
    removeTextArea = true;
  }

  textArea.setCSSStyle(style) ;
  var labelStr = slice.getSliceLabelString();
  textArea.setText(labelStr);
    
  if(removeTextArea)
  {
    this._pieChart.removeChildAt(numChildren);
  }

  if (isLeft) 
  {
    maxLabelWidth = xpos - this._isaLeft ;
  }
  else 
  {
    maxLabelWidth = this._isaRight - xpos ;
  }
            
  // truncates with larger space            
  tmDimPt = DvtSliceLabelLayout._getTextDimension(this._pieChart,
                                                  textArea, maxLabelWidth, -1, labelInfo.getInitialNumLines()) ;    
          
  // Update labelinfo
  labelInfo.setWidth(tmDimPt.x);
  
  if (labelInfo.getHeight() != tmDimPt.y) 
  {
    labelInfo.setHeight(tmDimPt.y) ; // new height
    return true ;
  }
  else 
  {
    return false ; 
  }

}



/**
 * 
 * Create initial layout, placing each label in its ideal location. Locations will be subsequently updated 
 * to account for collisions
 
 * @return {Array}  An array with two elements. The first element is an array of DvtSliceLabelInfo objects for the
 *                  labels on the left side of the pie.  The second element is an array of DvtSliceLabelInfo objects
 *                  for the labels on the right side of the pie.
 * 
 * @private
 */
DvtSliceLabelLayout.prototype._generateInitialLayout = function()
{
  var arArrays = new Array(2) ;
  var leftLabels  = [];
  var rightLabels = [];
          
  var slice; // DvtPieSlice 
  var labelPt; // generic objects with x and y fields
  var tmDimPt;

  var ma = 0; ;
  var pa = 0 ;
  var i ;
  var j ;
  var n ;

  var s_label; // an instance of DvtTextArea ;           // for bug 7593102
  var maxLabelWidth ;

  slices = this._pieChart.__getSlices();
  n = slices.length;
  
  if (n > 0)
  {    
    for (i = 0; i < n; i++)
    {
      slice   = slices[i] ;
      s_label = DvtSliceLabelLayout._createLabel(slice) ;
                  
      ma = slice.getAngleStart() + (slice.getAngleExtent() / 2) ;
                  
      if (ma > 360) ma -= 360 ;
      if (ma < 0)   ma += 360 ;
 
      labelPt = DvtPieRenderUtils.reflectAngleOverYAxis(ma, this._pieChart.getCenter().x,
          this._pieChart.getCenter().y, this._isaXRadius, this._isaYRadius) ;

      if (ma >= 90 && ma < 270)
      {
        maxLabelWidth = labelPt.x - this._isaLeft ;
      }
      // right side
      else
      {
        maxLabelWidth = this._isaRight - labelPt.x ;
      }
      
      tmDimPt = DvtSliceLabelLayout._getTextDimension(this._pieChart, s_label, maxLabelWidth, -1, 
                                      DvtSliceLabelLayout._MAX_LINES_PER_LABEL) ;  // set up for word wrap
       
      if ( DvtSliceLabelLayout._is3DSpecialRegion(ma, this._pieChart.is3D()) )
      {
        labelPt.y -= tmDimPt.y ;
      }
      
      if (ma < 165 && ma > 15) { //upper half
        labelPt.y -= tmDimPt.y * 1.4;
      } else if (ma < 15 || ma > 345) { //right side, near horizontal
        labelPt.y -= tmDimPt.y * 0.7;
        labelPt.x += tmDimPt.y * 0.25;
      } else if (ma > 165 && ma < 195) { //left side, near horizontal
        labelPt.y -= tmDimPt.y * 0.7;
        labelPt.x -= tmDimPt.y * 0.25;
      }
      
      var tilt = DvtSliceLabelLayout._adjustForDepth(ma, this._pieChart.getDepth());
      labelPt.y += tilt;
      
      if (n == 1) { //only 1 label
        labelPt.x -= tmDimPt.x / 2; //position the label at the center
      }
                  
      if (labelPt.y < this._isaTop) {
        labelPt.y = this._isaTop ;
      }
                  
      if ((labelPt.y + tmDimPt.y) > this._isaBottom) {
        labelPt.y = this._isaBottom - tmDimPt.y ;
      }

      if (ma >= 90.0 && ma < 270.0)  // left side
      {
        // right align
        s_label.alignEnd();
//        s_label.alignTop();  // alignTop impl buggy - too much interline space in FF
        
        // normalize from 0 to 180
        pa = ma - 90.0 ;
        
        DvtSliceLabelLayout._createLabelInfo(slice, s_label, ma, pa, 
          tmDimPt, labelPt, leftLabels);        
      }

      else                              // right side
      {
        // normalize from 0 to 180
        pa = (ma <= 90.0) ? Math.abs( 90 - ma ) : (180 - (ma - 270)) ;

        DvtSliceLabelLayout._createLabelInfo(slice, s_label, ma, pa, 
          tmDimPt, labelPt, rightLabels);
      }        
    }

  }

  arArrays[0] = leftLabels ;    
  arArrays[1] = rightLabels ;    
          
  return arArrays ;

}


/**
 * Private helper function used to determine if an angle aligns with the horizontal axis of the pie
 * 
 * @param {Number} angle
 * @return {Boolean}
 */
DvtSliceLabelLayout._isOnHorizontalAxis = function(angle)
{
  return  angle < DvtSliceLabelLayout._ROUNDING_TOLERANCE || 
          Math.abs(angle - 180) < DvtSliceLabelLayout._ROUNDING_TOLERANCE || 
          Math.abs(angle -360) < DvtSliceLabelLayout._ROUNDING_TOLERANCE;
}


/**
 * Create the DvtSliceLabelInfo property bag object for a given slice and inserts it into labelInfoArray,
 * it its properly sorted position (where top-most labels are at the start of the array)
 * 
 * @param {DvtPieSlice} slice
 * @param {DvtTextArea} sliceLabel  The physical label we will associate with thie DvtSliceLabelInfo. This
                                    label will be the one eventually associated with the input slice, if this
                                    label gets rendered                                   
 * @param {number} ma The angle for the feeler line, with 0 degrees being the standard
 *                    0 degrees in the trigonometric sense (3 o'clock position)
 * @param {number} pa The normalized midpoint angle, where 0 degrees is at 12 o'clock
 *                    and angular measures are degrees away from 12 o'clock (so 90 degrees
 *                    can be either at 3 o'clock or 9 o'clock on the unit circle. Used to order slice
 *                    labels from top to bottom
 * @param {object} tmDimPt Object representing the width and height of the slice label
 * @param {object} labelPit The outside endpoint of the feeler line
 * @param {Array} labelInfoArray Where we store the newly created DvtSliceLabelInfo
 * 
 */

// method carefully refactored from the end of PieChart.prepareLabels
DvtSliceLabelLayout._createLabelInfo = function(slice, sliceLabel, ma, pa, 
  tmDimPt, labelPt, labelInfoArray)
{
  var insertPos = -1;
  var labelInfo;
  var s_label = sliceLabel;
  
  // insertion "sort"
  for (var j = 0; j < labelInfoArray.length; j++)
  {
    labelInfo = labelInfoArray[j];                    
    if (labelInfo.getPosition() > pa)
    {
        insertPos = j ;
        break;
    }
  }

  if (insertPos == -1)
    insertPos = labelInfoArray.length ;
  
  labelInfo = new DvtSliceLabelInfo() ;
  
  labelInfo.setPosition(pa) ;
  labelInfo.setAngle(ma) ;
  labelInfo.setSliceLabel(s_label) ;
  labelInfo.setSlice(slice);
  labelInfo.setWidth(tmDimPt.x); 
  labelInfo.setHeight(tmDimPt.y) ;
  labelInfo.setInitialNumLines(s_label.getNumLines()) ;
  labelInfo.setX(labelPt.x);
  labelInfo.setY(labelPt.y) ;
  
  labelInfoArray.splice(insertPos, 0, labelInfo) ;
}


/**
 * 
 * @param {number} angle
 * @param {boolean} is3D
 * 
 * @return {boolean} true if angle lies in a special region in 3D pies, false otherwise. This "special region"
 *                    is the section of the pie just below the horizontal axis. 
 * @private
 */
DvtSliceLabelLayout._is3DSpecialRegion = function(angle, is3D)       
{
  if (is3D)
  {
    // BUGFIX 12403570; remove the >= and <= when checking against 180 and 360 and replace with > and <
    return ((angle <= DvtSliceLabelLayout._FEELER_LEFT_SPECIAL_ANGLE && angle>180) ||
            (angle >= DvtSliceLabelLayout._FEELER_RIGHT_SPECIAL_ANGLE && angle<360));
  }
  return false ;
}


/**
 * 
 * Wraps and truncates the text in the pieLabel, and returns a pt describing the new dimensions
 * @param {DvtPieChart} pieChart 
 * @param {DvtTextArea} tf the DvtTextArea to wrap and truncate
 * @param {Number} conWidth the maxWidth of a line
 * @param {Number} conHeight the maxHeight of the DvtTextArea
 * @param {Number} maxLines the maximum number of lines to wrap, after which the rest of the text is truncated
 * @private
 */

DvtSliceLabelLayout._getTextDimension = function(pieChart, tf, conWidth, conHeight, maxLines)   
{  
  var numChildren = pieChart.getNumChildren();
  // we need to make sure the label is added to the DOM to get the dimensions
  pieChart.addChild(tf);

  tf.setLeading(DvtSliceLabelLayout._LABEL_LEADING);

  // wrap the text and then return a point with the new dimension
  tf.setWordWrap(true);
  tf.setMaxLines(maxLines);
  tf.setMaxWidth(conWidth);
   
  var pt = {x:0, y:0};
  var dimensions; 

  dimensions = tf.getDimensions();

  pt.x = dimensions.w;
  pt.y = dimensions.h;
  pieChart.removeChildAt(numChildren);
  return pt;
  
}
// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 

/**
  *   Animation on Display funtionality.
  *   @class
  */
var DvtAnimOnDisplay = function() {};

DvtObj.createSubclass(DvtAnimOnDisplay, DvtObj, "DvtAnimOnDisplay");

/**
  *  Creates a DvtPlayable that performs initial animation for a chart.
  *  @param {DvtChartImpl} chart
  *  @param {string} type The animation type.
  *  @param {number} duration The duration of the animation in seconds.
  *
  * @return {DvtPlayable} The animation of the chart objects that are subject to animation.
  */
DvtAnimOnDisplay.createAnimation = function(chart, type, duration)
{
  var arPlayables = [] ;
  var chartType   = chart.getType();

  if (chartType === "bar"  || chartType === "horizontalBar" ||
      chartType === "line" || chartType === "area"          ||
      chartType === "combo")  {
    DvtAnimOnDisplay._animBarLineArea(chart, duration, arPlayables) ;
  }
  else if (chartType === 'bubble' || chartType === 'scatter') {
    DvtAnimOnDisplay._animBubbleScatter(chart, duration, arPlayables) ;
  }

  return ((arPlayables.length > 0) ? new DvtParallelPlayable(chart.getContext(), arPlayables) : null) ;
};


/**
  *  Adds a list of playables that animates the chart on initial display, for 
  *  the bar and line/area components (including visible markers) to the
  *  supplied array.
  *  @param {DvtChartImpl} chart
  *  @param {number} duration The duration of the animation in seconds.
  *  @param {Array} arPlayables The array to which the playables should be added.
  */
DvtAnimOnDisplay._animBarLineArea = function(chart, duration, arPlayables)
{
   var objs      = chart.getObjects() ;
   var objCount  = objs? objs.length : 0 ;

   if (objCount) {
     var obj, peer ;
     var nodePlayable;
     var endState ;
     var seriesType;
     var chartType = chart.getType() ;
     var bBarChart = ((chartType.indexOf("bar") >= 0) || (chartType.indexOf("Bar") >= 0)) ;

     for (var i = 0; i < objCount; i++) {
        peer = objs[i] ;
        obj  = peer.getDisplayables()[0] ;

        nodePlayable = null ;
        if (obj instanceof DvtPolyline) {
          nodePlayable = DvtAnimOnDisplay._getLinePlayable(chart, obj, duration) ;
        }
        else  if (obj instanceof DvtPolygon) {
           seriesType = peer.getSeriesType();
           if (seriesType === 'bar') 
             nodePlayable = DvtAnimOnDisplay._getBarPlayable(chart, obj, duration) ;
           else if (seriesType === 'area') 
             nodePlayable = DvtAnimOnDisplay._getAreaPlayable(chart, obj, duration) ;
        }   
        else {
           if (! peer.getSeriesItem().markerDisplayed) {
                continue ;
           }
           // Fade-in the marker near the end of the line/area animation
           nodePlayable = new DvtAnimFadeIn(chart.getContext(), obj, (duration - 0.8), 0.8) ;
        }

        if (nodePlayable) {
          arPlayables.push(nodePlayable) ;
        }
     }          // end for
   }      // end if objs

};



/**
  *  Adds a list of playables that animates the chart on initial display, for 
  *  the bubble and scatter components to the supplied array.
  *  @param {DvtChartImpl} chart
  *  @param {number} duration The duration of the animation in seconds.
  *  @param {Array} arPlayables The array to which the playables should be added.
  */
DvtAnimOnDisplay._animBubbleScatter = function(chart, duration, arPlayables)
{
   var objs      = chart.getObjects() ;
   var objCount  = objs? objs.length : 0 ;
   var chartType = chart.getType() ;

   if (objCount) {
     var obj, peer ;
     var nodePlayable;

     for (var i = 0; i < objCount; i++) {
        peer = objs[i] ;
        obj  = peer.getDisplayables()[0] ;

        if (obj instanceof DvtMarker) {
          nodePlayable = (chartType === 'bubble')? DvtAnimOnDisplay._getBubblePlayable(chart,  obj, duration) :
                                                   DvtAnimOnDisplay._getScatterPlayable(chart, obj, duration) ;
          arPlayables.push(nodePlayable) ;
        }
     }
   }
};



/**
  *   Returns a DvtPlayable representing the animation of an area polygon
  *   to its initial data value.
  *   @param {DvtChartImpl} chart
  *   @param {DvtPolygon} area  the area polygon to be animated.
  *   @returns {DvtPlayable} a playable representing the animation of the area
  *   polygon to its initial data value.
  */
DvtAnimOnDisplay._getAreaPlayable = function(chart, area, duration)
{
   //  The last 2 coords of the area polygon just connect the last data
   //  point to the baseline and to the leftside of the plot area and
   //  are not data coords.

   var arPoints   = area.getPoints() ;
   var endState   = arPoints.slice(0) ;  // copy, we will update the original
   var len        = arPoints.length ;

   if (len <= 4) {                  // (2 coords = 4 array entries)
     return null ;                  // bale out for this area - no data points.
   }
   var yBase = arPoints[len-1] ;    // y value of base line

   len -= 4 ;                       // get count of actual data points
   for (j = 0; j < len; j += 2) {
     arPoints[j+1] = yBase ;
   }
   area.setPoints(arPoints) ;       // set initial position

   var nodePlayable = new DvtCustomAnimation(chart.getContext(), area, duration);
   nodePlayable.getAnimator().addProp(DvtAnimator.TYPE_NUMBER_ARRAY, area, area.getPoints, area.setPoints, endState);

   return nodePlayable ;
};


/**
  *   Returns a DvtPlayable representing the animation of a bar to
  *   its initial data value.
  *   @param {DvtChartImpl} chart
  *   @param {DvtPolygon} bar  the bar polygon to be animated.
  *   @returns {DvtPlayable} a playable representing the animation of the bar
  *   polygon to its initial data value.
  */
DvtAnimOnDisplay._getBarPlayable = function(chart, bar, duration)
{
   var arPoints       = bar.getPoints() ;
   var endState       = arPoints.slice(0) ;  // copy, we will update the original
   var yBaselineCoord = chart.yAxis.getBaselineCoord();

   if (! DvtChartTypeUtils.isHorizontal(chart)) {
     arPoints[1] = yBaselineCoord ;       // top left y
     arPoints[3] = yBaselineCoord ;       // top right y

     if (DvtChartTypeUtils.isStacked(chart)) {
       arPoints[5] = yBaselineCoord ;     // bottom left y
       arPoints[7] = yBaselineCoord ;     // bottom right y
     }
   }
   else {
     arPoints[0] = yBaselineCoord ;       // top right y
     arPoints[2] = yBaselineCoord ;       // bottom right y

     if (DvtChartTypeUtils.isStacked(chart)) {
       arPoints[4] = yBaselineCoord ;     // bottom left y
       arPoints[6] = yBaselineCoord ;     // top left y
     }
   }
   bar.setPoints(arPoints) ;              // set initial position

   var nodePlayable = new DvtCustomAnimation(chart.getContext(), bar, duration);
   nodePlayable.getAnimator().addProp(DvtAnimator.TYPE_NUMBER_ARRAY, bar, bar.getPoints, bar.setPoints, endState);

   return nodePlayable ;
};


/**
  *   Returns a DvtPlayable representing the animation of a chart's
  *   bubble marker to its initial data value.
  *   @param {DvtChartImpl} chart
  *   @param {DvtMarker} marker  the DvtMarker to be animated.
  *   @returns {DvtPlayable} a playable representing the animation of the marker
  *   to its initial data value.
  */
DvtAnimOnDisplay._getBubblePlayable = function(chart, marker, duration)
{
   var context = chart.getContext();
   var endScale = new DvtPoint(marker.getScaleX(), marker.getScaleY()) ;
   marker.setScaleX(1) ;
   marker.setScaleY(1) ;

   var p1 = new DvtAnimScaleBy(context, marker, endScale, duration);
   var p2 = new DvtAnimFadeIn(context, marker, duration);
   
   // Create a translation animation to grow the bubbles from the center.
   var size = marker.getSize();
   var matrix = marker.getMatrix().clone();
   matrix.translate(size/2, size/2);
   marker.setMatrix(matrix);
   var p3 = new DvtAnimMoveBy(context, marker, new DvtPoint(-size/2, -size/2), duration);

   return  new DvtParallelPlayable(context, [p1, p2, p3]) ;
};



/**
  *   Returns a DvtPlayable representing the animation of the line to
  *   its initial data value.
  *   @param {DvtChartImpl} chart
  *   @param {DvtPolyline} line  the polyline to be animated.
  *   @returns {DvtPlayable} a playable representing the animation of the line
  *   polyline to its initial data value.
  */
DvtAnimOnDisplay._getLinePlayable = function(chart, line, duration)
{
   var arPoints   = line.getPoints() ;
   var endState   = arPoints.slice(0) ;     // copy, we will update the original
   var len        = arPoints.length ;

   DvtAnimOnDisplay._getMeanPoints(arPoints) ;     // update arPoints to initial coords
   line.setPoints(arPoints) ;                      // set initial position

   var nodePlayable = new DvtCustomAnimation(chart.getContext(), line, duration);
   nodePlayable.getAnimator().addProp(DvtAnimator.TYPE_NUMBER_ARRAY, line, line.getPoints, line.setPoints, endState);

   return nodePlayable ;
};


/**
  *   Returns a DvtPlayable representing the animation of a chart's
  *   scatter marker to its initial data value.
  *   @param {DvtChartImpl} chart
  *   @param {DvtMarker} marker  the DvtMarker to be animated.
  *   @returns {DvtPlayable} a playable representing the animation of the marker
  *   to its initial data value.
  */
DvtAnimOnDisplay._getScatterPlayable = function(chart, marker, duration)
{
   return new DvtAnimPopIn(chart.getContext(), marker, true, duration) ;
};


/**
  *   Updates the supplied array of line coordinates to reflect the mean y
  *   position of the line data. 
  *   @param {Array} arPoints  the line vertex coordinates.
  */
DvtAnimOnDisplay._getMeanPoints = function(arPoints)
{
   var mean  = 0 ;
   var min   = Number.MAX_VALUE ;
   var max   = Number.MIN_VALUE ;
   var len   = arPoints.length ;
   var i ;

   for (i = 1; i < len; i += 2) {   // find largest and smallest y-values
      var v = arPoints[i] ;         // and their sum.
      if (v < min) {
        min = v ;
      }
      if (v > max) {
        max = v ;
      }
      mean += v ;
   }

   if (len > 4) {                   // if more than 2 data points
     mean -= min ;                  // discard smallest and largest
     mean -= max ;                  // values to get a generally
     mean /= (len -4)/2 ;           // more representative mean.
   }
   else {                           // 2 points only, make the second
     mean = arPoints[1] ;           // grow from the first.
     arPoints[2] = arPoints[0] ;
   }
   mean = Math.round(mean) ;

   for (i = 1; i < len; i += 2) {
      arPoints[i] = mean ;
   }

}; 
// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 

/**
  *   Animation on Datachange functionality.
  *   @class
  */
var DvtAnimOnDC = function() {};

DvtObj.createSubclass(DvtAnimOnDC, DvtObj, "DvtAnimOnDC");

/**
  *  Creates a DvtPlayable that performs animation between a chart's data states.
  *  @param {DvtChartImpl} chart
  *  @param {string} type The animation type.
  *  @param {number} duration The duration of the animation in seconds.
  *
  * @return {DvtPlayable}
  */
DvtAnimOnDC.createAnimation = function(oldChart, newChart, type, duration, delContainer)
{
   var playable = null ;      // return value

   if (! DvtAnimOnDC._canAnimate(oldChart, newChart)) {
     return null ;
   }

   var  ctx  = newChart.getContext() ;

   // Build arrays of old and new data change handlers.

   var  arOldList   = [];
   var  arNewList   = [];
   var  arOldPeers  = oldChart['peers'] ;
   var  arNewPeers  = newChart.getObjects() ;
   if (newChart.getType() === 'pie') {
     arOldList.push(oldChart['pieChart']);
     arNewList.push(newChart['pieChart']);
   } else {
    DvtAnimOnDC._buildAnimLists(ctx, arOldList, oldChart, arNewList, newChart, duration) ;
   }

   //  Walk the datachange handler arrays, and create animators for risers
   //  that need to be updated/deleted/inserted.

   var  ah  = new DvtDataAnimationHandler(ctx, delContainer) ;
   ah.constructAnimation(arOldList, arNewList) ;

   if (ah.getNumPlayables() > 0) {
     playable = ah.getAnimation() ;
   }

   return playable ;
};


/**
  *  Builds two (supplied) arrays of data change handlers (such as {@link DvtDC3DBar}
  *  for the old and new charts. Also creates this._Y1Animation list of gridline
  *  playables if axis scale change.
  *  @private
  */ 
DvtAnimOnDC._buildAnimLists = function(ctx, arOldList, oldChart, arNewList, newChart, duration)
{
  var  ar = oldChart['peers'] ;
   var  aLen = ar.length
   if ((aLen <= 0) && (newChart.getObjects().length <= 0)) {
     return ;
   }

   //  Create a list of DC handlers in arOldPeers and arNewPeers for the old and new peers.

   var  i,j ;
   var  aOut ;
   var  peer, obj ;
   var  chartType ;
   var  seriesType ;
   var  dch ;
   var  chartType = oldChart.type ;
   var  bBarChart = ((chartType.indexOf("bar") >= 0) || (chartType.indexOf("Bar") >= 0)) ;

   aOut = arOldList ;                    // start on old peers first
   for (i = 0; i < 2; i++) {             // loop over old peers and new peers
      for (j = 0; j < aLen; j++) {
         peer = ar[j] ;
         obj  = peer.getDisplayables()[0] ;
         dch  = null ;

         if (obj instanceof DvtPolyline) {
           dch = new DvtDCLineArea(peer, duration) ;
         }
         else  if (obj instanceof DvtPolygon) {
           seriesType = peer.getSeriesType();
           if (seriesType === 'bar') 
             dch  = new DvtDC2DBar(peer, duration) ;
           else if (seriesType === 'area') 
             dch  = new DvtDCLineArea(peer, duration) ;
         }   
         else  if (obj instanceof DvtMarker) {
           if (chartType === 'scatter' || chartType === 'bubble') {
             bMarkerDisplayed = true ;
           }
           else {
             if (i == 1)
               bMarkerDisplayed = peer.getSeriesItem()['markerDisplayed'] ;
             else {          // need to look in old data block
               bMarkerDisplayed = DvtChartDataUtils.getSeriesItem(oldChart, peer.getSeriesIndex())['markerDisplayed'];
             }
           }
           if (bMarkerDisplayed) {
             dch  = new DvtDCMarker(peer, duration) ;
           }
         }

         if (dch) {
           aOut.push(dch) ;
           dch.setOldChart(oldChart) ;
         }
      }

      aOut = arNewList ;               //  repeat on
      ar   = newChart.getObjects() ;   //  the new
      aLen = ar.length ;               //  chart's peers
   }
};


/**
  *  Checks if animation between the two charts is possible.
  *  @returns {boolean} true if animation can be performed, else false.
  *  @private
  */
DvtAnimOnDC._canAnimate = function(oldChart, newChart)
{
  //  Test for conditions for which we will not animate.
  
  var  oldType = oldChart.type ;
  var  newType = newChart.getType() ;
  
  if (oldType !== newType) 
    return false;
  else if (oldChart.type === 'pie' && (!oldChart || !newChart))
    return false;
  else if (oldChart.type !== 'pie' && (oldChart['peers'].length === 0 || newChart.getObjects().length === 0))
    return false;
  else 
    return true;
} ;





// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*--------------------------------------------------------------------*/
/*   DvtDCAbstract      Abstract class for data change animation      */
/*--------------------------------------------------------------------*/
/*  Data Change Handlers must support the following methods:          */
/*                                                                    */
/*      getId()                                                       */
/*      animateUpdate()                                               */
/*      animateInsert()                                               */
/*      animateDelete()                                               */
/*--------------------------------------------------------------------*/

/**
  *  Abstract Data change handler for a chart object peer.
  *  @extends DvtObj
  *  @class DvtDCAbstract  Data change Handler for a chart object peer.
  *  @constructor  
  *  @param {DvtChartObjPeer} peer  The chart object peer to be animated on datachange.
  *  @param {Number} duration  the duration of the animation in seconds.
  *  <p>
  *  @returns {DvtDCAbstract} A new DvtDCabstract derived object.
  */
var  DvtDCAbstract = function(peer, duration)
{
   this.Init(peer, duration) ;
};

DvtObj.createSubclass(DvtDCAbstract, DvtObj, "DvtDCAbstract");



/*--------------------------------------------------------------------*/
/*  animateUpdate()                                                   */
/*--------------------------------------------------------------------*/
/**
  * Creates an update animation from the old node to this node.
  * @param {DvtDataAnimationHandler} handler The animation handler, which can
  *                                  be used to chain animations. Animations
  *                                  created should be added via
  *                                  DvtDataAnimationHandler.add()
  * @param {DvtDCAbstract} oldNode The old node state to animate from.
  */
DvtDCAbstract.prototype.animateUpdate = function(handler, oldNode) {
};

/*--------------------------------------------------------------------*/
/*  animateInsert()                                                   */
/*--------------------------------------------------------------------*/
/**
  * Creates an insert animation for this node.
  * @param {DvtDataAnimationHandler} handler The animation handler, which can
  *                                  be used to chain animations. Animations
  *                                  created should be added via
  *                                  DvtDataAnimationHandler.add()
  */
DvtDCAbstract.prototype.animateInsert = function(handler)
{
};


/*--------------------------------------------------------------------*/
/*  animateDelete()                                                   */
/*--------------------------------------------------------------------*/
/**
  * Creates a delete animation for this node.
  * @param {DvtDataAnimationHandler} handler The animation handler, which can
  *                                  be used to chain animations. Animations
  *                                  created should be added via
  *                                  DvtDataAnimationHandler.add()
  * @param {DvtContainer} delContainer   The container to which deleted objects can
  *                                      be moved for animation.
  */
DvtDCAbstract.prototype.animateDelete = function(handler, delContainer)
{
};


/*---------------------------------------------------------------------*/
/*  getId()                                                            */
/*---------------------------------------------------------------------*/
/** 
  *  @returns {String}  a unique Id for object comparison during
  *  datachange animation of two charts.
  */
DvtDCAbstract.prototype.getId = function()
{
   return  this._animId ;
};


/*---------------------------------------------------------------------*/
/*  Init()                                                             */
/*---------------------------------------------------------------------*/
/**
  *  Object initializer.
  */
DvtDCAbstract.prototype.Init = function(peer, duration)
{
  this._peer     = peer ;
  this._duration = duration ;
  this._shape    = peer.getDisplayables()[0] ;
  this._animId   = peer.getSeries() + '/' + peer.getGroup() ;
};

/**
  *   Saves the psuedo old chart object.
  *   @param {Object} chart  a synopsis object created by DvtChart before
  *   the chart object is updated and rendered with new data.
  */
DvtDCAbstract.prototype.setOldChart = function(chart)
{
   this._oldChart = chart ;
};

// Copyright (c) 2008, 2013, Oracle and/or its affiliates. 
// All rights reserved. 
/*--------------------------------------------------------------------*/
/*   DvtDC2DBar    Data change Handler for 2D Bar Riser component     */
/*--------------------------------------------------------------------*/

/**
  *  Data change Handler for 2D Bar Riser (implements DvtDCAbstract).
  *  @extends DvtDCAbstract
  *  @class DvtDC2DBar  Data change Handler for 2D Bar Riser.
  *  @constructor  
  *  @param {DvtChartObjPeer} peer  The chart object peer for the shape to be animated.
  *  @param {Number} duration  the animation duration is seconds.
  *  <p>
  *  @returns {DvtDC2DBar} A new DvtDC2DBar object.
  */
var  DvtDC2DBar = function(peer, duration)
{
   this.Init(peer, duration) ;
};

DvtObj.createSubclass(DvtDC2DBar, DvtDCAbstract, "DvtDC2DBar");



/*--------------------------------------------------------------------*/
/*  animateUpdate()   implementation of DvtDCAbstract.animateUpdate() */
/*--------------------------------------------------------------------*/
/**
  * Creates the update animation for this 2D Bar.
  * @param {DvtDataAnimationHandler} handler The animation handler, which can
  *                                          be used to chain animations.
  * @param {DvtDC2DBar} oldNode The old node state to animate from.
  */
DvtDC2DBar.prototype.animateUpdate = function(handler, oldDC)
{
   var startState = oldDC._getAnimationParams();
   var endState   = this._getAnimationParams();

   if (DvtArrayUtils.equals(startState, endState))   // If no bar geometry change,
     return ;                                        // nothing to animate.

   var oldChart = this._oldChart ;
   var newChart = this._peer.getChart() ;

   var newSIdx  = this._peer.getSeriesIndex();
   var oldSIdx  = oldDC._peer.getSeriesIndex();
   var newGIdx  = this._peer.getGroupIndex();
   var oldGIdx  = oldDC._peer.getGroupIndex();

   //  Create an animate indicator if requested

   if (DvtChartStyleUtils.getAnimationIndicators(newChart) !== 'none') {
     this._makeDirPointer(startState, oldChart, oldSIdx, oldGIdx,
                          newChart, newSIdx, newGIdx);
   }

   // Create the animator for this bar update

   this._setAnimationParams(startState);    // initialize the start state
   var nodePlayable = new DvtCustomAnimation(this._shape.getContext(), this, this._duration);
   nodePlayable.getAnimator().addProp(DvtAnimator.TYPE_NUMBER_ARRAY, this,
                                      this._getAnimationParams, this._setAnimationParams, endState);
   if (this._indicator) {
     nodePlayable.setOnEnd(this._onEndAnimation, this) ;
   }

   handler.add(nodePlayable, 0);           // create the playable

};

/*--------------------------------------------------------------------*/
/*  animateInsert()   implementation of DvtDCAbstract.animateInsert() */
/*--------------------------------------------------------------------*/
/**
  * Creates the insert animation for this 2D Bar.
  * @param {DvtDataAnimationHandler} handler The animation handler, which
  * can be used to chain animations.
  * @return {DvtPlayable} The animation to perform for this insert.
  */
DvtDC2DBar.prototype.animateInsert = function(handler)
{
   var obj         = this._shape ;
   var bHorizontal = DvtChartTypeUtils.isHorizontal(this._peer.getChart()) ;

   var endState   = obj.getPoints() ;
   var startState = endState.slice(0) ;
   endState.push(obj.getAlpha()) ;
   startState.push(0) ;                                        // start alpha

   if (bHorizontal) {
     var halfHeight  = (startState[7] - startState[1])/2 ;     // bottom left y - top left y
     startState[1] += halfHeight                               // top left y
     startState[3] += halfHeight                               // top right y
     startState[5] -= halfHeight                               // bottom right y
     startState[7] -= halfHeight                               // bottom left y
   }
   else {
     var halfWidth  = (startState[2] - startState[0])/2 ;      // top right x - top left x
     startState[0] += halfWidth                                // top left x
     startState[2] -= halfWidth                                // top right x
     startState[4] -= halfWidth                                // bottom right x
     startState[6] += halfWidth                                // bottom left x
   }
   this._setAnimationParamsPlusAlpha(startState);              // set the start state

   var nodePlayable = new DvtCustomAnimation(obj.getContext(), this, this._duration);
   nodePlayable.getAnimator().addProp(DvtAnimator.TYPE_NUMBER_ARRAY, this,
                                      this._getAnimationParamsPlusAlpha, this._setAnimationParamsPlusAlpha, endState);
   
   handler.add(nodePlayable, 0);                    // create the playable
};


/*--------------------------------------------------------------------*/
/*  animateDelete()   implementation of DvtDCAbstract.animateDelete() */
/*--------------------------------------------------------------------*/
/**
  * Creates the delete animation for this 2D Bar.
  * @param {DvtDataAnimationHandler} handler The animation handler, which can be used to
  *                                          chain animations.
  * @param {DvtContainer} delContainer   The container to which the deleted objects should
  *                                      be moved for animation.
  * @returns {DvtPlayable} The animation to perform for this delete.
  */
DvtDC2DBar.prototype.animateDelete = function(handler, delContainer)
{
   var obj         = this._shape ;
   var bHorizontal = DvtChartTypeUtils.isHorizontal(this._peer.getChart()) ;

   delContainer.addChild(obj);           // Move from existing container to the delete
                                         // container on top of the new chart.
   var startState = obj.getPoints() ;
   var endState   = startState.slice(0) ; ;

   if (bHorizontal) {
     var halfHeight  = (startState[7] - startState[1])/2 ;    // bottom left y - top left y
     endState[1] += halfHeight                                // top left y
     endState[3] += halfHeight                                // top right y
     endState[5] -= halfHeight                                // bottom right y
     endState[7] -= halfHeight                                // bottom left y
   }
   else {
     var halfWidth  = (startState[2] - startState[0])/2 ;     // top right x - top left x
     endState[0] += halfWidth                                 // top left x
     endState[2] -= halfWidth                                 // top right x
     endState[4] -= halfWidth                                 // bottom right x
     endState[6] += halfWidth                                 // bottom left x
   }
   endState.push(0) ;                                         // end alpha

   var nodePlayable = new DvtCustomAnimation(obj.getContext(), this, this._duration);
   nodePlayable.getAnimator().addProp(DvtAnimator.TYPE_NUMBER_ARRAY, this,
                                      this._getAnimationParamsPlusAlpha, this._setAnimationParamsPlusAlpha, endState);
   
   handler.add(nodePlayable, 0);     // create the playable
};



/*--------------------------------------------------------------------*/
/*  _getAnimationParams()                                             */
/*--------------------------------------------------------------------*/
/**
  *   Returns the geometry of the bar.
  *   @returns {Array} an array containing the polygon points of the
  *   bar, plus the alpha as the last element of the array.
  */
DvtDC2DBar.prototype._getAnimationParams = function()
{
    return this._shape.getPoints() ;
};


/*--------------------------------------------------------------------*/
/*  _getAnimationParamsPlusAlpha()                                    */
/*--------------------------------------------------------------------*/
/**
  *   Returns the geometry of the bar and its alpha.
  *   @returns {Array} an array containing the polygon points of the
  *   bar, plus the alpha as the last element of the array.
  */
DvtDC2DBar.prototype._getAnimationParamsPlusAlpha = function()
{
    var ar = this._shape.getPoints() ;
    ar.slice(0) ;
    ar.push(this._shape.getAlpha()) ;

    return ar ;
};


/*---------------------------------------------------------------------*/
/*   _getIndicatorPos()                                                */
/*---------------------------------------------------------------------*/
/**
  *  Computes the x and y position coords for an update indicator from a polygon's
  *  points and a precomputed offset in this._offset.
  *  and returns the values in this._xPos and this._yPos. .
  *  @param {arPoints}  arPoints  coordinates for the polygon.
  */
DvtDC2DBar.prototype._getIndicatorPos = function(ar)
{
   //  Note: coord order for vertical and horizontal polygons is different!
   //  Vertical :
   //       +0        +1           +2        +3             +4         +5          +6        +7
   //    (topleftX, toplefty), (toprightX,toprightY),   (botrightx, botrighty), (botleftX, bottomleftY))
   //  Horizontal :
   //    (toprightX, toprightY), (botrightX,botrightY), (botleftX, botleftY),   (topleftX, topleftY))

   var halfW ;
   var halfH ;
   var xpos = ar[0] ;
   var ypos = ar[1] ;

   if (this._bVertical) {
     halfW = (ar[2] - ar[0])/2 ;        // vertical bar
     halfH = (ar[5] - ar[3])/2 ;

     if (this._bStacked) {
       xpos += halfW ;
       ypos += halfH ;
     }
     else {
       xpos += halfW ;
       ypos += this._offset;
     }
   }
   else {
     halfW = (ar[0] - ar[6])/2 ;        // horizontal bar
     halfH = (ar[3] - ar[1])/2 ;

     if (this._bStacked) {
       xpos -= halfW ;
       ypos += halfH ;
     }
     else {
       xpos += this._offset;
       ypos += halfH ;
     }
   }

   this._xPos = xpos ;
   this._yPos = ypos ;

} ;



/*---------------------------------------------------------------------*/
/*  Init()                override of DvtDCAbstract.Init()             */
/*---------------------------------------------------------------------*/
/**
  *  Object initializer.
  */
DvtDC2DBar.prototype.Init = function(peer, duration)
{
  DvtDC2DBar.superclass.Init.call(this, peer, duration) ;
  
  this._indicator  = null ;
  this._bVertical  = ! DvtChartTypeUtils.isHorizontal(peer.getChart());
  this._bStacked   = DvtChartTypeUtils.isStacked(peer.getChart()) ;
} ;


/*--------------------------------------------------------------------*/
/*   _makeDirPointer()                                                */
/*--------------------------------------------------------------------*/
/**
 *     Creates an update value direction pointer and positions it.
 */
DvtDC2DBar.prototype._makeDirPointer = function(startState, oldChart, oldSIdx, oldGIdx,
                                                newChart, newSIdx, newGIdx)
{
  var uiDirection = DvtDCUtils.getDirection(oldChart, oldSIdx, oldGIdx, newChart, newSIdx, newGIdx);

  if (uiDirection !== DvtDCUtils.DIR_NOCHANGE) {

    var bDown = (uiDirection === DvtDCUtils.DIR_DOWN);

    this._offset  = -10;
    if ((!this._bStacked) && (! this._bVertical)){
      this._offset  = DvtStyleUtils.isLocaleR2L() ? -8 : 8;
    }

    this._getIndicatorPos(startState) ;     // updates this._xPos and this._yPos

    fc = bDown?  DvtChartStyleUtils.getAnimationDownColor(newChart) :
                 DvtChartStyleUtils.getAnimationUpColor(newChart) ;

    //  Create a path object that draws the indicator (it will be correctly positioned
    //  later in _setAnimationParams().

    var dirptr = DvtDCUtils.drawDirectionPointer(bDown, this._xPos, this._yPos, this._offset,
                                                 fc, this._shape.getContext(), !this._bVertical) ;
    newChart.getPlotArea().addChild(dirptr); 
    this._indicator = dirptr ;
  }
};


/*--------------------------------------------------------------------*/
/*  _setAnimationParams()                                             */
/*--------------------------------------------------------------------*/
/**
  *   Updates the geometry of the bar.
  *   @param {Array} ar  an array containing the polygon points.
  */
DvtDC2DBar.prototype._setAnimationParams = function(ar)
{
   this._shape.setPoints(ar) ;

   // Check for update direction indicators.

   if (this._indicator) {
     var plotArea  = this._peer.getChart().getPlotArea() ;
     var ptr       = this._indicator;

     plotArea.removeChild(ptr);            // keep indicator on top of z-order
        
     this._getIndicatorPos(ar) ;           // compute new indicator position
     ptr.setTranslateX(this._xPos);
     ptr.setTranslateY(this._yPos);

     plotArea.addChild(ptr);
   }

};


/*--------------------------------------------------------------------*/
/*  _setAnimationParamsPlusAlpha()                                    */
/*--------------------------------------------------------------------*/
/**
  *   Updates the geometry of the bar and its alpha.
  *   @param {Array} ar  an array containing the rectangle points,
  *   with the alpha value as the last element of the array.
  */
DvtDC2DBar.prototype._setAnimationParamsPlusAlpha = function(ar)
{
   var alpha = ar[ar.length-1] ;           // last element is alpha
   var a     = ar.slice(0, ar.length-1) ;  // need copy - don't want to
                                           // pass the alpha as a datapoint
   this._shape.setPoints(a) ;
   this._shape.setAlpha(alpha) ;
};


DvtDC2DBar.prototype._onEndAnimation = function()
{
   var plot = this._peer.getChart().getPlotArea() ;

   plot.removeChild(this._indicator) ;
   this._indicator = null ;
};

// Copyright (c) 2008, 2013, Oracle and/or its affiliates. 
// All rights reserved. 
/*--------------------------------------------------------------------*/
/*   DvtDCLineArea    Data change Handler for Line and Area Risers    */
/*--------------------------------------------------------------------*/

/**
  *  Data change Handler for Area Riser (implements DvtDCAbstract).
  *  @extends DvtObj
  *  @class DvtDCLineArea  Data change Handler for Line and Area Risers.
  *  @constructor  
  *  @param {DvtChartObjPeer} peer  The chart object peer for the shape to be animated.
  *  @param {Number} duration  the animation duration is seconds.
  *  <p>
  *  @returns {DvtDCLineArea} A new DvtDCLineArea object.
  */
var  DvtDCLineArea = function(peer, duration)
{
   this.Init(peer, duration) ;
};

DvtObj.createSubclass(DvtDCLineArea, DvtDCAbstract, "DvtDCLineArea");


/*--------------------------------------------------------------------*/
/*  animateUpdate()      override of DvtDCAbstract.animateUpdate()    */
/*--------------------------------------------------------------------*/
/**
 * Creates the update animation for this Line or Area. Insert/delete of
 * groups within an existing series is treated as a special case of animateUpdate.
 * @param {DvtDataAnimationHandler} handler The animation handler, which can be
 *                                          used to chain animations.
 * @param {DvtDCLineArea} oldDC   The old node DC Handler to animate from.
 */
DvtDCLineArea.prototype.animateUpdate = function(handler, oldDC) {

   //-----------------------------------------------------------------------------//
   //  Animation summary :                                                        //
   //                                                                             //
   //  Updates  - just perform regular animation from oldState to newState        //
   //                                                                             //
   //  Inserts  - initially position the inserted point into the old point list   //
   //             with an x,y position proportionally between, and on the line    //
   //             connecting, the two non-inserted points on either side in the   //
   //             new initial line.  It can then be tweened to its final position //
   //             in the new list.                                                //
   //                                                                             //
   //  Deletes  - perform the reverse of an insert. The deleted point is inserted //
   //             into the new point list in its original position in the old     //
   //             list. It can then be tweened to an x,y position proportionally  //
   //             between, and on the line connecting, the final position of the  //
   //             two non-deleted points on either side in the new line.          //
   //             It can then be tweened from its original position to its final  //
   //             position on the connecting line.                                //         
   //-----------------------------------------------------------------------------//

   var startState   = oldDC._getAnimationParams();
   var endState     = this._getAnimationParams();
   this._finalState = null;

   if (DvtArrayUtils.equals(startState, endState)) {   // any geometry changes ?
     return ;                                          // no, nothing to animate.
   }

   var oldChart = this._oldChart ;
   var newChart = this._peer.getChart() ;

   //  Summarize the group changes as inserts/deletes/updates.

   var arOldGroups = DvtChartDataUtils.getGroups(oldChart) ;
   var arNewGroups = DvtChartDataUtils.getGroups(newChart) ;
   var oldGroupLen = arOldGroups.length;
   var newGroupLen = arNewGroups.length;

   var arCompare     = DvtDCUtils.compareGroups(arOldGroups, arNewGroups);
   var arUpdates     = arCompare[0];                                     // updated groups
   var arInserts     = arCompare[1];                                     // inserted groups
   var arDeletes     = arCompare[2];                                     // deleted groups
   var bInsertDelete = ((arInserts.length > 0) || (arDeletes.length > 0)) ;

   //  Create an array that represents the type of point (e.g. DvtDCUtils.INSERT,
   //  DvtDCUtils.DELETE, or DvtDCUtils.UPDATE in the initial new polyline/polygon.

   var arPointType = [] ;           // holds the point type for each line vertex.
   var iPT = 0;                     // index into arPointType

   // Create 2 arrays for old and new points of the same length for animation.
   // Inserted and deleted points will exist in both (but with different coords).
   // At the end of the animation, the original new points will be applied to 
   // the polyline/polygon, to remove the redundant deleted points.

   var arOldPt = null ;
   var arNewPt = null ;

   if (bInsertDelete) {
     arOldPt = [] ;
     arNewPt = [] ;
   }

   //  Create an array of logical direction indicators and directions, if
   //  indicator support requested. 

   this._arPointers  = null;         // updated for 
   this._arDirection = null;         // updates only.

   if ((DvtChartStyleUtils.getAnimationIndicators(newChart) !== 'none') && (arUpdates.length > 0) && (! bInsertDelete)) {
     this._arPointers  = [] ;
     this._arDirection = [] ;
   }

   var aptsOld = oldDC._getAnimationParams();       // the old and new points to loop
   var aptsNew = this._getAnimationParams();        // over while populating arOldPt
                                                    // and arNewPt.
   var newSIdx = this._peer.getSeriesIndex();
   var oldSIdx = oldDC._peer.getSeriesIndex();

   var ixOld    = 0;             // index into the old group list
   var ixNew    = 0;             // index into the new group list
   var ixOldPts = 0;             // index into aptsOld
   var ixNewPts = 0;             // index into aptsNew


   //  Loop over both sets of groups.  If inserts/deletes, also build 2 new arrays of
   //  start and end states for the polyline/polygon vertices in arOldPt and arNewPt.

   while ((ixOld < oldGroupLen) || (ixNew < newGroupLen)) {   // loop over both sets of groups
        if (ixOld < oldGroupLen && ixNew < newGroupLen)    {
          if (arOldGroups[ixOld] === arNewGroups[ixNew])    { // same group = not an insert/delete
            arPointType[iPT] = DvtDCUtils.UPDATE;
            ixOldPts = ixOld * 2;
            ixNewPts = ixNew * 2;
            
            var xPos = aptsOld[ixOldPts++];    // get vertice old (x,y) 
            var yPos = aptsOld[ixOldPts];
            
            if (this._arPointers != null){
              this._makeDirPointer(xPos, yPos, oldChart, oldSIdx, ixNew,
                                   newChart, newSIdx, ixNew, iPT);
            }
            ixOld++;
            ixNew++;
            iPT++;

            if (! bInsertDelete) {
              continue
            }

            arOldPt.push(xPos);                 // old x      // add old points to
            arOldPt.push(yPos);                 // old y      // anim start points array
            arNewPt.push(aptsNew[ixNewPts++]);  // new x      // add corresponding new points
            arNewPt.push(aptsNew[ixNewPts]);    // new y      // to anim new points array.
         
           }
           else if (DvtArrayUtils.getIndex(arDeletes, arOldGroups[ixOld]) > -1) {
              // its a delete
              arPointType[iPT] = DvtDCUtils.DELETE ;
              ixOldPts = ixOld * 2;
            
              arOldPt.push(aptsOld[ixOldPts++]);  // old x
              arOldPt.push(aptsOld[ixOldPts]);    // old y
              arNewPt.push(0);                    // placeholder new x
              arNewPt.push(0);                    // placeholder new y
            
              ixOld++;

              if (this._arPointers != null) {
                this._arPointers[iPT]  = null;    // dummy
                this._arDirection[iPT] = null;    // entries
              }
              iPT++;
           }
           else if (DvtArrayUtils.getIndex(arInserts, arNewGroups[ixNew]) > -1) {
              // its an insert
              arPointType[iPT] = DvtDCUtils.INSERT;
              ixNewPts = ixNew *2;
            
              arOldPt.push(0);                    // placeholder old x
              arOldPt.push(0);                    // placeholder old y
              arNewPt.push(aptsNew[ixNewPts++]);  // new x
              arNewPt.push(aptsNew[ixNewPts]);    // new y
            
              ixNew++;

              if (this._arPointers != null) {
                this._arPointers[iPT]  = null;    // dummy
                this._arDirection[iPT] = null;    // entries
              }
              iPT++;
           }
           else {
              ixOld++;
              ixNew++;
           }
       }
       else if (ixOld < oldGroupLen) {             // if we've run out of new entries
           while (ixOld < oldGroupLen){
              arPointType[iPT] = DvtDCUtils.DELETE = 1; // the remaining old entries must be deletes
              ixOldPts = ixOld * 2;
              arOldPt.push(aptsOld[ixOldPts++]) ;  // old x
              arOldPt.push(aptsOld[ixOldPts]) ;    // old y
              arNewPt.push(0) ;                    // placeholder new x
              arNewPt.push(0) ;                    // placeholder new y
            
              ixOld++;

              if (this._arPointers != null) {
                this._arPointers[iPT]  = null;     // dummy
                this._arDirection[iPT] = null;     // entries
              }
              iPT++;
           }
           break;
       }
       else {                                      // we must have run out of old entries
           while (ixNew < newGroupLen) {
              arPointType[iPT] = DvtDCUtils.INSERT; // the remaining new entries must be inserts
              ixNewPts = ixNew * 2;
              arOldPt.push(0) ;                    // placeholder old x
              arOldPt.push(0) ;                    // placeholder old y
              arNewPt.push(aptsNew[ixNewPts++]) ;  // new x
              arNewPt.push(aptsNew[ixNewPts]) ;    // new y
            
              ixNew++;

              if (this._arPointers != null) {
                this._arPointers[iPT]  = null;    // dummy
                this._arDirection[iPT] = null;    // entries
              }
              iPT++;
           }
           break;
       }
   } // end while


   //  If we have inserts and/or deletes, we now need to calculate and fill in
   //  the null placeholder values set above in arOldPt and arNewPt.


   //--------------------------------------------------------------------------//
   //  At this point  arPointType contains an entry for each data point in     //
   //  the polyline/polygon on initial display (i.e. before animations start). //
   //  Each entry contains :                                                   //
   //    DvtDCUtils.UPDATE  = entry is unchanged or updated                    //
   //    DvtDCUtils.DELETE  = entry is deleted and will be animated out        //
   //    DvtDCUtils.INSERT  = entry is inserted and will be animated in        //
   //                                                                          //
   //  Also the initial and final tween positions have been generated for the  //
   //  the non-insert/delete entries, the initial postions only have been      //
   //  generated for the delete entries, and the final positions only for the  //
   //  insert entries.                                                         //
   //--------------------------------------------------------------------------//

   if (bInsertDelete) {

     var pt1x   = 0;                   // for computation of a line segment's middle point.
     var pt1y   = 0;
     var pt2x   = 0;
     var pt2y   = 0;
     var xInc   = 0;                   // x and y increments for
     var yInc   = 0;                   // proportional placement
     var iPTLen = arPointType.length;
       
     for (var i = 0; i < iPTLen; i++) {            // loop over arPointType
        if (arPointType[i] == DvtDCUtils.UPDATE)   // ignore non-insert/delete entries
          continue;
           
        //  Count the # of consecutive entries of the same type
        var n = arPointType[i];          // note the type
        var iConsec = 1;                 // # of consecutive entries
        var ix;                          // temp index
        for (ix = i+1; ix < iPTLen; ix++) {
           if (arPointType[ix] != n)
               break;
           iConsec++;
        }

        //  The iConsec's worth of points might be the last (rightmost) points
        //  in the line.
        var bFinalGroup = (ix ===iPTLen);   // note if so

        //  If this is the first or last entry, need to do edge case special handling

                                               //-----------------------//
        if (i === 0)                           // is it the first entry //
        {                                      //-----------------------//

           if (n === DvtDCUtils.INSERT)       // is it an insert
           {                                  // yes, fill-in its initial position
              //  Use the (x,y) coords of the first non-inserted point on the initial
              //  display line position as the initial inserted point(s) position.

              n = (i + iConsec) * 2 ;         // get 1st non-inserted index

              pt1x  =  arOldPt[n] ;
              pt1y  =  arOldPt[n +1] ;

              for (ix = 0; ix < iConsec; ix++)
              {
                 if (ix > 0)
                   i++ ;
                 n = i * 2 ;

                 arOldPt[n++] =  pt1x ;
                 arOldPt[n]   =  pt1y ;
              }
           }
           else                                // its a delete
           {
              //  Use the (x,y) coords of the first non-deleted point on the final
              //  display line position as the final delete point(s) positions.

              n = (i + iConsec) * 2 ;        // get 1st non-deleted index

              pt1x  =  arNewPt[n] ;
              pt1y  =  arNewPt[n +1] ;

              for (ix = 0; ix < iConsec; ix++)
              {
                 if (ix > 0)
                   i++ ;
                 n = i * 2 ;

                 arNewPt[n++] =  pt1x ;
                 arNewPt[n]   =  pt1y ;
              }
           }
        }                                                   //---------------------------//
        else  if ( (i === (iPTLen -1) )  || bFinalGroup)    // is it the right-end entry //
        {                                                   // or final right hand group //
                                                            //---------------------------//
           if (n === DvtDCUtils.INSERT)      // is it an insert
           {                                 // yes, fill-in its initial position
              //  Use the (x,y) coords of the last non-inserted point on the initial
              //  display line position as the initial inserted position.

              n = (i -1) * 2 ;               // get index of previous entry

              pt1x  =  arOldPt[n] ;
              pt1y  =  arOldPt[n +1] ;

              n = i * 2 ;                   // get index of last entry
              arOldPt[n++] =  pt1x ;
              arOldPt[n]   =  pt1y ;
           }
           else
           {
              //  Use the (x,y) coords of the first non-deleted point on the final
              //  display line position as the final delete point(s) positions.
      
              n = (i -1) * 2 ;              // get previous non-deleted index
              pt1x  =  arNewPt[n] ;         // and the x and
              pt1y  =  arNewPt[n +1] ;      // y pos.

              for (ix = 0; ix < iConsec; ix++)
              {
                 if (ix > 0)
                   i++ ;
                 n = i * 2 ;

                 arNewPt[n++] =  pt1x ;
                 arNewPt[n]   =  pt1y ;
              }
           }
        }                                      //---------------------------//
        else                                   // must be an internal entry //
        {                                      //---------------------------//

           if (n === DvtDCUtils.INSERT)        // is it an insert
           {                                   // yes, fill-in its initial position

              //  Get the (x,y) coords of the points on either side of this
              //  group (in their initial display positions) and place the
              //  insert initial positions proportionately on the line joining them.

              //  Have a group of inserts that are not all on the right hand end

              ix = (i -1) * 2 ;              // get previous entry of any type
      
              pt1x  =  arOldPt[ix++] ;
              pt1y  =  arOldPt[ix] ;

              ix    = (i + iConsec) * 2 ;
      
              pt2x  =  arOldPt[ix++] ;
              pt2y  =  arOldPt[ix] ;

              xInc  = (pt2x - pt1x) / (iConsec + 1) ;
              yInc  = (pt2y - pt1y) / (iConsec + 1) ;    // (note can be -ve)

              for (ix = 0; ix < iConsec; ix++)
              {
                 if (ix > 0)
                   i++ ;
                 n = i * 2 ;        // get index into old tween points array

                 pt1x += xInc ;
                 pt1y += yInc ;

                 arOldPt[n++] =  pt1x ;
                 arOldPt[n]   =  pt1y ;
              }
           }
           else                              // its a delete
           {                                 // yes, fill-in its final position

              //  Have a group of deletes that are not all on the right hand end

              //  Get the (x,y) coords of the points on either side of this
              //  group (in their final display positions) and place the
              //  deleted initial positions proportionately on the line joing them.

              ix = (i -1) * 2 ;              // get previous entry of any type

              pt1x  =  arNewPt[ix++] ;
              pt1y  =  arNewPt[ix] ;

              ix    = (i + iConsec) * 2 ;

              pt2x  =  arNewPt[ix++] ;
              pt2y  =  arNewPt[ix] ;

              xInc  = (pt2x - pt1x) / (iConsec + 1) ;
              yInc  = (pt2y - pt1y) / (iConsec + 1) ;      // (note can be -ve)

              for (ix = 0; ix < iConsec; ix++)
              {
                 if (ix > 0)
                   i++ ;
                 n = i * 2 ;        // get index into old tween points array

                 pt1x += xInc ;
                 pt1y += yInc ;

                 arNewPt[n++] =  pt1x ;
                 arNewPt[n]   =  pt1y ;
              }
           }
        }
      }      // end loop over arPointType for inserts/deletes


      //  Finally, if this is an area chart or a combo area series, need to 
      //  add the polygon's closing coords to the  starting and ending points.

      var chartType = newChart.getType() ;
      if(this._peer.getSeriesType() === 'area') {
        ixOldPts = aptsOld.length - 4 ;
        ixNewPts = aptsNew.length - 4 ;
        arOldPt.push(aptsOld[ixOldPts]) ;
        arOldPt.push(aptsOld[++ixOldPts]) ;
        arOldPt.push(aptsOld[++ixOldPts]) ;
        arOldPt.push(aptsOld[++ixOldPts]) ;
        arNewPt.push(aptsNew[ixNewPts]) ;
        arNewPt.push(aptsNew[++ixNewPts]) ;
        arNewPt.push(aptsNew[++ixNewPts]) ;
        arNewPt.push(aptsNew[++ixNewPts]) ;
      }

      //  Start and end array generation complete.

      startState  = arOldPt;           // the starting points for animation
      if (arDeletes.length > 0) {      // if there are deletes, save the original end
        this._finalState = endState;   // state so we can reset points after animating.
      }
      endState  = arNewPt;             // the ending points for animation


   } //end if have inserts/deletes


   //  Final processing

   this._setAnimationParams(startState);    // initialize the start state

   //  Create the animator

   var nodePlayable = new DvtCustomAnimation(this._shape.getContext(), this, this._duration);
   nodePlayable.getAnimator().addProp(DvtAnimator.TYPE_NUMBER_ARRAY, this,
                                      this._getAnimationParams, this._setAnimationParams, endState);
   
   // Post-processing for clean-up of redundant deleted vertices and
   // update direction indicators.

   nodePlayable.setOnEnd(this._onEndAnimation, this);

   handler.add(nodePlayable, 0);            // create the playable
};



/**
 * Function to be added on end of animation to reset the area's points
 */
DvtDCLineArea.prototype._onEndAnimation = function(){

   if (this._finalState) {                     // if deletes
     this._shape.setPoints(this._finalState);  // remove redundant delete vertices.
   }
   else {
     if (this._arPointers !== null){
        var arPointers = this._arPointers;
        var len  = arPointers.length ;
        var plot = this._peer.getChart().getPlotArea() ;
        var ptr ;
        for (var i = 0; i < len; i++){
           ptr = arPointers[i] ;
           if (ptr) {
             plot.removeChild(ptr);
           }
        }
        this._arPointers   = null;
        this._arDirections = null ;
     }
   }
};

/*--------------------------------------------------------------------*/
/*  animateInsert()      override of DvtDCAbstract.animateInsert()    */
/*--------------------------------------------------------------------*/
/**
 * Creates the insert animation for this Line or Area.
 * @param {DvtDataAnimationHandler} handler The animation handler, which can be used to chain animations.
 * @return {DvtPlayable} The animation to perform for this insert.
 */
DvtDCLineArea.prototype.animateInsert = function(handler)
{
   var nodePlayable = new DvtAnimFadeIn(this._shape.getContext(), this._shape, this._duration);
 
   handler.add(nodePlayable, 0);
};


/*--------------------------------------------------------------------*/
/*  animateDelete()       override of DvtDCAbstract.animateDelete()   */
/*--------------------------------------------------------------------*/
/**
 * Creates the delete animation for this Line or Area
 * @param {DvtDataAnimationHandler} handler The animation handler, which can be used to
 *                                          chain animations.
 * @param {DvtContainer} delContainer   The container to which the deleted objects should
 *                                      be moved for animation.
 * @returns {DvtPlayable} The animation to perform for this delete.
 */
DvtDCLineArea.prototype.animateDelete = function(handler, delContainer)
{
   delContainer.addChild(this._shape);   // Move from the old chart to the delete
                                         // container on top of the new chart.

   var nodePlayable = new DvtAnimFadeOut(this._shape.getContext(), this._shape, this._duration);
   handler.add(nodePlayable, 0);
};



/*--------------------------------------------------------------------*/
/*  _getAnimationParams()                                             */
/*--------------------------------------------------------------------*/
/**
  *   Returns the geometry of the Area.
  *   @returns {Array} an array containing the points of the Area
  */
DvtDCLineArea.prototype._getAnimationParams = function()
{
   return this._shape.getPoints();
};



/*---------------------------------------------------------------------*/
/*  Init()                override of DvtDCAbstract.Init()             */
/*---------------------------------------------------------------------*/
/**
  *  Object initializer.
  */
DvtDCLineArea.prototype.Init = function(peer, duration)
{
  DvtDCLineArea.superclass.Init.call(this, peer, duration) ;
  
  //  We ignore the group for a polyline, only interested in seeing if the
  //  series matches. All changes to a line are considered to be an update.

  this._animId = peer.getSeries();
} ;


/*---------------------------------------------------------------------*/
/*   _makeDirPointer                                                   */
/*---------------------------------------------------------------------*/

DvtDCLineArea.prototype._makeDirPointer = function(xPos, yPos, oldChart, oldSIdx, oldGIdx,
                                                   newChart, newSIdx, newGIdx, iPT)
{
    var dirptr = null;              // return value

    var bDown  = false;
    var iDirection ;
    var fc ;
    iDirection = DvtDCUtils.getDirection(oldChart, oldSIdx, oldGIdx, newChart,
                                         newSIdx, newGIdx) ;
    if (iDirection !== DvtDCUtils.DIR_NOCHANGE) {
      bDown = (iDirection == DvtDCUtils.DIR_DOWN);
      
      fc = bDown?  DvtChartStyleUtils.getAnimationDownColor(newChart) :
                   DvtChartStyleUtils.getAnimationUpColor(newChart) ;

      var  stroke = this._shape.getStroke() ;
      var  lw = stroke ? stroke.getWidth() : 5 ;

      //  Create a direction pointer object
      dirptr = DvtDCUtils.drawDirectionPointer(bDown, xPos, yPos, lw, fc, this._shape.getContext(), false);
      newChart.getPlotArea().addChild(dirptr);
    }

    this._arPointers[iPT]  = dirptr ;
    this._arDirection[iPT] = bDown;
};


/*--------------------------------------------------------------------*/
/*  _setAnimationParams()                                             */
/*--------------------------------------------------------------------*/
/**
  *   Updates the geometry of the Area.
  *   @param {Array} ar  an array containing the Area's points.
  */
DvtDCLineArea.prototype._setAnimationParams = function(ar)
{
    this._shape.setPoints(ar);

    if (this._arPointers !== null) {
                                        // move pointer and keep in the front.
      var ptr ;
      var offset ;
      var plotArea = this._peer.getChart().getPlotArea() ;
      var len = this._arPointers.length ;

      for (var i = 0; i < len; i++) {
         ptr = this._arPointers[i] ;
         if (ptr) {
           plotArea.removeChild(ptr) ;
           offset = this._arDirection ? 12 : -12 ;
           ptr.setTranslateY(ar[i*2 +1] + offset);
           plotArea.addChild(ptr) ;
         }
      } 
    }
};

// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*--------------------------------------------------------------------*/
/*   DvtDCMarker           Data change Handler for Markers            */
/*--------------------------------------------------------------------*/

/**
  *  Data change Handler for markers.
  *  @extends DvtDCAbstract
  *  @class DvtDCMarker  Data change Handler for markers.
  *  @constructor  
  *  @param {DvtChartObjPeer} peer  The chart object peer for the shape to be animated.
  *  @param {Number} duration  The animation duration is seconds.
  *  <p>
  *  @returns {DvtDCMarker} A new DvtDCMarker object.
  */
var  DvtDCMarker = function(peer, duration)
{
   this.Init(peer, duration) ;
};

DvtObj.createSubclass(DvtDCMarker, DvtDCAbstract, "DvtDCMarker");



/*--------------------------------------------------------------------*/
/*  animateUpdate()                                                   */
/*--------------------------------------------------------------------*/
/**
 * Creates the update animation for this marker.
 * @param {DvtDataAnimationHandler} handler The animation handler, which can be
 *                                          used to chain animations.
 * @param {DvtDCMarker} oldDC The old node state to animate from.
 */
DvtDCMarker.prototype.animateUpdate = function(handler, oldDC)
{
   var oldObj = oldDC._shape;
   var newObj = this._shape;

   // Transform to the old state and animate to the new one
   var endMatrix = newObj.getMatrix().clone();
   var startMatrix = new DvtMatrix(this._context);
   startMatrix.translate(-newObj.getX(), -newObj.getY());
   startMatrix.scale(oldObj.getWidth()/newObj.getWidth(), oldObj.getHeight()/newObj.getHeight());
   startMatrix.translate(oldObj.getX(), oldObj.getY());
   
   // If the text's geometry has changed, animate the change.

   if (endMatrix.equals(startMatrix)) {        // if the geometry has not
     return ;                                  // changed, nothing to animate.
   }

   // Create the animator for this node

   var nodePlayable = new DvtCustomAnimation(this._shape.getContext(), this, this._duration);

   this._shape.setMatrix(startMatrix);    // initialize the start state

   nodePlayable.getAnimator().addProp(DvtAnimator.TYPE_MATRIX, this._shape,
                                      this._shape.getMatrix, this._shape.setMatrix, endMatrix);
                                     
   //  If animation indicators required, and the value changed, add visual effect to marker.

   if (this.isValueChange(oldDC) && (DvtChartStyleUtils.getAnimationIndicators(this._peer.getChart()) !== 'none')) {

     // Create the color changing effect when the marker moves

     var overlay   = oldDC._shape ;
     var chartType = oldDC._peer.getChart().getType() ;
     var fill, fc, fa ;

     if (chartType === 'scatter') {
       fc = "#FFFF2B" ;                     // brighter yellow for smaller objects
       fa = 0.7 ;
     }
     else {
       fc = "#D5D500" ;                     // dimmer yellow and alpha for bigger
       fa = 0.4 ;                           // objects for a less intrusive effect.
     }
     fill   = new DvtSolidFill(fc, fa);
     var alpha  = this._shape.getAlpha() ;  // end marker alpha
     this._shape.setAlpha(0);               // set initial marker to 0

     overlay.setFill(fill);  
     this._peer.getChart().getPlotArea().addChild(overlay);
     
     // Move the overlay
     var overlayEndMatrix = new DvtMatrix(this._context);
     overlayEndMatrix.translate(-oldObj.getX(), -oldObj.getY());
     overlayEndMatrix.scale(newObj.getWidth()/oldObj.getWidth(), newObj.getHeight()/oldObj.getHeight());
     overlayEndMatrix.translate(newObj.getX(), newObj.getY());

     //  Fade in new obj
     nodePlayable.getAnimator().addProp(DvtAnimator.TYPE_NUMBER, this._shape,
                                        this._shape.getAlpha, this._shape.setAlpha, alpha);
     //  move overlay (old object)
     nodePlayable.getAnimator().addProp(DvtAnimator.TYPE_MATRIX, overlay,
                                        overlay.getMatrix, overlay.setMatrix, overlayEndMatrix);
     //  fade out overlay
     nodePlayable.getAnimator().addProp(DvtAnimator.TYPE_NUMBER, overlay,
                                        overlay.getAlpha,  overlay.setAlpha, 0);

     this._overlay = overlay ;
     nodePlayable.setOnEnd(this._onEndAnimation, this) ;   // to remove overlay at the end
   }

   handler.add(nodePlayable, 0);
   
};

/*--------------------------------------------------------------------*/
/*  animateInsert()                                                   */
/*--------------------------------------------------------------------*/
/**
 * Creates the insert animation for this marker.
 * @param {DvtDataAnimationHandler} handler The animation handler, which
 *                                          can be used to chain animations.
 * @return {DvtPlayable} The animation to perform for this insert.
 */
DvtDCMarker.prototype.animateInsert = function(handler)
{
   var nodePlayable = new DvtAnimFadeIn(this._shape.getContext(), this._shape, this._duration);
   
   handler.add(nodePlayable, 0);
};


/*--------------------------------------------------------------------*/
/*  animateDelete()                                                   */
/*--------------------------------------------------------------------*/
/**
 * Creates the delete animation for this marker.
 * @param {DvtDataAnimationHandler} handler The animation handler, which can be used to
 *                                          chain animations.
 * @param {DvtContainer} delContainer   The container to which the deleted objects should
 *                                      be moved for animation.
 * @returns {DvtPlayable} The animation to perform for this delete.
 */
DvtDCMarker.prototype.animateDelete = function(handler, delContainer)
{
   delContainer.addChild(this._shape);   // Move from the old chart to the delete
                                         // container on top of the new chart.

   var nodePlayable = new DvtAnimFadeOut(this._shape.getContext(), this._shape, this._duration);
   
   handler.add(nodePlayable, 0);
};



/*--------------------------------------------------------------------*/
/*  isValueChange()                                                   */
/*--------------------------------------------------------------------*/
/**
 * Check if there is data change.
 * @param {DvtDCMarker} oldDC    The old node state to animate from.
 * @returns {boolean}  true if node data has changed.
 */
DvtDCMarker.prototype.isValueChange = function(oldDC)
{
  var bRet = false ;

  if (oldDC) {

    var oldSIdx  = oldDC._peer.getSeriesIndex();
    var oldGIdx  = oldDC._peer.getGroupIndex();
    var newSIdx  = this._peer.getSeriesIndex();
    var newGIdx  = this._peer.getGroupIndex();
    var oldData  = oldDC._oldChart.getData() ;
    var newData  = this._peer.getChart().getData() ;

    var oldX  = oldData.series[oldSIdx].data[oldGIdx].x ;
    var oldY  = oldData.series[oldSIdx].data[oldGIdx].y ;
    var oldZ  = oldData.series[oldSIdx].data[oldGIdx].z ;
    var newX  = newData.series[newSIdx].data[newGIdx].x ;
    var newY  = newData.series[newSIdx].data[newGIdx].y ;
    var newZ  = newData.series[newSIdx].data[newGIdx].z ;

    bRet = ((newX !== oldX) || (newY !== oldY) || (newZ !== oldZ)) ;
  }

  return bRet;
};


/**
  *     Remove update animation overlay 
  */

DvtDCMarker.prototype._onEndAnimation = function()
{
    if (this._overlay) {
      this._peer.getChart().getPlotArea().removeChild(this._overlay);
      this._overlay = null ;
    }
};


// Copyright (c) 2008, 2013, Oracle and/or its affiliates. 
// All rights reserved. 
/*---------------------------------------------------------------------*/
/*  DvtDCUtils()                                                       */
/*---------------------------------------------------------------------*/

// Utilities for AMX Graph data change animations

/**
  *   @constructor
  */
var DvtDCUtils = new Object;

DvtObj.createSubclass(DvtDCUtils, DvtObj, "DvtDCUtils");

DvtDCUtils.DIR_UP       = 0;     // pointer directions
DvtDCUtils.DIR_DOWN     = 1;
DvtDCUtils.DIR_NOCHANGE = 2 ;

DvtDCUtils.UPDATE = 0 ;          // vertex
DvtDCUtils.DELETE = 1 ;          // action
DvtDCUtils.INSERT = 2 ;          // types


/**
 * Returns the direction of data change for use with animation indicators
 * @param {Object} oldChart
 * @param {number} oldSIdx old series index.
 * @param {number} oldGIdx old group index. 
 * @param {DvtChartImpl} new chart.
 * @param {number} newSIdx new series index
 * @param {number} newGIdx new group index
 */
DvtDCUtils.getDirection = function(oldChart, oldSIdx, oldGIdx, newChart, newSIdx, newGIdx)
{
   var oldValue = DvtChartDataUtils.getValue(oldChart, oldSIdx, oldGIdx);
   var newValue = DvtChartDataUtils.getValue(newChart, newSIdx, newGIdx);

   return  (newValue > oldValue)?  DvtDCUtils.DIR_UP :
                        ((newValue < oldValue)? DvtDCUtils.DIR_DOWN : DvtDCUtils.DIR_NOCHANGE);
};

/**
  *   Creates a DvtPath object that draws the triangle shape used for animation indicators
  *   @param  {boolean}  bDown  the direction the vertex away from the base of the triangle.
  *   @param  {number}   xPos  the x position of the middle of the base of the triangle.
  *   @param  {number}   yPos  the y position of the middle of the base of the triangle.
  *   @param  {number}   offset
  *   @param  {string}   fc    the fill color/alpha of the pointer.
  *   @returns {DvtContext} context the chart's context.
  */
DvtDCUtils.drawDirectionPointer = function(bDown, xPos, yPos, offset, fc, context, isHoriz)
{
  var ptrCmds;

  if(!isHoriz) { // Vertical
    if (bDown) {
      ptrCmds = DvtPathUtils.moveTo(-5, 0) +
                DvtPathUtils.lineTo(5, 0)  +
                DvtPathUtils.lineTo(0, 7)  +
                DvtPathUtils.lineTo(-5, 0);
    }
    else {
      ptrCmds = DvtPathUtils.moveTo(-5, 0) + 
                DvtPathUtils.lineTo(5, 0)  +
                DvtPathUtils.lineTo(0, -7) +
                DvtPathUtils.lineTo(-5, 0);
    }
  }
  else { // Horizontal
    var bLeft = DvtStyleUtils.isLocaleR2L() ? !bDown : bDown;
    if (bLeft) {
      ptrCmds = DvtPathUtils.moveTo(2, -5) +
                DvtPathUtils.lineTo(2, 5)  +
                DvtPathUtils.lineTo(-5, 0) +
                DvtPathUtils.lineTo(2, -5);
    }
    else {
      ptrCmds = DvtPathUtils.moveTo(-5, -5) +
                DvtPathUtils.lineTo(-5, 5)  +
                DvtPathUtils.lineTo(2, 0) +
                DvtPathUtils.lineTo(-5, -5);
    }
  }
 
  ptrCmds += DvtPathUtils.closePath();
    
  var ptr   = new DvtPath(context, ptrCmds);
  var fill  = new DvtSolidFill(fc);
  ptr.setFill(fill);

  var ptrOffset = offset + 12;
  yPos += (bDown? ptrOffset : (-ptrOffset)) ;

  ptr.setTranslateX(xPos);
  ptr.setTranslateY(yPos);
  return ptr ;
};


/**
  *  Helper function for determining which groups were inserted into the
  *  new chart, or deleted from the old chart, or exist in both charts
  *  (potential updates).
  *  @param {Array} oldList  array of groups in the old chart
  *  @param {Array} newList  array of groups in the new chart
  *  @returns {Array} an array of arrays.  array[0] is an array of updated
  *                   objects, ar[1] is an array of inserted objects, and
  *                   ar[2] is an array of deleted objects.
  */
DvtDCUtils.compareGroups = function(oldList, newList)
{
  var updates = [];       // )  return
  var inserts = [];       // )  values
  var deletes = [];       // )
  var oldLen  = oldList.length ; 

  newList = newList.slice(0);      // Copy the new objects list, since we will modify it

  if (oldList) {
    for (var oldIndex = 0; oldIndex < oldLen; oldIndex++) {
       var oldItem = oldList[oldIndex];
    
       // Loop through the new list looking for a match
       var bMatchFound = false;
       for (var newIndex = 0; newIndex < newList.length; newIndex++) {
          var newItem = newList[newIndex];
      
          if (oldItem === newItem) {
            // Match found, remove the item from the new list since it's handled
            newList.splice(newIndex, 1);
            bMatchFound = true;
            updates.push(oldItem);
            break;
          }
       }
    
      // If no match found, it was a delete.
      if (! bMatchFound) {
        deletes.push(oldItem);
      }
    }
  }

  // All remaining objects in newList are inserts

  for (var i = 0; i < newList.length; i++) {
     if (newList[i])                        // must be valid object for insert
       inserts.push(newList[i]);
  }
    
  return [updates, inserts, deletes];
};
// Copyright (c) 2008, 2013, Oracle and/or its affiliates. 
// All rights reserved. 

/**
 * Chart component.  This chart should never be instantiated directly.  Use the
 * newInstance function instead.
 * @class
 * @constructor
 * @extends {DvtContainer}
 * @export
 */
var DvtChart = function() {}

DvtObj.createSubclass(DvtChart, DvtContainer, "DvtChart");

/**
 * Returns a new instance of DvtChart.
 * @param {DvtContext} context The rendering context.
 * @param {string} callback The function that should be called to dispatch component events.
 * @param {object} callbackObj The optional object instance on which the callback function is defined.
 * @param {object} options The object containing options specifications for this component.
 * @return {DvtChart}
 * @export
 */
DvtChart.newInstance = function(context, callback, callbackObj, options) {
  return new DvtChartImpl(context, callback, callbackObj, options);
}

/**
 * Initializes the component.
 * @param {DvtContext} context The rendering context.
 * @param {string} callback The function that should be called to dispatch component events.
 * @param {object} callbackObj The optional object instance on which the callback function is defined.
 * @param {object} options The object containing options specifications for this component.
 * @protected
 */
DvtChart.prototype.Init = function(context, callback, callbackObj, options) {
  DvtChart.superclass.Init.call(this, context);
  this._callback = callback;
  this._callbackObj = callbackObj;
  
  // Create the resource bundle
  // TODO pass in the locale
  this.Bundle = new DvtChartBundle();
  
  // Create the event handler and add event listeners
  this.EventHandler = new DvtChartEventManager(this);
  this.EventHandler.addListeners(this);
  
  // Apply the options specifications
  this.setOptions(options);
  
  // Make sure the object has an id for clipRect naming
  this.setId("chart" + 1000 + Math.floor(Math.random()*10000));
    
  // Filters unsupported, so initialize alternative selection effects
  if(!context.getDocumentUtils().isFilterSupported()) {
    DvtSelectionEffectUtils.DEFAULT_SEL_TYPE        = DvtSelectionEffectUtils.SEL_TYPE_STROKE_NO_FILTERS;
  }
      
  /** 
   * Reference to animation in progress.
   * @private 
   */
  this._animation = null;
}

/**
 * Specifies the non-data options for this component.
 * @param {object} options The object containing options specifications for this component.
 * @export
 */
DvtChart.prototype.setOptions = function(options) {
  // Combine the user options with the defaults and store
  this.Options = DvtChartDefaults.calcOptions(options);
  
  if (DvtChartEventUtils.getRolloverBehavior(this) == "dim")
    this.EventHandler.setSeriesRolloverHandler(new DvtChartSeriesRolloverHandler(this, this.EventHandler));
  else
    this.EventHandler.setSeriesRolloverHandler(null);

  // Disable animation for canvas and xml
  if (this.getContext() instanceof DvtXmlContext || this.getContext() instanceof DvtCanvasContext) {
    this.Options['chart']['animationOnDisplay']    = 'none' ;  
    this.Options['chart']['animationOnDataChange'] = 'none' ;  
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
DvtChart.prototype.render = function(data, width, height) 
{  
  //  If datachange animation, save chart info before rendering for later use.
  var animationOnDataChange = DvtChartStyleUtils.getAnimationOnDataChange(this);
  var oldChart              = null;

  if (this.Data && animationOnDataChange !== 'none') {
    oldChart  = {'type':  this.getType(),
                 'data':  this.Data, 
                 'peers': this.getObjects().slice(0),
                 'getData': function() {return this.data;},
                 'pieChart': this.pieChart};
    this.clearObjects() ;        // clear the charts list of registered peers.
                                 // (the container is still attached at this point).
  }

  // Update if new data has been provided. Clone to avoid modifying the provided object.
  if(data) {
    this.Data = DvtJSONUtils.clone(data);
    
    // Process the data to add bulletproofing
    DvtChartDataUtils.processDataObject(this);
  }
  else if(this.Data) {
    // New data was not provided.  Update the data object so that the current selection is not lost.
    var selection = DvtChartDataUtils.getCurrentSelection(this);
    this.Data['selection'] = selection;
  }
  
  // Update the width and height if provided
  if(!isNaN(width) && !isNaN(height)) {
    this.Width = width;
    this.Height = height;
  }
  
  if (DvtAgent.getAgent().isTouchDevice()) {
     this.EventHandler.setTouchRegionBounds(new DvtRectangle(0,0,parseInt(width),parseInt(height)));
  }
  
  // Create a new container and render the component into it
  var container = new DvtContainer(this.getContext());
  this.addChild(container);
  DvtChartRenderer.render(this, container, new DvtRectangle(0, 0, this.Width, this.Height));
  
  // Animation Support
  // Stop any animation in progress
  if(this._animation) {
    this._animationStopped = true;  // TODO Rename
    this._animation.stop();
  }
  
  // Construct the new animation playable
  var animationOnDisplay      = DvtChartStyleUtils.getAnimationOnDisplay(this);
  var animationDuration       = DvtChartStyleUtils.getAnimationDuration(this);
  var bounds                  = new DvtRectangle(0, 0, this.Width, this.Height);
  var bBlackBoxUpdate         = false; // true if this is a black box update animation

  if (! this._container) {
     if (animationOnDisplay !== "none") {
       // AnimationOnDisplay
       this._animation = DvtBlackBoxAnimationHandler.getInAnimation(this.getContext(), animationOnDisplay, container,
                                                                  bounds, animationDuration); 
       if (! this._animation) {
         this._animation = DvtAnimOnDisplay.createAnimation(this, animationOnDisplay, animationDuration) ;
       }
     }
  }
  else if (animationOnDataChange != "none" && data) {
    // AnimationOnDataChange
    this._animation = DvtBlackBoxAnimationHandler.getCombinedAnimation(this.getContext(), animationOnDataChange, this._container, 
                                                                       container, bounds, animationDuration);   
    if (this._animation)           // Black Box Animation
      bBlackBoxUpdate = true;
    else {
      this._delContainer = new DvtContainer(this.getContext(), 'DelTainer') ;
      this._animation    = DvtAnimOnDC.createAnimation(oldChart, this, animationOnDataChange,
                                                       animationDuration, this._delContainer) ;
      if (this._delContainer.getNumChildren() > 0) {
        this.getPlotArea().addChild(this._delContainer);
      }
    }
  }
  
  // If an animation was created, play it
  if(this._animation) {  
    this._animation.play();  
    this._animation.setOnEnd(this._onAnimationEnd, this);
  }
  
  // Clean up the old container.  If doing black box animation, store a pointer and clean
  // up after animation is complete.  Otherwise, remove immediately.
  if(bBlackBoxUpdate) {
    this._oldContainer = this._container;
  }
  else if(this._container) { 
    this.removeChild(this._container);  // Not black box animation, so clean up the old contents
  }
  
  // Update the pointer to the new container
  this._container = container;
  
  // Data cursor
  if (this.__isDataCursorEnabled()) {
       if (this._dcContainer) {
           this.removeChild(this._dcContainer);
       }

       var bHoriz = DvtChartTypeUtils.isHorizontal(this);
       if (bHoriz) {
           this._dataCursor = new DvtDataCursorHorizontal(this.getContext());
       } else {
           this._dataCursor = new DvtDataCursorVertical(this.getContext());
       }

       switch (this.Options['chart']['dataCursorBehavior']) {
           case 'auto':
               this._dataCursor.setBehavior(DvtDataCursor.BEHAVIOR_AUTO);
               break;
           case 'snap':
               this._dataCursor.setBehavior(DvtDataCursor.BEHAVIOR_SNAP);
               break;
           case 'smooth':
               this._dataCursor.setBehavior(DvtDataCursor.BEHAVIOR_SMOOTH);
               break;
           default:
               break;
       }

       if (this._dataCursor.getBehavior() == DvtDataCursor.BEHAVIOR_AUTO) {
           var lineOrArea = DvtChartTypeUtils.isLine(this) || DvtChartTypeUtils.isArea(this);
           if (lineOrArea) {
               this._dataCursor.setBehavior(DvtDataCursor.BEHAVIOR_SMOOTH);
           } else {
               this._dataCursor.setBehavior(DvtDataCursor.BEHAVIOR_SNAP);
           }
       }
       this._dataCursor.setDataCursorBounds(new DvtRectangle(0,0,parseInt(width),parseInt(height)));
       var dcContainer = new DvtContainer(this.getContext(), "dccont");
       this._dcContainer = dcContainer;
       dcContainer.addChild(this._dataCursor);
       this.addChild(this._dcContainer);
       
       this.EventHandler.setDataCursorHandler(new DvtChartDCEH(this));
       // If a legend is present
       if (this.legend) {
           this.EventHandler.setSeriesFocusHandler(this.legend._eventHandler.SeriesFocusHandler);
           if (this._currentSeriesCategory)
               DvtChartSeriesFocusHandler.HighlightSeries(this, this.legend, null, this._currentSeriesCategory);
       }
   }
   
  // Queue a render with the context
  this.getContext().queueRender();
}

DvtChart.prototype.__isDataCursorEnabled = function() {

  if (DvtChartTypeUtils.isPie(this))
    return false;

  if (this.Options['chart']['dataCursor'] === 'on') {
    return true;
  }
  else if (this.Options['chart']['dataCursor'] === 'auto') {
    if (DvtAgent.getAgent().isTouchDevice() && (DvtChartTypeUtils.isLine(this) || DvtChartTypeUtils.isArea(this))) {
      // don't enable the data cursor if selection is enabled in the auto case
      if (this.Options['chart']['dataSelection'] === 'none') {
        return true;
      }
    }
  }
  return false;
}

/**
 * Dispatches the event to the callback function.
 * @param {object} event The event to be dispatched.
 */
DvtChart.prototype.__dispatchEvent = function(event) {
  DvtEventDispatcher.dispatchEvent(this._callback, this._callbackObj, this, event);
};

/**
 * Hook for cleaning up animation behavior at the end of the animation.
 * @private
 */
DvtChart.prototype._onAnimationEnd = function() {
  // Clean up the old container used by black box updates
  if(this._oldContainer) {
    this.removeChild(this._oldContainer);
    this._oldContainer = null;
  }

  if (this._delContainer && this._delContainer.getNumChildren() > 0) {
    this.getPlotArea().removeChild(this._delContainer) ;
  }
  this._delContainer = null ;

  
  // Reset the animation flag and reference
  this._animationStopped = false;
  this._animation = null;
  
  // TODO: have animation animate to the correct opacity
  if (this._currentSeriesCategory)
      DvtChartSeriesFocusHandler.HighlightSeries(this, this.legend, null, this._currentSeriesCategory);
}
/**
 * Implementation of DvtChart.  This chart defines the internal APIs of DvtChart that are
 * needed for rendering and interactivity.
 * @param {DvtContext} context The rendering context.
 * @param {string} callback The function that should be called to dispatch component events.
 * @param {object} callbackObj The optional object instance on which the callback function is defined.
 * @param {object} options The object containing options specifications for this component.
 * @class
 * @constructor
 * @extends {DvtChart}
 */
var DvtChartImpl = function(context, callback, callbackObj, options) {
  this.Init(context, callback, callbackObj, options);
}

DvtObj.createSubclass(DvtChartImpl, DvtChart, "DvtChartImpl");

/**
 * @override
 */
DvtChartImpl.prototype.Init = function(context, callback, callbackObj, options) {
  DvtChartImpl.superclass.Init.call(this, context, callback, callbackObj, options);
  
  /**
   * The legend of the chart.  This will be set during render time.
   * @type {DvtLegend}
   */
  this.legend = null;
  /**
   * The x axis of the chart.  This will be set during render time.
   * @type {DvtChartAxis}
   */
  this.xAxis = null;
  /**
   * The y axis of the chart.  This will be set during render time.
   * @type {DvtChartAxis}
   */
  this.yAxis = null;
  /**
   * The y2 axis of the chart.  This will be set during render time for dual-y graphs.
   * @type {DvtChartAxis}
   */
  this.y2Axis = null;
  /**
   * The pie chart subcomponent.  This will be set during render time for pie graphs.
   * @type {DvtPieChart}
   */
  this.pieChart = null;
  /** 
   * The array of logical objects for this chart.
   * @private 
   */
  this._peers = [];
  
  /** @private */
  this._seriesStyleArray = [];
  
  // Support for changing z-order for selection
  this._numFrontObjs = 0;
  this._numSelectedObjsInFront = 0;
}

/**
 * @override
 */
DvtChartImpl.prototype.setOptions = function(options) {
  DvtChartImpl.superclass.setOptions.call(this, options);

  // Initialize the selection handler
  var selectionMode = this.Options['chart']['dataSelection'];
  if(selectionMode == "single")
    this._selectionHandler = new DvtSelectionHandler(DvtSelectionHandler.TYPE_SINGLE);
  else if(selectionMode == "multiple")
    this._selectionHandler = new DvtSelectionHandler(DvtSelectionHandler.TYPE_MULTIPLE);
  else
    this._selectionHandler = null;
    
  // Pass to event handler
  this.EventHandler.setSelectionHandler(this._selectionHandler);
}

/**
 * Returns the DvtEventManager for this component.
 * @return {DvtEventManager}
 */
DvtChartImpl.prototype.getEventManager = function() {
  return this.EventHandler;
}

/**
 * Processes the specified event.
 * @param {object} event
 * @param {object} source The component that is the source of the event, if available.
 */
DvtChartImpl.prototype.processEvent = function(event, source) {
  var type = event.getType();
  if(type == DvtHideShowCategoryEvent.TYPE_HIDE || type == DvtHideShowCategoryEvent.TYPE_SHOW) { 
    if(DvtChartEventUtils.getHideAndShowBehavior(this) != "none") {
      // Update the component state
      var visibility = (type == DvtHideShowCategoryEvent.TYPE_HIDE ? "hidden" : "visible");
      DvtChartEventUtils.setVisibility(this, event.getCategory(), visibility);
    
      // Rerender the component
      this.render(null, this.Width, this.Height);
      return;
    }
  }
  else if(type == DvtCategoryRolloverEvent.TYPE_OVER || type == DvtCategoryRolloverEvent.TYPE_OUT) {
    if(DvtChartEventUtils.getRolloverBehavior(this) == "dim") {
      DvtCategoryRolloverHandler.processEvent(event, this.getObjects());
      this._distributeToChildren(event, source); 
    }
  }
  else if (type == DvtSelectionEvent.TYPE) {
    var selection = event.getSelection();
    var actualSelection = [];
    for (var i = 0; i < selection.length; i++) {
      var item = selection[i];
      if (item.getSeries() == DvtPieChartUtils.OTHER_SLICE_SERIES_ID) {
        // Get the slice ids of the slices that are grouped into "other" slice
        otherItems = DvtPieChartUtils.getOtherSliceIds(this);
        actualSelection = actualSelection.concat(otherItems);
      } else {
        actualSelection.push(item);
      }
    }
    event = new DvtSelectionEvent(actualSelection);
  }
  
  // Dispatch the event to the callback
  this.__dispatchEvent(event);
};

/**
 * Distributes the specified event to this chart's children.
 * @param {object} event
 * @param {object} source The component that is the source of the event, if available.
 */
DvtChartImpl.prototype._distributeToChildren = function(event, source) {
  if(this.legend && this.legend != source) 
    this.legend.processEvent(event, source);
    
  if(this.pieChart && this.pieChart != source)
    this.pieChart.processEvent(event, source);
}

/**
 * Clears the chart;s registered object peer list.
 */
DvtChartImpl.prototype.clearObjects = function() {
  this._peers.length = 0 ;
};

/**
 * Registers the object peer with the chart.  The peer must be registered to participate
 * in interactivity.
 * @param {DvtChartObjPeer} peer
 */
DvtChartImpl.prototype.registerObject = function(peer) {
  this._peers.push(peer);
}

/**
 * Returns the peers for all objects within the chart.
 * @return {array}
 */
DvtChartImpl.prototype.getObjects = function() {
  return this._peers;
}

/**
 * Returns the data object for this chart.
 * @return {object}
 */
DvtChartImpl.prototype.getData = function() {
  return this.Data ? this.Data : {};
}

/**
 * Returns the options object for this chart.
 * @return {object}
 */
DvtChartImpl.prototype.getOptions = function() {
  return this.Options;
}

/**
 * Returns the resource bundle for this chart.
 * @return {DvtChartBundle}
 */
DvtChartImpl.prototype.getBundle = function() {
  return this.Bundle;
}

/**
 * Returns the array containing unique series ids.  This array is used
 * to maintain default styles for each unique series.
 * @return {array}
 */
DvtChartImpl.prototype.getSeriesStyleArray = function() {
  return this._seriesStyleArray;
}

/**
 * Returns the plot area container.
 * @returns {DvtContainer}  the plot area container.
 */
DvtChartImpl.prototype.getPlotArea = function() {
  return this._plotArea ;
};

/**
 * Sets the plot area container.
 * @param {DvtContainer} plot  the plot area container.
 */
DvtChartImpl.prototype.setPlotArea = function(plot) {
  this._plotArea = plot
};

/**
 * Returns the type of this chart, such as "bar" or "scatter".
 * @return {string}
 */
DvtChartImpl.prototype.getType = function() {
  return this.Options['chart']['type'];
}

/**
 * Returns the scale factor for gaps on this chart.
 * @return {number}
 */
DvtChartImpl.prototype.getGapRatio = function() {
  // If defined in the options, use that instead
  if(this.Options['layout']['gapRatio'] !== null && !isNaN(this.Options['layout']['gapRatio']))
    return this.Options['layout']['gapRatio'];
  else {
    var wRatio = Math.min(this.Width/400, 1);
    var hRatio = Math.min(this.Height/300, 1);
    return Math.min(wRatio, hRatio);
  }
}

/**
 * Returns the selection handler for the graph.
 * @return {DvtSelectionHandler} The selection handler for the graph
 */
DvtChartImpl.prototype.getSelectionHandler = function() {
  return this._selectionHandler;
}

/**
  *  Returns whether selecton is supported on the graph.
  *  @return {boolean} True if selection is turned on for the graph and false otherwise.
  */
DvtChartImpl.prototype.isSelectionSupported = function() {
   return (this._selectionHandler ? true : false);
}

//---------------------------------------------------------------------//
// Ordering Support: ZOrderManager impl                                //
//---------------------------------------------------------------------//

/**
 * @override
 */
DvtChartImpl.prototype.bringToFrontOfSelection = function(detObj)
{
  var par = detObj.getParent();
  if (par) {
    var parentChildCount = par.getNumChildren();

    if (parentChildCount - this._numFrontObjs > 1) {
      par.removeChild(detObj);
      var newIndex = parentChildCount - this._numFrontObjs - 1;
      par.addChildAt(detObj, newIndex);
    }
  }
  
  //if the object is not both selected and selecting then
  //increment the counter (otherwise the object is already
  //represented in the counter)
  if (!detObj.isSelected() || !detObj.isHoverEffectShown())
    this._numSelectedObjsInFront++;

};

/**
 * @override
 */
DvtChartImpl.prototype.pushToBackOfSelection = function(detObj)
{
  //decrement the counter
  if (this._numSelectedObjsInFront > 0)
    this._numSelectedObjsInFront--;
  
  //move the object to the first z-index before the selected objects
  var par = detObj.getParent();
  if (par) {
    var parentChildCount = par.getNumChildren();
    var newIndex = parentChildCount - this._numFrontObjs - 1 - this._numSelectedObjsInFront;
    if (newIndex >= 0) {
      par.removeChild(detObj);
      par.addChildAt(detObj, newIndex);
    }
  }
};

/**
 * @override
 */
DvtChartImpl.prototype.setNumFrontObjs = function(num)
{
  this._numFrontObjs = num;
};

/**
 * Axis component for use by DvtChart.  This class exposes additional functions needed for 
 * rendering grid lines and data items.
 * @param {DvtContext} context The rendering context.
 * @param {string} callback The function that should be called to dispatch component events.
 * @param {object} callbackObj The optional object instance on which the callback function is defined.
 * @param {object} options The object containing options specifications for this component.
 * @class
 * @constructor
 * @extends {DvtAxis}
 */
var DvtChartAxis = function(context, callback, callbackObj, options) {
  this.Init(context, callback, callbackObj, options);
}

DvtObj.createSubclass(DvtChartAxis, DvtAxis, "DvtChartAxis");

/**
 * Returns the options settings for the axis.
 * @return {object} The options for the axis.
 */
DvtChartAxis.prototype.getOptions = function() {
  return this.Info.Options;
}

/**
 * Returns the value for the specified coordinate along the axis.  Returns null
 * if the coordinate is not within the axis.
 * @param {number} coord The coordinate along the axis.
 * @return {object} The value at that coordinate.
 */
DvtChartAxis.prototype.getValueAt = function(coord) {
  return this.Info ? this.Info.getValueAt(value) : null;
}

/**
 * Returns the coordinate for the specified value.
 * @param {object} value The value to locate.
 * @return {number} The coordinate for the value.
 */
DvtChartAxis.prototype.getCoordAt = function(value) {
  return this.Info ? this.Info.getCoordAt(value) : null;
}

/**
 * Returns the value for the specified coordinate along the axis.  If a coordinate
 * is not within the axis, returns the value of the closest coordinate within the axis.
 * @param {number} coord The coordinate along the axis.
 * @return {object} The value at that coordinate.
 */
DvtChartAxis.prototype.getBoundedValueAt = function(coord) {
  return this.Info ? this.Info.getBoundedValueAt(value) : null;
}

/**
 * Returns the coordinate for the specified value.  If a value is not within the axis,
 * returns the coordinate of the closest value within the axis.
 * @param {object} value The value to locate.
 * @return {number} The coordinate for the value.
 */
DvtChartAxis.prototype.getBoundedCoordAt = function(value) {
  return this.Info ? this.Info.getBoundedCoordAt(value) : null;
}

/**
 * Returns the coordinate for the specified value.
 * @param {object} value The value to locate.
 * @return {number} The coordinate for the value.
 */
DvtChartAxis.prototype.getUnboundedCoordAt = function(value) {
  return this.Info ? this.Info.getUnboundedCoordAt(value) : null;
}

/**
 * Returns the baseline coordinate for the axis, if applicable.
 * @return {number} The baseline coordinate for the axis.
 */
DvtChartAxis.prototype.getBaselineCoord = function() {
  return this.Info ? this.Info.getBaselineCoord() : null;
}

/**
 * Returns the position of the axis relative to the chart.
 * @return {string} The position of the axis.
 */
DvtChartAxis.prototype.getPosition = function() {
  return this.Options.position;
}

/**
 * Returns true if this is a group axis.
 * @return {boolean}
 */
DvtChartAxis.prototype.isGroupAxis = function() {
  return this.Info instanceof DvtGroupAxisInfo;
}

/**
 * Returns true if this is a time axis.
 * @return {boolean}
 */
DvtChartAxis.prototype.isTimeAxis = function() {
  return this.Info instanceof DvtTimeAxisInfo;
}

/**
 * Returns the width of a group of bars in an axis. The supported axis are time axis and group axis. 
 * @return {number} The width of a single group for an axis.  Returns
 *                  0 for unsupported axes.
 */
DvtChartAxis.prototype.getGroupWidth = function() {
  if(this.isGroupAxis()) {
  
    return Math.abs(this.getCoordAt(1) - this.getCoordAt(0));
  
  } else if (this.isTimeAxis()) {
  
    return this.Info.getGroupWidth();
  
  } else { // not a supported axis
    return 0;
  }
}

/**
 * Returns the axis line for this axis.
 * @param {DvtContext} context
 * @return {DvtLine} The axis line.
 */
DvtChartAxis.prototype.getAxisLine = function(context) {
  return this.Info ? this.Info.getAxisLine(context) : null;
}

/**
 * Returns an array containing the grid lines for this axis.  Objects
 * are returned in the desired z-order.
 * @param {DvtContext} context
 * @return {Array} The Array of DvtLine objects.
 */
DvtChartAxis.prototype.getGridLines = function(context) {
  return this.Info ? this.Info.getGridLines(context) : [];
}

/**
 * Returns the number of major tick counts for the axis.
 * @return {number} The number of major tick counts.
 */
DvtChartAxis.prototype.getMajorTickCount = function() {
   return this.Info ? this.Info.getMajorTickCount() : null;
}

/**
 * Sets the number of major tick counts for the axis.
 * @param {number} count The number of major tick counts.
 */
DvtChartAxis.prototype.setMajorTickCount = function(count) {
   if (this.Info)
    this.Info.setMajorTickCount(count);
}

/**
 * Returns the number of minor tick counts for the axis.
 * @return {number} The number of minor tick counts.
 */
DvtChartAxis.prototype.getMinorTickCount = function() {
   return this.Info ? this.Info.getMinorTickCount() : null;
}

/**
 * Sets the number of minor tick counts for the axis.
 * @param {number} count The number of minor tick counts.
 */
DvtChartAxis.prototype.setMinorTickCount = function(count) {
   if (this.Info)
    this.Info.setMinorTickCount(count);
}

/**
 * Returns the major increment for the axis.
 * @return {number} The major increment.
 */
DvtChartAxis.prototype.getMajorIncrement = function() {
  return this.Info ? this.Info.getMajorIncrement() : null;
}

/**
 * Returns the minor increment for the axis.
 * @return {number} The minor increment.
 */
DvtChartAxis.prototype.getMinorIncrement = function() {
  return this.Info ? this.Info.getMinorIncrement() : null;
}
/**
 * Resource bundle for DvtChart.
 * @class
 * @constructor
 * @extends {DvtBundle}
 */
var DvtChartBundle = function() {}

DvtObj.createSubclass(DvtChartBundle, DvtBundle, "DvtChartBundle");

DvtChartBundle.EMPTY_TEXT = "No data to display";

DvtChartBundle.DEFAULT_GROUP_NAME = "Group {0}";

DvtChartBundle.LABEL_SERIES = "Series: {0}";
DvtChartBundle.LABEL_GROUP = "Group: {0}";
DvtChartBundle.LABEL_VALUE = "Value: {0}";
DvtChartBundle.LABEL_X = "X: {0}";
DvtChartBundle.LABEL_Y = "Y: {0}";
DvtChartBundle.LABEL_Z = "Z: {0}";
DvtChartBundle.LABEL_LOW = "Low: {0}";
DvtChartBundle.LABEL_HIGH = "High: {0}";

DvtChartBundle.LABEL_OTHER = "Other";

DvtChartBundle.prototype.SCALING_SUFFIX_THOUSAND = "K";
DvtChartBundle.prototype.SCALING_SUFFIX_MILLION = "M";
DvtChartBundle.prototype.SCALING_SUFFIX_BILLION = "B";
DvtChartBundle.prototype.SCALING_SUFFIX_TRILLION = "T";
DvtChartBundle.prototype.SCALING_SUFFIX_QUADRILLION = "Q";
// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/*--------------------------------------------------------------------------*/
/*  Abstract base event handler for graph (traditional and AMX)  */
/*--------------------------------------------------------------------------*/
var  DvtGraphEventHandler = function()
{
};

DvtObj.createSubclass(DvtGraphEventHandler, DvtEventManager, "DvtGraphEventHandler");

DvtGraphEventHandler.prototype.Init = function(context, callback, callbackObj) {
   DvtGraphEventHandler.superclass.Init.call(this, context, callback, callbackObj);
   
   this.SeriesRolloverHandler = null;
   this.HideShowSeriesHandler = null;
   this.DataCursorHandler = null;
   this.GraphPanHandler = null;
   this.GraphKeyboardHandler = null;
   this.SeriesFocusHandler = null;
}

DvtGraphEventHandler.prototype.setSeriesRolloverHandler = function(handler) {
  this.SeriesRolloverHandler = handler;
}

DvtGraphEventHandler.prototype.setHideShowSeriesHandler = function(handler) {
  this.HideShowSeriesHandler = handler;
}

DvtGraphEventHandler.prototype.setDataCursorHandler = function(handler) {
  this.DataCursorHandler = handler;
}

DvtGraphEventHandler.prototype.setGraphPanHandler = function(handler) {
  this.GraphPanHandler = handler;
}

DvtGraphEventHandler.prototype.setSeriesFocusHandler = function(handler) {
  this.SeriesFocusHandler = handler;
}

/**
 * Sets the graph keyboard handler that this DvtMEH dispatches keyboard events to
 * 
 * @param {DvtGraphKeyboardHandler} handler
 */
DvtGraphEventHandler.prototype.setGraphKeyboardHandler = function(handler) {
  this.GraphKeyboardHandler = handler;
}

DvtGraphEventHandler.prototype.HandleTouchHoverStartInternal = function(event) {
    var touch = event.touch;
    var targetObj = event.targetObj;
    var touchX = touch.pageX;
    var touchY = touch.pageY;
    var pos = this._context.getRelativePosition(touchX, touchY);
    var dlo = this.GetLogicalObject(targetObj);
    var touchId = touch.identifier;

    if (this.DataCursorHandler) {
        var cursorShown = this.DataCursorHandler.processMove(touchX, touchY, targetObj, dlo);                         
    }
    this.TouchManager.setTooltipEnabled(touchId, this.IsTooltipShowable(dlo, pos));
    
    if(this.SeriesRolloverHandler) 
      this.SeriesRolloverHandler.processMouseOver(dlo);

    this.HandleTouchHoverStartGraphInternal(event);
    return false;
}

DvtGraphEventHandler.prototype.HandleTouchHoverStartGraphInternal = function(event) {
}

DvtGraphEventHandler.prototype.HandleTouchHoverMoveInternal = function(event) {
    var touch = event.touch;
    var targetObj = event.targetObj;
    var touchX = touch.pageX;
    var touchY = touch.pageY
    var pos = this._context.getRelativePosition(touchX, touchY);
    var dlo = this.GetLogicalObject(targetObj);
    var touchId = touch.identifier;

    if (this.DataCursorHandler) {
        var cursorShown = this.DataCursorHandler.processMove(touchX, touchY, targetObj);                    
    }
    this.TouchManager.setTooltipEnabled(touchId, this.IsTooltipShowable(dlo, pos));

    this.HandleTouchHoverMoveGraphInternal(event);

    return false;
}

DvtGraphEventHandler.prototype.HandleTouchHoverMoveGraphInternal = function(event) {
}

DvtGraphEventHandler.prototype.HandleTouchHoverEndInternal = function(event) {
    var touch = event.touch;
    var targetObj = event.targetObj;     
    var dlo = this.GetLogicalObject(targetObj);
    
    if (this.DataCursorHandler) {
         this.DataCursorHandler.processEnd();  
    }

    var hideShowPopupHandled = this._processHideShowPopup(dlo);
    if (hideShowPopupHandled) {
        var info = this.TouchManager.getTouchInfo(touch.identifier);
        if (info)
            info.fireClick = false;
    }
    
    if(this.SeriesRolloverHandler) 
      this.SeriesRolloverHandler.processMouseOut(dlo);    
    
    this.HandleTouchHoverEndGraphInternal(event);
} 

DvtGraphEventHandler.prototype.HandleTouchHoverEndGraphInternal = function(event) {
}

DvtGraphEventHandler.prototype.HandleTouchHoverOverInternal = function(event) {
    var targetObj = event.targetObj;     
    var dlo = this.GetLogicalObject(targetObj);
    
    if(this.SeriesRolloverHandler) {
      this.SeriesRolloverHandler.processMouseOver(dlo);

      if (this.IsMagnifyLensEnabled()) {
          if (dlo) {
              var magLens = this.GetMagnifyLens();
              var categories = dlo.getCategories();
              if(categories[0] !== null) {
                magLens.setDirty(true);
              }
          }
      }
    }
    this.HandleTouchHoverOverGraphInternal(event);
}

DvtGraphEventHandler.prototype.HandleTouchHoverOverGraphInternal = function(event) {
}

DvtGraphEventHandler.prototype.HandleTouchHoverOutInternal = function(event) {
    var targetObj = event.targetObj;     
    var dlo = this.GetLogicalObject(targetObj);
    
    if(this.SeriesRolloverHandler) 
      this.SeriesRolloverHandler.processMouseOut(dlo);

    this.HandleTouchHoverOutGraphInternal(event);
}

DvtGraphEventHandler.prototype.HandleTouchHoverOutGraphInternal = function(event) {
}

DvtGraphEventHandler.prototype.HandleTouchClickInternal = function(evt) {
    var touch = evt.touch;
    var pos = this._context.getRelativePosition(touch.pageX, touch.pageY);
    var targetObj = evt.targetObj;
    var touchEvent = evt.touchEvent;

    var dlo = this.GetLogicalObject(targetObj);
    if (this.SeriesFocusHandler)
        this.SeriesFocusHandler.processSeriesFocus(pos, dlo);
    var done = this.HandleTouchClickGraphInternal(evt);
    return done;
}

DvtGraphEventHandler.prototype.HandleTouchClickGraphInternal = function(event) {
}

/** @private */
DvtGraphEventHandler.prototype._processHideShowPopup = function(dlo) {
    return false;
}

/*
 * Subclasses override
 */
DvtGraphEventHandler.prototype.IsMagnifyLensEnabled = function()
{
    return false;
}
/**
 * Event Manager for DvtChart.
 * @param {DvtChartImpl} chart
 * @class
 * @extends DvtEventManager
 * @constructor
 */
var DvtChartEventManager = function(chart) {
  this.Init(chart.getContext(), chart.processEvent, chart);
  this._chart = chart;
};

DvtObj.createSubclass(DvtChartEventManager, DvtGraphEventHandler, "DvtChartEventManager");

DvtChartEventManager.prototype.OnMouseMove = function(event) {
  DvtChartEventManager.superclass.OnMouseMove.call(this, event);

  if (this.DataCursorHandler) {
     this.DataCursorHandler.processMove(event.pageX, event.pageY, event.target);
  }    
}

DvtChartEventManager.prototype.OnMouseOut = function(event) {
  DvtChartEventManager.superclass.OnMouseOut.call(this, event);
  if (this.DataCursorHandler)
    this.DataCursorHandler.processOut(pos);
}

/**
 * @override
 */
DvtChartEventManager.prototype.OnMouseOver = function(event) {
  DvtChartEventManager.superclass.OnMouseOver.call(this, event);
  
  var obj = this.GetLogicalObject(event.target);
  if(!obj)
    return;
  if(this.SeriesRolloverHandler) 
    this.SeriesRolloverHandler.processMouseOver(obj);
}

/**
 * @override
 */
DvtChartEventManager.prototype.OnMouseOut = function(event) {
  DvtChartEventManager.superclass.OnMouseOut.call(this, event);
  
  var obj = this.GetLogicalObject(event.target);
  if(!obj)
    return;
  if(this.SeriesRolloverHandler) 
    this.SeriesRolloverHandler.processMouseOut(obj);
}

/**
 * @override
 */
DvtChartEventManager.prototype.OnClickInternal = function(event) {
  var obj = this.GetLogicalObject(event.target);
  var pos = this._context.getRelativePosition(event.pageX, event.pageY);
  if (this.SeriesFocusHandler)
      this.SeriesFocusHandler.processSeriesFocus(pos, obj);
      
  // Action Support
  if(obj && obj.getAction()) 
    this.FireEvent(new DvtActionEvent(DvtActionEvent.SUBTYPE_ACTION, obj.getAction(), obj.getId()));
}

/**
 * @override
 */
DvtChartEventManager.prototype.HandleTouchClickInternal = function(evt) {
  DvtChartEventManager.superclass.HandleTouchClickInternal.call(this, evt);
    
  // Action Support
  var obj = this.GetLogicalObject(evt.targetObj);
  if(obj && obj.getAction()) 
    this.FireEvent(new DvtActionEvent(DvtActionEvent.SUBTYPE_ACTION, obj.getAction(), obj.getId()));
}

DvtChartEventManager.prototype.IsTooltipShowableInternal = function(obj, pos) {
    if (this.DataCursorHandler) {
        return !this.DataCursorHandler.isDataCursorShown();
    } 
    return true;
}
/**
 *  Series rollover event handler performs rollover effects on the object's
 *  behalf.
 *  @param {DvtGraphCore}  the owning chart object.
 *  @class  DvtSeriesRolloverHandler
 *  @constructor
 */
var DvtSeriesRolloverHandler = function (chart) {
  this.Init(chart)
};

DvtObj.createSubclass(DvtSeriesRolloverHandler, DvtObj, "DvtSeriesRolloverHandler");

DvtSeriesRolloverHandler.prototype.Init = function () {
};

/**
 * Processes a mouse over event on the specified object.
 * @param {object} obj The logical object.
 */
DvtSeriesRolloverHandler.prototype.processMouseOver = function(obj) {
  this.ProcessEvent(obj, true);
}

/**
 * Processes a mouse out event on the specified object.
 * @param {object} obj The logical object.
 */
DvtSeriesRolloverHandler.prototype.processMouseOut = function(obj) {
  this.ProcessEvent(obj, false);
}

/*
 * Subclasses override
 */
DvtSeriesRolloverHandler.prototype.ProcessEvent = function(obj, bOver) {
}
/**
 * @constructor
 */
var DvtChartSeriesRolloverHandler = function (chart, handler) {
  this.Init(chart, handler)
};

DvtObj.createSubclass(DvtChartSeriesRolloverHandler, DvtSeriesRolloverHandler, "DvtChartSeriesRolloverHandler");

DvtChartSeriesRolloverHandler.prototype.Init = function (chart, handler) {
  DvtChartSeriesRolloverHandler.superclass.Init.call(this);
  this._chart = chart;
  // TODO: don't need to pass in handler
  this.EventHandler = handler;
  this._bDim = DvtChartEventUtils.getRolloverBehavior(this._chart) == "dim";
};

/**
 * @param {object} obj The logical object.
 * @param {boolean} bOver True if this is a rollOver.
 * @private
 */
DvtChartSeriesRolloverHandler.prototype.ProcessEvent = function (obj, bOver) {
  this._rolloverHandled = false;

  if (!obj)
    return;

  var chart = this._chart;
  var focusSeries = chart._currentSeriesCategory;
  if (focusSeries != null) {
    return;
  }
  var rolloverContainer = this.getRolloverContainer();
  if (bOver) {
    var categories = obj.getCategories ? obj.getCategories() : null;
    if (categories && categories.length > 0) {
      this.EventHandler.FireEvent(new DvtCategoryRolloverEvent(DvtCategoryRolloverEvent.TYPE_OVER, categories[0]), rolloverContainer);
      this._rolloverHandled = true;
    }
  }
  else {
    var categories = obj.getCategories ? obj.getCategories() : null;
    if (categories && categories.length > 0) {
      this.EventHandler.FireEvent(new DvtCategoryRolloverEvent(DvtCategoryRolloverEvent.TYPE_OUT, categories[0]), rolloverContainer);
      this._rolloverHandled = true;
    }
  }
}

DvtChartSeriesRolloverHandler.prototype.isRolloverHandled = function () {
  return this._rolloverHandled;
}

DvtChartSeriesRolloverHandler.prototype.getRolloverContainer = function () {
  return this._chart;
}

/**
 * @constructor
 * For the legend in the chart
 */
var DvtLegendSeriesRolloverHandler = function (chart, handler, legend) {
  this.Init(chart, handler, legend)
};

DvtObj.createSubclass(DvtLegendSeriesRolloverHandler, DvtChartSeriesRolloverHandler, "DvtLegendSeriesRolloverHandler");

DvtLegendSeriesRolloverHandler.prototype.Init = function (chart, handler, legend) {
  this._chart = chart;
  this._legend = legend;
  // TODO: don't need to pass in handler
  this.EventHandler = handler;
  this._bDim = this._legend.__getOptions().rolloverBehavior == "dim";
};

DvtLegendSeriesRolloverHandler.prototype.getRolloverContainer = function () {
  return this._legend;
}
/**
 * @constructor
 * Abstract series focus handler
 */
var DvtSeriesFocusHandler = function() {
    this.Init();
};

DvtObj.createSubclass(DvtSeriesFocusHandler, DvtObj, "DvtSeriesFocusHandler");

DvtSeriesFocusHandler.prototype.Init = function() {
  this._seriesFocusHandled = false;
}

DvtSeriesFocusHandler.prototype.processSeriesFocus = function(pos, obj) {
  this._seriesFocusHandled = false;
  if (this.isSeriesFocusable(obj)) {
      var seriesCategory = this.getSeriesCategory(obj);
      this._renderSeriesFocus(seriesCategory);
      this._seriesFocusHandled = true;
  } else {
      var currentSeries = this.getCurrentSeriesCategory();
      if (currentSeries != null) {   
          if (this.isClearSeriesFocus(pos)) {
              this._renderSeriesFocus(null);
              this._seriesFocusHandled = true;
          }
      }
  }
}

DvtSeriesFocusHandler.prototype._renderSeriesFocus = function(seriesCategory) {
  var oldSeriesCategory = this.getCurrentSeriesCategory();
  if (oldSeriesCategory != seriesCategory) {   
      if (seriesCategory == null) {   
        var currentSeries = this.getCurrentSeriesCategory(); 
        this.SeriesFocusCleared(currentSeries);
        this.setCurrentSeriesCategory(null);
      } else {
        this.SeriesFocusChanged(oldSeriesCategory, seriesCategory);
        this.setCurrentSeriesCategory(seriesCategory);
      }
  }
}

DvtSeriesFocusHandler.prototype.SeriesFocusCleared = function(currentSeries) {
}

DvtSeriesFocusHandler.prototype.SeriesFocusChanged = function(oldSeries, newSeries) {
}

DvtSeriesFocusHandler.prototype.getSeriesCategory = function(obj) {

}

DvtSeriesFocusHandler.prototype.getCurrentSeriesCategory = function() {
}

DvtSeriesFocusHandler.prototype.setCurrentSeriesCategory = function(sidx) {
}

DvtSeriesFocusHandler.prototype.isClearSeriesFocus = function(pos) {
    return false;
}

DvtSeriesFocusHandler.prototype.isSeriesFocusHandled = function() {
    return this._seriesFocusHandled;
}

DvtSeriesFocusHandler.prototype.isSeriesFocusable = function(dlo) {
    return false;
}
/**
 * @constructor
 * Chart series focus handler
 */
var DvtChartSeriesFocusHandler = function(chart, legend) {
  this.Init(chart, legend);
};

DvtObj.createSubclass(DvtChartSeriesFocusHandler, DvtSeriesFocusHandler, "DvtChartSeriesFocusHandler");

DvtChartSeriesFocusHandler.prototype.Init = function(chart, legend) {
  DvtChartSeriesFocusHandler.superclass.Init.call(this);
  this._Chart = chart;
  this._legend = legend;
}

DvtChartSeriesFocusHandler.prototype.SeriesFocusCleared = function(currentSeries) {
    var chart = this._Chart;
    var eventOut = new DvtCategoryRolloverEvent(DvtCategoryRolloverEvent.TYPE_OUT, currentSeries);
    DvtCategoryRolloverHandler.processEvent(eventOut, chart.getObjects());
    var legend = this._legend;
    DvtCategoryRolloverHandler.processEvent(eventOut, legend.__getObjects());
}

DvtChartSeriesFocusHandler.prototype.SeriesFocusChanged = function(oldSeriesCategory, newSeriesCategory) {
    var chart = this._Chart;
    var legend = this._legend;
    DvtChartSeriesFocusHandler.HighlightSeries(chart, legend, oldSeriesCategory, newSeriesCategory);
}

DvtChartSeriesFocusHandler.HighlightSeries = function(chart, legend, oldSeriesCategory, newSeriesCategory) {
    if (oldSeriesCategory) {
        var eventOut = new DvtCategoryRolloverEvent(DvtCategoryRolloverEvent.TYPE_OUT, oldSeriesCategory);
        DvtCategoryRolloverHandler.processEvent(eventOut, chart.getObjects());
        DvtCategoryRolloverHandler.processEvent(eventOut, legend.__getObjects());
    }
        
    var eventOver = new DvtCategoryRolloverEvent(DvtCategoryRolloverEvent.TYPE_OVER, newSeriesCategory);
    DvtCategoryRolloverHandler.processEvent(eventOver, chart.getObjects());
    DvtCategoryRolloverHandler.processEvent(eventOver, legend.__getObjects());
}

DvtChartSeriesFocusHandler.prototype.isSeriesFocusable = function(obj) {
    var chart = this._Chart;
    if (obj && chart._dataCursor) {
        return true;
    }
    return false;
}

DvtChartSeriesFocusHandler.prototype.getSeriesCategory = function(obj) {
    var categories = obj.getCategories ? obj.getCategories() : null;
    var category = categories[0];
    return category;
}

DvtChartSeriesFocusHandler.prototype.getCurrentSeriesCategory = function() {
    var chart = this._Chart;
    return chart._currentSeriesCategory;
}

DvtChartSeriesFocusHandler.prototype.setCurrentSeriesCategory = function(category) {
    var chart = this._Chart;
    chart._currentSeriesCategory = category;
}

DvtChartSeriesFocusHandler.prototype.isClearSeriesFocus = function(pos) {
    var chart = this._Chart;
    if (chart.legend) {
        var legendBox = chart.legend.getDimensions();
        var stagePoint = chart.legend.localToStage(new DvtPoint(legendBox.x, legendBox.y));
        legendBox.x = stagePoint.x;
        legendBox.y = stagePoint.y;
        var plotRect = chart._plotRect;
        var plotBox = plotRect.getDimensions();
        stagePoint = plotRect.localToStage(new DvtPoint(plotBox.x, plotBox.y));
        plotBox.x = stagePoint.x;
        plotBox.y = stagePoint.y;
        return (!legendBox.containsPoint(pos.x, pos.y) && !plotBox.containsPoint(pos.x, pos.y));
    }
    return false;
}
// Copyright (c) 2008, 2012, Oracle and/or its affiliates. 
// All rights reserved. 

/**
 * Logical object for chart data object displayables.
 * @param {DvtChartImpl} chart The owning chart instance.
 * @param {array} displayables The array of associated DvtDisplayables.
 * @param {number} seriesIndex
 * @param {number} groupIndex
 * @class
 * @constructor
 * @implements {DvtTooltipSource}
 * @implements {DvtSelectable}
 * @implements {DvtLogicalObject}
 * @implements {DvtCategoricalObject}
 */
var DvtChartObjPeer = function(chart, displayables, seriesIndex, groupIndex) {
  this.Init(chart, displayables, seriesIndex, groupIndex);
}

DvtObj.createSubclass(DvtChartObjPeer, DvtObj, "DvtChartObjPeer");

/**
 * @param {DvtChartImpl} chart The owning chart instance.
 * @param {array} displayables The array of associated DvtDisplayables.
 * @param {number} seriesIndex
 * @param {number} groupIndex
 */
DvtChartObjPeer.prototype.Init = function(chart, displayables, seriesIndex, groupIndex) {
  this._chart = chart;
  this._displayables = displayables;
  this._series = null;
  this._group = null;
  
  // Set series to -1 if not specified
  if(!isNaN(seriesIndex))
    this._seriesIndex = seriesIndex;
  else
    this._seriesIndex = -1;
    
  // Cache the series id, which is used for interactivity
  if(this._seriesIndex >= 0)
    this._series = DvtChartDataUtils.getSeries(chart, this._seriesIndex);
    
  // Set group to -1 if not specified
  if(!isNaN(groupIndex))
    this._groupIndex = groupIndex;
  else
    this._groupIndex = -1;

  // Cache the group id, which is used for datachange animation.
  if (this._groupIndex >= 0)
    this._group = DvtChartDataUtils.getGroup(chart, this._groupIndex);
  
  // Create the array specifying all categories that this data item belongs to
  this._categories = (this._series != null) ? [this._series] : [];
  var dataItem = DvtChartDataUtils.getDataItem(chart, seriesIndex, groupIndex);
  if(dataItem) {
    if(dataItem['categories'])
      this._categories = this._categories.concat(dataItem['categories']);
    
    this._dataItemId = dataItem['id'];
    this._action = dataItem['action'];
  }
  
  this._isSelected = false;
}

/**
 * Creates a data item to identify the specified displayable and registers it with the chart.
 * @param {DvtDisplayable} displayable The displayable to associate.
 * @param {DvtChartImpl} chart The owning chart instance.
 * @param {number} seriesIndex
 * @param {number} groupIndex
 */
DvtChartObjPeer.associate = function(displayable, chart, seriesIndex, groupIndex) {
  if(!displayable)
    return;
    
  // Create the logical object. 
  var identObj = new DvtChartObjPeer(chart, [displayable], seriesIndex, groupIndex);
  
  // Register with the chart
  chart.registerObject(identObj);
    
  // Finally associate using the event manager  
  chart.getEventManager().associate(displayable, identObj);
};

DvtChartObjPeer.prototype.getId = function() {
  if (this._series != null && this._group != null)
    return new DvtChartDataItem(this._dataItemId, this._series, this._group);
  else 
    return null;
}

/**
 * Return the peer's data item id.  This is an optional id that is provided to simplifying
 * row key support for ADF and AMX.
 * @returns {string} the peer's row key.
 */
DvtChartObjPeer.prototype.getDataItemId = function()
{
  return this._dataItemId;
}

/**
 * Return the peer's series.
 * @returns {string} the peer's series.
 */
DvtChartObjPeer.prototype.getSeries = function()
{
  return this._series;
}

/**
 * Return the peer's series index.
 * @returns {Number} the peer's series index.
 */
DvtChartObjPeer.prototype.getSeriesIndex = function()
{
  return this._seriesIndex;
}

/**
 * Return the peer's group.
 * @returns {string} the peer's group.
 */
DvtChartObjPeer.prototype.getGroup = function()
{
  return this._group;
}

/**
 * Return the peer's group index.
 * @returns {Number} the peer's group index.
 */
DvtChartObjPeer.prototype.getGroupIndex = function()
{
  return this._groupIndex;
}

/**
 * Return the action string for the data item, if any exists.
 * @returns {string} the action outcome for the data item.
 */
DvtChartObjPeer.prototype.getAction = function()
{
  return this._action;
}

/**
 * Convenience function to return the peer's chart.
 * @returns {DvtChart} the associated chart object.
 */
DvtChartObjPeer.prototype.getChart = function()
{
  return this._chart;
}


/**
 * Return the peer's series type.
 * @returns {string} the peer's series type.
 */
DvtChartObjPeer.prototype.getSeriesType = function()
{
  return DvtChartStyleUtils.getSeriesType(this._chart, this._seriesIndex);
}


/**
 * Return the peer's series item.
 * @returns {object} the peer's series item.
 */
DvtChartObjPeer.prototype.getSeriesItem = function()
{
  return  DvtChartDataUtils.getSeriesItem(this._chart, this._seriesIndex);
}

//---------------------------------------------------------------------//
// Tooltip Support: DvtTooltipSource impl                              //
//---------------------------------------------------------------------//

/**
 * @override
 */
DvtChartObjPeer.prototype.getDatatip = function(target) {
  return DvtChartTooltipUtils.getDatatip(target, this._chart, this._seriesIndex, this._groupIndex);
};

/**
 * @override
 */
DvtChartObjPeer.prototype.getDatatipColor = function () {
  return DvtChartTooltipUtils.getDatatipColor(this._chart, this._seriesIndex, this._groupIndex);
};

//---------------------------------------------------------------------//
// Selection Support: DvtSelectable impl                               //
//---------------------------------------------------------------------//

/**
 * @override
 */ 
DvtChartObjPeer.prototype.isSelectable = function() {
  return this.getChart().isSelectionSupported() && this.getId();
};

/**
 * @override
 */ 
DvtChartObjPeer.prototype.isSelected = function() {
  return this._isSelected;
};

/**
 * @override
 */ 
DvtChartObjPeer.prototype.setSelected = function(bSelected) { 
  this._isSelected = bSelected;
  for (var i = 0; i < this._displayables.length; i++) {
    if (this._displayables[i].setSelected)
      this._displayables[i].setSelected(bSelected);
  }
};

/**
 * @override
 */ 
DvtChartObjPeer.prototype.showHoverEffect = function() {
  for (var i = 0; i < this._displayables.length; i++) {
    if (this._displayables[i].showHoverEffect)
      this._displayables[i].showHoverEffect();
  }
};

/**
 * @override
 */ 
DvtChartObjPeer.prototype.hideHoverEffect = function() {
  for (var i = 0; i < this._displayables.length; i++) {
    if (this._displayables[i].hideHoverEffect)
      this._displayables[i].hideHoverEffect();
  }
};

//---------------------------------------------------------------------//
// Rollover and Hide/Show Support: DvtLogicalObject impl               //
//---------------------------------------------------------------------//

/**
 * @override
 */
DvtChartObjPeer.prototype.getDisplayables = function () { // TODO Implement
  return this._displayables;
}

//---------------------------------------------------------------------//
// Rollover and Hide/Show Support: DvtCategoricalObject impl           //
//---------------------------------------------------------------------//

/**
 * @override
 */
DvtChartObjPeer.prototype.getCategories = function (category) {
  return this._categories;
};

/**
  * Creates an object representing the ID of a chart data item.
  * @constructor  
  * @param {string} id The ID for the data item, if available.
  * @param {string} series The series ID for the chart data item.
  * @param {string} group The group ID for the chart data item.
  */
var DvtChartDataItem = function(id, series, group) {
  this.Init(id, series, group);
}

DvtObj.createSubclass(DvtChartDataItem, DvtObj, "DvtChartDataItem");

/**
 * Initializes the component.
 * @param {string} id The ID for the data item, if available.
 * @param {string} series The series ID.
 * @param {string} group The group ID.
 * @protected
 */
DvtChartDataItem.prototype.Init = function(id, series, group) {
  this._id = id;
  this._series = series;
  this._group = group;
}

/**
 * Returns the ID for the data item, if available.
 * @return {string} The data item ID.
 */
DvtChartDataItem.prototype.getId = function() {
  return this._id;
}

/**
 * Returns the series ID for a chart data item.
 * @return {string} The series ID.
 */
DvtChartDataItem.prototype.getSeries = function() {
  return this._series;
}

/**
 * Returns the group ID for a chart data item.
 * @return {string} The group ID.
 */
DvtChartDataItem.prototype.getGroup = function() {
  return this._group;
}

/**
 * Determines if two DvtChartDataItem objects are equal.
 *
 * @param {DvtChartDataItem} The data item that will be used to test for equality.
 * @return {boolean} True if the two DvtChartDataItem objects are equal
 */
DvtChartDataItem.prototype.equals = function(dataItem) {
  // Note that the id is not compared, because the series and group ids are considered the primary identifiers.
  if(dataItem)
    return this._group === dataItem.getGroup() && this._series === dataItem.getSeries();
  else
    return false;
}

/**
 * Default values and utility functions for chart versioning.
 * @class
 */
var DvtChartDefaults = new Object();

DvtObj.createSubclass(DvtChartDefaults, DvtObj, "DvtChartDefaults");

/**
 * Defaults for version 1.
 */ 
DvtChartDefaults.VERSION_1 = {
  'chart': {
    'type': "bar", 'stack': "off", 'backgroundColor': null, 'emptyText': null, 
    'dataSelection': "none", 'hideAndShowBehavior': "none", 'rolloverBehavior': "none", 'sorting': "off",
    'otherThreshold': 0, 'animationOnDataChange': "none", 'animationOnDisplay': "none", 'timeAxisType': "disabled",
    '__sparkBarSpacing': 'subpixel', '__spark': false, 'dataCursor': "auto", 'dataCursorBehavior': "auto"
  },
  
  'title': {'style': "font-size: 12px; color: #003d5b; font-weight: bold", 'hAlign': "start"},
  'subtitle': {'style': "font-size: 12px; color: #003d5b;"},
  'footnote': {'style': "font-size: 10px; color: #333333;", 'hAlign': "start"},
  'titleSeparator': { 'upperColor': "#74779A", 'lowerColor': "#FFFFFF", 'rendered': false},
  
  'xAxis': {
    'minValue': null, 'maxValue': null, 'majorIncrement': null, 'minorIncrement': null,
    'scaledFromBaseline': "on",
    'timeRangeMode': "explicit",
    'layout': {'gapRatio': 1.0}
  },
  'yAxis': {
    'minValue': null, 'maxValue': null, 'majorIncrement': null, 'minorIncrement': null,
    'scaledFromBaseline': "on",
    'layout': {'gapRatio': 1.0}
  },
  'y2Axis': {
    'minValue': null, 'maxValue': null, 'majorIncrement': null, 'minorIncrement': null,
    'scaledFromBaseline': "on",
    'layout': {'gapRatio': 1.0},
    'alignTickMarks': true
  },
  
  'plotArea': {'backgroundColor': null},
  
  'legend': {
    'position': "auto",
    'rendered': true,
    'layout': {'gapRatio': 1.0}
  },
  
  'styleDefaults': {
    'colors': ["#003366", "#CC3300", "#666699", "#006666", "#FF9900", "#993366", 
               "#99CC33", "#624390", "#669933", "#FFCC33", "#006699", "#EBEA79"],
    'shapes': ["square", "circle", "diamond", "plus", "triangleDown", "triangleUp"],
    'seriesEffect': "gradient", 'threeDEffect': "off", 'borderColor': null, 
    'groupTooltipType': "auto", 'seriesTooltipType': "auto", 'valueTooltipType': "auto",
    'animationDuration': 1000, 'animationIndicators': "all", 
    'animationUpColor': "#0099FF", 'animationDownColor': "#FF3300",
    'lineWidth': 3, 'lineStyle': "solid",
    'markerDisplayed': false, 
    'markerColor': null, 'markerShape': "auto", 'markerSize': 8,
    'pieFeelerColor': "#BAC5D6", 
    'pieLabelStyle': "font-size: 11px; color: #003d5b; font-weight: bold",
    'sliceLabel': {
      'position': "outside", 
      'style': "font-size: 11px; color: #333333;", 
      'textType': "percent"},
    'otherColor': "#4b4b4b"
  },
  
  'layout': {
    'gapRatio': null, // gapRatio is dynamic based on the component size
    // TODO, the following are internal and should be moved to a _layout object
    'outerGapWidth': 10, 'outerGapHeight': 8,
    'titleSubtitleGapWidth': 14, 
    'titleSeparatorGap': 6, 'titlePlotAreaGap': 10, 'footnoteGap': 7,
    'legendMaxSize': 0.3, 'legendGap': 10,
    'axisMaxSize': 0.33, 'tickLabelGapHeight': 5, 'tickLabelGapWidth': 7
  },
  
  '__layout': {
      'maxBarWidth': 0.5, // Maximum width of a bar, as a fraction of the group width
      'barGroupGap': 0.25  // Gap between groups of bars, as a fraction of the group width
  }
};

/**
 * Combines the user options with the defaults for the specified version.  Returns the
 * combined options object.  This object will contain internal attribute values and
 * should be accessed in internal code only.
 * @param {object} userOptions The object containing options specifications for this component.
 * @return {object} The combined options object.
 */
DvtChartDefaults.calcOptions = function(userOptions) {
  var defaults = DvtChartDefaults._getDefaults(userOptions);

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
DvtChartDefaults._getDefaults = function(userOptions) {
  // Note: Version checking will eventually get added here
  // Note: Future defaults objects are deltas on top of previous objects
  return DvtJSONUtils.clone(DvtChartDefaults.VERSION_1);
}

/**
 * Scales down gap sizes based on the size of the component.
 * @param {DvtChartImpl} chart The chart that is being rendered.
 * @param {Number} defaultSize The default gap size.
 * @return {Number} 
 */
DvtChartDefaults.getGapSize = function(chart, defaultSize) {
  return Math.ceil(defaultSize * chart.getGapRatio());
}
/**
 * Axis related utility functions for DvtChartImpl.
 * @class
 */
var DvtChartAxisUtils = new Object();

DvtObj.createSubclass(DvtChartAxisUtils, DvtObj, "DvtChartAxisUtils");

/** @private */
DvtChartAxisUtils._BAR_AXIS_OFFSET = 0.5;

/**
 * Returns the min and max values from the data.
 * @param {DvtChartImpl} chart
 * @param {string} type The type of value to find: "x", "y", "y2", "z"
 * @return {object} An object containing the minValue and the maxValue.
 */
DvtChartAxisUtils.getMinMaxValue = function(chart, type) {
  // TODO date support
  // TODO support for null or NaN values
  // TODO move this to ChartDataUtils

  // Y2 values pull from the y data value
  var isY2Value = (type == "y2");
  if(isY2Value)
    type = "y";
  
  // Y values may be listed directly as numbers
  var isYValue = (type == "y");
  
  // Include hidden series if hideAndShowBehavior occurs without rescale
  var bIncludeHiddenSeries = (DvtChartEventUtils.getHideAndShowBehavior(chart) == "withoutRescale");
  
  var isBubble = chart.getType() === "bubble";

  var maxValue = Number.NEGATIVE_INFINITY;
  var minValue = Number.POSITIVE_INFINITY;
  var data = chart.getData();
  var seriesCount = DvtChartDataUtils.getSeriesCount(chart);
  for(var seriesIndex=0; seriesIndex<seriesCount; seriesIndex++) {
    var seriesItem = DvtChartDataUtils.getSeriesItem(chart, seriesIndex);
    
    // Skip the series if it is hidden
    if(!bIncludeHiddenSeries && !DvtChartStyleUtils.isSeriesRendered(chart, seriesIndex))
      continue;
    
    // Skip the series if it's not assigned to the right y axis
    var isY2Series = seriesItem['assignedToY2'] ? true : false;
    if(isY2Value != isY2Series)
      continue;
    
    // Loop through the data
    var seriesData = seriesItem.data;
    if(seriesData) {
      for(var groupIndex=0; groupIndex<seriesData.length; groupIndex++) {
        // Skip the data item if it is hidden
        if(!bIncludeHiddenSeries && !DvtChartStyleUtils.isDataItemRendered(chart, seriesIndex, groupIndex))
          continue;
      
        var value;
        if(isYValue)
          value = DvtChartDataUtils.getCumulativeValue(chart, seriesIndex, groupIndex, bIncludeHiddenSeries);
        else if(seriesData[groupIndex] !== null) {
          if (data.timeAxisType && data.timeAxisType == "enabled" && typeof seriesData[groupIndex].x == "undefined") {
            var timeAxisGroupLabel = DvtChartDataUtils.getGroupLabel(chart, groupIndex);
            if (!isNaN(timeAxisGroupLabel))
              seriesData[groupIndex].x = timeAxisGroupLabel;
          }
          value = seriesData[groupIndex][type];
        } 
        if(!isNaN(value)) {
          var radius = 0;
          if (isBubble && seriesData[groupIndex]['markerSize']) {
            if (isYValue)
              radius = seriesData[groupIndex]['_yAxisRadius'];
            else if (type == "x")
              radius = seriesData[groupIndex]['_xAxisRadius'];
          }
          maxValue = Math.max(maxValue, value + radius);
          minValue = Math.min(minValue, value - radius);
        }
      }
    }
  }
  
  return {'minValue': minValue, 'maxValue': maxValue};
}

/**
 * Returns the position of the x axis relative to the chart.
 * @param {DvtChartImpl} chart
 * @return {string} The axis position
 */
DvtChartAxisUtils.getXAxisPosition = function(chart) {
  if(DvtChartTypeUtils.isHorizontal(chart))
    return DvtStyleUtils.isLocaleR2L() ? "right" : "left";
  else
    return "bottom";
}

/**
 * Returns the position of the y axis relative to the chart.
 * @param {DvtChartImpl} chart
 * @return {string} The axis position
 */
DvtChartAxisUtils.getYAxisPosition = function(chart) {
  if(DvtChartTypeUtils.isHorizontal(chart))
    return "bottom";
  else
    return DvtStyleUtils.isLocaleR2L() ? "right" : "left";
}

/**
 * Returns the position of the y2 axis relative to the chart.
 * @param {DvtChartImpl} chart
 * @return {string} The axis position
 */
DvtChartAxisUtils.getY2AxisPosition = function(chart) {
  if(DvtChartTypeUtils.isHorizontal(chart))
    return "top";
  else
    return DvtStyleUtils.isLocaleR2L() ? "left" : "right";
}

/**
 * Returns true if the chart has a group axis.
 * @param {DvtChartImpl} chart
 * @return {boolean}
 */
DvtChartAxisUtils.hasGroupAxis = function(chart) {
  // TODO take time axis into account?
  if(DvtChartTypeUtils.isBar(chart) || DvtChartTypeUtils.isLine(chart) ||
     DvtChartTypeUtils.isArea(chart) || DvtChartTypeUtils.isCombo(chart))
    return true;
  else
    return false;
}

/**
 * Returns the offset before and after the groups for the specified chart.
 * @param {DvtChartImpl} chart
 * @return {number} The offset factor.
 */
DvtChartAxisUtils.getGroupAxisOffset = function(chart) {
  
  if(DvtChartTypeUtils.hasBarSeries(chart)) {
    // Combo graphs have offset only if bars are present
    return DvtChartAxisUtils._BAR_AXIS_OFFSET;
  }
  
  // Otherwise no offset  
  return 0; 
}

/**
 * Returns the axis value on the x axis for the given parameters.  The axis value can be used 
 * to find the coordinate on the axis.
 * @param {object} dataItem 
 * @param {number} groupIndex
 * @return {number} The x value.
 */
DvtChartAxisUtils.getXAxisValue = function(dataItem, groupIndex) {
  if(dataItem === null || isNaN(dataItem.x)) // TODO pass chart in instead and be more explicit about group axis?
    return groupIndex;
  else if(dataItem)
    return dataItem.x;
}

/**
 * Data related utility functions for DvtChartImpl.
 * @class
 */
var DvtChartDataUtils = new Object();

DvtObj.createSubclass(DvtChartDataUtils, DvtObj, "DvtChartDataUtils");

/**
 * Returns true if the specified chart has data.
 * @param {DvtChartImpl} chart
 * @return {boolean}
 */
DvtChartDataUtils.hasData = function(chart) {
  var data = chart.getData();
  
  // Check that there is a data object with at least one series
  if(!data || !data['series'] || data['series'].length < 1)
    return false;  
    
  // Check that the minimum number of data points is present
  var minDataCount = 1;
  if(DvtChartTypeUtils.isLine(chart) || DvtChartTypeUtils.isArea(chart) || DvtChartTypeUtils.isCombo(chart))
    minDataCount = 2;
    
  var seriesCount = DvtChartDataUtils.getSeriesCount(chart);
  for (var i = 0;i < seriesCount;i++) {
    var seriesItem = DvtChartDataUtils.getSeriesItem(chart, i);
    if(seriesItem && seriesItem['data'] && seriesItem['data'].length >= minDataCount)
      return true;
  }
  
  return false;
}

/**
 * Processes the data object.  Generates default group labels if none or
 * not enough have been specified.
 * @param {DvtChartImpl} chart
 */
DvtChartDataUtils.processDataObject = function (chart) {
  // If no data or unusable data, return
  if(!DvtChartDataUtils.hasData(chart))
    return;

  // Iterate through the series to keep track of the count and the series style indices
  var maxGroups = 0;
  var arSeriesStyle = chart.getSeriesStyleArray();
  var seriesCount = DvtChartDataUtils.getSeriesCount(chart);
  for(var i = 0;i < seriesCount;i++) {
    var series = DvtChartDataUtils.getSeries(chart, i);
    var seriesItem = DvtChartDataUtils.getSeriesItem(chart, i);
    
    if(series && DvtArrayUtils.indexOf(arSeriesStyle, series) < 0) 
      arSeriesStyle.push(series);
    
    if(seriesItem && seriesItem['data'] && seriesItem['data'].length > maxGroups)
      maxGroups = seriesItem['data'].length;
  }

  // Make sure the data object specifies enough groups
  var data = chart.getData();
  if (!data['groups'])
    data['groups'] = new Array();

  // Lengthen the array so that there are enough groups
  var bundle = chart.getBundle();
  while (data['groups'].length < maxGroups) {
    var group = bundle.getRBString(DvtChartBundle.DEFAULT_GROUP_NAME, data['groups'].length + 1, 'DvtChartBundle.DEFAULT_GROUP_NAME');// +1 so we start at "Group 1"
    data['groups'].push(group);
  }
}

/**
 * Returns the number of series in the specified chart.
 * @param {DvtChartImpl} chart
 * @return {number}
 */
DvtChartDataUtils.getSeriesCount = function (chart) {
  return chart.getData()['series'].length;
}

/**
 * Returns the id for the specified series.
 * @param {DvtChartImpl} chart
 * @param {number} seriesIndex
 * @return {string} The id of the series.
 */
DvtChartDataUtils.getSeries = function (chart, seriesIndex) {
  var seriesItem = DvtChartDataUtils.getSeriesItem(chart, seriesIndex);
  if (seriesItem) {
    if(seriesItem['id'])
      return seriesItem['id'];
    else if(seriesItem['name'] || seriesItem['name'] === "")
      return seriesItem['name'];
    else
      return String(seriesIndex);
  }
  else
    return null;
}

/**
 * Returns the label for the specified series.
 * @param {DvtChartImpl} chart
 * @param {number} seriesIndex
 * @return {string} The label for the series.
 */
DvtChartDataUtils.getSeriesLabel = function (chart, seriesIndex) {
  var seriesItem = DvtChartDataUtils.getSeriesItem(chart, seriesIndex);
  if (seriesItem && (seriesItem['name'] || seriesItem['name'] === ""))
    return seriesItem['name'];
  else 
    return null;
}

/**
 * Returns the index for the specified series.
 * @param {DvtChartImpl} chart
 * @param {string} series The id of the series
 * @return {number} The index of the series.
 */
DvtChartDataUtils.getSeriesIndex = function (chart, series) {
  var numSeries = DvtChartDataUtils.getSeriesCount(chart);
  for (var seriesIndex = 0;seriesIndex < numSeries;seriesIndex++) {
    var seriesId = DvtChartDataUtils.getSeries(chart, seriesIndex);
    if (seriesId == series) 
      return seriesIndex;
  }

  // No match found
  return  - 1;
}

/**
 * Returns the style index for the specified series.
 * @param {DvtChartImpl} chart
 * @param {string} series The id of the series
 * @return {number} The index to use when looking for style information.
 */
DvtChartDataUtils.getSeriesStyleIndex = function(chart, series) {
  if(series) {
    var arSeriesStyle = chart.getSeriesStyleArray();
    return DvtArrayUtils.indexOf(arSeriesStyle, series);
  }
  else 
    return DvtChartDataUtils.getSeriesIndex(chart, series);
}

/**
 * Returns the series item for the specified index.
 * @param {DvtChartImpl} chart
 * @param {number} seriesIndex
 * @return {object} The series data item.
 */
DvtChartDataUtils.getSeriesItem = function (chart, seriesIndex) {
  if (isNaN(seriesIndex) || seriesIndex === null)
    return null;

  var data = chart.getData();
  if (data['series'] && data['series'].length > seriesIndex)
    return data['series'][seriesIndex];
}

/**
 * Returns the data item for the specified index.
 * @param {DvtChartImpl} chart
 * @param {number} seriesIndex
 * @param {number} groupIndex
 * @return {object} The data item.
 */
DvtChartDataUtils.getDataItem = function (chart, seriesIndex, groupIndex) {
  if (isNaN(groupIndex) || groupIndex === null)
    return null;

  var seriesItem = DvtChartDataUtils.getSeriesItem(chart, seriesIndex);
  if (seriesItem && seriesItem['data'] && seriesItem['data'].length > groupIndex)
    return seriesItem['data'][groupIndex];
}

/**
 * Returns the number of groups in the specified chart.
 * @param {DvtChartImpl} chart
 * @return {number}
 */
DvtChartDataUtils.getGroupCount = function (chart) {
  return chart.getData()['groups'].length;
}

/**
 * Returns the group id for the specified group index.
 * @param {DvtChartImpl} chart
 * @param {Number} groupIndex The group index.
 * @returns {string} The group id, null if the index is invalid.
 */
DvtChartDataUtils.getGroup = function (chart, groupIndex) {
  var groupItems = chart.getData()['groups'];
  if (groupIndex >= 0 && groupIndex < groupItems.length) {
    var group = groupItems[groupIndex];
    if(group) {
      if(group['id'])
        return group['id'];
      else if(group['name'] || group['name'] === "")
        return group['name'];
      else
        return group;
    }
  }
  
  return null;
};

/**
 * Returns the group label for the specified group index.
 * @param {DvtChartImpl} chart
 * @param {Number} groupIndex The group index.
 * @returns {string} The group label, null if the index is invalid.
 */
DvtChartDataUtils.getGroupLabel = function (chart, groupIndex) {
  var groupItems = chart.getData()['groups'];
  if (groupIndex >= 0 && groupIndex < groupItems.length) {
    var group = groupItems[groupIndex];
    if(group) {
      if(group['name'])
        return group['name'];
      else
        return group;
    }
  }
  
  return null;
};

/**
 * Returns a list of the group ids in the chart's data.
 * @param {DvtChartImpl} chart
 * @returns {Array} An array of the group id's.
 */
DvtChartDataUtils.getGroups = function (chart) {
  var groupCount = chart.getData()['groups'].length;
  var groups = [];
  for(var groupIndex = 0; groupIndex < groupCount; groupIndex++) {
    groups.push(DvtChartDataUtils.getGroup(chart, groupIndex));
  }
  return groups;
};

/**
 * Returns the value for the specified data item.
 * @param {DvtChartImpl} chart
 * @param {number} seriesIndex
 * @param {number} groupIndex
 * @return {number} The value of the specified data item.
 */
DvtChartDataUtils.getValue = function (chart, seriesIndex, groupIndex) {
  var dataItem = DvtChartDataUtils.getDataItem(chart, seriesIndex, groupIndex);
  if(!isNaN(dataItem) || dataItem === null)
    return dataItem;
  else 
    return dataItem.y;
}

/**
 * Returns the cumulative value for the specified data item, taking into account stacked values.
 * @param {DvtChartImpl} chart
 * @param {number} seriesIndex
 * @param {number} groupIndex
 * @param {boolean} bIncludeHiddenSeries True if hidden series should be included in the value calculation.
 * @return {number} The value of the specified data item.
 */
DvtChartDataUtils.getCumulativeValue = function (chart, seriesIndex, groupIndex, bIncludeHiddenSeries) {
  if (DvtChartTypeUtils.isStacked(chart)) {
    // Match the series type and add up the values
    var bCombo = DvtChartTypeUtils.isCombo(chart);
    var seriesType = DvtChartStyleUtils.getSeriesType(chart, seriesIndex);
    var bAssignedToY2 = DvtChartDataUtils.isAssignedToY2(chart, seriesIndex);

    var total = 0;
    for (var i = 0;i <= seriesIndex;i++) {
      // Skip series that are not rendered
      if (!bIncludeHiddenSeries && !DvtChartStyleUtils.isSeriesRendered(chart, i))
        continue;

      // Skip series that don't match the type
      if (bCombo && seriesType != DvtChartStyleUtils.getSeriesType(chart, i))
        continue;

      // Skip series who aren't assigned to the same y axis
      if (bAssignedToY2 != DvtChartDataUtils.isAssignedToY2(chart, i))
        continue;

      // Add up all the values for the group.
      var groupValue = DvtChartDataUtils.getValue(chart, i, groupIndex);
      total += groupValue;
    }
    return total;
  }
  else 
    return DvtChartDataUtils.getValue(chart, seriesIndex, groupIndex);
}

/**
 * Returns true if the series is assigned to the y2 axis.
 * @param {DvtChartImpl} chart
 * @param {string} series
 * @return {boolean} True if the series is assigned to the y2 axis.
 */
DvtChartDataUtils.isAssignedToY2 = function (chart, seriesIndex) {
  var seriesItem = DvtChartDataUtils.getSeriesItem(chart, seriesIndex);
  if (seriesItem && seriesItem['assignedToY2'] && DvtChartTypeUtils.isDualY(chart))
    return true;
  else 
    return false;
}

/**
 * Returns information if graph contains mixed frequency data.
 * @param {DvtChartImpl} chart The chart that will be rendered.
 * @return {boolean} true if graph ha mixed data.
 */
DvtChartDataUtils.hasMixedFrequency = function (chart) {
  return chart.getData()["timeAxisType"] == 'mixedFrequency';
}

/**
 * Returns the array of initially selected objects for a chart.  This information is based on the data object.
 * @param {DvtChartImpl} chart The chart that will be rendered.
 * @return {array} The array of selected objects.
 */
DvtChartDataUtils.getInitialSelection = function (chart) {
  var selection = chart.getData()['selection'];
  if(!selection)
    selection = [];
  
  // Process the data item ids and fill in series and group information
  var peers = chart.getObjects();
  for (var i = 0; i < selection.length; i++) {
    var id = selection[i]['id'];
    
    // If id is defined, but series and group are not
    if(id && !(selection[i]['series'] && selection[i]['group'])) {
      for (var j = 0; j < peers.length; j++) {
        var peer = peers[j];
        if(id === peer.getDataItemId()) {
          selection[i]['series'] = peer.getSeries();
          selection[i]['group'] = peer.getGroup();
          break;
        }
      }
    }
  } 

  return selection;
}

/**
 * Returns the current selection for the chart.  This selection is in the format of the data['selection'] API.
 * @param {DvtChartImpl} chart The chart that will be rendered.
 * @return {array} The array of selected objects.
 */
DvtChartDataUtils.getCurrentSelection = function (chart) {
  var selection = [];
  var handler = chart.getSelectionHandler();
  if(handler) {
    var selectedIds = handler.getSelectedIds();
    for(var i = 0; i < selectedIds.length; i++) {
      var selectedId = selectedIds[i]; // selectedId is an instance of DvtChartDataItem
      selection.push({'series': selectedId.getSeries(), 'group': selectedId.getGroup(), 'id': selectedId.getId()});
    }
  }
  
  return selection;
}
/**
 * Utility functions for DvtChartImpl eventing and interactivity.
 * @class
 */
var DvtChartEventUtils = new Object();

DvtObj.createSubclass(DvtChartEventUtils, DvtObj, "DvtChartEventUtils");

/**
 * Returns the hide and show behavior for the specified chart.
 * @param {DvtChartImpl} chart
 * @return {string}
 */
DvtChartEventUtils.getHideAndShowBehavior = function(chart) {
  return chart.getOptions()['chart']['hideAndShowBehavior'];
}

/**
 * Returns the rollover behavior for the specified chart.
 * @param {DvtChartImpl} chart
 * @return {string}
 */
DvtChartEventUtils.getRolloverBehavior = function(chart) {
  return chart.getOptions()['chart']['rolloverBehavior'];
}

/**
 * Returns the scrolling behavior for the specified chart.
 * @param {DvtChartImpl} chart
 * @return {string}
 */
DvtChartEventUtils.getLegendScrolling = function(chart) {
  return chart.getOptions()['legend']['scrolling'];
}

/**
 * Updates the visibility of the specified category.  Returns true if the visibility is successfully
 * updated.  This function will return false if the visibility change is rejected, such as when
 * hiding the last visible series with hideAndShowBehavior withRescale.
 * @param {DvtChartImpl} chart
 * @param {string} category
 * @param {string} visibility The new visibility of the category.
 * @return {boolean} True if the visibility was successfully updated.
 */
DvtChartEventUtils.setVisibility = function(chart, category, visibility) {
  var hsb = DvtChartEventUtils.getHideAndShowBehavior(chart);

  // Note: The only supported categories are series for now.  The category is the series. 
  var seriesItem = DvtChartDataUtils.getSeriesItem(chart, DvtChartDataUtils.getSeriesIndex(chart, category));
  if (category == DvtPieChartUtils.OTHER_SLICE_SERIES_ID && DvtPieChartUtils.getOtherSliceVisibility(chart) !== visibility) {
    // Pie "Other" slice
    if (visibility == "hidden") {
      // Don't continue if this is the last visible series
      var numVisibleSlices = DvtPieChartUtils.getNumVisibleSlices(chart)
      if(numVisibleSlices <= 1)
        return false;
    }
    
    // Update the "Other" slice visibility
    DvtPieChartUtils.setOtherSliceVisibility(chart, visibility);
    return true;
  }
  else if (seriesItem && seriesItem['visibility'] !== visibility) {
    // Don't allow all series to be hidden for hideAndShowBehavior="withRescale" or pie, which always rescales.
    if(visibility == "hidden" && (hsb == "withRescale" || chart.getType() == "pie")) {
      // Don't continue if this is the last visible series
      var numVisibleSeries = DvtChartEventUtils._getNumVisibleSeries(chart);
      if(numVisibleSeries <= 1)
        return false;
    }
    
    // Update the visibility
    seriesItem['visibility'] = visibility;
    return true;
  }
  else {
    // Data point hide/show is only supported for scatter and bubble graphs
    if(!(DvtChartTypeUtils.isScatter(chart) || DvtChartTypeUtils.isBubble(chart)))
      return false;
      
     // Don't allow all data points to be hidden for hideAndShowBehavior="withRescale"
    if(visibility == "hidden" && hsb == "withRescale") {
      // Don't continue if all data items would be hidden
      var numVisibleItems = DvtChartEventUtils._getNumVisibleDataItems(chart, category);
      if(numVisibleItems <= 0)
        return false;
    }
    
    // Update the categories list
    var hiddenCategories = DvtChartStyleUtils.getHiddenCategories(chart);
    if(visibility == "hidden")
      hiddenCategories.push(category);
    else {
      var index = DvtArrayUtils.indexOf(hiddenCategories, category);
      hiddenCategories.splice(index, 1);
    }
      
    // Update the legend
    var data = chart.getData();
    if(data && data['legend'] && data['legend']['sections']) {
      // Iterate through any sections defined
      for(var i=0; i<data['legend']['sections'].length; i++) {
        var dataSection = data['legend']['sections'][i];
        if(dataSection && dataSection['items']) {
          // Find the matching item and apply visibility 
          for(var j=0; j<dataSection['items'].length; j++) {
            if(dataSection['items'][j]['id'] == category)
              dataSection['items'][j]['visibility'] = visibility;
          }
        }
      }
    }
    
    return true;
  }
  
  return false;
}

/**
 * Returns the number of visible series in the chart.
 * @param {DvtChartImpl} chart
 * @return {number}
 * @private
 */
DvtChartEventUtils._getNumVisibleSeries = function(chart) {
  var numVisible = 0;
  var seriesCount = DvtChartDataUtils.getSeriesCount(chart);
  for(var seriesIndex=0; seriesIndex < seriesCount; seriesIndex++) {
    if(DvtChartStyleUtils.getVisibility(chart, seriesIndex) == "visible")
      numVisible++;
  }   
  return numVisible;
}

/**
 * Returns the number of visible series in the chart if the specified category is hidden.
 * @param {DvtChartImpl} chart
 * @param {string} category
 * @return {number}
 * @private
 */
DvtChartEventUtils._getNumVisibleDataItems = function(chart, category) {
  var numVisible = 0;
  var seriesCount = DvtChartDataUtils.getSeriesCount(chart);
  var groupCount = DvtChartDataUtils.getGroupCount(chart);
  for(var seriesIndex=0; seriesIndex<seriesCount; seriesIndex++) {
    for(var groupIndex=0; groupIndex<groupCount; groupIndex++) {
      var dataItem = DvtChartDataUtils.getDataItem(chart, seriesIndex, groupIndex);
      if(dataItem && dataItem['categories'] && DvtArrayUtils.indexOf(dataItem['categories'], category) >= 0)
        continue;
      else if(DvtChartStyleUtils.isDataItemRendered(chart, seriesIndex, groupIndex))
        numVisible++;
    }
  }
  return numVisible;
}

/**
 * Reference object related utility functions for DvtChartImpl.
 * @class
 */
var DvtChartRefObjUtils = new Object();

DvtObj.createSubclass(DvtChartRefObjUtils, DvtObj, "DvtChartRefObjUtils");

/**
 * Returns all reference objects for the current chart.
 * @param {DvtChartImpl} chart
 * @return {array} The array of reference object definitions.
 */
DvtChartRefObjUtils.getObjects = function(chart) {
  var x = DvtChartRefObjUtils.getXAxisObjects(chart);
  var y = DvtChartRefObjUtils.getYAxisObjects(chart);
  var y2 = DvtChartRefObjUtils.getY2AxisObjects(chart);
  return x.concat(y, y2);
}

/**
 * Returns all reference objects for the x-axis of the current chart.
 * @param {DvtChartImpl} chart
 * @return {array} The array of reference object definitions.
 */
DvtChartRefObjUtils.getXAxisObjects = function(chart) {
  var data = chart.getData();
  if(data && data['xAxis'] && data['xAxis']['referenceObjects'])
    return data['xAxis']['referenceObjects'];
  else
    return [];
}

/**
 * Returns all reference objects for the y-axis of the current chart.
 * @param {DvtChartImpl} chart
 * @return {array} The array of reference object definitions.
 */
DvtChartRefObjUtils.getYAxisObjects = function(chart) {
  var data = chart.getData();
  if(data && data['yAxis'] && data['yAxis']['referenceObjects'])
    return data['yAxis']['referenceObjects'];
  else
    return [];
}

/**
 * Returns all reference objects for the y2-axis of the current chart.
 * @param {DvtChartImpl} chart
 * @return {array} The array of reference object definitions.
 */
DvtChartRefObjUtils.getY2AxisObjects = function(chart) {
  var data = chart.getData();
  if(data && data['y2Axis'] && data['y2Axis']['referenceObjects'])
    return data['y2Axis']['referenceObjects'];
  else
    return [];
}

/**
 * Returns the type of the reference object.
 * @param {DvtChartImpl} chart
 * @param {object} refObj The reference object definition.
 * @return {string} The type of the reference object.
 */
DvtChartRefObjUtils.getType = function(chart, refObj) {
  if(refObj['type'] == "area")
    return "area";
  else // default to "line"
    return "line";
}

/**
 * Returns the location of the reference object.
 * @param {DvtChartImpl} chart
 * @param {object} refObj The reference object definition.
 * @return {string} The location of the reference object.
 */
DvtChartRefObjUtils.getLocation = function(chart, refObj) {
  if(refObj['location'] == "front")
    return "front";
  else // default to "back"
    return "back";
}
/**
 * Series effect utility functions for DvtChartImpl.
 * @class
 */
var DvtChartSeriesEffectUtils = new Object();

DvtObj.createSubclass(DvtChartSeriesEffectUtils, DvtObj, "DvtChartSeriesEffectUtils");

/**
 * Returns the fill for a bar with the given series and group.
 * @param {DvtChartImpl} chart
 * @param {number} seriesIndex
 * @param {number} groupIndex
 * @param {boolean} bHoriz True if the bar is horizontal.
 * @return {DvtFill}
 */
DvtChartSeriesEffectUtils.getBarFill = function(chart, seriesIndex, groupIndex, bHoriz) {
  // All series effects are based off of the color
  var color = DvtChartStyleUtils.getColor(chart, seriesIndex, groupIndex);
  
  var seriesEffect = DvtChartStyleUtils.getSeriesEffect(chart);
  if(seriesEffect == "gradient") {
    var angle = bHoriz ? 270: 0;
    var colors = [DvtColorUtils.getPastel(color, 0.15), 
                  DvtColorUtils.getPastel(color, 0.45), 
                  DvtColorUtils.getPastel(color, 0.25),
                  color,
                  DvtColorUtils.getPastel(color, 0.15),
                  DvtColorUtils.getDarker(color, 0.9)];
    var stops = [0, 0.15, 0.30, 0.65, 0.85, 1.0];    
    return new DvtLinearGradientFill(angle, colors, null, stops);
  }
  else // seriesEffect="color"
    return new DvtSolidFill(color);
}

/**
 * Returns the fill for an area with the given series and group.
 * @param {DvtChartImpl} chart
 * @param {number} seriesIndex
 * @param {number} groupIndex
 * @return {DvtFill}
 */
DvtChartSeriesEffectUtils.getAreaFill = function(chart, seriesIndex, groupIndex) {
  // All series effects are based off of the color
  var color = DvtChartStyleUtils.getColor(chart, seriesIndex, groupIndex);
  
  var seriesEffect = DvtChartStyleUtils.getSeriesEffect(chart);
  if(seriesEffect == "gradient") {
    var colors, stops, alphas;
    if(DvtChartTypeUtils.isSpark(chart)) {      
      colors = [DvtColorUtils.getDarker(color, 0.5), color, DvtColorUtils.getPastel(color, 0.50)];
      stops = [0, 0.5, 1.0];
      alphas = null;
    }
    else {
      colors = [DvtColorUtils.getPastel(color, 0.5), color, DvtColorUtils.getDarker(color, 0.70)];
      stops = [0, 0.5, 1.0];
      alphas = null;
    }
    
    return new DvtLinearGradientFill(270, colors, alphas, stops);
  }
  else // seriesEffect="color"
    return new DvtSolidFill(color);
}

/**
 * Returns the fill for a marker with the given series and group.
 * @param {DvtChartImpl} chart
 * @param {number} seriesIndex
 * @param {number} groupIndex
 * @return {DvtFill}
 */
DvtChartSeriesEffectUtils.getMarkerFill = function(chart, seriesIndex, groupIndex) {
  // All series effects are based off of the color
  var color = DvtChartStyleUtils.getMarkerColor(chart, seriesIndex, groupIndex);
  
  // Only bubble markers use complex fills
  if(chart.getType() == "bubble") {
    var seriesEffect = DvtChartStyleUtils.getSeriesEffect(chart);
    if(seriesEffect == "gradient") {
      // Gradient varies by shape
      var shape = DvtChartStyleUtils.getMarkerShape(chart, seriesIndex, groupIndex);
      if(shape == "human") {
        var linearColors = [DvtColorUtils.getPastel(color, 0.2), 
                            DvtColorUtils.getPastel(color, 0.1), 
                            color,
                            DvtColorUtils.getDarker(color, 0.8)];
        var linearStops = [0, 0.3, 0.7, 1.0];
        return new DvtLinearGradientFill(315, linearColors, null, linearStops);
      }
      else {    
        var radialColors = [DvtColorUtils.getPastel(color, 0.15), 
                            color,
                            DvtColorUtils.getDarker(color, 0.9), 
                            DvtColorUtils.getDarker(color, 0.8)];
        var radialStops = [0, 0.5, 0.75, 1.0];
        return new DvtRadialGradientFill(radialColors, null, radialStops)
      }
    }
  }
  
  // seriesEffect="color" or line/scatter marker
  return new DvtSolidFill(color);
}
/**
 * Style related utility functions for DvtChartImpl.
 * @class
 */
var DvtChartStyleUtils = new Object();

DvtObj.createSubclass(DvtChartStyleUtils, DvtObj, "DvtChartStyleUtils");

/** @private */
DvtChartStyleUtils._SERIES_TYPE_RAMP = ["bar", "line", "area"];

/**
 * Returns the series type for the specified data item.  Returns "auto" for chart types
 * that do not support multiple series types.
 * @param {DvtChartImpl} chart
 * @param {number} seriesIndex
 * @return {string} The series type.
 */
DvtChartStyleUtils.getSeriesType = function(chart, seriesIndex) {
  if(DvtChartTypeUtils.isBar(chart)) {
    return "bar";
  }
  else if(DvtChartTypeUtils.isLine(chart)) {
    return "line";
  }
  else if(DvtChartTypeUtils.isArea(chart)) {
    return "area";
  }
  else if(DvtChartTypeUtils.isCombo(chart)) {
    var seriesItem = DvtChartDataUtils.getSeriesItem(chart, seriesIndex);
    var seriesType = seriesItem ? seriesItem.type : null;
    if(!seriesType || seriesType == "auto") {
      // Series type not specified, get default
      var series = DvtChartDataUtils.getSeries(chart, seriesIndex);
      var styleIndex = DvtChartDataUtils.getSeriesStyleIndex(chart, series);
      var typeIndex = styleIndex % DvtChartStyleUtils._SERIES_TYPE_RAMP.length;
      return DvtChartStyleUtils._SERIES_TYPE_RAMP[typeIndex]; 
    }
    else
      return seriesType;
  }
  else
    return "auto";
};

/**
 * Returns the series effect for the specified chart.
 * @param {DvtChartImpl} chart
 * @return {string} The series effect.
 */
DvtChartStyleUtils.getSeriesEffect = function(chart) {
  // Style Defaults
  var options = chart.getOptions();
  return options['styleDefaults']['seriesEffect'];
};

/**
 * Returns the color for the specified data item.
 * @param {DvtChartImpl} chart
 * @param {number} seriesIndex
 * @param {number} groupIndex
 * @return {string} The color string.
 */
DvtChartStyleUtils.getColor = function(chart, seriesIndex, groupIndex) {
  // Data Override
  var dataItem = DvtChartDataUtils.getDataItem(chart, seriesIndex, groupIndex);
  if(dataItem && dataItem['color'])
    return dataItem['color'];

  // Series Override
  var seriesItem = DvtChartDataUtils.getSeriesItem(chart, seriesIndex);
  if(seriesItem && seriesItem['color'])
    return seriesItem['color'];
  
  // Style Defaults
  var options = chart.getOptions();
  var defaultColors = options['styleDefaults']['colors'];
  var series = DvtChartDataUtils.getSeries(chart, seriesIndex);
  var styleIndex = DvtChartDataUtils.getSeriesStyleIndex(chart, series);
  var colorIndex = styleIndex % defaultColors.length;
  return options['styleDefaults']['colors'][colorIndex];
};

/**
 * Returns the border color for the specified data item.
 * @param {DvtChartImpl} chart
 * @param {number} seriesIndex
 * @param {number} groupIndex
 * @return {string} The border color string.
 */
DvtChartStyleUtils.getBorderColor = function(chart, seriesIndex, groupIndex) {
  // Data Override
  var dataItem = DvtChartDataUtils.getDataItem(chart, seriesIndex, groupIndex);
  if(dataItem && dataItem['borderColor'])
    return dataItem['borderColor'];

  // Series Override
  var seriesItem = DvtChartDataUtils.getSeriesItem(chart, seriesIndex);
  if(seriesItem && seriesItem['borderColor'])
    return seriesItem['borderColor'];
  
  // Style Defaults
  var options = chart.getOptions();
  return options['styleDefaults']['borderColor'];
};

/**
 * Returns the marker color for the specified data item.
 * @param {DvtChartImpl} chart
 * @param {number} seriesIndex
 * @param {number} groupIndex
 * @return {string} The marker color string.
 */
DvtChartStyleUtils.getMarkerColor = function(chart, seriesIndex, groupIndex) {
  // Data Override: Note that the data object defines a single 'color' attribute
  var dataItem = DvtChartDataUtils.getDataItem(chart, seriesIndex, groupIndex);
  if(dataItem && dataItem['color'])
    return dataItem['color'];

  // Series Override
  var seriesItem = DvtChartDataUtils.getSeriesItem(chart, seriesIndex);
  if(seriesItem && seriesItem['markerColor'])
    return seriesItem['markerColor'];
  
  // Style Defaults
  var options = chart.getOptions();
  var defaultMarkerColor = options['styleDefaults']['markerColor'];
  if(defaultMarkerColor) // Return the default if set
    return defaultMarkerColor;
  else {
    // Otherwise return the series color
    return DvtChartStyleUtils.getColor(chart, seriesIndex, groupIndex);
  }
};

/**
 * Returns the marker shape for the specified data item.  Returns the actual shape
 * if the marker shape is set to "auto".
 * @param {DvtChartImpl} chart
 * @param {number} seriesIndex
 * @param {number} groupIndex
 * @return {string} The marker shape.
 */
DvtChartStyleUtils.getMarkerShape = function(chart, seriesIndex, groupIndex) {
  // Style Defaults
  var options = chart.getOptions();
  var shape = options['styleDefaults']['markerShape'];
  
  // Series Override
  var seriesItem = DvtChartDataUtils.getSeriesItem(chart, seriesIndex);
  if(seriesItem && seriesItem['markerShape'])
    shape = seriesItem['markerShape'];
    
  // Data Override
  var dataItem = DvtChartDataUtils.getDataItem(chart, seriesIndex, groupIndex);
  if(dataItem && dataItem['markerShape'])
    shape = dataItem['markerShape'];
  
  // Convert automatic shape to actual shape
  if(shape == "auto") {
    if(chart.getType() == "bubble") 
      shape = "circle";
    else {
      var series = DvtChartDataUtils.getSeries(chart, seriesIndex);
      var styleIndex = DvtChartDataUtils.getSeriesStyleIndex(chart, series);
      
      // Iterate through the shape ramp to find the right shape
      var shapeRamp = options['styleDefaults']['shapes'];
      var shapeIndex = styleIndex % shapeRamp.length;
      shape = shapeRamp[shapeIndex];
    }
  }
  
  return shape;
};

/**
 * Returns the marker size for the specified data item.
 * @param {DvtChartImpl} chart
 * @param {number} seriesIndex
 * @param {number} groupIndex
 * @return {number} The marker size.
 */
DvtChartStyleUtils.getMarkerSize = function(chart, seriesIndex, groupIndex) {
  // Data Override
  var dataItem = DvtChartDataUtils.getDataItem(chart, seriesIndex, groupIndex);
  if(dataItem && dataItem['markerSize'])
    return dataItem['markerSize'];
  
  // Series Override
  var seriesItem = DvtChartDataUtils.getSeriesItem(chart, seriesIndex);
  if(seriesItem && seriesItem['markerSize'])
    return seriesItem['markerSize'];
  
  // Style Defaults
  var options = chart.getOptions();
  if(options['styleDefaults']['markerSize'] !== null)
    return options['styleDefaults']['markerSize'];
};

/**
 * Returns the whether markers are displayed for the specified line or area series.
 * @param {DvtChartImpl} chart
 * @param {number} seriesIndex
 * @param {number} groupIndex
 * @return {boolean} True if markers should be displayed.
 */
DvtChartStyleUtils.getMarkerDisplayed = function(chart, seriesIndex, groupIndex) {
  // Always show markers for bubble and scatter graphs
  var chartType = chart.getType();
  if(chartType == "scatter" || chartType == "bubble")
    return true;
    
  // Data Override
  var dataItem = DvtChartDataUtils.getDataItem(chart, seriesIndex, groupIndex);
  if(dataItem && (dataItem['markerDisplayed'] === true || dataItem['markerDisplayed'] === false))
    return dataItem['markerDisplayed'];

  // Series Override
  var seriesItem = DvtChartDataUtils.getSeriesItem(chart, seriesIndex);
  if(seriesItem && (seriesItem['markerDisplayed'] === true || seriesItem['markerDisplayed'] === false))
    return seriesItem['markerDisplayed'];
  
  // Style Defaults
  var options = chart.getOptions();
  return options['styleDefaults']['markerDisplayed'];
};

/**
 * Returns the line width for the specified series.
 * @param {DvtChartImpl} chart
 * @param {number} seriesIndex
 * @return {number} The line width.
 */
DvtChartStyleUtils.getLineWidth = function(chart, seriesIndex) {
  // Series Override
  var seriesItem = DvtChartDataUtils.getSeriesItem(chart, seriesIndex);
  if(seriesItem && seriesItem['lineWidth'])
    return seriesItem['lineWidth'];
  
  // Style Defaults
  var options = chart.getOptions();
  return options['styleDefaults']['lineWidth'];
};

/**
 * Returns the line style for the specified series.
 * @param {DvtChartImpl} chart
 * @param {number} seriesIndex
 * @return {string} The line style.
 */
DvtChartStyleUtils.getLineStyle = function(chart, seriesIndex) {
  // Series Override
  var seriesItem = DvtChartDataUtils.getSeriesItem(chart, seriesIndex);
  if(seriesItem && seriesItem['lineStyle'])
    return seriesItem['lineStyle'];
  
  // Style Defaults
  var options = chart.getOptions();
  return options['styleDefaults']['lineStyle'];
};

/**
 * Returns the pie slice explode for the specified series.
 * @param {DvtChartImpl} chart
 * @param {number} seriesIndex
 * @return {number} The pie slice explode from 0 to 100.
 */
DvtChartStyleUtils.getPieSliceExplode = function(chart, seriesIndex) {
  // Series Override
  var seriesItem = DvtChartDataUtils.getSeriesItem(chart, seriesIndex);
  if(seriesItem && seriesItem['pieSliceExplode'])
    return seriesItem['pieSliceExplode'];
  else
    return 0;
};

/**
 * Returns the bar spacing behavior.  Only applies for spark charts.
 * @param {DvtChartImpl} chart
 * @return {string} The bar spacing behavior
 */
DvtChartStyleUtils.getBarSpacing = function(chart) {
  var options = chart.getOptions();
  return options['chart']['__sparkBarSpacing'];
};

/**
 * Returns the width for bars in the specified chart.
 * @param {DvtChartImpl} chart
 * @param {number} barSeriesCount The number of bar series in the chart.
 * @param {DvtChartAxis} axis The x-axis.
 * @return {number} The width of the bars.
 */
DvtChartStyleUtils.getBarWidth = function(chart, barSeriesCount, axis) {
  var options = chart.getOptions();
  var groupWidth = axis.getGroupWidth();
  var barGroupGap = options['__layout']['barGroupGap'] * groupWidth;
  var barWidth, maxBarWidth;
  
  if(DvtChartStyleUtils.getBarSpacing(chart) == "pixel") {
    // Spark Chart Pixel Spacing Support
    barGroupGap = Math.floor(barGroupGap);
    barWidth = Math.max(Math.floor(groupWidth - 2*barGroupGap), 1);
  }
  else {
    // Adjust groupWidth by the gap between groups
    groupWidth -= barGroupGap;

    if(DvtChartTypeUtils.isStacked(chart))
      barWidth = DvtChartTypeUtils.hasY2BarData(chart) ? groupWidth/2 : groupWidth;
    else
      barWidth = groupWidth/barSeriesCount;
      
    // Adjust barWidth by the max bar width   
    maxBarWidth = options['__layout']['maxBarWidth'] * groupWidth;
    barWidth = Math.min(barWidth, maxBarWidth);
  }
  
  return barWidth;
};

/**
 * Returns the offset for bars in the specified chart.
 * @param {DvtChartImpl} chart
 * @param {number} barWidth The width of each bar in the chart.
 * @param {number} barSeriesCount The number of bar series in the chart.
 * @return {number} The offset for the bars.
 */
DvtChartStyleUtils.getBarOffset = function(chart, barWidth, barSeriesCount) {
  var offset = -(barWidth * barSeriesCount/2); 
  if(DvtChartTypeUtils.isStacked(chart) || DvtChartDataUtils.hasMixedFrequency(chart)) {
    if(DvtChartTypeUtils.hasY2BarData(chart))
      offset = DvtStyleUtils.isLocaleR2L() ? 0 : -barWidth;
    else
      offset = -barWidth/2;
  }
  
  return offset;
};

/**
 * Returns the additional offset for y2 bars in the specified charts.
 * @param {DvtChartImpl} chart
 * @param {number} barWidth The width of each bar in the chart.
 * @return {number} The addition offset for the y2 bars.
 */
DvtChartStyleUtils.getY2BarOffset = function(chart, barWidth) {
  if(DvtChartTypeUtils.isStacked(chart))
    return DvtStyleUtils.isLocaleR2L() ? -barWidth : barWidth;
  else
    return 0;
};

/**
 * Returns the visibility for the specified series.
 * @param {DvtChartImpl} chart
 * @param {number} seriesIndex
 * @return {string} The visibility.
 */
DvtChartStyleUtils.getVisibility = function(chart, seriesIndex) {
  // Series Override
  var seriesItem = DvtChartDataUtils.getSeriesItem(chart, seriesIndex);
  if(seriesItem && seriesItem.visibility)
    return seriesItem.visibility;
  else // Return the default
    return "visible";
};

/**
 * Returns true if the specified series should be rendered.
 * @param {DvtChartImpl} chart
 * @param {number} seriesIndex
 * @return {boolean} True if the series should be rendered.
 */
DvtChartStyleUtils.isSeriesRendered = function(chart, seriesIndex) {
  if(DvtChartStyleUtils.getVisibility(chart, seriesIndex) == "hidden")
    return false;
  else
    return true;
};

/**
 * Returns true if the specified data item should be rendered.
 * @param {DvtChartImpl} chart
 * @param {number} seriesIndex
 * @param {number} groupIndex
 * @return {boolean} True if the series should be rendered.
 */
DvtChartStyleUtils.isDataItemRendered = function(chart, seriesIndex, groupIndex) {
  if(DvtChartStyleUtils.getVisibility(chart, seriesIndex) == "hidden")
    return false;
  else {
    // Check if any category is hidden
    var hiddenCategories = DvtChartStyleUtils.getHiddenCategories(chart);
    var dataItem = DvtChartDataUtils.getDataItem(chart, seriesIndex, groupIndex);
    if(hiddenCategories.length > 0 && dataItem && dataItem['categories']) {
      for(var i=0; i<dataItem['categories'].length; i++) {
        var category = dataItem['categories'][i];
        if(DvtArrayUtils.indexOf(hiddenCategories, category) >= 0)
          return false;
      }
    }
  
    return true;
  }
};

/**
 * Returns the display animation for the specified chart.
 * @param {DvtChartImpl} chart
 * @return {string} 
 */
DvtChartStyleUtils.getAnimationOnDisplay = function(chart) {
  return chart.getOptions()['chart']['animationOnDisplay'];
};

/**
 * Returns the data change animation for the specified chart.
 * @param {DvtChartImpl} chart
 * @return {string} 
 */
DvtChartStyleUtils.getAnimationOnDataChange = function(chart) {
  return chart.getOptions()['chart']['animationOnDataChange'];
};

/**
 * Returns the animation duration in seconds for the specified chart.  This duration is
 * intended to be passed to the animatino handler, and is not in the same units
 * as the API.
 * @param {DvtChartImpl} chart
 * @return {number} The animation duration in seconds.
 */
DvtChartStyleUtils.getAnimationDuration = function(chart) {
  return chart.getOptions()['styleDefaults']['animationDuration']/1000;
};


/**
 * Returns the animation indicators property for the specified chart.
 * @param {DvtChartImpl} chart
 * @return {string}  The animation indicators value.
 */
DvtChartStyleUtils.getAnimationIndicators = function(chart) {
  return chart.getOptions()['styleDefaults']['animationIndicators'];
};


/**
 * Returns the animation indicators up color.
 * @param {DvtChartImpl} chart
 * @return {string}  The animation indicator up color.
 */
DvtChartStyleUtils.getAnimationUpColor = function(chart) {
  return chart.getOptions()['styleDefaults']['animationUpColor'];
};

/**
 * Returns the animation indicators down color.
 * @param {DvtChartImpl} chart
 * @return {string}  The animation indicator down color.
 */
DvtChartStyleUtils.getAnimationDownColor = function(chart) {
  return chart.getOptions()['styleDefaults']['animationDownColor'];
};

/**
 * Returns the array containing the hidden categories for the chart.
 * @return {array}
 */
DvtChartStyleUtils.getHiddenCategories = function(chart) {
  var data = chart.getData();
  if(!data['_hiddenCategories'])
    data['_hiddenCategories'] = [];
  
  return data['_hiddenCategories']; 
}

/**
 * Text related utility functions.
 * @class
 */
var DvtChartTextUtils = new Object();

DvtObj.createSubclass(DvtChartTextUtils, DvtObj, "DvtChartTextUtils");

/**
 * Creates and adds a DvtText object to a container. Will truncate and add tooltip as necessary.
 * @param {DvtEventManager} eventManager
 * @param {DvtContainer} container The container to add the text object to.
 * @param {String} textString The text string of the text object.
 * @param {String} cssStyle The string representing the css style to apply to the text object.
 * @param {number} x The x coordinate of the text object.
 * @param {number} y The y coordiante of the text object.
 * @param {number} width The width of available text space.
 * @param {number} height The height of the available text space.
 * @return {DvtText} The created text object. Can be null if no text object could be created in the given space.
 */
DvtChartTextUtils.createText = function(eventManager, container, textString, cssStyle, x, y, width, height) {
  var text = new DvtText(container.getContext(), textString, x, y);
  text.setCSSStyle(new DvtCSSStyle(cssStyle));
  var fullText = text.getTextString();
  text = text.truncateToSpace(container, width, height);
  
  if (text) {
    // Add tooltip if text is truncated
    if (fullText.length > text.getTextString().length)
      eventManager.associate(text, new DvtSimpleObjPeer(fullText));
    container.addChild(text);
  }
  
  return text;
}
/**
 * Utility functions for DvtChartImpl.
 * @class
 */
var DvtChartTooltipUtils = new Object();

DvtObj.createSubclass(DvtChartTooltipUtils, DvtObj, "DvtChartTooltipUtils");

/**
 * Returns true if the specified chart displays datatips.
 * @param {DvtChartImpl} chart
 * @return {boolean}
 */
DvtChartTooltipUtils.hasDatatips = function(chart) {
  var options = chart.getOptions();
  if(options['styleDefaults']['seriesTooltipType'] == "none" && 
     options['styleDefaults']['groupTooltipType'] == "none" &&
     options['styleDefaults']['valueTooltipType'] == "none")
    return false;
  else
    return true;
}

/**
 * Returns the datatip color for the tooltip of a data item with the given series 
 * and group indices.
 * @param {DvtChartImpl} chart 
 * @param {number} seriesIndex
 * @param {number} groupIndex
 * @return {string} The datatip color.
 */
DvtChartTooltipUtils.getDatatipColor = function(chart, seriesIndex, groupIndex) {
  return DvtChartStyleUtils.getColor(chart, seriesIndex, groupIndex);
}

/**
 * Returns the datatip text for a data item with the given series and group indices.
 * @param {DvtDisplayable} target The target of the event.
 * @param {DvtChartImpl} chart 
 * @param {number} seriesIndex
 * @param {number} groupIndex
 * @return {string} The tooltip text.
 */
DvtChartTooltipUtils.getDatatip = function(target, chart, seriesIndex, groupIndex) {
  // Only data items have tooltips
  if(seriesIndex < 0 || groupIndex < 0)
    return null;
    
  // Custom Tooltip Support
  var dataItem = DvtChartDataUtils.getDataItem(chart, seriesIndex, groupIndex);
  if(dataItem && dataItem['tooltip'])
    return dataItem['tooltip'];

  // Default Tooltip Support
  var arTooltip = [];
  
  // Series Tooltip
  DvtChartTooltipUtils._addSeriesStrings(arTooltip, chart, seriesIndex, groupIndex);
  
  // Group Tooltip
  DvtChartTooltipUtils._addGroupStrings(arTooltip, chart, seriesIndex, groupIndex);
    
  // Value Tooltip
  DvtChartTooltipUtils._addValueStrings(arTooltip, chart, seriesIndex, groupIndex);
  
  // Combine the lines and return the tooltip string
  return DvtChartTooltipUtils._convertLinesToString(arTooltip);
}

/**
 * Returns the datatip text for an "Other" slice.
 * @param {DvtChartImpl} chart 
 * @param {number} otherValue The value of the "Other" slice
 * @param {number} groupIndex
 * @return {string} The tooltip text.
 */
DvtChartTooltipUtils.getOtherSliceDatatip = function(chart, otherValue, groupIndex) {
  // Only data items have tooltips
  if(groupIndex < 0)
    return null;

  // Default Tooltip Support
  var arTooltip = [];
  var options = chart.getOptions();
  var bundle = chart.getBundle();
  
  // Series Tooltip
  if(options['styleDefaults']['seriesTooltipType'] != "none") {
    var otherStr = bundle.getTranslatedString(DvtChartBundle.LABEL_OTHER, null);
    arTooltip.push(otherStr); 
  }
  
  // Group Tooltip
  DvtChartTooltipUtils._addGroupStrings(arTooltip, chart, 0, groupIndex);
    
  // Value Tooltip
  if(options['styleDefaults']['valueTooltipType'] != "none") {
    var pieValueConverter = options.styleDefaults.pieValueFormat ? options.styleDefaults.pieValueFormat.converter : null;
    var val = Math.round(otherValue*100)/100;
    if (pieValueConverter && pieValueConverter.getAsString && pieValueConverter.getAsObject)
      val = pieValueConverter.getAsString(otherValue);
    var labelValue = bundle.getRBString(DvtChartBundle.LABEL_VALUE, val, 'DvtChartBundle.LABEL_VALUE');
    arTooltip.push(labelValue);
  }
  
  // Combine the lines and return the tooltip string
  return DvtChartTooltipUtils._convertLinesToString(arTooltip);
}

/**
 * Returns the tooltip for the reference object.
 * @param {DvtChartImpl} chart
 * @param {object} refObj The reference object definition.
 * @return {string} The tooltip for the reference object.
 */
DvtChartTooltipUtils.getRefObjTooltip = function(chart, refObj) {
  // Custom Tooltip Support
  if(refObj['tooltip'])
    return refObj['tooltip'];

  // Default Tooltip Support
  var arTooltip = [];
  
  // Add the text string
  if(refObj['text'])
    arTooltip.push(refObj['text']);

  // TODO number formatting for tooltips
  
  // Add the type specific value string
  var bundle = chart.getBundle();
  var type = DvtChartRefObjUtils.getType(chart, refObj);
  if(type == "line") {
    var labelValue = bundle.getRBString(DvtChartBundle.LABEL_VALUE, Math.round(refObj['lineValue']*100)/100, 'DvtChartBundle.LABEL_VALUE');
    arTooltip.push(labelValue);
  } else if(type == "area") {
    var labelLow = bundle.getRBString(DvtChartBundle.LABEL_LOW, Math.round(refObj['lowValue']*100)/100, 'DvtChartBundle.LABEL_LOW');
    var labelHigh = bundle.getRBString(DvtChartBundle.LABEL_HIGH, Math.round(refObj['highValue']*100)/100, 'DvtChartBundle.LABEL_HIGH');
    arTooltip.push(labelLow);
    arTooltip.push(labelHigh);
  }
  
  // Combine the lines and return the tooltip string
  return DvtChartTooltipUtils._convertLinesToString(arTooltip);
}

/**
 * Adds the series strings to the tooltip array.
 * @param {array} arTooltip The tooltip array.
 * @param {DvtChartImpl} chart The owning chart instance.
 * @param {number} seriesIndex
 * @param {number} groupIndex
 */
DvtChartTooltipUtils._addSeriesStrings = function(arTooltip, chart, seriesIndex, groupIndex) {
  var options = chart.getOptions();
  if(options['styleDefaults']['seriesTooltipType'] == "none")
    return;
  else {
    var bundle = chart.getBundle();
    
    // Find the series and the data item using the indices
    var seriesLabel = DvtChartDataUtils.getSeriesLabel(chart, seriesIndex);
    if(seriesLabel) {
      var labelSeries = bundle.getRBString(DvtChartBundle.LABEL_SERIES, seriesLabel, 'DvtChartBundle.LABEL_SERIES');
      arTooltip.push(labelSeries); 
    }
  }
}

/**
 * Adds the group strings to the tooltip array.
 * @param {array} arTooltip The tooltip array.
 * @param {DvtChartImpl} chart The owning chart instance.
 * @param {number} seriesIndex
 * @param {number} groupIndex
 */
DvtChartTooltipUtils._addGroupStrings = function(arTooltip, chart, seriesIndex, groupIndex) {
  var options = chart.getOptions();
  var data = chart.getData();
  var dataItem = DvtChartDataUtils.getDataItem(chart, seriesIndex, groupIndex);
  
  if(options['styleDefaults']['groupTooltipType'] == "none")
    return;
  else {
    var bundle = chart.getBundle();
    var groupLabel;
    
    if (data['timeAxisType'] && data['timeAxisType'] != "disabled") {
      var xAxis = chart.xAxis;
      groupLabel = xAxis.__getInfo().formatLabel(dataItem['x']);
    } else {
      groupLabel = DvtChartDataUtils.getGroupLabel(chart, groupIndex);
    }
    if(groupLabel) {
      var labelGroup = bundle.getRBString(DvtChartBundle.LABEL_GROUP, groupLabel, 'DvtChartBundle.LABEL_GROUP');
      arTooltip.push(labelGroup);
    }
  }
}

/**
 * Adds the value strings to the tooltip array.
 * @param {array} arTooltip The tooltip array.
 * @param {DvtChartImpl} chart The owning chart instance.
 * @param {number} seriesIndex
 * @param {number} groupIndex
 */
DvtChartTooltipUtils._addValueStrings = function(arTooltip, chart, seriesIndex, groupIndex) {
  var options = chart.getOptions();
  if(options['styleDefaults']['valueTooltipType'] == "none")
    return;
  else {
    var bundle = chart.getBundle();
    var dataItem = DvtChartDataUtils.getDataItem(chart, seriesIndex, groupIndex);
  
    // Number Formatting for Tooltips
    var x1Converter = (options['styleDefaults']['x1Format'] && options['styleDefaults']['x1Format']['converter']) ? options['styleDefaults']['x1Format']['converter'] : null;
    var y1Converter = (options['styleDefaults']['y1Format'] && options['styleDefaults']['y1Format']['converter']) ? options['styleDefaults']['y1Format']['converter'] : null;
    var y2Converter = (options['styleDefaults']['y2Format'] && options['styleDefaults']['y2Format']['converter']) ? options['styleDefaults']['y2Format']['converter'] : null;
    var zConverter  = (options['styleDefaults']['zFormat'] && options['styleDefaults']['zFormat']['converter']) ? options['styleDefaults']['zFormat']['converter'] : null;
    
    if(chart.getType() == "scatter" || chart.getType() == "bubble") {
      // Add the x and y values
      var xValue = Math.round(dataItem['x']*100)/100;
      var y1Value = Math.round(dataItem['y']*100)/100;
      if (x1Converter && x1Converter.getAsString && x1Converter.getAsObject)
	xValue = x1Converter.getAsString(dataItem['x']);
      if (y1Converter && y1Converter.getAsString && y1Converter.getAsObject)
	y1Value = y1Converter.getAsString(dataItem['y']);
      var labelX = bundle.getRBString(DvtChartBundle.LABEL_X, xValue, 'DvtChartBundle.LABEL_X');
      var labelY = bundle.getRBString(DvtChartBundle.LABEL_Y, y1Value, 'DvtChartBundle.LABEL_Y');
      arTooltip.push(labelX); 
      arTooltip.push(labelY);
      
      // Also add the z value for a bubble chart
      if(chart.getType() == "bubble") {
	var zValue = Math.round(dataItem.z*100)/100;
        if (zConverter && zConverter.getAsString && zConverter.getAsObject)
	  zValue = zConverter.getAsString(dataItem.z);
        var labelZ = bundle.getRBString(DvtChartBundle.LABEL_Z, zValue, 'DvtChartBundle.LABEL_Z');
        arTooltip.push(labelZ);
      }
    }
    else if(chart.getType() == "pie") {
      var pieValueConverter = options.styleDefaults.pieValueFormat ? options.styleDefaults.pieValueFormat.converter : null;
      var val = Math.round(DvtChartDataUtils.getValue(chart, seriesIndex, groupIndex)*100)/100;
      
      if (pieValueConverter && pieValueConverter.getAsString && pieValueConverter.getAsObject)
        val = pieValueConverter.getAsString(DvtChartDataUtils.getValue(chart, seriesIndex, groupIndex));
      var labelValue = bundle.getRBString(DvtChartBundle.LABEL_VALUE, val, 'DvtChartBundle.LABEL_VALUE');
      arTooltip.push(labelValue);
    }
    else // bar, line, area, combo
    {
      // Add the y value string
      var yValue = Math.round(DvtChartDataUtils.getValue(chart, seriesIndex, groupIndex)*100)/100;
      var yConverter = DvtChartDataUtils.isAssignedToY2(chart, seriesIndex) ? y2Converter : y1Converter;

      if (yConverter && yConverter.getAsString && yConverter.getAsObject)
        yValue = yConverter.getAsString(DvtChartDataUtils.getValue(chart, seriesIndex, groupIndex));
      var labelValue2 = bundle.getTranslatedString(DvtChartBundle.LABEL_VALUE, yValue, 'DvtChartBundle.LABEL_VALUE');
      arTooltip.push(labelValue2);
    }
  }
}

/**
 * Converts the lines of the tooltip into a single string.
 * @param {array} arTooltip The array of strings containing the lines of the tooltip.
 * @return {string} The resulting tooltip string.
 */
DvtChartTooltipUtils._convertLinesToString = function(arTooltip) {
  var ret = "";
  for(var i=0; i<arTooltip.length; i++) {
    if(ret.length > 0)
      ret += "\n";
  
    ret += arTooltip[i];
  }
  return ret;
}

/**
 * Utility functions for DvtChartImpl.
 * @class
 */
var DvtChartTypeUtils = new Object();

DvtObj.createSubclass(DvtChartTypeUtils, DvtObj, "DvtChartTypeUtils");

/**
 * Returns true if the chart is a spark.
 * @param {DvtChartImpl} chart
 * @return {boolean}
 */
DvtChartTypeUtils.isSpark = function(chart) {
  return chart.getOptions()['chart']['__spark'];
}

/**
 * Returns true if the chart is a combo type.
 * @param {DvtChartImpl} chart
 * @return {boolean}
 */
DvtChartTypeUtils.isCombo = function(chart) {
  return chart.getType() == "combo";
}

/**
 * Returns true if the chart is a horizontal type.
 * @param {DvtChartImpl} chart
 * @return {boolean}
 */
DvtChartTypeUtils.isHorizontal = function(chart) {
  return chart.getType() == "horizontalBar";
}

/**
 * Returns true if the chart series should be stacked.
 * @param {DvtChartImpl} chart
 * @return {boolean}
 */
DvtChartTypeUtils.isStacked = function(chart) {
  // To be stacked, the attribute must be set and the chart must be a supporting type.
  var options = chart.getOptions();
  if(options['chart']['stack'] != "on" || DvtChartDataUtils.hasMixedFrequency(chart))
    return false;

  var type = chart.getType();
  return type == "bar" || type == "line" || type == "area" || 
         type == "combo" || type == "horizontalBar";
}

/**
 * Returns true if the chart is a bar graph.
 * @param {DvtChartImpl} chart
 * @return {boolean}
 */
DvtChartTypeUtils.isBar = function(chart) {
  var type = chart.getType();
  return type == "bar" || type == "horizontalBar";
}

/**
 * Returns true if the chart is an line graph.
 * @param {DvtChartImpl} chart
 * @return {boolean}
 */
DvtChartTypeUtils.isLine = function(chart) {
  return chart.getType() == "line";
}

/**
 * Returns true if the chart is an area graph.
 * @param {DvtChartImpl} chart
 * @return {boolean}
 */
DvtChartTypeUtils.isArea = function(chart) {
  return chart.getType() == "area";
}

/**
 * Returns true if the chart is an scatter graph.
 * @param {DvtChartImpl} chart
 * @return {boolean}
 */
DvtChartTypeUtils.isScatter = function(chart) {
  return chart.getType() == "scatter";
}

/**
 * Returns true if the chart is an bubble graph.
 * @param {DvtChartImpl} chart
 * @return {boolean}
 */
DvtChartTypeUtils.isBubble = function(chart) {
  return chart.getType() == "bubble";
}

/**
 * Returns true if the chart is an pie graph.
 * @param {DvtChartImpl} chart
 * @return {boolean}
 */
DvtChartTypeUtils.isPie = function(chart) {
  return chart.getType() == "pie";
}

/**
 * Returns true if the chart supports dual-y.
 * @param {DvtChartImpl} chart
 * @return {boolean}
 */
DvtChartTypeUtils.isDualY = function(chart) {
  // Verify the chart type
  var type = chart.getType();
  if(!DvtChartTypeUtils.hasAxes(chart) || type == "scatter" || type == "bubble")
    return false;
    
  // Dual-Y
  return true;
}

/**
 * Returns true if the chart has axes.
 * @param {DvtChartImpl} chart
 * @return {boolean}
 */
DvtChartTypeUtils.hasAxes = function(chart) {
  return !(chart.getType() == "pie");
}

/**
 * Returns true if the chart has y2 data items.
 * @param {DvtChartImpl} chart
 * @param {string} type Optional series type to look for.
 * @return {boolean}
 */
DvtChartTypeUtils.hasY2Data = function(chart, type) { 
  if(!DvtChartTypeUtils.isDualY(chart))
    return false;
    
  // Verify the chart has a y2 series
  var data = chart.getData();
  var seriesCount = DvtChartDataUtils.getSeriesCount(chart);
  for(var i=0; i<seriesCount; i++) {
    if(type && DvtChartStyleUtils.getSeriesType(chart, i) != type)
      continue;
  
    if(data['series'][i]['assignedToY2']) // TODO add to ChartStyleUtils
      return true;
  }
  
  // No y2 value found
  return false;
}

/**
 * Returns true if the chart has y2 data items.
 * @param {DvtChartImpl} chart
 * @return {boolean}
 */
DvtChartTypeUtils.hasY2BarData = function(chart) { 
  return DvtChartTypeUtils.hasY2Data(chart, "bar");
}


/**
 * @param {DvtChartImpl} chart
 * @return {boolean} true if on of the series type is bar graph.
 */
DvtChartTypeUtils.hasBarSeries = function(chart) {
     
     if(DvtChartTypeUtils.isBar(chart)){
        return true;
     } else if(DvtChartTypeUtils.isCombo(chart)){     
         var seriesCount = DvtChartDataUtils.getSeriesCount(chart); 
        
         for(var seriesIndex = 0; seriesIndex < seriesCount; seriesIndex++) {
            // Ignore the series if it isn't rendered
            if(!DvtChartStyleUtils.isSeriesRendered(chart, seriesIndex)){
              continue;
            } else if(DvtChartStyleUtils.getSeriesType(chart, seriesIndex) == "bar") {
              return true;
            }
          } 
    }
    return false;
}

/**
 * Bubble chart utility functions for DvtChartImpl.
 * @class
 */
var DvtChartMarkerUtils = new Object();

DvtObj.createSubclass(DvtChartMarkerUtils, DvtObj, "DvtChartMarkerUtils");

/** @private */
DvtChartMarkerUtils._MIN_RADIUS = 5;
/** @private */
DvtChartMarkerUtils._MAX_RADIUS_PERCENT = 0.125;
/** @private */
DvtChartMarkerUtils._DEFAULT_MARKER_SIZE_PERCENT = .20;

/**
 * Calculates the bubble sizes for the chart.
 * @param {DvtChartImpl} chart
 * @param {number} width The width of the plot area.
 * @param {number} height The height of the plot area.
 */
DvtChartMarkerUtils.calcBubbleSizes = function (chart, width, height) {
  // Calculate the min and max z values
  var minMax = DvtChartAxisUtils.getMinMaxValue(chart, "z");
  var minValue = minMax['minValue'];
  var maxValue = minMax['maxValue'];
  
  // To approximate bubble radius in axis coordinate space instead of pixel used for auto axis extent calculation,
  // assume x and y axis includes 0. 
  var xMinMax = DvtChartAxisUtils.getMinMaxValue(chart, "x");
  var xAxisValueRange = Math.max(0, xMinMax['maxValue']) - Math.min(0, xMinMax['minValue']); // Assume we start from 0 for axis extents when auto calculating
  var yMinMax = DvtChartAxisUtils.getMinMaxValue(chart, "y");
  var yAxisValueRange = Math.max(0, yMinMax['maxValue']) - Math.min(0, yMinMax['minValue']);
  var options = chart.getOptions();
  var axisWidth = (1 - options['layout']['axisMaxSize']) * width; 
  var axisHeight = (1 - options['layout']['axisMaxSize']) * height;
  
  // Calculate the max allowed bubble sizes
  var minArea = Math.PI * Math.pow(DvtChartMarkerUtils._MIN_RADIUS, 2);
  var maxRadius = DvtChartMarkerUtils._MAX_RADIUS_PERCENT * Math.min(width, height);
  var maxArea = Math.PI * Math.pow(maxRadius, 2);
  
  // Adjust the min and max bubble sizes based on data distribution and count
  var minMaxArea = DvtChartMarkerUtils._adjustBubbleSizeRangeForCount(chart, minArea, maxArea, minValue, maxValue);
  minArea = minMaxArea['minArea'];
  maxArea = minMaxArea['maxArea'];

  // Adjust the min and max bubble sizes based on data range
  minMaxArea = DvtChartMarkerUtils._adjustBubbleSizeRangeForDataRange(chart, minArea, maxArea, minValue, maxValue);
  minArea = minMaxArea['minArea'];
  maxArea = minMaxArea['maxArea'];
  
  // Calculate bubble sizes based on min and max area
  var valueRange = maxValue - minValue;
  var areaRange = maxArea - minArea;
  
  // Loop through the data and update the sizes
  var data = chart.getData();
  var seriesCount = DvtChartDataUtils.getSeriesCount(chart);
  for (var seriesIndex = 0; seriesIndex < seriesCount; seriesIndex++) {
    var seriesItem = DvtChartDataUtils.getSeriesItem(chart, seriesIndex);
    var numGroups = seriesItem['data'] ? seriesItem['data'].length : 0;
    for (var j = 0;j < numGroups;j++) {
      var dataItem = seriesItem['data'][j];

      // If a z value exists, calculate and set the marker size
      if (dataItem && dataItem['z']) {
        // Marker size is calculated using the relative size fraction of the range.
        if (seriesCount === 1 && numGroups === 1) {
          dataItem['markerSize'] = DvtChartMarkerUtils._DEFAULT_MARKER_SIZE_PERCENT * Math.min(axisWidth, axisHeight);
          xAxisValueRange = xAxisValueRange === 0 ? 100 : xAxisValueRange;
          yAxisValueRange = yAxisValueRange === 0 ? 100 : yAxisValueRange;
        } else {
          var relSize = (dataItem['z'] - minValue) / valueRange;
          var area = minArea + (relSize * areaRange);
          dataItem['markerSize'] = 2 * Math.sqrt(area / Math.PI);
        }
        dataItem['_xAxisRadius'] = (dataItem['markerSize']/axisWidth) * 0.5 * xAxisValueRange;
        dataItem['_yAxisRadius'] = (dataItem['markerSize']/axisHeight) * 0.5 * yAxisValueRange;
      }
    }
  }
}

/**
 * Sorts the markers in order of descending marker size.
 * @param {array} markers The array of DvtMarkers.
 */
DvtChartMarkerUtils.sortMarkers = function (markers) {
  markers.sort(DvtChartMarkerUtils._compareSize);
}

/**
 * Compare function to sort markers in order of descending size.
 * @private
 */
DvtChartMarkerUtils._compareSize = function (a, b) {
  // We want to sort the markers from biggest to smallest
  var aSize = a.getSize();
  var bSize = b.getSize();
  if (aSize > bSize)
    return  - 1;
  else if (aSize < bSize)
    return 1;
  else 
    return 0;
}

/**
 * Adjust the min and max possible bubble sizes based on the number of bubbles
 * and the distribution of the data.
 * @param {DvtChartImpl} chart
 * @param {number} minArea The min bubble area
 * @param {number} maxArea The max bubble area
 * @param {number} minValue The bubble with the min z value.
 * @param {number} maxValue The bubble with the max z value.
 * @return {object} An object containing the minArea and the maxArea.
 * @private
 */
DvtChartMarkerUtils._adjustBubbleSizeRangeForCount = function (chart, minArea, maxArea, minValue, maxValue) {
  // Algorithm from JChart_2D_Scat.java
  // Calculate the bubble count and average relative size (area - minArea)/(areaRange)
  var bubbleCount = 0;
  var sizeTotal = 0;
  var data = chart.getData();
  var seriesCount = DvtChartDataUtils.getSeriesCount(chart);
  for (var seriesIndex = 0; seriesIndex < seriesCount; seriesIndex++) {
    var seriesItem = DvtChartDataUtils.getSeriesItem(chart, seriesIndex);
    var numDataItems = seriesItem['data'].length;
    for (var j = 0;j < numDataItems;j++) {
      var dataItem = seriesItem['data'][seriesIndex];
      if (dataItem && dataItem['z']) {
        bubbleCount++;
        sizeTotal += dataItem['z'];
      }
    }
  }

  var avgRelSize = ((sizeTotal / bubbleCount) - minValue) / (maxValue - minValue);

  ///////////////////////////////////////////////////////////////////
  // Reduce the max bubble size
  ///////////////////////////////////////////////////////////////////
  //The algorithm to reduce the max bubble size based on the number of bubbles looks
  //like the graph below.  If the number of bubbles is less than t1, the
  //first threshold, then no reduction occurs.  If the number of bubbles
  //is greater than t2, the second threshold, then the range of bubble sizes
  //is reduced to the floor percentage of the original range.  If the number of
  //bubbles is between t1 and t2, then the bubble size range is reduced by
  //a percentage of the original range.  
  //The data distribution affects the values of t1 and t2.  Each threshold has
  //a min and max associated with it.  The average relative value of the data, 
  //between 0 and 1, is used to determine the exact value of the thresholds
  //within their ranges.  The percentage reduction that occurs for each bubble 
  //between t1 and t2, p12, is equal to (1 - floor) / (t2 - t1).  
  // % original bubble size range
  //
  //           ^
  //           |
  //     100% -|------
  //           |      \ -p12
  //           |       \  |
  //           |        \
  //    floor -|         -------
  //           |                
  //          -|-----|---|------>   # of bubbles
  //           |     t1  t2
  //initialize the threshold ranges
  var t1Min = 15;
  var t1Max = 45;
  var t2Min = 30;
  var t2Max = 180;

  //initialize the floor value
  var floor = .15;

  //calculate the exact thresholds based on the ranges
  var t1 = t1Min + Math.floor((1.0 - avgRelSize) * (t1Max - t1Min));
  var t2 = t2Min + Math.floor((1.0 - avgRelSize) * (t2Max - t2Min));

  //determine the percentage reduction per bubble between t1 and t2
  var p12 = (1.0 - floor) / (t2 - t1);

  //if there are more than t2 bubbles, the range is reduced to the floor;
  //if there are more than t1 bubbles, the range is reduced by the
  //calculated percentage;
  //if there are fewer than t1 bubbles, no reduction occurs
  if (bubbleCount >= t2)
    maxArea = minArea + (floor * (maxArea - minArea));
  else if (bubbleCount >= t1)
    maxArea -= (p12 * (bubbleCount - t1) * (maxArea - minArea));

  ///////////////////////////////////////////////////////////////////
  // Increase the min bubble size
  ///////////////////////////////////////////////////////////////////
  //The algorithm to increase the min bubble size based on the number of bubbles looks
  //like the graph below.  If the number of bubbles is less than s1, the
  //first threshold, then the ceiling percentage of the range is used as the minimum
  //bubble size.  If the number of bubbles is greater than s2, the second threshold, 
  //then the min size is reduced to the absolute min of the original range.  
  //If the number of bubbles is between s1 and s2, then the min is increased by
  //a percentage of the original range.  
  //The data distribution affects the values of s1 and s2.  Each threshold has
  //a min and max associated with it.  The average relative value of the data, 
  //between 0 and 1, is used to determine the exact value of the thresholds
  //within their ranges.  The percentage reduction that occurs for each bubble 
  //between s1 and s2, q12, is equal to (ceil) / (s2 - s1).  
  // % original bubble size range
  //
  //           ^
  //           |
  //     ceil -|------
  //           |      \ -q12
  //           |       \  |
  //           |        \
  //       0% -|-----|---|------>   # of bubbles
  //           |     s1  s2
  //initialize the threshold ranges
  var s1Min = 5;
  var s1Max = 20;
  var s2Min = 30;
  var s2Max = 100;

  //initialize the ceiling value
  var ceil = .005;

  //calculate the exact thresholds based on the ranges
  var s1 = s1Min + Math.floor((1.0 - avgRelSize) * (s1Max - s1Min));
  var s2 = s2Min + Math.floor((1.0 - avgRelSize) * (s2Max - s2Min));

  //determine the percentage reduction per bubble between s1 and s2
  var q12 = (ceil) / (s2 - s1);

  //if there are more than s2 bubbles, the min is the original min;
  //if there are less than s1 bubbles, the min is increased by ceil% of the
  //original range;
  //if there are between s1 and s2 bubbles, the min is increased by the calculated
  //percentage between 0 and the ceiling
  if (bubbleCount < s1)
    minArea = minArea + (ceil * (maxArea - minArea));
  else if (bubbleCount < s2)
    minArea += ((ceil - (q12 * (bubbleCount - s1))) * (maxArea - minArea));

  return {'minArea' : minArea, 'maxArea' : maxArea};
}

/**
 * Adjust the min and max possible bubble sizes based on the number of bubbles
 * and the distribution of the data.
 * @param {DvtChartImpl} chart
 * @param {number} minArea The min bubble area
 * @param {number} maxArea The max bubble area
 * @param {number} minValue The bubble with the min z value.
 * @param {number} maxValue The bubble with the max z value.
 * @return {object} An object containing the minArea and the maxArea.
 * @private
 */
DvtChartMarkerUtils._adjustBubbleSizeRangeForDataRange = function (chart, minArea, maxArea, minValue, maxValue) {
  // Algorithm from JChart_2D_Scat.java
  //NOTE: bubble sizes should not be affected by the particular units of 
  //measurement used for the data; for instance, if the data is 1 - 100
  //or 10,000 - 1,000,000, then the ratio of max to min is 100:1 in 
  //both cases, so given similar data distributions the bubble sizes should
  //be similar
  // adjust the bubble size range based on the data range
  var dataRange = maxValue - minValue;

  //if there is only one bubble size, then there is no data range, and
  //therefore no reduction of bubble sizes
  if (dataRange != 0.0) {
    //the ratio of max / min bubble sizes
    var bubbleRatio = maxArea / minArea;

    //don't know how to handle the case where one value is 0, or where one value is
    //negative and the other is positive, so do not reduce bubble sizes in
    //that case
    var dataRatio = bubbleRatio;
    if (maxValue > 0 && minValue > 0)
      dataRatio = maxValue / minValue;
    else if (minValue < 0 && maxValue < 0)
      dataRatio = minValue / maxValue;

    if (dataRatio < bubbleRatio) {
      var desiredBubbleRatio = dataRatio;

      //NOTE: the reduction in bubble size range to produce the desired ratio
      //can be done either linearly or proportionally.  It is being done linearly 
      //because the bubble sizes end up being larger.
      //                //equiproportional reduction
      //                //The equation used to reduce the bubble size range to match the data range, if 
      //                //necessary, is as follows:
      //                // maxBubbleSize / buffer    
      //                //------------------------ = ratio
      //                // minBubbleSize * buffer    
      //                //
      //                //Solving for buffer:
      //                //
      //                //                     maxBubbleSize / minBubbleSize
      //                //buffer = Math.sqrt( -------------------------------) = Math.sqrt(bubbleRatio / ratio);
      //                //                                ratio
      //                double proportion = Math.sqrt(bubbleRatio / desiredBubbleRatio);
      //                minArea *= proportion;
      //                maxArea /= proportion;
      //equidistant reduction
      //The equation used to reduce the bubble size range to match the data range, if 
      //necessary, is as follows:
      //      maxBubbleSize
      //------------------------ = ratio
      // minBubbleSize + buffer    
      //
      //Solving for buffer:
      //
      //          maxBubbleSize
      //buffer = --------------- - minBubbleSize
      //              ratio
      var buffer = (maxArea / desiredBubbleRatio) - minArea;
      if (buffer > 0) {
        minArea += buffer;
      }
    }
  }
  else {
    //if dataRange is 0, meaning there is only one value (although there may be
    //multiple bubbles), then use the maximum bubble size
    minArea = maxArea;
  }

  return {'minArea' : minArea, 'maxArea' : maxArea};
}

/**
 * Utility functions for pie chart.
 * @class
 */
var DvtPieChartUtils = new Object();

DvtObj.createSubclass(DvtPieChartUtils, DvtObj, "DvtPieChartUtils");

DvtPieChartUtils.OTHER_SLICE_SERIES_ID = "_dvtOther";

/**
 * Generates the slice ID of a pie series
 * @param {DvtChartImpl} chart The pie chart
 * @param {Number} seriesIndex The series index
 * @return {DvtChartDataItem} The slice ID
 */
DvtPieChartUtils.getSliceId = function(chart, seriesIndex) {
  var dataItem = DvtChartDataUtils.getDataItem(chart, seriesIndex, 0);
  var id = dataItem ? dataItem['id'] : null;
  var series = DvtChartDataUtils.getSeries(chart, seriesIndex);
  var group = DvtChartDataUtils.getGroup(chart, 0);
  return new DvtChartDataItem(id, series, group);
}

/**
 * Generates the slice ID of a pie "Other" series
 * @param {DvtChartImpl} chart The pie chart
 * @return {DvtChartDataItem} The slice ID
 */
DvtPieChartUtils.getOtherSliceId = function(chart) {
  var group = DvtChartDataUtils.getGroup(chart, 0);
  return new DvtChartDataItem(null, DvtPieChartUtils.OTHER_SLICE_SERIES_ID, group);
}

/**
 * Returns an array of series indices that will be rendered on the pie chart.
 * The array is sorted if sorting is enabled, and does not include the series that will be grouped under "Other" slice.
 * The array includes hidden series and series with non-positive values.
 * @param {DvtChartImpl} chart The pie chart
 * @return {Array} The array containing series indices
 */
DvtPieChartUtils.getRenderedSeriesIndices = function(chart) {
  return DvtPieChartUtils._getSeriesIndicesArrays(chart).rendered;
}

/**
 * Returns whether the pie has at least one series (visible or hidden) that is grouped under "Other".
 * @param {DvtChartImpl} chart The pie chart
 * @return {Boolean}
 */
DvtPieChartUtils.hasOtherSeries = function(chart) {
  return DvtPieChartUtils._getSeriesIndicesArrays(chart).other.length > 0;
}

/**
 * Computes the total value of the "Other" slice. Only includes visible series with positive values.
 * @param {DvtChartImpl} chart The pie chart
 * @return {Number} The total value
 */
DvtPieChartUtils.getOtherValue = function(chart) {
  var otherSeries = DvtPieChartUtils._getSeriesIndicesArrays(chart).other;
  var otherValue = 0;
  for (var i = 0; i < otherSeries.length; i++) {
    var seriesIndex = otherSeries[i];
    // Only add the values of visible series
    if(DvtChartStyleUtils.isSeriesRendered(chart, seriesIndex)) {
      var value = DvtChartDataUtils.getValue(chart, seriesIndex, 0);
      if (value > 0)
        otherValue += value;
    }
  }
  return otherValue;
}

/**
 * Generates the slice IDs of the series that are grouped under "Other".
 * @param {DvtChartImpl} chart The pie chart
 * @return {Array} The array containing slice IDs
 */
DvtPieChartUtils.getOtherSliceIds = function(chart) {
  var otherSeries = DvtPieChartUtils._getSeriesIndicesArrays(chart).other;
  var seriesIds = [];
  for (var i = 0; i < otherSeries.length; i++) {
    var seriesIndex = otherSeries[i];
    seriesIds.push(DvtPieChartUtils.getSliceId(chart, seriesIndex));
  }
  return seriesIds;
}

/**
 * Returns the visibility of the "Other" slice. The "Other" slice is visible if at least one of the series in it is 
 * visible.
 * @param {DvtChartImpl} chart The pie chart
 * @return {String} The visibility of the "Other" slice
 */
DvtPieChartUtils.getOtherSliceVisibility = function(chart) {
  var otherSeries = DvtPieChartUtils._getSeriesIndicesArrays(chart).other;
  
  for (var i = 0; i < otherSeries.length; i++) {
    var seriesIndex = otherSeries[i];
    if (DvtChartStyleUtils.isSeriesRendered(chart, seriesIndex))
      return "visible";
  }
  
  return "hidden";
}

/**
 * Sets the visibility of the "Other" slice. The visibility of all the series in "Other" will be set to the visibility
 * of the "Other" slice.
 * @param {DvtChartImpl} chart The pie chart
 * @param {String} visibility The visibility of the "Other" slice
 */
DvtPieChartUtils.setOtherSliceVisibility = function(chart, visibility) {
  var otherSeries = DvtPieChartUtils._getSeriesIndicesArrays(chart).other;
  
  for (var i = 0; i < otherSeries.length; i++) {
    var seriesIndex = otherSeries[i];
    var seriesItem = DvtChartDataUtils.getSeriesItem(chart, seriesIndex);
    seriesItem['visibility'] = visibility;
  }
}

/**
 * Computes the number of visible slices in the pie. "Other" slice is counted as one slice.
 * @param {DvtChartImpl} chart The pie chart
 * @param {Number} The number of visible slices
 */
DvtPieChartUtils.getNumVisibleSlices = function(chart) {
  var numVis = 0;
  var renderedSeries = DvtPieChartUtils._getSeriesIndicesArrays(chart).rendered;
  
  for (var i = 0; i < renderedSeries.length; i++) {
    var seriesIndex = renderedSeries[i];
    if (DvtChartStyleUtils.isSeriesRendered(chart, seriesIndex))
      numVis++;
  }
  
  if (DvtPieChartUtils.getOtherSliceVisibility(chart) === "visible")
    numVis++;
  
  return numVis;
}

/**
 * Returns whether the "Other" slice is selected. It is selected if all the series in it are selected.
 * @param {DvtChartImpl} chart The pie chart
 * @param {Array} selected An array containing the ID objects of the selected slices.
 * @return {Boolean} Whether the "Other" slice is selected
 */
DvtPieChartUtils.isOtherSliceSelected = function(chart, selected) {
  var otherIds = DvtPieChartUtils.getOtherSliceIds(chart);
  
  for (var j = 0; j < otherIds.length; j++) {
    var sliceId = otherIds[j];
    var sliceSelected = false;
    
    // Check if this slice is in the selected list
    for (var i = 0; i < selected.length; i++) {
      if ((selected[i]['id'] && sliceId.getId() === selected[i]['id']) ||
          (sliceId.getSeries() === selected[i]['series'] && sliceId.getGroup() === selected[i]['group'])) {
        sliceSelected = true;
        break;
      }
    }
    
    if (!sliceSelected)
      return false;
  }
  
  return true;
}

/**
 * Divides the series indices into two arrays. The first array contains the series that are not grouped under "Other",
 * sorted by value if sorting is enabled. The second array contains the series that belongs to "Other". The arrays
 * include hidden series and series with non-positive values.
 * @param {DvtChartImpl} chart The pie chart
 * @return {Object} An object in the form {rendered: firstArray, other: secondArray}. firstArray and secondArray are
 *     as described above.
 * @private
 */
DvtPieChartUtils._getSeriesIndicesArrays = function(chart) {
  var renderedSeries = [];
  var otherSeries = [];
  
  var seriesCount = DvtChartDataUtils.getSeriesCount(chart);
  var options = chart.getOptions();
  var otherThreshold = options['chart']['otherThreshold'] * DvtPieChartUtils.getTotalValue(chart);
  
  for (var seriesIndex = 0; seriesIndex < seriesCount; seriesIndex++) {
    // Skip the series if its value is 0 or negative  
    var value = DvtChartDataUtils.getValue(chart, seriesIndex, 0);
    
    // Do not use "Other" if the threshold is zero
    if (otherThreshold > 0 && value < otherThreshold)
      otherSeries.push(seriesIndex);
    else
      renderedSeries.push(seriesIndex);
  }
  
  // Sort the slices if enabled
  if (options['chart']['sorting'] == "on") {
    renderedSeries.sort(function(a,b){
      return DvtChartDataUtils.getValue(chart, b, 0) - DvtChartDataUtils.getValue(chart, a, 0);
    });
  }
  
  return {rendered: renderedSeries, other: otherSeries};
}

/**
 * Computes the total value of a pie chart, including hidden series.
 * @param {DvtChartImpl} chart The pie chart.
 */
DvtPieChartUtils.getTotalValue = function(chart) {
  var seriesCount = DvtChartDataUtils.getSeriesCount(chart);
  var totalValue = 0;
  
  for (var seriesIndex = 0;seriesIndex < seriesCount;seriesIndex++) {
    // Skip the series if its value is 0 or negative
    var value = DvtChartDataUtils.getValue(chart, seriesIndex, 0);
    if(value > 0) { 
      totalValue += value;
    } 
  }
  
  return totalValue; 
}

/**
 * Renderer for DvtChartImpl.
 * @class
 */
var DvtChartRenderer = new Object();

DvtObj.createSubclass(DvtChartRenderer, DvtObj, "DvtChartRenderer");

/** @private */
DvtChartRenderer._EMPTY_TEXT_GAP_WIDTH = 2;
DvtChartRenderer._EMPTY_TEXT_GAP_HEIGHT = 1;

/**
 * Renders the chart contents into the available space.
 * @param {DvtChartImpl} chart The chart being rendered.
 * @param {DvtContainer} container The container to render into.
 * @param {DvtRectangle} availSpace The available space.
 */
DvtChartRenderer.render = function(chart, container, availSpace) {
  DvtChartRenderer._renderBackground(chart, container, availSpace); 
  
  if(DvtChartDataUtils.hasData(chart)) {
    // Layout and draw the contents.  Each render call will update availSpace.
    // 1. Fixed space items: Titles and title separator
    // 2. Variable size: Legend and Axes
    // 3. Remaining space: Plot Area
    DvtChartRenderer._renderTitles(chart, container, availSpace); 
    DvtChartLegendRenderer.render(chart, container, availSpace);
    DvtChartAxisRenderer.render(chart, container, availSpace);
    DvtChartRenderer._renderPlotArea(chart, container, availSpace);
  }
  else // Render the empty text
    DvtChartRenderer._renderEmptyText(chart, container, availSpace);
}

/**
 * Renders the chart background.
 * @param {DvtChartImpl} chart The chart being rendered.
 * @param {DvtContainer} container The container to render into.
 * @param {DvtRectangle} availSpace The available space.
 */
DvtChartRenderer._renderBackground = function(chart, container, availSpace) {
  var data = chart.getData();
  var options = chart.getOptions();
  
  // Chart background
  var rect = new DvtRect(chart.getContext(), availSpace.x, availSpace.y, availSpace.w, availSpace.h);
  container.addChild(rect);
  if(options['chart']['backgroundColor'])
    rect.setFill(new DvtSolidFill(options['chart']['backgroundColor']));
  else
    rect.setFill(new DvtSolidFill("#000000", 0.001));
  
  // WAI-ARIA
  rect.setAriaRole('img');
  rect.setAriaProperty('label', data['shortDesc']);
}

/**
 * Renders the chart titles and updates the available space.
 * @param {DvtChartImpl} chart The chart being rendered.
 * @param {DvtContainer} container The container to render into.
 * @param {DvtRectangle} availSpace The available space.
 */
DvtChartRenderer._renderTitles = function(chart, container, availSpace) {
  var data = chart.getData();
  var options = chart.getOptions();
  
  // Allocate outer gaps
  var gapWidth = DvtChartDefaults.getGapSize(chart, options['layout']['outerGapWidth']);
  var gapHeight = DvtChartDefaults.getGapSize(chart, options['layout']['outerGapHeight']);
  availSpace.x += gapWidth;
  availSpace.w -= 2*gapWidth;
  availSpace.y += gapHeight;
  availSpace.h -= 2*gapHeight;
  
  // Title
  if(data['title']) {
    var titleObj = DvtChartTextUtils.createText(chart.getEventManager(), container, data['title'], options['title']['style'], availSpace.x, availSpace.y, availSpace.w, availSpace.h);
    
    var titleHeight;
    var titleDims;
    if (titleObj) {
      DvtLayoutUtils.alignTextStart(titleObj);
      
      // Calc the dimensions to figure out remaining space
      titleDims = titleObj.getDimensions();
      var titleGapBelow = options['titleSeparator']['rendered'] ? options['layout']['titleSeparatorGap'] : options['layout']['titlePlotAreaGap'];
      titleHeight = titleDims.h + DvtChartDefaults.getGapSize(chart, titleGapBelow);
    } else {
      titleHeight = 0;
      titleDims = new DvtRectangle(0, 0, 0, 0);
    }
    
    // Subtitle
    if(data['subtitle']) {
      var subtitleObj = new DvtText(chart.getContext(), data['subtitle'], availSpace.x, availSpace.y);
      subtitleObj.setCSSStyle(new DvtCSSStyle(options['subtitle']['style']));
      DvtLayoutUtils.alignTextStart(subtitleObj);
      container.addChild(subtitleObj);
      var subtitleDims = subtitleObj.getDimensions();
      
      // Check to see if subtitle and title fit on the same line. If not, put subtitle on next line
      var titleSubtitleGap = DvtChartDefaults.getGapSize(chart, options['layout']['titleSubtitleGapWidth']);
      var titleSpace = titleDims.w + titleSubtitleGap + subtitleDims.w;
      if (titleSpace > availSpace.w) {
        subtitleObj.setY(availSpace.y + titleHeight);
        var fullSubtitle = subtitleObj.getTextString();
        container.removeChild(subtitleObj);
        subtitleObj = subtitleObj.truncateToSpace(chart, availSpace.w, availSpace.h);
        
        if (subtitleObj) {
          DvtLayoutUtils.alignTextStart(subtitleObj);
          container.addChild(subtitleObj);
          // Add tooltip if needed
          if (fullSubtitle.length > subtitleObj.getTextString().length)
            chart.getEventManager().associate(subtitleObj, new DvtSimpleObjPeer(fullSubtitle));
          
          subtitleDims = subtitleObj.getDimensions();
          titleHeight += subtitleDims.h;
          if(DvtStyleUtils.isLocaleR2L()) {
            if (subtitleObj)
              subtitleObj.setX(availSpace.w - subtitleDims.w);
            if (titleObj)
              titleObj.setX(availSpace.w - titleDims.w);
          }
        }
      } else {
        var alignTextBottomsDiff = titleDims.h - subtitleDims.h;
        subtitleObj.setY(alignTextBottomsDiff + availSpace.y);
        DvtLayoutUtils.align(availSpace, options['title']['hAlign'], titleObj, titleSpace);
        // Adjust the positions based on locale
        if(DvtStyleUtils.isLocaleR2L()) {
          subtitleObj.setX(titleObj.getX());
          if (titleObj)
            titleObj.setX(titleObj.getX() + subtitleDims.w + titleSubtitleGap);
        }
        else {
          subtitleObj.setX(titleObj.getX() + titleSpace - subtitleDims.w);
        }
      }
      
      // WAI-ARIA
      subtitleObj.setAriaProperty('hidden', null);
    }
    else {
      DvtLayoutUtils.align(availSpace, options['title']['hAlign'], titleObj, titleDims.w)
    }
    
    // WAI-ARIA
    titleObj.setAriaProperty('hidden', null);
    
    // Update available space
    availSpace.y += titleHeight;
    availSpace.h -= titleHeight;
    
    // Title Separator
    if(options['titleSeparator']['rendered']) {
      var upperSepObj = new DvtLine(chart.getContext(), availSpace.x, availSpace.y, availSpace.x + availSpace.w, availSpace.y)
      var lowerSepObj = new DvtLine(chart.getContext(), availSpace.x, availSpace.y+1, availSpace.x + availSpace.w, availSpace.y+1)
      upperSepObj.setStroke(new DvtSolidStroke(options['titleSeparator']['upperColor']));
      lowerSepObj.setStroke(new DvtSolidStroke(options['titleSeparator']['lowerColor']));
      container.addChild(upperSepObj);
      container.addChild(lowerSepObj);
      
      // Remove the title separator and gap height from available space
      var titleSepHeight = 2 + DvtChartDefaults.getGapSize(chart, options['layout']['titlePlotAreaGap']);
      availSpace.y += titleSepHeight;
      availSpace.h -= titleSepHeight;
    }
  }
  
  // Footnote
  if(data['footnote']) {
    var footnoteObj = DvtChartTextUtils.createText(chart.getEventManager(), container, data['footnote'], options['footnote']['style'], availSpace.x, 0, availSpace.w, availSpace.h) 
    if (footnoteObj) {
      // Get height and reposition at correct location
      var footnoteDims = footnoteObj.getDimensions();
      footnoteObj.setY(availSpace.y + availSpace.h - footnoteDims.h);
      availSpace.h -= (footnoteDims.h + DvtChartDefaults.getGapSize(chart, options['layout']['footnoteGap']));
      DvtLayoutUtils.alignTextStart(footnoteObj);
      DvtLayoutUtils.align(availSpace, options['footnote']['hAlign'], footnoteObj, footnoteDims.w);
      
      // WAI-ARIA
      footnoteObj.setAriaProperty('hidden', null);
    }
  }
}

/**
 * Renders plot area. 
 * @param {DvtChartImpl} chart The chart being rendered.
 * @param {DvtContainer} container The container to render into.
 * @param {DvtRectangle} availSpace The available space.
 */
DvtChartRenderer._renderPlotArea = function(chart, container, availSpace) {
  if(DvtChartTypeUtils.hasAxes(chart)) {
    // Create a container for the plot area contents
    var plotArea = new DvtContainer(chart.getContext());
    plotArea.setTranslateX(availSpace.x);
    plotArea.setTranslateY(availSpace.y);
    container.addChild(plotArea);
    chart.setPlotArea(plotArea) ;  
    // Render the plot area contents
    var plotAreaBounds = new DvtRectangle(0, 0, availSpace.w, availSpace.h);
    DvtPlotAreaRenderer.render(chart, plotArea, plotAreaBounds);
  } else {
    DvtPieRenderer.render(chart, container, availSpace);
  }
  
  // All space is now used
  availSpace.w = 0;
  availSpace.h = 0;
}

/**
 * Renders the empty text for the component. 
 * @param {DvtChartImpl} chart The chart being rendered.
 * @param {DvtContainer} container The container to render into.
 * @param {DvtRectangle} availSpace The available space.
 */
DvtChartRenderer._renderEmptyText = function(chart, container, availSpace) {
  // Get the empty text string
  var options = chart.getOptions();
  var emptyTextStr = options['chart']['emptyText'];
  if(!emptyTextStr) {
    emptyTextStr = chart.getBundle().getRBString(DvtChartBundle.EMPTY_TEXT, null, 'DvtChartBundle.EMPTY_TEXT');
  }
  // Calculate the alignment point and available space
  var x = availSpace.x + availSpace.w/2;
  var y = availSpace.y + availSpace.h/2;
  var width = availSpace.w - 2*DvtChartRenderer._EMPTY_TEXT_GAP_WIDTH;
  var height = availSpace.h - 2*DvtChartRenderer._EMPTY_TEXT_GAP_HEIGHT;

  // Create and position the text
  var text = new DvtText(chart.getContext(), emptyTextStr, x, y);
  text.setCSSStyle(new DvtCSSStyle(options['title']['style']));
  text.alignMiddle();
  text.alignCenter();
  text = text.truncateToSpace(container, width, height);
  container.addChild(text);
  
  // WAI-ARIA
  text.setAriaProperty('hidden', null);
}

/**
 * Performs layout and positioning for the chart axes.
 * @class
 */
var DvtChartAxisRenderer = new Object();

DvtObj.createSubclass(DvtChartAxisRenderer, DvtObj, "DvtChartAxisRenderer");

/** @private */
DvtChartAxisRenderer._CHART_AXIS_BUFFER = 14;

/**
 * @this {DvtChartAxisRenderer}
 * Renders axes and updates the available space.
 * @param {DvtChartImpl} chart The chart being rendered.
 * @param {DvtContainer} container The container to render into.
 * @param {DvtRectangle} availSpace The available space.
 */
DvtChartAxisRenderer.render = function(chart, container, availSpace) {
  if(!DvtChartTypeUtils.hasAxes(chart))
    return;
    
  // Add some buffer to the axis
  // The availSpace for the plotArea is updated also
  availSpace.w -= DvtChartDefaults.getGapSize(chart, DvtChartAxisRenderer._CHART_AXIS_BUFFER);
  
  // TODO BUBBLE GRAPH MOVE THIS!
  if(chart.getType() == "bubble")
    DvtChartMarkerUtils.calcBubbleSizes(chart, availSpace.w, availSpace.h);
  
  // Layout Algorithm
  // 1. Get preferred size of y axes and allocate space.
  // 2. Get preferred size of x axis and allocate space.
  // 3. Update y axes with reduced size (due to x axis)
  // This is done because x axis labels tend to be more important for identifying data,
  // such as with a categorical axis.
  
  // Calculate the gaps, which need to be added in addition to axis size
  var options = chart.getOptions();
  var gapWidth = DvtChartDefaults.getGapSize(chart, options['layout']['tickLabelGapWidth']);
  var gapHeight = DvtChartDefaults.getGapSize(chart, options['layout']['tickLabelGapHeight']);
  var isHorizGraph = DvtChartTypeUtils.isHorizontal(chart);
  var xGap = isHorizGraph ? gapWidth : gapHeight;
  var yGap = isHorizGraph ? gapHeight : gapWidth;
  
  // Get preferred sizing for the y axes
  var yAxisInfo = DvtChartAxisRenderer._createYAxis(chart, container, availSpace);
  var y2AxisInfo = DvtChartAxisRenderer._createY2Axis(chart, container, availSpace);
  
  // Position the axes to reserve space
  DvtLayoutUtils.position(availSpace, yAxisInfo.position, yAxisInfo.axis, yAxisInfo.width, yAxisInfo.height, yGap);
  
  if(y2AxisInfo) {
    DvtLayoutUtils.position(availSpace, y2AxisInfo.position, y2AxisInfo.axis, y2AxisInfo.width, y2AxisInfo.height, yGap);
  }
  
  // After positioning the y axis, the available space can change so we need to recalculate bubble sizes
  if(chart.getType() == "bubble")
    DvtChartMarkerUtils.calcBubbleSizes(chart, availSpace.w, availSpace.h);
    
  // Spark Bar Spacing Support
  if(DvtChartStyleUtils.getBarSpacing(chart) == "pixel" && DvtChartTypeUtils.isBar(chart)) {
    var numGroups = DvtChartDataUtils.getGroupCount(chart);
  
    // Adjust the width so that it's an even multiple of the number of groups
    if(availSpace.w > numGroups) {
      var newWidth = Math.floor(availSpace.w/numGroups)*numGroups;
      availSpace.x += (availSpace.w - newWidth)/2;
      availSpace.w = newWidth;
    }
  }
  
  // Get preferred sizing for the x axes, render, and position.
  var xAxisInfo = DvtChartAxisRenderer._createXAxis(chart, container, availSpace);
  xAxisInfo.axis.render(xAxisInfo.data, xAxisInfo.width, xAxisInfo.height);  
  DvtLayoutUtils.position(availSpace, xAxisInfo.position, xAxisInfo.axis, xAxisInfo.width, xAxisInfo.height, xGap);
  
  // Adjust the y-axis sizes to account for the x-axis and render them
  if(isHorizGraph) {
    yAxisInfo.axis.setTranslateX(availSpace.x);
    yAxisInfo.axis.render(yAxisInfo.data, availSpace.w, yAxisInfo.height);
    
    if(y2AxisInfo) {
      this._alignYAxes(yAxisInfo.axis, y2AxisInfo.axis, options);
      y2AxisInfo.axis.setTranslateX(availSpace.x);
      y2AxisInfo.axis.render(y2AxisInfo.data, availSpace.w, y2AxisInfo.height);
    }
  } else {
    yAxisInfo.axis.render(yAxisInfo.data, yAxisInfo.width, availSpace.h);

    if(y2AxisInfo) {
      this._alignYAxes(yAxisInfo.axis, y2AxisInfo.axis, options);
      y2AxisInfo.axis.render(y2AxisInfo.data, y2AxisInfo.width, availSpace.h);
    }
  }
  
  // Store the axis objects on the chart
  chart.xAxis = xAxisInfo.axis;
  chart.yAxis = yAxisInfo.axis;
  chart.y2Axis = y2AxisInfo ? y2AxisInfo.axis : null;
}

/**
 * Returns an object containing the x-axis with its position and preferred size.
 * @param {DvtChartImpl} chart The chart being rendered.
 * @param {DvtContainer} container The container to render into.
 * @param {DvtRectangle} availSpace The available space.
 * @return {object}
 * @private
 */
DvtChartAxisRenderer._createXAxis = function(chart, container, availSpace) {
  var data = chart.getData();
  var options = chart.getOptions();  

  var position = DvtChartAxisUtils.getXAxisPosition(chart);
  
  // Clone the axis options and fill with data info
  var axisOptions = DvtJSONUtils.clone(options['xAxis']);
  axisOptions['layout']['gapRatio'] = chart.getGapRatio();
  axisOptions['position'] = position;
  axisOptions['scaledFromBaseline'] = options['xAxis']['scaledFromBaseline'];
  
  // Calc the data object and pass in the min and max data values for that axis
  var axisData = {};
  axisData['title'] = data['xAxis'] ? data['xAxis']['title'] : null;
  axisData['groups'] = data['groups'];
  axisData['timeAxisType'] = data['timeAxisType'] ? data['timeAxisType'] : "disabled";
  
  var timeAxisDisabled = axisData['timeAxisType'] == "disabled"; 
  
  // Data Axis Support
  if(!DvtChartAxisUtils.hasGroupAxis(chart) || !timeAxisDisabled) {
    var dataValues = DvtChartAxisUtils.getMinMaxValue(chart, "x");
    axisData['minDataValue'] = dataValues['minValue'];
    axisData['maxDataValue'] = dataValues['maxValue'];
  }
    
  // Add a group axis offset if needed
  axisOptions['startGroupOffset'] = DvtChartAxisUtils.getGroupAxisOffset(chart);
  axisOptions['endGroupOffset'] = DvtChartAxisUtils.getGroupAxisOffset(chart);
  
  // Create the x-axis
  var axis = new DvtChartAxis(chart.getContext(), null, null, axisOptions);
  container.addChild(axis);
  
  // Layout the axis and find the size
  var isHoriz = (position == "top" || position == "bottom");
  var maxWidth = isHoriz ? availSpace.w : options['layout']['axisMaxSize'] * availSpace.w;
  var maxHeight = isHoriz ? options['layout']['axisMaxSize'] * availSpace.h : availSpace.h;
  var actualSize = axis.getPreferredSize(axisData, maxWidth, maxHeight);
  
  if(!timeAxisDisabled && DvtChartTypeUtils.hasBarSeries(chart)){
     // there has to be set some offset to prevent colission of columns on bar chart with
     // legend and y axis   
     axisOptions['startGroupOffset'] += DvtChartAxisRenderer._getOffsetForBarChart(chart, axis, axisOptions, isHoriz);    
     axisOptions['endGroupOffset'] += DvtChartAxisRenderer._getOffsetForBarChart(chart, axis, axisOptions, isHoriz);  
     
     // we need to reinitialize axis with new offset properties
     axis.Init(chart.getContext(), null, null, axisOptions);
     actualSize = axis.getPreferredSize(axisData, maxWidth, maxHeight);   
  }     
  
  return {'axis': axis, 'data': axisData, 'position': position, 'width': actualSize.width, 'height': actualSize.height};
}

/**
 * @param {DvtChartImpl} chart The chart being rendered.
 * @param {DvtChartAxis} axis current xAxis for which this function calculates offset.
 * @param {Object} options set of axis options.
 * @param {boolean} horizontal chart allignment.
 * @return {number} gap between y axis and first bar on chart
 * @private
 */
DvtChartAxisRenderer._getOffsetForBarChart = function(chart, axis, options, horizontal){
    
    var gapWidth = DvtChartDefaults.getGapSize(chart, options['layout']['tickLabelGapWidth']);
    var gapHeight = DvtChartDefaults.getGapSize(chart, options['layout']['tickLabelGapHeight']);
 
    var xGap = horizontal ? gapWidth : gapHeight;
  
    if(isNaN(xGap)) {
      xGap = 0;
    }
    
    // we need to get width of whole group and divide it by two to get
    // proper offset from sides 
    var barWidth;
                   
    if(DvtChartTypeUtils.isStacked(chart) || DvtChartDataUtils.hasMixedFrequency(chart)){
       var barSeriesCount = DvtChartDataUtils.getSeriesCount(chart);
       barWidth = DvtChartStyleUtils.getBarWidth(chart, barSeriesCount, axis);
    }  else {       
       barWidth = axis.getGroupWidth() / 2;
    }
    
    return xGap + barWidth;
}

/**
 * Returns an object containing the y-axis with its position and preferred size.
 * @param {DvtChartImpl} chart The chart being rendered.
 * @param {DvtContainer} container The container to render into.
 * @param {DvtRectangle} availSpace The available space.
 * @return {object}
 * @private
 */
DvtChartAxisRenderer._createYAxis = function(chart, container, availSpace) {
  var data = chart.getData();
  var options = chart.getOptions();  
  
  var position = DvtChartAxisUtils.getYAxisPosition(chart);
  
  // Clone the axis options and fill with data info
  var axisOptions = DvtJSONUtils.clone(options['yAxis']);
  axisOptions['layout']['gapRatio'] = chart.getGapRatio();
  axisOptions['position'] = position;
  axisOptions['scaledFromBaseline'] = options['yAxis']['scaledFromBaseline'];
  
  // Calc the data object and pass in the min and max data values for that axis
  var axisData = {};
  var dataValues = DvtChartAxisUtils.getMinMaxValue(chart, "y");
  axisData['minDataValue'] = dataValues['minValue'];
  axisData['maxDataValue'] = dataValues['maxValue'];
  axisData['title'] = data['yAxis'] ? data['yAxis']['title'] : null;
  axisData['timeAxisType'] = "disabled";
  
  // Create the axis and add to the display list for calc and rendering
  var axis = new DvtChartAxis(chart.getContext(), null, null, axisOptions);
  container.addChild(axis);
  
  // Layout the axis and find the size
  var isHoriz = (position == "top" || position == "bottom");
  var maxWidth = isHoriz ? availSpace.w : options['layout']['axisMaxSize'] * availSpace.w;
  var maxHeight = isHoriz ? options['layout']['axisMaxSize'] * availSpace.h : availSpace.h;
  var actualSize = axis.getPreferredSize(axisData, maxWidth, maxHeight);
  return {'axis': axis, 'data': axisData, 'position': position, 'width': actualSize.width, 'height': actualSize.height};
}

/**
 * Returns an object containing the y2-axis with its position and preferred size.
 * @param {DvtChartImpl} chart The chart being rendered.
 * @param {DvtContainer} container The container to render into.
 * @param {DvtRectangle} availSpace The available space.
 * @return {object}
 * @private
 */
DvtChartAxisRenderer._createY2Axis = function(chart, container, availSpace) {
  var data = chart.getData();
  var options = chart.getOptions();
  
  // Check that the graph has y2-axis data
  if(!DvtChartTypeUtils.hasY2Data(chart))
    return;
    
  var position = DvtChartAxisUtils.getY2AxisPosition(chart);
  
  // Clone the axis options and fill with data info
  var axisOptions = DvtJSONUtils.clone(options.y2Axis);
  axisOptions['layout']['gapRatio'] = chart.getGapRatio();
  axisOptions['position'] = position;
  axisOptions['scaledFromBaseline'] = options.y2Axis['scaledFromBaseline'];
  
  // Calc the data object and pass in the min and max data values for that axis
  var axisData = {};
  var dataValues = DvtChartAxisUtils.getMinMaxValue(chart, "y2");
  axisData['minDataValue'] = dataValues['minValue'];
  axisData['maxDataValue'] = dataValues['maxValue'];
  axisData['title'] = data['y2Axis'] ? data['y2Axis']['title'] : null;
  axisData['timeAxisType'] = "disabled";
   
  // Create the axis and add to the display list for calc and rendering
  var axis = new DvtChartAxis(chart.getContext(), null, null, axisOptions);
  container.addChild(axis);
  
  // Layout the axis and find the size
  var isHoriz = (position == "top" || position == "bottom");
  var maxWidth = isHoriz ? availSpace.w : options['layout']['axisMaxSize'] * availSpace.w;
  var maxHeight = isHoriz ? options['layout']['axisMaxSize'] * availSpace.h : availSpace.h;
  var actualSize = axis.getPreferredSize(axisData, maxWidth, maxHeight);
  return {'axis': axis, 'data': axisData, 'position': position, 'width': actualSize.width, 'height': actualSize.height};
}

/**
 * Algins Y1 and Y2 axes gridlines if needed.
 * @param {DvtAxis} yAxis The Y1 axis object.
 * @param {DvtAxis} y2Axis The Y2 axis object.
 * @param {object} options The options object for the chart.
 * @protected
 */
DvtChartAxisRenderer._alignYAxes = function(yAxis, y2Axis, options) {
  var majorTickCount = yAxis.getMajorTickCount();
  var minorTickCount = yAxis.getMinorTickCount();
  if (options.y2Axis.alignTickMarks && options.y2Axis.majorIncrement == null) {
    y2Axis.setMajorTickCount(majorTickCount);
    y2Axis.setMinorTickCount(minorTickCount);
    var y2AxisOptions = y2Axis.getOptions();
    y2AxisOptions.majorIncrement = y2Axis.getMajorIncrement();
    y2AxisOptions.minorIncrement = y2Axis.getMinorIncrement();
  }
}

/**
 * Performs layout and positioning for the chart legend.
 * @class
 */
var DvtChartLegendRenderer = new Object();

DvtObj.createSubclass(DvtChartLegendRenderer, DvtObj, "DvtChartLegendRenderer");

/**
 * Renders legend and updates the available space.
 * @param {DvtChartImpl} chart The chart being rendered.
 * @param {DvtContainer} container The container to render into.
 * @param {DvtRectangle} availSpace The available space.
 */
DvtChartLegendRenderer.render = function(chart, container, availSpace) {
  var options = chart.getOptions();
  
  // Find the position of the legend
  var position = options['legend']['position'];
  var rendered = options['legend']['rendered'];  
  var scrolling = options['legend']['scrolling'];
	
  // Done if position is none
  if(position == "none" || !rendered) 
    return;
  
  // Create the options object for the legend
  var legendOptions = DvtJSONUtils.clone(options['legend']);
  delete legendOptions["position"];
  legendOptions['layout']['gapRatio'] = chart.getGapRatio();
  legendOptions['hideAndShowBehavior'] = DvtChartEventUtils.getHideAndShowBehavior(chart);
  legendOptions['rolloverBehavior'] = DvtChartEventUtils.getRolloverBehavior(chart);
  legendOptions['scrolling'] = DvtChartEventUtils.getLegendScrolling(chart);
	
  // Create the data object for the legend
  var legendData = DvtChartLegendRenderer._getLegendData(chart);
  
  // Create and add the legend to the display list for calc and rendering
  var legend = DvtLegend.newInstance(chart.getContext(), chart.processEvent, chart, legendOptions);
  if(chart.getId() != null){
    //create and set legend id based on parent id
    legend.setId(chart.getId()+"legend");
  }
  container.addChild(legend);
	
  var maxWidth;
  var maxHeight;
  var actualSize;
  
  // Evaluate the automatic position
  // If scrolling is off, choose position that takes up least area
  if(position == "auto" && scrolling !== "asNeeded") {
    // Calc legend area if horizontal
    legendOptions['orientation'] = "horizontal";
    legend.setOptions(legendOptions);
    horizSize = legend.getPreferredSize(legendData, availSpace.w, options['layout']['legendMaxSize'] * availSpace.h);
    horizArea = horizSize.width * horizSize.height;
    
    // Calc legend area if vertical
    legendOptions['orientation'] = "vertical";
    legend.setOptions(legendOptions);
    vertSize = legend.getPreferredSize(legendData, options['layout']['legendMaxSize'] * availSpace.w, availSpace.h);
    vertArea = vertSize.width * vertSize.height;
    
    if (vertArea <= horizArea) {
      actualSize = vertSize;
      position = "end";
    } else {
      actualSize = horizSize;
      position = "bottom";
    }
  }
  // If scrolling is on, auto will always render vertical legend
  else if(position == "auto" && scrolling == "asNeeded") {
    position = "end";
  }
  
  // Convert "start" and "end" to absolute position
  var isBIDI = DvtStyleUtils.isLocaleR2L();
  if(position == "start")
    position = isBIDI ? "right" : "left";
  else if(position == "end")
    position = isBIDI ? "left" : "right";
	
  // Add legend orientation
  legendOptions['orientation'] = (position == "left" || position == "right" ? "vertical" : "horizontal");
  legend.setOptions(legendOptions);
	
  // Evaluate non-auto position
  if (!actualSize) {
    var isHoriz = (position == "top" || position == "bottom");
    maxWidth = isHoriz ? availSpace.w : options['layout']['legendMaxSize'] * availSpace.w;
    maxHeight = isHoriz ? options['layout']['legendMaxSize'] * availSpace.h : availSpace.h;
    actualSize = legend.getPreferredSize(legendData, maxWidth, maxHeight);
  }
  
  legend.render(legendData, actualSize.width, actualSize.height);
  var gap = DvtChartDefaults.getGapSize(chart, options['layout']['legendGap']);
  DvtLayoutUtils.position(availSpace, position, legend, actualSize.width, actualSize.height, gap);

  // Cache the legend for interactivity
  chart['legend'] = legend;
}

/**
 * Returns the data object to be passed to the legend.
 * @param {DvtChartImpl} chart The chart whose data will be passed to the legend.
 * @return {object} The data object for the chart's legend.
 */
DvtChartLegendRenderer._getLegendData = function(chart) {
  var data = chart.getData();
  
  // Populate top level items
  var legendData = {};
  legendData['title'] = data['legend'] ? data['legend']['title'] : null;
  legendData['sections'] = [];
  
  // Series
  var seriesItems = DvtChartLegendRenderer._getSeriesItems(chart);
  if(seriesItems.length > 0)
    legendData['sections'].push({'items': seriesItems});
  
  // Attribute Groups Sections
  DvtChartLegendRenderer._addLegendSections(chart, legendData['sections']);
  
  // Reference Objects
  var refObjItems = DvtChartLegendRenderer._getRefObjItems(chart);
  if(refObjItems.length > 0) {
    var refObjTitle = data['legend'] ? data['legend']['referenceObjectTitle'] : null;
    legendData['sections'].push({'items': refObjItems, 'title': refObjTitle});
  }
    
  return legendData;
}


/**
 * Returns the array of series items to pass to the legend.
 * @param {DvtChartImpl} chart The chart whose data will be passed to the legend.
 * @return {Array} The series items.
 * @private
 */
DvtChartLegendRenderer._getSeriesItems = function(chart) {
  var ret = [];
  var legendItem;
  
  if (chart.getType() == "pie") {
    var seriesIndices = DvtPieChartUtils.getRenderedSeriesIndices(chart);
    var seriesIndex;
    // Add the series in the same order as the pie
    for (var i = 0; i < seriesIndices.length; i++) {
      seriesIndex = seriesIndices[i];
      legendItem = DvtChartLegendRenderer._createLegendItem(chart, seriesIndex);
      if (legendItem)
        ret.push(legendItem);
    }
    if (DvtPieChartUtils.hasOtherSeries(chart)) {
      // Create legend item for "other" slice
      legendItem = {'id': DvtPieChartUtils.OTHER_SLICE_SERIES_ID,
                    'text': chart.getBundle().getTranslatedString(DvtChartBundle.LABEL_OTHER, null), 
                    'visibility': DvtPieChartUtils.getOtherSliceVisibility(chart),
                    'color': chart.getOptions()['styleDefaults']['otherColor'],
                    'borderColor': chart.getOptions()['styleDefaults']['borderColor']};
      ret.push(legendItem);
    }
  } else {
    // Loop through and find the series
    var seriesCount = DvtChartDataUtils.getSeriesCount(chart);
    for(var seriesIndex=0; seriesIndex < seriesCount; seriesIndex++) {
      legendItem = DvtChartLegendRenderer._createLegendItem(chart, seriesIndex);
      if (legendItem)
        ret.push(legendItem);
    }
  }
  
  // Legend items are reversed in stacked charts
  if(DvtChartTypeUtils.isStacked(chart) && !DvtChartTypeUtils.isHorizontal(chart)) 
    ret.reverse();
  
  return ret;
}


/**
 * Creates a legend item for a series
 * @param {DvtChartImpl} chart The chart whose data will be passed to the legend
 * @param {Number} seriesIndex The series index
 * @return {Object} The legend item
 * @private
 */
DvtChartLegendRenderer._createLegendItem = function(chart, seriesIndex) {
  var seriesItem = DvtChartDataUtils.getSeriesItem(chart, seriesIndex);
  
  // Skip if the series item isn't defined or if not displayInLegend
  if(!seriesItem || seriesItem['displayInLegend'] == "off")
    return null;
  
  // Create the legend item and add the properties for this series
  var series = DvtChartDataUtils.getSeries(chart, seriesIndex);
  var seriesLabel = DvtChartDataUtils.getSeriesLabel(chart, seriesIndex);
  var legendItem = {'id': series,
                    'text': seriesLabel, 
                    'visibility': seriesItem['visibility']};
  
  // Shape varies by chart type
  if(chart.getType() == "line") {
    legendItem['lineStyle'] = DvtChartStyleUtils.getLineStyle(chart, seriesIndex);
  
    if(DvtChartStyleUtils.getMarkerDisplayed(chart, seriesIndex)) {
      legendItem['shape'] = "lineWithMarker";
      legendItem['markerShape'] = DvtChartStyleUtils.getMarkerShape(chart, seriesIndex);
      legendItem['markerColor'] = DvtChartStyleUtils.getMarkerColor(chart, seriesIndex);
    }
    else
      legendItem['shape'] = "line";
  }
  else if(chart.getType() == "scatter" || chart.getType() == "bubble") {
    legendItem['shape'] = DvtChartStyleUtils.getMarkerShape(chart, seriesIndex); 
  }
  else
    legendItem['shape'] = "square";
  
  // Also add the color  
  legendItem['color'] = DvtChartStyleUtils.getColor(chart, seriesIndex);
  legendItem['borderColor'] = DvtChartStyleUtils.getBorderColor(chart, seriesIndex);
  
  return legendItem;
}


/**
 * Processes and adds the explicitly defined legend sections.
 * @param {DvtChartImpl} chart
 * @param {array} sections
 */
DvtChartLegendRenderer._addLegendSections = function(chart, sections) {
  var data = chart.getData();
  if(data && data['legend'] && data['legend']['sections']) {
    // Iterate through any sections defined with attribute groups
    for(var i=0; i<data['legend']['sections'].length; i++) {
      var dataSection = data['legend']['sections'][i];
      if(dataSection && dataSection['items']) 
        sections.push({'title': dataSection['title'], 'items': dataSection['items']});
    }
  }
}

/**
 * Returns the array of reference object items to pass to the legend.
 * @param {DvtChartImpl} chart The chart whose data will be passed to the legend.
 * @return {array} The reference object items.
 */
DvtChartLegendRenderer._getRefObjItems = function(chart) {
  var refObjs = DvtChartRefObjUtils.getObjects(chart);
  if(refObjs.length <= 0)
    return [];
  
  var items = [];
  for(var i=0; i<refObjs.length; i++) {
    var refObj = refObjs[i];
    
    // Reference Object must be defined with color and text to appear in legend
    if(!refObj || refObj['displayInLegend'] != "on" || !refObj['color'] || !refObj['text'])
      continue;
    
    var type = DvtChartRefObjUtils.getType(chart, refObj);
    var shape = (type == "area") ? "square" : "line";
    items.push({'shape': shape, 'text': refObj['text'], 'color': refObj['color'], 'lineStyle': refObj['lineStyle']});
  }

  return items;
}

/**
 * Renderer for the plot area of a DvtChart.
 * @class
 */
var DvtPlotAreaRenderer = new Object();

DvtObj.createSubclass(DvtPlotAreaRenderer, DvtObj, "DvtPlotAreaRenderer");

DvtPlotAreaRenderer._MIN_TOUCH_MARKER_SIZE = 16; // minimum marker size for touch devices

/**
 * Renders the plot area into the available space.
 * @param {DvtChartImpl} chart The chart being rendered.
 * @param {DvtContainer} container The container to render to.
 * @param {DvtRectangle} availSpace The available space.
 */
DvtPlotAreaRenderer.render = function (chart, container, availSpace) {
  // TODO: change to formal location for displayed data
  chart._currentMarkers = new Array();
  chart._currentAreas = new Array();
  
  DvtPlotAreaRenderer._renderBackgroundObjects(chart, container, availSpace);
  DvtPlotAreaRenderer._renderGridLines(chart, container, availSpace);
  DvtPlotAreaRenderer._renderForegroundObjects(chart, container, availSpace);
}

/**
 * Renders objects in the background of the plot area.
 * @param {DvtChartImpl} chart The chart being rendered.
 * @param {DvtContainer} container The container to render to.
 * @param {DvtRectangle} availSpace The available space.
 */
DvtPlotAreaRenderer._renderBackgroundObjects = function (chart, container, availSpace) {
  // Chart background
  var options = chart.getOptions();
  var rect = new DvtRect(chart.getContext(), availSpace.x, availSpace.y, availSpace.w, availSpace.h);
  var fill;
  if (options['plotArea']['backgroundColor'])
    fill = new DvtSolidFill(options['plotArea']['backgroundColor']);
  else
    fill = new DvtSolidFill("#000000", 0.001); // Always render a background plot area rectangle and save for interactivity
  rect.setFill(fill);
  container.addChild(rect);

  // TODO: change to formal storage location for plot rectangle reference
  chart._plotRect = rect;
  
  // Reference Objects 
  DvtRefObjRenderer.renderBackgroundObjects(chart, container, availSpace);
  
  // Draw area series behind the gridlines (because they would obscure the grids)
  var chartType = chart.getType();
  if(chartType == "area" || chartType == "combo")
    DvtPlotAreaRenderer._renderAreas(chart, container, availSpace);
}

/**
 * Renders grid lines for the plot area.
 * @param {DvtChartImpl} chart The chart being rendered.
 * @param {DvtContainer} container The container to render to.
 * @param {DvtRectangle} availSpace The available space.
 */
DvtPlotAreaRenderer._renderGridLines = function (chart, container, availSpace) {
  var context = chart.getContext();

  // X Axis
  var xAxis = chart.xAxis;
  var gridlines = xAxis.getGridLines(context);
  var position = xAxis.getPosition();
  var isHoriz = (position == "top" || position == "bottom");
  DvtPlotAreaRenderer._positionGridLines(container, availSpace, gridlines, isHoriz);

  // Y Axis
  var yAxis = chart.yAxis;
  gridlines = yAxis.getGridLines(context);
  position = yAxis.getPosition();
  isHoriz = (position == "top" || position == "bottom");
  DvtPlotAreaRenderer._positionGridLines(container, availSpace, gridlines, isHoriz);

  // Y2 Axis
  var y2Axis = chart.y2Axis;
  if(y2Axis) {
    gridlines = y2Axis.getGridLines(context);
    position = y2Axis.getPosition();
    isHoriz = (position == "top" || position == "bottom");
    DvtPlotAreaRenderer._positionGridLines(container, availSpace, gridlines, isHoriz);
  }
  
  //************ Axis Lines ************************************************/
  var xAxisLine = xAxis.getAxisLine(context);
  if(xAxisLine) 
    DvtPlotAreaRenderer._positionAxisLine(container, availSpace, xAxisLine, xAxis.getPosition());
  
  var yAxisLine = yAxis.getAxisLine(context);
  if(yAxisLine) 
    DvtPlotAreaRenderer._positionAxisLine(container, availSpace, yAxisLine, yAxis.getPosition());
  
  var y2AxisLine = y2Axis ? y2Axis.getAxisLine(context) : null;
  if(y2AxisLine) 
    DvtPlotAreaRenderer._positionAxisLine(container, availSpace, y2AxisLine, y2Axis.getPosition());
}

/**
 * Positions the specified grid lines in the plotArea.
 * @param {DvtContainer} container The container to render to.
 * @param {DvtRectangle} availSpace The available space.
 * @param {array} gridlines The Array of DvtLine objects.
 * @param {boolean} isHoriz True if the axis is horizontal.
 */
DvtPlotAreaRenderer._positionGridLines = function (container, availSpace, gridlines, isHoriz) {
  for (var i = 0;i < gridlines.length;i++) {
    var gridline = gridlines[i];
    container.addChild(gridline);

    // Position the gridline based on axis orientation
    if (isHoriz) {
      gridline.setY1(availSpace.y);
      gridline.setY2(availSpace.y + availSpace.h);
    }
    else {
      gridline.setX1(availSpace.x);
      gridline.setX2(availSpace.x + availSpace.w);
    }
  }
}

/**
 * Positions the specified axis line in the plotArea.
 * @param {DvtContainer} container The container to render to.
 * @param {DvtRectangle} availSpace The available space.
 * @param {DvtLine} axisLine The DvtLine object.
 * @param {string} position The position of the axis.
 */
DvtPlotAreaRenderer._positionAxisLine = function (container, availSpace, axisLine, position) {
  if(!axisLine)
    return;
  
  // Add the line to the container and position
  container.addChild(axisLine);
  if(position == "top") {
    axisLine.setX1(availSpace.x);
    axisLine.setX2(availSpace.x + availSpace.w);
    axisLine.setY1(availSpace.y);
    axisLine.setY2(availSpace.y);
  }
  else if(position == "bottom") {
    axisLine.setX1(availSpace.x);
    axisLine.setX2(availSpace.x + availSpace.w);
    axisLine.setY1(availSpace.y + availSpace.h);
    axisLine.setY2(availSpace.y + availSpace.h);
  }
  else if(position == "left") {
    axisLine.setX1(availSpace.x);
    axisLine.setX2(availSpace.x);
    axisLine.setY1(availSpace.y);
    axisLine.setY2(availSpace.y + availSpace.h);
  }
  else if(position == "right") {
    axisLine.setX1(availSpace.x + availSpace.w);
    axisLine.setX2(availSpace.x + availSpace.w);
    axisLine.setY1(availSpace.y);
    axisLine.setY2(availSpace.y + availSpace.h);
  }
}

/**
 * Renders objects in the foreground of the plot area.
 * @param {DvtChartImpl} chart The chart being rendered.
 * @param {DvtContainer} container The container to render to.
 * @param {DvtRectangle} availSpace The available space.
 */
DvtPlotAreaRenderer._renderForegroundObjects = function (chart, container, availSpace) {

  // Data Objects
  var chartType = chart.getType();
  if(chartType == "bar" || chartType == "horizontalBar") {
    DvtPlotAreaRenderer._renderBars(chart, container);
  }
  else if(chartType == "line") {
    DvtPlotAreaRenderer._renderLines(chart, container, availSpace);
  }
  else if(chartType == "combo") {
    // Areas were drawn in the background, draw bars and lines
    DvtPlotAreaRenderer._renderBars(chart, container);
    DvtPlotAreaRenderer._renderLines(chart, container, availSpace);
  }
  else if(chartType == "scatter") {
    DvtPlotAreaRenderer._renderDataMarkers(chart, container, true);
  }
  else if (chartType == "bubble") {
    var group = DvtPlotAreaRenderer._getClippedGroup(chart, container, availSpace);
    DvtPlotAreaRenderer._renderDataMarkers(chart, group, true);
  }
  
  // Reference Objects 
  DvtRefObjRenderer.renderForegroundObjects(chart, container, availSpace);
  
  // Initial Selection
  var selected = DvtChartDataUtils.getInitialSelection(chart);
  DvtPlotAreaRenderer._setInitialSelection(chart, selected);
}

/**
 * Renders the data markers.
 * @param {DvtChartImpl} chart The chart being rendered.
 * @param {DvtContainer} container The container to render to.
 * @param {boolean} bSortBySize True if markers should be sorted by size to reduce overlaps.
 */
DvtPlotAreaRenderer._renderDataMarkers = function(chart, container, bSortBySize) {
  // Keep track of the markers so that they can be sorted and added
  var markers = [];
  
  // Loop through the series
  var seriesCount = DvtChartDataUtils.getSeriesCount(chart);
  for (var seriesIndex = 0; seriesIndex < seriesCount;seriesIndex++) {
    var seriesMarkers = DvtPlotAreaRenderer._getMarkersForSeries(chart, seriesIndex);
    markers = markers.concat(seriesMarkers);
  }
  
  // Sort the markers from smallest to largest
  if(bSortBySize)
    DvtChartMarkerUtils.sortMarkers(markers);
    
  // Add the markers to the plotArea
  var numMarkers = markers.length;
  for (seriesIndex = 0;seriesIndex < numMarkers; seriesIndex++) 
    container.addChild(markers[seriesIndex]);

  // TODO: change to formal location for displayed data
  chart._currentMarkers.push(markers);

}

/**
 * Renders the data markers for the specified series.
 * @param {DvtChartImpl} chart The chart being rendered.
 * @param {DvtContainer} container The container to render to.
 * @param {number} seriesIndex The series to render.
 */
DvtPlotAreaRenderer._renderDataMarkersForSeries = function(chart, container, seriesIndex) {
  // Get the markers for the specified series
  var markers = DvtPlotAreaRenderer._getMarkersForSeries(chart, seriesIndex);
    
  // Add the markers to the plotArea
  var numMarkers = markers.length;
  for (seriesIndex = 0;seriesIndex < numMarkers; seriesIndex++) 
    container.addChild(markers[seriesIndex]);


  // TODO: change to formal location for displayed data
  chart._currentMarkers.push(markers);

}

/**
 * Creates and returns the array of DvtMarker for the specified series.
 * @param {DvtChartImpl} chart The chart being rendered.
 * @param {number} seriesIndex
 * @return {array} The array of DvtMarkers for the specified series.
 */
DvtPlotAreaRenderer._getMarkersForSeries = function(chart, seriesIndex) {
  // Skip the series if it shouldn't be rendered
  if(!DvtChartStyleUtils.isSeriesRendered(chart, seriesIndex))
    return [];
  
  var context = chart.getContext();
  var xAxis = chart.xAxis;
  var yAxis = chart.yAxis; 
  if(DvtChartDataUtils.isAssignedToY2(chart, seriesIndex))
    yAxis = chart.y2Axis;
    
  var bHasDatatips = DvtChartTooltipUtils.hasDatatips(chart);
  var bBubbleChart = DvtChartTypeUtils.isBubble(chart);
  
  // Keep track of the markers so that they can be sorted and added
  var markers = [];
  
  // Loop through the groups in the series
  var seriesItem = DvtChartDataUtils.getSeriesItem(chart, seriesIndex);
  for (var groupIndex = 0;groupIndex < seriesItem['data'].length;groupIndex++) {
    var dataItem = seriesItem['data'][groupIndex];
    
    // Skip if not visible
    if(!DvtChartStyleUtils.isDataItemRendered(chart, seriesIndex, groupIndex))
      continue;
    
    // Skip for null values
    if(DvtChartDataUtils.getValue(chart, seriesIndex, groupIndex) === null)
      continue;
    
    // Get the style information for this marker
    var shape = DvtMarker.convertShapeString(DvtChartStyleUtils.getMarkerShape(chart, seriesIndex, groupIndex));
    var borderColor = DvtChartStyleUtils.getBorderColor(chart, seriesIndex, groupIndex);
    var markerSize = DvtChartStyleUtils.getMarkerSize(chart, seriesIndex, groupIndex);
    var markerDisplayed = DvtChartStyleUtils.getMarkerDisplayed(chart, seriesIndex, groupIndex);
    
    // Get the axis values
    var xValue = DvtChartAxisUtils.getXAxisValue(dataItem, groupIndex);
    var yValue = DvtChartDataUtils.getCumulativeValue(chart, seriesIndex, groupIndex);

    // Get the position of the marker
    var xCoord, yCoord;
    if (bBubbleChart) {
    // Markers for most graph types must be within the plot area to be rendered.  Bubble markers
    // do not, as they are available clipped to the plot area bounds.
      xCoord = xAxis.getUnboundedCoordAt(xValue);
      yCoord = yAxis.getUnboundedCoordAt(yValue);
    } else {
      xCoord = xAxis.getCoordAt(xValue);
      yCoord = yAxis.getCoordAt(yValue);
    }
    
    if(xCoord === null || yCoord === null)
      continue;
    
    // Adjust by the marker size
    var halfMarkerSize = markerSize/2;
    xCoord -= halfMarkerSize;
    yCoord -= halfMarkerSize;
    
    // Create the marker
    var marker = null;
    if(markerDisplayed) {
      // Support for visible markers
      marker = new DvtMarker(context, shape, xCoord, yCoord, markerSize, markerSize);
      if (chart.isSelectionSupported()) {
        marker.setCursor(DvtSelectionEffectUtils.getSelectingCursor());
        marker.setDataColor(DvtChartStyleUtils.getMarkerColor(chart, seriesIndex, groupIndex));
      }
      // Apply the marker style
      marker.setFill(DvtChartSeriesEffectUtils.getMarkerFill(chart, seriesIndex, groupIndex));
      if (borderColor)
        marker.setStroke(new DvtSolidStroke(borderColor));
    
    }
    else {
      // Support for invisible markers for tooltips/interactivity
      if (chart.isSelectionSupported()) {
        marker = new DvtSelectableLineMarker(context, DvtMarker.SQUARE, xCoord, yCoord, markerSize, markerSize);
        marker.setDataColor(DvtChartStyleUtils.getColor(chart, seriesIndex, groupIndex));
        marker.setCursor(DvtSelectionEffectUtils.getSelectingCursor());
        marker.setZOrderManager(chart);
      } 
      else if(bHasDatatips) {
        marker = new DvtMarker(context, DvtMarker.SQUARE, xCoord, yCoord, markerSize, markerSize);
      }
      
      if(marker != null)
        marker.setFill(new DvtSolidFill("#FFFFFF", 0.001));
    }
      
    
    if(marker != null) {
      // Make sure that the marker hit area is large enough for touch devices (bug 14757156)
      if (DvtAgent.getAgent().isTouchDevice() && markerSize < DvtPlotAreaRenderer._MIN_TOUCH_MARKER_SIZE) {
        xCoord = xAxis.getCoordAt(xValue) - DvtPlotAreaRenderer._MIN_TOUCH_MARKER_SIZE/2;
        yCoord = yAxis.getCoordAt(yValue) - DvtPlotAreaRenderer._MIN_TOUCH_MARKER_SIZE/2;
        var hitArea = new DvtRect(context, xCoord, yCoord, 
            DvtPlotAreaRenderer._MIN_TOUCH_MARKER_SIZE, DvtPlotAreaRenderer._MIN_TOUCH_MARKER_SIZE);
        hitArea.setFill(new DvtSolidFill("#FFFFFF", 0.001));
        marker.addChild(hitArea);
      }
      
      // WAI-ARIA
      marker.setAriaRole('img');
      var ariaLabel = DvtChartTooltipUtils.getDatatip(null, chart, seriesIndex, groupIndex);
      marker.setAriaProperty('label', ariaLabel);
      
      // Add it to the markers array for sorting and addition to the display list later  
      markers.push(marker);
    
      // Associate the marker for interactivity
      DvtChartObjPeer.associate(marker, chart, seriesIndex, groupIndex);
    }
  }
  
  return markers;
}

/**
 * Renders all bar series for the given chart.
 * @param {DvtChartImpl} chart
 * @param {DvtContainer} container The container to render to.
 */
DvtPlotAreaRenderer._renderBars = function(chart, container) {
  var context = chart.getContext();
  var data = chart.getData();
  var xAxis = chart.xAxis;
  var bHoriz = DvtChartTypeUtils.isHorizontal(chart);
  var bStacked = DvtChartTypeUtils.isStacked(chart);
  var bPixelSpacing = (DvtChartStyleUtils.getBarSpacing(chart) == "pixel");
  
  // Find all series that are bars
  var barSeries = [];
  var seriesCount = DvtChartDataUtils.getSeriesCount(chart);
  for (var seriesIndex = 0; seriesIndex < seriesCount; seriesIndex++) {
    // Skip the series if it shouldn't be rendered or if the series type is not bar.
    if(!DvtChartStyleUtils.isSeriesRendered(chart, seriesIndex) || 
       DvtChartStyleUtils.getSeriesType(chart, seriesIndex) != "bar")
      continue;
    else
      barSeries.push(seriesIndex);
  }
  
  // Some BIDI charts display the bars in reverse order
  if(DvtStyleUtils.isLocaleR2L() && !bStacked)
    barSeries.reverse();
  
  // Get the common parameters that don't vary between bars
  var groupCount = data['groups'] ? data['groups'].length : 0;
  var barSeriesCount = barSeries.length;
  var yBaselineCoord = chart.yAxis.getBaselineCoord();
  var barWidth = DvtChartStyleUtils.getBarWidth(chart, barSeriesCount, xAxis);
  var offset = DvtChartStyleUtils.getBarOffset(chart, barWidth, barSeriesCount);
  var y2Offset = DvtChartStyleUtils.getY2BarOffset(chart, barWidth);

  // Iterate through the data
  for (var barSeriesIndex = 0; barSeriesIndex < barSeriesCount; barSeriesIndex++) {
    seriesIndex = barSeries[barSeriesIndex];
    
    // Find the corresponding y axis
    var bY2Series = DvtChartDataUtils.isAssignedToY2(chart, seriesIndex);
    var yAxis = bY2Series ? chart.y2Axis : chart.yAxis; 
    
    for(var groupIndex = 0; groupIndex < groupCount; groupIndex++) {
      var dataItem = DvtChartDataUtils.getDataItem(chart, seriesIndex, groupIndex);

      // Get the axis values
      var xValue = DvtChartAxisUtils.getXAxisValue(dataItem, groupIndex);
      var yValue = DvtChartDataUtils.getValue(chart, seriesIndex, groupIndex);
      var totalYValue = DvtChartDataUtils.getCumulativeValue(chart, seriesIndex, groupIndex);
  
      // Get the position on the axis
      var xCoord = xAxis.getCoordAt(xValue);
      var yCoord = yAxis.getBoundedCoordAt(totalYValue);
      var baseCoord = bStacked ? yAxis.getBoundedCoordAt(totalYValue - yValue) : yBaselineCoord;
      
      // Don't render bars whose start and end points are both out of bounds
      if(yCoord == baseCoord && yAxis.getCoordAt(totalYValue) === null)
        continue;
      
      // Support for 0 value bars.  Render bars smaller than a pixel as an invisible 3 pixel bar.
      var bInvisible = false;
      if(Math.abs(yCoord - baseCoord) < 1) {
        bInvisible = true;
        if(yCoord > baseCoord)
          yCoord = baseCoord + 3;
        else if(yCoord <= baseCoord)
          yCoord = baseCoord - 3;
      }
    
      // Create the points array for the bar
      var x1 = bY2Series ? Math.round(xCoord + offset + y2Offset) : Math.round(xCoord + offset);
      var x2 = x1 + barWidth;
      var points;
      if(bHoriz)
        points = [yCoord, x1, yCoord, x2, baseCoord, x2, baseCoord, x1];
      else
        points = [x1, yCoord, x2, yCoord, x2, baseCoord, x1, baseCoord];
    
      // Create and apply the style
      var polygon;
      if (chart.isSelectionSupported()) {
        polygon = new DvtSelectablePolygon(context, points);
        polygon.setDataColor(DvtChartStyleUtils.getColor(chart, seriesIndex, groupIndex));
        polygon.setCursor(DvtSelectionEffectUtils.getSelectingCursor());
        polygon.setZOrderManager(chart);
      } else {
        polygon = new DvtPolygon(context, points);
      }
      container.addChild(polygon);
      
      if(bInvisible) // Apply an invisible fill for small bars
        polygon.setFill(new DvtSolidFill("#FFFFFF", 0.001));
      else {
        // Apply the specified style
        polygon.setFill(DvtChartSeriesEffectUtils.getBarFill(chart, seriesIndex, groupIndex, bHoriz));
        var borderColor = DvtChartStyleUtils.getBorderColor(chart, seriesIndex, groupIndex);
        if(borderColor)
          polygon.setStroke(new DvtSolidStroke(borderColor));
      }
      
      // Use pixel hinting for pixel bar spacing
      if(bPixelSpacing)
        polygon.setPixelHinting(true);
        
      // Associate for interactivity
      DvtChartObjPeer.associate(polygon, chart, seriesIndex, groupIndex);
      
      var markers = new Array();
      markers.push(polygon);

      // TODO: change to formal location for displayed data      
      chart._currentMarkers.push(markers);
      
      // WAI-ARIA
      polygon.setAriaRole('img');
      var ariaLabel = DvtChartTooltipUtils.getDatatip(null, chart, seriesIndex, groupIndex);
      polygon.setAriaProperty('label', ariaLabel);
    }
    
    if(!bStacked && !DvtChartDataUtils.hasMixedFrequency(chart))
      offset += barWidth;
  }
}

/**
 * Renders all line series for the given chart.
 * @param {DvtChartImpl} chart
 * @param {DvtContainer} container The container to render to.
 * @param {DvtRectangle} availSpace
 */
DvtPlotAreaRenderer._renderLines = function(chart, container, availSpace) {
  var context = chart.getContext();

  // Find all series that are lines
  var lineSeries = [];
  var seriesCount = DvtChartDataUtils.getSeriesCount(chart);
  for (var seriesIndex = 0; seriesIndex < seriesCount; seriesIndex++) {
    // Skip the series if it shouldn't be rendered or if the series type is not line.
    if(!DvtChartStyleUtils.isSeriesRendered(chart, seriesIndex) || 
       DvtChartStyleUtils.getSeriesType(chart, seriesIndex) != "line")
      continue;
    else
      lineSeries.push(seriesIndex);
  }
  
  // Render the lines
  var group = DvtPlotAreaRenderer._getClippedGroup(chart, container, availSpace);
  for (var lineIndex = 0; lineIndex < lineSeries.length; lineIndex++) {
    seriesIndex = lineSeries[lineIndex];
    
    // Get the style info
    var color = DvtChartStyleUtils.getColor(chart, seriesIndex);
    var lineWidth = DvtChartStyleUtils.getLineWidth(chart, seriesIndex);
    var lineStyle = DvtStroke.convertTypeString(DvtChartStyleUtils.getLineStyle(chart, seriesIndex));
    var stroke = new DvtSolidStroke(color, 1, lineWidth);
    stroke.setStyle(lineStyle);
    
    // Get the arrays of points
    var pointsArrays = DvtPlotAreaRenderer._getPointsForSeries(chart, seriesIndex);
    
    // Create a line for each set of points
    for(var i = 0; i < pointsArrays.length; i++) {
      var points = pointsArrays[i];
      if(points && points.length > 1) {
        var line = new DvtPolyline(context, points);
        line.setStroke(stroke);
        group.addChild(line);
          
        // Associate for interactivity
        DvtChartObjPeer.associate(line, chart, seriesIndex);
      }
    }
  }
  
  // Render the markers
  for(lineIndex = 0; lineIndex < lineSeries.length; lineIndex++) 
    DvtPlotAreaRenderer._renderDataMarkersForSeries(chart, container, lineSeries[lineIndex]);
}

/**
 * Renders all area series for the given chart.
 * @param {DvtChartImpl} chart
 * @param {DvtContainer} container The container to render to.
 * @param {DvtRectangle} availSpace
 */
DvtPlotAreaRenderer._renderAreas = function(chart, container, availSpace) {
  var context = chart.getContext();
  var bStacked = DvtChartTypeUtils.isStacked(chart);

  // Find all series that are areas
  var areaSeries = [];
  var seriesCount = DvtChartDataUtils.getSeriesCount(chart);
  for (var seriesIndex = 0; seriesIndex < seriesCount; seriesIndex++) {
    // Skip the series if it shouldn't be rendered or if the series type is not area.
    if(!DvtChartStyleUtils.isSeriesRendered(chart, seriesIndex) || 
       DvtChartStyleUtils.getSeriesType(chart, seriesIndex) != "area")
      continue;
    else
      areaSeries.push(seriesIndex);
  }
  
  // Stacked areas are rendered in reverse order.
  if(bStacked)
    areaSeries.reverse();
  
  // Loop through the series
  for (var areaIndex = 0; areaIndex < areaSeries.length; areaIndex++) {
    seriesIndex = areaSeries[areaIndex];
    
    // Get the arrays of points
    var pointsArrays = DvtPlotAreaRenderer._getPointsForSeries(chart, seriesIndex);
    
    // Get the baseline coordinate, which will be added to each area
    var baselineCoord = chart.yAxis.getBaselineCoord();
    
    // Create a shape for each set of points
    for(var i = 0; i < pointsArrays.length; i++) {
      var points = pointsArrays[i];
      if(points && points.length > 2) {
        // Add the two bottom points
        points.push(points[points.length-2], baselineCoord);
        points.push(points[0], baselineCoord);
      
        // Create and apply the style
        var polygon = new DvtPolygon(context, points);
        
        // Create a unique group so that the markers are rendered with each area
        var group = DvtPlotAreaRenderer._getClippedGroup(chart, container, availSpace);
        group.addChild(polygon);
        
        polygon.setFill(DvtChartSeriesEffectUtils.getAreaFill(chart, seriesIndex));
        var borderColor = DvtChartStyleUtils.getBorderColor(chart, seriesIndex);
        if(borderColor)
          polygon.setStroke(new DvtSolidStroke(borderColor));

        // TODO: change to formal API for storage
        chart._currentAreas.push(polygon);
          
        // Associate for interactivity
        DvtChartObjPeer.associate(polygon, chart, seriesIndex);
      }
    }
    
    // If not stacked, draw with each series so that markers don't bleed through
    if(!bStacked)
      DvtPlotAreaRenderer._renderDataMarkersForSeries(chart, container, seriesIndex);
  }
  
  // If stacked, draw markers at the end so that the stacked areas don't overlap them
  if(bStacked) {
    for(areaIndex = 0; areaIndex < areaSeries.length; areaIndex++) 
      DvtPlotAreaRenderer._renderDataMarkersForSeries(chart, container, areaSeries[areaIndex]);
  }
}

/**
 * Creates and returns the coordinates for the specified series.  An array of arrays is returned,
 * with each array being a set of contiguous points.
 * @param {DvtChartImpl} chart The chart being rendered.
 * @param {number} seriesIndex The series being rendered.
 * @return {array} The arrays of contiguous points for the series.
 */
DvtPlotAreaRenderer._getPointsForSeries = function(chart, seriesIndex) {
  var xAxis = chart.xAxis;
  var yAxis = chart.yAxis; 
  if(DvtChartDataUtils.isAssignedToY2(chart, seriesIndex))
    yAxis = chart.y2Axis;

  // Create the line and add the stroke info
  var pointsArrays = [];
  var points = [];
  
  // Loop through the groups
  var seriesItem = DvtChartDataUtils.getSeriesItem(chart, seriesIndex);
  for (var groupIndex = 0;groupIndex < seriesItem['data'].length;groupIndex++) {
    var dataItem = seriesItem['data'][groupIndex];
    
    // A null value begins another line or area and skips this data item
    if(DvtChartDataUtils.getValue(chart, seriesIndex, groupIndex) === null) {
      if(points.length > 0) {
        pointsArrays.push(points);
        points = []; 
      }
          
      continue; 
    }

    // Get the axis values
    var xValue = DvtChartAxisUtils.getXAxisValue(dataItem, groupIndex);
    var yValue = DvtChartDataUtils.getCumulativeValue(chart, seriesIndex, groupIndex);

    // Get the position on the axis
    var xCoord = xAxis.getCoordAt(xValue);
    var yCoord = yAxis.getUnboundedCoordAt(yValue);
    
    // Add the points to the line
    points.push(xCoord, yCoord);
  }

  // Add any remaining points to the array
  if(points.length > 0)
    pointsArrays.push(points);
    
  return pointsArrays;
}

/**
 * Creates a container for plot area foreground objects with clipping.
 * @param {DvtChartImpl} chart The chart being rendered.
 * @param {DvtContainer} container The container to render to.
 * @param {DvtRectangle} availSpace The available space.
 * @return {DvtContainer} The clipped container for plot area foreground objects.
 * @private
 */
DvtPlotAreaRenderer._getClippedGroup = function(chart, container, availSpace) {
  var clipGroup = new DvtContainer(container.getContext());
  container.addChild(clipGroup);
  var clip = new DvtClipPath(chart.getId());
  clip.addRect(availSpace.x, availSpace.y, availSpace.w, availSpace.h);
  clipGroup.setClipPath(clip);
  return clipGroup;
}

/**
 * Sets intial selection for the graph.
 * @param {string} chart The chart being rendered.
 * @param {array} selected The array of initially selected objects.
 * @private
 */
DvtPlotAreaRenderer._setInitialSelection = function(chart, selected) {
  var handler = chart.getSelectionHandler();
  if(!handler)
    return;

  var peers = chart.getObjects();
  var selectedIds = [];
  for (var i = 0; i < selected.length; i++) {
    for (var j = 0; j < peers.length; j++) {
      var peer = peers[j];
      if(peer.getSeries() === selected[i]['series'] && peer.getGroup() === selected[i]['group']) {
        selectedIds.push(peer.getId());
        continue;
      }
    }
  }
  
  handler.processInitialSelections(selectedIds, peers);
}
/**
 * Renderer for pie graph.
 * @class
 */
var DvtPieRenderer = new Object();

DvtObj.createSubclass(DvtPieRenderer, DvtObj, "DvtPieRenderer");

// Private pie rendering constants
DvtPieRenderer._THREED_TILT = 0.41;
DvtPieRenderer._THREED_DEPTH = 0.1;
DvtPieRenderer._RADIUS = 0.4;
DvtPieRenderer._RADIUS_LABELS = 0.33;

// The virtual coordinate system used by the middle tier is
// 32,000 x 32,000 big. Originally, the middle tier layout performed
// its calculations in this space and then mapped it to the destination
// coordinate system (which, in our case, is the coordinate system
// specified by the app designer when specifying the size of the chart -
// e.g., 400px x 300px)
// When computing the pie radius on the client, we will follow the same pattern
// as in the middle tier (i.e., perform the computations in the 
// virtual space and then map back to the destination space) but we will
// simplify the logic used in computing the pie radius in the virtual space
DvtPieRenderer._VIRTUAL_COORDINATE_SYSTEM_MAX_SIZE = 32000;

/**
 * Renders a pie graph into the available space.
 * @param {DvtChartImpl} chart The chart being rendered.
 * @param {DvtContainer} container The container to render to.
 * @param {DvtRectangle} availSpace The available space.
 */
DvtPieRenderer.render = function (chart, container, availSpace) {
  DvtPieRenderer._renderPie(chart, container, availSpace);
}

/**
 * Renders a pie and slices.
 * @param {DvtChartImpl} chart The chart being rendered.
 * @param {DvtContainer} container The container to render to.
 * @param {DvtRectangle} availSpace The available space.
 * @private
 */
DvtPieRenderer._renderPie = function (chart, container, availSpace) {
  var options = chart.getOptions();
  
	// Set pie chart label
  // Pie only has one group so take first group from data source
  var labelText = DvtChartDataUtils.getGroupLabel(chart, 0);
  if (labelText) {
		var pieLabel = new DvtText(chart.getContext(), labelText, 0, 0);
		var pieLabelStyle = new DvtCSSStyle();
		pieLabelStyle.parseInlineStyle(options['styleDefaults']['pieLabelStyle'])
		pieLabel.setCSSStyle(pieLabelStyle);
		container.addChild(pieLabel);
		
		// Update availSpace
		var labelDim = pieLabel.getDimensions();
		availSpace.h -= labelDim.h;
		DvtLayoutUtils.position(availSpace, "bottom", pieLabel, labelDim.w, labelDim.h, 0);
  }
  
  var pieChart = new DvtPieChart(chart.getContext(), chart.getEventManager());
  container.addChild(pieChart);

  // Set pie info
  var pieInfo = new DvtPieInfo();
  pieChart.setPieInfo(pieInfo);
  pieInfo.setFillType(DvtPieRenderer._getSeriesEffect(options['styleDefaults']['seriesEffect']));
		
  // Set label and feeler attributes
  pieInfo.setFeelerColor(options['styleDefaults']['pieFeelerColor']);
  var sliceLabelStyle = new DvtCSSStyle();
  sliceLabelStyle.parseInlineStyle(options['styleDefaults']['sliceLabel']['style']);
  pieInfo.setCSSStyle(sliceLabelStyle);
  pieInfo.setLabelPosition(DvtPieRenderer._getLabelPosition(options['styleDefaults']['sliceLabel'].position));
  pieInfo.setLabelType(DvtPieRenderer._getLabelType(options['styleDefaults']['sliceLabel']['textType']));
  if (options['styleDefaults']['sliceLabel']['converter'])
    pieInfo.setConverter(options['styleDefaults']['sliceLabel']['converter']);
  
  // Set animation attributes
  pieInfo.setAnimationDuration(DvtChartStyleUtils.getAnimationDuration(chart)); 
  if (DvtChartStyleUtils.getAnimationOnDisplay(chart) === "auto")
    pieInfo.setInitFx(true);
  
  // Set position attributes
  var center = new DvtPoint(availSpace.x + Math.floor(availSpace.w / 2), availSpace.y + Math.floor(availSpace.h / 2));
  // TODO calculate radius correctly
  var radiusScale = pieInfo.getLabelPosition() == DvtPieChart._LABEL_POS_OUTSIDE_FEELERS ? DvtPieRenderer._RADIUS_LABELS : DvtPieRenderer._RADIUS;
  var radius = Math.floor(Math.min(availSpace.w, availSpace.h) * radiusScale);

  var is3D = ((options['styleDefaults']['threeDEffect'] == "on") ? true : false);
  if (is3D) {
    pieChart.set3D(is3D);
	
    // Set depth as percentage of window height
    var depth = availSpace.h * DvtPieRenderer._THREED_DEPTH;
    pieChart.setDepth(depth);

    center.y -= Math.floor(depth/2);

    // Calculate tilted pie dimensions
    var squashRatioX = 1;
    var squashRatioY = availSpace.w / availSpace.h;

    // begin BUGFIX 12937534
    var stageDimensions = chart.getContext().getStage().getDimensions();
    
    // the middle tier Perspective code uses a virtual coordinate space sized
    // 32,000 x 32,000. Computations are done in this virtual space and then
    // mapped to the destination space.
    
    squashRatioY = stageDimensions.w / stageDimensions.h;

    if (squashRatioY > 1) {
      squashRatioX = 1 / squashRatioY;
      squashRatioY = 1;
    }

    radius = DvtPieRenderer._computePieRadius(availSpace, pieInfo, stageDimensions);
    // radius is a value given in the virtual coordinate space

    squashRatioY = squashRatioY - (squashRatioY * DvtPieRenderer._THREED_TILT);

    pieChart.setPosition(center, 
                         DvtPieRenderer._virtToDest(radius * squashRatioX, stageDimensions.w), 
                         DvtPieRenderer._virtToDest(radius * squashRatioY, stageDimensions.h), 
                         availSpace);
    
    // end BUGFIX 12937534
  }
  else {
    pieChart.setPosition(center, radius, radius, availSpace);
  }

  if (DvtPieRenderer._renderSlices(chart, pieChart))
    pieChart.render();
  else
    DvtChartRenderer._renderEmptyText(chart, container, availSpace);
  
  // Store a reference for interactivity
  chart.pieChart = pieChart;
  
  // Initial Selection
  var selected = DvtChartDataUtils.getInitialSelection(chart);
  DvtPieRenderer._setInitialSelection(chart, selected);
}


/**
 * Computes the radius of the pie. This code is a simplification of the calcSinglePieRadius method in
 * JChart_2D_Pie.java
 * 
 * @param {DvtRectangle} availSpace - in DESTINATION coordinates (the coordinate space we are rendering the 
 *        client chart in)
 * @param {DvtPieInfo} pieInfo
 * @param {DvtRectangle} stageDimensions - in DESTINATION coordinates
 * @return {Number} The radius of the pie - in VIRTURAL coordinates (the coordinate space used by
 *         the Perspective code on the middle tier)
 * @private
 */
DvtPieRenderer._computePieRadius = function(availSpace, pieInfo, stageDimensions)
{
  // we calculate the pie radius as follows:
  // 1. compute what the radius would be if the height is the limiting dimension (radiusByHeightDest)
  // 2. compute what the radius would be if we used the available width (radiusByWidthDest). Here is
  //    where the client code differs from the middle tier; we use a big simplification to compute
  //    the radius (we take the radius to be a percentage of the available space). The middle tier 
  //    actually does some label layout to come up with a precise value for the radius.
  // 3. determine if the height is the dimension that constrains the pie radius.
  //    if so, return radiusByHeightDest, else return radiusByWidthDest
  
  if(pieInfo.getLabelPosition() == DvtPieChart.LABEL_POS_NONE ||
     pieInfo.getLabelPosition() == DvtPieChart.LABEL_POS_INSIDE)
  {
    var radiusDest;
    var margin = 5; // constant used in middle tier
    if(availSpace.w < availSpace.h)
      radiusDest = availSpace.w/2 - margin;
    else
      radiusDest = availSpace.h/2 - margin;
    
    return DvtPieRenderer._calcVirtRadius(radiusDest, stageDimensions);
  }

  var sliceLabelStyle = pieInfo.getCSSStyle();
  var fontSize = sliceLabelStyle.getFontSize();
  if(fontSize)
    fontSize = parseFloat(fontSize);
  else
    fontSize = DvtCSSStyle.DEFAULT_FONT_SIZE;

  var radiusByHeightDest = availSpace.h/2;   
  radiusByHeightDest -= fontSize;
  
  if(pieInfo.getLabelPosition() == DvtPieChart.LABEL_POS_OUTSIDE_FEELERS ||
     pieInfo.getLabelPosition() == DvtPieChart.LABEL_POS_OUTSIDE ||
     pieInfo.getAnimationDuration() > 0)
  {
    radiusByHeightDest /= 1.125;
  }
  else
  {
    radiusByHeightDest /= 1.0625
  }
  
  var radiusByWidthDest = availSpace.w * DvtPieRenderer._RADIUS_LABELS;
  
  if(radiusByHeightDest < radiusByWidthDest)
    return DvtPieRenderer._calcVirtRadius(radiusByHeightDest, stageDimensions);
  else
    return DvtPieRenderer._calcVirtRadius(radiusByWidthDest, stageDimensions);
}

/**
 * Helper function to compute the virtual radius
 * @param {Number} radiusDest The radius as measured in the destination coordinate space
 * @param {DvtRectangle} stageDimensions Stage dimensions in the destination coordinate space
 * @return {Number} The radius in the virtual coordinate system.  It is calculated based on
 *         the side that has the shorter dimension (in the destination coordinate system)
 * @private 
 */
DvtPieRenderer._calcVirtRadius = function(radiusDest, stageDimensions) 
{
  if(stageDimensions.w < stageDimensions.h)
    return DvtPieRenderer._destToVirt(radiusDest, stageDimensions.w);
  else
    return DvtPieRenderer._destToVirt(radiusDest, stageDimensions.h);
}

/**
 * Converts the distance in the destination space to the equivalent distance
 * in the virtual space, by scaling the virtural dimension by the length of the destination dimension
 * (i.e., either the width or height of the destination coordinate system)
 * @param {Number} destValue Length in the destination coordinate system
 * @param {Number} destDim Either the width or the height of the destination coordinate system
 * @return {Number} the corresponding length in the virtual space
 * @private 
 */ 
DvtPieRenderer._destToVirt = function(destValue, destDim)
{
  return parseInt(destValue * DvtPieRenderer._VIRTUAL_COORDINATE_SYSTEM_MAX_SIZE / destDim);
}

/**
 * Converts the distance in the virtual space to the equivalent distance
 * in the destination space, by scaling the virtural dimension by the length of the destination dimension
 * (i.e., either the width or height of the destination coordinate system)
 * @param {Number} virtValue
 * @param {Number} destDim
 * @param {Number} the value in the destination space
 * @private 
 */ 
DvtPieRenderer._virtToDest = function(virtValue, destDim)
{
  return virtValue * destDim / DvtPieRenderer._VIRTUAL_COORDINATE_SYSTEM_MAX_SIZE;
}


/**
 * Renders all the slices in a pie.
 * @param {DvtChartImpl} chart The chart being rendered.
 * @param {DvtPieChart} pie The pie chart being rendered.
 * @return {Boolean} If there is at least one slice that can be rendered
 * @private
 */
DvtPieRenderer._renderSlices = function (chart, pie) {
  // Iterate through the data and create the slice info objects
  var arSliceInfo = [];
  var options = chart.getOptions();
  
  var color;
  var borderColor;
  
  var seriesIndices = DvtPieChartUtils.getRenderedSeriesIndices(chart);
  var seriesIndex;
  var otherValue = DvtPieChartUtils.getOtherValue(chart);
  
  for (var i = 0; i < seriesIndices.length; i++) {
    seriesIndex = seriesIndices[i];
    
    // Skip the series if it shouldn't be rendered
    if(!DvtChartStyleUtils.isSeriesRendered(chart, seriesIndex))
      continue;
    
    // Do not render if the value is not positive
    var value = DvtChartDataUtils.getValue(chart, seriesIndex, 0);
    if (value <= 0)
      continue;
    
    var slice = new DvtSliceInfo();
    slice.setId(DvtPieChartUtils.getSliceId(chart, seriesIndex));
    slice.setText(DvtChartDataUtils.getSeries(chart, seriesIndex));
    slice.setValue(value);
    slice.setTooltip(DvtChartTooltipUtils.getDatatip(null, chart, seriesIndex, 0));
    slice.setExplode(DvtChartStyleUtils.getPieSliceExplode(chart, seriesIndex));

    // Get the style info
    color = DvtChartStyleUtils.getColor(chart, seriesIndex);
    borderColor = DvtChartStyleUtils.getBorderColor(chart, seriesIndex);
    slice.setFillColor(DvtColorUtils.getRGB(color));
    slice.setFillAlpha(DvtColorUtils.getAlpha(color));
    if (borderColor) {
      slice.setStrokeColor(DvtColorUtils.getRGB(borderColor));
      slice.setStrokeAlpha(DvtColorUtils.getAlpha(borderColor));
    }
    
    // Action support
    var dataItem = DvtChartDataUtils.getDataItem(chart, seriesIndex, 0);
    if(dataItem && dataItem['action'])
      slice.setAction(dataItem['action']);

    arSliceInfo.push(slice);
  }
  
  // Create the "Other" slice if needed
  if (otherValue > 0) {
    var otherSlice = new DvtSliceInfo();
    var otherStr = chart.getBundle().getTranslatedString(DvtChartBundle.LABEL_OTHER, null);
    otherSlice.setId(DvtPieChartUtils.getOtherSliceId(chart));
    otherSlice.setText(otherStr);
    otherSlice.setValue(otherValue);
    otherSlice.setTooltip(DvtChartTooltipUtils.getOtherSliceDatatip(chart, otherValue, 0));

    // Get the style info
    color = options['styleDefaults']['otherColor'];
    borderColor = options['styleDefaults']['borderColor'];
    otherSlice.setFillColor(DvtColorUtils.getRGB(color));
    otherSlice.setFillAlpha(DvtColorUtils.getAlpha(color));
    if (borderColor) {
      otherSlice.setStrokeColor(DvtColorUtils.getRGB(borderColor));
      otherSlice.setStrokeAlpha(DvtColorUtils.getAlpha(borderColor));
    }
    
    arSliceInfo.push(otherSlice);
  }
  
  // Reverse the slices for BIDI
  if(DvtStyleUtils.isLocaleR2L())
    arSliceInfo.reverse();
  
  // Finally add the slices to the pie
  for(var i=0; i<arSliceInfo.length; i++) {
    pie.addSliceInfo(arSliceInfo[i]);
  }
  
  return arSliceInfo.length > 0;
}


/**
 * Converts a type string to a DvtPieChart label type.
 * @param {string} type The label type.
 * @return {number} Number representing a DvtPieChart label type.
 * @private
 */
DvtPieRenderer._getLabelType = function(type) {
  switch (type) {
    case "text":
      return DvtPieChart.LABEL_TYPE_TEXT;
    case "value":
      return DvtPieChart.LABEL_TYPE_VALUE;
    case "textAndPercent":
      return DvtPieChart.LABEL_TYPE_TEXT_PERCENT;
    default :
      return DvtPieChart.LABEL_TYPE_PERCENT;
  }
}

/**
 * Converts a position string to a DvtPieChart label position type.
 * @param {string} pos The label position.
 * @return {number} Number representing a DvtPieChart label position type.
 * @private
 */
DvtPieRenderer._getLabelPosition = function(pos) {
	switch (pos) {
    case "inside":
      return DvtPieChart.LABEL_POS_INSIDE;
    case "outside":
      return DvtPieChart.LABEL_POS_OUTSIDE_FEELERS;
    default :
      return DvtPieChart.LABEL_POS_NONE;
  }
}

/**
 * Converts a series effect string to a DvtFill type.
 * @param {string} effect The pie series effect.
 * @return {number} Number representing a DvtFill type.
 * @private
 */
DvtPieRenderer._getSeriesEffect = function(effect) {
	switch (effect) {
    case "gradient":
      return DvtFill.GRADIENT;
    case "pattern":
      return DvtFill.PATTERN;
    default :
      return DvtFill.COLOR;
  }
}

/**
 * Sets initial selection for the graph.
 * @param {string} chart The chart being rendered.
 * @param {array} selected The array of initially selected objects.
 * @private
 */
DvtPieRenderer._setInitialSelection = function(chart, selected) {
  var handler = chart.getSelectionHandler();
  if(!handler)
    return;
    
  var peers = chart.pieChart.__getSlices();
  var selectedIds = [];
  for (var i = 0; i < selected.length; i++) {
    for (var j = 0; j < peers.length; j++) {
      var peerId = peers[j].getId();
      if ((selected[i]['id'] && peerId.getId() === selected[i]['id']) ||
          (peerId.getSeries() === selected[i]['series'] && peerId.getGroup() === selected[i]['group'])) {
        selectedIds.push(peerId);
        continue;
      }
    }
  }
  
  // Add other slice to the list if all series in the "other" slice is selected
  if (DvtPieChartUtils.isOtherSliceSelected(chart, selected)) {
    var otherPeerId = DvtPieChartUtils.getOtherSliceId(chart);
    selectedIds.push(otherPeerId);
  }
  
  handler.processInitialSelections(selectedIds, peers);
}
/**
 * Renderer for the reference objects of a DvtChart.
 * @class
 */
var DvtRefObjRenderer = new Object();

DvtObj.createSubclass(DvtRefObjRenderer, DvtObj, "DvtRefObjRenderer");

/**
 * Renders the background reference objects.
 * @param {DvtChartImpl} chart The chart being rendered.
 * @param {DvtContainer} container The container to render to.
 * @param {DvtRectangle} plotAreaBounds The bounds of the plot area.
 */
DvtRefObjRenderer.renderBackgroundObjects = function(chart, container, plotAreaBounds) {
  DvtRefObjRenderer._renderObjects(chart, container, plotAreaBounds, "back");
}

/**
 * Renders the foreground reference objects.
 * @param {DvtChartImpl} chart The chart being rendered.
 * @param {DvtContainer} container The container to render to.
 * @param {DvtRectangle} plotAreaBounds The bounds of the plot area.
 */
DvtRefObjRenderer.renderForegroundObjects = function(chart, container, plotAreaBounds) {
  DvtRefObjRenderer._renderObjects(chart, container, plotAreaBounds, "front");
}

/**
 * Renders the reference objects for the given location.
 * @param {DvtChartImpl} chart The chart being rendered.
 * @param {DvtContainer} container The container to render to.
 * @param {DvtRectangle} plotAreaBounds The bounds of the plot area.
 * @param {string} location The location of the reference objects.
 * @private
 */
DvtRefObjRenderer._renderObjects = function(chart, container, plotAreaBounds, location) {
  DvtRefObjRenderer._renderObjectsForAxis(chart, container, plotAreaBounds, location, chart.xAxis, DvtChartRefObjUtils.getXAxisObjects(chart));
  DvtRefObjRenderer._renderObjectsForAxis(chart, container, plotAreaBounds, location, chart.yAxis, DvtChartRefObjUtils.getYAxisObjects(chart));
  DvtRefObjRenderer._renderObjectsForAxis(chart, container, plotAreaBounds, location, chart.y2Axis, DvtChartRefObjUtils.getY2AxisObjects(chart));
}

/**
 * Renders the reference objects for the given location.
 * @param {DvtChartImpl} chart The chart being rendered.
 * @param {DvtContainer} container The container to render to.
 * @param {DvtRectangle} plotAreaBounds The bounds of the plot area.
 * @param {string} location The location of the reference objects.
 * @param {DvtAxis} axis The axis corresponding to the reference objects.
 * @param {array} objects The array of reference objects.
 * @private
 */
DvtRefObjRenderer._renderObjectsForAxis = function(chart, container, plotAreaBounds, location, axis, objects) {
  // Reference objects not supported on group axis.
  if(!objects || !axis || axis.isGroupAxis())
    return;
    
  var position = axis.getPosition();  
  var bHoriz = (position == "top" || position == "bottom");

  // Loop through and render each reference object
  for(var i=0; i<objects.length; i++) {
    var refObj = objects[i];
    
    // The object and its color must be defined
    if(!refObj || !refObj['color'])
      continue;
      
    if(DvtChartRefObjUtils.getLocation(chart, refObj) != location)
      continue;
       
    var shape = null;
    var type = DvtChartRefObjUtils.getType(chart, refObj);
    if(type == "area") {
      if(!isNaN(refObj['lowValue']) && !isNaN(refObj['highValue'])) {
        var lowCoord = axis.getCoordAt(refObj['lowValue']);
        var highCoord = axis.getCoordAt(refObj['highValue']);
        
        // Use the bounded coords if necessary
        if(lowCoord === null && highCoord === null) {
          // Both points outside, only render if the bounded coords don't match (above max and below min)
          lowCoord = axis.getBoundedCoordAt(refObj['lowValue']);
          highCoord = axis.getBoundedCoordAt(refObj['highValue']);
          if(lowCoord == highCoord)
            continue;
        }
        else if(lowCoord === null)
          lowCoord = axis.getBoundedCoordAt(refObj['lowValue']);
        else if(highCoord === null)
          highCoord = axis.getBoundedCoordAt(refObj['highValue']);
        
        var points;
        if(bHoriz)
          points = [lowCoord, 0, highCoord, 0, highCoord, plotAreaBounds.h, lowCoord, plotAreaBounds.h];
        else
          points = [0, lowCoord, 0, highCoord, plotAreaBounds.w, highCoord, plotAreaBounds.w, lowCoord];
        
        shape = new DvtPolygon(chart.getContext(), points);
        
        // Set style attributes
        shape.setFill(new DvtSolidFill(refObj['color']));
      }
    }
    else if(type == "line") {
      if(!isNaN(refObj['lineValue'])) {
        var lineCoord = axis.getCoordAt(refObj['lineValue']);
        
        // Don't continue if the line is outside of the axis
        if(lineCoord === null)
          continue;
        
        if(bHoriz)
          shape = new DvtLine(chart.getContext(), lineCoord, 0, lineCoord, plotAreaBounds.h);
        else
          shape = new DvtLine(chart.getContext(), 0, lineCoord, plotAreaBounds.w, lineCoord);
        
        // Set style attributes
        var lineWidth = refObj['lineWidth'] ? refObj['lineWidth'] : 1;
        var stroke = new DvtSolidStroke(refObj['color'], 1, lineWidth);
        if(refObj['lineStyle'])
          stroke.setStyle(DvtStroke.convertTypeString(refObj['lineStyle']));
        
        shape.setStroke(stroke);
        shape.setPixelHinting(true);
      }
    }
    
    // Tooltip Support
    var tooltip = DvtChartTooltipUtils.getRefObjTooltip(chart, refObj);
    chart.getEventManager().associate(shape, new DvtSimpleObjPeer(tooltip));
    
    // Add the shape to the container
    container.addChild(shape);
    
    // WAI-ARIA
    shape.setAriaRole("img");
    shape.setAriaProperty("label", tooltip);
  }
}
/*--------------------------------------------------------------------*/
/*   DvtDataCursor              Data Cursor Component                 */
/*--------------------------------------------------------------------*/
/**
  *  Data cursor component.
  *  @extends DvtObj
  *  @class DvtDataCursor  Creates a data cursor component.
  *  @constructor  
  *  @param {DvtContext} context The context object
  */
var   DvtDataCursor = function(context)
{
    this.Init(context);
}  

DvtObj.createSubclass(DvtDataCursor, DvtContainer, "DvtDataCursor");

DvtDataCursor.DEFAULT_BACKGROUND_COLOR = "#ffffff";
DvtDataCursor.BEHAVIOR_SNAP = "SNAP";
DvtDataCursor.BEHAVIOR_SMOOTH = "SMOOTH";
DvtDataCursor.BEHAVIOR_AUTO = "AUTO";

DvtDataCursor.prototype.Init = function(context) {
   this._context = context;
   
   if (! this.getImpl()) {
     this.setImpl(context.getImplFactory().newContainer("dc")) ;
   }
   DvtDataCursor.superclass.Init.call(this, context) ;
   this._textContainer = new DvtContainer(context, "dcTextContainer");
   this._textHolder = new DvtContainer(context, "dcTextHolder");
   this._textContainer.addChild(this._textHolder);
   this.addChild(this._textContainer);
   this._textItems = new Array();
   this._cursorLineWidth = 2;
   this._pointerHeight = 0;
   this._dataTooltipBorderWidth = 2;
   this._cursorTopOffset = 5;
   this._lineColor = "black"; //"rgb(193, 194, 211)";
   this.setMouseEnabled(false);
   this._behavior = DvtDataCursor.BEHAVIOR_AUTO;
   this._dataCursorBounds = new DvtRectangle(0,0,1000,1000);
}

/**
 * Renders this data cursor.
 */
DvtDataCursor.prototype.Render = function() {

    // Default            
    if (!this._font)
        this._font = new DvtFont();

    // Cursor
    var tooltipBorderColor = this._borderColor;
    var textPadding = 2;

    if (this._cursorText) {
        this._textHolder.removeChildren();
    }
    var cursorText = new DvtTextArea(this._context, 0, 0);
    this._textHolder.addChild(cursorText);
    cursorText.setMouseEnabled(false);
    this._cursorText = cursorText;
    DvtTextUtils.applyFont(this._cursorText, this._font);
    this._cursorText.setMaxWidth(100000000);
    
    this._cursorText.alignTop(); 
    this._cursorText.alignMiddle();
    this._cursorText.setText(this._tooltipLines);

    var textDimensions = this._cursorText.getDimensions();
    var textHeight = textDimensions.h;
    var textWidth = textDimensions.w;
    
    var dataTextBoxHeight = textHeight + 2*textPadding + this._dataTooltipBorderWidth;
    var dataTextBoxWidth = textWidth + 2*textPadding + this._dataTooltipBorderWidth;
    
    this._cursorText.setTranslateX(dataTextBoxWidth/2);
    this._cursorText.setTranslateY(textPadding + this._dataTooltipBorderWidth/2);
    
    // Box around the tooltip
    if (!this._dataTextBox) {
        var dataTextBox = new DvtRect(this._context, 0, 0, dataTextBoxWidth, dataTextBoxHeight);

        if (!this._tooltipFill)
            this._tooltipFill = new DvtSolidFill(DvtDataCursor.DEFAULT_BACKGROUND_COLOR);
        dataTextBox.setFill(this._tooltipFill);

        dataTextBox.setMouseEnabled(false);
        this._dataTextBox = dataTextBox;
        this._textContainer.addChildAt(this._dataTextBox, 0);
    }
    this._dataTextBox.setWidth(dataTextBoxWidth);
    this._dataTextBox.setHeight(dataTextBoxHeight);

    var dataTextStroke = new DvtSolidStroke(tooltipBorderColor, 1, this._dataTooltipBorderWidth);
    this._dataTextBox.setStroke(dataTextStroke);
 
    // Data cursor stick
    this._renderCursorLines();    
    // End adjust position
    this._setTranslatePosition();
    
}

DvtDataCursor.prototype.setBounds = function(bounds) {
    this._bounds = bounds;
}

DvtDataCursor.prototype.setCurrentPoint = function(point) {
    this._currentPoint = point;
}

DvtDataCursor.prototype.setText = function(tooltipLines) {
    this._tooltipLines = tooltipLines;
}

DvtDataCursor.prototype.setFont = function(font) {
    this._font = font;
}

DvtDataCursor.prototype.setLineColor = function(lineColor) {
    this._lineColor = lineColor;
}

DvtDataCursor.prototype.getLineColor = function() {
    return this._lineColor;
}

DvtDataCursor.prototype.setBehavior = function(behavior) {
    this._behavior = behavior;
}

DvtDataCursor.prototype.getBehavior = function() {
    return this._behavior;
}

DvtDataCursor.prototype.setTooltipFill = function(tooltipFill) {
    this._tooltipFill = tooltipFill;
}

DvtDataCursor.prototype.setDataCursorBounds = function(dataCursorBounds) {
    this._dataCursorBounds = dataCursorBounds;
}

DvtDataCursor.prototype._fitInBounds = function(bounds, baseX, baseY) {
    bounds.x = bounds.x + baseX;
    bounds.y = bounds.y + baseY;
    
    var offsets = DvtGeomUtils.GetOffsetValues(bounds, this._dataCursorBounds, 5);
    
    this._textContainer.setTranslateX(offsets.offsetX + baseX); 
    this._textContainer.setTranslateY(offsets.offsetY + baseY); 

    this._adjustShapes(offsets);
}

DvtDataCursor.prototype.getCursorLineBounds= function() {
    var cursorDim = this._rect.getDimensions();
    cursorDim.x += this._rect.getTranslateX() + this.getTranslateX();
    cursorDim.y += this._rect.getTranslateY() + this.getTranslateY();
    return cursorDim;
}

DvtDataCursor.prototype._adjustShapes = function(offsets) {
}

DvtDataCursor.prototype.getTextContainer = function() {
  return this._textContainer;
}

var   DvtDataCursorHorizontal = function(context)
{
   DvtDataCursorHorizontal.superclass.Init.call(this, context) ;
}  

DvtObj.createSubclass(DvtDataCursorHorizontal, DvtDataCursor, "DvtDataCursorHorizontal");

DvtDataCursorHorizontal.prototype._renderCursorLines = function() {
    if (!this._rect) {
        var rect = new DvtContainer(this._context, "dcLine");
        var mainLine = new DvtRect(this._context, 0, 0, 10, this._cursorLineWidth);
        mainLine.setMouseEnabled(false);
        mainLine.setFill(new DvtSolidFill(this._lineColor, 1));

        //var shadowLine = new DvtRect(this._context, this._cursorLineWidth, this._cursorLineWidth, 10, this._cursorLineWidth);
        //shadowLine.setMouseEnabled(false);
        //shadowLine.setFill(new DvtSolidFill(this._lineColor, 0.35));

        //rect.addChild(shadowLine);
        rect.addChild(mainLine);
        
        this.addChildAt(rect, 0);
        
        this._rect = rect;
        this._mainLine = mainLine;
        //this._shadowLine = shadowLine;

    }    
    var textBoxWidth = this._dataTextBox.getWidth();

    this._rect.setTranslateY(-this._cursorLineWidth/2);
    
    var lineLength = this._bounds.w - textBoxWidth + this._cursorTopOffset - this._dataTooltipBorderWidth/2;
    if (lineLength < 0)
        lineLength = 0;
    this._mainLine.setWidth(lineLength);
    //this._shadowLine.setWidth(lineLength);

}

DvtDataCursorHorizontal.prototype._setTranslatePosition = function() {
    this.setTranslateX(this._bounds.x);
    this.setTranslateY(this._currentPoint.y);

    var dim = new DvtRectangle(this._bounds.x, this._currentPoint.y, this._dataTextBox.getWidth(), this._dataTextBox.getHeight());
    dim = DvtGeomUtils.getPaddedRectangle(dim, this._dataTooltipBorderWidth/2);
    this._fitInBounds(dim, this._bounds.w - this._dataTextBox.getWidth() + this._cursorTopOffset, -this._dataTextBox.getHeight()/2);

}

DvtDataCursorHorizontal.prototype._adjustShapes = function(offsets) {
    var oldWidth = this._mainLine.getWidth();
    var newWidth = oldWidth + offsets.offsetX;
    if (newWidth < 0)
        newWidth = 0;
    this._mainLine.setWidth(newWidth);
}

var   DvtDataCursorVertical = function(context)
{
   DvtDataCursorVertical.superclass.Init.call(this, context) ;
}  

DvtObj.createSubclass(DvtDataCursorVertical, DvtDataCursor, "DvtDataCursorVertical");

DvtDataCursorVertical.prototype._renderCursorLines = function() {
    if (!this._rect) {
        var rect = new DvtContainer(this._context, "dcLine");
        var mainLine = new DvtRect(this._context, 0, 0, this._cursorLineWidth, 10);
        mainLine.setMouseEnabled(false);
        mainLine.setFill(new DvtSolidFill(this._lineColor, 1));

        var shadowLine = new DvtRect(this._context, this._cursorLineWidth, this._cursorLineWidth, this._cursorLineWidth, 10);
        shadowLine.setMouseEnabled(false);
        shadowLine.setFill(new DvtSolidFill(this._lineColor, 0.35));

        //rect.addChild(shadowLine);
        rect.addChild(mainLine);
        
        this.addChildAt(rect, 0);
        
        this._rect = rect;
        this._mainLine = mainLine;
        //this._shadowLine = shadowLine;
    }
    var textBoxHeight = this._dataTextBox.getHeight();
    this._rect.setTranslateX(-this._cursorLineWidth/2);
    this._rect.setTranslateY(textBoxHeight+this._pointerHeight + this._dataTooltipBorderWidth/2);

    var lineLength = this._bounds.h + this._cursorTopOffset - textBoxHeight - this._pointerHeight - this._dataTooltipBorderWidth;
    if (lineLength < 0)
        lineLength = 0;
    this._mainLine.setHeight(lineLength);
    //this._shadowLine.setHeight(lineLength);

}

DvtDataCursorVertical.prototype._setTranslatePosition = function() {
    this.setTranslateX(this._currentPoint.x);
    this.setTranslateY(this._bounds.y - this._cursorTopOffset + this._dataTooltipBorderWidth/2);

    var dim = new DvtRectangle(this._currentPoint.x, this._bounds.y - this._cursorTopOffset, this._dataTextBox.getWidth(), this._dataTextBox.getHeight());
    dim = DvtGeomUtils.getPaddedRectangle(dim, this._dataTooltipBorderWidth/2);
    this._fitInBounds(dim, -this._dataTextBox.getWidth()/2, 0);
}

DvtDataCursorVertical.prototype._adjustShapes = function(offsets) {
    var oldHeight = this._mainLine.getHeight();
    var newHeight = oldHeight - offsets.offsetY;
    if (newHeight < 0)
        newHeight = 0;
    this._mainLine.setHeight(newHeight);
    var oldY = this._rect.getTranslateY();
    this._rect.setTranslateY(oldY + offsets.offsetY);
   // oldY = this._arrowPointer.getTranslateY();
   // this._arrowPointer.setTranslateY(oldY + offsets.offsetY);
}
// Copyright (c) 2008, 2013, Oracle and/or its affiliates. 
// All rights reserved. 
/*---------------------------------------------------------------------*/
/*  DvtDCEH                 Data Cursor Event Handler                  */
/*---------------------------------------------------------------------*/
/**
  *  @class  DvtDCEH 
  *  @extends DvtObj
  *  @constructor
  */
var  DvtDCEH = function(context, dataCursor, markerContainer)
{
  this._Init(context, dataCursor, markerContainer)
};

DvtObj.createSubclass(DvtDCEH, DvtObj, "DvtDCEH") ;

DvtDCEH.prototype._Init = function(context, dataCursor, markerContainer)
{
   this._context    = context;
   this._dataCursorShown = false;
   this._horizontal = false;
   this._useAllInGroup = false;
   this._isNumericMainAxis = false;
   this._dataCursor = dataCursor;
   this._markerContainer = markerContainer;
   this._threeDHorizontalOffset = 0;
};

// Show/hide the data cursor based on the global page coordinates of the action
// Returns whether or not data cursor is shown
DvtDCEH.prototype.processMove = function( pageX, pageY, targetObj, logicalObj ) {
   if (!targetObj) {
       this._removeDataCursor();
       return;
   }

   var pos = this._context.getRelativePosition(pageX, pageY);
   var x = pos.x;
   var y = pos.y;

   var blockEventsRect = this.getActionablePlotRect(x, y, logicalObj);
   if (blockEventsRect) {
       // Show the data cursor only if the current point is within the plot area
       this._showDataCursor(blockEventsRect, x, y, targetObj);
       this._dataCursorShown = true;
       return true;
   } else {
       this._removeDataCursor();
       this._dataCursorShown = false;
   }
   return false;

}

DvtDCEH.prototype.processEnd = function() {
    this._removeDataCursor(); 
}

DvtDCEH.prototype.processOut = function(pos) {
   var plotRect = this.getPlotRect();
   if (!plotRect.containsPoint(pos.x, pos.y)) {
       this._removeDataCursor();
   }
}

// Display the data cursor
DvtDCEH.prototype._showDataCursor = function(plotRect, x, y, targetObj) {
//Get location of the textbox in the data cursor for later manipulation
    var box=this._markerContainer.getChildAt(0).getChildAt(1);
    var dataCursor = this._dataCursor;
    
    dataCursor.setBounds(plotRect);
    
    var closestMatch =  this.getClosestMatch(x, y, targetObj, plotRect);
    if (closestMatch == null) {
       this._removeDataCursor();
       return false;
    }
    var centerPoint = DvtGeomUtils.getCenterPoint(closestMatch.matchRegion);
    var dataX = centerPoint.x;
    var dataY = centerPoint.y;
    
    // Follow mouse
    var dcX = x;
    var dcY = y;
    if (dataCursor.getBehavior() == DvtDataCursor.BEHAVIOR_SNAP) {
        if (dataCursor instanceof DvtDataCursorVertical) {
            dcX = dataX;
            if (dcX < plotRect.x) {
                dcX = plotRect.x;
            } else if (dcX > plotRect.x + plotRect.w) {
                dcX = plotRect.x + plotRect.w;
            }
        } else {
            dcY = dataY;        
            if (dcY < plotRect.y) {
                dcY = plotRect.y;
            } else if (dcY > plotRect.y + plotRect.h) {
                dcY = plotRect.y + plotRect.h;
            }
        }
    }
    
    // Regardless of behavior, the data cursor itself should always be within the front plane of the plot area (in 3d graphs)
    if (this._threeDHorizontalOffset) {
        var xExtent = plotRect.x + plotRect.w - this._threeDHorizontalOffset;
        if (dcX > xExtent)
            dcX = xExtent;
    }
    
    dataCursor.setCurrentPoint(new DvtPoint(dcX, dcY));
    
    var currentSeries = closestMatch.sidx;
    var currentGroup = closestMatch.gidx;
    var ttipText = this.getTooltipText(closestMatch);
    
    var seriesColor = this.getSeriesColor(currentSeries, currentGroup);
    
    var totalSize = 16;
    var outerCircleSize = 12;
    var coloredDotSize = 8;

    if (!this._marker) {
        var marker = new DvtContainer(this._context, "dotContainer");
        var outerOffset = (totalSize - outerCircleSize)/2;
        var coloredDotOffset = (totalSize - coloredDotSize)/2; 
        var borderCircle = new DvtMarker(this._context, DvtMarker.CIRCLE, 0, 0, totalSize, totalSize);
        var outerCircle = new DvtMarker(this._context, DvtMarker.CIRCLE, outerOffset, outerOffset, outerCircleSize, outerCircleSize);
        var coloredDot = new DvtMarker(this._context, DvtMarker.CIRCLE, coloredDotOffset, coloredDotOffset, coloredDotSize, coloredDotSize);

        var borderCircleFill = new DvtSolidFill("black", 1);
        borderCircle.setFill(borderCircleFill);

        var fill = new DvtSolidFill("white", 1);
        outerCircle.setFill(fill);

        marker.setMouseEnabled(false);
        borderCircle.setMouseEnabled(false);
        outerCircle.setMouseEnabled(false);
        coloredDot.setMouseEnabled(false);

        marker.addChild(borderCircle);
        marker.addChild(outerCircle);
        marker.addChild(coloredDot);

        this._coloredDot = coloredDot;    
        this._marker = marker;
    }
    var marker = this._marker;
    var coloredDot = this._coloredDot;
    var fill = new DvtSolidFill(seriesColor, 1);
    coloredDot.setFill(fill);

    var markerX = dataX - totalSize / 2;
    var markerY = dataY - totalSize / 2;

    marker.setTranslateX(markerX);
    marker.setTranslateY(markerY);
    //Add data marker to the top layer at the moment
    this._markerContainer.addChildAt(marker, 1);
    this._marker.setVisible(true);
    dataCursor._borderColor = seriesColor;
    if (!ttipText || ttipText == "") {
        dataCursor.setVisible(false);
        dataCursor.getTextContainer().setVisible(false);
    }
    else {
        dataCursor.setVisible(true);
        dataCursor.getTextContainer().setVisible(true);
    }
    dataCursor.setText(ttipText);
    dataCursor.Render();
    
    //We need to add the text box from data cursor to the top layer and then align the box to its previous position.
    this._markerContainer.addChild(box);
    var topBox=this._markerContainer.getChildAt(2);
    if (topBox != null) {
        topBox.setTranslateX(this._dataCursor.getTranslateX() - this._dataCursor._dataTextBox.getWidth() / 2);
        topBox.setTranslateY(this._dataCursor.getTranslateY());
    }

    return true;
}

// Remove the data cursor
DvtDCEH.prototype._removeDataCursor = function() {
    var dataCursor = this._dataCursor;

    if (dataCursor.getVisible()) {
        dataCursor.setVisible(false);
        dataCursor.getTextContainer().setVisible(false);
    }
    // Marker showing current point
    if(this._marker) {
        this._marker.setVisible(false);
    }       

}

DvtDCEH.prototype.isDataCursorShown = function() {
    return this._dataCursorShown;
}

DvtDCEH.AddPotentialMatch = function(matches, matchObj, plotRect, isHorizontal) {
    var region = matchObj.matchRegion;
    if (isHorizontal) {
        if (region.y + region.h < plotRect.y || region.y > plotRect.y + plotRect.h) {
            return false;
        }
   } else {
        if (region.x + region.w < plotRect.x || region.x > plotRect.x + plotRect.w) {
            return false;
        }
   }
   matches.push(matchObj);
   return true;
}

DvtDCEH.GetClosestMatchSecondDirection = function(matchesInBounds, horizontal, x, y) {
   var closestMatch = null;
   var minDiff = 100000000;
   for (var i=0; i<matchesInBounds.length; i++) {
       var match = matchesInBounds[i];
       var lowerBound = (horizontal) ? match.matchRegion.x : match.matchRegion.y;
       var higherBound = (horizontal) ? match.matchRegion.x+match.matchRegion.w : match.matchRegion.y+match.matchRegion.h;
       var value = (horizontal) ? x : y;
       var midPoint = (lowerBound + higherBound)/2;
       var diffValue = Math.abs(midPoint - value);
       if (diffValue < minDiff) {
           minDiff = diffValue;
           closestMatch = match;
       }
   }
   return closestMatch;
}

DvtDCEH.GetClosestMatchesFirstDirection = function(matches, horizontal, x, y) {
   var minDiff = 10000000;
   var closestFirstDirectionMatches = new Array();
   // Get closest matches
   for (var i=0; i<matches.length; i++) {
       var matchObj = matches[i];
       var lowerBound = (horizontal) ? matchObj.matchRegion.y : matchObj.matchRegion.x;
       var higherBound = (horizontal) ? matchObj.matchRegion.y+matchObj.matchRegion.h : matchObj.matchRegion.x+matchObj.matchRegion.w;
       var value = (horizontal) ? y : x;
    
       var midPoint = (lowerBound + higherBound)/2;
       var diffValue = Math.abs(midPoint - value);
       if (diffValue <= minDiff) {
            if (diffValue < minDiff) {
                closestFirstDirectionMatches = new Array();
            }
           closestFirstDirectionMatches.push(matchObj);
           minDiff = diffValue;
       }
   }
   return closestFirstDirectionMatches;
}

DvtDCEH.prototype.getActionablePlotRect = function(x, y, logicalObj) {
   return null;
}

DvtDCEH.prototype.getPlotRect = function() {
   return null;
}

DvtDCEH.prototype.getSeriesColor = function(series) {
   return "black";
}

DvtDCEH.prototype.getTooltipText = function(closestMatch) {
   return "Base class should override";
}

DvtDCEH.prototype.getTargetSeriesIndex = function(targetObj) {
   return -1;
}

DvtDCEH.prototype.findMatches = function(x, y, targetObj, matches, plotRect, targetSeriesIndex) {
  return null;
}

DvtDCEH.prototype.getClosestMatch = function(x, y, targetObj, plotRect) {
   var horizontal = this._horizontal;
   var useAllInGroup = this._useAllInGroup;
   var isNumericMainAxis = this._isNumericMainAxis;

   var targetSeriesIndex = this.getTargetSeriesIndex(targetObj);

   var matches = new Array();
   var immediateMatch = this.findMatches(x, y, targetObj, matches, plotRect, targetSeriesIndex)
   if (immediateMatch)
     return immediateMatch;
    
   var closestFirstDirectionMatches = DvtDCEH.GetClosestMatchesFirstDirection(matches, horizontal, x, y);

   var matchesInBounds = closestFirstDirectionMatches;

  // Non-numerical x axis
   if (!isNumericMainAxis) {
       var closestLowerBound = 1000000;
       var closestHigherBound = -1000000;
       var closestGroup = null;

       for (var i=0; i<closestFirstDirectionMatches.length; i++) {
           var closestFirstDirectionMatch = closestFirstDirectionMatches[i];
           closestLowerBound = Math.min(closestLowerBound, (horizontal) ? closestFirstDirectionMatch.matchRegion.y : closestFirstDirectionMatch.matchRegion.x);
           closestHigherBound = Math.max(closestHigherBound, (horizontal) ? closestFirstDirectionMatch.matchRegion.y+closestFirstDirectionMatch.matchRegion.h : closestFirstDirectionMatch.matchRegion.x+closestFirstDirectionMatch.matchRegion.w);
           closestGroup = closestFirstDirectionMatch.gidx;
       }
       
       for (var i=0; i<matches.length; i++) {
           var match = matches[i];
           var itemGroup = match.gidx;
           if (useAllInGroup) {
               if (closestGroup == itemGroup) {
                   matchesInBounds.push(match);
               }
           } else {
               var lowerBound = (horizontal) ? match.matchRegion.y : match.matchRegion.x;
               var higherBound = (horizontal) ? match.matchRegion.y+match.matchRegion.h : match.matchRegion.x+match.matchRegion.w;
               var midPoint = (lowerBound + higherBound)/2;
               if (closestHigherBound >= midPoint && closestLowerBound <= midPoint) {
                   matchesInBounds.push(match);
               } 
               
           }
       }
   }
   return DvtDCEH.GetClosestMatchSecondDirection(matchesInBounds, horizontal, x, y);
}


DvtDCEH.getGlobalBounds = function(obj) {
   var dim = obj.getDimensions(obj.getParent());
   var stagePoint = obj.getParent().localToStage(new DvtPoint(dim.x, dim.y));
   dim.x = stagePoint.x;
   dim.y = stagePoint.y;
   return dim;
}
/**
 * @constructor
 */
var  DvtChartDCEH = function(chart)
{
  this._Init(chart)
};

DvtObj.createSubclass(DvtChartDCEH, DvtDCEH, "DvtChartDCEH") ;

DvtChartDCEH.prototype._Init = function(chart)
{
   DvtChartDCEH.superclass._Init.call(this, chart.getContext(), chart._dataCursor, chart._dcContainer) ;
   this._Chart  = chart ;
   this._horizontal = DvtChartTypeUtils.isHorizontal(chart);
   this._useAllInGroup = DvtChartTypeUtils.isArea(chart) || DvtChartTypeUtils.isLine(chart);
   this._isNumericMainAxis = DvtChartTypeUtils.isScatter(chart) || DvtChartTypeUtils.isBubble(chart);
 //  this._threeDHorizontalOffset = chart._threeDHorizontalOffset;
   this._isStockChart = false;
   
   this._isArea = DvtChartTypeUtils.isArea(chart);
};

DvtChartDCEH.prototype.getPlotRect = function() {
   var chart = this._Chart;
   var plot = chart._plotRect;
   var dim = plot.getDimensions();
   var stagePoint = plot.localToStage(new DvtPoint(dim.x, dim.y));
   dim.x = stagePoint.x;
   dim.y = stagePoint.y;
   return dim;
}

DvtChartDCEH.prototype.getActionablePlotRect = function(x, y, logicalObj) {
   var plotRect = this.getPlotRect();
   if (plotRect.containsPoint(x, y)) {
       return plotRect;
   }
   return null;
}

DvtChartDCEH.prototype.findMatches = function(x, y, targetObj, matches, plotRect, targetSeriesIndex) {
  var chart = this._Chart;
  var eventManager = chart.getEventManager();
    
  var immediateMatch = null;
  if (!chart._currentMarkers)
    return null;

  var seriesFilter = null;
  // Filter to only items with series focus
  if (chart._currentSeriesCategory) {
      var sidx = DvtChartDataUtils.getSeriesIndex(chart, chart._currentSeriesCategory);
      if (sidx != -1) {
        if (!seriesFilter)
            seriesFilter = new Object();
        seriesFilter[sidx] = true;
      }
  }
  // For area, if the pointer is over an area polygon, filter to items in that series
  if (seriesFilter == null && this._isArea) {
      var currentAreas = chart._currentAreas;
      if (currentAreas) {
        for (var i=0;i<currentAreas.length; i++) {
            var area = currentAreas[i];
            if (targetObj == area) {
                if (!seriesFilter)
                    seriesFilter = new Object();
                seriesFilter[eventManager.GetLogicalObject(area).getSeriesIndex()] = true;
            }
        }
      }
  }
  for (var i=0; i<chart._currentMarkers.length;i++) {
      var markers = chart._currentMarkers[i];
      var numMarkers = markers.length;

      for (var idx = 0;idx < numMarkers; idx++)  {
          var item = markers[idx];
          var logicalObject = eventManager.GetLogicalObject(item);
          var seriesIndex = logicalObject.getSeriesIndex();
          // If a series filter is defined, filter by only allowing series which are true in mapping
          if (!seriesFilter || (seriesFilter && seriesFilter[seriesIndex])) {          
              var dim = DvtDCEH.getGlobalBounds(item);
              var match = { obj: item, matchRegion: dim, gidx: logicalObject.getGroupIndex(), sidx: seriesIndex, marker: null };
              matches.push(match);
          }
      }
  }
  return immediateMatch;
}

DvtChartDCEH.prototype.getSeriesColor = function(seriesIndex, groupIndex) {
    var chart = this._Chart;
    return DvtChartTooltipUtils.getDatatipColor(chart, seriesIndex, groupIndex);
}

DvtChartDCEH.prototype.getTooltipText = function(closestMatch) {
    var chart = this._Chart;
    return DvtChartTooltipUtils.getDatatip(closestMatch.obj, chart, closestMatch.sidx, closestMatch.gidx);
}

