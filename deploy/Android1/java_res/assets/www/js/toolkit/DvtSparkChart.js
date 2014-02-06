// Copyright (c) 2008, 2013, Oracle and/or its affiliates. 
// All rights reserved. 

/**
 * Spark chart component.  This chart should never be instantiated directly.  Use the
 * newInstance function instead.
 * @class
 * @constructor
 * @extends {DvtContainer}
 * @export
 */
var DvtSparkChart = function() {}

DvtObj.createSubclass(DvtSparkChart, DvtContainer, "DvtSparkChart");

/**
 * Returns a new instance of DvtSparkChart.
 * @param {DvtContext} context The rendering context.
 * @param {string} callback The function that should be called to dispatch component events.
 * @param {object} callbackObj The optional object instance on which the callback function is defined.
 * @param {object} options The object containing options specifications for this component.
 * @return {DvtSparkChart}
 * @export
 */
DvtSparkChart.newInstance = function(context, callback, callbackObj, options) {
  var sparkChart = new DvtSparkChart();
  sparkChart.Init(context, callback, callbackObj, options);
  return sparkChart;
}

/**
 * Initializes the component.
 * @param {DvtContext} context The rendering context.
 * @param {string} callback The function that should be called to dispatch component events.
 * @param {object} callbackObj The optional object instance on which the callback function is defined.
 * @param {object} options The object containing options specifications for this component.
 * @protected
 */
DvtSparkChart.prototype.Init = function(context, callback, callbackObj, options) {
  DvtSparkChart.superclass.Init.call(this, context);
  this._callback = callback;
  this._callbackObj = callbackObj;
  this.setOptions(options);
  
  // Create the event handler and add event listeners
  this._eventHandler = new DvtEventManager(context);
  this._eventHandler.addListeners(this);
  
  // Create the underlying chart instance for the component
  this._chart = DvtChart.newInstance(context, null, null);
  this.addChild(this._chart);
  
  // Create the masking shape used for the tooltip
  this._tooltipMask = new DvtRect(context);
  this.addChild(this._tooltipMask);
  
  // Make sure the object has an id for clipRect naming
  this.setId("sparkChart" + 1000 + Math.floor(Math.random()*10000));
}

/**
 * @override
 */
DvtSparkChart.prototype.setId = function(id){
  DvtSparkChart.superclass.setId.call(this, id);
  if(this._chart)
    this._chart.setId(id+'chart');
}

/**
 * Specifies the non-data options for this component.
 * @param {object} options The object containing options specifications for this component.
 * @export
 */
