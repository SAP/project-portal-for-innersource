// globals
window._globals = {
  allRepos: undefined,
  sortFilterSearchRepos: undefined,
  ignoreNextHashChange: undefined
};

// register events for updating the UI state based on the hash
window.addEventListener("hashchange", updateUI);

// creates a readable project name from the (technical) GitHub repository name
function readableRepoName(sName) {
  // split by - by default
  aWords = sName.split("-");
  // try splitting with _ instead
  if (aWords.length === 1) {
    aWords = sName.split("_");
  }
  // uppercase words
  aWords = aWords.map(
    (sWord) => sWord.charAt(0).toUpperCase() + sWord.slice(1)
  );
  // replace minus with space
  return aWords.join(" ");
}

// creates all items to be displayed
function createContent(aItems) {
  // extract display mode
  let oURL = new URL("https://dummy.com");
  oURL.search = window.location.hash.substring(1);
  const sDisplay = oURL.searchParams.get("display") || "card";
  // generate and show HTML
  const sResult = aItems.map((oItem) => generateItem(sDisplay, oItem));
  updateContent(sDisplay, sResult);
}

// updates the content area
function updateContent(sDisplay, sResult) {
  // flush html
  $("#" + (sDisplay === "card" ? "card" : "row") + "s").html(sResult);
  // update result count in search placeholder
  $("#search + label").text(`Search ${sResult.length} projects...`);
  // replace broken images with a meaningful default image
  // side-note: tools.sap requires login to display avatars
  $("img").on("error", function () {
    Math.seedrandom($(this).attr("src"));
    $(this).attr(
        "src",
        "images/default" + (Math.floor(Math.random() * 3) + 1) + ".png"
    );
    Math.seedrandom();
  });

  $(".tooltipped").tooltip(); //initialise tooltips
}

// updates UI state based on Hash
function updateUI() {
  if (window._globals.ignoreNextHashChange) {
    return;
  }
  window._globals.sortFilterSearchRepos = window._globals.allRepos;
  let oURL = new URL("https://dummy.com");
  oURL.search = window.location.hash.substring(1);
  // apply filters
  oURL.searchParams.get("sort") && sort(oURL.searchParams.get("sort"));
  oURL.searchParams.get("filter") && filter(oURL.searchParams.get("filter"));
  oURL.searchParams.get("search") && search(oURL.searchParams.get("search"));
  // open details dialog
  oURL.searchParams.get("details") && showModal(parseInt(oURL.searchParams.get("details")) || oURL.searchParams.get("details"));
  // set display mode
  display(oURL.searchParams.get("display") || "card");
}

// updates hash based on UI state (note: does not work on IE11, needs URL Polyfill)
function updateHash(sKey, sValue) {
  let oURL = new URL("https://dummy.com");
  oURL.search = window.location.hash.substring(1);
  sValue ? oURL.searchParams.set(sKey, sValue) : oURL.searchParams.delete(sKey);
  window._globals.ignoreNextHashChange = true;
  window.location.hash = oURL.searchParams.toString().replace("%21=", "!");
  // ignore hash change events for the next second to avoid redundant content update
  setTimeout(function () {
    window._globals.ignoreNextHashChange = false;
  }, 1000);
}

// helper function to display each language in a different static colour
function stringToColour(sString) {
  Math.seedrandom(sString);
  const rand = Math.random() * Math.pow(255,3);
  Math.seedrandom();

  let colour = "#";
  for (let i = 0; i < 3; colour += ("00" + ((rand >> i++ * 8) & 0xFF).toString(16)).slice(-2));
  return colour;
}

