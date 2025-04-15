import React from 'react';
import { Check, ChevronDown, FileText, Database, Eye } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import DownloadButton from './DownloadButton';

interface Column {
  name: string;
  selected: boolean;
}

interface FileInputs {
  fileName: string;
  delimiter: string;
  file?: File;
}

interface MainContentProps {
  isConnected: boolean;
  isColumnsLoaded: boolean;
  status: string;
  dataSource: 'clickhouse' | 'flatfile';
  resultMessage: string;
  ingestProgress: number;
  tables: string[];
  setTables: React.Dispatch<React.SetStateAction<string[]>>;
  selectedTable: string;
  setSelectedTable: React.Dispatch<React.SetStateAction<string>>;
  columns: Column[];
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>;
  previewData: any[];
  showPreview: boolean;
  setShowPreview: React.Dispatch<React.SetStateAction<boolean>>;
  fileInputs: FileInputs; // Added
}

const MainContent: React.FC<MainContentProps> = ({
  isConnected,
  isColumnsLoaded,
  status,
  dataSource,
  resultMessage,
  ingestProgress,
  tables,
  setTables,
  selectedTable,
  setSelectedTable,
  columns,
  setColumns,
  previewData,
  showPreview,
  setShowPreview,
  fileInputs,
}) => {
  const toggleColumnSelection = (colName: string) => {
    setColumns((cols) => cols.map((col) => (col.name === colName ? { ...col, selected: !col.selected } : col)));
  };

  const toggleSelectAll = () => {
    const allSelected = columns.every((col) => col.selected);
    setColumns((cols) => cols.map((col) => ({ ...col, selected: !allSelected })));
  };

  const handleTableSelect = (table: string) => {
    setSelectedTable(table);
    setTables([]); // Close dropdown
  };

  const validateFileName = (fileName: string) => {
    return /^[a-zA-Z0-9_\-\.]+$/.test(fileName);
  };

  const validateTableName = (tableName: string) => {
    return /^[a-zA-Z0-9_]+$/.test(tableName);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 w-full animate-fade-in">
      {!isConnected ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-pipeman-grey dark:text-white/70 mb-4">Connect to a data source to begin</div>
          {dataSource === 'clickhouse' ? (
            <Database className="w-16 h-16 text-pipeman-blue-grey-border dark:text-gray-600" />
          ) : (
            <FileText className="w-16 h-16 text-pipeman-blue-grey-border dark:text-gray-600" />
          )}
        </div>
      ) : !isColumnsLoaded ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-pipeman-grey dark:text-white/70 mb-4">Click 'Load Columns' to fetch schema</div>
        </div>
      ) : (
        <div className="animate-fade-in">
          {/* Table Selection for ClickHouse */}
          {dataSource === 'clickhouse' && (
            <div className="mb-6">
              <label className="block text-pipeman-grey dark:text-white/70 text-sm font-medium mb-2">
                Select Table
              </label>
              <div className="relative">
                <button
                  className="w-full text-left flex items-center justify-between px-3 py-2 rounded-md border border-pipeman-blue-grey-border dark:border-gray-600 bg-white dark:bg-gray-700 text-pipeman-grey dark:text-white"
                  onClick={() => setTables(tables.length ? [] : tables)}
                >
                  <span>{selectedTable || 'Select a table'}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {tables.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-pipeman-blue-grey-border dark:border-gray-600 rounded-lg shadow-lg animate-fade-in">
                    {tables.map((table) => (
                      <div
                        key={table}
                        className="px-4 py-2 hover:bg-pipeman-light-grey dark:hover:bg-gray-600 cursor-pointer text-pipeman-deep-blue dark:text-white"
                        onClick={() => handleTableSelect(table)}
                      >
                        {table}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Flat File Schema Display */}
          {dataSource === 'flatfile' && (
            <div className="mb-6">
              <div className="p-3 bg-pipeman-light-grey dark:bg-gray-700 rounded-lg flex items-center">
                <FileText className="w-5 h-5 text-pipeman-deep-blue dark:text-white mr-2" />
                <span className="text-pipeman-deep-blue dark:text-white font-medium">
                  {fileInputs.fileName || 'Uploaded File'}
                </span>
                {fileInputs.fileName && !validateFileName(fileInputs.fileName) && (
                  <span className="ml-2 text-pipeman-red text-sm">Invalid filename</span>
                )}
              </div>
            </div>
          )}

          {!showPreview ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-pipeman-deep-blue dark:text-white">Columns</h3>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded text-pipeman-teal focus:ring-pipeman-teal dark:bg-gray-700 dark:border-gray-500"
                      checked={columns.every((col) => col.selected)}
                      onChange={toggleSelectAll}
                    />
                    <span className="text-sm text-pipeman-grey dark:text-white/70">Select All</span>
                  </label>
                  <button
                    className="flex items-center text-pipeman-deep-blue dark:text-pipeman-teal hover:text-pipeman-deep-blue-hover dark:hover:text-opacity-80"
                    onClick={() => setShowPreview(true)}
                    disabled={!columns.some((col) => col.selected)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    <span className="text-sm">Preview</span>
                  </button>
                </div>
              </div>
              <div className="border border-pipeman-blue-grey-border dark:border-gray-600 rounded-lg overflow-hidden">
                <div className="grid grid-cols-12 bg-pipeman-light-blue-grey dark:bg-gray-700 p-3">
                  <div className="col-span-1"></div>
                  <div className="col-span-11 font-medium text-pipeman-deep-blue dark:text-white">Name</div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {columns.map((column, index) => (
                    <div
                      key={column.name}
                      className={`grid grid-cols-12 p-3 items-center hover:bg-pipeman-light-grey dark:hover:bg-gray-700 transition-colors duration-200 ${
                        index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-pipeman-light-grey/30 dark:bg-gray-800/60'
                      }`}
                    >
                      <div className="col-span-1">
                        <input
                          type="checkbox"
                          className="rounded text-pipeman-teal focus:ring-pipeman-teal dark:bg-gray-700 dark:border-gray-500"
                          checked={column.selected}
                          onChange={() => toggleColumnSelection(column.name)}
                        />
                      </div>
                      <div className="col-span-11 text-pipeman-deep-blue dark:text-white">{column.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-pipeman-deep-blue dark:text-white">Data Preview</h3>
                <DownloadButton 
                  filename={selectedTable || 'data.csv'} 
                  selectedColumns={columns.filter(col => col.selected).map(col => col.name)}
                  source={dataSource}
                  connectionInfo={dataSource === 'clickhouse' ? {
                    host: 'localhost', // These should come from your connection state
                    port: 8123,
                    database: 'default',
                    user: 'default',
                    table: selectedTable
                  } : undefined}
                  delimiter={dataSource === 'flatfile' ? ',' : undefined}
                />
                <button
                  className="text-pipeman-deep-blue dark:text-pipeman-teal hover:text-pipeman-deep-blue-hover dark:hover:text-opacity-80 text-sm"
                  onClick={() => setShowPreview(false)}
                >
                  Back to Columns
                </button>
              </div>
              <div className="border border-pipeman-blue-grey-border dark:border-gray-600 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-pipeman-light-blue-grey dark:bg-gray-700">
                      {columns
                        .filter((col) => col.selected)
                        .map((col) => (
                          <TableHead key={col.name} className="text-pipeman-deep-blue dark:text-white">
                            {col.name}
                          </TableHead>
                        ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.length > 0 ? (
                      previewData.map((row, idx) => (
                        <TableRow
                          key={idx}
                          className={idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-pipeman-light-grey/30 dark:bg-gray-800/60'}
                        >
                          {row.map((value: any, vidx: number) => (
                            <TableCell key={vidx} className="text-pipeman-grey dark:text-white/70">
                              {value === null ? 'NULL' : value.toString()}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columns.filter((col) => col.selected).length} className="text-center">
                          No data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Status and Results */}
          {status === 'ingesting' && (
            <div className="mt-6 animate-fade-in">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-pipeman-grey dark:text-white/70">Ingestion in progress</span>
                <span className="text-sm font-medium dark:text-white">{ingestProgress}%</span>
              </div>
              <Progress value={ingestProgress} className="h-2 bg-gray-200 dark:bg-gray-700" />
            </div>
          )}
          {resultMessage && (
            <div
              className={`mt-6 p-4 rounded-lg flex items-center animate-fade-in ${
                status === 'completed' ? 'bg-pipeman-green' : 'bg-pipeman-red'
              }`}
            >
              {status === 'completed' ? (
                <Check className="w-5 h-5 text-white mr-2" />
              ) : (
                <span className="w-5 h-5 text-white mr-2">!</span>
              )}
              <span className="text-white">{resultMessage}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MainContent;