// ============================================================
// VIVOKID — Email Service
// Pattern: peps-v2-pwa → SMTP Infomaniak prioritaire + Resend fallback
// SMTP: contact@vivokid.ch via mail.infomaniak.com:465
// ============================================================
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.infomaniak.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE !== 'false',
  auth: {
    user: process.env.SMTP_USER || 'contact@vivokid.ch',
    pass: process.env.SMTP_PASS,
  },
  pool: true,
  maxConnections: 5,
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(opts: EmailOptions): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'VIVOkid'}" <${process.env.EMAIL_FROM || 'contact@vivokid.ch'}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text || opts.html.replace(/<[^>]+>/g, ''),
    });
    return true;
  } catch (err) {
    console.error('[email] SMTP Infomaniak failed, trying Resend fallback:', err);
    return sendViaResend(opts);
  }
}

async function sendViaResend(opts: EmailOptions): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) return false;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: `VIVOkid <contact@vivokid.ch>`, to: opts.to, subject: opts.subject, html: opts.html }),
    });
    return res.ok;
  } catch { return false; }
}

// ── Email templates ────────────────────────────────────────────

export function welcomeParentEmail(parentName: string, childName: string, pinCode: string) {
  return {
    subject: `Bienvenue sur VIVOkid ! Voici le code de ${childName}`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#0891b2,#0284c7);padding:32px 40px;text-align:center;">
          <div style="font-size:36px;margin-bottom:8px;">🛡️</div>
          <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:900;letter-spacing:-0.5px;">VIVOkid</h1>
          <p style="margin:4px 0 0;color:#bae6fd;font-size:14px;">La famille, connectée avec confiance</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 8px;color:#0f172a;font-size:22px;">Bonjour ${parentName} 👋</h2>
          <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 24px;">
            Votre espace VIVOkid est prêt. Voici le code de connexion pour <strong>${childName}</strong>.
          </p>

          <!-- PIN Code -->
          <div style="background:#f0fdf4;border:2px solid #22c55e;border-radius:16px;padding:24px;text-align:center;margin:0 0 24px;">
            <p style="margin:0 0 8px;color:#15803d;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Code de ${childName}</p>
            <div style="font-size:42px;font-weight:900;color:#15803d;letter-spacing:8px;">${pinCode}</div>
            <p style="margin:8px 0 0;color:#475569;font-size:12px;">À entrer sur l'app VIVOkid — à conserver précieusement</p>
          </div>

          <!-- Steps -->
          <div style="margin:0 0 24px;">
            <p style="color:#0f172a;font-weight:700;font-size:15px;margin:0 0 12px;">Pour commencer :</p>
            ${['Installez VIVOkid sur votre téléphone depuis vivokid.ch', `Donnez ce code à ${childName} pour qu'il/elle installe l'app enfant`, 'Créez votre premier Pacte Familial ensemble ✨'].map((s, i) => `
            <div style="display:flex;align-items:flex-start;margin-bottom:10px;">
              <div style="width:24px;height:24px;background:#0891b2;border-radius:50%;color:white;font-size:12px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;margin-right:12px;">${i+1}</div>
              <span style="color:#475569;font-size:14px;line-height:1.5;">${s}</span>
            </div>`).join('')}
          </div>

          <!-- CTA -->
          <div style="text-align:center;margin:32px 0 0;">
            <a href="https://vivokid.ch" style="background:#0891b2;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px;display:inline-block;">
              Ouvrir VIVOkid →
            </a>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="margin:0;color:#94a3b8;font-size:12px;">
            VIVOkid · vivokid.ch · contact@vivokid.ch<br>
            PEP's Swiss SA · Jura, Suisse 🇨🇭
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };
}

export function sosAlertEmail(parentName: string, childName: string, lat?: number, lng?: number) {
  const mapsLink = lat && lng ? `https://maps.google.com/?q=${lat},${lng}` : null;
  return {
    subject: `🆘 ALERTE SOS — ${childName} a besoin de vous`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:0;background:#fef2f2;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;border:3px solid #ef4444;">
        <tr><td style="background:#ef4444;padding:24px 40px;text-align:center;">
          <div style="font-size:48px;">🆘</div>
          <h1 style="margin:8px 0 0;color:#ffffff;font-size:24px;font-weight:900;">ALERTE SOS DISCRÈTE</h1>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <p style="color:#0f172a;font-size:18px;font-weight:700;margin:0 0 16px;">${parentName}, ${childName} a envoyé une alerte silencieuse.</p>
          <p style="color:#475569;font-size:15px;margin:0 0 24px;">Elle/Il a besoin de vous <strong>maintenant</strong>. Contactez-le/la immédiatement.</p>
          ${mapsLink ? `
          <div style="text-align:center;margin:0 0 24px;">
            <a href="${mapsLink}" style="background:#ef4444;color:white;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;">
              📍 Voir la position maintenant
            </a>
          </div>` : ''}
          <p style="color:#94a3b8;font-size:12px;text-align:center;">Alerte envoyée par VIVOkid · vivokid.ch</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };
}

export function lunaDigestEmail(parentName: string, observations: Array<{title: string; body: string; severity: string}>) {
  return {
    subject: `🤖 Luna — Rapport famille de ce soir`,
    html: `
<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#7c3aed,#6d28d9);padding:28px 40px;text-align:center;">
          <p style="margin:0;color:#ddd6fe;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">AGENT LUNA</p>
          <h1 style="margin:4px 0 0;color:#fff;font-size:22px;font-weight:900;">Rapport famille du soir</h1>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <p style="color:#475569;font-size:15px;margin:0 0 24px;">Bonsoir ${parentName},</p>
          ${observations.map(obs => `
          <div style="background:${obs.severity==='alert'?'#fef2f2':obs.severity==='attention'?'#fffbeb':'#f0fdf4'};border-left:4px solid ${obs.severity==='alert'?'#ef4444':obs.severity==='attention'?'#f59e0b':'#22c55e'};border-radius:12px;padding:16px;margin-bottom:12px;">
            <p style="margin:0 0 6px;font-weight:700;color:#0f172a;font-size:14px;">${obs.title}</p>
            <p style="margin:0;color:#475569;font-size:13px;line-height:1.5;">${obs.body}</p>
          </div>`).join('')}
          <p style="color:#94a3b8;font-size:12px;text-align:center;margin:24px 0 0;">Luna · Votre agent gardien VIVOkid 🛡️</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };
}
