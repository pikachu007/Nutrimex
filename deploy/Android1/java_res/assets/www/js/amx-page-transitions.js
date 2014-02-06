/* Copyright (c) 2011, 2012, Oracle and/or its affiliates. All rights reserved. */
/* ------------------------------------------------------ */
/* --------------- amx-page-transitions.js -------------- */
/* ------------------------------------------------------ */

(function() {
// TODO finish the migration from "amx.*" to "adf.mf.api.amx.*" and "adf.mf.internal.amx.*"

  //--------- register --------//
  //--------- slide --------//
  amx.registerTransitionHandler("slide",function($current,$new,isBack)
  {
    return slide($current,$new,isBack,"start").promise();
  });

  amx.registerTransitionHandler("slideStart",function($current,$new,isBack)
  {
    return slide($current,$new,isBack,"start").promise();
  });

  amx.registerTransitionHandler("slideEnd",function($current,$new,isBack)
  {
    return slide($current,$new,isBack,"end").promise();
  });

  amx.registerTransitionHandler("slideLeft",function($current,$new,isBack)
  {
    return slide($current,$new,isBack,"left").promise();
  });

  amx.registerTransitionHandler("slideRight",function($current,$new,isBack)
  {
    return slide($current,$new,isBack,"right").promise();
  });

  amx.registerTransitionHandler("slideUp",function($current,$new,isBack)
  {
    return slide($current,$new,isBack,"up").promise();
  });

  amx.registerTransitionHandler("slideDown",function($current,$new,isBack)
  {
    return slide($current,$new,isBack,"down").promise();
  });

  //--------- /slide --------//

  //--------- flip --------//
  amx.registerTransitionHandler("flip",function($current,$new,isBack)
  {
    return flip($current,$new,isBack,"start").promise();
  });

  amx.registerTransitionHandler("flipStart",function($current,$new,isBack)
  {
    return flip($current,$new,isBack,"start").promise();
  });

  amx.registerTransitionHandler("flipEnd",function($current,$new,isBack)
  {
    return flip($current,$new,isBack,"end").promise();
  });

  amx.registerTransitionHandler("flipLeft",function($current,$new,isBack)
  {
    return flip($current,$new,isBack,"left").promise();
  });

  amx.registerTransitionHandler("flipRight",function($current,$new,isBack)
  {
    return flip($current,$new,isBack,"right").promise();
  });

  amx.registerTransitionHandler("flipUp",function($current,$new,isBack)
  {
    return flip($current,$new,isBack,"up").promise();
  });

  amx.registerTransitionHandler("flipDown",function($current,$new,isBack)
  {
    return flip($current,$new,isBack,"down").promise();
  });
  //--------- /flip --------//

  //--------- fade --------//
  amx.registerTransitionHandler("fade",function($current,$new,isBack)
  {
    return fade($current,$new,isBack,"in").promise();
  });

  amx.registerTransitionHandler("fadeIn",function($current,$new,isBack)
  {
    return fade($current,$new,isBack,"in").promise();
  });

  amx.registerTransitionHandler("fadeOut",function($current,$new,isBack)
  {
    return fade($current,$new,isBack,"out").promise();
  });
  //--------- /fade --------//
  //--------- /register --------//

  //--------- transitions --------//
  function slide($current,$new,reverse,direction)
  {
    var dt = direction;
    if (reverse)
    {
      dt = getReverseDirection(direction);
    }
    var vertical = false;
    var back = false;

    if (dt == "up" || dt == "down")
    {
      vertical = true;
    }

    if (dt == "right" || dt == "down")
    {
      back = true;
    }

    if (document.documentElement.dir == "rtl")
    {
      if (dt == "start")
      {
        back = true;
      }
    }
    else // ltr
    {
      if (dt == "end")
      {
        back = true;
      }
    }

    var dfd = $.Deferred();
    // for now, we assume, position $current is 0, 0, and that all views should have same width
    // (fair assumption since the $new was drawn below the $current)
    var width = $current.width(); // should probably take from parent to be safe
    var fromX = back ? (-1) * width : width;
    var currentToX = fromX * -1;
    if (vertical)
    {
      width = $current.height();
      fromX = back ? (-1) * width : width;
      currentToX = fromX * -1;
      $current.height(width);
      $new.height(width);

      $new.css("top", fromX+"px");
    }
    else
    {
      // fix the width of the two view during animation.
      $current.width(width);
      $new.width(width);

      // put the $new in the fromX
      if (document.documentElement.dir == "rtl")
      {
        if (fromX < 0) // transitioning from beyond the left-hand side of the screen
        {
          // TODO this doesn't work without flicker on desktop Safari 6 and simulated iOS 6 Safari
          $new.css("width", width+"px");
          $new.css("right", -fromX+"px");
          $new.css("left", fromX+"px");
        }
        else // transitioning from beyond the right-hand side of the screen
        {
          // Extra styles needed to make the transition smooth
          $new.css("width", width+"px");
          $new.css("right", -fromX+"px");
          $new.css("left", fromX+"px");
        }
      }
      else // ltr
      {
        $new.css("left", fromX+"px");
      }
    }

    //$new.addClass("setup");
    $new.removeClass("new").addClass("showing");

    setTimeout(function()
    {
      var currentDfd = $.Deferred();
      var newDfd = $.Deferred();

      $new.addClass("transitioning");

      $current.addClass("transitioning");
      if (vertical)
      {
        $current.css("-webkit-transform","translate(0," + currentToX + "px)");
      }
      else
      {
        $current.css("-webkit-transform","translate(" + currentToX + "px,0)");
      }
      $current.one("webkitTransitionEnd",function()
      {
        $current.removeClass("current").addClass("old");
        $current.removeClass("transitioning");
        $current.remove();
        currentDfd.resolve();
      });

      $new.addClass("transitioning");
      if (vertical)
      {
        $new.css("-webkit-transform","translate(0," + currentToX + "px)");
      }
      else
      {
        $new.css("-webkit-transform","translate(" + currentToX + "px,0)");
      }
      $new.one("webkitTransitionEnd",function()
      {
        $new.removeClass("showing").addClass("current");
        $new.removeClass("transitioning");
        $new.attr("style", "");
        newDfd.resolve();
      });

      $.when(currentDfd,newDfd).done(function()
      {
        // jQueryMobile workaround:
        // for now, just to be safe, we with 200 milliseconds before accepting event
        // somehow, on simulator, the jQueryMobile button get the previous tap event
        setTimeout(function()
        {
          dfd.resolve();
        },1);
      });
    },1);

    return dfd.promise();
  }

  function flip($current,$new,reverse,direction)
  {
    var dt = direction;
    if (reverse)
    {
      dt = getReverseDirection(direction);
    }
    var vertical = false;
    var back = false;

    if (dt == "up" || dt == "down")
    {
      vertical = true;
    }

    if (dt == "right" || dt == "up")
    {
      back = true;
    }

    if (document.documentElement.dir == "rtl")
    {
      if (dt == "start")
      {
        back = true;
      }
    }
    else // ltr
    {
      if (dt == "end")
      {
        back = true;
      }
    }

    var dfd = $.Deferred();
    // for now, we assume, position $current is 0, 0, and that all views should have same width
    // (fair assumption since the $new was drawn below the $current)

    var width = $current.width();
    var newBaseRotate = (back)?"rotateY(-180deg)":"rotateY(180deg)";
    if (vertical)
    {
      width = $current.height();

      $current.height(width);
      $new.height(width);
      newBaseRotate = (back)?"rotateX(-180deg)":"rotateX(180deg)";
      $current.addClass("face").css("-webkit-transform","rotateX(0deg)");
    }
    else
    {
      $current.width(width);
      $new.width(width);
      $current.addClass("face").css("-webkit-transform","rotateY(0deg)");
    }

    $new.addClass("face").css("-webkit-transform",newBaseRotate);
    $new.removeClass("new").addClass("showing");

    /// FIXME ///
    setTimeout(function()
    {
      var currentDfd = $.Deferred();
      var newDfd = $.Deferred();

      $("#bodyPage").addClass("transitioning");

      $current.addClass("transitioning-slow");
      var rotateVal = (back)?"rotateY(+180deg)":"rotateY(-180deg)";
      if (vertical)
      {
        rotateVal = (back)?"rotateX(+180deg)":"rotateX(-180deg)";
      }
      $current.css("-webkit-transform",rotateVal);
      $current.one("webkitTransitionEnd",function()
      {
        $current.removeClass("current").addClass("old");
        $current.removeClass("transitioning-slow face");
        $current.remove();
        currentDfd.resolve();
      });

      $new.addClass("transitioning-slow");
      if (vertical)
      {
        $new.css("-webkit-transform","rotateX(0deg)")
      }
      else
      {
        $new.css("-webkit-transform","rotateY(0deg)")
      }
      $new.one("webkitTransitionEnd",function()
      {
        $new.removeClass("showing").addClass("current");
        $new.removeClass("transitioning-slow face");
        $("#bodyPage").removeClass("transitioning");
        $new.attr("style","");
        newDfd.resolve();
      });

      $.when(currentDfd,newDfd).done(function()
      {
        // jQueryMobile workaround:
        // for now, just to be safe, we with 200 milliseconds before accepting event
        // somehow, on simulator, the jQueryMobile button get the previous tap event
        setTimeout(function()
        {
          dfd.resolve();
        },1);
      });
    },1);
    return dfd.promise();
  }

  function fade($current,$new,reverse,direction)
  {
    var dfd = $.Deferred();
    $current.addClass("face").css("opacity","1");
    $new.addClass("face").css("opacity","0");
    $new.addClass("transitioning-slow");
    $new.removeClass("new").addClass("showing");

    setTimeout(function()
    {
      var currentDfd = $.Deferred();
      var newDfd = $.Deferred();

      $current.addClass("transitioning-slow");
      $current.css("opacity","0");
      $current.one("webkitTransitionEnd",function()
      {
        $current.removeClass("current").addClass("old");
        $current.removeClass("transitioning-slow face");
        $current.remove();
        currentDfd.resolve();
      });

      $new.addClass("transitioning-slow");
      $new.css("opacity", "1");
      $new.one("webkitTransitionEnd",function()
      {
        $new.removeClass("showing").addClass("current");
        $new.removeClass("transitioning-slow face");
        $new.attr("style", "");
        newDfd.resolve();
      });

      $.when(currentDfd,newDfd).done(function()
      {
        // jQueryMobile workaround:
        // for now, just to be safe, we with 200 milliseconds before accepting event
        // somehow, on simulator, the jQueryMobile button get the previous tap event
        setTimeout(function()
        {
          dfd.resolve();
        },1);
      });
    },1);

    return dfd.promise();
  }
  //--------- /transitions --------//

  //--------- /Helper Functions --------//
  function getReverseDirection(direction)
  {
    if (direction == "start")
    {
      direction = "end";
    }
    else if (direction == "end")
    {
      direction = "start";
    }
    else if (direction == "left")
    {
      direction = "right";
    }
    else if (direction == "right")
    {
      direction = "left";
    }
    else if (direction == "up")
    {
      direction = "down";
    }
    else if (direction == "down")
    {
      direction = "up";
    }
    return direction;
  }
  //--------- /Helper Functions --------//
})();
