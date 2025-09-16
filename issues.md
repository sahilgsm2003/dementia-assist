# Known Issues

- **[BUG] Face detection allows non-face images:** The `DeepFace.extract_faces` function does not reliably raise an error for all images that lack a clear face (like a landscape photo), allowing them to be saved incorrectly.
  - **Status:** Deferred.
