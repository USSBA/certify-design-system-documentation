





if (typeof jQuery=="undefined") { console.warn("Certify Design System requires jQuery.")};
var certifyDesignSystem = true;
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define("priorityNav", factory(root));
    } else if (typeof exports === "object") {
        module.exports = factory(root);
    } else {
        root.priorityNav = factory(root);
    }
})(window || this, function (root) {

    "use strict";

    /**
     * Variables
     */
    var priorityNav = {}; // Object for public APIs
    var breaks = []; // Object to store instances with breakpoints where the instances menu item"s didin"t fit.
    var supports = !!document.querySelector && !!root.addEventListener; // Feature test
    var settings = {};
    var instance = 0;
    var count = 0;
    var mainNavWrapper, totalWidth, restWidth, mainNav, navDropdown, navDropdownToggle, dropDownWidth, toggleWrapper;
    var viewportWidth = 0;

    /**
     * Default settings
     * @type {{initClass: string, navDropdown: string, navDropdownToggle: string, mainNavWrapper: string, moved: Function, movedBack: Function}}
     */
    var defaults = {
        initClass:                  "js-priorityNav", // Class that will be printed on html element to allow conditional css styling.
        mainNavWrapper:             "nav", // mainnav wrapper selector (must be direct parent from mainNav)
        mainNav:                    "ul", // mainnav selector. (must be inline-block)
        navDropdownClassName:       "nav__dropdown", // class used for the dropdown.
        navDropdownToggleClassName: "nav__dropdown-toggle", // class used for the dropdown toggle.
        navDropdownLabel:           "more", // Text that is used for the dropdown toggle.
        navDropdownBreakpointLabel: "menu", //button label for navDropdownToggle when the breakPoint is reached.
        breakPoint:                 500, //amount of pixels when all menu items should be moved to dropdown to simulate a mobile menu
        throttleDelay:              50, // this will throttle the calculating logic on resize because i'm a responsible dev.
        offsetPixels:               0, // increase to decrease the time it takes to move an item.
        count:                      true, // prints the amount of items are moved to the attribute data-count to style with css counter.

        //Callbacks
        moved: function () {
        },
        movedBack: function () {
        }
    };


    /**
     * A simple forEach() implementation for Arrays, Objects and NodeLists
     * @private
     * @param {Array|Object|NodeList} collection Collection of items to iterate
     * @param {Function} callback Callback function for each iteration
     * @param {Array|Object|NodeList} scope Object/NodeList/Array that forEach is iterating over (aka `this`)
     */
    var forEach = function (collection, callback, scope) {
        if (Object.prototype.toString.call(collection) === "[object Object]") {
            for (var prop in collection) {
                if (Object.prototype.hasOwnProperty.call(collection, prop)) {
                    callback.call(scope, collection[prop], prop, collection);
                }
            }
        } else {
            for (var i = 0, len = collection.length; i < len; i++) {
                callback.call(scope, collection[i], i, collection);
            }
        }
    };


    /**
     * Get the closest matching element up the DOM tree
     * @param {Element} elem Starting element
     * @param {String} selector Selector to match against (class, ID, or data attribute)
     * @return {Boolean|Element} Returns false if not match found
     */
    var getClosest = function (elem, selector) {
        var firstChar = selector.charAt(0);
        for (; elem && elem !== document; elem = elem.parentNode) {
            if (firstChar === ".") {
                if (elem.classList.contains(selector.substr(1))) {
                    return elem;
                }
            } else if (firstChar === "#") {
                if (elem.id === selector.substr(1)) {
                    return elem;
                }
            } else if (firstChar === "[") {
                if (elem.hasAttribute(selector.substr(1, selector.length - 2))) {
                    return elem;
                }
            }
        }
        return false;
    };


    /**
     * Merge defaults with user options
     * @private
     * @param {Object} defaults Default settings
     * @param {Object} options User options
     * @returns {Object} Merged values of defaults and options
     */
    var extend = function (defaults, options) {
        var extended = {};
        forEach(defaults, function (value, prop) {
            extended[prop] = defaults[prop];
        });
        forEach(options, function (value, prop) {
            extended[prop] = options[prop];
        });
        return extended;
    };


    /**
     * Debounced resize to throttle execution
     * @param func
     * @param wait
     * @param immediate
     * @returns {Function}
     */
    function debounce(func, wait, immediate) {
        var timeout;
        return function () {
            var context = this, args = arguments;
            var later = function () {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }


    /**
     * Toggle class on element
     * @param el
     * @param className
     */
    var toggleClass = function (el, className) {
        if (el.classList) {
            el.classList.toggle(className);
        } else {
            var classes = el.className.split(" ");
            var existingIndex = classes.indexOf(className);

            if (existingIndex >= 0)
                classes.splice(existingIndex, 1); else
                classes.push(className);

            el.className = classes.join(" ");
        }
    };


    /**
     * Check if dropdown menu is already on page before creating it
     * @param mainNavWrapper
     */
    var prepareHtml = function (_this, settings) {

        /**
         * Create dropdow menu
         * @type {HTMLElement}
         */
        toggleWrapper = document.createElement("span");
        navDropdown = document.createElement("ul");
        navDropdownToggle = document.createElement("button");

        /**
         * Set label for dropdown toggle
         * @type {string}
         */
        navDropdownToggle.innerHTML = settings.navDropdownLabel;

        /**
         * Set aria attributes for accessibility
         */
        navDropdownToggle.setAttribute("aria-controls", "menu");
        navDropdownToggle.setAttribute("type", "button");
        navDropdown.setAttribute("aria-hidden", "true");


        /**
         * Move elements to the right spot
         */
        if(_this.querySelector(mainNav).parentNode !== _this){
            console.warn("mainNav is not a direct child of mainNavWrapper, double check please");
            return;
        }

        _this.insertAfter(toggleWrapper, _this.querySelector(mainNav));

        toggleWrapper.appendChild(navDropdownToggle);
        toggleWrapper.appendChild(navDropdown);

        /**
         * Add classes so we can target elements
         */
        navDropdown.classList.add(settings.navDropdownClassName);
        navDropdown.classList.add("priority-nav__dropdown");

        navDropdownToggle.classList.add(settings.navDropdownToggleClassName);
        navDropdownToggle.classList.add("priority-nav__dropdown-toggle");

        //fix so button is type="button" and do not submit forms
        navDropdownToggle.setAttribute("type", "button");

        toggleWrapper.classList.add(settings.navDropdownClassName+"-wrapper");
        toggleWrapper.classList.add("priority-nav__wrapper");

        _this.classList.add("priority-nav");
    };


    /**
     * Get innerwidth without padding
     * @param element
     * @returns {number}
     */
    var getElementContentWidth = function(element) {
        var styles = window.getComputedStyle(element);
        var padding = parseFloat(styles.paddingLeft) +
            parseFloat(styles.paddingRight);

        return element.clientWidth - padding;
    };


    /**
     * Get viewport size
     * @returns {{width: number, height: number}}
     */
    var viewportSize = function() {
        var doc = document, w = window;
        var docEl = (doc.compatMode && doc.compatMode === "CSS1Compat")?
            doc.documentElement: doc.body;

        var width = docEl.clientWidth;
        var height = docEl.clientHeight;

        // mobile zoomed in?
        if ( w.innerWidth && width > w.innerWidth ) {
            width = w.innerWidth;
            height = w.innerHeight;
        }

        return {width: width, height: height};
    };


    /**
     * Get width
     * @param elem
     * @returns {number}
     */
    var calculateWidths = function (_this) {
        totalWidth = getElementContentWidth(_this);
        //Check if parent is the navwrapper before calculating its width
        if (_this.querySelector(navDropdown).parentNode === _this) {
            dropDownWidth = _this.querySelector(navDropdown).offsetWidth;
        } else {
            dropDownWidth = 0;
        }
        restWidth = getChildrenWidth(_this) + settings.offsetPixels;
        viewportWidth = viewportSize().width;
    };


    /**
     * Move item to array
     * @param item
     */
    priorityNav.doesItFit = function (_this) {

        /**
         * Check if it is the first run
         */
        var delay = _this.getAttribute("instance") === 0 ? delay : settings.throttleDelay;

        /**
         * Increase instance
         */
        instance++;

        /**
         * Debounced execution of the main logic
         */
        (debounce(function () {

            /**
             * Get the current element"s instance
             * @type {string}
             */
            var identifier = _this.getAttribute("instance");

            /**
             * Update width
             */
            calculateWidths(_this);

            /**
             * Keep executing until all menu items that are overflowing are moved
             */
            while (totalWidth <= restWidth  && _this.querySelector(mainNav).children.length > 0 || viewportWidth < settings.breakPoint && _this.querySelector(mainNav).children.length > 0) {
                //move item to dropdown
                priorityNav.toDropdown(_this, identifier);
                //recalculate widths
                calculateWidths(_this, identifier);
                //update dropdownToggle label
                if(viewportWidth < settings.breakPoint) updateLabel(_this, identifier, settings.navDropdownBreakpointLabel);
            }

            /**
             * Keep executing until all menu items that are able to move back are moved
             */
            while (totalWidth >= breaks[identifier][breaks[identifier].length - 1] && viewportWidth > settings.breakPoint) {
                //move item to menu
                priorityNav.toMenu(_this, identifier);
                //update dropdownToggle label
                if(viewportWidth > settings.breakPoint) updateLabel(_this, identifier, settings.navDropdownLabel);
            }

            /**
             * If there are no items in dropdown hide dropdown
             */
            if (breaks[identifier].length < 1) {
                _this.querySelector(navDropdown).classList.remove("show");
                //show navDropdownLabel
                updateLabel(_this, identifier, settings.navDropdownLabel);
            }

            /**
             * If there are no items in menu
             */
            if (_this.querySelector(mainNav).children.length < 1) {
                //show navDropdownBreakpointLabel
                _this.classList.add("is-empty");
                updateLabel(_this, identifier, settings.navDropdownBreakpointLabel);
            }else{
                _this.classList.remove("is-empty");
            }

            /**
             * Check if we need to show toggle menu button
             */
            showToggle(_this, identifier);

        }, delay ))();
    };


    /**
     * Show/hide toggle button
     */
    var showToggle = function (_this, identifier) {
        if (breaks[identifier].length < 1) {
            _this.querySelector(navDropdownToggle).classList.add("priority-nav-is-hidden");
            _this.querySelector(navDropdownToggle).classList.remove("priority-nav-is-visible");
            _this.classList.remove("priority-nav-has-dropdown");

            /**
             * Set aria attributes for accessibility
             */
            _this.querySelector(".priority-nav__wrapper").setAttribute("aria-haspopup", "false");

        } else {
            _this.querySelector(navDropdownToggle).classList.add("priority-nav-is-visible");
            _this.querySelector(navDropdownToggle).classList.remove("priority-nav-is-hidden");
            _this.classList.add("priority-nav-has-dropdown");

            /**
             * Set aria attributes for accessibility
             */
            _this.querySelector(".priority-nav__wrapper").setAttribute("aria-haspopup", "true");
        }
    };


    /**
     * Update count on dropdown toggle button
     */
    var updateCount = function (_this, identifier) {
        _this.querySelector(navDropdownToggle).setAttribute("priorityNav-count", breaks[identifier].length);
    };

    var updateLabel = function(_this, identifier, label){
        _this.querySelector(navDropdownToggle).innerHTML = label;
    };


    /**
     * Move item to dropdown
     */
    priorityNav.toDropdown = function (_this, identifier) {


        /**
         * move last child of navigation menu to dropdown
         */
        if (_this.querySelector(navDropdown).firstChild && _this.querySelector(mainNav).children.length > 0) {
            _this.querySelector(navDropdown).insertBefore(_this.querySelector(mainNav).lastElementChild, _this.querySelector(navDropdown).firstChild);
        } else if (_this.querySelector(mainNav).children.length > 0) {
            _this.querySelector(navDropdown).appendChild(_this.querySelector(mainNav).lastElementChild);
        }

        /**
         * store breakpoints
         */
        breaks[identifier].push(restWidth);

        /**
         * check if we need to show toggle menu button
         */
        showToggle(_this, identifier);

        /**
         * update count on dropdown toggle button
         */
        if (_this.querySelector(mainNav).children.length > 0 && settings.count) {
            updateCount(_this, identifier);
        }

        /**
         * If item has been moved to dropdown trigger the callback
         */
        settings.moved();
    };


    /**
     * Move item to menu
     */
    priorityNav.toMenu = function (_this, identifier) {

        /**
         * move last child of navigation menu to dropdown
         */
        if (_this.querySelector(navDropdown).children.length > 0) _this.querySelector(mainNav).appendChild(_this.querySelector(navDropdown).firstElementChild);

        /**
         * remove last breakpoint
         */
        breaks[identifier].pop();

        /**
         * Check if we need to show toggle menu button
         */
        showToggle(_this, identifier);

        /**
         * update count on dropdown toggle button
         */
        if (_this.querySelector(mainNav).children.length > 0 && settings.count) {
            updateCount(_this, identifier);
        }

        /**
         * If item has been moved back to the main menu trigger the callback
         */
        settings.movedBack();
    };


    /**
     * Count width of children and return the value
     * @param e
     */
    var getChildrenWidth = function (e) {
        var children = e.childNodes;
        var sum = 0;
        for (var i = 0; i < children.length; i++) {
            if (children[i].nodeType !== 3) {
                if(!isNaN(children[i].offsetWidth)){
                    sum += children[i].offsetWidth;
                }

            }
        }
        return sum;
    };



    /**
     * Bind eventlisteners
     */
    var listeners = function (_this, settings) {

        // Check if an item needs to move
        if(window.attachEvent) {
            window.attachEvent("onresize", function() {
                if(priorityNav.doesItFit)priorityNav.doesItFit(_this);
            });
        }
        else if(window.addEventListener) {
            window.addEventListener("resize", function() {
                if(priorityNav.doesItFit)priorityNav.doesItFit(_this);
            }, true);
        }

        // Toggle dropdown
        _this.querySelector(navDropdownToggle).addEventListener("click", function () {
            toggleClass(_this.querySelector(navDropdown), "show");
            toggleClass(this, "is-open");
            toggleClass(_this, "is-open");

            /**
             * Toggle aria hidden for accessibility
             */
            if(-1 !== _this.className.indexOf( "is-open" )){
                _this.querySelector(navDropdown).setAttribute("aria-hidden", "false");
            }else{
                _this.querySelector(navDropdown).setAttribute("aria-hidden", "true");
                _this.querySelector(navDropdown).blur();
            }
        });

        /*
         * Remove when clicked outside dropdown
         */
        document.addEventListener("click", function (event) {
            if (!getClosest(event.target, "."+settings.navDropdownClassName) && event.target !== _this.querySelector(navDropdownToggle)) {
                _this.querySelector(navDropdown).classList.remove("show");
                _this.querySelector(navDropdownToggle).classList.remove("is-open");
                _this.classList.remove("is-open");
            }
        });

        /**
         * Remove when escape key is pressed
         */
        document.onkeydown = function (evt) {
            evt = evt || window.event;
            if (evt.keyCode === 27) {
                document.querySelector(navDropdown).classList.remove("show");
                document.querySelector(navDropdownToggle).classList.remove("is-open");
                mainNavWrapper.classList.remove("is-open");
            }
        };
    };


    /**
     * Remove function
     */
    Element.prototype.remove = function() {
        this.parentElement.removeChild(this);
    };

    /*global HTMLCollection */
    NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
        for(var i = 0, len = this.length; i < len; i++) {
            if(this[i] && this[i].parentElement) {
                this[i].parentElement.removeChild(this[i]);
            }
        }
    };


    /**
     * Destroy the current initialization.
     * @public
     */
    priorityNav.destroy = function () {
        // If plugin isn"t already initialized, stop
        if (!settings) return;
        // Remove feedback class
        document.documentElement.classList.remove(settings.initClass);
        // Remove toggle
        toggleWrapper.remove();
        // Remove settings
        settings = null;
        delete priorityNav.init;
        delete priorityNav.doesItFit;
    };


    /**
     * insertAfter function
     * @param n
     * @param r
     */
    if (supports && typeof Node !== "undefined"){
        Node.prototype.insertAfter = function(n,r) {this.insertBefore(n,r.nextSibling);};
    }

    var checkForSymbols = function(string){
        var firstChar = string.charAt(0);
        if (firstChar === "." || firstChar === "#") {
            return false;
        }else{
            return true;
        }
    };


    /**
     * Initialize Plugin
     * @public
     * @param {Object} options User settings
     */
    priorityNav.init = function (options) {

        /**
         * Merge user options with defaults
         * @type {Object}
         */
        settings = extend(defaults, options || {});

        // Feature test.
        if (!supports && typeof Node === "undefined"){
            console.warn("This browser doesn't support priorityNav");
            return;
        }

        // Options check
        if (!checkForSymbols(settings.navDropdownClassName) || !checkForSymbols(settings.navDropdownToggleClassName)){
            console.warn("No symbols allowed in navDropdownClassName & navDropdownToggleClassName. These are not selectors.");
            return;
        }

        /**
         * Store nodes
         * @type {NodeList}
         */
        var elements = document.querySelectorAll(settings.mainNavWrapper);

        /**
         * Loop over every instance and reference _this
         */
        forEach(elements, function(_this){

            /**
             * Create breaks array
             * @type {number}
             */
            breaks[count] = [];

            /**
             * Set the instance number as data attribute
             */
            _this.setAttribute("instance", count++);

            /**
             * Store the wrapper element
             */
            mainNavWrapper = _this;
            if (!mainNavWrapper) {
                console.warn("couldn't find the specified mainNavWrapper element");
                return;
            }

            /**
             * Store the menu elementStore the menu element
             */
            mainNav = settings.mainNav;
            if (!_this.querySelector(mainNav)) {
                console.warn("couldn't find the specified mainNav element");
                return;
            }

            /**
             * Check if we need to create the dropdown elements
             */
            prepareHtml(_this, settings);

            /**
             * Store the dropdown element
             */
            navDropdown = "."+settings.navDropdownClassName;
            if (!_this.querySelector(navDropdown)) {
                console.warn("couldn't find the specified navDropdown element");
                return;
            }

            /**
             * Store the dropdown toggle element
             */
            navDropdownToggle = "."+settings.navDropdownToggleClassName;
            if (!_this.querySelector(navDropdownToggle)) {
                console.warn("couldn't find the specified navDropdownToggle element");
                return;
            }

            /**
             * Event listeners
             */
            listeners(_this, settings);

            /**
             * Start first check
             */
            priorityNav.doesItFit(_this);

        });

        /**
         * Count amount of instances
         */
        instance++;

        /**
         * Add class to HTML element to activate conditional CSS
         */
        document.documentElement.classList.add(settings.initClass);
    };


    /**
     * Public APIs
     */
    return priorityNav;

});
/**
 * jQuery UI Calendar picker
 *
 * Usage:
 * Works on any <input class="js-calendar">
 *
 */


$(document).ready(function(){
  var $calendar_picker = $( ".js-calendar-picker" );

  if ($calendar_picker.length > 0) {
    $calendar_picker.datepicker({
      beforeShow: function( input, inst){
        $(inst.dpDiv).addClass('sba-c-calendar-picker');
      },
      dateFormat: 'mm/dd/yy',
      onSelect: function(date) {
        $(this).trigger("blur")
      },
      changeYear: true
    });
  }
});
$(document).ready(function(){

  // Toggle cards to show/hide details
  var $doc_toggle = $('.sba-c-card__toggle'),
      active_class = 'is-activated',
      hidden_attribute = 'hidden';

  $doc_toggle.on('click', function() {

    // Determine which document we clicked on
    toggle = $(this)
    elem = $(this).attr("aria-controls")

    var $target = $("#" + elem);


    if ( toggle.attr('aria-expanded') === 'false' ) {
      toggle
        .attr("aria-expanded","true")
          .addClass(active_class);
      $target.removeAttr(hidden_attribute);
    } else {
      toggle
        .attr("aria-expanded","false")
          .removeClass(active_class);
      $target.attr(hidden_attribute, "");
    }
  });

});
$(function() {

  if (typeof jQuery.ui !== 'undefined'){
        $.widget( "custom.combobox", {
          _create: function() {
            this.wrapper = $( "<span>" )
              .addClass( "sba-c-combobox__wrapper" )
              .insertAfter( this.element );

            this.element.hide();
            this._createAutocomplete();
            this._createShowAllButton();
          },

          _createAutocomplete: function() {
            var selected = this.element.children( ":selected" ),
              value = selected.val() ? selected.text() : "";

            this.input = $( "<input>" )
              .appendTo( this.wrapper )
              .val( value )
              .attr({
                title: "",
                "aria-label": "Start typing to filter",
                "id": "combobox_" + this.element[0].id,
                "name": "combobox_" + this.element[0].name,
                "placeholder": "Start typing…",
                "required": this.element[0].required
              })
              .addClass( "sba-c-combobox__input ui-widget ui-widget-content ui-state-default ui-corner-left sba-c-input" )
              .autocomplete({
                delay: 0,
                minLength: 0,
                source: $.proxy( this, "_source" )
              })
              //.tooltip({
              //  classes: {
              //    "ui-tooltip": "ui-state-highlight"
              //  }
              //})
              ;

            this._on( this.input, {
              autocompleteselect: function( event, ui ) {
                ui.item.option.selected = true;
                this._trigger( "select", event, {
                  item: ui.item.option
                });
              },

              autocompletechange: "_removeIfInvalid"
            });
          },

          _createShowAllButton: function() {
            var input = this.input,
              wasOpen = false;

            $( "<a>" )
              .attr( "tabIndex", -1 )
              .attr( "title", "Show All Items" )
              //.tooltip()
              .appendTo( this.wrapper )
              .button({
                text: false,
                label: "Show options"
              })
              .removeClass( "ui-corner-all" )
              .addClass( "sba-c-combobox__toggle ui-corner-right" )
              .on( "mousedown", function() {
                wasOpen = input.autocomplete( "widget" ).is( ":visible" );
              })
              .on( "click", function() {
                input.trigger( "focus" );

                // Close if already visible
                if ( wasOpen ) {
                  return;
                }

                // Pass empty string as value to search for, displaying all results
                input.autocomplete( "search", "" );
              });
          },

          _source: function( request, response ) {
            var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
            response( this.element.children( "option" ).map(function() {
              var text = $( this ).text();
              if ( this.value && ( !request.term || matcher.test(text) ) )
                return {
                  label: text,
                  value: text,
                  option: this
                };
            }) );
          },

          _removeIfInvalid: function( event, ui ) {

            // Selected an item, nothing to do
            if ( ui.item ) {
              return;
            }

            // Search for a match (case-insensitive)
            var value = this.input.val(),
              valueLowerCase = value.toLowerCase(),
              valid = false;
            this.element.children( "option" ).each(function() {
              if ( $( this ).text().toLowerCase() === valueLowerCase ) {
                this.selected = valid = true;
                return false;
              }
            });

            // Found a match, nothing to do
            if ( valid ) {
              return;
            }

            // Remove invalid value
            this.input
              .val( "" )
              .attr( "title", value + " didn't match any item" )
              //.tooltip( "open" );
            this.element.val( "" );
            this._delay(function() {
              this.input.tooltip( "close" ).attr( "title", "" );
            }, 12500 );
            this.input.autocomplete( "instance" ).term = "";
          },

          _destroy: function() {
            this.wrapper.remove();
            this.element.show();
          }
        });

        $.extend($.ui.autocomplete.prototype.options, {
          open: function(event, ui) {
            $(this).autocomplete("widget").addClass("sba-c-autosuggest").css({
                    "width": ($(this).width() + "px")
                });
            }
        });
      }
  });
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
        return v.length == 2 && i < 2 ? v + '/' : v;
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
          }).join('/');
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
window.CDS = {
  docUpload: function (){
    // Variables
    var $doc_upload_toggle = $('.sba-c-doc-upload__toggle'),
        $doc_upload_use_toggle = $('.sba-c-doc-upload__use-toggle'),
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

    // Function for handling previously uploaded custom docs
    $doc_upload_use_toggle.on('click', function() {
      elem = $(this).attr("aria-controls");
      var $container = $(this).parent().parent();
      var $cancel = $('button[aria-controls=' + elem + '-cancel]');
      var $target = $("#" + elem);

      // Toggle next step
      $container.toggle();
      $target.toggle();

      // Toggle cancel
      $cancel.on('click', function() {
        if ( $container.is(':visible') == false ){
          $container.toggle();
          $target.toggle();
        }
      })
    });
  }
}

