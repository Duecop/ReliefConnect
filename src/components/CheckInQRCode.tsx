import React, { useEffect, useState } from 'react';
import { QrCode, Download, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

interface CheckInQRCodeProps {
  volunteerId: string;
  volunteerName: string;
  taskId?: string;
  taskTitle?: string;
}

export default function CheckInQRCode({ volunteerId, volunteerName, taskId, taskTitle }: CheckInQRCodeProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateQRCode();
  }, [volunteerId, taskId]);

  const generateQRCode = async () => {
    try {
      setLoading(true);
      
      // Create the data to encode in the QR code
      const checkInData = {
        type: 'volunteer_check_in',
        volunteerId,
        volunteerName,
        taskId: taskId || 'general',
        timestamp: new Date().toISOString(),
      };
      
      // Convert to JSON string
      const jsonData = JSON.stringify(checkInData);
      
      // URL encode the data
      const encodedData = encodeURIComponent(jsonData);
      
      // Generate QR code using a public API
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedData}`;
      
      setQrCodeUrl(qrApiUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `volunteer-checkin-${volunteerId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR code downloaded');
  };

  const copyQRCodeUrl = () => {
    navigator.clipboard.writeText(qrCodeUrl)
      .then(() => toast.success('QR code URL copied to clipboard'))
      .catch(() => toast.error('Failed to copy URL'));
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="text-center mb-3">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center justify-center">
          <QrCode className="h-5 w-5 mr-2 text-primary-500" />
          Check-In QR Code
        </h3>
        <p className="text-sm text-gray-600">
          Scan this code at your assigned location
        </p>
      </div>
      
      <div className="flex justify-center mb-4">
        {loading ? (
          <div className="h-48 w-48 flex items-center justify-center border border-gray-200 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg p-2 shadow-sm">
            <img 
              src={qrCodeUrl} 
              alt="Check-in QR Code" 
              className="h-48 w-48"
            />
          </div>
        )}
      </div>
      
      <div className="bg-gray-50 p-3 rounded-md">
        <h4 className="text-sm font-medium text-gray-800">Volunteer Details</h4>
        <p className="text-sm text-gray-600 mb-1">{volunteerName}</p>
        
        {taskId && taskTitle && (
          <>
            <h4 className="text-sm font-medium text-gray-800 mt-2">Task Assignment</h4>
            <p className="text-sm text-gray-600">{taskTitle}</p>
          </>
        )}
      </div>
      
      <div className="mt-4 flex justify-center gap-3">
        <button
          onClick={downloadQRCode}
          className="px-3 py-2 bg-primary-100 text-primary-700 rounded-md flex items-center hover:bg-primary-200 transition-colors text-sm"
        >
          <Download className="h-4 w-4 mr-1" />
          Download
        </button>
        <button
          onClick={copyQRCodeUrl}
          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md flex items-center hover:bg-gray-200 transition-colors text-sm"
        >
          <Copy className="h-4 w-4 mr-1" />
          Copy Link
        </button>
      </div>
    </div>
  );
} 