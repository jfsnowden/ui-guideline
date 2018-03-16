/* global ace */
(function() {
    'use strict';

    angular.module('nb.common').directive('nbAceSearch', nbAceSearchDirective);
    angular.module('nb.common').controller('nb.common.nbAceSearchController', nbAceSearchController);

    nbAceSearchDirective.$inject = []; // '$compile'

    function nbAceSearchDirective() { // $compile
        return {
            restrict: 'A',
            scope: {
                searchOptions: '=nbAceSearch',
                model: '=ngModel'
            },
            replace: true,
            transclude: true,
            compile: compile,
            controller: 'nb.common.nbAceSearchController'
        };

        function compile() {
            return {
                post: function() { // scope, element, attr, ctrl

                }
            };
        }
    }

    nbAceSearchController.$inject = ['$scope'];

    function nbAceSearchController($scope) {
        var markers = [];
        var searchResults = [];
        var currentSearchIndex = -1;
        var editor = function() { return getValueOrFuncValue($scope.searchOptions.editor); };
        var highlightAll = $scope.searchOptions.highlightAllWhenNext || false;

        var aceFindAll = function(needle, options) { // , additive
            options = options || {};
            options.needle = needle || options.needle || '';
            if (options.needle === undefined) {
                var range = editor().session.selection.isEmpty() ?
                    editor().session.selection.getWordRange() :
                    editor().session.selection.getRange();
                options.needle = editor().session.getTextRange(range);
            }
            var Search = ace.require('./search').Search;
            var search = new Search();
            search.set(options);
            var ranges = search.findAll(editor().session);
            return ranges;
        };

        var clearMarkers = function() {
            markers.forEach(function(item) {
                editor().session.removeMarker(item);
            });
            markers = [];
        };

        var showSearchItem = function(item, isCurrent, index) {
            var marker;
            if (isCurrent) {
                marker = editor().session.addMarker(item, 'filter-highlight-current position-absolute', 'text', false);
            } else {
                marker = editor().session.addMarker(item, 'filter-highlight position-absolute', 'text', false);
            }
            if (index === undefined) {
                markers.push(marker);
            } else {
                markers[index] = marker;
            }
        };

        var showNextSearch = function(next) {
            if (searchResults.length === 0) return;
            if (searchResults.length === 1 && !highlightAll) {
                editor().scrollToLine(searchResults[0].end.row, true);
                return;
            }

            var lastIndex = currentSearchIndex;
            if (next) {
                currentSearchIndex++;
                if (searchResults.length <= currentSearchIndex) {
                    currentSearchIndex = 0;
                }
            } else {
                currentSearchIndex--;
                if (currentSearchIndex < 0) {
                    currentSearchIndex = searchResults.length - 1;
                }
            }

            var item = searchResults[currentSearchIndex];
            if (!highlightAll) {
                clearMarkers();
                showSearchItem(item);
            } else {
                if (lastIndex >= 0 && lastIndex < markers.length) {
                    editor().session.removeMarker(markers[lastIndex]);
                    showSearchItem(searchResults[lastIndex], false, lastIndex);
                }

                editor().session.removeMarker(markers[currentSearchIndex]);
                showSearchItem(item, true, currentSearchIndex);
            }
            editor().scrollToLine(item.end.row, true);
        };

        var clearAll = function() {
            clearMarkers();
            searchResults = [];
            currentSearchIndex = -1;
        };

        var findAll = function() {
            clearMarkers();
            currentSearchIndex = -1;
            var Range = ace.require('ace/range').Range;
            searchResults = aceFindAll(getValueOrFuncValue($scope.searchOptions.filterText), {
                start: new Range(0, 0, -1, -1),
                wholeWord: getValueOrFuncValue($scope.searchOptions.matchWholeWord)
            });
            searchResults.forEach(function(item) {
                showSearchItem(item);
            });
            if (searchResults.length > 0) {
                editor().scrollToLine(searchResults[0].end.row, true);
            }

            if ($scope.searchOptions.onFilterResult) {
                $scope.searchOptions.onFilterResult(searchResults);
            }
        };

        var findNext = function() {
            showNextSearch(true);
        };

        var findPrevious = function() {
            showNextSearch(false);
        };

        var onWatchValueChanged = function(newValues, oldValues) {
            if (newValues[0] === oldValues[0] && newValues[1] === oldValues[1] && newValues[2] === oldValues[2]) {
                return;
            }
            if (newValues[0] && newValues[1]) {
                findAll();
            } else {
                clearAll();
            }
        };

        function getValueOrFuncValue(vorf) {
            if (vorf && typeof vorf === 'function') {
                return vorf();
            }
            return vorf;
        }

        var dewatch = $scope.$parent.$watchGroup(
            [function() { return getValueOrFuncValue($scope.model); },
                function() { return getValueOrFuncValue($scope.searchOptions.filterText); },
                function() { return getValueOrFuncValue($scope.searchOptions.matchWholeWord); }
            ],
            onWatchValueChanged);

        $scope.$on('$destroy', function() {
            dewatch();
        });

        if ($scope.searchOptions.onload) {
            $scope.searchOptions.onload({
                findAll: findAll,
                findNext: findNext,
                clearAll: clearAll,
                findPrevious: findPrevious
            });
        }
    }
})(NetBrain);
