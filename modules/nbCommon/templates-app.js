angular.module('templates-app', [
  'controls/nb-accordion/nb-accordion-group.tpl.html',
  'controls/nb-accordion/nb-accordion.tpl.html',
  'controls/nb-checkbox/nb-checkbox.tpl.html',
  'controls/nb-clear-button/nb-clear-button.tpl.html',
  'controls/nb-dropdown/nb-dropdown-group.tpl.html',
  'controls/nb-dropdown/nb-dropdown-option.tpl.html',
  'controls/nb-dropdown/nb-dropdown.tpl.html',
  'controls/nb-dropdown/nb-editable-dropdown.tpl.html',
  'controls/nb-filter-bar/nb-filter-bar.tpl.html',
  'controls/nb-search-bar/nb-search-bar.tpl.html',
  'controls/nb-listview/nb-listview-item.tpl.html',
  'controls/nb-loader/nb-loader.tpl.html',
  'controls/nb-popover/nb-popover.tpl.html',
  'controls/nb-segmented/nb-segmented-option.tpl.html',
  'controls/nb-segmented/nb-segmented.tpl.html',
  'controls/nb-toolbar/nb-toolbar.tpl.html'
]);

angular.module("controls/nb-accordion/nb-accordion-group.tpl.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("controls/nb-accordion/nb-accordion-group.tpl.html",
      "<div class=\"panel panel-default nb-accordion-group\" ng-class=\"{active: active}\" ng-click=\"click()\">\n" +
      "    <div class=\"panel-heading\" role=\"tab\" id=\"headingOne\" ng-click=\"clickHeader()\">\n" +
      "<!--        <i class=\"fa fa-sort-down\"></i>-->\n" +
      "    </div>\n" +
      "    <div id=\"collapseOne\" class=\"panel-collapse collapse in\" role=\"tabpanel\" aria-labelledby=\"headingOne\" ng-class=\"{oin: (active !== false)}\">\n" +
      "        <div class=\"panel-body\" ng-transclude>\n" +
      "\n" +
      "        </div>\n" +
      "    </div>\n" +
      "</div>");
}]);

angular.module("controls/nb-accordion/nb-accordion.tpl.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("controls/nb-accordion/nb-accordion.tpl.html",
      "<div class=\"panel-group nb-accordion\" role=\"tablist\" aria-multiselectable=\"true\" ng-transclude>\n" +
      "</div>");
}]);

angular.module("controls/nb-checkbox/nb-checkbox.tpl.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("controls/nb-checkbox/nb-checkbox.tpl.html",
      "<label class=\"nb-checkbox\">\n" +
      "    <input type='checkbox' ng-model=\"value\" ng-change=\"update()\">\n" +
      "    <span class=\"image\">\n" +
      "        <i class=\"fa fa-check\"></i>\n" +
      "        <i class=\"fa fa-square\"></i>\n" +
      "    </span>\n" +
      "    <span ng-transclude></span>\n" +
      "</label>");
}]);

angular.module("controls/nb-filter-bar/nb-filter-bar.tpl.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("controls/nb-filter-bar/nb-filter-bar.tpl.html",
      "<div class=\"form-group nb-filter-bar input-icon\">\n" +
      "    <input type=\"text\" class=\"form-control\" ng-model=\"inputValue\" placeholder=\"{{placeholder}}\">\n" +
      "    <div class=\"icons icon-group\">\n" +
      "        <span class=\"icon_nb_search\" ng-show=\"!ngModel.$modelValue\"></span>\n" +
      //"        <nb-clear-button ng-model=\"inputValue\"></nb-clear-button>\n" +
      "<div class=\"icon_nb_close\" ng-show=\"ngModel.$modelValue\" ng-click=\"clear()\" atag=\"filterBar:clearBtn\"/>\n" +
      "    </div>\n" +
      "</div>");
}]);

