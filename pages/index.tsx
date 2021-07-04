import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { PDFDocument } from 'pdf-lib';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
export default function MyApp() {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [docPDFBytes, setDocPDFBytes] = useState("");
  const [divCoordinates, setDivCoordinates] = useState({
    position: "relative",
    left: undefined,
    top: undefined
  });

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  async function modifyPdf(height, width) {
    const url = '/sample.pdf'
    const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer())
    console.log("===========================")
    const existingPngBytes = await fetch("/embed_image.png").then(res => res.arrayBuffer())
    console.log("===========================")

    const pdfDoc = await PDFDocument.load(existingPdfBytes)
    const pages = pdfDoc.getPages();
    const embeddSign = await pdfDoc.embedPng(existingPngBytes);
    console.log("===========================", embeddSign.height)

    pages[0].drawImage(embeddSign, {
      x: width,
      y: pages[0].getHeight() - embeddSign.height - height,
      // height: 20
    });
    console.log("===========================1")

    const pdfBytes = await pdfDoc.save();
    console.log(pdfBytes)
    setDocPDFBytes(pdfBytes);
  }

  return (
    <div
      style={{
        "backgroundColor": "khaki"
      }}
    >
      <div
        id="pdf_embed_viewer"
        style={{
          "margin": 200
        }}>
        <Document
          file={{ url: "/sample.pdf" }}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={e =>
            console.log("Error while loading document! " + e.message)
          }
          onSourceError={e =>
            console.log("Error while loading document! " + e.message)
          }
        >
          <Page pageNumber={pageNumber}
            onLoadSuccess={(page) => {
              console.log(page)
            }}
            scale={2}
            onClick={(mouseEvent, page) => {
              console.log(mouseEvent)
              console.log(mouseEvent.pageX)
              console.log(mouseEvent.pageY)
              console.log(page)
              console.log(page.height)
              console.log(page.originalHeight)
              console.log(page.originalWidth)
              console.log(page.width)
              const pdfEmbedViewerInstance = document.getElementById("pdf_embed_viewer");
              console.log(pdfEmbedViewerInstance.top)
              console.log(pdfEmbedViewerInstance.left)
              console.log(pdfEmbedViewerInstance.offsetLeft)
              setDivCoordinates({
                position: "absolute",
                left: mouseEvent.pageX + "px",
                top: mouseEvent.pageY + "px"
              })
              const xRatio = page.originalWidth / page.width;
              const yRatio = page.originalHeight / page.height;
              console.log(xRatio * mouseEvent.pageX)
              console.log(yRatio * mouseEvent.pageY)
              const finalEmbedYCoordinate = yRatio * (mouseEvent.pageY - pdfEmbedViewerInstance.offsetTop)
              const finalEmbedXCoordinate = xRatio * (mouseEvent.pageX - pdfEmbedViewerInstance.offsetLeft)
              modifyPdf(finalEmbedYCoordinate, finalEmbedXCoordinate)
            }} />
        </Document>
        <p>Page {pageNumber} of {numPages}</p>
        <img id="embed_image"
          style={{
            "color": "green",
            "fontWeight": "bold",
            "borderStyle": "solid",
            "borderWidth": "5px",
            "margin": "0px",
            "height": "90px",
            "width": "90px",
            ...divCoordinates
          }}
          src="/embed_image.png"
        />
      </div>
      <div>
        {docPDFBytes && (
          <div
            style={{
              "backgroundColor": "khaki"
            }}
          >
            <div
              style={{
                "fontSize": "4em",
                "color": "grey",
                "textAlign": "center",
                "backgroundColor": "ivory"
              }}
            >Final Document</div>
            <Document
              file={{ data: docPDFBytes }}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={e =>
                console.log("Error while loading document! " + e.message)
              }
              onSourceError={e =>
                console.log("Error while loading document! " + e.message)
              }
            >
              <Page pageNumber={pageNumber}
                scale={2}
              />
            </Document>
          </div>
        )}
      </div>
    </div>
  );
}
