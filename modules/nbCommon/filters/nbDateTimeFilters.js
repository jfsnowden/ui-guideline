;
(function(netBrain) {
	'use strict';

	Date.prototype.toAgo = toAgo; // 暂时侵入
	Date.prototype.toSpecialToday = toSpecialToday;

	var ngDateFilter = null;
	var dateFormator = 'yyyyMMdd';

	var second = 1000;
	var minute = second * 60;
	var hour = minute * 60;
	var day = hour * 24;

	var commonModule = angular.module('nb.common');
	var injects = ['dateFilter'];

	var filterConfigs = getFilterConfigs();
	createFilters(filterConfigs);

	return void(0);

	function getFilterConfigs() {
		return [{
			name: 'nbDate',
			template: 'toLocaleDateString'
		}, {
			name: 'nbTime',
			template: 'toLocaleTimeString'
		}, {
			name: 'nbDateTime',
			template: 'toLocaleString'
		}, {
			name: 'nbAgo',
			template: 'toAgo'
		}, {
			name: 'nbSpecialToday',
			template: 'toSpecialToday'
		}];
	}

	function createFilters(configs) {
		_.each(configs, function(config) {
			createFilter(config);
		});
	}

	function createFilter(config) {
		var filterFactory = createFilterFactory(config.template);
		commonModule.filter(config.name, filterFactory);
	}

	function createFilterFactory(template) {
		var factory = function(dateFilter) {
			return createFilterMethod(template, dateFilter);
		}
		factory.$inject = injects;
		return factory;
	}

	function createFilterMethod(formatTemplate, dateFilter) {
		if(!ngDateFilter) {
			ngDateFilter = dateFilter;
		}

		return function(dateTime) {
			if(!dateTime) return;
			if(_.isString(dateTime)) {
				dateTime = new Date(dateTime);
			}
			var args = Array.prototype.slice.call(arguments, 1);
			return dateTime[formatTemplate].apply(dateTime, args);
		}
	}

	function toSpecialToday(todayFormator, otherDayFormator) {
		var _isToday = isToday(this);

		var formator = _isToday ?
			todayFormator :
			otherDayFormator;

		return formator ?
			ngDateFilter(this, formator) :
			(_isToday ?
				this.toLocaleDateString() :
				this.toLocaleTimeString());
	}

	function isToday(date) {
		var today = new Date();
		return ngDateFilter(today, dateFormator) === ngDateFilter(date, dateFormator);
	}

	function toAgo() {
		var timeSpan = Date.now() - this.valueOf();

		if(timeSpan < second) {
			return '< 1s';
		}

		return [
			getDays(timeSpan),
			' ',
			getHours(timeSpan),
			':',
			getMinutes(timeSpan),
			':',
			getSeconds(timeSpan),
		].join('');
	}

	function getDays(timeSpan) {
		var days = Math.floor(timeSpan / day);
		if(days) {
			var unit = 'day';
			if(days > 1) {
				unit += 's';
			}
			return days + unit;
		} else {
			return '';
		}
	}

	function getSeconds(timeSpan) {
		return getTimeUnit(timeSpan, second, minute);
	}

	function getMinutes(timeSpan) {
		return getTimeUnit(timeSpan, minute, hour);
	}

	function getHours(timeSpan) {
		return getTimeUnit(timeSpan, hour, day);
	}

	function getTimeUnit(timeSpan, current, upper) {
		var count = Math.floor(timeSpan % upper / current);
		return addPrefix(count, 2);
	}

	function addPrefix(n, length) {
		var nStr = n.toString();
		if(nStr.length >= length) {
			return nStr;
		}
		var arr = Array(length - nStr.length);
		arr.push(nStr);
		return arr.join('0');
	}

})(NetBrain);
