# AnonPress → Medium-Like Platform Implementation Plan

Transform AnonPress into a beautiful anonymous content publishing platform similar to Medium.

---

## 🎯 Core Goals

1. **Beautiful Reading**: Medium-quality typography and layout
2. **Rich Discovery**: Trending, topics, recommendations
3. **Enhanced Writing**: Better editor, drafts, image uploads
4. **Social Engagement**: Claps, bookmarks, comments (anonymous)
5. **Content Curation**: Topics, quality scoring, featured content

---

## 📊 Implementation Priority

### Phase 1: Reading Experience (Week 1) - HIGH PRIORITY

**Features:**
- [ ] Medium-style typography (Charter font, 21px, 1.58 line-height)
- [ ] Reading time calculator
- [ ] Reading progress bar
- [ ] Table of contents (auto-generated from headings)
- [ ] Hero image support
- [ ] Improved article layout (max-width 680px)
- [ ] Share buttons (Twitter, Facebook, Copy Link)

**Files to Create/Modify:**
```
web-app/src/app/read/[cid]/page.tsx          - Update layout
web-app/src/lib/reading-time.ts              - NEW
web-app/src/components/reader/ProgressBar.tsx - NEW
web-app/src/components/reader/TableOfContents.tsx - NEW
```

---

### Phase 2: Enhanced Discovery (Week 2) - HIGH PRIORITY

**Features:**
- [ ] Trending algorithm (Wilson score + time decay)
- [ ] Related articles (tag/topic matching)
- [ ] Topic pages (/topic/technology)
- [ ] Advanced search (full-text + filters)
- [ ] "Popular this week" section
- [ ] Staff picks / Featured content

**Backend:**
```typescript
// backend/src/services/TrendingService.ts - NEW
// backend/src/services/RecommendationService.ts - NEW
// backend/src/routes/topics.ts - NEW
```

**Frontend:**
```typescript
// web-app/src/app/trending/page.tsx - NEW
// web-app/src/app/topic/[slug]/page.tsx - NEW
// web-app/src/components/discovery/TrendingFeed.tsx - NEW
```

**Database Schema:**
```prisma
model ContentMetadata {
  id            String   @id @default(cuid())
  contentId     String   @unique
  readingTime   Int      // minutes
  wordCount     Int
  viewCount     Int      @default(0)
  clapCount     Int      @default(0)
  bookmarkCount Int      @default(0)
  qualityScore  Float    @default(0)
}

model Topic {
  id           String   @id @default(cuid())
  name         String   @unique
  slug         String   @unique
  description  String?
  contentCount Int      @default(0)
  featured     Boolean  @default(false)
}
```

---

### Phase 3: Writing Experience (Week 3) - MEDIUM PRIORITY

**Features:**
- [ ] Enhanced Tiptap editor (slash commands, better toolbar)
- [ ] Image upload to IPFS
- [ ] Drag-and-drop images
- [ ] Drafts system (auto-save every 30s in localhost)
- [ ] Preview mode
- [ ] Embed support (YouTube, Twitter)
- [ ] Code syntax highlighting
- [ ] Hero image selection

**Files:**
```
web-app/src/components/editor/EnhancedEditor.tsx - MODIFY
web-app/src/components/editor/ImageUpload.tsx - NEW
web-app/src/app/write/page.tsx - NEW (drafts UI)
backend/src/routes/upload.ts - NEW (image uploads)
backend/src/routes/drafts.ts - NEW
```

**Database:**
```prisma
model Draft {
  id        String   @id @default(cuid())
  userId    String?  // Optional
  title     String
  content   String   // Store in DB
  tags      String[]
  heroImage String?
  status    String   @default("draft")
  createdAt DateTime @default(now())
web-app/src/components/reader/ClapButton.tsx - NEW
web-app/src/components/reader/BookmarkButton.tsx - NEW
web-app/src/components/reader/Comments.tsx - NEW
web-app/src/components/reader/ShareModal.tsx - NEW
```

