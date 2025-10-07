# AnonPress Browser Extension

Browser extension for accessing AnonPress content with intelligent mirror routing.

## Features

- **Protocol Handler** - Intercept `anonpress://` links
- **Mirror Routing** - Automatically select fastest mirror
- **Status Display** - Real-time mirror health in popup
- **One-Click Access** - Seamless content loading

## Installation

### Development

```bash
npm install
npm run dev
```

This will start the development server and open Chrome with the extension loaded.

### Production Build

```bash
npm run build
```

Built extension will be in `build/` directory.

### Load in Browser

1. Open Chrome/Brave/Edge
2. Go to `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select `build/chrome-mv3-dev` directory

## Usage

### Accessing Content

1. Click any `anonpress://[CID]` link
2. Extension automatically redirects to web app
3. Content loads from fastest available mirror
4. View mirror status in extension popup

### Extension Popup

Click the extension icon to see:

- Current content information
- Mirror availability and latency
- Recommended mirror (fastest)
- Quick actions

## Development

Built with:

- **Plasmo Framework** - Modern extension development
- **TypeScript** - Type safety
- **React** - UI components

### Project Structure

```
browser-extension/
├── background.ts       # Background service worker
├── popup.tsx          # Extension popup UI
├── popup.css          # Popup styles
├── package.json       # Dependencies
└── tsconfig.json      # TypeScript config
```

### Key Functions

**background.ts:**
- `resolveContent()` - Resolve CID to mirrors
- `checkMirrors()` - Check mirror health
- Protocol handler for `anonpress://`

**popup.tsx:**
- Display content information
- Show mirror status
- Quick navigation

## Configuration

Default settings in `background.ts`:

```typescript
const API_URL = "http://localhost:4000"
const WEB_APP_URL = "http://localhost:3000"
```

Modify these for production deployment.

## Permissions

Required permissions:

- `storage` - Save user preferences
- `tabs` - Handle navigation
- `webNavigation` - Intercept links
- Host permissions for API and IPFS gateways

## Publishing

### Chrome Web Store

1. Create developer account
2. Package extension: `npm run package`
3. Upload ZIP to Chrome Web Store
4. Fill in store listing
5. Submit for review

### Firefox Add-ons

1. Build for Firefox
2. Sign with Mozilla
3. Upload to AMO

## Testing

Test protocol handling:

```html
<a href="anonpress://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG">Test Link</a>
```

Click the link to verify extension intercepts and redirects.

## Troubleshooting

### Extension not loading

- Check `chrome://extensions` for errors
- Verify manifest.json is valid
- Rebuild with `npm run build`

### Links not intercepting

- Ensure extension has necessary permissions
- Check browser console for errors
- Verify API URL is accessible

### Popup not showing data

- Open browser console in popup (right-click > Inspect)
- Check API connectivity
- Verify content CID exists

## License

MIT
