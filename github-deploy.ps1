# PowerShell script to upload MuscleXA site to GitHub and configure GitHub Pages

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   MUSCLEXA SITE GITHUB SETUP SCRIPT" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Ensure git is installed
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "Git is not installed on this system. Please install Git and try again."
    Exit
}

# 2. Check if already a git repository
if (!(Test-Path ".git")) {
    Write-Host "[*] Initializing local Git repository..." -ForegroundColor Yellow
    git init
} else {
    Write-Host "[*] Git repository already initialized." -ForegroundColor Green
}

# 3. Create .gitignore if it doesn't exist
if (!(Test-Path ".gitignore")) {
    Write-Host "[*] Creating .gitignore file..." -ForegroundColor Yellow
    $gitignoreContent = @"
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
"@
    Set-Content -Path ".gitignore" -Value $gitignoreContent
}

# 4. Stage and commit files
Write-Host "[*] Staging all project files..." -ForegroundColor Yellow
git add .

Write-Host "[*] Committing files..." -ForegroundColor Yellow
git commit -m "feat: initial commit of MuscleXA supplement website"

# 5. Rename default branch to main
Write-Host "[*] Setting default branch name to 'main'..." -ForegroundColor Yellow
git branch -M main

# 6. Ask for GitHub Repository URL
Write-Host ""
$repoUrl = Read-Host "Please enter your GitHub Repository URL (e.g., https://github.com/username/repository-name.git)"
$repoUrl = $repoUrl.Trim()

if ([string]::IsNullOrEmpty($repoUrl)) {
    Write-Host "[!] Repository URL cannot be empty. Setup aborted. You can link it later manually using:" -ForegroundColor Red
    Write-Host "    git remote add origin <your-repository-url>"
    Write-Host "    git push -u origin main"
    Exit
}

# 7. Set Remote Origin
# Remove origin if it already exists to avoid errors
if (git remote | Select-String "origin") {
    Write-Host "[*] Removing existing remote origin..." -ForegroundColor Yellow
    git remote remove origin
}

Write-Host "[*] Linking remote origin to $repoUrl..." -ForegroundColor Yellow
git remote add origin $repoUrl

# 8. Push to GitHub
Write-Host ""
Write-Host "[*] Pushing files to GitHub main branch..." -ForegroundColor Cyan
git push -u origin main -f

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "   CODE SUCCESSFULLY UPLOADED TO GITHUB" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "To host it on GitHub Pages:" -ForegroundColor Yellow
Write-Host "1. Go to your GitHub repository in your web browser." -ForegroundColor White
Write-Host "2. Click on 'Settings' -> 'Pages' in the left menu." -ForegroundColor White
Write-Host "3. Under 'Build and deployment' -> 'Source', select 'GitHub Actions'." -ForegroundColor White
Write-Host "4. The workflow in .github/workflows/deploy.yml will automatically run, build, and deploy the site." -ForegroundColor White
Write-Host ""
Write-Host "Press any key to close this window..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
