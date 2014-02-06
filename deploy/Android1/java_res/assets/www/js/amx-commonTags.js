/* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. */
/* ------------------------------------------------------ */
/* ------------------- amx-commonTags.js ---------------- */
/* ------------------------------------------------------ */

(function()
{
  var currentScrollXElement = null;
  var currentScrollYElement = null;

  $(function()
  {
    // Android 2.3 requires that we use programmatic scrolling.
    // While Android 4.0 and 4.1 offer some support for native scrolling, there are issues so
    // we will use programmatic scrolling for all versions of Android Generic:
    var agent = adf.mf.internal.amx.agent;
    if (agent["type"] == "Android" && agent["subtype"] == "Generic")
    {
      $(document).drag(".amx-scrollable",
      {
        start: function(event, dragExtra)
        {
        },

        drag: function(event, dragExtra)
        {
          if (dragExtra && window.androidHackForListViewReorder == null)
          {
            var scrollable = this;
            // TODO make non-jq
            // TODO innerHeight means offsetHeight minus border heights
            // TODO innerWidths means offsetWidth minus border widths
            var $scrollable = $(scrollable);
            if ((scrollable.scrollHeight - $scrollable.innerHeight()) !== 0)
            {
              if (currentScrollYElement == null || currentScrollYElement == scrollable)
              {
                currentScrollYElement = scrollable;
                var previousScrollTop = scrollable.scrollTop;
                scrollable.scrollTop = previousScrollTop + (-1 * dragExtra.deltaPageY);
                if (previousScrollTop == scrollable.scrollTop) // reached the limit
                  currentScrollYElement = null; // let ancestors have a chance
              }
            }
            if ((scrollable.scrollWidth - $scrollable.innerWidth()) !== 0)
            {
              if (currentScrollXElement == null || currentScrollXElement == scrollable)
              {
                currentScrollXElement = scrollable;
                var previousScrollLeft = scrollable.scrollLeft;
                scrollable.scrollLeft = previousScrollLeft + (-1 * dragExtra.deltaPageX);
                if (previousScrollLeft != scrollable.scrollLeft) // reached the limit
                  currentScrollXElement = null; // let ancestors have a chance
              }
            }
          }
        },

        end: function(event, dragExtra)
        {
          currentScrollXElement = null;
          currentScrollYElement = null;
        },

        threshold: 15
      });
    } // end of Android Generic
  });
})();

