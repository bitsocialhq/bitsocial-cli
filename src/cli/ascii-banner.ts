// ASCII banner, edited as two parallel grids.
//
// SHAPE holds the raw glyphs (braille art + figlet text). Leave these alone
// unless you want to change the art itself.
//
// COLORS is the paint map. Each character corresponds 1:1 to the character
// at the same position in SHAPE:
//   B = blue   (#1a4fd0) — the sphere
//   S = silver (#e5e7eb) — the rings and the "Bitsocial" text
//   . = no color (pass the glyph through as-is; use this for spaces)
//
// To retouch the art, find a glyph in SHAPE, then flip the character at the
// same column in the matching COLORS row. A common case: a ring cell came out
// blue because the sphere mask had more dots there — change its 'B' to 'S'.
//
// Both grids MUST have the same number of rows. Each row in COLORS must be at
// least as wide as the corresponding SHAPE row (extra chars are ignored).
// Palette sourced from bitsocialnet/bitsocial-web/about/tailwind.config.ts.

const SHAPE = [
    "                ⢀⣴⣿⣿⣦⡀                                                                                       ",
    "                ⣾⣿⠁⠈⣿⣷⡀                                                                                      ",
    "               ⢸⣿⡇  ⢸⣿⣇                                                                                      ",
    "             ⢀⣀⣼⣿⣷⣶⣶⣶⣿⣿⣄⡀                                                                                    ",
    "          ⢀⣠⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣤⡀                                                                                 ",
    "         ⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦               888888b.   d8b 888                               d8b          888",
    "       ⢀⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡀             888  \"88b  Y8P 888                               Y8P          888",
    "  ⣀⣤⣤⣶⣶⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣶⣶⣦⣤⣀        888  .88P      888                                            888",
    "⣰⣿⡿⠛⠉⠉ ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿ ⠉⠉⠛⠟⣿⣦      8888888K.  888 888888 .d8888b   .d88b.   .d8888b 888  8888b.  888",
    "⠻⣷⣦⣤⣀⣀ ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿ ⢀⣀⣀⣴⣿⠟      888  \"Y88b 888 888    88K      d88\"\"88b d88P\"    888     \"88b 888",
    "  ⠉⠛⠻⠿⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠿⠟⠛⠉        888    888 888 888    \"Y8888b. 888  888 888      888 .d888888 888",
    "       ⠈⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿              888   d88P 888 Y88b.       X88 Y88..88P Y88b.    888 888  888 888",
    "         ⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟               8888888P\"  888  \"Y888  88888P'  \"Y88P\"   \"Y8888P 888 \"Y888888 888",
    "          ⠈⠻⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠟⠁                                                                                 ",
    "             ⠉⠛⢿⣿⣿⣿⣿⣿⣿⣿⠛⠉                                                                                    ",
    "                ⢸⣿⡆  ⣿⡿                                                                                      ",
    "                ⠈⢿⣷⡀⣸⣿⠃                                                                                       ",
    "                 ⠈⠿⣿⡿⠃                                                                                        "
];

const COLORS = [
    "................SSSSSS.......................................................................................",
    "................SSSSSSS......................................................................................",
    "...............SSSSSSSS......................................................................................",
    ".............BBBBBBBBSSBB....................................................................................",
    "..........BBBBBBBBBBBSSBBBBB.................................................................................",
    ".........BBBBBBBBBBBBSSBBBBBB...............SSSSSSSS...SSS.SSS...............................SSS..........SSS",
    ".......BBBBBBBBBBBBBBSSBBBBBBBB.............SSS..SSSS..SSS.SSS...............................SSS..........SSS",
    "..SSSSSBBBBBBBBBBBBBBSSBBBBBBBBSSSSSSS......SSS..SSSS......SSS............................................SSS",
    "SSSSSS.BBBBBBBBBBBBBBSSBBBBBBBBSSSSSSS......SSSSSSSSS..SSS.SSSSSS.SSSSSSS...SSSSSS...SSSSSSS.SSS..SSSSSS..SSS",
    "SSSSSS.BBBBBBBBBBBBBBSSBBBBBBBBSSSSSSS......SSS..SSSSS.SSS.SSS....SSS......SSSSSSSS.SSSSS....SSS.....SSSS.SSS",
    "..SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS......SSS....SSS.SSS.SSS....SSSSSSSS.SSS..SSS.SSS......SSS.SSSSSSSS.SSS",
    ".......BBBBBBBBBBBBBBSSBBBBBBBBBBBBBBB......SSS...SSSS.SSS.SSSSS.......SSS.SSSSSSSS.SSSSS....SSS.SSS..SSS.SSS",
    ".........BBBBBBBBBBBBSSBBBBBBBBB............SSSSSSSSS..SSS..SSSSS..SSSSSSS..SSSSSS...SSSSSSS.SSS.SSSSSSSS.SSS",
    "..........BBBBBBBBBBBSSBBBBBBB...............................................................................",
    ".............BBBBBBBBSSBBBB..................................................................................",
    "...............SSSSSSSSS.....................................................................................",
    "...............SSSSSSSS......................................................................................",
    "................SSSSSS......................................................................................."
];

const BLUE = "\x1b[38;2;26;79;208m";
const SILVER = "\x1b[38;2;229;231;235m";
const RESET = "\x1b[0m";

function paint(shape: string, colors: string): string {
    let out = "";
    let current = ".";
    for (let i = 0; i < shape.length; i++) {
        const glyph = shape[i]!;
        const want = colors[i] ?? ".";
        if (want !== current) {
            if (current !== ".") out += RESET;
            if (want === "B") out += BLUE;
            else if (want === "S") out += SILVER;
            current = want;
        }
        out += glyph;
    }
    if (current !== ".") out += RESET;
    return out;
}

function supportsColor(): boolean {
    if (process.env["NO_COLOR"]) return false;
    if (process.env["FORCE_COLOR"]) return true;
    return Boolean(process.stdout.isTTY);
}

export function printBanner(): void {
    const useColor = supportsColor();
    const lines = SHAPE.map((row, i) => (useColor ? paint(row, COLORS[i] ?? "") : row));
    process.stdout.write(lines.join("\n") + "\n\n");
}
