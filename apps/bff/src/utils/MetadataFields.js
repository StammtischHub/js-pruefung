const ALLOWED_METADATA_FIELDS = ["kind", "docId", "docDateSic", "docSubject"];

export function getUnknownMetadataFields(body) {
  return Object.keys(body).filter((key) => !ALLOWED_METADATA_FIELDS.includes(key));
}
