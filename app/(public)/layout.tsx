import Navbar from "../component/ui/Navbar";
import Footer from "../component/ui/footer";
import WhatsAppFloat from "../component/ui/whatsappFloat";

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
    </>
  );
}
