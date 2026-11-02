# MASTER PROJECT PROMPT
# Premium International Dynamic Blogging Platform

## 1. PROJECT OVERVIEW

Act as a senior full-stack software engineer, software architect, UI/UX designer, database architect, SEO specialist, and security engineer.

I want to build a premium, modern, fully dynamic international blogging platform where I can publish articles about interesting topics across different categories for a global audience.

This is not a basic blog website. It should be a professional publishing platform with a beautiful editorial reading experience, powerful administration panel, advanced media management, and a fully dynamic content management system.

The website must be:
- Fully dynamic.
- Fully responsive.
- SEO-friendly.
- Fast-loading.
- Interactive.
- Secure.
- Accessible.
- Easy to manage.
- Scalable in architecture.
- Deployable using free-tier services.

I am a software developer, and I want clean, maintainable, production-oriented code.

Prioritize actual functionality over visual demonstrations. Every button, form, dashboard statistic, and interactive component must perform its intended action.

Do not generate a basic template or generic AI-looking website.

---

## 2. TECHNOLOGY STACK

Use the following technologies:

### Frontend
- Next.js (latest stable version).
- React.js.
- TypeScript.
- Tailwind CSS.
- shadcn/ui.
- Lucide React icons.
- Framer Motion / Motion for animations.

### Backend and Database
- Supabase.
- Supabase PostgreSQL.
- Supabase Authentication.
- Supabase Storage.
- Supabase Row Level Security (RLS).

### Rich Text Editor
- Tiptap React.
- Tiptap extensions for formatting, images, links, tables, code blocks, and other content.

### Image Optimization
- browser-image-compression or an equivalent maintained library.
- WebP and AVIF where supported.
- Next.js Image component.

### Forms and Validation
- React Hook Form.
- Zod.

### Email
- EmailJS where appropriate for contact messages and simple email workflows.
- Keep email delivery credentials secure and never expose private secrets.

### Performance
- Next.js caching.
- Incremental Static Regeneration (ISR).
- On-demand cache revalidation.
- Lazy loading.
- Optimized database queries.

### Deployment
- GitHub.
- Vercel free tier.
- Supabase free tier.

Use compatible stable package versions. Avoid unnecessary dependencies.

---

## 3. DESIGN AND BRANDING DIRECTION

Create a visually stunning premium editorial website.

Design inspiration:
- Medium.
- Hashnode.
- The Verge.
- Stripe.
- Premium independent digital magazines.

Do not directly copy any existing design.

### Visual Direction

The design should feel:
- Premium.
- Minimal.
- Modern.
- Elegant.
- Editorial.
- Professional.
- Sophisticated.
- Comfortable for long-form reading.

### Design Requirements

- Beautiful typography.
- Excellent whitespace.
- Consistent spacing.
- Carefully selected color palette.
- Attractive article cards.
- Large editorial cover images.
- Subtle shadows and borders.
- Smooth transitions.
- Elegant hover interactions.
- Beautiful loading skeletons.
- Professional iconography.
- Consistent design system.

Implement:
- Light theme.
- Dark theme.
- Responsive layouts.
- Mobile-first design.
- Accessible contrast.
- Reduced-motion support.

Avoid:
- Excessive gradients.
- Unnecessary animations.
- Overcrowded layouts.
- Generic dashboard designs.
- Unnecessary decorative elements.

Create a unique visual identity for the publication.

---

## 4. PUBLIC WEBSITE STRUCTURE

Develop the following public pages.

### 4.1 Homepage (/)

Create a premium editorial homepage.

Sections:
1. Modern navigation bar.
2. Website logo and branding.
3. Navigation links.
4. Search functionality.
5. Theme toggle.
6. Featured article hero section.
7. Latest articles.
8. Trending articles.
9. Popular articles.
10. Editor's picks.
11. Featured categories.
12. Newsletter subscription.
13. Author introduction.
14. Professional footer.

All article information must be retrieved dynamically from Supabase.

The administrator must be able to control featured content through the admin dashboard.

### 4.2 Blog Listing (/blog)

Features:
- Display all published articles.
- Grid and list layouts.
- Search articles.
- Filter by category.
- Filter by tags.
- Sort by newest.
- Sort by oldest.
- Sort by popularity.
- Pagination or load more.
- Responsive article cards.
- Loading skeletons.
- Empty states.
- Error handling.

