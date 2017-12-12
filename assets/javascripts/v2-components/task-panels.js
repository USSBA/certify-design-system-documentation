$(document).ready(function(){
  // Variables
  var $task_panel_toggle = $('.sba-c-task-panel__toggle');


  // Function for handling task panels
  $task_panel_toggle.on('click', function(){
    window.toggle_task_panels($(this));
  });

  window.toggle_task_panels = function(panel){
    // Determine which task panel we clicked on
    var $target = $("#" + panel.attr("aria-controls")),
        $task_panel_content = $('.sba-c-task-panel__content'),
        open_class = "open",
        transition_class = "in-transition",
        visible_class = "visible";

    // First Let's Close any open task panels
    $('.sba-c-task-panel__toggle').not(panel)
      .attr("aria-expanded","false")
      .parent()
        .removeClass(open_class)
          .find($task_panel_content)
            .removeClass(transition_class);

    $task_panel_toggle.not(panel)
      .one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend',
      function(e) {
        $task_panel_toggle.not(panel)
          .find($task_panel_content)
            .removeClass(visible_class);
      });

    // Next, we determine if the panel is open or closed based on aria-expanded
    if (panel.attr("aria-expanded") === "false") {
      panel.attr("aria-expanded", "true");
      $target.parent()
        .addClass(open_class);
      $target.addClass(visible_class);
      setTimeout(function(){
        $target.addClass(transition_class)
      }, 20);
    }
    else {
      panel.attr("aria-expanded", "false");
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
  };


});
