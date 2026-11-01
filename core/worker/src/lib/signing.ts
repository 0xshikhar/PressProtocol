import {
  publicKeyFromPrivate,
  signArticleV2,
  verifyPublication,
  type PublicationVerification,
  type SignatureStatus,
} from '@pressprotocol/sdk/protocol';

export interface Attribution {
  pubkey: string;
  signature: string;
  sigVersion?: 1 | 2;
  status: SignatureStatus;
}

export interface Submission {
  title: string;
  tags: string[];
  timestamp: string;
  content: string;
  publicKey?: string;
  signature?: string;
}

const UNSIGNED: Attribution = { pubkey: '', signature: 'unsigned', status: 'unsigned' };

/**
 * Verifies a client-supplied signature before the edge pins anything on the publisher's behalf.
 * Unsigned submissions are allowed (and labelled as such); a supplied but invalid signature is rejected.
 */
export async function attributeSubmission(
  input: Submission
): Promise<{ ok: true; attribution: Attribution } | { ok: false; verification: PublicationVerification }> {
  if (!input.publicKey && !input.signature) return { ok: true, attribution: UNSIGNED };

  const verification = await verifyPublication({
    title: input.title,
    tags: input.tags,
    timestamp: input.timestamp,
    content: input.content,
    publicKey: input.publicKey,
    signature: input.signature,
  });

  if (!verification.signatureValid || !verification.version) return { ok: false, verification };

  return {
    ok: true,
    attribution: {
      pubkey: verification.publicKey,
      signature: verification.signature,
      sigVersion: verification.version,
      status: verification.status,
    },
  };
}

/** Signs edge-ingested content with the operator key when EDGE_SIGNING_KEY is configured. */
export async function signWithEdgeKey(submission: Omit<Submission, 'publicKey' | 'signature'>, edgeKeyHex?: string): Promise<Attribution> {
  if (!edgeKeyHex) return UNSIGNED;
  const signature = await signArticleV2(submission, edgeKeyHex);
  return { pubkey: await publicKeyFromPrivate(edgeKeyHex), signature, sigVersion: 2, status: 'verified' };
}
