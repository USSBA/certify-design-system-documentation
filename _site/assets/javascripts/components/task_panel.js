$(document).ready(function(){
  // Variables
  var $task_panel_toggle = $('.task-panel-toggle'),
      $task_panel_content = $('.task-panel-content'),
      open_class = "open",
      transition_class = "in-transition",
      visible_class = "visible";

  // Function for handling task panels
  $task_panel_toggle.on('click', function(){

    // Determine which task panel we clicked on
    var $target = $("#" + $(this).attr("aria-controls"));

    // First Let's Close any open task panels
    $task_panel_toggle.not($(this))
      .attr("aria-expanded","false")
      .parent()
        .removeClass(open_class)
          .find($task_panel_content)
            .removeClass(transition_class);

    $task_panel_toggle.not($(this))
      .one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend',
      function(e) {
        $task_panel_toggle.not($(this))
          .find($task_panel_content)
            .removeClass(visible_class);
      });

    // Next, we determine if the panel is open or closed based on aria-expanded
    if ($(this).attr("aria-expanded") === "false") {
      $(this).attr("aria-expanded", "true");
      $target.parent()
        .addClass(open_class);
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
        $target.parent().removeClass(open_class);
      });
    }

    // DEV Note: Please refactor this to DRY it up and incorporate into the add note feature
    $('#add_note').on('click', function(){
      $task_panel_toggle.attr("aria-expanded", "false");
      $target.removeClass(transition_class);
      $target.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend',
      function(e) {
        $target.removeClass(visible_class);
        $target.parent().removeClass(open_class);
      });
    });
  });


});
