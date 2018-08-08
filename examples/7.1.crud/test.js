import "vendors/shims"
import * as T from "common/types"

let form = {
  id: "0123456789",
  title: 'Test',
  text: 'dfdf',
  tags: ['s'],
  isPublished: false,
  publishDate: new Date('2018-08-09')
}

console.log(T.Post(form))
