// timeThreshold (ms)
// exceptions (array of strings)
function clearOldTabs(timeThreshold, exceptions) {
    const thresholdTime = Date.now() - timeThreshold;
    console.log(`Clearing tabs older than ${new Date(thresholdTime).toLocaleString()}`);

    browser.tabs.query({})
      .then(tabs => {
        tabs.forEach(tab => {
          const url = new URL(tab.url);
          const domain = url.hostname;
          
          console.log(`Tab ${tab.url} ${new Date(tab.lastAccessed).toLocaleString()} ${tab.active}`);
          if (tab.lastAccessed < thresholdTime && !exceptions.includes(domain) && !tab.active) {
            console.log(`Removing tab`);
            browser.tabs.remove(tab.id);
          }
        });
      })
      .catch(error => console.error(`Error: ${error}`));
  }
  
browser.runtime.onMessage.addListener((message) => {
    if (message.command === "clearOldTabs") {
        clearOldTabs(message.timeThreshold, message.exceptions);
    } else if (message.command === "setAlarm") {
        browser.alarms.create("clearTabsAlarm", { when: message.when });
    }
});
  
browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "clearTabsAlarm") {
      console.log("Alarm fired");
        browser.storage.local.get(["autoClearTimeInMins", "exceptions"]).then(data => {
            clearOldTabs(data.autoClearTimeInMins * 1000, data.exceptions || []);
        });
    }
});
