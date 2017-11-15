$('document').ready(function(){
  var $iframe = $(".responsive-iframe");
  var $iframe_box = $('.iframe__preview');

  var resizeFrame = function(frame, box){
    var display_width = frame.attr('data-width');
    var viewable_width = box.width();


    if ( viewable_width < display_width ) {
      var scale = viewable_width / display_width;
      frame.css({'transform' : 'scale('+ viewable_width / display_width  +')', 'width' : '' + display_width + 'px'});
    }

    else {
      frame.removeAttr('style');
      frame.css({'width' : '' + display_width + 'px'});
    }
  }

  resizeFrame($iframe, $iframe_box);

  $('.sg-responsive-preview button').on('click', function(){
    var frame = $(this).parent().parent().find('.responsive-iframe');
    var box = $(this).parent().parent().find('.iframe__preview');
    var new_size = $(this).attr('data-size');

    $('.sg-responsive-preview button').removeClass('is-current');
    $(this).addClass('is-current');


    frame.attr('data-width', new_size);
    resizeFrame(frame, box);
  });

  $(window).resize(function(){
    resizeFrame($iframe, $iframe_box);
  });
});
