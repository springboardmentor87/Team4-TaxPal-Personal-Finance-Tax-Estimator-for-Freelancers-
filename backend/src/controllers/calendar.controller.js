const { getTaxCalendar } = require("../services/taxCalendar.service");

// ==============================
// Get Tax Calendar
// ==============================
const getCalendar = async (req, res) => {
    try {
        const currentDate = new Date();

        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        // Financial year starts in April
        const financialYearStart =
            currentMonth >= 4 ? currentYear : currentYear - 1;

        const financialYear = `${financialYearStart}-${String(
            financialYearStart + 1
        ).slice(-2)}`;

        const calendar = getTaxCalendar(financialYear);

        return res.status(200).json({
            success: true,
            taxYear: financialYear,
            calendar,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to load tax calendar",
        });
    }
};

module.exports = {
    getCalendar,
};