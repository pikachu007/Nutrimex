/* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. */
/* ------------------------------------------------------ */
/* ------------------- amx-inputDate.js ----------------- */
/* ------------------------------------------------------ */ 
(function ()
{
  var amxRenderers = {
    inputDate: {
    
      createChildrenNodes: function (amxNode)
      {
        // Call the register input value during node creation as it requires the EL context
        // to be setup and rendering is not performed in EL context (expects all EL to already
        // be resolved during rendering)
        amx.registerInputValue(amxNode, "value");

        // Return false to let the framework create the children
        return false;
      },

      create: function (amxNode)
      {
        var month = new Array(12);
        
        if (adf.mf.environment.profile.dtMode == false)
        {
          month[0] = adf.mf.resource.getInfoString("AMXInfoBundle", "amx_inputDate_LABEL_JANUARY_ABBREVIATION");
          month[1] = adf.mf.resource.getInfoString("AMXInfoBundle", "amx_inputDate_LABEL_FEBRUARY_ABBREVIATION");
          month[2] = adf.mf.resource.getInfoString("AMXInfoBundle", "amx_inputDate_LABEL_MARCH_ABBREVIATION");
          month[3] = adf.mf.resource.getInfoString("AMXInfoBundle", "amx_inputDate_LABEL_APRIL_ABBREVIATION");
          month[4] = adf.mf.resource.getInfoString("AMXInfoBundle", "amx_inputDate_LABEL_MAY_ABBREVIATION");
          month[5] = adf.mf.resource.getInfoString("AMXInfoBundle", "amx_inputDate_LABEL_JUNE_ABBREVIATION");
          month[6] = adf.mf.resource.getInfoString("AMXInfoBundle", "amx_inputDate_LABEL_JULY_ABBREVIATION");
          month[7] = adf.mf.resource.getInfoString("AMXInfoBundle", "amx_inputDate_LABEL_AUGUST_ABBREVIATION");
          month[8] = adf.mf.resource.getInfoString("AMXInfoBundle", "amx_inputDate_LABEL_SEPTEMBER_ABBREVIATION");
          month[9] = adf.mf.resource.getInfoString("AMXInfoBundle", "amx_inputDate_LABEL_OCTOBER_ABBREVIATION");
          month[10] = adf.mf.resource.getInfoString("AMXInfoBundle", "amx_inputDate_LABEL_NOVEMBER_ABBREVIATION");
          month[11] = adf.mf.resource.getInfoString("AMXInfoBundle", "amx_inputDate_LABEL_DECEMBER_ABBREVIATION");
        }
        else
        {
          month[0] = "JAN";
          month[1] = "FEB";
          month[2] = "MAR";
          month[3] = "APR";
          month[4] = "MAY";
          month[5] = "JUN";
          month[6] = "JUL";
          month[7] = "AUG";
          month[8] = "SEP";
          month[9] = "OCT";
          month[10] = "NOV";
          month[11] = "DEC"
        }
       
        var day = [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17',
            '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31' ];

        var makeTwoDigits = function(value)
        {
          if (value < 10)
          {
            return "0" + value;  
          }
          return value;
        };
            
        // Capitalize the first letter of the month as per UX Spec
        var capitalizeFirstLetter = function (monthText)
        {
          return monthText.slice(0,1).toUpperCase() + monthText.slice(1).toLowerCase();
        };

        //Retreive the inputDate value from amx object, in this case Date
        var getFormattedDateText = function (initialMonth, initialDay, initialYear)
        {
          //Format the Month with First upper case and reat lower case as per the UX
          return capitalizeFirstLetter(month[initialMonth]) + ' ' + initialDay + ',' + ' ' + initialYear;
        };

        //Retreive the inputDate value from amx object, in this case Time
        var getFormattedTimeText = function (initialHour, initialMinutes)
        {
          initialMinutes = makeTwoDigits(initialMinutes);

          if (initialHour == 0)
          {
            return "12:" + initialMinutes + " AM";
          }
          else if (initialHour < 12)
          {
            return initialHour + ":" + initialMinutes + " AM";
          }
          else if (initialHour == 12)
          {
            return "12:" + initialMinutes + " PM";
          }

          return (initialHour-12) + ":" + initialMinutes + " PM";
        };

        var getFormattedDateTimeText = function (formatType, dateObject)
        {
          // formatType value is 'undefined' for the case where formatType is not declared in amx, thus default type is 'date'
          if (formatType == "datetime")
          {
            var initialDateText = getFormattedDateText(dateObject.getMonth(), dateObject.getDate(), dateObject.getFullYear());
            var initialTimeText = getFormattedTimeText(dateObject.getHours(), dateObject.getMinutes());
            return initialDateText + ' ' + initialTimeText;
          }
          else if (formatType == "time")
          {
            return getFormattedTimeText(dateObject.getHours(), dateObject.getMinutes());
          }
        
          return getFormattedDateText(dateObject.getMonth(), dateObject.getDate(), dateObject.getFullYear());
        };

        // MDO - converters support is deprecated; remove any converters added by old apps
        amxNode.setConverter(null);
        var field = amx.createField(amxNode); // generate the fieldRoot/fieldLabel/fieldValue structure
        var rootDomNode = field.fieldRoot;
        var dateObject;
        
        var value = amxNode.getAttribute("value");
        if (value == null)
        {
          dateObject = {};
          dateObject[".null"] = true;
          value = "";
        }
        else
        {
          // call our date parser that attempts both native and ISO-8601 parsing
          var dateParse = adf.mf.internal.converters.dateParser.parse(value);

          if (!isNaN(dateParse))
          {
            dateObject = new Date(dateParse);
          }
        }

        var inputType = amxNode.getAttribute("inputType");

        // Check to Extract the date, time and datetime values only when DT Mode is false
        if (adf.mf.environment.profile.dtMode == false)
        {
          if (inputType === "time")
          {
            // only extract the time if the value is not null
            if (amxNode.getAttribute("value") != null)
            {
              value = adf.mf.internal.amx.extractTimeFromDateObject(dateObject);
            }
          }
          else if (inputType === "datetime")
          {
            value = amxNode.getAttribute("value");
          }
          else
          {
            inputType = "date";
            // only extract the date if the value is not null
            if (amxNode.getAttribute("value") != null)
            {
              value = adf.mf.internal.amx.extractDateFromDateObject(dateObject);
            }
          }
        }
        else
        {
          // we are in DT mode, so handle the inputType differently based on iOS/Android
          if (adf.mf.internal.amx.agent["type"] == "Android")
          {
            if (inputType !== "time" && inputType !== "datetime")
            {
              // make sure invalid/unset values get defaulted to "date"
              inputType = "date";
            }
          }
          else
          {
            // on iOS, we must force the input type to be text
            // in order for the displaying of the EL to work
            inputType = "text";
          }
        }
        // since readOnly is not required and it defaults to false if unspecified,
        // then we must use the amx.isValueTrue() helper method. This will return
        // false unless the attribute is explicitly set to true
        var readOnly = amx.isValueTrue(amxNode.getAttribute("readOnly"));
        // if readOnly is set to true
        if (readOnly == true)
        {
          var dateLabel = document.createElement("span");
          field.fieldValue.appendChild(dateLabel);
          dateLabel.textContent = getFormattedDateTimeText(inputType, dateObject);
          dateLabel.setAttribute("readOnly", readOnly);
          // Adding WAI-ARIA Attribute for the readonly state
          dateLabel.setAttribute("aria-readonly", readOnly);
          adf.mf.internal.amx._setNonPrimitiveElementData(dateLabel, "value", dateObject);
        }
        else
        {
          // Begin Android inputDate Picker creation and rendering
          if (adf.mf.internal.amx.agent["type"] == "Android")
          {
            // The opacity screen for the date picker component
            var overlayElement = document.createElement("div");
            var $overlayElement = $(overlayElement);
            // The markup is created here for the date picker
            var dateTrigger = document.createElement("div");
            dateTrigger.setAttribute("role", "button");
            dateTrigger.setAttribute("tabindex", "0");
            dateTrigger.setAttribute("class", "amx-inputDate-trigger-dateTime");
            var dateTriggerSpan = document.createElement("span");
            dateTriggerSpan.setAttribute("class", "amx-inputDate-text");
            dateTriggerSpan.setAttribute("id", "amx-inputDate-trigger-text");
            var dateTriggerIconWrapper = document.createElement("div");
            dateTriggerIconWrapper.setAttribute("class", "amx-inputDate-triggerIconStyleWrapper");
            var dateTriggerIcon = document.createElement("div");
            dateTriggerIcon.setAttribute("class", "amx-inputDate-triggerIconStyle");
            dateTrigger.appendChild(dateTriggerSpan);
            dateTrigger.appendChild(dateTriggerIconWrapper);
            dateTrigger.appendChild(dateTriggerIcon);
            var $dateTrigger = $(dateTrigger);
            field.fieldValue.appendChild(dateTrigger);
            var dateTimePicker = document.createElement("div");
            var $dateTimePicker = $(dateTimePicker);
            dateTimePicker.setAttribute("class", "amx-inputDate-picker-wrapper");
            dateTimePicker.setAttribute("id", "amx-inputDate-picker-wrapper");


            // Creation of Date Picker including the Tabs for Date/Time and Table for values and inc/dec buttons and appended to the DOM
            var dateTabDiv = document.createElement("div");
            dateTabDiv.setAttribute("role", "button");
            dateTabDiv.setAttribute("tabindex", "0");
            dateTabDiv.setAttribute("class", "amx-inputDate-picker-dateTab-selected");
            var dateTabSpan = document.createElement("span");
            dateTabSpan.setAttribute("class", "amx-inputDate-picker-dateTab-text");

            dateTabDiv.appendChild(dateTabSpan);
            var timeTabDiv = document.createElement("div");
            timeTabDiv.setAttribute("role", "button");
            timeTabDiv.setAttribute("tabindex", "0");
            timeTabDiv.setAttribute("class", "amx-inputDate-picker-timeTab");
            var timeTabSpan = document.createElement("span");
            timeTabSpan.setAttribute("class", "amx-inputDate-picker-timeTab-text");

            timeTabDiv.appendChild(timeTabSpan);
            dateTimePicker.appendChild(dateTabDiv);
            dateTimePicker.appendChild(timeTabDiv);
            var dateTimePickerTable = document.createElement("table");
            dateTimePickerTable.setAttribute("class", "amx-inputDate-datePicker-inner-container");
            var incDateTimeFRow = dateTimePickerTable.insertRow(0);
            var incDateTimeFRowFCol = incDateTimeFRow.insertCell(0);
            var $incDateTimeFRowFCol = $(incDateTimeFRowFCol);
            var incDateTimeFRowSCol = incDateTimeFRow.insertCell(1);
            var $incDateTimeFRowSCol = $(incDateTimeFRowSCol);
            var incDateTimeFRowTCol = incDateTimeFRow.insertCell(2);
            var $incDateTimeFRowTCol = $(incDateTimeFRowTCol);
            incDateTimeFRowFCol.setAttribute("class", "amx-inputDate-datePicker-firstColumn-increment amx-inputDate-incrementButton amx-inputDate-datePicker-col");
            incDateTimeFRowSCol.setAttribute("class", "amx-inputDate-datePicker-secondColumn-increment amx-inputDate-incrementButton amx-inputDate-datePicker-col");
            incDateTimeFRowTCol.setAttribute("class", "amx-inputDate-datePicker-thirdColumn-increment amx-inputDate-incrementButton amx-inputDate-datePicker-col amx-inputDate-datePicker-lastCol");
            var incDateTimeSRow = dateTimePickerTable.insertRow(1);
            var incDateTimeSRowFCol = incDateTimeSRow.insertCell(0);
            var incDateTimeSRowSCol = incDateTimeSRow.insertCell(1);
            var incDateTimeSRowTCol = incDateTimeSRow.insertCell(2);
            incDateTimeSRowFCol.setAttribute("class", "amx-inputDate-datePicker-month-text amx-inputDate-datePicker-col");
            incDateTimeSRowSCol.setAttribute("class", "amx-inputDate-datePicker-day-text amx-inputDate-datePicker-col");
            incDateTimeSRowTCol.setAttribute("class", "amx-inputDate-datePicker-year-text amx-inputDate-datePicker-col amx-inputDate-datePicker-lastCol");
            var decDateTimeTRow = dateTimePickerTable.insertRow(2);
            var decDateTimeTRowFCol = decDateTimeTRow.insertCell(0);
            var $decDateTimeTRowFCol = $(decDateTimeTRowFCol);
            var decDateTimeTRowSCol = decDateTimeTRow.insertCell(1);
            var $decDateTimeTRowSCol = $(decDateTimeTRowSCol);
            var decDateTimeTRowTCol = decDateTimeTRow.insertCell(2);
            var $decDateTimeTRowTCol = $(decDateTimeTRowTCol);
            decDateTimeTRowFCol.setAttribute("class", "amx-inputDate-datePicker-firstColumn-decrement amx-inputDate-decrementButton amx-inputDate-datePicker-col");
            decDateTimeTRowSCol.setAttribute("class", "amx-inputDate-datePicker-secondColumn-decrement amx-inputDate-decrementButton amx-inputDate-datePicker-col");
            decDateTimeTRowTCol.setAttribute("class", "amx-inputDate-datePicker-thirdColumn-decrement amx-inputDate-decrementButton amx-inputDate-datePicker-col amx-inputDate-datePicker-lastCol");

            dateTimePicker.appendChild(dateTimePickerTable);
            //Creation of set and cancel buttons and appended to the DOM
            var dateTimeSetBtn = document.createElement("div");
            dateTimeSetBtn.setAttribute("role", "button");
            dateTimeSetBtn.setAttribute("tabindex", "0");
            dateTimeSetBtn.setAttribute("class", "amx-inputDate-picker-setButton");
            var dateTimeSetBtnSpan = document.createElement("span");
            dateTimeSetBtnSpan.setAttribute("class", "amx-inputDate-picker-button-text");
            dateTimeSetBtnSpan.textContent = "Set";
            dateTimeSetBtn.appendChild(dateTimeSetBtnSpan);
            dateTimePicker.appendChild(dateTimeSetBtn);

            var dateTimeCancelBtn = document.createElement("div");
            dateTimeCancelBtn.setAttribute("role", "button");
            dateTimeCancelBtn.setAttribute("tabindex", "0");
            dateTimeCancelBtn.setAttribute("class", "amx-inputDate-picker-cancelButton");
            var dateTimeCancelBtnSpan = document.createElement("span");
            dateTimeCancelBtnSpan.setAttribute("class", "amx-inputDate-picker-button-text");
            dateTimeCancelBtnSpan.textContent = "Cancel";
            var $dateTimeSetBtn = $(dateTimeSetBtn);
            var $dateTimeCancelBtn = $(dateTimeCancelBtn);

            dateTimeCancelBtn.appendChild(dateTimeCancelBtnSpan);
            dateTimePicker.appendChild(dateTimeCancelBtn);
            var selectedFirstValue = document.getElementsByClassName('amx-inputDate-datePicker-month-text');
            var selectedSecondValue = document.getElementsByClassName('amx-inputDate-datePicker-day-text');
            var selectedThirdValue = document.getElementsByClassName('amx-inputDate-datePicker-year-text');

            var $timePickerTab = $(timeTabDiv);
            var $datePickerTab = $(dateTabDiv);

            var inputType = amxNode.getAttribute("inputType");
            // since disabled is not required and it defaults to false if unspecified,
            // then we must use the amx.isValueTrue() helper method. This will return
            // false unless the attribute is explicitly set to true
            var disabledInputType = amx.isValueTrue(amxNode.getAttribute("disabled"));
            var androidDateObject = new Date();
            var androidInputDateValue = amxNode.getAttribute("value");

            /* Utility Functions */
            // Calculate days in a given month (also checks for leap year)
            var daysInMonth = function (selectedThirdValue, selectedFirstValue)
            {
              var thisMonth = month.indexOf(selectedFirstValue) + 1;
              daysThisMonth = new Date(selectedThirdValue, thisMonth, 0).getDate();
              daysThisMonth = parseInt(daysThisMonth, 10);
              return daysThisMonth;
            };
            var convertAmPmToMil = function (timeStr)
            {
              var meridian = timeStr.substr(timeStr.length - 2).toLowerCase();
              var milHours = timeStr.substring(0, timeStr.indexOf(':'));
              var milMinutes = timeStr.substring(timeStr.indexOf(':') + 1, timeStr.indexOf(' '));
              if (meridian == 'pm')
              {
                // 12PM is 12 on the 24-hour clock so no need to convert in that case
                if (milHours != '12')
                {
                  milHours = parseInt(milHours, 10) + 12;
                }
              }
              else if (meridian == 'am')
              {
                // 12AM is 0 on the 24-hour clock
                if (milHours == '12')
                {
                  milHours = '00';
                }
              }
              return [milHours, milMinutes];
            };
            // Populates the date or time or datetime in the picker depending upon the inputType
            var toggleDateTimeTab = function (div, inputType)
            {
              var isDateSet = false;
              // Populate the time
              var populateTime = function ()
              {
                // If there is no time chosen, reset to current time
                if (dateTriggerSpan.textContent == initialTimeText || dateTriggerSpan.textContent == "" || dateTriggerSpan.textContent == initialDateTimeText || isDateTimeSet == true)
                {
                  incDateTimeSRowFCol.textContent = presentHour;
                  incDateTimeSRowSCol.textContent = presentMinutes;
                  // Set AM/PM accordingly
                  if (milHour >= 0 && milHour < 12)
                  {
                    incDateTimeSRowTCol.textContent = "AM";
                  }
                  else if (milHour >= 12)
                  {
                    incDateTimeSRowTCol.textContent = "PM";
                  }
                }
                else
                {
                  // If the time was set before, just show that again
                  incDateTimeSRowFCol.textContent = selectedFirstValue[0].textContent;
                  incDateTimeSRowSCol.textContent = selectedSecondValue[0].textContent;
                  // Set AM/PM accordingly
                  if (milHour >= 0 && milHour < 12)
                  {
                    incDateTimeSRowTCol.textContent = "AM";
                  }
                  else if (milHour >= 12)
                  {
                    incDateTimeSRowTCol.textContent = "PM";
                  }
                }
                //Display the time text on the picker
                timeTabSpan.textContent = incDateTimeSRowFCol.textContent + ':' + incDateTimeSRowSCol.textContent + ' ' + incDateTimeSRowTCol.textContent;

                dateTimePicker.setAttribute("data-time-hour", incDateTimeSRowFCol.textContent);
                dateTimePicker.setAttribute("data-time-min", incDateTimeSRowSCol.textContent);
                dateTimePicker.setAttribute("data-time-ampm", incDateTimeSRowTCol.textContent);
              };
              // Populate the date
              var populateDate = function ()
              {
                // if there is no date chosen, reset to current date
                if (dateTriggerSpan.textContent == initialDateText || dateTriggerSpan.textContent == initialDateTimeText || dateTriggerSpan.textContent == "" || isDateTimeSet == true)
                {
                  incDateTimeSRowFCol.textContent = month[androidDateObject.getMonth()];
                  incDateTimeSRowSCol.textContent = presentDay;
                  incDateTimeSRowTCol.textContent = presentYear;
                }
                // Populate the picker with current date and time when it pops up with the date that was chosen before
                else
                {
                  incDateTimeSRowFCol.textContent = selectedFirstValue[0].textContent;
                  incDateTimeSRowSCol.textContent = selectedSecondValue[0].textContent;
                  incDateTimeSRowTCol.textContent = selectedThirdValue[0].textContent;
                }
                //Display the date text on the picker
                dateTabSpan.textContent = capitalizeFirstLetter(incDateTimeSRowFCol.textContent) + ' ' + incDateTimeSRowSCol.textContent + ',' + ' ' + incDateTimeSRowTCol.textContent;

                dateTimePicker.setAttribute("data-date-month", capitalizeFirstLetter(incDateTimeSRowFCol.textContent));
                dateTimePicker.setAttribute("data-date-day", incDateTimeSRowSCol.textContent);
                dateTimePicker.setAttribute("data-date-year", incDateTimeSRowTCol.textContent);
              };

              //Check for inputTypes: time, date or dateTime and display the picker accordingly
              if (inputType == "time")
              {
                dateTimePicker.setAttribute("class", "amx-inputDate-picker-wrapper amx-inputDate-picker-timeOnly");
                div.className = "amx-inputDate-picker-time-header";
                dateTabDiv.style.display = "none";
                populateTime();
              }
              // inputType value is 'undefined' for the case where inputType is not declared in amx, thus default type is 'date'
              else if (inputType == "date" ||  inputType == null)
              {
                dateTimePicker.setAttribute("class", "amx-inputDate-picker-wrapper amx-inputDate-picker-dateOnly");
                div.className = "amx-inputDate-picker-date-header";
                timeTabDiv.style.display = "none";
                populateDate();
              }
              else if (inputType == "datetime")
              {
                dateTimePicker.setAttribute("class", "amx-inputDate-picker-wrapper");
                if (isDateTimeSet == false)
                {
                  populateTime();
                  populateDate();
                }
                timeTabDiv.style.display = "block";
                dateTimePicker.setAttribute("class", "amx-inputDate-picker-wrapper");
                timeTabDiv.className = "amx-inputDate-picker-timeTab";
                dateTabDiv.className = "amx-inputDate-picker-dateTab-selected";

                $timePickerTab.tap(function ()
                {
                  populateTime();
                  dateTabDiv.className = "amx-inputDate-picker-dateTab";
                  timeTabDiv.className = "amx-inputDate-picker-timeTab-selected";
                }, false);

                $datePickerTab.tap(function ()
                {
                  populateDate();
                  dateTabDiv.className = "amx-inputDate-picker-dateTab-selected";
                  timeTabDiv.className = "amx-inputDate-picker-timeTab";
                }, false);
              }
            };
            /* End of Utility functions () */

            // If the value is already provided for inputDate, update the UI for all three (date, time and datetime) and also check for readOnly attribute
            if (typeof androidInputDateValue !== "undefined")
            {
              // call our date parser that attempts both native and ISO-8601 parsing
              var dateParse = adf.mf.internal.converters.dateParser.parse(androidInputDateValue);

              if (!isNaN(dateParse))
              {
                androidDateObject = new Date(dateParse);
              }

              var oldAndroidDateValue = androidDateObject.toISOString();
              var initialDateText, initialTimeText, initialDateTimeText, readOnlyInputText;
              var readOnlyInputType = amxNode.getAttribute("readOnly");

              // inputType value is 'undefined' for the case where inputType is not declared in amx, thus default type is 'date'
              if (inputType == "date" ||  inputType == null)
              {
                initialDateText = getFormattedDateText(androidDateObject.getMonth(), androidDateObject.getDate(), androidDateObject.getFullYear());
                dateTriggerSpan.textContent = initialDateText;
                if (readOnlyInputType == true) readOnlyInputText = initialDateText;
              }
              else if (inputType == "time")
              {
                initialTimeText = getFormattedTimeText(androidDateObject.getHours(), androidDateObject.getMinutes());
                dateTriggerSpan.textContent = initialTimeText;
                if (readOnlyInputType == true) readOnlyInputText = initialTimeText;
              }
              else if (inputType == "datetime")
              {
                initialDateText = getFormattedDateText(androidDateObject.getMonth(), androidDateObject.getDate(), androidDateObject.getFullYear());
                initialTimeText = getFormattedTimeText(androidDateObject.getHours(), androidDateObject.getMinutes());
                initialDateTimeText = initialDateText + ' ' + initialTimeText;
                dateTriggerSpan.textContent = initialDateTimeText;
                if (readOnlyInputType == true) readOnlyInputText = initialDateTimeText;
              }
            }
            // Check for readonly and DT Mode
            if (readOnlyInputType == true)
            {
              $dateTrigger.remove();
              var dateTriggerSpanReadOnly = document.createElement("span");
              adf.mf.internal.amx.addCSSClassName(dateTriggerSpanReadOnly, "amx-inputDate-readOnly");
              // We need to show the value just as it was entered in the PI for DT Mode
              if (adf.mf.environment.profile.dtMode != false)
              {
                dateTriggerSpanReadOnly.textContent = value;
              }
              else
              {
                dateTriggerSpanReadOnly.textContent = readOnlyInputText;
              }
            
              field.fieldValue.appendChild(dateTriggerSpanReadOnly);
            }
           

            var curFirstValue, curSecondValue, curThirdValue;
            var isDateTimeSet = false; // Boolean to check and avoid duplicate function call for setting datetime
            var presentMonth = androidDateObject.getMonth(); // In Integer form
            var presentDay = androidDateObject.getDate(); // In Integer Form
            var presentYear = androidDateObject.getFullYear();
            var presentMinutes = makeTwoDigits(androidDateObject.getMinutes());
            var milHour = androidDateObject.getHours(); // In 24 hours time
            var presentHour = milHour;
            if (presentHour == 0)
            {
              presentHour = 12;
            }
            if (presentHour > 12)
            {
              presentHour = presentHour - 12;
            }
            // if disabled is false for Android then we don't inject the Date Picker in the DOM and don't invoke the tap event
            if (disabledInputType == false)
            {
              // Rendering of inputDate Picker and all the interactions are initialted inside this function
              $dateTrigger.tap(function ()
              {
                overlayElement.setAttribute("class", "amx-inputDate-picker-modalOverlay");
                document.body.appendChild(overlayElement);
                document.body.appendChild(dateTimePicker);

                toggleDateTimeTab(dateTabDiv, inputType);
                toggleDateTimeTab(timeTabDiv, inputType);

                // Set the value : Set button anonymous function where we attach event handler and update date/time/dateTime
                $dateTimeSetBtn.tap(function ()
                {
                  var newAndroidDate, newAndroidTime, vceAndroid, newAndroidDateValue, updatedTime, formattedTime, updatedHour, updatedMin, timeTabText, latestDateValue, latestTimeValue;
                  curFirstValue = selectedFirstValue[0].textContent;
                  // Format the month with First uppercase and rest lower case letters
                  curFirstValue = capitalizeFirstLetter(selectedFirstValue[0].textContent);
                  curSecondValue = selectedSecondValue[0].textContent;
                  curThirdValue = selectedThirdValue[0].textContent;

                  // Formatting Date and Time text by checking for 'M' as in AM/PM for Time otherwise it's a Date also updatind and calling processAmxEvent()
                  if (inputType == "datetime")
                  {
                    // Formatted current values of Date and Time that are displayed inside the picker
                    latestDateValue = capitalizeFirstLetter(dateTimePicker.getAttribute("data-date-month")) + " " + dateTimePicker.getAttribute("data-date-day") + ", " + dateTimePicker.getAttribute("data-date-year");
                    latestTimeValue = dateTimePicker.getAttribute("data-time-hour") + ":" + dateTimePicker.getAttribute("data-time-min") + " " + dateTimePicker.getAttribute("data-time-ampm");
      
                    //Updating the new values in the tabs
                    dateTabSpan.textContent = latestDateValue;
                    timeTabSpan.textContent = latestTimeValue;
                
                    androidDateObject = new Date(latestDateValue);
                    // format the date manually to avoid timezone issues in YYYY-MM-DD format
                    // Date.getMonth() is 0-based, so we need to add 1 to the returned value
                    formattedDate = androidDateObject.getFullYear() + "-" + makeTwoDigits(androidDateObject.getMonth() + 1) + "-" + makeTwoDigits(androidDateObject.getDate());
                    // Calling adf.mf.internal.amx.updateDate() to update the dateObject as the date is changed on any given date component in the page
                    adf.mf.internal.amx.updateDate(androidDateObject, formattedDate);
                
                    // In order to set Updated Hour and Min, we need to change the hour to 24 hour format and they should be type number
                    updatedTime = convertAmPmToMil(latestTimeValue);
                    // Adding leading zero to single digit min and hr for formattting purpose
                    updatedHour = makeTwoDigits(parseInt(updatedTime[0], 10));
                    updatedMin = makeTwoDigits(parseInt(updatedTime[1], 10));

                    formattedTime = updatedHour + ":" + updatedMin;
                    androidDateObject.setHours(updatedHour);
                    androidDateObject.setMinutes(updatedMin);
                
                    newAndroidTime = new Date(androidDateObject.getTime());
                    newAndroidDateValue = newAndroidTime.toISOString();
                    adf.mf.internal.amx.updateTime(newAndroidTime, formattedTime);

                    // Displaying the formatted current date and time on the trigger
                    dateTriggerSpan.textContent = latestDateValue + ' ' + latestTimeValue;

                    //Here we call the amx.processAmxEvent so the chanages are reflected
                    vceAndroid = new amx.ValueChangeEvent(oldAndroidDateValue, newAndroidDateValue);
                    amx.processAmxEvent($(rootDomNode), "valueChange", "value", newAndroidDateValue, vceAndroid);
                    //Boolean to determine is dateTime is set or not
                    isDateTimeSet = true;
                  }
                  else if (curThirdValue[1] !== "M") //check for inputType == date
                  {
                    dateTabSpan.textContent = curFirstValue + ' ' + curSecondValue + ',' + ' ' + curThirdValue;
                    dateTriggerSpan.textContent = dateTabSpan.textContent;
                    //Updates the Date for the amx object and also calls the amx.processAmxEvent so the chanages are reflected
                    androidDateObject = new Date(dateTabSpan.textContent);
                    newAndroidDateValue = androidDateObject.toISOString();
                    adf.mf.internal.amx.updateDate(androidDateObject, androidInputDateValue);
                    vceAndroid = new amx.ValueChangeEvent(oldAndroidDateValue, newAndroidDateValue);
                    amx.processAmxEvent($(rootDomNode), "valueChange", "value", newAndroidDateValue, vceAndroid);
                  }
                  else
                  {
                    timeTabSpan.textContent = curFirstValue + ':' + curSecondValue + ' ' + curThirdValue;
                    timeTabText = timeTabSpan.textContent;
                    dateTriggerSpan.textContent = timeTabText;
                    //Updates the Time and the androidDateObject with new HH and MM in correct format and also calls the amx.processAmxEvent so the chanages are reflected
                    updatedTime = convertAmPmToMil(timeTabText);
                    androidDateObject.setHours(updatedTime[0]);
                    androidDateObject.setMinutes(updatedTime[1]);

                    newAndroidTime = new Date(androidDateObject);
                    newAndroidDateValue = newAndroidTime.toISOString();
                    adf.mf.internal.amx.updateTime(newAndroidTime, androidInputDateValue);
                    vceAndroid = new amx.ValueChangeEvent(oldAndroidDateValue, newAndroidDateValue);
                    amx.processAmxEvent($(rootDomNode), "valueChange", "value", newAndroidDateValue, vceAndroid);
                  }
                  $dateTimePicker.remove();
                  $overlayElement.remove();
                }, false); /* End of Set () */

                // Cancel the value - Cancel Button anonymous function and also attached the event handler, clears the date/time fields and removes the picker from screen
                $dateTimeCancelBtn.tap(function ()
                {
                  $dateTimePicker.remove();
                  $overlayElement.remove();
                }, false); /* End of Cancel () */



                // jQuery .bind event is bound to the 'touchstart' and 'touchend' events and has a callback to increment//decrement the date and time values and the background image
                // Handling MONTH & HOUR increments
                $incDateTimeFRowFCol.bind("touchstart", function (e)
                {
                  // Changes the button image to the highlighted version on touch start
                  adf.mf.internal.amx.removeCSSClassName(incDateTimeFRowFCol, "amx-inputDate-incrementButton");
                  adf.mf.internal.amx.addCSSClassName(incDateTimeFRowFCol, "amx-inputDate-incrementButton-selected");

                  curFirstValue = selectedFirstValue[0].textContent;
                  curSecondValue = selectedSecondValue[0].textContent;
                  curThirdValue = selectedThirdValue[0].textContent;

                  if (curThirdValue[1] !== "M")
                  {
                    if (curFirstValue !== month[11])
                    {
                      var nextMonth = (month.indexOf(curFirstValue)) + 1;
                      selectedFirstValue[0].textContent = month[nextMonth];
                    }
                    else if (curFirstValue == month[11])
                    {
                      nextMonth = 0; // index of the month[0] which is January
                      selectedFirstValue[0].textContent = month[nextMonth];
                    }
                    dateTimePicker.setAttribute("data-date-month", selectedFirstValue[0].textContent);
                  }
                  else
                  {
                    // Checking for AN/PM and modified JavaScript 24 hour clock to 12 hour clock
                    if (curFirstValue <= 23 && curFirstValue > 0)
                    {
                      if (curFirstValue > 11)
                      {
                        curFirstValue = curFirstValue - 12;
                      }
                      var nextHour = parseInt(curFirstValue, 10) + 1;
                      selectedFirstValue[0].textContent = nextHour;
                    }
                    else if (curFirstValue == 24)
                    {
                      curFirstValue = 1;
                      nextHour = 1;
                      selectedFirstValue[0].textContent = nextHour;
                    }
                    dateTimePicker.setAttribute("data-time-hour", selectedFirstValue[0].textContent);
                  }
                });
                // Changes the image back to normal on touchend
                $incDateTimeFRowFCol.bind("touchend", function (e)
                {
                  adf.mf.internal.amx.removeCSSClassName(incDateTimeFRowFCol, "amx-inputDate-incrementButton-selected");
                  adf.mf.internal.amx.addCSSClassName(incDateTimeFRowFCol, "amx-inputDate-incrementButton");
                });

                // Handling DAY & MINUTE increment here
                $incDateTimeFRowSCol.bind("touchstart", function (e)
                {
                  // Changes the button image to the highlighted version on touch start
                  adf.mf.internal.amx.removeCSSClassName(incDateTimeFRowSCol, "amx-inputDate-incrementButton");
                  adf.mf.internal.amx.addCSSClassName(incDateTimeFRowSCol, "amx-inputDate-incrementButton-selected");
                  curSecondValue = selectedSecondValue[0].textContent;
                  curFirstValue = selectedFirstValue[0].textContent;
                  curThirdValue = selectedThirdValue[0].textContent;

                  if (curThirdValue[1] !== "M")
                  {
                    curThirdValue = parseInt(curThirdValue, 10);
                    var daysForThisMonth = daysInMonth(curThirdValue, curFirstValue);
                    curSecondValue = parseInt(curSecondValue, 10);
                    curFirstValue = month.indexOf(curFirstValue);
                    curFirstValue = parseInt(curFirstValue, 10);
                    if (curSecondValue !== daysForThisMonth)
                    {
                      var nextDay = curSecondValue + 1;
                      selectedSecondValue[0].textContent = day[nextDay - 1];
                    }
                    else if (curSecondValue == daysForThisMonth)
                    {
                      nextDay = 0;
                      selectedSecondValue[0].textContent = day[nextDay];
                    }
                   dateTimePicker.setAttribute("data-date-day", selectedSecondValue[0].textContent);
                  }
                  else
                  {
                    curSecondValue = parseInt(curSecondValue, 10);
                    if (curSecondValue < 59 && curSecondValue >= 0)
                    {
                      var nextMin = curSecondValue + 1;
                      selectedSecondValue[0].textContent = nextMin;
                    }
                    else if (curSecondValue == 59)
                    {
                      nextMin = 0;
                      selectedSecondValue[0].textContent = nextMin;
                    }
                    dateTimePicker.setAttribute("data-time-min", selectedSecondValue[0].textContent);
                  }
                });
                // Changes the image back to normal on touchend
                $incDateTimeFRowSCol.bind("touchend", function (e)
                {
                  adf.mf.internal.amx.removeCSSClassName(incDateTimeFRowSCol, "amx-inputDate-incrementButton-selected");
                  adf.mf.internal.amx.addCSSClassName(incDateTimeFRowSCol, "amx-inputDate-incrementButton");
                });

                // Handling YEAR  increment & AM/PM toggle here
                $incDateTimeFRowTCol.bind("touchstart", function (e)
                {
                  // Changes the button image to the highlighted version on touch start
                  adf.mf.internal.amx.removeCSSClassName(incDateTimeFRowTCol, "amx-inputDate-incrementButton");
                  adf.mf.internal.amx.addCSSClassName(incDateTimeFRowTCol, "amx-inputDate-incrementButton-selected");
                  curThirdValue = selectedThirdValue[0].textContent;
                  if (curThirdValue[1] !== "M")
                  {
                    if (curThirdValue !== "0")
                    {
                      curThirdValue = parseInt(curThirdValue, 10);
                      var nextYear = curThirdValue + 1;
                      selectedThirdValue[0].textContent = nextYear;
                    }
                    dateTimePicker.setAttribute("data-date-year", selectedThirdValue[0].textContent);
                  }
                  else
                  {
                    if (curThirdValue == "PM")
                    {
                      selectedThirdValue[0].textContent = "AM";
                    }
                    else
                    {
                      selectedThirdValue[0].textContent = "PM";
                    }
                    dateTimePicker.setAttribute("data-time-ampm", selectedThirdValue[0].textContent);
                  }
                });

                // Changes the image back to normal on touchend
                $incDateTimeFRowTCol.bind("touchend", function (e)
                {
                  adf.mf.internal.amx.removeCSSClassName(incDateTimeFRowTCol, "amx-inputDate-incrementButton-selected");
                  adf.mf.internal.amx.addCSSClassName(incDateTimeFRowTCol, "amx-inputDate-incrementButton");
                });

                // Attached event handlers to the respective mm/dd/yy decrement buttons to keep decrementing untill the last first in the array
                // Handling MONTH & HOUR decrement here
                $decDateTimeTRowFCol.bind("touchstart", function (e)
                {
                  // Changes the button image to the highlighted version on touch start
                  adf.mf.internal.amx.removeCSSClassName(decDateTimeTRowFCol, "amx-inputDate-decrementButton");
                  adf.mf.internal.amx.addCSSClassName(decDateTimeTRowFCol, "amx-inputDate-decrementButton-selected");
                  curFirstValue = selectedFirstValue[0].textContent;
                  curThirdValue = selectedThirdValue[0].textContent;
                  if (curThirdValue[1] !== "M")
                  {
                    if (curFirstValue !== month[0])
                    {
                      var prevMonth = (month.indexOf(curFirstValue)) - 1;
                      selectedFirstValue[0].textContent = month[prevMonth];
                    }
                    else if (curFirstValue == month[0])
                    {
                      prevMonth = 11; // index of the month[11] which is December
                      selectedFirstValue[0].textContent = month[prevMonth];
                    }
                    dateTimePicker.setAttribute("data-date-month", selectedFirstValue[0].textContent);
                  }
                  else
                  {
                    // Checking for AN/PM and modified JavaScript 24 hour clock to 12 hour clock
                    if (curFirstValue <= 23 && curFirstValue > 1)
                    {
                      if (curFirstValue > 12)
                      {
                        curFirstValue = curFirstValue - 12;
                      }
                      var prevHour = parseInt(curFirstValue, 10) - 1;
                      selectedFirstValue[0].textContent = prevHour;
                    }
                    else if (curFirstValue == 1)
                    {
                      curFirstValue = 12;
                      prevHour = 12;
                      selectedFirstValue[0].textContent = prevHour;
                    }
                    dateTimePicker.setAttribute("data-time-hour", selectedFirstValue[0].textContent);
                  }
                });
                // Changes the image back to normal on touchend
                $decDateTimeTRowFCol.bind("touchend", function (e)
                {
                  adf.mf.internal.amx.removeCSSClassName(decDateTimeTRowFCol, "amx-inputDate-decrementButton-selected");
                  adf.mf.internal.amx.addCSSClassName(decDateTimeTRowFCol, "amx-inputDate-decrementButton");
                });

                // Handling DAY & MINUTE decrement here
                $decDateTimeTRowSCol.bind("touchstart", function (e)
                {
                  // Changes the button image to the highlighted version on touch start
                  adf.mf.internal.amx.removeCSSClassName(decDateTimeTRowSCol, "amx-inputDate-decrementButton");
                  adf.mf.internal.amx.addCSSClassName(decDateTimeTRowSCol, "amx-inputDate-decrementButton-selected");
                  curSecondValue = selectedSecondValue[0].textContent;
                  curFirstValue = selectedFirstValue[0].textContent;
                  curThirdValue = selectedThirdValue[0].textContent;

                  if (curThirdValue[1] !== "M")
                  {
                    if (curSecondValue !== "1")
                    {
                      curSecondValue = parseInt(curSecondValue, 10);
                      var prevDay = curSecondValue - 1;
                      selectedSecondValue[0].textContent = day[prevDay - 1];
                    }
                    else if (curSecondValue == "1")
                    {
                      prevDay = daysInMonth(curThirdValue, curFirstValue);
                      selectedSecondValue[0].textContent = day[prevDay - 1];
                    }
                    dateTimePicker.setAttribute("data-date-day", selectedSecondValue[0].textContent);
                  }
                  else
                  {
                    if (curSecondValue <= 59 && curSecondValue >= 1)
                    {
                      var prevMin = parseInt(curSecondValue, 10) - 1;
                      selectedSecondValue[0].textContent = prevMin;
                    }
                    else if (curSecondValue == 0)
                    {
                      prevMin = 59;
                      selectedSecondValue[0].textContent = prevMin;
                    }
                    dateTimePicker.setAttribute("data-time-min", selectedSecondValue[0].textContent);
                  }
                });
                // Changes the image back to normal on touchend
                $decDateTimeTRowSCol.bind("touchend", function (e)
                {
                  adf.mf.internal.amx.removeCSSClassName(decDateTimeTRowSCol, "amx-inputDate-decrementButton-selected");
                  adf.mf.internal.amx.addCSSClassName(decDateTimeTRowSCol, "amx-inputDate-decrementButton");
                });

                // Handling YEAR decrement & AM/PM toggle here
                $decDateTimeTRowTCol.bind("touchstart", function (e)
                {
                  // Changes the button image to the highlighted version on touch start
                  adf.mf.internal.amx.removeCSSClassName(decDateTimeTRowTCol, "amx-inputDate-decrementButton");
                  adf.mf.internal.amx.addCSSClassName(decDateTimeTRowTCol, "amx-inputDate-decrementButton-selected");
                  curThirdValue = selectedThirdValue[0].textContent;
                  if (curThirdValue[1] !== "M")
                  {
                    if (curThirdValue !== "0") // check for the year 0 which would be invalid
                    {
                      curThirdValue = parseInt(curThirdValue, 10);
                      var prevYear = curThirdValue - 1;
                      selectedThirdValue[0].textContent = prevYear;
                    }
                    dateTimePicker.setAttribute("data-date-year", selectedThirdValue[0].textContent);
                  }
                  else
                  {
                    if (curThirdValue == "AM")
                    {
                      selectedThirdValue[0].textContent = "PM";
                    }
                    else
                    {
                      selectedThirdValue[0].textContent = "AM";
                    }
                    dateTimePicker.setAttribute("data-time-ampm", selectedThirdValue[0].textContent);
                  }
                });
                // Changes the image back to normal on touchend
                $decDateTimeTRowTCol.bind("touchend", function (e)
                {
                  adf.mf.internal.amx.removeCSSClassName(decDateTimeTRowTCol, "amx-inputDate-decrementButton-selected");
                  adf.mf.internal.amx.addCSSClassName(decDateTimeTRowTCol, "amx-inputDate-decrementButton");
                });
              }, false);
            }  

            if (adf.mf.environment.profile.dtMode != false)
            {
              $dateTrigger.remove();
              var dateTriggerSpanDTOnly = document.createElement("span");
              adf.mf.internal.amx.addCSSClassName(dateTriggerSpanDTOnly, "amx-inputDate-readOnly");
              // We need to show the value just as it was entered in the PI for DT Mode
              dateTriggerSpanDTOnly.textContent = value;
              field.fieldValue.appendChild(dateTriggerSpanDTOnly);
            }
          } /* End of Android DatePicker creation and rendering */

          // Verify that this object is a valid date.  We check for presence of the toISOString function and verify that the time
          // in milliseconds in not NaN
          var isValidDate = function (date)
          {
            return (typeof date.toISOString === "function") && !isNaN(date.getTime());
          };

          // When the seconds and milliseconds on a date are both 0, the native control will remove them from the value attribute
          // and dateLabel.value returns "YYYY-MM-DDTHH:MMZ".  However, Date.parse() chokes on this even though it is a valid
          // ISO 8601 format.  To avoid this failure, we add the seconds and milliseconds so the value looks like "YYYY-MM-DDTHH:MM:00.000Z"
          var fillDateText = function (dateString)
          {
            var i = dateString.indexOf("T");
            if (i > -1 && (i + 1) < dateString.length)
            {
              var time = dateString.substring(i + 1);
              if (time.length == 6)
              {
                // this string looks like "HH:MMZ".  It is missing the optional seconds and milliseconds so we add them as zeroes
                time = time.substring(0, 5) + ":00.000Z";
              }
              else if (time.length == 9)
              {
                // this string looks like "HH:MM:SSZ".  It is missing the optional milliseconds so we add them as zeroes
                time = time.substring(0, 8) + ".000Z";
              }
              dateString = dateString.substring(0, i + 1) + time;
            }
            return dateString;
          };

          if (adf.mf.internal.amx.agent["type"] == "iOS")
          {
            var dateLabel = document.createElement("input");
            dateLabel.setAttribute("class", "amx-inputDate-content");
            dateLabel.setAttribute("type", inputType);
            field.fieldValue.appendChild(dateLabel);
            dateLabel.value = value;
            adf.mf.internal.amx._setNonPrimitiveElementData(dateLabel, "value", dateObject);

            adf.mf.internal.amx.registerFocus(dateLabel);
            adf.mf.internal.amx.registerBlur(
            dateLabel,
              function (event)
              {
              var oldDate = adf.mf.internal.amx._getNonPrimitiveElementData(dateLabel, "value");
              var newDate;
              // The value is set to "" when the user clicks "Clear" on the picker.  When that happens we simply want to set the new value to null
              if (dateLabel.value === "")
              {
                newDate = {};
                newDate[".null"] = true;
              }
              // The value is an actual date/time so we create a Date object
              else
              {
                if (inputType === "time")
                {
                  if (isValidDate(oldDate))
                  {
                    newDate = new Date(oldDate.getTime());
                  }
                  else
                  {
                    newDate = new Date();
                  }
                  adf.mf.internal.amx.updateTime(newDate, dateLabel.value);
                }
                else if (inputType === "date")
                {
                  if (isValidDate(oldDate))
                  {
                    newDate = new Date(oldDate.getTime());
                  }
                  else
                  {
                    newDate = new Date();
                  }
                  adf.mf.internal.amx.updateDate(newDate, dateLabel.value);
                }
                else
                {
                  newDate = new Date(fillDateText(dateLabel.value));
                  if (isValidDate(oldDate))
                  {
                    newDate.setMilliseconds(oldDate.getMilliseconds());
                  }
                }
              }

              // if old and new date are null or if they represent the same time, we don't fire an event
              if ((newDate[".null"] == true && oldDate[".null"] == true) || (isValidDate(newDate) && isValidDate(oldDate) && newDate.getTime() == oldDate.getTime()))
              {
                // do nothing
              }
              // old and new date are different so fire the event
              else
              {
                var newValue;
                if (isValidDate(newDate))
                {
                  newValue = newDate.toISOString();
                }
                else
                {
                  newValue = newDate;
                }
                var oldValue;
                if (isValidDate(oldDate))
                {
                  oldValue = oldDate.toISOString();
                }
                else
                {
                  oldValue = oldDate;
                }
                var vce = new amx.ValueChangeEvent(oldValue, newValue);
                amx.processAmxEvent($(rootDomNode), "valueChange", "value", newValue, vce);
              }

              adf.mf.internal.amx._setNonPrimitiveElementData(dateLabel, "value", newDate);
            });

            // if disabled is set to true for iOS
            var disabled = amxNode.getAttribute("disabled");
            if (disabled == true)
            {
              dateLabel.setAttribute("disabled", disabled);
              // Adding WAI-ARIA Attribute for the disabled state
              dateLabel.setAttribute("aria-disabled", disabled);
            }
          }
        }
        // calls applyRequiredMarker in amx-core.js to determine and implement required/showRequired style
        adf.mf.api.amx.applyRequiredMarker(amxNode, field);
        return rootDomNode;
      }
    }
  };
  // add this renderer
  amx.registerRenderers("amx", amxRenderers);
})();

