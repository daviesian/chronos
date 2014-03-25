define(function(require) {

	 function $N(value, ifnull) {
	    return value == null ? ifnull : value;	
	 }

	function secondsBetweenYears(yearA, yearB) {
		return (yearA - yearB) * 365 * 24 * 3600;
	}
	
	var monthAbbrevs = [undefined, "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
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
		
		// Right now, we don't do leap years, so we can do this the simple way
		if (inst.day > 365) {
			inst.year += Math.floor((inst.day-1)/365);
			inst.day = (inst.day-1) % 365 + 1;
		} else if (inst.day < -365) {
			inst.year += Math.ceil((inst.day-1)/365);
			inst.day = (inst.day - 1) % 365 + 1;
		}

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
		
		if (inst.hour != null && inst.hour != undefined) {
			if (inst.hour > 23) {
				inst.day += Math.floor(inst.hour / 24);
				inst.hour %= 24;
			} else if (inst.hour < 0) {
				inst.day += Math.floor(inst.hour / 24);
				inst.hour = (inst.hour % 24 + 24) % 24;
			}
		}
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

	Cal.isAfter = function(instA, instB) {
		// instA and instB must be normalised
		// (but that's OK, because we never let un-normalised dates out of this code)

		var keys = ["year", "month", "day", "hour", "minute", "second"];

		for (var i in keys) {
			var k = keys[i];
			var a = instA[k], b = instB[k];
			if (a == null) { return false; }
			if (b == null) { return true; }

			if (a > b) { return true; }
			if (a < b) { return false; }
		}

		return false;
	}
	
	Cal.getTicks = function(focusInst, startT, endT, majorTGap, minorTGap) {
		var startInst = Cal.addT(focusInst, startT);
		var endInst = Cal.addT(focusInst, endT);

		console.log("Ticking from ", startInst, "to", endInst);

		minorTGap = minorTGap || majorTGap;

		// Go through from top level to bottom level, generating all ticks

		var r = {levels: [], ticks: {}, labels: {}};

		function forInterval(roundedStart, level, incr, labelFn) {
			var ticks = [];
			var labels = [];
			r.ticks[level] = ticks;
			r.labels[level] = labels;

			var inst = roundedStart;
			//var incr = {};
			//incr[level] = 1;

			if (labelFn == "") { labelFn = function() { return ""; } }

			do {
				var lab = (labelFn ? labelFn(inst) : inst[level]);
				if (lab != null) {
					ticks.push(Cal.subtract(inst, focusInst));
					labels.push(lab);
				}
				inst = Cal.addTimespan(inst, incr);
			} while(!Cal.isAfter(inst, endInst));
		}

		var roundedInst = {year: startInst.year}

		// Year ticks
		if (startInst.year != endInst.year) {

			// What's the closest order of magnitude here?
			function getInterval(tgap) {
				var yeargap = tgap / (365*24*3600);

				if (yeargap < 1) { return 1; }

				var logyeargap = Math.log(yeargap)/Math.LN10;
				var orderOfMagnitude = Math.floor(logyeargap);

				// So, our tick interval will be (2|5|10) * 10^orderOfMagnitude

				// Calculate 10^orderOfMagnitude as an integer (because Math.pow() is subject to floating-point weirdness)
				var base = 1;
				for (var i=0; i<orderOfMagnitude; i++) {
					base *= 10;
				}

				if (yeargap < 2*base) { return 2*base; }
				if (yeargap < 5*base) { return 5*base; }
				return 10*base;
			}

			var majorInterval = getInterval(majorTGap);
			var minorInterval = getInterval(minorTGap);

			r.levels.push("year");

			// roundedInst needs to round to the nearest minorInterval
			roundedInst.year -= roundedInst.year % minorInterval;
			if (roundedInst.year > startInst.year) { roundedInst.year -= minorInterval; }

			forInterval(roundedInst, "year", {years: minorInterval}, function(inst) { return (inst.year % majorInterval == 0) ? inst.year : ""; });
		}

		// Month ticks
		if ((r.ticks.year || startInst.month != endInst.month) && minorTGap < 30*24*3600) {
			r.levels.push("month");
			roundedInst.month = $N(startInst.month, 1);
			forInterval(roundedInst, "month", {months: 1}, (majorTGap < 30*24*3600) ? function(inst) { return monthAbbrevs[inst.month]; } : "");
		}

		// Days
		if ((r.ticks.month || startInst.day != endInst.day) && minorTGap < 24*3600) {
			r.levels.push("day");
			roundedInst.day = $N(startInst.day, 1);
			forInterval(roundedInst, "day", {days: 1}, (majorTGap < 24*3600) ? null : "");
		}

		// Hours

		function renderTime(inst) {
			var mins = inst.minute || 0;
			if (mins < 10) { mins = "0"+mins; }
			return (inst.hour || 0) + ":" + mins;
		}

		function mkGetInterval(possibleIntervals, scaleFactor) {
			function getInterval(tgap) {
				var intervals = possibleIntervals;
				for (var i in intervals) {
					if (tgap < intervals[i]*scaleFactor) { return intervals[i]; }
				}
				return null;
			}
			return getInterval;
		}

		if ((r.ticks.day || startInst.hour != endInst.hour || startInst.minute != endInst.minute) && minorTGap < 3600) {
			r.levels.push("timeofday");
			roundedInst.hour = $N(startInst.hour, 0);

			var getInterval = mkGetInterval([1, 5, 15, 60], 60);

			var minorInterval = getInterval(minorTGap);
			var majorInterval = getInterval(majorTGap);

			if (minorInterval == 1) { roundedInst.minute = $N(startInst.minute, 0); } // otherwise count from the hour

			forInterval(roundedInst, "timeofday", {minutes: minorInterval},
				majorInterval ? function(inst) { return (inst.minute % majorInterval == 0) ? renderTime(inst) : ""; } : "");
		}

		if ((r.ticks.minute || startInst.second != endInst.second) && minorTGap < 15) {
			r.levels.push("second");
			
			console.log(roundedInst);

			var getInterval = mkGetInterval([1, 5, 15], 1);
			var minorInterval = getInterval(minorTGap);
			var majorInterval = getInterval(majorTGap);

			if (minorInterval == 1) { roundedInst.second = Math.floor($N(startInst.second, 0)); } // otherwise count from the minute

			console.log("major =", majorInterval, "; minor =", minorInterval);

			forInterval(roundedInst, "second", {seconds: minorInterval}, function(inst) {
				return (inst.second == 0) ? null :
						(!majorInterval || (inst.second % majorInterval != 0)) ? "" :
						(":" + (inst.second < 10 ? "0" : "") + inst.second);
			});
		}

		return r;
	};
	
	return Cal;
	
});