angular.module("controls/nb-search-bar/nb-search-bar.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("controls/nb-search-bar/nb-search-bar.tpl.html",
      "<div class=\"form-group nb-search-bar input-icon\">\n" +
      "    <input type=\"text\" class=\"form-control paddingRight\" ng-model=\"inputValue\" placeholder=\"{{placeholder}}\" ui-keydown=\"{enter:'onSearch()'}\">\n" +
      "    <div class=\"icons icon-group\">\n" +
      "        <span class=\"icon_nb_search\" ng-show=\"!inputValue\" ng-click=\"onSearch()\" atag=\"nbSearchBar:searchBtn\"></span>\n" +
      //"        <nb-clear-button ng-model=\"inputValue\"></nb-clear-button>\n" +
      "<div class=\"icon_nb_close\" ng-show=\"inputValue\" ng-click=\"onClear()\" atag=\"nbSearchBar:cleartBtn\"/>\n" +
      "    </div>\n" +
      "</div>");
}]);

angular.module("controls/nb-clear-button/nb-clear-button.tpl.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("controls/nb-clear-button/nb-clear-button.tpl.html",
      "<div class=\"icon_nb_close\" ng-show=\"ngModel.$modelValue\" ng-click=\"clear()\" />\n" +
      "");
}]);

angular.module("controls/nb-dropdown/nb-dropdown-group.tpl.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("controls/nb-dropdown/nb-dropdown-group.tpl.html",
      "<li class=\"nb-dropdown-group\">\n" +
      "    <div>{{nbDropdownGroupLabel}}</div>\n" +
      "    <ul ng-transclude>\n" +
      "\n" +
      "    </ul>\n" +
      "</li>");
}]);

angular.module("controls/nb-dropdown/nb-dropdown-option.tpl.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("controls/nb-dropdown/nb-dropdown-option.tpl.html",
      "<li class=\"nb-dropdown-option\" ng-disabled=\"isDisabled\">\n" +
      "    <a ng-click=\"selected($event,true)\" ng-class=\"{selected: _selected, grouped: ngDropdownGroup}\" ng-transclude ng-disabled=\"isDisabled\"></a>\n" +
      "</li>\n" +
      "");
}]);

angular.module("controls/nb-dropdown/nb-dropdown.tpl.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("controls/nb-dropdown/nb-dropdown.tpl.html",
      "<div class=\"btn-group dropdown\" ng-cloak>\n" +
      "    <button type=\"button\" class=\"btn btn-default dropdown-body dropdown-body-custom\" data-toggle=\"dropdown\" ng-disabled=\"isDisabled\" atag=\"nbDropdown:dropdownBtn\">\n" +
      "        <span ng-show=\"!option\" class=\"dropdown-placeholder\">{{nbDropdownPlaceholder || ' '}}</span>\n" +
      "        <span ng-show=\"option\" class=\"dropdown-selection\"></span>\n" +
      "    </button>\n" +
      "    <button type=\"button\" class=\"btn dropdown-toggle\" data-toggle=\"dropdown\" aria-expanded=\"false\" ng-disabled=\"isDisabled\" atag=\"nbDropdown:caretBtn\">\n" +
      "        <span class=\"caret\"></span>\n" +
      "        <span class=\"sr-only\">Toggle Dropdown</span>\n" +
      "    </button>\n" +
      "    <ul class=\"dropdown-menu dropdown-menu-custom\" uib-dropdown-menu role=\"menu\" ng-transclude atag=\"nbDropdown:memu\">\n" +
      "    </ul>\n" +
      "</div>\n" +
      "");
}]);

angular.module("controls/nb-dropdown/nb-editable-dropdown.tpl.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("controls/nb-dropdown/nb-editable-dropdown.tpl.html",
      "<div class=\"input-group dropdown\" atag=\"nbEditDropdown:dropdown\">\n" +
      "    <input type=\"{{inputType}}\" class=\"form-control dropdown-editable-input\" ng-model=\"inputValue\" placeholder=\"{{nbDropdownPlaceholder || \' \'}}\" ng-disabled=\"isDisabled\" >\n" +  //nb-validator=\"validator\"
      "    <div class=\"input-group-btn\">\n" +
      "        <button type=\"button\" class=\"btn dropdown-toggle\" data-toggle=\"dropdown\" ng-disabled=\"isDisabled\" atag=\"nbEditDropdown:caretBtn\">\n" +
      "            <span class=\"caret\"></span>\n" +
      "        </button>\n" +
      "        <ul class=\"dropdown-menu dropdown-editable-menu\" uib-dropdown-menu role=\"menu\" ng-transclude atag=\"nbEditDropdown:memu\">\n" +
      "        </ul>\n" +
      "    </div>\n" +
      "</div>\n" +
      "");
}]);

