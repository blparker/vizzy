import { transform, type Message } from 'esbuild';

export type TranspileResult =
    | { ok: true; code: string }
    | { ok: false; errors: Message[] };

export async function transpileTs(source: string): Promise<TranspileResult> {
    try {
        const result = await transform(source, {
            loader: 'ts',
            format: 'esm',
            target: 'es2022',
            sourcemap: false,
        });
        return { ok: true, code: result.code };
    } catch (err) {
        const errors = (err as { errors?: Message[] }).errors ?? [];
        return { ok: false, errors };
    }
}
