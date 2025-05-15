import { getProject } from '@theatre/core';
import { Canvas, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  TransformControls,
} from '@react-three/drei';
import {
  EffectComposer,
  Noise,
} from '@react-three/postprocessing';
import { proxy, useSnapshot } from 'valtio';
import { editable as e, SheetProvider } from '@theatre/r3f';
import InstancedModel from '/src/Components/demo';
import stateTheatre from '/src/state.json';
import { useLayoutEffect, useState, useEffect, useMemo } from 'react';
import ManModel from '/src/Components/manModel';

// Error Boundary Component
function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (hasError) {
      console.error("An error occurred:", hasError);
    }
  }, [hasError]);

  if (hasError) {
    return <div>Something went wrong.</div>;
  }

  try {
    return children;
  } catch (error) {
    setHasError(error);
    return null;
  }
}

const modes = ['translate', 'rotate', 'scale'];
const state = proxy({ current: null, mode: 0 });

function Controls() {
  const snap = useSnapshot(state);
  const scene = useThree((state) => state.scene);

  return (
    <>
      {snap.current && (
        <TransformControls object={scene.getObjectByName(snap.current)} mode={modes[snap.mode]}
        />
      )}
      <OrbitControls
        dragToLook={true} enablePan={true} makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} />
    </>
  );
}

// Predefined positions for the man models
const predefinedPositions = [
  { position: [-75, 5, 80], rotation: [0, 5, 0], scale: [20, 20, 20] },
  { position: [-63, 5, -66], rotation: [0, 0, 0], scale: [20, 20, 20] },
  { position: [50, 5, -75], rotation: [0, -5, 0], scale: [20, 20, 20] },
  { position: [40, 5, 92], rotation: [0, -8.5, 0], scale: [20, 20, 20] },
  { position: [0, 5, -110], rotation: [0, 0, 0], scale: [20, 20, 20] }
];

export default function App() {
  const sheet = getProject('Conference', { state: stateTheatre }).sheet('Scene');

  const [resourceData, setResourceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState('');
  const [projectResources, setProjectResources] = useState({});

  useLayoutEffect(() => {
    sheet.sequence.play({ iterationCount: 1000 });
  }, []);

  // Fetch and process data
  useEffect(() => {
    fetch('https://githubmetricsbackend-erdfgta5drc3dzev.eastus-01.azurewebsites.net/v1/resource-details')
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch data');
        return response.json();
      })
      .then(json => {
        setLoading(false);

        const resources = json.resourceDetails || json.data || json;

        if (Array.isArray(resources)) {
          setResourceData(resources);

          // Process projects and resources
          const projectsMap = {};
          const mergedBandwidth = {};

          resources.forEach(resource => {
            const breakdown = resource.currentProjectsBandwidthBreakdown;

            if (breakdown && typeof breakdown === 'object') {
              Object.entries(breakdown).forEach(([projectName, value]) => {
                // Count resources per project (if bandwidth > 0)
                if (value > 0) {
                  if (!projectsMap[projectName]) {
                    projectsMap[projectName] = [];
                  }
                  projectsMap[projectName].push({
                    name: resource.resource,
                    bandwidth: value
                  });
                }

                // Sum up bandwidth
                mergedBandwidth[projectName] = (mergedBandwidth[projectName] || 0) + value;
              });
            }
          });

          setProjectResources(projectsMap);

          // Auto-select first project key if available
          const firstKey = Object.keys(mergedBandwidth)[0] || '';
          setSelected(firstKey);
        } else {
          console.error("❌ resources is not an array or missing");
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  // Use predefined positions for models based on currently selected project
  const modelPositions = useMemo(() => {
    if (!selected || !projectResources[selected]) return [];

    // Return the predefined positions, limited to the number of resources
    return predefinedPositions.slice(0, Math.min(projectResources[selected].length, predefinedPositions.length));
  }, [selected, projectResources]);

  if (loading) return <div style={{ color: 'white', padding: '20px' }}>Loading...</div>;

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* Dropdown menu */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 1000,
        background: 'rgba(0,0,0,0.5)',
        padding: '10px',
        borderRadius: '8px',
        color: 'white'
      }}>
        <label htmlFor="model-select" style={{ marginRight: '8px' }}>Select Project:</label>
        <select
          id="model-select"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {Object.keys(projectResources).map(key => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      </div>


      <Canvas camera={{ near: 1, far: 1000 }}>
        <SheetProvider sheet={sheet}>
          <ErrorBoundary>
            <ambientLight intensity={0.5} />
            <directionalLight position={[0, 0, 5]} intensity={1} color="#ffffff" castShadow />
            <hemisphereLight intensity={0.2} />
            <InstancedModel />

            {/* Dynamically render ManModels based on the selected project */}
            {selected && projectResources[selected] && projectResources[selected].map((resource, index) => {
              if (index < modelPositions.length) {
                const { position, rotation, scale } = modelPositions[index];
                return (
                  <ManModel 
                    key={resource.name}
                    position={position}
                    rotation={rotation}
                    scale={scale}
                    label={resource.name}
                    info={`name: ${resource.name}\nbandwidth: ${(resource.bandwidth * 100).toFixed(2)}%`}
                  />
                );
              }
              return null;
            })}

            <Controls />
            <EffectComposer>
              <Noise opacity={0.05} />
            </EffectComposer>
          </ErrorBoundary>
        </SheetProvider>
      </Canvas>
    </div>
  );
}