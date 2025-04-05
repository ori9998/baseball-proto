import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';

function BaseballField() {
  const gltf = useMemo(() => useGLTF("/baseball.glb"), []);
  return <primitive object={gltf.scene} scale={0.5} />;
}

export default BaseballField;
