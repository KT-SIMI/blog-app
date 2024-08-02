const menu = document.querySelector("#mobile-menu");
const menuLinks = document.querySelector(".navbar__menu");

menu.addEventListener("click", function () {
  menu.classList.toggle("is-active");
  menuLinks.classList.toggle("active");
});

function displayTab(tabId) {
  const tabs = document.querySelectorAll(".main");
  tabs.forEach((tab) => {
    tab.classList.remove("displayed");
  });

  const selectedTab = document.getElementById(tabId);
  selectedTab.classList.add("displayed");
}
