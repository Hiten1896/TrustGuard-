# TrustGuard — Media Forensic Verification Suite

TrustGuard is a web-based forensic verification platform for assessing the authenticity of digital media — images, video, audio, and network traffic logs. It's built for workflows where someone needs to quickly inspect a file's metadata and flag signs of tampering, rather than take a media file's authenticity at face value.

**[🔗 Live Demo](https://trust-guard-pro.vercel.app)**

---

## 🧭 Overview

- **Purpose:** give forensic analysts / investigators a single workspace to upload media and network logs, and review authenticity signals.
- **Audience:** built with forensic engineers and investigators in mind — the UI is optimized for reviewing dense, multi-layered metadata rather than a general consumer.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS |
| Backend / Data | Firebase Firestore |
| Media Analysis | [`exifr`](https://www.npmjs.com/package/exifr) (EXIF/metadata extraction), [`jsqr`](https://www.npmjs.com/package/jsqr) (QR code detection), [`suncalc`](https://www.npmjs.com/package/suncalc) (sun position calculations — useful for cross-checking claimed shot times/locations against lighting), [`fflate`](https://www.npmjs.com/package/fflate) (fast compression/decompression) |
| Deployment | Vercel |

## 🔍 Verification Capabilities

- **Metadata inspection** — extracts EXIF and other embedded metadata from images to check for signs of editing, missing fields, or inconsistencies
- **QR code detection** — scans images for embedded QR codes as part of media analysis
- **Lighting/geolocation cross-checks** — uses sun position calculations to help flag mismatches between a file's claimed capture time/location and expected lighting conditions
- **Centralized workspace** — review findings across image, video, audio, and network log evidence in one place

*(If there are additional checks — hash comparison, deepfake detection, network log parsing logic — add them here; the above reflects what's evident from the current dependency set.)*

## 🔒 Security & Architecture

- **Firestore access control** — custom `firestore.rules` restrict data access to authenticated requests only.
- **Secrets management** — API keys and backend endpoints are kept out of source control via `.env` (see setup below); `.env.example` documents the required variables without exposing real values.
- **Responsive workspace** — UI is optimized for reviewing multi-layered metadata across device sizes.

## 🚀 Getting Started

**Prerequisites**
- Node.js 18+
- A Firebase project with Firestore enabled

**1. Clone the repo**
```bash
git clone https://github.com/Hiten1896/TrustGuard-.git
cd TrustGuard-
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure environment variables**
```bash
cp .env.example .env
```
Fill in `.env` with your Firebase project credentials (see `.env.example` for the full list of variables this project expects).

**4. Run the dev server**
```bash
npm run dev
```

**5. Build for production**
```bash
npm run build
```

**6. Preview the production build locally**
```bash
npm run preview
```

## 📁 Project Structure

```
trustguard/
├── src/                 # Application source (components, logic)
├── public/              # Static assets
├── firestore.rules       # Firestore security rules
├── vite.config.js        # Vite build configuration
├── vercel.json           # Vercel deployment configuration
├── .env.example           # Template for required environment variables
└── package.json
```

## 🗺️ Roadmap

- [ ] Add automated tests
- [ ] Expand supported file formats
- [ ] API documentation for programmatic access

## 🤝 Contributing

Contributions are welcome. Please open an issue to discuss significant changes before submitting a pull request.

## 📄 License

All Rights Reserved. See [LICENSE](./LICENSE) for details. This code is source-visible for portfolio/demonstration purposes; it is not licensed for reuse, modification, or redistribution.