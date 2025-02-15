import prompts from 'prompts'
import { parseNi, run } from '@antfu/ni'
import { isRelative } from './options'
import { resolveImportPath } from './utils'

const officialThemes: Record<string, string> = {
  'none': '',
  'default': '@slidev/theme-default',
  'seriph': '@slidev/theme-seriph',
  'apple-basic': '@slidev/theme-apple-basic',
}

export function packageExists(name: string) {
  try {
    if (resolveImportPath(`${name}/package.json`))
      return true
  }
  catch {}
  return false
}

export function resolveThemeName(name: string) {
  if (!name || name === 'none')
    return ''
  if (name.startsWith('@slidev/theme-') || name.startsWith('slidev-theme-'))
    return name
  if (isRelative(name))
    return name

  // search for local packages first
  if (packageExists(`@slidev/theme-${name}`))
    return `@slidev/theme-${name}`
  if (packageExists(`slidev-theme-${name}`))
    return `slidev-theme-${name}`

  // fallback to prompt install
  if (officialThemes[name] != null)
    return officialThemes[name]
  return `slidev-theme-${name}`
}

export async function promptForThemeInstallation(name: string) {
  name = resolveThemeName(name)
  if (!name)
    return name

  if (isRelative(name) || packageExists(name))
    return name

  const { confirm } = await prompts({
    name: 'confirm',
    initial: 'Y',
    type: 'confirm',
    message: `The theme "${name}" was not found in your project, do you want to install it now?`,
  })

  if (!confirm)
    return false

  await run(parseNi, [name])

  return name
}