### 4.3 Single Article (/blog/[slug])

Create a premium long-form reading experience.

Display:
- Article title.
- Subtitle.
- Excerpt.
- Cover image.
- Author information.
- Published date.
- Updated date.
- Estimated reading time.
- Category.
- Tags.
- Rich article content.
- Table of contents.
- Reading progress indicator.
- Social sharing.
- Copy article link.
- Bookmark functionality.
- Like functionality.
- Related articles.
- Previous and next articles.
- Author biography.
- Comments section.
- Newsletter subscription.

#### Article Reading Experience

- Excellent typography.
- Comfortable reading width.
- Proper heading hierarchy.
- Responsive images.
- Elegant blockquotes.
- Beautiful code blocks.
- Image captions.
- Proper paragraph spacing.
- Smooth table of contents navigation.
- No horizontal overflow.

Comments should be configurable from the admin dashboard.

### 4.4 Category Pages (/category/[slug])

Features:
- Category name.
- Description.
- Category image.
- Featured category article.
- Category-specific articles.
- Sorting.
- Pagination.

### 4.5 Tag Pages (/tag/[slug])

Display all articles associated with the selected tag.

### 4.6 Search (/search)

Build a fully functional search system.

Search across:
- Article titles.
- Article content.
- Excerpts.
- Categories.
- Tags.

Features:
- Search suggestions.
- Search results.
- Loading states.
- Empty states.
- Search highlighting where appropriate.

Use Supabase full-text search where suitable.

### 4.7 About (/about)

Include:
- Author biography.
- Personal introduction.
- Interests.
- Topics covered.
- Mission and vision.
- Social media links.

### 4.8 Contact (/contact)

Create a professional contact page.

Form fields:
- Name.
- Email.
- Subject.
- Message.

Requirements:
- Form validation.
- Success messages.
- Error messages.
- Spam protection.
- Secure submission.

Use EmailJS only where appropriate. Do not expose private credentials or sensitive service keys.

### 4.9 Additional Pages

Create:
- /privacy-policy
- /terms-and-conditions
- /cookie-policy
- /newsletter
- Custom 404 page.

---

## 5. ADMIN PANEL AND AUTHENTICATION

The admin panel is one of the most important parts of the entire project.

Create a professional, modern administration system.

Admin entry URL:

/admin

### 5.1 Admin Login

When a visitor accesses /admin:

1. Display a professional admin login screen.
2. Request email and password.
3. Authenticate through Supabase Auth.
4. Verify administrator authorization on the server.
5. Redirect authorized administrators to /admin/dashboard.
6. Redirect unauthenticated users to the login screen.
7. Provide logout functionality.
8. Maintain secure sessions.

#### Security Requirements

- Never hardcode admin credentials.
- Never expose service-role keys.
- Never rely only on frontend route protection.
- Verify admin authorization on the server.
- Protect API routes and server actions.
- Use Supabase RLS.
- Use secure cookie-based session handling.
- Prevent unauthorized admin registration.
- Do not allow ordinary authenticated users to access admin functionality.

Create a safe initial administrator provisioning procedure.

### 5.2 Admin Layout

Create a professional dashboard layout with:
- Responsive sidebar.
- Top navigation.
- Website branding.
- Admin profile.
- Notifications where implemented.
- Breadcrumb navigation.
- Theme toggle.
- Logout button.

Sidebar navigation:
- Dashboard.
- Posts.
- New Post.
- Categories.
- Tags.
- Media Library.
- Comments.
- Subscribers.
- Contact Messages.
- Analytics.
- Settings.

Make the sidebar collapsible and mobile-friendly.

### 5.3 Dashboard (/admin/dashboard)

Create an informative administration dashboard.

#### Statistics

Display actual database statistics:
- Total articles.
- Published articles.
- Draft articles.
- Scheduled articles.
- Total categories.
- Total tags.
- Total views.
- Total comments.
- Total subscribers.

#### Charts

Include:
- Article publishing activity.
- Views over time.
- Popular articles.
- Recent activity.
- Content performance.

Use real database data.

Never present hardcoded demo statistics as actual website analytics.

Include useful empty states when there is insufficient data.

---

