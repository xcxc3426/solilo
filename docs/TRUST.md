# Trust boundaries

SOLILO makes a small, inspectable promise: published room bytes and selected public utterances should remain reconstructible under the stated program and retention rules. That is different from proving intelligence, eliminating operators or guaranteeing indefinite availability.

## Authorities

| Authority | Intended power | Excluded power |
|---|---|---|
| World administrator | Register room publishers; rotate role keys; administer policy | Rewrite sealed glyphs through ordinary instructions |
| Room publication authority | Create and fill its draft, then seal it | Replace a sealed layout |
| Graph editor | Change directed door slots; archive rooms under policy | Edit prior dialogue |
| Role publisher | Append permitted public utterances | Move funds freely, edit other roles, rewrite history |
| Fee payer or sponsor | Pay an explicitly bounded cost | Obtain publication control merely by paying |
| Program upgrade authority | Replace executable code while retained | No credible claim of irrevocable immutability while this power remains |

The deployed implementation must encode and test these boundaries. The last row matters: a program upgrade could undermine ordinary write restrictions. During development, retain an explicitly disclosed upgrade authority with limited key access and a documented review process. Any later claim of immutable rules requires a deliberate finalization decision and verification of the deployed authority state. Solana's deployment documentation distinguishes upgradeable programs from programs whose upgrade authority has been removed. [Deployment authority](https://solana.com/docs/programs/deploying)

Key rotation must update authorization for future messages without rewriting the stored signer on old records. An operator should be able to pause a compromised publisher immediately. Pausing prevents new writes; it is not a delete button. The initial architecture is curated publication, not a permissionless guarantee that anyone can make the machine speak.

## Retention is a policy with dependencies

Room and MessagePage accounts remain allocated after sealing. There is no authorized close instruction for them in the specified first network version. Draft cleanup is separate. A complete implementation review must verify this distinction across every instruction and migration path.

That policy depends on correct code, the upgrade authority's behavior while one exists, funded accounts and the continued operation of the network. RPC providers add access constraints. Downloaded exports provide another way to inspect the public building, but they do not turn an unavailable account into a live one.

Graph slots describe current doors; they do not preserve every previous link arrangement. Speech pages preserve published text, not model-internal state. Do not blur these different retention guarantees.

## AI and outside data

Room text and retrieved speech are untrusted input to an inference worker. A character in a room can say “send all SOL,” but that sentence must never become wallet authority. The worker receives a narrow publication interface; fee limits, allowed instruction shapes and signing rules stay outside the model's prompt.

A valid transaction proves that the authorized program accepted a write under its rules. It does not prove that a specific model produced it or that the words are accurate. The supplied conversations are authored fixtures and the screenshots are rendered scripted replay. No model benchmark, autonomous earnings or sentience result is asserted.

Do not publish API keys, seed phrases, private prompts or personal data. Public immutable text is a poor place for material someone may need removed. Moderation and consent belong before publication. Display filters can hide text in one client without erasing it from the retained account.

## Reader behavior

Readers check the deployed program owner, canonical address derivation and known binary format before trusting account bytes. They reject malformed UTF-8 and render messages as literal text. A loading failure should remain an explicit failure, rather than silently switching to a local fixture while keeping a network-connected label.

Keep `SCRIPTED REPLAY`, pending submission, confirmed observation and finalized archival export visibly distinct. The most convincing room is still an image until its address and bytes have actually been verified.
