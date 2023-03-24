const https = require('https')

const getDiskUsageEmoji = diskUsage => {
  if (diskUsage < 50) {
    return '✅'
  } else if (diskUsage < 80) {
    return '⚠️'
  } else {
    return '🔥'
  }
}

const processJenkinsData = (jenkinsData, database) => {
  const reportData = []
  const issuesData = []
  const newDatabaseState = {}

  jenkinsData.computer.forEach(computer => {
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
    reportData.push({
      ...data,
      diskUsage: data.diskUsage
        ? `${getDiskUsageEmoji(data.diskUsage)}**${data.diskUsage}%**`
        : 'N/A',
      status:
        computer.offline || computer.temporarilyOffline
          ? '❌ **DOWN**'
          : '✅ **UP**',
      offlineCauseReason: computer.offlineCauseReason
        ? `🔥 **${computer.offlineCauseReason}**`
        : 'N/A'
    })
  })

  return {
    reportData,
    issuesData,
    newDatabaseState
  }
}

const generateReport = reportData => {
  return 'THIS IS A PLACE HOLDER'
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
  generateReport,
  downloadCurrentState
}
