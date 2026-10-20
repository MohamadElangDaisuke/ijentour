import Navbar from "../component/ui/Navbar";
import Footer from "../component/ui/footer";
import HelpCenterFloat from "../component/ui/HelpCenterFloat";
import BookingModal from "../component/ui/BookingModal";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="grow pt-16">
        {children}
      </main>
      <Footer />
      <HelpCenterFloat />
      <BookingModal />
    </>
  );
}
