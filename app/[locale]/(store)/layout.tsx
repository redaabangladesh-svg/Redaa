import Navbar from '@/components/store/Navbar';
import FooterNav from '@/components/store/FooterNav';
import ExitIntentPopup from '@/components/store/ExitIntentPopup';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-16 md:mb-0">
        {children}
      </main>
      <FooterNav />
      <ExitIntentPopup />
    </>
  );
}
