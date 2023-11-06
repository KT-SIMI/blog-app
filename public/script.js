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

function toggleCheck(clickedOption) {
  const currentContent = clickedOption.innerHTML;
  if (currentContent.includes("✅")) {
    clickedOption.innerHTML = currentContent.replace("✅", "");
  } else {
    clickedOption.innerHTML = `✅  ${currentContent}`;
  }
}

// function toggleCheck(clickedOption) {
//   const currentContent = clickedOption.innerHTML;
//   const inputName = "tags[]"; // Use "[]" to send an array of values

//   if (currentContent.includes("✅")) {
//       clickedOption.innerHTML = currentContent.replace("✅", "");
//       // Remove the corresponding input element
//       const inputElement = document.querySelector(`input[name="${inputName}"][value="${clickedOption.value}"]`);
//       if (inputElement) {
//           inputElement.remove();
//       }
//   } else {
//       clickedOption.innerHTML = `✅  ${currentContent}`;
//       // Create and append an input element for the selected option
//       const inputElement = document.createElement("input");
//       inputElement.type = "hidden"; // Hidden input
//       inputElement.name = inputName;
//       inputElement.value = clickedOption.value;
//       document.querySelector(".form").appendChild(inputElement);
//   }
// }

function toggleCheck(clickedOption) {
  const currentContent = clickedOption.innerHTML;

  if (currentContent.includes("✅")) {
    clickedOption.innerHTML = currentContent.replace("✅", "");
  } else {
    clickedOption.innerHTML = `✅  ${currentContent}`;
  }
}


// const blog = document.querySelectorAll(".blogs");

// blog.addEventListener('click', function(event) {
//   event.preventDefault()

//   const blogId = blog.getAttribute('blogId')
// })