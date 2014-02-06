/* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. */
(function($)
{
  amx.registerRenderers("amx",
  {
    panelItem:
    {
      create: function(amxNode)
      {
        // Attributes:
        //   animation (String; animation override for this panelItem; use the panelSplitter's by default)
        //   shortDesc (String)

        // Create the top level div that will hhouse all the components used in the splitter.
        var rootElement = document.createElement("div");
        rootElement.setAttribute("title", this._ensureValidString(amxNode.getAttribute("shortDesc"), ""));
        $(rootElement).append(amxNode.renderSubNodes()); // TODO make non-jq
        adf.mf.internal.amx.addCSSClassName(rootElement, "current");
        return rootElement;
      },

      _ensureValidString: function(rawValue, defaultValue)
      {
        // TODO is there a shared util we can use instead?
        if (rawValue == null)
          return defaultValue;
        return rawValue;
      }
    },

    panelSplitter:
    {
      createChildrenNodes: function(amxNode)
      {
        var tag = amxNode.getTag();
        if (amxNode.getAttribute("selectedItem") === undefined)
        {
          // See if this is EL bound and the value is currently not loaded
          if (tag.isAttributeElBound("selectedItem"))
          {
            // In this case we cannot create the children yet
            amxNode.setState(adf.mf.api.amx.AmxNodeStates["INITIAL"]);
            return true;
          }

          // Otherwise the attribute was simply not specified, so default
          // to the first item found
        }

        var selectedTag = this._getSelectedTag(amxNode);
        var resolvedSelectedItemId = selectedTag == null ? null : selectedTag.getAttribute("id");
        adf.mf.api.amx.setVolatileState(amxNode.getAttribute("id"), { "resolvedSelectedItemId": resolvedSelectedItemId });

        // Create the child for the selected item
        amxNode.addChild(selectedTag.buildAmxNode(amxNode, null));

        // Process the navigator facet
        var navigatorFacetTag = tag.getChildFacetTag("navigator");
        if (navigatorFacetTag != null)
        {
          var facetTagChildren = navigatorFacetTag.getChildrenUITags();
          for (i = 0, size = facetTagChildren.length; i < size; ++i)
          {
            var facetTagChild = facetTagChildren[i];
            amxNode.addChild(facetTagChild.buildAmxNode(amxNode, null), "navigator");
          }
        }

        return true;
      },

      updateChildren: function(amxNode, attributeChanges)
      {
        // Handle if and only if "selectedItem" changed:
        if (attributeChanges.hasChanged("selectedItem"))
        {
          var changedSize = attributeChanges.getSize();
          // Using attributeChanges.getOldValue("selectedItem") isn't sufficient because we might also default to the 1st child in some cases
          var oldSelectedItem = adf.mf.api.amx.getVolatileState(amxNode.getAttribute("id"))["resolvedSelectedItemId"];
          var newSelectedItem = amxNode.getAttribute("selectedItem");
          if (newSelectedItem != oldSelectedItem)
          {
            var children = amxNode.getChildren();
            if (children.length > 0)
            {
              var oldSelectedNode = children[0];

              // Remove the old child
              amxNode.removeChild(oldSelectedNode);
            }

            // Create the new item
            var selectedTag = this._getSelectedTag(amxNode);

            // Create the child for the selected item
            amxNode.addChild(selectedTag.buildAmxNode(amxNode, null));

            // Update the selected item stored in the volatile state
            adf.mf.api.amx.setVolatileState(
              amxNode.getAttribute("id"),
              { "resolvedSelectedItemId": selectedTag.getAttribute("id") });

            if (changedSize == 1)
            {
              return adf.mf.api.amx.AmxNodeChangeResult["REFRESH"];
            }
          }
          else if (changedSize == 1)
          {
            // Nothing really changed, so don't re-render anything
            return adf.mf.api.amx.AmxNodeChangeResult["NONE"];
          }
        }

        return adf.mf.api.amx.AmxNodeChangeResult["RERENDER"];
      },

      create: function(amxNode)
      {
        // Attributes:
        //   animation (String; default animation for a panelItem)
        //   inlineStyle (String)
        //   navigatorTitle (String)
        //   position (String; CSS length)
        //   selectedItem (String; id of a panelItem child)
        //   shortDesc (String)
        //   styleClass (String)

        // DOM Structure:
        //   root div data-orientation amx-panelSplitter
        //     div amx-panelSplitter_inner
        //       div amx-panelSplitter_navLandscape
        //         navigator facet e.g. listView component (if displaying in landscape mode)
        //       div amx-panelSplitter_contentContainer amx-landscape/amx-portrait amx-noNavigation
        //         div amx-panelItem current/new/old/showing/transitioning/transitioning-slow/face/front/flip
        //       div amx-panelSplitter_screenPortrait
        //       div amx-panelSplitter_button (has optional "disclosed", "no-animate")
        //       div amx-panelSplitter_navPortrait (has optional "no-animate")
        //         navigator facet e.g. listView component (if displaying in portrait mode)

        try
        {
          // Get the initial portrait/landscape mode (updates are handled during resize).
          var orientation = this._getOrientation();

          var position = this._getPosition(amxNode);

          // Create the top level div that will house all the components used in the splitter.
          var rootElement = document.createElement("div");
          rootElement.setAttribute("title", this._ensureValidString(amxNode.getAttribute("shortDesc"), ""));
          rootElement.setAttribute("data-orientation", orientation);

          // =-= melges:
          // This is a bit of a hack but we need to create an inner DIV to protect from styling infringing on the
          // splitter content and navigation elements. Without this we would get extra space in both.
          var inner = document.createElement("div");
          inner.className = "amx-panelSplitter_inner";
          rootElement.appendChild(inner);

          var content = document.createElement("div");
          content.className = "amx-panelSplitter_contentContainer amx-scrollable";
          inner.appendChild(content);
          // Adding WAI-ARIA Role Attribute for the content div
          content.setAttribute("role", "contentinfo");

          //  First thing to check for is that we have a navigator facet.
          var navigatorChildren = amxNode.getRenderedChildren("navigator");
          if (navigatorChildren.length > 0)
          {
            var inLandscape = (orientation == "landscape"); // side-by-side mode
            this._createNavigation(inLandscape, amxNode, inner, rootElement, position);
            if (inLandscape)
            {
              adf.mf.internal.amx.addCSSClassName(content, "amx-landscape");
              if (document.documentElement.dir == "rtl")
                content.style.right = position.landscape;
              else
                content.style.left = position.landscape;
            }
            else
            {
              adf.mf.internal.amx.addCSSClassName(content, "amx-portrait");
            }
          }
          else
          {
            adf.mf.internal.amx.addCSSClassName(content, "amx-noNavigation");
          }

          // Render the content.
          var children = amxNode.getRenderedChildren();
          var selectedNode = children.length > 0 ? children[0] : null;
          if (selectedNode != null)
          {
            var $viewTag = selectedNode.renderNode(); // TODO make non-jq
            if ($viewTag != null)
            {
              var viewDomNode = $viewTag.get(0);
              adf.mf.internal.amx.addCSSClassName(viewDomNode, "current");
              content.appendChild(viewDomNode);
            }
          }

          return rootElement;
        }
        catch (problem)
        {
          console.error(problem);
        }
      },

      postDisplay: function(rootElement, amxNode)
      {
        try
        {
          var inner = rootElement.firstChild;
          var foundChildNodes =
            this._getChildrenByClassNames(
              inner,
              [
                "amx-panelSplitter_navLandscape",
                "amx-panelSplitter_navPortrait",
                "amx-panelSplitter_contentContainer"
              ]);
          var navLandscape = foundChildNodes[0];
          var navPortrait  = foundChildNodes[1];
          var content      = foundChildNodes[2];

          // Restore the old scroll position in case this view instance already had one:
          var storedData = adf.mf.api.amx.getClientState(amxNode.getId());
          if (storedData != null)
          {
            this._restoreScrollPositions(navLandscape, storedData.navLandscape);
            this._restoreScrollPositions(navPortrait, storedData.navPortrait);
            this._restoreScrollPositions(content, storedData.content);
          }

          // Add resize event listeners
          if (amxNode.getChildren("navigator").length > 0)
          {
            var data = {
              "rootElement": rootElement,
              "peer":        this,
              "amxNode":     amxNode
            };

            // Listen if someone resizes the window:
            $(window).resize(data, this._handleResize);

            // Listen if someone explicitly calls .resize() on my root element:
            $(rootElement).resize(data, this._handleResize);
          }
        }
        catch (problem)
        {
          console.error(problem);
        }
      },

      refresh: function(amxNode, attributeChanges)
      {
        try
        {
          // The old child will be removed by the createChildrenNodes function
          // which is called before the refresh function, but the new
          // selected node needs to be rendered still.
          var children = amxNode.getRenderedChildren();
          if (children.length == 0)
          {
            // There was no selected node found (no children tags) so there is
            // nothing to do.
            return;
          }

          // get the current $content Node
          var rootElement = document.getElementById(amxNode.getId());
          var inner = rootElement.firstChild;
          var content = this._getChildrenByClassNames(inner, ["amx-panelSplitter_contentContainer"])[0];

          if (adf.mf.internal.amx.getCSSClassNameIndex(rootElement.className, "changingSelectedItem") != -1)
          {
            // Changing the selected item too quickly--another one is in progress.
            // TODO need to handle this scenario (if can't clean up the DOM then cover up the navigators when busy)
          }
          adf.mf.internal.amx.addCSSClassName(rootElement, "changingSelectedItem");

          var panelItemElements = content.childNodes;
          var panelItemCount = panelItemElements.length;
          var currentPanelItem = this._getChildrenByClassNames(content, ["current"])[0];

          // Render the newly-selected panelItem
          var selectedNode = children[0];
          var $viewTag = selectedNode.renderNode(); // TODO make non-jq
          if ($viewTag != null)
          {
            var viewTag = $viewTag.get(0);
            var resolvedSelectedItemId = viewTag == null ? null : viewTag.getAttribute("id");
            adf.mf.api.amx.setVolatileState(amxNode.getAttribute("id"), { "resolvedSelectedItemId": resolvedSelectedItemId });
            adf.mf.internal.amx.addCSSClassName(viewTag, "new");
            content.appendChild(viewTag);
            // --MRE: This is a temporary fix for resizing certain components like DVT. The issue is when the component
            // is created it does not know the size and defaults to a much smaller size. This will now call the
            // resize event if there is only a single child root element.
            if (viewTag.childNodes.length == 1)
            {
              $(viewTag.childNodes[0]).resize();
            }
          }

          // Animate the transition of the old-to-new panelItems
          if (rootElement.getAttribute("data-orientation") == "portrait")
          {
            try
            {
              var position = this._getPosition(amxNode);
              this._undiscloseNavPortrait(rootElement, position);
            }
            catch (problem)
            {
              console.error(problem);
            }
          }

          var newPanelItem = this._getChildrenByClassNames(content, ["new"])[0];
          var transitionParams = this._getTransitionParams(amxNode, selectedNode);
          var transitionDfd = null;

          if (transitionParams.type == "slide")
          {
            // Remove the current CSS class added in the panel item create as it will be added
            // once the transition has completed
            adf.mf.internal.amx.removeCSSClassName(newPanelItem, "current");

            transitionDfd = this._slide(rootElement, currentPanelItem, newPanelItem,
              transitionParams.direction);
          }
          else if (transitionParams.type == "flip")
          {
            // Remove the current CSS class added in the panel item create as it will be added
            // once the transition has completed
            adf.mf.internal.amx.removeCSSClassName(newPanelItem, "current");

            transitionDfd = this._flip(rootElement, currentPanelItem, newPanelItem,
              transitionParams.direction);
          }
          else // no animation
          {
            adf.mf.internal.amx.removeCSSClassName(newPanelItem, "new");
            adf.mf.internal.amx.addCSSClassName(newPanelItem, "current");
            this._removeAllButThisOrTheOnlyPanelItem(newPanelItem, content);
            adf.mf.internal.amx.removeCSSClassName(rootElement, "changingSelectedItem");
          }

          if (transitionDfd != null)
          {
            // Prevent AMX node hierarchy and DOM node changes during transition animation
            adf.mf.internal.amx.pauseUIChanges();

            transitionDfd.always(
              function ()
              {
                adf.mf.internal.amx.resumeUIChanges();
              });
          }
        }
        catch (problem)
        {
          console.error(problem);
        }
      },

      preDestroy: function($nodeOrDomNode, amxNode)
      {
        // Temporary shim until jQuery is completely removed:
        var rootElement;
        if ($nodeOrDomNode.jquery)
          rootElement = $nodeOrDomNode.get(0);
        else
          rootElement = nodeOrDomNode;

        // Store off the current scroll position in case this view instance is ever revisited:
        this._storeScrollPositions(rootElement, amxNode.getId());
      },

      _getSelectedTag: function(amxNode)
      {
        var tag = amxNode.getTag();
        var selectedItem = amxNode.getAttribute("selectedItem");
        var childrenTags = tag.getChildren("http://xmlns.oracle.com/adf/mf/amx",
          "panelItem");
        var firstTag = null;

        // Loop through all the children UI tags and look for the selected
        // tag. If there is no selected item, use the first child tag
        for (var i = 0, size = childrenTags.length; i < size; ++i)
        {
          var childTag = childrenTags[i];
          if (selectedItem == null)
          {
            // Just use the first UI tag if there is no selected one
            return childTag;
          }

          if (i == 0)
          {
            // Remember the first tag in case the selected one is not found
            firstTag = childTag;
          }

          // The selected item is the ID (not scoped ID) of the child tag. If this
          // matches use this tag.
          if (childTag.getAttribute("id") == selectedItem)
          {
            return childTag;
          }
        }

        // If the selected tag was never found, use the first tag instead
        return firstTag;
      },

      _removeAllButThisOrTheOnlyPanelItem: function(panelItemToKeep, content)
      {
        var childNodes = content.childNodes;
        var childNodeCount = childNodes.length;
        for (var i=childNodeCount; i>=0 && content.childNodes.length > 1; --i)
        {
          var child = childNodes[i];
          if (child != panelItemToKeep)
            $(child).remove(); // TODO make non-jq
        }
      },

      /**
       * Get the child elements that have the specified class names.
       * @param {HTMLElement} parentElement the element whose children will be traversed
       * @param {Array<String>} classNames the class names to search for
       * @return {Array} an array of found elements whose entries match the specified classNames order
       */
      _getChildrenByClassNames: function(parentElement, classNames)
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
      },

      _storeScrollPositions: function(rootElement, amxNodeId)
      {
        // Store off the current scroll position in case this view instance is ever revisited:
        var inner = rootElement.firstChild;
        var foundChildNodes =
          this._getChildrenByClassNames(
            inner,
            [
              "amx-panelSplitter_navLandscape",
              "amx-panelSplitter_navPortrait",
              "amx-panelSplitter_contentContainer"
            ]);
        var navLandscape = foundChildNodes[0];
        var navPortrait  = foundChildNodes[1];
        var content      = foundChildNodes[2];
        var storedData =
        {
          navLandscape: this._getScrollPositions(navLandscape),
          navPortrait:  this._getScrollPositions(navPortrait),
          content:      this._getScrollPositions(content)
        };
        adf.mf.api.amx.setClientState(amxNodeId, storedData);
      },

      _getScrollPositions: function(domNode)
      {
        if (domNode)
        {
          var scrollLeft = domNode.scrollLeft;
          var scrollTop = domNode.scrollTop;
          if (scrollLeft != null && scrollTop != null)
          {
            return {
              scrollLeft: scrollLeft,
              scrollTop: scrollTop
            };
          }
        }
        return null;
      },

      _restoreScrollPositions: function(domNode, scrollPositions)
      {
        if (domNode && scrollPositions)
        {
          var scrollLeft = scrollPositions.scrollLeft;
          if (scrollLeft != null)
            domNode.scrollLeft = scrollLeft;
          var scrollTop = scrollPositions.scrollTop;
          if (scrollTop != null)
            domNode.scrollTop = scrollTop;
        }
      },

      _getTransitionParams: function(amxNodeSplitter, amxNodePanelItem)
      {
        // The panelItem we are going to show has first crack at defining the animation.
        var animation = "none";
        var params = null;

        if (amxNodePanelItem.getAttribute("animation") != null)
        {
          animation = amxNodePanelItem.getAttribute("animation");
        }
        else if (amxNodeSplitter.getAttribute("animation") != null)
        {
          animation = amxNodeSplitter.getAttribute("animation");
        }
        animation = animation.toLowerCase();

        switch (animation)
        {
          case "flipup":
            params = {"type": "flip", "direction":"up"};
            break;
          case "flipdown":
            params = {"type": "flip", "direction":"down"};
            break;
          case "flipleft":
            params = {"type": "flip", "direction":"left"};
            break;
          case "flipright":
            params = {"type": "flip", "direction":"right"};
            break;
          case "flipstart":
            params = {"type": "flip", "direction":"start"};
            break;
          case "flipend":
            params = {"type": "flip", "direction":"end"};
            break;
          case "slideup":
            params = {"type": "slide", "direction":"up"};
            break;
          case "slidedown":
            params = {"type": "slide", "direction":"down"};
            break;
          case "slideleft":
            params = {"type": "slide", "direction":"left"};
            break;
          case "slideright":
            params = {"type": "slide", "direction":"right"};
            break;
          case "slidestart":
            params = {"type": "slide", "direction":"start"};
            break;
          case "slideend":
            params = {"type": "slide", "direction":"end"};
            break;
          default:
            params = {"type": "none", "direction":"start"};
        }
        return params;
      },

      _slide: function(rootElement, currentPanelItem, newPanelItem, direction)
      {
        var vertical = false;
        var back = false;

        if (direction == "up" || direction == "down")
        {
          vertical = true;
        }

        var isRtl = (document.documentElement.dir == "rtl");
        if (isRtl)
        {
          if (direction == "left" || direction == "end" || direction == "down")
          {
            back = true;
          }
        }
        else // ltr
        {
          if (direction == "right" || direction == "end" || direction == "down")
          {
            back = true;
          }
        }

        var dfd = $.Deferred();
        // for now, we assume, position currentPanelItem is 0, 0, and that all views should have same size
        // (fair assumption since the newPanelItem was drawn below the currentPanelItem)
        var currentToX;
        if (vertical)
        {
          var height = currentPanelItem.offsetHeight; // should probably take from parent to be safe
          var fromX = back ? (-1) * height : height;
          currentToX = fromX * -1;
          currentPanelItem.style.height = height + "px";
          newPanelItem.style.height = height + "px";

          newPanelItem.style.top = fromX + "px";
        }
        else // horizontal
        {
          // fix the width of the two view during animation.
          var width = currentPanelItem.offsetWidth; // should probably take from parent to be safe
          var fromX = back ? (-1) * width : width;
          currentToX = fromX * (isRtl ? 1 : -1);
          currentPanelItem.style.width = width + "px";
          newPanelItem.style.width = width + "px";

          // put the newPanelItem in the fromX
          if (document.documentElement.dir == "rtl")
            newPanelItem.style.right = fromX + "px";
          else
            newPanelItem.style.left = fromX + "px";
        }

        //adf.mf.internal.amx.addCSSClassName(newPanelItem, "setup");
        adf.mf.internal.amx.removeCSSClassName(newPanelItem, "new");
        adf.mf.internal.amx.addCSSClassName(newPanelItem, "showing");

        var peer = this;
        setTimeout(function()
        {
          var currentDfd = $.Deferred();
          var newDfd = $.Deferred();

          adf.mf.internal.amx.addCSSClassName(newPanelItem, "transitioning");

          adf.mf.internal.amx.addCSSClassName(currentPanelItem, "transitioning");
          if (vertical)
          {
            currentPanelItem.style.webkitTransform = "translate(0," + currentToX + "px)";
          }
          else
          {
            currentPanelItem.style.webkitTransform = "translate(" + currentToX + "px,0)";
          }
          $(currentPanelItem).bind("webkitTransitionEnd", function()
          {
            adf.mf.internal.amx.removeCSSClassName(currentPanelItem, "current");
            adf.mf.internal.amx.addCSSClassName(currentPanelItem, "old");
            adf.mf.internal.amx.removeCSSClassName(currentPanelItem, "transitioning");
            var inner = rootElement.firstChild;
            var content = peer._getChildrenByClassNames(inner, ["amx-panelSplitter_contentContainer"])[0];
            peer._removeAllButThisOrTheOnlyPanelItem(newPanelItem, content);
            currentDfd.resolve();
          });

          adf.mf.internal.amx.addCSSClassName(newPanelItem, "transitioning");
          if (vertical)
          {
            newPanelItem.style.webkitTransform = "translate(0," + currentToX + "px)";
          }
          else
          {
            newPanelItem.style.webkitTransform = "translate(" + currentToX + "px,0)";
          }
          $(newPanelItem).bind("webkitTransitionEnd", function()
          {
            adf.mf.internal.amx.removeCSSClassName(newPanelItem, "showing");
            adf.mf.internal.amx.addCSSClassName(newPanelItem, "current");
            adf.mf.internal.amx.removeCSSClassName(newPanelItem, "transitioning");
            newPanelItem.setAttribute("style", "");
            newDfd.resolve();
          });

          $.when(currentDfd, newDfd).done(function()
          {
            dfd.resolve();
            adf.mf.internal.amx.removeCSSClassName(rootElement, "changingSelectedItem");
          });
        }, 1);

        return dfd.promise();
      },

      _flip: function(rootElement, currentPanelItem, newPanelItem, direction)
      {
        var vertical = false;
        var back = false;

        if (direction == "up" || direction == "down")
        {
          vertical = true;
        }

        var isRtl = (document.documentElement.dir == "rtl");
        if (isRtl)
        {
          if (direction == "right" || direction == "start" || direction == "up")
          {
            back = true;
          }
        }
        else // ltr
        {
          if (direction == "right" || direction == "end" || direction == "up")
          {
            back = true;
          }
        }

        var dfd = $.Deferred();
        // for now, we assume, position currentPanelItem is 0, 0, and that all views should have same size
        // (fair assumption since the newPanelItem was drawn below the currentPanelItem)
        var newBaseRotate = (back) ? "rotateY(-180deg)" : "rotateY(180deg)";
        if(vertical)
        {
          var height = currentPanelItem.offsetHeight;
          currentPanelItem.style.height = height + "px";
          newPanelItem.style.height = height + "px";
          newBaseRotate = (back) ? "rotateX(-180deg)" : "rotateX(180deg)";
          adf.mf.internal.amx.addCSSClassName(currentPanelItem, "face");
          currentPanelItem.style.webkitTransform = "rotateX(0deg)";
        }
        else // horizontal
        {
          var width = currentPanelItem.offsetWidth;
          currentPanelItem.style.width = width + "px";
          newPanelItem.style.width = width + "px";
          adf.mf.internal.amx.addCSSClassName(currentPanelItem, "face");
          currentPanelItem.style.webkitTransform = "rotateY(0deg)";
        }
        adf.mf.internal.amx.addCSSClassName(newPanelItem, "face");
        newPanelItem.style.webkitTransform = newBaseRotate;
        adf.mf.internal.amx.removeCSSClassName(newPanelItem, "new");
        adf.mf.internal.amx.addCSSClassName(newPanelItem, "showing");

// TODO why; what needs fixing?:
        /// FIXME ///
        var peer = this;
        setTimeout(function()
        {
          var currentDfd = $.Deferred();
          var newDfd = $.Deferred();

          var inner = rootElement.firstChild;
          var content = peer._getChildrenByClassNames(inner, ["amx-panelSplitter_contentContainer"])[0];
          adf.mf.internal.amx.addCSSClassName(content, "transitioning");

          adf.mf.internal.amx.addCSSClassName(currentPanelItem, "transitioning-slow");
          var rotateVal = (back) ? "rotateY(+180deg)" : "rotateY(-180deg)";
          if(vertical)
          {
            rotateVal = (back) ? "rotateX(+180deg)" : "rotateX(-180deg)";
          }

          currentPanelItem.style.webkitTransform = rotateVal;
          $(currentPanelItem).bind("webkitTransitionEnd", function()
          {
            adf.mf.internal.amx.removeCSSClassName(currentPanelItem, "current");
            adf.mf.internal.amx.addCSSClassName(currentPanelItem, "old");
            adf.mf.internal.amx.removeCSSClassName(currentPanelItem, "transitioning-slow");
            adf.mf.internal.amx.removeCSSClassName(currentPanelItem, "face");
            peer._removeAllButThisOrTheOnlyPanelItem(newPanelItem, content);
            currentDfd.resolve();
          });

          adf.mf.internal.amx.addCSSClassName(newPanelItem, "transitioning-slow");
          if (vertical)
          {
            newPanelItem.style.webkitTransform = "rotateX(0deg)";
          }
          else
          {
            newPanelItem.style.webkitTransform = "rotateY(0deg)";
          }
          $(newPanelItem).bind("webkitTransitionEnd", function()
          {
            adf.mf.internal.amx.removeCSSClassName(newPanelItem, "showing");
            adf.mf.internal.amx.addCSSClassName(newPanelItem, "current");
            adf.mf.internal.amx.removeCSSClassName(newPanelItem, "transitioning-slow");
            adf.mf.internal.amx.removeCSSClassName(newPanelItem, "face");
            adf.mf.internal.amx.removeCSSClassName(content, "transitioning");
            newPanelItem.setAttribute("style", "");
            newDfd.resolve();
          });

          $.when(currentDfd, newDfd).done(function()
          {
            dfd.resolve();
            adf.mf.internal.amx.removeCSSClassName(rootElement, "changingSelectedItem");
          });
        }, 1);
        return dfd.promise();
      },

      _getAttribute: function(rawValue, defaultValue)
      {
        if (rawValue == null || rawValue == "")
          return defaultValue;
        if (adf.mf.environment.profile.dtMode && rawValue.charAt(0) == "#")
          return defaultValue;
        return rawValue;
      },

      _getPosition: function(amxNodeSplitter)
      {
        var positionLandscape = this._getAttribute(amxNodeSplitter.getAttribute("position"), "31.25%");
        var positionPortrait = "41.67%"; // TODO we ought to expose an API for this
        return {
          landscape: positionLandscape,
          portrait:  positionPortrait
        };
      },

      _getOrientation: function()
      {
        if (document.body.offsetWidth < document.body.offsetHeight)
        {
          return "portrait";
        }
        return "landscape";
      },

      /**
       * Private function to create the navigation content.
       */
      _createNavigation: function(inLandscape, amxNode, inner, rootElement, position)
      {
        var navLandscape = document.createElement("div");
        navLandscape.className = "amx-panelSplitter_navLandscape amx-scrollable";
        inner.appendChild(navLandscape);
        navLandscape.style.width = position.landscape;

        // Adding WAI-ARIA Role Attribute for the navigation div
        navLandscape.setAttribute("role", "navigation");

        var screenPortrait = document.createElement("div");
        screenPortrait.className = "amx-panelSplitter_screenPortrait";
        inner.appendChild(screenPortrait);
        screenPortrait.style.display = "none";

        var button = document.createElement("div");

        // WAI-ARIA support:
        button.setAttribute("role", "button");
        button.setAttribute("tabindex", "0");
        button.setAttribute("aria-expanded", "false");
        var defaultTitle =
          adf.mf.resource.getInfoString("AMXInfoBundle","amx_panelSplitter_NAVIGATOR_TOGGLE_BUTTON");
        var buttonTitle = this._ensureValidString(
          amxNode.getAttribute("navigatorTitle"),
          defaultTitle); // TODO same title for disclose and undisclose?
        button.setAttribute("title", buttonTitle);

        button.className = "amx-panelSplitter_button";
        inner.appendChild(button);

        // Bind the screenPortrait and the button to the toggle code:
        var data = {"rootElement": rootElement, "amxNode": amxNode, "peer": this};
        $(screenPortrait).tap(data, this._handleNavPortraitToggle);
        $(button).tap(data, this._handleNavPortraitToggle);

        var navPortrait = document.createElement("div");
        var navPortraitId = amxNode.getId() + "::navp";
        navPortrait.setAttribute("id", navPortraitId);
        button.setAttribute("aria-owns", navPortraitId);
        navPortrait.setAttribute("aria-hidden", "true");
        navPortrait.className = "amx-panelSplitter_navPortrait amx-scrollable";
        inner.appendChild(navPortrait);
        navPortrait.style.width = position.portrait;

        // Adding WAI-ARIA Role Attribute for the navigation div
        navPortrait.setAttribute("role", "navigation");

        if (inLandscape)
        {
          navPortrait.style.opacity = "0";
          navPortrait.style.display = "none"; // TODO might need to do animation chaining now
          navPortrait.style.zIndex = "0";
          button.style.display = "none"; // TODO might need to do animation chaining now
        }
        else // in portrait
        {
          navLandscape.style.opacity = "0";
          navLandscape.style.display = "none"; // TODO might need to do animation chaining now
          if (document.documentElement.dir == "rtl")
            navPortrait.style.right = "-" + position.portrait;
          else
            navPortrait.style.left = "-" + position.portrait;
        }

        var initialNavigatorHome = inLandscape ? navLandscape : navPortrait;
        var navigatorChildren = amxNode.getRenderedChildren("navigator"); // TODO make non-jq
        for (var i = 0, size = navigatorChildren.length; i < size; ++i)
        {
          var $subNode = navigatorChildren[i].renderNode(); // TODO make non-jq
          var elem = $subNode.get(0);
          initialNavigatorHome.appendChild(elem);
        }
      },

      _handleNavPortraitToggle: function(event)
      {
        // TODO need to toggle the button label
        // TODO need to toggle the aria-hidden states of the navigator & content
        // TODO need to make sure that swiching orientations also updates both
        try
        {
          event.preventDefault();
          event.stopPropagation();
          var rootElement = event.data.rootElement;
          var peer = event.data.peer;
          var amxNode = event.data.amxNode;
          var position = peer._getPosition(amxNode);
          var inner = rootElement.firstChild;
          var button = peer._getChildrenByClassNames(inner, ["amx-panelSplitter_button"])[0];

          if (adf.mf.internal.amx.getCSSClassNameIndex(button.className, "disclosed") != -1)
          {
            // Animate the undisclosure of the navPortrait
            peer._undiscloseNavPortrait(rootElement, position);
          }
          else // undisclosed
          {
            // Animate the disclosure of the navPortrait
            peer._discloseNavPortrait(rootElement, position);
          }
        }
        catch (problem)
        {
          console.error(problem);
        }
      },

      _discloseNavPortrait: function(rootElement, position)
      {
        // 1. set the display of the screenPortrait to block
        var inner = rootElement.firstChild;
        var foundChildNodes =
          this._getChildrenByClassNames(
            inner,
            [
              "amx-panelSplitter_screenPortrait",
              "amx-panelSplitter_navPortrait",
              "amx-panelSplitter_button",
              "amx-panelSplitter_contentContainer"
            ]);
        var screenPortrait = foundChildNodes[0];
        var navPortrait    = foundChildNodes[1];
        var button         = foundChildNodes[2];
        var content        = foundChildNodes[3];

        if (screenPortrait && navPortrait && button)
        {
          screenPortrait.style.display = "block";

          // 2. set the opacity of amx-panelSplitter_navPortrait to full
          adf.mf.internal.amx.addCSSClassName(navPortrait, "no-animate"); // TODO this doesn't work; might need to do animation chaining now
          navPortrait.style.opacity = "1";
          navPortrait.style.display = "block"; // TODO might need to do animation chaining now
          navPortrait.style.zIndex = "1002";
          adf.mf.internal.amx.removeCSSClassName(navPortrait, "no-animate");

          // 3. set the start side of amx-panelSplitter_navPortrait to be zero
          var isRtl = (document.documentElement.dir == "rtl");
          if (isRtl)
            navPortrait.style.right = "0px";
          else
            navPortrait.style.left = "0px";

          // 4. set the start side of the button to be position.portrait
          if (isRtl)
            button.style.right = position.portrait;
          else
            button.style.left = position.portrait;

          // 5. add the disclosed marker class
          adf.mf.internal.amx.addCSSClassName(button, "disclosed");

          // 6. update for screen readers
          navPortrait.setAttribute("aria-hidden", "false");
          button.setAttribute("aria-expanded", "true");
          content.setAttribute("aria-hidden", "true");
        }
      },

      _undiscloseNavPortrait: function(rootElement, position)
      {
        // 1. set the display of the screenPortrait to none
        var inner = rootElement.firstChild;
        var foundChildNodes =
          this._getChildrenByClassNames(
            inner,
            [
              "amx-panelSplitter_screenPortrait",
              "amx-panelSplitter_navPortrait",
              "amx-panelSplitter_button",
              "amx-panelSplitter_contentContainer"
            ]);
        var screenPortrait = foundChildNodes[0];
        var navPortrait    = foundChildNodes[1];
        var button         = foundChildNodes[2];
        var content        = foundChildNodes[3];

        if (screenPortrait && navPortrait && button)
        {
          screenPortrait.style.display = "none";

          // 2. set the start side of amx-panelSplitter_navPortrait to be -position.portrait
          var isRtl = (document.documentElement.dir == "rtl");
          if (isRtl)
            navPortrait.style.right = "-" + position.portrait;
          else
            navPortrait.style.left = "-" + position.portrait;

          // 3. set the start side of the button to be zero
          if (isRtl)
            button.style.right = "0px";
          else
            button.style.left = "0px";

          // 4. add the disclosed marker class
          adf.mf.internal.amx.removeCSSClassName(button, "disclosed");

          // 5. update for screen readers
          navPortrait.setAttribute("aria-hidden", "true");
          button.setAttribute("aria-expanded", "false");
          content.setAttribute("aria-hidden", "false");
        }
      },

      _ensureValidString: function(rawValue, defaultValue)
      {
        // TODO is there a shared util we can use instead?
        if (rawValue == null)
          return defaultValue;
        return rawValue;
      },

      _handleResize: function(event)
      {
        var rootElement = event.data.rootElement;
        var amxNode     = event.data.amxNode;
        var peer        = event.data.peer;
        var inner       = rootElement.firstChild;
        var foundChildNodes =
          peer._getChildrenByClassNames(
            inner,
            [
              "amx-panelSplitter_navPortrait",
              "amx-panelSplitter_button",
              "amx-panelSplitter_screenPortrait",
              "amx-panelSplitter_navLandscape",
              "amx-panelSplitter_contentContainer"
            ]);
        var navPortrait    = foundChildNodes[0];
        var button         = foundChildNodes[1];
        var screenPortrait = foundChildNodes[2];
        var navLandscape   = foundChildNodes[3];
        var content        = foundChildNodes[4];
        var orientation    = peer._getOrientation();
        var position       = peer._getPosition(amxNode);
        var isRtl          = (document.documentElement.dir == "rtl");

        // Determine if we are going from portrait to landscape or landscape to portrait
        if (navPortrait && button && screenPortrait && navLandscape &&
            rootElement.getAttribute("data-orientation") == "portrait" && orientation == "landscape")
        {
          // -- from portrait to landscape --

          // 1. set the start side of amx-panelSplitter_navPortrait to be -position.portrait
          adf.mf.internal.amx.addCSSClassName(navPortrait, "no-animate"); // TODO this doesn't work; might need to do animation chaining now
          if (isRtl)
            navPortrait.style.right = "-" + position.portrait;
          else
            navPortrait.style.left = "-" + position.portrait;

          // 2. set the opacity of amx-panelSplitter_navPortrait to none
          navPortrait.style.opacity = "0";
          navPortrait.style.display = "none"; // TODO might need to do animation chaining now
          navPortrait.style.zIndex = "0";
          adf.mf.internal.amx.removeCSSClassName(navPortrait, "no-animate");

          // 3. set the start side of the button to be zero
          adf.mf.internal.amx.addCSSClassName(button, "no-animate"); // TODO this doesn't work; might need to do animation chaining now
          if (isRtl)
            button.style.right = "0px";
          else
            button.style.left = "0px";

          // 4. set the opacity of the button to none
          button.style.display = "none"; // TODO might need to do animation chaining now
          adf.mf.internal.amx.removeCSSClassName(button, "no-animate");

          // 5. remove the disclosed class from the button
          adf.mf.internal.amx.removeCSSClassName(button, "disclosed");

          // 6. set the display of the screenPortrait to none
          screenPortrait.style.display = "none";

          // 7. reparent (appendTo) the amx-panelSplitter_navPortrait children to amx-panelSplitter_navLandscape
          $(navPortrait).children().appendTo($(navLandscape)); // TODO make non-jq

          // 8. set the opacity of amx-panelSplitter_navLandscape to full
          navLandscape.style.opacity = "1";
          navLandscape.style.display = "block"; // TODO might need to do animation chaining now

          // 9. set the start side of amx-panelSplitter_contentContainer to be position.landscape
          if (isRtl)
            content.style.right = position.landscape;
          else
            content.style.left = position.landscape;

          // 10. remember our new orientation in a data attribute
          rootElement.setAttribute("data-orientation", "landscape");

          // 11. update the content area's orientation style classes
          adf.mf.internal.amx.removeCSSClassName(content, "amx-portrait");
          adf.mf.internal.amx.addCSSClassName(content, "amx-landscape");

          // 12. update for screen readers
          content.setAttribute("aria-hidden", "false");
        }
        else if (rootElement.getAttribute("data-orientation") == "landscape" && orientation == "portrait")
        {
          // -- from landscape to portrait --

          // 1. set the start side of amx-panelSplitter_navPortrait to be -position.portrait
          if (isRtl)
            navPortrait.style.right = "-" + position.portrait;
          else
            navPortrait.style.left = "-" + position.portrait;
          navPortrait.style.zIndex = "1002";

          // 2. set the start side of the button to be zero
          if (isRtl)
            button.style.right = "0px";
          else
            button.style.left = "0px";

          // 3. set the opacity of amx-panelSplitter_navLandscape to none
          navLandscape.style.opacity = "0";
          navLandscape.style.display = "none"; // TODO might need to do animation chaining now

          // 4. set the opacity of the button to full
          button.style.display = "block"; // TODO might need to do animation chaining now

          // 5. set the start side of amx-panelSplitter_contentContainer to be portrait-start in the CSS file
          if (isRtl)
            content.style.right = ""; // use blank to purge the custom overide if applicable
          else
            content.style.left = ""; // use blank to purge the custom overide if applicable

          // 6. reparent (appendTo) the amx-panelSplitter_navLandscape children to amx-panelSplitter_navPortrait
          $(navLandscape).children().appendTo($(navPortrait)); // TODO

          // 7. remember our new orientation in a data attribute
          rootElement.setAttribute("data-orientation", "portrait");

          // 8. update the content area's orientation style classes
          adf.mf.internal.amx.removeCSSClassName(content, "amx-landscape");
          adf.mf.internal.amx.addCSSClassName(content, "amx-portrait");

          // 9. update for screen readers
          navPortrait.setAttribute("aria-hidden", "true");
          button.setAttribute("aria-expanded", "false");
          content.setAttribute("aria-hidden", "false");
        }
      }
    }
  });

})(jQuery);
