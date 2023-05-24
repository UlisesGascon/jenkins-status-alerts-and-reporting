const core = require('@actions/core')
const https = require('https')
const { generateIssueDownBodyContent } = require('./utils')

const getDiskUsageEmoji = diskUsage => {
  if (diskUsage < 60) {
    return '✅'
  } else if (diskUsage < 85) {
    return '⚠️'
  } else {
    return '🔥'
  }
}

const processJenkinsData = ({
  jenkinsData,
  database,
  jenkinsDomain,
  generateIssuesforUnkownNodes
}) => {
  const reportData = []
  const issuesData = []
  const newDatabaseState = {}

  jenkinsData.computer.forEach(computer => {
    core.debug(`Processing ${computer.displayName}...`)
    const diskUsageNode =
      computer.monitorData[
        'org.jenkins.ci.plugins.percentagecolumn.PercentageDiskSpaceMonitor'
      ]
    const data = {
      name: computer.displayName,
      description: computer.description,
      diskUsage: diskUsageNode ? diskUsageNode.percentage : null,
      architecture:
        computer.monitorData['hudson.node_monitors.ArchitectureMonitor'],
      jvmVersion: computer.monitorData['hudson.node_monitors.JvmMonitor'],
      monitorVersion:
        computer.monitorData['hudson.plugin.versioncolumn.VersionMonitor'],
      isOffline: computer.offline,
      isTemporarilyOffline: computer.temporarilyOffline,
      offlineCauseReason: computer.offlineCauseReason,
      isIdle: computer.idle
    }

    // @TODO: Deal with issues logic

    newDatabaseState[computer.displayName] = data
    const computerExtendedData = {
      ...data,
      diskUsage: data.diskUsage
        ? `${getDiskUsageEmoji(data.diskUsage)} **${data.diskUsage}%**`
        : 'N/A',
      status:
        computer.offline || computer.temporarilyOffline
          ? '❌ **DOWN**'
          : '✅ **UP**',
      offlineCauseReason: computer.offlineCauseReason
        ? `🔥 **${computer.offlineCauseReason}**`
        : 'N/A'
    }
    reportData.push(computerExtendedData)

    if (
      // Check if the node is offline
      computer.offline &&
      // Ignore if the Node is temporarily offline
      !computer.temporarilyOffline &&
      // if the node doesn't exist in the database but is expected to create an issue
      ((generateIssuesforUnkownNodes && !database[computer.displayName]) ||
        // if the node exists in the database but is not offline
        (database[computer.displayName] &&
          !database[computer.displayName].isOffline))
    ) {
      core.debug(`Creating issue for ${computer.displayName}...`)
      issuesData.push({
        title: `${computer.displayName} is DOWN`,
        body: generateIssueDownBodyContent(computerExtendedData, jenkinsDomain)
      })
    }
  })

  return {
    reportData,
    issuesData,
    newDatabaseState
  }
}

const downloadCurrentState = ({
  jenkinsUsername,
  jenkinsToken,
  jenkinsDomain
}) =>
  new Promise((resolve, reject) => {
    const jenkinsUrl = `https://${jenkinsUsername}:${jenkinsToken}@${jenkinsDomain}/computer/api/json?token=TOKEN`

    https
      .get(jenkinsUrl, resp => {
        let data = ''

        // A chunk of data has been received.
        resp.on('data', chunk => {
          data += chunk
        })

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
          resolve(JSON.parse(data))
        })
      })
      .on('error', reject)
  })

module.exports = {
  processJenkinsData,
  downloadCurrentState
}