angular.module("controls/nb-listview/nb-listview-item.tpl.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("controls/nb-listview/nb-listview-item.tpl.html",
      "<button class=\"ng-listview-item\" ng-click=\"click()\" ng-class=\"{selected: selected()}\" ng-transclude>\n" +
      "\n" +
      "</button>");
}]);

angular.module("controls/nb-loader/nb-loader.tpl.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("controls/nb-loader/nb-loader.tpl.html",
      "<div class=\"head\" />\n" +
      "<div class=\"circle\" />\n" +
      "");
}]);

angular.module("controls/nb-popover/nb-popover.tpl.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("controls/nb-popover/nb-popover.tpl.html",
      "<div class=\"popover nb-popover\" role=\"tooltip\">\n" +
      "  <div class=\"arrow\"></div>\n" +
      "  <div style=\"position:relative;\">\n" +
      "    <div class=\"handles\">\n" +
      "      <div dir=\"t\" draggable=\"true\" ></div>\n" +
      "      <div dir=\"b\" draggable=\"true\" ></div>\n" +
      "      <div dir=\"l\" draggable=\"true\" ></div>\n" +
      "      <div dir=\"r\" draggable=\"true\" ></div>\n" +
      "    </div>\n" +
      "    <div class=\"popover-content\" ng-transclude></div>\n" +
      "  </div>\n" +
      "</div>");
}]);

angular.module("controls/nb-segmented/nb-segmented-option.tpl.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("controls/nb-segmented/nb-segmented-option.tpl.html",
      "<button class=\"btn nb-segmented-option\" ng-click=\"selected(true)\" ng-class=\"{selected: selected()}\">\n" +
      "    <span class=\"outer\" ng-style=\"style\">\n" +
      "        <span class=\"inner\" ng-transclude></span>\n" +
      "    </span>\n" +
      "</button>\n" +
      "");
}]);

angular.module("controls/nb-segmented/nb-segmented.tpl.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("controls/nb-segmented/nb-segmented.tpl.html",
      "<div class=\"nb-segmented btn-group\" role=\"group\" ng-transclude>\n" +
      "</div>");
}]);

angular.module("controls/nb-toolbar/nb-toolbar.tpl.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("controls/nb-toolbar/nb-toolbar.tpl.html",
      "<button class=\"btn multi-select\" type=\"button\" data-toggle=\"button\" aria-pressed=\"false\" autocomplete=\"off\">\n" +
      "    <img src=\"assets/img/Multiselect_Button_20x20.png\"/>\n" +
      "</button>\n" +
      "<nb-divider></nb-divider>\n" +
      "<button class=\"btn fit-to-window\" type=\"button\">\n" +
      "    <img src=\"assets/img/Fit_To_Window_Button_20x20.png\"/>\n" +
      "</button>\n" +
      "<nb-divider></nb-divider>\n" +
      "<button class=\"btn zoom-in\" type=\"button\" ng-click=\"zoomIn();\" ng-disabled=\"data.zoom===data.max\">\n" +
      "    <i class=\"glyphicon glyphicon-plus\"></i>\n" +
      "</button>\n" +
      "<div ui-slider=\"{orientation: 'vertical', range: 'min'}\" min=\"{{data.min}}\" max=\"{{data.max}}\" step=\"1\" ng-model=\"data.zoom\"></div>\n" +
      "<button class=\"btn zoom-out\" type=\"button\" ng-click=\"zoomOut();\" ng-disabled=\"data.zoom===data.min\">\n" +
      "    <i class=\"glyphicon glyphicon-minus\"></i>\n" +
      "</button>\n" +
      "<div class=\"pct-readout\">{{data.zoom}}%</div>\n" +
      "");
}]);
