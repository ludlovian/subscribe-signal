# subscribe-signal

Allows you to subscribe to a reactive function and receive updates as the
data changes - possibly diffed

## subscribeSignal(fn, callback, opts) => dispose

The default export.

Parameters:
### fn: () => object

The data-producing signal-based function to be called to get the
current state.

### callback: (object) => void

The function to be called with the state (or the diff) whenever it
changes


### opts: {}
The configurable options

#### .diff
Set to true to send back diffs each time rather than the full data.

The objects are diffed with `@ludlovian/diff-object` and diff options can
be passed down

#### .debounce

If set to a millisecond value, a debouncer will be used to aggegate
many reactive changes into fewer callbacks


#### .bouncer

If given, this should be a `@ludlovian/bouncer` whose configuration will
be copied to carry out the debouncing
