const Contact = require('../model/Contact');
const nodemailer = require('nodemailer');
const axios = require('axios');

// WhatsApp API configuration
const sendWhatsAppMessage = async (phone, message) => {
  try {
    const whatsappAPI = process.env.WHATSAPP_API_URL;
    const apiKey = process.env.WHATSAPP_API_KEY;
    
    if (!whatsappAPI || !apiKey) {
      console.log('WhatsApp API not configured, skipping WhatsApp');
      return;
    }
    
    // Format phone number (remove +91 if present, ensure 10 digits)
    const formattedPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    
    // Test mode - just log the message
    if (whatsappAPI.includes('test') || whatsappAPI.includes('httpbin')) {
      console.log(`WhatsApp TEST mode - would send to ${formattedPhone}: ${message}`);
      return;
    }
    
    // Send via WhatsApp API
    await axios.post(whatsappAPI, {
      phone: `91${formattedPhone}`,
      message: message,
      apikey: apiKey
    });
    
    console.log(`WhatsApp message sent to ${formattedPhone}`);
  } catch (error) {
    console.error('WhatsApp message failed:', error.message);
    // Don't throw error, just log it
  }
};

// SMS API function
const sendSMS = async (phone, message) => {
  try {
    const smsAPI = process.env.SMS_API_URL;
    const smsKey = process.env.SMS_API_KEY;
    
    if (!smsAPI || !smsKey) {
      console.log('SMS API not configured, skipping SMS');
      return;
    }
    
    const formattedPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    
    await axios.post(smsAPI, {
      apikey: smsKey,
      numbers: formattedPhone,
      message: message,
      sender: 'ANVI'
    });
    
    console.log(`SMS sent to ${formattedPhone}`);
  } catch (error) {
    console.error('SMS sending failed:', error.message);
  }
};

