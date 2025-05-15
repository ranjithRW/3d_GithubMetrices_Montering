import { getProject } from '@theatre/core';
import { Canvas, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  TransformControls,
  PerspectiveCamera
} from '@react-three/drei';
import {
  EffectComposer,
  Noise,
} from '@react-three/postprocessing';
import { proxy, useSnapshot } from 'valtio';
import { editable as e, SheetProvider } from '@theatre/r3f';
import { useLayoutEffect, useState, useEffect, useMemo, useRef } from 'react';
import { useSpring, animated, config as springConfig } from '@react-spring/three';
import InstancedModel from '/src/Components/demo';
import stateTheatre from '/src/state.json';
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

// Camera setup component to handle initial position
function CameraSetup() {
  const { camera } = useThree();
  
  useEffect(() => {
    // Set initial camera position farther away to see the full model
    camera.position.set(0, 60, 250);
    camera.updateProjectionMatrix();
  }, [camera]);
  
  return null;
}

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
        dragToLook={true} 
        enablePan={true} 
        makeDefault 
        minPolarAngle={0} 
        maxPolarAngle={Math.PI / 1.75}
        minDistance={100} // Add min distance to prevent zooming in too close
        maxDistance={500} // Add max distance to limit how far users can zoom out
      />
    </>
  );
}

// Predefined positions for the man models
const predefinedPositions = [
  { position: [-63, 5, -66], rotation: [0, 0, 0], scale: [20, 20, 20] },
  { position: [50, 5, -75], rotation: [0, -5, 0], scale: [20, 20, 20] },
  { position: [40, 5, 92], rotation: [0, -8.5, 0], scale: [20, 20, 20] },
  { position: [0, 5, -110], rotation: [0, 0, 0], scale: [20, 20, 20] },
  { position: [-75, 5, 80], rotation: [0, 5, 0], scale: [20, 20, 20] },
];

// Common animation configuration to ensure perfect synchronization
const ANIMATION_CONFIG = {
  mass: 1,
  tension: 70,
  friction: 14,
  clamp: false,
  precision: 0.01,
  velocity: 0,
  duration: 800 // Fixed duration in ms to ensure exact timing
};

// Animated Man Model component with transitions
function AnimatedManModel({ resource, positionData, isEntering, isExiting, delayedIssues }) {
  const { position, rotation, scale } = positionData;

  // Calculate animation values
  const startX = isEntering ? position[0] - 200 : position[0];
  const endX = isExiting ? position[0] + 200 : position[0];

  // Create spring animation with exact same settings as InstancedModel
  const props = useSpring({
    position: [endX, position[1], position[2]],
    from: { position: [startX, position[1], position[2]] },
    config: ANIMATION_CONFIG,
    immediate: false,
  });

  // Format the delayed issues information
  const delayedIssuesInfo = delayedIssues && delayedIssues.length > 0
    ? `Delayed Issues:\n${delayedIssues.map(issue => `  - ${issue.issueTitle}`).join('\n')}`
    : 'No delayed issues';
  // Combine all the info, including the delayed issues
  const info = `${delayedIssuesInfo}`;

  return (
    <animated.group {...props}>
      <ManModel
        position={[0, 0, 0]} // Local position is zero as we use the animated group
        rotation={rotation}
        scale={scale}
        label={resource.name}
        info={info} // Pass the combined info here
      />
    </animated.group>
  );
}

// Animated InstancedModel wrapper with exactly the same animation settings
function AnimatedInstancedModel({ isEntering, isExiting }) {
  // Create spring animation for the InstancedModel with identical settings to ManModel
  const props = useSpring({
    position: isExiting ? [200, 0, 0] : [0, 0, 0],
    from: { position: isEntering ? [-200, 0, 0] : [0, 0, 0] },
    config: ANIMATION_CONFIG,
    immediate: false,
  });

  return (
    <animated.group {...props}>
      <InstancedModel />
    </animated.group>
  );
}

