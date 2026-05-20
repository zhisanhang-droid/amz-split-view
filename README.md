# Amazon Mobile Split View

A Chrome extension that splits your browser into **desktop view on the left** and **Amazon App mobile view on the right** — no DevTools required.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-brightgreen?logo=googlechrome)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## What it does

Click the extension icon on any Amazon page → your browser splits into two independent windows:

| Left | Right |
|------|-------|
| Desktop view (unchanged) | Amazon App mobile view (393 px wide) |
| Scroll freely | Scroll independently |

Click the icon again → windows restore to original layout.

---

## Why this exists

Amazon's mobile traffic is **>65%** of total visits, but most seller tools are desktop-only. DevTools device emulation requires F12 → click → select device every time. This extension does it in one click with zero setup.

---

## How it works

- Opens the same URL in a **393 px wide window** (iPhone 15 width), which triggers Amazon's responsive mobile layout
- Overrides the `User-Agent` header to `AmazonApp/25.18.0.300` via `chrome.declarativeNetRequest` — no yellow "automated testing" banner
- Cleans up automatically when you close the mobile window

---

## Installation

### From source (developer mode)

1. Clone this repo:
   ```bash
   git clone https://github.com/zhisanhang-droid/amz-split-view.git
   ```
2. Open Chrome → `chrome://extensions/`
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked** → select the `amz-split-view` folder
5. The 📱 icon appears in your toolbar

### From Chrome Web Store

*(Coming soon)*

---

## Usage

1. Navigate to any Amazon product page or search results page
2. Click the 📱 extension icon
3. Click **Open Split View →**
4. Desktop window moves to the left half; mobile window (393 px) opens on the right
5. To exit: click the icon in either window → **Exit Split View**

---

## Device preset

| Setting | Value |
|---------|-------|
| Device | iPhone 15 |
| Viewport width | 393 px |
| User-Agent | Amazon Shopping App 25.18 · iOS 17 |

---

## Permissions explained

| Permission | Why |
|-----------|-----|
| `tabs` | Read the current tab's URL to open the same page in the mobile window |
| `windows` | Create and resize browser windows |
| `declarativeNetRequest` | Override the User-Agent header for the mobile tab |
| `storage` | Remember window state across popup opens |
| Host permissions (`*.amazon.*`) | Required by Chrome to modify request headers on Amazon domains |

---

## License

MIT
