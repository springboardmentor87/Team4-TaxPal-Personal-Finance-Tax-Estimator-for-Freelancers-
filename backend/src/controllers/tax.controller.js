const prisma = require("../config/prisma");

// ==============================
// Create Tax Estimate
// ==============================
const createTaxEstimate = async (req, res) => {
    try {
        const { annualIncome, quarter } = req.body;

        // Validate annual income
        const numericAnnualIncome = Number(annualIncome);

        if (
            annualIncome === undefined ||
            annualIncome === null ||
            annualIncome === "" ||
            !Number.isFinite(numericAnnualIncome) ||
            numericAnnualIncome <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Annual income must be a valid positive number",
            });
        }

        // Validate quarter
        if (
            typeof quarter !== "string" ||
            !quarter.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Quarter is required",
            });
        }

        // Existing project tax calculation
        let taxRate = 0;

        if (numericAnnualIncome <= 500000) {
            taxRate = 0.05;
        } else if (numericAnnualIncome <= 1000000) {
            taxRate = 0.10;
        } else {
            taxRate = 0.20;
        }

        const estimatedTax = numericAnnualIncome * taxRate;

        const taxEstimate = await prisma.taxEstimate.create({
            data: {
                annualIncome: numericAnnualIncome,
                quarter: quarter.trim(),
                estimatedTax,
                userId: req.user.userId,
            },
        });

        res.status(201).json({
            success: true,
            message: "Tax estimate calculated successfully",
            taxEstimate,
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

// ==============================
// Get All Tax Estimates
// ==============================
const getAllTaxEstimates = async (req, res) => {
    try {
        const taxEstimates = await prisma.taxEstimate.findMany({
            where: {
                userId: req.user.userId,
            },
            orderBy: {
                id: "desc",
            },
        });

        res.status(200).json({
            success: true,
            count: taxEstimates.length,
            taxEstimates,
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

// ==============================
// Get Single Tax Estimate
// ==============================
const getTaxEstimateById = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid tax estimate ID",
            });
        }

        const taxEstimate = await prisma.taxEstimate.findFirst({
            where: {
                id,
                userId: req.user.userId,
            },
        });

        if (!taxEstimate) {
            return res.status(404).json({
                success: false,
                message: "Tax estimate not found",
            });
        }

        res.status(200).json({
            success: true,
            taxEstimate,
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

// ==============================
// Delete Tax Estimate
// ==============================
const deleteTaxEstimate = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid tax estimate ID",
            });
        }

        const taxEstimate = await prisma.taxEstimate.findFirst({
            where: {
                id,
                userId: req.user.userId,
            },
        });

        if (!taxEstimate) {
            return res.status(404).json({
                success: false,
                message: "Tax estimate not found",
            });
        }

        await prisma.taxEstimate.delete({
            where: {
                id,
            },
        });

        res.status(200).json({
            success: true,
            message: "Tax estimate deleted successfully",
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

// ==============================
// Get Tax Calendar
// ==============================
// Returns the quarterly advance-tax schedule
// for the current financial year.
// these dates are rule-based calendar data.
// ==============================
const getTaxCalendar = async (req, res) => {
    try {
        const currentDate = new Date();

        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();

        // Indian financial year:
        // April - March
        let startYear;

        if (currentMonth >= 4) {
            startYear = currentYear;
        } else {
            startYear = currentYear - 1;
        }

        const endYear = startYear + 1;

        const taxYear = `${startYear}-${String(endYear).slice(-2)}`;

        const calendar = [
            {
                quarter: "Q1",
                title: "1st Advance Tax Installment",
                dueDate: `${startYear}-06-15`,
                percentage: 15,
            },
            {
                quarter: "Q2",
                title: "2nd Advance Tax Installment",
                dueDate: `${startYear}-09-15`,
                percentage: 45,
            },
            {
                quarter: "Q3",
                title: "3rd Advance Tax Installment",
                dueDate: `${startYear}-12-15`,
                percentage: 75,
            },
            {
                quarter: "Q4",
                title: "4th Advance Tax Installment",
                dueDate: `${endYear}-03-15`,
                percentage: 100,
            },
        ];

        return res.status(200).json({
            success: true,
            taxYear,
            calendar,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to generate tax calendar",
        });
    }
};

// ==============================
// Export Controllers
// ==============================
module.exports = {
    createTaxEstimate,
    getAllTaxEstimates,
    getTaxEstimateById,
    deleteTaxEstimate,
    getTaxCalendar,
};