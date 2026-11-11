/**
 * Shared responsive email container and branding wrapper for Mount Ijen Tour.
 * Accent color: Warm Amber/Gold (#D97706 / #F59E0B) matching the website identity.
 */
export function emailLayout(options: {
  title: string;
  previewText: string;
  contentHtml: string;
  badge?: string;
  badgeColor?: string;
}): string {
  const { title, previewText, contentHtml, badge = "Official Notification", badgeColor = "#D97706" } = options;
  const currentYear = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0F172A;
      -webkit-font-smoothing: antialiased;
    }
    table { border-collapse: collapse; }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid #E2E8F0;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
    }
    .header {
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
      padding: 32px 32px 28px 32px;
      text-align: left;
    }
    .brand-title {
      color: #FFFFFF;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin: 0;
      text-transform: uppercase;
    }
    .brand-sub {
      color: #F59E0B;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-top: 4px;
    }
    .badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 9999px;
      margin-top: 14px;
      background-color: rgba(245, 158, 11, 0.15);
      color: #F59E0B;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .body-content {
      padding: 36px 32px 28px 32px;
      line-height: 1.6;
      font-size: 15px;
      color: #334155;
    }
    .cta-button {
      display: inline-block;
      background-color: #D97706;
      color: #FFFFFF !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      padding: 12px 28px;
      border-radius: 8px;
      margin: 20px 0;
      text-align: center;
    }
    .info-card {
      background-color: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 18px;
      margin: 20px 0;
    }
    .footer {
      background-color: #F1F5F9;
      padding: 24px 32px;
      text-align: center;
      font-size: 12px;
      color: #64748B;
      border-top: 1px solid #E2E8F0;
      line-height: 1.5;
    }
    .footer a {
      color: #D97706;
      text-decoration: none;
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #F8FAFC;">
  <!-- Preheader preview text for email clients -->
  <div style="display: none; font-size: 1px; color: #F8FAFC; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${previewText}
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <div class="email-container">
          <!-- Header -->
          <div class="header">
            <div class="brand-title">Mount Ijen Tour</div>
            <div class="brand-sub">Banyuwangi • East Java • Indonesia</div>
            <div class="badge" style="background-color: ${badgeColor}22; color: ${badgeColor}; border-color: ${badgeColor}44;">
              ${badge}
            </div>
          </div>

          <!-- Content -->
          <div class="body-content">
            ${contentHtml}
          </div>

          <!-- Footer -->
          <div class="footer">
            <p style="margin: 0 0 8px 0; font-weight: 600; color: #475569;">Mount Ijen Tour Expedition Management</p>
            <p style="margin: 0 0 8px 0;">Banyuwangi, East Java, Indonesia • WhatsApp: +62 821-4289-9803</p>
            <p style="margin: 0; color: #94A3B8;">&copy; ${currentYear} Mount Ijen Tour. All rights reserved.</p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

