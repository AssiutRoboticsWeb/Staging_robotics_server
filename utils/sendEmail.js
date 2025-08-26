const nodemailer = require("nodemailer");
const { config } = require("../config/environment");

/**
 * Creates and configures nodemailer transporter
 * @returns {Object} Configured nodemailer transporter
 */
const createTransporter = () => {
    if (!config.smtp.user || !config.smtp.pass) {
        throw new Error('SMTP credentials not configured');
    }
    
    return nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure,
        auth: {
            user: config.smtp.user,
            pass: config.smtp.pass,
        },
    });
};

/**
 * Sends an email using the configured SMTP settings
 * @param {Object} emailParams - Email parameters
 * @param {string} emailParams.email - Recipient email address
 * @param {string} emailParams.subject - Email subject
 * @param {string} emailParams.text - Plain text content
 * @param {string} emailParams.html - HTML content
 * @returns {Promise<Object>} Email sending result
 */
const sendEmail = async (emailParams) => {
    try {
        // Validate required parameters
        const { email, subject, text, html } = emailParams;
        
        if (!email || !subject || (!text && !html)) {
            throw new Error('Missing required email parameters: email, subject, and either text or html are required');
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format');
        }
        
        const transporter = createTransporter();
        
        const mailOptions = {
            from: config.smtp.user,
            to: email,
            subject: subject,
            text: text || '',
            html: html || '',
        };
        
        const info = await transporter.sendMail(mailOptions);
        
        console.log("Email sent successfully:", {
            messageId: info.messageId,
            to: email,
            subject: subject,
            timestamp: new Date().toISOString()
        });
        
        return {
            success: true,
            messageId: info.messageId,
            message: 'Email sent successfully'
        };
        
    } catch (error) {
        console.error('Email sending failed:', {
            error: error.message,
            to: emailParams.email,
            subject: emailParams.subject,
            timestamp: new Date().toISOString()
        });
        
        throw new Error(`Failed to send email: ${error.message}`);
    }
};

/**
 * Sends a verification email with a token
 * @param {string} email - Recipient email address
 * @param {string} token - Verification token
 * @param {string} template - HTML template content
 * @returns {Promise<Object>} Email sending result
 */
const sendVerificationEmail = async (email, token, template) => {
    try {
        if (!template) {
            throw new Error('Email template is required');
        }
        
        const tokenUrl = `${config.app.baseUrl}/members/verifyEmail/${token}`;
        const htmlContent = template.replace('{{token_url}}', tokenUrl);
        
        return await sendEmail({
            email,
            subject: "Confirm Your Email - Assiut Robotics Team",
            text: "Please verify your email by clicking the link in your email",
            html: htmlContent,
        });
        
    } catch (error) {
        throw new Error(`Failed to send verification email: ${error.message}`);
    }
};

module.exports = {
    sendEmail,
    sendVerificationEmail
};