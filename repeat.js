// === Elements selection == //
const newTaskForm = document.getElementById("form");
const tbody = document.getElementById("tbody");
const searchEl = document.getElementById("search");
const filterEl = document.getElementById("filter");
const sortEl = document.getElementById("sort");
const bulkAction = document.getElementById("bulk_action");
const allSelect = document.getElementById("allSelect");
const dismiss = document.getElementById("dismiss");
const deleteBtn = document.getElementById("delete_btn");
const editSection = document.getElementById("edit_section");
const editBtn = document.getElementById("edit_btn");
const editForm = document.getElementById("edit_form");

// ##### Local Storage

// === get all tasks from local storage 1st step
function getAllTasksFromLocalStorage() {
  let tasks = [];
  const rowTasks = localStorage.getItem("tasks");
  if (rowTasks) {
    tasks = JSON.parse(rowTasks);
  }
  return tasks;
}

// === add tasks to local storage 3rd step
function addTasksToLocalStorage(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  updateUI();
}

// === add single task to local storage 2nd step
function addSingleTaskToLocalStorage(task) {
  const tasks = getAllTasksFromLocalStorage(); //1st step call
  tasks.push(task);
  addTasksToLocalStorage(tasks); //3rd step call
}

// === Utilities
function getUniqueID() {
  return Date.now() + Math.round(Math.random() * 8000).toString();
}

//#### handler function

// delete handler function
function deleteHandler(id) {
  const tasks = getAllTasksFromLocalStorage();
  const tasksAfterDeleting = tasks.filter(({ id: taskId }) => taskId !== id);
  addTasksToLocalStorage(tasksAfterDeleting);
  updateUI();
}

// status handler function
function statusHandler(id) {
  const tasks = getAllTasksFromLocalStorage();
  const tasksAfterChanging = tasks.map((task) => {
    if (task.id === id) {
      if (task.status === 0) {
        task.status = 1;
      } else {
        task.status = 0;
      }
    }
    return task;
  });
  addTasksToLocalStorage(tasksAfterChanging);
  updateUI();
}

// edit handler function
function editHandler(id) {
  const tasks = getAllTasksFromLocalStorage();
  const task = tasks.find((task) => task.id === id) || {};
  const { id: taskId, name, priority, status, date } = task;

  const taskTr = document.getElementById(id);

  // #### task name
  const taskNameTd = taskTr.querySelector(".taskName");
  const taskNameInp = document.createElement("input");
  taskNameInp.value = name;
  taskNameTd.innerHTML = "";
  taskNameTd.appendChild(taskNameInp);

  // #### priority
  const priorityTd = taskTr.querySelector(".priority");
  const priorityInp = document.querySelector("select");
  priorityInp.innerHTML = `<option ${
    priority === "high" ? "selected" : ""
  } value="high">High</option>
                            <option ${
                              priority === "medium" ? "selected" : ""
                            } value="medium">medium</option>
                            <option ${
                              priority === "low" ? "selected" : ""
                            } value="low">Low</option>`;
  priorityTd.innerHTML = "";
  priorityTd.appendChild(priorityInp);

  // #### status
  const statusTd = taskTr.querySelector(".status");
  const statusInp = document.createElement("select");
  statusInp.innerHTML = `<option ${
    status === 1 ? "selected" : ""
  } value ="1">completed</option>
                            <option ${
                              status === 0 ? "selected" : ""
                            } value ="0">Pending</option>`;
  statusTd.innerHTML = "";
  statusTd.appendChild(statusInp);

  // #### date
  const dateTd = taskTr.querySelector(".date");
  const dateInp = document.createElement("input");
  dateInp.type = "date";
  dateInp.value = date;
  dateTd.innerHTML = "";
  dateTd.appendChild(dateInp);

  // #### action
  const actionTd = taskTr.querySelector(".action");
  const saveBtn = document.createElement("button");
  saveBtn.addEventListener("click", () => {
    const name = taskNameInp.value;
    const priority = priorityInp.value;
    const date = dateInp.value;
    if (name && priority && date) {
      const newTask = {
        name,
        priority,
        date,
      };
      const taskAfterEditing = { ...task, ...newTask };
      const tasksAfterEditing = tasks.map((task) => {
        if (task.id === taskId) {
          return taskAfterEditing;
        }
        return task;
      });
      addTasksToLocalStorage(tasksAfterEditing);
      updateUI();
    } else {
      alert("Please fill up all the input");
    }
  });

  saveBtn.style.backgroundColor = "tomato";
  saveBtn.style.color = "white";
  saveBtn.style.padding = "4px";
  saveBtn.textContent = "save";
  actionTd.innerHTML = "";
  actionTd.appendChild(saveBtn);
}

