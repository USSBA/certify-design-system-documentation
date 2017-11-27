/*

  Show and hide followup fields for radio buttons and checkboxes
  Todo: we need to DRY up the code a little bit.

  Note: Still need to make required fields hide from validation better.
*/

$(document).ready(function() {
  var hidden_class = "usa-extend--hidden";
      $radio = $("input:radio");
      $checkbox = $('input:checkbox[data-follow-up]'),
      $selectbox = $('select');

  var showFollowup = function(control, e, required) {
    e.removeAttr("hidden");
    control.attr("aria-expanded", "true");
    if (required == "true"){
      e.find('input, select').attr('required', 'true');
    }
  }

  var hideFollowup = function(control, e, required) {
    e.attr("hidden", "");
    control.attr("aria-expanded", "false");
    if (required == "true"){
      e.find('input, select, textarea').removeAttr('required');
    }
  };

  // Handle Radio Buttons
  $radio.change(function () {
    var $control = $(this);
    var name = $(this).attr("name");
    var $el = $('input:radio[name="'+ name +'"]');

    $el.each(function(){
      var target = $(this).attr('data-follow-up'),
          required = $(this).attr('data-follow-up-required');
      if ($(this).is(":checked")) {
        showFollowup($el, $('#' + target), required);
      }
      else {
        hideFollowup($el, $('#' + target), required);
      }
    });
  });

  // Handle Checkboxes
  $checkbox.change(function(){
    var $control = $(this);
    var target = $(this).attr('data-follow-up'),
        required = $(this).attr('data-follow-up-required');
    if ($(this).is(":checked")) {
      showFollowup($control, $('#' + target), required);
    }
    else {
      hideFollowup($control, $('#' + target), required);
    }
  });

  // Handle Selct Boxes
  var previous;
  $selectbox.on('click focus keydown', function(){
    previous = $(this).find(':selected').attr('data-follow-up'),
    previous_required = $(this).find(':selected').attr('data-follow-up-required');
  }).change(function(){
    var selected_val = $(this).find('option[data-follow-up]:selected').val();
    var target = $(this).find(':selected').attr('data-follow-up'),
        required = $(this).find(':selected').attr('data-follow-up-required');

    if ($(this).find(':selected').val() == selected_val) {
      showFollowup($('#' + target), required);
    }
    if (selected_val != previous) {
      hideFollowup($('#' + previous), previous_required);
    }
  });

});
