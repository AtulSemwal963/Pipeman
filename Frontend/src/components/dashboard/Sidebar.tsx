import React, { useState } from 'react';
import { ChevronDown, Database, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';

interface SidebarProps {
  onSetSource: (source: string) => void;
  onSetTarget: (target: string) => void;
  onConnect: () => void;
  onLoadColumns: () => void;
  onStartIngestion: () => void;
  status: 'idle' | 'connecting' | 'loading' | 'ingesting' | 'completed' | 'error';
  source: string;
  target: string;
  isConnected: boolean;
  isColumnsLoaded: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  onSetSource,
  onSetTarget,
  onConnect,
  onLoadColumns,
  onStartIngestion,
  status,
  source,
  target,
  isConnected,
  isColumnsLoaded,
}) => {
  const { toast } = useToast();
  const [clickhouseInputs, setClickhouseInputs] = useState({
    host: 'localhost',
    port: '9440',
    database: 'default',
    user: 'admin',
    jwt: ''
  });
  const [fileInputs, setFileInputs] = useState({
    fileName: '',
    delimiter: 'comma'
  });

  const handleClickhouseInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClickhouseInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFileInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileInputs(prev => ({ ...prev, fileName: e.target.files![0].name }));
    }
  };

  const handleSourceChange = (newSource: string) => {
    if (source !== newSource) {
      onSetSource(newSource);
      onSetTarget(newSource === 'clickhouse' ? 'flatfile' : 'clickhouse');
    }
  };

  const handleConnect = () => {
    if (source === 'clickhouse' && !clickhouseInputs.host) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid host",
        variant: "destructive",
      });
      return;
    }
    
    if (source === 'flatfile' && !fileInputs.fileName) {
      toast({
        title: "Validation Error",
        description: "Please select a file",
        variant: "destructive",
      });
      return;
    }
    
    onConnect();
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
      
      {/* ClickHouse Inputs for Source */}
      {source === 'clickhouse' && (
        <div className="mb-6 animate-fade-in">
          <h3 className="text-md font-semibold text-pipeman-deep-blue dark:text-white mb-4">ClickHouse Connection</h3>
          
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
                placeholder="9440"
                className="data-input w-full"
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
                className="data-input w-full"
              />
            </div>
            
            <div>
              <label className="block text-pipeman-grey dark:text-white/70 text-sm font-medium mb-1">
                User <span className="text-pipeman-red">*</span>
              </label>
              <input
                type="text"
                name="user"
                value={clickhouseInputs.user}
                onChange={handleClickhouseInputChange}
                placeholder="admin"
                className="data-input w-full"
              />
            </div>
            
            <div>
              <label className="block text-pipeman-grey dark:text-white/70 text-sm font-medium mb-1">
                JWT Token <span className="text-pipeman-red">*</span>
              </label>
              <input
                type="password"
                name="jwt"
                value={clickhouseInputs.jwt}
                onChange={handleClickhouseInputChange}
                placeholder="Enter JWT token"
                className="data-input w-full"
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Flat File Inputs for Source */}
      {source === 'flatfile' && (
        <div className="mb-6 animate-fade-in">
          <h3 className="text-md font-semibold text-pipeman-deep-blue dark:text-white mb-4">Flat File Configuration</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-pipeman-grey dark:text-white/70 text-sm font-medium mb-1">
                File <span className="text-pipeman-red">*</span>
              </label>
              <div className="flex items-center space-x-2">
                <label className="bg-pipeman-deep-blue dark:bg-pipeman-teal text-white px-3 py-2 rounded-lg cursor-pointer hover:bg-pipeman-deep-blue-hover dark:hover:bg-opacity-90 transition-colors duration-200">
                  Choose File
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".csv,.tsv,.txt"
                  />
                </label>
                <span className="text-pipeman-grey dark:text-white/70 text-sm truncate max-w-[180px]">
                  {fileInputs.fileName || "No file selected"}
                </span>
              </div>
            </div>
            
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
          </div>
        </div>
      )}
      
      {/* Target Configuration */}
      <div className="mb-6">
        <h3 className="text-md font-semibold text-pipeman-deep-blue dark:text-white mb-4">Target: {target === 'clickhouse' ? 'ClickHouse' : 'Flat File'}</h3>
        
        {/* Target specific inputs would go here */}
        {/* Simplified for this example */}
      </div>
      
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
          onClick={onLoadColumns}
          disabled={!isConnected}
        >
          Load Columns
        </button>
        
        <button 
          className="w-full px-4 py-2 rounded-lg bg-pipeman-deep-blue dark:bg-pipeman-teal text-white font-medium transition-all duration-200 hover:bg-pipeman-deep-blue-hover dark:hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onStartIngestion}
          disabled={!isColumnsLoaded}
        >
          Start Ingestion
        </button>
      </div>
      
      {/* Status Display */}
      <div className="mt-6">
        <div className={`px-4 py-2 rounded-full text-center text-sm font-medium ${getStatusClass()}`}>
          {getStatusText()}
        </div>
        
        {/* Progress bar for ingestion status */}
        {status === 'ingesting' && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-pipeman-grey dark:text-white/70 mb-1">
              <span>Progress</span>
              <span>{ingestProgress}%</span>
            </div>
            <Progress value={ingestProgress} className="h-2" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
