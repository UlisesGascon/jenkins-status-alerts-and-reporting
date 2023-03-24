const core = require('@actions/core')
const ejs = require('ejs')
const { readFile } = require('fs').promises
const { join } = require('path')

const validateDatabaseIntegrity = () => {
  return true
}

const generateReportContent = async ({
  computers,
  jenkinsDomain,
  reportTagsEnabled
}) => {
  core.debug('Generating report content')
  const template = await readFile(
    join(process.cwd(), 'templates/report.ejs'),
    'utf8'
  )
  return ejs.render(template, { computers, jenkinsDomain, reportTagsEnabled })
}

module.exports = {
  validateDatabaseIntegrity,
  generateReportContent
}
