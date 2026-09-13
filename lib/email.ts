import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function sendBookingEmail(to: string, data: { nomor: number; layananKode: string; layananNama: string; tanggal: string; qrCode: string }) {
  if (!to) {
    console.log('[Email] No recipient email provided, skipping email dispatch')
    return
  }

  if (!resend) {
    console.warn('[Resend] RESEND_API_KEY not configured, logging email instead:', { to, data })
    return
  }

  try {
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #2563eb; margin-top: 0;">Disdukcapil Kabupaten Sambas</h2>
        <p>Halo, terima kasih telah melakukan pendaftaran antrean online.</p>
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>Layanan:</strong> ${data.layananNama} (${data.layananKode})</p>
          <p style="margin: 4px 0;"><strong>Nomor Antrean:</strong> <span style="font-size: 20px; color: #2563eb; font-weight: bold;">${String(data.nomor).padStart(3, '0')}</span></p>
          <p style="margin: 4px 0;"><strong>Tanggal:</strong> ${data.tanggal}</p>
        </div>
        <p>Silakan tunjukkan QR Code berikut saat tiba di loket Disdukcapil:</p>
        <div style="text-align: center; margin: 20px 0;">
          <img src="${data.qrCode}" alt="QR Code Antrean" style="width: 200px; height: 200px; border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px;" />
        </div>
        <p style="font-size: 12px; color: #64748b; text-align: center;">Simpan email ini atau ambil tangkapan layar sebagai bukti antrean.</p>
      </div>
    `

    const response = await resend.emails.send({
      from: 'Disdukcapil Sambas <onboarding@resend.dev>',
      to,
      subject: `[ANTRI-CAPIL] Tiket Antrean ${data.layananKode} - No. ${String(data.nomor).padStart(3, '0')}`,
      html: htmlContent,
    })

    console.log('[Resend] Email sent successfully:', response)
  } catch (err) {
    console.error('[Resend] Failed to send email:', err)
  }
}
