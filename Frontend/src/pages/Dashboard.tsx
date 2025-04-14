
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/dashboard/Sidebar';
import MainContent from '@/components/dashboard/MainContent';
import { useToast } from '@/components/ui/use-toast';

const Dashboard = () => {
  const { toast } = useToast();
  const [source, setSource] = useState<string>('clickhouse');
  const [target, setTarget] = useState<string>('flatfile');
  const [status, setStatus] = useState<'idle' | 'connecting' | 'loading' | 'ingesting' | 'completed' | 'error'>('idle');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isColumnsLoaded, setIsColumnsLoaded] = useState<boolean>(false);
  const [resultMessage, setResultMessage] = useState<string>('');
  const [ingestProgress, setIngestProgress] = useState<number>(0);

  const handleSetSource = (newSource: string) => {
    setSource(newSource);
    // Reset connection state on source change
    setIsConnected(false);
    setIsColumnsLoaded(false);
    setResultMessage('');
  };

  const handleSetTarget = (newTarget: string) => {
    setTarget(newTarget);
  };

  const handleConnect = () => {
    setStatus('connecting');
    
    // Simulate connection
    setTimeout(() => {
      setIsConnected(true);
      setStatus('idle');
      
      toast({
        title: "Connection Successful",
        description: `Connected to ${source === 'clickhouse' ? 'ClickHouse' : 'Flat File'} successfully.`,
      });
    }, 1500);
  };

  const handleLoadColumns = () => {
    setStatus('loading');
    
    // Simulate loading columns
    setTimeout(() => {
      setIsColumnsLoaded(true);
      setStatus('idle');
      
      toast({
        title: "Columns Loaded",
        description: "Schema data loaded successfully.",
      });
    }, 2000);
  };

  const handleStartIngestion = () => {
    setStatus('ingesting');
    setResultMessage('');
    setIngestProgress(0);
    
    // Simulate ingestion with progress updates
    const interval = setInterval(() => {
      setIngestProgress(prev => {
        const newProgress = prev + 10;
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setStatus('completed');
          setResultMessage('Success: 25,000 records ingested');
          return 100;
        }
        
        return newProgress;
      });
    }, 800);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-pipeman-deep-blue dark:text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-28 pb-10">
        <h1 className="text-3xl font-bold text-pipeman-deep-blue dark:text-white mb-8">Ingestion Dashboard</h1>
        
        <div className="flex flex-col lg:flex-row gap-6">
          <Sidebar 
            onSetSource={handleSetSource}
            onSetTarget={handleSetTarget}
            onConnect={handleConnect}
            onLoadColumns={handleLoadColumns}
            onStartIngestion={handleStartIngestion}
            status={status}
            source={source}
            target={target}
            isConnected={isConnected}
            isColumnsLoaded={isColumnsLoaded}
          />
          
          <MainContent 
            isConnected={isConnected}
            isColumnsLoaded={isColumnsLoaded}
            status={status}
            dataSource={source}
            resultMessage={resultMessage}
            ingestProgress={ingestProgress}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
