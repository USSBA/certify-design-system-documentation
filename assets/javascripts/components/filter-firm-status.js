$(document).ready(function() {
  filterPageContent = function(k,v) {
    $('['+ k +']').each(function(){
      var e = $(this).attr(k);
      if ( e.indexOf(v) >= 0)  {
        /* Do Nothing */
      }
      else {
        $(this).remove();
      }
    });
  }
});
