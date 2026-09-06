# Hide User Messages

A small, open-source Chrome extension that locally hides messages from selected
users on Discord and GitHub—or replaces their content with a positive phrase of
your choice. It does not block, report, delete, or modify any content on either
service: the change exists only in your browser.

> The main idea of this project is to **stay positive and save your aura from
> toxic vibes**.

Before 
<img width="1070" height="176" alt="image" src="https://github.com/user-attachments/assets/4514825e-cc1e-4ffa-85f6-a808c4a69419" />

<img width="632" height="100" alt="image" src="https://github.com/user-attachments/assets/82fa8fdb-3c73-4721-ad4c-d66249dc77c7" />


After
<img width="1007" height="241" alt="image" src="https://github.com/user-attachments/assets/8fef1c57-0df5-43ac-855e-ecfb9a1c6b1f" />

<img width="801" height="116" alt="image" src="https://github.com/user-attachments/assets/08b49aec-1327-4268-9aaf-47b603604bd0" />



The default filters are:

- Discord display name: `Dionis | Usual Goblin`
- GitHub login: `Dionis404`

The default action is **Replace** and the default replacement is `Nice Idea!`.

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
2. Choose whether matching messages should be completely hidden or replaced,
   and customize the positive replacement text if needed.
3. In **Discord**, enter the visible display name exactly as it appears above a
   message. In **GitHub**, enter the account login without `@`.
4. Put one name per line. Matching is exact after trimming whitespace and is
   case-insensitive.
5. Use each site's checkbox to temporarily disable its filter, then click
   **Save filters**.

Changes apply to open pages immediately. The names and toggles are stored with
`chrome.storage.local`, inside the current Chrome profile. This extension makes
no network requests and has no analytics.

## How it works

- On Discord, it scans rendered message list items and resolves their author
  through the message's `aria-labelledby` relationship. This also covers compact
  follow-up messages where Discord does not repeat the visible username. Replace
  mode keeps the author header but removes the original text, reply preview,
  attachments, and reactions.
- On GitHub, it finds comment-author profile links and locates their nearest issue,
  pull-request, or review-comment container. Replace mode keeps the comment
  header and substitutes the body.
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
current code reads author labels and hides matching containers or message bodies;
it does not read cookies, intercept requests, send data, or contact a server.
Replacement text is inserted with `textContent`, not interpreted as HTML.

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
