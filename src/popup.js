(() => {
  "use strict";

  const DEFAULTS = {
    discordEnabled: true,
    discordNames: ["Dionis | Usual Goblin"],
    githubEnabled: true,
    githubNames: ["Dionis404"],
  };

  const form = document.getElementById("settings-form");
  const discordEnabled = document.getElementById("discord-enabled");
  const discordNames = document.getElementById("discord-names");
  const githubEnabled = document.getElementById("github-enabled");
  const githubNames = document.getElementById("github-names");
  const status = document.getElementById("status");

  function lines(value) {
    return [...new Set(value.split("\n").map((name) => name.trim()).filter(Boolean))];
  }

  chrome.storage.local.get(DEFAULTS, (settings) => {
    discordEnabled.checked = settings.discordEnabled;
    discordNames.value = settings.discordNames.join("\n");
    githubEnabled.checked = settings.githubEnabled;
    githubNames.value = settings.githubNames.join("\n");
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    chrome.storage.local.set(
      {
        discordEnabled: discordEnabled.checked,
        discordNames: lines(discordNames.value),
        githubEnabled: githubEnabled.checked,
        githubNames: lines(githubNames.value),
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
