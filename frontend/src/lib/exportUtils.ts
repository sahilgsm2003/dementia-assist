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
  div.style.width = "210mm"; // A4 width for better readability
  div.style.padding = "20mm";
  div.style.backgroundColor = "#ffffff";
  div.style.color = "#000000";
  div.style.fontFamily = "Arial, sans-serif";
  div.style.fontSize = "14px";
  div.style.lineHeight = "1.6";
  div.style.position = "absolute";
  div.style.left = "-9999px";
  div.style.top = "0";

  // Build emergency contacts HTML
  const contactsHtml = emergencyData.emergency_contacts?.length > 0
    ? emergencyData.emergency_contacts.map((contact: any) => 
        `<div style="margin-bottom: 6px;">
          <strong>${contact.name || "N/A"}</strong> (${contact.relationship || "N/A"}): <strong>${contact.phone || "N/A"}</strong>
        </div>`
      ).join("")
    : '<div style="margin-bottom: 6px;">No emergency contacts listed</div>';

  div.innerHTML = `
    <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px;">
      <h1 style="margin: 0; font-size: 24px; font-weight: bold; text-transform: uppercase;">EMERGENCY INFORMATION</h1>
    </div>
    <div style="margin-bottom: 15px;">
      <strong style="font-size: 16px;">Name:</strong> <span style="font-size: 16px;">${emergencyData.person_name || "N/A"}</span>
    </div>
    <div style="margin-bottom: 15px;">
      <strong style="font-size: 16px; display: block; margin-bottom: 8px;">Emergency Contacts:</strong>
      ${contactsHtml}
    </div>
    ${emergencyData.medical_conditions ? `
      <div style="margin-bottom: 15px;">
        <strong style="font-size: 16px;">Medical Conditions:</strong> <span style="font-size: 14px;">${emergencyData.medical_conditions}</span>
      </div>
    ` : ""}
    ${emergencyData.allergies ? `
      <div style="margin-bottom: 15px; padding: 8px; background-color: #fff3cd; border-left: 4px solid #ffc107;">
        <strong style="font-size: 16px; color: #856404;">Allergies:</strong> <span style="font-size: 14px; color: #856404; font-weight: bold;">${emergencyData.allergies}</span>
      </div>
    ` : ""}
    ${emergencyData.medications ? `
      <div style="margin-bottom: 15px;">
        <strong style="font-size: 16px;">Medications:</strong> <span style="font-size: 14px;">${emergencyData.medications}</span>
      </div>
    ` : ""}
    ${emergencyData.doctor_name ? `
      <div style="margin-bottom: 15px;">
        <strong style="font-size: 16px;">Primary Doctor:</strong> <span style="font-size: 14px;">${emergencyData.doctor_name}</span>
        ${emergencyData.doctor_phone ? ` <strong style="font-size: 14px;">(${emergencyData.doctor_phone})</strong>` : ""}
      </div>
    ` : ""}
    ${emergencyData.home_address ? `
      <div style="margin-bottom: 15px;">
        <strong style="font-size: 16px;">Home Address:</strong> <span style="font-size: 14px;">${emergencyData.home_address}</span>
      </div>
    ` : ""}
    <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
      Generated on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
    </div>
  `;

  document.body.appendChild(div);

  try {
    // Use html2canvas with better options for text rendering
    const canvas = await html2canvas(div, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      onclone: (clonedDoc) => {
        // Ensure fonts are loaded
        const clonedDiv = clonedDoc.querySelector("div") as HTMLElement;
        if (clonedDiv) {
          clonedDiv.style.fontFamily = "Arial, sans-serif";
        }
      },
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pageHeight = pdf.internal.pageSize.getHeight();
    let heightLeft = imgHeight;
    let position = 0;

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

    pdf.save("emergency-information.pdf");
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

