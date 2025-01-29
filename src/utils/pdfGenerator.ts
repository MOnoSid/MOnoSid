import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateAnalysisPDF = async (elementId: string) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found');
    }

    // Create canvas from the element
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    // Calculate dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    let firstPage = true;

    // Add title
    pdf.setFontSize(16);
    pdf.text('Therapy Session Analysis', 105, 15, { align: 'center' });
    pdf.setFontSize(12);
    pdf.text(new Date().toLocaleDateString(), 105, 25, { align: 'center' });

    position = 30;
    heightLeft -= position;

    while (heightLeft >= 0) {
      const currentHeight = Math.min(heightLeft, pageHeight);
      // Add content
      pdf.addImage(
        canvas,
        'JPEG',
        0,
        firstPage ? -position : 0,
        imgWidth,
        imgHeight,
        '',
        'FAST'
      );
      heightLeft -= pageHeight;

      if (heightLeft >= 0) {
        pdf.addPage();
        firstPage = false;
      }
    }

    // Add footer
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.text(
        `Page ${i} of ${pageCount}`,
        105,
        pdf.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    // Download PDF
    pdf.save('therapy-session-analysis.pdf');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
