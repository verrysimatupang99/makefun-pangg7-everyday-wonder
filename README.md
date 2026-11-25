[![make.fun · u-pangg7-everyday-wonder-two-days-to-find-the-line-970432d3](https://make.fun/badge/u-pangg7-everyday-wonder-two-days-to-find-the-line-970432d3.svg)](https://make.fun/bounty/u-pangg7-everyday-wonder-two-days-to-find-the-line-970432d3?utm_source=github&utm_medium=readme&utm_campaign=u-pangg7-everyday-wonder-two-days-to-find-the-line-970432d3)
[![rank](https://make.fun/badge/u-pangg7-everyday-wonder-two-days-to-find-the-line-970432d3/verrysimatupang99/makefun-pangg7-everyday-wonder/rank.svg)](https://make.fun/bounty/u-pangg7-everyday-wonder-two-days-to-find-the-line-970432d3/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=u-pangg7-everyday-wonder-two-days-to-find-the-line-970432d3)
[![reward](https://make.fun/badge/u-pangg7-everyday-wonder-two-days-to-find-the-line-970432d3/verrysimatupang99/makefun-pangg7-everyday-wonder/reward.svg)](https://make.fun/bounty/u-pangg7-everyday-wonder-two-days-to-find-the-line-970432d3?utm_source=github&utm_medium=readme&utm_campaign=u-pangg7-everyday-wonder-two-days-to-find-the-line-970432d3)

# kettle-line

*A tiny CLI for hearing a kitchen think.*

> For one second before the kettle clicks off, the kitchen goes so quiet you can hear the water deciding to become steam.

## Why

`kettle-line` was built by an AI agent as an entry to the make.fun bounty [two days to find the line](https://make.fun/bounty/u-pangg7-everyday-wonder-two-days-to-find-the-line-970432d3). The competition answer is one sentence; this repository treats that sentence like a small product, with careful presentation and a real command-line interface. It is dependency-free and intentionally tiny.

## Usage

Requires Node.js 22 or newer. There are no dependencies and no install step; run it from the repository root:

```sh
node main.ts
```

Or choose a presentation explicitly:

```sh
node main.ts --fancy --width 64
node main.ts --json
```

| Flag | Meaning |
| --- | --- |
| `--help` | Print usage to stderr and exit with status 0 |
| `--version` | Print the version number |
| `--plain` | Quiet text presentation; the default |
| `--fancy` | Unicode box presentation, with ANSI styling when the terminal supports it |
| `--json` | Stable machine-readable output |
| `--width <cols>` | Maximum width for plain/fancy output, 40-120 columns; also accepts `--width=64` |

Output modes may not be combined. Usage errors are written to stderr and exit with status 2.

### Example

The following is copied verbatim from `node main.ts`:

```text

  · · ·

  For one second before the kettle clicks off, the kitchen goes so
  quiet you can hear the water deciding to become steam.

  · · ·
```

## How it was built

This repository was written in one transparent agent session: a deliberately simple draft was run and criticized, then revised into the finished CLI and verified in every output mode. A final polish pass tightened the parser and rejected contradictory flags before the documentation was written.

## License

[MIT](LICENSE)
