$(document).ready(function() {
  var $trigger = $('.sba-js-visibility-trigger');

  $trigger.on('click', function(){
    var target = "#" + $(this).attr('aria-controls');
    if ($(this).attr("aria-expanded") === "false" ) {
      $(this).attr("aria-expanded", "true").css('transform', 'rotate(180deg)');
      $(target).removeAttr("hidden");
    }
    else {
      $(this).attr("aria-expanded", "false").removeAttr("style");
      $(target).attr("hidden", "");
    }
    return false;
  });
});
