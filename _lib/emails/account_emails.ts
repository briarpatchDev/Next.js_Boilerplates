const email_styles = {
  body: "font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;",
  headline: "color: #5b5b83ff; margin-bottom: 12px; text-align: center;",
  paragraph:
    "font-size: 16px; line-height: 1.4; width: 80%; text-align: center; margin: 12px auto;",
  button:
    "display: inline-block; width: 80%; font-size: 16px; width: 80%; background: #434360; color: rgb(240, 240, 240); padding: 12px 24px; text-decoration: none; border-radius: 16px; font-weight: bold;",
  footnote: "font-size: 14px; color: #7d7d7dff; text-align: center;",
};

export const verification_email = (verificationCode: string) => {
  return `
    <div style="${email_styles.body}">
      <h2 style="${email_styles.headline}">
        Welcome to Website!
      </h2>

      <p style="${email_styles.paragraph}">
        Your account is ready. Click the button below to verify your email
        and complete your registration.
      </p>

      <div style="text-align: center; margin: 16px 0 20px;">
        <a
          href="${process.env.NEXT_PUBLIC_PROTOCOL}${process.env.NEXT_PUBLIC_DOMAIN}/verify/${verificationCode}"
          style="${email_styles.button}"
        >
          Verify Email
        </a>
      </div>

      <p style="${email_styles.footnote}">
        This link expires in 24 hours.
      </p>
    </div>
  `;
};

export const password_email = (verificationCode: string) => {
  return `
    <div style="${email_styles.body}">
      <h2 style="${email_styles.headline}">
        Website Password Reset
      </h2>
      <p style="${email_styles.paragraph}">
        You have requested a password reset. Click the button below to reset your password.
      </p>

      <div style="text-align: center; margin: 16px 0 20px;">
        <a
          href="${process.env.NEXT_PUBLIC_PROTOCOL}${process.env.NEXT_PUBLIC_DOMAIN}/change-password/${verificationCode}"
          style="${email_styles.button}"
        >
          Reset Password
        </a>
      </div>
      <p style="${email_styles.footnote}">
        This link expires in 24 hours.
      </p>
    </div>
  `;
};
