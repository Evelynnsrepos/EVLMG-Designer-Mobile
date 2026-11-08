/**
 * Touch screens have no right-click and unreliable double-click. Turn a finger held still into a right-click
 * (`contextmenu`) and two quick taps into a double-click, once for the whole app, so every desktop menu and
 * rename works unchanged (touch plan T2). Pens and mice are left alone.
 */
export const HOLD_MS = 500
const SLOP_PX = 10
const DOUBLE_TAP_MS = 300
const DOUBLE_TAP_PX = 25
/** Android's web view sends its own events too: one of a pair arriving this close together is dropped. */
const DEDUPE_MS = 700

export function installTouch(doc: Document = document) {
  let hold: ReturnType<typeof setTimeout> | undefined
  let start: { x: number; y: number; target: EventTarget } | null = null
  let swallowClick = false
  let lastTap = { t: 0, x: 0, y: 0 }
  let lastMenu = 0
  let lastDouble = 0

  const cancel = () => {
    clearTimeout(hold)
    hold = undefined
    start = null
  }

  doc.addEventListener(
    'pointerdown',
    (e) => {
      swallowClick = false
      if (e.pointerType !== 'touch' || !e.isPrimary) return cancel()
      start = { x: e.clientX, y: e.clientY, target: e.target! }
      const { clientX, clientY } = e
      const target = e.target!
      hold = setTimeout(() => {
        hold = undefined
        swallowClick = true
        target.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX, clientY, button: 2 }))
      }, HOLD_MS)
    },
    { capture: true, passive: true },
  )
  doc.addEventListener(
    'pointermove',
    (e) => {
      if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) > SLOP_PX) cancel()
    },
    { capture: true, passive: true },
  )
  doc.addEventListener('pointercancel', cancel, { capture: true })
  doc.addEventListener(
    'pointerup',
    (e) => {
      const wasTap = start !== null && hold !== undefined
      const target = start?.target
      cancel()
      if (e.pointerType !== 'touch' || !wasTap || !target) return
      const now = Date.now()
      if (now - lastTap.t < DOUBLE_TAP_MS && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < DOUBLE_TAP_PX) {
        lastTap.t = 0
        target.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true, clientX: e.clientX, clientY: e.clientY, detail: 2 }))
      } else lastTap = { t: now, x: e.clientX, y: e.clientY }
    },
    { capture: true, passive: true },
  )
  // After a long-press the finger lifts and the browser sends a click: it must not also press what is under the menu.
  doc.addEventListener(
    'click',
    (e) => {
      if (!swallowClick) return
      swallowClick = false
      e.preventDefault()
      e.stopPropagation()
    },
    { capture: true },
  )
  const dedupe = (kind: 'menu' | 'double') => (e: Event) => {
    const now = Date.now()
    const last = kind === 'menu' ? lastMenu : lastDouble
    if (now - last < DEDUPE_MS) {
      e.preventDefault()
      e.stopImmediatePropagation()
      return
    }
    if (kind === 'menu') lastMenu = now
    else lastDouble = now
  }
  doc.addEventListener('contextmenu', dedupe('menu'), { capture: true })
  doc.addEventListener('dblclick', dedupe('double'), { capture: true })
}

if (typeof document !== 'undefined') installTouch()
