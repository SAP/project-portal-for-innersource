# Listing your Project in the Project Portal for InnerSource

Adding your project to this portal is as easy as adding the `inner-source` topic to your repo. To customize the information about your project that is displayed in the portal, you can optionally add a `innersource.json` file.

## Step 1: Setting the topic `inner-source`

In your GitHub instance, add the topic `inner-source` to your repository by clicking on the link "manage topics" below the repository description. For further instructions see the [Adding topics to your repository](https://docs.github.com/en/github/administering-a-repository/managing-repository-settings/classifying-your-repository-with-topics#adding-topics-to-your-repository).

> **Note:** The portal assumes that a crawler script frequently collects all repositories marked as InnerSource inside your company and compiles a `repos.json` file automatically. To build your own crawler please review the [Crawling Documentation](CRAWLING.md).

## Step 2: (Optional) Adding an `innersource.json` file

To provide more details or add a custom logo, add an `innersource.json` file in the root of your repository. For further details review the [syntax definition](LISTING.md#syntax-definition-of-innersourcejson) of `innersource.json` below.

## Syntax Definition of `innersource.json`

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