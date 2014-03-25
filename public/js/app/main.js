define(function(require) {

	

	var $ = require("jquery");

	var pixelsPerT = 7000/3.1e7; // 1000 pixels per year
	var originpx = 300;

	RSVP.on('error', function(reason) {
	  console.error(reason);
	  console.error(reason.message, reason.stack);
	});


	Loader = require("app/FlatFileEventLoader");
	GregorianCalendar = require("./calendars/Gregorian");

	new Loader("json/events.json").getEvents().then(function(es) {
		events = es

		DeliberatelyStupidRenderer = require("app/DeliberatelyStupidRenderer");

		r = new DeliberatelyStupidRenderer(GregorianCalendar, events);

		var canvas = $('#dumbcanvas');
		canvas.attr({width: canvas.width(), height: canvas.height()});

		console.time("render");
		r.render(canvas[0], pixelsPerT, originpx);



		$("body").on("mousewheel", "", function(e) {
			var d = e.originalEvent.deltaY;

			if (d > 0)
			{
				if (e.altKey)
					pixelsPerT *= 1.1;
				else
					originpx += 100;
			} else {
				if (e.altKey)
					pixelsPerT /= 1.1;
				else
					originpx -= 100;
			}

			r.render(canvas[0], pixelsPerT, originpx);

			e.preventDefault();
			e.stopPropagation();
		})

		console.timeEnd("render");

	});
	
	console.log("Loaded main.js");

});