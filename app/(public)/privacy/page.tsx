const sections = [
  {
    title: "Information we collect",
    content:
      "When you contact us or request a booking, the information you submit may include your name, email address, phone or WhatsApp number, travel dates, group size, destinations, pickup location, and the trip preferences or message you provide. If you use an account, account details may also be processed.",
  },
  {
    title: "How information is used",
    content:
      "We use submitted information to respond to questions, review and coordinate booking requests, prepare custom-tour proposals with a travel agent, provide trip support, and administer the service. Custom-tour pricing is prepared by the travel team outside the application's automatic calculations.",
  },
  {
    title: "Storage and access",
    content:
      "Contact messages and booking requests are stored in the application's database and are available to authorized administrators for handling your request. The site also stores your theme preference in your browser's local storage. Storage providers, data locations, and any additional service-provider access should be confirmed by Ijen Tour before this draft is published as its final policy.",
  },
  {
    title: "Sharing and external services",
    content:
      "We may need to use the contact details you provide to coordinate your requested trip. If you choose to contact us through WhatsApp or another external service, that service processes information under its own terms and privacy policy. This draft does not establish a complete list of service providers or international data transfers; Ijen Tour should verify and complete those details before publication.",
  },
  {
    title: "Retention and your requests",
    content:
      "A specific retention schedule and request-handling process have not been confirmed in the available service information. For questions about information you submitted, or to request a correction or deletion, contact info@mountijentour.com. Mount Ijen Tour should confirm its retention periods and applicable privacy procedures before treating this draft as final.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-secondary-50 px-4 py-16 text-secondary-950 sm:px-8 sm:py-20">
      <article className="mx-auto max-w-4xl rounded-3xl border border-secondary-200 bg-white p-6 shadow-sm sm:p-10 lg:p-14">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary-600">Draft for review</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Privacy Policy</h1>
        <p className="mt-4 rounded-xl border border-primary-200 bg-primary-50 p-4 text-sm leading-relaxed text-secondary-800 dark:border-secondary-700 dark:bg-secondary-900 dark:text-secondary-200">
          This draft is based on the information currently visible in the application. Ijen Tour should review and complete it, especially the provider, retention, and legal-contact details, before treating it as its official privacy policy.
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
          Contact: <a className="font-semibold text-primary-600 hover:underline" href="mailto:info@mountijentour.com">info@mountijentour.com</a>
        </p>
      </article>
    </div>
  );
}