// action handler function
function actionHandler(e) {
  const {
    target: { id: actionId, dataset: { id: taskId } = {} },
  } = e;
  if (actionId === "delete") {
    deleteHandler(taskId);
  } else if (actionId === "check") {
    statusHandler(taskId);
  } else if (actionId === "edit") {
    editHandler(taskId);
  }
}

// === new task creation
function newTaskFormHandler(e) {
  e.preventDefault();
  const id = getUniqueID();
  const tasks = {
    id,
    status: 0,
  };
  [...newTaskForm.elements].forEach((element) => {
    if (element.name) {
      tasks[element.name] = element.value;
    }
  });
  newTaskForm.reset();
  addSingleTaskToLocalStorage(tasks); // 2nd step call
  updateUI();
}

// UI Handler
// Create tr
function createTr({ name, priority, status, date, id }, index) {
  const formattedDate = new Date(date).toDateString();
  return `<tr id ='${id}'>
        <td>
            <input class="checkbox" data-id='${id}' data-checkId='${id}' type="checkbox"/>    
        </td>
        <td>${index + 1}</td>
        <td class="taskName">${name}</td>
        <td class="priority">${priority}</td>
        <td class="status">${status ? "Completed" : "Pending"}</td>
        <td class="date">${formattedDate}</td> 
        <td class="action">
            <button data-id="${id}" id="edit"><i class="fa-solid fa-pen"></i></button>
            <button data-id="${id}" id="check"><i class="fa-solid fa-check"></i></button>
            <button data-id="${id}" id="delete"><i class="fa-solid fa-trash"></i></button>
        </td> 
    </tr>`;
}

// initial state
function getInitialState() {
  return getAllTasksFromLocalStorage().reverse();
}
// Update UI
function updateUI(tasks = getInitialState()) {
  // const tasks = getAllTasksFromLocalStorage();
  const noTasksMessage = document.getElementById("noTasksMessage");
  if (tasks.length === 0) {
    noTasksMessage.style.display = "block";
  } else {
    noTasksMessage.style.display = "none";
  }

  const tasksHtmlArray = tasks.map((task, index) => {
    return createTr(task, index);
  });
  const taskLists = tasksHtmlArray.join("");
  tbody.innerHTML = taskLists;
  // || "<center>Nothing to show</center>";
}
updateUI();

// ==== search & filtering functionality
function handlingSearchWithTimer(searchText) {
  const tasks = getAllTasksFromLocalStorage();
  const searchedTasks = tasks.filter(({ name }) => {
    name = name.toLowerCase();
    searchText = searchText.toLowerCase();
    return name.includes(searchText);
  });
  updateUI(searchedTasks);
}
let timer;
function searchHandler(e) {
  const { value: searchText } = e.target;
  clearTimeout(timer);
  timer = setTimeout(() => handlingSearchWithTimer(searchText), 1000);
}

// filter handler
function filterAndRender(filterText) {
  const tasks = getAllTasksFromLocalStorage();
  let tasksAfterFiltering = tasks;
  switch (filterText) {
    case "all":
      tasksAfterFiltering = tasks;
      break;
    case "1":
      tasksAfterFiltering = tasks.filter((task) => task.status === 1);
      break;
    case "0":
      tasksAfterFiltering = tasks.filter((task) => task.status === 0);
      break;
    case "today":
      tasksAfterFiltering = tasks.filter((task) => {
        const today = new Date().toISOString().split("T")[0];
        return today === task.date;
      });
      break;
    case "high":
      tasksAfterFiltering = tasks.filter((task) => task.priority === "high");
      break;
    case "medium":
      tasksAfterFiltering = tasks.filter((task) => task.priority === "medium");
      break;
    case "low":
      tasksAfterFiltering = tasks.filter((task) => task.priority === "low");
      break;
    default:
      break;
  }
  updateUI(tasksAfterFiltering);
}

function filterHandler(e) {
  const filterText = e.target.value;
  filterAndRender(filterText);
}

