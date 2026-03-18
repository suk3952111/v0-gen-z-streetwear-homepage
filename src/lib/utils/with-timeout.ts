export const withTimeout = <T>(promise: Promise<T>, ms: number = 4000): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`요청 시간이 초과되었습니다 (${ms}ms) - Supabase 무한 대기 강제 종료`))
    }, ms)

    promise
      .then((value) => {
        clearTimeout(timer)
        resolve(value)
      })
      .catch((reason) => {
        clearTimeout(timer)
        reject(reason)
      })
  })
}
