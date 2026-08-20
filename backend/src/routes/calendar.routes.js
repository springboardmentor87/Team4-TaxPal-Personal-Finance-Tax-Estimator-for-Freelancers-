const express = require("express");

const router = express.Router();

const authenticateUser = require("../middleware/auth.middleware");

const {
    getCalendar
} = require("../controllers/calendar.controller");

// Get Tax Calendar
router.get(
    "/",
    authenticateUser,
    getCalendar
);

module.exports = router;