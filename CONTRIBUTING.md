# Contributing Guidelines

## General Remarks

This project serves as a template for implementing the InnerSource Commons [InnerSource portal](https://github.com/InnerSourceCommons/InnerSourcePatterns/blob/master/patterns/2-structured/innersource-portal.md) pattern.
Any change to improve and advance the portal is welcome. Please note that the portal should be able to display any kind of InnerSource project at any company applying InnerSource principles. 
Changes should be made in a generic and extensible way, so that all stakeholders can benefit from the improvment abd apply it to their portal instance.

## Found a bug?

Just open an issue, describe how to reproduce the bug and what you would expect instead. We will get back to you soon.

## Contributing Code

1. Make sure the change is welcome (see [General Remarks](#general-remarks)). When in doubt open an issue first or start a discussion with the project team

2. Create a branch by forking this repository and apply your change.

3. Commit and push your change(s) on that branch and create a pull request once your code is ready.

4. Wait for our code review and approval, possibly enhancing your change on request.

5. Once the change has been approved and merged, we will inform you in a comment.

## Listing Project in the Project Portal for InnerSource

1. Add the topic `inner-source` to your GitHub repository by clicking on the link "manage topics" below the repository description:
`https://github.yourcompany.corp/<organization>/<repository>`
 
> **Note:** The portal assumes that a crawler collects all repositories marked as innersource and compiles a frequently updated ```repos.json``` file automatically. All data inside this file can be compiled by querying the [GitHub API](https://developer.github.com/v3/) and the metadata defined in ```innersource.json```. Check the section [Configuration in the README](README.md#configuration) to learn more about crawling InnerSource projects .
 
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

## Developer Certificate of Origin (DCO)

Due to legal reasons, contributors will be asked to accept a DCO before they submit the first pull request to this projects, this happens in an automated fashion during the submission process. SAP uses [the standard DCO text of the Linux Foundation](https://developercertificate.org/).
