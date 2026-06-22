const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = 'Hustl <onboarding@resend.dev>';

const emailBase = (content) => `
  <div style="background:#0C0C0C;padding:40px 0;min-height:100vh">
    <div style="font-family:'DM Sans',Arial,sans-serif;max-width:480px;margin:0 auto;background:#141414;border:1px solid #2A2A2A;border-radius:8px;overflow:hidden">
      <!-- Header -->
      <div style="padding:24px 32px;border-bottom:1px solid #2A2A2A;display:flex;align-items:center;gap:10px">
        <div style="width:28px;height:28px;background:#E8A030;border-radius:6px;display:inline-flex;align-items:center;justify-content:center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#0C0C0C">
            <rect x="3" y="2" width="4" height="20" rx="1"/>
            <rect x="17" y="2" width="4" height="20" rx="1"/>
            <polygon points="7,10.5 17,7 17,11 7,14.5"/>
          </svg>
        </div>
        <span style="font-size:15px;font-weight:500;color:#F4F4F5;letter-spacing:-0.01em">Hustl</span>
      </div>
      <!-- Body -->
      <div style="padding:32px">
        ${content}
      </div>
      <!-- Footer -->
      <div style="padding:20px 32px;border-top:1px solid #2A2A2A">
        <p style="margin:0;font-size:12px;color:#666672">You're receiving this because you signed up at Hustl. If this wasn't you, ignore this email.</p>
      </div>
    </div>
  </div>
`;

exports.sendVerificationEmail = async (to, name, token) => {
  const url = `${process.env.CLIENT_URL}/verify-email/${token}`;
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Verify your Hustl account',
    html: emailBase(`
      <h2 style="margin:0 0 8px;font-size:20px;font-weight:500;color:#F4F4F5">Welcome, ${name}!</h2>
      <p style="margin:0 0 28px;font-size:15px;color:#A1A1AA;line-height:1.6">Click the button below to verify your email address and activate your account. This link expires in 24 hours.</p>
      <a href="${url}" style="display:inline-block;background:#E8A030;color:#0C0C0C;text-decoration:none;padding:11px 28px;border-radius:5px;font-weight:500;font-size:14px">
        Verify email →
      </a>
      <p style="margin:24px 0 0;font-size:13px;color:#666672">Or copy this link:<br>
        <span style="color:#A1A1AA;word-break:break-all">${url}</span>
      </p>
    `),
  });
};

exports.sendWelcomeEmail = async (to, name) => {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Your Hustl account is ready',
    html: emailBase(`
      <h2 style="margin:0 0 8px;font-size:20px;font-weight:500;color:#F4F4F5">You're verified, ${name}!</h2>
      <p style="margin:0 0 28px;font-size:15px;color:#A1A1AA;line-height:1.6">Your account is now active. Start browsing jobs or post your first listing.</p>
      <a href="${process.env.CLIENT_URL}/jobs" style="display:inline-block;background:#E8A030;color:#0C0C0C;text-decoration:none;padding:11px 28px;border-radius:5px;font-weight:500;font-size:14px">
        Browse jobs →
      </a>
    `),
  });
};

exports.sendApplicationConfirmation = async (to, name, jobTitle, company) => {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Application received — ${jobTitle}`,
    html: emailBase(`
      <h2 style="margin:0 0 8px;font-size:20px;font-weight:500;color:#F4F4F5">Application submitted</h2>
      <p style="margin:0 0 20px;font-size:15px;color:#A1A1AA;line-height:1.6">Hi ${name}, your application for <strong style="color:#F4F4F5">${jobTitle}</strong> at <strong style="color:#F4F4F5">${company}</strong> has been received.</p>
      <p style="margin:0 0 28px;font-size:15px;color:#A1A1AA;line-height:1.6">You'll hear back if the employer decides to move forward. Track your applications from your dashboard.</p>
      <a href="${process.env.CLIENT_URL}/dashboard/candidate" style="display:inline-block;background:#E8A030;color:#0C0C0C;text-decoration:none;padding:11px 28px;border-radius:5px;font-weight:500;font-size:14px">
        View dashboard →
      </a>
    `),
  });
};

exports.sendStatusUpdateEmail = async (to, name, jobTitle, status) => {
  const statusLabel = {
    reviewed: 'Your application has been reviewed',
    interview: 'You\'ve been selected for an interview',
    hired: 'Congratulations — you\'ve been hired!',
    rejected: 'Application update',
  }[status] || 'Application update';

  await resend.emails.send({
    from: FROM,
    to,
    subject: `${statusLabel} — ${jobTitle}`,
    html: emailBase(`
      <h2 style="margin:0 0 8px;font-size:20px;font-weight:500;color:#F4F4F5">${statusLabel}</h2>
      <p style="margin:0 0 28px;font-size:15px;color:#A1A1AA;line-height:1.6">Hi ${name}, the status of your application for <strong style="color:#F4F4F5">${jobTitle}</strong> has been updated to <strong style="color:#F4F4F5">${status}</strong>.</p>
      <a href="${process.env.CLIENT_URL}/dashboard/candidate" style="display:inline-block;background:#E8A030;color:#0C0C0C;text-decoration:none;padding:11px 28px;border-radius:5px;font-weight:500;font-size:14px">
        View dashboard →
      </a>
    `),
  });
};
