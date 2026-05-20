let contentArea = document.getElementById("content");
let imgPrefix = "https://www.philipbkemp.net/alex/clubs/";
let params = {
    lang: "en",
    home: "",
    away: ""
};
let teams = {};
let texts = {};

try {
    pullParams();
    const [rTexts,rTeams] = await Promise.all([
        fetch("assets/trans/"+params.lang+".json"),
        fetch("assets/data/teams.json")
    ]);
    texts = await rTexts.json();
    teams = await rTeams.json();
    doneFetch();
} catch ( error ) {
    handleError(error);
}

function rebuildURL() {
    const url = new URL(window.location.href);
    Object.keys(params).forEach(p=>{
        if ( params[p] === "" ) {
            url.searchParams.delete(p);
        } else {
            url.searchParams.set(p,params[p]);
        }
    });
    window.history.pushState({},"",url);
}

function pullParams() {
    window.location.search.replace("?","").split("&").forEach(param=>{
        const parts = param.split("=");
        params[parts[0]] = parts[1];
    });
}

function handleError(error) {
    alert("Error!");
    console.error(error);
}

function doneFetch() {

    if ( params.home !== "" && params.away !== "" ) {
        drawSummary();
        return;
    }

    let homeWrap = document.createElement("DIV");
    homeWrap.setAttribute("id","home-wrapper");

    let homePrompt = document.createElement("LABEL");
    homePrompt.innerHTML = texts.select_home;
    homePrompt.setAttribute("for","in_home");
    homePrompt.classList.add("form-label");
    homeWrap.append(homePrompt);

    let homeTeamSelect = document.createElement("SELECT");
    homeTeamSelect.setAttribute("id","in_home");
    homeTeamSelect.setAttribute("name","in_home");
    homeTeamSelect.classList.add("form-select","form-control");
    let homeTeamOptionEmpty = document.createElement("OPTION");
    homeTeamOptionEmpty.value = "";
    homeTeamOptionEmpty.innerHTML = "";
    homeTeamSelect.append(homeTeamOptionEmpty);
    Object.keys(teams).forEach(t=>{
        let homeTeamOption = document.createElement("OPTION");
        homeTeamOption.value = teams[t].key;
        homeTeamOption.innerHTML = teams[t].name;
        homeTeamSelect.append(homeTeamOption);
    });
    homeTeamSelect.addEventListener("change",function(){
        params.home = homeTeamSelect.value;
        homeWrap.classList.add("d-none");
        awayWrap.classList.remove("d-none");
        document.querySelector("#away-wrapper option[value='"+params.home+"']").classList.add('d-none');
        rebuildURL();
    });
    homeWrap.append(homeTeamSelect);
    const sortingHomeOptions = Array.from(homeTeamSelect.options);
    sortingHomeOptions
        .sort((a, b) => a.text.localeCompare(b.text))
        .forEach(opt => homeTeamSelect.appendChild(opt));

    contentArea.append(homeWrap);

    let awayWrap = document.createElement("DIV");
    awayWrap.setAttribute("id","away-wrapper");
    awayWrap.classList.add("d-none");

    let awayPrompt = document.createElement("LABEL");
    awayPrompt.innerHTML = texts.select_away;
    awayPrompt.setAttribute("for","in_away");
    awayPrompt.classList.add("form-label");
    awayWrap.append(awayPrompt);

    let awayTeamSelect = document.createElement("SELECT");
    awayTeamSelect.setAttribute("id","in_away");
    awayTeamSelect.setAttribute("name","in_away");
    awayTeamSelect.classList.add("form-select","form-control");
    let awayTeamOptionEmpty = document.createElement("OPTION");
    awayTeamOptionEmpty.value = "";
    awayTeamOptionEmpty.innerHTML = "";
    awayTeamSelect.append(awayTeamOptionEmpty);
    Object.keys(teams).forEach(t=>{
        let awayTeamOption = document.createElement("OPTION");
        awayTeamOption.value = teams[t].key;
        awayTeamOption.innerHTML = teams[t].name;
        awayTeamSelect.append(awayTeamOption);
    });
    awayTeamSelect.addEventListener("change",function(){
        params.away = awayTeamSelect.value;
        awayWrap.classList.add("d-none");
        drawSummary();
        rebuildURL();
    });
    awayWrap.append(awayTeamSelect);
    const sortingAwayOptions = Array.from(awayTeamSelect.options);
    sortingAwayOptions
        .sort((a, b) => a.text.localeCompare(b.text))
        .forEach(opt => awayTeamSelect.appendChild(opt));

    contentArea.append(awayWrap);

    if ( params.home !== "" ) {
        homeWrap.classList.add("d-none");
        awayWrap.classList.remove("d-none");
        document.querySelector("#away-wrapper option[value='"+params.home+"']").classList.add('d-none');
    }
}

function drawSummary() {
    let summaryWrap = document.createElement("DIV");
    summaryWrap.setAttribute("id","summary-wrapper");
    summaryWrap.classList.add("row");

    let summaryHome = document.createElement("DIV");
    summaryHome.classList.add("col-5");
    let summaryHomeImg = document.createElement("IMG");
    summaryHomeImg.classList.add("team-crest");
    summaryHomeImg.setAttribute("src",imgPrefix + teams[params.home].img);
    summaryHome.append(summaryHomeImg);
    let summaryHomeTeam = document.createElement("DIV");
    summaryHomeTeam.innerHTML = teams[params.home].name;
    summaryHome.append(summaryHomeTeam);
    summaryWrap.append(summaryHome);

    let summaryV = document.createElement("DIV");
    summaryV.classList.add("col-2","is-middle");
    summaryV.innerHTML = "vs.";
    summaryWrap.append(summaryV);

    let summaryAway = document.createElement("DIV");
    summaryAway.classList.add("col-5");
    let summaryAwayImg = document.createElement("IMG");
    summaryAwayImg.classList.add("team-crest");
    summaryAwayImg.setAttribute("src",imgPrefix + teams[params.away].img);
    summaryAway.append(summaryAwayImg);
    let summaryAwayTeam = document.createElement("DIV");
    summaryAwayTeam.innerHTML = teams[params.away].name;
    summaryAway.append(summaryAwayTeam);
    summaryWrap.append(summaryAway);

    contentArea.append(summaryWrap);

    let summaryOptions = document.createElement("DIV");
    summaryOptions.classList.add("row","fixed-bottom","mb-3","position-fixed");
    let summaryButtons = document.createElement("DIV");
    summaryButtons.classList.add("col-12","px-4");
    let startOver = document.createElement("A");
    startOver.classList.add("btn","btn-outline-danger","w-100","mt-2");
    startOver.innerHTML = texts.start_over;
    startOver.setAttribute("href","?lang="+params.lang);
    summaryButtons.append(startOver);
    let addPlayers = document.createElement("A");
    addPlayers.classList.add("btn","btn-outline-primary","w-100","mt-2");
    addPlayers.innerHTML = texts.go_next;
    addPlayers.setAttribute("href","players.html?lang="+params.lang+"&home="+params.home+"&away="+params.away);
    summaryButtons.append(addPlayers);
    summaryOptions.append(summaryButtons);
    contentArea.append(summaryOptions);
}