let notifiers = [];
let Notifier = {
	load() {
		Vue.component("notifier", {
			props: ["text", "time"],
			data: () => { return {
				tick: player.time,
				Math,
				console
			}},
			template: `<div class="notifier" :style="{
				transform: 'translate(0, ' + Math.min(Math.sin((tick.thisTick - time)/3000 * Math.PI)*100, 40) + 'px)'
			}">
				<span v-html="text"></span>
			</div>`
		})
		Vue.component("notifier-container", {
			data: () => { return {
				notifiers
			}},
			template: `<div class="notifier-container">
				<notifier v-for="notifier in notifiers" :text="notifier.text" :time="notifier.time"></notifier>
			</div>`
		})

		new Updater(diff => {
			while (notifiers.length && player.time.thisTick - notifiers[notifiers.length - 1].time > 3000) {
				notifiers.pop();
			}
		});
	},
	notify(text) {
		notifiers.push({text, time: new Date().getTime()})
	}
}