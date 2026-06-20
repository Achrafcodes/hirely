const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = 'Hirely <onboarding@resend.dev>';

exports.sendVerificationEmail = async (to, name, token) => {
  const url = `${process.env.CLIENT_URL}/verify-email/${token}`;
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Verify your Hirely account',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="margin:0 0 8px">Welcome to Hirely, ${name}!</h2>
        <p style="color:#666;margin:0 0 24px">Click the button below to verify your email address. This link expires in 24 hours.</p>
        <a href="${url}" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:12px 28px;border-radius:999px;font-weight:600">
          Verify email
        </a>
        <p style="color:#999;font-size:13px;margin-top:24px">If you didn't create an account, you can ignore this email.</p>
      </div>
    `,
  });
};
