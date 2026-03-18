type SupabaseScope = "browser" | "server"

const SUPABASE_WRAPPED = Symbol.for("vibe-check.supabase.wrapped")

const isObjectLike = (value: unknown): value is Record<PropertyKey, unknown> => {
  return typeof value === "object" && value !== null
}

const hasErrorField = (value: unknown): value is { error: unknown } => {
  return isObjectLike(value) && "error" in value && Boolean(value.error)
}

const errorToLogPayload = (error: unknown) => {
  if (!isObjectLike(error)) {
    return { message: String(error) }
  }

  return {
    message: typeof error.message === "string" ? error.message : String(error),
    code: typeof error.code === "string" ? error.code : undefined,
    status:
      typeof error.status === "number" || typeof error.status === "string"
        ? error.status
        : undefined,
    details: typeof error.details === "string" ? error.details : undefined,
    hint: typeof error.hint === "string" ? error.hint : undefined,
    name: typeof error.name === "string" ? error.name : undefined,
  }
}

const logSupabaseError = (scope: SupabaseScope, operation: string, error: unknown) => {
  console.error(`[supabase:${scope}] ${operation} failed`, errorToLogPayload(error))
}

const formatOperation = (path: string, method: string, args: unknown[]) => {
  if (method === "from" && typeof args[0] === "string") {
    return `${path}.from(${args[0]})`
  }
  if (method === "rpc" && typeof args[0] === "string") {
    return `${path}.rpc(${args[0]})`
  }
  if (method === "channel" && typeof args[0] === "string") {
    return `${path}.channel(${args[0]})`
  }
  return `${path}.${method}`
}

export const withSupabaseErrorLogging = <T extends object>(client: T, scope: SupabaseScope): T => {
  const cache = new WeakMap<object, unknown>()

  const wrap = (value: unknown, path: string): unknown => {
    if (!isObjectLike(value)) {
      return value
    }

    if (SUPABASE_WRAPPED in value) {
      return value
    }

    const cached = cache.get(value)
    if (cached) {
      return cached
    }

    const proxy = new Proxy(value, {
      get(target, prop, receiver) {
        if (prop === SUPABASE_WRAPPED) {
          return true
        }

        const original = Reflect.get(target, prop, receiver)

        if (typeof prop === "symbol") {
          return original
        }

        const member = String(prop)

        if (member === "then" && typeof original === "function") {
          return (onFulfilled?: (value: unknown) => unknown, onRejected?: (reason: unknown) => unknown) => {
            const wrappedFulfilled = (resolved: unknown) => {
              if (hasErrorField(resolved)) {
                logSupabaseError(scope, path, resolved.error)
              }
              return onFulfilled ? onFulfilled(resolved) : resolved
            }

            const wrappedRejected = (reason: unknown) => {
              logSupabaseError(scope, path, reason)
              if (onRejected) {
                return onRejected(reason)
              }
              throw reason
            }

            return original.call(target, wrappedFulfilled, wrappedRejected)
          }
        }

        if (typeof original === "function") {
          return (...args: unknown[]) => {
            const operation = formatOperation(path, member, args)
            try {
              const result = original.apply(target, args as never[])
              return wrap(result, operation)
            } catch (error) {
              logSupabaseError(scope, operation, error)
              throw error
            }
          }
        }

        return wrap(original, `${path}.${member}`)
      },
    })

    cache.set(value, proxy)
    return proxy
  }

  return wrap(client, "supabase") as T
}

