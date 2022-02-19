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
  var cardQuery = await octokit.graphql(`
  {
    repository(owner:"${ownerName}", name:"${repoName}"){
      projects(first: 5){
        nodes{
          name
          columns(first: 3){
            nodes{
              name
              id
              cards{
                nodes{
                  id
                  content{
                    ... on Issue{
                      title
                      number
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }`);
  const projectBoard = 'code';
  const rightBoard = cardQuery.repository.projects.nodes.find(node => node.name === projectBoard);
  const fromColumn = rightBoard.columns.nodes.find(column => column.name === fromColumnName);
  const toColumn = rightBoard.columns.nodes.find(column => column.name === toColumnName);
  const projectCard = fromColumn.cards.nodes.find(card => card.content.number === issueNumber);
  const cardNums = fromColumn.cards.nodes.map(card => card.content.number);
  console.log(JSON.stringify(fromColumn, undefined, 2));
  console.log(JSON.stringify(projectCard, undefined, 2));
  console.log(JSON.stringify(fromColumn.cards.nodes[0], undefined, 2));
  console.log(cardNums);
  var movedCard = await octokit.rest.projects.moveCard({
    card_id: projectCard.id,
    position: 'top',
    column_id: toColumn.id
  });
  core.setOutput('card-id', `${projectCard.id}`);
  return `Added the labels \'${labelsToAdd}\' to issue #${issueNumber}\n
  The card was moved to column \'${toColumn}\' in ${repoName}/projects/${projectBoard}`;
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