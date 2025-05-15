import { getProject } from '@theatre/core';
import { Canvas, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  useGLTF,
} from '@react-three/drei';
import {
  EffectComposer,
  Noise,
} from '@react-three/postprocessing';
import { proxy, useSnapshot } from 'valtio';
import { editable as e, SheetProvider } from '@theatre/r3f';
import InstancedModel from '/src/Components/demo';
import stateTheatre from '/src/state.json';
import { useLayoutEffect, useState, useEffect } from 'react';
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
        <TransformControls
          object={scene.getObjectByName(snap.current)}
          mode={modes[snap.mode]}
        />
      )}
      <OrbitControls
        dragToLook={true}
        enablePan={true}
        makeDefault
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 1.75}
      />
    </>
  );
}

export default function App() {
  const sheet = getProject('Conference', { state: stateTheatre }).sheet('Scene');
  const [selected, setSelected] = useState('1');

  useLayoutEffect(() => {
    sheet.sequence.play({ iterationCount: 1000 });
  }, []);

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
        <label htmlFor="model-select" style={{ marginRight: '8px' }}>Select Model:</label>
        <select
          id="model-select"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="1">Fortune</option>
          <option value="2">Website</option>
          <option value="3">AI Readiness</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
      </div>

      {/* 3D Canvas */}
      <Canvas camera={{ near: 1, far: 1000 }}>
        <SheetProvider sheet={sheet}>
          <ErrorBoundary>
            <ambientLight intensity={0.5} />
            <directionalLight
              position={[0, 0, 5]}
              intensity={1}
              color="#ffffff"
              castShadow
            />
            <hemisphereLight intensity={0.2} />

            <InstancedModel />

            {/* Conditionally render ManModels based on dropdown */}

            {selected === "1" && (
              <>
                <ManModel
                  position={[-75, 5, 80]}
                  rotation={[0, 5, 0]}
                  scale={[20, 20, 20]}
                />
                <ManModel
                  position={[-63, 5, -66]}
                  rotation={[0, 0, 0]}
                  scale={[20, 20, 20]}
                />
                <ManModel
                  position={[50, 5, -75]}
                  rotation={[0, -5, 0]}
                  scale={[20, 20, 20]}
                />
                <ManModel
                  position={[40, 5, 92]}
                  rotation={[0, -8.5, 0]}
                  scale={[20, 20, 20]}
                />
              </>
            )}
            {selected === "2" && (
              <>
                <ManModel
                  position={[-75, 5, 80]}
                  rotation={[0, 5, 0]}
                  scale={[20, 20, 20]}
                />
                <ManModel
                  position={[-63, 5, -66]}
                  rotation={[0, 0, 0]}
                  scale={[20, 20, 20]}
                />

              </>
            )}
            {selected === "3" && (
              <>
                <ManModel
                  position={[50, 5, -75]}
                  rotation={[0, -5, 0]}
                  scale={[20, 20, 20]}
                />
                <ManModel
                  position={[40, 5, 92]}
                  rotation={[0, -8.5, 0]}
                  scale={[20, 20, 20]}
                />

              </>
            )}




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
