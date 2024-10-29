import {Environment, Grid, OrbitControls, PerspectiveCamera, Sky} from "@react-three/drei";
import {useFrame, useThree} from "@react-three/fiber";
import {useWorld} from "koota/react";
import {schedule} from "../ecs";
import {useEffect} from "react";
import {BatchSettings, TScene} from "../ecs/traits";

export function SceneContainer() {
  const world = useWorld();
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    world.add(TScene(scene));
    world.add(BatchSettings);
    return () => {
      world.remove(TScene);
      world.remove(BatchSettings);
    }
  }, [scene]);


  useFrame((_state, delta) => {
    // this is how we connect our ecs systems to r3f
    schedule.run({world, delta});
  });

  return (
    <>
      <Background/>
      <OrbitControls dampingFactor={1}/>
      <PerspectiveCamera makeDefault position={[40, 20, 20]}/>
    </>
  )
}


function Background() {

  return (
    <>
      <color attach="background" args={['#060612']}/>
      <directionalLight castShadow color={"#ffb65e"} intensity={3} position={[4, 3, 1]}/>

      <Grid
        infiniteGrid
        fadeDistance={500}
        fadeStrength={5}
        cellSize={0.6} sectionSize={3}
        sectionColor={'#3d4367'}
        cellColor={'rgb(15,28,145)'}
      />

      <Environment frames={1} environmentIntensity={0.4}>
        <Sky sunPosition={[0, 1, 11]}/>
      </Environment>
    </>
  )
}