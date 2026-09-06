# Hide User Messages

A small, open-source Chrome extension that locally hides messages from selected
users on Discord and GitHub. It does not block, report, delete, or modify any
content on either service—the matching elements are only hidden in your browser.

The default filters are:

- Discord display name: `Dionis | Usual Goblin`
- GitHub login: `Dionis404`

## Install from source

1. Download this repository with **Code → Download ZIP** and extract it, or run:

   ```bash
   git clone https://github.com/alexandrdragin/hide-user-messages.git
   ```

2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode** in the top-right corner.
4. Click **Load unpacked**.
5. Select the repository folder (the folder containing `manifest.json`).
6. Reload any already-open Discord or GitHub tabs once after installation.

Chrome does not auto-update extensions installed this way. Pull/download a newer
version and use the extension page's **Reload** button when you want to update it.

## Configure another user

1. Click the extension's toolbar icon (pin it from Chrome's Extensions menu if
   needed).
2. In **Discord**, enter the visible display name exactly as it appears above a
   message. In **GitHub**, enter the account login without `@`.
3. Put one name per line. Matching is exact after trimming whitespace and is
   case-insensitive.
4. Use each site's checkbox to temporarily disable its filter, then click
   **Save filters**.

Changes apply to open pages immediately. The names and toggles are stored with
`chrome.storage.local`, inside the current Chrome profile. This extension makes
no network requests and has no analytics.

## How it works

- On Discord, it scans rendered message list items and resolves their author
  through the message's `aria-labelledby` relationship. This also covers compact
  follow-up messages where Discord does not repeat the visible username.
- On GitHub, it finds comment-author profile links and hides their nearest issue,
  pull-request, or review-comment container.
- A `MutationObserver` reapplies the filter when either single-page application
  renders more content.

Only `https://discord.com/*` and `https://github.com/*` receive the content
script. The only extension permission is `storage`.

## Limitations

- This is visual, client-side filtering—not a Discord block, GitHub block, or
  moderation feature. Hidden content is still downloaded and remains available
  in the page source, APIs, notifications, quotes, email, and other clients.
- It filters only messages currently rendered by the page. Both sites virtualize
  or lazily load content as you scroll.
- Display names are not stable identifiers. A Discord user can rename themselves,
  and two people can share the same visible name. All exact matches will be
  hidden. GitHub logins can also be renamed.
- Replies, mentions, activity counters, search results, sidebars, commits, and
  non-comment activity are intentionally not filtered.
- Discord and GitHub can change their markup without notice. A site update may
  temporarily stop filtering until the selectors are updated.
- The extension currently targets Chrome Manifest V3. Other Chromium browsers
  may work but are not tested.

## Risks and trust model

Loading an unpacked extension gives its content script access to the DOM of the
matched Discord and GitHub pages. Review the source before installing it. The
current code reads author labels and hides matching containers; it does not read
cookies, intercept requests, send data, or contact a server.

Filtering by a mutable display name can hide the wrong person's messages. Do not
use this extension as a security, abuse-prevention, compliance, or moderation
control. Important information can be missed while a filter is enabled.

## Development

No build step or third-party dependency is required.

```bash
npm test
npm run check
```

After changing files, click **Reload** for the extension in
`chrome://extensions`, then reload the target page.

## Contributing

Issues and focused pull requests are welcome. When reporting a broken selector,
include the site, page type, and a redacted DOM fragment—never post private
Discord messages or credentials.

## License

[MIT](LICENSE)
