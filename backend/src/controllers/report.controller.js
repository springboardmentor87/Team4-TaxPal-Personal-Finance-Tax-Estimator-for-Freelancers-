const prisma = require("../config/prisma");

const getUserId = (req) => req.user.id;

// ==============================
// Summary Report
// ==============================
const getSummaryReport = async (req, res) => {
  try {
    const userId = getUserId(req);

    console.log("========== TAX REPORT DEBUG ==========");
console.log("USER ID:", userId);
console.log("QUERY YEAR:", req.query.year);
console.log("======================================");

    const [income, expense, budget, latestTax] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          userId,
          type: "Income",
        },
        _sum: {
          amount: true,
        },
      }),

      prisma.transaction.aggregate({
        where: {
          userId,
          type: "Expense",
        },
        _sum: {
          amount: true,
        },
      }),

      prisma.budget.aggregate({
        where: {
          userId,
        },
        _sum: {
          limit: true,
        },
      }),

      prisma.taxestimate.findFirst({
        where: {
          userId,
        },
        orderBy: {
          id: "desc",
        },
      }),
    ]);

    const totalIncome = Number(income._sum.amount || 0);
    const totalExpense = Number(expense._sum.amount || 0);
    const totalBudget = Number(budget._sum.limit || 0);
    const estimatedTax = Number(latestTax?.estimatedTax || 0);

    return res.status(200).json({
      success: true,
      report: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        totalBudget,
        estimatedTax,
      },
    });
  } catch (error) {
    console.error("Summary report error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate summary report",
    });
  }
};

// ==============================
// Monthly Report
// ==============================
const getMonthlyReport = async (req, res) => {
  try {
    const userId = getUserId(req);

    const month = Number(req.query.month);
    const year = Number(req.query.year);

    const currentDate = new Date();

    const selectedMonth =
      Number.isInteger(month) && month >= 1 && month <= 12
        ? month
        : currentDate.getMonth() + 1;

    const selectedYear =
      Number.isInteger(year) && year >= 2000 && year <= 2100
        ? year
        : currentDate.getFullYear();

    const startDate = new Date(
      selectedYear,
      selectedMonth - 1,
      1
    );

    const endDate = new Date(
      selectedYear,
      selectedMonth,
      1
    );

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    let totalIncome = 0;
    let totalExpense = 0;

    const incomeByCategory = {};
    const expenseByCategory = {};

    transactions.forEach((transaction) => {
      const amount = Number(transaction.amount || 0);

      if (transaction.type === "Income") {
        totalIncome += amount;

        incomeByCategory[transaction.category] =
          (incomeByCategory[transaction.category] || 0) +
          amount;
      }

      if (transaction.type === "Expense") {
        totalExpense += amount;

        expenseByCategory[transaction.category] =
          (expenseByCategory[transaction.category] || 0) +
          amount;
      }
    });

    return res.status(200).json({
      success: true,
      report: {
        month: selectedMonth,
        year: selectedYear,
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        transactionCount: transactions.length,
        incomeByCategory,
        expenseByCategory,
        transactions,
      },
    });
  } catch (error) {
    console.error("Monthly report error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate monthly report",
    });
  }
};

// ==============================
// Tax Report
// ==============================
const getTaxReport = async (req, res) => {
  try {
    const userId = getUserId(req);

    const requestedYear = Number(req.query.year);

    // Get all tax estimates belonging to the authenticated user.
    const allTaxEstimates = await prisma.taxestimate.findMany({
      where: {
        userId,
      },
      orderBy: {
        id: "desc",
      },
    });

    let taxEstimates = allTaxEstimates;

    /*
     * Tax estimates are stored using Indian Financial Year format.
     *
     * Example:
     * User selects year 2026
     * Database contains taxYear = "FY 2025-26"
     *
     * Therefore, the selected calendar/end year 2026
     * corresponds to FY 2025-26.
     */
    if (
      Number.isInteger(requestedYear) &&
      requestedYear >= 2000 &&
      requestedYear <= 2100
    ) {
      const financialYear = `FY ${requestedYear - 1}-${String(
        requestedYear
      ).slice(-2)}`;

      taxEstimates = allTaxEstimates.filter(
        (tax) => tax.taxYear === financialYear
      );
    }

    const latestTax = taxEstimates[0] || null;

    return res.status(200).json({
      success: true,
      report: {
        year: Number.isInteger(requestedYear)
          ? requestedYear
          : null,
        financialYear:
          Number.isInteger(requestedYear)
            ? `FY ${requestedYear - 1}-${String(requestedYear).slice(-2)}`
            : null,
        count: taxEstimates.length,
        latestTax,
        taxEstimates,
      },
    });
  } catch (error) {
    console.error("Tax report error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate tax report",
    });
  }
};

module.exports = {
  getSummaryReport,
  getMonthlyReport,
  getTaxReport,
};