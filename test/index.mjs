import { suite, test } from 'node:test'
import assert from 'node:assert/strict'
import { setTimeout as sleep } from 'node:timers/promises'

import { signal } from '@preact/signals-core'
import Bouncer from '@ludlovian/bouncer'

import subscribeSignal from '../src/index.mjs'

suite('subscribe', () => {
  test('basic send', () => {
    const s = signal({ a: 1, b: 2 })
    const calls = []

    const unsub = subscribeSignal(
      () => s.value,
      x => calls.push(x)
    )

    assert.deepStrictEqual(calls, [{ a: 1, b: 2 }])

    s.value = { ...s.value, b: 3 }

    assert.deepStrictEqual(calls, [{ a: 1, b: 2 }, { b: 3 }])

    unsub()
  })

  test('debounce send', async () => {
    const s = signal({ a: 1, b: 2 })
    const calls = []

    const unsub = subscribeSignal(
      () => s.value,
      x => calls.push(x),
      { debounce: 50 }
    )

    assert.equal(calls.length, 0)

    await sleep(70)
    assert.deepStrictEqual(calls, [{ a: 1, b: 2 }])

    s.value = { ...s.value, b: 3 }
    await sleep(10)

    assert.equal(calls.length, 1)
    s.value = { ...s.value, b: 4 }

    await sleep(70)
    assert.deepStrictEqual(calls, [{ a: 1, b: 2 }, { b: 4 }])

    unsub()
  })

  test('provide bouncer', async () => {
    const s = signal({ a: 1, b: 2 })
    const calls = []
    const bouncer = new Bouncer({ after: 50, fn: () => {} })

    const unsub = subscribeSignal(
      () => s.value,
      x => calls.push(x),
      { bouncer }
    )

    assert.equal(calls.length, 0)

    await sleep(70)
    assert.deepStrictEqual(calls, [{ a: 1, b: 2 }])

    s.value = { ...s.value, b: 3 }
    await sleep(10)

    assert.equal(calls.length, 1)
    s.value = { ...s.value, b: 4 }

    await sleep(70)
    assert.deepStrictEqual(calls, [{ a: 1, b: 2 }, { b: 4 }])

    unsub()
  })

  test('no diff', () => {
    const s = signal({ a: 1, b: 2 })
    const calls = []

    subscribeSignal(
      () => s.value,
      x => calls.push(x),
      { diff: false }
    )

    assert.deepStrictEqual(calls, [{ a: 1, b: 2 }])

    s.value = { ...s.value, b: 3 }

    assert.deepStrictEqual(calls, [
      { a: 1, b: 2 },
      { a: 1, b: 3 }
    ])
  })

  test('diff with no change', async () => {
    const s = signal({ a: 1, b: 2 })
    const calls = []
    const bouncer = new Bouncer({ every: 50, fn: () => {} })

    const unsub = subscribeSignal(
      () => s.value,
      x => calls.push(x),
      { bouncer }
    )

    assert.deepStrictEqual(calls, [{ a: 1, b: 2 }])

    s.value = { ...s.value, b: 3 }
    s.value = { ...s.value, b: 2 }

    await sleep(70)

    assert.deepStrictEqual(calls, [{ a: 1, b: 2 }])

    unsub()
  })

  test('no send after unsub', () => {
    const s = signal({ a: 1, b: 2 })
    const calls = []

    const unsub = subscribeSignal(
      () => s.value,
      x => calls.push(x)
    )

    assert.deepStrictEqual(calls, [{ a: 1, b: 2 }])

    s.value = { ...s.value, b: 3 }

    assert.deepStrictEqual(calls, [{ a: 1, b: 2 }, { b: 3 }])

    unsub()

    s.value = { ...s.value, b: 4 }
    assert.equal(calls.length, 2)
  })
})
