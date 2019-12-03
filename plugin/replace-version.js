const globs = require("globs");
const fs = require("fs");
const VERSION_TEMPLATES = `0.0.0-DEV_BUILD`;

const calcVersion = () => {
  let p = JSON.parse(fs.readFileSync("./package.json", { encoding: "utf8" }));
  let version = p.version.split(".").map(c => parseInt(c));
  for (let n = version.length - 1, ad = 0; n >= 0; n--) {
    if (version[n] + ad + 1 > 9) {
      if (n == 0) {
        version[n] = version[n] + ad + 1;
      } else {
        ad = version[n] + ad - 9;
        version[n] = 0;
      }
    } else {
      version[n] = version[n] + ad + 1;
      ad = 0;
      break;
    }
  }
  return version.join(".");
};
let nextVersion = calcVersion();
let packageJson = JSON.parse(fs.readFileSync("./package.json", { encoding: "utf8" }));
packageJson.version = `${nextVersion}`;
fs.writeFile("./package.json", JSON.stringify(packageJson, null, 2), err => {
  globs("./dist/*.js", (err, matchs) => {
    if (!err) {
      for (let path of matchs) {
        let content = fs.readFileSync(path, { encoding: "utf8" });
        content = content.replace(VERSION_TEMPLATES, `${nextVersion}`);
        fs.writeFileSync(path, content, { encoding: "utf8" });
      }
    }
  });
});
