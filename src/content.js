(() => {
  "use strict";

  const core = globalThis.HideUserMessagesCore;
  const HIDDEN_ATTRIBUTE = "data-hide-user-messages-hidden";
  const DEFAULTS = {
    discordEnabled: true,
    discordNames: ["Dionis | Usual Goblin"],
    githubEnabled: true,
    githubNames: ["Dionis404"],
  };

  let settings = DEFAULTS;
  let scheduled = false;

  function installHidingStyle() {
    if (document.getElementById("hide-user-messages-style")) return;

    const style = document.createElement("style");
    style.id = "hide-user-messages-style";
    style.textContent = `[${HIDDEN_ATTRIBUTE}="true"] { display: none !important; }`;
    (document.head || document.documentElement).append(style);
  }

  function setHidden(element, hidden) {
    if (!element) return;

    if (hidden) {
      element.setAttribute(HIDDEN_ATTRIBUTE, "true");
    } else {
      element.removeAttribute(HIDDEN_ATTRIBUTE);
    }
  }

  function restorePreviouslyHidden() {
    document.querySelectorAll(`[${HIDDEN_ATTRIBUTE}]`).forEach((element) => {
      setHidden(element, false);
    });
  }

  function discordAuthorFor(messageItem, previousAuthor) {
    const article = messageItem.querySelector('[role="article"]');
    const labelledBy = article?.getAttribute("aria-labelledby") || "";
    const usernameId = labelledBy
      .split(/\s+/)
      .find((id) => id.startsWith("message-username-"));
    const linkedUsername = usernameId
      ? document.getElementById(usernameId)
      : null;
    const localUsername = messageItem.querySelector('[id^="message-username-"]');
    const usernameContainer = linkedUsername || localUsername;
    const username =
      usernameContainer?.querySelector('[role="button"]') || usernameContainer;
    const text = username?.textContent?.trim();

    return text || previousAuthor || "";
  }

  function filterDiscord() {
    const targets = core.normalizeNames(settings.discordNames);
    const enabled = settings.discordEnabled && targets.size > 0;
    let previousAuthor = "";

    document
      .querySelectorAll('li[id^="chat-messages-"]')
      .forEach((messageItem) => {
        const author = discordAuthorFor(messageItem, previousAuthor);
        if (author) previousAuthor = author;
        setHidden(messageItem, enabled && core.isTarget(author, targets));
      });
  }

  function githubCommentContainer(authorLink) {
    return authorLink.closest(
      [
        ".js-comment-container",
        ".js-inline-comment",
        ".review-comment",
        '[data-testid="review-thread"]',
        '[data-testid*="comment-container"]',
        '[id^="discussion_r"]',
        '[id^="issuecomment-"]',
        '[id^="pullrequestreview-"]',
      ].join(","),
    );
  }

  function filterGitHub() {
    const targets = core.normalizeNames(settings.githubNames);
    const enabled = settings.githubEnabled && targets.size > 0;
    const authorLinks = document.querySelectorAll(
      [
        'a.author[href^="/"]',
        '[data-testid="comment-header"] a[href^="/"]',
        '[data-testid="avatar-link"][href^="/"]',
      ].join(","),
    );

    const seen = new Set();
    authorLinks.forEach((authorLink) => {
      const container = githubCommentContainer(authorLink);
      if (!container || seen.has(container)) return;
      seen.add(container);

      const login = core.githubLoginFromHref(authorLink.getAttribute("href"));
      setHidden(container, enabled && core.isTarget(login, targets));
    });
  }

  function applyFilters() {
    installHidingStyle();

    if (location.hostname === "discord.com") {
      filterDiscord();
    } else if (location.hostname === "github.com") {
      filterGitHub();
    }
  }

  function scheduleFilter() {
    if (scheduled) return;
    scheduled = true;

    requestAnimationFrame(() => {
      scheduled = false;
      applyFilters();
    });
  }

  function loadSettings() {
    chrome.storage.local.get(DEFAULTS, (storedSettings) => {
      settings = { ...DEFAULTS, ...storedSettings };
      scheduleFilter();
    });
  }

  new MutationObserver(scheduleFilter).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return;

    settings = Object.fromEntries(
      Object.entries(settings).map(([key, currentValue]) => [
        key,
        changes[key]?.newValue ?? currentValue,
      ]),
    );
    restorePreviouslyHidden();
    scheduleFilter();
  });

  loadSettings();
})();
