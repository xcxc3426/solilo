# Publish SOLILO on GitHub

## Repository fields

**Owner:** `ashleyotooligan`

**Repository name:** `solilo`

**Description:**

> A machine talking to itself on Solana. ASCII backrooms, machine dialogues, and a protocol for storing every room on-chain.

**Visibility:** Public, if you want everyone to browse the rooms and README.

**Topics:** `solana`, `ascii-art`, `backrooms`, `generative-art`, `onchain`, `experimental`, `javascript`

Leave the website field empty. The repository stands on its own.

## First commit

**Commit title:**

```text
Initial SOLILO release: room atlas, machine dialogues, and on-chain architecture
```

**Extended description:**

```text
Introduce SOLILO's twelve-room ASCII world, three machine voices, and eight terminal views.

Include the offline replay, full room data, source renderer, byte-format checks, and Solana room-account specification. Document canonical glyph storage, directed doors, append-only dialogue, authority boundaries, and SOL allocation costs.
```

## Upload through your browser

1. Extract `SOLILO-repository.zip`. Open the resulting `solilo` folder.
2. Create a repository at [GitHub new repository](https://github.com/new), using the fields above. Leave automatic README, license and ignore-file creation off; these files are already included.
3. Open the new repository's upload link, or choose **Add file → Upload files**.
4. Select the **contents inside `solilo`** and drag them onto the upload area, including the folders. Preserve the folder structure. Do not upload the ZIP itself or create another enclosing `solilo` directory inside the repository.
5. Before committing, check that the upload list includes `README.md`, `assets/brand/solilo-header.png`, `assets/screenshots/01-vestibule.png`, `data/atlas.json`, and files under `docs/`, `protocol/`, `rooms/` and `src/`.
6. Paste the commit title and extended description above. Commit to the new repository's default branch, or follow any repository rules that require a pull request.
7. Open the repository overview and check the header and all eight frames. Click a frame to open the actual PNG.

If your file picker selects individual files only, use folder drag-and-drop. If folders still do not appear in the upload list, use the Git route below so the directory tree is preserved.

GitHub's documented browser limits are 100 files per upload and 25 MiB per file. The supplied repository fits those limits. See [GitHub's file-upload instructions](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository).

## Git route for an empty repository

Install Git, open a terminal **inside the extracted `solilo` folder**, and run these commands after creating an empty `ashleyotooligan/solilo` repository:

```sh
git init
git add .
git commit -m "Initial SOLILO release: room atlas, machine dialogues, and on-chain architecture"
git branch -M main
git remote add origin https://github.com/ashleyotooligan/solilo.git
git push -u origin main
```

Authenticate through Git's normal GitHub sign-in flow. No credentials belong in project files. If you already initialized the remote with a README, clone that repository first, copy the extracted contents into it, then add, commit and push. Do not force-push over existing history.

## Verify the images

The README uses relative image paths. They work on GitHub when the image files have the exact same names and directory locations. Filename case matters.

| Image | Required repository path |
|---|---|
| Header | `assets/brand/solilo-header.png` |
| Vestibule | `assets/screenshots/01-vestibule.png` |
| Switchboard | `assets/screenshots/02-switchboard.png` |
| Mirrorwell | `assets/screenshots/03-mirrorwell.png` |
| Room graph | `assets/screenshots/04-room-graph.png` |
| Cold Archive | `assets/screenshots/05-cold-archive.png` |
| Room account | `assets/screenshots/06-room-account.png` |
| Witness | `assets/screenshots/07-witness.png` |
| Exit | `assets/screenshots/08-exit.png` |

A broken image plus a 404 at its file path usually means that file or folder was not uploaded, or its case/path changed. Compare the repository tree with the extracted folder; upload the missing folders at the root. Replacing Markdown will not restore missing files.

## What visitors can open

GitHub displays the README and PNGs. The repository file viewer does not run `SOLILO.html`. Visitors download that file and open it locally, or download the whole ZIP and use the included launcher. No website deployment is needed.

For social posts, use the PNGs from `assets/screenshots/`. Their small `SCRIPTED REPLAY` label identifies the source of the scene. Keep the deployment record accurate when publishing project updates.
