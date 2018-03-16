(function (netBrain) {
    'use strict';
    angular.module('nb.common')
    .directive('nbSelectUserEmail', [function () {
        return {
            restrict: 'E',
            templateUrl: 'modules/nbCommon/views/nbSelectUserEmailDirective.html',
            scope: {
                selectedUser: '=',
                isRequired: '='

            },
            link: function(scope, element, attrs) {

            },
            controller: ['$scope', '$element', '$attrs', '$timeout', '$document', 'nb.admin.httpSystemAdminSrvc', 'nb.ng.userSrvc',
                function ($scope, element, attr, $timeout, $document, httpSystemAdminSrvc, userSrvc) {
                    $scope.invalidUser = false;
                    $scope.dropDownOpendFlagCollaboration = false;
                    $scope.searchText = "";
                    $scope.currentSelectedList = [];
                    $('body').click(function () {
                        element.find('.share_map_to_user_list').removeClass('open');
                    });
                    element.find('.inputShareEmail').change(function () {
                        checkInput();
                        var shareUserStr = $scope.shareUser.trim();
                        var selectedUserNameList = shareUserStr.split(';');
                        $scope.selectedUser = [];
                        _.each(selectedUserNameList, function(item) {
                            var valiedUser = _.find($scope.personList, function (person) {
                                return person.name === item.trim();
                            });
                            if (valiedUser) {
                                $scope.selectedUser.push({ userId: valiedUser.ID, userName: valiedUser.name });
                            }
                        });
                        //if (selectedUserNameList.length > 0) {
                        //    var invalidList = [];
                        //    for (var j = 0; j < selectedUserNameList.length; j++) {
                        //        if (selectedUserNameList[j] === "") continue;
                        //        var arr = _.filter($scope.personList,
                        //            function(person) {
                        //                return person.name === selectedUserNameList[j].trim() ||
                        //                    selectedUserNameList[j].trim() === person.email;
                        //            });
                        //        var emailRegex = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/;
                        //        var currentUserName = selectedUserNameList[j].trim();
                        //        if (arr.length === 0 && currentUserName !== "" && !emailRegex.test(currentUserName)) {
                        //            invalidList.push(currentUserName);
                        //        }
                        //    }
                        //}
                    });
                    if ($scope.isRequired) {
                        element.find('.inputShareEmail').attr("required");
                    }
                    $scope.localpersonList = [];
                    $scope.personList = [];
                    $scope.shareUser = "";
                    var initCtrl = function () {

                        httpSystemAdminSrvc.getAllUsers().then(function (objList) {
                            httpSystemAdminSrvc.getAllDisplayUsersOnDomain().then(function (obAllUser) {
                                for (var l = 0; l < objList.length; l++) {
                                    for (var m = 0; m < obAllUser.length; m++) {
                                        if (objList[l].ID === obAllUser[m].userId&&objList[l].ID != userSrvc.getUserID()) {
                                            $scope.personList.push(objList[l]);
                                        }
                                    }
                                }
                                for (var n = 0; n < $scope.personList.length; n++) {
                                    $scope.personList[n].strfilterCol1 = "";
                                    $scope.personList[n].strfilterCol2 = "";
                                    $scope.personList[n].strName1 = $scope.personList[n].name;
                                    $scope.personList[n].strName2 = "";
                                    $scope.personList[n].strEmail1 = $scope.personList[n].email;
                                    $scope.personList[n].strEmail2 = "";
                                }
                                $scope.localpersonList = angular.copy($scope.personList);
                            })
                        });
                        $scope.selectedUser = $scope.selectedUser || [];//需要从外面获取
                        var selectedUserNames = _.pluck($scope.selectedUser, "userName");
                        $scope.shareUser = selectedUserNames.join("; ");
                        if ($scope.shareUser.trim()) {
                            $scope.shareUser = $scope.shareUser.trim() + ";";
                        }

                        $scope.$on("$destroy", function handleDestroyEvent() {
                            $document.context.removeEventListener('keydown', keyboardSupport, false);
                        });
                        $document.context.addEventListener('keydown', keyboardSupport, false);

                    };

                    function keyboardSupport(e) {
                        if (!element.find('.inputShareEmail').parent().hasClass('open')) {
                            return;
                        }
                        var filterList = getFilterList();
                        var l = filterList.length;
                        switch (e.keyCode) {
                            case 38:
                                if (l > 0) {
                                    if ($scope.selectedIndex === 0 || $scope.selectedIndex === 1) {
                                        $scope.selectedIndex = l;
                                    } else {
                                        $scope.selectedIndex--;
                                    }
                                    changeSelect(true);
                                }
                                break;
                            case 40:
                                if (l > 0) {
                                    if ($scope.selectedIndex === l) {
                                        $scope.selectedIndex = 1;
                                    } else {
                                        $scope.selectedIndex++;
                                    }
                                    changeSelect(false);
                                }
                                break;
                            case 13:
                                if ($scope.selectedIndex > 0) {
                                    var p = filterList[$scope.selectedIndex - 1];
                                    if (element.find('.inputShareEmail').parent().hasClass('open')) {
                                        selectUser(p);
                                    }
                                    $scope.selectedIndex = 0;
                                }

                                break;
                            default:
                                break;
                        }

                    }

                    function getFilterList() {
                        var text = $scope.dropDownOpendFlagCollaboration ? $scope.searchText :  '';
                        var nameEmailList = $scope.dropDownOpendFlagCollaboration ? $scope.shareUser : '';

                        if (text === '') {
                            return $scope.localpersonList;
                        }
                        return _.filter($scope.localpersonList, function (person) {
                            return $scope.isUserShow(person, text, nameEmailList);
                        });
                    }

                    $scope.selectedIndex = 0;

                    function changeSelect(isScrollTop) {
                        if ($scope.selectedIndex !== 0) {
                            clearSelected();
                            addSelectedStatus($(".shareDropdown ul li:nth-child(" + $scope.selectedIndex + ")"));
                            $(".shareDropdown ul li:nth-child(" + $scope.selectedIndex + ")")[0].scrollIntoViewIfNeeded(isScrollTop);
                        }
                    }

                    function clearSelected() {
                        _.each($scope.currentSelectedList, function (p) {
                            p.removeClass("selected");
                        });
                        $scope.currentSelectedList = [];
                    }

                    function addSelectedStatus(ele) {
                        ele.addClass("selected");
                        $scope.currentSelectedList.push(ele);
                    }


                    $scope.eventShareMapStopPropagation = function ($event) {
                        $event.stopPropagation();
                    };

                    $scope.shareUserClick = function ($event, person) {
                        selectUser(person);
                        element.find('.inputShareEmail').focus();
                        $event.stopPropagation();
                    };

                    function checkInput() {
                        $timeout(function () {
                            if (!element.find('.inputShareEmail').val() && $scope.isRequired) {
                                element.find('.inputShareEmail').addClass("ng-invalid-required");
                            } else {
                                element.find('.inputShareEmail').removeClass("ng-invalid-required");
                            }
                        }, 300);

                    }

                    function selectUser(person) {
                        var personName = person.name;
                        if ($scope.shareUser && $scope.shareUser.length > 0) {

                            if ($scope.shareUser.lastIndexOf(';') >= 0) {
                                $scope.shareUser = $scope.shareUser.substr(0, $scope.shareUser.lastIndexOf(';') + 1);
                            } else {
                                $scope.shareUser = "";
                            }
                        }
                        if (!$scope.shareUser) {
                            $scope.shareUser = personName + ";";
                        } else {
                            $scope.shareUser = $scope.shareUser + " "+personName + ";";
                        }
                        $scope.selectedUser.push({ userId: person.ID, userName: person.name });
                        checkInput();
                    }


                    $scope.$watch('shareUser', function (newValue, oldValue, scope) {
                        $scope.selectedIndex = 0;
                        clearSelected();
                        if (newValue) {
                            var selectedUserStr=_.pluck($scope.selectedUser,'userName').join("; ");
                            if (selectedUserStr.trim()) {
                               selectedUserStr = selectedUserStr + ";";
                            }
                            var lastItem = newValue.replace(selectedUserStr,'');                       
                            $scope.searchText = lastItem.toLocaleLowerCase();
                            if (lastItem) {
                                $scope.dropDownOpendFlagCollaboration = true;
                            }
                        } else {
                            $scope.searchText = "";
                        }
                    });

                    $scope.isUserShow = function (person, searchText) {
                        var searchResult = searchText.trim() === '' || person.name.toLocaleLowerCase().indexOf(searchText) >= 0 || person.email.toLocaleLowerCase().indexOf(searchText) >= 0;
                        if ($scope.selectedUser.length === 0) {
                            return searchResult;
                        }
                        var existSelected = _.some($scope.selectedUser, function (ne) {
                            return ne.userName.trim().toLowerCase() === person.name.trim().toLowerCase() || ne.userName.trim().toLowerCase() === person.email.trim().toLowerCase();
                        });
                        return searchResult && !existSelected;
                    }

                    $scope.toggleBubbleDropDown = function () {
                        $scope.selectedIndex = 0;
                        clearSelected();
                    };


                    $scope.inputShareEmailMouseDown = function () {

                    };


                    $timeout(function () {
                        initCtrl();
                    }, 100);
                    
            }]
        }
    }]);

})(NetBrain);
