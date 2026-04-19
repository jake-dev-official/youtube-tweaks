# YouTubeTweaks: Premium Workflow Mastery

YouTubeTweaks is an elite, minimalist browser extension designed to transform your YouTube experience into a high-performance productivity workspace. It combines native-feeling keyboard shortcuts with advanced layout optimizations and a professional-grade Cinematic Mode.

## 🚀 Native-Grade Features

### 1. Comments on Right (Sidebar Layout)
Maximize your viewing area by pinning the comment section to the right sidebar.
- **Shortcut**: `Ctrl + ,` (Default)

### 2. Native Tweaks (AI & Comments)
Standardize your interaction with YouTube's core tools.
- **Ask AI (Gemini)**: Instant toggle for the native AI assistant panel. (`Alt + ,`)
- **Smart Comments**: Instant scroll to the comments section or back to the top. (`Alt + .`)

### 3. Aspect Ratio (Cinematic Mode)
Force your videos into a professional cinematic frame during **Fullscreen** playback.
- **Multiple Ratios**: Toggle between **2:1**, **2.35:1**, and **4:3**.
- **Dynamic Fits**: Choose between **Crop** (cover) or **Stretch** (fill).
- **Shortcut**: `Ctrl + .` (Default)
- **Note**: Only works in Fullscreen Only mode.

### 4. Video Quality HUD (Bi-Directional)
Take manual control of YouTube's adaptive quality engine. Cycle through available resolutions instantly without opening the settings gear.
- **Cycle Up (Towards Auto)**: `Ctrl + ↑`
- **Cycle Down (Towards 144p)**: `Ctrl + ↓`
- **Visual Feedback**: A premium, centered "toast" HUD confirms your quality selection instantly.
- **Pro Tip**: This feature is "baked-in" to the extension and bypasses Chrome's strict keyboard limits.

## ⌨️ Pro Shortcuts & Customization

YouTubeTweaks uses the high-performance **Chrome Commands API**. This ensures shortcuts are fast and never conflict with YouTube's internal logic.

### Default Shortcuts
| Feature | Default Browser Key | Type |
| :--- | :--- | :--- |
| **Video Quality** | `Ctrl + ↑` / `Ctrl + ↓` | Hardcoded |
| **Comments on Right** | `Ctrl + ,` | Customizable |
| **Ask Gemini** | `Alt + ,` | Customizable |
| **Smart Comments** | `Alt + .` | Customizable |
| **Aspect Ratio** | `Ctrl + .` | Customizable |

### How to Change Them:
1. Open the YouTubeTweaks popup.
2. **Hover and Click** any of the blue-highlighting shortcuts (e.g., `Ctrl + ,`).
3. You will be taken instantly to the browser's shortcut management page.
4. **Done!** The extension popup will instantly show your updated key in its sleek capsule.

## ⚙️ Initial Configuration (Default States)

When you first install YouTubeTweaks, it starts with a "Safe" configuration:
- **Native Tweaks**: `ENABLED` (So you can use Ask AI and Smart Comments immediately).
- **Comments on Right**: `DISABLED`.
- **Aspect Ratio**: `DISABLED`.

You can enable the extra layout features instantly via the popup dashboard.

## 🛠️ Installation & Security Note

For the best experience and to avoid browser security blocks, **always use the "Load Unpacked" method** described below.

> [!WARNING]
> Modern browsers often block `.crx` files that are not from the Official Web Store. The **Load Unpacked** method is the only 100% reliable way to install custom workflow tools like this.

### Step-by-Step Installation:
1. **Open Extensions**: Go to `chrome://extensions`.
2. **Developer Mode**: Ensure "Developer mode" is enabled (top-right).
3. **Load Unpacked**: Click "Load unpacked" and select this project folder.
4. **Pin for Power**: Pin the extension to your toolbar for instant access to the Master-Detail dashboard.

## 🎨 Design Philosophy & Architecture

YouTubeTweaks follows a **Pro-First** design philosophy. We favor performance and reliability over flashy UI.

### The "Hybrid" Shortcut System
You will notice the extension uses two types of shortcuts in its dashboard:
1. **Configurable (✎ Icon)**: These are native Chrome commands. We chose these for layout features so you can customize them to your own hand-positioning.
2. **Hardcoded (Standard Style)**: Features like **Video Quality** use an internal state machine combined with `Ctrl+↑/↓`. We "bake these in" to bypass Chrome's native limit of 4 shortcuts, giving you more power than a standard extension without cluttering your browser settings.

---
*Built for speed. Zero flicker. Elite minimalism.*


**V1.0 Handover Complete.**


**Developed by JAKEDev.**