DvtSparkChart.prototype.setOptions = function(options) {
  // Combine the user options with the defaults and store
  this._options = DvtSparkChartDefaults.calcOptions(options);
  
  // Disable animation for canvas and xml
  if (this.getContext() instanceof DvtXmlContext || this.getContext() instanceof DvtCanvasContext) {
    this._options['animationOnDisplay']    = 'none';
    this._options['animationOnDataChange'] = 'none';
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
DvtSparkChart.prototype.render = function(data, width, height) 
{  
  // Update if new data has been provided. Clone to avoid modifying the provided object.
  this._data = data ? DvtJSONUtils.clone(data) : this._data; 

  // Render the spark chart
  DvtSparkChartRenderer.render(this, width, height);
  
  // Apply the tooltip
  var tooltip = this.__getData().tooltip;
  this._tooltipMask.setWidth(width);
  this._tooltipMask.setHeight(height);
  this._tooltipMask.setFill(new DvtSolidFill("#FFFFFF", 0.0001));
  if(tooltip)
    this._eventHandler.associate(this._tooltipMask, new DvtSimpleObjPeer(null, tooltip, this._options.color));
  
  // WAI-ARIA
  this.setAriaRole('img');
  this.setAriaProperty('label', tooltip);
  
  // Queue a render with the context
  this.getContext().queueRender();
}

/**
 * Dispatches the event to the callback function.
 * @param {object} event The event to be dispatched.
 */
DvtSparkChart.prototype.__dispatchEvent = function(event) {
  DvtEventDispatcher.dispatchEvent(this._callback, this._callbackObj, this, event);
};

/**
 * Returns the underlying chart instance for the component.
 * @return {DvtChart} The underlying chart instance for this component.
 */
DvtSparkChart.prototype.__getChart = function() {
  return this._chart;
}

/**
 * Returns the data object for the component.
 * @return {object} The object containing data for this component.
 */
DvtSparkChart.prototype.__getData = function() {
  return this._data ? this._data : {};
}

/**
 * Returns the evaluated options object, which contains the user specifications
 * merged with the defaults.
 * @return {object} The options object.
 */
DvtSparkChart.prototype.__getOptions = function() {
  return this._options;
}

/**
 * Default values and utility functions for chart versioning.
 * @class
 */
var DvtSparkChartDefaults = new Object();

DvtObj.createSubclass(DvtSparkChartDefaults, DvtObj, "DvtSparkChartDefaults");

/**
 * Defaults for version 1.
 */ 
DvtSparkChartDefaults.VERSION_1 = {
  'type': "line",
  'animationOnDisplay': "none",
  'animationOnDataChange': "none",
  'emptyText': null, 
  'color': "#666699",
  'firstColor': null, 
  'lastColor': null, 
  'highColor': null, 
  'lowColor': null,  
  'visualEffects': "auto",
  'axisScaledFromBaseline': "off",
  'barSpacing': "subpixel",
  
  // Internal Constants
  '__defaultMarkerSize': 5
};

/**
 * Combines the user options with the defaults for the specified version.  Returns the
 * combined options object.  This object will contain internal attribute values and
 * should be accessed in internal code only.
 * @param {object} userOptions The object containing options specifications for this component.
 * @return {object} The combined options object.
 */
DvtSparkChartDefaults.calcOptions = function(userOptions) {
  var defaults = DvtSparkChartDefaults._getDefaults(userOptions);

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
DvtSparkChartDefaults._getDefaults = function(userOptions) {
  // Note: Version checking will eventually get added here
  // Note: Future defaults objects are deltas on top of previous objects
  return DvtJSONUtils.clone(DvtSparkChartDefaults.VERSION_1);
}
/**
 * Renderer for DvtSparkChart.
 * @class
 */
var DvtSparkChartRenderer = new Object();

DvtObj.createSubclass(DvtSparkChartRenderer, DvtObj, "DvtSparkChartRenderer");

DvtSparkChartRenderer._DEFAULT_MARKER_SHAPE = "square";

/**
 * @this {DvtSparkChartRenderer}
 * Renders the spark chart in the specified area.
 * @param {DvtSparkChart} spark The spark chart being rendered.
 * @param {number} width The width of the component.
 * @param {number} height The height of the component.
 */
DvtSparkChartRenderer.render = function (spark, width, height) {
  // Convert spark objects into chart objects
  var chartData = DvtSparkChartRenderer._convertDataObj(spark);
  var chartOptions = DvtSparkChartRenderer._convertOptionsObj(spark.__getOptions());
  
  // Render the chart
  this._renderChart(spark, chartData, chartOptions, width, height);
}

/**
 * Returns the array of spark data items.
 * @param {DvtSparkChart} spark
 * @return {array}
 */
DvtSparkChartRenderer._getDataItems = function(spark) {
  var data = spark.__getData();
  return (data && data['items']) ? data['items'] : [];
}

/**
 * Renders the chart in the specified area.
 * @param {DvtSparkChart} spark The spark chart being rendered.
 * @param {object} chartData The data for the chart.
 * @param {object} chartOptions The options object for the chart.
 * @param {number} width The width of the component.
 * @param {number} height The height of the component.
 */
DvtSparkChartRenderer._renderChart = function(spark, chartData, chartOptions, width, height) {
  var chart = spark.__getChart();
  var options = spark.__getOptions();
  
  // Allocate a gap for markers if they are enabled.
  if(options['type'] == "area" || options['type'] == "line") 
  {
    var hasMarkers = false;
    
    // Look for the first/last/high/lowColor attributes, which cause markers to display
    if(options['firstColor'] || options['lastColor'] || options['highColor'] || options['lowColor'])
      hasMarkers = true;
    else {
      // Loop through the data to look for markerDisplayed
      var items = DvtSparkChartRenderer._getDataItems(spark);
      for(var i=0; i<items.length; i++) {
        if(items[i] && items[i]['markerDisplayed']) {
          hasMarkers = true;
          break;
        }
      }
    }
    
    // Allocate the gap if markers were found
    if(hasMarkers) {
      var markerGap = options['__defaultMarkerSize']/2;
      width -= 2*markerGap;
      height -= 2*markerGap;
      chart.setTranslateX(markerGap);
      chart.setTranslateY(markerGap);
    }
  }

  // Render the chart
  chart.setOptions(chartOptions);
  chart.render(chartData, width, height);
}

/**
 * Converts the spark chart data object into a chart data object.
 * @param {object} The spark chart data object.
 * @return {object} The resulting chart data object.
 * @private
 */
DvtSparkChartRenderer._convertDataObj = function(spark) {
  // Create the objects to gather the data
  var data = spark.__getData();
  var options = spark.__getOptions();
  var bFloatingBar = (options['type'] == "floatingBar");
  var chartData = {};
  var chartItems = [];
  var floatItems = [];
  
  // Loop through the data
  var highIndex = -1;
  var lowIndex = -1;
  var highValue = Number.NEGATIVE_INFINITY;
  var lowValue = Number.POSITIVE_INFINITY;
  var items = DvtSparkChartRenderer._getDataItems(spark);
  for(var i=0; i<items.length; i++) {
    var item = items[i];
    
    // Parse the spark data item properties
    var chartItem = {};
    if(item instanceof Object) {
      chartItem['y'] = item['value'];
      
      if(item['date']) {
        chartItem['x'] = item['date'];
        chartData.timeAxisType = "enabled";
      }
      
      if(item['markerDisplayed'] === true || item['markerDisplayed'] === "true") {
        chartItem['markerDisplayed'] = true;
        chartItem['markerShape'] = DvtSparkChartRenderer._DEFAULT_MARKER_SHAPE;
      }
      
      if(item['color']) 
        chartItem['color'] = item['color'];
      
      // Floating Bar Support
      if(bFloatingBar) {
        var floatValue = item['floatValue'];
        if(isNaN(floatValue))
          floatValue = 0;
        
        floatItems.push(floatValue);
      }
    }
    else {
      // Item is just the value, wrap and push onto the array.
      chartItem['y'] = item;
      
      // If floating bar, pass float value of 0
      if(bFloatingBar)
        floatItems.push(0);
    }
      
    // Push onto the array  
    chartItems.push(chartItem);
    
    // Keep track of low and high values
    if(highValue < chartItem['y']) {
      highValue = chartItem['y'];
      highIndex = i; 
    }
    
    if(lowValue > chartItem['y']) {
      lowValue = chartItem['y'];
      lowIndex = i; 
    }
  }
  
  // First/Last/High/LowColor Support: Process high and low first since they take precedence
  if(options['highColor'] && highIndex >= 0) {
    chartItems[highIndex]['markerDisplayed'] = true;
    if(!chartItems[highIndex]['color'])
      chartItems[highIndex]['color'] = options['highColor'];
  }
  
  if(options['lowColor'] && lowIndex >= 0) {
    chartItems[lowIndex]['markerDisplayed'] = true;
    if(!chartItems[lowIndex]['color'])
      chartItems[lowIndex]['color'] = options['lowColor'];
  }
  
  if(options['firstColor'] && chartItems.length > 0) {
    chartItems[0]['markerDisplayed'] = true;
    if(!chartItems[0]['color'])
      chartItems[0]['color'] = options['firstColor'];
  }
    
  if(options['lastColor'] && chartItems.length > 0) {
    chartItems[chartItems.length-1]['markerDisplayed'] = true;
    if(!chartItems[chartItems.length-1]['color'])
      chartItems[chartItems.length-1]['color'] = options['lastColor'];
  }
  
  // Add the data items into a data object
  chartData['series'] = [{'data': chartItems}];
  if(bFloatingBar) {
    var floatSeries = {'data': floatItems, 'color': "rgba(0, 0, 0, 0)"};
    chartData['series'].splice(0, 0, floatSeries);
  }
  
  // Reference Objects
  if(data['referenceObjects'])
    chartData['yAxis'] = {'referenceObjects': data['referenceObjects']};
    
  // Time Axis support
  if (data['timeAxisType'] == "enabled")
    chartData['timeAxisType'] = "enabled";
  
  return chartData;
}

/**
 * Converts the spark chart options object into a chart options object.
 * @param {object} The spark chart options object.
 * @return {object} The resulting chart options object.
 * @private
 */
DvtSparkChartRenderer._convertOptionsObj = function(options) {
  var chartOptions = {'chart': {}, 'styleDefaults': {}, 'yAxis': {}, '__layout': {}};
  chartOptions['chart']['__spark'] = true;
  chartOptions['chart']['__sparkBarSpacing'] = options['barSpacing'];
  chartOptions['chart']['type'] = options['type'];
  chartOptions['chart']['animationOnDataChange'] = options['animationOnDataChange'];
  chartOptions['chart']['animationOnDisplay'] = options['animationOnDisplay'];
  chartOptions['chart']['emptyText'] = options['emptyText'];
  chartOptions['styleDefaults']['colors'] = [options['color']];
  chartOptions['styleDefaults']['animationDuration'] = options['animationDuration'];
  chartOptions['styleDefaults']['animationIndicators'] = "none";
  chartOptions['yAxis']['scaledFromBaseline'] = options['axisScaledFromBaseline'];  
  chartOptions['__layout']['maxBarWidth'] = 1.0;
  
  // Floating bar support
  if(options['type'] == "floatingBar") {
    chartOptions['chart']['type'] = "bar";
    chartOptions['chart']['stack'] = "on";
  }
  
  // Visual Effects Support: Only for areas
  if(options['visualEffects'] == "none" || options['type'] != "area")
    chartOptions['styleDefaults']['seriesEffect'] = "color";
  else
    chartOptions['styleDefaults']['seriesEffect'] = "gradient";
  
  // Apply spark chart properties, such as disabling the legend and axes.
  DvtSparkChartRenderer._applySparkAttrs(chartOptions, options);
  
  return chartOptions;
}

/**
 * Applies the spark chart rendering options, such as hidden axes, onto the chart.
 * @param {object} chartOptions The chart options object.
 * @param {object} options The spark chart options object.
 * @private
 */
DvtSparkChartRenderer._applySparkAttrs = function(chartOptions, options) {
  // Remove Gaps
  chartOptions['layout'] = {'gapRatio': 0};

  // Disable Legend
  chartOptions['legend'] = {'rendered': false};
  
  // Disable Axis: Tick Labels and Grid Lines
  chartOptions['xAxis'] = chartOptions['xAxis'] ? chartOptions['xAxis'] : {};
  chartOptions['xAxis']['tickLabel'] = {'rendered': false};
  chartOptions['xAxis']['axisLine'] = {'rendered': false};
  chartOptions['xAxis']['majorTick'] = {'rendered': false};
  
  chartOptions['yAxis'] = chartOptions['yAxis'] ? chartOptions['yAxis'] : {};
  chartOptions['yAxis']['tickLabel'] = {'rendered': false};
  chartOptions['yAxis']['axisLine'] = {'rendered': false};
  chartOptions['yAxis']['majorTick'] = {'rendered': false};
  
  // Style Defaults
  chartOptions['styleDefaults'] = chartOptions['styleDefaults'] ? chartOptions['styleDefaults'] : {};
  chartOptions['styleDefaults']['lineWidth'] = 1;
  chartOptions['styleDefaults']['markerSize'] = options['__defaultMarkerSize'];
  chartOptions['styleDefaults']['seriesTooltipType'] = "none";
  chartOptions['styleDefaults']['groupTooltipType'] = "none";
  chartOptions['styleDefaults']['valueTooltipType'] = "none";
  
  // Empty Text Style
  chartOptions['title'] = chartOptions['title'] ? chartOptions['title'] : {};
  chartOptions['title']['style'] = "font-size: 12px; color: #404259;"
}

