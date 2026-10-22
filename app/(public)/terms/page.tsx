const sections = [
  {
    title: "Booking requests",
    content:
      "Submitting a booking or custom-tour form sends a request to Ijen Tour; it does not by itself confirm availability or a reservation. The team will review the request and communicate the next steps. A booking is confirmed only when Ijen Tour provides confirmation for that request.",
  },
  {
    title: "Custom tours and pricing",
    content:
      "Custom-tour requests are reviewed by a travel agent, who prepares and communicates a proposal manually outside the application's automatic calculations. The itinerary, services, and any price become applicable only after they are agreed and confirmed directly with Ijen Tour.",
  },
  {
    title: "Payment, changes, and cancellation",
    content:
      "The application's current information does not establish a complete payment schedule, cancellation terms, refund rules, or change fees. These terms must be provided and agreed for the specific booking before payment or confirmation. Ijen Tour should add its approved policies here before publishing this as a final terms document.",
  },
  {
    title: "Travel information and access",
    content:
      "Travel plans may be affected by weather, safety conditions, destination access rules, or decisions by local authorities. Confirm current requirements and arrangements with Ijen Tour before departure, and follow instructions from the tour team and relevant local authorities during your trip.",
  },
  {
    title: "Questions",
    content:
      "For questions about a request or these draft terms, contact Ijen Tour at info@ijentour.com or through the contact page. Any final terms should clearly identify the operating business and the policies applicable to confirmed bookings.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-secondary-50 px-4 py-16 text-secondary-950 sm:px-8 sm:py-20">
      <article className="mx-auto max-w-4xl rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm sm:p-10 lg:p-14">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary-600">Draft for review</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Terms of Service</h1>
        <p className="mt-4 rounded-xl border border-primary-200 bg-primary-50 p-4 text-sm leading-relaxed text-secondary-800 dark:border-secondary-700 dark:bg-secondary-900 dark:text-secondary-200">
          This is a working draft, not a complete or approved legal agreement. In particular, payment, cancellation, refund, and change policies need confirmation from Ijen Tour before final publication.
        </p>
        <div className="mt-10 space-y-8">
          {sections.map(({ title, content }) => (
            <section key={title}>
              <h2 className="text-xl font-bold">{title}</h2>
              <p className="mt-2 leading-relaxed text-secondary-700">{content}</p>
            </section>
          ))}
        </div>
        <p className="mt-10 border-t border-secondary-200 pt-6 text-sm text-secondary-600">
          Contact: <a className="font-semibold text-primary-600 hover:underline" href="mailto:info@ijentour.com">info@ijentour.com</a>
        </p>
      </article>
    </div>
  );
}
