/**  JDEVADF_11.1.2.4.0_GENERIC_130329.0109.6411.S  **/

/*
* Copyright (c) 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adf) window.adf = {};
adf.mf                      = adf.mf                      || {};
adf.mf.internal             = adf.mf.internal             || {};
adf.mf.internal.controller  = adf.mf.internal.controller  || {};

(function(){

   adf.mf.internal.controller.ViewHistory = ViewHistory;
   function ViewHistory()
   {}
   
   /**
    * Peeks the current entry in the view history.
    * @export
    */
   ViewHistory.peek = function()
   {
      var controllerState = adfc.internal.AdfcContext.getControllerState();
      var tfEntry = controllerState.peekTaskFlowStack();
      var result = tfEntry.peekViewHistory();
      return result;
   }

})();
/*
* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};

(function(){

  adfc.NavigationHandler = NavigationHandler;

  /**
   * NavigationHandler is the public facing interface to the ADFc NavigationHandler.
   * @export
   */
  function NavigationHandler()
  {
  }

  /**
   * Get the initial viewId of a feature.
   * @param {Object} request an initial navigation request.  It must have an
   *                 attribute named:
   *                    entryPoint: the entry point file path.
   *
   * @param {function} success(request, response)  invoked upon successful completion of the navigation.
   * @param {function} failed(request, response)  invoked if navigation failed.
   * @export
   */
  NavigationHandler.getInitialViewId = function(request, successCallback, failCallback)
  {
      adfc.internal.LogUtil.perfLog("BEGIN: NavigationHandler.getInitialViewId");
      if (adfc.internal.LogUtil.isFine())
      {
         adfc.internal.LogUtil.fine("executing NavigationHandler.getInitialViewId() called.");
      }

      var entryPoint = request["entryPoint"];
      var inputParams = request["inputParams"];
      
      var success = function(result)
      {
         adfc.internal.LogUtil.perfLog("END: NavigationHandler.getInitialViewId");
         successCallback(request, result);
      }
      
      var failed = function(message)
      {
         adfc.internal.LogUtil.perfLog("END: NavigationHandler.getInitialViewId");
         failCallback(request, message);
      }

      adfc.internal.NavigationHandlerImpl.getInitialViewId(entryPoint, inputParams, success, failed);
  }

  /**
   * Perform navigation handling based on the current viewId and outcome.
   * @param {Object} request an initial navigation request.  It must have
   *                 attributes named:
   *                    currentViewId:  the viewId of the currently displayed view.
   *                    outcome:  the outcome produced by an action.
   * @param {function} success(request, response)  invoked upon successful completion of the navigation.
   * @param {function} failed(request, response)  invoked if navigation failed.
   * @export
   */
  NavigationHandler.handleNavigation = function(request, successCallback, failedCallback)
  {
      adfc.internal.LogUtil.perfLog("BEGIN: NavigationHandler.handleNavigation");

      var currentViewId = request["currentViewId"];
      var outcome = request["outcome"];
      
      if (adfc.internal.LogUtil.isFine())
      {
         adfc.internal.LogUtil.fine("executing NavigationHandler.handleNavigation(), currentViewId=" + 
                                    currentViewId + ", outcome=" + outcome);
      }
      
      var success = function(navResult)
      {
         if (adfc.internal.LogUtil.isFine())
         {
            var isNewView = navResult.isNewViewId();
            var msg = "ADFc: executing NavigationHandler.handleNavigation() completed, isNewView=" + isNewView;
            if (isNewView) 
            {
               var page = navResult.getVdlDocumentPath();
               msg += ", page=" + page;
            }
            adfc.internal.LogUtil.fine(msg);
         }
         adfc.internal.LogUtil.perfLog("END: NavigationHandler.handleNavigation");
         successCallback(request, navResult);
      }
      var failed = function(message) 
      {
         if (adfc.internal.LogUtil.isFine())
         {
            adfc.internal.LogUtil.fine("executing NavigationHandler.handleNavigation() failed");
         }
         adfc.internal.LogUtil.perfLog("END: NavigationHandler.handleNavigation");
         failedCallback(request, message);
      }
      adfc.internal.NavigationHandlerImpl.handleNavigation(currentViewId, outcome, success, failed);
      
  }

})();
/*
* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};

(function(){

  adfc.NavigationResult = NavigationResult;

  /**
   * NavigationResult represents the results of navigation handling.
   */
  function NavigationResult(isNewViewId, isBackNav, viewId, vdlDocPath, transitionType, featureExited)
  {
      this.mNewViewId = isNewViewId;
      this.mBackNavigation = isBackNav;
      this.mViewId = viewId;
      this.mVdlDocumentPath = vdlDocPath;
      this.mTransitionType = transitionType;
      this.mFeatureExited = featureExited;
  }
  
  /**
   * Did navigation result in a transition to a new viewId?
   * @return {Boolean} true if navigation resulted in a transition to
   * a new viewId, false if it didn't.
   * @export
   */
  NavigationResult.prototype.isNewViewId = function() 
  {
      return this.mNewViewId;
  }
  
  /**
   * Was the navigation due to a "back-button" navigation?
   * @return {Boolean}
   * @export
   */
  NavigationResult.prototype.isBackNavigation = function()
  {
      return this.mBackNavigation;
  }

  /**
   * The new viewId or null if navigation did not transition to a new view.
   * @export
   */
  NavigationResult.prototype.getViewId = function()
  {
      return this.mViewId;
  }

  /**
   * The path to the new view's VDL document or null if navigation did not
   * transition to a new view.
   * @export
   */
  NavigationResult.prototype.getVdlDocumentPath = function()
  {
      return this.mVdlDocumentPath;
  }
  
  /**
   * The type of screen transition to use when displaying the new view or 
   * null if navigation did not transition to a new view.
   * @export
   */
  NavigationResult.prototype.getTransitionType = function()
  {
      return this.mTransitionType;
  }
  
  /**
   * @export
   */
  NavigationResult.prototype.isTaskFlowExited = function()
  {
      adfc.internal.LogUtil.warning("function adfc.NavigationResult.isTaskFlowExited() is deprecated, use adfc.NavigationResult.isFeatureExited() instead.");
      return this.isFeatureExited();
  }
  
  /**
   * Was the initial entry point task flow exited?
   * @export
   */
  NavigationResult.prototype.isFeatureExited = function()
  {
      return this.mTaskFlowExited;
  }

})();
/*
* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
adfc.Util = {};

(function(){

   /**
    * Adds the feature root prefix to a resource path located under the
    * feature's public_html directory.
    */
   adfc.Util.addFeatureRootPrefix = function(path)
   {
      var result = path;
      if (adf.FEATURE_ROOT != null)
      {
         result = adf.FEATURE_ROOT + "/public_html";
         if ((path != null) && (path.length > 0) && (path.charAt(0) != "/"))
         {
            result = result + "/";
         }
         result = result + path;
      }
      return result;
   }

})();
/*
* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

(function(){

   adfc.internal.ActivityLogic = ActivityLogic;
   ActivityLogic.sImplementations = {};
   function ActivityLogic()
   {
   }
   
   ActivityLogic.getImplementation = function(type)
   {
      var result = this.sImplementations[type];
      if (!result)
      {
         if (type == adfc.internal.ActivityType.VIEW)
         {
            result = new adfc.internal.ViewActivityLogic();
            ActivityLogic.sImplementations[adfc.internal.ActivityType.VIEW] = result;
         }
         else if (type == adfc.internal.ActivityType.ROUTER)
         {
            result = new adfc.internal.RouterActivityLogic();
            ActivityLogic.sImplementations[adfc.internal.ActivityType.ROUTER] = result;
         }
         else if (type == adfc.internal.ActivityType.METHOD_CALL)
         {
            result = new adfc.internal.MethodCallActivityLogic();
            ActivityLogic.sImplementations[adfc.internal.ActivityType.METHOD_CALL] = result;
         }
         else if (type == adfc.internal.ActivityType.TASK_FLOW_CALL)
         {
            result = new adfc.internal.TaskFlowCallActivityLogic();
            ActivityLogic.sImplementations[adfc.internal.ActivityType.TASK_FLOW_CALL] = result;
         }
         else if (type == adfc.internal.ActivityType.TASK_FLOW_RETURN)
         {
            result = new adfc.internal.TaskFlowReturnActivityLogic();
            ActivityLogic.sImplementations[adfc.internal.ActivityType.TASK_FLOW_RETURN] = result;
         }
      }
      return result;
   }

})();
/*
* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

(function(){

   adfc.internal.MethodCallActivityLogic = MethodCallActivityLogic;
   function MethodCallActivityLogic()
   {
   }
      
   MethodCallActivityLogic.prototype.execute = function(routingState, activity, successCallback, failCallback)
   {
      adfc.internal.LogUtil.fine("MethodCallActivityLogic.prototype.execute() entered");
      adfc.internal.LogUtil.perfLog("BEGIN: MethodCallActivityLogic.execute");
      routingState.setCurrentOutcome(null);
      
      var getParamsSuccess = function(request, response)
      {
         var invokeSuccess = function(request2, response2)
         {
            adfc.internal.LogUtil.fine("method call invokation successful");
            
            //
            //  Store the return value.
            //
            var storeResultSuccess = function()
            {
               //
               //  Determine the outcome to generate.
               //
               var outcome = null;
               if (activity.getDefaultOutcome())
               {
                  outcome = activity.getDefaultOutcome();
               }
               else if (activity.isConvertToString())
               {
                  if (response2)
                  {
                     outcome = new String(response2);
                  }
               }
               routingState.setCurrentOutcome(outcome);
               adfc.internal.LogUtil.perfLog("END: MethodCallActivityLogic.execute");
               adfc.internal.LogUtil.fine("method call complete, outcome=" + outcome);
               successCallback(routingState);
            }
            
            var resultExpression = activity.getReturnValue();
            if ((resultExpression != null) && (resultExpression.length > 0))
            {
               //
               //  Store the result value.
               //
               adfc.internal.LogUtil.fine("storing method call result to: " + resultExpression);
               var setRequest = new Array();
               setRequest[0] = {name: resultExpression, value: response2};
               adfc.internal.ElUtil.setValue(setRequest, storeResultSuccess, failCallback);
            }
            else 
            {
               //
               //  There's no EL expression for storing the result.
               //
               adfc.internal.LogUtil.fine("no method call result to store");
               storeResultSuccess();
            }
         }
         
         //
         //  Build an array of the parameter values.
         //
         var paramValues = new Array(response.length);
         for (var i = 0; i < response.length; i++)
         {
            paramValues[i] = response[i].value;
         }
   
         //
         //  Execute the method.
         //
         var elExpression = activity.getMethodElExpression();
         adfc.internal.LogUtil.fine("executing method call expression: " + elExpression);
         adfc.internal.ElUtil.invokeMethod(elExpression, paramTypes, paramValues, invokeSuccess, failCallback);
      }
      
      //
      //  Collect the method's input parameter values.
      //
      var params = activity.getParameters();
      var paramExpressions = new Array();
      var paramTypes = new Array();
      if (params.length > 0)
      {
         for (var i = 0; i < params.length; i++)
         {
            paramExpressions.push(params[i].getValueExpression());
            paramTypes.push(params[i].getType());
         }
         adfc.internal.LogUtil.fine("getting method call activity parameter values");
         adfc.internal.ElUtil.getValues(paramExpressions, getParamsSuccess, failCallback);
      }
      else 
      {
         //
         //  There aren't any input params.
         //
         adfc.internal.LogUtil.fine("no method call activity parameters specified");
         getParamsSuccess(paramExpressions, paramExpressions);
      }
   }

})();
/*
* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

(function(){

   adfc.internal.RouterActivityLogic = RouterActivityLogic;
   function RouterActivityLogic()
   {
   }
      
   RouterActivityLogic.prototype.execute = function(routingState, activity, successCallback, failCallback)
   {
      adfc.internal.LogUtil.perfLog("BEGIN: RouterActivityLogic.execute");
      var currentCase = 0;
      var elSuccessCallback = function(request, response)
      {
         //
         //  Convert the result into a boolean value.
         //
         var result = response[0].value;
         result = adfc.internal.ElUtil.resultToBoolean(result);
         
         var cases = activity.getCases();
         if (result == true)
         {
            //
            //  The expression evaluated to true so we want this router case's outcome.
            //
            var outcome = cases[currentCase].getOutcome();
            routingState.setCurrentOutcome(outcome);
            adfc.internal.LogUtil.perfLog("END: RouterActivityLogic.execute");
            successCallback(routingState);
         }
         else
         {
            //
            //  The expression evaluated to false so see if there's another
            //  expression case to evaluate.
            //
            if (cases.length > currentCase+1)
            {
               ++currentCase;
               var routerCase = cases[currentCase];
               var expression = routerCase.getExpression();
               adfc.internal.ElUtil.getValue(expression, elSuccessCallback, failCallback);
            }
            else
            {
               //
               //  There are no more cases so use the default outcome.
               //
               outcome = activity.getDefaultOutcome();
               routingState.setCurrentOutcome(outcome);
               adfc.internal.LogUtil.perfLog("END: RouterActivityLogic.execute");
               successCallback(routingState);
            }
         }
      }
      
      var cases = activity.getCases();
      if ((cases != null) && (cases.length > 0))
      {
         //
         //  Evaluate the first case's expression.
         //
         var routerCase = cases[currentCase];
         var expression = routerCase.getExpression();
         adfc.internal.ElUtil.getValue(expression, elSuccessCallback, failCallback);
      }
      else
      {
         //
         //  There are no cases so use the default outcome.
         //
         var outcome = this.mRouter.getDefaultOutcome();
         routingState.setCurrentOutcome(outcome);
         adfc.internal.LogUtil.perfLog("END: RouterActivityLogic.execute");
         successCallback(routingState);
      }
   }

})();
/*
* Copyright (c) 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

(function(){

   adfc.internal.TaskFlowCallActivityLogic = TaskFlowCallActivityLogic;
   function TaskFlowCallActivityLogic()
   {
   }
      
   TaskFlowCallActivityLogic.prototype.execute = function(routingState, activity, successCallback, failCallback)
   {
      adfc.internal.LogUtil.fine("TaskFlowCallActivityLogic.prototype.execute() entered");
      adfc.internal.LogUtil.perfLog("BEGIN: TaskFlowCallActivityLogic.execute");

      var getTaskFlowIdSuccess = function(taskFlowId)
      {
         var invokeBeforeListenerSuccess = function()
         {
            var getTaskFlowDefinitionSuccess = function(id, taskFlowDef)
            {
            
               var gatherInputParamsSuccess = function(params)
               {
                  var invokeTfSuccess = function() 
                  {
                     routingState.setCurrentOutcome(null);
                     routingState.setNextActivityId(taskFlowDef.getDefaultActivityId());
                     
                     adfc.internal.LogUtil.perfLog("END: TaskFlowCallActivityLogic.execute");
                     successCallback(routingState);
                  }
                  
                  //
                  //  Enter the task flow.
                  //
                  adfc.internal.LogUtil.fine("TaskFlowCallActivityLogic.prototype.execute() invoking taskFlow: " + taskFlowId + " from activity : " + activity.getActivityId());
                  adfc.internal.TaskFlowCallActivityLogic.invokeTaskFlow(taskFlowId, params, activity, routingState, invokeTfSuccess, failCallback);
               }               
               
               TaskFlowCallActivityLogic.gatherInputParamerValues(activity, gatherInputParamsSuccess, failCallback)
            }
            var getTaskFlowDefinitionFail = function(id, message)
            {
               failCallback(message + ": " + taskFlowId);
            }
            adfc.internal.MetadataService.getTaskFlowDefinition(taskFlowId, getTaskFlowDefinitionSuccess, getTaskFlowDefinitionFail);
         }
         TaskFlowCallActivityLogic.invokeBeforeListener(activity, invokeBeforeListenerSuccess, failCallback);
      }
      TaskFlowCallActivityLogic.getTaskFlowId(activity, getTaskFlowIdSuccess, failCallback);
   }

   /**
    * Invoke a bounded task flow and set the flow's default activity as the next
    * activity to be executed.
    */
   TaskFlowCallActivityLogic.invokeTaskFlow = function(taskFlowId, inParams, taskFlowCallActivity, routingState, successCallback, failCallback)
   {
      var getTfSuccess = function(id, taskFlowDef)
      {
         var pushTfSuccess = function()
         {
             var inParamSuccess = function()
             {
                var initializerSuccess = function()
                {
                   //
                   //  Perform control flow routing beginning with the default activity.
                   //
                   var defaultActivityId = taskFlowDef.getDefaultActivityId();
                   routingState.setNextActivityId(defaultActivityId);
                   routingState.setCurrentOutcome(null);
                   successCallback(routingState);
                }
                
                //
                //  Execute the task flow's initializer, if it has one.
                //
                var initializer = taskFlowDef.getInitializer();
                if (initializer && (initializer != null))
                {
                   adfc.internal.ElUtil.invokeMethod(initializer, new Array(), new Array(), initializerSuccess, failCallback);
                }
                else
                {
                   initializerSuccess();
                }
             }
             
             //
             //  Store any input parameter values passed to the task flow.
             //
             var request = new Array();
             var inParamDefs = taskFlowDef.getInputParameters();
             if ((inParamDefs != null) && (inParamDefs.length > 0))
             {
                for (var i = 0; i < inParamDefs.length; i++)
                {
                   var paramDef = inParamDefs[i];
                   var paramName = paramDef.getName();
                   if (inParams[paramName])
                   {
                      var value = inParams[paramName];
                      var elExpression = paramDef.getValueExpression();
                      if ((elExpression == null) || (elExpression == ""))
                      {
                         elExpression = "#{pageFlowScope." + paramName + "}";
                      }
                      request[i] = {name: elExpression, value: value};
                   }
                   else
                   {
                      //
                      //  See if the parameter is required.
                      //
                      if (paramDef.isRequired())
                      {
                         //
                         //  The parameter is required but a value was not supplied.
                         //
                         throw new Error("ADFc: required task flow input parameter [" + paramName + "] not provided.");
                      }
                   }
                }
                adfc.internal.ElUtil.setValues(request, inParamSuccess, failCallback);
             }
             else
             {
                inParamSuccess();
             }
          }

         var pushTfFailed = function()
         {
             var msg = "ADFc: Push of task flow failed for [" + taskFlowId + "]";
             msg += message;
             failCallback(msg);
         }
         
          //
          //  Determine the calling view activity.  This is defined as the view ativity in
          //  the _current_ flow that was last displayed.  If no view has been displayed in
          //  the current flow then the calling view is null.
          //
          var callingView = null;
          var controllerState = adfc.internal.AdfcContext.getControllerState();
          var currentTfInstance = controllerState.peekTaskFlowStack();
          if (currentTfInstance.getInstanceId() == routingState.getStartingTaskFlowInstanceId())
          {
             //
             //  We're still in the same flow as the last displayed view activity.
             //
             callingView = routingState.getStartingActivityId();
          }
          
          //
          //  Record this task flow as the 'current' task flow.
          //
          controllerState.pushTaskFlow(taskFlowDef, taskFlowCallActivity, callingView, pushTfSuccess, pushTfFailed);
      }
      
      var getTfFailed = function(message)
      {
         var msg = "ADFc: Failed to find task flow definition for [" + taskFlowId + "]";
         msg += message;
         failCallback(msg);
      }
      
      //
      //  Look up the task flow definition.
      //
      var taskFlowDef = adfc.internal.MetadataService.getTaskFlowDefinition(taskFlowId, getTfSuccess, getTfFailed);
   }
   
   /**
    * gets the TaskFlowId of the task flow to be called
    */
   TaskFlowCallActivityLogic.getTaskFlowId = function(activity, successCallback, failCallback)
   {
      var parseTaskFlowId = function(taskFlowIdString)
      {
         if (taskFlowIdString && (taskFlowIdString != null))
         {
            var taskFlowId = adfc.internal.TaskFlowId.parse(taskFlowIdString);
            if (taskFlowId && (taskFlowId != null))
            {
               successCallback(taskFlowId);
            }
            else
            {
               failCallback("unable to parse TaskFlowId:" + taskFlowIdString);
            }
         }
         else
         {
            failCallback("unable to parse TaskFlowId:" + taskFlowIdString);
         }
      }
      
      if (activity.isDynamic())
      {
         var getTaskFlowIdSuccess = function(request, response)
         {
            var taskFlowIdString = response[0].value;
            parseTaskFlowId(taskFlowIdString);
         }
         
         var elExpression = activity.getDynamicTaskFlowIdElExpression();
         adfc.internal.LogUtil.fine("evaluating dynamic task flow call expression: " + elExpression);
         adfc.internal.ElUtil.getValue(elExpression, getTaskFlowIdSuccess, failCallback)
      }
      else
      {
         var taskFlowIdString = activity.getTaskFlowReference();
         parseTaskFlowId(taskFlowIdString);
      }
   }
   
   /**
    * invokes the before-listener of a the given task flow call activity if it is specified
    */
   TaskFlowCallActivityLogic.invokeBeforeListener = function(activity, successCallback, failCallback)
   {
      //
      // invoke the before listener if specified
      //
      var listener = activity.getBeforeListener();
      if (listener && (listener != null))
      {
         adfc.internal.LogUtil.fine("calling before-listener: " + listener);
         adfc.internal.ElUtil.invokeMethod(listener, new Array(), new Array(), successCallback, failCallback);
      }
      else
      {
         successCallback()
      }
   }
   
   /**
    * collects input parameters from the task flow call activity
    */
   TaskFlowCallActivityLogic.gatherInputParamerValues = function(activity, successCallback, failCallback)
   {
      var paramExpressions = new Array();
      var paramNames = new Array();
      
      var getParamsSuccess = function(request, response)
      {
         //
         //  Build a map of the parameter name/value pairs
         //
         var inputParams = {};
         for (var i = 0; i < response.length; i++)
         {
            var paramName = paramNames[i];
            inputParams[paramName] = response[i].value;
         }
         
         
         
         
         var inputParamMapEL = activity.getInputParameterMapElExpression();
         // Add any parameters specified in a map
         if (inputParamMapEL != null)
         {
            var getMapSuccess = function(request1, response1) 
            {
               var inputParamMap = response1[0].value;
               
               for (var key in inputParamMap)
               {
                  adfc.internal.LogUtil.fine("adding input parameter from map: " + key + ":" + inputParamMap[key]);
                  inputParams[key] = inputParamMap[key];
               }
               
               successCallback(inputParams);
            }
            adfc.internal.LogUtil.fine("Evaluating input parameter map expression: " + inputParamMapEL);
            adfc.internal.ElUtil.getValue(inputParamMapEL, getMapSuccess, failCallback);
         } 
         else
         {
            successCallback(inputParams);
         }
      }
      
      //
      //  Collect the task flow call's input parameter values.
      //
      var params = activity.getInputParameters();

      if (params.length > 0)
      {
         for (var i = 0; i < params.length; i++)
         {
            paramExpressions.push(params[i].getValueExpression());
            paramNames.push(params[i].getName());
         }
         adfc.internal.LogUtil.fine("getting method call activity parameter values");
         adfc.internal.ElUtil.getValues(paramExpressions, getParamsSuccess, failCallback);
      }
      else 
      {
         //
         //  There aren't any input params.
         //
         adfc.internal.LogUtil.fine("no method call activity parameters specified");
         getParamsSuccess(paramExpressions, paramExpressions);
      }
   }
   
})();
/*
* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

(function(){

   adfc.internal.TaskFlowReturnActivityLogic = TaskFlowReturnActivityLogic;
   function TaskFlowReturnActivityLogic()
   {
   }
      
   TaskFlowReturnActivityLogic.prototype.execute = function(routingState, activity, successCallback, failCallback)
   {
      var controllerState = adfc.internal.AdfcContext.getControllerState();
      var currentTaskFlowEntry = controllerState.peekTaskFlowStack();
      var currentTaskFlow = currentTaskFlowEntry.getTaskFlowDefinition();
      var currentTaskFlowCallActivity = currentTaskFlowEntry.getTaskFlowCallActivity()
      if (currentTaskFlowCallActivity && (currentTaskFlowCallActivity != null))
      {
         var finalizerSuccess = function()
         {
            var gatherReturnValuesSuccess = function(returnValueDefs)
            {
               var popTfSuccess = function(poppedTfStackEntry)
               {
                  routingState.setLastReturnedFromTfEntry(poppedTfStackEntry);
                  var returnValuesSuccess = function()
                  {
                     var invokeAfterListenerSuccess = function()
                     {
                        var outcome = activity.getOutcomeName();
                        routingState.setCurrentOutcome(outcome);
                        routingState.setCurrentActivityId(currentTaskFlowCallActivity.getActivityId());
                        routingState.setNextActivityId(null);
                        routingState.setTaskFlowReturnExecuted(true);
                        routingState.setRoutingComplete(false);
                        successCallback(routingState);
                     }
                     // invoke the after-listener
                     TaskFlowReturnActivityLogic.invokeAfterListener(currentTaskFlowCallActivity, invokeAfterListenerSuccess, failCallback);
                  }
                  // store the return values in the caller
                  TaskFlowReturnActivityLogic.storeReturnValues(currentTaskFlowCallActivity, returnValueDefs, returnValuesSuccess, failCallback)
               }
               // pop the task flow from the stack
               adfc.internal.AdfcContext.getControllerState().popTaskFlow(popTfSuccess, failCallback);
            }
            // gather the retun values from the callee
            TaskFlowReturnActivityLogic.gatherReturnValues(currentTaskFlow, gatherReturnValuesSuccess, failCallback);
         }
         // invoke the finalizer
         TaskFlowReturnActivityLogic.invokeFinalizer(currentTaskFlow, finalizerSuccess, failCallback);
      }
      else
      {
         routingState.setTaskFlowReturnExecuted(true);
         routingState.setRoutingComplete(true);
         successCallback(routingState);
      }
   }


   /**
    * invokes the after-listener of a the given task flow call activity if it is specified
    */
   TaskFlowReturnActivityLogic.invokeAfterListener = function(activity, successCallback, failCallback)
   {
      //
      // invoke the after listener if specified
      //
      var listener = activity.getAfterListener();
      if (listener && (listener != null))
      {
         adfc.internal.LogUtil.fine("calling after-listener: " + listener);
         adfc.internal.ElUtil.invokeMethod(listener, new Array(), new Array(), successCallback, failCallback);
      }
      else
      {
         successCallback()
      }
   }
   

   /**
    * invokes the finalizer of a the given task flow activity if it is specified
    */
   TaskFlowReturnActivityLogic.invokeFinalizer = function(taskFlowDef, successCallback, failCallback)
   {
      //
      //  Execute the task flow's finalizer, if it has one.
      //
      var finalizer = taskFlowDef.getFinalizer();
      if (finalizer && (finalizer != null))
      {
         adfc.internal.LogUtil.fine("calling finalzer: " + finalizer);
         adfc.internal.ElUtil.invokeMethod(finalizer, new Array(), new Array(), successCallback, failCallback);
      }
      else
      {
         successCallback();
      }
   }
   
   
   
   /**
    * collects return values from the called taskflow prior to returning
    */
   TaskFlowReturnActivityLogic.gatherReturnValues = function(taskFlowDef, successCallback, failCallback)
   {
      var returnValueExpressions = new Array();
      var returnValueNames = new Array();
      
      var getReturnValuesSuccess = function(request, response)
      {
         //
         //  Build a map of the return value name/value pairs
         //
         var returnValues = {};
         for (var i = 0; i < response.length; i++)
         {
            var returnValueName = returnValueNames[i];
            returnValues[returnValueName] = response[i].value;
         }
         
         successCallback(returnValues);
      }
      
      //
      //  Collect the task flow's return values.
      //
      var values = taskFlowDef.getReturnValues();

      if (values.length > 0)
      {
         for (var i = 0; i < values.length; i++)
         {
            returnValueExpressions.push(values[i].getValueExpression());
            returnValueNames.push(values[i].getName());
         }
         adfc.internal.LogUtil.fine("getting task flow return values");
         adfc.internal.ElUtil.getValues(returnValueExpressions, getReturnValuesSuccess, failCallback);
      }
      else 
      {
         //
         //  There aren't any return values.
         //
         adfc.internal.LogUtil.fine("no task flow return values defined");
         getReturnValuesSuccess(returnValueExpressions, returnValueExpressions);
      }
   }
   
   
   /**
    * stores return values from the called taskflow into the expressions defined in the task flow call
    */
   TaskFlowReturnActivityLogic.storeReturnValues = function(currentTaskFlowCallActivity, returnValueDefs, successCallback, failCallback)
   {
      var request = new Array();
      var returnValues = currentTaskFlowCallActivity.getReturnValues();
      if ((returnValues != null) && (returnValues.length > 0))
      {
         for (var i = 0; i < returnValues.length; i++)
         {
            var returnValue = returnValues[i];
            var returnValueName = returnValue.getName();
            if (returnValueDefs[returnValueName])
            {
               var value = returnValueDefs[returnValueName];
               var elExpression = returnValue.getValueExpression();
               if ((elExpression == null) || (elExpression == ""))
               {
                  elExpression = "#{pageFlowScope." + returnValueName + "}";
               }
               request[i] = {name: elExpression, value: value};
            }
         }
         adfc.internal.ElUtil.setValues(request, successCallback, failCallback);
      }
      else
      {
         successCallback();
      }
   }
   
})();
/*
* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

(function(){

   adfc.internal.ViewActivityLogic = ViewActivityLogic;
   function ViewActivityLogic()
   {
   }
      
   ViewActivityLogic.prototype.execute = function(routingState, activity, successCallback, failCallback)
   {
      adfc.internal.LogUtil.perfLog("BEGIN: ViewActivityLogic.execute");
      routingState.setViewReached(true);
      routingState.setRoutingComplete(true);
      var currentTaskFlowEntry = adfc.internal.AdfcContext.getControllerState().peekTaskFlowStack();
      currentTaskFlowEntry.setViewReached(true);
      adfc.internal.LogUtil.perfLog("END: ViewActivityLogic.execute");
      successCallback(routingState);
   }

})();
/*
* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

(function(){

   adfc.internal.NavigationHandlerImpl = NavigationHandlerImpl;
   function NavigationHandlerImpl()
   {
   }

   NavigationHandlerImpl.getInitialViewId = function(entryPoint, inputParams, successCallback, failCallback)
   {
      //
      //  See if we're starting with a bounded task flow.
      //
      var isTaskFlow = adfc.internal.XmlUtil.isTaskFlowDocument(adfc.Util.addFeatureRootPrefix(entryPoint));
      if (adfc.internal.LogUtil.isFine())
      {
        adfc.internal.LogUtil.fine("isTaskFlow=" + isTaskFlow);
      }
      if (isTaskFlow)
      {
         //
         //  We're starting with a task flow document. Parse the task flow ID.
         //
         var taskFlowId = adfc.internal.TaskFlowId.parse(entryPoint);
         
         //
         //  Create a RoutingState.
         //
         var currentTaskFlowEntry = adfc.internal.AdfcContext.getControllerState().peekTaskFlowStack();
         var currentTfInstanceId = currentTaskFlowEntry.getInstanceId();
         var routingState = new adfc.internal.RoutingState(currentTfInstanceId, null, null);
         routingState.setRoutingSuccessCallback(successCallback);
         routingState.setRoutingFailedCallback(failCallback);
         
         var invokeSuccessCallback = function(routingState2)
         {
            var routingSuccess = function(navResult)
            {
               if (adfc.internal.LogUtil.isFine())
               {
                  adfc.internal.LogUtil.fine("ADFc: routing completed in getInitialViewId.");
               }
               
               //
               //  Mark back navigation invalid from the initial view.
               //
               var currentTfEntry = adfc.internal.AdfcContext.getControllerState().peekTaskFlowStack();
               if (currentTfEntry.getViewHistoryLength() > 0)
               {
                  var viewItem = currentTfEntry.peekViewHistory();
                  viewItem.setBackNavigationValid(false);
               }
               
               if (adfc.internal.LogUtil.isFine())
               {
                  adfc.internal.LogUtil.fine("ADFc: getInitialViewId calling successCallback.");
                  if (typeof successCallback === "undefined")
                  {
                     adfc.internal.LogUtil.fine("ADFc: successCallback is undefined!!!");
                  }
               }
               successCallback(navResult);
            }
            
            //
            //  Perform routing once we're inside the starting flow.
            //
            routingState.setRoutingSuccessCallback(routingSuccess);
            adfc.internal.ControlFlowEngine.doRouting(routingState2);
         }
         
         //
         //  Invoke the starting task flow.
         //
         adfc.internal.TaskFlowCallActivityLogic.invokeTaskFlow(taskFlowId, inputParams, null, routingState, invokeSuccessCallback, failCallback);
      }
      else 
      {
         //
         //  We're not starting with a bounded task flow so see if the entry point is
         //  a view activity in the unbounded flow.
         //
         var tfEntry = adfc.internal.AdfcContext.getControllerState().peekTaskFlowStack();
         var viewActivity = NavigationHandlerImpl.getUnboundedFlowViewActivity(entryPoint);
         if (viewActivity != null)
         {
            //
            //  We're starting with a view activity in the unbounded flow.
            //
            var pagePath = viewActivity.getVldDocumentPath();
            var viewId = viewActivity.getActivityId().getLogicalViewId();
            adfc.internal.LogUtil.info("displaying initial unbounded view activity, page=" + pagePath);
            var navResult = new adfc.NavigationResult(true, false, viewId, pagePath, "", false);
            
            //
            //  Push the initial view history item.
            //
            tfEntry.pushViewHistory(viewId, pagePath, adfc.internal.ControlFlowCase.DEFAULT_TRANSITION);
            
            successCallback(navResult);
         }
         else
         {
            //
            //  Assume the entry point is an AMX page.
            //
            adfc.internal.LogUtil.info("displaying initial AMX page, page=" + entryPoint);
            var navResult2 = new adfc.NavigationResult(true, false, entryPoint, entryPoint, "", false);
            
            //
            //  Push the initial view history item.
            //
            tfEntry.pushViewHistory(entryPoint, entryPoint, adfc.internal.ControlFlowCase.DEFAULT_TRANSITION);

            successCallback(navResult2);
         }
      }
   }
   
   NavigationHandlerImpl.getUnboundedFlowViewActivity = function(entryPoint)
   {
      var result = null;
      var currentTaskFlowEntry = adfc.internal.AdfcContext.getControllerState().peekTaskFlowStack();
      var unboundedTf = currentTaskFlowEntry.getTaskFlowDefinition();
      if ((unboundedTf == null) || (unboundedTf.getTaskFlowId() != null))
      {
         var msg = "unbounded task flow is not current";
         adfc.internal.LogUtil.showAlert(msg);
         throw new Error(msg);
      }
      
      //
      //  Look for a view activity that uses the entry point as its VDL document.
      //
      var testEntryPoint = entryPoint;
      if ((testEntryPoint != null) && (testEntryPoint.length > 0) && (testEntryPoint.charAt(0) != "/"))
      {
         testEntryPoint = "/" + testEntryPoint;
      }
      var activities = unboundedTf.getActivities();
      for (var name in activities)
      {
         var activity = activities[name];
         if (activity.getActivityType() == adfc.internal.ActivityType.VIEW)
         {
            var vdlDoc = activity.getVldDocumentPath();
            if (vdlDoc == testEntryPoint)
            {
               result = activity;
               break;
            }
         }
      }
      return result;
   }

   NavigationHandlerImpl.handleNavigation = function(currentViewId, outcome, successCallback, failCallback)
   {
      var controllerState = adfc.internal.AdfcContext.getControllerState();
      var currentTaskFlowEntry = controllerState.peekTaskFlowStack();
      var tfInstanceId = currentTaskFlowEntry.getInstanceId();
      var currentTaskFlowId = currentTaskFlowEntry.getTaskFlowDefinition().getTaskFlowId();
      var currentActivityId = adfc.internal.ViewIdUtil.logicalViewIdToActivityId(currentTaskFlowId, currentViewId);
      var routingState = new adfc.internal.RoutingState(tfInstanceId, currentActivityId, outcome);

      routingState.setRoutingSuccessCallback(successCallback);
      routingState.setRoutingFailedCallback(failCallback);
      adfc.internal.ControlFlowEngine.doRouting(routingState);
   }

})();
/*
* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

(function(){

   adfc.internal.ControlFlowEngine = ControlFlowEngine;
   function ControlFlowEngine()
   {}
   
   ControlFlowEngine.BACK_NAV_OUTCOME = "__back";
   // For backward compatability, remove after tests transition to the new value above.
   ControlFlowEngine.BACK_NAV_OUTCOME_OLD = "_BACK_BUTTON:";
      
   ControlFlowEngine.doRouting = function(routingState)
   {
      //
      //  See if routing is complete.
      //
      if (!routingState.isRoutingComplete())
      {
         //
         //  Routing is not yet complete so we need to get the ID of the next
         //  activity to be executed.
         //
         var getActivityIdComplete = function(nextActivityId, routingState1) 
         {
             if (nextActivityId != null)
             {
                //
                //  Get the activity.
                //
                var activity = ControlFlowEngine.getActivity(nextActivityId);
                if (activity)
                {
                   //
                   //  Get the implementation logic for the activity.
                   //
                   var activityLogic = ControlFlowEngine.getActivityLogic(activity);
                   if (activityLogic)
                   {
                      //
                      //  Update the routing state.
                      //
                      routingState1.setCurrentActivityId(nextActivityId);
                      routingState1.setNextActivityId(null);
                      
                      //
                      //  Execute the activity.
                      //
                      ControlFlowEngine.executeActivity(activity, activityLogic, routingState, 
                                                        ControlFlowEngine.doRouting, 
                                                        routingState1.getRoutingFailedCallback());
                      return;
                   }
                   else
                   {
                      var errMsg = "ADFc: failed to find activity logic implementation: " + activity.getActivityType();
                      routingState.getRoutingFailedCallback()(errMsg);
                   }
                }
                else
                {
                    var errMsg2 = "ADFc: failed to find activity: " + nextActivityId;
                    routingState.getRoutingFailedCallback()(errMsg2);
                }
             }
             else
             {
                //
                //  We're not able to tell what activity to execute next.
                //
                routingState1.setRoutingComplete(true);
                ControlFlowEngine.doRouting(routingState1);
                return;
             }
         };
         ControlFlowEngine.getNextActivityId(routingState, getActivityIdComplete);
         return;
      }
      
      if (routingState.isRoutingComplete() && (routingState.getNavigationResult() == null))
      {
          if (routingState.getNavigationResult() == null)
          {
            if (adfc.internal.LogUtil.isFine())
            {
               adfc.internal.LogUtil.fine("ADFc: constructing navigation result.");
            }

            var currentTaskFlowEntry = adfc.internal.AdfcContext.getControllerState().peekTaskFlowStack();

            //
            //  Do we have back navigation?
            //
            var backNav = routingState.getBackNavigation();
            if (backNav)
            {
               //
               //  Is back navigation valid from the view we're currently on?
               //
               if (!routingState.isBackNavTfPopped() && !currentTaskFlowEntry.peekViewHistory().isBackNavigationValid())
               {
                  if (adfc.internal.LogUtil.isFine())
                  {
                     adfc.internal.LogUtil.fine("ADFc: invalid back navigation detected, throwing an error.");
                  }
                  throw new Error("back navigation is not valid from the current view");
               }
               
               //
               //  Will the back navigation result in the current task flow being exited?
               //
               else if ((currentTaskFlowEntry.getViewHistoryLength() == 1) && !routingState.isBackNavTfPopped())
               {
                  //
                  //  Back navigation out of the TF.  We need to pop the flow that was exited.
                  //
                  if (adfc.internal.LogUtil.isFine())
                  {
                     adfc.internal.LogUtil.fine("ADFc: back navigation out of a task flow, popping flow.");
                  }
                  var currentViewItem = currentTaskFlowEntry.peekViewHistory();
                  routingState.setBackNavTfLeftViewItem(currentViewItem);
                  
                  var popSuccessCallback = function()
                  {
                     if (adfc.internal.LogUtil.isFine())
                     {
                        adfc.internal.LogUtil.fine("ADFc: task flow pop completed.");
                     }
                     var routingState1 = ControlFlowEngine.getCurrentRoutingState();
                     ControlFlowEngine.clearCurrentRoutingState();
                     routingState1.setBackNavTfPopped(true);
                     ControlFlowEngine.doRouting(routingState1);
                     return;
                  }
                      
                  ControlFlowEngine.setCurrentRoutingState(routingState);
                  var controllerState = adfc.internal.AdfcContext.getControllerState();
                  controllerState.popTaskFlow(popSuccessCallback, routingState.getRoutingFailedCallback());
                  return;
               }
               
               //
               //  See if we have already popped a back navigation exited flow.
               //
               else if (routingState.isBackNavTfPopped())
               {
                   //
                   //  We already popped the exited flow so create a result based on the
                   //  view we're returning to.
                   //
                   if (adfc.internal.LogUtil.isFine())
                   {
                      adfc.internal.LogUtil.fine("ADFc: back navigation out of a task flow, flow already popped.");
                   }
                   var leftViewItem = routingState.getBackNavTfLeftViewItem();
                   var returnedToViewItem = currentTaskFlowEntry.peekViewHistory();
                   var navResult = ControlFlowEngine.constructBackNavResult(leftViewItem, returnedToViewItem);
                   routingState.setNavigationResult(navResult);
                   (routingState.getRoutingSuccessCallback())(routingState.getNavigationResult());
               }
               else
               {
                  //
                  //  Back navigation occurred within the same flow.
                  //
                  if (adfc.internal.LogUtil.isFine())
                  {
                     adfc.internal.LogUtil.fine("ADFc: back navigation within a task flow.");
                  }
                  var leftViewItem1 = currentTaskFlowEntry.popViewHistory();
                  var returnedToViewItem1 = currentTaskFlowEntry.peekViewHistory();
                  var navResult1 = ControlFlowEngine.constructBackNavResult(leftViewItem1, returnedToViewItem1);
                  routingState.setNavigationResult(navResult1);
                  (routingState.getRoutingSuccessCallback())(routingState.getNavigationResult());
               }
            }
            else
            {
               //
               //  We either had forward navigation or no navigation at all.
               //
               if (adfc.internal.LogUtil.isFine())
               {
                  adfc.internal.LogUtil.fine("ADFc: forward navigation.");
               }
               var navResult2 = ControlFlowEngine.constructForwardNavResult(routingState);
               routingState.setNavigationResult(navResult2);
                   
               //
               //  See if back navigation is valid from the view we reached (if we reached a view).
               //  If we navigated to a view and we exited a task flow then back navigation is not
               //  valid.
               //
               if (routingState.isViewReached() && routingState.isTaskFlowReturnExecuted())
               {
                  //
                  //  Back navigation is not valid in this case.
                  //
                  var currentViewItem2 = currentTaskFlowEntry.peekViewHistory();
                  currentViewItem2.setBackNavigationValid(false);
               }
            
               //
               //  Pass the navigation result back to the success function.
               //
               (routingState.getRoutingSuccessCallback())(routingState.getNavigationResult());
            }
         }
      }
   }
   
   /**
    * Construct a NavigationResult object based on back navigation.
    */
   ControlFlowEngine.constructBackNavResult = function(backFromViewItem, retunredToViewItem)
   {
      if (adfc.internal.LogUtil.isFine())
      {
         adfc.internal.LogUtil.fine("ADFc: constructing back navigation result.");
      }
      newViewId = retunredToViewItem.viewId;
      vdlDocPath = retunredToViewItem.amxPage;
      transition = backFromViewItem.transitionType;
      var result = new adfc.NavigationResult(false, true, newViewId, vdlDocPath, transition, false);
      adfc.internal.ElUtil.setMfContextInstance(retunredToViewItem, false);
      ControlFlowEngine.logNavResult(result);
      return result;
   }
   
   /**
    * Construct a NavigationResult object based on forward (or no) navigation.
    */
   ControlFlowEngine.constructForwardNavResult = function(routingState)
   {
      if (adfc.internal.LogUtil.isFine())
      {
         adfc.internal.LogUtil.fine("ADFc: constructing forward navigation result.");
      }

      var finalViewId = null;
      var newViewId = null;
      var transition = null;
      var currentTaskFlowEntry = adfc.internal.AdfcContext.getControllerState().peekTaskFlowStack();
      
      //
      //  See if we navigated to a new view.  If the starting and ending task flow instance ID
      //  and viewId are the same then we didn't reach a new view, otherwise we did.
      //
      var newView = routingState.isViewReached();
      if (newView)
      {
          finalViewId = routingState.getCurrentActivityId();
          
          var startingTfInstance = routingState.getStartingTaskFlowInstanceId();
          var currentTfInstance = currentTaskFlowEntry.getInstanceId();
          if (startingTfInstance == currentTfInstance)
          {
             //
             //  We're still in the same task flow.
             //
             var startingViewId = routingState.getStartingActivityId();
             if ((finalViewId != null) && (startingViewId != null) && (startingViewId == finalViewId))
             {
                newView = false;
             }
             else if ((finalViewId == null) && (startingViewId == null))
             {
                newView = false;
             }
          }
          
          //
          //  Figure out what type of transition to use for the new view.
          //
          transition = routingState.getTransition();
      }
      else
      {
         //
         //  See if we returned from a bounded task flow.
         //
         var tfEntry = routingState.getLastReturnedFromTfEntry();
         if (tfEntry != null)
         {
            //
            //  Navigation didn't reach a new view but we did return from a task flow.
            //  In this case return to the calling view activity in the flow we've
            //  returned to.
            //
            finalViewId = tfEntry.getCallingViewActivityId();
         }
      }

      var vdlDocPath = null;
      if (finalViewId != null)
      {
         newViewId = finalViewId.getLogicalViewId();
         var localId = finalViewId.getLocalActivityId();
         var finalActivity = (currentTaskFlowEntry.getTaskFlowDefinition().getActivities())[localId];
         vdlDocPath = finalActivity.getVldDocumentPath();
      }
      
      if (transition == null)
      {
         transition = adfc.internal.ControlFlowCase.DEFAULT_TRANSITION;
      }
      
      if (newView)
      {
         //
         //  Push a new view history entry.
         //
         currentTaskFlowEntry.pushViewHistory(newViewId, vdlDocPath, transition);
      }
      else if (finalViewId != null)
      {
         //
         //  Reset the MfContextInstance.
         //
         adfc.internal.ElUtil.setMfContextInstance(currentTaskFlowEntry.peekViewHistory(), false);
      }

      var result = new adfc.NavigationResult(newView, false, newViewId, vdlDocPath, transition, false);
      ControlFlowEngine.logNavResult(result);
      return result;
   }

   ControlFlowEngine.logNavResult = function(navResult)
   {
      if (adfc.internal.LogUtil.isFine())
      {
         var msg = "ADFc: navigationResult:" + 
            " isNewViewId=" + navResult.mNewViewId +
            " isBackNav=" + navResult.mBackNavigation +
            " viewId=" + navResult.mViewId +
            " vdlDocPath=" + navResult.mVdlDocumentPath +
            " transitionType=" + navResult.mTransitionType +
            " featureExited=" + navResult.mFeatureExited;
         adfc.internal.LogUtil.fine(msg);
      }
   }
   
   ControlFlowEngine.getNextActivityId = function(routingState, complete)
   {
      //
      //  If the routing state already has a next activity defined then that's
      //  what we want to use.
      //
      var result = routingState.getNextActivityId();
      if (result) 
      {
         complete(result, routingState);
      }
      else
      {
         //
         //  Check for a special outcome.
         //
         var currentOutcome = routingState.getCurrentOutcome();
         if ((currentOutcome == ControlFlowEngine.BACK_NAV_OUTCOME) || 
             (currentOutcome == ControlFlowEngine.BACK_NAV_OUTCOME_OLD))
         {
            routingState.setBackNavigation(true);
            routingState.setRoutingComplete(true);
            complete(result, routingState);
         }
         else
         {
            //
            //  Evaluate the control flow rules to determine the next activity.
            //
            var findCfCaseComplete = function(routingState1) 
            {
               var cfCase = routingState1.getControlFlowCase();
               if (cfCase)
               {
                 result = cfCase.getTargetActivityId();
                 routingState1.setTransition(cfCase.getTransition());
               }
               complete(result, routingState1);
            };
            routingState.setFindCfCaseCallback(findCfCaseComplete);
            routingState.resetCfRuleEvaluation();
            ControlFlowEngine.findControlFlowCase(routingState);
         }
      }
   }
   
   ControlFlowEngine.findControlFlowCase = function(routingState)
   {
      var result = null;

      //
      //  We need to evaluate the control flow rules.  Get the current set
      //  of control flow rules from the current page flow.
      //
      var currentTaskFlowEntry = adfc.internal.AdfcContext.getControllerState().peekTaskFlowStack();
      var currentTaskFlow = currentTaskFlowEntry.getTaskFlowDefinition();

      //
      //  Get the best matching control flow rule.
      //
      var alreadyTried = routingState.getTriedCfRules();

      //
      //  Get the best matching rule that has not already been tried.
      //
      var currentActivityId = routingState.getCurrentActivityId();
      var cfRule = ControlFlowEngine.getBestControlFlowRule(currentTaskFlow, currentActivityId, alreadyTried);
      if (cfRule != null)
      {
         //
         //  A rule was found.  Check to see if it has a matching control
         //  flow case.
         //
         var cfCase = cfRule.getControlFlowCase(routingState.getCurrentOutcome());
         if (cfCase != null)
         {
            //
            // Check the guard condition
            //
            var guardConditionCallback = function(executeCase, routingState1) 
            {
               if (executeCase)
               {
                  //
                  //  A matching control flow case was found. Use it to identify
                  //  the next activity to be executed.
                  //
                  result = cfCase;
                  routingState.setControlFlowCase(result);
                  routingState.getFindCfCaseCallback()(routingState);
               }
               else
               {
                  //
                  //  A matching control flow case was not found.  Add this rule's
                  //  from activity ID to the set of one's already tried and try again.
                  //
                  alreadyTried[cfRule.getFromActivityId().getLocalActivityId()] = true;
                  ControlFlowEngine.findControlFlowCase(routingState);
               }
            };
            var guardCondition = cfCase.getGuardCondition();
            ControlFlowEngine.evaluateGuardCondition(guardCondition, routingState, guardConditionCallback);
         }
         else
         {
            //
            //  A matching control flow case was not found.  Add this rule's
            //  from activity ID to the set of one's already tried and try again.
            //
            alreadyTried[cfRule.getFromActivityId().getLocalActivityId()] = true;
            ControlFlowEngine.findControlFlowCase(routingState);
         }
      }
      else
      {
         //
         //  No control flow rule was found.
         //
         routingState.getFindCfCaseCallback()(routingState);
      }
   }
   
   ControlFlowEngine.getBestControlFlowRule = function(pageFlow, fromId, excludeSet)
   {
      var WILDCARD_ID = "*";
      var result = null;

      //
      // The best matching rule is an exact match on the fromId.  Next, the best
      // matching rule is the one that has a fromId that ends with an asterisk,
      // matches the fromId up until the asterisk, and is the longest.
      //
      var cfRules = pageFlow.getControlFlowRules();
      if (fromId != null)
      {
         var localId = fromId.getLocalActivityId();
         if (!excludeSet[localId])
         {
            result = cfRules[localId];
         }
      }
      if (result == null)
      {
         //
         //  We didn't find an exact match so now we need to look for a best match.
         //  Get a hash map of control flow rules keyed by the local activity ID.
         //

         //
         //  Check for a null from activity ID.
         //
         if (fromId == null)
         {
            //
            //  See if there is a wild card rule that can be used.
            //
            if (!excludeSet[WILDCARD_ID])
            {
               result = cfRules[WILDCARD_ID];
            }
         }
         else
         {
            //
            //  Look for the longest match that ends with an asterisk.
            //
            var localActivityId = fromId.getLocalActivityId();
            for (var i = localActivityId.length - 1; i >= 0; i--)
            {
               var key = localActivityId.substring(0, i) + WILDCARD_ID;
               if (!(excludeSet[key]))
               {
                  result = cfRules[key];
                  if (result != null)
                  {
                     break;
                  }
               }
            }
         }
      }

      return result;
   }

   ControlFlowEngine.evaluateGuardCondition = function(guardCondition, routingState, callback)
   {
      if (guardCondition != null)
      {
         var evalSuccessCallback = function(request, response) 
         {
            var value = response[0].value;
            value = adfc.internal.ElUtil.resultToBoolean(value);
            callback(value, routingState);
         }
         var evalFailedCallback = function(request, response) 
         {
            var errMsg = "ADFc: evaluation of control flow guard condition failed: " + request[0];
            routingState.getRoutingFailedCallback()(errMsg);
         }
         adfc.internal.LogUtil.fine("evaluateing control flow guard condition: " + guardCondition);
         adfc.internal.ElUtil.getValue(guardCondition, evalSuccessCallback, evalFailedCallback);
      }
      else
      {
         callback(true, routingState);
      }
   }
   
   ControlFlowEngine.getActivity = function(activityId)
   {
      var result = null;
      var currentTaskFlowEntry = adfc.internal.AdfcContext.getControllerState().peekTaskFlowStack();
      var taskFlowDef = currentTaskFlowEntry.getTaskFlowDefinition();
      if (taskFlowDef)
      {
         var activities = taskFlowDef.getActivities();
         if (activities)
         {
            var localId = activityId.getLocalActivityId();
            result = activities[localId];
         }
         else
         {
            throw new Error("ADFc: task flow " + taskFlowDef.getTaskFlowId() + " does not have any activities");
         }
      }
      else
      {
         throw new Error("ADFc: failed to find task flow definition");
      }
      return result;
   }
   
   ControlFlowEngine.getActivityLogic = function(activity)
   {
      var type = activity.getActivityType();
      var result = adfc.internal.ActivityLogic.getImplementation(type);
      return result;
   }
   
   ControlFlowEngine.executeActivity = function(activity, activityLogic, routingState, successCallback, failCallback) 
   {
      if (adfc.internal.LogUtil.isFine())
      {
         adfc.internal.LogUtil.fine("ADFc: executing ControlFlowEngine.executeActivity(), activityId=" + 
                                     activity.getActivityId());
      }
      
      //
      //  Sanity check.
      //
      if (routingState.isRoutingComplete())
      {
         adfc.internal.LogUtil.severe("ADFc: attempting to execute activity when routing is already complete");
      }
      
      var bcChanged = false;
      var originalBindingPath = null;
      
      var setBCPathSuccess = function()
      {
         //
         //  Execute the activity.
         //
         var exeSuccess = function(rState)
         {
            if (adfc.internal.LogUtil.isFine())
            {
               adfc.internal.LogUtil.fine("ADFc: execution of " + activity.getActivityId() + " succeeded.");
            }
            
            //
            //  Restore the binding container if necessary.
            //
            var restoreBCPathSuccess = function()
            {
               successCallback(rState);
            }
            var restoreBCPathFailed = function()
            {
               failCallback("failed to restore binding container following activity execute");
            }
            if (bcChanged)
            {
               adfc.internal.ElUtil.setBindingContainerPath(originalBindingPath, restoreBCPathSuccess, restoreBCPathFailed);
            }
            else
            {
               restoreBCPathSuccess();
            }
         }
         var exeFailed = function(message)
         {
            if (adfc.internal.LogUtil.isFine())
            {
               adfc.internal.LogUtil.fine("ADFc: execution of " + activity.getActivityId() + " failed.");
            }

            var callback = function()
            {
               failCallback(message);
            }
            adfc.internal.ElUtil.setBindingContainerPath(originalBindingPath, callback, callback);
         }
         activityLogic.execute(routingState, activity, exeSuccess, exeFailed);
      }
      
      var setBCPathFailed = function()
      {
         failCallback("failed to set the binding container path to: " + activityBindingPath);
      }
      
      var getBCPathSuccess = function(req, path)
      {
         originalBindingPath = path;
         var activityBindingPath = ControlFlowEngine.getActivityBindingPath(activity);
                  
         //
         //  See if we need to switch the binding containers.
         //
         if ((originalBindingPath != null) || (activityBindingPath != null))
         {
            //
            //  We need to switch.
            //
            bcChanged = true;
            adfc.internal.ElUtil.setBindingContainerPath(activityBindingPath, setBCPathSuccess, setBCPathFailed);
         }
         else
         {
            //
            //  No need to switch.
            //
            setBCPathSuccess();
         }
      }
      
      var getBCPathFailed = function()
      {
         failCallback("Failed to get the current binding container path");
      }
      
      //
      //  If the activity we're about to execute is NOT a view activity then get the current
      //  binding context path so we can swith and later switch back.
      //
      if (activity.getActivityType() != adfc.internal.ActivityType.VIEW)
      {
        //
        //  This is a non-view activity so switch the binding context.
        //
        adfc.internal.ElUtil.getCurrentBindingContainerPath(getBCPathSuccess, getBCPathFailed);
      }
      else 
      {
        //
        //  This is a view activity so we don't need to switch the binding context.
        //
        setBCPathSuccess();
      }
   }
   
   ControlFlowEngine.getActivityBindingPath = function(activity)
   {
      //
      //  This method only returns a binding container path for method-call activities.
      //  The binding container for a view activity will be set by the AMX layer when
      //  if set the new page.
      //
      var bindingPath = null;
      var activityType = activity.getActivityType();
      if (activityType == adfc.internal.ActivityType.METHOD_CALL || 
          activityType == adfc.internal.ActivityType.TASK_FLOW_CALL ||
          activityType == adfc.internal.ActivityType.TASK_FLOW_RETURN )
      {
         bindingPath = activity.getActivityId().toString();
      }
      return bindingPath;
   }

   /**
    * Store the current routing state on a global so we can find it later.
    * Poor man's version of a Java thread local.
    */
   ControlFlowEngine.setCurrentRoutingState = function(instance)
   {
      adfc.internal.ControlFlowEngine.currentRoutingState = instance;
   }
   ControlFlowEngine.getCurrentRoutingState = function()
   {
      var result = null;
      if (typeof adfc.internal.ControlFlowEngine.currentRoutingState !== "undefined")
      {
         result = adfc.internal.ControlFlowEngine.currentRoutingState;
      }
      return result;
   }
   ControlFlowEngine.clearCurrentRoutingState = function()
   {
      if (typeof adfc.internal.ControlFlowEngine.currentRoutingState !== "undefined")
      {
         adfc.internal.ControlFlowEngine.currentRoutingState = null;
      }
   }
   
})();
/**
*
* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

(function(){

   adfc.internal.RoutingState = RoutingState;
   function RoutingState(startingTfInstanceId, currentActivityId, currentOutcome)
   {
      this.mStartingTfInstanceId = startingTfInstanceId;
      this.mStartingActivityId = currentActivityId;
      this.mCurrentActivityId = currentActivityId;
      this.mCurrentOutcome = currentOutcome;
      this.mNextActivityId = null;
      this.mRoutingComplete = false;
      this.mViewReached = false;
      this.mBackNavigation = false;
      this.mTaskFlowReturnExecuted = false;
      this.mTransition = null;
      this.mControlFlowCase = null;
      this.mTriedCfRules = {};
      
      this.mNavigationResult = null;
      
      this.mRoutingSuccessCallback = null;
      this.mRoutingFailedCallback = null;
      this.mFindCfCaseCallback = null;
      
      this.mBackNavTfPopped = false;  //  If back nav out of a TF has the TF been popped yet?
      this.mBackNavTfLeftViewItem = null;  //  If back nav out of a TF the view item being left.
      
      this.mLastReturnedFromTfEntry = null;  // Stack entry popped during the last TF return activity.
   }

   RoutingState.prototype.getStartingTaskFlowInstanceId = function()
   {
      return this.mStartingTfInstanceId;
   }
   
   RoutingState.prototype.getStartingActivityId = function()
   {
      return this.mStartingActivityId;
   }
   
   RoutingState.prototype.getCurrentActivityId = function()
   {
      return this.mCurrentActivityId;
   }
   
   RoutingState.prototype.setCurrentActivityId = function(activityId)
   {
      this.mCurrentActivityId = activityId;
   }
   
   RoutingState.prototype.getCurrentOutcome = function()
   {
      return this.mCurrentOutcome;
   }
   
   RoutingState.prototype.setCurrentOutcome = function(outcome)
   {
      this.mCurrentOutcome = outcome;
   }
   
   RoutingState.prototype.getNextActivityId = function()
   {
      return this.mNextActivityId;
   }
   
   RoutingState.prototype.setNextActivityId = function(activityId)
   {
      this.mNextActivityId = activityId;
   }
   
   RoutingState.prototype.isRoutingComplete = function()
   {
      return this.mRoutingComplete;
   }
   
   RoutingState.prototype.setRoutingComplete = function(value)
   {
      this.mRoutingComplete = value;
   }
   
   RoutingState.prototype.isViewReached = function()
   {
      return this.mViewReached;
   }
   
   RoutingState.prototype.setViewReached = function(value)
   {
      this.mViewReached = value;
   }
   
   RoutingState.prototype.setNavigationResult = function(result)
   {
      this.mNavigationResult = result;
   }
   
   RoutingState.prototype.getNavigationResult = function()
   {
      return this.mNavigationResult;
   }
   
   RoutingState.prototype.setRoutingSuccessCallback = function(callback)
   {
      this.mRoutingSuccessCallback = callback;
   }
   
   RoutingState.prototype.getRoutingSuccessCallback = function()
   {
      return this.mRoutingSuccessCallback;
   }
   
   RoutingState.prototype.setRoutingFailedCallback = function(callback)
   {
      this.mRoutingFailedCallback = callback;
   }
   
   RoutingState.prototype.getRoutingFailedCallback = function()
   {
      return this.mRoutingFailedCallback;
   }
   
   RoutingState.prototype.setBackNavigation = function(value)
   {
      this.mBackNavigation = value;
   }
   
   RoutingState.prototype.getBackNavigation = function()
   {
      return this.mBackNavigation;
   }
   
   RoutingState.prototype.setTaskFlowReturnExecuted = function(value) 
   {
      this.mTaskFlowReturnExecuted = value;
   }
   
   RoutingState.prototype.isTaskFlowReturnExecuted = function() 
   {
      return this.mTaskFlowReturnExecuted;
   }
   
   RoutingState.prototype.setTransition = function(value) 
   {
      this.mTransition = value;
   }
   
   RoutingState.prototype.getTransition = function() 
   {
      return this.mTransition;
   }
   
   RoutingState.prototype.setFindCfCaseCallback = function(callback) 
   {
      this.mFindCfCaseCallback = callback;
   }
   
   RoutingState.prototype.getFindCfCaseCallback = function() 
   {
      return this.mFindCfCaseCallback;
   }
   
   RoutingState.prototype.setControlFlowCase = function(cfCase) 
   {
      this.mControlFlowCase = cfCase;
   }
   
   RoutingState.prototype.getControlFlowCase = function() 
   {
      return this.mControlFlowCase;
   }
   
   RoutingState.prototype.getTriedCfRules = function() 
   {
      return this.mTriedCfRules;
   }

   RoutingState.prototype.isBackNavTfPopped = function() 
   {
      return this.mBackNavTfPopped;
   }

   RoutingState.prototype.setBackNavTfPopped = function(value) 
   {
      this.mBackNavTfPopped = value;
   }

   RoutingState.prototype.setBackNavTfLeftViewItem = function(item) 
   {
      this.mBackNavTfLeftViewItem = item;
   }
   
   RoutingState.prototype.getBackNavTfLeftViewItem = function() 
   {
      return this.mBackNavTfLeftViewItem;
   }

   RoutingState.prototype.setLastReturnedFromTfEntry = function(entry) 
   {
      this.mLastReturnedFromTfEntry = entry;
   }
   
   RoutingState.prototype.getLastReturnedFromTfEntry = function() 
   {
      return this.mLastReturnedFromTfEntry;
   }

   /**
    * Reset the routing state before control flow rule evaluation.
    */
   RoutingState.prototype.resetCfRuleEvaluation = function() 
   {
      this.mTriedCfRules = {};
      this.mControlFlowCase = null;
   }
   
})();
/*
* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

(function(){

  /**
   *  Service for fetching various metadata resources.
   */
  adfc.internal.MetadataService = MetadataService;
  function MetadataService()
  {
  }

  /**
   * @param ID of the task flow to be fetched.
   * @return  the requested task flow definition of null if the
   *          task flow could not be found.
   */
   MetadataService.getTaskFlowDefinition = function(taskFlowId, successCallback, failCallback)
   {
      var docPath = taskFlowId.getDocumentUri();
      if (docPath != null)
      {
         var filePath = adfc.Util.addFeatureRootPrefix(docPath);
         if (adfc.internal.LogUtil.isFine()) 
         {
            adfc.internal.LogUtil.fine("attempting to load task flow file: " + filePath);
         }
         var document = adfc.internal.XmlUtil.loadXmlFile(filePath);
         if (document != null)
         {
           var tfNodes = document.getElementsByTagName("task-flow-definition");
           if (adfc.internal.LogUtil.isFine()) 
           {
              adfc.internal.LogUtil.fine("number of task-flow-definition elements in the file = " + tfNodes.length);
           }
           var result = null;
           for (var i = 0; i < tfNodes.length; i++)
           {
              var tfNode = tfNodes.item(i);
              var taskFlowDef = adfc.internal.TaskFlowDefinitionXmlParser.parse(docPath, document, tfNode);
              if (taskFlowDef)
              {
                 if (taskFlowDef.getTaskFlowId().equals(taskFlowId))
                 {
                    result = taskFlowDef;
                    break;
                 }
              }
           }
           if (result != null) 
           {
              successCallback(taskFlowId, result);
           }
           else
           {
              failCallback(taskFlowId, "failed to find task flow definition");
           }
         }
         else 
         {
            adfc.internal.LogUtil.severe("failed to load task flow file " + filePath);
            failCallback(taskFlowId, "task flow DOM is null");
         }
      }
   }
   
   MetadataService.loadBootstrapMetadata = function(successCallback, failCallback) 
   {
      adfc.internal.LogUtil.fine("loading bootstrap metadata ...");
      
      var unboundedFlowDocPath = adfc.Util.addFeatureRootPrefix("adfc-mobile-config.xml");
      var document = adfc.internal.XmlUtil.loadXmlFile(unboundedFlowDocPath);

      //
      //  Get the "adfc-mobile-config" element from the file.
      //
      if (document != null)
      {
         var nodes = document.getElementsByTagName("adfc-mobile-config");
         if ((nodes != null) && (nodes.length == 1))
         {
            var unboundedFlowNode = nodes[0];
            var unboundedFlowDef = 
               adfc.internal.TaskFlowDefinitionXmlParser.parse(null, document, unboundedFlowNode);
            if (unboundedFlowDef != null)
            {
               var loadBootstrapSuccess = function()
               {
                  adfc.internal.LogUtil.fine("bootstrap metadata load complete.");
                  successCallback();
               }
               var controllerState = adfc.internal.AdfcContext.getControllerState();
               controllerState.pushTaskFlow(unboundedFlowDef, null, null, loadBootstrapSuccess, failCallback);
            }
            else
            {
               var msg = "failed to parse the adfc-mobile-config element in bootstrap metadata document";
               adfc.internal.LogUtil.severe(msg);
               throw new Error(msg);
            }
         }
         else
         {
            var msg2 = "failed to find adfc-mobile-config element in bootstrap metadata document";
            adfc.internal.LogUtil.severe(msg2);
            throw new Error(msg2);
         }
      }
      else
      {
         var msg3 = "bootstrap metadata document adfc-mobile-config.xml is null";
         adfc.internal.LogUtil.severe(msg3);
         throw new Error(msg3);
      }
   }

})();
/*
* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

(function(){

   /**
    * Unique identifier of an activity.
    */
   adfc.internal.ActivityId = ActivityId;
   function ActivityId(taskFlowId, localId)
   {
      this.mTaskFlowId = taskFlowId;
      this.mLocalActivityId = localId;
   }
   
   /**
    * Parses a string representation of a task flow ID and returns an
    * ActivityId object.
    */
   ActivityId.parse = function(stringId)
   {
      var result = null;
      
      //
      //  The expected format is <task-flow-id>@<local-id>.
      //
      var index = stringId.indexOf("@");
      if (index > 0)
      {
         var tfIdString = stringId.substring(0, index);
         var tfId = adfc.internal.TaskFlowId.parse(tfIdString);
         var localId = stringId.substring(index+1);
         result = new ActivityId(tfId, localId);
      }
      return result;
   }
   
   ActivityId.prototype.getTaskFlowId = function()
   {
      return this.mTaskFlowId;
   }
   
   ActivityId.prototype.getLocalActivityId = function()
   {
      return this.mLocalActivityId;
   }
   
   /**
    * Constructs the logical viewId which is a cancatination of the
    * task flow's localId and the activity's localId.
    */
   ActivityId.prototype.getLogicalViewId = function()
   {
      var tfLocalId = "";
      if (this.mTaskFlowId != null)
      {
         tfLocalId = "/" + this.mTaskFlowId.getLocalTaskFlowId();
      }
      var result = tfLocalId + "/" + this.mLocalActivityId;
      return result;
   }
   
   ActivityId.prototype.toString = function()
   {
      var tfn = (this.mTaskFlowId != null)? this.mTaskFlowId.toString() : "";
      var result = tfn + "@" + this.mLocalActivityId;
      return result;
   }
   
   ActivityId.prototype.equals = function(other)
   {
      var result = false;
      if (other != null)
      {
         if ((typeof other.mTaskFlowId !== "undefined") && (typeof other.mLocalActivityId !== "undefined"))
         {
            if (this.mTaskFlowId != null)
            {
               //
               //  See if the taskFlowIds match.
               //
               if (this.mTaskFlowId.equals(other.mTaskFlowId))
               {
                  //
                  //  See if the local activityIds match.
                  //
                  result = (this.mLocalActivityId == other.mLocalActivityId);
               }
            }
            else if (other.mTaskFlowId == null)
            {
               //
               //  Both taskFlowIds are null.
               //
               result = (this.mLocalActivityId == other.mLocalActivityId);
            }
         }
      }
      return result;
   }
  
})();
/*
* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

(function(){

   adfc.internal.ActivityType = ActivityType;
   function ActivityType()
   {}
   
   ActivityType.VIEW = "view";
   ActivityType.ROUTER = "router";
   ActivityType.METHOD_CALL = "method-call";
   ActivityType.TASK_FLOW_RETURN = "task-flow-return";
   ActivityType.TASK_FLOW_CALL = "task-flow-call";

})();
/*
* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

(function(){

   /**
    * Represents a task flow control flow case.
    */
   adfc.internal.ControlFlowCase = ControlFlowCase;
   ControlFlowCase.DEFAULT_TRANSITION = "slide";
   function ControlFlowCase(outcome, guardCondition, toActivityId, transition)
   {
      this.mOutcome = outcome;
      this.mGuardCondition = guardCondition;
      this.mTargetActivityId = toActivityId;
      if (transition != null)
      {
         this.mTransition = transition;
      }
      else
      {
         this.mTransition = ControlFlowCase.DEFAULT_TRANSITION;
      }
   }

   ControlFlowCase.prototype.getOutcome = function()
   {
      return this.mOutcome;
   }

   ControlFlowCase.prototype.getGuardCondition = function()
   {
      return this.mGuardCondition;
   }

   ControlFlowCase.prototype.getTargetActivityId = function()
   {
      return this.mTargetActivityId;
   }

   ControlFlowCase.prototype.getTransition = function()
   {
      return this.mTransition;
   }

})();
/*
* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

(function(){

   /**
    * Represents a task flow control flow rule.
    */
   adfc.internal.ControlFlowRule = ControlFlowRule;
   function ControlFlowRule(fromActivityId, controlFlowCases)
   {
      this.mFromActivityId = fromActivityId;
      this.mControlFlowCases = controlFlowCases;
   }

   ControlFlowRule.prototype.getFromActivityId = function()
   {
      return this.mFromActivityId;
   }

   ControlFlowRule.prototype.getControlFlowCases = function()
   {
      return this.mControlFlowCases;
   }
   
   ControlFlowRule.prototype.addControlFlowCases = function(cases)
   {
      if (cases != null)
      {
         for (var newIndex in cases)
         {
            var newCase = cases[newIndex];
            var outcome = newCase.getOutcome();
            var index = this.getControlFlowCaseIndex(outcome);
            if (index >= 0)
            {
               this.mControlFlowCases[index] = newCase;
            }
            else
            {
               this.mControlFlowCases.push(newCase)
            }
         }
      }
   }
   
   /**
    *  Get the control flow case for a specific outcome value.  If there is no matching case for the given outcome and a
    *  default case exists (null from-outcome) then we'll return the default
    */
   ControlFlowRule.prototype.getControlFlowCase = function(outcome)
   {
      var result = null;
      var index = this.getControlFlowCaseIndex(outcome);
      if (index >= 0)
      {
         result = this.mControlFlowCases[index];
      }
      return result;
   }

   ControlFlowRule.prototype.getControlFlowCaseIndex = function(outcome)
   {
      // ADFmf handles default control flow case logic slightly differently than bigADF.  All cases are stored in the 
      // same Array.  The default (if it exists) has a null Outcome, so while we're iterating over the cases we'll also 
      // attempt to find the default.  If we don't find an exact match, then return the default.
      
      var result = -1;
      for (var index in this.mControlFlowCases)
      {
         var cfCase = this.mControlFlowCases[index];
         var testOutcome = cfCase.getOutcome();
         if (testOutcome == outcome)
         {
            result = index;
            break;
         }
         if (testOutcome == null)
         {
            result = index;
            // we've found the default to use if we don't find an exact match.  Don't break here because we need to 
            // continue searching for an exact match
         }
      }
      return result;
   }

})();
/*
* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

(function(){

   adfc.internal.ManagedBeanDefinition = ManagedBeanDefinition;
   function ManagedBeanDefinition(name, type, scope, props)
   {
      this.mBeanName = name;
      this.mBeanClass = type;
      this.mBeanScope = scope;
      this.mManagedProperties = props;
   }
   
   ManagedBeanDefinition.prototype.getBeanName = function() 
   {
      return this.mBeanName;
   }
   
   ManagedBeanDefinition.prototype.getBeanClass = function() 
   {
      return this.mBeanClass;
   }
   
   ManagedBeanDefinition.prototype.getBeanScope = function() 
   {
      return this.mBeanScope;
   }
   
   ManagedBeanDefinition.prototype.getManagedProperties = function() 
   {
      return this.mManagedProperties;
   }
   
   //
   //  Constents used to specify a bean's scope.
   //
   ManagedBeanDefinition.APPLICATION = "application";
   ManagedBeanDefinition.PAGE_FLOW = "pageFlow";
   ManagedBeanDefinition.VIEW = "view";

})();
/*
* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

(function(){

   adfc.internal.ManagedPropertyDefinition = ManagedPropertyDefinition;
   function ManagedPropertyDefinition(name, type, value)
   {
      this.mName = name;
      this.mType = type;
      this.mValue = value;
   }
   
   ManagedPropertyDefinition.prototype.getName = function() 
   {
      return this.mName;
   }
   
   ManagedPropertyDefinition.prototype.getType = function() 
   {
      return this.mType;
   }
   
   ManagedPropertyDefinition.prototype.getValue = function() 
   {
      return this.mValue;
   }

})();
/*
* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

(function(){

   /**
    * Represents a method-call activity.
    */
   adfc.internal.MethodCallActivity = MethodCallActivity;
   function MethodCallActivity(id, methodEl, defaultOutcome, convertToString, params, returnValue)
   {
      this.mActivityId = id;
      this.mMethodElExpression = methodEl;
      this.mDefaultOutcome = defaultOutcome;
      this.mConvertToString = convertToString;
      this.mParameters = params;
      this.mReturnValue = returnValue;
   }
  
   MethodCallActivity.prototype.getActivityType = function()
   {
      return adfc.internal.ActivityType.METHOD_CALL;
   }
  
   MethodCallActivity.prototype.getActivityId = function() 
   {
      return this.mActivityId;
   }
   
   MethodCallActivity.prototype.getMethodElExpression = function()
   {
      return this.mMethodElExpression;
   }
   
   MethodCallActivity.prototype.getDefaultOutcome = function()
   {
      return this.mDefaultOutcome;
   }
   
   MethodCallActivity.prototype.isConvertToString = function()
   {
      return this.mConvertToString;
   }
   
   MethodCallActivity.prototype.getParameters = function()
   {
      return this.mParameters;
   }
   
   MethodCallActivity.prototype.getReturnValue = function()
   {
      return this.mReturnValue;
   }

})();
/*
* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

(function(){

   /**
    * Represents a method-call activity parameter.
    */
   adfc.internal.MethodCallParameter = MethodCallParameter;
   function MethodCallParameter(type, valueExpression)
   {
      this.mType = type;
      this.mValueExpression = valueExpression;
   }
   
   MethodCallParameter.prototype.getType = function()
   {
      return this.mType;
   }
   
   MethodCallParameter.prototype.getValueExpression = function()
   {
      return this.mValueExpression;
   }

})();
/*
* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

(function(){

   /**
    * Represents a router activity.
    */
   adfc.internal.RouterActivity = RouterActivity;
   function RouterActivity(activityId, cases, defaultOutcome)
   {
      this.mActivityId = activityId;
      this.mCases = cases;
      this.mDefaultOutcome = defaultOutcome;
   }

   RouterActivity.prototype.getActivityType = function()
   {
      return adfc.internal.ActivityType.ROUTER;
   }
  
   RouterActivity.prototype.getActivityId = function()
   {
      return this.mActivityId;
   }
   
   RouterActivity.prototype.getCases = function()
   {
      return this.mCases;
   }
   
   RouterActivity.prototype.getDefaultOutcome = function()
   {
      return this.mDefaultOutcome;
   }

})();
/*
* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

(function(){

   /**
    * Represents a router activity case.
    */
   adfc.internal.RouterCase = RouterCase;
   function RouterCase(expression, outcome)
   {
      this.mExpression = expression;
      this.mOutcome = outcome;
   }

   RouterCase.prototype.getExpression = function()
   {
      return this.mExpression;
   }
  
   RouterCase.prototype.getOutcome = function()
   {
      return this.mOutcome;
   }

})();
/*
* Copyright (c) 2012, Oracle and/or its affiliates. All rights reserved. 
 */
 
