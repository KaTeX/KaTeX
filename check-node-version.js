const v = process.version
    .replace(/^v/, "")
    .split(".")
    .map(parseInt);
if (v[0] < 6 || (v[0] === 6 && v[1] < 9)) {
    // eslint-disable-next-line no-console
    console.error("Node 6.9 or later required for development. " +
                  "Version " + process.version + " found");
    process.exit(1);
}
