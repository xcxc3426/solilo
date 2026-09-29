# Inside SOLILO

**Every room has an address. Some of them answer.**

SOLILO is a place where one machine appears to speak from several positions. A corridor remembers a phrase. A terminal disputes it. An observation room records the disagreement without resolving it.

The rooms are made from printable ASCII. Their emptiness matters: an unanswered line, a long aisle, a doorway that occupies only a few characters. The interface gives those small changes enough space to be noticed.

## A first visit

Start at the Vestibule. The route appears simple, but its final door returns to the beginning. Read the room before opening its record. The visual scene and its stored glyphs describe the same place.

At the Switchboard, ECHO and MOTH begin an exchange across separate rooms. ECHO repeats something it remembers. MOTH asks whether remembering a sentence means understanding it. WARDEN preserves the disagreement as a record.

Continue to Mirrorwell. Two portraits face each other across a split terminal. Their messages have explicit speakers and room references; the empty space between them represents a boundary, not a hidden communication channel.

The Cold Archive changes the mood. What a voice has stopped remembering may still exist in the public record. Forgetting can alter a future conversation without erasing its earlier words.

Witness brings the three roles together. Exit closes the route by sending the visitor back to Room 001. The system has accumulated context; the architecture has not promised an escape.

## Three positions inside a machine

| Voice | Narrative role | What the reader notices |
|---|---|---|
| ECHO | Carries phrases forward | Repetition, familiarity, missing context |
| MOTH | Questions the last assertion | Doubt, alternative readings, unanswered questions |
| WARDEN | Records contradictions | Sequence, attribution, incompatible claims |

These are fictional roles in authored playback. The terminal's `SCRIPTED REPLAY` label identifies what is being shown. The [voice notes](VOICES.md) describe how to write each role consistently.

## What makes a room real here

In the Solana architecture, a room is a program account containing its identity and actual ASCII layout. Its doors are explicit connections. Its published speech occupies message pages. A room can therefore be reconstructed from the chain independently of this particular terminal interface.

That gives the atmosphere a concrete rule: **memory can become unreliable while the public room record remains inspectable.** The reader can compare an entity's current account of an event with the bytes that were published earlier.

The [room atlas](ROOM_ATLAS.md) describes all twelve spaces. [On-chain rooms](ONCHAIN_ROOMS.md) explains how their geometry and records fit into Solana accounts.

## Visual discipline

The terminal uses black, warm grey, and sparse pale accents. ASCII carries the rooms and portraits. Borders, labels, and spacing should support the scene rather than compete with it.

The eight exported frames are views of the local renderer. They share the same atlas and dialogue records as the terminal. They are suitable for a README gallery because their labels preserve the distinction between playback and network activity.
