const core = require('@actions/core');
const github = require('@actions/github');

async function main(){
  const myToken = core.getInput('repo-token');
  const issueNumber = core.getInput('issue-number');
  const fromColumnName = core.getInput('from-column');
  const toColumnName = core.getInput('to-column');
  const repoName = github.context.payload.repository.name;
  const ownerName = github.context.payload.repository.owner.login;
  const octokit = github.getOctokit(myToken);
  var projects = await octokit.rest.projects.listForRepo({
    owner: ownerName,
    repo: repoName
  });

  const projectName = 'code';
  const project = projects.data.find(project => project.name === projectName);

  if (project === undefined){
    core.setOutput('project-name', 'None');
    throw `Project \'${projectName}\' does not exist in ${ownerName}/${repoName}.`
  }

  var projectColumns = await octokit.rest.projects.listColumns({project_id:project.id});
  const fromColumn = projectColumns.data.find(column => column.name === fromColumnName);
  const toColumn = projectColumns.data.find(column => column.name === toColumnName);
  const projectCards = await octokit.rest.projects.listCards({
    column_id:fromColumn.id
  });
  //hacky, ugly way of getting the issue number from the card. extracts the number from the content_url field in the response
  const projectCard = projectCards.data.find(card => card.content_url.split('').reverse().join('').substring(0, card.content_url.split('').reverse().join('').search('/')).split('').reverse().join('') == issueNumber);
  var movedCard = await octokit.rest.projects.moveCard({
    card_id: projectCard.id,
    position: 'top',
    column_id: toColumn.id
  });
  core.setOutput('card-id', `${projectCard.id}`);
  return `The card was moved to column \'${toColumn}\' in ${repoName}/projects/${projectBoard}`;
}

main().then(
  result => {
    // eslint-disable-next-line no-console
    console.log(result);
  },
  err => {
    // eslint-disable-next-line no-console
    console.log(err);
  }
)
.then(() => {
  process.exit();
});