define(function(require) {

	function Timespan(json, calendar) {
		this.json = json;
		this.calendar = calendar;
	}

	Timespan.addJsonTimespans = function(j, tj, c) {
		return {calendarTimespan: c.addTimespans(j.calendarTimespan, tj.calendarTimespan),
				uncertainty: c.addTimespans(j.uncertainty||{}, tj.uncertainty||{})};
	}

	Timespan.prototype.addTimespan = function(ts) {
		if (!ts.json) { throw new Error("addTimespan() called without a [wrapped] Timespan object"); }

		if (this.json == "indefinite" || ts.json == "indefinite") { return new Timespan("indefinite", this.calendar); }

		return new Timespan(Timespan.addJsonTimespans(this.json, ts.json, this.calendar))
	}


	function Date(json, calendar) {
		this.json = json;
		this.calendar = calendar;
	}


	Date.prototype.addTimespan = function(ts) {
		var c = this.calendar, j = this.json, tj = ts.json;

		if (!tj) { throw new Error("Date.addTimespan() called without a [wrapped] Timespan object"); }

		if (tj == "indefinite") { return undefined; }

		// What sort of date am I?
		if (j.instant) {
			return new Date({instant: c.addTimespan(j.instant, tj.calendarTimespan),
							 uncertainty: c.addTimespans(j.uncertainty || {}, tj.uncertainty || {})}, c);
		} else if (j.earliest) {
			return new Date({earliest: c.subtractTimespan(c.addTimespan(j.earliest, tj.calendarTimespan), tj.uncertainty||{}),
							 latest: c.addTimespan(c.addTimespan(j.latest, tj.calendarTimespan), tj.uncertainty||{})}, c);
		} else if (j.relativeTo) {
			return new Date({relativeTo: j.relativeTo, from: j.from,
							 offset: Timespan.addJsonTimespans(j.offset, tj)}, c);

		} else {
			console.error("Invalid Date specification: ", j);
			return undefined;
		}
	}

	Date.prototype.resolve = function(eventMap, loopCheck) {
		var c = this.calendar, j = this.json;

		if (!j.relativeTo) { return this; }

		if (!loopCheck)
			loopCheck = {};

		if (loopCheck[j.relativeTo]) { console.error("Circular reference in relative dates!"); return undefined; }
		loopCheck[j.relativeTo] = true;

		// We are a relative date. We would like to resolve ourselves until we are not.
		var event = eventMap[j.relativeTo];

		var date = (j.from=="end") ? event.getEnd() : event.getStart();

		return date.resolve(eventMap, loopCheck).addTimespan(new Timespan(j.offset || {calendarTimespan: {}}, c));
	}

	Date.prototype.getCalendarRange = function(eventMap) {
		var d = this.resolve(eventMap);

		var c = d.calendar, j = d.json;
		if (j.instant) {
			if (j.uncertainty) {
				return {
					min: c.subtractTimespan(j.instant, j.uncertainty),
					max: c.addTimespan(j.instant, j.uncertainty),
					when: j.instant
				};
			} else {
				return {
					when: j.instant
				};
			}
		} else if (j.earliest && j.latest) {
			return {
				min: j.earliest,
				max: j.latest
			}
		} else {
			throw new Error("Date should have been resolved by now. It hasn't.");
		}
	}

	function Event(json, calendar) {
		this.json = json;
		this.calendar = calendar;
	}

	Event.prototype.getStart = function() {
		var j = this.json, c = this.calendar;

		if (j.date) {
			return new Date(j.date, c);
		} else if (j.start) {
			return new Date(j.start, c);
		} else if (j.end && j.duration) {
			return new Date(j.end, c).addTimespan(new Timespan(c.negateTimespan(j.duration), c));
		} else {
			throw new Error("Event does not have correctly specified date(s)");
		}
	}

	Event.prototype.getEnd = function() {
		var j = this.json, c = this.calendar;

		if (j.date) {
			return new Date(j.date, c);
		} else if (j.end) {
			return new Date(j.end, c);
		} else if (j.start && j.duration) {
			return new Date(j.start, c).addTimespan(new Timespan(j.duration, c));
		} else {
			throw new Error("Event does not have correctly specified date(s)");
		}
	}

	Event.prototype.isPointEvent = function() { return !!this.json.date; }

	return {
		Timespan: Timespan,
		Date: Date,
		Event: Event,
	};
});