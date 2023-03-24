const core = require('@actions/core')
const ejs = require('ejs')
const { readFileSync } = require('fs')
const { join } = require('path')

const issueTemplate = readFileSync(
  join(process.cwd(), 'templates/issue.ejs'),
  'utf8'
)
const reportTemplate = readFileSync(
  join(process.cwd(), 'templates/report.ejs'),
  'utf8'
)

const validateDatabaseIntegrity = () => {
  return true
}

const generateReportContent = ({
  computers,
  jenkinsDomain,
  reportTagsEnabled
}) => {
  core.debug('Generating report content')
  return ejs.render(reportTemplate, {
    computers,
    jenkinsDomain,
    reportTagsEnabled
  })
}

const generateIssueBodyContent = (computer, jenkinsDomain) => {
  return ejs.render(issueTemplate, { computer, jenkinsDomain })
}

module.exports = {
  validateDatabaseIntegrity,
  generateReportContent,
  generateIssueBodyContent
}
