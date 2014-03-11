// This is a flat-file event loader, which pulls all of a specified URL into memory and loads events from there.
// It is read-only
define(function(require) {

	$ = require("jquery");
	require("RSVP");

	function Loader(url) {
		var l = $.getJSON(url);

		var self = this;

		self.eventLoad = RSVP.defer(); // returns map guid -> event object

		l.done(function(d) {
			var e = {};
			for(var i in d) {
				e[d[i].guid] = d[i];
			}
			self.eventLoad.resolve(e);
		}).fail(function(e) {
			self.eventLoad.reject(e);
		});
	}

	Loader.prototype.getEvents = function() {
		// Just return everything - this is an EventLoader of very little brain.
		return this.eventLoad.promise;
	};

	// TODO support saving?

	return Loader;
});
