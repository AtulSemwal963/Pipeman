import React from 'react';
import { Download } from 'lucide-react';
import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';

interface DownloadButtonProps {
  filename: string;
  className?: string;
  selectedColumns?: string[];
  source?: 'clickhouse' | 'flatfile';
  connectionInfo?: {
    host?: string;
    port?: number;
    database?: string;
    user?: string;
    table?: string;
  };
  delimiter?: string;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
  filename,
  className = '',
  selectedColumns,
  source,
  connectionInfo,
  delimiter = ','
}) => {
  const { toast } = useToast();

  const handleDownload = async () => {
    try {
      // Validate required fields
      if (source === 'clickhouse' && (!connectionInfo || !connectionInfo.table)) {
        toast({
          title: 'Error',
          description: 'Please select a table first',
          variant: 'destructive',
        });
        return;
      }

      if (!selectedColumns?.length) {
        toast({
          title: 'Error',
          description: 'Please select at least one column',
          variant: 'destructive',
        });
        return;
      }

      // Build query parameters
      const params = new URLSearchParams();
      selectedColumns.forEach(col => params.append('columns', col));
      params.append('source', source || 'flatfile');
      params.append('delimiter', delimiter);

      if (connectionInfo && source === 'clickhouse') {
        Object.entries(connectionInfo).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, value.toString());
          }
        });
      }

      console.log('Making request to:', `http://localhost:8000/api/download/${filename}?${params.toString()}`);

      const response = await axios({
        url: `http://localhost:8000/api/download/${filename}?${params.toString()}`,
        method: 'GET',
        responseType: 'blob',
        headers: {
          'Accept': 'text/csv',
          'Content-Type': 'text/csv',
        },
        withCredentials: false,
        timeout: 30000, // 30 second timeout
      });

      if (!response.data) {
        throw new Error('No data received from server');
      }

      // Create blob from response
      const blob = new Blob([response.data], { 
        type: 'text/csv;charset=utf-8;' 
      });
      
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty');
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Success',
        description: 'File downloaded successfully',
      });
    } catch (error: any) {
      console.error('Download error details:', error);
      
      let errorMessage = 'Failed to download file';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.detail || error.message;
        console.error('Axios error response:', error.response);
      }

      toast({
        title: 'Download Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <button
      onClick={handleDownload}
      className={`flex items-center space-x-2 px-4 py-2 rounded-md bg-pipeman-teal text-white hover:bg-pipeman-teal/90 transition-colors ${className}`}
      disabled={!selectedColumns?.length}
    >
      <Download className="w-4 h-4" />
      <span>Download{selectedColumns?.length ? ' Selected' : ''}</span>
    </button>
  );
};

export default DownloadButton; 