// fetches an image for the detected programming language
function getRepoLanguage(sLanguage) {
  let sLanguageShort = "N/A";
  let sFontSize;

  if (sLanguage) {
    sLanguageShort = sLanguage;
    if(sLanguageShort.length > 4) {
      // smart length reduction
      if (sLanguageShort.match(/[A-Z][a-z]+/g) && sLanguageShort.match(/[A-Z][a-z]+/g).length > 1) {
        // abbreviate by capital letters and cut off at 4 letters
        sLanguageShort = sLanguageShort.match(/[A-Z][a-z]+/g).reduce((x, y) => x.substr(0,1) + y.substr(0, 1));
      } else if (sLanguageShort.match(/[auoie]+/g)) {
        // remove vowels
        while(sLanguageShort.match(/[auoie]+/g) && sLanguageShort.length > 4) {
          sLanguageShort = sLanguageShort.replace(/[auoie]{1}/, "");
        }
      }
      // shorten to 4 letters
      sLanguageShort = sLanguageShort.substr(0, 4);
    } else {
      // short enough
      sLanguageShort = sLanguage;
    }
    // scale down size with length of string
    if (sLanguageShort.length > 2) {
      sFontSize = 100 - (sLanguageShort.length - 2) * 10 + "%";
    }
  } else {
    sLanguage = "not available";
  }

  // a div with a pseudo-random color coding and the shortened text
  return `<div class="tooltipped language" style="${ sLanguageShort !== "N/A" ? "background-color: "+ stringToColour(sLanguage) : "" }; ${ sFontSize ? "font-size: "+ sFontSize : "" }" data-position="top" data-tooltip="Language: ${sLanguage}">${sLanguageShort}</div>`
}

// get a visual representation of the Activity Score of the repo.
// - if Activity Score exists: an image representing how active the repo is
// - if Activity Score doesn't exist: a placeholder
function getRepoActivity(oRepo) {
  let iScoreImage = `<div class="tooltipped language" data-position="top" data-tooltip="Activity: not available">N/A</div>`;
  let iScoreNumeric = "N/A";

  if (oRepo._InnerSourceMetadata && typeof oRepo._InnerSourceMetadata.score === "number") {
    iScoreImage = getActivityLogo(oRepo._InnerSourceMetadata.score)
    iScoreNumeric = oRepo._InnerSourceMetadata.score;
  }

  return [iScoreImage, iScoreNumeric];
}

// fetches the corresponding image for the activity score
function getActivityLogo(iScore) {
  let sLogo, sActivityLevel;

  if (iScore > 2500) {
    sLogo = `images/activity/5.png"`;
    sActivityLevel = "Extremely High";
  } else if (iScore > 1000) {
    sLogo = `images/activity/4.png`;
    sActivityLevel = "Very High";
  } else if (iScore > 300) {
    sLogo = `images/activity/3.png`;
    sActivityLevel = "High";
  } else if (iScore > 150) {
    sLogo = `images/activity/2.png`;
    sActivityLevel = "Moderate";
  } else if (iScore > 50) {
    sLogo = `images/activity/1.png`;
    sActivityLevel = "Low";
  } else if (iScore > 5) {
    sLogo = `images/activity/0.png`;
    sActivityLevel = "Very Low";
  } else {
    sLogo = `images/activity/0.png`;
    sActivityLevel = "None";
  }

  return `<img class="tooltipped" data-position="top" data-tooltip="Activity: ${sActivityLevel}" alt="Activity: ${sActivityLevel}" src="${sLogo}"/>`;
}

