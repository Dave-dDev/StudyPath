import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudyPath — AI-Powered Study Tool",
  description: "Turn any notes into personalised quizzes, flashcards, and Feynman summaries with Gemini AI.",
  keywords: ["study", "AI", "quiz", "flashcards", "spaced repetition", "Gemini"],
  openGraph: {
    title: "StudyPath",
    description: "AI-powered studying. Paste your notes, get a quiz in seconds.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { fontFamily: "Inter", fontSize: "14px", borderRadius: "12px" },
              success: { iconTheme: { primary: "#1d9e75", secondary: "#fff" } },
            }}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
