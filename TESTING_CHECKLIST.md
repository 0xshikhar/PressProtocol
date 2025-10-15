# Testing Checklist - Phase 1, 2A, 3

## 🚀 Quick Start

```bash
# Terminal 1: Start Backend
cd backend
npm run dev

# Terminal 2: Start Frontend
cd web-app
bun dev

# Open browser
http://localhost:3000
```

---

## ✅ Phase 1: Reading Experience

### Test Reading Page (`/read/[cid]`)

- [ ] **Progress Bar**
  - Navigate to any article
  - Scroll down → progress bar fills
  - Scroll up → progress bar decreases
  - Reaches 100% at bottom

- [ ] **Table of Contents**
  - Click TOC button (right side)
  - Sheet slides from right
  - Lists all H1-H4 headings
  - Click heading → smooth scroll
  - Active heading highlights

- [ ] **Typography**
  - Title is large serif (4xl/5xl)
  - Body text is 21px, line-height 1.58
  - Max width 680px
  - Proper spacing between paragraphs
  - Links are primary color
  - Code blocks have background

- [ ] **Reading Time**
  - "X min read" displays below title
  - Date format: "Oct 15, 2024"
  - Verified badge shows

- [ ] **Mobile Responsive**
  - Test on mobile viewport
  - TOC button accessible
  - Typography scales properly
  - Progress bar visible

---

## ✅ Phase 2A: Hybrid Discovery

### Test Discovery Feed (`/explore`)

- [ ] **Default Loading**
  - Content loads from backend indexer
  - No fallback alert shown
  - Items display correctly
  - Tags are clickable

- [ ] **Search by Tags**
  - Enter tags in search box
  - Press Enter or click Search
  - Filter badges appear
  - Results filtered correctly
  - Click × on badge → removes filter
  - Click "Clear all" → resets

- [ ] **Fallback Alert**
  - Go to Settings → Indexers
  - Disable official indexer
  - Return to /explore
  - Alert banner shows
  - Message about DHT fallback

### Test Indexer Settings (`/settings`)

- [ ] **View Indexers**
  - Click Settings in navbar
  - Click "Indexers" tab
  - Official indexer visible
  - Status shows "Active"
  - Toggle switch works

- [ ] **Add Custom Indexer**
  - Click "Add Indexer" button
  - Dialog opens
  - Enter invalid URL → error toast
  - Enter valid URL (e.g., `http://localhost:5000`)
  - Select type: Community
  - Click "Add Indexer"
  - Success toast shows
  - New indexer appears in list

- [ ] **Remove Indexer**
  - Click trash icon on custom indexer
  - Indexer removed
  - Success toast shows
  - Refresh page → still removed (localStorage)

- [ ] **Toggle Indexer**
  - Toggle switch on/off
  - Status changes (Active/Disabled)
  - Icon changes (CheckCircle/XCircle)
  - Refresh page → state persists

- [ ] **Persistence**
  - Add 2 custom indexers
  - Toggle one off
  - Close browser completely
  - Reopen → same configuration

---

## ✅ Phase 3: Writing Experience

### Test Write Page (`/write`)

- [ ] **Title Input**
  - Large serif input
  - Placeholder visible
  - Type title → updates

- [ ] **Tags**
  - Enter tag, press Enter → adds
  - Click "Add" button → adds
  - Click tag × → removes
  - Tags persist in draft

- [ ] **Enhanced Editor**
  - **Toolbar Buttons:**
    - [ ] H1, H2, H3 headings work
    - [ ] Bold, Italic formatting works
    - [ ] Bullet list, Numbered list work
    - [ ] Quote, Code block work
    - [ ] Link insertion works
    - [ ] Horizontal rule works

  - **Image Upload:**
    - [ ] Click Image button
    - [ ] File dialog opens
    - [ ] Select image < 5MB → uploads
    - [ ] Loading state shows
    - [ ] Success toast
    - [ ] Image appears in editor
    - [ ] Select non-image → error toast
    - [ ] Select > 5MB → error toast

- [ ] **Draft Auto-Save**
  - Type content for 30+ seconds
  - "Saving..." shows
  - "Saved just now" appears
  - Refresh page → content loads
  - Clear draft manually → works

- [ ] **Preview Mode**
  - Toggle "Preview" button
  - Shows rendered article
  - Title, tags, content visible
  - Toggle back → edit mode

- [ ] **Reading Stats**
  - Word count updates live
  - Reading time updates
  - Displays in header

- [ ] **Publish Flow**
  - Not authenticated → shows "Connect to Publish"
  - Click Connect → Privy login
  - After auth → shows "Publish" button
  - Click Publish → loading state
  - Success → redirects to `/read/[cid]`
  - Draft cleared after publish

---

## 🖼️ Backend: Image Upload

### Test Upload Endpoint

```bash
# Test valid image
curl -X POST http://localhost:4000/api/upload/image \
  -F "image=@test.jpg"

# Expected: 200 OK with CID and URL

# Test invalid file type
curl -X POST http://localhost:4000/api/upload/image \
  -F "image=@test.txt"

# Expected: 400 Bad Request

# Test file too large (> 5MB)
curl -X POST http://localhost:4000/api/upload/image \
  -F "image=@large.jpg"

# Expected: 413 Payload Too Large or 400 Bad Request
```

### Test in Editor

