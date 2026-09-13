import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function sendBookingEmail(to: string, data: { nomor: number; layanan: string; tanggal: string; id: string }) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/tiket/${data.id}`
  const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;border:1px solid #eee;padding:20px;border-radius:10px;">
        <h2 style="color:#2563eb;">Tiket Antrean Online — Disdukcapil Sambas</h2>
        <p>Halo, booking antrean Anda berhasil.</p>
        <div style="background:#f3f4f6;padding:15px;border-radius:8px;margin:20px 0;">
          <p style="margin:5px 0;"><strong>Layanan:</strong> ${data.layanan}</p>
          <p style="margin:5px 0;"><strong>Nomor Antrean:</strong> <span style="font-size:24px;color:#2563eb;font-weight:900;">${String(data.nomor).padStart(3,'0')}</span></p>
          <p style="margin:5px 0;"><strong>Tanggal:</strong> ${data.tanggal}</p>
        </div>
        <p>Silakan tunjukkan tiket digital saat datang ke kantor Disdukcapil.</p>
        <a href="${url}" style="display:inline-block;background:#2563eb;color:white;padding:12px 22px;text-decoration:none;border-radius:999px;margin-top:12px;font-weight:700;">Lihat Tiket Digital →</a>
        <p style="margin-top:16px;font-size:12px;color:#6b7280;">Jika tombol tidak bisa diklik, salin link: ${url}</p>
      </div>`

  // Prefer Resend
  if (resend) {
    try {
      const from = process.env.RESEND_FROM || 'ANTRI-CAPIL <onboarding@resend.dev>'
      const result = await resend.emails.send({
        from,
        to,
        subject: `Tiket Antrean Disdukcapil - ${data.layanan} [${String(data.nomor).padStart(3,'0')}]`,
        html,
      })
      console.log('[email:resend] sent', result)
      return result
    } catch (e) {
      console.error('[email:resend] failed', e)
      throw e
    }
  }

  // Fallback: nodemailer (jika RESEND_API_KEY belum diisi)
  console.warn('[email] RESEND_API_KEY belum diisi — fallback nodemailer (mungkin gagal jika GMAIL_PASS placeholder)')
  const nodemailer = await import('nodemailer')
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
  } as any)
  return transporter.sendMail({
    from: `"ANTRI-CAPIL" <${process.env.GMAIL_USER}>`,
    to,
    subject: `Tiket Antrean Disdukcapil - ${data.layanan}`,
    html,
  })
}
