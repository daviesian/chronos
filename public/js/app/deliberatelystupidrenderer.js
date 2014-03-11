define(function(require) {
	$ = require("jquery");

	function Renderer(calendar, events) {
		this.calendar = calendar;
		this.events = events;
	}

	Renderer.prototype.render = function(canvas) {
		var ctx = canvas.getContext("2d");

		var width = $(canvas).width(), height = $(canvas).height();

		var originInst = {"year": 1066};

		for (var id in this.events) {
			var event = this.events[i];

			if (event.date) { // Point event
				event.t = this.calendar.subtract(event.date, originInst);
			} else {
				// Must have at least two of {start, end, duration}; we need both start and end T

				var start = event.start;

				event.startT = 
			}
		}
	};

	return Renderer;
});