if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

(function(){

   /**
    * Represents a task-flow-call activity.
    */
   adfc.internal.TaskFlowCallActivity = TaskFlowCallActivity;
   function TaskFlowCallActivity(id, taskFlowReference, dynamicTaskFlowIdElExpression, inputParams, inputParamMapElExpression, returnValues, beforeListener, afterListener)
   {
      this.mActivityId = id;
      this.mTaskFlowReference = taskFlowReference;
      this.mDynamicTaskFlowIdElExpression = dynamicTaskFlowIdElExpression;
      this.mIsDynamic = dynamicTaskFlowIdElExpression != null;
      this.mInputParameters = inputParams;
      this.mInputParameterMapElExpression = inputParamMapElExpression;
      this.mReturnValues = returnValues;
      this.mBeforeListener = beforeListener;
      this.mAfterListener = afterListener;
   }
    
   TaskFlowCallActivity.prototype.getActivityType = function()
   {
      return adfc.internal.ActivityType.TASK_FLOW_CALL;
   }
    
   TaskFlowCallActivity.prototype.getActivityId = function() 
   {
      return this.mActivityId;
   }
   
   TaskFlowCallActivity.prototype.getTaskFlowReference = function() 
   {
      return this.mTaskFlowReference;
   }
   
   TaskFlowCallActivity.prototype.isDynamic = function() 
   {
      return this.mIsDynamic;
   }
   
   TaskFlowCallActivity.prototype.getDynamicTaskFlowIdElExpression = function() 
   {
      return this.mDynamicTaskFlowIdElExpression;
   }
   
   TaskFlowCallActivity.prototype.getInputParameters = function() 
   {
      return this.mInputParameters;
   }
   
   TaskFlowCallActivity.prototype.getInputParameterMapElExpression = function() 
   {
      return this.mInputParameterMapElExpression;
   }
   
   TaskFlowCallActivity.prototype.getReturnValues = function()
   {
      return this.mReturnValues;
   }
   
   TaskFlowCallActivity.prototype.getBeforeListener = function()
   {
      return this.mBeforeListener;
   }
   
   TaskFlowCallActivity.prototype.getAfterListener = function()
   {
      return this.mAfterListener;
   }
   
})();/*
* Copyright (c) 2012, Oracle and/or its affiliates. All rights reserved. 
 */
 
