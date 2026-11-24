import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));

export async function sendOtpEmail(to, otp, purpose = 'your request') {
    const senderName = (process.env.MAIL_FROM_NAME || 'ApplyLog Career Team').replace(/[\r\n"<>]/g, '').trim();
    const safePurpose = escapeHtml(purpose);
    const safeOtp = escapeHtml(otp);
    const year = new Date().getFullYear();
    const subject = `Your ApplyLog verification code`;

    await transporter.sendMail({
        from: { name: senderName, address: process.env.MAIL_USER },
        to,
        subject,
        text: `Your verification code for ${purpose} is ${otp}. It expires in 10 minutes. If you did not request this, you can ignore this email.`,
        html: `
        <!doctype html>
        <html lang="en">
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
          <body style="margin:0;padding:24px 12px;background:#f3f2ea;font-family:Arial,Helvetica,sans-serif;color:#24322c;">
            <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Your ApplyLog verification code is ready. It expires in 10 minutes.</div>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#fffefa;border:1px solid #d9ded2;border-radius:18px;overflow:hidden;">
              <tr><td style="padding:28px 30px;background:#1d342e;">
                <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#c3d4c5;">CareerTrack · ApplyLog</div>
                <div style="margin-top:9px;font-size:25px;line-height:1.2;font-weight:700;color:#fffefa;">A secure step for your search</div>
              </td></tr>
              <tr><td style="padding:30px;">
                <p style="margin:0 0 12px;font-size:15px;line-height:1.65;color:#55645b;">Use this code to continue with <strong style="color:#24322c;">${safePurpose}</strong>.</p>
                <div style="margin:22px 0;padding:19px 12px;border:1px solid #d9ded2;border-radius:13px;background:#f3f2ea;text-align:center;">
                  <span style="font-family:Arial,Helvetica,sans-serif;font-size:34px;font-weight:700;letter-spacing:9px;color:#2f6b5e;">${safeOtp}</span>
                </div>
                <p style="margin:0;font-size:13px;line-height:1.6;color:#7c8a80;">This code expires in <strong>10 minutes</strong>. For your security, don’t share it with anyone.</p>
                <div style="height:1px;margin:24px 0;background:#e8e9de;"></div>
                <p style="margin:0;font-size:12px;line-height:1.6;color:#7c8a80;">If you didn’t request this code, you can ignore this message. Your account remains secure.</p>
              </td></tr>
              <tr><td style="padding:0 30px 25px;text-align:center;font-size:11px;line-height:1.5;color:#8a958c;">© ${year} ApplyLog · Thoughtful tools for your next career move</td></tr>
            </table>
          </body>
        </html>`,
    });
}

export default transporter;
