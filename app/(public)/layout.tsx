import Navbar from "../component/ui/Navbar";
import Footer from "../component/ui/footer";
import WhatsAppFloat from "../component/ui/whatsappFloat";
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
      <WhatsAppFloat />
      <BookingModal />
    </>
  );
}
