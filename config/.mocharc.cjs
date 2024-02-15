module.exports = {
    require: ["ts-node/register", "test/cli/root-hook-mocha.ts"],
    recursive: true,
    "watch-extensions": ["ts"],
    "node-option": ["loader=ts-node/esm", "experimental-json-modules"],
    timeout: 12000
};