// sort handler
function sortHandler(e) {
  const sortText = e.target.value;
  const tasks = getAllTasksFromLocalStorage();
  let tasksAfterFiltering = tasks.sort((taskA, taskB) => {
    const taskADate = new Date(taskA.date);
    const taskBDate = new Date(taskB.date);
    if (taskADate > taskBDate) {
      return sortText === "new" ? 1 : -1;
    } else if (taskADate > taskBDate) {
      return sortText === "new" ? -1 : 1;
    } else {
      return 0;
    }
  });
  updateUI(tasksAfterFiltering);
}

let selectedTasks = [];

function taskSelectionHandler(e) {
  const targetEl = e.target;
  if (targetEl.classList.contains("checkbox")) {
    const { id } = targetEl.dataset;
    if (targetEl.checked) {
      selectedTasks.push(id);
    } else {
      const selectedTaskIndex = selectedTasks.findIndex(
        (taskId) => taskId === id
      );
      if (selectedTaskIndex >= 0) {
        selectedTasks.splice(selectedTaskIndex, 1);
      }
    }
  }
  bulkActionToggler();
}

function bulkActionToggler() {
  selectedTasks.length
    ? (bulkAction.style.display = "flex")
    : (bulkAction.style.display = "none");

  const tasks = getAllTasksFromLocalStorage();
  if (tasks.length === selectedTasks.length && tasks.length > 0) {
    allSelect.checked = true;
  } else {
    allSelect.checked = false;
  }
}

function allSelectHandler(e) {
  if (e.target.checked) {
    const tasks = getAllTasksFromLocalStorage();
    selectedTasks = tasks.map((task) => task.id);
    selectedTasks.forEach((taskId) => {
      document.querySelector(`[data-checkId='${taskId}']`).checked = true;
    });
  } else {
    selectedTasks.forEach((taskId) => {
      document.querySelector(`[data-checkId='${taskId}']`).checked = false;
    });
    selectedTasks = [];
  }
  bulkActionToggler();
}

function dismissHandler() {
  selectedTasks.forEach((taskId) => {
    document.querySelector(`[data-checkId='${taskId}']`).checked = false;
  });
  selectedTasks = [];
  bulkActionToggler();
}

function deleteBtnHandler() {
  const isConfirm = confirm("Are you sure?😳");
  if (isConfirm) {
    const tasks = getAllTasksFromLocalStorage();
    const tasksAfterDeleting = tasks.filter((task) => {
      if (selectedTasks.includes(task.id)) return false;
      return true;
    });
    addTasksToLocalStorage(tasksAfterDeleting);
    updateUI(tasksAfterDeleting);
    bulkActionToggler();
    selectedTasks = [];
  }
}

function bulkEditAreaToggler() {
  editSection.style.display === "block"
    ? (editSection.style.display = "none")
    : (editSection.style.display = "block");
}

function bulkEditHandler() {
  bulkEditAreaToggler();
}

function bulkEditFormHandler(e) {
  e.preventDefault();
  const task = {};
  [...editForm.elements].forEach((element) => {
    if (element.name) {
      task[element.name] = element.value;
    }
  });
  editForm.reset();
  const tasks = getAllTasksFromLocalStorage();
  const modifiedTasks = tasks.map((selectedTask) => {
    if (selectedTasks.includes(selectedTask.id)) {
      selectedTask = { ...selectedTask, ...task };
    }
    return selectedTask;
  });
  addTasksToLocalStorage(modifiedTasks);
  updateUI(modifiedTasks);
  bulkEditAreaToggler();
}

// === event listeners
newTaskForm.addEventListener("submit", newTaskFormHandler);
tbody.addEventListener("click", actionHandler);
searchEl.addEventListener("input", searchHandler);
filterEl.addEventListener("input", filterHandler);
sortEl.addEventListener("input", sortHandler);
tbody.addEventListener("input", taskSelectionHandler);
allSelect.addEventListener("input", allSelectHandler);
dismiss.addEventListener("click", dismissHandler);
deleteBtn.addEventListener("click", deleteBtnHandler);
editBtn.addEventListener("click", bulkEditHandler);
editForm.addEventListener("submit", bulkEditFormHandler);

// let html = document.body.innerHTML;
// for (let x = 0; x < 8000; x++) {
//     html = document.body.innerHTML + x ;
// }
// document.body.innerHTML = html;
