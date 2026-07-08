import Navbar from '@/components/store/Navbar';
import FooterNav from '@/components/store/FooterNav';
import ClientOnlyWidgets from '@/components/store/ClientOnlyWidgets';
import AnnouncementBar from '@/components/widgets/AnnouncementBar';
import SeasonalBanner from '@/components/widgets/SeasonalBanner';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SeasonalBanner />
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 pt-0 pb-4 sm:pb-8 mb-16 md:mb-0">
        {children}
      </main>
      <FooterNav />
      <ClientOnlyWidgets />
    </>
  );
}
