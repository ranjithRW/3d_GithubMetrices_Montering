import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useGLTF, useAnimations, Text } from '@react-three/drei';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils';
import * as THREE from 'three';

const ManModel = ({ label = "", info = "", position, rotation, scale }) => {
    const groupRef = useRef();
    const { scene, animations } = useGLTF('/man.glb');
    const [showInfo, setShowInfo] = useState(false);

    const clonedScene = useMemo(() => clone(scene), [scene]);
    const { actions } = useAnimations(animations, groupRef);

    const boundingBox = useMemo(() => new THREE.Box3().setFromObject(clonedScene), [clonedScene]);
    const modelHeight = boundingBox.max.y - boundingBox.min.y;
    const labelYOffset = modelHeight + 0.05;

    useEffect(() => {
        const sitting = actions['Sitting'] || actions[Object.keys(actions)[0]];
        if (sitting) sitting.play();
    }, [actions]);

    const handleClick = (e) => {
        e.stopPropagation();
        if (info) {
            setShowInfo(!showInfo);
        }
    };

    return (
        <group
            ref={groupRef}
            position={position}
            rotation={rotation}
            scale={scale}
            onPointerDown={handleClick}
        >
            <primitive object={clonedScene} />

            {/* Always show label if provided */}
            {label && !showInfo && (
                <Text
                    position={[0, labelYOffset, 0]}
                    fontSize={0.5}
                    color="black"
                    anchorX="center"
                    anchorY="top-baseline"
                >
                    {label}
                </Text>
            )}

            {/* Show info text on click */}
            {showInfo && (
                <>
                    {/* Background plane */}
                    <mesh position={[0, labelYOffset, 0]}>
                        <planeGeometry args={[3, 1.5]} />
                        <meshBasicMaterial color="white" transparent opacity={0.9} side={THREE.DoubleSide} />
                    </mesh>

                    {/* Info text */}
                    <Text
                        position={[0, labelYOffset, 0.01]}  // Slightly in front of the plane
                        fontSize={0.3}
                        color="black"
                        anchorX="center"
                        anchorY="top-baseline"
                        maxWidth={4}
                        lineHeight={1.4}
                    >
                        {info}
                    </Text>
                </>
            )}

        </group>
    );
};

export default ManModel;