**Backend:**
```
backend/src/routes/engagement.ts - NEW (claps, bookmarks)
backend/src/routes/comments.ts - NEW
```

**Database:**
```prisma
model Engagement {
  id          String   @id @default(cuid())
  contentId   String
  type        String   // "clap", "bookmark", "view"
  fingerprint String?  // Browser fingerprint
  count       Int      @default(1)
  createdAt   DateTime @default(now())
  
  @@index([contentId, type])
}

model Bookmark {
  id          String   @id @default(cuid())
  contentId   String
  userId      String?
  fingerprint String?
  listName    String   @default("Reading List")
  createdAt   DateTime @default(now())
}

model Comment {
  id         String    @id @default(cuid())
  contentId  String
  commentCid String    @unique // On IPFS
  authorHash String    // Anonymous ID
  parentId   String?   // For replies
  clapCount  Int       @default(0)
  createdAt  DateTime  @default(now())
}
```

---

### Phase 5: Content Curation - ⚠️ OUT OF SCOPE (Privacy Concerns)

**Why Out of Scope:**
- Curation requires centralized algorithms and tracking
- Contradicts privacy-first philosophy
- User preferences should be local, not server-tracked

**Privacy-Preserving Alternative:**
- Client-side filtering (localStorage preferences)
- No server-side tracking
- User-controlled algorithms

**Features:**
- [ ] Editorial picks
- [ ] Topic management
- [ ] Quality scoring algorithm
- [ ] Content recommendations
- [ ] Personalized feed (based on reading history)
- [ ] Collections/Series

---

## 🎨 Key Design Changes

### Typography System
```css
/* Medium-style reading */
.article-content {
  font-family: Charter, Georgia, serif;
  font-size: 21px;
  line-height: 1.58;
  max-width: 680px;
  margin: 0 auto;
}

.article-content h1 {
  font-size: 42px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1rem;
}

.article-content p {
  margin-bottom: 2rem;
}
```

### Component Hierarchy
```
HomePage
├── HeroSection
├── TrendingFeed        (NEW)
├── TopicGrid          (NEW)
├── FeaturedContent    (NEW)
└── RecentFeed

ReadPage
├── ReadingProgressBar  (NEW)
├── HeroImage          (NEW)
├── ArticleHeader
├── ArticleContent
├── TableOfContents    (NEW)
├── EngagementBar      (NEW - Claps, Bookmarks, Share)
├── RelatedArticles    (NEW)
└── CommentsSection    (NEW)

WritePage (NEW)
├── AutoSaveIndicator
├── EnhancedEditor
│   ├── ImageUpload
│   ├── EmbedHandler
│   └── FormatToolbar
└── PublishSettings
```

---

## 🛠️ Technical Implementation

### 1. Reading Time Calculator
```typescript
// web-app/src/lib/reading-time.ts
export function calculateReadingTime(html: string): {
  minutes: number;
  words: number;
} {
  const text = html.replace(/<[^>]*>/g, '');
  const words = text.split(/\s+/).length;
  const minutes = Math.ceil(words / 200); // 200 WPM
  
  return { minutes, words };
}
```

### 2. Trending Algorithm
```typescript
// backend/src/services/TrendingService.ts
export function calculateTrendingScore(
  views: number,
  claps: number,
  bookmarks: number,
  ageInHours: number
): number {
  const engagement = claps + (bookmarks * 2);
  const engagementRate = views > 0 ? engagement / views : 0;
  const timeDecay = Math.exp(-ageInHours / 48); // 48h half-life
  
  return engagementRate * timeDecay * 100;
}
```

### 3. Image Upload Flow
```typescript
// POST /api/upload/image
1. User selects image
2. Upload to backend
3. Backend uploads to IPFS via Pinata
4. Return CID and gateway URL
5. Insert into editor as <img src="ipfs://..." data-cid="Qm..." />
```

### 4. Claps System
```typescript
// Anonymous engagement tracking
1. Generate browser fingerprint (privacy-safe)
2. Store engagement with fingerprint
3. Max 50 claps per user per article
4. Animate clap button
5. Update total count
```

