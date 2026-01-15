const PDFDocument = require("pdfkit");

module.exports = function generateInvoice(res, booking) {
  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");

  doc.text("Bharadwaj Tirth Yatra Invoice");
  doc.text(`Booking ID: ${booking._id}`);
  doc.text(`Amount: ₹${booking.amount / 100}`);
  doc.end();
  doc.pipe(res);
};
