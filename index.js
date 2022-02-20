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

  //hit up graphql for the projects attached to repo
  const projectQuery = `
  {
      repository(owner:"${ownerName}", name:"${repoName}"){
        projects(first: 5){
          nodes{
            name
            columns(first: 5){
              nodes{
                name
                id
                cards{
                  nodes{
                    id
                    databaseId
                    content{
                      ... on Issue{
                        number
    }}}}}}}}}
  }`;
  var projectsResponse = await octokit.graphql(projectQuery);

  //find the project board the issue is attached to
  let project = response.data.repository.projects.nodes.find(proj => {
    let correctCol = proj.columns.nodes.find(col => {
        let contentCards = col.cards.nodes.filter(card => card.state == 'CONTENT_ONLY');
        let isCardThere = contentCards.find(card => card.content.number == issueNumber);
        return isCardThere;
      });
    return correctCol;
  });
  //filter out non-content cards
  project.columns.nodes = project.columns.nodes.map(col => {
    let cards = col.cards.nodes.filter(card => card.state == 'CONTENT_ONLY');
    col.cards.nodes = cards;
    return col;
  });
  //find the column the card is in, and verify that it has the specified name
  let fromColumn = project.columns.nodes.find(col => {
    let isCardThere = col.cards.nodes.find(card => card.content.number == issueNumber);
    return isCardThere && col.name == fromColumnName;
  });
  let toColumn = project.columns.nodes.find(col => col.name == toColumnName);
  if (!fromColumn){
    throw 'The chosen fromColumn does not exist, ending early'
  }else if(!toColumn){
    throw 'The chosen toColumn does not exist, ending early'
  }

  let card = fromColumn.cards.nodes.find(card => card.content.number == issueNumber);

  const moveQuery = `
  {
    moveProjectCard(
      input:{
        cardId: "${card.id}",
        columnId:"${toColumn.id}"}){
      clientMutationId
    }
  }
  `
  var movedCard = await octokit.graphql(moveQuery);
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