(() => {
  "use strict";

  const core = globalThis.HideUserMessagesCore;
  const HIDDEN_ATTRIBUTE = "data-love-letters-hidden";
  const ORIGINAL_HIDDEN_ATTRIBUTE = "data-love-letters-original-hidden";
  const REPLACEMENT_ATTRIBUTE = "data-love-letters-replacement";
  const DEFAULTS = {
    discordEnabled: true,
    discordNames: ["Denis"],
    filterMode: "replace",
    githubEnabled: true,
    githubNames: ["Denis"],
    replacementText: "Nice Idea!",
  };

  let settings = DEFAULTS;
  let scheduled = false;

  function installStyles() {
    if (document.getElementById("love-letters-style")) return;

    const style = document.createElement("style");
    style.id = "love-letters-style";
    style.textContent = `
      [${HIDDEN_ATTRIBUTE}="true"],
      [${ORIGINAL_HIDDEN_ATTRIBUTE}="true"] {
        display: none !important;
      }

      [${REPLACEMENT_ATTRIBUTE}] {
        color: currentColor;
        font-style: italic;
        opacity: 0.9;
      }

      .love-letters-discord-replacement {
        margin-top: 2px;
      }

      .love-letters-github-replacement {
        min-height: 48px;
        padding: 16px;
        color: var(--fgColor-default, #1f2328);
      }
    `;
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

  function clearReplacement(container) {
    if (!container) return;

    container
      .querySelectorAll(`[${ORIGINAL_HIDDEN_ATTRIBUTE}]`)
      .forEach((element) => element.removeAttribute(ORIGINAL_HIDDEN_ATTRIBUTE));
    container
      .querySelectorAll(`[${REPLACEMENT_ATTRIBUTE}]`)
      .forEach((element) => element.remove());
  }

  function replacePayload(container, payloads, placement, site) {
    setHidden(container, false);

    const usablePayloads = payloads.filter(Boolean);
    usablePayloads.forEach((element) => {
      element.setAttribute(ORIGINAL_HIDDEN_ATTRIBUTE, "true");
    });

    let replacement = container.querySelector(`[${REPLACEMENT_ATTRIBUTE}]`);
    if (!replacement) {
      const replacementTag =
        site === "github" && placement ? placement.tagName : "div";
      replacement = document.createElement(replacementTag);
      replacement.setAttribute(REPLACEMENT_ATTRIBUTE, "true");
      replacement.className = `love-letters-${site}-replacement`;
      if (placement?.hasAttribute("colspan")) {
        replacement.setAttribute("colspan", placement.getAttribute("colspan"));
      }

      const anchor = placement || usablePayloads[0] || container.firstChild;
      if (anchor?.parentNode) {
        anchor.parentNode.insertBefore(replacement, anchor);
      } else {
        container.append(replacement);
      }
    }

    const text = core.replacementText(settings.replacementText);
    if (replacement.textContent !== text) {
      replacement.textContent = text;
    }
  }

  function applyAction(container, payloads, placement, site, matched) {
    if (!matched) {
      setHidden(container, false);
      clearReplacement(container);
      return;
    }

    if (settings.filterMode === "replace") {
      replacePayload(container, payloads, placement, site);
    } else {
      clearReplacement(container);
      setHidden(container, true);
    }
  }

  function restorePreviouslyHidden() {
    document.querySelectorAll(`[${HIDDEN_ATTRIBUTE}]`).forEach((element) => {
      setHidden(element, false);
    });
    document
      .querySelectorAll(`[${ORIGINAL_HIDDEN_ATTRIBUTE}]`)
      .forEach((element) => element.removeAttribute(ORIGINAL_HIDDEN_ATTRIBUTE));
    document
      .querySelectorAll(`[${REPLACEMENT_ATTRIBUTE}]`)
      .forEach((element) => element.remove());
  }

  function discordAuthorFor(messageItem, previousAuthor) {
    const article = messageItem.querySelector('[role="article"]');
    const labelledBy = article?.getAttribute("aria-labelledby") || "";
    const usernameId = core.linkedId(labelledBy, "message-username");
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

  function discordPayloadFor(messageItem, idPrefix) {
    const article = messageItem.querySelector('[role="article"]');
    const labels = [
      article?.getAttribute("aria-labelledby"),
      article?.getAttribute("aria-describedby"),
    ]
      .filter(Boolean)
      .join(" ");
    const linkedId = core.linkedId(labels, idPrefix);
    const linkedElement = linkedId ? document.getElementById(linkedId) : null;

    if (linkedElement && messageItem.contains(linkedElement)) {
      return linkedElement;
    }

    const messageId = messageItem.id.match(/(\d+)$/)?.[1];
    return messageId
      ? document.getElementById(`${idPrefix}-${messageId}`)
      : null;
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
        const content = discordPayloadFor(messageItem, "message-content");
        const payloads = [
          content,
          discordPayloadFor(messageItem, "message-accessories"),
          discordPayloadFor(messageItem, "message-reactions"),
          discordPayloadFor(messageItem, "message-reply-context"),
        ];

        applyAction(
          messageItem,
          payloads,
          content,
          "discord",
          enabled && core.isTarget(author, targets),
        );
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
      const body = container.querySelector(
        '.comment-body, .js-comment-body, [data-testid="comment-body"], .markdown-body',
      );

      applyAction(
        container,
        [body],
        body,
        "github",
        enabled && core.isTarget(login, targets),
      );
    });
  }

  function applyFilters() {
    installStyles();

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
