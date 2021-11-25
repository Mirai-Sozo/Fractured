"use strict";
const notifiers = [];
const Notifier = {
  load() {
    Vue.component("notifier", {
      props: ["text", "time", "id"],
      data: () => ({
        tick: player.time,
        Math,
        notifiers
      }),
      template: `<div class="notifier" :style="{
        transform: 'translate(0, ' + Math.min(Math.sin((tick.thisTick - time)/3000 * Math.PI)*100, 40) + 'px)'
      }" @click="notifiers.splice(id, 1)">
        <span v-html="text" style="text-align: center;"></span>
      </div>`
    });
    Vue.component("notifier-container", {
      data: () => ({
        notifiers
      }),
      template: `<div class="notifier-container">
        <notifier v-for="(notifier, id) in notifiers" :text="notifier.text" :time="notifier.time" :id="id"></notifier>
      </div>`
    });

    // eslint-disable-next-line no-new
    new Updater(diff => {
      while (notifiers.length && player.time.thisTick - notifiers[notifiers.length - 1].time > 3000) {
        notifiers.pop();
      }
    });
  },
  notify(text) {
    notifiers.push({ text, time: new Date().getTime() });
  }
};