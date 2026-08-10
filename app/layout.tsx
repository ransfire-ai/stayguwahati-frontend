import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';

export const metadata = {
  title: 'StayGuwahati',
  description: 'Find handpicked homestays across Guwahati.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}