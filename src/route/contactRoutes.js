const express = require('express');
const router = express.Router();
const {
  submitContact,
  getAllContacts,
  getContactById,
  replyToContact,
  updateContactStatus,
  deleteContact,
  sendManualMessage,
  testMessaging
} = require('../controller/contactController');

// POST /api/contact - Submit contact form
router.post('/', submitContact);

// GET /api/contact - Get all contacts (admin)
router.get('/', getAllContacts);

// GET /api/contact/:id - Get contact by ID
router.get('/:id', getContactById);

// POST /api/contact/:id/reply - Reply to contact
router.post('/:id/reply', replyToContact);

// PUT /api/contact/:id/status - Update contact status
router.put('/:id/status', updateContactStatus);

// DELETE /api/contact/:id - Delete contact
router.delete('/:id', deleteContact);

// POST /api/contact/send-message - Send manual SMS/WhatsApp
router.post('/send-message', sendManualMessage);

// GET /api/contact/test-messaging - Test messaging configuration
router.get('/test-messaging', testMessaging);

module.exports = router;