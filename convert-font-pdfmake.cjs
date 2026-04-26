// convert-font-pdfmake.cjs
const fs = require("fs");
const path = require("path");

const inputPath = path.join(__dirname, "src", "font", "NotoSansTamil-Regular.ttf");
const outputPath = path.join(__dirname, "src", "font", "NotoSansTamil.js");

const font = fs.readFileSync(inputPath);
const base64Font = font.toString("base64");

fs.writeFileSync(
  outputPath,
  `export const tamilFonts = {
    NotoSansTamil: {
      normal: "${base64Font}"
    }
  };`,
  "utf8"
);


console.log("✅ Tamil font base64 created for pdfMake ->", outputPath);
