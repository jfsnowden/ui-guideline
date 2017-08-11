;
(function(netBrain) {
	'use strict';

	var NB_VISIBILITY_HIDDEN_CLASS = 'nb-visibility-hidden';
	var NB_VISIBILITY_HIDDEN_IN_PROCESS_CLASS = 'nb-visibility-hidden-animate';

	angular.module('nb.common').directive('nbVisibilityHiddenDirective', [
		'$animate',
		function($animate) {
			return {
				restrict: 'A',
				multiElement: true,
				link: function(scope, element, attr) {
					scope.$watch(attr.nbVisibilityHiddenDirective,
						function ngShowWatchAction(value) {
							$animate[value ? 'addClass' : 'removeClass'](
								element,
								NB_VISIBILITY_HIDDEN_CLASS, {
									tempClasses: NB_VISIBILITY_HIDDEN_IN_PROCESS_CLASS
								}
							);
						});
				}
			};
		}
	]);

})(NetBrain);
