import {delay, mergeObj} from "./utils"
import * as main from "./apps/main"
import * as userDetail from "./apps/userDetail"

// Test-bench ======================================================================================
main.state.subscribe()
userDetail.state.subscribe()

mergeObj(main.asyncActions).subscribe()
mergeObj(userDetail.asyncActions).subscribe()

;(async () => {
  await delay(1000)
  console.log(`@ setUser({id: "1"})`)
  main.actions.setUser({id: "1", name: "Alice"})

  await delay(1000)
  console.log(`@ setUser({id: "2"})`)
  main.actions.setUser({id: "2", name: "Bob"})

  await delay(1000)
  console.log(`@ setUser({id: "3"})`)
  main.actions.setUser({id: "3", name: "Cindy"})

  for (let id of ["1", "2", "3"]) {
    await delay(1000)
    console.log(`@ navigate to /users/${id}`)
    userDetail.actions.setId(String(id))
  }

  await delay(1000)
  console.log(`@ setUser({id: "3"})`)
  main.actions.setUser({id: "3", name: "Cindy+"})
})()

// let id$ = O.of("1", "2", "3").mergeMap((id, i) => O.of(id).delay(i * 1000))
// id$.subscribe(userDetail.actions.setId)
