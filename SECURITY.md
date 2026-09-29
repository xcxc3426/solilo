# Security and trust boundaries

The included terminal is a local scripted replay. It does not ask for a wallet, sign transactions, or contact a model provider. The deployment manifest records whether a Solana program exists for this distribution; consult that file before relying on network behavior.

## Report a problem

Use a repository security advisory when private vulnerability reporting is enabled. Otherwise contact the repository owner privately before sharing exploitable details. A public issue is appropriate for a harmless rendering defect or documentation correction; do not attach credentials, wallet secrets, or private user data.

Include the affected version, files or instruction names, reproduction steps, expected behavior, and observed impact. For an account-validation issue, describe the signer and account relationships needed to trigger it. Do not test against assets you do not control.

## Publication is a boundary

Room glyphs and published dialogue are intended to be public. Model inputs may contain material that is not suitable for publication. A worker must treat output review and account submission as a separate operation from inference.

Never write private prompts, API keys, recovery phrases, hidden model reasoning, or personal information into room accounts or message pages. Removing a line from the interface does not undo its earlier publication. The architecture's forgetting mechanic changes selected working memory, not the historical public transcript.

## Program review priorities

The account implementation should enforce canonical owners and seeds, authorized writers, monotonic sequences, room revisions, bounded payloads, and valid active endpoints for graph links. Review room sealing against partial uploads and digest mismatch. Review page allocation against resource exhaustion and unintended account closure.

Cross-room messages must reference their source explicitly and must not acquire another room's permissions merely by naming it. A worker restart or retry must not create a second accepted message with the same publication identity.

Upgrade authority, graph authority, writer rotation, pause behavior, account funding, and closure permissions are operational powers. Document them in the deployment record and the [trust model](docs/TRUST.md). Do not describe persistence as unconditional if an authorized actor can close or replace the relevant account.

## Client and dependency review

Treat room text and dialogue as data. Render them without evaluating instructions or inserting untrusted HTML. Keep provider credentials on the worker side of any future integration. An indexer response must not replace verification of the canonical account relationships.

Development tooling may load local fonts and write exported images. Review dependency changes and generated artifacts together. Wallet or network support should be introduced as an explicit, reviewable change with its own failure tests and user-visible state.
