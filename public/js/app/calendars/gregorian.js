define(function(require) {

	 function $N(value, ifnull) {
	    return value == null ? ifnull : value;	
	 }

	function secondsBetweenYears(yearA, yearB) {
		return (yearA - yearB) * 365 * 24 * 3600;
	}
	
	var monthLengths = [undefined, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	var cumulativeMonthLengths = [0, 0, 31, 59,90,120,151,181,212,243,273,304,334];
	
	function secondsIntoYear(inst) {
		
		return cumulativeMonthLengths[(inst.month || 1)] * 24 * 3600 + ((inst.day || 1)-1) * 24 * 3600 + (inst.hour || 0) * 3600 + (inst.minute || 0) * 60 + (inst.second || 0);
	}
	
	function normaliseMonths(inst) {
	
		if (inst.month == null) 
			return;
			
		if(inst.month > 12) {
			inst.year += Math.floor((inst.month-1) / 12);
			inst.month = (inst.month-1) % 12 + 1;
		} else if (inst.month < 1) {
			inst.year += Math.floor((inst.month-1) / 12);
			inst.month = (((inst.month-1) % 12 + 12) % 12) + 1;
		}

	}
	
	function normaliseDays(inst) {
		
		if (inst.day == null)
			return;
		
		while (inst.day > monthLengths[inst.month]) {
			inst.day -= monthLengths[inst.month];
			inst.month++;
			normaliseMonths(inst);
		}

		while (inst.day < 1) {
			inst.month--;
			normaliseMonths(inst);
			inst.day += monthLengths[inst.month];
		}
	}
	
	function normaliseTimeOfDay(inst) {
		var orig = $.extend({}, inst);
		if (inst.second != null) {
			if (inst.second > 59) {
				inst.minute += Math.floor(inst.second / 60);
				inst.second %= 60;
			} else if (inst.second < 0) {
				inst.minute += Math.floor(inst.second / 60);
				inst.second = (inst.second % 60 + 60) % 60;
			}
		}
		
		if (inst.minute != null) {
			if (inst.minute > 59) {
				inst.hour += Math.floor(inst.minute / 60);
				inst.minute %= 60;
			} else if (inst.minute < 0) {
				inst.hour += Math.floor(inst.minute / 60);
				inst.minute = (inst.minute % 60 + 60) % 60;
			}
		}
		var orig2 = $.extend({}, inst);
		
		if (inst.hour != null && inst.hour != undefined) {
			if (inst.hour > 23) {
				inst.day += Math.floor(inst.hour / 24);
				inst.hour %= 24;
			} else if (inst.hour < 0) {
				inst.day += Math.floor(inst.hour / 24);
				inst.hour = (inst.hour % 24 + 24) % 24;
			}
		}
		if (inst.hour > 23)
			debugger;
		normaliseDays(inst);
	}
	
	function normaliseDate(inst) {
		// Do a kind of left-to-right recursive thingy.
		normaliseMonths(inst);
		normaliseDays(inst);
		normaliseTimeOfDay(inst);
	}
	
	var Cal = { };
		
	Cal.subtract = function(instA, instB) {
	
		var ys = secondsBetweenYears(instA.year, instB.year);
		
		var subyears = secondsIntoYear(instA) - secondsIntoYear(instB);
		
		return ys + subyears; 

		// t-value for this calendar is seconds between dates. 
		// This loses precision for dates zillions of years apart. This is ok.
	};
	
	Cal.addTimespan = function(inst, timespan) {
		var result = {
			year: inst.year + $N(timespan.years, 0),
			month: $N(inst.month, 1) + $N(timespan.months, 0),
			day: $N(inst.day, 1) + $N(timespan.days, 0),
			hour: $N(inst.hour, 0) + $N(timespan.hours, 0),
			minute: $N(inst.minute, 0) + $N(timespan.minutes, 0),
			second: $N(inst.second, 0) + $N(timespan.seconds, 0)
		}
		
		normaliseDate(result);
		
		return result;
	};

	Cal.addTimespans = function(ts1, ts2) {
		var result = {};
		for (var unit in ts1) { result[unit] = ts1[unit]; }
		for (var unit in ts2) {
			result[unit] = $N(result[unit], 0) + ts2[unit];
		}
		return result;
	}

	Cal.negateTimespan = function(ts) {
		var result = {};
		for (var unit in ts) { result[unit] = -ts[unit]; }
		return result;
	}
	
	Cal.subtractTimespan = function(inst, timespan) {
		var result = {
			year: inst.year - $N(timespan.years, 0),
			month: $N(inst.month, 1) - $N(timespan.months, 0),
			day: $N(inst.day, 1) - $N(timespan.days, 0),
			hour: $N(inst.hour, 0) - $N(timespan.hours, 0),
			minute: $N(inst.minute, 0) - $N(timespan.minutes, 0),
			second: $N(inst.second, 0) - $N(timespan.seconds, 0)
		}
		
		normaliseDate(result);
		
		return result;
	};
		
	Cal.addT = function(inst, t) {
		 return Cal.addTimespan(inst, {seconds: t});
	};
	
	Cal.getTicks = function(focusInst, startT, endT, minTGap) {
		var year = 365*24*3600, month = 30*24*3600;

		return {levels: ["year", "month"],
				ticks: {year: [-year, 0, year, 2*year],
						month: [0, month, month*2, month*3]},
				labels: {year: [1065, 1066, 1067, 1068],
						 month: ["Jan", "Feb", "Mar", "Apr"]}};
	};
	
	return Cal;
	
});
