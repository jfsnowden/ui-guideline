;
(function(NetBrain) {

	angular.module('nb.common')
		.directive('nbRightClick', NbRightClick);

	NbRightClick.$inject = [
		'$parse'
	];

	function NbRightClick(
		$parse
	) {
		return function(scope, element, attrs) {
			var fn = $parse(attrs.nbRightClick);
			element.bind('contextmenu', function(event) {
				scope.$apply(function() {
					// event.preventDefault();
					// event.stopPropagation();
					fn(scope, {
						$event: event
					});
				});
			});
		}
	}

})(NetBrain);
