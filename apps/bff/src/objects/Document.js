export class Document {
  constructor(id, originalName, path, classificationType, state) {
    this.id = id;
    this.originalName = originalName;
    this.path = path;
    this.classificationType = classificationType;
    this.state = state;
    this.confidence = null;
    this.editedBy = [];
    this.deleteFlagSetDate = null;
  }

  addEditor(editor) {
    this.editedBy.push(editor);
  }
}
