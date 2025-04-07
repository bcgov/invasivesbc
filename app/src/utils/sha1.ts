async function sha1(msg: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(msg);
  const hash = await window.crypto.subtle.digest('SHA-1', data);
  const decoder = new TextDecoder();

  return decoder.decode(hash);
}

export { sha1 };
