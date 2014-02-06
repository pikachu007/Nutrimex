/* Copyright (c) 2005, 2012, Oracle and/or its affiliates. All rights reserved. */
/* ---------------------------------------------------------------------------- */
/* These are the renderers for the amx carousel and carouselItem tags.          */
/* ...plus supporting utilities that make it work in WebKit browsers.           */
/* ---------------------------------------------------------------------------- */

(function($)
{

amx.registerRenderers("amx",
{
  /* ---------------------------------------------------------------------------- */
  /* carouselItem Renderer                                                        */
  /* ---------------------------------------------------------------------------- */

  carouselItem:
  {
    /**
     * AMX Create Handler.
     * @param amxNode the amxNode
     * @return the jquery node for this element
     */
    create: function(amxNode)
    {
      // Make "this" stack trace friendly:
      AmxRcfObject.initClass(this, "ImplicitAmxCarouselItemRenderer");

      var text = _ensureValidString(amxNode.getAttribute("text"), "");
      var shortDesc = _ensureValidString(amxNode.getAttribute("shortDesc"), "");
      var carouselItem = document.createElement("div");
      carouselItem.className = "amx-carouselItem";
      carouselItem.setAttribute("title", shortDesc);
      carouselItem.setAttribute("data-amxText", text);

      // Screen reading note for iOS:
      // There does not appear to be any way to tie this carouselItem to the
      // item text heading of the carousel nor have it also announce the shortDesc.
      // It is unclear whether this is even needed.
      // TODO carouselItem.setAttribute("role", "section");
      // TODO carouselItem.setAttribute("aria-label", shortDesc);

      $(carouselItem).append(amxNode.renderSubNodes()); // TODO remove jQuery on this
      return carouselItem;
    },

    /**
     * AMX Init Handler.
     * @param carouselItemElement the carouselItem DOM node
     * @param amxNode the amxNode
     */
    init: function(carouselItemElement, amxNode)
    {
      var firstChild = carouselItemElement.firstChild;

      // Force the first and only child to be stretched:
      if (firstChild && firstChild.nodeType == 1 && carouselItemElement.childNodes.length == 1)
      {
        // Only elements have styles:
        var firstChildStyle = firstChild.style;
        if (firstChild.tagName == "IMG" || firstChild.tagName == "IFRAME")
        {
          firstChildStyle.width = "100%";
          firstChildStyle.height = "100%";
        }
        else if (firstChild.tagName == "A")
        {
          // begin hack to fix amx:commandLink not working in an amx:iterator or amx:carousel:
          if (firstChild.getAttribute("href") == "")
          {
            // by injecting an href, the commandLink will no longer reload the current page when clicked
            firstChild.href="javascript:;";
          }
          // end hack
          firstChildStyle.width = "100%";
          firstChildStyle.height = "100%";
          var firstGrandchild = firstChild.firstChild;

          // If the first and only child is a link then force the first and only grandchild to be stretched too:
          if (firstGrandchild.nodeType == 1 && firstChild.childNodes.length == 1)
          {
            // Only elements have styles:
            var firstGrandchildStyle = firstGrandchild.style;
            if (firstGrandchild.tagName == "IMG" || firstGrandchild.tagName == "IFRAME")
            {
              firstGrandchildStyle.width = "100%";
              firstGrandchildStyle.height = "100%";
            }
            else // a normal tag
            {
              firstGrandchildStyle.position = "absolute";
              firstGrandchildStyle.top = "0px";
              firstGrandchildStyle.left = "0px";
              firstGrandchildStyle.right = "0px";
              firstGrandchildStyle.bottom = "0px";
            }
          }
        }
        else // a normal tag
        {
          firstChildStyle.position = "absolute";
          firstChildStyle.top = "0px";
          firstChildStyle.left = "0px";
          firstChildStyle.right = "0px";
          firstChildStyle.bottom = "0px";
        }
      }
    }
  },

  /* ---------------------------------------------------------------------------- */
  /* carousel Renderer                                                            */
  /* ---------------------------------------------------------------------------- */

  carousel:
  {
    createChildrenNodes: function(amxNode)
    {
      var fetchSize = Infinity;
      var fetchSizeAttr = amxNode.getAttribute("fetchSize");
      if (fetchSizeAttr != null && adf.mf.internal.amx.isFiniteNumber(parseInt(fetchSizeAttr, 10)))
      {
        fetchSize = parseInt(fetchSizeAttr, 10);
        if (fetchSize < 0)
        {
          fetchSize = Infinity;
        }
        else if (fetchSize == 0)
        {
          fetchSize = 25;
        }
      }

      // TODO: the maxRows should be stored in the same place the scroll position is stored.
      amxNode.setAttributeResolvedValue("fetchSize", fetchSize);
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

      var tag = amxNode.getTag();
      var nodeStampFacetTag = tag.getChildFacetTag("nodeStamp");
      var dataItems;
      if (!adf.mf.environment.profile.dtMode)
      {
        AmxRcfAssert.assert(
          nodeStampFacetTag != null,
          "Illegal state detected -- nodeStamp facet missing from carousel");

        dataItems = amxNode.getAttribute("value");
        if (dataItems === undefined)
        {
          // Mark it so the framework knows that the children nodes cannot be
          // created until the collection model has been loaded
          amxNode.setState(adf.mf.api.amx.AmxNodeStates["INITIAL"]);
          return true;
        }
      }

      if ((dataItems == null && !adf.mf.environment.profile.dtMode) || nodeStampFacetTag == null)
      {
        if (dataItems != null)
        {
          AmxRcfAssert.assert(
            nodeStampFacetTag != null,
            "Illegal state detected -- nodeStamp facet missing from carousel");
        }

        // No custom code needed, let the framework create the children
        return false;
      }

      var carouselItemTags = nodeStampFacetTag.getChildren("http://xmlns.oracle.com/adf/mf/amx",
        "carouselItem");
      // We only want the first
      var carouselItemTag = carouselItemTags.length == 0 ? null : carouselItemTags[0];
      AmxRcfAssert.assert(
        carouselItemTag != null,
        "Illegal state detected -- carouselItem in nodeStamp facet missing from carousel");

      if (adf.mf.environment.profile.dtMode)
      {
        // In DT mode, just create 3 children
        dataItems = [ {}, {}, {} ];
        amxNode.setAttributeResolvedValue("value", dataItems);
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
          function()
          {
            AmxRcfLogger.LOGGER.severe("*** Unexpected carousel item data load problem");
            adf.mf.api.amx.hideLoadingIndicator();
          });

        amxNode.setState(adf.mf.api.amx.AmxNodeStates["WAITING_ON_EL_EVALUATION"]);
        return true;
      }

      // Create the children
      var variableName = amxNode.getAttribute("var");
      while (iter.hasNext())
      {
        var item = iter.next();
        adf.mf.el.addVariable(variableName, item);
        var itemAmxNode = carouselItemTag.buildAmxNode(amxNode, iter.getRowKey());
        amxNode.addChild(itemAmxNode, "nodeStamp");
        adf.mf.el.removeVariable(variableName);
      }

      amxNode.setState(adf.mf.api.amx.AmxNodeStates["ABLE_TO_RENDER"]);
      return true;
    },

    updateChildren: function(amxNode, attributeChanges)
    {
      if (attributeChanges.hasChanged("value"))
      {
        return adf.mf.api.amx.AmxNodeChangeResult["REPLACE"];
      }

      return adf.mf.api.amx.AmxNodeChangeResult["REFRESH"];
    },

    visitChildren: function(amxNode, visitContext, callback)
    {
      var dataItems = amxNode.getAttribute("value");
      if (dataItems == null)
      {
        return false;
      }
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
          if (amxNode.visitStampedChildren(iter.getRowKey(), [ "nodeStamp" ], null,
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

    /**
     * AMX Create Handler.
     * @param amxNode the amxNode
     * @param {String} stampedId the stamped ID of the node to create
     * @return the DOM element for this component
     */
    create: function(amxNode, stampedId)
    {
      // Make "this" stack trace friendly:
      AmxRcfObject.initClass(this, "ImplicitAmxCarouselRenderer");

      try
      {
        // DOM Structure:
        //   root div
        //     sc div
        //       sp a amx-carousel_spin-h-previous-icon-style title="Spin the carousel to the previous item"
        //       sb div amx-carousel_spin-bar
        //         st a amx-carousel_spin-h-thumb-container
        //           st a amx-carousel_spin-h-thumb-icon-style title="Carousel spin thumb"
        //       sn a amx-carousel_spin-h-next-icon-style title="Spin the carousel to the next item"
        //     si div amx-carousel_spin-info
        //       span
        //         1 of 30
        //     it div amx-carousel_item-text p_AMXCircular
        //       Alice in Wonderland
        //     db div
        //       div _currentItemKey _rowCount _startRow
        //         multiple item wrapper divs p_AMXSelected p_AMXCircular amx-carousel_item data-amxRk
        //           div title amx-carouselItem data-amxText
        //             children
        //           div amx-carousel_item-overlay

        // Fetch the carousel component properties:
        var orientation = _ensureValidEnum(amxNode.getAttribute("orientation"), "horizontal", "vertical"); // horizontal is the default
        var displayItems = _ensureValidEnum(amxNode.getAttribute("displayItems"), "circular", "oneByOne");  // circular is the default
        var controlArea = _ensureValidEnum(amxNode.getAttribute("controlArea"), "full", "small", "compact", "none");  // full is the default
        var auxiliaryOffset = _ensureValidFloat(amxNode.getAttribute("auxiliaryOffset"), 0.45); // 0.45 is the default
        var auxiliaryPopOut = _ensureValidEnum(amxNode.getAttribute("auxiliaryPopOut"), "off", "hover"); // off is the default (long-touch == hover)
        var auxiliaryScale = _ensureValidFloat(amxNode.getAttribute("auxiliaryScale"), 0.8); // 0.8 is the default
        var halign = _ensureValidEnum(amxNode.getAttribute("halign"), "center", "start", "end"); // center is the default
        var valign = _ensureValidEnum(amxNode.getAttribute("valign"), "middle", "top", "bottom"); // middle is the default
        var shortDesc = _ensureValidString(amxNode.getAttribute("shortDesc"), "");
        var disabled = _ensureValidBoolean(amxNode.getAttribute("disabled"), false);
        var clientId = _ensureValidString(stampedId, amx.uuid());
        var currentItemKey = amxNode.getAttribute("currentItemKey");
        if (currentItemKey == null)
        {
          // First try to look for a stored value:
          var storedData = adf.mf.api.amx.getClientState(clientId);
          if (storedData != null)
          {
            currentItemKey = storedData.currentItemKey;
          }
        }

        var vertical = ("vertical" == orientation);
        var oneByOne = ("oneByOne" == displayItems);
        var smallControlArea = false;
        var compactControlArea = false;
        var noneControlArea = false;
        if (controlArea == "small")
        {
          smallControlArea = true;
        }
        else if (controlArea == "compact")
        {
          compactControlArea = true;
        }
        else if (controlArea == "none")
        {
          noneControlArea = true;
        }

        // ================
        // === The root ===
        // ================

        var carousel = document.createElement("div"); // root div
        carousel.setAttribute("tabindex", "0");
        carousel.setAttribute("title", shortDesc);
        if (vertical)
          carousel.className = _VERTICAL_ROOT_STYLECLASSES.join(" ");
        else
          carousel.className = _CAROUSEL_CLASS;

        // =======================
        // == The control area ===
        // =======================

        var controlWrapper = carousel;

        // To prevent a DOM change, the control area will be omitted in controlArea="full" mode:
        if (smallControlArea || compactControlArea)
        {
          var nonFullControls = document.createElement("div");
          nonFullControls.setAttribute("id", AmxRcfRichUIPeer.createSubId(clientId, "ca")); // control area
          if (oneByOne)
          {
            if (vertical)
            {
              if (smallControlArea)
                nonFullControls.className = _VERTICAL_ONE_BY_ONE_SMALL_CONTROL_AREA_STYLECLASSES.join(" ");
              else if (compactControlArea)
                nonFullControls.className = _VERTICAL_ONE_BY_ONE_COMPACT_CONTROL_AREA_STYLECLASSES.join(" ");
              else
                nonFullControls.className = _VERTICAL_ONE_BY_ONE_CONTROL_AREA_STYLECLASSES.join(" ");
            }
            else
            {
              if (smallControlArea)
                nonFullControls.className = _HORIZONTAL_ONE_BY_ONE_SMALL_CONTROL_AREA_STYLECLASSES.join(" ");
              else if (compactControlArea)
                nonFullControls.className = _HORIZONTAL_ONE_BY_ONE_COMPACT_CONTROL_AREA_STYLECLASSES.join(" ");
              else
                nonFullControls.className = _HORIZONTAL_ONE_BY_ONE_CONTROL_AREA_STYLECLASSES.join(" ");
            }
          }
          else // circular
          {
            if (vertical)
            {
              if (smallControlArea)
                nonFullControls.className = _VERTICAL_CIRCULAR_SMALL_CONTROL_AREA_STYLECLASSES.join(" ");
              else if (compactControlArea)
                nonFullControls.className = _VERTICAL_CIRCULAR_COMPACT_CONTROL_AREA_STYLECLASSES.join(" ");
              else
                nonFullControls.className = _VERTICAL_CIRCULAR_CONTROL_AREA_STYLECLASSES.join(" ");
            }
            else
            {
              if (smallControlArea)
                nonFullControls.className = _HORIZONTAL_CIRCULAR_SMALL_CONTROL_AREA_STYLECLASSES.join(" ");
              else if (compactControlArea)
                nonFullControls.className = _HORIZONTAL_CIRCULAR_COMPACT_CONTROL_AREA_STYLECLASSES.join(" ");
              else
                nonFullControls.className = _HORIZONTAL_CIRCULAR_CONTROL_AREA_STYLECLASSES.join(" ");
            }
          }

          // These buttons must only appear in the control area if non-full because otherwise they
          // appear in the spin bar:
          nonFullControls.appendChild(_renderClickablePrevious(disabled, vertical, clientId, smallControlArea, compactControlArea));
          nonFullControls.appendChild(_renderClickableNext(disabled, vertical, clientId, smallControlArea, compactControlArea));

          carousel.appendChild(nonFullControls);

          controlWrapper = nonFullControls;
        }
        else if (noneControlArea)
        {
          // Do not encode anything
        }
        else // full
        {
          var fullControls = document.createElement("div");
          fullControls.setAttribute("id", AmxRcfRichUIPeer.createSubId(clientId, "sc")); // manual spin control container

          var fullControlsStyle = fullControls.style;
          if (vertical)
          {
            if (AmxRcfPage.PAGE.getLocaleContext().isRightToLeft())
            {
              // consider a private "_spin-content" style class for this? if so, add ":vertical" support
              fullControlsStyle.position = "absolute";
              fullControlsStyle.top = "0px";
              fullControlsStyle.bottom = "0px";
              fullControlsStyle.left = "0px";
              fullControlsStyle.overflow = "hidden";
            }
            else // ltr
            {
              // consider a private "_spin-content" style class for this? if so, add ":vertical" support
              fullControlsStyle.position = "absolute";
              fullControlsStyle.top = "0px";
              fullControlsStyle.bottom = "0px";
              fullControlsStyle.right = "0px";
              fullControlsStyle.overflow = "hidden";
            }

            fullControls.appendChild(_renderClickablePrevious(disabled, vertical, clientId, smallControlArea, compactControlArea));
            fullControls.appendChild(_renderBarAndThumb(disabled, vertical, clientId));
            fullControls.appendChild(_renderClickableNext(disabled, vertical, clientId, smallControlArea, compactControlArea));
          }
          else
          {
            // consider a private "_spin-content" style class for this? if so, add ":vertical" support
            fullControlsStyle.position = "absolute";
            fullControlsStyle.left = "0px";
            fullControlsStyle.bottom = "0px";
            fullControlsStyle.right = "0px";
            fullControlsStyle.overflow = "hidden";

            fullControls.appendChild(_renderClickablePrevious(disabled, vertical, clientId, smallControlArea, compactControlArea));
            fullControls.appendChild(_renderBarAndThumb(disabled, vertical, clientId));
            fullControls.appendChild(_renderClickableNext(disabled, vertical, clientId, smallControlArea, compactControlArea));
          }

          controlWrapper.appendChild(fullControls);
        }

        // ====================
        // == The spin info ===
        // ====================

        // spin information indicator, e.g. displays something like "4 of 11"
        if (!compactControlArea && !noneControlArea)
        {
          var si = document.createElement("div");
          si.setAttribute("role", "presentation");
          si.setAttribute("aria-hidden", "true");
          si.setAttribute("id", AmxRcfRichUIPeer.createSubId(clientId, "si"));
          if (vertical)
          {
            if (smallControlArea)
              si.className = _VERTICAL_SMALL_SPIN_INFO_STYLECLASSES.join(" ");
            else if (compactControlArea)
              si.className = _VERTICAL_COMPACT_SPIN_INFO_STYLECLASSES.join(" ");
            else
              si.className = _VERTICAL_FULL_SPIN_INFO_STYLECLASSES.join(" ");
          }
          else
          {
            if (smallControlArea)
              si.className = _HORIZONTAL_SMALL_SPIN_INFO_STYLECLASSES.join(" ");
            else if (compactControlArea)
              si.className = _HORIZONTAL_COMPACT_SPIN_INFO_STYLECLASSES.join(" ");
            else
              si.className = _HORIZONTAL_FULL_SPIN_INFO_STYLECLASSES.join(" ");
          }
          si.appendChild(document.createTextNode("\u00a0")); // space is allocated in the peer based on the dimensions of this space character

          controlWrapper.appendChild(si);
        }

        // ====================
        // == The item text ===
        // ====================

        // container for displaying the spun-to item's text attribute:
        var it = document.createElement("div");
        it.setAttribute("id", AmxRcfRichUIPeer.createSubId(clientId, "it"));
        if (oneByOne)
        {
          if (vertical)
          {
            if (smallControlArea)
              it.className = _VERTICAL_ONE_BY_ONE_SMALL_ITEM_TEXT_STYLECLASSES.join(" ");
            else if (compactControlArea)
              it.className = _VERTICAL_ONE_BY_ONE_COMPACT_ITEM_TEXT_STYLECLASSES.join(" ");
            else // full or none
              it.className = _VERTICAL_ONE_BY_ONE_ITEM_TEXT_STYLECLASSES.join(" ");
          }
          else
          {
            if (smallControlArea)
              it.className = _HORIZONTAL_ONE_BY_ONE_SMALL_ITEM_TEXT_STYLECLASSES.join(" ");
            else if (compactControlArea)
              it.className = _HORIZONTAL_ONE_BY_ONE_COMPACT_ITEM_TEXT_STYLECLASSES.join(" ");
            else // full or none
              it.className = _HORIZONTAL_ONE_BY_ONE_ITEM_TEXT_STYLECLASSES.join(" ");
          }
        }
        else // circular
        {
          if (vertical)
          {
            if (smallControlArea)
              it.className = _VERTICAL_CIRCULAR_SMALL_ITEM_TEXT_STYLECLASSES.join(" ");
            else if (compactControlArea)
              it.className = _VERTICAL_CIRCULAR_COMPACT_ITEM_TEXT_STYLECLASSES.join(" ");
            else // full or none
              it.className = _VERTICAL_CIRCULAR_ITEM_TEXT_STYLECLASSES.join(" ");
          }
          else
          {
            if (smallControlArea)
              it.className = _HORIZONTAL_CIRCULAR_SMALL_ITEM_TEXT_STYLECLASSES.join(" ");
            else if (compactControlArea)
              it.className = _HORIZONTAL_CIRCULAR_COMPACT_ITEM_TEXT_STYLECLASSES.join(" ");
            else // full or none
              it.className = _HORIZONTAL_CIRCULAR_ITEM_TEXT_STYLECLASSES.join(" ");
          }
        }
        it.appendChild(document.createTextNode("\u00a0")); // space is allocated in the peer based on the dimensions of this space character
        controlWrapper.appendChild(it);

        // ====================
        // === The databody ===
        // ====================

        var dbElement = document.createElement("div"); // "db" div
        dbElement.setAttribute("id", AmxRcfRichUIPeer.createSubId(clientId, "db"));
        if (oneByOne)
          dbElement.className = _ONE_BY_ONE_VIEWPORT_STYLECLASSES.join(" ");
        else // circular
          dbElement.className = _CIRCULAR_VIEWPORT_STYLECLASSES.join(" ");
        carousel.appendChild(dbElement);

        var dbDivElement = document.createElement("div");
        dbDivElement.setAttribute("data-amxRowCount", "0");
        dbElement.appendChild(dbDivElement);

        // =========================================================
        // == Populate the databody with the carouselItem stamps ===
        // =========================================================

        var peer = null;
        var lastIndexRendered = -1;
        var lastWrapper = null;
        var maxRows;
        var isFetchingMoreRows = false;
        var maxRows = amxNode.getAttribute("maxRows");
        var dataItems = amxNode.getAttribute("value");

        if (dataItems != null)
        {
          var iter = adf.mf.api.amx.createIterator(dataItems);

          function getItemWrapper(carouselItemElement, rowKey)
          {
            // ==================
            // == The wrapper ===
            // ==================

            var wrapper = document.createElement("div"); // row-specific wrapper

            if (oneByOne)
              wrapper.className = _ONE_BY_ONE_ITEM_STYLECLASSES.join(" ");
            else // circular
              wrapper.className = _CIRCULAR_ITEM_STYLECLASSES.join(" ");

            // Add the screen reader info to make it non-selected:
            wrapper.setAttribute("aria-hidden", "true"); // Note: toggling this doesn't work on iOS 5 but does in iOS 6

            // Put an expando for rowKey on the table row element
            wrapper.setAttribute("data-amxRk", rowKey);

            // ----------

            // Increment the data-amxRowCount attribute:
            var oldCount = parseInt(dbDivElement.getAttribute("data-amxRowCount"), 10);
            dbDivElement.setAttribute("data-amxRowCount", ++oldCount);

            // ================
            // == The child ===
            // ================

            wrapper.appendChild(carouselItemElement);

            // ==================
            // == The overlay ===
            // ==================

            // Each item should have an overlay DIV that would eat clicks but also provides a visual
            // overlay if the item is not selected
            var overlay = document.createElement("div");
            overlay.className = _CAROUSEL_ITEM_OVERLAY_CLASS;

            // Allow the item overlays to show the item's shortDesc (if present):
            var itemShortDesc = carouselItemElement.getAttribute("title");
            if (itemShortDesc)
              overlay.setAttribute("title", itemShortDesc);

            overlay.appendChild(document.createTextNode("\u00a0")); // makeNonEmpty (required at least for Internet Explorer)
            wrapper.appendChild(overlay);

            return wrapper;
          }

          /**
           * Render one carousel item
           * @param {Object} item the item to render
           * @param {int} i the index of the carousel item in the carousel
           * @param {Object} rowKey the row key to use
           */
          function renderItem(item, i, rowKey)
          {
            var carouselItemElement;
            lastIndexRendered = i;

            adf.mf.el.addVariable(amxNode.getAttribute("var"), item);
            if (currentItemKey == null)
            {
              // Select the first row by default
              currentItemKey = rowKey;
            }

            try
            {
              var $carouselItem = amxNode.renderSubNodes("nodeStamp", rowKey); // TODO make non jq
              if ($carouselItem != null)
              {
                carouselItemElement = $carouselItem.get(0);
              }
            }
            catch (problem)
            {
              AmxRcfLogger.LOGGER.severe("*** Unexpected carousel item create problem:");
              AmxRcfLogger.LOGGER.severe(problem);
            }

            // we need to store the variable as part of the carouselItemElement for eventual later
            // use (e.g. setPropertyListener)
            if (carouselItemElement != null)
            {
              // Since this may be called after the footer and next rows elements have
              // been added to the list view, insert the rows after the last list item
              // if it exists
              var newWrapper = getItemWrapper(carouselItemElement, rowKey);
              if (lastWrapper)
              {
                var nextWrapper = lastWrapper.nextSibling;
                if (nextWrapper)
                  lastWrapper.parentNode.insertBefore(newWrapper, nextWrapper);
                else
                  lastWrapper.parentNode.appendChild(newWrapper);
              }
              else
              {
                dbDivElement.appendChild(newWrapper);
              }
              lastWrapper = newWrapper;
              adf.mf.el.removeVariable(amxNode.getAttribute("var"));
            }
          }

          for (var i = 0; i < maxRows && iter.hasNext(); ++i)
          {
            renderItem(iter.next(), i, iter.getRowKey());
          }
        }

        var rowCount = dbDivElement.getAttribute("data-amxRowCount");
        AmxRcfLogger.LOGGER.finer("Carousel has " + rowCount + " rows");

        if (currentItemKey == null)
        {
          // If still null then resort to a default value:
          currentItemKey = "0";
        }
        dbDivElement.setAttribute("data-amxCurrentItemKey", currentItemKey);
        AmxRcfLogger.LOGGER.info("Initial currentItemKey = " + currentItemKey);

        if (rowCount == 0)
        {
          // ========================
          // == The empty message ===
          // ========================

          AmxRcfLogger.LOGGER.finer("Carousel has no rows");
          var emptyString = adf.mf.resource.getInfoString("AMXInfoBundle","amx_carousel_MSG_NO_DATA");
          var emptySpan = document.createElement("span");
          emptySpan.appendChild(document.createTextNode(emptyString));
          dbDivElement.appendChild(emptySpan);
        }
        else
        {
          // Let the peer know what the data block starts at zero (non-empty):
          dbDivElement.setAttribute("data-amxStartRow", "0");
        }

        // ==========================
        // == Connect with a peer ===
        // ==========================
        var fetchSize = amxNode.getAttribute("fetchSize");

        var rootDomElement = carousel;
        var component = new AmxRcfRichCarousel(
          amxNode,
          auxiliaryOffset,
          auxiliaryPopOut,
          auxiliaryScale,
          clientId,
          "immediate", // contentDelivery
          controlArea,
          currentItemKey,
          disabled,
          displayItems,
          fetchSize,
          halign,
          orientation,
          valign);

        // AMX won't assign an ID to the root element unless an explicit ID was given:
        var rootId = rootDomElement.id;
        if (rootId == null || rootId.length == 0)
          rootDomElement.id = clientId; // clientId is a new one from the uuid utility

        peer = this._peer = new AmxRcfCarouselPeer(component, rootDomElement);

        return carousel;
      }
      catch (problem)
      {
        AmxRcfLogger.LOGGER.severe("*** Unexpected carousel create problem:");
        AmxRcfLogger.LOGGER.severe(problem);
        return null;
      }
    },

    /**
     * AMX Init Handler.
     * @param domNode the carousel root DOM node
     * @param amxNode the amxNode
     */
    init: function(domNode, amxNode)
    {
      var peer = this._peer;
      var rootDomElement = peer.getDomElement();
      var clientId = peer.getComponent().getClientId();
      if (rootDomElement.id != clientId)
      {
        // Perhaps there was a collision in IDs but AMX re-assigned our ID so we have to re-re-assign it:
        AmxRcfLogger.LOGGER.severe("Illegal mismatch between the root DOM element and the carousel component detected: \"" + rootDomElement.id + "\" != \"" + clientId + "\" (updating the DOM's ID instead).");
        rootDomElement.id = clientId;
      }

      if (AmxRcfLogger.LOGGER.isLoggable(AmxRcfLogger.FINE) &&
          !adf.mf.internal.amx.isAncestor(document.body, rootDomElement))
      {
        // This happens when you update EL that is bound to one of the attributes of the amx tag and then use
        // some AMX input component to change the EL value.
        // A workaround in the demo was used to avoid this by moving all of the EL-changing input components onto a
        // separate page.
        // This also happens when you put the carousel inside of a panelSplitter panelItem and toggle between the
        // selected panelItems.
        AmxRcfLogger.LOGGER.fine("Carousel DOM not connected to document body during AMX init call.");
        AmxRcfLogger.LOGGER.fine(rootDomElement);
        AmxRcfLogger.LOGGER.fine(rootDomElement.parentNode);
        AmxRcfLogger.LOGGER.fine(domNode);
        AmxRcfLogger.LOGGER.fine(domNode.offsetWidth);
      }

      peer.InitDomElement();

      var width = domNode.offsetWidth;
      var height = domNode.offsetHeight;
      peer.ResizeNotify(null, null, width, height);

      // Listen if someone resizes the window:
      $(window).resize(peer, this._handleResize); // TODO remove jQuery on this

      // Listen if someone explicitly calls .resize() on my root element:
      $(domNode).resize(peer, this._handleResize); // TODO remove jQuery on this
    },

    _handleResize: function(domEvent)
    {
      var peer = domEvent.data;
      AmxRcfAssert.assertPrototype(peer, AmxRcfCarouselPeer);

      var domElement = peer.getDomElement();
      AmxRcfAssert.assertDomElement(domElement);

      // Ensure element belongs to the document body:
      if (adf.mf.internal.amx.isAncestor(document.body, domElement))
      {
        // The component is connected to the page:
        var width = domElement.offsetWidth;
        var height = domElement.offsetHeight;

        if (!peer.HasInitialSize() ||
          peer._lastResizeWidth == null ||
          peer._lastResizeHeight == null ||
          width != peer._lastResizeWidth ||
          height != peer._lastResizeHeight)
        {
          // If the width and/or height changed then handle the change;
          // other we must short-circuit or else it can infinitely loop:
          peer._lastResizeWidth = width;
          peer._lastResizeHeight = height;
          peer.ResizeNotify(null, null, width, height);
        }
      }
      else
      {
        // The component is not connected to the page, don't waste time handling the event:
        AmxRcfLogger.LOGGER.info("Resize event handler called on a disconnected element:");
        AmxRcfLogger.LOGGER.info(domElement);
      }
    }
  }

  /* ---------------------------------------------------------------------------- */

});

/* ---------------------------------------------------------------------------- */

try // overall utility try-catch
{

/* ---------------------------------------------------------------------------- */

function _ensureValidFloat(rawValue, defaultValue)
{
  var result = parseFloat(rawValue);
  if (isNaN(result))
    return defaultValue;
  return result;
};

function _ensureValidString(rawValue, defaultValue)
{
  if (rawValue == null)
    return defaultValue;
  return rawValue;
};

function _ensureValidEnum()
{
  var argLength = arguments.length;
  AmxRcfAssert.assert(argLength >= 2, "Not enough _ensureValidString arguments");
  var rawValue = arguments[0];
  for (var i=1; i<argLength; i++)
  {
    if (rawValue == arguments[i])
      return rawValue;
  }
  return arguments[1]; // use the default value instead
};

function _ensureValidBoolean(rawValue, defaultValue)
{
  if ("true" === rawValue || true === rawValue)
    return true;
  else if ("false" === rawValue || false === rawValue)
    return false;
  return defaultValue;
};

function _renderClickableIcon(isTabStop, href, styleClasses, id, tooltip, iconName, ariaRole)
{
  var icon = document.createElement("a");
  icon.setAttribute("id", id);
  icon.setAttribute("href", href);
  if (!isTabStop)
  {
    icon.setAttribute("tabIndex", -1);
    icon.setAttribute("aria-disabled", true);
  }
  else
  {
    icon.setAttribute("onclick", "this.focus();return false");
  }
  icon.setAttribute("role", ariaRole);
  icon.setAttribute("title", tooltip);
  icon.className = styleClasses.join(" ");
  // note that iconName is unused
  return icon;
};

function _renderClickablePrevious(disabled, vertical, clientId, smallControlArea, compactControlArea)
{
  var styleClasses;
  if (disabled)
  {
    if (vertical)
    {
      if (smallControlArea)
        styleClasses = _VERTICAL_SMALL_SPIN_PREVIOUS_DISABLED_ICON_STYLES;
      else if (compactControlArea)
        styleClasses = _VERTICAL_COMPACT_SPIN_PREVIOUS_DISABLED_ICON_STYLES;
      else // full or none
        styleClasses = _VERTICAL_SPIN_PREVIOUS_DISABLED_ICON_STYLES;
    }
    else // horizontal
    {
      if (smallControlArea)
        styleClasses = _HORIZONTAL_SMALL_SPIN_PREVIOUS_DISABLED_ICON_STYLES;
      else if (compactControlArea)
        styleClasses = _HORIZONTAL_COMPACT_SPIN_PREVIOUS_DISABLED_ICON_STYLES;
      else // full or none
        styleClasses = _HORIZONTAL_SPIN_PREVIOUS_DISABLED_ICON_STYLES;
    }
  }
  else // enabled
  {
    if (vertical)
    {
      if (smallControlArea)
        styleClasses = _VERTICAL_SMALL_SPIN_PREVIOUS_ICON_STYLES;
      else if (compactControlArea)
        styleClasses = _VERTICAL_COMPACT_SPIN_PREVIOUS_ICON_STYLES;
      else // full or none
        styleClasses = _VERTICAL_SPIN_PREVIOUS_ICON_STYLES;
    }
    else // horizontal
    {
      if (smallControlArea)
        styleClasses = _HORIZONTAL_SMALL_SPIN_PREVIOUS_ICON_STYLES;
      else if (compactControlArea)
        styleClasses = _HORIZONTAL_COMPACT_SPIN_PREVIOUS_ICON_STYLES;
      else // full or none
        styleClasses = _HORIZONTAL_SPIN_PREVIOUS_ICON_STYLES;
    }
  }
  return _renderClickableIcon(
    !disabled, // isTabStop
    "#",
    styleClasses,
    AmxRcfRichUIPeer.createSubId(clientId, "sp"),
    adf.mf.resource.getInfoString("AMXInfoBundle","amx_carousel_TIP_SPIN_TO_PREVIOUS_ITEM"),
    vertical ? _CAROUSEL_SPIN_V_PREVIOUS_ICON_NAME : _CAROUSEL_SPIN_H_PREVIOUS_ICON_NAME,
    "button");
};

function _renderBarAndThumb(disabled, vertical, clientId)
{
  var bar = document.createElement("div");
  bar.setAttribute("id", AmxRcfRichUIPeer.createSubId(clientId, "sb"));
  var thumbStyleClasses;
  if (disabled)
  {
    if (vertical)
    {
      thumbStyleClasses = _VERTICAL_SPIN_THUMB_DISABLED_ICON_STYLES;
      bar.className = _VERTICAL_SPIN_BAR_DISABLED_STYLECLASSES.join(" ");
    }
    else // horizontal
    {
      thumbStyleClasses = _HORIZONTAL_SPIN_THUMB_DISABLED_ICON_STYLES;
      bar.className = _HORIZONTAL_SPIN_BAR_DISABLED_STYLECLASSES.join(" ");
    }
  }
  else // enabled
  {
    if (vertical)
    {
      thumbStyleClasses = _VERTICAL_SPIN_THUMB_ICON_STYLES;
      bar.className = _VERTICAL_SPIN_BAR_STYLECLASSES.join(" ");
    }
    else // horizontal
    {
      thumbStyleClasses = _HORIZONTAL_SPIN_THUMB_ICON_STYLES;
      bar.className = _HORIZONTAL_SPIN_BAR_STYLECLASSES.join(" ");
    }
  }

  // thumb icon
  var thumb = document.createElement("div");
  thumb.setAttribute("id", AmxRcfRichUIPeer.createSubId(clientId, "st"));
  if (vertical)
    thumb.className = _CAROUSEL_SPIN_V_THUMB_CONTAINER_NAME;
  else
    thumb.className = _CAROUSEL_SPIN_H_THUMB_CONTAINER_NAME;
  var icon = _renderClickableIcon(
    !disabled, // isTabStop
    "#",
    thumbStyleClasses,
    AmxRcfRichUIPeer.createSubId(clientId, "sti"),
    adf.mf.resource.getInfoString("AMXInfoBundle","amx_carousel_TIP_SPIN_THUMB"),
    vertical ? _CAROUSEL_SPIN_V_THUMB_ICON_NAME : _CAROUSEL_SPIN_H_THUMB_ICON_NAME,
    "presentation");
  icon.setAttribute("aria-hidden", "true");

  thumb.appendChild(icon);
  bar.appendChild(thumb);
  return bar;
};

function _renderClickableNext(disabled, vertical, clientId, smallControlArea, compactControlArea)
{
  var styleClasses;
  if (disabled)
  {
    if (vertical)
    {
      if (smallControlArea)
        styleClasses = _VERTICAL_SMALL_SPIN_NEXT_DISABLED_ICON_STYLES;
      else if (compactControlArea)
        styleClasses = _VERTICAL_COMPACT_SPIN_NEXT_DISABLED_ICON_STYLES;
      else // full or none
        styleClasses = _VERTICAL_SPIN_NEXT_DISABLED_ICON_STYLES;
    }
    else // horizontal
    {
      if (smallControlArea)
        styleClasses = _HORIZONTAL_SMALL_SPIN_NEXT_DISABLED_ICON_STYLES;
      else if (compactControlArea)
        styleClasses = _HORIZONTAL_COMPACT_SPIN_NEXT_DISABLED_ICON_STYLES;
      else // full or none
        styleClasses = _HORIZONTAL_SPIN_NEXT_DISABLED_ICON_STYLES;
    }
  }
  else // enabled
  {
    if (vertical)
    {
      if (smallControlArea)
        styleClasses = _VERTICAL_SMALL_SPIN_NEXT_ICON_STYLES;
      else if (compactControlArea)
        styleClasses = _VERTICAL_COMPACT_SPIN_NEXT_ICON_STYLES;
      else // full or none
        styleClasses = _VERTICAL_SPIN_NEXT_ICON_STYLES;
    }
    else // horizontal
    {
      if (smallControlArea)
        styleClasses = _HORIZONTAL_SMALL_SPIN_NEXT_ICON_STYLES;
      else if (compactControlArea)
        styleClasses = _HORIZONTAL_COMPACT_SPIN_NEXT_ICON_STYLES;
      else // full or none
        styleClasses = _HORIZONTAL_SPIN_NEXT_ICON_STYLES;
    }
  }
  return _renderClickableIcon(
    !disabled, // isTabStop
    "#",
    styleClasses,
    AmxRcfRichUIPeer.createSubId(clientId, "sn"),
    adf.mf.resource.getInfoString("AMXInfoBundle","amx_carousel_TIP_SPIN_TO_NEXT_ITEM"),
    vertical ? _CAROUSEL_SPIN_V_NEXT_ICON_NAME : _CAROUSEL_SPIN_H_NEXT_ICON_NAME,
    "button");
};

_CAROUSEL_CLASS = "amx-carousel";
_CAROUSEL_SPIN_ANIMATION_DURATION = "amx-carousel-tr-spin-animation-duration";
_CAROUSEL_POP_OUT_ANIMATION_DURATION = "amx-carousel-tr-pop-out-animation-duration";
_CAROUSEL_OVERLAY_OPACITY = "amx-carousel-tr-overlay-opacity";
_CAROUSEL_VIEWPORT_CLASS = "amx-carousel_view";
_CAROUSEL_ITEM_CLASS = "amx-carousel_item";
_CAROUSEL_ITEM_OVERLAY_CLASS = "amx-carousel_item-overlay";
_CAROUSEL_SPIN_H_PREVIOUS_ICON_NAME = "amx-carousel_spin-h-previous-icon";
_CAROUSEL_SPIN_H_PREVIOUS_ICON_STYLE_NAME = "amx-carousel_spin-h-previous-icon-style";
_CAROUSEL_SPIN_H_THUMB_CONTAINER_NAME = "amx-carousel_spin-h-thumb-container";
_CAROUSEL_SPIN_H_THUMB_ICON_NAME = "amx-carousel_spin-h-thumb-icon";
_CAROUSEL_SPIN_H_THUMB_ICON_STYLE_NAME = "amx-carousel_spin-h-thumb-icon-style";
_CAROUSEL_SPIN_H_NEXT_ICON_NAME = "amx-carousel_spin-h-next-icon";
_CAROUSEL_SPIN_H_NEXT_ICON_STYLE_NAME = "amx-carousel_spin-h-next-icon-style";
_CAROUSEL_SPIN_V_PREVIOUS_ICON_NAME = "amx-carousel_spin-v-previous-icon";
_CAROUSEL_SPIN_V_PREVIOUS_ICON_STYLE_NAME = "amx-carousel_spin-v-previous-icon-style";
_CAROUSEL_SPIN_V_THUMB_CONTAINER_NAME = "amx-carousel_spin-v-thumb-container";
_CAROUSEL_SPIN_V_THUMB_ICON_NAME = "amx-carousel_spin-v-thumb-icon";
_CAROUSEL_SPIN_V_THUMB_ICON_STYLE_NAME = "amx-carousel_spin-v-thumb-icon-style";
_CAROUSEL_SPIN_V_NEXT_ICON_NAME = "amx-carousel_spin-v-next-icon";
_CAROUSEL_SPIN_V_NEXT_ICON_STYLE_NAME = "amx-carousel_spin-v-next-icon-style";
_CAROUSEL_SPIN_BAR_CLASS = "amx-carousel_spin-bar";
_CAROUSEL_SPIN_INFO_CLASS = "amx-carousel_spin-info";
_CAROUSEL_ITEM_TEXT_CLASS = "amx-carousel_item-text";
_CAROUSEL_CONTROL_AREA_CLASS = "amx-carousel_control-area";
_DISABLED_STATE              = "p_AMXDisabled";
_FULL_DISPLAY_MODE_STATE     = "p_AMXFull";
_COMPACT_DISPLAY_MODE_STATE  = "p_AMXCompact";
_SMALL_DISPLAY_MODE_STATE    = "p_AMXSmall"; // less compact than "compact", but more compact than "full"
_CIRCULAR_STATE              = "p_AMXCircular";
_ONE_BY_ONE_STATE            = "p_AMXOneByOne";
_VERTICAL_LAYOUT_STATE       = "p_AMXVertical";
_HORIZONTAL_SPIN_PREVIOUS_ICON_STYLES = [
  _CAROUSEL_SPIN_H_PREVIOUS_ICON_STYLE_NAME,
  _FULL_DISPLAY_MODE_STATE
];
_HORIZONTAL_SMALL_SPIN_PREVIOUS_ICON_STYLES = [
  _CAROUSEL_SPIN_H_PREVIOUS_ICON_STYLE_NAME,
  _SMALL_DISPLAY_MODE_STATE
];
_HORIZONTAL_COMPACT_SPIN_PREVIOUS_ICON_STYLES = [
  _CAROUSEL_SPIN_H_PREVIOUS_ICON_STYLE_NAME,
  _COMPACT_DISPLAY_MODE_STATE
];
_HORIZONTAL_SPIN_BAR_STYLECLASSES = [
  _CAROUSEL_SPIN_BAR_CLASS
];
_HORIZONTAL_SPIN_THUMB_ICON_STYLES = [
  _CAROUSEL_SPIN_H_THUMB_ICON_STYLE_NAME
];
_HORIZONTAL_SPIN_NEXT_ICON_STYLES = [
  _CAROUSEL_SPIN_H_NEXT_ICON_STYLE_NAME,
  _FULL_DISPLAY_MODE_STATE
];
_HORIZONTAL_SMALL_SPIN_NEXT_ICON_STYLES = [
  _CAROUSEL_SPIN_H_NEXT_ICON_STYLE_NAME,
  _SMALL_DISPLAY_MODE_STATE
];
_HORIZONTAL_COMPACT_SPIN_NEXT_ICON_STYLES = [
  _CAROUSEL_SPIN_H_NEXT_ICON_STYLE_NAME,
  _COMPACT_DISPLAY_MODE_STATE
];
_HORIZONTAL_SPIN_PREVIOUS_DISABLED_ICON_STYLES = [
  _CAROUSEL_SPIN_H_PREVIOUS_ICON_STYLE_NAME,
  _FULL_DISPLAY_MODE_STATE,
  _DISABLED_STATE
];
_HORIZONTAL_SMALL_SPIN_PREVIOUS_DISABLED_ICON_STYLES = [
  _CAROUSEL_SPIN_H_PREVIOUS_ICON_STYLE_NAME,
  _SMALL_DISPLAY_MODE_STATE,
  _DISABLED_STATE
];
_HORIZONTAL_COMPACT_SPIN_PREVIOUS_DISABLED_ICON_STYLES = [
  _CAROUSEL_SPIN_H_PREVIOUS_ICON_STYLE_NAME,
  _COMPACT_DISPLAY_MODE_STATE,
  _DISABLED_STATE
];
_HORIZONTAL_SPIN_BAR_DISABLED_STYLECLASSES = [
  _CAROUSEL_SPIN_BAR_CLASS,
  _DISABLED_STATE
];
_HORIZONTAL_SPIN_THUMB_DISABLED_ICON_STYLES = [
  _CAROUSEL_SPIN_H_THUMB_ICON_STYLE_NAME,
  _DISABLED_STATE
];
_HORIZONTAL_SPIN_NEXT_DISABLED_ICON_STYLES = [
  _CAROUSEL_SPIN_H_NEXT_ICON_STYLE_NAME,
  _FULL_DISPLAY_MODE_STATE,
  _DISABLED_STATE
];
_HORIZONTAL_SMALL_SPIN_NEXT_DISABLED_ICON_STYLES = [
  _CAROUSEL_SPIN_H_NEXT_ICON_STYLE_NAME,
  _SMALL_DISPLAY_MODE_STATE,
  _DISABLED_STATE
];
_HORIZONTAL_COMPACT_SPIN_NEXT_DISABLED_ICON_STYLES = [
  _CAROUSEL_SPIN_H_NEXT_ICON_STYLE_NAME,
  _COMPACT_DISPLAY_MODE_STATE,
  _DISABLED_STATE
];
_HORIZONTAL_FULL_SPIN_INFO_STYLECLASSES = [
  _CAROUSEL_SPIN_INFO_CLASS,
  _FULL_DISPLAY_MODE_STATE
];
_HORIZONTAL_SMALL_SPIN_INFO_STYLECLASSES = [
  _CAROUSEL_SPIN_INFO_CLASS,
  _SMALL_DISPLAY_MODE_STATE
];
_HORIZONTAL_COMPACT_SPIN_INFO_STYLECLASSES = [
  _CAROUSEL_SPIN_INFO_CLASS,
  _COMPACT_DISPLAY_MODE_STATE
];
_HORIZONTAL_ONE_BY_ONE_ITEM_TEXT_STYLECLASSES = [
  _CAROUSEL_ITEM_TEXT_CLASS,
  _ONE_BY_ONE_STATE
];
_HORIZONTAL_ONE_BY_ONE_SMALL_ITEM_TEXT_STYLECLASSES = [
  _CAROUSEL_ITEM_TEXT_CLASS,
  _SMALL_DISPLAY_MODE_STATE,
  _ONE_BY_ONE_STATE
];
_HORIZONTAL_ONE_BY_ONE_COMPACT_ITEM_TEXT_STYLECLASSES = [
  _CAROUSEL_ITEM_TEXT_CLASS,
  _COMPACT_DISPLAY_MODE_STATE,
  _ONE_BY_ONE_STATE
];
_HORIZONTAL_CIRCULAR_ITEM_TEXT_STYLECLASSES = [
  _CAROUSEL_ITEM_TEXT_CLASS,
  _CIRCULAR_STATE
];
_HORIZONTAL_CIRCULAR_SMALL_ITEM_TEXT_STYLECLASSES = [
  _CAROUSEL_ITEM_TEXT_CLASS,
  _SMALL_DISPLAY_MODE_STATE,
  _CIRCULAR_STATE
];
_HORIZONTAL_CIRCULAR_COMPACT_ITEM_TEXT_STYLECLASSES = [
  _CAROUSEL_ITEM_TEXT_CLASS,
  _COMPACT_DISPLAY_MODE_STATE,
  _CIRCULAR_STATE
];
_HORIZONTAL_ONE_BY_ONE_CONTROL_AREA_STYLECLASSES = [
  _CAROUSEL_CONTROL_AREA_CLASS,
  _FULL_DISPLAY_MODE_STATE,
  _ONE_BY_ONE_STATE
];
_HORIZONTAL_ONE_BY_ONE_SMALL_CONTROL_AREA_STYLECLASSES = [
  _CAROUSEL_CONTROL_AREA_CLASS,
  _SMALL_DISPLAY_MODE_STATE,
  _ONE_BY_ONE_STATE
];
_HORIZONTAL_ONE_BY_ONE_COMPACT_CONTROL_AREA_STYLECLASSES = [
  _CAROUSEL_CONTROL_AREA_CLASS,
  _COMPACT_DISPLAY_MODE_STATE,
  _ONE_BY_ONE_STATE
];
_HORIZONTAL_CIRCULAR_CONTROL_AREA_STYLECLASSES = [
  _CAROUSEL_CONTROL_AREA_CLASS,
  _FULL_DISPLAY_MODE_STATE,
  _CIRCULAR_STATE
];
_HORIZONTAL_CIRCULAR_SMALL_CONTROL_AREA_STYLECLASSES = [
  _CAROUSEL_CONTROL_AREA_CLASS,
  _SMALL_DISPLAY_MODE_STATE,
  _CIRCULAR_STATE
];
_HORIZONTAL_CIRCULAR_COMPACT_CONTROL_AREA_STYLECLASSES = [
  _CAROUSEL_CONTROL_AREA_CLASS,
  _COMPACT_DISPLAY_MODE_STATE,
  _CIRCULAR_STATE
];
_VERTICAL_ROOT_STYLECLASSES = [
  _CAROUSEL_CLASS,
  _VERTICAL_LAYOUT_STATE
];
_VERTICAL_SPIN_PREVIOUS_ICON_STYLES = [
  _CAROUSEL_SPIN_V_PREVIOUS_ICON_STYLE_NAME,
  _FULL_DISPLAY_MODE_STATE
];
_VERTICAL_SMALL_SPIN_PREVIOUS_ICON_STYLES = [
  _CAROUSEL_SPIN_V_PREVIOUS_ICON_STYLE_NAME,
  _SMALL_DISPLAY_MODE_STATE
];
_VERTICAL_COMPACT_SPIN_PREVIOUS_ICON_STYLES = [
  _CAROUSEL_SPIN_V_PREVIOUS_ICON_STYLE_NAME,
  _COMPACT_DISPLAY_MODE_STATE
];
_VERTICAL_SPIN_BAR_STYLECLASSES = [
  _CAROUSEL_SPIN_BAR_CLASS,
  _VERTICAL_LAYOUT_STATE
];
_VERTICAL_SPIN_THUMB_ICON_STYLES = [
  _CAROUSEL_SPIN_V_THUMB_ICON_STYLE_NAME
];
_VERTICAL_SPIN_NEXT_ICON_STYLES = [
  _CAROUSEL_SPIN_V_NEXT_ICON_STYLE_NAME,
  _FULL_DISPLAY_MODE_STATE
];
_VERTICAL_SMALL_SPIN_NEXT_ICON_STYLES = [
  _CAROUSEL_SPIN_V_NEXT_ICON_STYLE_NAME,
  _SMALL_DISPLAY_MODE_STATE
];
_VERTICAL_COMPACT_SPIN_NEXT_ICON_STYLES = [
  _CAROUSEL_SPIN_V_NEXT_ICON_STYLE_NAME,
  _COMPACT_DISPLAY_MODE_STATE
];
_VERTICAL_SPIN_PREVIOUS_DISABLED_ICON_STYLES = [
  _CAROUSEL_SPIN_V_PREVIOUS_ICON_STYLE_NAME,
  _FULL_DISPLAY_MODE_STATE,
  _DISABLED_STATE
];
_VERTICAL_SMALL_SPIN_PREVIOUS_DISABLED_ICON_STYLES = [
  _CAROUSEL_SPIN_V_PREVIOUS_ICON_STYLE_NAME,
  _SMALL_DISPLAY_MODE_STATE,
  _DISABLED_STATE
];
_VERTICAL_COMPACT_SPIN_PREVIOUS_DISABLED_ICON_STYLES = [
  _CAROUSEL_SPIN_V_PREVIOUS_ICON_STYLE_NAME,
  _COMPACT_DISPLAY_MODE_STATE,
  _DISABLED_STATE
];
_VERTICAL_SPIN_BAR_DISABLED_STYLECLASSES = [
  _CAROUSEL_SPIN_BAR_CLASS,
  _VERTICAL_LAYOUT_STATE,
  _DISABLED_STATE
];
_VERTICAL_SPIN_THUMB_DISABLED_ICON_STYLES = [
  _CAROUSEL_SPIN_V_THUMB_ICON_STYLE_NAME,
  _DISABLED_STATE
];
_VERTICAL_SPIN_NEXT_DISABLED_ICON_STYLES = [
  _CAROUSEL_SPIN_V_NEXT_ICON_STYLE_NAME,
  _FULL_DISPLAY_MODE_STATE,
  _DISABLED_STATE
];
_VERTICAL_SMALL_SPIN_NEXT_DISABLED_ICON_STYLES = [
  _CAROUSEL_SPIN_V_NEXT_ICON_STYLE_NAME,
  _SMALL_DISPLAY_MODE_STATE,
  _DISABLED_STATE
];
_VERTICAL_COMPACT_SPIN_NEXT_DISABLED_ICON_STYLES = [
  _CAROUSEL_SPIN_V_NEXT_ICON_STYLE_NAME,
  _COMPACT_DISPLAY_MODE_STATE,
  _DISABLED_STATE
];
_VERTICAL_FULL_SPIN_INFO_STYLECLASSES = [
  _CAROUSEL_SPIN_INFO_CLASS,
  _FULL_DISPLAY_MODE_STATE,
  _VERTICAL_LAYOUT_STATE
];
_VERTICAL_SMALL_SPIN_INFO_STYLECLASSES = [
  _CAROUSEL_SPIN_INFO_CLASS,
  _SMALL_DISPLAY_MODE_STATE,
  _VERTICAL_LAYOUT_STATE
];
_VERTICAL_COMPACT_SPIN_INFO_STYLECLASSES = [
  _CAROUSEL_SPIN_INFO_CLASS,
  _COMPACT_DISPLAY_MODE_STATE,
  _VERTICAL_LAYOUT_STATE
];
_VERTICAL_ONE_BY_ONE_ITEM_TEXT_STYLECLASSES = [
  _CAROUSEL_ITEM_TEXT_CLASS,
  _VERTICAL_LAYOUT_STATE,
  _ONE_BY_ONE_STATE
];
_VERTICAL_ONE_BY_ONE_SMALL_ITEM_TEXT_STYLECLASSES = [
  _CAROUSEL_ITEM_TEXT_CLASS,
  _SMALL_DISPLAY_MODE_STATE,
  _VERTICAL_LAYOUT_STATE,
  _ONE_BY_ONE_STATE
];
_VERTICAL_ONE_BY_ONE_COMPACT_ITEM_TEXT_STYLECLASSES = [
  _CAROUSEL_ITEM_TEXT_CLASS,
  _COMPACT_DISPLAY_MODE_STATE,
  _VERTICAL_LAYOUT_STATE,
  _ONE_BY_ONE_STATE
];
_VERTICAL_CIRCULAR_ITEM_TEXT_STYLECLASSES = [
  _CAROUSEL_ITEM_TEXT_CLASS,
  _VERTICAL_LAYOUT_STATE,
  _CIRCULAR_STATE
];
_VERTICAL_CIRCULAR_SMALL_ITEM_TEXT_STYLECLASSES = [
  _CAROUSEL_ITEM_TEXT_CLASS,
  _SMALL_DISPLAY_MODE_STATE,
  _VERTICAL_LAYOUT_STATE,
  _CIRCULAR_STATE
];
_VERTICAL_CIRCULAR_COMPACT_ITEM_TEXT_STYLECLASSES = [
  _CAROUSEL_ITEM_TEXT_CLASS,
  _COMPACT_DISPLAY_MODE_STATE,
  _VERTICAL_LAYOUT_STATE,
  _CIRCULAR_STATE
];
_VERTICAL_ONE_BY_ONE_CONTROL_AREA_STYLECLASSES = [
  _CAROUSEL_CONTROL_AREA_CLASS,
  _FULL_DISPLAY_MODE_STATE,
  _VERTICAL_LAYOUT_STATE,
  _ONE_BY_ONE_STATE
];
_VERTICAL_ONE_BY_ONE_SMALL_CONTROL_AREA_STYLECLASSES = [
  _CAROUSEL_CONTROL_AREA_CLASS,
  _VERTICAL_LAYOUT_STATE,
  _SMALL_DISPLAY_MODE_STATE,
  _ONE_BY_ONE_STATE
];
_VERTICAL_ONE_BY_ONE_COMPACT_CONTROL_AREA_STYLECLASSES = [
  _CAROUSEL_CONTROL_AREA_CLASS,
  _VERTICAL_LAYOUT_STATE,
  _COMPACT_DISPLAY_MODE_STATE,
  _ONE_BY_ONE_STATE
];
_VERTICAL_CIRCULAR_CONTROL_AREA_STYLECLASSES = [
  _CAROUSEL_CONTROL_AREA_CLASS,
  _VERTICAL_LAYOUT_STATE,
  _FULL_DISPLAY_MODE_STATE,
  _CIRCULAR_STATE
];
_VERTICAL_CIRCULAR_SMALL_CONTROL_AREA_STYLECLASSES = [
  _CAROUSEL_CONTROL_AREA_CLASS,
  _VERTICAL_LAYOUT_STATE,
  _SMALL_DISPLAY_MODE_STATE,
  _CIRCULAR_STATE
];
_VERTICAL_CIRCULAR_COMPACT_CONTROL_AREA_STYLECLASSES = [
  _CAROUSEL_CONTROL_AREA_CLASS,
  _VERTICAL_LAYOUT_STATE,
  _COMPACT_DISPLAY_MODE_STATE,
  _CIRCULAR_STATE
];
_CIRCULAR_VIEWPORT_STYLECLASSES = [
  _CAROUSEL_VIEWPORT_CLASS,
  _CIRCULAR_STATE
];
_ONE_BY_ONE_VIEWPORT_STYLECLASSES = [
  _CAROUSEL_VIEWPORT_CLASS,
  _ONE_BY_ONE_STATE
];
_ONE_BY_ONE_ITEM_STYLECLASSES = [
  _CAROUSEL_ITEM_CLASS,
  _ONE_BY_ONE_STATE
];
_CIRCULAR_ITEM_STYLECLASSES = [
  _CAROUSEL_ITEM_CLASS,
  _CIRCULAR_STATE
];

/* ---------------------------------------------------------------------------- */
/* AmxRcfLogger                                                                 */
/* ---------------------------------------------------------------------------- */

AmxRcfLogger = function(level)
{
  this.Init(level);
  // Note that we cannot use AmxRcfObject.initClass() on this class because it would be a circular dependency.
};

/**
 * Create an instance of an AmxRcfLogger
 */
AmxRcfLogger.prototype.Init = function(level)
{
  this._level = level;
};

/**
 * @return {AmxRcfLogger} AmxRcfLogger instance to use for logging
 * @see #LOGGER
 */
AmxRcfLogger.getLogger = function(level)
{
  if (!AmxRcfLogger._logger)
  {
    var logger = new AmxRcfLogger(level);
    AmxRcfLogger._logger = logger;
  }

  return AmxRcfLogger._logger;
};

/**
 * Returns true if messages with the specified level will be logged
 */
AmxRcfLogger.prototype.isLoggable = function(level)
{
  return (level >= this._level);
};

AmxRcfLogger.prototype.severe = function(message)
{
  if (this.isLoggable(AmxRcfLogger.SEVERE))
  {
    AmxRcfLogger.genericLog("[SEVERE]", message);
  }
};

AmxRcfLogger.prototype.warning = function(message)
{
  if (this.isLoggable(AmxRcfLogger.WARNING))
  {
    AmxRcfLogger.genericLog("[WARNING]", message);
  }
};

AmxRcfLogger.prototype.info = function(message)
{
  if (this.isLoggable(AmxRcfLogger.INFO))
  {
    AmxRcfLogger.genericLog("[INFO]", message);
  }
};

AmxRcfLogger.prototype.config = function(message)
{
  if (this.isLoggable(AmxRcfLogger.CONFIG))
  {
    AmxRcfLogger.genericLog("[CONFIG]", message);
  }
};

AmxRcfLogger.prototype.fine = function(message)
{
  if (this.isLoggable(AmxRcfLogger.FINE))
  {
    AmxRcfLogger.genericLog("[FINE]", message);
  }
};

AmxRcfLogger.prototype.finer = function(message)
{
  if (this.isLoggable(AmxRcfLogger.FINER))
  {
    AmxRcfLogger.genericLog("[FINER]", message);
  }
};

AmxRcfLogger.prototype.finest = function(message)
{
  if (this.isLoggable(AmxRcfLogger.FINEST))
  {
    AmxRcfLogger.genericLog("[FINEST]", message);
  }
};

AmxRcfLogger.genericLog = function(prefix, message)
{
  // This method should contain the ONLY native logger calls in this file
  // otherwise people are bypassing proper logger level configuration and
  // at least on iOS the log messages could be undesirably truncated:
  try
  {
    var usedPrefix = prefix + " Carousel:";

    if (!AmxRcfAgent || !AmxRcfAgent.AGENT || AmxRcfAgent.AGENT.isMobile())
    {
      var tablet = ((""+navigator.userAgent).toLowerCase().indexOf("ipad") != -1);

      // Mobile console loggers are lame and only support a single parameter:
      var logMessage = usedPrefix + " " + message;

      // Also, the Safari mobile console doesn't like more than two lines and can't be beyond a certain length.
      // (This has been observed in Safari on iOS 3, 4, 5.)
      var rawLines = logMessage.split("\n");
      var consoleLines = [];
      var maxLineLength = (tablet ? 120 : 35); // based on screen size (tablet vs. phone); assuming portrait
      for (var r = 0; r<rawLines.length; r++)
      {
        var rawLine = rawLines[r];
        if (rawLine.length > maxLineLength)
        {
          var pieces = Math.ceil(rawLine.length / maxLineLength);
          for (var p=0; p<pieces; p++)
          {
            var start = p * maxLineLength;
            consoleLines.push(rawLine.substring(start, start + maxLineLength));
          }
        }
        else
        {
          consoleLines.push(rawLine);
        }
      }

      var consoleLineCount = consoleLines.length;
      if (consoleLineCount > 1)
      {
        var messageCount = Math.ceil(consoleLineCount / 2);
        var messageNumber = 0;
        for (var i=0; i<consoleLineCount; i+=2)
        {
          var consoleMessage = "";
          if (messageCount == 1)
          {
            consoleMessage += consoleLines[i];
          }
          else
          {
            consoleMessage += "[" + (++messageNumber) + " of " + messageCount + "]: " + consoleLines[i];
          }
          if (i + 1 < consoleLineCount)
          {
            consoleMessage += "\n" + consoleLines[1+i];
          }
          AmxRcfLogger._internalLog(prefix, consoleMessage);
        }
      }
      else
      {
        AmxRcfLogger._internalLog(prefix, consoleLines[0]);
      }
    }
    else
    {
      // Using a desktop browser where any number of parameters are legal:
      AmxRcfLogger._internalLog(prefix, usedPrefix, message);
    }
  }
  catch (problem)
  {
    // Probably couldn't get the agent
    AmxRcfLogger._internalLog(prefix, usedPrefix);
    AmxRcfLogger._internalLog(prefix, message);

    AmxRcfLogger._internalLog(prefix, usedPrefix + "genericLog issue:" + problem);
  }
};

AmxRcfLogger._internalLog = function(prefix, messagePart1, messagePart2)
{
  switch (prefix)
  {
    case "[ASSERT]":
    case "[SEVERE]":
      console.error(messagePart1, messagePart2);
      break;
    case "[WARNING]":
      console.warn(messagePart1, messagePart2);
      break;
    case "[INFO]":
      console.info(messagePart1, messagePart2);
      break;
    default:
      console.log(messagePart1, messagePart2);
  }
};

AmxRcfLogger.OFF     = Number.MAX_VALUE;
AmxRcfLogger.SEVERE  = 1000;
AmxRcfLogger.WARNING = 900;
AmxRcfLogger.INFO    = 800;
AmxRcfLogger.CONFIG  = 700;
AmxRcfLogger.FINE    = 500;
AmxRcfLogger.FINER   = 400;
AmxRcfLogger.FINEST  = 300;
AmxRcfLogger.ALL     = Number.MIN_VALUE;

AmxRcfLogger.LOGGER = AmxRcfLogger.getLogger(AmxRcfLogger.WARNING);

/* ---------------------------------------------------------------------------- */
/* AmxRcfObject                                                                 */
/* ---------------------------------------------------------------------------- */

/**
 * Base class of all AMX Objects.
 * <p>
 * To create a subclass of another AmxRcfObject, use AmxRcfObject.createSubclass.
 * The subclass can specify class-level initialization by implementing an
 * <code>InitClass()</code> method on its constructor.  <code>InitClass</code>
 * is guaranteed to be called only once per class.  Further, a class'
 * <code>InitClass</code> method is guranteed to be called only after its
 * superclass' class initialization has been called.  When <code>InitClass</code>
 * is called, <code>this</code> is the class' constructor.  This allows class
 * initialization implementations to be shared in some cases.
 * </p>
 * @author Blake Sullivan
 */
function AmxRcfObject()
{
  AmxRcfObject.initClass(AmxRcfObject, "AmxRcfObject");
};

/**
 * Creates a function instance that will callback the passed in function
 * with the current "this".  This is extremely useful for creating callbacks
 */
AmxRcfObject.createInstanceCallback = function(currentThis, func)
{
  AmxRcfAssert.assertObject(currentThis);
  AmxRcfAssert.assertFunction(func);
  var funcName = func[AmxRcfAssert.FUNC_NAME_PROPERTY];

  // =-=  bts theoretically, we could call the same code we use
  //          to generate the FUNC_NAME_PROPERTY in the first place
  //          if this property isn't set/
  AmxRcfAssert.assertString(funcName);

  // create a function that sets up "this" and delegates all of the parameters
  // to the passed in function
  var proxyFunction = new Function(
    "var f=arguments.callee; return f._func.apply(f._owner, arguments);");

  // attach ourselves as "this" to the created function
  proxyFunction["_owner"] = currentThis;

  // attach function to delegate to
  proxyFunction["_func"] = func;

  return proxyFunction;
};

/**
 * Apply class and function name properties to the functions of an Object.  This
 * is used to set up the functions so that we can get accurate stack traces.
 */
AmxRcfObject._applyFunctionProperties = function(
  target,
  className)
{
  var funcNameProperty = AmxRcfAssert.FUNC_NAME_PROPERTY;
  var classNameProperty = AmxRcfAssert.CLASS_NAME_PROPERTY;

  for (currPropName in target)
  {
    var currProp = target[currPropName];

    if ((typeof currProp) == "function")
    {
      // we only care about methods defined on our object
      if (!currProp.hasOwnProperty(funcNameProperty))
      {
        currProp[funcNameProperty] = currPropName;
        currProp[classNameProperty] = className;
      }
    }
  }
};

/**
 * Perform any class-level initializtion.
 */
AmxRcfObject.initClass = function(currClass, typeName)
{
  if (!currClass._initialized)
  {
    if (AmxRcfAssert.DEBUG)
    {
      AmxRcfAssert.assert(!currClass._initialized);
    }

    currClass._initialized = true;

    // apply the stack information to our instance's instance methods
    if (typeof currClass == "function")
    {
      if (AmxRcfAssert.DEBUG)
      {
        AmxRcfAssert.assertFunction(currClass);
      }

      AmxRcfObject._applyFunctionProperties(currClass.prototype, typeName);
    }

    // apply the stack information to our class's static methods
    AmxRcfObject._applyFunctionProperties(currClass, "static " + typeName);
  }
};

/* ---------------------------------------------------------------------------- */
/* AmxRcfElementAnimator                                                        */
/* ---------------------------------------------------------------------------- */

/**
 * A peer utility that simplifies the work needed to perform DOM element animations.
 * <code>
 *   <dl>
 *     <dt><strong>Example: </strong></dt>
 *     <dd>
 *     <pre>AmxRcfElementAnimator.animate(<br>  AmxRcfElementAnimator.FRAME_METHOD_SLOW_FAST_SLOW,<br>  500,<br>  [<br>    {<br>      "element": document.getElementById("div1"),<br>      "properties":<br>      {<br>        "width": 100,<br>        "height": 200,<br>        "alpha": 0<br>      }<br>    },<br>    {<br>      "element": document.getElementById("div2"),<br>      "properties":<br>      {<br>        "width": 200,<br>        "height": 100,<br>        "alpha": 100<br>      }<br>    }<br>  ],<br>  animationFrameRenderedFunction,<br>  animationCompleteFunction,<br>  callbackParameters,<br>  amxNode);</pre>
 *     </dd>
 *   </dl>
 * </code>
 * @constructor {private} Use <code>AmxRcfElementAnimator.animate()</code> to start an animation
 *                        and get its instance.
 * @see #animate
 */
AmxRcfElementAnimator = function(
  itemState,
  duringAnimate,
  afterAnimate,
  callbackParameters,
  amxNode,
  frameMethod,
  frameCount)
{
  AmxRcfObject.initClass(AmxRcfElementAnimator, "AmxRcfElementAnimator");
  this.Init(itemState, duringAnimate,  afterAnimate, callbackParameters,
            amxNode, frameMethod, frameCount);
};

/**
 * Initialize the AmxRcfElementAnimator.
 * Use <code>AmxRcfElementAnimator.animate()</code> to start an animation and get its instance.
 * @param {Array} itemState an Array of internal details for the animation
 * @param {Function} duringAnimate the function to be executed at each processed animation frame (if
 *                                 a frame is skipped, the function won't be called); you may
 *                                 specify null if no execution is needed
 * @param {Function} afterAnimate the function to be executed after animation is complete
 *                                or null if no execution is needed
 * @param {Object} callbackParameters an optional object containing key-value pairs that will be
 *                                    passed to the duringAnimate and the afterAnimate function if
 *                                    applicable
 * @param {AmxRcfNode} amxNode the component being animated; used to ensure descendant resize
 *                          notifications get invoked after animations are complete
 * @param {Object} the <code>AmxRcfElementAnimator.FRAME_METHOD_*</code> choice for
 *                             how frames are spaced on the timeline
 * @param {Number} the number of frames that this animation has to render
 * @see #animate
 */
AmxRcfElementAnimator.prototype.Init = function(
  itemState,
  duringAnimate,
  afterAnimate,
  callbackParameters,
  amxNode,
  frameMethod,
  frameCount)
{
  this._itemState = itemState;
  this._duringAnimate = duringAnimate;
  this._afterAnimate = afterAnimate;
  this._callbackParameters = callbackParameters;
  this._amxNode = amxNode;
  this._startTime = (new Date()).getTime();
  this._frameMethod = frameMethod;
  this._frameCount = frameCount;
  //this._intervalID = undefined;
};

/**
 * Stops the animation from rendering any future frames.
 * Stopping will not invoke any more during or after animate functions associated with the animator.
 * @return {Object} the callback parameters originally passed into the animator (if provided)
 */
AmxRcfElementAnimator.prototype.stop = function()
{
  this._stopped = true;
  window.clearInterval(this._intervalID);
  var callbackParameters = this._callbackParameters;
  this._destroy();
  return callbackParameters;
};

/**
 * Runs the described animation.
 * @param {Object} frameMethod the <code>AmxRcfElementAnimator.FRAME_METHOD_*</code> choice for
 *                             how frames are spaced on the timeline
 * @param {Number} timeLength milliseconds for how long the animation will last
 * @param {Array<Object>} items an array of animation item <code>Object</code>s whose properties are:
 *                      <dl>
 *                        <dt>"element"</dt>
 *                        <dd>the element to animate</dd>
 *                        <dt>"properties"</dt>
 *                        <dd>an <code>Object</code> listing the element's properties in the desired
 *                          final state (no initial state is necessary since the element already has
 *                          such properties defined on it), valid property names are:
 *                          <dl>
 *                            <dt>"width"</dt>
 *                            <dd>a non-negative integer representing the number of pixels wide the
 *                                element is</dd>
 *                            <dt>"height"</dt>
 *                            <dd>a non-negative integer representing the number of pixels wide the
 *                                element is</dd>
 *                            <dt>"top"</dt>
 *                            <dd>an integer representing the number of pixels that
 *                                AmxRcfAgent.AGENT.getElementTop(element) returns</dd>
 *                            <dt>"left"</dt>
 *                            <dd>an integer representing the number of pixels that
 *                                AmxRcfAgent.AGENT.getElementLeft(element) returns</dd>
 *                            <dt>"offsetTop"</dt>
 *                            <dd>an integer representing the number of pixels that
 *                                element.offsetTop returns</dd>
 *                            <dt>"offsetLeft"</dt>
 *                            <dd>an integer representing the number of pixels that
 *                                element.offsetLeft returns</dd>
 *                            <dt>"scrollTop"</dt>
 *                            <dd>an integer representing the number of pixels that
 *                                element.scrollTop returns</dd>
 *                            <dt>"scrollLeft"</dt>
 *                            <dd>an integer representing the number of pixels that
 *                                element.scrollLeft returns</dd>
 *                            <dt>"alpha"</dt>
 *                            <dd>an integer between 0 and 100 (inclusive) where representing how
 *                                opaque the element is where a value of 0 means the element is
 *                                completely transparent and a value of 100 means the element is
 *                                completely opaque</dd>
 *                            <dt>"zIndex"</dt>
 *                            <dd>an integer representing a z-axis location in the positioned
 *                                element's stacking order</dd>
 *                          </dl>
 *                        </dd>
 *                      </dl>
 * @param {Function} duringAnimate the function to be executed at each processed animation frame (if
 *                                 a frame is skipped, the function won't be called); you may
 *                                 specify null if no execution is needed
 * @param {Function} afterAnimate the function to be executed after animation is complete
 *                                or null if no execution is needed
 * @param {Object} callbackParameters an optional object containing key-value pairs that will be
 *                                    passed to the duringAnimate and the afterAnimate function if
 *                                    applicable
 * @param {AmxRcfNode} amxNode the component being animated; used to ensure descendant resize
 *                          notifications get invoked after animations are complete
 * @return {AmxRcfElementAnimator} the animator that has been started (so you can stop it)
 */
AmxRcfElementAnimator.animate = function(
  frameMethod,
  timeLength,
  items,
  duringAnimate,
  afterAnimate,
  callbackParameters,
  amxNode)
{
  // compute the platform-specific initial and final state for each item
  var agent = AmxRcfAgent.AGENT;
  var itemCount = items.length;
  var itemState = new Array(itemCount);
  for (var i=0; i<itemCount; i++)
  {
    var item = items[i];
    var finalProperties = item.properties;
    var element = item.element;
    var state = {};

    // gather the "width" information if applicable
    AmxRcfElementAnimator._gatherSizeState(
      state,
      finalProperties,
      element,
      "width",
      "offsetWidth",
      "borderLeftWidth",
      "borderRightWidth");

    // gather the "height" information if applicable
    AmxRcfElementAnimator._gatherSizeState(
      state,
      finalProperties,
      element,
      "height",
      "offsetHeight",
      "borderTopWidth",
      "borderBottomWidth");

    // gather the "alpha" information if applicable
    var finalAlpha = finalProperties["alpha"];
    if ( (finalAlpha != null) && !isNaN(finalAlpha) )
    {
      var initialAlpha = element.style.opacity;
      if ( element.ownerDocument.all && (initialAlpha == null) )
      {
        try
        {
          initialAlpha = element.filters.alpha.opacity / 100;
        }
        catch (problem)
        {
          AmxRcfLogger.LOGGER.finer(problem);
        }
      }
      if ( (initialAlpha == null) || ( (""+initialAlpha) == "") )
      {
        initialAlpha = 1; // fully opaque
      }
      state["opacity"] = [ initialAlpha, finalAlpha / 100, true ];
    }

    // gather the "zIndex" information if applicable
    var finalZIndex = finalProperties["zIndex"];
    if ( (finalZIndex != null) && !isNaN(finalZIndex) )
    {
      state["zIndex"] = [ AmxRcfElementAnimator._getElementZIndex(agent, element), finalZIndex, true ];
    }

    // gather the "top" information if applicable
    var finalTop = finalProperties["top"];
    if ( (finalTop != null) && !isNaN(finalTop) )
    {
      // If a style is provide use it so that we account for absolute/relative to a container
      var styleTop = element.style.top;
      var top = (styleTop && styleTop != "auto")?parseInt(styleTop):agent.getElementTop(element);
      state["top"] = [ top, finalTop ];
    }

    // gather the "left" information if applicable
    var finalLeft = finalProperties["left"];
    if ( (finalLeft != null) && !isNaN(finalLeft) )
    {
      // If a style is provide use it so that we account for absolute/relative to a container
      var styleLeft = element.style.left;
      var left = (styleLeft && styleLeft != "auto")?parseInt(styleLeft):
                                                    agent.getElementLeft(element);
      state["left"] = [ left, finalLeft ];
    }

    // gather the "offsetTop" information if applicable
    var finalOffsetTop = finalProperties["offsetTop"];
    if ( (finalOffsetTop != null) && !isNaN(finalOffsetTop) )
    {
      state["offsetTop"] = [ element.offsetTop, finalOffsetTop ];
    }

    // gather the "left" information if applicable
    var finalOffsetLeft = finalProperties["offsetLeft"];
    if ( (finalOffsetLeft != null) && !isNaN(finalOffsetLeft) )
    {
      state["offsetLeft"] = [ element.offsetLeft, finalOffsetLeft ];
    }

    // gather the "scrollLeft" information if applicable
    var finalScrollLeft = finalProperties["scrollLeft"];
    if ( (finalScrollLeft != null) && !isNaN(finalScrollLeft) )
    {
      state["scrollLeft"] = [ element.scrollLeft, finalScrollLeft, true ];
    }

    // gather the "scrollTop" information if applicable
    var finalScrollTop = finalProperties["scrollTop"];
    if ( (finalScrollTop != null) && !isNaN(finalScrollTop) )
    {
      state["scrollTop"] = [ element.scrollTop, finalScrollTop, true ];
    }

    // "element" is the DOMElement whose state is to be altered
    // "state" is an Array with 3 entries:
    // 1.) Initial value
    // 2.) Final value
    // 3.) Boolean whether to abstain from adding "px" to the computed values (true means don't add)
    itemState[i] =
    {
      element: element,
      state: state
    };

    // We might also want to consider supporting these attributes too:
    // clip, color, backgroundColor, resize, rotate
  }

  // popuplate the frames array
  var frameCount =
    Math.max(1, Math.round(timeLength * AmxRcfElementAnimator._FRAMES_PER_MILLISECOND)); // at least 1 frame
  if (!AmxRcfElementAnimator._isAnimationEnabled())
  {
    // Animation is disabled
    frameCount = 1;
  }

  // Run the animation:
  return (new AmxRcfElementAnimator(
    itemState,
    duringAnimate,
    afterAnimate,
    callbackParameters,
    amxNode,
    frameMethod,
    frameCount))._start();
};

AmxRcfElementAnimator._getElementZIndex = function(agent, element)
{
  var style = agent.getComputedStyle(element);
  if (style)
  {
    var zIndex = style.zIndex;
    if (!isNaN(zIndex))
    {
      return zIndex;
    }
  }
  return 0;
};

AmxRcfElementAnimator._gatherSizeState = function(
  state,
  finalProperties,
  element,
  sizeKey,
  currentSizeProperty,
  borderStartKey,
  borderEndKey)
{
  var finalSize = finalProperties[sizeKey];
  if ( (finalSize != null) && !isNaN(finalSize) )
  {
    var initialSize = element[currentSizeProperty];
    // Since initialSize includes border sizes and since style sizes do no, we
    // must subtract any border sizes that may be present.
    if (element.style != null)
    {
      initialSize =
        AmxRcfElementAnimator._subtractBorderSize(initialSize, element.style[borderStartKey]);
      initialSize =
        AmxRcfElementAnimator._subtractBorderSize(initialSize, element.style[borderEndKey]);
    }
    state[sizeKey] = [ initialSize, finalSize ];
  }
};

/**
 * Starts the animation.
 */
AmxRcfElementAnimator.prototype._start = function()
{
  this._animationStepCallback = AmxRcfObject.createInstanceCallback(this, this._animationStep);
  var intervalLength = Math.floor(1 / AmxRcfElementAnimator._FRAMES_PER_MILLISECOND);
  this._intervalID = self.setInterval(this._animationStepCallback, intervalLength);
  return this;
};

AmxRcfElementAnimator.prototype._destroy = function()
{
  delete this._itemState;
  delete this._duringAnimate;
  delete this._afterAnimate;
  delete this._callbackParameters;
  delete this._amxNode;
  delete this._startTime;
  delete this._intervalID;
  delete this._animationStepCallback;
  delete this._stopped;
};

/**
 * Static animation step called by the system.
 * This is not an API.
 */
AmxRcfElementAnimator.prototype._animationStep = function()
{
  if (this._stopped || this._intervalID == null)
  {
    return;
  }

  if (this._performAfterAnimate)
  {
    window.clearInterval(this._intervalID);

    if (this._afterAnimate != null)
    {
      this._afterAnimate(this._callbackParameters);
    }

    // Animated dimension changes potentially cause descentant resize to be required.
    // This is likely something that has changed the dimensions or other aspect of layout of the
    // page.  We need to allow amxNodes that care about descendant changes to have the opportunity
    // to make adjustments if necessary.  (Just like what happens during a server-handled change,
    // e.g. a PPR.):
    if (this._amxNode)
    {
      // If the component is still connected to the DOM, notify it ancestors that its size may have
      // changed; those ancestors need to get a descendant resize notification.
      // TODO -- not currently possible with AMX
    }

    // cleanup the static variables:
    this._destroy();
    return;
  }

  var currentTime = (new Date()).getTime();
  var elapsedMillis = currentTime - this._startTime;
  var itemState = this._itemState;
  var itemCount = itemState.length;
  var frameIndex = Math.round(AmxRcfElementAnimator._FRAMES_PER_MILLISECOND * elapsedMillis);
  var frameCount = this._frameCount;
  var frameMethod = this._frameMethod;
  var isLastFrame = false;

  if (frameIndex >= frameCount - 1)
  {
    isLastFrame = true;
    // execute the after animate function on the next round
    this._performAfterAnimate = true;
  }

  // compute an operation for each item in this frame
  for (var j=0; j<itemCount; j++)
  {
    var currentItemState = itemState[j];
    var element = currentItemState.element;
    var state = currentItemState.state;
    var pValue;

    for (var x in state)
    {
      // For the last frame use the final state
      pValue = isLastFrame ? state[x][1] : AmxRcfElementAnimator._computeFrameProperty(
                                             frameIndex,
                                             parseFloat(state[x][0]),
                                             parseFloat(state[x][1]),
                                             frameMethod,
                                             frameCount);

      // Add px to the property if necessary
      if (!state[x][2])
      {
        pValue += "px";
      }
      AmxRcfElementAnimator._renderFrameProperty(element, pValue, x);
    }
  }

  var duringAnimate  = this._duringAnimate;
  // execute the during animate function
  if (duringAnimate != null)
  {
    duringAnimate(this._callbackParameters);
  }
};

AmxRcfElementAnimator._renderFrameProperty = function(element, pValue, pName)
{
  if ((pName == "opacity") && (AmxRcfAgent.AGENT.getPlatform()==AmxRcfAgent.IE_PLATFORM))
  {
    var ieOpacity = pValue * 100;
    if (ieOpacity == 1)
    {
      element.style.filter = "";
    }
    else
    {
      element.style.filter = "alpha(opacity=" + ieOpacity + ")";
    }
  }
  else if (pName == "offsetLeft")
  {
    element.style.left = pValue;
  }
  else if (pName == "offsetTop")
  {
    element.style.top = pValue;
  }
  else if (pName == "scrollLeft")
  {
    AmxRcfAgent.AGENT.scrollToPos(element, pValue, null);
  }
  else if (pName == "scrollTop")
  {
    AmxRcfAgent.AGENT.scrollToPos(element, null, pValue);
  }
  else
  {
    element.style[pName] = pValue;
  }
};

/**
 * Computes a frame property.
 */
AmxRcfElementAnimator._computeFrameProperty = function(
  frameNumber,
  initialValue,
  finalValue,
  frameMethod,
  lastFrameNumber)
{
  var time0To1 = frameNumber / lastFrameNumber; // a.k.a. percent complete
  var dist0To1; // computed below
  switch (frameMethod)
  {
    case AmxRcfElementAnimator.FRAME_METHOD_CONSTANT_SPEED:
      // dist = time for all values of time and dist
      dist0To1 = time0To1;
      break;
    case AmxRcfElementAnimator.FRAME_METHOD_ACCELERATING:
      // dist = time^2 where dist & time are in { 0 to 1 }
      dist0To1 = Math.pow(time0To1, 2);
      break;
    case AmxRcfElementAnimator.FRAME_METHOD_DECELERATING:
      // dist = 1 - (time - 1)^2 where dist & time are in { 0 to 1 }
      dist0To1 = 1 - Math.pow( (time0To1 - 1), 2 );
      break;
    case AmxRcfElementAnimator.FRAME_METHOD_SLOW_FAST_SLOW:
      // dist = (cos(time*pi + pi) + 1) / 2 where dist & time are in { 0 to 1 }
      dist0To1 = (Math.cos(time0To1*Math.PI + Math.PI) + 1) / 2;
      break;
    default:
      AmxRcfLogger.LOGGER.severe("Invalid AmxRcfElementAnimator framing method: " + frameMethod);
      dist0To1 = 1; // jump to the end
  }
  var distDelta = finalValue - initialValue;
  return initialValue + dist0To1 * distDelta;
};

AmxRcfElementAnimator._subtractBorderSize = function(value, borderWidthStyle)
{
  if ( (borderWidthStyle != null) && (borderWidthStyle != "") )
  {
    value -= parseInt(borderWidthStyle);
  }
  return value;
};

AmxRcfElementAnimator._isAnimationEnabled = function()
{
  return true;
};

AmxRcfElementAnimator._FRAMES_PER_MILLISECOND = 0.06; // 60 frames per second

// framing method constants:
AmxRcfElementAnimator.FRAME_METHOD_CONSTANT_SPEED = 0;
AmxRcfElementAnimator.FRAME_METHOD_ACCELERATING = 1;
AmxRcfElementAnimator.FRAME_METHOD_DECELERATING = 2;
AmxRcfElementAnimator.FRAME_METHOD_SLOW_FAST_SLOW = 3;

/* ---------------------------------------------------------------------------- */
/* AmxRcfAssert                                                                 */
/* ---------------------------------------------------------------------------- */

AmxRcfAssert = function()
{
};

/**
 * AmxRcfAsserts that a condition is true.  If the condition does not
 * evaluate to true, an exception is thrown with the optional message
 * and reason.
 */
AmxRcfAssert.assert = function(
  condition,
  message)
{
  if (AmxRcfAssert.DEBUG && !condition)
  {
    if (arguments.length > 2)
    {
      message += "(";
      for(var i=2; i<arguments.length; i++)
      {
        message += arguments[i];
      }
      message += ")";
    }
    AmxRcfAssert.assertionFailed(message, 1);
  }
};

/**
 * AmxRcfAssert that the target is a DOM Node.
 */
AmxRcfAssert.assertDomNode = function(target, depth)
{
  if (AmxRcfAssert.DEBUG)
  {
    if (!target)
    {
      AmxRcfAssert.assertionFailed(
        target + " is not a DOM Node",
        depth + 1);
    }
    else if (target["nodeType"] == undefined)
    {
      AmxRcfAssert.assertionFailed(
        target + " is not a DOM Node",
        depth + 1,
        "nodeType=" + target["nodeType"] + " was undefined");
    }
  }
};

/**
 * AmxRcfAsserts that the target is a DOM Element and optionally has the specified
 * element name
 */
AmxRcfAssert.assertDomElement = function(target, nodeName)
{
  if (AmxRcfAssert.DEBUG)
  {
    AmxRcfAssert.assertDomNode(target, 1);

    if (target.nodeType != 1)
    {
      AmxRcfAssert.assertionFailed(
        target + " is not a DOM Element",
        1,
        "nodeType=" + target.nodeType + " was not 1");
    }
    else if (nodeName && (target.nodeName != nodeName))
    {
      AmxRcfAssert.assertionFailed(
        target + " is not a " + nodeName + " Element",
        1,
        "nodeName=" + target.nodeName + " was not " + nodeName);
    }
  }
};

/**
 * AmxRcfAsserts that the target is a DOM Element and optionally has the specified
 * element name
 */
AmxRcfAssert.assertDomElementOrNull = function(target, nodeName)
{
  if (AmxRcfAssert.DEBUG && (target != null))
  {
    AmxRcfAssert.assertDomNode(target, 1);

    if (target.nodeType != 1)
    {
      AmxRcfAssert.assertionFailed(
        target + " is not a DOM Element",
        1,
        "nodeType=" + target.nodeType + " was not 1");
    }
    else if (nodeName && (target.nodeName != nodeName))
    {
      AmxRcfAssert.assertionFailed(
        target + " is not a " + nodeName + " Element",
        1,
        "nodeName=" + target.nodeName + " was not " + nodeName);
    }
  }
};

/**
 * AmxRcfAsserts that the target object is an Array or null
 */
AmxRcfAssert.assertArrayOrNull = function(
  target,
  message)
{
  if (AmxRcfAssert.DEBUG && (target != null))
  {
    if (!AmxRcfCollections.isArray(target))
    {
      if (message == undefined)
        message = target + " is not an array";

      AmxRcfAssert.assertionFailed(message, 1);
    }
  }
};

/**
 * AmxRcfAsserts that the target is a String
 */
AmxRcfAssert.assertString = function(target, prefix)
{
  if (AmxRcfAssert.DEBUG)
  {
    AmxRcfAssert.assertType(target, "string", prefix, 1, false);
  }
};

/**
 * AmxRcfAsserts that the the target object has the same prototype as the example
 * type
 */
AmxRcfAssert.assertPrototype = function(
  target,
  theConstructor,
  reason)
{
  if (AmxRcfAssert.DEBUG)
  {
    if (target != null)
    {
      AmxRcfAssert.assertType(theConstructor, "function", null, 1, false);
      var thePrototype = theConstructor.prototype;

      if (!thePrototype.isPrototypeOf(target))
      {
        AmxRcfAssert.assertionFailed("object '" + target + "' doesn't match prototype " + thePrototype,
                                  1,
                                  reason);
      }
    }
    else
    {
      AmxRcfAssert.assertionFailed("null object doesn't match prototype " + thePrototype, 1, reason);
    }
  }
};

/**
 * AmxRcfAsserts that the target is a Function
 */
AmxRcfAssert.assertFunction = function(target, prefix)
{
  if (AmxRcfAssert.DEBUG)
  {
    AmxRcfAssert.assertType(target, "function", prefix, 1, false);
  }
};

/**
 * AmxRcfAsserts that the target is an Object
 */
AmxRcfAssert.assertObject = function(target, prefix)
{
  if (AmxRcfAssert.DEBUG)
  {
    AmxRcfAssert.assertType(target, "object", prefix, 1, false);
  }
};

/**
 * AmxRcfAsserts that the target object has the typeof specified
 */
AmxRcfAssert.assertType = function(
  target,
  type,   // typeof type that statisfies this condition
  prefix,
  depth,  // stack depth to skip when printing stack traces
  nullOK) // true if a null value satisfies this condition
{
  if (AmxRcfAssert.DEBUG)
  {
    // either the target is null and null is OK, or the target better
    // be of the correct type
    if (!(((target == null) && nullOK) || ((typeof target) == type)))
    {
      var message = target + " is not of type " + type;

      if (prefix)
        message = prefix + message;

      if (!depth)
        depth = 0;

      AmxRcfAssert.assertionFailed(message, depth + 1);
    }
  }
};

/**
 * Base assertion failure support that supports specifying the stack skipping level.
 */
AmxRcfAssert.assertionFailed = function(
  message,
  skipLevel,
  reason)
{
  if (!skipLevel)
    skipLevel = 0;

  var errorMessage = "Assertion";

  if (reason)
  {
    errorMessage += " (" + reason + ")";
  }

  errorMessage += " failed: ";

  if (message != undefined)
  {
    errorMessage += message;
  }

  var error = new Error(errorMessage + " -- See assertion log for stack trace.");

  var stackTrace = AmxRcfAssert._getStackTrace(skipLevel + 1);

  var stackTraceString = AmxRcfAssert._getStackString(stackTrace);

  errorMessage += "\nStack Trace:\n" + stackTraceString;

  // The reason why the errorMessage isn't logged immediately to the logger is that there would be
  // a circular dependency between the logger and the assertion code.
  // As a stopgap, since the error absolutely must be reported, we will also alert the
  // errorMessage String using the standard alert mechanism until a non-circular dependency solution
  // with the logger is researched:
  alert("Carousel Assertion:\n" + errorMessage);
  AmxRcfLogger.genericLog("[ASSERT]", errorMessage);

  throw error;
};

/**
 * Returns the stack trace as an array of function callers.
 */
AmxRcfAssert._getStackTrace = function(skipLevel)
{
  if (skipLevel == undefined)
    skipLevel = 0;

  AmxRcfAssert.assert(skipLevel >= 0);

  var stackTrace = new Array();

  // crawl up starting at our caller
  try
  {
    var currCaller = AmxRcfAssert._getStackTrace.caller;

    while (currCaller && (stackTrace.length < AmxRcfAssert._MAX_STACK_DEPTH_LIMIT))
    {
      if (!skipLevel)
      {
        stackTrace.push(currCaller);
      }
      else
      {
        skipLevel--;
      }

      currCaller = currCaller.caller;
    }
  }
  catch (e)
  {
    AmxRcfLogger.genericLog("[ASSERT]", e); // can't user our own logger because it would be a circular dependency
  }

  return stackTrace;
};

AmxRcfAssert._getStackString = function(stackTrace)
{
  if (!stackTrace)
    return "";

  var functionCount = stackTrace.length;

  var stackStrings = new Array(functionCount);

  for (var stackIndex = 0; stackIndex < functionCount; stackIndex++)
  {
    var currFunction = stackTrace[stackIndex];

    var funcName = AmxRcfAssert.getFunctionName(currFunction);

    if (!funcName)
      funcName = "anonymous";

    // try to pull the class name off of the function object
    var className = currFunction[AmxRcfAssert.CLASS_NAME_PROPERTY];

    // try to pull the class name off of the function object.  If we have one,
    // prepend it to the function name
    if (className)
      funcName = className + "." + funcName;

    var funcParams = AmxRcfAssert._getFuncParams(currFunction);

    var functionArgs = currFunction.arguments;
    var argCount     = functionArgs.length;
    var argsArray    = null;

    // copy arguments into an array so that we can call join on it
    if (argCount)
    {
      // copy the entries the lame way
      argsArray = new Array(argCount);

      for (var argIndex = 0; argIndex < argCount; argIndex++)
      {
        var currArg = functionArgs[argIndex];

        if (typeof currArg == "function")
        {
          var argFuncName = AmxRcfAssert.getFunctionName(currArg);

          if (!argFuncName)
            argFuncName = "anonymous";

          var argFuncParams = AmxRcfAssert._getFuncParams(currArg);

          currArg = "function " + argFuncName + argFuncParams;
        }

        argsArray[argIndex] = currArg;
      }
    }

    // concatenate the pieces together
    var stackStringArray = new Array();

    stackStringArray[0] = funcName;
    stackStringArray[1] = funcParams;

    // add in the arguments, if any
    if (argsArray)
    {
      stackStringArray[2] = "--";
      stackStringArray[3] = "[";
      stackStringArray[4] = AmxRcfAssert._safeJoin(argsArray, ",");
      stackStringArray[5] = "]";
    }

    stackStrings[stackIndex] = stackStringArray.join("");
  }

  return stackStrings.join("\n");
};

/**
 * Returns the name of a function, or <code>null</code> if the
 * name can't be determined
 */
AmxRcfAssert.getFunctionName = function(func)
{
  // check if the function name has been stored on the function already
  var funcName = func[AmxRcfAssert.FUNC_NAME_PROPERTY];

  if (funcName == undefined)
  {
    var functionString = func.toString();
    var startFuncParamsIndex = functionString.indexOf('(');

    // back up to the first space
    var startFuncNameIndex = functionString.lastIndexOf(" ", startFuncParamsIndex);

    // the function name is contained in the portion of the function string between
    // the beginning of the function and the first "("
    funcName = functionString.substring(startFuncNameIndex + 1, startFuncParamsIndex);

    if (!funcName.length)
      funcName = null;

    // store the derived function name or null if the function
    // name can't be determined
    func[AmxRcfAssert.FUNC_NAME_PROPERTY] = funcName;
  }

  return funcName;
};

/**
 * Returns the param String for a function, or null if there are no parameters
 */
AmxRcfAssert._getFuncParams = function(func)
{
  // check if the function parameters have been stored on the function already
  var funcParams = func[AmxRcfAssert._PARAMS_NAME_PROPERTY];

  if (funcParams == undefined)
  {
    var currFunctionString = func.toString();
    var startFuncParams    = currFunctionString.indexOf('(');
    var endFuncParams      = currFunctionString.indexOf(')', startFuncParams + 1);

    funcParams = currFunctionString.substring(startFuncParams, endFuncParams + 1);

    // remove all whitespace
    funcParams = funcParams.replace(/\s+/g, "");

    if (!funcParams.length)
      funcParams = null;

    // store the derived function name or null if the function
    // parameters don't exist
    func[AmxRcfAssert._PARAMS_NAME_PROPERTY] = funcParams;
  }

  return funcParams;
};

// Joins the array elements into a single string, checking for the
// presence of toString() on each element.
AmxRcfAssert._safeJoin = function(arr, sep)
{
  var length = arr.length;
  var joinedString = "";
  for (var i = 0; i < length; i++)
  {
    var ele = arr[i];
    var str = ele ? (ele.toString ? ele.toString() : "Unknown") : "(empty)";

    // If we care about performance, we should use a string buffer
    joinedString += str;

    if (sep)
    {
      if (i < length - 1)
        joinedString += sep;
    }
  }

  return joinedString;
};

// name of property on function objects that stack dumping will look for
// the param names
AmxRcfAssert._PARAMS_NAME_PROPERTY = "_funcParams";

// name of property on function objects that stack dumping will look for
// to get the class name
AmxRcfAssert.CLASS_NAME_PROPERTY = "_className";

// maximum stack depth that we will generate a stack trace for
AmxRcfAssert._MAX_STACK_DEPTH_LIMIT = 20;

// name of property on function objects that stack dumping will look for
// to get the function name
AmxRcfAssert.FUNC_NAME_PROPERTY = "_funcName";

AmxRcfAssert.DEBUG = true;

/* ---------------------------------------------------------------------------- */
/* AmxRcfAgent                                                                  */
/* ---------------------------------------------------------------------------- */

AmxRcfAgent = function(
  domWindow,
  platform,
  os,
  version)
{
  AmxRcfObject.initClass(AmxRcfAgent, "AmxRcfAgent");
  if (platform == null)
    this.Init(AmxRcfAgent.UNKNOWN_PLATFORM, AmxRcfAgent.guessOS(), AmxRcfAgent.guessVersion(), domWindow);
  else
    this.Init(platform, os, version, domWindow);
};

/**
 * Create an instance of an AmxRcfAgent
 */
AmxRcfAgent.prototype.Init = function(
  platform,
  os,
  version,
  domWindow)
{
  if (!platform)
    platform = AmxRcfAgent.UNKNOWN_PLATFORM;

  if (!os)
    os = AmxRcfAgent.UNKNOWN_OS;

  this._platform = platform;
  this._os = os;
  this._version = version;

  // Stash away the window and the document
  this._window = domWindow;
  this._document = domWindow.document;

  // initialize default capabilites
  var c = this._capabilities = {};
  c[AmxRcfAgent.CAP_TOUCH_SCREEN] = AmxRcfAgent.CAP_TOUCH_SCREEN_NONE;
};

/**
 * @param {Window} domWindow DOM Window object to use to determine the Agent to use
 * @return {AmxRcfAgent} AmxRcfAgent instance to use for this User Agent
 * @see #AGENT
 */
AmxRcfAgent.getAgent = function(domWindow)
{
  if (domWindow != null)
  {
    // If domWindow is non-null, assume we want to re-create the
    // agent instance.
    AmxRcfAgent._agent = null;
  }

  if (!AmxRcfAgent._agent)
  {
    // domWindow should never be null when initializing the
    // agent instance
    AmxRcfAssert.assert(domWindow != null);

    var agentName = navigator.userAgent.toLowerCase();

    var agent;
    var version;

    // check opera first, since it likes to claim its mozilla and msie
    try
    {
      if(agentName.indexOf("opera")!=-1)
      {
        if (AmxRcfAgent._checkAgentSupport)
          alert(AmxRcfAgent._UNSUPPORTED_BROWSER_ALERT);
        agent = new AmxRcfAgent(domWindow);
      }
      else if (agentName.indexOf("msie")!=-1)
      {
        if (AmxRcfAgent._checkAgentSupport)
          alert(AmxRcfAgent._UNSUPPORTED_BROWSER_ALERT);
        agent = new AmxRcfAgent(domWindow);
      }
      else if ((agentName.indexOf("applewebkit")!=-1)||
               (agentName.indexOf("safari")!=-1))
      {
        // Mac Desktop:
        // Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_5_3; en-us) AppleWebKit/525.18 (KHTML, like Gecko) Version/3.1.1 Safari/525.20
        // Windows Desktop:
        // Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.18 (KHTML, like Gecko) Version/3.1.1 Safari/525.17
        // iPod Touch:
        // Mozilla/5.0 (iPod; U; CPU like Mac OS X; en) AppleWebKit/420.1 (KHTML, like Gecko) Version/3.0 Mobile/3A110a Safari/419.3
        // iPhone:
        // Mozilla/5.0 (iPhone; U; CPU like Mac OS X; en) AppleWebKit/420.1 (KHTML, like Gecko) Version/3.0 Mobile/4A102 Safari/419.3

        // According to the spec:
        // If you need to detect the version of the browser accessing your site, use the
        // AppleWebKit/XX portion of the user-agent string.
        // A given build version of WebKit, the rendering and JavaScript engine embedded in Safari,
        // provides consistent site compatibility in Safari or any third party application embedding
        // WebKit to render page content.
        // WebKit version numbers may contain a minor version and possibly a sub-version number as
        // well:
        // For example: AppleWebKit/125.5.5 or AppleWebKit/125.3 or AppleWebKit/125
        version = AmxRcfAgent._parseFloatVersion(agentName, /applewebkit\/(\d+([.]\d+)*)/);
        if (agentName.indexOf("mobile") == -1  &&  agentName.indexOf("android") == -1)
        {
          agent = new AmxRcfAgent(domWindow, AmxRcfAgent.WEBKIT_PLATFORM, AmxRcfAgent.guessOS(), version);
        }
        else
        {
          agent = new AmxRcfAgent(domWindow, AmxRcfAgent.WEBKIT_PLATFORM, AmxRcfAgent.guessOS(), version);
          agent._mobile = true;

          // grab the base capabilites
          var c = agent.getCapabilities();

          // override the "touchScreen" capability
          // iOS supports multiple finger touch, but the Android only supports one finger
          c[AmxRcfAgent.CAP_TOUCH_SCREEN] =
            agent.getOS() == AmxRcfAgent.ANDROID_OS ?
              AmxRcfAgent.CAP_TOUCH_SCREEN_SINGLE : AmxRcfAgent.CAP_TOUCH_SCREEN_MULTIPLE;

          AmxRcfAgent._REDISTRIBUTE_BUBBLE_EVENTS = ["touchstart", "touchmove", "touchend", "touchcancel"];
        }

        // We only check for unsupported agents once per session.
        if (AmxRcfAgent._checkAgentSupport && (version < 525.18))
        {
          // Google Chrome's first beta is using a slightly older version of WebKit.
          // As a temporary workaround, we will abstain from the version being unsupported only if
          // we can tell it is chrome and we should get rid of this special case once it comes out
          // of bet or at least uses a more supportable version of WebKit:
          if (version < 525.18 && agentName.indexOf("chrome/")!=-1)
          {
            // Using Google Chrome
          }
          else
          {
            alert(AmxRcfAgent._UNSUPPORTED_BROWSER_ALERT);
          }
        }
      }
      else if(agentName.indexOf("gecko/")!=-1)
      {
        if (AmxRcfAgent._checkAgentSupport)
          alert(AmxRcfAgent._UNSUPPORTED_BROWSER_ALERT);
        agent = new AmxRcfAgent(domWindow);
      }
      else if (!agent)
      {
        if (AmxRcfAgent._checkAgentSupport)
          alert(AmxRcfAgent._UNSUPPORTED_BROWSER_ALERT);
        agent = new AmxRcfAgent(domWindow);
      }

      AmxRcfAgent._agent = agent;
    }
    catch (e)
    {
      AmxRcfLogger.LOGGER.severe("Unable to initialize AmxRcfAgent: " + e);
      AmxRcfAgent._agent = new AmxRcfAgent(domWindow);
    }
  }

  return AmxRcfAgent._agent;
};

AmxRcfAgent.prototype.isMobile = function()
{
  return (true == this._mobile);
};

// Parses the float version out of of the specified agent string using
// a regular expression to identify the version portion of the string.
AmxRcfAgent._parseFloatVersion = function(agentName, versionNumberPattern)
{
  var matches = agentName.match(versionNumberPattern);

  if (matches)
  {
    var versionString = matches[1];

    if (versionString)
      return parseFloat(versionString);
  }

  return undefined;
};

/**
 * Returns a "map" of capabilites that the browser supports.  There is currently only one
 * capability populated in this map, "touchScreen".  The {@link AmxRcfAgent#CAP_TOUCH_SCREEN}
 * capability supports the following enumerations:
 * <ul>
 *   <li>{@link AmxRcfAgent#CAP_TOUCH_SCREEN_MULTIPLE} - device supports 2 fingure gestures.</li>
 *   <li>{@link AmxRcfAgent#CAP_TOUCH_SCREEN_SINGLE} - device supports 1 finger gestures.</li>
 *   <li>{@link AmxRcfAgent#CAP_TOUCH_SCREEN_NONE} - does not support touch events.</li>
 * </ul>
 *
 * @return {Object} of capabilites that the agent supports
 */
AmxRcfAgent.prototype.getCapabilities = function()
{
  return this._capabilities;
};

/**
 * Identifies the user agent (browser).  The resultant will be one of the
 * following constants:
 * <ul>
 *   <li>{@link AmxRcfAgent#IE_PLATFORM}</li>
 *   <li>{@link AmxRcfAgent#GECKO_PLATFORM}</li>
 *   <li>{@link AmxRcfAgent#WEBKIT_PLATFORM}</li>
 *   <li>{@link AmxRcfAgent#OPERA_PLATFORM}</li>
 *   <li>{@link AmxRcfAgent#UNKNOWN_PLATFORM}</li>
 * </ul>
 * @return {string} constant identifying the user agent (browser)
 * @see #getVersion()
 * @see #atLeast(platform, version)
 */
AmxRcfAgent.prototype.getPlatform = function()
{
  return this._platform;
};

AmxRcfAgent.prototype.getOS = function()
{
  return this._os;
};

/**
 * Guess the OS of the agent
 * @return {String} One of
 * <ul>
 *   <li><code>AmxRcfAgent.WINDOWS_OS</code></li>
 *   <li><code>AmxRcfAgent.SOLARIS_OS</code></li>
 *   <li><code>AmxRcfAgent.MAC_OS</code></li>
 *   <li><code>AmxRcfAgent.ANDROID_OS</code></li>
 *   <li><code>AmxRcfAgent.UNKNOWN_OS</code></li>
 * </ul>
 */
AmxRcfAgent.guessOS = function()
{
  var agentName = navigator.userAgent.toLowerCase();

  if (agentName.indexOf('win')!= -1)
  {
    return AmxRcfAgent.WINDOWS_OS;
  }
  else if (agentName.indexOf('mac') != -1)
  {
    return AmxRcfAgent.MAC_OS;
  }
  else if (agentName.indexOf('sunos') != -1)
  {
    return AmxRcfAgent.SOLARIS_OS;
  }
  else if (agentName.indexOf('android') != -1)
  {
    return AmxRcfAgent.ANDROID_OS;
  }
};

/**
 * Guess the version of the agent
 * @return {Number} Floating point version of the user agent's version
 */
AmxRcfAgent.guessVersion = function()
{
  return parseFloat(navigator.appVersion);
};

/**
 * @return {number} numeric representation of the first two digits of the platforms version.
 * @see #getPlatform()
 * @see #atLeast(platform, version)
 */
AmxRcfAgent.prototype.getVersion = function()
{
  return this._version;
};

AmxRcfAgent.prototype.getDomWindow = function()
{
  return this._window;
};

AmxRcfAgent.prototype.getDomDocument = function()
{
  return this._document;
};

/**
 * Returns the element's left side in Window coordinates.
 */
AmxRcfAgent.prototype.getElementLeft = function(element) // TODO use adf.mf.internal.amx.getElementLeft
{
  if (this.getPlatform() == AmxRcfAgent.WEBKIT_PLATFORM)
    return this._webkitGetElementLeft(element);
  return this._baseGetElementLeft(element);
};

AmxRcfAgent.prototype._baseGetElementLeft = function(element)
{
  AmxRcfAssert.assertDomNode(element);

  var bodyElement = element.ownerDocument.body;
  var currParent  = element.offsetParent;
  var currLeft    = element.offsetLeft;

  while (currParent)
  {
    element = currParent;
    currLeft += element.offsetLeft;

    if(element != bodyElement)
      currLeft -= element.scrollLeft;

    currParent = currParent.offsetParent;
  }

  return currLeft;
};

AmxRcfAgent.prototype._webkitGetElementLeft = function(element)
{
  AmxRcfAssert.assertDomElement(element);

  // getBoundingClientRect was added in safari 4, webkit version 533
  // just look for the API versus the version
  if (!element.getBoundingClientRect)
    return this._baseGetElementLeft(element);

  var boundingRect = element.getBoundingClientRect();
  var elemLeft = boundingRect.left;
  var docElement = element.ownerDocument.documentElement;

  // adjust for the document scroll positions and window borders
  elemLeft -= (docElement.clientLeft - this.getBrowserViewportScrollLeft());
  return elemLeft;
};

/**
 * Returns the element's top side in Window coordinates.
 */
AmxRcfAgent.prototype.getElementTop = function(element) // TODO use adf.mf.internal.amx.getElementTop
{
  if (this.getPlatform() == AmxRcfAgent.WEBKIT_PLATFORM)
    return this._webkitGetElementTop(element);
  return this._baseGetElementTop(element);
};

AmxRcfAgent.prototype._baseGetElementTop = function(element)
{
  AmxRcfAssert.assertDomNode(element);

  var bodyElement = element.ownerDocument.body;
  var currParent  = element.offsetParent;
  var currTop     = element.offsetTop;

  //In safari/opera position absolute incorrectly account for body offsetTop
  if (this.getComputedStyle(element).position == "absolute")
  {
    currTop -= bodyElement.offsetTop;
  }

  while (currParent)
  {
    element = currParent;
    currTop += element.offsetTop;

    if(element != bodyElement)
      currTop -= element.scrollTop;

    currParent = currParent.offsetParent;
  }

  return currTop;
};

AmxRcfAgent.prototype._webkitGetElementTop = function(element)
{
  AmxRcfAssert.assertDomElement(element);

  // getBoundingClientRect was added in safari 4, webkit version 533
  // just look for the API versus the version
  if (!element.getBoundingClientRect)
    return this._baseGetElementTop(element);

  var boundingRect = element.getBoundingClientRect();
  var elemTop = boundingRect.top;
  var docElement = element.ownerDocument.documentElement;

  // adjust for the document scroll positions and window borders
  elemTop -= (docElement.clientTop - this.getBrowserViewportScrollTop());
  return elemTop;
};

/**
 * @return {Number} returns the starting position on the canvas of the viewport
 */
AmxRcfAgent.prototype.getBrowserViewportScrollLeft = function() // TODO use adf.mf.internal.amx.getBrowserViewportScrollLeft
{
  if (this.getPlatform() == AmxRcfAgent.WEBKIT_PLATFORM)
    return this._webkitGetBrowserViewportScrollLeft();
  return this._baseGetBrowserViewportScrollLeft();
};

AmxRcfAgent.prototype._baseGetBrowserViewportScrollLeft = function()
{
  var domDoc = this.getDomDocument();
  var docElement = domDoc.documentElement;
  return docElement.scrollLeft;
};

AmxRcfAgent.prototype._webkitGetBrowserViewportScrollLeft = function()
{
  var domDoc = this.getDomDocument();
  return domDoc.body.scrollLeft;
};

/**
 * @return {Number} returns the top position on the canvas the viewport begins
 */
AmxRcfAgent.prototype.getBrowserViewportScrollTop = function() // TODO use adf.mf.internal.amx.getBrowserViewportScrollTop
{
  if (this.getPlatform() == AmxRcfAgent.WEBKIT_PLATFORM)
    return this._webkitGetBrowserViewportScrollTop();
  return this._baseGetBrowserViewportScrollTop();
};

AmxRcfAgent.prototype._baseGetBrowserViewportScrollTop = function()
{
  var domDoc = this.getDomDocument();
  var docElement = domDoc.documentElement;
  return docElement.scrollTop;
};

AmxRcfAgent.prototype._webkitGetBrowserViewportScrollTop = function()
{
  var domDoc = this.getDomDocument();
  return domDoc.body.scrollTop;
};

/**
 * Scrolls the element to the specified position (in pixels).
 * @param element The element to be scrolled
 * @param posX    The integer representing the X position to scroll to.
 * @param posY    The integer representing the Y position to scroll to.
 */
AmxRcfAgent.prototype.scrollToPos = function(
  element,
  posX,
  posY)
{
  if(posY != null)
    element.scrollTop = posY;
  if(posX != null)
    element.scrollLeft = posX;
};

/**
 * Tries to return the current style, taking into account the inline styles and style sheets.
 * @param {HTMLElement} element the element in question
 * @return {Object} the style computed style object
 */
AmxRcfAgent.prototype.getComputedStyle = function(element) // TODO use adf.mf.internal.amx.getComputedStyle
{
  return element.ownerDocument.defaultView.getComputedStyle(element, null);
};

/**
 * sets opacity of a DOM element
 * @param element         The element to set opacity for
 * @param opacityPercent  opacity percentage
 */
AmxRcfAgent.prototype.setOpacity = function(
  element,
  opacityPercent)
{
  element.style.opacity = (opacityPercent / 100);
};

AmxRcfAgent.prototype.getAttribute = function (node, attrName)
{
  return node.getAttribute(attrName);
};

/**
 * Returns the attribute value as an integer (if possible).
 *
 * Method will return the defaultValue (or null if a default is not specified)
 * if the attribute is not set or its value cannot be converted into an integer.
 * In the latter case, a warning is logged to indicate that the user is trying
 * to extract an integer from something that isn't an integer.
 *
 * @param element       the dom node
 * @param attrName      the name of the attribute to look up
 * @param defaultValue  the default value
 */
AmxRcfAgent.prototype.getIntAttribute = function(
  element,
  attrName,
  defaultValue)
{
  AmxRcfAssert.assertDomElement(element);

  if (defaultValue == undefined)
    defaultValue = null;

  if (element.hasAttribute(attrName))
  {
    var value = element.getAttribute(attrName);
    value = parseInt(value, 10);
    if (isNaN(value))
    {
      value = defaultValue;
      AmxRcfLogger.LOGGER.warning("The value of attribute named ",
                               attrName,
                               " cannot be converted into an integer.");
    }
  }
  else
  {
    value = defaultValue;
  }

  return value;
};

/**
 * Returns the attribute value as a boolean (if possible).
 *
 * This method will return true if the attribute value string is
 * equal to "true" or will return false if the attribute is equal to "false".
 *
 * The method will return the defaultValue (or null, if a default is not
 * specified) if the attribute is not set or if the attribute value is not
 * either the string "true" or the string "false".  In the latter case, an
 * warning is logged to indicate that the user is trying to extract a boolean
 * from something that isn't an integer.
 *
 * @param element       the dom node
 * @param attrName      the name of the attribute to look up
 * @param defaultValue  the default value
 */
AmxRcfAgent.prototype.getBooleanAttribute = function(
  element,
  attrName,
  defaultValue)
{
  AmxRcfAssert.assert(element);

  if (defaultValue == undefined)
    defaultValue = null;

  var value = element.getAttribute(attrName);

  if (value == null)
    value = defaultValue;
  else if (value == "true")
    value = true;
  else if (value == "false")
    value = false;
  else
  {
    value = defaultValue;
    AmxRcfLogger.LOGGER.warning("The value of attribute named ",
                             attrName,
                             " cannot be converted into a boolean.");
  }

  return value;
};

AmxRcfAgent.prototype.setAttribute = function(
  element,
  attrName,
  attrValue)
{
//  element.setAttribute(attrName, attrValue);
// Gecko-specific?
  var propValue = element[attrName];
  if (propValue == undefined ||
      typeof(propValue) != "boolean" ||
      attrValue != "false")
  {
    element.setAttribute(attrName, attrValue);
  }
};

/**
 * Cover function to allow more performant implementations of document.getElementById()
 * @see #elementsRemoved
 * @see #elementsAdded
 */
AmxRcfAgent.prototype.getElementById = function(id, treeRoot)
{
  if (treeRoot != null)
    return AmxRcfDomUtils.getElementByIdInSubtree(treeRoot, id);

  // by default, assume the getElementById() works fine
  var elem = this._document.getElementById(id);
  AmxRcfAssert.assertDomElement(elem);
  return elem;
};

AmxRcfAgent.prototype.getEventTarget = function(event)
{
  if (this.getPlatform() == AmxRcfAgent.WEBKIT_PLATFORM && this.isMobile())
    return this._webkitMobileGetEventTarget(event);
  return this._baseGetEventTarget(event);
};

AmxRcfAgent.prototype._baseGetEventTarget = function(event)
{
  // standard dom mechanism for capturing events
  return event.target;
};

/**
 * Override transparently handles touch events.  It also searches for the nearest HTMLElement returning that
 * as the event target if the actual target is a text node.  On the Webkit mobile browsers the target may be
 * a text node but we assume an HTMLElement throughout the framework.
 *
 * @param {Event} event native DOM event
 * @return {HTMLElement} target established for the event
 * @override
 * @see AmxRcfDomUtils#getElement
 */
AmxRcfAgent.prototype._webkitMobileGetEventTarget = function(event)
{
  var result = null;

  var type = event.type;
  if (AmxRcfCollections.indexOf(AmxRcfAgent._REDISTRIBUTE_BUBBLE_EVENTS, type) > -1)
  {
    var touch = this._webkitGetFirstTouch(event);
    if (touch)
    {
      result = touch.target;
    }
  }

  if (!result)
  {
    result = this._baseGetEventTarget(event);
  }

  // On the mobile webkit browsers, the target may be a text node, but the JavaScript code
  // was written in assuming the desktop behavior, that the target of an event is always an
  // HTMLElement. Therefore, instead of fixing all the places that get the event target and assume
  // it is an element, we just get the element for the node here so that the rest of the code
  // may be shielded from the difference in the browser behavior.
  return result != null ? AmxRcfDomUtils.getElement(result) : null;
};

AmxRcfAgent.prototype.eatEvent = function(evt)
{
  this.stopPropagation(evt);
  this.preventDefault(evt);
};

AmxRcfAgent.prototype.stopPropagation = function(evt)
{
  evt.stopPropagation();
};

AmxRcfAgent.prototype.preventDefault = function(evt)
{
  if (this.getPlatform() == AmxRcfAgent.WEBKIT_PLATFORM && this.isMobile())
    this._webkitMobilePreventDefault(evt);
  this.basePreventDefault(evt);
};

AmxRcfAgent.prototype.basePreventDefault = function(evt)
{
  evt.preventDefault();
};

/**
 * Agent call to prevent the default behavior of the native event.  This override captures if a touchstart
 * or touchend event is prevented.  It uses that indicator to filter out rogue simulated native events
 * that follow out of sequence.
 * @param {Event} evt native event
 * @return {void}
 * @override
 */
AmxRcfAgent.prototype._webkitMobilePreventDefault = function(evt)
{
  this.basePreventDefault(evt);

  var nativeType = evt.type;
  if (nativeType == "touchstart" ||
      nativeType == "touchend")
  {
    //AmxRcfLogger.LOGGER.severe("preventDefault force touch end: ", nativeType);
    this._isWithinTouchEventsSequence = false;
  }
};

AmxRcfAgent.prototype.isLeftButton = function(evt)
{
  if (this.getPlatform() == AmxRcfAgent.WEBKIT_PLATFORM && this.isMobile())
    return this._webkitMobileIsLeftButton(evt);
  return this._baseIsLeftButton(evt);
};

AmxRcfAgent.prototype._baseIsLeftButton = function(evt)
{
  return evt.button==0;
};

/**
 * @override
 */
AmxRcfAgent.prototype._webkitMobileIsLeftButton = function(evt)
{
  var _WEBKIT_MOBILE_NATIVE_TO_COMPONENT_MAPPINGS =
  {
    "touchstart":   true,
    "touchmove":    true,
    "touchend":     true,
    "touchcancel":  true
  };

  // If the event is a touch event, then consider the touch a left-button.
  return this._baseIsLeftButton(evt) ||
    _WEBKIT_MOBILE_NATIVE_TO_COMPONENT_MAPPINGS[evt.type] != null;
};

/**
 * Returns event's mouse coordinates relative to the document
 * @param evt event object
 * @return an object with two properties (x for the left coordinate and y for
 * the top coordinate)
 */
AmxRcfAgent.prototype.getMousePosition = function(evt)
{
  if (this.getPlatform() == AmxRcfAgent.WEBKIT_PLATFORM && this.isMobile())
    return this._webkitMobileGetMousePosition(evt);
  return this._baseGetMousePosition(evt);
};

AmxRcfAgent.prototype._baseGetMousePosition = function(evt)
{
  // Use event.pageX and event.pageY, so coordidanes are relative to the document.
  // Holds true for the Gecko, Safari and Opera 6.0+
  return {x:evt.pageX, y:evt.pageY};
};

/**
 * Returns events mouse coordinates relative to the document.  Adds support for touch
 * events.
 *
 * @param {Event} evt native event object
 * @return {Object} an object with two properties (x for the left coordinate and y for the top coordinate)
 * @override
 **/
AmxRcfAgent.prototype._webkitMobileGetMousePosition = function(evt)
{
  var type = evt.type;
  if (AmxRcfCollections.indexOf(AmxRcfAgent._REDISTRIBUTE_BUBBLE_EVENTS, type) > -1)
  {
    var touch = this._webkitGetFirstTouch(evt);
    return {x:touch.clientX, y:touch.clientY};
  }

  // Use event.pageX and event.pageY, so coordidanes are relative to the document.
  // Holds true for the Gecko, Safari and Opera 6.0+
  return this._baseGetMousePosition(evt);
};

/**
 * Get the first Touch object from a touch event.
 * @param {TouchEvent} evt the native touch event
 * @return {Touch} the first native touch object if present, otherwise null.
 */
AmxRcfAgent.prototype._webkitGetFirstTouch = function(evt)
{
  if (evt.changedTouches && evt.changedTouches.length)
  {
    return evt.changedTouches[0];
  }
  else if (evt.targetTouches && evt.targetTouches.length)
  {
    return evt.targetTouches[0];
  }
  else if (evt.touches && evt.touches.length)
  {
    return evt.touches[0];
  }

  return null;
};

/**
 * Disable the user's ability to select text in this component
 */
AmxRcfAgent.prototype.disableUserSelect = function(element)
{
  if (this.getPlatform() == AmxRcfAgent.WEBKIT_PLATFORM)
    return this._webkitDisableUserSelect(element);
  return this._baseDisableUserSelect(element);
};

AmxRcfAgent.prototype._baseDisableUserSelect = function(element)
{
  // do nothing
};

AmxRcfAgent.prototype._webkitDisableUserSelect = function(element)
{
  element.style.setProperty('-webkit-user-select','none');
};

/**
 * Static callback handler for consuming a blocked event
 */
AmxRcfAgent.eatEventCallback = function(event)
{
  var agent = AmxRcfAgent.AGENT;
  var targetEvent = (event !=null ? event : agent.getDomWindow().event);

  if (targetEvent)
  {
    // call with the correct instance
    agent.eatEvent(targetEvent);
  }

  return false;
};

/**
 * AmxRcfAgent OS constants
 */
AmxRcfAgent.WINDOWS_OS = "Windows";
AmxRcfAgent.SOLARIS_OS = "Solaris";
AmxRcfAgent.MAC_OS = "Mac";
AmxRcfAgent.UNKNOWN_OS = "Unknown";
AmxRcfAgent.ANDROID_OS = "Android";

/**
 * AmxRcfAgent Platform constants
 */
AmxRcfAgent.IE_PLATFORM = "ie";
AmxRcfAgent.GECKO_PLATFORM = "gecko";
AmxRcfAgent.WEBKIT_PLATFORM = "webkit";
AmxRcfAgent.OPERA_PLATFORM = "opera";
AmxRcfAgent.UNKNOWN_PLATFORM = "unknown";

/*
 * AmxRcfAgent capabilities contstants
 */
AmxRcfAgent.CAP_TOUCH_SCREEN = "touchScreen";
AmxRcfAgent.CAP_TOUCH_SCREEN_NONE = "none";
AmxRcfAgent.CAP_TOUCH_SCREEN_SINGLE = "single";
AmxRcfAgent.CAP_TOUCH_SCREEN_MULTIPLE = "multiple";

AmxRcfAgent._checkAgentSupport = true;
AmxRcfAgent._UNSUPPORTED_BROWSER_ALERT = "You are using an unsupported browser.";
AmxRcfAgent.AGENT = AmxRcfAgent.getAgent(window);

/* ---------------------------------------------------------------------------- */
/* AmxRcfLocaleContext                                                          */
/* ---------------------------------------------------------------------------- */

/**
 * Base locale context class.
 * Provides utilities such as bi-directional management and other i18n support.
 */
function AmxRcfLocaleContext()
{
  AmxRcfObject.initClass(AmxRcfLocaleContext, "AmxRcfLocaleContext");
  this.Init();
};

AmxRcfLocaleContext.prototype.Init = function()
{
  var domDocument = AmxRcfAgent.AGENT.getDomDocument();
  this._locale = domDocument.documentElement.lang;

  // the document element (the HTML tag) declares the BIDI mode:
  this._rightToLeft = (domDocument.documentElement.dir == "rtl");

  if (this._rightToLeft)
  {
    this._alignBegin = "right";
    this._alignEnd = "left";
  }
  else // left-to-right
  {
    this._alignBegin = "left";
    this._alignEnd = "right";
  }
};

AmxRcfLocaleContext.prototype.getLocale = function()
{
  return this._locale;
};

AmxRcfLocaleContext.prototype.isRightToLeft = function()
{
  return this._rightToLeft;
};

/**
 * Retrieves the alignment value for "beginning" alignment.
 * For example, in left-to-right, this is "left".
 */
AmxRcfLocaleContext.prototype.getAlignBegin = function()
{
  return this._alignBegin;
};

/**
 * Retrieves the alignment value for "ending" alignment.
 * For example, in left-to-right, this is "right".
 */
AmxRcfLocaleContext.prototype.getAlignEnd = function()
{
  return this._alignEnd;
};

/* ---------------------------------------------------------------------------- */
/* AmxRcfCollections                                                            */
/* ---------------------------------------------------------------------------- */

/**
 * Utilities for working with collections
 */
AmxRcfCollections = function()
{
};

/**
 * Returns true if the object is an Array
 */
AmxRcfCollections.isArray = function(array)
{
  if (array)
  {
    return Array.prototype.isPrototypeOf(array);
  }

  return false;
};

/**
 * Returns the index of the object in the array, or -1 if the array does not
 * contain the object
 */
AmxRcfCollections.indexOf = function(
  array,
  object)
{
  AmxRcfAssert.assertArrayOrNull(array);

  if (!array)
    return -1;

  var index = -1;
  var arraySize = array.length;

  for (var i=0; i < arraySize; i++)
  {
    if (array[i] == object)
    {
      index = i;
      break;
    }
  }

  return index;
};

/**
 * Copies all of the properties of source into target and return the target
 */
AmxRcfCollections.copyInto = function(
  target,
  source,
  keyConverter)
{
  if (target && source && (target !== source))
  {
    for (var k in source)
    {
      var targetKey;

      // allow the key mapping to be overridden
      if (keyConverter)
      {
        targetKey = keyConverter(k);
      }
      else
      {
        targetKey = k;
      }

      try
      {
        target[targetKey] = source[k];
      }
      catch (e)
      {
        AmxRcfLogger.LOGGER.finer(e); // consume errors caused by read-only properties
      }
    }
  }

  return target;
};

AmxRcfObject.initClass(AmxRcfCollections, "AmxRcfCollections");

/* ---------------------------------------------------------------------------- */
/* AmxRcfStrings                                                                */
/* ---------------------------------------------------------------------------- */

/**
 * Holder of commonly used string constants
 * @export
 */
AmxRcfStrings = function()
{
};

/**
 * Return a String with initial upper cases
 */
AmxRcfStrings.initUpperCase = function(inString)
{
  // handle empty string and null
  if (!inString)
    return inString;

  var firstChar = inString.charAt(0);
  var upperFirstChar = firstChar.toUpperCase();

  // no change in casing, so return inSting
  return (firstChar == upperFirstChar)
           ? inString
           : upperFirstChar + inString.substr(1);
};

/**
 * Given a String, returns a new String in the constant style with
 * the String in uppercase and camel-cased words separated by underscores.
 * For example <code>mouseMove</code> becomes <code>MOUSE_MOVE</code>.
 */
AmxRcfStrings.createConstantName = function(inString)
{
  // place underscorees before existing uppercase letters
  // =-= bts not exactly the most NLS-compliant way of doing this
  var constantString = inString.replace(AmxRcfStrings._CONSTANT_REGEXP, AmxRcfStrings._REPLACE_PATTERN);
  constantString = constantString.toUpperCase();

  return constantString;
};

AmxRcfStrings._CONSTANT_REGEXP = /([A-Z])/g;
AmxRcfStrings._REPLACE_PATTERN = "_$1";

AmxRcfObject.initClass(AmxRcfStrings, "AmxRcfStrings");

/* ---------------------------------------------------------------------------- */
/* AmxRcfUIComponent                                                            */
/* ---------------------------------------------------------------------------- */

/**
 * AmxRcfUIComponent base class
 * @author Blake Sullivan
 */
function AmxRcfUIComponent(componentType)
{
  AmxRcfObject.initClass(AmxRcfUIComponent, "AmxRcfUIComponent");
};

AmxRcfUIComponent.PROPAGATE_NEVER = 2;

/* ---------------------------------------------------------------------------- */
/* AmxRcfRichUIPeer                                                             */
/* ---------------------------------------------------------------------------- */

AmxRcfRichUIPeer = function()
{
};

/**
 * Convenience function for creating a sub ID for finding marked children of a peer
 * @param {String} clientId The clientId of the peer's component
 * @param {String} name The identifier to use for the subpiece
 * @return {String} The generated sub ID
 */
AmxRcfRichUIPeer.createSubId = function(
 clientId,
 name)
{
  AmxRcfAssert.assert(clientId != null, "Must have a clientId to generate a subId.");
  AmxRcfAssert.assert(name != null, "Must have a name to generate a subId.");
  var subIdArray = AmxRcfRichUIPeer._CREATE_SUB_ID_ARRAY;
  subIdArray[0] = clientId;
  subIdArray[2] = name;

  return subIdArray.join("");
};

// array used to create sub id's efficiently
AmxRcfRichUIPeer._CREATE_SUB_ID_ARRAY = new Array(null, "::", null);

// state style classes that are used globally as composite styles, which
// means they are on the same dom element as another style class, and to
// style that element, you'd say .foo.p_AMXDisabled {background-color:gray}
AmxRcfRichUIPeer.DISABLED_STYLECLASS = 'p_AMXDisabled';

AmxRcfObject.initClass(AmxRcfRichUIPeer, "AmxRcfRichUIPeer");

/* ---------------------------------------------------------------------------- */
/* AmxRcfFocusUtils                                                             */
/* ---------------------------------------------------------------------------- */

AmxRcfFocusUtils = function()
{
};

/**
 * Sets focus to element
 * @param {HTMLElement} element the DOM element to focus.
 */
AmxRcfFocusUtils.focusElement = function(element)
{
  AmxRcfAssert.assertDomElement(element);
  try
  {
    // first lets activate the element so that it is the currently active element
    if (element.setActive)
      element.setActive();

    element.focus();
  }
  catch(e)
  {
    AmxRcfLogger.LOGGER.finer(e);
  }
};

/**
 * returns the next focusable element after element inside contextElement
 * if no contextElement is given the ownerdocument of element will be the context
 * when element is the last focusable element inside the context
 * the method will return undefined
 * when optional parameter startOutside is true the next tabstop won't be in element
 */
AmxRcfFocusUtils.getNextTabStop = function(element, contextElement, startOutside)
{
  // Delegate to AmxRcfDomUtils.getNextElementMatch(), using AmxRcfFocusUtils.isTabStop()
  // as the match function.
  return AmxRcfDomUtils.getNextElementMatch(element,
                                         contextElement,
                                         startOutside,
                                         AmxRcfFocusUtils.isTabStop);
};

/**
 * isTabStop determines whether the HTML element el is a tab-stop in the current
 * state of the page.
 * @param element the element to check
 * @returns true if el is a tabstop
 */
AmxRcfFocusUtils.isTabStop = function(el)
{
  // The call to isFocusable() is last in this if statement since it is the most potentially
  // expensive call (since it uses computed styles which are known to be slow in Firefox).
  // This will avoid some calls if the statement can be short-circuited by the earlier clauses.
  return ((el != null) && (el.tabIndex > -1) && AmxRcfFocusUtils.isFocusable(el));
};

/**
 * isFocusable determines whether the HTML element el is focusable.  An element
 * is focusable if:
 *
 * 1. The element is of a type which accepts the keyboard focus, or
 *    tabIndex has been explicitly set to enable focusing.
 * 2. It is not disabled.
 * 3. It is in a visible subtree.
 * 4. It is in a connected subtree.
 *
 * @param el the element to check
 * @param context optional context object for caching the results
 * of isConnectedAndVisible() calls
 * @returns true if el is focuasble.
 */
AmxRcfFocusUtils.isFocusable = function(el, context)
{
  return (AmxRcfFocusUtils.acceptFocusableNode(el, context) == AmxRcfDomUtils.FILTER_ACCEPT);
};

/**
 * acceptFocusableNode determines whether an HTML element el is acceptable or
 * not for focusing. An HTML element is focusable if:
 *
 * 1. The element is of a type which accepts the keyboard focus, or
 *    tabIndex has been explicitly set to enable focusing.
 * 2. It is not disabled.
 * 3. It is in a visible subtree.
 *
 * @param el the element to check
 * @param context optional context object for caching the results
 *  of isConnectedAndVisible() calls
 * @returns one of the following:
 *
 * AmxRcfDomUtils.FILTER_SKIP   :  no, I am not focusable, but one of my children
 *                              could be focusable
 * AmxRcfDomUtils.FILTER_REJECT :  no, I am not focusable, and none of my children
 *                              could be possibly focusable
 * AmxRcfDomUtils.FILTER_ACCEPT :  yes, I am focusable
 */
AmxRcfFocusUtils.acceptFocusableNode = function(el, context)
{
  // if nodeType is not 1, none of my decendant will be connected to root,
  // thus the whole subtree is rejected for focusable.
  if (el == null || el.nodeType != 1)
    return AmxRcfDomUtils.FILTER_REJECT;

  // disabled elements cannot be focusable
  if (el.disabled)
    return AmxRcfDomUtils.FILTER_REJECT;

  var tabIdx = AmxRcfDomUtils.getTabIndex(el);

  // elements with a tab index of < -1 are not focusable (IE)
  if (tabIdx < -1)
    return AmxRcfDomUtils.FILTER_REJECT;

  // check the type of the node to see whether it is focusable or not.
  // for something that not even focusable, we don't bother checking
  // whether it's connectedAndVisible or not.

  if (!AmxRcfFocusUtils._isFocusableType(el))
    return AmxRcfDomUtils.FILTER_SKIP;

    // make AmxRcfFocusUtils.isConnectedAndVisible the last call.
  AmxRcfFocusUtils._setupContext(context);

  if (AmxRcfFocusUtils.isConnectedAndVisible(el, context))
    return AmxRcfDomUtils.FILTER_ACCEPT;
  else
    return AmxRcfDomUtils.FILTER_REJECT;
};

/**
 * Setup context object to share results of expensive isConnectedAndVisible() calls
 * among multiple invocations. The cache value should be unique for each _restoreFocusPath
 * call.
 * @param {Object} context The context object to share results among invocations of
 *                 expensive calls.
 */
AmxRcfFocusUtils._setupContext = function(context)
{
  if (!context)
    return;

  if (!context.positiveValue)
  {
    var timestamp = (new Date()).getTime();
    context.positiveValue = "y"+timestamp;
    context.negativeValue = "n"+timestamp;
  }
};

/**
 * Tests whether the HTML element is focusable type or not.
 * @param {HTMLElement} element the element to check
 * @returns true if el is of focusable type.
 */
AmxRcfFocusUtils._isFocusableType = function(el)
{
  AmxRcfAssert.assertDomElement(el);

  var tabIdx = AmxRcfDomUtils.getTabIndex(el);

  // some element-types are natural tab-stops
  // treat them differently here
  switch (el.nodeName.toLowerCase())
  {
    case "a":
      // href-less anchors cannot be focusable unless a tabIndex is provided
      if ( !el.href && tabIdx == undefined )
        return false;
    case "input":
      // hidden input fields cannot be focusable
      if (el.type == "hidden" && el.isContentEditable != true)
        return false;
    case "area":
    //case "img":
    //case "body":
      /* according to the specs, img and body are natual tabstops, but they aren't! */
    case "body":
    case "button":
    case "frame":
    case "iframe":
    case "isindex":
    case "object":
    case "select":
    case "textarea":
      return true;
    default:
      // all elements left are unnatural focusable

      // if the tab-index is explicitly set to a positive number
      // they are focusable
      if (tabIdx >= -1)
        return true;

      // none of the above: the element cannot be focusable
      return false;
  }
};

/**
 * Tests whether the element and its ancestors are connected
 * to the document and visible or not.
 * @param {HTMLElement} element the element to check
 * @param {Object} context cache containing values to check against
 * @returns true if el is connected and visible.
 */
AmxRcfFocusUtils.isConnectedAndVisible = function(el, context)
{
  AmxRcfAssert.assertDomElement(el);

  var agent = AmxRcfAgent.AGENT;
  var documentElement = agent.getDomDocument().documentElement;

  // check cached value first
  var cachedValue = AmxRcfFocusUtils.calculateCachedValue(el, context, "data-amxFoc");
  if (cachedValue != undefined)
    return cachedValue;

  // If one of the nodes in the ancestor chain is not of type element,
  // then we are not connected.  This can happen if the root node is
  // a document fragment, which, interestingly enough, don't have computed
  // styles, which is how this case was originally uncovered.
  if (!AmxRcfFocusUtils._isVisible(el))
  {
    AmxRcfFocusUtils.setCacheValue(el, context, "data-amxFoc", false);
    return false;
  }

  if (el == documentElement)
  {
    // If we reach here, el is visible, and if el is the root
    // el is connected also
    AmxRcfFocusUtils.setCacheValue(el, context, "data-amxFoc", true);
    return true;
  }
  else
  {
    // I am not the root, so whether I am connectedAndVisible
    // depends on whether my parent is connectedAndVisible or not
    var parentValue;

    // If one of the nodes in the ancestor chain is not of type element,
    // then we are not connected.  This can happen if the root node is
    // a document fragment, which, interestingly enough, don't have computed
    // styles, which is how this case was originally uncovered.
    if (el.parentNode == null || el.parentNode.nodeType != 1)
      parentValue = false;
    else
      parentValue = AmxRcfFocusUtils.isConnectedAndVisible(el.parentNode, context);

    AmxRcfFocusUtils.setCacheValue(el, context, "data-amxFoc", parentValue);
    return parentValue;
  }
};

/**
 * Tests whether the element and is visible or not.
 * @param {HTMLElement} element the element to check
 * @returns true if el is visible.
 */
AmxRcfFocusUtils._isVisible = function(el)
{
  var agent = AmxRcfAgent.AGENT;

  // Make sure we are displayed/visible.
  var computedStyle = agent.getComputedStyle(el);
  if (computedStyle.display == "none")
  {
    // If display is none because we are a popup scoping container which
    // happens to be out of scope at the moment, we cheat and pretend
    // like we are visible.  We do this so that isFocusable() will return
    // true for elements which are indeed focusable, but are currently
    // out of scope.  AmxRcfFocusUtils.focusElement() can still set focus to
    // these nodes, after putting them into scope.

    // Note that if the display is explicitly set to "none" via an
    // inline style, we truly are not visible, whether we are an
    // out of scope scoping container or not.
    if (el.style.display == "none")
      return false;
  }

  if (computedStyle.visibility == "hidden")
  {
    return false;
  }

  return true;
};

/**
 * Cache isConnectedAndVisible value for the provided element.
 *
 * @param {HTMLElement} element the element to store the cache
 * @param {Object} context cache containing values to check against
 * @param {String} expando name of the expando object
 * @param {value} value isConnectedAndVisible value
 * @returns true if el is connected and visible.
 */
AmxRcfFocusUtils.setCacheValue = function(el, context, expando, value)
{
  if (!context || !el || !expando || value == undefined)
    return;

  var agent = AmxRcfAgent.AGENT;
  var cacheValue = value ? context.positiveValue : context.negativeValue;
  agent.setAttribute(el, expando, cacheValue);
};

/**
 * Calculate the cached isConnectedAndVisible value for this element
 * by comparing values in the context and the value stored as expando
 * object of the element.
 *
 * @param {HTMLElement} element the element to check
 * @param {Object} context cache containing values to check against
 * @param {String} expando the name of the expando object
 * @returns cached isConnectedAndVisible value for the provided element.
 */
AmxRcfFocusUtils.calculateCachedValue = function(el, context, expando)
{
  if (!context || !el || !expando)
    return undefined;

  var agent = AmxRcfAgent.AGENT;
  var cachedValue = agent.getAttribute(el, expando);
  if (cachedValue == context.positiveValue)
  {
    // This element was already determined to be connected and visible:
    return true;
  }
  else if (cachedValue == context.negativeValue)
  {
    // This element was already determined to not be in connected visible tree:
    return false;
  }

  return undefined;
};

/**
 * returns the first focusable element inside element
 * when optional parameter isExclusive equals true
 * this method will not return element itself
 * @param {HTMLElement} element element to begin searching for tabstops from
 * @param {Boolean:false} isExclusive Whether to include element in the allowed tab stops
 */
AmxRcfFocusUtils.getFirstTabStop = function(element, isExclusive)
{
  // Delegate to AmxRcfDomUtils.getFirstElementMatch(), using AmxRcfFocusUtils.isTabStop()
  // as the match function.
  return AmxRcfDomUtils.getFirstElementMatch(element,
                                          isExclusive,
                                          AmxRcfFocusUtils.isTabStop);
};

/**
 * returns the last focusable element inside element
 * when optional parameter isExclusive equals true
 * this method will not return element itself
 * @param {HTMLElement} element element to begin searching for last tabstops from
 * @param {Boolean:false} isExclusive Whether to include element in the allowed tab stops
 */
AmxRcfFocusUtils.getLastTabStop = function(element, isExclusive)
{
  // Delegate to AmxRcfDomUtils.getLastElementMatch(), using AmxRcfFocusUtils.isTabStop()
  // as the match function.
  return AmxRcfDomUtils.getLastElementMatch(element,
                                         isExclusive,
                                         AmxRcfFocusUtils.isTabStop);
};

/**
 * sets focus to the first focusable element inside element
 * this can also be the element itself
 * @param {HTMLElement} element DOM element to attempt to start to attempt focusing from
 * @return {HTMLElement} The DOM element actually focused on, if any
 */
AmxRcfFocusUtils.focusFirstTabStop = function(element)
{
  AmxRcfAssert.assertDomElement(element);

  var focusElement = AmxRcfFocusUtils.getFirstTabStop(element);

  if (focusElement != null)
    AmxRcfFocusUtils.focusElement(focusElement);

  return focusElement;
};

/**
 * sets focus to the last focusable element inside element
 * this can also be the element itself
 * @param {HTMLElement} element DOM element of subtree to attempt to focus on the last
 * focusable element of.
 * @return {HTMLElement} The DOM element actually focused on, if any
 */
AmxRcfFocusUtils.focusLastTabStop = function(element)
{
  AmxRcfAssert.assertDomElement(element);

  var focusElement = AmxRcfFocusUtils.getLastTabStop(element);

  if (focusElement != null)
    AmxRcfFocusUtils.focusElement(focusElement);

  return focusElement;
};

AmxRcfObject.initClass(AmxRcfFocusUtils, "AmxRcfFocusUtils");

/* ---------------------------------------------------------------------------- */
/* AmxRcfDomUtils                                                               */
/* ---------------------------------------------------------------------------- */

/**
 * Called from our test code,s o this needs exporting
 * @export
 */
AmxRcfDomUtils = function()
{
};

/**
 * Get the tabIndex for an element. Returns undefined if the tab index has not been
 * specified.
 * @param element the element to get the property for
 * @returns the tab index, if specified otherwise undefined
 */
AmxRcfDomUtils.getTabIndex = function(element)
{
  AmxRcfAssert.assertDomElement(element);

  // Notes for not using ".tabIndex":
  // FF incorrectly reports -1 by default: https://bugzilla.mozilla.org/show_bug.cgi?id=417296
  // IE returns 0 by default.
  // This code allows us to differentiate a -1 (FF) and 0 (IE) from not being set by
  // returning undefined
  var tabIndexAttr = element.getAttributeNode("tabIndex");
  return (tabIndexAttr == null || !tabIndexAttr.specified) ? undefined : tabIndexAttr.nodeValue;
};

/**
 * Returns the first child element underneath the specified parent
 */
AmxRcfDomUtils.getFirstChildElement = function(parentElement)
{
  return AmxRcfDomUtils.getFirstChildNodeByType(parentElement, 1);
};

/**
 * Returns the first child node for a given type
 */
AmxRcfDomUtils.getFirstChildNodeByType = function(parentElement, type)
{
  var childNodes = parentElement.childNodes;

  if (childNodes)
  {
    var length = childNodes.length;

    for (var i = 0; i < length; i++)
    {
      var child = childNodes[i];
      if (child.nodeType == type)
        return child;
    }
  }

  return null;
};

/**
 * Returns the last child element underneath the specified parent
 */
AmxRcfDomUtils.getLastChildElement = function(parentElement)
{
  var childNodes = parentElement.childNodes;

  if (childNodes)
  {
    var length = childNodes.length;

    for (var i = length-1; i >= 0; i--)
    {
      var child = childNodes[i];
      if (child.nodeType == 1)
        return child;
    }
  }

  return null;
};

/**
 * Find previous sibling node.
 * @param currentElement the current node
 * @return {HTMLElement} the previous sibling element if found or null if not
 */
AmxRcfDomUtils.getPreviousElement = function(currentElement)
{
  if (currentElement)
  {
    var el = currentElement.previousSibling;

    while (el)
    {
      if (el.nodeType == 1)
        return el;
      el = el.previousSibling;
    }
  }
};

/**
 * Find next sibling node.
 * @param currentElement the current node
 * @return {HTMLElement} the nex sibiling element if found or null if not
 */
AmxRcfDomUtils.getNextElement = function(currentElement)
{
  if (currentElement)
  {
    var el = currentElement.nextSibling;

    while (el)
    {
      if (el.nodeType == 1)
        return el;
      el = el.nextSibling;
    }
  }
};

/**
 * Returns the first element inside of the specified element which matches some
 * criteria defined by a match function.
 *
 * @param {HTMLElement} element element to begin searching from
 * @param {Boolean} isExclusive Whether to include provided element in the search
 * @param {Function} matchFunc A function which is used to test whether a
 *   particular element is a match.  The function takes a single argument - the element
 *   to test - and returns a boolean indicating whether the element is a match.
 * @param context optional context for the match function
 * @return {HTMLElement} The first matching element if one is found, null otherwise.
 */
AmxRcfDomUtils.getFirstElementMatch = function(element, isExclusive, matchFunc, context)
{
  AmxRcfAssert.assertFunction(matchFunc);
  AmxRcfAssert.assertDomElement(element);

  // Implementation "inspired" by the original implementation of
  // AmxRcfFocusUtils.getFirstTabStop(), which is now re-implemented in
  // terms of getFirstElementMatch().

  // If we are not exclusive, start by testing the provided element.
  if (!isExclusive && matchFunc(element, context))
    return element;

  // Do a linear search of all elements under the provided element.
  if (element.getElementsByTagName)
  {
    var elements = element.getElementsByTagName('*');

    var length = elements.length;

    for (var i = 0; i < length; i++)
    {
      var currElement = elements[i];

      // If the current element is a match, return it.
      if (matchFunc(currElement, context))
        return currElement;
    }
  }

  // No match
  return null;
};

/**
 * Returns the next element after the specified element which matches some
 * criteria defined by a match function.
 *
 * @param {HTMLElement} element element to begin searching from
 * @param {HTMLElement} contextElement The search is constrained to the subtree within
 *   the this element.  If no context element is specified, the root document element
 *   is treated as the context element.
 * @param {Boolean:false} isExclusive Whether to include the children of the provided
 *   element in the search.
 * @param {Function} matchFunc A function which is used to test whether a
 *   particular element is a match.  The function takes a single argument - the element
 *   to test - and returns a boolean indicating whether the element is a match.
 * @param context optional context for the match function
 * @return {HTMLElement} The next matching element if one is found, null otherwise.
 */
AmxRcfDomUtils.getNextElementMatch = function(element, contextElement,
                                           isExclusive, matchFunc, context)
{
  AmxRcfAssert.assertFunction(matchFunc);
  AmxRcfAssert.assertDomElement(element);
  AmxRcfAssert.assertDomElementOrNull(contextElement);

  // Implementation "inspired" by the original implementation of
  // AmxRcfFocusUtils.getNextTabStop(), which is now re-implemented in
  // terms of getNextElementMatch().

  var matchElement = null;

  // If we are not exclusive, start by checking whether we've got a
  // match underneath the provided element.
  if (!isExclusive)
  {
    matchElement = AmxRcfDomUtils.getFirstElementMatch(element, true, matchFunc, context);
    if (matchElement != null)
      return matchElement;
  }

  // Walk over siblings, then ancestor siblings until we either
  // find a match or run out of elements.
  while (element && (element != contextElement))
  {
    if (element.nextSibling)
    {
      element = element.nextSibling;
      // only check elements
      if(element.nodeType == 1)
      {
        // Look for a match under the sibling
        matchElement = AmxRcfDomUtils.getFirstElementMatch(element, false, matchFunc, context);
        if (matchElement != null)
          return matchElement;
      }
    }
    else
    {
      // No more siblings, kick it up to the parent
      element = element.parentNode;
    }
  }

  // No match.
  return null;
};

/**
 * Returns the last element inside of the specified element which matches some
 * criteria defined by a match function.
 *
 * @param {HTMLElement} element element to begin searching from
 * @param {Boolean} isExclusive Whether to include provided element in the search
 * @param {Function} matchFunc A function which is used to test whether a
 *   particular element is a match.  The function takes a single argument - the element
 *   to test - and returns a boolean indicating whether the element is a match.
 * @param context optional context for the match function
 * @return {HTMLElement} The last matching element if one is found, null otherwise.
 */
AmxRcfDomUtils.getLastElementMatch = function(element, isExclusive, matchFunc, context)
{
  AmxRcfAssert.assertFunction(matchFunc);
  AmxRcfAssert.assertDomElement(element);

  // Implementation "inspired" by the original implementation of
  // AmxRcfFocusUtils.getLastTabStop(), which is now re-implemented in
  // terms of getLastElementMatch().

  if (element.getElementsByTagName)
  {
    var elements = element.getElementsByTagName('*');

    for (var i = elements.length - 1; i >= 0; i--)
    {
      var currElement = elements[i];

      // If the current element is a match, return it.
      if (matchFunc(currElement, context))
        return currElement;
    }
  }

  // If we are not exclusive and haven't yet found a match,
  // try testing the provided element.
  if (!isExclusive && matchFunc(element, context))
    return element;

  return null;
};

/**
 * Returns the first element for a node. If the node is an element, that element is returned;
 * otherwise, the closest parent element will be returned.
 *
 * @param {Node} node the node to get the element for
 * @return {Element} the closest element
 */
AmxRcfDomUtils.getElement = function(node)
{
  if (node == null)
  {
    return null;
  }

  for (var n = node; n != null; n = n.parentNode)
  {
    if (n.nodeType == 1) // element
    {
      return n;
    }
  }

  return null;
};

/**
 * Instead of searching the entire page for an element by ID, only look within the given subtree.
 */
AmxRcfDomUtils.getElementByIdInSubtree = function(treeRoot, id)
{
  return AmxRcfDomUtils.getFirstElementMatch(treeRoot, true, AmxRcfDomUtils._isElementWithId, id);
};

AmxRcfDomUtils._isElementWithId = function(el, id)
{
  return ((el != null) && (id == el.id));
};

// Constants used in AmxRcfDomUtils.getFirst/Next/Previous/LastElementFilter functions.
// Caller provided filter function must return one of the following values.

// Node is accepted
AmxRcfDomUtils.FILTER_ACCEPT = 1;

// Whole tree is rejected
AmxRcfDomUtils.FILTER_REJECT = 0;

// Node is skipped, but not its subtree.
AmxRcfDomUtils.FILTER_SKIP = -1;

AmxRcfObject.initClass(AmxRcfDomUtils, "AmxRcfDomUtils");

/* ---------------------------------------------------------------------------- */
/* AmxRcfCarouselDataFetchEvent                                                 */
/* ---------------------------------------------------------------------------- */

var AmxRcfCarouselDataFetchEvent = new Object();

AmxRcfCarouselDataFetchEvent.INITIAL_SUBTYPE = 0;
AmxRcfCarouselDataFetchEvent.BEFORE_KEY_SUBTYPE = 1;
AmxRcfCarouselDataFetchEvent.AFTER_KEY_SUBTYPE = 2;
AmxRcfCarouselDataFetchEvent.AT_INDEX_SUBTYPE = 3;

/* ---------------------------------------------------------------------------- */
/* AmxRcfRichCarousel                                                           */
/* ---------------------------------------------------------------------------- */

AmxRcfRichCarousel = function(
  amxNode,
  auxiliaryOffset,
  auxiliaryPopOut,
  auxiliaryScale,
  clientId,
  contentDelivery,
  controlArea,
  currentItemKey,
  disabled,
  displayItems,
  fetchSize,
  halign,
  orientation,
  valign)
{
  AmxRcfObject.initClass(AmxRcfRichCarousel, "AmxRcfRichCarousel");
  this.Init(
    amxNode,
    auxiliaryOffset,
    auxiliaryPopOut,
    auxiliaryScale,
    clientId,
    contentDelivery,
    controlArea,
    currentItemKey,
    disabled,
    displayItems,
    fetchSize,
    halign,
    orientation,
    valign);
};

AmxRcfRichCarousel.prototype.Init = function(
  amxNode,
  auxiliaryOffset,
  auxiliaryPopOut,
  auxiliaryScale,
  clientId,
  contentDelivery,
  controlArea,
  currentItemKey,
  disabled,
  displayItems,
  fetchSize,
  halign,
  orientation,
  valign)
{
  this._props = new Object();
  this._amxNode = amxNode;
  this.setProperty("auxiliaryOffset", auxiliaryOffset);
  this.setProperty("auxiliaryPopOut", auxiliaryPopOut);
  this.setProperty("auxiliaryScale", auxiliaryScale);
  this.setProperty("clientId", clientId);
  this.setProperty("contentDelivery", contentDelivery);
  this.setProperty("controlArea", controlArea);
  this.setProperty("currentItemKey", currentItemKey);
  this.setProperty("disabled", disabled);
  this.setProperty("displayItems", displayItems);
  this.setProperty("fetchSize", fetchSize);
  this.setProperty("halign", halign);
  this.setProperty("orientation", orientation);
  this.setProperty("valign", valign);
};

AmxRcfRichCarousel.prototype.getAuxiliaryOffset = function()
{
  return this.getProperty("auxiliaryOffset");
};

AmxRcfRichCarousel.prototype.getAuxiliaryPopOut = function()
{
  return this.getProperty("auxiliaryPopOut");
};

AmxRcfRichCarousel.prototype.getAuxiliaryScale = function()
{
  return this.getProperty("auxiliaryScale");
};

AmxRcfRichCarousel.prototype.getClientId = function()
{
  return this.getProperty("clientId");
};

AmxRcfRichCarousel.prototype.getContentDelivery = function()
{
  return this.getProperty("contentDelivery");
};

AmxRcfRichCarousel.prototype.getControlArea = function()
{
  return this.getProperty("controlArea");
};

AmxRcfRichCarousel.prototype.getCurrentItemKey = function()
{
  return this.getProperty("currentItemKey");
};

AmxRcfRichCarousel.prototype.setCurrentItemKey = function(currentItemKey)
{
  var oldValue = this.getCurrentItemKey();
  AmxRcfLogger.LOGGER.info("Updating currentItemKey to \"" + currentItemKey + "\" (it was \"" + oldValue + "\")");

  // Update the stored property:
  this.setProperty("currentItemKey", currentItemKey);

  // Make it available if the AMX component ID is consistent for the life of the document object:
  var storedData = {
    currentItemKey: currentItemKey
  };
  adf.mf.api.amx.setClientState(this.getClientId(), storedData);

  // Let the peer know the property has changed:
  var peer = this.getPeer();
  peer.ComponentCurrentItemKeyChanged(this, peer.getDomElement(), currentItemKey, oldValue);
};

AmxRcfRichCarousel.prototype.getDisabled = function()
{
  return this.getProperty("disabled");
};

AmxRcfRichCarousel.prototype.getDisplayItems = function()
{
  return this.getProperty("displayItems");
};

AmxRcfRichCarousel.prototype.getFetchSize = function()
{
  return this.getProperty("fetchSize");
};

AmxRcfRichCarousel.prototype.getHalign = function()
{
  return this.getProperty("halign");
};

AmxRcfRichCarousel.prototype.getOrientation = function()
{
  return this.getProperty("orientation");
};

AmxRcfRichCarousel.prototype.getPeer = function()
{
  return this.getProperty("peer");
};

AmxRcfRichCarousel.prototype.setPeer = function(peer)
{
  this.setProperty("peer", peer);
};

AmxRcfRichCarousel.prototype.getValign = function()
{
  return this.getProperty("valign");
};

AmxRcfRichCarousel.prototype.queueEvent = function(evt)
{
  // Do nothing
  AmxRcfLogger.LOGGER.finer("AmxRcfRichCarousel.queueEvent");
};

AmxRcfRichCarousel.prototype.getProperty = function(key)
{
  return this._props[key];
};

AmxRcfRichCarousel.prototype.setProperty = function(key, value)
{
  this._props[key] = value;
};

AmxRcfRichCarousel.CURRENT_ITEM_KEY = "currentItemKey";

/* ---------------------------------------------------------------------------- */
/* AmxRcfCarouselPeer                                                           */
/* ---------------------------------------------------------------------------- */

AmxRcfCarouselPeer = function(component, domElement)
{
  AmxRcfObject.initClass(AmxRcfCarouselPeer, "AmxRcfCarouselPeer");
  this.Init(component, domElement);
};

/**
 * Create an instance of an AmxRcfCarouselPeer.
 */
AmxRcfCarouselPeer.prototype.Init = function(component, domElement)
{
  component.setPeer(this);
  this._component = component;

  AmxRcfAssert.assertDomElement(domElement);
  this._domElement = domElement;

  // Save off the attribute-specific layout settings
  this._displayItems = component.getDisplayItems();
  this._controlArea  = component.getControlArea();

  var agent = AmxRcfAgent.AGENT;
  var clientId = component.getClientId();

  this._db = agent.getElementById(AmxRcfRichUIPeer.createSubId(clientId, "db"), domElement);
  this._it = agent.getElementById(AmxRcfRichUIPeer.createSubId(clientId, "it"), domElement);
  // Note can't use this at least on iOS 5 because it won't honor updates:
  //this._it.setAttribute("role", "heading");

  if (this._controlArea != "small" && this._controlArea != "compact" && this._controlArea != "none")
    this._sc = agent.getElementById(AmxRcfRichUIPeer.createSubId(clientId, "sc"), domElement);

  if (this._controlArea != "compact" && this._controlArea != "none")
    this._si = agent.getElementById(AmxRcfRichUIPeer.createSubId(clientId, "si"), domElement);

  if (this._controlArea != "none")
  {
    this._sp = agent.getElementById(AmxRcfRichUIPeer.createSubId(clientId, "sp"), domElement);
    this._sn = agent.getElementById(AmxRcfRichUIPeer.createSubId(clientId, "sn"), domElement);
    if (this._si != null)
    {
      var spinInfoId = this._si.id;
      this._sp.setAttribute("aria-labelledby", spinInfoId);
      this._sn.setAttribute("aria-labelledby", spinInfoId);
    }
  }

  if (this._controlArea == "full")
  {
    this._sb = agent.getElementById(AmxRcfRichUIPeer.createSubId(clientId, "sb"), domElement);
    this._st = agent.getElementById(AmxRcfRichUIPeer.createSubId(clientId, "st"), domElement);
  }
  else if (this._controlArea == "small" || this._controlArea == "compact")
  {
    this._ca = agent.getElementById(AmxRcfRichUIPeer.createSubId(clientId, "ca"), domElement);
  }

  AmxRcfAssert.assert(component.getClientId() == domElement.id, "Component and DOM ID mismatch when creating peer.");

  $(domElement).bind("click", this, AmxRcfCarouselPeer.HandleDomClick); // TODO remove jQuery on this
  $(domElement).bind("mouseout", this, AmxRcfCarouselPeer.HandleDomMouseOut); // TODO remove jQuery on this
  $(domElement).bind("keydown", this, AmxRcfCarouselPeer.HandleDomKeyDown); // TODO remove jQuery on this
  //The "mouse*" events are handled as "touch*" events on mobile devices. Use of "touchstart" is required to sense immediate
  //touch down events as opposed to mouse down events, which are delayed until drag or release. The previous "mouse*" event
  //handlers have been merged with the updated "touch*" event handlers which enable "tap and hold" functionality and is
  //roughly analogous to "hover" functionality on desktop web browsers.
  $(domElement).bind("touchstart", this, AmxRcfCarouselPeer.HandleDomTouchStart); // TODO remove jQuery on this
  $(domElement).bind("touchend", this, AmxRcfCarouselPeer.HandleDomTouchEnd); // TODO remove jQuery on this

  if (this._controlArea == "full")
  {
    var $st = $(this._st); // TODO remove jQuery on this
    $st.peer = this;
    $st.drag({
      start: function(event, dragExtra) {
        event.preventDefault();
        event.stopPropagation();
        $st.peer._duringThumbDrag = true;
      },
      drag: function(event, dragExtra) {
        event.preventDefault();
        event.stopPropagation();
        $st.peer._handleThumbDragPositioning(event, dragExtra);
      },
      end: function(event, dragExtra) {
        event.preventDefault();
        event.stopPropagation();
        $st.peer._finishThumbDrag(event, dragExtra);
      }
    });
  }

  if (!component.getDisabled())
  {
    // Treat dragging withing the databody as a spin
    var $db = $(this._db); // TODO remove jQuery on this
    $db.peer = this;
    $db.drag({
      start: function(event, dragExtra)
      {
        // Honor the drag anywhere in the databody (including over the selected item wrapper).
        var peer = $db.peer;
        peer._directManipulationItemKey = null;
        if (dragExtra != null)
        {
          // Only consider it a drag if the angle of the drag is within 30 degrees of the
          // orientation of the carousel
          var angle = Math.abs(dragExtra.originalAngle);
          peer._duringDatabodyDrag =
            (peer._isVertical && angle >= 60 && angle <= 120) ||
            (!peer._isVertical && (angle <= 30 || angle >= 150));
        }
        else
        {
          peer._duringDatabodyDrag = true;
        }

        if (peer._duringDatabodyDrag)
        {
          event.preventDefault();
          event.stopPropagation();
        }
      },
      drag: function(event, dragExtra)
      {
        var peer = $db.peer;
        if (peer._duringDatabodyDrag)
        {
          event.preventDefault();
          event.stopPropagation();
          peer._handleDatabodyDragPositioning(event, dragExtra);
        }
      },
      end: function(event, dragExtra)
      {
        var peer = $db.peer;
        if (peer._duringDatabodyDrag)
        {
          event.preventDefault();
          event.stopPropagation();
          peer._finishDatabodyDrag(event, dragExtra);

          if (peer._currentItemKey != peer._directManipulationItemKey)
          {
            // Update the row key if an only if there was a change in the current item key:
            peer._updateCurrentItemKey(peer._directManipulationItemKey);
          }

          // We always need to animate because we may not be located at the exact positions (e.g. we could
          // be a few pixels off and we need to snap to the proper positions):
          peer._animateRowsForNewSelectedWrapperElement(peer._directManipulationRow, peer._directManipulationItemKey);

          // Clean up the direct manipulation variables:
          peer._directManipulationItemKey = null;
          peer._directManipulationRow = null;
        }
      }
    });
  }
};

AmxRcfCarouselPeer.prototype.getDomElement = function()
{
  return this._domElement;
};

AmxRcfCarouselPeer.prototype.getComponent = function()
{
  return this._component;
};

AmxRcfCarouselPeer.prototype._getControlAreaDiv = function()
{
  AmxRcfAssert.assert(
    this._controlArea == "small" || this._controlArea == "compact",
    "Carousel peer should not be accessing the control area when controlArea == full or none");
  return this._ca;
};

AmxRcfCarouselPeer.prototype._getSpinControlDiv = function()
{
  AmxRcfAssert.assert(
    this._controlArea != "small" && this._controlArea != "compact" && this._controlArea != "none",
    "Carousel peer should not be accessing the spin control div when controlArea != full");
  return this._sc;
};

AmxRcfCarouselPeer.prototype._getSpinInfoDiv = function()
{
  AmxRcfAssert.assert(
    this._controlArea != "compact" && this._controlArea != "none",
    "Carousel peer should not be accessing the spin info div when controlArea == compact or none");
  return this._si;
};

/**
 * Initialize the associated domElement when the peer is created.  Stateless peers are not bound at
 * the time that this method is called.
 * @Override
 */
AmxRcfCarouselPeer.prototype.InitDomElement = function()
{
  var component = this.getComponent();
  var domElement = this.getDomElement();

  //this._firstBlockRequested = false;
  //this._pruneKeyCache = null;
  //this._isEmpty = undefined;
  //this._incrementMouseHoldTimerId = null;
  //this._incrementMouseHoldMode = null;

  this._SHRINK_FACTOR = component.getAuxiliaryScale();
  this._SHIFT_FACTOR = component.getAuxiliaryOffset();
  this._POP_OUT = component.getAuxiliaryPopOut();

  this._fetchId = 0;

  var orientation = component.getOrientation();
  this._isVertical = orientation == "vertical";

  var lookAndFeel    = AmxRcfPage.PAGE.getLookAndFeel();
  this._useOpacity   = lookAndFeel.getSkinProperty("amx-carousel-tr-overlay-opacity") != "none";
  this._animDuration = 0;
  this._popOutDuration = 0;
  this._animDuration =
    parseInt(lookAndFeel.getSkinProperty("amx-carousel-tr-spin-animation-duration"), 10);
  if (isNaN(this._animDuration))
  {
    // Animation is disabled, render only the final frame:
    this._animDuration = 0;
  }

  this._popOutDuration =
    parseInt(lookAndFeel.getSkinProperty("amx-carousel-tr-pop-out-animation-duration"), 10);
  if (isNaN(this._popOutDuration))
  {
    // Animation is disabled, render only the final frame:
    this._animDuration = 0;
  }

  this._setupInitialPositions(component, domElement);
};

/**
 * Attempts to set up the initial posisions of the main elements of this component.
 * @param component Component that this peer will be associated with
 * @param domElement Root DOM element of this peer
 */
AmxRcfCarouselPeer.prototype._setupInitialPositions = function(component, domElement)
{
  if (this._initiallyPositioned)
  {
    return;
  }

  // Position the control area and determine the databody size:
  if (this._controlArea == "small" || this._controlArea == "compact")
  {
    this._setupInitialCompactOrSmallPositions(domElement, component.getClientId(), this._controlArea);
  }
  else if (this._controlArea == "none")
  {
    this._setupInitialNonePositions(domElement, component.getClientId());
  }
  else // this._controlArea == "full"
  {
    this._setupInitialFullPositions(domElement, component.getClientId());
  }
};

AmxRcfCarouselPeer.prototype._setupInitialFullPositions = function(domElement, id)
{
  var itemTextDiv    = this._it;
  var databody       = this._db;
  var spinInfoDiv    = this._getSpinInfoDiv(); // controlArea must not be compact
  var spinControlDiv = this._getSpinControlDiv(); // controlArea must be full
  var currentInset   = 0;
  var size;

  // Ensure the spin control DIV is in the proper location:
  if (this._isVertical)
  {
    // Figure out the width of the spin info div and make the spin control div sit next to it:
    size = spinInfoDiv.offsetWidth * 15; // allocate 15 spaces
    if (size != 0)
    {
      this._initiallyPositioned = true;
    }
    spinInfoDiv.style.width = size + "px";
    currentInset += size + 4; // add extra pixels of padding between the text and the thumb
    if (AmxRcfCarouselPeer._isRTL())
    {
      spinControlDiv.style.left = currentInset + "px";
    }
    else // ltr
    {
      spinControlDiv.style.right = currentInset + "px";
    }

    // Figure out the width of the spin control div and make the databody sit next to it:
    size = AmxRcfDomUtils.getFirstChildElement(spinControlDiv).offsetWidth;
    if (size == 0)
    {
      // This issue seems to be unique to AMX (not RCF):
      AmxRcfLogger.LOGGER.fine("It appears that the carousel DOM or CSS is not yet loaded in time for DOM sizing because the offsetHeight of the first element in the following HTML was detected to be zero:\n" + spinControlDiv.innerHTML + "\n -- A potential workaround would be to reload the page in hopes the browser has cached the resources.\n -- An attempt to resize will be performed now.");
      this._initiallyPositioned = false;
      AmxRcfPage.PAGE.getDomWindow().setTimeout(AmxRcfCarouselPeer.__attemptInitialSize, 500);
    }
    spinControlDiv.style.width = size + "px";
    currentInset += size;
    if (AmxRcfCarouselPeer._isRTL())
    {
      databody.style.left = currentInset + "px";
    }
    else // ltr
    {
      databody.style.right = currentInset + "px";
    }

    // Remember this indent for future resizing:
    this._nonDatabodySize = currentInset;
    this._heightOfBoxUnderCurrentItem = itemTextDiv.offsetHeight;
  }
  else // horizontal
  {
    // Figure out the height of the spin info div and make the spin control div sit on top of it:
    size = spinInfoDiv.offsetHeight;
    if (size != 0)
    {
      this._initiallyPositioned = true;
    }
    currentInset += size;
    spinControlDiv.style.bottom = currentInset + "px";

    // Figure out the height of the spin control div and make the item text div sit on top of it:
    size = AmxRcfDomUtils.getFirstChildElement(spinControlDiv).offsetHeight;
    if (size == 0)
    {
      // This issue seems to be unique to AMX (not RCF):
      AmxRcfLogger.LOGGER.fine("It appears that the carousel DOM or CSS is not yet loaded in time for DOM sizing because the offsetHeight of the first element in the following HTML was detected to be zero:\n" + spinControlDiv.innerHTML + "\n -- A potential workaround would be to reload the page in hopes the browser has cached the resources.\n -- An attempt to resize will be performed now.");
      this._initiallyPositioned = false;
      AmxRcfPage.PAGE.getDomWindow().setTimeout(AmxRcfCarouselPeer.__attemptInitialSize, 500);
    }
    spinControlDiv.style.height = size + "px";
    currentInset += size;
    itemTextDiv.style.left   = "0px";
    itemTextDiv.style.right  = "0px";
    itemTextDiv.style.bottom = currentInset + "px";

    // Figure out the height of the item text div and make the databody sit on top of it:
    size = itemTextDiv.offsetHeight;
    currentInset += size;
    databody.style.bottom = currentInset + "px";

    // Remember this indent for future resizing:
    this._nonDatabodySize = currentInset;
  }
};

AmxRcfCarouselPeer.__attemptInitialSize = function()
{
  $(window).resize(); // TODO remove jQuery on this
};

AmxRcfCarouselPeer.prototype.HasInitialSize = function()
{
  return this._initiallyPositioned;
};

AmxRcfCarouselPeer.prototype._setupInitialNonePositions = function(domElement, id)
{
  var itemTextDiv  = this._it;
  var itemTextSize = itemTextDiv.offsetHeight;
  var databody     = this._db;

  if (this._isVertical)
  {
    this._initiallyPositioned = true;
    this._nonDatabodySize = 0;
    this._heightOfBoxUnderCurrentItem = itemTextSize;
  }
  else // horizontal
  {
    this._initiallyPositioned = true;
    itemTextDiv.style.left   = "0px";
    itemTextDiv.style.right  = "0px";
    itemTextDiv.style.bottom = "10px";

    itemTextSize += 10; // add extra pixels of padding between the text and the edge of the component

    // Figure out the height of the item text div and make the databody sit on top of it:
    databody.style.bottom = itemTextSize + "px";

    // Remember this indent for future resizing:
    this._nonDatabodySize = itemTextSize;
  }
};

AmxRcfCarouselPeer.prototype._setupInitialCompactOrSmallPositions = function(
  domElement,
  id,
  controlArea)
{
  var agent                    = AmxRcfAgent.AGENT;
  var controlAreaDiv           = this._getControlAreaDiv();
  var controlAreaComputedStyle = agent.getComputedStyle(controlAreaDiv);
  var controlPaddingLeft       = parseInt(controlAreaComputedStyle.paddingLeft, 10);
  var controlPaddingRight      = parseInt(controlAreaComputedStyle.paddingRight, 10);
  var controlPaddingTop        = parseInt(controlAreaComputedStyle.paddingTop, 10);
  var controlPaddingBottom     = parseInt(controlAreaComputedStyle.paddingBottom, 10);
  var itemTextDiv              = this._it;
  var itemTextComputedStyle    = agent.getComputedStyle(itemTextDiv);
  var itemTextPaddingTop       = parseInt(itemTextComputedStyle.paddingTop, 10);
  var itemTextPaddingBottom    = parseInt(itemTextComputedStyle.paddingBottom, 10);
  var spinPrevElem             = this._sp;
  var spinNextElem             = this._sn;
  var databody                 = this._db;
  var currentInset             = 0;
  var size;

  // Ensure the control area contents are in the proper locations (the DOM placement of these are
  // identical regardless of horizontal or vertical orientation).

  // Figure out the height of the spin info div and make the others sit on top of it:
  if (controlArea != "compact")
  {
    var spinInfoDiv = this._getSpinInfoDiv(); // controlArea must not be compact for this to exist
    size = spinInfoDiv.offsetHeight;
    currentInset += size;
    spinInfoDiv.style.bottom = controlPaddingBottom + "px";
  }

  // Figure out the largest height of the spin buttons and item text div:
  var itemTextDivOffsetHeight = itemTextDiv.offsetHeight;
  if (itemTextDivOffsetHeight != 0)
  {
    this._initiallyPositioned = true;
  }
  var spinPrevOffsetHeight = spinPrevElem.offsetHeight;
  var spinNextOffsetHeight = spinNextElem.offsetHeight;
  size = Math.max(spinPrevOffsetHeight, itemTextDivOffsetHeight, spinNextOffsetHeight);
  currentInset += size;

  var isRtl          = AmxRcfCarouselPeer._isRTL();
  var spinPrevStyle  = spinPrevElem.style;
  spinPrevStyle.top  = controlPaddingTop + "px";
  if (isRtl)
    spinPrevStyle.right = controlPaddingRight + "px";
  else
    spinPrevStyle.left = controlPaddingLeft + "px";

  var spinNextStyle   = spinNextElem.style;
  spinNextStyle.top   = controlPaddingTop + "px";
  if (isRtl)
    spinNextStyle.left = controlPaddingLeft + "px";
  else
    spinNextStyle.right = controlPaddingRight + "px";

  // Figure out the positions of the spin buttons and item text div:
  var itemTextStyle        = itemTextDiv.style;
  itemTextStyle.top        = controlPaddingTop + "px";
  var textHeight           = size - itemTextPaddingTop - itemTextPaddingBottom;
  itemTextStyle.height     = textHeight + "px";
  itemTextStyle.lineHeight = textHeight + "px"; // center the text vertically
  if (isRtl)
  {
    itemTextStyle.right = controlPaddingRight + spinPrevElem.offsetWidth + "px";
    itemTextStyle.left  = controlPaddingLeft + spinNextElem.offsetWidth + "px";
  }
  else
  {
    itemTextStyle.left  = controlPaddingLeft + spinPrevElem.offsetWidth + "px";
    itemTextStyle.right = controlPaddingRight + spinNextElem.offsetWidth + "px";
  }

  // Assign the height of the controlAreaDiv:
  controlAreaDiv.style.top    = "auto";
  controlAreaDiv.style.height = currentInset + "px";

  // Account for the padding of the control area:
  currentInset += controlPaddingTop;
  currentInset += controlPaddingBottom;

  // Remember this indent for future resizing:
  if (this._isVertical)
  {
    // use the entire width for the databody
    this._nonDatabodySize = 0;
    this._heightOfBoxUnderCurrentItem = currentInset;
  }
  else // horizontal
  {
    controlAreaDiv.style.bottom = AmxRcfCarouselPeer._ITEM_PADDING + "px";
    currentInset += AmxRcfCarouselPeer._ITEM_PADDING;

    // use a fraction of the height for the databody
    databody.style.bottom = currentInset + "px";
    this._nonDatabodySize = currentInset;
  }
};

/**
 * Handles the removal of a component.
 * @Override
 * @param {AmxRcfUIComponent} component The component
 */
AmxRcfCarouselPeer.prototype.ComponentRemoved = function(component) // TODO hook into AMX
{
  // Purge the existing animation here to avoid issues with obsolete animations.
  this._stopAnimation(true);
};

AmxRcfCarouselPeer.prototype.MoreRowsArrived = function()
{
  // We need to find the initial datablock in the databody and check if it has no rows
  var databody = this._db;
  var nodes = databody.childNodes;
  var block = null;
  for (var i=nodes.length-1; i>=0; i--)
  {
    var node = nodes[i];
    if ("DIV" == node.tagName && node.getAttribute("data-amxStartRow") != null)
    {
      block = nodes[i];
      break;
    }
  }

  if (block != null && block.childNodes.length > 0)
  {
    var newCount = block.getAttribute("data-amxRowCount");
    var oldCount = this._rowCount;
    if (oldCount != newCount)
    {
      this._knownRowCount = newCount;
      this._rowCount = newCount;
      this._positionThumbAndSpinInfo();
    }

    // Make sure that the new items have size:
    var rootElement = this.getDomElement();
    var width = rootElement.offsetWidth;
    var height = rootElement.offsetHeight;
    this.ResizeNotify(null, null, width, height);
  }
};

/**
 * @Override
 */
AmxRcfCarouselPeer.prototype.ResizeNotify = function(
  oldWidth,
  oldHeight,
  newWidth,
  newHeight)
{
  var databody;
  if (this._virtInitialized)
  {
    //resize databody
    this._sizeDatabody(this._db, newWidth, newHeight);
  }
  else // initial databody setup
  {
    databody = this._db;

    // We need to find the initial datablock in the databody and
    // check if it has no rows
    var nodes = databody.childNodes;
    var block = null;
    for (var i=nodes.length-1; i>=0; i--)
    {
      var node = nodes[i];
      if ("DIV" == node.tagName && node.getAttribute("data-amxStartRow") != null)
      {
        block = nodes[i];
        break;
      }
    }

    if (block != null && block.childNodes.length > 0 && block.getAttribute("data-amxrowcount") != "0")
    {
      this._initVirtualization(block, true);
    }
    else
    {
      // When contentDelivery is immediate, the databody contains the fetched data, this is why both
      // parameters are the same.
      this._addEmptyTextToDataBody(databody, databody);
      this._isEmpty = true;
    }
  }
};

/**
 * Adds the empty text to the data body.
 * @param {HTMLElement} databody the databody of the carousel where the empty text will be shown
 * @param {HTMLElement} newElement the container that holds the empty text fetched from the server
 */
AmxRcfCarouselPeer.prototype._addEmptyTextToDataBody = function(databody, newElement)
{
  if (this._displayItems == "oneByOne")
  {
    // The databody may have a border or shadow.  When empty, we don't want this to show up so set the positioning to zero.
    var databodyStyle = databody.style;
    databodyStyle.top    = "0px";
    databodyStyle.bottom = "0px";
    databodyStyle.left   = "0px";
    databodyStyle.right  = "0px";
  }

  // Copy the contents of the DIV into the databody
  // No further data fetch is expected
  var children      = newElement.childNodes;
  var newChildCount = children.length;

  // wrap empty content into a one cell that will be positioned in the middle of the data body
  var doc      = databody.ownerDocument;
  var outerDiv = doc.createElement("div");
  databody.appendChild(outerDiv);

  var style = outerDiv.style;
  style.position = "absolute";
  style.verticalAlign = "middle";
  style.textAlign = "center";
  style.left = style.right = "0px";
  style.top = "50%";

  // inner div that is positioned in the outer div
  var div = doc.createElement("div");
  outerDiv.appendChild(div);
  style = div.style;
  style.position = "relative";
  var agent = AmxRcfAgent.getAgent();
  if (agent.getPlatform() != AmxRcfAgent.WEBKIT_PLATFORM)
  {
    // In browsers other than WebKit-based browsers, the following style will cause the text to be
    // vertically centered:
    style.top = "-50%";
  }

  for (var i=0; i<newChildCount; i++)
  {
    var fetchedChild = newElement.firstChild;
    newElement.removeChild(fetchedChild); // don't _unregisterNode(child) because we're only moving it
    if (fetchedChild.nodeType == 1 && fetchedChild.getAttribute("data-amxStartRow") != null)
    {
      // The databody will house a block for rows but also houses a container for displaying the
      // empty message to the user.  Only preserve the empty message.
      continue;
    }

    div.appendChild(fetchedChild);
  }

  // Hide the item text (particularly in vertical mode, this is a box appears even if empty):
  this._it.style.display = "none";

  // Hide the controls if they are not applicable:
  if (this._controlArea == "small" || this._controlArea == "compact")
  {
    var controlArea = this._getControlAreaDiv();
    controlArea.style.display = "none";
  }
  else if (this._controlArea != "none" && this._displayItems == "oneByOne")
  {
    // There won't be a control area in full mode but we want to hide the spin bar if in oneByOne mode:
    var spinControlDiv = this._getSpinControlDiv();
    spinControlDiv.style.display = "none";
  }

  this._isEmpty = true;

  // this is the case where the data is lazily loaded but no data present
};

AmxRcfCarouselPeer.prototype._getNumberOfRows = function(blockOfRows)
{
  return blockOfRows.childNodes.length;
};

AmxRcfCarouselPeer.prototype._initVirtualization = function(
  firstBlock,
  alreadyInserted)
{
  this._virtInitialized = true;

  var agent = AmxRcfAgent.AGENT;
  var startRow = agent.getIntAttribute(firstBlock, "data-amxStartRow", 0);
  var numRows = this._getNumberOfRows(firstBlock);

  var component = this.getComponent();
  var databody = this._db;
  var rowCount = agent.getIntAttribute(firstBlock, "data-amxRowCount", -1);
  this._rowCount = rowCount;
  this._knownRowCount = (rowCount == -1) ? (startRow + numRows) : rowCount;

  var currentItemKey = firstBlock.getAttribute("data-amxCurrentItemKey");
  if (currentItemKey)
  {
    // tell UIComponent to treat this setting as an internal set without sending property
    // change to the server or firing client-side events
    component.setProperty('currentItemKey', currentItemKey, false, AmxRcfUIComponent.PROPAGATE_NEVER);

    // Cannot use this._updateCurrentItemKey(currentItemKey) because FindByRowKey won't work yet,
    // see the text update call at the end of this function instead.
    this._currentItemKey = currentItemKey;
  }

  var container = this.getDomElement();
  var outerWidth = container.clientWidth;
  var outerHeight = container.clientHeight;

  if (!alreadyInserted)
  {
    //remove all children from the databody
    var children = databody.childNodes;
    for (var c=children.length-1; c>=0; c--)
    {
      // =-= Need to explain why this._unregisterNode(children[c]) is not called here.
      databody.removeChild(children[c]);
    }

    databody.appendChild(firstBlock);
  }

  firstBlock.startRow = startRow;
  firstBlock.numRows = numRows;

  // Enable spinning via mouse wheels or touch movement if the carousel is not disabled:
  var isDisabled = component.getDisabled();
  if (!isDisabled && !this._isEmpty)
  {
    // Enable mouse wheel support for spinning the carousel:
    var rootElement = this.getDomElement();
    $(rootElement).bind("mousewheel", this, AmxRcfCarouselPeer._handleMouseWheel); // TODO remove jQuery on this

    if (this._controlArea != "none")
    {
      // Textual clickable icons do not queue component click events so we need to add a listener by
      // hand to the spin previous and spin next elements.  This is only necessary if the active skin
      // uses text instead of just a background image.
      var spinPrevElem = this._sp;
      var spinNextElem = this._sn;
      var $spinPrevElem = $(spinPrevElem);
      var $spinNextElem = $(spinNextElem);
      $spinPrevElem.tap(this, AmxRcfCarouselPeer._handlePreviousClick); // TODO remove jQuery on this
      $spinNextElem.tap(this, AmxRcfCarouselPeer._handleNextClick); // TODO remove jQuery on this

      if (!isDisabled)
      {
        var mousedown = "mousedown";
        var mouseup = "mouseup";
        if (amx.hasTouch())
        {
          mousedown = "touchstart";
          mouseup = "touchend";
        }

        $spinPrevElem.bind(mousedown,function(e)
        {
          adf.mf.internal.amx.addCSSClassName(spinPrevElem, "amx-selected");
        });
        $spinPrevElem.bind(mouseup,function(e)
        {
          adf.mf.internal.amx.removeCSSClassName(spinPrevElem, "amx-selected");
        });
        $spinPrevElem.bind("mouseout",function()
        {
          adf.mf.internal.amx.removeCSSClassName(spinPrevElem, "amx-selected");
        });

        $spinNextElem.bind(mousedown,function(e)
        {
          adf.mf.internal.amx.addCSSClassName(spinNextElem, "amx-selected");
        });
        $spinNextElem.bind(mouseup,function(e)
        {
          adf.mf.internal.amx.removeCSSClassName(spinNextElem, "amx-selected");
        });
        $spinNextElem.bind("mouseout",function()
        {
          adf.mf.internal.amx.removeCSSClassName(spinNextElem, "amx-selected");
        });
      }
    }
  }

  this._sizeDatabody(databody, outerWidth, outerHeight);
  databody.style.zIndex = 1;

  if (currentItemKey)
  {
    this._updateTextForNewCurrentItemKey(currentItemKey);
  }
};

/********************************************************
 * Event Handlers
 ********************************************************/

AmxRcfCarouselPeer.prototype._handleHover = function(domEvent)
{
  var peer = domEvent.data;
  var component = peer.getComponent();
  peer._handleInstanceHover(component, domEvent);
};

AmxRcfCarouselPeer.prototype._handleInstanceHover = function(component, domEvent)
{
  if (this._POP_OUT != "hover" || this._displayItems == "oneByOne")
    return; // short circuit unless circular and hover pop-out enabled

  if (!this._virtInitialized || this._duringThumbDrag || this._duringDatabodyDrag)
    return; // must have a databody, must warrant pop-out, must let drag hovers win over non-drag hovers

  // Ensure that this only applies to the databody
  var agent  = AmxRcfAgent.AGENT;
  var target = agent.getEventTarget(domEvent);

  // Make sure that the carousel is not empty or else there is nothing to interact with.
  if (target && !this._isEmpty)
  {
    var attrs = this._getRowKeyAndRow(target, this.getDomElement());
    if (attrs != null)
    {
      var rowKey = attrs[0];
      var row = attrs[1];
      if (rowKey != null)
      {
        if (this._currentItemKey != rowKey && rowKey != null) // we don't want to re-pop-out something that is already selected!
        {
          this._hoverKeyPreventingTaps = rowKey;

          var rowData = this._findRowByKey(this._currentItemKey, true /*firstByDefault*/);
          if (!rowData)
          {
            AmxRcfLogger.LOGGER.severe("During HandleDomTouchMove, a null rowData was found for \"" + this._currentItemKey + "\".");
            return;
          }
          var selectedWrapper = rowData.row;

          var popOutDetails = {
            hoverKey:     rowKey,
            hoverWrapper: row
          };
          this._animateRowsForNewSelectedWrapperElement(selectedWrapper, null, popOutDetails);
        }
        else
        {
          // Clean up pop-out animation
          this._cleanUpHoverState();
        }
      }
    }
  }

  //cancel the "tap and hold" timer whenever the touch moves
  if (this.touchTimoutEvent != null)
  {
    clearTimeout(this.touchTimoutEvent);
    this.touchTimoutEvent = null;
  }
};

AmxRcfCarouselPeer.prototype._cleanUpHoverState = function()
{
  if (this._lastHoverKey != null)
  {
    var animateRequired = true;
    if (this._currentItemKey == this._lastHoverKey)
    {
      animateRequired = false;
    }
    this._lastHoverKey = null;

    if (animateRequired)
    {
      var rowData = this._findRowByKey(this._currentItemKey, true /*firstByDefault*/);
      if (!rowData)
      {
        AmxRcfLogger.LOGGER.severe("During _cleanUpHoverState, a null rowData was found for \"" + this._currentItemKey + "\".");
        return;
      }
      var selectedWrapper = rowData.row;

      // Animate back to the real selected item:
      var popOutDetails = {
        hoverKey:     null,
        hoverWrapper: null
      };
      this._animateRowsForNewSelectedWrapperElement(selectedWrapper, null, popOutDetails);
    }
  }

  if (this._hoverKeyPreventingTaps != null)
  {
    this._hoverKeyPreventingTaps = null;
  }
};

AmxRcfCarouselPeer.HandleDomMouseOut = function(domEvent)
{
  var peer = domEvent.data;
  peer._handleComponentMouseOut(domEvent);
};

AmxRcfCarouselPeer.prototype._handleComponentMouseOut = function(domEvent)
{
  if (!this._virtInitialized)
    return;

  // This component mouse out event handler is needed to stop the timer of the auto spin, when
  // moving the mouse away from the previous/next buttons.
  if (this._incrementMouseHoldMode)
  {
    var agent = AmxRcfAgent.AGENT;
    var target = agent.getEventTarget(domEvent);

    var component = this.getComponent();
    var id = component.getClientId();
    var spinPrevElem = this._sp;
    var spinNextElem = this._sn;
    if (target.id == spinPrevElem.id || target.id == spinNextElem.id)
    {
      self.clearInterval(this._incrementMouseHoldTimerId);
      this._incrementMouseHoldTimerId = null;
      this._incrementMouseHoldMode = null;
    }
  }
};

AmxRcfCarouselPeer.HandleDomTouchStart = function(domEvent)
{
  var peer = domEvent.data;
  peer._handleComponentTouchStart(domEvent);
};

AmxRcfCarouselPeer.prototype._handleComponentTouchStart = function(domEvent)
{
  if (!this._virtInitialized)
    return;

  //cancel the "tap and hold" timer started by a previous touch
  if (this.touchTimoutEvent != null)
  {
    clearTimeout(this.touchTimoutEvent);
  }
  //(re)start the "tap and hold" timer, which will fire if the touch does not move or end before the
  //timer expires
  this.touchTimoutEvent = setTimeout(this._handleHover, 200, domEvent);

  var agent = AmxRcfAgent.AGENT;
  var target = agent.getEventTarget(domEvent);

  if (!agent.isLeftButton(domEvent))
    return;

  if (target && target.id)
  {
    var component  = this.getComponent();
    var id         = component.getClientId();

    if (this._controlArea != "none")
    {
      var spinPrevElem = this._sp;
      var spinNextElem = this._sn;
      if (target.id == spinPrevElem.id || target.id == spinNextElem.id)
      {
        // Stash the current prev/next mode to be used by the _incrementCarouselPosition callback:
        var holdMode = "prev";
        if (target.id == spinNextElem.id)
        {
          holdMode = "next";
        }
        this._incrementMouseHoldMode = holdMode;

        // The callback will call the _initMouseHoldIncrementRepeat which will invoke the *real* repeater.
        // This uses an init function to get a delay for the first mouse down event or else there
        // would be a double movement for a quick single click (clicks are needed for accessibility
        // and for textual icon support).
        var stashInterval = self.setInterval(AmxRcfObject.createInstanceCallback(this, this._initMouseHoldIncrementRepeat), 1000);
        this._incrementMouseHoldTimerId = stashInterval;
        return;
      }
    }
  }
};

AmxRcfCarouselPeer.HandleDomTouchEnd = function(domEvent)
{
  var peer = domEvent.data;
  peer._handleComponentTouchEnd(domEvent);
};

AmxRcfCarouselPeer.prototype._handleComponentTouchEnd = function(domEvent)
{
  if (!this._virtInitialized)
    return;

  //cancel the "tap and hold" timer started by a previous touch if the touch ended before the timer
  //was fired
  if (this.touchTimoutEvent != null)
  {
    clearTimeout(this.touchTimoutEvent);
    this.touchTimoutEvent = null;
  }

  if (this._incrementMouseHoldMode)
  {
    var agent = AmxRcfAgent.AGENT;
    var target = agent.getEventTarget(domEvent);

    var component = this.getComponent();
    var id = component.getClientId();
    var spinPrevElem = this._sp;
    var spinNextElem = this._sn;
    if (target.id == spinPrevElem.id || target.id == spinNextElem.id)
    {
      //clear the interval so that the increase/decrease stops!
      self.clearInterval(this._incrementMouseHoldTimerId);
      this._incrementMouseHoldTimerId = null;
      this._incrementMouseHoldMode = null;

      // Avoid moving twice as a result from the mouse down hold support and from the click event
      // required if the button is a text icon which cannot support mouse down hold support:
      agent.eatEvent(domEvent);
    }
  }
  else if (this._POP_OUT == "hover" && this._displayItems != "oneByOne")
  {
    // Clean up pop-out animation but do it later so this touch end cleanup doesn't cause the click to spin the carousel:
    var domWindow = AmxRcfPage.PAGE.getDomWindow();
    var callback =
      new Function("var c = arguments.callee;c._self._cleanUpHoverStateLater();");
    callback["_self"] = this;
    domWindow.setTimeout(callback, 1);
  }
};

AmxRcfCarouselPeer.prototype["_cleanUpHoverStateLater"] = function()
{
  this._cleanUpHoverState();
};

/**
 * Callback function, started by an interval. This function removes itself from the interval and
 * starts a new one, which will only removed, by the mouse up event.
 */
AmxRcfCarouselPeer.prototype._initMouseHoldIncrementRepeat = function()
{
  // Clear the interval so that the previous/next stepping for a mouse down hold stops!
  self.clearInterval(this._incrementMouseHoldTimerId);
  var stashInterval = self.setInterval(AmxRcfObject.createInstanceCallback(this, this._incrementCarouselPosition), 100);
  this._incrementMouseHoldTimerId = stashInterval;
};

/**
 * Controller for the main increment or decrement function.
 * @see AmxRcfObject#createInstanceCallback
 */
AmxRcfCarouselPeer.prototype._incrementCarouselPosition = function()
{
  // These Strings correspond to the "holdMode" specified in the mouse down handler:
  if (this._incrementMouseHoldMode == "prev")
  {
    this._initiateSpinPreviousAnimation();
  }
  else if (this._incrementMouseHoldMode == "next")
  {
    this._initiateSpinNextAnimation();
  }
};

AmxRcfCarouselPeer.prototype._handleThumbDragPositioning = function(domEvent, dragExtra)
{
  this._lastDrag    = (new Date()).getTime(); // disambiguate clicking from a drag release
  var agent         = AmxRcfAgent.AGENT;
  var spinBarElem   = this._sb;
  var mousePosition = {x:dragExtra.pageX, y:dragExtra.pageY};
  if (this._isVertical)
  {
    var barOffsetHeight = spinBarElem.offsetHeight;
    var newYFactor = agent.getElementTop(spinBarElem) + barOffsetHeight - mousePosition.y;
    newYFactor /= barOffsetHeight;
    newYFactor = 1 - newYFactor;
    this._updateTransientDragPosition(newYFactor);
    this._initiateSpinPercentAnimation(newYFactor);
  }
  else
  {
    var newXFactor = mousePosition.x - agent.getElementLeft(spinBarElem);
    newXFactor /= spinBarElem.offsetWidth;
    if (AmxRcfCarouselPeer._isRTL())
    {
      newXFactor = 1 - newXFactor;
    }
    this._updateTransientDragPosition(newXFactor);
    this._initiateSpinPercentAnimation(newXFactor);
  }
};

AmxRcfCarouselPeer.prototype._finishThumbDrag = function(domEvent, dragExtra)
{
  delete this._duringThumbDrag;
  this._handleThumbDragPositioning(domEvent, dragExtra);
  this._doResizeNotifyOnDisplayedChildren();
};

AmxRcfCarouselPeer.prototype._handleDatabodyDragPositioning = function(domEvent, dragExtra)
{
  var component = this.getComponent();
  if (component.getDisabled() || this._isEmpty)
  {
    return;
  }

  this._lastDrag = (new Date()).getTime(); // disambiguate clicking from a drag release

  var startPageOffset;
  var pageOffset;

  if (this._isVertical)
  {
    startPageOffset = dragExtra.startPageY;
    pageOffset      = dragExtra.pageY;
  }
  else
  {
    startPageOffset = dragExtra.startPageX;
    pageOffset      = dragExtra.pageX;
  }

  var rowData = this._findRowByKey(this._currentItemKey, true /*firstByDefault*/);
  if (rowData)
  {
    var selectedWrapper = rowData.row;
    var distanceFromOriginalOffset = pageOffset - startPageOffset;
    if (AmxRcfCarouselPeer._isRTL())
      distanceFromOriginalOffset *= -1;
    this._sizeDatabodyForDirectManipulation(selectedWrapper, distanceFromOriginalOffset);
  }
};

AmxRcfCarouselPeer.prototype._finishDatabodyDrag = function(domEvent, dragExtra)
{
  delete this._duringDatabodyDrag;
  this._queuedScrollAmount = null;
};

AmxRcfCarouselPeer.prototype._getRowIndexFromThumbPos = function()
{
  var agent      = AmxRcfAgent.AGENT;
  var factor;

  if (this._controlArea == "small" || this._controlArea == "compact" || this._controlArea == "none")
  {
    factor = this._getCurrentPercent();
  }
  else // this._controlArea == "full"
  {
    var spinThumbElem = this._st;
    var spinBarElem   = this._sb;
    if (this._isVertical)
    {
      var barOffsetHeight = spinBarElem.offsetHeight;
      factor = agent.getElementTop(spinBarElem) + barOffsetHeight
                    - agent.getElementTop(spinThumbElem);
      factor /= barOffsetHeight;
      factor = 1 - factor;
    }
    else
    {
      factor = agent.getElementLeft(spinThumbElem) - agent.getElementLeft(spinBarElem);
      factor /= spinBarElem.offsetWidth;
      if (AmxRcfCarouselPeer._isRTL())
      {
        factor = 1 - factor;
      }
    }
  }

  var rowCount = this._rowCount;
  if (rowCount == -1)
    AmxRcfAssert.assert(false, "Unknown carousel item count " + rowCount);

  return Math.max(0, Math.round(factor * (rowCount - 1)));
};

AmxRcfCarouselPeer.HandleDomClick = function(domEvent)
{
  var peer = domEvent.data;
  peer._handleComponentClick(domEvent);
};

AmxRcfCarouselPeer.prototype._handleComponentClick = function(domEvent)
{
  if (this._lastDrag != null && (new Date()).getTime() - this._lastDrag < 100)
  {
    return; // click was too close the last drag release so ignore it
  }

  if (this._hoverKeyPreventingTaps != null)
  {
    return; // click was during a hover popout so ignore it
  }
  else if (this.touchTimoutEvent != null)
  {
    //cancel the "tap and hold" timer started by a previous touch if the touch ended before the timer
    //was fired
    clearTimeout(this.touchTimoutEvent);
    this.touchTimoutEvent = null;
  }

  var agent = AmxRcfAgent.AGENT;
  var target = agent.getEventTarget(domEvent);

  // Make sure that the carousel is not empty or else there is nothing to interact with.
  if (target && !this._isEmpty)
  {
    var attrs = this._getRowKeyAndRow(target, this.getDomElement());
    if (attrs != null)
    {
      var rowKey = attrs[0];
      var row = attrs[1];
      if (rowKey != null)
      {
        if (agent.isLeftButton(domEvent))
        {
          this._handleItemClick(domEvent, rowKey, row);
        }
        return;
      }
    }
    else if (this._controlArea != "small" && this._controlArea != "compact" && this._controlArea != "none")
    {
      var id = this.getComponent().getClientId();
      var spinBarElem  = this._sb;
      if (target.id == spinBarElem.id)
      {
        var mousePosition = agent.getMousePosition(domEvent);
        var spinThumbElem = this._st;
        spinThumbElem.focus();
        if (this._isVertical)
        {
          var barOffsetHeight = spinBarElem.offsetHeight;
          var newYFactor = agent.getElementTop(spinBarElem) + barOffsetHeight - mousePosition.y;
          newYFactor /= barOffsetHeight;
          newYFactor = 1 - newYFactor;
          this._initiateSpinPercentAnimation(newYFactor,this._getCurrentPercent());
        }
        else // horizontal
        {
          var newXFactor = mousePosition.x - agent.getElementLeft(spinBarElem);
          newXFactor /= spinBarElem.offsetWidth;
          if (AmxRcfCarouselPeer._isRTL())
          {
            newXFactor = 1 - newXFactor;
          }
          this._initiateSpinPercentAnimation(newXFactor,this._getCurrentPercent());
        }
      }
    }
  }
};

AmxRcfCarouselPeer.prototype._sizeDatabody = function(databody, outerWidth, outerHeight)
{
  var agent       = AmxRcfAgent.AGENT;
  var component   = this.getComponent();
  var rootElement = this.getDomElement();
  this._setupInitialPositions(component, rootElement);

  var databodyWidth  = Math.max(0, outerWidth);  // int, number of pixels
  var databodyHeight = Math.max(0, outerHeight); // int, number of pixels
  var vertical       = this._isVertical;

  // Account for the spin control container size:
  if (vertical)
  {
    databodyWidth = Math.max(0, databodyWidth - this._nonDatabodySize);
  }
  else // horizontal
  {
    databodyHeight = Math.max(0, databodyHeight - this._nonDatabodySize);
  }

  // Determine the dimensions of the selected item (square).
  var selectedSize = databodyHeight;
  if (vertical)
  {
    databodyHeight -= this._heightOfBoxUnderCurrentItem; // subtract the height of the box
    selectedSize = databodyWidth;
    if (databodyHeight < databodyWidth)
    {
      // In a vertical orientation, having a smaller height than width means that we need to be
      // slightly smaller than the databody's height:
      selectedSize = Math.max(0, databodyHeight - 2*AmxRcfCarouselPeer._ITEM_PADDING);
    }
  }
  else // horizontal
  {
    if (databodyWidth < databodyHeight)
    {
      // In a horizontal orientation, having a smaller width than height means that we need to be
      // slightly smaller than the databody's width:
      selectedSize = Math.max(0, databodyWidth - 2*AmxRcfCarouselPeer._ITEM_PADDING);
    }
  }

  // Subtract a little more and ensure that the selected size is no smaller than a minimum:
  selectedSize = Math.round(Math.max(30, selectedSize - 2*AmxRcfCarouselPeer._ITEM_PADDING));

  // Save off the databody dimensions and selectedSize for use by animations:
  this._databodyWidth  = databodyWidth;
  this._databodyHeight = databodyHeight;
  this._selectedSize   = selectedSize;

  // When using non-center halign or non-middle valign, these margin values are for use by animations
  this._widthMargin  = (databodyWidth - selectedSize) / 2;
  this._heightMargin = (databodyHeight - selectedSize) / 2;

  // Size the control area if non-full:
  if (this._controlArea == "small" || this._controlArea == "compact")
  {
    var controlArea              = this._getControlAreaDiv();
    var controlAreaComputedStyle = agent.getComputedStyle(controlArea);
    var controlAreaStyle         = controlArea.style;
    var controlAreaBoxCorrection = 0;
    var controlPaddingLeft       = parseInt(controlAreaComputedStyle.paddingLeft, 10);
    var controlPaddingRight      = parseInt(controlAreaComputedStyle.paddingRight, 10);
    controlAreaBoxCorrection     += controlPaddingLeft;
    controlAreaBoxCorrection     += controlPaddingRight;
    controlAreaStyle.width       = (selectedSize - controlAreaBoxCorrection) + "px";
    controlAreaStyle.right       = "auto";
    controlAreaStyle.left        =
      this._getHalignLeft(vertical, component.getHalign(), databodyWidth, selectedSize, 0) +
      "px";
    if (vertical)
    {
      controlAreaStyle.top =
        this._getValignTop(vertical, component.getValign(), databodyHeight, selectedSize, 0) +
        selectedSize +
        "px";
    }
  }
  else if (vertical)
  {
    // The position of the vertical selected item text is now known, position the selected item div:
    var itemTextDiv        = this._it;
    var computedStyle      = agent.getComputedStyle(itemTextDiv);
    var itemTextDivStyle   = itemTextDiv.style;
    var boxModelCorrection = 0;
    boxModelCorrection     += parseInt(computedStyle.paddingLeft, 10);
    boxModelCorrection     += parseInt(computedStyle.paddingRight, 10);
    itemTextDivStyle.width = (selectedSize - boxModelCorrection) + "px";
    itemTextDivStyle.left  =
      this._getHalignLeft(true, component.getHalign(), databodyWidth, selectedSize, 0) +
      (AmxRcfCarouselPeer._isRTL() ? parseInt(databody.offsetLeft) : 0) +
      "px";
    itemTextDivStyle.top   =
      this._getValignTop(true, component.getValign(), databodyHeight, selectedSize, 0) +
      selectedSize +
      "px";
  }

  // Size the databody if necessary:
  if (this._displayItems == "oneByOne")
  {
    // In oneByOne mode, the data body should be exactly the size of the selected item.
    var databodyStyle    = databody.style;
    databodyStyle.width  = selectedSize + "px";
    databodyStyle.height = selectedSize + "px";
    databodyStyle.right  = "auto";
    databodyStyle.bottom = "auto";
    databodyStyle.left   =
      this._getHalignLeft(vertical, component.getHalign(), databodyWidth, selectedSize, 0) + "px";
    databodyStyle.top    =
      this._getValignTop(vertical, component.getValign(), databodyHeight, selectedSize, 0) + "px";
  }

  // oneByOne and full
  if (this._displayItems == "oneByOne" &&
      this._controlArea != "small" &&
      this._controlArea != "compact" &&
      this._controlArea != "none")
  {
    var spinPrevElem = this._sp;
    var spinBarElem  = this._sb;
    var spinNextElem = this._sn;

    if (vertical)
    {
      var valign            = component.getValign();
      var prevHeight        = spinPrevElem.offsetHeight;
      var nextHeight        = spinNextElem.offsetHeight;
      var selectedItemTop   = this._getValignTop(true, valign, databodyHeight, selectedSize, 0);
      var itemTextDivHeight = this._it.offsetHeight;
      var barTop            = selectedItemTop + prevHeight;
      var barBottom         = selectedItemTop + selectedSize + itemTextDivHeight - nextHeight;

      // Assign the bottom and top styles of the next/previous buttons and spin bar:
      spinPrevElem.style.bottom = outerHeight - barTop + "px";
      spinBarElem.style.top     = barTop + "px";
      spinBarElem.style.bottom  = outerHeight - barBottom + "px";
      spinNextElem.style.top    = barBottom + "px";
    }
    else
    {
      var halign           = component.getHalign();
      var prevWidth        = spinPrevElem.offsetWidth;
      var nextWidth        = spinNextElem.offsetWidth;
      var selectedItemLeft = this._getHalignLeft(false, halign, databodyWidth, selectedSize, 0);
      var barLeft          = selectedItemLeft + prevWidth;
      var barRight         = selectedItemLeft + selectedSize - nextWidth;

      // Assign the bottom and top styles of the next/previous buttons and spin bar:
      spinBarElem.style.left   = barLeft + "px";
      spinBarElem.style.right  = outerWidth - barRight + "px";
      if (AmxRcfCarouselPeer._isRTL())
      {
        spinPrevElem.style.left  = barRight + "px";
        spinNextElem.style.right = outerWidth - barLeft + "px";
      }
      else
      {
        spinPrevElem.style.right = outerWidth - barLeft + "px";
        spinNextElem.style.left  = barRight + "px";
      }

      // If necessary, adjust the current item text so that it is centered under the current item:
      if (halign == "start")
      {
        this._it.style.right =
          outerWidth - 2*selectedItemLeft - selectedSize + "px";
      }
      else if (halign == "end")
      {
        this._it.style.left =
          2*selectedItemLeft + selectedSize - outerWidth + "px";
      }
    }
  }

  AmxRcfAssert.assert(!databody.firstChild || this._currentItemKey,
                    "There is no current item in the data block");
  // Get the wrapper element for the current item:
  if (this._currentItemKey)
  {
    var rowData = this._findRowByKey(this._currentItemKey, true /*firstByDefault*/);
    if (rowData)
    {
      var selectedWrapper = rowData.row;
      this._sizeDatabodyForSelectedWrapperElement(selectedWrapper, false);
      this._queueResizeNotifyOnDisplayedChildren();
    }
    else
    {
      AmxRcfLogger.LOGGER.severe(
        "_sizeDatabody failed due to invalid currentItemKey: " +
        this._currentItemKey);
    }
  }
};

AmxRcfCarouselPeer._handlePreviousClick = function(domEvent)
{
  domEvent.data._initiateSpinPreviousAnimation();
};

AmxRcfCarouselPeer._handleNextClick = function(domEvent)
{
  domEvent.data._initiateSpinNextAnimation();
};

//enable mouse wheel scrolling over databody
AmxRcfCarouselPeer._handleMouseWheel = function(evt)
{
  if (!evt)
    evt = AmxRcfPage.PAGE.getDomWindow().event;

  // positive = right or down, negative = left or up
  var wheelDelta = evt.wheelDelta;
  var detail = evt.detail;
  if (isNaN(wheelDelta) || isNan(detail))
  {
    // See http://bugs.jquery.com/ticket/10676
    var originalEvent = evt.originalEvent;
    wheelDelta = originalEvent.wheelDelta;
    detail = originalEvent.detail;
  }
  var scrollAmount = wheelDelta != null ? -wheelDelta/4 : evt.detail*4;
  var peer = evt.data;
  if (peer._isVertical)
  {
    // Invert when RTL and horizontal (unfortunately, cannot distinguish up/down vs. left/right)
    scrollAmount *= -1;
  }

  // This is not an instance function. "this" refers to the element where event handler was installed
  peer._scrollByMouseWheel(scrollAmount, false);

  // Ideally, we would really like to only eat the event if the scroll was in the axis equivalent of
  // the carousel's orientation.  However, the browser do not yet expose any APIs to detect,
  // diagonal or directional scrolls.
  AmxRcfAgent.AGENT.eatEvent(evt);
};

AmxRcfCarouselPeer.prototype._scrollByMouseWheel = function(scrollAmount)
{
  // Observed (but not official) single scroll "click stops" equate to:
  // Firefox 3:         4
  // Internet Explorer: 3
  // Safari 3:          30
  if (Math.abs(scrollAmount) <= 30)
  {
    // Treat this as scrolling by a single item:
    if (scrollAmount > 0)
    {
      // Go to the next item:
      this._initiateSpinNextAnimation();
    }
    else if (scrollAmount != 0)
    {
      // Go to the previous item:
      this._initiateSpinPreviousAnimation();
    }
  }
  else
  {
    // Treat this as a long jump:
    var databody = this._db;
    var bodySize;
    if (this._isVertical)
    {
      bodySize = databody.offsetHeight;
    }
    else
    {
      bodySize = databody.offsetWidth;
    }

    if (this._queuedScrollAmount != null)
    {
      scrollAmount += this._queuedScrollAmount;
    }

    var dragPercent = scrollAmount / bodySize;
    this._queuedScrollAmount = null;
    var currentPercent = this._getCurrentPercent();
    var desiredPercent = Math.max(0, Math.min(100, 100*currentPercent + 100*dragPercent));
    this._initiateSpinPercentAnimation(desiredPercent / 100);
  }
};

/**
 * Returns the row key attribute and the row from a dom element. If necessary,
 * walks up the dom hierarchy to find the element with the rowKey attribute
 */
AmxRcfCarouselPeer.prototype._getRowKeyAndRow = function(
  domElement,
  rootDomElement)
{
  AmxRcfAssert.assertDomElement(domElement);

  var currElement = domElement;
  var agent = AmxRcfAgent.AGENT;

  if ( (currElement == null) || (currElement.nodeType != 1) )
  {
    // we cannot get int attributes from null objects nor can we get them from
    // nodes that are not elements (e.g. instances of HTMLDocument)
    return null;
  }
  var rowKey = agent.getAttribute(currElement, "data-amxRk");

  // Starting from the domElement where the event occurred, walk up the
  // dom hierarchy until we reach the row.  Then grab the index off of it.
  while (rowKey == null)
  {
    if (currElement == null || currElement == rootDomElement)
      return null;

    currElement = currElement.parentNode;
    if ( (currElement == null) || (currElement.nodeType != 1) )
    {
      // we cannot get int attributes from null objects nor can we get them from
      // nodes that are not elements (e.g. instances of HTMLDocument)
      return null;
    }
    rowKey = agent.getAttribute(currElement, "data-amxRk");

  }

  return [rowKey, currElement];
};

/********************************************************
 * Selection Logic
 ********************************************************/

AmxRcfCarouselPeer.prototype.ComponentCurrentItemKeyChanged = function(
  component,
  domElement,
  newValue,
  oldValue)
{
  // If the current item is set based on UI interaction we do not need to update items in view.
  // However if a developer sets the current item using setCurrentItem JS we need to update our view
  if (!this._ignoreCurrentItemSet)
  {
    var rowData = this._findRowByKey(newValue, false /*firstByDefault*/);

    if (rowData == null)
    {
      // =-= Future consideration, if the key does not exist on the client, consider queueing an
      //     event to the server requesting that the carousel be spun such that the key becomes
      //     available (if the key actually corresponds to a real item in the carousel's data).
      // In the mean time, throw an assertion failure since the client key is invalid.
      AmxRcfAssert.assert(
        rowData != null,
        "The carousel '" + component.getClientId() + "' does not any item in the current set of fetched items with client key: " + newValue);
    }
    else
    {
      // =-= Future consideration, animate this change, may need a switch to turn this on/off
      //     because another animation may already be in place.
      this._currentItemKey = newValue;
      var selectedWrapper = rowData.row;
      this._sizeDatabodyForSelectedWrapperElement(selectedWrapper, false);

      // update the text for the current item
      this._updateTextForNewCurrentItemKey(newValue);
    }
  }
};

/**
 * Updates the current item key to the new key. This also sets the component property and queues
 * a spin event.
 * @param {String} key the new current item key
 * @param {Boolean:true} ignoreValidation if the currentItemKey is being set after a data fetch,
 *                       for e.g. because of a long jump etc we do not need to the validation etc.
 */
AmxRcfCarouselPeer.prototype._updateCurrentItemKey = function(key, ignoreValidation)
{
  var carousel = this.getComponent();
  this._currentItemKey = key;
  this._ignoreCurrentItemSet = true;
  AmxRcfLogger.LOGGER.finer("Update current item key to:", key);
  carousel.setCurrentItemKey(key);
  this._ignoreCurrentItemSet = false;
  this._updateTextForNewCurrentItemKey(key);
  return true;
};

AmxRcfCarouselPeer.prototype._updateTextForNewCurrentItemKey = function(key)
{
  // Make sure that the text for this item is displayed:
  var rowData = this._findRowByKey(key, true /*firstByDefault*/);
  AmxRcfAssert.assert(rowData != null, "Unexpected null rowData for key \"" + key + "\".");

  if (rowData)
  {
    var currentItemElement = AmxRcfDomUtils.getFirstChildElement(rowData.row);
    var itemTextDiv        = this._it;

    this._waitingForTextClientId = null;
    AmxRcfAssert.assertDomElement(currentItemElement);
    var text = AmxRcfAgent.AGENT.getAttribute(currentItemElement, "data-amxtext");
    var newText = text == null ? "" : text;
    itemTextDiv.title = newText;
    itemTextDiv.innerHTML = newText;

    this._updateSelectedItemClass(currentItemElement);
  }
};

AmxRcfCarouselPeer.prototype._updateSelectedItemClass = function(newCurrentItemElement/*newCurrentItemComponent*/)
{
  var page               = AmxRcfPage.PAGE;
  var selectedStyleClass = page.getLookAndFeel().getStyleClass("p_AMXSelected");
  var rows               = this._db.firstChild.childNodes; // get the child nodes of the first block
  var rowCount           = rows.length;

  // Remove the old selected item style class:
  for (var r=0; r<rowCount; ++r)
  {
    var row = rows[r];
    var removed = adf.mf.internal.amx.removeCSSClassName(row, selectedStyleClass);
    if (removed)
    {
      // Add the screen reader info to make it non-selected:
      row.setAttribute("aria-hidden", "true"); // Note: toggling this doesn't work on iOS 5 but does in iOS 6

      // Only one wrapper can be selected so we can short circuit now
      break;
    }
  }

  // Add the new selected item style class (if applicable):
  if (newCurrentItemElement != null)
  {
    var currentItemWrapper = newCurrentItemElement.parentNode;
    adf.mf.internal.amx.addCSSClassName(currentItemWrapper, selectedStyleClass);

    // Remove the screen reader info that made it non-selected:
    currentItemWrapper.setAttribute("aria-hidden", "false"); // Note: toggling this doesn't work on iOS 5 but does in iOS 6
  }
};

AmxRcfCarouselPeer.prototype._queueResizeNotifyOnDisplayedChildren = function()
{
  // If we have an existing pending text update, let's cancel it since it isn't needed anymore:
  if (this._pendingResizeNotify)
  {
    window.clearTimeout(this._pendingResizeNotify);
    delete this._pendingResizeNotify;
  }

  var domWindow = AmxRcfPage.PAGE.getDomWindow();
  var callback =
    new Function("var c = arguments.callee;c._self._delRes();");
  callback["_self"] = this;

  this._pendingResizeNotify = domWindow.setTimeout(callback, 1);
};

AmxRcfCarouselPeer.prototype["_delRes"] = function()
{
  this._doResizeNotifyOnDisplayedChildren();
};

AmxRcfCarouselPeer.prototype._handleItemClick = function(evt, rowKey, row)
{
  if (this._currentItemKey != rowKey && rowKey != null) // we don't want to re-select something that is already selected!
  {
    this._initiateSpinSpecificExistingItemAnimation(rowKey, row);
  }
};

// ******* misc methods *****

/**
 * Returns the row and the index associated with the rowKey in the dom structure
 * @param {String} rowKey the rowKey to look for in dom structure
 * @param {Boolean} firstByDefault true if the first available row should be returned when the given
 *                                 rowKey is not non-null but no corresponding row info is present
 *                                 (e.g. rowKey was from an old state of the data model but
 *                                 the member currentItemKey was not reset)
 * @return {Object} an object literal with row and index attributes if the rowkey is found else null
 */
AmxRcfCarouselPeer.prototype._findRowByKey = function(rowKey, firstByDefault)
{
  var rowInfo = null;
  var block = this._db.firstChild; // get the first block
  var rows = block.childNodes;

  // Only loop through the items:
  for (var r=0; r<rows.length && !rowInfo; r++)
  {
    var row = rows[r];
    var rowKeyAttribute = row.getAttribute("data-amxRk");
    if (rowKey == rowKeyAttribute)
    {
      // We have a match:
      rowInfo = {
        row: row,
        index: block.startRow + r,
        block: block
      };
      break;
    }
  }

  if (firstByDefault && rowInfo == null && rows.length > 0)
  {
    var firstRow = rows[0];
    rowInfo = {row: firstRow, index: block.startRow, block: block};
    var firstKey = AmxRcfAgent.AGENT.getAttribute(firstRow, "data-amxRk");
    this._updateCurrentItemKey(firstKey, true);
  }

  return rowInfo;
};

/********************************************************
 * Focus handling
 ********************************************************/

// Grabs the focus to the carousel
AmxRcfCarouselPeer.prototype._grabFocus = function()
{
  // ensure that the carousel has focus
  AmxRcfFocusUtils.focusElement(this.getDomElement());
};

/********************************************************
 * keyboard handling
 ********************************************************/

AmxRcfCarouselPeer.HandleDomKeyDown = function(domEvent)
{
  var peer = domEvent.data;
  peer._handleComponentKeyDown(domEvent);
};

AmxRcfCarouselPeer.prototype._handleComponentKeyDown = function(domEvent)
{
  // ignore if the event has already been canceled
//  if (componentEvent.isCanceled())
//  {
//    return;
//  }

//  var domEvent = componentEvent.getNativeEvent();
  var agent = AmxRcfAgent.AGENT;
  var eventTarget = agent.getEventTarget(domEvent);
  var keyCode = domEvent.keyCode;
  var propagate = true;
  var eventTargetId = eventTarget.id;

  if (eventTarget && keyCode == 9) // tab key
  {
    propagate = this._handleTabKeyDown(eventTarget, domEvent.shiftKey);
  }

  // Make sure that the carousel is not empty or else there is nothing to interact with.
  if (propagate && eventTarget && eventTargetId && !this._isEmpty)
  {
    var id = this.getComponent().getClientId();
    var thumbTargeted = false;
    if (this._controlArea != "small" && this._controlArea != "compact" && this._controlArea != "none")
    {
      // only applicable in full mode
      var spinThumbElem = this._st;
      thumbTargeted = eventTargetId == spinThumbElem.id;
    }
    if (thumbTargeted || eventTargetId == id)
    {
      var rtl = AmxRcfCarouselPeer._isRTL();
      switch (keyCode)
      {
        case 38: // up
          if (this._isVertical)
          {
            if (domEvent.shiftKey)
              this._initiateSpinStartAnimation();
            else
              this._initiateSpinPreviousAnimation();
            propagate = false;
          }
          break;
        case 40: // down
          if (this._isVertical)
          {
            if (domEvent.shiftKey)
              this._initiateSpinEndAnimation();
            else
              this._initiateSpinNextAnimation();
            propagate = false;
          }
          break;
        case 39: // right
          if (!this._isVertical)
          {
            if (rtl)
            {
              if (domEvent.shiftKey)
                this._initiateSpinStartAnimation();
              else
                this._initiateSpinPreviousAnimation();
              propagate = false;
            }
            else
            {
              if (domEvent.shiftKey)
                this._initiateSpinEndAnimation();
              else
                this._initiateSpinNextAnimation();
              propagate = false;
            }
          }
          break;
        case 37: // left
          if (!this._isVertical)
          {
            if (rtl)
            {
              if (domEvent.shiftKey)
                this._initiateSpinEndAnimation();
              else
                this._initiateSpinNextAnimation();
              propagate = false;
            }
            else
            {
              if (domEvent.shiftKey)
                this._initiateSpinStartAnimation();
              else
                this._initiateSpinPreviousAnimation();
              propagate = false;
            }
          }
          break;
        default:
          break;
      }
    }
  }

  if (!propagate)
    agent.eatEvent(domEvent);
};

AmxRcfCarouselPeer.prototype._handleTabKeyDown = function(eventTarget, shiftKey)
{
  var currentItemKey = this._currentItemKey;
  if (!currentItemKey)
  {
    // We only care about special tab handling if there are items in the carousel!
    return true;
  }

  // Tab handing in the carousel is tricky because the DOM elements in the non-current items should
  // not be focusable.  If the user tries to tab to them, we need to advance them past those items
  // and into the items that they can tab to.
  var propagate          = true;
  var rootElement        = this.getDomElement();
  var inDatabody         = adf.mf.internal.amx.isAncestorOrSelf(this._db, eventTarget);
  var nextFocusable;
  if (this._controlArea == "none")
  {
    var itemTextDiv = this._it;
    nextFocusable = AmxRcfFocusUtils.getNextTabStop(itemTextDiv, null, true);
  }
  else
  {
    var spinPrevElem = this._sp;
    nextFocusable = spinPrevElem;
  }
  var inCurrentItem      = false;
  var currentItemElement = null;
  var rowData            = this._findRowByKey(currentItemKey, false /*firstByDefault*/);

  if (rowData)
  {
    currentItemElement = rowData.row;
    inCurrentItem      = adf.mf.internal.amx.isAncestorOrSelf(currentItemElement, eventTarget);
  }

  if (shiftKey) // tab key with shift held down
  {
    if (inDatabody)
    {
      // Event happened on something inside of the databody.
      if (inCurrentItem)
      {
        // Check to see what the first focusable element is within the current item.
        // If that element is the event target, then we need to move focus to the root element.
        // Otherwise, let the browser do its natural shift+tab behavior.
        var firstTabStopInCurrentItem = AmxRcfFocusUtils.getFirstTabStop(currentItemElement, false);
        if (firstTabStopInCurrentItem == eventTarget)
        {
          // Move focus to the root element (it has tabindex=0):
          AmxRcfFocusUtils.focusElement(rootElement);
          propagate = false;
        }
      }
      else
      {
        // Move focus to the root element (it has tabindex=0):
        AmxRcfFocusUtils.focusElement(rootElement);
        propagate = false;
      }
    }
    else // not in databody
    {
      var inPrevElem = adf.mf.internal.amx.isAncestorOrSelf(nextFocusable, eventTarget);
      if (inPrevElem)
      {
        // Attempt to move focus to the last focusable element within the current item.
        // If there was no element to move focus to, move focus to the root element.
        if (!AmxRcfFocusUtils.focusLastTabStop(currentItemElement))
        {
          // Move focus to the root element (it has tabindex=0):
          AmxRcfFocusUtils.focusElement(rootElement);
        }
        propagate = false;
      }
    }
  }
  else // tab key WITHOUT shift held down
  {
    if (inDatabody)
    {
      // Event happened on something inside of the databody.
      if (inCurrentItem)
      {
        // Check to see what the last focusable element is within the current item.
        // If that element is the event target, then we need to move focus to the spin-previous button.
        // Otherwise, let the browser do its natural tab behavior.
        var lastTabStopInCurrentItem = AmxRcfFocusUtils.getLastTabStop(currentItemElement, false);
        if (lastTabStopInCurrentItem == eventTarget)
        {
          // Move focus to the spin-previous button (or next focusable after databody).
          AmxRcfFocusUtils.focusElement(nextFocusable);
          propagate = false;
        }
      }
      else
      {
        // Move focus to the spin-previous button (or next focusable after databody).
        AmxRcfFocusUtils.focusElement(nextFocusable);
        propagate = false;
      }
    }
    else if (eventTarget == rootElement)
    {
      // Attempt to move focus to the first focusable element within the current item.
      // If there was no element to move focus to, move focus to the spin-previous button (or next focusable after
      // databody).
      if (!AmxRcfFocusUtils.focusFirstTabStop(currentItemElement))
      {
        AmxRcfFocusUtils.focusElement(nextFocusable);
      }
      propagate = false;
    }
  }

  return propagate;
};

/**
 * Returns the rowkey and the row after the selected row.
 */
AmxRcfCarouselPeer.prototype._getNextRowKeyAndRow = function(selectedRowKey)
{
  if (!selectedRowKey)
    return; // no data

  var agent = AmxRcfAgent.AGENT;
  var attrs = {};
  var rows = this._db.firstChild.childNodes; // get the child nodes of the first block
  var rowCount = rows.length;

  // Find the specified row then get the details about the next one after it:
  for (var j = 0; j < rowCount; ++j)
  {
    var row = rows[j];
    var rowKey = agent.getAttribute(row, "data-amxRk");

    // Skip placeholder items (placeholders do not have row keys):
    if (rowKey != null)
    {
      if (selectedRowKey == null)
      {
        attrs.rowKey = rowKey;
        attrs.row = row;
        break;
      }
      else if (rowKey == selectedRowKey)
      {
        attrs.lastRowKeyInView = rowKey;
        if (j+1 < rowCount)
        {
          row = rows[j+1];
          rowKey = agent.getAttribute(row, "data-amxRk");
          if (rowKey == null)
          {
            // There isn't a next row, just a placeholder so we need to return nothing.
            break;
          }
          attrs.rowKey = rowKey;
          attrs.row = row;
        }
        break;
      }
    }
  }
  return attrs;
};

/**
 * Returns the rowkey and the row before the selected row.
 */
AmxRcfCarouselPeer.prototype._getPreviousRowKeyAndRow = function(selectedRowKey)
{
  if (!selectedRowKey)
    return; // no data

  var agent = AmxRcfAgent.AGENT;
  var databody = this._db;
  var attrs = {};
  var rows = databody.firstChild.childNodes; // get the child nodes of the first block
  var rowCount = rows.length;

  // Find the specified row then get the details about the one before it:
  for (var j = rowCount-1; j >= 0; --j)
  {
    var row = rows[j];
    var rowKey = agent.getAttribute(row, "data-amxRk");

    // Skip placeholder items (placeholders do not have row keys):
    if (rowKey != null)
    {
      if (selectedRowKey == null)
      {
        attrs.rowKey = rowKey;
        attrs.row = row;
        break;
      }
      else if (rowKey == selectedRowKey)
      {
        attrs.lastRowKeyInView = rowKey;
        if (j-1 >= 0)
        {
          row = rows[j-1];
          rowKey = agent.getAttribute(row, "data-amxRk");
          if (rowKey == null)
          {
            // There isn't a previous row, just a placeholder so we need to return nothing.
            break;
          }
          attrs.rowKey = rowKey;
          attrs.row = row;
        }
        else if (agent.getIntAttribute(databody.firstChild, "data-amxStartRow", -1) == 0)
        {
          attrs.isAtTop = true;
        }
        break;
      }
    }
  }
  return attrs;
};

AmxRcfCarouselPeer._isRTL = function()
{
  return AmxRcfPage.PAGE.getLocaleContext().isRightToLeft();
};

/*************************
 * Spin animations
 *************************/

AmxRcfCarouselPeer.prototype._sizeDatabodyForDirectManipulation = function(
  selectedWrapper,
  distanceFromOriginalOffset)
{
  if (distanceFromOriginalOffset == 0)
  {
    // Just do the regular sizing since we have a clear selected wrapper:
    this._sizeDatabodyForSelectedWrapperElement(selectedWrapper, true);
    return;
  }

  // The biggest wrapper is not necessarily the selectedWrapper.
  // Figure out which wrapper is the new temporarily "selected" wrapper
  var selectedSize   = this._selectedSize;
  var itemDifference = 0;
  if (selectedSize != 0)
  {
    if (this._displayItems == "oneByOne")
      itemDifference = distanceFromOriginalOffset / selectedSize;
    else // "circular"
      itemDifference = distanceFromOriginalOffset / (selectedSize * this._SHIFT_FACTOR); // factor in the shift offsets
  }
  var directManipulationItem = selectedWrapper;

  // Figure out which item is the newly chosen item:
  if (itemDifference >= 1)
  {
    while (itemDifference >= 1)
    {
      var previousItem = AmxRcfDomUtils.getPreviousElement(directManipulationItem);
      if (previousItem == null)
      {
        if (itemDifference > 1)
          itemDifference = 1 + (itemDifference - 1) / 3; // gives an elastic tugging effect
        break;
      }
      else
      {
        directManipulationItem = previousItem;
        --itemDifference;
      }
    }
  }
  else if (itemDifference <= -1)
  {
    while (itemDifference <= -1)
    {
      var nextItem = AmxRcfDomUtils.getNextElement(directManipulationItem);
      if (nextItem == null)
      {
        if (itemDifference < -1)
          itemDifference = -1 + (itemDifference + 1) / 3; // gives an elastic tugging effect
        break;
      }
      else
      {
        directManipulationItem = nextItem;
        ++itemDifference;
      }
    }
  }

  // When we let go, we want it to go to at least one more item otherwise it will boomerang back:
  var middleItem = directManipulationItem;
  if (itemDifference > 0.5)
  {
    var previousItem = AmxRcfDomUtils.getPreviousElement(directManipulationItem);
    if (previousItem != null)
    {
      directManipulationItem = previousItem;
    }
  }
  else if (itemDifference < -0.5)
  {
    var nextItem = AmxRcfDomUtils.getNextElement(directManipulationItem);
    if (nextItem != null)
    {
      directManipulationItem = nextItem;
    }
  }

  this._directManipulationRow     = directManipulationItem;
  this._directManipulationItemKey = AmxRcfAgent.AGENT.getAttribute(directManipulationItem, "data-amxRk");

  var selectedZIndex = 3000;
  var component      = this.getComponent();
  var halign         = component.getHalign();
  var valign         = component.getValign();
  var vertical       = this._isVertical;

  // position the selected item
  var usedSize = selectedSize;
  var usedShift = 0;
  var usedOpacity = 1;
  if (this._displayItems == "oneByOne")
  {
    // =-= in theory this should work: usedShift = selectedSize * itemDifference;
    //     but instead, let's just jump to the item:
    this._sizeDatabodyForSelectedWrapperElement(directManipulationItem, true);
    return;
  }
  else // circular
  {
    var nextShift = selectedSize * this._SHIFT_FACTOR;
    var nextSize = Math.round(selectedSize * this._SHRINK_FACTOR);
    var nextOpacity = 100 * this._SHRINK_FACTOR;
    usedShift = nextShift * itemDifference;
    usedSize = selectedSize + (nextSize - selectedSize) * itemDifference * (itemDifference < 0 ? -1 : 1);
    usedOpacity = Math.max(1, Math.abs((100 - nextOpacity) * itemDifference));
  }
  this._positionItem(middleItem, usedSize, usedShift, selectedZIndex, vertical, valign, halign, usedOpacity, true);

  // Draw all of the previous siblings:
  var prevZIndex = selectedZIndex;
  if (itemDifference > 0.5)
    prevZIndex += 2; // the previous index should win over the selected zIndex
  this._positionSiblings(middleItem, prevZIndex, vertical, valign, halign, true, itemDifference);

  // Draw all of the next siblings:
  var nextZIndex = selectedZIndex;
  if (itemDifference < -0.5)
    nextZIndex += 2; // the next index should win over the selected zIndex
  this._positionSiblings(middleItem, nextZIndex, vertical, valign, halign, false, itemDifference);
};

AmxRcfCarouselPeer.prototype._sizeDatabodyForSelectedWrapperElement = function(
  selectedWrapper,
  animationAlreadyStopped)
{
  if (!animationAlreadyStopped)
  {
    // Purge the existing animation here to avoid issues where an existing animation is attempting to
    // size the wrappers to an old, out-of-date size:
    this._stopAnimation(true);
  }

  var selectedZIndex = 3000;
  var selectedSize   = this._selectedSize;
  var component      = this.getComponent();
  var halign         = component.getHalign();
  var valign         = component.getValign();
  var vertical       = this._isVertical;

  // position the selected item
  this._positionItem(selectedWrapper, selectedSize, 0, selectedZIndex, vertical,
                     valign, halign, 1, false);

  // Draw all of the previous siblings:
  this._positionSiblings(selectedWrapper, selectedZIndex, vertical, valign, halign, true, 0);

  // Draw all of the next siblings:
  this._positionSiblings(selectedWrapper, selectedZIndex, vertical, valign, halign, false, 0);

  // Position the thumb:
  this._positionThumbAndSpinInfo();
};

AmxRcfCarouselPeer.prototype._doResizeNotifyOnDisplayedChildren = function()
{
  var rows     = this._db.firstChild.childNodes; // get the child nodes of the first block
  var rowCount = rows.length;

  for (var r=0; r<rowCount; ++r)
  {
    var row = rows[r];
    if (row.style.display == "block")
    {
      var firstChildElement = AmxRcfDomUtils.getFirstChildElement(row);
      if (firstChildElement != null)
      {
        // There will only be an id if the row is not a temporary placeholder.
        var itemClientId = firstChildElement.id;
        if (itemClientId != null)
        {
          var itemChildren = firstChildElement.childNodes;
          if (itemChildren != null && itemChildren.length == 1)
          {
            // Only resize if there is a single child in the item (can only stretch 1 child):
            var soleItemChild = itemChildren[0];
            try
            {
              // Be careful in your resize handlers because invoking .resize() can infinitely loop!
              $(soleItemChild).resize(); // TODO remove jQuery on this
            }
            catch (problem)
            {
              AmxRcfLogger.LOGGER.severe("Problem calling resize on a child of carouselItem id=\"" + itemClientId + "\":");
              AmxRcfLogger.LOGGER.severe(problem);
              AmxRcfLogger.LOGGER.severe(soleItemChild);
            }
          }
        }
      }
    }
  }
};

AmxRcfCarouselPeer.prototype._updateTransientDragPosition = function(desiredPercent)
{
  var component = this.getComponent();
  if (component.getDisabled() || this._isEmpty)
  {
    // do nothing if disabled
    return;
  }

  var rowCount = this._rowCount;

  if (rowCount == -1)
    AmxRcfAssert.assert(false, "Unknown carousel item count " + rowCount);

  var maximumRowIndex = rowCount - 1;
  var fractionalRowIndex = Math.max(0, desiredPercent * maximumRowIndex);
  this._positionThumbAndSpinInfo(Math.min(fractionalRowIndex, rowCount-1));
};

AmxRcfCarouselPeer.prototype._updateSpinInfoDiv = function(itemNumber)
{
  var displayItemNumber  = itemNumber;
  var spinInfoDiv        = this._getSpinInfoDiv();
  var totalNumberOfItems = this._rowCount;
  var spinPrevElem;

  if (this._duringThumbDrag)
    displayItemNumber = Math.round(displayItemNumber); // otherwise it will be a fraction

  var infoText;
  if (totalNumberOfItems == -1)
  {
    // Unknown total number of rows:
    infoText = displayItemNumber;
  }
  else
  {
    // Known total number of rows:
    infoText =
      adf.mf.resource.getInfoString(
        "AMXInfoBundle",
        "amx_carousel_TIP_SPIN_INFO_X_OF_Y",
        displayItemNumber,
        totalNumberOfItems);
  }

  // Update the info text:
  if (infoText == null)
    infoText = displayItemNumber;
  spinInfoDiv.innerHTML = "<span>" + infoText + "<" + "/span>";

  if (this._controlArea != "small" && this._controlArea != "compact" && this._controlArea != "none")
  {
    // only applicable in full mode
    var spinInfoDivStyle = spinInfoDiv.style;
    var spinThumbElem    = this._st;

    if (this._isVertical)
    {
      spinPrevElem             = this._sp;
      var textHeight           = spinInfoDiv.firstChild.offsetHeight;
      var spinControlOffsetTop = spinPrevElem.offsetTop;
      var spinButtonHeight     = spinPrevElem.offsetHeight;
      var spinThumbOffsetTop   = spinThumbElem.offsetTop;
      var spinThumbHeight      = spinThumbElem.offsetHeight;

      spinInfoDivStyle.paddingTop =
        Math.round(
          spinControlOffsetTop +
          spinButtonHeight +
          spinThumbOffsetTop +
          spinThumbHeight / 2 -
          textHeight / 2) +
        "px";
    }
    else // horizontal
    {
      // Indent the spin info text such that it is centered under the thumb:
      var textWidth       = spinInfoDiv.firstChild.offsetWidth;
      var spinThumbOffset = spinThumbElem.offsetLeft;
      var spinThumbWidth  = spinThumbElem.offsetWidth;

      var spinButtonWidth;
      var spinControlOffset;
      if (AmxRcfCarouselPeer._isRTL())
      {
        var spinNextElem  = this._sn;
        spinButtonWidth   = spinNextElem.offsetWidth;
        spinControlOffset = spinNextElem.offsetLeft;
      }
      else
      {
        spinPrevElem      = this._sp;
        spinButtonWidth   = spinPrevElem.offsetWidth;
        spinControlOffset = spinPrevElem.offsetLeft;
      }

      spinInfoDivStyle.textAlign   = "left";
      spinInfoDivStyle.paddingLeft =
        Math.round(
          spinControlOffset +
          spinButtonWidth +
          spinThumbOffset +
          spinThumbWidth / 2 -
          textWidth / 2) +
        "px";
    }
  }
};

/* Positions all of either the previous siblings or the next siblings of the selected item. */
AmxRcfCarouselPeer.prototype._positionSiblings = function(
  selectedItem,
  selectedZIndex,
  vertical,
  valign,
  halign,
  previous,
  itemDifference)
{
  var selectedSize = this._selectedSize;
  var zIndex       = selectedZIndex;
  var auxItem      = previous ? AmxRcfDomUtils.getPreviousElement(selectedItem) :
                                AmxRcfDomUtils.getNextElement(selectedItem);

  if (this._displayItems == "oneByOne")
  {
    zIndex--;
    var shift = previous ? -selectedSize : selectedSize;

    while (auxItem != null)
    {
      this._positionItem(
        auxItem,
        selectedSize,
        shift,
        selectedZIndex - 1,
        vertical,
        valign,
        halign,
        1, // opacity
        true);

      auxItem = previous?AmxRcfDomUtils.getPreviousElement(auxItem):AmxRcfDomUtils.getNextElement(auxItem);
    }
  }
  else
  {
    var shrinkFactor = this._SHRINK_FACTOR;
    var shiftFactor  = this._SHIFT_FACTOR;
    var auxShift     = 0;
    var auxSize      = selectedSize;
    var auxOpacity   = 100;

    while (auxItem != null)
    {
      var lastAuxShift = auxShift;
      var lastAuxSize = auxSize;
      var lastAuxOpacity = auxOpacity;

      auxShift   = auxShift + auxSize * shiftFactor;
      auxSize    = Math.round(auxSize * shrinkFactor);
      auxOpacity = auxOpacity * shrinkFactor;

      var usedShift;
      var usedSize;
      var usedOpacity;
      if (previous)
      {
        if (itemDifference < 0)
        {
          var prevShift = auxShift + auxSize * shiftFactor;
          var prevSize = Math.round(auxSize * shrinkFactor);
          var prevOpacity = auxOpacity * shrinkFactor;
          usedShift = auxShift - (prevShift - auxShift) * itemDifference;
          usedSize = auxSize - (prevSize - auxSize) * itemDifference;
          usedOpacity = auxOpacity - (prevOpacity - auxOpacity) * itemDifference;
        }
        else // negative itemDifference
        {
          usedShift = auxShift + (lastAuxShift - auxShift) * itemDifference;
          usedSize = auxSize + (lastAuxSize - auxSize) * itemDifference;
          usedOpacity = auxOpacity + (lastAuxOpacity - auxOpacity) * itemDifference;
        }
      }
      else
      {
        if (itemDifference > 0)
        {
          var nextShift = auxShift + auxSize * shiftFactor;
          var nextSize = Math.round(auxSize * shrinkFactor);
          var nextOpacity = auxOpacity * shrinkFactor;
          usedShift = auxShift + (nextShift - auxShift) * itemDifference;
          usedSize = auxSize + (nextSize - auxSize) * itemDifference;
          usedOpacity = auxOpacity + (nextOpacity - auxOpacity) * itemDifference;
        }
        else
        {
          usedShift = auxShift - (lastAuxShift - auxShift) * itemDifference;
          usedSize = auxSize - (lastAuxSize - auxSize) * itemDifference;
          usedOpacity = auxOpacity - (lastAuxOpacity - auxOpacity) * itemDifference;
        }
      }

      this._positionItem(
        auxItem,
        usedSize,
        previous ? -usedShift : usedShift,
        --zIndex,
        vertical,
        valign,
        halign,
        Math.max(1, 100 - usedOpacity),
        true);

      auxItem = previous?AmxRcfDomUtils.getPreviousElement(auxItem):AmxRcfDomUtils.getNextElement(auxItem);
    }
  }
};

/**
 * Given the offset index of the auxillary item, caculates its shift, size and the opacity.
 */
AmxRcfCarouselPeer.prototype._getAuxShiftSizeAndOpacity = function(offsetIndex)
{
  var shrinkFactor = this._SHRINK_FACTOR;
  var shiftFactor  = this._SHIFT_FACTOR;
  var auxShift     = 0;
  var auxSize      = this._selectedSize;
  var auxOpacity   = 100;

  if (this._displayItems == "oneByOne")
  {
    auxShift   = offsetIndex;
    auxOpacity = auxOpacity * shrinkFactor;
  }
  else // circular
  {
    for (var i = 0; i <offsetIndex; i++)
    {
      auxShift   = auxShift + auxSize * shiftFactor;
      auxSize    = Math.round(auxSize * shrinkFactor);
      auxOpacity = auxOpacity * shrinkFactor;
    }
  }

  return {auxShift:auxShift, auxSize:auxSize, auxOpacity: Math.max(1, 100 - auxOpacity)};
};

AmxRcfCarouselPeer.prototype._positionItem = function(
  item,
  size,
  shift,
  zIndex,
  vertical,
  valign,
  halign,
  overlayOpacity,
  showOverlay)
{
  var databodyWidth  = this._databodyWidth;
  var databodyHeight = this._databodyHeight;
  var wrapperStyle   = item.style;

  wrapperStyle.display = (size > 5 || !showOverlay)?"block":"none";
  wrapperStyle.width   = size + "px";
  wrapperStyle.height  = size + "px";
  if (!showOverlay && this._displayItems == "oneByOne")
  {
    // _getHalignLeft and _getValignTop are not used for the selected item in oneByOne mode because
    // for auxShift == 0 means get the left/top for the databody, not the selected item in it which
    // will always be zero.
    wrapperStyle.top  = "0px";
    wrapperStyle.left = "0px";
  }
  else
  {
    wrapperStyle.top  = this._getValignTop(vertical, valign, databodyHeight, size, shift) + "px";
    wrapperStyle.left = this._getHalignLeft(vertical, halign, databodyWidth, size, shift) + "px";
  }
  wrapperStyle.zIndex = zIndex;

  var itemOverlay = AmxRcfDomUtils.getLastChildElement(item);

  if (itemOverlay != null)
  {
    if (showOverlay)
      itemOverlay.style.display = "block";
    else
      itemOverlay.style.display = "none"; // the overlay should be hidden

    if (this._useOpacity)
    {
      AmxRcfAgent.AGENT.setOpacity(itemOverlay, overlayOpacity);
    }
    else
    {
      // Disable the background-color style when the opacity is disabled:
      itemOverlay.style.backgroundColor = "transparent";
    }
  }
};

AmxRcfCarouselPeer.prototype._getHalignLeft = function(vertical, halign, dbWidth, itemSize, shift)
{
  if (shift != 0 && this._displayItems == "oneByOne")
  {
    if (vertical)
      return 0;
    else if (shift < 0)
      return -this._selectedSize;
    else
      return this._selectedSize;
  }

  var halignLeft;
  if (vertical)
  {
    if (halign == "start")
    {
      if (AmxRcfCarouselPeer._isRTL())
      {
        halignLeft = (dbWidth - itemSize) - this._widthMargin;
      }
      else
      {
        halignLeft = this._widthMargin;
      }
    }
    else if (halign == "end")
    {
      if (AmxRcfCarouselPeer._isRTL())
      {
        halignLeft = this._widthMargin;
      }
      else
      {
        halignLeft = (dbWidth - itemSize) - this._widthMargin;
      }
    }
    else // center
    {
      halignLeft = (dbWidth - itemSize) * 0.5;
    }
  }
  else // horizontal
  {
    if (halign == "start")
    {
      halignLeft = (dbWidth - itemSize) * 0.2 + shift;
    }
    else if (halign == "end")
    {
      halignLeft = (dbWidth - itemSize) * 0.8 + shift;
    }
    else // center
    {
      halignLeft = (dbWidth - itemSize) * 0.5 + shift;
    }

    if (AmxRcfCarouselPeer._isRTL())
    {
      // Flip to the other size, accounting for this still being a "left" style:
      halignLeft = dbWidth - itemSize - halignLeft;
    }
  }
  return Math.round(halignLeft);
};

AmxRcfCarouselPeer.prototype._getValignTop = function(vertical, valign, dbHeight, itemSize, shift)
{
  if (shift != 0 && this._displayItems == "oneByOne")
  {
    if (!vertical)
      return 0;
    else if (shift < 0)
      return -this._selectedSize;
    else
      return this._selectedSize;
  }

  var valignTop;
  if (vertical)
  {
    if (valign == "top")
    {
      valignTop = (dbHeight - itemSize) * 0.2 + shift;
      if (shift > 0)
      {
        // Shift for the height of the box under the current item:
        valignTop += this._heightOfBoxUnderCurrentItem; // approximation of the shift
      }
    }
    else if (valign == "bottom")
    {
      valignTop = (dbHeight - itemSize) * 0.8 + shift;
      if (shift > 0)
      {
        // Shift for the height of the box under the current item:
        valignTop += this._heightOfBoxUnderCurrentItem * 0.25; // approximation of the shift
      }
    }
    else // middle
    {
      valignTop = (dbHeight - itemSize) * 0.5 + shift;
      if (shift > 0)
      {
        // Shift for the height of the box under the current item:
        valignTop += this._heightOfBoxUnderCurrentItem; // exact shift amount
      }
    }
  }
  else // horizontal
  {
    if (valign == "top")
    {
      valignTop = this._heightMargin;
    }
    else if (valign == "bottom")
    {
      valignTop = dbHeight - itemSize - this._heightMargin;
    }
    else // middle
    {
      valignTop = (dbHeight - itemSize) * 0.5;
    }
  }
  return Math.round(valignTop);
};

AmxRcfCarouselPeer.prototype._positionThumbAndSpinInfo = function(itemIndex)
{
  if (itemIndex == undefined)
  {
    if (this._duringThumbDrag)
      return;

    var rowData = this._findRowByKey(this._currentItemKey, true /*firstByDefault*/);
    if (rowData == null)
    {
      AmxRcfLogger.LOGGER.severe("Thumb details failed: " + this._currentItemKey + ", " + rowData);
      return;
    }
    itemIndex = rowData.index;
  }

  var rowCount = this._rowCount;
  if (rowCount == -1)
  {
    rowCount = this._knownRowCount;
    AmxRcfAssert.assert(false, "Unknown carousel item count " + rowCount);
  }

  var lastIndex        = Math.max(1, rowCount - 1);
  var currentPercent   = itemIndex / lastIndex;
  if (!this._duringThumbDrag)
    this._currentPercent = currentPercent;

  var fullControlArea = false;
  if (this._controlArea != "small" && this._controlArea != "compact" && this._controlArea != "none")
  {
    fullControlArea = true;
    var spinBarElem   = this._sb;
    var spinThumbElem = this._st;

    if (!this._duringThumbDrag)
      this._percentSize     = 1 / lastIndex;
    var vertical            = this._isVertical;
    var thumbSizeCorrection = spinThumbElem[vertical ? "offsetHeight" : "offsetWidth"];
    var thumbPos;

    if (vertical)
    {
      thumbPos = (1 - itemIndex / lastIndex) * (spinBarElem["offsetHeight"] - thumbSizeCorrection);
    }
    else // horizontal
    {
      if (AmxRcfCarouselPeer._isRTL())
      {
        thumbPos = (lastIndex - itemIndex) / lastIndex * (spinBarElem["offsetWidth"] - thumbSizeCorrection);
      }
      else
      {
        thumbPos = itemIndex / lastIndex * (spinBarElem["offsetWidth"] - thumbSizeCorrection);
      }
    }

    spinThumbElem.style[vertical ? "bottom" : "left"] = thumbPos + "px";
  }

  if (!this._duringThumbDrag && this._controlArea != "none") // small or compact and not transient for thumb dragging
  {
    // Update the disabled states of the next and previous buttons
    var previousDisabled = itemIndex == 0;
    var nextDisabled     = currentPercent == 1 || rowCount == 1;
    var component        = this.getComponent();
    if (component.getDisabled() || this._isEmpty)
    {
      previousDisabled = true;
      nextDisabled     = true;
    }

    if (!fullControlArea)
    {
      // controlArea="full" should be excluded from this styleClass
      // otherwise it would not look right.
      adf.mf.internal.amx.addOrRemoveCSSClassName(
        previousDisabled,
        this._sp,
        AmxRcfRichUIPeer.DISABLED_STYLECLASS);
      adf.mf.internal.amx.addOrRemoveCSSClassName(
        nextDisabled,
        this._sn,
        AmxRcfRichUIPeer.DISABLED_STYLECLASS);
    }

    // Update disabled state for WAI-ARIA regardless of fullControlArea:
    this._sp.setAttribute("aria-disabled", previousDisabled);
    this._sn.setAttribute("aria-disabled", nextDisabled);
  }

  if (this._controlArea != "compact" && this._controlArea != "none") // only applicable in full and small mode
  {
    // Position and update the spin info:
    this._updateSpinInfoDiv(itemIndex + 1);
  }
};

/* Moves the items around in an animated fashion. */
AmxRcfCarouselPeer.prototype._animateRowsForNewSelectedWrapperElement = function(
  selectedWrapper,
  oldCurrentItemKey,
  popOutDetails)
{
  var hoverWrapper = null;
  var databodyInfoOverlayAlpha = 100;

  // Purge the existing animation here to avoid concurrency issues with potential "afterAnimate"
  // cleanup being performed before some other existing animation is complete:
  var oldSelectedWrapper;
  var dontMessWithThisWrappersOverlay;
  if (popOutDetails == null)
  {
    var oldCurrentRowData = this._findRowByKey(oldCurrentItemKey, true /*firstByDefault*/);
    if (oldCurrentRowData)
    {
      oldSelectedWrapper = oldCurrentRowData.row;
    }

    this._stopAnimation(true, oldSelectedWrapper);
  }
  else // this is a pop-out animation
  {
    dontMessWithThisWrappersOverlay = selectedWrapper;

    // popOutDetails has the following properties: hoverKey, hoverWrapper
    var hoverKey = popOutDetails["hoverKey"];
    if (hoverKey != null)
    {
      // We want the databody info overlay to become hidden:
      databodyInfoOverlayAlpha = 0;

      if (hoverKey == this._lastHoverKey)
        return; // don't waste time re-animating where we already are
      else
        this._lastHoverKey = hoverKey;

      hoverWrapper = popOutDetails["hoverWrapper"];
    }
    this._stopAnimation(false);
  }

  var selectedZIndex   = 3000;
  var hoverZIndex      = 3001;
  var shrinkFactor     = this._SHRINK_FACTOR;
  var shiftFactor      = this._SHIFT_FACTOR;
  var databodyWidth    = this._databodyWidth;
  var databodyHeight   = this._databodyHeight;
  var selectedSize     = this._selectedSize;
  var vertical         = this._isVertical;
  var component        = this.getComponent();
  var halign           = component.getHalign();
  var valign           = component.getValign();
  var animationObjects = [];
  var animationObject;
  var selectedLeft     = 0;
  var selectedTop      = 0;
  var oneByOne         = (this._displayItems == "oneByOne");

  if (!oneByOne) // circular
  {
    // _getHalignLeft and _getValignTop are not used for the selected item in oneByOne mode because
    // for auxShift == 0 means get the left/top for the databody, not the selected item in it which
    // will always be zero.
    selectedLeft = this._getHalignLeft(vertical, halign, databodyWidth, selectedSize, 0);
    selectedTop  = this._getValignTop(vertical, valign, databodyHeight, selectedSize, 0);

    if (this._POP_OUT == "hover")
    {
      // Adjust the current item text opacity (hidden during pop-out)
      var databodyInfoOverlay = null;
      if (this._controlArea == "small" || this._controlArea == "compact")
      {
        databodyInfoOverlay = this._getControlAreaDiv();
      }
      else // full or none
      {
        databodyInfoOverlay = this._it;
      }

      if (databodyInfoOverlay != null)
      {
        animationObject = {
          element: databodyInfoOverlay,
          properties: { "alpha": databodyInfoOverlayAlpha }
        };
        animationObjects.push(animationObject);
      }
    }
  }

  animationObject = {
    element: selectedWrapper,
    properties: {
      "offsetLeft": selectedLeft,
      "offsetTop":  selectedTop,
      "width":      selectedSize,
      "height":     selectedSize
    }
  };
  var wrapperStyle = selectedWrapper.style;
  wrapperStyle.zIndex  = selectedZIndex;
  wrapperStyle.display = "block";
  animationObjects.push(animationObject);
  var itemOverlay = AmxRcfDomUtils.getLastChildElement(selectedWrapper);
  if (itemOverlay != null)
  {
    if (this._useOpacity)
    {
      animationObject = {
        element: itemOverlay,
        properties: { "alpha": 0 }
      };
      animationObjects.push(animationObject);
    }
    else
    {
      // Disable the background-color style when the opacity is disabled:
      itemOverlay.style.backgroundColor = "transparent";
    }
  }

  // Position the thumb:
  if (popOutDetails == null)
    this._positionThumbAndSpinInfo();

  // Draw all of the previous siblings:
  var auxItem    = AmxRcfDomUtils.getPreviousElement(selectedWrapper);
  var auxShift   = 0;
  var auxSize    = selectedSize;
  var auxOpacity = 100;
  var zIndex     = selectedZIndex;
  var rtl = AmxRcfCarouselPeer._isRTL();
  while (auxItem != null)
  {
    if (oneByOne)
    {
      auxShift = 1; // this will make the getHalignLeft and getValignTop calls behave as desired
    }
    else
    {
      auxShift = auxShift + auxSize * shiftFactor;
      auxSize  = Math.round(auxSize * shrinkFactor);
    }

    wrapperStyle = auxItem.style;
    if (auxItem == hoverWrapper)
    {
      wrapperStyle.zIndex = hoverZIndex; // use special hover zindex
      --zIndex; // but still decrement so the others will be properly adjusted

      var leadingPopOutHShift = (selectedSize - auxSize) / 2;
      if (vertical)
      {
        if (rtl)
        {
          if (halign == "start")
            leadingPopOutHShift = (selectedSize - auxSize);
          else if (halign == "end")
            leadingPopOutHShift = 0;
        }
        else // ltr
        {
          if (halign == "start")
            leadingPopOutHShift = 0;
          else if (halign == "end")
            leadingPopOutHShift = (selectedSize - auxSize);
        }
      }

      var leadingPopOutVShift = (selectedSize - auxSize) / 2;
      if (!vertical)
      {
        if (valign == "top")
          leadingPopOutVShift = 0;
        else if (valign == "bottom")
          leadingPopOutVShift = (selectedSize - auxSize);
      }

      animationObject = {
        element: auxItem,
        properties: {
          "offsetLeft": this._getHalignLeft(vertical, halign, databodyWidth, auxSize, -auxShift) - leadingPopOutHShift,
          "offsetTop":  this._getValignTop(vertical, valign, databodyHeight, auxSize, -auxShift) - leadingPopOutVShift,
          "width":      selectedSize,
          "height":     selectedSize
        }
      };
    }
    else
    {
      wrapperStyle.zIndex = --zIndex;

      animationObject = {
        element: auxItem,
        properties: {
          "offsetLeft": this._getHalignLeft(vertical, halign, databodyWidth, auxSize, -auxShift),
          "offsetTop":  this._getValignTop(vertical, valign, databodyHeight, auxSize, -auxShift),
          "width":      auxSize,
          "height":     auxSize
        }
      };
    }

    // We don't set display to none here because for a big spin would result in a period of time
    // when no carousel items are visible.  This display gets set to none after animation is
    // complete.
    // We do, however, want to set display to block for the newly visible items.
    if (auxSize <= 5)
    {
      wrapperStyle.display = "none";
    }
    else
    {
      wrapperStyle.display = "block";
    }

    animationObjects.push(animationObject);

    itemOverlay = AmxRcfDomUtils.getLastChildElement(auxItem);
    if (itemOverlay != null && auxItem != dontMessWithThisWrappersOverlay)
    {
      itemOverlay.style.display = "block"; // the overlay should be shown
      if (this._useOpacity)
      {
        // Animate the opacity of the item overlay:
        auxOpacity = auxOpacity * shrinkFactor;
        if (auxItem == hoverWrapper)
        {
          // Make it transparent:
          animationObject = {
            element: itemOverlay,
            properties: { "alpha": 1 }
          };
        }
        else
        {
          animationObject = {
            element: itemOverlay,
            properties: { "alpha": Math.max(1, 100 - auxOpacity) }
          };
        }

        animationObjects.push(animationObject);
      }
      else
      {
        // Disable the background-color style when the opacity is disabled:
        itemOverlay.style.backgroundColor = "transparent";
      }
    }

    auxItem = AmxRcfDomUtils.getPreviousElement(auxItem);
  }

  // Draw all of the next siblings:
  auxItem    = AmxRcfDomUtils.getNextElement(selectedWrapper);
  auxShift   = 0;
  auxSize    = selectedSize;
  auxOpacity = 100;
  zIndex     = selectedZIndex;
  while (auxItem != null)
  {
    if (oneByOne)
    {
      auxShift = 1; // this will make the getHalignLeft and getValignTop calls behave as desired
    }
    else
    {
      auxShift     = auxShift + auxSize * shiftFactor;
      auxSize      = Math.round(Math.max(1, auxSize * shrinkFactor));
    }

    wrapperStyle = auxItem.style;
    if (auxItem == hoverWrapper)
    {
      wrapperStyle.zIndex = hoverZIndex; // use special hover zindex
      --zIndex; // but still decrement so the others will be properly adjusted

      var trailingPopOutHShift = (selectedSize - auxSize) / 2;
      if (vertical)
      {
        if (rtl)
        {
          if (halign == "start")
            trailingPopOutHShift = (selectedSize - auxSize);
          else if (halign == "end")
            trailingPopOutHShift = 0;
        }
        else // ltr
        {
          if (halign == "start")
            trailingPopOutHShift = 0;
          else if (halign == "end")
            trailingPopOutHShift = (selectedSize - auxSize);
        }
      }

      var trailingPopOutVShift = (selectedSize - auxSize) / 2;
      if (!vertical)
      {
        if (valign == "top")
          trailingPopOutVShift = 0;
        else if (valign == "bottom")
          trailingPopOutVShift = (selectedSize - auxSize);
      }

      animationObject = {
        element: auxItem,
        properties: {
          "offsetLeft": this._getHalignLeft(vertical, halign, databodyWidth, auxSize, auxShift) - trailingPopOutHShift,
          "offsetTop":  this._getValignTop(vertical, valign, databodyHeight, auxSize, auxShift) - trailingPopOutVShift,
          "width":      selectedSize,
          "height":     selectedSize
        }
      };
    }
    else
    {
      wrapperStyle.zIndex = --zIndex;

      animationObject = {
        element: auxItem,
        properties: {
          "offsetLeft": this._getHalignLeft(vertical, halign, databodyWidth, auxSize, auxShift),
          "offsetTop":  this._getValignTop(vertical, valign, databodyHeight, auxSize, auxShift),
          "width":      auxSize,
          "height":     auxSize
        }
      };
    }

    if (auxSize <= 5)
    {
      wrapperStyle.display = "none";
    }
    else
    {
      wrapperStyle.display = "block";
    }

    animationObjects.push(animationObject);

    itemOverlay = AmxRcfDomUtils.getLastChildElement(auxItem);
    if (itemOverlay != null && auxItem != dontMessWithThisWrappersOverlay)
    {
      itemOverlay.style.display = "block"; // the overlay should be shown
      if (this._useOpacity)
      {
        // Animate the opacity of the item overlay:
        auxOpacity = auxOpacity * shrinkFactor;
        if (auxItem == hoverWrapper)
        {
          // Make it transparent:
          animationObject = {
            element: itemOverlay,
            properties: { "alpha": 1 }
          };
        }
        else
        {
          animationObject = {
            element: itemOverlay,
            properties: { "alpha": Math.max(1, 100 - auxOpacity) }
          };
        }
        animationObjects.push(animationObject);
      }
      else
      {
        // Disable the background-color style when the opacity is disabled:
        itemOverlay.style.backgroundColor = "transparent";
      }
    }

    auxItem = AmxRcfDomUtils.getNextElement(auxItem);
  }

  this._animator =
    AmxRcfElementAnimator.animate(
      AmxRcfElementAnimator.FRAME_METHOD_SLOW_FAST_SLOW,
      popOutDetails == null ? this._animDuration : this._popOutDuration,
      animationObjects,
      null, // animationFrameRenderedFunction
      AmxRcfCarouselPeer._spinAnimationComplete,
      this, // callbackParameters
      null); // component
};

AmxRcfCarouselPeer.prototype._stopAnimation = function(resizeForSelected, selectedWrapperOverride)
{
  // Kill any animation at this point since we are filling up our view port. Also reposition the
  // existing items
  if (this._animator != null)
  {
    var selectedWrapper = selectedWrapperOverride;
    if (!selectedWrapper)
    {
      var rowData = this._findRowByKey(this._currentItemKey, true /*firstByDefault*/);
      if (rowData)
      {
        selectedWrapper = rowData.row;
      }
    }
    var animator = this._animator;
    this._animator = null;
    animator.stop();

    if (selectedWrapper && resizeForSelected)
    {
      this._sizeDatabodyForSelectedWrapperElement(selectedWrapper, true);
    }
  }
};

AmxRcfCarouselPeer._spinAnimationComplete = function(obj)
{
  var peer = obj;
  peer._animator = null;
  peer._resizeNotifyAfterAnimate();
};

AmxRcfCarouselPeer.prototype._resizeNotifyAfterAnimate = function()
{
  // Assign display:none to all of the items that are currently specified to be displayed but that
  // are smaller than a minimum size.  We didn't do this before the animation because for big spins,
  // there would have been a period of time when the carousel would be showing no items.
  var block = this._db.firstChild; // get the first block
  var items = block.childNodes;
  for (var i=0; i<items.length; ++i)
  {
    var item = items[i];
    var itemStyle = item.style;
    if (itemStyle.display == "block" && parseInt(itemStyle.width, 10) <= 5)
    {
      // If there are items that have a dimension that is smaller than
      // minimum size, we want them to be hidden:
      itemStyle.display = "none";
    }
  }

  // Let the carousel items know about the new sizes:
  this._doResizeNotifyOnDisplayedChildren();

  var currentItemKey = this._currentItemKey;
  var rowData        = this._findRowByKey(currentItemKey, false /*firstByDefault*/);

  if (rowData)
  {
    // The selected item's overlay should be hidden:
    var selectedWrapper           = rowData.row;
    selectedWrapper.style.display = "block"; // ensure the current item is shown
    var itemOverlay               = AmxRcfDomUtils.getLastChildElement(selectedWrapper);
    if (itemOverlay != null)
      itemOverlay.style.display   = "none"; // ensure the current item's overlay is hidden
  }
};

AmxRcfCarouselPeer.prototype._initiateSpinStartAnimation = function()
{
  this._initiateSpinPercentAnimation(0);
};

AmxRcfCarouselPeer.prototype._initiateSpinEndAnimation = function()
{
  this._initiateSpinPercentAnimation(1);
};

AmxRcfCarouselPeer.prototype._initiateSpinPreviousAnimation = function()
{
  var component = this.getComponent();
  if (component.getDisabled() || this._isEmpty)
  {
    // do nothing if disabled
    return;
  }

  var currentItemKey  = this._currentItemKey;
  var previousRowData = this._getPreviousRowKeyAndRow(currentItemKey);
  var previousRow     = previousRowData.row;

  if (previousRow && previousRowData.rowKey)
  {
    if (this._pendingTimeout)
      window.clearTimeout(this._pendingTimeout);

    if (this._updateCurrentItemKey(previousRowData.rowKey))
    {
      this._animateRowsForNewSelectedWrapperElement(previousRowData.row, currentItemKey);
    }
  }
  else
  {
    var nextIndex = this._getRowIndexFromThumbPos();
    var rowData   = this._findRowByKey(currentItemKey, false /*firstByDefault*/);
    if (rowData)
    {
      var currentIndex = rowData.index;
      if (nextIndex < currentIndex)
      {
        AmxRcfLogger.LOGGER.severe(
          "_initiateSpinPreviousAnimation failed due to invalid long jump: " +
          currentItemKey);
      }
    }
    else
    {
      AmxRcfLogger.LOGGER.severe(
        "_initiateSpinPreviousAnimation failed due to invalid currentItemKey: " +
        currentItemKey);
    }
  }
};

AmxRcfCarouselPeer.prototype._initiateSpinNextAnimation = function()
{
  var component = this.getComponent();
  if (component.getDisabled() || this._isEmpty)
  {
    // do nothing if disabled
    return;
  }

  var currentItemKey = this._currentItemKey;
  var nextRowData    = this._getNextRowKeyAndRow(currentItemKey);
  var nextRow        = nextRowData.row;

  if (nextRow && nextRowData.rowKey)
  {
    if (this._pendingTimeout)
      window.clearTimeout(this._pendingTimeout);

    if (this._updateCurrentItemKey(nextRowData.rowKey))
    {
      this._animateRowsForNewSelectedWrapperElement(nextRowData.row, currentItemKey);
    }
  }
  else
  {
    var nextIndex = this._getRowIndexFromThumbPos();
    var rowData   = this._findRowByKey(currentItemKey, false /*firstByDefault*/);
    if (rowData)
    {
      var currentIndex = rowData.index;
      if (nextIndex > currentIndex)
      {
        AmxRcfLogger.LOGGER.severe(
          "_initiateSpinNextAnimation failed due to invalid long jump: " +
          currentItemKey);
      }
    }
    else
    {
      AmxRcfLogger.LOGGER.severe(
        "_initiateSpinNextAnimation failed due to invalid currentItemKey: " +
        currentItemKey);
    }
  }
};

AmxRcfCarouselPeer.prototype._initiateSpinSpecificExistingItemAnimation = function(
  desiredRowKey,
  desiredRow)
{
  if (this._pendingTimeout)
    window.clearTimeout(this._pendingTimeout);

  var component = this.getComponent();
  if (component.getDisabled() || this._isEmpty)
  {
    // do nothing if disabled
    return;
  }

  var oldCurrentItemKey = this._currentItemKey;

  if (this._updateCurrentItemKey(desiredRowKey))
  {
    this._animateRowsForNewSelectedWrapperElement(desiredRow, oldCurrentItemKey);
  }
};

AmxRcfCarouselPeer.prototype._getCurrentPercent = function()
{
  if (this._currentPercent != null)
  {
    return this._currentPercent;
  }
  AmxRcfAssert.assert(false, "Illegal state; currentPercent is not known: " + this._currentPercent);
};

/**
 * @param {Number} desiredPercent A value from 0 through 1 that indicates where to spin within the
 *                                range of items.
 * @param {Number} currentPercent An optional value from 0 through 1 to indicate where the current
 *                                spin position exists.  If undefined, honor the desiredPercent
 *                                explicitly otherwise make a desiredPercent yield the previous or
 *                                next item if it resolves to currentPercent (so that clicking on
 *                                the slider bar will always yield movement).
 *
 */
AmxRcfCarouselPeer.prototype._initiateSpinPercentAnimation = function(
  desiredPercent,
  currentPercent)
{
  var component = this.getComponent();
  if (component.getDisabled() || this._isEmpty)
  {
    // do nothing if disabled
    return;
  }

  var block = this._db.firstChild; // get the first block
  var rows = block.childNodes;
  var rowCount = this._rowCount;
  var startRow = block.startRow;
  var numRows = this._getNumberOfRows(block);

  if (rowCount == -1)
  {
    rowCount = this._knownRowCount;
    AmxRcfAssert.assert(false, "Unknown carousel item count " + rowCount);
  }

  var maximumRowIndex = rowCount - 1;
  var desiredRowIndex = Math.max(0, Math.round(desiredPercent * maximumRowIndex));

  var currentRowIndex = null;
  if (currentPercent != null)
  {
    currentRowIndex = Math.max(0, Math.round(currentPercent * maximumRowIndex));
  }

  desiredRowIndex = Math.min(desiredRowIndex, rowCount-1);

  if (currentRowIndex == desiredRowIndex)
  {
    // A currentPercent was provided and its rowIndex resolves to the same one as desiredRowIndex.
    // We need to go to either the previous or next index instead.
    if (desiredPercent < currentPercent)
    {
      desiredRowIndex = Math.max(0, --desiredRowIndex);
    }
    else
    {
      desiredRowIndex = Math.min(maximumRowIndex, ++desiredRowIndex);
    }
  }

  // If the row is in the viewport
  var endRowIndex = startRow + numRows;
  if (desiredRowIndex >= startRow && desiredRowIndex < endRowIndex)
  {
    if (this._pendingTimeout)
      window.clearTimeout(this._pendingTimeout);

    var desiredRow = rows[desiredRowIndex-startRow];
    AmxRcfAssert.assert(
      desiredRow != null,
      "A desired row could not be found: " +
        rows +
        ", " +
        desiredRowIndex +
        ", " +
        startRow);
    var desiredRowKey = AmxRcfAgent.AGENT.getAttribute(desiredRow, "data-amxRk");
    var needToResize = true;

    if (this._currentItemKey != desiredRowKey && desiredRowKey != null) // only animate if changed!
    {
      var oldCurrentItemKey = this._currentItemKey;

      if (this._updateCurrentItemKey(desiredRowKey))
      {
        needToResize = false;
        this._animateRowsForNewSelectedWrapperElement(desiredRow, oldCurrentItemKey);
      }
    }

    if (needToResize)
    {
      // Purge the existing animation here
      this._stopAnimation(true);

      // Resize first so that the items are in the expected locations and are using the expected
      // sizes (we've already stopped the animation):

      var oldCurrentRowData = this._findRowByKey(this._currentItemKey, true /*firstByDefault*/);
      if (oldCurrentRowData)
      {
        var selectedWrapper = oldCurrentRowData.row;
        this._sizeDatabodyForSelectedWrapperElement(selectedWrapper, true);
      }
    }
  }
  else
  {
    AmxRcfLogger.LOGGER.severe(
      "_initiateSpinPercentAnimation failed due to invalid long jump: " +
      desiredRowIndex);
  }
};

AmxRcfCarouselPeer._ITEM_PADDING = 10;

/* ---------------------------------------------------------------------------- */
/* AmxRcfLookAndFeel                                                            */
/* ---------------------------------------------------------------------------- */

/**
 * AmxRcfLookAndFeel base class.  The AmxRcfLookAndFeel serves as a factory for the patform-specific
 * implementation objects used by the framework, namely the AmxRcfPage object and the correct
 * AmxRcfUIPeer instances for the AmxRcfUIComponents.
 */
function AmxRcfLookAndFeel()
{
  AmxRcfObject.initClass(AmxRcfLookAndFeel, "AmxRcfLookAndFeel");
};

/**
 * Returns the skin property with the specified key for the look and feel
 * @param {String} key Key used to identify this skin property
 * @return The skin property
 * @override
 */
AmxRcfLookAndFeel.prototype.getSkinProperty = function(key)
{
  if (key == null || !AmxRcfLookAndFeel._RICH_SKIN_PROPERTIES)
    // Return undefined, not null, so that the branches of
    // this "if/else" return the same thing for an incorrect
    // or unavailable key
    return undefined;
  else
    return AmxRcfLookAndFeel._RICH_SKIN_PROPERTIES[key];
};

/**
 * Returns a compressed style class.
 * @param {String} styleClass the uncompressed styleClass
 * @return the compressed style class, or the original class
 *   if no compressed version is available
 */
AmxRcfLookAndFeel.prototype.getStyleClass = function(styleClass)
{
  var parsed = this.getSkinProperty(styleClass);
  if (!parsed)
    return styleClass;

  return parsed;
};

/**
 * Returns the skin property with the specified key for the look and feel
 * @param {String} key Key used to identify this skin property
 * @return The skin property
 */
AmxRcfLookAndFeel.prototype.getSkinProperty = function(key)
{
  if (key == null || !AmxRcfLookAndFeel._RICH_SKIN_PROPERTIES)
    // Return undefined, not null, so that the branches of
    // this "if/else" return the same thing for an incorrect
    // or unavailable key
    return undefined;
  else
    return AmxRcfLookAndFeel._RICH_SKIN_PROPERTIES[key];
};

/**
 * Add skin properties.  An internal utility function - do not call.
 * This method needs to be exported (along with the class itself) because it is called from the generated HTML
 * @export
 */
AmxRcfLookAndFeel.addSkinProperties = function(props)
{
  AmxRcfAssert.assertObject(props);
  var oldProps = AmxRcfLookAndFeel._RICH_SKIN_PROPERTIES;
  if (oldProps)
    props = AmxRcfCollections.copyInto(props, oldProps);

  AmxRcfLookAndFeel._RICH_SKIN_PROPERTIES = props;
};

AmxRcfLookAndFeel.addSkinProperties({
  /* The minimum amount of time in milliseconds that the animation should take from the last time that the component displays in its initial state to the time that it displays in its final state (does not include any computation prior to drawing the first frame of the change or any computation after drawing the last frame of the change) for the carousel spin. This skin property is honored only if animation is enabled in the system. */
  "amx-carousel-tr-spin-animation-duration":"500",
  /* The minimum amount of time in milliseconds that the animation should take from the last time that the component displays in its initial state to the time that it displays in its final state (does not include any computation prior to drawing the first frame of the change or any computation after drawing the last frame of the change) for the carousel pop-out. This skin property is honored only if animation is enabled in the system. */
  "amx-carousel-tr-pop-out-animation-duration":"200"
});

/* ---------------------------------------------------------------------------- */
/* AmxRcfPage                                                                   */
/* ---------------------------------------------------------------------------- */

AmxRcfPage = function(domWindow)
{
  AmxRcfObject.initClass(AmxRcfPage, "AmxRcfPage");
  this.Init(domWindow);
};

/**
 * Create an instance of an AmxRcfPage
 */
AmxRcfPage.prototype.Init = function(domWindow)
{
  this._window = domWindow;
  this._localeContext = new AmxRcfLocaleContext();
  this._lookAndFeel   = new AmxRcfLookAndFeel();
};

/**
 * @return {AmxRcfPage} AmxRcfPage instance to use
 * @see #PAGE
 */
AmxRcfPage.getPage = function(domWindow)
{
  if (!AmxRcfPage._page)
  {
    var page = new AmxRcfPage(domWindow);
    AmxRcfPage._page = page;
  }

  return AmxRcfPage._page;
};

/**
 * Retrieves the locale context associated with this AmxRcfPage.
 * Provides utilities such as bi-directional management and other i18n support.
 */
AmxRcfPage.prototype.getLocaleContext = function()
{
  return this._localeContext;
};

/**
 * Returns the LookAndFeel that this page is displaying
 */
AmxRcfPage.prototype.getLookAndFeel = function()
{
  return this._lookAndFeel;
};

// Returns the DOM window associated with this page
AmxRcfPage.prototype.getDomWindow = function()
{
  return this._window;
};

AmxRcfPage.PAGE = AmxRcfPage.getPage(window);

/* ---------------------------------------------------------------------------- */

}
catch (problem) // overall utility try-catch
{
  AmxRcfLogger.LOGGER.severe("*** Unexpected carousel overall utility try-catch problem:");
  AmxRcfLogger.LOGGER.severe(problem);
}

/* ---------------------------------------------------------------------------- */

})(jQuery);
