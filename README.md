# HeySupport Chat Widget

A lightweight, embeddable live chat widget for the [HeySupport](https://heysmmprovider.com/) customer support platform. Pure vanilla JavaScript, no frameworks, no build tools required for development.

![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)

## Features

- **Single file** — JS + CSS bundled together, self-contained
- **No frameworks** — Pure vanilla JavaScript, zero dependencies at build time
- **Real-time messaging** — Powered by Socket.IO
- **Mobile responsive** — Works on all screen sizes
- **Returning visitors** — Visitor ID persisted in localStorage
- **Pre-chat form** — Collects visitor name before starting
- **Operator states** — Shows waiting, connected, and closed states
- **Customizable** — Color, position, title, welcome message via data attributes
- **Lightweight** — Under 15 KB uncompressed

## Quick Start

Add one line to your website:

```html
<script src="https://cdn.jsdelivr.net/gh/heysmmprovider/heysupport-widget@latest/dist/heysupport.min.js" data-server="https://your-socket-server.com"></script>
```

That's it. The chat bubble appears in the bottom-right corner.

## Configuration

Customize the widget with `data-` attributes on the script tag:

| Attribute        | Default                              | Description                          |
| ---------------- | ------------------------------------ | ------------------------------------ |
| `data-server`    | **(required)**                       | URL of your HeySupport socket server |
| `data-color`     | `#2563eb`                            | Primary color (hex)                  |
| `data-position`  | `right`                              | Bubble position: `right` or `left`   |
| `data-title`     | `HeySupport`                         | Chat window header title             |
| `data-welcome`   | `Hi there! How can we help you today?` | Pre-chat welcome message           |

### Example with custom options

```html
<script
  src="https://cdn.jsdelivr.net/gh/heysmmprovider/heysupport-widget@latest/dist/heysupport.min.js"
  data-server="https://socket.yoursite.com"
  data-color="#7c3aed"
  data-position="left"
  data-title="Customer Support"
  data-welcome="Welcome! Ask us anything."
></script>
```

## Socket Server

This widget connects to the [HeySupport Socket Server](https://github.com/heysmmprovider/heysuppport-socket). Make sure your socket server is running before using the widget.

### Socket Events

**Client emits:**

| Event                  | Payload                                      |
| ---------------------- | -------------------------------------------- |
| `register`             | `{ userId, name, role: "client" }`           |
| `conversation:start`   | `{ name, email?, page? }`                    |
| `message:send`         | `{ conversationId, text }`                   |
| `conversation:history` | `{ conversationId }`                         |

**Server emits:**

| Event                  | Payload                                                      |
| ---------------------- | ------------------------------------------------------------ |
| `registered`           | `{ user }`                                                   |
| `conversation:started` | `{ conversationId }`                                         |
| `conversation:joined`  | `{ conversationId, operator: { userId, name } }`             |
| `conversation:closed`  | `{ conversationId }`                                         |
| `message:received`     | `{ conversationId, message: { id, senderId, senderName, text, timestamp } }` |
| `error`                | `{ message }`                                                |

## Development

No build tools required for development. Open the demo page directly:

```bash
# Clone the repo
git clone https://github.com/heysmmprovider/heysupport-widget.git
cd heysupport-widget

# Open the demo page in your browser
open demo/index.html
```

Make sure your [socket server](https://github.com/heysmmprovider/heysuppport-socket) is running on `http://localhost:3000`.

### Build for production

```bash
# Creates dist/heysupport.js and dist/heysupport.min.js
node build.js
```

## Project Structure

```
heysupport-widget/
  src/
    heysupport.js    # Main widget source
  dist/
    heysupport.js    # Production build
    heysupport.min.js # Minified build
  demo/
    index.html       # Demo page
  build.js           # Build script
  package.json
  LICENSE
  README.md
```

## License

MIT License. See [LICENSE](LICENSE) for details.

## Related Projects

- [HeySupport Socket Server](https://github.com/heysmmprovider/heysuppport-socket) — Backend socket server for HeySupport

## Links

- [KopenVolgers](https://kopenvolgers.nl/) — Social media growth services (NL)
- [AcquistaFollower](https://acquistafollower.com/) — Social media growth services (IT)
- [HeySMM Reseller](https://heysmmreseller.com/) — SMM reseller panel
- [HeySMM Provider](https://heysmmprovider.com/) — SMM provider platform
- [FollowZentrum](https://followzentrum.de/) — Social media growth services (DE)
- [SMM Royale](https://smmroyale.com/) — SMM services
- [Best SMM Providers](https://bestsmmproviders.com/) — SMM provider directory
