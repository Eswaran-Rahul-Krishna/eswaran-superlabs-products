/**
 * Windows + Node.js 23.x workaround for @tailwindcss/node.
 *
 * @tailwindcss/node registers an ESM module hook via Module.register() to
 * cache ESM imports (performance optimisation). On Windows with Node 23.x,
 * that registration internally spawns a Worker thread which fails with EINVAL,
 * causing PostCSS / Tailwind compilation to hang or time out.
 *
 * The registration is guarded by:
 *   process.versions.bun || Module.register?.(...)
 *
 * Setting process.versions.bun to a truthy value makes the short-circuit skip
 * the broken call entirely. The ESM cache is optional; skipping it has no
 * functional impact on CSS output.
 */
if (!process.versions.bun) {
  process.versions.bun = "win32-compat";
}
