import React, { useRef, useEffect, useMemo } from 'react';
import { useGLTF, useAnimations, Text } from '@react-three/drei';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils';
import * as THREE from 'three';

const ManModel = ({ label = "", position, rotation, scale }) => {
  const groupRef = useRef();
  const { scene, animations } = useGLTF('/man.glb');

  // Clone the scene for independent animation
  const clonedScene = useMemo(() => clone(scene), [scene]);
  const { actions } = useAnimations(animations, groupRef);

  // Calculate bounding box and model height for label positioning
  const boundingBox = useMemo(() => new THREE.Box3().setFromObject(clonedScene), [clonedScene]);
  const modelHeight = boundingBox.max.y - boundingBox.min.y;

  // Adjust the Y offset to place label just above the head
  const labelYOffset = modelHeight + 0.05;  // reduced offset for label position

  // Play animation on mount
  useEffect(() => {
    const sitting = actions['Sitting'] || actions[Object.keys(actions)[0]];
    if (sitting) sitting.play();
  }, [actions]);

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <primitive object={clonedScene} />

      {/* Permanent label above the model */}
      <Text
        position={[0, labelYOffset, 0]}
        fontSize={0.5}
        color="black"
        anchorX="center"
        anchorY="top-baseline"
      >
        {label}
      </Text>
    </group>
  );
};

export default ManModel;
