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
          <div key={index} className="p-4 hover:bg-gray-50 relative"> {/* Added relative positioning */}
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleResourceExpansion(resource.resource)}
            >
              <div className="font-medium text-lg">{resource.resource}</div>
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
            </div>
            {/* Dropdown Content - Conditionally Rendered */}
            {expandedResource === resource.resource && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-md shadow-md z-10">
                {/* Add your dropdown content here */}
                <div className="p-2">
                  <p className="text-sm">Current Projects: {resource.currentProjectsCount}</p>
                  <p className="text-sm">All Projects: {resource.allProjectsCount}</p>
                  {/* Add more details or links related to the resource */}
                </div>
                <div className='p-2'>
                   <button onClick={() => toggleResourceExpansion(resource.resource)} className="text-blue-600 hover:text-blue-800">
                    Hide Details
                    </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}