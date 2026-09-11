import {getDocumentsByState} from "./MetadataService.js";
import { State } from "../domain/types/State.js"

export async function next() {
  const inInbox = await getDocumentsByState(State.INBOX)
  if (inInbox.length === 0) { return null }

  const oldestDocument = inInbox.sort((a, b) => {
    const aDate = new Date(a.creationDate).getTime();
    const bDate = new Date(b.creationDate).getTime();
    return aDate - bDate;
  });

  return oldestDocument[0];
}
