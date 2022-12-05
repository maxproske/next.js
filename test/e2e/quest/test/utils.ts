import fs from 'fs-extra'
import { join } from 'path'
import { fetchViaHTTP } from 'next-test-utils'
import { createNext, FileRef } from 'e2e-utils'
import type { NextInstance } from 'test/lib/next-modes/base'

jest.setTimeout(2 * 60 * 1000)

export let next: NextInstance | undefined

export function init(example = '') {
  if ((global as any).isNextDeploy) {
    it('should not run for next deploy', () => {})
    return
  }

  let origPackageJson

  beforeAll(async () => {
    const srcDir = join(__dirname, '../../../../examples', example)
    const srcFiles = await fs.readdir(srcDir)

    const packageJson = await fs.readJson(join(srcDir, 'package.json'))
    const { scripts, dependencies, devDependencies } = packageJson

    origPackageJson = packageJson

    next = await createNext({
      files: srcFiles.reduce((prev, file) => {
        if (file !== 'package.json') {
          prev[file] = new FileRef(join(srcDir, file))
        }
        return prev
      }, {} as { [key: string]: FileRef }),
      dependencies: {
        ...dependencies,
        ...devDependencies,
      },
      installCommand: `pnpm install`,
      buildCommand: `pnpm ${scripts.build}`,
      startCommand: (global as any).isNextDev
        ? `pnpm ${scripts.dev}`
        : `pnpm ${scripts.start}`,
    })
  })
  afterAll(() => next?.destroy())

  it(`should compile and serve the index page correctly`, async () => {
    try {
      expect(await next.readFile('pnpm-lock.yaml')).toBeTruthy()

      expect(next.cliOutput).toMatch(/Compiled successfully/)

      const res = await fetchViaHTTP(next.url, '/')
      expect(res.status).toBe(200)
      expect(await res.text()).toContain('<html')
    } finally {
    }
  })
}
