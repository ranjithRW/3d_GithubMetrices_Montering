import React, { useRef, useEffect } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';

const ManModel = (props) => {
  const ref = useRef();
  const { scene, animations } = useGLTF('/man.glb');
  const { actions } = useAnimations(animations, ref);

  useEffect(() => {
    // If the animation is named "Sitting" (check with a console.log)
    const sitting = actions['Sitting'] || actions[Object.keys(actions)[0]];
    if (sitting) sitting.play();
  }, [actions]);

  return (
    <primitive object={scene} ref={ref} {...props} />
  );
};

export default ManModel;
