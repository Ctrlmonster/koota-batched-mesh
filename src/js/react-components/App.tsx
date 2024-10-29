import {Canvas} from "@react-three/fiber";
import {useQuery} from "koota/react";
import {SceneContainer} from "./SceneContainer";
import {useExampleActions} from "../ecs";
import {BatchCoordinates, Position, TBatchedMesh} from "../ecs/traits";


export default function App() {
  const allEntities = useQuery(Position);
  const batchInstances = useQuery(BatchCoordinates);
  const batchedMeshes = useQuery(TBatchedMesh);
  const {removeBatch, addBatch, setDeleteSetting, setInstanceNumber} = useExampleActions();


  return (
    <div className={"Container text-white"} id={"app"}>
      <Canvas shadows>
        <SceneContainer/>
      </Canvas>

      <div className={`absolute top-0 w-full flex justify-center`} style={{fontSize: "1.2rem"}}>
        Each Batched Mesh can hold 100 instances. Spawn Instances using the Slider and add/remove Batches to match demand.
      </div>

      <div className={`absolute bottom-5 right-5`}>

        <div className={`flex gap-5 mb-5`} style={{fontSize: "2rem"}}>
          Instance Count
        </div>


        <div className={`flex gap-5 mb-5`}>


          <input className={`w-56`} type={"range"} min={0} max={1500} onChange={(e) => {
            setInstanceNumber(Number(e.target.value))
          }} />

          <div>
            {allEntities.length}
          </div>

        </div>


        <div className={`flex gap-5 mb-5`}>
          <div onClick={addBatch} className={"btn btn-blue"}>
            Add BatchedMesh!
          </div>

          <div onClick={removeBatch} className={"btn btn-red"}>
            Remove BatchedMesh!
          </div>
        </div>


        <div className={`flex gap-5`}>
          <div className={`text-xl`}>Delete Instance Entities on Batch Removal:</div>
          <input type={"checkbox"} onChange={(e) => {
            setDeleteSetting(e.target.checked);
          }}/>
        </div>
        <div>

        </div>

      </div>


      <div className={"absolute bottom-5 left-5"} style={{fontSize: "1.5rem"}}>
        Number of Entities: {allEntities.length}<br/>
        Number of Batch Instances: {batchInstances.length}<br/>
        Number of Batched Meshes: {batchedMeshes.length}<br/>
      </div>

    </div>
  )
}


