#!/usr/bin/env python3
"""Install a pinned, checksum-verified portable ExifTool in the ignored .tools folder."""
import hashlib
from pathlib import Path
import shutil
import subprocess
import tarfile
import tempfile

ROOT = Path(__file__).resolve().parents[1]
VERSION = '13.59'
SHA256 = '87d3317882fdae9cb4dcfe57a96a378d0132ffc02c731315bf128b19ddcf7aac'
URL = f'https://codeload.github.com/exiftool/exiftool/tar.gz/refs/tags/{VERSION}'


def main():
    if not shutil.which('perl'):
        raise RuntimeError('Perl is required. macOS includes it; on Ubuntu install the perl package.')
    destination = ROOT / '.tools' / 'exiftool'
    if destination.exists():
        subprocess.run(['perl', str(destination/'exiftool'), '-ver'], check=True)
        print('Project-local ExifTool is already installed.')
        return
    with tempfile.TemporaryDirectory() as temp:
        archive = Path(temp)/'exiftool.tar.gz'
        subprocess.run(['curl', '-fL', '--max-time', '120', URL, '-o', str(archive)], check=True)
        if hashlib.sha256(archive.read_bytes()).hexdigest() != SHA256:
            raise RuntimeError('ExifTool download checksum mismatch; nothing installed.')
        with tarfile.open(archive) as tar:
            # Extract only regular files/directories from the verified archive, with path checks.
            for member in tar.getmembers():
                target = (Path(temp)/member.name).resolve()
                if not target.is_relative_to(Path(temp).resolve()):
                    raise RuntimeError('Unsafe archive path.')
                if member.isdir():
                    target.mkdir(parents=True, exist_ok=True)
                elif member.isfile():
                    target.parent.mkdir(parents=True, exist_ok=True)
                    with tar.extractfile(member) as source, target.open('wb') as output:
                        shutil.copyfileobj(source, output)
        source = Path(temp)/f'exiftool-{VERSION}'
        subprocess.run(['perl', str(source/'exiftool'), '-ver'], check=True)
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(source), str(destination))
    print('Installed project-local ExifTool. Run npm run photos:clean.')


if __name__ == '__main__':
    main()
