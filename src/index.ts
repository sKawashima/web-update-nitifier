import * as argv from 'argv'

const url = new URL(argv.run()['targets'][0])
console.log(`Start monitoring: ${url}`)

if (url.host !== 'github.com') {
  console.error('please check url')
  process.exit()
}

const owner = url.pathname.split('/')[1]
const repo = url.pathname.split('/')[2]
const type = url.pathname.split('/')[3]
const number = Number(url.pathname.split('/')[4])

import * as dotenv from 'dotenv'
dotenv.config()
const env = process.env

import * as Octokit from '@octokit/rest'

const octokit = new Octokit({
  auth: env.GITHUB_TOKEN
})

let comments:number = 0

import * as notifier from 'node-notifier'
import 'opener'

const notice = (comments_n) => {
  notifier.notify({
      title: url.toString(),
      message: `更新されました: ${comments_n}`,
  })

  notifier.on('click', function (notifierObject, options) {
      console.log('click')
      opener(url.toString())
  })
}

const checkIssue = () => {
  octokit.issues
    .get({
        owner: owner,
        repo: repo,
        issue_number: number
    })
    .then(res => {
      const res_comments = res['data']['comments']
      if (res_comments !== comments) {
        notice(res_comments)
        comments = res_comments
        console.log(`comments: ${res_comments} ${url.toString()}`)
      } else {
        console.log('no update')
      }
    })
}

checkIssue()

import * as cron from 'node-cron'

cron.schedule('* * * * *', () => checkIssue())