## 6. ARTICLE MANAGEMENT SYSTEM

Route:

/admin/posts

Implement complete CRUD functionality.

Features:
- Create articles.
- Edit articles.
- Delete articles.
- Publish articles.
- Save as drafts.
- Schedule publication.
- Preview articles.
- Duplicate articles.
- Search articles.
- Filter by status.
- Manage featured articles.
- Manage article visibility.

Article statuses:
- Draft.
- Published.
- Scheduled.
- Archived.

The public website must only display articles that are published and eligible for publication.

Implement proper scheduling logic rather than relying only on a manually selected status.

---

## 7. ADVANCED BLOG EDITOR

Route:

/admin/posts/new

Build a professional, distraction-free rich-text editor using Tiptap.

The editor should feel like a premium publishing application.

### 7.1 Article Information

Include:
- Article title.
- Automatic slug generator.
- Editable slug.
- Subtitle.
- Excerpt.
- Main content.
- Cover image.
- Category selection.
- Multiple tag selection.
- Author selection where applicable.
- SEO title.
- SEO description.
- Canonical URL.
- Open Graph image.
- Featured article toggle.
- Publication scheduling.
- Draft/publish controls.

### 7.2 Text Formatting

Support:
- Paragraphs.
- H1, H2, H3, H4.
- Bold.
- Italic.
- Underline.
- Strikethrough.
- Text alignment.
- Ordered lists.
- Unordered lists.
- Nested lists.
- Blockquotes.
- Horizontal rules.
- Hyperlinks.
- Inline code.
- Code blocks with syntax highlighting.
- Tables.
- Text highlighting.
- Undo.
- Redo.

### 7.3 Image Support Inside the Editor

Image support is mandatory.

Administrators must be able to insert images directly into article content.

Provide these options:
1. Upload a new image.
2. Select an existing image from the Media Library.
3. Drag and drop an image.
4. Paste an image from the clipboard where supported.

All new image uploads must use the same image optimization pipeline as the Media Library.

#### Image Controls

After inserting an image, administrators should be able to:
- Resize images.
- Align images left.
- Align images center.
- Align images right.
- Set image width.
- Add image captions.
- Add alternative text.
- Edit image descriptions.
- Replace images.
- Remove images.
- Preview images.

Support:
- Standard full-width images.
- Centered images.
- Left/right aligned images.
- Images with captions.
- Responsive image galleries.
- Side-by-side layouts where suitable.

Never allow images to overflow the article content container.

### 7.4 Editor Experience

Include:
- Sticky formatting toolbar where appropriate.
- Contextual toolbar.
- Image-specific toolbar.
- Automatic draft saving.
- Save status indicator.
- Word count.
- Character count.
- Estimated reading time.
- Live preview.
- Keyboard shortcuts.
- Undo and redo.
- Clear placeholder text.

Use appropriate debouncing for autosave.

Avoid overwriting newer changes with older asynchronous save requests.

### 7.5 Article Content Storage

Store article content as structured Tiptap JSON in Supabase PostgreSQL.

Preserve:
- Text formatting.
- Images.
- Image references.
- Captions.
- Alt text.
- Links.
- Tables.
- Code blocks.
- Embedded content.

Render the structured content safely on the public article page.

Do not store the entire article as untrusted raw HTML.

---

## 8. ADVANCED IMAGE UPLOADER AND OPTIMIZATION SYSTEM

This is a core platform feature.

Create a reusable, professional image management system integrated with Supabase Storage.

The same uploader must work in:
- Media Library.
- Blog editor.
- Cover image selector.
- Other administrative image fields.

### 8.1 Image Upload Interface

Build a modern drag-and-drop uploader.

Features:
- Drag and drop.
- Click to browse.
- Multiple image selection.
- Preview before uploading.
- Upload progress.
- Upload cancellation where supported.
- Upload error handling.
- File validation.
- Duplicate image handling.
- Responsive interface.

Supported source formats:
- JPG.
- JPEG.
- PNG.
- WebP.
- AVIF where browser decoding is supported.

### 8.2 Automatic Image Optimization

Before uploading, automatically optimize the image.

Use browser-image-compression or another reliable image-processing library.

