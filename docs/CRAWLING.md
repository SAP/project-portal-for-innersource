# Crawling

The repository metadata shown in this portal is read from a static `repos.json` file. This project contains a [repos.json](../repos.json) file with mock data, which shows the overall structure of that data.

In a productive environment, you will likely need to run your own crawler to populate `repos.json` with the InnerSource projects that you want to show in your portal.

The figure below shows the relationship between crawler, portal, and repositories. We assume that the repositories are located in one or more GitHub instances and use the GitHub API to fetch repository metadata. If you are using a different source code management system you can fill the structure described below with the available data from that system.

![Crawling InnerSource projects](ecosystem.png)

In the following sections we explain the data structure of `repos.json` and how you would populate it with your own crawler. You will also find [Crawler reference implementations](#reference-implementations) that you can use as starting points for your own crawler.

## Step-by-step Crawling Logic

To get the portal to work, you need to implement at least step (1). Steps (2) and (3) are optional.

### Step 1: (Required) Basic Project Information from GitHub

The [repos.json](../repos.json) file contains an array of objects. Each object represents a **project** that you want to display in the portal.

The basic structure of each project object is:

``` json
{
  "id": 2342,
  "name": "earth",
  "full_name": "Sol/earth",
  "html_url": "https://github.instance/Sol/earth",
  "description": "Earth is the third planet from the Sun and the home-world of humanity.",
  "created_at": "2017-01-31T09:39:12Z",
  "updated_at": "2020-10-07T09:42:53Z",
  "pushed_at": "2020-10-08T12:18:22Z",
  "stargazers_count": 136,
  "watchers_count": 136,
  "language": "JavaScript",
  "forks_count": 331,
  "open_issues_count": 98,
  "license": null,
  "default_branch": "master",
  "owner": {
    "login": "Sol",
    "avatar_url": "./images/demo/Sol.png"
  }
}
```

To retrieve this information from your GitHub instance, query the [GitHub Search API](https://docs.github.com/en/rest/reference/search) for all projects with the topic `inner-source`.

   ```
   ?q=topic:inner-source
   ```

You can write the API response to `repos.json` as is, as the field names above are the same as returned by the GitHub API. Additional fields returned by the GitHub API will be ignored by the portal.

 > *Note:* This assumes that all projects that you want to display have the topic `inner-source`. You can of course use any other topic as well. You can optionally limit the results further  by adding `is:public` or `is:private` to the query, depending on how InnerSource repositories are characterized in your environment.

### Step 2: (Optional) Extended Project Information from GitHub

For a richer portal experience, you can add extended project information that is available via further GitHub API calls.

For each project retrieved in step (1), add a key `_InnerSourceMetadata` with an object containing the following metadata about the project:

* `topics`: Query GitHub [topics](https://docs.github.com/en/rest/reference/repos#get-all-repository-topics) and add the array of topics with the key `topics` for each repo to allow searching projects by topic and displaying them on the detail popup.
* `participation`: Query GitHub for the [weekly commit count](https://docs.github.com/en/free-pro-team@latest/rest/reference/repos#get-the-weekly-commit-count) (subset "all") and add it with the key `participation`. A visualization of the participation stats for the previous 12 months is now shown on the project's detail page.
* `guidelines`: Check if the repo contains contribution guidelines and add the file name with the key `guidelines` (e.g. `CONTRIBUTING.md`). If specified, the *Contribute* button for this project will link to this file instead of the repository root.
  
### Step 3: (Optional) Custom Data

You can customize the portal further by adding some of the following properties to the `_InnerSourceMetadata` object explained in step (2):

* `score`: Calculate the [Repository Activity Score](https://patterns.innersourcecommons.org/p/repository-activity-score) to define a meaningful default order for the projects. Add it with the key `score`.
* `title`/`motivation`/`contributions`/`skills`/`logo`/`docs`/`language`: Check if the repo contains an `innersource.json` file and add all keys from that file directly below `_InnerSourceMetadata`. For further details review the [syntax definition](LISTING.md#syntax-definition-of-innersourcejson) of `innersource.json`.

## Reference Implementations

You will have to adapt all of these crawler implementations to your exact setup. However they may give you a good starting points.

* A plain GitHub API call with some post-processing in [jq](https://stedolan.github.io/jq/). This call will query all repos in a GitHub organization with topic `inner-source` and store it in a local file ([oauth token](https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token) with permission `repo` required). This can for example be used to have a quick demo of the portal up and running with your own data.
``` sh
curl -u <username>:<oauth_token> https://api.github.com/search/repositories?q=org:<org>+topic:inner-source | jq '.items' > repos.json
```
* GitHub Crawler implementation with Ruby: [spier/innersource-crawler-ruby](https://github.com/spier/innersource-crawler-ruby)
* GitHub Crawler implementation with Python: [zkoppert/innersource-crawler](https://github.com/zkoppert/innersource-crawler)
* [AWS CodeCommit](https://aws.amazon.com/codecommit/) Crawler implementation with Python: [aws-samples/codecommit-crawler-innersource](https://github.com/aws-samples/codecommit-crawler-innersource)

In the following sections we explain the data structure of `repos.json` and how you would populate it with your own crawler. You will also find [Crawler reference implementations](#reference-implementations) that you can use as starting points for your own crawler.
