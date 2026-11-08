import { readFileSync, writeFileSync } from 'node:fs'
import { strToU8, unzipSync, zipSync } from 'fflate'
import { MemoryFs, getFs, setFs } from '@/core/fs'
import { createEntity, SCHEMA_VERSION } from '@/core/model'
import { createProject, importProjectZip, loadProject, readDocument, saveCollection, saveMeta, writeDocument, zipProject } from '@/core/project'
import { projectPaths } from '@/core/project/paths'

/**
 * Full compatibility: projects open both ways between the desktop and the mobile app, with nothing lost.
 * The mobile app runs the desktop's own project code (`@` = desktop/src), so these tests guard what can still drift:
 * the desktop submodule moving to a version that can't open older files, and the two apps' dependencies.
 */
const FIXTURE = new URL('../fixtures/desktop-project.zip', import.meta.url)
const image = new Uint8Array([137, 80, 78, 71, 0, 255, 1, 2])

async function makeDesktopProject() {
  setFs(new MemoryFs())
  const p = await createProject({ name: 'Ironhold', description: 'A dwarf game', components: ['wiki', 'item-list', 'sketch'] })
  const sword = createEntity('item', 'Sword')
  sword.description = 'A sharp blade'
  await saveCollection(p.root, 'item', [sword])
  await writeDocument(p.root, 'wiki', 'a1', { id: 'a1', title: 'Ironhold', body: '<p>Dwarven city</p>' })
  await writeDocument(p.root, 'sketch', 's1', { layers: [{ id: 'l1', strokes: [[1, 2, 0.5]] }] })
  // A field from some future version: must survive a trip through the other app.
  await saveMeta(p.root, { ...p.meta, futureField: { keep: true } } as typeof p.meta)
  await getFs().writeBinaryAtomic(await getFs().join(await projectPaths.imagesDir(p.root), 'map.png'), image)
  return zipProject(p.root)
}

/** Open a project file the way either app does ("Import zip"), change it, and hand back the file it exports. */
async function openEditExport(zip: Uint8Array, description: string) {
  setFs(new MemoryFs())
  const root = await importProjectZip(zip)
  const p = await loadProject(root)
  await saveMeta(root, { ...p.meta, description })
  return zipProject(root)
}

describe('desktop <-> mobile project files', () => {
  it.runIf(process.env.MAKE_FIXTURE)('writes the fixture (MAKE_FIXTURE=1 npm test)', async () => {
    writeFileSync(FIXTURE, await makeDesktopProject())
  })

  it('opens a project file saved by desktop 0.25.1 and keeps every file byte for byte', async () => {
    const original = new Uint8Array(readFileSync(FIXTURE))
    setFs(new MemoryFs())
    const root = await importProjectZip(original)
    expect((await loadProject(root)).meta.name).toBe('Ironhold')
    const a = unzipSync(original)
    const b = unzipSync(await zipProject(root))
    expect(Object.keys(b).sort()).toEqual(Object.keys(a).sort())
    // project.json only gets the new id every imported copy gets (desktop behaviour).
    for (const name of Object.keys(a)) if (name !== 'project.json') expect(b[name]).toEqual(a[name])
  })

  it('desktop -> mobile -> desktop loses nothing, including data the other side does not know', async () => {
    const fromMobile = await openEditExport(await makeDesktopProject(), 'Edited on my tablet')
    setFs(new MemoryFs())
    const root = await importProjectZip(fromMobile)
    const back = await loadProject(root)
    expect(back.meta.description).toBe('Edited on my tablet')
    expect(back.meta.enabledComponents).toEqual(['wiki', 'item-list', 'sketch'])
    expect((back.meta as unknown as { futureField: unknown }).futureField).toEqual({ keep: true })
    expect(back.entities.item.map((e) => [e.name, e.description])).toEqual([['Sword', 'A sharp blade']])
    expect(await readDocument(root, 'wiki', 'a1', () => null)).toEqual({ id: 'a1', title: 'Ironhold', body: '<p>Dwarven city</p>' })
    expect(await readDocument(root, 'sketch', 's1', () => null)).toEqual({ layers: [{ id: 'l1', strokes: [[1, 2, 0.5]] }] })
    expect(await getFs().readBinary(await getFs().join(await projectPaths.imagesDir(root), 'map.png'))).toEqual(image)
  })

  it('refuses a project from a newer version instead of damaging it', async () => {
    const zip = zipSync({ 'project.json': strToU8(JSON.stringify({ schemaVersion: SCHEMA_VERSION + 1, data: { name: 'New' } })) })
    setFs(new MemoryFs())
    await expect(importProjectZip(zip)).rejects.toThrow(/newer version/)
  })
})

describe('same code as the desktop', () => {
  const read = (path: string) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'))
  it('uses the same dependency versions as the desktop app (run scripts/sync-deps.mjs after bumping desktop/)', () => {
    const desktop = read('../desktop/package.json')
    const mobile = read('../package.json')
    expect(mobile.dependencies).toEqual(desktop.dependencies)
    for (const [name, version] of Object.entries(desktop.devDependencies)) {
      if (name !== 'oxlint') expect([name, mobile.devDependencies[name]]).toEqual([name, version])
    }
  })
})
