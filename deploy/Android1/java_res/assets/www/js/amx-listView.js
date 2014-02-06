/* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. */
/* ------------------------------------------------------ */
/* ------------------- amx-listView.js ------------------ */
/* ------------------------------------------------------ */

(function()
{
  var amxRenderers =
  {
    listView:
    {
      createChildrenNodes: function(amxNode)
      {
        // See if the listview is bound to a collection
        if (!amxNode.isAttributeDefined("value"))
        {
          // Let the default behavior occur of building the child nodes
          return false;
        }

        var dataItems;
        if (adf.mf.environment.profile.dtMode)
        {
          // If in DT mode, create 3 dummy children so that something is displayed
          // on the page
          dataItems = [ {}, {}, {} ];
          amxNode.setAttributeResolvedValue("value", dataItems);
        }
        else
        {
          dataItems = amxNode.getAttribute("value");
          if (dataItems === undefined)
          {
            // Mark it so the framework knows that the children nodes cannot be
            // created until the collection model has been loaded
            amxNode.setState(adf.mf.api.amx.AmxNodeStates["INITIAL"]);
            return true;
          }
          else if (dataItems == null)
          {
            // No items, nothing to do
            return true;
          }
        }

        var fetchSize = Infinity;
        var maxRows = null;
        var fetchSizeAttribute = amxNode.getAttribute("fetchSize");
        if (fetchSizeAttribute != null &&
          adf.mf.internal.amx.isFiniteNumber(parseInt(fetchSizeAttribute, 10)))
        {
          fetchSize = parseInt(fetchSizeAttribute, 10);
          if (fetchSize < 0)
          {
            fetchSize = Infinity;
          }
          else if (fetchSize == 0)
          {
            fetchSize = 25;
          }
        }
        amxNode.setAttributeResolvedValue("fetchSize", fetchSize);

        // See if there is a stored max rows in the client state
        var clientState = adf.mf.api.amx.getClientState(amxNode.getId());
        if (clientState != null)
        {
          maxRows = clientState.maxRows;
          if (maxRows != null)
          {
            amxNode.setAttributeResolvedValue("maxRows", maxRows);
          }
        }

        if (maxRows == null)
        {
          if (amxNode.isAttributeDefined("maxRows") == false)
          {
            maxRows = fetchSize;
            amxNode.setAttributeResolvedValue("maxRows", fetchSize);
          }
          else
          {
            maxRows = parseInt(amxNode.getAttribute("maxRows"), 10);
            if (isNaN(maxRows))
            {
              maxRows = fetchSize;
              amxNode.setAttributeResolvedValue("maxRows", fetchSize);
            }
          }
        }
        amxNode.setAttributeResolvedValue("_oldMaxRows", maxRows);

        var iter = adf.mf.api.amx.createIterator(dataItems);

        // See if all the rows have been loaded, if not, force the necessary
        // number of rows to load and then build this node's children
        if (iter.getTotalCount() > iter.getAvailableCount() &&
          iter.getAvailableCount() < maxRows)
        {
          adf.mf.api.amx.showLoadingIndicator();
          var currIndex = dataItems.getCurrentIndex();
          adf.mf.api.amx.bulkLoadProviders(dataItems, 0, maxRows,
            function()
            {
              try
              {
                // Call the framework to have the new children nodes constructed.
                var args = new adf.mf.internal.amx.AmxNodeUpdateArguments();
                args.setAffectedAttribute(amxNode, "value");
                adf.mf.internal.amx.markNodeForUpdate(args);
              }
              finally
              {
                adf.mf.api.amx.hideLoadingIndicator();
              }
            },
            function()
            {
              adf.mf.api.adf.logInfoResource("AMXInfoBundle",
                adf.mf.log.level.SEVERE, "createChildrenNodes",
                "MSG_ITERATOR_FIRST_NEXT_ERROR", req, resp);
              adf.mf.api.amx.hideLoadingIndicator();
            });

          amxNode.setState(adf.mf.api.amx.AmxNodeStates["INITIAL"]);
          return true;
        }

        // Create the children for the facets outside of the stamps
        amxNode.createStampedChildren(null, [ "header", "footer" ]);

        // Now create the stamped children
        var variableName = amxNode.getAttribute("var");
        for (var i = 0; i < maxRows && iter.hasNext(); ++i)
        {
          var item = iter.next();
          adf.mf.el.addVariable(variableName, item);
          amxNode.createStampedChildren(iter.getRowKey(), [ null ]);
          adf.mf.el.removeVariable(variableName);
        }

        amxNode.setState(adf.mf.api.amx.AmxNodeStates["ABLE_TO_RENDER"]);
        return true;
      },

      updateChildren: function(amxNode, attributeChanges)
      {
        if (attributeChanges.hasChanged("value"))
        {
          return _updateChildrenForCollectionChange(
            amxNode, attributeChanges,
            adf.mf.api.amx.AmxNodeChangeResult["REFRESH"]);
        }

        var numChanged = attributeChanges.getSize();
        if (numChanged == 1)
        {
          if (attributeChanges.hasChanged("maxRows"))
          {
            var oldMaxRows = amxNode.getAttribute("_oldMaxRows");
            var dataItems = amxNode.getAttribute("value");
            // Set the iterator at the old max rows - 1 (to the last rendered item)
            var iter = adf.mf.api.amx.createIterator(dataItems);
            iter.setCurrentIndex(oldMaxRows - 1);
            var variableName = amxNode.getAttribute("var");
            var maxRows = amxNode.getAttribute("maxRows");
            for (var i = oldMaxRows; i < maxRows && iter.hasNext(); ++i)
            {
              var item = iter.next();
              adf.mf.el.addVariable(variableName, item);
              amxNode.createStampedChildren(iter.getRowKey(), [ null ]);
              adf.mf.el.removeVariable(variableName);
            }

            return adf.mf.api.amx.AmxNodeChangeResult["REFRESH"];
          }
          else if (attributeChanges.hasChanged("editMode"))
          {
            var newEditMode = amxNode.getAttribute("editMode");
            var oldEditMode = attributeChanges.getOldValue("editMode");
            if (newEditMode == oldEditMode)
            {
              return adf.mf.api.amx.AmxNodeChangeResult["NONE"];
            }

            if (amx.isValueTrue(newEditMode))
            {
              return adf.mf.api.amx.AmxNodeChangeResult["REFRESH"];
            }
          }
        }

        return adf.mf.api.amx.AmxNodeChangeResult["RERENDER"];
      },

      visitChildren: function(amxNode, visitContext, callback)
      {
        var dataItems = amxNode.getAttribute("value");
        if (dataItems === undefined)
        {
          // If the children are not being stamped
          return amxNode.visitStampedChildren(null, null, null,
            visitContext, callback);
        }

        // Visit the header and footer first
        if (amxNode.visitStampedChildren(null, [ "header", "footer" ], null,
            visitContext, callback))
        {
          return true;
        }

        // Now visit the stamped children
        var iter = adf.mf.api.amx.createIterator(dataItems);
        var variableName = amxNode.getAttribute("var");

        //TODO: implement an optimized visit if only certain nodes need to be walked
        //var nodesToWalk = visitContext.getChildrenToWalk();

        while (iter.hasNext())
        {
          var item = iter.next();
          adf.mf.el.addVariable(variableName, item);
          try
          {
            if (amxNode.visitStampedChildren(iter.getRowKey(), [ null ], null,
              visitContext, callback))
            {
              return true;
            }
          }
          finally
          {
            adf.mf.el.removeVariable(variableName);
          }
        }

        return false;
      },

      create: function(amxNode)
      {
        var listViewElement = document.createElement("div");

        // Adding WAI-ARIA role of list
        listViewElement.setAttribute("role", "list");

        listViewElement.setAttribute("class", "amx-scrollable");
        var stampedId = amxNode.getId();
        var selectedRowKey = _getSelectedRowKey(stampedId);
        var lastIndexRendered = -1;
        var scrollingAlreadyRestored = false;
        var i;
        var maxRows = amxNode.getAttribute("maxRows");
        var dividerAttrEl = null;

        var dividerAttribute = amxNode.getAttribute("dividerAttribute");
        if (dividerAttribute != null && dividerAttribute != "")
        {
          dividerAttrEl = "#{" + amxNode.getAttribute("var") + "." +
            dividerAttribute + "}";
        }

        this._renderHeaderFacet(amxNode, listViewElement);

        handleTap(listViewElement);

        var dataItems = amxNode.getAttribute("value");
        if (dataItems !== undefined)
        {
          var iter = adf.mf.api.amx.createIterator(dataItems);

          // Structure to allow _renderItem to "pass back" multiple values
          var byRefParams = {
            "currentDividerElement": null
          };

          for (i=0; i<maxRows && iter.hasNext(); ++i)
          {
            var item = iter.next();
            this._renderItem(amxNode, selectedRowKey, iter, listViewElement, item, i, dividerAttrEl, byRefParams);
          }

          // Add or remove the load more rows link after all the data has been loaded
          this._addOrRemoveLoadMoreRowsDom(amxNode, listViewElement, iter.getTotalCount() > maxRows);

          if (byRefParams["currentDividerElement"] && amxNode.getAttribute("showDividerCount"))
          {
            this._displayDividerCount(listViewElement);
          }
          // The edit mode handle has already been added to listItems.
          // Now we just add the editMode class to the listView.
          if (amx.isValueTrue(amxNode.getAttribute("editMode")))
          {
            adf.mf.internal.amx.addCSSClassName(listViewElement, "amx-listView-editMode");
          }
        }
        else
        {
          // If there is no value attribute, just render the children
          var $childrenNodes = amxNode.renderSubNodes();
          var childCount = $childrenNodes.length;
          for (i=0; i<childCount; ++i)
          {
            var childDomNode = $childrenNodes.get(i);

            // Store the row key so it can be used in selection management
            var rowKeyString = ""+i;
            if (selectedRowKey == rowKeyString)
              _markRowAsSelected(childDomNode);
            childDomNode.setAttribute("data-listViewRk", rowKeyString);

            listViewElement.appendChild(childDomNode);
          }
        }

        this._appendFooter(amxNode, listViewElement);

        return listViewElement;
      },

      postDisplay: function(listViewElement, amxNode)
      {
        // Restore the old scroll position in case this view instance already had one:
        this._restoreScrollPosition(amxNode, listViewElement);
      },

      refresh: function(amxNode, attributeChanges)
      {
        var listViewElement = document.getElementById(amxNode.getId());

        // The updateChildren function already checked that we can refresh, so no
        // checks need to be performed here. We need to only check if this is
        // a change to the max rows or the edit mode

        // if only the .editMode property changed, then, we handle it.
        // Note 1: propertesChanged.editMode will be true if the editMode property has changed
        // Note 2: to get the value, make sure to get it from newAmxNode
        if (attributeChanges.hasChanged("value"))
        {
          this._refreshCollectionChanges(amxNode, attributeChanges);
        }
        else if (attributeChanges.hasChanged("editMode"))
        {
          // The updateChildren function already checked that the new edit mode is
          // true, so we do not need to check it here. Just switch to the edit mode
          switchToEditMode(listViewElement);
          return;
        }
        else if (attributeChanges.hasChanged("maxRows"))
        {
          // Store the new client state so that the new maxRows are stored
          this._storeClientState(amxNode, listViewElement);

          // This is the case when the user clicks the load more rows item. At this
          // point only the new rows need to be rendered.
          var lastIndexRendered = amxNode.getAttribute("_lastIndexRendered");
          if (lastIndexRendered == null)
          {
            lastIndexRendered = -1;
          }
          var dataItems = amxNode.getAttribute("value");
          var iter = adf.mf.api.amx.createIterator(dataItems);

          // Position the iterator to before the new row
          if (lastIndexRendered >= 0)
          {
            iter.setCurrentIndex(lastIndexRendered);
          }

          var maxRows = amxNode.getAttribute("maxRows");
          var selectedRowKey = _getSelectedRowKey(amxNode.getId());
          var dividerAttrEl = null;
          var dividerAttribute = amxNode.getAttribute("dividerAttribute");

          if (dividerAttribute != null)
          {
            dividerAttrEl = "#{" + amxNode.getAttribute("var") + "." + dividerAttribute + "}";
          }

          // Get the last divider element rendered:
          var currentDividerElement = null;
          var listViewChildren = listViewElement.childNodes;
          var length = listViewChildren.length
          for (var i=length-1; i>=0; --i)
          {
            var child = listViewChildren[i];
            if (adf.mf.internal.amx.getCSSClassNameIndex(child.className, "amx-listView-divider") != -1)
            {
              currentDividerElement = child;
              break;
            }
          }

          // Get the element for the last list item rendered:
          var lastListItem = null;
          for (var i=length-1; i>=0; --i)
          {
            var child = listViewChildren[i];
            if (adf.mf.internal.amx.getCSSClassNameIndex(child.className, "amx-listItem") != -1 &&
                adf.mf.internal.amx.getCSSClassNameIndex(child.className, "amx-listItem-moreRows") == -1)
            {
              lastListItem = child;
              break;
            }
          }

          // Structure to allow _renderItem to "pass back" multiple values
          var currentDividerElement = currentDividerElement == null ? null : currentDividerElement;
          var lastListItem = lastListItem == null ? null : lastListItem;
          var byRefParams = {
            "currentDividerElement": currentDividerElement,
            "lastListItem": lastListItem
          };

          for (var i = lastIndexRendered + 1; i < maxRows && iter.hasNext(); ++i)
          {
            var item = iter.next();
            this._renderItem(amxNode, selectedRowKey, iter, listViewElement, item, i, dividerAttrEl, byRefParams);
          }

          if (byRefParams["currentDividerElement"] && amxNode.getAttribute("showDividerCount"))
          {
            this._displayDividerCount(listViewElement);
          }

          // Add or remove the load more rows link after all the data has been loaded
          this._addOrRemoveLoadMoreRowsDom(amxNode, listViewElement, iter.getTotalCount() > maxRows);
        }
      },

      preDestroy: function($nodeOrDomNode, amxNode)
      {
        // Temporary shim until jQuery is completely removed:
        var listViewElement;
        if ($nodeOrDomNode.jquery)
          listViewElement = $nodeOrDomNode.get(0);
        else
          listViewElement = $nodeOrDomNode;

        // Store off the current scroll position in case this view instance is ever revisited:
        this._storeClientState(amxNode, listViewElement);
      },

      _refreshCollectionChanges: function(amxNode, attributeChanges)
      {
        var collectionChange = attributeChanges.getCollectionChange("value");
        var updatedKeys = collectionChange.getUpdatedKeys();
        var dataItems = amxNode.getAttribute("value");
        var iter = adf.mf.api.amx.createIterator(dataItems);

        for (var i = 0, size = updatedKeys.length; i < size; ++i)
        {
          var key = updatedKeys[i];
          if (iter.setCurrentRowKey(key))
          {
            var children = amxNode.getChildren(null, key);

            // The updateChildren verified that a child was created, so no need to check here
            var child = children[0];
            child.rerenderNode();
          }
        }
      },

      /**
       * Stores the client state of the list view
       * @param {HTMLElement} listViewElement the JQuery node for the root element of this listView
       * @param {String} stampedId the unique identifier for this listView instance
       */
      _storeClientState: function(amxNode, listViewElement)
      {
        // Store off the current scroll position in case this view instance is ever revisited:
        var scrollLeft = listViewElement.scrollLeft;
        var scrollTop = listViewElement.scrollTop;

        var id = amxNode.getId();

        var storedData = adf.mf.api.amx.getClientState(id);
        if (storedData == null)
        {
          storedData = {};
        }

        if (scrollLeft != null || scrollTop != null)
        {
          storedData.scrollLeft = scrollLeft;
          storedData.scrollTop  = scrollTop;
        }

        storedData.maxRows = amxNode.getAttribute("maxRows");

        adf.mf.api.amx.setClientState(id, storedData);
      },

      _restoreScrollPosition: function(amxNode, listViewElement)
      {
        var storedData = adf.mf.api.amx.getClientState(amxNode.getId());
        if (storedData != null)
        {
          var scrollLeft = storedData.scrollLeft;
          if (scrollLeft != null)
          {
            listViewElement.scrollLeft = scrollLeft;
          }
          var scrollTop = storedData.scrollTop;
          if (scrollTop != null)
          {
            listViewElement.scrollTop = scrollTop;
          }
        }
      },

      _renderItem: function(
        listViewAmxNode,
        selectedRowKey,
        iter,
        listViewElement,
        item,
        i,
        dividerAttrEl,
        byRefParams)
      {
        listViewAmxNode.setAttributeResolvedValue("_lastIndexRendered", i);

        // we set the variable
        var variableName = listViewAmxNode.getAttribute("var");
        adf.mf.el.addVariable(variableName, item);
        var rowKey = iter.getRowKey();
        var rowKeyString = ""+rowKey;

        // MDO - bug 14142428 - ASSUMPTION: _renderItem is only called for non-static listViews ("value" attribute is set)
        // If the assumption becomes invalidated and we end up here while rendering a static listView, then the editMode
        // attribute should not prevent dividers from being rendered.
        if (listViewAmxNode.getAttribute("dividerAttribute") != null && listViewAmxNode.getAttribute("editMode") !== true)
        {
          var currentDivider = this._getCurrentDivider(listViewAmxNode, dividerAttrEl);
          var lastDivider = listViewAmxNode.getAttribute("_lastDivider");
          if (currentDivider != lastDivider)
          {
            byRefParams["currentDividerElement"] =
              this._insertDivider(listViewAmxNode, currentDivider, listViewElement, byRefParams["lastListItem"]);
            byRefParams["lastListItem"] = byRefParams["currentDividerElement"];
            listViewAmxNode.setAttributeResolvedValue("_lastDivider", currentDivider);
          }
        }

        var children = listViewAmxNode.getChildren(null, rowKey);
        for (var i = 0, size = children.length; i < size; ++i)
        {
          var child = children[i];
          var tag = child.getTag();
          if (tag.getNamespace() == "http://xmlns.oracle.com/adf/mf/amx" &&
            tag.getName() == "listItem")
          {
            var $listItem = child.renderNode();
            if ($listItem != null)
            {
              var listItemElement = $listItem.get(0);

              var oldValue = listViewAmxNode.getAttribute("_oldValue");
              var listItemAmxNode = adf.mf.internal.amx._getNonPrimitiveElementData(listItemElement, "amxNode");
              if (oldValue == null && listItemAmxNode != null)
              {
                listViewAmxNode.setAttributeResolvedValue("_oldValue", listItemAmxNode.getStampKey());
              }

              // MDO - bug 14142428 - ASSUMPTION: _renderItem is only called for non-static listViews ("value" attribute is set)
              // If the assumption becomes invalidated and we end up here while rendering a static listView, then the editMode
              // attribute should not prevent dividers from being rendered.
              if (listViewAmxNode.getAttribute("dividerAttribute") != null && listViewAmxNode.getAttribute("editMode") !== true)
              {
                // if the divider is collapsed and we are adding more rows to it,
                // they should also be collapsed/hidden
                var currDividerElem = byRefParams["currentDividerElement"];
                if (currDividerElem != null)
                {
                  var dividerChildren = currDividerElem.childNodes;
                  var dividerUndisclosed = false;
                  for (var c=0, dividerChildrenCount=dividerChildren.length; c<dividerChildrenCount; ++c)
                  {
                    var dividerChild = dividerChildren[c];
                    if (adf.mf.internal.amx.getCSSClassNameIndex(dividerChild.className, "amx-listView-undisclosedIcon") != -1)
                    {
                      dividerUndisclosed = true;
                      break;
                    }
                  }
                  var itemAmxNode = adf.mf.internal.amx._getNonPrimitiveElementData(listItemElement, "amxNode");
                  var storedState = adf.mf.api.amx.getClientState(itemAmxNode.getId());
                  if (storedState == null)
                  {
                    storedState = {};
                  }
                  if (dividerUndisclosed)
                  {
                    listItemElement.style.display = "none";
                    storedState.isHidden = true;
                  }
                  else
                  {
                    listItemElement.style.display = "";
                    storedState.isHidden = false;
                  }
                  adf.mf.api.amx.setClientState(itemAmxNode.getId(), storedState);
                }
              }

              // Since this may be called after the footer and next rows elements have
              // been added to the list view, insert the rows after the last list item
              // if it exists
              this._appendToListView(
                listViewElement,
                listItemElement,
                byRefParams["lastListItem"]);

              byRefParams["lastListItem"] = listItemElement;
            }

            // TODO: this code should create stamps for each amx:listItem child
            // if there are multiple, but right now it is only stamping out the first.
            break;
          }
        }
        adf.mf.el.removeVariable(variableName);
      },

      _displayDividerCount: function(listViewElement)
      {
        var listViewChildren = listViewElement.childNodes;
        for (var i=0, childCount=listViewChildren.length; i<childCount; ++i)
        {
          var child = listViewChildren[i];
          if (adf.mf.internal.amx.getCSSClassNameIndex(child.className, "amx-listView-divider") != -1)
          {
            var dividerCounters = _getChildrenByClassNames(child, ["amx-listView-dividerCounter"]);
            if (dividerCounters.length > 0)
            {
              var dividerCounterTexts = _getChildrenByClassNames(dividerCounters[0], ["amx-listView-dividerCounterText"]);
              if (dividerCounterTexts.length > 0)
              {
                var count = 0;
                var listItem = child.nextSibling;
                var className = listItem.className;
                while (listItem != null && className.indexOf("amx-listItem-moreRows") == -1 && className.indexOf("amx-listItem") != -1 && className.indexOf("amx-listView-divider") == -1)
                {
                  count = count + 1;
                  listItem = listItem.nextSibling;
                  className = listItem != null ? listItem.className : "";
                }
                dividerCounterTexts[0].textContent = count;
              }
            }
          }
        }
      },

      _collapseDividerIfNecessary: function(amxNode, divider, dividerTitle)
      {
        if (amxNode.getAttribute("collapsedDividers"))
        {
          var collapsedDividersArray = amxNode.getAttribute("collapsedDividers");
          if (collapsedDividersArray != null && collapsedDividersArray.indexOf(dividerTitle) != -1)
          {
            var dividerChildren = divider.childNodes;
            for (var i=0, dividerChildCount=dividerChildren.length; i<dividerChildCount; ++i)
            {
              var dividerChild = dividerChildren[i];
              if (adf.mf.internal.amx.getCSSClassNameIndex(dividerChild.className, "amx-listView-disclosedIcon") != -1)
              {
                adf.mf.internal.amx.removeCSSClassName(dividerChild, "amx-listView-disclosedIcon");
                adf.mf.internal.amx.addCSSClassName(dividerChild, "amx-listView-undisclosedIcon");
              }
            }
          }
        }
      },

      _renderHeaderFacet: function(amxNode, listViewElement)
      {
        var headerFacetChildren = amxNode.getRenderedChildren("header");
        if (headerFacetChildren.length)
        {
          var header = document.createElement("div");
          header.className = "amx-listView-header";
          listViewElement.appendChild(header);
          var div = document.createElement("div");
          div.className = "amx-listView-facet-header";
          header.appendChild(div);

          for (var i=0, size=headerFacetChildren.length; i<size; ++i)
          {
            var $child = headerFacetChildren[i].renderNode();
            var child = $child.get(0);
            div.appendChild(child);
          }
        }
      },

      _appendToListView: function(listViewElement, listItemElement, lastListItemElement)
      {
        // Since this may be called after the footer and next rows elements have
        // been added to the list view, insert the rows after the last list item
        // if it exists
        if (lastListItemElement)
        {
          _insertAfter(listViewElement, lastListItemElement, listItemElement);
        }
        else
        {
          listViewElement.appendChild(listItemElement);
        }
      },

      _appendFooter: function(amxNode, listViewElement)
      {
        var footerFacetChildren = amxNode.getRenderedChildren("footer");
        if (footerFacetChildren.length)
        {
          var footer = document.createElement("div");
          footer.className = "amx-listView-footer";
          listViewElement.appendChild(footer);
          var facetFooter = document.createElement("div");
          facetFooter.className = "amx-listView-facet-footer";
          footer.appendChild(facetFooter);

          for (var i=0, size=footerFacetChildren.length; i<size; ++i)
          {
            var $child = footerFacetChildren[i].renderNode();
            var child = $child.get(0);
            facetFooter.appendChild(child);
          }
        }
      },

      _getCurrentDivider: function(amxNode, dividerAttrEl)
      {
        var dividerAttributeValue = adf.mf.el.getLocalValue(dividerAttrEl);
        return (amxNode.getAttribute("dividerMode") === "firstLetter" &&
          dividerAttributeValue != null) ?
          dividerAttributeValue.charAt(0) :
          dividerAttributeValue;
      },

      _insertDivider: function(amxNode, divider, listViewElement, lastListItem)
      {
        var dividerActual = document.createElement("div");
        dividerActual.setAttribute("tabindex", "0");

        // Check for when collapsible dividers and showCount properties are true/false
        if (amx.isValueTrue(amxNode.getAttribute("collapsibleDividers")))
        {
          dividerActual.className = "amx-listView-divider";

          var disclosedIcon = document.createElement("div");
          disclosedIcon.className = "amx-listView-disclosedIcon";
          dividerActual.appendChild(disclosedIcon);

          var dividerText = document.createElement("div");
          dividerText.setAttribute("role", "heading");
          dividerText.className = "amx-listView-dividerText";
          dividerText.textContent = divider;
          dividerActual.appendChild(dividerText);

          if (amx.isValueTrue(amxNode.getAttribute("showDividerCount")))
          {
            var dividerCounterContainer = document.createElement("div");
            dividerCounterContainer.className = "amx-listView-dividerCounter";
            dividerActual.appendChild(dividerCounterContainer);

            var dividerCounterText = document.createElement("div");
            dividerCounterText.className = "amx-listView-dividerCounterText";
            dividerCounterContainer.appendChild(dividerCounterText);
          }
        }
        else
        {
          dividerActual.className = "amx-listView-divider amx-listView-nonCollapsibleDivider";

          var dividerText = document.createElement("div");
          dividerText.setAttribute("role", "heading");
          dividerText.className = "amx-listView-nonCollapsibleDivider amx-listView-dividerText";
          dividerText.textContent = divider;
          dividerActual.appendChild(dividerText);

          if (amx.isValueTrue(amxNode.getAttribute("showDividerCount")))
          {
            var dividerCounterContainer = document.createElement("div");
            dividerCounterContainer.className = "amx-listView-dividerCounter";
            dividerActual.appendChild(dividerCounterContainer);

            var dividerCounterText = document.createElement("div");
            dividerCounterText.className = "amx-listView-dividerCounterText";
            dividerCounterContainer.appendChild(dividerCounterText);
          }
        }

        var items = [];
        adf.mf.internal.amx._setNonPrimitiveElementData(dividerActual, "items", items);
        this._appendToListView(listViewElement, dividerActual, lastListItem);
        if (amx.isValueTrue(amxNode.getAttribute("collapsibleDividers")))
        {
          this._collapseDividerIfNecessary(amxNode, dividerActual, divider);
          $(dividerActual).tap(
            function()
            {
              if (amx.acceptEvent())
              {
                var dividerElement = this;
                var toggleClosure = function()
                {
                  return function()
                  {
                    var listItem = dividerElement.nextSibling;
                    var className = listItem.className;
                    while (listItem != null && className.indexOf("amx-listItem-moreRows") == -1 && className.indexOf("amx-listItem") != -1 && className.indexOf("amx-listView-divider") == -1)
                    {
                      var itemAmxNode = adf.mf.internal.amx._getNonPrimitiveElementData(listItem, "amxNode")
                      var storedState = adf.mf.api.amx.getClientState(itemAmxNode.getId());
                      if (storedState == null)
                      {
                        storedState = {};
                      }
                      if (listItem.style.display == "none")
                      {
                        listItem.style.display = "";
                        storedState.isHidden = false;
                      }
                      else
                      {
                        listItem.style.display = "none";
                        storedState.isHidden = true;
                      }
                      adf.mf.api.amx.setClientState(itemAmxNode.getId(), storedState);
                      listItem = listItem.nextSibling;
                      className = listItem != null ? listItem.className : "";
                    }
                  };
                };

                // MDO: bug 14114778 - the browser doesn't always redraw when we simply toggle the "display"
                // property so we do the toggle from the timeout.  That seems to fix the issue.
                setTimeout(toggleClosure());

                var divActualChildren = dividerElement.childNodes;
                for (var i=0, divActualChildrenCount=divActualChildren.length; i<divActualChildrenCount; ++i)
                {
                  var divActualChild = divActualChildren[i];
                  var className = divActualChild.className;
                  if (adf.mf.internal.amx.getCSSClassNameIndex(className, "amx-listView-disclosedIcon") != -1)
                  {
                    // Found a disclosedIcon, make it undisclosed:
                    adf.mf.internal.amx.removeCSSClassName(divActualChild, "amx-listView-disclosedIcon");
                    adf.mf.internal.amx.addCSSClassName(divActualChild, "amx-listView-undisclosedIcon");
                  }
                  else if (adf.mf.internal.amx.getCSSClassNameIndex(className, "amx-listView-undisclosedIcon") != -1)
                  {
                    // Found an undisclosedIcon, make it disclosed:
                    adf.mf.internal.amx.removeCSSClassName(divActualChild, "amx-listView-undisclosedIcon");
                    adf.mf.internal.amx.addCSSClassName(divActualChild, "amx-listView-disclosedIcon");
                  }
                }
              }
            });
        }
        return dividerActual;
      },

      /**
       * Creates the load more rows item in the list for the user to be
       * able to load the next block of rows.
       */
      _createAndAppendTheMoreRowsDom: function(amxNode, listViewElement)
      {
        var moreRowsElem = document.createElement("div");
        moreRowsElem.setAttribute("role", "button");
        moreRowsElem.setAttribute("tabindex", "0");
        moreRowsElem.className = "amx-listItem amx-listItem-moreRows";

        var loadMoreRowsString = adf.mf.resource.getInfoString(
          "AMXInfoBundle", "amx_listView_MSG_LOAD_MORE_ROWS");

        var span = document.createElement("span");
        span.appendChild(document.createTextNode(loadMoreRowsString));
        span.className = "amx-outputText";
        moreRowsElem.appendChild(span);
        listViewElement.appendChild(moreRowsElem);

        $(moreRowsElem).tap(
          function()
          {
            var typeHandler = amxNode.getTypeHandler();
            typeHandler._handleMoreRowsAction(amxNode);
          });
      },

      /**
       * Adds or removes the DOM for the user to be able to load more rows.
       * @param {bool} moreRows true if there are more rows that can be loaded
       */
      _addOrRemoveLoadMoreRowsDom: function(amxNode, listViewElement, moreRows)
      {
        var moreRowsElement = _getChildrenByClassNames(listViewElement, ["amx-listItem-moreRows"])[0];
        if (moreRows && moreRowsElement == null)
        {
          // There are more rows that can be loaded, but we have not yet added
          // the DOM to have the user load the rows
          this._createAndAppendTheMoreRowsDom(amxNode, listViewElement);
        }
        else if (!moreRows && moreRowsElement != null)
        {
          // There are no more rows (neither locally or ones that need fetching),
          // but the more rows DOM is still present, so we need to remove it
          // including all jQ event listeners and data:
          $(moreRowsElement).remove();
        }
      },

      _handleMoreRowsAction: function(amxNode)
      {
        var quantityToLoad = amxNode.getAttribute("fetchSize");
        var maxRows = amxNode.getAttribute("maxRows");
        var currentRows = maxRows;

        adf.mf.api.amx.showLoadingIndicator();
        // First update the maximum number of rows to show if applicable
        if (maxRows != Infinity && quantityToLoad > 0)
        {
          amxNode.setAttributeResolvedValue("_oldMaxRows", currentRows);
          maxRows = maxRows + quantityToLoad;
          amxNode.setAttributeResolvedValue("maxRows", maxRows);

          var dataItems = amxNode.getAttribute("value");
          var iter = adf.mf.api.amx.createIterator(dataItems);

          // See if the cache actually has the needed rows, if not then we should
          // force the new rows to load into the cache before attempting to rerender
          if (iter.getTotalCount() > iter.getAvailableCount() &&
            iter.getAvailableCount() < maxRows)
          {
            adf.mf.api.amx.bulkLoadProviders(dataItems, currentRows, maxRows,
              function()
              {
                try
                {
                  // Call the framework to have the new children nodes constructed and
                  // use the maxRows attribute as the changed attribute so that the refresh
                  // function knows to only render the new rows.
                  var args = new adf.mf.internal.amx.AmxNodeUpdateArguments();
                  args.setAffectedAttribute(amxNode, "maxRows");
                  adf.mf.internal.amx.markNodeForUpdate(args);
                }
                finally
                {
                  adf.mf.api.amx.hideLoadingIndicator();
                }
              },
              function()
              {
                adf.mf.api.adf.logInfoResource("AMXInfoBundle",
                  adf.mf.log.level.SEVERE, "_handleMoreRowsAction",
                  "MSG_ITERATOR_FIRST_NEXT_ERROR", req, resp);
                adf.mf.api.amx.hideLoadingIndicator();
              });
          }
          else // The rows are actually in the cache
          {
            // Notify the framework so that the new children nodes are created
            // and we are called back with the refresh method. We record that the
            // changed attribute is the generated maxRows attribute so that the
            // refresh function knows to only render the new rows and not rerender
            // the entire list view
            var args = new adf.mf.internal.amx.AmxNodeUpdateArguments();
            args.setAffectedAttribute(amxNode, "maxRows");
            adf.mf.internal.amx.markNodeForUpdate(args);
            adf.mf.api.amx.hideLoadingIndicator();
          }
        }
      }
    },

    listItem: function(amxNode)
    {
      var listItemElement = document.createElement("div");
      listItemElement.setAttribute("tabindex", "0");
      var caretShown;

      if (amx.isValueFalse(amxNode.getAttribute("showLinkIcon")))
        caretShown = false;
      else
        caretShown = true;

      if (caretShown)
      {
        // If item is a button, add WAI-ARIA roles of listitem and button, note that voiceover only
        // announces item as a button if "button" is first in the role string.
        listItemElement.setAttribute("role", "button listitem");

        var caret = document.createElement("div");
        caret.className = "amx-listItem-caret";
        listItemElement.appendChild(caret);
      }
      else
      {
        // If not a link, just add WAI-ARIA role of listitem
        listItemElement.setAttribute("role", "listitem");

        listItemElement.className = "amx-listItem-noCaret";
      }
      var $subNodes = amxNode.renderSubNodes();
      for (var i=0, size=$subNodes.length; i<size; ++i)
      {
        var elem = $subNodes.get(i);
        listItemElement.appendChild(elem);
      }

      var $listItem = $(listItemElement);
      amx.enableSwipe($listItem);
      amx.enableTapHold($listItem);

      var selectedRowKey = _getSelectedRowKey(amxNode.getParent().getId());
      if (selectedRowKey !== null && selectedRowKey == amxNode.getStampKey())
      {
        _markRowAsSelected(listItemElement);
      }
      listItemElement.setAttribute("data-listViewRk", amxNode.getStampKey());
      var storedState = adf.mf.api.amx.getClientState(amxNode.getId());
      if (storedState != null && storedState.isHidden == true)
      {
        listItemElement.style.display = "none";
      }

      var parentAmxNode = amxNode.getParent();
      if (parentAmxNode.getAttribute("value") !== undefined && amx.isValueTrue(parentAmxNode.getAttribute("editMode")))
      {
        var handle = document.createElement("div");
        handle.className = "amx-listItem-handle";
        listItemElement.appendChild(handle);
        handleMove(listItemElement);
      }

      return listItemElement;
    },

    iterator:
    {
      createChildrenNodes: function(amxNode)
      {
        // See if the listview is bound to a collection
        if (!amxNode.isAttributeDefined("value"))
        {
          // Let the default behavior occur of building the child nodes
          return false;
        }

        var dataItems;
        if (adf.mf.environment.profile.dtMode)
        {
          // If in DT mode, create 3 dummy children so that something is
          // displayed in the preview:
          dataItems = [ {}, {}, {} ];
          amxNode.setAttributeResolvedValue("value", dataItems);
        }
        else
        {
          dataItems = amxNode.getAttribute("value");
          if (dataItems === undefined)
          {
            // Mark it so the framework knows that the children nodes cannot be
            // created until the collection model has been loaded
            amxNode.setState(adf.mf.api.amx.AmxNodeStates["INITIAL"]);
            return true;
          }
          else if (dataItems == null)
          {
            // No items, nothing to do
            return true;
          }
        }

        var iter = adf.mf.api.amx.createIterator(dataItems);

        // See if all the rows have been loaded
        if (iter.getTotalCount() > iter.getAvailableCount())
        {
          adf.mf.api.amx.showLoadingIndicator();
          adf.mf.api.amx.bulkLoadProviders(dataItems, 0, -1,
            function()
            {
              // Ensure that the EL context is correct while rendering:
              try
              {
                var args = new adf.mf.internal.amx.AmxNodeUpdateArguments();
                args.setAffectedAttribute(amxNode, "value");
                adf.mf.internal.amx.markNodeForUpdate(args);
              }
              finally
              {
                adf.mf.api.amx.hideLoadingIndicator();
              }
            },
            function(req, resp)
            {
              adf.mf.log.logInfoResource("AMXInfoBundle",
                adf.mf.log.level.SEVERE, "createChildrenNodes",
                "MSG_ITERATOR_FIRST_NEXT_ERROR", req, resp);
              adf.mf.api.amx.hideLoadingIndicator();
            });

          amxNode.setState(adf.mf.api.amx.AmxNodeStates["INITIAL"]);
          return true;
        }

        var variableName = amxNode.getAttribute("var");
        while (iter.hasNext())
        {
          var item = iter.next();
          adf.mf.el.addVariable(variableName, item);
          // Create the stamped children for the non-facet children (null array item)
          amxNode.createStampedChildren(iter.getRowKey(), [ null ]);
          adf.mf.el.removeVariable(variableName);
        }

        amxNode.setState(adf.mf.api.amx.AmxNodeStates["ABLE_TO_RENDER"]);
        return true;
      },

      updateChildren: function(amxNode, attributeChanges)
      {
        if (attributeChanges.hasChanged("value"))
        {
          return _updateChildrenForCollectionChange(
            amxNode, attributeChanges,
            adf.mf.api.amx.AmxNodeChangeResult["RERENDER"]);
        }

        return adf.mf.api.amx.AmxNodeChangeResult["REFRESH"];
      },

      visitChildren: function(amxNode, visitContext, callback)
      {
        var dataItems    = amxNode.getAttribute("value");
        var iter         = adf.mf.api.amx.createIterator(dataItems);
        var variableName = amxNode.getAttribute("var");

        this._createMap(visitContext);
        //TODO: implement an optimized visit if only certain nodes need to be walked
        //var nodesToWalk = visitContext.getChildrenToWalk();
        while (iter.hasNext())
        {
          var item = iter.next();
          adf.mf.el.addVariable(variableName, item);
          try
          {
            this._pushMapItem(visitContext, iter, variableName, amxNode.getTag().getAttribute("value"));
            if (amxNode.visitStampedChildren(iter.getRowKey(), [ null ], null, visitContext, callback))
            {
              return true;
            }
          }
          finally
          {
            adf.mf.el.removeVariable(variableName);
            this._popMapItem(visitContext);
          }
        }

        return false;
      },

      isFlattenable: function(amxNode)
      {
        return true;
      },
 
      _createMap: function(visitContext)
      {
        // If there is no map array created then we have to create it now. This only needs to be done once.
        // Really want this code to be part of addVariable for us.
        if (visitContext._map == undefined) 
        {
          visitContext._map = [];
        }
      },
      
      _pushMapItem: function(visitContext, iter, variableName, varEL)
      {
        varEL = varEL.trim().replace(/^#{/,"").replace(/}$/,"");
        var x = {};
        if (iter.isTreeNodeIterator())
 {
 //       x[variableName] = varEL;
 //
 } else {
 x[variableName] = varEL + "['" + iter.getRowKey() + "']";
 }
        visitContext._map.unshift(x);
      },
      
      _popMapItem: function(visitContext)
      {
        visitContext._map.shift();
      }
    }
  }; // /var amxRenderers

 
  /**
   * Function used by the listView and iterator to process the updateChildren response to collection
   * model changes
   * @param {adf.mf.api.amx.AmxNode} amxNode the AMX node that has been updated
   * @param {adf.mf.api.amx.AmxAttributeChange} attributeChanges the information regarding what attributes
   *        were changed and how they changed
   * @param {int} successfulReturnValue if the function is able to update the AMX node children, what the
   *        return value should be. For the list view, it will be REFRESH, for iterator it will be
   *        RERENDER (the iterator is flattened so it cannot re-render the changes itself).
   * @return {int} either the successful return value or REPLACE if the function could not apply the updates
   *         to the AMX node hierarchy
   */
  function _updateChildrenForCollectionChange(amxNode, attributeChanges, successfulReturnValue)
  {
    // See if there are itemize changes that can be handled. Currently we only support updates to the
    // providers and do not consume created or deleted providers.
    var collectionChange = attributeChanges.getCollectionChange("value");
    if (collectionChange != null &&
      collectionChange.isItemized() &&
      collectionChange.getCreatedKeys().length == 0 &&
      collectionChange.getDeletedKeys().length == 0 &&
      collectionChange.getDirtiedKeys().length == 0 &&
      collectionChange.getUpdatedKeys().length > 0)
    {
      var dataItems = amxNode.getAttribute("value");
      var iter = adf.mf.api.amx.createIterator(dataItems);
      var updatedKeys = collectionChange.getUpdatedKeys();
      var numberToFind = updatedKeys.length;

      for (var i = 0; i < numberToFind; ++i)
      {
        // Get the key
        var key = updatedKeys[i];
        if (iter.setCurrentRowKey(key))
        {
          var children = amxNode.getChildren(null, key);
          if (children.length != 1)
          {
            // We will only update list items that were rendered and the list view
            // only supports rendering one item per row key.
            return adf.mf.api.amx.AmxNodeChangeResult["REPLACE"];
          }

          var oldAmxNode = children[0];

          // Remove the old list item:
          amxNode.removeChild(oldAmxNode);

          // Create the new list item:
          amxNode.createStampedChildren(key, [ null ]);

          // Ensure a child was created
          if (amxNode.getChildren(null, key).length != 1)
          {
            return adf.mf.api.amx.AmxNodeChangeResult["REPLACE"];
          }
        }
        else
        {
          return adf.mf.api.amx.AmxNodeChangeResult["REPLACE"];
        }
      }
      return successfulReturnValue;
    }
    return adf.mf.api.amx.AmxNodeChangeResult["REPLACE"];
  }

  /**
   * Stores the rowKey of the selected list item.
   * @param {String} stampedId the unique identifier for this listView instance
   * @param {String} selectedRowKey null or the rowKey
   */
  function _storeSelectedRowKey(stampedId, selectedRowKey)
  {
    var storedData = adf.mf.api.amx.getVolatileState(stampedId);
    if (storedData == null)
    {
      storedData = {};
    }
    storedData.selectedRowKey = selectedRowKey;
    adf.mf.api.amx.setVolatileState(stampedId, storedData);
  }

  /**
   * Retrieves null or the rowKey of the selected list item.
   * @param {String} stampedId the unique identifier for this listView instance
   * @return {String} null or the rowKey
   */
  function _getSelectedRowKey(stampedId)
  {
    var storedData = adf.mf.api.amx.getVolatileState(stampedId);
    if (storedData != null)
    {
      return storedData.selectedRowKey;
    }
    return null;
  }

  /**
   * Adds the marker class to the specified listItem element to make it selected.
   * @param {Object} listItemElement the list item element that should be selected
   */
  function _markRowAsSelected(listItemElement)
  {
    adf.mf.internal.amx.addCSSClassName(listItemElement, "amx-listItem-selected");
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

  function handleTap(listViewElement)
  {
    $(listViewElement).tap(".amx-listItem", function()
    {
      var tappedListItemElement = this;
      if (adf.mf.internal.amx.getCSSClassNameIndex(listViewElement.className, "amx-listView-editMode") == -1 &&
          adf.mf.internal.amx.getCSSClassNameIndex(tappedListItemElement.className, "amx-listItem-moreRows") == -1)
      {
        // Removed the old selected state (max 1 item should be selected at a time).
        // In the future we could consider an option to allow multiple selection.
        var oldSelection = _getChildrenByClassNames(listViewElement, ["amx-listItem-selected"])[0];
        if (oldSelection != null)
          adf.mf.internal.amx.removeCSSClassName(oldSelection, "amx-listItem-selected");

        // Added a new style for the listItem that is tapped
        _markRowAsSelected(tappedListItemElement);
        var newSelectedRowKey = tappedListItemElement.getAttribute("data-listViewRk");
        var stampedId = listViewElement.getAttribute("id");
        _storeSelectedRowKey(stampedId, newSelectedRowKey);

        var listItemAmxNode = adf.mf.internal.amx._getNonPrimitiveElementData(tappedListItemElement, "amxNode");
        // perform the tap only if the editMode is undefined or false
        var listViewAmxNode = adf.mf.internal.amx._getNonPrimitiveElementData(listViewElement, "amxNode");
        if (!amx.isValueTrue(listViewAmxNode.getAttribute("editMode")))
        {
          amx.validate(tappedListItemElement).done(function()
          {
            if (amx.acceptEvent())
            {
              var event = new amx.ActionEvent();
              amx.processAmxEvent(listItemAmxNode, "action", undefined, undefined, event).always(function()
              {
                var action = listItemAmxNode.getTag().getAttribute("action");
                if (action != null)
                {
                  adf.mf.api.amx.doNavigation(action);
                }
              });
            }
          });
        }
      }

      // The following used to be part of a secondary, separate tap listener for the same handler as above.
      // =-= We need to consider whether it needs to be integrated into the above code instead (e.g. edit mode? more rows?).
      if (amx.acceptEvent())
      {
        var newValue = undefined;
        var amxNode = adf.mf.internal.amx._getNonPrimitiveElementData(tappedListItemElement, "amxNode");
        if (amxNode != null)
        {
          newValue = amxNode.getStampKey();
        }
        var listViewAmxNode = adf.mf.internal.amx._getNonPrimitiveElementData(listViewElement, "amxNode");
        var oldValue = listViewAmxNode.getAttribute("_oldValue");
        var se = new amx.SelectionEvent(oldValue);
        amx.processAmxEvent(listViewAmxNode, "selection", undefined, undefined, se);
        listViewAmxNode.setAttributeResolvedValue("_oldValue", newValue);
      }
    });
  }

  function handleMove(listItemElement)
  {
    var moveEvent = amx.hasTouch() ? "touchmove" : "mousemove";
    var dropSpaceElement = null;
    var rowKeyMoved;
    var rowKeyInsertedBefore;
    var listItemOffsetHeight;
    var maximumDragTop;
    var listItemHandleElement = _getChildrenByClassNames(listItemElement, ["amx-listItem-handle"])[0];
    if (listItemHandleElement != null)
    {
      $(listItemHandleElement).drag(
      {
        start: function(event, dragExtra)
        {
          window.androidHackForListViewReorder = true;
          rowKeyMoved = undefined;
          rowKeyInsertedBefore = undefined;
          listItemOffsetHeight = listItemElement.offsetHeight;
          maximumDragTop = listItemElement.parentNode.scrollHeight + 1 + listItemOffsetHeight/2;
          var amxNode = adf.mf.internal.amx._getNonPrimitiveElementData(listItemElement, "amxNode");
          if (amxNode != null)
          {
            rowKeyMoved = amxNode.getStampKey();
          }
          adf.mf.internal.amx.addCSSClassName(listItemElement, "move");
          dropSpaceElement = document.createElement("div");
          dropSpaceElement.className = "amx-listItem amx-listItem-drop-spacer";
          _insertAfter(listItemElement.parentNode, listItemElement, dropSpaceElement);
        },

        drag: function(event, dragExtra)
        {
          event.preventDefault();
          event.stopPropagation();
          //since "drag" is a meta-event and we are consuming it, we also need to indicate to the parent
          //event handler to consume the "source" event as well
          dragExtra.preventDefault = true;
          dragExtra.stopPropagation = true;
          var listItemElementTop = adf.mf.internal.amx.getElementTop(listItemElement);
          var eventPageY = dragExtra.pageY;
          var top = listItemElementTop + dragExtra.deltaPageY;
          var listViewElement = listItemElement.parentNode;
          var parentOffsetTop = adf.mf.internal.amx.getElementTop(listViewElement);
          if (top < parentOffsetTop)
          {
            top = parentOffsetTop;
          }

          //scroll view
          if (top <= parentOffsetTop + 5)
          {
            listViewElement.setAttribute("data-stop", false);
            scrollView(listViewElement, -1);
          }
          else if (top + listItemOffsetHeight >= parentOffsetTop + listViewElement.offsetHeight - 5)
          {
            listViewElement.setAttribute("data-stop", false);
            scrollView(listViewElement, 1);
          }
          else
          {
            listViewElement.setAttribute("data-stop", true);
          }

          // Reposition the dragged element but don't let it go on forever past the last item in the list:
          var halfItemHeight = listItemOffsetHeight/2;
          var currentDragTop = eventPageY - halfItemHeight - parentOffsetTop + listViewElement.scrollTop;
          var newListItemTop = Math.min(maximumDragTop, currentDragTop);
          listItemElement.style.top = newListItemTop + "px";

          if (adf.mf.internal.amx.getCSSClassNameIndex(parent.className, "notSelect") == -1)
          {
            adf.mf.internal.amx.addCSSClassName(listViewElement, "notSelect");
          }

          // Move around the drop space element:
          var listViewChildren = listViewElement.childNodes;
          var siblingItems = [];
          for (var i=0, childCount=listViewChildren.length; i<childCount; ++i)
          {
            var listViewChild = listViewChildren[i];
            var childClassName = listViewChild.className;
            if (adf.mf.internal.amx.getCSSClassNameIndex(childClassName, "amx-listItem") != -1 &&
                adf.mf.internal.amx.getCSSClassNameIndex(childClassName, "amx-listItem-drop-spacer") == -1 &&
                adf.mf.internal.amx.getCSSClassNameIndex(childClassName, "move") == -1 &&
                adf.mf.internal.amx.getCSSClassNameIndex(childClassName, "amx-listItem-moreRows") == -1)
            {
              siblingItems.push(listViewChild);
            }
          }
          for (var i=0, siblingCount=siblingItems.length; i<siblingCount; ++i)
          {
            var siblingItemElement = siblingItems[i];
            var siblingItemOffsetTop = siblingItemElement.offsetTop;
            var siblingItemOffsetHeight = siblingItemElement.offsetHeight;
            var draggedItemOffsetTop = listItemElement.offsetTop + halfItemHeight;
            if (siblingItemOffsetTop <= draggedItemOffsetTop &&
                draggedItemOffsetTop <= siblingItemOffsetTop + siblingItemOffsetHeight)
            {
              if (draggedItemOffsetTop <= siblingItemOffsetTop + siblingItemOffsetHeight/2)
              {
                listViewElement.insertBefore(dropSpaceElement, siblingItemElement);
              }
              else
              {
                _insertAfter(listViewElement, siblingItemElement, dropSpaceElement);
              }
              break;
            }
          }
        },

        end: function(event, dragExtra)
        {
          var cloneElement = listItemElement.cloneNode(true);
          var listViewElement = listItemElement.parentNode;
          listViewElement.appendChild(cloneElement);
          listItemElement.style.display = "none";
          var nextRowElement = dropSpaceElement.nextSibling;
          if (nextRowElement != null)
          {
            var nextRowAmxNode = adf.mf.internal.amx._getNonPrimitiveElementData(nextRowElement, "amxNode");
            if (nextRowAmxNode != null)
            {
              rowKeyInsertedBefore = nextRowAmxNode.getStampKey();
            }
          }
          var $clone = $(cloneElement);
          $clone.animate( { "opacity": 0, "height": 0 },
            function()
            {
              $clone.remove();
              _insertAfter(listViewElement, dropSpaceElement, listItemElement);
              listItemElement.style.display = "";
              adf.mf.internal.amx.removeCSSClassName(listItemElement, "move");
              listItemElement.style.top = "";
            });
          $(dropSpaceElement).animate({ "height": 32 },
            function()
            {
              $(dropSpaceElement).remove();
            });
          adf.mf.internal.amx.removeCSSClassName(listViewElement, "notSelect");
          listViewElement.setAttribute("data-stop", true);
          if (typeof rowKeyMoved !== "undefined")
          {
            var moveEvent = new adf.mf.internal.amx.MoveEvent(rowKeyMoved, rowKeyInsertedBefore);
            var listView = findListViewAncestor(listItemElement);
            if (listView != null)
            {
              var amxNode = adf.mf.internal.amx._getNonPrimitiveElementData(listView, "amxNode");
              amx.processAmxEvent(amxNode, "move", undefined, undefined, moveEvent);
            }
          }
          window.androidHackForListViewReorder = null;
        }
      });
    }
  }

  /**
   * Locates the first listView parent for the given node.
   * @param {HTMLElement} element some element whose nearest listView ancestor we are seeking
   * @return {HTMLElement} the nearest listView ancestor if there is one, undefined otherwise
   */
  function findListViewAncestor(element)
  {
    if (typeof element !== undefined)
    {
      var parentElement = element.parentNode;
      while (parentElement != null)
      {
        var parentClass = parentElement.className;
        if (adf.mf.internal.amx.getCSSClassNameIndex(parentClass, "amx-listView") != -1)
        {
          return parentElement;
        }
        parentElement = parentElement.parentNode;
      }
    }
  }

  function switchToEditMode(listViewElement)
  {
    // MDO - bug 14033329: ignore editMode when listView is static
    var amxNode = adf.mf.internal.amx._getNonPrimitiveElementData(listViewElement, "amxNode");
    if (amxNode == null || amxNode.getAttribute("value") === undefined)
    {
      return;
    }
    // Now in edit mode:
    adf.mf.internal.amx.addCSSClassName(listViewElement, "amx-listView-editMode");

    // Add the draggable handle nodes:
    var children = listViewElement.childNodes; // get the 1st-level children (e.g. listItems but could be others)
    for (var i=0, childCount=children.length; i<childCount; ++i)
    {
      var child = children[i];
      var childClassName = child.className;
      if (adf.mf.internal.amx.getCSSClassNameIndex(childClassName, "amx-listItem") != -1 &&
          adf.mf.internal.amx.getCSSClassNameIndex(childClassName, "amx-listItem-moreRows") == -1)
      {
        // child is a listItem
        var handle = document.createElement("div");
        handle.className = "amx-listItem-handle";
        child.appendChild(handle);
        handleMove(child);
      }
      else if (adf.mf.internal.amx.getCSSClassNameIndex(childClassName, "amx-listView-divider") != -1)
      {
        $(child).remove();
        --i;
      }
    }
  }

  function switchToNormalMode(listViewElement)
  {
    // MDO - bug 14033329: ignore editMode when listView is static
    var amxNode = adf.mf.internal.amx._getNonPrimitiveElementData(listViewElement, "amxNode");
    if (amxNode == null || amxNode.getAttribute("value") === undefined)
    {
      return;
    }
    // No longer in edit mode:
    adf.mf.internal.amx.removeCSSClassName(listViewElement, "amx-listView-editMode");

    // Remove the draggable handle nodes:
    var children = listViewElement.childNodes; // get the 1st-level children (e.g. listItems but could be others)
    for (var i=0, childCount=children.length; i<childCount; ++i)
    {
      var child = children[i];
      var childClassName = child.className;
      if (adf.mf.internal.amx.getCSSClassNameIndex(childClassName, "amx-listItem") != -1 &&
          adf.mf.internal.amx.getCSSClassNameIndex(childClassName, "amx-listItem-moreRows") == -1)
      {
        // child is a listItem
        var grandChildren = child.childNodes;
        for (var j=grandChildren.length-1; j>=0; --j) // must go in reverse order because we are removing items
        {
          var grandChild = grandChildren[j];
          if (adf.mf.internal.amx.getCSSClassNameIndex(grandChild.className, "amx-listItem-handle") != -1)
          {
            // grandChild is a move handle
            $(grandChild).remove(); // still using jq here because we stil use JQ events
          }
        }
      }
    }
  }

  function scrollView(scrollableElement, direction)
  {
    direction = direction == 1 ? 1 : -1;
    var stop = amx.isValueTrue(scrollableElement.getAttribute("data-stop"));
    scrollableElement.scrollTop = scrollableElement.scrollTop + (direction * 5);
    if (!stop)
    {
      setTimeout(
        function()
        {
          scrollView(scrollableElement, direction);
        },
        300);
    }
  }

  function _insertAfter(parentElement, referenceChild, childToInsert)
  {
    var nodeAfterInsert = referenceChild.nextSibling;
    if (nodeAfterInsert == null)
    {
      parentElement.appendChild(childToInsert);
    }
    else
    {
      parentElement.insertBefore(childToInsert, nodeAfterInsert);
    }
  }

  // add this renderer
  amx.registerRenderers("amx",amxRenderers);
})();

