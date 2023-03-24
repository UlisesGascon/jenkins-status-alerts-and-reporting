const processJenkinsData = (jenkinsData, database) => {
    const reportData = []
    const issuesData = []
    const newDatabaseState = {}

    return {
        reportData,
        issuesData,
        newDatabaseState
    }
}

const generateReport = reportData => {
    return 'THIS IS A PLACE HOLDER'
}

module.exports = {
    processJenkinsData,
    generateReport
}