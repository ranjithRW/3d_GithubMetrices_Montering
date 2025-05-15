// import React, { useEffect, useState } from 'react';

// const ResourceDetails = () => {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetch('https://githubmetricsbackend-erdfgta5drc3dzev.eastus-01.azurewebsites.net/v1/resource-details')
//       .then(response => {
//         if (!response.ok) {
//           throw new Error('Failed to fetch data');
//         }
//         return response.json();
//       })
//       .then(json => {
//         console.log("Full fetched response:", json); // Inspect full structure here
//         setData(json);
//         setLoading(false);

//         // Adjust this key if your array is under a different name
//         const resources = json.resourceDetails || json.data || json; 

//         if (Array.isArray(resources)) {
//           console.log("✅ resources array found, iterating...");
//           resources.forEach((resource, index) => {
//             if (resource && resource.currentProjectsBandwidthBreakdown) {
//               console.group(`Resource ${index + 1} - ${resource.resource}`);
//               console.log(resource.currentProjectsBandwidthBreakdown);
//               console.groupEnd();
//             } else {
//               console.warn(`⚠️ No bandwidth breakdown for resource at index ${index}`);
//             }
//           });
//         } else {
//           console.error("❌ resources is not an array or missing");
//         }
//       })
//       .catch(error => {
//         console.error('Error fetching data:', error);
//         setLoading(false);
//       });
//   }, []);

//   if (loading) return <div>Loading...</div>;
//   if (!data) return <div>No data found</div>;

//   return (
//     <div className="p-4">
//       <h1 className="text-xl font-bold mb-4">Resource Details</h1>
//       <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
//         {JSON.stringify(data, null, 2)}
//       </pre>
//     </div>
//   );
// };

// export default ResourceDetails;


import React, { useEffect, useState } from 'react';

const ResourceDetails = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://githubmetricsbackend-erdfgta5drc3dzev.eastus-01.azurewebsites.net/v1/resource-details')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        return response.json();
      })
      .then(json => {
        console.log("Full fetched response:", json);
        setData(json);
        setLoading(false);

        const resources = json.resourceDetails || json.data || json;

        if (Array.isArray(resources)) {
          const mergedBandwidth = {};

          resources.forEach(resource => {
            const breakdown = resource.currentProjectsBandwidthBreakdown;
            if (breakdown && typeof breakdown === 'object') {
              Object.entries(breakdown).forEach(([key, value]) => {
                mergedBandwidth[key] = (mergedBandwidth[key] || 0) + value;
              });
            }
          });

          console.log("Merged currentProjectsBandwidthBreakdown for all resources:", mergedBandwidth);
        } else {
          console.error("❌ resources is not an array or missing");
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No data found</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Resource Details</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

export default ResourceDetails;
