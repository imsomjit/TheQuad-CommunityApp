
async function test() {
  const query = `query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
        totalCommitContributions
      }
    }
  }`;
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer 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',
      'Content-Type': 'application/json',
      'User-Agent': 'Node'
    },
    body: JSON.stringify({ query, variables: { login: 'soumyajiitdas' } })
  });
  console.log(res.status);
  console.log(await res.text());
}
test();
