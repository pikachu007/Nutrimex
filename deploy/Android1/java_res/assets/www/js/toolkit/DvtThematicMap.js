/**
 * @constructor
 */
var DvtAbstractComponent = function(context)
{
  this.Init(context);
};

DvtObj.createSubclass(DvtAbstractComponent, DvtContainer, "DvtAbstractComponent");

DvtAbstractComponent.LOAD_XML_INITIAL = "initial";

DvtAbstractComponent._DEFAULT_BACKGROUND_COLOR = '#7396C8';

DvtAbstractComponent._ELEM_ROOT = "r";
DvtAbstractComponent._ATTR_INLINE_STYLE = "inlineStyle";
DvtAbstractComponent._ATTR_SKIN_STYLE = "skinStyle";
DvtAbstractComponent._ATTR_SKIN_NAME = "skin";

// control panel skinning
DvtAbstractComponent._ATTR_CTRLPANEL_BACKGROUND_COLOR = "cpBackgroundColor";
DvtAbstractComponent._ATTR_CTRLPANEL_BORDER_COLOR = "cpBorderColor";
DvtAbstractComponent._ATTR_CTRLPANEL_BOX_SHADOW = "cpBoxShadow";
DvtAbstractComponent._ATTR_CTRLPANEL_BORDER_RADIUS = "cpBorderRadius";
DvtAbstractComponent.BOX_SHADOW = "box-shadow";
DvtAbstractComponent.BG_ALPHA = "background-alpha";

DvtAbstractComponent._ATTR_TAB_BG_COLOR_INACTIVE = "tabBorderColorInactive";
DvtAbstractComponent._ATTR_TAB_BORDER_COLOR_INACTIVE = "tabBgColorInactive";
DvtAbstractComponent.TAB_BG_COLOR_INACTIVE = "tab-color-inactive";
DvtAbstractComponent.TAB_BORDER_COLOR_INACTIVE = "tab-border-color-inactive";
DvtAbstractComponent.CP_BUTTON_WIDTH = "button-width";
DvtAbstractComponent.CP_BUTTON_HEIGHT = "button-height";
DvtAbstractComponent.CP_TAB_SIZE = "tab-size";
DvtAbstractComponent.CP_PADDING_TOP = "padding-top";
DvtAbstractComponent.CP_PADDING_SIDE = "padding-side";
DvtAbstractComponent.CP_PRIME = "prime-style";
DvtAbstractComponent.CP_IMAGE_WIDTH = "image-width";
DvtAbstractComponent.CP_IMAGE_HEIGHT = "image-height";

DvtAbstractComponent.prototype.Init = function(context)
{
  DvtAbstractComponent.superclass.Init.call(this, context);  

  this._backgroundPane = new DvtRect(context, 0, 0, 0, 0);
  this.addChild(this._backgroundPane);
  
  this._resourcesMap = null;
  this._compCSSStyle = null;
  this._controlPanelStyleMap = null;
  this._skinName = "";
  //flag indicating if we're currently rendering null xml, for example based on 
  //a resize event from the peer
  this._bRenderNullXml = false;
};

DvtAbstractComponent.prototype.getBackgroundPane = function()
{
  return this._backgroundPane;
};

DvtAbstractComponent.prototype.renderComponent = function()
{
  this.InitComponentInternal();
  this.RenderComponentInternal();
};

DvtAbstractComponent.prototype.InitComponentInternal = function() {
  this._bAbsCompRendered = false;
};

DvtAbstractComponent.prototype.RenderComponentInternal = function()
{
  //subclasses must extend
  
  if (!this._bAbsCompRendered)
  {
    this.RenderBackground();
  }
  
  this._bAbsCompRendered = true;
};

DvtAbstractComponent.prototype.loadXml = function(xmlString, eventType, paramKeys, paramValues)
{
  var parser = this.GetXmlStringParser();
  if (parser)
  {
    var rootXmlNode = parser.parse(xmlString);
    if (rootXmlNode)
    {
      if (rootXmlNode.getName() === DvtAbstractComponent._ELEM_ROOT)
        rootXmlNode = rootXmlNode.getFirstChild();
      
      if (rootXmlNode)
        this.LoadXmlDom(eventType, rootXmlNode, paramKeys, paramValues);
    }
  }
};

DvtAbstractComponent.prototype.GetXmlStringParser = function()
{
  return new DvtXmlParser(this.getContext());
};

DvtAbstractComponent.prototype.LoadXmlDom = function(eventType, rootXmlNode, paramKeys, paramValues)
{
  switch (eventType)
  {
    case DvtAbstractComponent.LOAD_XML_INITIAL:
    default:
      this.LoadXmlInitial(eventType, rootXmlNode, paramKeys, paramValues);
      break;
  }
};

DvtAbstractComponent.prototype.LoadXmlInitial = function(eventType, rootXmlNode, paramKeys, paramValues)
{
  //subclasses must override
};

DvtAbstractComponent.prototype.render = function(xmlString, width, height)
{
  this._width = width;
  this._height = height;
  
  this._backgroundPane.setWidth(this._width);
  this._backgroundPane.setHeight(this._height);

  //set the flag that we're rendering null xml
  if (!xmlString) {
    this._bRenderNullXml = true;
  }
  
  this.loadXml(xmlString);
  this.renderComponent();

  //reset the flag for rendering null xml
  this._bRenderNullXml = false;

  this.getContext().queueRender();
};

DvtAbstractComponent.prototype.setBackgroundColor = function(color)
{
  this._backgroundColor = color;
};

DvtAbstractComponent.prototype.RenderBackground = function()
{
  //BUG FIX 13704008: if there's an inlineStyle, use its attributes
  //when rendering the background
  if (this.getComponentStyle()) {
    var fill = this._getBackgroundFill();
    if (fill) {
      this._backgroundPane.setFill(fill);
    }
  }
  else if (this._backgroundColor != 'none') {
    var fill = this._getBackgroundGradient(this._backgroundColor);
    this._backgroundPane.setFill(fill);
  }  
  else {
    this._backgroundPane.setFill(new DvtSolidFill("#FFFFFF", 0));
    this._backgroundPane.setStroke(new DvtSolidStroke("#FFFFFF", 0));
  }
};

DvtAbstractComponent.prototype._getBackgroundFill = function() {
  var compCSSStyle = this.getComponentStyle();
  if (compCSSStyle) {
    var fillType = compCSSStyle[DvtCSSStyle.FILL_TYPE];
    var bgColor = compCSSStyle[DvtCSSStyle.BACKGROUND_COLOR];
    if (!bgColor) {
      bgColor = DvtAbstractComponent._DEFAULT_BACKGROUND_COLOR;
    }
    if (fillType == "solid") {
      return new DvtSolidFill(bgColor);
    }
    else {
      return this._getBackgroundGradient(bgColor);
    }
  }
};

DvtAbstractComponent.prototype._getBackgroundGradient = function(color)
{
  var startColor = '#FFFFFF';
	var midOneColor = '#FFFFFF';
	var midTwoColor = '#AECDEA';
	var endColor = DvtAbstractComponent._DEFAULT_BACKGROUND_COLOR;
  var arColors;
  var bgAlpha = 1;
  
	if (color && color != endColor) {
    //BUG FIX 13704008: get alpha from the given color
    bgAlpha = DvtColorUtils.getAlpha(color);
    
		var rrRatio = (DvtColorUtils.getRed(midTwoColor) - DvtColorUtils.getRed(endColor)) / 
                  (0xff - DvtColorUtils.getRed(endColor));
		var ggRatio = (DvtColorUtils.getGreen(midTwoColor) - DvtColorUtils.getGreen(endColor)) / 
		              (0xff - DvtColorUtils.getGreen(endColor));
		var bbRatio = (DvtColorUtils.getBlue(midTwoColor) - DvtColorUtils.getBlue(endColor)) / 
		              (0xff - DvtColorUtils.getBlue(endColor));
		var rr = DvtColorUtils.getRed(color);
		var gg = DvtColorUtils.getGreen(color);
		var bb = DvtColorUtils.getBlue(color);
		var newRR = Math.round(rr + rrRatio * (0xff - rr));
		var newGG = Math.round(gg + ggRatio * (0xff - gg));
		var newBB = Math.round(bb + bbRatio * (0xff - bb));
		var newColor = DvtColorUtils.makeRGB(newRR, newGG, newBB);
    //BUG FIX 13704008: make sure to get the RGB (without alpha) from 
    //the given color so that the browser doesn't misinterpret the 
    //#aarrggbb format (it may assume the color is really #aarrgg)
    var bgRgb = DvtColorUtils.getRGB(color);
		arColors = new Array(startColor, midOneColor, newColor, bgRgb);
	} else {
		arColors = [startColor,midOneColor,midTwoColor,endColor];
	}
  
  var arAlphas = [bgAlpha, bgAlpha, bgAlpha, bgAlpha];
  var arStops = [0, 45/255, 190/255, 1];
  
  var xx = 0;
  var yy = 0;
  var ww = this._width;
  var hh = this._height;
  var n = 1.7;
  var gw = ww*n*n;
  var gh = hh*n;
  var gx = xx+((ww-gw)/2);
  var gy = yy-35;
  
  var cx = gx + gw / 2;
  var cy = gy + gh / 2;
  //TODO: not sure how to corectly calculate single r for a non-square 
  //bounding rect...
  var r = 1.5 * Math.min(gw / 2, gh / 2);
  var arBounds = [gx, gy, gw, gh];
  
  var fill = new DvtRadialGradientFill(arColors, arAlphas, arStops, cx, cy, r, arBounds);
  return fill;
}
                                       

DvtAbstractComponent.prototype.GetWidth = function() {
  return this._width;
}

DvtAbstractComponent.prototype.GetHeight = function() {
  return this._height;
}

DvtAbstractComponent.prototype.getResourcesMap = function() {
  if (!this._resourcesMap) {
    this._resourcesMap = {};
  }
  return this._resourcesMap;
};


DvtAbstractComponent.prototype.setSkinName = function(skinName) {
  this._skinName = skinName;
};

DvtAbstractComponent.prototype.getSkinName = function() {
  return this._skinName;
};

DvtAbstractComponent.prototype.setComponentStyle = function(cssStyle) {
  this._compCSSStyle = cssStyle;
};

DvtAbstractComponent.prototype.getComponentStyle = function() {
  return this._compCSSStyle;
};

DvtAbstractComponent.prototype.setControlPanelStyleMap = function(styleMap) {
  this._controlPanelStyleMap = styleMap;
};

DvtAbstractComponent.prototype.getControlPanelStyleMap = function() {
  return this._controlPanelStyleMap;
};

DvtAbstractComponent.prototype.parseComponentAttrs = function(xmlNode) {

  var compCSSStyle = null;
  compCSSStyle = this.parseComponentStyle(xmlNode.getAttribute(DvtAbstractComponent._ATTR_SKIN_STYLE), compCSSStyle);
  compCSSStyle = this.parseComponentStyle(xmlNode.getAttribute(DvtAbstractComponent._ATTR_INLINE_STYLE), compCSSStyle);
  if (compCSSStyle)
    this.setComponentStyle(compCSSStyle);
    
  var skinName = xmlNode.getAttribute(DvtAbstractComponent._ATTR_SKIN_NAME);
  if (skinName)
    this.setSkinName(skinName);

  var cpStyleMap = new Object();
  if (this.UsePanelDrawer()) {
    cpStyleMap[DvtCSSStyle.BACKGROUND_COLOR] = DvtPanelDrawer._BACKGROUND_COLOR;
    cpStyleMap[DvtCSSStyle.BORDER_COLOR] = DvtPanelDrawer._BORDER_COLOR;
    cpStyleMap[DvtCSSStyle.BORDER_RADIUS] = DvtPanelDrawer._TAB_CORNER_RADIUS;
    cpStyleMap[DvtAbstractComponent.BOX_SHADOW] = "none";
    cpStyleMap[DvtAbstractComponent.BG_ALPHA] = DvtPanelDrawer._BACKGROUND_ALPHA;
    cpStyleMap[DvtCSSStyle.FILL_TYPE] = "solid";    
    cpStyleMap[DvtAbstractComponent.TAB_BG_COLOR_INACTIVE] = xmlNode.getAttribute(DvtAbstractComponent._ATTR_TAB_BG_COLOR_INACTIVE);
    cpStyleMap[DvtAbstractComponent.TAB_BORDER_COLOR_INACTIVE] = xmlNode.getAttribute(DvtAbstractComponent._ATTR_TAB_BORDER_COLOR_INACTIVE);
    cpStyleMap[DvtAbstractComponent.CP_BUTTON_WIDTH] = DvtPanelDrawer._TAB_SIZE;
    cpStyleMap[DvtAbstractComponent.CP_BUTTON_HEIGHT] = DvtPanelDrawer._TAB_SIZE;
    cpStyleMap[DvtAbstractComponent.CP_TAB_SIZE] = DvtPanelDrawer._TAB_SIZE;
    cpStyleMap[DvtAbstractComponent.CP_PADDING_TOP] = 15;
    cpStyleMap[DvtAbstractComponent.CP_PADDING_SIDE] = 0;    
    cpStyleMap[DvtAbstractComponent.CP_PRIME] = "on";
    cpStyleMap[DvtAbstractComponent.CP_IMAGE_WIDTH] = 24;
    cpStyleMap[DvtAbstractComponent.CP_IMAGE_HEIGHT] = 24;
  }
  else {
    cpStyleMap[DvtCSSStyle.BACKGROUND_COLOR] = xmlNode.getAttribute(DvtAbstractComponent._ATTR_CTRLPANEL_BACKGROUND_COLOR);
    cpStyleMap[DvtCSSStyle.BORDER_COLOR] = xmlNode.getAttribute(DvtAbstractComponent._ATTR_CTRLPANEL_BORDER_COLOR);
    cpStyleMap[DvtCSSStyle.BORDER_RADIUS] = xmlNode.getAttribute(DvtAbstractComponent._ATTR_CTRLPANEL_BORDER_RADIUS);
    cpStyleMap[DvtAbstractComponent.BOX_SHADOW] = xmlNode.getAttribute(DvtAbstractComponent._ATTR_CTRLPANEL_BOX_SHADOW);
    if (skinName && skinName == "skyros") {
      cpStyleMap[DvtAbstractComponent.BG_ALPHA] = 1;
      cpStyleMap[DvtCSSStyle.FILL_TYPE] = "solid";
    }
    else {
      cpStyleMap[DvtCSSStyle.FILL_TYPE] = DvtPanZoomControlPanelLAFUtils.CONTROL_PANEL_DFLT_BG_FILL_TYPE;
    }    
  }
    
  this.setControlPanelStyleMap(cpStyleMap);    
};

DvtAbstractComponent.prototype.parseComponentStyle = function (attr, compCSSStyle) {
  if (attr) {
    if (compCSSStyle)
      compCSSStyle.merge(new DvtCSSStyle(attr));
    else
      compCSSStyle = new DvtCSSStyle(attr);
  }
  return compCSSStyle;
};

/**
 * @constructor
 */
var DvtAbstractPanZoomComponent = function (context) {
  this.Init(context);
};

DvtObj.createSubclass(DvtAbstractPanZoomComponent, DvtAbstractComponent, "DvtAbstractPanZoomComponent");

//control panel is initially collapsed
DvtAbstractPanZoomComponent.CONTROL_PANEL_BEHAVIOR_INIT_COLLAPSED = "initCollapsed";
//control panel is initially expanded
DvtAbstractPanZoomComponent.CONTROL_PANEL_BEHAVIOR_INIT_EXPANDED = "initExpanded";
//control panel is not shown
DvtAbstractPanZoomComponent.CONTROL_PANEL_BEHAVIOR_HIDDEN = "hidden";

DvtAbstractPanZoomComponent._PANNING_OFF = 1;
DvtAbstractPanZoomComponent._ZOOMING_OFF = 2;
DvtAbstractPanZoomComponent._ZOOM_TO_FIT_OFF = 4;

DvtAbstractPanZoomComponent.PAN_ZOOM_KEY = "panZoomInfo";

//TODO: move some where else
DvtAbstractPanZoomComponent._CHANGE_LAYOUT_OFF = (1 << 29);//536870912
DvtAbstractPanZoomComponent.prototype.Init = function (context) {
  DvtAbstractPanZoomComponent.superclass.Init.call(this, context);
  this._featuresOff = 0;
  this._controlPanelBehavior = DvtAbstractPanZoomComponent.CONTROL_PANEL_BEHAVIOR_INIT_COLLAPSED;
  this._displayedControls = DvtPanZoomCanvas.DEFAULT_DISPLAYED_CONTROLS;
};

DvtAbstractPanZoomComponent.prototype.InitComponentInternal = function () {
  DvtAbstractPanZoomComponent.superclass.InitComponentInternal.call(this);

  //if not rendering null xml, recreate the panZoomCanvas
  if (!this._bRenderNullXml) {
    if (this._panZoomCanvas) {
      this.removeChild(this._panZoomCanvas);
      this._panZoomCanvas = null;
    }
    this._panZoomCanvas = this.CreatePanZoomCanvas(this.GetWidth(), this.GetHeight());
    this.addChildAt(this._panZoomCanvas, 1); // Add directly on top of backgroundPane
    this._panZoomCanvas.renderComponent();   
  }
  //if rendering null xml, update the size of the panZoomCanvas
  else {
    this._panZoomCanvas.setSize(this.GetWidth(), this.GetHeight());
  }
};

DvtAbstractPanZoomComponent.prototype.ConvertControlPanelBehaviorStringToInt = function(s) {
  switch (s) {
    case DvtAbstractPanZoomComponent.CONTROL_PANEL_BEHAVIOR_INIT_COLLAPSED:
      return DvtPanZoomCanvas.CONTROL_PANEL_BEHAVIOR_INIT_COLLAPSED;
    case DvtAbstractPanZoomComponent.CONTROL_PANEL_BEHAVIOR_INIT_EXPANDED:
      return DvtPanZoomCanvas.CONTROL_PANEL_BEHAVIOR_INIT_EXPANDED;
    case DvtAbstractPanZoomComponent.CONTROL_PANEL_BEHAVIOR_HIDDEN:
    default:
      return DvtPanZoomCanvas.CONTROL_PANEL_BEHAVIOR_HIDDEN;
  }
}
    
DvtAbstractPanZoomComponent.prototype.CreatePanZoomCanvas = function (ww, hh) {
  var pzc = new DvtPanZoomCanvas(this.getContext(), 
                                 this._buttonImages, 
                                 ww, 
                                 hh, 
                                 null, 
                                 this.ConvertControlPanelBehaviorStringToInt(this._controlPanelBehavior),
                                 this._displayedControls, this);
  pzc.addEventListener(DvtPanEvent.TYPE, this.HandlePanEvent, false, this);
  pzc.addEventListener(DvtZoomEvent.TYPE, this.HandleZoomEvent, false, this);
  pzc.addEventListener(DvtMaximizeSizeEvent.TYPE, this.HandleMaximizeEvent, false, this);
  pzc.addEventListener(DvtRestoreSizeEvent.TYPE, this.HandleRestoreEvent, false, this);
  var controlPanel = pzc.getControlPanel();
  if (controlPanel)
    controlPanel.addEventListener(DvtControlPanelEvent.TYPE, this.HandleControlPanelEvent, false, this);
  return pzc;
};

DvtAbstractPanZoomComponent.prototype.HandleControlPanelEvent = function (event) {
  //do nothing; for subclasses to implement
};

DvtAbstractPanZoomComponent.prototype.HandlePanEvent = function (event) {
  //do nothing; for subclasses to implement
};

DvtAbstractPanZoomComponent.prototype.HandleZoomEvent = function (event) {
  //do nothing; for subclasses to implement
};

DvtAbstractPanZoomComponent.prototype.HandleMaximizeEvent = function (event) {
  //do nothing; for subclasses to implement
};

DvtAbstractPanZoomComponent.prototype.HandleRestoreEvent = function (event) {
  //do nothing; for subclasses to implement
};

DvtAbstractPanZoomComponent.prototype.getPanZoomCanvas = function () {
  return this._panZoomCanvas;
};

/**
 * Pan by the given amount.
 * @param {number} dx horizontal amount to pan by
 * @param {number} dy vertical amount to pan by
 * @param {DvtAnimator} animator optional animator to use to animate the pan
 */
DvtAbstractPanZoomComponent.prototype.panBy = function (dx, dy, animator) {
  this.getPanZoomCanvas().panBy(dx, dy, animator);
};

/**
 * Pan to the given position.
 * @param {number} xx horizontal position to pan to
 * @param {number} yy vertical position to pan to
 * @param {DvtAnimator} animator optional animator to use to animate the pan
 */
DvtAbstractPanZoomComponent.prototype.panTo = function (xx, yy, animator) {
  this.getPanZoomCanvas().panTo(xx, yy, animator);
};

/**
 * Zoom by the given amount.
 * @param {number} dz amount to zoom by
 * @param {number} xx horizontal center of zoom (if not specified, treated as the horizontal center of the canvas)
 * @param {number} yy vertical center of zoom (if not specified, treated as the vertical center of the canvas)
 * @param {DvtAnimator} animator optional animator to use to animate the zoom
 */
DvtAbstractPanZoomComponent.prototype.zoomBy = function (dz, xx, yy, animator) {
  this.getPanZoomCanvas().zoomBy(dz, xx, yy, animator);
};

/**
 * Zoom to the given scale.
 * @param {number} zz new scale
 * @param {number} xx horizontal center of zoom (if not specified, treated as the horizontal center of the canvas)
 * @param {number} yy vertical center of zoom (if not specified, treated as the vertical center of the canvas)
 * @param {DvtAnimator} animator optional animator to use to animate the zoom
 */
DvtAbstractPanZoomComponent.prototype.zoomTo = function (zz, xx, yy, animator) {
  this.getPanZoomCanvas().zoomTo(zz, xx, yy, animator);
};

/**
 * Zoom and pan the content pane to fit the canvas size.
 * @param {DvtAnimator} animator optional animator to use to animate the zoom-to-fit
 */
DvtAbstractPanZoomComponent.prototype.zoomToFit = function (animator) {
  this.getPanZoomCanvas().zoomToFit(animator);
};

/**
 * Get the Resources to use with this view.
 *
 * @return translated resources to use with this view
 */
DvtAbstractPanZoomComponent.prototype.getPanZoomResources = function () {
  return this._panZoomResources;
};

/**
 * Set the Resources to use with this view.
 *
 * @param resources translated resources to use with this view
 */
DvtAbstractPanZoomComponent.prototype.setPanZoomResources = function (resources) {
  this._panZoomResources = resources;
};

/**
 * Get the featuresOff
 *
 * @return featuresOff used with this view
 */
DvtAbstractPanZoomComponent.prototype.getFeaturesOff = function () {
  return this._featuresOff;
};

/**
 * Set the featuresOff
 *
 * @param flags featuresOff used with this view
 */
DvtAbstractPanZoomComponent.prototype.setFeaturesOff = function (flags) {
  this._featuresOff = flags;
};

DvtAbstractPanZoomComponent.prototype.isPanningOff = function () {
  return (this._featuresOff & DvtAbstractPanZoomComponent._PANNING_OFF) != 0;
};

DvtAbstractPanZoomComponent.prototype.isZoomingOff = function () {
  return (this._featuresOff & DvtAbstractPanZoomComponent._ZOOMING_OFF) != 0;
};

DvtAbstractPanZoomComponent.prototype.isZoomToFitOff = function () {
  return (this._featuresOff & DvtAbstractPanZoomComponent._ZOOM_TO_FIT_OFF) != 0;
};

//TODO: don't render layout combo for now
//Move this method to Diagram,er???
DvtAbstractPanZoomComponent.prototype.isChangeLayoutOff = function () {
  return true;//return (this._featuresOff & DvtAbstractPanZoomComponent._CHANGE_LAYOUT_OFF) != 0;
};

/**
 * Get the Resources to use with this view.
 *
 * @return translated resources to use with this view
 */
DvtAbstractPanZoomComponent.prototype.getResources = function () {
  return this._resources;
};

/**
 * Set the Resources to use with this view.
 *
 * @param resources translated resources to use with this view
 */
DvtAbstractPanZoomComponent.prototype.setResources = function (resources) {
  this._resources = resources;
};

DvtAbstractPanZoomComponent.prototype.setButtonImages = function (uris) {
  this._buttonImages = uris;
};

/**
 * Set the control panel behavior: initExpanded, initCollapsed, or hidden.
 * The default is initCollapsed.  
 * 
 * @param behavior control panel behavior  
 */
DvtAbstractPanZoomComponent.prototype.setControlPanelBehavior = function(behavior) {
  this._controlPanelBehavior = behavior;
};

/**
 * Get the control panel behavior.
 * 
 * @return control panel behavior: initExpanded, initCollapsed, or hidden
 */
DvtAbstractPanZoomComponent.prototype.getControlPanelBehavior = function() {
  return this._controlPanelBehavior;
};

/**
 * Sets the controls that should be displayed in the control panel
 * 
 * @param displayedControls flags indicating the controls that should be displayed
 */
DvtAbstractPanZoomComponent.prototype.setDisplayedControls = function(displayedControls) {
  this._displayedControls = displayedControls;
};

/**
 * Gets the controls that should be displayed in the control panel
 * 
 * @return flags indicating the controls that should be displayed
 */
DvtAbstractPanZoomComponent.prototype.getDisplayedControls = function() {
  return this._displayedControls;
};

// Copyright (c) 2011, 2012, Oracle and/or its affiliates. 
// All rights reserved. 

/**
  *  Creates a canvas that supports panning and zooming.
  *  @extends DvtContainer
  *  @class DvtPanZoomCanvas is a platform independent class representing a 
  *  pannable, zoomable canvas.  
  *  <p>
  *  <b>Example:</b><br><br> <code>
  *  var canvas = new DvtPanZoomCanvas(context, 400, 200, 'myCanvas') ;<br>
  *  <br>
  *</code>
  *  @constructor  
  *  @param {DvtContext} context The context object
  *  @param {number} ww The width of the canvas
  *  @param {number} hh The height of the canvas
  *  @param {string} id optional identifier
  *  @param {number} controlPanelState the control panel state
  *  @param {number} displayedControls flags indicating what controls should be displayed in the control panel
  */
var DvtPanZoomCanvas = function(context, buttonImages, ww, hh, id, controlPanelState, displayedControls, view)
{
  this.Init(context, buttonImages, ww, hh, id, controlPanelState, displayedControls, view);
};

DvtObj.createSubclass(DvtPanZoomCanvas, DvtContainer, "DvtPanZoomCanvas");

DvtPanZoomCanvas.DEFAULT_PAN_INCREMENT = 15;
DvtPanZoomCanvas.DEFAULT_ZOOM_INCREMENT = .05;
DvtPanZoomCanvas.DEFAULT_ANIMATION_DURATION = .5;

//control panel is collapsed
DvtPanZoomCanvas.CONTROL_PANEL_BEHAVIOR_INIT_COLLAPSED = 0;
//control panel is expanded
DvtPanZoomCanvas.CONTROL_PANEL_BEHAVIOR_INIT_EXPANDED = 1;
//control panel is not shown
DvtPanZoomCanvas.CONTROL_PANEL_BEHAVIOR_HIDDEN = 2;
    
DvtPanZoomCanvas.DEFAULT_DISPLAYED_CONTROLS = 0xffffff & ~0x010000;//DvtPanZoomControlPanel.CONTROLS_ALL & ~DvtPanZoomControlPanel.CONTROLS_MAXIMIZE_BUTTON;

DvtPanZoomCanvas.prototype.Init = function(context, buttonImages, ww, hh, id, controlPanelState, displayedControls, view)
{
  DvtPanZoomCanvas.superclass.Init.call(this, context, id);
  
  this._view = view;
  
  this._ww = ww;
  this._hh = hh;
  this._buttonImages = buttonImages;
  
  this._px = 0;
  this._py = 0;
  this._mx = 0;
  this._my = 0;
  
  this._minPanX = null;
  this._maxPanX = null;
  this._minPanY = null;
  this._maxPanY = null;
  this._minZoom = .1;
  this._maxZoom = 1;
  
  this._panIncrement = DvtPanZoomCanvas.DEFAULT_PAN_INCREMENT;
  this._zoomIncrement = DvtPanZoomCanvas.DEFAULT_ZOOM_INCREMENT;
  this._bTiltPanningEnabled = false;
  this._zoomToFitPadding = 20;  

  this._controlPanel = null;
  this._controlPanelState = controlPanelState ? controlPanelState : DvtPanZoomCanvas.CONTROL_PANEL_BEHAVIOR_INIT_COLLAPSED;
  this._displayedControls = (displayedControls || displayedControls == 0) ? displayedControls : DvtPanZoomCanvas.DEFAULT_DISPLAYED_CONTROLS;

  this._bPanningEnabled = true;
  this._bZoomingEnabled = true;
  this._bZoomToFitEnabled = true;

  this._backgroundPane = new DvtRect(this.getContext(), 
                                     0, 0, this._ww, this._hh);
  this.addChild(this._backgroundPane);
  this._backgroundPane.setFill(new DvtSolidFill("white", 0));
  
  this._contentPane = new DvtContainer(this.getContext());
  this.addChild(this._contentPane);
  this._contentPane.setMatrix(new DvtMatrix(this.getContext()));
  
  this._animationDuration = DvtPanZoomCanvas.DEFAULT_ANIMATION_DURATION;
  
  this._eventManager = new DvtPanZoomCanvasEventManager(context, this.FireListener, this);
  this._eventManager.addListeners(this);
  
  this._clipIdSuffix = 1;
  this.SetClipRect(ww, hh);
  this.RenderInternal();
};

DvtPanZoomCanvas.prototype.setSize = function(ww, hh) {
  this._ww = ww;
  this._hh = hh;
  this._backgroundPane.setWidth(ww);
  this._backgroundPane.setHeight(hh);
  //position control panel again, in case it's on the right side for BiDi
  if (this._controlPanel)
    this.PositionControlPanel();
  this.SetClipRect(ww, hh);
};

DvtPanZoomCanvas.prototype.getSize = function() {
  return new DvtDimension(this._ww, this._hh);
};

DvtPanZoomCanvas.prototype.SetClipRect = function(ww, hh) {
  var clipId = this.GetNextClipId();
  var clipPath = new DvtClipPath(clipId);
  clipPath.addRect(this.getTranslateX(), this.getTranslateY(), ww, hh);
  this.setClipPath(clipPath);
};

DvtPanZoomCanvas.prototype.GetNextClipId = function() {
  if (this._clipIdSuffix == 1) {
    this._clipIdSuffix = 0;
  }
  else {
    this._clipIdSuffix = 1;
  }
  return "pzcClip" + this._clipIdSuffix;
};

/**
  * Get the content pane of the canvas.  The content pane is the
  * object that will be panned and zoomed.  Content should be
  * added as a child of the content pane, not the canvas itself.
  * @returns {DvtContainer} the content pane of the canvas
  */
DvtPanZoomCanvas.prototype.getContentPane = function()
{
  return this._contentPane;
};

DvtPanZoomCanvas.prototype.setContentPane = function(contentPane) {
  this._contentPane = contentPane;
};

/**
  * Get the background pane of the canvas.  The background
  * pane appears behind the content pane, and should be used
  * for styling.
  * @returns {DvtRect} the background pane of the canvas
  */
DvtPanZoomCanvas.prototype.getBackgroundPane = function()
{
  return this._backgroundPane;
};

/**
  * Get the current zoom level. 
  * @returns {number} the current zoom level
  */
DvtPanZoomCanvas.prototype.getZoom = function()
{
  return this._contentPane.getMatrix().getA();
};

/**
  * Get the current horizontal pan position. 
  * @returns {number} the current horizontal pan position
  */
DvtPanZoomCanvas.prototype.getPanX = function()
{
  return this._contentPane.getMatrix().getTx();
};

/**
  * Get the current vertical pan position. 
  * @returns {number} the current vertical pan position
  */
DvtPanZoomCanvas.prototype.getPanY = function()
{
  return this._contentPane.getMatrix().getTy();
};

/**
  * Set the padding to leave around the content when it is zoomed-to-fit.
  * The default value is 20.
  * @param {number} n new zoom-to-fit padding
  */
DvtPanZoomCanvas.prototype.setZoomToFitPadding = function(n)
{
  this._zoomToFitPadding = n;
};

/**
  * Get the padding to leave around the content when it is zoomed-to-fit. 
  * @returns {number} zoom-to-fit padding
  */
DvtPanZoomCanvas.prototype.getZoomToFitPadding = function()
{
  return this._zoomToFitPadding;
};

/**
  * Pan by the given amount. 
  * @param {number} dx horizontal amount to pan by
  * @param {number} dy vertical amount to pan by
  * @param {DvtAnimator} animator optional animator to use to animate the pan
  */
DvtPanZoomCanvas.prototype.panBy = function(dx, dy, animator)
{
  if (!this.isPanningEnabled()) {
    return;
  }

  var oldX = this.getPanX();
  var oldY = this.getPanY();
  var newX = this.ConstrainPanX(oldX + dx);
  var newY = this.ConstrainPanY(oldY + dy);
  
  var deltaX = newX - oldX;
  var deltaY = newY - oldY;
  
  this.FirePanEvent(DvtPanEvent.SUBTYPE_PANNING, newX, newY, oldX, oldY, animator);
  
  //this._panX = newX;
  //this._panY = newY;
  
  var mat = null;
  if (animator)
  {
    mat = animator.getDestVal(this._contentPane, this._contentPane.getMatrix);
    if (mat)
    {
      mat = mat.clone();
    }
  }
  if (!mat)
  {
    mat = this._contentPane.getMatrix().clone();
  }
  
  mat.translate(deltaX, deltaY);
  
  var thisRef = this;
  var fireEventFunc = function() {
    thisRef.FirePanEvent(DvtPanEvent.SUBTYPE_PANNED, newX, newY, oldX, oldY, animator);
    };
  
  if (animator)
  {
    animator.addProp(DvtAnimator.TYPE_MATRIX, 
                     this._contentPane, 
                     this._contentPane.getMatrix,
                     this._contentPane.setMatrix,
                     mat);
    DvtPlayable.appendOnEnd(animator, fireEventFunc);
  }
  else
  {
    this._contentPane.setMatrix(mat);
    fireEventFunc();
  }
};

/**
  * Pan to the given position. 
  * @param {number} xx horizontal position to pan to
  * @param {number} yy vertical position to pan to
  * @param {DvtAnimator} animator optional animator to use to animate the pan
  */
DvtPanZoomCanvas.prototype.panTo = function(xx, yy, animator)
{
  if (!this.isPanningEnabled()) {
    return;
  }

  var dx = xx - this._GetPanX(animator);
  var dy = yy - this._GetPanY(animator);
  this.panBy(dx, dy, animator);
};

/**
  * Zoom by the given amount. 
  * @param {number} dz amount to zoom by
  * @param {number} xx horizontal center of zoom (if not specified, treated as the horizontal center of the canvas)
  * @param {number} yy vertical center of zoom (if not specified, treated as the vertical center of the canvas)
  * @param {DvtAnimator} animator optional animator to use to animate the zoom
  */
DvtPanZoomCanvas.prototype.zoomBy = function(dz, xx, yy, animator)
{
  if (!this.isZoomingEnabled()) {
    return;
  }

  if (!xx && xx !== 0)
  {
    xx = this._ww / 2;
  }
  if (!yy && yy !== 0)
  {
    yy = this._hh / 2;
  }
  
  var oldZoom = this.getZoom();
  var newZoom = this.ConstrainZoom(oldZoom * dz);
  
  if (DvtPanZoomCanvas.RoundFloatForCompare(oldZoom) == DvtPanZoomCanvas.RoundFloatForCompare(newZoom))
  {
    return;
  }
  
  var deltaZoom = newZoom / oldZoom;
  
  this.FireZoomEvent(DvtZoomEvent.SUBTYPE_ZOOMING, newZoom, oldZoom, animator, null, xx, yy);
  
  //this._zoom = newZoom;
  
  var mat = null;
  if (animator)
  {
    mat = animator.getDestVal(this._contentPane, this._contentPane.getMatrix);
    if (mat)
    {
      mat = mat.clone();
    }
  }
  if (!mat)
  {
    mat = this._contentPane.getMatrix().clone();
  }
  
  mat.translate(-xx, -yy);
  mat.scale(deltaZoom, deltaZoom);
  mat.translate(xx, yy);
  
  var thisRef = this;
  var fireEventFunc = function() {
    //use current zoom level at time of firing event as new zoom level
    //in event, because if continously scrolling the mouse wheel, each
    //zoom animation gets interrupted by the next one, so each event
    //doesn't actually zoom all the way to the desired scale until the
    //last event
    thisRef.FireZoomEvent(DvtZoomEvent.SUBTYPE_ZOOMED, thisRef.getZoom(), oldZoom, animator, null, xx, yy);
    };
  
  if (animator)
  {
    animator.addProp(DvtAnimator.TYPE_MATRIX, 
                     this._contentPane, 
                     this._contentPane.getMatrix,
                     this._contentPane.setMatrix,
                     mat);
    DvtPlayable.appendOnEnd(animator, fireEventFunc);
  }
  else
  {
    this._contentPane.setMatrix(mat);
    fireEventFunc();
  }
};

/**
  * Zoom to the given scale. 
  * @param {number} zz new scale
  * @param {number} xx horizontal center of zoom (if not specified, treated as the horizontal center of the canvas)
  * @param {number} yy vertical center of zoom (if not specified, treated as the vertical center of the canvas)
  * @param {DvtAnimator} animator optional animator to use to animate the zoom
  */
