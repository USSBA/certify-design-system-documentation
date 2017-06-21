$(document).ready(function(){
  var $task_panel_toggle = $('.task-panel-toggle'),
      visible_class = "visible";

  $task_panel_toggle.on('click', function(){
    var $target = $("#" + $(this).attr("aria-controls"));

    if ($(this).attr("aria-expanded") === "false") {
      $(this).attr("aria-expanded", "true");
      $target.addClass(visible_class);
    }
    else {
      $(this).attr("aria-expanded", "false");
      $target.removeClass(visible_class);
    }
  });


});
