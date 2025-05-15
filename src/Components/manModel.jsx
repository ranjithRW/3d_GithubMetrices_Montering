import React, { useRef, useEffect, useMemo } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils'; // import SkeletonUtils

const ManModel = (props) => {
  const ref = useRef();
  const { scene, animations } = useGLTF('/man.glb');

  // Clone the scene for each instance
  const clonedScene = useMemo(() => clone(scene), [scene]);

  const { actions } = useAnimations(animations, ref);

  useEffect(() => {
    const sitting = actions['Sitting'] || actions[Object.keys(actions)[0]];
    if (sitting) sitting.play();
  }, [actions]);

  return (
    <primitive object={clonedScene} ref={ref} {...props} />
  );
};

export default ManModel;
