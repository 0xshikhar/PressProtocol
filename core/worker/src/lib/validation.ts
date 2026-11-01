const CID_PATTERN = /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|baf[0-9a-z]{40,100})$/;

export function isValidCID(cid: unknown): cid is string {
  return typeof cid === 'string' && CID_PATTERN.test(cid.trim());
}