Requirements:
- Reduce file size.
- Preserve visually lossless quality wherever possible.
- Maintain original aspect ratio.
- Avoid image distortion.
- Resize excessively large images.
- Remove unnecessary metadata where appropriate.
- Support WebP output.
- Support AVIF where reliable.
- Avoid unnecessary repeated compression.
- Preserve transparency when converting transparent images.

Suggested configurable settings:
- Maximum width: 1920px.
- Maximum height: 1920px.
- WebP quality: 85–90.
- Maintain aspect ratio.
- Skip resizing when unnecessary.

These settings must be adjustable.

Do not promise mathematically lossless compression when using lossy WebP or AVIF encoding.

### 8.3 Optimization Results

Show actual optimization statistics.

Display:
- Original image preview.
- Optimized image preview.
- Original file size.
- Optimized file size.
- Percentage saved.
- Original dimensions.
- Final dimensions.
- Output format.

Example:

Original: 2.5 MB
Optimized: 420 KB
Saved: 83.2%

Calculate these values using actual files.

Do not display fake compression statistics.

### 8.4 Supabase Storage

Create a dedicated Supabase Storage bucket:

blog-media

Suggested folder structure:

blog-media/
    covers/
    articles/
    thumbnails/
    avatars/
    general/

Implement:
- Secure uploads.
- Public image delivery for published content.
- Authenticated administrator uploads.
- Administrator-only deletion.
- Unique filenames.
- Organized storage paths.
- Appropriate Storage policies.
- Server-side authorization.

Never expose Supabase service-role keys in frontend code.

Do not assume that a public bucket provides secure upload or deletion permissions. Configure these separately.

### 8.5 Media Library

Route:

/admin/media

Create a professional image management dashboard.

Display all uploaded images in a responsive grid.

Each image card should show:
- Image preview.
- Filename.
- File size.
- Image dimensions.
- File format.
- Upload date.

#### Media Actions

- Preview.
- Select.
- Delete.
- Copy image URL.
- View details.
- Search.
- Filter.
- Sort by newest.
- Sort by oldest.
- Pagination or load more.

Add an image detail panel or modal.

### 8.6 Image Selection Modal

Create a reusable image picker.

When the administrator clicks "Select Image" in the article editor:

1. Open a media library modal.
2. Show previously uploaded images.
3. Allow searching.
4. Allow selecting an existing image.
5. Allow uploading a new image.
6. Optimize newly uploaded images.
7. Show upload progress.
8. Allow selection confirmation.
9. Return the selected image URL and metadata to the editor.

Support both single-image and multiple-image selection depending on the operation.

Do not force administrators to upload the same image repeatedly.

### 8.7 Image Deletion

Implement safe deletion.

Before deleting:
- Show a confirmation dialog.
- Check whether the image is referenced by published articles or other content.
- Warn when an image is in use.
- Explain the consequences.

After confirmation:
- Delete the storage object.
- Update media metadata.
- Handle errors.
- Avoid leaving broken references silently.

Use a safe deletion workflow and prevent accidental removal of important images.

### 8.8 Media Database Table

Create a media_assets table.

Suggested fields:
- id.
- filename.
- original_filename.
- storage_path.
- public_url.
- mime_type.
- file_size.
- original_file_size.
- width.
- height.
- format.
- alt_text.
- caption.
- uploaded_by.
- created_at.
- updated_at.

Add appropriate indexes, relationships, and RLS policies.

Maintain references between media assets and article content where practical.

### 8.9 Public Image Performance

Implement:
- Next.js Image component.
- Responsive sizing.
- Lazy loading below the fold.
- Priority loading for hero images.
- Width and height attributes.
- Modern formats.
- Appropriate placeholders.
- Descriptive alt text.
- Avoid layout shifts.

Use Supabase image transformations only when supported by the selected plan and configuration.

Do not assume image transformation services are free.

---

## 9. CATEGORY MANAGEMENT

Route:

/admin/categories

Implement:
- Create categories.
- Edit categories.
- Delete categories.
- Category name.
- Slug.
- Description.
- Category image.
- Associated article count.

Use the Media Library for category image selection.

Prevent deletion from silently breaking article relationships.

## 10. TAG MANAGEMENT

Route:

/admin/tags

Features:
- Create tags.
- Edit tags.
- Delete tags.
- Search tags.
- Display associated article counts.

