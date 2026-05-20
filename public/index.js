const TIMER_START = 60; // seconds

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function setup() {
  // Shuffle card images
  const cards = $(".card").toArray();
  const shuffled = shuffle(cards);
  shuffled.forEach((card) => $("#game_grid").append(card));

  const TOTAL_PAIRS = $("#game_grid .card").length / 2;

  let firstCard = undefined;
  let secondCard = undefined;
  let clicks = 0;
  let timeLeft = TIMER_START;
  let timerInterval = undefined;
  let matchedPairs = 0;
  let matchStreak = 0;
  let powerUpReady = false;

  $("#hud").append(
    `<button id="power_up" style="display:none;">Reveal All</button>`,
  );

  $("#power_up").on("click", () => {
    if (!powerUpReady) return;
    powerUpReady = false;
    matchStreak = 0;
    $("#power_up").hide();

    $(".card").not(".matched").not(".flip").addClass("flip");

    setTimeout(() => {
      $(".card").not(".matched").removeClass("flip");
    }, 2000);
  });

  $("#hud").append(`
    
      <span id="click_count">Clicks: 0</span>
      <span id="timer">Time: ${TIMER_START}s</span>
      <span id="pairs_matched">Matched: 0</span>
    <span id="pairs_remaining">Remaining: ${TOTAL_PAIRS}</span>
  `);

  $("#game_grid").after(`<div id="message"></div>`);

  function startTimer() {
    timerInterval = setInterval(() => {
      timeLeft--;
      $("#timer").text(`Time: ${timeLeft}s`);
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        $(".card").off("click");
        $("#timer").text("Time: 0s");
        $("#message").text("You lose.");
      }
    }, 1000);
  }

  function updateClicks() {
    clicks++;
    $("#click_count").text(`Clicks: ${clicks}`);
  }

  function updatePairs() {
    $("#pairs_matched").text(`Matched: ${matchedPairs}`);
    $("#pairs_remaining").text(`Remaining: ${TOTAL_PAIRS - matchedPairs}`);
  }

  function handleClick() {
    $(this).toggleClass("flip");

    if (!firstCard) {
      if (!timerInterval) startTimer();
      updateClicks();
      firstCard = $(this).find(".front_face")[0];
    } else {
      if ($(this).find(".front_face")[0] === firstCard) {
        $(this).toggleClass("flip");
        return;
      }

      updateClicks();
      secondCard = $(this).find(".front_face")[0];
      $(".card").off("click");

      if (firstCard.src == secondCard.src) {
        $(`#${firstCard.id}`).parent().addClass("matched");
        $(`#${secondCard.id}`).parent().addClass("matched");
        firstCard = undefined;
        matchedPairs++;
        matchStreak++;
        updatePairs();

        if (matchStreak >= 3 && !powerUpReady) {
          powerUpReady = true;
          $("#power_up").show();
        }

        if (matchedPairs === TOTAL_PAIRS) {
          clearInterval(timerInterval);
          $("#message").text("You win!");
        } else {
          $(".card").not(".matched").on("click", handleClick);
        }
      } else {
        setTimeout(() => {
          matchStreak = 0;
          $(`#${firstCard.id}`).parent().toggleClass("flip");
          $(`#${secondCard.id}`).parent().toggleClass("flip");
          firstCard = undefined;
          $(".card").not(".matched").on("click", handleClick);
        }, 1000);
      }
    }
  }

  $(".card").on("click", handleClick);
}

$(document).ready(setup);
