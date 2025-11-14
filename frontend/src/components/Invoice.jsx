import React, { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const Invoice = ({ invoice, formatCents, setInvoice }) => {
  const invoiceRef = useRef();
  const [showLogo, setShowLogo] = useState(false); // show logo only for PDF

  const loadImages = (element) => {
    const images = element.querySelectorAll("img");
    return Promise.all(
      Array.from(images).map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) resolve();
            else img.onload = img.onerror = resolve;
          })
      )
    );
  };

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;

    setShowLogo(true); // show logo for PDF
    await loadImages(invoiceRef.current); // wait for all images to load

    const canvas = await html2canvas(invoiceRef.current, { useCORS: true,scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Invoice_${invoice.id}.pdf`);

    setShowLogo(false); // hide logo after PDF
  };

  return (
    <section className="panel">
      <h2>Invoice</h2>
      {invoice ? (
        <div>
          <div
            ref={invoiceRef}
            className="invoice"
            style={{ padding: "20px", backgroundColor: "#fff", color: "#000", fontFamily: "Arial, sans-serif" }}
          >
            {/* Logo - show only for PDF */}
            {showLogo && (
              <div style={{ textAlign: "left", marginBottom: "20px" }}>
                <img
                  src="/pos.jpg"
                  alt="Logo"
                  width="150"
                  crossOrigin="anonymous"
                />
              </div>
            )}

            <div style={{ marginBottom: "10px" }}>
              <strong>Invoice #:</strong> {invoice.id}
            </div>
            <div style={{ marginBottom: "20px" }}>
              <strong>Date:</strong> {invoice.date}
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #000" }}>
                  <th style={{ textAlign: "left", padding: "5px" }}>Item</th>
                  <th style={{ textAlign: "left", padding: "5px" }}>Image</th>
                  <th style={{ textAlign: "right", padding: "5px" }}>Price</th>
                  <th style={{ textAlign: "right", padding: "5px" }}>Qty</th>
                  <th style={{ textAlign: "right", padding: "5px" }}>Line</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((it) => (
                  <tr key={it.id} style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={{ padding: "5px" }}>{it.title}</td>
                    <td style={{ padding: "5px" }}>
                      <img
                        src={it.images[0]}
                        alt={it.title}
                        width="50"
                        height="50"
                        crossOrigin="anonymous"
                      />
                    </td>
                    <td style={{ textAlign: "right", padding: "5px" }}>₹{it.price.toFixed(2)}</td>
                    <td style={{ textAlign: "right", padding: "5px" }}>{it.qty}</td>
                    <td style={{ textAlign: "right", padding: "5px" }}>
                      ₹{((Math.round(it.price * 100) * it.qty) / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ textAlign: "right", marginTop: "10px" }}>
              <div>Subtotal: ₹{formatCents(invoice.subtotal)}</div>
              <div>Tax: ₹{formatCents(invoice.tax)}</div>
              <div><strong>Total: ₹{formatCents(invoice.total)}</strong></div>
              {invoice.cashReceived !== null && (
                <>
                  <div>Cash: ₹{formatCents(invoice.cashReceived)}</div>
                  <div>Change: ₹{formatCents(invoice.change >= 0 ? invoice.change : 0)}</div>
                </>
              )}
            </div>
          </div>

          <div style={{ marginTop: 8 }}>
            <button onClick={() => setInvoice(null)}>Close Invoice</button>{" "}
            <button onClick={handleDownloadPDF}>Download PDF</button>
          </div>
        </div>
      ) : (
        <div className="empty">No invoice yet. Checkout to create invoice.</div>
      )}
    </section>
  );
};

export default Invoice;
