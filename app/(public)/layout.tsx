import Navbar from "../component/ui/Navbar";
import Footer from "../component/ui/footer";
import CursorEffect from "../component/ui/cursorEffect";
import WhatsAppFloat from "../component/ui/whatsappFloat";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CursorEffect />
      <Navbar />
      <main className="grow pt-16">
        {children}
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
