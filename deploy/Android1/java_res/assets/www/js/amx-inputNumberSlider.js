/* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. */
/* ------------------------------------------------------------- */
/* ------------------- amx-inputNumberSlider.js ---------------- */
/* ------------------------------------------------------------- */

(function()
{
  var amxRenderers =
  {
    inputNumberSlider:
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

      create: function(amxNode)
      {
        var field = amx.createField(amxNode); // generate the fieldRoot/fieldLabel/fieldValue structure
        var domNode = field.fieldRoot;
        var disable = field.isDisable;
        var isReadOnly = amx.isValueTrue(amxNode.getAttribute("readOnly"));
        var isRequired = amx.isValueTrue(amxNode.getAttribute("required"));
        var container = document.createElement("div");
        container.className = "container"
        field.fieldValue.appendChild(container);
//        var inputTextNumber = document.createElement("div");
//        inputTextNumber.className = "inputTextNumber";
//        var input = document.createElement("input");
//        input.setAttribute("maxlength", "4");
//        input.setAttribute("type", "text");
//        inputTextNumber.appendChild(input);

        var slider = document.createElement("div");
        var sliderId = amxNode.getId() + "::slider";
        slider.setAttribute("id", sliderId);
        slider.className = "slider";

        var valve_bg = document.createElement("div");
        var valveBgId = amxNode.getId() + "::valveBg";
        valve_bg.setAttribute("id", valveBgId);
        valve_bg.className = "valve-background";
        slider.appendChild(valve_bg);

        var valve = document.createElement("div");
        valve.className = "valve";

        // Set this using ARIA slider role and set ARIA metadata
        // ARIA slider doesn't support aria-readOnly assignment, so we'll instead not assign ARIA
        // values when readOnly is set.
        if (!isReadOnly)
        {
          valve.setAttribute("role", "slider");
          var labelId = amxNode.getId() + "::" + "lbl";
          valve.setAttribute("aria-labelledby", labelId);
          valve.setAttribute("aria-orientation", "horizontal");
          valve.setAttribute("aria-valuemin", amxNode.getAttribute("minimum"));
          valve.setAttribute("aria-valuemax", amxNode.getAttribute("maximum"));
          valve.setAttribute("aria-valuenow", amxNode.getAttribute("value"));
          if (disable)
            valve.setAttribute("aria-disabled", "true");
          if (isRequired)
            valve.setAttribute("aria-required", "true");
        }

        valve_bg.appendChild(valve);

        var selected = document.createElement("div");
        selected.className = "selected";
        slider.appendChild(selected);

        if (isReadOnly)
        {
          adf.mf.internal.amx.addCSSClassName(domNode, "amx-readOnly");
        }

        container.appendChild(slider);

        // for now, we do not add these buttons
        //var buttonUp = document.createElement("div");
        //var buttonDown = document.createElement("div");
        //inputTextNumber.append(buttonUp);
        //inputTextNumber.append(buttonDown);

        var minAttr = amxNode.getAttribute("minimum");
        if (minAttr != null && !isNaN(minAttr))
        {
          slider.setAttribute("data-min", minAttr);
          amxNode._min = minAttr * 1;
        }
        else
        {
          slider.setAttribute("data-min", 0);
          amxNode._min = 0;
        }

        var maxAttr = amxNode.getAttribute("maximum");
        if (maxAttr && !isNaN(maxAttr))
        {
          slider.setAttribute("data-max", maxAttr);
          amxNode._max = maxAttr * 1;
        }
        else
        {
          slider.setAttribute("data-max", 100);
          amxNode._max = 100;
        }

        var stepSizeAttr = amxNode.getAttribute("stepSize");
        if (stepSizeAttr != null)
        {
          slider.setAttribute("step", stepSizeAttr);
          amxNode._step = stepSizeAttr;
        }
        else
        {
          slider.setAttribute("step", 1);
          amxNode._step = 1;
        }

        var valueAttr = amxNode.getAttribute("value");
        if (valueAttr !== undefined)
        {
          slider.setAttribute("data-value", valueAttr);
          amxNode._currentValue = valueAttr * 1;
        }

        if (disable)
        {
          adf.mf.internal.amx.addCSSClassName(domNode, "amx-disabled");
          var disable = document.createElement("div");
          disable.className = "disable";
          field.fieldValue.appendChild(disable);
        }

        // calls applyRequiredMarker in amx-core.js to determine and implement required/showRequired style
        adf.mf.api.amx.applyRequiredMarker(amxNode, field);

        /* for now, we do not have the .btn
        $(inputTextNumber).delegate(".btn","click",function()
        {
          var $btn = $(this);
          var p = $btn.hasClass("up") ? 1 : -1;
          var value = amxNode._currentValue + p * amxNode._step;
          setValue($valve,value);
        });
        */

        /* good one, but for now, let's not have keyboard support
        $(input).bind("keyup",function(e)
        {
          var value = $input.val() * 1;
          if (!isNaN(value))
          {
            setValue($valve,value);
          }
        });
        */

        if (!disable && !field.isReadOnly)
        {
          var $slider = $(slider); // TODO make non-jq
          var $node = $(domNode); // TODO make non-jq
          $slider.tap(function(e)
          {
            var pageX;
            if (e.pageX != undefined)
            {
              pageX = e.pageX;
            }
            else
            {
              var oe = e.originalEvent;
              if (oe.touches && oe.touches.length > 0)
              {
                pageX = oe.touches[0].pageX;
              }
              // on 'touchend' oe.touches is empty, need to check oe.changedTouches
              else if (oe.changedTouches && oe.changedTouches.length > 0)
              {
                pageX = oe.changedTouches[0].pageX;
              }
              else
              {
                return;
              }
            }
            var startX = adf.mf.internal.amx.getElementLeft(slider);
            var deltaX = pageX - startX;
            var tapOffsetWithinSlider = deltaX / slider.offsetWidth;
            if (document.documentElement.dir == "rtl")
              tapOffsetWithinSlider = 1 - tapOffsetWithinSlider; // inverted
            var value = tapOffsetWithinSlider * (amxNode._max - amxNode._min) + amxNode._min;
            amxNode["_oldValue"] = amxNode._currentValue;
            setValue(valve_bg, value);
            // set the amxNode value so that it stays in sync
            amxNode.setAttributeResolvedValue("value", amxNode._currentValue);
            var vce = new amx.ValueChangeEvent(amxNode._oldValue, amxNode._currentValue);
            amx.processAmxEvent(amxNode,"valueChange","value",amxNode._currentValue, vce);
          });

          $slider.drag(".valve-background",
          {
            start: function(event,dragExtra)
            {
              event.preventDefault();
              event.stopPropagation();
              dragExtra.preventDefault = true;
              dragExtra.stopPropagation = true;
              amxNode["_oldValue"] = amxNode._currentValue;
            },
            drag: function(event,dragExtra)
            {
              event.preventDefault();
              event.stopPropagation();
              dragExtra.preventDefault = true;
              dragExtra.stopPropagation = true;
              var isRtl = (document.documentElement.dir == "rtl");
              var start = parseInt(isRtl ? valve_bg.style.right : valve_bg.style.left, 10);
              var offset = valve_bg.offsetWidth / 2;
              start = start + (isRtl ? -dragExtra.deltaPageX : dragExtra.deltaPageX);
              var value;
              if (start < -offset)
              {
                start = -offset;
                value = amxNode._min;
              }
              else if (start > slider.offsetWidth - offset)
              {
                start = slider.offsetWidth - offset;
                value = amxNode._max;
              }
              // Checking to see if the value is not a number, set it to the min-value in that case
              else
              {
                if (isNaN(value))
                {
                  value = amxNode._min;
                }
                value = (start + offset) / slider.offsetWidth * (amxNode._max - amxNode._min) + amxNode._min;
                value = Math.round(value / amxNode._step) * amxNode._step;
              }
              if (isRtl)
                valve_bg.style.right = start+"px";
              else
                valve_bg.style.left = start+"px";
              selected.style.width = (start+offset)+"px";
              slider.setAttribute("data-value", value);
              if (amxNode._currentValue != value)
              {
                amxNode._currentValue = value;
              }
            },
            end: function(event,dragExtra)
            {
              event.preventDefault();
              event.stopPropagation();
              dragExtra.preventDefault = true;
              dragExtra.stopPropagation = true;
              var valve_bg = this;
              setValue(valve_bg, amxNode._currentValue);
              // set the amxNode value so that it stays in sync
              amxNode.setAttributeResolvedValue("value", amxNode._currentValue);
              var vce = new amx.ValueChangeEvent(amxNode._oldValue, amxNode._currentValue);
              amx.processAmxEvent(amxNode,"valueChange","value",amxNode._currentValue, vce);
              amxNode["_oldValue"] = amxNode._currentValue;
            }
          });
        }

        function setValue(valve_bg, value, width)
        {
          if (!width)
          {
            width = slider.offsetWidth;
          }
          // Checking to see if the value is not a number, set it to the min-value in that case
          if (isNaN(value))
          {
            value = amxNode._min;
          }
          value = Math.round(value / amxNode._step) * amxNode._step;

          if (value <= amxNode._min)
          {
            value = amxNode._min;
          }
          if (value >= amxNode._max)
          {
            value = amxNode._max;
          }
          var offset = valve_bg.offsetWidth / 2;
          var start = (value - amxNode._min)/(amxNode._max - amxNode._min) * width;
          if (document.documentElement.dir == "rtl")
            valve_bg.style.right = (start - offset)+"px";
          else
            valve_bg.style.left = (start - offset)+"px";
          selected.style.width = start+"px";
          slider.setAttribute("data-value", value);
          if (amxNode._currentValue != value)
          {
            amxNode._currentValue = value;
          }
        }
        amxNode.setValue = setValue;
        return domNode;
      },

      init: function(domNode, amxNode)
      {
        var amxNodeId = amxNode.getId();
        var slider = document.getElementById(amxNodeId + "::slider");
        var valveBg = document.getElementById(amxNodeId + "::valveBg");

        if (slider != null) // it will be null if not connected to the DOM
        {
          // Set the slider's initial position:
          amxNode.setValue(valveBg, slider.getAttribute("data-value") * 1, slider.offsetWidth);
        }

        // Listen if someone resizes the window:
        $(window).resize(amxNode, this._handleResize); // TODO remove jQuery on this
  
        // Listen if someone explicitly calls .resize() on my root element:
        $(domNode).resize(amxNode, this._handleResize); // TODO remove jQuery on this
      },

      _handleResize: function(domEvent)
      {
        var amxNode = domEvent.data;
        var amxNodeId = amxNode.getId();
        var slider = document.getElementById(amxNodeId + "::slider");
        var valveBg = document.getElementById(amxNodeId + "::valveBg");

        // Ensure element belongs to the document body:
        if (adf.mf.internal.amx.isAncestor(document.body, slider))
        {
          // Set the slider's position within the new geometry:
          amxNode.setValue(valveBg, slider.getAttribute("data-value") * 1, slider.offsetWidth);
        }
      }
    }

  }; // /var amxRenderers

  // add this renderer
  amx.registerRenderers("amx",amxRenderers);

})();

