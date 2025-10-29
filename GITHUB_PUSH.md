# GitHub Push Guide - SocialFlow

## \ud83d\udcdd Pushing to Branch: `apps/socialflow`

### Step 1: Initialize Git Repository

```bash
cd /app/socialflow

# Initialize git if not already done
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: SocialFlow v1.0.0 - Enterprise Social Media Manager

- Multi-platform support (Instagram, YouTube, LinkedIn, Facebook, Threads)
- Full-stack: React + FastAPI + MongoDB
- Kanban workflow with Draft/Scheduled/Posted
- Content previews and analytics
- RESTful API with documentation
- Enterprise-ready structure
- Powered by Elysiom branding"
```

### Step 2: Connect to Your Elysiom Repository

```bash
# Add your remote repository
git remote add origin <YOUR_ELYSIOM_REPO_URL>

# For example:
# git remote add origin https://github.com/your-username/elysiom-projects.git
```

### Step 3: Create and Push to Branch

```bash
# Create and switch to the apps/socialflow branch
git checkout -b apps/socialflow

# Push to remote
git push -u origin apps/socialflow
```

### Step 4: Verify

After pushing, verify on GitHub:
1. Go to your repository
2. Switch to branch `apps/socialflow`
3. Check that all files are present
4. Verify README.md displays correctly

## \ud83d\udcdd What Gets Pushed

```
socialflow/
\u251c\u2500\u2500 README.md              # Complete documentation
\u251c\u2500\u2500 DEPLOYMENT.md         # Deployment guide
\u251c\u2500\u2500 .gitignore            # Git ignore rules
\u251c\u2500\u2500 package.json          # Root package config
\u251c\u2500\u2500 start.sh              # Startup script
\u251c\u2500\u2500 stop.sh               # Stop script
\u251c\u2500\u2500 frontend/             # React application
\u2502   \u251c\u2500\u2500 src/
\u2502   \u251c\u2500\u2500 public/
\u2502   \u251c\u2500\u2500 package.json
\u2502   \u251c\u2500\u2500 .env.example
\u2502   \u2514\u2500\u2500 .gitignore
\u2514\u2500\u2500 backend/              # FastAPI application
    \u251c\u2500\u2500 app/
    \u251c\u2500\u2500 main.py
    \u251c\u2500\u2500 requirements.txt
    \u251c\u2500\u2500 .env.example
    \u2514\u2500\u2500 .gitignore
```

## \ud83d\udd12 What Gets Ignored

The following are automatically excluded via .gitignore:
- `node_modules/`
- `venv/` and `env/`
- `.env` files (only `.env.example` is included)
- `build/` and `dist/`
- `__pycache__/` and `*.pyc`
- IDE files (`.vscode/`, `.idea/`)
- Logs and database files

## \ud83d\udcdd For Team Members Cloning

Once pushed, team members can clone and run with:

```bash
# Clone the repository
git clone <YOUR_ELYSIOM_REPO_URL>
cd <repo-name>

# Checkout the SocialFlow branch
git checkout apps/socialflow

# Install dependencies
cd frontend && yarn install
cd ../backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt

# Configure environment
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
# Edit .env files as needed

# Start the app
cd .. && chmod +x start.sh && ./start.sh
```

## \ud83c\udf10 Branch Structure Recommendation

```
main
 \u251c\u2500\u2500 Your main Elysiom website code
 \u2514\u2500\u2500 apps/socialflow (separate branch)
      \u2514\u2500\u2500 Standalone SocialFlow product
```

This keeps the product completely separate while maintaining it in the same repository.

## \u2705 Pre-Push Checklist

Before pushing, verify:
- [ ] All `.env.example` files are present
- [ ] No actual `.env` files with secrets
- [ ] No `node_modules/` or `venv/` directories
- [ ] README.md is complete and accurate
- [ ] `start.sh` and `stop.sh` are executable
- [ ] All necessary files are tracked by git

## \ud83d\udee0\ufe0f Troubleshooting

**Issue: Large files or folders being pushed**
```bash
# Check what's being tracked
git status

# Remove from staging if needed
git rm -r --cached node_modules
git rm -r --cached venv
```

**Issue: Previous commits with secrets**
```bash
# Remove sensitive file from history
git filter-branch --force --index-filter \\\n  \"git rm --cached --ignore-unmatch backend/.env\" \\\n  --prune-empty --tag-name-filter cat -- --all
```

## \ud83d\udcdd Next Steps After Push

1. **Add Collaborators**: Add team members to the repository
2. **Branch Protection**: Set up branch protection rules
3. **CI/CD**: Set up GitHub Actions for testing (optional)
4. **Documentation**: Link to this branch in main README
5. **Releases**: Create releases/tags for versions

## \ud83d\udcde Support

For issues with the code or setup:
- Check DEPLOYMENT.md for detailed setup
- Review README.md for usage instructions
- Contact: support@elysiom.com

---

**Elysiom** - Agentic Automation Platform
