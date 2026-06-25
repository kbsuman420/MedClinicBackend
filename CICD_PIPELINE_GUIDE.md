# Production CI/CD Pipeline Configuration Guide

This guide explains how to prepare your backend for Continuous Integration / Continuous Deployment (CI/CD) and configure an automated pipeline using **GitHub Actions**.

---

## 1. Is this Backend Ready for CI/CD?

**Yes.** The backend is ready for a CI/CD pipeline because:
- **Environment variables** are completely separated from the codebase (using `.env` and `src/loadenv.js`).
- **Prisma Client** and database configuration are managed programmatically, and runtime overrides are supported.
- **Connection pooling** is managed using the `@prisma/adapter-pg` driver adapter.

To make the codebase fully prepared, we should automate:
1. **Dependency Installation**
2. **Prisma Client Generation**
3. **Database Migrations**
4. **Code Testing / Linting**
5. **Deployment to Production Servers** (e.g., Render, AWS, Heroku, DigitalOcean)

---

## 2. CI/CD Architecture (GitHub Actions Workflow)

Creating a GitHub Actions workflow allows you to build, test, and deploy your backend automatically every time code is pushed to your `main` branch.

### GitHub Actions Configuration File

Create a file named `.github/workflows/ci-cd.yml` in your project root with the following configuration:

```yaml
name: Node.js CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [20.x, 22.x]

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Generate Prisma Client
        run: npx prisma generate

      - name: Run Linting (Optional)
        run: npm run lint --if-present

      - name: Run Tests (Optional)
        run: npm test --if-present

  deploy:
    needs: build-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      # EXAMPLE 1: Deploying to Render via Deploy Hook (Fastest & Simplest)
      - name: Trigger Render Deploy Hook
        if: env.RENDER_DEPLOY_HOOK != ''
        env:
          RENDER_DEPLOY_HOOK: ${{ secrets.RENDER_DEPLOY_HOOK }}
        run: |
          curl -X POST "$RENDER_DEPLOY_HOOK"

      # EXAMPLE 2: SSH Deployment to VPS (DigitalOcean / AWS / Linode)
      - name: Deploy to VPS Server via SSH
        uses: appleboy/ssh-action@v1.0.3
        if: env.SSH_HOST != ''
        env:
          SSH_HOST: ${{ secrets.SSH_HOST }}
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USERNAME }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          port: 22
          script: |
            cd /var/www/medical-website-sinchan/Backend
            git pull origin main
            npm install --production
            npx prisma generate
            npx prisma migrate deploy
            pm2 restart medical-backend
```

---

## 3. Step-by-Step Implementation Guide

Follow these steps to configure your repository and server for the CI/CD pipeline:

### Step 1: Add a Linter and Test Suite (Highly Recommended)
Add testing and linting packages so the pipeline can catch errors before code is pushed to production:
```bash
npm install --save-dev eslint jest
```

### Step 2: Configure Environment Secrets in GitHub
1. Go to your repository on GitHub.
2. Navigate to **Settings** -> **Secrets and variables** -> **Actions**.
3. Under **Repository secrets**, click **New repository secret** and add your production variables:
   - `DATABASE_URL`: Your production database URL.
   - `RENDER_DEPLOY_HOOK`: If deploying to Render (obtained from Render Service dashboard).
   - `SSH_HOST`, `SSH_USERNAME`, `SSH_PRIVATE_KEY`: If deploying to a cloud VM via SSH.

### Step 3: Handle Production Database Migrations
Always run Prisma migrations in the deployment phase of the pipeline. 
The command to deploy migrations without modifying local state is:
```bash
npx prisma migrate deploy
```
This command checks the `prisma/migrations` directory and applies any pending migrations to the production database automatically.

### Step 4: Run Prisma Client Generation
Since `node_modules` is not committed to git, the Prisma Client code must be generated dynamically on the target server/CI builder. Ensure `npx prisma generate` is run *after* dependencies are installed but *before* the application starts.
