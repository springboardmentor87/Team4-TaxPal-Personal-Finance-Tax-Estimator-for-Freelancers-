const getTaxCalendar = (financialYear) => {
    const [startYearString] = financialYear.split("-");
    const startYear = Number(startYearString);

    if (!Number.isInteger(startYear)) {
        throw new Error("Invalid financial year");
    }

    return [
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
            dueDate: `${startYear + 1}-03-15`,
            percentage: 100,
        },
    ];
};

module.exports = {
    getTaxCalendar,
};