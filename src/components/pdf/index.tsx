import React, { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/pdf.worker.entry.js';
import { throttle } from 'lodash';
import { SpinLoading } from 'antd-mobile';
import styles from './viewer.less';
import CloseIcon from '../../assets/images/other/close.png';

pdfjs.GlobalWorkerOptions.workerSrc = (window as any).pdfjsWorker;

export const PdfPreview: React.FC<{ url: string; onClose: () => void }> = ({
  url,
  onClose,
}) => {
  const [initialWidth, setInitialWidth] = useState(undefined);
  const [totalPages, setTotalPages] = useState(0);
  const pdfWrapper = useRef(null);
  const setPdfSize = () => {
    setInitialWidth((pdfWrapper.current as any).getBoundingClientRect().width);
  };

  useEffect(() => {
    window.addEventListener('resize', throttle(setPdfSize, 3000));
    setPdfSize();
    return () => {
      window.removeEventListener('resize', throttle(setPdfSize, 3000));
    };
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setTotalPages(numPages);
  }

  return (
    <div className={styles.pdfContainer}>
      <div className={styles.close} onClick={onClose}>
        <img src={CloseIcon} />
      </div>
      <div className={styles.pdfContent} ref={pdfWrapper}>
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <SpinLoading color="primary" style={{ margin: '30vh auto' }} />
          }
        >
          {Array.from(new Array(totalPages), (el, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              width={initialWidth}
              loading={''}
            />
          ))}
        </Document>
      </div>
    </div>
  );
};