## 11. COMMENT MANAGEMENT

Route:

/admin/comments

Features:
- View comments.
- Approve comments.
- Reject comments.
- Delete comments.
- Spam management.
- Search comments.

Provide public comment submission only when comments are enabled.

Add validation and rate limiting.

## 12. NEWSLETTER AND SUBSCRIBER MANAGEMENT

Route:

/admin/subscribers

Features:
- View subscribers.
- Search subscribers.
- Export subscriber list.
- Remove subscribers.
- Manage subscription status.
- Unsubscribe functionality.

Implement email confirmation and consent-aware subscription handling.

Do not assume EmailJS is a complete bulk newsletter delivery system. Design the newsletter architecture so a suitable provider can be integrated later.

## 13. CONTACT MESSAGE MANAGEMENT

Route:

/admin/messages

Features:
- View contact messages.
- Read message details.
- Mark as read/unread.
- Archive messages.
- Delete messages.
- Search messages.

Store messages securely in Supabase.

## 14. ANALYTICS

Route:

/admin/analytics

Track useful content statistics.

Include:
- Article views.
- Most popular articles.
- Views over time.
- Category performance.
- Publishing activity.
- Engagement statistics where available.

Avoid invasive tracking.

Use privacy-conscious analytics and clearly distinguish estimated or approximate metrics from verified unique visitors.

Do not claim unique visitors unless the implementation actually supports that measurement.

## 15. WEBSITE SETTINGS

Route:

/admin/settings

Allow administrators to configure:

### General
- Website name.
- Website description.
- Logo.
- Favicon.
- Default author.
- Social media links.

### SEO
- Default SEO title.
- Default SEO description.
- Default Open Graph image.
- Website canonical URL.

### Content
- Default article settings.
- Comments enabled/disabled.
- Featured content.
- Reading experience settings.

### Appearance
- Theme preferences.
- Brand colors where configurable.

### Newsletter
- Subscription settings.

### Analytics
- Analytics configuration.

Validate settings and store them securely.

---

## 16. DATABASE ARCHITECTURE

Use Supabase PostgreSQL.

Create proper SQL migrations.

Suggested tables:
1. profiles
2. posts
3. categories
4. tags
5. post_tags
6. media_assets
7. comments
8. subscribers
9. bookmarks
10. post_likes
11. post_views
12. site_settings
13. contact_messages

### Database Requirements

Implement:
- Primary keys.
- Foreign keys.
- Unique constraints.
- Indexes.
- Timestamps.
- Proper relationships.
- Database migrations.
- RLS policies.
- Appropriate data types.
- Efficient queries.

Use structured Tiptap JSON for article content.

Store image metadata in media_assets.

Do not store unnecessary duplicate data.

Create appropriate constraints for article slugs, user roles, publication status, and subscription status.

Provide all SQL migration files and instructions.

---

## 17. PERFORMANCE AND CACHING

Performance is extremely important.

Implement:
- Next.js Server Components by default.
- Client Components only when needed.
- Optimized images.
- Lazy loading.
- ISR where suitable.
- On-demand cache revalidation.
- Database query optimization.
- Pagination.
- Efficient rendering.
- Minimal JavaScript.
- Loading skeletons.
- Error boundaries.
- Appropriate caching strategies.

When an administrator creates, edits, publishes, or deletes an article, revalidate the affected public pages.

Ensure newly published content appears without a full website rebuild.

Never publicly cache private admin information.

Do not cache authenticated responses in a shared public cache.

---

## 18. SEO AND INTERNATIONAL AUDIENCE

Implement comprehensive SEO.

Include:
- Dynamic page titles.
- Meta descriptions.
- Canonical URLs.
- Open Graph metadata.
- Twitter/X cards.
- Dynamic XML sitemap.
- robots.txt.
- RSS feed.
- Article JSON-LD.
- Breadcrumb structured data.
- Semantic HTML.
- Proper heading hierarchy.
- Image alt text.
- Clean URL slugs.

Optimize article pages for search engines.

Prepare the architecture for future multilingual expansion without complicating the initial implementation.

---

## 19. INTERACTIVE FEATURES