export default function App() {
  const sheet = getProject('Conference', { state: stateTheatre }).sheet('Scene');

  const [resourceData, setResourceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState('');
  const [previousSelected, setPreviousSelected] = useState('');
  const [projectResources, setProjectResources] = useState({});
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Unified animation toggle for all components
  const [animationState, setAnimationState] = useState({
    isEntering: false,
    isExiting: false,
    key: 0
  });

  // Keep track of both current and previous models for animation
  const [currentModels, setCurrentModels] = useState([]);
  const [exitingModels, setExitingModels] = useState([]);

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
                    bandwidth: value,
                    delayedIssues: resource.delayedIssues // Include delayed issues
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

  // Handle project selection change
  useEffect(() => {
    if (!selected || selected === previousSelected || !projectResources[selected]) return;

    if (previousSelected) {
      // Start transition animation
      setIsTransitioning(true);

      // First trigger the exit animation for all components
      setAnimationState({
        isEntering: false,
        isExiting: true,
        key: animationState.key
      });

      // Store existing models to animate them out
      if (projectResources[previousSelected]) {
        const prevModels = projectResources[previousSelected].map((resource, index) => {
          if (index < predefinedPositions.length) {
            return {
              resource,
              positionData: predefinedPositions[index],
              key: `${previousSelected}-${resource.name}`
            };
          }
          return null;
        }).filter(Boolean);

        setExitingModels(prevModels);
      }

      // Prepare the new models data (but don't animate yet)
      const newModels = projectResources[selected].map((resource, index) => {
        if (index < predefinedPositions.length) {
          return {
            resource,
            positionData: predefinedPositions[index],
            key: `${selected}-${resource.name}`
          };
        }
        return null;
      }).filter(Boolean);

      // Wait for exit animation to complete (slightly less than duration)
      setTimeout(() => {
        // Set the new models
        setCurrentModels(newModels);

        // Clear exiting models
        setExitingModels([]);

        // Then trigger the entrance animation for all components
        setAnimationState({
          isEntering: true,
          isExiting: false,
          key: animationState.key + 1
        });

        // Animation complete
        setTimeout(() => {
          setIsTransitioning(false);
        }, ANIMATION_CONFIG.duration);

      }, ANIMATION_CONFIG.duration);
    } else {
      // First load - no animation needed
      const initialModels = projectResources[selected].map((resource, index) => {
        if (index < predefinedPositions.length) {
          return {
            resource,
            positionData: predefinedPositions[index],
            key: `${selected}-${resource.name}`
          };
        }
        return null;
      }).filter(Boolean);

      setCurrentModels(initialModels);

      // Initialize with no animation
      setAnimationState({
        isEntering: false,
        isExiting: false,
        key: 0
      });
    }

    setPreviousSelected(selected);
  }, [selected, projectResources, previousSelected, animationState.key]);

  // Handle project selection change
  const handleProjectChange = (e) => {
    const newSelection = e.target.value;
    setSelected(newSelection);
  };

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
          onChange={handleProjectChange}
          disabled={isTransitioning}
        >
          {Object.keys(projectResources).map(key => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      </div>

      <Canvas camera={{ position: [0, 0, 200], near: 1, far: 1000 }}>
        <SheetProvider sheet={sheet}>
          <ErrorBoundary>
            <CameraSetup />
            <ambientLight intensity={0.5} />
            <directionalLight position={[0, 0, 5]} intensity={1} color="#ffffff" castShadow />
            <hemisphereLight intensity={0.2} />

            {/* Animated InstancedModel - using the unified animation state */}
            <AnimatedInstancedModel
              key={`instanced-model-${animationState.key}`}
              isEntering={animationState.isEntering}
              isExiting={animationState.isExiting}
            />

            {/* Render current models with unified animation state */}
            {currentModels.map(item => (
              <AnimatedManModel
                key={`${animationState.key}-${item.key}`}
                resource={item.resource}
                positionData={item.positionData}
                isEntering={animationState.isEntering}
                isExiting={animationState.isExiting}
                delayedIssues={item.resource.delayedIssues}  // Pass delayedIssues to the component
              />
            ))}

            {/* Render exiting models - always exiting */}
            {exitingModels.map(item => (
              <AnimatedManModel
                key={`exiting-${item.key}`}
                resource={item.resource}
                positionData={item.positionData}
                isEntering={false}
                isExiting={true}
                delayedIssues={item.resource.delayedIssues} // Pass delayedIssues to the component
              />
            ))}

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
