import { getProject } from '@theatre/core';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  useGLTF,
  OrbitControls,
  FlyControls,
  FirstPersonControls,
  Sparkles,
  Environment,
  PerspectiveCamera,
} from '@react-three/drei';
import {
  EffectComposer,
  DepthOfField,
  Bloom,
  Vignette,
  Noise,
} from '@react-three/postprocessing';
import { KernelSize, BlendFunction } from 'postprocessing';
import { proxy, useSnapshot } from 'valtio';
import { editable as e, SheetProvider } from '@theatre/r3f';
import InstancedModel from '/src/Components/demo';
import stateTheatre from '/src/state.json';
import { useLayoutEffect } from 'react';

const modes = ['translate', 'rotate', 'scale'];
const state = proxy({ current: null, mode: 0 });

console.log(stateTheatre);

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
  const sheet = getProject('Butterfly', { state: stateTheatre }).sheet('Scene');

  useLayoutEffect(() => {
    // Play it on load
    sheet.sequence.play({ iterationCount: 1000 });
  });

  return (
    <Canvas
      gl={{ alpha: false, preserveDrawingBuffer: true }}
      camera={{ near: 0.01, far: 1000 }}
    >
      <SheetProvider sheet={sheet}>
        <Environment files="/background3.hdr" />
        {/* Remove or comment out the fog  */}
        <directionalLight position={[1, 1, 1]} intensity={2} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 5, 10]} intensity={2} />
        <spotLight
          position={[0, 50, 10]}
          angle={0.15}
          penumbra={1}
          intensity={2}
        />
        <hemisphereLight
          intensity={1}
        />
        <InstancedModel />
        <Controls />
        <EffectComposer>
       
          <Noise opacity={0.05} />
        </EffectComposer>
      </SheetProvider>
    </Canvas>
  );
}