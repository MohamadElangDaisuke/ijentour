import { LivePackage, LiveDestination, LiveFaq } from "@/lib/travelAssistant";
import { formatCurrency } from "@/lib/utils";
import { getAdminWhatsAppNumber, getWhatsAppLink, WhatsAppTemplates } from "@/lib/whatsapp";
import {
  ChatbotClassificationResult,
  ChatbotResponse,
  ConversationContext,
} from "./types";

/**
 * Builds deterministic, accurate, database-grounded responses
 */
export function buildChatbotResponse(
  classification: ChatbotClassificationResult,
  previousContext: ConversationContext,
  livePackages: LivePackage[],
  liveDestinations: LiveDestination[],
  _liveFaqs: LiveFaq[]
): ChatbotResponse {
  const { intent, language, entities, matchedFaq, clarificationPrompt } = classification;
  const adminPhone = getAdminWhatsAppNumber();

  // Helper to get package by ID or slug
  const getPackage = (idOrSlug?: string): LivePackage | undefined => {
    if (!idOrSlug) return undefined;
    return livePackages.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
  };

  // Base context to retain
  const newContext: ConversationContext = {
    ...previousContext,
    language,
    lastIntent: intent,
  };

  // 1. OUT OF SCOPE (Section 9.B)
  if (intent === "OUT_OF_SCOPE") {
    const waLink = getWhatsAppLink(WhatsAppTemplates.generalInquiry("General Tour Assistance"));
    const message =
      language === "id"
        ? `Maaf, saya hanya dapat membantu informasi seputar layanan Ijen Tour, seperti paket wisata, harga, destinasi, FAQ, dan panduan perjalanan. Silakan ajukan pertanyaan terkait layanan kami, atau [hubungi tim kami via WhatsApp](${waLink}) jika membutuhkan bantuan lebih lanjut.`
        : `Sorry, I can only help with Ijen Tour services, including tour packages, prices, destinations, FAQs, and travel information. Please ask a question related to our services, or [contact our team through WhatsApp](${waLink}) if you need further assistance.`;

    return {
      success: true,
      message,
      context: newContext,
      suggestedPrompts:
        language === "id"
          ? ["Daftar paket wisata", "Berapa harga paket Blue Fire?", "Cara booking paket"]
          : ["Show tour packages", "How much is Blue Fire tour?", "How to book a trip"],
    };
  }

  // 2. AMBIGUOUS CLARIFICATION (Section 9.A)
  if (intent === "AMBIGUOUS_CLARIFICATION") {
    const defaultClarification =
      language === "id"
        ? "Paket wisata mana yang ingin Anda ketahui harganya? Anda dapat menyebutkan nama paketnya agar saya dapat memberikan informasi yang tepat."
        : "Which tour package would you like to know the price of? You can mention the package name so I can provide the correct information.";

    const packageOptions = livePackages.slice(0, 4).map((p) => `• **${p.title}**`).join("\n");
    const fullMessage = `${clarificationPrompt || defaultClarification}\n\n${
      language === "id" ? "Pilihan paket kami:" : "Our available tour packages:"
    }\n${packageOptions}`;

    return {
      success: true,
      message: fullMessage,
      context: newContext,
      suggestedPrompts: livePackages.slice(0, 3).map((p) => p.title),
    };
  }

  // 3. GREETING
  if (intent === "GREETING") {
    const message =
      language === "id"
        ? `Halo! Selamat datang di **Ijen Tour**. Saya siap membantu Anda dengan informasi paket wisata, harga resmi, durasi, jadwal Blue Fire, dan rekomendasi trip.\n\nApa yang ingin Anda tanyakan tentang trip kami?`
        : `Hello! Welcome to **Ijen Tour**. I am here to assist you with tour package details, official pricing, duration, Blue Fire schedules, and trip recommendations.\n\nWhat would you like to know about our tours?`;

    return {
      success: true,
      message,
      context: newContext,
      suggestedPrompts:
        language === "id"
          ? ["Daftar paket wisata", "Harga paket Midnight Blue Fire", "Rekomendasi paket di bawah 1 juta"]
          : ["View tour packages", "Blue Fire tour price", "Tour recommendation under IDR 1M"],
    };
  }

  // 4. CONTACT SUPPORT (Section 10)
  if (intent === "CONTACT_SUPPORT") {
    const waLink = getWhatsAppLink(WhatsAppTemplates.generalInquiry("General Tour Assistance"));
    const message =
      language === "id"
        ? `Anda dapat langsung menghubungi tim koordinator resmi Ijen Tour melalui saluran berikut:\n\n` +
          `• 📱 **WhatsApp Resmi**: [Chat WhatsApp (+${adminPhone})](${waLink})\n` +
          `• ✉️ **Email Dukungan**: info@ijentour.com\n` +
          `• 📍 **Kantor Operasional**: Banyuwangi, Jawa Timur\n\n` +
          `Tim kami siap melayani konsultasi private tour, konfirmasi kuota pendakian, dan pertanyaan teknis lainnya.`
        : `You can directly reach the official Ijen Tour coordination team through our official channels:\n\n` +
          `• 📱 **Official WhatsApp**: [Chat on WhatsApp (+${adminPhone})](${waLink})\n` +
          `• ✉️ **Email Support**: info@ijentour.com\n` +
          `• 📍 **Basecamp Location**: Banyuwangi, East Java, Indonesia\n\n` +
          `Our coordinators are ready to help with custom itineraries, hiking permits, and group bookings.`;

    return {
      success: true,
      message,
      context: newContext,
      suggestedPrompts:
        language === "id"
          ? ["Lihat daftar paket", "Cara booking", "Rekomendasi paket"]
          : ["View all packages", "How to book", "Recommend a tour"],
    };
  }

  // 5. LIST PACKAGES
  if (intent === "LIST_PACKAGES") {
    if (livePackages.length === 0) {
      const message =
        language === "id"
          ? `Saat ini belum ada paket wisata aktif di sistem kami. Silakan hubungi tim kami via WhatsApp untuk informasi trip terbaru.`
          : `There are currently no active tour packages available in our system. Please contact our team via WhatsApp for upcoming departures.`;

      return { success: true, message, context: newContext };
    }

    let message =
      language === "id"
        ? `Berikut adalah daftar **${livePackages.length} paket wisata resmi Ijen Tour** yang tersedia saat ini:\n\n`
        : `Here are our current **${livePackages.length} official Ijen Tour packages** available in our catalog:\n\n`;

    livePackages.forEach((pkg, idx) => {
      message += `${idx + 1}. **[${pkg.title}](/packages/${pkg.id})**\n`;
      message += `   • **Harga**: ${pkg.price} / orang\n`;
      message += `   • **Durasi**: ${pkg.duration}\n`;
      message += `   • **Tingkat Kesulitan**: ${pkg.difficulty}\n\n`;
    });

    message +=
      language === "id"
        ? `Anda dapat menanyakan rincian fasilitas, jadwal, atau harga spesifik dari salah satu paket di atas.`
        : `Feel free to ask for specific pricing, inclusions, or itineraries for any of these tours!`;

    return {
      success: true,
      message,
      recommendedPackages: livePackages.slice(0, 3),
      context: newContext,
      suggestedPrompts: livePackages.slice(0, 3).map((p) => p.title),
    };
  }

  // 6. PACKAGE PRICE
  if (intent === "PACKAGE_PRICE") {
    const targetId = entities.packageIds[0] || previousContext.lastPackageId;
    const pkg = getPackage(targetId) || livePackages[0];

    if (!pkg) {
      const message =
        language === "id"
          ? `Informasi harga paket tersebut belum tersedia di sistem kami. Silakan hubungi tim kami via WhatsApp di +${adminPhone}.`
          : `Price information for this package is not currently available in our system. Please contact our official team via WhatsApp at +${adminPhone}.`;
      return { success: true, message, context: newContext };
    }

    newContext.lastPackageId = pkg.id;
    newContext.lastPackageName = pkg.title;

    let message =
      language === "id"
        ? `Harga resmi untuk paket **[${pkg.title}](/packages/${pkg.id})** adalah **${pkg.price}** (${formatCurrency(
            pkg.basePrice
          )}) per peserta.\n\n`
        : `The official price for **[${pkg.title}](/packages/${pkg.id})** is **${pkg.price}** (${formatCurrency(
            pkg.basePrice
          )}) per person.\n\n`;

    if (pkg.groupDiscountPercent > 0) {
      message +=
        language === "id"
          ? `• 🎁 **Diskon Rombongan**: Diskon s.d. ${pkg.groupDiscountPercent}% untuk grup di atas ${pkg.minParticipants} orang.\n`
          : `• 🎁 **Group Discount**: Up to ${pkg.groupDiscountPercent}% off for groups above ${pkg.minParticipants} travelers.\n`;
    }

    message +=
      language === "id"
        ? `• ⏱ **Durasi**: ${pkg.duration}\n` +
          `• 📍 **Titik Kumpul**: ${pkg.meetingPoint || "Banyuwangi"}\n\n` +
          `Anda dapat menanyakan fasilitas yang termasuk, rundown itinerary, atau langsung melakukan pemesanan melalui tombol di bawah.`
        : `• ⏱ **Duration**: ${pkg.duration}\n` +
          `• 📍 **Meeting Point**: ${pkg.meetingPoint || "Banyuwangi Area"}\n\n` +
          `You can also ask about what's included, view the itinerary, or book this tour below.`;

    return {
      success: true,
      message,
      recommendedPackages: [pkg],
      context: newContext,
      suggestedPrompts:
        language === "id"
          ? [`Fasilitas ${pkg.title}`, `Itinerary ${pkg.title}`, "Cara booking paket ini"]
          : [`What is included in ${pkg.title}?`, `Itinerary for ${pkg.title}`, "How to book this tour"],
    };
  }

  // 7. PACKAGE DURATION
  if (intent === "PACKAGE_DURATION") {
    const targetId = entities.packageIds[0] || previousContext.lastPackageId;
    const pkg = getPackage(targetId) || livePackages[0];

    if (!pkg) {
      const message =
        language === "id"
          ? `Informasi durasi paket tersebut belum tersedia di database kami. Silakan hubungi koordinator kami di +${adminPhone}.`
          : `Duration information for this package is not currently available. Please contact our team at +${adminPhone}.`;
      return { success: true, message, context: newContext };
    }

    newContext.lastPackageId = pkg.id;
    newContext.lastPackageName = pkg.title;

    const message =
      language === "id"
        ? `Durasi untuk paket **[${pkg.title}](/packages/${pkg.id})** adalah **${pkg.duration}** (${pkg.durationDays} Hari, ${pkg.durationNights} Malam).\n\n` +
          `• ⏰ **Waktu Keberangkatan**: ${pkg.departureTime || "00:00 WIB"}\n` +
          `• 📍 **Titik Kumpul**: ${pkg.meetingPoint || "Banyuwangi"}\n` +
          `• 🏔 **Tingkat Trekking**: ${pkg.difficulty}\n` +
          `• 💰 **Harga**: ${pkg.price}`
        : `The duration for **[${pkg.title}](/packages/${pkg.id})** is **${pkg.duration}** (${pkg.durationDays} Day(s), ${pkg.durationNights} Night(s)).\n\n` +
          `• ⏰ **Departure Time**: ${pkg.departureTime || "00:00 WIB (Midnight)"}\n` +
          `• 📍 **Meeting Point**: ${pkg.meetingPoint || "Banyuwangi Area"}\n` +
          `• 🏔 **Trekking Difficulty**: ${pkg.difficulty}\n` +
          `• 💰 **Price**: ${pkg.price}`;

    return {
      success: true,
      message,
      recommendedPackages: [pkg],
      context: newContext,
      suggestedPrompts:
        language === "id"
          ? [`Berapa harga ${pkg.title}?`, `Fasilitas ${pkg.title}`, "Cara booking"]
          : [`How much is ${pkg.title}?`, `What is included in ${pkg.title}?`, "How to book"],
    };
  }

  // 8. PACKAGE FACILITIES (Inclusions & Exclusions)
  if (intent === "PACKAGE_FACILITIES") {
    const targetId = entities.packageIds[0] || previousContext.lastPackageId;
    const pkg = getPackage(targetId) || livePackages[0];

    if (!pkg) {
      const message =
        language === "id"
          ? `Informasi fasilitas paket tersebut belum tersedia di database kami. Silakan hubungi koordinator kami di +${adminPhone}.`
          : `Facilities data for this package is not currently available. Please contact our team at +${adminPhone}.`;
      return { success: true, message, context: newContext };
    }

    newContext.lastPackageId = pkg.id;
    newContext.lastPackageName = pkg.title;

    let message =
      language === "id"
        ? `Berikut rincian fasilitas untuk paket **[${pkg.title}](/packages/${pkg.id})**:\n\n` +
          `✅ **Fasilitas Termasuk (Included)**:\n`
        : `Here are the official inclusions and exclusions for **[${pkg.title}](/packages/${pkg.id})**:\n\n` +
          `✅ **Included Facilities**:\n`;

    if (pkg.included.length > 0) {
      pkg.included.forEach((inc) => {
        message += `• ${inc}\n`;
      });
    } else {
      message += language === "id" ? `• Transportasi, tiket masuk, dan pemandu lokal berlisensi.\n` : `• Transport, entrance tickets, and certified guide.\n`;
    }

    message += language === "id" ? `\n❌ **Tidak Termasuk (Excluded)**:\n` : `\n❌ **Not Included (Excluded)**:\n`;
    if (pkg.excluded.length > 0) {
      pkg.excluded.forEach((exc) => {
        message += `• ${exc}\n`;
      });
    } else {
      message += language === "id" ? `• Pengeluaran pribadi, makan di luar program, dan tipping guide.\n` : `• Personal expenses, meals outside itinerary, and tips.\n`;
    }

    return {
      success: true,
      message,
      recommendedPackages: [pkg],
      context: newContext,
      suggestedPrompts:
        language === "id"
          ? [`Berapa harga ${pkg.title}?`, `Itinerary ${pkg.title}`, "Cara booking paket ini"]
          : [`How much is ${pkg.title}?`, `Itinerary for ${pkg.title}`, "How to book this tour"],
    };
  }

  // 9. PACKAGE ITINERARY
  if (intent === "PACKAGE_ITINERARY") {
    const targetId = entities.packageIds[0] || previousContext.lastPackageId;
    const pkg = getPackage(targetId) || livePackages[0];

    if (!pkg) {
      const message =
        language === "id"
          ? `Jadwal perjalanan paket tersebut belum tersedia di sistem kami. Silakan hubungi koordinator kami di +${adminPhone}.`
          : `The itinerary for this package is not currently available. Please contact our coordinator at +${adminPhone}.`;
      return { success: true, message, context: newContext };
    }

    newContext.lastPackageId = pkg.id;
    newContext.lastPackageName = pkg.title;

    let message =
      language === "id"
        ? `Berikut jadwal perjalanan (itinerary) untuk **[${pkg.title}](/packages/${pkg.id})** (${pkg.duration}):\n\n`
        : `Here is the official travel itinerary for **[${pkg.title}](/packages/${pkg.id})** (${pkg.duration}):\n\n`;

    if (pkg.itinerary && pkg.itinerary.length > 0) {
      pkg.itinerary.forEach((item) => {
        message += `📍 **${item.day}: ${item.title}**\n${item.desc}\n\n`;
      });
    } else {
      message +=
        language === "id"
          ? `• **00:00 WIB**: Penjemputan dari hotel di Banyuwangi menuju Paltuding Basecamp.\n` +
            `• **02:00 WIB**: Memulai pendakian (trekking 3 km) menuju puncak Kawah Ijen dengan pemandu berlisensi.\n` +
            `• **03:30 WIB**: Menyaksikan fenomena Blue Fire elektrik dan aktivitas penambang belerang tradisional.\n` +
            `• **05:30 WIB**: Menyaksikan matahari terbit spektakuler di bibir danau asam toska Kawah Ijen.\n` +
            `• **07:30 WIB**: Perjalanan turun kembali ke Paltuding dan antar pulang ke hotel/stasiun Banyuwangi.\n\n`
          : `• **00:00 AM**: Midnight pickup from your hotel/station in Banyuwangi to Paltuding Basecamp.\n` +
            `• **02:00 AM**: Begin the 3 km guided trek to the crater rim with our certified local guide.\n` +
            `• **03:30 AM**: Witness the rare electric Blue Fire phenomenon and traditional sulfur miners.\n` +
            `• **05:30 AM**: Enjoy the breathtaking sunrise over the turquoise acid crater lake.\n` +
            `• **07:30 AM**: Trek back down to Paltuding and return transfer to Banyuwangi.\n\n`;
    }

    message +=
      language === "id"
        ? `Anda dapat melihat detail lengkapnya di [Halaman Paket](/packages/${pkg.id}).`
        : `You can view the full details on the [Package Page](/packages/${pkg.id}).`;

    return {
      success: true,
      message,
      recommendedPackages: [pkg],
      context: newContext,
      suggestedPrompts:
        language === "id"
          ? [`Berapa harga ${pkg.title}?`, `Fasilitas yang didapat`, "Cara booking paket ini"]
          : [`How much is ${pkg.title}?`, `Facilities included`, "How to book this tour"],
    };
  }

  // 10. PACKAGE COMPARISON
  if (intent === "PACKAGE_COMPARISON") {
    let pkgsToCompare: LivePackage[] = [];

    if (entities.packageIds.length >= 2) {
      pkgsToCompare = entities.packageIds
        .map((id) => getPackage(id))
        .filter((p): p is LivePackage => !!p);
    }

    if (pkgsToCompare.length < 2) {
      // Pick first 2 available packages
      pkgsToCompare = livePackages.slice(0, 2);
    }

    let message =
      language === "id"
        ? `Berikut perbandingan antara **${pkgsToCompare[0].title}** dan **${pkgsToCompare[1].title}**:\n\n`
        : `Here is a side-by-side comparison between **${pkgsToCompare[0].title}** and **${pkgsToCompare[1].title}**:\n\n`;

    pkgsToCompare.forEach((pkg, idx) => {
      message += `### ${idx + 1}. [${pkg.title}](/packages/${pkg.id})\n`;
      message += `• **Harga**: ${pkg.price} / orang\n`;
      message += `• **Durasi**: ${pkg.duration}\n`;
      message += `• **Tingkat Kesulitan**: ${pkg.difficulty}\n`;
      message += `• **Kategori**: ${pkg.category}\n`;
      message += `• **Titik Kumpul**: ${pkg.meetingPoint || "Banyuwangi"}\n\n`;
    });

    message +=
      language === "id"
        ? `Gunakan tombol perbandingan di bawah untuk melihat rincian tabel perbandingan lengkap!`
        : `Click the comparison button below to inspect the full side-by-side feature matrix!`;

    return {
      success: true,
      message,
      comparisonPackages: pkgsToCompare,
      recommendedPackages: pkgsToCompare,
      context: newContext,
      suggestedPrompts:
        language === "id"
          ? [`Pesan ${pkgsToCompare[0].title}`, `Pesan ${pkgsToCompare[1].title}`, "Rekomendasi paket lain"]
          : [`Book ${pkgsToCompare[0].title}`, `Book ${pkgsToCompare[1].title}`, "Find tour within budget"],
    };
  }

  // 11. PACKAGE RECOMMENDATIONS (Budget / Duration / Destination)
  if (intent === "PACKAGE_RECOMMENDATION") {
    const maxBudget = entities.maxBudget;
    const durationDays = entities.durationDays;
    const destSlug = entities.destinationSlugs[0];

    // Filter active packages deterministically
    let filtered = [...livePackages];

    // Strictly enforce budget if provided
    if (maxBudget && maxBudget > 0) {
      filtered = filtered.filter((p) => p.basePrice <= maxBudget);
    }

    // Filter duration
    if (durationDays && durationDays > 0) {
      filtered = filtered.filter((p) => p.durationDays === durationDays);
    }

    // Filter destination
    if (destSlug) {
      filtered = filtered.filter((p) => {
        const text = `${p.title} ${p.slug} ${p.highlights.join(" ")}`.toLowerCase();
        return text.includes(destSlug.replace("-", " "));
      });
    }

    // If budget specified and NO package matches
    if (maxBudget && filtered.length === 0) {
      const minPricePkg = [...livePackages].sort((a, b) => a.basePrice - b.basePrice)[0];
      const minPriceStr = minPricePkg ? minPricePkg.price : "Rp 650.000";

      const message =
        language === "id"
          ? `Belum ada paket wisata resmi yang sesuai dengan budget maksimal **IDR ${maxBudget.toLocaleString("id-ID")}** per orang.\n\n` +
            `Paket wisata kami yang paling terjangkau adalah **[${minPricePkg?.title || "Kawah Wurung & Djawatan"}](${minPricePkg ? `/packages/${minPricePkg.id}` : "/packages"})** seharga **${minPriceStr}**.\n\n` +
            `Anda juga dapat merancang perjalanan dengan menyesuaikan transportasi dan fasilitas melalui [Custom Trip Builder](/custom-package) atau [konsultasi WhatsApp (+${adminPhone})](${getWhatsAppLink(WhatsAppTemplates.generalInquiry("Budget Consultation"))}).`
          : `No standard tour package is currently listed under **IDR ${maxBudget.toLocaleString("id-ID")}** per person.\n\n` +
            `Our most affordable tour package is **[${minPricePkg?.title || "Kawah Wurung & Djawatan"}](${minPricePkg ? `/packages/${minPricePkg.id}` : "/packages"})** starting from **${minPriceStr}**.\n\n` +
            `You can also tailor your own trip using our interactive [Custom Trip Builder](/custom-package) or [chat with our coordinators on WhatsApp (+${adminPhone})](${getWhatsAppLink(WhatsAppTemplates.generalInquiry("Budget Consultation"))}).`;

      return {
        success: true,
        message,
        recommendedPackages: minPricePkg ? [minPricePkg] : [],
        context: newContext,
        suggestedPrompts:
          language === "id"
            ? ["Lihat semua paket wisata", "Custom Trip Builder", "Hubungi admin WhatsApp"]
            : ["View all tour packages", "Custom Trip Builder", "Contact WhatsApp support"],
      };
    }

    // Limit to max 3 recommendations
    const topResults = filtered.slice(0, 3);

    let message = "";
    if (language === "id") {
      message = maxBudget
        ? `Berikut adalah rekomendasi paket wisata sesuai budget Anda (di bawah **IDR ${maxBudget.toLocaleString("id-ID")}**):\n\n`
        : `Berikut adalah rekomendasi paket wisata terbaik dari Ijen Tour:\n\n`;

      topResults.forEach((pkg, idx) => {
        message += `${idx + 1}. **[${pkg.title}](/packages/${pkg.id})**\n`;
        message += `   • **Harga**: ${pkg.price} / orang\n`;
        message += `   • **Durasi**: ${pkg.duration}\n`;
        message += `   • **Tingkat Kesulitan**: ${pkg.difficulty}\n\n`;
      });

      message += `Klik salah satu paket di atas atau tombol di bawah untuk melihat detail lengkap dan memesan.`;
    } else {
      message = maxBudget
        ? `Here are our recommended tour packages matching your stated budget (under **IDR ${maxBudget.toLocaleString("id-ID")}**):\n\n`
        : `Here are our top recommended tour packages for your journey:\n\n`;

      topResults.forEach((pkg, idx) => {
        message += `${idx + 1}. **[${pkg.title}](/packages/${pkg.id})**\n`;
        message += `   • **Price**: ${pkg.price} / person\n`;
        message += `   • **Duration**: ${pkg.duration}\n`;
        message += `   • **Difficulty**: ${pkg.difficulty}\n\n`;
      });

      message += `You can click any package card below to view itineraries or complete your booking!`;
    }

    return {
      success: true,
      message,
      recommendedPackages: topResults,
      context: newContext,
      suggestedPrompts: topResults.map((p) => p.title),
    };
  }

  // 12. DESTINATION INFO
  if (intent === "DESTINATION_INFO") {
    const slug = entities.destinationSlugs[0];
    const destination = liveDestinations.find((d) => d.slug === slug) || liveDestinations[0];

    if (!destination) {
      const message =
        language === "id"
          ? `Informasi destinasi tersebut belum tersedia di database kami. Silakan hubungi admin kami untuk rekomendasi destinasi Banyuwangi.`
          : `Information about this destination is not currently available in our system. Please contact our team for destination advice.`;
      return { success: true, message, context: newContext };
    }

    // Find packages that match this destination
    const matchingPackages = livePackages.filter((p) => {
      const text = `${p.title} ${p.highlights.join(" ")} ${p.slug}`.toLowerCase();
      return text.includes(destination.name.toLowerCase()) || text.includes(destination.slug.replace("-", " "));
    });

    let message =
      language === "id"
        ? `### 📍 **${destination.name}**\n\n` +
          `${destination.description}\n\n` +
          (destination.tag ? `• **Kategori**: ${destination.tag}\n\n` : "")
        : `### 📍 **${destination.name}**\n\n` +
          `${destination.description}\n\n` +
          (destination.tag ? `• **Category**: ${destination.tag}\n\n` : "");

    if (matchingPackages.length > 0) {
      message +=
        language === "id"
          ? `Paket wisata kami yang mengunjungi **${destination.name}**:\n`
          : `Tour packages that include **${destination.name}**:\n`;

      matchingPackages.slice(0, 3).forEach((pkg) => {
        message += `• **[${pkg.title}](/packages/${pkg.id})** — ${pkg.price} (${pkg.duration})\n`;
      });
    }

    return {
      success: true,
      message,
      recommendedPackages: matchingPackages.slice(0, 3),
      context: newContext,
      suggestedPrompts: matchingPackages.slice(0, 3).map((p) => p.title),
    };
  }

  // 13. CUSTOM TRIP INFO
  if (intent === "CUSTOM_TRIP_INFO") {
    const message =
      language === "id"
        ? `### 🧭 **Layanan Custom Trip — Ijen Tour**\n\n` +
          `Kami menyediakan layanan **Custom Trip** fleksibel untuk Anda yang ingin menyusun jadwal, destinasi, dan fasilitas sendiri:\n\n` +
          `• 📍 **Pilihan Destinasi**: Kawah Ijen (Blue Fire), Taman Nasional Baluran, De Djawatan, Kawah Wurung, dan Red Island.\n` +
          `• 🚗 **Transportasi**: Pilihan kendaraan MPV standar, Toyota HiAce (grup besar), atau 4WD Jeep.\n` +
          `• 🧭 **Pemandu & Porter**: Pemandu lokal berlisensi dan porter resmi.\n` +
          `• 🎒 **Add-on Tambahan**: Sewa masker gas respirator, senter kepala, hingga troli kawah (trolley taxi).\n\n` +
          `Kunjungi [Custom Trip Builder](/custom-package) untuk merancang rencana perjalanan Anda atau [hubungi tim kami via WhatsApp](${getWhatsAppLink(WhatsAppTemplates.customTourRequest())})!`
        : `### 🧭 **Custom Trip Services — Ijen Tour**\n\n` +
          `We offer flexible **Custom Private Trips** allowing you to design your own itinerary, destinations, and logistics:\n\n` +
          `• 📍 **Select Destinations**: Mount Ijen (Blue Fire), Baluran National Park, De Djawatan Forest, Kawah Wurung, and Red Island.\n` +
          `• 🚗 **Private Transport**: Comfortable MPVs, Toyota HiAce for groups, or 4WD Jeeps.\n` +
          `• 🧭 **Guides & Porters**: Certified English-speaking guides and licensed porters.\n` +
          `• 🎒 **Gear & Add-ons**: Respirator gas masks, headlamps, warm jackets, and trolley taxis.\n\n` +
          `Visit our interactive [Custom Trip Builder](/custom-package) to build your plan, or [consult via WhatsApp](${getWhatsAppLink(WhatsAppTemplates.customTourRequest())})!`;

    return {
      success: true,
      message,
      customTrip: {
        isCustomTrip: true,
        targetUrl: "/custom-package",
        formattedSummary: "Custom trip builder available on /custom-package",
      },
      context: newContext,
      suggestedPrompts:
        language === "id"
          ? ["Buka Custom Trip Builder", "Daftar paket reguler", "Hubungi admin WhatsApp"]
          : ["Open Custom Trip Builder", "View regular packages", "Chat on WhatsApp"],
    };
  }

  // 14. BOOKING PROCEDURE
  if (intent === "BOOKING_PROCEDURE") {
    const message =
      language === "id"
        ? `### 📋 **Cara Melakukan Pemesanan (Booking) di Ijen Tour**:\n\n` +
          `1. **Pilih Paket**: Buka halaman [Daftar Paket](/packages) dan pilih tour yang sesuai kebutuhan Anda.\n` +
          `2. **Tentukan Tanggal & Peserta**: Klik tombol **'Book This Tour'** pada paket yang dipilih, lalu tentukan tanggal keberangkatan dan jumlah peserta.\n` +
          `3. **Lengkapi Data**: Masukkan nama lengkap, nomor WhatsApp aktif, dan lokasi penjemputan di area Banyuwangi.\n` +
          `4. **Dapatkan Kode Booking**: Anda akan menerima kode reservasi resmi sistem (misal: *IJN-2026xxxx*).\n` +
          `5. **Konfirmasi WhatsApp**: Koordinator kami akan menghubungi via WhatsApp untuk konfirmasi kuota pendakian dan petunjuk pembayaran resmi.\n\n` +
          `Butuh bantuan pemesanan segera? [Hubungi Koordinator WhatsApp (+${adminPhone})](${getWhatsAppLink(WhatsAppTemplates.generalInquiry("Booking Assistance"))}).`
        : `### 📋 **How to Book a Tour with Ijen Tour**:\n\n` +
          `1. **Select a Package**: Browse our verified [Tour Packages](/packages) and select the experience you want.\n` +
          `2. **Choose Date & Group Size**: Click **'Book This Tour'**, select your departure date, and specify the number of travelers.\n` +
          `3. **Fill Reservation Details**: Enter your name, WhatsApp number, and hotel pickup location in Banyuwangi.\n` +
          `4. **Receive Booking Code**: You will receive an official booking code (e.g. *IJN-2026xxxx*).\n` +
          `5. **WhatsApp Confirmation**: Our coordinator will connect with you on WhatsApp to confirm climbing permits and payment details.\n\n` +
          `Need assistance booking? [Contact our WhatsApp coordinator (+${adminPhone})](${getWhatsAppLink(WhatsAppTemplates.generalInquiry("Booking Assistance"))}).`;

    return {
      success: true,
      message,
      recommendedPackages: livePackages.slice(0, 3),
      context: newContext,
      suggestedPrompts:
        language === "id"
          ? ["Lihat daftar paket wisata", "Metode pembayaran", "Hubungi admin WhatsApp"]
          : ["View tour packages", "Payment methods", "Contact WhatsApp support"],
    };
  }

  // 15. POLICIES INFO (Payment, Cancellation, Refund)
  if (intent === "POLICIES_INFO") {
    const message =
      language === "id"
        ? `### 💳 **Kebijakan Pembayaran & Pembatalan Ijen Tour**:\n\n` +
          `• 🏦 **Metode Pembayaran**: Pembayaran dapat dilakukan via transfer Bank (BCA, Mandiri, BRI) atau metode resmi yang diberikan koordinator saat konfirmasi.\n` +
          `• 🔄 **Kebijakan Pembatalan / Reschedule**: Pengajuan perubahan tanggal (reschedule) dapat dilakukan maksimal H-2 keberangkatan tanpa biaya tambahan (menyesuaikan kuota pendakian BKSDA).\n` +
          `• ⚠️ **Faktor Alam / Penutupan Kawah**: Jika jalur pendakian ditutup resmi oleh otoritas PVMBG/BKSDA karena peningkatan aktivitas vulkanik atau bencana alam, opsi reschedule 100% atau refund sesuai ketentuan akan diberikan.\n\n` +
          `Untuk konfirmasi pembayaran atau pertanyaan kebijakan khusus, silakan [hubungi tim resmi kami](${getWhatsAppLink(WhatsAppTemplates.generalInquiry("Payment and Policy Questions"))}).`
        : `### 💳 **Payment & Cancellation Policies — Ijen Tour**:\n\n` +
          `• 🏦 **Payment Methods**: Bank transfer (BCA, Mandiri, BRI) or verified payment links provided by our coordinator upon confirmation.\n` +
          `• 🔄 **Reschedule & Cancellation**: Free date rescheduling up to 48 hours before departure, subject to BKSDA climbing permit availability.\n` +
          `• ⚠️ **Force Majeure / Volcanic Closures**: If Mount Ijen is officially closed by PVMBG/BKSDA authorities due to volcanic alerts or extreme weather, you will be offered a 100% free reschedule or refund per official terms.\n\n` +
          `For invoice or policy confirmation, please [contact our official coordinator](${getWhatsAppLink(WhatsAppTemplates.generalInquiry("Payment and Policy Questions"))}).`;

    return {
      success: true,
      message,
      context: newContext,
      suggestedPrompts:
        language === "id"
          ? ["Cara booking paket", "Daftar paket wisata", "Hubungi admin WhatsApp"]
          : ["How to book a tour", "View tour packages", "Chat on WhatsApp"],
    };
  }

  // 16. SCHEDULE AVAILABILITY
  if (intent === "SCHEDULE_AVAILABILITY") {
    // Gather packages with active open schedules
    const scheduledPkgs = livePackages.filter((p) => p.schedules && p.schedules.length > 0);

    let message = "";
    if (scheduledPkgs.length === 0) {
      message =
        language === "id"
          ? `Jadwal keberangkatan reguler dibuka setiap hari sepanjang tahun (open daily). Untuk konfirmasi ketersediaan tanggal spesifik, silakan [hubungi koordinator kami di WhatsApp (+${adminPhone})](${getWhatsAppLink(WhatsAppTemplates.generalInquiry("Schedule Availability"))}).`
          : `Regular departures run daily throughout the year. To verify available climbing slots for your specific dates, please [contact our coordinator on WhatsApp (+${adminPhone})](${getWhatsAppLink(WhatsAppTemplates.generalInquiry("Schedule Availability"))}).`;
    } else {
      message =
        language === "id"
          ? `Berikut jadwal keberangkatan terdekat yang tercatat di database kami:\n\n`
          : `Here are the upcoming open departure dates recorded in our database:\n\n`;

      scheduledPkgs.slice(0, 3).forEach((pkg) => {
        message += `• **[${pkg.title}](/packages/${pkg.id})**:\n`;
        pkg.schedules.slice(0, 2).forEach((sch) => {
          message +=
            language === "id"
              ? `  - Tanggal: **${sch.departureDate}** (${sch.availableSlots} slot tersisa)\n`
              : `  - Date: **${sch.departureDate}** (${sch.availableSlots} slot(s) remaining)\n`;
        });
        message += `\n`;
      });

      message +=
        language === "id"
          ? `Paket private trip juga dapat diberangkatkan pada tanggal pilihan Anda.`
          : `Private tours can also be scheduled on your custom preferred dates.`;
    }

    return {
      success: true,
      message,
      recommendedPackages: scheduledPkgs.slice(0, 3),
      context: newContext,
      suggestedPrompts:
        language === "id"
          ? ["Cara booking paket", "Daftar harga paket", "Hubungi admin WhatsApp"]
          : ["How to book a tour", "Check tour prices", "Chat on WhatsApp"],
    };
  }

  // 17. FAQ QUESTION (Matched from database)
  if (intent === "FAQ_QUESTION" && matchedFaq) {
    let message = `### ❓ ${matchedFaq.question}\n\n${matchedFaq.answer}\n\n`;

    message +=
      language === "id"
        ? `Informasi di atas diambil langsung dari panduan resmi Ijen Tour. Ada yang ingin Anda tanyakan lebih lanjut?`
        : `This information is sourced directly from the official Ijen Tour guide. Would you like to know anything else?`;

    return {
      success: true,
      message,
      context: newContext,
      suggestedPrompts:
        language === "id"
          ? ["Lihat daftar paket wisata", "Berapa harga paket Blue Fire?", "Hubungi admin WhatsApp"]
          : ["View all tour packages", "How much is Blue Fire tour?", "Contact WhatsApp support"],
    };
  }

  // Fallback if unexpected intent
  const fallbackMessage =
    language === "id"
      ? `Informasi spesifik tersebut belum tersedia di sistem kami saat ini. Silakan [hubungi tim resmi kami via WhatsApp (+${adminPhone})](${getWhatsAppLink(WhatsAppTemplates.generalInquiry("General Tour Assistance"))}) untuk bantuan langsung.`
      : `That specific information is not currently available in our system. Please [contact our official team on WhatsApp (+${adminPhone})](${getWhatsAppLink(WhatsAppTemplates.generalInquiry("General Tour Assistance"))}) for immediate assistance.`;

  return {
    success: true,
    message: fallbackMessage,
    context: newContext,
  };
}
