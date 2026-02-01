
export type ParsedTransaction = {
    amount: number | null;
    date: Date | null;
    description: string | null;
    type: "INCOME" | "EXPENSE" | "UNKNOWN" | null;
    merchant: string | null;
};

export function parseTransactionFromText(text: string): ParsedTransaction {
    let amount = null;
    let date = null;
    let description = null;
    let type: ParsedTransaction["type"] = null;
    let merchant = null;

    // Normalize text
    const cleanText = text.replace(/\s+/g, " ").trim();

    // 1. Extract Amount (supported formats: MWK 5,000.00, MK5000, 5000.00)
    // Regex looks for currency symbols or just numbers associated with "amount" keywords if possible
    const amountRegex = /(?:MWK|MK|K)\s?([\d,]+\.?\d{0,2})|([\d,]+\.?\d{0,2})\s?(?:MWK|MK|K)/i;
    const amountMatch = cleanText.match(amountRegex);

    if (amountMatch) {
        const rawAmount = amountMatch[1] || amountMatch[2];
        if (rawAmount) {
            amount = parseFloat(rawAmount.replace(/,/g, ""));
        }
    }

    // 2. Extract Date (supported formats: 27/02/2024, 27-Feb-2024, etc.)
    // Many SMS have format "on 27/02/24 at 12:30"
    const dateRegex = /(\d{1,2}[\/\-](?:\d{1,2}|[A-Za-z]{3})[\/\-]\d{2,4}(?:\s\d{1,2}:\d{2})?)/;
    const dateMatch = cleanText.match(dateRegex);

    if (dateMatch) {
        // Try to parse the date
        const parsedDate = new Date(dateMatch[1]);
        if (!isNaN(parsedDate.getTime())) {
            date = parsedDate;
        }
    }

    // Is it today/yesterday?
    if (!date) {
        const todayMatch = cleanText.match(/today/i);
        if (todayMatch) date = new Date();
        const yesterdayMatch = cleanText.match(/yesterday/i);
        if (yesterdayMatch) {
            date = new Date();
            date.setDate(date.getDate() - 1);
        }
    }


    // 3. Determine Type (Income/Expense) & Merchant
    // Airtel Money / Mpamba patterns

    // Sent money
    if (cleanText.match(/transferred to|paid to|sent to|withdraw|payment to|purchase/i)) {
        type = "EXPENSE";
        // Try to find merchant/receiver
        // "Paid to SHOPRITE"
        const merchantMatch = cleanText.match(/(?:paid to|sent to|transfer to)\s+([A-Za-z0-9\s]+?)(?:\.|\s(?:on|at|from)|$)/i);
        if (merchantMatch) merchant = merchantMatch[1].trim();
    }
    // Received money
    else if (cleanText.match(/received from|deposit from|credited/i)) {
        type = "INCOME";
        const senderMatch = cleanText.match(/(?:received from|deposit from)\s+([A-Za-z0-9\s]+?)(?:\.|\s(?:on|at|from)|$)/i);
        if (senderMatch) merchant = senderMatch[1].trim(); // Sender as merchant
    }

    // Fallback description
    description = merchant ? (type === "EXPENSE" ? `Payment to ${merchant}` : `Received from ${merchant}`) : "Parsed Transaction";

    return { amount, date, description, type, merchant };
}
