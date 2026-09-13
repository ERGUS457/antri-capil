import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
})

export async function sendBookingEmail(to: string, data: { nomor: number; layanan: string; tanggal: string; id: string }) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/tiket/${data.id}`
  
  const mailOptions = {
    from: `"Antri Capil" <${process.env.GMAIL_USER}>`,
    to,
    subject: `Tiket Antrean Disdukcapil - ${data.layanan}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #2563eb;">Tiket Antrean Online</h2>
        <p>Halo, booking antrean Anda berhasil.</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Layanan:</strong> ${data.layanan}</p>
          <p style="margin: 5px 0;"><strong>Nomor Antrean:</strong> <span style="font-size: 24px; color: #2563eb;">${data.nomor}</span></p>
          <p style="margin: 5px 0;"><strong>Tanggal:</strong> ${data.tanggal}</p>
        </div>
        <p>Silakan tunjukkan tiket digital Anda saat datang ke kantor Disdukcapil.</p>
        <a href="${url}" style="display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Lihat Tiket Digital</a>
      </div>
    `,
  }

  return transporter.sendMail(mailOptions)
}
