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
