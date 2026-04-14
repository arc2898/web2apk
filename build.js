#!/usr/bin/env node
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const Jimp = require("jimp");
const sharp = require("sharp");

const args = process.argv.slice(2);

if (args.length < 3) {
  console.log(`
╔══════════════════════════════════════════════════╗
║            Web2APK — Build APKs from URLs          ║
╠══════════════════════════════════════════════════╣
║  Usage:                                           ║
║    npx web2apk "App Name" "icon.png" "https://..." ║
║                                                    ║
║  Example:                                         ║
║    npx web2apk "My App" ./icon.png "https://..."   ║
╚══════════════════════════════════════════════════╝
`);
  process.exit(1);
}

const [appName, iconPath, url] = args;
const safeName = appName.replace(/[^a-zA-Z0-9]/g, "");
const projectDir = path.join(process.cwd(), `web2apk-${safeName.toLowerCase()}`);

console.log(`\n🚀 Building APK: ${appName}`);
console.log(`   URL: ${url}`);
console.log(`   Icon: ${iconPath}`);
console.log("");

// ── Step 1: Scaffold Capacitor project ──────────────────────────────────────
if (!fs.existsSync(projectDir)) {
  console.log("📦 Scaffolding Capacitor project...");
  execSync(`npx create-capacitor-app@latest "${projectDir}" --app-name "${appName}" --app-id com.web2apk.app --web-dir ./web`, {
    stdio: "inherit",
    cwd: process.cwd(),
  });
} else {
  console.log("✅ Project already exists, skipping scaffold.");
}

// ── Step 2: Generate icons from user image ───────────────────────────────────
const iconsDir = path.join(projectDir, "android", "app", "src", "main", "res");

if (fs.existsSync(iconPath)) {
  console.log("🎨 Generating app icons...");
  (async () => {
    const image = await Jimp.read(iconPath);
    const sizes = [
      { name: "mipmap-mdpi/ic_launcher.png", size: 48 },
      { name: "mipmap-hdpi/ic_launcher.png", size: 72 },
      { name: "mipmap-xhdpi/ic_launcher.png", size: 96 },
      { name: "mipmap-xxhdpi/ic_launcher.png", size: 144 },
      { name: "mipmap-xxxhdpi/ic_launcher.png", size: 192 },
      { name: "drawable/ic_launcher_background.png", size: 108 },
    ];

    for (const { name, size } of sizes) {
      const dir = path.join(iconsDir, ...name.split("/").slice(0, -1));
      fs.mkdirSync(dir, { recursive: true });
      const img = image.clone().resize(size, size);
      await img.writeAsync(path.join(iconsDir, name));
    }

    // Adaptive icon foreground
    const fgDir = path.join(iconsDir, "drawable-v24");
    fs.mkdirSync(fgDir, { recursive: true });
    const fg = image.clone().resize(108, 108);
    await fg.writeAsync(path.join(fgDir, "ic_launcher_foreground.png"));

    console.log("✅ Icons generated.\n");
  })();
} else {
  console.log("⚠️  Icon file not found, using default.");
}

// ── Step 3: Write web URL into Capacitor config ───────────────────────────────
const capacitorConfigPath = path.join(projectDir, "capacitor.config.json");
const capacitorConfig = JSON.parse(fs.readFileSync(capacitorConfigPath, "utf8"));
capacitorConfig.server = { url };
fs.writeFileSync(capacitorConfigPath, JSON.stringify(capacitorConfig, null, 2));
console.log("🔗 URL configured.");

// ── Step 4: Sync to Android ──────────────────────────────────────────────────
console.log("📱 Syncing to Android...");
execSync(`npx cap sync android`, { stdio: "inherit", cwd: projectDir });

// ── Step 5: Build APK ─────────────────────────────────────────────────────────
console.log("\n🔨 Building APK (this may take a few minutes)...");
execSync(`cd "${projectDir}/android" && ./gradlew assembleDebug`, { stdio: "inherit" });

// ── Step 6: Find APK ─────────────────────────────────────────────────────────
const apkFind = execSync(
  `find "${projectDir}" -name "*.apk" -type f 2>/dev/null | head -1`,
  { encoding: "utf8" }
).trim();

if (apkFind) {
  const destDir = process.cwd();
  const apkName = path.basename(apkFind);
  fs.copyFileSync(apkFind, path.join(destDir, apkName));
  console.log(`
╔══════════════════════════════════════════════════╗
║                   ✅ APK Ready!                   ║
╠══════════════════════════════════════════════════╣
║  ${apkName.padEnd(44)}║
║                                                    ║
║  App: ${appName.padEnd(44)}║
║  URL: ${url.substring(0, 44).padEnd(44)}║
╚══════════════════════════════════════════════════╝
`);
} else {
  console.error("❌ APK build failed.");
  process.exit(1);
}
