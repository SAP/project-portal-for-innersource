// globals
window._globals = {
	allRepos: undefined,
	sortFilterSearchRepos: undefined,
	ignoreNextHashChange: undefined,
	templates: {}
};

// register events for updating the UI state based on the hash
window.addEventListener("hashchange", updateUI);

// creates a readable project name from the (technical) GitHub repository name
function readableRepoName (sName) {
	// split by - by default
	let aWords = sName.split("-");
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
function createContent (aItems) {
	// extract display mode
	let oURL = new URL("https://dummy.com");
	oURL.search = window.location.hash.substring(1);
	const sDisplay = oURL.searchParams.get("display") || "card";
	// generate and show HTML
	const sResult = aItems.map((oItem) => generateItem(sDisplay, oItem)).join ("");
	updateContent(sDisplay, sResult, aItems);
}

// updates the content area
function updateContent (sDisplay, sResult, aItems) {
	// flush html
	window.document.getElementById((sDisplay === "card" ? "card" : "row") + "s").innerHTML = sResult;

	// update result count in search placeholder
	window.document.getElementById("search").labels[0].innerText = `Search ${aItems.length} projects...`;

	// replace broken images with a	default image
	registerFallbackImage(window.document);

	// initialize tooltips
	M.Tooltip.init(window.document.querySelectorAll(".tooltipped"));
}

// updates UI state based on Hash
function updateUI () {
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
function updateHash (sKey, sValue) {
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

// replace broken images with a default image
function registerFallbackImage (oNode) {
	let aImages = oNode.getElementsByTagName("img");
	for (let i = 0; i < aImages.length; i++) {
		aImages[i].addEventListener("error", function () {
			Math.seedrandom(this.src);
			this.src = "images/default" + (Math.floor(Math.random() * 3) + 1) + ".png";
			Math.seedrandom();
		});
	}
}

// helper function to display each language in a different static color
function stringToColor (sString) {
	Math.seedrandom(sString);
	const rand = Math.random() * Math.pow(255,3);
	Math.seedrandom();

	let sColor = "#";
	for (let i = 0; i < 3; sColor += ("00" + ((rand >> i++ * 8) & 0xFF).toString(16)).slice(-2));
	return sColor;
}

// fetches an image for the detected programming language
function getRepoLanguage (sLanguage) {
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

	// a pseudo-random color coding and the shortened text
	return window._globals.templates.language({
		color: (sLanguageShort !== "N/A" ?  stringToColor(sLanguage) : ""),
		fontSize: sFontSize,
		language: sLanguage,
		languageShort: sLanguageShort
	});
}

// get a visual representation of the Activity Score of the repo.
// - if Activity Score exists: an image representing how active the repo is
// - if Activity Score doesn't exist: a placeholder
function getRepoActivity (oRepo) {
	let sScoreIndicator = "<div class=\"tooltipped score\" data-position=\"top\" data-tooltip=\"Activity: not available\">N/A</div>",
		vScoreNumeric = "N/A";

	if (oRepo._InnerSourceMetadata && typeof oRepo._InnerSourceMetadata.score === "number") {
		sScoreIndicator = getActivityLogo(oRepo._InnerSourceMetadata.score);
		vScoreNumeric = oRepo._InnerSourceMetadata.score;
	}

	return [sScoreIndicator, vScoreNumeric];
}

// fetches the corresponding image for the activity score
function getActivityLogo (iScore) {
	let sLogo = "images/activity/0.png",
		sActivityLevel = "None";

	if (iScore > 2500) {
		sLogo = "images/activity/5.png";
		sActivityLevel = "Extremely High";
	} else if (iScore > 1000) {
		sLogo = "images/activity/4.png";
		sActivityLevel = "Very High";
	} else if (iScore > 300) {
		sLogo = "images/activity/3.png";
		sActivityLevel = "High";
	} else if (iScore > 150) {
		sLogo = "images/activity/2.png";
		sActivityLevel = "Moderate";
	} else if (iScore > 50) {
		sLogo = "images/activity/1.png";
		sActivityLevel = "Low";
	} else if (iScore > 5) {
		sLogo = "images/activity/0.png";
		sActivityLevel = "Very Low";
	}

	return window._globals.templates.score({
		"logo": sLogo,
		"level": sActivityLevel
	});
}

// calculations a color for the participation value
function getParticipationColor (iValue) {
	let iOpacity;
	if (!iValue) {
		return false;
	}
	if (iValue === 0) {
		iOpacity = 0;
	} else {
		iOpacity = Math.log(iValue)/4 + 0.03; // 50 = 1, scale logarithmically below
	}
	iOpacity = Math.min(1, iOpacity);
	return "rgba(50, 205, 50, " + iOpacity + ")";
}

// creates an HTMl-based heatmap for the current week and the previous 12 weeks from participation stats
function createParticipationChart (oRepo) {
	let aParticipation = oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.participation;
	if (!aParticipation) {
		return "N/A";
	}
	const aPrevious12Weeks = aParticipation.slice(aParticipation.length - 13, aParticipation.length - 1).reverse();

	// this week
	let iValue = aParticipation[aParticipation.length - 1];
	let oContext = {
		thisWeek: {
			"commits": iValue,
			"color": getParticipationColor(iValue)
		},
		"weeksPreviousLabel": undefined,
		"weeksPrevious": [],
		"weeksBeforeLabel": undefined,
		"weeksBefore": []
	};

	// previous 12 weeks
	const iCreatedWeeksAgo = Math.ceil((Date.now() - new Date(oRepo.created_at).getTime()) / 1000 / 86400 / 7) - 1;
	let iCommitsWeeksBefore = 0;
	aPrevious12Weeks.forEach((iValue, iIndex) => {
		// don't print boxes for new repos
		if (iIndex >= iCreatedWeeksAgo) {
			return;
		}
		iCommitsWeeksBefore += iValue;

		oContext.weeksPrevious.push({
			"commits": iValue,
			"color": getParticipationColor(iValue)
		});
	});
	oContext.weeksPreviousLabel = Math.min(12, iCreatedWeeksAgo) + " weeks: " + iCommitsWeeksBefore;

	// 9 months before in weeks
	const aPrevious9months = aParticipation.slice(1, aParticipation.length - 13).reverse();
	let iWeeksBefore = 0;
	let iCommitsMonthBefore = 0;
	aPrevious9months.forEach((iValue, iIndex) => {
		// don't print boxes for new repos
		if (iIndex >= iCreatedWeeksAgo - 13) {
			return;
		}
		iCommitsMonthBefore += iValue;
		iWeeksBefore++;

		oContext.weeksBefore.push({
			"commits": iValue,
			"color": getParticipationColor(iValue)
		});
	});
	oContext.weeksBeforeLabel = (Math.floor(iWeeksBefore / 4) <= 1 ? iWeeksBefore + " weeks before: " : Math.floor(iWeeksBefore / 4) + " months before: ") + iCommitsMonthBefore;

	return window._globals.templates.participation(oContext);
}

// creates HTML for and displays a project details modal
function showModal (vRepoId, oEvent) {
	// don't open modal when clicking on direct links
	if (oEvent && oEvent.target.href) {
		return;
	}
	const oRepo = window._globals.allRepos.filter(oRepo => oRepo.id === vRepoId).pop();

	let sLogoURL = oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.logo
		? oRepo._InnerSourceMetadata.logo.startsWith("http") || oRepo._InnerSourceMetadata.logo.startsWith("./")
			? oRepo._InnerSourceMetadata.logo
			: "data/" + oRepo._InnerSourceMetadata.logo + (oRepo._InnerSourceMetadata.logo.split(".").pop() === "svg" ? "?sanitize=true" : "")
		: oRepo.owner.avatar_url;

	let sTitle = oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.title
		? oRepo._InnerSourceMetadata.title
		: readableRepoName(oRepo.name);

	let sDescription = oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.motivation
		? oRepo._InnerSourceMetadata.motivation
		: oRepo.description !== null
			? oRepo.description
			: "";

	let [sScoreIndicator, vScoreNumeric] = getRepoActivity(oRepo);

	let aSkills = oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.skills
		? oRepo._InnerSourceMetadata.skills
		: oRepo.language ?
			[oRepo.language] :
			[];

	let aContributions = oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.contributions && oRepo._InnerSourceMetadata.contributions.length
		? oRepo._InnerSourceMetadata.contributions
		: ["Any"];

	let sContributeURL = oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.docs
		? oRepo._InnerSourceMetadata.docs
		: oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.guidelines
			? `${oRepo.html_url}/blob/${oRepo.default_branch}/${oRepo._InnerSourceMetadata.guidelines}`
			: oRepo.html_url;

	let oContext = {
		"id" : (typeof oRepo.id === "string" ? "'" + oRepo.id + "'" : oRepo.id),
		"mediaURL": sLogoURL,
		"title": sTitle,
		"repoURL": oRepo.html_url,
		"repoTitle": oRepo.owner.login + "/" + oRepo.name,
		"description": sDescription,
		"topics": oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.topics,
		"stars": oRepo.stargazers_count,
		"issues": oRepo.open_issues_count,
		"forks": oRepo.forks_count,
		"score": sScoreIndicator,
		"scoreNumeric": vScoreNumeric,
		"language": getRepoLanguage(oRepo.language),
		"skills": aSkills,
		"contributions": aContributions,
		"documentationURL": oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.docs,
		"createdAt": moment(oRepo.created_at).format("MMMM Do YYYY"),
		"lastUpdate": moment(oRepo.updated_at).fromNow(),
		"contributeURL": sContributeURL
	};

	// fill & init modal
	const oModalWrapper = window.document.getElementById("modal-details");
	oModalWrapper.innerHTML = window._globals.templates.details(oContext);

	// register close handler
	M.Modal.init(oModalWrapper, {
		onCloseEnd: () => {
			updateHash("details", undefined);
		}
	});
	// initialize tooltips
	M.Tooltip.init(oModalWrapper.querySelectorAll(".tooltipped"));

	// replace broken images with a	default image
	registerFallbackImage(oModalWrapper);

	// open dialog
	M.Modal.getInstance(oModalWrapper).open();
	oModalWrapper.getElementsByClassName("participationChart")[0].innerHTML = createParticipationChart(oRepo);
	updateHash("details", vRepoId);
}

// fills the HTML template for a project item
function generateItem (sDisplay, oRepo) {
	let sLogoURL = oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.logo
		? oRepo._InnerSourceMetadata.logo.startsWith("http") || oRepo._InnerSourceMetadata.logo.startsWith("./")
			? oRepo._InnerSourceMetadata.logo
			: "data/" + oRepo._InnerSourceMetadata.logo + (oRepo._InnerSourceMetadata.logo.split(".").pop() === "svg" ? "?sanitize=true" : "")
		: oRepo.owner.avatar_url;

	let sTitle = oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.title
		? oRepo._InnerSourceMetadata.title
		: readableRepoName(oRepo.name);

	let sDescription = oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.motivation
		? oRepo._InnerSourceMetadata.motivation
		: oRepo.description !== null
			? oRepo.description
			: "";

	let sContributeURL = oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.docs
		? oRepo._InnerSourceMetadata.docs
		: oRepo._InnerSourceMetadata && oRepo._InnerSourceMetadata.guidelines
			? `${oRepo.html_url}/blob/${oRepo.default_branch}/${oRepo._InnerSourceMetadata.guidelines}`
			: oRepo.html_url;

	let oContext = {
		"id" : (typeof oRepo.id === "string" ? "'" + oRepo.id + "'" : oRepo.id),
		"mediaURL": sLogoURL,
		"title": sTitle,
		"repoURL": oRepo.html_url,
		"repoTitle": oRepo.owner.login + "/" + oRepo.name,
		"description": sDescription,
		"stars": oRepo.stargazers_count,
		"issues": oRepo.open_issues_count,
		"forks": oRepo.forks_count,
		"score": getRepoActivity(oRepo)[0],
		"language": getRepoLanguage(oRepo.language),
		"contributeURL": sContributeURL
	};

	// execute pre-compiled template function
	return window._globals.templates[sDisplay](oContext);
}

// load repos.json file and display the list of projects from it
window.document.addEventListener("DOMContentLoaded", function() {
	// load data
	let oXHR = new XMLHttpRequest();
	oXHR.open("GET", "repos.json");
	oXHR.onload = () => {
		if (oXHR.status === 200) {
			window._globals.allRepos = JSON.parse(oXHR.responseText);
			fillLanguageFilter();
			updateUI();
			// show number of projects in header
			window.document.getElementById("count").innerText = window._globals.allRepos.length;
		} else {
			console.log("Request failed.	Returned status of " + oXHR.status);
		}
	};
	oXHR.send();

	// init templates
	window._globals.templates.card = Handlebars.compile(window.document.getElementById("card-template").innerHTML);
	window._globals.templates.list = Handlebars.compile(window.document.getElementById("list-template").innerHTML);
	window._globals.templates.score = Handlebars.compile(window.document.getElementById("score-template").innerHTML);
	window._globals.templates.language = Handlebars.compile(window.document.getElementById("language-template").innerHTML);
	window._globals.templates.details = Handlebars.compile(window.document.getElementById("details-template").innerHTML);
	window._globals.templates.participation = Handlebars.compile(window.document.getElementById("participation-template").innerHTML);

	// init filters
	window.document.getElementById("sort").addEventListener("change", function () {
		sort(this.value);
	});
	window.document.getElementById("filter").addEventListener("change", function () {
		filter(this.value);
	});
	window.document.getElementById("search").addEventListener("keyup", function () {
		search(this.value);
	});
	window.document.getElementById("display").addEventListener("change", function () {
		display(this.checked ? "card" : "list");
	});
});

// fill language filter list based on detected languages
function fillLanguageFilter () {
	let aAllLanguages = [];
	// create a unique list of languages
	window._globals.allRepos.map(repo => {
		if (repo.language && !aAllLanguages.includes(repo.language)) {
			aAllLanguages.push(repo.language);
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
	M.FormSelect.init(document.querySelectorAll("select"));
	addLanguageIconsToFilter();
}

// sneak in language icons
function addLanguageIconsToFilter() {
	let aItems = window.document.getElementById("filter").parentNode.getElementsByTagName("li");
	for (let i = 0; i < aItems.length; i++) {
		if (aItems[i].innerText !== "All" && aItems[i].innerText !== "Other") {
			aItems[i].innerHTML = getRepoLanguage(aItems[i].innerText) + aItems[i].innerHTML;
		}
	}
}

// sort the cards by chosen parameter (additive, combines filter or search)
function sort (sParam) {
	let aResult;
	if (["name", "full_name"].includes(sParam)) {
		// sort alphabetically
		aResult = window._globals.sortFilterSearchRepos.sort((a, b) => (b[sParam] < a[sParam] ? 1 : -1));
	} else if (sParam === "score" && window._globals.sortFilterSearchRepos[0]["_InnerSourceMetadata"]) {
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
function filter (sParam) {
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
			repo.full_name.toLowerCase().includes(sLowerCaseParam) ||
			// description
			(repo.description && repo.description.toLowerCase().includes(sLowerCaseParam)) ||
			// InnerSource metadata
			repo._InnerSourceMetadata && (
				// topics
				repo._InnerSourceMetadata.topics &&
				repo._InnerSourceMetadata.topics.join(" ").toLowerCase().includes(sLowerCaseParam) ||
				// custom title
				repo._InnerSourceMetadata.title &&
				repo._InnerSourceMetadata.title.toLowerCase().includes(sLowerCaseParam) ||
				// motivation
				repo._InnerSourceMetadata.motivation &&
				repo._InnerSourceMetadata.motivation.toLowerCase().includes(sLowerCaseParam) ||
				// skills
				repo._InnerSourceMetadata.skills &&
				repo._InnerSourceMetadata.skills.join(" ").toLowerCase().includes(sLowerCaseParam) ||
				// contributions
				repo._InnerSourceMetadata.contributions &&
				repo._InnerSourceMetadata.contributions.join(" ").toLowerCase().includes(sLowerCaseParam)
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
	addLanguageIconsToFilter();
}

// toggles the display between card and table view
function display (sParam) {
	// update UI
	window.document.getElementById("display").checked = (sParam !== "list");
	// toggle active icon
	window.document.getElementsByClassName("switch")[0].getElementsByTagName("i")[sParam !== "list" ? 1 : 0].classList.add("active");
	window.document.getElementsByClassName("switch")[0].getElementsByTagName("i")[sParam !== "list" ? 0 : 1].classList.remove("active");
	// only create content when mode has changed
	if (!document.getElementById(sParam !== "list" ? "cards" : "rows").innerHTML) {
		// store context
		updateHash("display", sParam);
		// create content
		createContent(window._globals.sortFilterSearchRepos);
	}
	// toggle content
	window.document.getElementById(sParam !== "list" ? "rows" : "cards").innerHTML = "";
	window.document.getElementById(sParam !== "list" ? "cards" : "list").style.display = "block";
	window.document.getElementById(sParam !== "list" ? "list" : "cards").style.setProperty("display", "none", "important");
}

async function fetch_repos(url) {
	let response = await fetch(url);
	let data = await response.json();
	return data;
}

function generate_schema(data) {
	function collect_unique_keys(obj, path = "") {
		/*
		* recursevily collects all unique keys
		* this is necessary for converting to csv file
		*/
		for (const key in obj) {
			const newPath = path ? `${path}.${key}` : key;
			if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
				collect_unique_keys(obj[key], newPath);
			} else {
				allKeys[newPath] = Array.isArray(obj[key]) ? ["hs"] : "hs"; // hiee
			}
		}
	}

	function key_finalizer(obj, path) {
		/*
		* This function creates the template json object
		* it splits the path by '.' and checks if the corresponding key exists
		* if not, it creates a new object
		* at the end it returns the full template object
		*/

		path.split('.').reduce((acc, part, index, arr) => {
			if (!acc[part]) {
				acc[part] = index === arr.length - 1 ? obj[path] : {};
			}
			return acc[part];
		}, template);
	}

	let allKeys = {};
	let template = {};

	data.forEach(item => collect_unique_keys(item));
	Object.keys(allKeys).forEach(keyPath => key_finalizer(allKeys, keyPath));
	return template;
}

async function repos_to_csv() {
	/*
	* this is the main method of csv download
	* first it fetches the data, followed by generating the template of the json
	*
	* then it flattens the json object and extracts the keys
	* and subsequently flattens the each entry of the json object
	* for any entry, where there is no data on keys which exist in the template, it will be set to "nodata"
	* at the end, it merges all and calls the download_csv_file function
	*/
	let data = await fetch_repos(`${window.location.origin}/repos.json`);
	let template = generate_schema(data);

	let csv_keys = Object.keys(flatten(template));
	let csv_rows = [csv_keys.join(";")];

	data.forEach(entry => {
		let flattenedEntry = flatten(entry);
		let row = csv_keys.map(key => (flattenedEntry[key] !== undefined ? flattenedEntry[key] : "nodata"));
		csv_rows.push(row.join(";"));
	});

	let csv_content = csv_rows.join("\n");
	download_csv_file(csv_content, "repos.csv");
}


const flatten = (object, path = '') =>
	Object.entries(object).reduce((acc, [key, val]) => {
		/*
		* this function flattens the json object, which will be used to create the csv headers
		* step by step, works like this
		* if value is undefined -> return accumulator
		* if path already exsits, append the current key to the current path, thus basically creating a nest .dot notation
		* if the value is an array, don't seperate the value and flatten each one by itself, rather save array as one value
		* if the value is an object (not date or regex) it checks if there are custom functions, if yes use that value, otherwise merge into accumulator
		* if the value are strings / integers, directly assign and just return them
		* source: https://gist.github.com/penguinboy/762197?permalink_comment_id=4058844   -> array unification was added
		*/
		if (val === undefined) return acc;
		if (path) key = `${path}.${key}`;
		if (Array.isArray(val)) {
			acc[key] = `[${val.join(",")}]`;
		} else if (typeof val === 'object' && val !== null && !(val instanceof Date) && !(val instanceof RegExp)) {
			if (val !== val.valueOf()) {
				return { ...acc, [key]: val.valueOf() };
			}
			return { ...acc, ...flatten(val, key) };
		} else {
			acc[key] = val;
		}
		return acc;
	}, {});


function description_formatting(entry) {
	/*
	* should there be the rare case where the semicolon char ';' appears in the description,
	* then this function needs to be called, so that the seperation by the delimiter works
	* use this in a for-loop
	*/
	let description = entry.description;
	description = description.replace(';', ',');
	return description;
}

function download_csv_file(csv, file_name) {
	/*
	* This function creates the downloadable object in the browser
	* and triggers the download automatically once run
	*/
	let blob = new Blob([csv], { type: 'text/csv' });
	let link = document.createElement('a');
	if (link.download !== undefined) {
		let url = URL.createObjectURL(blob);
		link.setAttribute('href', url);
		link.setAttribute('download', file_name);
		link.style.visibility = 'hidden';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
}