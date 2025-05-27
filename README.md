# Bunkr

## Overview

Bunkr is a student-focused attendance tracker that gives you the insights you actually need. Built as a better alternative to Ezygo, it presents your attendance data with a clean, intuitive interface that makes sense to students. No more confusing numbers - just clear, actionable insights!

<!-- Also available as a Flutter app: [Bunkr Mobile](https://github.com/ABHAY-100/bunkr-app) -->

<br />

## 🎯 Features

- **Smart Skip Calculator** 🧮 - Know exactly how many classes you can miss while staying above attendance requirements
- **Better Data Presentation** 📈 - Clean, user-friendly interface that actually makes your attendance data understandable
- **Ezygo Integration** 🔄 - Use your existing ezygo credentials - no new accounts needed
- **Real-time Updates** ⚡ - Get instant updates on your attendance status and skip calculations
- **Mobile Friendly** 📱 - Access your attendance data on any device, anywhere

<br />

## 🛠️ Tech Stack

- **Frontend** - Next.js 15.3.0 with React 18
- **Styling** - Tailwind CSS for a modern, responsive design
- **UI Components** - Radix UI for accessible, consistent components
- **Data Visualization** - Recharts for beautiful attendance graphs
- **Animations** - Framer Motion for smooth transitions

<br />

## 📁 Project Structure

```
src/
├── app/              # Next.js app router pages and layouts
│   ├── (auth)/      # Authentication-related routes
│   ├── (root)/      # Main application routes
│   ├── globals.css  # Global styles
│   └── layout.tsx   # Root layout
├── components/       # Reusable React components
├── providers/        # React context providers
├── utils/           # Utility functions
├── assets/          # Static assets
├── types/           # TypeScript type definitions
├── lib/             # Core library code
└── hooks/           # Custom React hooks
```

<br />

## 🔌 API Integration

Create a `.env` file in the root directory and add:
```
NEXT_PUBLIC_BACKEND_URL=https://production.api.ezygo.app/api/v1/Xcr45_salt
```
> ⚠️ **Warning:** This is a reverse-engineered API. Use at your own risk.

<br />

## 🚀 Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- npm or yarn

### Quick Start

1. Clone the Repository
   ```bash
   git clone https://github.com/ABHAY-100/bunkr-web.git
   ```

2. Navigate to Project Directory
   ```bash
   cd bunkr-web
   ```

3. Install Dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

4. Create `.env` file and add the API URL

5. Start Development Server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

The application will be available at `http://localhost:3000` 🎉

<br />

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

<br />

## 👥 Team

- [Abhay Balakrishnan](https://github.com/ABHAY-100)
- [Asil Mehaboob](https://github.com/AsilMehaboob)
- [Sreyas B Anand](https://github.com/sreyas-b-anand)

<br />

## 📧 Contact

For any questions, feel free to reach out to me via email at [abhaybalakrishnan977@gmail.com](mailto:abhaybalakrishnan977@gmail.com)

<br />

## 📄 License

This project is licensed under the **GNU General Public License v3.0** - see the [LICENSE](LICENSE) file for details.

<br />

***Thank you for your interest in Bunkr! 🤝***
