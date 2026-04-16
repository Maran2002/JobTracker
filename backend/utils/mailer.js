import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

/**
 * Send an OTP email to the given address.
 * @param {string} to    - recipient email
 * @param {string} otp   - plaintext OTP (6 digits)
 * @param {string} purpose - human-readable purpose label
 */
export async function sendOtpEmail(to, otp, purpose = 'your request') {
    await transporter.sendMail({
        from: `"CareerTrack" <${process.env.MAIL_USER}>`,
        to,
        subject: `CareerTrack — Your verification code`,
        html: `
        <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:16px;">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="font-size:28px;font-weight:900;color:#4f46e5;letter-spacing:-0.5px;">CareerTrack</div>
            <div style="font-size:13px;color:#94a3b8;margin-top:4px;text-transform:uppercase;letter-spacing:0.1em;">Verification Code</div>
          </div>
          <div style="background:#fff;border-radius:12px;padding:28px;border:1px solid #e2e8f0;">
            <p style="margin:0 0 16px;font-size:15px;color:#334155;">
              You requested a verification code for <strong>${purpose}</strong>. Use the code below — it expires in <strong>10 minutes</strong>.
            </p>
            <div style="text-align:center;margin:24px 0;">
              <span style="font-size:40px;font-weight:900;letter-spacing:12px;color:#4f46e5;padding:16px 24px;background:#f1f5f9;border-radius:12px;display:inline-block;">
                ${otp}
              </span>
            </div>
            <p style="margin:16px 0 0;font-size:13px;color:#94a3b8;">
              If you didn't request this, you can safely ignore this email. Never share this code with anyone.
            </p>
          </div>
          <p style="text-align:center;font-size:12px;color:#cbd5e1;margin-top:20px;">
            © ${new Date().getFullYear()} CareerTrack — Premium Job Tracking
          </p>
        </div>
        `,
    });
}

export default transporter;