if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

(function(){

   /**
    * Represents a task-flow-call activity input parameter or return value.
    */
   adfc.internal.TaskFlowCallParameter = TaskFlowCallParameter;
   function TaskFlowCallParameter(name, valueExpression, passByValue)
   {
      this.mName = name;
      this.mValueExpression = valueExpression;
      this.mPassByValue = passByValue;
   }
   
   TaskFlowCallParameter.prototype.getName = function()
   {
      return this.mName;
   }
   
   TaskFlowCallParameter.prototype.getValueExpression = function()
   {
      return this.mValueExpression;
   }
   
   TaskFlowCallParameter.prototype.getPassByValue = function()
   {
      return this.mPassByValue;
   }

})();/*
* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

(function(){

   /**
    * Represents a task flow definition.
    */
   adfc.internal.TaskFlowDefinition = TaskFlowDefinition;
   function TaskFlowDefinition(taskFlowId, defActId, initializer, finalizer, inParams, returnValues, activities, cfRules, beanDefs)
   {
      //
      //  Initialize the fields.
      //
      this.mTaskFlowId = taskFlowId;
      this.mDefaultActivityId = defActId;
      this.mInitializer = initializer;
      this.mFinalizer = finalizer;
      this.mActivities = activities;
      this.mControlFlowRules = cfRules;
      this.mBeanDefinitions = beanDefs;
      this.mInputParams = inParams;
      this.mReturnValues = returnValues;
      
   }

   TaskFlowDefinition.prototype.getTaskFlowId = function()
   {
      return this.mTaskFlowId;
   }

   TaskFlowDefinition.prototype.getControlFlowRules = function()
   {
      return this.mControlFlowRules;
   }

   TaskFlowDefinition.prototype.getActivities = function()
   {
      return this.mActivities;
   }
  
   TaskFlowDefinition.prototype.getDefaultActivityId = function()
   {
      return this.mDefaultActivityId;
   }
  
   TaskFlowDefinition.prototype.getInitializer = function()
   {
      return this.mInitializer;
   }
  
   TaskFlowDefinition.prototype.getFinalizer = function()
   {
      return this.mFinalizer;
   }
    
   TaskFlowDefinition.prototype.getInputParameters = function()
   {
      return this.mInputParams;
   }
    
   TaskFlowDefinition.prototype.getReturnValues = function()
   {
      return this.mReturnValues;
   }
  
   /**
    *  Returns an array of ManagedBeanDefinition objects.
    */
   TaskFlowDefinition.prototype.getBeanDefinitions = function()
   {
      return this.mBeanDefinitions;
   }

})();
/*
* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

(function(){

   /**
    * Unique identifier of a task flow.
    */
   adfc.internal.TaskFlowId = TaskFlowId;
   function TaskFlowId(documentUri, localId)
   {
      this.mDocumentUri = documentUri;
      this.mLocalTaskFlowId = localId;
   }
   
   TaskFlowId.prototype.getDocumentUri = function()
   {
      return this.mDocumentUri;
   }
   
   TaskFlowId.prototype.getLocalTaskFlowId = function()
   {
      return this.mLocalTaskFlowId;
   }
   
   TaskFlowId.prototype.toString = function()
   {
      return this.mDocumentUri + "#" + this.mLocalTaskFlowId;
   }
   
   TaskFlowId.prototype.equals = function(other)
   {
      var result = false;
      if (other)
      {
         var otherDoc = other.getDocumentUri();
         var otherLocalId = other.getLocalTaskFlowId();
         result = (this.mDocumentUri == otherDoc) && (this.mLocalTaskFlowId == otherLocalId);
      }
      return result;
   }
   
   /**
    * Parses a string representation of a task flow ID and returns a
    * TaskFlowId object.
    */
   TaskFlowId.parse = function(stringId)
   {
      var result = null;
      
      //
      //  Task flow ID strings are formatted as: <document-uri>#<local-id>
      //
      var index = stringId.indexOf("#");
      if (index > 0)
      {
         var docUri = stringId.substring(0, index);
         var localId = stringId.substring(index+1);
         result = new TaskFlowId(docUri, localId);
      }
      return result;
   }
  
})();
/*
* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

(function(){

   /**
    * Represents a task flow input parameter.
    */
   adfc.internal.TaskFlowInputParameter = TaskFlowInputParameter;
   function TaskFlowInputParameter(name, valueExpression, type, isRequired)
   {
      this.mName = name;
      this.mValueExpression = valueExpression;
      this.mType = type;
      this.mRequired = isRequired;
   }
   
   TaskFlowInputParameter.prototype.getName = function()
   {
      return this.mName;
   }
   
   TaskFlowInputParameter.prototype.getValueExpression = function()
   {
      return this.mValueExpression;
   }
   
   TaskFlowInputParameter.prototype.getType = function()
   {
      return this.mType;
   }
   
   TaskFlowInputParameter.prototype.isRequired = function()
   {
      return this.mRequired;
   }

})();
/*
* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

(function(){

   /**
    * Represents a task-flow-return activity.
    */
   adfc.internal.TaskFlowReturnActivity = TaskFlowReturnActivity;
   function TaskFlowReturnActivity(activityId, outcomeName)
   {
      this.mActivityId = activityId;
      this.mOutcomeName = outcomeName;
   }

   TaskFlowReturnActivity.prototype.getActivityType = function()
   {
      return adfc.internal.ActivityType.TASK_FLOW_RETURN;
   }
  
   TaskFlowReturnActivity.prototype.getActivityId = function() 
   {
      return this.mActivityId;
   }
   
   TaskFlowReturnActivity.prototype.getOutcomeName = function() 
   {
      return this.mOutcomeName;
   }

})();
/*
* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

(function(){

   /**
    * Represents a view activity.
    */
   adfc.internal.ViewActivity = ViewActivity;
   function ViewActivity(id, vdlDocumentPath)
   {
      this.mActivityId = id;
      this.mVdlDocumentPath = vdlDocumentPath;
   }
  
   ViewActivity.prototype.getActivityType = function()
   {
      return adfc.internal.ActivityType.VIEW;
   }
  
   ViewActivity.prototype.getActivityId = function() 
   {
      return this.mActivityId;
   }
  
   ViewActivity.prototype.getVldDocumentPath = function() 
   {
      return this.mVdlDocumentPath;
   }

})();
/*
* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

adfc.internal.ActivityXmlParser = {};
adfc.internal.ActivityXmlParser.parse = function(docPath, taskFlowId, node)
{
   var result = null;
   if (node && (node != null))
   {
      //
      //  Get the activityId.
      //
      var idStr = node.attributes.getNamedItem("id").nodeValue;
      var activityId = new adfc.internal.ActivityId(taskFlowId, idStr);
      
      var nodeName = node.localName;
      if (nodeName == "view")
      {
         result = adfc.internal.ActivityXmlParser.parseViewActivity(activityId, node);
      }
      else if (nodeName == "router")
      {
         result = adfc.internal.ActivityXmlParser.parseRouterActivity(activityId, node);
      }
      else if (nodeName == "method-call")
      {
         result = adfc.internal.ActivityXmlParser.parseMethodCallActivity(activityId, node);
      }
      else if (nodeName == "task-flow-return")
      {
         result = adfc.internal.ActivityXmlParser.parseTaskFlowReturnActivity(activityId, node);
      }
      else if (nodeName == "task-flow-call")
      {
         result = adfc.internal.ActivityXmlParser.parseTaskFlowCallActivity(activityId, node);
      }
   }
   return result;
}

adfc.internal.ActivityXmlParser.parseViewActivity = function(activityId, node)
{
   var vdlDocPath = null;

   var children = node.childNodes;
   for (var i = 0; i < children.length; i++)
   {
      var child = children.item(i);
      var childName = child.localName;
      if (childName)
      {
         if (childName == "page")
         {
            vdlDocPath = adfc.internal.XmlUtil.getNodeText(child);
            
            //
            //  The VDL document path should begin with a leading slash '/' but it's
            //  possible it might not be that way in the metadata.  Add a leading slash
            //  if needed.
            //
            if ((vdlDocPath != null) && (vdlDocPath.length > 0))
            {
               var firstChar = vdlDocPath.charAt(0);
               if ((firstChar != null) && (firstChar != "/"))
               {
                  vdlDocPath = "/" + vdlDocPath;
               }
            }
         }
      }
   }
   var result = new adfc.internal.ViewActivity(activityId, vdlDocPath);
   return result;
}

adfc.internal.ActivityXmlParser.parseRouterActivity = function(activityId, node)
{
   var cases = new Array();
   var defaultOutcome = null;

   var children = node.childNodes;
   for (var i = 0; i < children.length; i++)
   {
      var child = children.item(i);
      var childName = child.localName;
      if (childName)
      {
         if (childName == "default-outcome")
         {
            defaultOutcome = adfc.internal.XmlUtil.getNodeText(child);
         }
         else if (childName == "case")
         {
            var routerCase = adfc.internal.ActivityXmlParser.parseRouterCase(child);
            cases.push(routerCase);
         }
      }
   }
   var result = new adfc.internal.RouterActivity(activityId, cases, defaultOutcome);
   return result;
}

adfc.internal.ActivityXmlParser.parseRouterCase = function(node)
{
   var expression = null;
   var outcome = null;

   var children = node.childNodes;
   for (var i = 0; i < children.length; i++)
   {
      var child = children.item(i);
      var childName = child.localName;
      if (childName)
      {
         if (childName == "expression")
         {
            expression = adfc.internal.XmlUtil.getNodeText(child);
         }
         else if (childName == "outcome")
         {
            outcome = adfc.internal.XmlUtil.getNodeText(child);
         }
      }
   }
   var result = new adfc.internal.RouterCase(expression, outcome);
   return result;
}

adfc.internal.ActivityXmlParser.parseMethodCallActivity = function(activityId, node)
{
   var elExpression = null;
   var defaultOutcome = null;
   var convertToString = false;
   var params = new Array();
   var returnValue = null;

   var children = node.childNodes;
   for (var i = 0; i < children.length; i++)
   {
      var child = children.item(i);
      var childName = child.localName;
      if (childName && (childName != null))
      {
         if (childName == "method")
         {
            elExpression = adfc.internal.XmlUtil.getNodeText(child);
         }
         else if (childName == "outcome")
         {
            var children2 = child.childNodes;
            for (var j = 0; j < children2.length; j++)
            {
               var child2 = children2.item(j);
               var child2Name = child2.localName;
               if (child2Name && (child2Name != null))
               {
                  if (child2Name == "fixed-outcome")
                  {
                     defaultOutcome = adfc.internal.XmlUtil.getNodeText(child2);
                     break;
                  }
                  else if (child2Name == "to-string")
                  {
                     convertToString = true;
                     break;
                  }
               }
            }
         }
         else if (childName == "parameter")
         {
            var param = adfc.internal.ActivityXmlParser.parseMethodCallParam(child);
            params.push(param);
         }
         else if (childName == "return-value")
         {
            returnValue = adfc.internal.XmlUtil.getNodeText(child);
         }
      }
   }
   var result = 
      new adfc.internal.MethodCallActivity(activityId, elExpression, defaultOutcome, convertToString, params, returnValue);
   return result;
}

adfc.internal.ActivityXmlParser.parseMethodCallParam = function(node)
{
   var type = null;
   var valueExpression = null;
   
   var children = node.childNodes;
   for (var i = 0; i < children.length; i++)
   {
      var child = children.item(i);
      var childName = child.localName;
      if (childName)
      {
         if (childName == "class")
         {
            type = adfc.internal.XmlUtil.getNodeText(child);
         }
         else if (childName == "value")
         {
            valueExpression = adfc.internal.XmlUtil.getNodeText(child);
         }
      }
   }
   var result = new adfc.internal.MethodCallParameter(type, valueExpression);
   return result;
}

adfc.internal.ActivityXmlParser.parseTaskFlowReturnActivity = function(activityId, node)
{
   var outcomeName = null;
   
   var children = node.childNodes;
   for (var i = 0; i < children.length; i++)
   {
      var child = children.item(i);
      var childName = child.localName;
      if (childName && (childName != null))
      {
         if (childName == "outcome")
         {
            var children2 = child.childNodes;
            for (var j = 0; j < children2.length; j++)
            {
               var child2 = children2.item(j);
               var child2Name = child2.localName;
               if (child2Name && (child2Name != null))
               {
                  if (child2Name == "name")
                  {
                     outcomeName = adfc.internal.XmlUtil.getNodeText(child2);
                     break;
                  }
               }
            }
         }
      }
   }
   return new adfc.internal.TaskFlowReturnActivity(activityId, outcomeName);
}


adfc.internal.ActivityXmlParser.parseTaskFlowCallActivity = function(activityId, node)
{
   var taskFlowReference = null;
   var dynamicTaskFlowReferenceEl = null;
   var params = new Array();
   var paramMap = null;
   var returnValues = new Array();
   var beforeListener = null;
   var afterListener = null;

   var children = node.childNodes;
   for (var i = 0; i < children.length; i++)
   {
      var child = children.item(i);
      var childName = child.localName;
      if (childName && (childName != null))
      {
         if (childName == "task-flow-reference")
         {
            var taskFlowDocument = null;
            var taskFlowId = null;
            
            var children2 = child.childNodes;
            for (var j = 0; j < children2.length; j++)
            {
               var child2 = children2.item(j);
               var child2Name = child2.localName;
               if (child2Name && (child2Name != null))
               {
                  if (child2Name == "document")
                  {
                     taskFlowDocument = adfc.internal.XmlUtil.getNodeText(child2);
                  }
                  else if (child2Name == "id")
                  {
                     taskFlowId = adfc.internal.XmlUtil.getNodeText(child2);;
                  }
               }
            }
            
            if (document && taskFlowId)
            {
               taskFlowReference = taskFlowDocument + "#" + taskFlowId;
            }
            else if (document)
            {
               taskFlowReference = taskFlowDocument;
            }
            else if (taskFlowId)
            {
               taskFlowReference = taskFlowId;
            }
            
         }
         else if (childName == "dynamic-task-flow-reference")
         {
            dynamicTaskFlowReferenceEl = adfc.internal.XmlUtil.getNodeText(child);
         }
         else if (childName == "input-parameter")
         {
            var param = adfc.internal.ActivityXmlParser.parseTaskFlowCallParam(child);
            params.push(param);
         }
         else if (childName == "input-parameter-map")
         {
            paramMap = adfc.internal.XmlUtil.getNodeText(child);
         }
         else if (childName == "return-value")
         {
            var returnValue = adfc.internal.ActivityXmlParser.parseTaskFlowCallParam(child);
            returnValues.push(returnValue);
         }
         else if (childName == "before-listener")
         {
            beforeListener = adfc.internal.XmlUtil.getNodeText(child);
         }
         else if (childName == "after-listener")
         {
            afterListener = adfc.internal.XmlUtil.getNodeText(child);
         }
      }
   }
   var result = 
      new adfc.internal.TaskFlowCallActivity(activityId, taskFlowReference, dynamicTaskFlowReferenceEl, params, paramMap, returnValues, beforeListener, afterListener);
   return result;
}


// Note that this function is used for both input parameters and return values because they have the same elements.  This 
// is similar to the way the big ADF parsing code works
adfc.internal.ActivityXmlParser.parseTaskFlowCallParam = function(node)
{
   var name = null;
   var valueExpression = null;
   var passByValue = null;
   
   var children = node.childNodes;
   for (var i = 0; i < children.length; i++)
   {
      var child = children.item(i);
      var childName = child.localName;
      if (childName)
      {
         if (childName == "name")
         {
            name = adfc.internal.XmlUtil.getNodeText(child);
         }
         else if (childName == "value")
         {
            valueExpression = adfc.internal.XmlUtil.getNodeText(child);
         }
         else if (childName == "pass-by-value")
         {
            passByValue = adfc.internal.XmlUtil.getNodeText(child);
         }
      }
   }
   var result = new adfc.internal.TaskFlowCallParameter(name, valueExpression, passByValue);
   return result;
}
/*
* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

adfc.internal.ControlFlowCaseXmlParser = {};
adfc.internal.ControlFlowCaseXmlParser.parse = function(docPath, taskFlowId, node)
{
   var outcome = null;
   var guardCondition = null;
   var targetActivityId = null;
   var transition = null;
   
   var children = node.childNodes;
   for (var i = 0; i < children.length; i++)
   {
      var child = children.item(i);
      var childName = child.localName;
      if (childName)
      {
         if (childName == "from-outcome")
         {
            outcome = adfc.internal.XmlUtil.getNodeText(child);
         }
         else if (childName == "if")
         {
            guardCondition = adfc.internal.XmlUtil.getNodeText(child);
         }
         else if (childName == "to-activity-id")
         {
            var localId = adfc.internal.XmlUtil.getNodeText(child);
            targetActivityId = new adfc.internal.ActivityId(taskFlowId, localId);
         }
         else if (childName == "transition")
         {
            transition = adfc.internal.XmlUtil.getNodeText(child);
         }
      }
   }
   var result = new adfc.internal.ControlFlowCase(outcome, guardCondition, targetActivityId, transition);
   return result;
}
/*
* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

adfc.internal.ControlFlowRuleXmlParser = {};
adfc.internal.ControlFlowRuleXmlParser.parse = function(docPath, taskFlowId, node)
{
   // big ADF handles control flow cases slightly differently:  It has collections for the different combinations
   // of values for from-action and from-outcome.  Since ADFmf currently only supports from-outcome, we store everything
   // in the same Array.  the default (null from-outcome) is just stored along with the normal cases.  
   // ControlFlowRule.getControlFlowCaseIndex(outcome) contains the logic to determine if the default should be used
   
   var fromActivityId = null;
   var cfCases = new Array();
   
   var children = node.childNodes;
   for (var i = 0; i < children.length; i++)
   {
      var child = children.item(i);
      var childName = child.localName;
      if (childName)
      {
         if (childName == "from-activity-id")
         {
            var localId = adfc.internal.XmlUtil.getNodeText(child);
            fromActivityId = new adfc.internal.ActivityId(taskFlowId, localId);
         }
         else if (childName == "control-flow-case")
         {
            var cfCase = adfc.internal.ControlFlowCaseXmlParser.parse(docPath, taskFlowId, child);
            if (cfCase)
            {
               cfCases.push(cfCase);
            }
         }
      }
   }
   var result = new adfc.internal.ControlFlowRule(fromActivityId, cfCases);
   return result;
}
/*
* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

adfc.internal.ManagedBeanDefinitionXmlParser = {};
adfc.internal.ManagedBeanDefinitionXmlParser.parse = function(docPath, taskFlowId, node)
{
   var beanName = null;
   var beanClass = null;
   var beanScope = null;
   var managedProps = new Array();
   
   var children = node.childNodes;
   for (var i = 0; i < children.length; i++)
   {
      var child = children.item(i);
      var childName = child.localName;
      if (childName)
      {
         if (childName == "managed-bean-name")
         {
            beanName = adfc.internal.XmlUtil.getNodeText(child);
         }
         else if (childName == "managed-bean-class")
         {
            beanClass = adfc.internal.XmlUtil.getNodeText(child);
         }
         else if (childName == "managed-bean-scope")
         {
            beanScope = adfc.internal.XmlUtil.getNodeText(child);
         }
         else if (childName == "managed-property")
         {
            var prop = adfc.internal.ManagedPropertyDefinitionXmlParser.parse(child);
            if (prop != null)
            {
               managedProps.push(prop);
            }
         }
      }
   }
   var result = new adfc.internal.ManagedBeanDefinition(beanName, beanClass, beanScope, managedProps);
   return result;
}

adfc.internal.ManagedPropertyDefinitionXmlParser = {};
adfc.internal.ManagedPropertyDefinitionXmlParser.parse = function(node)
{
   var name = null;
   var type = null;
   var value = null;
   
   var children = node.childNodes;
   for (var i = 0; i < children.length; i++)
   {
      var child = children.item(i);
      var childName = child.localName;
      if (childName)
      {
         if (childName == "property-name")
         {
            name = adfc.internal.XmlUtil.getNodeText(child);
         }
         else if (childName == "property-class")
         {
            type = adfc.internal.XmlUtil.getNodeText(child);
         }
         else if (childName == "value")
         {
            value = adfc.internal.XmlUtil.getNodeText(child);
         }
      }
   }
   var result = new adfc.internal.ManagedPropertyDefinition(name, type, value);
   return result;
}
/*
* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

adfc.internal.TaskFlowDefinitionXmlParser = {};
adfc.internal.TaskFlowDefinitionXmlParser.parse = function(docPath, document, tfNode)
{
   var result = null;
   if (tfNode)
   {
      var taskFlowId = null;
      var defaultActivityId = null;
      var initializer = null;
      var finalizer = null;
      var inParams = new Array();
      var returnValues = new Array();
      var activities = new Array();
      var cfRules = new Array();
      var managedBeans = new Array();

      //
      //  If the document path is non-null then get the ID attribute from the
      //  task flow node and construct a taskFlowId.  If the document path is
      //  null then this is the unbounded flow and the taskFlowId should be null.
      //
      if (docPath != null)
      {
         var tfIdStr = tfNode.attributes.getNamedItem("id").nodeValue;
         taskFlowId = new adfc.internal.TaskFlowId(docPath, tfIdStr);
      }
      
      //
      //  Iterate over the children parsing as we go.
      //
      var children = tfNode.childNodes;
      for (var i = 0; i < children.length; i++)
      {
         var node = children.item(i);
         var nodeName = node.localName;
         var obj = null;
         if (nodeName)
         {
            if (nodeName == "default-activity")
            {
               var defActivityLocalId = adfc.internal.XmlUtil.getNodeText(node);
               defaultActivityId = new adfc.internal.ActivityId(taskFlowId, defActivityLocalId);
            }
            else if (nodeName == "initializer")
            {
               initializer = adfc.internal.XmlUtil.getNodeText(node);
            }
            else if (nodeName == "finalizer")
            {
               finalizer = adfc.internal.XmlUtil.getNodeText(node);
            }
            else if (nodeName == "input-parameter-definition")
            {
               obj = adfc.internal.TaskFlowInputParameterXmlParser.parse(docPath, taskFlowId, node);
               if (obj)
               {
                  inParams.push(obj);
               }
            }
            else if (nodeName == "return-value-definition")
            {
               obj = adfc.internal.TaskFlowInputParameterXmlParser.parse(docPath, taskFlowId, node);
               if (obj)
               {
                  returnValues.push(obj);
               }
            }
            else if ((nodeName == "view") || (nodeName == "router") || 
                     (nodeName == "method-call") || (nodeName == "task-flow-return") ||
                     (nodeName == "task-flow-call"))
            {
               obj = adfc.internal.ActivityXmlParser.parse(docPath, taskFlowId, node);
               if (obj)
               {
                  activities.push(obj);
               }
            }
            else if (nodeName == "control-flow-rule")
            {
               obj = adfc.internal.ControlFlowRuleXmlParser.parse(docPath, taskFlowId, node);
               if (obj)
               {
                  cfRules.push(obj);    
               }
            }
            else if (nodeName == "managed-bean")
            {
               obj = adfc.internal.ManagedBeanDefinitionXmlParser.parse(docPath, taskFlowId, node);
               if (obj)
               {
                  managedBeans.push(obj);
               }
            }
         }
      }
      
      //
      //  Convert the activities array to a map keyed by local activityId.
      //
      var temp = activities;
      activities = new Object();
      for (var index in temp)
      {
         var activity = temp[index];
         activities[activity.getActivityId().getLocalActivityId()] = activity;
      }
      
      //
      //  Convert the control flow rules to a map keyed by the from activity's local ID.
      //
      temp = cfRules;
      cfRules = new Object();
      for (var index in temp)
      {
         var rule = temp[index];
         var fromId = rule.getFromActivityId().getLocalActivityId();
         var existingRule = cfRules[fromId];
         if (existingRule == null)
         {
            cfRules[rule.getFromActivityId().getLocalActivityId()] = rule;
         }
         else
         {
            existingRule.addControlFlowCases(rule.getControlFlowCases());
         }
      }
      
      result = new adfc.internal.TaskFlowDefinition(taskFlowId, defaultActivityId, initializer, finalizer, inParams,
                                                    returnValues, activities, cfRules, managedBeans);
   }
   return result;
}
/*
* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

adfc.internal.TaskFlowInputParameterXmlParser = {};
adfc.internal.TaskFlowInputParameterXmlParser.parse = function(docPath, taskFlowId, node)
{
   var name = null;
   var valueExpression = null;
   var type = null;
   var isRequired = false;
   
   var children = node.childNodes;
   for (var i = 0; i < children.length; i++)
   {
      var child = children.item(i);
      var childName = child.localName;
      if (childName)
      {
         if (childName == "name")
         {
            name = adfc.internal.XmlUtil.getNodeText(child);
         }
         else if (childName == "value")
         {
            valueExpression = adfc.internal.XmlUtil.getNodeText(child);
         }
         else if (childName == "class")
         {
            type = adfc.internal.XmlUtil.getNodeText(child);
         }
         else if (childName == "required")
         {
            isRequired = true;
         }
      }
   }
   var result = new adfc.internal.TaskFlowInputParameter(name, valueExpression, type, isRequired);
   return result;
}
/*
* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

(function(){

   adfc.internal.AdfcContext = AdfcContext;
   function AdfcContext()
   {
      this.mInitialized = false;
      this.mFinlized = false;
      this.mControllerState = null;
   }
   
   AdfcContext.initialize = function(successCallback, failCallback)
   {
      if (!this.mInitialized)
      {
         this.mInitialized = true;
         this.mControllerState = new adfc.internal.ControllerState();
         adfc.internal.MetadataService.loadBootstrapMetadata(successCallback, failCallback);
      }
   }
   
   AdfcContext.finalize = function()
   {
      this.mController = null;
      this.mFinlized = true;
   }
  
   AdfcContext.getControllerState = function()
   {
      if (!this.mInitialized)
      {
         throw new Error("ADFc: AdfcContext is not initialized.");
      }
      if (this.mFinalized)
      {
         throw new Error("ADFc: AdfcContext has already been finalized.");
      }
      return this.mControllerState;
   }
   
   /**
    * Allow re-setting to initial conditions for unit testing.
    */
   AdfcContext.reinitialize = function()
   {
      this.mInitialized = false;
      this.mFinlized = false;
      this.mControllerState = null;
   }
   
})();
/*
* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

(function(){

   adfc.internal.ControllerState = ControllerState;
   function ControllerState()
   {
      this.mTaskFlowStack = new Array();
   }

   ControllerState.prototype.getTaskFlowStackSize = function()
   {
      var result = this.mTaskFlowStack.length;
      return result;
   }
   
   ControllerState.prototype.peekTaskFlowStack = function()
   {
      var result = this.mTaskFlowStack[this.mTaskFlowStack.length-1];
      return result;
   }
   
   ControllerState.prototype.pushTaskFlow = function(taskFlow, taskFlowCallActivity, callingViewActivityId, successCallback, failCallback)
   {
      var pushScopeSuccess = function()
      {
        var updateBeanDefsSuccess = function()
        {
          if (adfc.internal.LogUtil.isFine())
          {
             var currentTaskFlowEntry = adfc.internal.AdfcContext.getControllerState().peekTaskFlowStack();
             var tfId = currentTaskFlowEntry.getTaskFlowDefinition().getTaskFlowId();
             var instanceId = currentTaskFlowEntry.getInstanceId();
             var msg = "ADFc: pushed task flow, taskFlowId=" + tfId + ", instanceId=" + instanceId;
             adfc.internal.LogUtil.fine(msg);
          }
          successCallback();
        }
        
        var updateBeanDefsFailed = function(message)
        {
          var msg = "Failed to set managed bean definitions.";
          adfc.internal.LogUtil.severe(msg);
          adfc.internal.LogUtil.showAlert(msg);
          failCallback(message);
        }
        
        var controllerState = adfc.internal.AdfcContext.getControllerState();
        controllerState.mTaskFlowStack.push(new adfc.internal.TaskFlowStackEntry(taskFlow, taskFlowCallActivity, callingViewActivityId));
        controllerState.updateBeanDefinitions(updateBeanDefsSuccess, updateBeanDefsFailed);
      }
      var pushScopeFailed = function(message)
      {
         failCallback(message);
      }
      adfc.internal.ElUtil.pushPageFlowScope(pushScopeSuccess, pushScopeFailed);
   }
   
   ControllerState.prototype.popTaskFlow = function(successCallback, failCallback)
   {
      var tfStackEntry = null;
      var popScopeSuccess = function()
      {
         var updateBeanDefsSuccess = function()
         {
            if (adfc.internal.LogUtil.isFine())
            {
               var tfId = tfStackEntry.getTaskFlowDefinition().getTaskFlowId();
               var instanceId = tfStackEntry.getInstanceId();
               var msg = "ADFc: popped task flow, taskFlowId=" + tfId + ", instanceId=" + instanceId;
               adfc.internal.LogUtil.fine(msg);
            }
            tfStackEntry.clearViewHistory();
            successCallback(tfStackEntry);
         }
         var updateBeanDefsFailed = function(message)
         {
            var msg = "Failed to set managed bean definitions.";
            adfc.internal.LogUtil.severe(msg);
            adfc.internal.LogUtil.showAlert(msg);
            failCallback(message);
         }
         var controllerState = adfc.internal.AdfcContext.getControllerState();
         tfStackEntry = controllerState.mTaskFlowStack.pop();
         controllerState.updateBeanDefinitions(updateBeanDefsSuccess, updateBeanDefsFailed);
      }
      adfc.internal.ElUtil.popPageFlowScope(popScopeSuccess, failCallback);
   }
   
   ControllerState.prototype.updateBeanDefinitions = function(successCallback, failCallback) 
   {
      var beanDefs = null;
      
      //
      //  If there's more than one task flow on the stack then we want to get
      //  the application scoped bean definitions from the unbounded flow
      //  and then add in the definitions from the current top of the stack.
      //
      if (this.mTaskFlowStack.length > 1) 
      {
         beanDefs = new Array();
         var unboundedBeans = this.mTaskFlowStack[0].getTaskFlowDefinition().getBeanDefinitions();
         for (var i = 0; i < unboundedBeans.length; i++) 
         {
            if (unboundedBeans[i].getBeanScope() == adfc.internal.ManagedBeanDefinition.APPLICATION) 
            {
               beanDefs.push(unboundedBeans[i]);
            }
         }
         
         //
         //  Add in the bean definitions from the current top of stack.
         //
         var tfBeans = this.mTaskFlowStack[this.mTaskFlowStack.length-1].getTaskFlowDefinition().getBeanDefinitions();
         beanDefs = beanDefs.concat(tfBeans);
      }
      else if (this.mTaskFlowStack.length == 1) 
      {
         beanDefs = this.mTaskFlowStack[0].getTaskFlowDefinition().getBeanDefinitions();
      }
      else 
      {
         beanDefs = new Array();
      }
      
      var setBeanDefsSuccess = function()
      {
        successCallback();
      }
      
      var setBeanDefsFailed = function(message)
      {
        failCallback(message);
      }
      
      adfc.internal.ElUtil.setBeanDefinitions(beanDefs, setBeanDefsSuccess, setBeanDefsFailed);
   }

})();
/*
* Copyright (c) 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

(function(){

   adfc.internal.TaskFlowStackEntry = TaskFlowStackEntry;
   adfc.internal.TaskFlowStackEntry.SequenceCounter = 0;
      
   function TaskFlowStackEntry(taskFlowDefinition, taskFlowCallActivity, callingViewActivityId)
   {
      this.mInstanceId = adfc.internal.TaskFlowStackEntry.SequenceCounter++;
      
      this.mTaskFlowDefinition = taskFlowDefinition;
      this.mTaskFlowCallActivity = taskFlowCallActivity;
      this.mViewReached = false;
      this.mCallingViewActivityId = callingViewActivityId;
      this.mViewHistoryStack = new Array();
   }
   
   TaskFlowStackEntry.prototype.getInstanceId = function()
   {
      return this.mInstanceId;
   }
   
   TaskFlowStackEntry.prototype.getTaskFlowDefinition = function()
   {
      return this.mTaskFlowDefinition;
   }
   
   TaskFlowStackEntry.prototype.getTaskFlowCallActivity = function()
   {
      return this.mTaskFlowCallActivity;
   }
   
   TaskFlowStackEntry.prototype.pushViewHistory = function(viewId, amxPage, transType)
   {
      var item = new adfc.internal.ViewHistoryItem(viewId, amxPage, transType);
      this.mViewHistoryStack.push(item);
      adfc.internal.ElUtil.setMfContextInstance(item, true);
   }
   
   TaskFlowStackEntry.prototype.popViewHistory = function()
   {
      var result = this.mViewHistoryStack.pop();
      adfc.internal.ElUtil.removeMfContextInstance(result);
      return result;
   }
   
   TaskFlowStackEntry.prototype.peekViewHistory = function()
   {
      var result = this.mViewHistoryStack[this.mViewHistoryStack.length-1];
      return result;
   }
   
   TaskFlowStackEntry.prototype.clearViewHistory = function()
   {
      while (this.mViewHistoryStack.length > 0)
      {
         this.popViewHistory();
      }
   }

   TaskFlowStackEntry.prototype.getViewHistoryLength = function()
   {
      var result = this.mViewHistoryStack.length;
      return result;
   }

   TaskFlowStackEntry.prototype.isViewReached = function()
   {
      return this.mViewReached;
   }

   TaskFlowStackEntry.prototype.setViewReached = function(value)
   {
      this.mViewReached = value;
   }

   TaskFlowStackEntry.prototype.getCallingViewActivityId = function()
   {
      return this.mCallingViewActivityId;
   }
   
})();
/*
* Copyright (c) 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

(function(){

   adfc.internal.ViewHistoryItem = ViewHistoryItem;
   function ViewHistoryItem(viewId, amxPage, transType)
   {
      this.itemId = adfc.internal.IdUtil.uuid(); // Unique item ID.
      this.viewId = viewId;
      this.amxPage = amxPage;
      this.transitionType = transType;
      this.mBackNavIsValid = true;    // To signal cases where back navigation is not valid.
   }
   
   ViewHistoryItem.prototype.isBackNavigationValid = function()
   {
      return this.mBackNavIsValid;
   }
   
   ViewHistoryItem.prototype.setBackNavigationValid = function(value)
   {
      this.mBackNavIsValid = value;
   }

})();
/*
* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

(function(){

   adfc.internal.ElUtil = ElUtil;
   
   function ElUtil()
   {}
   
   /**
    * Get a single value.
    */
   ElUtil.getValue = function(expression, successCallback, failCallback)
   {
      if (adfc.internal.ElUtil.useMockEl())
      {
         adfc.internal.ElUtilMock.getValue(expression, successCallback, failCallback);
      }
      else
      {
         adf.mf.el.getValue(expression, successCallback, failCallback);
      }
   }
   
   /**
    * Get an array of values.
    */
   ElUtil.getValues = function(expressions, successCallback, failCallback)
   {
      if (adfc.internal.ElUtil.useMockEl())
      {
         adfc.internal.ElUtilMock.getValues(expressions, successCallback, failCallback);
      }
      else
      {
         adf.mf.el.getValue(expressions, successCallback, failCallback);
      }
   }
   
   /**
    * Set a single value.
    */
   ElUtil.setValue = function(request, successCallback, failCallback)
   {
      if (adfc.internal.ElUtil.useMockEl())
      {
         adfc.internal.ElUtilMock.setValue(request, successCallback, failCallback);
      }
      else
      {
         adf.mf.el.setValue(request, successCallback, failCallback);
      }
   }
   
   /**
    * Set an array of values.
    */
    ElUtil.setValues = function(request, successCallback, failCallback)
    {
       ElUtil.setValue(request, successCallback, failCallback);
    }
   
   /**
    * Invoke a method binding.
    */
   ElUtil.invokeMethod = function(expression, argTypes, argValues, successCallback, failCallback)
   {
      if (argTypes == null)
      {
         adfc.internal.LogUtil.warning("ElUtil.invokeMethod() passed null argTypes.  This is likely to fail.");
      }
      
      if (argValues == null)
      {
         adfc.internal.LogUtil.warning("ElUtil.invokeMethod() passed null argValues.  This is likely to fail.");
      }
         
      if (adfc.internal.ElUtil.useMockEl())
      {
         adfc.internal.ElUtilMock.invokeMethod(expression, argTypes, argValues, successCallback, failCallback);
      }
      else
      {
         adf.mf.el.invoke(expression, argValues, null, argTypes, successCallback, failCallback);
      }
   }
   
   /**
    * Set the current binding container.
    */
   ElUtil.setBindingContainerPath = function(path, successCallback, failCallback)
   {
      adfc.internal.LogUtil.fine("setting binding container to: " + path);
      if (adfc.internal.ElUtil.useMockContext())
      {
         adfc.internal.LogUtil.fine("using mock setBindingContainerPath");
         successCallback();
      }
      else
      {
         adf.mf.api.setContext(path, successCallback, failCallback);
      }
   }
   
   ElUtil.getCurrentBindingContainerPath = function(successCallback, failCallback)
   {
      if (adfc.internal.ElUtil.useMockContext())
      {
         adfc.internal.LogUtil.fine("using mock getBindingContainerPath");
         successCallback(null);
      }
      else
      {
         adf.mf.api.getContextId(successCallback, failCallback);
      }
   }
   
   ElUtil.resultToBoolean = function(value)
   {
      var result = false;
      if (value != null)
      {
         if (value == true)
         {
            result = true;
         }
         else
         {
            if (value instanceof Boolean)
            {
               result = value.valueOf();
            }
            else
            {
               value = new String(value);
               if (value.toLowerCase() == "true")
               {
                  result = true;
               }
            }
         }
      }
      return result;
   }
   
   ElUtil.useMockEl = function()
   {
      var result = true;
      if (typeof adf !== "undefined")
      {
         if (typeof adf.mf !== "undefined")
         {
             if (typeof adf.mf.internal !== "undefined")
             {
                 if (typeof adf.mf.internal.isJavaAvailable !== "undefined")
                 {
                    result = !adf.mf.internal.isJavaAvailable();
                 }
             }
         }
      }
      return result;
   }
   
   ElUtil.useMockContext = function()
   {
      var result = ElUtil.useMockEl();
      return result;
   }
   
   /**
    *  Set a collection of managed bean definitions.  The collection of bean
    *  definitions supplied here _REPLACES_ any existing definitions, it does
    *  not add to the existing set.
    */
   ElUtil.setBeanDefinitions = function(beanDefs, successCallback, failCallback)
   {
      if (beanDefs != null)
      {
         adfc.internal.LogUtil.fine("defining " + beanDefs.length + " managed beans");
      }
      if (adfc.internal.ElUtil.useMockEl())
      {
         adfc.internal.ElUtil.currentBeanDefs = beanDefs;
         successCallback();
      }
      else
      {
         var elBeanDefs = ElUtil.createBeanDefinitions(beanDefs);
         adf.mf.internal.mb.setBeanDefinitions(elBeanDefs, successCallback, failCallback);
      }
   }
   
   /**
    *  Create an array of bean definitions in the format used by the EL from the format
    *  used internally by the controller.
    */
   ElUtil.createBeanDefinitions = function(internalBeanDefs)
   {
      var elBeanDefs = new Array();
      if (internalBeanDefs != null)
      {
         for (var i = 0; i < internalBeanDefs.length; i++)
         {
            var bean = internalBeanDefs[i];
            var props = ElUtil.createPropDefinitions(bean.getManagedProperties());
            var elBean = new adf.mf.internal.mb.ManagedBeanDefinition(bean.getBeanName(), bean.getBeanClass(), 
                                                                      bean.getBeanScope(), props);
            elBeanDefs.push(elBean);
         }
      }
      return elBeanDefs;
   }
   
   /**
    *  Create an array of bean definitions in the format used by the EL from the format
    *  used internally by the controller.
    */
   ElUtil.createPropDefinitions = function(internalPropDefs)
   {
      var elPropDefs = new Array();
      if (internalPropDefs != null)
      {
         if (internalPropDefs != null) 
         {
            for (var i = 0; i < internalPropDefs.length; i++)
            {
               var propDef = internalPropDefs[i];
               var elPropDef = new adf.mf.internal.mb.ManagedPropertyDefinition(propDef.getName(), 
                                                                                propDef.getType(), 
                                                                                propDef.getValue());
               elPropDefs.push(elPropDef);
            }
         }
      }
      return elPropDefs;
   }
   
   /**
    *  Push a new pageFlowScope instance.  This methods marks the beginning of
    *  the scope's lifespan.
    */
   ElUtil.pushPageFlowScope = function(successCallback, failCallback) 
   {
      if (adfc.internal.ElUtil.useMockContext())
      {
         adfc.internal.LogUtil.fine("pushing a pageFlowScope");
         successCallback();
      }
      else
      {
         adf.mf.api.pushPageFlowScope(successCallback, failCallback);
      }
   }
   
   /**
    *  Pop the current pageFlowScope and return to the previous one.  This method
    *  marks the end of the scope's lifespan.
    */
   ElUtil.popPageFlowScope = function(successCallback, failCallback) 
   {
      if (adfc.internal.ElUtil.useMockContext())
      {
         adfc.internal.LogUtil.fine("popping the pageFlowScope");
         successCallback();
      }
      else
      {
         adf.mf.api.popPageFlowScope(successCallback, failCallback);
      }
   }
   
   ElUtil.setMfContextInstance = function(viewHistoryItem, newInstance)
   {
      if ((typeof adf.mf.internal.useNavHandlerViewHistory !== "undefined") && adf.mf.internal.useNavHandlerViewHistory)
      {
         if (typeof adf.mf.internal.amx !== "undefined")
         {
            if (typeof adf.mf.internal.amx.setMfContextInstance !== "undefined")
            {
               if (adfc.internal.LogUtil.isFine())
               {
                  adfc.internal.LogUtil.fine("ADFc: setting MfContextInstance, newInstance=" + newInstance + ".");
               }
               adf.mf.internal.amx.setMfContextInstance(viewHistoryItem, newInstance);
            }
         }
      }
   }
   
   ElUtil.removeMfContextInstance = function(viewHistoryItem)
   {
      if ((typeof adf.mf.internal.useNavHandlerViewHistory !== "undefined") && adf.mf.internal.useNavHandlerViewHistory)
      {
         if (typeof adf.mf.internal.amx !== "undefined")
         {
            if (typeof adf.mf.internal.amx.removeMfContextInstance !== "undefined")
            {
               if (adfc.internal.LogUtil.isFine())
               {
                  adfc.internal.LogUtil.fine("ADFc: removing MfContextInstance.");
               }
               adf.mf.internal.amx.removeMfContextInstance(viewHistoryItem);
            }
         }
      }
   }

})();
/*
* Copyright (c) 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

(function(){

   adfc.internal.IdUtil = IdUtil;
   adfc.internal.IdUtil.seqNum = 0;
   
   function IdUtil()
   {}
   
   IdUtil.uuid = function()
   {
      var result = true;
      if (typeof amx !== "undefined")
      {
         if (typeof amx.uuid !== "undefined")
         {
            result = amx.uuid();
         }
         else
         {
            result = adfc.internal.IdUtil.seqNum++;
         }
      }
      else
      {
         result = adfc.internal.IdUtil.seqNum++;
      }
   }

})();
/*
* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

(function(){

   adfc.internal.LogUtil = LogUtil;
   
   adfc.internal.LogUtil.UseMockLog = (typeof adf === "undefined") || 
                                      (typeof adf.mf === "undefined") || 
                                      (typeof adf.mf.log === "undefined") || 
                                      (typeof adf.mf.log.Framework === "undefined");
   
   function LogUtil()
   {}
   
   LogUtil.LOG_LEVEL_FINE     =  0;
   LogUtil.LOG_LEVEL_INFO     =  1;
   LogUtil.LOG_LEVEL_WARNING  =  2;
   LogUtil.LOG_LEVEL_SEVERE   =  3;

   if (!adfc.internal.LogUtil.UseMockLog)
   {
      LogUtil.LOG_LEVEL_FINE     = adf.mf.log.level.FINE;
      LogUtil.LOG_LEVEL_INFO     = adf.mf.log.level.INFO;
      LogUtil.LOG_LEVEL_WARNING  = adf.mf.log.level.WARNING;
      LogUtil.LOG_LEVEL_SEVERE   = adf.mf.log.level.SEVERE;
   }
   
   LogUtil.currentMockLogLevel = LogUtil.LOG_LEVEL_FINE;
   
   LogUtil.severe = function(message) 
   {
      LogUtil.output("SEVERE", LogUtil.LOG_LEVEL_SEVERE, message);
   }
   
   LogUtil.warning = function(message) 
   {
      LogUtil.output("WARNING", LogUtil.LOG_LEVEL_WARNING, message);
   }
   
   LogUtil.info = function(message) 
   {
      LogUtil.output("INFO", LogUtil.LOG_LEVEL_INFO, message);
   }
   
   LogUtil.fine = function(message) 
   {
      LogUtil.output("FINE", LogUtil.LOG_LEVEL_FINE, message);
   }
   
   LogUtil.showAlert = function(message)
   {
      if (message != null)
      {
         alert(message);
      }
   }
   
   LogUtil.output = function(prefix, level, message)
   {
       if (adfc.internal.LogUtil.UseMockLog)
       {
          if ((message != null) && (level >= LogUtil.currentMockLogLevel))
          {
             var text = "[ADFc:" + prefix + "] " + LogUtil.formatMessage(message);
             console.log(text);
          }
       }
       else
       {
          var label = "ADFc";
          if (level == LogUtil.LOG_LEVEL_FINE)
          {
             label = "==== ADFc DEBUG ====";
          }
          adf.mf.log.Framework.logp(level, label, "--", message);
       }
   }

   LogUtil.formatMessage = function(message) 
   {
      var text = message;
      if (!(text instanceof String))
      {
        text = new String(message);
      }
      if (text.indexOf("ADFc:") != 0)
      {
        text = "ADFc: " + text;
      }
      return text;
   }
   
   LogUtil.perfLog = function(message)
   {
      if (!adfc.internal.LogUtil.UseMockLog)
      {
         adf.mf.internal.perf.perfTimings(false, false, true, message);
      }
   }
   
   LogUtil.isSevere = function() 
   {
       if (adfc.internal.LogUtil.UseMockLog)
       {
          return (LogUtil.currentMockLogLevel >= LogUtil.LOG_LEVEL_SEVERE);
       }
       else
       {
          return adf.mf.log.Framework.isLoggable(LogUtil.LOG_LEVEL_SEVERE);
       }
   }
   
   LogUtil.isWarning = function() 
   {
       if (adfc.internal.LogUtil.UseMockLog)
       {
          return (LogUtil.currentMockLogLevel >= LogUtil.LOG_LEVEL_WARNING);
       }
       else
       {
          return adf.mf.log.Framework.isLoggable(LogUtil.LOG_LEVEL_WARNING);
       }
   }
   
   LogUtil.isInfo = function() 
   {
       if (adfc.internal.LogUtil.UseMockLog)
       {
          return (LogUtil.currentMockLogLevel >= LogUtil.LOG_LEVEL_INFO);
       }
       else
       {
          return adf.mf.log.Framework.isLoggable(LogUtil.LOG_LEVEL_INFO);
       }
   }
   
   LogUtil.isFine = function() 
   {
       if (adfc.internal.LogUtil.UseMockLog)
       {
          return (LogUtil.currentMockLogLevel >= LogUtil.LOG_LEVEL_FINE);
       }
       else
       {
          return adf.mf.log.Framework.isLoggable(LogUtil.LOG_LEVEL_FINE);
       }
   }

})();
/*
* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

(function(){

   /**
    *  Central location for getting localized text strings.
    */
   adfc.internal.MsgUtil = MsgUtil;
   function MsgUtil()
   {}
   MsgUtil.messages = {};
   
   MsgUtil.getLocalizedText = function(msgId)
   {
      var msg = "<bad message ID>";
      if (typeof MsgUtil.messages[msgId] !== "undefined")
      {
         msg = MsgUtil.messages[msgId];
      }
      return msg;
   }
   
   MsgUtil.NO_FEATURE_ENTRY_POINT = 0;
   MsgUtil.messages[MsgUtil.NO_FEATURE_ENTRY_POINT] = "no feature entry point path found on URL";
   

})();
/*
* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adf) window.adf = {};
adf.FEATURE_ROOT = null;
adf.AMX_DTMODE = false;

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

(function(){

   adfc.internal.UrlUtil = UrlUtil;
   function UrlUtil()
   {}
   
   UrlUtil.getEntryPointDocumentPath = function(queryString)
   {
      var path = null;
      if ((queryString != null) && (queryString.length > 0))
      {
         path = adfc.internal.UrlUtil.getUrlParamValue(queryString, "file");
         if (path != null)
         {
            path = unescape(path);
         }
      }   
      return path;
   }
   
   UrlUtil.getAmxDtMode = function(queryString)
   {
      var result = false;
      if ((queryString != null) && (queryString.length > 0))
      {
         var root = adfc.internal.UrlUtil.getUrlParamValue(queryString, "amx_dtmode");
         if (root != null)
         {
            root = unescape(root);
            result = adfc.internal.ElUtil.resultToBoolean(root);
         }
      }
      return result;
   }
   
   UrlUtil.getFeatureRoot = function(queryString)
   {
      var root = null;
      if ((queryString != null) && (queryString.length > 0))
      {
         root = adfc.internal.UrlUtil.getUrlParamValue(queryString, "featureRoot");
         if (root != null)
         {
            root = unescape(root);
         }
      }
      return root;
   }
   
   UrlUtil.getParamStartIndex = function(url, name)
   {
      var sb = "?" + name;
      var index = url.indexOf(sb);
      if (index < 0)
      {
         sb = "&" + name;
         index = url.indexOf(sb.toString());
      }
      return index;
   }

   UrlUtil.getParamEndIndex = function(url, startIndex)
   {
      var endIndex = url.indexOf('&', startIndex);
      if (endIndex < 0)
      {
         endIndex = url.length;
      }
      return endIndex;
   }

   UrlUtil.getUrlParamValue = function(url, paramName)
   {
      var result = null;
      if ((url != null) && (paramName != null))
      {
         //
         //  Find out where the parameter value begins within the URL.
         //
         var startIndex = adfc.internal.UrlUtil.getParamStartIndex(url, paramName);
         if (startIndex >= 0)
         {
            //
            //  Find out where the parameter and value end within the URL.
            //
            var endIndex = adfc.internal.UrlUtil.getParamEndIndex(url, startIndex + 1);

            //
            //  Get the substring.
            //
            var value = url.substring(startIndex, endIndex);

            //
            //  Find the equals sign.
            //
            var start2 = value.indexOf('=');
            if ((start2 >= 0) && (start2 < value.length))
            {
               result = value.substring(start2 + 1);
               if (result.length == 0)
               {
                  result = null;
               }
            }
         }
      }
      return result;
   }
   
})();
/*
* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

(function(){

   adfc.internal.ViewIdUtil = ViewIdUtil;
   function ViewIdUtil()
   {
   }
   
   ViewIdUtil.logicalViewIdToActivityId = function(taskFlowId, logicalViewId)
   {
      var result = null;
      if ((logicalViewId != null) && (logicalViewId.length > 1))
      {
         //
         //  Figure out the local activityId from the logical viewId.
         //
         var localActivityId = null;
         if (taskFlowId == null)
         {
            //
            //  Unbounded ADF page flow case.
            //
            localActivityId = logicalViewId;
            if (localActivityId.charAt(0) == '/')
            {
               localActivityId = localActivityId.substring(1);
            }
         }
         else
         {
            //
            //  Make sure the logical viewId begins with "/" + localTaskFlowName.
            //
            var localTaskFlowName = taskFlowId.getLocalTaskFlowId();
            if (logicalViewId.indexOf(localTaskFlowName) == 1)
            {
               localActivityId = logicalViewId.substring(localTaskFlowName.length + 2);
            }
         }

         //
         //  Build the activityId.
         //
         if (localActivityId != null)
         {
            result = new adfc.internal.ActivityId(taskFlowId, localActivityId);
         }
      }
      return result;
   }
  
})();
/*
* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. 
 */

