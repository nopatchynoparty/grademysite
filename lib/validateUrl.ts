export function isPrivateUrl(urlStr: string): boolean {
  let host: string;
  try {
    host = new URL(urlStr).hostname.toLowerCase();
  } catch {
    return true;
  }

  if (["localhost", "0.0.0.0", "::1", "[::1]"].includes(host)) return true;

  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const [, a, b] = ipv4.map(Number);
    if (a === 10) return true;                         // 10.0.0.0/8
    if (a === 172 && b >= 16 && b <= 31) return true;  // 172.16.0.0/12
    if (a === 192 && b === 168) return true;           // 192.168.0.0/16
    if (a === 127) return true;                        // 127.0.0.0/8
    if (a === 169 && b === 254) return true;           // 169.254.0.0/16 AWS metadata
    if (a === 0) return true;
  }

  return false;
}
