(function exposeCore(root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  root.HideUserMessagesCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createCore() {
  function normalizeName(value) {
    return String(value ?? "").trim().toLocaleLowerCase();
  }

  function normalizeNames(values) {
    return new Set(
      (Array.isArray(values) ? values : [])
        .map(normalizeName)
        .filter(Boolean),
    );
  }

  function isTarget(name, targets) {
    return targets.has(normalizeName(name));
  }

  function githubLoginFromHref(href) {
    if (typeof href !== "string" || !href.startsWith("/")) {
      return "";
    }

    const [login, extra] = href.slice(1).split("/");
    if (!login || extra) {
      return "";
    }

    try {
      return decodeURIComponent(login);
    } catch {
      return login;
    }
  }

  function replacementText(value, fallback = "Nice Idea!", maxLength = 200) {
    const cleaned = String(value ?? "").trim() || fallback;
    return cleaned.slice(0, maxLength);
  }

  function linkedId(labels, prefix) {
    return String(labels ?? "")
      .split(/\s+/)
      .find((id) => id.startsWith(`${prefix}-`)) || "";
  }

  return {
    githubLoginFromHref,
    isTarget,
    linkedId,
    normalizeName,
    normalizeNames,
    replacementText,
  };
});
