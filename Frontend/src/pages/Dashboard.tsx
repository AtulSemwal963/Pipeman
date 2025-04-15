import React, { useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/dashboard/Sidebar';
import MainContent from '@/components/dashboard/MainContent';
import { useToast } from '@/components/ui/use-toast';

interface ClickhouseInputs {
  host: string;
  port: string;
  database: string;
  user: string;
}

interface FileInputs {
  fileName: string;
  delimiter: string;
  file?: File;
}

interface Column {
  name: string;
  selected: boolean;
}

const Dashboard: React.FC = () => {
  const { toast } = useToast();
  const [source, setSource] = useState<'clickhouse' | 'flatfile'>('clickhouse');
  const [target, setTarget] = useState<'clickhouse' | 'flatfile'>('flatfile');
  const [status, setStatus] = useState<'idle' | 'connecting' | 'loading' | 'ingesting' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isColumnsLoaded, setIsColumnsLoaded] = useState<boolean>(false);
  const [clickhouseInputs, setClickhouseInputs] = useState<ClickhouseInputs>({
    host: 'localhost',
    port: '8123',
    database: 'default',
    user: 'default',
  });
  const [fileInputs, setFileInputs] = useState<FileInputs>({
    fileName: '',
    delimiter: 'comma',
    file: undefined,
  });
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [columns, setColumns] = useState<Column[]>([]);
  const [targetTable, setTargetTable] = useState<string>('');
  const [outputFile, setOutputFile] = useState<string>('');
  const [recordCount, setRecordCount] = useState<number | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  const resultMessage = recordCount !== null ? `Ingested ${recordCount} records` : status === 'error' ? 'Ingestion failed' : '';

  const handleSourceChange = (newSource: 'clickhouse' | 'flatfile') => {
    setSource(newSource);
    setTarget(newSource === 'clickhouse' ? 'flatfile' : 'clickhouse');
    setIsConnected(false);
    setIsColumnsLoaded(false);
    setTables([]);
    setColumns([]);
    setSelectedTable('');
    setTargetTable('');
    setOutputFile('');
    setRecordCount(null);
    setPreviewData([]);
    setShowPreview(false);
    setStatus('idle');
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-pipeman-deep-blue dark:text-white">
      <Navbar />
      <div className="container mx-auto px-4 pt-28 pb-10">
        <h1 className="text-3xl font-bold text-pipeman-deep-blue dark:text-white mb-8">Ingestion Dashboard</h1>
        <div className="flex flex-col lg:flex-row gap-6">
          <Sidebar
            source={source}
            setSource={handleSourceChange}
            target={target}
            setTarget={setTarget}
            status={status}
            setStatus={setStatus}
            progress={progress}
            setProgress={setProgress}
            isConnected={isConnected}
            setIsConnected={setIsConnected}
            isColumnsLoaded={isColumnsLoaded}
            setIsColumnsLoaded={setIsColumnsLoaded}
            clickhouseInputs={clickhouseInputs}
            setClickhouseInputs={setClickhouseInputs}
            fileInputs={fileInputs}
            setFileInputs={setFileInputs}
            tables={tables}
            setTables={setTables}
            selectedTable={selectedTable}
            setSelectedTable={setSelectedTable}
            columns={columns}
            setColumns={setColumns}
            targetTable={targetTable}
            setTargetTable={setTargetTable}
            outputFile={outputFile}
            setOutputFile={setOutputFile}
            recordCount={recordCount}
            setRecordCount={setRecordCount}
            previewData={previewData}
            setPreviewData={setPreviewData}
            showPreview={showPreview}
            setShowPreview={setShowPreview}
          />
          <MainContent
            isConnected={isConnected}
            isColumnsLoaded={isColumnsLoaded}
            status={status}
            dataSource={source}
            resultMessage={resultMessage}
            ingestProgress={progress}
            tables={tables}
            setTables={setTables}
            selectedTable={selectedTable}
            setSelectedTable={setSelectedTable}
            columns={columns}
            setColumns={setColumns}
            previewData={previewData}
            showPreview={showPreview}
            setShowPreview={setShowPreview}
            fileInputs={fileInputs}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;