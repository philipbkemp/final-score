let awayWrap = null;
let contentArea = document.getElementById("content");
let homeWrap = null;
let imgPrefix = "https://www.philipbkemp.net/alex/clubs/";
let params = {
    lang: "en",
    home: "",
    away: "",
    team_home: "",
    team_away: ""
};
let players = {
    home: [],
    away: []
}
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
            url.searchParams.set(p,decodeURIComponent(params[p]));
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

    let summaryOptions = document.createElement("DIV");
    summaryOptions.classList.add("row","mb-5");
    summaryOptions.setAttribute("id","opts");
    let summaryButtons = document.createElement("DIV");
    summaryButtons.classList.add("col-12","px-4");
    let addAway = document.createElement("BUTTON");
    addAway.classList.add("btn","btn-outline-primary","w-100","mt-2");
    addAway.innerHTML = texts.go_next;
    let addFinished = document.createElement("BUTTON");
    addFinished.classList.add("btn","btn-outline-primary","w-100","mt-2","d-none");
    addFinished.innerHTML = texts.go_next;
    addAway.addEventListener("click",function(){
        homeWrap.classList.add("d-none");
        awayWrap.classList.remove("d-none");
        addAway.classList.add("d-none");
        addFinished.classList.remove("d-none");
        awayWrap.append(drawInput("away"));
    });
    addFinished.addEventListener("click",function(){
        window.location.href = "ready.html?lang="+params.lang+"&home="+params.home+"&away="+params.away+"&team_home="+params.team_home+"&team_away="+params.team_away;
    });
    summaryButtons.append(addAway);
    summaryButtons.append(addFinished);
    summaryOptions.append(summaryButtons);
    contentArea.append(summaryOptions);

    homeWrap = document.createElement("DIV");
    homeWrap.setAttribute("id","home-wrapper");
    homeWrap.classList.add("text-center","mt-2");

    let homeImg = document.createElement("IMG");
    homeImg.classList.add("team-crest");
    homeImg.setAttribute("src",imgPrefix + teams[params.home].img);
    homeWrap.append(homeImg);
    let homeTeam = document.createElement("DIV");
    homeTeam.innerHTML = teams[params.home].name;
    homeWrap.append(homeTeam);

    if ( params.team_home !== "" ) {
        let exist = decodeURIComponent(params.team_home).split("|");
        exist.forEach(p=>{
            let group = document.createElement("DIV");
            group.classList.add("input-group","mt-2");
            let input = document.createElement("INPUT");
            input.classList.add("form-control");
            input.value = p;
            players.home.push(p);
            input.readOnly = true;
            group.append(input);
            homeWrap.append(group);
        });
    }

    homeWrap.append(drawInput("home"));

    contentArea.append(homeWrap);

    awayWrap = document.createElement("DIV");
    awayWrap.setAttribute("id","away-wrapper");
    awayWrap.classList.add("text-center","mt-2","d-none");

    let awayImg = document.createElement("IMG");
    awayImg.classList.add("team-crest");
    awayImg.setAttribute("src",imgPrefix + teams[params.away].img);
    awayWrap.append(awayImg);
    let awayTeam = document.createElement("DIV");
    awayTeam.innerHTML = teams[params.away].name;
    awayWrap.append(awayTeam);

    if ( params.team_away !== "" ) {
        let exist = decodeURIComponent(params.team_away).split("|");
        exist.forEach(p=>{
            let group = document.createElement("DIV");
            group.classList.add("input-group","mt-2");
            let input = document.createElement("INPUT");
            input.classList.add("form-control");
            input.value = p;
            players.home.push(p);
            input.readOnly = true;
            group.append(input);
            awayWrap.append(group);
        });
    }

    contentArea.append(awayWrap);
}

function drawInput(team) {
    let group = document.createElement("DIV");
    group.classList.add("input-group","mt-2");

    let input = document.createElement("INPUT");
    input.classList.add("form-control");
    input.setAttribute("placeholder",texts.name);

    let btn = document.createElement("BUTTON");
    btn.classList.add("btn","btn-outline-primary");
    btn.innerHTML = texts.add;

    input.addEventListener("keydown",ev=>{
        if ( input.value.trim() !== "" ) {
            if ( ev.key === "Enter" ) {
                if ( players[team].includes(input.value) ) {
                    alert("Player already in team");
                } else {
                    players[team].push(input.value);
                    params['team_'+team] = players[team].join("|");
                    input.readOnly = true;
                    btn.classList.add("d-none");
                    if ( team === "home" ) {
                        homeWrap.append(drawInput("home"));
                    } else if ( team === "away" ) {
                        awayWrap.append(drawInput("away"));
                    }
                    rebuildURL();
                }
            }
        }
    });
    btn.addEventListener("click",function(){
        if ( input.value.trim() !== "" ) {
            if ( players[team].includes(input.value) ) {
                alert("Player already in team");
            } else {
                players[team].push(input.value);
                params['team_'+team] = players[team].join("|");
                input.readOnly = true;
                btn.classList.add("d-none");
                if ( team === "home" ) {
                    homeWrap.append(drawInput("home"));
                } else if ( team === "away" ) {
                    awayWrap.append(drawInput("away"));
                }
                rebuildURL();
            }
        }
    });
    group.append(input);
    group.append(btn);

    if ( input.value !== "" ) {
        setTimeout(()=>{btn.click()},100);
    }

    setTimeout(()=>{input.focus()},5);

    return group;
}