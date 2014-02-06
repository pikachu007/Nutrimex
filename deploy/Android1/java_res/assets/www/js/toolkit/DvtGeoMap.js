var DvtGeographicMap = function (callback, callbackObj) {
  this.Init(callback, callbackObj);
}

DvtObj.createSubclass(DvtGeographicMap, DvtObj, "DvtGeographicMap");

/** @private */
// TODO change to supported map providers
DvtGeographicMap.MAP_PROVIDER_ORACLE = "oraclemaps";
DvtGeographicMap.MAP_PROVIDER_GOOGLE = "googlemaps";
DvtGeographicMap.MAP_VIEWER_URL = "http://elocation.oracle.com/mapviewer";
DvtGeographicMap.BASE_MAP = "ELOCATION_MERCATOR.WORLD_MAP";

DvtGeographicMap.prototype.Init = function (callback, callbackObj) {
  this._callback = callback;
  this._callbackObj = callbackObj;
  // by default, use google map as the provider
  this.mapProvider = DvtGeographicMap.MAP_PROVIDER_GOOGLE;
  this.mapViewerUrl = DvtGeographicMap.MAP_VIEWER_URL;
  this.baseMap = DvtGeographicMap.BASE_MAP;
  this.selection = [];
  this.initialSelectionApplied = false;     // apply selectedRowKeys on a new instance only
  this.screenReaderMode = false;
}

/**
 * Returns a new instance of DvtGeographicMap.
 * @param {string} callback The function that should be called to dispatch component events.
 * @param {object} callbackObj The optional object instance on which the callback function is defined.
 * @param {object} options The object containing options specifications for this component.
 * @return {DvtGeographicMap}
 */
DvtGeographicMap.newInstance = function (callback, callbackObj, options) {
  var map = new DvtGeographicMap(callback, callbackObj);
  map.setOptions(options);
  return map;
}

/**
 * Returns the map provider
 * @return {string}
 */
DvtGeographicMap.prototype.getMapProvider = function () {
  return this.mapProvider;
}

/**
 * Specifies the map provider
 * @param {string} provider The map provider.
 */
DvtGeographicMap.prototype.setMapProvider = function (provider) {
  // TODO change to supported map providers
  if (provider == DvtGeographicMap.MAP_PROVIDER_ORACLE || 
    provider == DvtGeographicMap.MAP_PROVIDER_GOOGLE)
  this.mapProvider = provider;
}

/**
 * Returns the map viewer url
 * @return {string}
 */
DvtGeographicMap.prototype.getMapViewerUrl = function () {
  return this.mapViewerUrl;
}

/**
 * Specifies the map viewer url
 * @param {string} mapViewerUrl The map viewer url
 */
DvtGeographicMap.prototype.setMapViewerUrl = function (url) {
  this.mapViewerUrl = url;
}

/**
 * Returns the base map
 * @return {string}
 */
DvtGeographicMap.prototype.getBaseMap = function () {
  return this.baseMap;
}


/**
 * Specifies the base map for oracle maps
 * @param {string} baseMap The base map
 */
DvtGeographicMap.prototype.setBaseMap = function (baseMap) {
  this.baseMap = baseMap;
}

/**
 * Specifies the non-data options for this component.
 * @param {object} options The object containing options specifications for this component.
 * @protected
 */
DvtGeographicMap.prototype.setOptions = function (options) {
  this.Options = DvtGeographicMapDefaults.calcOptions(options);
}

/**
 * Returns the screenReaderMode
 * @return {boolean}
 */
DvtGeographicMap.prototype.getScreenReaderMode = function () {
  return this.screenReaderMode;
}

/**
 * Set the screen reader mode
 * @param {boolean} mode
 */
DvtGeographicMap.prototype.setScreenReaderMode = function (mode) {
  this.screenReaderMode = mode;
}

/**
 * Dispatches the event to the callback function.
 * @param {object} event The event to be dispatched.
 */
DvtGeographicMap.prototype.__dispatchEvent = function (event) {
  DvtEventDispatcher.dispatchEvent(this._callback, this._callbackObj, this, event);
}

/**
 * Renders the component with the specified data.  If no data is supplied to a component
 * that has already been rendered, the component will be rerendered to the specified size.
 * @param {object} mapCanvas The div to render the map.
 * @param {object} data The object containing data for this component.
 * @param {number} width The width of the component.
 * @param {number} height The height of the component.
 */
DvtGeographicMap.prototype.render = function (mapCanvas, data, width, height) {
  this.Data = data;
  this._width = width;
  this._height = height;
  
  DvtGeographicMapRenderer.render(this, mapCanvas, width, height);
}
/**
 * Default values and utility functions for chart versioning.
 * @class
 */
var DvtGeographicMapDefaults = new Object();

DvtObj.createSubclass(DvtGeographicMapDefaults, DvtObj, "DvtGeographicMapDefaults");

/**
 * Defaults for version 1.
 */ 
DvtGeographicMapDefaults.VERSION_1 = {
  'mapOptions': {
    'mapType': "ROADMAP",
    'zoomLevel': "14",
    'centerX': "-98.57",
    'centerY': "39.82",
    'doubleClickBehavior': "zoomin"
  }
};

/**
 * Combines the user options with the defaults for the specified version.  Returns the
 * combined options object.  This object will contain internal attribute values and
 * should be accessed in internal code only.
 * @param {object} userOptions The object containing options specifications for this component.
 * @return {object} The combined options object.
 */
