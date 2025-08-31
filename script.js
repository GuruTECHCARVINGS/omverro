
    // Toggle profile menu visibility
    const profileBtn = document.getElementById("profileBtn");
    const profileMenu = document.getElementById("profileMenu");

    profileBtn.addEventListener("click", () => {
      const isExpanded = profileBtn.getAttribute("aria-expanded") === "true";
      profileBtn.setAttribute("aria-expanded", !isExpanded);
      profileMenu.classList.toggle("hidden");
    });

    // Close menu when clicking outside
    document.addEventListener("click", (event) => {
      if (
        !profileBtn.contains(event.target) &&
        !profileMenu.contains(event.target)
      ) {
        profileMenu.classList.add("hidden");
        profileBtn.setAttribute("aria-expanded", "false");
      }
    });

    // Keyboard accessibility for menu
    profileBtn.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        profileMenu.classList.add("hidden");
        profileBtn.setAttribute("aria-expanded", "false");
        profileBtn.focus();
      }
    });

    // Example functionality for each button
    document.getElementById("rfqInboxBtn").addEventListener("click", () => {
      alert("Navigating to RFQ Inbox: List of all open/closed RFQs");
    });

    document
      .getElementById("submittedQuotesBtn")
      .addEventListener("click", () => {
        alert("Navigating to Submitted Quotations: View submitted quotes");
      });

    document.getElementById("acceptedQuotesBtn").addEventListener("click", () => {
      alert("Navigating to Accepted Quotations: Optimalate quotations");
    });

    document
      .getElementById("quotationHistoryBtn")
      .addEventListener("click", () => {
        alert("Navigating to Quotation History: Review past quotations");
      });

    document.getElementById("emailCenterBtn").addEventListener("click", () => {
      alert("Navigating to Email Center: Send message to buyers");
    });

    document.getElementById("rejectedQuotesBtn").addEventListener("click", () => {
      alert("Navigating to Rejected Quotations: View declined quotes");
    });

    // Logout button example
    document.getElementById("logoutBtn").addEventListener("click", () => {
      alert("Logging out...");
      // Add logout logic here
    });
