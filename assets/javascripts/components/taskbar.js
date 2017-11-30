
$(document).ready(function(){
  var $taskbar_wrap = $('#taskbar-wrap');

  if ($taskbar_wrap.length) {

    var elementOffset = $taskbar_wrap.offset().top;

    // This was moved to a setTimeout only becuase it was taking a long time
    // for other things on the page to load.
    //setTimeout(function(){
      var taskbar_height = $taskbar_wrap.height(),
      placeholder = '<div class="taskbar-placeholder" style="height:'+taskbar_height+'px"></div>';
    //}, 20);

    $(window).on('scroll', function () {
      var scrollTop     = $(window).scrollTop(),
          distance      = (elementOffset - scrollTop);

      if ( distance < 0) {

        $taskbar_wrap.addClass("fixed");
        if (!$('.taskbar-placeholder').length) {
          $taskbar_wrap.after(placeholder);
        }
      }
      else {
        $taskbar_wrap.removeClass("fixed");
        $('.taskbar-placeholder').remove();
      }
    });
  }


});
