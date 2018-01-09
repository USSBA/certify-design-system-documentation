/**
 * Check Validations
 * validateFields will valid form fields. Best to place on clicking a
 * submit button, but can be used in other functions as well. The validateFields
 * function exists in the global scope, so it can be called on generated
 * form fields.
 *
 * Usage:
 * validateFields([FORM_ID]);
 * if (!has_validation_errors) {
 *  // Stuff that happens when validation passes
 * }
 *
 */

$(document).ready(function() {
  // checkValidity() will crash IE9, so we need to bypass it there.
  var hasBrowserValidation = (typeof document.createElement('input').checkValidity == 'function');

  var errorClass = "sba-c-input--error",
      labelErrorClass = "sba-c-label--error",
      errorID = "error",
      $errorplaceholder = $('.error-placeholder'),
      errorContainer = ('<div class="sba-c-error-wrapper"></div>');


    window.validateFields = function(e){
      // If the browser validation is supported, we'll run this function
      // Otherwise we hve to rely on server validation
      if (hasBrowserValidation) {
      // Redefine the inputs since some will be removed on page load
        $inputs = $(e).find('input:not([type="hidden"]), input:not([type="submit"]), select');
        // Validate each input
        $inputs.each(function() {
          var $el = $(this);
          if (!this.checkValidity()) {
            window.has_validation_errors = true;
            event.preventDefault();
            clearErrors($el);
            displayErrors($el);
            $el.focus();
            return false;
          }
          else {
            window.has_validation_errors = false;
            clearErrors($el);
          }
        });
      }
      else {
        window.has_validation_errors = false;
      }
    };


  var displayErrors = function($el) {
    var errorMessage = $el.attr('data-custom-validity') || $el[0].validationMessage,
      errorFieldName = $el.attr('id'),
      $label = $('label[for="'+errorFieldName+'"]'),
      $container = $el.closest('.sba-c-field-group');

    if (($el.attr("type") != "radio") && ($el.attr("type") != "checkbox")) {
      var errorMessage = '<span id="error" aria-atomic="true" class="sba-c-input-error-message" role="alert">'+errorMessage+'</span>';
      $el.closest('li').addClass('sba-c-error-wrapper');
      $el.addClass(errorClass);
      $label.addClass(labelErrorClass);
      $el.next().remove('.form-feedback');
      if ($el.parents().find($errorplaceholder).length) {
        $errorplaceholder.html(errorMessage);
      }
      else {
        $label.before(errorMessage);
      }
    }
    else if ($el.attr("type") == "checkbox") {
      $el.before('<span aria-atomic="true" class="sba-c-input-error-message" role="alert">'+errorMessage+'</span>');
    }
    else {
      $el.parent().parent().before('<span aria-atomic="true" class="sba-c-input-error-message" role="alert">'+errorMessage+'</span>');
    }
    $container.attr('id',  errorID).addClass(errorClass);
    location.href = "#" + errorID;
  };

  var clearErrors = function($el) {
    $el.removeClass(errorClass);
    $('.sba-c-input-error-message').remove();
    $('label.'+ labelErrorClass).removeClass(labelErrorClass);
    $('#error').removeClass(errorClass).removeAttr('id');
    $('.sba-c-error-wrapper').removeClass('sba-c-error-wrapper');
  };
});