DvtPanZoomCanvas.prototype.zoomTo = function(zz, xx, yy, animator)
{
  if (!this.isZoomingEnabled()) {
    return;
  }

  var dz = zz / this._GetZoom(animator);
  this.zoomBy(dz, xx, yy, animator);
};

/**
  * Zoom and pan the content pane to fit the canvas size. 
  * @param {DvtAnimator} animator optional animator to use to animate the zoom-to-fit
  * @param {DvtRectangle} fitBounds optional bounds in content pane coordinate system to zoom-to-fit to
  */
DvtPanZoomCanvas.prototype.zoomToFit = function(animator, fitBounds)
{
  if (!this.isZoomToFitEnabled()) {
    return;
  }
  
  var panningEnabled = this.isPanningEnabled();
  var zoomingEnabled = this.isZoomingEnabled();
  this.setPanningEnabled(true);
  this.setZoomingEnabled(true);
  try {
    var bounds = fitBounds;
    if (!bounds) {
      bounds = this._contentPane.getDimensions();
    }
    
    var event = this.FireZoomEvent(DvtZoomEvent.SUBTYPE_ZOOM_TO_FIT_BEGIN, null, null, animator, bounds);
    
  //  bounds = event.getZoomToFitBounds();
    
    var dzx = (this._ww - 2 * this._zoomToFitPadding) / (bounds.w);
    var dzy = (this._hh - 2 * this._zoomToFitPadding) / (bounds.h);
    var dz = Math.min(dzx, dzy);
    dz = this.ConstrainZoom(dz);
    
    var cxBounds = (bounds.x + bounds.w / 2) * dz;
    var cyBounds = (bounds.y + bounds.h / 2) * dz;
    var dx = (this._ww / 2) - cxBounds;
    var dy = (this._hh / 2) - cyBounds;
    
    this.zoomTo(dz, 0, 0, animator);
    this.panTo(dx, dy, animator);
    var thisRef = this;
    var fireEventFunc = function() {
      thisRef.FireZoomEvent(DvtZoomEvent.SUBTYPE_ZOOM_TO_FIT_END, null, null, animator, bounds);
    };
  
    if (animator) {
      DvtPlayable.appendOnEnd(animator, fireEventFunc);
    }
    else {
      fireEventFunc();
    }
  }
  finally {
    this.setPanningEnabled(panningEnabled);
    this.setZoomingEnabled(zoomingEnabled);
  }
};

/**
  * Calculate the zoom-to-fit scale. 
  * @param {DvtRectangle} bounds optional bounds in content pane coordinate system to calculate zoom-to-fit scale to
  */
DvtPanZoomCanvas.prototype.calcZoomToFitScale = function(bounds)
{
  if (!bounds) {
    bounds = this._contentPane.getDimensions();
  }
  
  var event = this.FireZoomEvent(DvtZoomEvent.SUBTYPE_ZOOM_TO_FIT, null, null, null, bounds);
  
  bounds = event.getZoomToFitBounds();
  
  var dzx = (this._ww - 2 * this._zoomToFitPadding) / (bounds.w);
  var dzy = (this._hh - 2 * this._zoomToFitPadding) / (bounds.h);
  var dz = Math.min(dzx, dzy);
  dz = this.ConstrainZoom(dz);
  
  return dz;
};

/**
  * Calculate the zoom-to-fit dimensions. 
  */
DvtPanZoomCanvas.prototype.calcZoomToFitBounds = function()
{
var bounds = this._contentPane.getDimensions();
  
  var event = this.FireZoomEvent(DvtZoomEvent.SUBTYPE_ZOOM_TO_FIT, null, null, null, bounds);
  
  bounds = event.getZoomToFitBounds();
  
  bounds.x -= this._zoomToFitPadding;
  bounds.y -= this._zoomToFitPadding;
  bounds.w += 2 * this._zoomToFitPadding;
  bounds.h += 2 * this._zoomToFitPadding;
  
  return bounds;
};

/**
 * Get the current viewport in the coordinate system of the content pane.
 * @returns  {DvtRectangle}  current viewport
 */
DvtPanZoomCanvas.prototype.getViewport = function()
{
  var topLeftGlobal = this.localToStage(new DvtPoint(0, 0));
  var bottomRightGlobal = this.localToStage(new DvtPoint(this._ww, this._hh));
  var topLeftLocal = this.getContentPane().stageToLocal(topLeftGlobal);
  var bottomRightLocal = this.getContentPane().stageToLocal(bottomRightGlobal);
  return new DvtRectangle(topLeftLocal.x, topLeftLocal.y, 
                          bottomRightLocal.x - topLeftLocal.x, 
                          bottomRightLocal.y - topLeftLocal.y);
};

/**
  * Get the zoom level. 
  * @returns {number} the zoom level
  */
DvtPanZoomCanvas.prototype._GetZoom = function(animator)
{
  if (animator)
  {
    var mat = animator.getDestVal(this._contentPane, this._contentPane.getMatrix);
    if (mat)
    {
      return mat.getA();
    }
  }
  
  return this.getZoom();
};

/**
  * Get the horizontal pan position. 
  * @returns {number} the horizontal pan position
  */
DvtPanZoomCanvas.prototype._GetPanX = function(animator)
{
  if (animator)
  {
    var mat = animator.getDestVal(this._contentPane, this._contentPane.getMatrix);
    if (mat)
    {
      return mat.getTx();
    }
  }
  
  return this.getPanX();
};

/**
  * Get the vertical pan position. 
  * @returns {number} the vertical pan position
  */
DvtPanZoomCanvas.prototype._GetPanY = function(animator)
{
  if (animator)
  {
    var mat = animator.getDestVal(this._contentPane, this._contentPane.getMatrix);
    if (mat)
    {
      return mat.getTy();
    }
  }
  
  return this.getPanY();
};

DvtPanZoomCanvas.prototype.ConstrainPanX = function(xx)
{
  var offsetX = xx;
  if (this._minPanX && offsetX < this._minPanX)
  {
    offsetX = this._minPanX;
  }
  if (this._maxPanX && offsetX > this._maxPanX)
  {
    offsetX = this._maxPanX;
  }
  return offsetX;
};

DvtPanZoomCanvas.prototype.ConstrainPanY = function(yy)
{
  var offsetY = yy;
  if (this._minPanY && offsetY < this._minPanY)
  {
    offsetY = this._minPanY;
  }
  if (this._maxPanY && offsetY > this._maxPanY)
  {
    offsetY = this._maxPanY;
  }
  return offsetY;
};

DvtPanZoomCanvas.prototype.ConstrainZoom = function(zz)
{
  var newZ = zz;
  if (this._minZoom && newZ < this._minZoom)
  {
    newZ = this._minZoom;
  }
  if (this._maxZoom && newZ > this._maxZoom)
  {
    newZ = this._maxZoom;
  }
  return newZ;
};

DvtPanZoomCanvas.RoundFloatForCompare = function(n)
{
  return Math.round(n * 100000);
};

DvtPanZoomCanvas.prototype.RenderInternal = function()
{
  if (this._buttonImages && this._controlPanelState != DvtPanZoomCanvas.CONTROL_PANEL_BEHAVIOR_HIDDEN) {
    var controlPanel = this.getControlPanel();
  
    if (!controlPanel) {
      controlPanel = new DvtPanZoomControlPanel(this.getContext(), this, this._buttonImages, null, this._displayedControls, this._view);
      this._controlPanel = controlPanel;
    }
    
    this.addChild(this._controlPanel);
      
    if (this._controlPanelState == DvtPanZoomCanvas.CONTROL_PANEL_BEHAVIOR_INIT_COLLAPSED)
      this._controlPanel.setState(DvtPanZoomControlPanel.STATE_COLLAPSED);
    else if (this._controlPanelState == DvtPanZoomCanvas.CONTROL_PANEL_BEHAVIOR_INIT_EXPANDED)
      this._controlPanel.setState(DvtPanZoomControlPanel.STATE_EXPANDED);

    this.PositionControlPanel();       
  }
};

DvtPanZoomCanvas.prototype.renderComponent = function() {
    if (this._controlPanel)
      this._controlPanel.renderComponent(); 
}

DvtPanZoomCanvas.prototype.setControlPanelState = function (state) {
  this._controlPanelState = state;
  if (this._controlPanelState == DvtPanZoomCanvas.CONTROL_PANEL_BEHAVIOR_HIDDEN)
    this.removeChild(this._controlPanel);
}

DvtPanZoomCanvas.prototype.setControlPanel = function (controlPanel) {
  if (this._controlPanel)
    this.removeChild(this._controlPanel);
  
  this._controlPanel = controlPanel;
  if (this._controlPanelState != DvtPanZoomCanvas.CONTROL_PANEL_BEHAVIOR_HIDDEN) {
    this.addChild(this._controlPanel);
    
    if (this._controlPanelState == DvtPanZoomCanvas.CONTROL_PANEL_BEHAVIOR_INIT_COLLAPSED)
      this._controlPanel.setState(DvtPanZoomControlPanel.STATE_COLLAPSED);
    else if (this._controlPanelState == DvtPanZoomCanvas.CONTROL_PANEL_BEHAVIOR_INIT_EXPANDED)
      this._controlPanel.setState(DvtPanZoomControlPanel.STATE_EXPANDED);

    this.PositionControlPanel();  
  }
}

DvtPanZoomCanvas.prototype.getControlPanel = function() {
  return this._controlPanel;
}

DvtPanZoomCanvas.prototype.PositionControlPanel = function() {
  var styleMap = this._view.getControlPanelStyleMap();
  var posX = DvtPanZoomControlPanelLAFUtils.getControlPanelPositionX(styleMap, 
                                  DvtPanZoomControlPanelLAFUtils.CONTROL_PANEL_PADDING);
  var posY = DvtPanZoomControlPanelLAFUtils.getControlPanelPositionY(styleMap, 
                                  DvtPanZoomControlPanelLAFUtils.CONTROL_PANEL_PADDING);
  var openCloseButtonWidth = DvtPanZoomControlPanelLAFUtils.getControlPanelButtonWidth(styleMap, 
                                  DvtPanZoomControlPanelLAFUtils.EXPAND_COLLAPSE_BUTTON_WIDTH);
  
  if (DvtAgent.getAgent().isRightToLeft()) {
    this._controlPanel.setTranslateX(this._ww - openCloseButtonWidth - posX);
  }
  else {
    this._controlPanel.setTranslateX(posX);
  }
  this._controlPanel.setTranslateY(posY);
}

DvtPanZoomCanvas.prototype.GetRelativeMousePosition = function(event) {
  var docUtils = this.getContext().getDocumentUtils();
  var stage = this.getContext().getStage();
  var pos = docUtils.getStageRelativePosition(stage, event.pageX, event.pageY);
  return pos;
}

/**
 * @protected
 */
DvtPanZoomCanvas.prototype.FirePanEvent = function(subType, newX, newY, oldX, oldY, animator)
{
  var panEvent = new DvtPanEvent(subType, newX, newY, oldX, oldY, animator);
  this.FireListener(panEvent);
};

/**
 * @protected
 */
DvtPanZoomCanvas.prototype.FireZoomEvent = function(subType, newZoom, oldZoom, animator, zoomToFitBounds, xx, yy)
{
  var zoomEvent = new DvtZoomEvent(subType, newZoom, oldZoom, animator, zoomToFitBounds, new DvtPoint(xx, yy));
  this.FireListener(zoomEvent);
  return zoomEvent;
};


DvtPanZoomCanvas.prototype.zoomAndCenter = function() {
  this.FireZoomEvent(DvtZoomEvent.SUBTYPE_ZOOM_AND_CENTER);
}
    
/**
 * Get the next incremental, increasing, zoom level.
 * 
 * @param currZoom current zoom level
 * 
 * @return next zoom level
 */
DvtPanZoomCanvas.prototype.getNextZoomLevel = function(currZoom) {
  var zoomLevel = currZoom;

  zoomLevel += this.getZoomIncrement();
  if (zoomLevel > this.getMaxZoom())
    zoomLevel = this.getMaxZoom();

  return zoomLevel;
}
    
/**
 * Get the previous incremental, decreasing, zoom level.
 * 
 * @param currZoom current zoom level
 * 
 * @return previous zoom level
 */
DvtPanZoomCanvas.prototype.getPrevZoomLevel = function(currZoom) {
  var zoomLevel = currZoom;

  zoomLevel -= this.getZoomIncrement();
  if (zoomLevel < this.getMinZoom())
    zoomLevel = this.getMinZoom();

  return zoomLevel;
}
    
/**
 * Set the increment to use for zooming.
 * The increment should be a percentage between 0 and 1. 
 * The default is .05.  
 * 
 * @param n zoom increment
 */
DvtPanZoomCanvas.prototype.setZoomIncrement = function(n) {
  this._zoomIncrement = n;
}
    
/**
 * Get the increment to use for zooming.
 * 
 * @return zoom increment
 */
DvtPanZoomCanvas.prototype.getZoomIncrement = function() {
  return this._zoomIncrement;
}
    
/**
 * Set the increment to use for panning.
 * The increment should be in pixels. 
 * The default is 15.  
 * 
 * @param n pan increment
 */
DvtPanZoomCanvas.prototype.setPanIncrement = function(n) {
  this._panIncrement = n;
}
    
/**
 * Get the increment to use for panning.
 * 
 * @return pan increment
 */
DvtPanZoomCanvas.prototype.getPanIncrement = function() {
  return this._panIncrement;
}
    
/**
 * Set the minimum zoom factor allowed.  
 * The default is .1.
 * 
 * @param n minimum zoom factor
 */
DvtPanZoomCanvas.prototype.setMinZoom = function(n) {
  this._minZoom = n;
}
    
/**
 * Get the minimum zoom factor allowed.
 * 
 * @return minimum zoom factor
 */
DvtPanZoomCanvas.prototype.getMinZoom = function() {
  return this._minZoom;
}
    
/**
 * Set the maximum zoom factor allowed.
 * 
 * @param n maximum zoom factor
 */
DvtPanZoomCanvas.prototype.setMaxZoom = function(n) {
  if (n < 0)
    n = 1;
  this._maxZoom = n;
}

/**
 * Get the maximum zoom factor allowed.
 * 
 * @return maximum zoom factor
 */
DvtPanZoomCanvas.prototype.getMaxZoom = function() {
  return this._maxZoom;
}

/**
 * Set the minimum x coord allowed.  
 * The default is NaN, meaning there is no minimum.
 * 
 * @param n minimum x coord
 */
DvtPanZoomCanvas.prototype.setMinPanX = function(n) {
  this._minPanX = n;
}

/**
 * Get the minimum x coord allowed.  
 * 
 * @return minimum x coord
 */
DvtPanZoomCanvas.prototype.getMinPanX = function() {
  return this._minPanX;
}

/**
 * Set the maximum x coord allowed.  
 * The default is NaN, meaning there is no maximum.
 * 
 * @param n maximum x coord
 */
DvtPanZoomCanvas.prototype.setMaxPanX = function(n) {
  this._maxPanX = n;
}

/**
 * Get the maximum x coord allowed.  
 * 
 * @return maximum x coord
 */
DvtPanZoomCanvas.prototype.getMaxPanX = function() {
  return this._maxPanX;
}

/**
 * Set the minimum y coord allowed.  
 * The default is NaN, meaning there is no minimum.
 * 
 * @param n minimum y coord
 */
DvtPanZoomCanvas.prototype.setMinPanY = function(n) {
  this._minPanY = n;
}

/**
 * Get the minimum y coord allowed.  
 * 
 * @return minimum y coord
 */
DvtPanZoomCanvas.prototype.getMinPanY = function() {
  return this._minPanY;
}

/**
 * Set the maximum y coord allowed.  
 * The default is NaN, meaning there is no maximum.
 * 
 * @param n maximum y coord
 */
DvtPanZoomCanvas.prototype.setMaxPanY = function(n) {
  this._maxPanY = n;
}

/**
 * Get the maximum y coord allowed.  
 * 
 * @return maximum y coord
 */
DvtPanZoomCanvas.prototype.getMaxPanY = function() {
  return this._maxPanY;
}

/**
 * Set whether tilt panning is enabled.
 * 
 * @param b true to enable tilt panning, false to disable it
 */
DvtPanZoomCanvas.prototype.setTiltPanningEnabled = function(b) {
  this._bTiltPanningEnabled = b;
}

/**
 * Determine whether tilt panning is enabled.
 * 
 * @return true if tilt panning is enabled, false if disabled
 */
DvtPanZoomCanvas.prototype.isTiltPanningEnabled = function(b) {
  return this._bTiltPanningEnabled;
}

/**
 * Sets the animation duration (in seconds) for zoom interactions
 * 
 * @param animationDuration the animation duration (in seconds)
 */
DvtPanZoomCanvas.prototype.setAnimationDuration = function(animationDuration) {
  this._animationDuration = animationDuration;
}

/**
 * Gets the animation duration (in seconds) for zoom interactions
 * 
 * @return the animation duration (in seconds)
 */
DvtPanZoomCanvas.prototype.getAnimationDuration = function() {
  return this._animationDuration;
}

DvtPanZoomCanvas.prototype.setPanningEnabled = function(panningEnabled) {
  this._bPanningEnabled = panningEnabled;
};

DvtPanZoomCanvas.prototype.isPanningEnabled = function() {
  return this._bPanningEnabled;
};

DvtPanZoomCanvas.prototype.setZoomingEnabled = function(zoomingEnabled) {
  this._bZoomingEnabled = zoomingEnabled;
};

DvtPanZoomCanvas.prototype.isZoomingEnabled = function() {
  return this._bZoomingEnabled;
};

DvtPanZoomCanvas.prototype.setZoomToFitEnabled = function(zoomToFitEnabled) {
  this._bZoomToFitEnabled = zoomToFitEnabled;
};

DvtPanZoomCanvas.prototype.isZoomToFitEnabled = function() {
  return this._bZoomToFitEnabled;
};

DvtPanZoomCanvas.prototype.MaximizeSize = function(animator) {
  this.FireMaximizeEvent();
};

DvtPanZoomCanvas.prototype.RestoreSize = function(animator) {
  this.FireRestoreEvent();
};

/**
 * @protected
 */
DvtPanZoomCanvas.prototype.FireMaximizeEvent = function() {
  var event = new DvtMaximizeSizeEvent();
  this.FireListener(event);
};

/**
 * @protected
 */
DvtPanZoomCanvas.prototype.FireRestoreEvent = function() {
  var event = new DvtRestoreSizeEvent();
  this.FireListener(event);
};

// Copyright (c) 2011, 2012, Oracle and/or its affiliates. 
// All rights reserved. 
/**
 * @constructor
 */
var DvtPanZoomCanvasEventManager = function (context, callback, callbackObj) {
  this.Init(context, callback, callbackObj);
};

DvtObj.createSubclass(DvtPanZoomCanvasEventManager, DvtEventManager, "DvtPanZoomCanvasEventManager");

DvtPanZoomCanvasEventManager.prototype.Init = function (context, callback, callbackObj) {
  DvtPanZoomCanvasEventManager.superclass.Init.call(this, context, callback, callbackObj);
  this._controlPanel = callbackObj.getControlPanel();
  this._zoomAnimator = null;
  this._bPanning = false;
  this._bZooming = false;
}

DvtPanZoomCanvasEventManager.PAN_TOUCH_KEY = "panTouch";
DvtPanZoomCanvasEventManager.ZOOM_TOUCH_KEY = "zoomTouch";

/**
 * @override
 */
DvtPanZoomCanvasEventManager.prototype.addListeners = function (displayable) {
  DvtPanZoomCanvasEventManager.superclass.addListeners.call(this, displayable);
  if (DvtAgent.getAgent().isGecko())//Firefox
    displayable.addEventListener("DOMMouseScroll", this.OnMouseWheel, false, this);
  else 
    displayable.addEventListener("mousewheel", this.OnMouseWheel, false, this);
}

/**
 * @override
 */
DvtPanZoomCanvasEventManager.prototype.OnMouseDown = function (event) {
  if (event.button != DvtMouseEvent.RIGHT_CLICK_BUTTON) {
    var pos = this._callbackObj.GetRelativeMousePosition(event);
    this._mx = pos.x;
    this._my = pos.y;
    this._px = this._mx;
    this._py = this._my;
    this._bDown = true;
  }
}

/**
 * @override
 */
DvtPanZoomCanvasEventManager.prototype.OnMouseMove = function (event) {
  if (this._bDown) {
    var pos = this._callbackObj.GetRelativeMousePosition(event);
    var xx = pos.x;
    var yy = pos.y;

    if (event.ctrlKey) {
      if (!this._bZooming) {
        this._callback.call(this._callbackObj, new DvtZoomEvent(DvtZoomEvent.SUBTYPE_DRAG_ZOOM_BEGIN));
        this._bZooming = true;
        if (this._controlPanel) {
          this._controlPanel.mouseDragPanningStarted();
        }
      }
      var dz = 1 + (this._my - yy) / 100;
      if (!this._callbackObj.isPanningEnabled()) {
        this._callbackObj.zoomBy(dz, null, null);
      }
      else {
        this._callbackObj.zoomBy(dz, this._px, this._py);
      }
    }
    else {
      if (!this._bPanning) {
        this._callback.call(this._callbackObj, new DvtPanEvent(DvtPanEvent.SUBTYPE_DRAG_PAN_BEGIN));
        this._bPanning = true;
        if (this._controlPanel) {
          this._controlPanel.mouseDragPanningStarted();
        }
      }
      this._callbackObj.panBy(xx - this._mx, yy - this._my);
    }

    this._mx = xx;
    this._my = yy;
  }
}

/**
 * @override
 */
DvtPanZoomCanvasEventManager.prototype.OnMouseUp = function (event) {
  this._bDown = false;

  if (this._bPanning) {
    this._callback.call(this._callbackObj, new DvtPanEvent(DvtPanEvent.SUBTYPE_DRAG_PAN_END));
    this._bPanning = false;
    if (this._controlPanel) {
      this._controlPanel.mouseDragPanningEnded();
    }
  }
  if (this._bZooming) {
    this._callback.call(this._callbackObj, new DvtZoomEvent(DvtZoomEvent.SUBTYPE_DRAG_ZOOM_END));
    this._bZooming = false;
    if (this._controlPanel) {
      this._controlPanel.mouseDragPanningEnded();
    }
  }
}

/**
 * @override
 */
DvtPanZoomCanvasEventManager.prototype.OnMouseOut = function (event) {
  if (this._bDown) {
    // simulate mouse up event if needed
    this.OnMouseUp(event);
  }
  
  DvtPanZoomCanvasEventManager.superclass.OnMouseOut.call(this, event);
}

DvtPanZoomCanvasEventManager.prototype.OnMouseWheel = function (event) {
  var currZoom = this._callbackObj.getZoom();
  //TODO: re-enable animation after fixing how it works in conjunction with overview window
  var animator = null;//new DvtAnimator(this.getContext(), this.getAnimationDuration());
  //if there is already a zoom animator running, clean it up
  if (this._zoomAnimator) {
    var oldZoomAnim = this._zoomAnimator;
    //stop the old animator
    this._zoomAnimator.stop();
    //get the destination zoom level of the old animator so that we can add to it
    currZoom = this._callbackObj._GetZoom(oldZoomAnim);
    this._zoomAnimator = null;
    oldZoomAnim = null;

    //change the easing function so that it's fast at the start to
    //blend in more seamlessly with the animation we just stopped
    //partway through
    if (animator) {
      animator.setEasing(DvtEasing.cubicOut);
    }
  }
  this._zoomAnimator = animator;

  var delta = 0;
  if (event.wheelDelta != null) {
    delta = event.wheelDelta;

    //reverse the sign of the delta in Firefox so that mouse wheel up zooms in and mouse wheel down zooms out
    if (DvtAgent.getAgent().isGecko()) {
      delta = -delta;
    }
  }

  var zz = currZoom + this._callbackObj.getZoomIncrement() * delta;
  var pos = this._callbackObj.GetRelativeMousePosition(event);

  //cancel the mouse wheel event so that the browser doesn't scroll the page
  var docUtils = this.getContext().getDocumentUtils();
  docUtils.cancelDomEvent(event);

  if (!this._callbackObj.isPanningEnabled()) {
    this._callbackObj.zoomTo(zz, null, null, this._zoomAnimator);
  }
  else {
    this._callbackObj.zoomTo(zz, pos.x, pos.y, this._zoomAnimator);
  }

  if (this._zoomAnimator) {
    DvtPlayable.appendOnEnd(this._zoomAnimator, this._clearZoomAnimator, this);
    this._zoomAnimator.play();
  }
}

DvtPanZoomCanvasEventManager.prototype._clearZoomAnimator = function() {
  this._zoomAnimator = null;
}

/**
 * @override
 */
DvtPanZoomCanvasEventManager.prototype.HandleImmediateTouchStartInternal = function (event) {
  if (this._callbackObj.isZoomingEnabled())
    this.TouchManager.processAssociatedTouchAttempt(event, DvtPanZoomCanvasEventManager.ZOOM_TOUCH_KEY, this.ZoomStartTouch, this);

  if (this._callbackObj.isPanningEnabled())
    this.TouchManager.processAssociatedTouchAttempt(event, DvtPanZoomCanvasEventManager.PAN_TOUCH_KEY, this.PanStartTouch, this);
}

/**
 * @override
 */
DvtPanZoomCanvasEventManager.prototype.HandleImmediateTouchMoveInternal = function (event) {
  if (this._callbackObj.isZoomingEnabled())
    this.TouchManager.processAssociatedTouchMove(event, DvtPanZoomCanvasEventManager.ZOOM_TOUCH_KEY);

  if (this._callbackObj.isPanningEnabled())
    this.TouchManager.processAssociatedTouchMove(event, DvtPanZoomCanvasEventManager.PAN_TOUCH_KEY);
}

/**
 * @override
 */
DvtPanZoomCanvasEventManager.prototype.HandleImmediateTouchEndInternal = function (event) {
  if (this._callbackObj.isZoomingEnabled())
    this.TouchManager.processAssociatedTouchEnd(event, DvtPanZoomCanvasEventManager.ZOOM_TOUCH_KEY);

  if (this._callbackObj.isPanningEnabled())
    this.TouchManager.processAssociatedTouchEnd(event, DvtPanZoomCanvasEventManager.PAN_TOUCH_KEY);
}

DvtPanZoomCanvasEventManager.prototype.ZoomStartTouch = function (event, touch) {
  var touchIds = this.TouchManager.getTouchIdsForObj(DvtPanZoomCanvasEventManager.ZOOM_TOUCH_KEY);
  if (touchIds.length <= 1)
    this.TouchManager.saveProcessedTouch(touch.identifier, DvtPanZoomCanvasEventManager.ZOOM_TOUCH_KEY, null, DvtPanZoomCanvasEventManager.ZOOM_TOUCH_KEY, DvtPanZoomCanvasEventManager.ZOOM_TOUCH_KEY, this.ZoomMoveTouch, this.ZoomEndTouch, this);

  if (event)
    event.preventDefault();
}

DvtPanZoomCanvasEventManager.prototype.ZoomMoveTouch = function (event, touch) {
  var touchIds = this.TouchManager.getTouchIdsForObj(DvtPanZoomCanvasEventManager.ZOOM_TOUCH_KEY);
  if (touchIds.length == 2) {
    var delta = this.TouchManager.getMultiTouchZoomDelta(touchIds);
    if (delta) {
      // set a flag so we won't try to pan while zooming
      if (!this._bZooming) {
        this._bZooming = true;
        this._callback.call(this._callbackObj, new DvtZoomEvent(DvtZoomEvent.SUBTYPE_DRAG_ZOOM_BEGIN));
        
        if (this._controlPanel)
          this._controlPanel.mouseDragPanningStarted();
      }
      var dz = 1 + (delta / 10);
      this._callbackObj.zoomBy(dz, null, null);
      this.hideTooltip();
    }
  }
  
  if (event)
    event.preventDefault();
}

DvtPanZoomCanvasEventManager.prototype.ZoomEndTouch = function (event, touch) {
  this._callback.call(this._callbackObj, new DvtZoomEvent(DvtZoomEvent.SUBTYPE_DRAG_ZOOM_END));
  this._bZooming = false;
  
  if (this._controlPanel)
    this._controlPanel.mouseDragPanningEnded();
    
  if (event)
    event.preventDefault();
}

DvtPanZoomCanvasEventManager.prototype.PanStartTouch = function (event, touch) {
  if (!this._bZooming) {
    var touchIds = this.TouchManager.getTouchIdsForObj(DvtPanZoomCanvasEventManager.PAN_TOUCH_KEY);
    if (touchIds.length <= 1) {
      this.TouchManager.saveProcessedTouch(touch.identifier, DvtPanZoomCanvasEventManager.PAN_TOUCH_KEY, null, DvtPanZoomCanvasEventManager.PAN_TOUCH_KEY, DvtPanZoomCanvasEventManager.PAN_TOUCH_KEY, this.PanMoveTouch, this.PanEndTouch, this);
      this._oldPanX = touch.pageX;
      this._oldPanY = touch.pageY;
    }
  }
  
  if (event)
    event.preventDefault();
}

DvtPanZoomCanvasEventManager.prototype.PanMoveTouch = function (event, touch) {
  if (!this._bZooming) {
    var touchIds = this.TouchManager.getTouchIdsForObj(DvtPanZoomCanvasEventManager.ZOOM_TOUCH_KEY);
    if (touchIds.length == 1) {
      if (!this._bPanning) {
        this._callback.call(this._callbackObj, new DvtPanEvent(DvtPanEvent.SUBTYPE_DRAG_PAN_BEGIN));
        this._bPanning = true;
      }
      
      if (this._controlPanel)
        this._controlPanel.mouseDragPanningStarted();
        
      this._callbackObj.panBy(touch.pageX - this._oldPanX, touch.pageY - this._oldPanY);
      this._oldPanX = touch.pageX;
      this._oldPanY = touch.pageY; 
    }
  }
  
  if (event)
    event.preventDefault();
}

DvtPanZoomCanvasEventManager.prototype.PanEndTouch = function (event, touch) {
  if (!this._bZooming && this._bPanning) {
    this._bPanning = false;
    this._callback.call(this._callbackObj, new DvtPanEvent(DvtPanEvent.SUBTYPE_DRAG_PAN_END));
  
    if (this._controlPanel)
      this._controlPanel.mouseDragPanningEnded();
  }
  
  if (event)
    event.preventDefault();
}
/**
 *  @param {DvtEventManager} manager The owning DvtEventManager
 *  @class DvtPanZoomCanvasKeyboardHandler
 *  @extends DvtKeyboardHandler
 *  @constructor
 */
var DvtPanZoomCanvasKeyboardHandler = function (component, manager) {
  this.Init(component, manager);
};

DvtObj.createSubclass(DvtPanZoomCanvasKeyboardHandler, DvtKeyboardHandler, "DvtPanZoomCanvasKeyboardHandler");

/**
 * @override
 */
DvtPanZoomCanvasKeyboardHandler.prototype.Init = function(component, manager) {
  DvtPanZoomCanvasKeyboardHandler.superclass.Init(manager);
  this._component = component;
}

/**
 * @override
 */
DvtPanZoomCanvasKeyboardHandler.prototype.processKeyDown = function(event) {
  var keyCode = event.keyCode;
  var canvas = this._component.getPanZoomCanvas();
  if (keyCode == DvtKeyboardEvent.PAGE_UP) {
    //TODO handle BiDi panning left/right
    if (event.ctrlKey||event.shiftKey)
      canvas.panBy(canvas.getPanIncrement(),0);
    else
      canvas.panBy(0,canvas.getPanIncrement());
  }
  else if (keyCode == DvtKeyboardEvent.PAGE_DOWN) {
    if (event.ctrlKey||event.shiftKey)
      canvas.panBy(-canvas.getPanIncrement(),0);
    else
      canvas.panBy(0,-canvas.getPanIncrement());
  }
  else if (keyCode == DvtKeyboardEvent.FORWARD_SLASH) {
    var controlPanel = canvas.getControlPanel();
    if (controlPanel)
      controlPanel.toggleExpandCollapse();
  }
  else if (DvtKeyboardEvent.isEquals(event) || DvtKeyboardEvent.isPlus(event)) {
    canvas.zoomTo(canvas.getZoom() + canvas.getZoomIncrement());
  }
  else if (DvtKeyboardEvent.isMinus(event) || DvtKeyboardEvent.isUnderscore(event)) {
    canvas.zoomTo(canvas.getZoom() - canvas.getZoomIncrement());
  }
  else if ((keyCode == DvtKeyboardEvent.ZERO || keyCode == DvtKeyboardEvent.NUMPAD_ZERO) && !event.ctrlKey && !event.shiftKey) {
    canvas.zoomToFit();
  }
  else {
    return DvtPanZoomCanvasKeyboardHandler.superclass.processKeyDown.call(this, event);
  }
}

/**
 *  @param {DvtEventManager} manager The owning DvtEventManager
 *  @class DvtThematicMapKeyboardHandler
 *  @extends DvtKeyboardHandler
 *  @constructor
 */
var DvtThematicMapKeyboardHandler = function (tmap, manager) {
  this.Init(tmap, manager);
};

DvtObj.createSubclass(DvtThematicMapKeyboardHandler, DvtPanZoomCanvasKeyboardHandler, "DvtThematicMapKeyboardHandler");

/**
 * @override
 */
DvtThematicMapKeyboardHandler.prototype.Init = function (tmap, manager) {
  DvtThematicMapKeyboardHandler.superclass.Init(tmap, manager);
  this._tmap = tmap;
}

/**
 * @override
 */
DvtThematicMapKeyboardHandler.prototype.isSelectionEvent = function (event) {
  return this.isNavigationEvent(event) && !event.ctrlKey;
}

/**
 * @override
 */
DvtThematicMapKeyboardHandler.prototype.processKeyDown = function (event) {
  var keyCode = event.keyCode;

  if (keyCode == DvtKeyboardEvent.CLOSE_BRACKET) {
    var focusObj = this._eventManager.getFocus();
    var navigables = this._eventManager.getCurrentCallbackObj().getDataObjects();
    
    if (focusObj instanceof DvtMapDataArea && navigables.length > 0) {
      if (event.shiftKey) // multi-select
        focusObj = DvtKeyboardHandler.getNextAdjacentNavigable(focusObj, event, navigables);
      else if (event.ctrlKey) // no selection
        focusObj = DvtKeyboardHandler.getNextAdjacentNavigable(focusObj, event, navigables);
      else // single select
        focusObj = DvtKeyboardHandler.getNextAdjacentNavigable(focusObj, event, navigables);
    }
    this._eventManager.setFocus(focusObj);
    return focusObj;
  }
  else if (keyCode == DvtKeyboardEvent.OPEN_BRACKET) {
    var focusObj = this._eventManager.getFocus();
    var navigables = this._tmap.getNavigableAreas();
    
    if (!(focusObj instanceof DvtMapDataArea) && navigables.length > 0) {
      if (event.shiftKey) // multi-select
        focusObj = DvtKeyboardHandler.getNextAdjacentNavigable(focusObj, event, navigables);
      else if (event.ctrlKey) // no selection
        focusObj = DvtKeyboardHandler.getNextAdjacentNavigable(focusObj, event, navigables);
      else // single select
        focusObj = DvtKeyboardHandler.getNextAdjacentNavigable(focusObj, event, navigables);
    }
    this._eventManager.setFocus(focusObj);
    return focusObj;
  }
  else {
    return DvtThematicMapKeyboardHandler.superclass.processKeyDown.call(this, event);
  }
}

/**
 * @override
 */
DvtThematicMapKeyboardHandler.prototype.isMultiSelectEvent = function (event) {
  return event.keyCode == DvtKeyboardEvent.SPACE && event.ctrlKey;
}

/**
 * @override
 */
DvtThematicMapKeyboardHandler.prototype.isNavigationEvent = function (event) {
  var isNavigable = DvtThematicMapKeyboardHandler.superclass.isNavigationEvent.call(this, event);

  if (!isNavigable) {
    var keyCode = event.keyCode;
    if (keyCode == DvtKeyboardEvent.OPEN_BRACKET || keyCode == DvtKeyboardEvent.CLOSE_BRACKET)
      isNavigable = true;
  }

  return isNavigable;
}
/**
 * Default values and utility functions for chart versioning.
 * @class
 */
var DvtThematicMapDefaults = new Object();

DvtObj.createSubclass(DvtThematicMapDefaults, DvtObj, "DvtThematicMapDefaults");

/**
 * Defaults for version 1.
 */ 
DvtThematicMapDefaults.VERSION_1 = {
  'legend': {
    'position': "auto",
    'rendered': true,
    'layout': {'gapRatio': 1.0}
  },
  'layout': {
    'gapRatio': null, // gapRatio is dynamic based on the component size
    // TODO, the following are internal and should be moved to a _layout object
    'legendMaxSize': 0.3, 'legendGap': 10
  }
};

/**
 * Combines the user options with the defaults for the specified version.  Returns the
 * combined options object.  This object will contain internal attribute values and
 * should be accessed in internal code only.
 * @param {object} userOptions The object containing options specifications for this component.
 * @return {object} The combined options object.
 */
