# Defold API doc fixtures

Vendored Defold API doc snapshots used by the parser tests in `../src/api-doc.test.ts`.

## vmath_doc.json

- **Defold version**: 1.12.4 (stable)
- **Source**: `doc/src-script_vmath.cpp_doc.json` inside the `ref-doc.zip` release artifact
  at <https://github.com/defold/defold/releases/download/1.12.4/ref-doc.zip>.
- **How to refresh**:
  ```sh
  curl -L https://github.com/defold/defold/releases/download/1.12.4/ref-doc.zip -o /tmp/ref-doc.zip
  unzip -p /tmp/ref-doc.zip doc/src-script_vmath.cpp_doc.json > packages/types/fixtures/vmath_doc.json
  ```
  Bump the version pin above when refreshing against a newer Defold release.

## msg_doc.json

- **Defold version**: 1.12.4 (stable)
- **Source**: `doc/src-script_msg.cpp_doc.json` inside the `ref-doc.zip` release artifact
  at <https://github.com/defold/defold/releases/download/1.12.4/ref-doc.zip>.
- **How to refresh**:
  ```sh
  curl -L https://github.com/defold/defold/releases/download/1.12.4/ref-doc.zip -o /tmp/ref-doc.zip
  unzip -p /tmp/ref-doc.zip doc/src-script_msg.cpp_doc.json > packages/types/fixtures/msg_doc.json
  ```
  Bump the version pin above when refreshing against a newer Defold release.

## go_doc.json

- **Defold version**: 1.12.4 (stable)
- **Source**: `doc/gameobject_script.cpp_doc.json` inside the `ref-doc.zip` release artifact
  at <https://github.com/defold/defold/releases/download/1.12.4/ref-doc.zip>. The file's
  `info.namespace` is `"go"` even though the source path does not match the namespace.
- **How to refresh**:
  ```sh
  curl -L https://github.com/defold/defold/releases/download/1.12.4/ref-doc.zip -o /tmp/ref-doc.zip
  unzip -p /tmp/ref-doc.zip doc/gameobject_script.cpp_doc.json > packages/types/fixtures/go_doc.json
  ```
  Bump the version pin above when refreshing against a newer Defold release.
