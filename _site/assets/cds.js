




if (typeof jQuery=="undefined") { console.warn("Certify Design System requires jQuery.")};
var certifyDesignSystem = true; 
/**
 * Date picker
 * Date picker script is a fallback for any browser that
 * does not offer native support for the HTML5 date input.
 * If a browser does not recognize an input, it defaults
 * back to a text input. This script will provide a fallback
 * that auto formats the text box as the user enters the date
 * to a MM/DD/YYYY format.
 *
 * Also includes a way to format number fields with a class
 * name of js-format-as-date
 *
 * Usage:
 * Works on any <input type="date"> in non-supporting browsers
 *
 * To format dates on a number input, use
 * <input type="number" class="js-format-as-date">
 *
 */


$(document).ready(function() {
  function checkDateInput() {
      var input = document.createElement('input');
      input.setAttribute('type','date');

      var notADateValue = 'not-a-date';
      input.setAttribute('value', notADateValue);

      return (input.value !== notADateValue);
  }

  function formatDates(element) {
    var date = element;
    function checkValue(str, max) {
      if (str.charAt(0) !== '0' || str == '00') {
        var num = parseInt(str);
        if (isNaN(num) || num <= 0 || num > max) num = 1;
        str = num > parseInt(max.toString().charAt(0)) && num.toString().length == 1 ? '0' + num : num.toString();
      };
      return str;
    };

    date.on('keyup', function(e) {
      this.type = 'text';
      var input = this.value;
      if (/\D\/$/.test(input)) input = input.substr(0, input.length - 3);
      var values = input.split('/').map(function(v) {
        return v.replace(/\D/g, '')
      });
      if (values[0]) values[0] = checkValue(values[0], 12);
      if (values[1]) values[1] = checkValue(values[1], 31);
      var output = values.map(function(v, i) {
        return v.length == 2 && i < 2 ? v + ' / ' : v;
      });
      this.value = output.join('').substr(0, 14);
    });

    date.on('blur', function(e) {
      this.type = 'text';
      var input = this.value;
      var values = input.split('/').map(function(v, i) {
        return v.replace(/\D/g, '')
      });
      var output = '';

      if (values.length == 3) {
        var year = values[2].length !== 4 ? parseInt(values[2]) + 2000 : parseInt(values[2]);
        var month = parseInt(values[0]) - 1;
        var day = parseInt(values[1]);
        var d = new Date(year, month, day);
        if (!isNaN(d)) {
          var dates = [d.getMonth() + 1, d.getDate(), d.getFullYear()];
          output = dates.map(function(v) {
            v = v.toString();
            return v.length == 1 ? '0' + v : v;
          }).join(' / ');
        };
      };
      this.value = output;
    });

  }

  // Automatically format dates on date inputs on
  // browsers that do not support them
  if (!checkDateInput()) {
    formatDates($('input[type="date"]'));
  }

  // Format date for text inputs
  formatDates($('.js-format-as-date'));

});
$(document).ready(function(){
  // Variables
  var $doc_upload_toggle = $('.sba-c-doc-upload__toggle'),
      hidden_class = "hidden",
      open_class = "is-open",
      visible_class = "is-visible";

  // Function for handling doc upload
  $doc_upload_toggle.on('click', function() {

    // Determine which task panel we clicked on
    elem = $(this).attr("aria-controls")
    var $toggle = $('button[aria-controls=' + elem + ']');
    var $cancel = $('button[aria-controls=' + elem + '-cancel]');
    var $target = $("#" + elem);

    // Toggle doc uploader
    if ($toggle.attr("aria-expanded") === "false") {
      $toggle.attr("aria-expanded", "true");
      $toggle.addClass(hidden_class);
      $target.parent().addClass(open_class);
      $target.addClass(visible_class);
    }

    // Toggle cancel
    $cancel.on('click', function() {
      $toggle.attr("aria-expanded", "false");
      $toggle.removeClass(hidden_class);
      $target.parent().removeClass(open_class);
      $target.removeClass(visible_class);
    })
  });
});
$(document).ready(function() {
  var $editable_table = $('.sba-c-table--editable'),
      $add_button = $editable_table.next('[id$="_add_item"]');
      var previous_values = [];
      var itemID;

      var getItemID = function(e){
        if (typeof e.attr('id') != "undefined") {
          itemID = "#" + e.attr('id').replace('_edit','').replace('_delete','').replace('_save','').replace('_cancel','');
        }
      }

      var closeTaskPanels = function(){
        // Clase the task panels
        $('.sba-c-task-panel__toggle').attr("aria-expanded", "false");
        $('.sba-c-task-panel__content').removeClass('visible');
        $('.sba-c-task-panel__toggle').attr("disabled", "");
      }


      var numberWithCommas = function(number) {
          var parts = number.toString().split(".");
          parts[0] = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
          return parts.join(".");
      }

      var calculateTableSummaries = function(table) {
        var table_cols = table.find('thead tr th').length;

        for (var i = 0; i < table_cols; i++) {
          var $table_header = table.find('thead tr th:nth-child(' + (i+1) + ').js-sum');

          // See if there are any sum classes
          if ($table_header.length) {
            var sum = 0;
            // Get total values
            table.find('tbody tr[id$="_data"] td:nth-child(' + (i+1) + ')').each(function(){
              formatted_number = $(this).text().replace("$", "").replace(/,/g, "");
              sum += parseInt(formatted_number);
            });

            if (isNaN(sum)) {
              sum = 0;
            }

            if ($table_header.attr("data-info-type") == "usd") {
              sum = "$" + numberWithCommas(sum);
            }
            else if ($table_header.attr("data-info-type") == "percent") {
              sum = sum + "%";
            }

            table.find('tfoot tr td:nth-child(' + (i+1) + ')')
              .text(sum)
              .attr("data-table-header", $table_header.text());
          }
        }
      }

      $editable_table.on('click', '[id$="_edit"]', function(e){
        e.stopPropagation();
        getItemID($(e.target));

        // Close the task panels
        closeTaskPanels();

        // Hide data row
        $(itemID + "_data").attr("hidden", "");

        // Show fields
        $(itemID + "_fields").removeAttr("hidden").find('input:first').focus();

        // Store data from fieldset
        previous_values = [];
        $(itemID + "_fields").find('input').each(function(){
          input_id = "#" + $(this).attr('id');
          initial_val = $(this).val();
          previous_values.push([input_id, initial_val]);
        });

        // Disable adding rows while editing a rows
        $add_button.attr("disabled", "");

        // Update data in fields
        return false;
      });

      // Remove table row
      $editable_table.on('click', '[id$="_delete"]', function(e){
        e.stopPropagation();
        var table = "#" + $(this).closest('table').attr('id');

        getItemID($(e.target));
        var confirmed = confirm('Are you sure you want to delete this item?');
        if (confirmed) {
          $(itemID + "_data").remove();
        }
        calculateTableSummaries($(table));

        if ($(table).find('tbody tr').length <= 2) {
          $(table).find('tbody tr[id$="0_data"]').removeAttr("hidden");
          $(table).find('tfoot').remove();
        }
        return false;
      });

      // Save button
      $editable_table.on('click', '[id$="_save"]', function(e){
        e.stopPropagation();
        getItemID($(e.target));

        //// See if any columns need to be summarized, then create one if not created already
        var table = "#" + $(this).closest('table').attr('id');

         // Run Validations on the table
         validateFields($(table));

        // If there are no validation errors
         if (!has_validation_errors) {
           // Make aria less annoying
           $(table).attr('aria-live', 'polite');

           new_values = [];
           $(itemID + "_fields").find('input').each(function(){
             input_id = "#" + $(this).attr('id');

             if ($(this).hasClass('js-usd')) {
               initial_val = "$" + $(this).val();
             }
             else if ($(this).hasClass('js-percent')) {
               initial_val = $(this).val() + "%";
             }
             else {
               initial_val = $(this).val();
             }
             new_values.push([input_id, initial_val]);
           });


           var summated_cols = $(table).find('.js-sum').length;
           if ((summated_cols > 0) && ($(table).find('tfoot').length == 0)) {
             $(table).find('thead').after('<tfoot></tfoot>');
             var table_cols = $(table).find('thead tr th').length;

             for (var i = 0; i < table_cols; i++) {
               if (i == 0) {
                 $(table).find('tfoot').append('<tr><th scope="row">Totals</th></tr>');
               }
               else {
                 $(table).find('tfoot tr').append('<td></td>');
               }
             }
           }

           // Update the values
           for (var i = 0; i < new_values.length; i++)
           {
             $(new_values[i][0] + "_text").text(new_values[i][1]);


           }

           calculateTableSummaries($(table));

           getItemID($(e.target));

           // Show the data row
           $(itemID + "_data").removeAttr("hidden");

           // Hide fields
           $(itemID + "_fields").attr("hidden", "");

           // Re-enabled the the add button
           $add_button.removeAttr("disabled", "");

           // Re-enable task panels
           $('.sba-c-task-panel__toggle').removeAttr("disabled");
         }
        return false;
      });


      // Cancel Button
      $editable_table.on('click', '[id$="_cancel"]', function(e){
        e.stopPropagation();
        var table = "#" + $(this).closest('table').attr('id');

        // Reset the values
        for (var i = 0; i < previous_values.length; i++)
        {
          $(previous_values[i][0]).val(previous_values[i][1]);
        }

        // Show the data row
        $(itemID + "_data").removeAttr("hidden");

        // Re-enable task panels
        $('.sba-c-task-panel__toggle').removeAttr("disabled");

        // Hide fields
        $(itemID + "_fields").attr("hidden", "");

        // If canceling an ADD fields
        if ($(itemID + "_data").find('> *:first-child').text().length < 1) {
          $(e.target).closest('tr').prev('tr').remove();
          $(e.target).closest('tr').remove();
        }

        // Re-enabled the the add button
        $add_button.removeAttr("disabled");

        // Restore the null state
        if ($(table).find('tbody tr').length <= 2) {
          $(table).find('tbody tr[id$="0_data"]').removeAttr("hidden");
        }

        return false;
      });

      // Add a table row
      $add_button.on('click', function(){

        // Get itemID for the cancel button
        getItemID($(this));

        // Close the task panels
        closeTaskPanels();

        // Only allow adding one row at time.
        $(this).attr("disabled", "");

        // Get some variables
        var table = "#" + $(this).attr('id').replace('_add_item',''),
            table_name = $(this).attr('id').replace('_add_item','');
            row_id_arr = [];

        // Get highest ID
        $(table).find('tbody tr').each(function(){
          var ids = $(this).attr('id')
            .replace(table_name ,'')
            .replace('_fields','')
            .replace('_data','')
            .replace('_tr','');
          row_id_arr.push(ids);
        });

        // Just in case a null state has not been added
        if (row_id_arr.length === 0) {
          row_id_arr = [];
          row_id_arr.push(0);
        }

        // Hide the null row
        $(table).find('tbody tr[id$="0_data"]').attr("hidden", "");

        // Make aria less annoying
        $(table).attr('aria-live', 'off');

        // Get next ID number and number of rows needed
        var next_id = Math.max.apply(Math,row_id_arr) + 1,
            table_cols = $(table).find('thead tr th').length,
            row_name = table_name + '_tr' + next_id,
            data_row_id = row_name + '_data',
            fields_row_id = row_name + '_fields';

        // Create empty table rows
        $(table).find('tbody')
          .append('<tr class="is-added" id="' + data_row_id + '" hidden></tr>')
          .append('<tr id="' + fields_row_id + '"></tr>');

        // Create the table cells
        // Note - change the liquid tags
        for (var i = 0; i < table_cols; i++) {

          var $table_header_th = $(table).find('thead tr th:nth-child(' + (i + 1) + ')');

          // Get custom id attribute
          if (typeof $table_header_th.attr('data-custom-id') != 'undefined') {
            var custom_id_value = $table_header_th.attr('data-custom-id'),
                custom_id = '_' + custom_id_value;
            custom_id = custom_id.replace(/\s/g, "_");
          }
          else {
            var custom_id = '';
          }

          var data_header_text = $(table).find('thead tr th:nth-child(' + (i + 1) + ')').text();
          var data_row_th = '<th scope="row" id="' + row_name + '_field' + (i + 1) + custom_id + '_text" data-table-header="' + data_header_text + '"></th>';
          var data_row_td = '<td id="' + row_name + '_field' + (i + 1) + custom_id + '_text" data-table-header="' +  data_header_text + '" ></td>'
          var data_row_actions ='\
            <td data-table-header="' +  data_header_text + '" >\
              <div class="sba-c-task-panel">\
                <button type="button" class="sba-c-button sba-c-button--transparent sba-c-task-panel__toggle" aria-expanded="false" aria-controls="'+ fields_row_id +'_panel">\
                  <svg class="sba-c-icon" aria-hidden="true" viewBox="0 0 512 512">\
                    <title >Horizontal Ellipsis</title>\
                    <path d="M328 256c0 39.8-32.2 72-72 72s-72-32.2-72-72 32.2-72 72-72 72 32.2 72 72zm104-72c-39.8 0-72 32.2-72 72s32.2 72 72 72 72-32.2 72-72-32.2-72-72-72zm-352 0c-39.8 0-72 32.2-72 72s32.2 72 72 72 72-32.2 72-72-32.2-72-72-72z"></path>\
                  </svg>\
                  <span class="sba-u-visibility--screen-reader">Toggle menu to edit this row</span>\
                </button>\
                <div id="'+ fields_row_id +'_panel" class="sba-c-task-panel__content">\
                  <ul class="sba-c-task-panel__menu">\
                    <li class="sba-c-task-panel__menu__item">\
                      <a href="#" class="sba-c-task-panel__menu__link" id="'+ row_name +'_edit" aria-controls="'+ fields_row_id +'">Edit this item</a>\
                    </li>\
                    <li class="sba-c-task-panel__menu__item">\
                      <a href="#" class="sba-c-task-panel__menu__link--emergency" id="'+ row_name +'_delete">Delete</a>\
                    </li>\
                  </ul>\
                </div>\
              </div>\
            </td>';

          // Append the table cells
          if (i == 0) {
            $("#" + data_row_id).append(data_row_th); // first
          }
          else if (i == (table_cols - 1)) {
            $("#" + data_row_id).append(data_row_actions); // last
          }
          else {
            $("#" + data_row_id).append(data_row_td); // everything in between
          }
        }

        // Add the form field container
        var form_field_wrapper = '\
          <td colspan="' + table_cols + '">\
            <ul class="sba-c-field-list"></ul>\
            <div class="sba-c-table--editable__actions">\
              <button id="'+ row_name +'_save" class="sba-c-button" aria-controls="'+ data_row_id +' ' + fields_row_id+ '">OK</button>\
              <a id="' + row_name + '_cancel"  href="#" aria-controls="'+ data_row_id +' ' + fields_row_id+ '">Cancel</a>\
            </div>\
          </td>';

        // Add the wrapper
        $("#" + fields_row_id).append(form_field_wrapper);

        // Iterate through adding the form inputs
        for (var i = 0; i < table_cols - 1; i++) {
          var $table_header_th = $(table).find('thead tr th:nth-child(' + (i + 1) + ')');

          // Get custom id attribute
          if (typeof $table_header_th.attr('data-custom-id') != 'undefined') {
            var custom_id_value = $table_header_th.attr('data-custom-id'),
                custom_id = '_' + custom_id_value;
            custom_id = custom_id.replace(/\s/g, "_");
          }
          else {
            var custom_id = '';
          }

          // Get optional input attributes from data-[ATTRIBUTE]
          var optional_attribute_value = {};
          var optional_attributes = [];
          var optional_attribute_types = ['min', 'max', 'minlength', 'maxlength', 'pattern', 'required'];

          for (var c = 0; c < optional_attribute_types.length; c++) {

            if (typeof $table_header_th.attr('data-'+ optional_attribute_types[c] +'') != 'undefined') {
              optional_attribute_value[optional_attribute_types[c]] = $table_header_th.attr('data-'  + optional_attribute_types[c]);
              optional_attributes.push(optional_attribute_types[c] + '="' + optional_attribute_value[optional_attribute_types[c]] + '"' );
            }
          };

          optional_attributes = optional_attributes.join(" ").toString();


          // Get some more variables
          var input_type = $table_header_th.attr("data-info-type"),
              label_text = $table_header_th.text(),
              field_id = table_name + '_tr' + next_id + '_field' + (i + 1) + custom_id;

          // Get the hint hint text
          if (typeof $table_header_th.attr('data-hint-text') != 'undefined') {
            var aria_describedby_attribute = 'aria-describedby=' + field_id + '_hint';
            var hint_text = '<p class="sba-c-form-hint" id="' + field_id + '_hint">'+ $table_header_th.attr('data-hint-text') +'</p>';
          }
          else {
            var hint_text = '';
            var aria_describedby_attribute = '';
          }

          // Set input type to text if there is a min value or max value
          if ((optional_attributes.indexOf('min=') > -1) || (optional_attributes.indexOf('max=') > -1)) {
            var input_type_attribute = 'number';
          }
          else {
            var input_type_attribute = 'text';
          }



          // IMPORTANT: Before creating the gem, we are going to need
          // to fix the file path of the SVG.
          switch (input_type) {
            case "usd":
              var form_input = '\
              <div class="sba-c-input-ornament-container">\
                <div class="sba-c-input-ornament sba-c-input-ornament--left">\
                  <svg aria-hidden="true" class="sba-c-icon" viewBox="0 0 320 512">\
                    <title>Dollar Sign</title>\
                    <path d="M113.411 169.375c0-23.337 21.536-38.417 54.865-38.417 26.726 0 54.116 12.263 76.461 28.333 5.88 4.229 14.13 2.354 17.575-4.017l23.552-43.549c2.649-4.898 1.596-10.991-2.575-14.68-24.281-21.477-59.135-34.09-91.289-37.806V12c0-6.627-5.373-12-12-12h-40c-6.627 0-12 5.373-12 12v49.832c-58.627 13.29-97.299 55.917-97.299 108.639 0 123.533 184.765 110.81 184.765 169.414 0 19.823-16.311 41.158-52.124 41.158-30.751 0-62.932-15.88-87.848-35.887-5.31-4.264-13.082-3.315-17.159 2.14l-30.389 40.667c-3.627 4.854-3.075 11.657 1.302 15.847 24.049 23.02 59.249 41.255 98.751 47.973V500c0 6.627 5.373 12 12 12h40c6.627 0 12-5.373 12-12v-47.438c65.72-10.215 106.176-59.186 106.176-116.516.001-119.688-184.764-103.707-184.764-166.671z"></path>\
                  </svg>\
                </div>\
                <input type="number" id="'+ field_id +'" class="sba-u-input-width--10 js-usd" '+ aria_describedby_attribute + ' ' + optional_attributes +'>\
              </div>';
              break;
            case "percent":
              var form_input = '\
              <div class="sba-c-input-ornament-container">\
                <div class="sba-c-input-ornament sba-c-input-ornament--right">\
                  <svg aria-hidden="true" class="sba-c-icon" viewBox="0 0 448 512">\
                    <title>Percent</title>\
                    <path d="M112 224c61.9 0 112-50.1 112-112S173.9 0 112 0 0 50.1 0 112s50.1 112 112 112zm0-160c26.5 0 48 21.5 48 48s-21.5 48-48 48-48-21.5-48-48 21.5-48 48-48zm224 224c-61.9 0-112 50.1-112 112s50.1 112 112 112 112-50.1 112-112-50.1-112-112-112zm0 160c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48zM392.3.2l31.6-.1c19.4-.1 30.9 21.8 19.7 37.8L77.4 501.6a23.95 23.95 0 0 1-19.6 10.2l-33.4.1c-19.5 0-30.9-21.9-19.7-37.8l368-463.7C377.2 4 384.5.2 392.3.2z"></path>\
                  </svg>\
                </div>\
                <input type="number" id="'+ field_id +'" class="sba-u-input-width--3 js-percent" ' + aria_describedby_attribute + ' ' + optional_attributes +'>\
              </div>';
              break;
            default:
              var form_input = '<input id="' + field_id + '" type="' + input_type_attribute + '" '+ aria_describedby_attribute + ' ' + optional_attributes + '>';
          }



          var form_field = '\
            <li>\
              <label for="' + field_id + '" class="sba-c-label">' + label_text + '</label>\
              '+ hint_text +'\
              '+ form_input + '\
            </li>';

          $("#" + fields_row_id + " td ul").append(form_field);
        }

        // Focus on the first field
        $("#" + fields_row_id).find('input:first').focus();



        return false;
      });

      $editable_table.on('click', 'tr.is-added .sba-c-task-panel__toggle', function(e){
        toggler = $(e.target);
        window.toggle_task_panels(toggler);
      });
});
/*

  Show and hide followup fields for radio buttons and checkboxes
  Todo: we need to DRY up the code a little bit.
*/