// Create email transporter
const createTransporter = () => {
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-email@gmail.com') {
    return null;
  }
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Submit contact form
const submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    
    const contact = new Contact({
      name,
      email,
      phone,
      subject,
      message
    });
    
    await contact.save();
    
    // Auto-reply message
    const autoReplyMessage = `Hi ${name}! Thank you for contacting Anvi Showroom. We've received your inquiry about "${subject || 'your request'}" and will respond within 24 hours. For urgent queries, call +91 98765 43210. - Anvi Team`;
    
    const autoReplyResults = { email: false, sms: false, whatsapp: false };
    
    // Send confirmation email
    if (email) {
      try {
        const transporter = createTransporter();
        if (transporter) {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Thank you for contacting Anvi Showroom',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #667eea;">Thank you for your inquiry!</h2>
                <p>Dear ${name},</p>
                <p>We have received your message and will get back to you within <strong>24 hours</strong>.</p>
                <div style="background: #f8f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Your Message:</strong></p>
                  <p>${message}</p>
                  <p><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
                </div>
                <p>For immediate assistance, call us at <strong>+91 98765 43210</strong></p>
                <p>Best regards,<br><strong>Anvi Showroom Team</strong></p>
              </div>
            `
          });
          autoReplyResults.email = true;
          console.log(`Auto-reply email sent to ${email}`);
        }
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }
    }
    
    // Send auto-reply SMS/WhatsApp if phone number provided
    if (phone) {
      // Send WhatsApp
      try {
        await sendWhatsAppMessage(phone, autoReplyMessage);
        autoReplyResults.whatsapp = true;
        console.log(`Auto-reply WhatsApp sent to ${phone}`);
      } catch (whatsappError) {
        console.error('WhatsApp auto-reply failed:', whatsappError);
      }
      
      // Send SMS
      try {
        await sendSMS(phone, autoReplyMessage);
        autoReplyResults.sms = true;
        console.log(`Auto-reply SMS sent to ${phone}`);
      } catch (smsError) {
        console.error('SMS auto-reply failed:', smsError);
      }
    }
    
    res.status(201).json({ 
      message: 'Contact form submitted successfully',
      contact: { id: contact._id, name, email, subject },
      autoReplySent: autoReplyResults
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all contacts (admin)
const getAllContacts = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    let query = {};
    if (status) {
      query.status = status;
    }
    
    const skip = (page - 1) * limit;
    
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Contact.countDocuments(query);
    
    res.json({
      contacts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalContacts: total
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get contact by ID
const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    // Mark as read
    if (contact.status === 'new') {
      contact.status = 'read';
      await contact.save();
    }
    
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reply to contact
const replyToContact = async (req, res) => {
  try {
    const { replyMessage, repliedBy } = req.body;
    
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    contact.reply = {
      message: replyMessage,
      repliedAt: new Date(),
      repliedBy
    };
    contact.status = 'replied';
    
    await contact.save();
    
    const results = { email: false, sms: false, whatsapp: false };
    
    // Send reply email
    if (contact.email) {
      try {
        const transporter = createTransporter();
        if (transporter) {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: contact.email,
            subject: `Re: ${contact.subject || 'Your Inquiry'}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #667eea;">Reply from Anvi Showroom</h2>
                <p>Dear ${contact.name},</p>
                <div style="background: #f8f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 16px;">${replyMessage}</p>
                </div>
                <hr style="border: 1px solid #eee; margin: 20px 0;">
                <p><strong>Your Original Message:</strong></p>
                <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${contact.message}</p>
                <br>
                <p>For immediate assistance, call us at <strong>+91 98765 43210</strong></p>
                <p>Best regards,<br><strong>Anvi Showroom Team</strong></p>
              </div>
            `
          });
          results.email = true;
          console.log(`Reply email sent to ${contact.email}`);
        }
      } catch (emailError) {
        console.error('Reply email sending failed:', emailError);
      }
    }
    
    // Send reply via SMS/WhatsApp if phone number exists
    if (contact.phone) {
      const smsReply = `Hi ${contact.name}! Anvi Showroom Reply: ${replyMessage} For more info call +91 98765 43210. Thanks!`;
      
      // Send WhatsApp
      try {
        await sendWhatsAppMessage(contact.phone, smsReply);
        results.whatsapp = true;
        console.log(`WhatsApp reply sent to ${contact.phone}`);
      } catch (whatsappError) {
        console.error('WhatsApp reply failed:', whatsappError);
      }
      
      // Send SMS
      try {
        await sendSMS(contact.phone, smsReply);
        results.sms = true;
        console.log(`SMS reply sent to ${contact.phone}`);
      } catch (smsError) {
        console.error('SMS reply failed:', smsError);
      }
    }
    
    res.json({
      contact,
      messageSent: results,
      message: 'Reply sent successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update contact status
const updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send manual SMS/WhatsApp message
const sendManualMessage = async (req, res) => {
  try {
    const { phone, message, type = 'both' } = req.body;
    
    if (!phone || !message) {
      return res.status(400).json({ error: 'Phone and message are required' });
    }
    
    const results = { sms: false, whatsapp: false, errors: [] };
    
    if (type === 'sms' || type === 'both') {
      try {
        await sendSMS(phone, message);
        results.sms = true;
        console.log(`Manual SMS sent to ${phone}`);
      } catch (error) {
        console.error('Manual SMS failed:', error);
        results.errors.push(`SMS: ${error.message}`);
      }
    }
    
    if (type === 'whatsapp' || type === 'both') {
      try {
        await sendWhatsAppMessage(phone, message);
        results.whatsapp = true;
        console.log(`Manual WhatsApp sent to ${phone}`);
      } catch (error) {
        console.error('Manual WhatsApp failed:', error);
        results.errors.push(`WhatsApp: ${error.message}`);
      }
    }
    
    res.json({ 
      message: 'Message processing completed',
      phone: phone,
      results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Test SMS/WhatsApp configuration
const testMessaging = async (req, res) => {
  try {
    const testPhone = '9876543210'; // Test number
    const testMessage = 'Test message from Anvi Showroom API';
    
    const results = { sms: false, whatsapp: false, config: {} };
    
    // Check configuration
    results.config = {
      smsConfigured: !!(process.env.SMS_API_URL && process.env.SMS_API_KEY),
      whatsappConfigured: !!(process.env.WHATSAPP_API_URL && process.env.WHATSAPP_API_KEY)
    };
    
    res.json({
      message: 'Messaging configuration status',
      results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete contact
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.json({ message: 'Contact deleted successfully', contact });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  submitContact,
  getAllContacts,
  getContactById,
  replyToContact,
  updateContactStatus,
  deleteContact,
  sendManualMessage,
  testMessaging
};