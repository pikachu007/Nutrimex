/* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. */
/* ------------------------------------------------------ */
/* ------------------- amx-popup.js --------------------- */
/* ------------------------------------------------------ */

(function()
{
  /**
   * helper function to determine if an offset is
   * within the bounds of the current view
   * @param viewElement the view element for this page
   * @param offset the offset to check
   */
  function isOffsetVisible(viewElement, offset)
  {
    var viewHeight = viewElement.offsetHeight;
    return offset >= 0 && offset <= viewHeight;
  }

  function handleResize(event)
  {
    var viewElement    = event.data.viewElement;
    var popupElement   = event.data.popupElement;
    var alignElementId = event.data.alignElementId;
    var align          = event.data.align;
    alignPopup(viewElement, popupElement, alignElementId, align);

    // Adjust the glass pane's dimensions:
    var screenId = popupElement.getAttribute("data-screenId");
    var popupTransparentScreen = document.getElementById(screenId);
    if (popupTransparentScreen != null)
    {
      var bodyPage = document.getElementById("bodyPage");
      popupTransparentScreen.style.height = bodyPage.offsetHeight + "px";
      popupTransparentScreen.style.width = bodyPage.offsetWidth + "px";
    }
  }

  /**
   * helper function to align the popup based on the align value
   * and the alignId control's location.
   *
   * @param viewElement the view element for this page
   * @param popupElement the current popup DOM node
   * @param alignElementId the DOM ID of the element to align to
   * @param alignValue the type of alignment to be done
   */
  function alignPopup(viewElement, popupElement, alignElementId, alignValue)
  {
    // The alignElement is not guaranteed to stay around so we can't hold onto
    // a reference of it. Instead, we need to only hold onto an ID and if that
    // ID cannot be found, align to the viewElement instead.
    var alignElement = document.getElementById(alignElementId);
    if (alignElement == null)
      alignElement = viewElement;
    var popupStyle = popupElement.style;
    var popupComputedStyle = adf.mf.internal.amx.getComputedStyle(popupElement);

    var popupWidth = popupElement.offsetWidth +
        parseInt(popupComputedStyle.marginLeft, 10) +
        parseInt(popupComputedStyle.marginRight, 10);
    if (popupWidth > viewElement.offsetWidth)
    {
      //the popup extends off of both sides of the screen; clip it
      popupStyle.left = "0px";
      popupStyle.right = "0px";
    }
    else
    {
      //first calculate the horizontal alignment
      if (document.documentElement.dir == "rtl")
      {
        var popupRight =
          snapPopup(
            adf.mf.internal.amx.getElementRight(alignElement),
            popupWidth,
            viewElement.offsetWidth);
        popupStyle.right = popupRight + "px";
      }
      else
      {
        var popupLeft =
          snapPopup(
            adf.mf.internal.amx.getElementLeft(alignElement),
            popupWidth,
            viewElement.offsetWidth);
        popupStyle.left = popupLeft + "px";
      }
    }

    //we are aligning the popup element relative to the bottom border
    var popupHeight = popupElement.offsetHeight +
        parseInt(popupComputedStyle.marginTop, 10) +
        parseInt(popupComputedStyle.marginBottom, 10);
    if (popupHeight > viewElement.offsetHeight)
    {
      //the popup extends off of both the top and bottom of the screen; clip it
      popupStyle.top = "0px";
      popupStyle.bottom = "0px";
    }
    else
    {
      var alignComputedStyle = adf.mf.internal.amx.getComputedStyle(alignElement);
      var alignTop = adf.mf.internal.amx.getElementTop(alignElement);
      if (alignValue == "before")
      {
        //line up the bottom of the popup with the top of the alignment element
        var popupBottom = snapPopup(viewElement.offsetHeight -
              alignTop +
              parseInt(alignComputedStyle.marginTop, 10),
            popupHeight, viewElement.offsetHeight);
        popupStyle.bottom = popupBottom + "px";
      }
      else if (alignValue == "overlapBottom")
      {
        //line up the bottom of the popup with the bottom of the alignment element
        var popupBottom = snapPopup(viewElement.offsetHeight -
              (alignTop +
               alignElement.offsetHeight +
               parseInt(alignComputedStyle.marginBottom, 10)),
            popupHeight, viewElement.offsetHeight);
        popupStyle.bottom = popupBottom + "px";
      }
      else if (alignValue == "overlapTop")
      {
        //line up the top of the popup with the top of the alignment element
        var popupTop = snapPopup(alignTop - parseInt(alignComputedStyle.marginTop, 10),
            popupHeight, viewElement.offsetHeight);
        popupStyle.top = popupTop + "px";
      }
      else //alignValue == "after"; the default behavior
      {
        //line up the top of the popup with the bottom of the alignment element
        var popupTop = snapPopup(alignTop +
            alignElement.offsetHeight +
            parseInt(alignComputedStyle.marginBottom, 10),
            popupHeight, viewElement.offsetHeight);
        popupStyle.top = popupTop + "px";
      }
    }
  }

  /**
   * Get a position value such that the popup is adjusted to fit within the viewport.
   * @param {Number} popupStart the ideal popup location if truncation is not an issue
   * @param {popupSize} the size of the popup in the associated orientation
   * @param {viewSize} the size of the view in the associated orientation
   * @return {Number} the possibly adjusted popup position
   */
  function snapPopup(popupStart, popupSize, viewSize)
  {
    if (popupStart < 0)
    {
      //the popup extends off the top/left of the screen; move it
      return 0;
    }
    else if (popupStart + popupSize > viewSize)
    {
      return viewSize - popupSize;
    }
    return popupStart;
  }

  function findNode(callback)
  {
    var foundAmxNode = null;
    var rootNode = adf.mf.api.amx.getPageRootNode();
    rootNode.visit(
      new adf.mf.api.amx.VisitContext(),
      function (visitContext, amxNode)
      {
        if (callback(amxNode))
        {
          foundAmxNode = amxNode;
          return adf.mf.api.amx.VisitResult["COMPLETE"];
        }

        return adf.mf.api.amx.VisitResult["ACCEPT"];
      });

    return foundAmxNode;
  }

  function findNodeByIdAttribute(nodeAttributeId)
  {
    return findNode(
      function (amxNode)
      {
        // TODO: this should be using a stamp ID instead of the node's ID attribute
        return nodeAttributeId == amxNode.getAttribute("id");
      });
  }

  /**
   * Get the child elements that have the specified class names.
   * @param {HTMLElement} parentElement the element whose children will be traversed
   * @param {Array<String>} classNames the class names to search for
   * @return {Array} an array of found elements whose entries match the specified classNames order
   */
  function _getChildrenByClassNames(parentElement, classNames)
  {
    var childNodes = parentElement.childNodes;
    var childNodeCount = childNodes.length;
    var classNameCount = classNames.length;
    var foundChildren = [];
    var foundCount = 0;
    for (var i=0; i<childNodeCount && foundCount<classNameCount; ++i)
    {
      var child = childNodes[i];
      for (var j=0; j<classNameCount; ++j)
      {
        if (adf.mf.internal.amx.getCSSClassNameIndex(child.className, classNames[j]) != -1)
        {
          foundChildren[j] = child;
          ++foundCount;
          break; // done with this specific child
        }
      }
    }
    return foundChildren;
  }

// TODO finish the migration from "amx.*" to "adf.mf.api.amx.*" and "adf.mf.internal.amx.*"
  amx.processShowPopupBehavior = function(amxNode, showPopupBehaviorTag)
  {
    // TODO these should be relative IDs!
    var popupId = showPopupBehaviorTag.getAttribute("popupId");
    popupId = adf.mf.el.getLocalValue(popupId); // what if not found?
    var alignId = showPopupBehaviorTag.getAttribute("alignId");
    alignId = adf.mf.el.getLocalValue(alignId); // what if not found?
    var align   = showPopupBehaviorTag.getAttribute("align");
    align = adf.mf.el.getLocalValue(align); // what if not found?

    // Find the popup node in the hierarchy with the provided ID
    var popupAmxNode = findNodeByIdAttribute(popupId);

    if (popupAmxNode == null)
    {
      // TODO: log error
      return;
    }

    // we set the _renderPopup to force full rendering
    var showPopupAttributes = {
      "popupId": popupId,
      "alignId": alignId,
      "align": align
    };
    popupAmxNode.setAttributeResolvedValue("_showPopupAttributes", showPopupAttributes);
    popupAmxNode.setAttributeResolvedValue("_renderPopup", true);
    var args = new adf.mf.internal.amx.AmxNodeUpdateArguments();
    args.setAffectedAttribute(popupAmxNode, "_showPopupAttributes");
    args.setAffectedAttribute(popupAmxNode, "_renderPopup");
    adf.mf.internal.amx.markNodeForUpdate(args);
  };

  function closePopup(popupElement, skipUpdates)
  {
    var screenId = popupElement.getAttribute("data-screenId");
    var bodyPage = document.getElementById("bodyPage");
    var popupTransparentScreen = document.getElementById(screenId);

    var popupAmxNode = adf.mf.internal.amx._getNonPrimitiveElementData(popupElement, "amxNode");
    popupAmxNode.setAttributeResolvedValue("_renderPopup", false);

    if (!skipUpdates)
    {
      var args = new adf.mf.internal.amx.AmxNodeUpdateArguments();
      args.setAffectedAttribute(popupAmxNode, "_renderPopup");
      adf.mf.internal.amx.markNodeForUpdate(args);
    }

    $(window).unbind('resize', handleResize);

    // invocation of the following two "remove()" calls placed on a delay to work around an issue with crashing
    // on iOS devices related to bug #14355583
    // The timeout was changed from 100ms to 300ms to workaround Android 4.1 issues on the Nexus 7 when the
    // transparent glass is tapped quickly and the popup is autodismissed. Bug 14165833.
    setTimeout(function()
    {
      $(popupTransparentScreen).remove();
      $(popupElement).remove();

      // The view container is no longer hidden from screen readers:
      var firstViewContainer = _getChildrenByClassNames(bodyPage, ["amx-view-container"])[0];
      firstViewContainer.setAttribute("aria-hidden", "false"); // Note: toggling this doesn't work on iOS 5 but does in iOS 6
    }, 300);
  }

  /**
   * Processes the closePopupBehavior event.
   * @param {adf.mf.api.amx.AmxNode} amxNode the amxNode of the component that triggered the event
   * @param {adf.mf.api.amx.AmxTag} closePopupBehaviorTag the AMX tag for the closePopupBehavior tag (to access the popupId to close)
   */
  amx.processClosePopupBehavior = function(amxNode, closePopupBehaviorTag)
  {
    var popupIdToClose = closePopupBehaviorTag.getAttribute("popupId");
    popupIdToClose = adf.mf.el.getLocalValue(popupIdToClose); // what if not found?

    var popupElement = null;

    if (popupIdToClose != null)
    {
      var actualPopupElementId = popupIdToClose + "::popupElement";
      popupElement = document.getElementById(actualPopupElementId);
    }

    if (popupElement == null)
    {
      // We could not find it so use the one nearest the component that triggered the event:
      var triggerNodeId = amxNode.getId();
      // TODO this needs to be promoted to a formal warning; do not use amx.log
      amx.log.debug(
        "No element with the closePopupBehavior popupId found: " +
        popupIdToClose +
        " so using the triggerNodeId=" +
        triggerNodeId +
        " instead");

      var popupCandidate = document.getElementById(triggerNodeId);
      while (popupCandidate != null)
      {
        if (adf.mf.internal.amx.getCSSClassNameIndex(popupCandidate.className, "amx-popup") != -1)
        {
          popupElement = popupCandidate;
          break;
        }
        popupCandidate = popupCandidate.parentNode;
      }
    }

    if (popupElement == null)
    {
      // TODO this either needs to be removed or needs to be promoted to a formal debug message; do not use amx.log
      amx.log.debug("No nearest popup found for closing");
    }
    else
    {
      closePopup(popupElement);
    }
  };

  var amxRenderers =
  {
    popup:
    {
      createChildrenNodes: function(amxNode)
      {
        // We only want to generate the children amxNode objects
        // that are inside of a popup if the popup is being shown:
        if (amxNode.getAttribute("_renderPopup"))
        {
          amxNode.createStampedChildren(null, null, null);
        }
        return true;
      },

      updateChildren: function(amxNode, attributeChanges)
      {
        // Handle if and only if "_renderPopup" changed:
        if (attributeChanges.hasChanged("_renderPopup"))
        {
          // Create the children if they have not already been created in a previous
          // event.
          if (amxNode.getAttribute("_renderPopup") && amxNode.getChildren().length == 0)
          {
            // If now shown, create the children amxNodes:
            amxNode.createStampedChildren(null, null, null);
          }
        }

        if (attributeChanges.getSize() == 2 &&
          attributeChanges.hasChanged("_renderPopup") &&
          attributeChanges.hasChanged("_showPopupAttributes"))
        {
          return adf.mf.api.amx.AmxNodeChangeResult["REFRESH"];
        }
        else
        {
          return adf.mf.api.amx.AmxNodeChangeResult["RERENDER"];
        }
      },

      create: function(amxNode)
      {
        var holderElement = document.createElement("div");
        holderElement.className = "popup-holder";

        try
        {
          var amxNodeId = amxNode.getId();
          var popupElement = document.getElementById(amxNodeId + "::popupElement");
          if (popupElement != null)
          {
            // A popup is already shown:
            if (amxNode.getAttribute("_renderPopup"))
            {
              // We need to clear out the children, re-add them, and reposition if applicable
              /*var $popupElement = $(popupElement); // TODO make non-jq
              $popupElement.empty(); // TODO make non-jq
              $popupElement.append(amxNode.renderSubNodes()); // TODO make non-jq*/
              $(popupElement).remove();
              this._showPopup(amxNode, false);
            }
            else
            {
              // We need to remove the existing popup:
              closePopup(popupElement, true);
            }
          }
        }
        catch (problem)
        {
          console.log(problem);
        }

        return holderElement;
      },

      refresh: function(amxNode, attributeChanges)
      {
        this._showPopup(amxNode, true);
      },

      _showPopup: function(amxNode, completelyNewPopup)
      {
        var showPopupAttributes = amxNode.getAttribute("_showPopupAttributes");
        var popupId = showPopupAttributes["popupId"];
        var alignId = showPopupAttributes["alignId"];
        var align = showPopupAttributes["align"];

        var bodyPage = document.getElementById("bodyPage");
        var firstViewContainer = _getChildrenByClassNames(bodyPage, ["amx-view-container"])[0];
        var viewElement = _getChildrenByClassNames(firstViewContainer, ["amx-view"])[0];

        var amxNodeId = amxNode.getId();
        var popupHolder = document.getElementById(amxNodeId);
        var popupElement = document.createElement("div");
        adf.mf.internal.amx._setNonPrimitiveElementData(popupElement, "amxNode", amxNode);
        var popupElementId = amxNodeId + "::popupElement";
        popupElement.setAttribute("id", popupElementId);
        popupElement.style.cssText = popupHolder.style.cssText;
        popupElement.className = popupHolder.className;
        adf.mf.internal.amx.removeCSSClassName(popupElement, "popup-holder");

        // Adding WAI-ARIA Attribute for the popup component
        popupElement.setAttribute("role", "dialog");

        // make sure this responds to dragging for scrolling purposes
        adf.mf.internal.amx.addCSSClassName(popupElement, "amx-scrollable");

        $(popupElement).append(amxNode.renderSubNodes()); // TODO make non-jq

        var alignAmxNode = null;
        if (alignId != null && alignId != "")
        {
          alignAmxNode = findNodeByIdAttribute(alignId);
        }

        if (alignAmxNode == null)
        {
          // if there is no alignId, just set align to the current view
          alignAmxNode = findNode(
            function (amxNode)
            {
              var tag = amxNode.getTag();
              return (tag.getNamespace() == "http://xmlns.oracle.com/adf/mf/amx" &&
                tag.getName() == "view");
            });
        }

        // hide the popupElement during positioning (since we  have to add it first)
        // Note: z-index did not work here.
        var popupStyle = popupElement.style;
        popupStyle.opacity = "0";

        if (completelyNewPopup)
        {
          var preventDefaultEventFunc = function(event)
          {
            // If we don't eat the event then tapping the glass pane could also trigger
            // taps on things like inputText or selectOneChoice
            event.preventDefault();
            event.stopPropagation();
          };

          // append the screen if we don't have one yet
          var popupTransparentScreen = document.createElement("div");
          var autoDismiss = amxNode.getAttribute("autoDismiss");
          if (amx.isValueTrue(autoDismiss))
          {
            // Make the auto-dismiss screen accessible
            popupTransparentScreen.setAttribute("role", "button");
            popupTransparentScreen.setAttribute("tabindex", "0");
            var dismissButtonLabel =
              adf.mf.resource.getInfoString("AMXInfoBundle","amx_popup_DISMISS_BUTTON_LABEL");
            popupTransparentScreen.setAttribute("aria-label", dismissButtonLabel);
          }
          popupTransparentScreen.className = "popupTransparentScreen";
          var screenId = amx.uuid();
          amxNode.setAttributeResolvedValue("_screenId", screenId);
          popupTransparentScreen.id = screenId;

          // The view container is now hidden from screen readers:
          firstViewContainer.setAttribute("aria-hidden", "true"); // Note: toggling this doesn't work on iOS 5 but does in iOS 6

          bodyPage.appendChild(popupTransparentScreen);
          popupElement.setAttribute("data-screenId", screenId);

          var clickHandler = function(event)
          {
            preventDefaultEventFunc(event);
            // make the screen perform autodismiss if needed
            var autoDismiss = amxNode.getAttribute("autoDismiss");
            if (amx.isValueTrue(autoDismiss))
            {
              closePopup(document.getElementById(popupElementId));
            }
          };

          // make sure the transparent screen blocks events from being sent to controls on the amx page under the popup
          $(popupTransparentScreen).tap(clickHandler);
          $(popupTransparentScreen).bind(
            'click mouseup mousemove mousedown touchstart touchmove touchend',
            preventDefaultEventFunc);
          $(popupTransparentScreen).drag(
            {
              start: preventDefaultEventFunc,
              drag: preventDefaultEventFunc,
              end: preventDefaultEventFunc
            });
        }
        else
        {
          popupElement.setAttribute("data-screenId", amxNode.getAttribute("_screenId"));
        }

        // need to append first, cause we need to get the popupElement's height;
        bodyPage.appendChild(popupElement);

        var alignElementId = alignAmxNode.getId();
        alignPopup(viewElement, popupElement, alignElementId, align);

        // now we remove the opacity (not that we set the "" to remove the css property rather to set one
        // in case it is part of a transition)
        popupStyle.opacity = "";

        if (completelyNewPopup)
        {
          var animation = amxNode.getAttribute("animation");
          var hasTransition = true;
          var documentElement = document.documentElement;
          var isRtl = (documentElement.dir == "rtl");
          var translateDistance = 300;

          if (animation == "slideUp" || animation == "slideDown")
          {
            translateDistance = Math.max(300, documentElement.clientHeight);
          }
          else
          {
            translateDistance = Math.max(300, documentElement.clientWidth);
          }

          if (animation == "slideUp")
          {
            popupStyle.webkitTransform = "translate(0px,"+translateDistance+"px)";
          }
          else if (animation == "slideDown")
          {
            popupStyle.webkitTransform = "translate(0px,-"+translateDistance+"px)";
          }
          else if (animation == "slideStart")
          {
            if (isRtl)
              popupStyle.webkitTransform = "translate(-"+translateDistance+"px,0px)";
            else
              popupStyle.webkitTransform = "translate("+translateDistance+"px,0px)";
          }
          else if (animation == "slideEnd")
          {
            if (isRtl)
              popupStyle.webkitTransform = "translate("+translateDistance+"px,0px)";
            else
              popupStyle.webkitTransform = "translate(-"+translateDistance+"px,0px)";
          }
          else if (animation == "slideLeft")
          {
            popupStyle.webkitTransform = "translate("+translateDistance+"px,0px)";
          }
          else if (animation == "slideRight")
          {
            popupStyle.webkitTransform = "translate(-"+translateDistance+"px,0px)";
          }
          else
          {
            hasTransition = false;
          }

          if (hasTransition)
          {
            setTimeout(function()
            {
              adf.mf.internal.amx.addCSSClassName(popupElement, "transitioning");
              popupStyle.webkitTransform = "translate(0px,0px)";
              $(popupElement).bind("webkitTransitionEnd",function()
              {
                adf.mf.internal.amx.removeCSSClassName(popupElement, "transitioning");
                $(popupElement).unbind("webkitTransitionEnd");
                //added to address bug #14599728, caused by the transparent screen becoming over-sized by
                //the popup animation
                popupTransparentScreen.style.height = bodyPage.offsetHeight + "px";
                popupTransparentScreen.style.width = bodyPage.offsetWidth + "px";
              });
            },
            0);
          }
        }

        var data = {
          "viewElement":  viewElement,
          "popupElement": popupElement,
          "alignElementId": alignElementId,
          "align":        align
        };
        $(window).resize(data, handleResize); // TODO needed?

      } // end of _showPopup
    } // end of the popup type handler
  };

  amx.registerRenderers("amx",amxRenderers);

  /**
   * close all popups currently showing on the screen
   */
  adf.mf.internal.amx.closePopups = function()
  {
    // since the popups are appended to bodyPage, search in reverse-order
    // so that all of the popups are retrieved with the last one first
    // note, the length will change as the popups are removed, so get all of
    // the popups first and then remove them
    var bodyPage = document.getElementById("bodyPage");
    var initialLength = bodyPage.childNodes.length;
    var popups = new Array();
    for (var i = initialLength-1; i >= 0; --i)
    {
      var node = bodyPage.childNodes[i];
      if (adf.mf.internal.amx.getCSSClassNameIndex(node.className, "amx-popup") == -1)
      {
        continue;
      }

      popups.push(node);
      // for now, since we don't support multiple popups, just break
      break;
    }

    var length = popups.length;
    for (var i = 0; i < length; ++i)
    {
      closePopup(popups[i]);
    }
  }

  // ---------- Popup Transitions ---------- //
  //TODO: put the transitions here.
  // ---------- Popup Transitions ---------- //
})();
