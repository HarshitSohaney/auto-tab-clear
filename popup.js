document.getElementById('clear').addEventListener('click', () => {
    const selectedTimeOption = document.querySelector('input[name="time"]:checked').value;
    if (selectedTimeOption === 'custom') {
      const customTime = document.getElementById('custom').value;
      timeThreshold = customTime * 60 * 1000; // Convert minutes to milliseconds
    } else {
      timeThreshold = selectedTimeOption * 60 * 1000; // Convert minutes to milliseconds
    }
    
    const exceptions = document.getElementById('exceptions').value.split(',').map(e => e.trim());

    browser.storage.local.set({ timeThreshold: timeThreshold, exceptions: exceptions });
  
    browser.runtime.sendMessage({
      command: "clearOldTabs",
      timeThreshold: timeThreshold,
      exceptions: exceptions
    });
  });

document.getElementById('auto-clear-checkbox').addEventListener('change', () => {
    const autoClear = document.getElementById('auto-clear-checkbox').checked;
    browser.storage.local.set({ autoClear: autoClear });

    if (autoClear) {
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999); // Set to the end of the current day
    
        browser.runtime.sendMessage({
            command: "setAlarm",
            when: endOfDay.getTime()
        });
  
    console.log(`Scheduled to clear tabs at end of day: ${endOfDay}`);
    } else {
        browser.alarms.clear("clearTabsAlarm");
        console.log("Cleared scheduled tab clearing");
    }
  });
  

  document.getElementById('add-current-tab').addEventListener('click', () => {
    browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
      const url = new URL(tabs[0].url);
      const domain = url.hostname;
  
      browser.storage.local.get('exceptions').then(data => {
        let exceptions = data.exceptions || [];
        if (!exceptions.includes(domain)) {
          exceptions.push(domain);
          browser.storage.local.set({ exceptions: exceptions });
  
          // Update the exceptions input field
          document.getElementById('exceptions').value = exceptions.join(',');
        }
      });
    });
  });
  