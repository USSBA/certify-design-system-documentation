$(document).ready(function() {
  filterPageContent = function(key,selected_filter) {
    $('['+ key +']').each(function(){
      filter_list = $.makeArray($(this).attr(key).split(" "));
      if (filter_list.indexOf(selected_filter) >= 0)  {
        /* Do Nothing */
      }
      else {
        $(this).remove();
      }
    });
  }
});
