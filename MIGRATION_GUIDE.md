# Migration Guide: From dodoc to \_doc Repository

This guide explains how to migrate your local repository from the old `dodoc` repository to the new `_doc` repository without losing your work or starting over.

## Prerequisites

- You have cloned from `https://github.com/l-atelier-des-chercheurs/dodoc`
- You are currently on any branch (e.g., `lumadoc-next`, `main`, `dev`, etc.)
- You have local changes or commits you want to preserve

**Important:** The new `_doc` repository only has `main` and `dev` branches. If you're on a different branch (like `lumadoc-next`), you'll need to either push it to create it in the new repo, or switch to `main`/`dev`.

## Migration Steps

### Step 1: Check Your Current Remote

First, verify which remote you're currently tracking:

```bash
git remote -v
```

You should see something like:

```
origin  https://github.com/l-atelier-des-chercheurs/dodoc.git (fetch)
origin  https://github.com/l-atelier-des-chercheurs/dodoc.git (push)
```

### Step 2: Update the Remote URL

Change your `origin` remote to point to the new repository:

```bash
git remote set-url origin https://github.com/l-atelier-des-chercheurs/_doc.git
```

Verify the change:

```bash
git remote -v
```

You should now see:

```
origin  https://github.com/l-atelier-des-chercheurs/_doc.git (fetch)
origin  https://github.com/l-atelier-des-chercheurs/_doc.git (push)
```

### Step 3: (Optional) Add Old Repository as Upstream

If you want to keep tracking the old repository for reference, add it as an `upstream` remote:

```bash
git remote add upstream https://github.com/l-atelier-des-chercheurs/dodoc.git
```

This allows you to:

- Compare changes between repositories
- Pull updates from the old repo if needed
- Keep a reference to the original source

### Step 4: Fetch from the New Repository

Fetch all branches and tags from the new repository:

```bash
git fetch origin
```

### Step 5: Check Available Branches

The new `_doc` repository has two branches: `main` and `dev`. Check what branches are available:

```bash
git branch -a
```

You should see `remotes/origin/main` and `remotes/origin/dev` in the list.

**Note:** If you're on `lumadoc-next` or another branch, it won't exist in the new repository yet. You have a few options:

### Step 6: Choose Your Branch Strategy

#### Option A: Continue on Your Current Branch (e.g., `lumadoc-next`)

If you want to keep working on your current branch:

1. Your local branch remains unchanged
2. When ready, push it to the new repository (it will be created):
   ```bash
   git push -u origin lumadoc-next
   ```

#### Option B: Switch to `main` or `dev`

If you want to align with the new repository structure:

1. Checkout the branch you want (e.g., `main`):

   ```bash
   git checkout -b main origin/main
   ```

   Or for `dev`:

   ```bash
   git checkout -b dev origin/dev
   ```

2. If you have changes on `lumadoc-next` you want to bring over:
   ```bash
   # Merge your lumadoc-next changes into the new branch
   git merge lumadoc-next
   ```

#### Option C: Keep Your Branch and Track `main` or `dev`

You can keep your local branch but set up tracking to one of the new branches:

```bash
# If you want to track main
git branch --set-upstream-to=origin/main

# Or if you want to track dev
git branch --set-upstream-to=origin/dev
```

### Step 7: Pull Latest Changes (Optional)

If you switched to `main` or `dev`, you can pull the latest changes:

```bash
# For main branch
git pull origin main

# Or for dev branch
git pull origin dev
```

**Note:** If you have local commits that aren't in the new repository, you may need to merge or rebase. Be careful with this step if you have uncommitted changes.

### Step 8: Verify Everything Works

Test that everything is working correctly:

```bash
# Check remote status
git remote -v

# Check branch tracking
git branch -vv

# Check if you can fetch
git fetch origin
```

## Troubleshooting

### Issue: My branch (e.g., `lumadoc-next`) doesn't exist in new repository

The new `_doc` repository only has `main` and `dev` branches. If you're on a different branch:

**Option 1:** Push your branch to create it in the new repository:

```bash
git push -u origin lumadoc-next
```

**Option 2:** Switch to `main` or `dev`:

```bash
# Switch to main
git checkout -b main origin/main

# Or switch to dev
git checkout -b dev origin/dev
```

**Option 3:** Merge your branch into `main` or `dev`:

```bash
# First checkout main or dev
git checkout -b main origin/main

# Then merge your changes
git merge lumadoc-next
```

### Issue: Merge conflicts when pulling

If you get merge conflicts:

1. Review the conflicts:

   ```bash
   git status
   ```

2. Resolve conflicts manually, then:
   ```bash
   git add .
   git commit
   ```

### Issue: Want to keep both remotes

You can keep both remotes for reference:

```bash
# Keep origin pointing to new repo
git remote set-url origin https://github.com/l-atelier-des-chercheurs/_doc.git

# Add old repo as upstream
git remote add upstream https://github.com/l-atelier-des-chercheurs/dodoc.git

# Fetch from both
git fetch origin
git fetch upstream
```

## Quick Migration Script

For a quick migration, you can run these commands in sequence:

```bash
# Update remote to new repository
git remote set-url origin https://github.com/l-atelier-des-chercheurs/_doc.git

# Fetch from new repository
git fetch origin

# Verify available branches
git branch -a | grep origin

# Option 1: Push your current branch (if it's not main or dev)
# git push -u origin $(git branch --show-current)

# Option 2: Switch to main branch
# git checkout -b main origin/main

# Option 3: Switch to dev branch
# git checkout -b dev origin/dev

# Verify
git remote -v
git branch -vv
```

**Note:** Uncomment the option that matches your needs (Option 1, 2, or 3).

## After Migration

Once migrated, you can:

- Continue working normally: `git add`, `git commit`, `git push`
- Pull updates:
  - `git pull origin main` (if on main)
  - `git pull origin dev` (if on dev)
  - `git pull origin your-branch-name` (if you pushed your custom branch)
- Create new branches: `git checkout -b new-feature`
- Push branches: `git push -u origin new-feature`

**Available branches in the new repository:**

- `main` - Main branch
- `dev` - Development branch

## Important Notes

- **Your local commits are preserved** - changing the remote URL doesn't affect your local history
- **Your uncommitted changes are safe** - they remain in your working directory
- **You can always switch back** - if needed, you can change the remote URL back
- **The old repository still exists** - you can reference it via the `upstream` remote if you add it

## Need Help?

If you encounter issues during migration:

1. Check your current status: `git status`
2. Verify your remotes: `git remote -v`
3. Check branch tracking: `git branch -vv`
4. Review this guide again for the specific step you're on
