$(document).ready(function() {

  var $editable_table = $('.sba-c-table--editable'),
      $edit_button = $editable_table.find('[id$="_edit"]'),
      $delete_button = $editable_table.find('[id$="_delete"]'),
      visible_class = "is-visible";

      var getItemID = function(e){
        // Extracts the numeric ID from each fields
        itemID = e.attr('id').match(/\d+/).toString();
      }

      $edit_button.on('click', function(){
        getItemID($(this));

        // Hide data row
        $('#tr' + itemID + "_data").attr("hidden", "");

        // Show fields
        $('#tr' + itemID + "_fields").addClass(visible_class);

        // Store data from fieldset

        // Update data in fields
        return false;
      });

      $delete_button.on('click', function(){
        getItemID($(this));
        var confirmed = confirm('Are you sure you want to delete this item?');
        if (confirmed) {
          $('#tr' + itemID + '_data, #tr' + itemID + '_fields').remove();
        }
        return false;
      });
});
