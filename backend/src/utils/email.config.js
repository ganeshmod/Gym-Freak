import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { Resend } from "resend";
import BASE_API_URL from "../helperFunctions/basicConfig.js";

dotenv.config();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  name,
  email,
  verificationToken,
  type = "verify",
  mailFrom = "noreply@gymfreak.store",
}) {
  try {
    console.log("name", name, "ema", email, "verf", verificationToken);
    if (!name || !email || !verificationToken) {
      throw new Error("All fields are required");
    }

    // Decide email content based on type
    let html, subject;

    if (type == "verify") {
      html = htmlGenerator(name, email, verificationToken);
      subject = "Please Verify Your Account";
    } else if (type == "reset") {
      html = resetPasswordHtmlGenerator(name, email, verificationToken);
      subject = "Reset Your Password";
    } else {
      throw new Error("Invalid email type");
    }

    console.log("Sending email... ... .. .");

    // --------------## using smtp ##-------------
    // const transporter = nodemailer.createTransport({
    //     host: "smtp.gmail.com",
    //     port: 465,
    //     secure: true,
    //     auth: {
    //         user: "anoopkumar0145@gmail.com",
    //         pass: "rjmy fmai morv bscu"
    //     },
    // });
    // const mailOptions = {
    //     from: process.env.EMAIL_FROM,
    //     to: email,
    //     subject: "Please Verify Your Account",
    //     html: htmlGenerator(name, email, verificationToken),
    // };
    // const info = await transporter.sendMail(mailOptions);

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || mailFrom,
      to: email,
      subject,
      html,
    });

    if (error) {
      console.error("⚠️ Error sending email:", error);
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }

    console.log("✅ Email sent successfully:", data);

    return {
      success: true,
      message: `${
        type === "verify" ? "Verification" : "Reset password"
      } email sent successfully`,
      data,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      message: `Error sending ${
        type === "verify" ? "verification" : "reset password"
      } email`,
      data: error.message,
    };
  }
}