(function()
{
  var amxRenderers =
  {
    view: function(amxNode)
    {
      var domNode = document.createElement("div");
      $(domNode).append(amxNode.renderSubNodes()); // TODO remove jQuery on this
      return domNode;
    },

    spacer: function(amxNode)
    {
      var width = amx.getTextValue(amxNode.getAttribute("width"));
      var height = amx.getTextValue(amxNode.getAttribute("height"));
      var hidden = !amx.isNodeRendered(amxNode);

      if (hidden || width == null || width.length <= 0)
      {
        if (hidden || height == null || height.length < 0)
        {
          // Both width and height are null or zero, just render an empty span.
          return document.createElement("span");
        }
        else // it has a height but not a width
        {
          if (height.length != 0)
          {
            // our default unit is px
            var domNode = document.createElement("div");
            domNode.style.marginTop = height + "px";
            return domNode;
          }
          else
          {
            return document.createElement("div");
          }
        }
      }
      else // it at least has a width (it might have a height)
      {
        if (height == null || height.length <= 0)
        {
          height = 0;
        }

        var domNode = document.createElement("div");
        var domNodeStyle = domNode.style;
        domNodeStyle.display = "inline-block";
        domNodeStyle.marginTop = height + "px";
        domNodeStyle.marginRight = width + "px";
        return domNode;
      }
    },

    verbatim: function(amxNode)
    {
      var domNode = document.createElement("div");
      var content = amxNode.getTag().getTextContent();
      domNode.innerHTML = content;
      return domNode;
    },

    goLink: function(amxNode)
    {
      var domNode;

      if(amx.isValueTrue(amxNode.getAttribute("disabled")))
      {
        //in accordance with HTML 4.01 disabled elements cannot receive focus, are skipped in tabbing navigation and cannot be successful
        //disabled attribute is not supported by A tag -> change to span (read-only, non-focusable, not successful by definition)
        domNode = document.createElement("span");
        domNode.setAttribute("aria-disabled", "true");

        var text = amxNode.getAttribute("text");
        if (text != null)
        {
          var label = document.createElement("label");
          label.appendChild(document.createTextNode(text));
          // VoiceOver will not apply "dimmed" to a label inside of an anchor
          // so we will mark the label as presentation/hidden and define the
          // text as the aria-label of the anchor element instead.
          label.setAttribute("role", "presentation");
          label.setAttribute("aria-hidden", "true");
          domNode.setAttribute("aria-label", text);
          domNode.appendChild(label);
        }
      }
      else
      {
        domNode = document.createElement("a");
        domNode.setAttribute("href", amx.getTextValue(amxNode.getAttribute("url")));
        domNode.appendChild(document.createTextNode(amx.getTextValue(amxNode.getAttribute("text"))));
      }

      // Adding WAI-ARIA Attribute to the markup for the role attribute
      domNode.setAttribute("role", "link");
      var shortDesc = amxNode.getAttribute("shortDesc");
      if (shortDesc != null)
      {
        domNode.setAttribute("aria-label", shortDesc);
      }

      //render child elements if there are any
      $(domNode).append(amxNode.renderSubNodes()); // TODO remove jQuery on this
      return domNode;
    },

    outputText: function(amxNode)
    {
      var domNode = document.createElement("span");
      var displayValue = amx.getTextValue(amxNode.getAttribute("value"));

      // Mark this with a role of heading if it has a styleClass that makes it a heading:
      var styleClass = amxNode.getAttribute("styleClass");
      if (styleClass != null && adf.mf.internal.amx.getCSSClassNameIndex(styleClass, "amx-text-sectiontitle") != -1)
      {
        domNode.setAttribute("role", "heading");
      }

      var truncateAt = parseInt(amxNode.getAttribute("truncateAt"));
      if (!isNaN(truncateAt) && truncateAt > 0 && typeof amxNode.getAttribute("value") != "undefined")
      {
        // from the tagdoc:
        // the length at which the text should automatically begin truncating.
        // When set to zero (the default), the string will never truncate. Values
        // from one to fifteen will display the first 12 characters followed by an
        // ellipsis (...). The outputText component will not truncate strings shorter
        // than fifteen characters. For example, for the value of 1234567890123456,
        // setting truncateAt to 0 or 16 will not truncate. Setting truncateAt to any
        // value between 1-15 will truncate to 123456789012...
        if (truncateAt < 15)
        {
          truncateAt = 15;
        }

        domNode.setAttribute("amx-data-value", displayValue);
        if (truncateAt < displayValue.length)
        {
          displayValue = displayValue.substring(0,truncateAt - 3)+"...";
        }
        domNode.className = "amx-outputText-truncateAt";
      }

      domNode.appendChild(document.createTextNode(displayValue));
      return domNode;
    },

    inputText:
    {
      createChildrenNodes: function(amxNode)
      {
        // Call the register input value during node creation as it requires the EL context
        // to be setup and rendering is not performed in EL context (expects all EL to already
        // be resolved during rendering)
        amx.registerInputValue(amxNode, "value");

        // Return false to let the framework create the children
        return false;
      },

      updateChildren: function(amxNode, attributeChanges)
      {
        // readOnly fields are special - the inputElement is a div, so don't do
        // any fancy refreshing here
        if (amx.isValueTrue(amxNode.getAttribute("readOnly")))
        {
          return adf.mf.api.amx.AmxNodeChangeResult["RERENDER"];
        }

        var numChanged = attributeChanges.getSize();
        var maxLengthChanged = attributeChanges.hasChanged("maximumLength");
        var valueChanged = attributeChanges.hasChanged("value");
        var labelChanged = attributeChanges.hasChanged("label");
        var expectedChanges = 0;

        if (maxLengthChanged)
        {
          ++expectedChanges;
        }

        if (valueChanged)
        {
          ++expectedChanges;
        }

        if (labelChanged)
        {
          ++expectedChanges;
        }

        // check to make sure that the changes are only to the attributes we expect
        if (expectedChanges != numChanged)
        {
          return adf.mf.api.amx.AmxNodeChangeResult["RERENDER"];
        }

        if (valueChanged || maxLengthChanged)
        {
          // if the current inputElement is the one that has focus, and we are on Android, just
          // return false to make sure the node is recreated fully. Android has a problem
          // when refreshing inputText controls that have focus. We can revisit the dirty
          // behavior if it is deemed to be incorrect. For now, the safest thing to do
          // is maintain the current behavior
          var inputElement = document.getElementById(amxNode.getId() + "__inputElement");
          if (inputElement && document.activeElement == inputElement)
          {
            var agent = adf.mf.internal.amx.agent;
            if (agent["type"] == "Android" && agent["subtype"] == "Generic")
            {
              var needsFullRefresh = true;
              // check to see if the value was reported as changing, but the maxLength was not
              if (valueChanged && maxLengthChanged == false)
              {
                if (amxNode.getAttribute("value") == attributeChanges.getOldValue("value"))
                {
                  // if the value actually hasn't changed, then we don't actually need a full refresh -
                  // the full refresh causes the soft keyboard to go away, which we don't want
                  needsFullRefresh = false;
                }
              }

              if (needsFullRefresh)
              {
                return adf.mf.api.amx.AmxNodeChangeResult["RERENDER"];
              }
            }
          }

          if (amxNode._dirty == true)
          {
            // this control is dirty, so return false to trigger a full control relayout which
            // will make the control behave the same for both refresh/relayout
            return adf.mf.api.amx.AmxNodeChangeResult["RERENDER"];
          }
        }

        return adf.mf.api.amx.AmxNodeChangeResult["REFRESH"];
      },

      refresh: function(amxNode, attributeChanges, descendentChanges)
      {
        var numChanged = attributeChanges.getSize();

        var maxLengthChanged = attributeChanges.hasChanged("maximumLength");
        var valueChanged = attributeChanges.hasChanged("value");
        var labelChanged = attributeChanges.hasChanged("label");

        var inputElement = document.getElementById(amxNode.getId() + "__inputElement");

        // if maxLength changed, then we just update the value and it will do truncation (once it comes online)
        if (valueChanged || maxLengthChanged)
        {
          this._setValue(amxNode, inputElement);
        }

        if (labelChanged)
        {
          this._setLabel(amxNode, inputElement);
        }
      },

      create: function(amxNode)
      {
        //var html = '<div data-role="fieldcontain" class="amx-fieldcontain"></div>';
        var field = amx.createField(amxNode); // generate the fieldRoot/fieldLabel/fieldValue structure

        field.fieldLabel.setAttribute("id", amxNode.getId() + "__fieldLabel");
        var inputElement;
        amxNode._oldValue = null;
        amxNode._dirty = false;
        var wrapElement = document.createElement("div");
        wrapElement.className = "wrap";
        field.fieldValue.appendChild(wrapElement);

        var isRequired = amx.isValueTrue(amxNode.getAttribute("required"));
        var isReadOnly = amx.isValueTrue(amxNode.getAttribute("readOnly"));

        if (isReadOnly)
        {
          inputElement = document.createElement("div");
          inputElement.className = "readOnlyLabel";
          inputElement.setAttribute("aria-readonly", "true");
          inputElement.appendChild(document.createTextNode(amx.getTextValue(amxNode.getAttribute("value"))));
          wrapElement.appendChild(inputElement);
        }
        else
        {
          var rowsAttr = amxNode.getAttribute("rows");
          if (rowsAttr && parseInt(rowsAttr, 10) > 1)
          {
            inputElement = document.createElement("textarea");
            inputElement.setAttribute("rows", rowsAttr);
            inputElement.setAttribute("aria-multiline", "true");
          }
          else
          {
            if (amx.isValueTrue(amxNode.getAttribute("secret")))
            {
              inputElement = document.createElement("input");
              inputElement.setAttribute("type", "password");
            }
            else
            {
              var inputType;
              switch (amxNode.getAttribute("inputType"))
              {
                case "number":
                case "email":
                case "url":
                //case "search": // does nothing on iOS at the moment, so omit
                case "tel":
                  inputType = amxNode.getAttribute("inputType");
                  break;
                default:
                  inputType = "text";
                  break;
              }
              inputElement = document.createElement("input");
              inputElement.setAttribute("type", inputType);
            }
          }

          inputElement.setAttribute("id", amxNode.getId() + "__inputElement");
          inputElement.setAttribute("name", amxNode.getAttribute("name"));

          // Adding html5 placeholder attribute for the hint-text
          inputElement.setAttribute("placeholder", amx.getTextValue(amxNode.getAttribute("hintText")));

          wrapElement.appendChild(inputElement);

          var maxLengthFunc = function(e)
          {
            var maxLength = amxNode.getAttribute("maximumLength");
            if (maxLength <= 0)
            {
              // we are allowing characters, so we are dirty
              amxNode._dirty = true;
              // no max length specified so return true to allow the chars
              return true;
            }

            var stringToAdd;
            if (e.type == "textInput")
            {
              if (e.originalEvent && e.originalEvent.data)
              {
                stringToAdd = e.originalEvent.data;
              }
              else
              {
                // we are allowing characters, so we are dirty
                amxNode._dirty = true;
                // this is a text event with no text, return true
                return true;
              }
            }
            else
            {
              // assume a single keypress
              stringToAdd = String.fromCharCode(e.charCode);
            }

            var addLength = stringToAdd.length;
            var val = inputElement.value;
            var numNewCharsAllowed = maxLength - val.length;
            if (addLength > numNewCharsAllowed)
            {
              // detect if there are any characters to add instead of disallowing all
              if (numNewCharsAllowed > 0)
              {
                // we are allowing characters, so we are dirty
                amxNode._dirty = true;
                // add only the allowed number of characters
                inputElement.value = val + stringToAdd.substring(0, numNewCharsAllowed);
              }
              return false;
            }

            // we are allowing characters, so we are dirty
            amxNode._dirty = true;
            return true;
          };

          var $input = $(inputElement); // TODO remove this jq
          $input.keypress(maxLengthFunc);
          // even though we detect keypresses, we also need to detect keyup events
          // to make sure we catch non-printable keys (like DEL)
          $input.keyup(maxLengthFunc);
          $input.bind("textInput", maxLengthFunc);

          this._setValue(amxNode, inputElement);

          adf.mf.internal.amx.registerBlur(
            inputElement,
            function()
            {
              // if we aren't dirty, then exit early
              if (amxNode._dirty == false)
              {
                return;
              }

              amxNode._dirty = false;
              var value = inputElement.value;

              // set the amxNode value so that it stays in sync
              amxNode.setAttributeResolvedValue("value", value);
              if (amxNode._oldValue !== value)
              {
                var vce = new amx.ValueChangeEvent(amxNode._oldValue, value);
                amx.processAmxEvent(amxNode,"valueChange","value",value, vce);
              }
              else
              {
                amx.processAmxEvent(amxNode,"valueChange","value",value);
              }
            });

          var outerThis = this;
          // register this node in order to receive events when another control is tapped
          adf.mf.internal.amx.registerFocus(
            inputElement,
            function()
            {
              outerThis._setOldValue(amxNode, inputElement);
            });
        }

        // Using ARIA role of textbox, other ARIA metadata specified throughout method.
        inputElement.setAttribute("role", "textbox");
        var labelId = amxNode.getId() + "::" + "lbl";
        inputElement.setAttribute("aria-labelledby", labelId);
        if (isRequired)
          inputElement.setAttribute("aria-required", "true");

        if (amx.isValueTrue(amxNode.getAttribute("disabled")))
        {
          inputElement.setAttribute("disabled", true);
          inputElement.setAttribute("aria-disabled", "true");
        }

        // call applyRequiredMarker in amx-core.css to determine and implement required/showRequired style
        adf.mf.api.amx.applyRequiredMarker(amxNode, field);

        return field.fieldRoot;
      },

      /**
       * Sets the value of the current inputElement instance to the value of the amxNode and update
       * amxNode._oldValue with the current value
       * @param {Object} amxNode the current amxNode instance
       * @param {HTMLElement} inputElement the current inputElement instance
       */
      _setValue: function(amxNode, inputElement)
      {
        if (inputElement)
        {
          amxNode._dirty = false;
          // !== null also checks for boolean false value inside inputText
          var valueAttr = amxNode.getAttribute("value");
          if (valueAttr !== null && valueAttr !== "")
          {
            var textValue = amx.getTextValue(valueAttr);
            // the following code should be enabled, but since it changes
            // the current functionality a new bug will need to be filed
            // var maxLength = amxNode.getAttribute("maximumLength");
            // if (maxLength > 0 && maxLength < textValue.length)
            // {
              // textValue = textValue.substring(0, maxLength);
              // the text was clipped so we need to set ourselves to dirty
              // so the next time we blur we send a change event
              // amxNode._dirty = true;
            // }
            var oldValue = inputElement.value;
            inputElement.value = textValue;
          }
          else
          {
            inputElement.value = null;
          }

          this._setOldValue(amxNode, inputElement);

        }
      },

      /**
       * Sets amxNode._oldValue to the value of the current inputElement's value
       * @param {Object} amxNode the current amxNode instance
       * @param {HTMLElement} inputElement the current inputElement instance
       */
      _setOldValue: function(amxNode, inputElement)
      {
        if (inputElement === undefined || inputElement === null)
        {
          inputElement = document.getElementById(amxNode.getId() + "__inputElement");
        }

        if (inputElement)
        {
          amxNode._oldValue = inputElement.value;
        }
      },

      /**
       * Sets label value of field to the value of the amxNode's label attribute
       * @param {Object} amxNode the current amxNode instance
       * @param {HTMLElement} inputElement the current inputElement instance
       */
      _setLabel: function(amxNode, inputElement)
      {
        var labelText = amx.getTextValue(amxNode.getAttribute("label"));
        var fieldLabel = document.getElementById(amxNode.getId() + "__fieldLabel");
        if (fieldLabel)
        {
          fieldLabel.removeChild(fieldLabel.childNodes[0]);
          fieldLabel.appendChild(document.createTextNode(labelText));
        }

        if (inputElement)
        {
          inputElement.setAttribute("aria-labelledby", labelText);
        }
      }
    },

    image: function(amxNode)
    {
      var domNode = document.createElement("img");
      var source = amx.getTextValue(amxNode.getAttribute("source"));
      domNode.setAttribute("src", amx.buildRelativePath(source));

      var shortDesc = amxNode.getAttribute("shortDesc");
      if (shortDesc == null || shortDesc == "")
      {
        // This is a decorative image
        domNode.setAttribute("role", "presentation");
        domNode.setAttribute("aria-hidden", "true");
        domNode.setAttribute("alt", "");
      }
      else
      {
        // This is not a decorative image
        domNode.setAttribute("role", "image");
        domNode.setAttribute("alt", shortDesc);
      }

      return domNode;
    },

    commandLink:
    {
      create: function(amxNode)
      {
        var domNode = document.createElement("a");

        // Adding WAI-ARIA Attribute to the markup for the A element
        domNode.setAttribute("role", "link");

        var $node = $(domNode); // TODO remove this jq

        // prevent the default behavior
        $node.bind('click',function(e)
        {
          e.stopPropagation();
          e.preventDefault();
        });

        if (amx.isValueTrue(amxNode.getAttribute("disabled")))
        {
          domNode.className = "amx-disabled";

          // Adding WAI-ARIA Attribute to the markup for disabled state
          domNode.setAttribute("aria-disabled", "true");
        }
        else if (amx.isValueTrue(amxNode.getAttribute("readOnly")))
        {
          domNode.className = "amx-readOnly";

          // Adding WAI-ARIA Attribute to the markup for readonly state
          domNode.setAttribute("aria-readonly", "true");
        }
        else
        {
          // In order for VoiceOver to honor the action, we must provide an href
          domNode.setAttribute("href", "#");
        }

        $node.tap(function(event)
        {
          // Eat the event since this link is handling it:
          event.preventDefault();
          event.stopPropagation();

          if (!amx.isValueTrue(amxNode.getAttribute("disabled")) &&
            !amx.isValueTrue(amxNode.getAttribute("readOnly")))
          {
            amx.validate($node).done(
              function()
              {
                if (amx.acceptEvent())
                {
                  var event = new amx.ActionEvent();
                  amx.processAmxEvent(amxNode, "action", undefined, undefined, event).always(
                    function()
                    {
                      var action = amxNode.getTag().getAttribute("action");
                      if (action != null)
                      {
                        adf.mf.api.amx.doNavigation(action);
                      }
                    });
                }
              });
          }
        });

        var text = amxNode.getAttribute("text");
        if (text != null)
        {
          var label = document.createElement("label");
          label.appendChild(document.createTextNode(text));
          // VoiceOver will not apply "dimmed" to a label inside of an anchor
          // so we will mark the label as presentation/hidden and define the
          // text as the aria-label of the anchor element instead.
          label.setAttribute("role", "presentation");
          label.setAttribute("aria-hidden", "true");
          domNode.setAttribute("aria-label", text);
          domNode.appendChild(label);
        }

        var shortDesc = amxNode.getAttribute("shortDesc");
        if (shortDesc != null)
        {
          domNode.setAttribute("aria-label", shortDesc);
        }

        amx.enableSwipe($node);
        amx.enableTapHold($node);

        $node.append(amxNode.renderSubNodes()); // TODO make non jq
        return domNode;
      }
    },

    commandButton:
    {
      create: function(amxNode)
      {
        var domNode = document.createElement("div");
        domNode.setAttribute("tabindex", "0");
        var label = document.createElement("label");
        label.className = "amx-commandButton-label";
        label.appendChild(document.createTextNode(amx.getTextValue(amxNode.getAttribute("text"))));
        domNode.appendChild(label);

        // Adding WAI-ARIA Attribute to the markup for the role attribute
        domNode.setAttribute("role", "button");

        return domNode;
      },

      init: function(domNode, amxNode)
      {
        var action = amxNode.getTag().getAttribute("action");
        if (action == "__back")
        {
          if (adf.mf.internal.amx.getCSSClassNameIndex(amxNode.getAttribute("styleClass"),
            "amx-commandButton-normal") == -1)
          {
            adf.mf.internal.amx.addCSSClassName(domNode, "amx-commandButton-back");
          }
        }

        if (amxNode.getAttribute("icon"))
        {
          // if we have an '.', then assume it is an image
          if (amxNode.getAttribute("icon").indexOf(".") > -1)
          {
            var icon = document.createElement("img");
            icon.className = "amx-commandButton-icon";
            icon.setAttribute("src", amx.buildRelativePath(amxNode.getAttribute("icon")));
            domNode.insertBefore(icon, domNode.firstChild);
          }
          /*else // TODO what is the point of creating and orphaning this?
          {
            // otherwise, we assume it is a pre-built icon
            var icon = document.createElement("span");
            icon.className = "amx-commandButton-icon";
            //icon.style.backgroundImage = "url(images/test-icon.png)";
            //domNode.insertBefore(icon, domNode.parentNode);
          }*/

          // Check for img icon position to be trailing or leading
          if (amxNode.getAttribute("iconPosition") == "trailing")
          {
            adf.mf.internal.amx.addCSSClassName(domNode, "amx-iconPosition-trailing");
          }
          else
          {
            adf.mf.internal.amx.addCSSClassName(domNode, "amx-iconPosition-leading");
          }
        }

        // Grabbing the label text of the commandButton
        var childNodes = domNode.childNodes;
        var length = childNodes.length;
        var commandButtonLabel;
        for (var i=0; i<length; i++)
        {
          var child = childNodes[i];
          if (adf.mf.internal.amx.getCSSClassNameIndex(child.className, "amx-commandButton-label") != -1)
          {
            commandButtonLabel = child;
            break;
          }
        }
        var commandButtonLabelText = commandButtonLabel.textContent;

        if (amx.isValueTrue(amxNode.getAttribute("disabled")))
        {
          // Adding WAI-ARIA Attribute to the markup for disabled state
          domNode.setAttribute("aria-disabled", "true");

          adf.mf.internal.amx.addCSSClassName(domNode, "amx-disabled");
        }

        if (commandButtonLabelText == "")
        {
          adf.mf.internal.amx.addCSSClassName(domNode, "amx-label-no-text");
        }

        var $node = $(domNode); // TODO make non-jq
        $node.tap(function(event)
        {
          // Eat the event since this button is handling it:
          event.preventDefault();
          event.stopPropagation();

          if (!amx.isValueTrue(amxNode.getAttribute("disabled")))
          {
            // adf.mf.internal.perf.start("Tap validation" );
            amx.validate($node).done(function()
            {
                // adf.mf.internal.perf.stop("Tap validation" );
                // adf.mf.internal.perf.start("Tap processing" );
              if (amx.acceptEvent())
              {
                var event = new amx.ActionEvent();
                amx.processAmxEvent(amxNode, "action", undefined, undefined, event).always(function()
                {
                  var action = amxNode.getTag().getAttribute("action");
                  if (action != null)
                  {
                    adf.mf.api.amx.doNavigation(action);
                  }
                  // adf.mf.internal.perf.stop("Tap processing");
                });
              }
             });
          }
        });

        if (!amx.isValueTrue(amxNode.getAttribute("disabled")))
        {
          var mousedown = "mousedown";
          var mouseup = "mouseup";
          if (amx.hasTouch())
          {
            mousedown = "touchstart";
            mouseup = "touchend";
          }
          //added the following code to block processing of the touch/mouse events by jQuery because extraneous events
          //were being generated after the tap event. This was causing particular problems when components were being added
          //or removed (e.g. popups) because underlying components could receive unintended events.
          $node.bind(mousedown,function(e)
          {
            adf.mf.internal.amx.addCSSClassName(domNode, "amx-selected");
            // Adding WAI-ARIA Attribute to the markup for button-pressed state
            domNode.setAttribute("aria-pressed", "true");
          });
          $node.bind(mouseup,function(e)
          {
            adf.mf.internal.amx.removeCSSClassName(domNode, "amx-selected");
            // Adding WAI-ARIA Attribute to the markup for button-unpressed state
            domNode.setAttribute("aria-pressed", "false");
          });
          $node.bind("mouseout",function()
          {
            adf.mf.internal.amx.removeCSSClassName(domNode, "amx-selected");
            // Adding WAI-ARIA Attribute to the markup for button-unpressed state
            domNode.setAttribute("aria-pressed", "false");
          });
        }
      }
    }
  }; // /var amxRenderers

  // --------- AMX Helper Functions --------- //

  (function()
  {
    /**
     * Constructs the basic structure for all the form controls (i.e. field).
     * @param {Object} amxNode the AMX Node to generate the form field control from
     * @return {Object} an object with properties "fieldRoot" for the root element,
     *                  "fieldLabel" for the label element, and "fieldValue" for
     *                  the value content element
     */
    amx.createField = function(amxNode)
    {
      var field = {};

      var fieldRoot = document.createElement("div");
      fieldRoot.className = "field";

      field.fieldRoot = fieldRoot;
      field.isReadOnly = amx.isValueTrue(amxNode.getAttribute("readOnly"));
      field.isDisable = amx.isValueTrue(amxNode.getAttribute("disabled"));

      var fieldLabel = document.createElement("div");
      fieldLabel.className = "field-label";
      field.fieldLabel = fieldLabel;
      fieldRoot.appendChild(fieldLabel);

      var simple = amx.isValueTrue(amxNode.getAttribute("simple"));
      if (simple)
      {
        adf.mf.internal.amx.addCSSClassName(fieldRoot, "amx-simple");
      }
      else
      {
        // inputText uses knowledge of this structure to update the label as a refresh. Any
        // changes to how the label is created needs to also propagate to inputText._setLabel
        var label = document.createElement("label");

        var stampedId = amxNode.getId();
        var labelId = stampedId + "::" + "lbl";
        label.setAttribute("id", labelId);

        label.appendChild(document.createTextNode(amx.getTextValue(amxNode.getAttribute("label"))));
        fieldLabel.appendChild(label);
      }

      var fieldValue = document.createElement("div");
      fieldValue.className = "field-value";
      field.fieldValue = fieldValue;
      fieldRoot.appendChild(fieldValue);

      return field;
    };
  })(jQuery);
  // --------- /AMX Helper Functions --------- //

  // add this renderer
  amx.registerRenderers("amx",amxRenderers);

})();

