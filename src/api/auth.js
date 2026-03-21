const {QH, admin} = require('./firebase');

// Initialize Auth service
const auth = admin.auth();

module.exports = { auth };