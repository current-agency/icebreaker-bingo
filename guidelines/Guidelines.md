# Human Bingo — App Spec for Figma Make

## Purpose
A remote icebreaker game for a staff meeting (~60-70 people, Zoom breakout rooms, ~6-8 people per room). One person per breakout room controls the app on their screen, shares it, and the room calls out answers as they talk to each other. The room marks squares as people in the room match them. First room to get bingo wins.

## Core Mechanic
- Each room gets its own randomized 5x5 bingo card (same 24 squares, shuffled layout per room/session).
- Center square is a free space, pre-marked.
- One controller per room clicks squares to mark them as the room finds matches.
- The app automatically detects when a bingo line is completed (row, column, or diagonal) and visually announces it.
- No login, no multiplayer sync needed — single user per instance, refresh/reload generates a new random layout.

## Squares (24 total, fill 5x5 grid minus free center space)
1. Has more than 3 siblings
2. Lives in a different state than they were born
3. Has 3 or more pets
4. Has a musical instrument in the room with them right now
5. Has never seen Star Wars
6. Speaks more than 2 languages
7. Has been to more than 10 countries
8. Worked a food service job
9. Been to a live concert in the last 12 months
10. Has been on television
11. Has lived in another country
12. Has a twin
13. Coached or refereed a youth sport
14. Has a garden
15. Has pulled an all-nighter in the last year
16. Has eaten something bizarre on a dare
17. Has a famous person follow them on social media
18. Has cried at a commercial
19. Has been on a blind date
20. Owns a piece of furniture they built themselves
21. Has changed a tire on the side of the road for someone they didn't know
22. Has strong feelings about how a dishwasher should be loaded
23. Has lied about having read a book
24. Owns a gaming console from before 2000

## Functional Requirements

### Card Generation
- On load (or on a "New Card" / "Shuffle" button), randomly select 24 of the 24 squares (i.e., all of them) and place them into a 5x5 grid, with the center cell reserved for "FREE."
- Each room's controller generating their own card naturally produces a different layout per room since shuffling is random per session.

### Interaction
- Clicking/tapping a square toggles its "marked" state (marked = filled in, highlighted).
- Clicking again unmarks it (in case of misclick).
- Free space is marked by default and cannot be unmarked.

### Bingo Detection
- After every mark/unmark, check all 5 rows, 5 columns, and 2 diagonals for a complete line of marked squares.
- On detecting a completed line, trigger a clear visual celebration state (e.g., the winning line highlights distinctly, a "BINGO!" banner or overlay appears).
- Should be unambiguous enough that the controller can immediately tell the room "we got it" without confusion.

### Reset
- A visible "New Card" or "Reset" button that re-shuffles the grid and clears all marks (except free space).

## Visual / Tone Direction
- Energetic but clean — this is a quick icebreaker, not a polished product. Should feel fun and a little playful.
- Clear visual hierarchy: square text needs to be legible at a glance since this will be screen-shared and viewed by a group, possibly on smaller screens or at a distance.
- Marked squares should be obviously distinct from unmarked ones (color fill, checkmark, strikethrough — any clear treatment).
- BINGO state should be impossible to miss — full-screen or near-full-screen celebratory moment is fine.

## Out of Scope
- No multiplayer/real-time sync across users.
- No accounts, no backend, no persistence across sessions.
- No mobile-specific optimization required (this will be used on a controller's laptop/desktop during a screenshare).
--------------

# Design system guidelines
Rules for how the AI should make generations look like your company's design system

Additionally, if you select a design system to use in the prompt box, you can reference
your design system's components, tokens, variables and components.
For example:

* Use a base font-size of 14px
* Date formats should always be in the format “Jun 10”
* The bottom toolbar should only ever have a maximum of 4 items
* Never use the floating action button with the bottom toolbar
* Chips should always come in sets of 3 or more
* Don't use a dropdown if there are 2 or fewer options

You can also create sub sections and add more specific details
For example:


## Button
The Button component is a fundamental interactive element in our design system, designed to trigger actions or navigate
users through the application. It provides visual feedback and clear affordances to enhance user experience.

### Usage
Buttons should be used for important actions that users need to take, such as form submissions, confirming choices,
or initiating processes. They communicate interactivity and should have clear, action-oriented labels.

### Variants
* Primary Button
  * Purpose : Used for the main action in a section or page
  * Visual Style : Bold, filled with the primary brand color
  * Usage : One primary button per section to guide users toward the most important action
* Secondary Button
  * Purpose : Used for alternative or supporting actions
  * Visual Style : Outlined with the primary color, transparent background
  * Usage : Can appear alongside a primary button for less important actions
* Tertiary Button
  * Purpose : Used for the least important actions
  * Visual Style : Text-only with no border, using primary color
  * Usage : For actions that should be available but not emphasized
-->