DvtGeographicMapDefaults.calcOptions = function(userOptions) {
  var defaults = DvtGeographicMapDefaults._getDefaults(userOptions);

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
DvtGeographicMapDefaults._getDefaults = function(userOptions) {
  // Note: Version checking will eventually get added here
  // Note: Future defaults objects are deltas on top of previous objects
  return DvtJSONUtils.clone(DvtGeographicMapDefaults.VERSION_1);
}
/**
 * Renderer for DvtGeographicMap.
 * @class
 */
var DvtGeographicMapRenderer = new Object();

DvtObj.createSubclass(DvtGeographicMapRenderer, DvtObj, "DvtGeographicMapRenderer");

DvtGeographicMapRenderer.MAP_VIEWER_URL = "http://elocation.oracle.com/mapviewer";
DvtGeographicMapRenderer.ELOCATION_GEOCODER_URL = "http://elocation.oracle.com/elocation/jslib/oracleelocation.js";
DvtGeographicMapRenderer.DEFAULT_ORACLE_MARKER_IMG = "css/images/geomap/ball_ena.png";
DvtGeographicMapRenderer.DEFAULT_ORACLE_MARKER_HOVER_IMG = "css/images/geomap/ball_ovr.png";
DvtGeographicMapRenderer.DEFAULT_ORACLE_MARKER_SELECT_IMG = "css/images/geomap/ball_sel.png";
DvtGeographicMapRenderer.DEFAULT_GOOGLE_MARKER_IMG = "css/images/geomap/red-circle.png";
DvtGeographicMapRenderer.DEFAULT_GOOGLE_MARKER_HOVER_IMG = "css/images/geomap/ylw-circle.png";
DvtGeographicMapRenderer.DEFAULT_GOOGLE_MARKER_SELECT_IMG = "css/images/geomap/blu-circle.png";
DvtGeographicMapRenderer.MOUSE_OVER = "mouseover";
DvtGeographicMapRenderer.MOUSE_OUT = "mouseout";
DvtGeographicMapRenderer.CLICK = "click";
DvtGeographicMapRenderer.SEL_NONE = "none";
DvtGeographicMapRenderer.SEL_SINGLE = "single";
DvtGeographicMapRenderer.SEL_MULTIPLE = "multiple";

/**
 * Renders the geographic map in the specified area.
 * @param {DvtGeographicMap} map The geographic map being rendered.
 * @param {object} mapCanvas The div to render the map.
 * @param {number} width The width of the component.
 * @param {number} height The height of the component.
 */
DvtGeographicMapRenderer.render = function(map, mapCanvas, width, height) {
  var mapProvider = map.getMapProvider();
  if (mapProvider == DvtGeographicMap.MAP_PROVIDER_ORACLE)
    DvtGeographicMapRenderer.renderOracleMap(map, mapCanvas, width, height);
  else if (mapProvider == DvtGeographicMap.MAP_PROVIDER_GOOGLE)
    DvtGeographicMapRenderer.renderGoogleMap(map, mapCanvas, width, height);
  
  // For screen reader mode, render the marker shortDesc
  if (map.getScreenReaderMode() == true)
    DvtGeographicMapRenderer.renderMarkerText(map, mapCanvas);
}

/**
 * Renders the marker text for screen reader mode
 * @param {DvtGeographicMap} map The geographic map
 * @param {object} mapCanvas The div to render the map.
 */
DvtGeographicMapRenderer.renderMarkerText = function (map, mapCanvas) {
  var data = map.Data;
  var options = map.Options;
  var mapStr = "";
  if (options.mapOptions.shortDesc)
    mapStr = options.mapOptions.shortDesc + ": ";
    
  var dataLayers = data['dataLayers'];
  for (var i = 0; i<dataLayers.length; i++) {
    var dataLayer = dataLayers[i];
    var points = dataLayer['data'];
    for (var j = 0; j<points.length; j++) {
      mapStr += DvtGeographicMapRenderer.getTooltip(points[j]) + ", ";
    }
  }
  
  var length = mapStr.length;
  if (length >= 2)
    mapStr = mapStr.substring(0, length-2);
  
  var mapTextDiv = document.createElement('div');
  mapTextDiv.innerHTML = mapStr;
  mapCanvas.parentNode.appendChild(mapTextDiv);
}

/**
 * Renders the geographic map in the specified area.
 * @param {DvtGeographicMap} map The geographic map being rendered.
 * @param {object} mapCanvas The div to render the map.
 * @param {number} width The width of the component.
 * @param {number} height The height of the component.
 */
DvtGeographicMapRenderer.renderOracleMap = function(map, mapCanvas, width, height) {
  var options = map.Options;
  var data = map.Data;
  var baseURL = map.getMapViewerUrl();
  var baseMap = map.getBaseMap();
  var mapCenterLon = options.mapOptions.centerX;
  var mapCenterLat = options.mapOptions.centerY;
  var mapZoom = parseInt(options.mapOptions.zoomLevel);
  var doubleClickAction = "recenter";
  var _rendererInstance = this;
  var mpoint;
  if (!_rendererInstance['center'])
    mpoint = MVSdoGeometry.createPoint(parseFloat(mapCenterLon),parseFloat(mapCenterLat),8307);
  else
    mpoint = _rendererInstance['center'];

  var mapview = new MVMapView(mapCanvas, baseURL);
  mapview.addMapTileLayer(new MVBaseMap(baseMap));
  mapview.setCenter(mpoint);
  mapview.setZoomLevel(mapZoom);
  mapview.removeAllFOIs();  
  
  var initialZooming = true;
  if (!DvtGeographicMapRenderer._mapIncludesData(map)) {
    initialZooming = false;  
  }
  else if (options.mapOptions.initialZooming)
    initialZooming = options.mapOptions.initialZooming == "none" ? false : true;
  
  // define double click/tap action
  if (options.mapOptions['doubleClickBehavior'] !== undefined)
  {
    doubleClickAction = options.mapOptions['doubleClickBehavior'];
  }
  mapview.setDoubleClickAction(doubleClickAction);
  
  // set touchHold behaviour
  mapview.setTouchBehavior({touchHold: "mouse_over"});
  
  var recenter = function() 
  {
    options.mapOptions.initialZooming = 'none';
    _rendererInstance['center'] = mapview.getCenter();
  }

  var zoom = function(beforeLevel, afterLevel)
  {
    options.mapOptions.initialZooming = 'none';
    options.mapOptions.zoomLevel = '' + mapview.getZoomLevel();
  }

  mapview.attachEventListener(MVEvent.RECENTER, recenter);
  mapview.attachEventListener(MVEvent.ZOOM_LEVEL_CHANGE, zoom);
  
  // set the data layer
  DvtGeographicMapRenderer.setOracleMapDataLayer(map, mapview, data, initialZooming);
  
  mapview.display();
}

/**
 * Set the data layer on oracle map
 * @param {DvtGeographicMap} map The geographic map being rendered.
 * @param {object} mapview The MVMapView
 * @param {object} data The geographic map data object
 * @param {boolean} initialZooming Should the map zoom to the data points
 */
DvtGeographicMapRenderer.setOracleMapDataLayer = function(map, mapview, data, initialZooming) {
  var dataLayers = data['dataLayers'];
  var foiCount = 10000;
  var minX = null;
  var maxX = null;
  var minY = null;
  var maxY = null;
  for (var i = 0; i<dataLayers.length; i++) {
    var dataLayer = dataLayers[i];
    var points = dataLayer['data'];
    var selectedRowKeys = DvtGeographicMapRenderer._getSelectedRowKeys(map, dataLayer, i);
    for (var j = 0; j<points.length; j++) {
      var params = DvtGeographicMapRenderer.getParams(points[j], DvtGeographicMap.MAP_PROVIDER_ORACLE);
      var selMode = DvtGeographicMapRenderer.getSelMode(dataLayer);
      var selected = false;
  
      params['selMode'] = selMode;
      params['dataLayerIdx'] = dataLayer['idx'];
      
      if (selMode == DvtGeographicMapRenderer.SEL_SINGLE || selMode == DvtGeographicMapRenderer.SEL_MULTIPLE) {
        selected = (selectedRowKeys.indexOf(points[j]['_rowKey']) != -1) ? true : false;
      }
      if (points[j]['x'] && points[j]['y']) {         
        DvtGeographicMapRenderer.addPointFOI(map, mapview, points[j], foiCount++, params, selected);
        minX = DvtGeographicMapRenderer.getMin(minX, parseFloat(points[j]['x']));
        maxX = DvtGeographicMapRenderer.getMax(maxX, parseFloat(points[j]['x']));
        minY = DvtGeographicMapRenderer.getMin(minY, parseFloat(points[j]['y']));
        maxY = DvtGeographicMapRenderer.getMax(maxY, parseFloat(points[j]['y']));
        if (initialZooming && (i == dataLayers.length-1 && j == points.length-1))
          mapview.zoomToRectangle(MVSdoGeometry.createRectangle(minX, minY, maxX, maxY, 8307));
      } else if (points[j]['address']) {
        var addr = points[j]['address'];
        var callback = function(mapParams) {
          return function (gcResult) {
            if (gcResult.length == 0) {
              // no match
              console.log("No matching address found!");
            } else {
              // one or more matching address is found
              // we get the first one
              var addrObj = gcResult[0];                
              DvtGeographicMapRenderer.addPointFOI(map, mapview, addrObj, foiCount++, mapParams, selected);
              
              // This cannot be simply moved outside the loop because the callback may not be finished after the loop ends
              minX = DvtGeographicMapRenderer.getMin(minX, parseFloat(addrObj['x']));
              maxX = DvtGeographicMapRenderer.getMax(maxX, parseFloat(addrObj['x']));
              minY = DvtGeographicMapRenderer.getMin(minY, parseFloat(addrObj['y']));
              maxY = DvtGeographicMapRenderer.getMax(maxY, parseFloat(addrObj['y']));
              if (initialZooming)
                mapview.zoomToRectangle(MVSdoGeometry.createRectangle(minX, minY, maxX, maxY, 8307));
            }
          }
        }
		  
        var url = DvtGeographicMapRenderer.ELOCATION_GEOCODER_URL;
        var success = function(address, mapParams) {
          // need this closure since this is in a loop
          return function () {
            dvtm.geoCoderAPILoaded = true;
            var eloc = new OracleELocation();
            eloc.geocode(address, callback(mapParams));
          }
        };
		  
        var failure = function () {
          console.log("Failed to load GeoCoder API!");
        }
        if (!dvtm.geoCoderAPILoaded)
          dvtm.loadJS(url, success(addr, params));
        else {
               var eloc = new OracleELocation();
               eloc.geocode(addr, callback(params));
        }	
      }	
    }
  }
  map.initialSelectionApplied = true;   // initial selection has been applied by now
}

/**
 * Add point FOI to map
 * @param {DvtGeographicMap} map The geographic map being rendered.
 * @param {object} mapview The map view
 * @param {object} point The point
 * @param {string} pointId The point ID
 * @param {params} params The params for the point foi
 */
DvtGeographicMapRenderer.addPointFOI = function (map, mapview, point, pointId, params, selected) {
  var action = params['action'];
  var selMode = params['selMode'];
  var dataLayerIdx = params['dataLayerIdx'];
  var sourceImg;
  
  if (selected) {
    sourceImg = params ['sourceSelected'];
  }
  else {
    sourceImg = params['source'];
  }
  var geoPoint=MVSdoGeometry.createPoint(parseFloat(point['x']), parseFloat(point['y']), 8307);
  var pointFOI = MVFOI.createMarkerFOI(pointId.toString(), geoPoint, sourceImg);
  if (params['tooltip'])
    pointFOI.setInfoTip(params['tooltip']);
    
  // attach selection related event listeners
  if (selMode == DvtGeographicMapRenderer.SEL_SINGLE || selMode == DvtGeographicMapRenderer.SEL_MULTIPLE) {
    DvtGeographicMapRenderer.attachEventListener(map, pointFOI, DvtGeographicMapRenderer.MOUSE_OVER, params);
    DvtGeographicMapRenderer.attachEventListener(map, pointFOI, DvtGeographicMapRenderer.MOUSE_OUT, params);
    DvtGeographicMapRenderer.attachEventListener(map, pointFOI, DvtGeographicMapRenderer.CLICK, params);
    // if the point is selected, add it to the selection cache
    if (selected) {
      var selection = map['selection'][dataLayerIdx];
      if (selection === undefined) {
        selection = map['selection'][dataLayerIdx] = [];
      }
      pointFOI['selected'] = true;
      pointFOI['rowKey'] = params['rowKey'];
      pointFOI['dataLayerIdx'] = dataLayerIdx;
      selection.push(pointFOI);
    }
  } else if (action) {
    pointFOI.attachEventListener(MVEvent.MOUSE_CLICK, function() {
      var actionEvent = new DvtMapActionEvent(params['clientId'], params['rowKey'], action);
      actionEvent.addParam('dataLayerIdx', params['dataLayerIdx']);
      map.__dispatchEvent(actionEvent);
    }); 
  }
  mapview.addFOI(pointFOI);
}

/**
 * Attach event listeners
 * @param {DvtGeographicMap} map The geographic map being rendered.
 * @param {object} pointFOI The point FOI
 * @param {string} eventType The event type
 * @param {object} params The params for the point foi
 */
DvtGeographicMapRenderer.attachEventListener = function (map, pointFOI, eventType, params) {
  switch (eventType) {
    case DvtGeographicMapRenderer.MOUSE_OVER:
        pointFOI.attachEventListener(MVEvent.MOUSE_OVER, function() {
          if (!pointFOI.selected) {
            pointFOI.updateImageURL(params['sourceHover']);
          } else {
            pointFOI.updateImageURL(params['sourceHoverSelected']);	
          }
        });
        break;
    case DvtGeographicMapRenderer.MOUSE_OUT:
        pointFOI.attachEventListener(MVEvent.MOUSE_OUT, function() {
          if (!pointFOI.selected) {
            pointFOI.updateImageURL(params['source']);
          }
        });
        break;
    case DvtGeographicMapRenderer.CLICK:
        pointFOI.attachEventListener(MVEvent.MOUSE_CLICK, function() {
          var idx = params['dataLayerIdx'];
          var i;
          if (!map.selection[idx])
            map.selection[idx] = [];
          var selMode = params['selMode'];
          if (!pointFOI.selected) {
            var selection = map.selection[idx];
            if (selMode == DvtGeographicMapRenderer.SEL_SINGLE) {
              if (selection.length != 0) {
                for (i = 0; i < selection.length; i++) {
                  selection[i].updateImageURL(params['source']);
                  selection[i].selected = false;
                }
                map.selection[idx] = [];
              }
            }
            pointFOI.updateImageURL(params['sourceSelected']);
            pointFOI.selected = true;
            pointFOI.rowKey = params['rowKey'];
            pointFOI.dataLayerIdx = idx;
            map.selection[idx].push(pointFOI);
          } else {
            // deselect
            pointFOI.updateImageURL(params['sourceHover']);
            pointFOI.selected = false;
            // remove from selection
            if (selMode == DvtGeographicMapRenderer.SEL_SINGLE) {
              map.selection[idx] = [];
            } else if (selMode == DvtGeographicMapRenderer.SEL_MULTIPLE) {
              for (i = 0; i < map.selection[idx].length; i++) {
                if (pointFOI.getId() == map.selection[idx][i].getId()) {
                  map.selection[idx].splice(i, 1);
                  break;
                }
              }
            }
          }
          var evt = new DvtSelectionEvent(map.selection[idx]);
          evt.addParam('dataLayerIdx', idx);
          map.__dispatchEvent(evt);
        });
        break;
      default:
        break;
  }
}


/**
 * Renders the geographic map in the specified area.
 * @param {DvtGeographicMap} map The geographic map being rendered.
 * @param {object} mapCanvas The div to render the map.
 * @param {number} width The width of the component.
 * @param {number} height The height of the component.
 */
DvtGeographicMapRenderer.renderGoogleMap = function(map, mapCanvas, width, height)
{
  var options = map.Options;
  var data = map.Data;
  
  var mapTypeId = "";
 
  switch (options.mapOptions.mapType) 
  {
    case "ROADMAP":
      mapTypeId = google.maps.MapTypeId.ROADMAP;
      break;
    case "SATELLITE":
      mapTypeId = google.maps.MapTypeId.SATELLITE;
      break;
    case "HYBRID":
      mapTypeId = google.maps.MapTypeId.HYBRID;
      break;
    case "TERRAIN":
      mapTypeId = google.maps.MapTypeId.TERRAIN;
      break;
    default:
      mapTypeId = google.maps.MapTypeId.ROADMAP;
      break;
  }
  
  var initialZooming = true;
  if (!DvtGeographicMapRenderer._mapIncludesData(map)) 
  {
    initialZooming = false;
  }
  else if (options.mapOptions.initialZooming)
  {
    initialZooming = options.mapOptions.initialZooming == "none" ? false : true;
  } 
  var animationOnDisplay = "none";
  if (options.mapOptions.animationOnDisplay)
  {
    animationOnDisplay = options.mapOptions.animationOnDisplay;
  }
   
  var gmap;
  this._firstTime = false;
  
  if (initialZooming) 
  {
    // create empty instance of the google map without information 
    // about the map type - this prevents map from rendering immediately
    if(!map['_googlemap']){
      this._firstTime = true;
      // create google map instance on the map component
      map['_googlemap'] =  new google.maps.Map(mapCanvas);
    }
    gmap = map['_googlemap'];  
    gmap.setMapTypeId(mapTypeId);
  }
  else
  {  
    // resolve information required for the map without initial zooming
    var mapCenterLon = parseFloat(options.mapOptions.centerX);
    var mapCenterLat = parseFloat(options.mapOptions.centerY);  
    // create standard map which will be displayed imediately
    if(!map['_googlemap'])
    {
      this._firstTime = true;
      // prepare initial options   
      var mapOptions = new Object();
      mapOptions.mapTypeId = mapTypeId;
      // create google map instance on the map component
      map['_googlemap'] = new google.maps.Map(mapCanvas, mapOptions);
    }
    gmap = map['_googlemap'];
    gmap.setCenter(new google.maps.LatLng(mapCenterLat, mapCenterLon)); 
    gmap.setZoom(parseInt(options.mapOptions.zoomLevel));
  }
  // set the data layer
  DvtGeographicMapRenderer.setGoogleMapDataLayer(map, gmap, data, initialZooming, animationOnDisplay);
  
  // when map is initialized in hidden panel, we need to resize and recenter the map
  google.maps.event.addListenerOnce(gmap, 'idle', function() 
  {
    var center = gmap.getCenter();
    google.maps.event.trigger(gmap, 'resize');
    gmap.setCenter(center);
  });
}

/**
 * @param {object} gmap
 */
DvtGeographicMapRenderer.googleMapRenderEnd = function (gmap, map, points)
{  
  // process all resolved marker points and add them to the google map
  for(var i = 0; i < points.length; i++)
  {
    var point = points[i];
    if(point)
    {
      DvtGeographicMapRenderer.processGoogleMapDataPoint(map, gmap, point['latLng'], point['params'], point['animation'], point['initialZooming'], point['selected']);
    }
  } 

  // when bounds are selected zoom to them
  if(this._bounds)
  {
    var ne = this._bounds.getNorthEast();
    var sw = this._bounds.getSouthWest();
    // when northeast and southwest corners of the map bounds are equal
    // then zoom only to one point
    if(ne.equals(sw))
    {
      DvtGeographicMapRenderer.zoomToMarker(gmap, ne, parseInt(map['Options']['mapOptions']['zoomLevel']));
    }
    else
    {
      gmap.fitBounds(this._bounds);
    }
    this._bounds = null;
  }
  else if(!gmap.getZoom())
  {
    var centerLat = parseFloat(map['Options']['mapOptions']['centerY']);
    var centerLng = parseFloat(map['Options']['mapOptions']['centerX']);
    
    var center = new google.maps.LatLng(centerLat, centerLng);
    
    DvtGeographicMapRenderer.zoomToMarker(gmap, center, 2);
  }
  
  
  // register listeners which handle user interaction with map on the first time map is rendered
  if(this._firstTime)
  {
    // save information about new map center and zoom when user change it by dragging the map
    // user interaction is similar to changing of properties of the map so store it to Options of the map. 
    google.maps.event.addListener(gmap, 'dragend', function() 
      {  
        // renderer should reset all these options object on component refresh
        var options = map['Options']; 
        var center = gmap.getCenter();       
        if(center)
        {        
          options.mapOptions.centerX = '' + center.lng();
          options.mapOptions.centerY = '' + center.lat();     
        }             
        var zoom = gmap.getZoom();
        if(zoom)
        {
          options.mapOptions.zoomLevel = '' + zoom;              
        }
        if(zoom || center)
        {
          options.mapOptions.initialZooming = 'none'; 
        }
      });
    
    // store information about user selected map type
    google.maps.event.addListener(gmap, 'maptypeid_changed', function() 
      {   
        var options = map['Options'];   
        switch (gmap.getMapTypeId()) 
        {
          case google.maps.MapTypeId.ROADMAP :
            options.mapOptions.mapType = 'ROADMAP';
            break;
          case google.maps.MapTypeId.SATELLITE :
            options.mapOptions.mapType = "SATELLITE";
            break;
          case google.maps.MapTypeId.HYBRID :
            options.mapOptions.mapType = "HYBRID";
            break;
          case google.maps.MapTypeId.TERRAIN :
            options.mapOptions.mapType = "TERRAIN";
            break;
          default:
            options.mapOptions.mapType = 'ROADMAP';
            break;
        }
      });
  }
}

/**
 * @param {object} gmap
 */
DvtGeographicMapRenderer.processGoogleMapDataPoint = function(map, gmap, markerLatLng, params, animation, initialZooming, selected) 
{
  // add marker into the map
  DvtGeographicMapRenderer.addMarker(map, gmap, markerLatLng, params, animation, selected);  
  // when initial zooming is enabled determin proper bounds for all markers
  if (initialZooming) 
  { 
    if(!this._bounds)
    {
      this._bounds = new google.maps.LatLngBounds(markerLatLng, markerLatLng);
    }
    // function extends current bounds to include new marker
    this._bounds = this._bounds.extend(markerLatLng);
  }
}

/**
 * Set the data layer on google map
 * @param {DvtGeographicMap} map The geographic map being rendered.
 * @param {object} gmap The google map
 * @param {object} data The geographic map data object
 * @param {boolean} initialZooming Should the map zoom to the data points
 * @param {string} animation Marker animation
 */
DvtGeographicMapRenderer.setGoogleMapDataLayer = function(map, gmap, data, initialZooming, animation) 
{
  this._bounds = null;
  var dataLayers = data['dataLayers'];
  // initial number of jobs
  this._jobCount = dataLayers.length;
  
  var result = [];
  var index = 0;
  
  // remove all old markers from the google map instance
  if(this._currentMarkers)
  {
    for(var ind = 0; ind < this._currentMarkers.length; ind++)
    {
      if (this._currentMarkers[ind] && this._currentMarkers[ind].setMap)
      {
        this._currentMarkers[ind].setMap(null);
      }
    }
    // clear array of old markers
    this._currentMarkers.length = 0;
  }
  
  var geocoder = undefined;
  
  for (var i = 0; i < dataLayers.length; i++) 
  {
    this._jobCount--;
    
    var dataLayer = dataLayers[i];
    var points = dataLayer['data'];
    var selectedRowKeys = DvtGeographicMapRenderer._getSelectedRowKeys(map, dataLayer, i);

    this._jobCount += points.length;  
    result.length += points.length;
    
    for (var j = 0; j < points.length; j++) 
    {
      this._jobCount--;
      
      var params = DvtGeographicMapRenderer.getParams(points[j], map.getMapProvider());
      var selMode = DvtGeographicMapRenderer.getSelMode(dataLayer);
      var selected = false;
      
      params['selMode'] = selMode;
      params['dataLayerIdx'] = dataLayer['idx'];
      
      if (selMode == DvtGeographicMapRenderer.SEL_SINGLE || selMode == DvtGeographicMapRenderer.SEL_MULTIPLE) {
        selected = (selectedRowKeys.indexOf(points[j]['_rowKey']) != -1) ? true : false;
      }
      
      if (points[j]['x'] && points[j]['y']) 
      {   
        var markerLatLng = new google.maps.LatLng(parseFloat(points[j]['y']), parseFloat(points[j]['x']));                
        result[index] = { 'latLng' : markerLatLng, 'params' : params, 'animation' : animation , 'initialZooming' : initialZooming, 'selected' : selected };      
      } 
      else if (points[j]['address']) 
      {                
        var address = points[j]['address'];
        // create address cache if not exists
        if(this._addresscache === undefined)
        {
          this._addresscache = {};
        }
        // try to load information about address location from cache
        var cachedPoint = this._addresscache[address];
        if(cachedPoint)
        {
          result[index] = { 'latLng' : cachedPoint, 'params' : params, 'animation' : animation , 'initialZooming' : initialZooming, 'selected' : selected }; 
        }
        else
        {
          var renderer = this;
          // callback object which handles result from geocoder                
          var callback = function (markerParams, aIndex, aAddress) 
          {         
            return function (results, status) 
            {          
              renderer._jobCount--;
              // add map point when result is returned
              if (status == google.maps.GeocoderStatus.OK) 
              { 
                var addrMarkerLatLng = results[0].geometry.location;
                renderer._addresscache[aAddress] = addrMarkerLatLng;
                              
                result[aIndex] = { 'latLng' : addrMarkerLatLng, 'params' : markerParams, 'animation' : animation , 'initialZooming' : initialZooming, 'selected' : selected };                 
              } 
              // endpoint of asynchronous callback
              if(renderer._jobCount == 0)
              {
                DvtGeographicMapRenderer.googleMapRenderEnd(gmap, map, result);
                renderer._jobCount = null;
              }         
            }
          };
          // starting new async job to resolve addresses
          this._jobCount++;
          // create geocoder service if it does not exist
          if(geocoder === undefined)
          {
            geocoder = new google.maps.Geocoder();
          }        
          geocoder.geocode( { 'address' : address }, callback(params, index, address));   
        }            
      }	
      index++;
    }
  } 
  // in case there are no points or all points have been already added call end function
  if(this._jobCount == 0)
  {
    DvtGeographicMapRenderer.googleMapRenderEnd(gmap, map, result);
    this._jobCount = null;
    map.initialSelectionApplied = true;   // initial selection has been applied by now
  }
}

/**
 * Add marker to map
 * @param {DvtGeographicMap} map The geographic map being rendered.
 * @param {object} gmap The google map
 * @param {object} markerLatLng
 * @param {params} params The params for the point foi
 * @param {string} animation Marker animation
 */
DvtGeographicMapRenderer.addMarker = function (map, gmap, markerLatLng, params, animation, selected) 
{ 
  // create array which holds information about markers on the map
  if(this._currentMarkers === undefined)
  {
    this._currentMarkers = [];
  }
  var selMode = params['selMode'];
  var dataLayerIdx = params['dataLayerIdx'];
  var action = params['action'];
  var tooltip = "";
  if (params['tooltip'])
    tooltip = params['tooltip'];

  var sourceImg;
  if (selected) {
    sourceImg = new google.maps.MarkerImage(params['sourceSelected'], null, null, null, new google.maps.Size(32, 32));
  }
  else {
    sourceImg = new google.maps.MarkerImage(params['source'], null, null, null, new google.maps.Size(32, 32));
  }
  var marker = new google.maps.Marker({
    position: markerLatLng,
    icon: sourceImg,
    title: tooltip
  });
  
  if (animation == "auto")
    marker.setAnimation (google.maps.Animation.DROP);
  
  // Add marker to the map
  marker.setMap(gmap);
  // add information that map contains marker
  this._currentMarkers.push(marker);
  
  // attach selection related event listeners
  if (selMode == DvtGeographicMapRenderer.SEL_SINGLE || selMode == DvtGeographicMapRenderer.SEL_MULTIPLE) {
    DvtGeographicMapRenderer.attachGMapEventListener(map, marker, DvtGeographicMapRenderer.MOUSE_OVER, params);
    DvtGeographicMapRenderer.attachGMapEventListener(map, marker, DvtGeographicMapRenderer.MOUSE_OUT, params);
    DvtGeographicMapRenderer.attachGMapEventListener(map, marker, DvtGeographicMapRenderer.CLICK, params);
    
    if (selected) {
      var selection = map['selection'][dataLayerIdx];
      if (selection === undefined) {
        selection = map['selection'][dataLayerIdx] = [];
      }
      marker['selected'] = true;
      marker['rowKey'] = params['rowKey'];
      marker['dataLayerIdx'] = dataLayerIdx;
      selection.push(marker);
    }
  } else if (action) {
    google.maps.event.addListener(marker, DvtGeographicMapRenderer.CLICK, function() {
      var actionEvent = new DvtMapActionEvent(params['clientId'], params['rowKey'], action);
      actionEvent.addParam('dataLayerIdx', params['dataLayerIdx']);
      map.__dispatchEvent(actionEvent);
    }); 
  }
}

/**
 * Attach event listeners
 * @param {DvtGeographicMap} map The geographic map being rendered.
 * @param {object} marker The marker
 * @param {string} eventType The event type
 * @param {object} params The params for the point
 */
DvtGeographicMapRenderer.attachGMapEventListener = function (map, marker, eventType, params) {
  var sourceImg = new google.maps.MarkerImage(params['source'], null, null, null, new google.maps.Size(32, 32));
  var sourceHoverImg = new google.maps.MarkerImage(params['sourceHover'], null, null, null, new google.maps.Size(32, 32));
  var sourceSelectedImg = new google.maps.MarkerImage(params['sourceSelected'], null, null, null, new google.maps.Size(32, 32));
  var sourceHoverSelectedImg = new google.maps.MarkerImage(params['sourceHoverSelected'], null, null, null, new google.maps.Size(32, 32));
  switch (eventType) {
    case DvtGeographicMapRenderer.MOUSE_OVER:
        google.maps.event.addListener(marker, DvtGeographicMapRenderer.MOUSE_OVER, function() {
          if (!marker.selected) {
            marker.setIcon(sourceHoverImg);
          } else {
            marker.setIcon(sourceHoverSelectedImg);
          }
        });
        break;
    case DvtGeographicMapRenderer.MOUSE_OUT:
        google.maps.event.addListener(marker, DvtGeographicMapRenderer.MOUSE_OUT, function() {
          if (!marker.selected) {
            marker.setIcon(sourceImg);
          }
        });
        break;
    case DvtGeographicMapRenderer.CLICK:
        google.maps.event.addListener(marker, DvtGeographicMapRenderer.CLICK, function() {
          var idx = params['dataLayerIdx'];
          var i;
          if (!map.selection[idx])
            map.selection[idx] = [];
          var selMode = params['selMode'];
          if (!marker.selected) {
            var selection = map.selection[idx];
            if (selMode == DvtGeographicMapRenderer.SEL_SINGLE) {
              if (selection.length != 0) {
                for (i = 0; i < selection.length; i++) {
                  selection[i].setIcon(sourceImg);
                  selection[i].selected = false;
                }
                map.selection[idx] = [];
              }
            }
            marker.setIcon(sourceSelectedImg);
            marker.selected = true;
            marker.rowKey = params['rowKey'];
            marker.dataLayerIdx = idx;
            map.selection[idx].push(marker);
          } else {
            // deselect
            marker.setIcon(sourceImg);
            marker.selected = false;
            // remove from selection
            if (selMode == DvtGeographicMapRenderer.SEL_SINGLE) {
              map.selection[idx] = [];
            } else if (selMode == DvtGeographicMapRenderer.SEL_MULTIPLE) {
              for (i = 0; i < map.selection[idx].length; i++) {
			  
                if (marker.rowKey == map.selection[idx][i].rowKey && marker.dataLayerIdx == map.selection[idx][i].dataLayerIdx) {
                  map.selection[idx].splice(i, 1);
                  break;
                }
              }
            }
          }
          var evt = new DvtSelectionEvent(map.selection[idx]);
          evt.addParam('dataLayerIdx', idx);
          map.__dispatchEvent(evt);
        });
        break;
      default:
        break;
  }
}

/**
 * Zoom to a single marker
 * @param {object} gmap the Google map
 * @param {object} markerLatLng the LatLng google maps object
 * @param {number} zoomLevel the zoom level (optional)
 */
DvtGeographicMapRenderer.zoomToMarker = function (gmap, markerLatLng, zoomLevel) {
  gmap.setCenter(markerLatLng);
  if (zoomLevel)
    gmap.setZoom(zoomLevel);
}

/**
 * Get the params for the point
 */
DvtGeographicMapRenderer.getParams = function (point, mapProvider) {
  var tooltip = DvtGeographicMapRenderer.getTooltip(point);
  var source = DvtGeographicMapRenderer.getSource(point, mapProvider);
  var sourceHover = DvtGeographicMapRenderer.getSourceHover(point, mapProvider);
  var sourceSelected = DvtGeographicMapRenderer.getSourceSelected(point, mapProvider);
  var sourceHoverSelected = DvtGeographicMapRenderer.getSourceHoverSelected(point, mapProvider);
  var rowKey = point['_rowKey'];
  var clientId = point['clientId'];
  var params = {};
  params['source'] = source;
  params['sourceHover'] = sourceHover;
  params['sourceSelected'] = sourceSelected;
  params['sourceHoverSelected'] = sourceHoverSelected;
  params['tooltip'] = tooltip;
  if (point['action'])
    params['action'] = point['action'];
  params['rowKey'] = rowKey;
  params['clientId'] = clientId;
  return params;
}

/**
 * Get dataSelection mode
 * @param {object} dataLayer The dataLayer
 * @return {string} The selection mode
 */
DvtGeographicMapRenderer.getSelMode = function (dataLayer) {
  var selMode = DvtGeographicMapRenderer.SEL_NONE;
  if (dataLayer['dataSelection'])
      selMode = dataLayer['dataSelection'];

  return selMode;
}

/**
 * Get marker tooltip
 * @param {object} point
 * @return {string} The tooltip
 */
DvtGeographicMapRenderer.getTooltip = function (point) {
  var tooltip = null;
  if (point['shortDesc'])
    tooltip = point['shortDesc']; 
  return tooltip;
}

/**
 * Get marker source URL
 * @param {object} point
 * @param {string} mapProvider The map provider
 * @return {string} The source URL
 */
DvtGeographicMapRenderer.getSource = function (point, mapProvider) {
  var source;
  if (point['source'])
    source = point['source']; 
  else {
    if (mapProvider == DvtGeographicMap.MAP_PROVIDER_ORACLE) {
      source = DvtGeographicMapRenderer.DEFAULT_ORACLE_MARKER_IMG;
    } else if (mapProvider == DvtGeographicMap.MAP_PROVIDER_GOOGLE) {
      source = DvtGeographicMapRenderer.DEFAULT_GOOGLE_MARKER_IMG;
    }
  }
  return source;
}

/**
 * Get marker sourceSelected URL
 * @param {object} point
 * @param {string} mapProvider The map provider
 * @return {string} The sourceSelected URL
 */
DvtGeographicMapRenderer.getSourceSelected = function (point, mapProvider) {
  var sourceSelected;
  if (point['sourceSelected'])
    sourceSelected = point['sourceSelected']; 
  else {
    if (mapProvider == DvtGeographicMap.MAP_PROVIDER_ORACLE) {
      sourceSelected = DvtGeographicMapRenderer.DEFAULT_ORACLE_MARKER_SELECT_IMG;
    } else if (mapProvider == DvtGeographicMap.MAP_PROVIDER_GOOGLE) {
      sourceSelected = DvtGeographicMapRenderer.DEFAULT_GOOGLE_MARKER_SELECT_IMG;
    }
  }
  return sourceSelected;
}

/**
 * Get marker sourceHover URL
 * @param {object} point
 * @param {string} mapProvider The map provider
 * @return {string} The sourceHover URL
 */
DvtGeographicMapRenderer.getSourceHover = function (point, mapProvider) {
  var sourceHover;
  if (point['sourceHover'])
    sourceHover = point['sourceHover']; 
  else {
    if (mapProvider == DvtGeographicMap.MAP_PROVIDER_ORACLE) {
      sourceHover = DvtGeographicMapRenderer.DEFAULT_ORACLE_MARKER_HOVER_IMG;
    } else if (mapProvider == DvtGeographicMap.MAP_PROVIDER_GOOGLE) {
      sourceHover = DvtGeographicMapRenderer.DEFAULT_GOOGLE_MARKER_HOVER_IMG;
    }
  }
  return sourceHover;
}

/**
 * Get marker sourceHoverSelected URL
 * @param {object} point
 * @param {string} mapProvider The map provider
 * @return {string} The sourceHoverSelected URL
 */
DvtGeographicMapRenderer.getSourceHoverSelected = function (point, mapProvider) {
  var sourceHoverSelected;
  if (point['sourceHoverSelected'])
    sourceHoverSelected = point['sourceHoverSelected']; 
  else {
    if (mapProvider == DvtGeographicMap.MAP_PROVIDER_ORACLE) {
      sourceHoverSelected = DvtGeographicMapRenderer.DEFAULT_ORACLE_MARKER_SELECT_IMG;
    } else if (mapProvider == DvtGeographicMap.MAP_PROVIDER_GOOGLE) {
      sourceHoverSelected = DvtGeographicMapRenderer.DEFAULT_GOOGLE_MARKER_SELECT_IMG;
    }
  }
  return sourceHoverSelected;
}

/**
 * Get minimum number
 * @param {number} min
 * @param {number} n
 * @return min
 */
DvtGeographicMapRenderer.getMin = function (min, n) {
  if (min == null || min > n)
    min = n;
  return min;
}

/**
 * Get maximum number
 * @param {number} max
 * @param {number} n
 * @return max
 */
DvtGeographicMapRenderer.getMax = function (max, n) {
  if (max == null || max < n)
    max = n;
  return max;
}

/**
 * If selection is enabled, returns the initial selection status for a data layer.
 * On first render, returns array of row keys found in the 'selectedRowKeys' property. 
 * On re-render, returns the previously selected row keys
 * @param {object} map
 * @param {object} dataLayer
 * @param {number} idx dataLayer index
 * @return {array} array of selected row keys
 */
DvtGeographicMapRenderer._getSelectedRowKeys = function(map, dataLayer, idx) 
{
  var selMode = DvtGeographicMapRenderer.getSelMode(dataLayer);
  var selectedRowKeys = [];
  
  // if data selection is off, nothing to do  
  if (selMode == DvtGeographicMapRenderer.SEL_SINGLE || selMode == DvtGeographicMapRenderer.SEL_MULTIPLE)
  {  
    // first time through, check if there's an initial selection to be set
    if (!map.initialSelectionApplied)
    {
      if (dataLayer['selectedRowKeys'] !== undefined)
        selectedRowKeys = dataLayer['selectedRowKeys'];
    }
    else // next time, preserve existing selections
    {
      var selection = map['selection'][idx];    // selected points for this layer
      if (selection)
      {
        for (var i = 0; i < selection.length; i++)
        {
          selectedRowKeys.push(selection[i]['rowKey']);
        }
        // clear the previous selection as we'll populate a new one
        selection.length = 0;
      }
    }
  }
  return selectedRowKeys;
}

/**
 * Checks if the map includes any data layers.
 * @param {object} map DvtGeographicMap instance
 * @return true if the map includes any data layers, false otherwise
 */
DvtGeographicMapRenderer._mapIncludesData = function(map)
{
  var data = map['Data'];
  
  if (!data || !data['dataLayers'] || data['dataLayers'].length == 0)
    return false;
    
  return true;
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
