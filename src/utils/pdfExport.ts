import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PDFReportOptions {
  title: string;
  subtitle?: string;
  headers: string[];
  rows: (string | number)[][];
  generatedBy?: string;
}

export function exportToPDF({
  title,
  subtitle,
  headers,
  rows,
  generatedBy,
}: PDFReportOptions) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // NSUK University Brand Colors
  const primaryGreen = [7, 91, 64]; // #075B40
  const darkGreen = [0, 59, 43]; // #003B2B
  const gold = [213, 172, 73]; // #D5AC49

  // Top Decorative Header Bar
  doc.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.rect(0, 0, 210, 8, 'F');
  doc.setFillColor(gold[0], gold[1], gold[2]);
  doc.rect(0, 8, 210, 2, 'F');

  // University Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2]);
  doc.text('SRCOVA RESEARCH PROJECT — HIGHER EDUCATION GOVERNANCE', 105, 20, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text('Institutional Case Study: Nasarawa State University, Keffi (NSUK) • Selection Framework', 105, 26, {
    align: 'center',
  });

  // Report Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.text(title.toUpperCase(), 105, 34, { align: 'center' });

  if (subtitle) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(subtitle, 105, 39, { align: 'center' });
  }

  // Metadata details
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  const nowStr = new Date().toLocaleString();
  doc.text(`Generated: ${nowStr}  |  Officer: ${generatedBy || 'SRC Selection System'}`, 14, 46);

  // AutoTable
  autoTable(doc, {
    startY: 50,
    head: [headers],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: [7, 91, 64],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [40, 40, 40],
    },
    alternateRowStyles: {
      fillColor: [247, 249, 248], // Light background
    },
    styles: {
      cellPadding: 2.5,
      overflow: 'linebreak',
    },
  });

  // Institutional Sign-off Block on last page
  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 20 : 220;
  if (finalY < 260) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);

    // Signatures
    doc.text('________________________________', 20, finalY);
    doc.text('Dean of Student Affairs', 20, finalY + 5);

    doc.text('________________________________', 130, finalY);
    doc.text('Vice-Chancellor / Authorized Approver', 130, finalY + 5);
  }

  // Footer bar
  doc.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.rect(0, 287, 210, 10, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text(
    'SRCova Research Platform | Case Study: NSUK | Academic Evaluation & Governance Prototype',
    105,
    293,
    { align: 'center' }
  );

  doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.pdf`);
}
