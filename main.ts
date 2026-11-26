#!/usr/bin/env node

/**
 * still-falling — a dependency-free CLI for presenting one patient sentence.
 * Plain JavaScript is kept in this .ts file so Node 22 can run it directly;
 * JSDoc supplies the TypeScript-flavored types.
 */

const ENTRY_LINE =
  "Every office vending machine holds one snack that has been falling for three years — suspended between coil and drop, it has learned patience.";
const NAME = "still-falling";
const VERSION = "1.0.0";
const DEFAULT_WIDTH = 72;
const MIN_WIDTH = 40;
const MAX_WIDTH = 120;
const EXIT_USAGE = 2;

/** @typedef {"plain" | "fancy" | "json"} OutputMode */
/**
 * @typedef {object} Options
 * @property {OutputMode} output
 * @property {number} width
 * @property {boolean} help
 * @property {boolean} version
 */

/** @returns {string} usage text; help intentionally goes to stderr */
function usage() {
  return `${NAME} ${VERSION}

Usage:
  node main.ts [options]

Options:
  --help          Show this help text on stderr and exit
  --version       Print the version number
  --plain         Present the line as quiet text (default)
  --fancy         Present the line in a Unicode box with terminal styling
  --json          Print machine-readable JSON
  --width <cols>  Maximum width for plain/fancy output, ${MIN_WIDTH}-${MAX_WIDTH} columns (default: ${DEFAULT_WIDTH})

Examples:
  node main.ts
  node main.ts --fancy --width 64
  node main.ts --json
`;
}

/** @returns {Options} */
function defaultOptions() {
  return { output: "plain", width: DEFAULT_WIDTH, help: false, version: false };
}

/**
 * @param {string} value
 * @returns {{width: number | null, error: string | null}}
 */
function parseWidth(value) {
  if (!/^\d+$/.test(value)) {
    return {
      width: null,
      error: `Invalid width "${value}": expected a whole number of columns.`,
    };
  }
  const width = Number(value);
  if (width < MIN_WIDTH || width > MAX_WIDTH) {
    return {
      width: null,
      error: `Invalid width "${value}": choose a value from ${MIN_WIDTH} to ${MAX_WIDTH}.`,
    };
  }
  return { width, error: null };
}

/**
 * Parse argv by hand. Output modes may be repeated but never conflict.
 * @param {string[]} argv
 * @returns {{options: Options | null, error: string | null}}
 */
function parseArgs(argv) {
  const options = defaultOptions();
  /** @type {OutputMode | null} */
  let explicitOutput = null;

  const chooseOutput = (mode, flag) => {
    if (explicitOutput && explicitOutput !== mode) {
      return `Conflicting output modes: --${explicitOutput} cannot be combined with ${flag}.`;
    }
    explicitOutput = mode;
    options.output = mode;
    return null;
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help") {
      options.help = true;
    } else if (arg === "--version") {
      options.version = true;
    } else if (arg === "--plain" || arg === "--fancy" || arg === "--json") {
      const mode = /** @type {OutputMode} */ (arg.slice(2));
      const error = chooseOutput(mode, arg);
      if (error) return { options: null, error };
    } else if (arg === "--width" || arg.startsWith("--width=")) {
      let value;
      if (arg === "--width") {
        index += 1;
        value = argv[index];
      } else {
        value = arg.slice("--width=".length);
      }
      if (value === undefined || value === "") {
        return {
          options: null,
          error: "Missing value for --width: expected a whole number of columns.",
        };
      }
      const parsed = parseWidth(value);
      if (parsed.error) return { options: null, error: parsed.error };
      options.width = parsed.width;
    } else if (arg.startsWith("-")) {
      return { options: null, error: `Unknown option: ${arg}` };
    } else {
      return { options: null, error: `Unexpected argument: ${arg}` };
    }
  }

  return { options, error: null };
}

/**
 * Wrap at word boundaries, splitting a rare overlong word rather than
 * exceeding the requested width.
 * @param {string} text
 * @param {number} width
 * @returns {string[]}
 */
