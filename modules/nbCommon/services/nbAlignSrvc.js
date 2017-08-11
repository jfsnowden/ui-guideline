;
(function functionName(netBrain) {
	'use strict';

	NbAlignSrvc.$inject = ['$timeout', '$q'];

	angular.module('nb.common')
		.factory('nb.common.nbAlignSrvc', NbAlignSrvc);

	var Spots = createSpots();
	var defaultOption = createDefaultOption();
	var offsetGetters = createOffsetGetters();

	return void(0);

	function NbAlignSrvc($timeout, $q) {
		return {
			align: function() {
				var args = arguments;
				var deffered = $q.defer();

				return $timeout(function() {
					return align.apply(null, args)
						.then(function() {
							return deffered.resolve();
						});
				}).then(function() {
					return deffered.promise;
				});
			},
			Spots: Spots,
		};

		// return void(0);

		function align(target, reference, option) {
			target = $(target);
			reference = $(reference);
			option = extendOption(option);

			var offset = getOffset(target, reference, option);

			var referenceOffset = reference.offset() || {
				top: 0,
				left: 0
			};

			offset.left += referenceOffset.left;
			offset.top += referenceOffset.top;

			offset.left += option.rectify.left;
			offset.top += option.rectify.top;

			target.offset(offset);

			return $q.resolve();
		}
	}

	function extendOption(option) {
		option = _.extend({}, defaultOption, option);
		var rectify = _.extend({}, defaultOption.rectify, option.rectify);
		option.rectify = rectify;

		return option;
	}

	function getOffset(target, reference, option) {
		var spot = option.spot || Spots.Center;
		var leftGetter = offsetGetters.leftGetters[spot];
		var topGetter = offsetGetters.topGetters[spot];

		return {
			left: leftGetter(target, reference, option),
			top: topGetter(target, reference, option),
		};
	}

	function getLeftOffsetLeft(target, reference, option) {
		return option.space;
	}

	function getCenterOffsetLeft(target, reference, option) {
		return(reference.width() - target.width()) / 2;
	}

	function getRightOffsetLeft(target, reference, option) {
		return reference.width() - target.width() - option.space;
	}

	function getTopOffsetTop(target, reference, option) {
		return option.space;
	}

	function getCenterOffsetTop(target, reference, option) {
		return(reference.height() - target.height()) / 2;
	}

	function getBottomOffsetTop(target, reference, option) {
		return reference.height() - target.height() - option.space;
	}

	function createOffsetGetters() {
		return {
			leftGetters: [
				getCenterOffsetLeft,
				getCenterOffsetLeft,
				getRightOffsetLeft,
				getRightOffsetLeft,
				getRightOffsetLeft,
				getCenterOffsetLeft,
				getLeftOffsetLeft,
				getLeftOffsetLeft,
				getLeftOffsetLeft,
			],
			topGetters: [
				getCenterOffsetTop,
				getTopOffsetTop,
				getTopOffsetTop,
				getCenterOffsetTop,
				getBottomOffsetTop,
				getBottomOffsetTop,
				getBottomOffsetTop,
				getCenterOffsetTop,
				getTopOffsetTop,
			],
		};
	}

	function createSpots() {
		return {
			Center: 0,
			Top: 1,
			TopRight: 2,
			Right: 3,
			RightBottom: 4,
			Bottom: 5,
			BottomLeft: 6,
			Left: 7,
			LeftTop: 8,
		};
	}

	function createDefaultOption() {
		return {
			spot: Spots.Center,
			space: 5,
			rectify: {
				left: 0,
				top: 0,
			}
		};
	}

})(NetBrain);
