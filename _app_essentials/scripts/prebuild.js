import fs from "fs";
import path from "path";

const excludedPaths = ["src/app/test_pages"];

// Create _temp directory if it doesn't exist
if (!fs.existsSync("_temp")) {
  fs.mkdirSync("_temp");
  // Move each excluded path to the _temp folder
  excludedPaths.forEach((excludedPath) => {
    const tempPath = path.join("_temp", path.basename(excludedPath));
    // Safety check: don't overwrite existing temp files
    if (fs.existsSync(tempPath)) {
      console.log(
        `⚠️  Skipping ${excludedPath} - temp file already exists: ${tempPath}`
      );
      return;
    }
    if (fs.existsSync(excludedPath)) {
      fs.renameSync(excludedPath, tempPath);
      console.log(`Moved ${excludedPath} to _temp`);
    }
  });
} else {
  console.log(`⚠️  You already have a _temp folder. Check your files.`);
}
