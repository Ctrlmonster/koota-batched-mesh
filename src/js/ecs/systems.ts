import {Entity, Not, World} from "koota";
import {
  BatchCoordinates,
  BatchCount,
  BatchIsFull,
  BatchSettings,
  DestroyMe,
  GeometryCache,
  IsBatchedOriginOf,
  Position,
  Rotation,
  Scale,
  SpawnTime,
  TBatchedMesh,
  TColor
} from "./traits";
import {BoxGeometry, Matrix4, SphereGeometry, TorusGeometry, TorusKnotGeometry, Vector3} from "three";


// for demo purposes we store all systems in a single file


// =====================================================================================================================
// =====================================================================================================================


const boxGeometry = new BoxGeometry();
const sphere = new SphereGeometry();
const torus = new TorusGeometry();
const torusKnot = new TorusKnotGeometry();
const geometries = [
  boxGeometry, // skewing the chance towards boxes for aesthetic purposes
  boxGeometry,
  boxGeometry,
  sphere,
  torus,
  torus,
  torusKnot
];

const tempMatrix = new Matrix4();


export const SpawnBatchInstances = ({world}: { world: World }) => {
  const batchEntity = world.queryFirst(TBatchedMesh, GeometryCache, BatchCount, Not(BatchIsFull));
  if (batchEntity === undefined) return;


  world.query(Position, TColor, Not(BatchCoordinates)).updateEach(([pos, color], entity) => {
    const geometry = geometries[Math.trunc(Math.random() * geometries.length)];
    let {current: currentBatchCount, max: maxBatchCount} = batchEntity.get(BatchCount);

    if (batchEntity.has(BatchIsFull)) return;

    currentBatchCount++;
    batchEntity.set(BatchCount, {
      current: currentBatchCount
    });

    if (currentBatchCount === maxBatchCount) {
      batchEntity.add(BatchIsFull);
    }

    // ---------------------------------------------------------------------------


    const batchedMesh = batchEntity.get(TBatchedMesh);
    const geomCache = batchEntity.get(GeometryCache);
    let geometryId;

    // new geometry encountered
    if (!geomCache.has(geometry)) {
      geometryId = batchedMesh.addGeometry(geometry);
      geomCache.set(geometry, geometryId);
    }
    // old geometry
    else {
      geometryId = geomCache.get(geometry)!;
    }

    // add new instance
    const instanceId = batchedMesh.addInstance(geometryId);


    // save batchedMesh "coordinates"
    entity.add(BatchCoordinates({geometryId, instanceId, batchedMesh, batchEntity}));

    batchEntity.add(IsBatchedOriginOf(entity));

    // write the initial position
    tempMatrix.setPosition(pos);
    batchedMesh.setMatrixAt(instanceId, tempMatrix);

    // write the color
    batchedMesh.setColorAt(instanceId, color);


    // update bounding box/sphere for culling
    batchedMesh.computeBoundingBox();
    batchedMesh.computeBoundingSphere();


  }, {
    changeDetection: false
  });


}


// =====================================================================================================================
// =====================================================================================================================

export const RemoveBatchInstances = ({world}: { world: World }) => {

  world.query(BatchCoordinates, DestroyMe).updateEach(
    ([bCoords], entity) => {

      const {instanceId, batchedMesh, batchEntity} = bCoords;
      batchedMesh.deleteInstance(instanceId);
      batchedMesh.computeBoundingBox();
      batchedMesh.computeBoundingSphere();

      const currentCount = (batchEntity as Entity).get(BatchCount).current;
      (batchEntity as Entity).set(BatchCount, {current: currentCount - 1});
      (batchEntity as Entity).remove(BatchIsFull);

      entity.destroy();

    }, {changeDetection: false}
  )

}
// =====================================================================================================================
// =====================================================================================================================


export const DestroyBatchedMesh = ({world}: { world: World }) => {
  const {deleteInstancesOnBatchRemoval} = world.get(BatchSettings);


  world.query(TBatchedMesh, DestroyMe).updateEach(
    ([batchedMesh], batchEntity) => {

      // remove all entities that have been spawned for this batch
      if (batchEntity.has(IsBatchedOriginOf("*"))) {
        const batchInstances = batchEntity.targetsFor(IsBatchedOriginOf);
        batchInstances.forEach(instanceEntity => {
          // if we wanted to, we could just remove the BatchCoordinates trait and keep the
          // entity around to be picked up by the next batch entity
          const {instanceId} = instanceEntity.get(BatchCoordinates);
          instanceEntity.remove(BatchCoordinates);

          if (deleteInstancesOnBatchRemoval) {
            instanceEntity.destroy();
          }
          batchedMesh.deleteInstance(instanceId);
        });
      }

      batchedMesh.parent!.remove(batchedMesh);
      batchEntity.destroy();

    }, {changeDetection: false}
  )

}


// =====================================================================================================================
// =====================================================================================================================


const _m2 = new Matrix4();
const scale = new Vector3(1, 1, 1);
export const SyncBatchTransforms = ({world}: { world: World }) => {

  world.query(Position, Rotation, BatchCoordinates).updateEach(
    ([pos, rot, bCoords], entity) => {
      const {batchedMesh, instanceId} = bCoords;

      const _scale = entity.has(Scale) ? entity.get(Scale) : scale; // making scale optional
      _m2.compose(pos, rot, _scale);

      batchedMesh.setMatrixAt(instanceId, _m2);

    }, {changeDetection: false}
  )

}


// =====================================================================================================================
// =====================================================================================================================

const axisOfRotation = new Vector3(0, 1, 0);

export const RandomTransforms = ({world, delta}: { world: World, delta: number }) => {
  world.query(Position, Rotation, SpawnTime).updateEach(
    ([pos, rot, timer], entity) => {
      timer.timeAlive += delta;

      pos.y += Math.sin(timer.timeAlive) * 0.05;

      rot.x = (axisOfRotation.x + Math.cos(timer.timeAlive)) * Math.sin(timer.timeAlive);
      rot.z = (axisOfRotation.z + Math.sin(timer.timeAlive)) * Math.sin(timer.timeAlive);
      rot.y = axisOfRotation.y * Math.sin(timer.timeAlive);
      rot.w = Math.cos(timer.timeAlive);
      rot.normalize();
    }
  )

}