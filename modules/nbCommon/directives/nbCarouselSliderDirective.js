/**
 * Created by Marko Cen on 10/2/2015.
 */
;
(function(netBrain) {
    'use strict';

    angular.module('nb.common').directive('nbCarouselSliderDirective', nbCarouselSliderDirective);

    nbCarouselSliderDirective.$inject = ['$timeout'];

    function nbCarouselSliderDirective($timeout) {

        var directive = {
            restrict: 'A',
            scope: {},
            transclude: true,
            template:
                    '<div class="slider-backward-btn">' +
                        '<i class="icon-lg" ng-click="callSliding(\'back\')"></i>' +
                    '</div>' +
                    '<div class="sliding-area" ng-transclude></div>' +
                    '<div class="slider-forward-btn">' +
                        '<i class="icon-lg" ng-click="callSliding(\'forward\')"></i>' +
                    '</div>',

            compile: compile
        };

        function compile() {
            return {
                pre: function() {},
                post: function(scope, element, attr) {

                    $timeout(function () {
                        var pluswidth = '0';
                        if (attr.hasOwnProperty('pluswidth')) {
                            pluswidth = attr.pluswidth;
                        }
                        initSlidingArea(element, attr.orientation, pluswidth);


                        if (attr.orientation === 'vertical') {
                            initVerticalSlider(element);
                        } else {
                            initHorizontalSlider(element);
                        }

                        scope.callSliding = function callSliding(direction) {
                            scrolling(element, attr.orientation, direction, attr.pace || 100);
                        };
                        checkBtnVisible(element, attr.orientation);
                    });

                    var onceVisibleWatcher = scope.$watch(function(){
                        return $(element).is(':visible')
                    }, function(isVisible){
                        if(isVisible){
                            $timeout(function(){
                                checkBtnVisible(element, attr.orientation);
                            }, 500);
                            onceVisibleWatcher();
                        }
                    })


                }
            }

        }

        function checkBtnVisible(ele, orientation){
            var slidingArea = $(ele).find('.sliding-area')
                , bkBtn = $(ele).find('.slider-backward-btn')
                , fwBtn = $(ele).find('.slider-forward-btn')
                , bkBtnShow = false
                , fwBtnShow = false;

            if(orientation === 'horizontal'){
                var scrollLeft = slidingArea[0].scrollLeft
                    ,scrollWidth = slidingArea[0].scrollWidth
                    ,offsetWidth = slidingArea[0].offsetWidth;
                fwBtnShow = scrollWidth > scrollLeft + offsetWidth;
                bkBtnShow = 0 < scrollLeft;
            }
            if(orientation === 'vertical'){
                var scrollTop = slidingArea[0].scrollTop
                    ,scrollHeight = slidingArea[0].scrollHeight
                    ,offsetHeight = slidingArea[0].offsetHeight;
                fwBtnShow = scrollHeight > scrollTop + offsetHeight;
                bkBtnShow = 0 < scrollTop;
            }

            bkBtn.css({
                'opacity': bkBtnShow ? 1 : 0,
                'cursor':  bkBtnShow ? 'pointer' : 'default'
            });
            fwBtn.css({
                'opacity': fwBtnShow ? 1 : 0,
                'cursor':  fwBtnShow ? 'pointer' : 'default'
            });

        }

        function scrolling(element, orientation, direction, pace) {
            var intPace = parseInt(pace, 10);
            if (isNaN(intPace)) {
                intPace = 0;
            }
            var vPace = (direction === 'forward') ? intPace : -intPace;
            var slidingEle = $(element).find('.sliding-area');
            var animateOptions = {
                duration: 'fast',
                complete: function () {
                    checkBtnVisible(element, orientation);
                }
            };
            if (orientation === 'vertical') {
                var scrollTop = $(slidingEle).scrollTop();
                $(slidingEle).animate({
                    scrollTop: scrollTop + vPace
                }, animateOptions)
            } else {
                var scrollLeft = $(slidingEle).scrollLeft();
                $(slidingEle).animate({
                    scrollLeft: scrollLeft + vPace
                }, animateOptions)
            }
        }

        function initSlidingArea(element, orientation, pluswidth) {
            pluswidth = parseInt(pluswidth, 10);
            if (isNaN(pluswidth))
            {
                pluswidth = 0;
            }
            if (orientation === 'vertical') {

                var btnHeight = $(element).find('.slider-backward-btn').height();

                $(element).find('.sliding-area').css({
                    height: $(element).height() - btnHeight * 2,
                    overflow: 'hidden'
                })

            } else {
                var btnWidth = 32;

                $(element).find('.sliding-area').css({
                    width: $(element).width() - btnWidth * 2 + pluswidth,
                    overflow: 'hidden'
                })

                $(element).find('.sliding-area').children().css({
                    display: 'inline-block',
                    verticalAlign: 'top'
                })
            }
        }

        function initVerticalSlider(element) {

            var backBtn = $(element).find('.slider-backward-btn');
            var forwardBtn = $(element).find('.slider-forward-btn');

            backBtn.css({
                width: '100%',
                textAlign: 'center'
            });

            forwardBtn.css({
                width: '100%',
                textAlign: 'center'
            })

            backBtn.find('i').addClass("icon_nb_arrow_up");
            forwardBtn.find('i').addClass("icon_nb_arrow_down");
        }

        function initHorizontalSlider(element) {

            var backBtn = $(element).find('.slider-backward-btn');
            var forwardBtn = $(element).find('.slider-forward-btn');

            $(element).css({
                whiteSpace: 'nowrap'
            })

            $(element).children().css({
                verticalAlign: 'top',
                display: 'inline-block'
            })

            backBtn.find('i').addClass("icon_nb_arrow_left");
            forwardBtn.find('i').addClass("icon_nb_arrow_right");

            var paddingTop = $(element).height() / 2 - backBtn.find('i').height() / 2;

            backBtn.css({
                height: '100%',
                paddingTop: paddingTop
            });

            forwardBtn.css({
                height: '100%',
                paddingTop: paddingTop
            })


        }

        return directive;

    }

})(NetBrain);