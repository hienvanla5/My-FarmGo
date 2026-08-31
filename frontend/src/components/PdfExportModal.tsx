
import React, { useRef, useState } from 'react';
import { X, FileText, Download, Printer, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const PdfExportModal: React.FC = () => {
  const { isPdfModalOpen, setIsPdfModalOpen, currentFarm, batches, showToast } = useApp();
  const reportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  if (!isPdfModalOpen || !currentFarm) return null;

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    try {
      setExporting(true);
      const canvas = await html2canvas(reportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Bao_Cao_Trai_Ga_${currentFarm.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
      showToast('Đã xuất file PDF báo cáo thành công!', 'success');
      setIsPdfModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Lỗi xuất PDF', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="font-bold text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-green-400" />
            <span>Xem Trước & Xuất Báo Cáo Kỹ Thuật / Tài Chính Trang Trại</span>
          </div>
          <button onClick={() => setIsPdfModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Report Canvas */}
        <div className="p-6 overflow-y-auto bg-slate-100">
          <div ref={reportRef} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6 text-slate-800 font-sans">
            {/* Farm Header */}
            <div className="flex items-start justify-between border-b-2 border-green-700 pb-4">
              <div>
                <div className="text-xl font-black text-green-800 tracking-tight flex items-center gap-1.5">
                  <span>🐔</span>
                  <span>FARMGO - BÁO CÁO TỔNG HỢP TRẠI GÀ</span>
                </div>
                <div className="text-sm font-bold text-slate-800 mt-1">{currentFarm.name}</div>
                <div className="text-xs text-slate-500">{currentFarm.address}</div>
              </div>
              <div className="text-right text-xs text-slate-500">
                <div>Ngày xuất: <b>{new Date().toLocaleDateString('vi-VN')}</b></div>
                <div>Phần mềm: <b>FarmGo SaaS v1.0</b></div>
              </div>
            </div>

            {/* General Farm Summary */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-slate-400 font-medium">Tổng Đàn Hiện Có</div>
                <div className="text-lg font-black text-slate-900 mt-0.5">
                  {batches.reduce((sum, b) => sum + (b.status === 'active' ? b.currentQuantity : 0), 0).toLocaleString('vi-VN')} con
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-slate-400 font-medium">Tỷ Lệ Sống Bình Quân</div>
                <div className="text-lg font-black text-green-700 mt-0.5">96.8%</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-slate-400 font-medium">Chỉ Số FCR Bình Quân</div>
                <div className="text-lg font-black text-amber-700 mt-0.5">2.65</div>
              </div>
            </div>

            {/* Batches Table */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">Danh Sách Lứa Nuôi</h4>
              <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-600 font-bold border-b">
                  <tr>
                    <th className="p-2">Tên Lứa</th>
                    <th className="p-2">Giống</th>
                    <th className="p-2">Ngày Vào</th>
                    <th className="p-2">Số Lượng</th>
                    <th className="p-2">Tỷ Lệ Sống</th>
                    <th className="p-2">FCR</th>
                    <th className="p-2">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map(b => (
                    <tr key={b.id} className="border-b border-slate-100 last:border-0">
                      <td className="p-2 font-bold">{b.name}</td>
                      <td className="p-2">{b.breedName}</td>
                      <td className="p-2">{b.startDate}</td>
                      <td className="p-2 font-bold">{b.currentQuantity} con</td>
                      <td className="p-2 text-green-700 font-bold">{b.survivalRate}%</td>
                      <td className="p-2 font-bold">{b.currentFCR || 2.6}</td>
                      <td className="p-2">{b.status === 'active' ? 'Đang nuôi' : 'Đã bán'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Signature footer */}
            <div className="grid grid-cols-2 text-center text-xs pt-8">
              <div>
                <div className="font-bold text-slate-700">CÁN BỘ KHUYẾN NÔNG / KẾ TOÁN</div>
                <div className="text-slate-400 text-[10px] mt-1">(Ký và ghi rõ họ tên)</div>
              </div>
              <div>
                <div className="font-bold text-slate-700">CHỦ TRANG TRẠI GÀ</div>
                <div className="text-slate-400 text-[10px] mt-1">(Ký xác nhận)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-end gap-3">
          <button
            onClick={() => setIsPdfModalOpen(false)}
            className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100"
          >
            Đóng
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={exporting}
            className="px-5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>{exporting ? 'Đang xử lý PDF...' : 'Tải File PDF Về Máy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
