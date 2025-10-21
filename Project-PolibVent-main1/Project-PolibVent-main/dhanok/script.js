//menu active

const menuBar = document.querySelector(".menu-bar");
const menuNav = document.querySelector(".menu");

menuBar.addEventListener('click', () => {
    menuNav.classList.toggle('menu-active');
});

//scrolling active
const navBar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {
    console.log(window.scrollY);
    const windowPosition = window.scrollY > 0;
    navBar.classList.toggle("scrolling-active",windowPosition);
});

//Searching
function searchEvent() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const eventBoxes = document.querySelectorAll(".box-event .box");

  eventBoxes.forEach(box => {
    const title = box.querySelector("h3").textContent.toLowerCase();
    const description = box.querySelector("p").textContent.toLowerCase();

    if (title.includes(input) || description.includes(input)) {
      box.style.display = "block";
    } else {
      box.style.display = "none";
    }
  });
}
//Enter searching
document.getElementById("searchInput").addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    searchEvent();
  }
});
//Ketik Searching
document.getElementById("searchInput").addEventListener("input", searchEvent);

