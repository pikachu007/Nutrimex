/* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. */
/* ------------------------------------------------------ */
/* ------------------- amx-panels.js -------------------- */
/* ------------------------------------------------------ */

(function()
{
  var amxRenderers =
  {

    panelPage:
    {
      create: function(amxNode)
      {
        var rootElement = document.createElement("div");
        // render the facet header if present
        var primaryFacetChildren = amxNode.getRenderedChildren("primary");
        var headerFacetChildren = amxNode.getRenderedChildren("header");
        var secondaryFacetChildren = amxNode.getRenderedChildren("secondary");
        var i;

        // render the facet header if present
        if (primaryFacetChildren.length || headerFacetChildren.length || secondaryFacetChildren.length)
        {
          // we used <header> element here but removed it dues to under ACC, VO calls it 'landmark start/end'
          var header = document.createElement("div");
          header.className = "amx-panelPage-header";

          if (headerFacetChildren.length)
          {
            var headerFacet = document.createElement("div");
            headerFacet.className = "amx-panelPage-facet-header";
            headerFacet.setAttribute("role", "heading");
            header.appendChild(headerFacet);
            var $facetHeader = $(headerFacet); // TODO make non-jq
            for (var i in headerFacetChildren)
            {
              $facetHeader.append(headerFacetChildren[i].renderNode());
          }
          }

          if (primaryFacetChildren.length)
          {
            var primaryFacet = document.createElement("section");
            primaryFacet.className = "amx-panelPage-facet-primary";
            header.appendChild(primaryFacet);
            var $facetPrimary = $(primaryFacet); // TODO make non-jq
            for (var i in primaryFacetChildren)
            {
              $facetPrimary.append(primaryFacetChildren[i].renderNode());
            }
          }

          if (secondaryFacetChildren.length)
          {
            var secondaryFacet = document.createElement("section");
            secondaryFacet.className = "amx-panelPage-facet-secondary";
            header.appendChild(secondaryFacet);
            var $facetSecondary = $(secondaryFacet); // TODO make non-jq
            for (var i in secondaryFacetChildren)
            {
              $facetSecondary.append(secondaryFacetChildren[i].renderNode());
          }
          }

          rootElement.appendChild(header);
        }

        var content = document.createElement("div");
        content.className = "amx-panelPage-content amx-scrollable";
        rootElement.appendChild(content);
        $(content).append(amxNode.renderSubNodes()); // TODO make non-jq

        var footerFacetChildren = amxNode.getRenderedChildren("footer");
        if (footerFacetChildren.length)
        {
          var footer = document.createElement("footer");
          footer.className = "amx-panelPage-footer";
          rootElement.appendChild(footer);

          var footerFacet = document.createElement("div");
          footerFacet.className = "amx-panelPage-facet-footer";
          footer.appendChild(footerFacet);
          var $facetFooter = $(footerFacet); // TODO make non-jq
          for (var i in footerFacetChildren)
          {
            $facetFooter.append(footerFacetChildren[i].renderNode());
        }
        }

        return rootElement;
      },

      postDisplay: function(domNode,amxNode)
      {
        // Restore the old scroll position in case this view instance already had one:
        var storedData = adf.mf.api.amx.getClientState(amxNode.getId());
        if (storedData != null)
        {
          var childNodes = domNode.childNodes;
          for (var i=childNodes.length-1; i>=0; i--)
          {
            var child = childNodes[i];
            if (adf.mf.internal.amx.getCSSClassNameIndex(child.className, "amx-panelPage-content") != -1)
            {
          var scrollLeft = storedData.scrollLeft;
          if (scrollLeft != null)
                child.scrollLeft = scrollLeft;
          var scrollTop = storedData.scrollTop;
          if (scrollTop != null)
                child.scrollTop = scrollTop;
              break; // there should only be 1 instance found
        }
          }
        }
      },

      preDestroy: function($nodeOrDomNode,amxNode)
      {
        // Temporary shim until jQuery is completely removed:
        var domNode;
        if ($nodeOrDomNode.jquery)
        {
          domNode = $nodeOrDomNode.get(0);
        }
        else
        {
          domNode = $nodeOrDomNode;
        }

        // Store off the current scroll position in case this view instance is ever revisited:
        this._storeScrollPositions(domNode, amxNode.getId());
      },

      _storeScrollPositions: function(domNode, amxNodeId)
      {
        var childNodes = domNode.childNodes;
        for (var i=childNodes.length-1; i>=0; i--)
        {
          var child = childNodes[i];
          if (adf.mf.internal.amx.getCSSClassNameIndex(child.className, "amx-panelPage-content") != -1)
          {
            var scrollLeft = child.scrollLeft;
            var scrollTop = child.scrollTop;
        if (scrollLeft != null || scrollTop != null)
        {
          var storedData =
          {
            scrollLeft: scrollLeft,
            scrollTop: scrollTop
          };
          adf.mf.api.amx.setClientState(amxNodeId, storedData);
        }
            break; // there should only be 1 instance found
      }
        }
      }
    },

    panelFormLayout:
    {
      create: function(amxNode)
      {
        // Generate the outer structure:
        var rootElement = document.createElement("div");
        var rootStyleClasses = [];
        rootStyleClasses.push("amx-panelFormLayout amx-scrollable");
        // Adding WAI-ARIA Attribute for the PFL Node
        rootElement.setAttribute("role", "form");
        var body = document.createElement("div");
        body.className = "amx-panelFormLayout_body"
        rootElement.appendChild(body);

        // Apply the labelAlignement marker class:
        var labelPositionStyle = "amx-label-position-start"; // default is "start"
        if (amxNode.getAttribute("labelPosition") != null)
        {
          if (amxNode.getAttribute("labelPosition") === "end")
            labelPositionStyle = "amx-label-position-end";
          else if (amxNode.getAttribute("labelPosition") === "center")
            labelPositionStyle = "amx-label-position-center";
          else if (amxNode.getAttribute("labelPosition") === "topStart")
            labelPositionStyle = "amx-label-position-topStart";
          else if (amxNode.getAttribute("labelPosition") === "topCenter")
            labelPositionStyle = "amx-label-position-topCenter";
          else if (amxNode.getAttribute("labelPosition") === "topEnd")
            labelPositionStyle = "amx-label-position-topEnd";
        }
        rootStyleClasses.push(labelPositionStyle);

        var fieldHalignStyle = "amx-field-halign-end"; // default is "end"
        if (amxNode.getAttribute("fieldHalign") != null)
        {
          if (amxNode.getAttribute("fieldHalign") === "start")
            fieldHalignStyle = "amx-field-halign-start";
          else if (amxNode.getAttribute("fieldHalign") === "center")
            fieldHalignStyle = "amx-field-halign-center";
        }
        rootStyleClasses.push(fieldHalignStyle);

        // Apply the label/field widths:
        if (labelPositionStyle != "amx-label-position-topStart" &&
            labelPositionStyle != "amx-label-position-topCenter" &&
            labelPositionStyle != "amx-label-position-topEnd")
        {
          rootStyleClasses.push("amx-layout-one-row");

          // If labels are on the same row as the fields then we need to add the sizing row and assign the values:
          var sizingRow = document.createElement("div");
          sizingRow.className = "amx-panelFormLayout_sizing";
          var sizingLabel = document.createElement("div");
          sizingLabel.className = "field-label";
          var sizingField = document.createElement("div");
          sizingField.className = "field-value";
          sizingRow.appendChild(sizingLabel);
          sizingRow.appendChild(sizingField);
          body.appendChild(sizingRow);

          var labelWidth = amxNode.getAttribute("labelWidth");
          if(this._nonNegativeNumberRegExp.test(labelWidth))
          {
            labelWidth = labelWidth+"px";
          }
          var valueWidth = amxNode.getAttribute("fieldWidth");
          if(this._nonNegativeNumberRegExp.test(valueWidth))
          {
            valueWidth = valueWidth+"px";
          }
          var labelIsPercent = (labelWidth == null ? false : labelWidth == this._nonNegativePercentRegExp.exec(labelWidth));
          var fieldIsPercent = (valueWidth == null ? false : valueWidth == this._nonNegativePercentRegExp.exec(valueWidth));
          var labelIsPx = !labelIsPercent && (labelWidth == null ? false : labelWidth == this._nonNegativePxRegExp.exec(labelWidth));
          var fieldIsPx = !fieldIsPercent && (valueWidth == null ? false : valueWidth == this._nonNegativePxRegExp.exec(valueWidth));
          if (labelIsPercent && fieldIsPercent)
          {
            // normalize the percents and use both
            labelWidth = parseFloat(labelWidth);
            valueWidth = parseFloat(valueWidth);
            totalPercent = labelWidth + valueWidth;
            labelWidth = 100*labelWidth/totalPercent + "%";
            valueWidth = 100*valueWidth/totalPercent + "%";
            sizingLabel.style.width = labelWidth;
            sizingField.style.width = valueWidth;
          }
          else if (labelIsPx || (labelIsPx && fieldIsPx))
          {
            // label gets pixels, field becomes undefined
            sizingLabel.style.width = labelWidth;
          }
          else if (fieldIsPx)
          {
            // field gets pixels, label becomes undefined
            sizingField.style.width = valueWidth;
          }
          // Any other scenarios will result in both widths being ignored.
        }
        else
        {
          rootStyleClasses.push("amx-layout-separate-rows");
        }

        rootElement.className = rootStyleClasses.join(" ");
        $(body).append(amxNode.renderSubNodes()); // TODO make non-jq
        return rootElement;
      },

      _nonNegativeNumberRegExp: new RegExp(/^[0-9]+[.]?[0-9]*$/),

      _nonNegativePercentRegExp: new RegExp(/[0-9]+[.]?[0-9]*[%]/),

      _nonNegativePxRegExp: new RegExp(/[0-9]+[.]?[0-9]*[p][x]/)
    },

    panelLabelAndMessage: function(amxNode)
    {
      var field = amx.createField(amxNode); // generate the fieldRoot/fieldLabel/fieldValue structure
      var fieldRoot = field.fieldRoot;
      // Adding WAI-ARIA Attributes for the component
      fieldRoot.setAttribute("aria-labelledby", amxNode.getAttribute("label"));
      var fieldValue = field.fieldValue;
      $(fieldValue).append(amxNode.renderSubNodes()); // TODO make non-jq
      // calls applyRequiredMarker to determine and implement required/showRequired style
      adf.mf.api.amx.applyRequiredMarker(amxNode, field);
      return fieldRoot;
    },

    panelGroupLayout: function(amxNode)
    {
      var rootElement;
      var childWrapperParent;
      var layout = amxNode.getAttribute("layout");
      var isHorizontal = (layout === "horizontal");
      var isWrap = (layout === "wrap");
      var halign = (!isWrap ? amxNode.getAttribute("halign") : null);
      var valign = (isHorizontal ? amxNode.getAttribute("valign") : null);

      if (isHorizontal)
      {
        rootElement = document.createElement("div");
        rootElement.className = "amx-scrollable";
        var table = document.createElement("table");
        rootElement.appendChild(table);
        childWrapperParent = table.insertRow(-1);
        if (halign == "center")
        {
          table.setAttribute("align", "center");
        }
        else if (halign == "end")
        {
          // The first child of a horizontal layout must be an empty "100%-wide" cell to force the
          // other cells to be pushed to the end side of the table:
          var wrapper = childWrapperParent.insertCell(-1);
          wrapper.setAttribute("width", "100%");
        }
      }
      else if (isWrap)
      {
        rootElement = document.createElement("span");
        rootElement.className = "amx-scrollable amx-wrap";
      }
      else // isVertical
      {
        rootElement = document.createElement("div");
        rootElement.className = "amx-scrollable";
        if (halign == "center")
        {
          rootElement.setAttribute("align", "center");
        }
        else if (halign == "end")
        {
          if (document.documentElement.dir == "rtl")
            rootElement.setAttribute("align", "left");
          else
            rootElement.setAttribute("align", "right");
        }
      }

      var $subNodes = amxNode.renderSubNodes(); // TODO make non-jq
      for (var i=0, size=$subNodes.length; i<size; ++i) // TODO make non-jq
      {
        var elem = $subNodes.get(i); // TODO make non-jq
        if (isHorizontal)
        {
          var wrapper = childWrapperParent.insertCell(-1);
          wrapper.appendChild(elem);
          if (valign == "top" || valign == "middle" || valign == "bottom")
            wrapper.setAttribute("valign", valign);
        }
        else if (isWrap)
        {
          rootElement.appendChild(elem);
        }
        else // isVertical
        {
          var wrapper = document.createElement("div");
          wrapper.appendChild(elem);
          rootElement.appendChild(wrapper);
        }
      }
      return rootElement;
    },

    tableLayout: function(amxNode)
    {
      var rootElement = document.createElement("div");
      rootElement.className = "amx-scrollable";

      var table = document.createElement("table");
      table.setAttribute("border", _ensureValidInt(amxNode.getAttribute("borderWidth"), 0));
      table.setAttribute("cellPadding", _ensureValidInt(amxNode.getAttribute("cellPadding"), 0));
      table.setAttribute("cellSpacing", _ensureValidInt(amxNode.getAttribute("cellSpacing"), 0));

      var halign = _ensureValidEnum(amxNode.getAttribute("halign"), "start", "center", "end"); // start is the default
      if (halign == "end")
      {
        if (document.documentElement.dir == "rtl")
          table.setAttribute("align", "left");
        else
          table.setAttribute("align", "right");
      }
      else if (halign == "center")
      {
        table.setAttribute("align", halign);
      }

      var layout = _ensureValidEnum(amxNode.getAttribute("layout"), "fixed", "weighted"); // fixed is the default
      if (layout == "fixed")
        table.style.tableLayout = "fixed";

      var shortDesc = amxNode.getAttribute("shortDesc");
      if (shortDesc != null)
        table.title = shortDesc;

      table.summary = _ensureValidString(amxNode.getAttribute("summary"), "");

      var width = amxNode.getAttribute("width");
      if (width != null)
        table.width = width;

      rootElement.appendChild(table);

      // Append the rows to the table:
      var $subNodes = amxNode.renderSubNodes(); // TODO make non-jq
      for (var i=0, size=$subNodes.length; i<size; ++i) // TODO make non-jq
      {
        var row = $subNodes.get(i); // TODO make non-jq
        if (row.tagName == "TR")
          table.appendChild(row);
        else
          console.log("Illegal child found in tableLayout: " + row);
      }

      return rootElement;
    },

    rowLayout: function(amxNode)
    {
      var row = document.createElement("tr");

      // Append the cells to the row:
      var $subNodes = amxNode.renderSubNodes(); // TODO make non-jq
      for (var i=0, size=$subNodes.length; i<size; ++i) // TODO make non-jq
      {
        var cell = $subNodes.get(i); // TODO make non-jq
        if (cell.tagName == "TD")
          row.appendChild(cell);
        else if (cell.tagName == "TH")
          row.appendChild(cell);
        else
          console.log("Illegal child found in rowLayout: " + cell);
      }

      return row;
    },

    cellFormat: function(amxNode)
    {
      var cell;
      var header = _ensureValidBoolean(amxNode.getAttribute("header"), false);
      if (header)
        cell = document.createElement("th");
      else
        cell = document.createElement("td");

      var columnSpan = Math.max(1, _ensureValidInt(amxNode.getAttribute("columnSpan"), 1));
      cell.setAttribute("colspan", columnSpan);

      var rowSpan = Math.max(1, _ensureValidInt(amxNode.getAttribute("rowSpan"), 1));
      cell.setAttribute("rowspan", rowSpan);

      var halign = _ensureValidEnum(amxNode.getAttribute("halign"), "start", "center", "end"); // start is the default
      if (halign == "end")
      {
        if (document.documentElement.dir == "rtl")
          cell.setAttribute("align", "left");
        else
          cell.setAttribute("align", "right");
      }
      else if (halign == "center")
      {
        cell.setAttribute("align", halign);
      }
      else
      {
        if (document.documentElement.dir == "rtl")
          cell.setAttribute("align", "right");
        else
          cell.setAttribute("align", "left");
      }

      var valign = _ensureValidEnum(amxNode.getAttribute("valign"), "middle", "top", "bottom"); // middle is the default
      cell.setAttribute("valign", valign);

      var shortDesc = amxNode.getAttribute("shortDesc");
      if (shortDesc != null)
        cell.title = shortDesc;

      var width = amxNode.getAttribute("width");
      if (width != null)
        cell.width = width;

      var height = amxNode.getAttribute("height");
      if (height != null)
        cell.height = height;

      // Append the content to the cell:
      var $subNodes = amxNode.renderSubNodes(); // TODO make non-jq
      for (var i=0, size=$subNodes.length; i<size; ++i) // TODO make non-jq
      {
        var elem = $subNodes.get(i); // TODO make non-jq
        cell.appendChild(elem);
      }

      return cell;
    }

  }; // /var amxRenderers

  function _ensureValidInt(rawValue, defaultValue)
  {
    if (rawValue == null)
      return defaultValue;
    var result = parseInt(rawValue, 10);
    if (isNaN(result))
      return defaultValue;
    return result;
  }

  function _ensureValidBoolean(rawValue, defaultValue)
  {
    if ("true" === rawValue || true === rawValue)
      return true;
    else if ("false" === rawValue || false === rawValue)
      return false;
    return defaultValue;
  }

  function _ensureValidString(rawValue, defaultValue)
  {
    if (rawValue == null)
      return defaultValue;
    return rawValue;
  }

  function _ensureValidEnum()
  {
    var argLength = arguments.length;
    if (argLength < 2)
      console.log("Not enough _ensureValidEnum arguments");
    var rawValue = arguments[0];
    for (var i=1; i<argLength; i++)
    {
      if (rawValue == arguments[i])
        return rawValue;
    }
    return arguments[1]; // use the default value instead
  }

  // add this renderer
  amx.registerRenderers("amx", amxRenderers);

})();

