# PressProtocol Comprehensive Ecosystem Publishing Guide

This guide details how to publish all **10 packages and integrations** across their respective public package registries and marketplaces.

---

## Quick Reference Summary

| Target | Artifact / Code Path | Registry | Credentials Required | Primary Publish Command |
| :--- | :--- | :--- | :--- | :--- |
| **Node / TS SDK** | [`packages/sdk`](file:///Users/shikharsingh/Downloads/code/realfi/anonpress/packages/sdk) | [NPM](https://npmjs.com) | `npm login` / `NPM_TOKEN` | `pnpm --filter @pressprotocol/sdk publish --access public` |
| **Proof Codec** | [`packages/proof`](file:///Users/shikharsingh/Downloads/code/realfi/anonpress/packages/proof) | [NPM](https://npmjs.com) | `npm login` / `NPM_TOKEN` | `pnpm --filter @pressprotocol/proof publish --access public` |
| **Web Component** | [`packages/widget`](file:///Users/shikharsingh/Downloads/code/realfi/anonpress/packages/widget) | [NPM](https://npmjs.com) + CDN | `npm login` / `NPM_TOKEN` | `pnpm --filter @pressprotocol/widget publish --access public` |
| **Python SDK** | [`sdks/python`](file:///Users/shikharsingh/Downloads/code/realfi/anonpress/sdks/python) | [PyPI](https://pypi.org) | PyPI API Token | `python3 -m twine upload sdks/python/dist/*` |
| **Go SDK** | [`sdks/go`](file:///Users/shikharsingh/Downloads/code/realfi/anonpress/sdks/go) | GitHub / Go Proxy | Git Tag & Push | `git tag sdks/go/v1.0.7 && git push origin sdks/go/v1.0.7` |
| **Rust SDK** | [`sdks/rust`](file:///Users/shikharsingh/Downloads/code/realfi/anonpress/sdks/rust) | [Crates.io](https://crates.io) | `cargo login` token | `cargo publish --manifest-path sdks/rust/Cargo.toml` |
| **Chrome Extension** | [`integrations/browser-extension`](file:///Users/shikharsingh/Downloads/code/realfi/anonpress/integrations/browser-extension) | [Chrome Web Store](https://chrome.google.com/webstore/devconsole) | $5 Developer Account | Upload `PressProtocol_Browser_Extension.zip` |
| **WordPress Plugin**| [`integrations/wordpress-plugin`](file:///Users/shikharsingh/Downloads/code/realfi/anonpress/integrations/wordpress-plugin) | [WordPress.org](https://wordpress.org/plugins/) | WordPress.org account | Upload via plugin submission portal |
| **Obsidian Plugin** | [`integrations/obsidian-plugin`](file:///Users/shikharsingh/Downloads/code/realfi/anonpress/integrations/obsidian-plugin) | Obsidian Community / GitHub | GitHub Releases | Attach `main.js`, `manifest.json`, `styles.css` |
| **GitHub Action** | [`integrations/publish-action`](file:///Users/shikharsingh/Downloads/code/realfi/anonpress/integrations/publish-action) | [GitHub Marketplace](https://github.com/marketplace) | GitHub Repository | Create Release with Marketplace checkbox enabled |

---

## 1. NPM Registries (TypeScript & JavaScript Packages)

### Packages:
1. `@pressprotocol/sdk` ([`packages/sdk`](file:///Users/shikharsingh/Downloads/code/realfi/anonpress/packages/sdk))
2. `@pressprotocol/proof` ([`packages/proof`](file:///Users/shikharsingh/Downloads/code/realfi/anonpress/packages/proof))
3. `@pressprotocol/widget` ([`packages/widget`](file:///Users/shikharsingh/Downloads/code/realfi/anonpress/packages/widget))

### One-Time Setup:
1. Log in to [npmjs.com](https://www.npmjs.com).
2. Create the `@pressprotocol` organization (or publish unscoped as `pressprotocol-sdk` if preferred).
3. In your local terminal:
   ```bash
   npm login
   ```
   *(Enter your NPM username, password, and email OTP).*

### Build & Publish:
```bash
# 1. Build all packages
pnpm --filter "@pressprotocol/*" run build

# 2. Publish with public access
pnpm --filter @pressprotocol/sdk publish --access public --no-git-checks
pnpm --filter @pressprotocol/proof publish --access public --no-git-checks
pnpm --filter @pressprotocol/widget publish --access public --no-git-checks
```

### Verification:
```bash
pnpm view @pressprotocol/sdk version
pnpm view @pressprotocol/proof version
pnpm view @pressprotocol/widget version
```

---

## 2. Python SDK (PyPI)

### Package:
`pressprotocol-py` ([`sdks/python`](file:///Users/shikharsingh/Downloads/code/realfi/anonpress/sdks/python))

### One-Time Setup:
1. Register on [pypi.org](https://pypi.org/).
2. Enable 2FA on your account.
3. Navigate to **Account settings** -> **API tokens** -> **Add API token**.
4. Set Scope to "Entire account" (or project if already created). Copy the token (`pypi-...`).

### Build & Publish:
```bash
# 1. Build wheel and source distribution using uv
uv build sdks/python

# 2. Upload to PyPI
uv publish --token <YOUR_PYPI_TOKEN> sdks/python/dist/*

# (Alternative with twine)
# python3 -m twine upload sdks/python/dist/* -u __token__ -p <YOUR_PYPI_TOKEN>
```

### Verification:
```bash
pip install pressprotocol-py
python3 -c "import pressprotocol; print(pressprotocol.__file__)"
```

---

## 3. Rust SDK (Crates.io)

### Package:
`pressprotocol-rs` ([`sdks/rust`](file:///Users/shikharsingh/Downloads/code/realfi/anonpress/sdks/rust))

### One-Time Setup:
1. Sign in to [crates.io](https://crates.io) via GitHub.
2. Go to **Account Settings** -> **API Tokens** -> **New Token**.
3. Log in locally:
   ```bash
   cargo login <YOUR_CRATES_IO_TOKEN>
   ```

### Verification & Publish:
```bash
# 1. Verify crate compiles cleanly
cargo check --manifest-path sdks/rust/Cargo.toml

# 2. Publish to Crates.io
cargo publish --manifest-path sdks/rust/Cargo.toml
```

### Verification:
```bash
cargo search pressprotocol-rs
```

---

## 4. Go SDK (Go Modules / GitHub)

### Package:
`github.com/0xshikhar/PressProtocol/sdks/go` ([`sdks/go`](file:///Users/shikharsingh/Downloads/code/realfi/anonpress/sdks/go))

### How Go Distribution Works:
Go does not require binary registry uploads; it uses Git tags directly:

### Tagging & Publishing:
```bash
# 1. Commit any recent changes to git
git add sdks/go
git commit -m "feat(sdk): finalize Go SDK with client-signed and resolve methods"

# 2. Create version tag matching module path
git tag sdks/go/v1.0.7
git push origin sdks/go/v1.0.7
```

### Verification:
```bash
go get github.com/0xshikhar/PressProtocol/sdks/go@v1.0.7
```


---

## 5. Chromium Browser Extension (Chrome Web Store)

### Location:
[`integrations/browser-extension`](file:///Users/shikharsingh/Downloads/code/realfi/anonpress/integrations/browser-extension)

### Package Zip:
```bash
cd integrations/browser-extension
pnpm install --frozen-lockfile
pnpm run build
zip -r ../../PressProtocol_Browser_Extension.zip . -x "node_modules/*" ".git/*"
cd ../..
```

### Submission Steps:
1. Open the [Chrome Web Store Developer Console](https://chrome.google.com/webstore/devconsole).
2. Pay the one-time $5 Google Developer registration fee if not already paid.
3. Click **"New Item"** -> Upload `PressProtocol_Browser_Extension.zip`.
4. Fill out Store Listing details:
   - **Detailed Description**: Use copy from `integrations/browser-extension/README.md`.
   - **Privacy Policy**: [https://pressprotocol.com/privacy](https://pressprotocol.com/privacy)
   - **Single Purpose**: "Sovereign web content clipping and decentralized archival to IPFS and Tor."
   - **Category**: Productivity / Developer Tools.
5. Submit for review (approval typically takes 24–48 hours).

---

## 6. WordPress Plugin (WordPress.org Plugin Directory)

### Location:
[`integrations/wordpress-plugin`](file:///Users/shikharsingh/Downloads/code/realfi/anonpress/integrations/wordpress-plugin)

### Package Zip:
```bash
cd integrations/wordpress-plugin
bash package.sh
cd ../..
```
This generates `PressProtocol_Wordpress_Plugin.zip` with validated `readme.txt` and Gutenberg assets.

### Submission Steps:
1. Sign in to [wordpress.org](https://wordpress.org).
2. Submit the zip at [wordpress.org/plugins/developers/add/](https://wordpress.org/plugins/developers/add/).
3. Once approved by the WordPress plugin review team, you receive SVN repository credentials (`https://plugins.svn.wordpress.org/pressprotocol/`).
4. Check out the SVN repo, copy the files into `trunk/`, and commit.

---

## 7. Automated Release via GitHub Actions

You can publish all packages simultaneously by setting repository secrets:

### Required GitHub Secrets (`Settings` -> `Secrets and variables` -> `Actions`):
- `NPM_TOKEN`: Automation token from npmjs.com.
- `PYPI_TOKEN`: API token (`pypi-...`) from pypi.org.
- `CRATES_IO_TOKEN`: API token from crates.io.

### To Trigger Automatic Release:
```bash
# Create and push a semantic version tag
git tag v1.0.6
git push origin v1.0.6
```

The workflow [`.github/workflows/publish-ecosystem.yml`](file:///Users/shikharsingh/Downloads/code/realfi/anonpress/.github/workflows/publish-ecosystem.yml) will automatically:
1. Build and publish all 3 NPM packages with public access.
2. Build and publish the Python wheel to PyPI.
3. Publish `pressprotocol-rs` to Crates.io.
4. Package the Browser Extension and WordPress Plugin into zip archives and attach them to a new GitHub Release.
