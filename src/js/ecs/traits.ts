import {relation, trait} from "koota";
import {BatchedMesh, BufferGeometry, Color, Mesh, Quaternion, Scene, Vector3} from "three";

// for demo purposes we store all traits (ecs components) in a single file
export const TBatchedMesh = trait(() => ({}) as BatchedMesh);
export const BatchSettings = trait({
  deleteInstancesOnBatchRemoval: false,
});
export const BatchIsFull = trait();
export const BatchCount = trait({current: 0, max: 100});
export const DestroyMe = trait();
export const Position = trait(() => new Vector3());
export const Rotation = trait(() => new Quaternion());
export const Scale = trait(() => new Vector3());
export const TColor = trait(() => new Color());
// we only use this mesh as an init value for types, we'll pass the actual mesh when adding this trait
export const TMesh = trait(() => new Mesh);
export const TScene = trait(() => ({}) as Scene);
export const GeometryCache = trait(() => new Map<BufferGeometry, number>);

export const BatchCoordinates = trait({
  geometryId: -1,
  instanceId: -1,
  batchedMesh: new BatchedMesh(0, 0, 0),
  batchEntity: -1
});


export const SpawnTime = trait({origin: 0, timeAlive: 0});


export const IsBatchedOriginOf = relation();
