const prisma = require("../config/prisma");
const PDFDocument = require("pdfkit");
const { Parser } = require("json2csv");

const getUserId = (req) => req.user.id;

const getTransactions = async (userId) => {
  return prisma.transaction.findMany({
    where: {
      userId,
    },
    orderBy: {
      date: "desc",
    },
  });
};

// ==============================
// PDF Export
// ==============================
const exportPDF = async (req, res) => {
  try {
    const userId = getUserId(req);

    const transactions = await getTransactions(userId);

    const totalIncome = transactions
      .filter((transaction) => transaction.type === "Income")
      .reduce((total, transaction) => total + transaction.amount, 0);

    const totalExpense = transactions
      .filter((transaction) => transaction.type === "Expense")
      .reduce((total, transaction) => total + transaction.amount, 0);

    const doc = new PDFDocument({
      margin: 50,
    });

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="TaxPal_Report.pdf"'
    );

    doc.pipe(res);

    doc
      .fontSize(22)
      .text("TaxPal Financial Report", {
        align: "center",
      });

    doc.moveDown();

    doc
      .fontSize(12)
      .text(`Generated: ${new Date().toLocaleDateString()}`);

    doc.moveDown();

    doc.fontSize(16).text("Financial Summary");

    doc.moveDown(0.5);

    doc.fontSize(12);
    doc.text(`Total Income: Rs. ${totalIncome.toFixed(2)}`);
    doc.text(`Total Expense: Rs. ${totalExpense.toFixed(2)}`);
    doc.text(
      `Balance: Rs. ${(totalIncome - totalExpense).toFixed(2)}`
    );

    doc.moveDown();

    doc.fontSize(16).text("Transactions");

    doc.moveDown();

    if (transactions.length === 0) {
      doc.fontSize(12).text("No transactions found.");
    } else {
      transactions.forEach((transaction, index) => {
        doc
          .fontSize(11)
          .text(
            `${index + 1}. ${transaction.type} | ` +
              `${transaction.category} | ` +
              `Rs. ${transaction.amount.toFixed(2)} | ` +
              `${new Date(transaction.date).toLocaleDateString()}`
          );
      });
    }

    doc.end();
  } catch (error) {
    console.error("PDF export error:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to export PDF",
      });
    }
  }
};

// ==============================
// CSV Export
// ==============================
const exportCSV = async (req, res) => {
  try {
    const userId = getUserId(req);

    const transactions = await getTransactions(userId);

    const fields = [
      {
        label: "ID",
        value: "id",
      },
      {
        label: "Type",
        value: "type",
      },
      {
        label: "Category",
        value: "category",
      },
      {
        label: "Amount",
        value: "amount",
      },
      {
        label: "Date",
        value: (row) =>
          new Date(row.date).toLocaleDateString(),
      },
    ];

    const parser = new Parser({ fields });

    const csv = parser.parse(transactions);

    res.header("Content-Type", "text/csv");

    res.attachment("TaxPal_Report.csv");

    return res.send(csv);
  } catch (error) {
    console.error("CSV export error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to export CSV",
    });
  }
};

module.exports = {
  exportPDF,
  exportCSV,
};