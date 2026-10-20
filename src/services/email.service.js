require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting to email server:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Bank Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

async function sendRegisterationEmail(userEmail, userName) {
  const subject = "Welcome to Bank ledger!";
  const text = `Hello ${userName},\n\nThank you for registering with Bank Ledger. We're excited to have you on board!`;
  const html = `<p>Hello ${userName},</p><p>Thank you for registering with Bank Ledger. We're excited to have you on board!</p>`;
  await sendEmail(userEmail, subject, text, html);
}
async function sendTransactionEmail(userEmail, userName, transactionDetails) {
  const subject = "Transaction Notification";
  const text = `Hello ${userName},\n\nA transaction has been made on your account. Details: ${transactionDetails}`;
  const html = `<p>Hello ${userName},</p><p>A transaction has been made on your account. Details: ${transactionDetails}</p>`;
  await sendEmail(userEmail, subject, text, html);
}
async function sendAccountFailureEmail(userEmail, userName, accountDetails) {
  const subject = "Account Failure Notification";
  const text = `Hello ${userName},\n\nThere has been an issue with your account. Details: ${accountDetails}`;
  const html = `<p>Hello ${userName},</p><p>There has been an issue with your account. Details: ${accountDetails}</p>`;
  await sendEmail(userEmail, subject, text, html);
}

module.exports = {sendRegisterationEmail,sendTransactionEmail};  
 
