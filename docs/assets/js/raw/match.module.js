let contentArea = document.getElementById("content");
let imgPrefix = "assets/badges/";
let params = {
    lang: "en",
    home: "",
    away: "",
    team_home: "",
    team_away: "",
    events: "",
    start: ""
};
let teams = {};
let texts = {};
let homeScore = 0;
let homeScoreDisplay = null;
let homeLines = null;
let awayScore = 0;
let awayScoreDisplay = null;
let awayLines = null;
let scoreLines = null;

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

function rebuildURL(clearStartTime=false) {
    const url = new URL(window.location.href);
    Object.keys(params).forEach(p=>{
        if ( params[p] === "" ) {
            url.searchParams.delete(p);
        } else {
            if ( clearStartTime ) {
                if ( p === "start" ) {
                    url.searchParams.delete(p);
                } else {
                    url.searchParams.set(p,decodeURIComponent(params[p]));
                }
            } else {
                url.searchParams.set(p,decodeURIComponent(params[p]));
            }
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

function updateTimekeeper() {
    const now = new Date();
    const startTime = params.start;
    if ( startTime === "" ) {
        return;
    }
    const [hours,minutes,seconds] = startTime.split(":").map(Number);

    const then = new Date();
    then.setHours(hours,minutes,seconds,0);

    const elapsed = Math.floor((now - then.getTime()) /1000 );
    const elapsedMin = Math.floor(elapsed / 60);
    const elapsedSec = elapsed % 60;

    const formatted = `${String(elapsedMin).padStart(2, "0")}:${String(elapsedSec).padStart(2, "0")}`;

    document.getElementById("timekeeper").textContent = formatted;

    setTimeout(updateTimekeeper, 1000);
}

function doneFetch() {

    let row = document.createElement("DIV");
    row.classList.add("row","mt-5");

    let home = document.createElement("DIV");
    home.classList.add("col-5");
    let homeTeam = document.createElement("DIV");
    homeTeam.classList.add("match-team");
    let homeImg = document.createElement("IMG");
    homeImg.setAttribute("src",imgPrefix + teams[params.home].img);
    homeScoreDisplay = document.createElement("DIV");
    homeScoreDisplay.classList.add("match-score");
    homeScoreDisplay.innerHTML = homeScore;
    homeTeam.append(homeImg);
    homeTeam.append(homeScoreDisplay);
    home.append(homeTeam);

    let time = document.createElement("DIV");
    time.classList.add("col-2","align-items-center","d-flex","justify-content-center");
    let timekeeper = document.createElement("SPAN");
    timekeeper.textContent = "00:00";
    timekeeper.setAttribute("id","timekeeper");
    timekeeper.classList.add("fs-4");
    time.append(timekeeper);

    let away = document.createElement("DIV");
    away.classList.add("col-5");
    let awayTeam = document.createElement("DIV");
    awayTeam.classList.add("match-team");
    let awayImg = document.createElement("IMG");
    awayImg.setAttribute("src",imgPrefix + teams[params.away].img);
    awayScoreDisplay = document.createElement("DIV");
    awayScoreDisplay.classList.add("match-score");
    awayScoreDisplay.innerHTML = awayScore;
    awayTeam.append(awayImg);
    awayTeam.append(awayScoreDisplay);
    away.append(awayTeam);

    row.append(home);
    row.append(time);
    row.append(away);

    let hr = document.createElement("HR");

    contentArea.append(row);
    contentArea.append(hr);

    let rowNotes = document.createElement("DIV");
    rowNotes.classList.add("row","score-wrap");
    rowNotes.setAttribute("id","score-wrap");
    if ( params.events.endsWith("-") ) {
        rowNotes.classList.add("score-ft");
    }

    let homeLineWrap = document.createElement("DIV");
    homeLineWrap.classList.add("col-5","score","score-home","pe-0");
    homeLines = document.createElement("UL");
    homeLineWrap.append(homeLines);
    rowNotes.append(homeLineWrap);

    let scoreLineWrap = document.createElement("DIV");
    scoreLineWrap.classList.add("col-2","score","score-score");
    scoreLines = document.createElement("UL");
    scoreLineWrap.append(scoreLines);
    rowNotes.append(scoreLineWrap);

    let awayLineWrap = document.createElement("DIV");
    awayLineWrap.classList.add("col-5","score","score-away","ps-0");
    awayLines = document.createElement("UL");
    awayLineWrap.append(awayLines);
    rowNotes.append(awayLineWrap);

    contentArea.append(rowNotes);

    params.events = params.events.replaceAll("%7E","~");

    if ( params.events.split("")[0] === "_" ) {
        params.events = "~" + params.events;
    }
    params.events = params.events.replaceAll("__","_~_");

    if ( params.events !== "" ) {
        params.events.split("").forEach(e=>{
            let hLine = "";
            let aLine = "";
            let sLine = "";
            if ( e === "_" || e === "-" ) {
                let newHomeLine = document.createElement("LI");
                newHomeLine.classList.add("score-divider");
                homeLines.append(newHomeLine);
                let newScoreLine = document.createElement("LI");
                newScoreLine.classList.add("score-divider");
                scoreLines.append(newScoreLine);
                let newAwayLine = document.createElement("LI");
                newAwayLine.classList.add("score-divider");
                awayLines.append(newAwayLine);
            } else if ( e === "~" ) {
                let newHomeLine = document.createElement("LI");
                newHomeLine.innerHTML = "&nbsp;";
                homeLines.append(newHomeLine);
                let newScoreLine = document.createElement("LI");
                newScoreLine.innerHTML = homeScore + "-" + awayScore;
                scoreLines.append(newScoreLine);
                let newAwayLine = document.createElement("LI");
                newAwayLine.innerHTML = "&nbsp;";
                awayLines.append(newAwayLine);
            } else {
                const isDigit  = /\d/.test(e);
                const isLetter = /[A-Z]/.test(e);
                if ( isDigit ) { // away goal
                    awayScore++;
                    hLine = "&nbsp;";
                    sLine = homeScore + "-" + awayScore;
                    aLine = decodeURIComponent(params.team_away).split("|")[e];
                } else if ( isLetter ) { // home goal
                    homeScore++;
                    hLine = decodeURIComponent(params.team_home).split("|")[e.codePointAt(0)-65];
                    sLine = homeScore + "-" + awayScore;
                    aLine = "&nbsp;";
                } else {
                    hLine = "?";
                    aLine = "?";
                    sLine = "?";
                }
                let newHomeLine = document.createElement("LI");
                newHomeLine.innerHTML = hLine;
                homeLines.append(newHomeLine);
                let newScoreLine = document.createElement("LI");
                newScoreLine.innerHTML = sLine;
                scoreLines.append(newScoreLine);
                let newAwayLine = document.createElement("LI");
                newAwayLine.innerHTML = aLine;
                awayLines.append(newAwayLine);
            }
        });
        homeScoreDisplay.innerHTML = homeScore;
        awayScoreDisplay.innerHTML = awayScore;
        const container = document.getElementById('score-wrap');
        container.scrollTop = container.scrollHeight;
    }

    let actions = document.createElement("DIV");
    actions.classList.add("row","fixed-bottom","mb-3","position-fixed","mx-1");
    if ( params.events.endsWith("-") ) {
        actions.classList.add("d-none");
    }
    actions.setAttribute("id","actions");
    let actionButtonOne = document.createElement("DIV");
    actionButtonOne.classList.add("col-6");
    let addGoal = document.createElement("BUTTON");
    addGoal.classList.add("btn","btn-outline-primary","mt-2","w-100");
    addGoal.innerHTML = texts.goal;
    addGoal.dataset.bsToggle = "modal";
    addGoal.dataset.bsTarget = "#modalGoal";
    addGoal.setAttribute("id","goGoal");
    actionButtonOne.append(addGoal);
    let actionButtonTwo = document.createElement("DIV");
    actionButtonTwo.classList.add("col-6");
    let pauseGame = document.createElement("BUTTON");
    pauseGame.classList.add("btn","btn-outline-primary","mt-2","w-100");
    pauseGame.setAttribute("id","goPause");
    pauseGame.innerHTML = texts.pause;
    pauseGame.dataset.bsToggle = "modal";
    pauseGame.dataset.bsTarget = "#modalPause";
    actionButtonTwo.append(pauseGame);
    let actionButtonThree = document.createElement("DIV");
    actionButtonThree.classList.add("col-12");
    let startGame = document.createElement("BUTTON");
    startGame.classList.add("btn","btn-outline-primary","mt-2","w-100");
    startGame.setAttribute("id","goKickoff");
    startGame.innerHTML = texts.kickoff;
    actionButtonThree.append(startGame);
    actions.append(actionButtonOne);
    actions.append(actionButtonTwo);
    actions.append(actionButtonThree);
    contentArea.append(actions);

    document.getElementById("goalForHome").innerHTML = texts.select_home;
    document.getElementById("goalForAway").innerHTML = texts.select_away;

    const homeTeamSheet = document.getElementById("modalGoalHomeBtns");
    decodeURIComponent(params.team_home).split("|").forEach((h,index)=>{
        let btn = document.createElement("BUTTON");
        btn.classList.add("btn","btn-outline-primary","w-100","mb-3");
        btn.dataset.bsDismiss = "modal";
        btn.innerHTML = h;
        btn.addEventListener("click",function(){
            params.events += String.fromCodePoint(65 + index);
            rebuildURL();
            homeScore++;
            homeScoreDisplay.innerHTML = homeScore;
            let newHomeLine = document.createElement("LI");
            newHomeLine.innerHTML = h;
            homeLines.append(newHomeLine);
            let newScoreLine = document.createElement("LI");
            newScoreLine.innerHTML = homeScore + "-" + awayScore;
            scoreLines.append(newScoreLine);
            let newAwayLine = document.createElement("LI");
            newAwayLine.innerHTML = "&nbsp;";
            awayLines.append(newAwayLine);

            const container = document.getElementById('score-wrap');
            container.scrollTop = container.scrollHeight;
        });
        homeTeamSheet.append(btn);
    });

    const awayTeamSheet = document.getElementById("modalGoalAwayBtns");
    decodeURIComponent(params.team_away).split("|").forEach((h,index)=>{
        let btn = document.createElement("BUTTON");
        btn.classList.add("btn","btn-outline-primary","w-100","mb-3");
        btn.dataset.bsDismiss = "modal";
        btn.innerHTML = h;
        btn.addEventListener("click",function(){
            params.events += index;
            rebuildURL();
            awayScore++;
            awayScoreDisplay.innerHTML = awayScore;
            let newHomeLine = document.createElement("LI");
            newHomeLine.innerHTML = "&nbsp";
            homeLines.append(newHomeLine);
            let newScoreLine = document.createElement("LI");
            newScoreLine.innerHTML = homeScore + "-" + awayScore;
            scoreLines.append(newScoreLine);
            let newAwayLine = document.createElement("LI");
            newAwayLine.innerHTML = h;
            awayLines.append(newAwayLine);

            const container = document.getElementById('score-wrap');
            container.scrollTop = container.scrollHeight;
        });
        awayTeamSheet.append(btn);
    });

    const pauseBtns = document.getElementById("modalPauseBtns");
    let pauseHalfTime = document.createElement("BUTTON");
    pauseHalfTime.classList.add("btn","btn-outline-primary","w-100","mb-3");
    pauseHalfTime.dataset.bsDismiss = "modal";
    pauseHalfTime.innerHTML = texts.halftime;
    pauseHalfTime.addEventListener("click",function(){
        params.events += "_";
        rebuildURL(true);
        let newHomeLine = document.createElement("LI");
        newHomeLine.classList.add("score-divider");
        homeLines.append(newHomeLine);
        let newScoreLine = document.createElement("LI");
        newScoreLine.classList.add("score-divider");
        scoreLines.append(newScoreLine);
        let newAwayLine = document.createElement("LI");
        newAwayLine.classList.add("score-divider");
        awayLines.append(newAwayLine);
        const container = document.getElementById('score-wrap');
        container.scrollTop = container.scrollHeight;
        window.location.reload();
    });
    pauseBtns.append(pauseHalfTime);

    let pauseFullTime = document.createElement("BUTTON");
    pauseFullTime.classList.add("btn","btn-outline-primary","w-100","mb-3");
    pauseFullTime.dataset.bsDismiss = "modal";
    pauseFullTime.innerHTML = texts.fulltime;
    pauseFullTime.addEventListener("click",function(){
        params.events += "-";
        rebuildURL(true);
        let newHomeLine = document.createElement("LI");
        newHomeLine.classList.add("score-divider");
        homeLines.append(newHomeLine);
        let newScoreLine = document.createElement("LI");
        newScoreLine.classList.add("score-divider");
        scoreLines.append(newScoreLine);
        let newAwayLine = document.createElement("LI");
        newAwayLine.classList.add("score-divider");
        awayLines.append(newAwayLine);
        const container = document.getElementById('score-wrap');
        container.scrollTop = container.scrollHeight;
        actions.classList.add("d-none");
        container.classList.add("score-ft");
        window.location.reload();
    });
    pauseBtns.append(pauseFullTime);

    document.getElementById("modalGoal").addEventListener("hide.bs.modal",()=>{
        if ( document.activeElement ) {
            document.activeElement.blur();
        }
    });
    document.getElementById("modalGoalHome").addEventListener("hide.bs.modal",()=>{
        if ( document.activeElement ) {
            document.activeElement.blur();
        }
    });
    document.getElementById("modalGoalAway").addEventListener("hide.bs.modal",()=>{
        if ( document.activeElement ) {
            document.activeElement.blur();
        }
    });

    document.getElementById("goKickoff").addEventListener("click",()=>{
        window.location.href = window.location.href+"&start="+new Date().toTimeString().split(" ")[0];
    });

    if ( params.start !== "" ) {
        document.getElementById("goGoal").classList.remove("d-none");
        document.getElementById("goPause").classList.remove("d-none");
        document.getElementById("goKickoff").classList.add("d-none");
        document.getElementById("timekeeper").classList.remove("d-none");
    } else {
        document.getElementById("goGoal").classList.add("d-none");
        document.getElementById("goPause").classList.add("d-none");
        document.getElementById("goKickoff").classList.remove("d-none");
        document.getElementById("timekeeper").classList.add("d-none");
    }

    updateTimekeeper();

}