// creates an HTMl-based heatmap for the current week and the previous 12 weeks from participation stats
function createParticipationChart(oRepo) {
  function participationColor(iValue) {
    let iOpacity;
    if (iValue === 0) {
      iOpacity = 0;
    } else {
      iOpacity = Math.log(iValue)/4 + 0.03; // 50 = 1, scale logarithmically below
    }
    iOpacity = Math.min(1, iOpacity);
    return "rgba(50, 205, 50, " + iOpacity + ")";
  }
  let aParticipation = oRepo._InnerSourceMetadata.participation;
  const aPrevious12Weeks = aParticipation.slice(aParticipation.length - 13, aParticipation.length - 1).reverse();

  // this week
  let sHTML = window.document.getElementById("participation-template").innerHTML;
  let iValue = aParticipation[aParticipation.length - 1];
  sHTML = sHTML.replace("[[hasCommits]]", iValue ? 'hasCommits' : '');
  sHTML = sHTML.replace("[[backgroundColor]]", iValue ? 'background-color: ' + participationColor(iValue) : '' );
  sHTML = sHTML.replace("[[commits]]", iValue);

  // previous weeks
  let sWeekTemplate = sHTML.match(/\[\[#foreach weeks]](.*)\[\[\/foreach\]\]/).pop();
  let sWeekHTML = "";

  const iCreatedWeeksAgo = Math.ceil((Date.now() - new Date(oRepo.created_at).getTime()) / 1000 / 86400 / 7) - 1;
  let iCommitsWeeksBefore = 0;

  aPrevious12Weeks.forEach((iValue, iIndex) => {
    // don't print boxes for new repos
    if (iIndex >= iCreatedWeeksAgo) {
      return;
    }
    iCommitsWeeksBefore += iValue;

    let sWeekBox = sWeekTemplate.replace("[[hasCommits]]", iValue ? 'hasCommits' : '');
    sWeekBox = sWeekBox.replace("[[backgroundColor]]", iValue ? 'background-color: ' + participationColor(iValue) : '');
    sWeekBox = sWeekBox.replace("[[commits]]", iValue);
    sWeekHTML += sWeekBox;
  });
  sHTML = sHTML.replace(/\[\[#foreach weeks\]\](.*)\[\[\/foreach\]\]/, sWeekHTML);

  // legend previous weeks
  sHTML = sHTML.replace("[[previousWeeks]]", Math.min(12, iCreatedWeeksAgo) + ' weeks: ' + iCommitsWeeksBefore);

  // weeks before
  let sBeforeTemplate = sHTML.match(/\[\[#foreach before]](.*)\[\[\/foreach\]\]/).pop();
  let sBeforeHTML = "";

  const aPrevious9months = aParticipation.slice(1, aParticipation.length - 13).reverse();
  let iWeeksBefore = 0;
  let iCommitsMonthBefore = 0;
  aPrevious9months.forEach((iValue, iIndex) => {
    if (iIndex >= iCreatedWeeksAgo - 12) {
      return;
    }
    iWeeksBefore++;
    iCommitsMonthBefore += iValue;

    let sBeforeBox = sBeforeTemplate.replace("[[hasCommits]]", iValue ? 'hasCommits' : '');
    sBeforeBox = sBeforeBox.replace("[[backgroundColor]]", iValue ? 'background-color: ' + participationColor(iValue) : '' );
    sBeforeBox = sBeforeBox.replace("[[commits]]", iValue);
    sBeforeHTML += sBeforeBox;
  });
  sHTML = sHTML.replace(/\[\[#foreach before\]\](.*)\[\[\/foreach\]\]/, sBeforeHTML);

  // legend weeks before
  sHTML = sHTML.replace("[[weeksBefore]]", (Math.floor(iWeeksBefore / 4) <= 1 ? iWeeksBefore + ' weeks before: ' : Math.floor(iWeeksBefore / 4) + ' months before: ') + iCommitsMonthBefore);
  sHTML = sHTML.replace(/\[\[#if weeksBefore\]\]([^]*)\[\[\/if\]\]/gm, iWeeksBefore ? "$1" : "");

  return sHTML;
}

// creates HTML for and displays a project details modal
function showModal (vRepoId, oEvent) {
  // don't open modal when clicking on direct links
  if (oEvent && oEvent.target.href) {
    return;
  }
  const oRepo = window._globals.allRepos.filter(oRepo => oRepo.id === vRepoId).pop();
  let sHTML = window.document.getElementById("details-template").innerHTML;

  let sLogoURL = oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.logo
      ? oRepo._InnerSourceMetadata.logo.startsWith("http") || oRepo._InnerSourceMetadata.logo.startsWith("./")
          ? oRepo._InnerSourceMetadata.logo
          : "data/" + oRepo._InnerSourceMetadata.logo + (oRepo._InnerSourceMetadata.logo.split("\.").pop() === "svg" ? "?sanitize=true" : "")
      : oRepo.owner.avatar_url;
  sHTML = sHTML.replace("[[mediaURL]]", sLogoURL);

  let sTitle = oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.title
      ? oRepo._InnerSourceMetadata.title
      : readableRepoName(oRepo.name);
  sHTML = sHTML.replace("[[title]]", sTitle);

  sHTML = sHTML.replace("[[repoURL]]", oRepo.html_url);
  sHTML = sHTML.replace("[[repoTitle]]", oRepo.owner.login + "/" + oRepo.name);

  let sDescription = oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.motivation
      ? oRepo._InnerSourceMetadata.motivation
      : oRepo.description !== null
          ? oRepo.description
          : "";
  sHTML = sHTML.replace("[[description]]", sDescription);

  sHTML = sHTML.replace("[[stars]]", oRepo.stargazers_count);
  sHTML = sHTML.replace("[[issues]]", oRepo.open_issues_count);
  sHTML = sHTML.replace("[[forks]]", oRepo.forks_count);

  let [iScoreImage, iScoreNumeric] = getRepoActivity(oRepo);
  sHTML = sHTML.replace("[[score]]", iScoreImage);
  sHTML = sHTML.replace("[[scoreNumeric]]", iScoreNumeric);

  sHTML = sHTML.replace("[[language]]", getRepoLanguage(oRepo.language));

  let sSkills = oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.skills ? oRepo._InnerSourceMetadata.skills.join("<br>") : oRepo.language;
  sHTML = sHTML.replace("[[skills]]", sSkills);
  sHTML = sHTML.replace(/\[\[#if skills\]\](.*)\[\[\/if\]\]/, sSkills ? "$1" : "");

  let sContributions = oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.contributions && oRepo._InnerSourceMetadata.contributions.length
      ? oRepo._InnerSourceMetadata.contributions.join("<br>")
      : "Any";
  sHTML = sHTML.replace("[[contributions]]", sContributions);

  sHTML = sHTML.replaceAll("[[documentationURL]]", oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.docs);
  sHTML = sHTML.replace(/\[\[#if documentationURL\]\](.*)\[\[\/if\]\]/, oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.docs ? "$1" : "");

  sHTML = sHTML.replace("[[createdAt]]", moment(oRepo.created_at).format('MMMM Do YYYY'));
  sHTML = sHTML.replace("[[lastUpdate]]", moment(oRepo.updated_at).fromNow());

  let sContributeURL = oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.docs
      ? oRepo._InnerSourceMetadata.docs
      : oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.guidelines
          ? `${oRepo.html_url}/blob/${oRepo.default_branch}/${oRepo._InnerSourceMetadata.guidelines}`
          : oRepo.html_url;
  sHTML = sHTML.replace("[[contributeURL]]", sContributeURL);

  // fill & init modal
  const oModalWrapper = window.document.getElementById("modal-details");
  oModalWrapper.innerHTML = sHTML;
  M.Modal.init(oModalWrapper, {
    onCloseEnd: () => {
      updateHash("details", undefined);
    }
  });
  $(".tooltipped").tooltip(); //initialise tooltip

  // replace broken images with a meaningful default image
  // side-note: tools.sap requires login to display avatars
  $(".modal img").on("error", function () {
    Math.seedrandom($(this).attr("src"));
    $(this).attr(
        "src",
        "images/default" + (Math.floor(Math.random() * 3) + 1) + ".png"
    );
    Math.seedrandom();
  });

  // open dialog
  M.Modal.getInstance(oModalWrapper).open();
  oModalWrapper.getElementsByClassName("participationChart")[0].innerHTML = createParticipationChart(oRepo);
  updateHash("details", vRepoId);
}

// fills the HTML template for a project item
function generateItem (sDisplay, oRepo) {
  let sHTML;
  if (sDisplay === "list") {
    sHTML = window.document.getElementById("row-template").getElementsByTagName("tr")[0].outerHTML;
  } else {
    sHTML = window.document.getElementById(sDisplay + "-template").innerHTML;
  }

  sHTML = sHTML.replace("[[id]]", typeof oRepo.id === "string" ? "'" + oRepo.id + "'" : oRepo.id);

  let sLogoURL = oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.logo
      ? oRepo._InnerSourceMetadata.logo.startsWith("http") || oRepo._InnerSourceMetadata.logo.startsWith("./")
          ? oRepo._InnerSourceMetadata.logo
          : "data/" + oRepo._InnerSourceMetadata.logo + (oRepo._InnerSourceMetadata.logo.split("\.").pop() === "svg" ? "?sanitize=true" : "")
      : oRepo.owner.avatar_url;
  sHTML = sHTML.replace("[[mediaURL]]", sLogoURL);

  let sTitle = oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.title
      ? oRepo._InnerSourceMetadata.title
      : readableRepoName(oRepo.name);
  sHTML = sHTML.replace("[[title]]", sTitle);

  sHTML = sHTML.replace("[[repoURL]]", oRepo.html_url);
  sHTML = sHTML.replace("[[repoTitle]]", oRepo.owner.login + "/" + oRepo.name);

  let sDescription = oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.motivation
      ? oRepo._InnerSourceMetadata.motivation
      : oRepo.description !== null
          ? oRepo.description
          : "";
  sHTML = sHTML.replace("[[description]]", sDescription);

  sHTML = sHTML.replace("[[stars]]", oRepo.stargazers_count);
  sHTML = sHTML.replace("[[issues]]", oRepo.open_issues_count);
  sHTML = sHTML.replace("[[forks]]", oRepo.forks_count);

  let [iScoreImage, ] = getRepoActivity(oRepo);
  sHTML = sHTML.replace("[[score]]", iScoreImage);

  sHTML = sHTML.replace("[[language]]", getRepoLanguage(oRepo.language));

  let sContributeURL = oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.docs
      ? oRepo._InnerSourceMetadata.docs
      : oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.guidelines
          ? `${oRepo.html_url}/blob/${oRepo.default_branch}/${oRepo._InnerSourceMetadata.guidelines}`
          : oRepo.html_url;
  sHTML = sHTML.replace("[[contributeURL]]", sContributeURL);

  return $(sHTML);
}

// load repos.json file and display the list of projects from it
$(window.document).ready(() => {
  $.ajax({
    url: `repos.json`,
    type: `GET`,
    dataType: "json",
    success: (oData) => {
      window._globals.allRepos = oData;
      fillLanguageFilter();
      updateUI();
      // show number of projects in header
      $("#count").text(oData.length);
    },
    error: (oHR, sStatus) => {
      console.log(oHR, sStatus);
    }
  });

  $("select#sort").on("change", function () {
    sort(this.value);
  });

  $("select#filter").on("change", function () {
    filter(this.value);
  });

  $("input#search").on("keyup", function () {
    search(this.value);
  });

  $("input#display").on("change", function () {
    display(this.checked ? "card" : "list");
  });
});

// fill language filter list based on detected languages
function fillLanguageFilter () {
  let aAllLanguages = [];
  // create a unique list of languages
  window._globals.allRepos.map(repo => {
    if (repo.language && !aAllLanguages.includes(repo.language)) {
      aAllLanguages.push(repo.language)
    }
  });
  // sort alphabetically and reverse
  aAllLanguages = aAllLanguages.sort().reverse();
  // insert new items backwards between "All" and "Other"
  let oFilter = window.document.getElementById("filter");
  aAllLanguages.forEach(language => {
    let oOption = window.document.createElement("option");
    oOption.text = oOption.value = language;
    oFilter.add(oOption, 1);
  });
  // initialize all filters
  $("select").formSelect();
  addLanguageIconsToFilter();
}

// sneak in language icons
function addLanguageIconsToFilter() {
  $("#filter").siblings("ul").find("li").each((iIndex, oItem) => {
    if ($(oItem).text() !== "All" && $(oItem).text() !== "Other") {
      $(oItem).html(getRepoLanguage($(oItem).text()) + $(oItem).html());
    }
  });
}

// sort the cards by chosen parameter (additive, combines filter or search)
function sort(sParam) {
  let aResult;
  if (["name", "full_name"].includes(sParam)) {
    // sort alphabetically
    aResult = window._globals.sortFilterSearchRepos.sort((a, b) => (b[sParam] < a[sParam] ? 1 : -1));
  } else if (sParam === "score") {
    // sort by InnerSource score
    aResult = window._globals.sortFilterSearchRepos.sort(
      (a, b) =>
        b["_InnerSourceMetadata"]["score"] - a["_InnerSourceMetadata"]["score"]
    );
  } else {
    // sort numerically
    aResult = window._globals.sortFilterSearchRepos.sort((a, b) => b[sParam] - a[sParam]);
  }
  createContent(aResult);
  // update hash
  updateHash("sort", sParam);
  // update select
  let oSelect = window.document.getElementById("sort");
  for (let i = 0; i < oSelect.options.length; i++) {
    if (oSelect.options[i].value === sParam) {
      oSelect.selectedIndex = i;
    }
  }
  M.FormSelect.init(oSelect);
}

// filter the cards by chosen parameter (resets search)
function filter(sParam) {
  let aResult;
  if (sParam !== "All") {
    if (sParam === "N/A") { // other
      aResult = window._globals.allRepos.filter((repo) => repo.language === null || repo.language === undefined);
    } else {
      aResult = window._globals.allRepos.filter((repo) => repo.language === sParam);
    }
  } else {
    aResult = window._globals.allRepos;
  }
  createContent(aResult);
  window._globals.sortFilterSearchRepos = aResult;
  // update hash
  updateHash("search", undefined);
  updateHash("filter", sParam);
  // update select
  let oSelect = window.document.getElementById("filter");
  for (let i = 0; i < oSelect.options.length; i++) {
    if (oSelect.options[i].value === sParam) {
      oSelect.selectedIndex = i;
    }
  }
  M.FormSelect.init(oSelect);
  addLanguageIconsToFilter();
  // reset search
  window.document.getElementById("search").value = "";
}

// search the cards by chosen parameter (resets filter)
function search(sParam) {
  let sLowerCaseParam = sParam.toLowerCase();
  let oResult = window._globals.allRepos.filter(
    (repo) =>
      // name
      repo.name.toLowerCase().includes(sLowerCaseParam) ||
      // description
      (repo.description && repo.description.toLowerCase().includes(sLowerCaseParam)) ||
      // InnerSource metadata
      (repo._InnerSourceMetadata &&
        (
          repo._InnerSourceMetadata.title &&
          repo._InnerSourceMetadata.title.toLowerCase().includes(sLowerCaseParam) ||
          repo._InnerSourceMetadata.motivation &&
          repo._InnerSourceMetadata.motivation.toLowerCase().includes(sLowerCaseParam) ||
          repo._InnerSourceMetadata.skills &&
          repo._InnerSourceMetadata.skills.join(" ").toLowerCase().includes(sLowerCaseParam) ||
          repo._InnerSourceMetadata.contributions &&
          repo._InnerSourceMetadata.contributions.join(" ").toLowerCase().includes(sLowerCaseParam)
        )
      )
  );
  window._globals.sortFilterSearchRepos = oResult;
  createContent(oResult);

  // update hash
  updateHash("search", sParam);
  updateHash("filter", undefined);
  // set search
  const oSearch = window.document.getElementById("search");
  oSearch.value = sParam;
  M.updateTextFields();
  // reset filter
  const oSelect = window.document.getElementById("filter");
  oSelect.selectedIndex = 0;
  M.FormSelect.init(oSelect);
}

// toggles the display between card and table view
function display(sParam) {
  // update UI
  window.document.getElementById("display").checked = (sParam !== "list");
  // toggle active icon
  window.document.getElementsByClassName("switch")[0].getElementsByTagName("i")[sParam !== "list" ? 1 : 0].classList.add("active");
  window.document.getElementsByClassName("switch")[0].getElementsByTagName("i")[sParam !== "list" ? 0 : 1].classList.remove("active");
  // only create content when mode has changed
  if (!$("#" + (sParam !== "list" ? "cards" : "rows")).html()) {
    // store context
    updateHash("display", sParam);
    // create content
    createContent(window._globals.sortFilterSearchRepos);
  }
  // toggle content
  $("#" + (sParam !== "list" ? "rows" : "cards")).html("");
  $("#" + (sParam !== "list" ? "cards" : "list")).css("display", "block");
  $("#" + (sParam !== "list" ? "list" : "cards")).attr("style", "display: none !important");
}
