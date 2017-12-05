$(document).ready(function() {
  var $editable_table = $('.sba-c-table--editable'),
      $edit_button = $editable_table.find('[id$="_edit"]'),
      $delete_button = $editable_table.find('[id$="_delete"]'),
      $cancel_button = $editable_table.find('[id$="_cancel"]'),
      $save_button = $editable_table.find('[id$="_save"]'),
      $add_button = $editable_table.next('[id$="_add_item"]'),
      visible_class = "is-visible";
      var previous_values = [];
      var itemID;

      var $task_panel_toggle = $('.sba-c-task-panel-toggle'),
          $task_panel_content = $('.sba-c-task-panel-content');

      var getItemID = function(e){
        if (typeof e.attr('id') != "undefined") {
          itemID = "#" + e.attr('id').replace('_edit','').replace('_delete','').replace('_save','');
        }
      }

      $editable_table.on('click', '[id$="_edit"]', function(e){
        e.stopPropagation();
        getItemID($(e.target));

        // Hide the task bar
        $task_panel_toggle.attr("aria-expanded", "false");
        $task_panel_content.removeClass('visible');

        // Hide data row
        $(itemID + "_data").attr("hidden", "");

        // Show fields
        $(itemID + "_fields").addClass(visible_class).find('input:first').focus();

        // Store data from fieldset
        previous_values = [];
        $(itemID + "_fields").find('input').each(function(){
          input_id = "#" + $(this).attr('id');
          initial_val = $(this).val();
          previous_values.push([input_id, initial_val]);
        });

        // Update data in fields
        return false;
      });

      $editable_table.on('click', '[id$="_delete"]', function(e){
        e.stopPropagation();
        getItemID($(e.target));
        var confirmed = confirm('Are you sure you want to delete this item?');
        if (confirmed) {
          $(itemID + "_data").remove();
        }
        return false;
      });

      // Save button
      $editable_table.on('click', '[id$="_save"]', function(e){
        e.stopPropagation();
        getItemID($(e.target));
        new_values = [];
        $(itemID + "_fields").find('input').each(function(){
          input_id = "#" + $(this).attr('id');
          initial_val = $(this).val();
          new_values.push([input_id, initial_val]);
        });

        // Update the values
        for (var i = 0; i < new_values.length; i++)
        {
          $(new_values[i][0] + "_text").text(new_values[i][1]);
        }


        // Show the data row
        $(itemID + "_data").removeAttr("hidden");

        // Hide fields
        $(itemID + "_fields").removeClass(visible_class);

        return false;
      });


      // Cancel Button
      $editable_table.on('click', '[id$="_cancel"]', function(e){
        e.stopPropagation();
        // Reset the values
        for (var i = 0; i < previous_values.length; i++)
        {
          $(previous_values[i][0]).val(previous_values[i][1]);
        }

        // Show the data row
        $(itemID + "_data").removeAttr("hidden");

        // Hide fields
        $(itemID + "_fields").removeClass(visible_class);

        return false;
      });

      $add_button.on('click', function(){
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
          row_id_arr.push(0);
        }

        // Hide the null row
        $(table).find('tbody tr[id$="_null"]').attr("hidden", "");

        // Get next ID number and number of rows needed
        var next_id = Math.max.apply(Math,row_id_arr) + 1,
            table_cols = $(table).find('thead tr th').length,
            row_name = table_name + '_tr' + next_id,
            data_row_id = row_name + '_data';
            fields_row_id = row_name + '_fields';
            fields_row_id = row_name + '_fields';

        // Add new table rows
        $(table).find('tbody')
          .append('<tr class="is-added" id="' + data_row_id + '" hidden></tr>')
          .append('<tr class="sba-c-table--editable__fields is-visible" id="' + fields_row_id + '"></tr>');

        for (var i = 0; i < table_cols; i++) {
          var data_header_text = $(table).find('thead tr th:nth-child(' + (i + 1) + ')').text();
          if (i == 0) {
            $("#" + data_row_id).append('<th scope="row" id="' + row_name + '_field' + (i + 1) + '_text" data-table-header="' + data_header_text + '"></th>');
            //$("#" + fields_row_id).append('<th>d</th>');
          }
          else if (i == (table_cols - 1)) {
            $("#" + data_row_id).append('<td data-table-header="' +  data_header_text + '" ><div class="sba-c-task-panel"><button type="button" class="usa-button-unstyled sba-c-task-panel-toggle" aria-expanded="false" aria-controls="sba-c-task-panel'+ i +'">actions</button><div id="sba-c-task-panel'+ i +'" class="sba-c-task-panel-content"><ul class="sba-c-task-panel-menu"><li class="sba-c-task-panel-menu__item"><a href="#" class="sba-c-task-panel-menu__link" id="'+ row_name +'_edit" aria-controls="'+ fields_row_id +'" aria-expanded="false">Edit this item</a></li><li class="sba-c-task-panel-menu__item"><a href="#" class="sba-c-task-panel-menu__link--emergency" id="'+ row_name +'_delete">Delete</a></li></ul></div></div></td>');
          }
          else {
            $("#" + data_row_id).append('<td id="' + row_name + '_field' + (i + 1) + '_text" data-table-header="' +  data_header_text + '" ></td>');
          }
        }

        // Add the form fieldset
        $("#" + fields_row_id).append('<td colspan="' + table_cols + '"><ul class="sba-c-field-list"></ul><div class="sba-c-table--editable__actions"><button id="'+ row_name +'_save" class="sba-c-button">OK</button><a id="' + row_name + '_cancel"  href="#">Cancel</a></div>');
        for (var i = 0; i < table_cols - 1; i++) {
          var label_text = $(table).find('thead tr th:nth-child(' + (i + 1) + ')').text();
          var field_id = table_name + '_tr' + next_id + '_field' + (i + 1);
          $("#" + fields_row_id + " td ul").append('<li><label for="' + field_id + '">' + label_text + '</label><input id="' + field_id + '" type="text"></li>');
        }
        return false;
      });

      $editable_table.on('click', 'tr.is-added .sba-c-task-panel-toggle', function(e){
        toggler = $(e.target);
        window.toggle_task_panels(toggler);
      });
});
