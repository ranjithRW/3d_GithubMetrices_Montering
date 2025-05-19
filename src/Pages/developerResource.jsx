import { useState, useEffect } from 'react';

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

  if (isLoading) {
    return <div>Loading resources data...</div>;
  }

  if (error) {
    return <div>Error fetching data: {error}</div>;
  }

  const handleChange = (e) => {
    setSelectedResource(e.target.value);
  };

  return (
    <div>
      <h2>GitHub Metrics Resources</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="resourceSelect">Select a resource: </label>
        <select id="resourceSelect" value={selectedResource} onChange={handleChange}>
          <option value="">-- Select --</option>
          {resources.map((resource, index) => (
            <option key={index} value={resource.resource}>
              {resource.resource}
            </option>
          ))}
        </select>
      </div>

      {selectedResource && (
        <div>
          <strong>Selected Resource:</strong> {selectedResource}
        </div>
      )}
    </div>
  );
}
