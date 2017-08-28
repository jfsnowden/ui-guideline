(function(netBrain) {
    'use strict';

    var GuidelineApp = angular.module('nb.guideline', [
        'nb.common',
        'ui.router',
        'ui.bootstrap',
        'ui.grid',
        'ui.grid.resizeColumns',
        'ui.grid.selection',
        'ivh.treeview',
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

            .state('home.input', {
                url: '/components/button',
                templateUrl: 'modules/nbGuideline/views/components/input.html',
                controller: 'nb.guideline.inputCtrl',
                controllerAs: 'ctrl'
            })

            .state('home.dropdown', {
                url: '/components/dropdown',
                templateUrl: 'modules/nbGuideline/views/components/dropdown.html',
                controller: 'nb.guideline.dropdownCtrl',
                controllerAs: 'ctrl'
            })

            .state('home.dateTimePicker', {
                url: '/components/dateTimePicker',
                templateUrl: 'modules/nbGuideline/views/components/dateTimePicker.html',
                controller: 'nb.guideline.dateTimePicker',
                controllerAs: 'ctrl'
            })

            .state('home.popover', {
                url: '/components/popover',
                templateUrl: 'modules/nbGuideline/views/components/popover.html',
                controller: 'nb.guideline.popoverCtrl',
                controllerAs: 'ctrl'
            })

            .state('home.toastr', {
                url: '/components/toastr',
                templateUrl: 'modules/nbGuideline/views/components/toastr.html',
                controller: 'nb.guideline.toastrCtrl',
                controllerAs: 'ctrl'
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

            .state('home.tree', {
                url: '/components/tree',
                templateUrl: 'modules/nbGuideline/views/components/tree.html',
                controller: 'nb.guideline.treeCtrl',
                controllerAs: 'ctrl'
            })

            .state('home.tab', {
                url: '/components/tab',
                templateUrl: 'modules/nbGuideline/views/components/tab.html',
                controller: 'nb.guideline.tabCtrl',
                controllerAs: 'ctrl'
            })

    });

    GuidelineApp.run(function(){
        window.hljs.initHighlighting();
    })

})(NetBrain);