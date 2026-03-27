import { ReduxProvider } from '../store/provider';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import NavbarWrapper from '../components/Layout/NavbarWrapper';

export const metadata = {
  title: 'StockFlow - Inventory Management System',
  description: 'Simple and efficient inventory management for your business',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <Toaster position="top-right" />
          <NavbarWrapper />
          <main className="py-10">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </ReduxProvider>
      </body>
    </html>
  );
}