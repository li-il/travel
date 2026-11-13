# Photo privacy cleanup

## Changes

- Cleaned embedded metadata in 14 existing photos and macOS extended attributes on all 16 images in `src/assets`. The original cleanup verified identical decoded pixels, dimensions, ICC color profiles, and display rotation.
- Added `scripts/clean-image-metadata.py`, using ExifTool to remove EXIF, GPS, camera/device details, capture dates, XMP, IPTC, comments, thumbnails, and other writable metadata. Only rendering metadata (ICC profiles, orientation, PNG color information, and ExifTool-required color positioning) is copied back. Images are not recompressed.
- Added `npm run photos:setup` for a project-local ExifTool installation, avoiding Homebrew compatibility issues. Added cleanup and check commands to `package.json`. Builds clean source images automatically; deployment rebuilds first. A cleanup error stops the build.
- Updated GitHub Actions to install ExifTool and use Node 24 for Vite 8. Publishing `main` builds the site and updates `gh-pages`.

## Setup

Use Node 24, npm, Python 3.9 or later, and ExifTool. On macOS:

```sh
cd ~/Desktop/travel
npm run photos:setup
npm install --legacy-peer-deps
```

The setup command downloads official ExifTool 13.59 source from GitHub, verifies its pinned SHA-256 checksum, and installs it in ignored `.tools/exiftool`. It requires curl and Perl (included with macOS). A system ExifTool, if installed, takes precedence. Re-run setup after cloning to another computer. Alternatively, on macOS use `brew install exiftool`. On Ubuntu, install ExifTool with `sudo apt-get install libimage-exiftool-perl`.

## Clean photos before committing or publishing

From the travel workspace:

```sh
npm run photos:clean
npm run photos:check
```

These commands scan `src/assets` and `public` recursively, including JPEG, PNG, WebP, TIFF, HEIC/HEIF, and AVIF files. Unsupported file types are skipped; ExifTool warnings or unsupported writes fail the command. Formats are detected by ExifTool even when an extension is misleading. Originals are updated in place without leaving metadata-bearing `_original` backups. On macOS, removable filesystem extended attributes are also cleared. The protected `com.apple.provenance` and `com.apple.macl` system bookkeeping attributes may remain or be recreated by macOS and are ignored by check mode; they are not embedded in image data or tracked by Git. Keep any private originals outside this repository.

Check mode reports tag names without printing private values, leaves files unchanged, and exits with status 1 if targeted privacy metadata remains.

To clean or check a particular folder or file (quote paths containing spaces):

```sh
python3 scripts/clean-image-metadata.py "src/assets/trips"
python3 scripts/clean-image-metadata.py --check "src/assets/trips"
```

## Build and publish

```sh
npm run build
git add src/assets public scripts .gitignore package.json .github/workflows/deploy.yml IMAGE_PRIVACY.md README.md
git commit -m "Clean photo metadata and add reusable privacy workflow"
git push origin main
```

`npm run build` automatically cleans photos first. Pushing `main` triggers the existing GitHub Pages deployment workflow. For a manual deployment with configured Git credentials, `npm run deploy` cleans and rebuilds before publishing `dist`.

Cleanup affects current files. Previously published copies, caches, and Git history retain their older metadata; this change does not rewrite history. Locations and dates visible in photo content, filenames, folder paths, or website text remain visible.

## Validation for this update

- Verified all 16 source images against the previous Git originals: identical decoded pixels, dimensions, ICC profiles, and display rotation.
- Tested injected GPS, author, capture date, XMP, IPTC, and comment metadata: check mode detected it, cleanup removed it, and output did not reveal private values.
- Verified cleanup is idempotent and handles filenames with spaces and a WebP image with a `.png` extension.
