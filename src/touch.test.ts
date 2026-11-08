import { HOLD_MS, installTouch } from './touch'

// Node has Event/EventTarget but no MouseEvent: a stand-in that keeps what the helper sets.
globalThis.MouseEvent ??= class extends Event {
  constructor(type: string, init: EventInit) {
    super(type, init)
  }
} as unknown as typeof MouseEvent

function setup() {
  const doc = new EventTarget() as unknown as Document
  installTouch(doc)
  const seen: string[] = []
  for (const t of ['contextmenu', 'dblclick', 'click']) doc.addEventListener(t, (e) => !e.defaultPrevented && seen.push(t))
  const fire = (type: string, x = 0, y = 0, pointerType = 'touch') =>
    doc.dispatchEvent(Object.assign(new Event(type, { cancelable: true }), { pointerType, isPrimary: true, clientX: x, clientY: y }))
  return { seen, fire }
}

describe('touch helper', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('a finger held still opens the right-click menu, and the lift does not click', () => {
    const { seen, fire } = setup()
    fire('pointerdown')
    vi.advanceTimersByTime(HOLD_MS)
    fire('pointerup')
    fire('click')
    expect(seen).toEqual(['contextmenu'])
    fire('pointerdown')
    fire('pointerup')
    fire('click')
    expect(seen).toEqual(['contextmenu', 'click'])
  })

  it('moving the finger (scrolling, dragging) is not a long-press', () => {
    const { seen, fire } = setup()
    fire('pointerdown')
    fire('pointermove', 30, 0)
    vi.advanceTimersByTime(HOLD_MS)
    expect(seen).toEqual([])
  })

  it('two quick taps are a double-click, slow taps are not', () => {
    const { seen, fire } = setup()
    const tap = (wait: number) => (vi.advanceTimersByTime(wait), fire('pointerdown'), fire('pointerup'))
    tap(0)
    tap(150)
    expect(seen).toEqual(['dblclick'])
    tap(2000)
    tap(600)
    expect(seen).toEqual(['dblclick'])
  })

  it('leaves mouse and pen alone, and drops the second of two menus (Android sends its own)', () => {
    const { seen, fire } = setup()
    fire('pointerdown', 0, 0, 'pen')
    vi.advanceTimersByTime(HOLD_MS)
    expect(seen).toEqual([])
    fire('pointerdown')
    vi.advanceTimersByTime(HOLD_MS)
    fire('contextmenu')
    expect(seen).toEqual(['contextmenu'])
  })
})
