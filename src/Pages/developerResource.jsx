import { useState, useEffect } from 'react';

export default function GitHubMetricsViewer() {
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedResource, setExpandedResource] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://githubmetricsbackend-erdfgta5drc3dzev.eastus-01.azurewebsites.net/v1/resource-details');
        
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.resourceDetails && Array.isArray(data.resourceDetails)) {
          setResources(data.resourceDetails);
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

  const toggleResourceExpansion = (resourceName) => {
    if (expandedResource === resourceName) {
      setExpandedResource(null);
    } else {
      setExpandedResource(resourceName);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl font-medium">Loading resources data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="text-red-700 font-medium">Error fetching data: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold">GitHub Metrics Resources</h2>
        <p className="text-gray-600 mt-1">Showing {resources.length} resources</p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {resources.map((resource, index) => (
          <div key={index} className="p-4 hover:bg-gray-50">
            <div 
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleResourceExpansion(resource.resource)}
            >
              <div className="font-medium text-lg">{resource.resource}</div>
              <div className="flex space-x-4">
                <div className="text-sm">
                  <span className="text-gray-500">Current Projects: </span>
                  <span className="font-medium">{resource.currentProjectsCount}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">All Projects: </span>
                  <span className="font-medium">{resource.allProjectsCount}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Open Issues: </span>
                  <span className="font-medium">{resource.openIssues}</span>
                </div>
                <button className="text-blue-600 hover:text-blue-800">
                  {expandedResource === resource.resource ? 'Hide Details' : 'Show Details'}
                </button>
              </div>
            </div>
            
            {expandedResource === resource.resource && (
              <div className="mt-4 pl-4 border-l-4 border-blue-200">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-2">Current Projects Bandwidth</h3>
                    {Object.entries(resource.currentProjectsBandwidthBreakdown || {}).length > 0 ? (
                      <ul className="space-y-1">
                        {Object.entries(resource.currentProjectsBandwidthBreakdown).map(([project, value]) => (
                          <li key={project} className="text-sm">
                            <span className="font-medium">{project}: </span>
                            <span>{(value * 100).toFixed(2)}%</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No current projects bandwidth data</p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">All Projects Contributions</h3>
                    {Object.entries(resource.allProjectsContributionsBreakdown || {}).length > 0 ? (
                      <ul className="space-y-1">
                        {Object.entries(resource.allProjectsContributionsBreakdown).map(([project, value]) => (
                          <li key={project} className="text-sm">
                            <span className="font-medium">{project}: </span>
                            <span>{value.toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No all projects contributions data</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Performance Metrics</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-xs text-gray-500">Bandwidth Today</div>
                      <div className="font-semibold">{(resource.bandwidthToday * 100).toFixed(2)}%</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-xs text-gray-500">Closing Rate</div>
                      <div className="font-semibold">{resource.closingRate}%</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-xs text-gray-500">Closed Issues</div>
                      <div className="font-semibold">{resource.closedIssues}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-xs text-gray-500">Cost</div>
                      <div className="font-semibold">${resource.cost}</div>
                    </div>
                  </div>
                </div>
                
                {resource.delayedIssueCount > 0 && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Delayed Issues ({resource.delayedIssueCount})</h3>
                    <ul className="space-y-2">
                      {resource.delayedIssues.map((issue, idx) => (
                        <li key={idx} className="text-sm">
                          <a 
                            href={issue.issueUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {issue.issueTitle}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}