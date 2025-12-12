import fs from "fs";
import path from "path";

const excludedPaths = ["src/app/test_pages"];

// Move the excluded paths back
excludedPaths.forEach((excludedPath) => {
  const tempPath = path.join("_temp", path.basename(excludedPath));
  if (fs.existsSync(tempPath)) {
    fs.renameSync(tempPath, excludedPath);
    console.log(`Restored ${excludedPath} from _temp`);
  }
});

// Clean up _temp directory if empty
if (fs.existsSync("_temp")) {
  const tempContents = fs.readdirSync("_temp");
  // Filters out system files like .DS_Store
  const realFiles = tempContents.filter((file) => !file.startsWith("."));
  if (realFiles.length === 0) {
    fs.rmSync("_temp", { recursive: true, force: true });
    console.log("🧹 _temp directory removed!");
  } else {
    console.log(
      `⚠️ The _temp directory still contains: ${realFiles.join(", ")}`
    );
  }
}
