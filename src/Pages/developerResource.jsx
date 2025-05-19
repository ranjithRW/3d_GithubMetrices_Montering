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

  const handleChange = (e) => {
    setSelectedResource(e.target.value);
  };

  const selectedData = resources.find(r => r.resource === selectedResource);

  if (isLoading) return <div>Loading resources data...</div>;
  if (error) return <div>Error fetching data: {error}</div>;

  return (
    <div className="container">
      <style>{`
  .container {
    max-width: 800px;
    margin: 0 auto;
    font-family: Arial, sans-serif;
    padding: 1rem;
  }
  .select-container {
    margin-bottom: 1rem;
  }
  .resource-details {
    border: 1px solid #ccc;
    padding: 1rem;
    border-radius: 8px;
    background-color: #f9f9f9;
    max-height: 500px; /* Set a fixed height */
    overflow-y: auto;  /* Enable vertical scroll */
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
`}</style>


      <h2>GitHub Metrics Resources</h2>

      <div className="select-container">
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
      <div className="metric-card">
        <div>Bandwidth Today</div>
        <strong>{(selectedData.bandwidthToday * 100).toFixed(2)}%</strong>
      </div>
      {selectedData && (
        <div className="resource-details">
          <h3>Selected Resource: {selectedData.resource}</h3>

          <div className="section">
            <h3>Current Projects Bandwidth</h3>
            {Object.entries(selectedData.currentProjectsBandwidthBreakdown || {}).length > 0 ? (
              <ul>
                {Object.entries(selectedData.currentProjectsBandwidthBreakdown).map(([project, value]) => (
                  <li key={project}>
                    <strong>{project}:</strong> {(value * 100).toFixed(2)}%
                  </li>
                ))}
              </ul>
            ) : (
              <p>No current projects bandwidth data</p>
            )}
          </div>

          {/* <div className="section">
            <h3>All Projects Contributions</h3>
            {Object.entries(selectedData.allProjectsContributionsBreakdown || {}).length > 0 ? (
              <ul>
                {Object.entries(selectedData.allProjectsContributionsBreakdown).map(([project, value]) => (
                  <li key={project}>
                    <strong>{project}:</strong> {value.toFixed(2)}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No all projects contributions data</p>
            )}
          </div> */}

          <div className="section">
            <h3>Performance Metrics</h3>
            <div className="grid">
              <div className="metric-card">
                <div>Bandwidth Today</div>
                <strong>{(selectedData.bandwidthToday * 100).toFixed(2)}%</strong>
              </div>
              <div className="metric-card">
                <div>Closing Rate</div>
                <strong>{selectedData.closingRate}%</strong>
              </div>
              <div className="metric-card">
                <div>Closed Issues</div>
                <strong>{selectedData.closedIssues}</strong>
              </div>
              <div className="metric-card">
                <div>Cost</div>
                <strong>${selectedData.cost}</strong>
              </div>
            </div>
          </div>

          {selectedData.delayedIssueCount > 0 && (
            <div className="section">
              <h3>Delayed Issues ({selectedData.delayedIssueCount})</h3>
              <ul>
                {selectedData.delayedIssues.map((issue, idx) => (
                  <li key={idx} className="delayed-issue">
                    <a href={issue.issueUrl} target="_blank" rel="noopener noreferrer">
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
  );
}
