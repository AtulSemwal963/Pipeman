import React, { useCallback } from 'react';
import { ChevronDown, Database, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import axios from 'axios';

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

interface SidebarProps {
  source: 'clickhouse' | 'flatfile';
  setSource: React.Dispatch<React.SetStateAction<'clickhouse' | 'flatfile'>>;
  target: 'clickhouse' | 'flatfile';
  setTarget: React.Dispatch<React.SetStateAction<'clickhouse' | 'flatfile'>>;
  status: 'idle' | 'connecting' | 'loading' | 'ingesting' | 'completed' | 'error';
  setStatus: React.Dispatch<React.SetStateAction<'idle' | 'connecting' | 'loading' | 'ingesting' | 'completed' | 'error'>>;
  progress: number;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
  isConnected: boolean;
  setIsConnected: React.Dispatch<React.SetStateAction<boolean>>;
  isColumnsLoaded: boolean;
  setIsColumnsLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  clickhouseInputs: ClickhouseInputs;
  setClickhouseInputs: React.Dispatch<React.SetStateAction<ClickhouseInputs>>;
  fileInputs: FileInputs;
  setFileInputs: React.Dispatch<React.SetStateAction<FileInputs>>;
  tables: string[];
  setTables: React.Dispatch<React.SetStateAction<string[]>>;
  selectedTable: string;
  setSelectedTable: React.Dispatch<React.SetStateAction<string>>;
  columns: Column[];
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>;
  targetTable: string;
  setTargetTable: React.Dispatch<React.SetStateAction<string>>;
  outputFile: string;
  setOutputFile: React.Dispatch<React.SetStateAction<string>>;
  recordCount: number | null;
  setRecordCount: React.Dispatch<React.SetStateAction<number | null>>;
  previewData: any[];
  setPreviewData: React.Dispatch<React.SetStateAction<any[]>>;
  showPreview: boolean;
  setShowPreview: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({
  source,
  setSource,
  target,
  setTarget,
  status,
  setStatus,
  progress,
  setProgress,
  isConnected,
  setIsConnected,
  isColumnsLoaded,
  setIsColumnsLoaded,
  clickhouseInputs,
  setClickhouseInputs,
  fileInputs,
  setFileInputs,
  tables,
  setTables,
  selectedTable,
  setSelectedTable,
  columns,
  setColumns,
  targetTable,
  setTargetTable,
  outputFile,
  setOutputFile,
  recordCount,
  setRecordCount,
  previewData,
  setPreviewData,
  showPreview,
  setShowPreview,
}) => {
  const { toast } = useToast();
  const baseUrl = 'http://localhost:8000';

  const handleClickhouseInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClickhouseInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFileInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileInputs((prev) => ({ ...prev, fileName: file.name, file }));
    }
  };

  const handleSourceChange = (newSource: 'clickhouse' | 'flatfile') => {
    if (source !== newSource) {
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
    }
  };

  const uploadFile = useCallback(async () => {
    if (!fileInputs.file) {
      toast({
        title: 'Validation Error',
        description: 'Please select a file',
        variant: 'destructive',
      });
      return false;
    }
    const formData = new FormData();
    formData.append('file', fileInputs.file);
    try {
      setStatus('connecting');
      const response = await axios.post(`${baseUrl}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFileInputs((prev) => ({ ...prev, fileName: response.data.filename }));
      return true;
    } catch (error: any) {
      setStatus('error');
      toast({
        title: 'Upload Error',
        description: error.response?.data?.detail || 'Failed to upload file',
        variant: 'destructive',
      });
      return false;
    }
  }, [fileInputs.file, setFileInputs, setStatus, toast]);

  const handleConnect = useCallback(async () => {
    if (source === 'clickhouse') {
      if (!clickhouseInputs.host || !clickhouseInputs.port || !clickhouseInputs.database) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required ClickHouse fields',
          variant: 'destructive',
        });
        return;
      }
      try {
        setStatus('connecting');
        const response = await axios.post(`${baseUrl}/api/tables`, {
          source: 'clickhouse',
          host: clickhouseInputs.host,
          port: clickhouseInputs.port,
          database: clickhouseInputs.database,
          user: clickhouseInputs.user,
        });
        setTables(response.data.tables);
        setIsConnected(true);
        setStatus('idle');
        toast({
          title: 'Success',
          description: 'Connected to ClickHouse',
        });
      } catch (error: any) {
        setStatus('error');
        toast({
          title: 'Connection Error',
          description: error.response?.data?.detail || 'Failed to connect to ClickHouse',
          variant: 'destructive',
        });
      }
    } else {
      const uploaded = await uploadFile();
      if (uploaded) {
        setIsConnected(true);
        setStatus('idle');
        toast({
          title: 'Success',
          description: 'File uploaded successfully',
        });
      }
    }
  }, [clickhouseInputs, source, uploadFile, setTables, setIsConnected, setStatus, toast]);

  const handleLoadColumns = useCallback(async () => {
    try {
      setStatus('loading');
      if (source === 'clickhouse') {
        if (!selectedTable) {
          toast({
            title: 'Validation Error',
            description: 'Please select a table',
            variant: 'destructive',
          });
          setStatus('idle');
          return;
        }
        const response = await axios.post(
          `${baseUrl}/api/columns`,
          {
            source: 'clickhouse',
            host: clickhouseInputs.host,
            port: clickhouseInputs.port,
            database: clickhouseInputs.database,
            user: clickhouseInputs.user,
          },
          { params: { table: selectedTable } }
        );
        setColumns(response.data.columns.map((name: string) => ({ name, selected: true })));
      } else {
        if (!fileInputs.fileName) {
          toast({
            title: 'Validation Error',
            description: 'Please upload a file',
            variant: 'destructive',
          });
          setStatus('idle');
          return;
        }
        const response = await axios.post(`${baseUrl}/api/columns`, {
          source: 'flatfile',
          filename: fileInputs.fileName,
          delimiter:
            fileInputs.delimiter === 'comma'
              ? ','
              : fileInputs.delimiter === 'tab'
              ? '\t'
              : fileInputs.delimiter === 'semicolon'
              ? ';'
              : '|',
        });
        setColumns(response.data.columns.map((name: string) => ({ name, selected: true })));
      }
      setIsColumnsLoaded(true);
      setStatus('idle');
      toast({
        title: 'Success',
        description: 'Columns loaded successfully',
      });
    } catch (error: any) {
      setStatus('error');
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to load columns',
        variant: 'destructive',
      });
    }
  }, [clickhouseInputs, fileInputs, source, selectedTable, setColumns, setIsColumnsLoaded, setStatus, toast]);

  const handlePreview = useCallback(async () => {
    try {
      setStatus('loading');
      const selectedColumns = columns.filter((col) => col.selected).map((col) => col.name);
      if (!selectedColumns.length) {
        toast({
          title: 'Validation Error',
          description: 'Please select at least one column',
          variant: 'destructive',
        });
        setStatus('idle');
        return;
      }
      let response;
      if (source === 'clickhouse') {
        response = await axios.post(`${baseUrl}/api/preview`, {
          source: 'clickhouse',
          host: clickhouseInputs.host,
          port: clickhouseInputs.port,
          database: clickhouseInputs.database,
          user: clickhouseInputs.user,
          table: selectedTable,
          columns: selectedColumns,
        });
      } else {
        response = await axios.post(`${baseUrl}/api/preview`, {
          source: 'flatfile',
          filename: fileInputs.fileName,
          delimiter:
            fileInputs.delimiter === 'comma'
              ? ','
              : fileInputs.delimiter === 'tab'
              ? '\t'
              : fileInputs.delimiter === 'semicolon'
              ? ';'
              : '|',
          columns: selectedColumns,
        });
      }
      setPreviewData(response.data.data);
      setShowPreview(true);
      setStatus('idle');
      toast({
        title: 'Success',
        description: 'Preview loaded successfully',
      });
    } catch (error: any) {
      setStatus('error');
      toast({
        title: 'Preview Error',
        description: error.response?.data?.detail || 'Failed to load preview',
        variant: 'destructive',
      });
    }
  }, [clickhouseInputs, fileInputs, source, selectedTable, columns, setPreviewData, setShowPreview, setStatus, toast]);

  const handleStartIngestion = useCallback(async () => {
    try {
      setStatus('ingesting');
      setProgress(0);
      const selectedColumns = columns.filter((col) => col.selected).map((col) => col.name);
      if (!selectedColumns.length) {
        toast({
          title: 'Validation Error',
          description: 'Please select at least one column',
          variant: 'destructive',
        });
        setStatus('idle');
        return;
      }

      // Validate filenames and table names
      if (source === 'clickhouse' && !validateTableName(selectedTable)) {
        toast({
          title: 'Validation Error',
          description: 'Invalid table name. Only alphanumeric characters and underscores are allowed.',
          variant: 'destructive',
        });
        setStatus('idle');
        return;
      }

      if (source === 'flatfile' && !validateFileName(fileInputs.fileName)) {
        toast({
          title: 'Validation Error',
          description: 'Invalid filename. Only alphanumeric characters, underscores, hyphens, and dots are allowed.',
          variant: 'destructive',
        });
        setStatus('idle');
        return;
      }

      let response;
      if (source === 'clickhouse') {
        if (!outputFile) {
          toast({
            title: 'Validation Error',
            description: 'Please enter an output file name',
            variant: 'destructive',
          });
          setStatus('idle');
          return;
        }
        if (!validateFileName(outputFile)) {
          toast({
            title: 'Validation Error',
            description: 'Invalid output filename. Only alphanumeric characters, underscores, hyphens, and dots are allowed.',
            variant: 'destructive',
          });
          setStatus('idle');
          return;
        }
        response = await axios.post(`${baseUrl}/api/ingest`, {
          source: 'clickhouse',
          host: clickhouseInputs.host,
          port: clickhouseInputs.port,
          database: clickhouseInputs.database,
          user: clickhouseInputs.user,
          table: selectedTable,
          columns: selectedColumns,
          output_file: outputFile,
          delimiter:
            fileInputs.delimiter === 'comma'
              ? ','
              : fileInputs.delimiter === 'tab'
              ? '\t'
              : fileInputs.delimiter === 'semicolon'
              ? ';'
              : '|',
        });
      } else {
        if (!targetTable) {
          toast({
            title: 'Validation Error',
            description: 'Please enter a target table name',
            variant: 'destructive',
          });
          setStatus('idle');
          return;
        }
        if (!validateTableName(targetTable)) {
          toast({
            title: 'Validation Error',
            description: 'Invalid target table name. Only alphanumeric characters and underscores are allowed.',
            variant: 'destructive',
          });
          setStatus('idle');
          return;
        }
        if (!isConnected) {
          const uploaded = await uploadFile();
          if (!uploaded) {
            setStatus('error');
            return;
          }
          setIsConnected(true);
        }
        response = await axios.post(`${baseUrl}/api/ingest`, {
          source: 'flatfile',
          filename: fileInputs.fileName,
          delimiter:
            fileInputs.delimiter === 'comma'
              ? ','
              : fileInputs.delimiter === 'tab'
              ? '\t'
              : fileInputs.delimiter === 'semicolon'
              ? ';'
              : '|',
          host: clickhouseInputs.host,
          port: clickhouseInputs.port,
          database: clickhouseInputs.database,
          user: clickhouseInputs.user,
          table: targetTable,
          columns: selectedColumns,
        });
      }
      setRecordCount(response.data.record_count);
      setProgress(100);
      setStatus('completed');
      toast({
        title: 'Success',
        description: `Ingested ${response.data.record_count} records`,
      });
    } catch (error: any) {
      setStatus('error');
      toast({
        title: 'Ingestion Error',
        description: error.response?.data?.detail || 'Failed to ingest data',
        variant: 'destructive',
      });
    }
  }, [
    clickhouseInputs,
    fileInputs,
    source,
    selectedTable,
    targetTable,
    outputFile,
    columns,
    isConnected,
    uploadFile,
    setRecordCount,
    setProgress,
    setStatus,
    setIsConnected,
    toast,
  ]);

  const validateFileName = (fileName: string) => {
    return /^[a-zA-Z0-9_\-\.]+$/.test(fileName);
  };

  const validateTableName = (tableName: string) => {
    return /^[a-zA-Z0-9_]+$/.test(tableName);
  };

  const toggleColumnSelection = (columnName: string) => {
    setColumns((prev) =>
      prev.map((col) => (col.name === columnName ? { ...col, selected: !col.selected } : col))
    );
  };

  const getStatusClass = () => {
    switch (status) {
      case 'connecting':
      case 'loading':
      case 'ingesting':
        return 'bg-pipeman-teal text-white animate-pulse';
      case 'completed':
        return 'bg-pipeman-green text-white';
      case 'error':
        return 'bg-pipeman-red text-white';
      default:
        return 'bg-pipeman-light-grey dark:bg-pipeman-deep-blue-hover text-pipeman-grey dark:text-white/70';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connecting':
        return 'Connecting...';
      case 'loading':
        return 'Loading Columns...';
      case 'ingesting':
        return 'Ingesting Data...';
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Error';
      default:
        return 'Idle';
    }
  };

  return (
    <div className="bg-pipeman-light-grey dark:bg-gray-800 w-full lg:w-80 p-6 rounded-lg shadow-md animate-fade-in">
      <h2 className="text-xl font-bold text-pipeman-deep-blue dark:text-white mb-6">Data Configuration</h2>

      {/* Source Selection */}
      <div className="mb-6">
        <label className="block text-pipeman-grey dark:text-white/70 text-sm font-medium mb-2">
          Data Source
        </label>
        <div className="flex space-x-4">
          <button
            className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
              source === 'clickhouse'
                ? 'bg-pipeman-deep-blue dark:bg-pipeman-teal text-white'
                : 'bg-white dark:bg-gray-700 border border-pipeman-blue-grey-border dark:border-gray-600 text-pipeman-grey dark:text-white/70'
            }`}
            onClick={() => handleSourceChange('clickhouse')}
          >
            <Database className="w-4 h-4 mr-2" />
            ClickHouse
          </button>
          <button
            className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
              source === 'flatfile'
                ? 'bg-pipeman-deep-blue dark:bg-pipeman-teal text-white'
                : 'bg-white dark:bg-gray-700 border border-pipeman-blue-grey-border dark:border-gray-600 text-pipeman-grey dark:text-white/70'
            }`}
            onClick={() => handleSourceChange('flatfile')}
          >
            <FileText className="w-4 h-4 mr-2" />
            Flat File
          </button>
        </div>
      </div>

      {/* ClickHouse Inputs */}
      {(source === 'clickhouse' || target === 'clickhouse') && (
        <div className="mb-6 animate-fade-in">
          <h3 className="text-md font-semibold text-pipeman-deep-blue dark:text-white mb-4">
            ClickHouse {source === 'clickhouse' ? 'Source' : 'Target'} Configuration
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-pipeman-grey dark:text-white/70 text-sm font-medium mb-1">
                Host <span className="text-pipeman-red">*</span>
              </label>
              <input
                type="text"
                name="host"
                value={clickhouseInputs.host}
                onChange={handleClickhouseInputChange}
                placeholder="localhost"
                className="w-full px-3 py-2 rounded-md border border-pipeman-blue-grey-border dark:border-gray-600 bg-white dark:bg-gray-700 text-pipeman-grey dark:text-white focus:outline-none focus:ring-2 focus:ring-pipeman-teal"
              />
            </div>
            <div>
              <label className="block text-pipeman-grey dark:text-white/70 text-sm font-medium mb-1">
                Port <span className="text-pipeman-red">*</span>
              </label>
              <input
                type="text"
                name="port"
                value={clickhouseInputs.port}
                onChange={handleClickhouseInputChange}
                placeholder="8123"
                className="w-full px-3 py-2 rounded-md border border-pipeman-blue-grey-border dark:border-gray-600 bg-white dark:bg-gray-700 text-pipeman-grey dark:text-white focus:outline-none focus:ring-2 focus:ring-pipeman-teal"
              />
            </div>
            <div>
              <label className="block text-pipeman-grey dark:text-white/70 text-sm font-medium mb-1">
                Database <span className="text-pipeman-red">*</span>
              </label>
              <input
                type="text"
                name="database"
                value={clickhouseInputs.database}
                onChange={handleClickhouseInputChange}
                placeholder="default"
                className="w-full px-3 py-2 rounded-md border border-pipeman-blue-grey-border dark:border-gray-600 bg-white dark:bg-gray-700 text-pipeman-grey dark:text-white focus:outline-none focus:ring-2 focus:ring-pipeman-teal"
              />
            </div>
            <div>
              <label className="block text-pipeman-grey dark:text-white/70 text-sm font-medium mb-1">
                User
              </label>
              <input
                type="text"
                name="user"
                value={clickhouseInputs.user}
                onChange={handleClickhouseInputChange}
                placeholder="default"
                className="w-full px-3 py-2 rounded-md border border-pipeman-blue-grey-border dark:border-gray-600 bg-white dark:bg-gray-700 text-pipeman-grey dark:text-white focus:outline-none focus:ring-2 focus:ring-pipeman-teal"
              />
            </div>
            {source === 'clickhouse' && (
              <div>
                <label className="block text-pipeman-grey dark:text-white/70 text-sm font-medium mb-1">
                  Table <span className="text-pipeman-red">*</span>
                </label>
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-pipeman-blue-grey-border dark:border-gray-600 bg-white dark:bg-gray-700 text-pipeman-grey dark:text-white focus:outline-none focus:ring-2 focus:ring-pipeman-teal"
                >
                  <option value="">Select a table</option>
                  {tables.map((table) => (
                    <option key={table} value={table}>
                      {table}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {target === 'clickhouse' && (
              <div>
                <label className="block text-pipeman-grey dark:text-white/70 text-sm font-medium mb-1">
                  Target Table <span className="text-pipeman-red">*</span>
                </label>
                <input
                  type="text"
                  value={targetTable}
                  onChange={(e) => setTargetTable(e.target.value)}
                  placeholder="new_table"
                  className="w-full px-3 py-2 rounded-md border border-pipeman-blue-grey-border dark:border-gray-600 bg-white dark:bg-gray-700 text-pipeman-grey dark:text-white focus:outline-none focus:ring-2 focus:ring-pipeman-teal"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Flat File Inputs */}
      {(source === 'flatfile' || target === 'flatfile') && (
        <div className="mb-6 animate-fade-in">
          <h3 className="text-md font-semibold text-pipeman-deep-blue dark:text-white mb-4">
            Flat File {source === 'flatfile' ? 'Source' : 'Target'} Configuration
          </h3>
          <div className="space-y-4">
            {source === 'flatfile' && (
              <div>
                <label className="block text-pipeman-grey dark:text-white/70 text-sm font-medium mb-1">
                  File <span className="text-pipeman-red">*</span>
                </label>
                <div className="flex flex-col space-y-2">
                  <label className="bg-pipeman-deep-blue dark:bg-pipeman-teal text-white px-3 py-2 rounded-lg cursor-pointer hover:bg-pipeman-deep-blue-hover dark:hover:bg-opacity-90 transition-colors duration-200 text-center">
                    Choose File
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept=".csv,.tsv,.txt,.xlsx"
                    />
                  </label>
                  {fileInputs.fileName && (
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-pipeman-deep-blue dark:text-white" />
                      <span className="text-pipeman-grey dark:text-white/70 text-sm truncate max-w-[180px]">
                        {fileInputs.fileName}
                      </span>
                      {!validateFileName(fileInputs.fileName) && (
                        <span className="text-pipeman-red text-sm">Invalid filename</span>
                      )}
                    </div>
                  )}
                  {!fileInputs.fileName && (
                    <span className="text-pipeman-grey dark:text-white/70 text-sm">
                      No file selected
                    </span>
                  )}
                </div>
              </div>
            )}
            <div>
              <label className="block text-pipeman-grey dark:text-white/70 text-sm font-medium mb-1">
                Delimiter
              </label>
              <select
                name="delimiter"
                value={fileInputs.delimiter}
                onChange={handleFileInputChange}
                className="w-full px-3 py-2 rounded-md border border-pipeman-blue-grey-border dark:border-gray-600 bg-white dark:bg-gray-700 text-pipeman-grey dark:text-white focus:outline-none focus:ring-2 focus:ring-pipeman-teal"
              >
                <option value="comma">Comma (,)</option>
                <option value="tab">Tab (\t)</option>
                <option value="semicolon">Semicolon (;)</option>
                <option value="pipe">Pipe (|)</option>
              </select>
            </div>
            {target === 'flatfile' && (
              <div>
                <label className="block text-pipeman-grey dark:text-white/70 text-sm font-medium mb-1">
                  Output File <span className="text-pipeman-red">*</span>
                </label>
                <input
                  type="text"
                  value={outputFile}
                  onChange={(e) => setOutputFile(e.target.value)}
                  placeholder="output.csv"
                  className="w-full px-3 py-2 rounded-md border border-pipeman-blue-grey-border dark:border-gray-600 bg-white dark:bg-gray-700 text-pipeman-grey dark:text-white focus:outline-none focus:ring-2 focus:ring-pipeman-teal"
                />
                {outputFile && !validateFileName(outputFile) && (
                  <span className="text-pipeman-red text-sm mt-1 block">
                    Invalid filename. Only alphanumeric characters, underscores, hyphens, and dots are allowed.
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Column Selection */}
      {isColumnsLoaded && (
        <div className="mb-6">
          <h3 className="text-md font-semibold text-pipeman-deep-blue dark:text-white mb-4">Select Columns</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {columns.map((column) => (
              <div key={column.name} className="flex items-center">
                <input
                  type="checkbox"
                  checked={column.selected}
                  onChange={() => toggleColumnSelection(column.name)}
                  className="h-4 w-4 text-pipeman-teal focus:ring-pipeman-teal border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-pipeman-grey dark:text-white/70">{column.name}</label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-4">
        <button
          className="w-full px-4 py-2 rounded-lg bg-pipeman-deep-blue dark:bg-pipeman-teal text-white font-medium transition-all duration-200 hover:bg-pipeman-deep-blue-hover dark:hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleConnect}
        >
          Connect
        </button>
        <button
          className="w-full px-4 py-2 rounded-lg bg-pipeman-deep-blue dark:bg-pipeman-teal text-white font-medium transition-all duration-200 hover:bg-pipeman-deep-blue-hover dark:hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleLoadColumns}
          disabled={!isConnected || (source === 'clickhouse' && !selectedTable)}
        >
          Load Columns
        </button>
        <button
          className="w-full px-4 py-2 rounded-lg bg-pipeman-deep-blue dark:bg-pipeman-teal text-white font-medium transition-all duration-200 hover:bg-pipeman-deep-blue-hover dark:hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handlePreview}
          disabled={!isColumnsLoaded}
        >
          Preview
        </button>
        <button
          className="w-full px-4 py-2 rounded-lg bg-pipeman-deep-blue dark:bg-pipeman-teal text-white font-medium transition-all duration-200 hover:bg-pipeman-deep-blue-hover dark:hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleStartIngestion}
          disabled={!isColumnsLoaded}
        >
          Start Ingestion
        </button>
      </div>

      {/* Status and Progress */}
      <div className="mt-6">
        <div className={`px-4 py-2 rounded-full text-center text-sm font-medium ${getStatusClass()}`}>
          {getStatusText()}
        </div>
        {status === 'ingesting' && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-pipeman-grey dark:text-white/70 mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
        {recordCount !== null && (
          <div className="mt-4 text-sm text-pipeman-grey dark:text-white/70">
            Records Ingested: {recordCount}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;