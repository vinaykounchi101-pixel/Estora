import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Estora | Real Estate Decision Support',
  description: 'Editorial Luxury Real Estate Price & Rent Prediction',
};

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#F8F6F1] text-[#252722] antialiased">{children}</body>
    </html>
  );
}
