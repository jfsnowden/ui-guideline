(function() {
    'use strict';

    angular.module('nb.common')
        .filter('visibleColumnsFilter', function() {
            return function(data, grid, query) {
                var matches = [];

                // no filter defined so bail
                if (query === undefined || query === '') {
                    return data;
                }

                query = query.toLowerCase();

                // loop through data items and visible fields searching for match
                for (var i = 0; i < data.length; i++) {
                    for (var j = 0; j < grid.columnDefs.length; j++) {
                        var dataItem = data[i];
                        var fieldName = grid.columnDefs[j].field;

                        if (typeof dataItem[fieldName] === 'object' || typeof dataItem[fieldName] === 'function' || dataItem[fieldName] === undefined) {
                            continue;
                        }
                        // as soon as search term is found, add to match and move to next dataItem
                        if (dataItem[fieldName].toString().toLowerCase().indexOf(query) > -1) {
                            matches.push(dataItem);
                            break;
                        }
                    }
                }
                return matches;
            };
        })
        .filter('selectedColumnsFilter', function() {
            return function(data, columns, query) {
                var matches = [];

                if (query === undefined || query === '') {
                    return data;
                }

                query = query.toLowerCase();

                // loop through data items and visible fields searching for match
                for (var i = 0; i < data.length; i++) {
                    for (var j = 0; j < columns.length; j++) {
                        var dataItem = data[i];
                        var fieldName = columns[j];

                        if (typeof dataItem[fieldName] === 'object' || typeof dataItem[fieldName] === 'function' || dataItem[fieldName] === undefined) {
                            break;
                        }
                        // as soon as search term is found, add to match and move to next dataItem
                        if (dataItem[fieldName].toString().toLowerCase().indexOf(query) > -1) {
                            matches.push(dataItem);
                            break;
                        }
                    }
                }
                return matches;
            };
        })
        .filter('interfaceGridColumnsFilter', function() {
            return function(data, columns, query) {
                var matches = [];

                if (query === undefined || query === '') {
                    return data;
                }

                query = query.toLowerCase();

                // loop through data items and visible fields searching for match
                for (var i = 0; i < data.length; i++) {
                    for (var j = 0; j < columns.length; j++) {
                        var dataItem = data[i];
                        var fieldName = columns[j];

                        if (typeof dataItem[fieldName] === 'function' || dataItem[fieldName] === undefined) {
                            break;
                        }

                        if (typeof dataItem[fieldName] === 'object' && angular.isDefined(dataItem[fieldName].text)) {
                            if (dataItem[fieldName].text.toLowerCase().indexOf(query) > -1) {
                                matches.push(dataItem);
                                break;
                            }
                        }

                        // as soon as search term is found, add to match and move to next dataItem
                        if (dataItem[fieldName].toString().toLowerCase().indexOf(query) > -1) {
                            matches.push(dataItem);
                            break;
                        }
                    }
                }
                return matches;
            };
        })
        .filter('findSeatedUsers', function() {
            // this filter function is designed soly for finding users among the result/subset from GetOnlineUsers query
            // that have chosen a domain.
            return function(users) {
                var matches = [];
                for (var i = 0; i < users.length; i++) {
                    var user = users[i];
                    if (user.DomainId) {
                        matches.push(user);
                    }
                }
                return matches;
            };
        });
})(NetBrain);
