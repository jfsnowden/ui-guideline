(function(netBrain) {
    'use strict';

    var GuidelineApp = angular.module('nb.guideline', [
        'nb.common',
        'ui.router',
        'ui.bootstrap',
        'ui.grid',
        'ui.grid.resizeColumns',
        'ui.grid.selection',
        'ngAnimate',
        'hljs'
    ]);

    GuidelineApp.config(function($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise('/introduction');

        $stateProvider

            .state('home', {
                abstract: true,
                template: '<div ui-view></div>'
            })

            .state('home.introduction', {
                url: '/introduction',
                templateUrl: 'modules/nbGuideline/views/introduction.html',
                controller: function(){},
                controllerAs: 'ctrl'
            })

            .state('home.practices', {
                url: '/practices',
                templateUrl: 'modules/nbGuideline/views/practices.html',
                controller: function(){},
                controllerAs: 'ctrl'
            })

            .state('home.changes', {
                url: '/changes',
                templateUrl: 'modules/nbGuideline/views/changes.html',
                controller: function(){},
                controllerAs: 'ctrl'
            })

            .state('home.colors', {
                url: '/colors',
                templateUrl: 'modules/nbGuideline/views/color.html',
                controller: function(){},
                controllerAs: 'ctrl'
            })

            .state('home.fonts', {
                url: '/fonts',
                templateUrl: 'modules/nbGuideline/views/font.html',
                controller: function(){},
                controllerAs: 'ctrl'
            })

            .state('home.components', {
                abstract: true,
                url: '/components',
                template: '<div ui-view></div>'
            })

            .state('home.button', {
                url: '/components/button',
                templateUrl: 'modules/nbGuideline/views/components/button.html',
                controller: 'nb.guideline.buttonCtrl',
                controllerAs: 'ctrl'
            })

            .state('home.icons', {
                url: '/components/icons',
                templateUrl: 'modules/nbGuideline/views/components/icons.html',
                controller: 'nb.guideline.iconCtrl',
                controllerAs: 'ctrl'
            })

            .state('home.modal', {
                url: '/components/modal',
                templateUrl: 'modules/nbGuideline/views/components/modal.html',
                controller: 'nb.guideline.modalCtrl',
                controllerAs: 'ctrl'
            })

            .state('home.grid', {
                url: '/components/grid',
                templateUrl: 'modules/nbGuideline/views/components/grid.html',
                controller: 'nb.guideline.gridCtrl',
                controllerAs: 'ctrl'
            })

    });

    GuidelineApp.run(function(){
        window.hljs.initHighlighting();
    })

})(NetBrain);