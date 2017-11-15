$('document').ready(function(){
  var $iframe = $(".responsive-iframe");
  var $iframe_box = $('.iframe__preview');

  var resizeFrame = function(){
    var display_width = $iframe.attr('data-width');
    var viewable_width = $iframe_box.width();


    if ( viewable_width < display_width ) {
      var scale = viewable_width / display_width;
      $iframe.css({'transform' : 'scale('+ viewable_width / display_width  +')', 'width' : '' + display_width + 'px'});
    }

    else {
      $iframe.removeAttr('style');
      $iframe.css({'width' : '' + display_width + 'px'});
    }
  }

  resizeFrame();

  $(window).resize(function(){
    resizeFrame();
  });
});
