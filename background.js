function clearOldTabs(timeThreshold, exceptions) {
    const thresholdTime = Date.now() - timeThreshold;
    console.log(`Clearing tabs older than: ${new Date(thresholdTime).toLocaleString()}`);
    
    browser.tabs.query({})
      .then(tabs => {
        tabs.forEach(tab => {
          const url = new URL(tab.url);
          const domain = url.hostname;
  
          if (tab.lastAccessed < thresholdTime && !exceptions.includes(domain)) {
            console.log(`Removing tab ID: ${tab.id}`);
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
        browser.storage.local.get(["timeThreshold", "exceptions"]).then(data => {
            clearOldTabs(data.timeThreshold, data.exceptions || []);
        });
    }
});
