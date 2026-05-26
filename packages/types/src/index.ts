export type { ApiFunction, ApiModule, ApiParameter, ApiVariable } from "./api-doc";
export { parseDefoldApiDoc } from "./api-doc";
export {
  DEFOLD_TYPE_MAP,
  type Hash,
  type Matrix4,
  type Quaternion,
  type Url,
  type Vector,
  type Vector3,
  type Vector4,
} from "./core-types";
export { type EmitOptions, emitDeclarations } from "./emit-dts";
