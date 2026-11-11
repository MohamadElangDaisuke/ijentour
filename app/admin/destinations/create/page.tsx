import DestinationForm from "../DestinationForm";

export const metadata = {
  title: "Tambah Destinasi Baru | Admin Ijen Tour",
  description: "Formulir penambahan katalog destinasi wisata Banyuwangi dan Kawah Ijen.",
};

export default function CreateDestinationPage() {
  return (
    <div className="w-full">
      <DestinationForm mode="create" />
    </div>
  );
}