if (!window.adfc) window.adfc = {};
if (!adfc.internal) adfc.internal = {};

(function(){

   adfc.internal.XmlUtil = XmlUtil;
   function XmlUtil()
   {}
   
   /**
    * Loads an XML resource and returns it as a DOM.
    */
   XmlUtil.loadXmlFile = function(resourceName)
   {
      var result = null;
      
      //
      //  Load the XML.
      //
      var xmlString = XmlUtil.loadXmlWithAjax(resourceName);
      if ((xmlString != null) && (xmlString.length > 0))
      {
         var parser = new DOMParser();
         result = parser.parseFromString(xmlString, "text/xml");
      }
      else
      {
         adfc.internal.LogUtil.warning("failed to load XML for document: " + resourceName);
      }
      return result;
   }
   
   XmlUtil.loadXmlWithAjax = function(resourceName)
   {
      var result = null;
      var request = new XMLHttpRequest();
      request.open("GET", resourceName, false);
      request.send(null);
      if (request.readyState == 4)
      {
         result = request.responseText;
      }
      return result;
   }
   
   XmlUtil.doesFileExist = function(fileName) 
   {
      var result = false;
      var request = new XMLHttpRequest();
      request.open("GET", fileName, false);
      request.send(null);
      if (request.readyState == 4)
      {
         if ((request.responseText != null) && (request.responseText.length != 0))
         {
            result = true;
         }
      }
      return result;
   }
   
   XmlUtil.getNodeText = function(node)
   {
      var result = null;
      if (node)
      {
         var children = node.childNodes;
         for (var i = 0; i < children.length; i++)
         {
            var child = children.item(i);
            if (child.nodeType == Node.TEXT_NODE)
            {
               result = child.nodeValue;
               break;
            }
         }
      }
      if (result && (result.length == 0))
      {
         result = null;
      }
      return result;
   }
   
   XmlUtil.isTaskFlowDocument = function(path)
   {
      //
      //  Remove the '#' character from the path.
      //
      var index = path.indexOf('#');
      if (index > 0)
      {
         path = path.substring(0, index);
      }
      
      //
      //  Load the file content.
      //
      var request = new XMLHttpRequest();
      request.open("GET", path, false);
      request.send(null);
      if (request.readyState == 4)
      {
         var content = request.responseText;
      }
      else
      {
         throw new Error("failed to read entry point document " + path);
      }
      
      //
      //  Look for the 'adfc-mobile-config' element/string.
      //
      var result = false;
      if (content != null)
      {
         if (content.indexOf("adfc-mobile-config") > 0)
         {
            result = true;
         }
      }
      return result;
   }

})();
