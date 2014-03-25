define(function(require) {

	

	var $ = require("jquery");


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
		r.render(canvas[0]);
		console.timeEnd("render");

	});
	
	console.log("Loaded main.js");

});