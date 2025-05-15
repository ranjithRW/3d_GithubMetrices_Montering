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

    // Text + plane size and scroll settings
    const textFontSize = 0.3;
    const lineHeight = 1.4;
    const planeHeight = 2;
    const infoLines = info.split('\n');
    const maxLinesToShow = Math.floor(planeHeight / (textFontSize * lineHeight));
    const [scrollIndex, setScrollIndex] = useState(0);

    // Scroll text every 2 seconds
    useEffect(() => {
        if (!showInfo || infoLines.length <= maxLinesToShow) return;

        const interval = setInterval(() => {
            setScrollIndex(prev => {
                if (prev + maxLinesToShow < infoLines.length) return prev + 1;
                return 0;
            });
        }, 2000);

        return () => clearInterval(interval);
    }, [showInfo, infoLines.length, maxLinesToShow]);

    useEffect(() => {
        const sitting = actions['Sitting'] || actions[Object.keys(actions)[0]];
        if (sitting) sitting.play();
    }, [actions]);

    const handleClick = (e) => {
        e.stopPropagation();
        if (info) {
            setShowInfo(!showInfo);
            setScrollIndex(0);
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

            {/* Label */}
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

            {/* Info Panel */}
            {showInfo && (
                <>
                    {/* Background Panel */}
                    <mesh position={[0, labelYOffset, 0]}>
                        <planeGeometry args={[10, planeHeight]} />
                        <meshBasicMaterial color="white" transparent opacity={0.9} side={THREE.DoubleSide} />
                    </mesh>

                    {/* Scrollable Text within bounds */}
                    <Text
                        position={[0, labelYOffset + planeHeight / 2 - textFontSize, 0.1]} // top padding
                        fontSize={textFontSize}
                        color="black"
                        anchorX="center"
                        anchorY="top"
                        maxWidth={9}
                        lineHeight={lineHeight}
                    >
                        {infoLines.slice(scrollIndex, scrollIndex + maxLinesToShow).join('\n')}
                    </Text>
                </>
            )}
        </group>
    );
};

export default ManModel;
