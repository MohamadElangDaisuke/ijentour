import { redirect } from "next/navigation";

export default function NewTripRedirect() {
  redirect("/admin/trips/create");
}
