define(function(require) {

	

	var $ = require("jquery");

	RSVP.on('error', function(reason) {
	  console.error(reason);
	  console.error(reason.message, reason.stack);
	});


	Loader = require("app/flatfileeventloader");
	GregorianCalendar = require("./calendars/gregorian");

	new Loader("json/events.json").getEvents().then(function(es) {events = es});
	
	console.log("Loaded main.js");

});