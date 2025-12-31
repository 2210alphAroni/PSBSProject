import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-terms-use',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './terms-use.html',
  styleUrls: ['./terms-use.css'],
})
export class TermsUse {

  @ViewChild('pdfContent') pdfContent!: ElementRef;

  async downloadPDF(): Promise<void> {

    const element = this.pdfContent.nativeElement;

    const canvas = await html2canvas(element, {
      scale: 4,                 // 🔥 HIGH QUALITY
      useCORS: true,
      backgroundColor: '#ffffff',
      windowWidth: 1200
    });

    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Extra pages
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save('Terms_of_Use_Photography_Service.pdf');
  }
}
