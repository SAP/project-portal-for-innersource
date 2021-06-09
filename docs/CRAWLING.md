# Crawling

The repository metadata shown in this portal is read from a static `repos.json` file. This project contains a [repos.json](../repos.json) file with mock data, which shows the overall structure of that data.

In a productive environment, you will likely need to run your own crawler to populate `repos.json` with the InnerSource projects that you want to show in your portal.

The picture below shows the relationship between crawler and portal.

In the rest of this document we explain the data structure of `repos.json` and how you would populate it with your own crawler. You will also find [Crawler reference implementations](#reference-implementations) that you can use as starting points for your own crawler.

![Crawling InnerSource projects](ecosystem.png)

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

To retrieve this information from your GitHub instance, query the [GitHub Search API](https://developer.github.com/v3/search/) for all projects with the topic `inner-source`.

   ```
   ?q=topic:inner-source
   ```

You can write the API response to `repos.json` as is, as the field names above are the same as returned by the GitHub API. Additional fields returned by the GitHub API will be ignored by the portal.

 > *Note:* This assumes that all projects that you want to display have the topic `inner-source`. You can of course use any other topic as well. You can optionally limit the results further  by adding `is:public` or `is:private` to the query, depending on how InnerSource repositories are characterized in your environment.

### Step 2: (Optional) Extended Project Information from GitHub

For a richer portal experience, you can add extended project information that is available via further GitHub API calls.

For each project retrieved in step (1), add a key `_InnerSourceMetadata` with an object containing the following metadata about the project:

* `topics` (Optional): Query GitHub [topics](https://docs.github.com/en/rest/reference/repos#get-all-repository-topics) and add the array of topics with the key `topics` for each repo to allow searching projects by topic and displaying them on the detail popup.
* `participation`: Query GitHub for the [weekly commit count](https://docs.github.com/en/free-pro-team@latest/rest/reference/repos#get-the-weekly-commit-count) (subset "all") and add it. with the key `participation`
* `guidelines` (Optional): Check if there are contribution guidelines and add the file name with the key `guidelines` (e.g. `CONTRIBUTING.md`). If specified, the *Contribute* button for this project will link to this file instead of the repository root.

### Step 3: (Optional) Custom Data

You can customize the portal further with the following properties, that you can add to the `_InnerSourceMetadata` object explained in step (2):

* `score` (Optional): Calculate the [Repository Activity Score](https://patterns.innersourcecommons.org/p/repository-activity-score) to define a meaningful order for the projects. Add it with the key `score`.
* Check if there is a file `innersource.json` in the repository and add all keys from that file directly below `_InnerSourceMetadata`. For further details review the [syntax definition](LISTING.md#syntax-definition-of-innersourcejson) of `innersource.json`.

## Reference Implementations

You will have to adapt all of these crawler implementations to your exact setup. However they may give you a good starting points.

* with curl/jq: TBD SAMPLE HERE
* with ruby: [spier/innersource-crawler-ruby](https://github.com/spier/innersource-crawler-ruby)
* with python: [zkoppert/innersource-crawler](https://github.com/zkoppert/innersource-crawler)



# BACKUP


## Step-by-step Crawling Logic

To populate `repos.json` with the correct data, your crawler has to perform the following steps:

1. Crawl all projects with the topic `inner-source` in your GitHub instance using the [GitHub search API](https://developer.github.com/v3/search/):

   ```
   ?q=topic:inner-source
   ```

   The API returns a list of projects with essential information like name, avatar, description, and statistics that we can enrich with additional fields.

   > *Note:* You can optionally limit the result set by adding `is:public` or `is:private` to the query, depending on how InnerSource repositories are characterized in your environment.

2. For each resulting project add a key ```_InnerSourceMetadata``` to the result from the previous GitHub API call and fill it with additional metadata about the project:

   * Query GitHub for the [weekly commit count](https://docs.github.com/en/free-pro-team@latest/rest/reference/repos#get-the-weekly-commit-count) (subset "all") and add it with the key `participation`
   * (Optional) Check if there are contribution guidelines and add the file name with the key `guidelines` (e.g. `CONTRIBUTING.md`). If specified, the *Contribute* button will link directly to the file instead of the repository root.
   * (Optional) Query GitHub [topics](https://docs.github.com/en/rest/reference/repos#get-all-repository-topics) and add the array of topics with the key `topics` for each repo to allow searching projects by topic and displaying them on the detail popup.
   * (Optional) Calculate the [Repository Activity Score](https://github.com/InnerSourceCommons/InnerSourcePatterns/blob/master/patterns/2-structured/repository-activity-score.md) to define a meaningful order for the projects. Sort entries by score descending. Add it with the key `score`

3. Write the resulting list of projects with all metadata to the file ```repos.json``` to serve all projects in the portal.

With this approach, projects can self-register to the portal by adding the ```inner-source``` topic to their repository and specifying additional metadata inside an ```innersource.json``` file.

For more information about this file, see [Listing Project in the Project Portal for InnerSource](CONTRIBUTING.md#listing-project-in-the-project-portal-for-innersource)


## Extra project metadata via `innersource.json`

To provide more details or add a custom logo, add an `innersource.json` file in the root of your repository with the following format:

``` json
{
 "title": "Readable Project Name (optional)",
 "motivation": "A short statement why this project is InnerSource and why contributors should care (optional)",
 "contributions": [
   "List",
   "Of",
   "Requested",
   "Contribtions",
   "Like",
   "Bugfixes",
   "Features",
   "Infrastructure",
   "Documentation",
   "..."
 ],
 "skills": [
   "Skills",
   "Required",
   "To",
   "Contribute",
   "Like",
   "Node.js",
   "Java",
   "C++",
   "..."
 ],
 "logo": "path/to/your/project-logo.png (optional)",
 "docs": "http://url/to/project/documentation (optional)",
 "language": "JavaScript (optional)"
}
```

> *Note:* The property `language` overrides GitHub's [programming language detection](https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/about-repository-languages). Supported values are all entries of type `programming` from the [linguist language list](https://github.com/github/linguist/blob/master/lib/linguist/languages.yml).




## BACKUP from CONTRIBUTING.md

### Listing Project in the Project Portal for InnerSource

1. In your GitHub enterprise instance, add the topic `inner-source` to your repository by clicking on the link "manage topics" below the repository description:
`https://github.yourcompany.corp/<organization>/<repository>`

> **Note:** The portal assumes that a crawler script frequently collects all repositories marked as InnerSource inside your company and compiles a ```repos.json``` file automatically. All data inside this file can be compiled by querying the [GitHub API](https://developer.github.com/v3/) and loading the additional metadata defined in ```innersource.json```. Check the section [Configuration in the README](README.md#configuration) to learn more about crawling InnerSource projects .

2. (Optional) To provide more details or add a custom logo, add an `innersource.json` file in the root of your repository with the following format:

``` json
{
  "title": "Readable Project Name (optional)",
  "motivation": "A short statement why this project is InnerSource and why contributors should care (optional)",
  "contributions": [
    "List",
    "Of",
    "Requested",
    "Contribtions",
    "Like",
    "Bugfixes",
    "Features",
    "Infrastructure",
    "Documentation",
    "..."
  ],
  "skills": [
    "Skills",
    "Required",
    "To",
    "Contribute",
    "Like",
    "Node.js",
    "Java",
    "C++",
    "..."
  ],
  "logo": "path/to/your/project-logo.png (optional)",
  "docs": "http://url/to/project/documentation (optional)",
  "language": "JavaScript (optional)"
}
```

> *Note:* The property `language` overrides GitHub's [programming language detection](https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/about-repository-languages). Supported values are all entries of type `programming` from the [linguist language list](https://github.com/github/linguist/blob/master/lib/linguist/languages.yml).



## BACKUP from README.md

The portal uses a static ```repos.json``` file with mock data for testing and developing purposes. In a productive environment, consider adding an automated crawler script that fetches all InnerSource projects as outlined in the following picture:

![Crawling InnerSource projects](ecosystem.png)

To do so, apply the following steps:

1. Crawl all projects with the topic `inner-source` in your GitHub instance using the [GitHub search API](https://developer.github.com/v3/search/):

   ```
   ?q=topic:inner-source
   ```

   The API returns a list of projects with essential information like name, avatar, description, and statistics that we can enrich with additional fields.

   > *Note:* You can optionally limit the result set by adding `is:public` or `is:private` to the query, depending on how InnerSource repositories are characterized in your environment.

2. For each resulting project add a key ```_InnerSourceMetadata``` to the result from the GitHub API call and fill it with additional metadata about the project:

   * Check if there is a file ```innersource.json``` in the repository and add all keys directly below ```_InnerSourceMetadata```.

   * Query GitHub for the [weekly commit count](https://docs.github.com/en/free-pro-team@latest/rest/reference/repos#get-the-weekly-commit-count) (subset "all") and add it with the key `participation`

   * (Optional) Check if there are contribution guidelines and add the file name with the key `guidelines` (e.g. `CONTRIBUTING.md`). If specified, the *Contribute* button will link directly to the file instead of the repository root.

   * (Optional) Query GitHub [topics](https://docs.github.com/en/rest/reference/repos#get-all-repository-topics) and add the array of topics with the key `topics` for each repo to allow searching projects by topic and displaying them on the detail popup.

   * (Optional) Calculate the [Repository Activity Score](https://github.com/InnerSourceCommons/InnerSourcePatterns/blob/master/patterns/2-structured/repository-activity-score.md) to define a meaningful order for the projects. Sort entries by score descending. Add it with the key `score`

3. Write the resulting list of projects with all metadata to the file ```repos.json``` to serve all projects in the portal.

With this approach, projects can self-register to the portal by adding the ```inner-source``` topic to their repository and specifying additional metadata inside an ```innersource.json``` file.

For more information about this file, see [Listing Project in the Project Portal for InnerSource](CONTRIBUTING.md#listing-project-in-the-project-portal-for-innersource)
