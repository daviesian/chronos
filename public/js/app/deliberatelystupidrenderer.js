define(function(require) {
	$ = require("jquery");

	//dateObjects = require("dateobjects");

	function Renderer(calendar, events) {
		this.calendar = calendar;
		this.events = events;
	}



	Renderer.prototype.render = function(canvas) {
		var originInst = {"year": 1066};

		 var calendarRangeToTs = function(calRange) {

			var r = {};

			if (calRange.min)
				r.minT = this.calendar.subtract(calRange.min, originInst);
			if (calRange.max)
				r.maxT = this.calendar.subtract(calRange.max, originInst);
			if (calRange.when)
				r.t = this.calendar.subtract(calRange.when, originInst);

			return r;
		}.bind(this);

		var revents = [];

		for (var i in this.events) {
			var event = this.events[i];

			revents[i] = {event: event};
			var revent = revents[i];

			if (event.isPointEvent()) {

				var eventDate = event.getStart();

				var calRange = eventDate.getCalendarRange(this.events);

				revent.ts = { when: calendarRangeToTs(calRange, originInst) };

			} else {

				var eventStart = event.getStart();
				var eventEnd = event.getEnd();

				var startRange = eventStart.getCalendarRange(this.events);
				var endRange = eventEnd.getCalendarRange(this.events);

				revent.ts = {
					start: calendarRangeToTs(startRange, originInst),
					end: calendarRangeToTs(endRange, originInst)
				};
			}
		}

		// And now...we render!
		var ctx = canvas.getContext("2d");

		var width = $(canvas).width(), height = $(canvas).height();

		// First, draw a timeline

		var pixelsPerT = 300/3.1e7; // 1000 pixels per year

		var originpx = 300;

		var timelinepy = 200;

		ctx.beginPath();
		ctx.moveTo(0, timelinepy);
		ctx.lineTo(width, timelinepy);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(originpx + 0.5, timelinepy - 10);
		ctx.lineTo(originpx + 0.5, timelinepy + 10);
		ctx.stroke();

		function tToX(t) { return Math.round(originpx + t*pixelsPerT) + 0.5; }

		var ticks = this.calendar.getTicks(originInst, -originpx/pixelsPerT, (width-originpx)/pixelsPerT, 20/pixelsPerT);

		var maxTickHeight = 30;

		for (var li in ticks.levels) {
			var level = ticks.levels[li];

			var tickHeight = maxTickHeight * (ticks.levels.length - li)/ticks.levels.length;
			var textHeight = maxTickHeight + (ticks.levels.length - li) * 10;
			
			var tickTs = ticks.ticks[level];
			var labels = ticks.labels[level];

			for (var ti in tickTs) {
				var t = tickTs[ti];
				var l = labels[ti];

				ctx.beginPath();
				ctx.moveTo(tToX(t), timelinepy);
				ctx.lineTo(tToX(t), timelinepy - tickHeight);
				ctx.stroke();

				ctx.textBaseline = "bottom";
				ctx.textAlign = "center";
				ctx.fillText(l, tToX(t), timelinepy - textHeight);
			}
		}


		var nextLane = 0;

		for (var i in revents) {
			var revent = revents[i];

			var y = timelinepy + 20 + 20 * nextLane;

			if (revent.ts.when) {
				// point event
				ctx.beginPath();
				var x = tToX(revent.ts.when.t);
				ctx.arc(x, y, 10, 0, 360);
				ctx.fill();

				ctx.textBaseline = "middle";
				ctx.textAlign = "left";
				ctx.fillText(revent.event.json.title, x + 15, y);

				//console.log("Point event", x, y, revent.event.json.title, revent);
			} else {
				// Line event
				var fromx = tToX((revent.ts.start.t == null) ? revent.ts.start.minT : revent.ts.start.t);
				var tox = tToX((revent.ts.end.t == null) ? revent.ts.end.minT : revent.ts.end.t);

				ctx.beginPath();
				ctx.lineWidth = 4;
				ctx.moveTo(fromx, y);
				ctx.lineTo(tox, y);
				ctx.stroke();

				ctx.textBaseline = "bottom";
				ctx.textAlign = "center";
				ctx.fillText(revent.event.json.title, (fromx+tox)/2, y-5);
				//console.log("Line event", fromx, tox, y, revent.event.json.title, revent);
			}

			nextLane++;
		}

	};

	return Renderer;
});
