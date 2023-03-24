const core = require('@actions/core')
const ejs = require('ejs')
const { readFile } = require('fs').promises
const { join } = require('path')

const validateDatabaseIntegrity = () => {
  return true
}

const generateReportContent = async (computers, jenkinsDomain) => {
  core.debug('Generating report content')
  const template = await readFile(
    join(process.cwd(), 'templates/report.ejs'),
    'utf8'
  )
  return ejs.render(template, { computers, jenkinsDomain })
}

module.exports = {
  validateDatabaseIntegrity,
  generateReportContent
}
