var bgsfx = new Audio("/sfx/sfx.mp3");
document.addEventListener("DOMContentLoaded", function () {
  const overlay = document.getElementById("overlay");
  const chillButton = document.getElementById("chillButton");

  // Add click event listener to "Yes" button
  chillButton.addEventListener("click", function () {
    overlay.style.display = "none"; // Hide the overlay
    bgsfx.loop = true; // Enable looping
    bgsfx.muted = true; // Start muted for autoplay

    bgsfx
      .play()
      .then(() => {
        bgsfx.muted = false; // Unmute after playback starts
      })
      .catch((error) => {
        console.log("Autoplay blocked. Waiting for user interaction.");
      });
  });

  const tweetForm = document.getElementById("tweetCheck");
  const checkButton = document.getElementById("confessButton");
  const messageDiv = document.getElementById("message_tweet_check");
  checkButton.addEventListener("click", async function (event) {
    event.preventDefault(); // Prevent any default behavior (if any is attached)

    const tweetUrl = validateTweetUrl();
    if (!tweetUrl) {
      messageDiv.textContent = "Invalid or missing Tweet URL.";
      messageDiv.style.color = "red";
      return;
    }

    // API call to save the tweet URL
    try {
      const response = await fetch("/api/save-tweet-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tweet_url: tweetUrl }),
      });

      if (response.ok) {
        messageDiv.textContent = "Your Tweet is Chilled";
        messageDiv.style.color = "white";
      } else {
        messageDiv.textContent = "Failed to save the Tweet URL.";
        messageDiv.style.color = "red";
      }
    } catch (error) {
      console.error("Error saving Tweet URL:", error);
      messageDiv.textContent = "An error occurred. Please try again.";
      messageDiv.style.color = "red";
    }
    setTimeout(() => {
      messageDiv.textContent = "";
    }, 3000);
  });
  function validateTweetUrl() {
    const tweetUrlInput = document.getElementById("tweet_url_1").value.trim();
    if (!tweetUrlInput) {
      console.log("Please enter a Tweet URL.", "white");
      return null;
    }

    let tweetUrl = tweetUrlInput;
    if (!tweetUrl.startsWith("http://") && !tweetUrl.startsWith("https://")) {
      tweetUrl = "https://" + tweetUrl;
    }

    const match = tweetUrl.match(
      /^https?:\/\/x\.com\/([A-Za-z0-9_]+)\/status\/(\d+)$/
    );
    if (!match) {
      console.log("Invalid Tweet URL format.", "white");
      return null;
    }

    return tweetUrl;
  }
});
