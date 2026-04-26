// utils/reportUtils.js - UPDATED with support for both Bills AND Table Reports

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

// ✅ UPDATED: SMART PDF DOWNLOAD - Handles both Bills and Table Reports
export const downloadPDF = async (elementRef, filename = 'report.pdf') => {
  if (!elementRef.current) {
    alert('❌ Error: Content container not found');
    return;
  }

  try {
    // Show loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.innerHTML = `
      <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                  background: linear-gradient(135deg, #4CAF50, #45a049); 
                  color: white; padding: 30px; border-radius: 15px; 
                  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                  z-index: 9999; text-align: center; min-width: 300px;">
        <div style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">
          📄 Creating Professional PDF...
        </div>
        <div style="width: 250px; height: 6px; background: rgba(255,255,255,0.3); 
                    border-radius: 3px; overflow: hidden; margin: 0 auto;">
          <div style="width: 0%; height: 100%; background: white; 
                      animation: progress 3s ease-in-out forwards; border-radius: 3px;"></div>
        </div>
        <div style="margin-top: 10px; font-size: 14px; opacity: 0.9;">
          Processing report data...
        </div>
      </div>
      <style>
        @keyframes progress { to { width: 100%; } }
      </style>
    `;
    document.body.appendChild(loadingDiv);

    // ✅ SMART DETECTION: Check if it's a multi-bill report or single table report
    const billPages = elementRef.current.querySelectorAll('.bill-page');
    const isMultiBillReport = billPages.length > 0;
    
    console.log(`📄 Report type: ${isMultiBillReport ? 'Multi-Bill' : 'Table'}`);
    console.log(`📄 Found ${isMultiBillReport ? billPages.length : 1} page(s) to process`);

    // Create PDF with A4 size
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    if (isMultiBillReport) {
      // ✅ MULTI-BILL REPORT - Process each bill page separately
      for (let i = 0; i < billPages.length; i++) {
        const billPage = billPages[i];
        
        console.log(`📋 Processing bill ${i + 1}/${billPages.length}`);

        await new Promise(resolve => setTimeout(resolve, 300));

        const canvas = await html2canvas(billPage, {
          scale: 2.5,
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#ffffff',
          width: 794,
          height: 1123,
          scrollX: 0,
          scrollY: 0,
          logging: false,
          onclone: (clonedDoc) => {
            const style = clonedDoc.createElement('style');
            style.textContent = `
              * {
                font-family: 'Arial', 'Helvetica', sans-serif !important;
                -webkit-font-smoothing: antialiased !important;
              }
              .bill-page {
                width: 210mm !important;
                min-height: 297mm !important;
                margin: 0 !important;
                padding: 20px !important;
                background: white !important;
              }
              table { border-collapse: collapse !important; width: 100% !important; }
              td, th { border: 1px solid #000 !important; padding: 8px !important; font-size: 12px !important; }
              th { background-color: #f5f5f5 !important; font-weight: bold !important; }
            `;
            clonedDoc.head.appendChild(style);
          }
        });

        const imgData = canvas.toDataURL('image/png', 0.95);

        if (i > 0) {
          pdf.addPage();
        }

        const pdfWidth = 210;
        const pdfHeight = 297;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      }
    } else {
      // ✅ SINGLE TABLE REPORT - Process the entire container
      console.log(`📋 Processing table report`);

      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(elementRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        logging: false,
        onclone: (clonedDoc) => {
          const style = clonedDoc.createElement('style');
          style.textContent = `
            * {
              font-family: 'Arial', 'Helvetica', sans-serif !important;
              -webkit-font-smoothing: antialiased !important;
            }
            body {
              margin: 0 !important;
              padding: 20px !important;
              background: white !important;
            }
            table { 
              border-collapse: collapse !important; 
              width: 100% !important; 
              margin: 10px 0 !important;
            }
            td, th { 
              border: 1px solid #000 !important; 
              padding: 8px !important; 
              font-size: 11px !important; 
              vertical-align: top !important;
            }
            th { 
              background-color: #f5f5f5 !important; 
              font-weight: bold !important; 
            }
            .pdf-content {
              width: 210mm !important;
              margin: 0 auto !important;
              background: white !important;
            }
          `;
          clonedDoc.head.appendChild(style);
        }
      });

      const imgData = canvas.toDataURL('image/png', 0.95);

      // ✅ Calculate proper dimensions to fit content
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const pdfWidth = 210;
      const pdfHeight = (imgHeight * pdfWidth) / imgWidth;

      // ✅ Add multiple pages if content is too tall
      if (pdfHeight > 297) {
        // Content spans multiple pages
        const pageHeight = 297;
        const totalPages = Math.ceil(pdfHeight / pageHeight);

        for (let page = 0; page < totalPages; page++) {
          if (page > 0) {
            pdf.addPage();
          }

          const yOffset = -(page * pageHeight * imgWidth / pdfWidth);
          
          pdf.addImage(
            imgData, 
            'PNG', 
            0, 
            yOffset, 
            pdfWidth, 
            pdfHeight, 
            undefined, 
            'FAST'
          );
        }
      } else {
        // Single page content
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      }
    }

    // ✅ Set PDF metadata
    pdf.setProperties({
      title: filename.replace('.pdf', '') + ' - Professional Report',
      subject: 'Business Report - Govindan Vegetables',
      author: 'GVV Business System',
      creator: 'Professional Report Generator'
    });

    // Remove loading and save
    document.body.removeChild(loadingDiv);
    pdf.save(filename);
    
    const pageCount = isMultiBillReport ? billPages.length : pdf.internal.getNumberOfPages();
    showNotification(`✅ Professional PDF with ${pageCount} page(s) generated successfully!`, 'success');

  } catch (error) {
    console.error('❌ PDF Generation Error:', error);
    showNotification('❌ PDF Generation Failed. Please try again.', 'error');
    
    try {
      document.body.removeChild(document.querySelector('[style*="position: fixed"]'));
    } catch {}
  }
};

// ✅ UPDATED PRINT FUNCTION - Handles both report types
export const printReport = (elementRef) => {
  if (!elementRef.current) return;

  const printContent = elementRef.current.innerHTML;
  const printWindow = window.open('', '_blank', 'width=1200,height=800');
  
  // ✅ Detect report type
  const isMultiBill = printContent.includes('bill-page');
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Professional Report</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Arial', 'Helvetica', sans-serif;
          font-size: 12px; line-height: 1.4; background: white; color: black;
        }
        
        @media print {
          @page { size: A4; margin: 15mm; }
          
          ${isMultiBill ? `
          .bill-page {
            page-break-after: always !important;
            page-break-inside: avoid !important;
            min-height: 297mm !important;
            width: 210mm !important;
            margin: 0 !important;
            padding: 20px !important;
          }
          .bill-page:last-child {
            page-break-after: avoid !important;
          }
          ` : `
          .pdf-content {
            page-break-inside: avoid !important;
            width: 100% !important;
          }
          `}
          
          table {
            page-break-inside: avoid !important;
            border-collapse: collapse !important;
            width: 100% !important;
          }
          tr { page-break-inside: avoid !important; }
          td, th {
            border: 1px solid #000 !important;
            padding: 6px !important;
            font-size: 11px !important;
          }
          th {
            background-color: #f5f5f5 !important;
            font-weight: bold !important;
          }
        }
        
        table { border-collapse: collapse !important; width: 100%; margin: 10px 0; }
        td, th { border: 1px solid #000 !important; padding: 6px; text-align: left; }
        th { background-color: #f5f5f5 !important; font-weight: bold; }
        
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;700&display=swap');
      </style>
    </head>
    <body>
      ${printContent}
      <script>
        window.onload = function() {
          setTimeout(function() { 
            console.log('🖨️ Opening print dialog...');
            window.print(); 
            setTimeout(function() { window.close(); }, 1000);
          }, 1500);
        };
        
        window.onafterprint = function() {
          console.log('🖨️ Print completed');
          window.close();
        };
      </script>
    </body>
    </html>
  `);
  
  printWindow.document.close();
  showNotification('🖨️ Professional Print Dialog Opened!', 'info');
};

// ✅ NOTIFICATION SYSTEM (unchanged)
const showNotification = (message, type = 'info') => {
  const colors = {
    success: 'linear-gradient(135deg, #4CAF50, #45a049)',
    error: 'linear-gradient(135deg, #f44336, #d32f2f)',
    info: 'linear-gradient(135deg, #2196F3, #1976d2)'
  };

  const notification = document.createElement('div');
  notification.innerHTML = `
    <div style="
      position: fixed; top: 25px; right: 25px; z-index: 10000;
      background: ${colors[type]}; color: white; padding: 20px 25px;
      border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      font-family: Arial, sans-serif; font-weight: 600; font-size: 14px;
      max-width: 400px; line-height: 1.4;
      animation: slideIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      border: 1px solid rgba(255,255,255,0.2);
    ">
      ${message}
    </div>
    <style>
      @keyframes slideIn {
        from { transform: translateX(100%) scale(0.8); opacity: 0; }
        to { transform: translateX(0) scale(1); opacity: 1; }
      }
    </style>
  `;

  document.body.appendChild(notification);
  setTimeout(() => {
    try { document.body.removeChild(notification); } catch {}
  }, 5000);
};

// ✅ EXCEL EXPORT (unchanged)
export const exportToExcel = (headers, rows, filename = 'report.xlsx') => {
  try {
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    
    worksheet['!cols'] = headers.map(() => ({ wch: 20 }));
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Professional Report');
    XLSX.writeFile(workbook, filename);
    
    showNotification('📊 Professional Excel Report Downloaded!', 'success');
  } catch (error) {
    console.error('Excel Export Error:', error);
    showNotification('❌ Excel export failed.', 'error');
  }
};
