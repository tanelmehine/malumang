document.addEventListener("DOMContentLoaded", function() {
    let gameState = null;
    // roundDetailsVisible: märgib, milliste voorude detailide kuvamine on lubatud (toggeldatakse päise klikkimisega)
    let roundDetailsVisible = {};
    // previousTeams: kasutaja poolt lisatud tiimid (varasemate tiimide loend)
    let previousTeams = [];
    // addedFromPrevious: objekt, kus võtmed on tiimide nimed ja väärtus true, kui tiim on juba lisatud mängusse
    let addedFromPrevious = {};
  
    // Elementide seosed
    const homeView = document.getElementById("homeView");
    const btnNewGame = document.getElementById("btnNewGame");
    const btnEditGame = document.getElementById("btnEditGame");
    
    const settingsView = document.getElementById("settingsView");
    const gameNameInput = document.getElementById("gameName");
    const teamListDiv = document.getElementById("teamList");
    const btnAddTeam = document.getElementById("btnAddTeam");
    const btnStartGame = document.getElementById("btnStartGame");
    const btnBackFromSettings = document.getElementById("btnBackFromSettings");
    const prevGamesSelect = document.getElementById("prevGamesSelect");
    const roundOptionsDiv = document.getElementById("roundOptions");
    const numRoundsInput = document.getElementById("numRounds");
    const questionCountInput = document.getElementById("questionCount");
    
    const previousTeamsList = document.getElementById("prevTeamsList");
    
    const pointsView = document.getElementById("pointsView");
    const navTitleSpan = document.getElementById("navTitle");
    const roundNavDiv = document.getElementById("roundNav");
    const btnBackToPoints = document.getElementById("btnBackToPoints");
    const btnShowResults = document.getElementById("btnShowResults");
    const pointsContentDiv = document.getElementById("pointsContent");
    const navButtonsDiv = document.getElementById("navButtons");
    const btnBackToSettings = document.getElementById("btnBackToSettings");
    
    const resultsView = document.getElementById("resultsView");
    const btnBackToPointsResults = document.getElementById("btnBackToPointsResults");
    const resultsTableHeadRow = document.querySelector("#resultsTable thead tr");
    const resultsTableBody = document.querySelector("#resultsTable tbody");
    
    const mainTitle = document.getElementById("mainTitle");
    const btnSaveGame = document.getElementById("btnSaveGame");
  
    // Abifunktsioonid localStorage jaoks
    function saveGameState() {
      localStorage.setItem("malmatuGameState", JSON.stringify(gameState));
    }
    function loadGameState() {
      const saved = localStorage.getItem("malmatuGameState");
      if (saved) {
        try {
          gameState = JSON.parse(saved);
          return true;
        } catch(e) {
          console.error("Laadimisviga:", e);
          return false;
        }
      }
      return false;
    }
    
    // Dummy andmed varasemate mängude jaoks
    function populatePreviousData() {
      prevGamesSelect.innerHTML = "<option value=''>Vali varasem mäng</option>";
      prevGamesSelect.innerHTML += "<option value='game1'>Eelmine mäng: Näidis</option>";
      updatePreviousTeamsUI();
    }
    
    // Uuendab varasemate tiimide loendit paremas aknas
    function updatePreviousTeamsUI() {
      previousTeamsList.innerHTML = "";
      previousTeams.forEach((teamName, index) => {
        const li = document.createElement("li");
        // Näidatakse ka indekseerimine (1., 2., ...)
        li.textContent = (index+1) + ". " + teamName;
        const addBtn = document.createElement("button");
        addBtn.className = "addFromPrev";
        addBtn.textContent = "+";
        if (addedFromPrevious[teamName]) {
          addBtn.disabled = true;
          addBtn.style.backgroundColor = "#aaa";
        }
        addBtn.addEventListener("click", function() {
          addTeam(teamName, teamListDiv, true);
          addedFromPrevious[teamName] = true;
          updatePreviousTeamsUI();
        });
        li.appendChild(addBtn);
        previousTeamsList.appendChild(li);
      });
    }
    
    // Lisab tiimirea seadete lehel. Kui fromPrev on true, märgib see, et tiim tuleb varasemast loendist.
    function addTeam(name, container, fromPrev = false) {
      const div = document.createElement("div");
      div.className = "teamRow";
      // Sisend koos tiimi nimega
      div.innerHTML = `<label>Tiim:</label>
                       <input type="text" class="teamNameInput" placeholder="Sisesta tiimi nimi" value="${name}">`;
      // Punane kustutamise nupp
      const removeBtn = document.createElement("button");
      removeBtn.className = "removeTeamBtn";
      removeBtn.textContent = "x";
      removeBtn.addEventListener("click", function() {
        const teamName = div.querySelector(".teamNameInput").value.trim();
        if(addedFromPrevious[teamName]) {
          addedFromPrevious[teamName] = false;
        }
        container.removeChild(div);
        updatePreviousTeamsUI();
      });
      div.appendChild(removeBtn);
      // Roheline lisamise nupp, et lisada tiim varasemate tiimide loendisse
      const addToPrevBtn = document.createElement("button");
      addToPrevBtn.className = "addToPrevBtn";
      addToPrevBtn.textContent = "+";
      const currentName = div.querySelector(".teamNameInput").value.trim();
      if (currentName && previousTeams.includes(currentName)) {
        addToPrevBtn.disabled = true;
        addToPrevBtn.style.backgroundColor = "#aaa";
      }
      addToPrevBtn.addEventListener("click", function() {
        const teamName = div.querySelector(".teamNameInput").value.trim();
        if(teamName && !previousTeams.includes(teamName)) {
          previousTeams.push(teamName);
          addedFromPrevious[teamName] = true;
          div.querySelector(".teamNameInput").style.color = "grey";
          addToPrevBtn.disabled = true;
          addToPrevBtn.style.backgroundColor = "#aaa";
          updatePreviousTeamsUI();
        }
      });
      div.appendChild(addToPrevBtn);
      container.appendChild(div);
    }
    
    // Uue mängu loomiseks – sisendid puhastatakse ja seadete vaade kuvatakse
    btnNewGame.addEventListener("click", function() {
      gameNameInput.value = "";
      questionCountInput.value = 10;
      teamListDiv.innerHTML = "";
      addTeam("", teamListDiv);
      document.getElementById("roundNo").checked = true;
      roundOptionsDiv.style.display = "none";
      homeView.style.display = "none";
      settingsView.style.display = "block";
    });
    
    // Vana mängu muutmiseks – kui salvestatud andmed leitakse, täidetakse väljad
    btnEditGame.addEventListener("click", function() {
      if (loadGameState()) {
        gameNameInput.value = gameState.gameName || "";
        questionCountInput.value = gameState.totalQuestions || 10;
        teamListDiv.innerHTML = "";
        if (gameState.teams && gameState.teams.length > 0) {
          gameState.teams.forEach(team => {
            addTeam(team.name, teamListDiv);
          });
        } else {
          addTeam("", teamListDiv);
        }
        if (gameState.numRounds && gameState.numRounds > 1) {
          document.getElementById("roundYes").checked = true;
          roundOptionsDiv.style.display = "block";
          numRoundsInput.value = gameState.numRounds;
        } else {
          document.getElementById("roundNo").checked = true;
          roundOptionsDiv.style.display = "none";
        }
        homeView.style.display = "none";
        settingsView.style.display = "block";
      } else {
        alert("Salvestatud mängu andmeid ei leitud.");
      }
    });
    
    btnAddTeam.addEventListener("click", function() {
      addTeam("", teamListDiv);
    });
    
    btnBackFromSettings.addEventListener("click", function() {
      settingsView.style.display = "none";
      homeView.style.display = "block";
    });
    
    // Näitab või peidab vooru sisendi sõltuvalt raadio nupu väärtusest
    document.getElementsByName("roundOption").forEach(radio => {
      radio.addEventListener("change", function() {
        if (this.value === "1") {
          roundOptionsDiv.style.display = "block";
        } else {
          roundOptionsDiv.style.display = "none";
        }
      });
    });
    
    // Mängu alustamine – kogutakse seadete andmed ja luuakse gameState
    btnStartGame.addEventListener("click", function() {
      const gameName = gameNameInput.value.trim();
      const totalQuestions = parseInt(questionCountInput.value);
      const isRounds = document.getElementById("roundYes").checked;
      const numRounds = (isRounds ? parseInt(numRoundsInput.value) : 0);
      const teamInputs = document.querySelectorAll(".teamNameInput");
      let teams = [];
      teamInputs.forEach(input => {
        let name = input.value.trim();
        if (!name) { name = "Tiim"; }
        teams.push({ name: name, points: new Array(totalQuestions).fill(null) });
      });
      gameState = {
        gameName: gameName,
        totalQuestions: totalQuestions,
        numRounds: numRounds,
        currentQuestion: 1,
        teams: teams
      };
      saveGameState();
      mainTitle.textContent = gameState.gameName;
      settingsView.style.display = "none";
      pointsView.style.display = "block";
      resultsView.style.display = "none";
      renderNavigation();
      renderPointsTable();
    });
    
    // Navibaari renderdamine: kui mäng on voorudena (numRounds > 1), siis kuvatakse voorunupud
    // ja all navinupud liikumiseks voorude kaupa (vastasel juhul küsimuste kaupa)
    function renderNavigation() {
      roundNavDiv.innerHTML = "";
      if (gameState.numRounds > 1) {
        navTitleSpan.textContent = "Voorud";
        const questionsPerRound = Math.floor(gameState.totalQuestions / gameState.numRounds);
        for (let r = 1; r <= gameState.numRounds; r++) {
          const btn = document.createElement("button");
          btn.textContent = toRoman(r);
          btn.classList.add("roundNavBtn");
          if (getCurrentRound() === r) { btn.classList.add("current"); }
          btn.addEventListener("click", function() {
            gameState.currentQuestion = (r - 1) * questionsPerRound + 1;
            renderNavigation();
            renderPointsTable();
            saveGameState();
          });
          roundNavDiv.appendChild(btn);
        }
      } else {
        navTitleSpan.textContent = "Küsimused";
        // Kui mitte voorudena, saab vajadusel lisada küsimusnupud ülal
      }
    }
    
    function getCurrentRound() {
      if (gameState.numRounds > 1) {
        const questionsPerRound = Math.floor(gameState.totalQuestions / gameState.numRounds);
        return Math.floor((gameState.currentQuestion - 1) / questionsPerRound) + 1;
      }
      return 0;
    }
    
    // Punktide sisestamise tabeli renderdamine
    function renderPointsTable() {
      pointsContentDiv.innerHTML = "";
      navButtonsDiv.innerHTML = "";
      const table = document.createElement("table");
      table.className = "pointsTable";
      
      // Tabeli päis
      const header = document.createElement("tr");
      const thTeam = document.createElement("th");
      thTeam.textContent = "Tiim";
      header.appendChild(thTeam);
      
      let questionIndices = [];
      if (gameState.numRounds > 1) {
        const questionsPerRound = Math.floor(gameState.totalQuestions / gameState.numRounds);
        const currentRound = getCurrentRound();
        const roundStart = (currentRound - 1) * questionsPerRound + 1;
        const roundEnd = (currentRound === gameState.numRounds) ? gameState.totalQuestions : roundStart + questionsPerRound - 1;
        for (let q = roundStart; q <= roundEnd; q++) {
          questionIndices.push(q);
          const th = document.createElement("th");
          th.textContent = q;
          header.appendChild(th);
        }
        // Veeru pealkiri "Vooru punktid" (kollane taust, stiil on CSS-is)
        const thRoundTotal = document.createElement("th");
        thRoundTotal.textContent = "Vooru punktid";
        header.appendChild(thRoundTotal);
      } else {
        questionIndices.push(gameState.currentQuestion);
        const th = document.createElement("th");
        th.textContent = gameState.currentQuestion;
        header.appendChild(th);
      }
      const thTotal = document.createElement("th");
      thTotal.textContent = "Punktid";
      header.appendChild(thTotal);
      table.appendChild(header);
      
      // Iga tiimi rida
      gameState.teams.forEach((team, teamIndex) => {
        const row = document.createElement("tr");
        const tdName = document.createElement("td");
        tdName.innerHTML = `${teamIndex+1}. <strong>${team.name}</strong>`;
        row.appendChild(tdName);
        
        let roundSum = 0;
        questionIndices.forEach(qNum => {
          const td = document.createElement("td");
          // Punktinupud 0,1,2 – väiksemad ja heledama halliga (stiil CSS-is)
          [0,1,2].forEach(val => {
            const btn = document.createElement("button");
            btn.textContent = val;
            btn.setAttribute("data-value", val);
            if (team.points[qNum - 1] === val) {
              btn.classList.add("active");
            }
            btn.addEventListener("click", function() {
              team.points[qNum - 1] = val;
              renderPointsTable();
              saveGameState();
            });
            td.appendChild(btn);
          });
          // Kohandatud sisend – kui punkt ei ole 0,1,2
          const customDiv = document.createElement("div");
          customDiv.className = "customContainer";
          // Kui sisestatud punkt on juba määratud (ja pole 0,1,2), siis kuvatakse see; muidu kuvatakse "..."
          if (team.points[qNum - 1] !== null && [0,1,2].indexOf(team.points[qNum - 1]) === -1) {
            const customSpan = document.createElement("span");
            customSpan.textContent = team.points[qNum - 1];
            customDiv.appendChild(customSpan);
            const editBtn = document.createElement("button");
            editBtn.textContent = "Muuda";
            editBtn.style.fontSize = "0.6em";
            editBtn.addEventListener("click", function() {
              customDiv.innerHTML = "";
              const input = document.createElement("input");
              input.type = "text";
              input.style.width = "40px";
              input.style.fontSize = "0.7em";
              customDiv.appendChild(input);
              const okBtn = document.createElement("button");
              okBtn.textContent = "OK";
              okBtn.style.fontSize = "0.6em";
              okBtn.addEventListener("click", function() {
                let val = parseFloat(input.value.replace(',', '.'));
                if (!isNaN(val)) {
                  team.points[qNum - 1] = Math.round(val * 100) / 100;
                  renderPointsTable();
                  saveGameState();
                }
              });
              customDiv.appendChild(okBtn);
            });
            td.appendChild(customDiv);
          } else {
            // Kui veel pole sisestatud, kuvatakse "..." ja väikene LISA nupp
            const customSpan = document.createElement("span");
            customSpan.textContent = "...";
            customDiv.appendChild(customSpan);
            const addBtn = document.createElement("button");
            addBtn.textContent = "LISA";
            addBtn.style.fontSize = "0.6em";
            addBtn.style.backgroundColor = "green";
            addBtn.addEventListener("click", function() {
              customDiv.innerHTML = "";
              const input = document.createElement("input");
              input.type = "text";
              input.style.width = "40px";
              input.style.fontSize = "0.7em";
              customDiv.appendChild(input);
              const okBtn = document.createElement("button");
              okBtn.textContent = "OK";
              okBtn.style.fontSize = "0.6em";
              okBtn.addEventListener("click", function() {
                let val = parseFloat(input.value.replace(',', '.'));
                if (!isNaN(val)) {
                  team.points[qNum - 1] = Math.round(val * 100) / 100;
                  renderPointsTable();
                  saveGameState();
                }
              });
              customDiv.appendChild(okBtn);
            });
            customDiv.appendChild(addBtn);
            td.appendChild(customDiv);
          }
          row.appendChild(td);
          if (team.points[qNum - 1] !== null) { roundSum += team.points[qNum - 1]; }
        });
        if (gameState.numRounds > 1) {
          // Veerg "Vooru punktid" – round summa kuvatakse (taust kollane, stiil CSS-is)
          const tdRoundTotal = document.createElement("td");
          tdRoundTotal.textContent = roundSum;
          row.appendChild(tdRoundTotal);
        }
        const total = team.points.reduce((acc, val) => acc + (val || 0), 0);
        const tdTotal = document.createElement("td");
        tdTotal.textContent = total;
        tdTotal.style.fontWeight = "bold";
        tdTotal.style.fontSize = "1.2em";
        row.appendChild(tdTotal);
        table.appendChild(row);
      });
      pointsContentDiv.appendChild(table);
      
      // Allosas navinupud: kui mäng on voorudena, liigutakse voorude kaupa
      const prevBtn = document.createElement("button");
      if (gameState.numRounds > 1) {
        const currentRound = getCurrentRound();
        prevBtn.textContent = currentRound > 1 ? `← Voor ${toRoman(currentRound - 1)}` : "Eelmine voor";
        prevBtn.disabled = (currentRound === 1);
        prevBtn.addEventListener("click", function() {
          if (currentRound > 1) {
            const questionsPerRound = Math.floor(gameState.totalQuestions / gameState.numRounds);
            gameState.currentQuestion = (currentRound - 2) * questionsPerRound + 1;
            renderNavigation();
            renderPointsTable();
            saveGameState();
          }
        });
      } else {
        prevBtn.textContent = gameState.currentQuestion > 1 ? `← Küsimus ${gameState.currentQuestion - 1}` : "Eelmine";
        prevBtn.disabled = (gameState.currentQuestion === 1);
        prevBtn.addEventListener("click", function() {
          if (gameState.currentQuestion > 1) {
            gameState.currentQuestion--;
            renderNavigation();
            renderPointsTable();
            saveGameState();
          }
        });
      }
      navButtonsDiv.appendChild(prevBtn);
      
      const nextBtn = document.createElement("button");
      if (gameState.numRounds > 1) {
        const currentRound = getCurrentRound();
        const questionsPerRound = Math.floor(gameState.totalQuestions / gameState.numRounds);
        nextBtn.textContent = currentRound < gameState.numRounds ? `Voor ${toRoman(currentRound + 1)} →` : "Viimane voor";
        nextBtn.disabled = (currentRound === gameState.numRounds);
        nextBtn.addEventListener("click", function() {
          if (currentRound < gameState.numRounds) {
            gameState.currentQuestion = currentRound * questionsPerRound + 1;
            renderNavigation();
            renderPointsTable();
            saveGameState();
          }
        });
      } else {
        nextBtn.textContent = gameState.currentQuestion < gameState.totalQuestions ? `Küsimus ${gameState.currentQuestion + 1} →` : "Järgmine";
        nextBtn.disabled = (gameState.currentQuestion === gameState.totalQuestions);
        nextBtn.addEventListener("click", function() {
          if (gameState.currentQuestion < gameState.totalQuestions) {
            gameState.currentQuestion++;
            renderNavigation();
            renderPointsTable();
            saveGameState();
          }
        });
      }
      navButtonsDiv.appendChild(nextBtn);
    }
    
    // Tulemuste vaade
    btnShowResults.addEventListener("click", function() {
      showResults();
    });
    btnBackToPointsResults.addEventListener("click", function() {
      resultsView.style.display = "none";
      pointsView.style.display = "block";
    });
    
    // Tulemuste tabeli loomine:
    // Päises on "Koht", "Tiim", "Punktid" ja igale voorule üks veerg (klikkides toggletakse selle vooru küsimuste detailid)
    // Vahele ei kuvata vahetulemusi; detailid kuvatakse togglesena
    function showResults() {
      pointsView.style.display = "none";
      resultsView.style.display = "block";
      resultsTableHeadRow.innerHTML = "";
      resultsTableBody.innerHTML = "";
      
      let headers = ["Koht", "Tiim", "Punktid"];
      if (gameState.numRounds > 1) {
        for (let r = 1; r <= gameState.numRounds; r++) {
          headers.push(toRoman(r));
        }
      } else {
        for (let q = 1; q <= gameState.totalQuestions; q++) {
          headers.push(q.toString());
        }
      }
      headers.forEach((text, index) => {
        const th = document.createElement("th");
        th.textContent = text;
        // Kui tegemist on voorunumbritega, lisame klikkimise toggle jaoks
        if (gameState.numRounds > 1 && index >= 3) {
          let roundNum = index - 2;
          th.style.cursor = "pointer";
          th.addEventListener("click", function() {
            roundDetailsVisible[roundNum] = !roundDetailsVisible[roundNum];
            showResults();
          });
        }
        resultsTableHeadRow.appendChild(th);
      });
      
      // Arvutame meeskondade kogupunktid ja sorteerime
      let teamData = gameState.teams.map(team => {
        return {
          team: team,
          total: team.points.reduce((acc, val) => acc + (val || 0), 0)
        };
      });
      teamData.sort((a, b) => b.total - a.total);
      
      // Arvutame meeskondade koha – kui punktid on võrdsed, kuvatakse viigina (nt "2-3")
      let ranks = [];
      let i = 0;
      while(i < teamData.length) {
        let j = i;
        while(j < teamData.length && teamData[j].total === teamData[i].total) { j++; }
        let rankStr = (i+1) === j ? (i+1).toString() : `${i+1}-${j}`;
        for(let k = i; k < j; k++) { ranks[k] = rankStr; }
        i = j;
      }
      
      teamData.forEach((data, idx) => {
        const team = data.team;
        const tr = document.createElement("tr");
        const tdRank = document.createElement("td");
        tdRank.textContent = ranks[idx];
        tr.appendChild(tdRank);
        const tdName = document.createElement("td");
        tdName.innerHTML = `<strong>${team.name}</strong>`;
        tr.appendChild(tdName);
        const tdTotal = document.createElement("td");
        tdTotal.textContent = data.total;
        tdTotal.style.fontWeight = "bold";
        tdTotal.style.fontSize = "1.2em";
        tr.appendChild(tdTotal);
        // Kui mäng käib voorudena, lisame iga vooru jaoks tühja veeru (detailid kuvatakse togglesena)
        if (gameState.numRounds > 1) {
          for (let r = 1; r <= gameState.numRounds; r++) {
            const td = document.createElement("td");
            // Kui selle vooru detailid on toggletud, kuvatakse selle vooru küsimuste punktid
            if (roundDetailsVisible[r]) {
              const questionsPerRound = Math.floor(gameState.totalQuestions / gameState.numRounds);
              const startQ = (r - 1) * questionsPerRound;
              const endQ = (r === gameState.numRounds) ? gameState.totalQuestions : startQ + questionsPerRound;
              let detailText = "";
              for (let q = startQ; q < endQ; q++) {
                detailText += `Q${q+1}: ${team.points[q] !== null ? team.points[q] : "-"}  `;
              }
              td.textContent = detailText;
            }
            tr.appendChild(td);
          }
        } else {
          // Kui ei ole voorudena, kuvatakse iga küsimuse punktid
          team.points.forEach(val => {
            const td = document.createElement("td");
            td.textContent = (val !== null ? val : "");
            tr.appendChild(td);
          });
        }
        resultsTableBody.appendChild(tr);
        
        // Iga kolme meeskonna järel lisame horisontaalse lõikejoone (bold)
        if ((idx+1) % 3 === 0) {
          const hrTr = document.createElement("tr");
          const hrTd = document.createElement("td");
          hrTd.colSpan = headers.length;
          hrTd.className = "hrRow";
          hrTr.appendChild(hrTd);
          resultsTableBody.appendChild(hrTr);
        }
      });
    }
    
    // Abifunktsioon rooma numbrite jaoks
    function toRoman(num) {
      const roman = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
      return roman[num] || num;
    }
    
    // Salvesta mäng – nupp salvestab mängu andmed varasemate mängude nimekirja (funktsionaalsus simuleeritud)
    btnSaveGame.addEventListener("click", function() {
      alert("Mäng on salvestatud!");
      // Siin tuleks lisada andmete salvestamise loogika, et mängu nimi, tiimid ja tulemused salvestuksid varasemate mängude nimekirja.
    });
    
    populatePreviousData();
  });
  