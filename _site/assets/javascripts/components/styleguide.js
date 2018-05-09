$(document).ready(function() {

  var $nav_button = $('.usa-sidenav-list-button'),
      open_class = "is-open";

  $nav_button.on('click', function(){
    var sublist_name = $(this).attr('aria-controls'),
        $sublist = $("#" + sublist_name);

    if ($(this).hasClass(open_class)) {
      $(this).removeClass(open_class);
      $(this).attr('aria-collapsed', 'true');
    }
    else {
      $(this).addClass(open_class);
      $(this).attr('aria-collapsed', 'false');
    }
  });
});
