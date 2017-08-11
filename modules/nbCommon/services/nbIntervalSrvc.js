;
(function(netBrain) {
	'use strict';

	var defaultOption = {
		predicate: true,
		interval: 1000,
		callback: _.noop,
		continueWhenError: false,
	};

	/*
	 *	setNBInterval
	 *
	 * 使用说明见需求文档
	 *
	 * 返回值为一个cancel函数（类似angular事件订阅的返回）
	 *
	 * >>>几个注意点：<<<
	 * 1. callback 推荐返回promise，如果全是同步操作也可以不返回promise
	 * 2. callback 参数中option是可以修改的(即可以动态调整:
	 *							interval、predicate、甚至callback)
	 * 3. callback或predicate中未处理的异常会终止interval过程，所以应该处理好异常
	 * 4. continueWhenError 若为true则当异常后，继续下一次
	 *
	 */

	angular.module('nb.common')
		.factory('nb.common.nbIntervalSrvc', nbIntervalSrvc);

	nbIntervalSrvc.$inject = ['$q', '$timeout'];

	return void(0);

	function nbIntervalSrvc($q, $timeout) {
		return {
			setInterval: interval,
		};

		// return void(0);

		function interval(callback, interval, option) { // or interval(option)
			var realOption = prepareRealOption.apply(null, arguments);
			return doInterval(realOption);
		}

		function doInterval(option) {
			var firstRunOn,
				lastRunOn,
				runCounts = 0,
				tryTimes = 0;

			var stopped = false;

			var intervalData = {};
			definedGetters();

			var currentOption;
			var timeoutId;

			setNext();

			return stop;

			// return void(0);

			function setNext() {
				if(stopped) {
					return;
				}

				prepareCurrentOption();
				timeoutId = $timeout(run, currentOption.interval);
			}

			function run() {
				tryTimes++;
				prepareCurrentOption();

				if(shouldCallback()) {
					doRun();
				} else {
					setNext();
				}
			}

			function shouldCallback() {
				var predicate = currentOption.predicate;
				return _.isFunction(predicate) ?
					predicate() :
					predicate;
			}

			function doRun() {
				$q.resolve()
					.then(doCallback)
					.then(setNext) /*done、finally*/
					.catch(handleError);
			}

			function doCallback() {
				updateIntervalData();
				try {
					return currentOption.callback(intervalData);
				} catch(err) {
					return $q.reject(err);
				}
			}

			function updateIntervalData() {
				lastRunOn = new Date();

				if(isFirstRun()) {
					firstRunOn = lastRunOn;
				}

				runCounts++;
			}

			function isFirstRun() {
				return runCounts === 0;
			}

			function handleError(err) {				
				console.error(err); // console.info(err); // 

				if(currentOption.continueWhenError) {
					setNext();
				} else {
					stopped = true;
				}
			}

			function stop() {
				stopped = true;
				$timeout.cancel(timeoutId);
			}

			function definedGetters() {
				Object.defineProperty(intervalData, 'firstRunOn', {
					get: function() {
						return firstRunOn;
					},
				});
				Object.defineProperty(intervalData, 'lastRunOn', {
					get: function() {
						return lastRunOn;
					},
				});
				Object.defineProperty(intervalData, 'runCounts', {
					get: function() {
						return runCounts;
					},
				});
				Object.defineProperty(intervalData, 'tryTimes', {
					get: function() {
						return tryTimes;
					},
				});
				Object.defineProperty(intervalData, 'stopped', {
					get: function() {
						return stopped;
					},
				});
				Object.defineProperty(intervalData, 'option', {
					get: function() {
						return option.originalOption;
					},
				});
			}

			function prepareCurrentOption() {
				currentOption = generateCurrentOption(option);
			}
		}

		function generateCurrentOption(option) {
			var currentOption = _.extend({},
				defaultOption, {
					callback: option.callback,
					interval: option.interval,
				},
				option.originalOption
			);

			if(!_.isNumber(currentOption.interval)) {
				throwError('interval must be a number');
			}

			if(!_.isFunction(currentOption.callback)) {
				throwError('callback must be a function');
			}

			return currentOption;
		}

		function prepareRealOption() {
			var realOption = {};

			var args = arguments.length;

			if(args === 1) {
				var param = arguments[0];
				if(_.isFunction(param)) {
					parseCallback(param, realOption);
				} else {
					parseOption(param, realOption);
				}
			} else if(args >= 2) {
				parseCallback(arguments[0], realOption);
				parseInterval(arguments[1], realOption);

				if(args >= 3) {
					parseOption(arguments[2], realOption);
				}
			} else {
				throwInvalidArguments();
			}

			return realOption;
		}

		function parseCallback(callback, realOption) {
			if(!_.isFunction(callback)) {
				throwInvalidArguments();
			}

			realOption.callback = callback;
		}

		function parseInterval(interval, realOption) {
			if(!_.isNumber(interval)) {
				throwInvalidArguments();
			}

			realOption.interval = interval;
		}

		function parseOption(option, realOption) {
			if(!_.isObject(option)) {
				throwInvalidArguments();
			}

			realOption.originalOption = option;
		}

		function throwInvalidArguments() {
			throwError('take a see carefully on the use help');
		}

		function throwError(err) {
			throw new Error(err);
		}

	}

})(NetBrain);
