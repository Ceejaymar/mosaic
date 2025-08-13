<!-- PROJECT SHIELDS -->
<!-- Replace `your_username` and `your_repo` with your GitHub username/repo -->

[![GitHub Actions][actions-shield]][actions-url]
[![Prettier][prettier-shield]][prettier-url]
[![Platform][platform-shield]][platform-url]
[![TypeScript][typescript-shield]][typescript-url]
[![Expo][expo-shield]][expo-url]
[![React Native][react-native-shield]][react-native-url]

<br />
<div align="center">
  <a href="https://github.com/your_username/your_repo">
    <!-- Replace with your logo path -->
    <img src="images/logo.png" alt="Mosaic Logo" width="100" height="100">
  </a>

  <h3 align="center">Mosaic</h3>
  <p align="center">
    A privacy-first mood tracking app that helps you visualize your emotions and breathe easier.
    <br />
    <a href="#about-the-project"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="#usage">View Demo</a>
    ·
    <a href="https://github.com/your_username/your_repo/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    ·
    <a href="https://github.com/your_username/your_repo/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

<!-- --- -->

## 📌 About Mosaic

<!-- ![Product Screenshot][product-screenshot] -->

Mosaic is a **local-first** React Native app that helps you track your moods through color-coded entries, visualize them in a beautiful GitHub-style calendar, and practice guided breathing exercises — all while keeping your data private and secure.

<!-- --- -->

## ✨ Features

- 🎨 **GitHub-style Mood Calendar** — Track up to 4 moods per day, each with a unique color and label.
- 🌈 **Multiple Mood Support** — Record morning, afternoon, evening, and night moods.
- 🧘 **Breathing Exercise Tool** — A calming screen with a single “Breathe” button to guide deep breathing.
- 📅 **Local-First Data Storage** — Works completely offline.
- ☁️ **Optional Cloud Sync** — Secure sync with Supabase (user opt-in only).
- 🔒 **Privacy-Focused** — Minimal permissions, encrypted sensitive data.
- ♿ **Accessibility-First** — Designed from the ground up for inclusivity.

<!-- --- -->

## 🛠️ Built With

- [Expo](https://expo.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Expo Router](https://expo.github.io/router/)
  <!-- - [NativeWind](https://www.nativewind.dev/) + NativeWind UI -->
  <!-- - [Moti](https://moti.fyi/) animations -->
  <!-- - [Zustand](https://zustand-demo.pmnd.rs/) for state management -->
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) + [WatermelonDB](https://nozbe.github.io/WatermelonDB/)
  <!-- - [Supabase](https://supabase.com/) for optional cloud sync -->
  <!-- - [RevenueCat](https://www.revenuecat.com/) for monetization -->
- [Jest](https://jestjs.io/) + [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
<!-- - [Maestro](https://maestro.mobile.dev/) for E2E testing -->

<!-- --- -->

<!-- ## 🚀 Getting Started

Follow these steps to set up Mosaic locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (>= 18.x)
- [Yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

```bash
npm install --global yarn expo-cli
``` -->

<!-- ### Installation

1. Clone the repo:
   ```bash
   git clone https://github.com/your_username/your_repo.git
   ```
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Start the development server:
   ```bash
   yarn start
   ```
4. Scan the QR code with Expo Go on your device.

--- -->

## 📲 Usage

Mosaic is simple by design:

1. **Open the app** each day and select up to 4 moods.
2. **Visualize your moods** on the calendar.
3. Tap the **Breathe** button when you need a moment of calm.
4. Optionally, **sync your data** to Supabase for backup.

<!-- ![Usage GIF][usage-gif] -->

> _Coming soon_: Journaling, AI-powered mood insights, CSV export, and reminders.

---

## 🗺️ Roadmap

- [ ] AI-generated mood trend analysis
- [ ] Journaling with daily notes
- [ ] CSV/JSON data export
- [ ] Push notifications for reminders
- [ ] Dark mode + high-contrast mode

See the [open issues](https://github.com/your_username/your_repo/issues) for a full list of proposed features and known issues.

---

## 🔐 Security & Privacy

- All sensitive data is stored securely using **SecureStore**.
- No data is shared unless you explicitly opt-in to cloud sync.
- Offline functionality is fully supported.

---

## ♿ Accessibility Commitment

Mosaic is designed for everyone:

- Full support for screen readers
- Large touch targets
- High contrast options
- Descriptive labels for all interactive elements

<!-- --- -->

<!-- ## 🤝 Contributing -->

<!-- --- -->

## 📬 Contact

Carlos — [LinkedIn](https://linkedin.com/in/linkedin_username)

<!-- Project Link: [https://github.com/your_username/your_repo](https://github.com/your_username/your_repo) -->

<!-- --- -->

[forks-shield]: https://img.shields.io/github/forks/your_username/your_repo.svg?style=for-the-badge
[forks-url]: https://github.com/your_username/your_repo/network/members
[stars-shield]: https://img.shields.io/github/stars/
[expo-shield]: https://img.shields.io/badge/Expo-000?style=for-the-badge&logo=expo&logoColor=fff
[expo-url]: https://expo.dev/
[react-native-shield]: https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[react-native-url]: https://reactnative.dev/
[typescript-shield]: https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
[typescript-url]: https://www.typescriptlang.org/
[actions-shield]: https://img.shields.io/github/actions/workflow/status/your_username/your_repo/run-tests.yml?style=for-the-badge
[actions-url]: https://github.com/your_username/your_repo/actions
[prettier-shield]: https://img.shields.io/badge/Code_Style-Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=fff
[prettier-url]: https://prettier.io/
[platform-shield]: https://img.shields.io/badge/Platform-iOS%20%7C%20Android-blue?style=for-the-badge&logo=apple&logoColor=white&logo=android&color=3DDC84
[platform-url]: https://reactnative.dev/
[product-screenshot]: images/screenshot.png
[usage-gif]: images/usage.gif
