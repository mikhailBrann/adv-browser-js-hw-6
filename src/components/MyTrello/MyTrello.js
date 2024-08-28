import descTemplate from "./template/descTemplate.html";
import columnTemplate from "./template/columnTemplate.html";
import taskTemplate from "./template/taskTemplate.html";

export default class MyTrello {
  constructor(parentElem) {
    this.draggedElem = undefined;
    this.cordinates = {
      x: 0,
      y: 0,
    };
    this.draggedElemСursorOffset = {
      x: 0,
      y: 0,
    };
    this.draggedElemWidth = false;
    this.parentElem = parentElem;
    this.parentElem.innerHTML = descTemplate;
    this.parentElem.addEventListener("mousedown", this._onMouseDown.bind(this));
    this.descState = {
      columns: [],
    };
  }

  safeData(data) {
    localStorage.setItem("descState", JSON.stringify(data));
  }

  loadData() {
    const data = localStorage.getItem("descState");

    if (data) {
      this.descState = JSON.parse(data);
    }
  }

  initDesck(columnsArr = ["TODO", "IN PROGRESS", "DONE"]) {
    const desc = this.parentElem.querySelector(".my-trello__content");
    const loadData = this.loadData();
    console.log(loadData);

    if (loadData) {
      this.descState.columns.forEach((column) => {
        const columnElem = this._createColumn(column.title, column.id);

        column.tasks.forEach((task) => {
          const createTask = this.generateTask(
            task.message,
            this._removeTask.bind(this),
            task.id,
          );

          columnElem.appendChild(createTask);
        });

        desc.appendChild(columnElem);
      });

      return;
    }

    for (let title of columnsArr) {
      if (desc) {
        desc.appendChild(this._createColumn(title));
      }
    }
  }

  _createColumn(
    columnTitle,
    columnId = `column-${performance.now()}`.replace(".", ""),
  ) {
    const column = document.createElement("div");
    column.innerHTML = columnTemplate
      .replace("{{title}}", columnTitle)
      .replace("{{columnId}}", columnId);

    const showBtn = column.querySelector(".my-trello__column-add-task-btn");

    if (showBtn) {
      showBtn.addEventListener(
        "click",
        (event) =>
          (event.currentTarget.closest(
            "[data-control-prop=add-task]",
          ).dataset.state = true),
      );
    }

    const form = column.querySelector(".my-trello__column-add-form-task");

    if (form) {
      form.addEventListener("submit", (event) =>
        this._createTask(event, this._removeTask.bind(this)),
      );
    }

    this.descState.columns.push({
      id: columnId,
      title: columnTitle,
      tasks: [],
    });

    this.safeData(this.descState);
    return column;
  }

  generateTask(
    formMessage,
    removeTaskCallback,
    taskId = `task-${performance.now()}`.replace(".", ""),
  ) {
    const task = document.createElement("div");

    task.classList.add("my-trello__task-container");
    task.dataset.taskId = taskId;
    task.insertAdjacentHTML(
      "beforeend",
      taskTemplate
        .replace("{{message}}", formMessage)
        .replace("{{taskId}}", taskId),
    );
    task
      .querySelector(".my-trello__task-remove")
      .addEventListener("click", removeTaskCallback);

    return task;
  }

  _createTask(event, removeTaskCallback) {
    event.preventDefault();
    const form = event.currentTarget;
    const formMessage = new FormData(form).get("taskMessage");
    const column = form
      .closest(".my-trello__column")
      .querySelector(".my-trello__column-content");
    const task = this.generateTask(formMessage, removeTaskCallback);
    const columnState = this.descState.columns.find(
      (col) => col.id === column.dataset.columnId,
    );

    column.append(task);
    columnState.tasks.push({
      id: task.dataset.taskId,
      message: formMessage,
    });

    this.safeData(this.descState);
    form.closest("[data-control-prop=add-task]").dataset.state = false;
    form.reset();
  }

  _removeTask(event) {
    event.preventDefault();
    const task = event.currentTarget.closest(".my-trello__task-container");
    const taskId = task.dataset.taskId;

    this.descState.columns.forEach((column) => {
      const taskIndex = column.tasks.findIndex((tsk) => tsk.id === taskId);

      if (taskIndex !== -1) {
        column.tasks.splice(taskIndex, 1);
      }
    });

    this.safeData(this.descState);
    task.remove();
  }

  _onMouseDown(event) {
    const target = event.target;

    if (target.classList.contains("my-trello__task-remove")) {
      return;
    }

    if (
      target.closest(".my-trello__task-container") ||
      target.classList.contains("my-trello__task-container")
    ) {
      event.preventDefault();

      this.draggedElem =
        target.closest(".my-trello__task-container") ??
        target.classList.contains("my-trello__task-container");

      //отлавливаем координаты по клику
      const rect = this.draggedElem.getBoundingClientRect();

      this.draggedElemСursorOffset = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      this.draggedElem.style.width = rect.width + "px";

      this.draggedElem.classList.add("dragged");

      this.parentElem.addEventListener(
        "mousemove",
        this._onMouseMove.bind(this),
      );
      this.parentElem.addEventListener("mouseup", this._onMouseUp.bind(this), {
        once: true,
      });
    }

    return;
  }

  _onMouseMove(event) {
    if (!this.draggedElem) {
      return;
    }
    this.cordinates = {
      x: event.clientX,
      y: event.clientY,
    };
    this.draggedElemСursorOffset;
    this.draggedElem.style.top =
      event.clientY - this.draggedElemСursorOffset.y + "px";
    this.draggedElem.style.left =
      event.clientX - this.draggedElemСursorOffset.x + "px";
  }

  _onMouseUp(event) {
    if (!this.draggedElem) {
      return;
    }

    const elementUnderCursor = document.elementFromPoint(
      this.cordinates.x,
      this.cordinates.y,
    );
    let flag = true;

    if (
      (flag &&
        elementUnderCursor.classList.contains("my-trello__task-container")) ||
      elementUnderCursor.closest(".my-trello__task-container")
    ) {
      const toHoverTask =
        elementUnderCursor.classList.contains("my-trello__task-container") !=
        false
          ? elementUnderCursor.classList.contains("my-trello__task-container")
          : elementUnderCursor.closest(".my-trello__task-container");
      const parent = toHoverTask.closest(".my-trello__column-content");

      parent.insertBefore(this.draggedElem, toHoverTask);
      flag = false;
    }

    if (flag && elementUnderCursor.classList.contains("my-trello__column")) {
      const parent = elementUnderCursor.querySelector(
        ".my-trello__column-content",
      );

      if (parent) {
        parent.appendChild(this.draggedElem);
        flag = false;
      }
    }

    if (!flag) {
      setTimeout(() => {
        const columns = Array.from(
          this.parentElem.querySelectorAll(".my-trello__column-content"),
        );

        columns.forEach((column) => {
          const columnState = this.descState.columns.find(
            (col) => col.id === column.dataset.columnId,
          );
          const tasks = Array.from(
            column.querySelectorAll(".my-trello__task-container"),
          );

          columnState.tasks = [];
          tasks.forEach((task) => {
            columnState.tasks.push({
              id: task.dataset.taskId,
              message: task.querySelector(".my-trello__task-message")
                .textContent,
            });
          });
        });
        this.safeData(this.descState);
      }, 0);
    }

    this.draggedElem.classList.remove("dragged");
    this.draggedElem.style = "";
    this.draggedElem = undefined;
    this.parentElem.removeEventListener(
      "mousemove",
      this._onMouseMove.bind(this),
    );
    this.parentElem.removeEventListener("mouseup", this._onMouseUp.bind(this));
  }
}
