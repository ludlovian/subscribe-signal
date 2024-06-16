import { effect } from '@preact/signals-core'
import diffObject from '@ludlovian/diff-object'
import clone from '@ludlovian/clone'
import Bouncer from '@ludlovian/bouncer'

export default function subscribeSignal (getCurrent, callback, opts = {}) {
  const { diff = true, bouncer: useBouncer, debounce, ...diffOpts } = opts
  let bouncer
  let fn = send
  if (useBouncer) {
    bouncer = new Bouncer({ ...useBouncer, fn: send })
    fn = bouncer.fire
  } else if (debounce) {
    bouncer = new Bouncer({ after: debounce, fn: send })
    fn = bouncer.fire
  }

  let prev = {}
  const dispose = effect(() => fn(getCurrent()))

  return stop

  function send () {
    let data = getCurrent()
    if (diff) {
      const _data = data
      data = diffObject(prev, _data, diffOpts)
      prev = clone(_data)
      if (!Object.keys(data).length) data = null
    }
    if (data !== null) callback(data)
  }

  function stop () {
    dispose()
    bouncer && bouncer.cancel()
  }
}