Implement:
- Light/dark mode.
- Article bookmarks.
- Article likes.
- Social sharing.
- Reading progress.
- Table of contents.
- Newsletter subscriptions.
- Search suggestions.
- Copy article link.
- Responsive mobile navigation.
- Smooth transitions.
- Animated article cards.
- Back-to-top button.
- Cookie consent banner.
- Interactive media library.
- Rich-text editor interactions.
- Image previews.
- Upload progress indicators.

All interactive features must actually work.

Do not create decorative buttons that perform no action.

---

## 20. SECURITY REQUIREMENTS

Follow production-oriented security practices.

Implement:
- Supabase Auth.
- Server-side admin authorization.
- Database RLS.
- Storage RLS.
- Input validation.
- XSS protection.
- Secure cookies.
- CSRF protection where applicable.
- Rate limiting.
- Spam protection.
- Secure image uploads.
- Environment variable management.
- Safe error handling.

Never commit secrets to GitHub.

Create a complete .env.example file containing placeholder values only.

Never expose:
- Supabase service-role keys.
- Private API credentials.
- Email service secrets.
- Database passwords.

Validate uploads on both client and server where feasible.

Treat user-submitted content as untrusted.

---

## 21. ACCESSIBILITY

Follow WCAG accessibility principles.

Include:
- Keyboard navigation.
- Visible focus indicators.
- Semantic HTML.
- Accessible form labels.
- Proper color contrast.
- Screen-reader-friendly components.
- Accessible dialogs and menus.
- Alt text.
- Reduced-motion support.
- Accessible rich-text controls.

Ensure both public and admin interfaces are accessible.

---

## 22. RESPONSIVE DESIGN

The entire platform must work perfectly on:
- Mobile phones.
- Tablets.
- Laptops.
- Desktop computers.
- Large screens.

Use mobile-first design.

Pay particular attention to:
- Navigation.
- Article reading width.
- Article cards.
- Admin sidebar.
- Dashboard charts.
- Data tables.
- Forms.
- Image uploader.
- Media library.
- Image selection modal.
- Rich-text editor.

The admin panel must remain usable on mobile devices.

---

## 23. ZERO-COST ARCHITECTURE

My objective is to build and operate the website without paying for services.

Prioritize:
- GitHub for source control.
- Vercel free tier for deployment.
- Supabase free tier for database, authentication, and storage.
- EmailJS free tier where suitable.

Before using an external service, verify its current free-tier limitations.

Explain:
- Database limits.
- Storage limits.
- Bandwidth limits.
- Hosting limits.
- Email limits.
- Image upload limits.
- Potential inactivity restrictions.

Do not introduce paid services without explaining why they are necessary.

Design the application to degrade gracefully when usage limits are reached.

Avoid unnecessary external APIs.

Use free and open-source libraries wherever possible.

Remember that free-tier availability, commercial-use permissions, and limits may change.

---

## 24. PROJECT STRUCTURE AND CODE QUALITY

Use TypeScript throughout.

Maintain:
- Reusable components.
- Clean folder structure.
- Consistent naming.
- Reusable hooks.
- Centralized configuration.
- Proper server/client separation.
- Maintainable database queries.
- Proper error handling.
- Type-safe data models.

Avoid:
- Monolithic components.
- Repeated code.
- Unnecessary dependencies.
- Fake functionality.
- Hardcoded article data presented as dynamic content.
- Hardcoded dashboard statistics.
- Exposed credentials.
- Unnecessary client-side rendering.

Keep the image optimization logic in reusable utilities.

Use one common image uploader across the platform.

Use reusable UI components for:
- Buttons.
- Dialogs.
- Forms.
- Tables.
- Cards.
- Image uploaders.
- Media selectors.
- Loading states.
- Error states.

---

## 25. TESTING

Implement appropriate testing throughout development.

Test:

### Authentication
- Admin login.
- Invalid credentials.
- Session persistence.
- Unauthorized access.
- Logout.

### Content Management
- Create article.
- Edit article.
- Delete article.
- Draft.
- Publish.
- Schedule.

### Media Management
- Upload image.
- Optimize image.
- Verify compression statistics.
- Upload to Supabase Storage.
- Select existing image.
- Insert image into editor.
- Delete image.
- Handle failed uploads.

### Public Website
- Article rendering.
- Search.
- Category filtering.
- Responsive design.
- SEO metadata.
- Cache revalidation.

