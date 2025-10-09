# Contributing to AnonPress

Thank you for your interest in contributing to AnonPress! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Prioritize censorship resistance and user privacy

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Docker (optional)
- Git

### Setup Development Environment

```bash
# Clone repository
git clone https://github.com/anonpress/anonpress.git
cd anonpress

# Run setup script
./scripts/setup.sh

# Start development
./scripts/dev.sh
```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Make Changes

Follow the code style guidelines below.

### 3. Test Your Changes

```bash
# Run tests
./scripts/test.sh

# Manual testing
npm run dev
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add feature description"
```

Commit message format:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test changes
- `chore:` Build/config changes

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then open a Pull Request on GitHub.

## Code Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Use explicit types (avoid `any`)
- Use async/await over promises
- Handle errors properly

Example:
```typescript
export async function resolveContent(cid: string): Promise<ResolvedContent> {
  try {
    const content = await prisma.content.findUnique({
      where: { cid },
    });
    
    if (!content) {
      throw new Error('Content not found');
    }
    
    return content;
  } catch (error) {
    logger.error('Error resolving content:', error);
    throw error;
  }
}
```

### React/Next.js

- Use functional components
- Use hooks for state management
- Keep components small and focused
- Use TypeScript interfaces for props

Example:
```typescript
interface ContentCardProps {
  title: string;
  cid: string;
  onPublish?: () => void;
}

export function ContentCard({ title, cid, onPublish }: ContentCardProps) {
  return (
    <div className="content-card">
      <h3>{title}</h3>
      <code>{cid}</code>
      {onPublish && <button onClick={onPublish}>Publish</button>}
    </div>
  );
}
```

### PHP (WordPress Plugin)

- Follow WordPress coding standards
- Sanitize all inputs
- Escape all outputs
- Use nonces for forms
- Document functions

Example:
```php
/**
 * Publish post to AnonPress
 *
 * @param int $post_id Post ID
 * @return array|WP_Error Result or error
 */
function anonpress_publish_post($post_id) {
    // Verify nonce
    check_admin_referer('anonpress_publish', 'nonce');
    
    // Sanitize input
    $post_id = absint($post_id);
    
    // Process
    $result = do_publish($post_id);
    
    return $result;
}
```

## Project Structure

```
anonpress/
├── backend/              # Fastify API
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   ├── lib/         # Utilities
│   │   └── config/      # Configuration
│   └── prisma/          # Database schema
├── web-app/             # Next.js app
│   └── src/
│       ├── app/         # Pages
│       ├── components/  # React components
│       └── lib/         # Utilities
├── wordpress-plugin/    # WordPress plugin
│   ├── includes/        # PHP classes
│   ├── templates/       # PHP templates
│   └── assets/          # CSS/JS
└── browser-extension/   # Plasmo extension
    ├── background.ts    # Service worker
    └── popup.tsx        # Popup UI
```

## Areas for Contribution

### High Priority

- [ ] Comprehensive test suite
- [ ] Real Tor control port integration
- [ ] Rate limiting and abuse prevention
- [ ] Performance optimization
- [ ] Security audit

### Medium Priority

- [ ] Media upload support (images, videos)
- [ ] Content editing capability
- [ ] Comments and reactions
- [ ] Publisher profiles
- [ ] Advanced search

### Low Priority

- [ ] Analytics dashboard
- [ ] Mobile app
- [ ] Additional language support
- [ ] Theme customization
- [ ] Export/import tools

## Testing

### Backend Tests

```bash
cd backend
npm test
```

### Web App Tests

```bash
cd web-app
npm test
```

### End-to-End Tests

```bash
./scripts/test.sh
```

## Documentation

- Update README.md if adding features
- Add JSDoc/TSDoc comments for functions
- Update API documentation
- Add examples for new features

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] No commented-out code
- [ ] Git history is clean

### PR Description

Include:
- What does this PR do?
- Why is this change needed?
- How has this been tested?
- Screenshots (if UI changes)
- Related issues

### Review Process

1. Automated checks must pass
2. Code review by maintainers
3. Address feedback
4. Squash commits if needed
5. Merge to main

## Security

### Reporting Vulnerabilities

**Do not open public issues for security vulnerabilities.**

Email security@anonpress.io with:
- Description of vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Security Best Practices

- Never commit secrets
- Validate all inputs
- Sanitize all outputs
- Use parameterized queries
- Enable CORS properly
- Use HTTPS in production

## Performance

### Guidelines

- Optimize database queries
- Use indexes appropriately
- Cache when possible
- Minimize bundle size
- Lazy load components
- Optimize images

### Monitoring

- Check bundle size: `npm run analyze`
- Profile components with React DevTools
- Monitor API response times
- Check database query performance

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create git tag
4. Push tag
5. GitHub Actions builds release
6. Deploy to production

## Questions?

- GitHub Discussions for questions
- GitHub Issues for bugs
- Discord for chat (coming soon)
- Email team@anonpress.io

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to censorship-resistant publishing! 🛡️
