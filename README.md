# Dynomix

[bost-ty](https://github.com/bost-ty) | 2026

_It's the wave of the future!_

Dynomix is a handy utility for interacting with the Bitfocus Companion module for vMix.

Open the page, enter your local Companion & vMix instance information, and enjoy easy access to the unique input ID for every input in your currently active project.

## Why?

When programming vMix <-> Companion communication, using each input's unique `key` allows much more stable access to that input. Without a key, Companion matches based on input name (`title`) or number (`number`).
Dynomix also grabs those from vMix, so you always know exactly which input you're grabbing with the one-click copy button.

## Help!

Please open an Issue in [the Dynomix GitHub repository](https://github.com/bost-ty/dynomix/issues). Thanks!

## Developing

1. Clone this repo.
2. Move into the directory: `cd dynomix`
3. Install dependencies: `npm install`
4. Run dev server & TypeScript compilation: `npm run dev`
5. Edit files as necessary.
