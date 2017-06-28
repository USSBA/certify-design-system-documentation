$(document).ready(function(){
  var $task_panel_toggle = $('.task-panel-toggle'),
      transition_class = "in-transition",
      visible_class = "visible";

  $task_panel_toggle.on('click', function(){
    var $target = $("#" + $(this).attr("aria-controls"));

    if ($(this).attr("aria-expanded") === "false") {
      $(this).attr("aria-expanded", "true");
      $target.addClass(visible_class);
      setTimeout(function(){
        $target.addClass(transition_class)
      }, 20);
    }
    else {
      $(this).attr("aria-expanded", "false");
      $target.removeClass(transition_class);
      $target.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend',
      function(e) {
        $target.removeClass(visible_class);
      });
    }
  });


});
