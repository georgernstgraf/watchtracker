import * as config from "./config.ts";

function lenPrefixedBytes(str: string): Uint8Array {
    const encoder = new TextEncoder();
    const payload = encoder.encode(str);
    if (payload.length > 65535) {
        throw new Error("Field too long for two-byte length: " + str);
    }
    const result = new Uint8Array(2 + payload.length);
    const view = new DataView(result.buffer);
    view.setUint16(0, payload.length, false);
    result.set(payload, 2);
    return result;
}

export async function testsaslauthd(
    username: string,
    password: string,
): Promise<boolean> {
    if (config.saslauthdLieTrue) return true;

    const service = "imap";
    const request = new Uint8Array([
        ...lenPrefixedBytes(username),
        ...lenPrefixedBytes(password),
        ...lenPrefixedBytes(service),
        ...lenPrefixedBytes(""),
    ]);

    let conn: Deno.UnixConn | undefined;
    try {
        conn = (await Deno.connect({
            transport: "unix",
            path: config.saslauthdMux,
        })) as Deno.UnixConn;
        await conn.write(request);

        const response = new Uint8Array(256);
        const n = await conn.read(response);
        if (n === null || n < 4) return false;

        const view = new DataView(response.buffer, 0, n);
        const len = view.getUint16(0, false);
        const text = new TextDecoder().decode(response.slice(2, 2 + len));
        return text.startsWith("OK");
    } catch (err) {
        console.error("Socket error:", err);
        return false;
    } finally {
        conn?.close();
    }
}
