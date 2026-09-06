(() => {
  "use strict";

  const DEFAULTS = {
    discordEnabled: true,
    discordNames: ["Denis"],
    filterMode: "replace",
    githubEnabled: true,
    githubNames: ["Denis"],
    replacementText: "Nice Idea!",
  };

  const form = document.getElementById("settings-form");
  const discordEnabled = document.getElementById("discord-enabled");
  const discordNames = document.getElementById("discord-names");
  const filterMode = document.getElementById("filter-mode");
  const githubEnabled = document.getElementById("github-enabled");
  const githubNames = document.getElementById("github-names");
  const replacementText = document.getElementById("replacement-text");
  const status = document.getElementById("status");

  function lines(value) {
    return [...new Set(value.split("\n").map((name) => name.trim()).filter(Boolean))];
  }

  chrome.storage.local.get(DEFAULTS, (settings) => {
    discordEnabled.checked = settings.discordEnabled;
    discordNames.value = settings.discordNames.join("\n");
    filterMode.value = settings.filterMode;
    githubEnabled.checked = settings.githubEnabled;
    githubNames.value = settings.githubNames.join("\n");
    replacementText.value = settings.replacementText;
    updateReplacementAvailability();
  });

  function updateReplacementAvailability() {
    replacementText.disabled = filterMode.value !== "replace";
  }

  filterMode.addEventListener("change", updateReplacementAvailability);

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    chrome.storage.local.set(
      {
        discordEnabled: discordEnabled.checked,
        discordNames: lines(discordNames.value),
        filterMode: filterMode.value,
        githubEnabled: githubEnabled.checked,
        githubNames: lines(githubNames.value),
        replacementText: replacementText.value.trim() || DEFAULTS.replacementText,
      },
      () => {
        status.textContent = "Saved";
        window.setTimeout(() => {
          status.textContent = "";
        }, 1500);
      },
    );
  });
})();
