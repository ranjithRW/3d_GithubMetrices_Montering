import { useState, useEffect } from 'react';
import ManModel from './Modelpage'

export default function GitHubMetricsViewer() {
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        'https://githubmetricsbackend-erdfgta5drc3dzev.eastus-01.azurewebsites.net/v1/resource-details'
      );
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.status}`);
      }

      const data = await response.json();
      if (data.resourceDetails && Array.isArray(data.resourceDetails)) {
        setResources(data.resourceDetails);
        // Do NOT auto-select the first resource
        //  if (data.resourceDetails.length > 0) {
        //     setSelectedResource(data.resourceDetails[0].resource);
        //   }
      } else {
        throw new Error('Invalid data format');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  fetchData();
}, []);


  const handleResourceSelect = (resourceName) => {
    setSelectedResource(resourceName);
  };

  const selectedData = resources.find(r => r.resource === selectedResource);

  if (isLoading) return <div>Loading resources data...</div>;
  if (error) return <div>Error fetching data: {error}</div>;

  return (
    <div className="app-container">
      <style>{`
        .app-container {
          display: flex;
          font-family: Arial, sans-serif;
          height: 100vh;
        }
        
        .sidebar {
          width: 280px;
          background-color: #f5f5f5;
          border-right: 1px solid #ddd;
          overflow-y: auto;
          flex-shrink: 0;
          scrollbar-width: none;
         -ms-overflow-style: none; 

        }
         .sidebar::-webkit-scrollbar {
         display: none; 
         }
        
        .sidebar-header {
          padding: 1rem;
          background-color: #4a6cf7;
          color: white;
          font-weight: bold;
        }
        
        .sidebar-item {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #eee;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .sidebar-item:hover {
          background-color: #e9e9e9;
        }
        
        .sidebar-item.active {
          background-color: #e0e7ff;
          border-left: 4px solid #4a6cf7;
        }
        
        .main-content {
          flex-grow: 1;
          padding: 1.5rem;
          overflow-y: auto;
        }
        
        .resource-details {
          border: 1px solid #ccc;
          padding: 1rem;
          border-radius: 8px;
          background-color: #f9f9f9;
          max-height: calc(100vh - 6rem);
          overflow-y: auto;
        }
        
        .section {
          margin-top: 1rem;
        }
        
        .section h3 {
          margin-bottom: 0.5rem;
        }
        
        ul {
          padding-left: 1.2rem;
        }
        
        li {
          margin-bottom: 0.3rem;
        }
        
        .grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }
        
        .metric-card {
          background: #fff;
          border: 1px solid #ddd;
          padding: 0.5rem;
          border-radius: 4px;
          text-align: center;
        }
        
        .delayed-issue a {
          color: blue;
          text-decoration: underline;
        }
        
        .bandwidth-card {
          position: relative;
          overflow: hidden;
          background: #eee;
        }
        
        .bandwidth-card .progress-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background-color: #4caf50; 
          z-index: 0;
          transition: width 0.5s ease-in-out;
          border-radius: 4px;
        }
        
        .bandwidth-card .content {
          position: relative;
          z-index: 1;
          padding: 0.5rem;
        }
        
        .progress-bar {
          height: 8px;
          width: 100px;
          background-color: #eee;
          border-radius: 4px;
          overflow: hidden;
          position: relative;
        }
        
        .progress-fill-sidebar {
          height: 100%;
          background-color: #4caf50;
          position: absolute;
          top: 0;
          left: 0;
          transition: width 0.5s ease-in-out;
        }
        
        .sidebar-item-content {
          flex-grow: 1;
          max-width: 60%;
        }
        
        .sidebar-stats {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        
        .percentage {
          font-size: 0.75rem;
          margin-bottom: 4px;
        }
      `}</style>

      <div className="sidebar">
        <div className="sidebar-header">
          GitHub Metrics Resources
        </div>
    {[...resources]
  .sort((a, b) => b.bandwidthToday - a.bandwidthToday)
  .map((resource, index) => (
    <div
      key={index}
      className={`sidebar-item ${selectedResource === resource.resource ? 'active' : ''}`}
      onClick={() => handleResourceSelect(resource.resource)}
    >
      <div className="sidebar-item-content">
        {resource.resource}
      </div>
      <div className="sidebar-stats">
        <div className="percentage">{(resource.bandwidthToday * 100).toFixed(0)}%</div>
        <div className="progress-bar">
          <div
            className="progress-fill-sidebar"
            style={{ width: `${(resource.bandwidthToday * 100).toFixed(0)}%` }}
          ></div>
        </div>
      </div>
    </div>
))}

      </div>
      <ManModel />
    </div>
  );
}