$(document).ready(function() {
  var aria_hidden_attr = "aria-hidden",
      $radio = $("input:radio"),
      $checkbox = $('input:checkbox[data-follow-up]'),
      $selectbox = $('select');

  var showFollowup = function(control, target) {
    target.removeAttr("hidden");
    control.attr("aria-expanded", "true");
    target.find('input, select, textarea').removeAttr("disabled");
  }

  var hideFollowup = function(control, target) {
    target.attr("hidden", "");
    control.attr("aria-expanded", "false");
    target.find('input, select, textarea').attr("disabled", "true");
  };

  // Handle Radio Buttons
  $radio.change(function () {
    var name = $(this).attr("name");
    var $control = $('input:radio[name="'+ name +'"]');

    $control.each(function(){
      var target = $(this).attr('data-follow-up');
      if ($(this).is(":checked")) {
        showFollowup($control, $('#' + target));
      }
      else {
        hideFollowup($control, $('#' + target));
      }
    });
  });

  // Handle Checkboxes
  $checkbox.change(function(){
    var $control = $(this),
        target = $(this).attr('data-follow-up');
    if ($(this).is(":checked")) {
      showFollowup($control, $('#' + target));
    }
    else {
      hideFollowup($control, $('#' + target));
    }
  });

  // Handle Select Boxes
  var previous;
  $selectbox.on('click focus keydown', function(){
    previous = $(this).find(':selected').attr('data-follow-up');
  }).change(function(){
    var $control = $(this).find('option[data-follow-up]:selected'),
        selected_val = $(this).find('option[data-follow-up]:selected').val(),
        target = $(this).find(':selected').attr('data-follow-up');
    if ($(this).find(':selected').val() == selected_val) {
      showFollowup($control, $('#' + target));
    }
    if (selected_val != previous) {
      hideFollowup($control, $('#' + previous));
    }
  });

});
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
!function(a,b){"function"==typeof define&&define.amd?define([],function(){return a.svg4everybody=b()}):"object"==typeof exports?module.exports=b():a.svg4everybody=b()}(this,function(){/*! svg4everybody v2.0.0 | github.com/jonathantneal/svg4everybody */
function a(a,b){if(b){var c=!a.getAttribute("viewBox")&&b.getAttribute("viewBox"),d=document.createDocumentFragment(),e=b.cloneNode(!0);for(c&&a.setAttribute("viewBox",c);e.childNodes.length;)d.appendChild(e.firstChild);a.appendChild(d)}}function b(b){b.onreadystatechange=function(){if(4===b.readyState){var c=document.createElement("x");c.innerHTML=b.responseText,b.s.splice(0).map(function(b){a(b[0],c.querySelector("#"+b[1].replace(/(\W)/g,"\\$1")))})}},b.onreadystatechange()}function c(c){function d(){for(var c;c=e[0];){var j=c.parentNode;if(j&&/svg/i.test(j.nodeName)){var k=c.getAttribute("xlink:href");if(f&&(!g||g(k,j,c))){var l=k.split("#"),m=l[0],n=l[1];if(j.removeChild(c),m.length){var o=i[m]=i[m]||new XMLHttpRequest;o.s||(o.s=[],o.open("GET",m),o.send()),o.s.push([j,n]),b(o)}else a(j,document.getElementById(n))}}}h(d,17)}c=c||{};var e=document.getElementsByTagName("use"),f="shim"in c?c.shim:/\bEdge\/12\b|\bTrident\/[567]\b|\bVersion\/7.0 Safari\b/.test(navigator.userAgent)||(navigator.userAgent.match(/AppleWebKit\/(\d+)/)||[])[1]<537,g=c.validate,h=window.requestAnimationFrame||setTimeout,i={};f&&d()}return c});
/*

Init file for kicking things off

*/


svg4everybody();
