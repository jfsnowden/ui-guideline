(function() {
    angular.module('nb.common').filter('nbGridDefaultSearch', NbGridDefaultSearch);

    angular.module('nb.common').filter('nbGridDefaultFilter', NbGridDefaultFilter);

    angular.module('nb.common').filter('nbGridHighlighter', NbGridHighlighter);

    angular.module('nb.common').filter('nbHighlighterWord', NbHighlighterWord);

    function NbGridDefaultSearch() {
        return function(rows, query, targetKeys) {
            if (query === undefined || query === '') {
                angular.forEach(rows, function(row) {
                    if (!row.visible) {
                        row.clearThisRowInvisible('filter', false);
                    }
                });
                return rows;
            }

            query = query.toLowerCase();

            for (var i = 0; i < rows.length; i++) {
                var entity = angular.copy(rows[i].entity);
                var keys = targetKeys || Object.keys(entity);
                for (var j = 0; j < keys.length; j++) {
                    var dataItem = entity[keys[j]];

                    if (typeof dataItem === 'object' || typeof dataItem === 'function' || dataItem === undefined) {
                        continue;
                    }
                    if (dataItem.toString().toLowerCase().indexOf(query) > -1) {
                        rows[i].clearThisRowInvisible('filter', false);
                        break;
                    } else {
                        rows[i].setThisRowInvisible('filter', false);
                        continue;
                    }
                }
            }
            return rows;
        };
    }

    function NbGridDefaultFilter() {
        return function(rows, query, grid) {
            if (query === undefined || query === '') {
                _.each(rows, function(row) {
                    if (!row.visible) {
                        row.clearThisRowInvisible('filter', false);
                    }
                });
                return rows;
            }

            query = query.toLowerCase();

            var nonCustomizedCols = _.chain(grid.options.columnDefs)
                .filter(function(col) {
                    return !col.isCustomizedTemplate;
                })
                .map(function(col) {
                    return col.field;
                })
                .value();

            _.each(rows, function(row) {
                var entity = angular.copy(row.entity);
                var keys = Object.keys(entity);
                for (var j = 0; j < keys.length; j++) {
                    if (nonCustomizedCols.indexOf(keys[j]) < 0) {
                        continue;
                    } else {
                        var dataItem = entity[keys[j]];

                        if (typeof dataItem === 'object' || typeof dataItem === 'function' || dataItem === undefined) {
                            continue;
                        }

                        if (dataItem.toString().toLowerCase().indexOf(query) > -1) {
                            row.clearThisRowInvisible('filter', false);
                            break;
                        } else {
                            row.setThisRowInvisible('filter', false);
                        }
                    }
                }
            });

            return rows;
        };
    }

    NbGridHighlighter.$inject = ['$sce'];

    function NbGridHighlighter($sce) {
        return function(text, phrase) {
            if (!text) return '';
            if (phrase && phrase !== '') {
                phrase = phrase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                return $sce.trustAsHtml(
                    text.toString().replace(new RegExp('(' + phrase + ')', 'gi'), '<span class="filter-highlight">$1</span>')
                );
            }

            return $sce.trustAsHtml(text.toString());
        };
    }

    NbHighlighterWord.$inject = ['$sce'];

    function NbHighlighterWord($sce) {
        return function(text, phrase) {
            if (!text) return '';
            if (phrase && phrase !== '') {
                phrase = phrase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                return $sce.trustAsHtml(
                    text.toString().replace(new RegExp('(\\b' + phrase.split(' ').join('\\b|\\b') + '\\b)', 'gi'), '<span class="filter-highlight">$1</span>')
                );
            }

            return $sce.trustAsHtml(text.toString());
        };
    }
})(NetBrain);
