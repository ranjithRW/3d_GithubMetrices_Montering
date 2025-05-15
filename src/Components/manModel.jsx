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

    // Panel dimensions
    const panelWidth = 10;
    const panelHeight = 2;
    
    // Text formatting settings
    const textFontSize = 0.25; // Reduced font size to fit more content
    const lineHeight = 1.2;    // Reduced line height to be more compact
    const textPadding = 0.2;   // Padding inside the panel
    
    // Process the info text
    const infoLines = info.split('\n');
    
    // Calculate how many lines can fit in the panel with padding
    const availableHeight = panelHeight - (textPadding * 2);
    const maxLinesToShow = Math.floor(availableHeight / (textFontSize * lineHeight));
    
    // Calculate total needed scroll positions
    const totalScrollPositions = Math.max(1, infoLines.length - maxLinesToShow + 1);
    
    // Scrolling state
    const [scrollIndex, setScrollIndex] = useState(0);
    const needsScrolling = infoLines.length > maxLinesToShow;

    // Auto-scroll effect
    useEffect(() => {
        if (!showInfo || !needsScrolling) return;
        
        const interval = setInterval(() => {
            setScrollIndex(prev => {
                const nextIndex = prev + 1;
                return nextIndex >= totalScrollPositions ? 0 : nextIndex;
            });
        }, 2000);

        return () => clearInterval(interval);
    }, [showInfo, needsScrolling, totalScrollPositions]);

    // Play animation
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

            {/* Name Label (shown when info panel is hidden) */}
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
                <group position={[0, labelYOffset, 0]}>
                    {/* Background Panel */}
                    <mesh>
                        <planeGeometry args={[panelWidth, panelHeight]} />
                        <meshBasicMaterial color="white" transparent opacity={0.9} side={THREE.DoubleSide} />
                    </mesh>

                    {/* Title bar */}
                    <mesh position={[0, panelHeight/2 - 0.3, 0.01]}>
                        <planeGeometry args={[panelWidth, 0.6]} />
                        <meshBasicMaterial color="#e0e0e0" side={THREE.DoubleSide} />
                    </mesh>
                    
                    {/* Title text */}
                    <Text
                        position={[0, panelHeight/2 - 0.3, 0.02]}
                        fontSize={0.35}
                        color="black"
                        fontWeight="bold"
                        anchorX="center"
                        anchorY="middle"
                    >
                        {label}
                    </Text>
                    
                    {/* Content area */}
                    <group position={[0, 0, 0.01]}>
                        {/* Text content - strictly contained within panel boundaries */}
                        <Text
                            position={[0, panelHeight/2 - 0.7, 0]} 
                            fontSize={textFontSize}
                            color="black"
                            anchorX="center"
                            anchorY="top"
                            maxWidth={panelWidth - textPadding * 2}
                            lineHeight={lineHeight}
                            textAlign="left"
                            clipRect={[
                                -panelWidth/2 + textPadding,                 // left
                                -panelHeight/2 + textPadding,                // bottom
                                panelWidth/2 - textPadding,                  // right
                                panelHeight/2 - 0.7                          // top (adjusted for title)
                            ]}
                        >
                            {infoLines.slice(scrollIndex, scrollIndex + maxLinesToShow).join('\n')}
                        </Text>
                        
                        {/* Scroll indicator */}
                        {needsScrolling && (
                            <Text
                                position={[panelWidth/2 - 0.5, -panelHeight/2 + 0.15, 0]}
                                fontSize={0.2}
                                color="gray"
                                anchorX="center"
                                anchorY="bottom"
                            >
                                {`${scrollIndex + 1}/${totalScrollPositions}`}
                            </Text>
                        )}
                    </group>
                </group>
            )}
        </group>
    );
};

export default ManModel;
