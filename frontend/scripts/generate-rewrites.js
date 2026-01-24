/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const outDirectory = path.join(__dirname, "../out");
const firebaseConfigPath = path.join(__dirname, "../firebase.json");

// Function to find all directories with index.html files
function findPagesWithIndexHtml(dir, basePath = "") {
  const files = fs.readdirSync(dir);
  let pages = [];

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Check if this directory has an index.html
      const indexPath = path.join(filePath, "index.html");
      if (fs.existsSync(indexPath)) {
        const routePath = path.join(basePath, file).replace(/\\/g, "/");
        // Skip the 404 directory since we handle 404.html separately
        if (file !== "404") {
          pages.push(`/${routePath}`);
        }
      }

      // Recursively check subdirectories
      const subPath = path.join(basePath, file);
      pages = [...pages, ...findPagesWithIndexHtml(filePath, subPath)];
    }
  });

  return pages;
}

// Find all pages (directories with index.html, excluding 404)
const pages = findPagesWithIndexHtml(outDirectory);

console.log("Found pages:", pages);

// Generate rewrite rules
let rewrites = [];

// Add specific page rewrites (for directories with index.html)
pages.forEach((page) => {
  rewrites.push({
    source: `${page}{,/**}`,
    destination: `${page}/index.html`,
  });
});

// Add 404 page rewrite (handle the standalone 404.html file)
if (fs.existsSync(path.join(outDirectory, "404.html"))) {
  rewrites.push({
    source: "/404{,/**}",
    destination: "/404.html",
  });
}

// Add the root catch-all rewrite at the end
rewrites.push({
  source: "/**",
  destination: "/index.html",
});

console.log("Generated rewrites:", JSON.stringify(rewrites, null, 2));

// Read the existing firebase.json configuration
const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf8"));

// Update the rewrites in firebase.json
firebaseConfig.hosting = firebaseConfig.hosting || {};
firebaseConfig.hosting.rewrites = rewrites;

// Write the updated configuration back to firebase.json
fs.writeFileSync(firebaseConfigPath, JSON.stringify(firebaseConfig, null, 2));

console.log("firebase.json has been updated with new rewrites.");
