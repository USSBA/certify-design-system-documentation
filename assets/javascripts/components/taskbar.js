
$(document).ready(function(){
  var $taskbar_wrap = $('#taskbar-wrap'),
      elementOffset = $taskbar_wrap.offset().top,
      taskbar_height = $taskbar_wrap.height(),
      placeholder = '<div class="taskbar-placeholder" style="height:'+taskbar_height+'px"></div>';

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
});
