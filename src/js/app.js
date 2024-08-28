import "../components/MyTrello/css/style.css";
import MyTrello from "../components/MyTrello/MyTrello";

document.addEventListener("DOMContentLoaded", () => {
  const parentNodeElem = document.querySelector(".Trello");

  if (parentNodeElem) {
    const myTrello = new MyTrello(parentNodeElem);
    myTrello.initDesck();
  }
});