- [ ] Click Image button in editor
- [ ] Upload PNG → works
- [ ] Upload JPEG → works
- [ ] Upload GIF → works
- [ ] Upload WebP → works
- [ ] Upload PDF → fails with error
- [ ] Image shows with correct URL
- [ ] Image has `data-cid` attribute

---

## 🌐 End-to-End Flows

### Flow 1: Write and Read

1. [ ] Go to `/write`
2. [ ] Write article with:
   - Title
   - 2-3 paragraphs
   - 1 heading
   - 1 image
   - 2-3 tags
3. [ ] Publish (connect wallet if needed)
4. [ ] Redirects to `/read/[cid]`
5. [ ] All content displays correctly
6. [ ] Progress bar works
7. [ ] TOC shows heading
8. [ ] Reading time displays

### Flow 2: Discover and Read

1. [ ] Go to `/explore`
2. [ ] See published articles
3. [ ] Filter by tag
4. [ ] Click article → navigates to `/read/[cid]`
5. [ ] Read article
6. [ ] Return to explore → filter still active

### Flow 3: Configure Indexers

1. [ ] Go to `/settings`
2. [ ] Click "Indexers" tab
3. [ ] Add custom indexer
4. [ ] Disable official indexer
5. [ ] Go to `/explore`
6. [ ] See fallback alert
7. [ ] Return to settings
8. [ ] Re-enable official indexer
9. [ ] Go to `/explore`
10. [ ] No more fallback alert

---

## 🐛 Edge Cases

### Reading Page

- [ ] Article with no headings → TOC button hidden
- [ ] Very short article → progress bar at 100% immediately
- [ ] Very long article → progress bar smooth
- [ ] No tags → tags section hidden
- [ ] Anonymous publisher → no "Verified" badge

### Write Page

- [ ] Empty title + content → Publish disabled
- [ ] Only title → Publish disabled
- [ ] Only content → Publish disabled
- [ ] 100+ tags → scroll works
- [ ] Very long title → wraps properly
- [ ] Image upload while offline → error handled

### Discovery

- [ ] No content exists → "No content found" message
- [ ] All indexers disabled → fallback alert + empty results
- [ ] Search with no results → appropriate message
- [ ] Invalid tag characters → handled gracefully

### Indexer Settings

- [ ] Cannot remove official indexer
- [ ] Duplicate indexer URL → prevents adding
- [ ] Invalid URL format → validation error
- [ ] Very long indexer URL → truncates display

---

## 📱 Browser Compatibility

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## ⚡ Performance

- [ ] Reading page loads < 2s
- [ ] Progress bar updates at 60fps
- [ ] TOC opens instantly
- [ ] Discovery feed loads < 3s
- [ ] Image upload < 5s for 1MB file
- [ ] Draft save < 1s

---

## 🔐 Security

- [ ] Image upload validates file type
- [ ] Image upload enforces size limit
- [ ] XSS: Content properly sanitized
- [ ] CSRF: Not applicable (no cookies)
- [ ] Input validation on tags
- [ ] URL validation for indexers

---

## 💾 Data Persistence

- [ ] Draft survives page refresh
- [ ] Draft survives browser restart
- [ ] Indexer config survives restart
- [ ] Draft clears after publish
- [ ] Multiple drafts don't conflict

---

## 🎨 UI/UX

- [ ] All buttons have hover states
- [ ] Loading states show spinners
- [ ] Success/error toasts appear
- [ ] Icons align properly
- [ ] Typography is readable
- [ ] Dark mode works (if implemented)
- [ ] Responsive on tablet
- [ ] Accessible (keyboard navigation)

---

## 📊 Status Indicators

Mark each section:
- ✅ All tests pass
- ⚠️ Some tests fail
- ❌ Major issues
- 🚧 Not tested yet

### Current Status

- Phase 1 (Reading): 🚧
- Phase 2A (Discovery): 🚧
- Phase 3 (Writing): 🚧
- Backend (Upload): 🚧
- E2E Flows: 🚧
- Edge Cases: 🚧
- Performance: 🚧

---

## 🔧 Quick Fixes for Common Issues

### Backend won't start
```bash
cd backend
rm -rf node_modules
npm install
npm run dev
```

### Frontend won't build
```bash
cd web-app
rm -rf node_modules .next
bun install
bun dev
```

### Image upload fails
- Check Pinata JWT in `.env`
- Check backend `/api/upload/image` endpoint exists
- Check CORS settings

### Indexer not saving
- Check localStorage is enabled
- Check browser console for errors
- Try incognito mode (no extensions)

---

## 📝 Test Results Template

```markdown
**Tester**: [Your Name]
**Date**: [Date]
**Browser**: [Browser + Version]
**OS**: [Operating System]

### Phase 1: Reading
- Progress Bar: ✅/❌
- TOC: ✅/❌
- Typography: ✅/❌
- Reading Time: ✅/❌

### Phase 2A: Discovery
- Discovery Feed: ✅/❌
- Search: ✅/❌
- Indexer Settings: ✅/❌
- Fallback: ✅/❌

### Phase 3: Writing
- Editor: ✅/❌
- Image Upload: ✅/❌
- Draft Save: ✅/❌
- Publish: ✅/❌

### Issues Found
1. [Description]
2. [Description]

### Notes
[Any additional observations]
```

---

**Ready to test!** Start with the Quick Start section and work through each checklist. 🧪
