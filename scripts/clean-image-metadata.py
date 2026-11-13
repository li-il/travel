#!/usr/bin/env python3
"""Remove private image metadata without recompressing images. Requires ExifTool."""
import argparse
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import os

ROOT = Path(__file__).resolve().parents[1]
SUPPORTED = {'.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.heic', '.heif', '.avif'}
PRIVATE_TAGS = ['-EXIF:all', '-XMP:all', '-IPTC:all', '-MakerNotes:all',
                '-Photoshop:all', '-Comment', '-PNG:TextualData', '-Trailer:all']


def run(args):
    result = subprocess.run(args, text=True, capture_output=True)
    if result.returncode:
        raise RuntimeError(result.stderr.strip() or result.stdout.strip())
    warnings = [line for line in result.stderr.splitlines()
                if line.strip() and not line.startswith('Warning: No writable tags set from ')]
    if warnings:
        # Missing rendering tags are normal; all other warnings fail the cleanup.
        raise RuntimeError('\n'.join(warnings))
    return result.stdout


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Report private tags; do not modify files.')
    parser.add_argument('paths', nargs='*', help='Files or folders; default: src/assets and public.')
    args = parser.parse_args()
    tool = shutil.which('exiftool')
    local = ROOT/'.tools/exiftool/exiftool'
    command = [tool] if tool else ['perl', str(local)] if local.is_file() else None
    if not command:
        parser.error('ExifTool is required. Run npm run photos:setup first.')
    roots = [Path(p).resolve() for p in args.paths] if args.paths else [ROOT/'src/assets', ROOT/'public']
    files = set()
    for root in roots:
        if not root.exists():
            parser.error(f'Path does not exist: {root}')
        candidates = root.rglob('*') if root.is_dir() else [root]
        for path in candidates:
            if path.is_file() and not path.is_symlink() and path.suffix.lower() in SUPPORTED:
                files.add(path.resolve())
    files = sorted(files)
    if not files:
        print('No supported images found.')
        return 0
    if not args.check:
        # Copy back only rendering metadata. ExifTool edits containers without re-encoding pixels.
        for path in files:
            kind = json.loads(run([*command, '-j', '-FileTypeExtension', str(path)]))[0].get('FileTypeExtension')
            if not kind or '.' + kind.lower() not in SUPPORTED:
                raise RuntimeError(f'Unsupported image content: {path}')
            # Stage with the actual format extension (some project .png files are WebP).
            # ExifTool validates write formats using both the content and the extension.
            with tempfile.TemporaryDirectory(prefix='.photo-clean-', dir=path.parent) as temp:
                staged = Path(temp)/('image.' + kind)
                shutil.copyfile(path, staged)
                shutil.copymode(path, staged)
                run([*command, '-overwrite_original', '-all=', '--ICC_Profile:all',
                     '-TagsFromFile', '@', '-Orientation', '-PNG:SRGBRendering',
                     '-PNG:Gamma', '-PNG:Chromaticities', str(staged)])
                if staged.read_bytes() != path.read_bytes():
                    os.replace(staged, path)
            if sys.platform == 'darwin':
                run(['/usr/bin/xattr', '-c', str(path)])
    issues = 0
    for path in files:
        metadata = json.loads(run([*command, '-j', '-G1', '-s', *PRIVATE_TAGS, str(path)]))[0]
        tags = [tag for tag in metadata if tag not in {'SourceFile', 'IFD0:Orientation', 'IFD0:YCbCrPositioning'}]
        if sys.platform == 'darwin':
            attrs = set(run(['/usr/bin/xattr', str(path)]).splitlines())
            # macOS maintains this protected bookkeeping attribute automatically.
            if attrs - {'com.apple.provenance', 'com.apple.macl'}:
                tags.append('filesystem extended attributes')
        if tags:
            issues += 1
            # Print tag names only, never their potentially sensitive values.
            print(f'{path.relative_to(ROOT) if path.is_relative_to(ROOT) else path}: {", ".join(tags)}')
    if issues:
        print(f'Privacy metadata found in {issues} of {len(files)} images.', file=sys.stderr)
        return 1
    print(f'{"Checked" if args.check else "Cleaned and checked"} {len(files)} images; no targeted privacy metadata remains.')
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (RuntimeError, OSError, ValueError) as exc:
        print(f'Image cleanup failed: {exc}', file=sys.stderr)
        sys.exit(1)
