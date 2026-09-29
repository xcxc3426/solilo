"""Create deterministic release archives with Python's standard library."""
from pathlib import Path
from hashlib import sha256
import shutil
import zipfile

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT.parent / 'solilo-delivery'
EXCLUDE = {'node_modules', '.git', '__pycache__', 'output'}


def source_files():
    return sorted(p for p in ROOT.rglob('*') if p.is_file()
                  and not (set(p.relative_to(ROOT).parts) & EXCLUDE)
                  and p.name != 'MANIFEST.sha256')


def archive(destination, entries):
    with zipfile.ZipFile(destination, 'w', compression=zipfile.ZIP_DEFLATED,
                         compresslevel=9) as bundle:
        for name, data in sorted(entries):
            info = zipfile.ZipInfo(name, date_time=(2026, 9, 29, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            bundle.writestr(info, data)
    with zipfile.ZipFile(destination) as bundle:
        assert bundle.testzip() is None


OUT.mkdir(exist_ok=True)
files = source_files()
manifest = ''.join(f'{sha256(p.read_bytes()).hexdigest()}  {p.relative_to(ROOT).as_posix()}\n'
                   for p in files)
(ROOT / 'MANIFEST.sha256').write_text(manifest, encoding='utf-8')
files.append(ROOT / 'MANIFEST.sha256')
archive(OUT / 'SOLILO-repository.zip',
        [('solilo/' + p.relative_to(ROOT).as_posix(), p.read_bytes()) for p in files])

media = sorted((ROOT / 'assets/screenshots').glob('*.png'))
media += [ROOT / p for p in ['assets/screenshots/provenance.json',
          'assets/brand/solilo-header.png', 'assets/brand/PROMPT.md',
          'assets/fonts/LICENSE.txt', 'LICENSE', 'THIRD_PARTY.md']]
notes = '''# SOLILO / image collection

A machine talking to itself on Solana.

The eight PNGs in assets/screenshots are 1600 x 1000 native Canvas exports from
the local scripted replay. They show authored machine voices and original ASCII
room drawings. Source parameters are in provenance.json. They are not live
network activity or transaction receipts.

The generated editorial header is assets/brand/solilo-header.png. It appears at
the top of the full repository README. The separate repository ZIP contains the
source renderer, all room files, protocol documents and offline terminal.

Share the full frames so the scene title and replay status remain visible.
'''
archive(OUT / 'SOLILO-screenshots.zip',
        [('SOLILO-screenshots/' + p.relative_to(ROOT).as_posix(), p.read_bytes()) for p in media]
        + [('SOLILO-screenshots/README.md', notes.encode())])
shutil.copyfile(ROOT / 'SOLILO.html', OUT / 'SOLILO.html')
shutil.copyfile(ROOT / 'docs/GITHUB_UPLOAD.md', OUT / 'SOLILO-GitHub-upload.md')
assert len(files) <= 100, 'Use Git or split browser upload batches.'
assert all(p.stat().st_size < 25 * 1024 * 1024 for p in files)
print(f'Packaged {len(files)} repository files and {len(media)} media/support files.')
for p in sorted(OUT.iterdir()):
    if p.is_file():
        print(f'{p.name}: {p.stat().st_size:,} bytes')
