let app;

function loadVue() {
	Notifier.load();
	
	app = new Vue({
		el: "#app",
		data: {
			player,
			format,
			formatWhole,
			Decimal,
			notifiers,
			Notifier
		},
		methods: {
			D
		}
	})
}