const htmlGenerator = (user, email, token) => {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        }

        body {
            background: #f5f5f5;
            padding: 40px 20px;
            min-height: 100vh;
        }

        .email-container {
            max-width: 580px;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #e0e0e0;
        }

        .email-header {
            background: #ffffff;
            padding: 40px 40px 30px;
            text-align: center;
            border-bottom: 1px solid #e0e0e0;
        }

        .logo {
            font-size: 24px;
            font-weight: 600;
            color: #000000;
            margin-bottom: 24px;
            letter-spacing: 1px;
        }

        .email-header h1 {
            font-size: 24px;
            margin-bottom: 8px;
            font-weight: 600;
            color: #000000;
        }

        .email-header p {
            font-size: 14px;
            color: #666666;
            font-weight: 400;
        }

        .email-body {
            padding: 40px;
            color: #333333;
            line-height: 1.6;
            background: #ffffff;
        }

        .greeting {
            font-size: 16px;
            margin-bottom: 20px;
            color: #000000;
            font-weight: 500;
        }

        .message {
            margin-bottom: 14px;
            color: #333333;
            font-size: 15px;
            line-height: 1.6;
        }

        .user-email {
            background: #f9f9f9;
            padding: 14px 20px;
            margin: 24px 0;
            font-size: 14px;
            color: #333333;
            text-align: center;
            border: 1px solid #e0e0e0;
        }

        .cta-button {
            display: inline-block;
            background: #000000;
            color: #ffffff;
            text-decoration: none;
            padding: 14px 32px;
            font-size: 15px;
            font-weight: 500;
            margin: 24px 0;
            transition: background 0.2s ease;
            border: none;
            cursor: pointer;
        }

        .cta-button:hover {
            background: #333333;
        }

        .expiry-info {
            background: #fffbf0;
            padding: 14px 20px;
            margin: 24px 0;
            font-size: 13px;
            color: #856404;
            border: 1px solid #ffeaa7;
            text-align: center;
        }

        .note {
            background: #f9f9f9;
            padding: 20px;
            border-left: 3px solid #000000;
            margin: 24px 0;
            font-size: 14px;
            color: #333333;
            border-right: 1px solid #e0e0e0;
            border-top: 1px solid #e0e0e0;
            border-bottom: 1px solid #e0e0e0;
        }

        .note strong {
            color: #000000;
            font-weight: 600;
        }

        .divider {
            height: 1px;
            background: #e0e0e0;
            margin: 32px 0;
        }

        .email-footer {
            background: #fafafa;
            padding: 32px 40px;
            text-align: center;
            color: #666666;
            font-size: 13px;
            border-top: 1px solid #e0e0e0;
        }

        .contact-info {
            margin-top: 16px;
            font-size: 13px;
            color: #666666;
        }

        .social-links {
            margin: 20px 0;
        }

        .social-links a {
            display: inline-block;
            margin: 0 12px;
            color: #666666;
            text-decoration: none;
            font-size: 13px;
            transition: color 0.2s ease;
        }

        .social-links a:hover {
            color: #000000;
        }

        @media (max-width: 600px) {
            body {
                padding: 20px 10px;
            }
            
            .email-header,
            .email-body,
            .email-footer {
                padding: 30px 24px;
            }
            
            .email-header h1 {
                font-size: 22px;
            }
            
            .cta-button {
                padding: 12px 28px;
                font-size: 14px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
           <div class="email-header">
            <div class="logo">
                <img src="https://res.cloudinary.com/dbtkbhuv1/image/upload/f_auto,q_auto/v1762233262/GymfreakLogo_nzwokz.svg" alt="GYMFREAK" style="max-width: 180px; height: auto; display: block; margin: 0 auto;" />
            </div>
            <h1>Verify Your Email Address</h1>
            <p>Complete your registration and unlock full access</p>
        </div>
        
        <div class="email-body">
            <p class="greeting">Hello <strong>${user}</strong>,</p>
            
            <p class="message">Welcome to GymFreak! We're excited to have you join our fitness community. To activate your account and start your fitness journey, please verify your email address by clicking the button below:</p>

            <div class="user-email">
                Verification for: <strong>${email}</strong>
            </div>

           <div style="text-align: center;">
  <a
    href="${BASE_API_URL}/auth/account-verification?token=${token}"
    style="
      display: inline-block;
      background-color: #000000;
      color: #ffffff;
      text-decoration: none;
      padding: 14px 32px;
      font-size: 15px;
      font-weight: 500;
      margin: 24px 0;
      border-radius: 4px;
      border: none;
      cursor: pointer;
    "
  >
    Verify Email Address
  </a>
</div>

            <div class="expiry-info">
                ⏰ This verification link expires in <strong>10 minutes</strong>
            </div>

            <div class="note">
                <strong>Security Notice:</strong> For your protection, this link will expire after 10 minutes. If you didn't create an account with GymFreak, please ignore this email or contact our support team immediately.
            </div>

            <div class="divider"></div>

            <p class="message" style="text-align: center; font-size: 13px; color: #666;">
                Having trouble with the button?<br>
                Copy and paste this link in your browser:<br>
                <span style="color: #666; word-break: break-all; font-size: 12px;">${BASE_API_URL}/auth/account-verification?token=${token}</span>
            </p>
        </div>
        
        <div class="email-footer">
            <p>&copy; ${new Date().getFullYear()} GymFreak. All rights reserved.</p>
            <p style="margin-top: 12px; font-size: 12px; color: #999;">
                You received this email because you signed up for a GymFreak account.
            </p>
        </div>
    </div>
</body>
</html>`;

  return htmlContent;
};

const resetPasswordHtmlGenerator = (user, email, token) => {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        }

        body {
            background: #f5f5f5;
            padding: 40px 20px;
            min-height: 100vh;
        }

        .email-container {
            max-width: 580px;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #e0e0e0;
        }

        .email-header {
            background: #ffffff;
            padding: 40px 40px 30px;
            text-align: center;
            border-bottom: 1px solid #e0e0e0;
        }

       .logo {
            margin-bottom: 24px;
            display: inline-block;
        }

        .logo img {
            max-width: 180px;
            height: auto;
            display: block;
            margin: 0 auto;
        }

        .email-header h1 {
            font-size: 24px;
            margin-bottom: 8px;
            font-weight: 600;
            color: #000000;
        }

        .email-header p {
            font-size: 14px;
            color: #666666;
            font-weight: 400;
        }

        .email-body {
            padding: 40px;
            color: #333333;
            line-height: 1.6;
            background: #ffffff;
        }

        .greeting {
            font-size: 16px;
            margin-bottom: 20px;
            color: #000000;
            font-weight: 500;
        }

        .message {
            margin-bottom: 14px;
            color: #333333;
            font-size: 15px;
            line-height: 1.6;
        }

        .user-email {
            background: #f9f9f9;
            padding: 14px 20px;
            margin: 24px 0;
            font-size: 14px;
            color: #333333;
            text-align: center;
            border: 1px solid #e0e0e0;
        }

        .cta-button {
            display: inline-block;
            background: #000000;
            color: #ffffff;
            text-decoration: none;
            padding: 14px 32px;
            font-size: 15px;
            font-weight: 500;
            margin: 24px 0;
            transition: background 0.2s ease;
            border: none;
            cursor: pointer;
        }

        .cta-button:hover {
            background: #333333;
        }

        .expiry-info {
            background: #fffbf0;
            padding: 14px 20px;
            margin: 24px 0;
            font-size: 13px;
            color: #856404;
            border: 1px solid #ffeaa7;
            text-align: center;
        }

        .note {
            background: #f9f9f9;
            padding: 20px;
            border-left: 3px solid #000000;
            margin: 24px 0;
            font-size: 14px;
            color: #333333;
            border-right: 1px solid #e0e0e0;
            border-top: 1px solid #e0e0e0;
            border-bottom: 1px solid #e0e0e0;
        }

        .note strong {
            color: #000000;
            font-weight: 600;
        }

        .warning-box {
            background: #fff5f5;
            padding: 20px;
            border-left: 3px solid #dc3545;
            margin: 24px 0;
            font-size: 14px;
            color: #721c24;
            border-right: 1px solid #f5c6cb;
            border-top: 1px solid #f5c6cb;
            border-bottom: 1px solid #f5c6cb;
        }

        .warning-box strong {
            color: #721c24;
            font-weight: 600;
        }

        .divider {
            height: 1px;
            background: #e0e0e0;
            margin: 32px 0;
        }

        .email-footer {
            background: #fafafa;
            padding: 32px 40px;
            text-align: center;
            color: #666666;
            font-size: 13px;
            border-top: 1px solid #e0e0e0;
        }

        .contact-info {
            margin-top: 16px;
            font-size: 13px;
            color: #666666;
        }

        .social-links {
            margin: 20px 0;
        }

        .social-links a {
            display: inline-block;
            margin: 0 12px;
            color: #666666;
            text-decoration: none;
            font-size: 13px;
            transition: color 0.2s ease;
        }

        .social-links a:hover {
            color: #000000;
        }

        @media (max-width: 600px) {
            body {
                padding: 20px 10px;
            }
            
            .email-header,
            .email-body,
            .email-footer {
                padding: 30px 24px;
            }
            
            .email-header h1 {
                font-size: 22px;
            }
            
            .cta-button {
                padding: 12px 28px;
                font-size: 14px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <div class="logo">GYMFREAK</div>
            <h1>Reset Your Password</h1>
            <p>Secure your account with a new password</p>
        </div>
        
        <div class="email-body">
            <p class="greeting">Hello <strong>${user}</strong>,</p>
            
            <p class="message">We received a request to reset the password for your GymFreak account. If you made this request, click the button below to create a new password:</p>

            <div class="user-email">
                Password reset for: <strong>${email}</strong>
            </div>

            <div style="text-align: center;">
                <a href="${BASE_API_URL}/auth/reset-password?token=${token}" class="cta-button">Reset Password</a>
            </div>

            <div class="expiry-info">
                ⏰ This reset link expires in <strong>10 minutes</strong>
            </div>

            <div class="warning-box">
                <strong>⚠️ Didn't request this?</strong> If you didn't request a password reset, please ignore this email. Your password will remain unchanged and your account is secure. Consider changing your password if you're concerned about unauthorized access.
            </div>

            <div class="note">
                <strong>Security Tips:</strong>
                <ul style="margin: 10px 0 0 20px; padding: 0;">
                    <li style="margin-bottom: 8px;">Choose a strong password with at least 8 characters</li>
                    <li style="margin-bottom: 8px;">Use a mix of letters, numbers, and symbols</li>
                    <li style="margin-bottom: 8px;">Avoid using the same password across multiple sites</li>
                    <li>Never share your password with anyone</li>
                </ul>
            </div>

            <div class="divider"></div>

            <p class="message" style="text-align: center; font-size: 13px; color: #666;">
                Having trouble with the button?<br>
                Copy and paste this link in your browser:<br>
                <span style="color: #666; word-break: break-all; font-size: 12px;">${BASE_API_URL}/auth/reset-password?token=${token}</span>
            </p>
        </div>
        
        <div class="email-footer">
            <p>&copy; ${new Date().getFullYear()} GymFreak. All rights reserved.</p>
            <p style="margin-top: 12px; font-size: 12px; color: #999;">
                You received this email because a password reset was requested for your GymFreak account.
            </p>
            <p style="margin-top: 8px; font-size: 12px; color: #999;">
                If you have any concerns, please contact our support team immediately.
            </p>
        </div>
    </div>
</body>
</html>`;

  return htmlContent;
};
