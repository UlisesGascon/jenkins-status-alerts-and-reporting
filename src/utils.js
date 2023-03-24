const core = require('@actions/core')
const Ajv = require('ajv')
const ejs = require('ejs')
const { readFileSync } = require('fs')
const { join } = require('path')

const ajv = new Ajv()
const databaseSchema = require('../schemas/database.json')
const issueTemplate = readFileSync(
  join(process.cwd(), 'templates/issue.ejs'),
  'utf8'
)
const reportTemplate = readFileSync(
  join(process.cwd(), 'templates/report.ejs'),
  'utf8'
)

const validateDatabaseIntegrity = database => {
  const valid = ajv.validate(databaseSchema, database)
  if (!valid) {
    throw new Error(
      `Check: database file as the file is corrupted. Invalid data: ${ajv.errorsText()}`
    )
  }
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
