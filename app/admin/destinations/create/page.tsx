import DestinationForm from "../DestinationForm";

export const metadata = {
  title: "Add New Destination | Mount Ijen Tour Admin",
  description: "Form to add a new Banyuwangi and Mount Ijen destination to the catalog.",
};

export default function CreateDestinationPage() {
  return (
    <div className="w-full">
      <DestinationForm mode="create" />
    </div>
  );
}
