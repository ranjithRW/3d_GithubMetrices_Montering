import React, { useRef, useEffect, useMemo } from 'react';
import { useGLTF, useAnimations, Text } from '@react-three/drei';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

const ManModel = ({ label = "", info = "", position, rotation, scale, onInfoClick }) => {
    const groupRef = useRef();
    const labelRef = useRef();
    const { scene, animations } = useGLTF('/man.glb');

    const clonedScene = useMemo(() => clone(scene), [scene]);
    const { actions } = useAnimations(animations, groupRef);

    const boundingBox = useMemo(() => new THREE.Box3().setFromObject(clonedScene), [clonedScene]);
    const modelHeight = boundingBox.max.y - boundingBox.min.y;
    const labelYOffset = modelHeight + 0.05;

    // Make the label face the camera on every frame
    useFrame(({ camera }) => {
        if (labelRef.current) {
            // Get the label's world position
            const labelWorldPosition = new THREE.Vector3();
            labelRef.current.getWorldPosition(labelWorldPosition);
            
            // Calculate direction from the label to the camera
            const lookAtPosition = new THREE.Vector3()
                .copy(camera.position)
                .sub(labelWorldPosition)
                .add(labelWorldPosition);
                
            // Adjust y-axis to keep label upright
            lookAtPosition.y = labelWorldPosition.y;
            
            // Apply the billboard effect to the label
            labelRef.current.lookAt(lookAtPosition);
            
            // Reset rotation on X and Z axes to keep label perfectly upright
            labelRef.current.rotation.x = 0;
            labelRef.current.rotation.z = 0;
        }
    });

    // Play animation
    useEffect(() => {
        const sitting = actions['Sitting'] || actions[Object.keys(actions)[0]];
        if (sitting) sitting.play();
    }, [actions]);

    const handleClick = (e) => {
        e.stopPropagation();
        if (info && onInfoClick) {
            onInfoClick({
                label,
                info
            });
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

            {/* Name Label */}
            {label && (
                <group ref={labelRef} position={[0, labelYOffset, 0]}>
                    <Text
                        position={[0, 0, 0]}
                        fontSize={0.3}
                        color="black"
                        anchorX="center"
                        anchorY="top-baseline"
                    >
                        {label}
                    </Text>
                </group>
            )}
        </group>
    );
};

export default ManModel;