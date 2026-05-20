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

    let rowHome = document.createElement("DIV");
    rowHome.classList.add("row","mt-5");
    let homeImgWrap = document.createElement("DIV");
    homeImgWrap.classList.add("col-3","text-center");
    let homeImg = document.createElement("IMG");
    homeImg.classList.add("team-crest");
    homeImg.setAttribute("src",imgPrefix + teams[params.home].img);
    homeImgWrap.append(homeImg);
    let homeTeamSheet = document.createElement("DIV");
    homeTeamSheet.classList.add("col-9","d-flex","align-items-center");
    homeTeamSheet.innerHTML = decodeURIComponent(params.team_home).split("|").join(", ");
    rowHome.append(homeImgWrap);
    rowHome.append(homeTeamSheet);

    const hr = document.createElement("HR");

    let rowAway = document.createElement("DIV");
    rowAway.classList.add("row");
    let awayImgWrap = document.createElement("DIV");
    awayImgWrap.classList.add("col-3","text-center");
    let awayImg = document.createElement("IMG");
    awayImg.classList.add("team-crest");
    awayImg.setAttribute("src",imgPrefix + teams[params.away].img);
    awayImgWrap.append(awayImg);
    let awayTeamSheet = document.createElement("DIV");
    awayTeamSheet.classList.add("col-9","d-flex","align-items-center");
    awayTeamSheet.innerHTML = decodeURIComponent(params.team_away).split("|").join(", ");
    rowAway.append(awayImgWrap);
    rowAway.append(awayTeamSheet);

    contentArea.append(rowHome);
    contentArea.append(hr);
    contentArea.append(rowAway);

    let kickoff = document.createElement("A");
    kickoff.innerHTML = texts.kickoff;
    kickoff.classList.add("btn","btn-outline-primary","w-100","mt-5");
    kickoff.setAttribute("href","play.html?lang="+params.lang+"&home="+params.home+"&away="+params.away+"&team_home="+params.team_home+"&team_away="+params.team_away);
    contentArea.append(kickoff);

}