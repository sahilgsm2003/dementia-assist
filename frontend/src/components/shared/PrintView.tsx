import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface PrintViewProps {
  children: ReactNode;
  title?: string;
  id?: string;
}

export const PrintView = ({ children, title, id = "print-content" }: PrintViewProps) => {
  return (
    <div id={id} className="print-view bg-white text-black p-8">
      {title && (
        <h1 className="text-3xl font-bold mb-6 text-center">{title}</h1>
      )}
      <div className="print-content">
        {children}
      </div>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #${id}, #${id} * {
            visibility: visible;
          }
          #${id} {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
        .print-view {
          color: #000;
          background: #fff;
        }
        .print-view * {
          color: #000 !important;
          background: transparent !important;
        }
      `}</style>
    </div>
  );
};