function wrapText(text, width) {
  const lines = [];
  let current = "";

  for (const word of text.split(" ")) {
    if (word.length > width) {
      if (current) lines.push(current);
      for (let start = 0; start < word.length; start += width) {
        lines.push(word.slice(start, start + width));
      }
      current = "";
    } else if ((current ? `${current} ${word}` : word).length <= width) {
      current = current ? `${current} ${word}` : word;
    } else {
      lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines;
}

/**
 * @param {string} text
 * @param {number} width
 * @returns {string}
 */
function padRight(text, width) {
  return text + " ".repeat(Math.max(0, width - text.length));
}

/**
 * @param {string} text
 * @param {number} width
 * @returns {string}
 */
function center(text, width) {
  if (text.length >= width) return text;
  const remaining = width - text.length;
  const left = Math.floor(remaining / 2);
  return " ".repeat(left) + text + " ".repeat(remaining - left);
}

/** @returns {boolean} whether ANSI styling should be emitted */
function supportsColor() {
  return Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;
}

/**
 * @param {string} text
 * @param {string} escape
 * @param {boolean} enabled
 * @returns {string}
 */
function paint(text, escape, enabled) {
  return enabled ? `\u001b[${escape}m${text}\u001b[0m` : text;
}

/**
 * Quiet default presentation: whitespace does the design work, and the text
 * remains easy to copy or pipe.
 * @param {number} width
 * @returns {string}
 */
function renderPlain(width) {
  const indent = "  ";
  const lines = wrapText(ENTRY_LINE, width - indent.length * 2).map(
    (line) => indent + line,
  );
  return ["", `${indent}· · ·`, "", ...lines, "", `${indent}· · ·`, ""].join("\n");
}

/**
 * Unicode-box presentation. Padding is calculated before styling so ANSI
 * escapes never disturb the column count.
 * @param {number} width
 * @returns {string}
 */
function renderFancy(width) {
  const color = supportsColor();
  const innerWidth = width - 2;
  const textWidth = width - 6;
  const horizontal = "─".repeat(innerWidth);
  const blank = " ".repeat(innerWidth);
  const border = (text) => paint(text, "36", color);
  const side = (content) => border("│") + content + border("│");
  const rows = [
    "",
    border(`╭${horizontal}╮`),
    side(blank),
    side(paint(center("three years, and counting", innerWidth), "2;37", color)),
    side(blank),
  ];

  for (const line of wrapText(ENTRY_LINE, textWidth)) {
    rows.push(side(paint(`  ${padRight(line, textWidth)}  `, "3;97", color)));
  }

  rows.push(side(blank), border(`╰${horizontal}╯`), "");
  return rows.join("\n");
}

/**
 * Stable machine-readable output; the line is never wrapped here.
 * @param {Options} options
 * @returns {string}
 */
function renderJson(options) {
  return `${JSON.stringify(
    {
      name: NAME,
      version: VERSION,
      line: ENTRY_LINE,
      characters: ENTRY_LINE.length,
      width: options.width,
    },
    null,
    2,
  )}\n`;
}

/**
 * @param {Options} options
 * @returns {string}
 */
function render(options) {
  if (options.output === "fancy") return renderFancy(options.width);
  if (options.output === "json") return renderJson(options);
  return renderPlain(options.width);
}

/**
 * @param {string[]} argv
 * @returns {number} process exit code
 */
function main(argv) {
  const parsed = parseArgs(argv);
  if (parsed.error || !parsed.options) {
    process.stderr.write(`${NAME}: ${parsed.error || "unable to parse arguments"}\n`);
    process.stderr.write("Try 'node main.ts --help' for usage.\n");
    return EXIT_USAGE;
  }

  if (parsed.options.help) {
    process.stderr.write(usage());
    return 0;
  }
  if (parsed.options.version) {
    process.stdout.write(`${VERSION}\n`);
    return 0;
  }

  process.stdout.write(render(parsed.options));
  return 0;
}

process.exitCode = main(process.argv.slice(2));
