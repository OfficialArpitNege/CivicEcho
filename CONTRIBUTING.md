# CivicEcho - Contribution Guide

## Welcome to CivicEcho! 👋

We're excited to have you contribute to making civic engagement easier!

---

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- Git
- Firebase account

### Setup Development Environment
```bash
# Clone repository
git clone https://github.com/yourusername/civicecho.git
cd CivicEcho

# Follow QUICKSTART.md
```

---

## Development Workflow

### 1. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
# Format: feature/, bugfix/, docs/, etc.
```

### 2. Make Changes
- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update relevant documentation

### 3. Test Your Changes
```bash
# Backend
cd backend && npm run dev

# Frontend (new terminal)
cd frontend && npm run dev

# Test in browser: http://localhost:5173
```

### 4. Commit with Clear Messages
```bash
git add .
git commit -m "feat: add voice complaint feature"
# Use: feat:, fix:, docs:, style:, refactor:, test:, chore:
```

### 5. Push & Create Pull Request
```bash
git push origin feature/your-feature-name
# Create PR on GitHub with description
```

---

## Code Style Guide

### JavaScript/React
```javascript
// Use const by default
const myVariable = 'value';

// Use arrow functions
const myFunction = (param) => {
  return param * 2;
};

// Use meaningful variable names
const complaintDescription = 'Water leak'; // Good
const d = 'Water leak'; // Bad

// Add JSDoc comments for functions
/**
 * Creates a new complaint
 * @param {Object} data - Complaint data
 * @returns {Promise<Object>} Created complaint
 */
const createComplaint = async (data) => {
  // ...
};
```

### CSS/Tailwind
```jsx
// Use Tailwind classes
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  {/* content */}
</div>

// For complex styling, use component-level CSS
<style jsx>{`
  .custom-style {
    /* CSS here */
  }
`}</style>
```

---

## Feature Development Guide

### Adding a New Feature

1. **Create branch**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Backend changes** (if needed)
   - Add API endpoint in `src/routes/`
   - Add controller logic in `src/controllers/`
   - Add service logic in `src/services/`
   - Update Firestore schema in docs

3. **Frontend changes** (if needed)
   - Add page in `src/pages/`
   - Add components in `src/components/`
   - Add API calls in `src/services/`
   - Add routing if needed

4. **Update docs**
   - Update API_DOCUMENTATION.md
   - Update README.md with new feature
   - Add environment variables if needed

5. **Test thoroughly**
   - Test happy path
   - Test error cases
   - Test on different browsers
   - Test mobile responsiveness

---

## Commit Convention

```
type(scope): subject

body

footer
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation
- **style**: Code style
- **refactor**: Code refactoring
- **test**: Adding tests
- **chore**: Maintenance

### Examples
```
feat(complaints): add voice recording support
fix(auth): prevent token expiration issue
docs(api): add endpoint documentation
refactor(services): optimize database queries
```

---

## Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation
- [ ] Breaking change

## Changes Made
- Change 1
- Change 2

## Testing Done
- [ ] Tested locally
- [ ] Tested on mobile
- [ ] Tested error cases

## Checklist
- [ ] Code follows style guide
- [ ] Documentation updated
- [ ] No breaking changes
- [ ] Tests pass
- [ ] Commits are clean
```

---

## Testing Standards

### Backend
```javascript
// Test API endpoints
describe('POST /api/complaints', () => {
  it('should create complaint', async () => {
    const response = await request(app)
      .post('/api/complaints')
      .send({ /* data */ });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

### Frontend
```javascript
// Test React components
describe('<ReportComplaint />', () => {
  it('should render form', () => {
    const { getByText } = render(<ReportComplaint />);
    expect(getByText('Report an Issue')).toBeInTheDocument();
  });
});
```

---

## Documentation Standards

### Inline Comments
```javascript
// Use single-line comments for why, not what
// Check for duplicates within 24 hours
const timeThreshold = 24 * 60 * 60 * 1000;
```

### Function Documentation
```javascript
/**
 * Analyzes complaint text for categorization
 * @param {string} text - The complaint description
 * @returns {Promise<Object>} Category and severity
 * @throws {Error} If NLP analysis fails
 */
const analyzeComplaint = async (text) => {
  // ...
};
```

---

## Performance Guidelines

### Frontend
- Lazy load components
- Memoize expensive computations
- Optimize bundle size
- Minimize re-renders

### Backend
- Use database indexes
- Implement pagination
- Cache frequently accessed data
- Optimize API response size

---

## Security Checklist

- [ ] No hardcoded secrets
- [ ] Input validation on all APIs
- [ ] CORS properly configured
- [ ] Authentication checks
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] No sensitive data in logs

---

## Bug Report Template

```markdown
## Description
Clear description of the bug

## Steps to Reproduce
1. Step 1
2. Step 2

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Screenshots
If applicable

## Environment
- OS: 
- Browser:
- Version:
```

---

## Getting Help

- **Questions?** Open a discussion
- **Found a bug?** Create an issue
- **Want to help?** Pick an issue with `good-first-issue` label

---

## Code of Conduct

Be respectful, inclusive, and helpful to all contributors.

---

## License

By contributing, you agree your code will be licensed under MIT.

---

**Happy Contributing! 🎉**
