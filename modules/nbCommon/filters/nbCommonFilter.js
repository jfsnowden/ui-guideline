(function (netBrain) {
    'use strict';

    angular.module('nb.common')
        .filter('nbHighlight', [
            '$sce', function($sce) {
                return function(text, phrase) {

                    var escapeChar = function(str) {
                        var array = [['(&)', '&amp;'], ['(<)', '&lt;']];
                        var ret = str;
                        array.forEach(function(item) {
                            ret = ret.replace(new RegExp(item[0], 'gi'), item[1]);
                        });
                        return ret;
                    };

                    if (text === null || text === undefined) return;
                    text = text.toString();
                    if (phrase) { // highlight all occurrances
                        phrase = phrase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                        //ENG-19207
                        var regexp = (new RegExp('(' + phrase + ')', 'gi'));
                        var array = [];
                        var result;
                        while (result = regexp.exec(text)) {
                            result.lastIndex = regexp.lastIndex;
                            array.push({ startIndex: result.index, endIndex: regexp.lastIndex });
                        }

                        if (array.length > 0) {
                            var lastEndIndex = 0;
                            var textReuslt = "";
                            for (var i = 0; i < array.length; i++) {

                                if (array[i].startIndex != lastEndIndex)
                                    textReuslt += escapeChar(text.substring(lastEndIndex, array[i].startIndex));
                                textReuslt += '<span class="filter-highlight">' + escapeChar(text.substring(array[i].startIndex, array[i].endIndex)) + '</span>';
                                lastEndIndex = array[i].endIndex;
                                if (i === array.length - 1 && array[i].endIndex != text.length) {
                                    textReuslt += escapeChar(text.substring(array[i].endIndex));
                                }
                            }

                            text = textReuslt;
                        } else {
                            text = escapeChar(text);
                        }
                    } else {
                        //ENG-19207
                        text = escapeChar(text);
                    }

                    return $sce.trustAsHtml(text)
                }
            }
        ])
        .filter('nbHighlightAndKeepWhitespace', [
            '$sce', function($sce) {
                return function(text, phrase) {
                    if (!text) return;
                    if (phrase) {
                        phrase = phrase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                        text = text.replace(new RegExp('(' + phrase + ')', 'gi'), '<span class="filter-highlight">$1</span>');
                    }
                    text = text.replace(/  /g, '&nbsp;&nbsp;');

                    return $sce.trustAsHtml(text)
                }
            }
        ])
        .filter('nbHighlightMapBased', [
            '$sce', function($sce) {
                return function(text, phrase) {
                    if (!text) return;
                    if (phrase) { // highlight all occurrances
                        phrase = phrase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                        var strs = phrase.split(/\s+/);
                        var pattern = new RegExp('(' + strs.join("\\S*\\s+") + ')', 'gi');
                        text = text.replace(pattern, '<span class="filter-highlight">$1</span>');
                    }
                    return $sce.trustAsHtml(text)
                }
            }
        ])
        .filter('nbHighlightOnlyOne', [
            '$sce', function($sce) {
                return function(text, phrase) {
                    if (!text) return;
                    if (phrase) { // only highlight the first and only occurrance
                        phrase = phrase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                        text = text.replace(new RegExp('(' + phrase + ')', 'i'), '<span class="filter-highlight">$1</span>');
                    }


                    return $sce.trustAsHtml(text)
                }
            }
        ])
        .filter('nbHighlightEx', [
            '$sce', 'nb.ng.utilitySrvc', function($sce, util) {
                return function(text, phrase, ipsInSubnet) {
                    if (!text || !phrase) return;

                    var escapedPhrase = phrase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                    var subPhrases = escapedPhrase.match(/(?:[^\s,|"]+|"[^"]*")+/g);
                    //fix ENG-9905
                    var escapedText = text.replace(/[-\/\\^$*+?.()[\]{}]/g, '\\$&');
                    var subText = (text || '').split(',');

                    function isHighlight(filterStr, text) {
                        var lowerFilterStr = filterStr.toLowerCase();
                        if (text.toLowerCase().indexOf(lowerFilterStr) >= 0)
                            return true;
                        var notHighlightArray = ['mgmt', 'vendor', 'model'];
                        for (var i = 0; i < notHighlightArray.length; i++) {
                            if (lowerFilterStr.indexOf(notHighlightArray[i]) >= 0)
                                return false;
                        }
                        return !/:$/.test(filterStr);
                    }

                    subPhrases = _.sortBy(subPhrases, function(item) {
                        return item.length * -1;
                    });
                    _.each(subText, function(text, index) {
                        if (ipsInSubnet && ipsInSubnet.length > 0 && util.isIpOrIpMask(text)) {
                            var ip = text.split('/')[0];
                            var exist = ipsInSubnet.indexOf(ip) > -1;
                            if (exist)
                                subPhrases = subPhrases.concat([ip]);
                        }

                        _.each(subPhrases, function(subPhrase) {
                            ////fix ENG-9905
                            if (subPhrase != undefined && subPhrase !== " " && isHighlight(subPhrase, escapedText)) {

                                if (/^".*"$/.test(subPhrase)) {
                                    subPhrase = subPhrase.replace(/\"/g, '');
                                }

                                //fix ENG-9905
                                //subPhrase = subPhrase.replace("\\^", '');
                                //subPhrase = subPhrase.replace("\\$", '');

                                var startToken = subPhrase.substr(0, 2);
                                if (startToken == "\\^") {
                                    subPhrase = subPhrase.substr(2);
                                }
                                var endToken = subPhrase.substr(subPhrase.length - 2, 2);
                                if (endToken == "\\$") {
                                    subPhrase = subPhrase.substr(0, subPhrase.length - 2);
                                }

                                subPhrase = subPhrase.replace("\"", '');

                                text = text.replace(
                                    new RegExp('(' + subPhrase + ')', 'gi'),
                                    '<span class="$class">$1</span>'
                                );
                            }
                        });

                        text = text.replace(/\$class/gi, 'filter-highlight');
                        subText[index] = text;
                    });

                    return $sce.trustAsHtml(subText.join(' ,'));
                }
            }
        ])
        .filter("nbSortTableBy", [
            function() {
                return function(items, columnNameIndex, reverse) {
                    var filtered = [];
                    angular.forEach(items, function(item) {
                        filtered.push(item);
                    });
                    filtered.sort(function(a, b) {
                        return (a.rowData[columnNameIndex] > b.rowData[columnNameIndex] ? 1 : -1);
                    });
                    if (reverse) filtered.reverse();
                    return filtered;
                }
            }
        ])
        .filter("nbPropsFilter", [
            function() {
                return function(items, props) {
                    var out = [];
                    if (angular.isArray(items)) {
                        var keys = Object.keys(props);
                        items.forEach(function(item) {
                            var itemMatches = false;
                            for (var i = 0; i < keys.length; i++) {
                                var prop = keys[i];
                                var text = props[prop].toLowerCase();
                                if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                                    itemMatches = true;
                                    break;
                                }
                            }
                            if (itemMatches) {
                                out.push(item);
                            }
                        });
                    } else {
                        out = items;
                    }
                    return out;
                };
            }
        ])
        .filter("validateEmail", [
            function() {
                return function(value) {
                    var _regexp = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
                    return _.isEmpty(value) || _regexp.test(value);
                }
            }
        ])
        .filter('textAreaValueToHtmlKeepWhiteSpace', [
            '$sce', function($sce) {
                return function(input) {
                    if (!input) return '';
                    input = input.replace(/\n/g, '<br>');
                    input = input.replace(/ /g, '&nbsp;');
                    return $sce.trustAsHtml(input);
                }
            }
        ]).filter('nbFormatAndHighlight', [
            '$sce', function($sce) {
                return function(text, phrase) {
                    var txt;
                    if (angular.isString(text) || angular.isNumber(text))
                        txt = String(text);
                    if (text === undefined || text === null)
                        txt = '';
                    var strPhrase = (phrase) ? phrase.trim().replace(/([\*\.\?\+\$\^\[\]\(\)\{\}\|\\])/g, function(c) { //()^$|\*.?+[]{}
                        return '\\' + c;
                    }) : null;
                    if (strPhrase)
                        txt = txt.replace(new RegExp('(' + strPhrase + ')', 'gi'),
                            '\n1span style="background-color: yellow; color: black;"\n2$1\n1/span\n2').replace(/(<|>|&)/g, function(char) {
                            switch (char) {
                            case '<':
                                return '&lt;';
                            case '>':
                                return '&gt;';
                            case '&':
                                return '&amp;';
                            default:
                                return char;
                            }
                        }).replace(/(\n1|\n2)/g, function(str) {
                            switch (str) {
                            case '\n1':
                                return '<';
                            case '\n2':
                                return '>';
                            default:
                                return str;
                            }
                        })
                    else
                        txt = txt.replace(/(<|>|&)/g, function(char) {
                            switch (char) {
                            case '<':
                                return '&lt;';
                            case '>':
                                return '&gt;';
                            case '&':
                                return '&amp;';
                            default:
                                return char;
                            }
                        })
                    return $sce.trustAsHtml(txt)
                }
            }
        ]).filter('parseDate', [
            function() {
                return function(strValue) {
                    return strValue ?
                        (
                            angular.isDate(strValue) ?
                                strValue :
                                new Date(strValue)
                        ) :
                        strValue;
                }
            }
        ])
        .filter('fileSizeUnit', function () {
            return function (size) {
                var sizeUnit;
                if (size > 1024) {
                    var sizeK = Math.round(size / 1024);
                    if (sizeK > 1024) {
                        var sizeM = Math.round(size / 1024 / 1024);
                        if (sizeM > 1024) {
                            var sizeG = Math.round(size / 1024 / 1024 / 1024);
                            if (sizeG > 1024) {
                                sizeUnit = Math.round(size / 1024 / 1024 / 1024 / 1024) + "T";
                            } else {
                                sizeUnit = sizeG + "G";
                            }
                        } else {
                            sizeUnit = sizeM + "M";
                        }
                    } else {
                        sizeUnit = sizeK + "K";
                    }
                } else {
                    sizeUnit = size + "B";
                }
                return sizeUnit;
            };
        })
    ;


})(NetBrain);