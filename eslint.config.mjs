import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({ baseDirectory: __dirname })

const eslintConfig = [
  // Generated output — never lint it. Without this, `eslint .` walks the build
  // directory and drowns real findings in thousands of messages from compiled
  // chunks (and next-env.d.ts, which Next regenerates on every build).
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'] },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
]

export default eslintConfig