### Security
- Unauthorized admin access.
- RLS policies.
- Storage policies.
- Input validation.
- Upload validation.

Do not claim that a feature is complete unless it has been implemented and appropriately tested.

---

## 26. DEVELOPMENT WORKFLOW

IMPORTANT: Do not generate the entire project in one uncontrolled code dump.

Develop the application in clear phases.

### Phase 1: Architecture and Initial Setup
- Finalize architecture.
- Create Next.js project.
- Configure TypeScript.
- Configure Tailwind CSS.
- Install shadcn/ui.
- Install dependencies.
- Establish folder structure.
- Configure environment variables.

### Phase 2: Database and Supabase
- Configure Supabase.
- Create database schema.
- Create SQL migrations.
- Configure authentication.
- Configure RLS.
- Configure Storage bucket and policies.
- Create initial admin provisioning instructions.

### Phase 3: Public Website
- Build homepage.
- Build navigation.
- Build footer.
- Build blog listing.
- Build article layout.
- Build category pages.
- Build search.
- Build About and Contact pages.

### Phase 4: Dynamic Content System
- Connect articles to Supabase.
- Implement article fetching.
- Implement categories and tags.
- Implement dynamic routes.
- Implement publication status.
- Implement caching and revalidation.

### Phase 5: Admin Authentication
- Build /admin login.
- Implement Supabase Auth.
- Implement server-side role verification.
- Protect administrative routes.

### Phase 6: Admin Dashboard
- Build dashboard layout.
- Build sidebar.
- Build statistics.
- Build charts.
- Build navigation.

### Phase 7: Image Management System
- Build reusable image uploader.
- Implement image optimization.
- Implement Supabase Storage integration.
- Build media library.
- Build image selection modal.
- Implement safe image deletion.
- Integrate the image picker with article editing.

### Phase 8: Rich Text Article Editor
- Integrate Tiptap.
- Implement formatting.
- Implement image insertion.
- Implement image alignment and resizing.
- Implement captions and alt text.
- Implement autosave.
- Implement live preview.
- Implement publishing workflow.

### Phase 9: Additional Admin Features
- Category management.
- Tag management.
- Comment management.
- Subscriber management.
- Contact messages.
- Analytics.
- Website settings.

### Phase 10: Interactive Features and SEO
- Bookmarks.
- Likes.
- Newsletter.
- Social sharing.
- Cookie consent.
- SEO.
- Sitemap.
- RSS.
- Structured data.

### Phase 11: Testing and Optimization
- Security testing.
- Performance optimization.
- Accessibility checks.
- Responsive testing.
- Database query optimization.
- Final bug fixes.

### Phase 12: Deployment
- Configure GitHub.
- Configure Vercel.
- Configure Supabase production settings.
- Set environment variables.
- Configure custom domain if available.
- Test production deployment.
- Prepare documentation.

---

## 27. EXPECTED FINAL DELIVERABLES

At the end of the project, provide:

1. Complete source code.
2. Full project folder structure.
3. SQL migration files.
4. Supabase configuration instructions.
5. Storage bucket and RLS configuration.
6. Admin provisioning instructions.
7. .env.example file.
8. Local development instructions.
9. Deployment instructions.
10. Security documentation.
11. SEO documentation.
12. README.md.
13. Testing instructions.

---

## 28. FINAL INSTRUCTIONS

Build a premium, fully dynamic, secure, responsive international blogging platform.

The public website must deliver an exceptional editorial reading experience.

The administration panel must provide complete control over content, images, categories, tags, subscribers, comments, analytics, and website settings.

The image management system must automatically optimize uploaded images, display actual compression results, store optimized images in Supabase Storage, and allow administrators to browse, select, preview, and delete images.

The rich-text editor must support professional article formatting and seamless image integration through the Media Library.

Use clean architecture and reusable components.

Prioritize functionality, maintainability, security, performance, and design quality.

Do not skip important implementation details.

Do not invent completed features.

Do not use paid services unnecessarily.

### MOST IMPORTANT DEVELOPMENT RULE

Start with Phase 1 only.

First explain the proposed architecture, folder structure, dependencies, and setup commands.

Then implement Phase 1 completely.

Do not jump to Phase 2 until I review and approve Phase 1.

Work as my senior development partner throughout the project.