DvtThematicMapDefaults.calcOptions = function(userOptions) {
  var defaults = DvtThematicMapDefaults._getDefaults(userOptions);

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
DvtThematicMapDefaults._getDefaults = function(userOptions) {
  // Note: Version checking will eventually get added here
  // Note: Future defaults objects are deltas on top of previous objects
  return DvtJSONUtils.clone(DvtThematicMapDefaults.VERSION_1);
}

/**
 * Scales down gap sizes based on the size of the component.
 * @param {DvtChartImpl} chart The chart that is being rendered.
 * @param {Number} defaultSize The default gap size.
 * @return {Number} 
 */
DvtThematicMapDefaults.getGapSize = function(amxTMap, defaultSize) {
  return Math.ceil(defaultSize * amxTMap.getGapRatio());
}

var DvtAmxThematicMap = function (context, callback, callbackObj) {
  this.Init(context, callback, callbackObj);
}

DvtObj.createSubclass(DvtAmxThematicMap, DvtContainer, "DvtAmxThematicMap");

DvtAmxThematicMap._LEGEND_COMPONET_GAP = 10;

DvtAmxThematicMap.prototype.Init = function (context, callback, callbackObj) {
  DvtAmxThematicMap.superclass.Init.call(this, context);
  this._tmap = new DvtThematicMap(context, callback, callbackObj);
  this._tmapContainer = new DvtContainer(context);
  this._tmapContainer.addChild(this._tmap);
  this.addChild(this._tmapContainer);
}

/**
 * Returns a new instance of DvtAmxThematicMap.
 * @param {DvtContext} context The rendering context.
 * @param {string} callback The function that should be called to dispatch component events.
 * @param {object} callbackObj The optional object instance on which the callback function is defined.
 * @param {object} options The object containing options specifications for this component.
 * @return {DvtLedGauge}
 */
DvtAmxThematicMap.newInstance = function (context, callback, callbackObj, options) {
  var amxTmap = new DvtAmxThematicMap(context, callback, callbackObj);
  amxTmap.setOptions(options);
  return amxTmap;
}

/**
 * Specifies the non-data options for this component.
 * @param {object} options The object containing options specifications for this component.
 * @protected
 */
DvtAmxThematicMap.prototype.setOptions = function (options) {
  this.Options = DvtThematicMapDefaults.calcOptions(options);
  // turn off animation for canvas
  if (this.getContext() instanceof DvtCanvasContext) {
    this.Options['animationOnDisplay'] = 'none';
    this.Options['animationOnMapChange'] = 'none'
  }
}

/**
 * Renders the component with the specified data.  If no data is supplied to a component
 * that has already been rendered, the component will be rerendered to the specified size.
 * @param {object} data The object containing data for this component.
 * @param {number} width The width of the component.
 * @param {number} height The height of the component.
 */
DvtAmxThematicMap.prototype.render = function (data, width, height) {
  this.Data = data;
  this._width = width;
  this._height = height;
  
  //Render Legend
  var availSpace = new DvtRectangle(0, 0, width, height);
  this._renderLegend(this, availSpace);
  
  var bCanvas = (this.getContext() instanceof DvtCanvasContext);
  var xmlString = DvtThematicMapJsonToXmlConverter.convertJsonToXml(this.Data, this.Options, bCanvas, this._tmap.getContext());
  this._tmap.render(xmlString, availSpace.w, availSpace.h);
}

/**
 * Renders legend and updates the available space.
 * @param {DvtChartImpl} chart The chart being rendered.
 * @param {DvtContainer} container The container to render into.
 * @param {DvtRectangle} availSpace The available space.
 */
DvtAmxThematicMap.prototype._renderLegend = function(container, availSpace) {

  var availLegendSpace = new DvtRectangle(DvtAmxThematicMap._LEGEND_COMPONET_GAP, DvtAmxThematicMap._LEGEND_COMPONET_GAP, 
                                    availSpace.w-2*DvtAmxThematicMap._LEGEND_COMPONET_GAP, availSpace.h-2*DvtAmxThematicMap._LEGEND_COMPONET_GAP);

  var options = this.Options;
  
  var rendered = options['legend']['rendered'];
  var scrolling = options['legend']['scrolling'];
	
  // Create the data object for the legend
  var legendData = this._getLegendData(this.Data);
  
  // Done if position is none
  if(!rendered || (legendData.sections && legendData.sections.length == 0))
    return;

  // Create the options object for the legend
  var legendOptions = DvtJSONUtils.clone(options['legend']);
  var position = options['legend']['position'];
  delete legendOptions["position"];
  legendOptions['layout']['gapRatio'] = this.getGapRatio();
  legendOptions['hideAndShowBehavior'] = 'none';
  legendOptions['rolloverBehavior'] = 'none';
  legendOptions['scrolling'] = options['legend']['scrolling'];
  
  // Create and add the legend to the display list for calc and rendering
  // TODO handle chart event procissing i.e. hide show/ rollover
  var legend = DvtLegend.newInstance(this._tmap.getContext(), null, null, legendOptions);
  if(this._tmap.getId() != null){
    //create and set legend id based on parent id
    legend.setId(this._tmap.getId()+"legend");
  }
  container.addChild(legend);
	
  var maxWidth;
  var maxHeight;
  
  // Evaluate the automatic position
  // If scrolling is off, default legend position to bottom
  if(position == "auto" && scrolling !== "asNeeded") {
    position = "bottom";
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
  var isHoriz = (position == "top" || position == "bottom");
  maxWidth = isHoriz ? availLegendSpace.w : options['layout']['legendMaxSize'] * availLegendSpace.w;
  maxHeight = isHoriz ? options['layout']['legendMaxSize'] * availLegendSpace.h : availLegendSpace.h;
  var actualSize = legend.getPreferredSize(legendData, maxWidth, maxHeight);
    
  legend.render(legendData, actualSize.width, actualSize.height);
  var gap = DvtThematicMapDefaults.getGapSize(this, options['layout']['legendGap']);
  DvtLayoutUtils.position(availLegendSpace, position, legend, actualSize.width, actualSize.height, gap);

  // update availSpace
  switch(position) {
    case 'top':
      this._tmapContainer.setTranslateY(actualSize.height + DvtAmxThematicMap._LEGEND_COMPONET_GAP);
    case 'bottom':
      availSpace.h = availSpace.h - (actualSize.height + DvtAmxThematicMap._LEGEND_COMPONET_GAP);
      break;
    case 'left':
      this._tmapContainer.setTranslateX(actualSize.width + DvtAmxThematicMap._LEGEND_COMPONET_GAP);
    case 'right':
      availSpace.w = availSpace.w - (actualSize.width + DvtAmxThematicMap._LEGEND_COMPONET_GAP);
      break;
    default:
      break;
  }
  
  // Cache the legend for interactivity
//  this._tmap['legend'] = legend;
}

DvtAmxThematicMap.prototype.getGapRatio = function() {
  // If defined in the options, use that instead
  if(this.Options['layout']['gapRatio'] !== null && !isNaN(this.Options['layout']['gapRatio']))
    return this.Options['layout']['gapRatio'];
  else {
    var wRatio = Math.min(this._width/400, 1);
    var hRatio = Math.min(this._height/300, 1);
    return Math.min(wRatio, hRatio);
  }
}

/**
 * Returns the data object to be passed to the legend.
 * @param {DvtChartImpl} chart The chart whose data will be passed to the legend.
 * @return {object} The data object for the chart's legend.
 */
DvtAmxThematicMap.prototype._getLegendData = function(data) {
  var legendData = {};
  legendData['title'] = data['legend'] ? data['legend']['title'] : null;
  legendData['sections'] = [];

  if(data && data['legend'] && data['legend']['sections']) {
    // Iterate through any sections defined with attribute groups
    for(var i=0; i<data['legend']['sections'].length; i++) {
      var dataSection = data['legend']['sections'][i];
      if(dataSection) 
        legendData['sections'].push({'title': dataSection['title'], 'items': dataSection['items'], 'sections': dataSection['sections']});
    }
  }
    
  return legendData;
}

/**
 * DVT Toolkit based thematic map component
 * @extends DvtContainer
 * @class DVT Toolkit based thematic map component
 * @constructor
 */
var DvtThematicMap = function (context, callback, callbackObj) {
  this.Init(context, callback, callbackObj);
}

DvtObj.createSubclass(DvtThematicMap, DvtAbstractPanZoomComponent, "DvtThematicMap");

// Layout Constants
DvtThematicMap._EMPTY_TEXT_BUFFER = 2;

DvtThematicMap._FEATURES_OFF_PAN = 1;
DvtThematicMap._FEATURES_OFF_ZOOM = 2;
DvtThematicMap._FEATURES_OFF_PAN_ZOOM = 3;
DvtThematicMap._FEATURES_OFF_ZOOMTOFIT = 4;
DvtThematicMap._FEATURES_OFF_PAN_ZOOMTOFIT = 5;
DvtThematicMap._FEATURES_OFF_ZOOM_ZOOMTOFIT = 6;
DvtThematicMap._FEATURES_OFF_ALL = 7;

DvtThematicMap._NONE = 'none';
DvtThematicMap._ANIMATION_ON_DATA_CHANGE = 'animationOnDataChange';
DvtThematicMap._ANIMATION_DURATION = 'animationDuration';
DvtThematicMap._AREA_LAYER = 'area';
DvtThematicMap._POINT_LAYER = 'marker';
DvtThematicMap._POINT_LAYER_CONTAINER_ID = 'pointLayer';
DvtThematicMap._BASE_LAYER_CONTAINER_ID = 'baseLayer';
DvtThematicMap._COLLAPSIBLE_PANEL_OFFSET = 5;

DvtThematicMap._ELEM_RESOURCES_CONTROLPANEL = "controlPanelResources";
DvtThematicMap._ELEM_RESOURCES_LEGEND = "legendResources";

DvtThematicMap._HOVER_LAYER_CONTAINER_ID = 'hoverLayer';
DvtThematicMap._DRILL_LAYER_CONTAINER_ID = 'drillAnimLayer';
//DvtThematicMap._ELEM_RESOURCES_OVERVIEW = "overviewResources";

DvtThematicMap._BASEMAP_SHADOW = new DvtShadow('#4A556A', 5, 3, 3, 45, 191, 3);
DvtThematicMap._MOUSE_DRAG_ALPHA = .3;

/**
 * Initializes the thematicMap
 * @param {DvtContext} context The rendering context.
 * @param {string} callback The function that should be called to dispatch component events.
 * @protected
 */
DvtThematicMap.prototype.Init = function (context, callback, callbackObj) {
  DvtThematicMap.superclass.Init.call(this, context);
  this._callback = callback;
  this._callbackObj = callbackObj;
  
  this._isTouchDevice = DvtAgent.getAgent().isTouchDevice();
  
  // Each Tmap has only one keyboard handler and one context menu handler. Each layer has its own event manager
  // because selection modes can differ between layers.
  this._eventHandler = new DvtThematicMapEventManager(context, this._dispatchEvent, this);
  this._eventHandler.addListeners(this);
  if (!this._isTouchDevice) {
    this._keyboardHandler = new DvtThematicMapKeyboardHandler(this, this._eventHandler);
    this._eventHandler.setKeyboardHandler(this._keyboardHandler);
  } else {
    this._keyboardHandler = null;
  }

  this._layers = [];
  this._drillHierarchy = [];
  this._drillAnimFadeOutObjs = [];

  this._legend = null;
  this._legendPanel = null;
  this._legendButtonImages = null;
  this._controls = 0xffffff;

  this._bBaseMapChanged = false;
  this._drilledRowKeys = [];
  this._initDrilled = new Object();
  this._drillDataLayer = new Object();

  this._childToParent = new Object();
  this._drilled = [];
  
  this._areaLayers = new DvtContainer(this.getContext());
  this._dataAreaLayers = new DvtContainer(this.getContext());
  this._dataAreaSelectionLayers = new DvtContainer(this.getContext());
  this._dataPointLayers = new DvtContainer(this.getContext());
  this._hoverLayer = new DvtContainer(this.getContext());
  this._labelLayers = new DvtContainer(this.getContext());
  
  this._initialZooming = false;
  this._zooming = true;
  this._panning = true;
  
  // Filters unsupported, so initialize alternative selection effects
  // Copied from DvtGraphCore
  if (!context.getDocumentUtils().isFilterSupported()) {
      DvtSelectionEffectUtils.DEFAULT_SEL_TYPE = DvtSelectionEffectUtils.SEL_TYPE_STROKE_NO_FILTERS;
  }
}

DvtThematicMap.prototype.getEventHandler = function () {
  return this._eventHandler;
}

DvtThematicMap.prototype.addPointLayer = function (layer) {
  this._layers.push(layer);
}

DvtThematicMap.prototype.addLayer = function (layer) {
  this._layers.unshift(layer);
  this._drillHierarchy.unshift(layer);
}

DvtThematicMap.prototype.getLayer = function (layerName) {
  for (var i = 0;i < this._layers.length;i++) {
    if (this._layers[i].getLayerName() == layerName)
      return this._layers[i];
  }
}

DvtThematicMap.prototype.getAreaLayerContainer = function () {
  return this._areaLayers;
}

DvtThematicMap.prototype.getDataAreaContainer = function () {
  return this._dataAreaLayers;
}

DvtThematicMap.prototype.getDataAreaSelectionContainer = function () {
  return this._dataAreaSelectionLayers;
}

DvtThematicMap.prototype.getDataPointContainer = function () {
  return this._dataPointLayers;
}

DvtThematicMap.prototype.getHoverContainer = function () {
  return this._hoverLayer;
}

DvtThematicMap.prototype.getLabelContainer = function () {
  return this._labelLayers;
}

DvtThematicMap.prototype.setMapName = function (attr) {
  this._bBaseMapChanged = (this._mapName && this._mapName != attr);
  this._mapName = attr;
}

DvtThematicMap.prototype.setAnimationOnDisplay = function (attr) {
  this._animationOnDisplay = attr;
}

DvtThematicMap.prototype.setAnimationOnMapChange = function (attr) {
  this._animationOnMapChange = attr;
}

DvtThematicMap.prototype.setAnimationDuration = function (attr) {
  this._animationDuration = parseFloat(attr);
}

DvtThematicMap.prototype.setDisplayTooltips = function (attr) {
  this._displayTooltips = attr;
}

DvtThematicMap.prototype.getDisplayTooltips = function () {
  return this._displayTooltips;
}

DvtThematicMap.prototype.setBackgroundStyle = function (attr) {
  var style = new DvtCSSStyle(attr)
  this.setComponentStyle(style);
}

DvtThematicMap.prototype.setFeaturesOff = function (attr) {
  this._featuresOff = attr;
  if (this._featuresOff == DvtThematicMap._FEATURES_OFF_PAN)
    this._controls = 0x001100;
  else if (this._featuresOff == DvtThematicMap._FEATURES_OFF_ZOOM)
    this._controls = 0x000110;
  else if (this._featuresOff == DvtThematicMap._FEATURES_OFF_PAN_ZOOM)
    this._controls = 0x000100;
  else if (this._featuresOff == DvtThematicMap._FEATURES_OFF_ZOOMTOFIT)
    this._controls = 0x001010;
  else if (this._featuresOff == DvtThematicMap._FEATURES_OFF_PAN_ZOOMTOFIT)
    this._controls = 0x001000;
  else if (this._featuresOff == DvtThematicMap._FEATURES_OFF_ZOOM_ZOOMTOFIT)
    this._controls = 0x000010;
}

DvtThematicMap.prototype.setBiDi = function (attr) {
  this._isBiDi = (attr == 'false');
}

DvtThematicMap.prototype.setInitialCenterX = function (attr) {
  this._initialCenterX = parseFloat(attr);
}

DvtThematicMap.prototype.setInitialCenterY = function (attr) {
  this._initialCenterY = parseFloat(attr);
}

DvtThematicMap.prototype.setInitialZoom = function (attr) {
  this._initialZoom = parseFloat(attr);
}

DvtThematicMap.prototype.setAnimationOnDrill = function (attr) {
  if (attr == 'alphaFade')
    this._animationOnDrill = attr;
}

DvtThematicMap.prototype.setDrillMode = function (attr) {
    this._drillMode = attr;
    this._eventHandler.setDrillMode(attr);
}

DvtThematicMap.prototype.setInitialZooming = function (attr) {
    this._initialZooming = attr;
}

DvtThematicMap.prototype.setDrillZoomToFit = function (attr) {
  this._drillZoomToFit = (attr == 'true');
}

DvtThematicMap.prototype.setMenuNode = function (node) {
  this._menuNode = node;
  this._contextMenuHandler = new DvtThematicMapContextMenuHandler(this.getContext(), this);
  this._contextMenuHandler.add(this._menuNode);
  this._eventHandler.setContextMenuHandler(this._contextMenuHandler);
}

DvtThematicMap.prototype.setMenuResources = function (resources) {
  this._contextMenuHandler.setResources(resources);
}

DvtThematicMap.prototype.getLegendPanel = function (node) {
  return this._legendPanel;
}

DvtThematicMap.prototype.LoadXmlInitial = function (eventType, rootXmlNode, paramKeys, paramValues) {
  // 3 cases we need to handle
  // 1. Initial render
  // 2. New area layer
  // 3. New base map
  
  // For cases 2 & 3 we will need to clear the old stored information
  if (this._pzcContainer) {
    this._layers = [];
    this._drillHierarchy = [];
    this._drilledRowKeys = [];
    this._initDrilled = new Object();
    this._drillDataLayer = new Object();
    this._childToParent = new Object();
    this._drilled = [];
    
    this.removeChild(this._legendPanel);
    this._legendPanel = null;
    this._legend = null;
    this._legendButtonImages = null;
    this._controls = 0xffffff;
    
    this._oldPzcContainer = this._pzcContainer;
    this._pzcContainer = null;
    
    this._pzc.getContentPane().setMatrix(new DvtMatrix());
    
    // save a copy of the old containers for animation
    this._oldAreaLayers = this._areaLayers;
    this._oldDataAreaLayers = this._dataAreaLayers;
    this._oldDataAreaSelectionLayers = this._dataAreaSelectionLayers;
    this._oldDataPointLayers = this._dataPointLayers;
    this._oldHoverLayer = this._hoverLayer;
    this._oldLabelLayers = this._labelLayers;
    

    this._areaLayers = new DvtContainer(this.getContext());
    this._dataAreaLayers = new DvtContainer(this.getContext());
    this._dataAreaSelectionLayers = new DvtContainer(this.getContext());
    this._dataPointLayers = new DvtContainer(this.getContext());
    this._hoverLayer = new DvtContainer(this.getContext());
    this._labelLayers = new DvtContainer(this.getContext());
    
    // create new handlers
    this._eventHandler = new DvtThematicMapEventManager(this.getContext(), this._dispatchEvent, this);
    this._eventHandler.addListeners(this);
    if (!DvtAgent.getAgent().isTouchDevice()) {
      this._keyboardHandler = new DvtThematicMapKeyboardHandler(this, this._eventHandler);
      this._eventHandler.setKeyboardHandler(this._keyboardHandler);
    } else {
      this._keyboardHandler = null;
    }

  }
  
  // clear data tips from previous event handlers
  this._eventHandler.hideTooltip();

  this.GetXmlDomParser().loadXmlInitial(rootXmlNode, paramKeys, paramValues);
}

DvtThematicMap.prototype.HandleLegendResize = function (event) {
  if (!DvtStyleUtils.isLocaleR2L()) {
    var x = this.GetWidth() - 5 - event.getWidth();
    this._legendPanel.setTranslateX(x);
  }
}

DvtThematicMap.prototype._renderLegend = function () {
  if (this._legend) {
    this.addChild(this._legendPanel);
    this.addChild(this._legend); // temp add for rendering
    this._legend.render();
    this._legendPanel.addContent(this._legend);
    
    // position legend
    var containerDim = this._legendPanel.getDimensions();
    var x = DvtStyleUtils.isLocaleR2L() ? 5 : this.GetWidth() - 5 - containerDim.w - containerDim.x;
    this._legendPanel.setTranslateX(x);
    this._legendPanel.setTranslateY(5);
  
    //ToDo rollover behavior
    //    legendDisplayable.addEventListener('listItemShowHide', this._legendCallback, false, this);  
    //    if ("dim" == this._rolloverBehavior) {
    //        legendDisplayable.addEventListener('legendItemRollOver', this._rolloverCallback, false, this);
    //    }
  }
}

DvtThematicMap.prototype.InitComponentInternal = function () {
  DvtThematicMap.superclass.InitComponentInternal.call(this);

  var clipPath = new DvtClipPath(this.getId()+"ClipPath");
  clipPath.addRect(0, 0, this.GetWidth(), this.GetHeight());
  this.setClipPath(clipPath);
}

DvtThematicMap.prototype.RenderComponentInternal = function () {
  DvtThematicMap.superclass.RenderComponentInternal.call(this);

  // Create a new container and render the component into it
  var pzcContainer = new DvtContainer(this.getContext());
  var cpContainer = new DvtContainer(this.getContext());
  this._pzc.addChild(pzcContainer);
  this._pzc.getContentPane().addChild(cpContainer);
  this._render(pzcContainer, cpContainer);  
  
  // Re-add the control panel on top of any rendered layers
  if (this._controlPanel)
    this._pzc.addChild(this._controlPanel);
  
  // Animation Support
  // Stop any animation in progress
  if (this._animation) {
    this._animationStopped = true;
    this._animation.stop(true);
  }

  var bBlackBoxUpdate = false;
  var pzcMatrix = this._pzc.getContentPane().getMatrix();
  var bounds1 = new DvtRectangle(0, 0, this.GetWidth()/pzcMatrix.getA(), this.GetHeight()/pzcMatrix.getD());
  var bounds2 = new DvtRectangle(0, 0, this.GetWidth(), this.GetHeight());
  var anim1NewContainers = [this._areaLayers, this._dataAreaLayers];
  var anim2NewContainers = [this._dataAreaSelectionLayers, this._dataPointLayers, this._labelLayers, this._hoverLayer];
  
  // 3 types of animations can occur
  // 1) animation on display
  // 2) animation on base map change
  // 3) animation on area layer change
  
  if (!this._oldPzcContainer) { // Case 1
    // animation on display
    if (DvtBlackBoxAnimationHandler.isSupported(this._animationOnDisplay)) {
      var anim1 = DvtBlackBoxAnimationHandler.getInAnimation(this.getContext(), this._animationOnDisplay, 
                                                                  anim1NewContainers, bounds1, 
                                                                  this._animationDuration);
      var anim2 = DvtBlackBoxAnimationHandler.getInAnimation(this.getContext(), this._animationOnDisplay, 
                                                                  anim2NewContainers, bounds2, 
                                                                  this._animationDuration);
      this._animation = new DvtParallelPlayable(this.getContext(), [anim1, anim2]);
    }
  }
  else { 
    // Trying to match Flash. If the layer changes for example from country to states then we should display the data 
    // layer's animationOnDataChange. However an area layer can have multiple data layers (area and points). We will 
    // just use the animation of the first data layer. 
    var anim = null;
    if (this._bBaseMapChanged) { // Case 2
      anim = this._animationOnMapChange;
    } else if (this._topLayer && this._topLayer.getLayerName() != this._oldTopLayerName) {
      anim = this._topLayer.getAnimation();
      if (!anim) { // Case 3
        var dataLayers = this._topLayer.getDataLayers();
        for (var i in dataLayers) {
          if (dataLayers[i].getAnimation()) {
            anim = dataLayers[i].getAnimation();
            break;
          }
        }
      }
    }
    
    var anim1OldContainers = [this._oldAreaLayers, this._oldDataAreaLayers, this._oldHoverLayer];
    var anim2OldContainers = [this._oldDataAreaSelectionLayers, this._oldDataPointLayers, this._oldLabelLayers];
    
    if (anim && DvtBlackBoxAnimationHandler.isSupported(anim)) {
      var anim1 = DvtBlackBoxAnimationHandler.getCombinedAnimation(this.getContext(), anim, 
                                                                        anim1OldContainers, 
                                                                        anim1NewContainers, bounds1, 
                                                                        this._animationDuration);
      var anim2 = DvtBlackBoxAnimationHandler.getCombinedAnimation(this.getContext(), anim, 
                                                                        anim2OldContainers, 
                                                                        anim2NewContainers, bounds2, 
                                                                        this._animationDuration);                                                                        
      this._animation = new DvtParallelPlayable(this.getContext(), [anim1, anim2]);
      bBlackBoxUpdate = true;
    }
    else {
      this._pzc.getContentPane().removeChild(this._cpContainer);
      this._pzc.removeChild(this._oldPzcContainer);
    }
  }

  // If an animation was created, play it
  if (this._animation) {
    this._eventHandler.hideTooltip();
    // Disable event listeners temporarily
    this._eventHandler.removeListeners(this);
    // Start the animation
    this._animation.setOnEnd(this.OnAnimationEnd, this);
    this._animation.play();
  }
  if (bBlackBoxUpdate) {
    this._oldCpContainer = this._cpContainer;
  }

  // Update the pointers
  this._pzcContainer = pzcContainer;
  this._cpContainer = cpContainer;
  
  if(this._topLayer){
    this._oldTopLayerName = this._topLayer.getLayerName();
  }
}

DvtThematicMap.prototype._calcMinZoom = function () {
    var bounds = this._pzc.getContentPane().getDimensions();
    var zoomPadding = this._pzc.getZoomToFitPadding();
    var dzx = (this.GetWidth() - 2 * zoomPadding) / (bounds.w);
    var dzy = (this.GetHeight() - 2 * zoomPadding) / (bounds.h);
    var dz = Math.min(dzx, dzy);
    return dz;
}

DvtThematicMap.prototype._render = function (pzcContainer, cpContainer) {
  // Only draw map if there is at least one area layer 
  if (this._layers[0] instanceof DvtMapAreaLayer) {
    // Don't add shadow for now. Flash initially renders shadow but then removes on zoom 
    // Otherwise zooming is too slow
    //    this._baseMap.addDrawEffect(DvtThematicMap._BASEMAP_SHADOW.clone());
    
    // Add all containers
    cpContainer.addChild(this._areaLayers);
    cpContainer.addChild(this._dataAreaLayers);
    pzcContainer.addChild(this._dataAreaSelectionLayers);
    pzcContainer.addChild(this._dataPointLayers);
    pzcContainer.addChild(this._labelLayers);
    pzcContainer.addChild(this._hoverLayer);
    
    
    // Render all point layers and the first area layer
    var pzcMatrix = this._pzc.getContentPane().getMatrix();
    var renderedDataLayers = [];
    
    this._topLayer = this._layers[0];
    // only the first area layer should be rendered
    for (var i = 0;i < this._layers.length;i++) {
      var layer = this._layers[i];
      if (i == 0 || !(layer instanceof DvtMapAreaLayer)) {
        layer.render(pzcMatrix);
        var dataLayers = layer.getDataLayers();
        if (dataLayers) {
          for (var id in dataLayers)
            renderedDataLayers = renderedDataLayers.concat(dataLayers[id].getContainers());
        }
      }
    }
    
    // Set initially focused area
    var navigables = this.getNavigableAreas();
    if (navigables.length == 0)
      navigables = this.getNavigableObjects();
      
    if (this._keyboardHandler)
      this._eventHandler.setInitialFocus(this._keyboardHandler.getDefaultNavigable(navigables));

    // Set initially drilled regions
    this._processInitialDrilled();
    
    // do not set min and max zoom before calling zoom to fit on map
    this._pzc.setMinZoom(null);
    this._pzc.setMaxZoom(null);  
    
    //Check to see if zoom and pan was intitially set, otherwise fit and center to area 
    // No need to read zoom/pan if canvas isn't re-rendered
    if (this._initialZoom != null) {
        this._pzc.zoomBy(this._initialZoom);
        this._pzc.panTo( this._initialCenterX,  this._initialCenterY);
    } else if (this._initialZooming) {
      this.fitRegion(renderedDataLayers);
    } else {
      // Only zoom to fit on initial render
      this._pzc.zoomToFit(); 
    }
    
    // Get the current zoom of the canvas to set min canvas zoom to fit component in viewport
    var fittedZoom
    if (this._initialZoom == null)
      fittedZoom = this._pzc.getZoom();
    else 
      fittedZoom = this._calcMinZoom();
    this._pzc.setMinZoom(fittedZoom);
    this._pzc.setMaxZoom(fittedZoom * 10);
  }
  
  this._renderLegend();
}

DvtThematicMap.prototype.updateLayer = function (xmlNode) {
  // Stop any animations before starting layer animations
  if (this._animation) {
    this._animationStopped = true;
    this._animation.stop(true);
  }
  
  // Parse new data layer
  this.GetXmlDomParser().ParseDataLayers(xmlNode, true);
  this._renderLegend();
}

DvtThematicMap.prototype.getMapName = function () {
  return this._mapName;
}

DvtThematicMap.prototype.getDrillMode = function () {
  return this._drillMode;
}

DvtThematicMap.prototype.setButtonImages = function (uris) {
  var childNodes = uris.getChildNodes();
  for (var i = 0;i < childNodes.length;i++) {
    var node = childNodes[i];
    var nodeName = node.getName();
    if (nodeName == DvtThematicMap._ELEM_RESOURCES_CONTROLPANEL)
      DvtThematicMap.superclass.setButtonImages.call(this, node);
    else if (nodeName == DvtThematicMap._ELEM_RESOURCES_LEGEND)
      this._legendButtonImages = node;
  }
}

DvtThematicMap.prototype.getLegendButtonImages = function () {
  return this._legendButtonImages;
}

DvtThematicMap.prototype.setLegend = function (legend, legendPanel) {
  this._legend = legend;
  if (this._legendPanel) // for layer update
    this.removeChild(this._legendPanel);
  this._legendPanel = legendPanel
}

DvtThematicMap.prototype.setRolloverBehavior = function (rolloverBehavior) {
  //  if (this._legend) {
  //    if ("dim" == rolloverBehavior && "dim" != this._rolloverBehavior) {
  //      this._legend.getDisplayObj().addEventListener('legendItemRollOver', this._rolloverCallback, false, this);      
  //    }
  //    if ("dim" != rolloverBehavior && "dim" == this._rolloverBehavior) {
  //      this._legend.getDisplayObj().removeEventListener('legendItemRollOver', this._rolloverCallback, false, this);
  //    }
  //  }
  this._rolloverBehavior = rolloverBehavior;
}

DvtThematicMap.prototype.getRolloverBehavior = function () {
  return this._rolloverBehavior;
}

DvtThematicMap.prototype.GetXmlDomParser = function () {
  return new DvtThematicMapParser(this);
}

DvtThematicMap.prototype._transformContainers = function (pzcMatrix) {
  // Handle pan/zoom for containers
//  this._areaLayers.setMatrix handled by pan zoom canvas;
//  this._dataAreaLayers handled by pan zoom canvas;
  //this._dataAreaSelectionLayers handle own transforms bc of shadows added on areas
  //areas which have transforms set already
  //this._dataPointLayers handle own transforms bc of filter effects on markers
  var childLabelLayers = this._labelLayers.getNumChildren();
  for (var i=0; i<childLabelLayers; i++) {
    var childLabelLayer = this._labelLayers.getChildAt(i);
    var labels = childLabelLayer.getNumChildren();
    for (var j=0; j<labels; j++) {
      var label = childLabelLayer.getChildAt(j);
      label.update(pzcMatrix);
    }
  }
  this._hoverLayer.setMatrix(pzcMatrix.clone());
}

DvtThematicMap.prototype.HandleControlPanelEvent = function (event) {
  DvtThematicMap.superclass.HandleControlPanelEvent.call(this, event);
  var spEvent = new DvtSetPropertyEvent();
  spEvent.addParam(DvtPanZoomControlPanel.CONTROL_PANEL_BEHAVIOR_KEY, 
                  event.getSubType() == DvtControlPanelEvent.SUBTYPE_SHOW ?
                  DvtAbstractPanZoomComponent.CONTROL_PANEL_BEHAVIOR_INIT_EXPANDED :
                  DvtAbstractPanZoomComponent.CONTROL_PANEL_BEHAVIOR_INIT_COLLAPSED);
  this._dispatchEvent(spEvent);
}

DvtThematicMap.prototype.HandleCollapsiblePanelEvent = function (event) {
  // Currently only one collapsible container which contains a legend
  var spEvent = new DvtSetPropertyEvent();
  spEvent.addParam(DvtCommonLegend.LEGEND_DISCLOSED_KEY, event.getSubType() == DvtCollapsiblePanelEvent.SUBTYPE_SHOW);
  this._dispatchEvent(spEvent);
}

DvtThematicMap.prototype.HandleZoomEvent = function (event) {
  var type = event.getSubType();
  if (type == DvtZoomEvent.SUBTYPE_ZOOMING) {
    this._removeForCPAnimationStart();
  }
  else if (type == DvtZoomEvent.SUBTYPE_ZOOMED) {
    this._addForCPAnimationEnd();
      
    var zoom = event.getNewZoom();
    if (zoom != null) {
      var pzcMatrix = this._pzc.getContentPane().getMatrix();
      event.addParam('panX', pzcMatrix.getTx());
      event.addParam('panY', pzcMatrix.getTy());
      this.getContext().getJsExt().dispatchEvent(this._callback, this._callbackObj, this, event);

      this._transformContainers(pzcMatrix);
      
      for (var i = 0;i < this._layers.length;i++)
        this._layers[i].HandleZoomEvent(pzcMatrix);
    }
    this.getContext().queueRender();
  } 
}

DvtThematicMap.prototype.HandlePanEvent = function (event) {

  var subType = event.getSubType();
  if (subType == DvtPanEvent.SUBTYPE_PANNING) {
    this._removeForCPAnimationStart();
  }
  else if (subType == DvtPanEvent.SUBTYPE_PANNED) {
    this._addForCPAnimationEnd();
    
    if (event.getNewX() != null) {
      var pzcMatrix = this._pzc.getContentPane().getMatrix();
      event.addParam('zoom', this._pzc.getZoom());
      event.addParam('panX', pzcMatrix.getTx());
      event.addParam('panY', pzcMatrix.getTy());
      this.getContext().getJsExt().dispatchEvent(this._callback, this._callbackObj, this, event);
      
      this._transformContainers(pzcMatrix);
      
      for (var i = 0;i < this._layers.length;i++)
        this._layers[i].HandlePanEvent(pzcMatrix);
    }
    this.getContext().queueRender();
  }
  
  // dim legend panel on pan
  if (this._legendPanel) {
    if (subType === DvtPanEvent.SUBTYPE_DRAG_PAN_BEGIN) {
      this._oldLegendAlpha = this._legendPanel.getAlpha();
      this._legendPanel.setAlpha(DvtThematicMap._MOUSE_DRAG_ALPHA);
      this._legendPanel.setMouseEnabled(false);
    }
    else if (subType === DvtPanEvent.SUBTYPE_DRAG_PAN_END){
      this._legendPanel.setAlpha(this._oldLegendAlpha);
      this._legendPanel.setMouseEnabled(true);
    }
  }
}

DvtThematicMap.prototype.CreatePanZoomCanvas = function (ww, hh) {
  // if new base map, don't recreate canvas
  if (!this._pzc) {
    // turn off control panel for mobile
    if (this._isTouchDevice)
      this.setControlPanelBehavior('hidden');
    this._pzc = DvtThematicMap.superclass.CreatePanZoomCanvas.call(this, ww, hh);
    
    // Create control panel with drilling buttons if drilling is on
    if (this._drillMode != 'none' && this.getControlPanelBehavior() != 'hidden' && this._featuresOff != DvtThematicMap._FEATURES_OFF_ALL) {
      var callbacks = [DvtObj.createCallback(this, this.drillUp), DvtObj.createCallback(this, this.drillDown), DvtObj.createCallback(this, this.resetMap)]
      this._controlPanel = new DvtThematicMapControlPanel(this.getContext(), this._drillMode, this._buttonImages, callbacks, this._pzc, this.getPanZoomResources(), this._controls);
      this._pzc.setControlPanel(this._controlPanel);
    }
     
    if (this._featuresOff == DvtThematicMap._FEATURES_OFF_PAN || this._featuresOff == DvtThematicMap._FEATURES_OFF_PAN_ZOOM || this._featuresOff == DvtThematicMap._FEATURES_OFF_PAN_ZOOMTOFIT || this._featuresOff == DvtThematicMap._FEATURES_OFF_ALL)
      this.setPanning(false);
    if (this._featuresOff == DvtThematicMap._FEATURES_OFF_ZOOM || this._featuresOff == DvtThematicMap._FEATURES_OFF_ZOOM_ZOOMTOFIT || this._featuresOff == DvtThematicMap._FEATURES_OFF_PAN_ZOOM || this._featuresOff == DvtThematicMap._FEATURES_OFF_ALL)
      this.setZooming(false);
    
    this._pzc.setZoomingEnabled(this._zooming);
    this._pzc.setPanningEnabled(this._panning);
  
  } else {
    this._pzc.setSize(ww, hh);
  }
  this._eventHandler.setPanZoomCanvas(this._pzc);
  return this._pzc;
}

DvtThematicMap.prototype.setZooming = function (attr) {
  this._zooming = attr;
}

DvtThematicMap.prototype.setPanning = function (attr) {
  this._panning = attr;
}

DvtThematicMap.prototype.addDisclosedRowKey = function (drilled) {
  this._drilledRowKeys.push(drilled);
}

DvtThematicMap.prototype.addDrilledLayer = function (layerName, drilled) {
  this._initDrilled[layerName] = drilled;
}

DvtThematicMap.prototype._processInitialDrilled = function () {
  for (var layerName in this._initDrilled) {
    this._selectedAreas = this._initDrilled[layerName][1];
    this._clickedLayerName = layerName;
    this._clickedDataLayerId = this._initDrilled[layerName][0];
    this.drillDown();
  }
  this._initDrilled = null;
}

DvtThematicMap.prototype.resetMap = function () {
  //Clear selection and drilled starting from the lowest layer
  var removeObjs = [];
  var addObjs = [];
  for (var i = this._drillHierarchy.length-1; i > -1; i--) {
    if (i == 0)
      this._drillHierarchy[i].reset(addObjs);
    else
      this._drillHierarchy[i].reset(removeObjs);
  }
  for (var j=0; j<removeObjs.length; j++) {
    if (removeObjs[j]) {
      var parent = removeObjs[j].getParent();
      parent.removeChild(removeObjs[j]);
    }
  }
  // addObjs have opacity set to 0
  for (var j=0; j<addObjs.length; j++) {
    if (addObjs[j])
      addObjs[j].setAlpha(1);
  }
  this._drilledRowKeys = [];
  this.fitMap();
  this._drilled = [];

  if (this._controlPanel && this._drillMode != 'none') {
    this._controlPanel.setEnabledDrillDownButton(false);
    this._controlPanel.setEnabledDrillUpButton(false);
  }

}

DvtThematicMap.prototype.fitRegion = function (toFit) {
  var animator = new DvtAnimator(this.getContext(), .3);
  //For selection
  if (!toFit)
    toFit = this._zoomToFitObject;
  if (!toFit)
    toFit = this._clickedObject;
    
  var bounds;
  if (DvtArrayUtils.isArray(toFit)) {
    bounds = toFit[0].getDimensions();
    for (var i=1; i< toFit.length; i++)
      bounds = bounds.getUnion(toFit[i].getDimensions());
  } else {
    bounds = toFit.getDimensions();
  }
  this._pzc.zoomToFit(animator, bounds);
  animator.play();
}

DvtThematicMap.prototype.fitMap = function () {
  var animator = new DvtAnimator(this.getContext(), .3);
  this._pzc.zoomToFit(animator);
  animator.play();
}

DvtThematicMap.prototype.getDrillParentLayer = function (layerName) {
  var childLayer = null;
  for (var i = 0;i < this._drillHierarchy.length;i++) {
    if (this._drillHierarchy[i].getLayerName() == layerName)
      return childLayer;
    childLayer = this._drillHierarchy[i];
  }
  return null;
}

DvtThematicMap.prototype.getDrillChildLayer = function (layerName) {
  for (var i = 0;i < this._drillHierarchy.length;i++) {
    if (i == this._drillHierarchy.length - 1)
      return null
    if (this._drillHierarchy[i].getLayerName() == layerName)
      return this._drillHierarchy[i + 1];
  }
  return null;
}

DvtThematicMap.prototype.getNavigableAreas = function () {
  var disclosed = [];
  if (this._topLayer){
    for (var i = 0;i < this._layers.length;i++) {
      var dataLayers = this._layers[i].getDataLayers();
      for (var id in dataLayers) {
        if (this._topLayer.getLayerName() == this._layers[i].getLayerName())
          disclosed = disclosed.concat(dataLayers[id].getNavigableAreaObjects());
        else 
          disclosed = disclosed.concat(dataLayers[id].getNavigableDisclosedAreaObjects());
      }
    }
  }
  return disclosed;
}

DvtThematicMap.prototype.getNavigableObjects = function () {
  var navigable = [];
  if (this._topLayer) {
    for (var i = 0;i < this._layers.length;i++) {
      var dataLayers = this._layers[i].getDataLayers();
      if (this._topLayer.getLayerName() == this._layers[i].getLayerName() || !(this._layers[i] instanceof DvtMapAreaLayer)) {
        for (var id in dataLayers)
          navigable = navigable.concat(dataLayers[id].getDataObjects());
      }
    }
  }
  return navigable;
}

DvtThematicMap.prototype.drillDown = function () {
  var childLayer = this.getDrillChildLayer(this._clickedLayerName);
  var parentLayer = this.getLayer(this._clickedLayerName);
  var fadeInObjs = [];

  if (childLayer) {
    this._drillDataLayer[this._clickedLayerName] = this._clickedDataLayerId;

    //Reset other disclosed regions in this layer
    if (this._drillMode == 'single') {
      this._drilled.pop();
      parentLayer.reset(fadeInObjs, this._selectedAreas);
      childLayer.reset(this._drillAnimFadeOutObjs);
    }

    var newSelectedAreas = [];
    for (var i = 0;i < this._selectedAreas.length;i++) {
      var parentArea = this._selectedAreas[i];
      var childrenToDisclose = parentLayer.getChildrenForArea(parentArea);
      newSelectedAreas.push(childrenToDisclose[0]);
      
      //Update child to parent mapping 
      for (var j = 0;j < childrenToDisclose.length;j++)
        this._childToParent[childrenToDisclose[j]] = this._selectedAreas[i];

      //Add disclosed child areas of drilled region
      childLayer.discloseAreas(childrenToDisclose, fadeInObjs);
      //Set the parent area border from selected to drilled
      var drillLayer = parentLayer.getDataLayer(this._clickedDataLayerId);
      if (drillLayer)
        drillLayer.drill(parentArea, this._drillAnimFadeOutObjs);
      //Update list of disclosed areas
      this._drilled.push(parentArea);
    }

    this._handleDrillAnimations(this._drillAnimFadeOutObjs, fadeInObjs, false);
    this._updateDrillButton(childLayer.getLayerName());
    //Update so that drill up will work right after a drill down with no additional selection
    this._clickedLayerName = childLayer.getLayerName();
    this._selectedAreas = newSelectedAreas;
  }
}

DvtThematicMap.prototype.drillUp = function () {
  var childLayer = this.getLayer(this._clickedLayerName);
  var parentLayer = this.getDrillParentLayer(this._clickedLayerName);
  //For fade in/out animation
  var fadeInObjs = [];
  var newSelectedAreas = [];
  for (var i = 0;i < this._selectedAreas.length;i++) {
    var parentArea = this._childToParent[this._selectedAreas[i]];
    newSelectedAreas.push(parentArea);
    //Don't add a parent area multiple times if many children are selected
    if (DvtArrayUtils.indexOf(this._drilled, parentArea) !=  - 1) {
      var childrenToUndisclose = parentLayer.getChildrenForArea(parentArea);

      //Remove disclosed child areas of drilled region
      childLayer.undiscloseAreas(childrenToUndisclose, this._drillAnimFadeOutObjs);
      //Set the parent area border from drilled to selected
      parentLayer.getDataLayer(this._drillDataLayer[parentLayer.getLayerName()]).undrill(parentArea, fadeInObjs);
      //Update list of disclosed areas
      var index = DvtArrayUtils.indexOf(this._drilled, parentArea);
      if (index !=  - 1)
        this._drilled.splice(index, 1);
    }
  }

  this._handleDrillAnimations(this._drillAnimFadeOutObjs, fadeInObjs, true);

  this._clickedLayerName = parentLayer.getLayerName();
  this._clickedDataLayerId = this._drillDataLayer[this._clickedLayerName];
  this._selectedAreas = newSelectedAreas;
  this._updateDrillButton(this._clickedLayerName);
}


DvtThematicMap.prototype.stopAnimation = function () {
  if (this._animation) {
    this._animationStopped = true;
    this._animation.stop(true);
  }
}

DvtThematicMap.prototype._removeForCPAnimationStart = function () {
  if (!this._containersRemovedForAnimation && this._pzcContainer) {
    this._pzcContainer.removeChild(this._dataAreaSelectionLayers);
    this._pzcContainer.removeChild(this._dataPointLayers);
    this._pzcContainer.removeChild(this._labelLayers);
    this._pzcContainer.removeChild(this._hoverLayer);
    //Set a flag so we know to put containers back on HandleZoom/PanEvent
    this._containersRemovedForAnimation = true;
  }
}

DvtThematicMap.prototype._addForCPAnimationEnd = function () {
  if (this._containersRemovedForAnimation && this._pzcContainer) {
    this._pzcContainer.addChild(this._dataAreaSelectionLayers);
    this._pzcContainer.addChild(this._dataPointLayers);
    this._pzcContainer.addChild(this._labelLayers);
    this._pzcContainer.addChild(this._hoverLayer);
    this._containersRemovedForAnimation = false;
  }
}

DvtThematicMap.prototype._handleDrillAnimations = function (oldObjs, newObjs, isDrillUp) {
  
  var bounds;
  var pzcMatrix = this._pzc.getContentPane().getMatrix();
  //Zoom to fit selection only if not proccessing initially drilled on initial render
  if (this._drillZoomToFit && !this._initDrilled) {
    var animator = new DvtAnimator(this.getContext(), .3);
    if (isDrillUp)
      this._pzc.zoomToFit(animator);
    else {
      bounds = this._zoomToFitObject.getDimensions();
      this._pzc.zoomToFit(animator, bounds);
    }
    animator.play();
  } else {
    bounds = new DvtRectangle(0, 0, this.GetWidth()/pzcMatrix.getA(), this.GetHeight()/pzcMatrix.getD());
  }

  //Alpha fade in changes
  if (this._animationOnDrill == 'alphaFade') {
    //Stop previous animation
    if (this._animation) {
      this._animationStopped = true;
      this._animation.stop(true);
    }
    var animDur = 1.0;
    this._animation = DvtBlackBoxAnimationHandler.getCombinedAnimation(this.getContext(), this._animationOnDrill, oldObjs, newObjs, bounds, animDur);
    // If an animation was created, play it
    if (this._animation) {
      this._eventHandler.hideTooltip();
      // Disable event listeners temporarily
      this._eventHandler.removeListeners(this);
      // Start the animation
      this._animation.setOnEnd(this.OnDrillAnimationEnd, this);
      this._animation.play();
    }
  }
}

DvtThematicMap.prototype.setClickInfo = function (clientId, layerName, obj) {
  this._clickedLayerName = layerName;
  this._clickedDataLayerId = clientId;
  this._clickedObject = obj;
}

DvtThematicMap.prototype.setEventClientId = function (clientId) {
  this._eventClientId = clientId;
}

/**
 * Dispatches the event to the callback function.
 * @param {object} event The event to be dispatched.
 */
DvtThematicMap.prototype._dispatchEvent = function (event) {
  var type = event.getType();
  if (type == DvtContextMenuSelectEvent.TYPE) {  
    this._handleContextMenuSelectEvent(event);
  } else {
    if (type == DvtContextMenuEvent.TYPE) {
      this._handleContextMenuEvent(event);
    }
    else if (type == DvtSelectionEvent.TYPE) {
      this._handleSelectionEvent(event);
    }
    else if (type == DvtMapDrillEvent.TYPE) {
      this._handleDrillEvent(event);
    }
    else if (type == DvtShowPopupEvent.TYPE || type == DvtHidePopupEvent.TYPE) {
      event.addParam('clientId', this._eventClientId);
    }
    this.getContext().getJsExt().dispatchEvent(this._callback, this._callbackObj, this, event);
  }
}

DvtThematicMap.prototype._handleContextMenuSelectEvent = function (event) {
  var action = event.getParamValue('action');
  
  if (action == DvtThematicMapContextMenuHandler.RESET_MAP) {
    this._handleDrillEvent(new DvtMapDrillEvent(DvtMapDrillEvent.RESET));
  } else if (action == DvtThematicMapContextMenuHandler.FIT_MAP) {
    this.fitMap();
  } else if (action == DvtThematicMapContextMenuHandler.FIT_REGION) {
    if (this._selectedRowKeys && this._selectedRowKeys.length > 1)
       this._zoomToFitObject = this.getLayer(this._clickedLayerName).getDataLayer(this._clickedDataLayerId).getAreaSelectionLayer();
   else
      this._zoomToFitObject = this._clickedObject;
    this.fitRegion();
  } else if (action == DvtThematicMapContextMenuHandler.DRILL_UP) {
    //might need to update selected row keys if selection event isn't fired
    this._handleDrillEvent(new DvtMapDrillEvent(DvtMapDrillEvent.DRILL_UP));
  } else if (action == DvtThematicMapContextMenuHandler.DRILL_DOWN) {
    this._handleDrillEvent(new DvtMapDrillEvent(DvtMapDrillEvent.DRILL_DOWN));
  }

}

DvtThematicMap.prototype._handleContextMenuEvent = function (event) {
  var layer = this.getLayer(this._clickedLayerName);
  var dataLayer;
  if (layer)
    dataLayer = layer.getDataLayer(this._clickedDataLayerId);

  if (this._drillMode != 'none') {
    var parentLayer = this.getDrillParentLayer(this._clickedLayerName);
    var childLayer = this.getDrillChildLayer(this._clickedLayerName);
    if (childLayer && parentLayer)
      event.addParam('state', 'fud');
    else if (childLayer)
      event.addParam('state', 'fd');
    else if (parentLayer)
      event.addParam('state', 'fu');
  } else if (this._clickedObject && !(this._clickedObject instanceof DvtMarker)){
    event.addParam('state', 'f');
  }
}

DvtThematicMap.prototype._handleSelectionEvent = function (event) {
  if (this._clickedDataLayerId) {
    this._selectedRowKeys = event.getSelection();
    var dataLayer = this.getLayer(this._clickedLayerName).getDataLayer(this._clickedDataLayerId);
    this._selectedAreas = dataLayer.getSelectedAreas(this._selectedRowKeys);
    this._updateDrillButton(this._clickedLayerName);
    event.addParam('clientId', this._clickedDataLayerId);
    
    // Save fit to region object
    if (dataLayer && dataLayer.getAreaSelectionLayer() && this._drillMode !== 'single')
      this._zoomToFitObject = dataLayer.getAreaSelectionLayer();
    else if (this._clickedObject && !(this._clickedObject instanceof DvtMarker))
      this._zoomToFitObject = this._clickedObject;
  }
}

DvtThematicMap.prototype._hideSelectionMenu = function() {
  if (this._selectionText) {
    this.removeChild(this._selectionText);
    this._selectionText = null;
  }
}

DvtThematicMap.prototype._updateDrillButton = function (layerName) {
  if (this._controlPanel && this._drillMode && this._drillMode != 'none') {
    var childLayer = this.getDrillChildLayer(layerName);
    var parentLayer = this.getDrillParentLayer(layerName);
    if (childLayer)
      this._controlPanel.setEnabledDrillDownButton(true);
    else 
      this._controlPanel.setEnabledDrillDownButton(false);

    if (parentLayer)
      this._controlPanel.setEnabledDrillUpButton(true);
    else 
      this._controlPanel.setEnabledDrillUpButton(false);
  }
}

DvtThematicMap.prototype._handleDrillEvent = function (event) {
  event.addParam('clientId', this._eventClientId);
  if (this._drillMode == 'multiple')
    this._drilledRowKeys = this._drilledRowKeys.concat(this._selectedRowKeys);
  else 
    this._drilledRowKeys = this._selectedRowKeys;

  var drillType = event.getDrillType();
  if (drillType == DvtMapDrillEvent.DRILL_UP)
    this.drillUp();
  if (drillType == DvtMapDrillEvent.DRILL_DOWN)
    this.drillDown();
  else if (drillType == DvtMapDrillEvent.RESET)
    this.resetMap();

  event.setDisclosed(this._drilledRowKeys);
}

DvtThematicMap.prototype.destroy = function () {
  DvtThematicMap.superclass.destroy.call(this);
  if (this._eventHandler) {
    this._eventHandler.destroy();
    this._eventHandler = null;
  }
}

/**
 * Hook for cleaning up animation behavior at the end of the animation.
 * @override
 */
DvtThematicMap.prototype.OnAnimationEnd = function () {
  // Clean up the old container used by black box updates
  if (this._oldPzcContainer && this._oldCpContainer) {
    this._pzc.getContentPane().removeChild(this._oldCpContainer);
    this._pzc.removeChild(this._oldPzcContainer);
    this._oldPzcContainer = null;
    this._oldCpContainer = null;
  }

  // Reset the animation stopped flag
  this._animationStopped = false;

  // Remove the animation reference
  this._animation = null;

  // Restore event listeners
  this._eventHandler.addListeners(this);
}

DvtThematicMap.prototype.OnDrillAnimationEnd = function () {
  // Clean up the old container used by black box updates
  if (this._drillAnimFadeOutObjs.length > 0) {
    for (var i=0; i<this._drillAnimFadeOutObjs.length; i++) {
      if (this._drillAnimFadeOutObjs[i]) {
        var parent = this._drillAnimFadeOutObjs[i].getParent();
        if (parent)
          parent.removeChild(this._drillAnimFadeOutObjs[i]);
      }
    }
    this._drillAnimFadeOutObjs = [];
  }
  // Reset the animation stopped flag
  this._animationStopped = false;
  // Remove the animation reference
  this._animation = null;
  // Restore event listeners
  this._eventHandler.addListeners(this);
}

DvtThematicMap.prototype._rolloverCallback = function (event) {
  var category = event.getHideAttributes();
  //  var hiddenAttrGroups = this.getHiddenAttributeGroups();
  //  if (!hiddenAttrGroups) {
  //    hiddenAttrGroups = [];
  //  }
  //  var index = DvtArrayUtils.indexOf(hiddenAttrGroups, category);
  //  if (index != -1) {
  //    return; // ignore rollover on hidden attribute groups
  //  }
  var type = DvtLegendItemRollOverEvent.MOUSEOVER == event.getMouseState() ? DvtCategoryRolloverEvent.TYPE_OVER : DvtCategoryRolloverEvent.TYPE_OUT;
  this._fireRolloverEvent(type, category);
}

DvtThematicMap.prototype._fireRolloverEvent = function (type, category) {
  var rolloverEvent = new DvtCategoryRolloverEvent(type, category);
  // Build object list
  var objects = new Array();

  // Loop through areas
  for (var layerId in this._areas) {
    for (var key in this._areas[layerId]) {
      objects.push(this._areas[layerId][key]);
    }
  }

  // Loop through markers
  for (var layerId in this._markers) {
    for (var key in this._markers[layerId]) {
      objects.push(this._markers[layerId][key]);
    }
  }

  var legendItems = this._legend._hideAttrsLookUp;
  for (var legendCategory in legendItems) {
    var wrapper = new DvtThematicMapCategoryWrapper(legendItems[legendCategory].getContentShape(), legendCategory);
    objects.push(wrapper);
  }
  DvtCategoryRolloverHandler.processEvent(rolloverEvent, objects, 0.1);
}

// APIs called by the ADF Faces drag source for DvtThematicMap


DvtThematicMap.prototype._getCurrentDragSource = function () {
  for (var i = 0;i < this._layers.length;i++) {
    var dataLayers = this._layers[i].getDataLayers();
    for (var id in dataLayers) {
      var dataLayer = dataLayers[id];
      var dragSource = dataLayer.getDragSource();
      if (dragSource && dragSource.getDragCandidate())
        return dragSource;
    }
  }
}

/**
 * If this object supports drag, returns the client id of the drag component.
 * Otherwise returns null.
 * @param mouseX the x coordinate of the mouse
 * @param mouseY the x coordinate of the mouse
 * @param clientIds the array of client ids of the valid drag components
 */
DvtThematicMap.prototype.isDragAvailable = function (mouseX, mouseY, clientIds) {
  var dragSource = this._getCurrentDragSource();
  return dragSource ? dragSource.isDragAvailable(clientIds) : false;
}

/**
 * Returns the transferable object for a drag initiated at these coordinates.
 */
DvtThematicMap.prototype.getDragTransferable = function (mouseX, mouseY) {
  var dragSource = this._getCurrentDragSource();
  return dragSource.getDragTransferable(mouseX, mouseY);
}

/**
 * Returns the feedback for the drag operation.
 */
DvtThematicMap.prototype.getDragOverFeedback = function (mouseX, mouseY) {
  var dragSource = this._getCurrentDragSource();
  return dragSource.getDragOverFeedback(mouseX, mouseY);
}

/**
 * Returns an Object containing the drag context info.
 */
DvtThematicMap.prototype.getDragContext = function (mouseX, mouseY) {
  var dragSource = this._getCurrentDragSource();
  return dragSource.getDragContext(mouseX, mouseY); 
}

/**
 * Returns the offset to use for the drag feedback. This positions the drag
 * feedback relative to the pointer.
 */
DvtThematicMap.prototype.getDragOffset = function (mouseX, mouseY) {
  var dragSource = this._getCurrentDragSource();
  return dragSource.getDragOffset(mouseX, mouseY); 
}

/**
 * Returns the offset from the mouse pointer where the drag is considered to be located.
 */
DvtThematicMap.prototype.getPointerOffset = function (xOffset, yOffset) {
  var dragSource = this._getCurrentDragSource();
  return dragSource.getPointerOffset(xOffset, yOffset);
}

/**
 * Notifies the component that a drag started.
 */
DvtThematicMap.prototype.initiateDrag = function () {
  var dragSource = this._getCurrentDragSource();
  dragSource.initiateDrag();
}

/**
 * Clean up after the drag is completed.
 */
DvtThematicMap.prototype.dragDropEnd = function () {
  var dragSource = this._getCurrentDragSource();
  dragSource.dragDropEnd();
}
// APIs called by the ADF Faces drop target for DvtThematicMap

DvtThematicMap.prototype._getCurrentDropTarget = function (mouseX, mouseY) {
  for (var i = 0;i < this._layers.length;i++) {
    var dropTarget = this._layers[i].getDropTarget();
    if (dropTarget && dropTarget.getDropSite(mouseX, mouseY))
      return dropTarget;
  }
  return null;
}

/**
 * If a drop is possible at these mouse coordinates, returns the client id
 * of the drop component. Returns null if drop is not possible.
 */
DvtThematicMap.prototype.acceptDrag = function (mouseX, mouseY, clientIds) {
  mouseX = (mouseX-this._panX)/this._zoom;
  mouseY = (mouseY-this._panY)/this._zoom;
  this._dropTarget = this._getCurrentDropTarget(mouseX, mouseY);
  if (this._dropTarget)
    return this._dropTarget.acceptDrag(mouseX, mouseY, clientIds);
  else
    return null;
}

/**
 * Paints drop site feedback as a drag enters the drop site.
 */
DvtThematicMap.prototype.dragEnter = function () {
  if (this._dropTarget)
    return this._dropTarget.dragEnter();
  else
    return null;
}

/**
 * Cleans up drop site feedback as a drag exits the drop site.
 */
DvtThematicMap.prototype.dragExit = function () {
  if (this._dropTarget)
    return this._dropTarget.dragExit();
  else
    return null;
}

/**
 * Returns the object representing the drop site. This method is called when a valid
 * drop is performed.
 */
DvtThematicMap.prototype.getDropSite = function (mouseX, mouseY) {
  mouseX = (mouseX-this._panX)/this._zoom;
  mouseY = (mouseY-this._panY)/this._zoom;
  if (this._dropTarget)
    return this._dropTarget.getDropSite(mouseX, mouseY);
  else
    return null;
}
/**
 * Drop Target event handler for DvtThematicMap
 * @param {DvtMapAreaLayer} areaLayer
 * @class DvtThematicMapDropTarget
 * @extends DvtDropTarget
 * @constructor
 */
var DvtThematicMapDropTarget = function(areaLayer) {
  this._areaLayer = areaLayer;  
};

DvtObj.createSubclass(DvtThematicMapDropTarget, DvtDropTarget, "DvtThematicMapDropTarget");

/**
 * @override
 */
DvtThematicMapDropTarget.prototype.acceptDrag = function (mouseX, mouseY, clientIds) {
  // If there is no obj under the point, then don't accept the drag
  var obj = this._areaLayer.__getObjectUnderPoint(mouseX, mouseY);
  if(!obj) {
    this._areaLayer.__showDropSiteFeedback(null);
    return null;
  }
  else if(obj != this._dropSite) {
    this._areaLayer.__showDropSiteFeedback(obj); 
    this._dropSite = obj;
  }
  
  // Return the first clientId, since this component has only a single drag source
  return this._areaLayer.getClientId();
}

/**
 * @override
 */
DvtThematicMapDropTarget.prototype.dragExit = function () {
  // Remove drop site feedback
  this._areaLayer.__showDropSiteFeedback(null); 
  this._dropSite = null;
}

/**
 * @override
 */
DvtThematicMapDropTarget.prototype.getDropSite = function (mouseX, mouseY) {
  var obj = this._areaLayer.__getObjectUnderPoint(mouseX, mouseY);
  if(obj)
    return {regionId: obj.getId()};
  else
    return null;
}
var DvtBaseMapManager = this.DvtBaseMapManager;
if (!DvtBaseMapManager) {
  DvtBaseMapManager = {};
}

DvtObj.createSubclass(DvtBaseMapManager, DvtObj, "DvtBaseMapManager");

DvtBaseMapManager.TYPE_LABELS = 0;// contain region labels
DvtBaseMapManager.TYPE_PATH = 1;// contain region paths
DvtBaseMapManager.TYPE_PARENTREGION_CHILDREN = 2;// contains parent region id to current region id mappings.  Stored this way since mapping is only needed if child layer is present. 
DvtBaseMapManager.TYPE_LABELINFO = 3;// contains leaderline info
DvtBaseMapManager._INDEX = '__index';

DvtBaseMapManager._GLOBAL_MAPS = new Object();

DvtBaseMapManager.getAreaLabelInfo = function (baseMapName, layerName) {
  DvtBaseMapManager._processUnprocessedMaps();
  var layer = DvtBaseMapManager._GLOBAL_MAPS[baseMapName][layerName];
  if (layer)
    return layer[DvtBaseMapManager.TYPE_LABELINFO];
  else
    return null;
}

DvtBaseMapManager.getAreaNames = function (baseMapName, layerName) {
  DvtBaseMapManager._processUnprocessedMaps();
  var layer = DvtBaseMapManager._GLOBAL_MAPS[baseMapName][layerName];
  if (layer)
    return layer[DvtBaseMapManager.TYPE_LABELS];
  else
    return null;
}

DvtBaseMapManager.getLongAreaLabel = function (baseMapName, layerName, areaId) {
  DvtBaseMapManager._processUnprocessedMaps();
  var layer = DvtBaseMapManager._GLOBAL_MAPS[baseMapName][layerName];
  var labels;
  if (layer)
    labels = layer[DvtBaseMapManager.TYPE_LABELS];
  if (labels && labels[areaId])
    return labels[areaId][1];
  else
    return null;
}

DvtBaseMapManager.getCityCoordinates = function (baseMapName, city) {
  DvtBaseMapManager._processUnprocessedMaps();
  var basemap = DvtBaseMapManager._GLOBAL_MAPS[baseMapName];
  if (basemap) {
    var cityLayer = basemap['cities'];
    if (cityLayer) {
      var coords =  cityLayer[DvtBaseMapManager.TYPE_PATH][city];
      if (coords)
          return new DvtPoint(coords[0], coords[1]);
    }
  }
  return null;
}

DvtBaseMapManager.getCityLabel = function (baseMapName, city) {
  DvtBaseMapManager._processUnprocessedMaps();
  var basemap = DvtBaseMapManager._GLOBAL_MAPS[baseMapName];
  if (basemap) {
    var cityLayer = basemap['cities'];
    if (cityLayer) {
      var cityLabel = cityLayer[DvtBaseMapManager.TYPE_LABELS][city];
      if (cityLabel)
        return cityLabel[1];
    }
  }
  return null;
}

DvtBaseMapManager.getAreaCenter = function (baseMapName, layerName, areaId) {
  DvtBaseMapManager._processUnprocessedMaps();
  var basemap = DvtBaseMapManager._GLOBAL_MAPS[baseMapName];
  if (basemap) {
    var layer = basemap[layerName];
    if (layer) {
      var labelInfo = layer[DvtBaseMapManager.TYPE_LABELINFO];
      if (labelInfo && labelInfo[areaId]) {
        var ar = labelInfo[areaId][0];
        var bounds = DvtRectangle.create(ar);
        return bounds.getCenter();
      }
    }
  }
  return null;
}

DvtBaseMapManager.getChildLayerName = function (baseMapName, layerName) {
  DvtBaseMapManager._processUnprocessedMaps();
  return DvtBaseMapManager._GLOBAL_MAPS[baseMapName][DvtBaseMapManager._INDEX][DvtBaseMapManager._GLOBAL_MAPS[baseMapName][layerName]['__index'] + 1];
}

DvtBaseMapManager.getParentLayerName = function (baseMapName, layerName) {
  DvtBaseMapManager._processUnprocessedMaps();
  return DvtBaseMapManager._GLOBAL_MAPS[baseMapName][DvtBaseMapManager._INDEX][DvtBaseMapManager._GLOBAL_MAPS[baseMapName][layerName]['__index'] - 1];
}

DvtBaseMapManager.getAreaPaths = function (baseMapName, layerName) {
  DvtBaseMapManager._processUnprocessedMaps();
  return DvtBaseMapManager._GLOBAL_MAPS[baseMapName][layerName][DvtBaseMapManager.TYPE_PATH];
}

DvtBaseMapManager.getChildrenForLayerAreas = function (baseMapName, layerName) {
  DvtBaseMapManager._processUnprocessedMaps();
  var childLayerName = DvtBaseMapManager.getChildLayerName(baseMapName, layerName);
  if (childLayerName) {
    var children = DvtBaseMapManager._GLOBAL_MAPS[baseMapName][childLayerName][DvtBaseMapManager.TYPE_PARENTREGION_CHILDREN];
    if (children)
      return children;
    else
      return [];
  } 
  return [];
}

DvtBaseMapManager.getMapLayerName = function (baseMapName, index) {
  DvtBaseMapManager._processUnprocessedMaps();
  return DvtBaseMapManager._GLOBAL_MAPS[baseMapName][DvtBaseMapManager._INDEX][index];
}

/**
 * @export
 * called at the end of the base map JS metadata files to register new base map layer metadata
 */
DvtBaseMapManager.registerBaseMapLayer = function (baseMapName, layerName, labelMetadata, pathMetadata, parentsRegionMetadata, labelInfoMetadata, index) {
  // bootstrap global base map metadata  
  // find or create basemap metadata
  var basemapMetadata = DvtBaseMapManager._GLOBAL_MAPS[baseMapName];
  if (!basemapMetadata) {
    basemapMetadata = new Object();
    basemapMetadata['__index'] = new Array();
    DvtBaseMapManager._GLOBAL_MAPS[baseMapName] = basemapMetadata;
  }

  // find or create layer metadata
  var layerMetadata = basemapMetadata[layerName];
  if (!layerMetadata) {
    layerMetadata = new Object();
    basemapMetadata[layerName] = layerMetadata;
    basemapMetadata[DvtBaseMapManager._INDEX][index] = layerName;
  }

  // register layer metadata base on type
  layerMetadata[DvtBaseMapManager.TYPE_LABELS] = labelMetadata;
  layerMetadata[DvtBaseMapManager.TYPE_PATH] = pathMetadata;
  layerMetadata[DvtBaseMapManager.TYPE_PARENTREGION_CHILDREN] = parentsRegionMetadata;
  layerMetadata[DvtBaseMapManager.TYPE_LABELINFO] = labelInfoMetadata;
  layerMetadata[DvtBaseMapManager._INDEX] = index;
}

/**
 * @export
 */
DvtBaseMapManager.registerResourceBundle = function (baseMapName, layerName, labelMetadata) {
  var basemapMetadata = DvtBaseMapManager._GLOBAL_MAPS[baseMapName];
  if (!basemapMetadata) {
    basemapMetadata = new Object();
    DvtBaseMapManager._GLOBAL_MAPS[baseMapName] = basemapMetadata;
  }

  // find or create layer metadata
  var layerMetadata = basemapMetadata[layerName];
  if (!layerMetadata) {
    layerMetadata = new Object();
    basemapMetadata[layerName] = layerMetadata;
  }
  
  var layerMetadata = basemapMetadata[layerName];
  // Overwrite english labels with resource bundle language
  if (layerMetadata)
    layerMetadata[DvtBaseMapManager.TYPE_LABELS] = labelMetadata;
}

/**
 * @export
 */
DvtBaseMapManager.updateResourceBundle = function (baseMapName, layerName, labelMetadata) {
  var basemapMetadata = DvtBaseMapManager._GLOBAL_MAPS[baseMapName];
  if (basemapMetadata) {
      var layerMetadata = basemapMetadata[layerName];
      // Overwrite english labels with resource bundle language
      if (layerMetadata) {
          for(var prop in labelMetadata){
              layerMetadata[DvtBaseMapManager.TYPE_LABELS][prop] = labelMetadata[prop];
          }
      }
  }
}

DvtBaseMapManager._processUnprocessedMaps = function() {
  if (DvtBaseMapManager._UNPROCESSED_MAPS) {
    var i;
    var args;
    for (i = 0; i < DvtBaseMapManager._UNPROCESSED_MAPS[0].length; i++) { // registerBaseMapLayer
      args = DvtBaseMapManager._UNPROCESSED_MAPS[0][i];
      DvtBaseMapManager.registerBaseMapLayer(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
    }
    for (i = 0; i < DvtBaseMapManager._UNPROCESSED_MAPS[1].length; i++) { // registerResourceBundle
      args = DvtBaseMapManager._UNPROCESSED_MAPS[1][i];
      DvtBaseMapManager.registerResourceBundle(args[0], args[1], args[2]);
    }
    for (i = 0; i < DvtBaseMapManager._UNPROCESSED_MAPS[2].length; i++) { // updateResourceBundle
      args = DvtBaseMapManager._UNPROCESSED_MAPS[2][i];
      DvtBaseMapManager.updateResourceBundle(args[0], args[1], args[2]);
    }
    DvtBaseMapManager._UNPROCESSED_MAPS = null;
  }
}

var DvtMapDrillEvent = function(drillType) {
  this.Init(DvtMapDrillEvent.TYPE);
  this._drillType = drillType;
}

DvtObj.createSubclass(DvtMapDrillEvent, DvtBaseComponentEvent, "DvtMapDrillEvent");

DvtMapDrillEvent.TYPE = "drill";
DvtMapDrillEvent.DRILL_UP = 0;
DvtMapDrillEvent.DRILL_DOWN = 1;
DvtMapDrillEvent.RESET = 2;

/**
 * Returns the array of currently drilled ids for the component.
 * @return {array} The array of currently drilled ids for the component.
 */
DvtMapDrillEvent.prototype.getDisclosed = function() {
  return this._disclosed;
}

DvtMapDrillEvent.prototype.setDisclosed = function(disclosed) {
  this._disclosed = disclosed;
}

DvtMapDrillEvent.prototype.getDrillType = function() {
  return this._drillType;
}
var DvtMapActionEvent = function(clientId, rowKey, action) {
  this.Init(DvtMapActionEvent.TYPE);
  this._clientId = clientId;
  this._rowKey = rowKey;
  this._action = action;
}

DvtObj.createSubclass(DvtMapActionEvent, DvtBaseComponentEvent, "DvtMapActionEvent");

DvtMapActionEvent.TYPE = "action";

DvtMapActionEvent.prototype.getClientId = function() {
  return this._clientId;
}

DvtMapActionEvent.prototype.getRowKey = function() {
  return this._rowKey;
}

DvtMapActionEvent.prototype.getAction = function() {
  return this._action;
}
/**
 * Base map layer metadata
 * @extends DvtObj
 * @class base map layer metadata
 * @constructor
 */
var DvtMapLabel = function (context, label, labelInfo, leaderLineLayer) {
  this.Init(context, label, labelInfo, leaderLineLayer);
}

DvtObj.createSubclass(DvtMapLabel, DvtText, "DvtMapLabel");

/**
 * labelInfo contains at a minimum the bounds of the parent
 */
DvtMapLabel.prototype.Init = function (context, label, labelInfo, leaderLineLayer) {
  DvtMapLabel.superclass.Init.call(this, context, label, 0, 0);
  this._boundRectangle = new Array();
  this.setMouseEnabled(false);  
  this.setFontSize('11');
  this.alignTop();
  this._leaderLineLayer = leaderLineLayer;
  this._center = null;
  
  if (labelInfo) {
    this._boundRectangle.push(DvtRectangle.create(labelInfo[0]));
    if (labelInfo.length > 1) {
      this._leaderLines = new Array();
  
      for (var i = 1;i < labelInfo.length;i++) {
        var line = labelInfo[i];
        this._boundRectangle.push(DvtRectangle.create(line[0]));
  
        var polyline = new DvtPolyline(context, line[1]);
        polyline.setPixelHinting(true);
        this._leaderLines.push(polyline);
      }
    }
  }
};

DvtMapLabel.prototype.addBounds = function (boundsRect) {
  this._boundRectangle.push(boundsRect);
}

DvtMapLabel.prototype.hasBounds = function () {
  return this._boundRectangle.length > 0;
}

DvtMapLabel.prototype.update = function (pzcMatrix) {
  var dim = this.getDimensions();
  
  if (this._center == null)
    this.setCenter(this._boundRectangle[0].getCenter());
  
  if (!this._leaderLines) {
    if (dim.w > this._boundRectangle[0].w * pzcMatrix.getA())
      this.setVisible(false);
    else
      this.setVisible(true);
  } else {
     
    var state = -1;
    for (var i = 0;i < this._boundRectangle.length;i++) {
      if (dim.w <= this._boundRectangle[i].w * pzcMatrix.getA()) {
        state = i;
        this.setCenter(this._boundRectangle[i].getCenter());
        break;
      }
    }

    if (this._currentState > 0) {
      this._leaderLineLayer.removeChild(this._leaderLines[this._currentState - 1]);
      this._leaderLine = null;
    }
    if (state == -1) {
      this.setVisible(false);
    } else {
      this.setVisible(true);
      if (state > 0) {
        this._leaderLine = this._leaderLines[state - 1];
        this._leaderLine.setStroke(new DvtSolidStroke("#000000", 1.0, 1.0/pzcMatrix.getA()));
        this._leaderLineLayer.addChild(this._leaderLine);
      }
    }
    this._currentState = state;
  }
  
  var transCenter = pzcMatrix.transformPoint(this._center);
  this.setTranslateX(transCenter.x-this._center.x);
  this.setTranslateY(transCenter.y-this._center.y);
  
};

DvtMapLabel.prototype.setCenter = function (p) {
  this._center = p;
  var dim = this.getDimensions();
  if (dim) {
    this.setX(p.x - dim.w / 2.0);
    this.setY(p.y - dim.h / 2.0);
  }
}

DvtMapLabel.prototype.getLeaderLine = function () {
  return this._leaderLine;
}

DvtMapLabel.prototype.getCenter = function () {
  return this._center;
}

DvtMapLabel.prototype.setCSSStyle = function (cssStyle) {
  DvtMapLabel.superclass.setCSSStyle.call(this, cssStyle);
}
/**
 * Base map layer metadata
 * @extends DvtObj
 * @class base map layer metadata
 * @constructor
 */
var DvtMapDataObject = function (context, dataLayer, rowKey, clientId, regionId) {
  this.Init(context, dataLayer, rowKey, clientId, regionId);
}

DvtObj.createSubclass(DvtMapDataObject, DvtContainer, "DvtMapDataObject");

DvtMapDataObject.prototype.Init = function (context, dataLayer, rowKey, clientId, regionId) {
  DvtMapDataObject.superclass.Init.call(this, context, clientId);
  this._categories = [];
  this.Shape = null;
  this._id = rowKey;
  this._clientId = clientId;
  this.AreaId = regionId;
  // Keep reference of the data layer and selection layer obj belongs to
  this._selectionLayer = null;
  this._datatipColor = '#000000';
  this.Zoom = 1;
  this._hasAction = false;
  this._dataLayer = dataLayer;
}

DvtMapDataObject.prototype.getId = function () {
  return this._id;
}

DvtMapDataObject.prototype.getClientId = function () {
  return this._clientId;
}

DvtMapDataObject.prototype.getAreaId = function () {
  return this.AreaId;
}

DvtMapDataObject.prototype.setDisplayable = function (disp) {
  this.Shape = disp;
  
  // WAI-ARIA
  if (this.Shape)
    this.Shape.setAriaRole('img');
}  

DvtMapDataObject.prototype.setCenter = function (center) {
  this.Center = center;
}

DvtMapDataObject.prototype.getDisplayable = function () {
  return this.Shape;
}

DvtMapDataObject.prototype.setLabel = function (label) {
  this.Label = label;
}

DvtMapDataObject.prototype.getLabel = function () {
  return this.Label;
}

DvtMapDataObject.prototype.setLabelPosition = function (labelPos) {
  this.LabelPos = labelPos;
}

DvtMapDataObject.prototype.setHasAction = function (bool) {
  this._hasAction = bool;
}

DvtMapDataObject.prototype.hasAction = function () {
  return this._hasAction;
}

DvtMapDataObject.prototype.setAction = function (action) {
  this._action = action;
}

DvtMapDataObject.prototype.getAction = function () {
  return this._action;
}

DvtMapDataObject.prototype.setDestination = function (link) {
  this._destination = link;
}

DvtMapDataObject.prototype.getDestination = function () {
  return this._destination;
}

/**
 * @override
 */
DvtMapDataObject.prototype.setVisible = function (bVisible) {
  DvtMapDataObject.superclass.setVisible.call(this, bVisible);
  if (this.Label)
    this.Label.setVisible(bVisible);
}

/**
 * Implemented for DvtLogicalObject
 * @override
 */
DvtMapDataObject.prototype.getDisplayables = function () {
  return [this.Shape];
}

/**
 * Implemented for DvtLogicalODvtCategoricalObject
 * @override
 */
DvtMapDataObject.prototype.getCategories = function () {
  return this._categories;
}

DvtMapDataObject.prototype.addCategory = function (cat) {
  this._categories.push(cat);
}

/**
 * Implemented for DvtTooltipSource
 * @override
 */
DvtMapDataObject.prototype.getDatatip = function () {
  return this._datatip;
}

/**
 * Implemented for DvtTooltipSource
 * @override
 */
DvtMapDataObject.prototype.getDatatipColor = function () {
  return this._datatipColor;
}

DvtMapDataObject.prototype.setDatatipColor = function (color) {
  this._datatipColor = color;
  if (this.Shape && this.Shape.setDataColor)
    this.Shape.setDataColor(color);
}

DvtMapDataObject.prototype.setDatatip = function (datatip) {
  this._datatip = datatip;
    
  // WAI-ARIA
  if (this.Shape)
    this.Shape.setAriaProperty('label', datatip);
}

/**
 * Implemented for DvtSelectable
 * @override
 */
DvtMapDataObject.prototype.isSelectable = function () {
  return this.Shape.isSelectable();
}

/**
 * Implemented for DvtSelectable
 * @override
 */
DvtMapDataObject.prototype.isSelected = function () {
  return this.Shape.isSelected();
}

/**
 * Implemented for DvtSelectable
 * @override
 */
DvtMapDataObject.prototype.showHoverEffect = function () {
  //subclasses should override
}

/**
 * Implemented for DvtSelectable
 * @override
 */
DvtMapDataObject.prototype.hideHoverEffect = function () {
  //subclasses should override
}

/**
 * Implemented for DvtPopupSource.
 * Specifies the array of showPopupBehaviors for this node.
 * @param {array} behaviors The array of showPopupBehaviors for this node.
 */
DvtMapDataObject.prototype.setShowPopupBehaviors = function (behaviors) {
  this._showPopupBehaviors = behaviors;
}

/**
 * Implemented for DvtPopupSource.
 * @override
 */
DvtMapDataObject.prototype.getShowPopupBehaviors = function () {
  return this._showPopupBehaviors;
}

/**
 * Implemented for DvtContextMenuSource.
 * @override
 */
DvtMapDataObject.prototype.getContextMenuId = function () {
  return 'popupMenu';
}

/**
 * Implemented for DvtDraggable.
 * @override
 */
DvtMapDataObject.prototype.isDragAvailable = function (clientIds) {
  var parentId = this._dataLayer.getClientId();
  for (var i = 0;i < clientIds.length;i++) {
    if (clientIds[i] == parentId)
      return parentId;
  }
  return parentId;
}

DvtMapDataObject.prototype.getDataLayer = function () {
  return this._dataLayer;
}

/**
 * Implemented for DvtDraggable.
 * @override
 */
DvtMapDataObject.prototype.getDragTransferable = function (mouseX, mouseY) {
  return this._dataLayer.__getDragTransferable(this);
}

/**
 * Implemented for DvtDraggable.
 * @override
 */
DvtMapDataObject.prototype.getDragFeedback = function (mouseX, mouseY) {
  return this._dataLayer.__getDragFeedback();
}

/**
 * Implemented for DvtKeyboardNavigable.
 * @override
 */
DvtMapDataObject.prototype.getNextNavigable = function (event) {
  var keyCode;
  var next;

  if (event.type == DvtMouseEvent.CLICK) {
    return this;
  }

  keyCode = event.keyCode;

  if (keyCode == DvtKeyboardEvent.SPACE && event.ctrlKey) {
    // multi-select node with current focus; so we navigate to ourself and then let the selection handler take
    // care of the selection
    return this;
  }
  var navigables = (this.Shape instanceof DvtMapArea) ? this._dataLayer.getMap().getNavigableAreas() : this._dataLayer.getDataObjects();
  next = DvtKeyboardHandler.getNextAdjacentNavigable(this, event, navigables);

  return next;
}

/**
 * Implemented for DvtKeyboardNavigable.
 * @override
 */
DvtMapDataObject.prototype.getKeyboardBoundingBox = function () {
  if (this.Shape)
    return this.Shape.getDimensions(this.getContext().getStage());
  else 
    return new DvtRectangle(0, 0, 0, 0);
}

/**
 * Implemented for DvtKeyboardNavigable.
 * @override
 */
DvtMapDataObject.prototype.showKeyboardFocusEffect = function () {
  this.showHoverEffect();
  this._isShowingKeyboardFocusEffect = true;
}

/**
 * Implemented for DvtKeyboardNavigable.
 * @override
 */
DvtMapDataObject.prototype.hideKeyboardFocusEffect = function () {
  this.hideHoverEffect();
  this._isShowingKeyboardFocusEffect = false;
}

/**
 * Implemented for DvtKeyboardNavigable.
 * @override
 */
DvtMapDataObject.prototype.isShowingKeyboardFocusEffect = function () {
  return this._isShowingKeyboardFocusEffect;
}

/**
 * Rescale and translate
 */
DvtMapDataObject.prototype.HandleZoomEvent = function (pzcMatrix) {
  this.Zoom = pzcMatrix.getA();
  //subclasses should override
}

/**
 * Pan
 */
DvtMapDataObject.prototype.HandlePanEvent = function (pzcMatrix) {
  //subclasses should override
}

DvtMapDataObject.prototype.reCenter = function (pzcMatrix) {
  var width = this.Shape.getWidth();
  var height = this.Shape.getHeight();
  if (width != null && height != null) {
    var dimensions = this.Shape.getDimensions();
    // Calculate the current (transformed) center point
    var curCenterX = dimensions.x + dimensions.w/2;
    var curCenterY = dimensions.y + dimensions.h/2;
    var shapeCenter = pzcMatrix.transformPoint(new DvtPoint(curCenterX, curCenterY));
    this.Shape.setTranslateX(shapeCenter.x-this.Center.x);
    this.Shape.setTranslateY(shapeCenter.y-this.Center.y);
  }
}

/**
 * Base map layer metadata
 * @extends DvtObj
 * @class base map layer metadata
 * @constructor
 */
var DvtMapDataArea = function (context, dataLayer, rowKey, clientId, regionId, hoverStyle, selectStyle) {
  this.Init(context, dataLayer, rowKey, clientId, regionId, hoverStyle, selectStyle);
}

DvtMapDataArea._DEFAULT_SELECTED_STROKE_WIDTH = 1;
DvtMapDataArea._DEFAULT_SELECTED_STROKE_COLOR = '#000000';

DvtMapDataArea._DEFAULT_DISCLOSED_STROKE_WIDTH = 2;
DvtMapDataArea._DEFAULT_DISCLOSED_STROKE_COLOR = '#000000';

DvtMapDataArea._DEFAULT_HOVER_STROKE_WIDTH = 2;
DvtMapDataArea._DEFAULT_HOVER_STROKE_COLOR = '#FFFFFF';

DvtMapDataArea._DEFAULT_SHADOW_COLOR = "rgba(0,0,0,0.5)";

DvtObj.createSubclass(DvtMapDataArea, DvtMapDataObject, "DvtMapDataArea");

DvtMapDataArea.prototype.Init = function (context, dataLayer, rowKey, clientId, regionId, hoverStyle, selectStyle) {
  DvtMapDataArea.superclass.Init.call(this, context, dataLayer, rowKey, clientId, regionId);  
  
  var selectColor = DvtMapDataArea._DEFAULT_SELECTED_STROKE_COLOR;
  var selectWidth = DvtMapDataArea._DEFAULT_SELECTED_STROKE_WIDTH;
  var hoverColor = DvtMapDataArea._DEFAULT_HOVER_STROKE_COLOR;
  var hoverWidth = DvtMapDataArea._DEFAULT_HOVER_STROKE_WIDTH;
  var shadowColor = DvtMapDataArea._DEFAULT_SHADOW_COLOR;
  if (selectStyle) {
    if (DvtColorUtils.isColor(selectStyle['border-color']))
      selectColor = DvtColorUtils.getRGB(selectStyle['border-color']);
    if (selectStyle['border-width'])
      selectWidth = parseFloat(selectStyle['border-width'].substring(0, selectStyle['border-width'].indexOf('px')));
    if (selectStyle["shadow-color"]) {
      if (DvtColorUtils.isColor(selectStyle['shadow-color'])) {
        shadowColor = DvtColorUtils.getRGB(selectStyle['shadow-color']);
        shadowColor = shadowColor.substring(0, shadowColor.length -1) + ',0.5)';
      }
    }
  }
  if (hoverStyle) {
    if (DvtColorUtils.isColor(hoverStyle['border-color']))
      hoverColor = DvtColorUtils.getRGB(hoverStyle['border-color']);
    if (hoverStyle['border-width'])
      hoverWidth = parseFloat(hoverStyle['border-width'].substring(0, hoverStyle['border-width'].indexOf('px')));
  }
  
  this._selectedStroke = new DvtSolidStroke(selectColor, 1, selectWidth);
  this._disclosedStroke = new DvtSolidStroke('#000000', 1, DvtMapDataArea._DEFAULT_DISCLOSED_STROKE_WIDTH);
  this._hoverStroke = new DvtSolidStroke(hoverColor, 1, hoverWidth);
  this._selectedStrokeWidth = selectWidth;
  this._disclosedStrokeWidth = DvtMapDataArea._DEFAULT_DISCLOSED_STROKE_WIDTH;
  this._hoverStrokeWidth = hoverWidth;
  
  this._shadow = new DvtShadow(shadowColor, 5, 5, 5);

  this.ZoomedSelectedStrokeWidth = selectWidth;
  this.ZoomedDisclosedStrokeWidth = DvtMapDataArea._DEFAULT_DISCLOSED_STROKE_WIDTH;
  this.ZoomedHoverStrokeWidth = hoverWidth;
}

DvtMapDataArea.prototype.setDisplayable = function (disp) {
  DvtMapDataArea.superclass.setDisplayable.call(this, disp);  
  this._borderStroke = this.Shape.getStroke();
  this._borderStrokeWidth = this._borderStroke.getWidth();
  this.ZoomedBorderStrokeWidth = this._borderStrokeWidth;
  this._hoverShape = this.Shape.getOutline();
}

DvtMapDataArea.prototype.setSelectionLayer = function (layer) {
  this._selectionLayer = layer;
}

DvtMapDataArea.prototype.getSelectionLayer = function (layer) {
  return this._selectionLayer;
}

DvtMapDataArea.prototype.setAreaLayer = function (layer) {
  this._dataAreaLayer = layer;
}

DvtMapDataArea.prototype.setHoverLayer = function (layer) {
  this._hoverLayer = layer;
}

/**
 * Implemented for DvtSelectable
 * @override
 */
DvtMapDataArea.prototype.setSelected = function (selected) {
  if (selected) {
    this._setSelectionEffect();
  }
  else {
    this._dataAreaLayer.addChild(this.Shape);
    //Works around bug 12622757
    var context = this.getContext()
    if (context instanceof DvtSvgContext)
      context.getDocumentUtils().fixWebkitFilters(this._selectionLayer.getImpl().getElem());
    var stroke = this._borderStroke.clone();
    stroke.setWidth(this.ZoomedBorderStrokeWidth);
    this.Shape.setStroke(stroke);
  }
  this.Shape.setSelected(selected);
}

DvtMapDataArea.prototype._setSelectionEffect = function () {
  this._selectionLayer.removeAllDrawEffects();
  this._selectionLayer.addChild(this.Shape);
  this._selectionLayer.addDrawEffect(this._shadow.clone());
  var stroke = this._selectedStroke.clone();
  stroke.setWidth(this.ZoomedSelectedStrokeWidth);
  this.Shape.setStroke(stroke);
}

/**
 * Implemented for DvtSelectable
 * @override
 */
DvtMapDataArea.prototype.showHoverEffect = function () {
  var stroke = this._hoverStroke.clone();
  stroke.setWidth(this.ZoomedHoverStrokeWidth);
  this._hoverShape.setStroke(stroke);
  this._hoverLayer.addChild(this._hoverShape);
}

/**
 * Implemented for DvtSelectable
 * @override
 */
DvtMapDataArea.prototype.hideHoverEffect = function () {
  if (this.isDrilled()) {
    var stroke = this._disclosedStroke.clone();
    stroke.setWidth(this.ZoomedDisclosedStrokeWidth);
    this._hoverShape.setStroke(stroke);
  } else {
    this._hoverLayer.removeChild(this._hoverShape);
  }
}

DvtMapDataArea.prototype.isDrilled = function () {
  return this._isDrilled;
}

DvtMapDataArea.prototype.setDrilled = function (drilled) {
  this._isDrilled = drilled;
  if (drilled)
    this._setDrilledEffect();
  else
    this._hoverLayer.removeChild(this._hoverShape);
}

DvtMapDataArea.prototype._setDrilledEffect = function () { 
  var stroke = this._disclosedStroke.clone();
  stroke.setWidth(this.ZoomedDisclosedStrokeWidth);
  this._hoverShape.setStroke(stroke);
  this._hoverLayer.addChild(this._hoverShape);
}

/**
 * @override
 */
DvtMapDataArea.prototype.HandleZoomEvent = function (pzcMatrix) {
  DvtMapDataArea.superclass.HandleZoomEvent.call(this, pzcMatrix);
  
  this.ZoomedSelectedStrokeWidth = this._selectedStrokeWidth / this.Zoom;
  this.ZoomedDisclosedStrokeWidth = this._disclosedStrokeWidth / this.Zoom;
  this.ZoomedHoverStrokeWidth = this._hoverStrokeWidth / this.Zoom;
  this.ZoomedBorderStrokeWidth = this._borderStrokeWidth / this.Zoom;
  
  var stroke;
  if (this._hoverShape.getParent() && this._hoverShape.getStroke()) {
    stroke = this._hoverShape.getStroke().clone();
    stroke.setWidth(this.ZoomedHoverStrokeWidth);
    this._hoverShape.setStroke(stroke);
  }
  else if (this.isDrilled()) {
    stroke = this._hoverShape.getStroke().clone();
    stroke.setWidth(this.ZoomedDisclosedStrokeWidth);
    this._hoverShape.setStroke(stroke);
  }
  
  if (this.isSelected()) {
    stroke = this.Shape.getStroke().clone();
    stroke.setWidth(this.ZoomedSelectedStrokeWidth);
    this.Shape.setStroke(stroke);
  } else {
    stroke = this._borderStroke.clone();
    stroke.setWidth(this.ZoomedBorderStrokeWidth);
    this.Shape.setStroke(stroke);
  }
  
}

DvtMapDataArea.prototype.reCenter = function (pzcMatrix) {
  DvtMapDataMarker.superclass.reCenter.call(this, pzcMatrix);
}
/**
 * Base map layer metadata
 * @extends DvtObj
 * @class base map layer metadata
 * @constructor
 */
var DvtMapDataMarker = function (context, dataLayer, rowKey, clientId, regionId) {
  this.Init(context, dataLayer, rowKey, clientId, regionId);
}

DvtMapDataMarker.DEFAULT_MARKER_COLOR = "#61719F";
DvtMapDataMarker.DEFAULT_MARKER_STROKE_COLOR = "#FFFFFF";
DvtMapDataMarker.DEFAULT_MARKER_STROKE_WIDTH = 0.5;
DvtMapDataMarker.DEFAULT_MARKER_ALPHA = 0.7;
DvtMapDataMarker.DEFAULT_MARKER_SIZE = 8.0;
DvtMapDataMarker.DEFAULT_MARKER_SHAPE = 'c';
DvtMapDataMarker.DEFAULT_MARKER_SCALE = 1.0;

DvtObj.createSubclass(DvtMapDataMarker, DvtMapDataObject, "DvtMapDataMarker");

DvtMapDataMarker.prototype.Init = function (context, dataLayer, rowKey, clientId, regionId) {
  DvtMapDataMarker.superclass.Init.call(this, context, dataLayer, rowKey, clientId, regionId);
  this.InitCanvasZoom = 1.0;
}

/**
 * Implemented for DvtSelectable
 * @override
 */
DvtMapDataMarker.prototype.setSelected = function (selected) {
  this.Shape.setSelected(selected);
}

/**
 * Implemented for DvtSelectable
 * @override
 */
DvtMapDataMarker.prototype.showHoverEffect = function () {
  this.Shape.showHoverEffect();
}

/**
 * Implemented for DvtSelectable
 * @override
 */
DvtMapDataMarker.prototype.hideHoverEffect = function () {
  this.Shape.hideHoverEffect();
}

/**
 * Rescale and translate
 */
DvtMapDataMarker.prototype.HandleZoomEvent = function (pzcMatrix) {
  DvtMapDataMarker.superclass.HandleZoomEvent.call(this, pzcMatrix);
  this.reCenter(pzcMatrix);
}

DvtMapDataMarker.prototype.HandlePanEvent = function (pzcMatrix) {
  DvtMapDataMarker.superclass.HandlePanEvent.call(this, pzcMatrix);
  this.reCenter(pzcMatrix);
}

DvtMapDataMarker.prototype.positionText = function () {
  // Calculate the current (transformed) center point
  if (this.Label) {
    this.Shape.removeChild(this.Label);
    var markerDim = this.Shape.getDimensions();
    this.Shape.addChild(this.Label);
    var labelDim = this.Label.getDimensions();
    var y;
    var x = markerDim.x + markerDim.w/2 - labelDim.w/2;
    var markerType = this.Shape.getType();
    
    // this should be default label alignment
    this.Label.alignTop(); 
    
    if (this.LabelPos == 'top') {
      y = markerDim.y - labelDim.h;
    } else if (this.LabelPos == 'bottom') {
      y = markerDim.y + markerDim.h;
    } else if (markerType == DvtMarker.TRIANGLE_UP) {
      // we need to move center of the label to the center of gravity, it looks much better
      y = markerDim.y + 2 * markerDim.h/3;
      // in this special case we need special alignment since standard baseline has to be higher than 
      // in other cases to be preciesly in the center of gravity
      this.Label.alignCenter();
    } else if (markerType == DvtMarker.TRIANGLE_DOWN) {
      // we need to move center of the label to the center of gravity, it looks much better
      y = markerDim.y + markerDim.h/3 - labelDim.h/2;
    } else {
      y = markerDim.y + markerDim.h/2 - labelDim.h/2;
    }
    
    this.Label.setX(x);
    this.Label.setY(y);
  }
}
var DvtMapDataImage = function (context, dataLayer, rowKey, clientId, regionId) {
  this.Init(context, dataLayer, rowKey, clientId, regionId);
}

DvtObj.createSubclass(DvtMapDataImage, DvtMapDataObject, "DvtMapDataImage");

DvtMapDataImage.prototype.Init = function (context, dataLayer, rowKey, clientId, regionId) {
  DvtMapDataImage.superclass.Init.call(this, context, dataLayer, rowKey, clientId, regionId);
}

/**
 * @override
 */
DvtMapDataImage.prototype.HandleZoomEvent = function (pzcMatrix) {
  DvtMapDataImage.superclass.HandleZoomEvent.call(this, pzcMatrix);
  this._pzcMatrix = pzcMatrix;
  this.reCenter(pzcMatrix);
}

/**
 * @override
 */
DvtMapDataImage.prototype.HandlePanEvent = function (pzcMatrix) {
  DvtMapDataImage.superclass.HandlePanEvent.call(this, pzcMatrix);
  this._pzcMatrix = pzcMatrix;
  this.reCenter(pzcMatrix);
}

/**
 * For DvtImage loading only
 */
DvtMapDataImage.prototype.onImageLoaded = function (image) {
  if (image && image.width && image.height) {
    if (!this.Shape.getWidth())
      this.Shape.setWidth(image.width);
    if (!this.Shape.getHeight())
      this.Shape.setHeight(image.height);
    this.Shape.setX(this.Center.x-image.width/2);
    this.Shape.setY(this.Center.y-image.height/2);
    this.reCenter(this._pzcMatrix);
  }
}
/**
 * Base map layer metadata
 * @extends DvtObj
 * @class base map layer metadata
 * @constructor
 */
var DvtMapArea = function (context, dvtShape, areaName, tooltip) {
  this.Init(context, dvtShape, areaName, tooltip);
}

DvtObj.createSubclass(DvtMapArea, DvtContainer, "DvtMapArea");

DvtMapArea._DEFAULT_FILL_COLOR = '#B8CDEC';
DvtMapArea._DEFAULT_STROKE_COLOR = '#FFFFFF';
DvtMapArea._DEFAULT_STROKE_ALPHA = 1;
DvtMapArea._DEFAULT_STROKE_WIDTH = 0.5;

DvtMapArea.prototype.Init = function (context, dvtShape, areaName, tooltip) {
  DvtMapArea.superclass.Init.call(this, context);
  this._bSelectable = false;
  this._isSelected = false;
  this._areaName = areaName;
  this._tooltip = tooltip;
  this._shape = dvtShape;
  this.addChild(this._shape);
  
  if (dvtShape instanceof DvtShape) {
    var stroke = dvtShape.getStroke();
    if (stroke)
      this._strokeWidth = stroke.getWidth();
  }
  
  // WAI-ARIA
  if (this._shape) {
    this._shape.setAriaRole('img');
    this._shape.setAriaProperty('label', tooltip);
  }
}

DvtMapArea.prototype.getAreaName = function () {
  return this._areaName;
}

/**
 * Implemented for DvtTooltipSource
 * @override
 */
DvtMapArea.prototype.getTooltip = function () {
  return this._tooltip;
}

/**
 * Implemented for DvtTooltipSource
 */
DvtMapArea.prototype.setTooltip = function (tooltip) {
  this._tooltip = tooltip;
  
  // WAI-ARIA
  if (this._shape)
    this._shape.setAriaProperty('label', tooltip);
}

/**
 * Implemented for DvtSelectable
 * @override
 */
DvtMapArea.prototype.isSelectable = function () {
  return this._bSelectable;
}

/**
 * Implemented for DvtSelectable
 */
DvtMapArea.prototype.setSelectable = function (bSelectable) {
  this._bSelectable = bSelectable;
  if (this._bSelectable)
    this.setCursor(DvtSelectionEffectUtils.getSelectingCursor());
  else
    this.setCursor(null);
}

/**
 * Implemented for DvtSelectable
 * @override
 */
DvtMapArea.prototype.isSelected = function () {
  return this._isSelected;
}

DvtMapArea.prototype.setSelected = function (selected) {
  this._isSelected = selected;
}

DvtMapArea.prototype.getOutline = function () {
  return DvtShapeUtils.getShapeOutline(this._shape);
}

DvtMapArea.prototype.getStroke = function () {
  if (this._shape instanceof DvtShape)
    return this._shape.getStroke();
  return null;
}

DvtMapArea.prototype.getUnzoomedStrokeWidth = function () {
  return this._strokeWidth;
}

DvtMapArea.prototype.setStroke = function (stroke) {
  if (this._shape instanceof DvtShape)
    this._shape.setStroke(stroke);
}

DvtMapArea.prototype.setFill = function (fill) {
  if (this._shape instanceof DvtShape) {
    this._shape.setFill(fill);
  }
}

DvtMapArea.prototype.getFill = function () {
  if (this._shape instanceof DvtShape) {
    return this._shape.getFill();
  }
  return null;
}

DvtMapArea.prototype.setSrc = function (src) {
  if (this._shape instanceof DvtImage) {
    this._shape.setSrc(src);
  }
}

DvtMapArea.prototype.savePatternFill = function (fill) {
  this._ptFill = fill;
}

DvtMapArea.prototype.getSavedPatternFill = function () {
  return this._ptFill;
}

/**
 * @override
 */
DvtMapArea.prototype.getDropSiteFeedback = function() {
  return new DvtPath(this.getContext(), this.getCmds());
}

/**
 * @override
 */
DvtMapArea.prototype.contains = function(x, y) {
  var dims = this.getDimensions();
  return x >= dims.x && x <= dims.x + dims.w && 
         y >= dims.y && y <= dims.y + dims.h;
}

DvtMapArea.prototype.HandleZoomEvent = function(pzcMatrix) {
  var zoom = pzcMatrix.getA();
  //ToDo handle stroke for custom basemap shape
  if (this._strokeWidth) {
    var newStroke = this.getStroke();
    if (newStroke) {
      newStroke = newStroke.clone();
      newStroke.setWidth(this._strokeWidth/zoom);
      this.setStroke(newStroke);
    }
  }
}
var DvtMapLayer = function (tmap, baseMapName, layerName, clientId, eventHandler) {
  this.Init(tmap, baseMapName, layerName, clientId, eventHandler);
}

DvtObj.createSubclass(DvtMapLayer, DvtObj, "DvtMapLayer");

/**
 * @param {string} layerId The client ID of the layer
 */
DvtMapLayer.prototype.Init = function (tmap, baseMapName, layerName, clientId, eventHandler) {
  this._tmap = tmap;
  this._baseMapName = baseMapName;
  this._layerName = layerName;
  this._clientId = clientId;
  this.EventHandler = eventHandler;
  this.DataLayers = {};
  this.PzcMatrix = new DvtMatrix();
}

DvtMapLayer.prototype.addDataLayer = function (layer) {
  this.DataLayers[layer.getClientId()] = layer;
}

DvtMapLayer.prototype.updateDataLayer = function (dataLayer) {
  //Get old data layer
  this._oldDataLayer = this.getDataLayer(dataLayer.getClientId());
  this.addDataLayer(dataLayer);
  dataLayer.render(this.PzcMatrix);
  dataLayer.HandleZoomEvent(this.PzcMatrix);
  
  if (this._oldDataLayer) {
    if (this._animation) {
      this._animationStopped = true;
      this._animation.stop();
    }
  
    var anim = dataLayer.getAnimation();
    var animDur = dataLayer.getAnimationDuration();
    // animation on base map change
    if (DvtBlackBoxAnimationHandler.isSupported(anim)) {
      
      var bounds1 = new DvtRectangle(0,0,this._tmap.GetWidth(),this._tmap.GetHeight());
      var bounds2 = new DvtRectangle(0,0,this._tmap.GetWidth()/this.PzcMatrix.getA(),this._tmap.GetHeight()/this.PzcMatrix.getA());
      var anim1 = DvtBlackBoxAnimationHandler.getCombinedAnimation(this._tmap.getContext(), anim, 
                                                                        this._oldDataLayer.getNonScaledContainers(), 
                                                                        dataLayer.getNonScaledContainers(), bounds1, animDur);
      var anim2 = DvtBlackBoxAnimationHandler.getCombinedAnimation(this._tmap.getContext(), anim, 
                                                                        this._oldDataLayer.getScaledContainers(), 
                                                                        dataLayer.getScaledContainers(), bounds2, animDur);
      this._animation = new DvtParallelPlayable(this._tmap.getContext(), [anim1, anim2]);                                                                        
    } else {
      var oldContainers = this._oldDataLayer.getContainers();
      for (var i=0; i<oldContainers.length; i++) {
        var parent = oldContainers[i].getParent(); 
        parent.removeChild(oldContainers[i]);
      }
    }
  
    // If an animation was created, play it
    if (this._animation) {
      // Disable event listeners temporarily
      this.EventHandler.removeListeners(this._callbackObj);
  
      // Start the animation
      this._animation.setOnEnd(this.OnAnimationEnd, this);
      this._animation.play();
    }
  }
}

DvtMapLayer.prototype.getDataLayers = function () {
  return this.DataLayers;
}

DvtMapLayer.prototype.getDataLayer = function (clientId) {
  return this.DataLayers ? this.DataLayers[clientId] : null;
}

DvtMapLayer.prototype.getClientId = function () {
  return this._clientId;
}

DvtMapLayer.prototype.getLayerName = function () {
  return this._layerName;
}

DvtMapLayer.prototype.render = function (pzcMatrix) {
  this.PzcMatrix = pzcMatrix;
  for (var id in this.DataLayers) {
    this.DataLayers[id].render(pzcMatrix);
    this.DataLayers[id].HandleZoomEvent(pzcMatrix);
  }
}

DvtMapLayer.prototype.reset = function(fadeOutContainer, doNotResetAreas) {
  for (var id in this.DataLayers)
    this.DataLayers[id].reset(fadeOutContainer, doNotResetAreas);
}

DvtMapLayer.prototype.HandleZoomEvent = function (pzcMatrix) {
  this._pzcMatrix = pzcMatrix;
  for (var id in this.DataLayers)
    this.DataLayers[id].HandleZoomEvent(pzcMatrix);
}

DvtMapLayer.prototype.HandlePanEvent = function (pzcMatrix) {
  this.PzcMatrix = pzcMatrix;
  for (var id in this.DataLayers)
    this.DataLayers[id].HandlePanEvent(pzcMatrix);
}

DvtMapLayer.prototype.OnAnimationEnd = function () {
  // Clean up the old container used by black box updates
  if (this._oldDataLayer) {
    var oldContainers = this._oldDataLayer.getContainers();
    for (var i=0; i<oldContainers.length; i++) {
      var parent = oldContainers[i].getParent();
      parent.removeChild(oldContainers[i]);
    }
  }
  // Reset the animation stopped flag
  this._animationStopped = false;
  // Remove the animation reference
  this._animation = null;
  // Restore event listeners
  this.EventHandler.addListeners(this._callbackObj);
}

var DvtMapAreaLayer = function (tmap, baseMapName, layerName, clientId, labelDisplay, labelType, eventHandler) {
  this.Init(tmap, baseMapName, layerName, clientId, labelDisplay, labelType, eventHandler);
}

DvtObj.createSubclass(DvtMapAreaLayer, DvtMapLayer, "DvtMapAreaLayer");

DvtMapAreaLayer._SHORT_NAME = 0;
DvtMapAreaLayer._LONG_NAME = 1;

DvtMapAreaLayer.prototype.Init = function (tmap, baseMapName, layerName, clientId, labelDisplay, labelType, eventHandler) {
  DvtMapAreaLayer.superclass.Init.call(this, tmap, baseMapName, layerName, clientId, eventHandler);
  this._displayLabels = labelDisplay;  
  this._labelType = labelType;
  this._areaLabels = new Object();
  this.Areas = new Object();
  this.AreaShapes = [];
  this.AreaNames = null;
  this._labelInfo = null;
  this._disclosed = [];
  this._doNotRenderList = [];
  this._doNotRenderLabelList = [];
  
  this.AreaContainer = new DvtContainer(this._tmap.getContext());
  this.LabelContainer = new DvtContainer(this._tmap.getContext())
  this.LeaderLineContainer = new DvtContainer(this._tmap.getContext());;
  this._tmap.getAreaLayerContainer().addChild(this.AreaContainer);
  this._tmap.getLabelContainer().addChild(this.LabelContainer);
  this._tmap.getHoverContainer().addChild(this.LeaderLineContainer);
  
  this._dropSiteFill = new DvtSolidFill("#6DA7FF");
  this._dropSiteStrokeColor = "0098FF";
  this._dropTarget = new DvtThematicMapDropTarget(this); 
}

DvtMapAreaLayer.prototype.setAnimation = function (animType) {
  this._animType = animType;
}

DvtMapAreaLayer.prototype.getAnimation = function () {
  return this._animType;
}

DvtMapAreaLayer.prototype.setAnimationDuration = function (animDur) {
  this._animDur = animDur;
}

DvtMapAreaLayer.prototype.getAnimationDuration = function () {
  return this._animDur;
}

DvtMapAreaLayer.prototype.getDropTarget = function () {
  return this._dropTarget;
}

DvtMapAreaLayer.prototype.getLabelType = function () {
  return this._labelType;
}

DvtMapAreaLayer.prototype.setAreaShapes = function (shapes) {
  this.AreaShapes = shapes;
}

DvtMapAreaLayer.prototype.setAreaNames = function (values) {
  this.AreaNames = values;
}

DvtMapAreaLayer.prototype.getShortAreaName = function (area) {
  return this.AreaNames[area][DvtMapAreaLayer._SHORT_NAME]
}

DvtMapAreaLayer.prototype.getLongAreaName = function (area) {
  return this.AreaNames[area][DvtMapAreaLayer._LONG_NAME]
}

DvtMapAreaLayer.prototype.setAreaLabelInfo = function (values) {
  this._labelInfo = values;
}

DvtMapAreaLayer.prototype.getLabelInfoForArea = function (area) {
  if (!this._labelInfo)
    return null;
  return this._labelInfo[area];
}

DvtMapAreaLayer.prototype.setAreaChildren = function (children) {
  this._children = children;
}

DvtMapAreaLayer.prototype.getChildrenForArea = function (area) {
  if (this._children[area])
    return this._children[area].split(',');
  else
    return [];
}

DvtMapAreaLayer.prototype.getArea = function (id) {
  return this.Areas[id];
}

DvtMapAreaLayer.prototype.getAreaShape = function (areaId) {
  if (this.AreaShapes[areaId]) {
  var areaShape = DvtShapeUtils.getShapeOutline(this.AreaShapes[areaId]);
  var stroke;
  // If DvtMapArea hasn't been created, use stroke from DvtShape.  We need the stroke with the original width.
  // For lazy loaded data layers we don't want to get the zoomed stroke width.
  if (this.Areas[areaId]) {
    stroke = this.Areas[areaId].getStroke().clone();
    var strokeWidth = this.Areas[areaId].getUnzoomedStrokeWidth();
    stroke.setWidth(strokeWidth);
  } else {
    stroke = this.AreaShapes[areaId].getStroke().clone();
  }
  areaShape.setStroke(stroke);
//  if (areaShape && this instanceof DvtMapCustomAreaLayer) {
//    var pathToStage = this.AreaShapes[areaId].getPathToStage();
//    var mat = null;
//    for (var j=0; j<pathToStage.length; j++) {
//      if (pathToStage[j] instanceof DvtMapDataLayer)
//        break;
//      if (!mat)
//        mat = pathToStage[j].getMatrix();
//      else {
//        mat = mat.clone();
//        mat.concat(pathToStage[j].getMatrix());
//      }
//    }
//    if (mat)
//      areaShape.setMatrix(mat);
//  }
  return areaShape;
  } else {
    return null;
}
}

DvtMapAreaLayer.prototype.displayLabels = function () {
  return this._displayLabels;
}

DvtMapAreaLayer.prototype.setLayerCSSStyle = function (style) {
  this._layerCSSStyle = style;
}

DvtMapAreaLayer.prototype.getLayerCSSStyle = function () {
  return this._layerCSSStyle;
}

DvtMapAreaLayer.prototype.doNotRenderArea = function (area) {
  if (DvtArrayUtils.indexOf(this._doNotRenderList, area) == -1)
    this._doNotRenderList.push(area);
}

DvtMapAreaLayer.prototype.doNotRenderLabel = function (area) {
  if (DvtArrayUtils.indexOf(this._doNotRenderLabelList, area) == -1)
    this._doNotRenderLabelList.push(area);
}

DvtMapAreaLayer.prototype.isDoNotRenderLabel = function (area) {
  return DvtArrayUtils.indexOf(this._doNotRenderLabelList, area) > -1;
}

DvtMapAreaLayer.prototype.setIsolatedArea = function (isolatedArea) {
  for (var area in this.AreaShapes) {
    if (area != isolatedArea)
      this._doNotRenderList.push(area);
  }
}


DvtMapAreaLayer.prototype._createAreaAndLabel = function(area, fadeInObjs) {
  if (this.AreaShapes[area]) {
    if (!this.Areas[area]) {
      var context = this._tmap.getContext();
      var mapArea =  new DvtMapArea(context, this.AreaShapes[area], area);
      this.Areas[area] = mapArea;
      this.EventHandler.associate(this.AreaShapes[area], mapArea);
      var tooltip = (this.AreaNames && this.AreaNames[area]) ? this.AreaNames[area][DvtMapAreaLayer._LONG_NAME] : null;
      mapArea.setTooltip(tooltip);
    }
    this.AreaContainer.addChild(this.Areas[area]);
    
    var label = this._areaLabels[area];
    if (!label) {
      if (this._displayLabels != 'off' && this.AreaNames && DvtArrayUtils.indexOf(this._doNotRenderLabelList, area) == -1) {
        var labelText = (this._labelType == 'short') ? this.AreaNames[area][DvtMapAreaLayer._SHORT_NAME] :
                                                       this.AreaNames[area][DvtMapAreaLayer._LONG_NAME];
        if (labelText) {
          if (this._labelInfo && this._labelInfo[area])
            label = new DvtMapLabel(this._tmap.getContext(), labelText, this._labelInfo[area], this.LeaderLineContainer);
          else {
            var areaDim = mapArea.getDimensions();
            label = new DvtMapLabel(this._tmap.getContext(), labelText, [areaDim.x, areaDim.y, areaDim.w, areaDim.h], this.LeaderLineContainer);
          }
          this._areaLabels[area] = label;
          if (this._layerCSSStyle)
            label.setCSSStyle(this._layerCSSStyle)
        }
      }
    }
    if (label) {
      this.LabelContainer.addChild(label);
      label.update(this.PzcMatrix);
    }
    if (fadeInObjs) {
      fadeInObjs.push(this.Areas[area]);
      if (label) {
        fadeInObjs.push(label);
        fadeInObjs.push(label.getLeaderLine());
      }
    }
  }
}

DvtMapAreaLayer.prototype.render = function (pzcMatrix) {
  DvtMapAreaLayer.superclass.render.call(this, pzcMatrix);
  
  var context = this._tmap.getContext();
  for (var area in this.AreaShapes) {
    if (DvtArrayUtils.indexOf(this._doNotRenderList, area) == -1) {
      
      //Create DvtMapArea and replace the shape in the svg dom
      var parent = this.AreaShapes[area].getParent();
      if (parent)
        var childIdx = parent.getChildIndex(this.AreaShapes[area]);
    
      var mapArea =  new DvtMapArea(context, this.AreaShapes[area], area);
      
      if (parent)
        parent.addChildAt(mapArea, childIdx);
      
      this.Areas[area] = mapArea;
      this.EventHandler.associate(mapArea, mapArea);
      var tooltip = (this.AreaNames && this.AreaNames[area]) ? this.AreaNames[area][DvtMapAreaLayer._LONG_NAME] : null;
      mapArea.setTooltip(tooltip);
      this.AreaContainer.addChild(mapArea);
    
      // Create label for map area
      var label = null;
      if (this._displayLabels != 'off' && this.AreaNames && DvtArrayUtils.indexOf(this._doNotRenderLabelList, area) == -1) {
        var labelText = (this._labelType == 'short') ? this.AreaNames[area][DvtMapAreaLayer._SHORT_NAME] :
                                                       this.AreaNames[area][DvtMapAreaLayer._LONG_NAME];
        if (labelText) {
          if (this._labelInfo && this._labelInfo[area])
            label = new DvtMapLabel(this._tmap.getContext(), labelText, this._labelInfo[area], this.LeaderLineContainer);
          else {
            var areaDim = mapArea.getDimensions();
            label = new DvtMapLabel(this._tmap.getContext(), labelText, [areaDim.x, areaDim.y, areaDim.w, areaDim.h], this.LeaderLineContainer);
          } 
          this._areaLabels[area] = label;
          if (this._layerCSSStyle)
            label.setCSSStyle(this._layerCSSStyle);
          this.LabelContainer.addChild(label);
        }
      }
     
    } //else {
//      if (this instanceof DvtMapCustomAreaLayer) {
//        this.AreaShapes[area].setFill(null);
//        this.AreaShapes[area].setStroke(null);
//      }
//    }
  }
}

DvtMapAreaLayer.prototype.updateDataLayer = function (layer) {
  this._renderAllAreas();
  DvtMapAreaLayer.superclass.updateDataLayer.call(this, layer);
}

DvtMapAreaLayer.prototype._renderAllAreas = function (container) {
  // Create and render areas that were originally not created because the area was already created in the data layer
  for (var i=0; i<this._doNotRenderList.length; i++) {
    var area = this._doNotRenderList[i];
    this._createAreaAndLabel(area);
  }
}

DvtMapAreaLayer.prototype._renderSelectedAreasAndLabels = function(areas, fadeInObjs) {
  for (var i=0; i<areas.length; i++) {
    // Do not render areas that were rendered in the data layer
    if (DvtArrayUtils.indexOf(this._doNotRenderList, areas[i]) == -1)
      this._createAreaAndLabel(areas[i], fadeInObjs);
  }
}

DvtMapAreaLayer.prototype.discloseAreas = function (areas, fadeInObjs) {
  this._renderSelectedAreasAndLabels(areas, fadeInObjs);
  for (var id in this.DataLayers)
    this.DataLayers[id].discloseAreas(areas, fadeInObjs);
  if (this._tmap.getDrillMode() == 'single')
    this._disclosed = areas;
  else
    this._disclosed = this._disclosed.concat(areas);
}

DvtMapAreaLayer.prototype.undiscloseAreas = function(areas, fadeOutObjs) {
  var childAreaLayer = this._tmap.getDrillChildLayer(this._layerName);
  for (var i=0; i<areas.length; i++) {
    var areaName = areas[i];
    if (this.Areas[areaName]) {
      var idx = DvtArrayUtils.getIndex(this._disclosed, areaName);
      if (idx !== -1)
        this._disclosed.splice(idx, 1);
      fadeOutObjs.push(this.Areas[areaName]);
    }
    // undisclose its child areas
    if (childAreaLayer)
      childAreaLayer.undiscloseAreas(this.getChildrenForArea(areaName), fadeOutObjs);
  }
  for (var id in this.DataLayers)
    this.DataLayers[id].undiscloseAreas(areas, fadeOutObjs);
}

DvtMapAreaLayer.prototype.reset = function(fadeOutObjs, doNotResetAreas) {
  DvtMapAreaLayer.superclass.reset.call(this, fadeOutObjs, doNotResetAreas);
  this.undiscloseAreas(this._disclosed, fadeOutObjs);
  this._disclosed = [];
}

/**
 * Returns the node under the specified coordinates.
 * @param {number} x
 * @param {number} y
 * @return {DvtMapDataObject}
 */
DvtMapAreaLayer.prototype.__getObjectUnderPoint = function(x, y) {
  for (var id in this.Areas) {
    if (this.Areas[id].contains(x, y))
      return this.Areas[id];
  }
  // No object found, return null
  return null;
}

/**
 * Displays drop site feedback for the specified node.
 * @param {DvtMapArea} obj The object for which to show drop feedback, or null to remove drop feedback.
 * @return {DvtDisplayable} The drop site feedback, if any.
 */
DvtMapAreaLayer.prototype.__showDropSiteFeedback = function(obj) {
  // Remove any existing drop site feedback
  if(this._dropSiteFeedback) {
    this.AreaContainer.removeChild(this._dropSiteFeedback);
    this._dropSiteFeedback = null;
  }

  // Create feedback for the node
  if(obj) {
    this._dropSiteFeedback = obj.getDropSiteFeedback();
    if(this._dropSiteFeedback) {
      this._dropSiteFeedback.setFill(this._dropSiteFill);
      this._dropSiteFeedback.setStroke(new DvtSolidStroke(this._dropSiteStrokeColor, 1, 1/this.PzcMatrix.getA()));
      this.AreaContainer.addChild(this._dropSiteFeedback);
    }
  }
  
  return this._dropSiteFeedback;
}

DvtMapAreaLayer.prototype.HandleZoomEvent = function (pzcMatrix) {
  DvtMapAreaLayer.superclass.HandleZoomEvent.call(this, pzcMatrix);
  for (var areaName in this.Areas)
    this.Areas[areaName].HandleZoomEvent(pzcMatrix);
}

DvtMapAreaLayer.prototype.OnAnimationEnd = function () {
  DvtMapAreaLayer.superclass.OnAnimationEnd.call(this);
  // remove areas that were rendered in the data layer or created for the animation
  for (var i=0; i<this._doNotRenderList.length; i++) {
    this.AreaContainer.removeChild(this.Areas[this._doNotRenderList[i]]);
    var label = this._areaLabels[this._doNotRenderList[i]];
    if (label) {
      this.LabelContainer.removeChild(label);
      this.LeaderLineContainer.removeChild(label.getLeaderLine());
    }
  }
}

var DvtMapCustomAreaLayer = function (tmap, baseMapName, layerName, clientId, labelDisplay, labelType, eventHandler) {
  this.Init(tmap, baseMapName, layerName, clientId, labelDisplay, labelType, eventHandler);
}

DvtObj.createSubclass(DvtMapCustomAreaLayer, DvtMapAreaLayer, "DvtMapCustomAreaLayer");

DvtMapCustomAreaLayer.prototype.Init = function (tmap, baseMapName, layerName, clientId, labelDisplay, labelType, eventHandler) {
  DvtMapCustomAreaLayer.superclass.Init.call(this, tmap, baseMapName, layerName, clientId, labelDisplay, labelType, eventHandler);
}

DvtMapCustomAreaLayer.prototype._selectImageBasedOnResolution = function() {
  var widthRes = this._tmap.GetWidth();
  var heightRes = this._tmap.GetHeight();
  var images = this._areaLayerImages;
  // Iterate and use the first image with enough detail
  for(i=0; i<images.length; i++) {
    var image = images[i];
    var source = image['source'];
    var width = image['width'];
    var height = image['height'];
    var isSvg = (source && source.search(".svg") > -1);
    
    // Use the image if it's SVG, a PNG whose size > resolution, or the last image provided.
    if(isSvg || (width >= widthRes && height >= heightRes) || i == images.length-1) {
      //Since points are given in the coordinate space of the original image size, we always set the image we choose
      //to that size.  The <image> tag will scale image as necessary.
      return source; 
    }
  }
}

DvtMapCustomAreaLayer.prototype.setAreaLayerImage = function(images) {
  var shape = null;
  var isBidi = DvtStyleUtils.isLocaleR2L();
  // Use the images from the list provided
  if(images && images.length > 0) {
    var refWidth = images[0]['width'];
    var refHeight = images[0]['height'];
  
    // Filter the list to images matching the locale type (bidi or not)
    var locImages = [];
    for(var i=0; i<images.length; i++) {
      if(isBidi && images[i]['dir'] == 'rtl') 
        locImages.push(images[i]);
      else if(!isBidi && images[i]['dir'] == 'ltr')
        locImages.push(images[i]);
    }
    this._areaLayerImages = locImages.length > 0 ? locImages : images; // Use all images if none match the bidi flag
    this._imageSrc = this._selectImageBasedOnResolution();   
    shape = new DvtImage(this._tmap.getContext(), this._imageSrc, 0, 0, refWidth, refHeight); 

  }
  if (shape)
    this.setAreaShapes({'image': shape});
}

DvtMapCustomAreaLayer.prototype.HandleZoomEvent = function (pzcMatrix) {
  DvtMapCustomAreaLayer.superclass.HandleZoomEvent.call(this, pzcMatrix);
  if (this.Areas['image']) {
    var newImageSrc = this._selectImageBasedOnResolution();
    if (newImageSrc != this._imageSrc) {
      this._imageSrc = newImageSrc;
      this.Areas[areaName].setSrc(this._imageSrc);
    }
  }
}

var DvtMapDataLayer = function (tmap, parentLayer, clientId, eventHandler) {
  this.Init(tmap, parentLayer, clientId, eventHandler);
}

DvtObj.createSubclass(DvtMapDataLayer, DvtObj, "DvtMapDataLayer");

/**
 * @param {string} layerId The client ID of the layer
 */
DvtMapDataLayer.prototype.Init = function (tmap, parentLayer, clientId, eventHandler) {
  this._tmap = tmap;
  this._clientId = clientId;
  
  this._areaObjs = [];
  this._dataObjs = [];
  
  this._eventHandler = eventHandler;
  
  // Drag and drop support
  this._dragSource = new DvtDragSource(tmap.getContext());
  this._eventHandler.setDragSource(this._dragSource);
  
  this._dataAreaLayer = new DvtContainer(this._tmap.getContext());
  this._dataPointLayer = new DvtContainer(this._tmap.getContext());
  this._dataLeaderLineLayer = new DvtContainer(this._tmap.getContext());
  this._dataLabelLayer = new DvtContainer(this._tmap.getContext());
  this._tmap.getDataAreaContainer().addChild(this._dataAreaLayer);
  this._tmap.getDataPointContainer().addChild(this._dataPointLayer);
  this._tmap.getLabelContainer().addChild(this._dataLabelLayer);
  this._tmap.getHoverContainer().addChild(this._dataLeaderLineLayer);
  
  this._parentLayer = parentLayer;
  
  this._disclosed = [];
  this._drilled = [];
}

DvtMapDataLayer.prototype.getDragSource = function () {
  return this._dragSource;
}

DvtMapDataLayer.prototype.getContainers = function () {
  var containers = [this._dataAreaLayer, this._dataPointLayer, this._dataLabelLayer, this._dataLeaderLineLayer];
  if (this._dataAreaSelectionLayer)
    containers.push(this._dataAreaSelectionLayer);
  return containers;
}

DvtMapDataLayer.prototype.getScaledContainers = function () {
  var containers = [this._dataAreaLayer, this._dataLeaderLineLayer];
  if (this._dataAreaSelectionLayer)
    containers.push(this._dataAreaSelectionLayer);
  return containers;
}

DvtMapDataLayer.prototype.getNonScaledContainers = function () {
  return [this._dataPointLayer, this._dataLabelLayer];
}

DvtMapDataLayer.prototype.getLeaderLineContainer = function () {
  return this._dataLeaderLineLayer;
}

DvtMapDataLayer.prototype.getMapLayer = function () {
  return this._parentLayer;
}

DvtMapDataLayer.prototype.getMap = function () {
  return this._tmap;
}

DvtMapDataLayer.prototype.getAllObjects = function () {
  return this._dataObjs.concat(this._areaObjs);
}

DvtMapDataLayer.prototype.getAreaObjects = function () {
  return this._areaObjs;
}

DvtMapDataLayer.prototype.getDataObjects = function () {
  return this._dataObjs;
}

DvtMapDataLayer.prototype.getNavigableAreaObjects = function () {
  var navigables = [];
  for (var i=0; i< this._areaObjs.length; i++) {
    if (!this._areaObjs[i].isDrilled())
      navigables.push(this._areaObjs[i]);
  }
  return navigables;
}

DvtMapDataLayer.prototype.getNavigableDisclosedAreaObjects = function () {
  var navigables = [];
  for (var i=0; i<this._areaObjs.length; i++) {
    for (var j=0; j<this._disclosed.length; j++) {
      if (this._areaObjs[i].getAreaId() == this._disclosed[j]) {
        if (!this._areaObjs[i].isDrilled())
          navigables.push(this._areaObjs[i]);
      }
    }
  }
  return navigables;
}
      
DvtMapDataLayer.prototype.addDataObject = function (obj) {
  this._dataObjs.push(obj);
  this._eventHandler.associate(obj.getDisplayable(), obj);
}

DvtMapDataLayer.prototype.addAreaObject = function (obj) {
  this._areaObjs.push(obj);
  this._eventHandler.associate(obj.getDisplayable(), obj);
  obj.setAreaLayer(this._dataAreaLayer);
  obj.setSelectionLayer(this._dataAreaSelectionLayer);
  obj.setHoverLayer(this._tmap.getHoverContainer());
}

DvtMapDataLayer.prototype.getClientId = function () {
  return this._clientId;
}

DvtMapDataLayer.prototype.setAnimation = function (animType) {
  this._animType = animType;
}

DvtMapDataLayer.prototype.getAnimation = function () {
  return this._animType;
}

DvtMapDataLayer.prototype.setAnimationDuration = function (animDur) {
  this._animDur = animDur;
}

DvtMapDataLayer.prototype.getAnimationDuration = function () {
  return this._animDur;
}

DvtMapDataLayer.prototype.setSelectionMode = function (mode) {
  this._selectionMode = mode;
  if (this._selectionMode) {
    this._selectionHandler = new DvtSelectionHandler(this._selectionMode);
    this._eventHandler.setSelectionHandler(this._clientId, this._selectionHandler);
    this._dataAreaSelectionLayer = new DvtContainer(this._tmap.getContext());
    this._tmap.getDataAreaSelectionContainer().addChild(this._dataAreaSelectionLayer);
  }
}

DvtMapDataLayer.prototype.getSelectionMode = function () {
  return this._selectionMode;
}

DvtMapDataLayer.prototype.setIsolatedAreaRowKey = function (isolated) {
  this._isolatedAreaRowKey = isolated;
}

DvtMapDataLayer.prototype.getAreaSelectionLayer = function() { 
  return this._dataAreaSelectionLayer;
}

DvtMapDataLayer.prototype._renderAreaAndLabel = function(areaIndex) {
  var displayable = this._areaObjs[areaIndex].getDisplayable();
  this._dataAreaLayer.addChild(displayable);
  var label = this._areaObjs[areaIndex].getLabel();
  if (label && !this._parentLayer.isDoNotRenderLabel(this._areaObjs[areaIndex].getAreaId())) {
    this._dataLabelLayer.addChild(label);
    if (!label.hasBounds()) {
      var areaDim = displayable.getDimensions();
      label.addBounds(areaDim);
    }
    label.update(this._pzcMatrix);
  }
}

DvtMapDataLayer.prototype.render = function (pzcMatrix) {
  this._pzcMatrix = pzcMatrix;
  //isolated on an area
  if (this._isolatedAreaRowKey) {
    // If isolatedAreaRowKey is set there should only be one areaObj in the array.
    if (this._areaObjs[0]) {
      this._renderAreaAndLabel(0);
    }
  } else {
    // Add data objects to region layer first
    for (var i=0; i<this._areaObjs.length; i++) {
      this._renderAreaAndLabel(i);
    }
    for (var i=0; i<this._dataObjs.length; i++) {
      var displayable = this._dataObjs[i].getDisplayable();
      this._dataPointLayer.addChild(displayable);
      var label = this._dataObjs[i].getLabel();
      if (label) {
        displayable.addChild(label);
        this._dataObjs[i].positionText();
      }
    }
  }
  
}

DvtMapDataLayer.prototype.discloseAreas = function(areas, fadeInObjs) {
  var drilledAreas = [];
  for (var j=0; j<areas.length; j++) {
    for (var i=0; i<this._areaObjs.length; i++) {
      if (this._areaObjs[i].getAreaId() == areas[j]) {
        drilledAreas.push(this._areaObjs[i].getAreaId());
        var displayable = this._areaObjs[i].getDisplayable();
        this._dataAreaLayer.addChild(displayable);
        fadeInObjs.push(displayable);
        var label = this._areaObjs[i].getLabel();
        if (label && !this._parentLayer.isDoNotRenderLabel(this._areaObjs[i].getAreaId())) {
          this._dataLabelLayer.addChild(label);
          label.update(this._pzcMatrix);
          fadeInObjs.push(label);
          fadeInObjs.push(label.getLeaderLine());
        }
        break;
      }
    }
  }
  //If data layer contains markers or images, just add to data layer regardless of what area it is in if no id
  for (var i=0; i<this._dataObjs.length; i++) {
    for (var j=0; j<areas.length; j++) {
      var regionId = this._dataObjs[i].getAreaId();
      var displayable = this._dataObjs[i].getDisplayable();
      if (regionId != null) {
        if (regionId == areas[j]) {
          this._dataPointLayer.addChild(displayable);
          fadeInObjs.push(displayable);
        }
      } else {
        this._dataPointLayer.addChild(displayable);
        fadeInObjs.push(displayable);
      }
    }
  }
  
  if (this._tmap.getDrillMode() == 'single')
    this._disclosed = drilledAreas;
  else
    this._disclosed = this._disclosed.concat(drilledAreas);
}

DvtMapDataLayer.prototype.undiscloseAreas = function(areas, fadeOutObjs) { 
  for (var j=0; j<areas.length; j++) {
    for (var i=0; i<this._areaObjs.length; i++) {
      if (this._areaObjs[i].getAreaId() == areas[j]) {
        if (this._areaObjs[i].isDrilled())
          this._areaObjs[i].setDrilled(false);
        if (this._areaObjs[i].isSelected())
          this._selectionHandler.removeFromSelection(this._areaObjs[i]);
        var idx = DvtArrayUtils.indexOf(this._disclosed, areas[j]);
        this._disclosed.splice(idx, 1);
        fadeOutObjs.push(this._areaObjs[i].getDisplayable());
        
        var label = this._areaObjs[i].getLabel();
        if (label && !this._parentLayer.isDoNotRenderLabel(this._areaObjs[i].getAreaId())) {
          fadeOutObjs.push(label);
          fadeOutObjs.push(label.getLeaderLine());
        }
        
        break;
      }
    }
  }
}

DvtMapDataLayer.prototype.drill = function(areaName, fadeOutObjs) { 
  for (var i=0; i<this._areaObjs.length; i++) {
    if (this._areaObjs[i].getAreaId() == areaName) {
      this._areaObjs[i].setDrilled(true);
      this._drilled.push(areaName);
      fadeOutObjs.push(this._areaObjs[i].getDisplayable());
      var label = this._areaObjs[i].getLabel();
      if (label) {
        fadeOutObjs.push(label);
        var leaderLine = label.getLeaderLine();
        if (leaderLine)
          fadeOutObjs.push(leaderLine);
      }
      break;
    }
  }
  for (var i=0; i<this._dataObjs.length; i++) {
    if (this._dataObjs[i].getAreaId() == areaName) {
      fadeOutObjs.push(this._dataObjs[i].getDisplayable());
      break;
    }
  }
}

DvtMapDataLayer.prototype.undrill = function(areaName, fadeInObjs) { 
  for (var i=0; i<this._areaObjs.length; i++) {
    if (this._areaObjs[i].getAreaId() == areaName) {
      var idx = DvtArrayUtils.indexOf(this._drilled, areaName);
      this._drilled.splice(idx, 1);
      this._areaObjs[i].setDrilled(false);
      var displayable = this._areaObjs[i].getDisplayable();
      this._dataAreaLayer.addChild(displayable);
      fadeInObjs.push(displayable);
      var label = this._areaObjs[i].getLabel();
      if (label) {
        this._dataLabelLayer.addChild(label);
        label.update(this._pzcMatrix);
        fadeInObjs.push(label);
        fadeInObjs.push(label.getLeaderLine());
      }
      break;
    }
  }
  for (var i=0; i<this._dataObjs.length; i++) {
    if (this._dataObjs[i].getAreaId() == areaName) {
      var displayable = this._dataObjs[i].getDisplayable();
      this._dataPointLayer.addChild(displayable);
      fadeInObjs.push(displayable);
      break;
    }
  }
}

DvtMapDataLayer.prototype.reset = function(fadeOutObjs, doNotResetAreas) {
  // Clear selected
  if (this._selectionHandler) {
    var selectedObjs = this._selectionHandler.getSelection();
    for (var i=0; i<selectedObjs.length; i++) {
      if (!doNotResetAreas || (doNotResetAreas && DvtArrayUtils.indexOf(doNotResetAreas, selectedObjs[i].getAreaId()) == -1))
        this._selectionHandler.removeFromSelection(selectedObjs[i]);
    }
  }
   
  //Clear drilled
  for (var j=0; j<this._drilled.length; j++) {
    for (var i=0; i<this._areaObjs.length; i++) {
      if (this._areaObjs[i].getAreaId() == this._drilled[j]) {
        this._areaObjs[i].setDrilled(false);
        var displayable = this._areaObjs[i].getDisplayable();
        this._dataAreaLayer.addChild(displayable);
        fadeOutObjs.push(displayable);
        var label = this._areaObjs[i].getLabel();
        if (label) {
          this._dataLabelLayer.addChild(label);
          label.update(this._pzcMatrix);
          fadeOutObjs.push(label);
          fadeOutObjs.push(label.getLeaderLine());
        }
        break;
      }
    }
    for (var i=0; i<this._dataObjs.length; i++) {
      if (this._dataObjs[i].getAreaId() == this._drilled[j]) {
        var displayable = this._dataObjs[i].getDisplayable();
        this._dataPointLayer.addChild(displayable);
        fadeOutObjs.push(displayable);
        break;
      }
    }
  }
      
  this._drilled = [];
}

DvtMapDataLayer.prototype.HandleZoomEvent = function (pzcMatrix) {
  this._pzcMatrix = pzcMatrix;
  zoom = pzcMatrix.getA();
  // If this is initial zoom to fit need to set transform on pattern gradients
  if (this._tmap.getPanZoomCanvas().getMinZoom() == null && zoom != 1) {
    for(var j=0; j<this._areaObjs.length; j++) {
      var displayable = this._areaObjs[j].getDisplayable();
      var fill = displayable.getSavedPatternFill();
      if (fill) {
        var scaledFill = new DvtPatternFill();
        fill.mergeProps(scaledFill);
        scaledFill.setMatrix(new DvtMatrix(null, 1/zoom, null, null, 1/zoom));
        displayable.setFill(scaledFill);
      }
    }
  }
  var dataObjs = this.getAllObjects();
  for (var i=0; i<dataObjs.length; i++)
    dataObjs[i].HandleZoomEvent(pzcMatrix);
  if (this._dataAreaSelectionLayer) {
    this._dataAreaSelectionLayer.setMatrix(pzcMatrix.clone());
  }   
}

DvtMapDataLayer.prototype.HandlePanEvent = function (pzcMatrix) {
  this._pzcMatrix = pzcMatrix;
  var dataObjs = this.getAllObjects();
  for (var i=0; i<dataObjs.length; i++)
    dataObjs[i].HandlePanEvent(pzcMatrix);
  if (this._dataAreaSelectionLayer) {
    this._dataAreaSelectionLayer.setMatrix(pzcMatrix.clone());
  }
  
  // Add initially selected data objects to selection layer after zooming and panning
  if (this._initSelections)
    this._processInitialSelections();
}


DvtMapDataLayer.prototype.setInitialSelections = function(selections) {
  this._initSelections = selections;
}

/**
 * Update the selection handler with the initial selections.
 */
DvtMapDataLayer.prototype._processInitialSelections = function() {
  if(this._selectionHandler) {
    this._selectionHandler.processInitialSelections(this._initSelections, this.getAllObjects());
    this._initSelections = null;
  }
}

/**
 * Returns the row keys for the current drag.
 * @param {DvtMapDataObject} obj The object where the drag was initiated.
 * @return {array} The row keys for the current drag.
 */
DvtMapDataLayer.prototype.__getDragTransferable = function(obj) {
  if (this._selectionHandler) {
    // Select the node if not already selected
    if(!obj.isSelected()) {
      this._selectionHandler.processClick(obj, false);
      this._eventHandler.fireSelectionEvent(obj);
    }
    
    // Gather the rowKeys for the selected objects
    var rowKeys = [];
    var selection = this._selectionHandler.getSelection();
    for(var i=0; i<selection.length; i++) {
      rowKeys.push(selection[i].getId());
    }
    
    return rowKeys;
  } else {
    return null;
  }
}

/**
 * Returns the displayables to use for drag feedback for the current drag.
 * @return {array} The displayables for the current drag.
 */
DvtMapDataLayer.prototype.__getDragFeedback = function() {
  // This is called after __getDragTransferable, so the selection has been updated already.
  // Gather the displayables for the selected objects
  var displayables = [];
  var selection = this._selectionHandler.getSelection();
  for(var i=0; i<selection.length; i++) {
    displayables.push(selection[i].getDisplayable());
  }
  
  return displayables;
}

DvtMapDataLayer.prototype.getSelectedAreas = function (selectedObjs) {
  selectedAreas = []
  var areaObjs = this.getAreaObjects();
  for(var i=0; i<selectedObjs.length; i++) {
    for(var j=0; j<areaObjs.length; j++) {
      if (areaObjs[j].getId() == selectedObjs[i]) {
        selectedAreas.push(areaObjs[j].getAreaId());
        break;
      }
    }
  }
  return selectedAreas;
}

// Copyright (c) 2011, 2012, Oracle and/or its affiliates. 
// All rights reserved. 

/**
 * @constructor
 */
var DvtThematicMapEventManager = function(context, callback, callbackObj) {
  this.Init(context, callback, callbackObj);
};

DvtObj.createSubclass(DvtThematicMapEventManager, DvtEventManager, "DvtThematicMapEventManager");

DvtThematicMapEventManager.prototype.Init = function(context, callback, callbackObj) {
  DvtThematicMapEventManager.superclass.Init.call(this, context, callback, callbackObj);
  this._selectionHandlers = new Object();
  this._tmap = callbackObj;
}

/**
 * @override
 */
DvtThematicMapEventManager.prototype.getSelectionHandler = function(logicalObj) {
  if (logicalObj && logicalObj.getDataLayer) {
    var clientId = logicalObj.getDataLayer().getClientId();
    return this._selectionHandlers[clientId];
  }
}

/**
 * @override
 */
DvtThematicMapEventManager.prototype.setSelectionHandler = function(dataLayerId, handler) {
  this._selectionHandlers[dataLayerId] = handler;
}

DvtThematicMapEventManager.prototype.setDrillMode = function (mode) {
  this._drillMode = mode;
}

DvtThematicMapEventManager.prototype.setPanZoomCanvas = function (pzc) {
  this._pzc = pzc;
}

DvtThematicMapEventManager.prototype.removeFromSelection = function (clientId, obj) {
  var selectionHandler = this._selectionHandlers[clientId];
  if (selectionHandler)
    selectionHandler.removeFromSelection(obj);
}

DvtThematicMapEventManager.prototype.clearSelection = function (clientId) {
  var selectionHandler = this._selectionHandlers[clientId];
  if (selectionHandler)
    selectionHandler.clearSelection();
}

DvtThematicMapEventManager.prototype.setInitialFocus = function (navigable) {
  //focus object will be set on child layers
  if (navigable) {
    DvtThematicMapEventManager.superclass.setFocus.call(this, navigable);
  }
}

/**
 * @override
 */
DvtThematicMapEventManager.prototype.OnMouseOver = function (event) {
  var obj = this.GetLogicalObject(event.target);
  if (!this.getSelectionHandler(obj)) {
      if (obj && obj.showHoverEffect)
        obj.showHoverEffect();
  }
  if (obj && obj.getShowPopupBehaviors && obj.getDataLayer) {
    this._tmap.setEventClientId(obj.getDataLayer().getClientId());
  }
  DvtThematicMapEventManager.superclass.OnMouseOver.call(this, event);
}

/**
 * Thematic map always shows hover effects.
 * @override
 */
DvtThematicMapEventManager.prototype.OnMouseOut = function (event) {
  var obj = this.GetLogicalObject(event.target);
  if (!this.getSelectionHandler(obj)) {
    if (obj && obj.hideHoverEffect)
      obj.hideHoverEffect();
  }
  DvtThematicMapEventManager.superclass.OnMouseOut.call(this, event);
}

/**
 * @override
 */
DvtThematicMapEventManager.prototype.OnClick = function (event) {
  var obj = this.GetLogicalObject(event.target);
  
  // If no logical objects then pass on to all selection handlers to clear selection
  if (!obj) {
    for (var clientId in this._selectionHandlers) {
      var bSelectionChanged = this._selectionHandlers[clientId].processClick(null, event.ctrlKey);
      // If the selection has changed, fire an event
      if (bSelectionChanged) {
        var selectedObjs = this._selectionHandlers[clientId].getSelection();
        var selectedIds = [];
        for(var i=0; i<selectedObjs.length; i++)
          selectedIds.push(selectedObjs[i].getId());
        var selectionEvent = new DvtSelectionEvent(selectedIds);
        this._callback.call(this._callbackObj, selectionEvent);
      }
    }
  } else {
    this._setClickInfo(event.target);
    DvtThematicMapEventManager.superclass.OnClick.call(this, event);
    this._handleClick(obj);
  }
}

DvtThematicMapEventManager.prototype._handleClick = function (obj) {
  if (obj instanceof DvtMapDataObject) {
    var link = obj.getDestination();
    if (link) {
      window.location.href = link;
    } else if (obj.hasAction()){
      var actionEvent = new DvtMapActionEvent(obj.getClientId(), obj.getId(), obj.getAction());
      actionEvent.addParam('clientId', obj.getDataLayer().getClientId());
      this.hideTooltip();
      this._callback.call(this._callbackObj, actionEvent);
    } else if (obj.getShowPopupBehaviors()) {
      this._tmap.setEventClientId(obj.getDataLayer().getClientId());
    }
  }
}

DvtThematicMapEventManager.prototype._setClickInfo = function(target) {
  var clientId = null;
  var mapLayer = null;
  var area = null;
  var obj = this.GetLogicalObject(target);
  if (obj) {
    if (obj instanceof DvtMapDataArea || obj instanceof DvtMapArea)
      area = target;
    if  (obj.getDataLayer) {
      var dataLayer = obj.getDataLayer();
      clientId = dataLayer.getClientId();
      mapLayer = dataLayer.getMapLayer().getLayerName();
    }
  }
  this._tmap.setClickInfo(clientId, mapLayer, area);
}

/**
 * @override
 */
DvtThematicMapEventManager.prototype.OnDblClick = function(event) {
  DvtThematicMapEventManager.superclass.OnDblClick.call(this, event);
  var obj = this.GetLogicalObject(event.target);
  if (this.getSelectionHandler(obj) && this._drillMode && this._drillMode != 'none') {
    // Create and fire the event
    var drillEvent = new DvtMapDrillEvent(DvtMapDrillEvent.DRILL_DOWN);
    this._callback.call(this._callbackObj, drillEvent);
  }
}

/**
 * @override
 */
DvtThematicMapEventManager.prototype.OnContextMenu = function(event) {
  this._setClickInfo(event.target);
  DvtThematicMapEventManager.superclass.OnContextMenu.call(this, event);
}

/**
 * @override
 */
DvtThematicMapEventManager.prototype.GetContextMenuType = function(logicalObj) {
  return DvtContextMenuHandler.TYPE_CONTEXT_MENU;
}

/**
 * @override
 */
DvtThematicMapEventManager.prototype.ProcessTouchContextMenu = function(event, dlo) {
  this._setClickInfo(event.targetObj);
  // Prepare context menu
  var menuItems = this.ContextMenuHandler.getMenuItems(dlo);
  if (menuItems) {
    for (var i=0; i<menuItems.length; i++) {
      var menuItem = menuItems[i];
      var actionTooltip = this.CustomTooltipManager.getActionTooltip();
      // Set to default border when there are context menu items launched for multple/body cases and there is no tooltip
      actionTooltip.setTooltipBorderColor(DvtCustomTooltip.DEFAULT_BORDER_COLOR);
      var listener = this.ContextMenuItemListener;
      var ttipItem = new DvtContextMenuTooltipItem(this.getContext(), "item"+i, listener, this, menuItem);
      actionTooltip.addMenuItem(ttipItem);
    }
  }
}

/**
 * @override
 */
DvtThematicMapEventManager.prototype.ProcessKeyboardEvent = function(event)
{
  var eventConsumed = true;
  var keyCode = event.keyCode;
  // Map Reset
  if ((keyCode == DvtKeyboardEvent.ZERO || keyCode == DvtKeyboardEvent.NUMPAD_ZERO) && event.ctrlKey && event.shiftKey) {
    this._tmap.resetMap();
    event.preventDefault();
  }
  // Legend
  else if (keyCode == DvtKeyboardEvent.BACK_SLASH) {
    var legendPanel = this._tmap.getLegendPanel();
    if (legendPanel)
      legendPanel.setCollapse(!legendPanel.isCollapse());
    event.preventDefault();      
  }
  // Drilling
  else if (keyCode == DvtKeyboardEvent.ENTER) {
    if (event.shiftKey)
      this._tmap.drillUp();
    else 
      this._tmap.drillDown();
    event.preventDefault();
  }
  // Selection
  else if (keyCode == DvtKeyboardEvent.SPACE && event.ctrlKey) {
    var logicalObj = this.getFocus();
    this.ProcessSelectionEventHelper(logicalObj, true);
    event.preventDefault();
  }  
  // Zoom to fit
  else if ((keyCode == DvtKeyboardEvent.ZERO || keyCode == DvtKeyboardEvent.NUMPAD_ZERO) && event.ctrlKey) {
    var focusObj = this.getFocus();
    if (event.altKey)
      this._tmap.fitRegion(focusObj.getDisplayable());
    else
      this._tmap.fitRegion(focusObj.getDataLayer().getAreaSelectionLayer());
    event.preventDefault();
  }
  else {
    eventConsumed = DvtThematicMapEventManager.superclass.ProcessKeyboardEvent.call(this, event);
  }
  
  return eventConsumed;
}

/**
 * @override
 */
DvtThematicMapEventManager.prototype.OnTouchClick = function (event) {
  var obj = this.GetLogicalObject(event.targetObj);
  
  // If no logical objects then pass on to all selection handlers to clear selection
  if (!obj || obj.isClearSelection) {
    for (var clientId in this._selectionHandlers) {
      var bSelectionChanged = this._selectionHandlers[clientId].processClick(null, event.ctrlKey);
      // If the selection has changed, fire an event
      if (bSelectionChanged) {
        var selectedObjs = this._selectionHandlers[clientId].getSelection();
        var selectedIds = [];
        for(var i=0; i<selectedObjs.length; i++)
          selectedIds.push(selectedObjs[i].getId());
        var selectionEvent = new DvtSelectionEvent(selectedIds);
        this._callback.call(this._callbackObj, selectionEvent);
      }
    }
  } else {
    this._setClickInfo(event.targetObj);
    DvtThematicMapEventManager.superclass.OnTouchClick.call(this, event);
    this._handleClick(obj);
  }
    
}

/**
 * @override
 */
DvtThematicMapEventManager.prototype.HandleTouchHoverOverInternal = function (event) {
  var obj = this.GetLogicalObject(event.targetObj);
  if (!this.getSelectionHandler(obj)) {
    if (obj && obj.showHoverEffect)
      obj.showHoverEffect();
  }
  if (obj && obj.getShowPopupBehaviors && obj.getDataLayer) {
    this._tmap.setEventClientId(obj.getDataLayer().getClientId());
  }
}

/**
 * @override
 */
DvtThematicMapEventManager.prototype.HandleTouchHoverOutInternal = function (event) {
  var obj = this.GetLogicalObject(event.targetObj);
  if (!this.getSelectionHandler(obj)) {
    if (obj && obj.hideHoverEffect)
      obj.hideHoverEffect();
  }
  this._setClickInfo(event.targetObj);
}

/**
 * @override
 */
DvtThematicMapEventManager.prototype.HandleTouchHoverEndInternal = function (event) {
  var obj = this.GetLogicalObject(event.targetObj);
  if (!this.getSelectionHandler(obj)) {
    if (obj && obj.hideHoverEffect)
      obj.hideHoverEffect();
  }
}

/**
 * @override
 */
DvtThematicMapEventManager.prototype.OnTouchDblClick = function(event) {       
  var obj = this.GetLogicalObject(event.targetObj);
  if(!obj)
    return;
  if (this.getSelectionHandler(obj) && this._drillMode && this._drillMode != 'none') {
    // First make sure a selection event is fired to support drilling on double click. Touch doesn't send click event
    // before a double click
    this.ProcessSelectionEventHelper(obj, event.ctrlKey);
    var drillEvent = new DvtMapDrillEvent(DvtMapDrillEvent.DRILL_DOWN);
    this._callback.call(this._callbackObj, drillEvent);
  }
}


// Copyright (c) 2011, 2013, Oracle and/or its affiliates. 
// All rights reserved. 
/**
 * @constructor
 */
var DvtThematicMapParser = function (tmap) {
  this.Init(tmap);
}

DvtObj.createSubclass(DvtThematicMapParser, DvtObj, "DvtThematicMapParser");

DvtThematicMapParser._ELEM_MAP_PROPERTIES = "mapProperties";
DvtThematicMapParser._ELEM_LAYERS = "layers";
DvtThematicMapParser._ELEM_LAYER = "layer";
DvtThematicMapParser._ELEM_POINTS = "points";
DvtThematicMapParser._ELEM_POINT = "point";
DvtThematicMapParser._ELEM_LEGEND = "legend";
DvtThematicMapParser._ELEM_RESOURCES = "resources";
DvtThematicMapParser._ELEM_MAP_HIERARCHY = "mapHierarchy";
DvtThematicMapParser._ELEM_MENUS = "menus";
DvtThematicMapParser.ELEM_COLOR_STYLES = "colorStyles";
DvtThematicMapParser.ELEM_GRADUATED_SYMBOL = "graduatedSymbol";
DvtThematicMapParser.ELEM_IMAGE = "image";
DvtThematicMapParser._ELEM_MARKER_DEF = "markerDef";
DvtThematicMapParser._ELEM_ROW = "row";
DvtThematicMapParser._ELEM_CUSTOM_LAYER = "customLayer";
DvtThematicMapParser._ELEM_AREA_LAYER = "areaLayer";
DvtThematicMapParser._ELEM_POINT_LAYER = "pointLayer";
DvtThematicMapParser._ELEM_SPB = "spb";
DvtThematicMapParser._ELEM_CUSTOM_REGION = "customRegion";
DvtThematicMapParser._ELEM_P = "p";
DvtThematicMapParser._ELEM_STYLES = "styles";
DvtThematicMapParser._ELEM_REGION_LAYER ="regionLayer";
DvtThematicMapParser._ELEM_MARKER_STYLE ="markerStyle";
DvtThematicMapParser._ELEM_TMAP_RESOURCES = "tmapResources";

DvtThematicMapParser._ATTR_ANIM_DATA_CHANGE = "animationDataChange";
DvtThematicMapParser._ATTR_ANIM_ON_LAYER_CHANGE = "animationOnLayerChange";
DvtThematicMapParser.ATTR_ID = "id";
DvtThematicMapParser._ATTR_CLIENT_ID = "clientId";
DvtThematicMapParser._ATTR_SELECTION_MODE = "selectionMode";
DvtThematicMapParser._ATTR_STYLE_ID = "styleId";
DvtThematicMapParser._ATTR_LAYER_NAME = "layerName";
DvtThematicMapParser._ATTR_LABEL = "label";
DvtThematicMapParser._ATTR_LABEL_DISPLAY = "labelDisplay";
DvtThematicMapParser._ATTR_LABEL_TYPE = "labelType";
DvtThematicMapParser._ATTR_LABEL_POSITION = "labelPosition";
DvtThematicMapParser._ATTR_ROW_KEY = "rowKey";
DvtThematicMapParser._ATTR_GROUP_ID = "groupID";
DvtThematicMapParser._ATTR_SHORT_NAME = "shortName";
DvtThematicMapParser._ATTR_LONG_NAME = "longName";
DvtThematicMapParser._ATTR_PATH = "d";
DvtThematicMapParser._ATTR_ALIGN_ID = "alignId";
DvtThematicMapParser._ATTR_SHOW_WITH = "showWith";
DvtThematicMapParser._ATTR_SUB_REGIONS ="subRegions";
DvtThematicMapParser._ATTR_INLINE_STYLE ="inlineStyle";
DvtThematicMapParser._ATTR_HOVER_STYLE ="hoverStyle";
DvtThematicMapParser._ATTR_SELECT_STYLE ="selectStyle";
DvtThematicMapParser._ATTR_LABEL_STYLE ="labelStyle";
DvtThematicMapParser._ATTR_BASEMAP_NAME = "baseMapName";
DvtThematicMapParser._ATTR_ANIM_ON_DISP = "animationOnDisplay";
DvtThematicMapParser._ATTR_ANIM_ON_MAP_CHANGE = "animationOnMapChange";
DvtThematicMapParser._ATTR_ANIM_DUR = "animationDuration";
DvtThematicMapParser._ATTR_ANIM_ON_MAP_CHANGE = "animationOnMapChange";
DvtThematicMapParser._ATTR_ANIM_ON_DRILL = "animationOnDrill";
DvtThematicMapParser._ATTR_DRILL_ZOOM_TO_FIT = "drillZoomToFit";
DvtThematicMapParser._ATTR_DRILL_MODE = "drillMode";
DvtThematicMapParser._ATTR_INITIAL_ZOOMING = "initialZooming";
DvtThematicMapParser._ATTR_CTRLPANEL_BEHAVIOR = "controlPanelBehavior";
//DvtThematicMapParser._ATTR_ISBUILTINMAP = "isBuiltInMap";
DvtThematicMapParser._ATTR_TOOLTIP_DISPLAY = "displayTooltips";
DvtThematicMapParser._ATTR_FEATURES_OFF = "featuresOff";
DvtThematicMapParser._ATTR_LOCALE_L2R = "localeL2R";
DvtThematicMapParser._ATTR_CENTER_X = "centerX";
DvtThematicMapParser._ATTR_CENTER_Y = "centerY";
DvtThematicMapParser._ATTR_CUR_ZOOM = "curZoom";
DvtThematicMapParser._ATTR_INLINE_STYLE = "inlineStyle";
DvtThematicMapParser._ATTR_ISOLATED_ROW_KEY = "isolatedRowKey";
DvtThematicMapParser._ATTR_SOURCE = "source";
DvtThematicMapParser._ATTR_ZOOMING = "zooming";
DvtThematicMapParser._ATTR_PANNING = "panning";

DvtThematicMapParser._SEMICOLON = ";";

DvtThematicMapParser.prototype.Init = function (tmap) {
  this._tmap = tmap;
  this._customLayerNames = [];
  this._customMarkerDefs = new Object();
  this._areaLayerStyle = null;
  this._markerStyle = null;
}

DvtThematicMapParser.prototype.loadXmlInitial = function (rootXmlNode, paramKeys, paramValues) {
  var childNodes = rootXmlNode.getChildNodes();
  var node, nodeName;
  for (var i = 0;i < childNodes.length;i++) {
    node = childNodes[i];
    nodeName = node.getName();
    if (nodeName == DvtThematicMapParser._ELEM_MAP_PROPERTIES)
      this.ParseMapProperties(node);
    else if (nodeName == DvtThematicMapParser._ELEM_CUSTOM_LAYER)
      this.ParseCustomRegionLayer(node);
    else if (nodeName == DvtThematicMapParser._ELEM_LAYERS)
      this.ParseDataLayers(node, false);
    else if (nodeName == DvtThematicMapParser._ELEM_LEGEND)
      this.ParseLegend(node);
    else if (nodeName == 'basemap') {
      // check to see if this is the correct basemap metadata
      if (this._tmap.getMapName() == node.getAttribute(DvtThematicMapParser.ATTR_ID))
        this.ParseCustomBasemap(node);
    }
  }
}

DvtThematicMapParser.prototype.ParseMapProperties = function (xmlNode) {
  this._setMapProps(xmlNode);

  var childNodes = xmlNode.getChildNodes();
  var node, nodeName;
  for (var i = 0;i < childNodes.length;i++) {
    node = childNodes[i];
    nodeName = node.getName();
    if (nodeName == DvtThematicMapParser._ELEM_RESOURCES)
      this.ParseResources(node);
    else if (nodeName == DvtThematicMapParser._ELEM_MAP_HIERARCHY)
      this.ParseMapHierarchy(node);
    else if (nodeName == DvtThematicMapParser._ELEM_MENUS)
      this.ParseMenus(node);
    else if (nodeName == DvtThematicMapParser._ELEM_TMAP_RESOURCES)
      this.ParseMenuResources(node);
    else if (nodeName == "panZoomCanvasProperties")
      this.ParsePanZoomResources(node);
    else if (nodeName == DvtThematicMapParser._ELEM_REGION_LAYER) {
      var attr = node.getAttribute(DvtThematicMapParser._ATTR_INLINE_STYLE);
      if (attr)
        this._areaLayerStyle = new DvtCSSStyle(attr);
      attr = node.getAttribute(DvtThematicMapParser._ATTR_HOVER_STYLE);
      if (attr)
        this._areaHoverStyle = new DvtCSSStyle(attr);
      attr = node.getAttribute(DvtThematicMapParser._ATTR_SELECT_STYLE);
      if (attr)
        this._areaSelectStyle = new DvtCSSStyle(attr);
    }
    else if (nodeName == DvtThematicMapParser._ELEM_MARKER_STYLE)
      this._markerStyle = new DvtCSSStyle(node.getAttribute(DvtThematicMapParser._ATTR_INLINE_STYLE));
  }
}

DvtThematicMapParser.prototype.ParseDataLayers = function (xmlNode, isUpdate) {
  var layers = xmlNode.getElementsByTagName(DvtThematicMapParser._ELEM_LAYER);
  var legend = xmlNode.getElementsByTagName(DvtThematicMapParser._ELEM_LEGEND);
  //When only a data layer is updated the new legend xml is sent down in the same div
  //Two legend elements will be returned bc the xml looks like: <legend><style><legend></legend></legend>
  //where the inner <legend> refers to the styles applied to the legend
  if (isUpdate && legend && legend[0])
    this.ParseLegend(legend[0]);
    
  for (var i = 0;i < layers.length;i++) {
    var clientId = layers[i].getAttribute(DvtThematicMapParser._ATTR_CLIENT_ID);
    var id = layers[i].getAttribute(DvtThematicMapParser.ATTR_ID);
    var layer = this._tmap.getLayer(id);
    if (!layer) {
      var parentLayerName = layers[i].getAttribute(DvtThematicMapParser._ATTR_SHOW_WITH);
      if (parentLayerName) {
        layer = this._tmap.getLayer(parentLayerName);
      } else {
        layer = new DvtMapLayer(this._tmap, this._tmap.getMapName(), id, DvtMapLayer.POINT, this._tmap.getEventHandler());
        this._tmap.addPointLayer(layer);
      }
    }
    var dataLayer = new DvtMapDataLayer(this._tmap, layer, clientId, this._tmap.getEventHandler());
  
    // Set data layer attributes
    //Set selection
    var selectionMode = layers[i].getAttribute(DvtThematicMapParser._ATTR_SELECTION_MODE);
    if (selectionMode == 'single')
      dataLayer.setSelectionMode(DvtSelectionHandler.TYPE_SINGLE);
    else if (selectionMode == 'multiple')
      dataLayer.setSelectionMode(DvtSelectionHandler.TYPE_MULTIPLE);
      
    // Set Animation
    var animOnDataChange = layers[i].getAttribute(DvtThematicMapParser._ATTR_ANIM_DATA_CHANGE);
    if (animOnDataChange) {
      var animDur = layers[i].getAttribute(DvtThematicMapParser._ATTR_ANIM_DUR);
      if (animDur)
        animDur = parseFloat(animDur);
      if (!animDur || isNaN(animDur)) 
        animDur = 1.0;
      dataLayer.setAnimation(animOnDataChange);
      dataLayer.setAnimationDuration(animDur);
    }
    
    //Add initially isolated area
    var isolatedRowKey = null;
    if (layer instanceof DvtMapAreaLayer)
      isolatedRowKey = layers[i].getAttribute(DvtThematicMapParser._ATTR_ISOLATED_ROW_KEY);
      
    // Add layer data objects
    var initSelections = [];
    var initDrilled = [];
    var styles = this._parseStyles(layers[i].getElementsByTagName(DvtThematicMapParser._ELEM_STYLES));
    var data = layers[i].getElementsByTagName(DvtThematicMapParser._ELEM_ROW);
    
    //Show popup behavior
    var spb = this._parseShowPopupBehavior(layers[i], styles);
    
    // Create dataobject using sytle id that matches
    for (var j = 0;j < data.length;j++) {
      var styleId = data[j].getAttribute(DvtThematicMapParser._ATTR_STYLE_ID);
      var dataObj = this._parseDataObject(layer, dataLayer, data[j], styleId, styles[styleId], initSelections, initDrilled, isolatedRowKey);
      if (dataObj) {
        // Selection support
        if (dataLayer.getSelectionMode()) {
          var displayable = dataObj.getDisplayable();
          displayable.setSelectable(true);
        }
        
        //Show popup support
        if (spb)
          dataObj.setShowPopupBehaviors(spb);
        if (dataObj instanceof DvtMapDataArea)
          dataLayer.addAreaObject(dataObj);
        else
          dataLayer.addDataObject(dataObj);
      }
    }
    
    // After processing all data objects we should have the area ID of the isolated area
    if (isolatedRowKey && this._isolatedArea) {
      dataLayer.setIsolatedAreaRowKey(isolatedRowKey);
      layer.setIsolatedArea(this._isolatedArea);
    }
    
    // Process initial data layer selections
    if (dataLayer.getSelectionMode() && initSelections.length > 0)
      dataLayer.setInitialSelections(initSelections);
    if (initDrilled.length > 0)
      this._tmap.addDrilledLayer(layer.getLayerName(), [dataLayer.getClientId(),initDrilled]);
    
    // If layer already exists, update
    if (isUpdate || layer.getDataLayer(dataLayer.getClientId()))
      layer.updateDataLayer(dataLayer);
    else
      layer.addDataLayer(dataLayer);
  }
}

DvtThematicMapParser.prototype.ParseLegend = function (xmlNode) {
  var disclosed = xmlNode.getAttribute('disclosed') == 'true';
  var isFixed = xmlNode.getAttribute('display') == 'fixed';
  var maxWidth = xmlNode.getAttribute('maxWidth');
  var expandTooltip = xmlNode.getAttribute('expandTooltip');
  var collapseTooltip = xmlNode.getAttribute('collapseTooltip');
  var legendCollapseDir = DvtAgent.getAgent().isRightToLeft() ? DvtCollapsiblePanel.COLLAPSE_NORTHWEST : DvtCollapsiblePanel.COLLAPSE_NORTHEAST;
  
  //check if max legend width is given as a % or px
  var percentIndex = maxWidth.indexOf('%');
  var isPercent = (percentIndex != -1);
  if (isPercent)
    maxWidth = parseFloat(maxWidth.substring(0,percentIndex))/100 * this._tmap.GetWidth();
  else
    maxWidth = parseFloat(maxWidth);
  var maxHeight = this._tmap.GetHeight() - 2*DvtThematicMap._COLLAPSIBLE_PANEL_OFFSET;
    
  var legendPanel = new DvtCollapsiblePanel(this._tmap.getContext(), maxWidth, maxHeight, legendCollapseDir, 
                                            this._tmap.getLegendButtonImages(), null, disclosed, isFixed);
  legendPanel.addEventListener(DvtCollapsiblePanelEvent.TYPE, this._tmap.HandleCollapsiblePanelEvent, false, this._tmap);
  legendPanel.addEventListener(DvtResizeEvent.RESIZE_EVENT, this._tmap.HandleLegendResize, false, this._tmap);
  legendPanel.setButtonTooltips(expandTooltip, collapseTooltip);
  var legend = new DvtCommonLegend(this._tmap.getContext(), legendPanel.getMaxContentWidth(), legendPanel.getMaxContentHeight());
  legend.setXML(xmlNode);
  this._tmap.setLegend(legend, legendPanel);
}

//DvtThematicMapParser.prototype.ParseOverviewWindow = function(xmlNode) {
//  var width = 108;
//  var height = 81;
//  var ovWindow = new DvtOverviewWindow(this._tmap.getContext(), 'dgOverviewWindow', 0, 0, width, height);
//  ovWindow.setContinuousEvents(true);
//  ovWindow.setViewportInContentCoords(true);
//  ovWindow.loadXmlNode(xmlNode);
//  this._tmap.setOverviewWindow(ovWindow);      
//}
DvtThematicMapParser.prototype.ParseResources = function (xmlNode) {
  this._tmap.setButtonImages(xmlNode);
}

DvtThematicMapParser.prototype.ParseMapHierarchy = function (xmlNode) {
  var layerNodes = xmlNode.getAllChildNodes();

  var baseMapName = this._tmap.getMapName();
  var layerName, labelDisplay, clientId, labelType, layer;

  for (var i = 0;i < layerNodes.length;i++) {
    var node = layerNodes[i];
    var nodeName = node.getName();

    if (nodeName == DvtThematicMapParser._ELEM_CUSTOM_LAYER) {
      layerName = node.getAttribute(DvtThematicMapParser.ATTR_ID);
      this._customLayerNames.push(layerName);
    }
    else if (nodeName != DvtThematicMapParser._ELEM_POINT_LAYER) {
      layerName = node.getAttribute(DvtThematicMapParser._ATTR_LAYER_NAME);
      labelDisplay = node.getAttribute(DvtThematicMapParser._ATTR_LABEL_DISPLAY);
      clientId = node.getAttribute(DvtThematicMapParser._ATTR_CLIENT_ID);
      labelType = node.getAttribute(DvtThematicMapParser._ATTR_LABEL_TYPE);
      
      if (this._isCustomBasemap) {
        layer = new DvtMapCustomAreaLayer(this._tmap, baseMapName, layerName, clientId, labelDisplay, labelType, this._tmap.getEventHandler());
      } else {
        layer = new DvtMapAreaLayer(this._tmap, baseMapName, layerName, clientId, labelDisplay, labelType, this._tmap.getEventHandler());
        if (DvtArrayUtils.indexOf(this._customLayerNames, layerName) == -1) {
          layer.setAreaNames(DvtBaseMapManager.getAreaNames(baseMapName, layerName));
          layer.setAreaShapes(this._createPathShapes(DvtBaseMapManager.getAreaPaths(baseMapName, layerName)));
          layer.setAreaLabelInfo(DvtBaseMapManager.getAreaLabelInfo(baseMapName, layerName));
          layer.setAreaChildren(DvtBaseMapManager.getChildrenForLayerAreas(this._tmap.getMapName(), layerName));
        }
      }
      var attr = node.getAttribute(DvtThematicMapParser._ATTR_LABEL_STYLE);
      // Set area layer label style from attribute and then skinning key if attribute not set
      if (attr)
        layer.setLayerCSSStyle(new DvtCSSStyle(attr));
      else if (this._areaLayerStyle)
        layer.setLayerCSSStyle(this._areaLayerStyle);
      
      // Set Animation
      attr = node.getAttribute(DvtThematicMapParser._ATTR_ANIM_ON_LAYER_CHANGE);
      if (attr) {
        var animDur = node.getAttribute(DvtThematicMapParser._ATTR_ANIM_DUR);
        if (animDur)
          animDur = parseFloat(animDur);
        if (!animDur || isNaN(animDur)) 
          animDur = 1.0;
        layer.setAnimation(attr);
        layer.setAnimationDuration(animDur);
      }
      
      if (layer)
        this._tmap.addLayer(layer);
    }
  }
}

DvtThematicMapParser.prototype.ParseCustomRegionLayer = function (xmlNode) {
  var customRegions = xmlNode.getAllChildNodes();
  var layerName = xmlNode.getAttribute(DvtThematicMapParser.ATTR_ID);
  var areaNames = new Object();
  var areaPaths = new Object();
  var children = new Object();
  for (var i = 0;i < customRegions.length;i++) {
    var node = customRegions[i].getElementsByTagName(DvtThematicMapParser._ELEM_P)[0];
    var regionChildren = customRegions[i].getAttribute(DvtThematicMapParser._ATTR_SUB_REGIONS)
    var regionId = node.getAttribute(DvtThematicMapParser._ATTR_GROUP_ID);
    children[regionId] = regionChildren;
    areaPaths[regionId] = node.getAttribute(DvtThematicMapParser._ATTR_PATH);
    areaNames[regionId] = [];
    areaNames[regionId][0] = node.getAttribute(DvtThematicMapParser._ATTR_SHORT_NAME);
    areaNames[regionId][1] = node.getAttribute(DvtThematicMapParser._ATTR_LONG_NAME);
  }
  var customLayer = this._tmap.getLayer(layerName);
  customLayer.setAreaNames(areaNames);
  customLayer.setAreaShapes(this._createPathShapes(areaPaths));
  customLayer.setAreaChildren(children);
  var attr = node.getAttribute(DvtThematicMapParser._ATTR_LABEL_STYLE);
  // Set area layer label style from attribute and then skinning key if attribute not set
  if (attr)
    customLayer.setLayerCSSStyle(new DvtCSSStyle(attr));
  else if (this._areaLayerStyle)
    customLayer.setLayerCSSStyle(this._areaLayerStyle);
}


DvtThematicMapParser.prototype.ParseCustomBasemap = function (xmlNode) {
  var childNodes = xmlNode.getAllChildNodes();
  var node, nodeName;
  for (var i = 0;i < childNodes.length;i++) {
    node = childNodes[i];
    nodeName = node.getName();
    if (nodeName == DvtThematicMapParser._ELEM_LAYER)
      this._parseCustomLayer(node);
    else if (nodeName == DvtThematicMapParser._ELEM_POINTS)
      this._parseCustomPoints(node);
  }
}

DvtThematicMapParser.prototype._parseCustomLayer = function (xmlNode) {
  var childNodes = xmlNode.getAllChildNodes();
  var layerName = xmlNode.getAttribute(DvtThematicMapParser.ATTR_ID);
  var node, nodeName;
  var images = [];
  for (var i = 0;i < childNodes.length;i++) {
    node = childNodes[i];
    nodeName = node.getName();
    // currently only images are supported
    if (nodeName == DvtThematicMapParser.ELEM_IMAGE) {
     var image = {};
     image['source'] = node.getAttribute('source');
     image['width'] = node.getAttribute('width');
     image['height'] = node.getAttribute('height');
     var bidi = node.getAttribute('bidi');
     var dir = node.getAttribute('dir');
     // The bidi attribute is deprecated and dir="ltr/rtl" should be used instead.
     if (bidi == 'true' || dir == 'rtl')
       image['dir'] = 'rtl';
     else
       image['dir'] = 'ltr';
     images.push(image);
    }
  }
  var customLayer = this._tmap.getLayer(layerName);
  customLayer.setAreaLayerImage(images);
}

DvtThematicMapParser.prototype._parseCustomPoints = function (xmlNode) {
  var childNodes = xmlNode.getAllChildNodes();
  var node, nodeName;
  var points = {};
  var labels = {};
  for (var i = 0;i < childNodes.length;i++) {
    node = childNodes[i];
    nodeName = node.getName();
    if (nodeName == DvtThematicMapParser._ELEM_POINT) {
      points[node.getAttribute('name')] = [node.getAttribute('x'), node.getAttribute('y')];
      labels[node.getAttribute('name')] = [node.getAttribute('shortLabel'), node.getAttribute('longLabel')];
    }
  }
  // register points with base map manager
  // index will change once we allow more layers besides point
  DvtBaseMapManager.registerBaseMapLayer(this._tmap.getMapName(), 'cities', labels, points, null, null, 1);
}
//
//DvtThematicMapParser.prototype.ParseCustomBasemapMetadata = function (xmlNode) {
//  var layers = xmlNode.getAllChildNodes();
//  for (var i = 0;i < layers.length;i++) {
//    var id = layers[i].getAttribute('id');
//    var layer = this._tmap.getLayer(id);
//    var areas = layers[i].getAllChildNodes();
//    
//    var areaNames = {};
//    
//    for (var j = 0;j < areas.length;j++) {
//      var areaId = areas[j].getAttribute('id');
//      var shortLabel = areas[j].getAttribute('shortLabel');
//      var longLabel = areas[j].getAttribute('longLabel');
//      if (shortLabel || longLabel)
//        areaNames[areaId] = [shortLabel, longLabel];
//    }
//    layer.setAreaNames(areaNames);
//    DvtBaseMapManager.registerResourceBundle(this._tmap.getMapName(), id, areaNames);
//  }
//}

DvtThematicMapParser.prototype.ParseMenus = function (xmlNode) {
  this._tmap.setMenuNode(xmlNode);
}

DvtThematicMapParser.prototype.ParseMenuResources = function (xmlNode) {
  this._tmap.setMenuResources(xmlNode);
}

DvtThematicMapParser.prototype.ParsePanZoomResources = function (xmlNode) {
  this._tmap.setPanZoomResources(xmlNode);
}

DvtThematicMapParser.prototype._createPathShapes = function(areaPaths) {
  var shapes = {};
  var context = this._tmap.getContext();
  for (var area in areaPaths) {
    shapes[area] = new DvtPath(context, areaPaths[area]);
    this._parseDataObjectFill(DvtThematicMapParser.ELEM_COLOR_STYLES, this._areaLayerStyle, shapes[area])
  }
  return shapes;
}

DvtThematicMapParser.prototype._setMapProps = function (xmlNode) {
  var attr;

  //Basemap attributes
  attr = xmlNode.getAttribute(DvtThematicMapParser._ATTR_BASEMAP_NAME);
  if (attr)
    this._tmap.setMapName(attr);
  attr = xmlNode.getAttribute(DvtThematicMapParser._ATTR_SOURCE);
  if (attr)
    this._isCustomBasemap = true;

  //Animation attributes
  attr = xmlNode.getAttribute(DvtThematicMapParser._ATTR_ANIM_ON_DISP);
  if (attr)
    this._tmap.setAnimationOnDisplay(attr);
    
  attr = xmlNode.getAttribute(DvtThematicMapParser._ATTR_ANIM_ON_MAP_CHANGE);
  if (attr)
    this._tmap.setAnimationOnMapChange(attr);
  
  attr = xmlNode.getAttribute(DvtThematicMapParser._ATTR_ANIM_DUR);
  if (attr)
    this._tmap.setAnimationDuration(attr);
  
  //Tooltip behavior: auto, none, shortDescOnly
  attr = xmlNode.getAttribute(DvtThematicMapParser._ATTR_TOOLTIP_DISPLAY);
  if (attr)
    this._tmap.setDisplayTooltips(attr);

  attr = xmlNode.getAttribute(DvtThematicMapParser._ATTR_INLINE_STYLE);
  if (attr)
    this._tmap.setBackgroundStyle(attr);

  //Control panel behavior: initExpanded, initCollapsed, hidden
  attr = xmlNode.getAttribute(DvtThematicMapParser._ATTR_CTRLPANEL_BEHAVIOR);
  if (attr)
    this._tmap.setControlPanelBehavior(attr);

  attr = xmlNode.getAttribute(DvtThematicMapParser._ATTR_FEATURES_OFF);
  if (attr)
    this._tmap.setFeaturesOff(attr);

  //For BiDi
  attr = xmlNode.getAttribute(DvtThematicMapParser._ATTR_LOCALE_L2R);
  if (attr)
    this._tmap.setBiDi(attr);

  //For initial pan and zoom
  attr = xmlNode.getAttribute(DvtThematicMapParser._ATTR_CENTER_X);
  if (attr)
    this._tmap.setInitialCenterX(attr);

  attr = xmlNode.getAttribute(DvtThematicMapParser._ATTR_CENTER_Y);
  if (attr)
    this._tmap.setInitialCenterY(attr);

  attr = xmlNode.getAttribute(DvtThematicMapParser._ATTR_CUR_ZOOM);
  if (attr)
    this._tmap.setInitialZoom(attr);

  //Drilling attributes
  attr = xmlNode.getAttribute(DvtThematicMapParser._ATTR_ANIM_ON_DRILL);
  if (attr)
    this._tmap.setAnimationOnDrill(attr);

  attr = xmlNode.getAttribute(DvtThematicMapParser._ATTR_DRILL_MODE);
  if (attr)
    this._tmap.setDrillMode(attr);

  attr = xmlNode.getAttribute(DvtThematicMapParser._ATTR_DRILL_ZOOM_TO_FIT);
  if (attr)
    this._tmap.setDrillZoomToFit(attr);
  
  // Even if attributes aren't defined they
  attr = xmlNode.getAttribute(DvtThematicMapParser._ATTR_INITIAL_ZOOMING);
  // initial zooming is set to false by default
  if (attr == 'auto')
    this._tmap.setInitialZooming(true);
  
  attr = xmlNode.getAttribute(DvtThematicMapParser._ATTR_ZOOMING);
  // zooming is on by default
  if (attr == 'none')
  this._tmap.setZooming(false);
  
  attr = xmlNode.getAttribute(DvtThematicMapParser._ATTR_PANNING);
  // panning is on by default
  if (attr == 'none')
    this._tmap.setPanning(false);
}

DvtThematicMapParser.prototype._parseStyles = function (node) {
  var styles = new Object();
  if (node && node.length > 0) {
    var styleNodes = node[0].getAllChildNodes();
    for (var i = 0;i < styleNodes.length;i++) {
      var styleId = styleNodes[i].getAttribute(DvtThematicMapParser.ATTR_ID);
      styles[styleId] = styleNodes[i];
    }
  }
  return styles;
}

DvtThematicMapParser.prototype._parseShowPopupBehavior = function (node, styles) {
  // Tmap allows alignId set to a marker, image, or area tag. Need to remove before creating the DvtShowPopupBehavior
  var spbNodes = node.getElementsByTagName(DvtThematicMapParser._ELEM_SPB);
  var spbs = new Array();
  for (var i = 0;i < spbNodes.length;i++) {
    var alignId = spbNodes[i].getAttribute(DvtThematicMapParser._ATTR_ALIGN_ID);
    var popup = DvtShowPopupBehavior.newInstance(spbNodes[i]);
    for (var styleId in styles) {
      if (alignId == styleId) {
        popup = new DvtShowPopupBehavior(popup.getPopupId(), popup.getTriggerType(), null, popup.getAlign());
        break;
      }
    }
    spbs.push(popup);
  }
  return spbs;
}
    
DvtThematicMapParser.prototype._parseDataObject = function (layer, dataLayer, node, styleId, style, initSelections, initDrilled, isolatedRowKey) {
  var context = this._tmap.getContext();
  var id = node.getAttribute(DvtThematicMapParser._ATTR_ROW_KEY);
  var clientId = node.getAttribute(DvtThematicMapParser._ATTR_CLIENT_ID);
  var areaId = node.getAttribute(DvtThematicMapParser.ATTR_ID);
  var layerName = layer.getLayerName();
  
  var dataObj;
  var styleType = style.getName();
  if (styleType == DvtThematicMapParser.ELEM_COLOR_STYLES) {//Data object is a DvtMapArea
    if (isolatedRowKey) {
      if (isolatedRowKey != id)
        return null;
      else 
        this._isolatedArea = areaId;
    }
    layer.doNotRenderArea(areaId);
    dataObj = new DvtMapDataArea(context, dataLayer, id, clientId, areaId, this._areaHoverStyle, this._areaSelectStyle);
    this._parseMapArea(context, areaId, layer, node, dataObj);
  }
  else if (styleType == DvtThematicMapParser.ELEM_GRADUATED_SYMBOL) {//Data object is a DvtMapMarker
    dataObj = new DvtMapDataMarker(context, dataLayer, id, clientId, areaId);
    this._parseMapMarker(context, style, layerName, node, dataObj)
  }
  else if (styleType == DvtThematicMapParser.ELEM_IMAGE) {//Data object is a DvtMapImage
    dataObj = new DvtMapDataImage(context, dataLayer, id, clientId, areaId);
    this._parseMapImage(context, layerName, node, dataObj)
  }
  var displayable = dataObj.getDisplayable();
  if (!displayable) {
    return null;
  }
  
  var hasAction = node.getAttribute('hasAction') == 'true'; //TODO check actionListener
  dataObj.setHasAction(hasAction);
  if (hasAction)
    dataObj.setAction(node.getAttribute('action'));
    
  var destination = node.getAttribute(styleId+'_destination');
  if (destination)
    dataObj.setDestination(destination);
  
  // Initially selected nodes
  var bSelected = node.getAttribute('selected') == 'true';
  if (bSelected)
    initSelections.push(id);
    
  //Initially drilled nodes
  var bDrilled = node.getAttribute('drilled') == 'true';
  if (bDrilled) {
    initDrilled.push(node.getAttribute(DvtThematicMapParser.ATTR_ID));
    this._tmap.addDisclosedRowKey(id);
  }
  
  //Set label on data object
  var displayLabel = node.getAttribute(styleId + "_" + DvtThematicMapParser._ATTR_LABEL_DISPLAY);
  // For map data areas, display the given label or the area name
  var labelText;
  // If object is a DvtMapDataArea see if label is provided, if not, use the DvtMapAreaLayer label type
  if (displayLabel == 'on')
    labelText = node.getAttribute(styleId + "_" + DvtThematicMapParser._ATTR_LABEL);
  if (!labelText && styleType == DvtThematicMapParser.ELEM_COLOR_STYLES && layer.displayLabels() != 'off')
    labelText = layer.getLabelType() == 'long' ? layer.getLongAreaName(areaId) : layer.getShortAreaName(areaId);
  
  if (labelText) {
    var labelInfo;
    if(layer.getLabelInfoForArea) {
      labelInfo = layer.getLabelInfoForArea(areaId);
    }
    var label;
    if (labelInfo) {
      label = new DvtMapLabel(context, labelText, labelInfo, dataLayer.getLeaderLineContainer());
    } else {
      if (styleType != DvtThematicMapParser.ELEM_COLOR_STYLES)
        label = new DvtText(context, labelText, 0, 0);
      else
        label = new DvtMapLabel(context, labelText, null, dataLayer.getLeaderLineContainer());    
    }
    //BUG 14667560 we need to resolve label position in all cases
    var labelPosition = node.getAttribute(styleId + "_" + DvtThematicMapParser._ATTR_LABEL_POSITION);
    if (labelPosition) {
      dataObj.setLabelPosition(labelPosition);
    }
    var textStyle = node.getAttribute(styleId + "_" + DvtThematicMapParser._ATTR_LABEL_STYLE);
    if (textStyle)
      label.setCSSStyle(new DvtCSSStyle(textStyle));
    else if (layer.getLayerCSSStyle && layer.getLayerCSSStyle())
      label.setCSSStyle(layer.getLayerCSSStyle());
  }

  dataObj.setLabel(label);
  
  // Set datatip
  var displayTooltips = this._tmap.getDisplayTooltips();
  if (displayTooltips != 'none') {
    var datatip = node.getAttribute(styleId + "_shortDesc");
    if (displayTooltips == 'auto') {
      var preDatatip;
      // For data objects associated with supported areas or cities we prepend the area/city name before the datatip
      if (areaId) {
        if (layerName == 'cities' || this._isCustomBasemap)  // for AMX V1, custom basemaps only support points
          preDatatip = DvtBaseMapManager.getCityLabel(this._tmap.getMapName(), areaId);
        else
          preDatatip = DvtBaseMapManager.getLongAreaLabel(this._tmap.getMapName(),layerName,areaId)
      }
      if (preDatatip)
        datatip = (datatip ? preDatatip + ": " + datatip : preDatatip);
    }
    if (datatip)
      dataObj.setDatatip(datatip);  
  }

  return dataObj;
}

DvtThematicMapParser.prototype._parseCenterAndDatatip = function(layerName, node) {
  // We can get the coordiantes for a marker if they are:
  // 1) Passed in the xml
  // 2) A supported city
  // 3) A supported Area
  var mapName = this._tmap.getMapName();
  var areaId = node.getAttribute(DvtThematicMapParser.ATTR_ID);
  if (areaId) {
    var coords = DvtBaseMapManager.getCityCoordinates(mapName, areaId);
    if (coords)
      return coords;
    else
      return DvtBaseMapManager.getAreaCenter(mapName, layerName, areaId);
  } else {
    var x = parseFloat(node.getAttribute("x"));
    var y = parseFloat(node.getAttribute("y"));
    return new DvtPoint(x, y);
  }
}

DvtThematicMapParser.prototype._parseMapImage = function (context, layerName, node, dataObj) {
  var imageId = node.getAttribute(DvtThematicMapParser._ATTR_STYLE_ID);
  var source = node.getAttribute(imageId + "_url");
  var image = null;  
  
  var center = this._parseCenterAndDatatip(layerName, node);
  
  if (!center) { // no city matching 
    return;
  } else {
    image = new DvtImage(context, source);
  }

  var width, height;
  //Get image dimensions via inlineStyle
  var inlineStyle = node.getAttribute(imageId+'_'+DvtThematicMapParser._ATTR_INLINE_STYLE);
  if (inlineStyle) {
    var cssStyle = new DvtCSSStyle(inlineStyle);
    width = cssStyle['width'];
    if (width)
      image.setWidth(cssStyle['width']);
    height = cssStyle['height'];
    if (height)
      image.setHeight(height);
  }
  //If user does not specify image dimensions via inlineStyle then use the default image size.
  if (!width || !height) {
    DvtImageLoader.loadImage(context, source, DvtObj.createCallback(dataObj, dataObj.onImageLoaded));
  }
  
  dataObj.setCenter(center);
  dataObj.setDisplayable(image);
  
}

DvtThematicMapParser.prototype._parseMapArea = function (context, areaId, layer, node, dataObj) {  
  var areaShape = layer.getAreaShape(areaId);
  if (areaShape) {
    var styleId = node.getAttribute(DvtThematicMapParser._ATTR_STYLE_ID);
    var cssStyle = new DvtCSSStyle(node.getAttribute(styleId+'_'+DvtThematicMapParser._ATTR_INLINE_STYLE));
    
    var area = new DvtMapArea(context, areaShape, areaId);
    dataObj.setDisplayable(area);
    this._parseDataObjectFill(DvtThematicMapParser.ELEM_COLOR_STYLES, cssStyle, area, dataObj);
  }
}

DvtThematicMapParser.prototype._parseMapMarker = function (context, style, layerName, node, dataObj) {
  var marker = null;
  var markerId = node.getAttribute(DvtThematicMapParser._ATTR_STYLE_ID);

  var center = this._parseCenterAndDatatip(layerName, node);
  if (!center) // no city matching 
    return;
    
  var shapeType;
  var imgSrc = node.getAttribute(DvtThematicMapParser._ATTR_SOURCE);
  // if marker image source is set, ignore the shape type value which is set for custom svg and built in markers
  if (imgSrc) {
    shapeType = [imgSrc, node.getAttribute("sourceSelected"), node.getAttribute("sourceHover"), node.getAttribute("sourceHoverSelected")];
  } else {
    var strShapeType = node.getAttribute(markerId + "_shapeType");
    if (!strShapeType)
      strShapeType = DvtMapDataMarker.DEFAULT_MARKER_SHAPE;
    shapeType = DvtMarker.convertShapeString(strShapeType);
    if (shapeType == DvtMarker.NONE) {
      shapeType = strShapeType;
      var markerDefs = style.getElementsByTagName(DvtThematicMapParser._ELEM_MARKER_DEF);
      for (var i=0; i<markerDefs.length; i++) {
        if (!this._customMarkerDefs[strShapeType] && markerDefs[i].getAttribute(DvtThematicMapParser.ATTR_ID) == strShapeType)
          this._customMarkerDefs[strShapeType] = DvtMarkerUtils.createMarkerDef(context, markerDefs[i]);
      }
    }
  }

  // Parse data object scales. Save original scale to maintain size despite zoom.
  var sx = node.getAttribute(markerId + "_scaleX");
  if (isNaN(sx))
    sx = DvtMapDataMarker.DEFAULT_MARKER_SCALE;
  else
    sx = parseFloat(sx);
  
  var sy = node.getAttribute(markerId + "_scaleY");
  if (isNaN(sy))
    sy = DvtMapDataMarker.DEFAULT_MARKER_SCALE;
  else
    sy = parseFloat(sy);
 
  var w = node.getAttribute("width"); 
  var h = node.getAttribute("height");
  
  if (!w || isNaN(w))
    w = DvtMapDataMarker.DEFAULT_MARKER_SIZE;
  else
    w = parseInt(w);
    
  if (!h || isNaN(h))
    h = DvtMapDataMarker.DEFAULT_MARKER_SIZE;
  else
    h = parseInt(h);

  var x, y;
   
  x = center.x - ((w*sx)/2);
  y = center.y - ((h*sy)/2);
  
  // id is used for custom marker definition lookup
  marker = new DvtMarker(context, shapeType, x, y, w, h, null, sx, sy);
  dataObj.setCenter(center);
  dataObj.setDisplayable(marker);
  
  var inlineStyle = node.getAttribute(markerId+'_'+DvtThematicMapParser._ATTR_INLINE_STYLE);
  if (inlineStyle) {
    var cssStyle = new DvtCSSStyle(inlineStyle);
    this._parseDataObjectFill(DvtThematicMapParser.ELEM_GRADUATED_SYMBOL, cssStyle, marker, dataObj);
  }
  
  var layer = this._tmap.getLayer(layerName);
  // if label display is set to auto, do not display area labels if markers present
  if (layer.displayLabels && layer.displayLabels() == 'auto')
    layer.doNotRenderLabel(node.getAttribute(DvtThematicMapParser.ATTR_ID));
  //  marker.addCategory(strShapeType);
//  if (data && data['hideAttrColor']) {
//    marker.addCategory(data['hideAttrColor'])
//    marker.addCategory(strShapeType + ',' + data['hideAttrColor']);
//  }
}

DvtThematicMapParser.prototype._parseDataObjectFill = function(styleType, cssStyle, displayable, dataObj) {
  if (!cssStyle)
    cssStyle = {};
  var pattern = cssStyle['pattern'];
  var patternColor = cssStyle['pattern-color'];
  var backgroundColor = cssStyle['background-color'];
  var gradient = cssStyle['gradient'];
  
  if (backgroundColor && dataObj)
    dataObj.addCategory(backgroundColor);
  else if (patternColor && dataObj)
    dataObj.addCategory(patternColor);
  
  var opacity;
  if (cssStyle['opacity']) {
    opacity = parseFloat(cssStyle['opacity']);
  } else {
    if (styleType == DvtThematicMapParser.ELEM_GRADUATED_SYMBOL) 
      opacity = DvtMapDataMarker.DEFAULT_MARKER_ALPHA;
    else
      opacity = 1;
  }
  
  if (dataObj)  
    dataObj.setDatatipColor(backgroundColor ? backgroundColor : patternColor);
  
  // handle custom svg where color is set by user
  if (styleType == DvtThematicMapParser.ELEM_GRADUATED_SYMBOL && DvtMarker.isBuiltInShape(displayable.getType())) {
    displayable.setStroke(new DvtSolidStroke(DvtMapDataMarker.DEFAULT_MARKER_STROKE_COLOR, DvtMapDataMarker.DEFAULT_MARKER_ALPHA, 
                                             DvtMapDataMarker.DEFAULT_MARKER_STROKE_WIDTH));
                                             
    if (gradient == 'true' && backgroundColor)
      displayable.setFill(new DvtMarkerGradient.createMarkerGradient(backgroundColor, displayable, opacity));
    else if (pattern)
      displayable.setFill(new DvtPatternFill(pattern, patternColor, backgroundColor));
    else if (backgroundColor)
      displayable.setFill(new DvtSolidFill(backgroundColor, opacity));  
    else
      displayable.setFill(new DvtSolidFill(DvtMapDataMarker.DEFAULT_MARKER_COLOR, opacity));
  } 
  else if (styleType == DvtThematicMapParser.ELEM_COLOR_STYLES) {  
    var borderColor = cssStyle['border-color'] ? cssStyle['border-color'] : DvtMapArea._DEFAULT_STROKE_COLOR;
    var borderWidth = cssStyle['border-width'] ? parseFloat(cssStyle['border-width'].substring(0, cssStyle['border-width'].indexOf('px'))) 
                                                : DvtMapArea._DEFAULT_STROKE_WIDTH;
    displayable.setStroke(new DvtSolidStroke(borderColor, DvtMapArea._DEFAULT_STROKE_ALPHA, borderWidth));
    
    if (pattern) {
      displayable.savePatternFill(new DvtPatternFill(pattern, patternColor, backgroundColor));
    }
    else if (backgroundColor)
      displayable.setFill(new DvtSolidFill(backgroundColor, opacity));  
    else
      displayable.setFill(new DvtSolidFill(DvtMapArea._DEFAULT_FILL_COLOR, opacity));
  } 
}

var DvtThematicMapJsonToXmlConverter = {};

DvtObj.createSubclass(DvtThematicMapJsonToXmlConverter, DvtObj, "DvtThematicMapJsonToXmlConverter");

DvtThematicMapJsonToXmlConverter.convertJsonToXml = function (data, options, bCanvas) {
  var xml = '<md>';
  xml += this.getMapPropertiesElement(options, bCanvas);
  xml += this.getCustomBasemapMetadata(options);
  xml += this.getLayers(data, options, bCanvas);
  //ToDo legend
  xml += '</md>';
  return xml;
}

DvtThematicMapJsonToXmlConverter.getMapPropertiesElement = function (jsonObj, bCanvas) {
  var xml = '<mapProperties ';
  xml += this.getMapPropertiesAttributes(jsonObj);
  //ToDo resources?
  //ToDo hover and selected styles
  xml += '<regionLayer ';
  if (jsonObj['areaLayerStyle'])
    xml += 'inlineStyle=\"' + jsonObj['areaLayerStyle'] + "\" ";
  if (jsonObj['hoverStyle'])
    xml += 'hoverStyle=\"' + jsonObj['hoverStyle'] + "\" ";
  if (jsonObj['selectStyle'])
    xml += 'selectStyle=\"' + jsonObj['selectStyle'] + "\" ";
  xml += '/>';
  //ToDo markerStyle
  xml += '<markerStyle inlineStyle=\"' + jsonObj['markerStyle']['textStyle'] + '\"/>';
  xml += this.getMapHierarchyElement(jsonObj, bCanvas);
  xml += '</mapProperties>';
  return xml;
}

DvtThematicMapJsonToXmlConverter.getMapPropertiesAttributes = function (jsonObj) {
  var xml = '';
  if (jsonObj['animationDuration'])
    xml = xml + 'animationDuration=\"' + (jsonObj['animationDuration']/1000) + '\"';
  if (jsonObj['animationOnDisplay'])
    xml = xml + ' animationOnDisplay=\"' + jsonObj['animationOnDisplay'] + '\"';
  if (jsonObj['animationOnMapChange'])
    xml = xml + ' animationOnMapChange=\"' + jsonObj['animationOnMapChange'] + '\"';
  if (jsonObj['basemap'])
    xml = xml + ' baseMapName=\"' + jsonObj['basemap'] + '\"';
  if (jsonObj['source'])
    xml = xml + ' source=\"' + jsonObj['source'] + '\"';
  if (jsonObj['tooltipDisplay'])
    xml = xml + ' displayTooltips=\"' + jsonObj['tooltipDisplay'] + '\"';
  if (jsonObj['zooming'])
    xml = xml + ' zooming=\"' + jsonObj['zooming'] + '\"';
  if (jsonObj['panning'])
    xml = xml + ' panning=\"' + jsonObj['panning'] + '\"';
  if (jsonObj['initialZooming'])
    xml = xml + ' initialZooming=\"' + jsonObj['initialZooming'] + '\"';
  
  // For AMX control panel is always hidden and background is always transparent
  xml += ' inlineStyle=\"background-color:transparent;fill-type:solid;\" controlPanelBehavior=\"hidden\">';

  return xml;
}

DvtThematicMapJsonToXmlConverter.getMapHierarchyElement = function (jsonObj, bCanvas) {
  var xml = '<mapHierarchy>';
  var hierarchy = jsonObj['layers'];
  if(hierarchy) {
    for (var i=0; i<hierarchy.length; i++) {
    
      xml = xml + '<' + hierarchy[i]['type'] +'Layer ';
      if (hierarchy[i]['layer'])
        xml = xml + 'layerName=\"' + hierarchy[i]['layer'] + '\"';
      if (hierarchy[i]['labelDisplay'])
        xml = xml + ' labelDisplay=\"' + hierarchy[i]['labelDisplay'] + '\"';
      if (hierarchy[i]['labelStyle'])
        xml = xml + ' labelStyle=\"' + hierarchy[i]['labelStyle'] + '\"';
      if (hierarchy[i]['labelType'])
        xml = xml + ' labelType=\"' + hierarchy[i]['labelType'] + '\"';
      if (hierarchy[i]['animationDuration'] && !bCanvas)
        xml = xml + ' animationDuration=\"' + hierarchy[i]['animationDuration'] + '\"';
      if (hierarchy[i]['animationOnLayerChange'] && !bCanvas) {
        xml = xml + ' animationOnLayerChange=\"' + hierarchy[i]['animationOnLayerChange'] + '\"';
      } else {
         xml = xml + ' animationOnLayerChange=\"none\"';
      }
      xml += '/>';  
    }
  }
  xml += '</mapHierarchy>';
  return xml;
}

DvtThematicMapJsonToXmlConverter.getCustomBasemapMetadata = function (options) {
  if (options['customBasemap'])
    return options['customBasemap'];
  return '';
}

DvtThematicMapJsonToXmlConverter.getLayers = function (jsonObj, options, bCanvas) {
  var styles = [];
  var styleIdCounter = 0;
  var xml = '<layers>'
  var dataLayers = jsonObj['dataLayers'];
  for (var i=0; i<dataLayers.length; i++) {
    xml += this.getLayerElement(styles, styleIdCounter, dataLayers[i], options, options['basemap'], bCanvas);
  }
  xml += '</layers>'
  return xml;
}

DvtThematicMapJsonToXmlConverter.getLayerElement = function (styles, styleIdCounter, jsonObj, options, basemap, bCanvas) {
  var xml = '<layer';
  xml += this.getLayerAttributes(jsonObj, bCanvas);
  xml += '>';
  xml += this.getDataAndStyleElements(styles, styleIdCounter, jsonObj, options, basemap);
  xml += '</layer>';
  return xml
}

DvtThematicMapJsonToXmlConverter.getLayerAttributes = function (jsonObj, bCanvas) {
  var xml = '';
  if (jsonObj[' animationDuration'] && !bCanvas)
    xml = xml + 'animationDuration=\"' + (jsonObj['animationDuration']/1000) + '\"';
  if (jsonObj['animationOnDataChange'] && !bCanvas)
    xml = xml + ' animationDataChange=\"' + jsonObj['animationOnDataChange'] + '\"';
  else
    xml = xml + ' animationDataChange=\"none\"';
  if (jsonObj['id'])
    xml = xml + ' clientId=\"' + jsonObj['id'] + '\"';
  if (jsonObj['associatedLayer'])
    xml = xml + ' id=\"' + jsonObj['associatedLayer'] + '\"';
  if (jsonObj['dataSelection'])
    xml = xml + ' selectionMode=\"' + jsonObj['dataSelection'] + '\"';
  if (jsonObj['emptyText'])
    xml = xml + ' emptyText=\"' + jsonObj['emptyText'] + '\"';
  if (jsonObj['isolatedRowKey'])
    xml = xml + ' isolatedRowKey=\"' + jsonObj['isolatedRowKey'] + '\"';
  if (jsonObj['associatedWith'])
    xml = xml + ' showWith=\"' + jsonObj['associatedWith'] + '\"';

  return xml;
}

DvtThematicMapJsonToXmlConverter.getDataAndStyleElements = function (styles, styleIdCounter, jsonObj, options, basemap) {

  var styleId = null;
  var disclosed = jsonObj['disclosedRowKeys'];
  var selected = jsonObj['selectedRowKeys'];
  
  var xml = '<data>'
  var data = jsonObj['data'];
  var oldType = null;
  for (var i=0; i<data.length; i++) {
    var type = data[i]['type'];
    if (oldType != type) {
      if (type=='area') {
        styleId = "area" + styleIdCounter;
        styleIdCounter++;
        styles.push("<colorStyles id=\""+styleId+"\"/>");
      }
      else if (type =='marker') {
        styleId = "marker" + styleIdCounter;
        styleIdCounter++;
        styles.push("<graduatedSymbol id=\""+styleId+"\"/>");
      }
      oldType = type;
    }
    xml += '<row ';
    xml = xml + 'clientId=\"' + data[i]['clientId'] + '\" ';
    xml = xml + 'styleId=\"' + styleId + '\" ';
    xml = xml + 'rowKey=\"' + data[i]['_rowKey'] + '\" ';
    
    if (disclosed && disclosed.indexOf(data[i]['_rowKey']) != -1) 
      xml = xml + 'drilled=\"true\" '
    if (selected && selected.indexOf(data[i]['_rowKey']) != -1) 
      xml = xml + 'selected=\"true\" '
      
    if (data[i]['location'])
      xml = xml + 'id=\"' + data[i]['location'] + '\" '; 
    if (data[i]['labelDisplay'])
      xml = xml + styleId + '_labelDisplay=\"' + data[i]['labelDisplay'] + '\" '; 
    if (data[i]['label'])
      xml = xml + styleId + '_label=\"' + data[i]['label'] + '\" '; 
    if (data[i]['labelStyle'])
      xml = xml + styleId + '_labelStyle=\"' + data[i]['labelStyle'] + '\" '; 
    if (data[i]['shortDesc'])
      xml = xml + styleId + '_shortDesc=\"' + data[i]['shortDesc'] + '\" '; 
    if (data[i]['labelPosition'])
      xml = xml + styleId + '_labelPosition=\"' + data[i]['labelPosition'] + '\" '; 
    if (data[i]['x'] && data[i]['y']) {
      // if x,y values passed, project according to base map
      var projectedPoint = DvtThematicMapProjections.project(data[i]['x'], data[i]['y'], basemap);
      xml = xml + 'x=\"' + projectedPoint.x + '\" ' + 'y=\"' + projectedPoint.y + '\" ';  
    }
   
    if (data[i]['width'])
      xml = xml + 'width=\"' + data[i]['width'] + '\" '; 
    if (data[i]['height'])
      xml = xml + 'height=\"' + data[i]['height'] + '\" '; 
    if (data[i]['scaleX'])
      xml = xml + styleId + '_scaleX=\"' + data[i]['scaleX'] + '\" '; 
    if (data[i]['scaleY'])
      xml = xml + styleId + '_scaleY=\"' + data[i]['scaleY'] + '\" '; 
    if (data[i]['shape'])
      xml = xml + styleId + '_shapeType=\"' + data[i]['shape'] + '\" '; 
    // custom marker attributes
    if (data[i]['source'])
      xml = xml + 'source=\"' + data[i]['source'] + '\" '; 
    if (data[i]['sourceHover'])
      xml = xml + 'sourceHover=\"' + data[i]['sourceHover'] + '\" '; 
    if (data[i]['sourceSelected'])
      xml = xml + 'sourceSelected=\"' + data[i]['sourceSelected'] + '\" '; 
    if (data[i]['sourceHoverSelected'])
      xml = xml + 'sourceHoverSelected=\"' + data[i]['sourceHoverSelected'] + '\" '; 
      
    if (data[i]['action']) {
      xml += 'hasAction=\"true\" ';
      xml += 'action=\"' + data[i]['action'] +'\" ';
    }
      
    //Set inlineStyle
    xml += this.getDataItemInlineStyle(styleId, data[i], options);
      
    xml += '/>';
  }
  xml += '</data><styles>';
   for (var j=0; j<styles.length; j++)
    xml +=styles[j];
  xml += '</styles>';
  return xml;
}

DvtThematicMapJsonToXmlConverter.getDataItemInlineStyle = function (styleId, jsonObj, options) {
  var xml = styleId + '_inlineStyle=\"';
  
  if (jsonObj['opacity'])
    xml = xml + 'opacity:' + jsonObj['opacity'] + ';';
  else if (jsonObj['type'] == 'marker' && options['markerStyle']['opacity'] != undefined)
   xml = xml + 'opacity:' + options['markerStyle']['opacity'] + ';';
   
  if (jsonObj['color'] == undefined && jsonObj['type'] == 'marker' && options['markerStyle']['background-color'] != undefined)
    jsonObj['color'] = options['markerStyle']['background-color'];
       
  if (jsonObj['gradientEffects'] == 'auto') {
    xml = xml + "gradient:true;";
    xml = xml + "background-color:" + jsonObj['color'] +';';
  } else if (jsonObj['fillPattern']) {
    xml = xml + "pattern:" + jsonObj['fillPattern'] + ';';
    xml = xml + "pattern-color:" + jsonObj['color'] + ';';
    xml = xml + "background-color:#ffffff;";
  } else {
    xml = xml + "background-color:" + jsonObj['color'] +";";
  }
  
  if (options['areaStyles']['area']['border-color'])
    xml = xml + "border-color:" + options['areaStyles']['area']['border-color'] +";";
  if (options['areaStyles']['area']['border-width'])
    xml = xml + "border-width:" + options['areaStyles']['area']['border-width'] +";";
  
  xml += '\"';
  return xml;
}

var DvtThematicMapProjections = {};

DvtObj.createSubclass(DvtThematicMapProjections, DvtObj, "DvtThematicMapProjections");

DvtThematicMapProjections._VIEWPORT_BOUNDS = new DvtRectangle(0, 0, 800, 500);
DvtThematicMapProjections._RADIUS = 6378206.4;

DvtThematicMapProjections._NEW_ZEALAND_RECT = new DvtRectangle(163,  - 49, 17, 17);
DvtThematicMapProjections._NEW_ZEALAND_BOUNDS = new DvtRectangle(163,  - 49, 17, 17);
DvtThematicMapProjections._AFRICA_BOUNDS = new DvtRectangle( - 17.379205428479874,  - 37.201510854305546, 68.66391442808313, 77.50071544582713);
DvtThematicMapProjections._ASIA_BOUNDS = new DvtRectangle( - 0.8436866097568272,  - 0.7626456732012923, 1.8336308036296942, 1.5748427214611724);
DvtThematicMapProjections._AUSTRALIA_BOUNDS = new DvtRectangle(113.29667079927977,  - 52.89550592498755, 65.25257389065216, 42.123114617504626);
DvtThematicMapProjections._EUROPE_BOUNDS = new DvtRectangle( - 0.47944476148667076,  - 0.0014669405958800579, 0.7364925893845453, 0.6293972741802124);
DvtThematicMapProjections._N_AMERICA_BOUNDS = new DvtRectangle( - 0.6154469465354344,  - 0.24589767758847714, 1.2448236795108683, 1.2631535127174947);
DvtThematicMapProjections._S_AMERICA_BOUNDS = new DvtRectangle( - 80.60817722658722,  - 60.796273249672765, 46.608687602908056, 66.96595767361796);
DvtThematicMapProjections._APAC_BOUNDS = new DvtRectangle(68.20516856593524,  - 52.89892708045518, 111.65739821771903, 116.55460214469134);
DvtThematicMapProjections._EMEA_BOUNDS = new DvtRectangle( - 24.543831069368586,  - 37.202500659225905, 204.54283106936856, 164.9634493690208);
DvtThematicMapProjections._L_AMERICA_BOUNDS = new DvtRectangle( - 117.12451221229134,  - 54.95921623126266, 82.33223251442891, 87.67786623127876);
DvtThematicMapProjections._USA_CANADA_BOUNDS = new DvtRectangle( - 0.6154656300926513, 0.0507209798775865, 1.0153104799231851, 0.966537441082997);
DvtThematicMapProjections._WORLD_BOUNDS = new DvtRectangle( - 171.9,  - 62.6, 349.8, 150.8);
DvtThematicMapProjections._ALASKA1_RECT = new DvtRectangle(172, 51, 8, 3);
DvtThematicMapProjections._ALASKA2_RECT = new DvtRectangle( - 180, 51, 51, 21);
DvtThematicMapProjections._HAWAII_RECT = new DvtRectangle( - 178.5, 18.9, 35, 11);
DvtThematicMapProjections._USA_RECT = new DvtRectangle( - 124.8, 24.4, 58, 25.5);
DvtThematicMapProjections._ALASKA_BOUNDS = new DvtRectangle( - 187.5517578125, 59.82610321044922, 57.562225341796875, 43.83738708496094);
DvtThematicMapProjections._HAWAII_BOUNDS = new DvtRectangle( - 160.23606872558594, 18.91549301147461, 5.4374847412109375, 3.3189010620117188);
DvtThematicMapProjections._USA_BOUNDS = new DvtRectangle( - 2386803.25,  - 1183550.5, 4514111, 2908402);

DvtThematicMapProjections._ROBINSON_COORDINATES = [[1, 0], [0.9986, 0.0314], [0.9954, 0.0629], [0.9900, 0.0943], [0.9822, 0.1258], [0.9730, 0.1572], [0.9600, 0.1887], [0.9427, 0.2201], [0.9216, 0.2515], [0.8962, 0.2826], [0.8679, 0.3132], [0.8350, 0.3433], [0.7986, 0.3726], [0.7597, 0.4008], [0.6732, 0.4532], [0.6213, 0.4765], [0.5722, 0.4951], [0.5322, 0.5072]];

/**
 * @returns {DvtPoint}
 */
DvtThematicMapProjections.project = function (x, y, basemap) {
  var point;
  switch (basemap) {
    case 'africa':
      point = DvtThematicMapProjections._getAffineProjection(DvtThematicMapProjections._AFRICA_BOUNDS, null, DvtThematicMapProjections._getMercatorProjection(x, y));
      break;
    case 'asia':
      point = DvtThematicMapProjections._getAffineProjection(DvtThematicMapProjections._ASIA_BOUNDS, DvtThematicMapProjections.toRadians(5), DvtThematicMapProjections._getAlbersEqualAreaConicProjection(40, 95, 20, 60, x, y));
      break;
    case 'australia':
      point = DvtThematicMapProjections._getAustraliaProjection(x, y);
      break;
    case 'europe':
      point = DvtThematicMapProjections._getAffineProjection(DvtThematicMapProjections._EUROPE_BOUNDS, DvtThematicMapProjections.toRadians(10), DvtThematicMapProjections._getAlbersEqualAreaConicProjection(35, 25, 40, 65, x, y));
      break;
    case 'northAmerica':
      point = DvtThematicMapProjections._getAffineProjection(DvtThematicMapProjections._N_AMERICA_BOUNDS, null, DvtThematicMapProjections._getAlbersEqualAreaConicProjection(23,  - 96, 20, 60, x, y));
      break;
    case 'southAmerica':
      point = DvtThematicMapProjections._getAffineProjection(DvtThematicMapProjections._S_AMERICA_BOUNDS, DvtThematicMapProjections.toRadians(5), new DvtPoint(x, y));
      break;
    case 'apac':
      point = DvtThematicMapProjections._getAffineProjection(DvtThematicMapProjections._APAC_BOUNDS, null, DvtThematicMapProjections._getMercatorProjection(x, y));
      break;
    case 'emea':
      point = DvtThematicMapProjections._getAffineProjection(DvtThematicMapProjections._EMEA_BOUNDS, null, DvtThematicMapProjections._getMercatorProjection(x, y));
      break;
    case 'latinAmerica':
      point = DvtThematicMapProjections._getAffineProjection(DvtThematicMapProjections._L_AMERICA_BOUNDS, null, new DvtPoint(x, y));
      break;
    case 'usaAndCanada':
      point = DvtThematicMapProjections._getAffineProjection(DvtThematicMapProjections._USA_CANADA_BOUNDS, null, DvtThematicMapProjections._getAlbersEqualAreaConicProjection(23,  - 96, 20, 60, x, y));
      break;
    case 'worldRegions':
      point = DvtThematicMapProjections._getWorldProjection(x, y);
      break;
    case 'usa':
      point = DvtThematicMapProjections._getUSAProjection(x, y);
      break;
    case 'world':
      point = DvtThematicMapProjections._getWorldProjection(x, y);
      break;
    default :
      break;
  }
  if (point)
    return new DvtPoint(point.x*10, point.y*10); // multiply by 10 because basemaps are 10x bigger
  else
    return new DvtPoint(x, y);
}

/**
 *
 */
DvtThematicMapProjections._getUSAProjection = function (x, y) {
  var viewPortTransform
  if (DvtThematicMapProjections._ALASKA1_RECT.containsPoint(x, y) || DvtThematicMapProjections._ALASKA2_RECT.containsPoint(x, y)) {
    viewPortTransform = DvtThematicMapProjections._getViewPortTransformation(DvtThematicMapProjections._ALASKA_BOUNDS, new DvtRectangle( - 75, 350, 240, 150));
    return DvtThematicMapProjections._applyAffineTransform(viewPortTransform, DvtThematicMapProjections._getMercatorProjection(x, y));
  }
  else if (DvtThematicMapProjections._HAWAII_RECT.containsPoint(x, y)) {
    viewPortTransform = DvtThematicMapProjections._getViewPortTransformation(DvtThematicMapProjections._HAWAII_BOUNDS, new DvtRectangle(165, 400, 100, 100));
    return DvtThematicMapProjections._applyAffineTransform(viewPortTransform, new DvtPoint(x, y));
  }
  else if (DvtThematicMapProjections._USA_RECT.containsPoint(x, y)) {
    viewPortTransform = DvtThematicMapProjections._getViewPortTransformation(DvtThematicMapProjections._USA_BOUNDS, DvtThematicMapProjections._VIEWPORT_BOUNDS);
    return DvtThematicMapProjections._applyAffineTransform(viewPortTransform, DvtThematicMapProjections._getOrthographicProjection(new DvtPoint( - 95, 36), x, y));
  }
  return new DvtPoint(x, y);
}

/**
 *
 */
DvtThematicMapProjections._getWorldProjection = function (x, y) {
  var viewPortTransform = DvtThematicMapProjections._getViewPortTransformation(DvtThematicMapProjections._WORLD_BOUNDS, DvtThematicMapProjections._VIEWPORT_BOUNDS);
  return DvtThematicMapProjections._applyAffineTransform(viewPortTransform, DvtThematicMapProjections._getRobinsonProjection(x, y));
}

/**
 *
 */
DvtThematicMapProjections._getAustraliaProjection = function (x, y) {
  var viewPortTransform;
  if (DvtThematicMapProjections._NEW_ZEALAND_RECT.containsPoint(x, y))
    viewPortTransform = DvtThematicMapProjections._getViewPortTransformation(DvtThematicMapProjections._NEW_ZEALAND_BOUNDS, new DvtRectangle(500, 200, 200, 200));
  else 
    viewPortTransform = DvtThematicMapProjections._getViewPortTransformation(DvtThematicMapProjections._AUSTRALIA_BOUNDS, new DvtRectangle(0, 0, 800, 500));

  return DvtThematicMapProjections._applyAffineTransform(viewPortTransform, DvtThematicMapProjections._getMercatorProjection(x, y));
}

/**
 * Matrix to concat before projecting
 */
DvtThematicMapProjections._getAffineProjection = function (mapBounds, rotRadians, point) {
  var viewPortTransform = DvtThematicMapProjections._getViewPortTransformation(mapBounds, DvtThematicMapProjections._VIEWPORT_BOUNDS);
  if (rotRadians) {
    var rotMatrix = new DvtMatrix();
    rotMatrix.rotate(rotRadians);
    viewPortTransform = DvtThematicMapProjections._concatAffineTransforms(viewPortTransform,rotMatrix);
  }
  return viewPortTransform.transformPoint(point);
}

/**
 * @param latOfOrigin latitude for the origin, in degrees
 * @param lonOfOrigin longitude for the origin, in degrees
 * @param sP1 standard parallel 1, in degrees
 * @param sP2 standard parallel 2, in degrees
 * @returns {DvtPoint}
 */
DvtThematicMapProjections._getAlbersEqualAreaConicProjection = function (latOfOrigin, lonOfOrigin, sP1, sP2, x, y) {
  var lambda0 = DvtThematicMapProjections.toRadians(lonOfOrigin);
  var phi0 = DvtThematicMapProjections.toRadians(latOfOrigin);
  sP1 = DvtThematicMapProjections.toRadians(sP1);
  sP2 = DvtThematicMapProjections.toRadians(sP2);

  var n = 0.5 * (Math.sin(sP1) + Math.sin(sP2));
  var c = Math.pow((Math.cos(sP1)), 2) + (2 * n * Math.sin(sP1));

  var rho0 = c - (2 * n * Math.sin(phi0));
  rho0 = Math.sqrt(rho0) / n;

  var lambda = DvtThematicMapProjections.toRadians(x);
  var phi = DvtThematicMapProjections.toRadians(y);

  var theta = n * (lambda - lambda0);

  var rho = c - (2 * n * Math.sin(phi));
  rho = Math.sqrt(rho) / n;

  var pX = rho * Math.sin(theta);
  var pY = rho0 - (rho * Math.cos(theta));

  return new DvtPoint(pX, pY);
}

// Assumes center is 0,0
DvtThematicMapProjections._getMercatorProjection = function (x, y) {
  var pY = Math.log(Math.tan(0.25 * Math.PI + 0.5 * DvtThematicMapProjections.toRadians(y)));
  return new DvtPoint(x, DvtThematicMapProjections.toDegrees(pY));
}

DvtThematicMapProjections._getOrthographicProjection = function (center, x, y) {
  var radX = DvtThematicMapProjections.toRadians(x);
  var radY = DvtThematicMapProjections.toRadians(y);
  var centerX = DvtThematicMapProjections.toRadians(center.x);
  var centerY = DvtThematicMapProjections.toRadians(center.y);
  var newX = Math.cos(radY) * Math.sin(radX - centerX) * DvtThematicMapProjections._RADIUS;
  var newY = Math.cos(centerY) * Math.sin(radY) - Math.sin(centerY) * Math.cos(radY) * Math.cos(radX - centerX) * DvtThematicMapProjections._RADIUS;

  return new DvtPoint(newX, newY);
}

// Assumes center is 0,0
DvtThematicMapProjections._getRobinsonProjection = function (x, y) {
  var ycriteria = Math.floor(Math.abs(y) / 5);
  if (ycriteria >= DvtThematicMapProjections._ROBINSON_COORDINATES.length - 1)
    ycriteria = DvtThematicMapProjections._ROBINSON_COORDINATES.length - 2;

  var yInterval = (Math.abs(y) - ycriteria * 5) / 5;

  var xLength = DvtThematicMapProjections._ROBINSON_COORDINATES[ycriteria + 1][0] - DvtThematicMapProjections._ROBINSON_COORDINATES[ycriteria][0];
  var yLength = DvtThematicMapProjections._ROBINSON_COORDINATES[ycriteria + 1][1] - DvtThematicMapProjections._ROBINSON_COORDINATES[ycriteria][1];

  var newX = x * (DvtThematicMapProjections._ROBINSON_COORDINATES[ycriteria][0] + yInterval * xLength);
  var newY = (DvtThematicMapProjections._ROBINSON_COORDINATES[ycriteria][1] + yInterval * yLength);

  if (y < 0)
    newY =  - 1 * newY;

  return new DvtPoint(newX, newY * 180);
}

DvtThematicMapProjections._applyAffineTransform = function (matrix, point) {
  return new DvtPoint(point.x*matrix.getA()+matrix.getTx(), point.y*matrix.getD()+matrix.getTy());
}

DvtThematicMapProjections._concatAffineTransforms = function (transform1, transform2) { 
  var t1A = transform1.getA();
  var a = transform2.getA() * t1A;
  var b = transform2.getB() * t1A;
  var tx = transform1.getTx() + transform2.getTx() * t1A;
  
  var t1D = transform1.getD();
  var c = transform2.getC() * t1D;
  var d = transform2.getD() * t1D;
  var ty = transform1.getTy() + transform2.getTy() * t1D;

  return new DvtMatrix(null,a,b,c,d,tx,ty);
}

/**
 * @returns {DvtMatrix}
 */
DvtThematicMapProjections._getViewPortTransformation = function (mapBound, deviceView) {
  var i = deviceView.x;
  var j = deviceView.y;

  var d = mapBound.w;
  var d1 = mapBound.h;
  var d2 = 0;
  var d3 = deviceView.w / d;
  var d4 = deviceView.h / d1;
  d2 = (d3 <= d4) ? d3 : d4;
  var d5 = i - mapBound.x * d2;
  var d6 = j + mapBound.y * d2;
  d5 += (deviceView.w - d * d2) / 2;
  d6 += deviceView.h - (deviceView.h - d1 * d2) / 2;

  return new DvtMatrix(null, d2, 0, 0, -d2, d5, d6);
}

DvtThematicMapProjections.toRadians = function (x) {
  return x * (Math.PI / 180);
}

DvtThematicMapProjections.toDegrees = function (x) {
  return x * (180 / Math.PI);
}
