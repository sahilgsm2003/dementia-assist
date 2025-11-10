import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export type ExportType = "emergency-card" | "medication-schedule" | "memory-book" | "daily-routine";

interface ExportOptions {
  title?: string;
  orientation?: "portrait" | "landscape";
  format?: "a4" | "letter" | [number, number];
}

/**
 * Export HTML element to PDF
 */
export const exportToPDF = async (
  element: HTMLElement,
  filename: string,
  options: ExportOptions = {}
): Promise<void> => {
  const { title, orientation = "portrait", format = "a4" } = options;

  try {
    // Convert HTML to canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    // Create PDF
    const pdf = new jsPDF({
      orientation,
      unit: "mm",
      format,
    });

    const imgWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pageHeight = pdf.internal.pageSize.getHeight();
    let heightLeft = imgHeight;
    let position = 0;

    // Add title if provided
    if (title) {
      pdf.setFontSize(18);
      pdf.text(title, 10, 15);
      position = 25;
      heightLeft = imgHeight - (position - 15);
    }

    // Add first page
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save PDF
    pdf.save(filename);
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    throw error;
  }
};

/**
 * Export emergency card as wallet-sized PDF
 */
export const exportEmergencyCard = async (emergencyData: any): Promise<void> => {
  // Create a temporary div with emergency card content
  const div = document.createElement("div");
  div.style.width = "85.6mm"; // Standard credit card width
  div.style.height = "53.98mm"; // Standard credit card height
  div.style.padding = "10mm";
  div.style.backgroundColor = "#ffffff";
  div.style.color = "#000000";
  div.style.fontFamily = "Arial, sans-serif";
  div.style.fontSize = "12px";
  div.style.position = "absolute";
  div.style.left = "-9999px";

  div.innerHTML = `
    <div style="text-align: center; margin-bottom: 10px;">
      <h2 style="margin: 0; font-size: 18px; font-weight: bold;">EMERGENCY INFORMATION</h2>
    </div>
    <div style="margin-bottom: 8px;">
      <strong>Name:</strong> ${emergencyData.person_name || "N/A"}
    </div>
    ${emergencyData.emergency_contacts?.length > 0 ? `
      <div style="margin-bottom: 8px;">
        <strong>Emergency Contacts:</strong><br/>
        ${emergencyData.emergency_contacts.map((contact: any) => 
          `${contact.name} (${contact.relationship}): ${contact.phone}`
        ).join("<br/>")}
      </div>
    ` : ""}
    ${emergencyData.medical_conditions ? `
      <div style="margin-bottom: 8px;">
        <strong>Medical Conditions:</strong> ${emergencyData.medical_conditions}
      </div>
    ` : ""}
    ${emergencyData.allergies ? `
      <div style="margin-bottom: 8px;">
        <strong>Allergies:</strong> ${emergencyData.allergies}
      </div>
    ` : ""}
    ${emergencyData.doctor_name ? `
      <div style="margin-bottom: 8px;">
        <strong>Doctor:</strong> ${emergencyData.doctor_name} ${emergencyData.doctor_phone ? `(${emergencyData.doctor_phone})` : ""}
      </div>
    ` : ""}
  `;

  document.body.appendChild(div);

  try {
    await exportToPDF(div, "emergency-card.pdf", {
      format: [85.6, 53.98], // Wallet size
      orientation: "landscape",
    });
  } finally {
    document.body.removeChild(div);
  }
};

/**
 * Print-friendly view
 */
export const printElement = (elementId: string): void => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    console.error("Failed to open print window");
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #000;
            background: #fff;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};

/**
 * Export medication schedule to PDF
 */
export const exportMedicationSchedule = async (medications: any[]): Promise<void> => {
  const div = document.createElement("div");
  div.style.width = "210mm"; // A4 width
  div.style.padding = "20mm";
  div.style.backgroundColor = "#ffffff";
  div.style.color = "#000000";
  div.style.fontFamily = "Arial, sans-serif";
  div.style.position = "absolute";
  div.style.left = "-9999px";

  div.innerHTML = `
    <h1 style="text-align: center; margin-bottom: 20px;">Medication Schedule</h1>
    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
      <thead>
        <tr style="background-color: #f0f0f0;">
          <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Medication</th>
          <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Dosage</th>
          <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Frequency</th>
          <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Time</th>
          <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Purpose</th>
        </tr>
      </thead>
      <tbody>
        ${medications.map((med) => `
          <tr>
            <td style="border: 1px solid #ddd; padding: 10px;">${med.name || "N/A"}</td>
            <td style="border: 1px solid #ddd; padding: 10px;">${med.dosage || "N/A"}</td>
            <td style="border: 1px solid #ddd; padding: 10px;">${med.frequency || "N/A"}</td>
            <td style="border: 1px solid #ddd; padding: 10px;">${med.time || "N/A"}</td>
            <td style="border: 1px solid #ddd; padding: 10px;">${med.purpose || "N/A"}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
    <p style="margin-top: 20px; font-size: 12px; color: #666;">
      Generated on ${new Date().toLocaleDateString()}
    </p>
  `;

  document.body.appendChild(div);

  try {
    await exportToPDF(div, "medication-schedule.pdf", {
      title: "Medication Schedule",
      orientation: "portrait",
      format: "a4",
    });
  } finally {
    document.body.removeChild(div);
  }
};

