import "./generated/go";
import "./generated/msg";
import "./generated/vmath";

export type { ApiFunction, ApiModule, ApiParameter, ApiVariable } from "./src/api-doc";
export { parseDefoldApiDoc } from "./src/api-doc";
export {
  DEFOLD_TYPE_MAP,
  type Hash,
  type Matrix4,
  type Quaternion,
  type Url,
  type Vector,
  type Vector3,
  type Vector4,
} from "./src/core-types";
export { type EmitOptions, emitDeclarations } from "./src/emit-dts";
export { type WrapOptions, wrapAsAmbientGlobal } from "./src/publish-dts";