---

## 📈 Success Metrics

### User Engagement
- Average reading time > 3 minutes
- Claps per article > 5
- Bookmark rate > 10%
- Return visitor rate > 30%

### Content Quality
- Average word count > 800
- Articles with images > 60%
- Reading completion rate > 50%

### Platform Growth
- New articles per day > 20
- Unique readers per day > 1000
- Trending articles refreshed daily

---

## 🚀 Quick Start Implementation

### Week 1: Reading Experience

**Day 1-2: Typography & Layout**
```bash
# Update read page with Medium typography
web-app/src/app/read/[cid]/page.tsx
- Add Charter font
- Set proper line-height
- Max-width 680px
- Better heading styles
```

**Day 3-4: Reading Metrics**
```bash
# Add reading time and progress bar
web-app/src/lib/reading-time.ts (NEW)
web-app/src/components/reader/ProgressBar.tsx (NEW)
- Calculate reading time
- Show progress bar on scroll
```

**Day 5-7: Enhanced Features**
```bash
# Table of contents, hero images
web-app/src/components/reader/TableOfContents.tsx (NEW)
- Auto-generate from headings
- Smooth scroll to sections
- Hero image support
```

### Week 2: Discovery & Trending

**Day 1-3: Trending Algorithm**
```bash
backend/src/services/TrendingService.ts (NEW)
backend/src/routes/trending.ts (NEW)
- Wilson score calculation
- Time decay
- Quality weighting
```

**Day 4-5: Frontend**
```bash
web-app/src/app/trending/page.tsx (NEW)
web-app/src/components/discovery/TrendingFeed.tsx (NEW)
- Display trending content
- Filters and sorting
```

**Day 6-7: Topics & Related**
```bash
backend/src/services/RecommendationService.ts (NEW)
web-app/src/app/topic/[slug]/page.tsx (NEW)
- Topic pages
- Related articles
```

---

## 💾 Database Migrations

```bash
# Add metadata table
npx prisma migrate dev --name add_content_metadata

# Add topics
npx prisma migrate dev --name add_topics

# Add engagement
npx prisma migrate dev --name add_engagement

# Add bookmarks
npx prisma migrate dev --name add_bookmarks

# Add comments
npx prisma migrate dev --name add_comments

# Add drafts
npx prisma migrate dev --name add_drafts
```

---

## 📝 Next Immediate Steps

1. **Start with Typography** (2 hours)
   - Update `/read/[cid]/page.tsx`
   - Add Charter font
   - Improve spacing and layout

2. **Add Reading Time** (1 hour)
   - Create reading-time utility
   - Display in article header

3. **Implement Progress Bar** (2 hours)
   - Create ProgressBar component
   - Add scroll listener

4. **Test & Polish** (1 hour)
   - Test on mobile
   - Adjust spacing
   - Dark mode support

**Total Time: 6 hours for MVP reading experience**

---

## 🎯 Questions to Resolve

1. **Should we use topics or stick with tags only?**
   - Topics: Better curation, cleaner UX
   - Tags: More flexible, already implemented
   - Recommendation: Use both (topics as curated collections of tags)

2. **Anonymous user management?**
   - Option A: Browser fingerprint (privacy-safe)
   - Option B: Local storage UUID
   - Option C: Optional wallet address
   - Recommendation: Fingerprint + optional wallet

3. **Image storage limits?**
   - Free Pinata: 1GB
   - Recommendation: Limit images to 5MB each, max 10 per article

4. **Comment moderation?**
   - All on IPFS (immutable)
   - Flag/hide abusive comments client-side
   - Community moderation via "helpful" votes

---

## 📚 Resources

- **Medium's Typography**: Charter, 21px, 1.58 line-height
- **Trending Algorithm**: Wilson Score Interval
- **Engagement**: Max 50 claps (like Medium)
- **Reading Time**: 200 words per minute average

---

Ready to implement! Start with **Phase 1** for immediate impact.