$(document).ready( CDS.docUpload );
$(document).ready(function() {
  var $editable_table = $('.sba-c-table--editable'),
      $add_button = $editable_table.next('[id$="_add_item"]');
      var previous_values = [];

      if (typeof $editable_table.attr('id') !== 'undefined' &&      $editable_table.attr('id') !== null) {
        var textarea_id = $editable_table.attr('id').replace('_table', '').replace('_', '[').replace('_', '][') + ']';
        var current_table_data = $("textarea[id='" + textarea_id + "']").text();
        if(current_table_data=="") {
          var row_data = {}
        } else {
          var row_data = JSON.parse(current_table_data);
        }
      }

      var itemID;

      var getItemID = function(e){
        if (typeof e.attr('id') != "undefined") {
          itemID = "#" + e.attr('id').replace('_edit','').replace('_delete','').replace('_save','').replace('_cancel','');
        }
      };

      var closeTaskPanels = function(){
        // Clase the task panels
        $('.sba-c-task-panel__toggle').attr("aria-expanded", "false");
        $('.sba-c-task-panel__content').removeClass('visible');
        $('.sba-c-task-panel__toggle').attr("disabled", "");
      };


      var numberWithCommas = function(number) {
          var parts = number.toString().split(".");
          parts[0] = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
          return parts.join(".");
      };

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

          var textarea_id = $editable_table.attr('id').replace('_table','').replace('_','[').replace('_','][')+']';
          data = JSON.parse($("textarea[id='"+textarea_id+"']").val());
          delete data[itemID.replace('#','')];

          new_row_data = {};
          var row = 1;
          $.each(data, function(key, value) {
            var split_array = key.split('_');
            var old_row_num = split_array[split_array.length - 1];
            var new_column_data = {};

            $.each(value, function(key2, value) {
              new_inner_key = key2.replace(old_row_num,'tr'+row);
              new_column_data[new_inner_key] = value;

              new_outer_key = key.replace(old_row_num,'tr'+row);
              new_row_data[new_outer_key] = new_column_data;
            });
            row+=1
          });

          $("textarea[id='"+textarea_id+"']").text(JSON.stringify(new_row_data));
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

           // create dictionary to hold saved data
           var column_data = {};

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
             column_data[input_id.replace('#','')] = initial_val;
             new_values.push([input_id, initial_val]);
           });

           row_data[itemID.replace('#','')] = column_data;

           // add row data to store
           $("textarea[id='"+textarea_id+"']").text(JSON.stringify(row_data));


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
$(document).ready(function() {
  var $parent_facet = $('.sba-c-facet-set input[type="checkbox"][data-follow-up]'),
      $child_facet = $parent_facet.siblings('.sba-c-follow-up').find('input[type="checkbox"]'),
      indeterminate_class = "sba-c-checkbox--indeterminate";


  // Check for applying 'indeterminate' class
  $child_facet.on('change', function() {
    var $the_parent = $(this).closest('.sba-c-follow-up').prevAll('input[type="checkbox"]'),
        $the_siblings = $the_parent.siblings('.sba-c-follow-up').find('input[type="checkbox"]'),
        $the_siblings_checked = $the_siblings.filter(':checked');

    if ( ($the_siblings_checked.length > 0) && ($the_siblings_checked.length < $the_siblings.length)) {
      $the_parent.addClass(indeterminate_class);
    }
    else {
      $the_parent.removeClass(indeterminate_class);
    }
  });

  // Uncheck all children if a parent is unchecked
  $parent_facet.on('change',function(){
    var $these_children = $(this).siblings('.sba-c-follow-up').find('input[type="checkbox"]');
    if ($(this).prop('checked') == false ) {
      $these_children.prop('checked', false);
    }
    $(this).removeClass(indeterminate_class);
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
    previous = $(this).find(':selected').attr('data-followup');
  }).change(function(){
    var $control = $(this).find('option[data-followup]:selected'),
        selected_val = $(this).find('option[data-followup]:selected').val(),
        target = $(this).find(':selected').attr('data-followup');
    if ($(this).find(':selected').val() == selected_val) {
      showFollowup($control, $('#' + target));
    }
    if (selected_val != previous) {
      hideFollowup($control, $('#' + previous));
    }
  });
  
});
$(function() {

  var $notifications_button = $('.sba-js-notifications-toggle'),
      $search_button = $('.sba-js-search-button'),
      $search_input = $('#topnav_search_query'),
      $menu_button = $('#mobile_menu_button'),
      $close_button = $('#close_menu_button'),
      $search_box = $('#topnav-search'),
      $notifications_box = $('#topnav-notifications-drawer'),
      $notifications_drawer = $('.sba-c-top-nav__notifications-drawer__list'),
      $nav_open_button = $('.sba-c-mobile-header__button'),
      $nav_close_button = $('.sba-c-topnav__close'),
      $nav = $('#top_navigation'),
      visible_class = 'is-visible';

  // Functions
  var hideItems = function($button, $box){
    $button.attr('aria-expanded', 'false');
    $box.attr("hidden", "").addClass(visible_class);
  };

  var setFocus = function($this, $target){
    if ($this.attr('aria-expanded') == "false") {
      setTimeout(function(){
        $target.focus();
      }, 50);
    }
  }

  // Notification button
  $notifications_button.on('click', function(){
    // Removes the notification pip
    $('.sba-js-notifications-pip').remove();

    // Hide search if open
    hideItems($search_button, $search_box);

    // Focus on first link
    setFocus($(this), $notifications_drawer);
    return false;
  });

  // Search button options
  $search_button.on('click', function(){

    // Hide the notificiations drawer if open
    hideItems($notifications_button, $notifications_box);

    // Set focus when opening up the search box
    setFocus($(this), $search_input);

    return false;

  });

  // Nav open and close
  $nav_open_button.on('click', function(){
    $nav.addClass(visible_class);
    hideItems($search_button, $search_box);
    hideItems($notifications_button, $notifications_box);
  });

  $nav_close_button.on('click', function(){
    $nav.removeClass(visible_class);
    hideItems($search_button, $search_box);
    hideItems($notifications_button, $notifications_box);
  });

  // Toggle Menu on mobile
  $menu_button.on('click', function(){
    $close_button.focus();
  });

  $close_button.on('click', function(){
    $menu_button.focus();
  });
});
$(document).ready(function(){
  var popupScrollPosition = 0;

  $('.new-popup').on('click', function(){
    $('.sba-c-popup').addClass('visible');
    document.getElementById("popup").scrollTop = 0;
    return false;
  });

  $('.sba-c-popup__toggle').on('click', function(){
    var popup = document.getElementById("popup");
    if ($('.sba-c-popup__contents').hasClass('hidden')){
      $('.sba-c-popup__contents').toggleClass('hidden');
      popup.scrollTop = popupScrollPosition;
    }
    else {
      popupScrollPosition =  popup.scrollTop;
      $('.sba-c-popup__contents').toggleClass('hidden');
    }
    return false;
  });

  $('#sba-c-popup-close').on('click', function(){
    $('.sba-c-popup').removeClass('visible');
    $('.sba-c-popup__contents').removeClass('hidden');
    return false;
  });

});
/**
 * Initiate priorityNav
 *
 * Uses priority-nav.js
 */


