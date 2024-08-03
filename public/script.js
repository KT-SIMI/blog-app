const menu = document.querySelector("#mobile-menu");
const menuLinks = document.querySelector(".navbar__menu");

menu.addEventListener("click", function () {
  menu.classList.toggle("is-active");
  menuLinks.classList.toggle("active");
});

function displayTab(tabId, linkId) {
  const tabs = document.querySelectorAll(".main");
  const links = document.querySelectorAll(".link")
  tabs.forEach((tab) => {
    tab.classList.remove("displayed");
  });

  links.forEach((link) => {
    link.classList.remove("active")
  })

  const selectedTab = document.getElementById(tabId);
  const selectedLink = document.getElementById(linkId)
  selectedTab.classList.add("displayed");
  selectedLink.classList.add("active")
}
