let selectedTimeValue = 5 * 60 * 1000; // 5 minutes

// Initialize the popup by loading stored settings
document.addEventListener("DOMContentLoaded", () => {
  // Load time threshold and exceptions
  browser.storage.local.get(["exceptions", "autoClear"]).then((data) => {
    if (data.timeThreshold) {
      selectedTimeValue = data.timeThreshold;
    }
    if (data.exceptions) {
      document.getElementById("exceptions").value = data.exceptions.join(",");
    }
    // check if data.autoClear exists
    if (data.autoClear !== undefined) {
        console.log(`Auto-clear setting loaded: ${data.autoClear}`);
      document.getElementById('auto-clear').checked = data.autoClear;
    }
  });

  // Initialize time button selection
  const timeButtons = document.querySelectorAll(".time-btn");
  timeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      timeButtons.forEach((btn) => btn.classList.remove("selected"));
      button.classList.add("selected");
      selectedTimeValue = button.getAttribute("data-value") * 60 * 1000;
    });
  });

  // Set default selected button
  timeButtons[0].classList.add("selected");
});

document.getElementById("clear").addEventListener("click", () => {
  const exceptions = document
    .getElementById("exceptions")
    .value.split(",")
    .map((e) => e.trim());

  browser.storage.local.set({
    timeThreshold: selectedTimeValue,
    exceptions: exceptions,
  });

  browser.runtime.sendMessage({
    command: "clearOldTabs",
    timeThreshold: selectedTimeValue,
    exceptions: exceptions,
  });
});

document.getElementById('auto-clear').addEventListener('click', (event) => {
    const autoClear = event.target.checked;
    console.log(`Auto-clear setting changed to: ${autoClear}`)
    browser.storage.local.set({ autoClear });
  
    if (autoClear) {
      scheduleRecurringClear();
    } else {
      browser.alarms.clear("clearTabsAlarm");
    }
});

document.getElementById("add-current-tab").addEventListener("click", () => {
  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    const url = new URL(tabs[0].url);
    const domain = url.hostname;

    browser.storage.local.get('exceptions').then((data) => {
      let exceptions = data.exceptions || [];
      if (!exceptions.includes(domain)) {
        exceptions.push(domain);
        browser.storage.local.set({ exceptions: exceptions });

        // Update the exceptions input field
        document.getElementById("exceptions").value = exceptions.join(",");
      }
    });
  });
});

function scheduleRecurringClear() {
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999); // Set to the end of the current day

  browser.alarms.create("clearTabsAlarm", {
    when: endOfDay.getTime(),
    periodInMinutes: 24 * 60,
  });

  // set autoClear setting
  browser.storage.local.set({ autoClear: true });

  console.log(`Scheduled recurring clear at end of day: ${endOfDay}`);
}