$(function() {
  var wrapper = document.querySelector(".sba-js-priority-nav-tabs");
  var nav = priorityNav.init({
      mainNavWrapper: ".sba-js-priority-nav-tabs",
      breakPoint: 0,
      throttleDelay: '50'
  });
});
/**
 * Tabs
 *
 */


$(function() {
  // Define Variables
  var $tabset = $('.sba-js-tabs'),
      $tab_button = $('.sba-js-tabs .sba-c-tabs__link'),
      $tab_content = $('.sba-c-tabs__tab-content'),
      current_class= 'current',
      visible_class = 'is-visible',
      tabset_prefix = 'tabset';

  // Create tab functionality
  $tabset.each(function(i, el) {
    el = $(el);
    tabset_id = tabset_prefix + i;

    // Assign id to tabset
    el.attr('id', tabset_id);

    var $tab_box = el.find($tab_content),
        $tabs = el.find($tab_button);

    // Assign unique ID to each tab content box
    $tab_box.each(function(i, el){
      el = $(el);
      el.attr('id', tabset_id + "_tab" + i);
    });

    // Create tab controls
    $tabs.each(function(i, el){
      el = $(el);
      el
        .attr('aria-controls', tabset_id + "_tab" + i)
        .attr('aria-expanded', 'false');
    });

    // Make first tab content visisble
    $tab_box
      .eq(0)
      .addClass(visible_class);

    // Add current class and aria-expanded="true" to first tab
    $tabs
      .eq(0)
      .attr('aria-expanded', 'true')
      .addClass(current_class);
  });

  // Click actions for tab
  $tab_button.on('click', function(){
    // Define variables within current tabset
    var $this_tabset = $(this).closest($tabset),
        $this_tabsets_tabs = $($this_tabset).find($tab_button),
        this_tabs_content_id = "#" + $(this).attr('aria-controls'),
        $this_tabs_content = $(this_tabs_content_id);

    // Deactivate all tabs in current tabset
    $this_tabsets_tabs
      .removeClass(current_class)
      .attr('aria-expanded', 'false');
    $this_tabset
      .find($tab_content)
      .removeClass(visible_class);

    // Activate current tab
    $(this)
      .addClass(current_class)
      .attr('aria-expanded', 'true');

    // Show tab content
    $this_tabs_content.addClass(visible_class);

    return false;
  });

});
$(document).ready(function(){
  // Variables
  var $task_panel_toggle = $('.sba-c-task-panel__toggle'),
      $task_panel = $('.sba-c-task-panel');

  // Check if there are tabs and supply modifier class
  if ( $('.sba-c-task-panel .sba-c-tabs-wrapper').length ) {
    console.log($(this).id);
    $(this).addClass = ('sba-c-task-panel--has-tabs');
  }

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

      // Check if has tabs to add has tabs class
      if ($target.find($('.sba-c-tabs-wrapper')).length) {
        $target.addClass('sba-c-task-panel__content--has-tabs');
      }

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
  var $trigger = $('.sba-js-visibility-trigger'),
      visible_class = "is-visible";

  $trigger.on('click', function(){
    var target = "#" + $(this).attr('aria-controls');
    if ($(this).attr("aria-expanded") === "false" ) {
      $(this).attr("aria-expanded", "true");
      $(target).removeAttr("hidden").addClass(visible_class);
    }
    else {
      $(this).attr("aria-expanded", "false");
      $(target).attr("hidden", "").removeClass(visible_class);
    }
    return false;
  });
});
// Tooltips

