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
import { useLayoutEffect, useState ,useEffect} from 'react';

// Error Boundary
function ErrorBoundary({ children }) {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        if (hasError) {
            console.error("An error occurred:", hasError);
        }
    }, [hasError]);

    if (hasError) {
        // Render fallback UI
        return <div>Something went wrong.</div>;
    }

    try {
        return children;
    } catch (error) {
        setHasError(error);
        return null; // Or render a fallback component
    }
}

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
        sheet.sequence.play({ iterationCount: 1000 });
    });

    return (
        <Canvas
            camera={{ near: 0.01, far: 1000 }}
        >
            <SheetProvider sheet={sheet}>
                <ErrorBoundary>  {/* Wrap the entire SheetProvider in the ErrorBoundary */}
                    {/* <Environment files="/background3.hdr" /> */}
                    <ambientLight intensity={0.5} />
                    <spotLight
                        position={[0, 50, 10]}
                        angle={0.15}
                        penumbra={1}
                        intensity={2}
                    />
                    <hemisphereLight
                        intensity={0.5}
                    />
                    <InstancedModel />
                    <Controls />
                    <EffectComposer>
                        <Noise opacity={0.05} />
                    </EffectComposer>
                </ErrorBoundary>
            </SheetProvider>
        </Canvas>
    );
}