$(function() {

  var tooltip = 'data-tooltip-text',
      $element_with_tooltip = $('[' + tooltip + ']'),
      transition_class = 'transition';

  // Create Tooltip
  var createToolTip = function(){
    $element_with_tooltip.each(function(){
      var $tooltip_id = "tooltip" + (Math.floor(Math.random()*90000) + 10000),
          tooltip_text = $(this).attr(tooltip);
      $(this).attr({
        "aria-describedby": $tooltip_id,
        tabindex: "0"
      })
        .wrap('<span class="sba-c-tooltip-wrapper"></span>')
        .after('<span class="sba-c-tooltip" id="' + $tooltip_id + '" aria-hidden="true" aria-role="tooltip">' + tooltip_text + '</span>')
        .addClass('sba-c-tooltip-toggle');
    });
  };

  var toggleTooltip = function(){
    $element_with_tooltip.on('mouseenter focus', function(){
      var $e = $(this).next();
      $e.attr('aria-hidden', 'false');
      setTimeout(function(){
        $e.addClass(transition_class);
      }, 20);

    });

    $element_with_tooltip.on('mouseleave blur', function(){
      var $e = $(this).next();
      $e.removeClass(transition_class).attr('aria-hidden', 'true');
    });
  }


  createToolTip();
  toggleTooltip();

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
